import { PermissionGuard } from './../service/guard/auth.guard';
import { UnbalancedBalanceComponent } from './unbalanced-balance.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: UnbalancedBalanceComponent,
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
export class UnbalancedBalanceRoutingModule { }
