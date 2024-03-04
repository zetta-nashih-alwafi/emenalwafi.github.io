import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
// import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
// import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import * as moment from 'moment';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import * as _ from 'lodash';
import { SpeechToTextDialogComponent } from 'app/shared/components/speech-to-text-dialog/speech-to-text-dialog.component';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-change-payment-organization-dialog',
  templateUrl: './change-payment-organization-dialog.component.html',
  styleUrls: ['./change-payment-organization-dialog.component.scss'],
  providers: [ParseStringDatePipe, ParseLocalToUtcPipe, ParseUtcToLocalPipe],
})
export class ChangePaymentOrganizationDialogComponent implements OnInit {
  private subs = new SubSink();
  changePaymentOrganizationForm: UntypedFormGroup;
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
  isWaitingForResponse = false;
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
  isDepositPartial = false;
  isHaveDeposit = false;
  isCanAddTerm: boolean;

  constructor(
    public dialogRef: MatDialogRef<ChangePaymentOrganizationDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private parseStringDatePipe: ParseStringDatePipe,
    private parseLocalToUTCPipe: ParseLocalToUtcPipe,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private financeService: FinancesService,
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private dialog: MatDialog,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initChangePaymentOrganizationForm();
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

    // this.termlList = _.cloneDeep(this.parentData.source.terms);
    const termList = _.cloneDeep(this.parentData.source.terms);
    this.termlList = termList.filter((res) => res.term_amount !== 0);
    this.patchValue();
    this.firstForm = _.cloneDeep(this.changePaymentOrganizationForm.value);
  }

