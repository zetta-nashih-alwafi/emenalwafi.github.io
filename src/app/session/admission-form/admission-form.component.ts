import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
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
  selector: 'ms-admission-form',
  templateUrl: './admission-form.component.html',
  styleUrls: ['./admission-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
    ParseStringDatePipe,
  ],
})
export class AdmissionFormComponent implements OnInit, OnDestroy {
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
  campusStepDone = false;
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
  firstFormGroup: UntypedFormGroup;
  secondFormGroup: UntypedFormGroup;
  thirdFormGroup: UntypedFormGroup;
  fourthFormGroup: UntypedFormGroup;
  fifthFormGroup: UntypedFormGroup;
  campusFormGroup: UntypedFormGroup;

  logoSchool: any;

  // *************** START OF property to store data of country dial code
  countryCodeList: any[] = [];
  // *************** END OF property to store data of country dial code

  isFormClosed: boolean = true;

  // Service
  constructor(
    private admissionService: AdmissionService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private countryService: CountryService,
    private utilService: UtilityService,
    private router: Router
  ) {}

  ngOnInit() {
    const candidateIds = this.route.snapshot.queryParamMap.get('candidate');
    if (candidateIds) {
      this.getAllCountryCodes();
      this.candidateId = candidateIds;
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
    this.selectedIndex = event.selectedIndex;
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
        this.campusStepDone = val;
        this.campusFormGroup.get('campusCtrl').setValue('Test');
      }
    });

    this.subs.sink = this.admissionService.statusStepOne.subscribe((val: boolean) => {
      if (val) {
        this.firstStepDone = val;
        this.firstFormGroup.get('firstCtrl').setValue('Test');
      }
    });

    this.subs.sink = this.admissionService.statusStepTwo.subscribe((val: boolean) => {
      if (val) {
        this.secondStepDone = val;
        this.secondFormGroup.get('secondCtrl').setValue('Test');
      } else {
        this.secondStepDone = false;
        this.secondFormGroup.get('secondCtrl').setValue(null);
      }
    });

    this.subs.sink = this.admissionService.statusStepThree.subscribe((val: boolean) => {
      if (val) {
        this.thirdStepDone = val;
        this.thirdFormGroup.get('thirdCtrl').setValue('registered');
      }
    });

    this.subs.sink = this.admissionService.statusStepFour.subscribe((val: boolean) => {
      if (val) {
        this.fourthStepDone = val;
        this.fourthFormGroup.get('fourthCtrl').setValue('registered');
      }
    });

    this.subs.sink = this.admissionService.statusStepFive.subscribe((val: boolean) => {
      if (val) {
        this.fifthStepDone = val;
        this.fifthFormGroup.get('fifthCtrl').setValue('registered');
      }
    });

    this.subs.sink = this.admissionService.statusEditMode.subscribe((val: boolean) => {
      this.identityEditMode = val;
    });

    this.subs.sink = this.admissionService.indexStep.subscribe((val) => {
      this.selectedIndex = val;
    });
  }

  displaySwalFormClosed() {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('FORM_S6.TITLE'),
      html: this.translate.instant('FORM_S6.HTML'),
      confirmButtonText: this.translate.instant('FORM_S6.BUTTON'),
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(() => {   
      window.close();
    });
  }

  getOneCandidate() {
    this.subs.sink = this.admissionService.getCandidateAdmission(this.candidateId).subscribe(
      (resp) => {
        if (resp) {
          if (!resp?.registration_profile && !resp?.admission_process_id?._id) {
            this.isFormClosed = true;
            this.displaySwalFormClosed();
            return;
          } else if(resp?.admission_process_id?._id) {
            this.isFormClosed = false;
            const params = {
              formId: resp.admission_process_id._id,
              formType: 'student_admission',
              userId: resp?._id ? resp._id : '',
              userTypeId: resp?.student_id?.user_id?.entities?.[0]?.type?._id ? resp.student_id.user_id.entities[0].type._id : '',
            };
            const url = this.router.createUrlTree(['/form-fill'], { queryParams: params });
            window.open(url.toString(), '_self');
            return;
          } else {
            this.isFormClosed = false;
          }

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
            if (!res.registration_profile || res.announcement_call === 'not_done') {
              window.open(`./session/login`, '_self');
            }
            if (!res.connection || res.connection === 'not_done') {
              this.connectingRegistration('');
            }
          }
          if (!this.dataLoaded) {
            this.dataLoaded = true;
            if (res && res.program_confirmed === 'done') {
              this.campusFormGroup.get('campusCtrl').setValue(res.program_confirmed);
              this.campusStepDone = true;
              this.selectedIndex = 1;
              this.admissionService.setIndexStep(this.selectedIndex);
            }
            if (res && (res.personal_information === 'done' || res.personal_information === 'legal_representative') && res.program_confirmed === 'done') {
              this.firstFormGroup.get('firstCtrl').setValue(res.personal_information);
              this.firstStepDone = true;
              // fix tab not moving to the selected index
              this.selectedIndex = 0;
              const timeout = setTimeout(() => {
                clearTimeout(timeout);
                this.selectedIndex = 2;
              }, 1000);
              this.admissionService.setIndexStep(this.selectedIndex);
            }
            if (res && (res.personal_information === 'done' || res.personal_information === 'legal_representative') && res.finance && res.program_confirmed === 'done') {
              this.secondFormGroup.get('secondCtrl').setValue(res.signature);
              this.secondStepDone = true;

              //********** fix tab not moving to the selected index need delay for call step properly
              this.selectedIndex = 0;
              const timeout = setTimeout(() => {
                clearTimeout(timeout);
                this.selectedIndex = 3;
              }, 1000);
              this.admissionService.setIndexStep(this.selectedIndex);
            }
            if (res && (res.personal_information === 'done' || res.personal_information === 'legal_representative') && res.finance && res.is_admitted && res.program_confirmed === 'done') {
              this.secondFormGroup.get('secondCtrl').setValue(res.signature);
              this.thirdFormGroup.get('thirdCtrl').setValue(res.engagement_level);
              this.secondStepDone = true;
              this.thirdStepDone = true;

              //********** fix tab not moving to the selected index need delay for call step properly
              this.selectedIndex = 0;
              const timeout = setTimeout(() => {
                clearTimeout(timeout);
                this.selectedIndex = 4;
              }, 1000);
              this.admissionService.setIndexStep(this.selectedIndex);
            }
            if (
              res &&
              (res.personal_information === 'done' || res.personal_information === 'legal_representative') &&
              res.is_admitted &&
              res.signature === 'done' &&
              res.program_confirmed === 'done'
            ) {
              this.thirdFormGroup.get('thirdCtrl').setValue(res.signature);
              this.fourthFormGroup.get('fourthCtrl').setValue('registered');
              this.fourthStepDone = true;
              this.secondStepDone = true;
              this.isLinear = false;

              //********** fix tab not moving to the selected index need delay for call step properly
              this.selectedIndex = 0;
              const timeout = setTimeout(() => {
                clearTimeout(timeout);
                this.selectedIndex = 5;
              }, 1000);
              this.admissionService.setIndexStep(this.selectedIndex);
            }
            // For checking payment transfer and check
            if (
              res &&
              ((res.payment_method && res.payment_method === 'transfer') || (res.payment_method && res.payment_method === 'check')) &&
              res.is_admitted &&
              (res.personal_information === 'done' || res.personal_information === 'legal_representative') &&
              res.signature === 'done' &&
              res.payment_method &&
              res.program_confirmed === 'done' &&
              res.payment &&
              (res.payment === 'pending' || res.payment === 'done')
            ) {
              this.thirdFormGroup.get('thirdCtrl').setValue(res.signature);
              this.fourthFormGroup.get('fourthCtrl').setValue('registered');
              this.fifthFormGroup.get('fifthCtrl').setValue('registered');
              this.fourthStepDone = true;
              this.secondStepDone = true;
              this.thirdStepDone = true;
              this.fifthStepDone = true;
              this.isLinear = false;

              //********** fix tab not moving to the selected index need delay for call step properly
              const timeout = setTimeout(() => {
                clearTimeout(timeout);
                this.selectedIndex = 5;
              }, 1000);
              this.admissionService.setIndexStep(this.selectedIndex);
            } else if (
              res &&
              res.payment === 'done' &&
              res.payment_method === 'credit_card' &&
              res.is_admitted &&
              (res.personal_information === 'done' || res.personal_information === 'legal_representative') &&
              res.signature === 'done' &&
              res.payment_method &&
              res.program_confirmed === 'done'
            ) {
              this.thirdFormGroup.get('thirdCtrl').setValue(res.signature);
              this.fourthFormGroup.get('fourthCtrl').setValue('registered');
              this.fifthFormGroup.get('fifthCtrl').setValue('registered');
              this.fourthStepDone = true;
              this.secondStepDone = true;
              this.thirdStepDone = true;
              this.fifthStepDone = true;
              this.isLinear = false;
              
              //********** fix tab not moving to the selected index need delay for call step properly
              const timeout = setTimeout(() => {
                clearTimeout(timeout);
                this.selectedIndex = 5;
              }, 1000);
              this.admissionService.setIndexStep(this.selectedIndex);
            }
            if (res.candidate_admission_status === 'engaged' || res.candidate_admission_status === 'registered') {
              this.isLinear = false;
            }

            this.getPromotionData();
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

    this.subs.sink = this.admissionService.getOneCandidateDetail(this.candidateId).subscribe(
      (resp) => {
        const res = _.cloneDeep(resp);
        if (!resp?.registration_profile && !resp?.admission_process_id?._id) {
          this.isFormClosed = true;
          this.displaySwalFormClosed();
          return;
        } else if(res?.admission_process_id?._id) {
          this.isFormClosed = false;
          const params = {
            formId: res.admission_process_id._id,
            formType: 'student_admission',
            userId: res?._id ? res._id : '',
            userTypeId: res?.student_id?.user_id?.entities?.[0]?.type?._id ? res.student_id.user_id.entities[0].type._id : '',
          };
          const url = this.router.createUrlTree(['/form-fill'], { queryParams: params });
          window.open(url.toString(), '_self');
          return;
        } else {
          this.isFormClosed = false;
        }
        if (res && res.photo) {
          this.photo = res.photo;
          this.is_photo_in_s3 = true;
        }
        this.detailDataCandidate = res;
        if (
          this.detailDataCandidate &&
          !(this.detailDataCandidate.admission_member_id && this.detailDataCandidate.admission_member_id._id)
        ) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('CANDIDAT_NOMEMBER.TITLE'),
            text: this.translate.instant('CANDIDAT_NOMEMBER.TEXT'),
            confirmButtonText: this.translate.instant('CANDIDAT_NOMEMBER.BUTTON'),
            allowOutsideClick: false,
          }).then(() => {
            window.open(`./session/login`, '_self');
          });
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

  // connecting candidate with admission for first time
  connectingRegistration(event) {
    const payload = {
      connection: 'done',
    };
    this.subs.sink = this.admissionService.UpdateCandidate(this.candidateData._id, payload).subscribe(
      (resp) => {
        this.candidateData = resp;
      },      
      (err) => {        
        if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('LEGAL_S5.Title'),
            text: this.translate.instant('LEGAL_S5.Text'),
            confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
          }).then(() => {
            window.open(`./session/login`, '_self');
          });
        } else if (err['message'] === 'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit'
        || err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('EUROPEAN_COUNTRIES.TITLE'),
            html: this.translate.instant('EUROPEAN_COUNTRIES.TEXT'),
            confirmButtonText: this.translate.instant('EUROPEAN_COUNTRIES.BUTTON'),
          }).then(() => {
            window.open(`./session/login`, '_self');
          });
        } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('IBAN_S1.Title'),
            text: this.translate.instant('IBAN_S1.Text'),
            confirmButtonText: this.translate.instant('IBAN_S1.Button'),
          }).then(() => {
            window.open(`./session/login`, '_self');
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          }).then(() => {
            window.open(`./session/login`, '_self');
          });
        }
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
    this.campusFormGroup = this.fb.group({
      campusCtrl: ['', Validators.required],
    });
    this.firstFormGroup = this.fb.group({
      firstCtrl: ['', Validators.required],
    });
    this.secondFormGroup = this.fb.group({
      secondCtrl: ['', Validators.required],
    });
    this.thirdFormGroup = this.fb.group({
      thirdCtrl: ['', Validators.required],
    });
    this.fourthFormGroup = this.fb.group({
      fourthCtrl: ['', Validators.required],
    });
    this.fifthFormGroup = this.fb.group({
      fifthCtrl: ['', Validators.required],
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
            type: 'info',
            title: this.translate.instant('SORRY'),
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

  moveToTab(tab) {
    if (tab) {
      switch (tab) {
        case 'program_confirmed':
          setTimeout(() => {
            this.selectedIndex = 0;
          }, 300);
          break;
        case 'personal_information':
          setTimeout(() => {
            this.selectedIndex = 1;
          }, 300);
          break;
        case 'finance':
          setTimeout(() => {
            this.selectedIndex = 2;
          }, 300);
          break;
        case 'is_admitted':
          setTimeout(() => {
            this.selectedIndex = 3;
          }, 300);
          break;
        case 'signature':
          setTimeout(() => {
            this.selectedIndex = 4;
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
