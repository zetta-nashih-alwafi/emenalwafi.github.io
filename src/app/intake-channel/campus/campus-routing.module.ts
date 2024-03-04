import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { CampusFormComponent } from './intake-campus-form/intake-campus-form.component';
import { CampusComponent } from './campus.component';

export const routes: Routes = [
  {
    path: '',
    component: CampusComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'intake_channel.show_perm'
    },
  },
  {
    path: 'campus-form', children: [
      {path: '', component: CampusFormComponent},
      {path: ':id', component: CampusFormComponent},
    ],
    canActivate: [PermissionGuard],
    data: {
      permission: 'intake_channel.show_perm'
    },
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
export class CampusRoutingModule {}
