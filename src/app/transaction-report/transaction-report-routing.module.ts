import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { TransactionReportDetailsComponent } from './transaction-report-details/transaction-report-details.component';
import { TransactionReportComponent } from './transaction-report.component';

export const routes: Routes = [
  {
    path: '',
    component: TransactionReportComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'finance.transaction_report.show_perm',
    },
  },
  {
    path: 'detail',
    component: TransactionReportDetailsComponent
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
export class TransactionReportRoutingModule {}
