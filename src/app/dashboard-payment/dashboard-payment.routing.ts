import { Routes } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { DashboardPaymentComponent } from './dashboard-payment/dashboard-payment.component';

export const DashboardPaymentRoutes: Routes = [
   {
      path: '',
      component: DashboardPaymentComponent,
      canActivate: [PermissionGuard],
      data: {
        permission: 'candidate_dashboard.show_perm'
      },
   },
];
