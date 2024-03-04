import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { StudentInternshipRoutingModule } from './student-internship-routing.module';
import { StudentInternshipComponent } from './student-internship.component';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AskNewAgreementDialogComponent } from './ask-new-agreement-dialog/ask-new-agreement-dialog.component';
import { AskNewAgreementDetailDialogComponent } from './ask-new-agreement-detail-dialog/ask-new-agreement-detail-dialog.component';

@NgModule({
  declarations: [StudentInternshipComponent, AskNewAgreementDialogComponent, AskNewAgreementDetailDialogComponent],
  imports: [
    CommonModule,
    StudentInternshipRoutingModule,
    SharedModule,
    CKEditorModule,
    NgSelectModule,
    SweetAlert2Module.forRoot(),

    NgxMaterialTimepickerModule,
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
  ],
})
export class StudentInternshipModule {}
