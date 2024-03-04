import { ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CustomValidators } from 'ng2-validation';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { UserService } from 'app/service/user/user.service';
import { TranslateService } from '@ngx-translate/core';
import { CoreService } from 'app/service/core/core.service';
import { FormFillingService } from 'app/form-filling/form-filling.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';

@Component({
  selector: 'ms-edit-program-desired-dialog',
  templateUrl: './edit-program-desired-dialog.component.html',
  styleUrls: ['./edit-program-desired-dialog.component.scss'],
})
export class EditProgramDesiredDialogComponent implements OnInit, OnDestroy {
  @ViewChild('mobileNumber', { static: false }) mobileNumberInput;
  private subs = new SubSink();
  addProgramDesired: UntypedFormGroup;
  typeList = ['OPCO', 'CPF', 'Transition Pro', 'Pôle Emploi', 'Région', 'Other financing organization'];

  isWaitingForResponse = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<EditProgramDesiredDialogComponent>,
    private authService: AuthService,
    private router: Router,
    private candidateService: CandidatesService,
    private translate: TranslateService,
    public coreService: CoreService,
  ) {}

  ngOnInit() {
    this.initForm();
    if (this.parentData.data.length === 1) {
      this.addProgramDesired.patchValue(this.parentData.data[0]);
    }
  }

  initForm() {
    this.addProgramDesired = this.fb.group({
      program_desired: ['', [Validators.required]],
    });
  }

  checkFormValidity(): boolean {
    if (this.addProgramDesired.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.addProgramDesired.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  submit() {
    if (this.checkFormValidity()) {
      return;
    }
    this.isWaitingForResponse = true;
    const payload = _.cloneDeep(this.addProgramDesired.value);
    this.updateProgramDesired(this.parentData.id, payload);
  }

  updateProgramDesired(id, payload) {
    if (this.parentData?.select_all) {
      this.subs.sink = this.candidateService
        .UpdateManyJuryDecision(this.parentData?.filter, this.parentData?.select_all, this.parentData?.is_readmission, payload)
        .subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close(resp);
            });
          },
          (error) => {
            this.isWaitingForResponse = false;
            console.log(error, error.message);
            this.authService.postErrorLog(error);
            if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            }
          },
        );
    } else {
      this.subs.sink = this.candidateService.UpdateManyCandidates(id, payload).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.dialogRef.close(resp);
          });
        },
        (error) => {
          this.isWaitingForResponse = false;
          console.log(error, error.message);
          this.authService.postErrorLog(error);
          if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
              text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
