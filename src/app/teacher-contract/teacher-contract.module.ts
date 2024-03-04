import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeacherContractRoutingModule } from './teacher-contract-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ContractManagementTableComponent } from './contract-management-table/contract-management-table.component';
import { SendingPreContractFormDialogComponent } from './contract-management-table/sending-pre-contract-form-dialog/sending-pre-contract-form-dialog.component';
import { UploadDocumentProcessDialogComponent } from './contract-management-table/upload-document-process-dialog/upload-document-process-dialog.component';
import { ContractProcessFormComponent } from './contract-process-form/contract-process-form.component';

@NgModule({
  declarations: [
    ContractManagementTableComponent,
    SendingPreContractFormDialogComponent,
    UploadDocumentProcessDialogComponent,
    ContractProcessFormComponent,
  ],
  imports: [CommonModule, TeacherContractRoutingModule, SharedModule, CKEditorModule, NgSelectModule, SweetAlert2Module.forRoot()],
})
export class TeacherContractModule {}
