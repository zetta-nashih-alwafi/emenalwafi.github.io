import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

export const DashboardRoutes: Routes = [
   {
      path: '',
      component: DashboardComponent,
      data: {
         permission: 'candidate_dashboard.show_perm'
       },
   },
];
