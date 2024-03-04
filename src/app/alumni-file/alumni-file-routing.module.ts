import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AlumniFileComponent } from './alumni-file/alumni-file.component';
import { PermissionGuard } from 'app/service/guard/auth.guard';


export const routes: Routes = [
  {
    path: '',
    component: AlumniFileComponent,
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
export class AlumniFileRoutingModule {}
