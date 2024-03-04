import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { TransactionReportRoutingModule } from './transaction-report-routing.module';
import { TransactionReportComponent } from './transaction-report.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { TransactionReportDetailsComponent } from './transaction-report-details/transaction-report-details.component';

@NgModule({
  declarations: [TransactionReportComponent, TransactionReportDetailsComponent],
  imports: [
    CommonModule,
    SharedModule,
    TransactionReportRoutingModule,
    NgxMaterialTimepickerModule,
    SweetAlert2Module.forRoot(),
    NgSelectModule,
  ],
})
export class TransactionReportModule {}
