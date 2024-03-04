import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectorRef, AfterViewChecked, ViewChild, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
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
import { DatePipe } from '@angular/common';
import { InternshipService } from 'app/service/internship/internship.service';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'ms-first-step-aggrement',
  templateUrl: './first-step-aggrement.component.html',
  styleUrls: ['./first-step-aggrement.component.scss'],
  providers: [ParseStringDatePipe],
})
export class FirstStepAggrementComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() candidateId = '';
  @Input() internshipId = '';
  @Input() dataModify: any;
  @Input() isUserCRM: any;
  @Input() isUserMentor: any;
  @Input() isUserStudent: any;
  @Input() isUserMember: any;
  private subs = new SubSink();
  today = new Date();
  isLoadingUpload = false;
  photo: string;
  countryForm: UntypedFormGroup;
  photo_s3_path: string;
  is_photo_in_s3: boolean;
  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  @ViewChild('fileUpload', { static: false }) uploadInput: any;
  datePipe: DatePipe;

  isWaitingForResponse = false;
  countriesFinance;
  countryListFinance;
  candidateSchool = [];
  filteredCountryFinance = [];
  @Output() currentIndex = new EventEmitter<any>();
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  photos = '';

  isLocationFrance = true;
  isLocationOverseas = true;
  isRemote = true;
  isPresence = true;
  isLocationDone = false;
  isPresentDone = false;

  isOngoing = true;
  isPeriodDone = false;
  isSpecific = true;

  isLevelOne = true;
  isLevelTwo = true;
  isLevelThree = true;
  isLevelDone = false;

  isStipendOne = true;
  isStipendTwo = true;
  isStipendDone = false;

  isLocationSelected = false;
  isDateSelected = false;
  isStipendSelected = false;
  currencyList = ['Euro', 'USD', 'AUD', 'IDR', 'NZD'];
  paidList = ['Every week', 'Every 2 weeks', 'Every month', 'End of the internship'];
  internshipData: any;
  formValue = {
    location: '',
    presence: '',
    level: '',
    stipend: null,
    currency: '',
    amount: '',
    from: '',
    to: '',
    paid: '',
    ongoing: null,
  };
  isUserHR = false;
  disabledValidate = false;

  constructor(
    public authService: AuthService,
    public translate: TranslateService,
    private fb: UntypedFormBuilder,
    private candidateService: CandidatesService,
    private internshipService: InternshipService,
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
    private ngxPermissionService: NgxPermissionsService,
  ) {}
  ngOnInit() {
    // console.log('internshipId', this.internshipId);
    this.isUserHR = !!this.ngxPermissionService.getPermission('HR');
    this.photos = this.serverimgPath + 'Josefina.jpg';
    this.subs.sink = this.schoolService.getCountry().subscribe((list: any[]) => {
      this.countriesFinance = list;
      this.countryListFinance = list;
    });
    this.getDataInternship();
    this.countryForm = this.fb.group({
      country: [''],
      date_from: [''],
      date_to: [''],
      amount: [''],
      currency: [''],
      paid: [''],
    });
    this.subs.sink = this.candidateService.dataJobOfferOne.subscribe((val) => {
      if (val) {
        this.countryForm.patchValue(val);
        if (val.ongoing) {
          this.isPeriodDone = true;
          this.isOngoing = true;
          this.isSpecific = false;
        }
        if (val.from) {
          this.isPeriodDone = true;
          this.isOngoing = false;
          this.isSpecific = true;
        }
        if (val.level) {
          this.isLevelDone = true;
          if (val.level === '1') {
            this.isLevelOne = true;
            this.isLevelTwo = false;
            this.isLevelThree = false;
          } else if (val.level === '2') {
            this.isLevelOne = false;
            this.isLevelTwo = true;
            this.isLevelThree = false;
          } else {
            this.isLevelOne = false;
            this.isLevelTwo = false;
            this.isLevelThree = true;
          }
        }
        if (val.location) {
          if (val.location === 'france') {
            this.isLocationFrance = true;
            this.isLocationDone = true;
            this.isLocationOverseas = false;
          } else {
            this.isLocationFrance = false;
            this.isLocationOverseas = true;
            this.isLocationDone = true;
          }
        }
        if (val.stipend) {
          this.isStipendOne = false;
          this.isStipendTwo = true;
          this.isStipendDone = true;
        } else {
          this.isStipendOne = true;
          this.isStipendTwo = false;
          this.isStipendDone = true;
        }
        if (val.presence) {
          if (val.presence === 'remote') {
            this.isRemote = true;
            this.isPresentDone = true;
            this.isPresence = false;
          } else {
            this.isRemote = false;
            this.isPresentDone = true;
            this.isPresence = true;
          }
        }
      }
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
            this.internshipData = resp;
            this.disableValidate(resp);
            const data = _.cloneDeep(resp);
            if (data.student_id.student_address && data.student_id.student_address.length) {
              const address = data.student_id.student_address.find((list) => list.is_main_address);
              data.student_id.city_of_birth = address && address.city_of_birth ? address.city_of_birth : '';
              data.student_id.country_of_birth = address && address.country_of_birth ? address.country_of_birth : '';
              data.student_id.post_code_of_birth = address && address.post_code_of_birth ? address.post_code_of_birth : '';
            }
            this.internshipData = data;
            if (this.internshipData.student_id && this.internshipData.student_id.date_of_birth) {
              this.internshipData.student_id.date_of_birth = this.parseStringDatePipe.transform(
                this.internshipData.student_id.date_of_birth,
              );
              this.internshipData.student_id.date_of_birth = moment(this.internshipData.student_id.date_of_birth, 'YYYYMMDD').format(
                'DD/MM/YYYY',
              );
              // this.internshipData.student_id.date_of_birth = moment(this.internshipData.student_id.date_of_birth).format('DD/MM/YYYY');
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

  translateDate(date) {
    return moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
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
          data: this.dataModify,
          step: data,
          candidateId: this.dataModify._id,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        // console.log('Masuk Sini Harus', resp);
        if (resp.type === 'cancel') {
        } else {
          // console.log('Masuk Sini Harus');
          this.candidateService.setStatusEditMode(false);
          this.candidateService.setIndexStep(1);
          this.currentIndex.emit(1);
        }
      });
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  locationIntership(location) {
    if (location === 'france') {
      this.isLocationFrance = true;
      this.isLocationDone = true;
      this.isLocationOverseas = false;
      this.formValue.location = 'france';
      this.candidateService.setDataJobOne(this.formValue);
    } else {
      this.isLocationSelected = true;
      this.isLocationFrance = false;
      this.isLocationOverseas = true;
    }
  }
  countrySelected() {
    this.isLocationDone = true;
    this.formValue.location = this.countryForm.get('country').value;
    this.candidateService.setDataJobOne(this.formValue);
  }
  presentIntership(detail) {
    if (detail === 'remote') {
      this.isRemote = true;
      this.isPresentDone = true;
      this.isPresence = false;
      this.formValue.presence = 'remote';
      this.candidateService.setDataJobOne(this.formValue);
    } else {
      this.isRemote = false;
      this.isPresentDone = true;
      this.isPresence = true;
      this.formValue.presence = 'presence';
      this.candidateService.setDataJobOne(this.formValue);
    }
  }
  levelIntership(detail) {
    if (detail === '1') {
      this.isLevelOne = true;
      this.isLevelTwo = false;
      this.isLevelThree = false;
      this.isLevelDone = true;
      this.formValue.level = '1';
      this.candidateService.setDataJobOne(this.formValue);
    } else if (detail === '2') {
      this.isLevelOne = false;
      this.isLevelTwo = true;
      this.isLevelThree = false;
      this.isLevelDone = true;
      this.formValue.level = '2';
      this.candidateService.setDataJobOne(this.formValue);
    } else {
      this.isLevelOne = false;
      this.isLevelTwo = false;
      this.isLevelThree = true;
      this.isLevelDone = true;
      this.formValue.level = '3';
      this.candidateService.setDataJobOne(this.formValue);
    }
  }
  stipendIntership(detail) {
    if (detail === 'one') {
      this.isStipendOne = true;
      this.isStipendTwo = false;
      this.isStipendDone = true;
      this.formValue.stipend = false;
      this.candidateService.setDataJobOne(this.formValue);
      this.candidateService.setIndexStep(1);
      this.candidateService.setStatusStepOne(true);
      console.log('Payload Step One', this.formValue);
    } else {
      this.isStipendSelected = true;
      this.isStipendOne = false;
      this.isStipendTwo = true;
      this.formValue.stipend = true;
      this.candidateService.setDataJobOne(this.formValue);
    }
  }
  periodIntership(detail) {
    if (detail === 'ongoing') {
      this.formValue.ongoing = true;
      this.isOngoing = true;
      this.isPeriodDone = true;
      this.isSpecific = false;
      this.candidateService.setDataJobOne(this.formValue);
    } else {
      this.isDateSelected = true;
      this.formValue.ongoing = false;
      this.isOngoing = false;
      this.isSpecific = true;
    }
  }
  dateSelected() {
    this.formValue.from = this.countryForm.get('date_from').value;
    this.formValue.to = this.countryForm.get('date_to').value;
    this.isPeriodDone = true;
    this.candidateService.setDataJobOne(this.formValue);
  }
  stipendSelected() {
    this.formValue.currency = this.countryForm.get('currency').value;
    this.formValue.amount = this.countryForm.get('amount').value;
    this.formValue.paid = this.countryForm.get('paid').value;
    this.candidateService.setDataJobOne(this.formValue);
    this.candidateService.setIndexStep(1);
    this.candidateService.setStatusStepOne(true);
    // console.log('Payload Step One', this.formValue);
    this.isStipendDone = true;
  }
  filterCountrys(addressIndex: number) {
    const searchString = this.countryForm.get('country').value.toLowerCase().trim();
    this.filteredCountryFinance = this.countriesFinance.filter((country) => country.name.toLowerCase().trim().includes(searchString));
  }

  backToLocation() {
    this.isLocationDone = false;
  }
  backToPresence() {
    this.isPresentDone = false;
  }
  backToPeriod() {
    this.isPeriodDone = false;
  }
  backToLevel() {
    this.isLevelDone = false;
  }
  editIdentity() {
    this.candidateService.setStatusEditMode(true);
  }
  identityUpdated() {
    this.isWaitingForResponse = true;
    if (this.internshipData.internship_creation_step === 'intern' || !this.internshipData.internship_creation_step) {
      const payloadIntern = {
        internship_creation_step: 'school',
      };
      this.subs.sink = this.internshipService.updateInternship(this.internshipData._id, payloadIntern).subscribe(
        (resps) => {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: 'Bravo!',
            confirmButtonText: 'OK',
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.candidateService.setStatusStepOne(true);
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
        title: 'Bravo!',
        confirmButtonText: 'OK',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then(() => {
        this.candidateService.setStatusStepOne(true);
      });
    }
  }
  continueStep() {
    Swal.fire({
      type: 'success',
      title: 'Bravo!',
      confirmButtonText: 'OK',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then(() => {
      this.candidateService.setStatusStepOne(true);
    });
  }

  disableValidate(data) {
    if (data) {
      if (data && data.student_id && data.student_id.student_address && data.student_id.student_address.length) {
        const address = data.student_id.student_address.find((list) => list.is_main_address);
        if (
          address.address &&
          address.postal_code &&
          address.country &&
          address.city_of_birth &&
          address.country_of_birth &&
          address.post_code_of_birth &&
          data.student_id.last_name &&
          data.student_id.first_name &&
          data.student_id.nationality &&
          data.student_id.email &&
          data.student_id.tele_phone
        ) {
          this.disabledValidate = false;
        } else {
          this.disabledValidate = true;
        }
      } else {
        this.disabledValidate = true;
      }
    }
    // this.subs.sink = this.candidateService.stepOneForm.subscribe((val) => {
    //   console.log('form status', val);
    //   this.disabledValidate = val;
    // })
  }
}
