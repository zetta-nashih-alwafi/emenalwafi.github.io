import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { SchoolService } from 'app/service/schools/school.service';
import { StudentsService } from 'app/service/students/students.service';
import { take } from 'rxjs/operators';
import { SubSink } from 'subsink';

@Component({
  selector: 'ms-question-form-preview',
  templateUrl: './question-form-preview.component.html',
  styleUrls: ['./question-form-preview.component.scss'],
})
export class QuestionFormPreviewComponent implements OnInit, OnDestroy {
  _stepId: string;
  @Input() currentStepIndex: number;
  countryList: any[];
  nationalList: any;
  @Input() set stepId(value: string) {
    this._stepId = value;
    this.fetchStepData(value);
  }
  private subs = new SubSink();

  get stepId(): string {
    return this._stepId;
  }

  templateStepForm: UntypedFormGroup;
  intVal: any;
  timeOutVal: any;
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  relationList = ['father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'other'];
  // editor: any = DecoupledEditor;
  email = new UntypedFormControl('', [Validators.email]);
  grayBackground = '../../../../../assets/img/gray-background.jpg';
  minimumDateOfBirth: Date;
  
  constructor(public sanitizer: DomSanitizer, private fb: UntypedFormBuilder, private formBuilderService: FormBuilderService, private translate: TranslateService, private schoolService: SchoolService, private studentService: StudentsService, private authService: AuthService)  {}

  ngOnInit() {
    this.initTemplateStepForm();
    if (!this.stepId) {
      this.initStepContractFormListener();
    }
    this.fetchCountryList();
    this.fetchNationalityList();
    this.minimumDateOfBirth = this.getMinimumDateOfBirth();
  }

  getMinimumDateOfBirth() {
    const now = new Date();
    return new Date(now.setFullYear(now.getFullYear() - 14));
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  fetchStepData(stepId) {
    this.subs.sink = this.formBuilderService.getOneFormBuilderStep(this.stepId).subscribe((step) => {
      this.populateStepData(step);
    }, (err) => {
      this.authService.postErrorLog(err);
    });
  }

  initStepContractFormListener() {
    this.subs.sink = this.formBuilderService.stepData$.subscribe((formData) => {
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
              if (!question.numeric_validation) {
                question.numeric_validation = {};
              }
              if (!question.text_validation) {
                question.text_validation = {};
              }
              if (!question.multiple_option_validation) {
                question.multiple_option_validation = {};
              }
              if (!question.special_question) {
                question.special_question = {};
              }
              if (!question.parent_child_options) {
                question.parent_child_options = [];
              }

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

              if (question.options && question.options.length) {
                question.options.forEach((option, optionIndex) => {
                  if (!this.getOptionFieldFormArray(segmentIndex, questionIndex)) {
                    this.addOptionField(segmentIndex, questionIndex);
                  } else if (
                    this.getOptionFieldFormArray(segmentIndex, questionIndex) &&
                    this.getOptionFieldFormArray(segmentIndex, questionIndex).length < question.options.length
                  ) {
                    this.addOptionField(segmentIndex, questionIndex);
                  } else {
                    return;
                  }
                });
              }

              if (question && question.parent_child_options && question.parent_child_options.length) {
                question.parent_child_options.forEach((parentChildOption1, pcIndex1) => {
                  const parentChildArray1 = this.getQuestionFieldFormArray(segmentIndex)
                    .at(questionIndex)
                    .get('parent_child_options') as UntypedFormArray;
                  if (!parentChildArray1) return;
                  parentChildArray1.push(this.initParentChildOptionForm());
                  if (parentChildOption1.questions && parentChildOption1.questions.length) {
                    parentChildOption1.questions.forEach((pc1Question, pc1QuestionIndex) => {
                      const pcQuestionArray1 = parentChildArray1.at(pcIndex1).get('questions') as UntypedFormArray;
                      pcQuestionArray1.push(this.initParentChildOptionQuestionForm());

                      if (pc1Question && pc1Question.parent_child_options && pc1Question.parent_child_options.length) {
                        this.recursiveParentChild(pcQuestionArray1, pc1Question, pc1QuestionIndex);
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
      // console.log('tempStep is now:', tempStep);
      this.templateStepForm.patchValue(tempStep);
    }
  }

  fetchCountryList() {
    this.subs.sink = this.schoolService.getCountry().subscribe(
      (list: any[]) => {
        this.countryList = list;
      }
    );
  }

  fetchNationalityList() {
    this.subs.sink = this.studentService
      .getAllNationalities()
      .pipe(take(1))
      .subscribe((response) => {
        this.nationalList = response;
      });
  }

  recursiveParentChild(pcQuestionArray: UntypedFormArray, pcQuestionData, pcQuestionIndex) {
    pcQuestionData.parent_child_options.forEach((parentChildOption2, pcIndex2) => {
      const parentChildArray = pcQuestionArray.at(pcQuestionIndex).get('parent_child_options') as UntypedFormArray;
      parentChildArray.push(this.initParentChildOptionForm());
      if (parentChildOption2.questions && parentChildOption2.questions.length) {
        parentChildOption2.questions.forEach((pc2Question, pc2QuestionIndex) => {
          const pcQuestionArray2 = parentChildArray.at(pcIndex2).get('questions') as UntypedFormArray;
          pcQuestionArray2.push(this.initParentChildOptionQuestionForm());
          if (pc2Question && pc2Question.parent_child_options && pc2Question.parent_child_options.length) {
            this.recursiveParentChild(pcQuestionArray2, pc2Question, pc2QuestionIndex);
          }
        });
      }
    });
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
      numeric_validation: this.fb.group({
        condition: [null],
        number: [null],
        min_number: [null],
        max_number: [null],
        custom_error_text: [null],
      }),
      text_validation: this.fb.group({
        condition: [null],
        number: [null],
        custom_error_text: [null],
      }),
      multiple_option_validation: this.fb.group({
        condition: [null],
        number: [null],
        custom_error_text: [null],
      }),
      special_question: this.fb.group({
        summary_header: [null],
        summary_footer: [null],
      }),
      options: this.fb.array([]),
      parent_child_options: this.fb.array([]),
      question_label: [''],
      answer_type: [null],
      answer: [null], // didn't save anything just for the preview
      answer_multiple: [null], // didn't save anything just for the preview
    });
  }

  initParentChildOptionQuestionForm() {
    return this.fb.group({
      question_name: [''],
      question_type: [''],
      answer: [''],
      answer_type: [''],
      is_answer_required: [''],
      parent_child_options: this.fb.array([]),
    });
  }

  initOptionFieldForm() {
    return this.fb.group({
      option_name: [null],
      is_continue_next_step: [false],
      is_go_to_final_step: [false],
      additional_step_id: [null],
      additional_step_name: [null], // This won't be sent to BE
    });
  }

  initParentChildOptionForm() {
    return this.fb.group({
      option_text: [''],
      position: [''],
      questions: this.fb.array([]),
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

  getOptionFieldFormArray(segmentIndex, questionIndex): UntypedFormArray {
    return this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options') as UntypedFormArray;
  }

  addOptionField(segmentIndex, questionIndex) {
    this.getOptionFieldFormArray(segmentIndex, questionIndex).push(this.initOptionFieldForm());
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

  getMainParentChildOption(segmentIndex, questionIndex) {
    return this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('parent_child_options') as UntypedFormArray;
  }

  // to set options when user tick multiple options
  setOptions(segmentIndex: number, questionIndex: number, value: string) {
    let currentAnswers = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).value.answer_multiple;
    currentAnswers = currentAnswers ? currentAnswers : []; // if the currentAnswers are null by default, make it into an empty array
    let indexOfExistingValue = currentAnswers.indexOf(value);
    if (indexOfExistingValue >= 0) {
      // if exist remove
      currentAnswers.splice(indexOfExistingValue, 1);
    } else {
      // if not we add
      currentAnswers.push(value);
    }
    const answerMultiple = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex);
    answerMultiple.patchValue({ answer_multiple: currentAnswers });
    this.multipleOptionCustomValidators(answerMultiple);
    this.getQuestionFieldFormArray(segmentIndex).updateValueAndValidity();
  }

  multipleOptionCustomValidators(controls) {
    const inputControl = controls.get('answer_multiple') as UntypedFormControl;
    const optionValidation = controls.get('multiple_option_validation').value;
    const condition = optionValidation.condition;
    const number = optionValidation.number;

    if (!optionValidation) return;

    if (condition === 'Select at least') {
      if (inputControl.value.length >= number) {
        inputControl.setErrors(null);
      } else {
        inputControl.setErrors({ errors: true });
        inputControl.markAsTouched();
        inputControl.markAsDirty();
      }
    } else if (condition === 'Select at most') {
      if (inputControl.value.length <= number) {
        inputControl.setErrors(null);
      } else {
        inputControl.setErrors({ errors: true });
        inputControl.markAsTouched();
        inputControl.markAsDirty();
      }
    } else if (condition === 'Select at most') {
      if (inputControl.value.length === number) {
        inputControl.setErrors(null);
      } else {
        inputControl.setErrors({ errors: true });
        inputControl.markAsTouched();
        inputControl.markAsDirty();
      }
    }
  }

  numberCustomValidators(controls: UntypedFormControl) {
    const inputControl = controls.get('answer');
    const numericValidation = controls.get('numeric_validation').value;
    const condition = numericValidation.condition;
    const number = numericValidation.number;

    if (!numericValidation) return;

    if (condition === 'Greater than') {
      if (Number(inputControl.value) > number) {
        inputControl.setErrors(null);
      } else {
        inputControl.setErrors({ errors: true });
      }
    } else if (condition === 'Greater than or equal to') {
      if (Number(inputControl.value) >= number) {
        inputControl.setErrors(null);
      } else {
        inputControl.setErrors({ errors: true });
      }
    } else if (condition === 'Less than') {
      if (Number(inputControl.value) < number) {
        inputControl.setErrors(null);
      } else {
        inputControl.setErrors({ errors: true });
      }
    } else if (condition === 'Less than or equal to') {
      if (Number(inputControl.value) <= number) {
        inputControl.setErrors(null);
      } else {
        inputControl.setErrors({ errors: true });
      }
    } else if (condition === 'Equal to') {
      if (Number(inputControl.value) === number) {
        inputControl.setErrors(null);
      } else {
        inputControl.setErrors({ errors: true });
      }
    } else if (condition === 'Not equal to') {
      if (Number(inputControl.value) !== number) {
        inputControl.setErrors(null);
      } else {
        inputControl.setErrors({ errors: true });
      }
    } else if (condition === 'Between') {
      const min = Number(numericValidation.min_number);
      const max = Number(numericValidation.max_number);
      const value = Number(inputControl.value);
      if (min < value && value < max) {
        inputControl.setErrors(null);
      } else {
        inputControl.setErrors({ errors: true });
      }
    } else if (condition === 'Not between') {
      const min = Number(numericValidation.min_number);
      const max = Number(numericValidation.max_number);
      const value = Number(inputControl.value);
      if (min >= value || value >= max) {
        inputControl.setErrors(null);
      } else {
        inputControl.setErrors({ errors: true });
      }
    } else {
      return;
    }
  }

  shortOrLongTextCustomValidators(controls) {
    const inputControl = controls.get('answer');
    const textValidation = controls.get('text_validation').value;
    const condition = textValidation.condition;
    const number = textValidation.number;

    if (!textValidation) return;

    if (condition === 'Max Character') {
      if (String(inputControl.value).length <= number) {
        inputControl.setErrors(null);
      } else {
        inputControl.setErrors({ errors: true });
      }
    } else if (condition === 'Min Character') {
      if (String(inputControl.value).length >= number) {
        inputControl.setErrors(null);
      } else {
        inputControl.setErrors({ errors: true });
      }
    } else {
      return;
    }
  }

  onChangeParentChild(value, option, index: { segmentIndex: number; questionIndex: number }, parent: number, child: number) {
    const segment = this.templateStepForm.getRawValue().segments;
    const parentChild1 = segment[index.segmentIndex].questions[index.questionIndex].parent_child_options;
    for (let p1 = 0; p1 < parentChild1.length; p1++) {
      for (let p2 = 0; p2 < segment[index.segmentIndex].questions[index.questionIndex].parent_child_options[p1].questions.length; p2++) {
        segment[index.segmentIndex].questions[index.questionIndex].parent_child_options[p1].questions[p2].answer = '';
        for (
          let p3 = 0;
          p3 <
          segment[index.segmentIndex].questions[index.questionIndex].parent_child_options[p1].questions[p2].parent_child_options.length;
          p3++
        ) {
          for (
            let p4 = 0;
            p4 <
            segment[index.segmentIndex].questions[index.questionIndex].parent_child_options[p1].questions[p2].parent_child_options[p3]
              .questions.length;
            p4++
          ) {
            segment[index.segmentIndex].questions[index.questionIndex].parent_child_options[p1].questions[p2].parent_child_options[
              p3
            ].questions[p4].answer = '';
            for (
              let p5 = 0;
              p5 <
              segment[index.segmentIndex].questions[index.questionIndex].parent_child_options[p1].questions[p2].parent_child_options[p3]
                .questions[p4].parent_child_options.length;
              p5++
            ) {
              for (
                let p6 = 0;
                p6 <
                segment[index.segmentIndex].questions[index.questionIndex].parent_child_options[p1].questions[p2].parent_child_options[p3]
                  .questions[p4].parent_child_options[p5].questions.length;
                p6++
              ) {
                segment[index.segmentIndex].questions[index.questionIndex].parent_child_options[p1].questions[p2].parent_child_options[
                  p3
                ].questions[p4].parent_child_options[p5].questions[p6].answer = '';
              } // End for p6
            } // End for p5
          } // End for p4
        } // End for p3
      } // End for p2
    } // End for p1
    this.getQuestionFieldFormArray(index.segmentIndex).at(index.questionIndex).get('parent_child_options').patchValue(parentChild1);
  }

  onChangeParentChild2(value, option, index: { segmentIndex: number; questionIndex: number }, parent: number, child: number) {
    const segment = this.templateStepForm.getRawValue().segments;
    for (
      let i = 0;
      i <
      segment[index.segmentIndex].questions[index.questionIndex].parent_child_options[parent].questions[child].parent_child_options.length;
      i++
    ) {
      if (
        segment[index.segmentIndex].questions[index.questionIndex].parent_child_options[parent].questions[child].parent_child_options[i]
          .questions[child] !== undefined
      ) {
        segment[index.segmentIndex].questions[index.questionIndex].parent_child_options[parent].questions[child].parent_child_options[
          i
        ].questions[child].answer = '';
      }
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  
}
