import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CandidateFileComponent } from './candidate-file/candidate-file.component';
import { PermissionGuard } from 'app/service/guard/auth.guard';


export const routes: Routes = [
  {
    path: '',
    component: CandidateFileComponent,
    canActivate: [PermissionGuard],
    data: {
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
export class CandidateFileRoutingModule {}
