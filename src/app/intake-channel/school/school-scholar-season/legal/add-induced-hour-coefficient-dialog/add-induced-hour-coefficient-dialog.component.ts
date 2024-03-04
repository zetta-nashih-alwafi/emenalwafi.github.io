import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-add-induced-hour-coefficient-dialog',
  templateUrl: './add-induced-hour-coefficient-dialog.component.html',
  styleUrls: ['./add-induced-hour-coefficient-dialog.component.scss'],
})
export class AddInducedHourCoefficientDialogComponent implements OnInit {
  inducedForm: UntypedFormGroup;
  selectedId: any;

  constructor(
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<AddInducedHourCoefficientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private admissionEntrypointService: AdmissionEntrypointService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initFormBuilder();
    this.selectedId = this.data.selectedData.map((data) => data._id);
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  initFormBuilder() {
    this.inducedForm = this.fb.group({
      induced_hours: [null, [Validators.required, Validators.pattern('^(?:\\d*(?:[.,]\\d{1,5})?|[.,]\\d{1,2})$')]],
      _id: [null],
    });
    this.inducedForm.get('_id').patchValue(this.data.selectedData[0]._id);
    this.inducedForm.get('induced_hours').patchValue(this.data.selectedData[0].induced_hours_coefficient);
  }

  onSubmit() {
    // console.log(this.inducedForm.controls);
    // console.log(this.inducedForm.value);
    if (this.inducedForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.inducedForm.markAllAsTouched();
      return true;
    } else {
      this.admissionEntrypointService.addInducedHoursCoefficient(this.selectedId, this.inducedForm.get('induced_hours').value).subscribe(
        (resp) => {
          // console.log(resp)
          Swal.fire({
            type: 'success',
            title: 'Bravo!',
            confirmButtonText: 'OK',
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.dialogRef.close(true);
          });
        },
        (err) => {
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
  }

  decimalFilter(event: any) {
    const reg = /^-?\d*[.,]?\d{0,5}$/;
    const input = event.target.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }
}
