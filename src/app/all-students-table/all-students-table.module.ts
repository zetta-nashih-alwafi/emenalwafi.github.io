import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'app/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AllStudentsTableRoutingModule } from './all-students-table-routing.module';
import { AllStudentsTableComponent } from './all-students-table.component';
import { RemoveTagsDialogComponent } from './remove-tags-dialog/remove-tags-dialog.component';
import { MailAllStudentsDialogComponent } from './mail-all-students-dialog/mail-all-students-dialog.component';
import { AddTagsDialogComponent } from './add-tags-dialog/add-tags-dialog.component';
import { VisaDocumentFormComponent } from './visa-document-form/visa-document-form.component';
import { WidgetComponentModule } from 'app/widget-component/widget-component.module';
import { FormFillingModule } from 'app/form-filling/form-filling.module';


@NgModule({
  declarations: [
    AllStudentsTableComponent,
    RemoveTagsDialogComponent,
    MailAllStudentsDialogComponent,
    VisaDocumentFormComponent,
  ],
  imports: [
    CommonModule,
    AllStudentsTableRoutingModule,
    SharedModule,
    NgSelectModule,
    CKEditorModule,
    WidgetComponentModule,
    FormFillingModule
  ]
})
export class AllStudentsTableModule { }
