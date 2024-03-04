import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { TaskService } from 'app/service/task/task.service';
import * as _ from 'lodash';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FinancesService } from 'app/service/finance/finance.service';
import Swal from 'sweetalert2';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-assign-rate-dialog',
  templateUrl: './assign-rate-dialog.component.html',
  styleUrls: ['./assign-rate-dialog.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class AssignRateProfileDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  assignProfilRateForm: UntypedFormGroup;
  isTitleTrue = false;
  testData;
  studentCount;
  noUsers = false;
  backupTestData;
  specializationId: string;
  blockConditionId: string;
  correctorName = '';

  userTypes = [];
  userCorrectorList = [];
  userList = [];

  memberAssigned = [];

  isGroupTest = false;

  isWaitingForResponse = false;
  isWaitingForUserList = true;
  isMultipleSelected = false;
  isSingleSelected = true;
  dataMemberAssigned = [];
  totalCandidate: any;
  singleCandidate: any;
  candidateAssignedMember = [];
  intakeChannel = '';
  nationality = '';
  lengthIntakeChannel;
  lengthNationality;
  rateProfilList = [];
  correctorAssigned = [];

  isSendReadmission = false;

  isSameData = false;
  registrationProfileTypeList = [
    {
      name: 'Internal',
      value: 'internal',
    },
    {
      name: 'External',
      value: 'external',
    },
  ];

  showVolumeofHour = false;

  constructor(
    public dialogRef: MatDialogRef<AssignRateProfileDialogComponent>,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private candidateService: CandidatesService,
    private financeService: FinancesService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    console.log('Candidate Selected is => ', this.data.selected);
    console.log('Candidate Selected from => ', this.data.from);

    if (this.data && this.data.selected) {
      console.log(this.data);
      const found = this.data.selected.find((res) => res.isVolumeOfHours);
      if (found || this.data.isVolumeOfHours) {
        if (this.data.selected.find((res) => res.type_of_formation_id._id !== '61892e7367e6e4135fe90271')) {
          this.showVolumeofHour = true;
        } else {
          this.showVolumeofHour = false;
        }
      }
    }

    this.initForm();
    this.getProfileRates();
    this.getDataCandidate();
    this.validateIntakeChannelNationality();

    // set validation for Volume of hours
    if (this.showVolumeofHour) {
      this.assignProfilRateForm.get('volume_hour').setValidators([Validators.required, Validators.min(0), Validators.pattern('^[0-9]+$')]);
      this.assignProfilRateForm.get('volume_hour').updateValueAndValidity();
    } else {
      this.assignProfilRateForm.get('volume_hour').setValue(null);
      this.assignProfilRateForm.get('volume_hour').clearValidators();
      this.assignProfilRateForm.get('volume_hour').updateValueAndValidity();
    }
  }

  getProfileRates() {
    this.rateProfilList = [];
    const dataSchool = this.data.selected.filter((list) => list.school && list.school._id).map((list) => list.school._id);
    const dataCampus = this.data.selected.filter((list) => list.campus && list.campus._id).map((list) => list.campus._id);
    const dataLevel = this.data.selected.filter((list) => list.level && list.level._id).map((list) => list.level._id);
    const dataSector = this.data.selected.filter((list) => list.sector && list.sector._id).map((list) => list.sector._id);
    const dataSpeciality = this.data.selected.filter((list) => list.speciality && list.speciality._id).map((list) => list.speciality._id);
    const dataTypeOfFormation = this.data.selected
      .filter((list) => list.type_of_formation_id && list.type_of_formation_id._id)
      .map((list) => list.type_of_formation_id._id);
    const scholar = this.data.selected
      .filter((list) => list.intake_channel && list.intake_channel.scholar_season_id && list.intake_channel.scholar_season_id._id)
      .map((list) => list.intake_channel.scholar_season_id._id);
    const filter = {
      school_ids: _.uniqBy(dataSchool),
      campus_ids: _.uniqBy(dataCampus),
      level_ids: _.uniqBy(dataLevel),
      scholar_season_ids: _.uniqBy(scholar),
      sector_ids: _.uniqBy(dataSector),
      speciality_ids: _.uniqBy(dataSpeciality),
      type_of_formation_ids: _.uniqBy(dataTypeOfFormation),
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.GetListProfileRates(filter).subscribe(
      (list) => {
        if (list && list.length) {
          const response = _.cloneDeep(list);
          if (this.data.from === 'readmission') {
            this.rateProfilList = response.filter((lists) => lists.is_readmission);
          } else {
            this.rateProfilList = response.filter((lists) => lists.is_admission);
          }
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err);
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

  getProfileName(id) {
    let name = '';
    if (id && this.rateProfilList && this.rateProfilList.length) {
      const profile = this.rateProfilList.find((resp) => resp._id === id);
      name = profile ? profile.name : '';
    }
    return name;
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  initForm() {
    this.assignProfilRateForm = this.fb.group({
      profile_rate: [null, Validators.required],
      registration_profile_type: [null, Validators.required],
      volume_hour: [null, Validators.required],
      isVolumeOfHours: [false],
    });
  }

  getDataCandidate() {
    this.totalCandidate = this.data.selected.length;
    if (this.data.selected.length > 1) {
      this.isMultipleSelected = true;
      this.isSingleSelected = false;
    } else {
      this.isMultipleSelected = false;
      this.isSingleSelected = true;
      this.singleCandidate = this.data.selected[0];
      this.intakeChannel = this.singleCandidate.intake_channel;
      this.nationality = this.singleCandidate.nationality;
    }
  }

  checkFormValidity(): boolean {
    if (this.assignProfilRateForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.assignProfilRateForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  submitAssignMember() {
    if (this.data.from === 'crm') {
      this.submitAssignMemberCRM();
      console.log('_from', this.data.from);
      console.log('FORM', this.assignProfilRateForm.value);
    } else if (this.data.from === 'readmission') {
      this.SubmitAssignMemberReadmission();
    }
  }

  SubmitAssignMemberReadmission() {
    if (this.checkFormValidity()) {
      return;
    }
    this.data.selected = _.uniqBy(this.data.selected, '_id');
    let candidateList = [];
    candidateList = this.data.selected.map((cand) => {
      return cand._id;
    });
    let candidateName = '';
    for (const entity of this.data.selected) {
      candidateName +=
        (entity && entity.civility && entity.civility !== 'neutral' ? this.translate.instant(entity.civility) + ' ' : '') +
        entity.first_name +
        ' ' +
        entity.last_name +
        '<br>';
    }
    const result = this.assignProfilRateForm.value;
    // volume_hour need parse to float before assign to payload
    result.volume_hour = parseFloat(result.volume_hour);
    this.isWaitingForResponse = true;
    console.log('_test', result);
    const payload = {
      candidates_id: candidateList,
      profil_rate: result.profile_rate,
      registration_profile_type: result.registration_profile_type,
      volume_hour: result.volume_hour,
    };
    if (payload && payload.volume_hour) {
      this.subs.sink = this.candidateService.AssignProfilRateToManyCandidateForReadmission(null, payload).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('CANDIDAT_S5.TITLE'),
              html: this.translate.instant('CANDIDAT_S5.TEXT', {
                candidate:
                  this.data.selected && this.data.selected.length > 1
                    ? this.translate.instant('the candidates')
                    : this.translate.instant('the candidate'),
                canidateName: candidateName,
              }),
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('CANDIDAT_S5.BUTTON'),
            }).then(() => {
              if (this.isSendReadmission) {
                const response = {
                  send: true,
                  candidate: this.data.selected,
                };
                this.dialogRef.close(response);
              } else {
                const response = {
                  send: false,
                };
                this.dialogRef.close(response);
              }
            });
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err);
          if (err['message'] === 'GraphQL error: This program does not have Down Payment and Full Rate yet.') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('Oscar_S7.TITLE'),
              html: this.translate.instant('Oscar_S7.TEXT'),
              confirmButtonText: this.translate.instant('Oscar_S7.BUTTON'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              // this.dialogRef.close('select type All');
            });
          } else if (err['message'] === 'GraphQL error: Down Payment / Full Rate not found') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('Profile_S1.Title'),
              text: this.translate.instant('Profile_S1.Text'),
              confirmButtonText: this.translate.instant('Profile_S1.Button'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
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
    } else {
      this.subs.sink = this.candidateService.AssignProfilRateToManyCandidateForReadmission(payload, null).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('CANDIDAT_S5.TITLE'),
              html: this.translate.instant('CANDIDAT_S5.TEXT', {
                candidate:
                  this.data.selected && this.data.selected.length > 1
                    ? this.translate.instant('the candidates')
                    : this.translate.instant('the candidate'),
                canidateName: candidateName,
              }),
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('CANDIDAT_S5.BUTTON'),
            }).then(() => {
              if (this.isSendReadmission) {
                const response = {
                  send: true,
                  candidate: this.data.selected,
                };
                this.dialogRef.close(response);
              } else {
                const response = {
                  send: false,
                };
                this.dialogRef.close(response);
              }
            });
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err);
          if (err['message'] === 'GraphQL error: This program does not have Down Payment and Full Rate yet.') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('Oscar_S7.TITLE'),
              html: this.translate.instant('Oscar_S7.TEXT'),
              confirmButtonText: this.translate.instant('Oscar_S7.BUTTON'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              // this.dialogRef.close('select type All');
            });
          } else if (err['message'] === 'GraphQL error: Down Payment / Full Rate not found') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('Profile_S1.Title'),
              text: this.translate.instant('Profile_S1.Text'),
              confirmButtonText: this.translate.instant('Profile_S1.Button'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
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

  submitAssignMemberCRM() {
    if (this.checkFormValidity()) {
      return;
    }
    this.data.selected = _.uniqBy(this.data.selected, '_id');
    let candidateList = [];
    candidateList = this.data.selected.map((cand) => {
      return cand._id;
    });
    let candidateName = '';
    for (const entity of this.data.selected) {
      candidateName +=
        (entity && entity.civility && entity.civility !== 'neutral' ? this.translate.instant(entity.civility) + ' ' : '') +
        entity.first_name +
        ' ' +
        entity.last_name +
        '<br>';
    }
    const result = this.assignProfilRateForm.value;
    // volume_hour need parse to float before assign to payload
    result.volume_hour = parseFloat(result.volume_hour);
    this.isWaitingForResponse = true;
    console.log(result);
    this.subs.sink = this.candidateService
      .AssignProfilRateToManyCandidate(candidateList, result.profile_rate, result.registration_profile_type, result.volume_hour)
      .subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('CANDIDAT_S5.TITLE'),
              html: this.translate.instant('CANDIDAT_S5.TEXT', {
                candidate:
                  this.data.selected && this.data.selected.length > 1
                    ? this.translate.instant('the candidates')
                    : this.translate.instant('the candidate'),
                canidateName: candidateName,
              }),
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('CANDIDAT_S5.BUTTON'),
            }).then(() => {
              this.dialogRef.close('reset');
            });
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err);
          if (err['message'] === 'GraphQL error: This program does not have Down Payment and Full Rate yet.') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('Oscar_S7.TITLE'),
              html: this.translate.instant('Oscar_S7.TEXT'),
              confirmButtonText: this.translate.instant('Oscar_S7.BUTTON'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              // this.dialogRef.close('select type All');
            });
          } else if (err['message'] === 'GraphQL error: Down Payment / Full Rate not found') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('Profile_S1.Title'),
              text: this.translate.instant('Profile_S1.Text'),
              confirmButtonText: this.translate.instant('Profile_S1.Button'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
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

  validateIntakeChannelNationality() {
    this.isSameData = false;
    if (this.data.selected.length > 1) {
      const intake = _.uniqBy(this.data.selected, 'intake_channel.scholar_season_id._id');
      const nationality = _.uniqBy(this.data.selected, 'nationality');
      const candidate = this.data.selected;
      console.log('Validate ', intake, nationality, candidate);
      if (intake.length === 1) {
        this.isSameData = false;
      } else {
        this.isSameData = true;
      }

      if (intake.length === 1) {
        this.lengthIntakeChannel = intake;
        this.intakeChannel = intake[0].intake_channel;
      }
      if (nationality.length === 1) {
        this.lengthNationality = nationality;
        this.nationality = nationality[0].nationality;
      }
    }
  }

  triggerAnnouncment() {
    let candidateList = [];
    let candidates = '';
    const listCandidate = this.data.selected.filter((can) => {
      return can.announcement_email === 'not_sent';
    });
    if (listCandidate && listCandidate.length) {
      if (listCandidate.length > 1) {
        candidateList = listCandidate.map((cand) => {
          return cand._id;
        });
        for (const entity of listCandidate) {
          candidates = candidates
            ? candidates +
              ', ' +
              (entity
                ? entity.civility !== 'neutral'
                  ? this.translate.instant(entity.civility) + ' ' + entity.first_name + ' ' + entity.last_name
                  : entity.first_name + ' ' + entity.last_name
                : '')
            : entity
            ? entity.civility !== 'neutral'
              ? this.translate.instant(entity.civility) + ' ' + entity.first_name + ' ' + entity.last_name
              : entity.first_name + ' ' + entity.last_name
            : '';
        }
      } else {
        candidateList.push(this.singleCandidate._id);
        candidates =
          (this.singleCandidate && this.singleCandidate.civility && this.singleCandidate.civility !== 'neutral'
            ? this.translate.instant(this.singleCandidate.civility) + ' '
            : '') +
          this.singleCandidate.first_name +
          ' ' +
          this.singleCandidate.last_name;
      }
      const result = this.assignProfilRateForm.value;
      this.isWaitingForResponse = true;
      this.subs.sink = this.candidateService
        .AssignProfilRateToManyCandidate(candidateList, result.correctors_id, result.registration_profile_type)
        .subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            if (resp) {
              this.subs.sink = this.candidateService.SendNotifN1(candidateList).subscribe((ressp) => {
                console.log(ressp);
                this.dialogRef.close('reset');
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('CANDIDAT_S2.TITLE'),
                  html: this.translate.instant('CANDIDAT_S2.TEXT', {
                    candidateName: candidates,
                  }),
                  allowOutsideClick: false,
                  confirmButtonText: this.translate.instant('CANDIDAT_S2.BUTTON'),
                });
              });
            }
          },
          (err) => {
            this.authService.postErrorLog(err);
            this.isWaitingForResponse = false;
            this.authService.postErrorLog(err);
            if (err['message'] === 'GraphQL error: Down Payment / Full Rate not found') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('Profile_S1.Title'),
                text: this.translate.instant('Profile_S1.Text'),
                confirmButtonText: this.translate.instant('Profile_S1.Button'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
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

  isAllAnnouncementIsSent() {
    let validate = false;
    const listCandidate = this.data.selected.filter((can) => {
      return can.announcement_email === 'not_sent';
    });
    if (listCandidate && listCandidate.length) {
      validate = true;
    }
    return validate;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  onSelectSend(event: MatCheckboxChange) {
    if (event.checked) {
      this.isSendReadmission = true;
    } else {
      this.isSendReadmission = false;
    }
  }
}
