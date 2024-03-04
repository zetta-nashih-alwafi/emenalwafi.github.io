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
import * as moment from 'moment';
import { FinancesService } from 'app/service/finance/finance.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-dashboard-cash-flow',
  templateUrl: './dashboard-cash-flow.component.html',
  styleUrls: ['./dashboard-cash-flow.component.scss'],
})
export class DashboardCashFlowComponent implements OnInit, OnChanges, OnDestroy {
  menSelected: any;
  filteredSchool: any;
  dateFilter: UntypedFormGroup;
  private subs = new SubSink();
  today: Date;
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
  dataAll = [];
  dataDetail = [];
  dataGeneral = [];
  panelColor = new UntypedFormControl('excellent');
  devMember = new UntypedFormControl('');
  mentorList: any[] = [];
  oroginMentorList: any[] = [];
  schoolList = {
    campus: true,
    candidate: true,
  };
  detailHeaderCampus = [
    'Sep 2020',
    'Oct 2020',
    'Nov 2020',
    'Dec 2020',
    'Jan 2021',
    'Feb 2021',
    'Mar 2021',
    'Apr 2021',
    'May 2021',
    'Jun 2021',
    'Jul 2021',
    'Aug 2021',
  ];
  scholars = [];
  short_name = '';
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
  dataHeader = [
    {
      month: '01/09/2020',
      total: '5 625 000',
      current: '2 746 800',
    },
    {
      month: '01/10/2020',
      total: '5 625 000',
      current: '317 408',
    },
    {
      month: '01/11/2020',
      total: '5 625 000',
      current: '991 900',
    },
    {
      month: '01/12/2020',
      total: '5 625 000',
      current: '1 388 660',
    },
    {
      month: '01/01/2021',
      total: '5 625 000',
      current: '1 269 632',
    },
    {
      month: '01/02/2021',
      total: '857 358',
      current: '1 284 129',
    },
    {
      month: '01/03/2021',
      total: '5 625 000',
      current: '1 540 955',
    },
    {
      month: '01/04/2021',
      total: '5 625 000',
      current: '770 477',
    },
    {
      month: '01/05/2021',
      total: '5 625 000',
      current: '1 284 129',
    },
    {
      month: '01/06/2021',
      total: '5 625 000',
      current: '1 284 129',
    },
    {
      month: '01/07/2021',
      total: '5 625 000',
      current: '2 225 824',
    },
    {
      month: '01/08/2021',
      total: '5 625 000',
      current: '85 609',
    },
    {
      month: '01/09/2021',
      total: '5 625 000',
      current: '8 646 469',
    },
  ];
  dataHeadersss = [
    {
      month: '01/09/2020',
      total: '5 625 000',
      current: '2 746 800',
    },
    {
      month: '01/10/2020',
      total: '5 625 000',
      current: '317 408',
    },
    {
      month: '01/11/2020',
      total: '5 625 000',
      current: '991 900',
    },
    {
      month: '01/12/2020',
      total: '5 625 000',
      current: '1 388 660',
    },
    {
      month: '01/01/2021',
      total: '5 625 000',
      current: '1 269 632',
    },
    {
      month: '01/02/2021',
      total: '857 358',
      current: '1 540 955',
    },
    {
      month: '01/03/2021',
      total: '5 625 000',
      current: '1 849 146',
    },
    {
      month: '01/04/2021',
      total: '5 625 000',
      current: '924 573',
    },
    {
      month: '01/05/2021',
      total: '5 625 000',
      current: '1 540 955',
    },
    {
      month: '01/06/2021',
      total: '5 625 000',
      current: '1 540 955',
    },
    {
      month: '01/07/2021',
      total: '5 625 000',
      current: '2 670 988',
    },
    {
      month: '01/08/2021',
      total: '5 625 000',
      current: '102 730',
    },
    {
      month: '01/09/2021',
      total: '5 625 000',
      current: '6 951 418',
    },
  ];
  dataHeaderss = [
    {
      month: '01/09/2020',
      total: '5 625 000',
      current: '2 746 800',
    },
    {
      month: '01/10/2020',
      total: '5 625 000',
      current: '317 408',
    },
    {
      month: '01/11/2020',
      total: '5 625 000',
      current: '991 900',
    },
    {
      month: '01/12/2020',
      total: '5 625 000',
      current: '1 388 660',
    },
    {
      month: '01/01/2021',
      total: '5 625 000',
      current: '1 269 632',
    },
    {
      month: '01/02/2021',
      total: '857 358',
      current: '2 568 258',
    },
    {
      month: '01/03/2021',
      total: '5 625 000',
      current: '3 081 910',
    },
    {
      month: '01/04/2021',
      total: '5 625 000',
      current: '1 540,955',
    },
    {
      month: '01/05/2021',
      total: '5 625 000',
      current: '2 568 258',
    },
    {
      month: '01/06/2021',
      total: '5 625 000',
      current: '2 568 258',
    },
    {
      month: '01/07/2021',
      total: '5 625 000',
      current: '4 451 647',
    },
    {
      month: '01/08/2021',
      total: '5 625 000',
      current: '171 217',
    },
    {
      month: '01/09/2021',
      total: '5 625 000',
      current: '171 217',
    },
  ];
  dataHeaders = [
    {
      month: '01/09/2020',
      total: '5 625 000',
      current: '2 746 800',
    },
    {
      month: '01/10/2020',
      total: '5 625 000',
      current: '317 408',
    },
    {
      month: '01/11/2020',
      total: '5 625 000',
      current: '991 900',
    },
    {
      month: '01/12/2020',
      total: '5 625 000',
      current: '1 388 660',
    },
    {
      month: '01/01/2021',
      total: '5 625 000',
      current: '1 269 632',
    },
    {
      month: '01/02/2021',
      total: '857 358',
      current: '1 797 781',
    },
    {
      month: '01/03/2021',
      total: '5 625 000',
      current: '2 157 337',
    },
    {
      month: '01/04/2021',
      total: '5 625 000',
      current: '1 078,668',
    },
    {
      month: '01/05/2021',
      total: '5 625 000',
      current: '1 797 781',
    },
    {
      month: '01/06/2021',
      total: '5 625 000',
      current: '1 797 781',
    },
    {
      month: '01/07/2021',
      total: '5 625 000',
      current: '3 116 153',
    },
    {
      month: '01/08/2021',
      total: '5 625 000',
      current: '119 852',
    },
    {
      month: '01/09/2021',
      total: '5 625 000',
      current: '5 256 368',
    },
  ];
  dataHeaderAll = [
    {
      month: '01/09/2020',
      total: '5 625 000',
      current: '5 625 000',
    },
    {
      month: '01/10/2020',
      total: '5 625 000',
      current: '1 310 560',
    },
    {
      month: '01/11/2020',
      total: '5 625 000',
      current: '3 112 580',
    },
    {
      month: '01/12/2020',
      total: '5 625 000',
      current: '1 802 020',
    },
    {
      month: '01/01/2021',
      total: '1 232 122',
      current: '1 965 840',
    },
    {
      month: '01/02/2021',
      total: '1 232 122',
      current: '2 642 310',
    },
    {
      month: '01/03/2021',
      total: '5 625 000',
      current: '3 170 772',
    },
    {
      month: '01/04/2021',
      total: '5 625 000',
      current: '1 585 386',
    },
    {
      month: '01/05/2021',
      total: '5 625 000',
      current: '2 642 310',
    },
    {
      month: '01/06/2021',
      total: '5 625 000',
      current: '2 642 310',
    },
    {
      month: '01/07/2021',
      total: '5 625 000',
      current: '4 580 004',
    },
    {
      month: '01/08/2021',
      total: '5 625 000',
      current: '176 154',
    },
    {
      month: '01/09/2021',
      total: '5 625 000',
      current: '17 791 554',
    },
  ];
  dataHeaderAllS = [
    {
      month: '01/09/2020',
      total: '5 625 000',
      current: '5 625 000',
    },
    {
      month: '01/10/2020',
      total: '5 625 000',
      current: '1 310 560',
    },
    {
      month: '01/11/2020',
      total: '5 625 000',
      current: '3 112 580',
    },
    {
      month: '01/12/2020',
      total: '5 625 000',
      current: '1 802 020',
    },
    {
      month: '01/01/2021',
      total: '1 232 122',
      current: '1 965 840',
    },
    {
      month: '01/02/2021',
      total: '1 232 122',
      current: '3 699 234',
    },
    {
      month: '01/03/2021',
      total: '5 625 000',
      current: '4 439 081',
    },
    {
      month: '01/04/2021',
      total: '5 625 000',
      current: '2 219 540',
    },
    {
      month: '01/05/2021',
      total: '5 625 000',
      current: '3 699 234',
    },
    {
      month: '01/06/2021',
      total: '5 625 000',
      current: '3 699 234',
    },
    {
      month: '01/07/2021',
      total: '5 625 000',
      current: '6 412 006',
    },
    {
      month: '01/08/2021',
      total: '5 625 000',
      current: '246 616',
    },
    {
      month: '01/09/2021',
      total: '5 625 000',
      current: '10 815 856',
    },
  ];
  dataHeaderAllSS = [
    {
      month: '01/09/2020',
      total: '5 625 000',
      current: '5 625 000',
    },
    {
      month: '01/10/2020',
      total: '5 625 000',
      current: '1 310 560',
    },
    {
      month: '01/11/2020',
      total: '5 625 000',
      current: '3 112 580',
    },
    {
      month: '01/12/2020',
      total: '5 625 000',
      current: '1 802 020',
    },
    {
      month: '01/01/2021',
      total: '1 232 122',
      current: '1 965 840',
    },
    {
      month: '01/02/2021',
      total: '1 232 122',
      current: '5 284 620',
    },
    {
      month: '01/03/2021',
      total: '5 625 000',
      current: '6 341 544',
    },
    {
      month: '01/04/2021',
      total: '5 625 000',
      current: '3 170 772',
    },
    {
      month: '01/05/2021',
      total: '5 625 000',
      current: '5 284 620',
    },
    {
      month: '01/06/2021',
      total: '5 625 000',
      current: '5 284 620',
    },
    {
      month: '01/07/2021',
      total: '5 625 000',
      current: '9 160 008',
    },
    {
      month: '01/08/2021',
      total: '5 625 000',
      current: '352 308',
    },
    {
      month: '01/09/2021',
      total: '5 625 000',
      current: '352 308',
    },
  ];
  dataEngagement = [];
  allDataEngagement = [];
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
  detailHeader = ['excellent', 'good', 'bad', 'doubtful', 'litigation'];
  isTresFiable = false;
  isFiable = false;
  isPeuFiable = false;
  isImprevisible = false;
  isRecouvrement = false;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  scholarId = new UntypedFormControl('6037096846d75f192bfba48b');
  generalDashboardData = [];
  isPermission: any;
  currentUserTypeId: any;
  constructor(
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
    this.getDataScholarSeasons();
    this.today = new Date();
    // let name = this.translate.instant('Finance') + ' / ' + this.translate.instant('Dashboard') + ' / ' + this.translate.instant('Cash In');
    // this.pageTitleService.setTitle(name);
    // this.pageTitleService.setIcon('dashboard');
    // this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    //   name = this.translate.instant('Finance') + ' / ' + this.translate.instant('Dashboard') + ' / ' + this.translate.instant('Cash In');
    //   this.pageTitleService.setTitle(name);
    //   this.pageTitleService.setIcon('dashboard');
    // });
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.getCurrentUser();
    this.getCashInGeneralDashboardData();
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.isMemberAdmission = !!this.permissionsService.getPermission('Member Admission');
    this.isOperator = !!this.permissionsService.getPermission('Operator');


    this.filteredSchool = this.schoolList;
    this.subs.sink = this.dashboardService.resetData.subscribe((val: any) => {
      if (val) {
        this.dashboardService.setResetStatus(false);
        this.mentorSelected(this.dataMentor);
      }
    });
  }

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasons().subscribe((resp) => {
      if (resp && resp.length) {
        // console.log('Data', resp);
        this.scholars = resp;
      }
    }, (err) => {
      if (
            err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
      ) {
        this.userService.handlerSessionExpired();
        return;
      }
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  getCashInGeneralDashboardData() {
    this.isWaitingForResponse = true;
    this.dashboardService.getAllGeneralDashboardFinanceCashIn(this.panelColor.value, this.scholarId.value).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          const dataAll = resp.find((dt) => dt.school === 'overall');
          this.dataAll = dataAll ? dataAll.months : [];
          this.dataDetail = resp.filter((dt) => dt.school !== 'overall');
        }
      },
      (err) => (this.isWaitingForResponse = false),
    );
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
  getDataSchool() {
    let school = [];
    if (this.isDirectorAdmission) {
      const name =
        this.menSelected && this.menSelected.entities && this.menSelected.entities[0] ? this.menSelected.entities[0].candidate_school : '';
      if (name) {
        school.push(name);
      } else {
        school = this.schoolConnected;
      }
      this.subs.sink = this.dashboardService.GetAllSchoolCandidate(school, undefined, this.currentUserTypeId).subscribe((resp) => {
        if (resp && resp.length) {
          this.schoolData = resp;
          this.getEngagement();
          // this.generateData();
        } else {
          this.isWaitingForResponse = false;
        }
      }, (err) => {
        if (
          err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      });
    } else if (this.isOperator) {
      const name =
        this.menSelected && this.menSelected.entities && this.menSelected.entities[0] ? this.menSelected.entities[0].candidate_school : '';
      if (name) {
        school.push(name);
      } else {
        school = [];
      }
      this.subs.sink = this.dashboardService.GetAllSchoolCandidate(school, undefined, this.currentUserTypeId).subscribe((resp) => {
        if (resp && resp.length) {
          this.schoolData = resp;
          this.getEngagement();
          // this.generateData();
        } else {
          this.isWaitingForResponse = false;
        }
      }, (err) => {
        if (
          err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      });
    } else {
      const name =
        this.menSelected && this.menSelected.entities && this.menSelected.entities[0] ? this.menSelected.entities[0].candidate_school : '';
      if (name) {
        school.push(name);
      } else {
        school = [];
      }
      this.subs.sink = this.dashboardService.GetAllSchoolCandidate(school, undefined, this.currentUserTypeId).subscribe((resp) => {
        if (resp && resp.length) {
          this.schoolData = resp;
          this.getEngagement();
          // this.generateData();
        } else {
          this.isWaitingForResponse = false;
        }
      }, (err) => {
        if (
          err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      });
    }
  }

  getCurrentUser() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.getUserForDashboard(this.currentUser._id).subscribe((resp) => {
      if (resp) {
        this.fullDataUser = _.cloneDeep(resp);
        if (this.fullDataUser.entities && this.fullDataUser.entities.length) {
          this.campusConnected = this.fullDataUser.entities.map((list) => {
            return list.campus;
          });
          this.schoolConnected = this.fullDataUser.entities.map((list) => {
            return list.school;
          });
          if (this.isMemberAdmission) {
            this.isUserMember();
          } else {
            this.getDataSchool();
            this.getDevMember();
          }
        }
      }
    }, (err) => {
      if (
            err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
      ) {
        this.userService.handlerSessionExpired();
        return;
      }
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  getEngagement() {
    this.dataEngagement = [];
    this.allDataEngagement = [];
    this.subs.sink = this.dashboardService.GetAllEngagementLevelProgresses().subscribe((resp) => {
      if (resp && resp.length) {
        this.allDataEngagement = resp;
      } else {
        this.allDataEngagement = [];
        this.isWaitingForResponse = false;
      }
      this.schoolData.forEach((element) => {
        this.getEngagementLevel(element.short_name);
      });
      this.getGeneralData();
    }, (err) => {
      if (
            err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
      ) {
        this.userService.handlerSessionExpired();
        return;
      }
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  getEngagementLevel(school) {
    let engagement_levels = [];
    if (this.allDataEngagement && this.allDataEngagement.length) {
      const allData = _.cloneDeep(this.allDataEngagement);
      const data = allData.filter((dataa) => {
        return dataa.school === school;
      });
      if (data && data.length) {
        engagement_levels = data[0].engagement_levels.map((level) => {
          return {
            status: level.status,
            total_registered: parseInt(level.total),
            total_target: parseInt(level.target),
            percentage: parseInt(level.percentage),
          };
        });
      } else {
        engagement_levels = [
          {
            status: 'registered',
            total_registered: 0,
            total_target: 0,
            percentage: 0,
          },
          {
            status: 'high',
            total_registered: 0,
            total_target: 0,
            percentage: 0,
          },
          {
            status: 'medium',
            total_registered: 0,
            total_target: 0,
            percentage: 0,
          },
          {
            status: 'low',
            total_registered: 0,
            total_target: 0,
            percentage: 0,
          },
          {
            status: 'lost',
            total_registered: 0,
            total_target: 0,
            percentage: 0,
          },
        ];
      }
      this.dataEngagement.push(engagement_levels);
    } else {
      engagement_levels = [
        {
          status: 'registered',
          total_registered: 0,
          total_target: 0,
          percentage: 0,
        },
        {
          status: 'high',
          total_registered: 0,
          total_target: 0,
          percentage: 0,
        },
        {
          status: 'medium',
          total_registered: 0,
          total_target: 0,
          percentage: 0,
        },
        {
          status: 'low',
          total_registered: 0,
          total_target: 0,
          percentage: 0,
        },
        {
          status: 'lost',
          total_registered: 0,
          total_target: 0,
          percentage: 0,
        },
      ];
      this.dataEngagement.push(engagement_levels);
    }
  }

  isUserMember() {
    this.menSelected = this.dataMentor;
    this.subs.sink = this.candidateService.getAllMemberAdmission().subscribe((resp) => {
      if (resp) {
        let response = _.cloneDeep(resp);
        if (this.isMemberAdmission && this.currentUser && this.currentUser._id) {
          response = response.filter((member) => member._id === this.currentUser._id);
          if (response && response.length) {
            this.mentorSelected(response[0]);
          } else {
            this.mentorSelected('');
          }
        }

        this.mentorList = response;
        this.mentorList = this.mentorList.sort((a, b) => (a.last_name > b.last_name ? 1 : -1));
        this.oroginMentorList = this.mentorList.sort((a, b) => (a.last_name > b.last_name ? 1 : -1));
      }
    }, (err) => {
      if (
            err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
      ) {
        this.userService.handlerSessionExpired();
        return;
      }
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  getDevMember() {
    if (this.isDirectorAdmission) {
      const school = this.currentUser && this.currentUser.entities ? this.currentUser.entities[0].candidate_school : '';
      const campus = this.campusConnected && this.campusConnected.length ? this.campusConnected : '';
      this.subs.sink = this.candidateService.getAllMemberByDirector(campus, school).subscribe((resp) => {
        if (resp) {
          this.mentorList = resp;
          this.mentorList = this.mentorList.sort((a, b) => (a.last_name > b.last_name ? 1 : -1));
          this.oroginMentorList = this.mentorList.sort((a, b) => (a.last_name > b.last_name ? 1 : -1));
        }
      }, (err) => {
        if (
          err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      });
    } else {
      this.menSelected = this.dataMentor;
      this.subs.sink = this.candidateService.getAllMemberAdmission().subscribe((resp) => {
        if (resp) {
          let response = _.cloneDeep(resp);
          if (this.isMemberAdmission && this.currentUser && this.currentUser._id) {
            response = response.filter((member) => member._id === this.currentUser._id);
            if (response && response.length) {
              this.mentorSelected(response[0]);
            } else {
              this.mentorSelected('');
            }
          }

          this.mentorList = response;
          this.mentorList = this.mentorList.sort((a, b) => (a.last_name > b.last_name ? 1 : -1));
          this.oroginMentorList = this.mentorList.sort((a, b) => (a.last_name > b.last_name ? 1 : -1));
        }
      }, (err) => {
        if (
          err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      });
    }
  }

  formatCurrency(data: number) {
    let num = '0';
    if (data) {
      num = data.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ');
      num = num.toString().slice(0, -3);
    }
    return num;
  }

  getGeneralData() {
    this.dataMapping = [];
    const name = this.menSelected && this.menSelected._id ? this.menSelected._id : '';
    this.short_name = name;
    this.dataMemberSelected = this.menSelected ? this.menSelected : '';
    // console.log('this.menSelected dashboard payment ', this.menSelected);
    this.subs.sink = this.dashboardService.GetDataGeneralFinance(name).subscribe(
      (resp) => {
        if (resp && resp.length) {
          const datas = _.cloneDeep(resp);
          this.dataGeneral = _.cloneDeep(resp);
          this.schoolData.forEach((element) => {
            let data = datas
              .filter((list) => list.school.toLowerCase() === element.short_name.toLowerCase())
              .map((temp) => {
                return {
                  school: element.short_name,
                  total_registered: parseInt(temp.total_paid),
                  total_target: parseInt(temp.total_target),
                  percentage: temp.percentage_latest_week,
                  engagement_level: element.levels,
                  percentage_total: temp.percentage_total,
                };
              });
            if (!data && !data.length) {
              data = [
                {
                  school: element.short_name,
                  total_registered: 0,
                  total_target: 0,
                  percentage: 0,
                  percentage_total: 0,
                  engagement_level: element.levels,
                },
              ];
            }
            this.dataMapping.push(...data);
          });
          this.dataMapping.forEach((element, n) => {
            element.engagement_level = this.dataEngagement && this.dataEngagement.length ? this.dataEngagement[n] : [];
          });
          this.dataMapping.forEach((element) => {
            this.listAllProgress.total_registered += element.total_registered;
            this.listAllProgress.total_target += element.total_target;
            this.listAllProgress.percentage += element.percentage;
            this.listAllProgress.percentage_total += element.percentage_total;
          });
          this.listAllProgress.percentage = this.listAllProgress.percentage / this.dataMapping.length;
          this.listAllProgress.percentage_total = this.listAllProgress.percentage_total / this.dataMapping.length;
          this.dataMapping.forEach((element, n) => {
            if (element.engagement_level && element.engagement_level.length) {
              element.engagement_level.forEach((level, nex) => {
                if (level.status === 'high') {
                  this.listAllProgress.high.total_registered += level.total_registered;
                  this.listAllProgress.high.total_target += level.total_target;
                  this.listAllProgress.high.percentage += level.percentage;
                }
                if (level.status === 'medium') {
                  this.listAllProgress.medium.total_registered += level.total_registered;
                  this.listAllProgress.medium.total_target += level.total_target;
                  this.listAllProgress.medium.percentage += level.percentage;
                }
                if (level.status === 'low') {
                  this.listAllProgress.low.total_registered += level.total_registered;
                  this.listAllProgress.low.total_target += level.total_target;
                  this.listAllProgress.low.percentage += level.percentage;
                }
                if (level.status === 'lost') {
                  this.listAllProgress.lost.total_registered += level.total_registered;
                  this.listAllProgress.lost.total_target += level.total_target;
                  this.listAllProgress.lost.percentage += level.percentage;
                }
              });
            } else {
              this.listAllProgress.high.total_registered = 0;
              this.listAllProgress.high.total_target = 0;
              this.listAllProgress.high.percentage = 0;
              this.listAllProgress.medium.total_registered = 0;
              this.listAllProgress.medium.total_target = 0;
              this.listAllProgress.medium.percentage = 0;
              this.listAllProgress.low.total_registered = 0;
              this.listAllProgress.low.total_target = 0;
              this.listAllProgress.low.percentage = 0;
              this.listAllProgress.lost.total_registered = 0;
              this.listAllProgress.lost.total_target = 0;
              this.listAllProgress.lost.percentage = 0;
            }
          });
          this.listAllProgress.high.percentage = this.listAllProgress.high.percentage / this.dataMapping.length;

          this.listAllProgress.medium.percentage = this.listAllProgress.medium.percentage / this.dataMapping.length;

          this.listAllProgress.low.percentage = this.listAllProgress.low.percentage / this.dataMapping.length;

          this.listAllProgress.lost.percentage = this.listAllProgress.lost.percentage / this.dataMapping.length;
        } else {
          this.schoolData.forEach((element) => {
            const data = {
              school: element.short_name,
              total_registered: 0,
              total_target: 0,
              percentage: 0,
              engagement_level: [
                {
                  status: 'registered',
                  total_registered: 0,
                  total_target: 0,
                  percentage: 0,
                },
                {
                  status: 'high',
                  total_registered: 0,
                  total_target: 0,
                  percentage: 0,
                },
                {
                  status: 'medium',
                  total_registered: 0,
                  total_target: 0,
                  percentage: 0,
                },
                {
                  status: 'low',
                  total_registered: 0,
                  total_target: 0,
                  percentage: 0,
                },
                {
                  status: 'lost',
                  total_registered: 0,
                  total_target: 0,
                  percentage: 0,
                },
              ],
            };
            this.dataMapping.push(data);
          });
          this.dataMapping.forEach((element, n) => {
            element.engagement_level = this.dataEngagement && this.dataEngagement.length ? this.dataEngagement[n] : [];
          });
          this.dataMapping.forEach((element, n) => {
            if (element.engagement_level && element.engagement_level.length) {
              element.engagement_level.forEach((level, nex) => {
                if (level.status === 'high') {
                  this.listAllProgress.high.total_registered += level.total_registered;
                  this.listAllProgress.high.total_target += level.total_target;
                  this.listAllProgress.high.percentage += level.percentage;
                }
                if (level.status === 'medium') {
                  this.listAllProgress.medium.total_registered += level.total_registered;
                  this.listAllProgress.medium.total_target += level.total_target;
                  this.listAllProgress.medium.percentage += level.percentage;
                }
                if (level.status === 'low') {
                  this.listAllProgress.low.total_registered += level.total_registered;
                  this.listAllProgress.low.total_target += level.total_target;
                  this.listAllProgress.low.percentage += level.percentage;
                }
                if (level.status === 'lost') {
                  this.listAllProgress.lost.total_registered += level.total_registered;
                  this.listAllProgress.lost.total_target += level.total_target;
                  this.listAllProgress.lost.percentage += level.percentage;
                }
              });
            } else {
              this.listAllProgress.high.total_registered = 0;
              this.listAllProgress.high.total_target = 0;
              this.listAllProgress.high.percentage = 0;
              this.listAllProgress.medium.total_registered = 0;
              this.listAllProgress.medium.total_target = 0;
              this.listAllProgress.medium.percentage = 0;
              this.listAllProgress.low.total_registered = 0;
              this.listAllProgress.low.total_target = 0;
              this.listAllProgress.low.percentage = 0;
              this.listAllProgress.lost.total_registered = 0;
              this.listAllProgress.lost.total_target = 0;
              this.listAllProgress.lost.percentage = 0;
            }
          });
          this.listAllProgress.high.percentage = this.listAllProgress.high.percentage / this.dataMapping.length;

          this.listAllProgress.medium.percentage = this.listAllProgress.medium.percentage / this.dataMapping.length;

          this.listAllProgress.low.percentage = this.listAllProgress.low.percentage / this.dataMapping.length;

          this.listAllProgress.lost.percentage = this.listAllProgress.lost.percentage / this.dataMapping.length;
        }
        // console.log('dataMapping ', this.dataMapping);
      },
      (err) => {
        this.isWaitingForResponse = false
        if (
          err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
    this.isWaitingForResponse = false;
  }

  mentorSelected(data) {
    this.isWaitingForResponse = true;
    this.dataMapping = [];
    this.schoolData = [];
    this.listAllProgress = {
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
    this.menSelected = data;
    const memberName = data
      ? (data.civility && data.civility !== 'neutral' ? this.translate.instant(data.civility) : '') +
        ', ' +
        (data.first_name ? data.first_name : '') +
        ', ' +
        (data.last_name && data.last_name !== 'Tous les Dev.' ? data.last_name : '')
      : '';
    if (this.isDirectorAdmission || this.isMemberAdmission) {
      if (!data.first_name || data.last_name === 'Tous les Dev.') {
        this.short_name = this.currentUser && this.currentUser._id ? this.currentUser._id : '';
        this.dataMemberSelected = this.menSelected ? this.menSelected : '';
      } else {
        this.short_name = data._id;
        this.dataMemberSelected = data ? data : '';
      }
    }
    if (!data.first_name) {
      this.devMember.setValue('');
    } else {
      this.devMember.setValue(memberName);
    }
    this.mentorList = [];
    this.mentorList = this.oroginMentorList.sort((a, b) => (a.last_name > b.last_name ? 1 : -1));
    this.getDataSchool();
  }
  floatDecimal(data) {
    const dataa = _.cloneDeep(data);
    let percentage = 0;
    if (dataa && dataa % 1 !== 0) {
      percentage = dataa.toFixed();
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

  ngOnDestroy() {
    this.pageTitleService.setTitle(null);
    this.pageTitleService.setIcon(null);
    this.subs.unsubscribe();
  }
  checkCurrentMonth(date) {
    let currentMonth = false;
    const check = moment(date, 'YYYY/MM/DD');
    const todayDate = moment(this.today, 'YYYY/MM/DD');
    const monthToday = todayDate.format('M');
    const month = check.format('M');
    const day = check.format('D');
    const year = check.format('YYYY');
    if (monthToday === month) {
      currentMonth = true;
    }
    return currentMonth;
  }
  translateDate(date) {
    const check = moment(date, 'DD-MM-YYYY').format('MMM YYYY');
    return check;
  }
  checkFreshMonth(date) {
    let currentMonth = false;
    const check = moment(date, 'DD-MM-YYYY');
    const todayDate = moment(this.today, 'DD-MM-YYYY');
    const monthToday = todayDate.format('M');
    const yearToday = todayDate.format('YYYY');
    const month = check.format('M');
    const day = check.format('D');
    const year = check.format('YYYY');
    if (parseInt(month) >= parseInt(monthToday) && parseInt(year) >= parseInt(yearToday)) {
      currentMonth = true;
    }
    return currentMonth;
  }
  checkFreshMonthWithScenario(date) {
    let currentMonth = false;
    const check = moment(date, 'DD-MM-YYYY');
    const todayDate = moment(this.today, 'DD-MM-YYYY');
    const monthToday = todayDate.format('M');
    const yearToday = todayDate.format('YYYY');
    const month = check.format('M');
    const day = check.format('D');
    const year = check.format('YYYY');
    if (parseInt(month) >= parseInt(monthToday) && parseInt(year) >= parseInt(yearToday)) {
      const color = this.panelColor.value;
      // // console.log('Masuk Sini?', color);
      if (color === 'excellent') {
        currentMonth = true;
        this.isTresFiable = true;
        this.isFiable = false;
        this.isPeuFiable = false;
        this.isImprevisible = false;
        this.isRecouvrement = false;
      } else if (color === 'good') {
        currentMonth = true;
        this.isTresFiable = false;
        this.isFiable = true;
        this.isPeuFiable = false;
        this.isImprevisible = false;
        this.isRecouvrement = false;
      } else if (color === 'bad') {
        currentMonth = true;
        this.isTresFiable = false;
        this.isFiable = false;
        this.isPeuFiable = true;
        this.isImprevisible = false;
        this.isRecouvrement = false;
      } else if (color === 'doubtful') {
        currentMonth = true;
        this.isTresFiable = false;
        this.isFiable = false;
        this.isPeuFiable = false;
        this.isImprevisible = true;
        this.isRecouvrement = false;
      } else if (color === 'litigation') {
        currentMonth = true;
        this.isTresFiable = false;
        this.isFiable = false;
        this.isPeuFiable = false;
        this.isImprevisible = false;
        this.isRecouvrement = true;
      }
    }
    return currentMonth;
  }
  selectType() {
    this.getCashInGeneralDashboardData();
    const color = this.panelColor.value;
    // // console.log('Masuk Sini?', color);
    if (color === 'excellent') {
      this.dataAll = this.dataHeaderAll;
      this.dataDetail = this.dataHeader;
    } else if (color === 'good') {
      this.dataAll = this.dataHeaderAllS;
      this.dataDetail = this.dataHeaders;
    } else if (color === 'bad') {
      this.dataAll = this.dataHeaderAllSS;
      this.dataDetail = this.dataHeaderss;
    } else if (color === 'doubtful') {
      this.dataAll = this.dataHeaderAllS;
      this.dataDetail = this.dataHeadersss;
    } else if (color === 'litigation') {
      this.dataAll = this.dataHeaderAllSS;
      this.dataDetail = this.dataHeaderss;
    }
  }
}
