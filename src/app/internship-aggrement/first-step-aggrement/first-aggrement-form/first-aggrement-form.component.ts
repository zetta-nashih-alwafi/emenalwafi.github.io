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
import { CoreService } from 'app/service/core/core.service';

@Component({
  selector: 'ms-first-aggrement-form',
  templateUrl: './first-aggrement-form.component.html',
  styleUrls: ['./first-aggrement-form.component.scss'],
  providers: [ParseStringDatePipe],
})
export class FirstAggrementFormComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() candidateId = '';
  @Input() internshipId = '';
  @Input() dataModify: any;
  myIdentityForm: UntypedFormGroup;
  private subs = new SubSink();
  today: any;

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
    public coreService: CoreService,
  ) {}

  ngOnInit() {
    this.initRegistrationForm();
    this.getDataInternship();
    this.today = new Date();
    const dataDate = this.parseStringDatePipe.transform(this.today);
    this.today = moment(dataDate).format('YYYY-MM-DD');
    // this.dateAdapter.setLocale(this.translate.currentLang);
    this.subs.sink = this.schoolService.getCountry().subscribe((list: any[]) => {
      this.countries = list;
      this.countryList = list;
      this.countriesSecond = list;
      this.countryListSecond = list;
    });
    this.nationalitiesList = this.studentService.getNationalitiesList();
    this.nationalitiesListSecond = this.studentService.getNationalitiesList();
    // console.log('this.dataModify', this.dataModify, this.today);
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
            if (data.student_id.student_address && data.student_id.student_address.length) {
              let address = data.student_id.student_address.find((list) => list.is_main_address);
              if (address) {
                data.student_id.address = address.address;
                data.student_id.additional_address = address.additional_address;
                data.student_id.postal_code = address.postal_code;
                data.student_id.city = address.city;
                data.student_id.country = address.country;
                data.student_id.city_of_birth = address.city_of_birth;
                data.student_id.country_of_birth = address.country_of_birth;
                data.student_id.post_code_of_birth = address.post_code_of_birth;
              } else {
                address = data.student_id.student_address[0];
                data.student_id.address = address.address;
                data.student_id.additional_address = address.additional_address;
                data.student_id.postal_code = address.postal_code;
                data.student_id.city = address.city;
                data.student_id.country = address.country;
                data.student_id.city_of_birth = address.city_of_birth;
                data.student_id.country_of_birth = address.country_of_birth;
                data.student_id.post_code_of_birth = address.post_code_of_birth;
              }
            }
            if (data.student_id && data.student_id.date_of_birth) {
              data.student_id.date_of_birth = this.parseStringDatePipe.transform(data.student_id.date_of_birth);
              data.student_id.date_of_birth = moment(data.student_id.date_of_birth).format('YYYY-MM-DD');
            }
            // console.log('data.student_id', data.student_id);
            this.myIdentityForm.patchValue(data.student_id);
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

  initRegistrationForm() {
    this.myIdentityForm = this.fb.group({
      civility: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      // last_name_used: ['', Validators.required],
      // first_name_used: ['', Validators.required],
      country: ['', Validators.required],
      city: [''],
      address: [''],
      additional_address: [''],
      postal_code: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      date_of_birth: ['', Validators.required],
      country_of_birth: ['', Validators.required],
      city_of_birth: ['', Validators.required],
      post_code_of_birth: ['', Validators.required],
      nationality: ['', Validators.required],
      nationality_second: [''],
      photo: [''],
      tele_phone: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      fixed_phone: ['', Validators.pattern('^[0-9]*$')],
      email: ['', Validators.required],
    });
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
      civility: data.civility,
      first_name: data.first_name,
      last_name: data.last_name,
      last_name_used: data.last_name_used,
      first_name_used: data.first_name_used,
      date_of_birth: moment(data.date_of_birth).format('YYYY-MM-DD'),
      nationality: data.nationality,
      nationality_second: data.nationality_second,
      photo: data.photo,
      sex: data.civility === 'MRS' ? 'F' : 'M',
      tele_phone: data.tele_phone ? data.tele_phone.toString() : '',
      email: data.email,
      home_telephone: data.fixed_phone ? data.fixed_phone.toString() : '',
      student_address: [],
    };
    payload.student_address = [];
    const student_address = {
      address: data.address,
      additional_address: data.additional_address,
      postal_code: data.postal_code ? data.postal_code.toString() : '',
      city: data.city,
      country: data.country,
      country_of_birth: data.country_of_birth,
      is_main_address: true,
      city_of_birth: data.city_of_birth,
      post_code_of_birth: data.post_code_of_birth ? data.post_code_of_birth.toString() : '',
    };
    payload.student_address.push(student_address);
    return payload;
  }

  identitySave() {
    this.isWaitingForResponse = true;
    // console.log(this.myIdentityForm.value);
    const data = _.cloneDeep(this.myIdentityForm.value);
    const payload = this.createPayload(data);
    if (payload) {
      // console.log('Payload', payload);
      this.subs.sink = this.schoolService.updateStudent(this.internshipData.student_id._id, payload, this.translate.currentLang).subscribe(
        (resp) => {
          if (resp) {
            if (this.internshipData.internship_creation_step === 'intern' || !this.internshipData.internship_creation_step) {
              const payloadIntern = {
                internship_creation_step: 'school',
              };
              this.subs.sink = this.internshipService.updateInternship(this.internshipData._id, payloadIntern).subscribe(
                (resps) => {
                  this.isWaitingForResponse = false;
                  Swal.fire({
                    type: 'success',
                    title: this.translate.instant('INTERNSHIPS_S4.TITLE'),
                    text: this.translate.instant('INTERNSHIPS_S4.TEXT'),
                    confirmButtonText: this.translate.instant('INTERNSHIPS_S4.BUTTON'),
                    allowOutsideClick: false,
                  }).then(() => {
                    this.candidateService.setStatusStepOne(true);
                    this.candidateService.setStatusEditMode(false);
                  });
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
            } else {
              this.isWaitingForResponse = false;
              Swal.fire({
                type: 'success',
                title: this.translate.instant('INTERNSHIPS_S4.TITLE'),
                text: this.translate.instant('INTERNSHIPS_S4.TEXT'),
                confirmButtonText: this.translate.instant('INTERNSHIPS_S4.BUTTON'),
                allowOutsideClick: false,
              }).then(() => {
                this.candidateService.setStatusStepOne(true);
                this.candidateService.setStatusEditMode(false);
              });
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

  cancelEdit() {
    this.candidateService.setStatusEditMode(false);
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

  disableSave() {
    let disable = false;
    if (this.myIdentityForm.invalid) {
      this.candidateService.disableValidateStepOne(true);
      disable = true;
      return disable;
    } else {
      this.candidateService.disableValidateStepOne(false);
      return disable;
    }
  }

  ngOnDestroy() {
    // this.subs.unsubscribe();
  }
}
