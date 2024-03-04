import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentsTabComponent } from './documents-tab.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SharedModule } from 'app/shared/shared.module';
import { DocumentRoutingModule } from './document-routing.module';
import { DocumentTemplateDetailsComponent } from './document-template-details/document-template-details.component';
import { DocumentTemplateBuilderStepComponent } from './document-template-details/document-template-builder-step/document-template-builder-step.component';
import { DocumentTemplateParameterStepComponent } from './document-template-details/document-template-parameter-step/document-template-parameter-step.component';
import { DuplicateDocumentTemplateDialogComponent } from './duplicate-document-template-dialog/duplicate-document-template-dialog.component';

@NgModule({
  declarations: [
    DocumentsTabComponent,
    DocumentTemplateDetailsComponent,
    DocumentTemplateBuilderStepComponent,
    DocumentTemplateParameterStepComponent,
    DuplicateDocumentTemplateDialogComponent,
  ],
  imports: [CommonModule, DocumentRoutingModule, SharedModule, CKEditorModule, NgSelectModule, SweetAlert2Module.forRoot()],
})
export class DocumentsModule {}
