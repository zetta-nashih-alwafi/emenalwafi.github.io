import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InternshipRoutingModule } from './internship-routing.module';
import { JobOfferTableComponent } from './job-offer-table/job-offer-table.component';
import { InternProfileTableComponent } from './intern-profile-table/intern-profile-table.component';
import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { InternCandidatesTableComponent } from './intern-candidates-table/intern-candidates-table.component';
import { AgreementTableComponent } from './agreement-table/agreement-table.component';
import { JobOfferDetailComponent } from './job-offer-table/job-offer-detail/job-offer-detail.component';
import { JobOfferCardListComponent } from './job-offer-table/job-offer-card-list/job-offer-card-list.component';
import { JobOfferCardDetailComponent } from './job-offer-table/job-offer-card-detail/job-offer-card-detail.component';
import { JobOfferHistoryTabComponent } from './job-offer-table/job-offer-card-detail/job-offer-history-tab/job-offer-history-tab.component';
import { JobOfferNoteTabComponent } from './job-offer-table/job-offer-card-detail/job-offer-note-tab/job-offer-note-tab.component';
import { JobOfferProfileTabComponent } from './job-offer-table/job-offer-card-detail/job-offer-profile-tab/job-offer-profile-tab.component';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { InternshipTableComponent } from './internship-follow-up/internship-follow-up.component';
import { AddCrmDialogComponent } from './add-crm-dialog/add-crm-dialog.component';
import { DueDateDialogComponent } from './due-date-dialog/due-date-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InternshipSettingComponent } from './internship-setting/internship-setting.component';
import { InternshipReportTabComponent } from './internship-setting/internship-report-tab/internship-report-tab.component';
import { InternshipEvalTabComponent } from './internship-setting/internship-eval-tab/internship-eval-tab.component';
import { InternshipConditionAgreementTabComponent } from './internship-setting/internship-condition-agreement-tab/internship-condition-agreement-tab.component';
import { UsersTableComponent } from './users-table/users-table.component';
import { InternshipConditionTableTabComponent } from './internship-setting/internship-condition-agreement-tab/internship-condition-agreement/internship-condition-table-tab.component';
import { InternshipSetupConditionTabComponent } from './internship-setting/internship-condition-agreement-tab/internship-setup-condition-tab/internship-setup-condition-tab.component';
import { AddNewUserDialogComponent } from './users-table/add-new-user-dialog/add-new-user-dialog.component';
import { UserEntityComponent } from './users-table/user-entity/user-entity.component';
import { UserCardListComponent } from './users-table/user-card-list/user-card-list.component';
import { UserDetailComponent } from './users-table/user-detail/user-detail.component';
import { UserIdentityTabComponent } from './users-table/user-identity-tab/user-identity-tab.component';
import { UserUsertypeTabComponent } from './users-table/user-usertype-tab/user-usertype-tab.component';
import { AddUserEntityDialogComponent } from './users-table/add-user-entity-dialog/add-user-entity-dialog.component';

@NgModule({
  declarations: [
    JobOfferTableComponent,
    InternProfileTableComponent,
    InternCandidatesTableComponent,
    AgreementTableComponent,
    JobOfferDetailComponent,
    JobOfferCardListComponent,
    JobOfferCardDetailComponent,
    JobOfferHistoryTabComponent,
    JobOfferNoteTabComponent,
    JobOfferProfileTabComponent,
    InternshipTableComponent,
    AddCrmDialogComponent,
    DueDateDialogComponent,
    InternshipSettingComponent,
    InternshipReportTabComponent,
    InternshipEvalTabComponent,
    InternshipConditionAgreementTabComponent,
    UsersTableComponent,
    InternshipConditionTableTabComponent,
    InternshipSetupConditionTabComponent,
    AddNewUserDialogComponent,
    UserEntityComponent,
    UserCardListComponent,
    UserDetailComponent,
    UserIdentityTabComponent,
    UserUsertypeTabComponent,
    AddUserEntityDialogComponent,
  ],
  imports: [
    CommonModule,
    InternshipRoutingModule,
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
export class InternshipModule {}
