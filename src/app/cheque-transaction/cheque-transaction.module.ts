import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ChequeTransactionComponent } from './cheque-transaction.component';
import { ChequeTransactionRoutingModule } from './cheque-transaction-routing.module';
import { ConfirmationStepComponent } from './confirmation-step/confirmation-step.component';
import { ChequeToBankComponent } from './cheque-to-bank/cheque-to-bank.component';
import { ChequeEntityBankComponent } from './cheque-entity-bank/cheque-entity-bank.component';
import { ChequeDepositSlipComponent } from './cheque-deposit-slip/cheque-deposit-slip.component';


@NgModule({
  declarations: [
    ChequeTransactionComponent,
    ConfirmationStepComponent,
    ChequeToBankComponent,
    ChequeEntityBankComponent,
    ChequeDepositSlipComponent,
  ],
  imports: [
    CommonModule,
    ChequeTransactionRoutingModule,
    SharedModule,
    CKEditorModule,
    NgSelectModule,
    SweetAlert2Module.forRoot(),
  ],
  providers: [{
      provide: LOCALE_ID,
      useValue: 'fr-FR' // 'de-DE' for Germany, 'fr-FR' for France ...
    },
    {
      provide: LOCALE_ID,
      useValue: 'id-ID',
    },
    {
      provide: LOCALE_ID,
      useValue: 'es-ES',
    },
  ]
})
export class ChequeTransactionModule { }