  addPayment() {
    this.payment.push(this.initPayment());
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  patchValue() {
    if (this.parentData.source && this.parentData.source.deposit && this.parentData.source.deposit > 0) {
      this.isHaveDeposit = true;
      this.depositValue = this.parentData.source.deposit;
      if (
        (this.parentData.source.deposit_pay_amount && this.parentData.source.deposit_pay_amount === this.parentData.source.deposit) ||
        this.parentData.source.is_deposit_completed
      ) {
        this.isDepositDone = true;
        this.isDepositPartial = false;
      } else if (this.parentData.source.deposit_pay_amount && this.parentData.source.deposit_pay_amount < this.parentData.source.deposit) {
        this.isDepositPartial = true;
        this.depositValue = this.parentData.source.deposit - this.parentData.source.deposit_pay_amount;
        this.isDepositDone = false;
      }
    } else {
      this.isHaveDeposit = false;
    }
    if (this.parentData?.source?.student_type?.type_of_information === 'classic') {
      this.isCanAddTerm = true;
    } else {
      this.isCanAddTerm = this.parentData?.source?.terms?.some((term) => term?.term_status === 'not_billed');
    }

    this.ramainingBill =
      this.parentData.source.total_amount - (this.parentData.source.amount_paid ? parseFloat(this.parentData.source.amount_paid) : 0);
    if (this.termlList && this.termlList.length) {
      this.termsList = this.termlList.filter((temp) => temp.term_amount !== 0).sort((a, b) => (a.terms_index > b.terms_index ? 1 : -1));
      const dataEditable = this.termlList.filter(
        (temp) =>
          temp.is_term_paid === false || temp.is_partial === true || (temp.term_pay_amount && temp.term_pay_amount !== temp.term_amount),
      );
      if (this.termsList && this.termsList.length) {
        this.termsList.forEach(() => {
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
        this.parentData.source.terms = payload;
        this.termsList = payload;
        this.termlList = payload;
        this.tempTerms = payload;
        this.changePaymentOrganizationForm.get('terms').patchValue(payload);
        this.checkDateIsUsed();
        this.firstForm = _.cloneDeep(this.changePaymentOrganizationForm.value);
      }
    }

    this.updateSize('initial');
  }

  initChangePaymentOrganizationForm() {
    this.changePaymentOrganizationForm = this.fb.group({
      terms: this.fb.array([]),
      note: [null],
    });
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
      term_amount: [null, [Validators.min(1), Validators.required]],
      term_pay_amount: [0],
      terms_index: [0],
      term_pay_date: this.fb.group({
        date: [null],
        time: ['15:59'],
      }),
      term_status: ['not_billed'],
    });
  }

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
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

  get payment() {
    return this.changePaymentOrganizationForm.get('terms') as UntypedFormArray;
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

    data.forEach((terms, index, array) => {
      if (terms.term_payment.date) {
        const termsMoment = moment(terms.term_payment.date, 'DD/MM/YYYY');
        if (index === array.length - 1) {
          this.lastDate = termsMoment.format('DD/MM/YYYY');
        }
        const checkMonthTerms = termsMoment.format('M');
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
      }
    });
  }

  deleteTerm(ins) {
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('TERM_AMOUNT_SX.TITLE'),
      html: this.translate.instant('TERM_AMOUNT_SX.TEXT', {
        amount: this.changePaymentOrganizationForm.get('terms').get(ins.toString()).get('term_amount').value + ' €',
      }),
      showCancelButton: true,
      allowEscapeKey: true,
      allowOutsideClick: false,
      reverseButtons: true,
      confirmButtonText: this.translate.instant('TERM_AMOUNT_SX.BUTTON_1'),
      cancelButtonText: this.translate.instant('TERM_AMOUNT_SX.BUTTON_2'),
    }).then((res) => {
      if (res.value) {
        this.payment.removeAt(ins);
        this.termsList = [];
        let tempData = [];
        const data = this.changePaymentOrganizationForm.get('terms').value;
        tempData = _.cloneDeep(data);
        let currentRemaining = this.ramainingBill;
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
            balance = Math.round(parseInt(balance)).toString();
            tempData.forEach((element, indexBill) => {
              this.termsList.forEach((temp, indexTemp) => {
                if (element.terms_index === temp.terms_index) {
                  if (this.termsList.length - 1 === indexTemp) {
                    if (parseInt(balance) * this.termsList.length !== currentRemaining) {
                      const remaining = currentRemaining - parseInt(balance) * this.termsList.length;
                      // const balanceFinal = Math.round(parseInt(balance) + Math.abs(remaining)).toString();
                      const balanceFinal = (parseInt(balance) + remaining).toString();
                      this.changePaymentOrganizationForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balanceFinal);
                      element.term_amount = balanceFinal;
                    } else {
                      this.changePaymentOrganizationForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balance);
                      element.term_amount = balance;
                    }
                  } else {
                    this.changePaymentOrganizationForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balance);
                    element.term_amount = balance;
                  }
                }
              });
            });
          }
        }
        const datas = this.changePaymentOrganizationForm.get('terms').value;
        const dataUnlock = datas.filter((temp) => !temp.is_locked && (temp.is_term_paid === false || temp.is_partial === true));
        if (dataUnlock && dataUnlock.length === 1) {
          const index = datas.findIndex((x) => !x.is_locked && (x.is_term_paid === false || x.is_partial === true));
          this.changePaymentOrganizationForm.get('terms').get(index.toString()).get('is_locked').setValue(true);
        }
        this.checkDateIsUsed();
        this.updateSize('delete');
      }
    });
  }

  unlockTerm(ins) {
    const datas = this.changePaymentOrganizationForm.get('terms').value;
    const dataEditable = datas.filter((temp) => temp.is_term_paid === false || temp.is_partial === true);
    if (dataEditable && dataEditable.length === 1) {
      this.changePaymentOrganizationForm.get('terms').get(ins.toString()).get('is_locked').setValue(true);
    } else {
      const dataUnlock = datas.filter((temp) => !temp.is_locked && (temp.is_term_paid === false || temp.is_partial === true));
      if (!(dataUnlock && dataUnlock.length)) {
        if (datas.length - 1 === parseInt(ins)) {
          this.changePaymentOrganizationForm
            .get('terms')
            .get((ins - 1).toString())
            .get('is_locked')
            .setValue(false);
        } else {
          this.changePaymentOrganizationForm
            .get('terms')
            .get((ins + 1).toString())
            .get('is_locked')
            .setValue(false);
        }
      }
      this.changePaymentOrganizationForm.get('terms').get(ins.toString()).get('is_locked').setValue(false);
    }
  }

  lockTerm(ins) {
    this.changePaymentOrganizationForm.get('terms').get(ins.toString()).get('is_locked').setValue(true);
    const datas = this.changePaymentOrganizationForm.get('terms').value;
    const dataEditable = datas.filter((temp) => !temp.is_locked && (temp.is_term_paid === false || temp.is_partial === true));
    if (dataEditable && dataEditable.length === 1) {
      const index = datas.findIndex((x) => !x.is_locked && (x.is_term_paid === false || x.is_partial === true));
      this.changePaymentOrganizationForm.get('terms').get(index.toString()).get('is_locked').setValue(true);
    }
  }

  patchValueManually() {
    const payload = [];
    const lastDate = moment(this.lastDate, 'DD/MM/YYYY');
    this.payment.controls.forEach((element, indexPay) => {
      const data = {
        terms_index: 0,
        term_payment: { date: null, time: '15:59' },
        term_payment_deferment: { date: null, time: '15:59' },
        term_pay_date: { date: null, time: '15:59' },
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
        data.term_payment_deferment = this.parentData.source.terms[indexPay].term_payment_deferment;
      }
      if (
        this.tempTerms &&
        this.tempTerms[indexPay] &&
        this.tempTerms[indexPay].term_pay_date &&
        this.tempTerms[indexPay].term_pay_date.date
      ) {
        data.term_pay_date = this.parentData.source.terms[indexPay].term_pay_date;
      }
      if (this.parentData.source.terms && this.parentData.source.terms[indexPay] && this.parentData.source.terms[indexPay]._id) {
        data._id = this.parentData.source.terms[indexPay]._id;
      }
      payload.push(data);
    });
    this.tempTerms = payload;
    this.changePaymentOrganizationForm.get('terms').patchValue(payload);
  }

  addManualTerm() {
    const datas = this.changePaymentOrganizationForm.get('terms').value;
    const hasTerm = this.changePaymentOrganizationForm.get('terms').value;

    const dataUnlock = datas.filter((temp) => !temp.is_locked && (temp.is_term_paid === false || temp.is_partial === true));
    if (!(dataUnlock && dataUnlock.length)) {
      if (hasTerm.length > 0 && this.parentData.source.total_amount === this.parentData.source.amount_billed) {
        this.changePaymentOrganizationForm
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
    const data = this.changePaymentOrganizationForm.get('terms').value;
    tempData = _.cloneDeep(data);
    let currentRemaining = this.ramainingBill;
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
        balance = Math.round(parseInt(balance)).toString();
        tempData.forEach((element, indexBill) => {
          this.termsList.forEach((temp, indexTemp) => {
            if (element.terms_index === temp.terms_index) {
              if (this.termsList.length - 1 === indexTemp) {
                if (parseInt(balance) * this.termsList.length !== currentRemaining) {
                  const remaining = currentRemaining - parseInt(balance) * this.termsList.length;
                  // const balanceFinal = Math.round(parseInt(balance) + Math.abs(remaining)).toString();
                  const balanceFinal = (parseInt(balance) + remaining).toString();
                  this.changePaymentOrganizationForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balanceFinal);
                  this.changePaymentOrganizationForm
                    .get('terms')
                    .get(indexBill.toString())
                    .get('term_payment')
                    .patchValue(temp.term_payment);
                  element.term_amount = balanceFinal;
                  if (this.parentData.source.total_amount === this.parentData.source.amount_billed) {
                    this.changePaymentOrganizationForm.get('terms').get(indexBill.toString()).get('term_status').patchValue('billed');
                  }
                } else {
                  this.changePaymentOrganizationForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balance);
                  this.changePaymentOrganizationForm
                    .get('terms')
                    .get(indexBill.toString())
                    .get('term_payment')
                    .patchValue(temp.term_payment);
                  element.term_amount = balance;
                  if (this.parentData.source.total_amount === this.parentData.source.amount_billed) {
                    this.changePaymentOrganizationForm.get('terms').get(indexBill.toString()).get('term_status').patchValue('billed');
                  }
                }
              } else {
                this.changePaymentOrganizationForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balance);
                this.changePaymentOrganizationForm.get('terms').get(indexBill.toString()).get('term_payment').patchValue(temp.term_payment);
                element.term_amount = balance;
                if (this.parentData.source.total_amount === this.parentData.source.amount_billed) {
                  this.changePaymentOrganizationForm.get('terms').get(indexBill.toString()).get('term_status').patchValue('billed');
                }
              }
            }
          });
        });
      }
    }

    this.updateSize('add');
  }

  checkManualTerm() {
    if (this.parentData.source) {
      if (
        parseFloat(this.parentData.source.total_amount).toFixed(2) === this.parentData.source.amount_paid ||
        parseInt(this.parentData.source.total_amount) <= parseInt(this.parentData.source.amount_paid)
      ) {
        return true;
      } else {
        const currentRemaining = this.ramainingBill;
        if (currentRemaining > 0) {
          return false;
        } else {
          return true;
        }
      }
    }
  }

  comparison() {
    const firstForm = _.cloneDeep(this.firstForm);
    const form = _.cloneDeep(this.changePaymentOrganizationForm.value);
    delete firstForm.note;
    delete form.note;
    if (JSON.stringify(firstForm) === JSON.stringify(form)) {
      return true;
    } else {
      return false;
    }
  }

  translateDates(date) {
    let dateTerms = '-';
    if (date) {
      dateTerms = moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
    }
    return dateTerms;
  }

  keyUpBill(indexAmount) {
    this.termsList = [];
    let tempData = [];
    const data = this.changePaymentOrganizationForm.get('terms').value;
    tempData = _.cloneDeep(data);
    const terms_index = this.changePaymentOrganizationForm.get('terms').get(indexAmount.toString()).get('terms_index').value;
    let currentRemaining =
      this.ramainingBill -
      this.changePaymentOrganizationForm.get('terms').get(indexAmount.toString()).get('term_amount').value -
      (this.isDepositDone || this.isDepositPartial ? 0 : this.parentData.source.deposit);
    const tempAmount = _.cloneDeep(this.changePaymentOrganizationForm.get('terms').get(indexAmount.toString()).get('term_amount').value);
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
        tempData.forEach((element, indexBill) => {
          this.termsList.forEach((temp, indexTemp) => {
            if (element.terms_index === temp.terms_index) {
              if (this.termsList.length - 1 === indexTemp) {
                if (parseInt(balance) * this.termsList.length !== currentRemaining) {
                  const remaining = currentRemaining - parseInt(balance) * this.termsList.length;
                  // const balanceFinal = Math.round(parseInt(balance) + Math.abs(remaining)).toString();
                  const balanceFinal = (parseInt(balance) + parseFloat(remaining.toFixed(2))).toString();
                  this.changePaymentOrganizationForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balanceFinal);
                  element.term_amount = parseFloat(parseFloat(balanceFinal).toFixed(2));
                } else {
                  this.changePaymentOrganizationForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balance);
                  element.term_amount = parseFloat(parseFloat(balance).toFixed(2));
                }
              } else {
                this.changePaymentOrganizationForm.get('terms').get(indexBill.toString()).get('term_amount').setValue(balance);
                element.term_amount = parseFloat(parseFloat(balance).toFixed(2));
              }
            }
          });
        });
        tempData[indexAmount].term_amount = tempAmount;
        this.changePaymentOrganizationForm.get('terms').get(indexAmount.toString()).get('term_amount').setValue(tempAmount);
      }
    }
  }

  createPayload() {
    const payload = _.cloneDeep(this.changePaymentOrganizationForm.value);
    payload.terms.forEach((element, indexPart) => {
      // if (element.term_payment_deferment.date) {
      //   if (!element.term_payment_deferment.time) {
      //     element.term_payment_deferment.time = '15:59';
      //   }
      //   element.term_payment_deferment.date = this.parseLocalToUTCPipe.transformDate(
      //     moment(element.term_payment_deferment.date).format('DD/MM/YYYY'),
      //     element.term_payment_deferment.time,
      //   );
      //   element.term_payment_deferment.time = this.parseLocalToUTCPipe.transform(element.term_payment_deferment.time)
      //     ? this.parseLocalToUTCPipe.transform(element.term_payment_deferment.time)
      //     : '15:59';
      // }
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
      delete element.terms_index;
      if (!element._id) {
        delete element._id;
      }
      delete element.term_payment_deferment
    });
    const profil_rate = this.parentData.source.profil_rate.split('-');
    if (this.parentData.source.terms && this.parentData.source.terms.length) {
      if (this.parentData.source.terms.length !== payload.terms.length) {
        payload.is_profil_rate_updated = true;
        // payload.profil_rate =
        // (profil_rate && profil_rate.length ? profil_rate[0] : '8800€ ') + '- ' + payload.terms.length + ' echeances';
      }
    }
    payload['term_times'] = payload.terms.length;

    //  Handling if any term got 100% avoir
    if (this.parentData && this.parentData.source && this.parentData.source.index && this.parentData.source.index.length > 0) {
      this.parentData.source.index.forEach((idx) => {
        this.parentData.source.term_avoir.forEach((term) => {
          payload.terms.splice(idx, 0, term);
        });
      });
    }

    this.subs.sink = this.financeService.UpdateFinanceOrganization(payload, this.parentData.source._id).subscribe(
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
          }).then(() => {
            this.dialogRef.close(true);
          });
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
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

  submitVerification() {
    if (this.changePaymentOrganizationForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.changePaymentOrganizationForm.markAllAsTouched();
    } else {
      this.isWaitingForResponse = true;
      this.createPayload();
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  updateSize(type) {
    if (type === 'delete' || type === 'initial') {
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
    } else {
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
    }
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }
}
