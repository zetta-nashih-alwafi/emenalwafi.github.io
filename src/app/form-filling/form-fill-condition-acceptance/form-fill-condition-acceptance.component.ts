import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ApplicationUrls } from 'app/shared/settings';
import { environment } from 'environments/environment';
import { SubSink } from 'subsink';

import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormArray, UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import * as _ from 'lodash';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FormFillingService } from '../form-filling.service';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { FormFillingRevisionDialogComponent } from '../form-filling-revision-dialog/form-filling-revision-dialog.component';
import { StepMessageProcessDialogComponent } from 'app/form-builder/step-message-process/step-message-process.component';

@Component({
  selector: 'ms-form-fill-condition-acceptance',
  templateUrl: './form-fill-condition-acceptance.component.html',
  styleUrls: ['./form-fill-condition-acceptance.component.scss'],
  providers: [ParseStringDatePipe, ParseLocalToUtcPipe],
})
export class FormFillConditionAcceptanceComponent implements OnInit, OnChanges {
  _stepData;
  @Input() currentStepIndex;
  @Input() formDetail: any;
  @Input() userData;
  @Input() isReceiver;
  @Input() formData;
  @Input() stepsLength;
  candidateData: any;
  isValidator: boolean;
  isRevisionUser: any;
  isWaitingForResponse = false;
  myInnerHeight: number;
  lastStep = false;
  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();

  timeOutVal: any;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  rawUrl: string;
  documentOnPreviewUrl: any;
  userHasDownloaded = false;
  _subs = new SubSink();
  formId: any;
  processFinish = false;
  isUsingStepMessage = true;
  templateStepForm: UntypedFormGroup;
  currentUser = null;
  userId = null;
  userMainId = null;

  get stepData() {
    return this._stepData;
  }
  @Input() set stepData(value: any) {
    if (value) {
      this._stepData = value;
      if (
        this._stepData.segments[0] &&
        this._stepData.segments[0].questions[0] &&
        this._stepData.segments[0].questions[0].special_question &&
        this._stepData.segments[0].questions[0].special_question.document_acceptance_pdf
      ) {
        this.setPreviewUrl(this._stepData.segments[0].questions[0].special_question.document_acceptance_pdf);
      }
    }
  }

  constructor(
    private fb: UntypedFormBuilder,
    private formFillingService: FormFillingService,
    public sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private formBuilderService: FormBuilderService,
    private parseStringDatePipe: ParseStringDatePipe,
    private parseLocalToUtc: ParseLocalToUtcPipe,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    console.log('_step data devis', this.stepData, this.formData, this.currentStepIndex);

    this.formId = this.route.snapshot.queryParamMap.get('formId');
    this.currentUser = this.authService.getLocalStorageUser();
    this.userId = this.route.snapshot.queryParamMap.get('userId');
    if (this.currentUser && this.currentUser._id) {
      this.userMainId = this.currentUser._id;
    } else {
      if (this.userId) {
        this.userMainId = this.userId;
      } else {
        this.userMainId = null;
      }
    }
    if (!this.formDetail.isPreview) {
      if (this.formDetail.formType !== 'alumni') {
        this.getSchoolLogo();
      }
      if (this.formData && this.formData.steps && this.formData.steps.length > 0) {
        if (
          this.formData.steps[this.formData.steps.length - 1].step_type === 'document_to_validate' &&
          this.formData.steps[this.formData.steps.length - 1].step_status === 'accept'
        ) {
          this.processFinish = true;
        } else {
          this.processFinish = false;
          this.checkEntities();
        }
      } else {
        this.processFinish = false;
        this.checkEntities();
      }
    }
    if (
      this.stepData.segments[0] &&
      this.stepData.segments[0].questions[0] &&
      this.stepData.segments[0].questions[0].special_question &&
      this.stepData.segments[0].questions[0].special_question.document_acceptance_pdf
    ) {
      this.setPreviewUrl(this.stepData.segments[0].questions[0].special_question.document_acceptance_pdf);
    }

    if (this.stepsLength >= 0) {
      if (this.currentStepIndex === this.stepsLength) {
        this.lastStep = true;
      } else if (this.stepData && this.stepData.steps && this.stepData.steps.length === 1) {
        this.lastStep = true;
      }
      console.log('_lastStep', this.lastStep);
    }
  }

