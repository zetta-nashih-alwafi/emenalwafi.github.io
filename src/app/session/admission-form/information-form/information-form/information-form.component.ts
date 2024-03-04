import { UtilityService } from './../../../../service/utility/utility.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { Component, OnInit, OnDestroy, Input, OnChanges, ViewChild, Output } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AdmissionService } from 'app/service/admission/admission.service';
import { ApplicationUrls } from 'app/shared/settings';
import { SchoolService } from 'app/service/schools/school.service';
import { StudentsService } from 'app/service/students/students.service';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import * as moment from 'moment';
import { RegistrationDialogComponent } from 'app/candidates/registration-dialog/registration-dialog.component';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { CoreService } from 'app/service/core/core.service';
import { CustomValidators } from 'ng2-validation';
import { EventEmitter } from '@angular/core';
import { Observable, pipe } from 'rxjs';
import { debounceTime, map, startWith, take } from 'rxjs/operators';
import { UserService } from 'app/service/user/user.service';

@Component({
  selector: 'ms-information-form',
  templateUrl: './information-form.component.html',
  styleUrls: ['./information-form.component.scss'],
  providers: [ParseStringDatePipe],
})
export class InformationFormComponent implements OnInit, OnDestroy, OnChanges {
  @Input() candidateId = '';
  @Input() selectedIndex = 0;
  @Output() moveToTab = new EventEmitter<string>();
  @ViewChild('userphoto', { static: false }) uploadInput: any;
  @ViewChild('emancipatedDocInput', { static: false }) emancipatedDocInput: any;
  myIdentityForm: UntypedFormGroup;
  private subs = new SubSink();
  candidateData: any;
  isWaitingForResponse = false;
  today: Date;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  countries;
  countryList;
  countriesSecond;
  countryListSecond;
  nationalitiesList = [];
  nationalitiesListSecond = [];
  nationalList = [];
  nationalListSecond = [];
  nationalListFilter: Observable<any[]>;
  nationalListSecondFilter: Observable<any[]>;
  countryListFilter: Observable<any[]>;
  countryListSecondFilter: Observable<any[]>;
  filteredCountry = [];
  filteredCountrySecond = [];
  codeDial;
  codeDialFixed;
  isSave = false;
  cities: string[][] = [];
  filteredCities: string[][] = [];
  departments: string[][] = []; // in API, this field called "academy"
  filteredDepartments: string[][] = [];
  regions: string[][] = []; // in API, this field called "province"
  filteredRegions: string[][] = [];
  citiesBirth: string[][] = [];
  filteredCitiesBirth: string[][] = [];

  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  photo: string;
  photo_s3_path: string;
  is_photo_in_s3: boolean = false;
  isPhotoUploading: boolean = false;
  intVal: NodeJS.Timeout;
  timeOutVal: NodeJS.Timeout;
  is_photo_uploaded = true;
  isResetCountry = true;
  isResetCountryofBirth = true;
  isResetNationality1 = true;
  isResetNationality2 = true;

