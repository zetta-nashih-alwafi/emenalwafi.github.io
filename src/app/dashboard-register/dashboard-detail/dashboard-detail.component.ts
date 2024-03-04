import { Component, Input, OnInit, OnChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { SubSink } from 'subsink';
import { PageTitleService } from '../../core/page-title/page-title.service';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { FinancesService } from 'app/service/finance/finance.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-dashboard-detail',
  templateUrl: './dashboard-detail.component.html',
  styleUrls: ['./dashboard-detail.component.scss'],
})
export class DashboardDetailComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() schoolData: any;
  @Input() short_name = '';
  @Input() index: any;
  @Input() indexExpansion: any;
  today: Date;
  private subs = new SubSink();
  schoolDataOriginal;
  schoolDataFiltered;
  isWaitingForResponse = false;
  isGetRegistrationProgramLoading = false;

  scholars: any[];
  scholarSeason: any;
  scholarSeasonId: any;
  listCampus = [];
  scrollVertical = 0;
  scrollHorizontal = 0;
  dataGeneral: any;
  dataMapping = [];
  dataCampus = [];
  dataCampusIsNull = [];
  campusList: any[][] = [];
  fullDataUser;
  campusConnected;
  currentUser;
  isDirectorAdmission = false;
  isMemberAdmission = false;
  filterAdmission = {
    scholar_season: null,
    level: null,
    sector: null,
    speciality: null,
  };
  filterDisplay = {
    scholar_season: null,
    level: null,
    sector: null,
    speciality: null,
  };

  scholarFilter = new UntypedFormControl(null);
  levelFilter = new UntypedFormControl(null);
  sectorFilter = new UntypedFormControl(null);
  specialityFilter = new UntypedFormControl(null);
  sector: any[];
  speciality: any[];
  disabledSectors: boolean = true;
  disabledSpeciality: boolean = true;
  formGenerated: any;

  isPermission: any;
  currentUserTypeId: any;
  totalRegistered: any;
  dataGeneration: any;
  registerMapData: any;
  dataRegister: any;
  dataRegistered: any;

  constructor(
    private pageTitleService: PageTitleService,
    private admissionService: AdmissionDashboardService,
    private translate: TranslateService,
    private userService: AuthService,
    private permissionsService: NgxPermissionsService,
    private financeService: FinancesService,
    private candidatesService: CandidatesService,
  ) {}

  ngOnInit() {
    this.isPermission = this.userService.getPermission();
    this.currentUser = this.userService.getLocalStorageUser();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Admission Director');
    this.isMemberAdmission = !!this.permissionsService.getPermission('Admission Member');
    if (this.index === this.indexExpansion) {
      this.today = new Date();
      this.getDataScholarSeasons();
    }
    if (this.isDirectorAdmission || this.isMemberAdmission) {
      console.log('_curr', this.currentUser);

      console.log('_short', this.short_name);

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
          levels: _.chain(value)
            // Group the elements of Array based on `campus._id` property
            .groupBy('level._id')
            // `key` is group's name (campus._id), `value` is the array of objects
            .map((values, keys) => ({
              _id: keys,
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
          levels: _.chain(value)
            // Group the elements of Array based on `campus._id` property
            .groupBy('level._id')
            // `key` is group's name (campus._id), `value` is the array of objects
            .map((values, keys) => ({
              _id: keys,
              name: values,
            }))
            .value(),
        }))
        .value();

      list.forEach((ele1, index1) => {
        ele1['short_name'] = listName[index1].short_name;
        ele1.campuses.forEach((camp, indexCamp) => {
          if (
            listName[index1] &&
            listName[index1].campuses &&
            listName[index1].campuses.length &&
            listName[index1].campuses[indexCamp] &&
            listName[index1].campuses[indexCamp].name
          ) {
            camp['name'] = listName[index1].campuses[indexCamp].name;
          }
        });
        ele1.levels.forEach((lvl, indexLevels) => {
          if (
            listName[index1] &&
            listName[index1].levels &&
            listName[index1].levels.length &&
            listName[index1].levels[indexLevels] &&
            listName[index1].levels[indexLevels].name &&
            listName[index1].levels[indexLevels].name.length &&
            listName[index1].levels[indexLevels].name[0].level &&
            listName[index1].levels[indexLevels].name[0].level.name
          ) {
            lvl['name'] = listName[index1].levels[indexLevels].name[0].level.name;
          }
        });
      });

      const schoolSorted = list.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0));
      const schoolByIndex = schoolSorted[this.index];
      this.schoolData = schoolByIndex;
      // console.log('this.schoolData', this.schoolData, list[this.index]);
      console.log('_list id', list);
      console.log('_list name', listName);
      console.log('_sch', this.schoolData);
    }
  }

  ngOnChanges() {
    // this.getGeneralData();
  }
  translateDate() {
    return moment(this.today, 'DD/MM/YYYY').format('DD/MM/YYYY');
  }

  ngAfterViewInit(): void {}

  getDataScholarSeasons() {
    this.isWaitingForResponse = true;
    this.scholars = [];
    const sort = {
      createdAt: 'asc',
    };
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished(sort).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.scholars = _.cloneDeep(resp);
          this.listenScholarSeasonFilter();
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
        this.isWaitingForResponse = false;
        this.isGetRegistrationProgramLoading = false;
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
        console.log(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  // Listen scholar season selected from parent through services
  listenScholarSeasonFilter() {
    this.subs.sink = this.admissionService.scholarSeason.subscribe(
      (resp) => {
        if (resp) {
          this.scholarSeason = resp.scholar_season;
          this.scholarSeasonId = resp._id;
          this.filterAdmission.scholar_season = this.scholarSeasonId;
          this.scholarFilter.patchValue(this.scholarSeasonId);
          // this.getGeneralData();
          this.getTotalRegisteredPerProgram();
        } else {
          this.scholarSeason = '';
          this.filterAdmission.scholar_season = '';
          this.scholarFilter.patchValue('');
          // this.getGeneralData();
          this.getTotalRegisteredPerProgram();
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
  }

  getTotalRegisteredPerProgram() {
    this.isGetRegistrationProgramLoading = true;
    const schoolId = this.schoolData && this.schoolData._id ? this.schoolData._id : null;
    const scholar = this.filterAdmission && this.filterAdmission.scholar_season ? this.filterAdmission.scholar_season : null;
    const level = this.filterAdmission && this.filterAdmission.level ? this.filterAdmission.level : null;
    const sector = this.filterAdmission && this.filterAdmission.sector ? this.filterAdmission.sector : null;
    const speciality = this.filterAdmission && this.filterAdmission.speciality ? this.filterAdmission.speciality : null;
    // console.log('!! schoolId', schoolId);
    this.subs.sink = this.admissionService
      .GetTotalRegisteredPerProgram(scholar, schoolId, level, sector, this.currentUserTypeId, speciality)
      .subscribe(
        (resp) => {
          if (resp) {
            this.totalRegistered = _.cloneDeep(resp);
            this.getSchoolCampusLevelSectorSpecialityForTable();
            this.isGetRegistrationProgramLoading = false;
            // console.log('!! Total Reg', resp);
          }
        },
        (err) => {
          this.userService.postErrorLog(err);
          this.isGetRegistrationProgramLoading = false;
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

  getSchoolCampusLevelSectorSpecialityForTable() {
    this.isWaitingForResponse = true;
    const schoolId = this.schoolData._id;
    const scholar = this.filterAdmission.scholar_season;
    const level = this.filterAdmission.level;
    const sector = this.filterAdmission.sector;
    const speciality = this.filterAdmission.speciality;
    this.subs.sink = this.admissionService
      .GetSchoolCampusLevelSectorSpecialityForTable(schoolId, scholar, level, sector, this.currentUserTypeId, speciality)
      .subscribe(
        (resp) => {
          if (resp) {
            // console.log('!! schoolId', resp);
            this.dataGeneration = resp.map((list) => {
              return {
                progress: list.level
                  ? list.sector_id
                    ? list.speciality_id
                      ? list.level.name + ' - ' + list.sector_id.name + ' - ' + list.speciality_id.sigli
                      : list.level.name + ' - ' + list.sector_id.name
                    : list.level.name
                  : '',
                ...list,
              };
            });
            this.mapGlobalData();
          }
        },
        (err) => {
          this.userService.postErrorLog(err);
          this.isWaitingForResponse = false;
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

  mapGlobalData() {
    const globalDepositList = [];
    if (this.schoolData && this.schoolData.campuses && this.schoolData.campuses.length) {
      this.schoolData.campuses.forEach((campus) => {
        if (this.dataGeneration && this.dataGeneration.length) {
          this.dataGeneration.forEach((level) => {
            const data = {
              school_id: this.schoolData._id ? this.schoolData._id : '',
              short_name: this.schoolData.short_name ? this.schoolData.short_name : '',
              scholar_season_id: this.schoolData.scholar_season_id ? this.schoolData.scholar_season_id : '',
              campus: campus ? campus.name : '',
              level: level.level ? level.level.name : '',
              progress: level.level
                ? level.sector_id
                  ? level.speciality_id
                    ? level.level.name + ' - ' + level.sector_id.name + ' - ' + level.speciality_id.sigli
                    : level.level.name + ' - ' + level.sector_id.name
                  : level.level.name
                : '',
              campus_id: campus ? campus._id : '',
              level_id: level.level ? level.level._id : null,
              sector: level.sector_id ? level.sector_id._id : null,
              speciality: level.speciality_id ? level.speciality_id._id : null,
              counter: 0,
              objective: 0,
              percentage: 0,
              is_from_registration: false,
            };
            globalDepositList.push(data);
          });
        }
      });
      // console.log('!! globalDepositList', globalDepositList);
      // console.log('!! DP', this.totalRegistered);
      if (globalDepositList && globalDepositList.length) {
        globalDepositList.forEach((global, ind) => {
          const deposit = this.totalRegistered.find(
            (list) =>
              list.campus._id === global.campus_id &&
              list.level._id === global.level_id &&
              list.sector._id === global.sector &&
              (list.speciality ? list.speciality._id === global.speciality : list.speciality === global.speciality),
          );
          if (deposit) {
            const data = {
              school_id: this.schoolData._id ? this.schoolData._id : '',
              short_name: this.schoolData.short_name ? this.schoolData.short_name : '',
              scholar_season_id: this.schoolData.scholar_season_id ? this.schoolData.scholar_season_id : '',
              campus: deposit.campus ? deposit.campus.name : '',
              level: deposit.level ? deposit.level.name : '',
              progress: global.progress,
              campus_id: deposit.campus ? deposit.campus._id : '',
              level_id: deposit.level ? deposit.level._id : '',
              sector: deposit.sector ? deposit.sector._id : '',
              speciality: deposit.speciality ? deposit.speciality._id : '',
              counter: deposit.counter ? deposit.counter : 0,
              objective: deposit.objective ? deposit.objective : 0,
              percentage: deposit.percentage ? deposit.percentage : 0,
              is_from_registration: true,
            };
            globalDepositList[ind] = data;
          }
        });
      }
      this.registerMapData = _.cloneDeep(globalDepositList);
      this.getDownPayment();
      this.generateFormAmount();
      this.isWaitingForResponse = false;
      // console.log('this.depositMapData', this.registerMapData);
      // console.log('mapGlobalData', globalDepositList);
    }
  }

  getDownPayment() {
    this.isWaitingForResponse = true;
    const resp = _.cloneDeep(this.totalRegistered);
    if (resp && resp.length) {
      let dataDp = _.cloneDeep(resp);
      dataDp = dataDp.map((data) => {
        return {
          school_id: data.school_id ? data.school_id._id : '',
          scholar_season_id: data.scholar_season_id ? data.scholar_season_id._id : '',
          campus_id: data.campus ? data.campus._id : '',
          level_id: data.level ? data.level._id : '',
          campus: data.campus ? data.campus.name : '',
          level: data.level ? data.level.name : '',
          sector: data.sector ? data.sector._id : '',
          speciality: data.speciality ? data.speciality._id : '',
          progress: data.level
            ? data.sector
              ? data.speciality
                ? data.level.name + ' - ' + data.sector.name + ' - ' + data.speciality.sigli
                : data.level.name + ' - ' + data.sector.name
              : data.level.name
            : '',
          counter: data.counter ? data.counter : 0,
          objective: data.objective ? data.objective : 0,
        };
      });
      this.dataRegister = dataDp;
      this.connectSpecialitySectorWithLevel(this.schoolData, this.dataRegister);
      const folders = _.chain(this.registerMapData)
        .groupBy('progress')
        .map((value, key) => ({
          name: key,
          data: value,
        }))
        .value();

      let dataArrays = [];
      if (this.schoolData && this.schoolData.levels && this.schoolData.levels.length) {
        const data = folders.map((temp) => {
          return {
            name: temp.name,
            data: _.uniqBy(temp.data, 'campus'),
          };
        });
        dataArrays = _.orderBy(data, ['name'], ['asc']);
      }
      this.dataRegistered = dataArrays;
      // console.log('Data Down Payment', folders, dataArrays, this.dataRegister);
      if (dataArrays) {
        this.mappingDashboard(dataArrays);
      }
      this.isWaitingForResponse = false;
    } else {
      const folders = _.chain(this.registerMapData)
        .groupBy('progress')
        .map((value, key) => ({
          name: key,
          data: value,
        }))
        .value();

      let dataArrays = [];
      if (this.dataGeneration && this.dataGeneration.length) {
        const data = folders.map((temp) => {
          return {
            name: temp.name,
            data: _.uniqBy(temp.data, 'campus'),
          };
        });
        dataArrays = _.orderBy(data, ['name'], ['asc']);
      }
      this.dataRegistered = dataArrays;
      // console.log('Data Down Payment', folders, dataArrays);
      if (dataArrays) {
        this.mappingDashboard(dataArrays);
      }
      this.isWaitingForResponse = false;
    }
  }

  connectSpecialitySectorWithLevel(schoolData, downPaymentData) {
    schoolData.levels.forEach((level) => {
      const fullRateItemWithSameLevel = downPaymentData.find(
        (rate) => rate && level && level._id && rate.level_id && rate.level_id === level._id,
      );
      if (fullRateItemWithSameLevel) {
        level.speciality = fullRateItemWithSameLevel.speciality;
        level.sector = fullRateItemWithSameLevel.sector;
      }
    });
  }

  mappingDashboard(dataArrays) {
    this.isWaitingForResponse = true;
    this.dataMapping = [];
    dataArrays.forEach((school) => {
      const list = school.data.map((element) => {
        return {
          name: element.campus.toLowerCase(),
          scholar_season_id: this.scholarSeasonId,
          school_id: element.school_id,
          levels: element.level,
          percentage: element.percentage,
          status: element.percentage <= 25 ? 'low' : element.percentage > 25 && element.percentage < 75 ? 'medium' : 'high',
          counter: element.counter,
          objective: element.objective,
          is_from_registration: element.is_from_registration,
        };
      });
      this.dataMapping.push(list);
    });
    // console.log('!! this.dataMapping ', this.dataMapping);
    this.isWaitingForResponse = false;
  }

  generateFormAmount() {
    this.formGenerated = [];
    this.isWaitingForResponse = true;
    const resp = [];
    this.dataGeneration.forEach((level) => {
      this.schoolData.campuses.forEach((element) => {
        const data = {
          campus: element.name,
          school: this.schoolData.short_name,
          level: level.level ? level.level.name : '',
          campus_id: element ? element._id : '',
          level_id: level.level ? level.level._id : '',
          sector: level.sector_id ? level.sector_id._id : '',
          speciality: level.speciality_id ? level.speciality_id._id : '',
          progress: level.level
            ? level.sector_id
              ? level.speciality_id
                ? level.level.name + ' - ' + level.sector_id.name + ' - ' + level.speciality_id.sigli
                : level.level.name + ' - ' + level.sector_id.name
              : level.level.name
            : '',
          counter: level.counter,
          objective: level.objective,
          percentage: level.percentage,
          is_from_registration: false,
        };
        resp.push(data);
      });
    });
    const respCode = [];
    this.dataGeneration.forEach((level) => {
      this.schoolData.campuses.forEach((element) => {
        const data = {
          campus: element.name,
          school: this.schoolData.short_name,
          level: level.level ? level.level.name : '',
          campus_id: element ? element._id : '',
          level_id: level.level ? level.level._id : '',
          sector: level.sector_id ? level.sector_id._id : '',
          speciality: level.speciality_id ? level.speciality_id._id : '',
          progress: level.level
            ? level.sector_id
              ? level.speciality_id
                ? level.level.name + ' - ' + level.sector_id.name + ' - ' + level.speciality_id.sigli
                : level.level.name + ' - ' + level.sector_id.name
              : level.level.name
            : '',
          counter: level.counter,
          objective: level.objective,
          percentage: level.percentage,
          is_from_registration: false,
        };
        respCode.push(data);
      });
    });
    if (resp && resp.length) {
      resp.forEach((element) => {
        if (respCode && respCode.length) {
          respCode.forEach((eln, inx) => {
            if (
              element.campus.toUpperCase() === eln.campus.toUpperCase() &&
              element.level.toUpperCase() === eln.level.toUpperCase() &&
              element.sector.toUpperCase() === eln.sector.toUpperCase() &&
              element.speciality.toUpperCase() === eln.speciality.toUpperCase()
            ) {
              respCode[inx].is_from_registration = true;
            }
          });
        }
      });
    }
    // console.log('resp', respCode);
    if (respCode && respCode.length) {
      const folders = _.chain(respCode)
        .groupBy('progress')
        .map((value, key) => ({
          name: key,
          data: value,
        }))
        .value();

      this.formGenerated = folders;
      let dataArrays = [];
      if (this.formGenerated && this.formGenerated.length) {
        const data = folders.map((temp) => {
          return {
            name: temp.name,
            data: _.uniqBy(temp.data, 'campus'),
          };
        });
        dataArrays = _.orderBy(data, ['name'], ['asc']);
      }
      this.formGenerated = dataArrays;
      // console.log('!! formGenerated', this.formGenerated);
    }
    this.isWaitingForResponse = false;
  }

  scholarSelected(event) {
    if (this.scholarFilter.value) {
      const level = this.scholarFilter.value;
      this.filterAdmission.scholar_season = level;
      this.filterDisplay.scholar_season = event.scholar_season;
      this.getTotalRegisteredPerProgram();
    }
  }

  getNameLevel(data) {
    let levelName;
    if (data && data.key) {
      if (parseInt(data.key)) {
        levelName = data.key;
      } else {
        levelName = data.key;
      }
    } else {
      if (data && data.name) {
        levelName = data.name;
      }
    }
    return levelName;
  }

  validateData(school, data, index: number, indexLevel: number, status: boolean, detailName, schoolName) {
    let result = 0;
    let display = true;
    const dataIn = data[index] ? data[index].name : '';
    if (dataIn) {
      result = school.findIndex((list, n) => {
        return list.name.toLowerCase() === dataIn.toLowerCase();
      });
      const results = school.find((list, n) => {
        return list.name.toLowerCase() === dataIn.toLowerCase();
      });
      if (school[result]) {
        display = false;
      }
    }
    return !data[result];
  }

  validateDatas(school, data, index: number) {
    let result = 0;
    let display = false;

    return display;
  }

  isCorrectCampus(data) {}

  dashboardScroll(event) {
    if (event && event.target.scrollLeft !== this.scrollHorizontal) {
      this.scrollHorizontal = event.target.scrollLeft;
    }
    if (event && event.target.scrollTop !== this.scrollVertical) {
      this.scrollVertical = event.target.scrollTop;
    }
  }

  getDataByLevel(event) {
    this.disabledSectors = false;
    this.sector = [];
    this.speciality = [];
    this.sectorFilter.setValue(null);
    this.specialityFilter.setValue(null);
    const level = this.levelFilter.value;
    const campuses = this.schoolData.campuses.map((cam) => {
      return cam._id;
    });
    const levels = this.schoolData.levels.map((lvl) => lvl._id);
    if (this.levelFilter.value) {
      this.filterAdmission.level = level;
      console.log(event, level, this.filterAdmission.level);
      this.filterDisplay.level = event.name;
      const filter = {
        scholar_season_id: this.scholarSeasonId,
        candidate_school_ids: [this.schoolData._id],
        campuses,
        levels: [this.levelFilter.value],
      };
      this.subs.sink = this.financeService.GetAllSectorsDropdown(filter).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.sector = resp;
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
      this.getTotalRegisteredPerProgram();
    } else {
      this.filterAdmission.level = null;
      this.filterDisplay.level = null;
      this.sector = [];
      this.getTotalRegisteredPerProgram();
    }
  }

  onClearLevel() {
    this.sector = [];
    this.speciality = [];
  }

  onClearSector() {
    this.speciality = [];
  }

  getDataSpeciality(event) {
    this.speciality = [];
    this.disabledSpeciality = false;
    this.specialityFilter.setValue(null);
    this.specialityFilter.setValue(null);
    const level = this.levelFilter.value;
    const campuses = this.schoolData.campuses.map((cam) => {
      return cam._id;
    });
    const levels = this.schoolData.levels.map((lvl) => lvl._id);
    if (this.sectorFilter.value) {
      this.filterAdmission.sector = this.sectorFilter.value;
      this.filterDisplay.sector = event.name;
      const filter = {
        scholar_season_id: this.scholarSeasonId,
        candidate_school_ids: [this.schoolData._id],
        campuses,
        levels: [this.levelFilter.value],
        sector: this.sectorFilter.value,
      };
      this.subs.sink = this.candidatesService.GetAllSpecializationsByScholar(filter).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.speciality = resp;
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
      this.getTotalRegisteredPerProgram();
    } else {
      this.filterAdmission.sector = null;
      this.filterDisplay.sector = null;
      this.speciality = [];
      this.getTotalRegisteredPerProgram();
    }
  }

  getDataBySpeciality(event) {
    if (this.specialityFilter.value) {
      this.filterAdmission.speciality = this.specialityFilter.value;
      this.filterDisplay.speciality = event.name;
      this.getTotalRegisteredPerProgram();
    } else {
      this.filterAdmission.speciality = null;
      this.filterDisplay.speciality = null;
      this.getTotalRegisteredPerProgram();
    }
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
  reset() {
    // this.filterAdmission.scholar_season = null
    this.filterAdmission.level = null;
    this.filterAdmission.sector = null;
    this.filterAdmission.speciality = null;
    this.filterDisplay.level = null;
    this.filterDisplay.sector = null;
    this.filterDisplay.speciality = null;
    this.sector = [];
    this.speciality = [];
    this.sectorFilter.setValue(null);
    this.specialityFilter.setValue(null);
    this.levelFilter.setValue(null);
    console.log(this.filterDisplay);
    this.getTotalRegisteredPerProgram();
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
