import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { FormFillingService } from 'app/form-filling/form-filling.service';

@Component({
  selector: 'ms-form-fill-recursive-email',
  templateUrl: './form-fill-recursive-email.component.html',
  styleUrls: ['./form-fill-recursive-email.component.scss'],
})
export class FormFillRecursiveEmailComponent implements OnInit {
  @Input() inputQuestion: UntypedFormGroup;
  @Input() stepForm: UntypedFormGroup;
  @Input() segmentIndex;
  @Input() questionIndex;
  @Input() pcoQuestionIndex;
  @Input() parentOptionText;
  @Input() isFormDisabled;

  constructor(private formFillingService: FormFillingService) {}

  ngOnInit() {
    this.inputQuestion.get('answer').setValidators([Validators.email]);
  }
}
