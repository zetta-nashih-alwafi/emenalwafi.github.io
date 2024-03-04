import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { InternshipFileComponent } from './internship-file/internship-file.component';

export const routes: Routes = [
  {
    path: '',
    component: InternshipFileComponent,
    canActivate: [PermissionGuard],
    data: {
      // permission: 'ticket.ticket_table.show_perm',
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
export class InternshipFileRoutingModule {}
