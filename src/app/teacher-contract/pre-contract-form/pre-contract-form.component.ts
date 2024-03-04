import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { TeacherContractService } from '../teacher-contract.service';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ms-pre-contract-form',
  templateUrl: './pre-contract-form.component.html',
  styleUrls: ['./pre-contract-form.component.scss'],
})
export class PreContractFormComponent implements OnInit {
  @ViewChild('stepperForm', { static: false }) private stepper: MatStepper;
  formData: any;
  myInnerHeight = 600;
  selectedIndex = 0;
  subs = new SubSink();
  isWaitingForResponse = false;
  isAlreadySign = false;
  allStepsCompleted = false;
  formDetail: {
    formId?: string;
    userId?: string;
    formType?: string;
    templateId?: string;
    isPreview?: boolean;
    is_final_validator_active?: boolean;
    contract_status?: any;
    revise_request_messages?: any[];
    userTypeId: string;
    isFinalRevisionUser?: boolean;
  };

  userId: any;
  isReceiver = false;
  userData: any;
  currentUser: any;
  dataForm: any;

  stepsLength;

  constructor(
    private contractService: TeacherContractService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((resp: any) => {
      if (resp.params.hasOwnProperty('templateId')) {
        this.formDetail = _.cloneDeep(resp.params);
        this.getDataByContractTemplate(resp.params.templateId);
      } else {
        this.formDetail = _.cloneDeep(resp.params);
        if (resp.params.hasOwnProperty('userId')) {
          this.userId = resp.params.userId;
        }
        console.log(this.formDetail);
        switch (this.formDetail.formType) {
          case 'teacher_contract':
            this.fetchContractForm(this.formDetail.formId);
            break;
          case 'fc_contract':
            this.fetchFCContractForm(this.formDetail.formId);
            break;
          default:
            break;
        }
      }
    });
  }

