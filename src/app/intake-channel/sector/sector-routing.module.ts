import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { SectorComponent } from './sector.component';

export const routes: Routes = [
  {
    path: '',
    component: SectorComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'intake_channel.show_perm'
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
export class SectorRoutingModule {}
