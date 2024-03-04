import { Routes } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { DashboardRegisterComponent } from './dashboard-register/dashboard-register.component';

export const DashboardRegisterRoutes: Routes = [
   {
      path: '',
      component: DashboardRegisterComponent,
      canActivate: [PermissionGuard],
      data: {
        permission: 'candidate.candidate_dashboard.show_perm'
      },
   },
];
