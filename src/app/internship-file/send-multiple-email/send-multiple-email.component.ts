import { Component, OnInit, Inject, ViewChild, ElementRef, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
// import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormControl, UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { ENTER, COMMA, E } from '@angular/cdk/keycodes';
import { AuthService } from 'app/service/auth-service/auth.service';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import Swal from 'sweetalert2';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { debounceTime, single } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { AddDocumentBuilderDialogComponent } from 'app/students-table/add-document-builder-dialog/add-document-builder-dialog.component';
import { StudentsTableService } from 'app/students-table/StudentTable.service';
import { environment } from 'environments/environment';
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
  selector: 'ms-send-multiple-email',
  templateUrl: './send-multiple-email.component.html',
  styleUrls: ['./send-multiple-email.component.scss'],
})
export class SendMultipleEmailComponent implements OnInit {
  sendEmailForm: UntypedFormGroup;
  private subs = new SubSink();
  public Editor = DecoupledEditor;
  showCC = false;
  showBCC = false;
  public config = {};
  isPermission: any;
  isInvoiceDisplay = true;

  @ViewChild('languagesInput', { static: false }) languagesInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
  @ViewChild('myInput', { static: false }) currentFile: any;

  preSelectedEmail: string;
  listIntakeChannel = [
    { value: '20-21 EFANEW 1', name: '20-21 EFANEW 1' },
    { value: '20-21 EFANEW 2', name: '20-21 EFANEW 2' },
    { value: '20-21 EFANEW 3', name: '20-21 EFANEW 3' },
    { value: '20-21 EFANEW 4', name: '20-21 EFANEW 4' },
    { value: '20-21 EFANEW 5', name: '20-21 EFANEW 5' },
  ];

  @Input() allowOther = false;
  @Input() returnType: ReturnType = ReturnType.LABEL;
  @Output() optionSelected: EventEmitter<(string | InputType)[]> = new EventEmitter();

