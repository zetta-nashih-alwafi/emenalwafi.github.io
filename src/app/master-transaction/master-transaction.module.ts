import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MasterTransactiontComponent } from './master-transaction.component';
import { MasterTransactiontRoutingModule } from './master-transaction-routing.module';
import { DetailTransactionMasterDialogComponent } from './detail-transaction-master-dialog/detail-transaction-master-dialog.component';

@NgModule({
  declarations: [MasterTransactiontComponent, DetailTransactionMasterDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    MasterTransactiontRoutingModule,
    NgxMaterialTimepickerModule,
    SweetAlert2Module.forRoot(),
    NgSelectModule,
  ],
})
export class MasterTransactionModule {}
