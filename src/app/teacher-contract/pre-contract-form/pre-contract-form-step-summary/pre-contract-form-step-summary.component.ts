import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import Swal from 'sweetalert2';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ApplicationUrls } from 'app/shared/settings';
import { environment } from 'environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { RevisionBoxContractDialogComponent } from '../revision-box-contract-dialog/revision-box-contract-dialog.component';

@Component({
  selector: 'ms-pre-contract-form-step-summary',
  templateUrl: './pre-contract-form-step-summary.component.html',
  styleUrls: ['./pre-contract-form-step-summary.component.scss'],
})
export class PreContractFormStepSummaryComponent implements OnInit {
  @Input() formDetail;
  @Input() isReceiver: any;
  formIdURL: string;
  userId: string;
  formType: string;
  @Input() set userDataInput(value: any) {
    this._userData = value;
    if (value) {
      if (this.formDetail.formId) {
        this.getTeacherContractData();
      }
    }
  }
  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();

  private subs = new SubSink();
  private _userData: any;

  get userData() {
    return this._userData;
  }

  isUserValidator = true; // temporary
  isUserStudent = false; // temporary
  timeOutVal: any;
  formData: any;
  templateStep = [];
  isValidator = false;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  signature = false;
  isAccepted = false;
  isLoading = false;
  formattedSignatureDate: string;
  isWaitingForResponse = false;
  hasValidatorValidated: boolean = false;
  documentExpectedDisplays: { stepIndex: number; selectedDocumentUrl: any }[] = [];

  constructor(
    private translate: TranslateService,
    private contractService: TeacherContractService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    if (this.formDetail.templateId) {
      this.getRandomTeacherContractData();
    }
    this.subs.sink = this.translate.onLangChange.subscribe((resp) => {
      moment.locale(resp.lang);
      this.checkSignature();
    });
    // Get each param
    this.formIdURL = this.route.snapshot.queryParamMap.get('formId');
    this.userId = this.route.snapshot.queryParamMap.get('userId');
    this.formType = this.route.snapshot.queryParamMap.get('formType');
  }

  checkDisableForm() {
    const finalValidators = this.formData.contract_validator_signatory.map((validator) => validator._id);
    this.isValidator = !!this.userData.entities.find((ent) => {
      if (ent && ent.type && this.formData.is_contract_validator_signatory_in_order && finalValidators.includes(ent.type._id)) {
        return true;
      } else {
        return false;
      }
    });
  }

  checkSignature() {
    if (this.formData && this.formData.contract_status === 'signing_process') {
      this.signature = true;
      this.formattedSignatureDate = this.formatSignatureDate();
    } else {
      this.signature = false;
    }
  }

  formatSignatureDate() {
    moment.locale(this.translate.currentLang);
    const duration = moment.duration({ hours: environment.timezoneDiff });
    const acceptance_date = moment(this.formData.signature_date.date + this.formData.signature_date.time, 'DD/MM/YYYYHH:mm')
      .add(duration)
      .format();
    return moment(acceptance_date).format('DD MMMM YYYY - HH:mm');
  }

  checkFormAccept() {
    if (
      this.formData &&
      this.formData.contract_status === 'submitted' &&
      this.formData.signature_date &&
      this.formData.signature_date.date
    ) {
      this.isAccepted = true;
    } else if (this.formData && this.formData.contract_status === 'signing_process') {
      this.isAccepted = true;
    }
  }

