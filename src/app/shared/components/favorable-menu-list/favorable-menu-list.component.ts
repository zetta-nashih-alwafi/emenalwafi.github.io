import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TMenu } from 'app/core/menu/menu.declaration';
import { MenuService } from 'app/core/menu/menu.service';
import { TAvailableFavoriteMenu } from 'app/homepage/homepage.declaration';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UserService } from 'app/service/user/user.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { TExpandableMenu } from './favorable-menu-list.component.model';
import { SubSink } from 'subsink';
import { menus } from 'app/core/menu/menu.declaration';

@Component({
  selector: 'ms-favorable-menu-list',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatTooltipModule,
    TranslateModule,
    RouterModule,
  ],
  templateUrl: './favorable-menu-list.component.html',
  styleUrls: ['./favorable-menu-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavorableMenuListComponent implements OnInit, OnDestroy {
  private _authService = inject(AuthService);
  private _menuService = inject(MenuService);
  private _userService = inject(UserService);
  private _utils = inject(UtilityService);
  private _destroy$ = new Subject<void>();
  private subs = new SubSink();
  activeMenu: any;

  currentUserName$ = this._userService.reloadCurrentUser$.pipe(
    map(() => {
      const currentUser = this._authService.getLocalStorageUser()
      return this._utils.constructUserName(currentUser, ['civ', 'last', 'first']);
    })
  )
  menu$: Observable<{
    available: TExpandableMenu[],
    favorites: TExpandableMenu[],
  }> = this._menuService.menu$.pipe(
    map(menu => {
      return {
        available: this._addExpandedPropertyToMenu(menu.available),
        favorites: this._addExpandedPropertyToMenu(menu.favorites),
      }
    })
  )

  constructor(
    private router: Router
  ) {}

  private _addExpandedPropertyToMenu(menu: TMenu[]): TExpandableMenu[] {
    return menu.map((item) => ({
      ...item,
      expanded: false,
    }));
  }

  ngOnInit(): void {
    this.setRouterLinkActive()
    this.subs.sink = this.router.events
    .pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.setRouterLinkActive()
    })
  }

  setRouterLinkActive() {
    const menuRoute = this.router.url?.length ? this.router.url?.slice(1)?.split(/[:/?#[\]@!$&'()*+,;=]/g)[0] : '';
    this.activeMenu = menus?.find((menu) => menu?.children?.find((child) => {
      const splittedChildPath = child?.path?.split('/')
      if (splittedChildPath?.length > 1) {
        return splittedChildPath[0] === menuRoute
      } else {
        return child?.path === menuRoute
      }
    }))
    
  }

  ngOnDestroy(): void {
    this._destroy$.next()
    this._destroy$.complete()
  }

  // TODO: Handle close parent menu when click one parent menu and click another parent menu
  toggleMenuExpansion(menu: TExpandableMenu) {
    menu.expanded = !menu.expanded;
  }

  markMenuAsFavorite(identifier: TAvailableFavoriteMenu, favoriteMenu: TMenu[]) {
    this._menuService.markMenuAsFavorite(identifier, favoriteMenu);
  }
  markMenuAsNotFavorite(identifier: TAvailableFavoriteMenu, favoriteMenu: TMenu[]) {
    this._menuService.markMenuAsNotFavorite(identifier, favoriteMenu);
  }
}
