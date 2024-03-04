import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { IntakeChannelService } from '../../../../../service/intake-channel/intake-channel.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-connect-registration-profile-dialog',
  templateUrl: './connect-registration-profile-dialog.component.html',
  styleUrls: ['./connect-registration-profile-dialog.component.scss'],
})
export class ConnectRegistrationProfileDialogComponent implements OnInit {
  connectRegisForm: UntypedFormGroup;
  isWaitingForResponse = false;
  regisList: any;
  private subs = new SubSink();
  payload: any = [];
  payloadFromEdit: any = [];
  regisValue: any[][] = [];
  regisSelectedValue: any[][] = [];
  allSelected: any = [];
  listProgramNotSelected = [];

  constructor(
    public dialogRef: MatDialogRef<ConnectRegistrationProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private intakeService: IntakeChannelService,
    private authService:AuthService
  ) {}

  ngOnInit() {
    this.initConnectForm();
    this.getAllProfilRates();
  }

  initConnectForm() {
    this.connectRegisForm = this.fb.group({
      profil_rate: ['', Validators.required],
    });
  }

  closeDialog() {
    this.payload = [];
    this.dialogRef.close();
  }

  getAllProfilRates() {
    this.regisSelectedValue = [];
    this.regisValue = [];
    this.isWaitingForResponse = true;
    const filter = {scholar_season_id: this.data[0].scholar_season_id};
    this.subs.sink = this.intakeService.GetAllRegistrationProfile(filter).subscribe(
      (resp) => {
        this.regisList = resp;
        this.regisList.forEach((e, idx) => {
          this.regisValue.push([]);
          this.allSelected.push(false)
        });

        this.payloadFromEdit = this.regisList.map((list) => {
          // Filtering program to get only school and scholar season
          const programs =
            list.scholar_season_programs && list.scholar_season_programs.length > 0
              ? list.scholar_season_programs.map((prog) => {
                  if (
                    prog &&
                    prog.scholar_season_id &&
                    prog.scholar_season_id._id === this.data[0].scholar_season_id &&
                    prog.school_id &&
                    prog.school_id._id === this.data[0].school_id
                  ) {
                    return prog.programs.map((prog1) => prog1._id);
                  } else {
                    return [];
                  }
                })
              : [];
          return {
            profile_rate_id: list._id,
            // profil_rate: list,
            programs: programs.flat(),
          };
        });

        const listSelectedProgram = this.data.map((res) => res && res._id);

        this.payloadFromEdit.forEach((edit, idxe) => {
          if (edit.programs && edit.programs.length > 0) {
            edit.programs.forEach((prog, idxprog) => {
              if (listSelectedProgram.includes(prog)) {
                // this.regisValue[idxe].push(prog);
              }
            });
          }
        });

        this.regisSelectedValue = this.payloadFromEdit;
        console.log('_before', this.payloadFromEdit, this.regisValue);

        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err)
        if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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

  setItem(event, item, idx) {
    if (this.allSelected[idx]) {
      if (!event.includes('All')) {
        this.allSelected[idx] = false;
        this.regisValue[idx] = [];
      }
    }
    if (event && event.length > 0 && !this.allSelected[idx]) {
      if (this.payload.some((e) => e.profile_rate_id === item._id)) {
        this.payload = this.payload.filter((e) => e.profile_rate_id !== item._id);
      }
      let filtered = [];
      if (this.regisValue && this.regisValue[idx] && this.regisValue[idx].length > 0) {
        this.regisValue[idx] = this.regisValue[idx].filter((res) => res !== 'All');
        filtered = this.regisValue[idx];
      }
      if (event.length > 0) {
        this.payload.push({
          profile_rate_id: item._id,
          programs: filtered,
        });
      }
    }

    if (event && event.length > 0 && this.allSelected[idx]) {
      const allProgram = this.data.map((res) => res._id);

      if (this.payload.some((e) => e.profile_rate_id === item._id)) {
        this.payload = this.payload.filter((e) => e.profile_rate_id !== item._id);
      }

      if (this.regisValue && this.regisValue[idx] && this.regisValue[idx].length > 0) {
        this.regisValue[idx] = ['All', ...allProgram];
      }

      if (event.length > 0) {
        this.payload.push({
          profile_rate_id: item._id,
          programs: allProgram,
        });
      }
    }

    if (event && event.length === 0 && !this.allSelected[idx]) {
      if (this.payload.some((e) => e.profile_rate_id === item._id)) {
        this.payload = this.payload.filter((e) => e.profile_rate_id !== item._id);
      }

      this.payload.push({
        profile_rate_id: item._id,
        programs: [],
      });
    }
    console.log('_pay', this.payload);
  }

  selectAll(index) {
    this.allSelected[index] = !this.allSelected[index];
  }

  selectSingle(index) {
    this.allSelected[index] = false;
  }

  payloadEdit() {
    const payloadEdit = _.cloneDeep(this.payloadFromEdit);
    const newPayload = _.cloneDeep(this.payload);

    // console.log('_pay 1', payloadEdit);
    // console.log('_pay 2', newPayload);

    // make payload before also save new payload
    if (payloadEdit && payloadEdit.length > 0) {
      payloadEdit.forEach((pay1, idx) => {
        newPayload.forEach((pay2, idx2) => {
          if (pay1.profile_rate_id === pay2.profile_rate_id) {
            pay1.programs = pay1.programs.concat(pay2.programs);
            pay1.programs = _.uniqBy(pay1.programs);
            // console.log('_test 1', pay1.programs);
            // console.log('_test 2', pay2.programs);
          }
        });
      });
    }

    // update payload to latest
    this.payload = payloadEdit;
  }

  validate() {
    this.payloadEdit();
    this.isWaitingForResponse = true;
    this.subs.sink = this.intakeService
      .AssignProgramToProfileRates(this.data[0].scholar_season_id, this.data[0].school_id, this.payload)
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
          this.authService.postErrorLog(err)
          if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
              confirmButtonText: this.translate.instant('OK'),
            }).then(() => {
              this.dialogRef.close(true);
            });
          }
        },
      );
  }
}
