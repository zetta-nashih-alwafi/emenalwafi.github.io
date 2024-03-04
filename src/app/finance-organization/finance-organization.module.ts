import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { FinanceOrganizationComponent } from './finance-organization/finance-organization.component';
import { FinanceOrganizationRoutingModule } from './finance-organization-routing.module';
import { AssignTimelineTemplateDialogComponent } from '../timeline-template/assign-timeline-template-dialog/assign-timeline-template-dialog.component';
import { AddPaymentOrganizationDialogComponent } from './finance-organization/add-payment-organization-dialog/add-payment-organization-dialog.component';
import { ChangePaymentOrganizationDialogComponent } from './finance-organization/change-payment-organization-dialog/change-payment-organization-dialog.component';

@NgModule({
  declarations: [
    FinanceOrganizationComponent,
    AddPaymentOrganizationDialogComponent,
    ChangePaymentOrganizationDialogComponent,
    AssignTimelineTemplateDialogComponent,
  ],
  imports: [
    CommonModule,
    FinanceOrganizationRoutingModule,
    SharedModule,
    CKEditorModule,
    NgSelectModule,
    SweetAlert2Module.forRoot(),

    NgxMaterialTimepickerModule,
  ],

  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'fr-FR',
    },
  ],
})
export class FinanceOrganizationModule {}
