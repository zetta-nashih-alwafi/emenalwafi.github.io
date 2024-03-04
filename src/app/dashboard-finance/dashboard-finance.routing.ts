import { Routes } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { DashboardFinanceComponent } from './dashboard-finance/dashboard-finance.component';

export const DashboardFinanceRoutes: Routes = [
   {
      path: '',
      component: DashboardFinanceComponent,
      canActivate: [PermissionGuard],
      data: {
        permission: 'candidate_dashboard.show_perm'
      },
   },
];
