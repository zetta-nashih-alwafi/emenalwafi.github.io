import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { SubSink } from 'subsink';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormArray, Validators, UntypedFormControl } from '@angular/forms';
import * as _ from 'lodash';
import { SchoolService } from 'app/service/schools/school.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import Swal from 'sweetalert2';
import { CustomValidators } from 'ng2-validation';
import { PermissionService } from 'app/service/permission/permission.service';
import { Router } from '@angular/router';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { CoreService } from 'app/service/core/core.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { TermPaymentService } from 'app/term-payment/term-payment.service';
import { FinancesService } from 'app/service/finance/finance.service';

@Component({
  selector: 'ms-student-contacts-tab',
  templateUrl: './student-contacts-tab.component.html',
  styleUrls: ['./student-contacts-tab.component.scss'],
})
export class StudentContactsTabComponent implements OnInit, OnChanges, OnDestroy {
  private subs = new SubSink();
  @Input() candidate;
  @Output() nextStep: EventEmitter<string> = new EventEmitter();
  @Output() reloadData: EventEmitter<boolean> = new EventEmitter();
  parentsForm: UntypedFormGroup;

  isMainAddressSelected = [false, false];

  countries: string[] = [];
  filteredCountry = [];
  cities = [];
  isWaitingForResponse = false;
  filteredCities = [];
  departments = []; // in API, this field called "academy"
  filteredDepartments = [];
  regions = []; // in API, this field called "province"
  filteredRegions = [];
  firstForm: any;

  countrieSupport: string[] = [];
  filteredCountrySupport = [];
  citySupport = [];
  filteredCitySupport = [];
  departmentSupport = []; // in API, this field called "academy"
  filteredDepartmentSupport = [];
  regionSupport = []; // in API, this field called "province"
  filteredRegionSupport = [];
  relationList = ['father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'other'];

  isMainAddress = [];
  studentAddress: any = [];
  private intVal: any;
  private timeOutVal: any;
  myInnerHeight = 1920;

  isResetCountry = true;
  isResetNationality = true;
  hasErrorEmailSameAsStudentFinancialSupport = false;
  hasErrorEmailSameAsStudentParent = false;

  thereIsPending = false;
  parentsData;
  billingData: any;

  // *************** START OF property to store data of country dial code
  flagsIconPath = '../../../../../assets/icons/flags-nationality/';
  @Input() countryCodeList: any[] = [];
  dialCodeArrayForParents = new UntypedFormArray([]);
  dialCodeArrayForPaymentSupports = new UntypedFormArray([])
  // *************** END OF property to store data of country dial code

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private candidatesService: CandidatesService,
    private schoolService: SchoolService,
    private rncpTitleService: RNCPTitlesService,
    private translate: TranslateService,
    public permissionService: PermissionService,
    private pageTitleService: PageTitleService,
    public coreService: CoreService,
    public userService: AuthService,
    private termPaymentService: TermPaymentService,
    private financeService: FinancesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.updatePageTitle();
  }

