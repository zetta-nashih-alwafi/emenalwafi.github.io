import { DatePipe } from '@angular/common';
import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  OnDestroy,
  Inject,
  ViewChild,
  AfterViewChecked,
  ChangeDetectorRef,
  AfterContentChecked,
} from '@angular/core';
import { FormArray, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
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
// import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import * as moment from 'moment';
import { SpeechToTextDialogComponent } from 'app/shared/components/speech-to-text-dialog/speech-to-text-dialog.component';
import { FinancesService } from 'app/service/finance/finance.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-tems-amount-dialog',
  templateUrl: './tems-amount-dialog.component.html',
  styleUrls: ['./tems-amount-dialog.component.scss'],
  providers: [ParseStringDatePipe, ParseLocalToUtcPipe, ParseUtcToLocalPipe],
})
export class TermsAmountDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  identityForm: UntypedFormGroup;
  today: Date;
  lastDate: any;
  firstMonth: Date;
  secondMonth: Date;
  thirdMonth: Date;
  fourthMonth: Date;
  fiveMonth: Date;
  sixMonth: Date;
  seventMonth: Date;
  eightMonth: Date;
  firstMonthUsed = false;
  secondMonthUsed = false;
  thirdMonthUsed = false;
  fourthMonthUsed = false;
  fiveMonthUsed = false;
  sixMonthUsed = false;
  seventMonthUsed = false;
  eightMonthUsed = false;
  studentId: any;
  fullyPaid = false;
  studentData: any;
  dataPass: any;
  indexTab: any;
  ramainingBill: any;
  isMainAddressSelected = false;
  firstForm: any;
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
  termlList = [];
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
  tempDate: any;
  termsList = [];
  tempTerms = [];
  private intVal: any;
  private timeOutVal: any;
  toFilterList = [
    { civility: 'Mrs', value: ' Mrs Anne CHAMBIER', key: 'Anne CHAMBIER' },
    { civility: 'Mr', value: 'Mr Fabien CHAMBIER', key: 'Fabien CHAMBIER' },
  ];
  ninthMonthUsed: boolean;
  tenthMonthUsed: boolean;
  eleventhMonthUsed: boolean;
  twelfthMonthUsed: boolean;
  depositValue = 0;
  isDepositDone = false;
  isChargeBack = false;
  isDepositPartial = false;
  isHaveDeposit = false;
  isWaitingForResponse = false;
  isPending = false
  // @Output() dateInput(): EventEmitter<MatDatepickerInputEvent<any>>;
  constructor(
    public dialogRef: MatDialogRef<TermsAmountDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private parseStringDatePipe: ParseStringDatePipe,
    private parseLocalToUTCPipe: ParseLocalToUtcPipe,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private acadJourneyService: AcademicJourneyService,
    private financeService: FinancesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.today = new Date();
    // this.lastDate = this.parseStringDatePipe.transformStringToDate('31/05/2021');
    this.firstMonth = this.parseStringDatePipe.transformStringToDate('31/10/2020');
    this.secondMonth = this.parseStringDatePipe.transformStringToDate('30/11/2020');
    this.thirdMonth = this.parseStringDatePipe.transformStringToDate('31/12/2020');
    this.fourthMonth = this.parseStringDatePipe.transformStringToDate('31/01/2021');
    this.fiveMonth = this.parseStringDatePipe.transformStringToDate('28/02/2021');
    this.sixMonth = this.parseStringDatePipe.transformStringToDate('31/03/2021');
    this.seventMonth = this.parseStringDatePipe.transformStringToDate('30/04/2021');
    this.eightMonth = this.parseStringDatePipe.transformStringToDate('31/05/2021');
    // console.log('_data', this.data);
    this.iniVerificationForm();
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe((list: any[]) => {
      this.currencyList = list;
    });
    // this.termlList = _.cloneDeep(this.data.terms);
    const termList = _.cloneDeep(this.data.terms);
    this.termlList = termList.filter((res) => res.term_amount !== 0);
    this.patchValue();
    this.firstForm = _.cloneDeep(this.identityForm.value);
  }

  isCanEditTerm(index) {
    if (this.data?.student_type?.type_of_information === 'classic') {
      return true;
    } else {
      if (this.identityForm.get('terms').get(index.toString()).get('term_status').value === 'not_billed') {
        return true;
      } else {
        return false;
      }
    }
  }

  isCanAddTerm() {
    if (this.data?.student_type?.type_of_information === 'classic') {
      return true;
    } else {
      return this.payment?.value.some((term) => term?.term_status === 'not_billed');
    }
  }

  patchValue() {
    // console.log(this.data);
    if (this.data && this.data.deposit && this.data.deposit > 0) {
      this.isHaveDeposit = true;
      this.depositValue = this.data.deposit;
      if (
        ((this.data?.deposit_pay_amount && this.data?.deposit_pay_amount === this.data?.deposit) || this.data?.is_deposit_completed) &&
        this.data?.candidate_id?.payment === 'chargeback'
      ) {
        this.isChargeBack = true;
        this.isDepositDone = true;
        this.isDepositPartial = false;
      } else if (
        ((this.data?.deposit_pay_amount && this.data?.deposit_pay_amount === this.data?.deposit) || this.data?.is_deposit_completed) &&
        this.data?.candidate_id?.payment !== 'chargeback'
      ) {
        this.isChargeBack = false;
        this.isDepositDone = true;
        this.isDepositPartial = false;
      } else if (this.data.deposit_pay_amount && this.data.deposit_pay_amount < this.data.deposit) {
        this.isChargeBack = false;
        this.isDepositPartial = true;
        this.depositValue = this.data.deposit - this.data.deposit_pay_amount;
        this.isDepositDone = false;
      }
    } else {
      this.isHaveDeposit = false;
    }
    this.ramainingBill = this.data.total_amount - (this.data.amount_paid ? parseFloat(this.data.amount_paid) : 0);
    console.log('cek term list', this.termlList);
    if (this.termlList && this.termlList.length) {
      this.termsList = this.termlList.filter((temp) => temp.term_amount !== 0).sort((a, b) => (a.terms_index > b.terms_index ? 1 : -1));
      const dataEditable = this.termlList.filter(
        (temp) =>
          temp.is_term_paid === false || temp.is_partial === true || (temp.term_pay_amount && temp.term_pay_amount !== temp.term_amount),
      );
      if (this.termsList && this.termsList.length) {
        this.termsList.forEach((element) => {
          this.addPayment();
        });
        const payload = _.cloneDeep(this.termlList);
        payload.forEach((element, indexPay) => {
          if (element.term_pay_amount && element.term_pay_amount !== element.term_amount) {
            element.is_partial = true;
          }
          if (element.term_pay_date && element.term_pay_date.date) {
            const startTime = element.term_pay_date.time ? element.term_pay_date.time : '15:59';
            const term_pay_date = {
              date: this.parseUTCToLocalPipe.transformDate(element.term_pay_date.date, startTime),
              time: this.parseUTCToLocalPipe.transform(startTime)
                ? this.parseUTCToLocalPipe.transform(startTime)
                : this.parseUTCToLocalPipe.transform('15:59'),
            };
            element.term_pay_date = {
              date:
                term_pay_date.date !== 'Invalid date'
                  ? this.parseStringDatePipe.transformStringToDate(term_pay_date.date)
                  : element.term_pay_date.date,
              time: term_pay_date.time,
            };
          } else {
            element.term_pay_date = {
              date: null,
              time: this.parseUTCToLocalPipe.transform('15:59'),
            };
          }
          if (element.term_payment_deferment && element.term_payment_deferment.date) {
            const startTime = element.term_payment_deferment.time ? element.term_payment_deferment.time : '15:59';
            const term_payment_deferment = {
              date: this.parseUTCToLocalPipe.transformDate(element.term_payment_deferment.date, startTime),
              time: this.parseUTCToLocalPipe.transform(startTime)
                ? this.parseUTCToLocalPipe.transform(startTime)
                : this.parseUTCToLocalPipe.transform('15:59'),
            };
            element.term_payment_deferment = {
              date:
                term_payment_deferment.date !== 'Invalid date'
                  ? this.parseStringDatePipe.transformStringToDate(term_payment_deferment.date)
                  : element.term_payment_deferment.date,
              time: term_payment_deferment.time,
            };
          } else {
            element.term_payment_deferment = {
              date: null,
              time: this.parseUTCToLocalPipe.transform('15:59'),
            };
          }
          if (element.term_payment && element.term_payment.date) {
            const startTime = element.term_payment.time ? element.term_payment.time : '15:59';
            const term_payment = {
              date: this.parseUTCToLocalPipe.transformDate(element.term_payment.date, startTime),
              time: this.parseUTCToLocalPipe.transform(startTime)
                ? this.parseUTCToLocalPipe.transform(startTime)
                : this.parseUTCToLocalPipe.transform('15:59'),
            };
            element.term_payment = {
              date:
                term_payment.date !== 'Invalid date'
                  ? this.parseStringDatePipe.transformStringToDate(term_payment.date)
                  : element.term_payment.date,
              time: term_payment.time,
            };
            // element.term_payment_deferment = {
            //   date:
            //     term_payment.date !== 'Invalid date'
            //       ? this.parseStringDatePipe.transformStringToDate(term_payment.date)
            //       : element.term_payment.date,
            //   time: term_payment.time,
            // };
          } else {
            element.term_payment = {
              date: null,
              time: this.parseUTCToLocalPipe.transform('15:59'),
            };
          }
          element.term_must_pay = element.term_amount;
          if (element.is_term_paid && element.is_partial) {
            element.term_amount = element.term_amount - element.term_pay_amount;
          }
          element.term_amount = Number.isInteger(element.term_amount) ? element.term_amount : parseFloat(element.term_amount).toFixed(2);
          element.term_pay_amount = Number.isInteger(element.term_amount)
            ? element.term_pay_amount
            : element.term_pay_amount
            ? parseFloat(element.term_pay_amount).toFixed(2)
            : 0;
          // element.term_amount = parseFloat(element.term_amount).toFixed(2)
          if (dataEditable && dataEditable.length === 1) {
            if (payload.length - 1 === indexPay) {
              element.is_locked = true;
            }
          }

          if (element.term_status && (element.term_status === 'billed' || element.term_status === 'partially_paid')) {
            element.is_locked = true;
          }
        });
        if (!(dataEditable && dataEditable.length)) {
          this.fullyPaid = true;
        }
        // console.log('Payload', payload, this.data.terms);
        const payloadWithIndexDisplay =  this.mappingTermIndexDisplay(_.cloneDeep(payload))
        this.data.terms = payloadWithIndexDisplay;
        this.termsList = payloadWithIndexDisplay;
        this.termlList = payloadWithIndexDisplay;
        this.tempTerms = payloadWithIndexDisplay;
        this.identityForm.get('terms').patchValue(payloadWithIndexDisplay);
        this.checkDateIsUsed();
        this.firstForm = _.cloneDeep(this.identityForm.value);
        console.log('cek form', this.identityForm.value);
      }
      // console.log(this.termsList, this.identityForm.value);
    }
    if (this.data && this.data.payment_method) {
      this.checkPayment(this.data.payment_method);
    }
    this.isPending = (!this.data?.is_deposit_completed || !this.data?.deposit) && (this.data?.candidate_id?.payment === 'sepa_pending' || this.data?.candidate_id?.payment === 'pending') ? true : false
  }

  checkDateIsUsed() {
    this.firstMonthUsed = false;
    this.secondMonthUsed = false;
    this.thirdMonthUsed = false;
    this.fourthMonthUsed = false;
    this.fiveMonthUsed = false;
    this.sixMonthUsed = false;
    this.seventMonthUsed = false;
    this.eightMonthUsed = false;
    this.ninthMonthUsed = false;
    this.tenthMonthUsed = false;
    this.eleventhMonthUsed = false;
    this.twelfthMonthUsed = false;
    const data = this.tempTerms;
    const dateList = {
      january: moment('01/01/2021', 'DD/MM/YYYY'),
      february: moment('01/02/2021', 'DD/MM/YYYY'),
      march: moment('01/03/2021', 'DD/MM/YYYY'),
      april: moment('01/04/2021', 'DD/MM/YYYY'),
      may: moment('01/05/2021', 'DD/MM/YYYY'),
      june: moment('01/06/2021', 'DD/MM/YYYY'),
      july: moment('01/07/2021', 'DD/MM/YYYY'),
      august: moment('01/08/2021', 'DD/MM/YYYY'),
      september: moment('01/09/2021', 'DD/MM/YYYY'),
      october: moment('01/10/2021', 'DD/MM/YYYY'),
      november: moment('01/11/2021', 'DD/MM/YYYY'),
      december: moment('01/12/2021', 'DD/MM/YYYY'),
    };
    const isJanuary = dateList.january.format('M');
    const isFebruary = dateList.february.format('M');
    const isMarch = dateList.march.format('M');
    const isApril = dateList.april.format('M');
    const isMay = dateList.may.format('M');
    const isJune = dateList.june.format('M');
    const isJuly = dateList.july.format('M');
    const isAugust = dateList.august.format('M');
    const isSeptember = dateList.september.format('M');
    const isOctober = dateList.october.format('M');
    const isNovember = dateList.november.format('M');
    const isDecember = dateList.december.format('M');

    // console.log('_ini data term', data);

    data.forEach((terms, index, array) => {
      let termsMoment;
      if (terms?.term_payment_deferment?.date) {
        termsMoment = moment(terms.term_payment_deferment.date, 'DD/MM/YYYY');
      } else {
        termsMoment = moment(terms.term_payment.date, 'DD/MM/YYYY');
      }

      if (index === array.length - 1) {
        this.lastDate = termsMoment.format('DD/MM/YYYY');
      }

      const checkMonthTerms = termsMoment.format('M');
      // console.log('_month', termsMoment.toString(), checkMonthTerms);

      if (checkMonthTerms === isAugust) {
        this.firstMonthUsed = true;
      }
      if (checkMonthTerms === isSeptember) {
        this.secondMonthUsed = true;
      }
      if (checkMonthTerms === isOctober) {
        this.thirdMonthUsed = true;
      }
      if (checkMonthTerms === isNovember) {
        this.fourthMonthUsed = true;
      }
      if (checkMonthTerms === isDecember) {
        this.fiveMonthUsed = true;
      }
      if (checkMonthTerms === isJanuary) {
        this.sixMonthUsed = true;
      }
      if (checkMonthTerms === isFebruary) {
        this.seventMonthUsed = true;
      }
      if (checkMonthTerms === isMarch) {
        this.eightMonthUsed = true;
      }
      if (checkMonthTerms === isApril) {
        this.ninthMonthUsed = true;
      }
      if (checkMonthTerms === isMay) {
        this.tenthMonthUsed = true;
      }
      if (checkMonthTerms === isJune) {
        this.eleventhMonthUsed = true;
      }
      if (checkMonthTerms === isJuly) {
        this.twelfthMonthUsed = true;
      }
    });
  }

  patchValueManually() {
    const payload = [];
    // console.log('_last', this.lastDate);

    const lastDate = moment(this.lastDate, 'DD/MM/YYYY');

    this.payment.controls.forEach((element, indexPay) => {
      const data = {
        terms_index: 0,
        term_payment: { date: null, time: '15:59' },
        term_payment_deferment: { date: null, time: '15:59' },
        term_pay_date: { date: null, time: '15:59' },
        terms_index_display: null,
        reference_term_id: element?.get('reference_term_id')?.value,
        _id: '',
      };
      data.terms_index = indexPay + 1;
      if (
        this.tempTerms &&
        this.tempTerms[indexPay] &&
        this.tempTerms[indexPay].term_payment &&
        this.tempTerms[indexPay].term_payment.date
      ) {
        data.term_payment = this.tempTerms[indexPay].term_payment;
      } else {
        if (!this.firstMonthUsed) {
          this.firstMonthUsed = true;
          data.term_payment = {
            date: this.parseStringDatePipe.transformStringToDate(lastDate.add(1, 'month').format('DD/MM/YYYY')),
            time: '15:59',
          };
        } else if (!this.secondMonthUsed) {
          this.secondMonthUsed = true;
          data.term_payment = {
            date: this.parseStringDatePipe.transformStringToDate(lastDate.add(1, 'month').format('DD/MM/YYYY')),
            time: '15:59',
          };
        } else if (!this.thirdMonthUsed) {
          this.thirdMonthUsed = true;
          data.term_payment = {
            date: this.parseStringDatePipe.transformStringToDate(lastDate.add(1, 'month').format('DD/MM/YYYY')),
            time: '15:59',
          };
        } else if (!this.fourthMonthUsed) {
          this.fourthMonthUsed = true;
          data.term_payment = {
            date: this.parseStringDatePipe.transformStringToDate(lastDate.add(1, 'month').format('DD/MM/YYYY')),
            time: '15:59',
          };
        } else if (!this.fiveMonthUsed) {
          this.fiveMonthUsed = true;
          data.term_payment = {
            date: this.parseStringDatePipe.transformStringToDate(lastDate.add(1, 'month').format('DD/MM/YYYY')),
            time: '15:59',
          };
        } else if (!this.sixMonthUsed) {
          this.sixMonthUsed = true;
          data.term_payment = {
            date: this.parseStringDatePipe.transformStringToDate(lastDate.add(1, 'month').format('DD/MM/YYYY')),
            time: '15:59',
          };
        } else if (!this.seventMonthUsed) {
          this.seventMonthUsed = true;
          data.term_payment = {
            date: this.parseStringDatePipe.transformStringToDate(lastDate.add(1, 'month').format('DD/MM/YYYY')),
            time: '15:59',
          };
        } else if (!this.eightMonthUsed) {
          this.eightMonthUsed = true;
          data.term_payment = {
            date: this.parseStringDatePipe.transformStringToDate(lastDate.add(1, 'month').format('DD/MM/YYYY')),
            time: '15:59',
          };
        } else if (!this.ninthMonthUsed) {
          this.ninthMonthUsed = true;
          data.term_payment = {
            date: this.parseStringDatePipe.transformStringToDate(lastDate.add(1, 'month').format('DD/MM/YYYY')),
            time: '15:59',
          };
        } else if (!this.tenthMonthUsed) {
          this.tenthMonthUsed = true;
          data.term_payment = {
            date: this.parseStringDatePipe.transformStringToDate(lastDate.add(1, 'month').format('DD/MM/YYYY')),
            time: '15:59',
          };
        } else if (!this.eleventhMonthUsed) {
          this.eleventhMonthUsed = true;
          data.term_payment = {
            date: this.parseStringDatePipe.transformStringToDate(lastDate.add(1, 'month').format('DD/MM/YYYY')),
            time: '15:59',
          };
        } else if (!this.twelfthMonthUsed) {
          this.twelfthMonthUsed = true;
          data.term_payment = {
            date: this.parseStringDatePipe.transformStringToDate(lastDate.add(1, 'month').format('DD/MM/YYYY')),
            time: '15:59',
          };
        }
      }
      if (
        this.tempTerms &&
        this.tempTerms[indexPay] &&
        this.tempTerms[indexPay].term_payment_deferment &&
        this.tempTerms[indexPay].term_payment_deferment.date
      ) {
        data.term_payment_deferment = this.data.terms[indexPay].term_payment_deferment;
      }
      if (
        this.tempTerms &&
        this.tempTerms[indexPay] &&
        this.tempTerms[indexPay].term_pay_date &&
        this.tempTerms[indexPay].term_pay_date.date
      ) {
        data.term_pay_date = this.data.terms[indexPay].term_pay_date;
      }
      if (this.data.terms && this.data.terms[indexPay] && this.data.terms[indexPay]._id) {
        data._id = this.data.terms[indexPay]._id;
      }
      payload.push(data);
    });
    // console.log('Payload', payload);
    const payloadWithIndexDisplay =  this.mappingTermIndexDisplay(_.cloneDeep(payload))
    this.tempTerms = payloadWithIndexDisplay;
    this.identityForm.get('terms').patchValue(payloadWithIndexDisplay);
    // console.log(this.identityForm.value);
  }

  isFullyPaid(indexTerm) {
    let correct = false;
    if (
      this.termsList[indexTerm].is_term_paid &&
      parseFloat(this.termsList[indexTerm].term_amount) === parseFloat(this.termsList[indexTerm].term_pay_amount)
    ) {
      correct = true;
    }
    return correct;
  }

  isPartialTerm(indexTerm) {
    let correct = false;
    if (
      this.termsList[indexTerm].is_partial &&
      parseFloat(this.termsList[indexTerm].term_amount) !== parseFloat(this.termsList[indexTerm].term_pay_amount)
    ) {
      correct = true;
    }
    return correct;
  }

  isNotPaid(indexTerm) {
    let correct = false;
    if (!this.termsList[indexTerm].is_partial && !this.termsList[indexTerm].is_term_paid) {
      correct = true;
    }
    return correct;
  }

  //   (identityForm.get('terms').get(in.toString()).get('term_pay_amount').value &&
  //   identityForm.get('terms').get(in.toString()).get('term_amount').value !==
  //     identityForm.get('terms').get(in.toString()).get('term_pay_amount').value) ||
  // (!identityForm.get('terms').get(in.toString()).get('term_pay_amount').value &&
  //   identityForm.get('terms').get(in.toString()).get('is_term_paid').value === false)

  isPatialNotPaid(indexTerm) {
    let correct = false;
    if (
      !this.termsList[indexTerm].is_term_paid ||
      (this.termsList[indexTerm].is_partial &&
        parseFloat(this.termsList[indexTerm].term_amount) !== parseFloat(this.termsList[indexTerm].term_pay_amount))
    ) {
      correct = true;
    }
    return correct;
  }

  formatCurrency(data) {
    let num = '';
    if (data) {
      num = parseInt(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
      num = num.toString().slice(0, -3);
    }
    return num;
  }

  translateDates(date) {
    let dateTerms = '-';
    if (date) {
      dateTerms = moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
    }
    return dateTerms;
  }
  translateDate(datee, timee) {
    const finalTime = timee ? timee : '15:59';
    if (datee) {
      const date = this.parseStringDatePipe.transformStringToDate(this.parseUTCToLocalPipe.transformDate(datee, finalTime));
      // console.log(datee, date);
      return moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
    } else {
      return '';
    }
  }

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }
  iniVerificationForm() {
    this.identityForm = this.fb.group({
      terms: this.fb.array([]),
      note: [null],
      payment_method: [null],
      cheque: [null],
      transfer: [null],
      credit: [null],
      bank_debit: [null],
      cash: [null],
    });
    // const date_of_birth = this.parseStringDatePipe.transform('20220128');
    // const date_of_birth1 = this.parseStringDatePipe.transform('20220230');
    // const date_of_birth2 = this.parseStringDatePipe.transform('20220330');
    // const date_of_birth3 = this.parseStringDatePipe.transform('20220430');
    // const date_of_birth4 = this.parseStringDatePipe.transform('20220530');
    // this.identityForm.get('date_of_birth').patchValue(date_of_birth);
    // this.identityForm.get('date_of_birth4').patchValue(date_of_birth1);
    // this.identityForm.get('date_of_birth5').patchValue(date_of_birth2);
    // this.identityForm.get('date_of_birth6').patchValue(date_of_birth3);
    // this.identityForm.get('date_of_birth7').patchValue(date_of_birth4);
  }

  initPayment() {
    return this.fb.group({
      _id: [''],
      term_payment: this.fb.group({
        date: [null],
        time: ['15:59'],
      }),
      term_payment_deferment: this.fb.group({
        date: [null],
        time: ['15:59'],
      }),
      is_term_paid: [false],
      is_locked: [false],
      is_partial: [false],
      is_regulation: [false],
      term_amount: [null, [Validators.min(2), Validators.required, CustomValidators.number]],
      term_amount_pending: [0],
      term_amount_chargeback: [0],
      term_amount_not_authorised: [0],
      term_pay_amount: [0],
      terms_index: [0],
      term_pay_date: this.fb.group({
        date: [null],
        time: ['15:59'],
      }),
      term_status: ['not_billed'],
      reference_term_id: [null],
      terms_index_display: [null]
    });
  }

  addPayment() {
    this.payment.push(this.initPayment());
  }
  removePayment(parentIndex: number) {
    this.payment.removeAt(parentIndex);
  }
  get payment() {
    return this.identityForm.get('terms') as UntypedFormArray;
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

  submitVerification() {
    const terms = this.identityForm.get('terms') as FormArray
    const invalidTerm = terms.controls.find(control => control.get('term_amount').hasError('min'))
    if (this.identityForm.invalid && invalidTerm) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('TERM_UPDATE_S1.TITLE'),
        html: this.translate.instant('TERM_UPDATE_S1.TEXT'),
        confirmButtonText: this.translate.instant('TERM_UPDATE_S1.BUTTON'),
        onOpen: modal => {
          modal.setAttribute('data-cy', 'swal-term-update-s1')
        },
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: false,
      })
    } else if (this.identityForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-formsave-s1');
        },
      });
      this.identityForm.markAllAsTouched();
    } else {
      this.isWaitingForResponse = true;
      const terms = _.cloneDeep(this.data.terms);
      let checkTermsPending = false;
      if (terms) {
        terms.forEach((term) => {
          if (term.term_amount_pending && term.term_amount_pending > 0) {
            checkTermsPending = true;
          }
        });
        if (checkTermsPending) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('CHANGE_TERM_S2.TITLE'),
            html: this.translate.instant('CHANGE_TERM_S2.TEXT'),
            confirmButtonText: this.translate.instant('CHANGE_TERM_S2.BUTTON1'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
            onOpen: (modalEl) => {
              modalEl.setAttribute('data-cy', 'swal-change-term-s2');
            },
          }).then(() => {
            this.isWaitingForResponse = false;
          });
        } else {
          this.createPayload();
        }
      } else {
        this.createPayload();
      }
    }
  }

  keyUpBill(event, indexAmount) {
    this.termsList = [];
    let tempData = [];
    const data = this.identityForm.get('terms').value;
    tempData = _.cloneDeep(data);
    const terms_index = this.identityForm.get('terms').get(indexAmount.toString()).get('terms_index').value;
    let currentRemaining =
      this.ramainingBill -
      this.identityForm.get('terms').get(indexAmount.toString()).get('term_amount').value -
      (this.isDepositDone || this.isDepositPartial ? 0 : this.data.deposit);
    const tempAmount = _.cloneDeep(this.identityForm.get('terms').get(indexAmount.toString()).get('term_amount').value);
    // console.log('Event Bill', event, indexAmount, currentRemaining, tempAmount, this.data.terms, this.identityForm.get('terms').value);
    if (tempData && tempData.length) {
      this.termsList = tempData.filter(
        (list) => (list.is_term_paid === false || list.is_partial === true) && !list.is_locked && terms_index !== list.terms_index,
      );
      const termsLocked = tempData.filter((list) => list.is_locked && (list.is_term_paid === false || list.is_partial === true));
      if (termsLocked && termsLocked.length) {
        termsLocked.forEach((element) => {
          currentRemaining -= element.term_amount;
        });
      }
      if (this.termsList && this.termsList.length) {
        let balance = (currentRemaining / this.termsList.length).toString();
        balance = parseFloat(balance).toFixed(2);
        balance = Math.round(parseInt(balance)).toString();
        // console.log('Balance', parseFloat(balance), this.termsList, tempData, termsLocked, currentRemaining, currentRemainings);
        tempData.forEach((element, indexBill) => {
          this.termsList.forEach((temp, indexTemp) => {
            if (element.terms_index === temp.terms_index) {
              if (this.termsList.length - 1 === indexTemp) {
                // console.log('Remaining', parseInt(balance) * this.termsList.length, currentRemaining, this.termsList.length, indexTemp);
                if (parseInt(balance) * this.termsList.length !== currentRemaining) {
                  const remaining = currentRemaining - parseInt(balance) * this.termsList.length;
                  const balanceFinal = (parseInt(balance) + remaining).toFixed(2);
                  // console.log('Remaining', remaining, balanceFinal, currentRemaining, balance, this.termsList.length);
                  this.identityForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balanceFinal);
                  element.term_amount = balanceFinal;
                } else {
                  this.identityForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balance);
                  element.term_amount = balance;
                }
              } else {
                this.identityForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balance);
                element.term_amount = balance;
              }
            }
          });
        });
        tempData[indexAmount].term_amount = tempAmount;
        this.identityForm.get('terms').get(indexAmount.toString()).get('term_amount').setValue(tempAmount);
      }
    }
  }

  populateTerm(indexAmount) {
    const data = this.identityForm.get('terms').get(indexAmount.toString()).get('term_payment').get('date').value;
    this.identityForm.get('terms').get(indexAmount.toString()).get('term_payment_deferment').get('date').setValue(data);
    return data;
  }

  createPayload() {
    // console.log(this.termlList, this.termsList, this.identityForm.value);
    const payload = _.cloneDeep(this.identityForm.value);
    console.log('First Payload', _.cloneDeep(payload));
    payload.terms.forEach((element, indexPart) => {
      if (element.term_payment.date) {
        if (!element.term_payment.time) {
          element.term_payment.time = '15:59';
        }
        element.term_payment.date = this.parseLocalToUTCPipe.transformDate(
          moment(element.term_payment.date).format('DD/MM/YYYY'),
          element.term_payment.time,
        );
        element.term_payment.time = this.parseLocalToUTCPipe.transform(element.term_payment.time)
          ? this.parseLocalToUTCPipe.transform(element.term_payment.time)
          : '15:59';
      }
      if (element.term_payment_deferment.date) {
        if (!element.term_payment_deferment.time) {
          element.term_payment.time = '15:59';
        }
        element.term_payment.date = this.parseLocalToUTCPipe.transformDate(
          moment(element.term_payment_deferment.date).format('DD/MM/YYYY'),
          element.term_payment_deferment.time,
        );
        element.term_payment.time = this.parseLocalToUTCPipe.transform(element.term_payment_deferment.time)
          ? this.parseLocalToUTCPipe.transform(element.term_payment_deferment.time)
          : '15:59';
        element.term_payment_deferment.date = this.parseLocalToUTCPipe.transformDate(
          moment(element.term_payment_deferment.date).format('DD/MM/YYYY'),
          element.term_payment_deferment.time,
        );
        element.term_payment_deferment.time = this.parseLocalToUTCPipe.transform(element.term_payment_deferment.time)
          ? this.parseLocalToUTCPipe.transform(element.term_payment_deferment.time)
          : '15:59';
      }
      // delete element.term_payment_deferment;

      if (element.term_pay_date.date) {
        if (!element.term_pay_date.time) {
          element.term_pay_date.time = '15:59';
        }
        element.term_pay_date.date = this.parseLocalToUTCPipe.transformDate(
          moment(element.term_pay_date.date).format('DD/MM/YYYY'),
          element.term_pay_date.time,
        );
        element.term_pay_date.time = this.parseLocalToUTCPipe.transform(element.term_pay_date.time)
          ? this.parseLocalToUTCPipe.transform(element.term_pay_date.time)
          : '15:59';
      }
      if (element.is_partial && element.term_pay_amount && element.term_pay_amount !== '0.00') {
        const term_must_pay = _.cloneDeep(
          this.termlList && this.termlList[indexPart] && this.termlList[indexPart].term_must_pay
            ? this.termlList[indexPart].term_must_pay
            : 0,
        );
        const term_changed = parseFloat(this.termlList[indexPart].term_amount) - parseFloat(element.term_amount);
        // if (parseFloat(this.termlList[indexPart].term_amount) >= parseFloat(element.term_amount)) {
        //   term_changed = parseFloat(this.termlList[indexPart].term_amount) - parseFloat(element.term_amount);
        // } else if (parseFloat(this.termlList[indexPart].term_amount) < parseFloat(element.term_amount)) {
        //   term_changed = parseFloat(this.termlList[indexPart].term_amount) - parseFloat(element.term_amount);
        // }
        // console.log('Data term_changed', term_changed, this.termlList[indexPart], element.term_amount);
        if (!element.term_amount) {
          element.term_amount = parseFloat(element.term_pay_amount);
          element.is_partial = false;
          element.term_pay_amount = parseFloat(element.term_pay_amount);
        } else {
          if (term_changed >= this.termlList[indexPart].term_amount) {
            element.term_amount = (term_changed ? term_changed : 0) + term_must_pay;
          } else if (this.termlList[indexPart].term_amount > term_changed) {
            element.term_amount = term_must_pay - (term_changed ? term_changed : 0);
          }
          element.term_amount = parseFloat(element.term_amount);
          element.term_pay_amount = parseFloat(element.term_pay_amount);
        }
      } else {
        element.term_amount = parseFloat(element.term_amount);
        element.term_pay_amount = parseFloat(element.term_pay_amount);
      }
      element.percentage = parseFloat(((element.term_amount / (this.data.total_amount - this.data.deposit)) * 100).toFixed(2));
      delete element.terms_index;
      if (!element._id) {
        delete element._id;
      }
      if (!element?.reference_term_id) {
        delete element.reference_term_id
      }
      delete element.terms_index_display
    });
    const profil_rate = this.data.profil_rate.split('-');
    const tempTermDataAfterSplitPartiallyPaidAmount = [];
    if (this.data.terms && this.data.terms.length) {
      if (this.data.terms.length !== payload.terms.length) {
        payload.is_profil_rate_updated = true;
        // payload.profil_rate =
        // (profil_rate && profil_rate.length ? profil_rate[0] : '8800€ ') + '- ' + payload.terms.length + ' echeances';
      }

      const partiallyPaidTermIdx = this.data?.terms?.findIndex((item, index, array) => {
        return item?.term_status === 'partially_paid' && array?.slice(index + 1)?.every(item => item?.term_status !== 'partially_paid');
      });
      if (partiallyPaidTermIdx !== -1) {
        const monthForm =
          payload?.terms?.[partiallyPaidTermIdx]?.term_payment?.date
            ? payload?.terms?.[partiallyPaidTermIdx]?.term_payment?.date?.split('/')?.[1]
            : null;

        const monthInitial =
          this.data?.terms?.[partiallyPaidTermIdx]?.term_payment?.date
            ? moment(this.data?.terms?.[partiallyPaidTermIdx]?.term_payment?.date)
                .format('DD/MM/YYYY')
                ?.split('/')?.[1]
            : null;

        if((this.data?.terms[partiallyPaidTermIdx]?.term_amount !== payload?.terms[partiallyPaidTermIdx]?.term_amount - payload?.terms[partiallyPaidTermIdx]?.term_pay_amount) || (monthForm && monthInitial && monthForm !== monthInitial)) {
          const tempTermPaid = {
            ...this.data?.terms[partiallyPaidTermIdx],
            is_locked: false,
            is_term_paid: true,
            is_partial: false,
            term_amount: this.data?.terms[partiallyPaidTermIdx]?.term_pay_amount,
            term_status: 'paid',
            term_payment: {
              date: 
                this.data?.terms[partiallyPaidTermIdx]?.term_payment?.date ? this.parseLocalToUTCPipe.transformDate(
                  moment(this.data?.terms[partiallyPaidTermIdx]?.term_payment?.date).format('DD/MM/YYYY'), this.data?.terms[partiallyPaidTermIdx]?.term_payment?.time,
                ) :
                null,
              time: this.data?.terms[partiallyPaidTermIdx]?.term_payment?.time ? this.data?.terms[partiallyPaidTermIdx]?.term_payment?.time : '15:59',
            },
            term_pay_date: {
              date: 
                this.data?.terms[partiallyPaidTermIdx]?.term_pay_date?.date ? this.parseLocalToUTCPipe.transformDate(
                  moment(this.data?.terms[partiallyPaidTermIdx]?.term_pay_date?.date).format('DD/MM/YYYY'), this.data?.terms[partiallyPaidTermIdx]?.term_pay_date?.time,
                ) :
                null,
              time: this.data?.terms[partiallyPaidTermIdx]?.term_pay_date?.time ? this.data?.terms[partiallyPaidTermIdx]?.term_pay_date?.time : '15:59',
            },
          };
          delete tempTermPaid?.term_payment_deferment;
          delete tempTermPaid?.terms_index;
          delete tempTermPaid?.term_must_pay;
  
          tempTermDataAfterSplitPartiallyPaidAmount.push(tempTermPaid);
        }
      }
    }

    //  Handling if any term got 100% avoir
    // if (this.data && this.data.index && this.data.index.length > 0) {
    //   this.data.index.forEach((idx) => {
    //     this.data.term_avoir.forEach((term) => {
    //       payload.terms.splice(idx, 0, term);
    //     });
    //   });
    // }
    console.log('Data Payload', payload, this.data);

    delete payload.cheque;
    delete payload.transfer;
    delete payload.credit;
    delete payload.bank_debit;
    delete payload.cash;
    let sendNotif = false;

    const firstPartialIndex = payload?.terms?.findIndex(item => item?.term_status === 'partially_paid');
    if(payload?.terms?.length) {
      if(firstPartialIndex !== -1 && tempTermDataAfterSplitPartiallyPaidAmount?.length) {
        const tempTermBilled = {
          ...payload?.terms[firstPartialIndex],
          term_amount: Number(payload?.terms[firstPartialIndex]?.term_amount) - Number(payload?.terms[firstPartialIndex]?.term_pay_amount),
          term_pay_amount: 0,
          is_partial: false,
          is_term_paid: false,
          term_status: 'billed',
          reference_term_id: payload?.terms[firstPartialIndex]?._id
        };
        delete tempTermBilled?._id;
        tempTermDataAfterSplitPartiallyPaidAmount.push(tempTermBilled);
      }
    }

    if(tempTermDataAfterSplitPartiallyPaidAmount?.length && firstPartialIndex !== -1) {
      payload?.terms?.splice(firstPartialIndex, 1, ...tempTermDataAfterSplitPartiallyPaidAmount);
      const totalTermAmount = payload?.terms?.length ? payload?.terms?.reduce((accumulator, currentValue) => accumulator + Number(currentValue?.term_amount), 0) : 0;
      payload?.terms?.map((term) => {
        term.term_amount = Number(term?.term_amount);
        term.term_pay_amount = Number(term?.term_pay_amount);
        term.percentage = parseFloat(((term?.term_amount / totalTermAmount) * 100).toFixed(2));
        return term;
      })
    };

    if (payload && payload?.terms && payload?.terms?.length) {
      payload?.terms?.forEach((term) => {
        if (typeof term?.terms_index_display === 'number') {
          delete term.terms_index_display
        }
      })
    }
    if (!this.comparison()) {
      let firstName;
      let lastName;
      if (this.data.is_financial_support) {
        firstName = this.data?.financial_support_info?.name ?? '';
        lastName = this.data?.financial_support_info?.family_name ?? '';
      } else {
        firstName = this.data?.candidate_id?.first_name ?? '';
        lastName = this.data?.candidate_id?.last_name ?? '';
      }

      Swal.fire({
        title: this.translate.instant('CHANGE_TERM_S1.TITLE', {
          firstName: firstName,
          lastName: lastName,
        }),
        text: this.translate.instant('CHANGE_TERM_S1.TEXT', {
          firstName: firstName,
          lastName: lastName,
        }),
        type: 'info',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: this.translate.instant('CHANGE_TERM_S1.BUTTON1'),
        cancelButtonText: this.translate.instant('CHANGE_TERM_S1.BUTTON2'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-change-term-s1');
        },
      }).then((resp) => {
        if (resp && resp.value) {
          sendNotif = true;
        } else {
          sendNotif = false;
        }
        // console.log('send notif? =>', sendNotif);
        this.subs.sink = this.financeService.UpdateBillingFromFinanceTable(payload, this.data._id, sendNotif).subscribe(
          (list) => {
            if (list) {
              this.isWaitingForResponse = false;
              Swal.fire({
                type: 'success',
                title: 'Bravo!',
                confirmButtonText: 'OK',
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
                onOpen: (modalEl) => {
                  modalEl.setAttribute('data-cy', 'swal-bravo');
                },
              }).then(() => {
                this.dialogRef.close(true);
              });
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            // Record error log
            this.authService.postErrorLog(err);
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
      });
    } else {
      this.subs.sink = this.financeService.UpdateBillingFromFinanceTable(payload, this.data._id, sendNotif).subscribe(
        (list) => {
          if (list) {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
              onOpen: (modalEl) => {
                modalEl.setAttribute('data-cy', 'swal-bravo');
              },
            }).then(() => {
              this.dialogRef.close(true);
            });
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
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
  }

  mappingTermIndexDisplay(terms) {
    let indexDisplay = 0
    if (terms && terms?.length) {
      terms?.forEach((term) => {
        if (!term?.reference_term_id) {
          indexDisplay++
        }
        term.terms_index_display = indexDisplay;
      })
      return terms
    }
  }

  deleteTerm(ins) {
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('TERM_AMOUNT_SX.TITLE'),
      html: this.translate.instant('TERM_AMOUNT_SX.TEXT', {
        amount: this.identityForm.get('terms').get(ins.toString()).get('term_amount').value + ' €',
      }),
      showCancelButton: true,
      allowEscapeKey: true,
      allowOutsideClick: false,
      reverseButtons: true,
      confirmButtonText: this.translate.instant('TERM_AMOUNT_SX.BUTTON_1'),
      cancelButtonText: this.translate.instant('TERM_AMOUNT_SX.BUTTON_2'),
      onOpen: (modalEl) => {
        modalEl.setAttribute('data-cy', 'swal-term-amount-sx');
      },
    }).then((res) => {
      if (res.value) {
        this.payment.removeAt(ins);
        this.termsList = [];
        let tempData = [];
        const data = this.identityForm.get('terms').value;
        tempData = _.cloneDeep(data);
        let currentRemaining = this.ramainingBill - (this.isDepositDone || this.isDepositPartial ? 0 : this.data.deposit);
        // console.log('Event Bill', currentRemaining, this.data.terms, this.identityForm.get('terms').value);
        if (tempData && tempData.length) {
          this.termsList = tempData.filter((list) => (list.is_term_paid === false || list.is_partial === true) && !list.is_locked);
          const termsLocked = tempData.filter((list) => list.is_locked && (list.is_term_paid === false || list.is_partial === true));
          if (termsLocked && termsLocked.length) {
            termsLocked.forEach((element) => {
              currentRemaining -= element.term_amount;
            });
          }
          if (this.termsList && this.termsList.length) {
            let balance = (currentRemaining / this.termsList.length).toString();
            balance = parseFloat(balance).toFixed(2);
            // balance = Math.round(parseInt(balance)).toString();
            // console.log('Balance', parseFloat(balance), this.termsList.length, tempData);
            tempData.forEach((element, indexBill) => {
              this.termsList.forEach((temp, indexTemp) => {
                if (element.terms_index === temp.terms_index) {
                  if (this.termsList.length - 1 === indexTemp) {
                    // console.log('Remaining', parseInt(balance) * this.termsList.length, currentRemaining);
                    if (parseFloat(balance) * this.termsList.length !== currentRemaining) {
                      const remaining = currentRemaining - parseFloat(balance) * this.termsList.length;
                      const balanceFinal = (parseFloat(balance) + remaining).toFixed(2);
                      // console.log('Remaining', remaining, balanceFinal, currentRemaining, balance, this.termsList.length);
                      this.identityForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balanceFinal);
                      element.term_amount = balanceFinal;
                    } else {
                      this.identityForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balance);
                      element.term_amount = balance;
                    }
                  } else {
                    this.identityForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balance);
                    element.term_amount = balance;
                  }
                }
              });
            });
          }
        }
        const datas = this.identityForm.get('terms').value;
        const dataUnlock = datas.filter((temp) => !temp.is_locked && (temp.is_term_paid === false || temp.is_partial === true));
        if (dataUnlock && dataUnlock.length === 1) {
          const index = datas.findIndex((x) => !x.is_locked && (x.is_term_paid === false || x.is_partial === true));
          this.identityForm.get('terms').get(index.toString()).get('is_locked').setValue(true);
        }
        this.checkDateIsUsed();
        if (this.payment.length === 8) {
          this.dialogRef.updateSize('1225px');
        } else if (this.payment.length === 9) {
          this.dialogRef.updateSize('1345px');
        } else if (this.payment.length === 10) {
          this.dialogRef.updateSize('1468px');
        } else if (this.payment.length === 11) {
          this.dialogRef.updateSize('1468px');
        } else if (this.payment.length === 12) {
          this.dialogRef.updateSize('1595px');
        }

        const payloadWithIndexDisplay = this.mappingTermIndexDisplay(_.cloneDeep(this.identityForm.get('terms')?.value));
        this.identityForm.get('terms').patchValue(payloadWithIndexDisplay)
      }
    });
  }

  addManualTerm() {
    const datas = this.identityForm.get('terms').value;
    // console.log('_data dialog', datas);
    const hasTerm = this.identityForm.get('terms').value;

    const dataUnlock = datas.filter((temp) => !temp.is_locked && (temp.is_term_paid === false || temp.is_partial === true));
    // console.log('_data dialog', dataUnlock);
    // console.log('_data dialog', this.identityForm.value);

    if (!(dataUnlock && dataUnlock.length)) {
      // console.log('_masuk sini');
      if (hasTerm.length > 0 && this.data.total_amount === this.data.amount_billed) {
        this.identityForm
          .get('terms')
          .get((datas.length - 1).toString())
          .get('is_locked')
          .setValue(false);
      }
    }
    this.payment.push(this.initPayment());
    this.checkDateIsUsed();
    this.patchValueManually();
    this.termsList = [];
    let tempData = [];
    const data = this.identityForm.get('terms').value;
    tempData = _.cloneDeep(data);
    let currentRemaining = this.ramainingBill - (this.isDepositDone || this.isDepositPartial ? 0 : this.data.deposit);
    // console.log('Event Bill', currentRemaining, this.data.terms, this.identityForm.get('terms').value);
    if (tempData && tempData.length) {
      this.termsList = tempData.filter((list) => (list.is_term_paid === false || list.is_partial === true) && !list.is_locked);
      const termsLocked = tempData.filter((list) => list.is_locked && (list.is_term_paid === false || list.is_partial === true));
      if (termsLocked && termsLocked.length) {
        termsLocked.forEach((element) => {
          currentRemaining -= element.term_amount;
        });
      }
      if (this.termsList && this.termsList.length) {
        let balance = (currentRemaining / this.termsList.length).toString();
        balance = parseFloat(balance).toFixed(2);
        // balance = Math.round(parseInt(balance)).toString();
        // console.log('Balance', parseFloat(balance), this.termsList, tempData);
        tempData.forEach((element, indexBill) => {
          this.termsList.forEach((temp, indexTemp) => {
            if (element.terms_index === temp.terms_index) {
              if (this.termsList.length - 1 === indexTemp) {
                // console.log('Remaining', parseInt(balance) * this.termsList.length, currentRemaining, this.termsList.length, indexTemp);
                if (parseFloat(balance) * this.termsList.length !== currentRemaining) {
                  const remaining = currentRemaining - parseFloat(balance) * this.termsList.length;
                  // console.log('Remaining', remaining, currentRemaining, balance, this.termsList);
                  // const balanceFinal = Math.round(parseInt(balance) + Math.abs(remaining)).toString();
                  const balanceFinal = (parseFloat(balance) + parseFloat(remaining.toFixed(2))).toFixed(2).toString();
                  this.identityForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balanceFinal);
                  this.identityForm.get('terms').get(indexBill.toString()).get('term_payment').patchValue(temp.term_payment);
                  element.term_amount = parseFloat(parseFloat(balanceFinal).toFixed(2));
                  if (this.data.total_amount === this.data.amount_billed) {
                    this.identityForm.get('terms').get(indexBill.toString()).get('term_status').patchValue('billed');
                  }
                } else {
                  this.identityForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balance);
                  this.identityForm.get('terms').get(indexBill.toString()).get('term_payment').patchValue(temp.term_payment);
                  element.term_amount = parseFloat(parseFloat(balance).toFixed(2));
                  if (this.data.total_amount === this.data.amount_billed) {
                    this.identityForm.get('terms').get(indexBill.toString()).get('term_status').patchValue('billed');
                  }
                }
              } else {
                this.identityForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balance);
                this.identityForm.get('terms').get(indexBill.toString()).get('term_payment').patchValue(temp.term_payment);
                element.term_amount = parseFloat(parseFloat(balance).toFixed(2));
                if (this.data.total_amount === this.data.amount_billed) {
                  if (temp?.term_status === 'partially_paid' && indexTemp === 0) {
                    this.identityForm.get('terms').get(indexBill.toString()).get('term_status').patchValue('partially_paid');
                  } else {
                    this.identityForm.get('terms').get(indexBill.toString()).get('term_status').patchValue('billed');
                  }
                }
              }
            }
          });
        });
      }
    }

    if (this.payment.length === 8) {
      this.dialogRef.updateSize('1126px');
    } else if (this.payment.length === 9) {
      this.dialogRef.updateSize('1225px');
    } else if (this.payment.length === 10) {
      this.dialogRef.updateSize('1345px');
    } else if (this.payment.length === 11) {
      this.dialogRef.updateSize('1468px');
    } else if (this.payment.length === 12) {
      this.dialogRef.updateSize('1495px');
    }
  }

  unlockTerm(ins) {
    const datas = this.identityForm.get('terms').value;
    const dataEditable = datas.filter((temp) => temp.is_term_paid === false || temp.is_partial === true);
    if (dataEditable && dataEditable.length === 1) {
      this.identityForm.get('terms').get(ins.toString()).get('is_locked').setValue(true);
    } else {
      const dataUnlock = datas.filter((temp) => !temp.is_locked && (temp.is_term_paid === false || temp.is_partial === true));
      if (!(dataUnlock && dataUnlock.length)) {
        if (datas.length - 1 === parseInt(ins)) {
          this.identityForm
            .get('terms')
            .get((ins - 1).toString())
            .get('is_locked')
            .setValue(false);
        } else {
          this.identityForm
            .get('terms')
            .get((ins + 1).toString())
            .get('is_locked')
            .setValue(false);
        }
      }
      this.identityForm.get('terms').get(ins.toString()).get('is_locked').setValue(false);
    }
  }

  lockTerm(ins) {
    this.identityForm.get('terms').get(ins.toString()).get('is_locked').setValue(true);
    const datas = this.identityForm.get('terms').value;
    const dataEditable = datas.filter((temp) => !temp.is_locked && (temp.is_term_paid === false || temp.is_partial === true));
    if (dataEditable && dataEditable.length === 1) {
      const index = datas.findIndex((x) => !x.is_locked && (x.is_term_paid === false || x.is_partial === true));
      this.identityForm.get('terms').get(index.toString()).get('is_locked').setValue(true);
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  checkMomentIsBetween(data, range1, range2) {
    const found = moment(data).isBetween(moment(range1, 'DD/MM/YYYY'), moment(range2, 'DD/MM/YYYY')) || data === range2;
    return found;
  }

  comparison() {
    const firstForm = _.cloneDeep(this.firstForm);
    const form = _.cloneDeep(this.identityForm.value);
    delete firstForm.note;
    delete form.note;
    if (JSON.stringify(firstForm) === JSON.stringify(form)) {
      return true;
    } else {
      return false;
    }
  }

  checkManualTerm() {
    if (this.data) {
      if (
        parseFloat(this.data.total_amount).toFixed(2) === this.data.amount_paid ||
        parseInt(this.data.total_amount) <= parseInt(this.data.amount_paid)
      ) {
        return true;
      } else {
        const currentRemaining = this.ramainingBill - (this.isDepositDone || this.isDepositPartial ? 0 : this.data.deposit);
        if (currentRemaining > 0) {
          return false;
        } else {
          return true;
        }
      }
    }
  }

  checkPayment(data, event?) {
    // console.log('_check', data, event);

    const credit = this.identityForm.get('credit').value;
    const transfer = this.identityForm.get('transfer').value;
    const cheque = this.identityForm.get('cheque').value;
    const bank_debit = this.identityForm.get('bank_debit').value;
    const cash = this.identityForm.get('cash').value;

    // console.log(credit, transfer, cheque, bank_debit);
    if (!credit && !transfer && !cheque && !bank_debit && !cash) {
      this.identityForm.get('credit').setValue(false);
      this.identityForm.get('transfer').setValue(false);
      this.identityForm.get('cheque').setValue(false);
      this.identityForm.get('bank_debit').setValue(false);
      this.identityForm.get('cash').setValue(false);

      this.identityForm.get('payment_method').setValue(null);
    }

    if (data === 'sepa') {
      this.identityForm.get('payment_method').setValue('sepa');
      this.identityForm.get('credit').setValue(true);
      this.identityForm.get('transfer').setValue(false);
      this.identityForm.get('cheque').setValue(false);
      this.identityForm.get('bank_debit').setValue(false);
      this.identityForm.get('cash').setValue(false);
    } else if (data === 'transfer') {
      this.identityForm.get('payment_method').setValue('transfer');
      this.identityForm.get('credit').setValue(false);
      this.identityForm.get('transfer').setValue(true);
      this.identityForm.get('cheque').setValue(false);
      this.identityForm.get('bank_debit').setValue(false);
      this.identityForm.get('cash').setValue(false);
    } else if (data === 'credit_card') {
      this.identityForm.get('payment_method').setValue('credit_card');
      this.identityForm.get('credit').setValue(false);
      this.identityForm.get('transfer').setValue(false);
      this.identityForm.get('cheque').setValue(false);
      this.identityForm.get('bank_debit').setValue(true);
      this.identityForm.get('cash').setValue(false);
    } else if (data === 'check') {
      this.identityForm.get('payment_method').setValue('check');
      this.identityForm.get('credit').setValue(false);
      this.identityForm.get('transfer').setValue(false);
      this.identityForm.get('cheque').setValue(true);
      this.identityForm.get('bank_debit').setValue(false);
      this.identityForm.get('cash').setValue(false);
    } else if (data === 'cash') {
      this.identityForm.get('payment_method').setValue('cash');
      this.identityForm.get('credit').setValue(false);
      this.identityForm.get('transfer').setValue(false);
      this.identityForm.get('cheque').setValue(false);
      this.identityForm.get('bank_debit').setValue(false);
      this.identityForm.get('cash').setValue(true);
    }

    if (event && !event.checked) {
      this.checkPayment(this.data.payment_method);
    }
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }
}
