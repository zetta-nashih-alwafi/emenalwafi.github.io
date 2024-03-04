import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { TaskService } from 'app/service/task/task.service';
import * as _ from 'lodash';
import swal from 'sweetalert2';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-assign-member-fc-dialog',
  templateUrl: './assign-member-fc-dialog.component.html',
  styleUrls: ['./assign-member-fc-dialog.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class AssignMemberFcDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  assignMemberForm: UntypedFormGroup;
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
  filteredMember: Observable<any[]>;
  memberAssigned = [];

  isGroupTest = false;

  isWaitingForResponse = false;
  isWaitingForUserList = true;
  isMultipleSelected = false;
  isSingleSelected = true;
  dataMemberAssigned = [];
  dataCFAssigned = [];
  totalCandidate: any;
  singleCandidate: any;
  candidateAssignedMember = [];
  private intVal;
  private timeOutVal;

  isMemberAdmission = false;
  isContinousFormationManager = false;

  listContinousManager = [];
  continuousManagerFilter = new UntypedFormControl('');
  filteredManager: Observable<any[]>;
  selectedContinuousManager: any;

  isShowFC = true;
  schoolSelected: any;
  campusSelected: any;
  levelSelected: any;

  constructor(
    public dialogRef: MatDialogRef<AssignMemberFcDialogComponent>,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private candidateService: CandidatesService,
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // console.log('Candidate Selected is => ', this.parentData);
    if (
      this.parentData &&
      this.parentData.data &&
      this.parentData.data.length > 0 &&
      this.parentData.type &&
      this.parentData.type === 're-admission'
    ) {
      const found = this.parentData.data.find(
        (res) => res.type_of_formation_id && res.type_of_formation_id.type_of_formation === 'classic',
      );
      if (found) {
        this.isShowFC = false;
      }
    }
    this.initForm();
    this.getDataMember();
    this.getDataCandidate();
    this.hideDataCFFromCandidate();
    this.getContinuousFormationManagerList();
  }

  getSchoolCampusLevelId() {
    this.schoolSelected = [];
    this.campusSelected = [];
    this.levelSelected = [];

    if (this.parentData && this.parentData.data && this.parentData.data.length > 0) {
      this.parentData.data.forEach((element) => {
        if (element && element.school && element.school._id) {
          this.schoolSelected.push(element.school._id);
        }
        if (element && element.campus && element.campus._id) {
          this.campusSelected.push(element.campus._id);
        }
        if (element && element.level && element.level._id) {
          this.levelSelected.push(element.level._id);
        }
      });
    }
  }

  initForm() {
    this.assignMemberForm = this.fb.group({
      member_id: [''],
      memberFilterCtrl: [''],
      continous_formation_manager_id: [''],
    });
  }

  initFilter() {
    this.filteredMember = this.assignMemberForm.controls['memberFilterCtrl'].valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.userCorrectorList.filter((member) =>
          member ? member.first_name.toLowerCase().includes(searchText.toString().toLowerCase()) : true,
        ),
      ),
    );
  }

  getDataCandidate() {
    this.candidateAssignedMember = this.parentData.data.filter((list) => {
      return list.admission_member_id && list.admission_member_id._id;
    });
    if (this.candidateAssignedMember && this.candidateAssignedMember.length) {
      this.isTitleTrue = true;
    }
    this.totalCandidate = this.parentData.data.length;
    if (this.parentData.data.length > 1) {
      this.isMultipleSelected = true;
      this.isSingleSelected = false;
    } else {
      this.isMultipleSelected = false;
      this.isSingleSelected = true;
      this.singleCandidate = this.parentData.data[0];
    }
  }

  getDataMember() {
    this.hideDataMemberFromCandidate();
    this.isWaitingForResponse = true;
    if (this.parentData && this.parentData.type && this.parentData.type === 're-admission') {
      this.getSchoolCampusLevelId();

      this.subs.sink = this.candidateService
        .getAcademicMemberDropdown(this.campusSelected, this.schoolSelected, this.levelSelected)
        .subscribe(
          (resp) => {
            if (resp && resp.length > 0) {
              this.isWaitingForResponse = false;
              this.userList = resp;
              this.userCorrectorList = resp;
              this.userCorrectorList = this.userCorrectorList.filter((list) => {
                return !this.dataMemberAssigned.includes(list._id);
              });
              this.isNoMemberWithSimilarIntakeChannel();
              this.initFilter();
            } else if ((resp && resp.length === 0) || !resp) {
              this.isWaitingForResponse = false;
              Swal.fire({
                type: 'info',
                title: this.translate.instant('ReAdmission_S6.Title'),
                html: this.translate.instant('ReAdmission_S6.Text'),
                confirmButtonText: this.translate.instant('ReAdmission_S6.Button'),
              }).then(() => this.dialogRef.close());
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            this.userList = [];
            this.userCorrectorList = [];
            // Record error log
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
    } else {
      this.subs.sink = this.candidateService.getDevMemberDropdown('', '', '').subscribe(
        (resp) => {
          if (resp) {
            this.isWaitingForResponse = false;
            this.userList = resp;
            this.userCorrectorList = resp;
            this.userCorrectorList = this.userCorrectorList.filter((list) => {
              return !this.dataMemberAssigned.includes(list._id);
            });
            this.isNoMemberWithSimilarIntakeChannel();
            this.initFilter();
          } else {
            this.isWaitingForResponse = false;
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.userList = [];
          this.userCorrectorList = [];
          // Record error log
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
  }

  hideDataMemberFromCandidate() {
    if (this.parentData.data && this.parentData.data.length) {
      this.dataMemberAssigned = this.parentData.data.map((cand) => {
        return cand.admission_member_id ? cand.admission_member_id._id : '';
      });
    }
  }

  hideDataCFFromCandidate() {
    if (this.parentData.data && this.parentData.data.length) {
      this.dataCFAssigned = this.parentData.data.map((cand) => {
        return cand.continuous_formation_manager_id ? cand.continuous_formation_manager_id._id : '';
      });
    }
  }

  async checkFormValidity(): Promise<boolean> {
    // isWaitingForResponse || checkComparison() || identityForm.invalid
    if (this.assignMemberForm.invalid) {
      this.isWaitingForResponse = false;
      const action = await Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.assignMemberForm.markAllAsTouched();
      return false;
    } else {
      return true;
    }
  }

  submitAssignMember() {
    // console.log('_form', this.assignMemberForm.value);
    const isUpdateAdmission = this.isMemberAdmission ? (this.memberAssigned.length > 0 ? true : false) : false;
    const isUpdateManager = this.isContinousFormationManager ? (this.selectedContinuousManager ? true : false) : false;
    if (
      (!isUpdateAdmission && !isUpdateManager) ||
      (this.isMemberAdmission && this.memberAssigned.length === 0) ||
      (this.isContinousFormationManager && !this.selectedContinuousManager)
    ) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
    } else {
      let candidateList = [];
      candidateList = this.parentData.data.map((cand) => {
        return cand._id;
      });
      let memberName = '';
      if (this.parentData && this.parentData.type && this.parentData.type === 're-admission') {
        for (const entity of this.memberAssigned) {
          memberName +=
            (entity && entity.member && entity.member.civility && entity.member.civility !== 'neutral'
              ? this.translate.instant('USER_TYPES.Academic Member') + ': ' + this.translate.instant(entity.member.civility) + ' '
              : '') +
            entity.member.first_name +
            ' ' +
            entity.member.last_name;
        }
      } else {
        for (const entity of this.memberAssigned) {
          memberName +=
            (entity && entity.member && entity.member.civility && entity.member.civility !== 'neutral'
              ? this.translate.instant('Member of admission') + ': ' + this.translate.instant(entity.member.civility) + ' '
              : '') +
            entity.member.first_name +
            ' ' +
            entity.member.last_name;
        }
      }
      if (this.selectedContinuousManager) {
        if (this.memberAssigned.length > 0 && memberName) {
          memberName =
            memberName +
            ' and ' +
            this.translate.instant('Continuous Formation Manager') +
            ': ' +
            (this.selectedContinuousManager.civility !== 'neutral'
              ? this.translate.instant(this.selectedContinuousManager.civility) + ' '
              : '') +
            this.selectedContinuousManager.first_name +
            ' ' +
            this.selectedContinuousManager.last_name;
        } else {
          memberName =
            this.translate.instant('Continuous Formation Manager') +
            ': ' +
            (this.selectedContinuousManager.civility !== 'neutral'
              ? this.translate.instant(this.selectedContinuousManager.civility) + ' '
              : '') +
            this.selectedContinuousManager.first_name +
            ' ' +
            this.selectedContinuousManager.last_name;
        }
      }
      const result = [];
      const resultFormationManager = [];
      if (this.assignMemberForm.get('continous_formation_manager_id').value) {
        resultFormationManager.push(this.assignMemberForm.get('continous_formation_manager_id').value);
      }

      if (this.assignMemberForm.controls['member_id'].value) {
        result.push(this.assignMemberForm.controls['member_id'].value);
      }

      // console.log('result', result);
      this.isWaitingForResponse = true;
      let timeDisabled = 3;
      Swal.fire({
        type: 'question',
        title: this.translate.instant('TRANSFER_S1.Title'),
        html: this.translate.instant('TRANSFER_S1.Text', { memberName: memberName }),
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('TRANSFER_S1.Button 1', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('TRANSFER_S1.Button 2'),
        allowOutsideClick: false,
        allowEnterKey: false,
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          this.intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('TRANSFER_S1.Button 1') + ` (${timeDisabled})`;
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('TRANSFER_S1.Button 1');
            Swal.enableConfirmButton();
            clearInterval(this.intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      }).then((res) => {
        clearTimeout(this.timeOutVal);
        if (res.value) {
          this.subs.sink = this.candidateService
            .ChangeAdmissionMemberToManyCandidateFC(candidateList, result, resultFormationManager)
            .subscribe(
              (resp) => {
                if (resp) {
                  this.isWaitingForResponse = false;
                  swal
                    .fire({
                      type: 'success',
                      title: this.translate.instant('CANDIDAT_S6.TITLE'),
                      html: this.translate.instant('CANDIDAT_S6.TEXT', {
                        memberName: memberName,
                        them:
                          this.memberAssigned && this.memberAssigned.length > 1
                            ? this.translate.instant('thems')
                            : this.translate.instant('To inform with all the necessary information'),
                      }),
                      allowOutsideClick: false,
                      confirmButtonText: this.translate.instant('CANDIDAT_S6.BUTTON'),
                    })
                    .then(() => {
                      this.dialogRef.close('reset');
                    });
                } else {
                  this.isWaitingForResponse = false;
                }
              },
              (err) => {
                this.isWaitingForResponse = false;
                // Record error log
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
        } else {
          this.isWaitingForResponse = false;
        }
      });
    }
  }

  selectMember(data: MatSelectChange) {
    this.memberAssigned = [];
    const selectedMember = data.value;
    this.filterMember(selectedMember);
  }

  filterMember(data) {
    // console.log(data);
    if (data) {
      const selectedMember = data;
      const studentPerMember = Math.ceil(this.totalCandidate / selectedMember.length);
      let currentCandidate = this.totalCandidate;
      // console.log(this.memberAssigned);

      // selectedMember.forEach((correctorId) => {
      const correctorFound = _.find(this.userCorrectorList, (corrector) => corrector._id === selectedMember);
      this.memberAssigned.push({
        member: correctorFound,
        candidate: studentPerMember <= currentCandidate ? studentPerMember : currentCandidate,
      });
      currentCandidate -= studentPerMember <= currentCandidate ? studentPerMember : currentCandidate;
      // });

      const user = this.userList.filter((list) => {
        return list._id === selectedMember[0];
      });
      // console.log('user', user);
      this.correctorName =
        user && user[0]
          ? user[0].civility !== 'neutral'
            ? this.translate.instant(user[0].civility) + ' ' + user[0].first_name + ' ' + user[0].last_name
            : user[0].first_name + ' ' + user[0].last_name
          : '';
    }
  }

  messageAfterSelect() {
    let message = '';
    message += this.translate.instant('Single Candidates Selected', {
      candidateName: this.correctorName,
    });
    return message;
  }

  isNoMemberWithSimilarIntakeChannel() {
    let isSame = false;
    if (this.userCorrectorList.length < 1) {
      isSame = true;
    }
    return isSame;
  }

  selectDevMember(data) {
    // console.log('_devMember id', data);
    this.assignMemberForm.controls['member_id'].patchValue(data);
    this.memberAssigned = [];
    const selectedMember = data;
    this.filterMember(selectedMember);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSelectContinuousFormationManager(event) {
    event.preventDefault();
    this.isContinousFormationManager = !this.isContinousFormationManager;

    this.selectedContinuousManager = null;
    this.assignMemberForm.get('continous_formation_manager_id').setValue('');
    this.continuousManagerFilter.setValue('');
  }

  onSelectMemberAdmission(event) {
    event.preventDefault();
    this.isMemberAdmission = !this.isMemberAdmission;

    this.memberAssigned = [];
    this.assignMemberForm.get('member_id').setValue('');
    this.assignMemberForm.get('memberFilterCtrl').setValue('');
  }

  selectOptionContinousFormationManager(data) {
    // handle when user choose one of the option in list continous manager
    this.assignMemberForm.get('continous_formation_manager_id').patchValue(data._id);
    this.selectedContinuousManager = data;
    // console.log('_selected', this.selectedContinuousManager);
  }

  getContinuousFormationManagerList() {
    // query to get list of user with type continous formation manager
    const userType = ['61ceb560688f572138e023b2'];
    this.subs.sink = this.candidateService.getUserContinuousFormationManager(userType).subscribe(
      (res) => {
        if (res) {
          const cfmUser = _.cloneDeep(res);
          this.listContinousManager = cfmUser.filter((list) => !this.dataCFAssigned.includes(list._id));
          this.filteredManager = this.continuousManagerFilter.valueChanges.pipe(
            startWith(''),
            map((searchText) =>
              this.listContinousManager.filter((data) =>
                data ? data.first_name.toLowerCase().includes(searchText.toString().toLowerCase()) : true,
              ),
            ),
          );
        }
      },
      (err) => {
        this.listContinousManager = [];
        // Record error log
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

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
