import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationComponent } from './organization.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SharedModule } from 'app/shared/shared.module';
import { OrganizationRoutingModule } from './organization-routing.module';

@NgModule({
  declarations: [OrganizationComponent],
  imports: [SharedModule, CKEditorModule, CommonModule, OrganizationRoutingModule, NgSelectModule, SweetAlert2Module.forRoot()],
})
export class OrganizationModule {}
