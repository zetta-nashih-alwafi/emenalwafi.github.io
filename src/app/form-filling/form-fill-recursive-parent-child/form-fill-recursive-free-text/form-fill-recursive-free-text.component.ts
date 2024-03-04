import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { FormFillingService } from 'app/form-filling/form-filling.service';

@Component({
  selector: 'ms-form-fill-recursive-free-text',
  templateUrl: './form-fill-recursive-free-text.component.html',
  styleUrls: ['./form-fill-recursive-free-text.component.scss']
})
export class FormFillRecursiveFreeTextComponent implements OnInit {
  @Input() inputQuestion: UntypedFormGroup;
  @Input() stepForm: UntypedFormGroup;
  @Input() segmentIndex;
  @Input() questionIndex;
  @Input() isFormDisabled;
  @Input() pcoQuestionIndex;
  @Input() parentOptionText;
  
  constructor(private formFillingService: FormFillingService) { }

  ngOnInit() {
  }
}
