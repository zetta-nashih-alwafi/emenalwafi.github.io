import { Component, OnInit, OnDestroy, Input, OnChanges, ViewChild, ElementRef, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AdmissionService } from 'app/service/admission/admission.service';
import { SchoolService } from 'app/service/schools/school.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { CoreService } from 'app/service/core/core.service';
import { CustomValidators } from 'ng2-validation';
import { EventEmitter } from '@angular/core';
import { StepMessageProcessDialogComponent } from 'app/form-builder/step-message-process/step-message-process.component';
import { FormFillingService } from '../form-filling.service';
import { ApplicationUrls } from 'app/shared/settings';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-form-fill-modality-payment',
  templateUrl: './form-fill-modality-payment.component.html',
  styleUrls: ['./form-fill-modality-payment.component.scss'],
})
export class FormFillModalityPaymentComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  @Input() candidateId = '';
  @Input() formData: any;
  @Input() currentStepIndex;
  @Input() formDetail: any;
  @Input() userData;
  @Input() stepData;
  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();

  
  @Input() countryCodeList: any[];

  candidateData: any;
  private subs = new SubSink();
  isWaitingForResponse = false;
  countriesFinance;
  countryListFinance;
  filteredCountryFinance = [];
  paymentForm: UntypedFormGroup;
  nameCandidate = '';
  imageUploaded = [];
  isPaymentPlanFinish = true;
  isPaymentTypeFinish = false;
  isPaymentTypeDone = false;
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
  isReselectPaymentType = false;
  scholarshipAfterDisc;
  formId: string;
  openQuestion: boolean;
  selectedStepData: any;
  initialCostCoverage: any;

  processFinish: boolean;
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
    public utilitySevice: UtilityService,
    private formFillingService: FormFillingService,
    private authService: AuthService,
    public sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.queryParamMap.get('userId');
    this.currentUser = this.authService.getLocalStorageUser();
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
        this.formData.steps[this.formData.steps.length - 1].step_type === 'modality_payment' &&
        this.formData.steps[this.formData.steps.length - 1].step_status === 'accept'
      ) {
        this.processFinish = true;
      }
    }
    this.subs.sink = this.schoolService.getCountry().subscribe(
      (list: any[]) => {
        this.countriesFinance = list;
        this.filteredCountryFinance = list;
        this.countryListFinance = list;
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
    this.checkStepStatus();
  }

  ngOnChanges() {
    this.initPayment();
    this.isChangePaymentForm();

    if (
      this.formData &&
      this.formData.steps &&
      this.formData.steps.length &&
      !this.formDetail.isPreview &&
      this.formData.steps[this.formData.steps.length - 1].step_type === 'modality_payment' &&
      this.formData.steps[this.formData.steps.length - 1].step_status === 'accept'
    ) {
      this.processFinish = true;
    }
    this.checkStepStatus();
  }

  //this function will check the step status, if status accept, will auto open disabled question
  checkStepStatus() {
    if (this.stepData?.step_status === 'accept' && this.stepData?.segments?.length) {
      this.paymentType('my_self', this.stepData?.segments[0]);
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
        console.log('getOneCandidate', resp);
        // console.log(this.candidateData);
        if (resp && resp?.selected_payment_plan && resp?.selected_payment_plan?.total_amount) {
          this.initialCostCoverage = Number(resp?.selected_payment_plan?.total_amount);
        } else {
          this.initialCostCoverage = 0;
        }
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
          this.candidateData.payment_supports.forEach(() => {
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

  checkInvalidFieldPaymentSupports() {
    let invalidField;
    for (const control of this.parentArray.controls) {
      if (control instanceof UntypedFormGroup) {
        // is a FormGroup
        invalidField = this.findInvalidControlsRecursive(control);
        if (invalidField && invalidField.length > 0) {
          break;
        }
      }
    }
    if (invalidField) {
      return invalidField.includes('email') ? true : false;
    } else {
      return false;
    }
  }

  checkEmailPaymentSupportsSameAsStudent() {
    let invalidField;
    for (const control of this.parentArray.controls) {
      if (control instanceof UntypedFormGroup) {
        // is a FormGroup
        invalidField = this.findInvalidControlsRecursive(control, true);
        if (invalidField && invalidField.length > 0) {
          break;
        }
      }
    }
    if (invalidField) {
      return invalidField.includes('email') ? true : false;
    } else {
      return false;
    }
  }

  findInvalidControlsRecursive(formToInvestigate: UntypedFormGroup | UntypedFormArray, isSameAsStudent?): string[] {
    var invalidControls: string[] = [];
    let recursiveFunc = (form: UntypedFormGroup | UntypedFormArray) => {
      Object.keys(form.controls).forEach((field) => {
        const control = form.get(field);
        if (isSameAsStudent) {
          if (control.hasError('emailSame')) invalidControls.push(field);
        } else {
          if (control.hasError('email')) invalidControls.push(field);
        }
        if (control instanceof UntypedFormGroup) {
          recursiveFunc(control);
        } else if (control instanceof UntypedFormArray) {
          recursiveFunc(control);
        }
      });
    };
    recursiveFunc(formToInvestigate);
    return invalidControls;
  }

  markSelfFinanceFieldsAsTouched() {
    this.paymentForm.get('iban').markAsTouched();
    this.paymentForm.get('bic').markAsTouched();
    this.paymentForm.get('autorization_account').markAsTouched();
  }

  markFamilyFinanceFieldsAsTouched() {
    for (const control of (this.paymentForm.get('payment_supports') as UntypedFormArray).controls) {
      control.markAllAsTouched();
    }
  }

  // check if individual field in family financier form has error
  isFieldValid(field: string, formIndex: number, isAddressField: boolean) {
    return isAddressField
      ? (this.paymentForm.get('payment_supports') as UntypedFormArray).at(formIndex).get('parent_address').get(field).invalid &&
          (this.paymentForm.get('payment_supports') as UntypedFormArray).at(formIndex).get('parent_address').get(field).touched
      : (this.paymentForm.get('payment_supports') as UntypedFormArray).at(formIndex).get(field).invalid &&
          (this.paymentForm.get('payment_supports') as UntypedFormArray).at(formIndex).get(field).touched;
  }

  // to make border of invalid fields as red
  toggleValidationStyle(field: string, formIndex: number, isAddressField = false) {
    if (this.parentArray) {
      return {
        'has-error': this.isFieldValid(field, formIndex, isAddressField),
      };
    }
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
    delete payloadFinal.candidate_name;
    delete payloadFinal.split;
    delete payloadFinal.relation_bank;
    delete payloadFinal.already_started;
    delete payloadFinal.count_document;
    delete payloadFinal.user_id;
    delete payloadFinal.payment_splits;
    payloadFinal.payment_supports = [];
    this.payloadPlan = payloadFinal?.selected_payment_plan;
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

  paymentType(type, step) {
    this.formFillingService.triggerFormFillChangeEvent(false);
    const stepData = _.cloneDeep(this.stepData);
    this.paymentForm.get('finance').setValue(type);
    this.openQuestion = true;
    this.selectedStepData = _.cloneDeep(this.stepData);
    if (!this.formDetail.isPreview) {
      this.selectedStepData.segments = this.selectedStepData.segments.filter((res) => res._id === step._id);
      this.updateSelectedModality(step, false, stepData);
      this.selectedStepData['notSelected'] = stepData.segments
        .filter((res) => res._id !== step._id)
        .map((resp) => {
          return {
            questions: resp.questions,
            segment_title: resp.segment_title,
            is_selected_modality: false,
          };
        });
    } else {
      this.selectedStepData.segments = this.selectedStepData.segments.filter((res) => res.segment_title === step.segment_title);
      this.updateSelectedModality(step, true, stepData);
      this.selectedStepData['notSelected'] = stepData.segments
        .filter((res) => res.segment_title !== step.segment_title)
        .map((resp) => {
          return {
            questions: resp.questions,
            segment_title: resp.segment_title,
            is_selected_modality: false,
          };
        });
    }
  }

  updateSelectedModality(step, isPreview, stepData) {
    if (isPreview) {
      let segments = [];
      this.stepData.segments = stepData.segments.forEach((res) => {
        if (res.segment_title !== step.segment_title) {
          res.is_selected_modality = false;
          segments.push(res);
        } else {
          res.is_selected_modality = true;
          segments.push(res);
        }
      });
      this.stepData.segments = segments;
    } else {
      let segments = [];
      stepData.segments.forEach((res) => {
        if (res._id !== step._id) {
          res.is_selected_modality = false;
          segments.push(res);
        } else {
          res.is_selected_modality = true;
          segments.push(res);
        }
      });
      this.stepData.segments = segments;
    }
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

  recalculateDisc(ind) {
    const percentage = this.paymentForm.get('payment_splits').get(ind.toString()).get('percentage').value;
    const control = _.cloneDeep(this.paymentForm.get('payment_splits').value);
    if (percentage >= 100) {
      control.forEach((elements, indexs) => {
        this.paymentForm.get('payment_splits').get(indexs.toString()).get('percentage').setValue(0);
      });
      this.paymentForm.get('payment_splits').get(ind.toString()).get('percentage').setValue(100);
    } else if (percentage < 0) {
      this.paymentForm.get('payment_splits').get(ind.toString()).get('percentage').setValue(0);
      this.recalculateDisc(ind);
    } else {
      const remainingPercentage = 100 - percentage;
      const termTotal = _.cloneDeep(this.parentSplitArray.controls.length);
      let balance = (remainingPercentage / (termTotal - 1)).toString();
      balance = parseFloat(balance).toFixed(2);
      balance = Math.round(parseInt(balance)).toString();
      let lastPercentage = 0;
      control.forEach((elements, indexs) => {
        if (indexs <= ind) {
          lastPercentage += elements.percentage;
        }
      });
      let lastPercentages = 0;
      control.forEach((elements, indexs) => {
        if (indexs < ind - 1) {
          lastPercentages += elements.percentage;
        }
      });
      control.forEach((element, index) => {
        if (index > ind) {
          balance = ((100 - lastPercentage) / (termTotal - (ind + 1))).toString();
          if (control.length - 1 === index) {
            let remainDisc = 0;
            if (termTotal - (ind + 1) !== 1 && ind !== 0) {
              if (termTotal - (ind + 1) !== 1) {
                const discTotal = parseInt(balance) * (termTotal - (ind + 2));
                remainDisc = 100 - (lastPercentage + discTotal);
              } else {
                remainDisc = 100 - lastPercentage;
              }
            } else if (ind === 0) {
              const discTotal = parseInt(balance) * (termTotal - 2);
              remainDisc = 100 - discTotal - percentage;
            } else {
              remainDisc = 100 - lastPercentage;
            }
            this.paymentForm.get('payment_splits').get(index.toString()).get('percentage').setValue(remainDisc);
          } else {
            this.paymentForm.get('payment_splits').get(index.toString()).get('percentage').setValue(parseInt(balance));
          }
        } else if (control.length - 1 === ind) {
          if (index !== ind) {
            if (index === ind - 1) {
              const discTotal = parseInt(balance) * (termTotal - 2);
              const remainingDisc = (100 - discTotal - percentage).toString();
              balance = (100 - (lastPercentages + percentage)).toString();
              this.paymentForm.get('payment_splits').get(index.toString()).get('percentage').setValue(parseInt(remainingDisc));
            } else {
              this.paymentForm.get('payment_splits').get(index.toString()).get('percentage').setValue(parseInt(balance));
            }
          }
        }
      });
    }
  }

  noWhitespace(value) {
    return (value || '').trim().length === 0;
  }

  refetch() {
    this.triggerRefresh.emit(this.formDetail.formId);
  }

  sendNotif(stepId) {
    this.subs.sink = this.formFillingService
      .sendPreviewFormBuilderStepNotification(this.userMainId, stepId, this.formDetail.formId, false)
      .subscribe(
        (resp) => {
          if (resp) {
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
          // stepId: '61e62d5a6680ee7d2b7bb205',
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
                  .subscribe(() => {
                    this.isWaitingForResponse = false;
                    this.triggerRefresh.emit(this.formDetail.formId);
                  });
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
  }
}
