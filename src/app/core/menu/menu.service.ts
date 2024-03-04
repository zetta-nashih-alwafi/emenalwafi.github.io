import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TMenu } from './menu.declaration';
import { menus } from './menu.declaration';
import { transferArrayItem } from '@angular/cdk/drag-drop';
import { PermissionService } from 'app/service/permission/permission.service';
import { TAvailableFavoriteMenu, THomePageConfig } from 'app/homepage/homepage.declaration';
import { HomepageService } from 'app/homepage/homepage.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private _originalMenu: TMenu[];

  private _homepageService = inject(HomepageService);

  menu$: Observable<{ available: TMenu[]; favorites: TMenu[] }> = this._homepageService.config$.pipe(
    map((config) => {
      this._originalMenu = this._filterMenuBasedOnPermission(menus);
      const available = this._originalMenu.map((menu) => menu);
      const currentUser = JSON.parse(localStorage.getItem('userProfile'));
      const favorites = [];
      // *************** Adding conditional if currentuser login is same as homepageid on menu then repopulate favorite menu
      if (currentUser?.homepage_configuration_id?._id === config?._id) {
        if (Array.isArray(config.favorite_menus)) {
          config.favorite_menus.map((menuIdentifier, targetIndex) => {
            const currentIndex = available.findIndex((menu) => menu.id === menuIdentifier);
            if (currentIndex < 0) {
              throw new Error("Menu can't be found in the original list of available menu");
            } else {
              transferArrayItem(available, favorites, currentIndex, targetIndex);
            }
          });
        }
      }
      return { available, favorites };
    }),
  );

  constructor(private _permission: PermissionService) {
    this._originalMenu = this._filterMenuBasedOnPermission(menus);
  }

  private _filterMenuBasedOnPermission(menus: TMenu[]) {
    return menus
      .filter((menu) => !menu.permission || this._permission.showMenu(menu.permission))
      .map((menu) => {
        return menu.children
          ? {
              ...menu,
              children: menu.children.filter((subMenu) => this._permission.showMenu(subMenu.permission)),
            }
          : menu;
      });
  }

  markMenuAsFavorite(menuIdentifier: TAvailableFavoriteMenu, favoriteMenu: TMenu[]) {
    this._homepageService.updateConfiguration({
      favorite_menus: [menuIdentifier, ...favoriteMenu.map((menu) => menu.id)],
    });
  }

  markMenuAsNotFavorite(menuIdentifier: string, favoriteMenu: TMenu[]) {
    this._homepageService.updateConfiguration({
      favorite_menus: favoriteMenu.filter((menu) => menu?.id !== menuIdentifier).map((menu) => menu.id),
    });
  }
}
