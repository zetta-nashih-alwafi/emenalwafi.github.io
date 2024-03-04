import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FollowUpReadmissionComponent } from './follow-up-readmission.component';


const routes: Routes = [
  {
    path: '',
    component: FollowUpReadmissionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FollowUpReadmissionRoutingModule { }
