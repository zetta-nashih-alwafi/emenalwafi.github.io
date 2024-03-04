import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectorRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { SchoolService } from 'app/service/schools/school.service';
import { StudentsService } from 'app/service/students/students.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ApplicationUrls } from 'app/shared/settings';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { RegistrationDialogComponent } from 'app/candidates/registration-dialog/registration-dialog.component';
import { STYLE } from 'app/title-rncp/conditions/class-condition/score/second-step-score/condition-score-preview/pdf-styles';
import { environment } from 'environments/environment';
import { TranscriptBuilderService } from 'app/service/transcript-builder/transcript-builder.service';
import { DatePipe } from '@angular/common';
import { InternshipService } from 'app/service/internship/internship.service';
import * as moment from 'moment';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import { removeNumber } from 'app/service/customvalidator.validator';

@Component({
  selector: 'ms-sixth-step-aggrement',
  templateUrl: './sixth-step-aggrement.component.html',
  styleUrls: ['./sixth-step-aggrement.component.scss'],
  providers: [DatePipe],
})
export class SixthStepAggrementComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() candidateId = '';
  @Input() internshipId = '';
  @Input() dataModify: any;
  @Input() isUserCRM: any;
  @Input() isUserMentor: any;
  @Input() isUserStudent: any;
  @Input() isUserMember: any;
  private subs = new SubSink();
  detailForm: UntypedFormGroup;
  today = new Date();
  isLoadingUpload = false;
  photo: string;
  photo_s3_path: string;
  is_photo_in_s3: boolean;
  paymentForm: UntypedFormGroup;
  creditForm: UntypedFormGroup;
  pdfIcon = '../../../assets/img/pdf.png';
  questionList = [
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  ];
  uploadCV = [{ name: 'capture', s3_file_name: '1' }];
  imageLetter = [{ name: 'capture', s3_file_name: '1' }];
  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  question = [];
  descriptionText =
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.';
  specialization_input = new UntypedFormControl('');

  @Output() currentIndex = new EventEmitter<any>();
  isWaitingForResponse = false;
  internshipData: any;
  currencyList = [];
  currencyListOri = [];
  currencyFilter = new UntypedFormControl('');
  minDate;
  constructor(
    public authService: AuthService,
    public translate: TranslateService,
    private fb: UntypedFormBuilder,
    private candidateService: CandidatesService,
    private studentService: StudentsService,
    private schoolService: SchoolService,
    private parseStringDatePipe: ParseStringDatePipe,
    public dateAdapter: DateAdapter<Date>,
    private fileUploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    private utilService: UtilityService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private transcriptBuilderService: TranscriptBuilderService,
    private internshipService: InternshipService,
    private acadJourneyService: AcademicJourneyService,
  ) {
    this.dateAdapter.setLocale(this.translate.currentLang);
  }
  ngOnInit() {
    this.initForm();
    this.getDataInternship(false);
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe((list: any[]) => {
      this.currencyList = _.cloneDeep(list);
      this.currencyListOri = _.cloneDeep(list);
      // console.log('this.currencyList', this.currencyList);
    });
    this.subs.sink = this.candidateService.dataJobOfferThree.subscribe((val) => {
      if (val) {
        if (val.question && val.question.length) {
          this.question = val.question;
        }
      }
    });
  }

  filterCurrency() {
    const searchString = this.currencyFilter.value.toLowerCase().trim();
    this.currencyList = this.currencyListOri.filter((country) => country.code.toLowerCase().trim().includes(searchString));
    // console.log(this.currencyFilter.value, searchString, this.currencyList);
  }

  getDataInternship(last) {
    // console.log('Internship Tab', this.internshipId);
    if (this.internshipId) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.internshipService.getOneInternship(this.internshipId).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            // console.log(resp);
            this.internshipData = _.cloneDeep(resp);
            if (this.internshipData.internship_date && this.internshipData.internship_date.date_from) {
              this.internshipData.internship_date.date_from = this.parseStringDatePipe.transformStringToDate(
                this.internshipData.internship_date.date_from,
              );
              this.internshipData.internship_date.date_from = moment(this.internshipData.internship_date.date_from).format('YYYY-MM-DD');
            }
            if (this.internshipData.internship_date && this.internshipData.internship_date.date_to) {
              this.internshipData.internship_date.date_to = this.parseStringDatePipe.transformStringToDate(
                this.internshipData.internship_date.date_to,
              );
              this.internshipData.internship_date.date_to = moment(this.internshipData.internship_date.date_to).format('YYYY-MM-DD');
            }
            if (this.internshipData.salary) {
              this.internshipData.salary = parseInt(this.internshipData.salary);
            }
            if (this.internshipData.currency) {
              this.currencyFilter.setValue(this.internshipData.currency);
            }
            if (
              this.internshipData.internship_address.address &&
              this.internshipData.internship_address.city &&
              this.internshipData.internship_address.postal_code
            ) {
              this.internshipData['has_internship_address'] = true;
            } else {
              this.internshipData['has_internship_address'] = false;
            }

            if (
              this.internshipData.internship_aboard.address &&
              this.internshipData.internship_aboard.city &&
              this.internshipData.internship_aboard.postal_code
            ) {
              this.internshipData['has_internship_aboard'] = true;
            } else {
              this.internshipData['has_internship_aboard'] = false;
            }

            this.detailForm.patchValue(this.internshipData);
            // console.log('_intern', this.internshipData);
            // console.log('_intern', this.detailForm.value);
            this.minDate = this.internshipData.internship_date.date_from;
            if (last) {
              this.candidateService.setStatusEditModeSix(false);
              this.candidateService.setStatusStepSix(true);
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

  initForm() {
    this.detailForm = this.fb.group({
      internship_name: ['', Validators.required],
      internship_date: this.fb.group({
        date_from: [null, Validators.required],
        date_to: [null, Validators.required],
        time_from: ['15:59'],
        time_to: ['15:59'],
        duration_in_months: [null, Validators.required],
      }),
      department: ['', Validators.required],
      has_internship_address: [null],
      internship_address: this.fb.group({
        address: [null],
        postal_code: [null, Validators.pattern('^[0-9]*$')],
        city: [null],
      }),
      has_internship_aboard: [null],
      internship_aboard: this.fb.group({
        address: [null],
        postal_code: [null, Validators.pattern('^[0-9]*$')],
        city: [null],
      }),
      is_work_from_home: [null],
      commentaries: [''],
      salary: [null],
      currency: ['EUR'],
      volume_hours: [null, Validators.required],
      job_description: [''],
    });
  }
  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  currencySelected(event) {
    this.detailForm.get('currency').setValue(event);
  }

  openPopUp(data, type) {
    this.subs.sink = this.dialog
      .open(RegistrationDialogComponent, {
        width: '355px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          type: type,
          data: data,
          candidateId: this.candidateId,
          modify: this.dataModify,
        },
      })
      .afterClosed()
      .subscribe((resp) => {});
  }

  identityUpdated() {
    const payloadIntern = _.cloneDeep(this.detailForm.value);
    payloadIntern.salary = payloadIntern && payloadIntern.salary ? payloadIntern.salary.toString() : '';
    payloadIntern.internship_creation_step = 'conditions';
    payloadIntern.internship_date.date_from = moment(payloadIntern.internship_date.date_from).format('DD/MM/YYYY');
    payloadIntern.internship_date.date_to = moment(payloadIntern.internship_date.date_to).format('DD/MM/YYYY');
    const defaultAdress = {
      address: '',
      city: '',
      postal_code: '',
    };
    if (!payloadIntern.has_internship_address) {
      payloadIntern.internship_address = defaultAdress;
      delete payloadIntern.has_internship_address;
    } else {
      delete payloadIntern.has_internship_address;
    }
    if (!payloadIntern.has_internship_aboard) {
      payloadIntern.internship_aboard = defaultAdress;
      delete payloadIntern.has_internship_aboard;
    } else {
      delete payloadIntern.has_internship_aboard;
    }
    // delete payloadIntern.work_from_home;
    this.subs.sink = this.internshipService.updateInternship(this.internshipData._id, payloadIntern).subscribe(
      (resps) => {
        Swal.fire({
          type: 'success',
          title: 'Bravo!',
          confirmButtonText: 'OK',
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then(() => {
          this.getDataInternship(true);
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
      .subscribe((resp) => {});
  }

  logOut() {
    this.authService.logOut();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  addSpecialization() {
    if (this.question.length <= 4) {
      if (this.specialization_input.value && this.specialization_input.value !== '') {
        this.question.push(this.specialization_input.value);
        this.specialization_input.setValue('');
      }
    }
  }
  remoteSpecialization(index: number) {
    this.question.splice(index, 1);
  }
  submitStepThree() {
    this.detailForm.get('question').setValue(this.question);
    this.candidateService.setDataJobThree(this.detailForm.value);
    // console.log('Payload Step Three', this.detailForm.value);
    this.candidateService.setIndexStep(3);
    this.candidateService.setStatusStepThree(true);
  }
  skipStepThree() {
    this.candidateService.setIndexStep(3);
    this.candidateService.setStatusStepThree(true);
  }
  openImage(img) {
    if (img === '1') {
      const url = 'https://api.admission.zetta-demo.space/fileuploads/dummy.pdf';
      window.open(url, '_blank');
    } else {
      const url = `${environment.apiUrl}/fileuploads/${img}`.replace('/graphql', '');
      window.open(url, '_blank');
    }
  }
  editIdentity() {
    this.candidateService.setStatusEditModeSix(true);
  }
  formIsEmpty() {
    // ***************** Fill the function when it's dynamic
    if (this.detailForm.invalid) {
      return true;
    } else {
      return false;
    }
  }

  getStartDate() {
    this.minDate = this.detailForm.controls['internship_date'].value.date_from;
    if (this.minDate) {
      return this.minDate;
    }
  }
}
