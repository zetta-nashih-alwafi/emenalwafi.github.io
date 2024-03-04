import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { StudentTrombinoscopeParentComponent } from './student-trombinoscope-parent.component';


const routes: Routes = [
  {
    path: '',
    component: StudentTrombinoscopeParentComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'students.trombinoscope.show_perm',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentTrombinoscopeRoutingModule { }
