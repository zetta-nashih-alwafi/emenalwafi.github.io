import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContractManagementTableComponent } from './contract-management-table/contract-management-table.component';
import { ContractProcessFormComponent } from './contract-process-form/contract-process-form.component';
import { CanExitService } from 'app/service/exit-guard/can-exit.service';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'contract-management',
  },
  {
    path: 'contract-management',
    pathMatch: 'full',
    component: ContractManagementTableComponent,
  },
  {
    path: 'contract-process',
    pathMatch: 'full',
    children: [
      { path: '', pathMatch: 'full', component: ContractProcessFormComponent, canDeactivate: [CanExitService] },
      { path: ':id', pathMatch: 'full', component: ContractProcessFormComponent, canDeactivate: [CanExitService] },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeacherContractRoutingModule {}
