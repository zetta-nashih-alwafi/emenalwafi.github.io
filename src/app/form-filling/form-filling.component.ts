import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubSink } from 'subsink';
import { FormFillingService } from './form-filling.service';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { AlumniService } from 'app/service/alumni/alumni.service';
import { MatStepper } from '@angular/material/stepper';
import { GlobalConstants } from 'app/shared/settings';
import { CountryService } from 'app/shared/services/country.service';
import { UtilityService } from 'app/service/utility/utility.service';

@Component({
  selector: 'ms-form-filling',
  templateUrl: './form-filling.component.html',
  styleUrls: ['./form-filling.component.scss'],
})
export class FormFillingComponent implements OnInit {
  @ViewChild('stepperForm', { static: false }) private stepper: MatStepper;
  formData: any;
  myInnerHeight = 600;
  selectedIndex = 0;
  subs = new SubSink();
  isWaitingForResponse = false;
  allStepsCompleted = false;
  unregisteredUserFormTypes = ['teacher_contract', 'fc_contract'];
  isNonUserTemplateType: boolean;
  formDetail: {
    formId?: string;
    userId?: string;
    formType?: string;
    templateId?: string;
    isPreview?: boolean;
    is_final_validator_active?: boolean;
    admission_status?: any;
    contract_status?: any;
    revise_request_messages?: any[];
    userTypeId: string;
    isFinalRevisionUser?: boolean;
    isFinalValidatorUser?: boolean;
    currentFinalValidatorValidate?: boolean;
    is_form_closed?: boolean;
  };

  userId: any;
  isReceiver = false;
  userData: any;
  formattedSteps = [];
  studentId: any;
  isPreview: boolean;
  isReject:boolean = false
  isShow: boolean;
  visited: Boolean;

  // *************** START OF property to store data of country dial code
  countryCodeList: any[] = [];
  // *************** END OF property to store data of country dial code

  constructor(
    private formFillingService: FormFillingService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    public alumniService: AlumniService,
    private translateService: TranslateService,
    private countryService: CountryService,
    private utilService: UtilityService

  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((resp: any) => {
      if (resp.params.hasOwnProperty('templateId')) {
        this.formDetail = _.cloneDeep(resp.params);
        this.isReject = false
        this.fetchFormBuilderTemplate(resp.params.templateId);
      } else {
        this.formDetail = _.cloneDeep(resp.params);
        this.isReject = false;
        this.userId = resp.params.userId;
        this.isNonUserTemplateType =
          this.unregisteredUserFormTypes.includes(this.formDetail.formType) && this.formDetail.formId === this.formDetail.userId;
        this.fetchStudentAdmissionForm(this.formDetail.formId);
      }
      this.formDetail.isPreview = resp.params['isPreview'] && resp.params['isPreview'] === 'true'; // typeof isPreview is string in the URL

      if(resp?.params?.hasOwnProperty('event') && this.formDetail?.formType === 'fc_contract'){
        this.isReject = resp.params.event === 'decline' ? true : false
      }

      this.getAllCountryCodes();
    });
    this.isVisited();

    this.subs.sink = this.translateService.onLangChange.subscribe(() => {
      this.sortCountryCode();
    })
  }

  sortCountryCode() {
    this.countryCodeList = this.countryCodeList.sort((firstData, secondData) => {
      if (this.utilService.simplifyRegex(this.translateService.instant(firstData?.name)) < this.utilService.simplifyRegex(this.translateService.instant(secondData?.name))) {
        return -1;
      } else if (this.utilService.simplifyRegex(this.translateService.instant(firstData?.name)) > this.utilService.simplifyRegex(this.translateService.instant(secondData?.name))) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  getAllCountryCodes() {
    this.countryCodeList = this.countryService?.getAllCountriesNationality();
  }

  checkCurrentFormId(currentFormData: any, isFormClosed?) {
    const candidateId: string = currentFormData.candidate_id._id
    this.subs.sink = this.formFillingService.getCandidateValidation(candidateId).subscribe(
      (resp) => {
        if (resp && resp.admission_process_id && resp.admission_process_id._id) {
          if (resp.admission_process_id._id !== this.formDetail.formId) {
            const params = {
              formId: resp.admission_process_id._id,
              formType: this.formDetail.formType,
              userId: this.userId,
              userTypeId: this.formDetail.userTypeId,
            };
            const url = this.router.createUrlTree(['/form-fill'], { queryParams: params });
            window.open(url.toString(), '_self');
          }
        } else if (isFormClosed) {
          this.isWaitingForResponse = false;
          this.displaySwalFormClosed();
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translateService.instant('SORRY'),
          text: err && err['message'] ? this.translateService.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translateService.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  formatSteps(steps) {
    this.formattedSteps = [];
    if (steps && steps.length) {
      if (this.formDetail && this.formDetail.isPreview) {
        this.formattedSteps = steps;
      } else {
        this.formattedSteps = steps.filter(
          (step) => !((step.is_only_visible_based_on_condition && step.step_status === 'pending') || step.step_status === 'pending'),
        );
      }
    }
  }
  getUserStep() {
    if (this.formData && this.formData.steps && this.formData.steps.length) {
      this.formData.steps.forEach((step) => {
        if (this.formDetail && this.formDetail.userTypeId && step && step.user_who_complete_step) {
          let isUserEntityIncludesOnStep = false;
          if (this.userData && this.userData && this.userData?.entities?.length) {
            isUserEntityIncludesOnStep = this.userData?.entities
              ?.some((entity) => {
                  if (entity && entity?.type && entity?.type?._id) {
                    const isUserWhoCompleteStep = entity?.type?._id === step?.user_who_complete_step?._id
                    let isUserHasMatchProgram = false;
                    if (
                        entity?.programs &&
                        entity?.programs?.length &&
                        this.formData?.program &&
                        this.formData?.program?.school_id &&
                        this.formData?.program?.school_id?._id &&
                        this.formData?.program?.campus &&
                        this.formData?.program?.campus?._id &&
                        this.formData?.program?.level &&
                        this.formData?.program?.level?._id
                      ) {
                      isUserHasMatchProgram = entity?.programs?.some((program) => {
                        if (
                          program &&
                          program?.school &&
                          program?.school?._id &&
                          program?.campus &&
                          program?.campus?._id &&
                          program?.level &&
                          program?.level?._id
                        ) {
                          return (
                            program?.school?._id === this.formData?.program?.school_id?._id &&
                            program?.campus?._id === this.formData?.program?.campus?._id &&
                            program?.level?._id === this.formData?.program?.level?._id
                          );
                        }
                      })
                    }
                    return isUserWhoCompleteStep && isUserHasMatchProgram
                  }
                }
              );

          }
          if (
            isUserEntityIncludesOnStep ||
            this.formDetail.userTypeId === step.user_who_complete_step._id ||
            this.checkTypeStudentCandidate(this.formDetail.userTypeId, step.user_who_complete_step._id)
          ) {
            step.isCompletingUser = true;
          } else {
            step.isCompletingUser = false;
          }
        } else {
          step.isCompletingUser = false;
        }
      });
    }
  }

  checkTypeStudentCandidate(userType, user_who_complete): Boolean {
    const candidate = '5fe98eeadb866c403defdc6c';
    const student = '5a067bba1c0217218c75f8ab';
    let result;
    if ((user_who_complete === candidate && userType === student) || (user_who_complete === student && userType === candidate)) {
      result = true;
    } else {
      result = false;
    }
    return result;
  }

  // for form of type teacher contract, since teacher has no user_id, isReceiver and isFinalRevisionUser is now set if
  // formId and userId from url is equal
  setUserForTeacherContract() {
    this.isReceiver = this.formData._id === this.formDetail.userId;
    this.formDetail.isFinalRevisionUser = this.formData._id === this.formDetail.userId;
  }

  getOneAlumni(id) {
    if (id) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.alumniService.getOneAlumniSurveyDetail(id).subscribe(
        (resp) => {
          if (resp) {
            this.isReceiver = this.formDetail.userId === resp._id;
            this.formDetail.isFinalRevisionUser = this.formDetail.userId === resp._id;
            this.userData = resp;
          }
          this.isWaitingForResponse = false;
        },
        (err) => {
          this.isWaitingForResponse = false;
        },
      );
    }
  }

  getOneUser(resp) {
    this.subs.sink = this.formFillingService.getOneUser(this.userId).subscribe(
      (res) => {
        this.isWaitingForResponse = false;
        if (res) {
          this.userData = res;
          const userData = res;

          this.isReceiver =
            (this.formData && this.formData.user_id && this.formData.user_id._id) ||
            (this.formData &&
              this.formData.candidate_id &&
              this.formData.candidate_id.user_id &&
              this.formData.candidate_id.user_id._id === this.formDetail.userId)
              ? true
              : false;

          this.formDetail.isFinalRevisionUser = !!userData.entities.find((ent) => {
            if (ent && ent.type && resp.revision_user_type && ent.type._id === resp.revision_user_type) {
              return true;
            } else {
              return false;
            }
          });

          // For Final Validators
          const idAcadDir = '617f64ec5a48fe2228518812';
          // in admission document acadDir can validate even if not set as validator
          if (
            this.formDetail.userTypeId &&
            this.formDetail.userTypeId === idAcadDir &&
            this.formDetail.formType &&
            this.formDetail.formType === 'admissionDocument'
          ) {
            this.formDetail.isFinalValidatorUser = true;
          } else {
            const finalValidators = this.formData.final_validators.map((validator) => validator._id);
            this.formDetail.isFinalValidatorUser = !!userData.entities.find((ent) => {
              if (ent && ent.type && this.formData.is_final_validator_active && finalValidators.includes(ent.type._id)) {
                return true;
              } else {
                return false;
              }
            });
          }

          // Check if current user final validators already validate
          this.formDetail.currentFinalValidatorValidate = this.checkIfValidatorHasValidated(resp);
        } else {
          // If res is empty, meaning we cannot find the user, either the student is deactivated or user is deleted
          const domainUrl = this.router.url.split('/')[0];
          window.open(`${domainUrl}/`, '_self');
        }
        
        this.getUserStep();
      },
      (err) => {
        this.isWaitingForResponse = false;
      },
    );
  }

  checkIfValidatorHasValidated(resp): boolean {
    if (!this.formDetail.isFinalValidatorUser) {
      return false;
    }
    return this.getAllValidatorsWhoValidated(resp).includes(this.formDetail.userId);
  }

  getAllValidatorsWhoValidated(resp): any[] {
    return resp && resp.final_validator_statuses && resp.final_validator_statuses.length
      ? resp.final_validator_statuses
          .filter((status) => status && status.user_id && status.user_id._id && status.is_already_sign)
          .map((status) => status.user_id._id)
      : [];
  }

  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 103;
    return this.myInnerHeight;
  }

  // Main functionality to fetch every form process data for EVERY form type
  fetchStudentAdmissionForm(formId: string, isRefresh: boolean = false) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.getOneFormProcess(formId).subscribe(
      (resp) => {
        if (resp) {
          if (resp.candidate_id && resp.candidate_id._id) {
            this.formDetail['candidateId'] = resp.candidate_id._id;
            if (resp?.is_form_closed && this.formDetail.formType === 'student_admission') {
              this.checkCurrentFormId(resp, resp?.is_form_closed);
              return;
            }
          }
          if (resp?.is_form_closed) {
            this.isWaitingForResponse = false;
            this.displaySwalFormClosed();
            return;
          }
          if (resp.student_id && resp.student_id._id) {
            this.studentId = resp.student_id._id;
          }
          if (resp.revision_user_type && typeof resp.revision_user_type === 'object' && resp.revision_user_type._id) {
            resp.revision_user_type = resp.revision_user_type._id;
          }
          if (resp.admission_status) {
            this.formDetail.admission_status = resp.admission_status ? resp.admission_status : null;
          }
          if (resp.contract_status) {
            this.formDetail.contract_status = resp.contract_status ? resp.contract_status : null;
          }
          if (resp.revise_request_messages && resp.revise_request_messages.length) {
            this.formDetail.revise_request_messages = resp.revise_request_messages;
          }
          if (resp.hasOwnProperty('is_final_validator_active')) {
            this.formDetail.is_final_validator_active = resp.is_final_validator_active;
          }
          if (resp.form_builder_id && typeof resp.form_builder_id._id === 'string') {
            this.formDetail.templateId = resp.form_builder_id._id;
          }
          if(resp?.is_form_closed) {
            this.formDetail.is_form_closed = resp?.is_form_closed;
          }
          this.formatStepRevisionUserTypeObjectToStringId(resp);
          this.formData = [];
          this.formData = resp;
          this.formatSteps(this.formData.steps);
          this.allStepsCompleted = this.checkIfAllStepsCompleted();
          // Add conditional if coming from FC Contract, it will refetch step after accept step
          const isFromFcContract = resp?.form_builder_id?.template_type === 'fc_contract' ? true : false;
          if (this.isReceiver || !isRefresh || isFromFcContract) {
            this.fetchAndSetLatestCompletedStepIndex(this.formattedSteps);
          }
          this.getUserStep();

          // this.isNonUserTemplateType ? this.setUserForTeacherContract() : this.getOneUser(resp);
          if (this.isNonUserTemplateType) {
            this.setUserForTeacherContract();
          } else if (this.formDetail.formType === 'alumni') {
            // userId in url is actually alumni id for the case where form type is alumni
            this.getOneAlumni(resp?.alumni_id?._id);
          } else {
            if (this.userId) {
              this.getOneUser(resp);
            }
          }
          this.isWaitingForResponse = false;
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
      },
    );
  }

  formatStepRevisionUserTypeObjectToStringId(payload) {
    if (payload && payload.steps && payload.steps.length) {
      payload.steps = payload.steps.map((step) => {
        if (step && step.revision_user_type && typeof step.revision_user_type === 'object' && step.revision_user_type._id) {
          return { ...step, revision_user_type: step.revision_user_type._id };
        } else {
          return { ...step };
        }
      });
    }
  }

  fetchAndSetLatestCompletedStepIndex(steps: any[]) {
    let currentValue = 0;
    for (const step of steps) {
      if (step.step_status === 'accept') {
        currentValue += 1;
      }
    }

    // *************** Variable to save index step if some step was not done while next step is already done
    let notStartedStep = [];

    // *************** loop to find index step which has status not started
    steps.forEach((step, index) => {
      if (step?.step_status === 'not_started') {
        notStartedStep.push(index);
      }
    });

    // *************** check if there is step less than the counter step that has accept status we have
    const isStepBehind = notStartedStep.some((res) => res < currentValue);
    let indexFound = 0;

    // *************** if the condition is true, we need find the index that less than currentvalue
    if (isStepBehind) {
      indexFound = notStartedStep.find((res) => res < currentValue);
    }

    // if allStepsCompleted then summary step is available which means index should be the last one or step.length
    this.changeDetectorRef.detectChanges();
    currentValue =
      this.allStepsCompleted && currentValue > steps.length - 1
        ? steps.length - 1
        : currentValue > indexFound && indexFound !== 0
        ? indexFound
        : currentValue;
    this.selectedIndex = currentValue; // this binding is apparently too slow for the DOM init after change
    if (this.stepper) {
      this.stepper.selectedIndex = currentValue;
      // for some reason i need to do this too since the view does not respond to the selectedIndex binding above
    }
  }

  fetchFormBuilderTemplate(templateId: string) {
    this.subs.sink = this.formFillingService.getOneRandomFormProcess(templateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.formData = resp;
          this.formatSteps(this.formData.steps);
          this.allStepsCompleted = this.checkIfAllStepsCompleted();
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
      },
    );
  }

  moveToNextStep() {
    this.selectedIndex += 1;
  }

  moveToPrevStep() {
    this.selectedIndex -= 1;
  }

  checkIfAllStepsCompleted(): boolean {
    return this.formattedSteps.every((step) => step.step_status === 'accept');
  }

  onStepChange(event) {
    if (this.formattedSteps && this.formattedSteps.length > 0) {
      if (
        this.formattedSteps &&
        this.formattedSteps[event.selectedIndex].step_status === 'accept' &&
        this.formattedSteps[event.selectedIndex].step_type === 'finance'
      ) {
        if (
          this.formattedSteps[this.formattedSteps.length - 1].step_type === 'finance' &&
          this.formattedSteps[this.formattedSteps.length - 1].step_status === 'accept'
        ) {
          this.selectedIndex = event.selectedIndex;
        } else {
          this.selectedIndex = event.selectedIndex;
        }
      } else {
        this.selectedIndex = event.selectedIndex;
      }
    } else {
      this.selectedIndex = event.selectedIndex;
    }
  }

  displaySwalFormClosed() {
    Swal.fire({
      type: 'info',
      title: this.translateService.instant('FORM_S6.TITLE'),
      html: this.translateService.instant('FORM_S6.HTML'),
      confirmButtonText: this.translateService.instant('FORM_S6.BUTTON'),
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(() => {   
      window.close();
    })
  }

  isVisited() {
    const dataFromLocalStorage = JSON.parse(localStorage.getItem('cookieVisited'));
    if (dataFromLocalStorage?.visited == true) {
      this.visited = true;
    } else {
      this.visited = false;
    }
  }

  setVisited() {
    const dataVisited = {
      visited: true,
    };
    localStorage.setItem('cookieVisited', JSON.stringify(dataVisited));
    this.visited = true;
  }

  gotoPrivacyPolicy() {
    const privacyPolicylink = document.createElement('a');
    privacyPolicylink.target = '_blank';

    
      privacyPolicylink.href = GlobalConstants.privacyPolicy.ENLink;
    

    privacyPolicylink.setAttribute('visibility', 'hidden');
    document.body.appendChild(privacyPolicylink);
    privacyPolicylink.click();
    document.body.removeChild(privacyPolicylink);
  }
}
