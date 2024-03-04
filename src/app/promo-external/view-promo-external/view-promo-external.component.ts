import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
  selector: 'ms-view-promo-external',
  templateUrl: './view-promo-external.component.html',
  styleUrls: ['./view-promo-external.component.scss'],
})
export class ViewPromoExternalDialogComponent implements OnInit, AfterViewInit {
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

  constructor(
    public dialogRef: MatDialogRef<ViewPromoExternalDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(DOCUMENT) private document: any,
    private fileUploadService: FileUploadService,
    private _ref: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private promoExternalService: PromoExternalService,
    private utilService: UtilityService,
  ) {}

  ngOnInit() {
    this.translatePipe = new TranslatePipe(this.translate, this._ref);
    this.initPromoExternalForm();
    if (this.data) {
      this.modifyPromo = true;
      this.getForm();
    }
  }
  ngAfterViewInit() {
    this._ref.detectChanges();
  }
  initPromoExternalForm() {
    this.form = this.fb.group({
      ref_id: [null, Validators.required],
      title: [null, Validators.required],
      sub_title: [null, Validators.required],
      story: [null, Validators.required],
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
    console.log('promo data:: ', this.data);
    this.form.patchValue(this.data);
    if (this.form.get('video_link').value) {
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
}
