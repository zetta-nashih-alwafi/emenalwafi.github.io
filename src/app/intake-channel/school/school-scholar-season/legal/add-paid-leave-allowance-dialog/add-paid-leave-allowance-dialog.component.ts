import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-add-paid-leave-allowance-dialog',
  templateUrl: './add-paid-leave-allowance-dialog.component.html',
  styleUrls: ['./add-paid-leave-allowance-dialog.component.scss'],
})
export class AddPaidLeaveAllowanceDialogComponent implements OnInit {
  paidForm: UntypedFormGroup;
  selectedId: any;

  constructor(
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<AddPaidLeaveAllowanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private admissionEntrypointService: AdmissionEntrypointService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initFormBuilder();
    this.selectedId = this.data.selectedData.map((data) => data._id);
  }

  initFormBuilder() {
    this.paidForm = this.fb.group({
      paid_leave: [null, [Validators.required, Validators.pattern('^(?:\\d*(?:[.,]\\d{1,2})?|[.,]\\d{1,2})$')]],
      _id: [null],
    });
    this.paidForm.get('_id').patchValue(this.data.selectedData[0]._id);
    this.paidForm.get('paid_leave').patchValue(this.data.selectedData[0].paid_leave_allowance_rate);
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  onSubmit() {
    console.log(this.paidForm.controls);
    console.log(this.paidForm.value);
    if (this.paidForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.paidForm.markAllAsTouched();
      return true;
    } else {
      this.admissionEntrypointService.addPaidLeaveAllowance(this.selectedId, this.paidForm.get('paid_leave').value).subscribe(
        (resp) => {
          console.log(resp);
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
    const reg = /^-?\d*[.,]?\d{0,2}$/;
    const input = event.target.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }
}
