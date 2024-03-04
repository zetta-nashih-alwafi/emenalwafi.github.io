import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { InternshipService } from 'app/service/internship/internship.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-ask-revision-dialog',
  templateUrl: './ask-revision-dialog.component.html',
  styleUrls: ['./ask-revision-dialog.component.scss'],
})
export class AskRevisionDialogComponent implements OnInit, OnDestroy {
  revisionForm: UntypedFormGroup;
  private subs = new SubSink();
  userId: any;
  userIdentity: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    public dialogRef: MatDialogRef<AskRevisionDialogComponent>,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private internshipService: InternshipService,
    private router: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.router.queryParams.subscribe((res) => {
      if (res && res.user) {
        this.userId = res.user;
      }
      if (res && res.identity) {
        this.userIdentity = res.identity;
      }
      // console.log(res, this.userId, this.userIdentity);
    });
    // console.log('_par', this.parentData);
    this.initForm();
  }

  initForm() {
    this.revisionForm = this.fb.group({
      reason_input: ['', Validators.required],
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSave() {
    Swal.fire({
      type: 'question',
      text: this.translate.instant('INTERNSHIP_S7.TEXT'),
      confirmButtonText: this.translate.instant('INTERNSHIP_S7.BUTTON_1'),
      cancelButtonText: this.translate.instant('INTERNSHIP_S7.BUTTON_2'),
      showCancelButton: true,
    }).then((res) => {
      if (res.value) {
        const reason = this.revisionForm.get('reason_input').value;
        const is_student = this.userIdentity === 'student' ? true : false;
        this.subs.sink = this.internshipService
          .triggerNotificationINTERNSHIP_N8(this.parentData, reason, this.userId, is_student)
          .subscribe(
            (resp) => {
              if (resp) {
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('Bravo!'),
                  confirmButtonText: this.translate.instant('OK'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  // console.log('_success', resp);
                  this.dialogRef.close(true);
                });
              }
            },
            (err) => {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            },
          );
      }
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
