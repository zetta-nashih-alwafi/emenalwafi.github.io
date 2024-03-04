import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PreContractFormComponent } from './pre-contract-form.component';


const routes: Routes = [
  {
    path: '',
    component: PreContractFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreContractFormRoutingModule { }
