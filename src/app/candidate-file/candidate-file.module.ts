import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { CandidateFileComponent } from './candidate-file/candidate-file.component';
import { CandidateFileRoutingModule } from './candidate-file-routing.module';
import { CandidateHistoryTabComponent } from './candidate-history-tab/candidate-history-tab.component';
import { CandidateNoteTabComponent } from './candidate-note-tab/candidate-note-tab.component';
import { CandidateModificationTabComponent } from './candidate-modification-tab/candidate-modification-tab.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CandidateCardListComponent } from './candidate-card-list/candidate-card-list.component';
import { CandidateCardDetailsComponent } from './candidate-card-details/candidate-card-details.component';
import { StudentContactsTabComponent } from './student-contacts-tab/student-contacts-tab.component';
import { StudentIdentityTabComponent } from './candidate-card-details/student-identity-tab/student-identity-tab.component';
import { StudentUrgentDialogComponent } from './student-urgent-dialog/student-urgent-dialog.component';
import { StudentTabComponent } from './student-tab/student-tab.component';
import { StudentTabDetailComponent } from './student-tab/student-tab-detail/student-tab-detail.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { StudentCommentariesTabComponent } from './student-commentaries-tab/student-commentaries-tab.component';
import { StudentFinanceTabComponent } from './candidate-card-details/student-finance-tab/student-finance-tab.component';
import { StudentAvoirDialogComponent } from './candidate-card-details/student-avoir-dialog/student-avoir-dialog.component';
import { StudentDecaissementDialogComponent } from './candidate-card-details/student-decaissement-dialog/student-decaissement-dialog.component';
import { StudentCommentariesDialogComponent } from './student-commentaries-tab/student-commentaries-dialog/student-commentaries-dialog.component';
import { StudentChangeStatusDialogComponent } from './student-commentaries-tab/student-change-status-dialog/student-change-status-dialog.component';
import { StudentMailboxTabComponent } from './candidate-card-details/student-mailbox-tab/student-mailbox-tab.component';
import { StudentMailboxCcTabComponent } from './candidate-card-details/student-mailbox-tab/student-mailbox-cc-tab/student-mailbox-cc-tab.component';
import { StudentMailboxSentTabComponent } from './candidate-card-details/student-mailbox-tab/student-mailbox-sent-tab/student-mailbox-sent-tab.component';
import { StudentMailboxImportantTabComponent } from './candidate-card-details/student-mailbox-tab/student-mailbox-important-tab/student-mailbox-important-tab.component';
import { StudentMailboxDraftTabComponent } from './candidate-card-details/student-mailbox-tab/student-mailbox-draft-tab/student-mailbox-draft-tab.component';
import { StudentMailboxTrashTabComponent } from './candidate-card-details/student-mailbox-tab/student-mailbox-trash-tab/student-mailbox-trash-tab.component';
import { StudentMailboxInboxTabComponent } from './candidate-card-details/student-mailbox-tab/student-mailbox-inbox-tab/student-mailbox-inbox-tab.component';
import { StudentFinancementTabComponent } from './student-financement-tab/student-financement-tab.component';
import { StudentFinanceTabDetailComponent } from './candidate-card-details/student-finance-tab/student-finance-tab-detail/student-finance-tab-detail.component';
import { StudentFinancementTabDetailComponent } from './student-financement-tab/student-financement-tab-detail/student-financement-tab-detail.component';
import { StudentConventionTabComponent } from './student-convention-tab/student-convention-tab.component';
import { StudentConventionTabDetailComponent } from './student-convention-tab/student-convention-tab-detail/student-convention-tab-detail.component';
import { ContractStudentTabComponent } from './contract-student-tab/contract-student-tab.component';
import { AddNoteFinancementDialogComponent } from '../form-filling/form-fill-financement/add-note-financement-dialog/add-note-financement-dialog.component';
import { FormFillingModule } from 'app/form-filling/form-filling.module';
import { StudentDocumentTabComponent } from './candidate-card-details/student-document-tab/student-document-tab.component';
import { AddStudentManualDocumentDialogComponent } from './candidate-card-details/student-document-tab/add-student-manual-document-dialog/add-student-manual-document-dialog.component';
import { StudentTagsTabDetailComponent } from './student-tags-tab-detail/student-tags-tab-detail.component';
import { StudentNewContactsTabComponent } from './student-new-contacts-tab/student-new-contacts-tab.component';
import { StudentNewContactTabDetailComponent } from './student-new-contacts-tab/student-new-contact-tab-detail/student-new-contact-tab-detail.component';
import { AddManualBillingDialogComponent } from './candidate-card-details/add-manual-billing-dialog/add-manual-billing-dialog.component';
import { AddManualPaymentDialogComponent } from './candidate-card-details/add-manual-payment-dialog/add-manual-payment-dialog.component';
import { AddDiverseOperationDialogComponent } from './candidate-card-details/add-diverse-operation-dialog/add-diverse-operation-dialog.component';
import { OperationNoteDialogComponent } from './candidate-card-details/operation-note-dialog/operation-note-dialog.component';
import { FollowUpContractModule } from 'app/follow-up-contract/follow-up-contract.module';
import { CandidateFormTabComponent } from './candidate-card-details/candidate-form-tab/candidate-form-tab.component';
import { StudentVisaDocumentTabComponent } from './candidate-card-details/student-visa-document-tab/student-visa-document-tab.component';
import { AskVisaDocumentDialogComponent } from './candidate-card-details/student-visa-document-tab/ask-visa-document-dialog/ask-visa-document-dialog.component';
import { RejectVisaDocumentDialogComponent } from './candidate-card-details/student-visa-document-tab/reject-visa-document-dialog/reject-visa-document-dialog.component';
import { UserManagementModule } from 'app/user-management/user-management.module';

