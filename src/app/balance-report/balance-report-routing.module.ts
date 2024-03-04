import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { BalanceReportComponent } from './balance-report.component';
import { PayoutDetailsComponent } from './payout-details/payout-details-details.component';

export const routes: Routes = [
  {
    path: '',
    component: BalanceReportComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'finance.balance_report.show_perm',
    },
  },
  {
    path: 'payout-detail',
    component: PayoutDetailsComponent
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
export class BalanceReportRoutingModule {}
