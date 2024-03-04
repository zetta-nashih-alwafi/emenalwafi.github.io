import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatTabGroup } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { StudentChangeStatusDialogComponent } from 'app/candidate-file/student-commentaries-tab/student-change-status-dialog/student-change-status-dialog.component';
import { StudentUrgentDialogComponent } from 'app/candidate-file/student-urgent-dialog/student-urgent-dialog.component';
import { AdmissionService } from 'app/service/admission/admission.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { UsersService } from 'app/service/users/users.service';
import { ApplicationUrls } from 'app/shared/settings';
import * as moment from 'moment';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { environment } from 'environments/environment';
import { UserManagementService } from 'app/user-management/user-management.service';
import { FormFillingService } from 'app/form-filling/form-filling.service';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'ms-organization-detail-card',
  templateUrl: './organization-detail-card.component.html',
  styleUrls: ['./organization-detail-card.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseStringDatePipe],
})
export class OrganizationDetailCardComponent implements OnInit {
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  @Input() orgId;
  @Input() tab;
  @Output() reload: EventEmitter<boolean> = new EventEmitter();
  @Output() loading: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('candidateMatGroup', { static: false }) candidateMatGroup: MatTabGroup;
  @ViewChild('admissionStatus', { static: false }) matMenuTrigger: MatMenuTrigger;
  organization: any = {};
  isWaitingForResponse: Boolean = true;
  private subs = new SubSink();
  tabs = {
    'note-tab': 'Add a Note',
    'history-tab': 'Candidate history',
    'edit-tab': 'Modifications',
    'evolution-tab': 'Evolution',
  };

  maleCandidateIcon = '../../../../../assets/img/student_icon.png';
  femaleCandidateIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  userProfilePic = '../../../../../assets/img/user-1.jpg';
  userProfilePic1 = '../../../../../assets/img/user-3.jpg';
  userProfilePic2 = '../../../../../assets/img/user-5.jpg';
  greenHeartIcon = '../../../../../assets/img/enagement_icon_green.png';
  selectedIndex = 0;
  userData = [];
  personalSituation = false;
  restrictiveCondition = false;
  studentStatusList = [];
  listStatusAdmitted = [{ value: 'resign', key: 'Resign' }];
  listStatusEngaged = [{ value: 'resigned_after_engaged', key: 'Resign after engaged' }];
  listStatusRegistered = [{ value: 'resigned_after_registered', key: 'Resign after registered' }];
  currentUser: any;
  datePipe: DatePipe;
  constructor(
    private candidateService: CandidatesService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private admissionService: AdmissionService,
    private userService: UsersService,
    private authService: AuthService,
    private userMgtService: UserManagementService,
    private formFillingService: FormFillingService,
    public parseStringDatePipe: ParseStringDatePipe,
    public parseUTCtoLocal: ParseUtcToLocalPipe,
  ) {}

  ngOnInit() {
    this.moveToTab(this.tab);
    this.setupRefreshListener();

    this.datePipe = new DatePipe(this.translate.currentLang);
    this.subs.sink = this.translate.onLangChange.subscribe(() => {
      this.datePipe = new DatePipe(this.translate.currentLang);
    });
  }
  ngAfterViewInit() {
    this.moveToTab(this.tab);
  }
  ngOnChanges() {
    this.isWaitingForResponse = true;
    console.log(this.orgId);
    this.getOneUser();
    // this.getAllCandidateComment();
    this.currentUser = this.authService.getCurrentUser();
  }

  setupRefreshListener() {
    // listen to changes from the children tabs on user information update
    this.subs.sink = this.formFillingService.refresh.subscribe((resp) => {
      if (resp) {
        this.getOneUser();
      }
    });
  }

  getOneUser() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.getOneOrganizationForCardList(this.orgId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.organization = resp;
        }
      },
      (err) => {
        // console.log(err);
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

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  moveToTab(tab) {
    if (tab) {
      switch (tab) {
        case 'Identity':
          this.selectedIndex = 2;
          break;
        case 'Contact':
          this.selectedIndex = 3;
          break;
        default:
          this.selectedIndex = 0;
      }
    }
  }

  nextStep(value) {
    console.log('_val', value);
    if (value) {
      this.moveToTab(value);
    }
  }

  reloadData(value) {
    if (value) {
      this.getOneUser();
      this.reload.emit(true);
    }
  }

  loadingData(value) {
    this.loading.emit(value);
  }

  translateGraduationDate(dateRaw) {
    if (dateRaw) {
      const datee = moment(dateRaw).format('MM/DD/YYYY');
      return this.datePipe.transform(datee, 'dd MMM y');
    } else {
      return '';
    }
  }
}
