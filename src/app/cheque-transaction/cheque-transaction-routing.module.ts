import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanExitService } from 'app/service/exit-guard/can-exit.service';
import { ChequeTransactionComponent } from './cheque-transaction.component';


const routes: Routes = [
  {
    path: '',
    component: ChequeTransactionComponent,
    canDeactivate: [CanExitService],
 },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChequeTransactionRoutingModule { }
