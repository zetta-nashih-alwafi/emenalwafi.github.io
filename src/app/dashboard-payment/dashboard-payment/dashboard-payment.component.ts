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
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-dashboard-payment',
  templateUrl: './dashboard-payment.component.html',
  styleUrls: ['./dashboard-payment.component.scss'],
})
export class DashboardPaymentComponent implements OnInit, OnChanges, OnDestroy {
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
  paymentPerYear = [];
  dummyDetail = [
    {
      paid: '1 034 438',
      payment: '946 483',
      total_terms: '943 743',
      no_schedule: '848 383',
    },
    {
      paid: '849 383',
      payment: '926 334',
      total_terms: '819 483',
      no_schedule: '701 473',
    },
    {
      paid: '',
      payment: '',
      total_terms: '',
      no_schedule: '',
    },
  ];
  dummyData = ['655 432', '294 747', ''];
  listOfSchool = ['EFAP', 'ICART', 'EFJ', 'BRASSART'];
  amcharts = '../../../../../assets/img/amcharts.png';
  maleIcon = '../../../../../assets/img/student_icon.png';
  femaleIcon = '../../../../../assets/img/student_icon_fem.png';
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  currentUserTypeId: any;
  isPermission: any;
  constructor(
    private pageTitleService: PageTitleService,
    private dashboardService: AdmissionDashboardService,
    private candidateService: CandidatesService,
    private userService: AuthService,
    private fb: UntypedFormBuilder,
    private permissionsService: NgxPermissionsService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    // let name = this.translate.instant('Dashboard') + ' / ' + this.translate.instant('Comparative');
    // this.pageTitleService.setTitle(name);
    // this.pageTitleService.setIcon('dashboard');
    // this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    //   name = this.translate.instant('Dashboard') + ' / ' + this.translate.instant('Comparative');
    //   this.pageTitleService.setTitle(name);
    //   this.pageTitleService.setIcon('dashboard');
    // });
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.isMemberAdmission = !!this.permissionsService.getPermission('Member Admission');
    this.isOperator = !!this.permissionsService.getPermission('Operator');

    this.isPermission = this.userService.getPermission();
    this.currentUser = this.userService.getLocalStorageUser();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    this.getCurrentUser();
    this.getPaymentPerYear();
    this.filteredSchool = this.schoolList;
    this.subs.sink = this.dashboardService.resetData.subscribe((val: any) => {
      if (val) {
        this.dashboardService.setResetStatus(false);
        this.mentorSelected(this.dataMentor);
      }
    });
  }

  getPaymentPerYear() {
    this.dashboardService.getSummaryPaymentPerYear().subscribe((resp) => {
      this.paymentPerYear = resp;
      console.log('paymentPerYear :: ', this.paymentPerYear);
    });
  }

  formatCurrency(data: number) {
    let num = '0';
    if (data) {
      num = data.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ');
      num = num.toString().slice(0, -3);
    }
    return num;
  }

  getSchoolPaymentSummary(school: string, index: number) {
    let payment = 0;
    if (this.paymentPerYear[index] && this.paymentPerYear[index].schools) {
      const schoolPaymentFound = this.paymentPerYear[index].schools.find((sch) => sch.school.toLowerCase() === school.toLowerCase());
      if (schoolPaymentFound) {
        payment = schoolPaymentFound.total_paid;
      }
    }
    return this.formatCurrency(payment);
  }

  getOverallTotal() {
    let total = 0;
    this.dataMapping.forEach((chart) => {
      total = total + chart.total_registered;
    });
    return this.formatCurrency(total);
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

  getGeneralData() {
    this.dataMapping = [];
    const name = this.menSelected && this.menSelected._id ? this.menSelected._id : '';
    this.short_name = name;
    this.dataMemberSelected = this.menSelected ? this.menSelected : '';
    console.log('this.menSelected dashboard payment ', this.menSelected);
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
        console.log('dataMapping ', this.dataMapping);
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
        ' ' +
        (data.first_name ? data.first_name : '') +
        ' ' +
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
}
