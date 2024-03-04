import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { MessagesDetailsComponent } from './messages-details/messages-details.component';
import { NotificationDetailsComponent } from './notification-details/notification-details.component';
import { NotificationMessageTableComponent } from './notification-message-table/notification-message-table.component';
import * as _ from 'lodash';
import { StepDynamicMessageDialogComponent } from 'app/shared/components/step-dynamic-message-dialog/step-dynamic-message-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';

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
  isWaitingForResponse = false;
  stepType: any;
  stepData: any;
  isPreviewNotif = false;
  reminderPreview = true
  isPreviewMessage = false
  hasErrorPreview = false

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private formBuilderService: FormBuilderService,
    private translate: TranslateService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.getStepData();
  }

  getStepData() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formBuilderService.getOneFormBuilderStepType(this.stepId).subscribe(
      (response) => {
        this.isWaitingForResponse = false;
        if (response) {
          const step = _.cloneDeep(response);
          this.stepType = step.step_type;
          this.stepData = step;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        // Record error log
        this.authService.postErrorLog(err);
      },
    );
  }

  getShowDetailNotifOrMessage(value) {
    if (value) {
      this.showDetailsNotif = value.notification;
      this.showDetailsMessage = value.message;
      this.refDataSelected = value.data;
      this.reminderPreview = true
      this.hasErrorPreview = false
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

  saveNotifDetail(preview?) {
    if (!this.notifDetail.formDetails.valid) {
      this.notifDetail.checkFormValidity();
    }
    this.reminderPreview = !preview && !this.reminderPreview && this.notifDetail.isFormChanged ? true : this.reminderPreview
    this.notifDetail.saveNotifData(preview,this.reminderPreview,this.hasErrorPreview);
  }

  saveMessageDetail(from?) {
    if (!this.messageDetail.messageForm.valid) {
      this.messageDetail.checkFormValidity();
    }
    this.reminderPreview = from!=='preview' && !this.reminderPreview && this.messageDetail.isFormChanged ? true : this.reminderPreview
    this.messageDetail.saveMessageData(this.reminderPreview,from,this.hasErrorPreview);
  }

  onUpdateTab($event) {
    if (this.isPreviewNotif) {
      this.sendPreview()
    } else if(this.isPreviewMessage){
      this.previewMessage()
    } else {
      this.showDetailsMessage = false;
      this.showDetailsNotif = false;
      this.notifMessage.reloadTable();
    }
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
      type: 'notification',
      form_builder_id: this.templateId ? this.templateId : null,
      step_id: this.stepId ? this.stepId : null,
    };
    this.subs.sink = this.formBuilderService.createStepNotificationAndMessage(payload).subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          this.notifMessage.reloadTable();
          this.showDetailsNotif = true;
          this.showDetailsMessage = false;
          this.refDataSelected = resp;
          this.reminderPreview = true
          this.hasErrorPreview = false
        }
      },
      (error) => {
        this.isWaitingForResponse = false;
        // Record error log
        this.authService.postErrorLog(error);
        this.hasNotification(error);
      },
    );
  }

  addMessage() {
    this.isWaitingForResponse = true;
    const payload = {
      type: 'message',
      form_builder_id: this.templateId ? this.templateId : null,
      step_id: this.stepId ? this.stepId : null,
    };
    this.subs.sink = this.formBuilderService.createStepNotificationAndMessage(payload).subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          this.notifMessage.reloadTable();
          this.showDetailsNotif = false;
          this.showDetailsMessage = true;
          this.reminderPreview = true
          this.hasErrorPreview = false
          this.refDataSelected = resp;
        }
      },
      (error) => {
        this.isWaitingForResponse = false;
        this.hasMessage(error);
        // Record error log
        this.authService.postErrorLog(error);
      },
    );
  }

  hasNotification(err) {
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
    if (err['message'] === 'GraphQL error: Step Message already exist') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Sorry'),
        text: this.translate.instant('The message for this step has been created, user can only add 1 message for 1 step'),
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    }
  }
  displayPreview(value){
    if(value){
      this.onPreview()
    }
  }
  onPreview() {
    this.showDetailsNotif ? this.preview() : this.savePreviewMessage();
  }

  preview() {
    this.isPreviewNotif = false;
    this.reminderPreview = false;
    if (this.isPublished) {
      this.previewNotification();
    } else {
      if (this.showDetailsNotif && !this.showDetailsMessage) {
        this.isPreviewNotif = true;
        this.previewNotification()
      }
    }
  }
  savePreviewMessage(){
    this.isPreviewMessage = false
    this.reminderPreview = false
    if (this.isPublished) {
      this.previewMessage();
    } else {
      this.isPreviewMessage = true
      this.saveMessageDetail('preview')
    }
  }

  previewNotification() {
    this.reminderPreview = false
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
      if (confirm.value) {
        if(this.isPublished){
          this.sendPreview()
        }else{
          this.saveNotifDetail('preview');        
        }
      }else{
        if(!this.isPublished){
          this.reminderPreview = true
        }
      }
    });
  }
  sendPreview(){
    this.isPreviewNotif = false;
    this.reminderPreview = false
    this.isWaitingForResponse = true
    this.hasErrorPreview = false
    this.subs.sink = this.formBuilderService
    .SendPreviewStepNotification(this.stepId, true, this.translate.currentLang, this.notifDetail.formDetails.get('_id').value)
    .subscribe(
      (resp) => {
        this.isWaitingForResponse = false
        if (resp) {
          Swal.fire({
            type: 'success',
            title: 'Bravo!',
            confirmButtonText: 'OK',
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {});
        } else {
          this.hasErrorPreview = true
          this.reminderPreview = true
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('ContractPreview_S2.TITLE'),
            text:this.translate.instant('ContractPreview_S2.TEXT'),
            confirmButtonText: this.translate.instant('ContractPreview_S2.BUTTON'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          })
        }
      },
      (err) => {
        // Record error log
        this.hasErrorPreview = true
        this.reminderPreview = true
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('ContractPreview_S2.TITLE'),
          text:this.translate.instant('ContractPreview_S2.TEXT'),
          confirmButtonText: this.translate.instant('ContractPreview_S2.BUTTON'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        })
      },
    );
  }

  previewMessage() {
    this.isPreviewMessage = false
    this.reminderPreview = false
    this.hasErrorPreview = false
    this.subs.sink = this.dialog
      .open(StepDynamicMessageDialogComponent, {
        width: '600px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          step_id: this.stepId,
          is_preview: true,
          dataPreview: this.refDataSelected,
          triggerCondition: null,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if(resp === 'errorpreview'){
          this.reminderPreview = true
          this.hasErrorPreview = true
        }
      });
  }
}
