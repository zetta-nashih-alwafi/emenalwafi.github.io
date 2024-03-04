import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { TMenu } from 'app/core/menu/menu.declaration';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UserService } from 'app/service/user/user.service';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import { BehaviorSubject, Observable, Subject, combineLatest, of } from 'rxjs';
import { debounceTime, filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import {
  TAvailableFavoriteMenu,
  THomePageBackgroundColour,
  THomePageBackgroundOption,
  THomePageConfig,
  THomePageConfigInput,
  THomePageWidget,
  TUpdateHomePageConfigurationParams,
} from './homepage.declaration';

@Injectable({
  providedIn: 'root',
})
export class HomepageService {
  private _auth = inject(AuthService);
  private _apollo = inject(Apollo);
  private _userService = inject(UserService);

  private _originalWidgetOrder: THomePageWidget[] = [
    { widget_name: 'email', size: 'half', icon: 'mail', iconType: 'mat', img: '/assets/img/widget-email.png' },
    { widget_name: 'pending_task', size: 'half', icon: 'inventory_2', iconType: 'mat', img: '/assets/img/widget-pending-task.png' },
    { widget_name: 'overdue_task', size: 'half', icon: 'inventory_2', iconType: 'mat', img: '/assets/img/widget-overdue-task.png' },
    { widget_name: 'news', size: 'half', icon: 'script-text-outline', iconType: 'svg', img: '/assets/img/widget-news.png' }
  ];
  private _availableBackgrounds: THomePageBackgroundOption[] = [
    { name: 'default', primary: '#363636', secondary: '#424242', tertiary: '#ffffff' },
    { name: 'retro', primary: '#6f61c0', secondary: '#a084e8', tertiary: '#d5ffe4' },
    { name: 'neon', primary: '#ccffbd', secondary: '#7eca9c', tertiary: '#1c1427' },
    { name: 'light', primary: '#f4f9f9', secondary: '#ccf2f4', tertiary: '#000000' },
    { name: 'dark', primary: '#27374d', secondary: '#526d82', tertiary: '#dde6ed' },
    { name: 'warm', primary: '#dd5353', secondary: '#b73e3e', tertiary: '#eddbc0' },
    { name: 'cold', primary: '#c4dfdf', secondary: '#d2e9e9', tertiary: '#000000' },
    { name: 'summer', primary: '#e1ffb1', secondary: '#c7f2a4', tertiary: '#234507' },
    { name: 'spring', primary: '#ffd4b2', secondary: '#fff6bd', tertiary: '#b95c47' },
    { name: 'happy', primary: '#1d5d9b', secondary: '#75c2f6', tertiary: '#000000' },
    { name: 'fall', primary: '#884a39', secondary: '#c38154', tertiary: '#f9e0bb' },
  ];

  private _applyingConfiguration = new BehaviorSubject<boolean>(true);
  private _availableWidgets = new BehaviorSubject(this._originalWidgetOrder.map((widget) => widget));
  private _displayedWidgets = new BehaviorSubject<THomePageWidget[]>([]);
  private _selectedBackground = new BehaviorSubject<THomePageBackgroundOption>({
    name: 'default',
    primary: '#363636',
    secondary: '#424242',
    tertiary: '#ffffff',
  });
  private _updateConfig = new Subject<TUpdateHomePageConfigurationParams>();

  get applyingConfiguration() {
    return this._applyingConfiguration.getValue();
  }
  availableBackgrounds$ = of(this._availableBackgrounds.map((background) => background));
  availableWidgets$ = this._availableWidgets.asObservable();
  displayedWidgets$ = this._displayedWidgets.asObservable();
  selectedBackground$ = this._selectedBackground.asObservable();
  updateConfig$ = this._updateConfig.asObservable();

  currentUser = this._auth.getLocalStorageUser();
  private _currentUserId = this.currentUser?._id;

  get userHomePageConfigId() {
    return this.currentUser?.homepage_configuration_id?._id;
  }

  /***************
   * Observable stream for user's homepage configuration.
   * @type {Observable<THomePageConfig>}
   */
  config$: Observable<THomePageConfig> = combineLatest([
    this._userService.reloadCurrentUser$.pipe(
      startWith(true),
      filter(Boolean),
      tap(() => this._resetWidgets()),
    ),
    this.updateConfig$.pipe(
      debounceTime(100),
      startWith({ _id: this.userHomePageConfigId, input: null }),
      tap(() => {
        this.currentUser = this._auth.getLocalStorageUser();
        this._currentUserId = this.currentUser?._id;
      }),
      switchMap((params) => {
        if ((!params?._id && !this.userHomePageConfigId) || !this.userHomePageConfigId) {
          return this._createUserHomePageConfig(this._currentUserId).pipe(
            tap((config) => {
              this._updateLocalUserProfile(config);
            }),
          );
        }

        if (params.input && params._id === this.userHomePageConfigId) {
          return this._updateUserHomePageConfig(params);
        }

        return this._getUserHomePageConfig(this.userHomePageConfigId);
      }),
      tap(() => {
        this._applyingConfiguration.next(true);
      }),
      tap((config) => {
        this._applyConfiguration(config);
      }),
      tap(() => {
        this._applyingConfiguration.next(false);
      }),
    ),
  ]).pipe(map(([_, config]) => config));

  /****************
   * Updates the local user profile with the new homepage configuration.
   * @param {THomePageConfig} config - New homepage configuration.
   * @private
   */
  private _updateLocalUserProfile(config: THomePageConfig) {
    const currentUser = this._auth.getLocalStorageUser();
    currentUser.homepage_configuration_id = {
      _id: config._id,
    };
    this._auth.setLocalUserProfile(currentUser);
  }

  /****************
   * Fragment definition for homepage configuration fields in GraphQL.
   * @type {DocumentNode}
   * @private
   */
  private get _homePageFieldsFragment() {
    return gql`
      fragment HomePageConfigurationFields on HomepageConfiguration {
        _id
        user_id {
          _id
        }
        homepage_widgets {
          widget_name
          size
        }
        favorite_menus
        background_colour {
          primary
          secondary
          tertiary
        }
        status
      }
    `;
  }

  /****************
   * Retrieves user's homepage configuration from the server.
   * @param {_id} - User's homepage configuration ID.
   * @returns {Observable<THomePageConfig>} - Observable stream of user's homepage configuration.
   * @private
   */
  private _getUserHomePageConfig(_id: string): Observable<THomePageConfig> {
    return this._apollo
      .query({
        query: gql`
          ${this._homePageFieldsFragment}
          query GetUserHomePageConfiguration($_id: ID!) {
            GetOneHomePageConfiguration(_id: $_id) {
              ...HomePageConfigurationFields
            }
          }
        `,
        variables: { _id },
        fetchPolicy: 'network-only',
      })
      .pipe(map((response) => response.data['GetOneHomePageConfiguration']));
  }

  /****************
   * Creates a new homepage configuration for the specified user ID.
   * @param {string} user_id - User ID for whom the homepage configuration is created.
   * @returns {Observable<THomePageConfig>} - Observable stream of the created homepage configuration.
   * @private
   */
  private _createUserHomePageConfig(user_id: string): Observable<THomePageConfig> {
    return this._apollo
      .mutate({
        mutation: gql`
          ${this._homePageFieldsFragment}
          mutation CreateHomePageConfiguration($user_id: ID!) {
            CreateHomePageConfiguration(input: { user_id: $user_id }) {
              ...HomePageConfigurationFields
            }
          }
        `,
        variables: { user_id },
        fetchPolicy: 'no-cache',
      })
      .pipe(map((response) => response.data['CreateHomePageConfiguration']));
  }

  /****************
   * Updates the homepage configuration for the specified ID with the provided input parameters.
   * @param {TUpdateHomePageConfigurationParams} params - Parameters containing the configuration ID and input.
   * @returns {Observable<THomePageConfig>} - Observable stream of the updated homepage configuration.
   * @private
   */
  private _updateUserHomePageConfig({ _id, input }: TUpdateHomePageConfigurationParams): Observable<THomePageConfig> {
    return this._apollo
      .mutate({
        mutation: gql`
          ${this._homePageFieldsFragment}
          mutation UpdateUpdateHomePageConfiguration(
            $_id: ID!
            $homepage_widgets: [HomepageWidgetInput]
            $background_colour: BackgroundColourInput
          ) {
            UpdateHomePageConfiguration(
              _id: $_id
              input: {
                homepage_widgets: $homepage_widgets,
                ${
                  Array.isArray(input?.favorite_menus)
                    ? 'favorite_menus: [' + input.favorite_menus.map((menu) => menu).join(',') + '],'
                    : ','
                }
                background_colour: $background_colour,
              }
            ) {
              ...HomePageConfigurationFields
            }
          }
        `,
        variables: {
          _id,
          homepage_widgets: input.homepage_widgets,
          background_colour: input.background_colour,
        },
        fetchPolicy: 'no-cache',
      })
      .pipe(map((response) => response.data['UpdateHomePageConfiguration']));
  }

  /****************
   * Resets widgets to the original order.
   * @private
   */
  private _resetWidgets() {
    this._availableWidgets.next(this._originalWidgetOrder.map((widget) => widget));
    this._displayedWidgets.next([]);
  }

  private _createBackgroundIdentifier(background: THomePageBackgroundColour): string {
    return background.primary + background.secondary + background.tertiary;
  }

  /****************
   * Applies the provided homepage configuration.
   * @param {THomePageConfig} config - Homepage configuration to apply.
   * @private
   */
  private _applyConfiguration(config: THomePageConfig) {
    if (config?.background_colour) {
      const previouslySelectedBackground = this._selectedBackground.getValue();
      if (this._createBackgroundIdentifier(previouslySelectedBackground) !== this._createBackgroundIdentifier(config.background_colour)) {
        const selectedBackground = this._availableBackgrounds.find(
          (background) => this._createBackgroundIdentifier(background) === this._createBackgroundIdentifier(config.background_colour),
        );
        if (selectedBackground) {
          this.setBackground(selectedBackground);
        } else if (config.background_colour.primary && config.background_colour.secondary && config.background_colour.tertiary) {
          this.setBackground({
            name: 'custom',
            ...config.background_colour,
          });
        }
      }
    }

    if (Array.isArray(config?.homepage_widgets) && config.homepage_widgets.length) {
      const previouslyDisplayedWidgets = this._displayedWidgets.getValue();
      const displayedWidgetsAreEqual = _.isEqual(
        config.homepage_widgets.map((widget) => widget.widget_name + widget.size),
        previouslyDisplayedWidgets.map((widget) => widget.widget_name + widget.size),
      );
      if (!displayedWidgetsAreEqual) {
        const intersectingWidgets = _.intersectionBy(
          config?.homepage_widgets,
          this._availableWidgets.getValue(),
          'widget_name',
        ) as THomePageWidget[];
        if (Array.isArray(intersectingWidgets)) {
          intersectingWidgets.forEach((widget, currentIndex) => {
            this.displayWidget(widget.widget_name, currentIndex, widget);
          });
        }
      }
    }
  }

  /****************
   * Creates a payload for the favorite menu configuration.
   * @param {TMenu[]} favoriteMenu - Favorite menu items.
   * @returns {THomePageConfigInput['favorite_menus']} - Payload for favorite menus.
   */
  createFavoriteMenuPayload(favoriteMenu: TMenu[]): THomePageConfigInput['favorite_menus'] {
    return favoriteMenu.map((menu) => menu.id as TAvailableFavoriteMenu);
  }

  /**
   * Creates a payload for the displayed widgets configuration.
   *
   * @param {THomePageWidget[]} displayedWidgets - Array of displayed widgets.
   * @returns {THomePageConfigInput['homepage_widgets']} - Payload for displayed widgets.
   */
  createDisplayedWidgetPayload(displayedWidgets: THomePageWidget[]): THomePageConfigInput['homepage_widgets'] {
    return displayedWidgets.map((widget) => ({
      widget_name: widget.widget_name,
      size: widget.size,
    }));
  }

  /**
   * Creates a payload for the selected background configuration.
   *
   * @param {THomePageBackground} selectedBackground - Selected background configuration.
   * @returns {THomePageConfigInput['background_colour']} - Payload for the selected background.
   */
  createSelectedBackgroundPayload(selectedBackground: Partial<THomePageBackgroundColour>): THomePageConfigInput['background_colour'] {
    const currentlySelectedBackground = this._selectedBackground.getValue();
    return {
      primary: selectedBackground?.primary || currentlySelectedBackground?.primary,
      secondary: selectedBackground?.secondary || currentlySelectedBackground?.secondary,
      tertiary: selectedBackground?.tertiary || currentlySelectedBackground?.tertiary,
    };
  }

  /****************
   * Triggers a manual update for homepage widgets.
   */
  triggerWidgetUpdateManually() {
    const params: TUpdateHomePageConfigurationParams = {
      _id: this.userHomePageConfigId,
      input: {
        background_colour: this.createSelectedBackgroundPayload(this._selectedBackground.getValue()),
        homepage_widgets: this.createDisplayedWidgetPayload(this._displayedWidgets.getValue()),
      },
    };
    this._updateConfig.next(params);
  }

  /****************
   * Updates homepage configuration with the provided input.
   * @param {THomePageConfigInput} configurationInput - New configuration input.
   */
  updateConfiguration(configurationInput: THomePageConfigInput) {
    const params: TUpdateHomePageConfigurationParams = {
      _id: this.userHomePageConfigId,
      input: configurationInput,
    };
    this._updateConfig.next(params);
  }

  /****************
   * Sets the selected background for the homepage.
   * @param {THomePageBackground} selectedBackground - Selected background configuration.
   */
  setBackground(selectedBackground: THomePageBackgroundOption) {
    this._selectedBackground.next(selectedBackground);
  }

  findDefaultTheme(): THomePageBackgroundOption {
    return this._availableBackgrounds.find((background) => background.name === 'default');
  }

  findThemeByNameOrReturnDefault(name: string): THomePageBackgroundOption {
    return (
      this._availableBackgrounds.find((background) => background.name === name) ||
      this._availableBackgrounds.find((background) => background.name === 'default')
    );
  }

  findThemeByColorConfig(colorConfig: THomePageBackgroundColour): THomePageBackgroundOption | undefined {
    return this._availableBackgrounds.find(
      (background) => this._createBackgroundIdentifier(background) === this._createBackgroundIdentifier(colorConfig),
    );
  }

  /****************
   * Removes a widget from the displayed widgets.
   * @param {string} name - Name of the widget to remove.
   */
  removeWidget(name: string) {
    const availableWidgets = this._availableWidgets.getValue();
    const displayedWidgets = this._displayedWidgets.getValue();

    const targetIndex = this._originalWidgetOrder.findIndex((widget) => widget.widget_name === name);
    const idx = displayedWidgets.findIndex((widget) => widget.widget_name === name);

    if (targetIndex < 0) {
      throw new Error("Widget can't be found in the original list of widgets");
    }

    if (idx < 0) {
      throw new Error("Widget can't be found in the displayed widgets");
    }

    transferArrayItem(displayedWidgets, availableWidgets, idx, targetIndex);

    const newIndex = availableWidgets.findIndex((widget) => widget.widget_name === name);
    if (newIndex >= 0) {
      availableWidgets[newIndex].size = 'half';
    }

    this._availableWidgets.next(availableWidgets);
    this._displayedWidgets.next(displayedWidgets);
  }

  /****************
   * Displays a widget at the specified target index.
   * @param {string} name - Name of the widget to display.
   * @param {number} targetIndex - Target index for the displayed widget.
   * @param {THomePageWidget} modifyWidget - Modified widget details.
   */
  displayWidget(name: string, targetIndex: number = 0, modifyWidget?: THomePageWidget) {
    const availableWidgets = this._availableWidgets.getValue();
    const displayedWidgets = this._displayedWidgets.getValue();

    const idx = availableWidgets.findIndex((widget) => widget.widget_name === name);

    if (idx < 0) {
      throw new Error("Widget can't be found");
    }

    transferArrayItem(availableWidgets, displayedWidgets, idx, targetIndex);

    if (modifyWidget) {
      const newIndex = displayedWidgets.findIndex((widget) => widget.widget_name === name);
      if (newIndex >= 0) {
        displayedWidgets[newIndex] = {
          ...displayedWidgets[newIndex],
          ...modifyWidget,
        };
      }
    }

    this._availableWidgets.next(availableWidgets);
    this._displayedWidgets.next(displayedWidgets);
  }

  /****************
   * Moves a widget to the specified target index.
   * @param {string} name - Name of the widget to move.
   * @param {number} targetIndex - Target index for the moved widget.
   * @param {THomePageWidget} modifyWidget - Modified widget details.
   */
  moveWidget(name: string, targetIndex: number = 0, modifyWidget?: THomePageWidget) {
    const displayedWidgets = this._displayedWidgets.getValue();

    const idx = displayedWidgets.findIndex((widget) => widget.widget_name === name);

    if (idx < 0) {
      throw new Error("Widget can't be found");
    }

    moveItemInArray(displayedWidgets, idx, targetIndex);

    if (modifyWidget) {
      const newIndex = displayedWidgets.findIndex((widget) => widget.widget_name === name);
      if (newIndex >= 0) {
        displayedWidgets[newIndex] = {
          ...displayedWidgets[newIndex],
          ...modifyWidget,
        };
      }
    }

    this._displayedWidgets.next(displayedWidgets);
  }

  /****************
   * Retrieves summary item counts for widgets.
   * @returns {Observable<{ overdue_task_count: number, pending_task_count: number, unread_mail_count: number }>} - Observable stream of summary item counts.
   */
  getSummaryItemCounts(
    userId: string,
    userTypeId: string,
  ): Observable<{ overdue_task_count: number; pending_task_count: number; unread_mail_count: number }> {
    return this._apollo
      .query<{
        OverdueTaskCount: { count_document: number }[];
        PendingTaskCount: { count_document: number }[];
        UnreadMailCount: { count_document: number }[];
      }>({
        query: gql`
          query GetHomePageSummaryItemCounts($user_id: ID!, $user_type_id: ID!) {
            UnreadMailCount: GetAllMails(new_mail: true, type: inbox, pagination: { limit: 1, page: 0 }, user_id: $user_id) {
              count_document
            }
            PendingTaskCount: GetAllTasks(
              filter: { is_not_parent_task: true, task_status: todo, pending_due_date: true }
              pagination: { limit: 1, page: 0 }
              user_login_type: $user_type_id
            ) {
              count_document
            }
            OverdueTaskCount: GetAllTasks(
              filter: { is_not_parent_task: true, task_status: todo, over_due_date: true }
              pagination: { limit: 1, page: 0 }
              user_login_type: $user_type_id
            ) {
              count_document
            }
          }
        `,
        variables: {
          user_id: userId,
          user_type_id: userTypeId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((counts) => ({
          overdue_task_count: counts.data?.OverdueTaskCount?.[0]?.count_document || 0,
          pending_task_count: counts.data?.PendingTaskCount?.[0]?.count_document || 0,
          unread_mail_count: counts.data?.UnreadMailCount?.[0]?.count_document || 0,
        })),
      );
  }
}
