import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { FormDetailTableComponent } from './form-detail-table/form-detail-table.component';
import { AdmissionDocumentFollowUpComponent } from './admission-document-follow-up/admission-document-follow-up.component';
import { GeneralFormFollowUpComponent } from './general-form-follow-up/general-form-follow-up.component';

const routes: Routes = [
  { path: '', redirectTo: 'general-form-follow-up', pathMatch: 'full' },
  {
    path: 'general-form-follow-up',
    component: GeneralFormFollowUpComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'form_follow_up.general_form_follow_up.show_perm',
    },
  },
  {
    path: 'details/:formId',
    component: FormDetailTableComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'form_follow_up.show_perm',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormFollowUpRoutingModule {}
