import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-add-sector-dialog',
  templateUrl: './add-sector-dialog.component.html',
  styleUrls: ['./add-sector-dialog.component.scss'],
})
export class AddSectorDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  sectorForm: UntypedFormGroup;

  isWaitingForResponse = false;

  constructor(
    public dialogRef: MatDialogRef<AddSectorDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private intakeService: IntakeChannelService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService:AuthService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.sectorForm = this.fb.group({
      name: [null, Validators.required],
      description: [null],
      sigli: [null, Validators.required],
    });

    if (this.data.title === 'Edit') {
      this.sectorForm.patchValue(this.data.content);
    }
  }

  submitVerification() {
    if (this.checkFormValidity()) {
      return;
    }
    this.isWaitingForResponse = true;
    if (this.sectorForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      }).then(() => {
        this.dialogRef.close(true);
      });
    } else {
      if (this.data.title === 'Add') {
        this.subs.sink = this.intakeService.CreateSector(this.sectorForm.value).subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            console.log('Add Sector', resp);
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
            if (err['message'] === 'GraphQL error: Name already exists!') {
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
        this.subs.sink = this.intakeService.UpdateSector(this.sectorForm.value, this.data.content._id).subscribe(
          (resp) => {
            console.log('Edit Sector', resp);
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
            if (err['message'] === 'GraphQL error: Name already exists!') {
              Swal.fire({
                title: this.translate.instant('Uniquename_S1.TITLE'),
                text: this.translate.instant('Uniquename_S1.TEXT'),
                type: 'info',
                showConfirmButton: true,
                confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
              }).then(() => this.dialogRef.close(true));
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

  checkFormValidity(): boolean {
    if (this.sectorForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.sectorForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
