import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-duplicate-template-sequence-dialog',
  templateUrl: './duplicate-template-sequence-dialog.component.html',
  styleUrls: ['./duplicate-template-sequence-dialog.component.scss'],
})
export class DuplciateTemplateSequenceDialogComponent implements OnInit, OnDestroy {
  subs = new SubSink();
  templateForm: UntypedFormGroup;
  currentUser = null;
  isWaitingForResponse = false;

  constructor(
    private dialogRef: MatDialogRef<DuplciateTemplateSequenceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private courseSequnceService: CourseSequenceService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.initFormBuilder();
    if (this.data && this.data._id) {
      this.patchValue();
    }
  }

  patchValue() {
    const payload = _.cloneDeep(this.data);
    if (payload._id) {
      payload.template_course_sequence_id = payload._id;
    }
    delete payload.name;
    this.templateForm.patchValue(payload);
  }

  initFormBuilder() {
    this.templateForm = this.fb.group({
      name: [null, Validators.required],
      template_course_sequence_id: [this.data._id],
    });
  }

  checkFormValidity(): boolean {
    if (this.templateForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.templateForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  submitVerification() {
    if (this.checkFormValidity()) {
      return;
    }
    this.isWaitingForResponse = true;
    if (this.templateForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      }).then(() => {
        this.dialogRef.close(true);
      });
    } else {
      const payload = _.cloneDeep(this.templateForm.value);
      this.subs.sink = this.courseSequnceService
        .DuplicateTemplateCourseSequence(payload.template_course_sequence_id, payload.name)
        .subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close(true);
            });
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
            this.isWaitingForResponse = false;
            if (err['message'] === 'GraphQL error: Template name already exist') {
              Swal.fire({
                type: 'warning',
                title: this.translate.instant('Uniquename_S1.TITLE'),
                text: this.translate.instant('Uniquename_S1.TEXT'),
                confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              });
            } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
              Swal.fire({
                type: 'warning',
                title: this.translate.instant('BAD_CONNECTION.Title'),
                html: this.translate.instant('BAD_CONNECTION.Text'),
                confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
              });
            } else {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            }
          },
        );
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
