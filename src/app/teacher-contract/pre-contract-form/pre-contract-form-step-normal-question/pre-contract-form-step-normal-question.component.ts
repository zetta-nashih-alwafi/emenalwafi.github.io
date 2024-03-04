import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'app/service/utility/utility.service';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { switchMap, take } from 'rxjs/operators';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { EMPTY } from 'rxjs';
import { RevisionBoxContractDialogComponent } from '../revision-box-contract-dialog/revision-box-contract-dialog.component';
import { CustomValidators } from 'ng2-validation';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { ApplicationUrls } from 'app/shared/settings';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import { ContractService } from 'app/service/contract/contract.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { StepMessageProcessDialogComponent } from 'app/form-builder/step-message-process/step-message-process.component';

@Component({
  selector: 'ms-pre-contract-form-step-normal-question',
  templateUrl: './pre-contract-form-step-normal-question.component.html',
  styleUrls: ['./pre-contract-form-step-normal-question.component.scss'],
  providers: [ParseStringDatePipe, ParseLocalToUtcPipe],
})
export class PreContractFormStepNormalQuestionComponent implements OnInit, AfterViewInit {
  @Input() currentStepIndex: number;
  @Input() stepData: any;
  @Input() formDetail: any;
  @Input() isReceiver: any;
  @Input() userData: any;
  @Input() formData: any;
  @Input() stepsLength: any;
  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();

  @ViewChild('userphoto', { static: false }) uploadInput: any;

