import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FollowUpReadmissionRoutingModule } from './follow-up-readmission-routing.module';
import { FollowUpReadmissionComponent } from './follow-up-readmission.component';
import { MailValidatorReadmissionDialogComponent } from './mail-validator-readmission-dialog/mail-validator-readmission-dialog.component';
import { SendEmailReadmissionDialogComponent } from './send-email-readmission-dialog/send-email-readmission-dialog.component';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { EditJuryDecisionDialogComponent } from '../assignment-readmission/edit-jury-decision-dialog/edit-jury-decision-dialog.component';
import { AssignmentReadmissionModule } from '../assignment-readmission/assignment-readmission.module';
import { CandidatesModule } from 'app/candidates/candidates.module';

@NgModule({
  declarations: [FollowUpReadmissionComponent, MailValidatorReadmissionDialogComponent, SendEmailReadmissionDialogComponent],
  imports: [
    SharedModule,
    CKEditorModule,
    CommonModule,
    NgSelectModule,
    SweetAlert2Module.forRoot(),
    FollowUpReadmissionRoutingModule,
    AssignmentReadmissionModule,
    CandidatesModule,
  ],
})
export class FollowUpReadmissionModule {}
