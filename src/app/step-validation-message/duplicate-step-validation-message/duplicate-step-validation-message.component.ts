import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioGroup } from '@angular/material/radio';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'environments/environment';
// import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import Swal from 'sweetalert2';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { PromoExternalService } from 'app/service/promo-external/promo-external.service';
import { SubSink } from 'subsink';
import { StepValidationMessageService } from 'app/service/step-validation-message/step-validation-message.service';
import { ApplicationUrls } from 'app/shared/settings';
import * as _ from 'lodash';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-duplicate-step-validation-message',
  templateUrl: './duplicate-step-validation-message.component.html',
  styleUrls: ['./duplicate-step-validation-message.component.scss'],
})
export class DuplicateStepValidationMessageDialogComponent implements OnInit, AfterViewInit {
  mediaType = new UntypedFormControl('video');
  public Editor = DecoupledEditor;
  translatePipe: TranslatePipe;
  private subs = new SubSink();
  public config = {
    placeholder: this.translate.instant('REG_STEP_VAL.Title 1'),
  };
  public config1 = {
    placeholder: this.translate.instant('REG_STEP_VAL.Title 2'),
  };
  @ViewChild('mediaOption', { static: false }) mediaOption: MatRadioGroup;
  disableVideo: Boolean = true;
  disableImage: Boolean = true;
  modifyAdmissionDialog: Boolean = false;
  viewStepValidationStep: Boolean = false;
  isValidationStepImageUploading;
  myInnerHeight = 600;
  image_upload = null;
  video_link = '';
  form: UntypedFormGroup;
  media: String = 'video';
  defaultImageUrl = '../../../../../assets/img/gene-login.jpg';
  defaultVideoUrl = 'https://www.youtube.com/watch?v=TyTjGZkhNQE';
  schoolList = [];
  campusList = [];
  validationSteps = [1, 2, 3];
  defaultValidationStep = 'none';
  defaultSchool = 'none';
  defaultCampus = 'none';
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  popUp = {
    ref: '',
    step: '',
    first_title: this.translate.instant('REG_STEP_VAL.Title 1'),
    second_title: this.translate.instant('REG_STEP_VAL.Title 2'),
    first_button: this.translate.instant('REG_STEP_VAL.Return'),
    second_button: this.translate.instant('REG_STEP_VAL.Move to step'),
  };
  pagination: {
    limit: 0;
    page: 0;
  };
  dialogTitle = '';
  action = 'create';
  constructor(
    public dialogRef: MatDialogRef<DuplicateStepValidationMessageDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fileUploadService: FileUploadService,
    private _ref: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private promoExternalService: PromoExternalService,
    private stepValidationMessageService: StepValidationMessageService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.translatePipe = new TranslatePipe(this.translate, this._ref);
    this.initStepValidationDialogForm();
    this.initSchoolAndCampusList();
    this.disableImage = true;
    this.disableVideo = false;
    if (this.data) {
      // console.log(this.data);
      this.action = this.data.action;
      this.defaultValidationStep = this.data.validation_step;
      this.defaultSchool = this.data.school;
      this.popUp = Object.assign(this.popUp, this.data);
      if (this.data.image_upload) {
        this.image_upload = this.serverimgPath + this.data.image_upload;
        this.disableImage = false;
        this.disableVideo = true;
      }
      if (this.data.video_link) {
        this.video_link = this.data.video_link;
        this.disableImage = true;
        this.disableVideo = false;
      }

      this.getForm();
      if (this.action === 'duplicate') {
        this.modifyAdmissionDialog = true;
      }
    }
  }

