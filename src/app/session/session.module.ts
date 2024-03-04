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

import { LockScreenV2Component } from './lockscreenV2/lockscreenV2.component';
import { ForgotPasswordV2Component } from './forgot-passwordV2/forgot-passwordV2.component';
import { RegisterV2Component } from './registerV2/registerV2.component';
import { LoginV2Component } from './loginV2/loginV2.component';
import { SetPasswordV2Component } from './set-passwordV2/set-passwordV2.component';
import { SessionRoutingModule } from './session.routing';
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
import { NgSelectModule } from '@ng-select/ng-select';
import { AdmissionFormComponent } from './admission-form/admission-form.component';
import { DownPaymentFormComponent } from './admission-form/down-payment-form/down-payment-form.component';
import { SummaryFormComponent } from './admission-form/summary-form/summary-form.component';
import { ConditionFormComponent } from './admission-form/condition-form/condition-form.component';
import { PaymentFormComponent } from './admission-form/payment-form/payment-form.component';
import { InformationFormComponent } from './admission-form/information-form/information-form/information-form.component';
import { InformationCardComponent } from './admission-form/information-form/information-card.component';
import { CampusFormComponent } from './admission-form/campus-form/campus-form.component';
import { SuccessPageComponent } from './admission-form/success-page/success-page.component';
import { CancelPageComponent } from './admission-form/cancel-page/cancel-page.component';

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
  declarations: [
    LoginV2Component,
    RegisterV2Component,
    LockScreenV2Component,
    ForgotPasswordV2Component,
    SetPasswordV2Component,
    AdmissionFormComponent,
    DownPaymentFormComponent,
    SummaryFormComponent,
    ConditionFormComponent,
    PaymentFormComponent,
    InformationFormComponent,
    InformationCardComponent,
    CampusFormComponent,
    SuccessPageComponent,
    CancelPageComponent,
  ],
  imports: [
    CommonModule,
    SessionRoutingModule,
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
export class SessionModule {}
