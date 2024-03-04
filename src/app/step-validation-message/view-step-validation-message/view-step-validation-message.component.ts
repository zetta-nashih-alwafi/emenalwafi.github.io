import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioGroup } from '@angular/material/radio';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
// import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js'
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { PromoExternalService } from 'app/service/promo-external/promo-external.service';
import { SubSink } from 'subsink';
import { DOCUMENT } from '@angular/common';
import { UtilityService } from 'app/service/utility/utility.service';
import { ApplicationUrls } from 'app/shared/settings';
import * as _ from 'lodash';

@Component({
  selector: 'ms-view-step-validation-message',
  templateUrl: './view-step-validation-message.component.html',
  styleUrls: ['./view-step-validation-message.component.scss'],
})
export class ViewStepValidationDialogComponent implements OnInit, AfterViewInit {
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
    public dialogRef: MatDialogRef<ViewStepValidationDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fileUploadService: FileUploadService,
    private _ref: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private promoExternalService: PromoExternalService,
  ) {}

  ngOnInit() {
    this.translatePipe = new TranslatePipe(this.translate, this._ref);
    this.initStepValidationDialogForm();
    this.disableImage = true;
    this.disableVideo = false;
    if (this.data) {
      console.log(this.data);
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
      validation_step: this.data.validation_step,
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
    console.log('data', type, this.data);
    this.form.patchValue(type);
    console.log('data', type, this.data, this.form.value);
  }
}
