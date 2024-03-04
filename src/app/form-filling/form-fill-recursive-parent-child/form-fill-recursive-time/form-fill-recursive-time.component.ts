import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'ms-form-fill-recursive-time',
  templateUrl: './form-fill-recursive-time.component.html',
  styleUrls: ['./form-fill-recursive-time.component.scss']
})
export class FormFillRecursiveTimeComponent implements OnInit {
  @Input() inputQuestion: UntypedFormGroup;
  @Input() stepForm: UntypedFormGroup;
  @Input() segmentIndex;
  @Input() questionIndex;
  @Input() pcoQuestionIndex;
  @Input() parentOptionText;
  @Input() isFormDisabled;
  timeForm: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
  ) { }

  ngOnInit() {
    console.log('isFormDisabled', this.isFormDisabled)
    if(this.inputQuestion.get('answer')) {
      console.log('answer time..',this.inputQuestion.get('answer').value)
    } 
  }
}
