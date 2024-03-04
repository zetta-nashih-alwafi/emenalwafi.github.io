import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { removeSpaces } from 'app/service/customvalidator.validator';
import Swal from 'sweetalert2';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AddSegmentFormBuilderDialogComponent } from '../../common-template-step-detail/add-segment-form-builder-dialog/add-segment-form-builder-dialog.component';
import { cloneDeep } from 'lodash';
import { ApplicationUrls } from 'app/shared/settings';
import * as _ from 'lodash';
import { DocumentIntakeBuilderService } from 'app/service/document-intake-builder/document-intake-builder.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-common-template-step-detail-tab',
  templateUrl: './common-template-step-detail-tab.component.html',
  styleUrls: ['./common-template-step-detail-tab.component.scss'],
})
export class CommonTemplateStepDetailTabComponent implements OnInit, OnDestroy {
  @Input() templateId;
  @Input() stepId;
  @Input() templateType;
  @Input() stepIndex: number;
  @Input() isPublished: boolean;
  @Input() finalValidation: boolean;
  @Input() takenUniqueStep: string[];
  @Input() step;
  @Output() updateTabs = new EventEmitter();
  @ViewChildren('blockPanel') blockPanel: QueryList<ElementRef>;
  @ViewChildren('questionPanel') questionPanel: QueryList<ElementRef>;
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  templateStepForm: UntypedFormGroup;
  initialStepForm;
  private subs = new SubSink();
  isWaitingForResponse = false;
  currentStepIndex = 0;
  parentAnswerType: string;
  questionnaireFields: string[];
  questionnaireConsts;
  docListType;
  selectedDocType;
  listUploadDocumentPDF: any;
  conditionalStepsDropdown: any[];
  filteredConditionalStepsDropdown: any[];
  initialStepData: any;
  scholars: any[];
  documentBuilders: any[];

  public Editor = DecoupledEditor;
  public config = {
    toolbar: ['heading', 'bold', 'italic', 'underline', 'strikethrough', 'numberedList', 'bulletedList', 'undo', 'redo'],
    height: '20rem',
  };

  public configTypeCondition = {
    toolbar: [
      'heading',
      '|',
      'fontSize',
      'fontFamily',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'alignment',
      '|',
      'numberedList',
      'bulletedList',
      'todoList',
      '|',
      'indent',
      'outdent',
      '|',
      'link',
      'blockQuote',
      'imageUpload',
      'insertTable',
      'horizontalLine',
      'pageBreak',
      '|',
      'undo',
      'redo',
    ],
    link: {
      addTargetToExternalLinks: true,
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'],
    },
  };
  photo: string;
  answerType: any;
  answerTypesForExpectedDocument: any;
  selectedAnswerType = [];
  filteredConditionalStepsDropdownContract: any;
  conditionalStepsDropdownContract: any;
  listMultipleContractType = ['fc_contract', 'teacher_contract'];
  formBuilderSaved: any;
  foundedQuestionSaved: any;
  modeValidation: string = 'All';

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  isMultipleContract = false;
  isRouterContractAlreadyUsed = false;
  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private translate: TranslateService,
    public dialog: MatDialog,
    private formBuilderService: FormBuilderService,
    private utilService: UtilityService,
    private fileUploadService: FileUploadService,
    private documentService: DocumentIntakeBuilderService,
    private financeService: FinancesService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initTemplateStepForm();
    this.getDropdown();
    this.populateStepData();
    this.initFormUpdateListener();
    this.initSegmentListener(); // on changes, reflect to preview
    // console.log('_ispublish', this.isPublished);

    if (this.isPublished) {
      this.templateStepForm.disable();
    }

