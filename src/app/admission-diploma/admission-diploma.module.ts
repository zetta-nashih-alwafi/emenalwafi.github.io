import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';

import { SlickCarouselModule } from 'ngx-slick-carousel';

import { SharedModule } from '../shared/shared.module';
import { WidgetComponentModule } from '../widget-component/widget-component.module';
import { NgxCaptchaModule } from 'ngx-captcha';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { CustomDatePickerAdapter, CUSTOM_DATE_FORMATS } from 'app/date-adapters';
import { NgSelectModule } from '@ng-select/ng-select';
import { AdmissionDiplomaRoutingModule } from './admission-diploma.routing';
import { DiplomaFormComponent } from './diploma-form/diploma-form.component';
import { AdmissionDiplomaComponent } from './admission-diploma.component';

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
  declarations: [AdmissionDiplomaComponent, DiplomaFormComponent],
  imports: [
    CommonModule,
    AdmissionDiplomaRoutingModule,
    SharedModule,
    SlickCarouselModule,
    WidgetComponentModule,
    NgxCaptchaModule,

    CKEditorModule,
    NgSelectModule,
    NgxMaterialTimepickerModule,
    // ...MAT_MODULES,
  ],

  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdmissionDiplomaModule {}
