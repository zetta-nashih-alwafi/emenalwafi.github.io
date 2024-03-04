import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { MasterTransactiontComponent } from './master-transaction.component';

export const routes: Routes = [
  {
    path: '',
    component: MasterTransactiontComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'finance.master_table_transaction.show_perm',
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
export class MasterTransactiontRoutingModule {}
