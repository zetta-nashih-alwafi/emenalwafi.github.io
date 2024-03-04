import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  ChangeDetectorRef,
  AfterViewChecked,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
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
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { JOBSTYLES } from 'app/school/school-student-cards/card-detail/job-description/job-description-pdf/job-pdf-style';
import { STYLE } from 'app/title-rncp/conditions/class-condition/score/second-step-score/condition-score-preview/pdf-styles';
import { environment } from 'environments/environment';
import { TranscriptBuilderService } from 'app/service/transcript-builder/transcript-builder.service';
// import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { SpeechToTextDialogComponent } from 'app/shared/components/speech-to-text-dialog/speech-to-text-dialog.component';
import { ApplicationUrls } from 'app/shared/settings';
import { InternshipService } from 'app/service/internship/internship.service';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'ms-second-step-aggrement',
  templateUrl: './second-step-aggrement.component.html',
  styleUrls: ['./second-step-aggrement.component.scss'],
})
export class SecondStepAggrementComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  @Input() candidateId = '';
  @Input() dataModify: any;
  @Input() internshipId = '';
  @Input() isUserCRM: any;
  @Input() isUserMentor: any;
  @Input() isUserStudent: any;
  @Input() isUserMember: any;
  detailForm: UntypedFormGroup;
  private subs = new SubSink();
  downloadCondition = true;
  agreeCondition = true;
  scrollDone = false;
  schoolImage = 'https://api.poc-edh.zetta-demo.space/fileuploads/EFAP.jpg';
  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';

  // Second Step Configuration
  public Editor = DecoupledEditor;
  public config = {
    toolbar: [
      'heading',
      '|',
      'fontsize',
      '|',
      'bold',
      'italic',
      'Underline',
      'strikethrough',
      'highlight',
      '|',
      'alignment',
      '|',
      'numberedList',
      'bulletedList',
      '|',
    ],
  };
  pdfIcon = '../../../assets/img/pdf.png';
  imageUploaded = [];
  skill = [];
  specialization_input = new UntypedFormControl('');
  @Output() currentIndex = new EventEmitter<any>();
  currentUser;
  schoolDetail = {
    short_name: 'EFAP',
    long_name: 'EFAP',
    country: 'Germany',
    city: 'Nanterre',
    address: 'Test',
    school: 'GE1',
    campus: 'EFAP',
    additional_address: 'TEST',
    post_code: '12345',
    date_of_birth: '28/12/1998',
    nationality_second: 'a Fontainbleau',
    photo: '',
    fixed_phone: '',
  };
  isWaitingForResponse = false;
  internshipData: any;
  isUserHR = false;
  isUserCandidate = false;
  isUserAlumni = false;
  isUserAlumniMember = false;
  constructor(
    public authService: AuthService,
    public translate: TranslateService,
    private fb: UntypedFormBuilder,
    private candidateService: CandidatesService,
    private studentService: StudentsService,
    private schoolService: SchoolService,
    private fileUploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    private utilService: UtilityService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private internshipService: InternshipService,
    public dialog: MatDialog,
    private transcriptBuilderService: TranscriptBuilderService,
    private ngxPermissionService: NgxPermissionsService,
  ) {}
  ngOnInit() {
    this.isUserHR = !!this.ngxPermissionService.getPermission('HR');
    this.isUserAlumni = !!this.ngxPermissionService.getPermission('Alumni');
    this.isUserAlumniMember = !!this.ngxPermissionService.getPermission('Alumni Member');
    this.isUserCandidate = !!this.ngxPermissionService.getPermission('Candidate');
    if (!this.isUserStudent) {
      this.isUserStudent = !!this.ngxPermissionService.getPermission('Student Mentor');
    }
    this.currentUser = this.authService.getLocalStorageUser();
    this.detailForm = this.fb.group({
      title: [''],
      description: [''],
      profile: [''],
      image: [''],
      skill: [''],
      number_opening: [''],
    });
    this.getDataInternship();
    this.subs.sink = this.candidateService.dataJobOfferTwo.subscribe((val) => {
      if (val) {
        this.schoolDetail = _.cloneDeep(val);
        this.detailForm.patchValue(val);
        if (val.image && val.image.length) {
          this.imageUploaded = val.image.map((data) => {
            return { s3_file_name: data, name: 'capture' };
          });
        }
        if (val.skill && val.skill.length) {
          this.skill = val.skill;
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
            const data = _.cloneDeep(resp);
            this.internshipData = resp;
            if (data.student_id.school && data.student_id.school.school_address && data.student_id.school.school_address.length) {
              const address = data.student_id.school.school_address.find((list) => list.is_main_address);
              this.internshipData.student_id.school.school_address = address;
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
        // console.log('Masuk Sini Harus 2', resp);
        if (resp.type === 'cancel') {
        } else {
          // console.log('Masuk Sini Harus 2');
          this.candidateService.setIndexStep(2);
          this.currentIndex.emit(2);
        }
      });
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  openVoiceRecog() {
    this.dialog
      .open(SpeechToTextDialogComponent, {
        width: '800px',
        minHeight: '300px',
        panelClass: 'candidate-note-record',
        disableClose: true,
        data: '',
      })
      .afterClosed()
      .subscribe((text) => {
        if (text) {
          this.detailForm.get('description').patchValue(text);
        }
      });
  }

  // 002 - Start Second Step Function
  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }
  openUploadWindow() {
    this.fileUploaderDoc.nativeElement.click();
  }

  uploadFile(fileInput: Event) {
    const file = (<HTMLInputElement>fileInput.target).files[0];
    // console.log(file);

    // *************** Accept Reject File Upload outside allowed accept
    const acceptable = ['pdf'];
    const fileType = this.utilService.getFileExtension(file.name);
    console.log(fileType);
    if (acceptable.includes(fileType)) {
      // this.file = (<HTMLInputElement>fileInput.target).files[0];
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          if (resp) {
            const data = {
              name: 'Capture - ' + (this.imageUploaded.length ? this.imageUploaded.length + 1 : '1'),
              s3_file_name: resp.s3_file_name,
            };
            this.imageUploaded.push(data);
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

  openImage(img) {
    const url = `${environment.apiUrl}/fileuploads/${img}`.replace('/graphql', '');
    window.open(url, '_blank');
  }
  resetImage() {
    this.imageUploaded = [];
  }
  addSpecialization() {
    if (this.specialization_input.value && this.specialization_input.value !== '') {
      this.skill.push(this.specialization_input.value);
      this.specialization_input.setValue('');
    }
  }

  remoteSpecialization(index: number) {
    this.skill.splice(index, 1);
  }
  submitStepTwo() {
    const imgArray = this.imageUploaded.map((list) => {
      return list.s3_file_name;
    });
    const skillArray = this.skill;
    this.detailForm.get('image').setValue(imgArray);
    this.detailForm.get('skill').setValue(skillArray);
    this.candidateService.setDataJobTwo(this.detailForm.value);
    this.candidateService.setIndexStep(2);
    this.candidateService.setStatusStepTwo(true);
    console.log('Payload Step Two', this.detailForm.value);
  }
  buttonValidate() {
    let disabled = true;
    if (
      this.detailForm.get('title').value &&
      this.detailForm.get('description').value &&
      this.detailForm.get('profile').value &&
      this.skill &&
      this.skill.length
    ) {
      disabled = false;
    }
    return disabled;
  }
  editIdentity() {
    this.candidateService.setStatusEditModeTwo(true);
  }
  identityUpdated() {
    const payloadIntern = {
      internship_creation_step: 'company',
    };
    if (
      (this.internshipData.internship_creation_step !== 'company' &&
        this.internshipData.internship_creation_step !== 'mentor' &&
        this.internshipData.internship_creation_step !== 'internship' &&
        this.internshipData.internship_creation_step !== 'conditions' &&
        this.internshipData.internship_creation_step !== 'pdf') ||
      !this.internshipData.internship_creation_step
    ) {
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
            this.candidateService.setStatusEditModeTwo(false);
            this.candidateService.setStatusStepTwo(true);
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
        title: 'Bravo!',
        confirmButtonText: 'OK',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then(() => {
        this.candidateService.setStatusEditModeTwo(false);
        this.candidateService.setStatusStepTwo(true);
      });
    }
  }

  continueButton() {
    Swal.fire({
      type: 'success',
      title: 'Bravo!',
      confirmButtonText: 'OK',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then(() => {
      this.candidateService.setStatusEditModeTwo(false);
      this.candidateService.setStatusStepTwo(true);
    });
  }
  checkIfUserCRM() {
    if (this.isUserHR || this.isUserStudent || this.isUserMember || this.isUserMentor) {
      return true;
    } else {
      return false;
    }
  }
  continueStep() {
    this.candidateService.setStatusStepOne(true);
  }
}
