import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import * as moment from 'moment';
import { FinancesService } from 'app/service/finance/finance.service';
import Swal from 'sweetalert2';
import { AuthService } from 'app/service/auth-service/auth.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'ms-add-payment-organization-dialog',
  templateUrl: './add-payment-organization-dialog.component.html',
  styleUrls: ['./add-payment-organization-dialog.component.scss'],
})
export class AddPaymentOrganizationDialogComponent implements OnInit, OnDestroy {
  payementOrganizationForm: UntypedFormGroup;
  private subs = new SubSink();

  isWaitingForResponse = false;
  today: Date;
  isPartialDP = false;
  dataFinanceList = [];
  currencyList = [];
  termsList = [];
  alreadyPaid = false;
  private timeOutVal: any;
  private intVal: any;
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
  hasNotBilledTerm: boolean;
  isLoadingTerms = false;
  originalTermsAffected = [];
  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddPaymentOrganizationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    public translate: TranslateService,
    private acadJourneyService: AcademicJourneyService,
    private financeService: FinancesService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.today = new Date();
    this.iniPayementOrganizationForm();
    this.getTableTerms(this.parentData?.source?._id, 0);
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe((list: any[]) => {
      this.currencyList = list;
    });

    // if (this.parentData.source.terms && this.parentData.source.terms.length) {
    //   this.parentData.source.terms.forEach((element, index) => {
    //     element.term = index + 1;
    //   });
    //   this.termsList = this.parentData.source.terms.filter(
    //     (list) => list.is_term_paid === false || list.term_amount !== list.term_pay_amount,
    //   );
    //   this.termsList = this.parentData.source.terms;
    //   this.termsList = this.termsList
    //     .filter((temp) => temp.term_amount !== 0)
    //     .map((list) => {
    //       return {
    //         is_term_paid: list.is_term_paid,
    //         term: list.term,
    //         term_amount: list.term_amount,
    //         term_pay_amount: list.term_pay_amount,
    //         term_pay_date: list.term_pay_date,
    //         term_payment: list.term_payment,
    //         term_payment_deferment: list.term_payment_deferment,
    //         _id: list._id,
    //         amount_input: list.term_amount,
    //         term_status: list.term_status,
    //         terms_index: list.terms_index,
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
    // }

