import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  AfterViewChecked,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { SubSink } from 'subsink';
import { PageTitleService } from '../../core/page-title/page-title.service';
import * as _ from 'lodash';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { CoreService } from 'app/service/core/core.service';
import { ChartDailyDashboardComponent } from '../chart-daily/chart-daily.component';
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
  @Output() reset = new EventEmitter(false);
  @Output() waitingForResponse = new EventEmitter(false);
  @Output() dataLevelEngagementLoading = new EventEmitter(false);
  @Output() loadingNationalityChart = new EventEmitter(false);
  @Output() loadingObjectiveChart = new EventEmitter(false);
  @Output() loadingWeeklyChart = new EventEmitter(false);
  @ViewChild('chartDaily', { static: false }) chartDaily: ChartDailyDashboardComponent;
  private subs = new SubSink();

  schoolsFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  levelFilter = new UntypedFormControl(null);
  scholarFilter = new UntypedFormControl(null);
  memberFilter = new UntypedFormControl(null);
  sectorFilter = new UntypedFormControl(null);
  specialityFilter = new UntypedFormControl(null);
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
  dataNationality = [];
  dataObjective = [];
  dataDaily = [];
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
  sector = [];
  speciality = [];
  scroll: any;
  subDataCampus = {
    level: '',
    school: '',
    total_registered: null,
    total_target: null,
    percentage_total: null,
  };
  subDataWeekly = {
    total_target: null,
    percentage: null,
    last_date_of_week: '',
    registration_this_week: null,
  };
  mentorList: any[] = [];
  oroginMentorList: any[] = [];
  filterAdmission = {
    school: '',
    campus: '',
    level: '',
    admission_member_id: '',
    scholar_season: '',
    sector: '',
    speciality: '',
    is_speciality: false,
  };
  filterForDisplay = {
    school: '',
    campus: '',
    level: '',
    admission_member_id: '',
    scholar_season: '',
    sector: '',
    speciality: '',
  };

  isSpecialityNone = false;

  scholarSeason: any;
  isPermission: any;
  currentUserTypeId: any;
  isWaitingForResponse = false;
  isGetDataLevelEngagementLoading = false;
  isLoadingNationalityChart = false;
  isLoadingObjectiveChart = false;
  isLoadingWeeklyChart = false;

  constructor(
    private pageTitleService: PageTitleService,
    private admissionService: AdmissionDashboardService,
    private translate: TranslateService,
    private userService: AuthService,
    private permissionsService: NgxPermissionsService,
    private candidatesService: CandidatesService,
    private rncpTitleService: RNCPTitlesService,
    public coreService: CoreService,
    private _ref: ChangeDetectorRef,
    private financeService: FinancesService,
  ) {}

  ngOnInit() {
    this._ref.detectChanges();
    this.isPermission = this.userService.getPermission();
    this.currentUser = this.userService.getLocalStorageUser();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Admission Director');
    this.isMemberAdmission = !!this.permissionsService.getPermission('Admission Member');
    this.today = new Date();
    this.subs.sink = this.rncpTitleService.getScrollEvent$.subscribe(
      (resp) => {
        if (!this.isLoading) {
          this.scroll = resp;
          if (this.scroll) {
            if (this.scroll.target && this.scroll.target.scrollTop >= 138 && this.scroll.target.scrollTop < 1450) {
              this.floatingActif = true;
            } else {
              this.floatingActif = false;
            }
          }
        }
      },
      (err) => {
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
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
    this.listenScholarSeasonFilter();
    this.getDataLevelEngagement();
    this.getDataForWeeklyChart('onInit');
    this.getDataForObjectiveChart();
    this.getDataForNationalityChart();
    this.getRegisteredCandidatePerDay();
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
      this.getDataForWeeklyChart('onchanges');
      this.getDataForObjectiveChart();
      this.getDataForNationalityChart();
      this.getRegisteredCandidatePerDay();
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

  // Listen scholar season selected from parent through services
  listenScholarSeasonFilter() {
    this.subs.sink = this.admissionService.scholarSeason.subscribe((resp) => {
      if (resp) {
        this.scholarSeason = _.cloneDeep(resp);
        this.scholarFilter.patchValue(resp._id);
        this.scholarSelected();
      } else {
        this.scholarFilter.patchValue(null);
        this.scholarSelected();
      }
    });
  }

  getDataLevelEngagement() {
    this.isGetDataLevelEngagementLoading = true;
    this.dataLevelEngagementLoading.emit(true);
    this.dataLevel = [];
    this.dataRegion = this.dataMapping;
    const name = this.cleanFilterDataAdmission();
    this.subs.sink = this.admissionService.GetAllEngagementLevel(name, this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp && resp.length) {
          const response = _.cloneDeep(resp);
          const available = response.filter((school) => school._id !== null || school._id);
          const forMap = [];
          available.forEach((level) => {
            if (level) {
              const total_registered = level.candidate_admission_statuses.find(
                (element) => element.candidate_admission_status === 'registered',
              );
              const total_admitted = level.candidate_admission_statuses.find(
                (element) => element.candidate_admission_status === 'admission_in_progress',
              );
              const total_engaged = level.candidate_admission_statuses.find((element) => element.candidate_admission_status === 'engaged');
              const total_resigned = level.candidate_admission_statuses.find(
                (element) => element.candidate_admission_status === 'resigned',
              );
              const total_resigned_after_registered = level.candidate_admission_statuses.find(
                (element) => element.candidate_admission_status === 'resigned_after_registered',
              );

              level.total_registered = total_registered.count;
              level.total_admitted = total_admitted.count;
              level.total_engaged = total_engaged.count;
              level.total_resigned = total_resigned.count;
              level.total_resigned_after_registered = total_resigned_after_registered.count;
              forMap.push(level);
            }
          });
          const dtaLevel = [
            {
              engagement_level: 'registered',
              total_count: 0,
            },
            {
              engagement_level: 'engaged',
              total_count: 0,
            },
            {
              engagement_level: 'admission_in_progress',
              total_count: 0,
            },
            {
              engagement_level: 'resigned',
              total_count: 0,
            },
            {
              engagement_level: 'resigned_after_registered',
              total_count: 0,
            },
          ];
          dtaLevel.forEach((item) => {
            forMap.forEach((school) => {
              if (item.engagement_level === 'admission_in_progress') {
                item.total_count += school.total_admitted;
              }
              if (item.engagement_level === 'engaged') {
                item.total_count += school.total_engaged;
              }
              if (item.engagement_level === 'registered') {
                item.total_count += school.total_registered;
              }
              if (item.engagement_level === 'resigned') {
                item.total_count += school.total_resigned;
              }
              if (item.engagement_level === 'resigned_after_registered') {
                item.total_count += school.total_resigned_after_registered;
              }
            });
          });
          this.dataLevel = _.cloneDeep(dtaLevel);
          this.isGetDataLevelEngagementLoading = false;
          this.dataLevelEngagementLoading.emit(false);
        } else {
          this.isGetDataLevelEngagementLoading = false;
          this.dataLevelEngagementLoading.emit(false);
        this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.dataLevelEngagementLoading.emit(false);
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
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getDataForNationalityChart() {
    this.dataNationality = [];
    this.isLoadingNationalityChart = true;
    this.loadingNationalityChart.emit(true);
    const scholarSeason = this.filterAdmission.scholar_season ? this.filterAdmission.scholar_season : null;
    const school = this.filterAdmission.school ? this.filterAdmission.school : null;
    const campus = this.filterAdmission.campus ? this.filterAdmission.campus : null;
    const level = this.filterAdmission.level ? this.filterAdmission.level : null;
    const sector = this.filterAdmission.sector ? this.filterAdmission.sector : null;
    const speciality = this.filterAdmission.speciality ? this.filterAdmission.speciality : null;
    const is_speciality = this.isSpecialityNone ? false : null;
    this.subs.sink = this.admissionService
      .GetCountCandidatePerNationality(scholarSeason, school, campus, level, sector, speciality, this.currentUserTypeId, is_speciality)
      .subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.dataNationality = _.cloneDeep(resp);
            console.log('!! data nationality', this.dataNationality);
          } else {
            this.dataNationality = [];
          }
          this.isLoadingNationalityChart = false;
          this.loadingNationalityChart.emit(false);
        },
        (err) => {
          this.loadingNationalityChart.emit(false);
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
          }
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }

  getDataForObjectiveChart() {
    this.isLoadingObjectiveChart = true;
    this.loadingObjectiveChart.emit(true);
    const scholarSeason = this.filterAdmission.scholar_season ? this.filterAdmission.scholar_season : null;
    const school = this.filterAdmission.school ? this.filterAdmission.school : null;
    const campus = this.filterAdmission.campus ? this.filterAdmission.campus : null;
    const level = this.filterAdmission.level ? this.filterAdmission.level : null;
    const sector = this.filterAdmission.sector ? this.filterAdmission.sector : null;
    const speciality = this.filterAdmission.speciality ? this.filterAdmission.speciality : null;
    const is_speciality = this.isSpecialityNone ? false : null;
    this.subs.sink = this.admissionService
      .getTotalRegisteredCandidate(scholarSeason, school, campus, level, sector, speciality, this.currentUserTypeId, is_speciality)
      .subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.dataObjective = resp;
          } else {
            this.dataObjective = [];
          }
          this.isLoadingObjectiveChart = false;
          this.loadingObjectiveChart.emit(false);
        },
        (err) => {
          this.loadingObjectiveChart.emit(false);
          this.dataObjective = [];
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
          }
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }

  getDataForWeeklyChart(from?) {
    this.isLoadingWeeklyChart = true;
    this.loadingWeeklyChart.emit(true);
    const scholarSeason = this.filterAdmission.scholar_season ? this.filterAdmission.scholar_season : null;
    const school = this.filterAdmission.school ? this.filterAdmission.school : null;
    const campus = this.filterAdmission.campus ? this.filterAdmission.campus : null;
    const level = this.filterAdmission.level ? this.filterAdmission.level : null;
    const sector = this.filterAdmission.sector ? this.filterAdmission.sector : null;
    const speciality = this.filterAdmission.speciality ? this.filterAdmission.speciality : null;
    const is_speciality = this.isSpecialityNone ? false : null;
    this.subs.sink = this.admissionService
      .getRegisteredCandidatePerWeek(scholarSeason, school, campus, level, sector, speciality, this.currentUserTypeId, is_speciality)
      .subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.dataWeekly = _.cloneDeep(resp);
            // console.log('!! data dataWeekly', this.dataWeekly);
          }
          this.isLoadingWeeklyChart = false;
          this.loadingWeeklyChart.emit(false);
        },
        (err) => {
          this.loadingWeeklyChart.emit(false);
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
          }
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }

  getRegisteredCandidatePerDay() {
    // this.isWaitingForResponse = true;
    const scholarSeason = this.filterAdmission.scholar_season ? this.filterAdmission.scholar_season : null;
    const school = this.filterAdmission.school ? this.filterAdmission.school : null;
    const campus = this.filterAdmission.campus ? this.filterAdmission.campus : null;
    const level = this.filterAdmission.level ? this.filterAdmission.level : null;
    const sector = this.filterAdmission.sector ? this.filterAdmission.sector : null;
    const speciality = this.filterAdmission.speciality ? this.filterAdmission.speciality : null;
    const periode_start = this.chartDaily.start
      ? this.chartDaily.start
      : moment(moment().subtract(4, 'M'), 'DD/MM/YYYY').format('DD/MM/YYYY');
    const periode_end = this.chartDaily.end ? this.chartDaily.end : moment(moment(), 'DD/MM/YYYY').format('DD/MM/YYYY');
    const is_speciality = this.isSpecialityNone ? false : null;
    this.subs.sink = this.admissionService
      .GetRegisteredCandidatePerDay(
        scholarSeason,
        school,
        campus,
        level,
        sector,
        speciality,
        periode_start,
        periode_end,
        this.currentUserTypeId,
        is_speciality,
      )
      .subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          this.waitingForResponse.emit(false);
          if (resp && resp.length) {
            this.dataDaily = resp;
          }
        },
        (err) => {
          this.waitingForResponse.emit(false);
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
          }
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }

  reloadDaily(isReload) {
    if (isReload) {
      this.isWaitingForResponse = true;
      this.waitingForResponse.emit(true);
      this.getRegisteredCandidatePerDay();
    }
  }

  /*************** FLOW CASCADE OF GETTING DROPDOWN ON THE RIGHT *************************************/

  scholarSelected() {
    this.school = [];
    this.campusList = [];
    this.levels = [];
    this.sector = [];
    this.speciality = [];
    this.filterAdmission.school = '';
    this.filterAdmission.campus = '';
    this.filterAdmission.level = '';
    this.filterForDisplay.school = '';
    this.filterForDisplay.campus = '';
    this.filterForDisplay.level = '';
    this.filterAdmission.sector = '';
    this.filterForDisplay.sector = '';
    this.filterAdmission.speciality = '';
    this.filterForDisplay.speciality = '';
    this.schoolsFilter.setValue('');
    this.campusFilter.setValue('');
    this.levelFilter.setValue('');
    this.sectorFilter.setValue('');
    this.specialityFilter.setValue('');
    const level = this.scholarFilter.value;
    const scholarId = this.scholarSeason;
    if (this.scholarFilter.value) {
      this.filterAdmission.scholar_season = level;
      this.filterForDisplay.scholar_season = scholarId.scholar_season;
      this.getSchools(scholarId._id);
      // this.getDataForNationalityChart();
      // this.getRegisteredCandidatePerDay();
      // this.getDataForWeeklyChart();
      // this.getDataForObjectiveChart();
      this.refetchData('scholarselected');
    } else {
      this.filterAdmission.scholar_season = '';
      this.filterForDisplay.scholar_season = '';
      this.onClearScholar();
      // this.getDataForNationalityChart();
      // this.getRegisteredCandidatePerDay();
      // this.getDataForWeeklyChart();
      // this.getDataForObjectiveChart();
      this.refetchData('scholarselected else');
    }
  }

  onClearScholar() {
    this.school = [];
    this.campusList = [];
    this.levels = [];
    this.sector = [];
    this.speciality = [];
  }

  // SCHOOLS =========================
  getSchools(data?) {
    console.log('_check', this.isDirectorAdmission);

    if (this.isDirectorAdmission || this.isMemberAdmission) {
      // Grouping by school
      const list = _.chain(this.currentUser.entities[0].programs)
        // Group the elements of Array based on `school._id` property
        .groupBy('school._id')
        // `key` is group's name (school._id), `value` is the array of objects
        .map((value, key) => ({
          _id: key,
          campuses: _.chain(value)
            // Group the elements of Array based on `campus._id` property
            .groupBy('campus._id')
            // `key` is group's name (campus._id), `value` is the array of objects
            .map((values, keys) => ({
              _id: keys,
              levels: values.map((resp) => {
                return {
                  ...resp.level,
                };
              }),
            }))
            .value(),
        }))
        .value();

      const listName = _.chain(this.currentUser.entities[0].programs)
        // Group the elements of Array based on `school._id` property
        .groupBy('school.short_name')
        // `key` is group's name (school.short_name), `value` is the array of objects
        .map((value, key) => ({
          short_name: key,
          campuses: _.chain(value)
            // Group the elements of Array based on `campus.name` property
            .groupBy('campus.name')
            // `key` is group's name (campus.name), `value` is the array of objects
            .map((values, keys) => ({
              name: keys,
              levels: values.map((resp) => {
                return {
                  ...resp.level,
                };
              }),
            }))
            .value(),
        }))
        .value();
      list.forEach((ele1, index1) => {
        ele1['short_name'] = listName[index1].short_name;
        ele1.campuses.forEach((camp, indexCamp) => {
          camp['name'] = listName[index1].campuses[indexCamp].name;
        });
      });

      console.log('_lates', list);
      this.listObjective = list;
      this.school = this.listObjective;
      if (this.school.length === 1 && this.school[0]._id && this.school[0].short_name) {
        // Select index 0 if school length === 1 and patchvalue to filter and display
        this.schoolsFilter.patchValue(this.school[0]._id);
        this.filterAdmission.school = this.school[0]._id;
        this.filterForDisplay.school = this.school[0].short_name;

        // Get Campus list
        const scampusList = this.listObjective.find((list) => list._id === this.school[0]._id);
        console.log('_from single school, campus value', scampusList);
        scampusList.campuses.forEach((element) => {
          if (element && element._id && element.name) {
            this.campusList.push(element);
          }
        });

        // Check if campuslist length === 1
        if (this.campusList.length === 1 && this.campusList[0]._id && this.campusList[0].name) {
          // select index 0 if campus length === 0 and patch value (id) to form and (name) to display
          this.campusFilter.patchValue(this.campusList[0]._id);
          this.filterAdmission.campus = this.campusList[0]._id;
          this.filterForDisplay.campus = this.campusList[0].name;

          // Get level list
          const sLevelList = this.campusList.find((list) => list._id === this.campusList[0]._id);
          console.log('_From single campus, level value', sLevelList);
          sLevelList.levels.forEach((element) => {
            if (element && element._id && element.name) {
              this.levels.push(element);
            }
          });

          // check if levels length === 1
          if (this.levels.length === 1 && this.levels[0]._id && this.levels[0].name) {
            // select index 0 because levels length === 0 and patch to filter and
            this.levelFilter.patchValue(this.levels[0]._id);
            this.filterAdmission.level = this.levels[0]._id;
            this.filterForDisplay.level = this.levels[0].name;

            // get sectors dropdown
            this.getSectorsDropdown();
          } else {
            this.refetchData('else levels');
          }
        } else {
          this.refetchData();
        }
      }
    } else {
      const name = data ? data : '';
      const filter = 'filter: { scholar_season_id:' + `"${name}"` + '}';
      this.subs.sink = this.candidatesService.GetAllSchoolFilter(name, filter, this.currentUserTypeId).subscribe(
        (resp) => {
          if (resp) {
            console.log('Data Import => ', resp);
            this.listObjective = resp;
            this.school = this.listObjective;
          }
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
          }
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
  }

  getSectorsDropdown() {
    this.isLoading = true;
    const filter = {
      scholar_season_id: this.scholarFilter.value,
      candidate_school_ids: [this.schoolsFilter.value],
      campuses: [this.campusFilter.value],
      levels: [this.levelFilter.value],
    };
    this.subs.sink = this.financeService.GetAllSectorsDropdown(filter).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.isLoading = false;
          this.sector = resp;
          // check if sector length === 1
          if (this.sector.length === 1) {
            // patch value with index 0 since sector list only return 1
            this.sectorFilter.patchValue(this.sector[0]._id);
            this.filterAdmission.sector = this.sector[0]._id;
            this.filterForDisplay.sector = this.sector[0].name;

            // get speciality dropdown
            this.getSpecialityDropdown();
          } else {
            this.isLoading = false;
            this.refetchData('else sector');
          }
        }
      },
      (err) => {
        this.isLoading = false;
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
        }
        this.refetchData('error');
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getSpecialityDropdown() {
    this.isLoading = true;
    const filter = {
      scholar_season_id: this.scholarFilter.value,
      candidate_school_ids: [this.schoolsFilter.value],
      campuses: [this.campusFilter.value],
      levels: [this.levelFilter.value],
      sector: this.sectorFilter.value,
    };
    this.subs.sink = this.candidatesService.GetAllSpecializationsByScholar(filter).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.isLoading = false;
          this.speciality = resp;
          // check if speciality has length 1 will patch value
          if (this.speciality.length === 1) {
            // patch value index 0
            this.specialityFilter.patchValue(this.speciality[0]._id);
            this.filterAdmission.speciality = this.speciality[0]._id;
            this.filterForDisplay.speciality = this.speciality[0].name;

            this.refetchData('if speciality');
          } else {
            this.refetchData('else speciality');
          }
        } else {
          this.isLoading = false;
          this.speciality = [];
          this.refetchData('else else spec');
        }
      },
      (err) => {
        this.isLoading = false;
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
        }
        this.refetchData('error spec');
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  refetchData(from?) {
    this.getDataLevelEngagement();
    this.getDataForNationalityChart();
    this.getDataForWeeklyChart(from);
    this.getRegisteredCandidatePerDay();
    this.getDataForObjectiveChart();
  }

  onClearSchool() {
    this.campusList = [];
    this.levels = [];
    this.sector = [];
    this.speciality = [];
  }

  // CAMPUS ==========================

  getDataCampus() {
    this.levels = [];
    this.campusList = [];
    this.sector = [];
    this.speciality = [];
    this.filterAdmission.campus = '';
    this.filterAdmission.level = '';
    this.filterForDisplay.campus = '';
    this.filterForDisplay.level = '';
    this.filterAdmission.sector = '';
    this.filterForDisplay.sector = '';
    this.filterAdmission.speciality = '';
    this.filterAdmission.is_speciality = false;
    this.filterForDisplay.speciality = '';
    this.isSpecialityNone = false;
    this.campusFilter.setValue('');
    this.levelFilter.setValue('');
    this.sectorFilter.setValue('');
    this.specialityFilter.setValue('');
    if (this.schoolsFilter.value) {
      const school = this.schoolsFilter.value;
      const scampusList = this.listObjective.find((list) => list._id === school);
      console.log('!!! List campus', scampusList);
      scampusList.campuses.forEach((element) => {
        if (element) {
          this.campusList.push(element);
        }
      });

      if (this.campusList.length === 1) {
        this.filterAdmission.school = school;
        this.filterForDisplay.school = scampusList.short_name;

        // select index 0 if campus length === 0 and patch value (id) to form and (name) to display
        this.campusFilter.patchValue(this.campusList[0]._id);
        this.filterAdmission.campus = this.campusList[0]._id;
        this.filterForDisplay.campus = this.campusList[0].name;

        // Get level list
        const sLevelList = this.campusList.find((list) => list._id === this.campusList[0]._id);
        console.log('_From single campus, level value', sLevelList);
        sLevelList.levels.forEach((element) => {
          if (element) {
            this.levels.push(element);
          }
        });

        // check if levels length === 1
        if (this.levels.length === 1) {
          // select index 0 because levels length === 0 and patch to filter and
          this.levelFilter.patchValue(this.levels[0]._id);
          this.filterAdmission.level = this.levels[0]._id;
          this.filterForDisplay.level = this.levels[0].name;

          // get sectors dropdown
          this.getSectorsDropdown();
        } else {
          this.refetchData('else level');
        }
      } else {
        this.filterAdmission.school = school;
        this.filterForDisplay.school = scampusList.short_name;
        this.refetchData('else campus');
      }
    } else {
      this.campusList = [];
      this.filterAdmission.school = '';
      this.filterForDisplay.school = '';
      this.refetchData('else school');
    }

    this.campusList = _.uniqBy(this.campusList, '_id');
  }

  onClearCampus() {
    this.levels = [];
    this.sector = [];
    this.speciality = [];
  }

  // LEVEL =========================================

  getDataLevel() {
    // this.isLoading = true;
    this.levels = [];
    this.sector = [];
    this.speciality = [];
    this.filterAdmission.level = '';
    this.filterForDisplay.level = '';
    this.filterAdmission.sector = '';
    this.filterForDisplay.sector = '';
    this.filterAdmission.speciality = '';
    this.filterAdmission.is_speciality = false;
    this.filterForDisplay.speciality = '';
    this.levelFilter.setValue('');
    this.sectorFilter.setValue('');
    this.specialityFilter.setValue('');
    this.isSpecialityNone = false;
    const sCampus = this.campusFilter.value;
    if (this.campusFilter.value) {
      const sLevelList = this.campusList.find((list) => list._id === sCampus);
      console.log('!!! Level list', sLevelList);
      sLevelList.levels.forEach((element) => {
        if (element) {
          this.levels.push(element);
        }
      });

      this.filterAdmission.campus = sCampus;
      this.filterForDisplay.campus = sLevelList.name;

      // check if levels length === 1
      if (this.levels.length === 1) {
        // select index 0 because levels length === 0 and patch to filter and
        this.levelFilter.patchValue(this.levels[0]._id);
        this.filterAdmission.level = this.levels[0]._id;
        this.filterForDisplay.level = this.levels[0].name;

        // get sectors dropdown
        this.getSectorsDropdown();
      } else {
        this.filterAdmission.campus = sCampus;
        this.filterForDisplay.campus = sLevelList.name;
        this.refetchData();
      }
    } else {
      this.levels = [];
      this.filterAdmission.campus = '';
      this.filterForDisplay.campus = '';
      this.refetchData('else getlevel');
    }
    this.levels = _.uniqBy(this.levels, '_id');
    this.levels = this.levels.sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  getDataByLevel(event) {
    this.sector = [];
    this.speciality = [];
    this.filterAdmission.sector = '';
    this.filterForDisplay.sector = '';
    this.filterAdmission.speciality = '';
    this.filterAdmission.is_speciality = false;
    this.filterForDisplay.speciality = '';
    this.sectorFilter.setValue('');
    this.specialityFilter.setValue('');
    this.isSpecialityNone = false;
    // this.isLoading = true;
    const level = this.levelFilter.value;
    if (this.levelFilter.value) {
      const sLevelList = this.levels.find((list) => list._id === event);
      if (sLevelList) {
        this.filterAdmission.level = level;
        this.filterForDisplay.level = sLevelList.name;
      }
      const filter = {
        scholar_season_id: this.scholarFilter.value,
        candidate_school_ids: [this.schoolsFilter.value],
        campuses: [this.campusFilter.value],
        levels: [this.levelFilter.value],
      };
      this.subs.sink = this.financeService.GetAllSectorsDropdown(filter).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.sector = resp;
            if (this.sector.length === 1) {
              // patch value with index 0 since sector list only return 1
              this.sectorFilter.patchValue(this.sector[0]._id);
              this.filterAdmission.sector = this.sector[0]._id;
              this.filterForDisplay.sector = this.sector[0].name;

              // get speciality dropdown
              this.getSpecialityDropdown();
            } else {
              this.refetchData();
            }
          } else {
            this.refetchData();
          }
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
          }
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    } else {
      this.sector = [];
      this.filterAdmission.level = '';
      this.filterForDisplay.level = '';
      this.refetchData();
    }
  }

  onClearLevel() {
    this.sector = [];
    this.speciality = [];
  }

  // SECTOR =========================================

  getDataSpeciality() {
    // this.isLoading = true;
    this.speciality = [];
    this.filterAdmission.speciality = '';
    this.filterAdmission.is_speciality = false;
    this.filterForDisplay.speciality = '';
    this.specialityFilter.setValue('');
    this.isSpecialityNone = false;
    const sSector = this.sectorFilter.value;

    if (this.sectorFilter.value) {
      const sSectorsList = this.sector.find((list) => list._id === sSector);
      this.filterAdmission.sector = sSector;
      this.filterForDisplay.sector = sSectorsList.name;
      const filter = {
        scholar_season_id: this.scholarFilter.value,
        candidate_school_ids: [this.schoolsFilter.value],
        campuses: [this.campusFilter.value],
        levels: [this.levelFilter.value],
        sector: this.sectorFilter.value,
      };
      this.subs.sink = this.candidatesService.GetAllSpecializationsByScholar(filter).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.speciality = resp;
            if (resp.length === 1) {
              // patch value index 0
              this.specialityFilter.patchValue(this.speciality[0]._id);
              this.filterAdmission.speciality = this.speciality[0]._id;
              this.filterForDisplay.speciality = this.speciality[0].sigli;
              this.filterAdmission.is_speciality = false;
              this.isSpecialityNone = false;
              this.refetchData();
            } else {
              this.refetchData();
            }
          } else {
            this.refetchData();
          }
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
          }
          this.refetchData();
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    } else {
      this.speciality = [];
      this.filterAdmission.sector = '';
      this.filterForDisplay.sector = '';
      this.refetchData();
    }
  }

  getSpecialitys() {
    this.filterForDisplay.speciality = '';
    this.filterAdmission.speciality = '';
    const speciality = this.specialityFilter.value;
    const sSpeciality = this.speciality.find((res) => res._id === speciality);
    if (sSpeciality) {
      this.filterForDisplay.speciality = sSpeciality.sigli;
      this.filterAdmission.speciality = speciality;
      this.filterAdmission.is_speciality = false;
      this.isSpecialityNone = false;
      this.refetchData();
    } else if (speciality === 'None') {
      this.filterForDisplay.speciality = '';
      this.filterAdmission.speciality = '';
      this.filterAdmission.is_speciality = true;
      this.isSpecialityNone = true;
      this.refetchData();
    } else {
      this.filterForDisplay.speciality = '';
      this.filterAdmission.speciality = '';
      this.filterAdmission.is_speciality = false;
      this.isSpecialityNone = false;
      this.refetchData();
    }
  }

  onClearSector() {
    this.filterAdmission.sector = '';
    this.filterForDisplay.sector = '';
    this.speciality = [];
  }

  // SPECILIALITY =========================================

  getSpeciality(event) {
    console.log(event);
    // this.isLoading = true;
    const sSpeciality = this.specialityFilter.value;
    if (this.specialityFilter.value) {
      this.filterAdmission.speciality = sSpeciality;
      this.filterForDisplay.speciality = event.name;
      this.refetchData();
    } else {
      this.filterAdmission.speciality = '';
      this.filterForDisplay.speciality = '';
      this.refetchData();
    }
  }

  /**************************************************************************************************/

  resetFilter() {
    // if (!this.isMemberAdmission) {
    //   this.admissionService.setResetStatus(true);
    // }
    this.reset.emit(true);
    this.campusFilter.setValue(null);
    this.levelFilter.setValue(null);
    this.scholarFilter.setValue(null);
    this.schoolsFilter.setValue(null);
    this.specialityFilter.setValue(null);
    this.sectorFilter.setValue(null);
    this.filterAdmission = {
      school: '',
      campus: '',
      level: '',
      admission_member_id: '',
      scholar_season: '',
      sector: '',
      speciality: '',
      is_speciality: false,
    };
    this.filterForDisplay = {
      school: '',
      campus: '',
      level: '',
      admission_member_id: '',
      scholar_season: '',
      sector: '',
      speciality: '',
    };
    this.admissionService.setScholar(null);
    this.isSpecialityNone = false;
    this.getDataLevelEngagement();
    this.getDataForWeeklyChart('reset');
    this.getDataForObjectiveChart();
    this.getDataForNationalityChart();
    this.getRegisteredCandidatePerDay();
  }

  cleanFilterDataAdmission() {
    const filterData = _.cloneDeep(this.filterAdmission);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if ((filterData[key] || filterData[key] === false) && key !== 'is_speciality') {
        filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
      } else if (key === 'is_speciality' && filterData[key] === true) {
        filterQuery = filterQuery + ` ${key}:${!filterData[key]}`;
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  getDataByMember() {
    const member = this.memberFilter.value;
    if (this.memberFilter.value) {
      this.filterAdmission.admission_member_id = member;
      this.getDataForNationalityChart();
      this.getDataForWeeklyChart('datamemberif');
      this.getDataForObjectiveChart();
      this.getRegisteredCandidatePerDay();
    } else {
      this.filterAdmission.admission_member_id = '';
      this.getDataForNationalityChart();
      this.getDataForWeeklyChart('datamemberelse');
      this.getDataForObjectiveChart();
      this.getRegisteredCandidatePerDay();
    }
  }

  getStartandEndDate() {}
}
