import { FinancesService } from './../../../service/finance/finance.service';
import { AuthService } from './../../../service/auth-service/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-special-case-reason',
  templateUrl: './special-case-reason.component.html',
  styleUrls: ['./special-case-reason.component.scss']
})
export class SpecialCaseReasonComponent implements OnInit {
  form: UntypedFormGroup
  private subs = new SubSink()
  isWaitingForResponse: boolean = false

  constructor(
    public dialogRef: MatDialogRef<SpecialCaseReasonComponent>,
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private candidateService: CandidatesService,
    private translate: TranslateService,
    private authService: AuthService,
    private financeService: FinancesService
  ) { }

  ngOnInit(): void {
    console.log('cek data',this.data)
    this.initForm()
  }
  initForm() {
    this.form = this.fb.group({
      comment: [null, Validators.required]
    })
  }
  createPayload() {
    let payload = this.form.value
    payload.candidate_id = this.data?.candidate_id
    payload.subject = 'Change status special case'
    payload.category = 'Finance'
    return payload
  }
  validate() {
    if (this.form?.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      this.form.markAllAsTouched();
      return;
    }
    
    const payload = this.createPayload()
    this.isWaitingForResponse = true
    this.subs.sink = this.candidateService.CreateCandidateComment(payload).subscribe(resp => {
      if (resp) {
        this.updateBilling()
      } else {
        this.isWaitingForResponse = false
      }
    }, err => {
      this.isWaitingForResponse = false;
      this.authService.postErrorLog(err);
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    })
  }
  updateBilling() {
    const payload = {
      is_have_special_case: this.data?.is_have_special_case ? false : true
    }
    this.isWaitingForResponse = true
    this.subs.sink = this.financeService.updateBillingDialog(payload, this.data?.billing_id).subscribe(resp => {
      this.isWaitingForResponse = false
      Swal.fire({
        type: 'success',
        title: 'Bravo!',
        confirmButtonText: 'OK',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then(resp=>{
        this.close('update')
      })
    }, err => {
      this.isWaitingForResponse = false;
      this.authService.postErrorLog(err);
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    })
  }
  close(resp?) {
    this.dialogRef.close(resp)
  }

}
