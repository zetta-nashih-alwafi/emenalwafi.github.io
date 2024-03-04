import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { removeSpaces } from 'app/service/customvalidator.validator';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-remove-registration-profile-dialog',
  templateUrl: './remove-registration-profile-dialog.component.html',
  styleUrls: ['./remove-registration-profile-dialog.component.scss'],
})
export class RemoveRegistrationProfileDialogComponent implements OnInit {
  connectRegisForm: UntypedFormGroup;
  isWaitingForResponse = false;
  regisList: any;
  private subs = new SubSink();
  payload: any = [];
  dataProgram = [];
  regisValue: any[][] = [];
  allSelected = false;
  regData: any;
  allProgramToRegistrationProfile = [];
  remainingProgramToRegistrationProfile = [];
  payloadProgramToRegistrationProfile = [];

  constructor(
    public dialogRef: MatDialogRef<RemoveRegistrationProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private intakeService: IntakeChannelService,
    private authService:AuthService
  ) {}

  ngOnInit() {
    this.initConnectForm();
    this.getAllProfilRates();
    console.log(this.data);
    this.dataProgram = this.data.regisList;
    this.mapValue();
  }

  mapValue() {
    let program
    if (this.data && this.data.data) {
      program = this.data.data.map((list) => {
        return {
          profil_rate_id: list.profil_rate && list.profil_rate.length > 0 ? list.profil_rate.map((resp) => resp._id) : null,
          ...list,
        };
      });
    }
    if (this.dataProgram) {
      this.dataProgram = this.dataProgram.map((list) => {
        return {
          name: list.name,
          _id: list._id,
          programs: [],
        };
      });
      this.dataProgram.forEach((reg, indxReg) => {
        this.regisValue.push([]);
        program.forEach((prog, indxProg) => {
          if (prog.profil_rate_id && prog.profil_rate_id.includes(reg._id)) {
            this.dataProgram[indxReg].programs.push(prog);
            this.regisValue[indxReg].push(prog._id);
          }
        });
      });
      this.payload = this.dataProgram.map((list) => {
        return {
          profile_rate_id: list._id,
          programs: list.programs.map((resp) => resp._id),
        };
      });
    }
  }

  whereFrom(data) {
    let dataList = [];
    this.dataProgram.forEach((element) => {
      if (element._id === data._id) {
        dataList = element.programs;
      }
    });
    return dataList;
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
    this.isWaitingForResponse = true;
    const filter = {scholar_season_id: this.data.data[0].scholar_season_id};
    this.subs.sink = this.intakeService.GetAllRegistrationProfile(filter).subscribe(
      (resp) => {
        if (resp && resp.length && this.data && this.data.data.length && this.data.data[0].scholar_season_id) {
          this.regisList = resp;
          this.regData = resp.map((list) => {
            return {
              profile_rate_id: list._id,
              // profil_rate: list,
              programs: list.programs && list.programs.length > 0 ? list.programs.map((pro) => pro._id) : [],
            };
          });
          this.allProgramToRegistrationProfile = this.regisList.map((list) => {
            // Filtering program to get only school and scholar season
            const programs =
              list.scholar_season_programs && list.scholar_season_programs.length > 0
                ? list.scholar_season_programs.map((prog) => {
                    if (
                      prog &&
                      prog.school_id &&
                      prog.scholar_season_id &&
                      prog.school_id._id === this.data.data[0].school_id &&
                      prog.scholar_season_id._id === this.data.data[0].scholar_season_id
                    ) {
                      return prog.programs.map((prog1) => prog1._id);
                    } else {
                      return [];
                    }
                  })
                : [];
            return {
              profile_rate_id: list._id,
              programs: _.uniqBy(programs.flat()),
            };
          });
        } else {
          this.regisList = [];
          this.regData = [];
          this.allProgramToRegistrationProfile = [];
        }
        this.payloadProgramToRegistrationProfile = _.cloneDeep(this.allProgramToRegistrationProfile);
        this.remainingProgramToRegistrationProfile = _.cloneDeep(this.allProgramToRegistrationProfile);
        console.log('this.allProgramToRegistrationProfile', this.allProgramToRegistrationProfile);
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

  selectAll(idx, item) {
    this.allSelected = true;
    if (this.regisValue && this.regisValue[idx] && this.regisValue[idx].length > 0) {
      this.regisValue[idx] = ['All'];
    }
    const indx = this.payloadProgramToRegistrationProfile.findIndex(
      (list) => list && list.profile_rate_id && list.profile_rate_id === item._id,
    );
    this.payloadProgramToRegistrationProfile[indx].programs = this.regisValue[idx].includes('All') ? [] : this.regisValue[idx];
    console.log('_regdata', this.payloadProgramToRegistrationProfile, this.payload);
  }

  selectSingle(idx, item) {
    this.allSelected = false;
    if (this.regisValue && this.regisValue[idx] && this.regisValue[idx].length > 0) {
      this.regisValue[idx] = this.regisValue[idx].filter((list) => list !== 'All');
    }
    const indx = this.payloadProgramToRegistrationProfile.findIndex(
      (list) => list && list.profile_rate_id && list.profile_rate_id === item._id,
    );
    this.payloadProgramToRegistrationProfile[indx].programs = this.regisValue[idx].includes('All') ? [] : this.regisValue[idx];
    console.log('_regdata', this.payloadProgramToRegistrationProfile, this.payload);
  }

  validate() {
    this.isWaitingForResponse = true;
    this.allProgramToRegistrationProfile.forEach((element, idx) => {
      if (element && element.programs && element.programs.length) {
        const dataProfil = this.payload.find((list) => list.profile_rate_id === element.profile_rate_id);
        if (dataProfil && dataProfil.profile_rate_id) {
          element.programs.forEach((prog) => {
            if (!dataProfil.programs.includes(prog)) {
              this.payloadProgramToRegistrationProfile[idx].programs.push(prog);
            }
          });
        }
        this.payloadProgramToRegistrationProfile[idx].programs = _.uniqBy(this.payloadProgramToRegistrationProfile[idx].programs);
      }
    });
    console.log('this.payload', this.payloadProgramToRegistrationProfile);
    this.subs.sink = this.intakeService
      .AssignProgramToProfileRates(
        this.data.data[0].scholar_season_id,
        this.data.data[0].school_id,
        this.payloadProgramToRegistrationProfile,
      )
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
