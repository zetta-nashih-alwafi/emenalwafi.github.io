import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';

import { FlexLayoutModule } from '@angular/flex-layout';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { WidgetComponentModule } from '../widget-component/widget-component.module';
import { LanguageDropDownComponent } from '../widget-component/global/language-drop-down/language-drop-down.component';
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
import { CompanyCreationRoutingModule } from './company-creation.routing';
import { CompanyCreationComponent } from './company-creation/company-creation.component';
import { FirstStepCompanyCreationComponent } from './first-step-company-creation/first-step-company-creation.component';
import { SecondStepCompanyCreationComponent } from './second-step-company-creation/second-step-company-creation.component';

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
  declarations: [CompanyCreationComponent, FirstStepCompanyCreationComponent, SecondStepCompanyCreationComponent],
  imports: [
    CommonModule,
    CompanyCreationRoutingModule,
    SharedModule,
    SlickCarouselModule,
    WidgetComponentModule,
    NgxCaptchaModule,

    CKEditorModule,
    NgxMaterialTimepickerModule,
    // ...MAT_MODULES,
  ],
  providers: [
    DatePipe,
    { provide: DateAdapter, useClass: CustomDatePickerAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CompanyCreationModule {}
