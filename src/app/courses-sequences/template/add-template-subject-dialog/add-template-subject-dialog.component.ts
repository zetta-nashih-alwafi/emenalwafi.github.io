import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { UtilityService } from 'app/service/utility/utility.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-add-template-subject-dialog',
  templateUrl: './add-template-subject-dialog.component.html',
  styleUrls: ['./add-template-subject-dialog.component.scss'],
})
export class AddTemplateSubjectDialogComponent implements OnInit, OnDestroy {
  subs = new SubSink();
  templateForm: UntypedFormGroup;

  isWaitingForResponse = false;
  subjectSelected = null;
  subjectList = [];

  constructor(
    private dialogRef: MatDialogRef<AddTemplateSubjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private courseSequenceService: CourseSequenceService,
    private utilService: UtilityService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initFormBuilder();
    this.getDataSubject();
  }

  getDataSubject() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.courseSequenceService.getAllCourseSubjectDropdown().subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.subjectList = _.cloneDeep(resp);
        this.subjectList = this.subjectList.sort((groupA, groupB) => {
          if (this.utilService.simplifyRegex(groupA.name) < this.utilService.simplifyRegex(groupB.name)) {
            return -1;
          } else if (this.utilService.simplifyRegex(groupA.name) > this.utilService.simplifyRegex(groupB.name)) {
            return 1;
          } else {
            return 0;
          }
        });
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        }
      },
    );
  }

  initFormBuilder() {
    this.templateForm = this.fb.group({
      _id: [null, Validators.required],
    });
  }

  subjectSelect(event) {
    console.log('subjectSelect', event);
    if (event === 'add') {
      this.dialogRef.close(event);
    }
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
    const subjectId = this.templateForm.get('_id').value;
    this.subjectSelected = this.subjectList.find((resp) => resp._id === subjectId);
    Swal.fire({
      type: 'success',
      title: 'Bravo!',
      confirmButtonText: 'OK',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then(() => {
      this.dialogRef.close(this.subjectSelected);
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