  // COPY FROM V2 FROM BUILDER ************************************************
  getOneUser(resp) {
    this.subs.sink = this.contractService.getOneUser(this.userId).subscribe(
      (res) => {
        this.isWaitingForResponse = false;
        if (res) {
          console.log('_res user', res);
          this.userData = res;
          const userData = res;
          this.isReceiver = !!userData.entities.find((ent) => {
            if (ent && ent.type && ent.type._id === '5a067bba1c0217218c75f8ab') {
              return true;
            } else {
              return false;
            }
          });
          this.formDetail.isFinalRevisionUser = !!userData.entities.find((ent) => {
            if (ent && ent.type && resp.revision_user_type && ent.type._id === resp.revision_user_type) {
              return true;
            } else {
              return false;
            }
          });
          console.log(this.isReceiver);
          console.log('is final revision user?', this.formDetail.isFinalRevisionUser);
        } else {
          // If res is empty, meaning we cannot find the user, either the student is deactivated or user is deleted
          const domainUrl = this.router.url.split('/')[0];
          window.open(`${domainUrl}/`, '_self');
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

  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 103;
    return this.myInnerHeight;
  }

  fetchFCContractForm(formId: string, isRefresh: boolean = false) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.getOneFcContractProcess(formId).subscribe(
      (resp) => {
        if (resp) {
          if (resp.revision_user_type && typeof resp.revision_user_type === 'object' && resp.revision_user_type._id) {
            resp.revision_user_type = resp.revision_user_type._id;
          }
          if (resp.hasOwnProperty('contract_status')) {
            this.formDetail.contract_status = resp.contract_status;
          }
          if (resp.revise_request_messages && resp.revise_request_messages.length) {
            this.formDetail.revise_request_messages = resp.revise_request_messages;
          }

          if (resp.contract_validator_signatory_status && resp.contract_validator_signatory_status.length === 0) {
            if (
              resp.contract_status === 'signed' &&
              resp.fc_contract_manager_signatory &&
              resp.fc_contract_manager_signatory.is_already_sign
            ) {
              this.isAlreadySign = true;
            } else {
              this.isAlreadySign = false;
            }
          }

          const item = resp.contract_validator_signatory_status
            ? resp.contract_validator_signatory_status.filter((items) => items.is_already_sign === false)
            : [];
          if (item.length !== 0) {
            this.isAlreadySign = false;
          }

          if (
            resp.contract_status === 'signed' &&
            resp.fc_contract_manager_signatory &&
            resp.fc_contract_manager_signatory.is_already_sign
          ) {
            this.isAlreadySign = true;
          } else {
            this.isAlreadySign = false;
          }

          this.formatStepRevisionUserTypeObjectToStringId(resp);
          this.formData = resp;
          this.stepsLength = resp.steps.length - 1;

          if (resp.contract_status === 'signed') {
            this.allStepsCompleted = true;
          } else {
            this.allStepsCompleted = false;
          }

          // console.log('this.allStepsCompleted', this.allStepsCompleted, resp);
          if (this.isReceiver || !isRefresh) {
            this.fetchAndSetLatestCompletedStepIndex(resp.steps);
          }
          this.setupStepState(this.formData);
          if (this.formData.candidate_id) {
            this.isReceiver = true;
            this.userData = {
              _id: this.formData.candidate_id._id,
              civility: this.formData.candidate_id.civility,
              first_name: this.formData.candidate_id.first_name,
              last_name: this.formData.candidate_id.last_name,
              entities: [],
            };
          } else {
            this.getOneUser(resp);
          }
          this.isWaitingForResponse = false;
        } else {
          this.isWaitingForResponse = false;
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

  fetchContractForm(formId: string, isRefresh: boolean = false) {
    if (this.formDetail.formType === 'fc_contract') {
      this.fetchFCContractForm(formId, isRefresh);
    } else if (this.formDetail.formType === 'teacher_contract') {
      this.isWaitingForResponse = true;
      this.subs.sink = this.contractService.getOneContractProcess(formId, true, this.translate.currentLang).subscribe(
        (resp) => {
          if (resp) {
            if (resp.revision_user_type && typeof resp.revision_user_type === 'object' && resp.revision_user_type._id) {
              resp.revision_user_type = resp.revision_user_type._id;
            }
            if (resp.hasOwnProperty('contract_status')) {
              this.formDetail.contract_status = resp.contract_status;
            }
            if (resp.revise_request_messages && resp.revise_request_messages.length) {
              this.formDetail.revise_request_messages = resp.revise_request_messages;
            }
            if (resp.hasOwnProperty('is_final_validator_active')) {
              this.formDetail.is_final_validator_active = resp.is_final_validator_active;
            }
            if (resp.contract_validator_signatory_status.length === 0) {
              if (resp.contract_status === 'submitted' && resp.teacher_signatory && resp.teacher_signatory.is_already_sign) {
                this.isAlreadySign = true;
              } else {
                this.isAlreadySign = false;
              }
            }
            const item = resp.contract_validator_signatory_status.filter((items) => items.is_already_sign === false);
            if (item.length !== 0) {
              this.isAlreadySign = false;
            }
            if (resp.contract_status === 'submitted' && resp.teacher_signatory && resp.teacher_signatory.is_already_sign) {
              this.isAlreadySign = true;
            } else {
              this.isAlreadySign = false;
            }
            this.formatStepRevisionUserTypeObjectToStringId(resp);
            this.formData = resp;
            if (resp.contract_status === 'signing_process' || resp.contract_status === 'submitted') {
              this.allStepsCompleted = true;
            } else {
              this.allStepsCompleted = false;
            }
            console.log('this.allStepsCompleted', this.allStepsCompleted, resp);
            if (this.isReceiver || !isRefresh) {
              this.fetchAndSetLatestCompletedStepIndex(resp.steps);
            }
            this.setupStepState(this.formData);
            if (this.formDetail.formId === this.userId) {
              this.isReceiver = true;
              this.userData = {
                _id: this.formData._id,
                civility: this.formData.civility,
                first_name: this.formData.first_name,
                last_name: this.formData.last_name,
                entities: [],
              };
            } else {
              this.getOneUser(resp);
            }
            this.isWaitingForResponse = false;
          } else {
            this.isWaitingForResponse = false;
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

  formatStepRevisionUserTypeObjectToStringId(payload) {
    if (payload && payload.steps && payload.steps.length) {
      payload.steps = payload.steps.map((step) => {
        if (step && step.revision_user_type && typeof step.revision_user_type === 'object' && step.revision_user_type._id) {
          // step.revision_user_type = step.revision_user_type._id;
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
    const totalStepPass = steps.filter((list) => list.step_status === 'accept');
    currentValue = totalStepPass && totalStepPass.length ? totalStepPass.length : 0;
    // if allStepsCompleted then summary step is available which means index should be the last one or step.length
    this.changeDetectorRef.detectChanges();
    currentValue = this.allStepsCompleted
      ? totalStepPass.length
      : currentValue > totalStepPass.length - 1
      ? totalStepPass.length
      : currentValue;
    if (
      (this.formData && this.formData.signature_date && this.formData.signature_date.date !== null) ||
      (this.formData.teacher_signatory && this.formData.teacher_signatory.is_already_sign)
    ) {
      currentValue += 1;
    }
    this.selectedIndex = currentValue; // this binding is apparently too slow for the DOM init after change
    if (this.stepper) {
      this.stepper.selectedIndex = currentValue;
      // for some reason i need to do this too since the view does not respond to the selectedIndex binding above
    }
    // this.stepper.selectedIndex = currentValue;
    console.log('currentValue and selectedIndex is now:', currentValue, this.selectedIndex, totalStepPass);
  }

  getDataByContractTemplate(templateId) {
    this.subs.sink = this.contractService.GetOneRandomContractProcess(templateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.formData = resp;
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

  moveToNextStep() {
    this.selectedIndex += 1;
  }

  moveToPrevStep() {
    this.selectedIndex -= 1;
  }

  checkIfAllStepsCompleted(): boolean {
    return this.formData.steps.every((step) => step.step_status === 'accept');
  }

  setupStepState(contractData) {
    // const stepState = [];
    // for (const step of contractData.steps) {
    //   stepState.push({
    //     step: step.step_title,
    //     completed: false,
    //   });
    // }
    // this.contractService.stepState = stepState;
    // console.log('after setting, the step state becomes: ', this.contractService.stepState);
  }

  getStepState() {
    // console.log("on get stepState:", this.contractService.stepState);
    // return this.contractService.stepState;
  }

  onStepChange(event) {
    this.selectedIndex = event.selectedIndex;
  }
}