  ngAfterViewInit() {
    this.subs.sink = this.form.controls.school.valueChanges.subscribe((value) => {
      const selectedSchool = this.schoolList.filter((school) => school.short_name === value);
      if (selectedSchool && selectedSchool[0]) {
        this.campusList = selectedSchool[0].campuses;
      } else {
        this.campusList = [];
      }
    });

    this.subs.sink = this.form.controls.image_upload.valueChanges.subscribe((value) => {});
    this.subs.sink = this.form.controls.video_link.valueChanges.subscribe((value) => {
      this.video_link = value;
    });
    this.subs.sink = this.form.controls.first_title.valueChanges.subscribe((value) => {
      this.popUp.first_title = value;
    });
    this.subs.sink = this.form.controls.second_title.valueChanges.subscribe((value) => {
      this.popUp.second_title = value;
    });
    this.subs.sink = this.form.controls.first_button.valueChanges.subscribe((value) => {
      this.popUp.first_button = value;
    });
    this.subs.sink = this.form.controls.second_button.valueChanges.subscribe((value) => {
      this.popUp.second_button = value;
    });
    if (this.data) {
      if (this.data.image_upload) {
        this.mediaOption.value = 'image';
      } else {
        this.mediaOption.value = 'video';
      }
    }
  }
  radioChangeHandler(value) {
    if (value === 'video') {
      this.disableImage = true;
      this.disableVideo = false;
      this.form.controls.image_upload.setValue('');
    } else {
      this.disableVideo = true;
      this.disableImage = false;
      this.form.controls.video_link.setValue('');
    }
  }

