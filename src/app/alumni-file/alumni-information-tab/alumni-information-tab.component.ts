import { AuthService } from './../../service/auth-service/auth.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { SubSink } from 'subsink';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { StudentsService } from 'app/service/students/students.service';
import * as _ from 'lodash';
import { SchoolService } from 'app/service/schools/school.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { AlumniService } from 'app/service/alumni/alumni.service';
import Swal from 'sweetalert2';
import { CustomValidators } from 'ng2-validation';
import { PermissionService } from 'app/service/permission/permission.service';
import { Router } from '@angular/router';
import { UtilityService } from 'app/service/utility/utility.service';
import { Observable, of } from 'rxjs';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import * as moment from 'moment';
import { CoreService } from 'app/service/core/core.service';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { AdmissionService } from 'app/service/admission/admission.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'ms-alumni-information-tab',
  templateUrl: './alumni-information-tab.component.html',
  styleUrls: ['./alumni-information-tab.component.scss'],
  providers: [ParseStringDatePipe, ParseLocalToUtcPipe],
})
export class AlumniInformationTabComponent implements OnInit, OnChanges, OnDestroy {
  private subs = new SubSink();
  @Input() candidate;
  @Input() schoolId: string;
  @Output() reloadData: EventEmitter<boolean> = new EventEmitter();
  @Output() continue = new EventEmitter<boolean>();
  informationForm: UntypedFormGroup;

  today: Date;
  isMainAddressSelected = [false, false];

  sliderJob = new UntypedFormControl(false);
  newsJob = new UntypedFormControl(false);
  communicationJob = new UntypedFormControl(false);
  isWaitingForResponse = false;
  isResetCountry = false;
  isResetNationality = true;
  firstForm: any;

