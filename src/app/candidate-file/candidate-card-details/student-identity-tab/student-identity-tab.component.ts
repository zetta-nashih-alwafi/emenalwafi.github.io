import { UtilityService } from './../../../service/utility/utility.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormArray,
  Validators,
  UntypedFormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { StudentsService } from 'app/service/students/students.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { DateAdapter } from '@angular/material/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { SchoolService } from 'app/service/schools/school.service';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { CustomValidators } from 'ng2-validation';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { ApplicationUrls } from 'app/shared/settings';
import { PermissionService } from 'app/service/permission/permission.service';
import { Router } from '@angular/router';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import { AdmissionService } from 'app/service/admission/admission.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { CoreService } from 'app/service/core/core.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { debounceTime, take } from 'rxjs/operators';

@Component({
  selector: 'ms-student-identity-tab',
  templateUrl: './student-identity-tab.component.html',
  styleUrls: ['./student-identity-tab.component.scss'],
  providers: [ParseStringDatePipe],
})
export class StudentIdentityTabComponent implements OnInit, OnDestroy, OnChanges {
  @Input() candidateId: string;
  @Output() reloadData: EventEmitter<boolean> = new EventEmitter();
  private subs = new SubSink();

  // *************** START OF property to store data of country dial code
  flagsIconPath = '../../../../../assets/icons/flags-nationality/';
  @Input() countryCodeList: any[];
  dialCodeControl = new UntypedFormControl(null);
  // *************** END OF property to store data of country dial code

  identityForm: UntypedFormGroup;
  collegeForm: UntypedFormGroup;
  nationalitiesList = [];
  nationalList = [];
  nationalitySelected: string;
  @ViewChild('userphoto', { static: false }) uploadInput: any;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  today: Date;
  minimumDateOfBirth: Date;

  isWaitingForResponse = false;
  countries;
  countryList;
  filteredCountry: any[][] = [];
  filteredCountryOfBirth: any[][] = [];
  filteredCountryCollege: any[][] = [];
  cities: string[][] = [];
  filteredCities: string[][] = [];
  departments: string[][] = []; // in API, this field called "academy"
  filteredDepartments: string[][] = [];
  regions: string[][] = []; // in API, this field called "province"
  filteredRegions: string[][] = [];

  photo: string;
  photo_s3_path: string;
  is_photo_in_s3: boolean;
  myInnerHeight = 1920;
  studentData: any;

  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  private intVal: any;
  private timeOutVal: any;

  isResetCountry = true;
  isResetCountryOfBirth = true;
  isResetCountryCollege = true;
  isResetNationality = true;
  firstForm: any;

  coverage = {
    cost: null,
    so: null,
  };

  imageBeforeCompressed;
  imageAfterCompressed;

  disableButtonVerify = true;
  currentEmail: any;
  disableButtonSave = false;
  candidateData: any;

  constructor(
    private admissionService: AdmissionService,
    private dateAdapter: DateAdapter<Date>,
    private fb: UntypedFormBuilder,
    private fileUploadService: FileUploadService,
    private imageCompress: NgxImageCompressService,
    private pageTitleService: PageTitleService,
    private rncpTitleService: RNCPTitlesService,
    private router: Router,
    private schoolService: SchoolService,
    private studentService: StudentsService,
    private translate: TranslateService,
    private utilService: UtilityService,
    public authService: AuthService,
    public coreService: CoreService,
    public permissionService: PermissionService,
  ) {}

  ngOnInit() {
    this.updatePageTitle();
    this.subs.sink = this.studentService
      .getAllCountries()
      .pipe(take(1))
      .subscribe((list) => {
        this.countries = list.map((item) => item?.country);
        this.identityForm.get('country').updateValueAndValidity();
        this.identityForm.get('country_of_birth').updateValueAndValidity();
      });
    this.dateAdapter.setLocale(this.translate.currentLang);
    this.today = new Date();
    this.minimumDateOfBirth = this.getMinimumDateOfBirth();
    this.initForm();
    this.initEmail();
  }

