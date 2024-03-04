import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { removeSpaces } from 'app/service/customvalidator.validator';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-add-form-step-dialog',
  templateUrl: './add-form-step-dialog.component.html',
  styleUrls: ['./add-form-step-dialog.component.scss'],
})
export class AddFormStepDialogComponent implements OnInit {
  addStepForm: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddFormStepDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.initAddStepForm();
    if (this.data) {
      console.log('data', this.data);
    }
  }

  initAddStepForm() {
    this.addStepForm = this.fb.group({
      step_title: ['', [Validators.required, removeSpaces]],
    });
  }

  submit() {
    if (this.addStepForm.invalid) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.addStepForm.markAllAsTouched();
    } else {
      console.log(this.addStepForm.value);
      this.checkStepTitle(this.addStepForm.get('step_title').value);
      // this.dialogRef.close(this.addStepForm.value);
    }
  }

  checkStepTitle(stepTitle) {
    if (this.data && this.data.length) {
      console.log('masuk', stepTitle);
      const textFound = this.data.filter((text) => text.step_title.toLowerCase() === stepTitle.toLowerCase());
      console.log('text found', textFound);
      if (textFound && textFound.length) {
        this.swalError();
      } else {
        console.log('step title not match any');
        this.dialogRef.close(this.addStepForm.value);
      }
    } else {
      console.log('data kosong');
      this.dialogRef.close(this.addStepForm.value);
    }
  }

  swalError() {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('UserForm_S14.TITLE'),
      text: this.translate.instant('UserForm_S14.TEXT'),
      confirmButtonText: this.translate.instant('UserForm_S14.CONFIRM'),
    }).then(() => {
      this.addStepForm.get('step_title').reset('', { emitEvent: true });
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
