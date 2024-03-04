import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { ApplicationUrls } from 'app/shared/settings';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-campus-validation-form-preview',
  templateUrl: './campus-validation-form-preview.component.html',
  styleUrls: ['./campus-validation-form-preview.component.scss'],
})
export class CampusValidationFormPreviewComponent implements OnInit {
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
}