  ngOnChanges() {
    this.reloadData.emit(true);
    this.initForm();
    this.initCollegeForm();
    this.dialCodeControl?.reset();
    this.resetData();
    this.getOneCandidate();
    this.subs.sink = this.studentService
      .getAllNationalities()
      .pipe(take(1))
      .subscribe((response) => {
        this.nationalitiesList = response;
        this.identityForm.get('nationality').updateValueAndValidity();
        this.identityForm.get('nationality_second').updateValueAndValidity();
      });
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      const backupValue = this.identityForm.value;
      this.identityForm.patchValue(backupValue);
    });
    this.initEmail();
  }

  updatePageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('Student Card Identity'));
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(this.translate.instant('Student Card Identity'));
    });
  }

  getOneCandidate() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.getOneCandidateDetail(this.candidateId).subscribe(
      (res) => {
        if (res) {
          console.log('_res', res);
          const resultData = _.cloneDeep(res);
          this.candidateData = _.cloneDeep(res);
          if (resultData.photo) {
            this.is_photo_in_s3 = true;
            this.photo_s3_path = resultData.photo;
          } else {
            this.photo_s3_path = resultData.photo;
            this.is_photo_in_s3 = false;
          }
          if (resultData && resultData.telephone) {
            resultData.telephone = resultData.telephone;
          }
          if (resultData && resultData.fixed_phone) {
            resultData.fixed_phone = resultData.fixed_phone;
          }

          if (resultData && resultData.last_name_used) {
            resultData.last_name_used = resultData.last_name_used;
          }

          if (resultData && resultData.first_name_used) {
            resultData.first_name_used = resultData.first_name_used;
          }

          // reset value when coming from edit
          this.isResetCountry = false;
          this.isResetCountryOfBirth = false;
          this.isResetNationality = false;

          if (resultData?.date_of_birth && resultData?.date_of_birth !== 'Invalid date') {
            resultData.date_of_birth = moment(resultData.date_of_birth, 'DD/MM/YYYY').format('YYYY-MM-DD');
          } else {
            resultData.date_of_birth = null;
          }

          if(resultData?.phone_number_indicative) {
            const findIdx = this.countryCodeList?.findIndex((country) => country?.dialCode === res?.phone_number_indicative)
            if(findIdx >= 0) this.dialCodeControl?.patchValue(this.countryCodeList[findIdx]);
          }
          
          this.currentEmail = resultData.email;
          this.identityForm.patchValue(resultData);
          this.firstForm = this.identityForm.getRawValue();
          this.coverage.cost = res.cost.toFixed(2);
          this.isWaitingForResponse = false;
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
          this.authService.handlerSessionExpired();
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

  resetData() {
    this.countries = [];
    this.filteredCountry = [];
    this.filteredCountryOfBirth = [];
    this.filteredCountryCollege = [];
    this.cities = [];
    this.filteredCities = [];
    this.departments = [];
    this.filteredDepartments = [];
    this.regions = [];
    this.filteredRegions = [];
    this.nationalitiesList = [];
  }

  initForm() {
    this.identityForm = this.fb.group({
      civility: [null],
      first_name: [null, Validators.required],
      last_name: [null, Validators.required],
      telephone: [null, Validators.pattern('[- ()0-9]+')], // *************** need to update the regex pattern to prevent the special characters
      fixed_phone: [null],
      email: [null, [CustomValidators.email, Validators.required]],
      date_of_birth: [null],
      city_of_birth: [null],
      place_of_birth: [null],
      country_of_birth: [null, [this.countryValidator.bind(this)]],
      post_code_of_birth: [null],
      nationality: ['', [this.nationalityValidator.bind(this)]],
      nationality_second: ['', [this.nationalityValidator.bind(this)]],
      address: [null],
      post_code: [null],
      country: ['France', [this.countryValidator.bind(this)]],
      city: [null],
      region: [null],
      department: [null],
      photo: [null],
      compressed_photo: [null],
      account_holder_name: [null],
      iban: [null],
      bic: [null],
      last_name_used: [null],
      first_name_used: [null],
      phone_number_indicative: [null],
      college: this.collegeForm
    });
  }

  initCollegeForm(){
    this.collegeForm = this.fb.group({
      name: [null], 
      postal_code: [null],
      country: [null],
      city: [null]
    });
  }

  selectionDialCode(event) {
    this.identityForm?.get('phone_number_indicative')?.reset();
    this.identityForm?.get('phone_number_indicative')?.patchValue(event?.dialCode);
  }

  getPostcodeData() {
    const country = this.identityForm.get('country').value;
    const postCode = this.identityForm.get('post_code').value;

    if (postCode && country && postCode.length > 3 && country.toLowerCase() === 'france') {
      this.subs.sink = this.rncpTitleService.getFilteredZipCode(postCode, country).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.setAddressDropdown(resp, 0);

            this.identityForm.get('city').setValue(this.cities[0][0]);
            this.identityForm.get('department').setValue(this.departments[0][0]);
            this.identityForm.get('region').setValue(this.regions[0][0]);
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
            this.authService.handlerSessionExpired();
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

  setAddressDropdown(resp: any, addressIndex: number) {
    const tempCities = [];
    const tempDepartments = [];
    const tempRegions = [];

    if (resp && resp.length) {
      resp.forEach((address) => {
        tempCities.push(address.city);
        tempDepartments.push(address.department);
        tempRegions.push(address.province);
      });

      this.cities[addressIndex] = _.uniq(tempCities);
      this.departments[addressIndex] = _.uniq(tempDepartments);
      this.regions[addressIndex] = _.uniq(tempRegions);

      this.filteredCities[addressIndex] = this.cities[addressIndex];
      this.filteredDepartments[addressIndex] = this.departments[addressIndex];
      this.filteredRegions[addressIndex] = this.regions[addressIndex];
    }
  }
  
  restoreCountry(addressIndex: number, form: string) {
    if (form === 'country_of_birth') {
      this.filteredCountryOfBirth[addressIndex] = this.countries;
      this.isResetCountryOfBirth = true;
    } else if (form === 'college_country') {
      this.filteredCountryCollege[addressIndex] = this.countries;
      this.isResetCountryCollege = true;
    } else {
      this.filteredCountry[addressIndex] = this.countries;
      this.isResetCountry = true;
    }
  }

  restoreNationality() {
    const translated = (str: string) => String(this.translate.instant(`NATIONALITY.${str}`));
    this.nationalList = this.nationalitiesList
      .sort((current, next) => {
        return translated(String(current?.nationality_en))
          .toLowerCase()
          .trim()
          .localeCompare(translated(String(next?.nationality_en)).toLowerCase().trim());
      });
    this.isResetNationality = true;
  }

  filterNationality(rawSearchString: string) {
    const searchString = rawSearchString.toLowerCase().trim();
    const translated = (str: string) => String(this.translate.instant(`NATIONALITY.${str}`));
    this.nationalList = this.nationalitiesList
      .filter((nationality) => {
        if (!nationality.nationality_en) return false;
        return this.utilService
          .simplifyRegex(translated(nationality.nationality_en))
          .toLowerCase()
          .trim()
          .includes(String(searchString).toLowerCase().trim());
      })
      .sort((current, next) => {
        return translated(String(current?.nationality_en))
          .toLowerCase()
          .trim()
          .localeCompare(translated(String(next?.nationality_en)).toLowerCase().trim());
      });
    this.isResetNationality = true;
  }

  filterCountry(addressIndex: number, form) {
    let searchString = ''
    if(form !== 'college_country'){
      searchString = this.identityForm.get(form).value.toLowerCase().trim();
    }
    const searchCollegeString = this.collegeForm.get('country')?.value?.toLowerCase()?.trim();

    if (form === 'country_of_birth') {
      this.filteredCountryOfBirth[addressIndex] = this.countries.filter((country) => country.toLowerCase().trim().includes(searchString));
      this.isResetCountryOfBirth = true;
    } else if (form === 'college_country') {
      this.filteredCountryCollege[addressIndex] = this.countries.filter((country) => country.toLowerCase().trim().includes(searchCollegeString));
      this.isResetCountryCollege = true;
    } else {
      this.filteredCountry[addressIndex] = this.countries.filter((country) => country.toLowerCase().trim().includes(searchString));
      this.isResetCountry = true;
    }
  }

  filterCity(addressIndex: number) {
    if (this.cities[addressIndex] && this.cities[addressIndex].length) {
      const searchString = this.identityForm.get('city').value.toLowerCase().trim();
      this.filteredCities[addressIndex] = this.cities[addressIndex].filter((city) => city.toLowerCase().trim().includes(searchString));
    }
  }

  filterDepartment(addressIndex: number) {
    if (this.departments[addressIndex] && this.departments[addressIndex].length) {
      const searchString = this.identityForm.get('department').value.toLowerCase().trim();
      this.filteredDepartments[addressIndex] = this.departments[addressIndex].filter((department) =>
        department.toLowerCase().trim().includes(searchString),
      );
    }
  }

  filterRegion(addressIndex: number) {
    if (this.regions[addressIndex] && this.regions[addressIndex].length) {
      const searchString = this.identityForm.get('region').value.toLowerCase().trim();
      this.filteredRegions[addressIndex] = this.regions[addressIndex].filter((region) =>
        region.toLowerCase().trim().includes(searchString),
      );
    }
  }

  openUploadWindow() {
    const file = this.uploadInput.nativeElement.click();
  }

  handleInputChange(fileInput: Event) {
    const file = (<HTMLInputElement>fileInput.target).files[0];
    this.photo = '';
    this.photo_s3_path = '';
    this.is_photo_in_s3 = false;

    if (file) {
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          if (resp) {
            this.photo = resp.file_name;
            this.photo_s3_path = resp.s3_file_name;
            this.is_photo_in_s3 = true;
            this.identityForm.get('photo').setValue(resp.s3_file_name);
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
            this.authService.handlerSessionExpired();
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
    this.resetFileState();
  }

  resetFileState() {
    this.uploadInput.nativeElement.value = '';
  }

  getNationalitySelected(data) {
    this.nationalitySelected = data.nationality_en.toLowerCase();
  }

  displayNationality(country): string {
    if (typeof this.translate?.instant !== 'function') {
      return country
    }
    return country ? this.translate.instant(`NATIONALITY.${country}`, { default: country }) : null;
  }

  displayCountry(country): string {
    if (typeof this.translate?.instant !== 'function') {
      return country
    }
    return country ? this.translate.instant(`COUNTRY.${country}`, { default: country }) : null;
  }

  countryValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    const translated = (str: string) => this.translate.instant(`NATIONALITY.${str}`);
    const countries = Array.isArray(this.countries) ? this.countries : [];
    const valid = countries.find((country) => {
      if (!country) return false;
      return translated(country) === translated(value);
    });
    return valid ? null : { wrongCountry: true };
  }

  nationalityValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    const translated = (str: string) => this.translate.instant(`NATIONALITY.${str}`);
    const valid = this.nationalitiesList.find((nationality) => {
      if (!nationality?.nationality_en) return false;
      return translated(nationality.nationality_en) === translated(value);
    });
    return valid ? null : { wrongNationality: true };
  }

  createPayload() {
    const payload = _.cloneDeep(this.identityForm.value);
    return payload;
  }

  updateCandidate() {
    if (this.identityForm.invalid) {
      if (this.identityForm.get('email').hasError('email') || this.identityForm.get('telephone').hasError('pattern')) {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('Invalid_Format.Title'),
          html: this.translate.instant('Invalid_Format.Text'),
          confirmButtonText: this.translate.instant('Invalid_Format.Button'),
        });
        this.identityForm.markAllAsTouched();
      } else {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('FormSave_S1.TITLE'),
          html: this.translate.instant('FormSave_S1.TEXT'),
          confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        }).then(() => {
          this.identityForm.markAllAsTouched();
          this.identityForm.markAsDirty();
        });
      }
    } else {
      this.isWaitingForResponse = true;
      const payload = this.createPayload();
      payload.date_of_birth = moment(payload.date_of_birth, 'YYYY-MM-DD').format('DD/MM/YYYY');
      // *************** UAT_970 add flag to update status when there is update in student card there is no swal error display even required field is still empty
      const is_save_identity_student = true;
      this.subs.sink = this.admissionService.UpdateCandidate(this.candidateId, payload, is_save_identity_student).subscribe(
        (res) => {
          if (res) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SAVE_CANDIDATE.TITLE'),
              html: this.translate.instant('SAVE_CANDIDATE.TEXT'),
              confirmButtonText: this.translate.instant('SAVE_CANDIDATE.BUTTON_1'),
              showCancelButton: true,
              cancelButtonText: this.translate.instant('SAVE_CANDIDATE.BUTTON_2'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(
              (resp) => {
                if (resp.value) {
                  this.subs.sink = this.admissionService.GeneratePDFSchoolContract(this.candidateId).subscribe(
                    (daata) => {
                      this.subs.sink = this.admissionService.GeneratePDFRegistrationCandidate(this.candidateId).subscribe(
                        (data) => {
                          Swal.fire({
                            type: 'success',
                            title: this.translate.instant('Bravo'),
                            confirmButtonText: this.translate.instant('OK'),
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                          }).then(() => {
                            this.getOneCandidate();
                            this.isWaitingForResponse = false;
                            this.reloadData.emit(true);
                          });
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
                            this.authService.handlerSessionExpired();
                            return;
                          } else {
                            Swal.fire({
                              type: 'info',
                              title: this.translate.instant('SORRY'),
                              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                            }).then(() => {
                              this.getOneCandidate();
                              this.reloadData.emit(true);
                            });
                          }
                        },
                      );
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
                        this.authService.handlerSessionExpired();
                        return;
                      }
                      if (
                        err['message'] ===
                          'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' ||
                        err['message'] ===
                          'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC'
                      ) {
                        Swal.fire({
                          type: 'info',
                          title: this.translate.instant('LEGAL_S5.Title'),
                          text: this.translate.instant('LEGAL_S5.Text'),
                          confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
                        }).then(() => {
                          this.getOneCandidate();
                          this.reloadData.emit(true);
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
                        }).then(() => {
                          this.getOneCandidate();
                          this.reloadData.emit(true);
                        });
                      } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
                        Swal.fire({
                          type: 'info',
                          title: this.translate.instant('IBAN_S1.Title'),
                          text: this.translate.instant('IBAN_S1.Text'),
                          confirmButtonText: this.translate.instant('IBAN_S1.Button'),
                        }).then(() => {
                          this.getOneCandidate();
                          this.reloadData.emit(true);
                        });
                      } else {
                        Swal.fire({
                          type: 'info',
                          title: this.translate.instant('SORRY'),
                          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                        }).then(() => {
                          this.getOneCandidate();
                          this.reloadData.emit(true);
                        });
                      }
                    },
                  );
                } else {
                  Swal.fire({
                    type: 'success',
                    title: this.translate.instant('Bravo'),
                    confirmButtonText: this.translate.instant('OK'),
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                  }).then(() => {
                    this.getOneCandidate();
                    this.isWaitingForResponse = false;
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
                  this.authService.handlerSessionExpired();
                  return;
                }
                if (
                  err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' ||
                  err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC'
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
            this.authService.handlerSessionExpired();
            return;
          }
          if (
            err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' ||
            err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC'
          ) {
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

  async checkFormValidity(): Promise<boolean> {
    // isWaitingForResponse || checkComparison() || identityForm.invalid
    console.log(this.identityForm.invalid, this.isResetCountry, this.isResetNationality, this.isResetCountryOfBirth);
    if (this.identityForm.invalid || this.isResetCountry || this.isResetNationality || this.isResetCountryOfBirth) {
      const action = await Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.resetInvalidAutoCompeleteValue();
      this.markAllFieldsAsTouched(this.identityForm);
      return false;
    } else {
      return true;
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
      }
    });
  }

  checkComparison() {
    const firstForm = JSON.stringify(this.firstForm);
    const form = JSON.stringify(this.identityForm.getRawValue());
    if (firstForm === form) {
      return true;
    } else {
      return false;
    }
  }

  resetInvalidAutoCompeleteValue() {
    if (this.isResetCountry) {
      this.identityForm.get('country').setValue('');
    }
    if (this.isResetCountryOfBirth) {
      this.identityForm.get('country_of_birth').setValue('');
    }
    if (this.isResetNationality) {
      this.identityForm.get('nationality').setValue('');
    }
  }

  countrySelected(data) {
    if (data === 'country') {
      this.isResetCountry = false;
    } else if (data === 'country_of_birth') {
      this.isResetCountryOfBirth = false;
    }
  }

  nationalityOptionClicked() {
    this.isResetNationality = false;
  }

  selectFile(fileInput: Event) {
    const acceptable = ['jpg', 'jpeg', 'png'];
    this.imageBeforeCompressed = (<HTMLInputElement>fileInput.target).files[0];
    if (this.imageBeforeCompressed) {
      const fileType = this.utilService.getFileExtension(this.imageBeforeCompressed.name).toLocaleLowerCase();
      if (acceptable.includes(fileType)) {
        if (this.imageBeforeCompressed.size > 5000000) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('UPLOAD_IMAGE.TITLE'),
            text: this.translate.instant('UPLOAD_IMAGE.TEXT'),
            confirmButtonText: this.translate.instant('UPLOAD_IMAGE.BUTTON'),
          });
        } else {
          this.isWaitingForResponse = true;
          const fileName = this.imageBeforeCompressed?.name;
          const size = this.imageBeforeCompressed?.size;
          const reader = new FileReader();
          reader.onload = (read: any) => {
            const localUrl = read.target.result;
            this.compressFile(localUrl, fileName, size);
          };
          reader.readAsDataURL(this.imageBeforeCompressed);
        }
      } else {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
          text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.jpg, .jpeg, .png' }),
          allowEscapeKey: false,
          allowOutsideClick: false,
          allowEnterKey: false,
        });
      }
    }
  }

  compressFile(image, fileName, size) {
    const orientation = -1;
    let ratio: number;
    const compressedName = fileName.substring(0, fileName.lastIndexOf('.')) + '-Compressed' + fileName.substring(fileName.lastIndexOf('.'));
    // console.log('image size', size);

    // set ratio based on image size
    if (size > 3000000 && size <= 5000000) {
      ratio = 20;
    } else if (size >= 1000000 && size <= 3000000) {
      ratio = 30;
    } else if (size < 1000000) {
      ratio = 40;
    }
    // console.log('ratio:',ratio+'%');

    //compress image
    if (ratio) {
      this.imageCompress.compressFile(image, orientation, ratio, 50).then((result) => {
        fetch(result)
          .then((res) => res.blob())
          .then((blob) => {
            this.imageAfterCompressed = new File([blob], compressedName, { type: 'image/png' });
            // console.log('Before:', this.imageBeforeCompressed);
            // console.log('After:', this.imageAfterCompressed);
            this.uploadFile(this.imageAfterCompressed, this.imageBeforeCompressed);
          });
      });
    }
  }

  getMinimumDateOfBirth() {
    const now = new Date();
    return new Date(now.setFullYear(now.getFullYear() - 14));
  }

  uploadFile(imageAfter: File, imageBefore: File) {
    this.photo = '';
    this.photo_s3_path = '';
    this.is_photo_in_s3 = false;
    // upload image after compressed
    if (imageAfter) {
      this.subs.sink = this.fileUploadService.singleUpload(imageAfter).subscribe(
        (resp) => {
          if (resp) {
            console.log('Image compressed upload success');
            this.identityForm.get('compressed_photo').setValue(resp.s3_file_name);
          }
        },
        (err) => {
          if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
              title: 'Error !',
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            }).then((res) => {
              console.log('[BE Message] Error is : ', err);
            });
          }
        },
      );
    }
    // upload image before compressed
    if (imageBefore) {
      this.subs.sink = this.fileUploadService.singleUpload(imageBefore).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            this.photo = resp.file_name;
            this.photo_s3_path = resp.s3_file_name;
            this.is_photo_in_s3 = true;
            this.identityForm.get('photo').setValue(resp.s3_file_name);
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          }).then((res) => {
            console.log('[BE Message] Error is : ', err);
          });
        },
      );
    }
    this.resetFileState();
  }

  initEmail() {
    this.identityForm
      ?.get('email')
      ?.valueChanges?.pipe(debounceTime(400))
      .subscribe((resp) => {
        if (resp !== this.currentEmail) {
          this.disableButtonVerify = false;
          this.disableButtonSave = true;
        } else {
          this.disableButtonVerify = true;
          this.disableButtonSave = false;
        }
      });
  }

  verifyEmail() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService
      ?.checkEmailAvailbility(this.identityForm?.get('email')?.value, this.candidateData?.user_id?._id)
      .subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo'),
              confirmButtonText: this.translate.instant('OK'),
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then(() => {
              this.disableButtonSave = false;
            });
          }
        },
        (error) => {
          this.isWaitingForResponse = false;
          if (error) {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('SWAL_USER_EXIST_DUMMY.TITLE'),
              text: this.translate.instant('SWAL_USER_EXIST_DUMMY.TEXT'),
              confirmButtonText: this.translate.instant('SWAL_USER_EXIST_DUMMY.BUTTON'),
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then(() => {
              this.disableButtonSave = true;
            });
          }
        },
      );
  }
}
