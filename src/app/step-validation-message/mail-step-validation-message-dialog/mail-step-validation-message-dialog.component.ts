import { Component, OnInit, Inject, ViewChild, ElementRef, Input, Output, EventEmitter, OnDestroy, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormControl, UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { AuthService } from 'app/service/auth-service/auth.service';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import Swal from 'sweetalert2';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { debounceTime } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { ApplicationUrls } from 'app/shared/settings';

enum ReturnType {
  LABEL = 'LABEL',
  VALUE = 'VALUE',
  OBJECT = 'OBJECT',
}

interface InputType {
  label: string;
  value: string;
}

@Component({
  selector: 'ms-mail-step-validation-message-dialog',
  templateUrl: './mail-step-validation-message-dialog.component.html',
  styleUrls: ['./mail-step-validation-message-dialog.component.scss'],
})
export class MailStepValidationMessageDialogComponent implements OnInit, OnDestroy {
  sendEmailForm: UntypedFormGroup;
  private subs = new SubSink();
  public Editor = DecoupledEditor;
  showCC = false;
  showBCC = false;
  public config = {};
  isPermission: any;

  @ViewChild('languagesInput', { static: false }) languagesInput: ElementRef<HTMLInputElement>;
  @ViewChild('recipientCc', { static: false }) recipientCc: ElementRef<HTMLInputElement>;
  @ViewChild('recipientBcc', { static: false }) recipientBcc: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
  @ViewChild('myInput', { static: false }) currentFile: any;
  @ViewChild('stepDisplayTemplate', { static: true }) stepDisplayTemplate: TemplateRef<any>;
  preSelectedEmail: string;
  selectedEmailTo = [];
  selectedEmailCc = [];
  selectedEmailBcc = [];

  selectedRecepientsList = [];
  ccselectedRecepientsList = [];
  bccselectedRecepientsList = [];

  recpList = [];
  recpListCc = [];
  recpListBcc = [];
  listIntakeChannel = [
    { value: '20-21 EFANEW 1', name: '20-21 EFANEW 1' },
    { value: '20-21 EFANEW 2', name: '20-21 EFANEW 2' },
    { value: '20-21 EFANEW 3', name: '20-21 EFANEW 3' },
    { value: '20-21 EFANEW 4', name: '20-21 EFANEW 4' },
    { value: '20-21 EFANEW 5', name: '20-21 EFANEW 5' },
  ];

  emailAddressesListTo = [];
  emailAddressesListCc = [];
  emailAddressesListBcc = [];

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  addOnBlurCc = true;
  addOnBlurBcc = true;
  showCCInput = false;
  showBCCInput = false;
  @Input() allowOther = false;
  @Input() returnType: ReturnType = ReturnType.LABEL;
  @Output() optionSelected: EventEmitter<(string | InputType)[]> = new EventEmitter();
  separatorKeysCodes: number[] = [ENTER, COMMA];
  separatorKeysCodesCc: number[] = [ENTER, COMMA];
  separatorKeysCodesBcc: number[] = [ENTER, COMMA];

  attachmnetsPaths = [];
  currentUser;
  categoryName: any;
  subjectName: any;
  mailData: any;
  isGroupEmail = false;
  isWaitingForResponse = false;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public translate: TranslateService,
    private userService: AuthService,
    private mailboxService: MailboxService,
    private fileUploadService: FileUploadService,
    public dialogref: MatDialogRef<MailStepValidationMessageDialogComponent>,
    private fb: UntypedFormBuilder,
    private authService: AuthService
  ) {
    this.sendEmailForm = this.fb.group({
      to: ['', Validators.required],
      cc: ['', Validators.required],
      bcc: ['', Validators.required],
      subject: ['', Validators.required],
      message: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.isPermission = this.userService.getPermission();
    this.currentUser = this.userService.getLocalStorageUser();
    this.getRecipientsData();
    this.getStepValidationData();
    this.getStepValidationImage();
    // console.log('parent data ', this.data);
  }

  removeAttachment(file) {
    this.attachmnetsPaths.splice(this.attachmnetsPaths.indexOf(file), 1);
  }

  getStepValidationData() {
    /*  this.preSelectedEmail =
      this.translate.instant(this.data.civility) + ' ' + this.data.first_name + ' ' + this.data.last_name + ' <' + this.data.email + '>';
    this.selectedEmailTo.push(
      this.translate.instant(this.data.civility) + ' ' + this.data.first_name + ' ' + this.data.last_name + ' <' + this.data.email + '>',
    );
    this.emailAddressesListTo.push(this.preSelectedEmail); */
    /* if (this.validateEmail(this.data.email)) {
      this.selectedRecepientsList.push(this.data.email);
      console.log('Success');
    } else {
      console.log('Eror');
    }
    this.recpList.push(this.data.email); */
    this.sendEmailForm.get('to').setValue(null);
    let subject = this.translate.instant('Preview of the registration step message');
    subject += ' ' + this.data.first_title;
    this.sendEmailForm.get('subject').setValue(subject);
    // this.sendEmailForm.get('subject').setValue(this.data.rncp_title.short_name);
    this.getEmailMessage();
  }

  getEmailMessage() {
    let message = '';
    let signat = '';
    if (this.data.multiple) {
      message = '';
    } else {
      message = `
      ${this.translate.instant('Hello')},
      <br>${this.translate.instant('This is the preview of the registration step message')} : <br>
      ${this.translate.instant('Title 1')}: ${this.translate.instant(this.data.first_title)} <br>
      ${this.translate.instant('Title 2')}: ${this.translate.instant(this.data.first_title)}
      `;
    }
    signat += message + `<p></p><p></p><p></p>`;
    if (this.currentUser) {
      signat +=
        (this.currentUser.civility !== 'neutral' ? this.translate.instant(this.currentUser.civility) : '') +
        ' ' +
        this.currentUser.first_name +
        ' ' +
        this.currentUser.last_name +
        '<br>';
      signat += this.currentUser && this.currentUser.position ? this.translate.instant(this.currentUser.position) + '<br>' : '';
    }
    this.sendEmailForm.get('message').setValue(signat);
  }

  validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  setSelectedEmail(emails: string[], formControl: any) {
    formControl.setValue(emails);
  }

  closeDialog(): void {
    swal
      .fire({
        title: this.translate.instant('MailBox.composeMail.DRAFT.TITLE'),
        html: this.translate.instant('MailBox.composeMail.DRAFT.TEXT'),
        type: 'warning',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: this.translate.instant('MailBox.composeMail.DRAFT.CONFIRMBTN'),
        cancelButtonText: this.translate.instant('MailBox.composeMail.DRAFT.DECBTN'),
      })
      .then((result) => {
        if (result.value) {
          this.saveDraft();
          this.dialogref.close();
        } else {
          this.dialogref.close();
        }
      });
  }
  saveDraft() {
    const formValues = this.sendEmailForm.value;
    if (formValues.subject !== '' || (formValues.message !== '' && formValues.message !== undefined)) {
      const receiversArray = [];
      // const senderArray = [];
      this.mailData = {};
      const recipient = this.recpList;
      const recipientCc = this.recpListCc;
      const recipientBcc = this.recpListBcc;
      this.currentUser = this.userService.getLocalStorageUser();
      const senderArray = {
        sender: this.currentUser.email,
        is_read: false,
        mail_type: 'draft',
      };
      if (recipient) {
        const str_array = recipient.toString().split(',');

        for (let i = 0; i < str_array.length; i++) {
          str_array[i] = str_array[i].replace(/^\s*/, '').replace(/\s*$/, '');

          if (this.validateEmail(str_array[i])) {
            receiversArray.push({ recipients: [str_array[i]], rank: 'a', is_read: false, mail_type: 'draft' });
          }
        }
      }

      if (recipientCc) {
        const str_array_cc = recipientCc.toString().split(',');
        for (let i = 0; i < str_array_cc.length; i++) {
          str_array_cc[i] = str_array_cc[i].replace(/^\s*/, '').replace(/\s*$/, '');

          if (this.validateEmail(str_array_cc[i])) {
            receiversArray.push({ recipients: [str_array_cc[i]], rank: 'cc', is_read: false, mail_type: 'draft' });
          }
        }
      }

      if (recipientBcc) {
        const str_array_bcc = recipientBcc.toString().split(',');
        for (let i = 0; i < str_array_bcc.length; i++) {
          str_array_bcc[i] = str_array_bcc[i].replace(/^\s*/, '').replace(/\s*$/, '');

          if (this.validateEmail(str_array_bcc[i])) {
            receiversArray.push({ recipients: [str_array_bcc[i]], rank: 'c', is_read: false, mail_type: 'draft' });
          }
        }
      }
      const MailAttachment = [];
      const MailAttachment1 = [];
      this.attachmnetsPaths.forEach((files) => {
        const obj = {
          file_name: files.name,
          path: files.path,
        };
        MailAttachment1.push(files.name);
        MailAttachment.push(obj);
      });
      this.mailData.sender_property = senderArray;
      this.mailData.recipient_properties = receiversArray;
      this.mailData.subject = formValues.subject;
      this.mailData.message = formValues.message;
      this.mailData.is_sent = false;
      this.mailData.status = 'active';
      this.mailData.is_urgent_mail = false;
      this.mailData.attachments = MailAttachment1;
      this.mailData.file_attachments = MailAttachment;
      this.mailData.tags = ['draft'];

      if (this.isGroupEmail) {
        this.mailData.is_group_parent = this.isGroupEmail;
        this.mailData.user_type_selection = formValues.user_type_selection;
        this.mailData.group_detail = this.computeGroupDetails();
      }

      this.subs.sink = this.mailboxService.createMail(this.mailData).subscribe(
        (data: any) => {
          swal.fire({
            type: 'info',
            title: this.translate.instant('MailBox.MESSAGES.DRAFTMSG'),
            text: '',
            confirmButtonText: this.translate.instant('MailBox.MESSAGES.THANK'),
            allowOutsideClick: false,
          });
        },
        (err) => {
          this.authService.postErrorLog(err);
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

  sendMail() {
    this.isWaitingForResponse = true;
    const formValues = this.sendEmailForm.value;
    if (formValues.subject !== '' || (formValues.message !== '' && formValues.message !== undefined)) {
      const receiversArray = [];
      this.mailData = {};
      const recipient = this.recpList;
      const recipientCc = this.recpListCc;
      const recipientBcc = this.recpListBcc;
      this.currentUser = this.userService.getLocalStorageUser();
      const senderArray = {
        sender: this.currentUser.email,
        is_read: false,
        mail_type: 'sent',
      };
      if (recipient) {
        const str_array = recipient.toString().split(',');

        for (let i = 0; i < str_array.length; i++) {
          str_array[i] = str_array[i].replace(/^\s*/, '').replace(/\s*$/, '');

          if (this.validateEmail(str_array[i])) {
            receiversArray.push({ recipients: [str_array[i]], rank: 'a', is_read: false, mail_type: 'inbox' });
          }
        }
      }

      if (recipientCc) {
        const str_array_cc = recipientCc.toString().split(',');
        for (let i = 0; i < str_array_cc.length; i++) {
          str_array_cc[i] = str_array_cc[i].replace(/^\s*/, '').replace(/\s*$/, '');

          if (this.validateEmail(str_array_cc[i])) {
            receiversArray.push({ recipients: [str_array_cc[i]], rank: 'cc', is_read: false, mail_type: 'inbox' });
          }
        }
      }

      if (recipientBcc) {
        const str_array_bcc = recipientBcc.toString().split(',');
        for (let i = 0; i < str_array_bcc.length; i++) {
          str_array_bcc[i] = str_array_bcc[i].replace(/^\s*/, '').replace(/\s*$/, '');

          if (this.validateEmail(str_array_bcc[i])) {
            receiversArray.push({ recipients: [str_array_bcc[i]], rank: 'c', is_read: false, mail_type: 'inbox' });
          }
        }
      }
      const MailAttachment = [];
      const MailAttachment1 = [];
      this.attachmnetsPaths.forEach((files) => {
        const obj = {
          file_name: files.name,
          path: files.path,
        };
        MailAttachment1.push(files.name);
        MailAttachment.push(obj);
      });
      this.mailData.sender_property = senderArray;
      this.mailData.recipient_properties = receiversArray;
      this.mailData.subject = formValues.subject;
      this.mailData.message = formValues.message;
      this.mailData.is_sent = true;
      this.mailData.status = 'active';
      // this.mailData.is_urgent_mail = this.isUrgentFlag;
      this.mailData.attachments = MailAttachment1;
      this.mailData.file_attachments = MailAttachment;
      this.mailData.tags = ['sent'];

      if (this.isGroupEmail) {
        this.mailData.is_group_parent = this.isGroupEmail;
        this.mailData.user_type_selection = formValues.user_type_selection;
        this.mailData.group_detail = this.computeGroupDetails();
      }
      // console.log('Mail Student : ', this.mailData);
      this.subs.sink = this.mailboxService.createMail(this.mailData).subscribe(
        (data: any) => {
          this.isWaitingForResponse = false;
          this.dialogref.close();
          swal.fire({
            allowOutsideClick: false,
            title: this.translate.instant('MailBox.composeMail.MESSAGES.TITLE'),
            text: this.translate.instant('MailBox.composeMail.MESSAGES.TEXT'),
            allowEscapeKey: true,
            type: 'success',
            confirmButtonText: this.translate.instant('MailBox.composeMail.MESSAGES.CONFIRMBTN'),
          });
          // this.deleteOldDraftMail();
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err);
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

  setSelectedEmailTo(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    const dataEmailSelect = value.split(' ');
    let emailSelect = '';
    dataEmailSelect.forEach((data) => {
      emailSelect = data;
    });
    const sel = emailSelect.replace('<', '');
    const se = sel.replace('>', '');
    if (this.validateEmail(se)) {
      this.selectedEmailTo.push(value);
      this.selectedRecepientsList.push(value);
      // console.log('Success');
    } else {
      // console.log('Eror');
    }
    const dataEmail = value.split(' ');
    let newEmail = '';
    dataEmail.forEach((data) => {
      newEmail = data;
    });
    const ne = newEmail.replace('<', '');
    const e = ne.replace('>', '');
    this.recpList.push(e);
    this.languagesInput.nativeElement.value = '';
    this.sendEmailForm.get('to').setValue(null);
    // this.sendEmailForm.get('to').setValue('');

    this.emitSelectedLanguagesTo();
  }

  setSelectedEmailCc(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    const dataEmailSelect = value.split(' ');
    let emailSelect = '';
    dataEmailSelect.forEach((data) => {
      emailSelect = data;
    });
    const sel = emailSelect.replace('<', '');
    const se = sel.replace('>', '');
    if (this.validateEmail(se)) {
      this.selectedEmailCc.push(value);
      this.selectedRecepientsList.push(value);
      // console.log('Success');
    } else {
      // console.log('Eror');
    }
    const dataEmail = value.split(' ');
    let newEmail = '';
    dataEmail.forEach((data) => {
      newEmail = data;
    });
    const ne = newEmail.replace('<', '');
    const e = ne.replace('>', '');
    this.recpListCc.push(e);
    this.recipientCc.nativeElement.value = '';
    this.sendEmailForm.get('cc').patchValue('', { emitEvent: true });
    this.sendEmailForm.get('cc').setValue('');
  }

  setSelectedEmailBcc(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    const dataEmailSelect = value.split(' ');
    let emailSelect = '';
    dataEmailSelect.forEach((data) => {
      emailSelect = data;
    });
    const sel = emailSelect.replace('<', '');
    const se = sel.replace('>', '');
    if (this.validateEmail(se)) {
      this.selectedEmailBcc.push(value);
      this.selectedRecepientsList.push(value);
      // console.log('Success');
    } else {
      // console.log('Eror');
    }
    const dataEmail = value.split(' ');
    let newEmail = '';
    dataEmail.forEach((data) => {
      newEmail = data;
    });
    const ne = newEmail.replace('<', '');
    const e = ne.replace('>', '');
    this.recpListBcc.push(e);
    this.sendEmailForm.get('bcc').setValue(null);
    this.sendEmailForm.get('bcc').setValue('');
    this.recipientBcc.nativeElement.value = '';
  }

  emitSelectedLanguagesTo() {
    if (this.returnType === ReturnType.OBJECT) {
      this.optionSelected.emit(this.selectedEmailTo);
    } else if (this.returnType === ReturnType.VALUE) {
      this.optionSelected.emit(this.selectedEmailTo.map((o: InputType) => o.value));
    } else {
      this.optionSelected.emit(this.selectedEmailTo.map((o: InputType) => o.label));
    }
  }
  emitSelectedLanguagesCc() {
    if (this.returnType === ReturnType.OBJECT) {
      this.optionSelected.emit(this.selectedEmailCc);
    } else if (this.returnType === ReturnType.VALUE) {
      this.optionSelected.emit(this.selectedEmailCc.map((o: InputType) => o.value));
    } else {
      this.optionSelected.emit(this.selectedEmailCc.map((o: InputType) => o.label));
    }
  }
  emitSelectedLanguagesBcc() {
    if (this.returnType === ReturnType.OBJECT) {
      this.optionSelected.emit(this.selectedEmailBcc);
    } else if (this.returnType === ReturnType.VALUE) {
      this.optionSelected.emit(this.selectedEmailBcc.map((o: InputType) => o.value));
    } else {
      this.optionSelected.emit(this.selectedEmailBcc.map((o: InputType) => o.label));
    }
  }

  removeTo(language: InputType): void {
    const index = this.selectedEmailTo.findIndex((i: InputType) => i === language);
    const globalIndex = this.selectedRecepientsList.findIndex((i: InputType) => i === language);

    if (index >= 0) {
      this.selectedEmailTo.splice(index, 1);
    }
    if (globalIndex >= 0) {
      this.selectedRecepientsList.splice(globalIndex, 1);
    }
    this.emitSelectedLanguagesTo();
  }

  removeCc(language: InputType): void {
    const index = this.selectedEmailCc.findIndex((i: InputType) => i === language);
    const globalIndex = this.selectedRecepientsList.findIndex((i: InputType) => i === language);

    if (index >= 0) {
      this.selectedEmailCc.splice(index, 1);
    }
    if (globalIndex >= 0) {
      this.selectedRecepientsList.splice(globalIndex, 1);
    }
    this.emitSelectedLanguagesCc();
  }

  removeBcc(language: InputType): void {
    const index = this.selectedEmailBcc.findIndex((i: InputType) => i === language);
    const globalIndex = this.selectedRecepientsList.findIndex((i: InputType) => i === language);

    if (index >= 0) {
      this.selectedEmailBcc.splice(index, 1);
    }
    if (globalIndex >= 0) {
      this.selectedRecepientsList.splice(globalIndex, 1);
    }
    this.emitSelectedLanguagesBcc();
  }

  addTo(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.chipInput.inputElement;
      const value = event.value;
      const dataEmailSelect = value.split(' ');
      let emailSelect = '';
      dataEmailSelect.forEach((data) => {
        emailSelect = data;
      });
      const sel = emailSelect.replace('<', '');
      const se = sel.replace('>', '');
      if (this.validateEmail(se)) {
        // Add our language
        if ((value || '').trim() && this.allowOther) {
          this.selectedEmailTo.push({ label: value.trim(), value: value.trim() });
        }
      } else {
        // console.log('Error not email type!! : ', value);
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.sendEmailForm.get('to').setValue(null);
      this.sendEmailForm.get('to').setValue('');
    }
    this.emitSelectedLanguagesTo();
  }

  addCc(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.chipInput.inputElement;
      const value = event.value;
      const dataEmailSelect = value.split(' ');
      let emailSelect = '';
      dataEmailSelect.forEach((data) => {
        emailSelect = data;
      });
      const sel = emailSelect.replace('<', '');
      const se = sel.replace('>', '');
      if (this.validateEmail(se)) {
        // Add our language
        if ((value || '').trim() && this.allowOther) {
          this.selectedEmailCc.push({ label: value.trim(), value: value.trim() });
        }
      } else {
        // console.log('Error not email type!! : ', value);
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.sendEmailForm.get('cc').setValue(null);
      this.sendEmailForm.get('cc').setValue('');
    }
    this.emitSelectedLanguagesCc();
  }

  addBcc(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.chipInput.inputElement;
      const value = event.value;
      const dataEmailSelect = value.split(' ');
      let emailSelect = '';
      dataEmailSelect.forEach((data) => {
        emailSelect = data;
      });
      const sel = emailSelect.replace('<', '');
      const se = sel.replace('>', '');
      if (this.validateEmail(se)) {
        // Add our language
        if ((value || '').trim() && this.allowOther) {
          this.selectedEmailBcc.push({ label: value.trim(), value: value.trim() });
        }
      } else {
        // console.log('Error not email type!! : ', value);
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.sendEmailForm.get('bcc').setValue(null);
      this.sendEmailForm.get('bcc').setValue('');
    }
    this.emitSelectedLanguagesBcc();
  }

  resetValueTo() {
    this.sendEmailForm.get('to').patchValue('', { emitEvent: true });
  }
  resetValueCc() {
    this.sendEmailForm.get('cc').patchValue('', { emitEvent: true });
  }
  resetValueBcc() {
    this.sendEmailForm.get('bcc').patchValue('', { emitEvent: true });
  }

  computeGroupDetails() {
    const rncp_titles = this.sendEmailForm.get('rncp_titles').value.map((rncpItem) => rncpItem.id);
    let user_types = [];
    if (this.sendEmailForm.get('user_type_selection').value) {
      user_types = this.sendEmailForm.get('user_types').value.map((user_type_item) => user_type_item.id);
    }
    return { rncp_titles, user_types };
  }

  handleInputChange(fileInput: Event) {
    const file = (<HTMLInputElement>fileInput.target).files[0];
    if (file) {
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          if (resp) {
            this.attachmnetsPaths.push({
              path: resp.file_url,
              name: resp.file_name,
            });
          } else {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('OK'),
            });
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
    this.resetFileState();
  }
  resetFileState() {
    this.currentFile.nativeElement.value = '';
  }

  getRecipientsData() {
    this.subs.sink = this.sendEmailForm
      .get('to')
      .valueChanges.pipe(debounceTime(800))
      .subscribe((full_name) => {
        this.emailAddressesListTo = [];
        if (full_name && full_name.length) {
          this.subs.sink = this.mailboxService.getRecipientDataUsingName(full_name.toString()).subscribe(
            (mailList: any[]) => {
              if (mailList && mailList.length) {
                const difference = mailList
                  .filter(
                    (mail) =>
                      !this.selectedRecepientsList.includes(
                        (mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                          mail.first_name +
                          ' ' +
                          mail.last_name +
                          ' ' +
                          '<' +
                          mail.email +
                          '>',
                      ),
                  )
                  .concat(
                    this.selectedRecepientsList.filter(
                      (mail) =>
                        !this.selectedRecepientsList.includes(
                          (mail.civility !== 'neutral' ? mail.civility + ' ' : '') +
                            mail.first_name +
                            ' ' +
                            mail.last_name +
                            ' ' +
                            '<' +
                            mail.email +
                            '>',
                        ),
                    ),
                  );
                difference.forEach((mail) => {
                  if (mail.email !== undefined) {
                    this.emailAddressesListTo.push(
                      (mail.civility !== 'neutral' ? this.translate.instant(mail.civility) : '') +
                        ' ' +
                        mail.first_name +
                        ' ' +
                        mail.last_name +
                        ' ' +
                        '<' +
                        mail.email +
                        '>',
                    );
                  }
                });
              }
            },
            (err) => {
              this.authService.postErrorLog(err);
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
    this.subs.sink = this.sendEmailForm
      .get('cc')
      .valueChanges.pipe(debounceTime(800))
      .subscribe((full_name) => {
        this.emailAddressesListCc = [];
        if (full_name && full_name.length) {
          this.subs.sink = this.mailboxService.getRecipientDataUsingName(full_name.toString()).subscribe(
            (mailList: any[]) => {
              if (mailList && mailList.length) {
                const difference = mailList
                  .filter(
                    (mail) =>
                      !this.selectedRecepientsList.includes(
                        (mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                          mail.first_name +
                          ' ' +
                          mail.last_name +
                          ' ' +
                          '<' +
                          mail.email +
                          '>',
                      ),
                  )
                  .concat(
                    this.selectedRecepientsList.filter(
                      (mail) =>
                        !this.selectedRecepientsList.includes(
                          (mail.civility !== 'neutral' ? mail.civility + ' ' : '') +
                            mail.first_name +
                            ' ' +
                            mail.last_name +
                            ' ' +
                            '<' +
                            mail.email +
                            '>',
                        ),
                    ),
                  );
                difference.forEach((mail) => {
                  if (mail.email !== undefined) {
                    this.emailAddressesListCc.push(
                      (mail.civility !== 'neutral' ? this.translate.instant(mail.civility) : '') +
                        ' ' +
                        mail.first_name +
                        ' ' +
                        mail.last_name +
                        ' ' +
                        '<' +
                        mail.email +
                        '>',
                    );
                  }
                });
              }
            },
            (err) => {
              this.authService.postErrorLog(err);
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
    this.subs.sink = this.sendEmailForm
      .get('bcc')
      .valueChanges.pipe(debounceTime(800))
      .subscribe((full_name) => {
        this.emailAddressesListBcc = [];
        if (full_name && full_name.length) {
          this.subs.sink = this.mailboxService.getRecipientDataUsingName(full_name.toString()).subscribe(
            (mailList: any[]) => {
              if (mailList && mailList.length) {
                const difference = mailList
                  .filter(
                    (mail) =>
                      !this.selectedRecepientsList.includes(
                        (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                          mail.first_name +
                          ' ' +
                          mail.last_name +
                          ' ' +
                          '<' +
                          mail.email +
                          '>',
                      ),
                  )
                  .concat(
                    this.selectedRecepientsList.filter(
                      (mail) =>
                        !this.selectedRecepientsList.includes(
                          (mail.civility && mail.civility !== 'neutral' ? mail.civility + ' ' : '') +
                            mail.first_name +
                            ' ' +
                            mail.last_name +
                            ' ' +
                            '<' +
                            mail.email +
                            '>',
                        ),
                    ),
                  );
                difference.forEach((mail) => {
                  if (mail.email !== undefined) {
                    this.emailAddressesListBcc.push(
                      (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) : '') +
                        ' ' +
                        mail.first_name +
                        ' ' +
                        mail.last_name +
                        ' ' +
                        '<' +
                        mail.email +
                        '>',
                    );
                  }
                });
              }
            },
            (err) => {
              this.authService.postErrorLog(err);
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
  }

  getCurrentUser() {
    this.currentUser = this.userService.getLocalStorageUser();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getStepValidationImage() {
    let htmlString = '';
    const jpegImages = [];
    if (this.data.multiple) {
    } else {
      // htmlString = this.getStepValidationHTML(this.data);
      // const html = document.createElement('div');
      // html.innerHTML = '';
      // setTimeout(() => {
      //   function filter(node) {
      //     console.log(node.attributes);
      //     return node.tagName !== 'i';
      //   }
      //   domtoimage
      //     .toJpeg(html, { quality: 0.95, filter: filter })
      //     .then((dataUrl) => {
      //       this.attachmnetsPaths.push({
      //         path: dataUrl,
      //         name: 'my-image-name.jpeg',
      //       });
      //     })
      //     .catch((err) => console.log(err));
      // }, 5000);
    }
  }
  getStepValidationHTML(stepMessage) {
    return `
    <div class="validation-step"
    style="height: 30em;
          width: 30em;
          background: #3F3F3F;
          border-radius: 1%;
          padding: 4%;
          position: relative;
    ">
    <div class="title1"
      style="height: auto;
          width: 100%;
          text-align: center;
          padding: 2%;
          line-height: normal;">
      <h5 style="color: white;">${stepMessage.first_title}</h5>
    </div>
    <div class="media-container">
      <div>
        <img class="photo"
          style="height: auto; width: 100%; ${stepMessage.image_upload ? 'display: block;' : 'display: none;'}"
          src="${this.serverimgPath + stepMessage.image_upload}"
        />        
      </div>
      <iframe 
        width="300"
        height="290"
        style="height: auto; width: 100%; ${stepMessage.video_link ? 'display: block;' : 'display: none;'}"
        src="${stepMessage.video_link}"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowfullscreen
      >
      </iframe>
    </div>
    <div class="title2" 
      style="height: auto;
        width: 100%;
        text-align: center;
        padding: 2%;
        line-height: normal;
        position: absolute;
        bottom: 14%;
        width: 90%;">
      <h5 style="color: white;">${stepMessage.second_title}</h5>
    </div>
    <div class="actions"
      style="position: absolute;
        bottom: 5% !important;
        width: 90%;">
      <div 
        style="display: flex;
        padding-top: 14px;
        -webkit-box-pack: end;
        justify-content: space-between;">
        <button type="button" style="
          background-color: #607D8B;
          color: white;
          box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
          line-height: 30px;
          border-radius: 2px;
          margin-right: 0.3125rem;
          font-family: sans-serif;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center; padding-left: 5px;padding-right: 10px;">
           
              Return
        </button>
        <button 
          style="
            box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
            background-color: #ffd740;
            color: rgba(0, 0, 0, 0.87);
            font-size: 14px;
            line-height: 30px;
            border-radius: 2px;
            margin-right: 0.3125rem;
            font-family: sans-serif;
            font-weight: 500; display: flex; align-items: center; padding-left: 10px;padding-right: 10px"
          >
            Move to step ${stepMessage.validation_step}

        </button>
      </div>
    </div>
  </div>
    
    `;
  }
}
