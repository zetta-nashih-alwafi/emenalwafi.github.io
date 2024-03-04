import { DatePipe } from '@angular/common';
import { Component, OnInit, Output, Input, EventEmitter, OnDestroy, Inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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

@Component({
  selector: 'ms-decaissement-dialog',
  templateUrl: './decaissement-dialog.component.html',
  styleUrls: ['./decaissement-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class DecaissementDialogComponent implements OnInit, OnDestroy {
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

  bank = [
    'BNP Paribas',
    'Credit Agricole',
    'BPCE',
    'Societe Generale',
    'Groupe Crédit Mutuel',
    'Crédit Cooperatif',
    'La Banque Postale',
    'Crédit du Nord',
    'AXA Banque',
    'Banque Palatine',
    'HSBC France',
    'CIC Banque Transatlantique',
    'BRED Banque Populaire',
  ];
  cities: string[][] = [];
  filteredCities: string[][] = [];

  departments: string[][] = [];
  filteredDepartments: string[][] = [];
  dataLegalEntity: any;
  regions: string[][] = [];
  filteredRegions: string[][] = [];
  dataFinanceList = [];
  currencyList = [];
  private intVal: any;
  private timeOutVal: any;
  toFilterList = [
    { civility: 'Mrs', value: ' Mrs Anne CHAMBIER', key: 'Anne CHAMBIER' },
    { civility: 'Mr', value: 'Mr Fabien CHAMBIER', key: 'Fabien CHAMBIER' },
  ];
  constructor(
    public dialogRef: MatDialogRef<DecaissementDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private parseStringDatePipe: ParseStringDatePipe,
    private acadJourneyService: AcademicJourneyService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private financeService: FinancesService,
  ) {}

  ngOnInit() {
    this.today = new Date();
    this.iniVerificationForm();
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe((list: any[]) => {
      this.currencyList = list;
    }, (err) => {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
    this.getLegalEntity();
    const dataStudent = {
      civility: this.data.student_id.civility,
      email: this.data.student_id.email,
      last_name: this.data.student_id.last_name,
      first_name: this.data.student_id.first_name,
      value:
        (this.data.student_id.civility !== 'neutral' ? this.translate.instant(this.data.student_id.civility) + ' ' : '') +
        this.data.student_id.first_name +
        ' ' +
        this.data.student_id.last_name,
    };
    if (this.data && this.data.financial_supports && this.data.financial_supports.length) {
      this.dataFinanceList = this.data.financial_supports.map((list) => {
        return {
          civility: list.civility,
          email: list.email,
          last_name: list.family_name + ' (' + this.translate.instant('CARDDETAIL.RELATION.' + list.relation) + ')',
          first_name: list.name,
          value:
            (list.civility !== 'neutral' ? this.translate.instant(list.civility) + ' ' : '') +
            list.name +
            ' ' +
            list.family_name +
            ' (' +
            this.translate.instant('CARDDETAIL.RELATION.' + list.relation) +
            ')',
        };
      });
    }
    this.dataFinanceList.push(dataStudent);
  }

  iniVerificationForm() {
    this.identityForm = this.fb.group({
      payment_method: [null, Validators.required],
      from: [null, Validators.required],
      who: [null, Validators.required],
      amount: [null],
      credit: [false],
      transfer: [false],
      cheque: [false],
      currency: ['EUR'],
      date: [this.today, Validators.required],
      reference: [null, Validators.required],
      note: [null, Validators.required],
      bank: [null, Validators.required],
    });
  }

  onWheel(event: Event) {
    event?.preventDefault();
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

  getLegalEntity() {
    this.subs.sink = this.financeService.GetLegalEntityByStudent(this.data.student_id._id).subscribe((resp) => {
      if (resp) {
        this.dataLegalEntity = resp;
        console.log('dataLegalEntity', this.dataLegalEntity);
        this.identityForm.get('from').setValue(this.dataLegalEntity.name);
      }
    }, (err) => {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  submitVerification() {
    const payload = _.cloneDeep(this.identityForm.value);
    console.log('this.identityForm', payload);
    if (payload.date) {
      payload.date = moment(payload.date).format('DD/MM/YYYY');
    }
    delete payload.credit;
    delete payload.cheque;
    delete payload.transfer;
    this.subs.sink = this.financeService.DecaissementPayment(payload, this.data._id).subscribe((resp) => {
      console.log('Edit Payment Mode', resp);
      Swal.fire({
        type: 'success',
        title: this.translate.instant('Bravo!'),
        confirmButtonText: this.translate.instant('OK'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then(() => {
        this.dialogRef.close();
      });
    }, (err) => {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
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
