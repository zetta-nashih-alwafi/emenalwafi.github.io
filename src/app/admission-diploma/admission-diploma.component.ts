import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AdmissionService } from 'app/service/admission/admission.service';
import { ApplicationUrls } from 'app/shared/settings';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';

@Component({
  selector: 'ms-admission-diploma',
  templateUrl: './admission-diploma.component.html',
  styleUrls: ['./admission-diploma.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
    ParseStringDatePipe,
  ],
})
export class AdmissionDiplomaComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  // Slider Setup
  sessionSlider: any[] = [];
  showSessionSlider = false;
  slideConfig = { slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 3000, dots: false, arrows: false };

  // Data Setup
  candidateData: any;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  today = new Date();

  // Page setup
  identityEditMode = false;
  myInnerHeight = 600;
  selectedIndex = 0;
  firstStepDone = false;
  secondStepDone = false;
  thirdStepDone = false;
  fourthStepDone = false;
  fifthStepDone = false;
  diplomaStepDone = false;
  isLinear = true;
  dataLoaded = false;
  candidateId: any;
  dataModify: any;
  detailDataCandidate: any;
  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  paymentImg = '../../../../../assets/img/payment.png';
  transferPayment = '../../../../../assets/img/transfer-payment.png';
  successPayment = '../../../../../assets/img/payment-success.png';
  photo: string;
  photo_s3_path: string;
  is_photo_in_s3: boolean;

  // form
  diplomaFormGroup: UntypedFormGroup;

  logoSchool: any;

  // Service
  constructor(
    private admissionService: AdmissionService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((resp: any) => {
      if (resp && resp.params) {
        if (resp.params.formId) {
          this.candidateId = resp.params.formId;
            this.selectedIndex = 0;
            this.initStepper();
            this.getOneCandidate();
            this.getStatusChanges();
        } else {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('REGISTER_SX.TITLE'),
            text: this.translate.instant('REGISTER_SX.TEXT'),
            confirmButtonText: this.translate.instant('REGISTER_SX.CONFIRMBTN'),
            allowOutsideClick: false,
          }).then(() => {
            window.open(`./session/login`, '_self');
          });
        }
      }
    });
  }

  selectionChange(event) {
    this.selectedIndex = 0;
    this.admissionService.setStatusEditCampusMode(false);
    this.admissionService.setStatusEditMode(false);
    this.admissionService.setStatusEditModeTwo(false);
    this.admissionService.setStatusEditModeThree(false);
    this.admissionService.setStatusEditModeFour(false);
  }

  getStatusChanges() {
    this.subs.sink = this.admissionService.dataCandidate.subscribe((val: any) => {
      if (val) {
        this.candidateData = val;
      }
    });

    this.subs.sink = this.admissionService.statusStepCampus.subscribe((val: boolean) => {
      if (val) {
        this.diplomaStepDone = val;
        this.diplomaFormGroup.get('diplomaCtrl').setValue('Test');
      }
    });
  }

  getOneCandidate() {
    this.subs.sink = this.admissionService.getCandidateAdmissionDiploma(this.candidateId).subscribe(
      (resp) => {
        if (resp) {
          const res = _.cloneDeep(resp);
          this.candidateData = resp;
          if (res && res.school && res.school.school_logo) {
            this.logoSchool = res.school.school_logo;
          }
          if (res && res.photo) {
            this.photo = res.photo;
            this.is_photo_in_s3 = true;
          }
          this.dataModify = res;
          if (!this.dataLoaded) {
            this.dataLoaded = true;
            // this.getPromotionData();
          }
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
  }

  // initForm
  initStepper() {
    this.diplomaFormGroup = this.fb.group({
      diplomaCtrl: ['', Validators.required],
    });
  }

  // get height of page based on resolution screen
  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 103;
    return this.myInnerHeight;
  }

  // get data promotion for slider
  getPromotionData() {
    if (this.candidateData) {
      const school = this.candidateData.school ? this.candidateData.school.short_name : '';
      const campus = this.candidateData.campus ? this.candidateData.campus.name : '';
      const level = this.candidateData.level ? this.candidateData.level.name : '';
      const region = this.candidateData.region ? this.candidateData.region : '';
      const sex = this.candidateData.sex ? this.candidateData.sex : 'N';
      this.subs.sink = this.admissionService.getPromoForRegistration(school, campus, level, region, sex).subscribe(
        (promos) => {
          if (promos) {
            this.sessionSlider = promos;
            this.showSessionSlider = true;
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
    }
  }

  moveToTab(tab) {
    if (tab) {
      switch (tab) {
        case 'program_confirmed':
          setTimeout(() => {
            this.selectedIndex = 0;
          }, 300);
          break;
        default:
          this.selectedIndex = 0;
      }
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
