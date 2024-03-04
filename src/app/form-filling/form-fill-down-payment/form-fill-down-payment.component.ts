import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RegistrationDialogComponent } from 'app/candidates/registration-dialog/registration-dialog.component';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { AdmissionService } from 'app/service/admission/admission.service';
import { ApplicationUrls } from 'app/shared/settings';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { environment } from 'environments/environment';
import { FormFillingService } from '../form-filling.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { StepMessageProcessDialogComponent } from 'app/form-builder/step-message-process/step-message-process.component';
declare var AdyenCheckout: any;

@Component({
  selector: 'ms-form-fill-down-payment',
  templateUrl: './form-fill-down-payment.component.html',
  styleUrls: ['./form-fill-down-payment.component.scss'],
})
export class FormFillDownPaymentComponent implements OnInit, OnDestroy {
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  @Input() candidateId = '';
  @Input() currentStepIndex;
  @Input() formDetail: any;
  @Input() userData;
  @Input() stepData;
  @Input() formattedSteps;
  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();
  candidateData: any;
  isWaitingForResponse = false;
  private subs = new SubSink();
  private subsDialog = new SubSink();
  documenPDFName: any = '';
  hasDoneTransferCheckForm = false;
  hasUploadPDF: any = true;

  listPayment = ['credit_card', 'transfer'];

  dummyVariable = {};
  @ViewChild('adyenDropin', { static: true }) adyenDropin: ElementRef;
  @ViewChild('triggerPopupValidatioon', { static: false }) triggerPopupValidatioon: ElementRef;
  @ViewChild('triggerTrue', { static: false }) triggerTrue: ElementRef;
  @ViewChild('triggerFalse', { static: false }) triggerFalse: ElementRef;

  @Input() selectedIndex = 0;
  @Output() moveToTab = new EventEmitter<string>();
  type = 'card';
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  ribs = this.serverimgPath + 'rib.pdf';
  sepaLogo = '../../../../../assets/img/sepa-wt-logo.png';

  listCountry: any;
  countryFlter = new UntypedFormControl('FR');
  hasDeposit = false;
  currencySelected: any;
  selectedCountry: any;
  paymentFinalStep = false;
  paymentDone = false;
  depositAmount: any;
  paymentForm: UntypedFormGroup;
  transferCheckForm: UntypedFormGroup;
  isSelectedMethod = false;
  showPayment = false;
  showTransferForm = false;
  processFinish = false;
  noDownPaymentSelected = false;
  isAdyenPayment = false;
  isLastStep = false;

  // Stripe Keys
  legalEntitiesKeys;

  checkout: any;

  adyenPaymentMethods = ['credit_card', 'sepa'];
  otherPaymentMethods = ['transfer', 'check'];
  private timeOutVal: any;
  hasDoneCC: boolean;
  hideButtonAccept: boolean;
  currentUser = null;
  userId = null;
  userMainId = null;
  isDepositPaymentSameFromTransfer = false;

  legalEntityData: any;

