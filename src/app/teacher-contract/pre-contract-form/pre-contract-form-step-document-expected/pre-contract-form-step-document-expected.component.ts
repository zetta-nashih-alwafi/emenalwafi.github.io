import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { map, switchMap, take } from 'rxjs/operators';
import { ApplicationUrls } from 'app/shared/settings';
import { SubSink } from 'subsink';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'app/service/utility/utility.service';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { EMPTY } from 'rxjs';
import { RevisionBoxContractDialogComponent } from '../revision-box-contract-dialog/revision-box-contract-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import { StepMessageProcessDialogComponent } from 'app/form-builder/step-message-process/step-message-process.component';

@Component({
  selector: 'ms-pre-contract-form-step-document-expected',
  templateUrl: './pre-contract-form-step-document-expected.component.html',
  styleUrls: ['./pre-contract-form-step-document-expected.component.scss'],
})
export class PreContractFormStepDocumentExpectedComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  _stepData;
  @Input() currentStepIndex;
  isRevisionUser: any;
  isPageLoading: boolean;
  formType: string;
  @Input() set stepData(value: any) {
    if (value) {
      this._stepData = value;
      this.populateDocumentTables(this._stepData);
    }
  }
  @Input() isReceiver: any;
  @Input() userData: any;
  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();
  @Input() formDetail: any;
  @Input() formData: any;
  @Input() stepsLength: any;
  uploadedFile: File;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  documentOnPreviewUrl: any;

  get stepData() {
    return this._stepData;
  }

  displayedColumn = ['document', 'status', 'action'];
  dataSource = new MatTableDataSource([]);
  @ViewChild('fileUploadDoc', { static: false }) fileUploadDoc: any;
  isWaitingForResponse = true;
  noData: any;
  dataCount: any;
  timeOutVal: any;
  subs = new SubSink();

  disable = true;
  isValidated = false;
  isValidator = false;
  formId: any;
  userId: any;
  currentUser: any;
  currentUserId = null;

  intVal: any;

  hideRejectStopButtonFC: boolean = false;
  hideAskForRevisionButtonFC: boolean = false;

  lastStep = false;
  activeDocument;

  isAllDocumentValidated = false;

  constructor(
    private fileUploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private utilService: UtilityService,
    private contractService: TeacherContractService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private formBuilderService: FormBuilderService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    if (this.currentUser && this.currentUser._id) {
      this.currentUserId = this.currentUser._id;
    }
    this.formId = this.route.snapshot.queryParamMap.get('formId');
    this.formType = this.route.snapshot.queryParamMap.get('formType');
    this.userId = this.route.snapshot.queryParamMap.get('userId');
    if (!this.formDetail.isPreview) {
      this.checkDisableForm();
    }

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

    // console.log('stepsLength', this.stepsLength);

    if (this.stepsLength >= 0) {
      if (this.currentStepIndex === this.stepsLength) {
        this.lastStep = true;
      } else if (this.stepData && this.stepData.steps && this.stepData.steps.length === 1) {
        this.lastStep = true;
      }
      // console.log('_stepData', this.formData);
      // console.log('_currentStep', this.currentStepIndex);
      // console.log('_stepsLength', this.stepsLength);
      // console.log('_lastStep', this.lastStep);
    }
  }

  checkDisableForm() {
    console.log(this.stepData);
    console.log(this.formDetail);
    if (this.stepData.is_user_who_receive_the_form_as_validator && this.formDetail.formId === this.userId) {
      // console.log('hahaha');
      this.isReceiver = false;
      this.isValidator = true;
    } else if (this.stepData.is_user_who_receive_the_form_as_validator && this.formDetail.formId !== this.userId) {
      // console.log('hihihi');
      this.isReceiver = true;
      this.isValidator = false;
    }
    if (this.isReceiver) {
      if (
        this.stepData.step_status === 'not_started' ||
        this.stepData.step_status === 'ask_for_revision' ||
        (this.formDetail && this.formDetail.contract_status && this.formDetail.contract_status === 'ask_for_revision') ||
        (this.stepData.step_status === 'accept' && this.formDetail.is_final_validator_active && !this.formDetail.contract_status)
      ) {
        this.disable = false;
      } else {
        this.disable = true;
      }
    }

    if (!this.stepData.is_user_who_receive_the_form_as_validator) {
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

    // this.isRevisionUser = this.userData.entities.find((ent) => {
    //   if (ent && ent.type && this.stepData.revision_user_type && ent.type._id === this.stepData.revision_user_type) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // });

    if (
      this.formType === 'teacher_contract' &&
      this.stepData &&
      this.stepData.revision_contract_process &&
      this.stepData.revision_contract_process._id === this.formId
    ) {
      this.isRevisionUser = true;
    } else {
      this.isRevisionUser = false;
    }

    // if (this.userData) {
    // }
    if (this.isValidator && !this.isReceiver) {
      if (this.stepData.step_status === 'need_validation' || this.stepData.step_status === 'revision_completed') {
        this.disable = false;
      } else {
        this.disable = true;
      }
    }

    if (this.isValidator) {
      // this.disable = true;
      this.isRevisionUser = false;
      this.isReceiver = false;
    }

    console.log(this.disable);
    console.log(this.isValidator);
    console.log(this.isReceiver);
    console.log(this.isRevisionUser);
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
    console.log(documents);
    this.dataSource.data = documents;
    this.isWaitingForResponse = false;
    this.dataCount = documents.length;
    this.dataSource.paginator = this.paginator;
    this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
    this.checkAllValidationStatus();
  }

  onPreviewDocument(element) {
    const serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
    const result = serverimgPath + element.url + '#view=fitH';
    this.documentOnPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(result);
  }

  chooseFile(fileInput: Event, element) {
    this.isWaitingForResponse = true;
    const acceptable = ['pdf', 'doc'];
    const file = (<HTMLInputElement>fileInput.target).files[0];
    if (!file) {
      this.isWaitingForResponse = false;
      this.isPageLoading = false;
      return;
    }
    const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
    if (acceptable.includes(fileType)) {
      this.isPageLoading = false;
      const selectedFileSizeInGb = file.size / 100000000;
      console.log('selectedFileSizeInGb', selectedFileSizeInGb);
      // this.utilService.countFileSize(file, 100)
      if (selectedFileSizeInGb < 1) {
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (resp) => {
            console.log('_resp upload', resp);
            if (resp) {
              this.patchAnswerWithUploadedFile(element._id, resp.s3_file_name);
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            this.isPageLoading = false;
            console.log('[Response BE][Error] : ', err);
            if (err['message'].includes('ENAMETOOLONG')) {
              // ENAMETOOLONG
              Swal.fire({
                title: this.translate.instant('InterCont_S21.TITLE'),
                html: this.translate.instant('InterCont_S21.TEXT'),
                type: 'info',
                showConfirmButton: true,
                confirmButtonText: this.translate.instant('InterCont_S21.BUTTON'),
              });
            } else if (err['message'].includes('document you try to upload is too big')) {
              // document you try to upload is too big
              Swal.fire({
                title: this.translate.instant('DOCUMENT_TEACHER_S1.TITLE'),
                html: this.translate.instant('DOCUMENT_TEACHER_S1.TEXT'),
                type: 'info',
                showConfirmButton: true,
                confirmButtonText: this.translate.instant('DOCUMENT_TEACHER_S1.BUTTON'),
              });
            } else {
              this.isWaitingForResponse = false;
              this.isPageLoading = false;
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: 'OK',
              });
            }
          },
        );
      } else {
        this.isWaitingForResponse = false;
        this.isPageLoading = false;
        Swal.fire({
          title: this.translate.instant('DOCUMENT_TEACHER_S1.TITLE'),
          html: this.translate.instant('DOCUMENT_TEACHER_S1.TEXT'),
          type: 'info',
          showConfirmButton: true,
          confirmButtonText: this.translate.instant('DOCUMENT_TEACHER_S1.BUTTON'),
        });
      }
    } else {
      this.isWaitingForResponse = false;
      this.isPageLoading = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
        text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.pdf' }),
        allowEscapeKey: false,
        allowOutsideClick: false,
        allowEnterKey: false,
      });
    }
  }

  resetFileStates() {
    this.fileUploadDoc.nativeElement.value = '';
  }

  patchAnswerWithUploadedFile(questionId: string, fileName: string) {
    const indexOfSegment = this.stepData.segments.findIndex((segment) => this.hasQuestion(segment, questionId));
    if (indexOfSegment >= 0) {
      const questionIndex = this.stepData.segments[indexOfSegment].questions.findIndex((question) => question._id === questionId);
      if (questionIndex >= 0) {
        this.stepData.segments[indexOfSegment].questions[questionIndex].answer = fileName;
        // if the validator is student (when user is both receiver and validator), auto select the status to be validated
        if (this.stepData.is_validation_required && !(this.isReceiver && this.isValidator)) {
          this.stepData.segments[indexOfSegment].questions[questionIndex].document_validation_status = 'waiting_for_validation';
        } else {
          this.stepData.segments[indexOfSegment].questions[questionIndex].document_validation_status = 'validated';
          this.stepData.segments[indexOfSegment].questions[questionIndex].is_document_validated = true;
        }
        const payload = _.cloneDeep(this.stepData);
        payload.pre_contract_template_step =
          payload.pre_contract_template_step && payload.pre_contract_template_step._id ? payload.pre_contract_template_step._id : null;
        delete payload.revision_contract_process;
        delete payload.form_builder_step_id;
        this.saveUpdatedData(payload);
      } else {
        this.isWaitingForResponse = false;
        this.isPageLoading = false;
      }
    } else {
      this.isWaitingForResponse = false;
      this.isPageLoading = false;
    }
  }

  hasQuestion(segment: any, questionId: string) {
    return !!segment.questions.find((question) => question._id === questionId);
  }

  setDocumentOnPreviewUrl(element) {
    if (element.answer) {
      const result = this.serverimgPath + element.answer + '#view=fitH';
      this.documentOnPreviewUrl = this.cleanUrlFormat(result);
    }
    this.activeDocument = element._id;
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
    if (payload && payload.user_validator && payload.user_validator._id) {
      payload.user_validator = payload.user_validator._id;
    }
    return payload;
  }

  saveUpdatedData(stepDataInput: any, isLoading?) {
    if (isLoading) {
      this.isWaitingForResponse = true;
    }
    const payload = this.createPayload(_.cloneDeep(stepDataInput));
    if (payload.pre_contract_template_step && payload.pre_contract_template_step._id) {
      payload.pre_contract_template_step = payload.pre_contract_template_step._id;
    }
    // console.log('_payload', payload);
    delete payload.revision_contract_process;
    delete payload.step_status;
    if (this.formType && this.formType === 'fc_contract' && !this.formDetail.isPreview) {
      const formattedPayload = this.formatPayloadFCContract(payload);
      this.contractService.createUpdateFCContractProcessStepAndQuestion(formattedPayload).subscribe(
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
          } else {
            this.isWaitingForResponse = false;
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
          this.isWaitingForResponse = false;
          this.isPageLoading = false;
        },
      );
    } else {
      this.contractService.createUpdateContractProcessStepAndQuestion(payload).subscribe(
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
          } else {
            this.isWaitingForResponse = false;
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
          this.isWaitingForResponse = false;
          this.isPageLoading = false;
        },
      );
    }
  }

  formatPayloadFCContract(payload) {
    // format the dates
    for (const segment of payload.segments) {
      for (const question of segment.questions) {
        if (question && question._id) {
          question['form_builder_question_id'] = question._id;
          delete question._id;
        }
      }
    }
    return payload;
  }

  onAskForRevision() {
    const payload = this.createPayload(_.cloneDeep(this.stepData));
    delete payload.revision_contract_process;
    delete payload.form_builder_step_id;
    if (payload && payload.segments && payload.segments.length > 0) {
      // Reset status document to not validated
      payload.segments.forEach((seg) => {
        seg.questions.forEach((ques) => {
          if (ques && ques.document_validation_status && ques.document_validation_status !== 'validated') {
            ques.document_validation_status = 'not_validated';
          }
        });
      });
    }
    this.isPageLoading = true;

    this.contractService.createUpdateContractProcessStepAndQuestion(payload).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.isPageLoading = false;
        this.subs.sink = this.dialog
          .open(RevisionBoxContractDialogComponent, {
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
          .subscribe((resp) => {
            if (resp) {
              this.triggerRefresh.emit(this.formId);
              console.log(resp);
            }
          });
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.isPageLoading = false;
      },
    );
  }

  onCompleteRevision() {
    let timeDisabled = 3;
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
    }).then((resp) => {
      if (resp.value) {
        clearTimeout(this.timeOutVal);
        this.submitRevisionDocumentStep();
      } else {
        clearTimeout(this.timeOutVal);
        return;
      }
    });
  }

  isRequiredDocumentsUploaded() {
    const data = _.cloneDeep(this.dataSource.data);
    let validate = true;
    for (const document of data) {
      if (document && document.is_required && !document.answer) {
        validate = false;
        return false;
      }
    }
    return validate;
  }

  validateDocument(document, event) {
    event.preventDefault();
    document.is_document_validated = !document.is_document_validated;
    if (document.document_validation_status === 'validated') {
      document.document_validation_status = 'not_validated';
    } else {
      document.document_validation_status = 'validated';
    }
    const payload = _.cloneDeep(this.stepData);
    delete payload.revision_contract_process;
    delete payload.form_builder_step_id;
    this.saveUpdatedData(payload);
  }

  checkAllValidationStatus() {
    if (this.dataSource.data && this.dataSource.data.length) {
      let isAllValidated = this.dataSource.data.every((document) => document.document_validation_status === 'validated');
      this.isAllDocumentValidated = isAllValidated;
      console.log('isAllValidated::::::::', isAllValidated);
    }
  }

  saveDataOnFinalRevision() {
    const payload = {
      _id: this.stepData._id,
    };
    this.saveUpdatedData(payload);
  }

  async submitDocumentStep() {
    if (!(await this.checkIfRequiredDocumentUploaded())) {
      return;
    }
    this.subs.sink = this.formBuilderService
      .SendPreviewStepNotification(this.currentUserId, this.stepData.form_builder_step_id._id, this.formId, false)
      .subscribe(
        (ressp) => {
          console.log('Notif is Sent!');
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
    this.subs.sink = this.formBuilderService
      .GenerateStepMessage(
        this.stepData && this.stepData.form_builder_step_id && this.stepData.form_builder_step_id._id
          ? this.stepData.form_builder_step_id._id
          : null,
        this.formId,
        false,
      )
      .subscribe(
        (step) => {
          if (step) {
            this.subs.sink = this.dialog
              .open(StepMessageProcessDialogComponent, {
                width: '600px',
                minHeight: '100px',
                panelClass: 'certification-rule-pop-up',
                disableClose: true,
                data: {
                  // stepId: '61e62d5a6680ee7d2b7bb205',
                  stepId: this.stepData.form_builder_step_id._id,
                  isPreview: false,
                  student_admission_process_id: this.formId,
                },
              })
              .afterClosed()
              .subscribe((ressp) => {
                if (ressp) {
                  this.isPageLoading = true;
                  if (this.formType && this.formType === 'fc_contract' && !this.formDetail.isPreview) {
                    this.subs.sink = this.contractService.acceptFCContractProcessStep(this.formId, this.stepData._id).subscribe(
                      (resp) => {
                        this.isPageLoading = false;
                        console.log(resp);
                        // console.log('MASUK SINI');
                        if (this.lastStep) {
                          this.submitFormMutation();
                        }
                        if (
                          (this.stepData &&
                            this.stepData.is_validation_required &&
                            this.stepData.validator &&
                            this.stepData.validator.name === 'Student') ||
                          !this.stepData.is_validation_required
                        ) {
                          this.triggerRefresh.emit(this.formId);
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
                    this.subs.sink = this.contractService.acceptContractProcessStep(this.formId, this.stepData._id).subscribe(
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
                          Swal.fire({
                            type: 'success',
                            title: this.translate.instant('Bravo'),
                            confirmButtonText: this.translate.instant('UserForm_S6.CONFIRM'),
                            allowEnterKey: false,
                            allowEscapeKey: false,
                            allowOutsideClick: false,
                          }).then(() => this.triggerRefresh.emit(this.formId));
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
              });
          } else {
            this.isPageLoading = true;
            if (this.formType && this.formType === 'fc_contract' && !this.formDetail.isPreview) {
              this.subs.sink = this.contractService.acceptFCContractProcessStep(this.formId, this.stepData._id).subscribe(
                (resp) => {
                  this.isPageLoading = false;
                  console.log(resp);
                  // console.log('MASUK SINI');
                  if (this.lastStep) {
                    this.submitFormMutation();
                  }
                  if (
                    (this.stepData &&
                      this.stepData.is_validation_required &&
                      this.stepData.validator &&
                      this.stepData.validator.name === 'Student') ||
                    !this.stepData.is_validation_required
                  ) {
                    this.triggerRefresh.emit(this.formId);
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
              this.subs.sink = this.contractService.acceptContractProcessStep(this.formId, this.stepData._id).subscribe(
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
                    Swal.fire({
                      type: 'success',
                      title: this.translate.instant('Bravo'),
                      confirmButtonText: this.translate.instant('UserForm_S6.CONFIRM'),
                      allowEnterKey: false,
                      allowEscapeKey: false,
                      allowOutsideClick: false,
                    }).then(() => this.triggerRefresh.emit(this.formId));
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
        },
        (err) => {
          this.isPageLoading = true;
          if (this.formType && this.formType === 'fc_contract' && !this.formDetail.isPreview) {
            this.subs.sink = this.contractService.acceptFCContractProcessStep(this.formId, this.stepData._id).subscribe(
              (resp) => {
                this.isPageLoading = false;
                console.log(resp);
                // console.log('MASUK SINI');
                if (this.lastStep) {
                  this.submitFormMutation();
                }
                if (
                  (this.stepData &&
                    this.stepData.is_validation_required &&
                    this.stepData.validator &&
                    this.stepData.validator.name === 'Student') ||
                  !this.stepData.is_validation_required
                ) {
                  this.triggerRefresh.emit(this.formId);
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
              },
              (errr) => {
                this.isPageLoading = false;
                this.triggerRefresh.emit(this.formId);
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('SORRY'),
                  text: errr && errr['message'] ? this.translate.instant(errr['message'].replaceAll('GraphQL error: ', '')) : errr,
                  confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                });
              },
            );
          } else {
            this.subs.sink = this.contractService.acceptContractProcessStep(this.formId, this.stepData._id).subscribe(
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
                  Swal.fire({
                    type: 'success',
                    title: this.translate.instant('Bravo'),
                    confirmButtonText: this.translate.instant('UserForm_S6.CONFIRM'),
                    allowEnterKey: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                  }).then(() => this.triggerRefresh.emit(this.formId));
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
              },
              (errr) => {
                this.isPageLoading = false;
                this.triggerRefresh.emit(this.formId);
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('SORRY'),
                  text: errr && errr['message'] ? this.translate.instant(errr['message'].replaceAll('GraphQL error: ', '')) : errr,
                  confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                });
              },
            );
          }
        },
      );
    // this.swalValidate();
  }

  submitFormMutation() {
    this.isWaitingForResponse = true;
    if (this.stepData && this.stepData._id) {
      console.log('submitted');
      const payload = {
        step_status: 'accept',
      };
      this.subs.sink = this.contractService.updateFcContractProcessStep(this.stepData._id, payload).subscribe(
        (response) => {
          if (response) {
            this.subs.sink = this.contractService.submitFCContractProcess(this.formId, this.userId).subscribe(
              (res) => {
                this.isWaitingForResponse = false;
                this.triggerRefresh.emit(this.formId);
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
            this.isWaitingForResponse = false;
            this.triggerRefresh.emit(this.formId);
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
      this.isWaitingForResponse = false;
    }
  }

  async submitRevisionDocumentStep() {
    if (!(await this.checkIfRequiredDocumentUploaded())) {
      return;
    }
    this.isPageLoading = true;
    // console.log(this.stepData._id);
    this.subs.sink = this.contractService.completeRevisionContractProcessStep(this.stepData._id).subscribe(
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
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo'),
            confirmButtonText: this.translate.instant('UserForm_S6.CONFIRM'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => this.triggerRefresh.emit(this.formId));
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

        this.subs.sink = this.formBuilderService
          .GenerateStepMessage(
            this.stepData && this.stepData.form_builder_step_id && this.stepData.form_builder_step_id._id
              ? this.stepData.form_builder_step_id._id
              : null,
            this.formId,
            false,
          )
          .subscribe(
            (step) => {
              if (step) {
                this.subs.sink = this.dialog
                  .open(StepMessageProcessDialogComponent, {
                    width: '600px',
                    minHeight: '100px',
                    panelClass: 'certification-rule-pop-up',
                    disableClose: true,
                    data: {
                      // stepId: '61e62d5a6680ee7d2b7bb205',
                      stepId: this.stepData.form_builder_step_id._id,
                      isPreview: false,
                      student_admission_process_id: this.formId,
                    },
                  })
                  .afterClosed()
                  .subscribe((ressp) => {
                    if (ressp) {
                      this.triggerRefresh.emit(this.formId);
                    }
                  });
              } else {
                this.triggerRefresh.emit(this.formId);
              }
            },
            (err) => {
              this.triggerRefresh.emit(this.formId);
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
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
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

  validateDocumentStep() {
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
          if (confirmBtnRef && confirmBtnRef.innerText) {
            confirmBtnRef.innerText = this.translate.instant('UserForm_S9.CONFIRM') + ` (${timeDisabled})`;
          }
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          if (confirmBtnRef && confirmBtnRef.innerText) {
            confirmBtnRef.innerText = this.translate.instant('UserForm_S9.CONFIRM');
          }
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      if (res.value) {
        const payload = this.createPayload(_.cloneDeep(this.stepData));
        if (payload.pre_contract_template_step && payload.pre_contract_template_step._id) {
          payload.pre_contract_template_step = payload.pre_contract_template_step._id;
        }
        delete payload.revision_contract_process;
        delete payload.form_builder_step_id;
        // if (
        //   (payload.validator && (payload.step_status === 'revision_completed' || payload.step_status === 'need_validation')) ||
        //   !payload.validator
        // ) {
        //   payload.step_status = 'accept';
        // }
        if (payload && payload.segments && payload.segments.length) {
          payload.segments = payload.segments.map((list) => {
            return {
              ...list,
              questions: list.questions.map((quest) => {
                return {
                  ...quest,
                  document_validation_status: 'validated',
                };
              }),
            };
          });
        }
        // console.log('payload', payload);
        this.subs.sink = this.formBuilderService
          .GenerateStepMessage(
            this.stepData && this.stepData.form_builder_step_id && this.stepData.form_builder_step_id._id
              ? this.stepData.form_builder_step_id._id
              : null,
            this.formId,
            false,
          )
          .subscribe(
            (step) => {
              if (step) {
                this.isPageLoading = false;
                this.subs.sink = this.dialog
                  .open(StepMessageProcessDialogComponent, {
                    width: '600px',
                    minHeight: '100px',
                    panelClass: 'certification-rule-pop-up',
                    disableClose: true,
                    data: {
                      // stepId: '61e62d5a6680ee7d2b7bb205',
                      stepId: this.stepData.form_builder_step_id._id,
                      isPreview: false,
                      student_admission_process_id: this.formId,
                    },
                  })
                  .afterClosed()
                  .subscribe((ressp) => {
                    if (ressp) {
                      this.isPageLoading = true;
                      if (this.formType && this.formType === 'fc_contract' && !this.formDetail.isPreview) {
                        const formattedPayload = this.formatPayloadFCContract(payload);
                        this.subs.sink = this.contractService
                          .createUpdateFCContractProcessStepAndQuestion(formattedPayload)
                          .pipe(
                            take(1),
                            switchMap((resp) => {
                              if (resp) {
                                return this.contractService.acceptFCContractProcessStep(this.formId, this.stepData._id);
                              } else {
                                return EMPTY;
                              }
                            }),
                          )
                          .subscribe(
                            (resp) => {
                              this.isPageLoading = false;
                              console.log(resp);
                              // console.log('MASUK SINI');
                              if (this.lastStep) {
                                this.submitFormMutation();
                              }
                              Swal.fire({
                                type: 'success',
                                title: this.translate.instant('Bravo!'),
                                confirmButtonText: this.translate.instant('OK'),
                                allowEnterKey: false,
                                allowEscapeKey: false,
                                allowOutsideClick: false,
                              }).then(() => {
                                this.triggerRefresh.emit(this.formId);
                              });
                            },
                            (err) => {
                              this.isPageLoading = false;
                              this.triggerRefresh.emit(this.formId);
                              Swal.fire({
                                type: 'info',
                                title: this.translate.instant('SORRY'),
                                text:
                                  err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                              });
                            },
                          );
                      } else {
                        this.subs.sink = this.contractService
                          .createUpdateContractProcessStepAndQuestion(payload)
                          .pipe(
                            take(1),
                            switchMap((resp) => {
                              if (resp) {
                                return this.contractService.acceptContractProcessStep(this.formId, this.stepData._id);
                              } else {
                                return EMPTY;
                              }
                            }),
                          )
                          .subscribe(
                            (resp) => {
                              this.isPageLoading = false;
                              console.log(resp);
                              Swal.fire({
                                type: 'success',
                                title: this.translate.instant('Bravo!'),
                                confirmButtonText: this.translate.instant('OK'),
                                allowEnterKey: false,
                                allowEscapeKey: false,
                                allowOutsideClick: false,
                              }).then(() => {
                                this.triggerRefresh.emit(this.formId);
                              });
                            },
                            (err) => {
                              this.isPageLoading = false;
                              this.triggerRefresh.emit(this.formId);
                              Swal.fire({
                                type: 'info',
                                title: this.translate.instant('SORRY'),
                                text:
                                  err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                              });
                            },
                          );
                      }
                    } else {
                      this.isPageLoading = false;
                      this.triggerRefresh.emit(this.formId);
                    }
                  });
              } else {
                this.isPageLoading = true;
                if (this.formType && this.formType === 'fc_contract' && !this.formDetail.isPreview) {
                  const formattedPayload = this.formatPayloadFCContract(payload);
                  this.subs.sink = this.contractService
                    .createUpdateFCContractProcessStepAndQuestion(formattedPayload)
                    .pipe(
                      take(1),
                      switchMap((resp) => {
                        if (resp) {
                          return this.contractService.acceptFCContractProcessStep(this.formId, this.stepData._id);
                        } else {
                          return EMPTY;
                        }
                      }),
                    )
                    .subscribe(
                      (resp) => {
                        this.isPageLoading = false;
                        console.log(resp);
                        // console.log('MASUK SINI');
                        if (this.lastStep) {
                          this.submitFormMutation();
                        }
                        Swal.fire({
                          type: 'success',
                          title: this.translate.instant('Bravo!'),
                          confirmButtonText: this.translate.instant('OK'),
                          allowEnterKey: false,
                          allowEscapeKey: false,
                          allowOutsideClick: false,
                        }).then(() => {
                          this.triggerRefresh.emit(this.formId);
                        });
                      },
                      (err) => {
                        this.isPageLoading = false;
                        this.triggerRefresh.emit(this.formId);
                        Swal.fire({
                          type: 'info',
                          title: this.translate.instant('SORRY'),
                          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                        });
                      },
                    );
                } else {
                  this.subs.sink = this.contractService
                    .createUpdateContractProcessStepAndQuestion(payload)
                    .pipe(
                      take(1),
                      switchMap((resp) => {
                        if (resp) {
                          return this.contractService.acceptContractProcessStep(this.formId, this.stepData._id);
                        } else {
                          return EMPTY;
                        }
                      }),
                    )
                    .subscribe(
                      (resp) => {
                        this.isPageLoading = false;
                        console.log(resp);
                        Swal.fire({
                          type: 'success',
                          title: this.translate.instant('Bravo!'),
                          confirmButtonText: this.translate.instant('OK'),
                          allowEnterKey: false,
                          allowEscapeKey: false,
                          allowOutsideClick: false,
                        }).then(() => {
                          this.triggerRefresh.emit(this.formId);
                        });
                      },
                      (err) => {
                        this.isPageLoading = false;
                        this.triggerRefresh.emit(this.formId);
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
            },
            (err) => {
              this.isPageLoading = true;
              if (this.formType && this.formType === 'fc_contract' && !this.formDetail.isPreview) {
                const formattedPayload = this.formatPayloadFCContract(payload);
                this.subs.sink = this.contractService
                  .createUpdateFCContractProcessStepAndQuestion(formattedPayload)
                  .pipe(
                    take(1),
                    switchMap((resp) => {
                      if (resp) {
                        return this.contractService.acceptFCContractProcessStep(this.formId, this.stepData._id);
                      } else {
                        return EMPTY;
                      }
                    }),
                  )
                  .subscribe(
                    (resp) => {
                      this.isPageLoading = false;
                      console.log(resp);
                      // console.log('MASUK SINI');
                      if (this.lastStep) {
                        this.submitFormMutation();
                      }
                      this.triggerRefresh.emit(this.formId);
                    },
                    (errr) => {
                      this.isPageLoading = false;
                      this.triggerRefresh.emit(this.formId);
                      Swal.fire({
                        type: 'info',
                        title: this.translate.instant('SORRY'),
                        text: errr && errr['message'] ? this.translate.instant(errr['message'].replaceAll('GraphQL error: ', '')) : errr,
                        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                      });
                    },
                  );
              } else {
                this.subs.sink = this.contractService
                  .createUpdateContractProcessStepAndQuestion(payload)
                  .pipe(
                    take(1),
                    switchMap((resp) => {
                      if (resp) {
                        return this.contractService.acceptContractProcessStep(this.formId, this.stepData._id);
                      } else {
                        return EMPTY;
                      }
                    }),
                  )
                  .subscribe(
                    (resp) => {
                      this.isPageLoading = false;
                      console.log(resp);
                      Swal.fire({
                        type: 'success',
                        title: this.translate.instant('Bravo!'),
                        confirmButtonText: this.translate.instant('OK'),
                        allowEnterKey: false,
                        allowEscapeKey: false,
                        allowOutsideClick: false,
                      }).then(() => {
                        this.triggerRefresh.emit(this.formId);
                      });
                    },
                    (errr) => {
                      this.isPageLoading = false;
                      this.triggerRefresh.emit(this.formId);
                      Swal.fire({
                        type: 'info',
                        title: this.translate.instant('SORRY'),
                        text: errr && errr['message'] ? this.translate.instant(errr['message'].replaceAll('GraphQL error: ', '')) : errr,
                        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                      });
                    },
                  );
              }
            },
          );
      } else {
        this.isPageLoading = false;
        return;
      }
    });
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
}
