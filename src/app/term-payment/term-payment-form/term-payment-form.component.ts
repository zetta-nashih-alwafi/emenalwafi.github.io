import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { ApplicationUrls } from 'app/shared/settings';
import { environment } from 'environments/environment';
import { cloneDeep } from 'lodash';
import * as moment from 'moment';
import { debounceTime } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { TermPaymentService } from '../term-payment.service';
import * as _ from 'lodash';

declare var AdyenCheckout;

@Component({
  selector: 'ms-term-payment-form',
  templateUrl: './term-payment-form.component.html',
  styleUrls: ['./term-payment-form.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class TermPaymentFormComponent implements OnInit, OnDestroy {
  @Input() billingId: string;
  @Input() candidateId: string;
  @Input() student: any;
  @Input() formIdParam: string;
  @ViewChild('adyenDropInWrapper', { static: false }) adyenDropInWrapperRef: ElementRef;
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  private subs: SubSink = new SubSink();
  paymentAmount: UntypedFormControl = new UntypedFormControl(null, [
    Validators.required,
    Validators.min(1),
    Validators.pattern('^[0-9]+(.[0-9]{1,2})?$'),
  ]);
  selectedPaymentMethod: UntypedFormControl = new UntypedFormControl(null, [Validators.required]);
  isWaitingForResponse = false;
  isLoading = false;
  isPreparingAdyen = false;
  hasNotBilledTerm = false;
  billing: any;
  checkout: any;
  transfer: UntypedFormGroup;
  confirmationForm: UntypedFormControl = new UntypedFormControl(false, [Validators.required]);
  adyenPaymentMethods: string[] = ['credit_card', 'sepa'];
  paymentMethod: string[] = ['transfer', 'sepa'];
  statusChargeback;

  processFinish = false;
  candidateData: any;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  documenPDFName: any = '';

  formId;
  legalEntityData: any;
  max_amount: number;
  maxAmount: number;
  termsList: any = [];
  amountPaymentForm = 0;
  methodPaymentForm = null;
  originalTermsAffected = [];

  constructor(
    private admissionEntrypointServ: AdmissionEntrypointService,
    private paymentService: TermPaymentService,
    private parseUTCToLocal: ParseUtcToLocalPipe,
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private router: ActivatedRoute,
    private utilService: UtilityService,
    private fileUploadService: FileUploadService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.initTransferForm();
    this.populateBilling();
    this.getSelectPaymentMethodAvailable();
    this.sinkPaymentAmountChanges();
    this.sinkPaymentMethodChanges();
    this.getLegalEntityByCandidate();
    if (this.paymentAmount.value) {
      this.getTableTerms(this.billingId, this.paymentAmount.value, 'sepa');
    } else {
      this.getTableTerms(this.billingId, 0, 'sepa');
    }

    if (this.router.snapshot.queryParamMap.get('redirectResult')) {
      const threeDSResult = this.router.snapshot.queryParamMap.get('redirectResult');
      const is3Ds2 = false;
      this.isWaitingForResponse = true;
      this.callApiSendPaymentDetailAdyen(this.candidateId, threeDSResult, is3Ds2);
    }

    this.paymentAmount.valueChanges.pipe(debounceTime(400)).subscribe((res) => {
      this.amountPaymentForm = res;
      this.getTableTerms(this.billingId, res, 'sepa');
    });
    this.selectedPaymentMethod.valueChanges.pipe(debounceTime(400)).subscribe((res) => {
      this.methodPaymentForm = res;
      if (res === 'transfer' && this.candidateData) {
        this.transfer?.get('wording_used_in_payment')?.patchValue(`${this.candidateData?.candidate_unique_number} - ${this.candidateData?.last_name?.toUpperCase()} ${this.candidateData?.first_name}`)
      }
      this.getTableTerms(this.billingId, this.amountPaymentForm, res);
    });
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  getTableTerms(billing_id, amount: any = 0, methodPayment?) {
    this.isLoading = true;
    const is_from_asking_payment_sepa = methodPayment === 'sepa' ? true : false;
    this.subs.sink = this.admissionEntrypointServ
      .getAffectedTermsBillingForAskingPayment(amount, billing_id, methodPayment, is_from_asking_payment_sepa)
      .subscribe(
        (resp) => {
          this.isLoading = false;
          if (resp && resp.length) {
            this.originalTermsAffected = _.cloneDeep(resp);
            this.termsList = this.mappingDataTerms(resp);
            this.termsList = this.termsList.sort((termA, termB) => {              
              let resultA:any = new Date(moment(termA?.term_payment?.date, 'DD/MM/YYYY').format('MM/DD/YYYY'));
              let resultB:any = new Date(moment(termB?.term_payment?.date, 'DD/MM/YYYY').format('MM/DD/YYYY'));              
              return resultA - resultB;
            })
            console.log('_termlist', this.termsList);
          } else {
            this.termsList = [];
          }
        },
        (err) => {
          this.isLoading = false;
          if (err['message'] === 'GraphQL error: amount cannot exceed more than DP') {
            Swal.fire({
              type: 'info',
              text: this.translate.instant('Down payment overpay'),
              confirmButtonText: this.translate.instant('SendForm_S2.Button'),
            }).then(() => {
              this.paymentAmount.patchValue(0);
            });
          }
        },
      );
  }

  translateDates(date) {
    return moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
  }

  mappingDataTerms(data) {
    let result;
    result = data.map((res) => {
      return {
        _id: res?._id,
        term_index: res?.term_index,
        is_term_pending: res?.is_term_pending,
        payment_type: res?.payment_type,
        real_amount: this.billing?.deposit,
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
        remaining_amount:
          res?.status === 'partially_paid' ? this.billing?.deposit - this.billing?.deposit_pay_amount : this.billing?.deposit,
        amount: res?.status === 'partially_paid' ? res?.amount - res?.pay_amount : res?.amount,
      };
    });
    return result;
  }

  getColorTerms(data) {
    if (data?.payment_type === 'term' || data?.payment_type === 'DP') {
      if (data?.status === 'billed' && !data?.is_term_pending) {
        return 'term-body bg-blue';
      } else if (data?.status === 'partially_paid') {
        return 'term-body bg-yellow';
      } else if ((data?.status === 'paid' && (!data?.term_amount_chargeback || data?.term_amount_chargeback && data?.pay_amount || data?.term_amount_chargeback && data?.term_amount > data?.term_amount_chargeback)) ) {
        return 'term-body bg-green';
      } else if (data?.status === 'pending' || data?.is_term_pending) {
        return 'term-body bg-orange';
      } else if (data?.status === 'not_authorised') {
        return 'term-body bg-red';
      } else if (data?.status === 'chargeback' || data?.term_amount_chargeback) {
        return 'term-body bg-purple';
      } else {
        return 'term-body';
      }
    }
  }

  getColorTermsDP(data) {
    if (data?.payment_type === 'term' || data?.payment_type === 'DP') {
      if (
        data?.status === 'billed' &&
        !data?.is_term_pending &&
        this.student?.payment !== 'pending' &&
        this.student?.payment !== 'sepa_pending'
      ) {
        return 'term-body bg-blue';
      } else if (data?.status === 'partially_paid') {
        return 'term-body bg-yellow';
      } else if (data?.status === 'paid') {
        return 'term-body bg-green';
      } else if (
        data?.status === 'pending' ||
        data?.is_term_pending ||
        this.student?.payment === 'pending' ||
        this.student?.payment === 'sepa_pending'
      ) {
        return 'term-body bg-orange';
      } else if (data?.status === 'not_authorised') {
        return 'term-body bg-red';
      } else if (data?.status === 'chargeback') {
        return 'term-body bg-purple';
      } else {
        return 'term-body';
      }
    }
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  initTransferForm() {
    this.transfer = this.fb.group({
      wording_used_in_payment: [null, [Validators.required]],
      first_name_of_payer: [null, [Validators.required]],
      familiy_name_of_payer: [null, [Validators.required]],
      s3_document_name: [null, [Validators.required]],
    });
  }

  onValidateTransfer() {
    this.transfer.markAllAsTouched();
    if (!this.transfer.valid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        text: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
    }
  }

  getSelectPaymentMethodAvailable() {
    this.subs.sink = this.paymentService.getSelectPaymentMethodAvailable(this.candidateId).subscribe((res) => {
      if (res) {
        // ************************ We disable this code because request from UAT 488 about fix payment method
        // if (res && res.registration_profile && res.registration_profile.select_payment_method_available) {
        //   this.paymentMethod = res.registration_profile.select_payment_method_available;
        // }
        this.candidateData = res;
      }
    });
  }

  getLegalEntityByCandidate() {
    this.subs.sink = this.paymentService.GetLegalEntityByCandidateForTermPayment(this.candidateId).subscribe((res) => {
      if (res) {
        this.legalEntityData = res;
      }
    });
  }

  initAdyenDropIn() {
    if (this.paymentAmount.invalid) {
      this.isPreparingAdyen = false;
      this.paymentAmount.markAllAsTouched();
    } else {
      this.isPreparingAdyen = true;
      const paymentValue = parseInt((this.paymentAmount.value * 100).toFixed());
      const filter = {
        value: paymentValue,
        currency: 'EUR',
        country_code: 'FR',
        shopper_locale: this.translate.currentLang,
      };
      this.subs.sink = this.admissionEntrypointServ.getPaymentMethodAdyen(filter).subscribe(
        (res) => {
          const methodAliases = {
            sepa: 'sepadirectdebit',
            credit_card: 'scheme',
          };
          const method = methodAliases[this.selectedPaymentMethod.value];
          const config = {
            paymentMethodsResponse: {
              paymentMethods: res.filter((paymentMethod) => paymentMethod && paymentMethod.type && paymentMethod.type === method),
            },
            clientKey: environment.ADYEN_API_KEY,
            locale: this.translate.currentLang,
            environment: environment.apiUrl.includes('api.erp-edh.com') ? 'live' : 'test',
            showPayButton: true,
            setStatusAutomatically: false,
            amount: {
              value: parseInt((this.paymentAmount.value * 100).toFixed()),
              currency: 'EUR',
            },
            onSubmit: (state: any, dropin: any) => {
              this.isLoading = true;
              this.cdr.detectChanges();
              if (!this.paymentAmount.value) {
                Swal.fire({
                  type: 'warning',
                  title: this.translate.instant('SWAL_PAYDP_ZERO.TITLE'),
                  text: this.translate.instant('SWAL_PAYDP_ZERO.TEXT'),
                  confirmButtonText: this.translate.instant('SWAL_PAYDP_ZERO.BUTTON'),
                  allowOutsideClick: false,
                }).then(() => {
                  this.isWaitingForResponse = false;
                  this.isLoading = false;
                });
              } else {
                this.createPayload(state.data.paymentMethod.type, state, dropin);
              }
            },
            onAdditionalDetails: (state: any, dropin: any) => {
              this.sendPaymentDetailAdyen(state, dropin);
            },
            onError: (error, component) => {
              console.error(error, component);
            },
          };
          this.checkout = new AdyenCheckout(cloneDeep(config));
          this.checkout
            .create('dropin', {
              paymentMethodsConfiguration: {
                card: {
                  hasHolderName: true,
                  holderNameRequired: true,
                  enableStoreDetails: true,
                  billingAddressRequired: true,
                },
                threeDS2: {
                  challengeWindowSize: '05',
                },
              },
            })
            .mount(this.adyenDropInWrapperRef.nativeElement);
          this.isPreparingAdyen = false;
        },
        (err) => {
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

  populateBilling() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.paymentService.getCandidateBill(this.billingId).subscribe(
      (res) => {
        if (res) {
          this.formId = res.current_form_unique_string ? res.current_form_unique_string : 'none';
          if (this.formIdParam && this.formId && this.formIdParam !== this.formId) {
            this.processFinish = true;
          }
          if (typeof res.amount_paid === 'string') {
            res.amount_paid = parseFloat(res.amount_paid);
          }
          if (res.terms && res.terms[0]) {
            res.terms.map((term: any, idx: number) => {
              term.term = idx + 1;
              if (term.term_payment && term.term_payment.date && term.term_payment.time) {
                if (term?.term_payment_deferment?.date) {
                  const { date, time } = term?.term_payment_deferment;
                  term.term_payment_datetime_str = this.parseUTCToLocal.transformDate(date, time);
                } else {
                  const { date, time } = term.term_payment;
                  term.term_payment_datetime_str = this.parseUTCToLocal.transformDate(date, time);
                }
              } else {
                term.term_payment_datetime_str = null;
              }
            });
          }
          this.billing = cloneDeep(res);
          this.billing.metadata = {
            deposit_paid: this.billing.deposit_pay_amount,
            is_already_paid: this.billing.deposit_pay_amount === this.billing.deposit,
            is_partial_dp: this.billing.deposit_pay_amount < this.billing.deposit,
            original_deposit_status: cloneDeep(this.billing.deposit_status),
          };
          this.billing.filtered_terms = this.billing.terms
            .filter((term: any) => term.term_amount !== 0)
            .map((term: any) => {
              return {
                is_term_paid: term.is_term_paid,
                term: term.term,
                term_amount: term.term_amount,
                term_amount_not_authorised: term.term_amount_not_authorised,
                term_amount_chargeback: term.term_amount_chargeback,
                term_amount_pending: term.term_amount_pending,
                term_pay_amount: parseFloat((term.term_pay_amount + term.term_amount_pending).toFixed(2)),
                term_pay_date: term.term_pay_date,
                term_payment_datetime_str: term.term_payment_datetime_str,
                term_payment: term.term_payment,
                term_payment_deferment: term.term_payment_deferment,
                _id: term._id,
                amount_input: term.term_amount,
                term_status: term.term_status,
              };
            });
          this.recalculateAmount();
        }
        this.countMaxAmount();
        // this.paymentAmount.setValidators([Validators.max(this.billing.total_amount)]);
        this.isWaitingForResponse = false;

        console.log('_billing', this.billing);
      },
      (err) => {
        console.error('Something wrong when fetching student bill: ', err);
        this.isWaitingForResponse = false;
      },
    );
  }

  calculateMaxAmount(billing) {
    const filteredStatuses = ['billed', 'not_billed', 'partially_paid'];
    const termDatas = billing?.filtered_terms;
    let unpaidTermData;
    if (filteredStatuses.includes(billing?.deposit_status)) {
      this.maxAmount = billing?.deposit;
    } else if (termDatas?.length) {
      unpaidTermData = termDatas.find((term) => filteredStatuses.includes(term?.term_status));
      if (unpaidTermData?.term_status === 'billed') {
        this.maxAmount =
          unpaidTermData?.term_amount === unpaidTermData?.term_amount_pending
            ? unpaidTermData?.term_amount
            : unpaidTermData?.term_amount - unpaidTermData?.term_pay_amount;
      } else if (unpaidTermData?.term_status === 'not_billed' || unpaidTermData?.term_status === 'partially_paid') {
        this.maxAmount = unpaidTermData?.term_amount - unpaidTermData?.term_pay_amount;
      }
    }
  }

  sinkPaymentAmountChanges() {
    this.subs.sink = this.paymentAmount.valueChanges.subscribe((value: string) => {
      this.recalculateAmount();
      if (this.selectedPaymentMethod.value) {
        this.selectedPaymentMethod.setValue(null, { emitEvent: false });
      }
      if (this.checkout && this.checkout.components && this.checkout.components.length > 0) {
        for (const component of this.checkout.components) {
          component.unmount();
        }
      }
    });
  }

  sinkPaymentMethodChanges() {
    this.subs.sink = this.selectedPaymentMethod.valueChanges.subscribe((value: string) => {
      if (!this.paymentAmount.value) {
        return Swal.fire({
          type: 'warning',
          title: this.translate.instant('Invalid_Form_Warning.TITLE'),
          text: this.translate.instant('Invalid_Form_Warning.TEXT'),
          confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
          onClose: () => {
            this.paymentAmount.markAsTouched();
            this.selectedPaymentMethod.setValue(null, { emitEvent: false });
          },
        });
      }
      if (this.checkout && this.checkout.components && this.checkout.components.length > 0) {
        for (const component of this.checkout.components) {
          component.unmount();
        }
      }
      if (this.adyenPaymentMethods.includes(value)) {
        this.initAdyenDropIn();
      }
      this.transfer.reset();
    });
  }

  recalculateAmount() {
    const amount = Math.abs(this.paymentAmount.value ? this.paymentAmount.value : 0);
    if (this.paymentAmount.value < 0) {
      this.paymentAmount.setValue(amount);
    }

    let tempTerm = cloneDeep(this.billing.terms);
    const dataDeposit = cloneDeep(this.billing.deposit);
    let depositPaid = 0;
    let isPartialDone;

    // Reset paid deposit value and check if partial already paid fully
    if (this.billing.metadata.is_partial_dp) {
      this.billing['depositPaid'] = this.billing.deposit_pay_amount;
      isPartialDone = amount + this.billing.deposit_pay_amount > dataDeposit ? true : false;
    }

    if (amount > dataDeposit || this.billing.metadata.is_already_paid || isPartialDone) {
      depositPaid = dataDeposit;
      this.billing['depositPaid'] = depositPaid;
      tempTerm = tempTerm.map((list) => {
        return {
          is_term_paid: list.term_pay_amount !== list.term_amount ? false : list.is_term_paid,
          term: list.term,
          term_amount: list.term_amount,
          term_amount_pending: list.term_amount_pending,
          term_pay_amount: list.term_pay_amount + list.term_amount_pending,
          term_pay_date: list.term_pay_date,
          term_amount_chargeback: list.term_amount_chargeback,
          term_payment_datetime_str: list.term_payment_datetime_str,
          term_payment: list.term_payment,
          term_payment_deferment: list.term_payment_deferment,
          _id: list._id,
          amount_input: list.term_pay_amount,
          term_status: list.term_status,
        };
      });
      let totalAmount;
      if (this.billing.metadata.is_already_paid) {
        totalAmount = amount;
        this.billing.deposit_status = 'paid';
      } else if (isPartialDone) {
        totalAmount = amount + this.billing.deposit_pay_amount - dataDeposit;
        this.billing.deposit_status = 'partially_paid';
      } else {
        totalAmount = amount - dataDeposit;
      }

      if (tempTerm && tempTerm.length) {
        for (const temp of tempTerm) {
          if (temp.is_term_paid) {
            continue;
          } else if (!temp.is_term_paid && totalAmount && temp.term_status !== 'not_billed') {
            if (temp.term_amount <= parseFloat((temp.term_pay_amount + totalAmount).toFixed(2))) {
              console.log(temp.term_amount <= parseFloat((temp.term_pay_amount + totalAmount).toFixed(2)));
              temp.term_pay_amount = temp.term_amount;
              temp.is_term_paid = true;
              totalAmount -= parseFloat((temp.term_amount - temp.amount_input - temp.term_amount_pending).toFixed(2));
              // temp.term_status = 'paid';
              if (temp.term_amount_pending) {
                temp.term_status = 'pending';
              } else {
                temp.term_status = 'paid';
              }
            } else if (temp.term_amount >= parseFloat((temp.term_pay_amount + totalAmount).toFixed(2)) && temp.term_amount_chargeback) {
              temp.term_pay_amount = temp.term_amount;
              temp.is_term_paid = true;
              totalAmount -= parseFloat((temp.term_amount - temp.amount_input - temp.term_amount_pending).toFixed(2));
              if (temp.term_amount_pending) {
                temp.term_status = 'pending';
              } else {
                temp.term_status = 'paid';
              }
            } else {
              temp.term_pay_amount = parseFloat((temp.term_pay_amount + totalAmount).toFixed(2));
              totalAmount = 0;
              temp.term_status = 'partially_paid';
              break;
            }
          } else if (!temp.is_term_paid && totalAmount && temp.term_status === 'not_billed') {
            this.hasNotBilledTerm = true;
            if (this.billing?.student_type?.type_of_information !== 'classic') {
              if (temp.term_amount <= parseFloat((temp.term_pay_amount + totalAmount).toFixed(2))) {
                console.log(temp.term_amount <= parseFloat((temp.term_pay_amount + totalAmount).toFixed(2)));
                temp.term_pay_amount = temp.term_amount;
                temp.is_term_paid = true;
                totalAmount -= parseFloat((temp.term_amount - temp.amount_input - temp.term_amount_pending).toFixed(2));
                if (temp.term_amount_pending) {
                  temp.term_status = 'pending';
                } else {
                  temp.term_status = 'paid';
                }
              } else {
                temp.term_pay_amount = parseFloat((temp.term_pay_amount + totalAmount).toFixed(2));
                totalAmount = 0;
                temp.term_status = 'partially_paid';
                break;
              }
            }
          } else {
            this.hasNotBilledTerm = false;
            break;
          }
        }
      }

      this.billing.filtered_terms.forEach((element, indexBill) => {
        tempTerm.forEach((terms, indexTerms) => {
          if (element.term === terms.term) {
            this.billing.filtered_terms[indexBill] = tempTerm[indexTerms];
          }
        });
      });

      if (amount === 0) {
        this.billing.deposit_status = this.billing.metadata.original_deposit_status;
      } else if (dataDeposit > amount + this.billing.deposit_pay_amount) {
        this.billing.deposit_status = 'partially_paid';
      } else if (dataDeposit <= amount + this.billing.deposit_pay_amount) {
        this.billing.deposit_status = 'paid';
      }
    } else {
      depositPaid = amount;
      if (this.billing.metadata.is_partial_dp) {
        this.billing['depositPaid'] = this.billing.depositPaid + depositPaid;
      } else {
        this.billing['depositPaid'] = depositPaid;
      }
      tempTerm = cloneDeep(this.billing.terms);
      this.billing.filtered_terms.forEach((element, indexBill) => {
        tempTerm.forEach((terms, indexTerms) => {
          if (element.term === terms.term) {
            this.billing.filtered_terms[indexBill] = tempTerm[indexTerms];
          }
        });
      });

      if (amount === 0) {
        this.billing.deposit_status = this.billing.metadata.original_deposit_status;
      } else if (dataDeposit > amount + this.billing.deposit_pay_amount) {
        this.billing.deposit_status = 'partially_paid';
      } else if (dataDeposit <= amount + this.billing.deposit_pay_amount) {
        this.billing.deposit_status = 'paid';
      }
    }

    console.log('filtered term', this.billing.filtered_terms);
  }

  createPayload(type: 'scheme' | 'sepadirectdebit', state, dropin) {
    const FORMAT_AMOUNT = 100;
    if (type === 'sepadirectdebit') {
      const payload = {
        reference: 'Test',
        amount: {
          currency: 'EUR',
          value: this.paymentAmount.value ? parseInt((this.paymentAmount.value * FORMAT_AMOUNT).toFixed()) : 0,
        },
        payment_menthod: {
          type: state.data.paymentMethod.type,
          sepa_owner_name: state.data.paymentMethod.ownerName,
          sepa_iban_number: state.data.paymentMethod.iban,
        },
        candidate_id: this.candidateId,
      };
      const billing_input = this.generatePayloadBilling(this.termsList);
      const affected_terms = this.generateAffectedTerms(this.originalTermsAffected);

      this.subs.sink = this.paymentService.CreatePaymentAdyen(payload, this.billingId, true, affected_terms, billing_input, this.student?.user_id?._id).subscribe(
        (res) => {
          this.isLoading = false;
          console.log('_success payment', res);
          this.isWaitingForResponse = true;
          if (res && res.result_code === 'Authorised') {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.processFinish = true;
              this.isWaitingForResponse = false;
              this.cdr.detectChanges();
            });
          } else if (res && res.result_code === 'Refused') {
            this.isWaitingForResponse = false;
            this.isLoading = false;
            this.swalError(res);
            dropin.unmount();

            let refreshPage = true;
            if (this.router.snapshot.queryParamMap.get('redirectResult')) {
              refreshPage = false;
            } else {
              refreshPage = true;
            }

            if (refreshPage) {
              this.ngOnInit();
            }
          }
        },
        (err) => {
          this.swalErrorGraphQL(err);
          this.isLoading = false;
        },
      );
    } else if (type === 'scheme') {
      const payload = {
        reference: 'Test',
        amount: {
          currency: 'EUR',
          value: this.paymentAmount.value ? parseInt((this.paymentAmount.value * FORMAT_AMOUNT).toFixed()) : 0,
        },
        payment_menthod: {
          type: state.data.paymentMethod.type,
          encrypted_card_number: state.data.paymentMethod.encryptedCardNumber,
          encrypted_expiry_month: state.data.paymentMethod.encryptedExpiryMonth,
          encrypted_expiry_year: state.data.paymentMethod.encryptedExpiryYear,
          encrypted_security_code: state.data.paymentMethod.encryptedSecurityCode,
        },
        card3d_secure: {
          allow_3ds: true,
          channel: 'web',
          browser_info: {
            user_agent: state.data.browserInfo.userAgent,
            accept_header: state.data.browserInfo.acceptHeader,
            language: this.translate.currentLang.toUpperCase(),
            color_depth: state.data.browserInfo.colorDepth,
            time_zone_offset: state.data.browserInfo.timeZoneOffset,
            screen_height: state.data.browserInfo.screenHeight,
            screen_width: state.data.browserInfo.screenWidth,
            java_enabled: state.data.browserInfo.javaEnabled,
          },
          origin: window.location.href,
          return_url: window.location.href,
        },
        candidate_id: this.candidateId,
      };
      const billing_input = this.generatePayloadBilling(this.termsList);
      const affected_terms = this.generateAffectedTerms(this.originalTermsAffected);

      this.subs.sink = this.paymentService.CreatePaymentAdyen(payload, this.billingId, true, affected_terms, billing_input, this.student?.user_id?._id).subscribe(
        (res) => {
          this.isLoading = false;

          if (res && res.action && (res.action.type === 'threeDS2' || res.action.type === 'redirect')) {
            let action3DS;
            if (res.action.type === 'threeDS2') {
              const payload3DS2Render = {
                type: res.action.type,
                subtype: res.action.sub_type,
                paymentData: res.action.payment_data,
                paymentMethodType: res.action.payment_method_type,
                token: res.action.token,
              };
              action3DS = payload3DS2Render;
            } else if (res.action.type === 'redirect') {
              const payload3DS1Render = {
                type: res.action.type,
                paymentMethodType: res.action.payment_method_type,
                url: res.action.url,
                method: res.action.method,
                data: {
                  MD: res.action.data ? res.action.data.md : null,
                  PaReq: res.action.data ? res.action.data.pa_req : null,
                  TermUrl: res.action.data ? res.action.data.term_url : null,
                },
              };
              action3DS = payload3DS1Render;
            }
            dropin.handleAction(action3DS);
          } else if (res && res.result_code === 'Authorised') {
            this.isWaitingForResponse = true;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Payment Accepted'),
              text: this.translate.instant('Bravo !'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.processFinish = true;
              this.isWaitingForResponse = false;
              this.isLoading = false;
              this.cdr.detectChanges();
            });
          } else if (res && res.result_code === 'Refused') {
            this.isWaitingForResponse = false;
            this.isLoading = false;
            this.swalError(res);
            dropin.unmount();
            this.ngOnInit();
          }
        },
        (err) => {
          this.swalErrorGraphQL(err);
        },
      );
    } else {
      return null;
    }
  }

  getTermClass(status: string, rejected?, chargeback?: number, pending?, candidatePayment?) {
    if ((status === 'paid' && Number(chargeback) > 0) || (status === 'paid' && candidatePayment === 'chargeback')) {
      this.statusChargeback = 'bg-purple';
    }

    let billedBg;
    if (rejected) {
      billedBg = 'bg-red';
    } else if (chargeback) {
      billedBg = 'bg-purple';
    } else if (pending) {
      billedBg = 'bg-orange';
    }
    const classes = {
      paid: this.statusChargeback ? this.statusChargeback : 'bg-green',
      partially_paid: 'bg-orange',
      pending: 'bg-orange',
      billed: billedBg ? billedBg : 'bg-blue',
      not_billed: '',
      chargeback: 'bg-purple',
    };

    this.statusChargeback = null;
    if (!status || !Object.keys(classes).includes(status)) {
      return 'term-body';
    }

    return 'term-body ' + classes[status];
  }

  swalErrorGraphQL(err) {
    this.isLoading = false;
    if (err['message'] === 'GraphQL error: Currently your payment is being processed , please come back again later.') {
      Swal.fire({
        type: 'info',
        text: this.translate.instant('ONLINE_PAYMENT_ERR_S1.TEXT'),
        confirmButtonText: this.translate.instant('ONLINE_PAYMENT_ERR_S1.BUTTON 1'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        this.ngOnInit();
      });
    } else if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('LEGAL_S5.Title'),
        html: this.translate.instant('LEGAL_S5.Text'),
        confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
      }).then(() => this.ngOnInit());
    } else if (
      err['message'] === 'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
      err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('EUROPEAN_COUNTRIES.TITLE'),
        html: this.translate.instant('EUROPEAN_COUNTRIES.TEXT'),
        confirmButtonText: this.translate.instant('EUROPEAN_COUNTRIES.BUTTON'),
      }).then(() => this.ngOnInit());
    } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('IBAN_S1.Title'),
        text: this.translate.instant('IBAN_S1.Text'),
        confirmButtonText: this.translate.instant('IBAN_S1.Button'),
      }).then(() => this.ngOnInit());
    } else if (err && err['message'] && err['message'].includes('Could not find an acquirer account for the provided currency (EUR)')) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Online_Payment_S1.TITLE'),
        text: this.translate.instant('Online_Payment_S1.TEXT'),
        confirmButtonText: this.translate.instant('Online_Payment_S1.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        this.ngOnInit();
      });
    } else if (err && err['message'] && (err['message']?.includes(`Field 'additionalData.split.item1.amount' is not valid.`) || err['message']?.includes(`Amount cannot be less than 2EUR`))) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('TERM_UPDATE_S1.TITLE'),
        html: this.translate.instant('TERM_UPDATE_S1.TEXT'),
        confirmButtonText: this.translate.instant('TERM_UPDATE_S1.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        this.ngOnInit();
      });
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      }).then((res) => {
        this.ngOnInit();
      });
    }
  }

  swalError(err, fromRedirect?) {
    console.log('ini errornya', err);
    this.isLoading = false;
    this.selectedPaymentMethod.reset();
    this.paymentAmount.reset();
    this.cdr.detectChanges();
    if (err && err.refusal_reason_code) {
      const errCode = `<ul style="text-align: start; margin-left: 20px"> <li> ${err.refusal_reason_code} </li> </ul>`;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('PaymentFail_S1.TITLE'),
        html: this.translate.instant('PaymentFail_S1.TEXT', { errorCodes: errCode }),
        confirmButtonText: this.translate.instant('PaymentFail_S1.BUTTON'),
      }).then((result) => {
        if (fromRedirect) {
          // this.ngOnInit();
        }
      });
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: this.translate.instant('AdyenRefusalCode.' + err),
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      }).then((result) => {
        if (fromRedirect) {
          // this.ngOnInit();
        }
      });
    }
  }

  sendPaymentDetailAdyen(state, dropin) {
    const candidateId = this.candidateId;
    const threeDSResult = state.data.details.threeDSResult;
    const is3DS2 = true;
    this.subs.sink = this.paymentService.sendPaymentDetailAdyen(candidateId, threeDSResult, is3DS2, this.billingId, true).subscribe(
      (res) => {
        if (res && res.result_code === 'Authorised') {
          this.processFinish = true;
          this.isWaitingForResponse = false;
        } else if (res && res.result_code === 'Refused') {
          this.isWaitingForResponse = false;
          this.isLoading = false;
          this.swalError(res);
          dropin.unmount();

          let refreshPage = true;
          if (this.router.snapshot.queryParamMap.get('redirectResult')) {
            refreshPage = false;
          } else {
            refreshPage = true;
          }

          if (refreshPage) {
            this.ngOnInit();
          }
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  callApiSendPaymentDetailAdyen(candidateId, threeDSResult, is3DS2) {
    this.subs.sink = this.paymentService.sendPaymentDetailAdyen(candidateId, threeDSResult, is3DS2, this.billingId, true).subscribe(
      (res) => {
        if (res && res.result_code === 'Authorised') {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Payment Accepted'),
            text: this.translate.instant('Bravo !'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.processFinish = true;
            this.isWaitingForResponse = false;
          });
        } else if (res && res.result_code === 'Refused') {
          this.isWaitingForResponse = false;
          this.isLoading = false;
          const fromRedirect = true;
          this.swalError(res, fromRedirect);
          let refreshPage = true;
          if (this.router.snapshot.queryParamMap.get('redirectResult')) {
            refreshPage = false;
          } else {
            refreshPage = true;
          }

          if (refreshPage) {
            this.ngOnInit();
          }
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  openUploadWindow() {
    this.fileUploaderDoc.nativeElement.click();
  }

  submitTransferCheckForm() {
    this.transfer.markAllAsTouched();
    this.confirmationForm.markAllAsTouched();
    if (this.transfer.invalid || (this.selectedPaymentMethod?.value === 'transfer' && this.confirmationForm?.value === false)) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
    } else {
      this.isLoading = true;
      const payload = this.transfer.value;
      // console.log('NUGI', this.billingId, payload, this.selectedPaymentMethod.value, this.paymentAmount.value);
      const billing_input = this.generatePayloadBilling(this.termsList);
      const affected_terms = this.generateAffectedTerms(this.originalTermsAffected);
      this.subs.sink = this.paymentService
        .SaveProofOfPaymentTerm(
          this.billingId,
          payload,
          this.selectedPaymentMethod.value,
          this.paymentAmount.value,
          billing_input,
          affected_terms,
        )
        .subscribe(
          (res) => {
            if (res) {
              this.isLoading = false;
              this.isWaitingForResponse = false;
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.processFinish = true;
                this.isLoading = false;
                this.isWaitingForResponse = false;
              });
            } else {
              this.isLoading = false;
              this.isWaitingForResponse = false;
            }
          },
          (err) => {
            this.isLoading = false;
            this.isWaitingForResponse = false;
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

  chooseFile(fileInput) {
    const acceptable = ['jpg', 'pdf', 'jpeg', 'png'];
    const file = (<HTMLInputElement>fileInput.target).files[0];
    if (file) {
      this.isLoading = true;
      const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
      console.log(fileType);
      if (acceptable.includes(fileType)) {
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (resp) => {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              console.log('_resp upload', resp);
              this.isLoading = false;
              this.transfer.get('s3_document_name').patchValue(resp.s3_file_name);
              this.documenPDFName = resp.s3_file_name;
            });
          },
          (err) => {
            this.isLoading = false;
            console.log('[Response BE][Error] : ', err);
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: 'OK',
            });
          },
        );
      } else {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Finance_S3.TITLE'),
          text: this.translate.instant('Finance_S3.TEXT', { file_exts: '.pdf, .jpg, .jpeg, .png' }),
          confirmButtonText: this.translate.instant('Finance_S3.BUTTON'),
        });
        this.isWaitingForResponse = false;
        this.isLoading = false;
      }
    }
  }

  downloadFile() {
    const link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = `${environment.apiUrl}/fileuploads/${this.documenPDFName}`.replace('/graphql', '');
    link.target = '_blank';
    link.click();
    link.remove();
  }

  removeFile() {
    this.fileUploaderDoc.nativeElement.value = null;
    this.transfer.get('s3_document_name').setValue('');
    this.documenPDFName = '';
  }

  countMaxAmount() {
    let allTermAmount = 0;
    let allTermPayAmount = 0;
    let allTermAmountPending = 0;
    let allTermAmountChargeback = 0;
    if (this.billing.terms.length) {
      this.billing.terms.forEach((data) => {
        allTermAmount = allTermAmount + data.term_amount;
        allTermPayAmount = allTermPayAmount + data.term_pay_amount;
        allTermAmountPending = allTermAmountPending + data.term_amount_pending;
        allTermAmountChargeback = allTermAmountChargeback + data.term_amount_chargeback;
      });
      this.max_amount = Number((allTermAmount - (allTermPayAmount + allTermAmountPending)).toFixed(2));
      console.log('countMaxAmount', this.max_amount, this.billing.terms);
      this.paymentAmount.setValidators([Validators.max(this.max_amount)]);
    }
  }

  decimalFilter(event: any) {
    const reg = /^-?\d*[.,]?\d{0,2}$/;
    const input = event.target.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
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
            term_status: element?.status,
            is_partial: element?.status === 'partially_paid' ? true : false,
            is_term_paid: element?.status === 'paid' ? true : false,
            term_amount_chargeback: element?.term_amount_chargeback,
            term_amount_not_authorised: element?.term_amount_not_authorised,
            term_amount_pending: element?.term_amount_pending,
            term_pay_amount:
              element?.status === 'paid'
                ? element?.real_term_amount
                : this.methodPaymentForm === 'sepa'
                ? element?.term_pay_amount + element?.pay_amount
                : element?.term_pay_amount,
            term_pay_date: element?.term_pay_date,
            term_payment: element?.term_payment,
            term_payment_deferment: element?.term_payment_deferment,
            _id: element?._id,
          };
          terms.push(dataTerm);
        } else {
          billing = {
            deposit: element?.real_amount,
            deposit_pay_amount: element?.status === 'paid' ? element?.real_amount : element?.pay_amount + this.billing?.deposit_pay_amount,
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

  submitForTransfer() {
    this.isLoading = true;
    this.subs.sink = this.admissionEntrypointServ
      .getAffectedTermsBillingForAskingPayment(this.paymentAmount.value, this.billingId, 'transfer')
      .subscribe(
        (resp) => {
          this.isLoading = false;
          if (resp && resp.length) {
            this.originalTermsAffected = _.cloneDeep(resp);
            this.termsList = this.mappingDataTerms(resp);
            this.submitTransferCheckForm();
          } else {
            this.termsList = [];
          }
        },
        (err) => {
          this.isLoading = false;
          if (err['message'] === 'GraphQL error: amount cannot exceed more than DP') {
            Swal.fire({
              type: 'info',
              text: this.translate.instant('Down payment overpay'),
              confirmButtonText: this.translate.instant('SendForm_S2.Button'),
            }).then(() => {
              this.paymentAmount.patchValue(0);
            });
          }
        },
      );
  }
}
