import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreContractFormRoutingModule } from './pre-contract-form-routing.module';
import { PreContractFormComponent } from './pre-contract-form.component';
import { PreContractFormStepNormalQuestionComponent } from './pre-contract-form-step-normal-question/pre-contract-form-step-normal-question.component';
import { PreContractFormStepDocumentExpectedComponent } from './pre-contract-form-step-document-expected/pre-contract-form-step-document-expected.component';
import { PreContractFormStepSummaryComponent } from './pre-contract-form-step-summary/pre-contract-form-step-summary.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { SharedModule } from 'app/shared/shared.module';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { WidgetComponentModule } from 'app/widget-component/widget-component.module';

import { RevisionBoxContractComponent } from './revision-box-contract/revision-box-contract.component';
import { RevisionBoxContractDialogComponent } from './revision-box-contract-dialog/revision-box-contract-dialog.component';
import { PreContractFormStepConditionAcceptanceComponent } from './pre-contract-form-step-condition-acceptance/pre-contract-form-step-condition-acceptance.component';
import { PreContractFormStepSigningProcessComponent } from './pre-contract-form-step-signing-process/pre-contract-form-step-signing-process.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PreContractSummaryComponent } from './pre-contract-form-steps-summary/pre-contract-form-steps-summary';

@NgModule({
  declarations: [
    PreContractFormComponent,
    PreContractFormStepNormalQuestionComponent,
    PreContractFormStepDocumentExpectedComponent,
    PreContractFormStepSummaryComponent,
    RevisionBoxContractComponent,
    RevisionBoxContractDialogComponent,
    PreContractFormStepConditionAcceptanceComponent,
    PreContractFormStepSigningProcessComponent,
    PreContractSummaryComponent,
  ],
  imports: [
    CommonModule,
    PreContractFormRoutingModule,
    NgSelectModule,
    CommonModule,
    SharedModule,
    SlickCarouselModule,
    WidgetComponentModule,

    CKEditorModule,
    NgxMaterialTimepickerModule,
  ],
})
export class PreContractFormModule {}
