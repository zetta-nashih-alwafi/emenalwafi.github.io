import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TermPaymentComponent } from './term-payment.component';

const routes: Routes = [
  { path: '', component: TermPaymentComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TermPaymentRoutingModule {}
