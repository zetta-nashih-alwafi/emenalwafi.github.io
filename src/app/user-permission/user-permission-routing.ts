import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanExitService } from 'app/service/exit-guard/can-exit.service';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { UserPermissionComponent } from './user-permission.component';

export const routes: Routes = [
  {
    path: '',
    component: UserPermissionComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'intake_channel.show_perm',
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserPermissionRoutingModule {}
