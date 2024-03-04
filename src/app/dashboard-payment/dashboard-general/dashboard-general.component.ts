import {
  Component,
  Input,
  OnInit,
  ɵbypassSanitizationTrustStyle,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  NgZone,
  PLATFORM_ID,
  Inject,
  ChangeDetectorRef,
  AfterContentChecked,
  AfterViewChecked,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { SubSink } from 'subsink';
import { PageTitleService } from '../../core/page-title/page-title.service';
import * as _ from 'lodash';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { isPlatformBrowser } from '@angular/common';
import am4themes_dark from '@amcharts/amcharts4/themes/dark';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FinancesService } from 'app/service/finance/finance.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-dashboard-general',
  templateUrl: './dashboard-general.component.html',
  styleUrls: ['./dashboard-general.component.scss'],
})
export class DashboardGeneralComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit, AfterViewChecked {
  today: Date;
  @Input() schoolData: any;
  @Input() dataMapping: any;
  @Input() dataMemberSelected: any;
  @Input() shortName = '';
  private subs = new SubSink();

  schoolsFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  levelFilter = new UntypedFormControl(null);
  scholarFilter = new UntypedFormControl(null);
  memberFilter = new UntypedFormControl(null);
  listCampus = [];
  scrollVertical = 0;
  scrollHorizontal = 0;
  dataGeneral: any;
  dataCampus = [];
  dataCampusIsNull = [];
  fullDataUser;
  campusConnected;
  dataLevel = [];
  dataWeekly = [];
  dataRegion = [];
  dataObjectiv = [];
  currentUser;
  isDirectorAdmission = false;
  isMemberAdmission = false;
  isLoading = false;
  floatingActif = false;
  campusList = [];
  listObjective = [];
  levels = [];
  school = [];
  scholars = [];
  devMember = [];
  scroll: any;
  subDataCampus = {
    level: '',
    school: '',
    total_registered: null,
    total_target: null,
    percentage_total: null,
  };
  subDataWeekly = {
    last_date_of_week: '',
    target_total_accumulated_by_end_of_week: null,
    registration_accumulated_up_today: null,
    registration_this_week: null,
    percentage_registration_target_accumulated: null,
    percentage_progress_previous_week: null,
    registration_accumulated_before_week: null,
  };
  mentorList: any[] = [];
  oroginMentorList: any[] = [];
  filterValues = {
    school: '',
    campus: '',
    level: '',
  };
  filterAdmission = {
    school: '',
    campus: '',
    level: '',
    admission_member_id: '',
    scholar_season: '',
  };
  filterForDisplay = {
    school: '',
    campus: '',
    level: '',
    admission_member_id: '',
    scholar_season: '',
  };
  isPermission: string[];
  currentUserTypeId: any;
  constructor(
    private pageTitleService: PageTitleService,
    private admissionService: AdmissionDashboardService,
    private translate: TranslateService,
    private userService: AuthService,
    private permissionsService: NgxPermissionsService,
    private candidatesService: CandidatesService,
    private rncpTitleService: RNCPTitlesService,
    private _ref: ChangeDetectorRef,
    private financeService: FinancesService,
  ) {}

  ngOnInit() {
    this.getDataScholarSeasons();
    this._ref.detectChanges();
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.isMemberAdmission = !!this.permissionsService.getPermission('Member Admission');
    this.today = new Date();
    this.subs.sink = this.rncpTitleService.getScrollEvent$.subscribe((resp) => {
      if (!this.isLoading) {
        this.scroll = resp;
        if (this.scroll) {
          if (this.scroll.target && this.scroll.target.scrollTop >= 138 && this.scroll.target.scrollTop < 1263) {
            this.floatingActif = true;
          } else {
            this.floatingActif = false;
          }
        }
      }
    });
    this.getAllGeneralDashboardForChart();
    this.getDataLevelEngagement();
    this.getDataWeeklyProgress();
    this.getDevMember();

  }

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasons().subscribe((resp) => {
      if (resp && resp.length) {
        console.log('Data', resp);
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

  ngOnChanges() {
    if (this.shortName) {
      this.filterAdmission.admission_member_id = this.shortName;
      this.filterForDisplay.admission_member_id = this.dataMemberSelected
        ? (this.dataMemberSelected.civility && this.dataMemberSelected.civility !== 'neutral'
            ? this.translate.instant(this.dataMemberSelected.civility)
            : '') +
          ' ' +
          (this.dataMemberSelected.first_name ? this.dataMemberSelected.first_name : '') +
          ' ' +
          (this.dataMemberSelected.last_name ? this.dataMemberSelected.last_name : '') +
          ' '
        : '';
      this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.filterForDisplay.admission_member_id = this.dataMemberSelected
          ? (this.dataMemberSelected.civility && this.dataMemberSelected.civility !== 'neutral'
              ? this.translate.instant(this.dataMemberSelected.civility)
              : '') +
            ' ' +
            (this.dataMemberSelected.first_name ? this.dataMemberSelected.first_name : '') +
            ' ' +
            (this.dataMemberSelected.last_name ? this.dataMemberSelected.last_name : '') +
            ' '
          : '';
      });
      this.getDataWeeklyProgress();
      this.getAllGeneralDashboardForChart();
    }
    this._ref.detectChanges();
  }
  translateDate() {
    return moment(this.today, 'DD/MM/YYYY').format('DD/MM/YYYY');
  }

  ngAfterViewInit() {
    this._ref.detectChanges();
  }

  ngAfterViewChecked() {
    this._ref.detectChanges();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getDataForList(scholar_season_id) {
    console.log(scholar_season_id);
    if (this.isDirectorAdmission) {
      const name =
        this.currentUser && this.currentUser.entities && this.currentUser.entities[0] ? this.currentUser.entities[0].candidate_school : '';
      this.subs.sink = this.candidatesService
        .GetAllCandidateSchoolByScholarSeason(scholar_season_id, this.currentUserTypeId)
        .subscribe((resp) => {
          if (resp) {
            this.listObjective = resp;
            this.school = this.listObjective;
            this.getDataCampus();
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
        this.dataMemberSelected && this.dataMemberSelected.entities && this.dataMemberSelected.entities[0]
          ? this.dataMemberSelected.entities[0].candidate_school
          : '';
      this.subs.sink = this.candidatesService
        .GetAllCandidateSchoolByScholarSeason(scholar_season_id, this.currentUserTypeId)
        .subscribe((resp) => {
          if (resp) {
            this.listObjective = resp;
            this.school = this.listObjective;
            this.getDataCampus();
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

  getAllGeneralDashboardForChart() {
    this.dataObjectiv = [];
    this.isLoading = true;
    const name = this.cleanFilterDataAdmission();
    this.subs.sink = this.admissionService.GetAllGeneralDashboardFinanceDashboards(name).subscribe((resps) => {
      if (resps && resps.length) {
        const dataResult = _.cloneDeep(resps);
        this.dataObjectiv = _.cloneDeep(resps);
        console.log('Data Objective ', resps);
        console.log('Data School ', this.schoolData);
        if (this.filterAdmission.school || this.filterAdmission.campus || this.filterAdmission.level) {
          if (this.filterAdmission.school && !(this.filterAdmission.level || this.filterAdmission.campus)) {
            const schoolSelected = dataResult.filter((list) => {
              return list.school.toLowerCase() === this.filterAdmission.school.toLowerCase();
            });
            const arrayTemps = [];
            if (schoolSelected && schoolSelected[0] && schoolSelected[0].levels && schoolSelected[0].levels.length) {
              schoolSelected[0].levels.forEach((temp) => {
                const levelData = temp.campuses.map((temps) => {
                  return {
                    level: temp.name,
                    school: temps.name,
                    total_registered: temps.total_paid,
                    total_target: temps.total_target,
                    percentage_total: temps.percentage,
                  };
                });
                arrayTemps.push(...levelData);
              });
            }
            const folders = _.chain(arrayTemps)
              .groupBy('school')
              .map((value, key) => ({
                name: key,
                campuses: value,
              }))
              .value();
            const finalResult = [];
            folders.forEach((element) => {
              this.subDataCampus = {
                level: '',
                school: '',
                total_registered: null,
                total_target: null,
                percentage_total: null,
              };
              element.campuses.forEach((list) => {
                this.subDataCampus.level = list.level;
                this.subDataCampus.school = list.school;
                this.subDataCampus.total_registered += parseInt(list.total_registered);
                this.subDataCampus.total_target += parseInt(list.total_target);
                this.subDataCampus.percentage_total += parseInt(list.percentage_total);
              });
              finalResult.push(this.subDataCampus);
            });
            this.dataObjectiv = finalResult;
            console.log('Data After Mapping ', arrayTemps, finalResult);
          } else if (this.filterAdmission.school && this.filterAdmission.campus && !this.filterAdmission.level) {
            this.dataObjectiv = [];
            const schoolSelected = dataResult.filter((list) => {
              return list.school.toLowerCase() === this.filterAdmission.school.toLowerCase();
            });
            const schoolSelecteds = this.schoolData.filter((list) => {
              return list.short_name.toLowerCase() === this.filterAdmission.school.toLowerCase();
            });
            const arrayTemps = [];
            if (schoolSelected && schoolSelected[0] && schoolSelected[0].levels && schoolSelected[0].levels.length) {
              schoolSelected[0].levels.forEach((temp) => {
                const levelData = temp.campuses.map((temps) => {
                  return {
                    level: temp.name,
                    school: temps.name,
                    total_registered: temps.total_paid,
                    total_target: temps.total_target,
                    percentage_total: temps.percentage,
                  };
                });
                arrayTemps.push(...levelData);
              });
            }
            const dataArrays = [];
            if (schoolSelecteds[0].levels) {
              schoolSelecteds[0].levels.forEach((element) => {
                const data = arrayTemps
                  .filter((list) => list.level.toLowerCase() === element.name.toLowerCase())
                  .map((temp) => {
                    return {
                      level: temp.level,
                      school: temp.school + ' - ' + (parseInt(temp.level) ? 'GE ' + temp.level : temp.level),
                      total_registered: temp.total_registered,
                      total_target: temp.total_target,
                      percentage_total: temp.percentage_total,
                    };
                  });
                dataArrays.push(...data);
              });
            }
            this.dataObjectiv = dataArrays;
            console.log('dataArrays', dataArrays, this.dataObjectiv);
          } else if (this.filterAdmission.school && this.filterAdmission.campus && this.filterAdmission.level) {
            this.dataObjectiv = [];
            const schoolSelected = dataResult.filter((list) => {
              return list.school.toLowerCase() === this.filterAdmission.school.toLowerCase();
            });
            const schoolSelecteds = this.schoolData.filter((list) => {
              return list.short_name.toLowerCase() === this.filterAdmission.school.toLowerCase();
            });
            const arrayTemps = [];
            if (schoolSelected && schoolSelected[0] && schoolSelected[0].levels && schoolSelected[0].levels.length) {
              schoolSelected[0].levels.forEach((temp) => {
                const levelData = temp.campuses.map((temps) => {
                  return {
                    level: temp.name,
                    school: temps.name,
                    total_registered: temps.total_paid,
                    total_target: temps.total_target,
                    percentage_total: temps.percentage,
                  };
                });
                arrayTemps.push(...levelData);
              });
            }
            const dataArrays = [];
            if (schoolSelecteds[0].levels) {
              schoolSelecteds[0].levels.forEach((element) => {
                const data = arrayTemps
                  .filter((list) => list.level.toLowerCase() === element.name.toLowerCase())
                  .map((temp) => {
                    return {
                      level: temp.level,
                      school: temp.school + ' - ' + (parseInt(temp.level) ? 'GE ' + temp.level : temp.level),
                      total_registered: temp.total_registered,
                      total_target: temp.total_target,
                      percentage_total: temp.percentage_total,
                    };
                  });
                dataArrays.push(...data);
              });
            }
            this.dataObjectiv = dataArrays;
            console.log('dataArrays', dataArrays);
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

  getDataLevelEngagement() {
    this.dataLevel = [];
    this.dataRegion = this.dataMapping;
    const name = this.cleanFilterData();
    this.subs.sink = this.admissionService.GetAllEngagementLevelCalculations(name).subscribe((resp) => {
      if (resp) {
        const data = resp.filter((temp) => temp.total_count !== 0);
        if (data && data.length) {
          this.dataLevel = resp;
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

  resetFilter() {
    if (!this.isMemberAdmission) {
      this.admissionService.setResetStatus(true);
    }
    this.campusFilter.setValue(null);
    this.levelFilter.setValue(null);
    this.scholarFilter.setValue(null);
    this.schoolsFilter.setValue(null);
    this.filterValues = {
      school: '',
      campus: '',
      level: '',
    };
    this.filterAdmission = {
      school: '',
      campus: '',
      level: '',
      admission_member_id: '',
      scholar_season: '',
    };
    this.filterForDisplay = {
      school: '',
      campus: '',
      level: '',
      admission_member_id: '',
      scholar_season: '',
    };
    this.getDataLevelEngagement();
    this.getDataWeeklyProgress();
    this.getAllGeneralDashboardForChart();
  }

  getDataWeeklyProgress() {
    this.dataWeekly = [];
    this.isLoading = true;
    const name = this.cleanFilterDataAdmission();
    console.log('Filter Weekly : ', name);
    const endMonth = moment().endOf('month').format('DD/MM/YYYY');
    this.subs.sink = this.admissionService.GeneralDashboardFinance(name).subscribe((resp) => {
      if (resp && resp.length) {
        let allMapping = [];
        resp.forEach((element) => {
          const dataMapping = element.weekly_progresses.map((listProgress) => {
            return {
              last_date_of_week: listProgress.last_date_of_week,
              percentage_registration_target_accumulated: listProgress.percentage_payment_target_accumulated,
              registration_accumulated_up_today: listProgress.payment_accumulated_up_today,
              registration_this_week: listProgress.payment_this_week,
              target_total_accumulated_by_end_of_week: listProgress.target_total_accumulated_by_end_of_week,
              week_number: listProgress.week_number,
              percentage_progress_previous_week: listProgress.percentage_progress_previous_week,
              registration_accumulated_before_week: listProgress.payment_accumulated_before_week,
            };
          });
          allMapping.push(...dataMapping);
        });
        allMapping = _.chain(allMapping)
          .groupBy('last_date_of_week')
          .map((value, key) => ({
            last_date_of_week: key,
            data_progress: value,
          }))
          .value();
        const finalResult = [];
        allMapping.forEach((element) => {
          this.subDataWeekly = {
            last_date_of_week: '',
            percentage_registration_target_accumulated: null,
            registration_this_week: null,
            target_total_accumulated_by_end_of_week: null,
            registration_accumulated_up_today: null,
            percentage_progress_previous_week: null,
            registration_accumulated_before_week: null,
          };
          element.data_progress.forEach((list) => {
            this.subDataWeekly.last_date_of_week = list.last_date_of_week;
            this.subDataWeekly.percentage_registration_target_accumulated += parseInt(list.percentage_registration_target_accumulated);
            this.subDataWeekly.registration_this_week += parseInt(list.registration_this_week);
            this.subDataWeekly.target_total_accumulated_by_end_of_week += parseInt(list.target_total_accumulated_by_end_of_week);
            this.subDataWeekly.registration_accumulated_up_today += parseInt(list.registration_accumulated_up_today);
            this.subDataWeekly.percentage_progress_previous_week += parseInt(list.percentage_progress_previous_week);
            this.subDataWeekly.registration_accumulated_before_week += parseInt(list.registration_accumulated_before_week);
          });
          finalResult.push(this.subDataWeekly);
        });
        const today = moment();
        const index = finalResult.findIndex((x) => moment(x.last_date_of_week, 'DD-MM-YYYY').isSame(moment(endMonth, 'DD-MM-YYYY')));
        const monthNew = finalResult.filter((temp) => {
          const dates = moment(temp.last_date_of_week, 'DD-MM-YYYY');
          return dates.isAfter(moment(endMonth, 'DD-MM-YYYY'));
        });
        console.log(monthNew);
        if (monthNew && monthNew.length) {
          monthNew.forEach((element) => {
            finalResult[index].registration_accumulated_up_today += element.registration_this_week;
          });
        }
        const from_date = today.add(1, 'weeks').toString();
        const from_dates = moment(from_date).format('DD/MM/YYYY');
        const thisWeek = moment(from_dates, 'DD-MM-YYYY');
        console.log('from_date', thisWeek);
        this.dataWeekly = finalResult.filter((temp) => {
          const dates = moment(temp.last_date_of_week, 'DD-MM-YYYY');
          // console.log(dates, dates.isBefore(thisWeek), dates.isSame(moment(endMonth, 'DD-MM-YYYY')));
          return dates.isBefore(thisWeek) || dates.isSame(moment(endMonth, 'DD-MM-YYYY'));
        });
        // const currentWeek = finalResult.filter((temp) => {
        //   const dates = moment(temp.last_date_of_week, 'DD-MM-YYYY');
        //   console.log(dates.isSame(thisWeek));
        //   return dates.isSame(moment('31-03-2021', 'DD-MM-YYYY'));
        // });
        // if (currentWeek && currentWeek.length) {
        //   this.dataWeekly.push(currentWeek[0])
        // }
        this.isLoading = false;
        // console.log('finalResult', finalResult, allMapping, this.dataWeekly, moment(endMonth, 'DD-MM-YYYY'));
      } else {
        this.isLoading = false;
        this.dataWeekly = [];
      }
    }, (err) => {
      this.isLoading = false
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

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filterValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  cleanFilterDataAdmission() {
    const filterData = _.cloneDeep(this.filterAdmission);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  getDataCampus() {
    this.isLoading = true;
    this.levels = [];
    this.campusList = [];
    this.filterValues.campus = '';
    this.filterValues.level = '';
    this.filterAdmission.campus = '';
    this.filterAdmission.level = '';
    this.filterForDisplay.campus = '';
    this.filterForDisplay.level = '';
    this.campusFilter.setValue(null);
    this.levelFilter.setValue(null);
    if (this.dataMemberSelected && this.dataMemberSelected.entities) {
      this.dataMemberSelected.entities.forEach((element) => {
        this.listObjective.filter((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.filter((campuses, nex) => {
              if (
                campuses &&
                element &&
                element.campus &&
                element.campus.name &&
                campuses.name.toLowerCase() === element.campus.name.toLowerCase()
              ) {
                this.campusList.push(campuses);
              }
            });
          }
        });
      });
      const school = this.schoolsFilter.value;
      this.getDataLevel();
      this.filterValues.school = school;
      this.filterAdmission.school = school;
      this.filterForDisplay.school = school;
      this.getDataLevelEngagement();
      this.getDataWeeklyProgress();
      this.getAllGeneralDashboardForChart();
    } else {
      if (this.schoolsFilter.value) {
        const school = this.schoolsFilter.value;
        const scampusList = this.listObjective.filter((list) => {
          return school.includes(list.short_name);
        });
        scampusList.filter((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.filter((campuses, nex) => {
              this.campusList.push(campuses);
            });
          }
        });
        this.getDataLevel();
        this.filterValues.school = school;
        this.filterAdmission.school = school;
        this.filterForDisplay.school = school;
        this.getDataLevelEngagement();
        this.getDataWeeklyProgress();
        this.getAllGeneralDashboardForChart();
      } else {
        this.filterValues.school = '';
        this.filterAdmission.school = '';
        this.filterForDisplay.school = '';
        this.getDataLevelEngagement();
        this.getDataWeeklyProgress();
        this.getAllGeneralDashboardForChart();
      }
    }

    this.campusList = _.uniqBy(this.campusList, 'name');
  }

  getDataLevel() {
    this.isLoading = true;
    this.levels = [];
    this.filterValues.level = '';
    this.filterAdmission.level = '';
    this.filterForDisplay.level = '';
    this.levelFilter.setValue(null);
    const sCampus = this.campusFilter.value;
    if (this.campusFilter.value) {
      const sLevelList = this.campusList.filter((list) => {
        return sCampus.includes(list.name);
      });
      sLevelList.forEach((element) => {
        if (element && element.levels && element.levels.length) {
          element.levels.forEach((level) => {
            this.levels.push(level);
          });
        }
      });
      this.filterValues.campus = sCampus;
      this.filterAdmission.campus = sCampus;
      this.filterForDisplay.campus = sCampus;
      this.getDataLevelEngagement();
      this.getDataWeeklyProgress();
      this.getAllGeneralDashboardForChart();
    } else {
      this.filterValues.campus = '';
      this.filterAdmission.campus = '';
      this.filterForDisplay.campus = '';
      this.getDataLevelEngagement();
      this.getDataWeeklyProgress();
      this.getAllGeneralDashboardForChart();
    }
    this.levels = _.uniqBy(this.levels, 'name');
  }

  getDataByLevel() {
    this.isLoading = true;
    const level = this.levelFilter.value;
    if (this.levelFilter.value) {
      this.filterValues.level = level;
      this.filterAdmission.level = level;
      this.filterForDisplay.level = level;
      this.getDataLevelEngagement();
      this.getDataWeeklyProgress();
      this.getAllGeneralDashboardForChart();
    } else {
      this.filterValues.level = '';
      this.filterAdmission.level = '';
      this.filterForDisplay.level = '';
      this.getDataLevelEngagement();
      this.getDataWeeklyProgress();
      this.getAllGeneralDashboardForChart();
    }
  }

  scholarSelected() {
    this.isLoading = true;
    const level = this.scholarFilter.value;
    if (this.scholarFilter.value) {
      this.filterAdmission.scholar_season = level;
      this.filterForDisplay.scholar_season = level;
      this.getDataWeeklyProgress();
      this.getAllGeneralDashboardForChart();
      this.getDataForList(level);
    } else {
      this.filterAdmission.scholar_season = '';
      this.filterForDisplay.scholar_season = '';
      this.getDataWeeklyProgress();
      this.getAllGeneralDashboardForChart();
    }
  }

  getDataByMember() {
    const member = this.memberFilter.value;
    if (this.memberFilter.value) {
      this.filterAdmission.admission_member_id = member;
      this.getDataWeeklyProgress();
      this.getAllGeneralDashboardForChart();
    } else {
      this.filterAdmission.admission_member_id = '';
      this.getDataWeeklyProgress();
      this.getAllGeneralDashboardForChart();
    }
  }
  getDevMember() {
    if (this.isDirectorAdmission) {
      const school = this.currentUser && this.currentUser.entities ? this.currentUser.entities[0].candidate_school : '';
      const campus = this.campusConnected && this.campusConnected.length ? this.campusConnected : '';
      this.subs.sink = this.candidatesService.getAllMemberByDirector(campus, school).subscribe((resp) => {
        if (resp) {
          const response = _.cloneDeep(resp);
          const list = response.map((temp) => {
            return {
              name:
                (temp.civility ? temp.civility : '') +
                ' ' +
                (temp.first_name ? temp.first_name : '') +
                ' ' +
                (temp.last_name ? temp.last_name : ''),
              id: temp._id,
            };
          });
          this.mentorList = list;
          this.mentorList = this.mentorList.sort((a, b) => (a.name > b.name ? 1 : -1));
          this.oroginMentorList = this.mentorList.sort((a, b) => (a.name > b.name ? 1 : -1));
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
      this.subs.sink = this.candidatesService.getAllMemberAdmission().subscribe((resp) => {
        if (resp) {
          let response = _.cloneDeep(resp);
          if (this.isMemberAdmission && this.currentUser && this.currentUser._id) {
            response = response.filter((member) => member._id === this.currentUser._id);
          }
          const list = response.map((temp) => {
            return {
              name:
                (temp.civility ? temp.civility : '') +
                ' ' +
                (temp.first_name ? temp.first_name : '') +
                ' ' +
                (temp.last_name ? temp.last_name : ''),
              id: temp._id,
            };
          });
          this.mentorList = list;
          this.mentorList = this.mentorList.sort((a, b) => (a.name > b.name ? 1 : -1));
          this.oroginMentorList = this.mentorList.sort((a, b) => (a.name > b.name ? 1 : -1));
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
}
