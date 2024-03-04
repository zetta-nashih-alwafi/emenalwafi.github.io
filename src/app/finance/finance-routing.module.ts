import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { FinanceTableComponent } from './finance-table/finance-table.component';


const routes: Routes = [
  {
    path: '',
    component: FinanceTableComponent,
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
export class FinanceRoutingModule { }
