import { DatePipe } from '@angular/common';
import { Component, OnInit, Output, Input, EventEmitter, OnDestroy, Inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
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
import { MessagesStudentsDialogComponent } from '../messages-students-dialog/messages-students-dialog.component';

@Component({
  selector: 'ms-block-students-dialog',
  templateUrl: './block-students-dialog.component.html',
  styleUrls: ['./block-students-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class BlockStudentsDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  identityForm: UntypedFormGroup;
  today: Date;
  studentId: any;
  studentData: any;
  dataPass: any;
  indexTab: any;
  isMainAddressSelected = false;

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
  mailStudentsDialog: MatDialogRef<MessagesStudentsDialogComponent>;
  constructor(
    public dialogRef: MatDialogRef<BlockStudentsDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private parseStringDatePipe: ParseStringDatePipe,
    private acadJourneyService: AcademicJourneyService,
    private financeService: FinancesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    console.log('_data ', this.data);

    this.today = new Date();
    this.iniVerificationForm();
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe((list: any[]) => {
      this.currencyList = list;
    }, (err) => {
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
      } else{
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    }
    });
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
    const credit = this.identityForm.get('credit').value;
    const transfer = this.identityForm.get('transfer').value;
    const cheque = this.identityForm.get('cheque').value;
    if (!credit && !transfer && !cheque) {
      this.identityForm.get('payment_method').setValue(null);
      this.identityForm.get('credit').setValue(false);
      this.identityForm.get('transfer').setValue(false);
      this.identityForm.get('cheque').setValue(false);
      return;
    }
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
    this.subs.sink = this.dialog
      .open(MessagesStudentsDialogComponent, {
        disableClose: true,
        width: '750px',
        minHeight: '100px',
        data: this.data,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.dialogRef.close(true);
        }
      });
  }
  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }
}
