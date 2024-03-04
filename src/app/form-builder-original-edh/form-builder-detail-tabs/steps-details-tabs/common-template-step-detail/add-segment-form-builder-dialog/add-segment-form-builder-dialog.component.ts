import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { removeSpaces } from 'app/service/customvalidator.validator';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-add-segment-form-builder-dialog',
  templateUrl: './add-segment-form-builder-dialog.component.html',
  styleUrls: ['./add-segment-form-builder-dialog.component.scss'],
})
export class AddSegmentFormBuilderDialogComponent implements OnInit {
  addSegmentForm: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddSegmentFormBuilderDialogComponent>,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.initForm();
    console.log(this.data);
  }

  initForm() {
    this.addSegmentForm = this.fb.group({
      addSegment: ['', [Validators.required, removeSpaces]],
    });
  }

  submit() {
    // this.dialogRef.close(this.duplicateTemplateForm.value);
    if (this.addSegmentForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
      this.addSegmentForm.markAllAsTouched();
    } else {
      console.log(this.addSegmentForm.value);
      this.dialogRef.close(this.addSegmentForm.value);
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
