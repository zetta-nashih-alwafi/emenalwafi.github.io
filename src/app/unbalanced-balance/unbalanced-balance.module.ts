import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SharedModule } from 'app/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnbalancedBalanceRoutingModule } from './unbalanced-balance-routing.module';
import { UnbalancedBalanceComponent } from './unbalanced-balance.component';


@NgModule({
  declarations: [
    UnbalancedBalanceComponent,
  ],
  imports: [
    CommonModule,
    UnbalancedBalanceRoutingModule,
    SharedModule,
    SweetAlert2Module.forRoot(),
    NgSelectModule
  ]
})
export class UnbalancedBalanceModule { }
