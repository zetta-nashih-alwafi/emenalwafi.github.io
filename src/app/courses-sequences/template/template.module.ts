import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { TemplateSequenceComponent } from './template.component';
import { TemplateSequenceRoutingModule } from './template-routing.module';
import { TemplateSequenceParentComponent } from './template-sequence-parent/template-sequence-parent.component';
import { TemplateSequencePreviewComponent } from './template-sequence-parent/template-sequence-preview/template-sequence-preview.component';
import { TemplateSequenceFormComponent } from './template-sequence-parent/template-sequence-form/template-sequence-form.component';
import { CourseSequenceGroupComponent } from './course-sequence-group/course-sequence-group.component';
import { GroupingClassesSequenceComponent } from './course-sequence-group/grouping-classes-group-sequence/grouping-classes-group-sequence.component';
import { GroupingStudentsClassSequenceComponent } from './course-sequence-group/grouping-students-class-sequence/grouping-students-class-sequence.component';
import { AddTemplateModuleDialogComponent } from './add-template-module-dialog/add-template-module-dialog.component';
import { AddTemplateSequenceDialogComponent } from './add-template-sequence-dialog/add-template-sequence-dialog.component';
import { AddTemplateSubjectDialogComponent } from './add-template-subject-dialog/add-template-subject-dialog.component';
import { DuplciateTemplateSequenceDialogComponent } from './duplicate-template-sequence-dialog/duplicate-template-sequence-dialog.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { AddTypeOfGroupDialogComponent } from './add-type-of-group-dialog/add-type-of-group-dialog.component';

@NgModule({
  declarations: [
    TemplateSequenceComponent,
    TemplateSequenceParentComponent,
    TemplateSequenceFormComponent,
    TemplateSequencePreviewComponent,
    CourseSequenceGroupComponent,
    GroupingClassesSequenceComponent,
    GroupingStudentsClassSequenceComponent,
    AddTemplateSequenceDialogComponent,
    AddTemplateSubjectDialogComponent,
    AddTemplateModuleDialogComponent,
    DuplciateTemplateSequenceDialogComponent,
    AddTypeOfGroupDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    CKEditorModule,
    TemplateSequenceRoutingModule,
    NgxMaterialTimepickerModule,
    SweetAlert2Module.forRoot(),
    NgSelectModule,
  ],
  providers: [],
})
export class TemplateSequenceModule {}