  private subs = new SubSink();
  templateStepForm: UntypedFormGroup;
  intVal: any;
  timeOutVal: any;
  // editor: any = DecoupledEditor;
  disable = false;
  isValidator = false;
  formId: any;
  isRevisionUser: any = false;
  isWaitingForResponse = false;
  programs = [];
  interventions = [
    { value: 'face_to_face', name: 'Face to Face' },
    { value: 'face_to_face_2', name: 'Face to Face 2' },
    { value: 'face_to_face_3', name: 'Face to Face 3' },
    { value: 'face_to_face_4', name: 'Face to Face 4' },
    { value: 'jury', name: 'Jury' },
    { value: 'coaching', name: 'Coaching' },
    { value: 'conference', name: 'Conference' },
    { value: 'correction_of_files', name: 'Correction of Files' },
    { value: 'correction_of_copies', name: 'Correction of Copies' },
    { value: 'making_subjects', name: 'Making Subjects' },
  ];
  relationList = ['father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'other'];
  contract_type = ['cddu', 'convention'];
  cities: any;
  departments: any;
  regions: any;
  regionsParents: any;
  departmentsParent: any;
  citiesParent: any;
  userId: any;
  formType: string;
  isRequired = true;
  subjectsList = [];
  currentUser: any;
  currentUserId = null;
  scholars = [];
  email_sign = [];

  listFinance = [];
  listTypeOfFinancement = [];
  ceoList = [];
  mentorList = [];
  candidateId: string;
  selectedFinancer: any;
  isPhotoMandatory = false;
  isPhotoUploading = false;
  photo: string;
  photoIsField: string;
  photo_s3_path: string;
  photoIsField_s3_path: string;
  is_photo_in_s3 = false;
  is_photo_uploaded = false;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  grayBackground = '../../../../../assets/img/gray-background.jpg';
  candidateData: any;

  schoolList: any[] = [];
  legalStatusList: any[] = [];
  campusList: any[] = [];
  levelList: any[] = [];
  sectorList: any[] = [];
  specialityList: any[] = [];
  selectedSchoolId: any;
  selectedCampusId: any;
  selectedLevelId: any;

  hideRejectStopButtonFC: boolean = false;
  hideAskForRevisionButtonFC: boolean = false;

  lastStep = false;

  constructor(
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private contractService: TeacherContractService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    public router: Router,
    private parseStringDatePipe: ParseStringDatePipe,
    private parseLocalToUtc: ParseLocalToUtcPipe,
    private utilityService: UtilityService,
    private rncpTitleService: RNCPTitlesService,
    private cd: ChangeDetectorRef,
    private financeService: FinancesService,
    private authService: AuthService,
    private fileUploadService: FileUploadService,
    private formBuilderService: FormBuilderService,
    private fcContractService: ContractService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    if (this.currentUser && this.currentUser._id) {
      this.currentUserId = this.currentUser._id;
    }
    this.getSignalementEmailDropdown();
    this.formId = this.route.snapshot.queryParamMap.get('formId');
    this.formType = this.route.snapshot.queryParamMap.get('formType');
    this.userId = this.route.snapshot.queryParamMap.get('userId');
    this.candidateId = this.route.snapshot.queryParamMap.get('candidateId');

    this.initTemplateStepForm();
    this.getSubjectDropdown();
    this.getProgramDropdown();

    if (this.templateStepForm && this.formType && this.formType === 'fc_contract' && !this.formDetail.isPreview) {
      this.getOneCandidate();
      this.getSchoolDropdown();
      this.getSectorDefaultDropdown();
      this.getSpecialityDefaultDropdown();
      this.legalStatusList = this.formBuilderService.getListOfLegalStatus();
      this.populateStepData(_.cloneDeep(this.stepData));
      this.hideAskForRevisionButtonFC = true;
      this.hideRejectStopButtonFC = true;
    } else if (this.templateStepForm && this.formType === 'teacher_contract' && !this.formDetail.isPreview) {
      this.populateStepData(_.cloneDeep(this.stepData));
      this.hideAskForRevisionButtonFC = false;
      this.hideRejectStopButtonFC = false;
    }

    this.getDataScholarSeasons();
    if (!this.formDetail.isPreview) {
      this.checkDisableForm();
    } else {
      this.populateStepData(_.cloneDeep(this.stepData));
    }

    if (this.stepsLength >= 0) {
      if (this.currentStepIndex === this.stepsLength) {
        this.lastStep = true;
      } else if (this.stepData && this.stepData.steps && this.stepData.steps.length === 1) {
        this.lastStep = true;
      }
      console.log('_stepData', this.formData);
      console.log('_currentStep', this.currentStepIndex);
      console.log('_stepsLength', this.stepsLength);
      console.log('_lastStep', this.lastStep);
    }
  }

  getSubjectDropdown() {
    this.subs.sink = this.contractService.getAllSubjectsDropdown().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.subjectsList = resp;
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

  onWheel(event: Event) {
    event?.preventDefault();
  }

  getProgramDropdown() {
    this.subs.sink = this.contractService.GetAllProgramsDropdown().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.programs = resp;
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

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  checkDisableForm() {
    if (this.stepData.is_user_who_receive_the_form_as_validator && this.formDetail.formId === this.userId) {
      this.isReceiver = false;
      this.isValidator = true;
    } else if (this.stepData.is_user_who_receive_the_form_as_validator && this.formDetail.formId !== this.userId) {
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

    if (this.isValidator && !this.isReceiver) {
      if (this.stepData.step_status === 'need_validation') {
        this.disable = false;
      } else {
        this.disable = true;
      }
    }

    if (this.isValidator) {
      this.disable = true;
      this.isRevisionUser = false;
      this.isReceiver = false;
    }
    if (this.stepData.is_user_who_receive_the_form_as_validator) {
      this.disable = false;
      this.isRequired = false;
    }
  }

  populateStepData(tempStep: any) {
    // console.log('_temp', tempStep);

    if (tempStep) {
      if (tempStep.segments && tempStep.segments.length) {
        tempStep.segments.forEach((segment, segmentIndex) => {
          if (!this.getSegmentFormarray() || (this.getSegmentFormarray() && this.getSegmentFormarray().length < tempStep.segments.length)) {
            this.addSegmentForm(); // only add if length of segment does not match what has been initialized
          }
          if (segment.questions && segment.questions.length) {
            segment.questions.forEach((question, questionIndex) => {
              if (!this.getQuestionFieldFormArray(segmentIndex)) {
                if (question.field_type === 'TEACHER_EMAIL' || question.answer_type === 'email') {
                  this.addQuestionEmailFieldForm(segmentIndex);
                } else {
                  this.addQuestionFieldForm(segmentIndex);
                }
              } else if (
                this.getQuestionFieldFormArray(segmentIndex) &&
                this.getQuestionFieldFormArray(segmentIndex).length < segment.questions.length
              ) {
                if (question.field_type === 'TEACHER_EMAIL' || question.answer_type === 'email') {
                  this.addQuestionEmailFieldForm(segmentIndex);
                } else {
                  this.addQuestionFieldForm(segmentIndex);
                }
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
                question.answer_date.date === null &&
                question.answer_date.time === null
              ) {
                question.answer_date = null; // doing this to prevent passing object to form which will cause it to be eternally invalid
              }

              // set checkbox answer type to required as it cannot be set with [required] from the template
              if (question.answer_type && question.answer_type === 'multiple_option' && question.is_required) {
                this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('answer_multiple').setValidators([Validators.required]);
                this.templateStepForm.updateValueAndValidity();
              }

              if (question.is_field && ['START_DATE', 'END_DATE'].includes(question.field_type) && question.answer) {
                // this.formatDateOfBirth(tempStep, segmentIndex, questionIndex);
                const date = this.formatDateOfBirth(question.answer);
                question.answer = date;
              }

              // if (question.is_field && ['START_DATE', 'END_DATE'].includes(question.field_type) && question.answer) {
              //   // this.formatDateOfBirth(tempStep, segmentIndex, questionIndex);
              //   question.answer = this.formatDateOfBirth(question.answer);
              // }

              if (
                question.is_field &&
                ['start_date', 'end_date'].includes(question.field_type) &&
                question.answer &&
                this.formType &&
                this.formType === 'fc_contract'
              ) {
                // this.formatDateOfBirth(tempStep, segmentIndex, questionIndex);
                question.answer = this.formatDateOfBirth(question.answer);
              }

              if (
                question.answer_type &&
                question.answer_type === 'school_stamp' &&
                question.answer &&
                this.formType &&
                this.formType === 'fc_contract'
              ) {
                // this.formatDateOfBirth(tempStep, segmentIndex, questionIndex);
                this.photo = question.answer;
                this.photo_s3_path = question.answer;
                this.is_photo_in_s3 = true;
                this.is_photo_uploaded = true;
              }

              if (
                question.field_type &&
                question.field_type === 'school_stamp' &&
                question.answer &&
                this.formType &&
                this.formType === 'fc_contract'
              ) {
                // this.formatDateOfBirth(tempStep, segmentIndex, questionIndex);
                this.photoIsField = question.answer;
                this.photoIsField_s3_path = question.answer;
                this.is_photo_in_s3 = true;
                this.is_photo_uploaded = true;
              }

              // Populate Campus Dropdown based on school candidate
              if (
                question.field_type &&
                question.field_type === 'school' &&
                question.answer &&
                this.formType &&
                this.formType === 'fc_contract' &&
                this.schoolList &&
                this.schoolList.length > 0
              ) {
                this.getCampusDropdown(question.answer, segmentIndex, true);
              }

              // Populate Level Dropdown based on campus candidate
              if (
                question.field_type &&
                question.field_type === 'campus' &&
                question.answer &&
                this.formType &&
                this.formType === 'fc_contract' &&
                this.schoolList &&
                this.schoolList.length > 0
              ) {
                this.getLevelDropdown(question.answer, segmentIndex, true);
              }

              // Populate Sector Dropdown based on school, campus, level candidate
              if (
                question.field_type &&
                question.field_type === 'level' &&
                question.answer &&
                this.formType &&
                this.formType === 'fc_contract' &&
                this.schoolList &&
                this.schoolList.length > 0
              ) {
                this.getSectorDropdown(this.selectedSchoolId, this.selectedCampusId, question.answer, segmentIndex, true);
              }

              // Populate Speciality Dropdown based on school, campus, level, sector candidate
              if (
                question.field_type &&
                question.field_type === 'sectors' &&
                question.answer &&
                this.formType &&
                this.formType === 'fc_contract' &&
                this.schoolList &&
                this.schoolList.length > 0
              ) {
                this.getSpecialityDropdown(
                  this.selectedSchoolId,
                  this.selectedCampusId,
                  this.selectedLevelId,
                  question.answer,
                  segmentIndex,
                  true,
                );
              }
            });
          }
        });
      }
      this.templateStepForm.patchValue(tempStep);
      this.templateStepForm.updateValueAndValidity();
      // console.log('_templateStepForm', this.templateStepForm.controls);
    }
  }

  formatStringAnswerToDate(date_answer: { date: string; time: string }) {
    return this.parseStringDatePipe.transformStringToDate(date_answer.date);
  }

  formatDateOfBirth(answer: string) {
    return this.parseStringDatePipe.transformStringToDate(answer);
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
      step_status: [null],
      validator: [null],
      direction: [''],
      segments: this.fb.array([]),
    });
  }

  initSegmentForm() {
    return this.fb.group({
      _id: [null],
      pre_contract_template_segment: [null],
      segment_title: [''],
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
      answer_number: [null], // max value for int32
      answer_date: [null],
      answer_multiple: [null],
    });
  }

  initQuestionEmailFieldForm() {
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
      answer: [null, CustomValidators.email],
      answer_number: [null], // max value for int32
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

  getAllQuestionFieldFormArray(field_type?) {
    const formList = this.getSegmentFormarray();
    let segmentIndex;
    formList.value.forEach((value, segIndex) => {
      value.questions.forEach((question) => {
        if (question.field_type === field_type) {
          segmentIndex = segIndex;
        }
      });
    });
    if (segmentIndex) {
      return this.getQuestionFieldFormArray(segmentIndex);
    }
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

  addQuestionEmailFieldForm(segmentIndex) {
    this.getQuestionFieldFormArray(segmentIndex).push(this.initQuestionEmailFieldForm());
  }

  onAskForRevision() {
    // NEED DIALOG for ask revision... THIS ONE IS COPY FROM V2, PLEASE REMOVE COMMENT IF DONE
    this.subs.sink = this.dialog
      .open(RevisionBoxContractDialogComponent, {
        minWidth: '800px',
        panelClass: 'no-padding',
        disableClose: true,
        data: {
          formData: this.formDetail,
          stepId: this.stepData._id,
          existingMessages: this.stepData.revise_request_messages ? this.stepData.revise_request_messages : [],
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.triggerRefresh.emit(this.formId);
        }
      });
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
        this.isWaitingForResponse = true;
        this.saveStep('revise').subscribe((resps) => {
          this.completeRevisionContractProcessStep().subscribe((ressp) => {
            this.isWaitingForResponse = false;
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
                      .subscribe((resssp) => {
                        if (resssp) {
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
          });
        });
      } else {
        clearTimeout(this.timeOutVal);
        return;
      }
    });
  }

  acceptContinueNextStep() {
    if (this.templateStepForm.invalid) {
      this.templateStepForm.markAllAsTouched();
      this.isWaitingForResponse = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
    } else {
      if (this.formType && this.formType === 'fc_contract' && !this.formDetail.isPreview) {
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
                this.openStepValidation();
              } else {
                this.saveData();
              }
            },
            (err) => {
              this.saveData();
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            },
          );
      }

      if (this.formType && this.formType === 'teacher_contract' && !this.formDetail.isPreview) {
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
                this.openStepValidation();
              } else {
                this.saveData();
              }
            },
            (err) => {
              this.saveData();
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
  }

  saveData() {
    let swalTitle: string;
    let swalText: string;
    let swalConfirm: string;
    if (this.isReceiver && !this.isValidator && this.stepData.is_validation_required && this.stepData.step_status !== 'accept') {
      swalTitle = this.translate.instant('UserForm_S6.TITLE');
      swalText = this.translate.instant('UserForm_S6.TEXT');
      swalConfirm = this.translate.instant('UserForm_S6.CONFIRM');
    } else {
      swalTitle = 'Bravo !';
      swalText = null;
      swalConfirm = 'OK';
    }
    this.isWaitingForResponse = true;
    this.subs.sink = this.saveStep('accept')
      .pipe(
        take(1),
        switchMap((resp) => {
          if (resp) {
            this.isWaitingForResponse = false;
            return this.acceptStep();
          } else {
            this.isWaitingForResponse = false;
            return EMPTY;
          }
        }),
      )
      .subscribe(
        (resp) => {
          // console.log('MASUK SINI');
          if (this.lastStep && this.formType === 'fc_contract') {
            this.submitFormMutation();
          }
          this.isWaitingForResponse = false;
          this.triggerRefresh.emit(this.formId);
        },
        (err) => {
          this.isWaitingForResponse = false;
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

  submitFormMutation() {
    this.isWaitingForResponse = true;
    if (this.stepData && this.stepData._id) {
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

  openStepValidation() {
    this.subs.sink = this.formBuilderService
      .SendPreviewStepNotification(this.currentUserId, this.stepData.form_builder_step_id._id, this.formId, false)
      .subscribe(
        (resp) => {
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
    // console.log(this.templateStepForm.value);

    if (this.formType && this.formType === 'fc_contract' && !this.formDetail.isPreview) {
      this.subs.sink = this.formBuilderService
        .GenerateStepMessage(
          this.stepData && this.stepData.form_builder_step_id && this.stepData.form_builder_step_id._id
            ? this.stepData.form_builder_step_id._id
            : null,
          this.formId,
          false,
        )
        .subscribe(
          (resp) => {
            if (resp) {
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
                    if (ressp) {
                      this.saveData();
                    } else {
                      this.triggerRefresh.emit(this.formId);
                    }
                  }
                });
            } else {
              this.saveData();
            }
          },
          (err) => {
            console.log('MASUK SINI');
            if (this.lastStep && this.formType === 'fc_contract') {
              this.submitFormMutation();
            }
            this.saveData();
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
    }

    if (this.formType && this.formType === 'teacher_contract' && !this.formDetail.isPreview) {
      this.subs.sink = this.formBuilderService
        .GenerateStepMessage(
          this.stepData && this.stepData.form_builder_step_id && this.stepData.form_builder_step_id._id
            ? this.stepData.form_builder_step_id._id
            : null,
          this.formId,
          false,
        )
        .subscribe(
          (resp) => {
            if (resp) {
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
                    if (ressp) {
                      this.saveData();
                    } else {
                      this.triggerRefresh.emit(this.formId);
                    }
                  }
                });
            } else {
              this.saveData();
            }
          },
          (err) => {
            this.saveData();
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

  saveStep(type) {
    const payload = this.templateStepForm.value;
    this.formatPayload(payload);
    delete payload.step_status;
    if (this.isValidator) {
      payload.validator = payload.validator && payload.validator._id ? payload.validator._id : payload.validator ? payload.validator : null;
      if (this.formType && this.formType === 'fc_contract' && !this.formDetail.isPreview) {
        const formattedPayload = this.formatPayloadFCContract(payload);
        return this.contractService.createUpdateFCContractProcessStepAndQuestion(formattedPayload);
      } else {
        return this.contractService.createUpdateContractProcessStepAndQuestion(payload);
      }
    } else {
      if (this.formType && this.formType === 'fc_contract' && !this.formDetail.isPreview) {
        const formattedPayload = this.formatPayloadFCContract(payload);
        return this.contractService.createUpdateFCContractProcessStepAndQuestion(payload);
      } else {
        return this.contractService.createUpdateContractProcessStepAndQuestion(payload);
      }
    }
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

  completeRevisionContractProcessStep() {
    return this.contractService.completeRevisionContractProcessStep(this.templateStepForm.value._id);
  }

  acceptStep() {
    if (this.formType && this.formType === 'fc_contract' && !this.formDetail.isPreview) {
      return this.contractService.acceptFCContractProcessStep(this.formId, this.templateStepForm.value._id);
    } else {
      return this.contractService.acceptContractProcessStep(this.formId, this.templateStepForm.value._id);
    }
  }

  saveOnFinalValidationRevision() {
    // Check if form is invalid
    if (this.templateStepForm.invalid) {
      this.templateStepForm.markAllAsTouched();
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      return;
    }

    this.isWaitingForResponse = true;
    this.subs.sink = this.saveStep('final').subscribe(
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
          }).then((res) => {
            this.openStepValidation();
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

  swalValidate() {
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
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((ress) => {
          return;
        });
      } else {
        return;
      }
    });
  }

  // Swal for completing the from
  swalCompleteForm() {
    Swal.fire({
      type: 'success',
      title: this.translate.instant('UserForm_S8.TITLE'),
      text: this.translate.instant('UserForm_S8.TEXT'),
      confirmButtonText: this.translate.instant('UserForm_S8.CONFIRM'),
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then(() => {
      return;
    });
  }

  getPostcodeData(data, segmentIndex, index) {
    // console.log('_zip', data.value, index);
    // console.log(this.getQuestionFieldFormArray(segmentIndex).at(index).get('field_type').value);
    const typeField = this.getQuestionFieldFormArray(segmentIndex).at(index).get('field_type').value;

    if (typeField === 'student_zipcode' || typeField === 'student_country') {
      const zipcode = this.getZipcodeForm(this.getQuestionFieldFormArray(segmentIndex));
      const isFormCountryFrance = this.checkHasCountry(this.getQuestionFieldFormArray(segmentIndex));
      if (zipcode && zipcode.length > 3) {
        this.subs.sink = this.rncpTitleService.getFilteredZipCode(zipcode, 'France').subscribe(
          (resp) => {
            if (resp && resp.length) {
              this.setAddressDropdownStudent(resp);
              if (isFormCountryFrance) {
                const isFormHasCity = this.checkHasCity(this.getQuestionFieldFormArray(segmentIndex));
                if (isFormHasCity) {
                  this.patchFormCity(this.getQuestionFieldFormArray(segmentIndex));
                }
                const isFormHasRegion = this.checkHasRegion(this.getQuestionFieldFormArray(segmentIndex));
                if (isFormHasRegion) {
                  this.patchFormRegion(this.getQuestionFieldFormArray(segmentIndex));
                }
                const isFormDepartment = this.checkHasDepartment(this.getQuestionFieldFormArray(segmentIndex));
                if (isFormDepartment) {
                  this.patchFormDepartment(this.getQuestionFieldFormArray(segmentIndex));
                }
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
      }
    }

    if (typeField === 'parent_zipcode' || typeField === 'parent_country') {
      const zipcode = this.getZipcodeFormParent(this.getQuestionFieldFormArray(segmentIndex));
      const isFormCountryFrance = this.checkHasCountryParent(this.getQuestionFieldFormArray(segmentIndex));
      if (zipcode && zipcode.length > 3) {
        this.subs.sink = this.rncpTitleService.getFilteredZipCode(zipcode, 'France').subscribe(
          (resp) => {
            if (resp && resp.length) {
              this.setAddressDropdownParent(resp);
              if (isFormCountryFrance) {
                const isFormHasCity = this.checkHasCityParent(this.getQuestionFieldFormArray(segmentIndex));
                if (isFormHasCity) {
                  this.patchFormCityParent(this.getQuestionFieldFormArray(segmentIndex));
                }
                const isFormHasRegion = this.checkHasRegionParent(this.getQuestionFieldFormArray(segmentIndex));
                if (isFormHasRegion) {
                  this.patchFormRegionParent(this.getQuestionFieldFormArray(segmentIndex));
                }
                const isFormDepartment = this.checkHasDepartmentParent(this.getQuestionFieldFormArray(segmentIndex));
                if (isFormDepartment) {
                  this.patchFormDepartmentParent(this.getQuestionFieldFormArray(segmentIndex));
                }
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
      }
    }
    // this.getQuestionFieldFormArray(segmentIndex).(datas);
  }

  // student

  getZipcodeFormParent(form) {
    let zipcode;
    for (const element of form.value) {
      if (element.field_type === 'parent_zipcode') {
        zipcode = element.answer;
        break;
      }
    }
    return zipcode;
  }

  getZipcodeForm(form) {
    let zipcode;
    for (const element of form.value) {
      if (element.field_type === 'student_zipcode') {
        zipcode = element.answer;
        break;
      }
    }
    return zipcode;
  }

  patchFormCity(form) {
    let cityData;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'student_city') {
        cityData = element;
        cityData.answer = this.cities[0];
        indexFound = index;
        break;
      }
    }
    // console.log('_test', cityData);
    form.at(indexFound).patchValue(cityData);
    form.updateValueAndValidity();
  }

  patchFormRegion(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'student_region') {
        data = element;
        data.answer = this.regions[0];
        indexFound = index;
        break;
      }
    }
    // console.log('_test', data);
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  patchFormDepartment(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'student_department') {
        data = element;
        data.answer = this.departments[0];
        indexFound = index;
        break;
      }
    }
    // console.log('_test', data);
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  setAddressDropdownStudent(resp: any) {
    const tempCities = [];
    const tempDepartments = [];
    const tempRegions = [];

    if (resp && resp.length) {
      resp.forEach((address) => {
        tempCities.push(address.city);
        tempDepartments.push(address.department);
        tempRegions.push(address.province);
      });

      this.cities = _.uniq(tempCities);
      this.departments = _.uniq(tempDepartments);
      this.regions = _.uniq(tempRegions);
      // console.log('_address', this.cities, this.departments, this.regions);
    }
  }

  checkHasCountry(form) {
    let hasCountry = false;
    let hasZipcode = false;
    for (const element of form.value) {
      if (
        element.field_type === 'student_country' &&
        (this.utilityService.simplifyRegex(element.answer) === 'france' ||
          this.utilityService.simplifyRegex(element.answer) === 'francais' ||
          this.utilityService.simplifyRegex(element.answer) === 'francaise')
      ) {
        hasCountry = true;
      }
      if (element.field_type === 'student_zipcode') {
        hasZipcode = true;
      }
      if (hasCountry && hasZipcode) {
        break;
      }
    }
    return hasCountry && hasZipcode;
  }

  checkHasCity(form) {
    let hasCity = false;
    for (const element of form.value) {
      if (element.field_type === 'student_city') {
        hasCity = true;
        break;
      }
    }
    return hasCity;
  }

  checkHasRegion(form) {
    let hasRegion = false;
    for (const element of form.value) {
      if (element.field_type === 'student_region') {
        hasRegion = true;
        break;
      }
    }
    return hasRegion;
  }

  checkHasDepartment(form) {
    let hasDepartment = false;
    for (const element of form.value) {
      if (element.field_type === 'student_department') {
        hasDepartment = true;
        break;
      }
    }
    return hasDepartment;
  }

  // Parent

  setAddressDropdownParent(resp: any) {
    const tempCities = [];
    const tempDepartments = [];
    const tempRegions = [];

    if (resp && resp.length) {
      resp.forEach((address) => {
        tempCities.push(address.city);
        tempDepartments.push(address.department);
        tempRegions.push(address.province);
      });

      this.citiesParent = _.uniq(tempCities);
      this.departmentsParent = _.uniq(tempDepartments);
      this.regionsParents = _.uniq(tempRegions);
      // console.log('_address', this.citiesParent, this.departmentsParent, this.regionsParents);
    }
  }

  patchFormCityParent(form) {
    let cityData;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'parent_city') {
        cityData = element;
        cityData.answer = this.citiesParent[0];
        indexFound = index;
        break;
      }
    }
    // console.log('_test', cityData);
    form.at(indexFound).patchValue(cityData);
    form.updateValueAndValidity();
  }

  patchFormRegionParent(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'parent_region') {
        data = element;
        data.answer = this.regionsParents[0];
        indexFound = index;
        break;
      }
    }
    // console.log('_test', data);
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  patchFormDepartmentParent(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'parent_department') {
        data = element;
        data.answer = this.departmentsParent[0];
        indexFound = index;
        break;
      }
    }
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  checkHasCountryParent(form) {
    let hasCountry = false;
    let hasZipcode = false;
    for (const element of form.value) {
      if (
        element.field_type === 'parent_country' &&
        (this.utilityService.simplifyRegex(element.answer) === 'france' ||
          this.utilityService.simplifyRegex(element.answer) === 'francais' ||
          this.utilityService.simplifyRegex(element.answer) === 'francaise')
      ) {
        hasCountry = true;
      }
      if (element.field_type === 'parent_zipcode') {
        hasZipcode = true;
      }
      if (hasCountry && hasZipcode) {
        break;
      }
    }
    return hasCountry && hasZipcode;
  }

  checkHasCityParent(form) {
    let hasCity = false;
    for (const element of form.value) {
      if (element.field_type === 'parent_city') {
        hasCity = true;
        break;
      }
    }
    return hasCity;
  }

  checkHasRegionParent(form) {
    let hasRegion = false;
    for (const element of form.value) {
      if (element.field_type === 'parent_region') {
        hasRegion = true;
        break;
      }
    }
    return hasRegion;
  }

  checkHasDepartmentParent(form) {
    let hasDepartment = false;
    for (const element of form.value) {
      if (element.field_type === 'parent_department') {
        hasDepartment = true;
        break;
      }
    }
    return hasDepartment;
  }

  preventNonNumericalInput(event) {
    if (event && event.key) {
      if (!event.key.match(/^[0-9]+$/)) {
        event.preventDefault();
      }
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
        clearInterval(this.intVal);
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
        clearInterval(this.intVal);
        return;
      }
    });
  }

  onAccept() {
    // console.log(this.templateStepForm.value);
    // this.subs.sink = this.contractService.createUpdateContractProcessStepAndQuestion(this.templateStepForm.value).subscribe(resp => {
    //   console.log(resp);
    //   Swal.fire({
    //     type: 'success',
    //     title: this.translate.instant('Bravo!'),
    //     confirmButtonText: this.translate.instant('OK'),
    //     allowEnterKey: false,
    //     allowEscapeKey: false,
    //     allowOutsideClick: false,
    //   })
    // })
    // this.contractService.setStepStateStatus(this.currentStepIndex, true);
    // console.log('on accept now state becomes:', this.contractService.stepState);
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

  getAllFinancement() {
    const filter = {
      candidate_id: this.candidateId,
      // admission_process_id: '62727a53c12719096afe8e9d',
      admission_process_id:
        this.candidateData && this.candidateData.admission_process_id ? this.candidateData.admission_process_id._id : '',
    };

    this.subs.sink = this.contractService.getAllAdmissionFinancements(filter).subscribe((res) => {
      if (res) {
        // console.log('_test', res);
        const result = [];
        if (res && res.length > 0) {
          res.forEach((element, index) => {
            if (element && element.candidate_id && index === 0) {
              result.push(element.candidate_id);
            }
            if (element && element.organization_id) {
              result.push(element.organization_id);
            }
            if (element && element.company_branch_id) {
              result.push(element.company_branch_id);
            }
          });
          const mappedFinancer = result.map((map) => {
            let name;
            let type;
            if (map && map.last_name) {
              name = map.last_name;
              name = `${map.last_name} ${map.first_name}${
                map.civility && map.civility !== 'neutral' ? ' ' + this.translate.instant(map.civility) : ''
              }`;
              type = 'student';
            } else if (map && map.name) {
              name = map.name;
              type = 'organization';
            } else if (map && map.company_name) {
              name = map.company_name;
              type = 'company';
            }
            return {
              _id: map._id,
              name,
              type,
            };
          });

          const mappedTypeFinancement = result.map((map) => {
            if ((map && map.organization_type) || (map && map.company_name)) {
              let name;
              if (map && map.name) {
                name = map.organization_type;
              } else if (map && map.company_name) {
                name = 'Company';
              }
              if (name) {
                return name;
              }
            }
          });
          // console.log('_result', result);
          // console.log('_mapped', mappedFinancer);
          // console.log('_mapped 2', mappedTypeFinancement);

          this.listFinance = mappedFinancer;
          this.listFinance = this.listFinance.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

          // console.log('listFinance', this.listFinance);

          this.listTypeOfFinancement = mappedTypeFinancement.filter((fil) => fil);
          this.listTypeOfFinancement = _.uniqBy(this.listTypeOfFinancement);
          this.listTypeOfFinancement = this.listTypeOfFinancement.sort((a, b) => a.localeCompare(b));
        }
      }
    });
  }

  checkFinancer(selectedFinancer, segmentIndex, quesIndex) {
    // console.log('_selected', selectedFinancer);
    // console.log('_list', this.listFinance);

    const found = this.listFinance.find((res) => res.name === selectedFinancer);
    if (found && found.type === 'company') {
      this.isWaitingForResponse = true;
      this.selectedFinancer = found._id;
      this.getOneCompany(this.selectedFinancer, segmentIndex, quesIndex);
      this.getAllMentor(this.selectedFinancer, segmentIndex, quesIndex);
      this.getAllUserCEO(this.selectedFinancer, segmentIndex, quesIndex);
    } else {
      if (this.getAllQuestionFieldFormArray('company_siret')) {
        this.patchCompanyData(this.getAllQuestionFieldFormArray('company_siret'), null, true);
      }
      if (this.getAllQuestionFieldFormArray('company_address')) {
        this.patchCompanyDataAddress(this.getAllQuestionFieldFormArray('company_address'), null, true);
      }
      if (this.getAllQuestionFieldFormArray('mentor_function')) {
        this.patchCompanyMentor(this.getAllQuestionFieldFormArray('mentor_function'), null, true);
      }
      if (this.getAllQuestionFieldFormArray('legal_status')) {
        this.patchCompanyDataLegalStatus(this.getAllQuestionFieldFormArray('legal_status'), null, true);
      }

      this.resetCEO(this.getQuestionFieldFormArray(segmentIndex), null, true);
      this.resetMentor(this.getQuestionFieldFormArray(segmentIndex), null, true);

      this.ceoList = [];
      this.mentorList = [];
    }
  }

  resetCEO(form, dataForm, reset?) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'ceo' && reset) {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    // console.log('_test', data);
    if (data) {
      form.at(indexFound).patchValue(data);
      form.updateValueAndValidity();
    }
  }

  resetMentor(form, dataForm, reset?) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'mentor' && reset) {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    // console.log('_test', data);
    if (data) {
      form.at(indexFound).patchValue(data);
      form.updateValueAndValidity();
    }
  }

  patchCompanyMentor(form, dataForm, reset?) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'mentor_function' && !reset) {
        data = element;
        data.answer = dataForm && dataForm.position ? dataForm.position : null;
        indexFound = index;
        break;
      } else if (element.field_type === 'mentor_function' && reset) {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    // console.log('_test', data);
    if (data) {
      form.at(indexFound).patchValue(data);
      form.updateValueAndValidity();
    }
  }

  patchCompanyData(form, dataForm, reset?) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'company_siret' && !reset) {
        data = element;
        data.answer = dataForm && dataForm.no_RC ? dataForm.no_RC : null;
        indexFound = index;
        break;
      } else if (element.field_type === 'company_siret' && reset) {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    // console.log('_formList', form);
    // console.log('res', dataForm);
    // console.log('_test', data);
    if (data) {
      form.at(indexFound).patchValue(data);
      form.updateValueAndValidity();
    }
  }

  patchCompanyDataLegalStatus(form, dataForm, reset?) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'legal_status' && !reset) {
        data = element;
        data.answer = dataForm && dataForm.legal_status ? dataForm.legal_status : null;
        indexFound = index;
        break;
      } else if (element.field_type === 'legal_status' && reset) {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    // console.log('_test', data);
    if (data) {
      form.at(indexFound).patchValue(data);
      form.updateValueAndValidity();
    }
  }

  patchCompanyDataAddress(form, dataForm, reset?) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'company_address' && !reset) {
        data = element;
        data.answer =
          dataForm && dataForm.company_addresses && dataForm.company_addresses.length > 0 ? dataForm.company_addresses[0].address : null;
        indexFound = index;
        break;
      } else if (element.field_type === 'company_address' && reset) {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    // console.log('_test', data);
    if (data) {
      form.at(indexFound).patchValue(data);
      form.updateValueAndValidity();
    }
  }

  getOneCompany(_id, segmentIndex, index) {
    this.subs.sink = this.contractService.GetOneCompany(_id).subscribe((res) => {
      this.isWaitingForResponse = false;
      if (res) {
        console.log('company', res);

        const typeField = this.getQuestionFieldFormArray(segmentIndex).at(index).get('field_type').value;

        if (typeField === 'financer') {
          if (this.getAllQuestionFieldFormArray('company_siret')) {
            this.patchCompanyData(this.getAllQuestionFieldFormArray('company_siret'), res);
          }
          if (this.getAllQuestionFieldFormArray('company_address')) {
            this.patchCompanyDataAddress(this.getAllQuestionFieldFormArray('company_address'), res);
          }
          if (this.getAllQuestionFieldFormArray('legal_status')) {
            this.patchCompanyDataLegalStatus(this.getAllQuestionFieldFormArray('legal_status'), res);
          }
        }
      }
    });
  }

  getAllMentor(_id, segmentIndex, index, selectedMentor?) {
    this.subs.sink = this.contractService.GetAllUsersMentorCompany(_id, true, ['6278e027b97bfb30674e76af']).subscribe((res) => {
      if (res) {
        this.mentorList = res;
        this.mentorList = this.mentorList.sort((a, b) => a.last_name.toLowerCase().localeCompare(b.last_name.toLowerCase()));

        let found;
        if (selectedMentor) {
          found = res.find((response) => selectedMentor.includes(response.last_name) && selectedMentor.includes(response.first_name));
        }
        const typeField = this.getQuestionFieldFormArray(segmentIndex).at(index).get('field_type').value;
        if (found) {
          if (typeField === 'mentor') {
            this.patchCompanyMentor(this.getQuestionFieldFormArray(segmentIndex), found);
          }
        }
      }
    });
  }

  getAllUserCEO(_id, segmentIndex, quesIndex) {
    this.subs.sink = this.contractService.GetAllUsersCEOCompany(['6278e02eb97bfb30674e76b0'], _id).subscribe((res) => {
      if (res) {
        this.ceoList = res;
        this.ceoList = this.ceoList.sort((a, b) => a.last_name.toLowerCase().localeCompare(b.last_name.toLowerCase()));
      }
    });
  }

  openUploadWindow() {
    const file = this.uploadInput.nativeElement.click();
  }

  handleInputChange(fileInput: Event, from, segmentIndex, questionIndex) {
    this.isPhotoUploading = true;
    const file = (<HTMLInputElement>fileInput.target).files[0];
    this.photo = '';
    this.photoIsField = '';
    this.photo_s3_path = '';
    this.photoIsField_s3_path = '';
    this.is_photo_in_s3 = false;

    if (file) {
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          this.isPhotoUploading = false;
          if (resp) {
            if (from === 'answerType') {
              this.photo = resp.file_name;
              this.photo_s3_path = resp.s3_file_name;
            }
            if (from === 'isField') {
              this.photoIsField = resp.file_name;
              this.photoIsField_s3_path = resp.s3_file_name;
            }
            this.is_photo_in_s3 = true;
            this.is_photo_uploaded = true;
            this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).patchValue({ answer: resp.s3_file_name });
          }
        },
        (err) => {
          this.isPhotoUploading = false;
          Swal.fire({
            type: 'info',
            title: 'Error !',
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          }).then((res) => {
            console.log('[BE Message] Error is : ', err);
          });
        },
      );
    }
    this.resetFileState();
  }

  resetFileState() {
    this.uploadInput.nativeElement.value = '';
  }

  isMandatory(quest) {
    let display = false;
    if (quest.get('is_required').value && quest.touched && !quest.get('answer').value) {
      display = true;
    }
    if (quest.get('is_required').value && !quest.get('answer').value) {
      this.isPhotoMandatory = true;
    } else {
      this.isPhotoMandatory = false;
    }
    return display;
  }

  getOneCandidate() {
    this.subs.sink = this.formBuilderService.getOneCandidateAdmission(this.candidateId).subscribe(
      (res) => {
        if (res) {
          this.candidateData = res;
          if (this.candidateData) {
            this.getAllFinancement();
          }
        }
      },
      (err) => {
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.authService.handlerSessionExpired();
          return;
        }
      },
    );
  }
  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        // console.log(resp);
        if (resp && resp.length) {
          this.scholars = resp;
          this.scholars = this.scholars.sort((a, b) =>
            a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
          );
          // this.scholarFilter.setValue(this.scholars[0]._id);
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

  getSchoolDropdown() {
    // Reset data
    this.campusList = [];
    this.levelList = [];
    this.sectorList = [];
    this.specialityList = [];

    this.subs.sink = this.fcContractService.getAllSchoolFormFCContract().subscribe((res) => {
      if (res) {
        this.schoolList = res.sort((a, b) => a.short_name.toLowerCase().localeCompare(b.short_name.toLowerCase()));
      }
    });
  }

  getCampusDropdown(school_id, segmentIndex, fromPopulate?) {
    if (!fromPopulate) {
      // Reset data
      this.campusList = [];
      this.levelList = [];
      this.sectorList = [];
      this.specialityList = [];

      this.resetCampus(this.getQuestionFieldFormArray(segmentIndex));
      this.resetLevel(this.getQuestionFieldFormArray(segmentIndex));
      this.resetSector(this.getQuestionFieldFormArray(segmentIndex));
      this.resetSpeciality(this.getQuestionFieldFormArray(segmentIndex));
    }

    const filteredSchool: any = this.schoolList.find((res) => res.short_name === school_id);
    this.selectedSchoolId = filteredSchool._id;

    if (filteredSchool) {
      this.campusList = filteredSchool.campuses;
      this.campusList = this.campusList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    } else {
      this.campusList = [];
    }
  }

  getLevelDropdown(campus_id, segmentIndex, fromPopulate?) {
    if (!fromPopulate) {
      // Reset data
      this.levelList = [];
      this.sectorList = [];
      this.specialityList = [];

      this.resetLevel(this.getQuestionFieldFormArray(segmentIndex));
      this.resetSector(this.getQuestionFieldFormArray(segmentIndex));
      this.resetSpeciality(this.getQuestionFieldFormArray(segmentIndex));
    }

    const filteredCampus: any = this.campusList.find((res) => res.name === campus_id);
    this.selectedCampusId = filteredCampus._id;

    if (filteredCampus) {
      this.levelList = filteredCampus.levels;
      this.levelList = this.levelList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    } else {
      this.levelList = [];
    }
  }

  getSectorDropdown(candidate_school_ids, campuses, levels, segmentIndex, fromPopulate?) {
    if (!fromPopulate) {
      // Reset data
      this.specialityList = [];

      this.resetSector(this.getQuestionFieldFormArray(segmentIndex));
      this.resetSpeciality(this.getQuestionFieldFormArray(segmentIndex));
    }

    const filteredLevel = this.levelList.find((res) => res.name === levels);
    this.selectedLevelId = filteredLevel._id;

    const filter = {
      candidate_school_ids: [candidate_school_ids],
      campuses: [campuses],
      levels: [this.selectedLevelId],
    };

    this.subs.sink = this.fcContractService.getAllSectorFormFCContract(filter).subscribe((res) => {
      if (res) {
        this.sectorList = res;
      }
    });
  }

  getSpecialityDropdown(candidate_school_ids, campuses, levels, sectors, segmentIndex, fromPopulate?) {
    if (!fromPopulate) {
      this.resetSpeciality(this.getQuestionFieldFormArray(segmentIndex));
    }

    const filteredSector = this.sectorList.find((res) => res.name === sectors);

    const filter = {
      candidate_school_ids: [candidate_school_ids],
      campuses: [campuses],
      levels: [levels],
      sectors: [filteredSector._id],
    };

    this.subs.sink = this.fcContractService.getAllSpecialityFormFCContract(filter).subscribe((res) => {
      if (res) {
        this.specialityList = res;
      }
    });
  }

  getSectorDefaultDropdown() {
    const filter = null;
    this.subs.sink = this.fcContractService.getAllSectorFormFCContract(filter).subscribe((res) => {
      if (res) {
        this.sectorList = res;
      }
    });
  }

  getSpecialityDefaultDropdown() {
    const filter = null;
    this.subs.sink = this.fcContractService.getAllSpecialityFormFCContract(filter).subscribe((res) => {
      if (res) {
        this.specialityList = res;
      }
    });
  }

  resetCampus(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'campus') {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    // console.log('_test', data);
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  resetLevel(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'level') {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    // console.log('_test', data);
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  resetSector(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'sector') {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    // console.log('_test', data);
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  resetSpeciality(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'speciality') {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    // console.log('_test', data);
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  getSignalementEmailDropdown() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.getAllSignalementEmail().subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          this.email_sign = resp.filter((list) => list.signalement_email);
        }
        // console.log('this.getSignalementEmailDropdown', this.email_sign);
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

  formatPayloadFCContract(payload) {
    // format the dates
    for (const segment of payload.segments) {
      //  Remove pre_contract_template_segment because it was not one of the input
      delete segment.pre_contract_template_segment;

      for (const question of segment.questions) {
        if (question && question._id) {
          question['form_builder_question_id'] = question._id;
          delete question._id;
        }
        if (question && question.is_field && question.answer instanceof Array) {
          // passing answer to multiple if the type was an array
          question.answer_multiple = question.answer;
          question.answer = '';
        }

        if (question && question.is_field && typeof question.answer === 'number') {
          // passing answer to number
          question.answer_number = question.answer;
          question.answer = '';
        }

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

    return payload;
  }
}
