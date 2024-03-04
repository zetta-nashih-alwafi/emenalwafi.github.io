import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanExitService } from 'app/service/exit-guard/can-exit.service';
import { NotificationDetailsComponent } from './notification-details/notification-details.component';
import { NotificationManagementTableComponent } from './notification-management-table.component';

const routes: Routes = [
  {
    path: '',
    component: NotificationManagementTableComponent,
  },
  {
    path: 'notification-detail',
    canDeactivate: [CanExitService],
    component: NotificationDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationManagementRoutingModule {}
