import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SharedModule } from 'app/shared/shared.module';
import { OrganizationDetailRoutingModule } from './organization-detail-routing.module';
import { OrganizationDetailComponent } from './organization-detail.component';
import { OrganizationDetailListComponent } from './organization-detail-list/organization-detail-list.component';
import { OrganizationDetailCardComponent } from './organization-detail-card/organization-detail-card.component';
import { OrganizationDetailContactComponent } from './organization-detail-tab/organization-detail-contact/organization-detail-contact.component';
import { OrganizationDetailFormComponent } from './organization-detail-tab/organization-detail-form/organization-detail-form.component';
import { OrganizationDetailTabComponent } from './organization-detail-tab/organization-detail-tab.component';

@NgModule({
  declarations: [
    OrganizationDetailComponent,
    OrganizationDetailListComponent,
    OrganizationDetailCardComponent,
    OrganizationDetailTabComponent,
    OrganizationDetailFormComponent,
    OrganizationDetailContactComponent,
  ],
  imports: [SharedModule, CKEditorModule, CommonModule, OrganizationDetailRoutingModule, NgSelectModule, SweetAlert2Module.forRoot()],
  providers: [DatePipe],
})
export class OrganizationDetailModule {}
