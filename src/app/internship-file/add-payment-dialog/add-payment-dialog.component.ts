import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import * as moment from 'moment';
import { FinancesService } from 'app/service/finance/finance.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'ms-add-payment-dialog',
  templateUrl: './add-payment-dialog.component.html',
  styleUrls: ['./add-payment-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class AddPaymentDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  identityForm: UntypedFormGroup;
  today: Date;
  studentId: any;
  studentData: any;
  dataPass: any;
  indexTab: any;
  isMainAddressSelected = false;
  isWaitingForResponse = false;

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
  alreadyPaid = false;
  isPartialDP = false;
  hasNotBilledTerm: boolean;
  originStatus: any;
  data: any;
  isLoadingTerms = false;
  originalTermsAffected = [];

  constructor(
    public dialogRef: MatDialogRef<AddPaymentDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private parseStringDatePipe: ParseStringDatePipe,
    private acadJourneyService: AcademicJourneyService,
    private financeService: FinancesService,
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.data = _.cloneDeep(this.parentData);
    this.today = new Date();
    this.iniVerificationForm();
    this.getTableTerms(this.data._id, 0);
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe((list: any[]) => {
      this.currencyList = list;
    });
    // if (this.data.terms && this.data.terms.length) {
    //   this.data.terms.forEach((element, index) => {
    //     element.term = index + 1;
    //   });
    //   this.termsList = this.data.terms;
    //   this.termsList = this.termsList
    //     .filter((temp) => temp.term_amount !== 0)
    //     .map((list) => {
    //       return {
    //         is_term_paid: list.is_term_paid,
    //         term: list.term,
    //         term_amount: list.term_amount,
    //         term_amount_chargeback: list.term_amount_chargeback,
    //         term_amount_not_authorised: list.term_amount_not_authorised,
    //         term_pay_amount: list.term_pay_amount,
    //         term_pay_date: list.term_pay_date,
    //         term_payment: list.term_payment,
    //         term_payment_deferment: list.term_payment_deferment,
    //         _id: list._id,
    //         amount_input: list.term_amount,
    //         term_status: list.term_status,
    //         term_amount_pending: list.term_amount_pending,
    //       };
    //     });

    //   // update dynamic dialog width based on termlist length
    //   if (this.termsList.length === 6) {
    //     this.dialogRef.updateSize('721px');
    //   } else if (this.termsList.length === 7) {
    //     this.dialogRef.updateSize('788px');
    //   } else if (this.termsList.length === 8) {
    //     this.dialogRef.updateSize('865px');
    //   }
    //   // console.log('_termlist', this.termsList);
    // }
    console.log('This is the data', this.data);
    // if (this.data.deposit_pay_amount) {
    //   this.data['depositPaid'] = this.data.deposit_pay_amount;
    //   this.alreadyPaid = this.data.deposit_pay_amount === this.data.deposit ? true : false;
    //   this.isPartialDP = this.data.deposit_pay_amount < this.data.deposit ? true : false;
    // } else {
    //   delete this.data['depositPaid'];
    // }
    if (this.data.is_financial_support && this.data.financial_support_info) {
      const info = this.data.financial_support_info;
      const lastName = info.family_name;
      const fullName = [];
      if (info.civility && info.civility !== 'neutral') {
        fullName.push(this.translate.instant(info.civility));
      }
      if (info.first_name) {
        fullName.push(info.first_name);
      } else if (info.name) {
        fullName.push(info.name);
      }
      if (lastName) {
        fullName.push(lastName);
      }
      const dataFinancialSupport = {
        civility: info.civility,
        email: info.email,
        last_name: lastName,
        first_name: info.name,
        isStudent: false,
        value: fullName.join(' '),
      };
      this.dataFinanceList.push(dataFinancialSupport);
      this.dataFinanceList = this.dataFinanceList.filter((res) => res && res.value && res.value !== ' ');
    } else {
      const dataStudent = {
        civility: this.data.candidate_id.civility,
        email: this.data.candidate_id.email,
        last_name: this.data.candidate_id.last_name,
        first_name: this.data.candidate_id.first_name,
        isStudent: true,
        value:
          (this.data.candidate_id.civility && this.data.candidate_id.civility !== 'neutral'
            ? this.translate.instant(this.data.candidate_id.civility) + ' '
            : '') +
          this.data.candidate_id.first_name +
          ' ' +
          this.data.candidate_id.last_name,
      };
      this.dataFinanceList.push(dataStudent);
      this.dataFinanceList = this.dataFinanceList.filter((res) => res && res.value && res.value !== ' ');
    }

    this.originStatus = _.cloneDeep(this.data.deposit_status);

    // if (this.alreadyPaid) {
    //   this.data.deposit_status = 'paid';
    // } else if (this.isPartialDP) {
    //   this.data.deposit_status = 'partially_paid';
    // }

    // this.recalculateAmount();
    this.subs.sink = this.identityForm
      .get('amount')
      .valueChanges.pipe(debounceTime(400))
      .subscribe((res) => {
        this.getTableTerms(this.data._id, res);
      });
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  getTableTerms(billing_id, amount: any = 0) {
    this.isLoadingTerms = true;
    this.subs.sink = this.financeService.getAffectedTermsBillingForAddPayment(amount, billing_id, 'sepa', null).subscribe(
      (resp) => {
        this.isLoadingTerms = false;
        if (resp && resp.length) {
          this.originalTermsAffected = _.cloneDeep(resp);
          this.termsList = this.mappingDataTerms(resp);
          if (this.termsList.length === 5) {
            this.dialogRef.updateSize('721px');
          } else if (this.termsList.length === 6) {
            this.dialogRef.updateSize('788px');
          } else if (this.termsList.length === 7) {
            this.dialogRef.updateSize('865px');
          }
          console.log('_termlist', this.termsList);
        } else {
          this.termsList = [];
        }
      },
      (err) => {
        this.isLoadingTerms = false;
        if (err['message'] === 'GraphQL error: amount cannot exceed more than DP') {
          Swal.fire({
            type: 'info',
            text: this.translate.instant('Down payment overpay'),
            confirmButtonText: this.translate.instant('SendForm_S2.Button'),
          }).then(() => {
            this.identityForm.get('amount').patchValue(null);
          });
        }
      },
    );
  }

  mappingDataTerms(data) {
    let result;
    result = data.map((res) => {
      return {
        _id: res?._id,
        term_index: res?.term_index,
        payment_type: res?.payment_type,
        is_term_pending: res?.is_term_pending,
        real_amount: this.data?.deposit,
        real_term_amount: res?.amount,
        is_partial: res?.is_partial,
        is_term_paid: res?.is_term_paid,
        pay_amount: res?.pay_amount,
        term_payment: res?.term_payment,
        term_payment_deferment: res?.term_payment_deferment,
        status: res?.status,
        term_pay_amount: res?.term_pay_amount,
        term_pay_date: res?.term_pay_date,
        term_amount:
          res?.status === 'partially_paid' ? res?.term_pay_amount ? res?.term_amount - res?.term_pay_amount : res?.term_amount : res?.term_amount,
        term_amount_pending: res?.term_amount_pending,
        term_amount_chargeback: res?.term_amount_chargeback,
        term_amount_not_authorised: res?.term_amount_not_authorised,
        remaining_amount: res?.status === 'partially_paid' ? this.data?.deposit - this.data?.deposit_pay_amount : this.data?.deposit,
        amount: res?.status === 'partially_paid' ? res?.amount - res?.pay_amount : res?.amount,
      };
    });
    return result;
  }

  getColorTerms(data) {
    if (data?.payment_type === 'term' || data?.payment_type === 'DP') {
      if (data?.status === 'billed' && !data?.is_term_pending) {
        return 'body-list bg-blue';
      } else if (data?.status === 'partially_paid') {
        return 'body-list bg-yellow';
      } else if (data?.status === 'paid') {
        return 'body-list bg-green';
      } else if (data?.status === 'pending' || data?.is_term_pending) {
        return 'body-list bg-orange';
      } else if (data?.status === 'not_authorised') {
        return 'body-list bg-red';
      } else if (data?.status === 'chargeback') {
        return 'body-list bg-purple';
      } else {
        return 'body-list';
      }
    }
  }

  getColorTermsDP(data) {
    if (data?.payment_type === 'term' || data?.payment_type === 'DP') {
      if (
        data?.status === 'billed' &&
        !data?.is_term_pending &&
        this.data?.candidate_id?.payment !== 'pending' &&
        this.data?.candidate_id?.payment !== 'sepa_pending'
      ) {
        return 'body-list bg-blue';
      } else if (data?.status === 'partially_paid') {
        return 'body-list bg-orange';
      } else if (data?.status === 'paid') {
        return 'body-list bg-green';
      } else if (
        data?.status === 'pending' ||
        data?.is_term_pending ||
        this.data?.candidate_id?.payment === 'pending' ||
        this.data?.candidate_id?.payment === 'sepa_pending'
      ) {
        return 'body-list bg-orange';
      } else if (data?.status === 'not_authorised') {
        return 'body-list bg-red';
      } else if (data?.status === 'chargeback') {
        return 'body-list bg-purple';
      } else {
        return 'body-list';
      }
    }
  }

  transactionSelected(data) {
    if (data !== 'down_payment') {
      const balance = data.term_amount - data.term_pay_amount;
      this.identityForm.get('amount').setValue(balance);
    } else {
      this.identityForm.get('amount').setValue(this.data.deposit);
    }
  }

  recalculateAmount() {
    const amount = Math.abs(this.identityForm.get('amount').value);
    if (this.identityForm.get('amount').value < 0) {
      this.identityForm.get('amount').setValue(amount);
    }

    let tempTerm = _.cloneDeep(this.data.terms);
    const dataDeposit = _.cloneDeep(this.data.deposit);
    let depositPaid = 0;
    let isPartialDone;

    // Reset paid deposit value and check if partial already paid fully
    if (this.isPartialDP) {
      this.data['depositPaid'] = this.data.deposit_pay_amount;
      isPartialDone = amount + this.data.deposit_pay_amount > dataDeposit ? true : false;
    }
    if (amount > dataDeposit || this.alreadyPaid || isPartialDone) {
      depositPaid = dataDeposit;
      this.data['depositPaid'] = depositPaid;
      tempTerm = tempTerm
        .filter((filtered) => filtered?.term_amount > 0)
        .map((list) => {
          return {
            is_term_paid: list.term_pay_amount !== list.term_amount ? false : list.is_term_paid,
            term: list.term,
            term_amount: list.term_amount,
            term_pay_amount: list.term_pay_amount,
            term_pay_date: list.term_pay_date,
            term_payment: list.term_payment,
            term_payment_deferment: list.term_payment_deferment,
            _id: list._id,
            amount_input: list.term_pay_amount,
            term_status: list.term_status,
            term_amount_pending: list.term_amount_pending,
            term_amount_chargeback: list.term_amount_chargeback,
            terms_index: list.terms_index,
          };
        });
      // const termList = this.data.terms.filter((list) => list.is_term_paid === false || list.term_amount !== list.term_pay_amount);
      // console.log(this.data.terms);
      // console.log(tempTerm);
      let totalAmount;
      if (this.alreadyPaid) {
        totalAmount = amount;
        this.data.deposit_status = 'paid';
      } else if (isPartialDone) {
        totalAmount = amount + this.data.deposit_pay_amount - dataDeposit;
        this.data.deposit_status = 'partially_paid';
      } else {
        totalAmount = amount - dataDeposit;
      }

      if (tempTerm && tempTerm.length) {
        for (const temp of tempTerm) {
          // if (!temp.is_term_paid && totalAmount) {
          //   if (temp.term_amount <= temp.term_pay_amount + totalAmount) {
          //     temp.term_pay_amount = temp.term_amount;
          //     temp.is_term_paid = true;
          //     totalAmount -= temp.term_amount - temp.amount_input;
          //   } else {
          //     temp.term_pay_amount = temp.term_pay_amount + totalAmount;
          //     totalAmount = 0;
          //     break;
          //   }
          // }
          if (temp.is_term_paid) {
            continue;
          } else if (this.data?.student_type?.type_of_information === 'classic') {
            if (!temp.is_term_paid && totalAmount && temp.term_status) {
              if (temp.term_amount <= parseFloat((temp.term_pay_amount + totalAmount).toFixed(2))) {
                temp.term_pay_amount = temp.term_amount;
                temp.is_term_paid = true;
                totalAmount -= parseFloat((temp.term_amount - temp.amount_input).toFixed(2));
                temp.term_status = 'paid';
              } else if (temp.term_amount >= parseFloat((temp.term_pay_amount + totalAmount).toFixed(2)) && temp.term_amount_chargeback) {
                temp.term_pay_amount = temp.term_amount;
                temp.is_term_paid = true;
                totalAmount -= parseFloat((temp.term_amount - temp.amount_input).toFixed(2));
                temp.term_status = 'paid';
              } else {
                temp.term_pay_amount = parseFloat((temp.term_pay_amount + totalAmount).toFixed(2));
                totalAmount = 0;
                temp.term_status = 'partially_paid';
                break;
              }
            } else {
              this.hasNotBilledTerm = false;
              break;
            }
          } else {
            if (this.data?.student_type?.type_of_information !== 'classic') {
              if (!temp.is_term_paid && totalAmount && temp.term_status !== 'not_billed') {
                if (temp.term_amount <= parseFloat((temp.term_pay_amount + totalAmount).toFixed(2))) {
                  temp.term_pay_amount = temp.term_amount;
                  temp.is_term_paid = true;
                  totalAmount -= parseFloat((temp.term_amount - temp.amount_input).toFixed(2));
                  temp.term_status = 'paid';
                } else if (temp.term_amount >= temp.term_pay_amount + totalAmount && temp.term_amount_chargeback) {
                  temp.term_pay_amount = temp.term_amount;
                  temp.is_term_paid = true;
                  totalAmount -= temp.term_amount - temp.amount_input;
                  temp.term_status = 'paid';
                } else {
                  temp.term_pay_amount = parseFloat((temp.term_pay_amount + totalAmount).toFixed(2));
                  totalAmount = 0;
                  temp.term_status = 'partially_paid';
                  break;
                }
              } else if (!temp.is_term_paid && totalAmount && temp.term_status === 'not_billed') {
                if (temp.term_amount <= parseFloat((temp.term_pay_amount + totalAmount).toFixed(2))) {
                  temp.term_pay_amount = temp.term_amount;
                  temp.is_term_paid = true;
                  totalAmount -= parseFloat((temp.term_amount - temp.amount_input).toFixed(2));
                  temp.term_status = 'paid';
                } else {
                  temp.term_pay_amount = parseFloat((temp.term_pay_amount + totalAmount).toFixed(2));
                  totalAmount = 0;
                  temp.term_status = 'partially_paid';
                  break;
                }
              } else {
                this.hasNotBilledTerm = false;
                break;
              }
            }
          }
        }
      }

      this.termsList.forEach((element, indexBill) => {
        tempTerm.forEach((terms, indexTerms) => {
          if (element.term === terms.term) {
            this.termsList[indexBill] = tempTerm[indexTerms];
          }
        });
      });

      // console.log(amount, tempTerm, this.termsList);
      // console.log('_1', this.originStatus);

      if (amount === 0) {
        this.data.deposit_status = this.originStatus;
      } else if (dataDeposit > amount + this.data.deposit_pay_amount) {
        this.data.deposit_status = 'partially_paid';
      } else if (dataDeposit <= amount + this.data.deposit_pay_amount) {
        this.data.deposit_status = 'paid';
      }
      // console.log('_1', this.data.deposit_status);
    } else {
      depositPaid = amount;
      if (this.isPartialDP) {
        this.data['depositPaid'] = this.data.depositPaid + depositPaid;
      } else {
        this.data['depositPaid'] = depositPaid;
      }
      tempTerm = _.cloneDeep(this.data.terms);
      this.termsList.forEach((element, indexBill) => {
        tempTerm.forEach((terms, indexTerms) => {
          if (element.term === terms.term) {
            this.termsList[indexBill] = tempTerm[indexTerms];
          }
        });
      });

      if (amount === 0) {
        this.data.deposit_status = this.originStatus;
      } else if (dataDeposit > amount + this.data.deposit_pay_amount) {
        this.data.deposit_status = 'partially_paid';
      } else if (dataDeposit <= amount + this.data.deposit_pay_amount) {
        this.data.deposit_status = 'paid';
      }

      // console.log('_2', this.data.deposit_status);
    }
  }

  iniVerificationForm() {
    this.identityForm = this.fb.group({
      payment_method: [null, Validators.required],
      amount: [null, [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{1,2})?$')]],
      who: [null, Validators.required],
      transaction: [null],
      credit: [false],
      transfer: [false],
      cheque: [false],
      sepa: [false],
      cash: [false],
      currency: ['EUR'],
      date: [this.today, Validators.required],
      reference: [null, Validators.required],
      note: [null],
      ref_payer: [null],
      cheque_number: [null],
      bank: [null],
    });
  }

  checkPayment(data) {
    const credit = this.identityForm.get('credit').value;
    const transfer = this.identityForm.get('transfer').value;
    const cheque = this.identityForm.get('cheque').value;
    const sepa = this.identityForm.get('sepa').value;
    const cash = this.identityForm.get('cash').value;

    // console.log(credit, transfer, cheque, sepa);
    if (!credit && !transfer && !cheque && !sepa && !cash) {
      this.identityForm.get('credit').setValue(false);
      this.identityForm.get('transfer').setValue(false);
      this.identityForm.get('cheque').setValue(false);
      this.identityForm.get('sepa').setValue(false);
      this.identityForm.get('cash').setValue(false);

      this.identityForm.get('cheque_number').setValue('');
      this.identityForm.get('ref_payer').setValue('');
      this.identityForm.get('payment_method').setValue(null);
      return;
    }
    if (data === 'credit') {
      this.identityForm.get('payment_method').setValue('credit_card');
      this.identityForm.get('credit').setValue(true);
      this.identityForm.get('transfer').setValue(false);
      this.identityForm.get('cheque').setValue(false);
      this.identityForm.get('sepa').setValue(false);
      this.identityForm.get('cheque_number').setValue('');
      this.identityForm.get('ref_payer').setValue('');
      this.identityForm.get('bank').setValue(null);
      this.identityForm.get('cash').setValue(false);
    } else if (data === 'transfer') {
      this.identityForm.get('payment_method').setValue('transfer');
      this.identityForm.get('credit').setValue(false);
      this.identityForm.get('transfer').setValue(true);
      this.identityForm.get('cheque').setValue(false);
      this.identityForm.get('sepa').setValue(false);
      this.identityForm.get('cheque_number').setValue('');
      this.identityForm.get('ref_payer').setValue('');
      this.identityForm.get('bank').setValue(null);
      this.identityForm.get('cash').setValue(false);
    } else if (data === 'sepa') {
      this.identityForm.get('payment_method').setValue('sepa');
      this.identityForm.get('credit').setValue(false);
      this.identityForm.get('transfer').setValue(false);
      this.identityForm.get('cheque').setValue(false);
      this.identityForm.get('sepa').setValue(true);
      this.identityForm.get('cheque_number').setValue('');
      this.identityForm.get('ref_payer').setValue('');
      this.identityForm.get('bank').setValue(null);
      this.identityForm.get('cash').setValue(false);
    } else if (data === 'cheque') {
      this.identityForm.get('payment_method').setValue('check');
      this.identityForm.get('credit').setValue(false);
      this.identityForm.get('transfer').setValue(false);
      this.identityForm.get('cheque').setValue(true);
      this.identityForm.get('sepa').setValue(false);
      this.identityForm.get('cash').setValue(false);
    } else if (data === 'cash') {
      this.identityForm.get('payment_method').setValue('cash');
      this.identityForm.get('credit').setValue(false);
      this.identityForm.get('transfer').setValue(false);
      this.identityForm.get('cheque').setValue(false);
      this.identityForm.get('sepa').setValue(false);
      this.identityForm.get('cash').setValue(true);
    }
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

  formatCurrencyFloat(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
      num = num.toString().slice(0, -3);
    }
    return num;
  }

  checkIsNumber(num) {
    let allow = false;
    if (Number.isInteger(num)) {
      allow = true;
    }
    return allow;
  }

  translateDates(date) {
    return moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
  }

  submitVerification() {
    if (this.identityForm.invalid) {
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
      if (this.hasNotBilledTerm) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Organization_S3.Title'),
          html: this.translate.instant('Organization_S3.Body'),
          confirmButtonText: this.translate.instant('Organization_S3.Button'),
          allowOutsideClick: false,
          allowEnterKey: false,
          allowEscapeKey: false,
          onOpen: (modalEl) => {
            modalEl.setAttribute('data-cy', 'swal-organization-s3');
          },
        }).then(() => {
          this.data.deposit_status = this.originStatus;
          this.dialogRef.close();
        });
      } else if (this.data?.deposit > 0 && this.originStatus !== 'paid' && this.identityForm.get('amount').value > this.data?.deposit) {
        Swal.fire({
          type: 'info',
          text: this.translate.instant('Down payment overpay'),
          confirmButtonText: this.translate.instant('SendForm_S2.Button'),
        });
      } else {
        this.isWaitingForResponse = true;
        const payload = _.cloneDeep(this.identityForm.value);
        if (payload.date) {
          payload.date = moment(payload.date).format('DD/MM/YYYY');
        }

        // Remove payload
        delete payload.credit;
        delete payload.cheque;
        delete payload.transfer;
        delete payload.sepa;
        delete payload.cash;
        const billing_input = this.generatePayloadBilling(this.termsList);
        const affected_terms = this.generateAffectedTerms(this.originalTermsAffected);

        this.subs.sink = this.financeService.AddPaymentAfterCalculation(payload, this.data._id, affected_terms, billing_input).subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            // console.log('Edit Payment Mode', resp);
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
              onOpen: (modalEl) => {
                modalEl.setAttribute('data-cy', 'swal-bravo');
              },
            }).then(() => {
              this.dialogRef.close(true);
            });
          },
          (err) => {
            this.isWaitingForResponse = false;
            // Record error log
            this.authService.postErrorLog(err);
            if (
              err['message'] ===
              'GraphQL error: You are trying to add payment on a term not billed yet. You must generate the billing for the term first.'
            ) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('Organization_S3.Title'),
                html: this.translate.instant('Organization_S3.Body'),
                confirmButtonText: this.translate.instant('Organization_S3.Button'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
                onOpen: (modalEl) => {
                  modalEl.setAttribute('data-cy', 'swal-organization-s3');
                },
              }).then(() => {
                this.data.deposit_status = this.originStatus;
                this.dialogRef.close();
              });
            } else if (
              err &&
              err['message'] &&
              err['message'].includes('Cannot add manual payment, there is transaction on pending by SEPA')
            ) {
              Swal.fire({
                type: 'warning',
                title: this.translate.instant('PAY_SUM_S2.Title'),
                html: this.translate.instant('PAY_SUM_S2.Text'),
                confirmButtonText: this.translate.instant('PAY_SUM_S2.Button'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
                onOpen: (modalEl) => {
                  modalEl.setAttribute('data-cy', 'swal-pay-sum-s2');
                },
              });
            } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
  }

  closeDialog() {
    this.dialogRef.close();
  }

  get form() {
    return this.identityForm.controls;
  }

  generatePayloadBilling(data) {
    const terms = [];
    let billing = {
      deposit: 0,
      deposit_pay_amount: 0,
      deposit_status: null,
      terms: [],
      is_deposit_completed: false,
    };
    if (data?.length) {
      data.forEach((element) => {
        if (element?.payment_type === 'term') {
          const dataTerm = {
            term_amount: element?.real_term_amount,
            is_partial: element?.status === 'partially_paid' ? true : false,
            is_term_paid: element?.status === 'paid' ? true : false,
            term_status: element?.status,
            term_amount_chargeback: element?.term_amount_chargeback,
            term_amount_not_authorised: element?.term_amount_not_authorised,
            term_amount_pending: element?.term_amount_pending,
            term_pay_amount: element?.status === 'paid' ? element?.real_term_amount : element?.term_pay_amount + element?.pay_amount,
            term_pay_date: element?.term_pay_date,
            term_payment: element?.term_payment,
            term_payment_deferment: element?.term_payment_deferment,
            _id: element?._id,
          };
          terms.push(dataTerm);
        } else {
          billing = {
            deposit: element?.real_amount,
            deposit_pay_amount: element?.status === 'paid' ? element?.real_amount : element?.pay_amount + this.data?.deposit_pay_amount,
            deposit_status: element?.status,
            terms: [],
            is_deposit_completed: element?.status === 'paid' ? true : false,
          };
        }
      });
      if (terms?.length) {
        billing.terms = terms;
      }
    }
    return billing;
  }

  generateAffectedTerms(data) {
    const terms = [];
    if (data?.length) {
      data.forEach((element) => {
        const filterData = _.cloneDeep(element);
        Object.keys(filterData).forEach((key) => {
          if (!filterData[key] && filterData[key] !== false) {
            delete filterData[key];
          }
        });
        terms.push(filterData);
      });
    }
    return terms;
  }

  decimalFilter(event: any) {
    const reg = /^-?\d*[.,]?\d{0,2}$/;
    const input = event.target.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

  dissallowZero(event) {
    if (event.target.value === '0') {
      event.target.value = null;
      this.identityForm.get('amount').patchValue(null);
    }
  }

  /* fullyPaidDP(control: AbstractControl) {
    if (control.value < this.data.deposit && !this.alreadyPaid) {
      return { fullyPaidDP: true };
    } else {
      return null;
    }
  } */

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }
}
