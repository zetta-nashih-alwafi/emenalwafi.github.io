import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinanceImportRoutingModule } from './finance-import-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { FinanceImportComponent } from './finance-import.component';
import { FinanceImportImportPaymentComponent } from './finance-import-import-payment/finance-import-import-payment.component';
import { FinanceImportSecondStepTableComponent } from './finance-import-second-step-table/finance-import-second-step-table.component';
import { FinanceImportThirdStepTableComponent } from './finance-import-third-step-table/finance-import-third-step-table.component';
import { FinanceImportFourthStepTableComponent } from './finance-import-fourth-step-table/finance-import-fourth-step-table.component';
import { FinanceImportFifthStepTableComponent } from './finance-import-fifth-step-table/finance-import-fifth-step-table.component';


@NgModule({
  declarations: [
    FinanceImportComponent,
    FinanceImportImportPaymentComponent,
    FinanceImportSecondStepTableComponent,
    FinanceImportThirdStepTableComponent,
    FinanceImportFourthStepTableComponent,
    FinanceImportFifthStepTableComponent
  ],
  imports: [
    CommonModule,
    FinanceImportRoutingModule,
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
export class FinanceImportModule { }
