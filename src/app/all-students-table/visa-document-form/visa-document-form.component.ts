import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormFillingService } from 'app/form-filling/form-filling.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { SubSink } from 'subsink';
import { MatPaginator } from '@angular/material/paginator';
import { ApplicationUrls } from 'app/shared/settings';
import { FormFillingRevisionDialogComponent } from 'app/form-filling/form-filling-revision-dialog/form-filling-revision-dialog.component';

@Component({
  selector: 'ms-visa-document-form',
  templateUrl: './visa-document-form.component.html',
  styleUrls: ['./visa-document-form.component.scss'],
})
export class VisaDocumentFormComponent implements OnInit, OnDestroy {
  private subs: SubSink = new SubSink();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  isWaitingForResponse: boolean = false;
  documentOnPreviewUrl: any;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  dataSource = new MatTableDataSource([]);
  noData;
  dataCount: number = 0;
  userData;

  isAccepted = false;

  displayedColumn = ['document', 'status', 'action'];

  myInnerHeight = 600;

  formId;
  dataTable;
  stepData;
  formData;
  formDetail: {
    userId?: string;
    formType?: string;
    userTypeId: string;
    formId;
  };

  disable = true;
  isValidator = false;

  constructor(
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private utilService: UtilityService,
    private fileUploadService: FileUploadService,
    private formFillingService: FormFillingService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.formId = this.route?.snapshot?.params?.formId;
    this.route.queryParamMap.subscribe((resp: any) => {
      if (resp.params.hasOwnProperty('formType')) {
        this.formDetail = _.cloneDeep(resp.params);
        this.formDetail.formId = this.formId;
        if (this.formDetail?.formType === 'required_document' && this.formId) {
          this.getOneForm();
        }
      }
    });
  }

