import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-add-site-dialog',
  templateUrl: './add-site-dialog.component.html',
  styleUrls: ['./add-site-dialog.component.scss'],
})
export class AddSiteDialogComponent implements OnInit, OnDestroy {
  subs = new SubSink();
  siteForm: UntypedFormGroup;

  isWaitingForResponse = false;

  constructor(
    private dialogRef: MatDialogRef<AddSiteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private intakeService: IntakeChannelService,
    private authService:AuthService
  ) {}

  ngOnInit() {
    this.initFormBuilder();
  }

  initFormBuilder() {
    this.siteForm = this.fb.group({
      name: [null, Validators.required],
      address: [null, Validators.required],
      zip_code: [null, Validators.required],
      city: [null, Validators.required],
      country: [null, Validators.required],
    });

    if (this.data.title === 'Edit') {
      this.siteForm.patchValue(this.data.content);
    }
  }

  checkFormValidity(): boolean {
    if (this.siteForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.siteForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  submitVerification() {
    if (this.checkFormValidity()) {
      return;
    }
    this.isWaitingForResponse = true;
    if (this.siteForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      }).then(() => {
        this.dialogRef.close(true);
      });
    } else {
      if (this.data.title === 'Add new') {
        this.subs.sink = this.intakeService.CreateSite(this.siteForm.value).subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            console.log('Add Site', resp);
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
            console.log('_message', err['message']);
            this.isWaitingForResponse = false;
            this.authService.postErrorLog(err)
            if (err['message'] === 'GraphQL error: Site name already exist') {
              Swal.fire({
                title: this.translate.instant('Uniquename_S1.TITLE'),
                text: this.translate.instant('Uniquename_S1.TEXT'),
                type: 'info',
                showConfirmButton: true,
                confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
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
      } else if (this.data.title === 'Edit') {
        this.subs.sink = this.intakeService.UpdateSite(this.siteForm.value, this.data.content._id).subscribe(
          (resp) => {
            console.log('Edit Site', resp);
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
            console.log('_message', err['message']);
            this.isWaitingForResponse = false;
            this.authService.postErrorLog(err)
            if (err['message'] === 'GraphQL error: Site name already used') {
              Swal.fire({
                title: this.translate.instant('Uniquename_S1.TITLE'),
                text: this.translate.instant('Uniquename_S1.TEXT'),
                type: 'info',
                showConfirmButton: true,
                confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
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
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
