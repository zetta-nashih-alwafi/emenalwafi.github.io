import { FormFillingService } from 'app/form-filling/form-filling.service';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { ApplicationUrls } from 'app/shared/settings';
import { DomSanitizer } from '@angular/platform-browser';
import { SubSink } from 'subsink';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/service/auth-service/auth.service';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilderService } from 'app/service/form-builder/form-builder.service';
import { StepDynamicMessageDialogComponent } from 'app/shared/components/step-dynamic-message-dialog/step-dynamic-message-dialog.component';
import { RefuseToSignComponent } from './refuse-to-sign/refuse-to-sign.component';
@Component({
  selector: 'ms-form-fill-contract-singing-process',
  templateUrl: './form-fill-contract-singing-process.component.html',
  styleUrls: ['./form-fill-contract-singing-process.component.scss'],
})
export class FormFillContractSingingProcessComponent implements OnInit, OnDestroy {
  @Input() formDetail: any;
  @Input() formData: any;
  @Input() userData: any;
  @Input() stepData: any;
  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  myInnerHeight = 600;
  documentOnPreviewUrl: any;

  private subs = new SubSink();
  isWaitingForResponse = false;
  isWaitingForResponseDocu = false;
  userId: any;
  currentUser: any;
  currentUserTypeId: any;
  timeOutVal: any;
  formId: any;
  isCheck = false;
  isValidator = false;
  enabledButton = false;
  linkPdf = null;
  event = '';
  isRevisionUser: any;
  disable = true;
  isUsingStepMessage = false;
  userTypeId;

  constructor(
    public sanitizer: DomSanitizer,
    public router: Router,
    private route: ActivatedRoute,
    private userService: AuthService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private formFillingService: FormFillingService,
    private formBuilderService: FormBuilderService,
  ) {}

  ngOnInit() {
    this.checkStepNotificationOrMessage();
    this.formId = this.route.snapshot.queryParamMap.get('formId');
    this.userId = this.route.snapshot.queryParamMap.get('userId');
    this.userTypeId = this.route.snapshot.queryParamMap.get('userTypeId');
    this.event = this.route.snapshot.queryParamMap.get('event');

    if (!this.formDetail.isPreview) {
      this.checkDisableForm();
    }
    if (this.event && this.event === 'signing_complete') {
      this.isCheck = true;
      this.updateSign();
    }
    this.getUser();
    if (this.formDetail && this.formDetail.isPreview && this.formDetail.templateId) {
      this.getOneFormBuilder();
    } else {
      if (!this.event || this.event !== 'signing_complete') {
        if (this.stepData && this.stepData.form_builder_step && this.stepData.form_builder_step._id && this.stepData._id) {
          this.getTemplatePDF(this.stepData.form_builder_step._id);
        }
      }
    }
  }
  checkStatusReject(){
    if(this.formDetail?.formType === 'fc_contract'  && (this.event === 'decline' || this.formData?.contract_status === 'reject_and_stop')){
      return true;
    }else{
      return false
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  getOneFormBuilder() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.getOneFormBuilder(this.formDetail.templateId).subscribe(
      (resp) => {
        if (resp) {
          if (resp.steps && resp.steps.length) {
            const steps = _.cloneDeep(resp.steps);
            const find = steps.find((step) => step.step_title === this.stepData.step_title);
            if (find) {
              this.getTemplatePDF(find._id);
            } else {
              this.isWaitingForResponse = false;
            }
          } else {
            this.isWaitingForResponse = false;
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
  isUser() {
    let isUser = false;
    if (this.stepData && this.stepData.contract_signatory_status && this.stepData.contract_signatory_status.length) {
      const signatory = this.stepData.contract_signatory_status.filter((sig) => !sig.is_already_sign);
      if (signatory?.length){
        if(signatory[0]?.user_id?._id === this.userId && signatory[0]?.user_type_id?._id === this.formDetail?.userTypeId && !signatory[0]?.is_already_sign){
          isUser = true;
        } else if (!signatory[0]?.user_id) {
          if ((this.stepData?.user_recipient_signatory?.user_id?._id === this.userId ||
            this.stepData?.user_recipient_signatory?.teacher_id?._id === this.userId) &&
            !this.stepData?.user_recipient_signatory?.is_already_sign
          ) {
            isUser = true;
          }
        }
      }
    }
    return isUser;
  }
  isRecipient() {
    let isUser = false;
    if (
      this.stepData &&
      this.stepData.user_recipient_signatory &&
      ((this.stepData.user_recipient_signatory.user_id && this.stepData.user_recipient_signatory.user_id._id === this.userId) ||
        (this.stepData.user_recipient_signatory.teacher_id && this.stepData.user_recipient_signatory.teacher_id._id === this.userId)) &&
      !this.stepData.user_recipient_signatory.is_already_sign
    ) {
      isUser = true;
    }
    return isUser;
  }
  checkStepNotificationOrMessage() {
    if (
      this.formDetail &&
      this.formDetail.templateId &&
      this.stepData &&
      this.stepData.form_builder_step &&
      typeof this.stepData._id === 'string' &&
      typeof this.formDetail.formId === 'string' &&
      typeof this.formDetail.templateId === 'string' &&
      typeof this.stepData.form_builder_step._id === 'string'
    ) {
      const formBuilderID = this.formDetail.templateId;
      const formBuilderStepID = this.stepData.form_builder_step._id;
      const pagination = { limit: 20, page: 0 };

      this.isWaitingForResponse = true;
      this.subs.sink = this.formBuilderService.getAllStepNotificationsAndMessages(formBuilderID, formBuilderStepID, pagination).subscribe(
        (response) => {
          this.isWaitingForResponse = false;
          if (response && response.length) {
            this.isUsingStepMessage = !!response.find((item) => item && item.type && item.type === 'message');
          } // default value of isUsingStepMessage is false so no need an else block
        },
        (error) => {
          this.isWaitingForResponse = false;
          console.error(error);
        },
      );
    }
  }

  getUser() {
    this.currentUser = this.userService.getLocalStorageUser();
    if (this.currentUser && this.currentUser.length) {
      const isPermission = this.userService.getPermission();
      const currentUserEntity = this.currentUser.entities.find((resp) => resp.type.name === isPermission[0]);
      this.currentUserTypeId = currentUserEntity?.type?._id;
    }
  }

  getContractProcess() {
    this.isWaitingForResponse = true;
    this.formFillingService.getOneFormProcessStep(this.stepData._id).subscribe((resp) => {
      if (resp) {
        if (resp.form_builder_step && resp.form_builder_step._id) {
          this.getTemplatePDF(resp.form_builder_step._id);
        }
      }
      this.isWaitingForResponse = false;
    });
  }

  getTemplatePDF(templateId) {
    this.isWaitingForResponse = true;
    const preview = this.formDetail && this.formDetail.isPreview ? true : false;
    this.formFillingService
      .generateFormBuilderContractTemplatePDF(templateId, preview, this.translate.currentLang, this.stepData._id)
      .subscribe(
        (resp) => {
          if (resp) {
            this.linkPdf = resp;
            this.setPreviewUrl(this.serverimgPath + resp);
          }
          this.isWaitingForResponse = false;
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

  checkDisableForm() {
    if (this.stepData.isCompletingUser) {
      if (
        this.stepData.step_status === 'not_started' ||
        this.stepData.step_status === 'ask_for_revision' ||
        (this.formDetail &&
          (this.formDetail.formType === 'student_admission' || this.formDetail.formType === 'teacher_contract') &&
          this.formDetail.admission_status &&
          this.formDetail.admission_status === 'ask_for_revision') ||
        (this.formDetail &&
          this.formDetail.formType === 'fc_contract' &&
          this.formDetail.contract_status &&
          this.formDetail.contract_status === 'ask_for_revision') ||
        (this.stepData.step_status === 'accept' && this.formDetail.is_final_validator_active && !this.formDetail.admission_status)
      ) {
        if(this.formDetail?.is_form_closed) {
          this.disable = true;
        } else {
          this.disable = false;
        }
      } else {
        this.disable = true;
      }
    }
    if (!this.userData) {
      return;
    }
    this.isValidator = !!this.userData.entities.find((ent) => {
      if (
        ent &&
        ent.type &&
        this.stepData.is_validation_required &&
        this.stepData.validator &&
        ent.type._id === this.stepData.validator._id
      ) {
        return true;
      } else {
        return false;
      }
    });
    this.isRevisionUser = this.userData.entities.find((ent) => {
      if (ent && ent.type && this.stepData.revision_user_type && ent.type._id === this.stepData.revision_user_type) {
        return true;
      } else {
        return false;
      }
    });
    if (this.isValidator && !this.stepData.isCompletingUser) {
      if (this.stepData.step_status === 'need_validation') {
        this.disable = false;
      } else {
        this.disable = true;
      }
    }
  }

  onSubmitSignature() {
    if (this.checkFormValidity()) {
      let thisUserHasSigned = false;
      if (this.userId === this.formId) {
        if (this.stepData.user_recipient_signatory && this.stepData.user_recipient_signatory.is_already_sign) {
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
        if (this.stepData && this.stepData.contract_signatory_status && this.stepData.contract_signatory_status.length) {
          this.stepData.contract_signatory_status.forEach((element) => {
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
        }
      });
    }
  }

  checkFormValidity(): boolean {
    this.isCheck = true;
    if (this.stepData && this.stepData.contract_signatory_status && this.stepData.contract_signatory_status.length) {
      this.stepData.contract_signatory_status.forEach((element) => {
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

  checkAllUserAlreadySubmit(id, type?) {
    let isSigned = false;
    const receiverStatus =
      this.stepData && this.stepData.user_recipient_signatory && this.stepData.user_recipient_signatory.is_already_sign
        ? this.stepData.user_recipient_signatory
        : false;
    const contractSignatory = this.stepData.contract_signatory_status;
    if (contractSignatory && contractSignatory.length) {
      // Not using forEach or filter for easy breaking loop
      for (let i = contractSignatory.length - 1; i >= 0; i--) {
        if (contractSignatory[i] && !contractSignatory[i].is_already_sign) {
          isSigned = false;
          break;
        } else {
          isSigned = true;
        }
      }
    }
    return isSigned && receiverStatus;
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
    const domainUrl = location.origin;
    const url = `${domainUrl}/form-fill?formId=${this.formId}&formType=${this.formDetail.formType}&userId=${this.userId}&userTypeId=${this.userTypeId}`;
    this.subs.sink = this.formFillingService.getContractProcessURL(this.stepData._id, this.formId, url).subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          if (resp !== 'false') {
            window.location.href = resp;
          }
        } else {
          this.triggerRefresh.emit(this.formId);
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

  signingReceiver() {
    this.isWaitingForResponse = true;
    const domainUrl = location.origin;
    const url = `${domainUrl}/form-fill?formId=${this.formId}&formType=${this.formDetail.formType}&userId=${this.userId}&userTypeId=${this.userTypeId}`;
    this.subs.sink = this.formFillingService.getContractProcessURL(this.stepData._id, this.formId, url).subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          if (resp !== 'false') {
            window.location.href = resp;
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

  updateSign() {
    this.isWaitingForResponse = true;
    this.isWaitingForResponseDocu = true;
    this.subs.sink = this.formFillingService.acceptFormProcessStep(this.formId, this.stepData._id).subscribe(
      (resssp) => {
        this.isWaitingForResponse = false;
        this.isWaitingForResponseDocu = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('DOCUSIGN_S1.TITLE'),
          html: this.translate.instant('DOCUSIGN_S1.TEXT'),
          confirmButtonText: this.translate.instant('DOCUSIGN_S1.BUTTON'),
        })
          .then(() => {
            if (
              this.formDetail &&
              this.stepData &&
              this.stepData.form_builder_step &&
              typeof this.stepData._id === 'string' &&
              typeof this.formDetail.formId === 'string' &&
              typeof this.stepData.form_builder_step._id === 'string'
            ) {
              const stepID = this.stepData.form_builder_step._id;
              const formProcessID = this.formDetail.formId;
              const isPreview = typeof this.formDetail.isPreview === 'boolean' ? this.formDetail.isPreview : false;
              return this.formBuilderService.generateFormBuilderStepMessage(stepID, formProcessID, isPreview, 'send').toPromise();
            }
          })
          .then((resp) => {
            if (resp) {
              return this.dialog
                .open(StepDynamicMessageDialogComponent, {
                  width: '600px',
                  minHeight: '100px',
                  panelClass: 'certification-rule-pop-up',
                  disableClose: true,
                  data: {
                    step_id: this.stepData.form_builder_step._id,
                    form_process_id: this.formDetail.formId,
                    is_preview: typeof this.formDetail.isPreview === 'boolean' ? this.formDetail.isPreview : false,
                    dataPreview: null,
                    triggerCondition: 'send',
                  },
                })
                .afterClosed()
                .toPromise();
            }
          })
          .then(() => {
            // instead emitting triggerRefresh, we need to reload the page to remove query param EVENT so update signing, not called every time
            const domainUrl = location.origin;
            const url = `${domainUrl}/form-fill?formId=${this.formId}&formType=${this.formDetail.formType}&userId=${this.userId}&userTypeId=${this.userTypeId}`;
            window.location.href = url;
          })
          .catch((error) => {
            this.isWaitingForResponse = false;
            this.isWaitingForResponseDocu = false;
            console.error(error);
          });
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.isWaitingForResponseDocu = false;
        if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('LEGAL_S5.Title'),
            text: this.translate.instant('LEGAL_S5.Text'),
            confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
          });
        } else if (
          err['message'] === 'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
          err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')
        ) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('EUROPEAN_COUNTRIES.TITLE'),
            html: this.translate.instant('EUROPEAN_COUNTRIES.TEXT'),
            confirmButtonText: this.translate.instant('EUROPEAN_COUNTRIES.BUTTON'),
          });
        } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('IBAN_S1.Title'),
            text: this.translate.instant('IBAN_S1.Text'),
            confirmButtonText: this.translate.instant('IBAN_S1.Button'),
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  userSigned() {
    let disabled = false;
    if (this.stepData && this.stepData.contract_signatory_status && this.stepData.contract_signatory_status.length) {
      this.stepData.contract_signatory_status.forEach((element) => {
        if (element?.user_id?._id === this.userId && element.is_already_sign) {
          disabled = true;
        }
      });
    }
    return disabled;
  }
  expand() {
    window.open(this.serverimgPath + this.linkPdf, '_blank').focus();
  }
  onRefuseToSign() {
    this.dialog
      .open(RefuseToSignComponent, {
        minWidth: '800px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        autoFocus: false,
        data: {
          formId: this.formDetail?.formId,
          stepId: this.stepData?._id,
          userId: this.formDetail?.userId,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if(result){
          this.triggerRefresh.emit(this.formId)
        }
      });
  }
}
