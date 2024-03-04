import { UtilityService } from 'app/service/utility/utility.service';
import { DataSource } from '@angular/cdk/table';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import _ from 'lodash';
import * as moment from 'moment';
import { ExportCsvService } from 'app/service/export-csv/export-csv.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import Swal from 'sweetalert2';
import { IntakeChannelTableDetailComponent } from './intake-channel-table-detail/intake-channel-table-detail.component';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { ActivatedRoute } from '@angular/router';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { FlyerDialogComponent } from './flyer-dialog/flyer-dialog.component';
import { environment } from 'environments/environment';
import { ConditionDialogComponent } from './condition-dialog/condition-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-intake-channel-tab',
  templateUrl: './intake-channel-tab.component.html',
  styleUrls: ['./intake-channel-tab.component.scss'],
})
export class AdmissionChannelTabComponent implements OnInit, OnDestroy, AfterViewInit {
  dataSource = new MatTableDataSource([]);
  titleData: any;
  noData: any;
  displayedColumns: string[] = [
    'select',
    'intakeChannel',
    'scholarSeason',
    'schools',
    'campus',
    'level',
    'sector',
    'speciality',
    'downPaymentInternal',
    'downPaymentExternal',
    'fullRate',
    'fullRateExternal',
    'legalEntities',
    'flyers',
    'condition',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'intakeChannelFilter',
    'seasonFilter',
    'schoolFilter',
    'campusFilter',
    'levelFilter',
    'sectorFilter',
    'specialityFilter',
    'downPaymentInternalFilter',
    'downPaymentExternalFilter',
    'fullRateFilterFilter',
    'fullRateExternalFilter',
    'legalFilter',
    'flyersFilter',
    'conditionFilter',
  ];
  allInternshipId = [];
  filteredValues = {
    name: null,
    school: null,
    campus: null,
    level: null,
    speciality: null,
    sector: null,
    scholar_season_ids: null,
  };
  intakeChannelCount;
  intackChannelCount;
  isWaitingForResponse = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isLoading: Boolean = false;
  dataCount = 0;
  isReset: Boolean = false;
  private subs = new SubSink();
  selection = new SelectionModel<any>(true, []);
  exportName: string;
  isCheckedAll = false;
  selectType;

  seasonFilter = new UntypedFormControl(null);
  schoolsFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  levelFilter = new UntypedFormControl(null);
  intakeChannelFilter = new UntypedFormControl(null);
  specialityFilter = new UntypedFormControl(null);
  scholarshipFeeFilter = new UntypedFormControl(null);
  schoolList: any;
  listObjective: any[];
  levelList: any[];
  campusList: any[];
  schoolName: any;
  seasonList: any[];
  scholarSeasonId: any;
  sortValue = null;
  dataLoaded: boolean;
  disabledExport = true;
  userSelected = [];
  internshipId = [];
  scholarSeasons: any;
  isSelectAllSchool = false;
  isSelectAllCampous = false;
  isSelectAllLevel = false;
  currentUser: any;
  isPermission: any;
  allStudentForCheckbox = [];
  dataSelected = [];
  pageSelected = [];
  currentUserTypeId;
  constructor(
    private admissionEntrypointService: AdmissionEntrypointService,
    private financeService: FinancesService,
    private candidatesService: CandidatesService,
    private exportCsvService: ExportCsvService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private pageTitleService: PageTitleService,
    private admissionService: AdmissionDashboardService,
    private router: ActivatedRoute,
    private rncpTitleService: RNCPTitlesService,
    private utilityService: UtilityService,
    private userService: AuthService,
  ) {}