  ngOnChanges() {
    console.log('_can', this.candidate);
    this.dialCodeArrayForParents?.reset();
    this.dialCodeArrayForPaymentSupports?.reset();

    this.reset();
    this.subs.sink = this.schoolService.getCountry().subscribe((list: any[]) => {
      this.countries = list.map((ls) => ls?.name);
      this.countrieSupport = list.map((ls) => ls?.name);
    });
    this.initForm();
    this.getParentData();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      const backupValue = this.parentsForm.value;
      this.parentsForm.patchValue(backupValue);
    });
    this.getAllBilling();
  }

  updatePageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('Student Card Contact'));
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(this.translate.instant('Student Card Contact'));
    });
  }

  // *************** To Get Height window screen and put in style css height
  getAutomaticHeight() {
    if (this.router.url === '/my-file' || this.router.url.includes('previous-course')) {
      this.myInnerHeight = window.innerHeight - 193;
      return this.myInnerHeight;
    } else {
      this.myInnerHeight = window.innerHeight - 369;
      return this.myInnerHeight;
    }
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }

  reset() {
    this.isMainAddressSelected = [false, false];
    this.thereIsPending = false;
  }

  initForm() {
    this.parentsForm = this.fb.group({
      parents: this.fb.array([]),
      payment_supports: this.fb.array([]),
    });
  }

  initParentForm(init?: boolean) {
    if (init) {
      this.filteredCountry.push([]);
      this.cities.push([]);
      this.filteredCities.push([]);
      this.regions.push([]);
      this.filteredRegions.push([]);
      this.departments.push([]);
      this.filteredDepartments.push([]);
    }
    return this.fb.group({
      _id: [null],
      relation: [null, [Validators.required]],
      family_name: [null, [Validators.required]],
      name: [null, [Validators.required]],
      civility: [null, [Validators.required]],
      tele_phone: [null, Validators.pattern('[- ()0-9]+')],
      phone_number_indicative: [null],
      email: [null, [Validators.required, CustomValidators.email]],
      is_same_address: [false],
      is_parent_also_payment_support: [false],
      is_contact_person_in_emergency: [false],
      financial_support_status: [null],
      account_holder_name: [null],
      bic: [null],
      iban: [null],
      parent_address: this.fb.array([this.initParentAddress(true)]),
      autorization_account: [null],
    });
  }

  initFormPaymentSupports(init?: boolean) {
    if (init) {
      this.filteredCountrySupport.push([]);
      this.citySupport.push([]);
      this.filteredCitySupport.push([]);
      this.regionSupport.push([]);
      this.filteredRegionSupport.push([]);
      this.departmentSupport.push([]);
      this.filteredDepartmentSupport.push([]);
    }
    return this.fb.group({
      _id: [null],
      relation: [null, [Validators.required]],
      family_name: [null, [Validators.required]],
      name: [null, [Validators.required]],
      account_holder_name: [null],
      iban: [null],
      bic: [null],
      financial_support_status: [null],
      cost: [null],
      civility: [null, [Validators.required]],
      tele_phone: [null, Validators.pattern('[- ()0-9]+')],
      phone_number_indicative: [null],
      email: [null, [Validators.required, CustomValidators.email]],
      upload_document_rib: [null],
      parent_address: this.fb.array([this.initFormAddress()]),
      autorization_account: [null],
    });
  }

  initFormAddress(init?: boolean) {
    if (init) {
      this.filteredCountrySupport.push([]);
      this.citySupport.push([]);
      this.filteredCitySupport.push([]);
      this.regionSupport.push([]);
      this.filteredRegionSupport.push([]);
      this.departmentSupport.push([]);
      this.filteredDepartmentSupport.push([]);
    }
    return this.fb.group({
      address: [null],
      postal_code: [null],
      country: [null],
      city: [null],
      region: [null],
      department: [null],
    });
  }

  initParentAddress(init?: boolean) {
    if (init) {
      this.filteredCountry.push([]);
      this.cities.push([]);
      this.filteredCities.push([]);
      this.regions.push([]);
      this.filteredRegions.push([]);
      this.departments.push([]);
      this.filteredDepartments.push([]);
    }
    return this.fb.group({
      address: [null],
      postal_code: [null],
      country: ['France'],
      city: [null],
      region: [null],
      department: [null],
      is_main_address: [false],
    });
  }

  getParentData() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.candidatesService.getCandidatesParentData(this.candidate._id).subscribe(
      (response) => {
        const res = _.cloneDeep(response);
        this.parentsData = _.cloneDeep(response);
        // console.log('_res', res);

        if (res) {
          this.studentAddress = [
            {
              address: res.address ? res.address : null,
              postal_code: res.post_code ? res.post_code : null,
              country: res.country ? res.country : null,
              city: res.city ? res.city : null,
              region: res.region ? res.region : null,
              department: res.department ? res.department : null,
              is_main_address: true,
            },
          ];
          const dataArrayForParents = [];
          if (res.parents && res.parents.length) {
            res.parents.forEach((parent, parentIndex) => {
              this.addParent(false);
              const findIdx = this.countryCodeList?.findIndex((country) => country?.dialCode === parent?.phone_number_indicative);
              dataArrayForParents?.push(this.countryCodeList[findIdx]);
              this.filteredCountry.push([]);
              this.cities.push([]);
              this.filteredCities.push([]);
              this.regions.push([]);
              this.filteredRegions.push([]);
              this.departments.push([]);
              this.filteredDepartments.push([]);
              if (parent && parent?.financial_support_status && parent?.financial_support_status === 'pending') {
                this.thereIsPending = true;
              }
              if (parent && parent?.parent_address && parent?.parent_address?.length) {
                parent?.parent_address?.forEach((address, addressIndex) => {
                  if (address && address?.is_main_address) {
                    this.isMainAddressSelected[parentIndex] = true;
                  }
                  if (address?.postal_code && address?.country && address?.country?.toLowerCase() === 'france') {
                    this.subs.sink = this.rncpTitleService.getFilteredZipCode(address?.postal_code, address?.country).subscribe(
                      (addresData) => {
                        this.setAddressDropdown(addresData, parentIndex, addressIndex);
                      },
                      (err) => {
                        if (
                          err &&
                          err['message'] &&
                          (err['message'].includes('jwt expired') ||
                            err['message'].includes('str & salt required') ||
                            err['message'].includes('Authorization header is missing') ||
                            err['message'].includes('salt'))
                        ) {
                          this.userService.handlerSessionExpired();
                          return;
                        }
                        Swal.fire({
                          type: 'info',
                          title: this.translate.instant('SORRY'),
                          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                        });
                      },
                    );
                  }
                  if (addressIndex >= 1) {
                    this.addParentAddress(parentIndex);
                  }
                });
              }
            });
          }
          // console.log('_res', res.payment_supports.length);

          const dataArrayForPaymentSupport = [];
          if (res.payment_supports && res.payment_supports.length > 0) {
            if (res.payment_supports.length > 0) {
              this.addPaymentForm();
              this.filteredCountrySupport.push([]);
              this.citySupport.push([]);
              this.filteredCitySupport.push([]);
              this.regionSupport.push([]);
              this.filteredRegionSupport.push([]);
              this.departmentSupport.push([]);
              this.filteredDepartmentSupport.push([]);
            }
            res.payment_supports.forEach((element, index) => {
              if (index >= 1) {
                this.addPaymentForm();
              }
              const findIdx = this.countryCodeList?.findIndex((country) => country?.dialCode === element?.phone_number_indicative);
              let tempCountryData = this.countryCodeList[findIdx] ? this.countryCodeList[findIdx] : null;
              dataArrayForPaymentSupport?.push(tempCountryData);
              if (element && element.financial_support_status && element.financial_support_status === 'pending') {
                this.thereIsPending = true;
              }
              element.parent_address?.forEach((address, i) => {
                if (i >= 1) {
                  this.addPaymentAddress(i);
                }
              });
            });
          }
          this.parentsForm.patchValue(res);
          this.dialCodeArrayForPaymentSupports?.patchValue(dataArrayForPaymentSupport);
          this.dialCodeArrayForParents?.patchValue(dataArrayForParents);
          this.autorizationAccount(res);
          this.firstForm = _.cloneDeep(this.parentsForm.value);
          // console.log('_test', this.paymentSupportsForm.value);
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  selectionDialCode(event, index, from) {
    if(from && from === 'payment_supports') {
      this.paymentSupportsForm?.at(index)?.get('phone_number_indicative')?.reset();
      this.paymentSupportsForm?.at(index)?.get('phone_number_indicative')?.patchValue(event?.dialCode);
    } else if(from && from === 'parents') {
      this.parentsArrayForm?.at(index)?.get('phone_number_indicative')?.reset();
      this.parentsArrayForm?.at(index)?.get('phone_number_indicative')?.patchValue(event?.dialCode);
    }
  }

  get parentsArrayForm() {
    return this.parentsForm.get('parents') as UntypedFormArray;
  }

  get paymentSupportsForm() {
    return this.parentsForm.get('payment_supports') as UntypedFormArray;
  }

  addPaymentForm() {
    this.paymentSupportsForm.push(this.initFormPaymentSupports());
    this.dialCodeArrayForPaymentSupports?.push(new UntypedFormControl(null));
    this.filteredCountrySupport.push([]);
    this.citySupport.push([]);
    this.filteredCitySupport.push([]);
    this.regionSupport.push([]);
    this.filteredRegionSupport.push([]);
    this.departmentSupport.push([]);
    this.filteredDepartmentSupport.push([]);
  }

  addParent(boolean) {
    this.parentsArrayForm.push(this.initParentForm());
    this.dialCodeArrayForParents?.push(new UntypedFormControl(null));
    this.filteredCountry.push([]);
    this.cities.push([]);
    this.filteredCities.push([]);
    this.regions.push([]);
    this.filteredRegions.push([]);
    this.departments.push([]);
    this.filteredDepartments.push([]);

    if (boolean) {
      const tempAnchor = document.getElementById('parent1');
      setTimeout(() => {
        tempAnchor.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }

  removeParent(parentIndex: number) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('DASHBOARD_DELETE.deletedTitle'),
      html: this.translate.instant('This action will delete parent !'),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('THUMBSUP.SWEET_ALERT.CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        this.intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(this.intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.parentsArrayForm.removeAt(parentIndex);
        this.dialCodeArrayForParents.removeAt(parentIndex);
        this.filteredCountry.splice(parentIndex, 1);
        this.cities.splice(parentIndex, 1);
        this.filteredCities.splice(parentIndex, 1);
        this.regions.splice(parentIndex, 1);
        this.filteredRegions.splice(parentIndex, 1);
        this.departments.splice(parentIndex, 1);
        this.filteredDepartments.splice(parentIndex, 1);
        Swal.fire({
          type: 'success',
          title: this.translate.instant('EVENT_S1.TITLE'),
          confirmButtonText: this.translate.instant('EVENT_S1.BUTTON'),
        });
      }
    });
  }

  removeFinancialSupport(financialSupportIndex: number) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('DASHBOARD_DELETE.deletedTitle'),
      html: this.translate.instant('This action will delete financial support !'),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('THUMBSUP.SWEET_ALERT.CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        this.intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(this.intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      console.log('candidate id => ', this.candidate._id);
      console.log('financial support data -> ', this.parentsData.payment_supports[financialSupportIndex]);
      Swal.fire({
        type: 'success',
        title: this.translate.instant('EVENT_S1.TITLE'),
        confirmButtonText: this.translate.instant('EVENT_S1.BUTTON'),
      }).then((ress) => {
        this.reloadData.emit(true);
      });
    });
  }

  parentAddressArrayForm(parentIndex: number) {
    return this.parentsArrayForm.at(parentIndex).get('parent_address') as UntypedFormArray;
  }

  paymentAddressArrayForm(parentIndex: number) {
    return this.paymentSupportsForm.at(parentIndex).get('parent_address') as UntypedFormArray;
  }

  addPaymentAddress(parentIndex: number) {
    this.paymentAddressArrayForm(parentIndex).push(this.initFormAddress());
    this.filteredCountrySupport[parentIndex].push(this.countries);
    this.citySupport[parentIndex].push([]);
    this.filteredCitySupport[parentIndex].push([]);
    this.regionSupport[parentIndex].push([]);
    this.filteredRegionSupport[parentIndex].push([]);
    this.departmentSupport[parentIndex].push([]);
    this.filteredDepartmentSupport[parentIndex].push([]);
  }

  addParentAddress(parentIndex: number) {
    this.parentAddressArrayForm(parentIndex).push(this.initParentAddress());
    this.filteredCountry[parentIndex].push(this.countries);
    this.cities[parentIndex].push([]);
    this.filteredCities[parentIndex].push([]);
    this.regions[parentIndex].push([]);
    this.filteredRegions[parentIndex].push([]);
    this.departments[parentIndex].push([]);
    this.filteredDepartments[parentIndex].push([]);
  }

  removeParentAddress(parentIndex: number, addressIndex: number) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('DASHBOARD_DELETE.deletedTitle'),
      html: this.translate.instant('DELETE_STUDENT_ADDRESS'),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('THUMBSUP.SWEET_ALERT.CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        this.intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(this.intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        const valid = this.parentAddressArrayForm(parentIndex).at(addressIndex).get('is_main_address');
        this.parentAddressArrayForm(parentIndex).removeAt(addressIndex);
        this.filteredCountry[parentIndex].splice(addressIndex, 1);
        this.cities[parentIndex].splice(addressIndex, 1);
        this.filteredCities[parentIndex].splice(addressIndex, 1);
        this.regions[parentIndex].splice(addressIndex, 1);
        this.filteredRegions[parentIndex].splice(addressIndex, 1);
        this.departments[parentIndex].splice(addressIndex, 1);
        this.filteredDepartments[parentIndex].splice(addressIndex, 1);
        console.log(valid, this.isMainAddressSelected[parentIndex]);
        if (valid.value) {
          this.isMainAddressSelected[parentIndex] = false;
        }
        console.log(this.isMainAddressSelected[parentIndex]);
        Swal.fire({
          type: 'success',
          title: this.translate.instant('EVENT_S1.TITLE'),
          html: this.translate.instant('address deleted'),
          confirmButtonText: this.translate.instant('EVENT_S1.BUTTON'),
        });
      }
    });
  }

  getPostcodeData(parentIndex: number, addressIndex: number) {
    const country = this.parentAddressArrayForm(parentIndex).at(addressIndex).get('country').value;
    const postCode = this.parentAddressArrayForm(parentIndex).at(addressIndex).get('postal_code').value;
    if (postCode && postCode.length > 3 && country && country?.toLowerCase() === 'france') {
      this.subs.sink = this.rncpTitleService.getFilteredZipCode(postCode, country).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.setAddressDropdown(resp, parentIndex, addressIndex);

            this.parentAddressArrayForm(parentIndex).at(addressIndex).get('city').setValue(this.cities[parentIndex][addressIndex][0]);
            this.parentAddressArrayForm(parentIndex)
              .at(addressIndex)
              .get('department')
              .setValue(this.departments[parentIndex][addressIndex][0]);
            this.parentAddressArrayForm(parentIndex).at(addressIndex).get('region').setValue(this.regions[parentIndex][addressIndex][0]);
          }
        },
        (err) => {
          if (
            err &&
            err['message'] &&
            (err['message'].includes('jwt expired') ||
              err['message'].includes('str & salt required') ||
              err['message'].includes('Authorization header is missing') ||
              err['message'].includes('salt'))
          ) {
            this.userService.handlerSessionExpired();
            return;
          }
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

  getTranslateCountry(name) {
    if (name) {
      const value = this.translate.instant('COUNTRY.' + name);
      return value;
    }
  }

  getCountryName(value?: string) {
    let country;
    if (value) {
      const findCountry: any = this.countries.filter((country: any) => country === value);
      country = findCountry ? this.getTranslateCountry(findCountry) : '';
    }
    return country;
  }

  getCountrySupportName(value?: string) {
    let countrySupport;
    if (value) {
      const findCountrySupport: any = this.countrieSupport.filter((country: any) => country === value);
      countrySupport = findCountrySupport ? this.getTranslateCountry(findCountrySupport) : '';
    }
    return countrySupport;
  }

  setAddressDropdown(resp: any, parentIndex: number, addressIndex: number) {
    const tempCities = [];
    const tempDepartments = [];
    const tempRegions = [];

    if (resp && resp.length) {
      resp.forEach((address) => {
        tempCities.push(address?.city);
        tempDepartments.push(address?.department);
        tempRegions.push(address?.province);
      });

      this.cities[parentIndex][addressIndex] = _.uniq(tempCities);
      this.departments[parentIndex][addressIndex] = _.uniq(tempDepartments);
      this.regions[parentIndex][addressIndex] = _.uniq(tempRegions);

      this.filteredCities[parentIndex][addressIndex] = this.cities[parentIndex][addressIndex];
      this.filteredDepartments[parentIndex][addressIndex] = this.departments[parentIndex][addressIndex];
      this.filteredRegions[parentIndex][addressIndex] = this.regions[parentIndex][addressIndex];
    }
  }

  filterCountry(parentIndex: number, addressIndex: number) {
    if (this.parentAddressArrayForm(parentIndex)?.at(addressIndex)?.get('country')?.value) {
      const searchString = this.parentAddressArrayForm(parentIndex)?.at(addressIndex)?.get('country')?.value.toLowerCase().trim();
      this.filteredCountry[parentIndex][addressIndex] = this.countries.filter((country: any) =>
        this.translate
          .instant('COUNTRY.' + country)
          ?.toLowerCase()
          .trim()
          .includes(searchString),
      );
    }
  }

  filterCity(parentIndex: number, addressIndex: number) {
    if (
      this.cities[parentIndex][addressIndex] &&
      this.cities[parentIndex][addressIndex].length &&
      this.parentAddressArrayForm(parentIndex)?.at(addressIndex)?.get('city')?.value
    ) {
      const searchString = this.parentAddressArrayForm(parentIndex)?.at(addressIndex)?.get('city')?.value.toLowerCase().trim();
      this.filteredCities[parentIndex][addressIndex] = this.cities[parentIndex][addressIndex].filter((city) =>
        city?.toLowerCase().trim().includes(searchString),
      );
    }
  }

  filterDepartment(parentIndex: number, addressIndex: number) {
    if (this.departments[parentIndex][addressIndex] && this.departments[parentIndex][addressIndex].length) {
      const searchString = this.parentAddressArrayForm(parentIndex).at(addressIndex).get('department').value.toLowerCase().trim();
      this.filteredDepartments[parentIndex][addressIndex] = this.departments[parentIndex][addressIndex].filter((department) =>
        department?.toLowerCase().trim().includes(searchString),
      );
    }
  }

  filterRegion(parentIndex: number, addressIndex: number) {
    if (
      this.regions[parentIndex][addressIndex] &&
      this.regions[parentIndex][addressIndex].length &&
      this.parentAddressArrayForm(parentIndex)?.at(addressIndex)?.get('region')?.value
    ) {
      const searchString = this.parentAddressArrayForm(parentIndex)?.at(addressIndex)?.get('region')?.value?.toLowerCase().trim();
      this.filteredRegions[parentIndex][addressIndex] = this.regions[parentIndex][addressIndex].filter((region) =>
        region?.toLowerCase().trim().includes(searchString),
      );
    }
  }

  checkMainAddress(event: MatSlideToggleChange, parentIndex: number) {
    if (event && event.checked) {
      this.isMainAddressSelected[parentIndex] = true;
    } else {
      this.isMainAddressSelected[parentIndex] = false;
    }
  }

  duplicateStudentAddress(event: MatSlideToggleChange, parentIndex: number) {
    if (event && event.checked) {
      // remove old formarray first
      this.parentAddressArrayForm(parentIndex).clear();

      // Add new formArray
      if (this.studentAddress && this.studentAddress?.length) {
        this.studentAddress?.forEach((address, addressIndex) => {
          this.addParentAddress(parentIndex);
          if (address && address?.is_main_address) {
            this.isMainAddressSelected[parentIndex] = true;
          }
          if (address?.postal_code && address?.country && address?.country?.toLowerCase() === 'france') {
            this.subs.sink = this.rncpTitleService.getFilteredZipCode(address?.postal_code, address?.country).subscribe(
              (addresData) => {
                this.setAddressDropdown(addresData, parentIndex, addressIndex);
              },
              (err) => {
                if (
                  err &&
                  err['message'] &&
                  (err['message'].includes('jwt expired') ||
                    err['message'].includes('str & salt required') ||
                    err['message'].includes('Authorization header is missing') ||
                    err['message'].includes('salt'))
                ) {
                  this.userService.handlerSessionExpired();
                  return;
                }
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
        this.parentAddressArrayForm(parentIndex).patchValue(this.studentAddress);
      }
    } else {
      this.parentAddressArrayForm(parentIndex).clear();
      this.addParentAddress(parentIndex);
    }
  }

  checkInvalidFieldParent() {
    let invalidField;
    for (const control of this.parentsArrayForm.controls) {
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

  checkInvalidFieldPaymentSupports() {
    let invalidField;
    for (const control of this.paymentSupportsForm.controls) {
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

  checkEmailSameWithStudentForParent() {
    let invalidField;
    for (const control of this.parentsArrayForm.controls) {
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

  checkEmailSameWithStudentForPaymentSupport() {
    let invalidField;
    for (const control of this.paymentSupportsForm.controls) {
      if (control instanceof UntypedFormGroup) {
        // is a FormGroup
        invalidField = this.findInvalidControlsRecursive(control, false, true);
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

  findInvalidControlsRecursive(formToInvestigate: UntypedFormGroup | UntypedFormArray, isSameParent?, isSamePaymentSupport?): string[] {
    const invalidControls: string[] = [];
    const recursiveFunc = (form: UntypedFormGroup | UntypedFormArray) => {
      Object.keys(form.controls).forEach((field) => {
        const control = form.get(field);
        if (isSameParent) {
          if (control.hasError('emailSame')) {
            invalidControls.push(field);
          }
        }
        if (isSamePaymentSupport) {
          if (control.hasError('emailSamePS')) {
            invalidControls.push(field);
          }
        }
        if (!isSamePaymentSupport && !isSameParent) {
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

  updateStudentParents() {
    if (this.checkFormValidity()) {
      return;
    }
    // to check if format email invalid
    const invalidEmailFormatParent = this.checkInvalidFieldParent();
    const invalidEmailFormatPaymentSupports = this.checkInvalidFieldPaymentSupports();
    this.hasErrorEmailSameAsStudentParent = this.checkEmailSameWithStudentForParent();
    this.hasErrorEmailSameAsStudentFinancialSupport = this.checkEmailSameWithStudentForPaymentSupport();
    // console.log('_test', invalidEmailFormatParent, invalidEmailFormatPaymentSupports);

    if (this.hasErrorEmailSameAsStudentFinancialSupport) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Followup_S13s.Title'),
        html: this.translate.instant('Followup_S13s.Text'),
        confirmButtonText: this.translate.instant('Followup_S13s.Button'),
      });
    } else if (this.hasErrorEmailSameAsStudentParent) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Followup_S14s.Title'),
        html: this.translate.instant('Followup_S14s.Text'),
        confirmButtonText: this.translate.instant('Followup_S14s.Button'),
      });
    } else if (invalidEmailFormatParent || invalidEmailFormatPaymentSupports) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Format.Title'),
        html: this.translate.instant('Invalid_Format.Text'),
        confirmButtonText: this.translate.instant('Invalid_Format.Button'),
      });
    } else {
      this.isWaitingForResponse = true;
      const temp = this.parentsForm.value;
      // validation for main address
      if (temp && temp.parents && temp.parents.length) {
        temp.parents.forEach((parent, parentIndex) => {
          if (!this.isMainAddressSelected[parentIndex]) {
            console.log(this.parentAddressArrayForm(parentIndex).at(0));
            if (this.parentAddressArrayForm(parentIndex).at(0)) {
              this.parentAddressArrayForm(parentIndex).at(0).get('is_main_address').patchValue(true);
            }
          }
        });
      }
      if (temp && temp.parents && temp.parents.length) {
        temp.parents.forEach((parent, parentIndex) => {
          if (!parent?._id) {
            delete parent?._id;
          }
          if (
            (parent?.financial_support_status === 'not_financial_support' || !parent?.financial_support_status) &&
            parent?.is_parent_also_payment_support
          ) {
            parent.financial_support_status = 'pending';
          } else if (!parent?.is_parent_also_payment_support) {
            parent.financial_support_status = 'not_financial_support';
          }
        });
      }
      // *************** UAT_970 add flag to update status when there is update in student card there is no swal error display even required field is still empty
      const is_save_identity_student = true;
      this.subs.sink = this.candidatesService.UpdateCandidate(this.candidate._id, temp, is_save_identity_student).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            Swal.fire({
              type: 'success',
              title: 'Bravo !',
            }).then((ressp) => {
              this.reloadData.emit(true);
            });
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          if (
            err &&
            err['message'] &&
            (err['message'].includes('jwt expired') ||
              err['message'].includes('str & salt required') ||
              err['message'].includes('Authorization header is missing') ||
              err['message'].includes('salt'))
          ) {
            this.userService.handlerSessionExpired();
            return;
          }
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
  }

  checkFormValidity(): boolean {
    if (this.parentsForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.parentsForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  checkCountry(): boolean {
    const form = this.parentsForm.value;
    let invalid = false;
    form.parents.forEach((parent) => {
      parent?.parent_address?.forEach((address) => {
        console.log(address?.country, this.countries);
        if (!this.countries.includes(address?.country)) {
          invalid = true;
          address.country = '';
        }
      });
    });
    form.payment_supports.forEach((parent) => {
      parent?.parent_address?.forEach((address) => {
        console.log(address?.country, this.countrieSupport);
        if (!this.countrieSupport.includes(address?.country)) {
          invalid = true;
          address.country = '';
        }
      });
    });
    this.parentsForm.patchValue(form);
    return invalid;
  }

  autorizationAccount(params) {
    if (params && params?.payment_supports.length) {
      params?.payment_supports.forEach((parent, index) => {
        this.paymentSupportsForm?.controls[index].patchValue({
          autorization_account: parent?.autorization_account,
        });
      });
    }
  }

  // make all field as touched so error can show
  markAllFieldsAsTouched(formGroup: UntypedFormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof UntypedFormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup) {
        this.markAllFieldsAsTouched(control);
      } else if (control instanceof UntypedFormArray) {
        for (const childControl of control.controls) {
          childControl.markAllAsTouched();
        }
      }
    });
  }

  comparison() {
    const firstForm = JSON.stringify(this.firstForm);
    const form = JSON.stringify(this.parentsForm.value);
    if (firstForm === form) {
      return true;
    } else {
      return false;
    }
  }

  getPostcodeDataSupport(parentIndex: number) {
    console.log(this.paymentAddressArrayForm, parentIndex);
    const country = this.paymentAddressArrayForm(parentIndex).at(0).get('country').value;
    const postCode = this.paymentAddressArrayForm(parentIndex).at(0).get('postal_code').value;
    if (postCode && postCode.length > 3 && country && country?.toLowerCase() === 'france') {
      this.subs.sink = this.rncpTitleService.getFilteredZipCode(postCode, country).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.setAddressDropdownSupport(resp, parentIndex);

            this.paymentAddressArrayForm(parentIndex).at(0).get('city').setValue(this.citySupport[parentIndex][0][0]);
            this.paymentAddressArrayForm(parentIndex).at(0).get('department').setValue(this.departmentSupport[parentIndex][0][0]);
            this.paymentAddressArrayForm(parentIndex).at(0).get('region').setValue(this.regionSupport[parentIndex][0][0]);
          }
        },
        (err) => {
          if (
            err &&
            err['message'] &&
            (err['message'].includes('jwt expired') ||
              err['message'].includes('str & salt required') ||
              err['message'].includes('Authorization header is missing') ||
              err['message'].includes('salt'))
          ) {
            this.userService.handlerSessionExpired();
            return;
          }
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

  setAddressDropdownSupport(resp: any, parentIndex: number) {
    const tempCities = [];
    const tempDepartments = [];
    const tempRegions = [];

    if (resp && resp.length) {
      resp.forEach((address) => {
        tempCities.push(address?.city);
        tempDepartments.push(address?.department);
        tempRegions.push(address?.province);
      });

      this.citySupport[parentIndex][0] = _.uniq(tempCities);
      this.departmentSupport[parentIndex][0] = _.uniq(tempDepartments);
      this.regionSupport[parentIndex][0] = _.uniq(tempRegions);

      this.filteredCitySupport[parentIndex][0] = this.citySupport[parentIndex][0];
      this.filteredDepartmentSupport[parentIndex][0] = this.departmentSupport[parentIndex][0];
      this.filteredRegionSupport[parentIndex][0] = this.regionSupport[parentIndex][0];
    }
  }

  filterCountrySupport(parentIndex: number) {
    if (this.paymentAddressArrayForm(parentIndex)?.at(0)?.get('country')?.value) {
      const searchString = this.paymentAddressArrayForm(parentIndex)?.at(0)?.get('country')?.value?.toLowerCase().trim();
      this.filteredCountrySupport[parentIndex][0] = this.countrieSupport.filter((country: any) =>
        this.translate
          .instant('COUNTRY.' + country)
          ?.toLowerCase()
          .trim()
          .includes(searchString),
      );
    }
  }

  filterCitySupport(parentIndex: number) {
    if (
      this.citySupport[parentIndex][0] &&
      this.citySupport[parentIndex][0].length &&
      this.paymentAddressArrayForm(parentIndex)?.at(0)?.get('city')?.value
    ) {
      const searchString = this.paymentAddressArrayForm(parentIndex)?.at(0)?.get('city')?.value?.toLowerCase().trim();
      this.filteredCitySupport[parentIndex][0] = this.citySupport[parentIndex][0].filter((city) =>
        city?.toLowerCase().trim().includes(searchString),
      );
    }
  }

  filterDepartmentSupport(parentIndex: number) {
    if (
      this.departmentSupport[parentIndex][0] &&
      this.departmentSupport[parentIndex][0].length &&
      this.paymentAddressArrayForm(parentIndex)?.at(0)?.get('department')?.value
    ) {
      const searchString = this.paymentAddressArrayForm(parentIndex)?.at(0)?.get('department')?.value?.toLowerCase().trim();
      this.filteredDepartmentSupport[parentIndex][0] = this.departmentSupport[parentIndex][0].filter((department) =>
        department?.toLowerCase().trim().includes(searchString),
      );
    }
  }

  filterRegionSupport(parentIndex: number) {
    if (this.regionSupport[parentIndex][0] && this.regionSupport[parentIndex][0].length) {
      const searchString = this.paymentAddressArrayForm(parentIndex).at(0).get('region').value.toLowerCase().trim();
      this.filteredRegionSupport[parentIndex][0] = this.regionSupport[parentIndex][0].filter((region) =>
        region?.toLowerCase().trim().includes(searchString),
      );
    }
  }

  countrySelected() {
    this.isResetCountry = false;
  }

  nationality1Selected() {
    this.isResetNationality = false;
  }

  compareEmailWithStudentFinancialSupport(paymentSupportIndex) {
    const currentEmail = this.paymentSupportsForm?.at(paymentSupportIndex)?.get('email')?.value;
    const studentEmail = this.candidate.email;
    const studentEmailSchool = this.candidate.school_mail;
    if (
      (currentEmail === studentEmail || currentEmail === studentEmailSchool) &&
      !this.paymentSupportsForm?.at(paymentSupportIndex)?.get('email')?.hasError('required')
    ) {
      this.paymentSupportsForm?.at(paymentSupportIndex)?.get('email')?.setErrors({ emailSamePS: true });
    }
  }

  compareEmailWithStudentParent(parentIndex) {
    const currentEmail = this.parentsArrayForm?.at(parentIndex)?.get('email')?.value;
    const studentEmail = this.candidate.email;
    const studentEmailSchool = this.candidate.school_mail;
    if (
      (currentEmail === studentEmail || currentEmail === studentEmailSchool) &&
      !this.parentsArrayForm?.at(parentIndex)?.get('email')?.hasError('required')
    ) {
      this.parentsArrayForm?.at(parentIndex)?.get('email')?.setErrors({ emailSame: true });
    }
  }

  sendingPayN3() {
    let timeDisabled = 5;
    Swal.fire({
      title: this.translate.instant('PAYMENT_INFORMATION_S1.TITLE'),
      html: this.translate.instant('PAYMENT_INFORMATION_S1.TEXT', {
        name:
          this.candidate.first_name +
          ' ' +
          this.candidate.last_name +
          ' ' +
          (this.candidate.civility === 'neutral' ? '' : this.translate.instant(this.candidate.civility)),
      }),
      type: 'info',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('PAYMENT_INFORMATION_S1.BUTTON1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('PAYMENT_INFORMATION_S1.BUTTON2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('PAYMENT_INFORMATION_S1.BUTTON1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('PAYMENT_INFORMATION_S1.BUTTON1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((resp) => {
      clearTimeout(this.timeOutVal);
      if (resp.value) {
        this.isWaitingForResponse = true;
        this.subs.sink = this.termPaymentService.SendPayN3(this.candidate._id).subscribe(
          (ressp) => {
            this.isWaitingForResponse = false;
            if (ressp) {
              Swal.fire({
                type: 'success',
                title: 'Bravo !',
              });
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            if (
              err &&
              err['message'] &&
              (err['message'].includes('jwt expired') ||
                err['message'].includes('str & salt required') ||
                err['message'].includes('Authorization header is missing') ||
                err['message'].includes('salt'))
            ) {
              this.userService.handlerSessionExpired();
              return;
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

  decimalFunction(value) {
    let cost = value;
    if (cost) {
      cost = cost.toFixed(2);
    }
    return cost;
  }

  getAllBilling() {
    const filter = {
      candidate_id: this.candidate?._id,
    };
    this.subs.sink = this.financeService?.getAllBillingContract(filter)?.subscribe(
      (resp) => {
        if (resp?.length) {
          const temp = _.cloneDeep(resp);
          this.billingData = temp;
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        if (err) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      }
    );
  }

  costCoverageFS(id, data){
    let tempData;
    if(id && data?.length){
      tempData = data?.filter((resp) => resp?.is_financial_support);
      tempData = tempData?.filter((resp) => resp?.financial_support_info?._id === id);
      return tempData[0]?.amount_billed;
    } else {
      return;
    }
  }
}
