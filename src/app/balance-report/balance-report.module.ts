import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalanceReportComponent } from './balance-report.component';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { BalanceReportRoutingModule } from './balance-report-routing.module';
import { PayoutDetailsComponent } from './payout-details/payout-details-details.component';
import { ExportPayoutDialogComponent } from './export-payout-dialog/export-payout-dialog.component';

@NgModule({
  declarations: [BalanceReportComponent, PayoutDetailsComponent, ExportPayoutDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    BalanceReportRoutingModule,
    NgxMaterialTimepickerModule,
    SweetAlert2Module.forRoot(),
    NgSelectModule,
  ],
})
export class BalanceReportModule {}
