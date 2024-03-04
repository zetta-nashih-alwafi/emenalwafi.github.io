import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { ApplicationUrls } from 'app/shared/settings';
import { DomSanitizer } from '@angular/platform-browser';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { SubSink } from 'subsink';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/service/auth-service/auth.service';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { RevisionBoxContractDialogComponent } from '../revision-box-contract-dialog/revision-box-contract-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { StepMessageProcessContractDialogComponent } from '../step-message-process/step-message-process.component';
import { environment } from 'environments/environment';
import { StepMessageProcessDialogComponent } from 'app/form-builder/step-message-process/step-message-process.component';

@Component({
  selector: 'ms-pre-contract-form-step-signing-process',
  templateUrl: './pre-contract-form-step-signing-process.component.html',
  styleUrls: ['./pre-contract-form-step-signing-process.component.scss'],
})
export class PreContractFormStepSigningProcessComponent implements OnInit {
  @Input() formDetail: any;
  @Input() formData: any;
  @Input() isReceiver: any;
  @Input() userData: any;

  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  myInnerHeight = 600;
  documentOnPreviewUrl: any;

  private subs = new SubSink();
  isWaitingForResponse = false;
  userId: any = null;
  currentUser: any;
  currentUserTypeId: any;
  timeOutVal: any;
  formId: any;
  formType: any;
  isCheck = false;
  isValidator = false;
  enabledButton = false;
  isTeacherCheck = false;
  updateDocusignContractProcess = false;
  linkPdf = null;
  formUrl = ``;
  event = '';

  hideRejectStopButtonFC: boolean = false;
  hideAskForRevisionButtonFC: boolean = false;
  candidateId: string;

  constructor(
    private contractService: TeacherContractService,
    private sanitizer: DomSanitizer,
    public router: Router,
    private route: ActivatedRoute,
    private userService: AuthService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    if (environment.apiUrl === 'https://api.erp-edh.com/graphql') {
      this.formUrl = `https://erp-edh.com/`;
    } else if (environment.apiUrl === 'https://api.poc-edh.zetta-demo.space/graphql') {
      this.formUrl = `https://poc-edh.zetta-demo.space/`;
    } else if (environment.apiUrl === 'https://api.erp-042.zetta-demo.space/graphql') {
      this.formUrl = `https://erp-042.zetta-demo.space/`;
      // this.formUrl = `http://localhost:4200/`;
    } else {
      this.formUrl = `https://zetta-staging.work/`;
      // this.formUrl = `http://localhost:7510/`;
    }
    this.formId = this.route.snapshot.queryParamMap.get('formId');
    this.userId = this.route.snapshot.queryParamMap.get('userId');
    this.event = this.route.snapshot.queryParamMap.get('event');
    this.formType = this.route.snapshot.queryParamMap.get('formType');

    this.candidateId = this.route.snapshot.queryParamMap.get('candidateId');

    // if (this.event && ((this.formId === this.userId && this.event === 'viewing_complete') || this.event === 'signing_complete')) {
    if (this.event && this.event === 'signing_complete') {
      this.isCheck = true;
      this.updateSign();
    }

    this.getUser();
    console.log(this.formDetail);
    console.log(this.formData);
    if (this.formDetail && this.formDetail.templateId) {
      this.getTemplatePDF(this.formDetail.templateId);
    } else {
      if (!this.event || this.event !== 'signing_complete') {
        if (this.formType === 'fc_contract') {
          this.getContractFCProcess();
        } else {
          this.getContractProcess();
        }
      }
    }
    // this.getTemplatePDF(this.formDetail.formId);

    if (this.formType && this.formType === 'fc_contract' && !this.formDetail.isPreview) {
      this.hideAskForRevisionButtonFC = true;
      this.hideRejectStopButtonFC = true;
    } else if (this.formType && this.formType === 'teacher_contract' && !this.formDetail.isPreview) {
      this.hideAskForRevisionButtonFC = false;
      this.hideRejectStopButtonFC = false;
    } else {
      this.hideAskForRevisionButtonFC = false;
      this.hideRejectStopButtonFC = false;
    }
  }

  getUser() {
    this.currentUser = this.userService.getLocalStorageUser();
    if (this.currentUser && this.currentUser.length) {
      const isPermission = this.userService.getPermission();
      const currentUserEntity = this.currentUser.entities.find((resp) => resp.type.name === isPermission[0]);
      this.currentUserTypeId = currentUserEntity?.type?._id;
      console.log(this.currentUser, this.currentUserTypeId);
    }
  }

  getContractFCProcess() {
    this.formData = [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.GetOneFcContractProcess(this.formDetail.formId).subscribe(
      (resp) => {
        console.log(resp);
        if (resp) {
          this.formData = _.cloneDeep(resp);
          if (this.formData && this.formData.form_builder_id && this.formData.form_builder_id._id) {
            this.getTemplatePDF(this.formData.form_builder_id._id);
          } else {
            this.isWaitingForResponse = false;
          }
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getContractProcess() {
    this.formData = [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.getOneContractProcess(this.formDetail.formId, true, this.translate.currentLang).subscribe(
      (resp) => {
        console.log(resp);
        if (resp) {
          this.formData = _.cloneDeep(resp);
          if (this.formData && this.formData.form_builder_id && this.formData.form_builder_id._id) {
            this.getTemplatePDF(this.formData.form_builder_id._id);
          } else {
            this.isWaitingForResponse = false;
          }
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getTemplatePDF(templateId) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.getContractTemplateTextTab(templateId).subscribe(
      (resp) => {
        if (resp && resp._id) {
          const preview = this.formDetail && this.formDetail.isPreview === 'true' ? true : false;
          const formId = this.formDetail && this.formDetail.formId ? this.formDetail.formId : null;

          if (this.formType && this.formType === 'teacher_contract') {
            this.subs.sink = this.contractService.generateContractTemplatePDF(resp._id, preview, formId).subscribe(
              (respn) => {
                this.isWaitingForResponse = false;
                console.log('getPDF>>', respn);
                if (respn) {
                  this.linkPdf = respn;
                  this.setPreviewUrl(this.serverimgPath + respn);
                }
              },
              (err) => {
                this.isWaitingForResponse = false;
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('SORRY'),
                  text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                  confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                });
              },
            );
          } else {
            this.subs.sink = this.contractService.generateContractTemplatePDFfC(resp._id, preview, formId).subscribe(
              (respn) => {
                this.isWaitingForResponse = false;
                console.log('getPDF>>', respn);
                if (respn) {
                  this.linkPdf = respn;
                  this.setPreviewUrl(this.serverimgPath + respn);
                }
              },
              (err) => {
                this.isWaitingForResponse = false;
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('SORRY'),
                  text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                  confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                });
              },
            );
          }
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
      },
    );
  }

  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 359;
    return this.myInnerHeight;
  }

  setPreviewUrl(url) {
    const randomData = Math.random();
    if (url) {
      this.documentOnPreviewUrl = this.cleanUrlFormat(url + '?var=' + randomData);
    }
  }

  cleanUrlFormat(url) {
    if (url) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  checkIfUserAlreadySign() {
    let contractValidator = false;
    if (this.formData && this.formData.contract_validator_signatory_status && this.formData.contract_validator_signatory_status.length) {
      const isValidator = this.formData.contract_validator_signatory_status.find(
        (user) => user.user_id._id === this.currentUser._id && this.currentUserTypeId === user.user_type_id._id,
      );
      contractValidator = isValidator && isValidator.is_already_sign ? isValidator.is_already_sign : false;
    }
    return contractValidator;
  }

  checkThisUserIsSign(data) {
    console.log('checkThisUserIsSign', data);
  }

  signForm(sign) {
    this.isCheck = sign;
  }

  signTeacherForm(sign) {
    this.isTeacherCheck = sign;
  }

  onRejectAndStop() {
    // add method when BE done
  }

  checkValidationInOrder(user, index) {
    if (!this.formData.is_contract_validator_signatory_in_order) {
      return false;
    } else {
      const validator = this.formData.contract_validator_signatory_status;
      const prev = validator[index - 1] ? validator[index - 1] : validator[index];
      if (prev.user_id._id === user.user_id._id) {
        return false;
      } else {
        if (prev.is_already_sign === true) {
          return false;
        } else {
          return true;
        }
      }
    }
  }

  onAskForRevision() {
    this.subs.sink = this.dialog
      .open(RevisionBoxContractDialogComponent, {
        minWidth: '800px',
        panelClass: 'no-padding',
        disableClose: true,
        data: {
          formData: this.formDetail,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.triggerRefresh.emit(this.formDetail.formId);
          console.log(resp);
        }
      });
  }

  onCompleteRevision() {
    // add method when BE done
  }

  itUserSignatory() {
    let showButton = true;
    if (
      this.formData &&
      this.formDetail.formId !== this.userId &&
      this.formData.contract_validator_signatory_status &&
      this.formData.contract_validator_signatory_status.length
    ) {
      const data = this.formData.contract_validator_signatory_status.find((list) => list.user_id === this.currentUser._id);
      if (data && data.length < 1) {
        showButton = false;
      }
    } else if (this.formDetail && this.formDetail.formId === this.userId) {
      showButton = true;
    }
    return showButton;
  }

  onSubmitSignature() {
    if (this.checkFormValidity()) {
      let thisUserHasSigned = false;
      if (this.userId === this.formId) {
        if (this.formData.teacher_signatory.is_already_sign) {
          thisUserHasSigned = true;
        }
        if (!thisUserHasSigned) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('Invalid_Form_Warning.TITLE'),
            html: this.translate.instant('Missing Signature'),
            confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
          });
        } else {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('DOCUSIGN_S1.TITLE'),
            html: this.translate.instant('DOCUSIGN_S1.TEXT'),
            confirmButtonText: this.translate.instant('DOCUSIGN_S1.BUTTON'),
          });
        }
      } else {
        console.log('this.formData', this.formData);
        if (
          this.formData &&
          this.formData.contract_validator_signatory_status &&
          this.formData.contract_validator_signatory_status.length
        ) {
          this.formData.contract_validator_signatory_status.forEach((element) => {
            console.log('element', element);
            if (element.user_id._id === this.userId) {
              if (element.is_already_sign) {
                thisUserHasSigned = true;
              }
            }
          });
        }
        if (!thisUserHasSigned) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('Invalid_Form_Warning.TITLE'),
            html: this.translate.instant('Missing Signature'),
            confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
          });
        } else {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('DOCUSIGN_S1.TITLE'),
            html: this.translate.instant('DOCUSIGN_S1.TEXT'),
            confirmButtonText: this.translate.instant('DOCUSIGN_S1.BUTTON'),
          });
        }
      }
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('DOCUSIGN_S2.TITLE'),
        html: this.translate.instant('DOCUSIGN_S2.TEXT'),
        confirmButtonText: this.translate.instant('DOCUSIGN_S2.BUTTON_1'),
        cancelButtonText: this.translate.instant('DOCUSIGN_S2.BUTTON_2'),
        showCancelButton: true,
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((resp) => {
        if (resp.value) {
          this.isWaitingForResponse = true;
          if (this.formDetail.formId !== this.userId) {
            this.subs.sink = this.contractService.SubmitContractProcess(this.formDetail.formId, this.userId).subscribe(
              (resssp) => {
                if (resssp) {
                  this.isWaitingForResponse = false;
                  this.openStepValidation();
                }
              },
              (err) => {
                this.triggerRefresh.emit(this.formId);
                this.isWaitingForResponse = false;
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('SORRY'),
                  text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                  confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                });
              },
            );
          } else {
            // this.router.navigate(['/session/login']); // without validator
            const payload = {
              teacher_signatory: { teacher_id: this.formDetail.formId, is_already_sign: true },
            };
            this.subs.sink = this.contractService.UpdateContractProcess(this.formDetail.formId, payload).subscribe(
              (ressp) => {
                this.subs.sink = this.contractService.SubmitContractProcessTeacher(this.formDetail.formId).subscribe(
                  (resssp) => {
                    if (resssp) {
                      this.isWaitingForResponse = false;
                      this.openStepValidation();
                    }
                  },
                  (err) => {
                    this.triggerRefresh.emit(this.formId);
                    this.isWaitingForResponse = false;
                    Swal.fire({
                      type: 'info',
                      title: this.translate.instant('SORRY'),
                      text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                      confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                    });
                  },
                );
              },
              (err) => {
                this.triggerRefresh.emit(this.formId);
                this.isWaitingForResponse = false;
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
      });
    }
  }

  openStepValidation() {
    this.subs.sink = this.dialog
      .open(StepMessageProcessDialogComponent, {
        width: '600px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          // stepId: '61e62d5a6680ee7d2b7bb205',
          stepId: null,
          isPreview: false,
          student_admission_process_id: this.formId,
        },
      })
      .afterClosed()
      .subscribe((ressp) => {
        this.triggerRefresh.emit(this.formId);
        this.getContractProcess();
      });
  }

  openStepValidationSign() {
    this.subs.sink = this.dialog
      .open(StepMessageProcessContractDialogComponent, {
        width: '600px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          pre_contract_template_step_id: null,
          contract_process_id: this.formId,
          is_preview: false,
          is_contract: true,
        },
      })
      .afterClosed()
      .subscribe((ressp) => {
        if (this.formType && this.formType === 'teacher_contract') {
          this.getContractProcess();
        } else {
          this.getContractFCProcess();
        }
      });
  }

  checkFormValidity(): boolean {
    this.isCheck = true;
    if (this.formData && this.formData.contract_validator_signatory_status && this.formData.contract_validator_signatory_status.length) {
      this.formData.contract_validator_signatory_status.forEach((element) => {
        if (!element.is_already_sign) {
          this.isCheck = false;
        }
      });
    }
    if (!this.isCheck) {
      return true;
    } else {
      return false;
    }
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
          this.contractService.RejectAndStopContractProcess(this.formId).subscribe((resp) => {
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
          this.contractService.RejectAndStopFCContractProcess(this.formId).subscribe((resp) => {
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
  checkCurrentUserAlreadySign(id, type?) {
    let isSigned = false;
    if (this.formData && this.formData.contract_validator_signatory_status && this.formData.contract_validator_signatory_status.length) {
      if (this.formDetail.formId !== id) {
        const dataSignatory = this.formData.contract_validator_signatory_status.find(
          (resp) => resp.user_id && resp.user_id._id === this.userId,
        );
        if (dataSignatory && dataSignatory.is_already_sign) {
          isSigned = true;
        } else {
          isSigned = false;
        }
      } else if (
        this.formData &&
        this.formData.teacher_signatory &&
        this.formData.teacher_signatory.is_already_sign &&
        this.formDetail.formId === this.userId
      ) {
        isSigned = true;
      } else {
        isSigned = false;
      }
    } else {
      if (
        this.formData &&
        this.formData.teacher_signatory &&
        this.formData.teacher_signatory.is_already_sign &&
        this.formDetail.formId === this.userId
      ) {
        isSigned = true;
      } else {
        isSigned = false;
      }
    }
    return isSigned;
  }

  checkCurrentUserAlreadySubmit(id, type?) {
    let isSigned = false;
    if (
      (this.formData &&
        this.formData.contract_status &&
        this.formData.contract_status === 'signing_process' &&
        this.formType &&
        this.formType === 'teacher_contract') ||
      (this.formData &&
        this.formData.contract_status &&
        this.formData.contract_status !== 'signed' &&
        this.formType &&
        this.formType === 'fc_contract')
    ) {
      isSigned = false;
    } else {
      isSigned = true;
    }
    return isSigned;
  }

  downloadPDF() {
    const link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = this.serverimgPath + this.linkPdf + '?download=true';
    link.target = '_blank';
    link.click();
    link.remove();
  }

  signingUser() {
    this.isWaitingForResponse = true;
    if (this.formType && this.formType === 'teacher_contract') {
      const url = `${this.formUrl}form-teacher-contract?formId=${this.formId}&userId=${this.userId}&formType=teacher_contract`;
      this.subs.sink = this.contractService.DocusignContractProcess(this.formId, url, this.userId).subscribe(
        (resp) => {
          if (resp) {
            this.isWaitingForResponse = false;
            window.open(resp.toString(), '_self');
          } else {
            this.triggerRefresh.emit(this.formId);
            this.isWaitingForResponse = false;
          }
        },
        (err) => {
          this.triggerRefresh.emit(this.formId);
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    } else {
      let url = '';
      if (this.userId) {
        url = `${this.formUrl}form-fc-contract?formId=${this.formId}&candidateId=${this.candidateId}&formType=fc_contract&action=edit&userId=${this.userId}`;
      } else {
        url = `${this.formUrl}form-fc-contract?formId=${this.formId}&candidateId=${this.candidateId}&formType=fc_contract&action=edit`;
      }
      this.subs.sink = this.contractService.DocusignFCContractProcess(this.formId, url, this.userId).subscribe(
        (resp) => {
          if (resp) {
            this.isWaitingForResponse = false;
            window.open(resp.toString(), '_self');
          } else {
            this.triggerRefresh.emit(this.formId);
            this.isWaitingForResponse = false;
          }
        },
        (err) => {
          this.triggerRefresh.emit(this.formId);
          this.isWaitingForResponse = false;
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

  signingTeacher() {
    this.isWaitingForResponse = true;
    const url = `${this.formUrl}form-teacher-contract?formId=${this.formId}&userId=${this.userId}&formType=teacher_contract`;
    this.subs.sink = this.contractService.DocusignContractProcess(this.formId, url).subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          window.open(resp.toString(), '_self');
        } else {
          this.triggerRefresh.emit(this.formId);
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.triggerRefresh.emit(this.formId);
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  updateSign() {
    this.isWaitingForResponse = true;
    if (this.formType && this.formType === 'teacher_contract') {
      if (this.updateDocusignContractProcess) {
        this.subs.sink = this.contractService.UpdateDocusignContractProcess(this.formId).subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            this.getContractProcess();
          },
          (err) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
            this.getContractProcess();
          },
        );
      } else {
        this.isWaitingForResponse = true;
        if (this.formDetail.formId !== this.userId) {
          this.subs.sink = this.contractService.SubmitContractProcess(this.formDetail.formId, this.userId).subscribe(
            (resssp) => {
              if (resssp) {
                this.isWaitingForResponse = false;
                this.openStepValidationSign();
              }
            },
            (err) => {
              this.isWaitingForResponse = false;
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
              this.getContractProcess();
            },
          );
        } else {
          const payload = {
            teacher_signatory: { teacher_id: this.formDetail.formId, is_already_sign: true },
          };
          this.subs.sink = this.contractService.SubmitContractProcessTeacher(this.formDetail.formId).subscribe(
            (resssp) => {
              if (resssp) {
                this.isWaitingForResponse = false;
                this.openStepValidationSign();
              }
            },
            (err) => {
              this.isWaitingForResponse = false;
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
              this.getContractProcess();
            },
          );
        }
      }
    } else {
      if (this.userId) {
        this.subs.sink = this.contractService.submitFCContractProcess(this.formDetail.formId, this.userId).subscribe(
          (resssp) => {
            if (resssp) {
              this.isWaitingForResponse = false;
              this.openStepValidationSign();
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
            this.getContractFCProcess();
          },
        );
      } else {
        this.subs.sink = this.contractService.submitFCContractProcessWithoutUserId(this.formDetail.formId).subscribe(
          (resssp) => {
            if (resssp) {
              this.isWaitingForResponse = false;
              this.openStepValidationSign();
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
            this.getContractFCProcess();
          },
        );
      }
    }
  }

  userSigned() {
    let disabled = false;
    if (this.formData && this.formData.contract_validator_signatory_status && this.formData.contract_validator_signatory_status.length) {
      this.formData.contract_validator_signatory_status.forEach((element) => {
        if (element.user_id._id === this.userId && element.is_already_sign) {
          disabled = true;
        }
      });
    }
    return disabled;
  }

  expand() {
    window.open(this.serverimgPath + this.linkPdf, '_blank').focus();
  }
}
