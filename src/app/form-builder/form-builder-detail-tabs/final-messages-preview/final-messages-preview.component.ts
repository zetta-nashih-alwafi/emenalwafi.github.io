import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ApplicationUrls } from 'app/shared/settings';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-final-messages-preview',
  templateUrl: './final-messages-preview.component.html',
  styleUrls: ['./final-messages-preview.component.scss'],
})
export class FinalMessagesPreviewComponent implements OnInit, OnDestroy {
  _stepId: string;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  private subs = new SubSink();
  @Input() currentStepIndex: number;
  formData: any;
  @Input() set stepId(value: string) {
    this._stepId = value;
    this.fetchStepData(value);
  }

  get stepId(): string {
    return this._stepId;
  }

  constructor(
    private formBuilderService: FormBuilderService,
    public sanitizer: DomSanitizer,
    private translate: TranslateService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    if (!this.stepId) {
      this.initStepFinalFormListener();
    }
  }

  fetchStepData(stepId) {
    this.subs.sink = this.formBuilderService.getOneFormBuilderStep(stepId).subscribe(
      (resp) => {
        if (resp) {
          const data = _.cloneDeep(resp);
          this.formData = data;
        }
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

  initStepFinalFormListener() {
    this.subs.sink = this.formBuilderService.stepData$.subscribe((data) => {
      if (data) {
        console.log('stepData', data);
        this.formData = data;
        // this.initTemplateStepForm();
        // this.populateStepData(formData);
      }
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