  initStepValidationDialogForm() {
    this.form = this.fb.group({
      validation_step: [null, Validators.required],
      school: [null, Validators.required],
      campus: [null, Validators.required],
      first_title: [this.translate.instant('REG_STEP_VAL.Title 1'), Validators.required],
      second_title: [this.translate.instant('REG_STEP_VAL.Title 2'), Validators.required],
      first_button: [this.translate.instant('REG_STEP_VAL.Return')],
      second_button: [this.translate.instant('REG_STEP_VAL.Move to step')],
      image_upload: [null],
      video_link: [null],
      is_published: [null],
    });
  }
  initSchoolAndCampusList() {
    this.stepValidationMessageService.getAllCandidateSchool(this.pagination).subscribe((schools) => {
      if (schools.length) {
        this.schoolList = schools;
        if (this.data) {
          const selectedSchool = this.schoolList.filter((school) => school.short_name === this.data.school);
          if (selectedSchool.length) {
            this.campusList = selectedSchool[0].campuses;
            this.defaultSchool = this.data.school;
            if (this.campusList) {
              if (this.campusList.includes(this.data.campus)) {
                this.defaultCampus = this.data.campus;
              }
            }
          } else {
            this.defaultSchool = 'none';
          }
        }
      }
    }, (err) => {
      this.authService.postErrorLog(err);
    });
  }

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }
  chooseFile() {
    const fileUpload = document.createElement('input');
    fileUpload.type = 'file';
    fileUpload.accept = 'image/png,image/jpeg,image/gif';
    fileUpload.onchange = () => {
      const file = fileUpload.files[0];
      this.isValidationStepImageUploading = true;
      if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/gif')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.image_upload = reader.result;
        };
        reader.readAsDataURL(file);
      }
      this.fileUploadService.singleUpload(file).subscribe((res) => {
        this.isValidationStepImageUploading = false;
        const url = `${environment.apiUrl}/fileuploads/${res.s3_file_name}`.replace('/graphql', '');
        this.image_upload = url;
        this.form.controls.image_upload.setValue(res.s3_file_name);
      });
    };
    fileUpload.click();
  }
  saveValidationStep() {
    if (
      !this.form.valid ||
      this.form.controls.school.value === 'none' ||
      this.form.controls.campus.value === 'none' ||
      this.form.controls.validation_step.value === 'none'
    ) {
      Swal.fire({
        type: 'info',
        allowEscapeKey: true,
        showCancelButton: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        text: this.translate.instant('REG_STEP_VAL.Could not save Step validation message. Please make sure all inputs are valid.'),
      });
    } else {
      const data = this.form.value;
      // delete this items from now as they are not defined in the database
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('REG_STEP_VAL.You are about to save only'),
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: this.translate.instant('REG_STEP_VAL.Save Only'),
        cancelButtonText: this.translate.instant('REG_STEP_VAL.Cancel'),
        text: this.translate.instant(
          'REG_STEP_VAL.This means the registration step message will not be visible to candidate until you publish it',
        ),
      }).then((result) => {
        if (result.value) {
          data.gender = null;
          data.is_published = false;
          this.subs.sink = this.stepValidationMessageService.createStepValidationMessage(data).subscribe((list) => {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              allowEscapeKey: true,
              showCancelButton: false,
              text: this.translate.instant('REG_STEP_VAL.The registration step message is saved successfully'),
              showConfirmButton: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('REG_STEP_VAL.Thank You'),
              onClose: () => {
                this.dialogRef.close(list);
              },
            });
          }, (err) => {
            this.authService.postErrorLog(err); 
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          });
        }
      });
    }
  }
  saveAndPublishValidationStep() {
    if (
      !this.form.valid ||
      this.form.controls.school.value === 'none' ||
      this.form.controls.campus.value === 'none' ||
      this.form.controls.validation_step.value === 'none'
    ) {
      Swal.fire({
        type: 'info',
        allowEscapeKey: true,
        showCancelButton: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        text: this.translate.instant(
          'REG_STEP_VAL.Could not save and publish Step validation messsage. Please make sure all inputs are valid',
        ),
      });
    } else {
      const data = this.form.value;
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('REG_STEP_VAL.You are about to save and publish'),
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: this.translate.instant('PROMO_POP_4.Save & Publish'),
        cancelButtonText: this.translate.instant('REG_STEP_VAL.Cancel'),
        text: this.translate.instant('REG_STEP_VAL.This means the registration step message will be visible to candidate directly'),
      }).then((result) => {
        if (result.value) {
          this.submitStep(data);
        }
      });
    }
  }

  submitStep(data) {
    const payload = _.cloneDeep(data);
    payload.is_published = true;
    payload.gender = 'F';
    this.stepValidationMessageService.createStepValidationMessage(payload).subscribe((createdMessage) => {
      Swal.fire({
        type: 'success',
        title: this.translate.instant('Bravo!'),
        allowEscapeKey: true,
        showCancelButton: false,
        text: this.translate.instant('REG_STEP_VAL.Registration step message is saved and published successfully'),
        showConfirmButton: true,
        allowOutsideClick: false,
        confirmButtonText: this.translate.instant('REG_STEP_VAL.Thank You'),
        onClose: () => {
          this.dialogRef.close(createdMessage);
        },
      });
    }, (err) => {
      this.authService.postErrorLog(err);
    });
  }

  sanitizeVideoUrl(url) {
    url = url.includes('watch?v=') ? url.replace('watch?v=', 'embed/') : url;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : false;
  }
  sanitizeImageUrl(url) {
    // const urls = `${environment.apiUrl}/fileuploads/${url}`.replace('/graphql', '');
    return url ? this.sanitizer.bypassSecurityTrustUrl(url) : false;
  }
  getForm() {
    const type = {
      validation_step: this.data.validation_step !== 3 ? this.data.validation_step + 1 : 3,
      school: this.data.school,
      campus: this.data.campus,
      first_title: this.data.first_title,
      second_title: this.data.second_title,
      first_button: this.data.first_button ? this.data.first_button : this.translate.instant('REG_STEP_VAL.Return'),
      second_button: this.data.second_button ? this.data.second_button : this.translate.instant('REG_STEP_VAL.Move to step'),
      image_upload: this.data.image_upload,
      video_link: this.data.video_link,
      is_published: this.data.is_published,
    };
    // console.log('data', type, this.data);
    this.form.patchValue(type);
    // console.log('data', type, this.data, this.form.value);
  }
}