  getOneForm() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.getOneFormProcessv2(this.formId).subscribe(
      (resp) => {
        if (resp) {
          // ********** UAT_1033 if form process is deleted we display swal TEACH_MAN_OUPS_S1. We do datafix to mark deleted form that are wrongly sent
          if (resp?.status === 'deleted') {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('TEACH_MAN_OUPS_S1.Title'),
              html: this.translate.instant('TEACH_MAN_OUPS_S1.Text'),
              confirmButtonText: this.translate.instant('TEACH_MAN_OUPS_S1.Button'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((res) => {
              window.open('https://www.google.com/', '_self');
            });
            return;
          }

          this.formData = _.cloneDeep(resp);
          this.checkCompletingUser();
          this.checkFormAccept();
          if (this.formData?.steps?.length) {
            const currStep = this.formData.steps.find((step) => step.step_type === 'document_expected');
            this.stepData = _.cloneDeep(currStep);
            this.getOneUser();
            this.populateTable(this.formData?.steps[0]);
          }
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err.message ? this.translate.instant(err.message.replaceAll('GraphQL error: ', '')) : err,
          allowOutsideClick: false,
        });
      },
    );
  }

  cleanUrlFormat(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  populateTable(data) {
    if (!data.segments.length) {
      return;
    }
    let documents = data?.segments.map((segment) => segment.questions).flat();
    documents = documents.map((res) => {
      if (res?.document_validation_status === null) {
        res.document_validation_status = 'not_validated';
      }
      return res;
    });
    this.dataTable = documents;
    this.dataSource.data = documents;
    this.dataCount = documents.length;
    this.dataSource.paginator = this.paginator;
    this.noData = this.dataSource.connect().pipe(map((data) => data.length === 0));
  }

  getOneUser() {
    this.isWaitingForResponse = true;
    const param = this.route?.snapshot?.queryParams;
    const userId = param?.studentId ? param?.studentId : this.formDetail?.userId;
    this.subs.sink = this.formFillingService.getOneUser(userId).subscribe(
      (resp) => {
        if (resp) {
          this.userData = _.cloneDeep(resp);
        }
        this.checkDisableForm();
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.checkDisableForm();
      },
    );
  }

  checkDisableForm() {
    if (this.stepData.isCompletingUser) {
      if (
        this.stepData.step_status === 'not_started' ||
        this.stepData.step_status === 'ask_for_revision' ||
        (this.formData.form_status && this.formData.form_status === 'ask_for_revision') ||
        (this.stepData?.step_status === 'accept' && this.formData?.is_final_validator_active && !this.formData?.form_status) ||
        this.formData?.form_status === 'rejected' ||
        this.formData?.form_status === 'document_expired'
      ) {
        this.disable = false;
      } else {
        this.disable = true;
      }
    }
    if (!this.userData) {
      return;
    }
    if (this.userData?.user_id?.entities?.length) {
      this.isValidator = !!this.userData?.user_id?.entities.find((ent) => {
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

    if (this.isValidator && !this.stepData.isCompletingUser) {
      if (
        this.stepData.step_status === 'need_validation' ||
        (this.stepData.step_status === 'ask_for_revision' &&
          this.formData?.form_status &&
          this.formData?.form_status !== 'ask_for_revision')
      ) {
        this.disable = false;
      } else {
        this.disable = true;
      }
    }
  }

  checkCompletingUser() {
    if (this.formData && this.formData.steps && this.formData.steps.length) {
      this.formData.steps.forEach((step) => {
        if (this.formDetail && this.formDetail.userTypeId && step.user_who_complete_step) {
          if (
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

  setDocumentOnPreviewUrl(element) {
    if (element?.answer) {
      const result = this.serverimgPath + element?.answer + '#view=fitH';
      this.documentOnPreviewUrl = this.cleanUrlFormat(result);
    } else {
      this.documentOnPreviewUrl = null;
    }
  }

  acceptFormProcessStepV2() {
    if (!this.checkIfRequiredDocumentUploaded()) {
      return;
    }
    const payload = this.createPayload(_.cloneDeep(this.stepData));
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.acceptFormProcessStepV2(this.stepData?._id, this.formId, payload,this.formDetail?.userTypeId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((resp) => {
          this.getOneForm();
        });
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err.message ? this.translate.instant(err.message.replaceAll('GraphQL error: ', '')) : err,
          allowOutsideClick: false,
        });
      },
    );
  }

  createPayload(stepData) {
    const payload = stepData;
    delete payload.revise_request_messages;
    if (payload && payload.validator && payload.validator._id) {
      payload.validator = payload.validator._id;
    }
    delete payload.form_builder_step;
    delete payload.user_who_complete_step;
    delete payload.isCompletingUser;
    delete payload.revision_user_type;
    if (payload?.segments?.length) {
      payload.segments.forEach((segment) => {
        if (segment?.questions?.length) {
          segment?.questions.forEach((question) => {
            delete question.acad_document_id;
          });
        }
      });
    }
    if (payload?.validator?._id) {
      payload.validator = payload.validator?._id;
    }
    if ((payload && !payload.user_validator) || (payload.user_validator && payload.user_validator._id)) {
      delete payload.user_validator;
    }
    if (payload && payload.form_builder_step && payload.form_builder_step._id) {
      payload.form_builder_step = payload.form_builder_step._id;
    }
    return payload;
  }

  checkIfRequiredDocumentUploaded() {
    if (!this.isRequiredDocumentsUploaded()) {
      Swal.fire({
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

  chooseFile(fileInput: Event, element) {
    let acceptable = [];
    acceptable = ['pdf', 'png', 'jpg', 'jpeg'];
    const file = (<HTMLInputElement>fileInput.target).files[0];
    if (!file) {
      return;
    }
    const fileType = this.utilService.getFileExtension(file.name)?.toLocaleLowerCase();
    if (acceptable?.includes(fileType)) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.patchAnswerWithUploadedFile(element?._id, resp?.s3_file_name);
            });
          }
          this.isWaitingForResponse = false;
        },
        (err) => {
          this.isWaitingForResponse = false;
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
        if (this.stepData?.segments[indexOfSegment]?.questions[questionIndex]?.acad_document_id?.document_status) {
          this.stepData.segments[indexOfSegment].questions[questionIndex].acad_document_id.document_status = 'waiting_validation';
        } else {
          this.stepData.segments[indexOfSegment].questions[questionIndex].acad_document_id = {
            document_status: 'waiting_validation',
          };
        }
      }
    }
    this.populateTable(this.stepData);
  }

  hasQuestion(segment: any, questionId: string) {
    return !!segment.questions.find((question) => question._id === questionId);
  }

  checkFormAccept() {
    if (this.formData && this.formData.form_status === 'submitted') {
      this.isAccepted = true;
    } else if (this.formData && this.formData.form_status === 'signing_process') {
      this.isAccepted = true;
    }
  }

  isRequiredDocumentsUploaded(): boolean {
    const data = _.cloneDeep(this.dataSource.data);
    let validate = true;
    if (data.every((document) => document.is_document_validated)) {
      return true;
    } else if (
      data.every(
        (document) =>
          document?.answer &&
          (document?.acad_document_id?.document_status === 'waiting_validation' ||
            document?.acad_document_id?.document_status === 'validated'),
      )
    ) {
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
    return validate;
  }

  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 103;
    return this.myInnerHeight;
  }

  askRevisionFormProcessV2() {
    this.subs.sink = this.dialog
      .open(FormFillingRevisionDialogComponent, {
        minWidth: '800px',
        panelClass: 'no-padding',
        disableClose: true,
        data: {
          formData: this.formDetail,
          stepId: this.stepData?._id,
          existingMessages: this.stepData.revise_request_messages ? this.stepData.revise_request_messages : null,
          from: 'visa_document',
        },
      })
      .afterClosed()
      .subscribe((ressp) => {
        if (ressp) {
          this.getOneForm();
        }
      });
  }

  displayTooltip(status) {
    if (status === 'none' || !status) {
      return this.translate.instant('statusList.not_completed');
    } else if (status === 'waiting_validation') {
      return this.translate.instant('statusList.waiting_for_validation');
    } else if (status === 'rejected') {
      return this.translate.instant('statusList.rejected');
    } else if (status === 'validated') {
      return this.translate.instant('validated');
    } else if (status === 'expired') {
      return this.translate.instant('statusList.document_expired');
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
