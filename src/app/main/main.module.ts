import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { WidgetComponentModule } from './../widget-component/widget-component.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MenuToggleModule } from './../core/menu/menu-toggle.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from './../shared/shared.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { MainComponent } from './main.component';
import { SideBarComponent } from './../shared/side-bar/side-bar.component';
import { FooterComponent } from './../shared/footer/footer.component';
import { TutorialBarComponent } from './../shared/tutorial-bar/tutorial-bar.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VersionModule } from '../version/version.module';

import { MainRoutingModule } from './main-routing.module';
import { QuickSearchBarComponent } from "../shared/components/quick-search-bar/quick-search-bar.component";
import { FavorableMenuListComponent } from 'app/shared/components/favorable-menu-list/favorable-menu-list.component';
import { ProfileButtonMenuComponent } from 'app/shared/components/profile-button-menu/profile-button-menu.component';

const MAT_MODULES = [
  MatMenuModule,
  MatSidenavModule,
  MatButtonModule,
  MatInputModule,
  MatToolbarModule,
  MatIconModule,
  MatCardModule,
  MatTabsModule,
  MatListModule,
  MatDatepickerModule,
  MatCheckboxModule,
];
@NgModule({
declarations: [MainComponent, SideBarComponent, FooterComponent, TutorialBarComponent],
  imports: [
    ...MAT_MODULES,
    CKEditorModule,
    CommonModule,
    FavorableMenuListComponent,
    FlexLayoutModule,
    FormsModule,
    MainRoutingModule,
    MatSlideToggleModule,
    MenuToggleModule,
    NgxMaterialTimepickerModule,
    PerfectScrollbarModule,
    ProfileButtonMenuComponent,
    ReactiveFormsModule,
    SharedModule,
    WidgetComponentModule,
    QuickSearchBarComponent,
    VersionModule,
  ],
})
export class MainModule { }
