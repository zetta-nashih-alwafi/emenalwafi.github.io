import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { ImportFinanceComponent } from './import-finance/import-finance.component';
import { ImportFinanceRoutingModule } from './import-finance-routing.module';

@NgModule({
  declarations: [
    ImportFinanceComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ImportFinanceRoutingModule,
    SweetAlert2Module.forRoot(),
    NgSelectModule
  ],
})
export class ImportFinanceModule { }
