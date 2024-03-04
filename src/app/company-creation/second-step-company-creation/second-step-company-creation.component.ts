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
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
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

@Component({
  selector: 'ms-second-step-company-creation',
  templateUrl: './second-step-company-creation.component.html',
  styleUrls: ['./second-step-company-creation.component.scss'],
})
export class SecondStepCompanyCreationComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  @Input() candidateId = '';
  @Input() dataModify: any;
  detailForm: UntypedFormGroup;
  private subs = new SubSink();
  downloadCondition = true;
  agreeCondition = true;
  scrollDone = false;
  companyForm: UntypedFormGroup;

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
  companyImage = 'https://i.imgur.com/uCLo8Ek.jpg';
  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  imageUploaded = [];
  skill = [];
  specialization_input = new UntypedFormControl('');
  @Output() currentIndex = new EventEmitter<any>();
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
    public dialog: MatDialog,
    private transcriptBuilderService: TranscriptBuilderService,
  ) {}
  ngOnInit() {
    this.iniForm();
    this.subs.sink = this.candidateService.dataCompany.subscribe((val) => {
      if (val) {
        this.companyForm.patchValue(val);
      }
    });
  }

  iniForm() {
    this.companyForm = this.fb.group({
      company_name: ['', Validators.required],
      brand: ['', Validators.required],
      industry: ['', Validators.required],
      country: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
      logo: [''],
      background: [''],
      website: [''],
      linkedin: [''],
      facebook: [''],
      youtube: [''],
      twitter: [''],
    });
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
        console.log('Masuk Sini Harus 2', resp);
        if (resp.type === 'cancel') {
        } else {
          console.log('Masuk Sini Harus 2');
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
    console.log(file);

    // *************** Accept Reject File Upload outside allowed accept
    const acceptable = ['pdf'];
    const fileType = this.utilService.getFileExtension(file.name);
    console.log(fileType);
    if (acceptable.includes(fileType)) {
      // this.file = (<HTMLInputElement>fileInput.target).files[0];
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe((resp) => {
        if (resp) {
          const data = {
            name: 'Capture - ' + (this.imageUploaded.length ? this.imageUploaded.length + 1 : '1'),
            s3_file_name: resp.s3_file_name,
          };
          this.imageUploaded.push(data);
        }
      }, (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      });
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

  modifyData() {
    this.candidateService.setStatusEditMode(true);
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
}
