import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FinanceImportComponent } from './finance-import.component';


const routes: Routes = [
  {
    path: '',
    component: FinanceImportComponent,
 },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceImportRoutingModule { }
