import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import swal from 'sweetalert2';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { FormFollowUpService } from 'app/form-follow-up/form-follow-up.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'app/service/auth-service/auth.service';
import * as moment from 'moment';

@Component({
  selector: 'ms-export-generation-info-dialog',
  templateUrl: './export-generation-info-dialog.component.html',
  styleUrls: ['./export-generation-info-dialog.component.scss'],
})
export class ExportGenerationInfoDialogComponent implements OnInit, OnDestroy {
  isWaitingForResponse = false;
  form: UntypedFormGroup;
  private subs = new SubSink();
  currentUserTypeId

  constructor(
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private formFollowUpService: FormFollowUpService,
    private dialogRef: MatDialogRef<ExportGenerationInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    const currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
  }

  initForm() {
    this.form = this.fb.group({
      exportName: ['Export', Validators.required],
    });
  }

  exportCSV() {
    const currentLang = this.translate.currentLang;
    const fileName = this.form.get('exportName').value;
    this.isWaitingForResponse = true;
    const offset = moment().utcOffset();
    this.subs.sink = this.formFollowUpService
      .generateFormProcessCSV(
        this.data?.form_builder_id,
        this.data?.data,
        this.data?.delimiter,
        fileName,
        currentLang,
        offset,
        this.data?.sorting,
        this.currentUserTypeId
      )
      .subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            console.log('result', resp);
            swal
              .fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              })
              .then((res) => {
                this.closeDialog();
              });
          }
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          // console.log('[Response BE][Error] : ', err);
          swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }

  checkFormValidity() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    } else {
      this.exportCSV();
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
