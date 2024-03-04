import { DatePipe } from '@angular/common';
import { Component, OnInit, Output, Input, EventEmitter, OnDestroy, Inject, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { SchoolService } from 'app/service/schools/school.service';
import { StudentsService } from 'app/service/students/students.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { CustomValidators } from 'ng2-validation';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import * as moment from 'moment';
import { FinancesService } from 'app/service/finance/finance.service';
// import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { SpeechToTextDialogComponent } from 'app/shared/components/speech-to-text-dialog/speech-to-text-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { MailboxService } from 'app/service/mailbox/mailbox.service';

@Component({
  selector: 'ms-messages-students-dialog',
  templateUrl: './messages-students-dialog.component.html',
  styleUrls: ['./messages-students-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class MessagesStudentsDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  identityForm: UntypedFormGroup;
  today: Date;
  studentId: any;
  studentData: any;
  dataPass: any;
  indexTab: any;
  mailData: any;
  currentUser: any;
  isMainAddressSelected = false;
  public Editor = DecoupledEditor;
  @ViewChild('editor', { static: true }) editor: DecoupledEditor;
  public config = {
    placeholder: this.translate.instant('Note'),
    height: '20rem',
    toolbar: [
      'heading',
      '|',
      'fontsize',
      '|',
      'bold',
      'italic',
      'Underline',
      'strikethrough',
      'highlight',
      '|',
      'alignment',
      '|',
      'numberedList',
      'bulletedList',
      '|',
    ],
  };

  nationalitiesList = [];
  nationalList = [];
  nationalitySelected: string;

  countries;
  countryList;
  filteredCountry: any[][] = [];

  cities: string[][] = [];
  filteredCities: string[][] = [];

  departments: string[][] = [];
  filteredDepartments: string[][] = [];

  regions: string[][] = [];
  filteredRegions: string[][] = [];
  currencyList = [];
  private intVal: any;
  private timeOutVal: any;
  toFilterList = [
    { civility: 'Mrs', value: ' Mrs Anne CHAMBIER', key: 'Anne CHAMBIER' },
    { civility: 'Mr', value: 'Mr Fabien CHAMBIER', key: 'Fabien CHAMBIER' },
  ];
  transactionList = ['Down payment', 'Term 1', 'Term 2', 'Term 3', 'Term 4', 'Term 5', 'Term 6', 'Term 7', 'Term 8'];
  dataFinanceList = [];
  termsList = [];
  dataUser = [];
  constructor(
    public dialogRef: MatDialogRef<MessagesStudentsDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private parseStringDatePipe: ParseStringDatePipe,
    private acadJourneyService: AcademicJourneyService,
    private financeService: FinancesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private mailboxService: MailboxService,
    private autService: AuthService,
  ) {}

  ngOnInit() {
    this.currentUser = this.autService.getLocalStorageUser();
    this.today = new Date();
    this.iniVerificationForm();
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe(
      (list: any[]) => {
        this.currencyList = list;
      },
      (err) => {
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
    if (this.data.terms && this.data.terms.length) {
      this.data.terms.forEach((element, index) => {
        element.term = index + 1;
      });
      this.termsList = this.data.terms.filter((list) => list.is_term_paid === false || list.term_amount !== list.term_pay_amount);
      this.termsList = this.termsList.sort((a, b) => {
        return moment.utc(a.term_payment_deferment).diff(moment.utc(b.term_payment_deferment));
      });
      console.log(this.termsList);
    }
    const dataStudent = {
      civility: this.data.candidate_id.civility,
      email: this.data.candidate_id.email,
      last_name: this.data.candidate_id.last_name,
      first_name: this.data.candidate_id.first_name,
      value:
        (this.data.candidate_id.civility !== 'neutral' ? this.translate.instant(this.data.candidate_id.civility) + ' ' : '') +
        this.data.candidate_id.first_name +
        ' ' +
        this.data.candidate_id.last_name,
    };
    if (this.data && this.data.financial_supports && this.data.financial_supports.length) {
      this.dataFinanceList = this.data.financial_supports.map((list) => {
        return {
          civility: list.civility,
          email: list.email,
          last_name: list.family_name,
          first_name: list.name,
          value: (list.civility !== 'neutral' ? this.translate.instant(list.civility) + ' ' : '') + list.name + ' ' + list.family_name,
        };
      });
      this.dataFinanceList.push(dataStudent);
    }
  }

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }
  iniVerificationForm() {
    this.identityForm = this.fb.group({
      payment_method: [null],
      amount: [null],
      who: [null],
      transaction: [null],
      credit: [false],
      transfer: [false],
      cheque: [false],
      currency: ['EUR'],
      date: [this.today, Validators.required],
      reference: [null, Validators.required],
      note: [null, Validators.required],
    });
  }

  checkPayment(data) {
    if (data === 'credit') {
      this.identityForm.get('payment_method').setValue('bank');
      this.identityForm.get('credit').setValue(true);
      this.identityForm.get('transfer').setValue(false);
      this.identityForm.get('cheque').setValue(false);
    } else if (data === 'transfer') {
      this.identityForm.get('payment_method').setValue('transfer');
      this.identityForm.get('credit').setValue(false);
      this.identityForm.get('transfer').setValue(true);
      this.identityForm.get('cheque').setValue(false);
    } else if (data === 'cheque') {
      this.identityForm.get('payment_method').setValue('check');
      this.identityForm.get('credit').setValue(false);
      this.identityForm.get('transfer').setValue(false);
      this.identityForm.get('cheque').setValue(true);
    }
  }

  submitVerification() {
    const receiversArray = [];
    this.mailData = {};
    // let senderArray = {
    //   sender: this.currentUser.email,
    //   is_read: false,
    //   mail_type: 'sent',
    // };
    receiversArray.push({ recipients: this.data.candidate_id.email, rank: 'a', is_read: false, mail_type: 'inbox' });
    const MailAttachment = [];
    const MailAttachment1 = [];

    this.mailData.sender_property = {
      sender: this.currentUser.email,
      is_read: false,
      mail_type: 'sent',
    };
    this.mailData.recipient_properties = receiversArray;
    this.mailData.subject = '';
    this.mailData.message = 'Bloquer l`apprenant';
    this.mailData.is_sent = true;
    this.mailData.status = 'active';
    this.mailData.is_urgent_mail = true;
    // this.mailData.is_urgent_mail = this.isUrgentFlag;
    this.mailData.tags = ['sent'];
    console.log('payload ', this.mailData);
    this.subs.sink = this.mailboxService.createMail(this.mailData).subscribe(
      (datas: any) => {
        const payload = {
          is_student_blocked: true,
        };
        this.subs.sink = this.financeService.UpdateBilling(payload, this.data._id).subscribe(
          (list) => {
            console.log('Data Updated', list);
            this.dialogRef.close(true);
            Swal.fire({
              type: 'success',
              title: this.translate.instant('PAYMENT_FOLLOW_S3.TITLE'),
              html: this.translate.instant('PAYMENT_FOLLOW_S3.TEXT', {
                candidateName:
                  (this.data.candidate_id.civility !== 'neutral' ? this.translate.instant(this.data.candidate_id.civility) + ' ' : '') +
                  this.data.candidate_id.first_name +
                  ' ' +
                  this.data.candidate_id.last_name,
              }),
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('PAYMENT_FOLLOW_S3.BUTTON'),
              onOpen: (modalEl) => {
                modalEl.setAttribute('data-cy', 'swal-payment-follow-s3');
              },
            }).then((resss) => {});
          },
          (err) => {
            this.dialogRef.close(true);
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      },
      (err) => {
        this.dialogRef.close(true);
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

  closeDialog() {
    this.dialogRef.close();
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
        const editorInstance = this.editor.editorInstance;
        if (text.trim()) {
          const voiceText = `${text}`;
          const displayText = editorInstance.getData() + voiceText;
          editorInstance.setData(displayText);
        }
      });
  }
  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }
}
