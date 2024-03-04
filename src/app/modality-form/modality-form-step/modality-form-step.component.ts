import { Component, OnInit, OnDestroy, Input, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AdmissionService } from 'app/service/admission/admission.service';
import { SchoolService } from 'app/service/schools/school.service';
import { RegistrationDialogComponent } from 'app/candidates/registration-dialog/registration-dialog.component';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { CoreService } from 'app/service/core/core.service';
import { CustomValidators } from 'ng2-validation';
import { environment } from 'environments/environment';
import { CountryService } from 'app/shared/services/country.service';

@Component({
  selector: 'ms-modality-form-step',
  templateUrl: './modality-form-step.component.html',
  styleUrls: ['./modality-form-step.component.scss'],
})
export class ModalityFormStepComponent implements OnInit, OnDestroy, OnChanges {
  @Input() candidateId = '';
  @Input() selectedIndex = 0;
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
    private countryService: CountryService
  ) {}

  ngOnInit() {
    this.initPayment();
    this.getOneCandidate();
    this.subs.sink = this.schoolService.getCountry().subscribe((list: any[]) => {
      this.countriesFinance = list;
      this.filteredCountryFinance = list;
      this.countryListFinance = list;
    });
  }

  ngOnChanges() {
    this.isChangePaymentForm();
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
    this.dialCodeArray?.push(new UntypedFormControl(null));
    this.getCostCoverage();
  }

  removeFinancialSupport(parentIndex: number) {
    this.financialSupportArray.removeAt(parentIndex);
    this.dialCodeArray.removeAt(parentIndex);
    this.getCostCoverage();
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
        email: [null, [Validators.required, CustomValidators.email]],
        account_holder_name: [null],
        iban: [null],
        bic: [null],
        cost: [null],
        _id: [null],
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
        email: [null, [Validators.required, CustomValidators.email]],
        account_holder_name: [null, Validators.required],
        iban: [null, Validators.required],
        bic: [null, Validators.required],
        cost: [null],
        _id: [null],
        autorization_account: [false, Validators.requiredTrue],
      });
    }
  }

  getOneCandidate() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.getCandidateAdmission(this.candidateId).subscribe(
      (resp) => {
        this.candidateData = _.cloneDeep(resp);
        this.profileRate = this.candidateData.registration_profile ? this.candidateData.registration_profile : null;
        if (this.candidateData.registration_profile.additional_cost_ids) {
          this.calculateRegistrationFees(this.candidateData.registration_profile.additional_cost_ids);
        }
        if (this.candidateData && this.candidateData.finance !== 'discount') {
          if (this.candidateData.finance === 'family' && (!this.candidateData.cost || this.candidateData.cost < 1)) {
            this.studentAsFinancialSupport = false;
            this.removeStudentValidator();
          } else {
            this.studentAsFinancialSupport = true;
            this.populateStudentInformation(true);
            if (this.candidateData?.method_of_payment !== 'transfer') {
              this.setStudentValidator();
            }
          }
        }
        const dataForControl = [];
        if (this.candidateData && this.candidateData.payment_supports && this.candidateData.payment_supports.length) {
          this.financialSupportArray.clear();
          const financialSupport = this.candidateData.payment_supports.map((list, idx) => {
            return {
              _id: list._id,
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
        }
        this.subs.sink = this.countryService.isAllCountryAlreadyPopulated$.subscribe((resp) => {
          if(resp) {
            this.candidateData.payment_supports?.forEach((dataFS) => {
              const findIdx = this.countryCodeList?.findIndex((country) => country?.dialCode === dataFS?.phone_number_indicative)
              let tempData = this.countryCodeList[findIdx] ? this.countryCodeList[findIdx] : null;
              dataForControl?.push(tempData);
            })
            this.dialCodeArray.patchValue(dataForControl);
          }
        })
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
          type: 'error',
          title: 'Error',
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        }).then((res) => {
          if (res.value) {
            const errorTab = err && err['message'] ? err['message'].replaceAll('GraphQL error: ', '') : err;
            if (errorTab.includes('Cannot edit data outside current step, please complete form on current step: ')) {
              const tabValid = errorTab.replace('Cannot edit data outside current step, please complete form on current step: ', '');
              console.log(tabValid);
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

  openPopUpValidation(payload?) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.UpdateModalityForm(this.candidateData._id, payload).subscribe(
      (respCandidate) => {
        this.isWaitingForResponse = false;
        if (respCandidate) {
          this.candidateData = respCandidate;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            allowOutsideClick: false,
            confirmButtonText: this.translate.instant('CANDIDAT_S4.BUTTON'),
          }).then((resss) => {
            this.admissionService.setStatusStepOne(true);
            this.admissionService.setDataCandidate(respCandidate);
          });
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('Followup_S17.Title'),
            text: this.translate.instant('Followup_S17.Text'),
            confirmButtonText: this.translate.instant('Followup_S17.Button'),
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
            type: 'error',
            title: 'Error',
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          }).then((res) => {
            if (res.value) {
              const errorTab = err && err['message'] ? err['message'].replaceAll('GraphQL error: ', '') : err;
              if (errorTab.includes('Cannot edit data outside current step, please complete form on current step: ')) {
                const tabValid = errorTab.replace('Cannot edit data outside current step, please complete form on current step: ', '');
                console.log(tabValid);
              }
            }
          });
        }
      },
    );
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
    const invalidControls: string[] = [];
    const recursiveFunc = (form: UntypedFormGroup | UntypedFormArray) => {
      Object.keys(form.controls).forEach((field) => {
        const control = form.get(field);
        if (control.hasError('email')) {
          invalidControls.push(field);
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

  calculateRegistrationFees(datas) {
    let fees = 0;
    if (datas && datas.length) {
      datas.forEach((fee) => {
        fees = fees + fee.amount;
      });
      this.registrationFee = fees;
    }
  }

  populateStudentInformation(init?) {
    this.paymentForm.get('account_holder_name').setValue(this.candidateData.account_holder_name);
    this.paymentForm.get('iban').setValue(this.candidateData.iban);
    this.paymentForm.get('bic').setValue(this.candidateData.bic);
    if (init) {
      this.paymentForm.get('autorization_account').setValue(this.candidateData.autorization_account);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  validateFamily() {
    if (this.checkFormValidity()) {
      return;
    }
    const payload = this.createPayload();
    console.log('Payload =>', payload);
    this.isWaitingForResponse = true;
    if (payload) {
      this.openPopUpValidation(payload);
    }
  }

  validateMyself() {
    if (this.checkFormValidity()) {
      return;
    }
    const payload = this.createPayload();
    console.log('Payload =>', payload);
    this.isWaitingForResponse = true;
    if (payload) {
      this.openPopUpValidation(payload);
    }
  }

  createPayload() {
    const temp = _.cloneDeep(this.paymentForm.value);
    delete temp.cost;
    if (!this.studentAsFinancialSupport) {
      delete temp.account_holder_name;
      delete temp.bic;
      delete temp.iban;
      delete temp.autorization_account;
    }
    temp['modality_status'] = 'done';
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
            type: 'error',
            title: 'Error',
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
            costCoverage = costCoverage;
            this.invalidCost = false;
          }
        });
      }
      if (costCoverage >= 0) {
        this.paymentForm.get('cost').setValue(costCoverage.toFixed(2));
      } else {
        this.paymentForm.get('cost').setValue(0);
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

  setStudentValidator() {
    this.paymentForm.get('account_holder_name').setValidators(Validators.required);
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
    if (this.checkFSCostCoverage() || this.paymentForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      console.log('this.paymentForm', this.paymentForm.controls);
      this.paymentForm.markAllAsTouched();
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

  formatCurrency(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
    }
    return num;
  }
}
