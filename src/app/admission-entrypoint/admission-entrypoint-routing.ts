import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanExitService } from 'app/service/exit-guard/can-exit.service';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { AdmissionEntrypointTabGroupComponent } from './admission-entrypoint-tab-group.component';
import { ScholarCardComponent } from './scholar-card/scholar-card.component';

export const routes: Routes = [
  {
    path: '',
    component: ScholarCardComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'intake_channel.show_perm',
    },
  },
  {
    path: 'admission-entrypoint',
    canDeactivate: [CanExitService],
    canActivate: [PermissionGuard],
    component: AdmissionEntrypointTabGroupComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdmissionEntrypointRoutingModule {}
