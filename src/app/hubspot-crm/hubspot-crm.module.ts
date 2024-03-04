import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HubspotCrmComponent } from './hubspot-crm.component';
import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { HubspotCrmRoutingModule } from './hubspot-crm-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@NgModule({
  declarations: [HubspotCrmComponent],
  imports: [SharedModule, CKEditorModule, CommonModule, HubspotCrmRoutingModule, NgSelectModule, SweetAlert2Module.forRoot()],
})
export class HubspotCrmModule {}