  ngOnInit() {
    this.router.queryParams.subscribe((res) => {
      //  console.log('_res', res);
      if (res && res.scholarSeasonId) {
        this.scholarSeasonId = res.scholarSeasonId;
      }
      if (res && res.title) {
        this.scholarSeasons = res.title;
      } else {
        this.scholarSeasons = '';
      }
    });
    this.getAdmissionChannelsData();
    this.setFilterAndSorting();
    const name = this.translate.instant('ADMISSION.TITLE_ADMISSION_CHANNEL');
    this.pageTitleService.setTitle(name + (this.scholarSeasons ? ' - ' + this.scholarSeasons : ''));
    // this.pageTitleService.setIcon('login');

    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      const names = this.translate.instant('ADMISSION.TITLE_ADMISSION_CHANNEL');
      this.pageTitleService.setTitle(names + (this.scholarSeasons ? ' - ' + this.scholarSeasons : ''));
      // this.pageTitleService.setIcon('login');
    });

    this.currentUser = this.utilityService.getCurrentUser();
    this.isPermission = this.userService.getPermission();
    const user = this.userService.getLocalStorageUser();
    const currentUserEntity = user?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
  }
  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getAdmissionChannelsData();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  getAdmissionChannelsData() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    let filter = this.cleanFilterData();
    filter +=
      this.filteredValues.school && this.filteredValues.school.length && this.filteredValues.school[0]
        ? ` school : ` + JSON.stringify(this.filteredValues.school)
        : '';
    filter +=
      this.filteredValues.campus && this.filteredValues.campus.length && this.filteredValues.campus[0]
        ? ` campus : ` + JSON.stringify(this.filteredValues.campus)
        : '';
    filter +=
      this.filteredValues.level && this.filteredValues.level.length && this.filteredValues.level[0]
        ? ` level : ` + JSON.stringify(this.filteredValues.level)
        : '';
    filter += ` scholar_season_ids: ["${this.scholarSeasonId}"]`;
    filter = 'filter: {' + filter + '}';
    // let filter = this.cleanFilterData();
    //  console.log('filteredQuery', filter, this.filteredValues);
    this.subs.sink = this.financeService.GetAdmissionIntakeData(pagination, this.sortValue, filter).subscribe(
      (res) => {
        this.disabledExport = true;
        if (res && res.length) {
          this.isWaitingForResponse = false;
          this.dataSource.data = res;
          this.dataCount = res[0].count_document ? res[0].count_document : 0;
          this.getDataForList();
        } else {
          this.isWaitingForResponse = false;
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.isReset = false;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
      },
      (err) => {
        this.disabledExport = true;
        this.isReset = false;
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.dataCount = 0;
        this.isWaitingForResponse = false;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
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
          confirmButtonText: this.translate.instant('OK'),
        });
      },
    );
  }

  setFilterAndSorting() {
    this.subs.sink = this.intakeChannelFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (statusSearch !== null && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch === '') {
          this.intakeChannelFilter.setValue(null);
          this.filteredValues.name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAdmissionChannelsData();
          }
        }
        this.filteredValues.name = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAdmissionChannelsData();
        }
      } else {
        if (statusSearch !== null) {
          this.intakeChannelFilter.setValue(null);
          this.filteredValues.name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAdmissionChannelsData();
          }
        }
      }
    });
    this.subs.sink = this.schoolsFilter.valueChanges.subscribe((searchTxt: string[]) => {
      if (searchTxt && searchTxt.length) {
        const selectAll = searchTxt.find((resp) => resp === 'All');
        const selectNonAll = searchTxt.find((resp) => resp !== 'All');
        if (!selectAll && searchTxt.length) {
          this.isSelectAllSchool = false;
          this.campusFilter.setValue(null);
          this.levelFilter.setValue(null);
          this.filteredValues.campus = null;
          this.filteredValues.level = null;
          this.filteredValues.school = searchTxt;
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAdmissionChannelsData();
          }
        } else {
          if (selectNonAll && searchTxt.length) {
            const indexAll = searchTxt.findIndex((resp) => resp === 'All');
            searchTxt.splice(indexAll, 1);
            this.isSelectAllSchool = false;
            this.schoolsFilter.setValue(searchTxt);
          } else {
            this.campusFilter.setValue(null);
            this.levelFilter.setValue(null);
            this.filteredValues.campus = null;
            this.filteredValues.level = null;
            this.filteredValues.school = null;
            this.paginator.pageIndex = 0;
            if (!this.isReset) {
              this.getAdmissionChannelsData();
            }
          }
        }
      }
    });
    this.subs.sink = this.campusFilter.valueChanges.subscribe((searchTxt: string[]) => {
      if (searchTxt && searchTxt.length) {
        const selectAll = searchTxt.find((resp) => resp === 'All');
        const selectNonAll = searchTxt.find((resp) => resp !== 'All');
        if (!selectAll && searchTxt.length) {
          this.isSelectAllCampous = false;
          this.levelFilter.setValue(null);
          this.filteredValues.level = null;
          this.filteredValues.campus = searchTxt;
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAdmissionChannelsData();
          }
        } else {
          if (selectNonAll && searchTxt.length) {
            const indexAll = searchTxt.findIndex((resp) => resp === 'All');
            searchTxt.splice(indexAll, 1);
            this.isSelectAllCampous = false;
            this.campusFilter.setValue(searchTxt);
          } else {
            this.levelFilter.setValue(null);
            this.filteredValues.level = null;
            this.filteredValues.campus = null;
            this.paginator.pageIndex = 0;
            if (!this.isReset) {
              this.getAdmissionChannelsData();
            }
          }
        }
      }
    });
    this.subs.sink = this.levelFilter.valueChanges.subscribe((searchTxt: string[]) => {
      if (searchTxt && searchTxt.length) {
        const selectAll = searchTxt.find((resp) => resp === 'All');
        const selectNonAll = searchTxt.find((resp) => resp !== 'All');
        if (!selectAll && searchTxt.length) {
          this.isSelectAllLevel = false;
          this.filteredValues.level = searchTxt;
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAdmissionChannelsData();
          }
        } else {
          if (selectNonAll && searchTxt.length) {
            const indexAll = searchTxt.findIndex((resp) => resp === 'All');
            searchTxt.splice(indexAll, 1);
            this.isSelectAllLevel = false;
            this.levelFilter.setValue(searchTxt);
          } else {
            this.filteredValues.level = null;
            this.paginator.pageIndex = 0;
            if (!this.isReset) {
              this.getAdmissionChannelsData();
            }
          }
        }
      }
    });
  }

  selectAll(type) {
    const searchTxt = ['All'];
    if (type === 'school') {
      if (this.schoolList && this.schoolList.length) {
        if (this.isSelectAllSchool) {
          this.isSelectAllSchool = false;
          this.schoolsFilter.setValue(null);
        } else {
          this.isSelectAllSchool = true;
          this.schoolsFilter.setValue(searchTxt);
        }
      } else {
        if (this.isSelectAllSchool) {
          this.schoolsFilter.setValue(searchTxt);
          this.isSelectAllSchool = !this.isSelectAllSchool;
        } else {
          this.schoolsFilter.setValue(null);
          this.isSelectAllSchool = !this.isSelectAllSchool;
        }
      }
    } else if (type === 'campus') {
      if (this.campusList && this.campusList.length) {
        if (this.isSelectAllCampous) {
          this.isSelectAllCampous = false;
          this.campusFilter.setValue(null);
        } else {
          this.isSelectAllCampous = true;
          this.campusFilter.setValue(searchTxt);
        }
      } else {
        if (this.isSelectAllCampous) {
          this.campusFilter.setValue(searchTxt);
          this.isSelectAllCampous = !this.isSelectAllCampous;
        } else {
          this.campusFilter.setValue(null);
          this.isSelectAllCampous = !this.isSelectAllCampous;
        }
      }
    } else if (type === 'level') {
      if (this.levelList && this.levelList.length) {
        if (this.isSelectAllLevel) {
          this.isSelectAllLevel = false;
          this.levelFilter.setValue(null);
        } else {
          this.isSelectAllLevel = true;
          this.levelFilter.setValue(searchTxt);
        }
      } else {
        if (this.isSelectAllLevel) {
          this.levelFilter.setValue(searchTxt);
          this.isSelectAllLevel = !this.isSelectAllLevel;
        } else {
          this.levelFilter.setValue(null);
          this.isSelectAllLevel = !this.isSelectAllLevel;
        }
      }
    }
  }

  cleanFilterData(isExport = false) {
    const filterData = _.cloneDeep(this.filteredValues);
    //  console.log(this.filteredValues);
    let filterQuery = '';
    if (!isExport) {
      Object.keys(filterData).forEach((key) => {
        if (filterData[key] || filterData[key] === false) {
          if (key === 'name') {
            filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
          }
        }
      });
      return filterQuery;
    } else {
      Object.keys(filterData).forEach((key) => {
        if (filterData[key] || filterData[key] === false) {
          if (key === 'name') {
            filterQuery = filterQuery + `"${key}":"${filterData[key]}"`;
          }
        }
      });
      return filterQuery;
    }
  }

  resetFilter() {
    this.isReset = true;
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.campusFilter.setValue(null);
    this.levelFilter.setValue(null);
    this.seasonFilter.setValue(null);
    this.schoolsFilter.setValue(null);
    this.specialityFilter.setValue(null);
    this.intakeChannelFilter.setValue(null);

    this.sort.direction = '';
    this.sort.active = '';

    this.filteredValues = {
      name: null,
      school: null,
      campus: null,
      level: null,
      speciality: null,
      sector: null,
      scholar_season_ids: this.scholarSeasonId,
    };
    this.getAdmissionChannelsData();
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAdmissionChannelsData();
      }
    }
  }

  getAdmissionChannelName(intakeChannel) {
    const labelSub = intakeChannel.intake_channel.substring(0, 3).toUpperCase();
    const campusSub = intakeChannel.campus.substring(0, 3).toUpperCase();
    const levelSub = intakeChannel.level.substring(0, 1).toUpperCase();
    const specialityCode = intakeChannel.speciality.code;
    return `${intakeChannel.period} ${labelSub + campusSub} ${levelSub} \n ${specialityCode}`;
  }

  renderTooltipEntity(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    if (entities) {
      for (const entity of entities) {
        count++;
        if (count > 1) {
          if (entity && entity) {
            tooltip = tooltip + ', ';
            tooltip = tooltip + entity;
          }
        } else {
          if (entity && entity) {
            tooltip = tooltip + entity;
          }
        }
      }
      return tooltip;
    } else {
      return;
    }
  }

  renderTooltipEntityLegal(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    if (entities) {
      for (const entity of entities) {
        count++;
        if (count > 1) {
          if (entity && entity.legal_entity_name) {
            tooltip = tooltip + ', ';
            tooltip = tooltip + entity.legal_entity_name;
          }
        } else {
          if (entity && entity.legal_entity_name) {
            tooltip = tooltip + entity.legal_entity_name;
          }
        }
      }
      return tooltip;
    } else {
      return;
    }
  }

  formatCurrency(data) {
    let num = '';
    if (data) {
      num = parseInt(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
      num = num.toString().slice(0, -3);
    }
    return num;
  }
  getDataForList() {
    // if (this.campusFilter) {
    //   this.campusFilter = null;
    // }
    // if (this.levelFilter) {
    //   this.levelFilter = null;
    // }
    const name = [];
    let userType;
    this.currentUser.entities.filter((res) => {
      if (res.type.name === this.isPermission[0]) {
        userType = res.type._id;
      }
    });
    this.subs.sink = this.admissionService.GetAllSchoolScholar(name, this.scholarSeasonId, userType).subscribe(
      (resp) => {
        if (resp) {
          ////  console.log('Data Import => ', resp);
          this.listObjective = resp;
          this.schoolList = this.listObjective;
          this.getScholarPeriodList();
          this.getDataCampus();
        }
      },
      (error) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('OK'),
        });
      },
    );
  }

  // TO DO: Modify this when data from BE includes season Id
  getScholarPeriodList() {
    if (!this.dataSource.data && !this.dataSource.data.length) {
      return;
    }
    this.seasonList = _.uniq(
      _.cloneDeep(this.dataSource.data).map((data) => data.season),
      (data) => data.season,
    );
    //  console.log('season List', this.seasonList);
  }

  getDataCampus() {
    this.levelList = [];
    this.campusList = [];
    if (this.listObjective && this.listObjective.length) {
      if (this.schoolsFilter.value) {
        const school = this.schoolsFilter.value;
        const scampusList = this.listObjective.filter((list) => {
          return school.includes(list.short_name); // TO DO: Modify this when data from BE includes school Id
        });
        this.schoolName = scampusList && scampusList.length ? scampusList[0].short_name : '';
        scampusList.filter((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.filter((campuses, nex) => {
              this.campusList.push(campuses);
            });
          }
        });
        this.getDataLevel();
      } else {
        //  console.log('list Obective:', this.listObjective);
        if (this.listObjective && this.listObjective.length) {
          this.listObjective.filter((campus, n) => {
            if (campus && campus.campuses && campus.campuses.length) {
              if (campus.campuses && campus.campuses.length) {
                campus.campuses.filter((campuses, nex) => {
                  this.campusList.push(campuses);
                });
              }
            } else {
              this.campusList = [];
            }
          });
        } else {
          this.campusList = [];
        }
        this.getDataLevel();
      }
      this.campusList = _.uniqBy(this.campusList, 'name');
    }
  }

  getDataLevel() {
    this.levelList = [];
    if (this.campusList && this.campusList.length) {
      const sCampus = this.campusFilter.value;
      if (this.campusFilter.value) {
        const sLevelList = this.campusList.filter((list) => {
          return sCampus.includes(list.name);
        });
        sLevelList.forEach((element) => {
          element.levels.forEach((level) => {
            this.levelList.push(level);
          });
        });
      } else {
        this.campusList.forEach((element) => {
          element.levels.forEach((level) => {
            this.levelList.push(level);
          });
        });
      }
      this.levelList = _.uniqBy(this.levelList, 'name');
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      this.getDataAllForCheckbox(0);
    }
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isWaitingForResponse = true;
    let filter = this.cleanFilterData();
    filter +=
      this.filteredValues.school && this.filteredValues.school.length && this.filteredValues.school[0]
        ? ` school : ` + JSON.stringify(this.filteredValues.school)
        : '';
    filter +=
      this.filteredValues.campus && this.filteredValues.campus.length && this.filteredValues.campus[0]
        ? ` campus : ` + JSON.stringify(this.filteredValues.campus)
        : '';
    filter +=
      this.filteredValues.level && this.filteredValues.level.length && this.filteredValues.level[0]
        ? ` level : ` + JSON.stringify(this.filteredValues.level)
        : '';
    filter += ` scholar_season_ids: ["${this.scholarSeasonId}"]`;
    filter = 'filter: {' + filter + '}';
    // let filter = this.cleanFilterData();
    //  console.log('filteredQuery', filter, this.filteredValues);
    this.subs.sink = this.financeService.GetAdmissionIntakeDataCheckbox(pagination, this.sortValue, filter).subscribe(
      (students) => {
        if (students && students.length) {
          this.allStudentForCheckbox.push(...students);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
          console.log('getDataAllForCheckbox', this.selection, this.isCheckedAll);
          this.isWaitingForResponse = false;
          if (this.isCheckedAll) {
            if (this.allStudentForCheckbox && this.allStudentForCheckbox.length) {
              this.allStudentForCheckbox.forEach((element) => {
                this.selection.select(element._id);
                this.dataSelected.push(element);
              });
            }
            this.pageSelected.push(this.paginator.pageIndex);
          } else {
            this.pageSelected = [];
          }
        }
      },
      (error) => {
        this.isReset = false;
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('OK'),
        });
      },
    );
  }

  showOptions(info, row) {
    if (row) {
      const dataFilter = this.dataSelected.filter((resp) => resp._id === row._id);
      if (dataFilter && dataFilter.length < 1) {
        this.dataSelected.push(row);
      } else {
        const indexFilter = this.dataSelected.findIndex((resp) => resp._id === row._id);
        this.dataSelected.splice(indexFilter, 1);
      }
    }
    const numSelected = this.dataSelected.length;
    if (numSelected > 0) {
      this.disabledExport = false;
    } else {
      this.disabledExport = true;
    }
    this.userSelected = [];
    this.internshipId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.userSelected.push(user);
      this.internshipId.push(user._id);
    });
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  onDataExport() {
    this.allInternshipId = [];
    if (this.selectType === 'one') {
      const data = [];
      if (this.dataSelected.length) {
        //  console.log('selection', this.selection.selected);
        for (const item of this.dataSelected) {
          let intake = '';
          const volume = item.volume_hours && item.volume_hours.length ? item.volume_hours[item.volume_hours.length - 1].volume_hour : '';
          for (const entity of item.legal_entities_id) {
            intake = intake
              ? intake + ', ' + (entity.legal_entity_name ? entity.legal_entity_name : '')
              : entity.legal_entity_name
              ? entity.legal_entity_name
              : '';
          }
          const obj = [];
          obj[0] = item.intake_channel;
          obj[1] = item.season;
          obj[2] = item.school;
          obj[3] = item.campus;
          obj[4] = item.level;
          obj[5] = item.sector_id ? item.sector_id.name : '-';
          obj[6] = item.speciality_id ? item.speciality_id.name : '-';
          obj[7] = item.down_payment_id && item.down_payment_id.internal ? item.down_payment_id.internal : '';
          obj[8] = item.down_payment_id && item.down_payment_id.external ? item.down_payment_id.external : '';
          obj[9] = item.full_rate_id && item.full_rate_id.amount_internal ? item.full_rate_id.amount_internal : '';
          obj[10] = item.full_rate_id && item.full_rate_id.amount_external ? item.full_rate_id.amount_external : '';
          obj[11] = intake ? intake : '-';
          obj[12] = volume ? volume : '-';
          data.push(obj);
        }
        //  console.log('data', data);
        const valueRange = { values: data };
        const today = moment().format('DD-MM-YYYY');
        const sheetID = this.translate.currentLang === 'en' ? 0 : 997136311;
        const title = this.exportName + '_' + today;
        const sheetData = {
          spreadsheetId: '1j7EAJvvHoPC7DffQxfIPVNGKztSZc0YyjE-I2zf0r2I',
          sheetId: sheetID,
          range: 'A4',
        };
        this.exportCsvService.createAndUpdateSpreadsheet(valueRange, title, sheetData);
      }
      Swal.close();
    } else {
      this.getAllExportData(0);
    }
  }

  getAllExportData(pageNumber: number) {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: 500,
      page: pageNumber,
    };
    let filter = this.cleanFilterData();
    filter +=
      this.filteredValues.school && this.filteredValues.school.length && this.filteredValues.school[0]
        ? ` school : ` + JSON.stringify(this.filteredValues.school)
        : '';
    filter +=
      this.filteredValues.campus && this.filteredValues.campus.length && this.filteredValues.campus[0]
        ? ` campus : ` + JSON.stringify(this.filteredValues.campus)
        : '';
    filter +=
      this.filteredValues.level && this.filteredValues.level.length && this.filteredValues.level[0]
        ? ` level : ` + JSON.stringify(this.filteredValues.level)
        : '';
    filter += ` scholar_season_ids: ["${this.scholarSeasonId}"]`;
    filter = 'filter: {' + filter + '}';
    this.subs.sink = this.financeService
      .GetAdmissionIntakeData(pagination, this.sortValue, filter)
      .pipe(
        map((intakeArr) =>
          intakeArr.map((intake) => {
            const newIntake: any = Object.assign({}, intake);
            const intakeDetails = intake.intake_channel_detail.split(' - ');
            [newIntake.season, newIntake.school, newIntake.campus, newIntake.level] = intakeDetails;
            return newIntake;
          }),
        ),
      )
      .subscribe(
        (res) => {
          if (res && res.length) {
            this.allInternshipId.push(...res);
            const pages = pageNumber + 1;
            //  console.log(this.allInternshipId);

            this.getAllExportData(pages);
          } else {
            this.isWaitingForResponse = false;
            this.exportAllData(this.allInternshipId);
          }
        },
        (error) => {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        },
      );
  }

  downloadCSV() {
    if (this.utilityService.checkIfCandidateSelectNotNull(this.dataSelected.length, 'Intake Channel')) {
      return;
    } else {
      const inputOptions = {
        ',': this.translate.instant('IMPORT_DECISION_S1.COMMA'),
        ';': this.translate.instant('IMPORT_DECISION_S1.SEMICOLON'),
        tab: this.translate.instant('IMPORT_DECISION_S1.TAB'),
      };
      // const currentLang = this.translate.currentLang;
      Swal.fire({
        type: 'question',
        title: this.translate.instant('EXPORT_DECISION.TITLE'),
        width: 465,
        allowEscapeKey: true,
        showCancelButton: true,
        cancelButtonText: this.translate.instant('IMPORT_DECISION_S1.CANCEL'),
        confirmButtonText: this.translate.instant('IMPORT_DECISION_S1.OK'),
        input: 'radio',
        inputOptions: inputOptions,
        inputValue: this.translate && this.translate.currentLang === 'fr' ? ';' : '',
        inputValidator: (value) => {
          return new Promise((resolve, reject) => {
            if (value) {
              resolve('');
              Swal.enableConfirmButton();
            } else {
              Swal.disableConfirmButton();
              reject(this.translate.instant('IMPORT_DECISION_S1.INVALID'));
            }
          });
        },
        onOpen: function () {
          Swal.disableConfirmButton();
          Swal.getContent().addEventListener('click', function (e) {
            Swal.enableConfirmButton();
          });
          const input = Swal.getInput();
          const inputValue = input.getAttribute('value');
          if (inputValue === ';') {
            Swal.enableConfirmButton();
          }
        },
      }).then((separator) => {
        if (separator.value) {
          const fileType = separator.value;
          this.openDownloadCsv(fileType);
        }
      });
    }
  }

  openDownloadCsv(fileType) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const importStudentTemlate = `downloadAdmissionChannel/`;
    console.log('_ini filter', this.userSelected);
    let filter;
    if (this.userSelected.length && !this.isCheckedAll) {
      const mappedIds = [...new Set(this.userSelected.map((res) => `"` + res._id + `"`))];
      console.log(mappedIds);
      filter = `filter={"program_ids":` + '[' + mappedIds.toString() + '] }';
    } else {
      // filter = `filter={}`;
      filter = this.cleanFilterData(true);
      filter += filter ? ',' + `"scholar_season_ids":["${this.scholarSeasonId}"]` : `"scholar_season_ids":["${this.scholarSeasonId}"]`;
      filter +=
        this.filteredValues.school && this.filteredValues.school.length && this.filteredValues.school[0]
          ? ',' + `"school":` + JSON.stringify(this.filteredValues.school)
          : '';
      filter +=
        this.filteredValues.campus && this.filteredValues.campus.length && this.filteredValues.campus[0]
          ? ',' + `"campus":` + JSON.stringify(this.filteredValues.campus)
          : '';
      filter +=
        this.filteredValues.level && this.filteredValues.level.length && this.filteredValues.level[0]
          ? ',' + `"level":` + JSON.stringify(this.filteredValues.level)
          : '';
      filter = 'filter={' + filter + '}';
    }
    element.href = encodeURI(
      url + importStudentTemlate + fileType + '/' + lang + '?' + filter + '&' + `user_type_id="${this.currentUserTypeId}"`,
    );
    console.log(element.href);
    element.target = '_blank';
    element.download = 'Template Import CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  exportAllData(exportData) {
    const datasForExport = exportData;
    const data = [];
    if (datasForExport && datasForExport.length) {
      //  console.log('selection', datasForExport);
      for (const item of datasForExport) {
        let intake = '';
        const volume = item.volume_hours && item.volume_hours.length ? item.volume_hours[item.volume_hours.length - 1].volume_hour : '';
        for (const entity of item.legal_entities_id) {
          intake = intake
            ? intake + ', ' + (entity.legal_entity_name ? entity.legal_entity_name : '')
            : entity.legal_entity_name
            ? entity.legal_entity_name
            : '';
        }
        const obj = [];
        obj[0] = item.intake_channel;
        obj[1] = item.season;
        obj[2] = item.school;
        obj[3] = item.campus;
        obj[4] = item.level;
        obj[5] = item.sector_id ? item.sector_id.name : '-';
        obj[6] = item.speciality_id ? item.speciality_id.name : '-';
        obj[7] = item.down_payment_id && item.down_payment_id.internal ? item.down_payment_id.internal : '-';
        obj[8] = item.down_payment_id && item.down_payment_id.external ? item.down_payment_id.external : '-';
        obj[9] = item.full_rate_id && item.full_rate_id.amount_internal ? item.full_rate_id.amount_internal : '-';
        obj[10] = item.full_rate_id && item.full_rate_id.amount_external ? item.full_rate_id.amount_external : '-';
        obj[11] = intake ? intake : '-';
        obj[12] = volume ? volume : '-';
        data.push(obj);
      }
      //  console.log('data', data);
      const valueRange = { values: data };
      const today = moment().format('DD-MM-YYYY');
      const sheetID = this.translate.currentLang === 'en' ? 0 : 997136311;
      const title = this.exportName + '_' + today;
      const sheetData = {
        spreadsheetId: '1j7EAJvvHoPC7DffQxfIPVNGKztSZc0YyjE-I2zf0r2I',
        sheetId: sheetID,
        range: 'A4',
      };
      this.exportCsvService.createAndUpdateSpreadsheet(valueRange, title, sheetData);
    }
    Swal.close();
  }

  onEditFlyer(element) {
    this.subs.sink = this.dialog
      .open(FlyerDialogComponent, {
        width: '600px',
        minHeight: '100px',
        data: element,
        disableClose: true,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          //  console.log(res);
          this.getAdmissionChannelsData();
        }
      });
  }

  onDownloadFlyer(element) {
    const fileUrl = element.admission_flyer.s3_file_name;
    if (!fileUrl) {
      return;
    }
    const link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.download = fileUrl;
    link.href = `${environment.apiUrl}/fileuploads/${fileUrl}?download=true`.replace('/graphql', '');
    link.target = '_blank';
    link.click();
    link.remove();
  }

  onEditCondition(element) {
    this.subs.sink = this.dialog
      .open(ConditionDialogComponent, {
        width: '600px',
        minHeight: '100px',
        data: element,
        disableClose: true,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          //  console.log(res);
          this.getAdmissionChannelsData();
        }
      });
  }

  onDownloadCondition(element) {
    const fileUrl = element.admission_document.s3_file_name;
    if (!fileUrl) {
      return;
    }
    const link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.download = fileUrl;
    link.href = `${environment.apiUrl}/fileuploads/${fileUrl}?download=true`.replace('/graphql', '');
    link.target = '_blank';
    link.click();
    link.remove();
  }
}
