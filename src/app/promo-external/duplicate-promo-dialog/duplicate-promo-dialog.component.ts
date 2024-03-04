import {
  Component,
  OnInit,
  Inject,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef,
  AfterViewInit,
  ViewChild,
  OnChanges,
  AfterViewChecked,
} from '@angular/core';
import { MatOption } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { ApplicationUrls } from 'app/shared/settings';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilityService } from 'app/service/utility/utility.service';
import { PromoExternalService } from 'app/service/promo-external/promo-external.service';
import { DOCUMENT } from '@angular/common';
// import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { environment } from 'environments/environment';
import Swal from 'sweetalert2';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-duplicate-promo-dialog',
  templateUrl: './duplicate-promo-dialog.component.html',
  styleUrls: ['./duplicate-promo-dialog.component.scss'],
})
export class DuplicatePromoDialogComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  public Editor = DecoupledEditor;

  // @ViewChild(MatSlideToggle, { static: true }) toggleJob: MatSlideToggle;
  // @ViewChild(MatSlideToggle, { static: true }) toggleActivities: MatSlideToggle;
  // @ViewChild(MatSlideToggle, { static: true }) toggleIntegration: MatSlideToggle;
  // @ViewChild(MatSlideToggle, { static: true }) toggleInsertion: MatSlideToggle;
  @ViewChild(MatOption, { static: true }) allHobbies: MatOption;
  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;

  sessionSlider: any[] = ['https://www.lifetime.life/content/dam/ltp/images/locations/template/lt-location-hero-xl.jpg'];
  translatePipe: TranslatePipe;
  private subs = new SubSink();
  isPromoExternalImageUploading = false;
  public config = {
    placeholder: this.translate.instant('PROMO_POP_4.Title'),
  };
  public config1 = {
    placeholder: this.translate.instant('PROMO_POP_4.Sub-Title'),
  };
  public config2 = {
    placeholder: this.translate.instant('PROMO_POP_4.Story'),
  };
  modifyPromo: Boolean = false;
  form: UntypedFormGroup;
  identification: any = {};
  slideAttractions = false;
  schoolList = [];
  campusList = [];
  genderList = [
    { name: 'male', value: 'M' },
    { name: 'female', value: 'F' },
  ];
  regionList = [
    'Europe',
    'North Africa',
    'SubSaharian Africa',
    'Asia',
    'North America',
    'South America',
    'Middle East',
    'Indian Sub Continent',
  ];
  hobbiesList = ['Photograph', 'Painting', 'Cinema', 'Dancing', 'Singing'];
  moduleList = ['001_Admission', '002_Login', '003_Inscription', '004_Job_Offer', '005_Internship', '006_Alumni'];
  hobbiesSelected = [];
  defaultImageUrl = '../../../../../assets/img/login-slider1.jpg';
  defaultVideoUrl = 'https://www.youtube.com/watch?v=TyTjGZkhNQE';
  // slide = {
  //   title: '',
  //   sub_title: '',
  //   story: '',
  //   image_upload: '',
  //   video_link: '',
  // };
  pagination: {
    limit: 0;
    page: 0;
  };
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  myInnerHeight = 600;
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000,
    dots: false,
    arrows: false,
  };
  disableVideo = true;
  disableImage = false;
  videoSelected = false;
  imageSelected = true;

  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 103;
    return this.myInnerHeight;
  }
  constructor(
    public dialogRef: MatDialogRef<DuplicatePromoDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(DOCUMENT) private document: any,
    private fileUploadService: FileUploadService,
    private _ref: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private promoExternalService: PromoExternalService,
    private utilService: UtilityService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.translatePipe = new TranslatePipe(this.translate, this._ref);
    this.initPromoExternalForm();
    this.initSchoolAndCampusList();
    if (this.data) {
      this.modifyPromo = true;
      this.getForm();
    }
  }
  ngAfterViewChecked() {
    this._ref.detectChanges();
  }
  ngAfterViewInit() {
    this.subs.sink = this.form.controls.school.valueChanges.subscribe((value) => {
      this.identification.school = value;
      const selectedSchool = this.schoolList.filter((school) => school.short_name === value);
      this.campusList = selectedSchool[0].campuses;
    });
    this.subs.sink = this.form.controls.campus.valueChanges.subscribe((value) => {
      this.identification.campus = value;
    });
    this.subs.sink = this.form.controls.gender.valueChanges.subscribe((value) => {
      this.identification.gender = value;
    });
    this.subs.sink = this.form.controls.hobbies.valueChanges.subscribe((value) => {
      this.identification.hobbies = value.join(',');
    });
    this.subs.sink = this.form.controls.region.valueChanges.subscribe((value) => {
      this.identification.region = value;
    });
  }
  initPromoExternalForm() {
    this.form = this.fb.group({
      ref_id: [null, Validators.required],
      title: [null, Validators.required],
      sub_title: [null, Validators.required],
      story: [null, Validators.required],
      module: [null, Validators.required],
      school: ['all', Validators.required],
      campus: ['all', Validators.required],
      gender: ['M', Validators.required],
      hobbies: [[], Validators.required],
      region: ['all', Validators.required],
      job: [false, Validators.required],
      activity: [false, Validators.required],
      integration: [false, Validators.required],
      insertion: [false, Validators.required],
      image_upload: [''],
      video_link: [''],
    });
  }
  getForm() {
    // console.log('promo data:: ', this.data);
    const datas = _.cloneDeep(this.data);
    datas.module = datas.module && datas.module.length ? datas.module[0] : null;
    const payload = _.cloneDeep(datas);
    this.modifyPromo = true;
    if (payload.ref_id) {
      payload.ref_id = parseInt(payload.ref_id) + 1;
      payload.ref_id = payload.ref_id.toString();
      if (payload.ref_id.length < 3) {
        if (payload.ref_id.length === 2) {
          payload.ref_id = '0' + payload.ref_id;
        }
        if (payload.ref_id.length === 1) {
          payload.ref_id = '00' + payload.ref_id;
        }
      }
    }
    this.form.patchValue(payload);
  }

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }
  initSchoolAndCampusList() {
    this.promoExternalService.getAllCandidateSchool(this.pagination).subscribe((schools) => {
      if (schools.length) {
        this.schoolList = schools;
        if (this.data && this.data.school) {
          const selectedSchool = this.schoolList.filter((school) => school.short_name === this.data.school);
          if (selectedSchool && selectedSchool.length) {
            this.campusList = selectedSchool[0].campuses;
          }
        } else {
          this.schoolList.forEach((element) => {
            element.campuses.forEach((campuses, nex) => {
              this.campusList.push(campuses);
            });
          });
          this.campusList = _.uniqBy(this.campusList, 'name');
        }
      }
    }, (err) => {
      this.authService.postErrorLog(err);
    });
  }
  radioChangeHandler(value) {
    if (value === 'video') {
      this.imageSelected = false;
      this.videoSelected = true;
      this.disableImage = true;
      this.disableVideo = false;
      this.form.controls.image_upload.setValue('');
    } else {
      this.imageSelected = true;
      this.videoSelected = false;
      this.disableVideo = true;
      this.disableImage = false;
      this.form.controls.video_link.setValue('');
    }
  }
  chooseFile() {
    const fileUpload = document.createElement('input');
    fileUpload.type = 'file';
    fileUpload.accept = 'image/png,image/jpeg,image/gif';
    fileUpload.onchange = () => {
      const file = fileUpload.files[0];
      this.isPromoExternalImageUploading = true;
      if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/gif')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.form.patchValue({
            image_upload: reader.result,
          });
        };
        reader.readAsDataURL(file);
      }
      this.fileUploadService.singleUpload(file).subscribe((res) => {
        this.isPromoExternalImageUploading = false;
        const url = `${environment.apiUrl}/fileuploads/${res.s3_file_name}`.replace('/graphql', '');
        this.form.controls.image_upload.setValue(res.s3_file_name);
      }, (err) => {
        this.authService.postErrorLog(err);
      });
    };
    fileUpload.click();
  }
  savePromo() {
    if (!this.form.valid) {
      Swal.fire({
        type: 'info',
        allowEscapeKey: true,
        showCancelButton: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        text: this.translate.instant('PROMO_POP_4.Could not save Promo external. Please make sure all inputs are valid.'),
      });
    } else {
      const data = this.form.value;
      if (data.school === 'all') {
        data.school = '';
      }
      if (data.campus === 'all') {
        data.campus = '';
      }
      data.module = [data.module];
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('PROMO_POP_4.You are about to save only'),
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: this.translate.instant('PROMO_POP_4.Save Only'),
        cancelButtonText: this.translate.instant('PROMO_POP_4.Cancel'),
        text: this.translate.instant('PROMO_POP_4.This means the promo will not be visible to candidate until you publish it'),
      }).then((result) => {
        if (result.value) {
          const payload = { ...data, levels: null, program: false, generic: false, is_published: false };
          delete payload._id;
          // create promo external
          this.promoExternalService.createPromoExternal(payload).subscribe((createdPromo) => {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              allowEscapeKey: true,
              showCancelButton: false,
              text: this.translate.instant('PROMO_POP_4.Promo is saved successfully'),
              showConfirmButton: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('Thank You'),
              onClose: () => {
                this.dialogRef.close(createdPromo);
              },
            });
          }, (err) => {
            this.authService.postErrorLog(err);
          });
        }
      });
    }
  }
  saveAndPublishPromo() {
    if (!this.form.valid) {
      Swal.fire({
        type: 'info',
        allowEscapeKey: true,
        showCancelButton: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        text: this.translate.instant('PROMO_POP_4.Could not save and publish Promo external. Please make sure all inputs are valid.'),
      });
    } else {
      const data = this.form.value;
      if (data.school === 'all') {
        data.school = '';
      }
      if (data.campus === 'all') {
        data.campus = '';
      }
      data.module = [data.module];
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('PROMO_POP_4.You are about to save and publish'),
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: this.translate.instant('PROMO_POP_4.Save & Publish'),
        cancelButtonText: this.translate.instant('PROMO_POP_4.Cancel'),
        text: this.translate.instant('PROMO_POP_4.This means the promo will be visible to candidate directly'),
      }).then((result) => {
        // console.log(result.value);
        if (result.value) {
          const payload = { ...data, levels: null, program: false, generic: false, is_published: true };
          // console.log('payload = ', payload);
          delete payload._id;
          // save and publish
          this.promoExternalService.createPromoExternal(payload).subscribe((createdPromo) => {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              allowEscapeKey: true,
              showCancelButton: false,
              text: this.translate.instant('Promo is saved and published successfully'),
              showConfirmButton: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('Thank You'),
              onClose: () => {
                this.dialogRef.close(createdPromo);
              },
            });
          }, (err) => {
            this.authService.postErrorLog(err);
          });
        }
      });
    }
  }
  sanitizeVideoUrl(url: string) {
    if (url) {
      url = url.includes('watch?v=') ? url.replace('watch?v=', 'embed/') : url;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return false;
  }
  isVideoLinkValid(): boolean {
    const videoLink = this.form.get('video_link').value;
    return videoLink ? this.utilService.isValidURL(videoLink) : true;
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
