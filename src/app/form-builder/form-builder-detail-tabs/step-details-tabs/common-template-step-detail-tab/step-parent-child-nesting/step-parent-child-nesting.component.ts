import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
// import { ChildOptions } from 'app/questionnaire-tools/questionaire.model';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

export interface Questions {
  _id?: string;
  is_answer_required: boolean;
  questionnaire_field_key: string;
  is_field: boolean;
  question_name: string;
  question_type: string;
  options: any[];
  answer: string;
  answer_multiple?: string [];
  parent_child_options?: ChildOptions[];
  sort_order?: number;
  answer_type?: any;
}
export interface ChildOptions {
  option_text: String;
  questions: Questions[];
  position: Number;
}

@Component({
  selector: 'ms-step-parent-child-nesting',
  templateUrl: './step-parent-child-nesting.component.html',
  styleUrls: ['./step-parent-child-nesting.component.scss'],
})
export class StepParentChildNestingComponent implements OnInit, OnDestroy {
  _parentAnswerType: string;

  @Input('parent_child_options') parent_child_options: ChildOptions;
  @Input('optionIndex') optionIndex: number;
  @Input('segmentIndex') segmentIndex: number;
  @Input('questionIndex') questionIndex: number;
  @Input('formBuilderForm') formBuilderForm: UntypedFormGroup;
  @Input('question') question;
  @Input('isViewOnly') isViewOnly;
  @Input('isForPDF') isForPDF;
  @Input() set parentAnswerType(value: string) {
    this._parentAnswerType = value;
  }
  currentAnswerType: string[] = [];
  answerTypes: any[];

  get parentAnswerType() {
    return this._parentAnswerType;
  }

  counter = 0;
  isNestingValid = true;
  questions: UntypedFormArray;
  parentChildValidation: boolean = true;
  private subs = new SubSink();

  constructor(private fb: UntypedFormBuilder, public formBuilderService: FormBuilderService, private translate: TranslateService) {}

  ngOnInit() {
    // this.questions = new FormArray(this.addQuestions());
    console.log('parent_child_options', this.parent_child_options);
    console.log('questionnaireForm', this.formBuilderForm);
    console.log('question', this.question);
    this.initParentFormBuilderListener();
    this.answerTypes = this.setAnswerTypes();
    this.setCurrentAnswerType();
  }

  initParentFormBuilderListener() {
    this.subs.sink = this.formBuilderForm.valueChanges.subscribe((event) => {
      if (event) {
        this.checkNestingValid();
      }
    });
  }

  setAnswerTypes() {
    const typesIncluded = ['numeric', 'date', 'time', 'duration', 'short_text', 'long_text', 'single_option', 'email'];
    return this.formBuilderService.getQuestionnaireConst().questionAnswerTypes.filter((type) => typesIncluded.includes(type.key));
  }

  setCurrentAnswerType() {
    this.parent_child_options.questions.forEach((question, index) => {
      this.currentAnswerType[index] = question.answer_type;
    });
  }

  // *************** Code Copied from V1

  checkNestingValid() {
    const formValue = { ...this.formBuilderForm.getRawValue() };
    const parentChildOptions = [].concat.apply(
      [],
      formValue.segments.map((segment) => segment.questions.map((question) => question.parent_child_options)),
    );
    this.formBuilderService.parentChildValidation = [].concat(...parentChildOptions).every((option) => this.validateParentChild(option));
  }

  validateParentChild(parent_child_option: any): boolean {
    if (!parent_child_option) return true;
    if (!parent_child_option.option_text) return false;
    if (parent_child_option && parent_child_option.questions && parent_child_option.questions.length) {
      for (const question of parent_child_option.questions) {
        if (!question.question_name || !question.answer_type) {
          return false;
        }

        if (question && question.parent_child_options && question.parent_child_options.length) {
          return question.parent_child_options.every((option) => this.validateParentChild(option));
        }
      }
    }
    return true;
  }

  async removeOption(optionIndex) {
    const input = {
      answerName: this.question.parent_child_options[optionIndex].option_text,
    };
    const confirmation = await this.fireCountdownSwal('Form_S5', input, input);
    if (confirmation.value) {
      this.question.parent_child_options.splice(optionIndex, 1);
      this.formBuilderService.updateCurrentStepDetailForm(this.formBuilderForm.value);
      this.checkNestingValid();
    }
  }

