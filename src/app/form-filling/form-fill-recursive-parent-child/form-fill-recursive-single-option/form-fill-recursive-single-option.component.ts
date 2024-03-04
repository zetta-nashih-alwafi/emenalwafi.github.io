import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { FormFillingService } from 'app/form-filling/form-filling.service';

@Component({
  selector: 'ms-form-fill-recursive-single-option',
  templateUrl: './form-fill-recursive-single-option.component.html',
  styleUrls: ['./form-fill-recursive-single-option.component.scss'],
})
export class FormFillRecursiveSingleOptionComponent implements OnInit {
  @Input() inputQuestion: UntypedFormGroup;
  @Input() stepForm: UntypedFormGroup;
  @Input() segmentIndex;
  @Input() questionIndex;
  @Input() pcoQuestionIndex;
  @Input() parentOptionText;
  @Input() isFormDisabled;
  selectedOption;
  selectedOptionIndex: number;
  initialValue: any;

  constructor(private formFillingService: FormFillingService) {}

  ngOnInit() {
    console.log('inputQuestion is now:', this.inputQuestion);
    this.initialValue = this.inputQuestion.get('parent_child_options').value;
    this.setSelectedOption(this.inputQuestion.get('answer').value); // for populating the current answer
  }

  setSelectedOption(settedAnswer: string) {
    if (!settedAnswer || !this.inputQuestion.get('parent_child_options').value) return;
    this.selectedOptionIndex = this.inputQuestion
      .get('parent_child_options')
      .value.findIndex((option) => option.option_text === settedAnswer);
    this.selectedOption = (this.inputQuestion.get('parent_child_options') as UntypedFormArray).at(this.selectedOptionIndex);
  }

  updateQuestionAnswer(chosenOption: any) {
    this.resetAllOptionsObject();
    console.log('value selected is:', chosenOption.value);
    this.setSelectedOption(chosenOption.value);
    console.log('selected OPtion is:', this.selectedOption);
    // this.formFillingService.triggerFormFillChangeEvent(true);
  }

  resetAllOptionsObject() {
    this.inputQuestion.get('parent_child_options').reset(this.initialValue);
  }
}