  constructor(
    private admisssionService: AdmissionEntrypointService,
    private admissionService: AdmissionService,
    private translate: TranslateService,
    private route: Router,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private cdr: ChangeDetectorRef,
    private formFillingService: FormFillingService,
    private router: ActivatedRoute,
    private utilService: UtilityService,
    private fileUploadService: FileUploadService,
    private authService: AuthService,
    public sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.userId = this.router.snapshot.queryParamMap.get('userId');
    if (this.currentUser && this.currentUser._id) {
      this.userMainId = this.currentUser._id;
    } else {
      if (this.userId) {
        this.userMainId = this.userId;
      } else {
        this.userMainId = null;
      }
    }
    this.initPayment();
    this.initTransferCheckForm();
    if (!this.formDetail.isPreview) {
      this.getOneCandidate();
      this.getLegalEntityByCandidate();
    } else {
      this.candidateData = {
        registration_profile: {
          select_payment_method_available: ['check', 'credit_card', 'cash'],
        },
      };
      this.depositAmount = 1000;
    }

    // *************** Check if user coming back from Adyen 3ds 1. They will pass queryParam redirectResult
    // We will need to directly call sendPaymentDetailAdyen and set payment as finished.
    if (this.router.snapshot.queryParamMap.get('redirectResult')) {
      const threeDSResult = this.router.snapshot.queryParamMap.get('redirectResult');
      const is3Ds2 = false;
      this.isWaitingForResponse = true;
      this.callApiSendPaymentDetailAdyen(this.formDetail.candidateId, threeDSResult, is3Ds2);
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
    if (this.stepData && this.stepData.form_builder_step && this.stepData.form_builder_step._id) {
      const lastStepIndex = this.formattedSteps?.length - 1;
      if (this.stepData.step_type === 'down_payment_mode' && lastStepIndex === this.currentStepIndex) {
        this.isLastStep = true;
        this.showTransferForm = false;
      }
    }
    this.subs.sink = this.admissionService.getCandidateDownPayment(this.formDetail.candidateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.candidateData = _.cloneDeep(resp);
        this.paymentForm.patchValue(resp);
        if (resp && resp.payment_transfer_check_data) {
          this.transferCheckForm.patchValue(resp.payment_transfer_check_data);
          this.documenPDFName = this.transferCheckForm.get('s3_document_name').value;
          if (
            resp.payment_transfer_check_data.wording_used_in_payment &&
            resp.payment_transfer_check_data.first_name_of_payer &&
            resp.payment_transfer_check_data.familiy_name_of_payer &&
            resp.payment_transfer_check_data.s3_document_name
          ) {
            this.hasDoneTransferCheckForm = true;
          }
        }
        this.getDownPaymentCandidate();
        if (
          this.candidateData.registration_profile &&
          this.candidateData.registration_profile.is_down_payment &&
          this.candidateData.registration_profile.is_down_payment === 'no'
        ) {
          this.noDownPaymentSelected = true;

          if (this.stepData && this.stepData.step_status === 'accept') {
            this.hideButtonAccept = true;
          }
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
          !this.processFinish &&
          !this.noDownPaymentSelected &&
          this.candidateData.billing_id.deposit &&
          this.candidateData.billing_id.deposit >= 0 &&
          this.candidateData.billing_id.deposit_pay_amount &&
          this.candidateData.billing_id.deposit_pay_amount >= 0 &&
          this.candidateData.readmission_status &&
          this.candidateData.readmission_status === 'readmission_table'
        ) {
          if (this.candidateData?.billing_id?.deposit_pay_amount >= this.candidateData?.billing_id?.deposit) {
            if (this.candidateData?.is_candidate_transfer) {
              this.isDepositPaymentSameFromTransfer = true;
            } else {
              this.isDepositPaymentSameFromTransfer =
                this.candidateData?.billing_id?.amount_paid >= this.candidateData?.billing_id?.deposit_pay_amount;
            }
          }
          if (this.stepData && this.stepData.step_status === 'accept') {
            this.hideButtonAccept = true;
          }
          if (
            (this.candidateData.payment === 'done' || this.candidateData.payment === 'sepa_pending') &&
            this.candidateData.payment_method &&
            this.candidateData.payment_method !== 'not_done' &&
            this.isLastStep &&
            this.stepData.step_status === 'accept'
          ) {
            this.isWaitingForResponse = true;
            setTimeout(() => {
              this.acceptNextStep();
            }, 3000);
          }
        }
        if (
          (this.candidateData.payment === 'pending' ||
            this.candidateData.payment === 'done' ||
            this.candidateData.payment === 'sepa_pending') &&
          this.candidateData.payment_method &&
          this.candidateData.payment_method !== 'not_done' &&
          this.stepData.step_status !== 'accept' &&
          this.isLastStep &&
          (!this.candidateData.readmission_status || this.candidateData.readmission_status !== 'readmission_table')
        ) {
          this.isWaitingForResponse = true;
          setTimeout(() => {
            this.acceptNextStep();
          }, 3000);
        }
        if (
          this.candidateData &&
          this.candidateData.payment &&
          (this.candidateData.payment === 'pending' ||
            this.candidateData.payment === 'done' ||
            this.candidateData.payment === 'sepa_pending') &&
          this.candidateData.payment_method &&
          this.candidateData.payment_method !== 'not_done' &&
          this.isLastStep &&
          this.stepData.step_status === 'accept'
        ) {
          this.processFinish = true;
        }
        // Condition to display adyen config when init if its adyen payment method(credit_card and sepa)
        if (
          this.adyenPaymentMethods.includes(this.candidateData.payment_method) &&
          !this.router.snapshot.queryParamMap.get('redirectResult')
        ) {
          this.showPayment = true;
          this.setValidatorTransfer('remove');
          this.fetchStripeKeys();
          if (this.stepData.step_status === 'accept') {
            this.hasDoneCC = true;
            this.showPayment = false;
          }
        }
        if (
          this.otherPaymentMethods.includes(this.candidateData.payment_method) &&
          !this.router.snapshot.queryParamMap.get('redirectResult')
        ) {
          this.showTransferForm = true;
          this.setValidatorTransfer('add');
        }
        if (
          this.candidateData.payment_method &&
          (this.candidateData.payment_method === 'transfer' || this.candidateData.payment_method === 'check') &&
          this.hasDoneTransferCheckForm
        ) {
          if (this.isLastStep && this.stepData.step_status === 'accept') {
            this.processFinish = true;
          } else {
            this.processFinish = false;
          }
        }
        if (this.candidateData.payment === 'not_done' || this.candidateData.payment === 'not_authorized') {
          this.hasDoneTransferCheckForm = false;
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
    this.subs.sink = this.admissionService.GetLegalEntityByCandidateForDownPaymentStep(this.formDetail.candidateId).subscribe((res) => {
      if (res) {
        this.legalEntityData = res;
      }
    });
  }

  acceptNextStep(creditCard?) {
    this.isWaitingForResponse = true;
    setTimeout(() => {
      this.isWaitingForResponse = false;
      this.subsDialog.sink = this.dialog
        .open(StepMessageProcessDialogComponent, {
          width: '600px',
          minHeight: '100px',
          panelClass: 'certification-rule-pop-up',
          disableClose: true,
          data: {
            stepId: this.stepData.form_builder_step._id,
            student_admission_process_id: this.formDetail.formId,
            isPreview: false,
          },
        })
        .afterClosed()
        .subscribe(
          (resp) => {
            if (resp && (resp.type === 'accept' || resp.type === 'empty')) {
              if (creditCard) {
                this.processFinish = true;
                this.isWaitingForResponse = false;
                this.triggerRefresh.emit(this.formDetail.formId);
              } else {
                this.processFinish = true;
                this.isWaitingForResponse = false;
                this.triggerRefresh.emit(this.formDetail.formId);
              }
            }
          },
          (error) => {
            this.isWaitingForResponse = false;
          },
        );
    }, 500);
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
        if (
          this.otherPaymentMethods.includes(this.paymentForm.get('payment_method').value) ||
          this.paymentForm.get('payment_method').value !== 'cash'
        ) {
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
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
    } else {
      this.isWaitingForResponse = true;
      const payload = _.cloneDeep(this.transferCheckForm.value);
      delete payload?.candidate_unique_number;
      this.subs.sink = this.formFillingService.UpdateCandidateTransferCheckPayment(this.candidateData._id, payload).subscribe(
        (resp) => {
          if (resp) {
            this.hasDoneTransferCheckForm = true;
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
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

  radioChange(type, event) {
    const oldValue = _.cloneDeep(this.paymentForm.get('payment_method').value);
    const payload = this.createPayload(_.cloneDeep(this.candidateData));
    delete payload.count_document;
    delete payload.user_id;
    delete payload?.candidate_unique_number;

    if (this.checkout && this.checkout.components && this.checkout.components.length) {
      this.checkout.components.forEach((adyenComp) => {
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

  adyenConfig(selectedCountry?, currency_code?, creditCard?) {
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

        const temp = _.cloneDeep(res);
        const filteredPaymentMethod = temp.filter((paymentMethod) => {
          return paymentMethod && paymentMethod.type === paramFilter;
        });

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

  confirmPayment() {
    this.isWaitingForResponse = true;
    const payload = this.createPayload(_.cloneDeep(this.candidateData));
    payload.payment_transfer_check_data = this.transferCheckForm.value;
    payload.personal_information = 'done';
    payload.is_admitted = true;
    if (!this.adyenPaymentMethods.includes(this.paymentForm.get('payment_method').value)) {
      payload.payment = 'pending';
    }
    payload.payment_method = this.paymentForm.get('payment_method').value;
    delete payload._id;
    delete payload.count_document;
    delete payload.user_id;
    delete payload.billing_id;
    delete payload?.candidate_unique_number;
    if (payload.selected_payment_plan) {
      delete payload.selected_payment_plan;
    }
    if (this.stepData && this.stepData.is_change_candidate_status_after_validated) {
      payload.candidate_admission_status = this.stepData.candidate_status_after_validated;
    }
    if (this.candidateData && this.candidateData.admission_member_id && this.candidateData.admission_member_id._id) {
      this.subs.sink = this.admissionService.UpdateCandidate(this.candidateData._id, payload).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          this.paymentDone = true;
          if (!this.adyenPaymentMethods.includes(payload.payment_method)) {
            this.triggerPopupValidatioon.nativeElement.click();
            this.processFinish = true;
            this.isSelectedMethod = true;
          }
          // **************** If payment method is credit card, we need to fetch PK and SK of stripe
          if (this.adyenPaymentMethods.includes(payload.payment_method)) {
            this.fetchStripeKeys(true);
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
            this.isWaitingForResponse = false;
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

  fetchStripeKeys(creditCard?) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.GetPKAndSKKeysByCandidate(this.candidateData._id).subscribe((resp) => {
      this.isWaitingForResponse = false;
      if (resp) {
        this.legalEntitiesKeys = resp;
        const returnUrlSucsess = this.route.createUrlTree([`session/success`], {
          queryParams: { candidate: this.candidateData._id },
        });
        const returnUrlCancel = this.route.createUrlTree([`session/cancel`], {
          queryParams: { candidate: this.candidateData._id },
        });
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
              this.adyenConfig(this.selectedCountry, this.currencySelected, creditCard);
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
    });
  }

  getDownPaymentCandidate() {
    // *************** Add condition to assign value of dp when candidate have deposit on billing_id (RA_EDH_0033)
    if (this.candidateData?.billing_id?.deposit >= 0) {
      if(this.candidateData?.billing_id?.deposit === 0) {
        this.hasDeposit = false;
        this.noDownPaymentSelected = true;
        this.isDepositPaymentSameFromTransfer = false;
      } else {
        this.hasDeposit = true;
      }
      this.depositAmount = this.candidateData?.billing_id?.deposit;
      if (this.stepData && this.stepData.step_status === 'accept') {
        this.hideButtonAccept = true;
      }
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
      this.candidateData?.registration_profile &&
      this.candidateData?.registration_profile?.is_down_payment &&
      this.candidateData?.registration_profile?.is_down_payment === 'dp_additional_cost'
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

  openPopUpValidation(data, type) {
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
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        this.processFinish = true;
      });
  }

  createPayloadPaymentAyden(state, dropin, currency_code, creditCard?) {
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
      candidate_id: this.formDetail.candidateId,
    };
    this.subs.sink = this.admissionService.CreatePaymentAdyen(payload).subscribe(
      (res) => {
        if (res) {
          if (res && res.result_code === 'Refused') {
            this.isWaitingForResponse = false;
            this.swalError(res);
          } else {
            this.subs.sink = this.formFillingService.CheckStatusFormProcess(this.formDetail?.formId).subscribe((resp) => {
              if (resp) {
                const isThereFinalMessage = resp?.steps.find((response) => response?.step_type === 'final_message');
                const isThereDownPayment = resp?.steps.find((response) => response?.step_type === 'down_payment_mode');
                if (isThereFinalMessage?.step_status === 'accept' && isThereDownPayment?.step_status === 'accept') {
                  this.processFinish = true;
                  this.isWaitingForResponse = false;
                  this.triggerRefresh.emit(this.formDetail.formId);
                  this.ngOnInit();
                } else {
                  if (res && res.result_code === 'Authorised') {
                    if (creditCard) {
                      this.triggerPopupValidatioon.nativeElement.click();
                    } else {
                      this.triggerRefresh.emit(this.formDetail.formId);
                      this.processFinish = true;
                      this.isWaitingForResponse = false;
                    }
                    this.acceptProcessStep();
                  }
                }
              }
            });
          }
        }
      },
      (err) => {
        this.swalErrorGraphQL(err);
      },
    );
  }

  swalError(err, fromRedirect?) {
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
      });
    } else if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('LEGAL_S5.Title'),
        text: this.translate.instant('LEGAL_S5.Text'),
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
      });
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
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      }).then((res) => {
        if (res.value) {
          const errorTab = err && err['message'] ? err['message'].replaceAll('GraphQL error: ', '') : err;
          if (errorTab.includes('Cannot edit data outside current step, please complete form on current step: ')) {
            const tabValid = errorTab.replace('Cannot edit data outside current step, please complete form on current step: ', '');
            this.moveToTab.emit(tabValid);
          }
        }
      });
    }
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
      if (acceptable.includes(fileType)) {
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            this.transferCheckForm.get('s3_document_name').patchValue(resp.s3_file_name);
            this.documenPDFName = resp.s3_file_name;
            if (this.documenPDFName !== null) {
              this.hasUploadPDF = true;
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
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
    this.transferCheckForm.get('s3_document_name').setValue('');
    this.documenPDFName = '';
  }

  swalPaymentNotSupported() {
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

  createPayloadPaymentAdyen(state, dropin, currency_code) {
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
      candidate_id: this.formDetail.candidateId,
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.CreatePaymentAdyen(payload).subscribe(
      (res) => {
        this.triggerFalse.nativeElement.click();
        this.isWaitingForResponse = false;
        if (res) {
          if (res && res.result_code === 'Refused') {
            this.isWaitingForResponse = false;
            this.swalError(res);
            dropin.unmount();
            this.showPayment = false;
            this.ngOnInit();
          } else {
            this.subs.sink = this.formFillingService.CheckStatusFormProcess(this.formDetail?.formId).subscribe((resp) => {
              if (resp) {
                const isThereFinalMessage = resp?.steps.find((response) => response?.step_type === 'final_message');
                const isThereDownPayment = resp?.steps.find((response) => response?.step_type === 'down_payment_mode');
                if (isThereFinalMessage?.step_status === 'accept' && isThereDownPayment?.step_status === 'accept') {
                  this.triggerRefresh.emit(this.formDetail.formId);
                  this.isWaitingForResponse = false;
                  this.showPayment = false;
                  dropin.unmount();
                  this.ngOnInit();
                } else {
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
                    Swal.fire({
                      type: 'success',
                      title: this.translate.instant('Payment Accepted'),
                      text: this.translate.instant('Bravo !'),
                      confirmButtonText: this.translate.instant('OK'),
                      allowEnterKey: false,
                      allowEscapeKey: false,
                      // allowOutsideClick: false,
                    }).then(() => {
                      // this.triggerPopupValidatioon.nativeElement.click();
                      this.acceptProcessStep('non_3ds_cc');
                    });
                  }
                }
              }
            });
          }
        }
      },
      (err) => {
        this.swalErrorGraphQL(err);
      },
    );
  }

  createPayloadPaymentAdyenSepa(state, dropin, currency_code) {
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
      candidate_id: this.formDetail.candidateId,
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.CreatePaymentAdyen(payload).subscribe(
      (res) => {
        this.triggerFalse.nativeElement.click();
        this.isWaitingForResponse = false;

        if (res) {
          if (res && res.result_code === 'Refused') {
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
          } else {
            this.subs.sink = this.formFillingService.CheckStatusFormProcess(this.formDetail?.formId).subscribe((resp) => {
              if (resp) {
                const isThereFinalMessage = resp?.steps.find((response) => response?.step_type === 'final_message');
                const isThereDownPayment = resp?.steps.find((response) => response?.step_type === 'down_payment_mode');
                if (isThereFinalMessage?.step_status === 'accept' && isThereDownPayment?.step_status === 'accept') {
                  this.triggerRefresh.emit(this.formDetail.formId);
                  this.processFinish = true;
                  this.isWaitingForResponse = false;
                  Swal.fire({
                    type: 'success',
                    title: this.translate.instant('Bravo!'),
                    confirmButtonText: this.translate.instant('OK'),
                    allowEnterKey: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                  }).then(() => {
                    dropin.unmount();
                    this.ngOnInit();
                  });
                } else {
                  if (res && res.result_code === 'Authorised') {
                    Swal.fire({
                      type: 'success',
                      title: this.translate.instant('Bravo!'),
                      confirmButtonText: this.translate.instant('OK'),
                      allowEnterKey: false,
                      allowEscapeKey: false,
                      allowOutsideClick: false,
                    }).then(() => {
                      this.triggerPopupValidatioon.nativeElement.click();
                      this.processFinish = true;
                      this.isWaitingForResponse = false;
                      this.acceptProcessStep();
                    });
                  }
                }
              }
            });
          }
        }
      },
      (err) => {
        this.swalErrorGraphQL(err);
      },
    );
  }

  sendPaymentDetailAdyen(state, dropin) {
    const candidateId = this.formDetail.candidateId;
    const threeDSResult = state.data.details.threeDSResult;
    const is3DS2 = true;
    this.subs.sink = this.admissionService.sendPaymentDetailAdyen(candidateId, threeDSResult, is3DS2).subscribe(
      (res) => {
        if (res) {
          if (res && res.result_code === 'Refused') {
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
          } else {
            this.subs.sink = this.formFillingService.CheckStatusFormProcess(this.formDetail?.formId).subscribe((resp) => {
              if (resp) {
                const isThereFinalMessage = resp?.steps.find((response) => response?.step_type === 'final_message');
                const isThereDownPayment = resp?.steps.find((response) => response?.step_type === 'down_payment_mode');
                if (isThereFinalMessage?.step_status === 'accept' && isThereDownPayment?.step_status === 'accept') {
                  this.processFinish = true;
                  this.isWaitingForResponse = false;
                  dropin.unmount();
                  this.ngOnInit();
                } else {
                  if (res && res.result_code === 'Authorised') {
                    this.triggerPopupValidatioon.nativeElement.click();
                    this.processFinish = true;
                    this.isWaitingForResponse = false;
                    this.isWaitingForResponse = true;
                    this.subs.sink = this.formFillingService
                      .acceptFormProcessStepFinance(this.formDetail.formId, this.stepData._id, this.translate.currentLang)
                      .subscribe(
                        (resssp) => {
                          this.isWaitingForResponse = false;
                        },
                        (err) => {
                          this.isWaitingForResponse = false;
                          if (
                            err['message'] ===
                            'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC'
                          ) {
                            Swal.fire({
                              type: 'info',
                              title: this.translate.instant('LEGAL_S5.Title'),
                              text: this.translate.instant('LEGAL_S5.Text'),
                              confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
                            });
                          } else if (
                            err['message'] ===
                              'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
                            err['message'].includes(
                              'Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit',
                            )
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
            });
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
    this.subs.sink = this.admissionService.sendPaymentDetailAdyen(candidateId, threeDSResult, is3DS2).subscribe(
      (res) => {
        if (res) {
          if (res && res.result_code === 'Refused') {
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
          } else {
            this.subs.sink = this.formFillingService.CheckStatusFormProcess(this.formDetail?.formId).subscribe((resp) => {
              if (resp) {
                const isThereFinalMessage = resp?.steps.find((response) => response?.step_type === 'final_message');
                const isThereDownPayment = resp?.steps.find((response) => response?.step_type === 'down_payment_mode');
                if (isThereFinalMessage?.step_status === 'accept' && isThereDownPayment?.step_status === 'accept') {
                  this.processFinish = true;
                  this.isWaitingForResponse = false;
                  this.refreshByRoute();
                  // 14/12/2022 - Need comment this one, because it make reload continously after succes payment with 3ds
                  // this.triggerRefresh.emit(this.formDetail.formId);
                  // this.ngOnInit();
                } else {
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
                      this.acceptProcessStep('3ds');
                    });
                  }
                }
              }
            });
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

  acceptProcessStep(source?: string) {
    this.isWaitingForResponse = true;
    this.cdr.detectChanges();
    this.subs.sink = this.formFillingService
      .acceptFormProcessStepFinance(this.formDetail.formId, this.stepData._id, this.translate.currentLang)
      .subscribe(
        (resp) => {
          this.processFinish = true;
          this.isWaitingForResponse = false;
          if (source === '3ds') {
            this.refreshByRoute();
          } else if (source === 'non_3ds_cc') {
            this.triggerPopupValidatioon.nativeElement.click();
          } else {
            this.triggerRefresh.emit(this.formDetail.formId);
          }
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
          }
        },
      );
  }

  refreshByRoute() {
    // Removing query param redirectResult
    this.route.navigate(['.'], {
      relativeTo: this.router,
      queryParams: {
        formId: this.formDetail.formId,
        formType: 'student_admission',
        candidateId: this.formDetail.candidateId,
        userTypeId: this.formDetail.userTypeId,
        userId: this.userId,
      },
    });
  }

  updatePaymentMethodAndSwitch() {
    let payload = this.createPayload(_.cloneDeep(this.candidateData));
    payload = this.customeDeletePayload(_.cloneDeep(payload));
    payload.payment_method = this.paymentForm.get('payment_method').value;
    if (payload.selected_payment_plan) {
      delete payload.selected_payment_plan;
    }
    delete payload?.candidate_unique_number;
    this.isWaitingForResponse = true;
    if (this.candidateData && this.candidateData.admission_member_id && this.candidateData.admission_member_id._id) {
      this.subs.sink = this.admissionService.UpdateCandidate(this.candidateData._id, payload).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          this.ngOnInit();
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
            this.isWaitingForResponse = false;
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

  customeDeletePayload(payload) {
    const items = payload;
    const nameKeys = [
      '_id',
      'count_document',
      'user_id',
      'billing_id',
      'additional_address',
      'address',
      'admission_member_id',
      'announcement_call',
      'announcement_email',
      'autorization_account',
      'bic',
      'campus',
      'candidate_admission_status',
      'city',
      'city_of_birth',
      'civility',
      'connection',
      'country',
      'country_of_birth',
      'date_of_birth',
      'department',
      'email',
      'engagement_level',
      'finance',
      'first_name',
      'first_name_used',
      'fixed_phone',
      'iban',
      'intake_channel',
      'is_whatsapp',
      'last_name',
      'last_name_used',
      'level',
      'nationality',
      'nationality_second',
      'participate_in_job_meeting',
      'participate_in_open_house_day',
      'payment_splits',
      'payment_supports',
      'photo',
      'post_code',
      'post_code_of_birth',
      'program_confirmed',
      'program_desired',
      'region',
      'registration_profile',
      'registration_profile_type',
      'scholar_season',
      'school',
      'school_contract_pdf_link',
      'sector',
      'speciality',
      'telephone',
      'trial_date',
      'signature',
      'personal_information',
      'is_admitted',
      'method_of_payment',
      'payment_transfer_check_data',
    ];
    nameKeys.forEach((key) => delete items[key]);
    return items;
  }

  noDownPayment() {
    this.isWaitingForResponse = true;
    const payload = {
      payment: 'no_down_payment',
    };
    this.subs.sink = this.admissionService.UpdateCandidate(this.candidateData._id, payload).subscribe(
      (res) => {
        this.isWaitingForResponse = false;
        if (res) {
          this.triggerPopupValidatioon.nativeElement.click();
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

  submitNoDP() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService
      .GenerateStepMessage(this.stepData.form_builder_step._id, this.formDetail.formId, false)
      .subscribe(
        (response) => {
          this.isWaitingForResponse = false;
          if (response) {
            this.subsDialog.sink = this.dialog
              .open(StepMessageProcessDialogComponent, {
                width: '600px',
                minHeight: '100px',
                panelClass: 'certification-rule-pop-up',
                disableClose: true,
                data: {
                  stepId: this.stepData.form_builder_step._id,
                  student_admission_process_id: this.formDetail.formId,
                  isPreview: false,
                },
              })
              .afterClosed()
              .subscribe(
                (resp) => {
                  this.isWaitingForResponse = false;
                  if (resp && (resp.type === 'accept' || resp.type === 'empty')) {
                    this.acceptProcessStep();
                  }
                },
                (error) => {
                  this.isWaitingForResponse = false;
                  this.acceptProcessStep();
                },
              );
          } else {
            this.isWaitingForResponse = false;
            this.acceptProcessStep();
          }
        },
        (error) => {
          this.isWaitingForResponse = false;
          this.acceptProcessStep();
        },
      );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.subsDialog.unsubscribe();
  }
}
