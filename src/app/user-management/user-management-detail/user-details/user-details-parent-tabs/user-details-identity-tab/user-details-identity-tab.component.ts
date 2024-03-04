import { debounceTime, map, startWith, take } from 'rxjs/operators';
import { NgxImageCompressService } from 'ngx-image-compress';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AdmissionService } from 'app/service/admission/admission.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { SchoolService } from 'app/service/schools/school.service';
import { StudentsService } from 'app/service/students/students.service';
import { CustomValidators } from 'ng2-validation';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { SubSink } from 'subsink';
import { ApplicationUrls } from 'app/shared/settings';
import { UserService } from 'app/service/user/user.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { UserManagementService } from 'app/user-management/user-management.service';
import { CoreService } from 'app/service/core/core.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-user-details-identity-tab',
  templateUrl: './user-details-identity-tab.component.html',
  styleUrls: ['./user-details-identity-tab.component.scss'],
})
export class UserDetailsIdentityTabComponent implements OnInit, OnChanges, OnDestroy {
  @Input() userId: string;
  @Output() reloadData: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('signatureUpload', { static: false }) signatureUpload: ElementRef;
  private subs = new SubSink();

  // *************** START OF property to store data of country dial code
  flagsIconPath = '../../../../../assets/icons/flags-nationality/';
  @Input() countryCodeList: any[] = [];
  dialCodeControl = new UntypedFormControl(null);
  // *************** END OF property to store data of country dial code

  identityForm: UntypedFormGroup;
  nationalitiesList = [];
  nationalList = [];
  nationalitySelected: string;
  @ViewChild('userphoto', { static: false }) uploadInput: any;
  @ViewChild('fileUpload', { static: false }) uploadFileInput: any;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  today: Date;

  isWaitingForResponse = false;
  countries;
  countryList;
  filteredCountry: any[][] = [];
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

  firstForm: any;
  isFileUploading = false;
  isFileUploadingImage = false;
  isMainAddressSelected = false;
  initialStepForm;
  formatImage = '.png, .PNG, .jpg, .JPG, .jpeg, .JPEG';
  dummyFileNameSignature = 'Signature.png';

  imageBeforeCompressed;
  imageAfterCompressed;
  currentUserTypeId 

  disableButtonVerify = true;
  currentEmail:any;
  disableButtonSave = false;

  emailDomainList = [
    'brassart.fr',
    'efap.com',
    'icart.fr',
    'efj.fr',
    'cread.fr',
    'ecole-mopa.fr',
    'esec.edu',
    'groupe-edh.com',
    'zetta-edh.com',
    'mbadmb.com',
    'intervenantedh-ext.com',
    '3wa.fr',
    'mode-estah.com',
    'esec.fr',
    '3wacademy.fr'
  ];

