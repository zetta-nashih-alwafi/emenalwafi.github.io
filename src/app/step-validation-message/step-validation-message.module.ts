import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { StepValidationMessageRoutingModule } from './step-validation-message-routing.module';
import { StepValidationMessageDialogComponent } from './step-validation-message-dialog/step-validation-message-dialog.component';
import { StepValidationMessageComponent } from './step-validation-message/step-validation-message.component';

@NgModule({
  declarations: [StepValidationMessageComponent, StepValidationMessageDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    CKEditorModule,
    NgSelectModule,
    StepValidationMessageRoutingModule,
    MatSlideToggleModule,
    SweetAlert2Module.forRoot(),
  ],
})
export class StepValidationMessageModule {}
