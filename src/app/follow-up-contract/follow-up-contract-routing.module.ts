import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { FollowUpContractComponent } from './follow-up-contract/follow-up-contract.component';


export const routes: Routes = [
  {
    path: '',
    component: FollowUpContractComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'candidate.show_perm'
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
export class FollowUpContractRoutingModule {}
