import { PermissionGuard } from 'app/service/guard/auth.guard';
import { SequenceTableComponent } from './sequence-table.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


export const routes: Routes = [
  {
    path: '',
    component: SequenceTableComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'courses_sequences.sequence.show_perm'
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
  exports: [RouterModule]
})
export class SequenceTableRoutingModule { }
