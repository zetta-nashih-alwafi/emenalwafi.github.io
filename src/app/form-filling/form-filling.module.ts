import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormBuilderModule } from 'app/form-builder/form-builder.module';
import { SharedModule } from 'app/shared/shared.module';
import { WidgetComponentModule } from 'app/widget-component/widget-component.module';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { FormFillCampusValidationComponent } from './form-fill-campus-validation/form-fill-campus-validation.component';
import { FormFillConditionAcceptanceComponent } from './form-fill-condition-acceptance/form-fill-condition-acceptance.component';
import { FormFillContractSingingProcessComponent } from './form-fill-contract-singing-process/form-fill-contract-singing-process.component';
import { FormFillDocumentExpectedComponent } from './form-fill-document-expected/form-fill-document-expected.component';
import { FormFillDownPaymentComponent } from './form-fill-down-payment/form-fill-down-payment.component';
import { FormFillDynamicSummaryComponent } from './form-fill-dynamic-summary/form-fill-dynamic-summary.component';
import { FormFillFinalMessageComponent } from './form-fill-final-message/form-fill-final-message.component';
import { FormFillFinancementComponent } from './form-fill-financement/form-fill-financement.component';
import { FormFillModalityPaymentComponent } from './form-fill-modality-payment/form-fill-modality-payment.component';
import { FormFillNormalQuestionComponent } from './form-fill-normal-question/form-fill-normal-question.component';
import { FormFillRecursiveDateComponent } from './form-fill-recursive-parent-child/form-fill-recursive-date/form-fill-recursive-date.component';
import { FormFillRecursiveDurationComponent } from './form-fill-recursive-parent-child/form-fill-recursive-duration/form-fill-recursive-duration.component';
import { FormFillRecursiveEmailComponent } from './form-fill-recursive-parent-child/form-fill-recursive-email/form-fill-recursive-email.component';
import { FormFillRecursiveFreeTextComponent } from './form-fill-recursive-parent-child/form-fill-recursive-free-text/form-fill-recursive-free-text.component';
import { FormFillRecursiveNumericComponent } from './form-fill-recursive-parent-child/form-fill-recursive-numeric/form-fill-recursive-numeric.component';
import { FormFillRecursiveParentChildComponent } from './form-fill-recursive-parent-child/form-fill-recursive-parent-child.component';
import { FormFillRecursiveSingleOptionComponent } from './form-fill-recursive-parent-child/form-fill-recursive-single-option/form-fill-recursive-single-option.component';
import { FormFillRecursiveTimeComponent } from './form-fill-recursive-parent-child/form-fill-recursive-time/form-fill-recursive-time.component';
import { FormFillScholarshipFeeComponent } from './form-fill-scholarship-fee/form-fill-scholarship-fee.component';
import { FormFillSummaryComponent } from './form-fill-summary/form-fill-summary.component';
import { FormFillingRevisionBoxComponent } from './form-filling-revision-box/form-filling-revision-box.component';
import { FormFillingRevisionDialogComponent } from './form-filling-revision-dialog/form-filling-revision-dialog.component';
import { FormFillingRoutingModule } from './form-filling-routing.module';
import { FormFillingComponent } from './form-filling.component';
import { StepDynamicMessageDialogComponent } from '../shared/components/step-dynamic-message-dialog/step-dynamic-message-dialog.component';
import { RefuseToSignComponent } from './form-fill-contract-singing-process/refuse-to-sign/refuse-to-sign.component';

@NgModule({
  declarations: [
    FormFillingComponent,
    FormFillDocumentExpectedComponent,
    FormFillNormalQuestionComponent,
    FormFillingRevisionBoxComponent,
    FormFillingRevisionDialogComponent,
    FormFillSummaryComponent,
    FormFillContractSingingProcessComponent,
    FormFillDynamicSummaryComponent,
    FormFillFinalMessageComponent,
    FormFillRecursiveParentChildComponent,
    FormFillRecursiveSingleOptionComponent,
    FormFillRecursiveNumericComponent,
    FormFillRecursiveFreeTextComponent,
    FormFillRecursiveDateComponent,
    FormFillRecursiveEmailComponent,
    FormFillRecursiveDurationComponent,
    FormFillCampusValidationComponent,
    FormFillModalityPaymentComponent,
    FormFillFinancementComponent,
    FormFillScholarshipFeeComponent,
    FormFillDownPaymentComponent,
    FormFillConditionAcceptanceComponent,
    FormFillRecursiveTimeComponent,
    FormFillDynamicSummaryComponent,
    FormFillContractSingingProcessComponent,
    RefuseToSignComponent
  ],
  exports: [],
  imports: [
    CommonModule,
    FormFillingRoutingModule,
    SharedModule,
    CKEditorModule,
    WidgetComponentModule,
    NgxMaterialTimepickerModule,
    NgSelectModule,
    FormBuilderModule,
  ],
})
export class FormFillingModule {}
