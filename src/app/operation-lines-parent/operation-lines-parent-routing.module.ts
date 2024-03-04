import { PermissionGuard } from './../service/guard/auth.guard';
import { OperationLinesParentComponent } from './operation-lines-parent.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: OperationLinesParentComponent,
    canActivate: [PermissionGuard],
    data: {},
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
export class OperationLinesParentRoutingModule { }
