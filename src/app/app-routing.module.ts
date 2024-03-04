import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { PermissionGuard } from './service/guard/auth.guard';


const appRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'internship', redirectTo: 'internship/follow-up', pathMatch: 'full' },
  // { path: 'my-internships', redirectTo: 'my-internships', pathMatch: 'full' },
  { path: 'companies-internship', redirectTo: 'companies-internship/entities', pathMatch: 'full' },
  {
    path: 'session',
    loadChildren: () => import('./session/session.module').then((m) => m.SessionModule),
  },
  {
    path: 'admission-diploma',
    loadChildren: () => import('./admission-diploma/admission-diploma.module').then((m) => m.AdmissionDiplomaModule),
  },
  {
    path: 'form-filling',
    loadChildren: () => import('./form-filling/form-filling.module').then((m) => m.FormFillingModule),
  },
  {
    path: 'form-fill',
    loadChildren: () => import('./form-filling/form-filling.module').then((m) => m.FormFillingModule),
  },
  {
    path: 'job-offer-creation',
    loadChildren: () => import('./job-offer-creation/job-offer-creation.module').then((m) => m.JobOfferModule),
  },
  {
    path: 'company-creation',
    loadChildren: () => import('./company-creation/company-creation.module').then((m) => m.CompanyCreationModule),
  },
  {
    path: 'student-profile-internship',
    loadChildren: () =>
      import('./student-profile-internship/student-profile-internship.module').then((m) => m.StudentProfileInternshipModule),
  },
  {
    path: 'internship-agreement',
    loadChildren: () => import('./internship-aggrement/internship-aggrement.module').then((m) => m.InternshipAggrementModule),
  },
  {
    path: 'form-teacher-contract',
    loadChildren: () => import('./teacher-contract/pre-contract-form/pre-contract-form.module').then((m) => m.PreContractFormModule),
  },
  {
    path: 'form-continuous',
    loadChildren: () => import('./old-form-redirect/old-form-redirect.module').then((m) => m.OldFormRedirectModule),
  },
  {
    path: 'form-survey',
    loadChildren: () => import('./form-filling/form-filling.module').then((m) => m.FormFillingModule),
  },
  {
    path: 'form-fc-contract',
    loadChildren: () => import('./teacher-contract/pre-contract-form/pre-contract-form.module').then((m) => m.PreContractFormModule),
  },
  {
    path: 'financial',
    loadChildren: () => import('./term-payment/term-payment.module').then((m) => m.TermPaymentModule),
  },
  {
    path: 'term-payment',
    loadChildren: () => import('./term-payment/term-payment.module').then((m) => m.TermPaymentModule),
  },
  {
    path: 'special-form',
    loadChildren: () => import('./term-payment/term-payment.module').then((m) => m.TermPaymentModule),
  },
  {
    path: 'modality-form',
    loadChildren: () => import('./modality-form/modality-form.module').then((m) => m.ModalityFormModule),
  },
  {
    path: 'teacher-form',
    loadChildren: () => import('./teacher-management/teacher-management.module').then((m) => m.TeacherManagementModule),
  },
  {
    path: 'visa-form',
    loadChildren: () => import('./all-students-table/all-students-table.module').then((m) => m.AllStudentsTableModule),
  },
  {
    path: '',
    loadChildren: () => import('./main/main.module').then(m => m.MainModule),
    canActivate: [PermissionGuard],
    runGuardsAndResolvers: 'always'
  },
  // {
  //   path: 'horizontal',
  //   component: HorizontalLayoutComponent,
  //   canActivate: [PermissionGuard],
  //   runGuardsAndResolvers: 'always',
  //   children: [...menuRoutes],
  // },
  { path: 'certification', redirectTo: 'jury-organization', pathMatch: 'full' },
  { path: 'parameters', redirectTo: 'title-rncp', pathMatch: 'full' },
  { path: 'history', redirectTo: 'notifications', pathMatch: 'full' },
  { path: 'process', redirectTo: 'form-builder', pathMatch: 'full' },
  { path: 're-admission', redirectTo: 'assignment', pathMatch: 'full' },
  { path: 'messages', redirectTo: 'alert-functionality', pathMatch: 'full' },
  { path: 'teacher-contract', redirectTo: 'teacher-contract/contract-management', pathMatch: 'full' },
  { path: '404', redirectTo: 'workProgress', pathMatch: 'full' },
  { path: '**', redirectTo: 'rncpTitles', pathMatch: 'full' },
  { path: '404', redirectTo: 'workProgress', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
  providers: [],
})
export class RoutingModule {}