  attachmnetsPaths = [];
  currentUser;
  categoryName: any;
  subjectName: any;
  mailData: any;
  isGroupEmail = false;
  isWaitingForResponse = false;
  recipientList = [];
  listDocumentBuilder = [];
  addDocumentBuilderDialogComponent: MatDialogRef<AddDocumentBuilderDialogComponent>;
  triggeredFromStudent = false;
  triggeredFromFinance = false;
  isForInvoice: boolean = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public translate: TranslateService,
    private userService: AuthService,
    private mailboxService: MailboxService,
    private fileUploadService: FileUploadService,
    public dialogref: MatDialogRef<SendMultipleEmailComponent>,
    private fb: UntypedFormBuilder,
    private studentsService: StudentsTableService,
    public dialog: MatDialog,
  ) {
    this.sendEmailForm = this.fb.group({
      subject: ['', Validators.required],
      message: ['', Validators.required],
    });
  }

  ngOnInit() {
    console.log('parent data ', this.data);
    this.triggeredFromStudent =
      this.data && this.data.length && this.data[0].triggeredFromStudent ? this.data[0].triggeredFromStudent : null;
    if (this.data && this.data.length && this.data[0].triggeredFromFinance) {
      this.triggeredFromFinance = this.data[0].triggeredFromFinance;
    }
    this.isPermission = this.userService.getPermission();
    this.currentUser = this.userService.getLocalStorageUser();
    // Mapped data from table multiple student (candidate)
    this.handlePayloadData();
    this.getEmailMessage();
  }

  handlePayloadData() {
    if (this.data && this.data.length > 0 && !this.data.fromCandidate) {
      // create payload for recipient if not select all
      const mappedRecipient = this.data.map((newData) => {
        if (newData && newData.candidate) {
          const candidate = {
            recipients: [newData.candidate.emailDefault ? newData.candidate.emailDefault : newData.candidate.email],
            rank: 'a',
            is_read: false,
            mail_type: 'inbox',
            candidate_id: newData?.candidate?._id || newData?.candidate?.candidate_id?._id || null,
          };
          this.recipientList.push(candidate);
        }
        if (newData && newData.financial_supp && newData.financial_supp.email && newData.financial_supp.email.length > 0) {
          newData.financial_supp.email.forEach((financialEmail) => {
            const financial = {
              recipients: [financialEmail],
              rank: 'a',
              is_read: false,
              mail_type: 'inbox',
              candidate_id: newData.candidate?._id || null,
            };
            this.recipientList.push(financial);
          });
        }
      });
      // console.log('_test', this.recipientList);
    }
  }

  removeAttachment(file) {
    const indxForm = this.listDocumentBuilder.indexOf(file?.document_id);
    if (indxForm >= 0) {
      this.listDocumentBuilder.splice(indxForm, 1);
    }
    if (file?.is_from_builder) {
      const indxAttact = this.attachmnetsPaths.findIndex((doc) => doc?.document_id === file?.document_id);
      if (indxAttact >= 0) {
        this.attachmnetsPaths.splice(indxAttact, 1);
      }
    } else {
      if (file?.document_id === 'Invoice') {
        const indxAttact = this.attachmnetsPaths.findIndex((doc) => doc?.document_id === file?.document_id);
        if (indxAttact >= 0) {
          this.attachmnetsPaths.splice(indxAttact, 1);
        }
      } else {
        const indxAttact = this.attachmnetsPaths.findIndex((doc) => doc?.file_name === file?.file_name);
        if (indxAttact >= 0) {
          this.attachmnetsPaths.splice(indxAttact, 1);
        }
      }
    }
  }

  getEmailMessage() {
    // ************ Get Greeting Data
    let greeting = '';
    if (this.data && this.data.length) {
      greeting += this.translate.instant('Hello');
    }

    let signat = '';
    // signat = signat + this.translate.instant(this.data.civility) + ' ' + this.data.first_name + ' ' + this.data.last_name + ', ';
    signat += `<p></p><p></p><p></p><p></p>`;
    signat +=
      (this.currentUser.civility !== 'neutral' ? this.translate.instant(this.currentUser.civility) : '') +
      ' ' +
      this.currentUser.first_name +
      ' ' +
      this.currentUser.last_name;
    const entity = this.currentUser.entities.filter((ent) => ent.type.name === this.isPermission[0]);
    const dataUnix = _.uniqBy(entity, 'school.short_name');
    signat +=
      this.currentUser?.position ? ',<br>' + this.currentUser?.position : '';
    signat +=
      dataUnix && dataUnix.length && dataUnix[0].school && dataUnix[0].school.short_name ? ',<br>' + dataUnix[0].school.short_name : '';
    this.sendEmailForm.get('message').setValue(greeting + signat);
  }

  validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
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
        }
        if (result.dismiss) {
          this.dialogref.close();
        }
      });
  }

  createPayloadSendMail() {
    this.isForInvoice = false;
    const emailForm = this.sendEmailForm.value;
    let temp = {
      sender_property: {
        sender: this.currentUser.email,
        is_read: false,
        mail_type: 'sent',
      },
      recipient_properties: this.data && this.data.fromCandidate ? [] : this.recipientList,
      subject: emailForm.subject ? emailForm.subject : '',
      message: emailForm.message ? emailForm.message : '',
      is_sent: true,
      status: 'active',
      is_urgent_mail: false,
      attachments: [],
      document_builder_ids: [],
      file_attachments: [],
      tags: ['sent'],
      lang: this.translate.currentLang,
    };

    if (this.attachmnetsPaths && this.attachmnetsPaths.length) {
      this.attachmnetsPaths.forEach((files) => {
        if (files && files.path) {
          const obj = {
            file_name: files.is_from_builder ? files.path : files.file_name ? files.file_name : files.name,
            path: files.path,
          };
          temp.attachments.push(files.is_from_builder ? files.path : files.file_name);
          temp.file_attachments.push(obj);
        }
        if (files && files.document_id === 'Invoice') {
          this.isForInvoice = true;
        }
      });
    }

    if (this.listDocumentBuilder && this.listDocumentBuilder.length) {
      temp.document_builder_ids = this.listDocumentBuilder;
    }

    if (this.data && this.data.length && this.data.fromCandidate) {
      this.data.forEach((students) => {
        if (students) {
          const student = {
            recipients: [students.emailDefault ? students.emailDefault : students.email],
            rank: 'a',
            is_read: false,
            mail_type: 'inbox',
            candidate_id: students?._id || students?.candidate?._id || null,
          };
          temp.recipient_properties.push(student);
        }
      });
    }

    return temp;
  }

  sendMail() {
    this.isWaitingForResponse = true;
    const payload = this.createPayloadSendMail();
    console.log('send', payload);
    this.subs.sink = this.mailboxService
      .CreateMailForMultipleRecipientsInvoice(payload, this.isInvoiceDisplay, this.isForInvoice)
      .subscribe(
        (resp) => {
          if (String(resp).includes('recipient is more than 50, mail is still process sending')) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SEND_EMAIL_S1.TITLE'),
              html: this.translate.instant('SEND_EMAIL_S1.TEXT'),
              confirmButtonText: this.translate.instant('SEND_EMAIL_S1.BUTTON'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            }).then(() => {
              this.isWaitingForResponse = false;
              this.dialogref.close(true);
            });
          } else if (resp) {
            swal
              .fire({
                title: this.translate.instant('MailBox.composeMail.MESSAGES.TITLE'),
                text: this.translate.instant('MailBox.composeMail.MESSAGES.TEXT'),
                allowEscapeKey: true,
                type: 'success',
                confirmButtonText: this.translate.instant('MailBox.composeMail.MESSAGES.CONFIRMBTN'),
              })
              .then(() => {
                this.isWaitingForResponse = false;
                this.dialogref.close(true);
              });
          }
        },
        (err) => {
          this.userService.postErrorLog(err);
          if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('BAD_CONNECTION.Title'),
              html: this.translate.instant('BAD_CONNECTION.Text'),
              confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          } else {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
  }

  handleInputChange(fileInput: Event) {
    const file = (<HTMLInputElement>fileInput.target).files[0];
    if (file) {
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          if (resp) {
            this.attachmnetsPaths.push({
              path: resp.file_url,
              file_name: resp.file_name,
              is_from_builder: false,
              document_id: null,
              invoice_name: '',
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
          this.userService.postErrorLog(err);
          if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('BAD_CONNECTION.Title'),
              html: this.translate.instant('BAD_CONNECTION.Text'),
              confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          } else {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    }
    this.resetFileState();
  }

  resetFileState() {
    this.currentFile.nativeElement.value = '';
  }

  getCurrentUser() {
    this.currentUser = this.userService.getLocalStorageUser();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  saveDraft() {
    const payload = this.createDraftPayload();
    // console.log('draftPayload', payload);
    this.subs.sink = this.mailboxService
      .CreateMailForMultipleRecipientsInvoice(payload, this.isInvoiceDisplay, this.isForInvoice)
      .subscribe(
        (resp) => {
          if (resp) {
            swal.fire({
              type: 'info',
              title: this.translate.instant('MailBox.MESSAGES.DRAFTMSG'),
              text: '',
              confirmButtonText: this.translate.instant('MailBox.MESSAGES.THANK'),
              onOpen: (modelEl) => {
                modelEl.setAttribute('data-cy', 'swal-mailbox');
              },
            });
          }
        },
        (err) => {
          this.userService.postErrorLog(err);
          if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('BAD_CONNECTION.Title'),
              html: this.translate.instant('BAD_CONNECTION.Text'),
              confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          } else {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
  }
  createDraftPayload() {
    this.isForInvoice = false;
    const emailForm = this.sendEmailForm.value;
    let temp = {
      sender_property: {
        sender: this.currentUser.email,
        is_read: false,
        mail_type: 'draft',
      },
      recipient_properties: [],
      subject: emailForm.subject ? emailForm.subject : '',
      message: emailForm.message ? emailForm.message : '',
      is_sent: false,
      status: 'active',
      is_urgent_mail: false,
      attachments: [],
      document_builder_ids: [],
      file_attachments: [],
      tags: ['draft'],
      lang: this.translate.currentLang,
    };

    if (this.attachmnetsPaths && this.attachmnetsPaths.length) {
      this.attachmnetsPaths.forEach((files) => {
        if (files && files.path) {
          const obj = {
            file_name: files.is_from_builder ? files.path : files.file_name ? files.file_name : files.name,
            path: files.path,
          };
          temp.attachments.push(files.is_from_builder ? files.path : files.file_name);
          temp.file_attachments.push(obj);
        }
        if (files && files.document_id === 'Invoice') {
          this.isForInvoice = true;
        }
      });
    }
    if (this.listDocumentBuilder && this.listDocumentBuilder.length) {
      temp.document_builder_ids = this.listDocumentBuilder;
    }

    if (this.data && this.data.length && this.data.fromCandidate) {
      this.data.forEach((students) => {
        if (students) {
          const student = {
            recipients: [students.emailDefault ? students.emailDefault : students.email],
            rank: 'a',
            is_read: false,
            mail_type: 'draft',
            candidate_id: students?.candidate?._id || null,
          };
          temp.recipient_properties.push(student);
        } else {
          return;
        }
      });
    } else {
      const recipientList = _.cloneDeep(this.recipientList);
      recipientList.forEach((users) => {
        if (users) {
          users.mail_type = 'draft';
        } else {
          return;
        }
      });
      temp.recipient_properties = recipientList;
    }

    return temp;
  }
  addDoc() {
    console.log('data', this.data);
    this.addDocumentBuilderDialogComponent = this.dialog.open(AddDocumentBuilderDialogComponent, {
      width: '600px',
      minHeight: '100px',
      disableClose: true,
      data: {
        _id: this.data && this.data.candidate ? this.data.candidate._id : null,
        student: this.data && this.data.candidate ? this.data.candidate : null,
        is_multiple: true,
        candidate_data: this.data,
        isFromFinance: this.triggeredFromFinance,
      },
    });
    this.subs.sink = this.addDocumentBuilderDialogComponent.afterClosed().subscribe((result) => {
      if (result) {
        if (result.document_builder_name === 'Invoice') {
          this.attachmnetsPaths.push({
            path: null,
            file_name: result.document_id,
            is_from_builder: false,
            document_id: 'Invoice',
            invoice_name: result.invoice_name,
          });
        } else {
          this.listDocumentBuilder.push(result.document_id);
          this.attachmnetsPaths.push({
            path: null,
            file_name: result.document_builder_name,
            is_from_builder: true,
            document_id: result.document_id,
            invoice_name: '',
          });
        }
      }
    });
  }

  openAttachment(file) {
    if (file.is_from_builder && this.data && this.data.length) {
      this.isWaitingForResponse = true;
      const candidate_id = this.data[0]?.candidate?.candidate_id?._id || this.data[0]?._id || this.data[0]?.candidate?._id || null;
      this.subs.sink = this.studentsService.GenerateDocumentBuilderPDFForStudent(candidate_id, file.document_id).subscribe(
        (list) => {
          this.isWaitingForResponse = false;
          const a = document.createElement('a');
          a.target = '_blank';
          a.href = `${environment.apiUrl}/fileuploads/${list}`.replace('/graphql', '');
          a.download = file.file_name;
          a.click();
          a.remove();
        },
        (err) => {
          this.userService.postErrorLog(err);
          this.isWaitingForResponse = false;
          console.log('err', err);
          this.userService.postErrorLog(err);
          if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('BAD_CONNECTION.Title'),
              html: this.translate.instant('BAD_CONNECTION.Text'),
              confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          } else {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    } else if (file.document_id && file.document_id === 'Invoice') {
      const path = `${ApplicationUrls.baseApi}/fileuploads/${file.invoice_name}`.replace('/graphql', '');
      const a = document.createElement('a');
      a.target = '_blank';
      a.href = path;
      a.download = file.invoice_name;
      a.click();
      a.remove();
    }
  }
}
