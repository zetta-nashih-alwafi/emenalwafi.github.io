import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import swal from 'sweetalert2';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { FinancesService } from 'app/service/finance/finance.service';
import Swal from 'sweetalert2';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'ms-transfer-admission-member-dialog',
  templateUrl: './transfer-admission-member-dialog.component.html',
  styleUrls: ['./transfer-admission-member-dialog.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class TransferAdmissionDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  assignCampusForm: UntypedFormGroup;
  isTitleTrue = false;
  testData;
  studentCount;
  noUsers = false;
  backupTestData;
  specializationId: string;
  blockConditionId: string;
  correctorName = '';
  isUserAdmissionMember = false;

  private intVal;
  private timeOutVal;
  userTypes = [];
  devMemberList = [];
  devLeaderList = [];
  userCorrectorList = [];
  userList = [];

  memberAssigned = [];

  isGroupTest = false;

  isContinous = false;
  isWaitingForResponse = false;
  isWaitingForUserList = true;
  isMultipleSelected = false;
  isSingleSelected = true;
  dataMemberAssigned = [];
  totalCandidate: any;
  singleCandidate: any;
  candidateAssignedMember = [];
  campusList = [];
  currentUser: any;
  isSameData = false;
  listCampusTransfer = [];
  selectedCampus: any;
  selectedCfm = '';

  assignProgramForm: UntypedFormGroup;
  filterFormCtrl: UntypedFormGroup;
  scholarList: any[] = [];
  filteredScholar: Observable<any[]>;
  schoolList: any[] = [];
  filteredSchool: Observable<any[]>;
  campusesList: any[] = [];
  filteredCampus: Observable<any[]>;
  levelList: any[] = [];
  filteredLevel: Observable<any[]>;
  sectorList: any[] = [];
  filteredSector: Observable<any[]>;
  specialityList: any[] = [];
  filteredSpeciality: Observable<any[]>;
  formationList: any[] = [];
  filteredFormation: Observable<any[]>;
  memberList: any[] = [];
  filteredMember: Observable<any[]>;

  selectedScholar: any;
  selectedSchool: any;
  selectedLevel: any;
  selectedSector: any;
  selectedCampuses: any;
  selectedSpeciality: any;
  selectedFormation: any;
  selectedMember: any;
  isPermission: string[];
  currentUserTypeId: any;
  listContinousManager = [];
  filteredManager: Observable<any[]>;
  isDisplayNone = false;

  isOPERATORAdmin;

  constructor(
    public dialogRef: MatDialogRef<TransferAdmissionDialogComponent>,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private candidateService: CandidatesService,
    public userService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private admissionEntrypointService: AdmissionEntrypointService,
    private financeService: FinancesService,
    private permissions: NgxPermissionsService,
  ) {}

  ngOnInit() {
    this.isOPERATORAdmin = !!this.permissions.getPermission('operator_admin');
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.isUserAdmissionMember = this.permissions.getPermission('Admission Member') ? true : false;
    // console.log('Candidate Selected is => ', this.data.data);
    this.singleCandidate = this.data.data[0];
    // this.initForm();
    // this.getDataCampus();
    this.initProgramForm();
    this.initFilterForm();
    this.getScholarSeason();
  }

  initForm() {
    this.assignCampusForm = this.fb.group({
      campus: ['', Validators.required],
    });
  }

  // getDataCandidate() {
  //   console.log('this.singleCandidate', this.singleCandidate);
  //   if (this.singleCandidate && this.singleCandidate.campus) {
  //     this.listCampusTransfer = this.campusList.filter((resp) => {
  //       return resp.campus.toLowerCase() !== this.singleCandidate.campus.toLowerCase();
  //     });
  //   }
  // }

  checkFormValidity(): boolean {
    if (this.filterFormCtrl.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.filterFormCtrl.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  submitAssignMember() {
    if (this.isContinous && !this.assignProgramForm.get('continuous_formation_manager_id').value) {
      this.filterFormCtrl.get('continuous_formation_manager_id').setValidators(Validators.required);
      this.filterFormCtrl.get('continuous_formation_manager_id').updateValueAndValidity();
      this.checkFormValidity();
    } else {
      this.filterFormCtrl.get('continuous_formation_manager_id').clearValidators();
      this.filterFormCtrl.get('continuous_formation_manager_id').updateValueAndValidity();
      if (this.checkFormValidity()) {
        return;
      }
      const result = _.cloneDeep(this.assignProgramForm.value);
      // console.log('data', result, this.data);
      const isSameProgram = false;
      if (
        this.data &&
        this.data.data &&
        this.data.data.length &&
        (this.data.from === 'admission' || this.data.from === 'readmission' || this.data.from === 'readmission-transfer')
      ) {
        const candidate = {
          school: this.data.data[0] && this.data.data[0].school && this.data.data[0].school._id ? this.data.data[0].school._id : null,
          campus: this.data.data[0] && this.data.data[0].campus && this.data.data[0].campus._id ? this.data.data[0].campus._id : null,
          level: this.data.data[0] && this.data.data[0].level && this.data.data[0].level._id ? this.data.data[0].level._id : null,
          sector: this.data.data[0] && this.data.data[0].sector && this.data.data[0].sector._id ? this.data.data[0].sector._id : null,
          speciality:
            this.data.data[0] && this.data.data[0].speciality && this.data.data[0].speciality._id ? this.data.data[0].speciality._id : null,
          scholar_season:
            this.data.data[0] && this.data.data[0].scholar_season && this.data.data[0].scholar_season._id
              ? this.data.data[0].scholar_season._id
              : null,
        };
        if (
          candidate.school === result.school &&
          result.campus === candidate.campus &&
          result.level === candidate.level &&
          result.sector === candidate.sector &&
          result.scholar_season === candidate.scholar_season &&
          result.speciality === candidate.speciality
        ) {
          // *********** This function to handle if user trasnfer to same program (currently we disable this function so dont remove it)
          // isSameProgram = true;
        }
      }
      if (isSameProgram) {
        swal
          .fire({
            type: 'info',
            title: this.translate.instant('TransferSameProgram.Title'),
            html: this.translate.instant('TransferSameProgram.Text'),
            allowOutsideClick: false,
            confirmButtonText: this.translate.instant('TransferSameProgram.Button'),
          })
          .then((confirm) => {
            this.isWaitingForResponse = false;
          });
      }
      if (
        result.speciality === null ||
        result.speciality === '' ||
        this.selectedSpeciality === null ||
        this.selectedSpeciality === undefined
      ) {
        delete result.speciality;
      }
      // console.log('payload', result);
      const selectedProgram = {
        scholar: this.selectedScholar.scholar_season,
        school: this.selectedSchool.short_name,
        campus: this.selectedCampuses.name,
        level: this.selectedLevel.name,
        sector: this.selectedSector.name,
        speciality: this.selectedSpeciality ? this.selectedSpeciality.name : this.translate.instant('None'),
        formation: this.translate.instant('type_formation.' + this.selectedFormation.type_of_formation),
        member: this.selectedMember.name,
        cfmName: this.selectedCfm,
      };
      this.isWaitingForResponse = true;
      let timeDisabled = 3;
      let found = false;
      if (this.data?.data?.length) {
        found = this.data.data.some((resp) => resp?.billing_id?.deposit_status === 'partially_paid');
      }
      if (found) {
        if (isSameProgram === false) {
          const prgramName = `${selectedProgram?.scholar} ${selectedProgram?.school?.slice(0, 3).toUpperCase()}${selectedProgram?.campus
            ?.slice(0, 3)
            .toUpperCase()} ${selectedProgram?.level} ${selectedProgram?.sector} ${
            selectedProgram?.speciality !== this.translate.instant('None') ? selectedProgram?.speciality : ''
          }`;
          swal
            .fire({
              type: 'warning',
              title: this.translate.instant('Transfer_Partialy_Paid_S1.TITLE'),
              html: this.translate.instant('Transfer_Partialy_Paid_S1.TEXT', {
                newProgram: prgramName,
              }),
              allowEscapeKey: true,
              showCancelButton: true,
              confirmButtonText: this.translate.instant('Transfer_Partialy_Paid_S1.BUTTON_1'),
              cancelButtonText: this.translate.instant('Transfer_Partialy_Paid_S1.BUTTON_2'),
              allowOutsideClick: false,
              allowEnterKey: false,
            })
            .then((resp) => {
              if (resp.value) {
                this.isWaitingForResponse = true;
                this.subs.sink = this.candidateService.TransferProgramOfCandidate(this.singleCandidate._id, result).subscribe(
                  (response) => {
                    this.isWaitingForResponse = false;
                    if (response) {
                      this.isWaitingForResponse = false;
                      swal
                        .fire({
                          type: 'success',
                          title: this.translate.instant('CANDIDAT_S8.TITLE'),
                          allowOutsideClick: false,
                          confirmButtonText: this.translate.instant('CANDIDAT_S8.BUTTON'),
                        })
                        .then(() => {
                          this.dialogRef.close('reset');
                        });
                    }
                  },
                  (err) => {
                    this.isWaitingForResponse = false;
                    this.userService.postErrorLog(err);
                    if (err['message'] === 'GraphQL error: Legal Entity not found!') {
                      swal
                        .fire({
                          type: 'info',
                          title: this.translate.instant('OSCAR_S3.TITLE'),
                          text: this.translate.instant('OSCAR_S3.TEXT'),
                          confirmButtonText: this.translate.instant('OSCAR_S3.BUTTON'),
                          allowEnterKey: false,
                          allowEscapeKey: false,
                          allowOutsideClick: false,
                        })
                        .then(() => {
                          this.dialogRef.close('reset');
                        });
                    } else if (err['message'] === 'GraphQL error: Program not found!') {
                      swal
                        .fire({
                          type: 'info',
                          title: this.translate.instant('Oscar_S5.TITLE'),
                          text: this.translate.instant('Oscar_S5.TEXT'),
                          confirmButtonText: this.translate.instant('Oscar_S5.BUTTON'),
                          allowEnterKey: false,
                          allowEscapeKey: false,
                          allowOutsideClick: false,
                        })
                        .then(() => {
                          this.dialogRef.close('reset');
                        });
                    } else if (err['message'] === 'GraphQL error: cannot assign the same program with the current program') {
                      swal
                        .fire({
                          type: 'info',
                          title: this.translate.instant('TransferSameProgram.Title'),
                          html: this.translate.instant('TransferSameProgram.Text'),
                          confirmButtonText: this.translate.instant('TransferSameProgram.Button'),
                          allowEnterKey: false,
                          allowEscapeKey: false,
                          allowOutsideClick: false,
                        })
                        .then(() => {
                          this.dialogRef.close('reset');
                        });
                    } else if (err['message'] === 'GraphQL error: There is term that already paid') {
                      swal
                        .fire({
                          type: 'info',
                          title: this.translate.instant('VALIDATION_BILLING_S2.TITLE'),
                          text: this.translate.instant('VALIDATION_BILLING_S2.TEXT'),
                          confirmButtonText: this.translate.instant('VALIDATION_BILLING_S2.BUTTON'),
                          allowEnterKey: false,
                          allowEscapeKey: false,
                          allowOutsideClick: false,
                        })
                        .then(() => {
                          this.dialogRef.close('reset');
                        });
                    } else if (err['message'] === 'GraphQL error: There is term still pending') {
                      swal
                        .fire({
                          type: 'info',
                          title: this.translate.instant('PAY_SUM_S3.Title'),
                          text: this.translate.instant('PAY_SUM_S3.Text'),
                          confirmButtonText: this.translate.instant('PAY_SUM_S3.Button'),
                          allowEnterKey: false,
                          allowEscapeKey: false,
                          allowOutsideClick: false,
                        })
                        .then(() => {
                          this.dialogRef.close('reset');
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
                      swal
                        .fire({
                          type: 'info',
                          title: this.translate.instant('SORRY'),
                          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                          confirmButtonText: this.translate.instant('OK'),
                        })
                        .then(() => {
                          this.dialogRef.close('reset');
                        });
                    }
                  },
                );
              } else {
                this.isWaitingForResponse = false;
              }
            });
        }
      } else {
        if (isSameProgram === false) {
          swal
            .fire({
              type: 'question',
              title: this.translate.instant('TRANSFER_S2.Title'),
              html: this.translate.instant('TRANSFER_S2.Text', {
                scholarName: selectedProgram.scholar,
                schoolName: selectedProgram.school,
                campusName: selectedProgram.campus,
                levelName: selectedProgram.level,
                sectorName: selectedProgram.sector,
                specialityName: selectedProgram.speciality,
                formationName: selectedProgram.formation,
                devMember: selectedProgram.member,
                cfmName: selectedProgram.cfmName,
              }),
              allowEscapeKey: true,
              showCancelButton: true,
              confirmButtonText: this.translate.instant('TRANSFER_S2.Button 1', { timer: timeDisabled }),
              cancelButtonText: this.translate.instant('TRANSFER_S2.Button 2'),
              allowOutsideClick: false,
              allowEnterKey: false,
              onOpen: () => {
                swal.disableConfirmButton();
                const confirmBtnRef = swal.getConfirmButton();
                this.intVal = setInterval(() => {
                  timeDisabled -= 1;
                  confirmBtnRef.innerText = this.translate.instant('TRANSFER_S2.Button 1') + ` (${timeDisabled})`;
                }, 1000);

                this.timeOutVal = setTimeout(() => {
                  confirmBtnRef.innerText = this.translate.instant('TRANSFER_S2.Button 1');
                  swal.enableConfirmButton();
                  clearInterval(this.intVal);
                  clearTimeout(this.timeOutVal);
                }, timeDisabled * 1000);
              },
            })
            .then((resp) => {
              clearTimeout(this.timeOutVal);
              this.isWaitingForResponse = false;
              if (resp.value) {
                this.isWaitingForResponse = true;
                this.subs.sink = this.candidateService.TransferProgramOfCandidate(this.singleCandidate._id, result).subscribe(
                  (response) => {
                    this.isWaitingForResponse = false;
                    if (response) {
                      this.isWaitingForResponse = false;
                      swal
                        .fire({
                          type: 'success',
                          title: this.translate.instant('CANDIDAT_S8.TITLE'),
                          allowOutsideClick: false,
                          confirmButtonText: this.translate.instant('CANDIDAT_S8.BUTTON'),
                        })
                        .then(() => {
                          this.dialogRef.close('reset');
                        });
                    }
                  },
                  (err) => {
                    this.isWaitingForResponse = false;
                    this.userService.postErrorLog(err);
                    if (err['message'] === 'GraphQL error: Legal Entity not found!') {
                      swal
                        .fire({
                          type: 'info',
                          title: this.translate.instant('OSCAR_S3.TITLE'),
                          text: this.translate.instant('OSCAR_S3.TEXT'),
                          confirmButtonText: this.translate.instant('OSCAR_S3.BUTTON'),
                          allowEnterKey: false,
                          allowEscapeKey: false,
                          allowOutsideClick: false,
                        })
                        .then(() => {
                          this.dialogRef.close('reset');
                        });
                    } else if (err['message'] === 'GraphQL error: Program not found!') {
                      swal
                        .fire({
                          type: 'info',
                          title: this.translate.instant('Oscar_S5.TITLE'),
                          text: this.translate.instant('Oscar_S5.TEXT'),
                          confirmButtonText: this.translate.instant('Oscar_S5.BUTTON'),
                          allowEnterKey: false,
                          allowEscapeKey: false,
                          allowOutsideClick: false,
                        })
                        .then(() => {
                          this.dialogRef.close('reset');
                        });
                    } else if (err['message'] === 'GraphQL error: cannot assign the same program with the current program') {
                      swal
                        .fire({
                          type: 'info',
                          title: this.translate.instant('TransferSameProgram.Title'),
                          html: this.translate.instant('TransferSameProgram.Text'),
                          confirmButtonText: this.translate.instant('TransferSameProgram.Button'),
                          allowEnterKey: false,
                          allowEscapeKey: false,
                          allowOutsideClick: false,
                        })
                        .then(() => {
                          this.dialogRef.close('reset');
                        });
                    } else if (err['message'] === 'GraphQL error: There is term that already paid') {
                      swal
                        .fire({
                          type: 'info',
                          title: this.translate.instant('VALIDATION_BILLING_S2.TITLE'),
                          text: this.translate.instant('VALIDATION_BILLING_S2.TEXT'),
                          confirmButtonText: this.translate.instant('VALIDATION_BILLING_S2.BUTTON'),
                          allowEnterKey: false,
                          allowEscapeKey: false,
                          allowOutsideClick: false,
                        })
                        .then(() => {
                          this.dialogRef.close('reset');
                        });
                    } else if (err['message'] === 'GraphQL error: There is term still pending') {
                      swal
                        .fire({
                          type: 'info',
                          title: this.translate.instant('PAY_SUM_S3.Title'),
                          text: this.translate.instant('PAY_SUM_S3.Text'),
                          confirmButtonText: this.translate.instant('PAY_SUM_S3.Button'),
                          allowEnterKey: false,
                          allowEscapeKey: false,
                          allowOutsideClick: false,
                        })
                        .then(() => {
                          this.dialogRef.close('reset');
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
                      swal
                        .fire({
                          type: 'info',
                          title: this.translate.instant('SORRY'),
                          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                          confirmButtonText: this.translate.instant('OK'),
                        })
                        .then(() => {
                          this.dialogRef.close('reset');
                        });
                    }
                  },
                );
              } else {
                this.isWaitingForResponse = false;
              }
            });
        }
      }
    }
  }

  selectCampus(data: MatSelectChange) {
    const selectedMember = data.value;
    this.selectedCampus = this.campusList.find((res) => res._id === selectedMember);
    this.subs.sink = this.candidateService.GetDevLeader(this.selectedCampus.name).subscribe(
      (resp) => {
        this.devLeaderList = resp;
      },
      (err) => {
        this.userService.postErrorLog(err);
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
    this.subs.sink = this.candidateService.GetDevMember(this.selectedCampus.name).subscribe(
      (resp) => {
        this.devMemberList = resp;
      },
      (err) => {
        this.userService.postErrorLog(err);
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

  messageAfterSelect() {
    let message = '';
    message += this.translate.instant('Single Candidates Selected', {
      candidateName: this.correctorName,
    });
    return message;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getMessage(data) {
    let message = '';
    const devMember = this.campusList.filter((resp) => {
      return resp.campus === data;
    });
    let memberLeader = '';
    if (this.devLeaderList && this.devLeaderList.length) {
      memberLeader =
        (this.devLeaderList[0].civility !== 'neutral' ? this.translate.instant(this.devLeaderList[0].civility) + ' ' : '') +
        this.devLeaderList[0].first_name +
        ' ' +
        this.devLeaderList[0].last_name;
      message += this.translate.instant('CANDIDATE_POPUP_3.Where Will be', {
        candidateName:
          (this.singleCandidate.civility !== 'neutral' ? this.translate.instant(this.singleCandidate.civility) + ' ' : '') +
          this.singleCandidate.first_name +
          ' ' +
          this.singleCandidate.last_name +
          ' ',
      });
    }
    if (this.singleCandidate.civility === 'MR') {
      message += this.translate.instant('CANDIDATE_POPUP_3.transferred');
    } else {
      message += this.translate.instant('CANDIDATE_POPUP_3.transferreed');
    }
    message += this.translate.instant('CANDIDATE_POPUP_3.devLeader', {
      devLeader: memberLeader,
    });

    return message;
  }

  getDataCampus() {
    if (this.singleCandidate) {
      // console.log('masuk');
      const filter = {
        scholar_season_id:
          this.singleCandidate.scholar_season && this.singleCandidate.scholar_season._id ? this.singleCandidate.scholar_season._id : '',
        school_id: this.singleCandidate.school ? this.singleCandidate.school._id : '',
      };
      this.subs.sink = this.candidateService.getAllCandidateCampus(filter, true).subscribe(
        (res) => {
          // console.log('_res', res);
          if (res) {
            this.campusList = res;
            this.listCampusTransfer = res;
            // this.getDataCandidate();
          }
        },
        (err) => {
          this.userService.postErrorLog(err);
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
  }

  initProgramForm() {
    this.assignProgramForm = this.fb.group({
      scholar_season: ['', Validators.required],
      school: ['', Validators.required],
      campus: ['', Validators.required],
      level: ['', Validators.required],
      sector: ['', Validators.required],
      type_of_formation_id: ['', Validators.required],
      continuous_formation_manager_id: [null],
      speciality: [''],
      dev_member: ['', Validators.required],
    });
  }

  initFilterForm() {
    this.filterFormCtrl = this.fb.group({
      scholarSeason: ['', Validators.required],
      school: ['', Validators.required],
      campus: ['', Validators.required],
      level: ['', Validators.required],
      sector: ['', Validators.required],
      type_of_formation_id: ['', Validators.required],
      continuous_formation_manager_id: [null],
      speciality: [''],
      devMember: ['', Validators.required],
    });
  }

  getScholarSeason() {
    this.isWaitingForResponse = true;
    const filter = {
      is_published: true,
    };
    this.subs.sink = this.candidateService.getAllScholarSeasons(filter).subscribe(
      (res) => {
        // console.log('_schol', res);
        if (res) {
          const scholarSeasonParentData = this.data?.data[0]?.scholar_season?.scholar_season ? this.data?.data[0]?.scholar_season?.scholar_season : '';
          const filteredData = res?.filter((item) => {
            if(item) {
              const itemSeason = item?.scholar_season;
              return itemSeason >= scholarSeasonParentData;
            }
          });
          if (this.isOPERATORAdmin) {
            this.scholarList = _.cloneDeep(res);
          } else {
            this.scholarList = filteredData
          }
          this.isWaitingForResponse = false;
          this.initFilter();
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
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
          swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  initFilter() {
    this.filteredScholar = this.filterFormCtrl.controls['scholarSeason'].valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.scholarList.filter((scholar) =>
          scholar ? scholar.scholar_season.toLowerCase().includes(searchText.toString().toLowerCase()) : true,
        ),
      ),
    );

    this.filteredSchool = this.filterFormCtrl.controls['school'].valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.schoolList.filter((school) =>
          school ? school.short_name.toLowerCase().includes(searchText ? searchText?.toLowerCase() : '') : true,
        ),
      ),
    );

    this.filteredCampus = this.filterFormCtrl.controls['campus'].valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.campusesList.filter((campus) =>
          campus ? campus.name.toLowerCase().includes(searchText ? searchText?.toLowerCase() : '') : true,
        ),
      ),
    );

    this.filteredLevel = this.filterFormCtrl.controls['level'].valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        searchText
          ? this.levelList
              .filter((level) => (level ? level.name.toLowerCase().includes(searchText.toString().toLowerCase()) : true))
              .sort((a: any, b: any) => a.name - b.name)
          : this.levelList.sort((a: any, b: any) => a.name - b.name),
      ),
    );

    this.filteredSector = this.filterFormCtrl.controls['sector'].valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.sectorList.filter((sector) =>
          sector ? sector.name.toLowerCase().includes(searchText ? searchText?.toLowerCase() : '') : true,
        ),
      ),
    );

    this.filteredSpeciality = this.filterFormCtrl.controls['speciality'].valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.specialityList.filter((speciality) =>
          speciality ? speciality.name.toLowerCase().includes(searchText ? searchText?.toLowerCase() : '') : true,
        ),
      ),
    );

    this.filteredFormation = this.filterFormCtrl.controls['type_of_formation_id'].valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.formationList.filter((formation) =>
          formation
            ? this.translate
                .instant('type_formation.' + formation.type_of_information)
                .toLowerCase()
                .includes(searchText ? searchText?.toLowerCase() : '')
            : true,
        ),
      ),
    );

    this.filteredMember = this.filterFormCtrl.controls['devMember'].valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.memberList.filter((devMember) =>
          devMember ? devMember.name.toLowerCase().includes(searchText ? searchText?.toLowerCase() : '') : true,
        ),
      ),
    );
  }

  getUserTypeIdList() {
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type : [];
    const userTypeIdList = [];
    if (userTypesList) {
      const operator_dir = userTypesList.filter((user) => user.name === 'operator_dir');
      if (operator_dir?.length) {
        userTypeIdList.push(operator_dir[0]?._id);
      } else {
        const operator_admin = userTypesList.filter((user) => user.name === 'operator_admin');
        if (operator_admin?.length) {
          userTypeIdList.push(operator_admin[0]?._id);
        } else {
          userTypesList.forEach((user) => {
            if (
              user.name === 'Admission Director' ||
              user.name === 'Admission Member' ||
              user.name === 'Academic Director' ||
              user.name === 'Continuous formation manager'
            ) {
              userTypeIdList.push(user._id);
            }
          });
        }
      }
      // userTypesList.forEach(user => {
      //   if (
      //     user.name === 'operator_dir' ||
      //     user.name === 'operator_admin' ||
      //     user.name === 'Admission Director' ||
      //     user.name === 'Admission Member' ||
      //     user.name === 'Academic Director' ||
      //     user.name === 'Continuous formation manager'
      //   ) {
      //     userTypeIdList.push(user._id);
      //   }
      // });
    }
    return userTypeIdList;
  }

  getSchoolDropdown(data) {
    // console.log('scholar id', data);
    this.isWaitingForResponse = true;
    this.isDisplayNone = false;
    this.schoolList = [];
    this.campusesList = [];
    this.levelList = [];
    this.sectorList = [];
    this.specialityList = [];
    this.memberList = [];
    this.formationList = [];
    this.listContinousManager = [];
    this.isContinous = false;
    this.assignProgramForm.controls['school'].patchValue('');
    this.assignProgramForm.controls['campus'].patchValue('');
    this.assignProgramForm.controls['level'].patchValue('');
    this.assignProgramForm.controls['sector'].patchValue('');
    this.assignProgramForm.controls['speciality'].patchValue('');
    this.assignProgramForm.controls['type_of_formation_id'].patchValue('');
    this.assignProgramForm.controls['continuous_formation_manager_id'].patchValue('');
    // this.assignProgramForm.controls['dev_member'].patchValue('');
    this.filterFormCtrl.controls['school'].patchValue('');
    this.filterFormCtrl.controls['campus'].patchValue('');
    this.filterFormCtrl.controls['level'].patchValue('');
    this.filterFormCtrl.controls['sector'].patchValue('');
    this.filterFormCtrl.controls['speciality'].patchValue('');
    this.filterFormCtrl.controls['type_of_formation_id'].patchValue('');
    this.filterFormCtrl.controls['continuous_formation_manager_id'].patchValue('');
    // this.filterFormCtrl.controls['devMember'].patchValue('');

    if (!this.isUserAdmissionMember) {
      this.memberList = [];
      this.assignProgramForm.controls['dev_member'].patchValue('');
      this.filterFormCtrl.controls['devMember'].patchValue('');
    }

    const userTypeList = this.getUserTypeIdList();

    this.selectedScholar = this.scholarList.find((res) => res._id === data);
    this.assignProgramForm.controls['scholar_season'].patchValue(data);
    const filter = 'filter: { scholar_season_id:' + `"${data}"` + '}';
    console.log(filter);
    this.subs.sink = this.candidateService.GetAllSchoolFilter(data, filter, userTypeList, true, true).subscribe(
      (res) => {
        // console.log('_school', res);
        if (res) {
          this.schoolList = res;
          this.initFilter();
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
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

  getCampusDropdown(data) {
    // console.log('school id', data);
    this.isWaitingForResponse = true;
    this.isDisplayNone = false;
    this.campusesList = [];
    this.levelList = [];
    this.sectorList = [];
    this.specialityList = [];
    this.memberList = [];
    this.listContinousManager = [];
    this.formationList = [];
    this.isContinous = false;
    this.assignProgramForm.controls['campus'].patchValue('');
    this.assignProgramForm.controls['level'].patchValue('');
    this.assignProgramForm.controls['sector'].patchValue('');
    this.assignProgramForm.controls['speciality'].patchValue('');
    this.assignProgramForm.controls['type_of_formation_id'].patchValue('');
    this.assignProgramForm.controls['continuous_formation_manager_id'].patchValue('');
    this.filterFormCtrl.controls['campus'].patchValue('');
    this.filterFormCtrl.controls['level'].patchValue('');
    this.filterFormCtrl.controls['sector'].patchValue('');
    this.filterFormCtrl.controls['speciality'].patchValue('');
    this.filterFormCtrl.controls['type_of_formation_id'].patchValue('');
    this.filterFormCtrl.controls['continuous_formation_manager_id'].patchValue('');
    // this.filterFormCtrl.controls['devMember'].patchValue('');

    if (!this.isUserAdmissionMember) {
      this.memberList = [];
      this.assignProgramForm.controls['dev_member'].patchValue('');
      this.filterFormCtrl.controls['devMember'].patchValue('');
    }

    const userTypeList = this.getUserTypeIdList();

    this.selectedSchool = this.schoolList.find((res) => res._id === data);
    this.assignProgramForm.controls['school'].patchValue(data);
    const filter = {
      scholar_season_id: this.selectedScholar._id,
      school_id: data,
    };
    this.subs.sink = this.candidateService.GetAllCampuses(filter, userTypeList, true, true).subscribe(
      (res) => {
        // console.log('_campuses', res);
        if (res) {
          this.campusesList = res;
          this.initFilter();
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
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

  getLevelDropdown(data) {
    // console.log('campus id', data);
    this.isWaitingForResponse = true;
    this.isDisplayNone = false;
    this.levelList = [];
    this.sectorList = [];
    this.specialityList = [];
    this.memberList = [];
    this.formationList = [];
    this.listContinousManager = [];
    this.isContinous = false;
    this.assignProgramForm.controls['level'].patchValue('');
    this.assignProgramForm.controls['sector'].patchValue('');
    this.assignProgramForm.controls['speciality'].patchValue('');
    this.assignProgramForm.controls['type_of_formation_id'].patchValue('');
    this.assignProgramForm.controls['continuous_formation_manager_id'].patchValue('');
    // this.assignProgramForm.controls['dev_member'].patchValue('');
    this.filterFormCtrl.controls['level'].patchValue('');
    this.filterFormCtrl.controls['sector'].patchValue('');
    this.filterFormCtrl.controls['speciality'].patchValue('');
    this.filterFormCtrl.controls['type_of_formation_id'].patchValue('');
    this.filterFormCtrl.controls['continuous_formation_manager_id'].patchValue('');
    // this.filterFormCtrl.controls['devMember'].patchValue('');

    if (!this.isUserAdmissionMember) {
      this.memberList = [];
      this.assignProgramForm.controls['dev_member'].patchValue('');
      this.filterFormCtrl.controls['devMember'].patchValue('');
    }

    const userTypeList = this.getUserTypeIdList();

    this.selectedCampuses = this.campusesList.find((res) => res._id === data);
    this.assignProgramForm.controls['campus'].patchValue(data);
    // const level = this.campusList.filter((campus) => campus && campus._id === data ? campus : false);
    // this.levelList = level[0].levels;
    const filter = {
      scholar_season_id: this.selectedScholar._id,
      school_id: this.selectedSchool._id,
      campus_id: data,
    };
    this.subs.sink = this.candidateService.GetAllLevels(filter, userTypeList, true, true).subscribe(
      (res) => {
        // console.log('_levels', res);
        if (res) {
          this.levelList = res;
          this.initFilter();
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
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

  getSectorDropdown(data) {
    // console.log('level id', data);
    this.isWaitingForResponse = true;
    this.isDisplayNone = false;
    this.sectorList = [];
    this.specialityList = [];
    this.memberList = [];
    this.formationList = [];
    this.listContinousManager = [];
    this.isContinous = false;
    this.assignProgramForm.controls['sector'].patchValue('');
    this.assignProgramForm.controls['speciality'].patchValue('');
    this.assignProgramForm.controls['type_of_formation_id'].patchValue('');
    this.assignProgramForm.controls['continuous_formation_manager_id'].patchValue('');
    // this.assignProgramForm.controls['dev_member'].patchValue('');
    this.filterFormCtrl.controls['sector'].patchValue('');
    this.filterFormCtrl.controls['speciality'].patchValue('');
    this.filterFormCtrl.controls['type_of_formation_id'].patchValue('');
    this.filterFormCtrl.controls['continuous_formation_manager_id'].patchValue('');
    // this.filterFormCtrl.controls['devMember'].patchValue('');

    if (!this.isUserAdmissionMember) {
      this.memberList = [];
      this.assignProgramForm.controls['dev_member'].patchValue('');
      this.filterFormCtrl.controls['devMember'].patchValue('');
    }

    this.selectedLevel = this.levelList.find((res) => res._id === data);
    this.assignProgramForm.controls['level'].patchValue(data);
    const filter = {
      scholar_season_id: this.selectedScholar._id,
      candidate_school_ids: [this.selectedSchool._id],
      campuses: [this.selectedCampuses._id],
      levels: [data],
    };
    // console.log(filter);
    this.subs.sink = this.financeService.GetAllSectorsDropdown(filter).subscribe(
      (res) => {
        // console.log('_sector', res);
        if (res) {
          this.sectorList = res;
          this.initFilter();
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
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

  getSpecialityDropdown(data) {
    // console.log('sector id', data);
    this.isWaitingForResponse = true;
    this.specialityList = [];
    this.memberList = [];
    this.formationList = [];
    this.formationList = [];
    this.listContinousManager = [];
    this.isContinous = false;
    this.assignProgramForm.controls['type_of_formation_id'].patchValue('');
    this.assignProgramForm.controls['speciality'].patchValue('');
    this.assignProgramForm.controls['continuous_formation_manager_id'].patchValue('');
    // this.assignProgramForm.controls['dev_member'].patchValue('');
    this.filterFormCtrl.controls['speciality'].patchValue('');
    // this.filterFormCtrl.controls['devMember'].patchValue('');
    this.filterFormCtrl.controls['type_of_formation_id'].patchValue('');
    this.filterFormCtrl.controls['continuous_formation_manager_id'].patchValue('');

    if (!this.isUserAdmissionMember) {
      this.memberList = [];
      this.assignProgramForm.controls['dev_member'].patchValue('');
      this.filterFormCtrl.controls['devMember'].patchValue('');
    }

    this.selectedSector = this.sectorList.find((res) => res._id === data);
    this.assignProgramForm.controls['sector'].patchValue(data);
    const filter = {
      scholar_season_id: this.selectedScholar._id,
      school_id: [this.selectedSchool._id],
      campus: [this.selectedCampuses._id],
      level: [this.selectedLevel._id],
      sector: [data],
    };
    this.subs.sink = this.candidateService.getAllProgramsToGetSpeciality(filter).subscribe(
      (res) => {
        const programsData = _.cloneDeep(res);
        const noneSpeciality = programsData.find((list) => !list?.speciality_id?._id);
        const listSpeciality = [];
        programsData.forEach((element) => {
          if (element?.speciality_id?._id) {
            listSpeciality.push(element?.speciality_id);
          }
        });
        console.log('_speciality', res, noneSpeciality, listSpeciality);
        if (noneSpeciality) {
          this.isDisplayNone = true;
        } else {
          this.isDisplayNone = false;
        }
        if (listSpeciality && listSpeciality?.length) {
          this.specialityList = listSpeciality;
          this.initFilter();
          this.isWaitingForResponse = false;
        } else {
          this.getTypeFormationDropdown(null);
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
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

  getTypeFormationDropdown(data?) {
    // console.log('typeFormation id', data);
    this.isWaitingForResponse = true;

    if (data) {
      if (data !== 'none') {
        this.selectedSpeciality = this.specialityList.find((res) => res._id === data);
        this.assignProgramForm.controls['speciality'].patchValue(data);
      } else {
        this.selectedSpeciality = null;
        this.assignProgramForm.controls['speciality'].patchValue(null);
      }
    }
    this.subs.sink = this.admissionEntrypointService.getAllTypeOfInformationByScholar(this.selectedScholar._id).subscribe(
      (res) => {
        if (res) {
          this.formationList = res.filter((type) => type.type_of_formation);

          this.initFilter();
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
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

  displayWithType(value) {
    if (value) {
      const found = this.formationList.find((data) => data.type_of_formation.toLowerCase().trim().includes(value));
      if (found) {
        return this.translate.instant('type_formation.' + found.type_of_formation);
      } else {
        return value;
      }
    } else {
      return value;
    }
  }
  getDevMemberDropdown(data?, type?) {
    // TODO : Fetch real data when there is api to get dev member
    // console.log('FORMATION id', data);

    if (type !== 'classic') {
      this.isContinous = true;
    } else {
      this.isContinous = false;
      this.selectedCfm = '';
    }

    this.isWaitingForResponse = true;
    this.memberList = [];

    this.assignProgramForm.get('continuous_formation_manager_id').setValue(null);
    this.filterFormCtrl.get('continuous_formation_manager_id').setValue(null);
    // this.assignProgramForm.controls['dev_member'].patchValue('');
    // this.filterFormCtrl.controls['devMember'].patchValue('');

    if (!this.isUserAdmissionMember) {
      this.assignProgramForm.controls['dev_member'].patchValue('');
      this.filterFormCtrl.controls['devMember'].patchValue('');
    }
    if (data !== 'none') {
      this.selectedFormation = this.formationList.find((res) => res._id === data);
      this.assignProgramForm.controls['type_of_formation_id'].patchValue(data);
    } else {
      this.selectedFormation = null;
      this.assignProgramForm.controls['type_of_formation_id'].patchValue(null);
    }
    const candidateSchool = this.assignProgramForm.controls['school'].value;
    const candidateCampus = this.assignProgramForm.controls['campus'].value;
    const candidateLevel = this.assignProgramForm.controls['level'].value;
    if (this.data.from !== 'readmission-transfer') {
      this.subs.sink = this.candidateService.getDevMemberDropdown(candidateCampus, candidateSchool, candidateLevel).subscribe(
        (res) => {
          // console.log('_devMember', res);
          if (res) {
            const members = _.cloneDeep(res);
            members.forEach((member) => {
              if (member && member._id) {
                const obj = {
                  _id: member._id,
                  name:
                    (member.civility !== 'neutral' ? this.translate.instant(member.civility) + ' ' : '') +
                    member.last_name.toUpperCase() +
                    ' ' +
                    member.first_name,
                };
                this.memberList.push(obj);
              }
            });
            if (this.isUserAdmissionMember) {
              this.selectDevMember(this.currentUser._id);
            }
            // this.memberList = res;
            this.isWaitingForResponse = false;
            this.initFilter();
            this.getContinuousFormationManagerList(candidateCampus, candidateSchool, candidateLevel);
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.userService.postErrorLog(err);
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
    } else {
      // console.log(candidateCampus, candidateSchool, candidateLevel);
      this.subs.sink = this.candidateService.getAcadMemberDropdown(candidateCampus, candidateSchool, candidateLevel).subscribe(
        (res) => {
          // console.log('_devMember', res);
          if (res) {
            const members = _.cloneDeep(res);
            members.forEach((member) => {
              if (member && member._id) {
                const obj = {
                  _id: member._id,
                  name:
                    (member.civility !== 'neutral' ? this.translate.instant(member.civility) + ' ' : '') +
                    member.last_name.toUpperCase() +
                    ' ' +
                    member.first_name,
                };
                this.memberList.push(obj);
              }
            });
            if (this.isUserAdmissionMember) {
              this.selectDevMember(this.currentUser._id);
            }
            // this.memberList = res;
            this.isWaitingForResponse = false;
            this.initFilter();
            this.getContinuousFormationManagerList(candidateCampus, candidateSchool, candidateLevel);
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.userService.postErrorLog(err);
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
    // console.log('devMember list', this.memberList);
  }

  selectDevMember(data) {
    this.selectedMember = this.memberList.find((res) => res._id === data);
    console.log('_devMember id', data, this.selectedMember, this.memberList);
    if (this.selectedMember?._id) {
      this.assignProgramForm.get('dev_member').setValue(this.selectedMember?._id);
      this.filterFormCtrl.get('devMember').setValue(this.selectedMember?.name);
    }
  }

  getContinuousFormationManagerList(candidateCampus, candidateSchool, candidateLevel) {
    // query to get list of user with type continous formation manager
    const userType = ['61ceb560688f572138e023b2'];
    this.subs.sink = this.candidateService.getUserContinuousFormationManager(userType,candidateCampus, candidateSchool, candidateLevel).subscribe(
      (res) => {
        if (res) {
          this.listContinousManager = res;
          this.filteredManager = this.filterFormCtrl.get('continuous_formation_manager_id').valueChanges.pipe(
            startWith(''),
            map((searchText) =>
              this.listContinousManager.filter((data) =>
                data ? data.first_name.toLowerCase().includes(searchText ? searchText.toString().toLowerCase() : '') : true,
              ),
            ),
          );
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
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

  selectOptionContinousFormationManager(data) {
    this.assignProgramForm.get('continuous_formation_manager_id').setValue(data._id);
    // console.log('selectOptionContinousFormationManager', data, this.assignProgramForm.get('continuous_formation_manager_id').value);
    const name =
      (data.civility && data.civility === 'neutral' ? '' : this.translate.instant(data.civility)) +
      ' ' +
      data.first_name +
      ' ' +
      data.last_name;
    this.selectedCfm = name;
    this.filterFormCtrl.get('continuous_formation_manager_id').patchValue(name);
  }
}
