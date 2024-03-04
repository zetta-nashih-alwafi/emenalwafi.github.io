import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectorRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RegistrationDialogComponent } from 'app/candidates/registration-dialog/registration-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { SchoolService } from 'app/service/schools/school.service';
import { StudentsService } from 'app/service/students/students.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ApplicationUrls } from 'app/shared/settings';
import * as moment from 'moment';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { debounceTime } from 'rxjs/operators';
import { InternshipService } from 'app/service/internship/internship.service';

@Component({
  selector: 'ms-second-aggrement-form',
  templateUrl: './second-aggrement-form.component.html',
  styleUrls: ['./second-aggrement-form.component.scss'],
  providers: [ParseStringDatePipe],
})
export class SecondAggrementFormComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() candidateId = '';
  @Input() internshipId = '';
  @Input() dataModify: any;
  myIdentityForm: UntypedFormGroup;
  private subs = new SubSink();
  today: Date;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  nationalitiesList = [];
  nationalList = [];
  nationalitySelected: string;
  nationalitiesListSecond = [];
  nationalListSecond = [];
  nationalitySelectedSecond: string;
  countries;
  countryList;
  filteredCountry = [];
  countriesSecond;
  countryListSecond;
  filteredCountrySecond = [];
  countriesFinance;
  countryListFinance;
  filteredCountryFinance = [];
  savedForm;
  isWaitingForResponse = false;
  internshipData: any;
  constructor(
    public authService: AuthService,
    public translate: TranslateService,
    private fb: UntypedFormBuilder,
    private candidateService: CandidatesService,
    private studentService: StudentsService,
    private schoolService: SchoolService,
    private parseStringDatePipe: ParseStringDatePipe,
    private dateAdapter: DateAdapter<Date>,
    private fileUploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    private utilService: UtilityService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private internshipService: InternshipService,
  ) {}

  ngOnInit() {
    this.initRegistrationForm();
    this.getDataInternship();
    this.today = new Date();
    // this.dateAdapter.setLocale(this.translate.currentLang);
    this.subs.sink = this.schoolService.getCountry().subscribe((list: any[]) => {
      this.countries = list;
      this.countryList = list;
      this.countriesSecond = list;
      this.countryListSecond = list;
    });
    this.nationalitiesList = this.studentService.getNationalitiesList();
    this.nationalitiesListSecond = this.studentService.getNationalitiesList();
    // console.log('this.dataModify', this.dataModify);
  }
  initRegistrationForm() {
    this.myIdentityForm = this.fb.group({
      short_name: ['', Validators.required],
      long_name: ['', Validators.required],
      country: [''],
      city: [''],
      department: [''],
      region: [''],
      tele_phone: ['', Validators.pattern('^[0-9]*$')],
      address1: [''],
      postal_code: ['', Validators.pattern('^[0-9]*$')],
      logo: [''],
    });
  }

  getDataInternship() {
    if (this.internshipId) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.internshipService.getOneInternship(this.internshipId).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            // console.log(resp);
            this.internshipData = _.cloneDeep(resp);
            const data = _.cloneDeep(resp);
            let address: any;
            if (data.student_id && data.student_id.school && data.student_id.school.school_address) {
              if (Array.isArray(data.student_id.school.school_address)) {
                address = data.student_id.school.school_address.find((list) => list.is_main_address);
              } else {
                address = data.student_id.school.school_address;
              }
              if (address) {
                data.student_id.school.address1 = address.address1 ? address.address1 : '';
                data.student_id.school.department = address.department ? address.department : '';
                data.student_id.school.region = address.region ? address.region : '';
                data.student_id.school.postal_code = address.postal_code;
                data.student_id.school.city = address.city;
                data.student_id.school.country = address.country;
              }
            }
            // console.log(data, this.myIdentityForm.value);
            if (data && data.student_id && data.student_id.school) {
              this.myIdentityForm.patchValue(data.student_id.school);
            }
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
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  filterNationality() {
    const searchString = this.myIdentityForm.get('nationality').value.toLowerCase().trim();
    this.nationalList = this.nationalitiesList.filter((nationalities) =>
      nationalities.countryName.toLowerCase().trim().includes(searchString),
    );
  }

  filterNationalitySecond() {
    const searchString = this.myIdentityForm.get('nationality_second').value.toLowerCase().trim();
    this.nationalListSecond = this.nationalitiesListSecond.filter((nationalities) =>
      nationalities.countryName.toLowerCase().trim().includes(searchString),
    );
  }

  filterCountry() {
    const searchString = this.myIdentityForm.get('country').value.toLowerCase().trim();
    this.filteredCountry = this.countries.filter((country) => country.name.toLowerCase().trim().includes(searchString));
  }

  filterCountrySecond() {
    const searchString = this.myIdentityForm.get('country_of_birth').value.toLowerCase().trim();
    this.filteredCountrySecond = this.countriesSecond.filter((country) => country.name.toLowerCase().trim().includes(searchString));
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

  displayCountry(country): string {
    // console.log(country);
    if (this.translate && country) {
      const nationality = this.translate.instant(country);
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

  createPayload(data) {
    const payload = {
      short_name: data.short_name,
      long_name: data.long_name,
      logo: data.logo,
      tele_phone: data.tele_phone,
      school_address: this.internshipData.student_id.school.school_address,
    };
    let indexAddress: any;
    if (this.internshipData.student_id.school.school_address && this.internshipData.student_id.school.school_address.length) {
      indexAddress = this.internshipData.student_id.school.school_address.findIndex((list) => list.is_main_address);
      if (indexAddress) {
        payload.school_address[indexAddress] = {
          address1: data.address1,
          postal_code: data.postal_code,
          city: data.city,
          department: data.department,
          region: data.region,
          country: data.country,
        };
      }
    } else {
      const addrs = {
        address1: data.address1,
        postal_code: data.postal_code,
        city: data.city,
        department: data.department,
        region: data.region,
        country: data.country,
        is_main_address: true,
      };
      payload.school_address = [];
      payload.school_address.push(addrs);
    }
    return payload;
  }

  identitySave() {
    // console.log(this.myIdentityForm.value);
    const data = _.cloneDeep(this.myIdentityForm.value);
    const payload = this.createPayload(data);
    const payloadIntern = {
      internship_creation_step: 'company',
    };
    if (payload) {
      // console.log('Payload', payload);
      this.subs.sink = this.schoolService.updateSchool(this.internshipData.student_id.school._id, payload).subscribe(
        (resp) => {
          if (resp) {
            if (
              this.internshipData.internship_creation_step === 'intern' ||
              this.internshipData.internship_creation_step === 'school' ||
              !this.internshipData.internship_creation_step
            ) {
              this.subs.sink = this.internshipService.updateInternship(this.internshipData._id, payloadIntern).subscribe(
                (resps) => {
                  Swal.fire({
                    type: 'success',
                    title: this.translate.instant('INTERNSHIPS_S4.TITLE'),
                    text: this.translate.instant('INTERNSHIPS_S4.TEXT'),
                    confirmButtonText: this.translate.instant('INTERNSHIPS_S4.BUTTON'),
                    allowOutsideClick: false,
                  }).then(() => {
                    this.candidateService.setDataJobTwo(this.myIdentityForm.value);
                    this.candidateService.setStatusStepTwo(true);
                    this.candidateService.setStatusEditModeTwo(false);
                  });
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
            } else {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('INTERNSHIPS_S4.TITLE'),
                text: this.translate.instant('INTERNSHIPS_S4.TEXT'),
                confirmButtonText: this.translate.instant('INTERNSHIPS_S4.BUTTON'),
                allowOutsideClick: false,
              }).then(() => {
                this.candidateService.setDataJobTwo(this.myIdentityForm.value);
                this.candidateService.setStatusStepTwo(true);
                this.candidateService.setStatusEditModeTwo(false);
              });
            }
          }
        },
        (err) => {
          console.log(err);
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

  cancelEdit() {
    // if (!this.checkDataEdit()) {
    //   Swal.fire({
    //     title: this.translate.instant('ARE_YOU_SURE'),
    //     type: 'warning',
    //     showCancelButton: true,
    //     confirmButtonText: this.translate.instant('DELETE_LOGO.BUTTON_CONFIRM'),
    //     cancelButtonText: this.translate.instant('DELETE_LOGO.BUTTON_CANCEL'),
    //     allowOutsideClick: false,
    //     allowEnterKey: false,
    //   }).then((res) => {
    //     if (res.value) {
    //       this.candidateService.setStatusStepTwo(false);
    //       this.candidateService.setStatusEditModeTwo(false);
    //     }
    //   });
    // } else {
    this.candidateService.setStatusStepTwo(false);
    this.candidateService.setStatusEditModeTwo(false);
    // }
  }

  openPopUpValidation(data, type) {
    this.subs.sink = this.dialog
      .open(RegistrationDialogComponent, {
        width: '600px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          type: type,
          data: this.myIdentityForm.value,
          step: data,
          candidateId: this.dataModify._id,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp.type === 'cancel') {
        } else {
          this.candidateService.setStatusEditMode(false);
          this.candidateService.setIndexStep(1);
        }
      });
  }

  checkDataEdit() {
    let flag = true;
    const firstForm = JSON.stringify(this.savedForm);
    const currentForm = JSON.stringify(this.myIdentityForm.getRawValue());

    if (firstForm === currentForm) {
      return flag;
    } else {
      flag = false;
      return flag;
    }
  }

  ngOnDestroy() {
    // this.subs.unsubscribe();
  }
}