  async removeQuestion(questionIndex) {
    const input = {
      questionName: this.parent_child_options.questions[questionIndex].question_name,
    };
    const confirmation = await this.fireCountdownSwal('Form_S4', input, input);
    if (confirmation.value) {
      this.parent_child_options.questions.splice(questionIndex, 1);
      this.currentAnswerType.splice(questionIndex, 1);
      this.formBuilderService.updateCurrentStepDetailForm(this.formBuilderForm.value);
      this.checkNestingValid();
    }
  }

  addQuestion() {
    this.parent_child_options.questions.push({
      question_type: 'parent_child',
      question_name: '',
      // '_id': [q ? q._id ? q._id : q.id ? q.id : '' : ''],
      is_field: false,
      is_answer_required: false,
      options: [],
      answer: '',
      questionnaire_field_key: '',
      sort_order: 1,
      parent_child_options: [],
      answer_multiple: [],
      answer_type: null,
    });
    this.currentAnswerType.push('');
    this.formBuilderService.updateCurrentStepDetailForm(this.formBuilderForm.value);
    this.checkNestingValid();
  }

  addOption(question, questionIndex) {
    if (question) {
      this.parent_child_options.questions[questionIndex].parent_child_options.push({ option_text: '', position: 1, questions: [] });
    } else {
      this.question.parent_child_options.push({ option_text: '', position: 1, questions: [] });
    }
    this.formBuilderService.updateCurrentStepDetailForm(this.formBuilderForm.value);
    this.checkNestingValid();
  }

  updatequestion_name(questionIndex, name) {
    this.parent_child_options.questions[questionIndex].question_name = name.value;
    this.formBuilderService.updateCurrentStepDetailForm(this.formBuilderForm.value);
    this.checkNestingValid();
  }

  updateQuestionType(questionIndex, type) {
    this.parent_child_options.questions[questionIndex].question_type = 'parent_child';
    this.parent_child_options.questions[questionIndex].answer_type = type;
    this.currentAnswerType[questionIndex] = type;
    this.resetChildrenQuestions(questionIndex);
    if (type !== 'single_option') {
      this.parent_child_options.questions[questionIndex].parent_child_options.push({ option_text: '', position: 1, questions: [] });
    }
    this.formBuilderService.updateCurrentStepDetailForm(this.formBuilderForm.value);
    this.checkNestingValid();
  }

  resetChildrenQuestions(questionIndex) {
    this.parent_child_options.questions[questionIndex].parent_child_options = [];
  }

  updateOptionName(name) {
    this.parent_child_options.option_text = name.value;
    this.formBuilderService.updateCurrentStepDetailForm(this.formBuilderForm.value);
    this.checkNestingValid();
  }

  async fireCountdownSwal(localizationRef: string, titleInput: any, textInput: any) {
    const titleHasFalsyProperty = Object.values(titleInput).some((value) => !value);
    const textHasFalsyProperty = Object.values(textInput).some((value) => !value);

    if (titleHasFalsyProperty && textHasFalsyProperty) return Promise.resolve({ value: 'ok' });

    let timeout = 2;
    let confirmInterval;
    return await Swal.fire({
      type: 'warning',
      title: this.translate.instant(`${localizationRef}.TITLE`, titleInput),
      html: this.translate.instant(`${localizationRef}.TEXT`, textInput),
      confirmButtonText: this.translate.instant(`${localizationRef}.BUTTON_1`) + ` (${timeout})`,
      cancelButtonText: this.translate.instant(`${localizationRef}.BUTTON_2`),
      showCancelButton: true,
      onOpen: () => {
        timeout--;
        Swal.disableConfirmButton();
        const confirmButtonRef = Swal.getConfirmButton();
        confirmInterval = setInterval(() => {
          if (timeout > 0) {
            (confirmButtonRef.innerText = this.translate.instant(`${localizationRef}.BUTTON_1`) + ` (${timeout})`), timeout--;
          } else {
            Swal.enableConfirmButton();
            confirmButtonRef.innerText = this.translate.instant(`${localizationRef}.BUTTON_1`);
            clearInterval(confirmInterval);
          }
        }, 1000);
      },
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
