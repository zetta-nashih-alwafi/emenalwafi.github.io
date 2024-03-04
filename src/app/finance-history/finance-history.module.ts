import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { FinanceHistoryRoutingModule } from './finance-history-routing.module';
import { FinanceHistoryComponent } from './finance-history/finance-history.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [FinanceHistoryComponent],
  imports: [
    CommonModule,
    SharedModule,
    NgSelectModule,

    NgxMaterialTimepickerModule,
    FinanceHistoryRoutingModule,
    SweetAlert2Module.forRoot(),
  ],

  providers: [DatePipe],
})
export class FinanceHistoryModule {}