@NgModule({
  declarations: [
    CandidateFileComponent,
    CandidateHistoryTabComponent,
    CandidateNoteTabComponent,
    CandidateModificationTabComponent,
    CandidateCardListComponent,
    CandidateCardDetailsComponent,
    StudentContactsTabComponent,
    StudentIdentityTabComponent,
    StudentTabComponent,
    StudentTabDetailComponent,
    StudentCommentariesTabComponent,
    StudentFinanceTabComponent,
    StudentAvoirDialogComponent,
    StudentDecaissementDialogComponent,
    StudentCommentariesDialogComponent,
    StudentChangeStatusDialogComponent,
    StudentMailboxTabComponent,
    StudentMailboxInboxTabComponent,
    StudentMailboxCcTabComponent,
    StudentMailboxSentTabComponent,
    StudentMailboxImportantTabComponent,
    StudentMailboxDraftTabComponent,
    StudentMailboxTrashTabComponent,
    StudentFinancementTabComponent,
    StudentFinanceTabDetailComponent,
    StudentFinancementTabDetailComponent,
    StudentConventionTabComponent,
    StudentConventionTabDetailComponent,
    ContractStudentTabComponent,
    StudentDocumentTabComponent,
    AddStudentManualDocumentDialogComponent,
    AddManualBillingDialogComponent,
    AddManualPaymentDialogComponent,
    AddDiverseOperationDialogComponent,
    StudentTagsTabDetailComponent,
    StudentNewContactsTabComponent,
    StudentNewContactTabDetailComponent,
    OperationNoteDialogComponent,
    CandidateFormTabComponent,
    StudentVisaDocumentTabComponent,
    RejectVisaDocumentDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    CKEditorModule,

    NgxMaterialTimepickerModule,
    CandidateFileRoutingModule,
    FormFillingModule,
    SweetAlert2Module.forRoot(),
    NgSelectModule,
    FollowUpContractModule,
    UserManagementModule
  ],
  providers: [DatePipe],
})
export class CandidateFileModule {}
