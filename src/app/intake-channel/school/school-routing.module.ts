import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { SchoolDetailComponent } from './school-detail/school-detail.component';
import { SchoolScholarSeasonComponent } from './school-scholar-season/school-scholar-season.component';
import { TeacherManagementAssignTableComponent } from './school-scholar-season/teacher-management-assign-table/teacher-management-assign-table.component';
import { SchoolComponent } from './school.component';

export const routes: Routes = [
  {
    path: '',
    component: SchoolComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'intake_channel.school.show_perm'
    },
  },
  {
    path: 'school-detail',
    canActivate: [PermissionGuard],
    data: {
      permission: 'intake_channel.school.show_perm'
    },
    children:[
      {path: '', component: SchoolScholarSeasonComponent},
      {path: ':id', component: SchoolScholarSeasonComponent},
    ]
  },
  {
    path: 'teachers',
    children:[
      {path: 'assign-teachers', component: TeacherManagementAssignTableComponent},
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchoolRoutingModule {}
