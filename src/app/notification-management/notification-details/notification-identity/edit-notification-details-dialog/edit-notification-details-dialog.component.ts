import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificationManagementService } from 'app/notification-management/notification-management.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UserService } from 'app/service/user/user.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-edit-notification-details-dialog',
  templateUrl: './edit-notification-details-dialog.component.html',
  styleUrls: ['./edit-notification-details-dialog.component.scss'],
})
export class EditNotificationDetailsDialogComponent implements OnInit {
  isWaitingForResponse = false;
  notificationDetailForm: UntypedFormGroup;
  recipients = [];
  signatories = [];
  private subs = new SubSink();
  initialForm: any;
  recipientsCC: any[];

  constructor(
    public dialogRef: MatDialogRef<EditNotificationDetailsDialogComponent>,
    private fb: UntypedFormBuilder,
    private userService: UserService,
    private translate: TranslateService,
    private notificationService: NotificationManagementService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initForm();
    this.getUserTypes(); // for recepients and signatories dropdown
  }

  initForm() {
    this.notificationDetailForm = this.fb.group({
      notification_reference: [{ value: null, disabled: true }],
      recipient_to: [[], Validators.required],
      recipient_cc: [[]],
      financial_supports_cc: [false],
      signatory: [null, Validators.required],
      related_task: [{ value: null, disabled: true }],
    });
  }

  checkRecipientIsCandidate() {
    let isCandidate = false;
    const recipientList = this.notificationDetailForm.get('recipient_to').value;
    if (this.notificationDetailForm.value && recipientList && recipientList.length) {
      const isRecipientStudent = recipientList.filter((resp) => resp === '5fe98eeadb866c403defdc6c' || resp === '5a067bba1c0217218c75f8ab');
      if (isRecipientStudent && isRecipientStudent.length) {
        isCandidate = true;
      } else {
        this.notificationDetailForm.get('financial_supports_cc').setValue(false);
      }
    }
    return isCandidate;
  }

  getUserTypes() {
    this.isWaitingForResponse = true;
    this.userService.getAllUserTypeWithStudent().subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.recipients = resp;
        this.signatories = resp;
        this.recipientsCC = resp;
        if (this.data) {
          // console.log('passed data to dialog:', this.data);
          this.patchForm();
          // console.log('after patching, form becomes:', this.notificationDetailForm.value);
        }
      },
      (error) => {
        this.authService.postErrorLog(error);
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  patchForm() {
    const data = { ...this.data };

    // make recipient and signatory to store ID value only on the form
    if (data?.signatory?._id) {
      data.signatory = data.signatory._id;
    }
    if (data?.recipient_to?.length) {
      data.recipient_to = data.recipient_to.map((recipient) => recipient?._id);
    }
    if (data?.recipient_cc?.length) {
      data.recipient_cc = data.recipient_cc.map((recipient) => recipient?._id);
    }

    this.notificationDetailForm.patchValue(data);
    this.initialForm = this.notificationDetailForm.getRawValue();
  }

  /** Flow of form validation ****/

  async checkFormValidity(): Promise<boolean> {
    if (this.notificationDetailForm.invalid) {
      const action = await Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.markAllFieldsAsTouched(this.notificationDetailForm);
      return false;
    } else {
      return true;
    }
  }

  // make all field as touched so error can show
  markAllFieldsAsTouched(formGroup: UntypedFormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof UntypedFormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup) {
        this.markAllFieldsAsTouched(control);
      }
    });
  }

  /*********************************8******* */

  closeDialog(resp?) {
    this.dialogRef.close(resp);
  }

  // get all the fields that are updated by the user to be displayed in the swal on submit
  getUpdatedFields(): string {
    let updatedFields = [];
    let currentForm = this.notificationDetailForm.getRawValue();

    for (const key of Object.keys(this.initialForm)) {
      if (this.initialForm[key] !== currentForm[key]) {
        // console.log(currentForm[key], this.initialForm[key]);
        updatedFields.push(key);
      }
    }
    return updatedFields.map((field) => this.getFieldsName(field)).join(', ');
  }

  // translate the field key to readable translated value
  getFieldsName(field: string): string {
    switch (field) {
      case 'recipient_to':
        return this.translate.instant('Recipient');
      case 'signatory':
        return this.translate.instant('Signatory');
      case 'recipient_cc':
        return this.translate.instant('CC');
      default:
        return '';
    }
  }

  async submit() {
    if (!(await this.checkFormValidity())) {
      return;
    }
    this.isWaitingForResponse = true;
    const updatedFields = this.getUpdatedFields();
    // console.log(updatedFields);
    if (updatedFields) {
      await Swal.fire({
        type: 'warning',
        title: this.translate.instant('Notif_S1.TITLE'),
        html: this.translate.instant('Notif_S1.TEXT', { updatedFields: updatedFields }),
        confirmButtonText: this.translate.instant('Notif_S1.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
    }
    this.subs.sink = this.notificationService
      .updateNotificationReference(this.data._id, this.notificationDetailForm.getRawValue())
      .subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Notif_S2.TITLE'),
            text: this.translate.instant('Notif_S2.TEXT'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.dialogRef.close(true);
          });
        },
        (err) => {
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }
}
