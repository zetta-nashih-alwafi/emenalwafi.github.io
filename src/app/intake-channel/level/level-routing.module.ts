import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { LevelComponent } from './level.component';

export const routes: Routes = [
  {
    path: '',
    component: LevelComponent,
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
export class LevelRoutingModule {}
