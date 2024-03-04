import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormArray } from '@angular/forms';
import { UrgentMessageService } from 'app/service/urgent-message/urgent-message.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { UserService } from 'app/service/user/user.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { UsersService } from 'app/service/users/users.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
// import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { SpeechToTextDialogComponent } from 'app/shared/components/speech-to-text-dialog/speech-to-text-dialog.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'ms-reply-urgent-message-dialog',
  templateUrl: './reply-urgent-message-dialog.component.html',
  styleUrls: ['./reply-urgent-message-dialog.component.scss'],
})
export class ReplyUrgentMessageDialogComponent implements OnInit {
  private subs = new SubSink();
  public Editor = DecoupledEditor;
  @ViewChild('editor', { static: true }) editor: DecoupledEditor;

  replyMessageForm: UntypedFormGroup;
  datePipe: any;
  mailData: any;
  recpList: any;
  currentUser: any;
  messageMail: any;
  checked;
  isWaitingForResponse = false;
  titles = [];
  autocompleteUsers = [];
  autocompleteUserTypes = [];
  attachmnetsPaths = [];
  allowedFileType;
  @ViewChild('myInput', { static: false }) currentFile: any;

  constructor(
    public dialogRef: MatDialogRef<ReplyUrgentMessageDialogComponent>,
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private urgentMessageService: UrgentMessageService,
    private userService: UserService,
    private autService: AuthService,
    private rncpTitleService: RNCPTitlesService,
    private mailboxService: MailboxService,
    public translate: TranslateService,
    private fileUploadService: FileUploadService,
    public dialog: MatDialog,
  ) {}

  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  ngOnInit() {
    this.initializeForm();
    this.currentUser = this.autService.getLocalStorageUser();
    this.messageMail = this.data ? this.data[0] : [];

    const doc = ['.doc', '.docx', '.ppt', '.pptx', '.txt', '.pdf', '.xlsx', '.xls'];
    const img = [
      'tiff',
      '.pjp',
      '.jfif',
      '.gif',
      '.svg',
      '.bmp',
      '.png',
      '.jpeg',
      '.svgz',
      '.jpg',
      '.webp',
      '.ico',
      '.xbm',
      '.dib',
      '.tif',
      '.pjpeg',
      '.avif',
    ];
    const vid = ['ogm', '.wmv', '.mpg', '.webm', '.ogv', '.mov', '.asx', '.mpeg', '.mp4', '.m4v', '.avi'];
    this.allowedFileType = doc.concat(img).concat(vid).join(',');
  }

  closeDialog() {
    this.dialogRef.close();
  }

  initializeForm() {
    this.replyMessageForm = this.fb.group({
      message: ['', Validators.required],
      attachment: [''],
    });
  }

  recordNote() {
    this.dialog
      .open(SpeechToTextDialogComponent, {
        width: '800px',
        minHeight: '300px',
        panelClass: 'candidate-note-record',
        disableClose: true,
        data: '',
      })
      .afterClosed()
      .subscribe((text) => {
        // const editorInstance = this.editor.editorInstance;
        if (text.trim()) {
          this.replyMessageForm.get('message').setValue(text);
        }
      });
  }

  AddMailBody(Caption) {
    let body = '';
    body += Caption;
    body += '<p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>';
    body += '------------Message------------';
    body += '<br/><b> ' + this.translate.instant('MailBox.from') + '</b> : ';
    body += this.getSenderFullName(this.data[0].sender_property);
    body += '<br/><b> ' + this.translate.instant('MailBox.to') + '</b> : ';
    body += this.getRecipientFullName(this.data[0].recipient_properties);
    body += '<br/><b> Date </b> : ' + this.getTranslatedDate(this.data[0].created_at);
    body += '<br/><b> ' + this.translate.instant('MailBox.composeMail.subject') + ' </b> : ' + this.data[0].subject;
    body += '<br/><br/>';
    body += this.data[0].message;
    return body;
  }

