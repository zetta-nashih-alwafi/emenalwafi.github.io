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
import { InternshipService } from 'app/service/internship/internship.service';
import * as moment from 'moment';

@Component({
  selector: 'ms-amendment-step-aggrement',
  templateUrl: './amendment-step-aggrement.component.html',
  styleUrls: ['./amendment-step-aggrement.component.scss'],
})
export class AmendmentStepAggrementComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() candidateId = '';
  @Input() internshipId = '';
  @Input() dataModify: any;
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
  titleList = ['Title 1', 'Title 2', 'Title 3'];
  uploadCV = [{ name: 'capture', s3_file_name: '1' }];
  imageLetter = [{ name: 'capture', s3_file_name: '1' }];
  companyImage = 'https://i.imgur.com/uCLo8Ek.jpg';
  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  schoolImage = 'https://api.poc-edh.zetta-demo.space/fileuploads/EFAP.jpg';
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  photos = '';
  question = [];
  specialization_input = new UntypedFormControl('');

  @Output() currentIndex = new EventEmitter<any>();
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
    private transcriptBuilderService: TranscriptBuilderService,
  ) {}

  ngOnInit() {
    this.initForm();
    this.getDataInternship();
    this.photos = this.serverimgPath + 'Josefina.jpg';
    this.subs.sink = this.candidateService.dataJobOfferThree.subscribe((val) => {
      if (val) {
        if (val.question && val.question.length) {
          this.question = val.question;
        }
      }
    });
  }

  initForm() {
    this.detailForm = this.fb.group({
      interupted: [null],
      suspended: [null],
      extended: [null],
      amendment_type: [null],
      date_from: [null],
      date_to: [null],
      time_from: ['15:59'],
      time_to: ['15:59'],
      is_student_already_sign: [null],
      is_HR_already_sign: [null],
      is_BR_already_sign: [null],
    });
  }

  getDataInternship() {
    // console.log('Mentor Tab', this.internshipId);
    if (this.internshipId) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.internshipService.getOneInternship(this.internshipId).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            // console.log(resp);
            this.internshipData = _.cloneDeep(resp);
            if (this.internshipData.amendments && this.internshipData.amendments.length) {
              if (this.internshipData.amendments[0].date_from) {
                this.internshipData.amendments[0].date_from = this.parseStringDatePipe.transformStringToDate(
                  this.internshipData.amendments[0].date_from,
                );
              }
              if (this.internshipData.amendments[0].date_to) {
                this.internshipData.amendments[0].date_to = this.parseStringDatePipe.transformStringToDate(
                  this.internshipData.amendments[0].date_to,
                );
              }
              this.detailForm.patchValue(this.internshipData.amendments[0]);
              if (this.internshipData.amendments[0].amendment_type) {
                this.optionChanged(this.internshipData.amendments[0].amendment_type);
              }
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

  modifyStep() {
    this.candidateService.setIndexStep(0);
    // this.candidateService.setStatusStepThree(true);
  }
  createPayload() {
    const payload = _.cloneDeep(this.detailForm.value);
    payload.date_from = moment(payload.date_from).format('DD/MM/YYYY');
    payload.date_to = moment(payload.date_to).format('DD/MM/YYYY');
    // delete payload.interupted;
    // delete payload.suspended;
    // delete payload.extended;
    // return payload;
    const payloadFinal = {
      amendments: [],
      internship_status: this.internshipData.internship_status,
    };
    if (payload.amendment_type) {
      if (payload.amendment_type === 'internship_interupted') {
        payloadFinal.internship_status = 'interrupted';
      } else if (payload.amendment_type === 'internship_suspended') {
        payloadFinal.internship_status = 'postponned';
      }
    }
    delete payload.interupted;
    delete payload.suspended;
    delete payload.extended;
    payloadFinal.amendments = [];
    payloadFinal.amendments.push(payload);
    return payloadFinal;
  }

  saveStep() {
    const payloadIntern = _.cloneDeep(this.createPayload());
    this.subs.sink = this.internshipService.updateInternship(this.internshipId, payloadIntern).subscribe(
      (resps) => {
        Swal.fire({
          type: 'success',
          title: 'Bravo!',
          confirmButtonText: 'OK',
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then(() => {
          // this.candidateService.setStatusStepTen(true);
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
  saveOnlyStep() {
    Swal.fire({
      type: 'question',
      title: this.translate.instant('JOB_OFFER_S1.TITLE'),
      html: this.translate.instant('JOB_OFFER_S1.TEXT', {
        user: name,
      }),
      showCancelButton: true,
      allowEscapeKey: true,
      allowOutsideClick: false,
      reverseButtons: true,
      confirmButtonText: this.translate.instant('JOB_OFFER_S1.BUTTON_2'),
      cancelButtonText: this.translate.instant('JOB_OFFER_S1.BUTTON_1'),
    }).then((resss) => {
      if (resss.value) {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('JOB_OFFER_S2.TITLE'),
          html: this.translate.instant('JOB_OFFER_S2.TEXT', {
            user: name,
          }),
          showCancelButton: true,
          allowEscapeKey: true,
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('JOB_OFFER_S2.BUTTON_1'),
        }).then((ressss) => {
          window.open(`./rncpTitles`, '_self');
        });
      }
    });
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

  getPdfHtml() {
    const fileDoc = document.getElementById('pdf-condition').innerHTML;
    const html = fileDoc;
    return html;
  }
  optionChanged(option) {
    if (option) {
      this.detailForm.get('amendment_type').setValue(option);
    }
    if (option === 'internship_interupted') {
      this.detailForm.get('interupted').setValue(true);
      this.detailForm.get('extended').setValue(false);
      this.detailForm.get('suspended').setValue(false);
    } else if (option === 'internship_suspended') {
      this.detailForm.get('suspended').setValue(true);
      this.detailForm.get('extended').setValue(false);
      this.detailForm.get('interupted').setValue(false);
    } else if (option === 'internship_extended') {
      this.detailForm.get('interupted').setValue(false);
      this.detailForm.get('suspended').setValue(false);
      this.detailForm.get('extended').setValue(true);
    }
  }
}