  countries;
  countryList;
  filteredCountry: any[][] = [];
  cities: string[][] = [];
  filteredCities: string[][] = [];
  departments: string[][] = []; // in API, this field called "academy"
  filteredDepartments: string[][] = [];
  regions: string[][] = []; // in API, this field called "province"
  filteredRegions: string[][] = [];
  promotionYear = []; // in API, this field called "academy"
  filteredPromotionYear = [];
  speciality: string[] = [];
  filteredSpeciality = [];
  alumniSurveyData;
  relationList = ['father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'other'];
  alumniSelected = '';
  surveyId = '';
  isMainAddress = [];
  todayDate: Date;
  studentAddress: any = [];
  private intVal: any;
  private timeOutVal: any;

  promotionList = [];
  schoolList = [];
  campusList = [];
  sectorList = [];
  specialityList = [];
  proffesionalList = ['unemployed', 'employed'];
  filteredCurrentProgram: Observable<any[]>;
  filteredSchool: Observable<any[]>;
  filteredCampus: Observable<any[]>;
  promoYearFilter = new UntypedFormControl('');
  specilityList;
  listObjective = [];
  school = [];
  currentUser;
  isPermission;
  currentUserTypeId;

  disableButtonVerify = true;
  currentEmail:any;
  disableButtonSave = false;

  constructor(
    private fb: UntypedFormBuilder,
    private schoolService: SchoolService,
    private utilService: UtilityService,
    private rncpTitleService: RNCPTitlesService,
    private translate: TranslateService,
    public permissionService: PermissionService,
    public alumniService: AlumniService,
    private parseStringDatePipe: ParseStringDatePipe,
    private parseLocalToUtcPipe: ParseLocalToUtcPipe,
    public coreService: CoreService,
    public pageTitleService: PageTitleService,
    private userService: AuthService,
    private admissionService: AdmissionService
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    // this.updatePageTitle();
    this.today = new Date();
    if (this.candidate && this.candidate._id) {
      this.alumniSelected = this.candidate._id;
    }
    this.todayDate = new Date();
    this.initForm();
    this.initFilter();
    this.getDataPromoYear();
    this.getDataSchoolCampus();
    this.initEmail();
    // this.getDataSector();
    // this.getDataSpeciality();
    // this.populateDataSurvey();
    setTimeout(() => {
      this.coreService.sidenavOpen = false;
    }, 1000);
  }

  ngOnChanges() {
    if (this.candidate && this.candidate._id) {
      this.alumniSelected = this.candidate._id;
    } else {
      this.alumniSelected = null;
    }
    this.subs.sink = this.schoolService.getCountry().subscribe((list: any[]) => {
      this.countries = list.map((ls) => ls?.name);
    });
    this.initForm();
    this.getDataPromoYear();
    this.getDataSchoolCampus();
    this.initEmail();
    // this.getDataSector();
    // this.getDataSpeciality();
    // this.populateDataSurvey();
  }

  updatePageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('NAV.alumni-cards'));
    this.subs.sink = this.translate.onLangChange.subscribe(() => {
      this.pageTitleService.setTitle(this.translate.instant('NAV.alumni-cards'));
    });
  }

  initFilter() {
    this.subs.sink = this.promoYearFilter.valueChanges.subscribe((statusSearch) => {
      if (typeof statusSearch === 'string') {
        const result = this.promotionList.filter((program) =>
          this.utilService.simplifyRegex(program).includes(this.utilService.simplifyRegex(statusSearch)),
        );
        this.filteredCurrentProgram = of(result);
      }
    });
  }

  populateDataSurvey() {
    if (this.alumniSelected) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.alumniService.getOneAlumniDetail(this.alumniSelected).subscribe(
        (alumni) => {
          if (alumni) {
            this.alumniSurveyData = alumni;
            const payload = _.cloneDeep(this.alumniSurveyData);
            if (payload.school && payload.school._id) {
              payload.school = payload.school._id;
              this.informationForm.get('school').setValue(payload.school);
              this.getDataCampus();
            }
            if (payload.campus && payload.campus._id) {
              payload.campus = payload.campus._id;
              this.informationForm.get('campus').setValue(payload.campus);
              this.getDataSector();
            }
            if (payload.sector && payload.sector._id) {
              payload.sector = payload.sector._id;
              this.informationForm.get('sector').setValue(payload.sector);
              this.getDataSpeciality();
            }
            if (payload.speciality && payload.speciality._id) {
              payload.speciality = payload.speciality._id;
            }
            if (payload.date_of_birth) {
              payload.date_of_birth = this.parseStringDatePipe.transform(payload.date_of_birth);
            }
            if (!payload.promo_year) {
              payload.promo_year = null;
            }
            if (!payload.country) {
              payload.country = null;
            }
            this.informationForm.patchValue(payload);
            this.currentEmail = payload?.email;
            this.firstForm = this.informationForm.getRawValue();
            this.isWaitingForResponse = false;
          }
        },
        (error) => {
          // Record error log
          this.userService.postErrorLog(error);
          if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
              title: this.translate.instant('SORRY'),
              text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translate.instant('OK'),
            });
          }
        },
      );
    }
  }

  translateText(key) {
    return this.translate.instant(key, { name: this.informationForm.get('school').value ? this.informationForm.get('school').value : '' });
  }

  initForm() {
    this.informationForm = this.fb.group({
      civility: [null],
      first_name: [null, Validators.required],
      used_last_name: [null],
      last_name: [null, Validators.required],
      promo_year: [null],
      school: [null],
      campus: [null],
      sector: [null],
      speciality: [null],
      rncp_title: [null],
      email: [null, [Validators.required, CustomValidators.email]],
      phone_number: [null],
      city: [null],
      country: [null],
      department: [null],
      region: [null],
      company: [null],
      job_name: [null],
      activity_sector: [null],
      date_of_birth: [null],
      personal_address: [null],
      personal_postcode: [null],
      professional_status: [null],
    });
    this.firstForm = this.informationForm.getRawValue();
  }

  async saveInformation() {
    if (!(await this.checkFormValidity())) {
      return;
    }
    const currentTime = moment(this.today).format('HH:mm');
    const currentDate = moment(this.today, 'DD/MM/YYYY').format('DD/MM/YYYY');
    const utcTime = moment(currentTime, 'HH:mm').add(-moment().utcOffset(), 'm').format('HH:mm');
    const date = this.parseLocalToUtcPipe.transformDate(currentDate, currentTime);
    const payload = _.cloneDeep(this.informationForm.value);
    if (payload.date_of_birth) {
      payload.date_of_birth = moment(payload.date_of_birth, 'YYYY-MM-DD').format('DD/MM/YYYY');
    }
    this.isWaitingForResponse = true;
    this.subs.sink = this.alumniService.UpdateAlumni(payload, this.alumniSelected).subscribe(
      (resp) => {
        if (resp) {
          const newNoteHistory = {
            alumni_id: this.candidate._id,
            history_date: date,
            history_time: utcTime,
            action: 'Update informations',
            who: this.utilService.getCurrentUser()._id,
            description: 'Information is recently updated',
          };

          this.subs.sink = this.alumniService.createAlumniHistory(newNoteHistory).subscribe(
            (ressp) => {
              Swal.close();
              if (ressp) {
                this.isWaitingForResponse = false;
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('Bravo!'),
                  confirmButtonText: this.translate.instant('OK'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.reloadData.emit(true);
                });
              }
            },
            (error) => {
              // Record error log
              this.userService.postErrorLog(error);
              this.reloadData.emit(true);
              if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
                  title: this.translate.instant('SORRY'),
                  text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                  confirmButtonText: this.translate.instant('OK'),
                });
              }
            },
          );
        }
      },
      (error) => {
        // Record error log
        this.userService.postErrorLog(error);
        this.reloadData.emit(true);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
            title: this.translate.instant('SORRY'),
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }

  getDataPromoYear() {
    this.subs.sink = this.alumniService.GetAllAlumniPromoYear().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.promotionList = resp.filter((program) => program !== '');
        }
      },
      (error) => {
        // Record error log
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
            title: this.translate.instant('SORRY'),
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  getDataSchoolCampus() {
    this.campusList = [];
    this.sectorList = [];
    this.specialityList = [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.alumniService.getAllCandidateSchool(this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.schoolList = resp.filter((school) => school.short_name !== '');
          // this.schoolList.filter((campus, n) => {
          //   if (campus.campuses && campus.campuses.length) {
          //     campus.campuses.filter((campuses, nex) => {
          //       this.campusList.push(campuses);
          //     });
          //   }
          // });
          // this.campusList = _.uniqBy(this.campusList, 'name');
        }
        this.populateDataSurvey();
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
      },
    );
  }

  getDataCampus() {
    this.campusList = [];
    this.sectorList = [];
    this.specialityList = [];

    if (this.informationForm.get('campus').value) {
      this.informationForm.get('campus').setValue(null);
    }
    if (this.informationForm.get('sector').value) {
      this.informationForm.get('sector').setValue(null);
    }
    if (this.informationForm.get('speciality').value) {
      this.informationForm.get('speciality').setValue(null);
    }

    const schoolId = this.informationForm.get('school').value;
    console.log('getDataCampus', schoolId);
    const scampusList = [];
    const found = this.schoolList.find((element) => element && element._id === schoolId);
    if (found) {
      scampusList.push(found);
    }
    if (scampusList) {
      scampusList.forEach((campus) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses) => {
            this.campusList.push(campuses);
          });
        }
      });
    }
    this.campusList = _.uniqBy(this.campusList, 'name');
    if (!schoolId) {
      this.schoolList.filter((campus) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses) => {
            this.campusList.push(campuses);
          });
        }
      });
      this.campusList = _.uniqBy(this.campusList, 'name');
    }
  }

  getDataSector() {
    this.sectorList = [];
    this.specialityList = [];

    if (this.informationForm.get('sector').value) {
      this.informationForm.get('sector').setValue(null);
    }
    if (this.informationForm.get('speciality').value) {
      this.informationForm.get('speciality').setValue(null);
    }

    const filter = {
      candidate_school_ids: this.informationForm.get('school').value ? this.informationForm.get('school').value : null,
      campuses: this.informationForm.get('campus').value ? this.informationForm.get('campus').value : null,
    };
    if (this.informationForm.get('campus').value) {
      this.subs.sink = this.alumniService.getAllSectors(filter).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.sectorList = resp.filter((sector) => sector.name !== '');
          }
        },
        (error) => {
          this.userService.postErrorLog(error);
          if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
              title: this.translate.instant('SORRY'),
              text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translate.instant('OK'),
            });
          }
        },
      );
    }
  }

  getDataSpeciality() {
    this.specialityList = [];

    if (this.informationForm.get('speciality').value) {
      this.informationForm.get('speciality').setValue(null);
    }

    const filter = {
      candidate_school_ids: this.informationForm.get('school').value ? this.informationForm.get('school').value : null,
      campuses: this.informationForm.get('campus').value ? this.informationForm.get('campus').value : null,
      sectors: this.informationForm.get('sector').value ? this.informationForm.get('sector').value : null,
    };
    if (this.informationForm.get('sector').value) {
      this.subs.sink = this.alumniService.getAllSpecialities(filter).subscribe((resp) => {
        if (resp && resp.length) {
          this.specialityList = resp.filter((speciality) => speciality.name !== '');
        }
      });
    }
  }

  getDataSpecialityBasedSector(sector) {
    this.specialityList = [];
    this.informationForm.get('speciality').setValue(null);
    const sectorFound = this.sectorList.filter((list) => list._id === sector);
    const sectorId = sectorFound && sectorFound.length ? sectorFound[0]._id : '';
    this.subs.sink = this.alumniService.getAllSpecializations(sectorId).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.specialityList = resp.filter((speciality) => speciality.name !== '');
        }
      },
      (error) => {
        // Record error log
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
            title: this.translate.instant('SORRY'),
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  getPostcodeData() {
    const country = this.informationForm.get('country').value;
    const postCode = this.informationForm.get('personal_postcode').value;

    if (postCode && country && postCode.length > 3 && country.toLowerCase() === 'france') {
      this.subs.sink = this.rncpTitleService.getFilteredZipCode(postCode, country).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.setAddressDropdown(resp, 0);

            this.informationForm.get('city').setValue(this.cities[0][0]);
            this.informationForm.get('department').setValue(this.departments[0][0]);
            this.informationForm.get('region').setValue(this.regions[0][0]);
          }
        },
        (err) => {
          // Record error log
          this.userService.postErrorLog(err);
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

  filterCountry(addressIndex: number) {
    if (this.informationForm.get('country').value) {
      const searchString = this.informationForm.get('country').value.toLowerCase().trim();
      this.filteredCountry[addressIndex] = this.countries.filter((country) => country.toLowerCase().trim().includes(searchString));
      this.isResetCountry = true;
    }
  }

  filterCity(addressIndex: number) {
    if (this.cities[addressIndex] && this.cities[addressIndex].length) {
      const searchString = this.informationForm.get('city').value.toLowerCase().trim();
      this.filteredCities[addressIndex] = this.cities[addressIndex].filter((city) => city.toLowerCase().trim().includes(searchString));
    }
  }

  filterDepartment(addressIndex: number) {
    if (this.departments[addressIndex] && this.departments[addressIndex].length) {
      const searchString = this.informationForm.get('department').value.toLowerCase().trim();
      this.filteredDepartments[addressIndex] = this.departments[addressIndex].filter((department) =>
        department.toLowerCase().trim().includes(searchString),
      );
    }
  }

  filterRegion(addressIndex: number) {
    if (this.regions[addressIndex] && this.regions[addressIndex].length) {
      const searchString = this.informationForm.get('region').value.toLowerCase().trim();
      this.filteredRegions[addressIndex] = this.regions[addressIndex].filter((region) =>
        region.toLowerCase().trim().includes(searchString),
      );
    }
  }

  async checkFormValidity(): Promise<boolean> {
    // isWaitingForResponse || checkComparison() || informationForm.invalid
    if (this.informationForm.invalid || this.isResetCountry) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.resetInvalidAutoCompeleteValue();
      this.markAllFieldsAsTouched(this.informationForm);
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
    const form = JSON.stringify(this.informationForm.getRawValue());
    if (firstForm === form) {
      return true;
    } else {
      return false;
    }
  }

  resetInvalidAutoCompeleteValue() {
    if (this.isResetCountry) {
      this.informationForm.get('country').setValue('');
    }
  }

  countrySelected() {
    this.isResetCountry = false;
  }

  initEmail() {
    this.informationForm?.get('email')?.valueChanges?.pipe(debounceTime(400)).subscribe((resp) => {
      if(resp !== this.currentEmail){
        this.disableButtonVerify = false;
        this.disableButtonSave = true;
      }else{
        this.disableButtonVerify = true;
        this.disableButtonSave = false;
      };
    });
  }

  verifyEmail(){
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService?.checkEmailAvailbility(this.informationForm?.get('email')?.value, this.alumniSurveyData?.user_id?._id).subscribe(
      (resp)=>{
        this.isWaitingForResponse = false;
        if(resp){
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo'),
            confirmButtonText: this.translate.instant('OK'),
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(() => {
            this.disableButtonSave = false;
          })
        }
      },
      (error)=>{
        this.isWaitingForResponse = false;
        if(error){
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
      }
    );
  }
}
