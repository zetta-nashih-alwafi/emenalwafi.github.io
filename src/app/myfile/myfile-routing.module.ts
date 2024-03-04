import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyFileDetailComponent } from './my-file-detail.component';
import { PermissionGuard } from 'app/service/guard/auth.guard';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: MyFileDetailComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'my_file.show_perm'
      // permission: {
      //   only: [
      //     'Student'
      //   ]
      // },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyfileRoutingModule { }
