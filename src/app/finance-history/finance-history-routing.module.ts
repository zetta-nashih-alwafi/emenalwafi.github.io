import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { FinanceHistoryComponent } from './finance-history/finance-history.component';


export const routes: Routes = [
  {
    path: '',
    component: FinanceHistoryComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'finance.history.show_perm'
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
export class FinanceHistoryRoutingModule {}