  ngOnChanges() {
    this.isWaitingForResponse = true;
    this.initTemplateStepForm();
    setTimeout(() => {
      this.initTemplateStepForm();
      this.populateStepData(_.cloneDeep(this.stepData));
      this.isWaitingForResponse = false;
    }, 50);
  }

  populateStepData(tempStep: any) {
    if (tempStep) {
      if (tempStep.segments && tempStep.segments.length) {
        tempStep.segments.forEach((segment, segmentIndex) => {
          if (!this.getSegmentFormarray() || (this.getSegmentFormarray() && this.getSegmentFormarray().length < tempStep.segments.length)) {
            this.addSegmentForm(); // only add if length of segment does not match what has been initialized
          }
          if (segment.questions && segment.questions.length) {
            segment.questions.forEach((question, questionIndex) => {
              if (!this.getQuestionFieldFormArray(segmentIndex)) {
                this.addQuestionFieldForm(segmentIndex);
              } else if (
                this.getQuestionFieldFormArray(segmentIndex) &&
                this.getQuestionFieldFormArray(segmentIndex).length < segment.questions.length
              ) {
                this.addQuestionFieldForm(segmentIndex);
              } else {
                return;
              }

              if (
                question.answer_type &&
                question.answer_type === 'date' &&
                question.answer_date &&
                question.answer_date.date &&
                question.answer_date.time
              ) {
                question.answer_date = this.formatStringAnswerToDate(question.answer_date);
              } else if (
                question.answer_type &&
                question.answer_type === 'date' &&
                question.answer_date &&
                question.answer_date.hasOwnProperty('date') &&
                question.answer_date.date === null
              ) {
                question.answer_date = ''; // doing this to prevent passing object to form which will cause it to be eternally invalid
              }

              // set checkbox answer type to required as it cannot be set with [required] from the template
              if (question.answer_type && question.answer_type === 'multiple_option' && question.is_required) {
                this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('answer_multiple').setValidators([Validators.required]);
                this.templateStepForm.updateValueAndValidity();
              }

              if (
                question.is_field &&
                (question.field_type === 'student_date_of_birth' ||
                  question.field_type === 'date_of_birth' ||
                  question.field_type === 'alumni_date_of_birth') &&
                question.answer
              ) {
                // this.formatDateOfBirth(tempStep, segmentIndex, questionIndex);
                console.log(question.answer);
                question.answer = this.formatDateOfBirth(question.answer);
                console.log(question.answer);
              }

              if (question.is_field && question.field_type === 'student_country' && question.answer && question.answer === 'FRANCE') {
                question.answer = 'France';
              }
            });
          }
        });
      }
      this.templateStepForm.patchValue(tempStep, { onlySelf: false, emitEvent: true });
      console.log('_value', this.templateStepForm.value);
    }
  }

  formatStringAnswerToDate(date_answer: { date: string; time: string }) {
    return this.parseStringDatePipe.transformStringToDate(date_answer.date);
  }

  formatDateOfBirth(answer: string) {
    return this.parseStringDatePipe.transform(answer);
  }

