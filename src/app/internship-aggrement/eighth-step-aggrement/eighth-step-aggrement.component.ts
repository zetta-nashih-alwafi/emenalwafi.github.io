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

@Component({
  selector: 'ms-eighth-step-aggrement',
  templateUrl: './eighth-step-aggrement.component.html',
  styleUrls: ['./eighth-step-aggrement.component.scss'],
})
export class EighthStepAggrementComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() candidateId = '';
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
  titleList = [
    'Title 1', 'Title 2', 'Title 3'
  ];
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
  descriptionText =
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.';
  @Output() currentIndex = new EventEmitter<any>();

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
    private transcriptBuilderService: TranscriptBuilderService,
  ) {}
  ngOnInit() {
    this.photos = this.serverimgPath + 'Josefina.jpg';
    this.detailForm = this.fb.group({
      question: [''],
    });
    this.subs.sink = this.candidateService.dataJobOfferThree.subscribe((val) => {
      if (val) {
        if (val.question && val.question.length) {
          this.question = val.question;
        }
      }
    });
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
  saveStep() {
    Swal.fire({
      type: 'success',
      title: this.translate.instant('JOB_OFFER_S3.TITLE'),
      html: this.translate.instant('JOB_OFFER_S3.TEXT', {
        user: name,
      }),
      allowEscapeKey: true,
      allowOutsideClick: false,
      confirmButtonText: this.translate.instant('JOB_OFFER_S3.BUTTON'),
    }).then((ressss) => {
      window.open(`./rncpTitles`, '_self');
    });
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
}