  imageBeforeCompressed;
  imageAfterCompressed;
  minimumDateOfBirth;
  disableButtonSave = false;
  disableButtonEmail = true;
  emancipatedDocFile: File = null;
  selectedMaxSize = 0;
  relationList = ['father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'other'];

  // *************** used to switch form visiblity
  isAdult: any = null;
  isEmancipatedMinor: any = null;
  isEmancipatedMinorDocValidated: boolean = false;

  // *************** START OF property to store data of country dial code
  flagsIconPath = '../../../../../assets/icons/flags-nationality/';
  @Input() countryCodeList: any[];
  dialCodeControl = new UntypedFormControl(null, Validators.required);
  // *************** END OF property to store data of country dial code

  // Service
  constructor(
    private parseStringDatePipe: ParseStringDatePipe,
    private admissionService: AdmissionService,
    private studentService: StudentsService,
    private schoolService: SchoolService,
    private translate: TranslateService,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private rncpTitleService: RNCPTitlesService,
    private fileUploadService: FileUploadService,
    public coreService: CoreService,
    private imageCompress: NgxImageCompressService,
    public utilService: UtilityService,
    private userService: UserService,
  ) {}

  ngOnInit() {
    if (!this.isSave) {
      this.getOneCandidate('ngOnInit');
      this.initRegistrationForm();
      this.myIdentityForm.markAllAsTouched();
    }
    this.today = new Date();
    this.minimumDateOfBirth = this.getMinimumDateOfBirth();
    this.subs.sink = this.studentService
      .getAllCountries()
      .pipe(take(1))
      .subscribe((list) => {
        this.countries = list;
        this.countryList = list;
        this.countriesSecond = list;
        this.countryListSecond = list;
        this.filteredCountry = list;
        this.filteredCountrySecond = list;
        this.getCountryDropdown();
        this.myIdentityForm.get('country').updateValueAndValidity();
        this.myIdentityForm.get('country_of_birth').updateValueAndValidity();
      });
    this.subs.sink = this.studentService
      .getAllNationalities()
      .pipe(take(1))
      .subscribe((response) => {
        this.nationalitiesList = response;
        this.nationalitiesListSecond = response;
        this.nationalList = response;
        this.nationalListSecond = response;
        this.getNationalityDropdown();
        this.myIdentityForm.get('nationality').updateValueAndValidity();
        this.myIdentityForm.get('nationality_second').updateValueAndValidity();
      });
  }

  initFilter() {
    this.subs.sink = this.myIdentityForm
      .get('email')
      .valueChanges.pipe(debounceTime(400))
      .subscribe((resp) => {
        if (resp) {
          this.disableButtonSave = true;
          this.disableButtonEmail = false;
        }
      });
  }

  selectionDialCode(event) {
    this.myIdentityForm?.get('phone_number_indicative')?.reset();
    this.myIdentityForm?.get('phone_number_indicative')?.patchValue(event?.dialCode);
  }

  getMinimumDateOfBirth() {
    const now = new Date();
    return new Date(now.setFullYear(now.getFullYear() - 14));
  }

  ngOnChanges() {
    if (this.selectedIndex === 0) {
      console.log('Current Step ', this.selectedIndex);
      if (!this.isSave) {
        this.getOneCandidate();
      }
    }
  }

  openUploadEmancipatedDoc() {
    this.emancipatedDocInput.nativeElement.click();
    this.selectedMaxSize = 0;
  }

  uploadEmancipatedDoc(file: File) {
    const acceptable = ['pdf'];
    const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();

    if (acceptable.includes(fileType)) {
      if (this.utilService.countFileSize(file, this.selectedMaxSize)) {
        const firstName = this.myIdentityForm.get('first_name').value;
        const lastName = this.myIdentityForm.get('last_name').value;
        const dateTime = this.getCurrentDateTimeText();
        const customFileName = `emancipated_document_proof_${lastName}_${firstName}_${dateTime}`;

        this.emancipatedDocFile = file;
        this.isWaitingForResponse = true;
        this.subs.sink = this.fileUploadService.singleUpload(this.emancipatedDocFile, customFileName).subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            if (resp) {
              this.myIdentityForm.get('emancipated_document_proof_name').setValue(resp.s3_file_name);
              this.myIdentityForm.get('emancipated_document_proof_original_name').setValue(resp.file_name);
            } else {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                allowOutsideClick: false,
                confirmButtonText: this.translate.instant('ok'),
              });
            }
          },
          (err) => {
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
      } else {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('UPLOAD_RESTRICT_TO_FILESIZE_File.TITLE'),
          html: this.translate.instant('UPLOAD_RESTRICT_TO_FILESIZE_File.TEXT', { size: this.selectedMaxSize }),
          confirmButtonText: this.translate.instant('UPLOAD_RESTRICT_TO_FILESIZE_File.BUTTON'),
          allowOutsideClick: false,
        });
      }
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
        text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.pdf' }),
        allowEscapeKey: false,
        allowOutsideClick: false,
        allowEnterKey: false,
      });
    }
  }

  removeEmancipatedDoc(fileName: string, callback = () => {}) {
    if (fileName) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.fileUploadService.deleteFileUpload(fileName).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
            }).then(() => {
              this.emancipatedDocFile = null;
              this.myIdentityForm.get('emancipated_document_proof_name').setValue(null);
              this.myIdentityForm.get('emancipated_document_proof_original_name').setValue(null);

              if (this.emancipatedDocInput?.nativeElement) {
                this.emancipatedDocInput.nativeElement.value = null;
              }

              callback();
            });
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err.message ? this.translate.instant(err.message.replaceAll('GraphQL error: ', '')) : err,
            allowOutsideClick: false,
          });
        },
      );
    }
  }

  onUploadEmancipatedDoc(fileInput: Event) {
    const file = (<HTMLInputElement>fileInput.target).files[0];
    if (file) this.uploadEmancipatedDoc(file);
  }

  async onRemoveEmancipatedDoc() {
    const fileName = this.myIdentityForm.get('emancipated_document_proof_name').value;
    const fileNameOri = this.myIdentityForm.get('emancipated_document_proof_original_name').value;

    const swalResult = await Swal.fire({
      type: 'warning',
      title: this.translate.instant('Docupload_S2.TITLE'),
      text: this.translate.instant('Docupload_S2.TEXT', { doc_name: fileNameOri }),
      showCancelButton: true,
      confirmButtonText: this.translate.instant('Docupload_S2.BUTTON 1'),
      cancelButtonText: this.translate.instant('Docupload_S2.BUTTON 2'),
      allowOutsideClick: false,
    });

    if (!swalResult.value) return;
    this.removeEmancipatedDoc(fileName);
  }

  getCurrentDateTimeText() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}`;
  }

  initRegistrationForm() {
    this.myIdentityForm = this.fb.group({
      civility: ['', Validators.required],
      first_name: ['', [this.noWhitespaceValidator]],
      last_name: ['', [this.noWhitespaceValidator]],
      last_name_used: ['', [Validators.required, this.noWhitespaceValidator]],
      first_name_used: ['', [Validators.required, this.noWhitespaceValidator]],
      country: [null, [Validators.required, this.noWhitespaceValidator, this.countryValidator.bind(this)]],
      city: ['', [Validators.required, this.noWhitespaceValidator]],
      address: ['', [Validators.required, this.noWhitespaceValidator]],
      additional_address: [''],
      post_code: ['', [Validators.required, this.noWhitespaceValidator]],
      date_of_birth: [''],
      country_of_birth: [null, [Validators.required, this.noWhitespaceValidator, this.countryValidator.bind(this)]],
      city_of_birth: ['', [Validators.required, this.noWhitespaceValidator]],
      post_code_of_birth: ['', [Validators.required, this.noWhitespaceValidator]],
      nationality: [null, [Validators.required, this.noWhitespaceValidator, this.nationalityValidator.bind(this)]],
      nationality_second: [null, this.nationalityValidator.bind(this)],
      photo: [''],
      compressed_photo: [''],
      telephone: ['', [Validators.required, Validators.pattern('[- ()0-9]+')]],
      phone_number_indicative: ['', Validators.required],
      fixed_phone: ['', Validators.pattern('[- +()0-9]+')],
      email: ['', [Validators.required, this.noWhitespaceValidator, CustomValidators.email]],
      department: [''],
      region: [''],
      is_adult: [null, Validators.required],
      is_emancipated_minor: [null],
      emancipated_document_proof_id: [null],
      emancipated_document_proof_name: [null],
      emancipated_document_proof_original_name: [null],
      legal_representative: this.fb.array([]),
      emergency_contacts: this.fb.group({
        family_name: [null, [Validators.required]],
        name: [null, [Validators.required]],
        email: [null, [Validators.required, this.noWhitespaceValidator, CustomValidators.email]],
        tele_phone: [null, [Validators.required, Validators.pattern('[- +()0-9]+')]],
        relation: [null, [Validators.required]],
      }),
      college: this.fb.group({
        name: [null], 
        postal_code: [null],
        country: [null],
        city: [null]
      })
    });

    const adultControl = this.myIdentityForm.get('is_adult');
    const minorControl = this.myIdentityForm.get('is_emancipated_minor');
    const proofNameControl = this.myIdentityForm.get('emancipated_document_proof_name');
    const proofNameOriControl = this.myIdentityForm.get('emancipated_document_proof_original_name');

    // *************** add required validation when user is not adult
    this.subs.sink = adultControl.valueChanges.subscribe(async (val: boolean) => {
      if (val === false) {
        minorControl.setValidators(Validators.required);
        minorControl.updateValueAndValidity();
        minorControl.markAsUntouched();
        this.isAdult = false;
      }

      if (val === true) {
        if (!this.isSave && proofNameControl.value && proofNameOriControl.value) {
          const swalResult = await this.showSwalDocumentProofS2();

          if (swalResult.value) {
            const fileName = proofNameControl.value;
            this.removeEmancipatedDoc(fileName, () => {
              proofNameControl.clearValidators();
              proofNameOriControl.clearValidators();
              proofNameControl.updateValueAndValidity();
              proofNameOriControl.updateValueAndValidity();

              minorControl.clearValidators();
              minorControl.reset(null);
              this.isAdult = true;
              this.isEmancipatedMinor = null;
            });
          } else {
            adultControl.setValue(false);
          }
        } else {
          minorControl.clearValidators();
          minorControl.reset(null);
          this.isAdult = true;
          this.isEmancipatedMinor = null;
        }
      }
    });

    // *************** add required validation when user is emancipated minor
    this.subs.sink = minorControl.valueChanges.subscribe(async (val: boolean) => {
      if (val === true) {
        proofNameControl.setValidators(Validators.required);
        proofNameOriControl.setValidators(Validators.required);
        proofNameControl.updateValueAndValidity();
        proofNameOriControl.updateValueAndValidity();
        proofNameControl.markAsUntouched();
        proofNameOriControl.markAsUntouched();
        this.removeRepresentativeForm();
        this.isEmancipatedMinor = true;
      }

      if(val === null) {
        proofNameControl.clearValidators();
        proofNameOriControl.clearValidators();
        proofNameControl.updateValueAndValidity();
        proofNameOriControl.updateValueAndValidity();
        this.removeRepresentativeForm();
        this.isEmancipatedMinor = null;
      }

      if (val === false) {
        if (!this.isSave && proofNameControl.value && proofNameOriControl.value) {
          const swalResult = await this.showSwalDocumentProofS2();

          if (swalResult.value) {
            const fileName = proofNameControl.value;
            this.removeEmancipatedDoc(fileName, () => {
              proofNameControl.clearValidators();
              proofNameOriControl.clearValidators();
              proofNameControl.updateValueAndValidity();
              proofNameOriControl.updateValueAndValidity();
              this.addRepresentativeForm();
              this.isEmancipatedMinor = false;
            });
          } else {
            minorControl.setValue(true);
          }
        } else {
          proofNameControl.clearValidators();
          proofNameOriControl.clearValidators();
          proofNameControl.updateValueAndValidity();
          proofNameOriControl.updateValueAndValidity();
          this.addRepresentativeForm();
          this.isEmancipatedMinor = false;
        }
      }
    });
  }

  sameEmailLegalRepresentativeValidator() {
    if (this.myIdentityForm.get('email')?.value && this.legalRepresentativeFormArray?.at(0)?.get('email')?.value) {
      const isSame =
        this.myIdentityForm.get('email').value?.toLowerCase() ===
        this.legalRepresentativeFormArray?.at(0)?.get('email').value?.toLowerCase();
      if (isSame) {
        this.legalRepresentativeFormArray?.at(0)?.get('email').setErrors({ sameError: true });
      } else {
        this.legalRepresentativeFormArray?.at(0)?.get('email').setErrors({ sameError: null });
        this.legalRepresentativeFormArray?.at(0)?.get('email').updateValueAndValidity();
      }
      return isSame;
    }
  }

  get legalRepresentativeFormArray() {
    return this.myIdentityForm.get('legal_representative') as UntypedFormArray;
  }

  addRepresentativeForm() {
    if (this.legalRepresentativeFormArray.length) {
      this.removeRepresentativeForm();
    }

    const group = this.fb.group({
      unique_id: [null],
      first_name: [null, [Validators.required, this.noWhitespaceValidator]],
      last_name: [null, [Validators.required, this.noWhitespaceValidator]],
      email: [null, [Validators.required, this.noWhitespaceValidator, CustomValidators.email]],
      phone_number: [null, [Validators.required, Validators.pattern('[- +()0-9]+')]],
      parental_link: [null, Validators.required],
      address: [null, [Validators.required, this.noWhitespaceValidator]],
      postal_code: [null, [Validators.required, this.noWhitespaceValidator]],
      city: [null, Validators.required],
    });

    this.legalRepresentativeFormArray.push(group);

    if (this.candidateData.is_adult === false && this.candidateData.is_emancipated_minor === false) {
      this.myIdentityForm.get('legal_representative').setValue([this.candidateData.legal_representative]);
    }
  }

  removeRepresentativeForm() {
    if (!this.legalRepresentativeFormArray.length) return;
    this.legalRepresentativeFormArray.removeAt(0);
  }

  getOneCandidate(from?) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.getCandidateInformation(this.candidateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.candidateData = resp;
        this.isEmancipatedMinorDocValidated = this.candidateData?.emancipated_document_proof_id?.document_status === 'validated';
        if (this.candidateData.telephone) {
          this.candidateData.telephone = this.candidateData.telephone;
        }
        if (this.candidateData.fixed_phone) {
          this.candidateData.fixed_phone = this.candidateData.fixed_phone;
        }

        // reset value when coming from edit
        this.isResetCountry = false;
        this.isResetCountryofBirth = false;
        this.isResetNationality1 = false;
        this.isResetNationality2 = false;
        if(!this.isSave){
          this.patchForm(from);
        }
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

  patchForm(from?) {
    if (this.candidateData) {
      const res = _.cloneDeep(this.candidateData);
      if (res.date_of_birth) {
        res.date_of_birth = this.parseStringDatePipe.transformStringToDate(res.date_of_birth);
        console.log('res.date_of_birth 1', res);
      } else {
        res.date_of_birth = '';
      }
      if (!res.first_name_used) {
        res.first_name_used = res.first_name;
      }
      if (!res.last_name_used) {
        res.last_name_used = res.last_name;
      }
      if (res.photo) {
        this.is_photo_in_s3 = true;
        this.is_photo_uploaded = true;
        this.photo = res.photo;
        this.photo_s3_path = res.photo;
      }
      if (!this.is_photo_in_s3 && !this.isSave && from === 'ngOnInit') {
        this.is_photo_uploaded = false;
      }

      if (!res?.nationality_second) {
        res.nationality_second = null;
      }

      if(!res?.country){
        res.country = null;
      }

      if(!res?.country_of_birth){
        res.country_of_birth = null;
      }

      if(!res?.nationality){
        res.nationality = null;
      }

      if (res.is_emancipated_minor && res.emancipated_document_proof_id) {
        if (res.emancipated_document_proof_id.document_status === 'rejected') {
          res.emancipated_document_proof_name = '';
          res.emancipated_document_proof_original_name = '';
          res.emancipated_document_proof_id = '';
        } else {
          res.emancipated_document_proof_name = res.emancipated_document_proof_id.s3_file_name;
          res.emancipated_document_proof_original_name = res.emancipated_document_proof_id.document_name;
          res.emancipated_document_proof_id = res.emancipated_document_proof_id._id;
        }
      }
      if (res.legal_representative) {
        res.legal_representative = [res.legal_representative];
      }
      if (res?.emergency_contacts?.length) {
        res.emergency_contacts = res.emergency_contacts[0];
      }
      this.myIdentityForm.patchValue(res);
      if (res?.phone_number_indicative) {
        const findIdx = this.countryCodeList?.findIndex((country) => country?.dialCode === res?.phone_number_indicative);
        if (findIdx >= 0) this.dialCodeControl?.patchValue(this.countryCodeList[findIdx]);
      }
      // populate region, city, and department if country has value france and has post_code
      if (res && res.country && res.country === 'FRANCE' && res.post_code) {
        this.getPostcodeData();
      }

      if (this.myIdentityForm?.controls) {
        this.initFilter();
      }
    }
  }

  countryValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    const translated = (str: string) => this.translate.instant(`NATIONALITY.${str}`);
    const countries = Array.isArray(this.countries) ? this.countries : [];
    const valid = countries.find((country) => {
      if (!country?.country) return false;
      return translated(country.country) === translated(value);
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

  filterNationality() {
    const searchString = this.myIdentityForm.get('nationality').value.toLowerCase().trim();
    this.nationalList = this.nationalitiesList.filter((nationalities) =>
      nationalities.nationality_en.toLowerCase().trim().includes(searchString),
    );
    this.isResetNationality1 = true;
  }

  filterNationalitySecond() {
    const searchString = this.myIdentityForm.get('nationality_second').value.toLowerCase().trim();
    this.nationalListSecond = this.nationalitiesListSecond.filter((nationalities) =>
      nationalities.nationality_en.toLowerCase().trim().includes(searchString),
    );
    this.isResetNationality2 = true;
  }

  filterCountry() {
    const searchString = this.myIdentityForm.get('country').value.toLowerCase().trim();
    this.filteredCountry = this.countries.filter((country) => country.country.toLowerCase().trim().includes(searchString));
    this.isResetCountry = true;
  }

  filterCountrySecond() {
    const searchString = this.myIdentityForm.get('country_of_birth').value.toLowerCase().trim();
    this.filteredCountrySecond = this.countriesSecond.filter((country) => country.country.toLowerCase().trim().includes(searchString));
    this.isResetCountryofBirth = true;
  }

  // displayNationality(nationality): string {
  //   console.log(nationality);
  //   if (this.translate && country) {
  //     const nationality = this.translate.instant('NATIONALITY.' + country);
  //     if (!nationality.includes('NATIONALITY')) {
  //       return nationality;
  //     } else {
  //       return country;
  //     }
  //   } else {
  //     return country;
  //   }
  // }

  // displayCountry(country): string {
  //   console.log(country);
  //   if (this.translate && country) {
  //     const nationality = this.translate.instant(country);
  //     console.log(nationality);
  //     if (!nationality.includes('NATIONALITY')) {
  //       return nationality;
  //     } else {
  //       return country;
  //     }
  //   } else {
  //     return country;
  //   }
  // }

  async identitySave() {
    const isFormValid = await this.checkFormValidity();
    if (!isFormValid) return;

    if (this.isEmancipatedMinor === false) {
      const swalResult = await this.showSwalLegalRepresentativeS2();
      if (!swalResult.value) return;
    }

    this.isWaitingForResponse = true;
    const payload = _.cloneDeep(this.myIdentityForm.value);
    let isMinorStudent = null;

    if (payload && payload.date_of_birth) {
      payload.date_of_birth = moment(payload.date_of_birth, 'DD/MM/YYYY').format('DD/MM/YYYY');
    }

    if (payload.is_adult === false && payload.is_emancipated_minor === false && payload.legal_representative.length) {
      payload.legal_representative = payload.legal_representative[0];

      if (!payload.legal_representative.unique_id) {
        delete payload.legal_representative.unique_id;
      }

      isMinorStudent = false;
    } else {
      payload.legal_representative = null;
    }

    if (
      payload.is_adult === false &&
      payload.is_emancipated_minor === true &&
      payload.emancipated_document_proof_name &&
      payload.emancipated_document_proof_original_name
    ) {
      if (!payload.emancipated_document_proof_id) {
        delete payload.emancipated_document_proof_id;
      }

      isMinorStudent = true;
    }

    if (payload.emergency_contacts) {
      const temp = payload.emergency_contacts;
      payload['emergency_contacts'] = [temp];
    }

    payload.personal_information = 'done';
    if (this.myIdentityForm.valid) {
      this.subs.sink = this.admissionService.UpdateCandidateForm(this.candidateData._id, payload, isMinorStudent).subscribe(
        (resp) => {
          this.isSave = true;
          this.isWaitingForResponse = false;
          this.openPopUpValidation(2, 'stepValidation', resp);
        },
        (err) => {
          this.isWaitingForResponse = false;
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
          }
        },
      );
    } else {
      this.isWaitingForResponse = false;
      Swal.fire({
        type: 'info',
        title: 'Error !',
      }).then((res) => {
        this.myIdentityForm.markAllAsTouched();
        console.log(this.myIdentityForm.controls);
      });
    }
  }

  /************ FORM VALIDATION FLOW *******************************/

  async checkFormValidity(): Promise<boolean> {
    if (this.myIdentityForm.get('email').hasError('email') || this.myIdentityForm.get('telephone').hasError('pattern')) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Format.Title'),
        html: this.translate.instant('Invalid_Format.Text'),
        confirmButtonText: this.translate.instant('Invalid_Format.Button'),
      });
      return false;
    } else if (
      this.myIdentityForm.invalid ||
      !this.is_photo_in_s3 ||
      this.isResetCountry ||
      this.isResetCountryofBirth ||
      this.isResetNationality1 ||
      this.isResetNationality2 ||
      this.dialCodeControl?.invalid
    ) {
      if (!this.is_photo_in_s3) {
        this.is_photo_uploaded = false;
      }
      const action = await Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.resetInvalidAutoCompeleteValue();
      this.markAllFieldsAsTouched(this.myIdentityForm);
      this.myIdentityForm.get('emancipated_document_proof_name').updateValueAndValidity();
      this.myIdentityForm.get('emancipated_document_proof_original_name').updateValueAndValidity();
      this.legalRepresentativeFormArray?.at(0)?.markAllAsTouched();
      this.legalRepresentativeFormArray?.at(0)?.updateValueAndValidity();
      this.dialCodeControl?.markAllAsTouched();
      return false;
    } else {
      this.is_photo_uploaded = true;
      return true;
    }
  }

  resetInvalidAutoCompeleteValue() {
    if (this.isResetCountry) {
      this.myIdentityForm.get('country').setValue(null);
    }
    if (this.isResetCountryofBirth) {
      this.myIdentityForm.get('country_of_birth').setValue(null);
    }
    if (this.isResetNationality1) {
      this.myIdentityForm.get('nationality').setValue(null);
    }
    if (this.isResetNationality2) {
      this.myIdentityForm.get('nationality_second').setValue(null);
    }
  }

  // check if individual field has error
  isFieldValid(field: string) {
    return !this.myIdentityForm.get(field).valid && this.myIdentityForm.get(field).touched;
  }

  // to make border of invalid as red
  toggleValidationStyle(field: string) {
    return {
      'has-error': this.isFieldValid(field),
    };
  }

  toggleValidationStyleDialCode(field: string) {
    return {
      'has-error-dialcode': !this.myIdentityForm.get(field).valid && this.myIdentityForm.get(field).touched,
    };
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

  /************************************************************* */

  openPopUpValidation(data, type, data2?: any) {
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
          candidateId: this.candidateData._id,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp.type === 'cancel') {
          this.admissionService.setStatusEditMode(false);
          this.admissionService.setStatusStepOne(true);
        } else if (resp.type) {
          this.admissionService.setStatusEditMode(false);
          this.admissionService.setStatusStepOne(true);
          this.admissionService.setIndexStep(2);
        }
      });
  }

  showSwalDocumentProofS2() {
    return Swal.fire({
      type: 'warning',
      title: this.translate.instant('DocumentProof_S2.TITLE'),
      text: this.translate.instant('DocumentProof_S2.TEXT'),
      showCancelButton: true,
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      confirmButtonText: this.translate.instant('DocumentProof_S2.BUTTON 1'),
      cancelButtonText: this.translate.instant('DocumentProof_S2.BUTTON 2'),
    });
  }

  showSwalLegalRepresentativeS2() {
    return Swal.fire({
      type: 'warning',
      title: this.translate.instant('LegalRepresentative_S2.TITLE'),
      text: this.translate.instant('LegalRepresentative_S2.TEXT'),
      showCancelButton: true,
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      confirmButtonText: this.translate.instant('LegalRepresentative_S2.BUTTON 1'),
      cancelButtonText: this.translate.instant('LegalRepresentative_S2.BUTTON 2'),
    });
  }

  showSwalLegalRepresentativeS1(data) {
    const relations = ['father', 'grandfather', 'uncle'];
    const parentalLink = data.legal_representative.parental_link;
    const civility = parentalLink === 'other' ? '' : relations.includes(parentalLink) ? 'MR' : 'MRS';

    Swal.fire({
      type: 'warning',
      allowEscapeKey: false,
      allowOutsideClick: false,
      allowEnterKey: false,
      title: this.translate.instant('LegalRepresentative_S1.TITLE'),
      text: this.translate.instant('LegalRepresentative_S1.TEXT', {
        civility: civility ? this.translate.instant(civility) : '',
        first_name: data.legal_representative.first_name,
        last_name: data.legal_representative.last_name,
      }),
      confirmButtonText: this.translate.instant('LegalRepresentative_S1.BUTTON 1'),
    }).then(() => {
      this.dialog.closeAll();
      this.admissionService.setStatusEditMode(false);
      this.admissionService.setStatusStepOne(true);
    });
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
    if (payload?.user_id) {
      delete payload?.user_id;
    }
    return payload;
  }
  cancelEdit() {
    this.admissionService.setStatusEditMode(false);
  }

  getPostcodeData() {
    const country = this.myIdentityForm.get('country').value;
    const postCode = this.myIdentityForm.get('post_code').value;

    if (postCode && country && postCode.length > 3 && country.toLowerCase() === 'france') {
      this.subs.sink = this.rncpTitleService.getFilteredZipCode(postCode, country).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.setAddressDropdown(resp, 0);

            this.myIdentityForm.get('city').setValue(this.cities[0][0]);
            this.myIdentityForm.get('department').setValue(this.departments[0][0]);
            this.myIdentityForm.get('region').setValue(this.regions[0][0]);
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

  getPostcodeDataBirth() {
    const country = this.myIdentityForm.get('country_of_birth').value;
    const postCode = this.myIdentityForm.get('post_code_of_birth').value;

    if (postCode && country && postCode.length > 3 && country.toLowerCase() === 'france') {
      this.subs.sink = this.rncpTitleService.getFilteredZipCode(postCode, country).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.setAddressDropdownBirth(resp, 0);

            this.myIdentityForm.get('city_of_birth').setValue(this.citiesBirth[0][0]);
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

  setAddressDropdownBirth(resp: any, addressIndex: number) {
    const tempCities = [];
    const tempDepartments = [];
    const tempRegions = [];

    if (resp && resp.length) {
      resp.forEach((address) => {
        tempCities.push(address.city);
      });

      this.citiesBirth[addressIndex] = _.uniq(tempCities);

      this.filteredCitiesBirth[addressIndex] = this.citiesBirth[addressIndex];
    }
  }

  openUploadWindow() {
    const file = this.uploadInput.nativeElement.click();
  }

  handleInputChange(fileInput: Event) {
    this.isPhotoUploading = true;
    const file = (<HTMLInputElement>fileInput.target).files[0];
    this.photo = '';
    this.photo_s3_path = '';
    this.is_photo_in_s3 = false;

    if (file) {
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          this.isPhotoUploading = false;
          if (resp) {
            this.photo = resp.file_name;
            this.photo_s3_path = resp.s3_file_name;
            this.is_photo_in_s3 = true;
            this.is_photo_uploaded = true;
            this.myIdentityForm.get('photo').patchValue(this.photo_s3_path);
          }
        },
        (err) => {
          this.isPhotoUploading = false;
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

  resetFileState() {
    this.uploadInput.nativeElement.value = '';
  }

  deletePhoto() {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('DELETE_LOGO.TITLE'),
      text: this.translate.instant('DELETE_LOGO.TEXT'),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('DELETE_LOGO.BUTTON_CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('DELETE_LOGO.BUTTON_CANCEL'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        this.intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_LOGO.BUTTON_CONFIRM') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_LOGO.BUTTON_CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(this.intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((result) => {
      if (result && result.value) {
        this.is_photo_in_s3 = false;
        this.photo = '';
        this.photo_s3_path = '';
        this.myIdentityForm.get('photo').patchValue('');
        Swal.fire({ type: 'success', title: 'Bravo!' });
      }
    });
  }

  public noWhitespaceValidator(control: UntypedFormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  countrySelected() {
    this.isResetCountry = false;
  }

  countryOfBirthSelected() {
    this.isResetCountryofBirth = false;
  }

  nationality1Selected() {
    this.isResetNationality1 = false;
  }

  nationality2Selected() {
    this.isResetNationality2 = false;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getCountryDropdown() {
    const country = _.cloneDeep(this.countries);
    const countrySecond = _.cloneDeep(this.countriesSecond);
    this.countryList = [];
    this.countryListSecond = [];
    country.forEach((item) => {
      const value = this.translate.instant('COUNTRY.' + item.country);
      this.countryList.push({ code: item.code, country: String(value).replace('COUTNRY.', ''), original: item.country });
    });
    countrySecond.forEach((item) => {
      const value = this.translate.instant('COUNTRY.' + item.country);
      this.countryListSecond.push({ code: item.code, country: String(value).replace('COUTNRY.', ''), original: item.country });
    });
    this.countryListFilter = this.myIdentityForm.get('country').valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.countryList
          .filter((country) =>
            country && country.country
              ? country.country
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
                  .includes(
                    searchText
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .toLowerCase(),
                  )
              : false,
          )
          .sort((a: any, b: any) => a.country.localeCompare(b.country)),
      ),
    );

    this.countryListSecondFilter = this.myIdentityForm.get('country_of_birth').valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.countryListSecond
          .filter((country) =>
            country && country.country
              ? country.country
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
                  .includes(
                    searchText
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .toLowerCase(),
                  )
              : false,
          )
          .sort((a: any, b: any) => a.country.localeCompare(b.country)),
      ),
    );

    this.localizeCountryListener();
  }

  localizeCountryListener() {
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      if (this.countries && this.countries.length) {
        this.countryList = [];
        this.countries.forEach((item) => {
          const country = this.getTranslateCountry(item.country);
          this.countryList.push({ code: item.code, country: country, original: item.country });
        });
        console.log('country', this.countryList);
        this.countryListFilter = this.myIdentityForm.get('country').valueChanges.pipe(
          startWith(''),
          map((searchText) =>
            this.countryList
              .filter((country) =>
                country && country.country
                  ? country.country
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .toLowerCase()
                      .includes(
                        searchText
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .toLowerCase(),
                      )
                  : false,
              )
              .sort((a: any, b: any) => a.country.localeCompare(b.country)),
          ),
        );
      }
      if (this.countriesSecond && this.countriesSecond.length) {
        this.countryListSecond = [];
        this.countriesSecond.forEach((item) => {
          const country = this.getTranslateCountry(item.country);
          this.countryListSecond.push({ code: item.code, country: country, original: item.country });
        });
        this.countryListSecondFilter = this.myIdentityForm.get('country_of_birth').valueChanges.pipe(
          startWith(''),
          map((searchText) =>
            this.countryListSecond
              .filter((country) =>
                country && country.country
                  ? country.country
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .toLowerCase()
                      .includes(
                        searchText
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .toLowerCase(),
                      )
                  : false,
              )
              .sort((a: any, b: any) => a.country.localeCompare(b.country)),
          ),
        );
      }
    });
  }

  getTranslateCountry(name) {
    if (name) {
      const value = this.translate.instant('COUNTRY.' + name);
      return String(value).replace('COUNTRY.', '');
    }
  }

  getNationalityDropdown() {
    const nat = _.cloneDeep(this.nationalitiesList);
    const natSecond = _.cloneDeep(this.nationalitiesListSecond);
    this.nationalList = [];
    this.nationalListSecond = [];
    nat.forEach((item) => {
      const value = this.translate.instant('NATIONALITY.' + item.nationality_en);
      this.nationalList.push({
        _id: item._id,
        nationality_en: String(value).replace('NATIONALITY.', ''),
        original: item.nationality_en,
      });
    });
    natSecond.forEach((item) => {
      const value = this.translate.instant('NATIONALITY.' + item.nationality_en);
      this.nationalListSecond.push({
        _id: item._id,
        nationality_en: String(value).replace('NATIONALITY.', ''),
        original: item.nationality_en,
      });
    });
    this.nationalListFilter = this.myIdentityForm.get('nationality').valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.nationalList
          .filter((country) =>
            country && country.nationality_en
              ? country.nationality_en
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
                  .includes(
                    searchText
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .toLowerCase(),
                  )
              : false,
          )
          .sort((a: any, b: any) => a.nationality_en.localeCompare(b.nationality_en)),
      ),
    );

    // this.nationalListSecondFilter = this.myIdentityForm.get('nationality_second').valueChanges.pipe(
    //   startWith(''),
    //   map((searchText) =>
    //     this.nationalListSecond
    //       .filter((country) =>
    //         country && country.countryName
    //           ? country.countryName
    //               .normalize('NFD')
    //               .replace(/[\u0300-\u036f]/g, '')
    //               .toLowerCase()
    //               .includes(
    //                 searchText
    //                   .normalize('NFD')
    //                   .replace(/[\u0300-\u036f]/g, '')
    //                   .toLowerCase(),
    //               )
    //           : false,
    //       )
    //       .sort((a: any, b: any) => a.countryName.localeCompare(b.countryName)),
    //   ),
    // );

    this.localizeNationalityListener();
  }

  localizeNationalityListener() {
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      if (this.nationalitiesList && this.nationalitiesList.length) {
        this.nationalList = [];
        this.nationalitiesList.forEach((item) => {
          const nationality = this.getTranslateNat(item.nationality_en);
          this.nationalList.push({ _id: item._id, nationality_en: nationality, original: item.nationality_en });
        });
        this.nationalListFilter = this.myIdentityForm.get('nationality').valueChanges.pipe(
          startWith(''),
          map((searchText) =>
            this.nationalList
              .filter((nationality) =>
                nationality && nationality.nationality_en
                  ? nationality.nationality_en
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .toLowerCase()
                      .includes(
                        searchText
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .toLowerCase(),
                      )
                  : false,
              )
              .sort((a: any, b: any) => a.nationality_en.localeCompare(b.nationality_en)),
          ),
        );
      }
      if (this.nationalitiesListSecond && this.nationalitiesListSecond.length) {
        this.nationalListSecond = [];
        this.nationalitiesListSecond.forEach((item) => {
          const nationality = this.getTranslateNat(item.nationality_en);
          this.nationalListSecond.push({ _id: item._id, nationality_en: nationality, original: item.nationality_en });
        });
        this.nationalListSecondFilter = this.myIdentityForm.get('nationality_second').valueChanges.pipe(
          startWith(''),
          map((searchText) =>
            this.nationalListSecond
              .filter((nationality) =>
                nationality && nationality.nationality_en
                  ? nationality.nationality_en
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .toLowerCase()
                      .includes(
                        searchText
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .toLowerCase(),
                      )
                  : false,
              )
              .sort((a: any, b: any) => a.nationality_en.localeCompare(b.nationality_en)),
          ),
        );
      }
    });
  }

  getTranslateNat(name) {
    if (name) {
      const value = this.translate.instant('ERP_066_NATIONALITY.' + name);
      return String(value).replace('ERP_066_NATIONALITY', '');
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
          this.isPhotoUploading = true;
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
            this.myIdentityForm.get('compressed_photo').patchValue(resp.s3_file_name);
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
          this.isPhotoUploading = false;
          if (resp) {
            this.photo = resp.file_name;
            this.photo_s3_path = resp.s3_file_name;
            this.is_photo_in_s3 = true;
            this.is_photo_uploaded = true;
            this.myIdentityForm.get('photo').patchValue(this.photo_s3_path);
          }
        },
        (err) => {
          this.isPhotoUploading = false;
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

  verifyEmail() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService
      .verifyEmailUnique(this.myIdentityForm.get('email').value, this.candidateData?.user_id?._id)
      .subscribe(
        () => {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo'),
            confirmButtonText: this.translate.instant('OK'),
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(() => {
            this.disableButtonSave = false;
            this.disableButtonEmail = true;
            this.isWaitingForResponse = false;
          });
        },
        (err) => {
          if (err['message'] === 'GraphQL error: Email already exists') {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('SWAL_USER_EXIST_DUMMY.TITLE'),
              text: this.translate.instant('SWAL_USER_EXIST_DUMMY.TEXT'),
              confirmButtonText: this.translate.instant('SWAL_USER_EXIST_DUMMY.BUTTON'),
            }).then(() => {
              this.disableButtonSave = true;
              this.isWaitingForResponse = false;
              this.disableButtonEmail = false;
            });
          }
        },
      );
  }
}
