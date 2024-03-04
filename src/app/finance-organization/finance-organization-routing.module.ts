import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { FinanceOrganizationComponent } from './finance-organization/finance-organization.component';


const routes: Routes = [
  {
    path: '',
    component: FinanceOrganizationComponent,
    canActivate: [PermissionGuard],
    data: {},
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
export class FinanceOrganizationRoutingModule { }
