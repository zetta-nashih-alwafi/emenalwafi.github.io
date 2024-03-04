import { SharedModule } from 'app/shared/shared.module';
import { WidgetComponentModule } from 'app/widget-component/widget-component.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContractAmendmentRoutingModule } from './contract-amendment-routing.module';
import { ContractAmendmentComponent } from './contract-amendment.component';
import { ContractAmendmentFormComponent } from './contract-amendment-form/contract-amendment-form.component';


@NgModule({
  declarations: [
    ContractAmendmentComponent,
    ContractAmendmentFormComponent
  ],
  imports: [
    CommonModule,
    ContractAmendmentRoutingModule,
    WidgetComponentModule,
    SharedModule
  ]
})
export class ContractAmendmentModule { }
