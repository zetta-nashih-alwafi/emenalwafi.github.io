import { Routes } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { DashboardCashFlowComponent } from './dashboard-cash-flow/dashboard-cash-flow.component';

export const DashboardCashFlowRoutes: Routes = [
   {
      path: '',
      component: DashboardCashFlowComponent,
      canActivate: [PermissionGuard],
      data: {
        permission: 'candidate_dashboard.show_perm'
      },
   },
];
