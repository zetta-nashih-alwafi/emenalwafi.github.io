import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserManagementService } from 'app/user-management/user-management.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';

@Component({
  selector: 'ms-add-program-dialog',
  templateUrl: './add-program-dialog.component.html',
  styleUrls: ['./add-program-dialog.component.scss'],
})
export class AddProgramDialogComponent implements OnInit {
  addProgramForm: UntypedFormGroup;
  private subs = new SubSink();

  campusList = [];
  levelList = [];
  sectorList = [];
  specializationList = [];

  isWaitingForResponse = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddProgramDialogComponent>,
    private intakeChannelService: IntakeChannelService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.getAllFillterDropdown();
    if (this.parentData) {
      this.initForm();
    }
  }

  initForm() {
    this.addProgramForm = this.fb.group({
      school_id: [this.parentData.school._id, Validators.required],
      scholar_season_id: [this.parentData.scholarSeason._id, Validators.required],
      campuses: [null, Validators.required],
      levels: [null, Validators.required],
      sectors: [null, Validators.required],
      specialities: [null],
    });
  }

  getAllFillterDropdown() {
    this.getAllCampusDropdown();
    this.getAllLevelDropdown();
    this.getAllSectorsDropdown();
    this.getAllSpecializationDropdown();
  }

  getAllCampusDropdown() {
    this.subs.sink = this.intakeChannelService.getAllCampusesDropdown().subscribe(
      (res) => {
        if (res && res.length > 0) {
          console.log('campus', res);
          this.campusList = res;
        }
      },
      (err) => {
        this.swalError(err);
      },
    );
  }

  getAllLevelDropdown() {
    this.subs.sink = this.intakeChannelService.getAllLevelsDropdown().subscribe(
      (res) => {
        if (res && res.length > 0) {
          console.log('level', res);
          this.levelList = res;
        }
      },
      (err) => {
        this.swalError(err);
      },
    );
  }

  getAllSectorsDropdown() {
    this.subs.sink = this.intakeChannelService.getSectorDropdown().subscribe(
      (res) => {
        if (res && res.length > 0) {
          console.log('sector', res);
          this.sectorList = res;
        }
      },
      (err) => {
        this.swalError(err);
      },
    );
  }

  getAllSpecializationDropdown() {
    this.subs.sink = this.intakeChannelService.getAllSpecializationsDropdown().subscribe(
      (res) => {
        if (res && res.length > 0) {
          console.log('spec', res);
          this.specializationList = res;
        }
      },
      (err) => {
        this.swalError(err);
      },
    );
  }

  swalError(err) {
    if (err['message'].includes('GraphQL error: program_exist:')) {
      let program = err['message'].replaceAll('GraphQL error: program_exist:', '');
      Swal.fire({
        title: this.translate.instant('SCHOOL_S2.TITLE'),
        text: this.translate.instant('SCHOOL_S2.TEXT', {
          program: program,
        }),
        type: 'info',
        showConfirmButton: true,
        confirmButtonText: this.translate.instant('SCHOOL_S2.BUTTON1'),
      }).then(() => (this.isWaitingForResponse = false));
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
  }

  closeDialog() {
    this.dialogRef.close();
  }

  submit() {
    if (this.addProgramForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.addProgramForm.markAllAsTouched();
      return;
    }
    const payload = this.createPayload();
    this.isWaitingForResponse = true;
    this.subs.sink = this.intakeChannelService.AssignProgramToSchool(payload).subscribe(
      (res) => {
        if (res) {
          Swal.fire({
            type: 'success',
            title: 'Bravo!',
            confirmButtonText: 'OK',
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.isWaitingForResponse = false;
            this.dialogRef.close(true);
          });
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.swalError(err);
      },
    );
  }

  createPayload() {
    const payload = this.addProgramForm.value;
    return payload;
  }
}
