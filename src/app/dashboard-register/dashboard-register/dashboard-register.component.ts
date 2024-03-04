import { Component, OnChanges, OnDestroy, OnInit, ɵbypassSanitizationTrustStyle } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { SubSink } from 'subsink';
import { PageTitleService } from '../../core/page-title/page-title.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import * as _ from 'lodash';
import { ApplicationUrls } from 'app/shared/settings';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { debounceTime } from 'rxjs/operators';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { FinancesService } from 'app/service/finance/finance.service';
import Swal from 'sweetalert2';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import { ReplyUrgentMessageDialogComponent } from 'app/mailbox/reply-urgent-message-dialog/reply-urgent-message-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'ms-dashboard-register',
  templateUrl: './dashboard-register.component.html',
  styleUrls: ['./dashboard-register.component.scss'],
})
export class DashboardRegisterComponent implements OnInit, OnChanges, OnDestroy {
  menSelected: any;
  filteredSchool: any;
  dateFilter: UntypedFormGroup;
  private subs = new SubSink();
  // timeFilter = new UntypedFormControl('');
  // fromDateFilter = new UntypedFormControl('');
  // toDateFilter = new UntypedFormControl('');
  dataMentor = {
    profile_picture: '',
    _id: '',
    civility: '',
    first_name: '',
    last_name: 'Tous les Dev.',
  };
  schoolData = [];
  dataMapping = [];
  dataGeneral = [];
  panelColor = new UntypedFormControl('');
  devMember = new UntypedFormControl('');
  mentorList: any[] = [];
  oroginMentorList: any[] = [];
  schoolList = {
    campus: true,
    candidate: true,
  };
  short_name: any;
  dataMemberSelected: any;
  listAllProgress = {
    school: 'AllS',
    total_registered: 0,
    total_target: 0,
    percentage: 0,
    percentage_total: 0,
    high: {
      status: 'high',
      total_registered: 0,
      total_target: 0,
      percentage: 0,
    },
    medium: {
      status: 'medium',
      total_registered: 0,
      total_target: 0,
      percentage: 0,
    },
    low: {
      status: 'low',
      total_registered: 0,
      total_target: 0,
      percentage: 0,
    },
    lost: {
      status: 'lost',
      total_registered: 0,
      total_target: 0,
      percentage: 0,
    },
  };
  dataEngagement = [];
  allDataEngagement = [];
  allSchoolProgress = {
    total_registered: 0,
    total_target: 0,
    percentage: 0,
    admission_in_progress: {
      total: 0,
    },
    engaged: {
      total: 0,
    },
    resigned: {
      total: 0,
    },
    resigned_after_registered: {
      total: 0,
    },
  };
  isDirectorAdmission = false;
  isMemberAdmission = false;
  isOperator = false;
  firstExpansionClosed = false;
  openSubExpansion = false;
  currentUser;
  indexExpansion;
  fullDataUser;
  isWaitingForResponse = false;
  campusConnected;
  schoolConnected = [];
  listOfSchool = ['EFAP', 'ICART', 'EFJ', 'BRASSART'];
  amcharts = '../../../../../assets/img/amcharts.png';
  maleIcon = '../../../../../assets/img/student_icon.png';
  femaleIcon = '../../../../../assets/img/student_icon_fem.png';
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  scholars = [];
  scholarFilter = new UntypedFormControl('64b6855dfd086e1f9179b061');
  scholarId: any;
  allSchoolData: any;
  isPermission: any;
  currentUserTypeId: any;

  isGeneralDataLoading = false;
  isGetDataLevelEngagementLoading = false;
  isLoadingNationalityChart = false;
  isLoadingObjectiveChart = false;
  isLoadingWeeklyChart = false;
  replyUrgentMessageDialogComponent: MatDialogRef<ReplyUrgentMessageDialogComponent>;
  constructor(
    private mailboxService: MailboxService,
    public dialog: MatDialog,
    private pageTitleService: PageTitleService,
    private dashboardService: AdmissionDashboardService,
    private candidateService: CandidatesService,
    private userService: AuthService,
    private fb: UntypedFormBuilder,
    private permissionsService: NgxPermissionsService,
    private translate: TranslateService,
    private financeService: FinancesService,
  ) {}

  ngOnInit() {
    // let name = this.translate.instant('Dashboard') + ' / ' + this.translate.instant('NAV.DASHBOARDS.General');
    // this.pageTitleService.setTitle(name);
    // this.pageTitleService.setIcon('dashboard');
    // this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    //   name = this.translate.instant('Dashboard') + ' / ' + this.translate.instant('NAV.DASHBOARDS.General');
    //   this.pageTitleService.setTitle(name);
    //   this.pageTitleService.setIcon('dashboard');
    // });
    this.isPermission = this.userService.getPermission();
    this.currentUser = this.userService.getLocalStorageUser();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.getDataScholarSeasons();
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.isMemberAdmission = !!this.permissionsService.getPermission('Member Admission');
    this.isOperator = !!this.permissionsService.getPermission('Operator');
    this.filteredSchool = this.schoolList;
    this.subs.sink = this.dashboardService.resetData.subscribe((val: any) => {
      if (val) {
        this.dashboardService.setResetStatus(false);
      }
    });
    this.pageTitleService.setTitle('Dashboard Admission');
  }

  ngOnChanges() {}
  openExpansion(x) {
    this.firstExpansionClosed = true;
    this.openSubExpansion = true;
    this.indexExpansion = x;
  }
  openAllExpansion() {
    this.openSubExpansion = false;
    if (this.firstExpansionClosed) {
      this.firstExpansionClosed = false;
    }
  }
  childLoading(event) {
    this.isGeneralDataLoading = event;
  }
  dataLevelLoading(event) {
    this.isGetDataLevelEngagementLoading = event;
  }
  dataNationalityLoading(event) {
    this.isLoadingNationalityChart = event;
  }
  dataObjectiveLoading(event) {
    this.isLoadingObjectiveChart = event;
  }
  dataWeeklyLoading(event) {
    this.isLoadingWeeklyChart = event;
  }
  getDataSchool() {
    this.isWaitingForResponse = true;
    this.schoolData = [];
    this.dataEngagement = [];
    this.allSchoolData = [];
    this.allDataEngagement = [];
    this.dataMapping = [];
    let school = [];
    let scholarId: any;
    scholarId = this.scholarId;
    this.subs.sink = this.dashboardService.GetAllSchoolCandidate([], scholarId, this.currentUserTypeId).subscribe(
      (resp) => {
        this.openAllExpansion();
        if (resp && resp.length) {
          this.isWaitingForResponse = false;
          const tmpSchool = _.cloneDeep(resp);
          tmpSchool.forEach((element) => {
            if (element.levels && element.levels.length) {
              element.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
              this.schoolData.push(element);
            }
          });
          this.getAllEngagement();
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
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
          console.log(err);
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

  // GET ALL AVAILABLE ENGAGEMENT LEVEL ******************************************
  getAllEngagement() {
    this.dataEngagement = [];
    this.allSchoolData = [];
    this.allDataEngagement = [];
    const filter = 'filter: { scholar_season:' + `"${this.scholarFilter.value}"` + '}';
    this.subs.sink = this.dashboardService.GetAllEngagementLevel(filter, this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp && resp.length) {
          console.log('level', resp);
          const tmpEngagement = _.cloneDeep(resp);
          const school = [];
          const schoolEngaged = [];
          tmpEngagement.forEach((element) => {
            this.schoolData.filter((elem) => {
              if (element.school === elem.short_name) {
                school.push(elem);
                schoolEngaged.push(element);
              }
            });
          });
          this.allSchoolData = [];
          this.allDataEngagement = [];
          school.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0));
          console.log('!! ini school', school);
          this.allSchoolData = _.cloneDeep(school);
          schoolEngaged.forEach((schools) => {
            this.getEngagementData(schools);
          });
          this.allDataEngagement.sort((a, b) => (a.school > b.school ? 1 : b.school > a.school ? -1 : 0));
          if (this.allDataEngagement.length === 1) {
            this.openExpansion(0);
          }
        } else {
          this.allDataEngagement = [];
          this.isWaitingForResponse = false;
          this.isGeneralDataLoading = false;
          this.isGetDataLevelEngagementLoading = false;
          this.isLoadingNationalityChart = false;
          this.isLoadingObjectiveChart = false;
          this.isLoadingWeeklyChart = false;
        }
        this.getDataMapping();
      },
      (err) => {
        this.userService.postErrorLog(err);
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
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

  // MAP ALL ENGAGEMENT DATA FOR DISPLAY *****************************************
  getEngagementData(school) {
    if (school && school._id) {
      school.candidate_admission_statuses = school.candidate_admission_statuses.map((element) => {
        return {
          status: element.candidate_admission_status,
          count: element.count,
        };
      });
      school.candidate_admission_statuses.sort((a, b) => (a.status > b.status ? 1 : b.status > a.status ? -1 : 0));
      const total_registered = school.candidate_admission_statuses.find((element) => element.status === 'registered');
      const total_admitted = school.candidate_admission_statuses.find((element) => element.status === 'admission_in_progress');
      const total_engaged = school.candidate_admission_statuses.find((element) => element.status === 'engaged');
      const total_resigned = school.candidate_admission_statuses.find((element) => element.status === 'resigned');
      const total_resigned_after_registered = school.candidate_admission_statuses.find(
        (element) => element.status === 'resigned_after_registered',
      );
      const regis = total_registered.count;
      const percent = school.percentage ? school.percentage : 0;
      const obj = school.total_objective ? school.total_objective : 0;
      const finalPercent = (regis / obj) * 100 ? (regis / obj) * 100 : 0;

      school.percentage = finalPercent;
      school.total_percentage = school.percentage ? school.percentage : 0;
      school.total_objective = school.total_objective ? school.total_objective : 0;
      school.total_registered = total_registered.count;
      school.total_admitted = total_admitted.count;
      school.total_engaged = total_engaged.count;
      school.total_resigned = total_resigned.count;
      school.total_resigned_after_registered = total_resigned_after_registered.count;
      this.allDataEngagement.push(school);
    } else {
      return;
    }
  }

  getDataMapping() {
    this.dataMapping = [];
    this.allSchoolProgress = {
      total_registered: 0,
      total_target: 0,
      percentage: 0,
      admission_in_progress: {
        total: 0,
      },
      engaged: {
        total: 0,
      },
      resigned: {
        total: 0,
      },
      resigned_after_registered: {
        total: 0,
      },
    };

    this.allDataEngagement.forEach((list, i) => {
      const data = {
        school: list.school,
        total_registered: parseInt(list.total_registered),
        engagement_level: list.candidate_admission_statuses,
        total_objective: list.total_objective,
      };
      if (data) {
        this.dataMapping.push(data);
      }
    });
    this.dataMapping.forEach((element) => {
      this.allSchoolProgress.total_registered += element.total_registered;
      this.allSchoolProgress.total_target += element.total_objective;
    });
    this.dataMapping.forEach((element, n) => {
      if (element.engagement_level && element.engagement_level.length) {
        element.engagement_level.forEach((level, nex) => {
          if (level.status === 'admission_in_progress') {
            this.allSchoolProgress.admission_in_progress.total += level.count;
          }
          if (level.status === 'engaged') {
            this.allSchoolProgress.engaged.total += level.count;
          }
          if (level.status === 'resigned') {
            this.allSchoolProgress.resigned.total += level.count;
          }
          if (level.status === 'resigned_after_registered') {
            this.allSchoolProgress.resigned_after_registered.total += level.count;
          }
        });
      }
    });
    const percentage = ((this.allSchoolProgress.total_registered / this.allSchoolProgress.total_target) * 100).toFixed(2);
    this.allSchoolProgress.percentage = parseFloat(percentage);
    console.log('!! DATA MAP', this.allSchoolProgress);
    this.isWaitingForResponse = false;
  }

  floatDecimal(data) {
    const dataa = _.cloneDeep(data);
    let percentage = 0;
    if (dataa && dataa % 1 !== 0) {
      percentage = dataa.toFixed(2);
      if (dataa.toFixed() === '0') {
        percentage = data.toFixed(1);
      }
    }
    return percentage;
  }

  // Filter School for candidate
  filterSchool(school: string, event: any) {
    if (school === 'all' || school === '' || school === 'All' || school === 'Tous') {
      this.filteredSchool = this.schoolList;
    } else {
      this.filteredSchool = this.schoolList;
    }
  }

  filterMember() {
    const search = this.devMember.value.toLowerCase().trim();
    if (search) {
      this.mentorList = this.oroginMentorList.filter((list) => {
        return search ? list.last_name.toLowerCase().includes(search.toLowerCase()) : false;
      });
      this.mentorList = this.mentorList.sort((a, b) => (a.last_name > b.last_name ? 1 : -1));
    } else {
      this.mentorList = this.oroginMentorList.sort((a, b) => (a.last_name > b.last_name ? 1 : -1));
    }
  }

  // Scholar Season dropdown
  getDataScholarSeasons() {
    this.scholars = [];
    this.isWaitingForResponse = true;
    const sort = {
      createdAt: 'asc',
    };
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished(sort).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.scholars = _.cloneDeep(resp);
          this.scholars = this.scholars?.sort((current, next) => current?.scholar_season?.localeCompare(next?.scholar_season))
          if (resp && resp.length > 0) {
            const scholar = resp.map((list) => list._id);
            if (scholar.includes('64b6855dfd086e1f9179b061')) {
              this.scholarFilter.patchValue('64b6855dfd086e1f9179b061');
            } else {
              this.scholarFilter.patchValue(resp[resp.length - 1]._id);
            }
            this.scholarSelected();
          }
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
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
          console.log(err);
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

  scholarSelected() {
    if (this.scholarFilter.value) {
      const scholarId = this.scholars.find((scholar) => scholar._id === this.scholarFilter.value);
      this.scholarId = scholarId ? scholarId._id : null;
      this.dashboardService.setScholar(scholarId);
      this.openSubExpansion = false;
      this.getDataSchool();
    }
    // console.log('scholarId', scholarId, level);
  }
  getUrgentMail() {
    this.subs.sink = this.mailboxService.getUrgentMail().subscribe(
      (mailList: any[]) => {
        if (mailList && mailList.length) {
          this.subs.sink = this.dialog
            .open(ReplyUrgentMessageDialogComponent, {
              disableClose: true,
              width: '825px',
              panelClass: 'certification-rule-pop-up',
              data: mailList,
            })
            .afterClosed()
            .subscribe((resp) => {
              this.subs.sink = this.mailboxService.getUrgentMail().subscribe(
                (mailUrgent: any[]) => {
                  if (mailUrgent && mailUrgent.length) {
                    this.replyUrgentMessageDialogComponent = this.dialog.open(ReplyUrgentMessageDialogComponent, {
                      disableClose: true,
                      width: '825px',
                      panelClass: 'certification-rule-pop-up',
                      data: mailUrgent,
                    });
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
            });
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
        }
      },
    );
  }

  ngOnDestroy() {
    this.pageTitleService.setTitle(null);
    this.subs.unsubscribe();
  }
}
