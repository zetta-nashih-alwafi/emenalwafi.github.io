import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { THomePageBackgroundColour, THomePageBackgroundOption } from 'app/homepage/homepage.declaration';
import { environment } from 'environments/environment';
import { BehaviorSubject } from 'rxjs';
import { UtilityService } from '../utility/utility.service';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  public tutorialData: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  collapseSidebar = false;
  collapseSidebarStatus: boolean;
  sidenavMode: MatDrawerMode = 'push';
  sidenavTutorialMode = 'side';
  sidenavOpen = true;
  sidenavTutorialOpen = false;
  horizontalSideNavMode = 'over';
  horizontalSideNavOpen = false;
  projectDetailsContent: any;
  editProductData: any;
  neutralCivility = true;
  chartDummyData = false;
  isStaging = environment.apiUrl !== 'https://api.erp-edh.com/graphql' ? true : false;
  displayDailyChart = false;

  setTutorialView(value: any) {
    this.tutorialData.next(value);
  }
  constructor(@Inject(DOCUMENT) private _document: Document, private _utils: UtilityService) {}

  setAppThemeColors(theme: Partial<THomePageBackgroundColour>) {
    Object.entries(theme).forEach(([key, value]) => {
      if (value) {
        const color = this._utils.hexToRgb(value);
        if (typeof color?.r === 'number' && typeof color?.g === 'number' && typeof color?.b === 'number') {
          const { r, g, b } = color
          this._document.documentElement.style.setProperty(`--app-theme-color-${key}`, `${r} ${g} ${b}`);
      }
      }
    });
  }
}
