import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import { ApplicationUrls } from 'app/shared/settings';

@Component({
  selector: 'ms-condition-acceptance-form-preview',
  templateUrl: './condition-acceptance-form-preview.component.html',
  styleUrls: ['./condition-acceptance-form-preview.component.scss'],
})
export class ConditionAcceptanceFormPreviewComponent implements OnInit {
  _stepId: string;
  @Input() currentStepIndex: number;
  @Input() set stepId(value: string) {
    this._stepId = value;
    this.fetchStepData(value);
  }
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  get stepId(): string {
    return this._stepId;
  }

  documentOnPreviewUrl: any;
  stepData: any;

  constructor(private sanitizer: DomSanitizer, private formBuilderService: FormBuilderService) {}

  ngOnInit() {
    if (!this.stepId) {
      this.initStepContractFormListener();
    }
  }

  fetchStepData(stepId) {
    this.formBuilderService.getOneFormBuilderStep(stepId).subscribe((step) => {
      this.populateStepData(step);
    });
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
    console.log('_step', step);

    if (step && step.segments.length) {
      // if (step.segments[0].document_for_condition === 'use_from_certification_rule') {
      //   this.documentOnPreviewUrl = null;
      //   return;
      // }
      step.segments.forEach((element) => {
        element.questions.forEach((question) => {
          if (question.special_question && question.special_question.document_acceptance_type === 'upload_pdf') {
            this.setPreviewUrl(question.special_question.document_acceptance_pdf);
          } else {
            this.documentOnPreviewUrl = null;
          }
        });
      });
    } else {
      this.documentOnPreviewUrl = null;
    }
  }

  setPreviewUrl(url: string) {
    const result = this.serverimgPath + url + '#view=fitH';
    this.documentOnPreviewUrl = this.cleanUrlFormat(result);
  }

  cleanUrlFormat(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
