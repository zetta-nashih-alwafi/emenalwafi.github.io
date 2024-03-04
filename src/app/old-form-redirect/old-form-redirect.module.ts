import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OldFormRedirectRoutingModule } from './old-form-redirect-routing.module';
import { FormRedirectComponent } from './form-redirect/form-redirect.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
  declarations: [FormRedirectComponent],
  imports: [
    CommonModule,
    OldFormRedirectRoutingModule,
    MatProgressSpinnerModule
  ]
})
export class OldFormRedirectModule { }
