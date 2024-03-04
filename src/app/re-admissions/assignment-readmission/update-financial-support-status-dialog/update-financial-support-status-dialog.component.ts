import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import * as _ from 'lodash';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-update-financial-support-status-dialog',
  templateUrl: './update-financial-support-status-dialog.component.html',
  styleUrls: ['./update-financial-support-status-dialog.component.scss'],
})
export class UpdateFinancialSupportStatusDialogComponent implements OnInit {
  private subs = new SubSink();
  financialSupportForm: UntypedFormGroup;
  formData: any;
  isWaitingForResponse: boolean = false;

  typeList = ['ok', 'not_ok'];
  constructor(
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<UpdateFinancialSupportStatusDialogComponent>,
    private candidateService: CandidatesService,
    private translate: TranslateService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.formData = _.cloneDeep(this.parentData);
    this.initForm();
  }

  initForm() {
    this.financialSupportForm = this.fb.group({
      financial_situation: ['', [Validators.required]],
    });
  }

  checkFormValidity(): boolean {
    if (this.financialSupportForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.financialSupportForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  submit() {
    if (this.financialSupportForm.invalid) {
      this.checkFormValidity();
    } else {
      this.isWaitingForResponse = true;
      const payload = this.financialSupportForm.value;
      const candidateIds = this.formData.map((res) => res._id);
      this.subs.sink = this.candidateService.UpdateManyCandidates(candidateIds, payload).subscribe(
        (res) => {
          this.isWaitingForResponse = false;
          if (res) {
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
          }
        },
        (err) => {
          this.authService.postErrorLog(err)
          if (
            err &&
            err['message'] &&
            (err['message'].includes('jwt expired') ||
              err['message'].includes('str & salt required') ||
              err['message'].includes('Authorization header is missing') ||
              err['message'].includes('salt'))
          ) {
            this.authService.handlerSessionExpired();
            return;
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

  closeDialog() {
    this.dialogRef.close();
  }
}
