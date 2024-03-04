import { CdkDrag, CdkDragDrop, CdkDragEnter, CdkDragStart, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CoreService } from 'app/service/core/core.service';
import { UserService } from 'app/service/user/user.service';
import { UtilityService } from 'app/service/utility/utility.service';
import * as moment from 'moment';
import { BehaviorSubject, EMPTY, Subject, combineLatest, interval, merge } from 'rxjs';
import { debounceTime, filter, map, skipWhile, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { BaseHomepageWidgetComponent } from './homepage-widgets/base-homepage-widget/base-homepage-widget.component';
import { MailboxHomepageWidgetComponent } from './homepage-widgets/mailbox-homepage-widget/mailbox-homepage-widget.component';
import { OverdueTaskHomepageWidgetComponent } from './homepage-widgets/overdue-task-homepage-widget/overdue-task-homepage-widget.component';
import { PendingTaskHomepageWidgetComponent } from './homepage-widgets/pending-task-homepage-widget/pending-task-homepage-widget.component';
import { THomePageBackgroundOption, THomePageWidget } from './homepage.declaration';
import { HomepageService } from './homepage.service';
import { MatGridListModule } from '@angular/material/grid-list';
import { NewsHomepageWidgetComponent } from './homepage-widgets/news-homepage-widget/news-homepage-widget.component';

@Component({
  selector: 'ms-homepage',
  standalone: true,
  imports: [
    BaseHomepageWidgetComponent,
    CommonModule,
    DragDropModule,
    MailboxHomepageWidgetComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatGridListModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatTooltipModule,
    OverdueTaskHomepageWidgetComponent,
    PendingTaskHomepageWidgetComponent,
    NewsHomepageWidgetComponent,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroy$ = new Subject<void>();

  private _auth = inject(AuthService);
  private _core = inject(CoreService);
  private _fb = inject(FormBuilder);
  private _homepageService = inject(HomepageService);
  private _translate = inject(TranslateService);
  private _userService = inject(UserService);
  private _utils = inject(UtilityService);
  private _pageTitleService = inject(PageTitleService);

  private _updateWidget = new Subject();
  private _customizationSidebarOpen = new BehaviorSubject(false);
  private _loading = new BehaviorSubject(true);

  readonly backgroundNameFormControl = this._fb.nonNullable.control('default');
  readonly backgroundHexFormGroup = this._fb.nonNullable.group({
    primary: this._fb.nonNullable.control(''),
    secondary: this._fb.nonNullable.control(''),
    tertiary: this._fb.nonNullable.control(''),
  });

  @ViewChildren(CdkDropList) dropsQuery: QueryList<CdkDropList>;
  @ViewChild('customizationSidebar') customizationSidebar: ElementRef;
  @ViewChild('buttonDragAndDrop') buttonDragAndDrop: ElementRef;
  @ViewChild('buttonCustomizationSidebar') buttonCustomizationSidebar: ElementRef;
  @ViewChild('selectTheme') selectTheme: ElementRef;

  drops: CdkDropList[];
  dragging: boolean = false;

  availableBackgrounds$ = this._homepageService.availableBackgrounds$;
  availableWidgets$ = this._homepageService.availableWidgets$;
  loading$ = this._loading.asObservable().pipe(debounceTime(100));
  displayedWidgets$ = this._homepageService.displayedWidgets$;
  customizationSidebarOpen$ = this._customizationSidebarOpen.asObservable();
  summaries$ = combineLatest([
    this._userService.reloadCurrentUser$.pipe(startWith(true), filter(Boolean)),
    this._translate.onLangChange.pipe(startWith(EMPTY)),
  ]).pipe(
    tap(() => {
      this._loading.next(true);
      this._setPageTitle();
    }),
    switchMap(() => {
      const currentUser = this._auth.getLocalStorageUser();
      const userId = currentUser?._id;
      const userTypeId = currentUser?.entities?.find((resp) => resp?.type?.name === this._auth.getPermission()[0])?.type?._id;
      return this._homepageService.getSummaryItemCounts(userId, userTypeId);
    }),
    tap(() => {
      this._loading.next(false);
    }),
    map(({ overdue_task_count, pending_task_count, unread_mail_count }) => [
      {
        icon: 'mail',
        iconType: 'mat',
        label: `${unread_mail_count} ${this._translate.instant('HomepageEmail')}`,
      },
      {
        icon: 'inventory_2',
        iconType: 'mat',
        label: `${pending_task_count} ${this._translate.instant('Pending Task')}`,
      },
      {
        icon: 'inventory_2',
        iconType: 'mat',
        label: `${overdue_task_count} ${this._translate.instant('Task Overdue')}`,
      },
    ]),
    takeUntil(this._destroy$),
  );

  displayDragAndDropText$ = combineLatest([this.customizationSidebarOpen$, this.availableWidgets$, this.displayedWidgets$]).pipe(
    map(([sidebarOpen, availableWIdgets, displayedWidgets]) => (sidebarOpen && availableWIdgets?.length) || !displayedWidgets?.length),
  );
  headline$ = this._translate.onLangChange.pipe(
    map((event) => event.lang),
    startWith(localStorage.getItem('currentLang')),
    map((lang) => moment().locale(lang).format('dddd, DD MMMM YYYY')),
    takeUntil(this._destroy$),
  );
  greeting$ = merge(this._userService.reloadCurrentUser$, this._translate.onLangChange, interval(1000 * 60)).pipe(
    startWith(0),
    map(() => {
      const hour = moment().get('hour');
      const greetingText =
        hour >= 0 && hour < 12
          ? this._translate.instant('Good Morning')
          : hour >= 12 && hour < 18
          ? this._translate.instant('Good Afternoon')
          : this._translate.instant('Good Evening');
      const currentUser = this._auth.getLocalStorageUser();

      return [greetingText, this._utils.constructUserName(currentUser, ['first'])].join(', ');
    }),
    takeUntil(this._destroy$),
  );

  private _setPageTitle() {
    const name = 'ERP_072.Home Page';
    this._pageTitleService.setTitle(name);
  }

  ngOnInit(): void {
    this._homepageService.config$
      .pipe(
        tap((config) => {
          if (!config.background_colour.primary || !config.background_colour.secondary || !config.background_colour.tertiary) {
            const theme = this._homepageService.findDefaultTheme();
            this.backgroundNameFormControl.patchValue(theme.name);
            this.backgroundHexFormGroup.patchValue(theme);
            this._core.setAppThemeColors(theme);
          } else {
            const theme = this._homepageService.findThemeByColorConfig(config.background_colour);
            if (theme) {
              this.backgroundNameFormControl.patchValue(theme.name);
            } else {
              this.backgroundNameFormControl.patchValue('custom');
            }
            this.backgroundHexFormGroup.patchValue(config.background_colour);
            this._core.setAppThemeColors(config.background_colour);
          }
        }),
        take(1),
        takeUntil(this._destroy$),
      )
      .subscribe();
    this.backgroundNameFormControl.valueChanges
      .pipe(
        tap((name) => {
          if (name !== 'custom') {
            const theme = this._homepageService.findThemeByNameOrReturnDefault(name);
            this.backgroundHexFormGroup.patchValue(theme);
          }
        }),
        takeUntil(this._destroy$),
      )
      .subscribe();
    this.backgroundHexFormGroup.valueChanges
      .pipe(
        tap((colorConfig) => {
          const existingTheme = this._homepageService.findThemeByColorConfig(this.backgroundHexFormGroup.getRawValue());
          if (!existingTheme) {
            this.backgroundNameFormControl.setValue('custom');
          }
          this._core.setAppThemeColors(colorConfig);
          this._homepageService.updateConfiguration({
            background_colour: this._homepageService.createSelectedBackgroundPayload(colorConfig),
          });
        }),
        takeUntil(this._destroy$),
      )
      .subscribe();
    this._updateWidget
      .asObservable()
      .pipe(
        skipWhile(() => this._homepageService.applyingConfiguration),
        tap(() => {
          this._homepageService.triggerWidgetUpdateManually();
        }),
        takeUntil(this._destroy$),
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    this.dropsQuery.changes.pipe(startWith(this.dropsQuery), takeUntil(this._destroy$)).subscribe(() => {
      this.drops = this.dropsQuery.toArray();
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._pageTitleService.setTitle('');
  }

  openCustomizationSidebar() {
    this._customizationSidebarOpen.next(true);
  }

  closeCustomizationSidebar() {
    this._customizationSidebarOpen.next(false);
  }

  toggleCustomizationSidebar() {
    this._customizationSidebarOpen.next(!this._customizationSidebarOpen.getValue());
  }

  selectBackground(event: Event ,background: THomePageBackgroundOption) {
    this._homepageService.setBackground(background);
    event.stopPropagation();
  }

  removedTileContentParentElement: HTMLDivElement
  removedTileContentElement: HTMLDivElement

  private _restoreRemovedTileContentElement() {
    if (this.removedTileContentElement && this.removedTileContentParentElement) {
      this.removedTileContentParentElement.appendChild(this.removedTileContentElement)
    }
  }

  widgetEntered(event: CdkDragEnter) {
    const drag = event.item;
    const drop = event.container;

    if (drag.dropContainer.element.nativeElement === drop.element.nativeElement) {
      const dragPlaceholderElement = drag.dropContainer.element.nativeElement.parentElement.querySelector('.cdk-drag-placeholder')
      drag.dropContainer.element.nativeElement.removeChild(dragPlaceholderElement)
      drag.dropContainer.element.nativeElement.querySelector('.mat-grid-tile-content').appendChild(dragPlaceholderElement)
      return
    }

    this.removedTileContentElement = drop.element.nativeElement.querySelector('.widget-item') as HTMLDivElement
    this.removedTileContentParentElement = this.removedTileContentElement.parentElement as HTMLDivElement
    this.removedTileContentParentElement.removeChild(this.removedTileContentElement)

    if (this.removedTileContentElement.classList.contains('drop-placeholder')) {
      const dragPlaceholderElement = drop.element.nativeElement.parentElement.querySelector('.cdk-drag-placeholder')
      drop.element.nativeElement.removeChild(dragPlaceholderElement)
      drop.element.nativeElement.querySelector('.mat-grid-tile-content').appendChild(dragPlaceholderElement)
    }
  }

  widgetExited() {
    this._restoreRemovedTileContentElement()
  }

  widgetDropped(event: CdkDragDrop<THomePageWidget[]>, targetIndex: number) {
    this._restoreRemovedTileContentElement()

    if (!event.item.data?.widget_name) {
      return;
    }

    const sameContainer =
      event.container.element.nativeElement.parentElement.parentElement ===
      event.previousContainer.element.nativeElement.parentElement.parentElement;

    if (sameContainer) {
      this._homepageService.moveWidget(event.item.data.widget_name, typeof targetIndex === 'number' ? targetIndex : event.currentIndex);
    } else {
      this._homepageService.displayWidget(event.item.data.widget_name, typeof targetIndex === 'number' ? targetIndex : event.currentIndex);
    }

    this._updateWidget.next();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (this._customizationSidebarOpen.value) {
      if (
        this.customizationSidebar?.nativeElement?.contains(event.target) || 
        this.buttonDragAndDrop?.nativeElement?.contains(event.target) ||
        this.buttonCustomizationSidebar?.nativeElement?.contains(event.target)
      ) {
        return;
      }
      this.closeCustomizationSidebar();
    }
  }

  onDragStarted(): void {
    this.closeCustomizationSidebar();
  }

  selectCustomOption(event: Event): void {
    event.stopPropagation();
  }
}
