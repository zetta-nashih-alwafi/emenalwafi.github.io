import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CandidatesComponent } from './candidates/candidates.component';
import { PermissionGuard } from 'app/service/guard/auth.guard';


export const routes: Routes = [
  {
    path: '',
    component: CandidatesComponent,
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
export class CandidatesRoutingModule {}
