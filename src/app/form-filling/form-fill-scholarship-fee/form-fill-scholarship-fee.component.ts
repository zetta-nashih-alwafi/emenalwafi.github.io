import { Component, OnInit, OnDestroy, Input, OnChanges, ViewChild, ElementRef, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AdmissionService } from 'app/service/admission/admission.service';
import { SchoolService } from 'app/service/schools/school.service';
import { UtilityService } from 'app/service/utility/utility.service';
import * as moment from 'moment';
import { CoreService } from 'app/service/core/core.service';
import { CustomValidators } from 'ng2-validation';
import { EventEmitter } from '@angular/core';
import { FormFillingService } from '../form-filling.service';
import { StepMessageProcessDialogComponent } from 'app/form-builder/step-message-process/step-message-process.component';
import { MethodPaymentDialogComponent } from 'app/session/admission-form/method-payment-dialog/method-payment-dialog.component';
import { ApplicationUrls } from 'app/shared/settings';
import { AuthService } from 'app/service/auth-service/auth.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'ms-form-fill-scholarship-fee',
  templateUrl: './form-fill-scholarship-fee.component.html',
  styleUrls: ['./form-fill-scholarship-fee.component.scss'],
})
export class FormFillScholarshipFeeComponent implements OnInit, OnDestroy, OnChanges {
  @Input() formDetail: any;
  @Input() userData;
  @Input() stepData;
  @Input() formData;

  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  formId: string;

  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();
  candidateData: any;
  private subs = new SubSink();
  isWaitingForResponse = false;
  countriesFinance;
  countryListFinance;
  filteredCountryFinance = [];
  paymentForm: UntypedFormGroup;
  nameCandidate = '';
  relationList = ['father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'other'];
  pdfIcon = '../../../assets/img/pdf.png';
  imageUploaded = [];
  isPaymentPlanFinish = false;
  termSelected: any;
  depositAmount = 0;
  rateAmount = 0;
  discount = 0;
  discountCalculted = 0;
  suppIndex = 0;
  profileRate: any;
  listTerms: any;
  payloadPlan: any;
  bankType = false;
  maxTotalTime = 0;
  registrationFee: any;
  totalCost: any;
  creditCardSelected = false;

  cities: string[][] = [];
  filteredCities: string[][] = [];
  departments: string[][] = []; // in API, this field called "academy"
  filteredDepartments: string[][] = [];
  regions: string[][] = []; // in API, this field called "province"
  filteredRegions: string[][] = [];
  isDiscountFully = false;
  isAdditionalAsDp = false;
  isDepositZero = false;
  isAdditionalZero = false;
  scholarshipAfterDisc;
  processFinish: boolean;
  isDiscountOnFullRate = false;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  currentUser = null;
  userId = null;
  userMainId = null;

  // Service
  constructor(
    private admissionService: AdmissionService,
    private schoolService: SchoolService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    public coreService: CoreService,
    private formFillingService: FormFillingService,
    public utilitySevice: UtilityService,
    private authService: AuthService,
    public sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.formId = this.route.snapshot.queryParamMap.get('formId');
    this.currentUser = this.authService.getLocalStorageUser();
    this.userId = this.route.snapshot.queryParamMap.get('userId');
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
    if (!this.formDetail.isPreview) {
      this.getOneCandidate();
      if (
        this.formData &&
        this.formData.steps &&
        this.formData.steps.length &&
        this.formData.steps[this.formData.steps.length - 1].step_type === 'campus_validation' &&
        this.formData.steps[this.formData.steps.length - 1].step_status === 'accept'
      ) {
        this.processFinish = true;
      }
    } else {
      this.listTerms = [
        {
          name: '6020.00€ - 1 echeances',
          payment_mode_id: '61892b9267e6e4135fe90245',
          additional_expense: 260,
          down_payment: 900,
          total_amount: 6020,
          additional_cost: 0,
          times: 1,
          select_payment_method_available: ['transfer', 'sepa'],
          payment_date: [
            {
              amount: 6020,
              percentage: 100,
              date: '31/10/2022',
            },
          ],
        },
      ];
    }
    this.subs.sink = this.schoolService.getCountry().subscribe((list: any[]) => {
      this.countriesFinance = list;
      this.filteredCountryFinance = list;
      this.countryListFinance = list;
    });
  }

  ngOnChanges() {
    this.initPayment();
    this.isChangePaymentForm();

    if (
      !this.formDetail.isPreview &&
      this.formData.steps[this.formData.steps.length - 1].step_type === 'scholarship_fee' &&
      this.formData.steps[this.formData.steps.length - 1].step_status === 'accept'
    ) {
      this.processFinish = true;
    }
  }

  initPayment() {
    this.paymentForm = this.fb.group({
      candidate_name: [''],
      split: [false],
      finance: [null],
      relation_bank: [null],
      already_started: [false],
      rib: [''],
      payment: [null],
      selected_payment_plan: this.fb.group({
        name: [null],
        times: [null],
        additional_expense: [null],
        down_payment: [null],
        payment_mode_id: [null],
        total_amount: [null],
        payment_date: this.fb.array([]),
      }),
      payment_supports: this.fb.array([this.initFinancialSupport(true)]),
      payment_splits: this.fb.array([this.initSplitFinancialSupport()]),
      iban: [''],
      bic: [''],
      autorization_account: [false],
    });
    const img = {
      name: '',
      s3_file_name: '',
    };
    this.imageUploaded = [];
    this.imageUploaded.push(img);
    this.addSplitFinanceParent(true);
  }

  addParent() {
    const img = {
      name: '',
      s3_file_name: '',
    };
    this.imageUploaded.push(img);
    this.parentArray.push(this.initFinancialSupport(true));
    this.parentSplitArray.push(this.initSplitFinancialSupport());
    this.calculatePercentage();
  }

  addSplitFinanceParent(boolean) {
    this.parentSplitArray.push(this.initSplitFinancialSupport());
  }

  removeParent(parentIndex: number, from_loop?) {
    if (from_loop) {
      this.imageUploaded = [];
    } else {
      this.imageUploaded.splice(parentIndex, 1);
    }
    this.parentArray.removeAt(parentIndex);
    this.parentSplitArray.removeAt(parentIndex + 1);
    this.calculatePercentage();
  }
  get parentArray() {
    return this.paymentForm.get('payment_supports') as UntypedFormArray;
  }
  get parentSplitArray() {
    return this.paymentForm.get('payment_splits') as UntypedFormArray;
  }

  initFinancialSupport(init?) {
    if (init) {
      this.cities.push([]);
      this.filteredCities.push([]);
      this.regions.push([]);
      this.filteredRegions.push([]);
      this.departments.push([]);
      this.filteredDepartments.push([]);
    }
    return this.fb.group({
      civility: [null, Validators.required],
      name: ['', Validators.required],
      family_name: ['', Validators.required],
      parent_address: this.fb.group({
        country: ['', Validators.required],
        city: ['', Validators.required],
        address: ['', Validators.required],
        additional_address: [''],
        postal_code: ['', Validators.required],
        department: [''],
        region: [''],
      }),
      relation: ['', Validators.required],
      tele_phone: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      upload_document_rib: ['', Validators.required],
      email: ['', [Validators.required, CustomValidators.email]],
      iban: [''],
      bic: [''],
      autorization_account: [false],
    });
  }

  initSplitFinancialSupport() {
    return this.fb.group({
      payer_name: [''],
      percentage: [null, Validators.min(0)],
    });
  }

  getOneCandidate() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.getCandidateAdmission(this.formDetail.candidateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.candidateData = resp;
        this.nameCandidate =
          (this.candidateData.civility && this.candidateData.civility !== 'neutral'
            ? this.translate.instant(this.candidateData.civility)
            : '') +
          ' ' +
          (this.candidateData.first_name ? this.candidateData.first_name : '') +
          ' ' +
          (this.candidateData.last_name ? this.candidateData.last_name : '');
        this.paymentForm.get('candidate_name').setValue(this.nameCandidate);

        this.profileRate = this.candidateData.registration_profile ? this.candidateData.registration_profile : null;
        this.getDownPaymentCandidate();
        this.paymentForm.patchValue(this.candidateData);
        const payload = this.candidateData.payment_supports.map((list) => {
          return {
            ...list,
            parent_address: list.parent_address && list.parent_address.length ? list.parent_address[0] : [],
          };
        });
        if (this.candidateData.payment_supports && this.candidateData.payment_supports.length) {
          this.imageUploaded = this.candidateData.payment_supports
            .filter((lest) => lest.upload_document_rib)
            .map((data) => {
              return { s3_file_name: data.upload_document_rib, name: 'capture' };
            });
        }
        if (this.candidateData.registration_profile.additional_cost_ids) {
          this.calculateRegistrationFees(this.candidateData.registration_profile.additional_cost_ids);
        }
        if (payload && payload.length) {
          const control = this.paymentForm.get('payment_supports').value;
          for (let i = control.length - 1; i >= 0; i--) {
            this.removeParent(i, true);
          }
          this.candidateData.payment_supports.forEach((element) => {
            this.addParent();
          });
          this.paymentForm.get('payment_supports').patchValue(payload);
          this.candidateData.payment_supports.forEach((element, ind) => {
            this.imageUploaded[ind].s3_file_name = element.upload_document_rib;
          });
        }
        if (this.candidateData && this.candidateData.finance) {
          this.paymentForm.get('finance').patchValue(this.candidateData.finance);
        }
        if (this.candidateData.payment_splits && this.candidateData.payment_splits.length) {
          this.paymentForm.get('payment_splits').patchValue(this.candidateData.payment_splits);
          const split = this.candidateData.finance === 'family' ? true : false;
          this.paymentForm.get('split').setValue(split);
        }
        if (this.candidateData.bic) {
          this.paymentForm.get('bic').patchValue(this.candidateData.bic);
        }
        if (this.candidateData.iban) {
          this.paymentForm.get('iban').patchValue(this.candidateData.iban);
        }
        if (this.candidateData && this.candidateData.method_of_payment === 'credit_card') {
          this.creditCardSelected = true;
        } else {
          this.creditCardSelected = false;
        }
        if (
          this.candidateData &&
          this.candidateData.method_of_payment &&
          this.candidateData.method_of_payment !== 'not_done' &&
          this.candidateData.selected_payment_plan &&
          this.candidateData.selected_payment_plan?.name
        ) {
          this.isPaymentPlanFinish = true;
          this.termSelected = this.candidateData?.selected_payment_plan;
        }
        this.isChangePaymentForm();
      },
      (err) => {
        this.isWaitingForResponse = false;
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
            }
          }
        });
      },
    );
  }

  isChangePaymentForm() {
    this.subs.sink = this.admissionService.paymentForm.subscribe((val) => {
      if (val && val.finance) {
        this.paymentForm.get('finance').setValue(val.finance);
      }
    });
  }

  filterCountrys(addressIndex: string) {
    const searchString = this.paymentForm.get('payment_supports').get(addressIndex).get('parent_address').get('country').value
      ? this.paymentForm.get('payment_supports').get(addressIndex).get('parent_address').get('country').value.toLowerCase().trim()
      : '';
    this.filteredCountryFinance = this.countriesFinance.filter((country) => country.name.toLowerCase().trim().includes(searchString));
  }

  getDownPaymentCandidate() {
    const school = this.candidateData.school ? this.candidateData.school._id : null;
    const scholar = this.candidateData.scholar_season ? this.candidateData.scholar_season._id : null;
    const campus = this.candidateData.campus ? this.candidateData.campus._id : null;
    const level = this.candidateData.level ? this.candidateData.level._id : null;
    const sector = this.candidateData.sector ? this.candidateData.sector._id : null;
    const speciality = this.candidateData.speciality ? this.candidateData.speciality._id : null;
    this.subs.sink = this.admissionService.GetOneDownPayment(scholar, school, campus, level, sector, speciality).subscribe(
      (list) => {
        if (list) {
          if (this.candidateData && this.candidateData.registration_profile_type) {
            if (this.candidateData.registration_profile_type === 'internal') {
              this.depositAmount = list.internal;
              this.generateTerms();
            } else {
              this.depositAmount = list.external;
              this.generateTerms();
            }
          } else {
            this.depositAmount = list.internal;
            this.generateTerms();
          }
          if (
            this.candidateData &&
            this.candidateData.registration_profile &&
            this.candidateData.registration_profile.is_down_payment &&
            this.candidateData.registration_profile.is_down_payment === 'other'
          ) {
            const dp = this.candidateData?.registration_profile?.other_amount ? this.candidateData.registration_profile.other_amount : 0;
            this.depositAmount = dp;
          } else if (
            this.candidateData.registration_profile &&
            this.candidateData.registration_profile?.is_down_payment &&
            this.candidateData.registration_profile?.is_down_payment === 'dp_additional_cost'
          ) {
            const dp = this.candidateData.registration_profile?.dp_additional_cost_amount
              ? this.candidateData.registration_profile.dp_additional_cost_amount
              : 0;
            this.depositAmount = dp;
          } else if (
            this.candidateData &&
            this.candidateData.registration_profile &&
            this.candidateData.registration_profile.is_down_payment &&
            this.candidateData.registration_profile.is_down_payment === 'no'
          ) {
            this.depositAmount = 0;
          }
          this.subs.sink = this.admissionService.GetOneFullRate(scholar, school, campus, level, sector, speciality).subscribe(
            (lists) => {
              if (lists) {
                const discountPercent =
                  this.candidateData &&
                  this.candidateData.registration_profile &&
                  this.candidateData.registration_profile?.discount_on_full_rate
                    ? this.candidateData.registration_profile?.discount_on_full_rate
                    : 0;
                this.discount = discountPercent;
                if (this.candidateData && this.candidateData?.registration_profile_type) {
                  if (this.candidateData.registration_profile_type === 'internal') {
                    this.rateAmount = lists.amount_internal;
                    this.discountCalculted = discountPercent ? (discountPercent / 100) * this.rateAmount : 0;
                    this.scholarshipAfterDisc = this.rateAmount - this.discountCalculted;
                    this.generateTerms();
                  } else {
                    this.rateAmount = lists.amount_external;
                    this.discountCalculted = discountPercent ? (discountPercent / 100) * this.rateAmount : 0;
                    this.scholarshipAfterDisc = this.rateAmount - this.discountCalculted;
                    this.generateTerms();
                  }
                } else {
                  this.rateAmount = lists.amount_external;
                  this.discountCalculted = discountPercent ? (discountPercent / 100) * this.rateAmount : 0;
                  this.scholarshipAfterDisc = this.rateAmount - this.discountCalculted;
                  this.generateTerms();
                }
              }
            },
            (err) => {
              this.generateTerms();
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
                  }
                }
              });
            },
          );
        }
      },
      (err) => {
        this.generateTerms();
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
            }
          }
        });
      },
    );
  }

  generateTerms() {
    const dp = this.depositAmount ? this.depositAmount : 0;
    const rate = this.scholarshipAfterDisc ? this.scholarshipAfterDisc : 0;
    const disc = this.profileRate.discount_on_full_rate ? this.profileRate.discount_on_full_rate : 0;
    if (disc && disc >= 100) {
      this.isDiscountFully = true;
    }
    if (dp === 0) {
      this.isDepositZero = true;
    }
    let additional = 0;
    if (this.profileRate.additional_cost_ids && this.profileRate.additional_cost_ids.length) {
      this.profileRate.additional_cost_ids.forEach((element) => {
        additional += element.amount ? element.amount : 0;
      });
    }
    let expense = 0;
    if (this.profileRate.payment_modes && this.profileRate.payment_modes.length) {
      this.profileRate.payment_modes.forEach((element) => {
        expense += element.additional_cost ? element.additional_cost : 0;
      });
    }
    if (additional === 0 && expense === 0) {
      this.isAdditionalZero = true;
    }
    this.isDiscountOnFullRate = this.profileRate?.discount_on_full_rate === 100 ? true : false;
    this.isAdditionalAsDp = this.profileRate && this.profileRate.is_down_payment === 'dp_additional_cost' ? true : false;
    if (this.profileRate && this.profileRate.payment_modes && this.profileRate.payment_modes.length) {
      this.listTerms = this.profileRate.payment_modes.map((data) => {
        return {
          name:
            (data.additional_cost + rate + additional - dp).toFixed(2).toString() +
            '€ - ' +
            (data.payment_date && data.payment_date.length ? data.payment_date.length : '0') +
            ' echeances',
          payment_mode_id: data._id,
          additional_expense: data.additional_cost + additional,
          down_payment: this.isAdditionalAsDp ? this.profileRate.dp_additional_cost_amount : dp,
          total_amount: rate + additional + data.additional_cost - dp,
          additional_cost: data.additional_cost ? data.additional_cost : 0,
          times: data.payment_date && data.payment_date.length ? data.payment_date.length : 0,
          select_payment_method_available: data.select_payment_method_available,
          payment_date:
            !this.isDiscountOnFullRate && data.payment_date && data.payment_date.length
              ? data.payment_date.map((list) => {
                  const amount = (data.additional_cost + rate + additional - dp) * (list.percentage / 100);
                  return {
                    amount,
                    percentage: parseFloat(((amount / (data.additional_cost + rate + additional - dp)) * 100).toFixed(2)),
                    date: moment(list.date).format('DD/MM/YYYY'),
                  };
                })
              : [],
        };
      });
      this.listTerms = this.listTerms.sort(function (a, b) {
        return a.times - b.times;
      });
      this.maxTotalTime = this.listTerms[this.listTerms.length - 1].times;
    } else {
      this.listTerms = [
        {
          name: 'None',
          additional_expense: additional,
          down_payment: this.isAdditionalAsDp ? this.profileRate.dp_additional_cost_amount : dp,
          total_amount: rate + additional - dp,
          additional_cost: 0,
          payment_mode_id: null,
          times: 0,
          select_payment_method_available: null,
          payment_date: [],
        },
      ];
      this.maxTotalTime = this.listTerms[this.listTerms.length - 1].times;
    }
  }

  selectPlanning(data) {
    if (this.stepData && this.stepData.step_status !== 'accept' && !this.formDetail.isPreview) {
      this.isWaitingForResponse = true;
      this.termSelected = data;
      const dates = data.payment_date.map((list) => {
        const amount = parseFloat(list.amount.toFixed(2));
        return {
          date: list.date,
          amount,
          percentage: parseFloat(((amount / data.total_amount) * 100).toFixed(2)),
        };
      });
      const payload = {
        name: data.name,
        total_amount: parseFloat(data.total_amount.toFixed(2)),
        times: data.times,
        payment_mode_id: data.payment_mode_id,
        additional_expense: parseFloat(data.additional_expense),
        down_payment: parseFloat(data.down_payment),
        payment_date: dates && dates.length ? dates : [],
      };
      this.paymentForm.get('selected_payment_plan').patchValue(payload);
      const payloadFinal = this.createPayload(_.cloneDeep(this.paymentForm.value));
      payloadFinal.selected_payment_plan = payload;
      const splitData = this.paymentForm.get('payment_splits').value;
      if (splitData && splitData[0] && splitData[0].percentage) {
        payloadFinal.payment_splits = this.paymentForm.get('payment_splits').value;
      } else {
        delete payloadFinal.payment_splits;
      }
      const familySupport = this.parentArray.value;      
      if (familySupport && familySupport?.length && familySupport[0] && familySupport[0].name) {
        payloadFinal.payment_supports = this.paymentForm.get('payment_supports').value;
      } else {
        payloadFinal.payment_supports = [];
      }
      delete payloadFinal.candidate_name;
      delete payloadFinal.split;
      delete payloadFinal.relation_bank;
      delete payloadFinal.already_started;
      delete payloadFinal.count_document;
      delete payloadFinal.user_id;
      delete payloadFinal.finance;
      if (data && data.name === 'None') {
        payloadFinal.finance = 'discount';
      }
      this.payloadPlan = payloadFinal.selected_payment_plan;
      if (data && data.name === 'None') {
        this.isWaitingForResponse = false;
        this.nextStepMassage(payloadFinal);
      } else {
        this.isWaitingForResponse = false;
        this.openPopUpWhite(data, 'confirmTiga', payloadFinal);
      }
    }
  }

  openPopUpWhite(data, type, payloadFinal) {
    const payload = _.cloneDeep(this.candidateData);
    delete payload._id;
    delete payload.candidate_name;
    delete payload.split;
    delete payload.relation_bank;
    delete payload.finance;
    delete payload.already_started;
    const dialogref = this.dialog.open(MethodPaymentDialogComponent, {
      width: '485px',
      minHeight: '180px',
      panelClass: 'certification-rule-pop-up',
      disableClose: true,
      data: {
        type: type,
        data: payload,
        balance: data,
        depositAmount: this.depositAmount,
        rateAmount: this.rateAmount,
        candidateId: this.candidateData._id,
        fromFormFill: true,
      },
    });
    dialogref.afterClosed().subscribe((resp) => {
      if (resp && resp.type !== 'cancel') {
        payloadFinal.method_of_payment = resp.method_of_payment;
        if (this.stepData && this.stepData.is_change_candidate_status_after_validated) {
          payloadFinal.candidate_admission_status = this.stepData.candidate_status_after_validated;
        }
        this.nextStepMassage(payloadFinal);
      }
    });
  }

  nextStepMassage(payloadFinal?) {
    // StepMessageProcessDialogComponent
    let stepId = null;
    if (this.stepData && this.stepData.form_builder_step && this.stepData.form_builder_step._id) {
      stepId = this.stepData.form_builder_step._id;
    }
    this.subs.sink = this.dialog
      .open(StepMessageProcessDialogComponent, {
        width: '600px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          stepId: stepId,
          isPreview: false,
          student_admission_process_id: this.formDetail.formId,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp && (resp.type === 'accept' || resp.type === 'empty')) {
          this.subs.sink = this.admissionService.UpdateCandidateForm(this.candidateData._id, payloadFinal).subscribe(
            (resp) => {
              this.isWaitingForResponse = false;
              if (resp) {
                this.candidateData = resp;
                this.isWaitingForResponse = true;
                this.subs.sink = this.formFillingService
                  .acceptFormProcessStepFinance(this.formDetail.formId, this.stepData._id, this.translate.currentLang)
                  .subscribe(
                    (resp) => {
                      this.isWaitingForResponse = false;
                      this.triggerRefresh.emit(this.formDetail.formId);
                    },
                    (err) => {
                      if (
                        err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC'
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
      });
    // ...
  }

  noPayment() {
    this.isWaitingForResponse = true;
    const payloadFinal = this.createPayload(_.cloneDeep(this.paymentForm.value));
    const payload = {
      name: '',
      total_amount: 0,
      times: 0,
      additional_expense: 0,
      payment_mode_id: null,
      down_payment: this.depositAmount,
      payment_date: [],
    };
    this.paymentForm.get('selected_payment_plan').patchValue(payload);
    payloadFinal.selected_payment_plan = payload;
    payloadFinal.finance = 'discount';
    const splitData = this.paymentForm.get('payment_splits').value;
    if (splitData && splitData[0] && splitData[0].percentage) {
      payloadFinal.payment_splits = this.paymentForm.get('payment_splits').value;
    } else {
      delete payloadFinal.payment_splits;
    }

    const familySupport = this.parentArray.value;
    if (familySupport && familySupport?.length && familySupport[0] && familySupport[0].name) {
      payloadFinal.payment_supports = this.paymentForm.get('payment_supports').value;
    } else {
      payloadFinal.payment_supports = [];
    }
    delete payloadFinal.candidate_name;
    delete payloadFinal.split;
    delete payloadFinal.relation_bank;
    delete payloadFinal.already_started;
    delete payloadFinal.count_document;
    delete payloadFinal.user_id;
    this.payloadPlan = payloadFinal.selected_payment_plan;
    if (this.stepData && this.stepData.is_change_candidate_status_after_validated) {
      payloadFinal.candidate_admission_status = this.stepData.candidate_status_after_validated;
    }
    this.nextStepMassage(payloadFinal);
  }

  calculateRegistrationFees(datas) {
    let fees = 0;
    if (datas && datas.length) {
      datas.forEach((fee) => {
        fees = fees + fee.amount;
      });
      this.registrationFee = fees;
    }
  }

  calcTotal(data) {
    this.totalCost = data.total_amount + data.down_payment;
    return this.totalCost;
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
  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  calculatePercentage() {
    const termTotal = _.cloneDeep(this.parentSplitArray.controls.length);
    const control = _.cloneDeep(this.paymentForm.get('payment_splits').value);
    let balance = (100 / termTotal).toString();
    balance = parseFloat(balance).toFixed(2);
    balance = Math.round(parseInt(balance)).toString();
    control.forEach((element, index) => {
      if (control.length - 1 === index) {
        const remainDisc = 100 - parseInt(balance) * (termTotal - 1);
        this.paymentForm.get('payment_splits').get(index.toString()).get('percentage').setValue(remainDisc);
      } else {
        this.paymentForm.get('payment_splits').get(index.toString()).get('percentage').setValue(parseInt(balance));
      }
    });
  }
}
