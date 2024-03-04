import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { StudentsTableComponent } from './students-table.component';

const routes: Routes = [
  {
    path: '',
    component: StudentsTableComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'students.follow_up.show_perm',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentsTableRoutingModule {}
