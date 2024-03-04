import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { UserService } from 'app/service/user/user.service';
import { ApplicationUrls } from 'app/shared/settings';
import { CustomValidators } from 'ng2-validation';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { SchoolService } from 'app/service/schools/school.service';
import { StudentsService } from 'app/service/students/students.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CoreService } from 'app/service/core/core.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'ms-user-identity-tab',
  templateUrl: './user-identity-tab.component.html',
  styleUrls: ['./user-identity-tab.component.scss'],
})
export class UserIdentityTabComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedUser;
  @Input() isWaitingForResponse;
  @Output() nextTab = new EventEmitter<boolean>();
  private subs = new SubSink();

  identityForm: UntypedFormGroup;
  @ViewChild('userphoto', { static: false }) uploadInput: any;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  today: Date;

  photo: string;
  photo_s3_path: string;
  is_photo_in_s3: boolean;
  myInnerHeight = 1920;
  isMainAddressSelected = false;
  countries;
  countryList;
  nationalitiesList = [];
  nationalList = [];
  filteredCountry: any[][] = [];
  cities: string[][] = [];
  filteredCities: string[][] = [];
  departments: string[][] = []; // in API, this field called "academy"
  filteredDepartments: string[][] = [];
  regions: string[][] = []; // in API, this field called "province"
  filteredRegions: string[][] = [];

  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  private intVal: any;
  private timeOutVal: any;
  currentUserTypeId

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private fileUploadService: FileUploadService,
    private translate: TranslateService,
    public permissionService: PermissionService,
    private candidatesService: CandidatesService,
    private userService: UserService,
    private rncpTitleService: RNCPTitlesService,
    private schoolService: SchoolService,
    private studentService: StudentsService,
    public coreService: CoreService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

  }

  ngOnChanges() {
    this.resetData();
    this.subs.sink = this.schoolService.getCountry().subscribe((list: any[]) => {
      this.countries = list;
      this.countryList = list;
    });
    this.subs.sink = this.studentService
      .getAllNationalities()
      .pipe(take(1))
      .subscribe((response) => {
        this.nationalitiesList = response;
      });
    if (this.selectedUser) {
      this.initForm();
      this.patchFormValue();

      if (this.selectedUser.profile_picture) {
        this.photo_s3_path = this.selectedUser.profile_picture;
        this.photo = this.selectedUser.profile_picture;
        this.is_photo_in_s3 = true;
      } else {
        this.photo = '';
        this.photo_s3_path = '';
        this.is_photo_in_s3 = false;
      }
    }
  }

  patchFormValue() {
    console.log(this.selectedUser);
    if (this.selectedUser) {
      if (this.selectedUser.user_addresses && this.selectedUser.user_addresses.length) {
        this.selectedUser.user_addresses.forEach((address, index) => {
          if (address && address.is_main_address) {
            this.isMainAddressSelected = true;
          }
          if (address.postal_code && address.country && address.country.toLowerCase() === 'france') {
            this.subs.sink = this.rncpTitleService.getFilteredZipCode(address.postal_code, address.country).subscribe(
              (addresData) => {
                this.setAddressDropdown(addresData, index);
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
          if (index >= 1) {
            this.addUserAddressForm();
          }
        });
      }
      this.identityForm.patchValue(this.selectedUser);
      if (this.userAddressFormArray && this.userAddressFormArray.length) {
        const studentArray = this.userAddressFormArray.value;
        studentArray.forEach((address, addressIndex) => {
          this.getPostcodeData(addressIndex, false);
        });
      }
    }
  }

  checkMainAddress(event: MatSlideToggleChange) {
    if (event && event.checked) {
      this.isMainAddressSelected = true;
    } else {
      this.isMainAddressSelected = false;
    }
  }
  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 231;
    return this.myInnerHeight;
  }

  initForm() {
    this.identityForm = this.fb.group({
      civility: ['', [Validators.required]],
      email: ['', [CustomValidators.email, Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      office_phone: ['', [Validators.maxLength(10), Validators.minLength(10), CustomValidators.number]],
      portable_phone: ['', [Validators.maxLength(10), Validators.minLength(10), CustomValidators.number]],
      position: [''],
      user_addresses: this.fb.array([this.initUserAddressForm()]),
    });
  }

  initUserAddressForm(): UntypedFormGroup {
    return this.fb.group({
      address: [null, Validators.required],
      postal_code: [null, Validators.required],
      country: ['France', Validators.required],
      city: [null],
      region: [null],
      department: [null],
      is_main_address: [false, Validators.required],
    });
  }

  get userAddressFormArray() {
    return this.identityForm.get('user_addresses') as UntypedFormArray;
  }

  addUserAddressForm() {
    this.userAddressFormArray.push(this.initUserAddressForm());
    this.filteredCountry.push(this.countries);
    this.cities.push([]);
    this.regions.push([]);
    this.departments.push([]);
  }

  removeUserAddressForm(addressIndex: number) {
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
        this.userAddressFormArray.removeAt(addressIndex);
        Swal.fire({
          type: 'success',
          title: this.translate.instant('EVENT_S1.TITLE'),
          html: this.translate.instant('address deleted'),
          confirmButtonText: this.translate.instant('EVENT_S1.BUTTON'),
        });
      }
    });
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
    this.resetFileState();
  }

  resetFileState() {
    this.uploadInput.nativeElement.value = '';
  }

  onContinue() {
    this.nextTab.emit(true);
  }

  onSave() {
    const payload = this.identityForm.value;
    if (this.photo_s3_path) {
      payload.profile_picture = this.photo_s3_path;
    }
    if (payload && payload.user_addresses && payload.user_addresses.length === 1) {
      this.userAddressFormArray.at(0).get('is_main_address').setValue(true);
      payload.user_addresses[0].is_main_address = true;
    }
    if (payload && payload.user_addresses && payload.user_addresses.length) {
      console.log('ini data student address', payload.user_addresses);
      console.log('ini data di dalam array', this.cities, this.departments, this.regions);
      payload.user_addresses.forEach((address, addressIndex) => {
        if (address && address.postal_code && address.country === 'France' && (!address.city || !address.department || !address.region)) {
          if (!address.city && this.cities && this.cities[addressIndex] && this.cities[addressIndex][0]) {
            address.city = this.cities[addressIndex][0];
          }
          if (!address.department && this.departments && this.departments[addressIndex] && this.departments[addressIndex][0]) {
            address.department = this.departments[addressIndex][0];
          }
          if (!address.region && this.regions && this.regions[addressIndex] && this.regions[addressIndex][0]) {
            address.region = this.regions[addressIndex][0];
          }
        }
      });
    }
    // console.log(payload);
    this.subs.sink = this.userService.updateUser(this.selectedUser._id, payload,this.currentUserTypeId).subscribe(
      (res) => {
        if (res) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.selectedUser = '';
            this.candidatesService.setIsSaved();
          });
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

  getPostcodeData(addressIndex: number, assign = true) {
    const country = this.userAddressFormArray.at(addressIndex).get('country').value;
    const postCode = this.userAddressFormArray.at(addressIndex).get('postal_code').value;

    if (postCode && country && postCode.length > 3 && country.toLowerCase() === 'france') {
      this.subs.sink = this.rncpTitleService.getFilteredZipCode(postCode, country).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.setAddressDropdown(resp, addressIndex);

            if (assign) {
              this.userAddressFormArray.at(addressIndex).get('city').setValue(this.cities[addressIndex][0]);
              this.userAddressFormArray.at(addressIndex).get('department').setValue(this.departments[addressIndex][0]);
              this.userAddressFormArray.at(addressIndex).get('region').setValue(this.regions[addressIndex][0]);
            }
          } else if (resp && !resp.length) {
            this.cities[addressIndex] = [''];
            this.departments[addressIndex] = [''];
            this.regions[addressIndex] = [''];
            this.userAddressFormArray.at(addressIndex).get('city').setValue(this.cities[addressIndex][0]);
            this.userAddressFormArray.at(addressIndex).get('department').setValue(this.departments[addressIndex][0]);
            this.userAddressFormArray.at(addressIndex).get('region').setValue(this.regions[addressIndex][0]);
            this.filteredCities[addressIndex] = this.cities[addressIndex];
            this.filteredDepartments[addressIndex] = this.departments[addressIndex];
            this.filteredRegions[addressIndex] = this.regions[addressIndex];
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

  filterNationality() {
    const searchString = this.identityForm.get('nationality').value.toLowerCase().trim();
    this.nationalList = this.nationalitiesList.filter((nationalities) =>
      nationalities.nationality_en.toLowerCase().trim().includes(searchString),
    );
  }

  filterCountry(addressIndex: number) {
    const searchString = this.userAddressFormArray.at(addressIndex).get('country').value.toLowerCase().trim();
    this.filteredCountry[addressIndex] = this.countries.filter((country) => country.name.toLowerCase().trim().includes(searchString));
  }

  filterCity(addressIndex: number) {
    if (this.cities[addressIndex] && this.cities[addressIndex].length) {
      const searchString = this.userAddressFormArray.at(addressIndex).get('city').value.toLowerCase().trim();
      this.filteredCities[addressIndex] = this.cities[addressIndex].filter((city) => city.toLowerCase().trim().includes(searchString));
    }
  }

  filterDepartment(addressIndex: number) {
    if (this.departments[addressIndex] && this.departments[addressIndex].length) {
      const searchString = this.userAddressFormArray.at(addressIndex).get('department').value.toLowerCase().trim();
      this.filteredDepartments[addressIndex] = this.departments[addressIndex].filter((department) =>
        department.toLowerCase().trim().includes(searchString),
      );
    }
  }

  filterRegion(addressIndex: number) {
    if (this.regions[addressIndex] && this.regions[addressIndex].length) {
      const searchString = this.userAddressFormArray.at(addressIndex).get('region').value.toLowerCase().trim();
      this.filteredRegions[addressIndex] = this.regions[addressIndex].filter((region) =>
        region.toLowerCase().trim().includes(searchString),
      );
    }
  }

  resetData() {
    this.isMainAddressSelected = false;
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
  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }
}
