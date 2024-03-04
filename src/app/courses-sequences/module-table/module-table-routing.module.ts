import { ModuleTableComponent } from './module-table.component';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    component: ModuleTableComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'courses_sequences.module.show_perm'
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
export class ModuleTableRoutingModule { }
