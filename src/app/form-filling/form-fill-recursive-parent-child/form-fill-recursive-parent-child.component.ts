import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'ms-form-fill-recursive-parent-child',
  templateUrl: './form-fill-recursive-parent-child.component.html',
  styleUrls: ['./form-fill-recursive-parent-child.component.scss'],
})
export class FormFillRecursiveParentChildComponent implements OnInit {
  @Input() stepForm;
  @Input() segmentIndex;
  @Input() questionIndex;
  @Input() inputOption;
  @Input() pcoOptionIndex;
  @Input() parentSelectedOption: string;
  @Input() isFormDisabled;

  constructor() {}

  ngOnInit() {
    console.log('input Question from parent in this recursive parent child is: ', this.inputOption);
  }
}
