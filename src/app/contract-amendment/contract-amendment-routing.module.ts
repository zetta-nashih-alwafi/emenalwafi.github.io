import { ContractAmendmentComponent } from './contract-amendment.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  {
     path: '', component:ContractAmendmentComponent
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractAmendmentRoutingModule { }
