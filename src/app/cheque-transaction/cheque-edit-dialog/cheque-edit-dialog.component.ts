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
  selector: 'ms-cheque-edit-dialog',
  templateUrl: './cheque-edit-dialog.component.html',
  styleUrls: ['./cheque-edit-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class ChequeEditDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  identityForm: UntypedFormGroup;
  today: Date;
  studentId: any;
  studentData: any;
  dataPass: any;
  indexTab: any;
  isMainAddressSelected = false;
  isStudentSelected = false;
  isParentSelected = false;
  isUncleSelected = false;

  nationalitiesList = [];
  nationalList = [];
  nationalitySelected: string;

  countries;
  userSelected: any;

  countryList;
  filteredCountry: any[][] = [];

  cities: string[][] = [];
  filteredCities: string[][] = [];

  departments: string[][] = [];
  filteredDepartments: string[][] = [];

  regions: string[][] = [];
  filteredRegions: string[][] = [];
  currencyList = [];
  dummyData = [];
  termsList = [];
  financialList = [];
  dataEntity: any;
  dataBilling: any;
  mappingBilling: any;
  originalMapping: any;
  private intVal: any;
  private timeOutVal: any;

  toFilterList = [
    { value: 'Student', key: 'Student' },
    { value: 'Finance Support', key: 'Finance Support' },
  ];
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
  generalDepositPaid = false;
  dataFinanceList = [];
  constructor(
    public dialogRef: MatDialogRef<ChequeEditDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    public financeService: FinancesService,
    private parseStringDatePipe: ParseStringDatePipe,
    private acadJourneyService: AcademicJourneyService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.today = new Date();
    this.iniVerificationForm();
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe((list: any[]) => {
      this.currencyList = list;
    });
    this.subs.sink = this.financeService.dataBilling.subscribe((val: any) => {
      if (val) {
        this.dataBilling = val;
      }
    });
    this.subs.sink = this.financeService.dataCheque.subscribe((val: any) => {
      if (val) {
        this.dummyData = val;
      }
    });
    this.getDataBilling();
  }

  iniVerificationForm() {
    this.identityForm = this.fb.group({
      payor: [null],
      student: [null],
      student_account: [null],
      amount: [null],
      financial_support: [null, Validators.required],
      currency: ['EUR'],
      letter: [null],
      bank_name: [null],
      cheque_number: [''],
      date: [''],
      term_payment: this.fb.group({
        date: [''],
        time: [''],
      }),
      term_amount: [''],
      term_index: [''],
      term_type: [''],
      billing_id: [''],
      student_id: [''],
      index: [''],
    });
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  getDataBilling() {
    // console.log('this.dataBilling', this.dataBilling);
    const billing = _.cloneDeep(this.dataBilling);
    this.mappingBilling = billing
      .filter((filtered) => filtered.candidate_id)
      .map((temp) => {
        return {
          student_name:
            temp.candidate_id.last_name +
            ' ' +
            temp.candidate_id.first_name +
            ' ' +
            (temp.candidate_id.civility
              ? temp.candidate_id.civility === 'neutral'
                ? ''
                : this.translate.instant(temp.candidate_id.civility)
              : '') +
            ' ' +
            temp.intake_channel.program,
          account_number: temp.account_number,
          terms: temp.terms,
          deposit: temp.deposit,
          is_deposit_completed: temp.is_deposit_completed,
          financial_supports: temp.financial_supports,
          billing_id: temp._id,
          student_id: temp.candidate_id._id,
        };
      });
    billing
      .filter((filtered) => filtered.candidate_id)
      .forEach((element) => {
        if (element.financial_supports && element.financial_supports.length) {
          element.financial_supports.forEach((finance) => {
            const data = {
              finance:
                finance.family_name +
                ' ' +
                finance.name +
                ' ' +
                (finance.civility ? (finance.civility === 'neutral' ? '' : this.translate.instant(finance.civility)) : '') +
                ' (' +
                this.translate.instant('CARDDETAIL.RELATION.' + finance.relation) +
                ')',
              student_name:
                element.candidate_id.last_name +
                ' ' +
                element.candidate_id.first_name +
                ' ' +
                (element.candidate_id.civility
                  ? element.candidate_id.civility === 'neutral'
                    ? ''
                    : this.translate.instant(element.candidate_id.civility)
                  : '') +
                ' ' +
                element.intake_channel,
              account_number: element.account_number,
              terms: element.terms,
              deposit: element.deposit,
              is_deposit_completed: element.is_deposit_completed,
              billing_id: element._id,
              student_id: element.candidate_id._id,
            };
            this.financialList.push(data);
          });
        }
      });
    // console.log('this.financialList', this.financialList);
    if (this.data && this.data.student_id) {
      const dataStudent = this.mappingBilling.filter((list) => list.student_id === this.data.student_id);
      if (dataStudent && dataStudent.length) {
        this.studentSelected(dataStudent[0]);
      }
    }
    this.identityForm.patchValue(this.data);
  }

  studentSelected(event) {
    this.identityForm.get('letter').setValue(null);
    this.identityForm.get('financial_support').setValue(null);
    // console.log('Data Selected', event);
    const billing = _.cloneDeep(this.dataBilling);
    const account = event && event.account_number ? event.account_number : '';
    const billing_id = event && event.billing_id ? event.billing_id : '';
    const student_id = event && event.candidate_id ? event.candidate_id : '';
    this.identityForm.get('student_account').setValue(account);
    this.identityForm.get('billing_id').setValue(billing_id);
    this.identityForm.get('student_id').setValue(student_id);
    if (event) {
      if (event.terms && event.terms.length) {
        event.terms.forEach((element, index) => {
          element.term = index + 1;
        });
        this.termsList = event.terms.filter(
          (list) => (list.is_term_paid === false || list.term_amount !== list.term_pay_amount) && list.term_amount !== 0,
        );
        this.termsList = this.termsList.sort((a, b) => {
          return moment.utc(a.term_payment_deferment).diff(moment.utc(b.term_payment_deferment));
        });
        this.termsList = this.termsList.map((list) => {
          return {
            name:
              this.translate.instant('terms') +
              ' ' +
              list.term +
              ' ' +
              (list.term_payment.date ? ' - ' + list.term_payment.date : '') +
              ' ' +
              (list.term_amount - list.term_pay_amount <= 0 ? ' ' : ' - ' + (list.term_amount - list.term_pay_amount) + ' €'),
            term_amount: list.term_amount,
            term_index: list.term,
            term_type: 'term',
            term_payment: {
              date: list.term_payment.date,
              time: list.term_payment.time,
            },
          };
        });
        // console.log(this.termsList);
      } else {
        this.termsList = [];
      }
      if (event && event.is_deposit_completed) {
        this.generalDepositPaid = true;
      } else {
        const dp = {
          name: this.translate.instant('Down Payment'),
          term_type: 'deposit',
        };
        this.termsList.push(dp);
      }
      if (event.financial_supports && event.financial_supports.length) {
        this.financialList = event.financial_supports.map((list) => {
          return {
            finance:
              list.family_name +
              ' ' +
              list.name +
              ' ' +
              (list.civility ? (list.civility === 'neutral' ? '' : this.translate.instant(list.civility)) : '') +
              ' (' +
              this.translate.instant('CARDDETAIL.RELATION.' + list.relation) +
              ')',
            student_name: event.student_name,
            account_number: event.account_number,
            terms: event.terms,
            deposit: event.deposit,
            is_deposit_completed: event.is_deposit_completed,
            billing_id: event.billing_id,
            student_id: event.candidate_id,
          };
        });
      } else {
        const data = {
          finance: event.student_name,
          student_name: event.student_name,
          account_number: event.account_number,
          terms: event.terms,
          deposit: event.deposit,
          is_deposit_completed: event.is_deposit_completed,
          billing_id: event.billing_id,
          student_id: event.candidate_id,
        };
        this.financialList.push(data);
      }
    } else {
      this.termsList = [];
      this.financialList = [];
      this.identityForm.get('financial_support').setValue(null);
      this.identityForm.get('letter').setValue(null);
      this.identityForm.get('billing_id').setValue('');
      billing.forEach((element) => {
        if (element.financial_supports && element.financial_supports.length) {
          element.financial_supports.forEach((finance) => {
            const data = {
              finance:
                finance.family_name +
                ' ' +
                finance.name +
                ' ' +
                (finance.civility ? (finance.civility === 'neutral' ? '' : this.translate.instant(finance.civility)) : '') +
                ' (' +
                this.translate.instant('CARDDETAIL.RELATION.' + finance.relation) +
                ')',
              student_name:
                element.candidate_id.last_name +
                ' ' +
                element.candidate_id.first_name +
                ' ' +
                (element.candidate_id.civility
                  ? element.candidate_id.civility === 'neutral'
                    ? ''
                    : this.translate.instant(element.candidate_id.civility)
                  : '') +
                ' ' +
                element.intake_channel,
              account_number: element.account_number,
              terms: element.terms,
              deposit: element.deposit,
              is_deposit_completed: element.is_deposit_completed,
              billing_id: element._id,
              student_id: element.candidate_id._id,
            };
            this.financialList.push(data);
          });
        }
      });
    }
  }

  financeSelected(event) {
    // console.log('Data Selected', event);
    if (!this.identityForm.get('student').value) {
      const account = event && event.account_number ? event.account_number : '';
      const student_name = event && event.student_name ? event.student_name : '';
      const billing_id = event && event.billing_id ? event.billing_id : '';
      const student_id = event && event.candidate_id ? event.candidate_id : '';
      this.identityForm.get('student_account').setValue(account);
      this.identityForm.get('student').setValue(student_name);
      this.identityForm.get('billing_id').setValue(billing_id);
      this.identityForm.get('student_id').setValue(student_id);
      if (event) {
        if (event.terms && event.terms.length) {
          event.terms.forEach((element, index) => {
            element.term = index + 1;
          });
          this.termsList = event.terms.filter(
            (list) => (list.is_term_paid === false || list.term_amount !== list.term_pay_amount) && list.term_amount !== 0,
          );
          this.termsList = this.termsList.sort((a, b) => {
            return moment.utc(a.term_payment_deferment).diff(moment.utc(b.term_payment_deferment));
          });
          this.termsList = this.termsList.map((list) => {
            return {
              name:
                this.translate.instant('terms') +
                ' ' +
                list.term +
                ' ' +
                (list.term_payment.date ? ' - ' + list.term_payment.date : '') +
                ' ' +
                (list.term_amount - list.term_pay_amount <= 0 ? ' ' : ' - ' + (list.term_amount - list.term_pay_amount) + ' €'),
              term_amount: list.term_amount,
              term_index: list.term,
              term_type: 'term',
              term_payment: {
                date: list.term_payment.date,
                time: list.term_payment.time,
              },
            };
          });
          // console.log(this.termsList);
        } else {
          this.termsList = [];
        }
        if (event && event.is_deposit_completed) {
          this.generalDepositPaid = true;
        } else {
          const dp = {
            name: this.translate.instant('Down Payment'),
            term_type: 'deposit',
          };
          this.termsList.push(dp);
        }
      }
    }
  }
  letterSelected(event) {
    // console.log('Data Letter', event);
    if (event) {
      const term_index = event.map((list) => list.term_index);
      this.identityForm.get('term_index').setValue(term_index);
    } else {
      this.identityForm.get('term_index').setValue(null);
    }
    if (event) {
      const term_amount = event.map((list) => list.term_amount);
      const term_index = event.filter((res) => res && res.term_index).map((list) => list.term_index.toString());
      const date = event.filter((res) => res && res.term_payment && res.term_payment.date).map((list) => list.term_payment.date.toString());
      const time = event.filter((res) => res && res.term_payment && res.term_payment.time).map((list) => list.term_payment.time.toString());
      const term_type = event.filter((res) => res && res.term_type).map((list) => list.term_type);
      this.identityForm.get('term_amount').setValue(term_amount);
      this.identityForm.get('term_index').setValue(term_index);
      this.identityForm.get('term_type').setValue(term_type);
      this.identityForm.get('term_payment').get('date').setValue(date);
      this.identityForm.get('term_payment').get('time').setValue(time);
    } else {
      this.identityForm.get('term_amount').setValue(null);
      this.identityForm.get('term_index').setValue(null);
      this.identityForm.get('term_type').setValue(null);
      this.identityForm.get('term_payment').get('date').setValue(null);
      this.identityForm.get('term_payment').get('time').setValue(null);
    }
  }

  submitVerification() {
    const payload = _.cloneDeep(this.identityForm.value);
    this.dummyData[payload.index] = payload;
    this.financeService.setDataCheque(this.dummyData);
    // console.log(payload, this.dummyData);
    this.dialogRef.close();
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
