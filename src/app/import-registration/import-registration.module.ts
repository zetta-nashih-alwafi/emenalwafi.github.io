import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ImportRegistrationComponent } from './import-registration/import-registration.component';
import { ImportRegisterRoutingModule } from './import-registration-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    ImportRegistrationComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ImportRegisterRoutingModule,
    SweetAlert2Module.forRoot(),
    NgSelectModule
  ],
})
export class ImportRegisterModule { }
