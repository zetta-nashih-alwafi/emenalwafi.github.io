import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationManagementRoutingModule } from './notification-management-routing.module';
import { NotificationManagementTableComponent } from './notification-management-table.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SharedModule } from 'app/shared/shared.module';
import { NotificationDetailsComponent } from './notification-details/notification-details.component';
import { NotificationIdentityComponent } from './notification-details/notification-identity/notification-identity.component';
import { NotificationTemplateComponent } from './notification-details/notification-template/notification-template.component';
import { EditNotificationDetailsDialogComponent } from './notification-details/notification-identity/edit-notification-details-dialog/edit-notification-details-dialog.component';
import { AddTemplateDialogComponent } from './notification-details/notification-identity/add-template-dialog/add-template-dialog.component';
import { NotificationTemplateDetailsComponent } from './notification-details/notification-template/notification-template-details/notification-template-details.component';
import { NotificationAttachmentComponent } from './notification-details/notification-template/notification-attachment/notification-attachment.component';
import { AddAttachmentDialogComponent } from './notification-details/notification-template/notification-attachment/add-attachment-dialog/add-attachment-dialog.component';

@NgModule({
  declarations: [
    NotificationManagementTableComponent,
    NotificationDetailsComponent,
    NotificationIdentityComponent,
    NotificationTemplateComponent,
    EditNotificationDetailsDialogComponent,
    AddTemplateDialogComponent,
    NotificationTemplateDetailsComponent,
    NotificationAttachmentComponent,
    AddAttachmentDialogComponent,
  ],
  imports: [CommonModule, NotificationManagementRoutingModule, SharedModule, CKEditorModule, NgSelectModule, SweetAlert2Module.forRoot()],
})
export class NotificationManagementModule {}
