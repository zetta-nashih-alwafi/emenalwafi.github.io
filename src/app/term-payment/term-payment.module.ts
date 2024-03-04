import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from 'app/shared/shared.module';
import { WidgetComponentModule } from 'app/widget-component/widget-component.module';
import { PaymentInformationFormComponent } from './payment-information-form/payment-information-form.component';
import { TermPaymentFormComponent } from './term-payment-form/term-payment-form.component';
import { TermPaymentRoutingModule } from './term-payment-routing.module';
import { TermPaymentComponent } from './term-payment.component';
import { SpecialModalityFormComponent } from './special-modality-form/special-modality-form.component';

@NgModule({
  declarations: [TermPaymentComponent, TermPaymentFormComponent, PaymentInformationFormComponent, SpecialModalityFormComponent],
  imports: [CommonModule, SharedModule, WidgetComponentModule, TermPaymentRoutingModule, SweetAlert2Module.forRoot()],
})
export class TermPaymentModule {}
