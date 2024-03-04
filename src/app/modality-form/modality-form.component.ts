import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AdmissionService } from 'app/service/admission/admission.service';
import { ApplicationUrls } from 'app/shared/settings';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { CountryService } from 'app/shared/services/country.service';
import { UtilityService } from 'app/service/utility/utility.service';

@Component({
  selector: 'ms-modality-form',
  templateUrl: './modality-form.component.html',
  styleUrls: ['./modality-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
    ParseStringDatePipe,
  ],
})
export class ModalityFormComponent implements OnInit, OnDestroy {
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
  isLinear = true;
  dataLoaded = false;
  candidateId: any;
  dataModify: any;
  photo: string;
  photo_s3_path: string;
  is_photo_in_s3: boolean;

  // form
  firstFormGroup: UntypedFormGroup;

  logoSchool: any;

  // *************** START OF property to store data of country dial code
  countryCodeList: any[] = [];
  // *************** END OF property to store data of country dial code

  // Service
  constructor(
    private admissionService: AdmissionService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private countryService: CountryService,
    private utilService: UtilityService
  ) {}

  ngOnInit() {
    const candidateIds = this.route.snapshot.queryParamMap.get('candidate');
    if (candidateIds) {
      this.candidateId = candidateIds;
      this.selectedIndex = 0;
      this.getAllCountryCodes();
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

    this.subs.sink = this.translate.onLangChange.subscribe(() => {
      this.sortCountryCode();
    })
  }

  sortCountryCode() {
    this.countryCodeList = this.countryCodeList.sort((firstData, secondData) => {
      if (this.utilService.simplifyRegex(this.translate.instant(firstData?.name)) < this.utilService.simplifyRegex(this.translate.instant(secondData?.name))) {
        return -1;
      } else if (this.utilService.simplifyRegex(this.translate.instant(firstData?.name)) > this.utilService.simplifyRegex(this.translate.instant(secondData?.name))) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  getAllCountryCodes() {
    this.countryCodeList = this.countryService?.getAllCountriesNationality();
  }

  selectionChange(event) {
    this.admissionService.setStatusEditMode(false);
  }

  getStatusChanges() {
    this.subs.sink = this.admissionService.dataCandidate.subscribe((val: any) => {
      if (val) {
        this.candidateData = val;
      }
    });
    this.subs.sink = this.admissionService.statusStepOne.subscribe((val: boolean) => {
      if (val) {
        this.firstStepDone = val;
        this.firstFormGroup.get('firstCtrl').setValue('Test');
      }
    });
  }

  getOneCandidate() {
    this.subs.sink = this.admissionService.getCandidateAdmission(this.candidateId).subscribe(
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
          if (!resp.announcement_email || (resp.announcement_email && !resp.announcement_email.sent_date)) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('TRANSFER_S6.Title'),
              text: this.translate.instant('TRANSFER_S6.Text'),
              confirmButtonText: this.translate.instant('TRANSFER_S6.Button'),
              allowOutsideClick: false,
            }).then(() => {
              window.open(`./session/login`, '_self');
            });
          } else {
            const status_candidate = ['engaged', 'registered'];
            if (
              !res.registration_profile ||
              res.announcement_call === 'not_done' ||
              !status_candidate.includes(resp?.candidate_admission_status)
            ) {
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
          if (!this.dataLoaded) {
            this.dataLoaded = true;
            // if (res && res.personal_information === 'done' && res.finance && res.program_confirmed === 'done') {
            //   this.firstFormGroup.get('firstCtrl').setValue(res.personal_information);
            //   this.firstStepDone = true;
            //   this.selectedIndex = 0;
            //   this.admissionService.setIndexStep(this.selectedIndex);
            // }
            if (res.candidate_admission_status === 'engaged' || res.candidate_admission_status === 'registered') {
              this.isLinear = false;
            }
            console.log('Candidate Data', this.candidateData, this.dataModify);
            this.getPromotionData();
          }
        }
      },
      (err) => {
        Swal.fire({
          type: 'error',
          title: 'Error',
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  createPayload(payload) {
    if (payload && payload._id) {
      delete payload._id;
    }
    if (payload && payload.campus) {
      payload.campus = payload.campus._id;
    }
    if (payload && payload.intake_channel) {
      payload.intake_channel = payload.intake_channel._id;
    }
    if (payload && payload.scholar_season) {
      payload.scholar_season = payload.scholar_season._id;
    }
    if (payload && payload.level) {
      payload.level = payload.level._id;
    }
    if (payload && payload.school) {
      payload.school = payload.school._id;
    }
    if (payload && payload.sector) {
      payload.sector = payload.sector._id;
    }
    if (payload && payload.speciality) {
      payload.speciality = payload.speciality._id;
    }
    if (payload && payload.registration_profile) {
      payload.registration_profile = payload.registration_profile._id;
    }
    if (payload && payload.admission_member_id) {
      payload.admission_member_id = payload.admission_member_id._id;
    }
    return payload;
  }

  // initForm
  initStepper() {
    this.firstFormGroup = this.fb.group({
      firstCtrl: ['', Validators.required],
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
          if (promos && promos.length) {
            this.sessionSlider = promos;
            this.showSessionSlider = true;
          }
        },
        (err) => {
          Swal.fire({
            type: 'error',
            title: 'Error',
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
  }

  // generate level format
  getLevelSchool(data) {
    let message = '';
    if (data) {
      if (parseInt(data)) {
        if (data === '1') {
          message = data + '' + this.translate.instant('st') + ' ' + this.translate.instant('years');
        } else if (data === '2') {
          message = data + '' + this.translate.instant('nd') + ' ' + this.translate.instant('years');
        } else if (data === '3') {
          message = data + '' + this.translate.instant('rd') + ' ' + this.translate.instant('years');
        } else {
          message = data + '' + this.translate.instant('th') + ' ' + this.translate.instant('years');
        }
      } else {
        message = data;
      }
    }
    return message;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
