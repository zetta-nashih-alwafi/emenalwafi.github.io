import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
  selector: 'ms-assign-program-director-dialog',
  templateUrl: './assign-program-director-dialog.component.html',
  styleUrls: ['./assign-program-director-dialog.component.scss'],
})
export class AssignProgramDirectorDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  listProgramDirector = ['director 1', 'director 2', 'director 3'];
  collectAllUsers = [];
  isWaitingForResponse = false;
  assignProgramDirectorForm: UntypedFormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AssignProgramDirectorDialogComponent>,
    private translate: TranslateService,
    private intakeChannelService: IntakeChannelService,
  ) {}

  ngOnInit(): void {
    console.log('ini parentData Assign Program');
    console.log(this.parentData);
    this.initForm();
    this.getAllUsers();
  }

  initForm() {
    this.assignProgramDirectorForm = this.fb.group({
      programDirector: [null, Validators.required],
    });
  }

  submit() {
    if (this.checkFormValidity()) {
      return;
    }
    const intake_channel_ids = this.parentData?.intake.map((list) => list._id);
    const program_director_id = this.assignProgramDirectorForm.get('programDirector').value;
    const filter = this.parentData?.filter;
    const select_all = this.parentData?.select_all;
    this.isWaitingForResponse = true;
    this.subs.sink = this.intakeChannelService
      .AssignProgramDirectorToManyPrograms(intake_channel_ids, program_director_id, filter, select_all)
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
            this.dialogRef.close(true);
          });
        },
        (err) => {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }

  checkFormValidity() {
    if (this.assignProgramDirectorForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
      this.assignProgramDirectorForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  selectProgramDirector(item: string) {
    console.log('ini item select Program Director');
    console.log(item);
  }
  getAllUsers() {
    this.isWaitingForResponse = true;
    const intake_channel = this.parentData?.intake.map((list) => list._id);
    this.subs.sink = this.intakeChannelService.GetAllUserAdmissionWithIntake(intake_channel).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          resp.forEach((items) => {
            items?.entities?.forEach((item) => {
              if (item?.type?.name === 'Academic Director') {
                const filterAcademicDirector = {
                  _id: items._id,
                  first_name: items.first_name,
                  last_name: items.last_name,
                  civility: items.civility,
                };
                this.collectAllUsers.push(filterAcademicDirector);
              }
            });
          });
          if (this.collectAllUsers?.length) {
            this.collectAllUsers = this.collectAllUsers.sort((a, b) =>
              a?.last_name > b?.last_name ? 1 : b?.last_name > a?.last_name ? -1 : 0,
            );
          }
          if (this.parentData?.intake?.length === 1) {
            this.assignProgramDirectorForm.get('programDirector').setValue(this.parentData?.intake[0]?.program_director_id?._id);
          } else {
            if (this.parentData?.intake?.length > 1) {
              const programUnix = _.uniqBy(this.parentData?.intake, 'program_director_id');
              if (programUnix?.length === 1) {
                this.assignProgramDirectorForm.get('programDirector').setValue(programUnix[0]?.program_director_id?._id);
              }
            }
          }
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
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
