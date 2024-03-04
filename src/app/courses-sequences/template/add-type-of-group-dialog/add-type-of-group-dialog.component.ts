import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-add-type-of-group-dialog',
  templateUrl: './add-type-of-group-dialog.component.html',
  styleUrls: ['./add-type-of-group-dialog.component.scss'],
})
export class AddTypeOfGroupDialogComponent implements OnInit, OnDestroy {
  isWaitingForResponse = false;
  private subs = new SubSink();
  form: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private courseSequenceService: CourseSequenceService,
    private dialogRef: MatDialogRef<AddTypeOfGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initForm();
    this.patchData();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  patchData() {
    if (this.data && this.data.group && this.data.group.group_class_types && this.data.group.group_class_types.length) {
      const payload = _.cloneDeep(this.data.group.group_class_types);
      payload.forEach((element) => {
        this.addGroupTypes();
        if (element.group_classes_id && element.group_classes_id.length) {
          element.group_classes_id = element.group_classes_id.map((resp) => resp._id);
        }
        if (element._id) {
          element.group_class_type_id = element._id;
        }
      });
      this.form.get('group_class_types').patchValue(payload);
    }
  }

  initForm() {
    this.form = this.fb.group({
      program_sequence_group_id: [this.data.group._id, [Validators.required]],
      program_sequence_id: [this.data.sequence._id, [Validators.required]],
      type_group_name: [null, [Validators.required]],
      group_class_types: this.fb.array([]),
    });
  }

  initGroupClass() {
    return this.fb.group({
      group_class_type_id: [null],
      name: [null],
      group_classes_id: [[]],
    });
  }

  get groupClassArray() {
    return this.form.get('group_class_types') as UntypedFormArray;
  }

  addGroupTypes() {
    this.groupClassArray.push(this.initGroupClass());
  }

  checkFormValidity(): boolean {
    if (this.form.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.form.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  validate() {
    if (this.checkFormValidity()) {
      return;
    }
    this.isWaitingForResponse = true;
    this.addGroupTypes();
    const lastIndex = this.groupClassArray.length - 1;
    const group = {
      group_class_type_id: null,
      name: this.form.get('type_group_name').value,
      group_classes_id: [],
    };
    this.groupClassArray.at(lastIndex).patchValue(group);
    const payload = _.cloneDeep(this.form.value);
    // console.log('payload', payload);
    this.subs.sink = this.courseSequenceService
      .CreateUpdateGroupTypes(payload.program_sequence_id, payload.group_class_types, payload.program_sequence_group_id)
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
          if (err['message'] === 'GraphQL error: Group name already used' || err['message'] === 'GraphQL error: Name already exsist') {
            Swal.fire({
              title: this.translate.instant('Uniquename_S1.TITLE'),
              text: this.translate.instant('Uniquename_S1.TEXT'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
            });
            const lasttIndex = this.groupClassArray.length - 1;
            this.groupClassArray.removeAt(lasttIndex);
          } else if (err['message'] === 'GraphQL error: cannot update if session in teacher subject table already have assigned teacher') {
            Swal.fire({
              title: this.translate.instant('Course_and_Sequences_S1.TITLE'),
              text: this.translate.instant('Course_and_Sequences_S1.TEXT'),
              type: 'warning',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('Course_and_Sequences_S1.BUTTON'),
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
