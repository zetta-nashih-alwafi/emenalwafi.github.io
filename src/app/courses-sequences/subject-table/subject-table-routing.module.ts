import { PermissionGuard } from 'app/service/guard/auth.guard';
import { SubjectTableComponent } from './subject-table.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    component: SubjectTableComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'courses_sequences.subject.show_perm'
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
export class SubjectTableRoutingModule { }