  getTeacherContractData() {
    this.formData = [];
    this.templateStep = [];
    this.isWaitingForResponse = true;

    this.subs.sink = this.contractService.getOneContractProcess(this.formDetail.formId, true, this.translate.currentLang).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.formData = _.cloneDeep(resp);
          this.documentExpectedDisplays = [];
          const templateSteps = [];
          this.formData.steps.forEach((step, stepIndex) => {
            if (step && step.length !== 0) {
              // push to documentExpectedDetails all the document expected steps detail
              if (
                step.step_type &&
                step.step_type === 'document_expected' &&
                step.segments &&
                step.segments.length &&
                step.segments[0].questions[0]
              ) {
                this.documentExpectedDisplays.push({
                  stepIndex,
                  selectedDocumentUrl: this.setPreviewUrl(step.segments[0].questions[0].answer) || null,
                });
              }
              templateSteps.push(step);
            }
          });
          this.templateStep = templateSteps;
          this.checkDisableForm();
          this.checkFormAccept();
          this.checkSignature();
          this.hasValidatorValidated = this.checkIfValidatorHasValidated(resp);
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

  checkIfValidatorHasValidated(payload): boolean {
    if (!this.isValidator) {
      return false;
    }
    return this.getAllValidatorsWhoValidated(payload).includes(this.formDetail.userId);
  }

  getAllValidatorsWhoValidated(payload): any[] {
    return payload && payload.contract_validator_signatory_status && payload.contract_validator_signatory_status.length
      ? payload.contract_validator_signatory_status
          .filter((status) => status && status.user_id && status.user_id._id && status.is_already_sign)
          .map((status) => status.user_id._id)
      : [];
  }

  getRandomTeacherContractData() {
    this.formData = [];
    this.templateStep = [];
    // NEED QUERY GetOneRandomStudentAdmissionProcess for TEACHER CONTRACT
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.GetOneRandomContractProcess(this.formDetail.templateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.formData = resp;
          resp.steps.forEach((step) => {
            if (step && step.length !== 0) {
              this.templateStep.push(step);
            }
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

  onAskForRevision() {
    // NEED DIALOG ASK FOR REVISION...... THIS IS COPY FORM V2** PLEASE REMOVE IF DONE
    this.subs.sink = this.dialog
      .open(RevisionBoxContractDialogComponent, {
        minWidth: '800px',
        panelClass: 'no-padding',
        disableClose: true,
        data: {
          formData: this.formDetail,
          existingMessages: this.formDetail.revise_request_messages ? this.formDetail.revise_request_messages : null,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.triggerRefresh.emit(this.formDetail.formId);
        }
      });
  }

  onCompleteRevision() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.acceptContractProcessStep(this.formDetail.templateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.triggerRefresh.emit(this.formDetail.templateId);
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

  validateForm() {
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('UserForm_S10.TITLE'),
      html: this.translate.instant('UserForm_S10.TEXT'),
      confirmButtonText: this.translate.instant('UserForm_S10.CONFIRM'),
      cancelButtonText: this.translate.instant('UserForm_S10.CANCEL'),
      showCancelButton: true,
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: true,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('UserForm_S10.CONFIRM') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('UserForm_S10.CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      if (res.value) {
        // NEED QUERY validateStudentAdmissionProcess for TEACHER CONTRACT
        this.subs.sink = this.contractService.ValidateContractProcess(this.formDetail.formId).subscribe(
          (ress) => {
            if (ress) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then((resss) => {
                this.triggerRefresh.emit(this.formDetail.formId);
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
      } else {
        return;
      }
    });
  }

  getDocumentSelectedUrl(index: number) {
    return this.documentExpectedDisplays.find((doc) => doc.stepIndex === index).selectedDocumentUrl || null;
  }

  setDocumentDisplayed(stepIndex: number, docUrl: string) {
    const docIndex = this.documentExpectedDisplays.findIndex((doc) => doc.stepIndex === stepIndex);
    if (docIndex >= 0) {
      this.documentExpectedDisplays[docIndex].selectedDocumentUrl = this.setPreviewUrl(docUrl);
    }
  }

  submitForm() {
    this.isWaitingForResponse = true;
    this.contractService.ValidateContractProcess(this.formDetail.formId).subscribe(
      (ressp) => {
        this.isWaitingForResponse = false;
        if (ressp) {
          this.triggerRefresh.emit(this.formIdURL);
        } else {
          this.triggerRefresh.emit(this.formIdURL);
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.triggerRefresh.emit(this.formIdURL);
        this.isWaitingForResponse = false;
      },
    );
  }

  renderMultiple(entities: any) {
    let answer = '';
    let count = 0;
    if (entities && entities.length) {
      for (const entity of entities) {
        count++;
        if (count > 1) {
          if (entity) {
            answer = answer + ', ';
            answer = answer + entity;
          }
        } else {
          if (entity) {
            answer = answer + entity;
          }
        }
      }
    }
    return answer;
  }

  // Swal for complete revision
  swalCompleteRevision() {
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('UserForm_S5.TITLE'),
      html: this.translate.instant('UserForm_S5.TEXT'),
      confirmButtonText: this.translate.instant('UserForm_S5.CONFIRM'),
      cancelButtonText: this.translate.instant('UserForm_S5.CANCEL'),
      showCancelButton: true,
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: true,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('UserForm_S5.CONFIRM') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('UserForm_S5.CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      if (res.value) {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((res) => {
          return;
        });
      } else {
        return;
      }
    });
  }

  setPreviewUrl(url) {
    if (!url) {
      return null;
    }
    const result = this.serverimgPath + url + '#view=fitH';
    const previewURL = this.cleanUrlFormat(result);
    return previewURL;
  }

  cleanUrlFormat(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  downloadPDF() {
    // NEED QUERY generateAdmissionProcessSumarry for TEACHER CONTRACT
    this.isLoading = true;
    this.subs.sink = this.contractService.GeneratePreContractFormSummaryPDF(this.formDetail.formId).subscribe(
      (data) => {
        if (data) {
          const link = document.createElement('a');
          link.setAttribute('type', 'hidden');
          link.href = `${environment.apiUrl}/fileuploads/${data}`.replace('/graphql', '');
          link.target = '_blank';
          link.click();
          link.remove();
        }
        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        }).then(() => {});
      },
    );
  }

  rejectAndStopProcess() {
    let timeDisabled = 10;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('StopProcess.TITLE'),
      html: this.translate.instant('StopProcess.TEXT'),
      confirmButtonText: this.translate.instant('StopProcess.CONFIRM'),
      cancelButtonText: this.translate.instant('StopProcess.CANCEL'),
      showCancelButton: true,
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: true,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('StopProcess.CONFIRM') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('StopProcess.CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      if (res.value) {
        clearTimeout(this.timeOutVal);
        this.isWaitingForResponse = true;
        if (this.formDetail.formType === 'teacher_contract') {
          this.contractService.RejectAndStopContractProcess(this.formIdURL).subscribe((resp) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((ress) => {
              this.router.navigate(['/teacher-contract/contract-management']);
            });
          });
        } else if (this.formDetail.formType === 'fc_contract') {
          this.contractService.RejectAndStopFCContractProcess(this.formIdURL).subscribe((resp) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((ress) => {
              this.router.navigate(['/contract-follow-up']);
            });
          });
        }
      } else {
        clearTimeout(this.timeOutVal);
        return;
      }
    });
  }
}
