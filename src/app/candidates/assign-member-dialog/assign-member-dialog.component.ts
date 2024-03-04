import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
  selector: 'ms-assign-member-dialog',
  templateUrl: './assign-member-dialog.component.html',
  styleUrls: ['./assign-member-dialog.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class AssignMemberDialogComponent implements OnInit, OnDestroy {
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
  totalCandidate: any;
  singleCandidate: any;
  candidateAssignedMember = [];
  private intVal;
  private timeOutVal;

  constructor(
    public dialogRef: MatDialogRef<AssignMemberDialogComponent>,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private candidateService: CandidatesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService:AuthService
  ) {}

  ngOnInit() {
    console.log('Candidate Selected is => ', this.data);
    this.initForm();
    this.getDataMember();
    this.getDataCandidate();
  }

  initForm() {
    this.assignMemberForm = this.fb.group({
      member_id: ['', Validators.required],
      memberFilterCtrl: ['', Validators.required],
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
    this.candidateAssignedMember = this.data.filter((list) => {
      return list.admission_member_id && list.admission_member_id._id;
    });
    if (this.candidateAssignedMember && this.candidateAssignedMember.length) {
      this.isTitleTrue = true;
    }
    this.totalCandidate = this.data.length;
    if (this.data.length > 1) {
      this.isMultipleSelected = true;
      this.isSingleSelected = false;
    } else {
      this.isMultipleSelected = false;
      this.isSingleSelected = true;
      this.singleCandidate = this.data[0];
    }
  }

  getDataMember() {
    this.hideDataMemberFromCandidate();
    this.isWaitingForResponse = true;
    this.subs.sink = this.candidateService.getDevMemberDropdown('', '', '').subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.userList = resp;
          this.userCorrectorList = resp;
          this.userCorrectorList = this.userCorrectorList.filter((list) => {
            return !this.dataMemberAssigned.includes(list._id);
          });
          this.isNoMemberWithSimilarIntakeChannel();
          this.initFilter();
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err)
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  hideDataMemberFromCandidate() {
    if (this.data && this.data.length) {
      this.dataMemberAssigned = this.data.map((cand) => {
        return cand.admission_member_id ? cand.admission_member_id._id : '';
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

  async submitAssignMember() {
    if (!(await this.checkFormValidity())) {
      return;
    }
    let candidateList = [];
    candidateList = this.data.map((cand) => {
      return cand._id;
    });
    let memberName = '';
    for (const entity of this.memberAssigned) {
      memberName +=
        (entity && entity.member && entity.member.civility && entity.member.civility !== 'neutral'
          ? this.translate.instant(entity.member.civility) + ' '
          : '') +
        entity.member.first_name +
        ' ' +
        entity.member.last_name;
    }
    const result = [];
    result.push(this.assignMemberForm.controls['member_id'].value);
    console.log('result', result);
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
        this.isWaitingForResponse = true;
        this.subs.sink = this.candidateService.ChangeAdmissionMemberToManyCandidate(candidateList, result).subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            if (resp) {
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
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            this.authService.postErrorLog(err)
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      } else {
        this.isWaitingForResponse = false;
      }
    });
  }

  selectMember(data: MatSelectChange) {
    this.memberAssigned = [];
    const selectedMember = data.value;
    this.filterMember(selectedMember);
  }

  filterMember(data) {
    console.log(data);
    if (data) {
      const selectedMember = data;
      const studentPerMember = Math.ceil(this.totalCandidate / selectedMember.length);
      let currentCandidate = this.totalCandidate;
      console.log(this.memberAssigned);

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
      console.log('user', user);
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
    console.log('_devMember id', data);
    this.assignMemberForm.controls['member_id'].patchValue(data);
    this.memberAssigned = [];
    const selectedMember = data;
    this.filterMember(selectedMember);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
