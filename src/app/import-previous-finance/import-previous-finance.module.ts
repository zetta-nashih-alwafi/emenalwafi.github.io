import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { ImportPreviousRoutingModule } from './import-previous-finance-routing.module';
import { ImportPreviousFinanceComponent } from './import-previous-finance/import-previous-finance.component';

@NgModule({
  declarations: [
    ImportPreviousFinanceComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ImportPreviousRoutingModule,
    SweetAlert2Module.forRoot(),
    NgSelectModule
  ],
})
export class ImportPreviousFinanceModule { }
