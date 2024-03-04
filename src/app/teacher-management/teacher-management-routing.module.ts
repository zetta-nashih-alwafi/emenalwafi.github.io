import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { TeacherManagementFollowUpComponent } from './teacher-management-follow-up/teacher-management-follow-up.component';
import { TeacherManagementTableComponent } from './teacher-management-table/teacher-management-table.component';
import { TeacherRequiredDocumentFormComponent } from './teacher-required-document-form/teacher-required-document-form.component';
import { AddInterventionFormComponent } from './teacher-management-follow-up/add-intervention-form/add-intervention-form.component';

const routes: Routes = [
  {
    path: 'follow-up',
    pathMatch: 'full',
    component: TeacherManagementFollowUpComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'teacher_management.teacher_follow_up.show_perm',
    },
  },
  {
    path: 'teachers',
    pathMatch: 'full',
    component: TeacherManagementTableComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'teacher_management.teachers_table.show_perm',
    },
  },
  {
    path: 'intervention-form',
    pathMatch: 'full',
    component: AddInterventionFormComponent,
    canActivate: [PermissionGuard],      
    data: {
      permission: 'teacher_management.teachers_table.show_perm',
    },
  }, 
  {
    path: ':formId',
    component: TeacherRequiredDocumentFormComponent,
    pathMatch: 'full',
  },
  { path: '', redirectTo: 'follow-up', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeacherManagementRoutingModule {}
