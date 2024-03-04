import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserManagementDetailComponent } from './user-management-detail/user-management-detail.component';
import { UserManagementTableComponent } from './user-management-table.component';


const routes: Routes = [
  {
    path: '',
    component: UserManagementTableComponent,
  },
  {
    path: 'user-list',
    component: UserManagementDetailComponent
  },
  {
    path: 'teacher-list',
    component: UserManagementDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
