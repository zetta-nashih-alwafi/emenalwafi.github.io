import { FilterBreadcrumbModule } from 'app/filter-breadcrumb/filter-breadcrumb.module';
import { AddTagsDialogComponent } from 'app/all-students-table/add-tags-dialog/add-tags-dialog.component';
import { StepDynamicMessageDialogComponent } from './components/step-dynamic-message-dialog/step-dynamic-message-dialog.component';
import { A11yModule } from '@angular/cdk/a11y';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { DateAdapter, MatNativeDateModule, MatRippleModule, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { AddAlumniDialogComponent } from 'app/alumni/add-alumni-dialog/add-alumni-dialog.component';
import { AssignMemberDialogComponent } from 'app/candidates/assign-member-dialog/assign-member-dialog.component';
import { MailCanidateDialogComponent } from 'app/candidates/mail-candidates-dialog/mail-candidates-dialog.component';
import { RegistrationDialogComponent } from 'app/candidates/registration-dialog/registration-dialog.component';
import { TransferAdmissionDialogComponent } from 'app/candidates/transfer-admission-member/transfer-admission-member-dialog.component';
import { TransferCampusDialogComponent } from 'app/candidates/transfer-campus/transfer-campus-dialog.component';
import { ChequeEditDialogComponent } from 'app/cheque-transaction/cheque-edit-dialog/cheque-edit-dialog.component';
import { ImportFinanceObjectiveDialogComponent } from 'app/import-finance/import-finance-objective-dialog/import-finance-objective-dialog.component';
import { ImportPreviousFinanceDialogComponent } from 'app/import-previous-finance/import-previous-finance-dialog/import-previous-finance-dialog.component';
import { ImportObjectiveDialogComponent } from 'app/import-registration/import-objective-dialog/import-objective-dialog.component';
import { AddHistoryTaskDialogComponent } from 'app/internship-file/add-history-task-dialog/add-history-task-dialog.component';
import { AddLegalEntityDialogComponent } from 'app/internship-file/add-legal-entity-dialog/add-legal-entity-dialog.component';
import { AddPaymentDialogComponent } from 'app/internship-file/add-payment-dialog/add-payment-dialog.component';
import { AddProfileRateDialogComponent } from 'app/internship-file/add-profile-rate-dialog/add-profile-rate-dialog.component';
import { AddScholarDialogComponent } from 'app/internship-file/add-scholar-dialog/add-scholar-dialog.component';
import { AvoirDialogComponent } from 'app/internship-file/avoir-dialog/avoir-dialog.component';
import { BlockStudentsDialogComponent } from 'app/internship-file/block-students-dialog/block-students-dialog.component';
import { DecaissementDialogComponent } from 'app/internship-file/decaissement-dialog/decaissement-dialog.component';
import { HistoryLettrageDialogComponent } from 'app/internship-file/history-lettrage-dialog/history-lettrage-dialog.component';
import { HistoryReconciliationDialogComponent } from 'app/internship-file/history-reconciliation-dialog/history-reconciliation-dialog.component';
import { ImportDownPaymentDialogComponent } from 'app/internship-file/import-down-payment-dialog/import-down-payment-dialog.component';
import { ImportFullRateDialogComponent } from 'app/internship-file/import-full-rate-dialog/import-full-rate-dialog.component';
import { InternshipCallDialogComponent } from 'app/internship-file/internship-call-dialog/internship-call-dialog.component';
import { InternshipEmailDialogComponent } from 'app/internship-file/internship-email-dialog/internship-email-dialog.component';
import { InternshipLettrageDialogComponent } from 'app/internship-file/internship-lettrage-dialog/internship-lettrage-dialog.component';
import { InternshipWhatsappDialogComponent } from 'app/internship-file/internship-whatsapp-dialog/internship-whatsapp-dialog.component';
import { MailHistoryFinanceDialogComponent } from 'app/internship-file/mail-history-finance-dialog/mail-history-finance-dialog.component';
import { MailInternshipDialogComponent } from 'app/internship-file/mail-internship-dialog/mail-internship-dialog.component';
import { MessagesStudentsDialogComponent } from 'app/internship-file/messages-students-dialog/messages-students-dialog.component';
import { ReconciliationDialogComponent } from 'app/internship-file/reconciliation-dialog/reconciliation-dialog.component';
import { TermsAmountDialogComponent } from 'app/internship-file/tems-amount-dialog/tems-amount-dialog.component';
import { AssignDateAgreementDialogComponent } from 'app/internship/internship-setting/assign-date-agreement/assign-date-agreement-dialog.component';
import { MailToGroupDialogComponent } from 'app/mailbox/mail-to-group-dialog/mail-to-group-dialog.component';
import { ReplyUrgentMessageDialogComponent } from 'app/mailbox/reply-urgent-message-dialog/reply-urgent-message-dialog.component';
import { SendMailDialogComponent } from 'app/mailbox/send-mail-dialog/send-mail-dialog.component';
import { ContactUsDialogComponent } from 'app/need-help/contact-us/contact-us-dialog.component';
import { DuplicatePromoDialogComponent } from 'app/promo-external/duplicate-promo-dialog/duplicate-promo-dialog.component';
import { MailPromoExternalDialogComponent } from 'app/promo-external/mail-promo-external-dialog/mail-promo-external-dialog.component';
import { ViewPromoExternalDialogComponent } from 'app/promo-external/view-promo-external/view-promo-external.component';
import { AssignRateProfileDialogComponent } from 'app/shared/components/assign-rate-dialog/assign-rate-dialog.component';
import { DpRegulationDialogComponent } from './components/dp-regulation-dialog/dp-regulation-dialog.component';
import { DuplicateStepValidationMessageDialogComponent } from 'app/step-validation-message/duplicate-step-validation-message/duplicate-step-validation-message.component';
import { ViewStepValidationDialogComponent } from 'app/step-validation-message/view-step-validation-message/view-step-validation-message.component';
import { UrgentMessageDialogComponent } from 'app/urgent-message/urgent-message-dialog.component';
import { UserEmailDialogComponent } from 'app/users/user-email-dialog/user-email-dialog.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { AssignCorrectorProblematicDialogComponent } from './components/assign-corrector-problematic-dialog/assign-corrector-problematic-dialog.component';
import { BannerConnectAsSnackbarComponent } from './components/banner-connect-as-snackbar/banner-connect-as-snackbar.component';
import { ChipsAutocompleteComponent } from './components/chips-autocomplete/chips-autocomplete.component';
import { ExportGroupsDialogComponent } from './components/export-groups-dialog/export-groups-dialog.component';
import { ImagePreviewDialogComponent } from './components/image-preview-dialog/image-preview-dialog.component';
import { LoginAsUserDialogComponent } from './components/login-as-user-dialog/login-as-user-dialog.component';
import { PromoExternalCardComponent } from './components/promo-external-card/promo-external-card.component';
import { QuickSearchListDialogComponent } from './components/quick-search-list-dialog/quick-search-list-dialog.component';
import { RegStepValidationMessageComponent } from './components/reg-step-validation-message/reg-step-validation-message.component';
import { SpeechToTextDialogComponent } from './components/speech-to-text-dialog/speech-to-text-dialog.component';
import { StatusUpdateDialogComponent } from './components/status-update-dialog/status-update-dialog.component';
import { ValidateProblematicTaskDialogComponent } from './components/validate-problematic-task-dialog/validate-problematic-task-dialog.component';
import { ValidationMessageComponent } from './components/validation-message/validation-message.component';
import { CustomMatPaginatorIntl } from './custom-mat-paginator-intl';
import { AppDateAdapter, APP_DATE_FORMATS } from './date.adapter';
import { LimiteToPipe } from './pipes/LimiteTo.pipe';
import { ParseLocalToUtcPipe } from './pipes/parse-local-to-utc.pipe';
import { ParseStringDatePipe } from './pipes/parse-string-date.pipe';
import { ParseUtcToLocalPipe } from './pipes/parse-utc-to-local.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { SendCopiesDialogComponent } from './send-copies-dialog/send-copies-dialog.component';
// import { AddCompanyDialogCountryComponent } from 'app/company-file/add-company-dialog-country/add-company-dialog-country.component';
import { FlyerDialogComponent } from 'app/admission-entrypoint/intake-channel-tab/flyer-dialog/flyer-dialog.component';
import { AlumniCommentariesDialogComponent } from 'app/alumni-file/alumni-commentaries-tab/alumni-commentaries-dialog/alumni-commentaries-dialog.component';
import { AlumniReplyCommentariesDialogComponent } from 'app/alumni-file/alumni-commentaries-tab/alumni-reply-commentaries-dialog/alumni-reply-commentaries-dialog.component';
import { SendAlumniSurveyDialogComponent } from 'app/alumni-file/send-alumni-survey/send-alumni-survey-dialog.component';
import { StudentReplyCommentariesDialogComponent } from 'app/candidate-file/student-commentaries-tab/student-reply-commentaries-dialog/student-reply-commentaries-dialog.component';
import { StudentUrgentDialogComponent } from 'app/candidate-file/student-urgent-dialog/student-urgent-dialog.component';
import { AddOrganizationDialogComponent } from 'app/companies/add-organization-dialog/add-organization-dialog.component';
import { AddOrganizationContactComponent } from 'app/companies/organization-detail/organization-detail-tab/organization-detail-contact/add-organization-contact/add-organization-contact.component';
import { AddModuleDialogComponent } from 'app/courses-sequences/module-table/add-module-dialog/add-module-dialog.component';
import { AddSequenceDialogComponent } from 'app/courses-sequences/sequence-table/add-sequence-dialog/add-sequence-dialog.component';
import { AddSubjectDialogComponent } from 'app/courses-sequences/subject-table/add-subject-dialog/add-subject-dialog.component';
import { AddContractFollowUpDialogComponent } from 'app/follow-up-contract/add-contract-follow-up-dialog/add-contract-follow-up-dialog.component';
import { AddNoteFinancementDialogComponent } from 'app/form-filling/form-fill-financement/add-note-financement-dialog/add-note-financement-dialog.component';
import { AddCompanyInternshipFrDialogComponent } from 'app/internship-aggrement/add-company-internship-fr-dialog/add-company-internship-fr-dialog.component';
import { SendMultipleEmailComponent } from 'app/internship-file/send-multiple-email/send-multiple-email.component';
import { ChangeCampusDialogComponent } from 'app/session/admission-form/campus-form/change-campus-dialog/change-campus-dialog.component';
import { MethodPaymentDialogComponent } from 'app/session/admission-form/method-payment-dialog/method-payment-dialog.component';
import { MailStepValidationMessageDialogComponent } from 'app/step-validation-message/mail-step-validation-message-dialog/mail-step-validation-message-dialog.component';
import { StepMessageProcessContractDialogComponent } from 'app/teacher-contract/pre-contract-form/step-message-process/step-message-process.component';
import { AddAssignTeacherDialogComponent } from './components/add-assign-teacher-dialog/add-assign-teacher-dialog.component';
import { AddFinancementDialogComponent } from './components/add-financement-dialog/add-financement-dialog.component';
import { AddUserDialogComponent } from './components/add-user-dialog/add-user-dialog.component';
import { AssignMemberFcDialogComponent } from './components/assign-member-fc-dialog/assign-member-fc-dialog.component';
import { EditStudentFinancementDialogComponent } from './components/edit-student-financement-dialog/edit-student-financement-dialog.component';
import { ImportContractProcessDialogComponent } from './components/import-contract-process-dialog/import-contract-process-dialog.component';
import { OscarAssignProgramDialogComponent } from './components/oscar-assign-program-dialog/oscar-assign-program-dialog.component';
import { SendEmailValidatorDialogComponent } from './components/send-email-validator-dialog/send-email-validator-dialog.component';
import { FinancementDeductionDialogComponent } from './components/financement-deduction-dialog/financement-deduction-dialog.component';
import { SafeResourceUrlPipe } from './pipes/safe-resource-url.pipe';
import { ExportGenerationInfoDialogComponent } from './components/export-generation-info-dialog/export-generation-info-dialog.component';
import { TrombinoscopePdfDialogComponent } from './components/trombinoscope-pdf-dialog/trombinoscope-pdf-dialog.component';
import { MonthTermDetailsDialogComponent } from 'app/candidate-file/candidate-card-details/month-term-details-dialog/month-term-details-dialog.component';
import { SpecialCaseReasonComponent } from './components/special-case-reason/special-case-reason.component';
import { AddBillingDialogComponent } from './components/add-billing-dialog/add-billing-dialog.component';
import { PreviewPdfRulePopUp } from './components/preview-pdf-rule-pop-up/preview-pdf-rule-pop-up.component';
import { AddCompanyStaffDialogComponent } from 'app/companies/add-company-staff-dialog/add-company-staff-dialog.component';
import { AskVisaDocumentDialogComponent } from 'app/candidate-file/candidate-card-details/student-visa-document-tab/ask-visa-document-dialog/ask-visa-document-dialog.component';
import { PreventInputTagCharactersDirective } from './directives/prevent-input-tag-characters.directive';
import { ExportControllingReportDialogComponent } from 'app/finance/finance-table/export-controlling-report-dialog/export-controlling-report-dialog.component';
const modules: any = [
  A11yModule,
  CdkStepperModule,
  CdkTableModule,
  CdkTreeModule,
  DragDropModule,
  MatAutocompleteModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatStepperModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule,
  PortalModule,
  ScrollingModule,
  TranslateModule,
  FormsModule,
  ReactiveFormsModule,
  FlexLayoutModule,
  CommonModule,
  SlickCarouselModule,
  FilterBreadcrumbModule
];

@NgModule({
  declarations: [
    AddCompanyStaffDialogComponent,
    AssignMemberFcDialogComponent,
    StudentUrgentDialogComponent,
    ValidationMessageComponent,
    ChipsAutocompleteComponent,
    TruncatePipe,
    LimiteToPipe,
    SafeHtmlPipe,
    SafeResourceUrlPipe,
    ParseStringDatePipe,
    LoginAsUserDialogComponent,
    ParseUtcToLocalPipe,
    ParseLocalToUtcPipe,
    SpeechToTextDialogComponent,
    SendMailDialogComponent,
    ReplyUrgentMessageDialogComponent,
    ContactUsDialogComponent,
    MailToGroupDialogComponent,
    BannerConnectAsSnackbarComponent,
    AssignCorrectorProblematicDialogComponent,
    DuplicatePromoDialogComponent,
    MailCanidateDialogComponent,
    AssignRateProfileDialogComponent,
    TransferAdmissionDialogComponent,
    AssignMemberDialogComponent,
    TransferCampusDialogComponent,
    RegistrationDialogComponent,
    ImportObjectiveDialogComponent,
    RegStepValidationMessageComponent,
    PromoExternalCardComponent,
    MailPromoExternalDialogComponent,
    ViewPromoExternalDialogComponent,
    ViewStepValidationDialogComponent,
    DuplicateStepValidationMessageDialogComponent,
    AvoirDialogComponent,
    InternshipCallDialogComponent,
    DecaissementDialogComponent,
    InternshipWhatsappDialogComponent,
    InternshipEmailDialogComponent,
    AddPaymentDialogComponent,
    TermsAmountDialogComponent,
    InternshipLettrageDialogComponent,
    HistoryReconciliationDialogComponent,
    HistoryLettrageDialogComponent,
    MailInternshipDialogComponent,
    ReconciliationDialogComponent,
    AddScholarDialogComponent,
    AddProfileRateDialogComponent,
    AddLegalEntityDialogComponent,
    ImportDownPaymentDialogComponent,
    ImportFullRateDialogComponent,
    ImportPreviousFinanceDialogComponent,
    ImportFinanceObjectiveDialogComponent,
    BlockStudentsDialogComponent,
    MessagesStudentsDialogComponent,
    ChequeEditDialogComponent,
    MailHistoryFinanceDialogComponent,
    AddHistoryTaskDialogComponent,
    AddAlumniDialogComponent,
    ValidateProblematicTaskDialogComponent,
    ExportGroupsDialogComponent,
    QuickSearchListDialogComponent,
    StatusUpdateDialogComponent,
    SendCopiesDialogComponent,
    ImagePreviewDialogComponent,
    UrgentMessageDialogComponent,
    UserEmailDialogComponent,
    AssignDateAgreementDialogComponent,
    // AddCompanyDialogCountryComponent,
    AddCompanyInternshipFrDialogComponent,
    MethodPaymentDialogComponent,
    StudentReplyCommentariesDialogComponent,
    AddUserDialogComponent,
    SendMultipleEmailComponent,
    AddFinancementDialogComponent,
    StepMessageProcessContractDialogComponent,
    ChangeCampusDialogComponent,
    OscarAssignProgramDialogComponent,
    DpRegulationDialogComponent,
    AddOrganizationDialogComponent,
    AddOrganizationContactComponent,
    AddNoteFinancementDialogComponent,
    MailStepValidationMessageDialogComponent,
    SendAlumniSurveyDialogComponent,
    AlumniReplyCommentariesDialogComponent,
    AlumniCommentariesDialogComponent,
    FlyerDialogComponent,
    SendEmailValidatorDialogComponent,
    AddSequenceDialogComponent,
    AddModuleDialogComponent,
    AddSubjectDialogComponent,
    ImportContractProcessDialogComponent,
    AddContractFollowUpDialogComponent,
    AssignMemberFcDialogComponent,
    AddAssignTeacherDialogComponent,
    EditStudentFinancementDialogComponent,
    FinancementDeductionDialogComponent,
    StepDynamicMessageDialogComponent,
    ExportGenerationInfoDialogComponent,
    TrombinoscopePdfDialogComponent,
    AddTagsDialogComponent,
    MonthTermDetailsDialogComponent,
    SpecialCaseReasonComponent,
    AddBillingDialogComponent,
    AskVisaDocumentDialogComponent,
    PreviewPdfRulePopUp,
    PreventInputTagCharactersDirective,
    ExportControllingReportDialogComponent
  ],
  imports: [...modules, CKEditorModule, NgxPermissionsModule.forChild(), NgSelectModule, SweetAlert2Module.forRoot()],
  exports: [
    ...modules,
    ValidationMessageComponent,
    ChipsAutocompleteComponent,
    TruncatePipe,
    SafeHtmlPipe,
    SafeResourceUrlPipe,
    ParseStringDatePipe,
    LimiteToPipe,
    LoginAsUserDialogComponent,
    NgxPermissionsModule,
    RegStepValidationMessageComponent,
    PromoExternalCardComponent,
    StepDynamicMessageDialogComponent,
    AddAssignTeacherDialogComponent,
    EditStudentFinancementDialogComponent,
    TrombinoscopePdfDialogComponent,
    MonthTermDetailsDialogComponent,
    PreventInputTagCharactersDirective
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: AppDateAdapter,
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: APP_DATE_FORMATS,
    },
    {
      provide: MatPaginatorIntl,
      useClass: CustomMatPaginatorIntl,
    },
  ],
})
export class SharedModule {}
