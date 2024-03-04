import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { AssignmentReadmissionComponent } from './assignment-readmission.component';


const routes: Routes = [
  {
    path: '',
    component: AssignmentReadmissionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssignmentReadmissionRoutingModule { }
