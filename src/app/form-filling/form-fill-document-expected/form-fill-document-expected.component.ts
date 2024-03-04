import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ApplicationUrls } from 'app/shared/settings';
import { map, switchMap, take } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { FormFillingService } from '../form-filling.service';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { FormFillingRevisionDialogComponent } from '../form-filling-revision-dialog/form-filling-revision-dialog.component';
import { FormBuilderService } from 'app/service/form-builder/form-builder.service';
import { StepDynamicMessageDialogComponent } from 'app/shared/components/step-dynamic-message-dialog/step-dynamic-message-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'ms-form-fill-document-expected',
  templateUrl: './form-fill-document-expected.component.html',
  styleUrls: ['./form-fill-document-expected.component.scss'],
})
export class FormFillDocumentExpectedComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  _stepData;
  @Input() currentStepIndex;
  isRevisionUser: any;
  isPageLoading: boolean;
  documentStep: any;
  is_document_validated = false;
  @Input() userData: any;
  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();
  @Input() formDetail: any;
  @Input() formData: any;
  uploadedFile: File;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  documentOnPreviewUrl: any;

  displayedColumn = ['document', 'status', 'action'];
  dataSource = new MatTableDataSource([]);
  isWaitingForResponse = true;
  noData: any;
  dataCount: any;
  timeOutVal: any;
  subs = new SubSink();

  disable = true;
  isValidated = false;
  isValidator = false;
  formId: any;
  isUsingStepMessage = false;
  isAccepted = false;
  messageDialogRef: MatDialogRef<StepDynamicMessageDialogComponent>;

  currentUser = null;
  userId = null;
  userMainId = null;
  isAllDocumentValidated = false;
  @Input() set stepData(value: any) {
    if (value) {
      this._stepData = value;
      this.populateDocumentTables(this._stepData);
    }
  }
  //*************** */ ERP_052 static documents for translate
  staticDocumentList = [
    'Baccalauréat ou équivalent',
    'Justificatif / attestation validant 60 ECTS ou équivalent',
    'Justificatif / attestation validant 120 ECTS ou équivalent',
    'Justificatif / attestation validant 180 ECTS ou équivalent',
    'Justificatif / attestation validant 240 ECTS ou équivalent',
    'Pièces d\'identité'
  ]
  get stepData() {
    return this._stepData;
  }

  constructor(
    private fileUploadService: FileUploadService,
    public sanitizer: DomSanitizer,
    private translate: TranslateService,
    private utilService: UtilityService,
    private formFillingService: FormFillingService,
    private formBuilderService: FormBuilderService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit() {
    // console.log('isReceiver', this.isReceiver);
    this.formId = this.route.snapshot.queryParamMap.get('formId');
    this.checkStepNotificationOrMessage();
    if (!this.formDetail.isPreview) {
      this.checkDisableForm();
    }
    this.checkFormAccept();
  }

  checkStepNotificationOrMessage() {
    console.log('FORM DETAIL', this.formDetail);
    console.log('STEP DATA', this.stepData);
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

    const idAcadDir = '617f64ec5a48fe2228518812';
    // in admission document acadDir can validate even if not set as validator
    if (
      this.formDetail.userTypeId &&
      this.formDetail.userTypeId === idAcadDir &&
      this.formDetail.formType &&
      this.formDetail.formType === 'admissionDocument'
    ) {
      this.isValidator = true;
    } else {
      if (this.userData && this.userData.entities) {
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
      }
    }
    console.log('isValidator', this.isValidator);

    if (this.userData && this.userData.entities) {
      this.isRevisionUser = this.userData.entities.find((ent) => {
        if (ent && ent.type && this.stepData.revision_user_type && ent.type._id === this.stepData.revision_user_type) {
          return true;
        } else {
          return false;
        }
      });
    }

    if (this.isValidator && !this.stepData.isCompletingUser) {
      if (
        this.stepData.step_status === 'need_validation' ||
        (this.stepData.step_status === 'ask_for_revision' &&
          this.formDetail.admission_status &&
          this.formDetail.admission_status !== 'ask_for_revision')
      ) {
        this.disable = false;
      } else {
        this.disable = true;
      }
    }

    // console.log('_user', this.isReceiver, this.stepData, this.isValidator, this.userData);
  }

  // isDocumentRequired() {
  //   const data = _.cloneDeep(this.dataSource.data);
  //   let required = false;
  //   console.log("document being checked here is:", data);
  //   for (const document of data) {
  //     if (document && document.is_required && this.isRequiredDocumentsUploaded()) {
  //       required = true;
  //     }
  //   }
  //   return required;
  // }

  checkAllValidationStatus(documents?) {
    if (documents && documents.length) {
      const isAllValidated = documents.every((document) => document?.document_validation_status === 'validated');
      this.isAllDocumentValidated = isAllValidated;      
    }
  }

  populateDocumentTables(formData) {
    if (!formData && !formData.segments && !formData.segments.length) {
      return;
    }
    let documents = formData.segments.map((segment) => segment.questions).flat();
    documents = documents.map((res) => {
      if (res.document_validation_status === null) {
        this.isValidated = false;
        res.document_validation_status = 'not_validated';
        return res;
      } else {
        this.isValidated = res.document_validation_status === 'validated' ? true : false;
        return res;
      }
    });

    // *************** mapping and assign documents
    const tempDocumentData = [];
    documents = (documents || []).map((data) => {
      if(data?.question_label) {
        tempDocumentData.push(data);
      } else {
        data.is_required = false;
      }
    });

    this.documentStep = tempDocumentData;
    console.log(tempDocumentData);
    console.log('Ini Documents:::::', tempDocumentData);
    this.checkAllValidationStatus(tempDocumentData);
    this.dataSource.data = tempDocumentData;
    this.isWaitingForResponse = false;
    this.dataCount = tempDocumentData.length;
    this.dataSource.paginator = this.paginator;
    this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
  }

  onPreviewDocument(element) {
    const serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
    const result = serverimgPath + element.url + '#view=fitH';
    this.documentOnPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(result);
  }

  chooseFile(fileInput: Event, element) {
    let acceptable = [];
    if (this.formDetail.formType === 'admissionDocument' || this.formDetail.formType === 'one_time_form') {
      acceptable = ['pdf', 'png', 'jpg', 'jpeg'];
    } else {
      acceptable = ['pdf'];
    }
    const file = (<HTMLInputElement>fileInput.target).files[0];
    if (!file) {
      return;
    }
    const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
    if (acceptable.includes(fileType)) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          console.log('_resp upload', resp);

          if (resp) {
            this.patchAnswerWithUploadedFile(element._id, resp.s3_file_name);
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          console.log('[Response BE][Error] : ', err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: 'OK',
          });
        },
      );
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
        text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: acceptable }),
        allowEscapeKey: false,
        allowOutsideClick: false,
        allowEnterKey: false,
      });
    }
  }

  patchAnswerWithUploadedFile(questionId: string, fileName: string) {
    const indexOfSegment = this.stepData.segments.findIndex((segment) => this.hasQuestion(segment, questionId));
    if (indexOfSegment >= 0) {
      const questionIndex = this.stepData.segments[indexOfSegment].questions.findIndex((question) => question._id === questionId);
      if (questionIndex >= 0) {
        this.stepData.segments[indexOfSegment].questions[questionIndex].answer = fileName;
        // if the validator is student (when user is both receiver and validator), auto select the status to be validated
        if (this.stepData.is_validation_required && !(this.stepData.isCompletingUser && this.isValidator)) {
          this.stepData.segments[indexOfSegment].questions[questionIndex].document_validation_status = 'waiting_for_validation';
        } else {
          this.stepData.segments[indexOfSegment].questions[questionIndex].document_validation_status = 'validated';
          this.stepData.segments[indexOfSegment].questions[questionIndex].is_document_validated = true;
        }
        this.saveUpdatedData(this.stepData);
      }
    }
  }

  hasQuestion(segment: any, questionId: string) {
    return !!segment.questions.find((question) => question._id === questionId);
  }

  setDocumentOnPreviewUrl(element) {
    if (element.answer) {
      const result = this.serverimgPath + element.answer + '#view=fitH';
      this.documentOnPreviewUrl = this.cleanUrlFormat(result);
    } else {
      this.documentOnPreviewUrl = null;
    }
  }

  cleanUrlFormat(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  createPayload(stepData) {
    const payload = stepData;
    delete payload.revise_request_messages;
    if (payload && payload.validator && payload.validator._id) {
      payload.validator = payload.validator._id;
    }
    delete payload.form_builder_step;
    delete payload.is_only_visible_based_on_condition;
    delete payload.step_status;
    delete payload.user_who_complete_step;
    delete payload.isCompletingUser;
    delete payload.contract_signatory_status;
    if ((payload && !payload.user_validator) || (payload.user_validator && payload.user_validator._id)) {
      delete payload.user_validator;
    }
    if (payload && payload.form_builder_step && payload.form_builder_step._id) {
      payload.form_builder_step = payload.form_builder_step._id;
    }
    return payload;
  }

  saveUpdatedData(stepDataInput: any, isLoading?) {
    if (isLoading) {
      this.isWaitingForResponse = true;      
    } else {
      this.isPageLoading = true;
    }
    const payload = this.createPayload(_.cloneDeep(stepDataInput));
    this.formFillingService.createUpdateFormProcessStepAndQuestion(payload).subscribe((resp) => {
      if (isLoading) {
        this.isWaitingForResponse = false;
        if (resp) {
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
        }
      } else {
        this.isPageLoading = false;
      }
      this.populateDocumentTables(this.stepData); // force update table with new data
      this.triggerRefresh.emit(this.formDetail.formId);
      // Need to refresh if upload in the revision status. This will also update the summary.
      // console.log(this.formDetail);
      // if (this.formDetail && this.formDetail.admission_status === 'ask_for_revision') {
      //   this.triggerRefresh.emit(this.formDetail.formId);
      // }
    }, err => {
      this.isWaitingForResponse = false;
      this.isPageLoading = false;
    });
  }

  saveUpdatedDataAdmissionDoc(stepDataInput: any, isLoading?) {
    if (isLoading) {
      this.isWaitingForResponse = true;
    }

    if (!isLoading) {
      this.isPageLoading = true;
    }
    const payload = this.createPayload(_.cloneDeep(stepDataInput));
    this.subs.sink = this.formFillingService.createUpdateAdmissionDocumentProcessStepAndQuestion(payload).subscribe(
      (resp) => {
        if (isLoading) {
          this.isWaitingForResponse = false;
          if (resp) {
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
          }
        }
        if (!isLoading) {
          this.isPageLoading = false;
        }
        this.populateDocumentTables(this.stepData); // force update table with new data
        // Need to refresh if upload in the revision status. This will also update the summary.
        // console.log(this.formDetail);
        // if (this.formDetail && this.formDetail.admission_status === 'ask_for_revision') {
        //   this.triggerRefresh.emit(this.formDetail.formId);
        // }
      },
      (err) => {
        this.isPageLoading = false;
        this.isWaitingForResponse = false;
      },
    );
  }

  onAskForRevision() {
    const payload = this.createPayload(_.cloneDeep(this.stepData));
    if (payload && payload.segments && payload.segments.length > 0) {
      // Reset status document to not validated
      // *************** Improvement ERP_052 remove reset status docuement validated when reject ask revision
      payload.segments.forEach((seg) => {
        seg.questions.forEach((ques) => {
          if (ques && ques.document_validation_status && ques.document_validation_status === 'waiting_for_validation') {
            ques.document_validation_status = 'not_validated';          
          }
        });
      });
    }     

    this.isPageLoading = true;
    this.subs.sink = this.formFillingService.createUpdateFormProcessStepAndQuestion(payload).subscribe(
      (resp) => {
        if (resp) {
          this.isPageLoading = false;
          this.subs.sink = this.dialog
            .open(FormFillingRevisionDialogComponent, {
              minWidth: '800px',
              panelClass: 'no-padding',
              disableClose: true,
              data: {
                formData: this.formDetail,
                stepId: this.stepData._id,
                existingMessages: this.stepData.revise_request_messages ? this.stepData.revise_request_messages : null,
              },
            })
            .afterClosed()
            .subscribe((ressp) => {
              if (ressp) {
                this.triggerRefresh.emit(this.formId);
                console.log(ressp);
              }
            });
        }
      },
      (err) => {
        this.isPageLoading = false;
        this.isWaitingForResponse = false;
      },
    );
  }

  // onAskForRevision() {
  //   this.subs.sink = this.dialog
  //     .open(FormFillingRevisionDialogComponent, {
  //       minWidth: '800px',
  //       panelClass: 'no-padding',
  //       data: {
  //         formData: this.formDetail,
  //         stepId: this.stepData.is_final_step && this.formData.is_final_validator_active ? null : this.stepData._id,
  //         existingMessages: this.stepData.revise_request_messages ? this.stepData.revise_request_messages : null,
  //         formBuilderStepId: this.stepData.form_builder_step._id,
  //       },
  //     })
  //     .afterClosed()
  //     .subscribe((resp) => {
  //       if (resp) {
  //         this.triggerRefresh.emit(this.formId);
  //         console.log(resp);
  //       }
  //     });
  // }

  onCompleteRevision() {
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('UserForm_S5.TITLE'),
      text: this.translate.instant('UserForm_S5.TEXT'),
      confirmButtonText: this.translate.instant('UserForm_S5.CONFIRM'),
      cancelButtonText: this.translate.instant('UserForm_S5.CANCEL'),
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((resp) => {
      if (resp.value) {
        // this.submitDocumentStep();
        const stepID = this.stepData.form_builder_step._id;
        const formProcessID = this.formDetail.formId;
        const isPreview = typeof this.formDetail.isPreview === 'boolean' ? this.formDetail.isPreview : false;
        const triggerCondition = 'waiting_for_validation';
        this.subs.sink = this.formBuilderService
          .generateFormBuilderStepMessage(stepID, formProcessID, isPreview, triggerCondition)
          .subscribe(
            (ressp) => {
              if (ressp) {
                this.submitDocumentStep(ressp, triggerCondition);
              } else {
                this.submitDocumentStep();
              }
            },
            (error) => {
              this.isWaitingForResponse = false;
              this.submitDocumentStep();
              console.error(error);
            },
          );
      }
    });
  }

  isRequiredDocumentsUploaded(): boolean {
    const data = _.cloneDeep(this.dataSource.data);
    let validate = true;
    if (data.every((document) => document.is_document_validated)) {
      return true;
    }
    for (const document of data) {
      if (
        document &&
        document.is_required &&
        !document.answer &&
        document.document_validation_status &&
        document.document_validation_status === 'not_validated'
      ) {
        validate = false;
        return false;
      } else if (
        document &&
        document.is_required &&
        document.answer &&
        document.document_validation_status &&
        document.document_validation_status === 'not_validated'
      ) {
        validate = false;
        return false;
      }
    }
    // console.log('validate',validate);
    return validate;
  }

  validateButtonStep(): boolean {
    const data = this.dataSource.data;
    // console.log(data);
    const isSomeNotValidate = data.every((document) => document.is_document_validated === true);
    // console.log('isSome Validate',isSomeNotValidate);
    return !isSomeNotValidate;
  }

  validateDocument(document, status?) {
    document.is_document_validated = status === 'validated' ? true : false;
    document.document_validation_status = status;
    this.saveUpdatedData(this.stepData, false);    
  }

  // validateDocument(document, event) {
  //   event && event.preventDefault();
  //   document.is_document_validated = !document.is_document_validated;
  //   if (document.document_validation_status === 'validated') {
  //     document.document_validation_status = 'not_validated';
  //   } else {
  //     document.document_validation_status = 'validated';
  //   }
  //   this.saveUpdatedDataAdmissionDoc(this.stepData, false);
  // }

  saveDataOnFinalRevision() {
    const payload = {
      _id: this.stepData._id,
    };
    this.saveUpdatedData(payload);
  }

  async submitDocumentStep(message?, condition?) {
    if (!(await this.checkIfRequiredDocumentUploaded())) {
      return;
    }
    this.isPageLoading = true;
    this.subs.sink = this.formFillingService.acceptFormProcessStep(this.formId, this.stepData._id).subscribe(
      (resp) => {
        this.isPageLoading = false;
        console.log(resp);
        if (
          (this.stepData &&
            this.stepData.is_validation_required &&
            this.stepData.validator &&
            this.stepData.validator.name === 'Student') ||
          !this.stepData.is_validation_required
        ) {
          if (message) {
            this.isPageLoading = false;
            this.subs.sink = this.dialog
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
                  triggerCondition: condition,
                },
              })
              .afterClosed()
              .subscribe((result) => {
                if (result.type === 'cancel') {
                  return;
                }
                this.triggerRefresh.emit(this.formId);
              });
          } else {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo'),
              confirmButtonText: this.translate.instant('UserForm_S6.CONFIRM'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => this.triggerRefresh.emit(this.formId));
          }
        } else {
          if (message) {
            this.isPageLoading = false;
            this.subs.sink = this.dialog
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
                  triggerCondition: condition,
                },
              })
              .afterClosed()
              .subscribe((result) => {
                if (result.type === 'cancel') {
                  return;
                }
                this.triggerRefresh.emit(this.formId);
              });
          } else {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('UserForm_S6.TITLE'),
              text: this.translate.instant('UserForm_S6.TEXT'),
              confirmButtonText: this.translate.instant('UserForm_S6.CONFIRM'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => this.triggerRefresh.emit(this.formId));
          }
        }
      },
      (err) => {
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
        }
      },
    );
    // this.swalValidate();
  }

  async checkIfRequiredDocumentUploaded(): Promise<boolean> {
    if (!this.isRequiredDocumentsUploaded()) {
      await Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      return false;
    } else {
      return true;
    }
  }

  validateDocumentStep(message?, condition?) {
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('UserForm_S9.TITLE'),
      html: this.translate.instant('UserForm_S9.TEXT'),
      confirmButtonText: this.translate.instant('UserForm_S9.CONFIRM'),
      cancelButtonText: this.translate.instant('UserForm_S9.CANCEL'),
      showCancelButton: true,
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: true,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('UserForm_S9.CONFIRM') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('UserForm_S9.CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      if (res.value) {
        const payload = this.createPayload(_.cloneDeep(this.stepData));
        this.isPageLoading = true;
        this.subs.sink = this.formFillingService
          .createUpdateFormProcessStepAndQuestion(payload)
          .pipe(
            take(1),
            switchMap((resp) => {
              if (resp) {
                return this.formFillingService.acceptFormProcessStep(this.formId, this.stepData._id);
              } else {
                return EMPTY;
              }
            }),
          )
          .subscribe((resp) => {
            this.isPageLoading = false;
            console.log(resp);
            if (message) {
              this.isPageLoading = false;
              this.subs.sink = this.dialog
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
                    triggerCondition: condition,
                  },
                })
                .afterClosed()
                .subscribe((result) => {
                  if (result.type === 'cancel') {
                    return;
                  }
                  this.triggerRefresh.emit(this.formId);
                });
            } else {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => this.triggerRefresh.emit(this.formId));
            }
          });
      } else {
        return;
      }
    });
  }

  noDocument() {
    this.nextStepMessage('waiting_for_validation', 'submitDocumentStep');
  };

  nextStepMessage(condition, type?) {
    // StepMessageProcessDialogComponent
    this.isPageLoading = false;
    if (
      this.isUsingStepMessage &&
      this.formDetail &&
      this.formDetail.templateId &&
      this.stepData &&
      this.stepData.form_builder_step &&
      typeof this.stepData._id === 'string' &&
      typeof this.formDetail.formId === 'string' &&
      typeof this.formDetail.templateId === 'string' &&
      typeof this.stepData.form_builder_step._id === 'string'
    ) {
      const stepID = this.stepData.form_builder_step._id;
      const formProcessID = this.formDetail.formId;
      const isPreview = typeof this.formDetail.isPreview === 'boolean' ? this.formDetail.isPreview : false;
      const triggerCondition =
        condition === 'waiting_for_validation' ? (this.stepData.is_validation_required ? condition : 'validated') : condition;
      this.subs.sink = this.formBuilderService.generateFormBuilderStepMessage(stepID, formProcessID, isPreview, triggerCondition).subscribe(
        (resp) => {
          if (resp) {
            if (type === 'validateDocumentStep') {
              this.validateDocumentStep(resp, triggerCondition);
            }
            if (type === 'submitDocumentStep') {
              this.submitDocumentStep(resp, triggerCondition);
            }
          } else {
            this.isWaitingForResponse = false;
            if (type === 'validateDocumentStep') {
              this.validateDocumentStep();
            }
            if (type === 'submitDocumentStep') {
              this.submitDocumentStep();
            }
          }
        },
        (error) => {
          this.isWaitingForResponse = false;
          if (type === 'validateDocumentStep') {
            this.validateDocumentStep();
          }
          if (type === 'submitDocumentStep') {
            this.submitDocumentStep();
          }
          console.error(error);
        },
      );
    } else {
      if (type === 'validateDocumentStep') {
        this.validateDocumentStep();
      }
      if (type === 'submitDocumentStep') {
        this.submitDocumentStep();
      }
    }
    // ...
  }

  onAskForRevisionFinalValidator() {
    this.subs.sink = this.dialog
      .open(FormFillingRevisionDialogComponent, {
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

  onCompleteRevisionFinalValidator() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.acceptFormProcessStep(this.formDetail.formId, this.stepData._id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.triggerRefresh.emit(this.formDetail.formId);
        }
      },
      (err) => {
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
        }
      },
    );
  }

  onValidateFormFinalValidator() {
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
        this.subs.sink = this.formFillingService.acceptFormProcessStep(this.formDetail.formId, this.stepData._id).subscribe(
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
            if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('LEGAL_S5.Title'),
                text: this.translate.instant('LEGAL_S5.Text'),
                confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
              });
            } else if (
              err['message'] ===
                'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
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
            }
          },
        );
      } else {
        return;
      }
    });
  }

  onSubmitFormFinalVlidator() {
    this.isWaitingForResponse = true;
    this.formFillingService.acceptFormProcessStep(this.formDetail.formId, this.stepData._id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          if (
            this.formData &&
            this.formData.final_validators &&
            this.formData.final_validators.length &&
            this.formData.is_final_validator_active
          ) {
            // with validator
            Swal.fire({
              type: 'success',
              title: this.translate.instant('UserForm_S7.TITLE'),
              text: this.translate.instant('UserForm_S7.TEXT'),
              confirmButtonText: this.translate.instant('UserForm_S7.CONFIRM'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.triggerRefresh.emit(this.formDetail.formId);
              // this.router.navigate(['/']);
            });
          } else {
            // without validator
            Swal.fire({
              type: 'success',
              title: this.translate.instant('UserForm_S8.TITLE'),
              text: this.translate.instant('UserForm_S8.TEXT'),
              confirmButtonText: this.translate.instant('UserForm_S8.CONFIRM'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.triggerRefresh.emit(this.formDetail.formId);
              // this.router.navigate(['/']);
            });
          }
        }
      },
      (err) => {
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
        }
      },
    );
  }

  checkFormAccept() {
    if (
      this.formDetail.formType === 'student_admission' ||
      this.formDetail.formType === 'teacher_contract' ||
      this.formDetail.formType === 'admissionDocument' ||
      this.formDetail.formType === 'one_time_form'
    ) {
      if (this.formData && this.formData.admission_status === 'submitted') {
        this.isAccepted = true;
      } else if (this.formData && this.formData.admission_status === 'signing_process') {
        this.isAccepted = true;
      }
    } else {
      if (this.formData && this.formData.contract_status === 'submitted') {
        this.isAccepted = true;
      } else if (this.formData && this.formData.contract_status === 'sent_not_signed') {
        this.isAccepted = true;
      }
    }
  }
}
