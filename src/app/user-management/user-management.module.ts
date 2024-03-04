import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserManagementTableComponent } from './user-management-table.component';
import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { UserManagementDetailComponent } from './user-management-detail/user-management-detail.component';
import { UserCardsComponent } from './user-management-detail/user-cards/user-cards.component';
import { UserDetailsComponent } from './user-management-detail/user-details/user-details.component';
import { UserDetailsParentTabsComponent } from './user-management-detail/user-details/user-details-parent-tabs/user-details-parent-tabs.component';
import { UserDetailsUsertypeTabComponent } from './user-management-detail/user-details/user-details-parent-tabs/user-details-usertype-tab/user-details-usertype-tab.component';
import { UserDetailsIdentityTabComponent } from './user-management-detail/user-details/user-details-parent-tabs/user-details-identity-tab/user-details-identity-tab.component';
import { AddUserUsertypeDialogComponent } from './user-management-detail/user-details/user-details-parent-tabs/user-details-usertype-tab/add-user-usertype-dialog/add-user-usertype-dialog.component';
import { StudentUrgentDialogComponent } from 'app/candidate-file/student-urgent-dialog/student-urgent-dialog.component';
import { UserDetailsTeacherDetailsComponent } from './user-management-detail/user-details/user-details-parent-tabs/user-details-teacher-details/user-details-teacher-details.component';
import { AddTypeInterventionTeacherDialogComponent } from './user-management-detail/user-details/user-details-parent-tabs/user-details-teacher-details/add-type-intervention-teacher-dialog/add-type-intervention-teacher-dialog.component';
import { MailboxModule } from 'app/mailbox/mailbox.module';
import { TeacherDocumentTabComponent } from './user-management-detail/user-details/user-details-parent-tabs/user-details-teacher-details/teacher-document-tab/teacher-document-tab.component';
import { AddTeacherManualDocumentDialogComponent } from './user-management-detail/user-details/user-details-parent-tabs/user-details-teacher-details/teacher-document-tab/add-teacher-manual-document-dialog/add-teacher-manual-document-dialog.component';
import { UserDetailsRequiredDocumentsTabComponent } from './user-management-detail/user-details/user-details-parent-tabs/user-details-required-documents-tab/user-details-required-documents-tab.component';
import { AddValidityDateDialogComponent } from './user-management-detail/user-details/user-details-parent-tabs/user-details-required-documents-tab/add-validity-date-dialog/add-validity-date-dialog.component';
import { TeacherManagementModule } from 'app/teacher-management/teacher-management.module';
import { UserDetailsTeacherDetailsParentComponent } from './user-management-detail/user-details/user-details-parent-tabs/user-details-teacher-details-parent/user-details-teacher-details-parent.component';
import { SholarSeasonDialogComponent } from './user-management-detail/user-details/user-details-parent-tabs/user-details-teacher-details/sholar-season-dialog/sholar-season-dialog.component';
import { UserDetailsMyInterventionsTabComponent } from './user-management-detail/user-details/user-details-parent-tabs/user-details-my-interventions-tab/user-details-my-interventions-tab.component';

@NgModule({
  declarations: [
    UserManagementTableComponent,
    UserManagementDetailComponent,
    UserCardsComponent,
    UserDetailsComponent,
    UserDetailsParentTabsComponent,
    UserDetailsUsertypeTabComponent,
    UserDetailsIdentityTabComponent,
    AddUserUsertypeDialogComponent,
    UserDetailsTeacherDetailsComponent,
    AddTypeInterventionTeacherDialogComponent,
    TeacherDocumentTabComponent,
    AddTeacherManualDocumentDialogComponent,
    UserDetailsRequiredDocumentsTabComponent,
    AddValidityDateDialogComponent,
    UserDetailsTeacherDetailsParentComponent,
    SholarSeasonDialogComponent,
    UserDetailsMyInterventionsTabComponent
  ],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    SharedModule,
    CKEditorModule,
    NgSelectModule,
    SweetAlert2Module.forRoot(),
    MailboxModule,
    TeacherManagementModule
  ],
})
export class UserManagementModule {}
