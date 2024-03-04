import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import { StepMessageProcessDialogComponent } from 'app/form-builder/step-message-process/step-message-process.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { MessagesDetailsComponent } from './messages-details/messages-details.component';
import { NotificationDetailsComponent } from './notification-details/notification-details.component';
import { NotificationMessageTableComponent } from './notification-message-table/notification-message-table.component';

@Component({
  selector: 'ms-step-notification-messages-tab',
  templateUrl: './step-notification-messages-tab.component.html',
  styleUrls: ['./step-notification-messages-tab.component.scss'],
})
export class StepNotificationMessagesTabComponent implements OnInit, OnDestroy {
  @Input() templateId;
  @Input() templateType;
  @Input() stepId;
  @Input() isPublished;
  @ViewChild('notifTable', { static: false }) notifMessage: NotificationMessageTableComponent;
  @ViewChild('notifDetail', { static: false }) notifDetail: NotificationDetailsComponent;
  @ViewChild('messageDetail', { static: false }) messageDetail: MessagesDetailsComponent;
  private subs = new SubSink();
  showDetailsNotif = false;
  showDetailsMessage = false;
  refDataSelected: any;
  currentUser = null;
  isWaitingForResponse = false;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private formBuilderService: FormBuilderService,
    private translate: TranslateService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    console.log('_temp', this.templateId);
    console.log('_step', this.stepId);
  }

  getShowDetailNotifOrMessage(value) {
    console.log('value', value);
    if (value) {
      this.showDetailsNotif = value.notification;
      this.showDetailsMessage = value.message;
      this.refDataSelected = value.data;
    }
  }

  onSave() {
    if (this.showDetailsNotif && !this.showDetailsMessage) {
      this.saveNotifDetail();
    } else if (!this.showDetailsNotif && this.showDetailsMessage) {
      this.saveMessageDetail();
    } else {
      return;
    }
  }

  saveNotifDetail() {
    this.notifDetail.saveNotifData();
  }
  saveMessageDetail() {
    this.messageDetail.saveMessageData();
  }

  onUpdateTab($event) {
    this.showDetailsMessage = false;
    this.showDetailsNotif = false;
    this.notifMessage.reloadTable();
  }

  leave() {
    this.checkIfAnyChildrenFormInvalid();
  }

  checkIfAnyChildrenFormInvalid() {
    if (!this.formBuilderService.childrenFormValidationStatus) {
      this.fireUnsavedDataWarningSwal();
    } else {
      this.router.navigate(['form-builder']);
    }
  }

  fireUnsavedDataWarningSwal() {
    if (!this.isPublished) {
      return Swal.fire({
        type: 'warning',
        title: this.translate.instant('TMTC_S01.TITLE'),
        text: this.translate.instant('TMTC_S01.TEXT'),
        confirmButtonText: this.translate.instant('TMTC_S01.BUTTON_1'),
        showCancelButton: true,
        cancelButtonText: this.translate.instant('TMTC_S01.BUTTON_2'),
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.value) {
          // I will save first
          return;
        } else {
          // discard changes
          this.formBuilderService.childrenFormValidationStatus = true;
          this.router.navigate(['form-builder']);
        }
      });
    } else {
      // discard changes
      this.formBuilderService.childrenFormValidationStatus = true;
      this.router.navigate(['form-builder']);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  addNotification() {
    this.isWaitingForResponse = true;
    const payload = {
      ref_id: 'NotificationS1_N1',
      type: 'notification',
      form_builder_id: this.templateId ? this.templateId : null,
      step_id: this.stepId ? this.stepId : null,
    };
    console.log('notification', payload);
    this.subs.sink = this.formBuilderService.createStepNotificationAndMessage(payload).subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          console.log(resp);
          this.notifMessage.reloadTable();
        }
      },
      (error) => {
        this.isWaitingForResponse = false;
        console.log(error);
        this.hasNotification(error);
      },
    );
  }

  addMessage() {
    this.isWaitingForResponse = true;
    const payload = {
      ref_id: 'MessageS1_M1',
      type: 'message',
      form_builder_id: this.templateId ? this.templateId : null,
      step_id: this.stepId ? this.stepId : null,
    };
    console.log('message', payload);
    this.subs.sink = this.formBuilderService.createStepNotificationAndMessage(payload).subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          console.log(resp);
          this.notifMessage.reloadTable();
        }
      },
      (error) => {
        this.isWaitingForResponse = false;
        console.log(error);
        this.hasMessage(error);
      },
    );
  }

  hasNotification(err) {
    console.log(err);
    if (err['message'] === 'GraphQL error: Step Notification already exist') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Sorry'),
        text: this.translate.instant('The notification for this step has been created, user can only add 1 notification for 1 step'),
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    }
  }

  hasMessage(err) {
    console.log(err);
    if (err['message'] === 'GraphQL error: Step Message already exist') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Sorry'),
        text: this.translate.instant('The message for this step has been created, user can only add 1 message for 1 step'),
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    }
  }

  previewNotification() {
    if (this.notifDetail.checkFormValidity()) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
    } else {
      Swal.fire({
        type: 'warning',
        allowEnterKey: false,
        allowEscapeKey: false,
        showCancelButton: true,
        allowOutsideClick: false,
        html: this.translate.instant('Notif_S7.TEXT', { templateName: this.refDataSelected.ref_id }),
        title: this.translate.instant('Notif_S7.TITLE'),
        cancelButtonText: this.translate.instant('Notif_S7.BUTTON2'),
        confirmButtonText: this.translate.instant('Notif_S7.BUTTON1'),
      }).then((confirm) => {
        console.log('confirm', confirm);
        if (confirm.value) {
          this.subs.sink = this.formBuilderService.SendPreviewStepNotification(this.currentUser._id, this.stepId, null, true).subscribe(
            (resp) => {
              Swal.fire({
                type: 'success',
                title: 'Bravo!',
                confirmButtonText: 'OK',
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {});
            },
            (err) => {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            },
          );
        }
      });
      // ..
    }
  }

  previewMessage() {
    // StepMessageProcessDialogComponent
    this.subs.sink = this.dialog
      .open(StepMessageProcessDialogComponent, {
        width: '600px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          stepId: this.stepId,
          isPreview: true,
          student_admission_process_id: null,
        },
      })
      .afterClosed()
      .subscribe((resp) => {});
    // ...
  }
}
