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
import { InternshipAggrementComponent } from './internship-aggrement/internship-aggrement.component';
import { SecondStepAggrementComponent } from './second-step-aggrement/second-step-aggrement.component';
import { ThirdStepAggrementComponent } from './third-step-aggrement/third-step-aggrement.component';
import { FirstStepAggrementComponent } from './first-step-aggrement/first-step-aggrement.component';
import { FourthStepAggrementComponent } from './fourth-step-aggrement/fourth-step-aggrement.component';
import { FifthStepAggrementComponent } from './fifth-step-aggrement/fifth-step-aggrement.component';
import { SixthStepAggrementComponent } from './sixth-step-aggrement/sixth-step-aggrement.component';
import { SeventhStepAggrementComponent } from './seventh-step-aggrement/seventh-step-aggrement.component';
import { EighthStepAggrementComponent } from './eighth-step-aggrement/eighth-step-aggrement.component';
import { InternshipAggrementRoutingModule } from './internship-aggrement.routing';
import { FirstAggrementFormComponent } from './first-step-aggrement/first-aggrement-form/first-aggrement-form.component';
import { SecondAggrementFormComponent } from './second-step-aggrement/second-aggrement-form/second-aggrement-form.component';
import { ThirdAggrementFormComponent } from './third-step-aggrement/third-aggrement-form/third-aggrement-form.component';
import { FourthAggrementFormComponent } from './fourth-step-aggrement/fourth-aggrement-form/fourth-aggrement-form.component';
import { FifthAggrementFormComponent } from './fifth-step-aggrement/fifth-aggrement-form/fifth-aggrement-form.component';
import { SixthAggrementFormComponent } from './sixth-step-aggrement/sixth-aggrement-form/sixth-aggrement-form.component';
import { SeventhAggrementFormComponent } from './seventh-step-aggrement/seventh-aggrement-form/seventh-aggrement-form.component';
import { EighthAggrementFormComponent } from './eighth-step-aggrement/eighth-aggrement-form/eighth-aggrement-form.component';
import { ConditionsStepAggrementComponent } from './conditions-step-aggrement/conditions-step-aggrement.component';
import { AmendmentStepAggrementComponent } from './amendment-step-aggrement/amendment-step-aggrement.component';
import { PdfAggrementComponent } from './pdf-aggrement/pdf-aggrement.component';
import { ManagerStepAggrementComponent } from './manager-step-aggrement/manager-step-aggrement.component';
import { SummaryStepAggrementComponent } from './summary-step-aggrement/summary-step-aggrement.component';
import { AskRevisionDialogComponent } from './ask-revision-dialog/ask-revision-dialog.component';

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
    InternshipAggrementComponent,
    FirstStepAggrementComponent,
    SecondStepAggrementComponent,
    ThirdStepAggrementComponent,
    FourthStepAggrementComponent,
    FifthStepAggrementComponent,
    ManagerStepAggrementComponent,
    SixthStepAggrementComponent,
    SeventhStepAggrementComponent,
    EighthStepAggrementComponent,
    ConditionsStepAggrementComponent,
    SummaryStepAggrementComponent,
    AmendmentStepAggrementComponent,
    FirstAggrementFormComponent,
    SecondAggrementFormComponent,
    ThirdAggrementFormComponent,
    FourthAggrementFormComponent,
    FifthAggrementFormComponent,
    SixthAggrementFormComponent,
    SeventhAggrementFormComponent,
    EighthAggrementFormComponent,
    PdfAggrementComponent,
    AskRevisionDialogComponent,
  ],
  imports: [
    CommonModule,
    InternshipAggrementRoutingModule,
    SharedModule,
    SlickCarouselModule,
    WidgetComponentModule,
    NgxCaptchaModule,

    CKEditorModule,
    NgxMaterialTimepickerModule,
    // ...MAT_MODULES,
  ],
  providers: [],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InternshipAggrementModule {}