  /* for share mail to 1001 ideas */
  getSenderFullName(sender_propertys) {
    const sender_property = sender_propertys;
    if (sender_property) {
      if (sender_property.sender) {
        if (sender_property.sender.hasOwnProperty('sender')) {
          const recObj = sender_property.sender.civility + ' ' + sender_property.sender.first_name + ' ' + sender_property.sender.last_name;
          return recObj;
        } else {
          return sender_property.sender.civility + ' ' + sender_property.sender.first_name + ' ' + sender_property.sender.last_name;
        }
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  getRecipientFullName(recipient_propertiess) {
    const recipient_properties = recipient_propertiess;
    if (recipient_properties) {
      const recip = recipient_properties.filter((rec) => rec.recipients[0].email === this.currentUser.email);
      if (recip) {
        // console.log('recip', recip);
        const senderObj = recip[0].recipients[0];
        return senderObj.civility + ' ' + senderObj.first_name + ' ' + senderObj.last_name;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  getTranslatedDate(dateRaw) {
    if (typeof dateRaw === 'object') {
      const date = new Date(dateRaw.year, dateRaw.month, dateRaw.date, dateRaw.hour, dateRaw.minute);
      this.datePipe = new DatePipe(this.translate.currentLang);
      return this.datePipe.transform(date, 'EEE d MMM, y');
    } else {
      let date = dateRaw;
      if (typeof date === 'number') {
        date = date.toString();
      }
      if (date.length === 8) {
        const year: number = parseInt(date.substring(0, 4));
        const month: number = parseInt(date.substring(4, 6));
        const day: number = parseInt(date.substring(6, 8));
        date = new Date(year, month, day);
      }
      this.datePipe = new DatePipe(this.translate.currentLang);
      return this.datePipe.transform(date, 'EEE d MMM, y');
    }
  }

  sendMessage(): void {
    const formValues = this.replyMessageForm.value;
    if (formValues.message !== '' && formValues.message !== undefined) {
      const receiversArray = [];
      this.mailData = {};
      const recipient = this.data;
      const sender = this.data[0];
      recipient.forEach((element) => {
        receiversArray.push({ recipients: element.sender_property.sender.email, rank: 'a', is_read: false, mail_type: 'inbox' });
      });
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
      this.mailData.sender_property = {
        sender: this.currentUser.email,
        is_read: false,
        mail_type: 'sent',
      };
      this.mailData.recipient_properties = receiversArray;
      this.mailData.subject = 'RE : ' + this.messageMail.subject;
      this.mailData.message = this.AddMailBody(formValues.message);
      this.mailData.is_sent = true;
      this.mailData.status = 'active';
      this.mailData.is_urgent_mail = true;
      this.mailData.attachments = MailAttachment1;
      this.mailData.file_attachments = MailAttachment;
      this.mailData.tags = ['reply-mail'];
      // console.log('payload ', this.mailData);
      this.subs.sink = this.mailboxService.createMail(this.mailData).subscribe(
        (data: any) => {
          this.dialogRef.close(data);
          // console.log('Masuk Sini Ndak? 1');
          let recipient_properties = {};
          recipient_properties = {
            is_read: true,
          };
          this.subs.sink = this.mailboxService.updateMultipleMailRecipient(this.messageMail._id, recipient_properties).subscribe(
            (resp) => {
              Swal.fire({
                title: this.translate.instant('URGENTMESSAGE_S2.TITLE'),
                html: this.translate.instant('URGENTMESSAGE_S2.TEXT', {
                  CivilityUrgentMessageCreator: sender.sender_property.sender.civility,
                  NameUrgentMessageCreator: sender.sender_property.sender.first_name,
                  LastNameUrgentMessageCreator: sender.sender_property.sender.last_name,
                }),
                allowEscapeKey: true,
                type: 'success',
                confirmButtonText: this.translate.instant('URGENTMESSAGE_S2.BUTTON'),
              });
              this.dialogRef.close(data);
              // console.log('Masuk Sini Ndak? 1', this.dialogRef.close());
            },
            (err) => {
              this.autService.postErrorLog(err);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            },
          );
          this.dialogRef.close(data);
          // console.log('Masuk Sini Ndak?');
        },
        (err) => {
          this.autService.postErrorLog(err);
          this.dialogRef.close('');
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

  getMessage(data) {
    if (data) {
      data = data.replaceAll('<table>', '<table class="notif-table full-width" border="1">');
      if (data && data.includes('<a')) {
        if (data && !data.includes('target')) {
          data = data.replaceAll('<a', '<a target="blank" class="blue-link-format"');
        }
      }
      return data;
    } else {
      return '';
    }
  }

  openUploadWindow() {
    this.currentFile.nativeElement.click();
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
            // console.log('File : ', this.attachmnetsPaths);
          }
        },
        (err) => {
          this.autService.postErrorLog(err);
          // console.log('[Response BE][Error] : ', err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: 'OK',
          });
        },
      );
    }
    this.resetFileState();
  }

  resetFileState() {
    this.currentFile.nativeElement.value = '';
  }

  removeAttachment(file) {
    this.attachmnetsPaths.splice(this.attachmnetsPaths.indexOf(file), 1);
  }

  momentlang(event) {
    const dateRaw: any = moment(event).format('DD/MM/YYYY');
    if (typeof dateRaw === 'object') {
      const date = new Date(dateRaw.year, dateRaw.month, dateRaw.date, dateRaw.hour, dateRaw.minute);
      this.datePipe = new DatePipe(this.translate.currentLang);
      return this.datePipe.transform(date, 'EEE d MMM, y');
    } else {
      let date = dateRaw;
      if (typeof date === 'number') {
        date = date.toString();
      }
      if (date.length === 8) {
        const year: number = parseInt(date.substring(0, 4));
        const month: number = parseInt(date.substring(4, 6));
        const day: number = parseInt(date.substring(6, 8));
        date = new Date(year, month, day);
      }
      this.datePipe = new DatePipe(this.translate.currentLang);
      const formatDate = moment(date, 'DD/MM/YYYY');
      const dateTranslate = this.datePipe.transform(formatDate, 'EEEE d MMMM y');
      return dateTranslate;
    }
  }

  translateTime(data) {
    return moment(data, 'HH:mm').format('H:mm');
  }
}
