import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-down-payment-form-preview',
  templateUrl: './down-payment-form-preview.component.html',
  styleUrls: ['./down-payment-form-preview.component.scss'],
})
export class DownPaymentFormPreviewComponent implements OnInit {
  _stepId: string;
  @Input() currentStepIndex: number;
  stepData: any;
  @Input() set stepId(value: string) {
    this._stepId = value;
    this.fetchStepData(value);
  }

  get stepId(): string {
    return this._stepId;
  }

  listPayment = ['credit_card', 'transfer'];
  depositAmount = 100;

  constructor(private formBuilderService: FormBuilderService, public sanitizer: DomSanitizer, private authService: AuthService) {}

  ngOnInit() {
    if (!this.stepId) {
      this.initStepContractFormListener();
    }
  }

  fetchStepData(stepId) {
    this.formBuilderService.getOneFormBuilderStep(this.stepId).subscribe((step) => {
      if (step) {
        // console.log(step);
        this.stepData = step;
      }
    }, (err) => {
      this.authService.postErrorLog(err);
    });
  }

  initStepContractFormListener() {
    this.formBuilderService.stepData$.subscribe((formData) => {
      if (formData) {
        this.stepData = formData;
      }
    });
  }
}
