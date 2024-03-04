import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolComponent } from './school.component';
import { SchoolDetailComponent } from './school-detail/school-detail.component';
import { SchoolRoutingModule } from './school-routing.module';
import { SchoolScholarSeasonComponent } from './school-scholar-season/school-scholar-season.component';
import { DuplicateScholarSeasonComponent } from './school-scholar-season/duplicate-scholar-season/duplicate-scholar-season.component';
import { ProgramComponent } from './school-scholar-season/program/program.component';
import { AddProgramDialogComponent } from './school-scholar-season/program/add-program-dialog/add-program-dialog.component';
import { FullRateComponent } from './school-scholar-season/full-rate/full-rate.component';
import { DownPaymentComponent } from './school-scholar-season/down-payment/down-payment.component';
import { LegalComponent } from './school-scholar-season/legal/legal.component';
import { AddPaidLeaveAllowanceDialogComponent } from './school-scholar-season/legal/add-paid-leave-allowance-dialog/add-paid-leave-allowance-dialog.component';
import { AddInducedHourCoefficientDialogComponent } from './school-scholar-season/legal/add-induced-hour-coefficient-dialog/add-induced-hour-coefficient-dialog.component';
import { ConnectLegalEntityDialogComponent } from './school-scholar-season/legal/connect-legal-entity-dialog/connect-legal-entity-dialog.component';
import { AdmissionComponent } from './school-scholar-season/admission/admission.component';
import { ConnectRegistrationProfileDialogComponent } from './school-scholar-season/admission/connect-registration-profile-dialog/connect-registration-profile-dialog.component';
import { RemoveRegistrationProfileDialogComponent } from './school-scholar-season/admission/remove-registration-profile-dialog/remove-registration-profile-dialog.component';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ConditionDialogComponent } from './school-scholar-season/admission/condition-dialog/condition-dialog.component';
import { ConnectAdmissionDocumentDialogComponent } from './school-scholar-season/admission/connect-admission-document-dialog/connect-admission-document-dialog.component';
import { TeacherManagementAssignTableComponent } from './school-scholar-season/teacher-management-assign-table/teacher-management-assign-table.component';
import { CoursesSequencesProgramComponent } from './courses-sequences-program/courses-sequences-program.component';
import { ConnectSequencesDialogComponent } from './courses-sequences-program/connect-sequences-dialog/connect-sequences-dialog.component';
import { AssingStartingDateDialogComponent } from './school-scholar-season/admission/assign-starting-date-dialog/assign-starting-date-dialog.component';
import { AssignProgramDirectorDialogComponent } from './school-scholar-season/admission/assign-program-director-dialog/assign-program-director-dialog.component';
import { ConnectCvecFormDialogComponent } from './school-scholar-season/admission/connect-cvec-form-dialog/connect-cvec-form-dialog.component';
import { AdmissionDocumentDialogComponent } from './school-scholar-season/admission/admission-document-dialog/admission-document-dialog.component';

@NgModule({
  declarations: [
    SchoolComponent,
    SchoolDetailComponent,
    SchoolScholarSeasonComponent,
    DuplicateScholarSeasonComponent,
    ProgramComponent,
    AddProgramDialogComponent,
    FullRateComponent,
    DownPaymentComponent,
    LegalComponent,
    AddPaidLeaveAllowanceDialogComponent,
    AddInducedHourCoefficientDialogComponent,
    ConnectLegalEntityDialogComponent,
    AdmissionComponent,
    ConditionDialogComponent,
    ConnectRegistrationProfileDialogComponent,
    RemoveRegistrationProfileDialogComponent,
    TeacherManagementAssignTableComponent,
    ConnectAdmissionDocumentDialogComponent,
    CoursesSequencesProgramComponent,
    ConnectSequencesDialogComponent,
    AssingStartingDateDialogComponent,
    AssignProgramDirectorDialogComponent,
    ConnectCvecFormDialogComponent,
    AdmissionDocumentDialogComponent
  ],
  imports: [CommonModule, SchoolRoutingModule, SharedModule, NgSelectModule, CKEditorModule, SweetAlert2Module.forRoot()],
})
export class SchoolModule {}
