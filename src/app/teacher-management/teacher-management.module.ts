import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeacherManagementRoutingModule } from './teacher-management-routing.module';
import { TeacherManagementFollowUpComponent } from './teacher-management-follow-up/teacher-management-follow-up.component';
import { TeacherManagementTableComponent } from './teacher-management-table/teacher-management-table.component';
import { SharedModule } from 'app/shared/shared.module';
import { ImportTeacherDialogComponent } from './import-teacher-dialog/import-teacher-dialog.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { AskRequiredDocumentsDialogComponent } from './teacher-management-table/ask-required-documents-dialog/ask-required-documents-dialog.component';
import { TeacherRequiredDocumentFormComponent } from './teacher-required-document-form/teacher-required-document-form.component';
import { WidgetComponentModule } from 'app/widget-component/widget-component.module';
import { FormFillingModule } from 'app/form-filling/form-filling.module';
import { AddInterventionDialogComponent } from './teacher-management-follow-up/add-intervention-dialog/add-intervention-dialog.component';
import { AddInterventionFormComponent } from './teacher-management-follow-up/add-intervention-form/add-intervention-form.component';

@NgModule({
  declarations: [TeacherManagementFollowUpComponent, TeacherManagementTableComponent, ImportTeacherDialogComponent, AskRequiredDocumentsDialogComponent, TeacherRequiredDocumentFormComponent, AddInterventionDialogComponent, AddInterventionFormComponent],
  imports: [CommonModule, TeacherManagementRoutingModule, SharedModule, NgSelectModule, WidgetComponentModule, SweetAlert2Module.forRoot(),FormFillingModule],
  exports: [AskRequiredDocumentsDialogComponent]
})
export class TeacherManagementModule {}
