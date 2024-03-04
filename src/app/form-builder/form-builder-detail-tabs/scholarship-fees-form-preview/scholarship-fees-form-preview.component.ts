import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { ApplicationUrls } from 'app/shared/settings';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-scholarship-fees-form-preview',
  templateUrl: './scholarship-fees-form-preview.component.html',
  styleUrls: ['./scholarship-fees-form-preview.component.scss'],
})
export class ScholarshipFeesFormPreviewComponent implements OnInit {
  _stepId: string;
  @Input() currentStepIndex: number;
  @Input() set stepId(value: string) {
    this._stepId = value;
    this.fetchStepData(value);
  }

  get stepId(): string {
    return this._stepId;
  }

  documentOnPreviewUrl: any;
  stepData: any;
  depositAmount = 0;
  rateAmount = 0;
  discount = 0;
  discountCalculted = 0;
  suppIndex = 0;
  registrationFee = 0;
  totalCost = 0;
  listTerms: any[] = [
    {
      additional_cost: 0,
      additional_expense: 260,
      down_payment: 900,
      name: '-640.00€ - 1 echeances',
      payment_date: [
        {
          amount: -640,
          date: '31/10/2022',
        },
      ],
      payment_mode_id: '61892b9267e6e4135fe90245',
      select_payment_method_available: ['transfer', 'sepa'],
      times: 1,
      total_amount: -640,
    },
    {
      additional_cost: 0,
      additional_expense: 260,
      down_payment: 900,
      name: '-640.00€ - 1 echeances',
      payment_date: [
        {
          amount: -640,
          date: '31/10/2022',
        },
      ],
      payment_mode_id: '61892b9267e6e4135fe90245',
      select_payment_method_available: ['transfer', 'sepa'],
      times: 1,
      total_amount: -640,
    },
    {
      additional_cost: 0,
      additional_expense: 260,
      down_payment: 900,
      name: '-640.00€ - 1 echeances',
      payment_date: [
        {
          amount: -640,
          date: '31/10/2022',
        },
      ],
      payment_mode_id: '61892b9267e6e4135fe90245',
      select_payment_method_available: ['transfer', 'sepa'],
      times: 1,
      total_amount: -640,
    },
  ];

  constructor(
    public sanitizer: DomSanitizer,
    private formBuilderService: FormBuilderService,
    private translate: TranslateService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    if (!this.stepId) {
      this.initStepContractFormListener();
    }
  }

  fetchStepData(stepId) {
    this.formBuilderService.getOneFormBuilderStep(stepId).subscribe(
      (step) => {
        this.populateStepData(step);
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  initStepContractFormListener() {
    this.formBuilderService.stepData$.subscribe((formData) => {
      if (formData) {
        this.populateStepData(formData);
      }
    });
  }

  populateStepData(step) {
    this.stepData = step;
  }

  calcTotal(data) {
    // if (this.registrationFee && this.rateAmount) {
    //   this.totalCost = this.rateAmount + this.registrationFee + data.additional_cost;
    //   return this.totalCost;
    // }
    this.totalCost = data.total_amount + data.down_payment;
    return this.totalCost;
  }
}
