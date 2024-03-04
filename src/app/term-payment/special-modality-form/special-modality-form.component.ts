import { ApplicationUrls } from 'app/shared/settings';
import { SchoolService } from './../../service/schools/school.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { CoreService } from './../../service/core/core.service';
import { CustomValidators } from 'ng2-validation';
import { SubSink } from 'subsink';
import { TranslateService } from '@ngx-translate/core';
import { TermPaymentService } from 'app/term-payment/term-payment.service';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormArray, AbstractControl, UntypedFormControl } from '@angular/forms';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
  selector: 'ms-special-modality-form',
  templateUrl: './special-modality-form.component.html',
  styleUrls: ['./special-modality-form.component.scss'],
})
export class SpecialModalityFormComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  @Input() candidateId = '';

  processFinish = false;
  isWaitingForResponse = false;
  paymentForm: UntypedFormGroup;
  candidateData: any;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  relationList = ['father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'other'];
  cities: string[][] = [];
  filteredCities: string[][] = [];
  departments: string[][] = []; // in API, this field called "academy"
  filteredDepartments: string[][] = [];
  regions: string[][] = []; // in API, this field called "province"
  filteredRegions: string[][] = [];
  countriesFinance;
  filteredCountryFinance = [];

  paymentType;
  initialCostCoverage;
  invalidCost = false;
  studentAsFinancialSupport = false;
  minCostCoverage = false;
  maxCostCoverage = false;

  profileRate;

  // *************** START OF property to store data of country dial code
  flagsIconPath = '../../../../../assets/icons/flags-nationality/';
  @Input() countryCodeList: any[];
  dialCodeArray = new UntypedFormArray([]);
  selectedDialCodeArray: string[] = [];
  // *************** END OF property to store data of country dial code

  constructor(
    private TermPaymentService: TermPaymentService,
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    public coreService: CoreService,
    private rncpTitleService: RNCPTitlesService,
    private schoolService: SchoolService,
  ) {}

  ngOnInit() {
    this.initPaymentForm();
    this.getOneCandidate();
    this.subs.sink = this.schoolService.getCountry().subscribe((list: any[]) => {
      this.countriesFinance = list;
      this.filteredCountryFinance = list;
    });
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  selectionDialCode(event, index) {
    this.financialSupportArray?.at(index)?.get('phone_number_indicative')?.reset();
    this.selectedDialCodeArray[index] = event?.value?.dialCode;
    this.financialSupportArray?.at(index)?.get('phone_number_indicative')?.patchValue(this.selectedDialCodeArray[index]);
  }

  getOneCandidate() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.TermPaymentService.getCandidateDataForSpecialForm(this.candidateId).subscribe(
      (resp) => {
        this.candidateData = resp;
        console.log('getOneCandidate', resp);
        if (resp.modality_step_special_form_status && resp.modality_step_special_form_status === 'completed') {
          this.processFinish = true;
        }
        if (this.candidateData && this.candidateData.finance !== 'discount') {
          if (this.candidateData.finance === 'family' && (!this.candidateData.cost || this.candidateData.cost === 0)) {
            this.studentAsFinancialSupport = false;
            this.removeStudentValidator();
          } else {
            this.studentAsFinancialSupport = true;
            this.populateStudentInformation(true);
            this.setStudentValidator();
          }
        }
        if (this.candidateData && this.candidateData.payment_supports && this.candidateData.payment_supports.length) {
          const dataForControl = [];
          const financialSupport = this.candidateData.payment_supports.map((list, idx) => {
            const findIdx = this.countryCodeList?.findIndex((country) => country?.dialCode === list?.phone_number_indicative)
            this.selectedDialCodeArray[idx] = list?.phone_number_indicative ? list?.phone_number_indicative : '';
            dataForControl?.push(this.countryCodeList[findIdx]);
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
              autorization_account: false,
              financial_support_status: list.financial_support_status,
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
        //validation for isPaymentPlanFinish
        if (this.candidateData && this.candidateData.selected_payment_plan && this.candidateData.selected_payment_plan.total_amount) {
          this.initialCostCoverage = this.candidateData.selected_payment_plan.total_amount;
        } else {
          this.initialCostCoverage = 0;
        }
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
        });
      },
    );
  }

  initPaymentForm() {
    this.paymentForm = this.fb.group({
      account_holder_name: [null, Validators.required],
      iban: [null, Validators.required],
      bic: [null, Validators.required],
      cost: [null, Validators.required],
      autorization_account: [false, Validators.requiredTrue],
      payment_supports: this.fb.array([]),
    });
  }

  initFinancialSupport() {
    return this.fb.group({
      _id: [null],
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
      tele_phone: [null, [Validators.required, Validators.pattern('^[0-9]*$')]],
      phone_number_indicative: [null, Validators.required],
      email: [null, [Validators.required, CustomValidators.email, this.financialSupportEmailValidator.bind(this)]],
      account_holder_name: [null, Validators.required],
      iban: [null, Validators.required],
      bic: [null, Validators.required],
      cost: [null, Validators.required],
      autorization_account: [false, Validators.requiredTrue],
      financial_support_status: [null],
    });
  }

  populateStudentInformation(init?) {
    this.paymentForm.get('account_holder_name').setValue(this.candidateData.account_holder_name);
    this.paymentForm.get('iban').setValue(this.candidateData.iban);
    this.paymentForm.get('bic').setValue(this.candidateData.bic);
    if (init) {
      this.paymentForm.get('autorization_account').setValue(this.candidateData.autorization_account);
    }
  }

  unpopulateStudentInformation() {
    this.paymentForm.get('account_holder_name').setValue(this.candidateData.account_holder_name);
    this.paymentForm.get('cost').setValue(0);
    this.paymentForm.get('iban').setValue(this.candidateData.iban);
    this.paymentForm.get('bic').setValue(this.candidateData.bic);
    this.paymentForm.get('autorization_account').setValue(false);
  }

  addStudent() {
    this.studentAsFinancialSupport = true;
    this.paymentForm.markAsPristine();
    this.paymentForm.markAsUntouched();
    this.setStudentValidator();
    this.populateStudentInformation();
    this.getCostCoverage();
  }

  removeStudent() {
    this.studentAsFinancialSupport = false;
    this.paymentForm.markAsPristine();
    this.paymentForm.markAsUntouched();
    this.removeStudentValidator();
    this.unpopulateStudentInformation();
    this.getCostCoverage();
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
    this.paymentForm.get('cost').clearValidators();
    this.paymentForm.get('cost').setErrors(null);
    this.paymentForm.get('iban').clearValidators();
    this.paymentForm.get('iban').setErrors(null);
    this.paymentForm.get('bic').clearValidators();
    this.paymentForm.get('bic').setErrors(null);
    this.paymentForm.get('autorization_account').clearValidators();
    this.paymentForm.get('autorization_account').setErrors(null);
    this.paymentForm.updateValueAndValidity();
  }

  get financialSupportArray() {
    return this.paymentForm.get('payment_supports') as UntypedFormArray;
  }

  addFinancialSupport() {
    this.financialSupportArray.push(this.initFinancialSupport());
    this.dialCodeArray?.push(new UntypedFormControl(''));
    this.selectedDialCodeArray?.push('');
    this.cities.push([]);
    this.departments.push([]);
    this.regions.push([]);
    this.filteredCities.push([]);
    this.filteredDepartments.push([]);
    this.filteredRegions.push([]);
    this.getCostCoverage();
  }

  removeFinancialSupport(parentIndex: number) {
    this.financialSupportArray.removeAt(parentIndex);
    this.dialCodeArray.removeAt(parentIndex);
    this.selectedDialCodeArray.splice(parentIndex, 1);
    this.getCostCoverage();
  }

  onChoosePaymentType(type) {
    if (this.candidateData && this.candidateData.finance !== 'discount') {
      if (this.candidateData.finance === 'family' && (!this.candidateData.cost || this.candidateData.cost === 0)) {
        this.studentAsFinancialSupport = false;
        this.removeStudentValidator();
      } else {
        this.studentAsFinancialSupport = true;
        this.populateStudentInformation(true);
        this.setStudentValidator();
      }
    }
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
      this.setStudentValidator();
    } else if (this.paymentType === 'family') {
      this.paymentForm.get('cost').setValue(0);
      while (this.financialSupportArray.length !== 0) {
        this.financialSupportArray.removeAt(0);
      }
      if (this.candidateData && this.candidateData.payment_supports && this.candidateData.payment_supports.length) {
        const dataForControl = [];
        const financialSupport = this.candidateData.payment_supports.map((list, idx) => {
          const findIdx = this.countryCodeList?.findIndex((country) => country?.dialCode === list?.phone_number_indicative)
          this.selectedDialCodeArray[idx] = list?.phone_number_indicative ? list?.phone_number_indicative : '';
          dataForControl?.push(this.countryCodeList[findIdx]);
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
            autorization_account: false,
            financial_support_status: list.financial_support_status,
          };
        });
        financialSupport.forEach((element) => {
          this.addFinancialSupport();
        });
        this.paymentForm.get('payment_supports').patchValue(financialSupport);
        this.dialCodeArray.patchValue(dataForControl);
      }
    }
    this.paymentForm.get('autorization_account').setValue(false);
    this.populateStudentInformation();
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

  // to make border of invalid fields as red
  toggleValidationStyle(field: string, formIndex: number, isAddressField = false) {
    if (this.financialSupportArray) {
      return {
        'has-error': this.isFieldValid(field, formIndex, isAddressField),
      };
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

  financialSupportEmailValidator(c: AbstractControl): { [key: string]: boolean } | null {
    const email = this.candidateData.email;
    if (c.value && email && c.value === email) {
      return { emailSame: true };
    } else {
      return null;
    }
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

  getPostcodeData(index) {
    const country = this.financialSupportArray.at(index).get('parent_address').get('country').value;
    const postCode = this.financialSupportArray.at(index).get('parent_address').get('postal_code').value;
    if (postCode && country && postCode.length > 3 && country.toLowerCase() === 'france') {
      this.subs.sink = this.rncpTitleService.getFilteredZipCode(postCode, country).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.setAddressDropdown(resp, index);

            this.financialSupportArray.at(index).get('parent_address').get('city').setValue(this.cities[index][0][0]);
            this.financialSupportArray.at(index).get('parent_address').get('department').setValue(this.departments[index][0][0]);
            this.financialSupportArray.at(index).get('parent_address').get('region').setValue(this.regions[index][0][0]);
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

      this.cities[parentIndex][0] = _.uniq(tempCities);
      this.departments[parentIndex][0] = _.uniq(tempDepartments);
      this.regions[parentIndex][0] = _.uniq(tempRegions);

      this.filteredCities[parentIndex][0] = this.cities[parentIndex][0];
      this.filteredDepartments[parentIndex][0] = this.departments[parentIndex][0];
      this.filteredRegions[parentIndex][0] = this.regions[parentIndex][0];
    }
  }

  filterCountrys(addressIndex: string) {
    const searchString = this.paymentForm.get('payment_supports').get(addressIndex).get('parent_address').get('country').value
      ? this.paymentForm.get('payment_supports').get(addressIndex).get('parent_address').get('country').value.toLowerCase().trim()
      : '';
    this.filteredCountryFinance = this.countriesFinance.filter((country) => country.name.toLowerCase().trim().includes(searchString));
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
    } else if (this.checkFormValidity()) {
      return;
    }
    const payload = this.createPayload();
    console.log('Payload =>', payload);
    this.isWaitingForResponse = true;
    this.subs.sink = this.TermPaymentService.UpdateCandidateFromSpecialForm(this.candidateData._id, payload).subscribe(
      (resp) => {
        let financialSupport = _.cloneDeep(resp.payment_supports);
        console.log('financialSupport before filter', financialSupport);
        financialSupport = financialSupport.filter((res) => res.financial_support_status !== 'validated');
        console.log('financialSupport after filter', financialSupport);
        if (financialSupport && financialSupport.length) {
          const payloadToValidate = this.createPayloadForValidate(financialSupport);
          console.log('Payload to validate =>', payloadToValidate);
          this.isWaitingForResponse = false;
          this.ValidateCandidateFinancialSupport(payloadToValidate);
        } else {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo'),
            confirmButtonText: this.translate.instant('OK'),
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then((res) => {
            this.processFinish = true;
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

  ValidateCandidateFinancialSupport(payload) {
    this.subs.sink = this.TermPaymentService.ValidateManyCandidateFinancialSupport(this.candidateId, payload).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo'),
          confirmButtonText: this.translate.instant('OK'),
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then((res) => {
          this.processFinish = true;
        });
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
        } else if (
          err['message'] === 'GraphQL error: contact is removed as financial support' ||
          err['message'] === 'GraphQL error: contact data of student is not found'
        ) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('Not a financial support'),
            text: this.translate.instant('You are not longer as a financial support'),
            confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
          }).then((res) => {
            this.processFinish = true;
          });
        } else if (
          err['message'] === 'FI: some terms already paid/partially paid' ||
          err['message'] === 'GraphQL error: FC: some terms already billed' ||
          err['message'] === 'GraphQL error: FC: some terms already paid/partially paid'
        ) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('VALIDATION_BILLING_S1.TITLE'),
            text: this.translate.instant('VALIDATION_BILLING_S1.TEXT'),
            confirmButtonText: this.translate.instant('VALIDATION_BILLING_S1.BUTTON'),
          }).then((res) => {
            this.processFinish = true;
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

  validateMyself() {
    if (this.checkFormValidity()) {
      return;
    }
    const payload = this.createPayload();
    console.log('Payload =>', payload);
    this.isWaitingForResponse = true;
    this.subs.sink = this.TermPaymentService.UpdateCandidateFromSpecialForm(this.candidateData._id, payload).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo'),
          confirmButtonText: this.translate.instant('OK'),
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then((res) => {
          this.processFinish = true;
        });
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
          financial_support_status: list.financial_support_status ? list.financial_support_status : 'pending',
        };
      });
    }
    const payload = {
      ...temp,
      finance: this.paymentType,
      cost: temp.cost ? parseFloat(temp.cost) : 0,
      modality_step_special_form_status: 'completed',
    };
    return payload;
  }

  createPayloadForValidate(financialSupportData) {
    const temp = _.cloneDeep(financialSupportData);
    if (temp && temp.length) {
      temp.forEach((element) => {
        element.parent_id = element._id;
        delete element._id;
        delete element.financial_support_status;
      });

      const payload = temp.map((list) => {
        return {
          ...list,
          cost: list.cost ? parseFloat(list.cost) : 0,
        };
      });

      return payload;
    }
  }

  checkFormValidity(): boolean {
    console.log(this.paymentForm);
    if (this.minCostCoverage || this.maxCostCoverage || this.invalidCost || this.paymentForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.paymentForm.markAllAsTouched();
      return true;
    } else {
      return false;
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

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
