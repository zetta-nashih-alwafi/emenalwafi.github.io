import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { CandidatesFcTableComponent } from './candidates-fc-table/candidates-fc-table.component';

const routes: Routes = [
  {
    path: '',
    component: CandidatesFcTableComponent,
    canActivate: [PermissionGuard],
    data: {
      // permission: 'candidate.follow_up_continuous.show_perm',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CandidatesFcRoutingModule {}
