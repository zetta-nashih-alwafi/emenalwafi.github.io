import { PermissionGuard } from './../service/guard/auth.guard';
import { AllStudentsTableComponent } from './all-students-table.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VisaDocumentFormComponent } from './visa-document-form/visa-document-form.component';

const routes: Routes = [
  {
    path: '',
    component: AllStudentsTableComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'students.all_students.show_perm'
    },

  },
  {
    path: ':formId',
    component: VisaDocumentFormComponent,
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllStudentsTableRoutingModule { }
