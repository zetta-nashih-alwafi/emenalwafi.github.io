import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ms-transfer-campus-dialog',
  templateUrl: './transfer-campus-dialog.component.html',
  styleUrls: ['./transfer-campus-dialog.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class TransferCampusDialogComponent implements OnInit, OnDestroy {
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
  campusList = [
    {
      campus: 'PARIS',
      dev_leader: {
        civility: 'MR',
        first_name: 'Rémi',
        last_name: 'Barrault',
      },
    },
    {
      campus: 'TOULOUSE',
      dev_leader: {
        civility: 'MRS',
        first_name: 'Michel',
        last_name: 'Lemaître',
      },
    },
    {
      campus: 'Lyon',
      dev_leader: {
        civility: 'MR',
        first_name: 'Léon',
        last_name: 'Blanc',
      },
    },
    {
      campus: 'SHANGHAI',
      dev_leader: {
        civility: 'MR',
        first_name: 'Léon',
        last_name: 'Blanc',
      },
    },
  ];

  currentUser: any;
  campus = 'PARIS';
  candidate = '';

  constructor(
    public dialogRef: MatDialogRef<TransferCampusDialogComponent>,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private candidateService: CandidatesService,
    public userService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    console.log('Candidate Selected is => ', this.data);
    const campus = this.route.snapshot.queryParamMap.get('campus');
    const candidate = this.route.snapshot.queryParamMap.get('candidate');
    if (campus) {
      this.campus = campus;
    }
    if (campus) {
      this.candidate = candidate;
    }
    this.getCanididate();
    this.currentUser = this.userService.getLocalStorageUser();
  }

  getCanididate() {
    this.subs.sink = this.candidateService.getCandidateRegistration(this.candidate).subscribe(
      (resp) => {
        this.singleCandidate = resp;
      },
      (err) => {
        this.userService.postErrorLog(err)
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  submitCampus(type) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.candidateService.AcceptRejectTransferCampus(this.candidate, this.campus, type).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          Swal.fire({
            type: 'success',
            title: 'Bravo!',
            allowOutsideClick: false,
            confirmButtonText: 'OK',
          }).then(() => {
            this.dialogRef.close('reset');
          });
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err)
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        }).then(() => {
          this.dialogRef.close('reset');
        });
      },
    );
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  messageDialog() {
    let message = '';
    message += this.translate.instant('CANDIDATE_POPUP_C6.CANDIDATE_TEXT', {
      candidateName: this.singleCandidate
        ? (this.singleCandidate.civility !== 'neutral' ? this.translate.instant(this.singleCandidate.civility) + ' ' : '') +
          this.singleCandidate.first_name +
          ' ' +
          this.singleCandidate.last_name
        : '',
    });

    return message;
  }
}
