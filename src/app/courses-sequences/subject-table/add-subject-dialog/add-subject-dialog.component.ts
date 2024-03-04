import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-add-subject-dialog',
  templateUrl: './add-subject-dialog.component.html',
  styleUrls: ['./add-subject-dialog.component.scss'],
})
export class AddSubjectDialogComponent implements OnInit, OnDestroy {
  subject: UntypedFormGroup;
  subs = new SubSink();
  currentUser = null;
  isWaitingForResponse = false;

  constructor(
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddSubjectDialogComponent>,
    private courseSequnceService: CourseSequenceService,
    private translate: TranslateService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initForm();
    if (this.data && this.data._id) {
      this.patchValue();
    }
  }
  initForm() {
    this.subject = this.fb.group({
      name: ['', Validators.required],
      short_name: ['', [Validators.required, Validators.maxLength(30)]],
      english_name: ['', Validators.required],
    });
  }

  patchValue() {
    const payload = _.cloneDeep(this.data);
    this.subject.patchValue(payload);
  }

  checkFormValidity(): boolean {
    if (this.subject.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.subject.markAllAsTouched();
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
    const payload = _.cloneDeep(this.subject.value);
    if (this.data && this.data._id) {
      this.subs.sink = this.courseSequnceService.UpdateCourseSubject(this.data._id, payload).subscribe(
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
          if (err['message'] === 'GraphQL error: Subject name already exist') {
            Swal.fire({
              title: this.translate.instant('Uniquename_S1.TITLE'),
              text: this.translate.instant('Uniquename_S1.TEXT'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
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
    } else {
      this.subs.sink = this.courseSequnceService.CreateCourseSubject(payload).subscribe(
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
            if (this.data && this.data.data === 'form') {
              this.dialogRef.close(resp);
            } else {
              this.dialogRef.close(true);
            }
          });
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: Subject name already exist') {
            Swal.fire({
              title: this.translate.instant('Uniquename_S1.TITLE'),
              text: this.translate.instant('Uniquename_S1.TEXT'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
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

  close() {
    this.dialogRef.close();
  }
}
