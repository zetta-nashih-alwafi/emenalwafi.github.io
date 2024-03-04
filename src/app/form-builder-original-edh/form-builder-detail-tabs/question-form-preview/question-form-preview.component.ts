import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';

@Component({
  selector: 'ms-question-form-preview',
  templateUrl: './question-form-preview.component.html',
  styleUrls: ['./question-form-preview.component.scss'],
})
export class QuestionFormPreviewComponent implements OnInit {
  _stepId: string;
  @Input() currentStepIndex: number;
  @Input() set stepId(value: string) {
    this._stepId = value;
    this.fetchStepData(value);
  }

  get stepId(): string {
    return this._stepId;
  }

  templateStepForm: UntypedFormGroup;
  intVal: any;
  timeOutVal: any;
  relationList = ['father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'other'];
  // editor: any = DecoupledEditor;

  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';

  grayBackground = '../../../../../assets/img/gray-background.jpg';

  constructor(private fb: UntypedFormBuilder, private formBuilderService: FormBuilderService, private translate: TranslateService) {}

  ngOnInit() {
    this.initTemplateStepForm();
    if (!this.stepId) {
      this.initStepContractFormListener();
    }
  }

  fetchStepData(stepId) {
    this.formBuilderService.getOneFormBuilderStep(this.stepId).subscribe((step) => {
      this.populateStepData(step);
    });
  }

  initStepContractFormListener() {
    this.formBuilderService.stepData$.subscribe((formData) => {
      if (formData) {
        this.initTemplateStepForm();
        this.populateStepData(formData);
      }
    });
  }

  populateStepData(tempStep: any) {
    if (!this.templateStepForm) return; //make sure templateStepForm is init first

    if (tempStep) {
      if (tempStep.segments && tempStep.segments.length) {
        tempStep.segments.forEach((segment, segmentIndex) => {
          if (!this.getSegmentFormarray() || (this.getSegmentFormarray() && this.getSegmentFormarray().length < tempStep.segments.length)) {
            this.addSegmentForm(); //only add if length of segment does not match what has been initialized
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
            });
          }
        });
      }

      this.templateStepForm.patchValue(tempStep);
    }
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
}