    if (this.parentData.source.organization_name) {
      this.payementOrganizationForm.get('who').setValue(this.parentData.source.organization_name);
    }
    this.subs.sink = this.payementOrganizationForm
      .get('amount')
      .valueChanges.pipe(debounceTime(400))
      .subscribe((res) => {
        this.getTableTerms(this.parentData?.source?._id, res);
      });
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  getTableTerms(finance_organization_id, amount: any = 0) {
    this.isLoadingTerms = true;
    this.subs.sink = this.financeService.getAffectedTermsFinancement(amount, finance_organization_id).subscribe(
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
            this.payementOrganizationForm.get('amount').patchValue(null);
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
        real_amount: this.parentData?.source?.deposit,
        real_term_amount: res?.amount,
        is_partial: res?.is_partial,
        is_term_paid: res?.is_term_paid,
        pay_amount: res?.pay_amount,
        term_payment: res?.term_payment,
        term_payment_deferment: res?.term_payment_deferment,
        status: res?.status,
        term_pay_amount: res?.term_pay_amount,
        term_pay_date: res?.term_pay_date,
        term_amount: res?.status === 'partially_paid' ? res?.term_amount - res?.term_pay_amount : res?.term_amount,
        amount: res?.status === 'partially_paid' ? res?.amount - res?.term_pay_amount : res?.amount,
      };
    });
    return result;
  }

  getColorTerms(data) {
    if (data?.payment_type === 'term') {
      if (data?.status === 'billed') {
        return 'body-list bg-blue';
      } else if (data?.status === 'partially_paid') {
        return 'body-list bg-yellow';
      } else if (data?.status === 'paid') {
        return 'body-list bg-green';
      } else if (data?.status === 'pending') {
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

  // recalculateAmount() {
  //   const amount = Math.abs(this.payementOrganizationForm.get('amount').value);
  //   if (this.payementOrganizationForm.get('amount').value < 0) {
  //     this.payementOrganizationForm.get('amount').setValue(amount);
  //   }

  //   let tempTerm = _.cloneDeep(this.parentData.source.terms);

  //   if (amount) {
  //     tempTerm = tempTerm.map((list) => {
  //       return {
  //         is_term_paid: list.term_pay_amount !== list.term_amount ? false : list.is_term_paid,
  //         term: list.term,
  //         term_amount: list.term_amount,
  //         term_pay_amount: list.term_pay_amount,
  //         term_pay_date: list.term_pay_date,
  //         term_payment: list.term_payment,
  //         term_payment_deferment: list.term_payment_deferment,
  //         _id: list._id,
  //         amount_input: list.term_pay_amount,
  //         term_status: list.term_status,
  //       };
  //     });
  //     let totalAmount;
  //     totalAmount = amount;
  //     if (tempTerm && tempTerm.length) {
  //       for (const temp of tempTerm) {
  //         if (temp.is_term_paid) {
  //           continue;
  //         } else if (!temp.is_term_paid && totalAmount && temp.term_status !== 'not_billed') {
  //           if (temp.term_amount <= temp.term_pay_amount + totalAmount) {
  //             temp.term_pay_amount = temp.term_amount;
  //             temp.is_term_paid = true;
  //             totalAmount -= temp.term_amount - temp.amount_input;
  //             temp.term_status = 'paid';
  //           } else {
  //             temp.term_pay_amount = temp.term_pay_amount + totalAmount;
  //             totalAmount = 0;
  //             temp.term_status = 'partially_paid';
  //             break;
  //           }
  //         } else if (!temp.is_term_paid && totalAmount && temp.term_status === 'not_billed') {
  //           this.hasNotBilledTerm = true;
  //           break;
  //         } else {
  //           this.hasNotBilledTerm = false;
  //           break;
  //         }
  //       }
  //     }

  //     this.termsList.forEach((element, indexBill) => {
  //       tempTerm.forEach((terms, indexTerms) => {
  //         if (element.term === terms.term) {
  //           this.termsList[indexBill] = tempTerm[indexTerms];
  //         }
  //       });
  //     });
  //   } else {
  //     tempTerm = _.cloneDeep(this.parentData.source.terms);
  //     this.termsList.forEach((element, indexBill) => {
  //       tempTerm.forEach((terms, indexTerms) => {
  //         if (element.term === terms.term) {
  //           this.termsList[indexBill] = tempTerm[indexTerms];
  //         }
  //       });
  //     });
  //   }
  // }

  iniPayementOrganizationForm() {
    this.payementOrganizationForm = this.fb.group({
      payment_method: [null, Validators.required],
      amount: [
        { value: null, disabled: this.parentData.source.remaining_billed < 0 },
        [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{1,2})?$')],
      ],
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

  translateDates(date) {
    return moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
  }
  checkIsNumber(num) {
    let allow = false;
    if (Number.isInteger(num)) {
      allow = true;
    }
    return allow;
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

  checkPayment(data) {
    const credit = this.payementOrganizationForm.get('credit').value;
    const transfer = this.payementOrganizationForm.get('transfer').value;
    const cheque = this.payementOrganizationForm.get('cheque').value;
    const sepa = this.payementOrganizationForm.get('sepa').value;
    const cash = this.payementOrganizationForm.get('cash').value;

    if (!credit && !transfer && !cheque && !sepa && !cash) {
      this.payementOrganizationForm.get('credit').setValue(false);
      this.payementOrganizationForm.get('transfer').setValue(false);
      this.payementOrganizationForm.get('cheque').setValue(false);
      this.payementOrganizationForm.get('sepa').setValue(false);
      this.payementOrganizationForm.get('cash').setValue(false);

      this.payementOrganizationForm.get('cheque_number').setValue('');
      this.payementOrganizationForm.get('ref_payer').setValue('');
      this.payementOrganizationForm.get('payment_method').setValue(null);
      return;
    }
    if (data === 'credit') {
      this.payementOrganizationForm.get('payment_method').setValue('credit_card');
      this.payementOrganizationForm.get('credit').setValue(true);
      this.payementOrganizationForm.get('transfer').setValue(false);
      this.payementOrganizationForm.get('cheque').setValue(false);
      this.payementOrganizationForm.get('sepa').setValue(false);
      this.payementOrganizationForm.get('cash').setValue(false);

      this.payementOrganizationForm.get('cheque_number').setValue('');
      this.payementOrganizationForm.get('ref_payer').setValue('');
      this.payementOrganizationForm.get('bank').setValue(null);
    } else if (data === 'transfer') {
      this.payementOrganizationForm.get('payment_method').setValue('transfer');
      this.payementOrganizationForm.get('credit').setValue(false);
      this.payementOrganizationForm.get('transfer').setValue(true);
      this.payementOrganizationForm.get('cheque').setValue(false);
      this.payementOrganizationForm.get('sepa').setValue(false);
      this.payementOrganizationForm.get('cash').setValue(false);

      this.payementOrganizationForm.get('cheque_number').setValue('');
      this.payementOrganizationForm.get('ref_payer').setValue('');
      this.payementOrganizationForm.get('bank').setValue(null);
    } else if (data === 'sepa') {
      this.payementOrganizationForm.get('payment_method').setValue('bank');
      this.payementOrganizationForm.get('credit').setValue(false);
      this.payementOrganizationForm.get('transfer').setValue(false);
      this.payementOrganizationForm.get('cheque').setValue(false);
      this.payementOrganizationForm.get('sepa').setValue(true);
      this.payementOrganizationForm.get('cash').setValue(false);

      this.payementOrganizationForm.get('cheque_number').setValue('');
      this.payementOrganizationForm.get('ref_payer').setValue('');
      this.payementOrganizationForm.get('bank').setValue(null);
    } else if (data === 'cheque') {
      this.payementOrganizationForm.get('payment_method').setValue('check');
      this.payementOrganizationForm.get('credit').setValue(false);
      this.payementOrganizationForm.get('transfer').setValue(false);
      this.payementOrganizationForm.get('cash').setValue(false);

      this.payementOrganizationForm.get('cheque').setValue(true);
      this.payementOrganizationForm.get('sepa').setValue(false);
    } else if (data === 'cash') {
      this.payementOrganizationForm.get('payment_method').setValue('cash');
      this.payementOrganizationForm.get('credit').setValue(false);
      this.payementOrganizationForm.get('transfer').setValue(false);
      this.payementOrganizationForm.get('cash').setValue(true);

      this.payementOrganizationForm.get('cheque').setValue(false);
      this.payementOrganizationForm.get('sepa').setValue(false);
    }
  }
  closeDialog() {
    this.dialogRef.close();
  }

  get form() {
    return this.payementOrganizationForm.controls;
  }

  submitVerification() {
    if (this.payementOrganizationForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.payementOrganizationForm.markAllAsTouched();
    } else {
      // comment because when the status hasn't been generated / blue icon, you can still pay manually
      // if (this.hasNotBilledTerm) {
      //   Swal.fire({
      //     type: 'info',
      //     title: this.translate.instant('Organization_S3.Title'),
      //     html: this.translate.instant('Organization_S3.Body'),
      //     confirmButtonText: this.translate.instant('Organization_S3.Button'),
      //     allowOutsideClick: false,
      //     allowEnterKey: false,
      //     allowEscapeKey: false,
      //   }).then(() => this.dialogRef.close());
      // } else {

      this.isWaitingForResponse = true;
      const payload = _.cloneDeep(this.payementOrganizationForm.value);
      if (payload.date) {
        payload.date = moment(payload.date).format('DD/MM/YYYY');
      }
      delete payload.credit;
      delete payload.cheque;
      delete payload.transfer;
      delete payload.sepa;
      delete payload.cash;
      const finance_organization_input = this.generatePayloadBilling(this.termsList);
      const affected_terms = this.generateAffectedTerms(this.originalTermsAffected);

      this.subs.sink = this.financeService
        .AddPaymentFinanceOrganization(payload, this.parentData.source._id, affected_terms, finance_organization_input)
        .subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close(true);
            });
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
            this.isWaitingForResponse = false;
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
              }).then(() => this.dialogRef.close());
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

  decimalFilter(event: any) {
    const reg = /^-?\d*[.,]?\d{0,2}$/;
    const input = event.target.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }

  generateAffectedTerms(data) {
    const terms = [];
    if (data?.length) {
      data.forEach((element) => {
        delete element?.payment_type;
        const filterData = _.cloneDeep(element);
        Object.keys(filterData).forEach((key) => {
          if (!filterData[key] && filterData[key] !== false && filterData[key] !== 0) {
            delete filterData[key];
          }
        });
        terms.push(filterData);
      });
    }
    return terms;
  }

  generatePayloadBilling(data) {
    const terms = [];
    const billing = {
      deposit: 0,
      deposit_pay_amount: 0,
      terms: [],
    };
    if (data?.length) {
      data.forEach((element) => {
        if (element?.payment_type === 'term') {
          const dataTerm = {
            term_amount: element?.real_term_amount,
            is_partial: element?.is_partial,
            is_term_paid: element?.is_term_paid,
            term_status: element?.status,
            term_pay_amount: element?.term_pay_amount,
            term_pay_date: element?.term_pay_date,
            term_payment: element?.term_payment,
            term_payment_deferment: element?.term_payment_deferment,
            _id: element?._id,
          };
          terms.push(dataTerm);
        }
      });
      if (terms?.length) {
        billing.terms = terms;
      }
    }
    return billing;
  }

  dissallowZero(event) {
    if (event.target.value === '0') {
      event.target.value = null;
      this.payementOrganizationForm.get('amount').patchValue(null);
    }
  }
}