  userEntities: any;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private studentService: StudentsService,
    private rncpTitleService: RNCPTitlesService,
    private fileUploadService: FileUploadService,
    private translate: TranslateService,
    private schoolService: SchoolService,
    public permissionService: PermissionService,
    private dateAdapter: DateAdapter<Date>,
    private admissionService: AdmissionService,
    private pageTitleService: PageTitleService,
    private userService: UserService,
    private utilService: UtilityService,
    private userMgtService: UserManagementService,
    public coreService: CoreService,
    private imageCompress: NgxImageCompressService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    this.subs.sink = this.schoolService.getCountry().subscribe((list: any[]) => {
      this.countries = list.map((ls) => ls?.name);
    });
    this.dateAdapter.setLocale(this.translate.currentLang);
    this.today = new Date();
    this.initForm();
    this.initEmail();
    // console.log('_can', this.userId);
  }

  ngOnChanges() {
    this.dialCodeControl?.reset();
    this.initForm();
    // this.resetData();
    this.getOneUser();
    this.initEmail();
    this.subs.sink = this.studentService
      .getAllNationalities()
      .pipe(take(1))
      .subscribe((response) => {
        this.nationalitiesList = response;
      });
  }

  selectionDialCode(event) {
    this.identityForm?.get('phone_number_indicative')?.reset();
    this.identityForm?.get('phone_number_indicative')?.patchValue(event?.dialCode);
  }

  getOneUser() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.getOneUserDataForIdentityForm(this.userId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.userEntities = _.cloneDeep(resp?.entities)

        if (resp && resp.user_addresses && resp.user_addresses.length) {
          for (const address of resp.user_addresses) {
            // add address form if current number of address form is less than the user's number of addresses
            if (this.user_addresses.length < resp.user_addresses.length) {
              this.addAddress();
            }

            // check if any of the addresses is main address
            if (address.is_main_address) {
              this.isMainAddressSelected = true;
            }
          }
        } else {
          this.addAddress();
        }
        if (resp.profile_picture) {
          this.photo = resp.profile_picture;
          this.photo_s3_path = resp.profile_picture;
          this.is_photo_in_s3 = true;
        } else {
          this.photo = '';
          this.photo_s3_path = '';
          this.is_photo_in_s3 = false;
        }
        const payload = resp;
        this.identityForm.patchValue(payload);
        if(payload?.phone_number_indicative) {
          const findIdx = this.countryCodeList?.findIndex((country) => country?.dialCode === payload?.phone_number_indicative);
          if(findIdx >= 0) this.dialCodeControl?.patchValue(this.countryCodeList[findIdx]);
        };
        this.initialStepForm = this.identityForm.getRawValue();
        this.initValueChanges();
        this.firstForm = this.identityForm.value;
        this.currentEmail = payload.email;
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
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
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
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
      civility: [null, Validators.required],
      first_name: [null, Validators.required],
      last_name: [null, Validators.required],
      office_phone: [null, [Validators.maxLength(15)]],
      portable_phone: [null, [Validators.maxLength(15), Validators.pattern('[- ()0-9]+')]],
      phone_number_indicative: [null],
      email: [null, [Validators.required, CustomValidators.email]],
      position: [null, [Validators.required]],
      profile_picture: [null],
      compressed_photo: [null],
      user_addresses: this.fb.array([]),
      curriculum_vitae: this.fb.group({
        s3_path: [''],
        file_path: [''],
        name: [''],
      }),
      signature: this.fb.group({
        s3_path: [''],
        name: [''],
      }),
    });
    this.initialStepForm = this.identityForm.getRawValue();
  }

  initUserAddressFormGroup() {
    return this.fb.group({
      address: [null],
      postal_code: [null],
      country: [null],
      city: [null],
      department: [null],
      region: [null],
      is_main_address: [null],
    });
  }

  get user_addresses() {
    return this.identityForm.get('user_addresses') as UntypedFormArray;
  }

  addAddress() {
    this.user_addresses.push(this.initUserAddressFormGroup());
  }

  initValueChanges() {
    this.identityForm.valueChanges.subscribe(() => {
      this.isFormChanged();
    });
  }

  isFormChanged() {
    const initialStepForm = JSON.stringify(this.initialStepForm);
    const currentForm = JSON.stringify(this.identityForm.getRawValue());
    this.rncpTitleService.childrenFormValidationStatus = false;
    if (initialStepForm === currentForm) {
      this.rncpTitleService.childrenFormValidationStatus = true;
      return true;
    } else {
      this.rncpTitleService.childrenFormValidationStatus = false;
      return false;
    }
  }

  getPostcodeData(arrayIndex: number) {
    const arrayRef = this.user_addresses.at(arrayIndex);
    // console.log('arrayRef is:', arrayRef);

    if (!arrayRef) {
      return;
    }
    const country = arrayRef.get('country').value;
    const postCode = arrayRef.get('postal_code').value;

    if (postCode && country && postCode.length > 3 && country.toLowerCase() === 'france') {
      this.subs.sink = this.rncpTitleService.getFilteredZipCode(postCode, country).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.setAddressDropdown(resp, arrayIndex);
            arrayRef.get('city').setValue(this.cities[arrayIndex][0]);
            arrayRef.get('department').setValue(this.departments[arrayIndex][0]);
            arrayRef.get('region').setValue(this.regions[arrayIndex][0]);
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
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
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
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

  // filterNationality() {
  //   const searchString = this.identityForm.get('nationality').value.toLowerCase().trim();
  //   this.nationalList = this.nationalitiesList.filter((nationalities) =>
  //     nationalities.countryName.toLowerCase().trim().includes(searchString),
  //   );
  // }

  filterCountry(arrayIndex: number) {
    if (!this.user_addresses.at(arrayIndex).get('country').value) {
      return;
    }
    const searchString = this.user_addresses.at(arrayIndex).get('country').value.toLowerCase().trim();
    this.filteredCountry[arrayIndex] = this.countries.filter((country) => country && country.toLowerCase().trim().includes(searchString));
  }

  filterCity(arrayIndex: number) {
    if (this.cities[arrayIndex] && this.cities[arrayIndex].length && this.user_addresses.at(arrayIndex).get('city').value) {
      const searchString = this.user_addresses.at(arrayIndex).get('city').value.toLowerCase().trim();
      this.filteredCities[arrayIndex] = this.cities[arrayIndex].filter((city) => city && city.toLowerCase().trim().includes(searchString));
    }
  }

  filterDepartment(arrayIndex: number) {
    if (this.departments[arrayIndex] && this.departments[arrayIndex].length && this.user_addresses.at(arrayIndex).get('department').value) {
      const searchString = this.user_addresses.at(arrayIndex).get('department').value.toLowerCase().trim();
      this.filteredDepartments[arrayIndex] = this.departments[arrayIndex].filter(
        (department) => department && department.toLowerCase().trim().includes(searchString),
      );
    }
  }

  filterRegion(arrayIndex: number) {
    if (this.regions[arrayIndex] && this.regions[arrayIndex].length && this.user_addresses.at(arrayIndex).get('region').value) {
      const searchString = this.user_addresses.at(arrayIndex).get('region').value.toLowerCase().trim();
      this.filteredRegions[arrayIndex] = this.regions[arrayIndex].filter(
        (region) => region && region.toLowerCase().trim().includes(searchString),
      );
    }
  }

  openUploadWindow() {
    const file = this.uploadInput.nativeElement.click();
  }

  handleFileInputChange(fileInput: Event) {
    const acceptable = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls'];
    if ((<HTMLInputElement>fileInput.target).files.length > 0) {
      const file = (<HTMLInputElement>fileInput.target).files[0];
      const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
      if (acceptable.includes(fileType)) {
        this.isFileUploading = true;
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (resp) => {
            this.isFileUploading = false;
            if (resp) {
              this.identityForm.get('curriculum_vitae').get('s3_path').setValue(resp.s3_file_name);
              this.identityForm.get('curriculum_vitae').get('file_path').setValue(resp.file_url);
            }
          },
          (err) => {
            this.authService.postErrorLog(err);
            this.isFileUploading = false;
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
                // console.log('[BE Message] Error is : ', err);
              });
            }
          },
        );
      } else {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
          text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.jpg, .jpeg, .png, .pdf' }),
          allowEscapeKey: false,
          allowOutsideClick: false,
          allowEnterKey: false,
        });
      }
    }
  }

  handleFileInputChangeSignature(fileInput: Event) {
    const collectFormatImage = ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG'];
    if ((<HTMLInputElement>fileInput.target).files.length > 0) {
      const file = (<HTMLInputElement>fileInput.target).files[0];
      const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
      if (collectFormatImage.includes(fileType)) {
        this.isFileUploadingImage = true;
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (resp) => {
            this.isFileUploadingImage = false;
            if (resp) {
              this.identityForm.get('signature').get('s3_path').setValue(resp.s3_file_name);
              this.identityForm.get('signature').get('name').setValue(resp.s3_file_name);
            }
          },
          (err) => {
            this.isFileUploadingImage = false;
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
      } else {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
          text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: this.formatImage }),
          allowEscapeKey: false,
          allowOutsideClick: false,
          allowEnterKey: false,
        });
      }
    }
    this.resetFileStateSignatory();
  }

  removeCvFile() {
    this.identityForm.get('curriculum_vitae').get('s3_path').setValue(null);
  }

  removeSignatureFile() {
    this.identityForm?.get('signature')?.get('name').setValue(null);
    this.identityForm?.get('signature')?.get('s3_path').setValue(null);
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
            this.identityForm.get('profile_picture').setValue(resp.s3_file_name);
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
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
              // console.log('[BE Message] Error is : ', err);
            });
          }
        },
      );
    }
    this.resetFileState();
  }

  resetFileState() {
    this.uploadInput.nativeElement.value = '';
  }

  getNationalitySelected(data) {
    // console.log('getNationalitySelected : ', data);
    this.nationalitySelected = data.nationality_en.toLowerCase();
  }

  displayNationality(country): string {
    // console.log(country);
    if (this.translate && country) {
      const nationality = this.translate.instant('NATIONALITY.' + country);
      // console.log(nationality);
      if (!nationality.includes('NATIONALITY')) {
        return nationality;
      } else {
        return country;
      }
    } else {
      return country;
    }
  }

  createPayload() {
    const payload = _.cloneDeep(this.identityForm.value);
    return payload;
  }
  openUploadFile(data) {
    window.open(this.serverimgPath + data, '_blank');
  }
  async updateUser() {
    if (!(await this.checkFormValidity())) {
      return;
    }
    this.isWaitingForResponse = true;
    const payload = this.createPayload();
    this.subs.sink = this.userService.updateUser(this.userId, payload,this.currentUserTypeId).subscribe(
      (res) => {
        if (res) {
          this.rncpTitleService.childrenFormValidationStatus = true;
          this.initialStepForm = this.identityForm.getRawValue();
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.getOneUser();
            this.isWaitingForResponse = false;
            this.userMgtService.triggerRefresh(true);
            this.reloadData.emit(true);
          });
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
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
        } else if (err && err['message'] && err['message'].includes('Invalid Email')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SWAL_VALIDITY_EMAIL.TITLE'),
            html: this.translate.instant('SWAL_VALIDITY_EMAIL.TEXT', {
              emailDomainList: this.emailDomainList.map((item) => `<li>${item}</li>`).join(''),
            }),
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            confirmButtonText: this.translate.instant('SWAL_VALIDITY_EMAIL.BUTTON'),
          }).then(() => {
            this.disableButtonSave = true;
          });
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

  async checkFormValidity(): Promise<boolean> {
    // isWaitingForResponse || checkComparison() || identityForm.invalid
    if (this.identityForm.invalid) {
      const action = await Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
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
      } else if (control instanceof UntypedFormArray) {
        for (const childControl of control.controls) {
          childControl.markAllAsTouched();
        }
      }
    });
  }

  addAddressForm() {
    this.addAddress();
    this.filteredCountry.push(this.countries);
    this.cities.push([]);
    this.regions.push([]);
    this.departments.push([]);
  }

  removeAddressForm(addressIndex: number) {
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
        const confirmBtnRef = Swal.getConfirmButton();
        confirmBtnRef.setAttribute('disabled', '');
        this.intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);
        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          confirmBtnRef.removeAttribute('disabled');
          clearInterval(this.intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.user_addresses.removeAt(addressIndex);
        Swal.fire({
          type: 'success',
          title: this.translate.instant('EVENT_S1.TITLE'),
          html: this.translate.instant('Address Successfully Deleted'),
          confirmButtonText: this.translate.instant('EVENT_S1.BUTTON'),
        });
      }
    });
  }

  checkMainAddress(event: MatSlideToggleChange) {
    if (event && event.checked) {
      this.isMainAddressSelected = true;
    } else {
      this.isMainAddressSelected = false;
    }
  }

  resetFileStateSignatory() {
    this.signatureUpload.nativeElement.value = null;
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

    // compress image
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
            this.identityForm.get('profile_picture').setValue(resp.s3_file_name);
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
    this.identityForm?.get('email')?.valueChanges?.pipe(debounceTime(400)).subscribe((resp) => {
      if(resp !== this.currentEmail){
        this.disableButtonVerify = false;
        this.disableButtonSave = true;
      }else{
        this.disableButtonVerify = true;
        this.disableButtonSave = false;
      };
    });
  }

  verifyEmail() {
    this.isWaitingForResponse = true;
    let isUserTeacher = false;
    if (this.userEntities?.length) {
      isUserTeacher = this.userEntities?.some((entity) => entity?.type?.name === 'Teacher');
    }
    let isValidateEmail = true;
    if (isUserTeacher) {
      isValidateEmail = false
    }
    this.subs.sink = this.userService?.verifyEmail(this.identityForm?.get('email')?.value, isValidateEmail).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if(!resp?._id && !resp?.incorrect_email) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo'),
            confirmButtonText: this.translate.instant('OK'),
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
          }).then(() => {
            this.disableButtonSave = false;
          })
        }

        if(!resp?._id && resp?.incorrect_email) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SWAL_VALIDITY_EMAIL.TITLE'),
            html: this.translate.instant('SWAL_VALIDITY_EMAIL.TEXT', {
              emailDomainList: this.emailDomainList.map((item) => `<li>${item}</li>`).join(''),
            }),
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            confirmButtonText: this.translate.instant('SWAL_VALIDITY_EMAIL.BUTTON'),
          }).then(() => {
            this.disableButtonSave = true;
          });
          return;
        }

        if(resp?._id) {
          this.disableButtonSave = true;
          // *************** fire swal that user already existed
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('SWAL_USER_EXIST.TITLE'),
            text: this.translate.instant('SWAL_USER_EXIST.TEXT'),
            confirmButtonText: this.translate.instant('SWAL_USER_EXIST.BUTTON_1'),
            showCancelButton: true,
            cancelButtonText: this.translate.instant('SWAL_USER_EXIST.BUTTON_2'),
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
          }).then((action) => {
            if (action.value) {
              this.router.navigate(['/users/user-list'], { queryParams: { user: resp._id } });
            } else {
              this.disableButtonSave = true;
            }
          });
        }
      },
      (err) => {
        this.disableButtonSave = true;
        this.authService.postErrorLog(err);
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
          this.disableButtonSave = true;
          if( err['message']?.includes('GraphQL error: This Email Already Used As Student')){
              const errorMessage = err['message'].replaceAll('GraphQL error: This Email Already Used As Student', '');
              let studentData;
              if(errorMessage?.includes('MRS')) {
                studentData = errorMessage.replace(/\sMRS\s/gi, `${this.translate.instant('CARDDETAIL.MRS')} `);
              } else if(errorMessage?.includes('MR')) {
                studentData = errorMessage.replace(/\sMR\s/gi, `${this.translate.instant('CARDDETAIL.MR')} `);
              }

              Swal.fire({
                type: 'warning',
                title: this.translate.instant('Checkavailability_S2.TITLE'),
                text: this.translate.instant('Checkavailability_S2.TEXT', {
                  student: studentData
                }),
                footer: `<span style="margin-left: auto">Checkavailability_S2</span>`,
                confirmButtonText: this.translate.instant('Checkavailability_S2.BTN'),
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
              }).then(() => {
                return;
              });
          } else {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              allowOutsideClick: false,
              allowEscapeKey: false,
              allowEnterKey: false,
            });
          }
        }
      },
    );
  }

  checkEmailAvailbility(){
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService?.checkEmailAvailbility(this.identityForm?.get('email')?.value, this.userId).subscribe(
      (resp)=>{
        this.isWaitingForResponse = false;
        if(resp){
          this.verifyEmail();
        };
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
            allowEnterKey: false,
          }).then(() => {
            this.disableButtonSave = true;
          });
        }
      }
    );
  }
}
