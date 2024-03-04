import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { FormFillingService } from 'app/form-filling/form-filling.service';

@Component({
  selector: 'ms-form-fill-recursive-numeric',
  templateUrl: './form-fill-recursive-numeric.component.html',
  styleUrls: ['./form-fill-recursive-numeric.component.scss'],
})
export class FormFillRecursiveNumericComponent implements OnInit {
  @Input() inputQuestion;
  @Input() stepForm: UntypedFormGroup;
  @Input() segmentIndex;
  @Input() questionIndex;
  @Input() pcoQuestionIndex;
  @Input() parentOptionText;
  @Input() isFormDisabled;

  constructor(private formFillingService: FormFillingService) {}

  ngOnInit() {}

  preventNonNumericalInput(event) {
    if (event && event.key) {
      if (!event.key.match(/^[0-9]+$/)) {
        event.preventDefault();
      }
    }
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }
}