    this.checkMultipleContract();
    this.getOneFormbuilderCheckingContract();
  }

  populateStepData() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formBuilderService.getOneFormBuilderStep(this.stepId).subscribe(
      (response) => {
        this.isWaitingForResponse = false;
        let step = cloneDeep(response);
        if (step) {
          if (step.segments.length) {
            if (step.segments[0].document_for_condition) {
              this.selectedDocType = step.segments[0].document_for_condition;
            }
            if (step.segments[0].acceptance_pdf) {
              this.listUploadDocumentPDF = step.segments[0].acceptance_pdf;
            }
            this.handleStepTypeDocumentToValidatePopulation(step);
          }

          // *************** need to check, there is answer_type === 'admission_document' or not
          let isAdmissionDocumentExist = false;
          let allQuestions = [];
          if (step.segments[0]?.questions?.length) {
            const questions = step.segments[0]?.questions;
            questions?.forEach((val) => {
              allQuestions?.push(val?.answer_type);
              if (val?.answer_type === 'admission_document') {
                isAdmissionDocumentExist = true;
              }
            });
          }

          this.answerTypesForExpectedDocument = this.questionnaireConsts.expectedDocumentTypes;

          step = this.insureAllNonFieldIsEditable(step); // prevent errors that some non-field becomes non-editable when form is duplicated
          // console.log('step after all non field is editable becomes', step);
          this.handleStepCondition(step);
          this.templateStepForm.patchValue(step);
          // console.log('patch value', this.templateStepForm.value);
          this.formBuilderService.setStepData(step);
          this.initialStepForm = _.cloneDeep(this.templateStepForm.value);
          this.initialStepData = _.cloneDeep(step);
          this.isFormChanged();
          this.initValueChanges();
          if (this.isPublished) {
            this.templateStepForm.disable();
            this.getSegmentFormarray().disable();
            if (this.getQuestionsFormarray.length) {
              this.getQuestionsFormarray().disable();
            }
          }

          // *************** set value of answerTypesForExpectedDocument when isAdmissionDocumentExist is true or false
          if (isAdmissionDocumentExist) {
            const tempData = this.answerTypesForExpectedDocument.filter((temp) => temp?.value !== 'admission_document');
            this.answerTypesForExpectedDocument = tempData;
          }
          this.filterSelectedAnswerType();
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
      },
    );
  }

  initFormUpdateListener() {
    this.subs.sink = this.formBuilderService.stepDetailFormData$.subscribe((resp) => {
      if (resp) {
        this.templateStepForm.patchValue(resp, { emitEvent: true });
        // console.log('now template step form is:', this.templateStepForm.value);
      }
    });
  }
  onWheel(event: Event) {
    event?.preventDefault();
  }
  initValueChanges() {
    this.subs.sink = this.templateStepForm.valueChanges.subscribe(() => {
      this.isFormChanged();
    });
  }

  filterSelectedAnswerType() {
    let selectedAnswer = [];
    const hideSelectedAnswerType = ['admission_document'];
    this.getSegmentFormarray().value.forEach((data) => {
      data?.questions.forEach((question) => {
        if (hideSelectedAnswerType.includes(question.answer_type)) {
          selectedAnswer.push(question.answer_type);
        }
      });
    });
    this.selectedAnswerType = selectedAnswer;
  }

  onCheckAnswerType(event, segmentIndex, questionIndex) {
    this.answerType = event;
    if (this.answerType === 'admission_document') {
      const tempData = this.answerTypesForExpectedDocument.filter((temp) => temp?.value !== 'admission_document');
      this.answerTypesForExpectedDocument = tempData;

      // *************** set and unset validator required
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('question_label').clearValidators();
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('question_label').updateValueAndValidity();
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('question_label').patchValue('');
    } else {
      this.answerTypesForExpectedDocument = this.questionnaireConsts.expectedDocumentTypes;

      // *************** set and unset validator required
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('question_label').setValidators([Validators.required]);
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('question_label').updateValueAndValidity();
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('question_label').patchValue('');
    }
  }

  getDropdown() {
    const filter = {
      form_builder_id: this.templateId,
      is_only_visible_based_on_condition: true,
    };
    this.questionnaireConsts = this.formBuilderService.getQuestionnaireConst();
    this.answerTypesForExpectedDocument = this.questionnaireConsts.expectedDocumentTypes;

    this.docListType = this.formBuilderService.getConditionDocTypeList();
    this.isWaitingForResponse = true;
    this.subs.sink = this.formBuilderService.getAllFormBuilderSteps(filter).subscribe(
      (resp) => {
        if (resp) {
          if (this.listMultipleContractType.includes(this.templateType)) {
            this.conditionalStepsDropdown = resp.filter(
              (step) => step && step._id && step._id !== this.stepId && step?.step_type !== 'step_with_signing_process',
            );
            this.filteredConditionalStepsDropdown = [...this.conditionalStepsDropdown];

            this.conditionalStepsDropdownContract = resp.filter(
              (step) => step && step._id && step._id !== this.stepId && step?.step_type === 'step_with_signing_process',
            );
            this.filteredConditionalStepsDropdownContract = [...this.conditionalStepsDropdownContract];
          } else {
            this.conditionalStepsDropdown = resp.filter((step) => step && step._id && step._id !== this.stepId);
            this.filteredConditionalStepsDropdown = [...this.conditionalStepsDropdown];
          }
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.authService.postErrorLog(err);
        // console.error(err);
        this.isWaitingForResponse = false;
      },
    );

    if (this.templateType && this.templateType === 'quality_file') {
      this.questionnaireFields = this.questionnaireConsts.qualityFileQuestionnaireFields;
    } else if (this.templateType && this.templateType === 'student_admission') {
      this.questionnaireFields = this.questionnaireConsts.questionnaireFields;
    }
  }

  initTemplateStepForm() {
    this.templateStepForm = this.fb.group({
      _id: [null],
      step_title: ['', [Validators.required, removeSpaces]],
      step_type: [null, [Validators.required]],
      direction: [''],
      segments: this.fb.array([]),
    });
  }

  initSegmentForm() {
    return this.fb.group({
      _id: [null],
      segment_title: ['', [Validators.required]],
      questions: this.fb.array([]),
      document_for_condition: [null],
      acceptance_text: [''],
      acceptance_pdf: [''],
      is_rejection_allowed: [false],
      is_on_reject_complete_the_step: [false],
      is_download_mandatory: [false],
      accept_button: [null],
      reject_button: [null],
      is_student_included: [false],
      is_multiple_financial_support: [false],
    });
  }

  initQuestionFieldForm(from?) {
    if (this.templateStepForm.get('step_type').value === 'modality_payment') {
      // Only for modality payment step
      return this.fb.group({
        _id: [null],
        ref_id: [{ value: null, disabled: true }],
        field_type: [null],
        is_field: [true],
        is_editable: [false],
        is_required: [false],
        field_position: [null],
        options: this.fb.array([]),
        question_label: [''],
        is_router_on: [false],
        answer_type: [null],
        numeric_validation: this.fb.group({
          condition: [null],
          number: [null],
          min_number: [null],
          max_number: [null],
          custom_error_text: [null],
        }),
        multiple_option_validation: this.fb.group({
          condition: [null],
          number: [null],
          custom_error_text: [null],
        }),
        text_validation: this.fb.group({
          condition: [null],
          number: [null],
          custom_error_text: [null],
        }),
        special_question: this.fb.group({
          campus_validation: [null],
          document_acceptance_type: [null],
          document_acceptance_text: [null],
          document_acceptance_pdf: [null],
          document_builder_scholar_season_id: [null],
          document_builder_id: [null],
          summary_header: [null],
          summary_footer: [null],
        }),
        parent_child_options: [[]],
        final_message_question: this.fb.group({
          final_message_image: this.fb.group({
            name: null,
            s3_file_name: null,
          }),
          final_message_summary_header: null,
          final_message_summary_footer: null,
        }),
        modality_question_type: from ? from : null,
      });
    } else {
      // For other modality payment step
      return this.fb.group({
        _id: [null],
        ref_id: [{ value: null, disabled: true }],
        field_type: [null],
        is_field: [
          this.templateStepForm &&
          this.templateStepForm.get('step_type').value &&
          this.templateStepForm.get('step_type').value === 'document_expected'
            ? false
            : true,
        ],
        is_editable: [false],
        is_required: [false],
        field_position: [null],
        options: this.fb.array([]),
        question_label: [''],
        is_router_on: [false],
        is_router_contract_on: [false],
        answer_type: [
          this.templateStepForm &&
          this.templateStepForm.get('step_type').value &&
          this.templateStepForm.get('step_type').value === 'document_expected'
            ? 'document_pdf_upload'
            : null,
        ],
        numeric_validation: this.fb.group({
          condition: [null],
          number: [null],
          min_number: [null],
          max_number: [null],
          custom_error_text: [null],
        }),
        multiple_option_validation: this.fb.group({
          condition: [null],
          number: [null],
          custom_error_text: [null],
        }),
        text_validation: this.fb.group({
          condition: [null],
          number: [null],
          custom_error_text: [null],
        }),
        special_question: this.fb.group({
          campus_validation: [null],
          document_acceptance_type: [null],
          document_acceptance_text: [null],
          document_acceptance_pdf: [null],
          document_builder_scholar_season_id: [null],
          document_builder_id: [null],
          summary_header: [null],
          summary_footer: [null],
        }),
        parent_child_options: [[]],
        final_message_question: this.fb.group({
          final_message_image: this.fb.group({
            name: null,
            s3_file_name: null,
          }),
          final_message_summary_header: null,
          final_message_summary_footer: null,
        }),
        modality_question_type: null,
      });
    }
  }

  initOptionFieldForm(): UntypedFormGroup {
    if (this.listMultipleContractType.includes(this.templateType)) {
      return this.fb.group({
        option_name: [null],
        is_continue_next_step: [false],
        is_go_to_final_step: [false],
        is_go_to_final_message: [false],
        additional_step_id: [null],
        additional_step_name: [null], // This won't be sent to BE
        additional_contract_step_id: [null],
        additional_contract_name: [null], // This won't be sent to BE
      });
    } else {
      return this.fb.group({
        option_name: [null],
        is_continue_next_step: [false],
        is_go_to_final_step: [false],
        is_go_to_final_message: [false],
        additional_step_id: [null],
        additional_step_name: [null], // This won't be sent to BE
      });
    }
  }

  initSegmentListener() {
    // listen to changes in template step form to pass data to preview
    this.subs.sink = this.templateStepForm.valueChanges.subscribe((formData) => {
      this.formBuilderService.setStepData(this.templateStepForm.value);
    });
  }

  getSegmentFormarray(): UntypedFormArray {
    return this.templateStepForm.get('segments') as UntypedFormArray;
  }

  getQuestionsFormarray(): UntypedFormArray {
    return this.getSegmentFormarray().get('questions') as UntypedFormArray;
  }

  onAnswerTypeChange($event, questionField) {
    // console.log('EVENT NIH', $event);
    if ($event === 'numeric') {
      const group = questionField.get('text_validation') as UntypedFormGroup;
      group.get('condition').patchValue(null);
      group.get('number').patchValue(null);
      group.get('custom_error_text').patchValue(null);
      group.updateValueAndValidity();
    } else if ($event === 'short_text' || $event === 'long_text') {
      const group = questionField.get('numeric_validation') as UntypedFormGroup;
      group.get('condition').patchValue(null);
      group.get('number').patchValue(null);
      group.get('custom_error_text').patchValue(null);
      group.updateValueAndValidity();
    } else if ($event === 'multiple_option' || $event === 'dropdown_multiple_option') {
      const group = questionField.get('multiple_option_validation') as UntypedFormGroup;
      group.get('condition').patchValue(null);
      group.get('number').patchValue(null);
      group.get('custom_error_text').patchValue(null);
      group.updateValueAndValidity();
    } else {
      const groupText = questionField.get('text_validation') as UntypedFormGroup;
      groupText.get('condition').patchValue(null);
      groupText.get('number').patchValue(null);
      groupText.get('custom_error_text').patchValue(null);
      groupText.updateValueAndValidity();

      const groupNumeric = questionField.get('numeric_validation') as UntypedFormGroup;
      groupNumeric.get('condition').patchValue(null);
      groupNumeric.get('number').patchValue(null);
      groupNumeric.get('custom_error_text').patchValue(null);
      groupNumeric.updateValueAndValidity();

      const groupMultipleOption = questionField.get('multiple_option_validation') as UntypedFormGroup;
      groupMultipleOption.get('condition').patchValue(null);
      groupMultipleOption.get('number').patchValue(null);
      groupMultipleOption.get('custom_error_text').patchValue(null);
      groupMultipleOption.updateValueAndValidity();
    }
  }

  openTableKey() {
    const url = this.router.createUrlTree(['form-builder/key-table'], {
      queryParams: {
        lang: this.translate.currentLang,
        stepId: this.stepId,
      },
    });
    window.open(url.toString(), '_blank', 'height=570,width=520,scrollbars=yes,top=250,left=900');
  }

  addSegmentForm(dialog?: string) {
    if (dialog === 'Open Dialog') {
      this.subs.sink = this.dialog
        .open(AddSegmentFormBuilderDialogComponent, {
          width: '400px',
          minHeight: '100px',
          panelClass: 'certification-rule-pop-up',
          disableClose: true,
        })
        .afterClosed()
        .subscribe((response) => {
          if (response) {
            this.getSegmentFormarray().push(this.initSegmentForm());
            this.getSegmentFormarray()
              .at(this.getSegmentFormarray().length - 1)
              .get('segment_title')
              .patchValue(response.addSegment);

            setTimeout(() => {
              if (this.blockPanel && this.blockPanel.last && this.blockPanel.length) {
                // console.log(this.blockPanel.toArray());
                // console.log(this.blockPanel.toArray()[this.blockPanel.length - 1]);
                this.blockPanel.toArray()[this.blockPanel.length - 1].nativeElement.scrollIntoView({ behavior: 'smooth' });
              }
            }, 500);
            // console.log('this is the block panel : ' + this.blockPanel);
          }
        });
    } else {
      this.getSegmentFormarray().push(this.initSegmentForm());
    }
  }

  removeSegmentForm(segmentIndex) {
    this.getSegmentFormarray().removeAt(segmentIndex);
  }

  getQuestionFieldFormArray(segmentIndex): UntypedFormArray {
    return this.getSegmentFormarray()?.get(segmentIndex.toString())?.get('questions') as UntypedFormArray;
  }

  getOptionsFormArrayFrom(questionField: UntypedFormGroup) {
    return questionField.get('options') as UntypedFormArray;
  }

  addQuestionFieldForm(segmentIndex, from?) {
    const group = this.initQuestionFieldForm();
    // if (typeof questionType === 'string') this.onAnswerTypeChange(questionType, group);
    if (from) {
      // Only for modality payment step
      this.getQuestionFieldFormArray(segmentIndex).push(this.initQuestionFieldForm(from));
    } else {
      // For other than modality payment step
      this.getQuestionFieldFormArray(segmentIndex).push(this.initQuestionFieldForm());
    }
    // console.log('template form', this.templateStepForm.get('segments').value.length);
  }

  scrollIntoLastQuestion(segmentIndex, from?) {
    setTimeout(() => {
      if (this.questionPanel && this.questionPanel.length) {
        this.getQuestionFieldFormArray(segmentIndex).updateValueAndValidity();
        let length = 0;
        if (from && from === 'student') {
          // Only for modality payment step
          const studentQuestion = this.getQuestionFieldFormArray(segmentIndex).value.filter(
            (res) => res.modality_question_type === 'student',
          );
          if (studentQuestion) {
            if (segmentIndex === 0) {
              length = studentQuestion.length;
            } else if (segmentIndex > 0) {
              for (let index = segmentIndex; index >= 0; index--) {
                if (index > 0) {
                  length += this.getQuestionFieldFormArray(index - 1).length;
                }
              }
              length += studentQuestion.length;
            }
          }
        } else {
          // For other than modality payment step
          for (let index = segmentIndex; index >= 0; index--) {
            length += this.getQuestionFieldFormArray(index).length;
          }
        }
        this.questionPanel.toArray()[length - 1].nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 1000);
    this.filterSelectedAnswerType();
  }

  removeQuestionFieldForm(segmentIndex, questionIndex) {
    this.getQuestionFieldFormArray(segmentIndex).removeAt(questionIndex);
    this.filterSelectedAnswerType();

    // *************** reset the value when question with answer_type === admission_document is removed
    const tempData = this.getQuestionFieldFormArray(segmentIndex).value;
    for (let value of tempData) {
      if (value?.answer_type === 'admission_document') {
        const tempData = [];
        this.answerTypesForExpectedDocument.forEach((temp) => {
          if (temp.value !== this.answerType) {
            tempData.push(temp);
          }
        });
        break;
      } else {
        this.answerTypesForExpectedDocument = this.questionnaireConsts.expectedDocumentTypes;
      }
    }
  }

  checkIsParentChild(question) {
    if (question && question.answer_type === 'parent_child_option' && question.is_field === false) {
      return true;
    }
    return false;
  }

  checkIsMutiOption(question, data?) {
    if (
      question &&
      (question.answer_type === 'multiple_option' ||
        question.answer_type === 'single_option' ||
        question.answer_type === 'single_option_diploma' ||
        question.answer_type === 'dropdown_single_option' ||
        question.answer_type === 'dropdown_multiple_option' ||
        question.answer_type === 'single_option_readmission_yes_or_no' ||
        question.answer_type === 'single_option_reason_not_readmission') &&
      question.is_field === false
    ) {
      return true;
    }
    return false;
  }

  addMoreAnswers(segmentIndex, questionIndex, elementRef) {
    if (elementRef.value) {
      const childOptions = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('parent_child_options').value;
      const optionPosition = childOptions.length;

      childOptions.push({
        option_text: elementRef.value,
        position: optionPosition,
        questions: [],
      });

      elementRef.value = '';
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('parent_child_options').patchValue(childOptions);

      // console.log(this.getQuestionFieldFormArray(segmentIndex).value);
    }
  }

  addMoreOptions(segmentIndex, questionIndex, optionText, diploma?) {
    // console.log(optionText.value);
    const option = this.initOptionFieldForm();
    const options = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options') as UntypedFormArray;
    if (diploma) {
      option.patchValue({ option_name: optionText });
    } else {
      option.patchValue({ option_name: optionText.value });
    }
    options.push(option);

    if (this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('is_router_on').value) {
      // if (this.templateType === 'teacher_contract') {
      const currentQuestion: AbstractControl = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex);
      const optionLength = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options').value;
      if (optionLength?.length) {
        optionLength.forEach((element, idx) => {
          this.getQuestionFieldFormArray(segmentIndex)
            ?.at(questionIndex)
            ?.get('options')
            ?.get(idx.toString())
            ?.get('additional_step_name')
            ?.setValidators(Validators.required);
          this.getQuestionFieldFormArray(segmentIndex)
            ?.at(questionIndex)
            ?.get('options')
            ?.get(idx.toString())
            ?.get('additional_step_name')
            ?.updateValueAndValidity();
        });
        currentQuestion.updateValueAndValidity(); // updating value and validity to be safe
      }
      // }
    }

    if (this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('is_router_contract_on').value) {
      if (this.listMultipleContractType.includes(this.templateType)) {
        const currentQuestion: AbstractControl = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex);
        const optionLength = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options').value;
        if (optionLength?.length) {
          optionLength.forEach((element, idx) => {
            this.getQuestionFieldFormArray(segmentIndex)
              ?.at(questionIndex)
              ?.get('options')
              ?.get(idx.toString())
              ?.get('additional_contract_name')
              ?.setValidators(Validators.required);
            this.getQuestionFieldFormArray(segmentIndex)
              ?.at(questionIndex)
              ?.get('options')
              ?.get(idx.toString())
              ?.get('additional_contract_name')
              ?.updateValueAndValidity();
          });
          currentQuestion.updateValueAndValidity(); // updating value and validity to be safe
        }
      }
    }
    // console.log(this.getQuestionFieldFormArray(segmentIndex).value);
  }

  removeOption(segmentIndex, questionIndex, optionIndex, questionField?) {
    Swal.fire({
      title: this.translate.instant('MENTOREVALUATION.QUESTIONNAIRE.Messages.deletedOptionWarningTitle'),
      type: 'warning',
      showCancelButton: true,
      allowEscapeKey: true,
      confirmButtonText: this.translate.instant('YES'),
      cancelButtonText: this.translate.instant('NO'),
    }).then((res) => {
      if (res.value) {
        // console.log(segmentIndex, questionIndex, optionIndex);
        const options = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options') as UntypedFormArray;
        options.removeAt(optionIndex);
        if (!options?.value?.length) {
          questionField.get('is_router_on').patchValue(false);
          questionField.get('is_router_contract_on').patchValue(false);
        }
        // console.log(this.getQuestionFieldFormArray(segmentIndex).value);
        Swal.fire({
          title: 'Deleted!',
          text: this.translate.instant('MENTOREVALUATION.QUESTIONNAIRE.Messages.deletedOptionSuccess'),
          allowEscapeKey: true,
          type: 'success',
        });
      }
    });
  }

  updateFieldToggle(event: MatSlideToggleChange, segmentIndex: number, questionIndex: number) {
    if (event.checked) {
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('answer_type').patchValue(null); // make answer type to null if is_field is turned on
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('is_editable').patchValue(false);
    } else {
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('field_type').patchValue(null); // make field type to null if is_field is turned off
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('is_editable').patchValue(true);
    }
  }

  updateEditableToggle(event: MatSlideToggleChange, segmentIndex: number, questionIndex: number) {
    if (event.checked) {
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('is_required').patchValue(true);
    } else {
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('is_required').patchValue(false);
    }
  }

  dropSegment(event: CdkDragDrop<string[]>) {
    if (!this.isPublished) {
      if (event.previousContainer === event.container) {
        const subModuleDrop = event.container.data;
        // console.log(event.container.data, subModuleDrop);
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        this.getSegmentFormarray().updateValueAndValidity({ onlySelf: false });
      } else {
        // console.log(event.container.data);
        transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        this.getSegmentFormarray().updateValueAndValidity({ onlySelf: false });
      }
    }
  }

  dropQuestion(event: CdkDragDrop<string[]>, segmentIndex: number) {
    // console.log(event);
    if (event.previousContainer === event.container) {
      const subModuleDrop = event.container.data;
      // console.log(event.container.data, subModuleDrop);
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.getQuestionFieldFormArray(segmentIndex).updateValueAndValidity({ onlySelf: false });
    } else {
      // console.log(event.container.data);
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this.getQuestionFieldFormArray(segmentIndex).updateValueAndValidity({ onlySelf: false });
    }
  }

  displayNextStepWithFn(value) {
    if (value === 'Continue Next Step' || value === 'Go To Final Step' || value === 'Go To Final Message') {
      return this.translate.instant(value);
    } else {
      return value;
    }
  }

  onNextStepType($event, questionField, optionIndex, type) {
    if (!$event.target.value) {
      this.filteredConditionalStepsDropdown = [...this.conditionalStepsDropdown];
    } else {
      this.filteredConditionalStepsDropdown = this.conditionalStepsDropdown.filter((step) => {
        const isSane = step && typeof step.step_title === 'string';
        return isSane && step.step_title.toLowerCase().trim().includes($event.target.value.toLowerCase().trim());
      });
    }

    if (this.listMultipleContractType.includes(this.templateType)) {
      if (type === 'contract') {
        questionField?.get('options')?.at(optionIndex)?.get('additional_contract_step_id').patchValue(null);
      } else {
        questionField?.get('options')?.at(optionIndex)?.get('additional_step_id').patchValue(null);
      }
    }
  }

  handleChangeAnswerLabel($event, segmentIndex, questionIndex, optionIndex) {
    const options = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options') as UntypedFormArray;
    if ($event?.target?.value) {
      options.controls[optionIndex].patchValue({ option_name: $event?.target?.value });
    }
    options.updateValueAndValidity();
  }

  onSelectNextStepAt(idx: number, field: UntypedFormGroup, value, type?) {
    const options = field.get('options') as UntypedFormArray;
    const option = options.at(idx) as UntypedFormGroup;
    if (typeof value === 'string') {
      option.patchValue({
        additional_step_id: null,
        additional_step_name: value,
        is_continue_next_step: value === 'Continue Next Step',
        is_go_to_final_step: value === 'Go To Final Step',
        is_go_to_final_message: value === 'Go To Final Message',
      });
    } else if (typeof value === 'object' && typeof value._id === 'string' && typeof value.step_title === 'string') {
      const isFinalStep = value.is_final_step ? value.is_final_step : false;
      option.patchValue({
        additional_step_id: type ? option.get('additional_step_id').value : value._id,
        additional_step_name: type ? option.get('additional_step_name').value : value.step_title,
        is_continue_next_step: !isFinalStep,
        is_go_to_final_step: isFinalStep,
        is_go_to_final_message: false,
        additional_contract_step_id: type ? value._id : option.get('additional_contract_step_id').value,
        additional_contract_name: type ? value.step_title : option.get('additional_contract_name').value,
      });
    }

    this.filteredConditionalStepsDropdown = [...this.conditionalStepsDropdown];
  }

  onAllowRejectionChange($event: MatSlideToggleChange, segmentRef: UntypedFormGroup) {
    if (!$event.checked) {
      segmentRef.get('is_on_reject_complete_the_step').setValue(false);
      segmentRef.get('reject_button').setValue(null);
      segmentRef.get('reject_button').markAsUntouched();
      segmentRef.get('reject_button').markAsPristine();
      segmentRef.get('reject_button').clearValidators();
      segmentRef.get('reject_button').setErrors(null);
    } else if ($event.checked) {
      segmentRef.get('reject_button').setValidators([Validators.required]);
    }
  }

  cleanNullValues(obj) {
    return Object.keys(obj).forEach((key) => {
      if (obj[key] && typeof obj[key] === 'object') {
        this.cleanNullValues(obj[key]);
      } else if (obj[key] === null) {
        delete obj[key];
      } else if (key === 'additional_step_name' || key === 'additional_contract_name') {
        delete obj[key];
      }
    });
  }

  insureAllNonFieldIsEditable(stepData) {
    return {
      ...stepData,
      segments: stepData.segments.map((segment) => ({
        ...segment,
        questions: segment.questions.map((question) => ({
          ...question,
          is_editable: question && !question.is_field ? true : question.is_editable,
        })),
      })),
    };
  }

  saveStepData() {
    this.isWaitingForResponse = true;
    let payload = { ...this.initialStepData, ...this.templateStepForm.getRawValue() };
    this.cleanNullValues(payload);
    if (payload.hasOwnProperty('count_document')) delete payload.count_document;
    if (payload.segments && payload.segments.length) {
      payload.segments.forEach((segment) => {
        if (segment.questions && segment.questions.length) {
          segment.questions.forEach((question) => {
            if (question.hasOwnProperty('count_document')) delete question.count_document;
          });
        }
      });
    }

    // an assurance to set all non-field questions to be editable because there is an issue on duplicate template that makes non-field field to be non editable
    // prevents issue that there are non-field question that cannot be edited because is_editable becomes false
    payload = this.insureAllNonFieldIsEditable(payload);

    if (payload.validator && payload.validator._id) {
      payload.validator = payload.validator._id;
    }
    if (payload.user_who_complete_step && payload.user_who_complete_step._id) {
      payload.user_who_complete_step = payload.user_who_complete_step._id;
    }
    // console.log(payload);
    this.subs.sink = this.formBuilderService.createUpdateFormBuilderStep(payload).subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          this.initialStepForm = _.cloneDeep(this.templateStepForm.value);
          this.initTemplateStepForm();
          this.isFormChanged();
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then((action) => {
            this.formBuilderService.setStepData(null);
            this.updateTabs.emit(true);
            this.populateStepData();
            this.initSegmentListener();
          });
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (error) => {
        this.authService.postErrorLog(error);
        this.isWaitingForResponse = false;
        if (error.message && error.message === 'GraphQL error: pre contract template step name already exist') {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('Uniquename_S1.TITLE'),
            text: this.translate.instant('Uniquename_S1.TEXT'),
            confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  isFormChanged() {
    const initialStepForm = JSON.stringify(this.initialStepForm);
    const currentForm = JSON.stringify(this.templateStepForm.value);
    if (initialStepForm === currentForm) {
      this.formBuilderService.childrenFormValidationStatus = true;
      return true;
    } else {
      this.formBuilderService.childrenFormValidationStatus = false;
      return false;
    }
  }

  formIsSame() {
    const initialData = _.cloneDeep(this.initialStepForm);
    const currentData = _.cloneDeep(this.templateStepForm.value);
    const equalForm = _.isEqual(initialData, currentData);
    return equalForm;
  }

  selectDocumentExpectedType(event, segmentIndex, questionIndex) {
    let text = '';
    switch (event) {
      case 'diploma':
        text = 'Diplôme';
        break;
      case 'exemption_block_justification':
        text = 'Dispense';
        break;
      case 'derogation':
        text = 'Dérogation';
        break;
      default:
        text = '';
        break;
    }
    this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('question_label').patchValue(text);
  }

  leave() {
    this.checkIfAnyChildrenFormInvalid();
  }

  checkIfAnyChildrenFormInvalid() {
    if (!this.formBuilderService.childrenFormValidationStatus) {
      this.fireUnsavedDataWarningSwal();
    } else {
      this.router.navigate(['form-builder']);
    }
  }

  fireUnsavedDataWarningSwal() {
    if (!this.isPublished) {
      return Swal.fire({
        type: 'warning',
        title: this.translate.instant('TMTC_S01.TITLE'),
        text: this.translate.instant('TMTC_S01.TEXT'),
        confirmButtonText: this.translate.instant('TMTC_S01.BUTTON_1'),
        showCancelButton: true,
        cancelButtonText: this.translate.instant('TMTC_S01.BUTTON_2'),
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.value) {
          // I will save first
          return;
        } else {
          // discard changes
          this.formBuilderService.childrenFormValidationStatus = true;
          this.router.navigate(['form-builder']);
        }
      });
    } else {
      // discard changes
      this.formBuilderService.childrenFormValidationStatus = true;
      this.router.navigate(['form-builder']);
    }
  }

  handleStepCondition(step) {
    // console.log('handling step');
    if (step.segments && step.segments.length) {
      step.segments.forEach((segment, segmentIndex) => {
        this.addSegmentForm();

        if (segment && segment.questions && segment.questions.length) {
          segment.questions.forEach((question, questionIndex) => {
            // if BE return null instead object create null into object
            if (!question.numeric_validation) question.numeric_validation = {};
            if (!question.final_message_question) question.final_message_question = {};
            if (!question.text_validation) question.text_validation = {};
            if (!question.multiple_option_validation) question.multiple_option_validation = {};
            if (question.final_message_question && !question.final_message_question.final_message_image) {
              question.final_message_question.final_message_image = {};
            }
            if (!question.special_question) question.special_question = {};
            if (!question.parent_child_options) question.parent_child_options = [];
            this.addQuestionFieldForm(segmentIndex, question.answer_type);

            if (question && question.options && question.options.length) {
              question.options.forEach((option, optionIdx) => {
                const question = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex) as UntypedFormGroup;
                const options = question.get('options') as UntypedFormArray;
                const group = this.initOptionFieldForm();
                let matchedStep;
                let matchedStepContract;
                if (this.conditionalStepsDropdown && this.conditionalStepsDropdown.length) {
                  matchedStep = this.conditionalStepsDropdown.find((step) => {
                    const isSane =
                      step &&
                      typeof step.step_title === 'string' &&
                      typeof step._id === 'string' &&
                      option &&
                      typeof option.additional_step_id === 'string';
                    return isSane && step._id === option.additional_step_id;
                  });
                }
                if (this.listMultipleContractType.includes(this.templateType) && this.conditionalStepsDropdownContract?.length) {
                  matchedStepContract = this.conditionalStepsDropdownContract.find((step) => {
                    const isSane =
                      step &&
                      typeof step.step_title === 'string' &&
                      typeof step._id === 'string' &&
                      option &&
                      typeof option.additional_contract_step_id === 'string';
                    return isSane && step._id === option.additional_contract_step_id;
                  });
                }
                group.patchValue({
                  additional_step_name: (() => {
                    if (matchedStep && matchedStep.step_title) return matchedStep.step_title;
                    else if (option && option.is_continue_next_step) return this.translate.instant('Continue Next Step');
                    else if (option && option.is_go_to_final_step) return this.translate.instant('Go To Final Step');
                    else if (option && option.is_go_to_final_message) return this.translate.instant('Go To Final Message');
                    else return null;
                  })(),
                  additional_contract_name: (() => {
                    if (matchedStepContract && matchedStepContract.step_title) return matchedStepContract.step_title;
                    else return null;
                  })(),
                });
                options.push(group);
              });

              if (question?.is_router_on) {
                const currentQuestion: AbstractControl = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex);
                const optionLength = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options').value;
                if (optionLength?.length) {
                  optionLength.forEach((element, idx) => {
                    this.getQuestionFieldFormArray(segmentIndex)
                      ?.at(questionIndex)
                      ?.get('options')
                      ?.get(idx.toString())
                      ?.get('additional_step_name')
                      ?.setValidators(Validators.required);
                    this.getQuestionFieldFormArray(segmentIndex)
                      ?.at(questionIndex)
                      ?.get('options')
                      ?.get(idx.toString())
                      ?.get('additional_step_name')
                      ?.updateValueAndValidity();
                  });
                  currentQuestion.updateValueAndValidity(); // updating value and validity to be safe
                }
              }

              if (question?.is_router_contract_on) {
                if (this.listMultipleContractType.includes(this.templateType)) {
                  const currentQuestion: AbstractControl = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex);
                  const optionLength = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options').value;
                  if (optionLength?.length) {
                    optionLength.forEach((element, idx) => {
                      this.getQuestionFieldFormArray(segmentIndex)
                        ?.at(questionIndex)
                        ?.get('options')
                        ?.get(idx.toString())
                        ?.get('additional_contract_name')
                        ?.setValidators(Validators.required);
                      this.getQuestionFieldFormArray(segmentIndex)
                        ?.at(questionIndex)
                        ?.get('options')
                        ?.get(idx.toString())
                        ?.get('additional_contract_name')
                        ?.updateValueAndValidity();
                    });
                    currentQuestion.updateValueAndValidity(); // updating value and validity to be safe
                  }
                }
              }
            }
          });
        }
      });
    } else if (
      (step.step_type && step.step_type === 'condition_acceptance') ||
      (step.step_type && step.step_type === 'document_expected')
    ) {
      this.addSegmentForm();
    } else if (
      step.step_type &&
      (step.step_type === 'summary' || step.step_type === 'final_message' || step.step_type === 'campus_validation')
    ) {
      this.addCampusValidationForm();
    } else if (step && step.step_type && step.step_type == 'document_to_validate') {
      // console.log('goes here');
      this.addSegmentForm();
      this.addQuestionFieldForm(0);
    }
  }

  addCampusValidationForm() {
    this.getSegmentFormarray().push(this.initSegmentForm());
    // console.log(this.templateStepForm.value);
    this.templateStepForm.value.segments.forEach((segments, segmentIndex) => {
      this.addQuestionFieldForm(segmentIndex);
    });
  }

  handleDocumentSelected(value, index, questionIndex?) {
    // console.log('_ev', value);
    this.deletePDF(index, questionIndex); // clean data of previous uploaded doc if any

    this.selectedDocType = value;

    if (this.selectedDocType === 'doc_builder') {
      this.getAllDocumentBuilders();
    }

    this.resetSpecialQuestion(index, questionIndex);

    this.getSegmentFormarray().at(index).get('acceptance_text').patchValue(null); // make the text to nul on changes to type
    this.getSegmentFormarray().at(index).get('acceptance_pdf').patchValue(null); // make the acceptance_pdf to null on changes to type
    this.templateStepForm.updateValueAndValidity();
    // console.log('after changing upload type', this.templateStepForm.value);
    this.formBuilderService.setStepData(this.templateStepForm.value); // set the new templateform to the preview
  }

  resetSpecialQuestion(index, questionIndex) {
    this.getQuestionFieldFormArray(index).at(questionIndex).get('special_question').get('campus_validation').patchValue(null);
    this.getQuestionFieldFormArray(index).at(questionIndex).get('special_question').get('document_acceptance_text').patchValue(null);
    this.getQuestionFieldFormArray(index).at(questionIndex).get('special_question').get('document_acceptance_pdf').patchValue(null);
    this.getQuestionFieldFormArray(index)
      .at(questionIndex)
      .get('special_question')
      .get('document_builder_scholar_season_id')
      .patchValue(null);
    this.getQuestionFieldFormArray(index)
      .at(questionIndex)
      .get('special_question')
      .get('document_builder_scholar_season_id')
      .clearValidators();
    this.getQuestionFieldFormArray(index).at(questionIndex).get('special_question').get('document_builder_id').patchValue(null);
    if (this.selectedDocType !== 'doc_builder') {
      this.getQuestionFieldFormArray(index).at(questionIndex).get('special_question').get('document_builder_id').clearValidators();
      this.getQuestionFieldFormArray(index).at(questionIndex).get('special_question').get('document_builder_id').updateValueAndValidity();
    }
    this.getQuestionFieldFormArray(index).at(questionIndex).get('special_question').get('summary_header').patchValue(null);
    this.getQuestionFieldFormArray(index).at(questionIndex).get('special_question').get('summary_footer').patchValue(null);
  }

  openUploadWindow() {
    this.fileUploaderDoc.nativeElement.click();
  }

  chooseFile(fileInput: Event, index, questionIndex) {
    // console.log('choose file');
    const acceptable = ['jpg', 'jpeg', 'png', 'pdf'];
    const file = (<HTMLInputElement>fileInput.target).files[0];
    // console.log(file);
    const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
    if (acceptable.includes(fileType)) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          // console.log('_resp upload', resp);
          this.isWaitingForResponse = false;
          if (resp) {
            if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
              this.photo = resp.file_url;
              // console.log(this.getQuestionFieldFormArray(index).at(questionIndex).get('final_message_question').get('final_message_image'));
              this.getQuestionFieldFormArray(index)
                .at(questionIndex)
                .get('final_message_question')
                .get('final_message_image')
                .get('s3_file_name')
                .patchValue(resp.s3_file_name);
              this.getQuestionFieldFormArray(index)
                .at(questionIndex)
                .get('final_message_question')
                .get('final_message_image')
                .get('name')
                .patchValue(resp.file_name);
            } else {
              this.listUploadDocumentPDF = '';
              this.getSegmentFormarray().at(index).get('acceptance_pdf').patchValue(resp.s3_file_name);
              this.getQuestionFieldFormArray(index)
                .at(questionIndex)
                .get('special_question')
                .get('document_acceptance_pdf')
                .patchValue(resp.s3_file_name);
              this.listUploadDocumentPDF = resp.s3_file_name;
              this.fileUploaderDoc.nativeElement = '';
            }
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
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
        text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.jpg, .jpeg, .png, .pdf' }),
        allowEscapeKey: false,
        allowOutsideClick: false,
        allowEnterKey: false,
      });
    }
  }

  removeImage(segmentIndex, questionIndex) {
    let timeout = 5;
    let confirmInterval;
    const imageName = this.getQuestionFieldFormArray(segmentIndex)
      .at(questionIndex)
      .get('final_message_question')
      .get('final_message_image')
      .get('name').value;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('Delete_Image_S1.TITLE', { imageName }),
      html: this.translate.instant('Delete_Image_S1.TEXT', { imageName }),
      confirmButtonText: this.translate.instant('Delete_Image_S1.BUTTON_1', { timeout }),
      cancelButtonText: this.translate.instant('Delete_Image_S1.BUTTON_2'),
      showCancelButton: true,
      onOpen: () => {
        timeout--;
        Swal.disableConfirmButton();
        const confirmButtonRef = Swal.getConfirmButton();
        confirmInterval = setInterval(() => {
          if (timeout > 0) {
            confirmButtonRef.innerText = this.translate.instant('Delete_Image_S1.BUTTON_1', { timeout });
            timeout--;
          } else {
            Swal.enableConfirmButton();
            confirmButtonRef.innerText = this.translate.instant('YES');
            clearInterval(confirmInterval);
          }
        }, 1000);
      },
    }).then((result) => {
      clearInterval(confirmInterval);
      if (result.value) {
        this.getQuestionFieldFormArray(segmentIndex)
          .at(questionIndex)
          .get('final_message_question')
          .get('final_message_image')
          .get('s3_file_name')
          .setValue('');
        this.getQuestionFieldFormArray(segmentIndex)
          .at(questionIndex)
          .get('final_message_question')
          .get('final_message_image')
          .get('name')
          .setValue('');
      }
    });
  }

  deletePDF(index, questionIndex?) {
    this.listUploadDocumentPDF = '';
    this.getSegmentFormarray().at(index).get('acceptance_text').patchValue(null); // make the text to nul on changes to type
    this.getSegmentFormarray().at(index).get('acceptance_pdf').patchValue(null); // make the acceptance_pdf to null on changes to type
    this.getQuestionFieldFormArray(index).at(questionIndex).get('special_question').get('document_acceptance_pdf').patchValue(null);
    this.templateStepForm.updateValueAndValidity();
    this.formBuilderService.setStepData(this.templateStepForm.value); // set the new templateform to the preview
  }

  get parentChildValidation() {
    return this.formBuilderService.parentChildValidation;
  }

  validationOptionParentAndChild() {
    let shouldDisable = false;
    this.templateStepForm.value.segments.forEach((segments, segmentIndex) => {
      segments.questions.forEach((question, questionIndex) => {
        if (question.answer_type === 'parent_child_option') {
          if (question && question.parent_child_options && question.parent_child_options.length < 1) {
            shouldDisable = true;
          }
        } else if (
          question.answer_type === 'multiple_option' ||
          question.answer_type === 'single_option' ||
          question.answer_type === 'single_option_diploma' ||
          question.answer_type === 'dropdown_single_option' ||
          question.answer_type === 'dropdown_multiple_option'
        ) {
          if (question && question.options && question.options.length < 1) {
            shouldDisable = true;
          }
        }
      });
    });
    return shouldDisable;
  }

  handleDocumentBuilderScholarSeasonSelected(segmentIndex, questionIndex) {
    // enable document_builder_id
    this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('special_question').get('document_builder_id').enable();
    this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('special_question').get('document_builder_id').patchValue(null);
    this.getAllDocumentBuilders();
  }

  getAllDocumentBuilders() {
    const filter = {
      status: true,
      hide_form: false,
    };
    this.subs.sink = this.documentService.getAllDocumentsDropdown(filter).subscribe(
      (resp) => {
        if (resp?.length) {
          this.documentBuilders = _.cloneDeep(resp.sort((a, b) => a.document_builder_name.localeCompare(b.document_builder_name, undefined, { caseFirst: 'lower' })));
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp) {
          this.scholars = resp;
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  handleStepTypeDocumentToValidatePopulation(step) {
    if (step.segments && step.segments.length) {
      step.segments.forEach((segment, segmentIndex) => {
        if (segment && segment.questions && segment.questions.length) {
          segment.questions.forEach((question, questionIndex) => {
            if (
              step &&
              step.step_type === 'document_to_validate' &&
              question.special_question &&
              question.special_question.document_acceptance_type
            ) {
              this.selectedDocType = question.special_question.document_acceptance_type;
            }
            if (
              step &&
              step.step_type === 'document_to_validate' &&
              question.special_question &&
              question.special_question.document_acceptance_type === 'doc_builder'
            ) {
              // this.getScholarSeasons();
              this.getAllDocumentBuilders();
            }
            if (
              step &&
              step.step_type === 'document_to_validate' &&
              question.special_question &&
              question.special_question.document_acceptance_type === 'upload_pdf'
            ) {
              this.listUploadDocumentPDF = question.special_question.document_acceptance_pdf;
            }
          });
        }
      });
    }
  }
  checkAnswerType(segmentIndex, questionIndex, answerTypeValue) {
    this.onChangeAnswerType(segmentIndex, questionIndex, answerTypeValue);
    const dataOption = ['J’ai eu mon Bac', 'Je n’ai pas eu mon Bac', 'Je suis admis(e) au rattrapage'];
    console.log('Data selected');
    const answerType = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('answer_type').value;
    console.log('answerType', answerType);
    if (answerType === 'single_option_diploma') {
      dataOption.map((data) => this.addMoreOptions(segmentIndex, questionIndex, data, true));
      this.getQuestionFieldFormArray(segmentIndex)
        .at(questionIndex)
        .get('question_label')
        .patchValue('Veuillez sélectionner votre réponse parmi les choix ci-dessous et cliquer sur "Envoyer"');
    }
  }

  onChangeAnswerType(segmentIndex: number, questionIndex: number, answerTypeValue: string, from?) {
    // reset all the inputs
    const currentQuestion: AbstractControl = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex);
    console.log('current Question..', currentQuestion, answerTypeValue);
    const currentIsFieldValue = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('is_field').value;
    const currentIsRequired = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('is_required').value;
    const currentIsEditable = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('is_editable').value;
    currentQuestion.reset(this.initQuestionFieldForm());
    if (from) {
      // Only for modality payment step
      currentQuestion.get('modality_question_type').patchValue(from); // patch the modality question type again
    }
    currentQuestion.get('answer_type').patchValue(answerTypeValue); // patch the answer type again
    currentQuestion.get('parent_child_options').patchValue([]);
    currentQuestion.get('is_editable').patchValue(currentIsEditable);
    currentQuestion.get('is_required').patchValue(currentIsRequired); // patch the is_required  so it is not null
    currentQuestion.get('is_field').patchValue(currentIsFieldValue); // patch the is_field so it is not null
    (currentQuestion.get('options') as UntypedFormArray).clear(); // clear all options
    currentQuestion.updateValueAndValidity(); // updating value and validity to be safe
    if (answerTypeValue === 'single_option_diploma') {
      currentQuestion
        .get('question_label')
        .patchValue('Veuillez sélectionner votre réponse parmi les choix ci-dessous et cliquer sur ’’Envoyer’’');
      this.addMoreOptions(segmentIndex, questionIndex, { value: 'J’ai eu mon Bac' });
      this.addMoreOptions(segmentIndex, questionIndex, { value: 'Je n’ai pas eu mon Bac' });
      this.addMoreOptions(segmentIndex, questionIndex, { value: 'Je suis admis(e) au rattrapage' });
    }

    if (answerTypeValue === 'single_option_readmission_yes_or_no') {
      this.addMoreOptions(segmentIndex, questionIndex, { value: '' });
      this.addMoreOptions(segmentIndex, questionIndex, { value: '' });
    }
  }

  onChangeRouter(event, segmentIndex, questionIndex, answerType, type?) {
    if (!event?.checked) {
      if (answerType === 'single_option_diploma') {
        const currentQuestion: AbstractControl = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex);
        const optionLength = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options').value;
        if (optionLength?.length) {
          if (type === 'contract') {
            optionLength.forEach((element, idx) => {
              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_contract_name')
                ?.clearValidators();
              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_contract_name')
                ?.updateValueAndValidity();
            });
          } else {
            optionLength.forEach((element, idx) => {
              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_step_name')
                ?.clearValidators();
              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_step_name')
                ?.updateValueAndValidity();
            });
          }
          currentQuestion.updateValueAndValidity(); // updating value and validity to be safe
        }
      }

      if (!type) {
        const optionLengthDefault = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options').value;
        optionLengthDefault.forEach((element, idx) => {
          this.getQuestionFieldFormArray(segmentIndex)
            ?.at(questionIndex)
            ?.get('options')
            ?.get(idx.toString())
            ?.get('is_continue_next_step')
            ?.patchValue(false);
          this.getQuestionFieldFormArray(segmentIndex)
            ?.at(questionIndex)
            ?.get('options')
            ?.get(idx.toString())
            ?.get('is_go_to_final_step')
            ?.patchValue(false);
          this.getQuestionFieldFormArray(segmentIndex)
            ?.at(questionIndex)
            ?.get('options')
            ?.get(idx.toString())
            ?.get('is_go_to_final_message')
            ?.patchValue(false);

          this.getQuestionFieldFormArray(segmentIndex)
            ?.at(questionIndex)
            ?.get('options')
            ?.get(idx.toString())
            ?.get('additional_step_name')
            ?.clearValidators();
          this.getQuestionFieldFormArray(segmentIndex)
            ?.at(questionIndex)
            ?.get('options')
            ?.get(idx.toString())
            ?.get('additional_step_name')
            ?.reset();
          this.getQuestionFieldFormArray(segmentIndex)
            ?.at(questionIndex)
            ?.get('options')
            ?.get(idx.toString())
            ?.get('additional_step_name')
            ?.updateValueAndValidity();

          this.getQuestionFieldFormArray(segmentIndex)
            ?.at(questionIndex)
            ?.get('options')
            ?.get(idx.toString())
            ?.get('additional_step_id')
            ?.reset();
          this.getQuestionFieldFormArray(segmentIndex)
            ?.at(questionIndex)
            ?.get('options')
            ?.get(idx.toString())
            ?.get('additional_step_id')
            ?.updateValueAndValidity();
        });
      }

      if (this.listMultipleContractType.includes(this.templateType)) {
        const currentQuestion: AbstractControl = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex);
        const optionLength = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options').value;
        if (optionLength?.length) {
          if (type === 'contract') {
            optionLength.forEach((element, idx) => {
              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_contract_name')
                ?.clearValidators();
              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_contract_name')
                ?.reset();
              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_contract_name')
                ?.updateValueAndValidity();

              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_contract_step_id')
                ?.reset();
              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_contract_step_id')
                ?.updateValueAndValidity();
            });
          } else {
            optionLength.forEach((element, idx) => {
              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_step_name')
                ?.clearValidators();
              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_step_name')
                ?.reset();
              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_step_name')
                ?.updateValueAndValidity();

              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_step_id')
                ?.reset();
              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_step_id')
                ?.updateValueAndValidity();
            });
          }

          currentQuestion.updateValueAndValidity(); // updating value and validity to be safe
        }
      }
    } else {
      if (this.listMultipleContractType.includes(this.templateType)) {
        const currentQuestion: AbstractControl = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex);
        const optionLength = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options').value;
        if (optionLength?.length) {
          if (type === 'contract') {
            optionLength.forEach((element, idx) => {
              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_contract_name')
                ?.setValidators(Validators.required);
              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_contract_name')
                ?.updateValueAndValidity();
            });
          } else {
            optionLength.forEach((element, idx) => {
              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_step_name')
                ?.setValidators(Validators.required);
              this.getQuestionFieldFormArray(segmentIndex)
                ?.at(questionIndex)
                ?.get('options')
                ?.get(idx.toString())
                ?.get('additional_step_name')
                ?.updateValueAndValidity();
            });
          }

          currentQuestion.updateValueAndValidity(); // updating value and validity to be safe
        }
      } else {
        const currentQuestion: AbstractControl = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex);
        const optionLength = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options').value;
        if (optionLength?.length) {
          optionLength.forEach((element, idx) => {
            this.getQuestionFieldFormArray(segmentIndex)
              ?.at(questionIndex)
              ?.get('options')
              ?.get(idx.toString())
              ?.get('additional_step_name')
              ?.setValidators(Validators.required);
            this.getQuestionFieldFormArray(segmentIndex)
              ?.at(questionIndex)
              ?.get('options')
              ?.get(idx.toString())
              ?.get('additional_step_name')
              ?.updateValueAndValidity();
          });
        }

        currentQuestion.updateValueAndValidity(); // updating value and validity to be safe
      }
    }
  }

  getOneFormbuilderCheckingContract() {
    this.subs.sink = this.formBuilderService.getOneFormBuilderForCheckingContractRouter(this.templateId).subscribe(
      (resp) => {
        this.modeValidation = 'All';
        this.isWaitingForResponse = false;
        this.formBuilderSaved = resp;
        this.formBuilderSaved.steps?.filter((step) => {
          return step?.segments?.find((segment) => {
            return segment?.questions?.find((question) => {
              if (question?.is_router_contract_on) {
                this.foundedQuestionSaved = question;
              }
            });
          });
        });
      },
      (err) => {
        this.isWaitingForResponse = false;
      },
    );
  }

  checkRouterContractAlreadyUsed(event, segmentIndex, questionIndex, answerType, type?) {
    if (this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('is_router_contract_on').value) {
      if (this.modeValidation !== 'CurrentForm') {
        this.isWaitingForResponse = true;
        this.subs.sink = this.formBuilderService.getOneFormBuilderForCheckingContractRouter(this.templateId).subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            if (resp) {
              const validationFormSaved = this.checkValidationOnFormSaved(resp);
              const validationCurrentForm = this.checkValidationCurrentForm(this.templateStepForm.value);
              if (validationFormSaved?.result || validationCurrentForm?.result) {
                this.isRouterContractAlreadyUsed = true;
                if (this.isRouterContractAlreadyUsed) {
                  Swal.fire({
                    type: 'warning',
                    title: this.translate.instant('SWAL_MULTIPLE_ROUTER_CONTRACT.Title'),
                    text: this.translate.instant('SWAL_MULTIPLE_ROUTER_CONTRACT.Text', {
                      stepName: validationFormSaved?.stepName || validationCurrentForm?.stepName,
                    }),
                    confirmButtonText: this.translate.instant('SWAL_MULTIPLE_ROUTER_CONTRACT.Button'),
                  }).then(() => {
                    event.source.checked = false;
                    this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('is_router_contract_on').patchValue(false);
                  });
                } else {
                  this.onChangeRouter(event, segmentIndex, questionIndex, answerType, type);
                }
              } else {
                this.isRouterContractAlreadyUsed = false;
                this.onChangeRouter(event, segmentIndex, questionIndex, answerType, type);
              }
            } else {
              const validationCurrentForm = this.checkValidationCurrentForm(this.templateStepForm.value);
              if (validationCurrentForm?.result) {
                this.isRouterContractAlreadyUsed = true;
                if (this.isRouterContractAlreadyUsed) {
                  Swal.fire({
                    type: 'warning',
                    title: this.translate.instant('SWAL_MULTIPLE_ROUTER_CONTRACT.Title'),
                    text: this.translate.instant('SWAL_MULTIPLE_ROUTER_CONTRACT.Text', { stepName: validationCurrentForm?.stepName }),
                    confirmButtonText: this.translate.instant('SWAL_MULTIPLE_ROUTER_CONTRACT.Button'),
                  }).then(() => {
                    event.source.checked = false;
                    this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('is_router_contract_on').patchValue(false);
                  });
                } else {
                  this.onChangeRouter(event, segmentIndex, questionIndex, answerType, type);
                }
              } else {
                this.isRouterContractAlreadyUsed = false;
                this.onChangeRouter(event, segmentIndex, questionIndex, answerType, type);
              }
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
          },
        );
      } else {
        const validationCurrentForm = this.checkValidationCurrentForm(this.templateStepForm.value);
        if (validationCurrentForm?.result) {
          this.isRouterContractAlreadyUsed = true;
          if (this.isRouterContractAlreadyUsed) {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('SWAL_MULTIPLE_ROUTER_CONTRACT.Title'),
              text: this.translate.instant('SWAL_MULTIPLE_ROUTER_CONTRACT.Text', { stepName: validationCurrentForm?.stepName }),
              confirmButtonText: this.translate.instant('SWAL_MULTIPLE_ROUTER_CONTRACT.Button'),
            }).then(() => {
              event.source.checked = false;
              this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('is_router_contract_on').patchValue(false);
            });
          } else {
            this.onChangeRouter(event, segmentIndex, questionIndex, answerType, type);
          }
        } else {
          this.isRouterContractAlreadyUsed = false;
          this.onChangeRouter(event, segmentIndex, questionIndex, answerType, type);
        }
      }
    } else {
      const isSameQuestionId =
        this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('_id').value === this.foundedQuestionSaved?._id;
      if (isSameQuestionId) {
        this.modeValidation = 'CurrentForm';
      }
    }
  }

  checkValidationOnFormSaved(resp) {
    const found = resp?.steps
      ?.filter((step) => step?.step_type === 'question_and_field')
      .find((step) => {
        return step?.segments?.find((segment) => {
          return segment?.questions?.find((question) => {
            return question?.is_router_contract_on;
          });
        });
      });
    return {
      stepName: found ? found?.step_title : null,
      result: found ? true : false,
    };
  }

  checkValidationCurrentForm(form) {
    let result = false;
    const foundQuestion = form?.segments?.find((segment) => {
      return segment?.questions?.find((question) => {
        return question?.is_router_contract_on;
      });
    });

    const foundSegments = form?.segments?.filter((segment) => {
      return segment?.questions?.find((question) => {
        return question?.is_router_contract_on;
      });
    });

    const found = foundQuestion?.questions?.filter((question) => question?.is_router_contract_on);

    if (foundSegments?.length > 1) {
      result = true;
    } else if (found?.length > 1) {
      result = true;
    } else {
      result = false;
    }

    return {
      stepName: found?.length > 1 || foundSegments?.length > 1 ? form?.step_title : null,
      result,
    };
  }

  checkMultipleContract() {
    let count = 0;

    this.step.forEach((resp) => {
      if (resp?.step_type === 'step_with_signing_process') {
        count++;
      }
    });

    if (count > 1) {
      this.isMultipleContract = true;
    } else {
      this.isMultipleContract = false;
    }
  }

  checkValueRouterOn(questionField, optionIndex) {
    switch (questionField?.get('options')?.at(optionIndex)?.get('additional_step_name').value) {
      case 'Continue Next Step':
        if (!questionField?.get('options')?.at(optionIndex)?.get('is_continue_next_step').value) {
          questionField?.get('options')?.at(optionIndex)?.get('additional_step_name').patchValue(null);
        }
        break;
      case 'Go To Final Step':
        if (!questionField?.get('options')?.at(optionIndex)?.get('is_go_to_final_step').value) {
          questionField?.get('options')?.at(optionIndex)?.get('additional_step_name').patchValue(null);
        }
        break;
      case 'Go To Final Message':
        if (!questionField?.get('options')?.at(optionIndex)?.get('is_go_to_final_message').value) {
          questionField?.get('options')?.at(optionIndex)?.get('additional_step_name').patchValue(null);
        }
        break;
      default:
        if (!questionField?.get('options')?.at(optionIndex)?.get('additional_step_id').value) {
          questionField?.get('options')?.at(optionIndex)?.get('additional_step_name').patchValue(null);
        }
        break;
    }

    this.filteredConditionalStepsDropdown = [...this.conditionalStepsDropdown];
  }

  checkValueRouterOnContract(questionField, optionIndex) {
    if (!questionField?.get('options')?.at(optionIndex)?.get('additional_contract_step_id').value) {
      questionField?.get('options')?.at(optionIndex)?.get('additional_contract_name').patchValue(null);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
