import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { removeSpaces } from 'app/service/customvalidator.validator';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AddSegmentFormBuilderDialogComponent } from './add-segment-form-builder-dialog/add-segment-form-builder-dialog.component';
import { map, startWith } from 'rxjs/operators';
import { UtilityService } from 'app/service/utility/utility.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import * as _ from 'lodash';

import { FinancesService } from 'app/service/finance/finance.service';
import { DocumentIntakeBuilderService } from 'app/service/document-intake-builder/document-intake-builder.service';
import { ApplicationUrls } from 'app/shared/settings';
import { FormBuilderService } from 'app/form-builder/form-builder.service';

@Component({
  selector: 'ms-common-template-step-detail',
  templateUrl: './common-template-step-detail.component.html',
  styleUrls: ['./common-template-step-detail.component.scss'],
})
export class CommonTemplateStepDetailComponent implements OnInit {
  @Input() templateId;
  @Input() templateType;
  @Input() stepId;
  @Input() stepIndex: number;
  @Input() isPublished: boolean;
  @Input() finalValidation: boolean;
  @Input() takenUniqueStep: string[];
  @Output() updateTabs = new EventEmitter();
  @ViewChildren('blockPanel') blockPanel: QueryList<ElementRef>;
  @ViewChildren('questionPanel') questionPanel: QueryList<ElementRef>;
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  templateStepForm: UntypedFormGroup;
  initialStepForm;
  private subs = new SubSink();
  isWaitingForResponse = false;
  currentStepIndex = 0;
  questionnaire: any;

  stepTypeList;
  validatorList: { _id: string; name: string }[];

  questionnaireConsts;
  docListType;
  selectedDocType;
  listUploadDocumentPDF: any;
  filteredConditionalStepsDropdown: any[];
  conditionalStepsDropdown: any[];

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
  teacherNonEditable = [
    'TEACHER_INDUCED_HOUR_COEFFICIENT_1',
    'TEACHER_INDUCED_HOUR_COEFFICIENT_2',
    'TEACHER_INDUCED_HOUR_COEFFICIENT_3',
    'TEACHER_INDUCED_HOUR_COEFFICIENT_4',
    'TEACHER_INDUCED_HOUR_COEFFICIENT_5',
    'TEACHER_INDUCED_HOUR_COEFFICIENT_6',
    'PAID_LEAVE_ALLOWANCE_RATE_1',
    'PAID_LEAVE_ALLOWANCE_RATE_2',
    'PAID_LEAVE_ALLOWANCE_RATE_3',
    'PAID_LEAVE_ALLOWANCE_RATE_4',
    'PAID_LEAVE_ALLOWANCE_RATE_5',
    'PAID_LEAVE_ALLOWANCE_RATE_6',
    'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_1',
    'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_2',
    'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_3',
    'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_4',
    'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_5',
    'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_6',
    'TEACHER_VOLUME_HOURS_INDUCED_1',
    'TEACHER_VOLUME_HOURS_INDUCED_2',
    'TEACHER_VOLUME_HOURS_INDUCED_3',
    'TEACHER_VOLUME_HOURS_INDUCED_4',
    'TEACHER_VOLUME_HOURS_INDUCED_5',
    'TEACHER_VOLUME_HOURS_INDUCED_6',
    'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_1',
    'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_2',
    'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_3',
    'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_4',
    'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_5',
    'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_6',
    'TEACHER_TOTAL_PERIOD_1',
    'TEACHER_TOTAL_PERIOD_2',
    'TEACHER_TOTAL_PERIOD_3',
    'TEACHER_TOTAL_PERIOD_4',
    'TEACHER_TOTAL_PERIOD_5',
    'TEACHER_TOTAL_PERIOD_6',
    'TOTAL_AMOUNT',
    'TEACHER_COMPENSATION_PAID_VACATION_1',
    'TEACHER_COMPENSATION_PAID_VACATION_2',
    'TEACHER_COMPENSATION_PAID_VACATION_3',
    'TEACHER_COMPENSATION_PAID_VACATION_4',
    'TEACHER_COMPENSATION_PAID_VACATION_5',
    'TEACHER_COMPENSATION_PAID_VACATION_6',
  ];
  fcNonEditable = [
    'school',
    'campus',
    'level',
    'sector',
    'speciality',
    'full_rate',
    'campus_address',
    'school_stamp',
    'legal_entity_address',
    'legal_entity_region',
    'legal_entity_siret',
    'legal_entity_name',
    'today_date',
  ];
  scholars: any[];
  documentBuilders: any[];

  photo: string;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  constructor(
    private fb: UntypedFormBuilder,
    // private formBuilderService: FormBuilderService,
    private router: Router,
    private translate: TranslateService,
    public dialog: MatDialog,
    private formBuilderService: FormBuilderService,
    private utilService: UtilityService,
    private fileUploadService: FileUploadService,
    private financeService: FinancesService,
    private documentService: DocumentIntakeBuilderService,
  ) {}

  ngOnInit() {
    this.initTemplateStepForm();
    // this.getDropdown();
    this.populateStepData();
    // this.initSegmentForm();
    this.initSegmentListener(); // on changes, reflect to preview
    console.log('_ispublish', this.isPublished);
    console.log(this.stepId);
    console.log('_templateType', this.templateType);
    this.sortingDropdownFilter();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.sortingDropdownFilter();
    });
  }

  sortingDropdownFilter() {
    // Admission Document Template Type Dropdown Sorting
    if (this.questionnaireConsts && this.questionnaireConsts.questionAndFieldAdmissionDocumentType) {
      this.questionnaireConsts.questionAndFieldAdmissionDocumentType = this.questionnaireConsts.questionAndFieldAdmissionDocumentType.sort(
        (a, b) =>
          this.utilService
            .simplifyRegex(this.translate.instant('FORM_BUILDER_FIELD.' + a))
            .localeCompare(this.utilService.simplifyRegex(this.translate.instant('FORM_BUILDER_FIELD.' + b))),
      );
    }
  }

  populateStepDataForAlumni() {
    this.isWaitingForResponse = true;
    this.formBuilderService.getOneFormBuilderStepForAlumni(this.stepId).subscribe((step) => {
      this.isWaitingForResponse = false;
      console.log(step);
      if (step) {
        if (step.validator && step.validator._id) {
          step.validator = step.validator._id;
        }
        if (step.segments && step.segments.length) {
          step.segments.forEach((segment, segmentIndex) => {
            this.addSegmentForm('initial');
            if (segment && segment.questions && segment.questions.length) {
              segment.questions.forEach((question, questionIndex) => {
                if (!question.final_message_question) {
                  question.final_message_question = {};
                }
                if (question.final_message_question && !question.final_message_question.final_message_image) {
                  question.final_message_question.final_message_image = {};
                }
                this.addQuestionFieldForm(segmentIndex, 'initial');

                if (question && question.options && question.options.length) {
                  question.options.forEach((option, optionIdx) => {
                    const question = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex) as UntypedFormGroup;
                    const options = question.get('options') as UntypedFormArray;
                    const group = this.initOptionFieldForm();
                    let matchedStep;
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
                    group.patchValue({
                      additional_step_name: (() => {
                        if (matchedStep && matchedStep.step_title) return matchedStep.step_title;
                        else if (option && option.is_continue_next_step) return this.translate.instant('Continue Next Step');
                        // else if (option && option.is_go_to_final_step) return this.translate.instant('Go To Final Step');
                        else if (option && option.is_go_to_final_message) return this.translate.instant('Go To Final Message');
                        else return null;
                      })(),
                    });
                    options.push(group);
                  });
                }

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
        if (step.step_type && this.takenUniqueStep.includes(step.step_type) && !this.stepTypeList.includes(step.step_type)) {
          // readds the unique type to the dropdown if the one taking the unique step is this current step
          // needs to readds to allow for translation and re-selection of the same step
          this.stepTypeList.push(step.step_type);
        }
        this.templateStepForm.patchValue(step);
        this.formBuilderService.setStepData(step);
        this.initialStepForm = this.templateStepForm.getRawValue();
        this.initValueChanges();
        if (this.isPublished) {
          this.templateStepForm.disable();
          this.getSegmentFormarray().disable();
          if (this.getQuestionsFormarray.length) {
            this.getQuestionsFormarray().disable();
          }
        }
      }
    });
  }

  populateStepDataForContract() {
    this.isWaitingForResponse = true;
    this.formBuilderService.getOneFormBuilderStep(this.stepId).subscribe((step) => {
      this.isWaitingForResponse = false;
      // console.log(step);
      if (step) {
        if (step.validator && step.validator._id) {
          step.validator = step.validator._id;
        }
        if (step.segments.length) {
          if (step.segments[0].document_for_condition) {
            this.selectedDocType = step.segments[0].document_for_condition;
          }
          if (step.segments[0].acceptance_pdf) {
            this.listUploadDocumentPDF = step.segments[0].acceptance_pdf;
          }
        }
        if (step.segments && step.segments.length) {
          step.segments.forEach((segment, segmentIndex) => {
            this.addSegmentForm('initial');
            if (segment && segment.questions && segment.questions.length) {
              segment.questions.forEach((question, questionIndex) => {
                if (!question.final_message_question) {
                  question.final_message_question = {};
                }
                if (question.final_message_question && !question.final_message_question.final_message_image) {
                  question.final_message_question.final_message_image = {};
                }
                this.addQuestionFieldForm(segmentIndex, 'initial');

                if (question && question.options && question.options.length) {
                  question.options.forEach((option, optionIdx) => {
                    const question = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex) as UntypedFormGroup;
                    const options = question.get('options') as UntypedFormArray;
                    const group = this.initOptionFieldForm();
                    let matchedStep;
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
                    group.patchValue({
                      additional_step_name: (() => {
                        if (matchedStep && matchedStep.step_title) return matchedStep.step_title;
                        else if (option && option.is_continue_next_step) return this.translate.instant('Continue Next Step');
                        // else if (option && option.is_go_to_final_step) return this.translate.instant('Go To Final Step');
                        else if (option && option.is_go_to_final_message) return this.translate.instant('Go To Final Message');
                        else return null;
                      })(),
                    });
                    options.push(group);
                  });
                }
              });
            }
          });
        }
        if (step.step_type && this.takenUniqueStep.includes(step.step_type) && !this.stepTypeList.includes(step.step_type)) {
          // readds the unique type to the dropdown if the one taking the unique step is this current step
          // needs to readds to allow for translation and re-selection of the same step
          this.stepTypeList.push(step.step_type);
        }
        this.templateStepForm.patchValue(step);
        this.formBuilderService.setStepData(step);
        this.initialStepForm = this.templateStepForm.getRawValue();
        this.initValueChanges();
        if (this.isPublished) {
          this.templateStepForm.disable();
          this.getSegmentFormarray().disable();
          if (this.getQuestionsFormarray.length) {
            this.getQuestionsFormarray().disable();
          }
        }
      }
    });
  }

  populateStepData() {
    console.log('this.templateType', this.templateType);
    if (this.templateType === 'alumni') {
      this.populateStepDataForAlumni();
    } else if (this.templateType === 'teacher_contract' || this.templateType === 'fc_contract') {
      this.populateStepDataForContract();
    } else if (this.templateType === 'student_admission' || this.templateType === 'admission_document') {
      this.isWaitingForResponse = true;
      this.formBuilderService.getOneFormBuilderStep(this.stepId).subscribe((step) => {
        this.isWaitingForResponse = false;
        console.log(step);
        if (step) {
          if (step.validator && step.validator._id) {
            step.validator = step.validator._id;
          }
          if (step.segments && step.segments.length) {
            step.segments.forEach((segment, segmentIndex) => {
              this.addSegmentForm('initial');
              if (segment && segment.questions && segment.questions.length) {
                segment.questions.forEach((question, questionIndex) => {
                  if (!question.final_message_question) {
                    question.final_message_question = {};
                  }
                  if (question.final_message_question && !question.final_message_question.final_message_image) {
                    question.final_message_question.final_message_image = {};
                  }

                  if (question) {
                    if (question.modality_question_type) {
                      if (question.modality_question_type === 'student') {
                        this.addQuestionFieldForm(segmentIndex, 'student');
                      } else if (question.modality_question_type === 'financial_support') {
                        this.addQuestionFieldForm(segmentIndex, 'financial_support');
                      }
                    } else {
                      this.addQuestionFieldForm(segmentIndex, 'initial');
                    }
                  }

                  if (question && question.options && question.options.length) {
                    question.options.forEach((option, optionIdx) => {
                      const question = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex) as UntypedFormGroup;
                      const options = question.get('options') as UntypedFormArray;
                      const group = this.initOptionFieldForm();
                      let matchedStep;
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
                      group.patchValue({
                        additional_step_name: (() => {
                          if (matchedStep && matchedStep.step_title) return matchedStep.step_title;
                          else if (option && option.is_continue_next_step) return this.translate.instant('Continue Next Step');
                          // else if (option && option.is_go_to_final_step) return this.translate.instant('Go To Final Step');
                          else if (option && option.is_go_to_final_message) return this.translate.instant('Go To Final Message');
                          else return null;
                        })(),
                      });
                      options.push(group);
                    });
                  }

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
          if (step.step_type && this.takenUniqueStep.includes(step.step_type) && !this.stepTypeList.includes(step.step_type)) {
            // readds the unique type to the dropdown if the one taking the unique step is this current step
            // needs to readds to allow for translation and re-selection of the same step
            this.stepTypeList.push(step.step_type);
          }
          this.templateStepForm.patchValue(step);
          this.formBuilderService.setStepData(step);
          this.initialStepForm = this.templateStepForm.getRawValue();
          this.initValueChanges();
          if (this.isPublished) {
            this.templateStepForm.disable();
            this.getSegmentFormarray().disable();
            if (this.getQuestionsFormarray.length) {
              this.getQuestionsFormarray().disable();
            }
          }
        }
      });
    }
  }

  initValueChanges() {
    this.templateStepForm.valueChanges.subscribe(() => {
      this.isFormChanged();
    });
  }

  // getDropdown() {
  //   if (this.templateType === 'alumni') {
  //     this.stepTypeList = this.formBuilderService.getStepTypeForAlumni().filter((type) => !this.takenUniqueStep.includes(type));
  //   } else if (this.templateType === 'teacher_contract' || this.templateType === 'fc_contract') {
  //     this.stepTypeList = this.formBuilderService.getStepTypContractList().filter((type) => !this.takenUniqueStep.includes(type));
  //     if (this.templateType === 'teacher_contract') {
  //       this.stepTypeList = this.stepTypeList.filter((res) => res !== 'step_summary');
  //     }
  //   } else if (this.templateType === 'student_admission') {
  //     this.stepTypeList = this.formBuilderService.getStepTypeContinousList().filter((type) => !this.takenUniqueStep.includes(type));
  //   }
  //   this.getUserTypeList();
  //   this.questionnaireConsts = this.formBuilderService.getQuestionnaireConst();
  //   if (this.templateType === 'alumni') {
  //     this.docListType = this.formBuilderService.getConditionDocTypeAlumniList();
  //   } else if (this.templateType === 'student_admission') {
  //     this.docListType = this.formBuilderService.getConditionDocTypeContinousList();
  //   }
  //   console.log('_test', this.docListType);
  //       const filter = {
  //     form_builder_id: this.templateId,
  //     is_only_visible_based_on_condition: true,
  //   };
  //   this.subs.sink = this.formBuilderService.getAllFormBuilderSteps(filter).subscribe(
  //     (resp) => {
  //       this.conditionalStepsDropdown = resp.filter((step) => step && step._id && step._id !== this.stepId);
  //       this.filteredConditionalStepsDropdown = [...this.conditionalStepsDropdown];
  //       this.isWaitingForResponse = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.isWaitingForResponse = false;
  //     },
  //   );
  // }

  initTemplateStepForm() {
    this.templateStepForm = this.fb.group({
      _id: [null],
      step_title: ['', [Validators.required, removeSpaces]],
      is_validation_required: [false],
      step_type: [null, [Validators.required]],
      validator: [null],
      direction: [''],
      segments: this.fb.array([]),
    });
    this.initialStepForm = this.templateStepForm.getRawValue();
  }

  initSegmentForm() {
    return this.fb.group({
      _id: [null],
      is_student_included: [false],
      is_multiple_financial_support: [false],
      segment_title: ['', [Validators.required]],
      questions: this.fb.array([]),
      document_for_condition: [null],
      acceptance_text: [''],
      acceptance_pdf: [''],
    });
  }

  initQuestionFieldForm(from?) {
    if (this.templateType === 'alumni') {
      return this.fb.group({
        _id: [null],
        ref_id: [{ value: null, disabled: true }],
        field_type: [null],
        is_field: [
          this.templateStepForm &&
          this.templateStepForm.get('step_type').value &&
          (this.templateStepForm.get('step_type').value === 'document_expected' ||
            this.templateStepForm.get('step_type').value === 'document_to_validate')
            ? false
            : true,
        ],
        is_editable: [false],
        is_required: [false],
        field_position: [null],
        options: this.fb.array([]),
        question_label: [''],
        is_router_on: [false],
        answer_type: [
          this.templateStepForm &&
          this.templateStepForm.get('step_type').value &&
          this.templateStepForm.get('step_type').value === 'document_expected'
            ? 'document_pdf_upload'
            : null,
        ],
        special_question: this.fb.group({
          step_type: null,
          campus_validation: null,
          document_acceptance_type: null,
          document_acceptance_text: null,
          document_acceptance_pdf: null,
          document_builder_scholar_season_id: null,
          document_builder_id: null,
          summary_header: null,
          summary_footer: null,
        }),
        final_message_question: this.fb.group({
          final_message_image: this.fb.group({
            name: null,
            s3_file_name: null,
          }),
          final_message_summary_header: null,
          final_message_summary_footer: null,
        }),
      });
    } else if (this.templateType === 'teacher_contract') {
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
        answer_type: [
          this.templateStepForm &&
          this.templateStepForm.get('step_type').value &&
          this.templateStepForm.get('step_type').value === 'document_expected'
            ? 'document_pdf_upload'
            : null,
        ],
        final_message_question: this.fb.group({
          final_message_image: this.fb.group({
            name: null,
            s3_file_name: null,
          }),
          final_message_summary_header: null,
          final_message_summary_footer: null,
        }),
      });
    } else if (this.templateType === 'fc_contract') {
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
        answer_type: [
          this.templateStepForm &&
          this.templateStepForm.get('step_type').value &&
          this.templateStepForm.get('step_type').value === 'document_expected'
            ? 'document_pdf_upload'
            : null,
        ],
        special_question: this.fb.group({
          step_type: null,
          campus_validation: null,
          document_acceptance_type: null,
          document_acceptance_text: null,
          document_acceptance_pdf: null,
          document_builder_scholar_season_id: null,
          document_builder_id: null,
          summary_header: null,
          summary_footer: null,
        }),
        final_message_question: this.fb.group({
          final_message_image: this.fb.group({
            name: null,
            s3_file_name: null,
          }),
          final_message_summary_header: null,
          final_message_summary_footer: null,
        }),
      });
    } else if ((this.templateType === 'student_admission' && from === 'initial') || this.templateType === 'admission_document') {
      return this.fb.group({
        _id: [null],
        ref_id: [{ value: null, disabled: true }],
        field_type: [null],
        is_field: [
          this.templateStepForm &&
          this.templateStepForm.get('step_type').value &&
          (this.templateStepForm.get('step_type').value === 'document_expected' ||
            this.templateStepForm.get('step_type').value === 'document_to_validate')
            ? false
            : true,
        ],
        is_editable: [false],
        is_required: [false],
        field_position: [null],
        options: this.fb.array([]),
        question_label: [''],
        is_router_on: [false],
        answer_type: [
          this.templateStepForm &&
          this.templateStepForm.get('step_type').value &&
          this.templateStepForm.get('step_type').value === 'document_expected'
            ? 'document_pdf_upload'
            : null,
        ],
        special_question: this.fb.group({
          step_type: null,
          campus_validation: null,
          document_acceptance_type: null,
          document_acceptance_text: null,
          document_acceptance_pdf: null,
          document_builder_scholar_season_id: null,
          document_builder_id: null,
          summary_header: null,
          summary_footer: null,
        }),
        final_message_question: this.fb.group({
          final_message_image: this.fb.group({
            name: null,
            s3_file_name: null,
          }),
          final_message_summary_header: null,
          final_message_summary_footer: null,
        }),
      });
    } else if (this.templateType === 'student_admission') {
      if (from && from === 'student') {
        return this.fb.group({
          _id: [null],
          ref_id: [{ value: null, disabled: true }],
          field_type: [null],
          is_field: [
            this.templateStepForm &&
            this.templateStepForm.get('step_type').value &&
            (this.templateStepForm.get('step_type').value === 'document_expected' ||
              this.templateStepForm.get('step_type').value === 'document_to_validate')
              ? false
              : true,
          ],
          is_editable: [false],
          is_required: [false],
          field_position: [null],
          options: this.fb.array([]),
          question_label: [''],
          is_router_on: [false],
          answer_type: [
            this.templateStepForm &&
            this.templateStepForm.get('step_type').value &&
            this.templateStepForm.get('step_type').value === 'document_expected'
              ? 'document_pdf_upload'
              : null,
          ],
          special_question: this.fb.group({
            step_type: null,
            campus_validation: null,
            document_acceptance_type: null,
            document_acceptance_text: null,
            document_acceptance_pdf: null,
            document_builder_scholar_season_id: null,
            document_builder_id: null,
            summary_header: null,
            summary_footer: null,
          }),
          final_message_question: this.fb.group({
            final_message_image: this.fb.group({
              name: null,
              s3_file_name: null,
            }),
            final_message_summary_header: null,
            final_message_summary_footer: null,
          }),
          modality_question_type: 'student',
        });
      } else if (from && from == 'financial_support') {
        return this.fb.group({
          _id: [null],
          ref_id: [{ value: null, disabled: true }],
          field_type: [null],
          is_field: [
            this.templateStepForm &&
            this.templateStepForm.get('step_type').value &&
            (this.templateStepForm.get('step_type').value === 'document_expected' ||
              this.templateStepForm.get('step_type').value === 'document_to_validate')
              ? false
              : true,
          ],
          is_editable: [false],
          is_required: [false],
          field_position: [null],
          options: this.fb.array([]),
          question_label: [''],
          is_router_on: [false],
          answer_type: [
            this.templateStepForm &&
            this.templateStepForm.get('step_type').value &&
            this.templateStepForm.get('step_type').value === 'document_expected'
              ? 'document_pdf_upload'
              : null,
          ],
          special_question: this.fb.group({
            step_type: null,
            campus_validation: null,
            document_acceptance_type: null,
            document_acceptance_text: null,
            document_acceptance_pdf: null,
            document_builder_scholar_season_id: null,
            document_builder_id: null,
            summary_header: null,
            summary_footer: null,
          }),
          final_message_question: this.fb.group({
            final_message_image: this.fb.group({
              name: null,
              s3_file_name: null,
            }),
            final_message_summary_header: null,
            final_message_summary_footer: null,
          }),
          modality_question_type: 'financial_support',
        });
      }
    }
  }

  initOptionFieldForm(): UntypedFormGroup {
    return this.fb.group({
      option_name: [null],
      is_continue_next_step: [false],
      is_go_to_final_message: [false],
      additional_step_id: [null],
      additional_step_name: [null], // This won't be sent to BE
    });
  }
  getUserTypeList() {
    this.subs.sink = this.formBuilderService.getUserTypesForValidator().subscribe(
      (resp) => {
        const tempData = resp;
        this.validatorList = tempData;
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

  initSegmentListener() {
    // listen to changes in template step form to pass data to preview
    this.templateStepForm.valueChanges.subscribe((formData) => {
      this.formBuilderService.setStepData(this.templateStepForm.value);
    });
  }

  getSegmentFormarray(): UntypedFormArray {
    return this.templateStepForm.get('segments') as UntypedFormArray;
  }

  getQuestionsFormarray(): UntypedFormArray {
    return this.getSegmentFormarray().get('questions') as UntypedFormArray;
  }

  getOptionsFormArrayFrom(questionField: UntypedFormGroup) {
    return questionField.get('options') as UntypedFormArray;
  }

  onChangeValidationRequirement(option) {
    console.log(option.checked);
    if (option && !option.checked) {
      this.templateStepForm.get('validator').patchValue(null);
      this.templateStepForm.get('validator').clearValidators(); // have to clear validators due to late detection of [required]
      this.templateStepForm.get('validator').setErrors(null);
      // have to set error to null due to asynchronous issue with the toggle and late [required] detection
    }
  }

  addSegmentForm(dialog?: string) {
    if (this.isPublished && dialog !== 'initial') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UserForm_S18.TITLE'),
        text: this.translate.instant('UserForm_S18.TEXT'),
        confirmButtonText: this.translate.instant('UserForm_S18.CONFIRM'),
      });
    } else {
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
            }
            setTimeout(() => {
              if (this.blockPanel && this.blockPanel.last && this.blockPanel.length) {
                console.log(this.blockPanel.toArray());
                console.log(this.blockPanel.toArray()[this.blockPanel.length - 1]);
                this.blockPanel.toArray()[this.blockPanel.length - 1].nativeElement.scrollIntoView({ behavior: 'smooth' });
              }
            }, 500);
            console.log('this is the block panel : ' + this.blockPanel);
          });
      } else {
        this.getSegmentFormarray().push(this.initSegmentForm());
      }
    }
  }

  removeSegmentForm(segmentIndex) {
    if (this.isPublished) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UserForm_S18.TITLE'),
        text: this.translate.instant('UserForm_S18.TEXT'),
        confirmButtonText: this.translate.instant('UserForm_S18.CONFIRM'),
      });
    } else {
      this.getSegmentFormarray().removeAt(segmentIndex);
    }
  }

  getQuestionFieldFormArray(segmentIndex): UntypedFormArray {
    return this.getSegmentFormarray().at(segmentIndex).get('questions') as UntypedFormArray;
  }

  addQuestionFieldForm(segmentIndex, from?) {
    console.log(segmentIndex, from);
    if (this.isPublished && from !== 'initial') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UserForm_S18.TITLE'),
        text: this.translate.instant('UserForm_S18.TEXT'),
        confirmButtonText: this.translate.instant('UserForm_S18.CONFIRM'),
      });
    } else {
      if (from) {
        this.getQuestionFieldFormArray(segmentIndex).push(this.initQuestionFieldForm(from));
      } else {
        this.getQuestionFieldFormArray(segmentIndex).push(this.initQuestionFieldForm());
      }
      console.log('_segmenet', this.getQuestionFieldFormArray(segmentIndex));
    }
  }

  scrollIntoLastQuestion(segmentIndex) {
    setTimeout(() => {
      if (this.questionPanel && this.questionPanel.length) {
        this.getQuestionFieldFormArray(segmentIndex).updateValueAndValidity();
        let length = 0;
        for (let index = segmentIndex; index >= 0; index--) {
          length += this.getQuestionFieldFormArray(index).length;
        }
        this.questionPanel.toArray()[length - 1].nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 1000);
  }

  removeQuestionFieldForm(segmentIndex, questionIndex) {
    if (this.isPublished) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UserForm_S18.TITLE'),
        text: this.translate.instant('UserForm_S18.TEXT'),
        confirmButtonText: this.translate.instant('UserForm_S18.CONFIRM'),
      });
    } else {
      this.getQuestionFieldFormArray(segmentIndex).removeAt(questionIndex);
    }
  }

  checkIsParentChild(question) {
    if (question && question.answer_type === 'parent_child') {
      return true;
    }
    return false;
  }

  checkIsMutiOption(question) {
    if (
      question &&
      (question.answer_type === 'multiple_option' ||
        question.answer_type === 'single_option' ||
        question.answer_type === 'single_option_diploma') &&
      question.is_field === false
    ) {
      return true;
    }
    return false;
  }

  addMoreAnswers(segmentIndex, questionIndex) {
    const optionValue = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('answer').value;
    console.log(optionValue);
    if (optionValue) {
      const childOptions = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('parent_child_options').value;
      const optionPosition = childOptions.length;

      childOptions.push({
        option_text: optionValue,
        position: optionPosition,
        questions: [],
      });

      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('answer').patchValue('');
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('parent_child_options').patchValue(childOptions);

      console.log(this.getQuestionFieldFormArray(segmentIndex).value);
    }
  }

  addMoreOptions(segmentIndex, questionIndex, optionText, diploma?) {
    // const optionValue = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('answer').value;
    console.log(optionText.value);
    // const options = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options').value;
    const option = this.initOptionFieldForm();
    const options = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options') as UntypedFormArray;
    if (diploma) {
      option.patchValue({ option_name: optionText });
    } else {
      option.patchValue({ option_name: optionText.value });
    }
    options.push(option);
    // this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options').patchValue(options);
    console.log(this.getQuestionFieldFormArray(segmentIndex).value);
  }

  removeOption(segmentIndex, questionIndex, optionIndex) {
    Swal.fire({
      title: this.translate.instant('MENTOREVALUATION.QUESTIONNAIRE.Messages.deletedOptionWarningTitle'),
      // html: self.translate.instant('MENTOREVALUATION.QUESTIONNAIRE.Messages.deletedOptionWarningMessage'),
      type: 'warning',
      showCancelButton: true,
      allowEscapeKey: true,
      confirmButtonText: this.translate.instant('YES'),
      cancelButtonText: this.translate.instant('NO'),
    }).then((res) => {
      if (res.value) {
        console.log(segmentIndex, questionIndex, optionIndex);
        // let options = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options').value;
        // options = options.splice(optionIndex, 1);
        // this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options').patchValue(options);
        const options = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options') as UntypedFormArray;
        options.removeAt(optionIndex);
        console.log(this.getQuestionFieldFormArray(segmentIndex).value);
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
    console.log('updateFieldToggle', event, segmentIndex, questionIndex);
    if (event.checked) {
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('is_editable').patchValue(false);
    } else {
      // make field type to null if is_field is turned off
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('field_type').patchValue(null);
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('is_editable').patchValue(true);
    }
    console.log('updateFieldToggle 2', this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).value);
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
        console.log(event.container.data, subModuleDrop);
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        this.getSegmentFormarray().updateValueAndValidity({ onlySelf: false });
        // this.formBuilderService.setStepData(this.templateStepForm.value);
      } else {
        console.log(event.container.data);
        transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        this.getSegmentFormarray().updateValueAndValidity({ onlySelf: false });
        // this.formBuilderService.setStepData(this.templateStepForm.value);
      }
    }
  }

  dropQuestion(event: CdkDragDrop<string[]>, segmentIndex: number) {
    console.log(event);
    if (event.previousContainer === event.container) {
      const subModuleDrop = event.container.data;
      console.log(event.container.data, subModuleDrop);
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.getQuestionFieldFormArray(segmentIndex).updateValueAndValidity({ onlySelf: false });
      // this.formBuilderService.setStepData(this.templateStepForm.value)
    } else {
      console.log(event.container.data);
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this.getQuestionFieldFormArray(segmentIndex).updateValueAndValidity({ onlySelf: false });
      // this.formBuilderService.setStepData(this.templateStepForm.value)
    }
  }

  displayNextStepWithFn(value) {
    if (value === 'Continue Next Step' || value === 'Go To Final Step' || value === 'Go To Final Message') {
      return this.translate.instant(value);
    } else {
      return value;
    }
  }

  onNextStepType($event) {
    if (!$event.target.value) {
      this.filteredConditionalStepsDropdown = [...this.conditionalStepsDropdown];
    } else {
      this.filteredConditionalStepsDropdown = this.conditionalStepsDropdown.filter((step) => {
        const isSane = step && typeof step.step_title === 'string';
        return isSane && step.step_title.toLowerCase().trim().includes($event.target.value.toLowerCase().trim());
      });
    }
  }

  onSelectNextStepAt(idx: number, field: UntypedFormGroup, value) {
    const options = field.get('options') as UntypedFormArray;
    const option = options.at(idx) as UntypedFormGroup;
    console.log(value);
    if (typeof value === 'string') {
      option.patchValue({
        additional_step_id: null,
        additional_step_name: value,
        is_continue_next_step: value === 'Continue Next Step',
        is_go_to_final_message: value === 'Go To Final Message',
      });
    } else if (typeof value === 'object' && typeof value._id === 'string' && typeof value.step_title === 'string') {
      // const isFinalStep = value.is_final_step ? value.is_final_step : false;
      option.patchValue({
        additional_step_id: value._id,
        additional_step_name: value.step_title,
        is_continue_next_step: false,
        is_go_to_final_message: false,
      });
    }
    this.filteredConditionalStepsDropdown = [...this.conditionalStepsDropdown];
  }

  cleanNullValues(obj) {
    return Object.keys(obj).forEach((key) => {
      if (obj[key] && typeof obj[key] === 'object') {
        this.cleanNullValues(obj[key]);
      } else if (key === 'ref_id' && obj['ref_id'] === '' && !obj['is_field']) {
        delete obj['ref_id'];
      } else if (key === 'field_type' && !obj['is_field']) {
        obj['field_type'] = null;
      } else if (obj[key] === null) {
        delete obj[key];
      } else if (key === 'additional_step_name') {
        delete obj[key];
      }
    });
  }

  saveStepData() {
    if (this.templateStepForm.invalid) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
      this.templateStepForm.markAllAsTouched();
    } else {
      this.isWaitingForResponse = true;
      const payload = this.templateStepForm.getRawValue();
      this.cleanNullValues(payload);
      console.log(payload);
      this.formBuilderService.createUpdateFormBuilderStep(payload).subscribe(
        (resp) => {
          if (resp) {
            this.isWaitingForResponse = false;
            this.formBuilderService.childrenFormValidationStatus = true;
            this.initialStepForm = this.templateStepForm.getRawValue();
            this.initTemplateStepForm();
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
        (err) => {
          this.showSwalError(err);
        },
      );
    }
  }

  isFormChanged() {
    const initialStepForm = JSON.stringify(this.initialStepForm);
    const currentForm = JSON.stringify(this.templateStepForm.getRawValue());
    this.formBuilderService.childrenFormValidationStatus = false;
    if (initialStepForm === currentForm) {
      this.formBuilderService.childrenFormValidationStatus = true;
      return true;
    } else {
      this.formBuilderService.childrenFormValidationStatus = false;
      return false;
    }
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

  handleStepCondition() {
    // *************** We are deleting the segment first before changing steps
    this.selectedDocType = '';
    const segmentData = this.getSegmentFormarray().value;
    if (segmentData && segmentData.length) {
      segmentData.forEach((segment, segmentIndex) => {
        // *************** cannot use segment index as removeAt parameter, since we remove from 0 to n.
        // But segment in formarray is already deleted in 0, so all form index is reduced by 1.
        // Thats why its better to always delete the zero index then doing that with same amount of time with segment length
        this.getSegmentFormarray().removeAt(0);
      });
    }

    if (
      this.templateStepForm.get('step_type').value === 'document_to_validate' ||
      this.templateStepForm.get('step_type').value === 'document_expected'
    ) {
      this.addSegmentForm();
      if (this.templateStepForm.get('step_type').value === 'document_to_validate') {
        this.addQuestionFieldForm(0);
      }
    }
    if (this.templateStepForm.get('step_type').value === 'campus_validation') {
      this.addCampusValidationForm();
    }
    if (
      this.templateStepForm.get('step_type').value === 'step_summary' ||
      this.templateStepForm.get('step_type').value === 'final_message'
    ) {
      this.addCampusValidationForm();
    }
  }

  checkAnswerType(segmentIndex, questionIndex) {
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

  handleDocumentSelected(value, index, questionIndex) {
    console.log('_ev', value);
    this.deletePDF(); // clean data of previous uploaded doc if any

    this.selectedDocType = value;
    // switch (value) {
    //   case 'upload_pdf':
    //     this.getSegmentFormarray().at(index).get('acceptance_text').patchValue(null);
    //     break;

    //   case 'ck_editor':
    //     this.getSegmentFormarray().at(index).get('acceptance_pdf').patchValue(null);
    //     break;

    //   default:
    //     this.getSegmentFormarray().at(index).get('acceptance_text').patchValue(null);
    //     this.getSegmentFormarray().at(index).get('acceptance_pdf').patchValue(null);
    //     break;
    // }

    // Disabled document_builder_id if selectedDocType === doc_builder
    if (this.selectedDocType === 'doc_builder') {
      this.getAllDocumentBuilders();
    }

    this.resetSpecialQuestion(index, questionIndex);

    this.getSegmentFormarray().at(index).get('acceptance_text').patchValue(null); // make the text to nul on changes to type
    this.getSegmentFormarray().at(index).get('acceptance_pdf').patchValue(null); // make the acceptance_pdf to null on changes to type
    this.templateStepForm.updateValueAndValidity();
    console.log('after changing upload type', this.templateStepForm.controls);
    this.formBuilderService.setStepData(this.templateStepForm.value); // set the new templateform to the preview
  }

  resetSpecialQuestion(index, questionIndex) {
    this.getQuestionFieldFormArray(index).at(questionIndex).get('special_question').get('step_type').patchValue(null);
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
    if (this.isPublished) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UserForm_S18.TITLE'),
        text: this.translate.instant('UserForm_S18.TEXT'),
        confirmButtonText: this.translate.instant('UserForm_S18.CONFIRM'),
      });
    } else {
      this.fileUploaderDoc.nativeElement.click();
    }
  }

  chooseFile(fileInput: Event, index, questionIndex) {
    const acceptable = ['pdf'];
    const file = (<HTMLInputElement>fileInput.target).files[0];
    const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
    if (acceptable.includes(fileType)) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          console.log('_resp upload', resp);
          this.isWaitingForResponse = false;
          if (resp) {
            this.listUploadDocumentPDF = '';
            // this.getSegmentFormarray().at(index).get('acceptance_pdf').patchValue(resp.s3_file_name);
            // console.log('tfoor 0',this.addDiplomaForm.getRawValue());
            this.getQuestionFieldFormArray(index)
              .at(questionIndex)
              .get('special_question')
              .get('document_acceptance_pdf')
              .patchValue(resp.s3_file_name);
            this.listUploadDocumentPDF = resp.s3_file_name;
            this.fileUploaderDoc.nativeElement = '';
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
        text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.pdf' }),
        allowEscapeKey: false,
        allowOutsideClick: false,
        allowEnterKey: false,
      });
    }
  }

  chooseImageFinalMessage(fileInput: Event, index, questionIndex) {
    const acceptable = ['jpg', 'jpeg', 'png'];
    const file = (<HTMLInputElement>fileInput.target).files[0];
    const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
    if (acceptable.includes(fileType)) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          console.log('_resp upload', resp);
          this.isWaitingForResponse = false;
          if (resp) {
            this.photo = resp.file_url;
            console.log(this.getQuestionFieldFormArray(index).at(questionIndex).get('final_message_question').get('final_message_image'));
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
            // this.getQuestionFieldFormArray(index).at(questionIndex).value.final_message_question.final_message.name;
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
        text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.pdf' }),
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

  deletePDF() {
    if (this.isPublished) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UserForm_S18.TITLE'),
        text: this.translate.instant('UserForm_S18.TEXT'),
        confirmButtonText: this.translate.instant('UserForm_S18.CONFIRM'),
      });
    } else {
      this.listUploadDocumentPDF = '';
    }
  }

  addCampusValidationForm() {
    this.getSegmentFormarray().push(this.initSegmentForm());
    console.log(this.templateStepForm.value);
    this.templateStepForm.value.segments.forEach((segments, segmentIndex) => {
      this.addQuestionFieldForm(segmentIndex);
    });
  }

  openTableKey(stepType) {
    const url = this.router.createUrlTree(['form-builder/key-table'], {
      queryParams: {
        stepType,
        lang: this.translate.currentLang,
        templateId: this.templateId,
        stepId: this.stepId,
        templateType: this.templateType,
      },
    });
    window.open(url.toString(), '_blank', 'height=570,width=520,scrollbars=yes,top=250,left=900');
  }

  handleDocumentBuilderScholarSeasonSelected(segmentIndex, questionIndex) {
    // enable document_builder_id
    this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('special_question').get('document_builder_id').enable();
    this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('special_question').get('document_builder_id').patchValue(null);
    this.getAllDocumentBuilders();
  }

  getScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp) {
          this.scholars = resp;
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

  getAllDocumentBuilders() {
    const filter = {
      status: true,
    };
    this.subs.sink = this.documentService.getAllDocumentsDropdown(filter).subscribe(
      (resp) => {
        if (resp) {
          this.documentBuilders = resp;
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

  showSwalError(err) {
    this.isWaitingForResponse = false;
    console.log('[Response BE][Error] : ', err);
    if (err['message'] === 'GraphQL error: This form already has a step title with that name') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UserForm_S14.TITLE'),
        text: this.translate.instant('UserForm_S14.TEXT'),
        confirmButtonText: this.translate.instant('UserForm_S14.CONFIRM'),
      });
    } else if (err['message'] === 'GraphQL error: form builder already published') {
      this.formBuilderService.childrenFormValidationStatus = true;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UserForm_S18.TITLE'),
        text: this.translate.instant('UserForm_S18.TEXT'),
        confirmButtonText: this.translate.instant('UserForm_S18.CONFIRM'),
      });
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    }
  }
  checkFieldType(value) {
    let disabled = false;
    if (value) {
      if (this.templateType === 'fc_contract') {
        if (this.fcNonEditable.includes(value)) {
          disabled = true;
        } else {
          disabled = false;
        }
      } else if (this.templateType === 'teacher_contract') {
        if (this.teacherNonEditable.includes(value)) {
          disabled = true;
        } else {
          disabled = false;
        }
      }
    }
    return disabled;
  }
}