  // to set options when user tick multiple options
  setOptions(segmentIndex: number, questionIndex: number, value: string) {
    let currentAnswers = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).value.answer_multiple;
    currentAnswers = currentAnswers ? currentAnswers : []; // if the currentAnswers are null by default, make it into an empty array
    const indexOfExistingValue = currentAnswers.indexOf(value);
    if (indexOfExistingValue >= 0) {
      // if exist remove
      currentAnswers.splice(indexOfExistingValue, 1);
    } else {
      // if not we add
      currentAnswers.push(value);
    }
    this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).patchValue({ answer_multiple: currentAnswers });
    this.getQuestionFieldFormArray(segmentIndex).updateValueAndValidity();
  }

  initTemplateStepForm() {
    this.templateStepForm = this.fb.group({
      _id: [null],
      step_title: [''],
      is_validation_required: [false],
      step_type: [null],
      validator: [null],
      direction: [''],
      segments: this.fb.array([]),
    });
  }

  initSegmentForm() {
    return this.fb.group({
      segment_title: [''],
      is_selected_modality: [false],
      questions: this.fb.array([]),
    });
  }

  initQuestionFieldForm() {
    return this.fb.group({
      _id: [null],
      ref_id: [{ value: null, disabled: true }],
      field_type: [null],
      is_field: [false],
      is_editable: [false],
      is_required: [false],
      field_position: [null],
      options: [[]],
      question_label: [''],
      answer_type: [],
      answer: [null],
      answer_number: [null, [Validators.max(2147483647)]], // max value for int32
      answer_date: [null],
      answer_multiple: [null],
    });
  }

  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  getSegmentFormarray(): UntypedFormArray {
    return this.templateStepForm.get('segments') as UntypedFormArray;
  }

  addSegmentForm() {
    this.getSegmentFormarray().push(this.initSegmentForm());
    if (this.getSegmentFormarray() && this.getSegmentFormarray().length) {
      this.templateStepForm.get('step_type').disable();
    }
  }

  getQuestionFieldFormArray(segmentIndex): UntypedFormArray {
    return this.getSegmentFormarray().at(segmentIndex).get('questions') as UntypedFormArray;
  }

  getNextQuestionField(segmentIndex, questionIndex) {
    return this.getQuestionFieldFormArray(segmentIndex).at(questionIndex + 1);
  }

  getPreviousQuestionField(segmentIndex, questionIndex) {
    const idx = questionIndex === 0 ? 0 : questionIndex - 1;
    return this.getQuestionFieldFormArray(segmentIndex).at(idx);
  }

  addQuestionFieldForm(segmentIndex) {
    this.getQuestionFieldFormArray(segmentIndex).push(this.initQuestionFieldForm());
  }

  formatPayload(payload) {
    // format the dates
    for (const segment of payload.segments) {
      for (const question of segment.questions) {
        if (question && question.is_field && question.answer instanceof Date) {
          // for parsing back to string format for fields like date of birth
          question.answer = this.parseLocalToUtc.transformDate(question.answer.toLocaleDateString('en-GB'), '15:59');
        }
        if (question && question.answer_date && question.answer_date instanceof Date) {
          question.answer_date = {
            date: this.parseLocalToUtc.transformDate(question.answer_date.toLocaleDateString('en-GB'), '15:59'),
            time: '15:59',
          };
        } else if (question && question.answer_date === '') {
          // doing this to convert the modification above from "" to date object again if user did not fill the date
          question.answer_date = {
            date: null,
            time: null,
          };
        }
      }
    }
    // format the validator from object to string of IDs
    if (payload && payload.validator && typeof payload.validator === 'object' && payload.validator._id) {
      payload.validator = payload.validator._id;
    }
    // format to remove the revise_request_messages
    if (payload && payload.revise_request_messages) {
      delete payload.revise_request_messages;
    }
  }

  setPreviewUrl(url) {
    this.rawUrl = url;
    const result = this.serverimgPath + url + '#view=fitH';
    this.documentOnPreviewUrl = this.cleanUrlFormat(result);
  }

  cleanUrlFormat(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  checkEntities() {
    if (this.isReceiver && this.formDetail.formType !== 'alumni') {
      this.getOneCandidate();
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

        this.isRevisionUser = this.userData.entities.find((ent) => {
          if (ent && ent.type && this.stepData.revision_user_type && ent.type._id === this.stepData.revision_user_type) {
            return true;
          } else {
            return false;
          }
        });
      }
    }
  }

  onAskForRevision() {
    this._subs.sink = this.dialog
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
      .subscribe((resp) => {
        if (resp) {
          this.triggerRefresh.emit(this.formId);
          console.log(resp);
        }
      });
  }

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
        this.swalValidate();
      } else {
        return;
      }
    });
  }

  onDownload() {
    // window.open(fileUrl, '_blank');downloadDoc() {
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = `${environment.apiUrl}/fileuploads/${this.rawUrl}?download=true`.replace('/graphql', '');
    a.download = this.rawUrl;
    // a.href = this.documentOnPreviewUrl;
    // a.download = fileUrl;
    a.click();
    a.remove();
    this.userHasDownloaded = true;
  }

  onAccept() {
    // this.swalValidate();
    this.generateStepMessage();
  }

  onSave() {
    this.isWaitingForResponse = true;
    if (this.formDetail.formType === 'alumni') {
      const payload = this.templateStepForm.value;
      this.formatPayload(payload);

      if (this.stepData && this.stepData.notSelected && this.stepData.notSelected.length > 0) {
        this.stepData.notSelected.forEach((res) => {
          payload.segments.push(res);
        });
      }

      payload['step_status'] = 'accept';
      console.log('_payload', payload);
      // if(this.lastStep){
      //   const surveyStatus = 'submitted';
      // }
      this._subs.sink = this.formFillingService.createUpdateAlumniSurveyProcessStepAndQuestion(payload).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            });
            if (this.isUsingStepMessage) {
              this.sendNotif();
            }
            this.triggerRefresh.emit(this.formDetail.formId);
            this.isWaitingForResponse = false;
          }
        },
        (err) => {
          if (this.isUsingStepMessage) {
            this.sendNotif();
          }
          this.triggerRefresh.emit(this.formDetail.formId);
          this.isWaitingForResponse = false;
        },
      );
    } else {
      const payload = {
        _id: this.stepData._id,
      };
      this._subs.sink = this.formFillingService.createUpdateFormProcessStepAndQuestion(payload).subscribe((resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          });
        }
      });
    }
  }

  swalValidate() {
    this.isWaitingForResponse = true;
    this._subs.sink = this.formFillingService.acceptFormProcessStep(this.formDetail.formId, this.stepData._id).subscribe(
      (resp) => {
        if (resp) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          });
          // this.generateStepMessage();
          this.processFinish = true;
          this.sendNotif();
          this.triggerRefresh.emit(this.formDetail.formId);
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
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

  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 500;
    return this.myInnerHeight;
  }

  sendNotif() {
    // this._subs.sink = this.formFillingService
    //   .sendPreviewFormBuilderStepNotification(
    //     this.userMainId,
    //     this.formData.steps[this.currentStepIndex]._id,
    //     this.formDetail.formId,
    //     false,
    //   )
    //   .subscribe((resp) => {
    //     if (resp) {
    //       console.log('_success', resp);
    //     }
    //   });
  }

  getOneCandidate() {
    this.isWaitingForResponse = true;
    this._subs.sink = this.formFillingService.GetOneCandidate(this.formDetail.candidateId).subscribe(
      (res) => {
        if (res) {
          this.isWaitingForResponse = false;
          this.formDetail['userId'] = res.user_id._id;
        }
      },
      (error) => {
        this.isWaitingForResponse = false;
      },
    );
  }

  getSchoolLogo() {
    this.isWaitingForResponse = true;
    this._subs.sink = this.formFillingService.GetOneCandidate(this.formDetail.candidateId).subscribe(
      (res) => {
        if (res) {
          this.isWaitingForResponse = false;
          this.candidateData = res;
        }
      },
      (error) => {
        this.isWaitingForResponse = false;
      },
    );
  }

  generateStepMessage() {
    console.log(this.isUsingStepMessage);
    if (this.isUsingStepMessage) {
      this._subs.sink = this.formBuilderService
        .GenerateStepMessage(this.stepData.form_builder_step._id, this.formDetail.formId, false)
        .subscribe(
          (resp) => {
            if (resp) {
              this._subs.sink = this.dialog
                .open(StepMessageProcessDialogComponent, {
                  width: '600px',
                  minHeight: '100px',
                  panelClass: 'certification-rule-pop-up',
                  disableClose: true,
                  data: {
                    stepId: this.stepData.form_builder_step._id,
                    isPreview: false,
                    student_admission_process_id: this.formDetail.formId,
                  },
                })
                .afterClosed()
                .subscribe((ressp) => {
                  if (ressp && ressp.type) {
                    if (ressp.type === 'accept' || ressp.type === 'empty') {
                      this.swalValidate();
                    } else {
                      console.log(ressp.type);
                    }
                  }
                });
            } else {
              this.swalValidate();
            }
          },
          (err) => {
            this.swalValidate();
          },
        );
    } else {
      this.swalValidate();
    }
  }

  checkCurrentUserAlreadySubmit() {
    let isSubmitted = false;
    if (this.lastStep === true && this.stepData.step_status === 'accept') {
      isSubmitted = true;
    } else {
      isSubmitted = false;
    }
    return isSubmitted;
  }
}
