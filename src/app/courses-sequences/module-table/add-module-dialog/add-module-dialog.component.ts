import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
  selector: 'ms-add-module-dialog',
  templateUrl: './add-module-dialog.component.html',
  styleUrls: ['./add-module-dialog.component.scss'],
})
export class AddModuleDialogComponent implements OnInit, OnDestroy {
  subject: UntypedFormGroup;
  subs = new SubSink();
  currentUser = null;
  isWaitingForResponse = false;

  constructor(
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddModuleDialogComponent>,
    private courseSequnceService: CourseSequenceService,
    private translate: TranslateService,
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
      short_name: ['', Validators.required],
      english_name: ['', Validators.required],
    });
  }

  patchValue() {
    const payload = _.cloneDeep(this.data);
    this.subject.patchValue(payload);
    console.log('patchValue', this.subject.value);
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
      this.subs.sink = this.courseSequnceService.UpdateModule(this.data._id, payload).subscribe(
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
          console.log('_message', err['message']);
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: Module name already exist') {
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
      this.subs.sink = this.courseSequnceService.CreateModule(payload).subscribe(
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
          console.log('_message', err['message']);
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: Module name already exist') {
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
