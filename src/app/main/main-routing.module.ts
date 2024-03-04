import { MainComponent } from './main.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const menuRoutes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('../homepage/homepage.component').then(m => m.HomepageComponent)
  },
  { path: 'dashboard', loadChildren: () => import('../dashboard/dashboard.module').then((m) => m.DashboardModule) },
  {
    path: 'import-register',
    loadChildren: () => import('../import-registration/import-registration.module').then((m) => m.ImportRegisterModule),
  },
  {
    path: 'import-finance',
    loadChildren: () => import('../import-finance/import-finance.module').then((m) => m.ImportFinanceModule),
  },
  {
    path: 'import-previous-finance',
    loadChildren: () => import('../import-previous-finance/import-previous-finance.module').then((m) => m.ImportPreviousFinanceModule),
  },
  {
    path: 'cheque-transaction',
    loadChildren: () => import('../cheque-transaction/cheque-transaction.module').then((m) => m.ChequeTransactionModule),
  },
  {
    path: 'timeline-template',
    loadChildren: () => import('../timeline-template/timeline-template.module').then((m) => m.TimelineTemplateModule),
  },
  {
    path: 'transaction-report',
    loadChildren: () => import('../transaction-report/transaction-report.module').then((m) => m.TransactionReportModule),
  },
  {
    path: 'master-transaction',
    loadChildren: () => import('../master-transaction/master-transaction.module').then((m) => m.MasterTransactionModule),
  },
  {
    path: 'balance-report',
    loadChildren: () => import('../balance-report/balance-report.module').then((m) => m.BalanceReportModule),
  },
  {
    path: 'dashboard-register',
    loadChildren: () => import('../dashboard-register/dashboard-register.module').then((m) => m.DashboardRegisterModule),
  },
  { path: 'guide', loadChildren: () => import('../guide/guide.module').then((m) => m.GuideModule) },
  {
    path: 'scholar-card',
    loadChildren: () => import('../admission-entrypoint/admission-entrypoint.module').then((m) => m.AdmissionEntrypointModule),
  },
  { path: 'promo-external', loadChildren: () => import('../promo-external/promo-external.module').then((m) => m.PromoExternalModule) },
  {
    path: 'step-validation-message',
    loadChildren: () => import('../step-validation-message/step-validation-message.module').then((m) => m.StepValidationMessageModule),
  },
  {
    path: 'alumni-follow-up',
    loadChildren: () => import('../alumni/alumni.module').then((m) => m.AlumniModule),
  },
  {
    path: 'alumni-cards',
    loadChildren: () => import('../alumni-file/alumni-file.module').then((m) => m.AlumniFileModule),
  },
  {
    path: 'candidate-file',
    loadChildren: () => import('../candidate-file/candidate-file.module').then((m) => m.CandidateFileModule),
  },
  { path: 'candidates', loadChildren: () => import('../candidates/candidates.module').then((m) => m.CandidatesModule) },
  { path: 'candidates-fc', loadChildren: () => import('../candidate-fc/candidates-fc.module').then((m) => m.CandidatesFcModule) },
  {
    path: 'contract-follow-up',
    loadChildren: () => import('../follow-up-contract/follow-up-contract.module').then((m) => m.FollowUpContractModule),
  },
  { path: 'workProgress', loadChildren: () => import('../work-progress/work-progress.module').then((m) => m.WorkProgressModule) },

  { path: 'notifications', loadChildren: () => import('../history/history.module').then((m) => m.HistoryModule) },
  { path: 'tutorial', loadChildren: () => import('../tutorial/tutorial.module').then((m) => m.TutorialModule) },
  { path: 'tutorial-app', loadChildren: () => import('../tutorial-app/tutorial-app.module').then((m) => m.TutorialAppModule) },
  { path: 'studentDetail', loadChildren: () => import('../student-detail/student-detail.module').then((m) => m.StudentDetailModule) },
  { path: 'task', loadChildren: () => import('../task/task.module').then((m) => m.TaskModule) },
  { path: 'mailbox', loadChildren: () => import('../mailbox/mailbox.module').then((m) => m.MailboxModule) },
  { path: 'tutorial-app', loadChildren: () => import('../tutorial-app/tutorial-app.module').then((m) => m.TutorialAppModule) },
  { path: 'ideas', loadChildren: () => import('../ideas/ideas.module').then((m) => m.IdeasModule) },
  { path: 'about', loadChildren: () => import('../version/version.module').then((m) => m.VersionModule) },
  {
    path: 'companies',
    loadChildren: () => import('../companies/companies.module').then((m) => m.CompaniesModule),
  },
  { path: 'my-file', loadChildren: () => import('../myfile/myfile.module').then((m) => m.MyfileModule) },
  { path: 'students-card', loadChildren: () => import('../students-company/students-company.module').then((m) => m.StudentsCompanyModule) },
  { path: 'students-table', loadChildren: () => import('../students-table/students-table.module').then((m) => m.StudentsTableModule) },
  {
    path: 'all-students',
    loadChildren: () => import('../all-students-table/all-students-table.module').then((m) => m.AllStudentsTableModule),
  },
  {
    path: 'students-trombinoscope',
    loadChildren: () => import('../student-trombinoscope/student-trombinoscope.module').then((m) => m.StudentTrombinoscopeModule),
  },
  { path: 'promo', loadChildren: () => import('../auto-promo/auto-promo.module').then((m) => m.AutoPromoModule) },
  {
    path: 'my-internships',
    loadChildren: () => import('../internship/student-internship/student-internship.module').then((m) => m.StudentInternshipModule),
  },
  { path: 'internship', loadChildren: () => import('../internship/internship.module').then((m) => m.InternshipModule) },
  { path: 'internship-file', loadChildren: () => import('../internship-file/internship-file.module').then((m) => m.InternshipFileModule) },
  { path: 'finance-follow-up', loadChildren: () => import('../finance/finance.module').then((m) => m.FinanceModule) },
  {
    path: 'finance-follow-up-organization',
    loadChildren: () => import('../finance-organization/finance-organization.module').then((m) => m.FinanceOrganizationModule),
  },
  {
    path: 'unbalanced-balance',
    loadChildren: () => import('../unbalanced-balance/unbalanced-balance.module').then((m) => m.UnbalancedBalanceModule),
  },
  {
    path: 'operation-lines',
    loadChildren: () => import('../operation-lines-parent/operation-lines-parent.module').then((m) => m.OperationLinesParentModule),
  },
  { path: 'finance-history', loadChildren: () => import('../finance-history/finance-history.module').then((m) => m.FinanceHistoryModule) },
  { path: 'finance-import', loadChildren: () => import('../finance-import/finance-import.module').then((m) => m.FinanceImportModule) },
  {
    path: 'dashboard-finance',
    loadChildren: () => import('../dashboard-finance/dashboard-finance.module').then((m) => m.DashboardFinanceModule),
  },
  {
    path: 'dashboard-cash-flow',
    loadChildren: () => import('../dashboard-cash-flow/dashboard-cash-flow.module').then((m) => m.DashboardCashFlowModule),
  },
  {
    path: 'dashboard-payment',
    loadChildren: () => import('../dashboard-payment/dashboard-payment.module').then((m) => m.DashboardPaymentModule),
  },
  {
    path: 'oscar-campus',
    loadChildren: () => import('../oscar-campus/oscar-campus.module').then((m) => m.OscarCampusModule),
  },
  {
    path: 'hubspot',
    loadChildren: () => import('../hubspot-crm/hubspot-crm.module').then((m) => m.HubspotCrmModule),
  },
  {
    path: 'teacher-contract',
    loadChildren: () => import('../teacher-contract/teacher-contract.module').then((m) => m.TeacherContractModule),
  },
  { path: 'users', loadChildren: () => import('../user-management/user-management.module').then((m) => m.UserManagementModule) },
  {
    path: 'form-builder',
    loadChildren: () => import('../form-builder/form-builder.module').then((m) => m.FormBuilderModule),
  },
  {
    path: 'document-builder',
    loadChildren: () => import('../documents/documents.module').then((m) => m.DocumentsModule),
  },
  {
    path: 'notification-management',
    loadChildren: () => import('../notification-management/notification-management.module').then((m) => m.NotificationManagementModule),
  },
  {
    path: 'user-permission',
    loadChildren: () => import('../user-permission/user-permission.module').then((m) => m.UserPermissionModule),
  },
  {
    path: 'organization',
    loadChildren: () => import('../companies/organization/organization.module').then((m) => m.OrganizationModule),
  },
  {
    path: 'form-builder',
    loadChildren: () => import('../form-builder/form-builder.module').then((m) => m.FormBuilderModule),
  },
  // intakeChannelv2
  {
    path: 'site',
    loadChildren: () => import('../intake-channel/site/site.module').then((m) => m.SiteModule),
  },
  {
    path: 'campus',
    loadChildren: () => import('../intake-channel/campus/campus.module').then((m) => m.CampusModule),
  },
  {
    path: 'schools',
    loadChildren: () => import('../intake-channel/school/school.module').then((m) => m.SchoolModule),
  },
  {
    path: 'speciality',
    loadChildren: () => import('../intake-channel/speciality/speciality.module').then((m) => m.SpecialityModule),
  },
  {
    path: 'sector',
    loadChildren: () => import('../intake-channel/sector/sector.module').then((m) => m.SectorModule),
  },
  {
    path: 'scholar-season',
    loadChildren: () => import('../intake-channel/scholar-season/scholar-season.module').then((m) => m.ScholarSeasonModule),
  },
  {
    path: 'level',
    loadChildren: () => import('../intake-channel/level/level.module').then((m) => m.LevelModule),
  },
  {
    path: 'settings',
    loadChildren: () => import('../intake-channel/settings/settings.module').then((m) => m.SettingsModule),
  },
  {
    path: 'teacher-management',
    loadChildren: () => import('../teacher-management/teacher-management.module').then((m) => m.TeacherManagementModule),
  },
  {
    path: 'template-sequences',
    loadChildren: () => import('../courses-sequences/template/template.module').then((m) => m.TemplateSequenceModule),
  },
  {
    path: 'sequences',
    loadChildren: () => import('../courses-sequences/sequence-table/sequence-table.module').then((m) => m.SequenceTableModule),
  },
  {
    path: 'modules',
    loadChildren: () => import('../courses-sequences/module-table/module-table.module').then((m) => m.ModuleTableModule),
  },
  {
    path: 'subjects',
    loadChildren: () => import('../courses-sequences/subject-table/subject-table.module').then((m) => m.SubjectTableModule),
  },
  {
    path: 'assignment',
    loadChildren: () =>
      import('../re-admissions/assignment-readmission/assignment-readmission.module').then((m) => m.AssignmentReadmissionModule),
  },
  {
    path: 'follow-up',
    loadChildren: () =>
      import('../re-admissions/follow-up-readmission/follow-up-readmission.module').then((m) => m.FollowUpReadmissionModule),
  },
  {
    path: 'form-follow-up',
    loadChildren: () => import('../form-follow-up/form-follow-up.module').then((m) => m.FormFollowUpModule),
  },
  {
    path: 'country-nationality',
    loadChildren: () => import('../country-nationality/country-nationality.module').then((m) => m.CountryNationalityModule),
  },
  {
    path: 'export-downloader',
    loadChildren: () => import('../export-downloader/export-downloader.module').then((m) => m.ExportDownloaderModule),
  },
  {
    path: 'news',
    loadChildren: () =>
      import('../news/news.module').then(
        (m) => m.NewsModule),
  },
];

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [...menuRoutes],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
