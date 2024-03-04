import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  OnChanges,
  ViewChild,
  ElementRef,
  Output,
  ChangeDetectorRef,
  AfterViewChecked,
} from '@angular/core';
declare var AdyenCheckout: any;
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AdmissionService } from 'app/service/admission/admission.service';
import { ApplicationUrls } from 'app/shared/settings';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { environment } from 'environments/environment';
// import AdyenCheckout from '@adyen/adyen-web';
import { RegistrationDialogComponent } from 'app/candidates/registration-dialog/registration-dialog.component';
import { EventEmitter } from '@angular/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { FormFillCampusValidationComponent } from 'app/form-filling/form-fill-campus-validation/form-fill-campus-validation.component';
import { FormFillingService } from 'app/form-filling/form-filling.service';

@Component({
  selector: 'ms-down-payment-form',
  templateUrl: './down-payment-form.component.html',
  styleUrls: ['./down-payment-form.component.scss'],
})
export class DownPaymentFormComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  @ViewChild('adyenDropin', { static: true }) adyenDropin: ElementRef;
  @ViewChild('triggerPopupValidatioon', { static: false }) triggerPopupValidatioon: ElementRef;
  @ViewChild('triggerTrue', { static: false }) triggerTrue: ElementRef;
  @ViewChild('triggerFalse', { static: false }) triggerFalse: ElementRef;
  @Input() candidateId = '';
  @Input() selectedIndex = 0;
  @Output() moveToTab = new EventEmitter<string>();
  candidateData: any;
  type = 'card';
  private subs = new SubSink();
  isWaitingForResponse = false;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  paymentImg = '../../../../../assets/img/payment.png';
  ribs = this.serverimgPath + 'rib.pdf';
  transferPayment = '../../../../../assets/img/transfer-payment.png';
  successPayment = '../../../../../assets/img/payment-success.png';
  sepaLogo = '../../../../../assets/img/sepa-wt-logo.png';

  documenPDFName: any = '';
  hasUploadPDF: any = true;
  hasDoneTransferCheckForm = false;

  listCountry: any;
  countryFlter = new UntypedFormControl('FR');
  hasDeposit = false;
  currencySelected: any;
  selectedCountry: any;
  paymentFinalStep = false;
  paymentDone = false;
  profileRate: any;
  depositAmount: any;
  paymentForm: UntypedFormGroup;
  transferCheckForm: UntypedFormGroup;
  isSelectedMethod = false;
  showPayment = false;
  showTransferForm = false;
  processFinish = false;
  noDownPaymentSelected = false;
  isAdyenPayment = false;

  isVideoLink = false;
  validationStepList: any;
  private timeOutVal: any;

  checkout: any;

  // Stripe Keys
  legalEntitiesKeys;
  clientSecrets;

  // SEPA
  adyenPaymentMethods = ['credit_card', 'sepa'];
  otherPaymentMethods = ['transfer', 'check'];

  legalEntityData: any;

  legalRepresentativeId: any;
  isForLegalRepresentative = false;

  // Service
  constructor(
    private admisssionService: AdmissionEntrypointService,
    private admissionService: AdmissionService,
    private translate: TranslateService,
    private route: Router,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private candidateService: CandidatesService,
    private routerNav: Router,
    private utilService: UtilityService,
    private fileUploadService: FileUploadService,
    private formFillingService: FormFillingService,
  ) {}

  ngOnInit() {
    this.legalRepresentativeId = this.router.snapshot.queryParamMap.get('legal_representative');

    this.initPayment();
    this.initTransferCheckForm();
    this.getOneCandidate();
    this.getLegalEntityByCandidate();
    // *************** Check if user coming back from Adyen 3ds 1. They will pass queryParam redirectResult
    // We will need to directly call sendPaymentDetailAdyen and set payment as finished.
    if (this.router.snapshot.queryParamMap.get('redirectResult')) {
      const threeDSResult = this.router.snapshot.queryParamMap.get('redirectResult');
      const is3Ds2 = false;
      this.callApiSendPaymentDetailAdyen(this.candidateId, threeDSResult, is3Ds2);
    }
  }

  ngOnChanges() {
    if (this.selectedIndex === 5) {
      console.log('Current Step ', this.selectedIndex);
      this.getOneCandidate();
      this.getLegalEntityByCandidate();
    }
  }

  initPayment() {
    this.paymentForm = this.fb.group({
      relation: [''],
      relation_bank: [false],
      already_started: [false],
      payment_method: [''],
    });
  }

  initTransferCheckForm() {
    this.transferCheckForm = this.fb.group({
      wording_used_in_payment: [''],
      first_name_of_payer: [''],
      familiy_name_of_payer: [''],
      s3_document_name: [''],
    });
  }

  getOneCandidate() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.getCandidateDownPayment(this.candidateId).subscribe(
      (resp) => {
        // if (resp) {
        //   resp.payment = 'sepa_pending';
        // }
        this.isWaitingForResponse = false;
        this.candidateData = resp;
        console.log(this.candidateData);
        this.paymentForm.patchValue(resp);

        if (
          resp.personal_information === 'legal_representative' && 
          (this.legalRepresentativeId !== resp.legal_representative.unique_id) && 
          this.selectedIndex === 5
        ) {
          this.isForLegalRepresentative = true;
          this.showSwalLegalRepresentativeS1();
        }

        if (resp && resp.payment_transfer_check_data) {
          this.transferCheckForm.patchValue(resp.payment_transfer_check_data);
          this.documenPDFName = this.transferCheckForm.get('s3_document_name').value;
        }
        this.getDownPaymentCandidate();
        if (
          this.candidateData.registration_profile &&
          this.candidateData.registration_profile.is_down_payment &&
          this.candidateData.registration_profile.is_down_payment === 'no' &&
          this.candidateData.personal_information === 'done' &&
          this.candidateData.is_admitted &&
          this.candidateData.signature === 'done' &&
          this.candidateData.program_confirmed === 'done'
        ) {
          // this.noDownPaymentSelected = true;
          this.processFinish = true;
          this.admissionService.setStatusStepFive(true);
        } else if (
          this.candidateData.registration_profile &&
          this.candidateData.registration_profile.is_down_payment &&
          this.candidateData.registration_profile.is_down_payment === 'other'
        ) {
          const dp = this.candidateData.registration_profile.other_amount ? this.candidateData.registration_profile.other_amount : 0;
          this.depositAmount = dp;
        } else if (
          this.candidateData.registration_profile &&
          this.candidateData.registration_profile.is_down_payment &&
          this.candidateData.registration_profile.is_down_payment === 'dp_additional_cost'
        ) {
          const dp = this.candidateData.registration_profile.dp_additional_cost_amount
            ? this.candidateData.registration_profile.dp_additional_cost_amount
            : 0;
          this.depositAmount = dp;
        }
        if (this.candidateData.billing_id.deposit && this.candidateData.billing_id.deposit_pay_amount !== 0) {
          const dp = this.candidateData.billing_id.deposit - this.candidateData.billing_id.deposit_pay_amount;
          this.depositAmount = dp;
        }
        if (this.candidateData.payment_method) {
          this.isSelectedMethod = true;
        }
        if (
          (this.candidateData.payment === 'done' || this.candidateData.payment === 'sepa_pending') &&
          this.candidateData.payment_method &&
          this.candidateData.payment_method !== 'not_done'
        ) {
          this.processFinish = true;
        }
        // Condition to display adyen config when init if its adyen payment method(credit_card and sepa)
        if (
          this.adyenPaymentMethods.includes(this.candidateData.payment_method) &&
          !this.router.snapshot.queryParamMap.get('redirectResult')
        ) {
          console.log('masuk ke trigger on init', this.candidateData);
          this.showPayment = true;
          this.fetchStripeKeys();
        }
        if (
          this.otherPaymentMethods.includes(this.candidateData.payment_method) &&
          !this.router.snapshot.queryParamMap.get('redirectResult')
        ) {
          this.showTransferForm = true;
          this.setValidatorTransfer('add');
        }
        // if (this.candidateData.payment_method === 'credit_card') {
        //   // this.adyenConfig(this.selectedCountry, this.currencySelected);
        // }
        if (
          (this.candidateData.payment === 'pending' || this.candidateData.payment === 'done') &&
          this.candidateData.payment_method === 'cash'
        ) {
          this.processFinish = true;
        }
        if (
          this.candidateData.payment_method &&
          this.candidateData.payment &&
          this.candidateData.payment_transfer_check_data &&
          this.candidateData.payment_transfer_check_data.familiy_name_of_payer &&
          (this.candidateData.payment === 'pending' || this.candidateData.payment === 'done') &&
          (this.candidateData.payment_method === 'transfer' || this.candidateData.payment_method === 'check')
        ) {
          this.processFinish = true;
        }
        if (
          this.candidateData.billing_id &&
          this.candidateData.payment_method &&
          this.candidateData.billing_id.deposit &&
          this.candidateData.payment === 'not_done' &&
          (this.candidateData.candidate_admission_status === 'engaged' || this.candidateData.candidate_admission_status === 'registered') &&
          this.candidateData.billing_id.deposit_pay_amount &&
          this.candidateData.billing_id.deposit_pay_amount >= this.candidateData.billing_id.deposit
        ) {
          this.processFinish = true;
          this.admissionService.setStatusStepFive(true);
        } else if (
          this.candidateData.billing_id &&
          this.candidateData.payment_method &&
          this.candidateData.billing_id.deposit &&
          this.candidateData.payment === 'not_done' &&
          this.candidateData.billing_id.deposit_pay_amount &&
          this.candidateData.billing_id.deposit_pay_amount < this.candidateData.billing_id.deposit
        ) {
          this.processFinish = false;
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

  getLegalEntityByCandidate() {
    this.subs.sink = this.admissionService.GetLegalEntityByCandidateForDownPaymentStep(this.candidateId).subscribe((res) => {
      if (res) {
        this.legalEntityData = res;
      }
    });
  }

  submitTransferCheckForm() {
    this.transferCheckForm.markAllAsTouched();
    if (this.transferCheckForm.invalid || this.documenPDFName === '' || !this.documenPDFName || this.documenPDFName === null) {
      if (this.documenPDFName === null || this.documenPDFName === '' || !this.documenPDFName) {
        this.hasUploadPDF = false;
      } else {
        this.hasUploadPDF = true;
      }
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
    } else {
      this.isWaitingForResponse = true;
      const payload = _.cloneDeep(this.transferCheckForm.value);
      this.subs.sink = this.formFillingService.UpdateCandidateTransferCheckPayment(this.candidateData._id, payload).subscribe(
        (resp) => {
          if (resp) {
            this.hasDoneTransferCheckForm = true;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.isWaitingForResponse = false;
              this.confirmPayment();
            });
          } else {
            this.isWaitingForResponse = false;
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
  }

  validatedDeposit() {
    const method = this.paymentForm.get('payment_method').value;
    Swal.fire({
      title: this.translate.instant('CLASSIC_S1.TITLE'),
      html:
        this.translate.instant('CLASSIC_S1.TEXT', {
          method: method ? (method === 'credit_card' ? this.translate.instant('Credit card') : this.translate.instant(method)) : '',
          deposit: this.depositAmount,
        }) + '€',
      type: 'question',
      confirmButtonText: this.translate.instant('CLASSIC_S1.BUTTON1'),
      showCancelButton: true,
      cancelButtonText: this.translate.instant('CLASSIC_S1.BUTTON2'),
      allowOutsideClick: false,
    }).then((result) => {
      if (result.value) {
        if (this.adyenPaymentMethods.includes(this.paymentForm.get('payment_method').value)) {
          this.showPayment = true;
          this.setValidatorTransfer('remove');
          this.confirmPayment();
        }
        if (this.otherPaymentMethods.includes(this.paymentForm.get('payment_method').value)) {
          this.showTransferForm = true;
          this.setValidatorTransfer('add');
        }

        if (this.paymentForm.get('payment_method').value === 'cash') {
          this.confirmPayment();
        }
      }
    });
  }

  setValidatorTransfer(data) {
    if (data === 'remove') {
      this.transferCheckForm.controls['wording_used_in_payment'].clearValidators();
      this.transferCheckForm.controls['wording_used_in_payment'].updateValueAndValidity();
      this.transferCheckForm.controls['first_name_of_payer'].clearValidators();
      this.transferCheckForm.controls['first_name_of_payer'].updateValueAndValidity();
      this.transferCheckForm.controls['familiy_name_of_payer'].clearValidators();
      this.transferCheckForm.controls['familiy_name_of_payer'].updateValueAndValidity();
    } else if (data === 'add') {
      this.transferCheckForm.controls['wording_used_in_payment'].setValidators(Validators.required);
      this.transferCheckForm.controls['wording_used_in_payment'].updateValueAndValidity();
      this.transferCheckForm.controls['first_name_of_payer'].setValidators(Validators.required);
      this.transferCheckForm.controls['first_name_of_payer'].updateValueAndValidity();
      this.transferCheckForm.controls['familiy_name_of_payer'].setValidators(Validators.required);
      this.transferCheckForm.controls['familiy_name_of_payer'].updateValueAndValidity();
    }
  }

  radioChange(type, event) {
    // console.log('radioChange $event', event, this.hasDeposit);
    console.log('ke trigger gk?', _.cloneDeep(type), _.cloneDeep(this.paymentForm.get('payment_method').value));
    const oldValue = _.cloneDeep(this.paymentForm.get('payment_method').value);
    const payload = this.createPayload(_.cloneDeep(this.candidateData));
    delete payload.count_document;
    delete payload.user_id;
    delete payload?.candidate_unique_number;

    if (this.checkout && this.checkout.components && this.checkout.components.length) {
      this.checkout.components.forEach((adyenComp) => {
        // adyenComp.closeActivePaymentMethod();
        adyenComp.unmount();
      });
    }

    // Check first if there is already selected data or this is the first time user select
    if (this.paymentForm.get('payment_method').value) {
      // SWAL to handle change on radiochange
      let timeDisabled = 3;
      Swal.fire({
        type: 'question',
        html: this.translate.instant('ONLINE_PAYMENT_QUEST_S1.TEXT', {
          paymentA: this.translate.instant(this.paymentForm.get('payment_method').value),
          paymentB: this.translate.instant(type),
        }),
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('ONLINE_PAYMENT_QUEST_S1.BUTTON_1', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('ONLINE_PAYMENT_QUEST_S1.BUTTON_2'),
        allowOutsideClick: false,
        allowEnterKey: false,
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          const intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('ONLINE_PAYMENT_QUEST_S1.BUTTON_1') + ` (${timeDisabled})`;
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('ONLINE_PAYMENT_QUEST_S1.BUTTON_1');
            Swal.enableConfirmButton();
            clearInterval(intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      }).then((res) => {
        clearTimeout(this.timeOutVal);
        if (res.value) {
          this.paymentForm.get('payment_method').setValue(type);
          payload.payment_method = type;
          // when changing payment method to credit_card or sepa, we need to also update payment method and refresh
          if (this.adyenPaymentMethods.includes(this.paymentForm.get('payment_method').value)) {
            this.updatePaymentMethodAndSwitch();
          } else {
            const payloadData = {
              payment_method: this.paymentForm.get('payment_method').value,
            };
            this.subs.sink = this.admissionService.UpdateCandidate(this.candidateData._id, payloadData).subscribe(
              (resp) => {
                this.showPayment = false;
                this.showTransferForm = false;
                this.transferCheckForm.reset();
                this.documenPDFName = null;
              },
              (err) => {
                if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('LEGAL_S5.Title'),
                    text: this.translate.instant('LEGAL_S5.Text'),
                    confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
                  });
                } else if (
                  err['message'] ===
                    'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
                  err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')
                ) {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('EUROPEAN_COUNTRIES.TITLE'),
                    html: this.translate.instant('EUROPEAN_COUNTRIES.TEXT'),
                    confirmButtonText: this.translate.instant('EUROPEAN_COUNTRIES.BUTTON'),
                  });
                } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('IBAN_S1.Title'),
                    text: this.translate.instant('IBAN_S1.Text'),
                    confirmButtonText: this.translate.instant('IBAN_S1.Button'),
                  });
                }
              },
            );
          }
        } else {
          this.showPayment = false;
          this.showTransferForm = false;
          this.paymentForm.get('payment_method').setValue(oldValue);
          this.transferCheckForm.reset();
          this.documenPDFName = null;
        }

        console.log(this.paymentForm.get('payment_method').value);
      });
    } else {
      this.paymentForm.get('payment_method').setValue(type);
      payload.payment_method = type;
      // when changing payment method to credit_card or sepa, we need to also update payment method and refresh
      if (this.adyenPaymentMethods.includes(this.paymentForm.get('payment_method').value)) {
        this.updatePaymentMethodAndSwitch();
      } else {
        const payloadData = {
          payment_method: this.paymentForm.get('payment_method').value,
        };
        this.subs.sink = this.admissionService.UpdateCandidate(this.candidateData._id, payloadData).subscribe(
          (resp) => {
            this.showPayment = false;
            this.showTransferForm = false;
            this.transferCheckForm.reset();
            this.documenPDFName = null;
          },
          (err) => {
            if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('LEGAL_S5.Title'),
                text: this.translate.instant('LEGAL_S5.Text'),
                confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
              });
            } else if (
              err['message'] ===
                'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
              err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')
            ) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('EUROPEAN_COUNTRIES.TITLE'),
                html: this.translate.instant('EUROPEAN_COUNTRIES.TEXT'),
                confirmButtonText: this.translate.instant('EUROPEAN_COUNTRIES.BUTTON'),
              });
            } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('IBAN_S1.Title'),
                text: this.translate.instant('IBAN_S1.Text'),
                confirmButtonText: this.translate.instant('IBAN_S1.Button'),
              });
            }
          },
        );
      }
    }
  }

  countrySelected() {
    console.log(this.countryFlter.value);
    if (this.countryFlter.value) {
      const currencyCode = this.listCountry.filter((res) => res.country_code === this.countryFlter.value);
      console.log('_currcode', currencyCode);
      this.selectedCountry = this.countryFlter.value;
      this.currencySelected = currencyCode[0].currency_code;
    }
  }

  adyenConfig(selectedCountry?, currency_code?) {
    const environmentTest = environment.apiUrl.includes('api.erp-edh.com') ? 'live' : 'test';
    const filter = {
      country_code: selectedCountry ? selectedCountry : 'FR',
      shopper_locale: this.translate.currentLang,
      value: this.depositAmount ? this.depositAmount * 100 : 0,
      currency: currency_code ? currency_code : 'EUR',
    };
    this.subs.sink = this.admisssionService.getPaymentMethodAdyen(filter).subscribe(
      (res: any) => {
        // *************** FE Filter do display which card to display
        const selectedPaymentMethod = this.paymentForm.get('payment_method').value;
        console.log(selectedPaymentMethod);
        let paramFilter = '';
        switch (selectedPaymentMethod) {
          case 'credit_card':
            paramFilter = 'scheme';
            break;
          case 'sepa':
            paramFilter = 'sepadirectdebit';
            break;
          default:
            break;
        }

        console.log(paramFilter);
        const temp = _.cloneDeep(res);
        const filteredPaymentMethod = temp.filter((paymentMethod) => {
          return paymentMethod && paymentMethod.type === paramFilter;
        });
        console.log(filteredPaymentMethod);

        if (res) {
          /// remapping response
          const response = {
            paymentMethods: filteredPaymentMethod,
          };
          const configurationEN = {
            paymentMethodsResponse: response,
            clientKey: environment.ADYEN_API_KEY,
            locale: this.translate.currentLang,
            environment: environmentTest,
            showPayButton: true,
            setStatusAutomatically: false,
            amount: { value: this.depositAmount * 100, currency: currency_code ? currency_code : 'EUR' },
            onSubmit: (state: any, dropin: any) => {
              this.triggerTrue.nativeElement.click();
              if(!this.depositAmount && this.candidateData?.billing_id?.deposit){
                this.depositAmount = this.candidateData.billing_id.deposit
              }
              if (!this.depositAmount) {
                Swal.fire({
                  type: 'warning',
                  title: this.translate.instant('SWAL_PAYDP_ZERO.TITLE'),
                  text: this.translate.instant('SWAL_PAYDP_ZERO.TEXT'),
                  confirmButtonText: this.translate.instant('SWAL_PAYDP_ZERO.BUTTON'),
                  allowOutsideClick: false,
                }).then(() => {
                  this.isWaitingForResponse = false;
                });
              } else {
                if (state.isValid && state.data && state.data.paymentMethod.type === 'scheme') {
                  this.createPayloadPaymentAdyen(state, dropin, currency_code);
                } else if (state.isValid && state.data && state.data.paymentMethod.type === 'sepadirectdebit') {
                  this.createPayloadPaymentAdyenSepa(state, dropin, currency_code);
                } else {
                  this.swalPaymentNotSupported();
                }
              }
            },
            onAdditionalDetails: (state: any, dropin: any) => {
              this.sendPaymentDetailAdyen(state, dropin);
            },
          };
          this.checkout = new AdyenCheckout(_.cloneDeep(configurationEN));
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
            .mount(this.adyenDropin.nativeElement);
          // checkout.update();
          this.isAdyenPayment = true;
        }
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

  customeDeletePayload(payload) {
    const items = payload;
    delete items._id;
    delete items.count_document;
    delete items.user_id;
    delete items.billing_id;
    delete items.additional_address;
    delete items.address;
    delete items.admission_member_id;
    delete items.announcement_call;
    delete items.announcement_email;
    delete items.autorization_account;
    delete items.bic;
    delete items.campus;
    delete items.candidate_admission_status;
    delete items.city;
    delete items.city_of_birth;
    delete items.civility;
    delete items.connection;
    delete items.country;
    delete items.country_of_birth;
    delete items.date_of_birth;
    delete items.department;
    delete items.email;
    delete items.engagement_level;
    delete items.finance;
    delete items.first_name;
    delete items.first_name_used;
    delete items.fixed_phone;
    delete items.iban;
    delete items.intake_channel;
    delete items.is_whatsapp;
    delete items.last_name;
    delete items.last_name_used;
    delete items.level;
    delete items.nationality;
    delete items.nationality_second;
    delete items.participate_in_job_meeting;
    delete items.participate_in_open_house_day;
    delete items.payment_splits;
    delete items.payment_supports;
    delete items.photo;
    delete items.post_code;
    delete items.post_code_of_birth;
    delete items.program_confirmed;
    delete items.program_desired;
    delete items.region;
    delete items.registration_profile;
    delete items.registration_profile_type;
    delete items.scholar_season;
    delete items.school;
    delete items.school_contract_pdf_link;
    delete items.sector;
    delete items.speciality;
    delete items.telephone;
    delete items.trial_date;
    delete items.signature;
    delete items.personal_information;
    delete items.is_admitted;
    delete items.method_of_payment;
    delete items.payment_transfer_check_data;
    return items;
  }

  confirmPayment() {
    this.isWaitingForResponse = true;
    let payload = this.createPayload(_.cloneDeep(this.candidateData));
    payload = this.customeDeletePayload(_.cloneDeep(payload));
    if (!this.adyenPaymentMethods.includes(this.paymentForm.get('payment_method').value)) {
      payload.payment = 'pending';
    }
    // payload.engagement_level = 'registered';
    payload.payment_method = this.paymentForm.get('payment_method').value;

    if (payload.selected_payment_plan) {
      delete payload.selected_payment_plan;
    }

    console.log('_pay', payload);
    delete payload?.candidate_unique_number;
    if (this.candidateData && this.candidateData.admission_member_id && this.candidateData.admission_member_id._id) {
      this.subs.sink = this.admissionService.UpdateCandidate(this.candidateData._id, payload).subscribe(
        (resp) => {
          console.log('Candidate Updated!', resp);
          this.isWaitingForResponse = false;
          this.paymentDone = true;

          if (!this.adyenPaymentMethods.includes(payload.payment_method)) {
            this.admissionService.setDataCandidate(resp);
            this.admissionService.setStatusStepFive(true);
            this.processFinish = true;
            this.isSelectedMethod = true;
            this.openPopUpValidation(6, 'stepValidation');
          } else if (this.adyenPaymentMethods.includes(payload.payment_method)) {
            // **************** If payment method is credit card, we need to fetch PK and SK of stripe
            this.fetchStripeKeys();
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('LEGAL_S5.Title'),
              text: this.translate.instant('LEGAL_S5.Text'),
              confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
            });
          } else if (
            err['message'] === 'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
            err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')
          ) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('EUROPEAN_COUNTRIES.TITLE'),
              html: this.translate.instant('EUROPEAN_COUNTRIES.TEXT'),
              confirmButtonText: this.translate.instant('EUROPEAN_COUNTRIES.BUTTON'),
            });
          } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('IBAN_S1.Title'),
              text: this.translate.instant('IBAN_S1.Text'),
              confirmButtonText: this.translate.instant('IBAN_S1.Button'),
            });
          } else {
            this.swalErrorGraphQL(err);
          }
        },
      );
    } else {
      this.isWaitingForResponse = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('CANDIDAT_NOMEMBER.TITLE'),
        text: this.translate.instant('CANDIDAT_NOMEMBER.TEXT'),
        confirmButtonText: this.translate.instant('CANDIDAT_NOMEMBER.BUTTON'),
        allowOutsideClick: false,
      });
    }
  }

  fetchStripeKeys() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.GetPKAndSKKeysByCandidate(this.candidateData._id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.legalEntitiesKeys = resp;
          const payload = {
            candidate_id: this.candidateData._id,
            price_data_unit_amout_decimal: this.depositAmount * 100,
            sk_key: this.legalEntitiesKeys.stripe_sk_key,
            cancel_url: window.location.href,
            success_url: window.location.href,
          };
          this.isWaitingForResponse = true;
          this.subs.sink = this.admissionService.CreateCheckoutSession(payload).subscribe(
            (response) => {
              this.isWaitingForResponse = false;

              // If Stripe then we open the checkout URL
              if (response && response.vendor === 'stripe' && response.url) {
                window.open(response.url, '_self');
              }
              // If vendor is adyen we need to display the adyen UI to input
              else if (response && response.vendor === 'adyen') {
                this.adyenConfig(this.selectedCountry, this.currencySelected);
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

  saveFinalPayment() {
    let payload = this.createPayload(_.cloneDeep(this.candidateData));
    payload = this.customeDeletePayload(_.cloneDeep(payload));
    payload.payment = 'done';
    payload.payment_method = this.paymentForm.get('payment_method').value;
    this.isWaitingForResponse = true;
    delete payload?.candidate_unique_number;
    if (this.candidateData && this.candidateData.admission_member_id && this.candidateData.admission_member_id._id) {
      this.subs.sink = this.admissionService.UpdateCandidate(this.candidateData._id, payload).subscribe(
        (resp) => {
          console.log('Candidate Updated!', resp);
          this.processFinish = true;
          this.isSelectedMethod = true;
          this.isWaitingForResponse = false;
        },
        (err) => {
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('LEGAL_S5.Title'),
              text: this.translate.instant('LEGAL_S5.Text'),
              confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
            });
          } else if (
            err['message'] === 'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
            err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')
          ) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('EUROPEAN_COUNTRIES.TITLE'),
              html: this.translate.instant('EUROPEAN_COUNTRIES.TEXT'),
              confirmButtonText: this.translate.instant('EUROPEAN_COUNTRIES.BUTTON'),
            });
          } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('IBAN_S1.Title'),
              text: this.translate.instant('IBAN_S1.Text'),
              confirmButtonText: this.translate.instant('IBAN_S1.Button'),
            });
          } else {
            this.swalErrorGraphQL(err);
          }
        },
      );
    } else {
      this.isWaitingForResponse = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('CANDIDAT_NOMEMBER.TITLE'),
        text: this.translate.instant('CANDIDAT_NOMEMBER.TEXT'),
        confirmButtonText: this.translate.instant('CANDIDAT_NOMEMBER.BUTTON'),
        allowOutsideClick: false,
      });
    }
  }

  getDownPaymentCandidate() {
    // *************** Add condition to assign value of dp when candidate have deposit on billing_id (RA_EDH_0033)
    if (this.candidateData?.billing_id?.deposit) {
      this.hasDeposit = true;
      this.depositAmount = this.candidateData?.billing_id?.deposit;
    } else if (this.candidateData?.selected_payment_plan?.down_payment) {
      this.hasDeposit = true;
      this.depositAmount = this.candidateData?.selected_payment_plan?.down_payment;
    } else {
      this.depositAmount = 0;
    }
    if (
      this.candidateData.registration_profile &&
      this.candidateData.registration_profile?.is_down_payment &&
      this.candidateData.registration_profile?.is_down_payment === 'other'
    ) {
      const dp = this.candidateData?.registration_profile?.other_amount ? this.candidateData.registration_profile.other_amount : 0;
      this.hasDeposit = true;
      this.depositAmount = dp;
    } else if (
      this.candidateData.registration_profile &&
      this.candidateData.registration_profile.is_down_payment &&
      this.candidateData.registration_profile?.is_down_payment === 'dp_additional_cost'
    ) {
      const dp = this.candidateData?.registration_profile?.dp_additional_cost_amount
        ? this.candidateData.registration_profile.dp_additional_cost_amount
        : 0;
      this.hasDeposit = true;
      this.depositAmount = dp;
    }
    if (this.candidateData?.billing_id?.deposit && this.candidateData?.billing_id?.deposit_pay_amount !== 0) {
      const dp = this.candidateData.billing_id.deposit - this.candidateData.billing_id.deposit_pay_amount;
      this.hasDeposit = true;
      this.depositAmount = dp;
    }
  }

  modifyMethodPayment() {
    this.paymentForm.get('payment_method').setValue('');
    this.paymentForm.get('already_started').setValue(false);
    this.paymentForm.get('relation_bank').setValue(false);
  }

  validateCreditCard() {
    this.paymentFinalStep = true;
  }

  exportPdfs() {
    const link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.download = 'RIB Transfer';
    link.href = this.ribs;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  openPopUpValidation(data, type) {
    this.isWaitingForResponse = true;
    const school = this.candidateData.school ? this.candidateData.school.short_name : '';
    const campus = this.candidateData.campus ? this.candidateData.campus.name : '';
    this.subs.sink = this.candidateService.getStepValidationMessages(school, campus, data).subscribe(
      (resp) => {
        console.log('uat 440 open popup validation', resp);
        if (resp) {
          this.validationStepList = resp;
          if (this.validationStepList.video_link) {
            this.isVideoLink = true;
          }
          if (this.validationStepList.first_title !== null) {
            setTimeout(() => {
              this.isWaitingForResponse = false;
              this.subs.sink = this.dialog
                .open(RegistrationDialogComponent, {
                  width: '600px',
                  minHeight: '100px',
                  panelClass: 'certification-rule-pop-up',
                  disableClose: true,
                  data: {
                    type: type,
                    data: this.candidateData,
                    step: data,
                    depositAmount: this.depositAmount,
                    candidateId: this.candidateData._id,
                    validationStepList: this.validationStepList,
                    isVideoLink: this.isVideoLink,
                  },
                })
                .afterClosed()
                .subscribe((ressp) => {
                  this.processFinish = true;
                });
            }, 500);
          }
        }
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

  createPayloadPaymentAdyen(state, dropin, currency_code) {
    console.log(dropin);
    console.log(state);
    const currentDate = new Date();
    this.isWaitingForResponse = true;
    const formatAmount = 100;
    const payload = {
      reference: 'Test',
      amount: {
        currency: currency_code ? currency_code : 'EUR',
        value: this.depositAmount ? this.depositAmount * formatAmount : 0,
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
    console.log(payload);
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.CreatePaymentAdyen(payload).subscribe(
      (res) => {
        this.triggerFalse.nativeElement.click();
        this.isWaitingForResponse = false;
        console.log('_success payment', res);

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
          // this.saveFinalPayment() => got comment because when do payment with credit card dont need to call UpdateCandidate
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Payment Accepted'),
            text: this.translate.instant('Bravo !'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            // this.admissionService.setStatusStepFive(true);
            this.triggerPopupValidatioon.nativeElement.click();
            this.admissionService.setStatusStepFive(true);
            // this.openPopUpValidation(6, 'stepValidation');
            this.processFinish = true;
            this.isWaitingForResponse = false;
          });
        } else if (res && res.result_code === 'Refused') {
          this.isWaitingForResponse = false;
          this.swalError(res);
          dropin.unmount();

          this.showPayment = false;
          this.ngOnInit();
        }
      },
      (err) => {
        this.swalErrorGraphQL(err);
      },
    );
  }

  createPayloadPaymentAdyenSepa(state, dropin, currency_code) {
    console.log(dropin);
    console.log(state);
    this.isWaitingForResponse = true;
    const formatAmount = 100;
    const payload = {
      reference: 'Test',
      amount: {
        currency: currency_code ? currency_code : 'EUR',
        value: this.depositAmount ? this.depositAmount * formatAmount : 0,
      },
      payment_menthod: {
        type: state.data.paymentMethod.type,
        sepa_owner_name: state.data.paymentMethod.ownerName,
        sepa_iban_number: state.data.paymentMethod.iban,
      },
      candidate_id: this.candidateId,
    };
    console.log(payload);
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.CreatePaymentAdyen(payload).subscribe(
      (res) => {
        this.triggerFalse.nativeElement.click();
        this.isWaitingForResponse = false;
        console.log('_success payment sepa', res);

        if (res && res.result_code === 'Authorised') {
          // this.saveFinalPayment() => got comment because when do payment with credit card dont need to call UpdateCandidate
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            // this.admissionService.setStatusStepFive(true);
            this.triggerPopupValidatioon.nativeElement.click();
            this.admissionService.setStatusStepFive(true);
            // this.openPopUpValidation(6, 'stepValidation');
            this.processFinish = true;
            this.ngOnInit();
            this.isWaitingForResponse = false;
          });
        } else if (res && res.result_code === 'Refused') {
          this.isWaitingForResponse = false;
          this.swalError(res);
          dropin.unmount();

          this.showPayment = false;

          let refreshPage = true;
          if (this.router.snapshot.queryParamMap.get('redirectResult')) {
            refreshPage = false;
          } else {
            refreshPage = true;
          }

          if (refreshPage) {
            this.ngOnInit();
          }
          // this.ngOnInit();
        }
      },
      (err) => {
        this.swalErrorGraphQL(err);
      },
    );
  }

  sendPaymentDetailAdyen(state, dropin) {
    const candidateId = this.candidateId;
    const threeDSResult = state.data.details.threeDSResult;
    const is3DS2 = true;
    this.subs.sink = this.admissionService.sendPaymentDetailAdyen(candidateId, threeDSResult, is3DS2).subscribe(
      (res) => {
        console.log('uat 440 sendPaymentDetail');
        if (res && res.result_code === 'Authorised') {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Payment Accepted'),
            text: this.translate.instant('Bravo !'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.triggerPopupValidatioon.nativeElement.click();
            this.processFinish = true;
            this.isWaitingForResponse = false;
          });
        } else if (res && res.result_code === 'Refused') {
          this.isWaitingForResponse = false;
          this.swalError(res);
          dropin.unmount();

          this.showPayment = false;
          let refreshPage = true;
          if (this.router.snapshot.queryParamMap.get('redirectResult')) {
            refreshPage = false;
          } else {
            refreshPage = true;
          }

          if (refreshPage) {
            this.ngOnInit();
          }
          // this.ngOnInit();
        }
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

  callApiSendPaymentDetailAdyen(candidateId, threeDSResult, is3DS2) {
    this.subs.sink = this.admissionService.sendPaymentDetailAdyen(candidateId, threeDSResult, is3DS2).subscribe(
      (res) => {
        if (res && res.result_code === 'Authorised') {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Payment Accepted'),
            text: this.translate.instant('Bravo !'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.openPopUpValidation(6, 'stepValidation');
            this.processFinish = true;
            this.isWaitingForResponse = false;

            if (this.router.snapshot.queryParamMap.get('redirectResult')) {
              this.refreshByRoute();
            }
          });
        } else if (res && res.result_code === 'Refused') {
          this.isWaitingForResponse = false;
          const fromRedirect = true;
          this.swalError(res, fromRedirect);
          this.showPayment = false;
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
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  swalError(err, fromRedirect?) {
    console.log('ini errornya', err);
    if (err && err.refusal_reason_code) {
      const errCode = `<ul style="text-align: start; margin-left: 20px"> <li> ${err.refusal_reason_code} </li> </ul>`;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('PaymentFail_S1.TITLE'),
        html: this.translate.instant('PaymentFail_S1.TEXT', { errorCodes: errCode }),
        confirmButtonText: this.translate.instant('PaymentFail_S1.BUTTON'),
      }).then((result) => {
        if (fromRedirect) {
          this.refreshByRoute();
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
          this.refreshByRoute();
        }
      });
    }
  }

  swalErrorGraphQL(err) {
    this.isWaitingForResponse = false;
    this.triggerFalse.nativeElement.click();
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
        // this.refreshByRoute();
      });
    } else if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('LEGAL_S5.Title'),
        text: this.translate.instant('LEGAL_S5.Text'),
        confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
      });
    } else if (
      err['message'] === 'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
      err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('EUROPEAN_COUNTRIES.TITLE'),
        html: this.translate.instant('EUROPEAN_COUNTRIES.TEXT'),
        confirmButtonText: this.translate.instant('EUROPEAN_COUNTRIES.BUTTON'),
      });
    } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('IBAN_S1.Title'),
        text: this.translate.instant('IBAN_S1.Text'),
        confirmButtonText: this.translate.instant('IBAN_S1.Button'),
      });
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
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      }).then((res) => {
        if (res.value) {
          const errorTab = err && err['message'] ? err['message'].replaceAll('GraphQL error: ', '') : err;
          console.log(errorTab);
          if (errorTab.includes('Cannot edit data outside current step, please complete form on current step: ')) {
            const tabValid = errorTab.replace('Cannot edit data outside current step, please complete form on current step: ', '');
            this.moveToTab.emit(tabValid);
            console.log(tabValid);
          }
        }
      });
    }
  }

  refreshByRoute() {
    // Removing query param redirectResult
    this.routerNav.navigate(['.'], { relativeTo: this.router, queryParams: { candidate: this.candidateId } });
  }

  modifyDeposit() {
    this.paymentFinalStep = false;
    this.isSelectedMethod = false;
    if (!this.hasDeposit) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Sorry'),
        text: this.translate.instant('You dont have any down payment'),
        confirmButtonText: this.translate.instant('Okay'),
      });
    }
  }

  swalPaymentNotSupported() {
    this.triggerFalse.nativeElement.click();
    Swal.fire({
      type: 'info',
      title: 'Sorry',
      text: this.translate.instant('Payment not supported yet.'),
      confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
    });
  }

  createPayload(payload) {
    if (payload && payload._id) {
      delete payload._id;
    }
    if (payload && payload.campus) {
      payload.campus = payload.campus._id;
    }
    if (payload && payload.intake_channel) {
      payload.intake_channel = payload.intake_channel._id;
    }
    if (payload && payload.scholar_season) {
      payload.scholar_season = payload.scholar_season._id;
    }
    if (payload && payload.level) {
      payload.level = payload.level._id;
    }
    if (payload && payload.school) {
      payload.school = payload.school._id;
    }
    if (payload && payload.sector) {
      payload.sector = payload.sector._id;
    }
    if (payload && payload.speciality) {
      payload.speciality = payload.speciality._id;
    }
    if (payload && payload.registration_profile) {
      payload.registration_profile = payload.registration_profile._id;
    }
    if (payload && payload.admission_member_id) {
      payload.admission_member_id = payload.admission_member_id._id;
    }
    return payload;
  }

  updatePaymentMethodAndSwitch() {
    let payload = this.createPayload(_.cloneDeep(this.candidateData));
    payload = this.customeDeletePayload(_.cloneDeep(payload));
    payload.payment_method = this.paymentForm.get('payment_method').value;
    if (payload.selected_payment_plan) {
      delete payload.selected_payment_plan;
    }
    this.isWaitingForResponse = true;
    delete payload?.candidate_unique_number;
    if (this.candidateData && this.candidateData.admission_member_id && this.candidateData.admission_member_id._id) {
      this.subs.sink = this.admissionService.UpdateCandidate(this.candidateData._id, payload).subscribe(
        (resp) => {
          console.log('Candidate Updated!', resp);
          this.isWaitingForResponse = false;
          this.ngOnInit();

          // let currentUrl = this.routerNav.url;

          // this.routerNav.navigate(['./'], { relativeTo: this.router, queryParamsHandling: 'preserve' });

          // this.routerNav.routeReuseStrategy.shouldReuseRoute = () => false;
          // this.routerNav.onSameUrlNavigation = 'reload';
          // this.routerNav.navigate([currentUrl]);

          // this.routerNav
          // .navigateByUrl('/session', { skipLocationChange: true })
          // .then(() => this.routerNav.navigate([currentUrl]));
        },
        (err) => {
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('LEGAL_S5.Title'),
              text: this.translate.instant('LEGAL_S5.Text'),
              confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
            });
          } else if (
            err['message'] === 'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
            err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')
          ) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('EUROPEAN_COUNTRIES.TITLE'),
              html: this.translate.instant('EUROPEAN_COUNTRIES.TEXT'),
              confirmButtonText: this.translate.instant('EUROPEAN_COUNTRIES.BUTTON'),
            });
          } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('IBAN_S1.Title'),
              text: this.translate.instant('IBAN_S1.Text'),
              confirmButtonText: this.translate.instant('IBAN_S1.Button'),
            });
          } else {
            this.swalErrorGraphQL(err);
          }
        },
      );
    } else {
      this.isWaitingForResponse = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('CANDIDAT_NOMEMBER.TITLE'),
        text: this.translate.instant('CANDIDAT_NOMEMBER.TEXT'),
        confirmButtonText: this.translate.instant('CANDIDAT_NOMEMBER.BUTTON'),
        allowOutsideClick: false,
      });
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  openUploadWindow() {
    this.fileUploaderDoc.nativeElement.click();
  }

  chooseFile(fileInput) {
    const acceptable = ['jpg', 'pdf', 'jpeg', 'png'];
    const file = (<HTMLInputElement>fileInput.target).files[0];
    if (file) {
      this.isWaitingForResponse = true;
      const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
      console.log(fileType);
      if (acceptable.includes(fileType)) {
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (resp) => {
            console.log('_resp upload', resp);
            this.isWaitingForResponse = false;
            this.transferCheckForm.get('s3_document_name').patchValue(resp.s3_file_name);
            this.documenPDFName = resp.s3_file_name;
            if (this.documenPDFName !== null) {
              this.hasUploadPDF = true;
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            console.log('[Response BE][Error] : ', err);
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
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
      }
    }
    this.resetFileState();
  }

  resetFileState() {
    this.fileUploaderDoc.nativeElement.value = null;
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
    this.transferCheckForm.get('s3_document_name').setValue('');
    this.documenPDFName = '';
  }

  showSwalLegalRepresentativeS1() {
    const relations = ['father', 'grandfather', 'uncle'];
    const parentalLink = this.candidateData.legal_representative.parental_link;
    const civility = parentalLink === 'other' ? '' : relations.includes(parentalLink) ? 'MR' : 'MRS';
    
    Swal.fire({
      type: 'warning',
      allowEscapeKey: false,
      allowOutsideClick: false,
      allowEnterKey: false,
      title: this.translate.instant('LegalRepresentative_S1.TITLE'),
      text: this.translate.instant('LegalRepresentative_S1.TEXT', {
        civility: civility ? this.translate.instant(civility) : '', 
        first_name: this.candidateData.legal_representative.first_name, 
        last_name: this.candidateData.legal_representative.last_name
      }),
      confirmButtonText: this.translate.instant('LegalRepresentative_S1.BUTTON 1'),
    }).then(() => { });
  }
}
