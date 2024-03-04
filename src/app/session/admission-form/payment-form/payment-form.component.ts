import { Component, OnInit, OnDestroy, Input, OnChanges, ViewChild, ElementRef, Output } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AdmissionService } from 'app/service/admission/admission.service';
import { SchoolService } from 'app/service/schools/school.service';
import { RegistrationDialogComponent } from 'app/candidates/registration-dialog/registration-dialog.component';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UtilityService } from 'app/service/utility/utility.service';
import * as moment from 'moment';
import { MethodPaymentDialogComponent } from '../method-payment-dialog/method-payment-dialog.component';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { CoreService } from 'app/service/core/core.service';
import { CustomValidators } from 'ng2-validation';
import { EventEmitter } from '@angular/core';
import { environment } from 'environments/environment';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'ms-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
})
export class PaymentFormComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  @Input() candidateId = '';
  @Input() selectedIndex = 0;
  @Output() moveToTab = new EventEmitter<string>();
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
  isPaymentTypeFinish = false;
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
  emailSameAsStudent = false;
  isDiscountOnFullRate = false;

  paymentType;
  initialCostCoverage;
  invalidCost = false;
  studentAsFinancialSupport = false;
  minCostCoverage = false;
  maxCostCoverage = false;
  hasPaymentPlan = false;
  isValidate = false;
  disableButtonSave = [];
  disableButtonEmail = [];
  legalRepresentativeId: any;
  isForLegalRepresentative = false;
  isValidCostCoverageAfterRecalculate: boolean = true;

   // *************** START OF property to store data of country dial code
   flagsIconPath = '../../../../../assets/icons/flags-nationality/';
   @Input() countryCodeList: any[] = [];
   dialCodeArray = new UntypedFormArray([]);
   // *************** END OF property to store data of country dial code

  // Service
  constructor(
    private admissionService: AdmissionService,
    private schoolService: SchoolService,
    private translate: TranslateService,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private rncpTitleService: RNCPTitlesService,
    public coreService: CoreService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.legalRepresentativeId = this.route.snapshot.queryParamMap.get('legal_representative');

    this.initPayment();
    this.getOneCandidate();
    this.subs.sink = this.schoolService.getCountry().subscribe((list: any[]) => {
      this.countriesFinance = list;
      this.filteredCountryFinance = list;
      this.countryListFinance = list;
    });
  }

  ngOnChanges() {
    this.initPayment();
    if (this.selectedIndex === 2) {
      this.getOneCandidate();
    }
    this.isChangePaymentForm();
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  selectionDialCode(event, index) {
    this.financialSupportArray?.at(index)?.get('phone_number_indicative')?.reset();
    this.financialSupportArray?.at(index)?.get('phone_number_indicative')?.patchValue(event?.dialCode);
  }

  initPayment() {
    if (this.candidateData?.method_of_payment === 'transfer') {
      this.paymentForm = this.fb.group({
        account_holder_name: [null],
        iban: [null],
        bic: [null],
        cost: [null, Validators.required],
        autorization_account: [false],
        payment_supports: this.fb.array([]),
      });
    } else {
      this.paymentForm = this.fb.group({
        account_holder_name: [null, Validators.required],
        iban: [null, Validators.required],
        bic: [null, Validators.required],
        cost: [null, Validators.required],
        autorization_account: [false, Validators.requiredTrue],
        payment_supports: this.fb.array([]),
      });
    }
  }

  get financialSupportArray() {
    return this.paymentForm.get('payment_supports') as UntypedFormArray;
  }

  addFinancialSupport() {
    this.financialSupportArray.push(this.initFinancialSupport());
    this.dialCodeArray?.push(new UntypedFormControl(null, Validators.required));
    this.getCostCoverage();

    if (this.disableButtonEmail?.length && this.disableButtonSave?.length) {
      const findLastIndex = this.disableButtonEmail.length - 1;
      const form = {
        index: findLastIndex + 1,
        value: true,
      };

      const btnSave = {
        index: findLastIndex + 1,
        value: false,
      };

      this.disableButtonEmail.push(form);
      this.disableButtonSave.push(btnSave);
    } else {
      for (let index = 0; index < this.financialSupportArray.length; index++) {
        const form = {
          index,
          value: true,
        };

        const btnSave = {
          index,
          value: false,
        };
        this.disableButtonEmail.push(form);
        this.disableButtonSave.push(btnSave);
      }
    }
  }

  removeFinancialSupport(parentIndex: number) {
    this.financialSupportArray.removeAt(parentIndex);
    this.dialCodeArray.removeAt(parentIndex);
    this.getCostCoverage();

    this.disableButtonSave = this.disableButtonSave.filter((resp) => resp.index !== parentIndex);
    this.disableButtonEmail = this.disableButtonEmail.filter((resp) => resp.index !== parentIndex);
  }

  initFinancialSupport() {
    if (this.candidateData?.method_of_payment === 'transfer') {
      return this.fb.group({
        civility: [null, Validators.required],
        name: [null, Validators.required],
        family_name: [null, Validators.required],
        parent_address: this.fb.group({
          country: [null, Validators.required],
          city: [null, Validators.required],
          address: [null, Validators.required],
          additional_address: [null],
          postal_code: [null, Validators.required],
          department: [null],
          region: [null],
        }),
        relation: [null, Validators.required],
        tele_phone: [null, [Validators.required, Validators.pattern('[- ()0-9]+')]],
        phone_number_indicative: [null, Validators.required],
        email: [null, [Validators.required, CustomValidators.email, this.financialSupportEmailValidator.bind(this)]],
        account_holder_name: [null],
        iban: [null],
        bic: [null],
        cost: [null, Validators.required],
        autorization_account: [false],
      });
    } else {
      return this.fb.group({
        civility: [null, Validators.required],
        name: [null, Validators.required],
        family_name: [null, Validators.required],
        parent_address: this.fb.group({
          country: [null, Validators.required],
          city: [null, Validators.required],
          address: [null, Validators.required],
          additional_address: [null],
          postal_code: [null, Validators.required],
          department: [null],
          region: [null],
        }),
        relation: [null, Validators.required],
        tele_phone: [null, [Validators.required, Validators.pattern('[- ()0-9]+')]],
        phone_number_indicative: [null, Validators.required],
        email: [null, [Validators.required, CustomValidators.email, this.financialSupportEmailValidator.bind(this)]],
        account_holder_name: [null, Validators.required],
        iban: [null, Validators.required],
        bic: [null, Validators.required],
        cost: [null, Validators.required],
        autorization_account: [false, Validators.requiredTrue],
      });
    }
  }

  getOneCandidate() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.getCandidateAdmission(this.candidateId).subscribe(
      (resp) => {
        this.candidateData = _.cloneDeep(resp);
        if(this.candidateData?.finance || this.candidateData?.candidate_admission_status === 'engaged' || this.candidateData?.candidate_admission_status === 'registered') {
          this.dialCodeArray?.disable();
        };

        if (
          resp.personal_information === 'legal_representative' &&
          (this.legalRepresentativeId !== resp.legal_representative.unique_id) &&
          this.selectedIndex === 2
        ) {
          this.isForLegalRepresentative = true;
          this.showSwalLegalRepresentativeS1();
        }

        console.log('getOneCandidate', this.candidateData);
        this.profileRate = this.candidateData.registration_profile ? this.candidateData.registration_profile : null;
        this.getDownPaymentCandidate();
        if (this.candidateData.registration_profile.additional_cost_ids) {
          this.calculateRegistrationFees(this.candidateData.registration_profile.additional_cost_ids);
        }
        if (this.candidateData && this.candidateData.finance !== 'discount') {
          if (this.candidateData.finance === 'family' && (!this.candidateData.cost || this.candidateData.cost < 1)) {
            this.studentAsFinancialSupport = false;
            this.removeStudentValidator();
          } else {
            this.studentAsFinancialSupport = true;
            if (!this.isValidate) {
              this.populateStudentInformation(true);
            }
            if (this.candidateData?.method_of_payment !== 'transfer') {
              this.setStudentValidator();
            }
          }
        }
        if (this.candidateData && this.candidateData.payment_supports && this.candidateData.payment_supports.length) {
          this.financialSupportArray.clear();
          const dataForControl = [];
          const financialSupport = this.candidateData.payment_supports.map((list, idx) => {
            const findIdx = this.countryCodeList?.findIndex((country) => country?.dialCode === list?.phone_number_indicative);
            let tempDataCountry = this.countryCodeList[findIdx] ? this.countryCodeList[findIdx] : null;
            dataForControl?.push(tempDataCountry);
            return {
              civility: list.civility,
              name: list.name,
              family_name: list.family_name,
              parent_address: list.parent_address && list.parent_address.length ? list.parent_address[0] : [],
              relation: list.relation,
              tele_phone: list.tele_phone,
              phone_number_indicative: list?.phone_number_indicative,
              email: list.email,
              account_holder_name: list.account_holder_name,
              iban: list.iban,
              bic: list.bic,
              cost: list.cost ? parseFloat(list.cost) : 0,
              autorization_account: list.autorization_account,
            };
          });
          financialSupport.forEach((element) => {
            this.addFinancialSupport();
          });
          this.paymentForm.get('payment_supports').patchValue(financialSupport);
          this.dialCodeArray.patchValue(dataForControl);
        }
        if (this.candidateData && this.candidateData.finance) {
          this.paymentType = this.candidateData.finance;
        }
        if (
          this.candidateData &&
          (this.candidateData?.method_of_payment === 'credit_card' || this.candidateData?.method_of_payment === 'sepa')
        ) {
          this.creditCardSelected = true;
        } else {
          this.creditCardSelected = false;
        }
        // validation for isPaymentPlanFinish
        if (
          this.candidateData &&
          this.candidateData?.method_of_payment &&
          this.candidateData?.method_of_payment !== 'not_done' &&
          this.candidateData.selected_payment_plan &&
          this.candidateData.selected_payment_plan.name
        ) {
          this.isPaymentPlanFinish = true;
          this.hasPaymentPlan = true;
        }
        if (this.candidateData && this.candidateData.selected_payment_plan && this.candidateData.selected_payment_plan.total_amount) {
          this.initialCostCoverage = this.candidateData.selected_payment_plan.total_amount;
        } else {
          this.initialCostCoverage = 0;
        }
        this.isChangePaymentForm();
        this.getCostCoverage();
        this.isWaitingForResponse = false;
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
              this.moveToTab.emit(tabValid);
              console.log(tabValid);
            }
          }
        });
      },
    );
  }

  isChangePaymentForm() {
    this.subs.sink = this.admissionService.paymentForm.subscribe((val) => {
      console.log('isChangePaymentForm', val);
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
          if (this.candidateData.registration_profile_type) {
            if (this.candidateData?.registration_profile_type === 'internal') {
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
            this.candidateData.registration_profile &&
            this.candidateData.registration_profile.is_down_payment &&
            this.candidateData.registration_profile.is_down_payment === 'other'
          ) {
            const dp = this.candidateData?.registration_profile?.other_amount ? this.candidateData.registration_profile.other_amount : 0;
            this.depositAmount = dp;
          } else if (
            this.candidateData.registration_profile &&
            this.candidateData.registration_profile.is_down_payment &&
            this.candidateData.registration_profile.is_down_payment === 'dp_additional_cost'
          ) {
            const dp = this.candidateData?.registration_profile?.dp_additional_cost_amount
              ? this.candidateData.registration_profile.dp_additional_cost_amount
              : 0;
            this.depositAmount = dp;
          } else if (
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
                  this.candidateData.registration_profile.discount_on_full_rate
                    ? this.candidateData.registration_profile.discount_on_full_rate
                    : 0;
                console.log(discountPercent);
                this.discount = discountPercent;
                if (this.candidateData.registration_profile_type) {
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
                    this.moveToTab.emit(tabValid);
                    console.log(tabValid);
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
              this.moveToTab.emit(tabValid);
              console.log(tabValid);
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
    console.log('this.profileRate', this.isAdditionalAsDp, this.profileRate);
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
                  return {
                    amount: (data.additional_cost + rate + additional - dp) * (list.percentage / 100),
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
      console.log('List Terms', this.listTerms, this.depositAmount, this.rateAmount, this.maxTotalTime);
    } else {
      this.listTerms = [
        {
          name: 'None',
          additional_expense: additional,
          down_payment: this.isAdditionalAsDp ? this.profileRate.dp_additional_cost_amount : dp,
          total_amount: rate + additional,
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

  openPopUpWhite(data, type, payloadFinal?) {
    const payload = _.cloneDeep(this.candidateData);
    delete payload._id;
    delete payload.candidate_name;
    delete payload.relation_bank;
    delete payload.finance;
    delete payload.already_started;
    this.isWaitingForResponse = false;
    this.subs.sink = this.dialog
      .open(MethodPaymentDialogComponent, {
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
          paymentPlan: payloadFinal ? payloadFinal : null,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        console.log('resp payment', resp);
        if (resp.type === 'reset' && resp.data === 'confirmTiga') {
          if (resp.method_of_payment === 'credit_card' || resp.method_of_payment === 'sepa') {
            this.creditCardSelected = true;
          } else if (resp.method_of_payment === 'transfer') {
            this.candidateData['method_of_payment'] = 'transfer';
            this.creditCardSelected = false;
            this.paymentForm.get('autorization_account').patchValue(false);
            this.paymentForm.get('iban').patchValue('');
            this.paymentForm.get('bic').patchValue('');
            this.removeStudentValidator();
          } else {
            this.creditCardSelected = false;
            this.paymentForm.get('autorization_account').patchValue(false);
            this.paymentForm.get('iban').patchValue('');
            this.paymentForm.get('bic').patchValue('');
          }
          this.isPaymentPlanFinish = true;
          this.hasPaymentPlan = true;
          this.paymentForm.patchValue(this.candidateData);
          this.getOneCandidate();
        } else if (resp.type === 'cancel' && resp.data === 'confirmTiga') {
          this.isPaymentPlanFinish = false;
          this.hasPaymentPlan = false;
          this.paymentForm.patchValue(this.candidateData);
        }
      });
  }

  openPopUp(data, type) {
    const dataStepTwo = _.cloneDeep(this.candidateData);
    dataStepTwo.rate_amount = this.rateAmount;
    dataStepTwo.deposit_amount = this.depositAmount;
    dataStepTwo.payment_plan = this.paymentForm.get('selected_payment_plan').value;
    dataStepTwo.method_dp = data;
    this.candidateData = dataStepTwo;
    this.subs.sink = this.dialog
      .open(RegistrationDialogComponent, {
        width: '355px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          type: type,
          data: data,
          depositAmount: this.depositAmount,
          rateAmount: this.rateAmount,
          candidateId: this.candidateId,
          modify: this.candidateData,
        },
      })
      .afterClosed()
      .subscribe((resp) => {

        if (resp.type === 'cancel' && resp.data === 'confirmOne') {
          this.paymentForm.get('relation_bank').setValue(false);
          this.paymentForm.get('already_started').setValue(false);
        } else if (resp.type === 'reset' && resp.data === 'confirmOne') {
          this.openPopUpValidation(3, 'stepValidation');
        } else if (resp.type === 'reset' && resp.data === 'confirmTwo') {
          this.openPopUpValidation(3, 'stepValidation');
        } else if (resp.type === 'cancel' && resp.data === 'confirmTwo') {
        }
      });
  }

  identityUpdated() {
    this.openPopUpValidation(3, 'stepValidation');
  }

  openPopUpValidation(data, type, payload?) {
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
          rateAmount: this.rateAmount,
          candidateId: this.candidateData._id,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        this.isValidate = false;
        this.isWaitingForResponse = true;
        if (resp.type === 'reset') {
          this.isWaitingForResponse = true;

          this.subs.sink = this.admissionService.UpdateCandidateForm(this.candidateData._id, payload).subscribe(
            (resp) => {
              this.admissionService.setIndexStep(3);
              this.admissionService.setStatusStepTwo(true);
              this.isWaitingForResponse = false;
              if (resp) {
                this.isValidate = true;
                this.candidateData = resp;
                this.admissionService.setDataCandidate(resp);
                if (this.candidateData && this.candidateData.finance !== 'discount') {
                  if (this.candidateData.finance === 'family' && (!this.candidateData.cost || this.candidateData.cost < 1)) {
                    this.studentAsFinancialSupport = false;
                    this.removeStudentValidator();
                  } else {
                    this.studentAsFinancialSupport = true;
                    if (!this.isValidate) {
                      this.populateStudentInformation(true);
                    }
                    if (this.candidateData?.method_of_payment !== 'transfer') {
                      this.setStudentValidator();
                    }
                  }
                }
              } else {
                this.isWaitingForResponse = false;
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
                }).then((res) => {
                  if (res.value) {
                    const errorTab = err && err['message'] ? err['message'].replaceAll('GraphQL error: ', '') : err;
                    if (errorTab.includes('Cannot edit data outside current step, please complete form on current step: ')) {
                      const tabValid = errorTab.replace(
                        'Cannot edit data outside current step, please complete form on current step: ',
                        '',
                      );
                      this.moveToTab.emit(tabValid);
                      console.log(tabValid);
                    }
                  }
                });
              }
            },
          );
        } else if (resp.type === 'cancel') {
          this.isWaitingForResponse = false;
        } else{
          this.isWaitingForResponse = false;
          this.admissionService.setStatusStepTwo(true);
        }
      });
  }

  checkInvalidFieldPaymentSupports() {
    let invalidField;
    for (const control of this.financialSupportArray.controls) {
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

  financialSupportEmailValidator(c: AbstractControl): { [key: string]: boolean } | null {
    const email = this.candidateData.email;
    if (c.value && email && c.value === email) {
      return { emailSame: true };
    } else {
      return null;
    }
  }

  checkEmailPaymentSupportsSameAsStudent() {
    let invalidField;
    for (const control of this.financialSupportArray.controls) {
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
          if (control.hasError('emailSame')) {
            invalidControls.push(field);
          }
        } else {
          if (control.hasError('email')) {
            invalidControls.push(field);
          }
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
    if (this.financialSupportArray) {
      return {
        'has-error': this.isFieldValid(field, formIndex, isAddressField),
      };
    }
  }

  toggleValidationStyleDialCode(field: string, formIndex: number, isAddressField = false) {
    return {
      'has-error-dialcode': isAddressField
      ? (this.paymentForm.get('payment_supports') as UntypedFormArray).at(formIndex).get('parent_address').get(field).invalid &&
          (this.paymentForm.get('payment_supports') as UntypedFormArray).at(formIndex).get('parent_address').get(field).touched
      : (this.paymentForm.get('payment_supports') as UntypedFormArray).at(formIndex).get(field).invalid &&
          (this.paymentForm.get('payment_supports') as UntypedFormArray).at(formIndex).get(field).touched,
    };
  }

  compareEmailWithStudent(formIndex) {
    const currentEmail = this.financialSupportArray.at(formIndex).get('email').value;
    const studentEmail = this.candidateData.email;
    if (currentEmail === studentEmail) {
      this.financialSupportArray.at(formIndex).get('email').setErrors({ emailSame: true });
    }
  }

  selectPlanning(data) {
    const totalAmount = parseFloat(data.total_amount.toFixed(2));
    this.isWaitingForResponse = true;
    const dates = data.payment_date.map((list) => {
      return {
        date: list.date,
        amount: parseFloat(list.amount.toFixed(2)),
        percentage: parseFloat(((list.amount / totalAmount) * 100).toFixed(2)),
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
    const payloadFinal = {
      cost: payload.total_amount ? parseFloat(payload.total_amount.toFixed(2)) : 0,
      finance: null,
      selected_payment_plan: payload,
      payment_supports: [],
    };
    if (data && data.name === 'None') {
      payloadFinal.finance = 'discount';
    }
    console.log('payload', payloadFinal);
    console.log('candidate Data', this.candidateData);
    if (data && data.name === 'None') {
      this.openPopUpValidation(3, 'stepValidation');
    } else {
      this.openPopUpWhite(data, 'confirmTiga', payloadFinal);
    }
    // this.subs.sink = this.admissionService.UpdateCandidateForm(this.candidateData._id, payloadFinal).subscribe(
    //   (resp) => {
    //     console.log('uat467 select planning',resp)
    //     this.isWaitingForResponse = false;
    //     this.candidateData = resp;

    //     if (data && data.name === 'None') {
    //       this.openPopUpValidation(3, 'stepValidation');
    //     } else {
    //       this.openPopUpWhite(data, 'confirmTiga');
    //     }
    //   },
    //   (err) => {
    //     this.isWaitingForResponse = false;
    //     if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
    //       Swal.fire({
    //         type: 'info',
    //         title: this.translate.instant('LEGAL_S5.Title'),
    //         text: this.translate.instant('LEGAL_S5.Text'),
    //         confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
    //       });
    //     } else {
    //       Swal.fire({
    //         type: 'info',
    //         title: this.translate.instant('SORRY'),
    //         text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
    //         confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
    //       }).then((res) => {
    //         if (res.value) {
    //           const errorTab = err && err['message'] ? err['message'].replaceAll('GraphQL error: ', '') : err;
    //           if (errorTab.includes('Cannot edit data outside current step, please complete form on current step: ')) {
    //             const tabValid = errorTab.replace('Cannot edit data outside current step, please complete form on current step: ', '');
    //             this.moveToTab.emit(tabValid);
    //             console.log(tabValid);
    //           }
    //         }
    //       });
    //     }
    //   },
    // );
  }

  noPayment() {
    this.isWaitingForResponse = true;
    const payloadFinal = this.createPayload();
    const terms = this.listTerms && this.listTerms.length ? this.listTerms[0] : null;
    const payload = {
      name: '',
      total_amount: terms ? terms.total_amount : 0,
      times: terms ? terms.times : 0,
      additional_expense: terms ? terms.additional_expense : 0,
      payment_mode_id: terms ? terms.payment_mode_id : null,
      down_payment: terms ? terms.down_payment : 0,
      payment_date: [],
    };
    payloadFinal.selected_payment_plan = payload;
    payloadFinal.finance = 'discount';
    if (payloadFinal) {
      this.openPopUpValidation(3, 'stepValidation', payloadFinal);
    }
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

  onChoosePaymentType(type) {
    this.paymentForm.markAsPristine();
    this.paymentForm.markAsUntouched();
    this.paymentType = type;
    console.log(this.paymentType);
    if (this.paymentType === 'my_self') {
      while (this.financialSupportArray.length !== 0) {
        this.financialSupportArray.removeAt(0);
      }
      this.paymentForm.get('cost').setValue(this.initialCostCoverage);
      this.studentAsFinancialSupport = true;
      if (this.candidateData?.method_of_payment !== 'transfer') {
        this.setStudentValidator();
      }
    } else if (this.paymentType === 'family') {
      this.paymentForm.get('cost').setValue(0);
      this.financialSupportArray.reset();
      this.studentAsFinancialSupport = false;
      this.removeStudentValidator();
    }
    this.paymentForm.get('autorization_account').setValue(false);
    this.populateStudentInformation();
  }

  populateStudentInformation(init?) {
    this.paymentForm.get('account_holder_name').setValue(this.candidateData.account_holder_name);
    this.paymentForm.get('iban').setValue(this.candidateData.iban);
    this.paymentForm.get('bic').setValue(this.candidateData.bic);
    if (init) {
      this.paymentForm.get('autorization_account').setValue(this.candidateData.autorization_account);
    }
  }

  modifyPaymentType() {
    if (!this.hasPaymentPlan) {
      this.paymentType = null;
    }
    this.isPaymentTypeFinish = false;
    this.isPaymentPlanFinish = false;
  }
  goToModality() {
    if (this.hasPaymentPlan) {
      this.isPaymentPlanFinish = true;
    }
  }

  submitPaymentType() {
    this.admissionService.setPaymentForm(this.paymentForm.getRawValue());
    this.openPopUpValidation(3, 'stepValidation');
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  validateFamily() {
    const invalidEmailFormat = this.checkInvalidFieldPaymentSupports();
    const isEmailSameAsStudent = this.checkEmailPaymentSupportsSameAsStudent();
    if (isEmailSameAsStudent) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Followup_S13s.Title'),
        html: this.translate.instant('Followup_S13s.Text'),
        confirmButtonText: this.translate.instant('Followup_S13s.Button'),
      });
      this.paymentForm.markAllAsTouched();
      return;
    } else if (invalidEmailFormat) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Format.Title'),
        html: this.translate.instant('Invalid_Format.Text'),
        confirmButtonText: this.translate.instant('Invalid_Format.Button'),
      });
      this.paymentForm.markAllAsTouched();
      return;
    } else if (!this.checkInvalidPaymentForm()) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.paymentForm.markAllAsTouched();
      this.dialCodeArray?.markAllAsTouched();
      return;
    } else if (this.checkFormValidity()) {
      return;
    }
    const payload = this.createPayload();
    this.isWaitingForResponse = true;
    if (payload) {
      this.openPopUpValidation(3, 'stepValidation', payload);
    }
  }

  validateMyself() {
    if (this.checkFormValidity()) {
      return;
    } else if (!this.checkInvalidPaymentForm()) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.paymentForm.markAllAsTouched();
      this.dialCodeArray?.markAllAsTouched();
      return;
    }
    const payload = this.createPayload();
    this.isWaitingForResponse = true;
    if (payload) {
      this.openPopUpValidation(3, 'stepValidation', payload);
    }
  }

  createPayload() {
    const temp = _.cloneDeep(this.paymentForm.value);
    if (!this.studentAsFinancialSupport) {
      delete temp.account_holder_name;
      delete temp.cost;
      delete temp.bic;
      delete temp.iban;
      delete temp.autorization_account;
    }
    if (temp && temp.payment_supports && temp.payment_supports.length) {
      temp.payment_supports = temp.payment_supports.map((list) => {
        return {
          ...list,
          cost: list.cost ? parseFloat(list.cost) : 0,
          financial_support_status: 'pending',
        };
      });
    }
    const payload = {
      ...temp,
      finance: this.paymentType,
      cost: temp.cost ? parseFloat(temp.cost) : 0,
      // selected_payment_plan: this.payloadPaymentPlan && this.payloadPaymentPlan.selected_payment_plan?this.payloadPaymentPlan.selected_payment_plan:null,
      // method_of_payment:this.payloadMethod && this.payloadMethod.method_of_payment? this.payloadMethod.method_of_payment :null
    };
    return payload;
  }

  getPostcodeData(index) {
    const country = this.financialSupportArray.at(index).get('parent_address').get('country').value;
    const postCode = this.financialSupportArray.at(index).get('parent_address').get('postal_code').value;

    if (postCode && country && postCode.length > 3 && country.toLowerCase() === 'france') {
      this.subs.sink = this.rncpTitleService.getFilteredZipCode(postCode, country).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.setAddressDropdown(resp, index);

            this.financialSupportArray.at(index).get('parent_address').get('city').setValue(this.cities[index][0]);
            this.financialSupportArray.at(index).get('parent_address').get('department').setValue(this.departments[index][0]);
            this.financialSupportArray.at(index).get('parent_address').get('region').setValue(this.regions[index][0]);
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
  }

  noWhitespace(value) {
    return (value || '').trim().length === 0;
  }

  noWhitespaceValidator(control: UntypedFormControl) {
    return (control.value || '').trim().length === 0;
  }

  setAddressDropdown(resp: any, parentIndex: number) {
    const tempCities = [];
    const tempDepartments = [];
    const tempRegions = [];

    if (resp && resp.length) {
      resp.forEach((address) => {
        tempCities.push(address.city);
        tempDepartments.push(address.department);
        tempRegions.push(address.province);
      });

      this.cities[parentIndex] = _.uniq(tempCities);
      this.departments[parentIndex] = _.uniq(tempDepartments);
      this.regions[parentIndex] = _.uniq(tempRegions);

      this.filteredCities[parentIndex] = this.cities[parentIndex];
      this.filteredDepartments[parentIndex] = this.departments[parentIndex];
      this.filteredRegions[parentIndex] = this.regions[parentIndex];
    }
  }

  getCostCoverage() {
    const data = _.cloneDeep(this.financialSupportArray.value);
    let costCoverage = this.initialCostCoverage;
    let max = 0;
    this.maxCostCoverage = false;
    this.minCostCoverage = false;
    if (this.studentAsFinancialSupport) {
      if (data && data.length) {
        data.forEach((element) => {
          if (element.cost) {
            costCoverage = costCoverage - element.cost;
            if (costCoverage < 0) {
              this.invalidCost = true;
            } else {
              this.invalidCost = false;
            }
          } else {
            this.invalidCost = false;
          }
        });
      }
      if (costCoverage >= 0) {
        this.paymentForm.get('cost').setValue(costCoverage.toFixed(2));
        if(costCoverage < 20) {
          this.isValidCostCoverageAfterRecalculate = false;
        } else {
          this.isValidCostCoverageAfterRecalculate = true;
        }
      } else {
        this.paymentForm.get('cost').setValue(0);
        this.isValidCostCoverageAfterRecalculate = false;
      }
    } else {
      if (data && data.length) {
        data.forEach((element) => {
          if (element.cost) {
            max = max + element.cost;
            if (max < costCoverage) {
              this.minCostCoverage = true;
              this.maxCostCoverage = false;
            } else if (max > costCoverage) {
              this.minCostCoverage = false;
              this.maxCostCoverage = true;
            } else {
              this.minCostCoverage = false;
              this.maxCostCoverage = false;
            }
          } else {
            this.minCostCoverage = true;
            this.maxCostCoverage = false;
          }
        });
      }
    }
    this.checkInvalidValue();
  }

  checkInvalidValue() {
    if (this.minCostCoverage) {
      this.minCostCoverage = true;
      this.maxCostCoverage = false;
      this.invalidCost = false;
    } else if (this.maxCostCoverage) {
      this.minCostCoverage = false;
      this.maxCostCoverage = true;
      this.invalidCost = false;
    } else if (this.invalidCost) {
      this.minCostCoverage = false;
      this.maxCostCoverage = false;
      this.invalidCost = true;
    } else {
      this.minCostCoverage = false;
      this.maxCostCoverage = false;
      this.invalidCost = false;
    }
  }

  decimalFilter(event: any) {
    const reg = /^-?\d*[.,]?\d{0,2}$/;
    const input = event.target.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }
  addStudent() {
    this.studentAsFinancialSupport = true;
    this.paymentForm.markAsPristine();
    this.paymentForm.markAsUntouched();
    if (this.candidateData?.method_of_payment !== 'transfer') {
      this.setStudentValidator();
    }
    this.getCostCoverage();
  }

  removeStudent() {
    this.studentAsFinancialSupport = false;
    this.isValidCostCoverageAfterRecalculate = true;
    this.paymentForm.markAsPristine();
    this.paymentForm.markAsUntouched();
    this.removeStudentValidator();
    this.getCostCoverage();
    this.paymentForm.get('autorization_account').setValue(false);
  }

  setStudentValidator() {
    this.paymentForm.get('account_holder_name').setValidators(Validators.required);
    this.paymentForm.get('cost').setValidators(Validators.required);
    this.paymentForm.get('iban').setValidators(Validators.required);
    this.paymentForm.get('bic').setValidators(Validators.required);
    this.paymentForm.get('autorization_account').setValidators(Validators.requiredTrue);
    this.paymentForm.updateValueAndValidity();
  }

  removeStudentValidator() {
    this.paymentForm.get('account_holder_name').clearValidators();
    this.paymentForm.get('account_holder_name').setErrors(null);
    this.paymentForm.get('account_holder_name').updateValueAndValidity();
    this.paymentForm.get('cost').clearValidators();
    this.paymentForm.get('cost').setErrors(null);
    this.paymentForm.get('cost').updateValueAndValidity();
    this.paymentForm.get('iban').clearValidators();
    this.paymentForm.get('iban').setErrors(null);
    this.paymentForm.get('iban').updateValueAndValidity();
    this.paymentForm.get('bic').clearValidators();
    this.paymentForm.get('bic').setErrors(null);
    this.paymentForm.get('bic').updateValueAndValidity();
    this.paymentForm.get('autorization_account').clearValidators();
    this.paymentForm.get('autorization_account').setErrors(null);
    this.paymentForm.get('autorization_account').updateValueAndValidity();
  }
  checkFSCostCoverage() {
    const form = this.paymentForm.value;
    let invalidCostCoverage = false;
    if (form.payment_supports?.length) {
      form.payment_supports.forEach((fs) => {
        const value = fs.cost ? fs.cost : 0;
        if (value < 20) {
          invalidCostCoverage = true;
        }
      });
    }
    return invalidCostCoverage;
  }
  checkFormValidity(): boolean {
    if (this.checkFSCostCoverage() || this.minCostCoverage || this.maxCostCoverage || this.invalidCost || this.paymentForm.invalid || !this.isValidCostCoverageAfterRecalculate || this.dialCodeArray?.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.paymentForm.markAllAsTouched();
      this.dialCodeArray?.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  openCGV() {
    if (
      this.candidateData &&
      this.candidateData.intake_channel &&
      this.candidateData.intake_channel.admission_document &&
      this.candidateData.intake_channel.admission_document.s3_file_name
    ) {
      const a = document.createElement('a');
      a.target = '_blank';
      a.href =
        `${environment.apiUrl}/fileuploads/${this.candidateData.intake_channel.admission_document.s3_file_name}?download=true`.replace(
          '/graphql',
          '',
        );
      a.download = this.candidateData.intake_channel.admission_document.s3_file_name;
      a.click();
      a.remove();
    }
  }

  checkCountry(addressIndex: string) {
    const searchString = this.paymentForm.get('payment_supports').get(addressIndex).get('parent_address').get('country').value
      ? this.paymentForm.get('payment_supports').get(addressIndex).get('parent_address').get('country').value.toLowerCase().trim()
      : '';
    const find = this.countriesFinance.filter((country) => country.name.toLowerCase().trim().includes(searchString));
    if (find && find.length === 1) {
      this.paymentForm.get('payment_supports').get(addressIndex).get('parent_address').get('country').setValue(find[0].name);
    } else {
      this.paymentForm.get('payment_supports').get(addressIndex).get('parent_address').get('country').setValue(null);
    }
  }

  checkInvalidPaymentForm() {
    let isValidatePayment = true;
    const paymentForm = this.paymentForm?.value;
    console.log('paymentForm', paymentForm);
    if (this.candidateData?.method_of_payment !== 'transfer') {
      if (paymentForm?.finance === 'my_self') {
        if (!paymentForm?.account_holder_name) {
          isValidatePayment = false;
        } else if (!paymentForm?.iban) {
          isValidatePayment = false;
        } else if (!paymentForm?.bic) {
          isValidatePayment = false;
        } else if (!paymentForm?.cost) {
          isValidatePayment = false;
        } else if (!paymentForm?.autorization_account) {
          isValidatePayment = false;
        }
      } else if (paymentForm?.finance === 'family') {
        if (this.studentAsFinancialSupport) {
          if (!paymentForm?.account_holder_name) {
            isValidatePayment = false;
          } else if (!paymentForm?.iban) {
            isValidatePayment = false;
          } else if (!paymentForm?.bic) {
            isValidatePayment = false;
          } else if (!paymentForm?.cost) {
            isValidatePayment = false;
          } else if (!paymentForm?.autorization_account) {
            isValidatePayment = false;
          }
        }
        const paymentSupport = paymentForm?.payment_supports;
        if (paymentSupport?.length) {
          paymentSupport.forEach((fs) => {
            if (!fs?.civility) {
              isValidatePayment = false;
            } else if (!fs?.name) {
              isValidatePayment = false;
            } else if (!fs?.family_name) {
              isValidatePayment = false;
            } else if (!fs?.parent_address?.address) {
              isValidatePayment = false;
            } else if (!fs?.parent_address?.postal_code) {
              isValidatePayment = false;
            } else if (!fs?.parent_address?.city) {
              isValidatePayment = false;
            } else if (!fs?.parent_address?.country) {
              isValidatePayment = false;
            } else if (!fs?.email) {
              isValidatePayment = false;
            } else if (!fs?.tele_phone) {
              isValidatePayment = false;
            } else if (!fs?.relation) {
              isValidatePayment = false;
            } else if (!fs?.account_holder_name) {
              isValidatePayment = false;
            } else if (!fs?.iban) {
              isValidatePayment = false;
            } else if (!fs?.bic) {
              isValidatePayment = false;
            } else if (!fs?.cost) {
              isValidatePayment = false;
            } else if (!fs?.autorization_account) {
              isValidatePayment = false;
            }
          });
        }
      }
    }
    return isValidatePayment;
  }

  formatCurrency(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
    }
    return num;
  }

  checkEmailUnique(formControl, indexSelected) {
    this.subs.sink = formControl.valueChanges.pipe(debounceTime(400)).subscribe((resp) => {
      if (resp) {
        this.disableButtonSave = this.disableButtonSave.map((ele) => {
          if (ele?.index === indexSelected) {
            ele.value = true;
          }
          return ele;
        });

        this.disableButtonEmail = this.disableButtonEmail.map((ele) => {
          if (ele?.index === indexSelected) {
            ele.value = false;
          }
          return ele;
        });
      }
    });
  }

  disableButtonEmailNotValidated(selectedIndex) {
    const found = this.disableButtonEmail.find((resp) => {
      if (resp?.index === selectedIndex) {
        return resp;
      }
    });
    if (found) {
      return found?.value;
    } else {
      return true;
    }
  }

  checkEmailNotValidated() {
    const found = this.disableButtonSave.find((resp) => resp.value);
    if (found) {
      return found.value;
    } else {
      return false;
    }
  }

  verifyEmail(email, indexForm) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.verifyEmailUnique(email).subscribe(
      () => {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo'),
          confirmButtonText: this.translate.instant('OK'),
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          this.isWaitingForResponse = false;
          this.disableButtonSave = this.disableButtonSave.map((resp) => {
            if (resp?.index === indexForm) {
              resp.value = false;
            }
            return resp;
          });

          this.disableButtonEmail = this.disableButtonEmail.map((resp) => {
            if (resp?.index === indexForm) {
              resp.value = true;
            }
            return resp;
          });
        });
      },
      (err) => {
        this.isWaitingForResponse = false;
        if (err['message'] === 'GraphQL error: Email already exists') {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('SWAL_USER_EXIST_DUMMY.TITLE'),
            text: this.translate.instant('SWAL_USER_EXIST_DUMMY.TEXT'),
            confirmButtonText: this.translate.instant('SWAL_USER_EXIST_DUMMY.BUTTON'),
          }).then(() => {
            this.disableButtonSave = this.disableButtonSave.map((resp) => {
              if (resp?.index === indexForm) {
                resp.value = true;
              }
              return resp;
            });

            this.disableButtonEmail = this.disableButtonEmail.map((resp) => {
              if (resp?.index === indexForm) {
                resp.value = false;
              }
              return resp;
            });
          });
        }
      },
    );
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
