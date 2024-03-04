import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FinancesService } from 'app/service/finance/finance.service';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { ActivatedRoute } from '@angular/router';
import { ExportCsvService } from 'app/service/export-csv/export-csv.service';
import * as moment from 'moment';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { Observable, of } from 'rxjs';
import { environment } from 'environments/environment';
import { SelectionModel } from '@angular/cdk/collections';
import { AuthService } from 'app/service/auth-service/auth.service';
import { ConnectLegalEntityDialogComponent } from './connect-legal-entity-dialog/connect-legal-entity-dialog.component';
import { AddInducedHourCoefficientDialogComponent } from './add-induced-hour-coefficient-dialog/add-induced-hour-coefficient-dialog.component';
import { AddPaidLeaveAllowanceDialogComponent } from './add-paid-leave-allowance-dialog/add-paid-leave-allowance-dialog.component';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';

@Component({
  selector: 'ms-legal',
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.scss'],
})
export class LegalComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() scholarSeason: any;
  schoolData: any;
  short_name: any;
  intakeChannelCount;
  dataSource = new MatTableDataSource([]);
  titleData: any;
  noData: any;
  displayedColumns: string[] = [
    'select',
    'scholarSeason',
    'school',
    'campus',
    'level',
    'sector',
    'speciality',
    'legalEntity',
    'paidLeaveAllowanceRate',
    'inducedHoursCoefficient',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'scholarSeasonFilter',
    'schoolFilter',
    'campusFilter',
    'levelFilter',
    'sectorFilter',
    'specialityFilter',
    'legalEntityFilter',
    'paidLeaveAllowanceRateFilter',
    'inducedHoursCoefficientFilter',
  ];
  filteredValues = {
    school: [],
    campus: [],
    level: [],
    scholar_season_ids: [],
    name: '',
    sector: [],
    speciality: [],
    sectors: [],
    specialties: [],
    legal_entity_id: null,
  };
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  scholarId: any;
  registrationProfileCount;
  isWaitingForResponse = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isLoading: Boolean = false;
  dataCount = 0;
  private subs = new SubSink();

  registrationProfileFilter = new UntypedFormControl('');
  discountFilter = new UntypedFormControl('');
  descriptionFilter = new UntypedFormControl('');
  private timeOutVal: any;
  selection = new SelectionModel<any>(true, []);
  isCheckedAll = false;
  disabledExport = true;
  userSelected = [];
  userSelectedId = [];
  selectType;

  allInternshipId = [];
  exportName: string;
  schoolsFilter = new UntypedFormControl(['All']);
  campusFilter = new UntypedFormControl(['All']);
  levelFilter = new UntypedFormControl(['All']);
  sectorFilter = new UntypedFormControl(['All']);
  specialityFilter = new UntypedFormControl(['All']);
  schoolList: any;
  listObjective: any[];
  levelList: any[];
  campusList: any[];
  scholarSeasons: any;

  sectorFilterCtrl = new UntypedFormControl(null);
  sectorlFiltered: Observable<any[]>;
  sectorListFilter = [];

  specialityFilterCtrl = new UntypedFormControl(null);
  specialityFiltered: Observable<any[]>;
  specialityListFilter = [];

  legalFilterCtrl = new UntypedFormControl('All');
  legallFiltered: Observable<any[]>;
  legalListFilter = [];

  analyticFilterCtrl = new UntypedFormControl(null);
  analyticlFiltered: Observable<any[]>;
  analyticListFilter = [];

  accountingAccountFilterCtrl = new UntypedFormControl(null);
  accountingAccountlFiltered: Observable<any[]>;
  accountingAccountListFilter = [];

  isSelectAllSchool = true;
  isSelectAllCampous = true;
  isSelectAllLevel = true;
  isSelectAllSector = true;
  isSelectAllSpeciality = true;
  isPermission: string[];
  currentUser: any;
  schoolId: any;
  currentUserTypeId: any;
  allStudentForCheckbox = [];
  dataSelected = [];
  pageSelected = [];
  dataUnselectUser = [];
  allExportForCheckbox = [];
  allPaidLeaveAllowanceRateCheckbox = [];
  allDataForAddInductedHours = [];
  allDataForCheckboxConnectLegal = [];
  filterBreadcrumbData: any[] = [];

  constructor(
    private dialog: MatDialog,
    private financeService: FinancesService,
    private exportCsvService: ExportCsvService,
    private translateService: TranslateService,
    private pageTitleService: PageTitleService,
    private admissionService: AdmissionDashboardService,
    private router: ActivatedRoute,
    private userService: AuthService,
    private intakeService: IntakeChannelService,
    private permission: PermissionService,
    private utilService: UtilityService,
    private httpClient: HttpClient,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.resetTable();
      this.displayWithLegal(this.legalFilterCtrl.value);
    });
    if (this.scholarSeason && this.scholarSeason._id) {
      this.scholarId = this.scholarSeason._id;
      this.filteredValues.scholar_season_ids = this.scholarSeason._id;
    }
    if (this.scholarSeason && this.scholarSeason.scholar_season) {
      this.scholarSeasons = this.scholarSeason.scholar_season;
    } else {
      this.scholarSeasons = '';
    }
    this.subs.sink = this.router.paramMap.subscribe((param) => {
      this.schoolId = param.get('id');
    });
    this.initUser();
    // this.initFilter();
    if (this.schoolId) {
      this.getSchoolData();
    }
  }

  initUser() {
    this.isPermission = this.userService.getPermission();
    this.currentUser = this.userService.getLocalStorageUser();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
  }

  getSchoolData() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.intakeService.GetOneSchoolLegal(this.schoolId, this.scholarId).subscribe(
      (resp) => {
        if (resp) {
          this.schoolData = _.cloneDeep(resp);
          this.short_name = resp.short_name;
          if (this.schoolData) {
            this.getAccountingData('getSchoolData');
            this.getAllFilterDropdown();
          }
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
        this.isWaitingForResponse = false;
        if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('Invalid_Form_Warning.TITLE'),
            text: err && err['message'] ? this.translateService.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translateService.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getAccountingData(type?) {
    // console.log('getAccountingData', type);
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    let filter = '';
    filter += ` school : [` + JSON.stringify(this.schoolData.short_name) + `]`;
    filter +=
      this.filteredValues.campus && this.filteredValues.campus.length && this.filteredValues.campus[0]
        ? ` campus : ` + JSON.stringify(this.filteredValues.campus)
        : '';
    filter +=
      this.filteredValues.level && this.filteredValues.level.length && this.filteredValues.level[0]
        ? ` level : ` + JSON.stringify(this.filteredValues.level)
        : '';
    filter +=
      this.filteredValues.sectors && this.filteredValues.sectors.length && this.filteredValues.sectors[0]
        ? ` sectors : ` + JSON.stringify(this.filteredValues.sectors)
        : '';
    filter +=
      this.filteredValues.specialties && this.filteredValues.specialties.length && this.filteredValues.specialties[0]
        ? ` specialties : ` + JSON.stringify(this.filteredValues.specialties)
        : '';
    filter += this.filteredValues.legal_entity_id ? ` legal_entity_id : ` + JSON.stringify(this.filteredValues.legal_entity_id) : '';
    filter +=
      this.filteredValues.speciality && this.filteredValues.speciality.length
        ? ` speciality : ` + JSON.stringify(this.filteredValues.speciality)
        : '';
    filter += ` scholar_season_ids: ["${this.scholarId}"]`;
    filter = 'filter: {' + filter + '}';
    this.subs.sink = this.financeService.GetAdmissionIntakeData(pagination, this.sortValue, filter).subscribe(
      (registrationProfile: any) => {
        if (registrationProfile && registrationProfile.length) {
          this.dataSource.data = registrationProfile;
          this.paginator.length = registrationProfile[0].count_document;
          this.dataCount = registrationProfile[0].count_document;
          this.getDataForList();
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.filterBreadcrumbFormat();
        this.disabledExport = true;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.userService.postErrorLog(err);
        this.disabledExport = true;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
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
        } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: err && err['message'] ? this.translateService.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }

  getDataForList() {
    this.subs.sink = this.admissionService.GetOneCandidateSchool(this.schoolId, this.scholarId).subscribe(
      (resp) => {
        if (resp) {
          this.listObjective = [resp];
          this.schoolList = this.listObjective;
          this.getDataCampus();
        }
      },
      (error) => {
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }

  getDataCampus() {
    this.levelList = [];
    this.campusList = [];
    const schools = this.schoolsFilter.value;
    if (this.schoolsFilter.value && !schools.includes('All')) {
      const school = this.schoolsFilter.value;
      const scampusList = this.listObjective.filter((list) => {
        return school.includes(list.short_name); // TO DO: Modify this when data from BE includes school Id
      });
      scampusList.filter((campus, n) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses, nex) => {
            this.campusList.push(campuses);
          });
        }
      });
      this.getDataLevel();
    } else {
      this.listObjective.filter((campus, n) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses, nex) => {
            this.campusList.push(campuses);
          });
        }
      });
      this.getDataLevel();
    }

    this.campusList = _.uniqBy(this.campusList, 'name');
    this.campusList = this.campusList.sort((a, b) => {
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
  }

  getDataLevel() {
    this.levelList = [];
    const sCampus = this.campusFilter.value;
    if (this.campusFilter?.value?.length && !sCampus.includes('All')) {
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
    this.levelList = this.levelList.sort((a, b) => {
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset && this.schoolData) {
            this.getAccountingData('ngAfterViewInit');
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAccountingData();
      }
    }
  }

  resetTable() {
    this.isReset = true;
    this.selection.clear();
    this.dataSelected = [];
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
    this.allPaidLeaveAllowanceRateCheckbox = [];
    this.allDataForCheckboxConnectLegal = [];
    this.allDataForAddInductedHours = [];
    this.isCheckedAll = false;
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });

    this.filteredValues = {
      school: [],
      campus: [],
      level: [],
      scholar_season_ids: this.scholarId,
      name: '',
      sector: [],
      speciality: [],
      sectors: [],
      specialties: [],
      legal_entity_id: null,
    };
    this.disabledExport = true;
    this.schoolsFilter.setValue(['All'], { emitEvent: false });
    this.campusFilter.setValue(['All'], { emitEvent: false });
    this.levelFilter.setValue(['All'], { emitEvent: false });
    this.sectorFilter.setValue(['All'], { emitEvent: false });
    this.specialityFilter.setValue(['All'], { emitEvent: false });
    this.sectorFilterCtrl.setValue(null);
    this.specialityFilterCtrl.setValue(null);
    this.analyticFilterCtrl.setValue(null);
    this.legalFilterCtrl.setValue('All');
    this.accountingAccountFilterCtrl.setValue(null);
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.isSelectAllSchool = true;
    this.isSelectAllCampous = true;
    this.isSelectAllLevel = true;
    this.isSelectAllSector = true;
    this.isSelectAllSpeciality = true;
    this.getAccountingData();

    this.legallFiltered = of(this.legalListFilter);
    this.filterBreadcrumbData = [];
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
      }
    });
    return filterQuery;
  }

  // initFilter() {
  //   // need to add debounceTime to the filters (multiple) that has an "All" value
  //   // because valueChanges was triggered before "click event" in "All" option
  //   this.subs.sink = this.campusFilter.valueChanges.pipe(debounceTime(100)).subscribe((searchTxt: string[]) => {
  //     if (searchTxt && searchTxt.length) {
  //       const selectAll = searchTxt.find((resp) => resp === 'All');
  //       const selectNonAll = searchTxt.find((resp) => resp !== 'All');
  //       if (!selectAll && searchTxt.length) {
  //         this.isSelectAllCampous = false;
  //         this.levelFilter.setValue(['All'], { emitEvent: false });
  //         this.filteredValues.level = null;
  //         this.filteredValues.campus = searchTxt;
  //         this.paginator.pageIndex = 0;
  //         if (!this.isReset) {
  //           this.getAccountingData();
  //         }
  //       } else {
  //         if (selectNonAll && searchTxt.length) {
  //           const indexAll = searchTxt.findIndex((resp) => resp === 'All');
  //           searchTxt.splice(indexAll, 1);
  //           this.isSelectAllCampous = false;
  //           this.campusFilter.setValue(searchTxt);
  //         } else {
  //           this.filteredValues.level = null;
  //           this.filteredValues.campus = null;
  //           this.paginator.pageIndex = 0;
  //           if (!this.isReset) {
  //             this.getAccountingData();
  //           }
  //         }
  //       }
  //     } else {
  //       this.campusFilter.setValue(null, { emitEvent: false });
  //       this.levelFilter.setValue(['All'], { emitEvent: false });
  //       this.filteredValues.level = null;
  //       this.filteredValues.campus = null;
  //       this.paginator.pageIndex = 0;
  //       if (!this.isReset) {
  //         this.getAccountingData();
  //       }
  //     }
  //   });
  //   this.subs.sink = this.levelFilter.valueChanges.pipe(debounceTime(100)).subscribe((searchTxt: string[]) => {
  //     if (searchTxt && searchTxt.length) {
  //       const selectAll = searchTxt.find((resp) => resp === 'All');
  //       const selectNonAll = searchTxt.find((resp) => resp !== 'All');
  //       if (!selectAll && searchTxt.length) {
  //         this.isSelectAllLevel = false;
  //         this.filteredValues.level = searchTxt;
  //         this.paginator.pageIndex = 0;
  //         if (!this.isReset) {
  //           this.getAccountingData();
  //         }
  //       } else {
  //         if (selectNonAll && searchTxt.length) {
  //           const indexAll = searchTxt.findIndex((resp) => resp === 'All');
  //           searchTxt.splice(indexAll, 1);
  //           this.isSelectAllLevel = false;
  //           this.levelFilter.setValue(searchTxt);
  //         } else {
  //           this.filteredValues.level = null;
  //           this.paginator.pageIndex = 0;
  //           if (!this.isReset) {
  //             this.getAccountingData();
  //           }
  //         }
  //       }
  //     } else {
  //       this.levelFilter.setValue(null, { emitEvent: false });
  //       this.filteredValues.level = null;
  //       this.paginator.pageIndex = 0;
  //       if (!this.isReset) {
  //         this.getAccountingData();
  //       }
  //     }
  //   });
  //   this.subs.sink = this.sectorFilter.valueChanges.pipe(debounceTime(100)).subscribe((searchTxt: string[]) => {
  //     if (searchTxt && searchTxt.length) {
  //       const selectAll = searchTxt.find((resp) => resp === 'All');
  //       const selectNonAll = searchTxt.find((resp) => resp !== 'All');
  //       if (!selectAll && searchTxt.length) {
  //         this.isSelectAllSector = false;
  //         this.filteredValues.sectors = searchTxt;
  //         this.paginator.pageIndex = 0;
  //         if (!this.isReset) {
  //           this.getAccountingData();
  //         }
  //       } else {
  //         if (selectNonAll && searchTxt.length) {
  //           const indexAll = searchTxt.findIndex((resp) => resp === 'All');
  //           searchTxt.splice(indexAll, 1);
  //           this.isSelectAllSector = false;
  //           this.sectorFilter.setValue(searchTxt);
  //         } else {
  //           this.filteredValues.sectors = null;
  //           this.paginator.pageIndex = 0;
  //           if (!this.isReset) {
  //             this.getAccountingData();
  //           }
  //         }
  //       }
  //     } else {
  //       this.sectorFilter.setValue(null, { emitEvent: false });
  //       this.filteredValues.sectors = null;
  //       this.paginator.pageIndex = 0;
  //       if (!this.isReset) {
  //         this.getAccountingData();
  //       }
  //     }
  //   });
  //   this.subs.sink = this.specialityFilter.valueChanges.pipe(debounceTime(100)).subscribe((searchTxt: string[]) => {
  //     if (searchTxt && searchTxt.length) {
  //       const selectAll = searchTxt.find((resp) => resp === 'All');
  //       const selectNonAll = searchTxt.find((resp) => resp !== 'All');
  //       if (!selectAll && searchTxt.length) {
  //         this.isSelectAllSpeciality = false;
  //         this.filteredValues.specialties = searchTxt;
  //         this.paginator.pageIndex = 0;
  //         if (!this.isReset) {
  //           this.getAccountingData();
  //         }
  //       } else {
  //         if (selectNonAll && searchTxt.length) {
  //           const indexAll = searchTxt.findIndex((resp) => resp === 'All');
  //           searchTxt.splice(indexAll, 1);
  //           this.isSelectAllSpeciality = false;
  //           this.specialityFilter.setValue(searchTxt);
  //         } else {
  //           this.filteredValues.specialties = null;
  //           this.paginator.pageIndex = 0;
  //           if (!this.isReset) {
  //             this.getAccountingData();
  //           }
  //         }
  //       }
  //     } else {
  //       this.specialityFilter.setValue(null, { emitEvent: false });
  //       this.filteredValues.specialties = null;
  //       this.paginator.pageIndex = 0;
  //       if (!this.isReset) {
  //         this.getAccountingData();
  //       }
  //     }
  //   });
  // }

  setFilterSelected(type) {
    switch (type) {
      case 'campus':
        if (this.isSelectAllCampous) {
          // this.clearSelectIfFilter();
          this.selectAll('campus');
        } else {
          const tempCampus = _.cloneDeep(this.campusFilter.value);
          const idsCampus = [];
          tempCampus.filter((res) => {
            if (res) {
              idsCampus.push(res);
            }
          });
          const selectAll = idsCampus.some((res) => res === 'All');
          if (selectAll) {
            this.isSelectAllCampous = true;
            // this.clearSelectIfFilter();
            this.selectAll('campus');
          } else {
            this.isSelectAllCampous = false;
            this.campusFilter.setValue(idsCampus);
            // this.clearSelectIfFilter();
            const resultCampus = this.campusFilter.value;
            this.filteredValues.campus = resultCampus && resultCampus.length > 0 ? resultCampus : null;
            this.paginator.pageIndex = 0;
            this.getAccountingData();
          }
        }
        break;
      case 'level':
        if (this.isSelectAllLevel) {
          // this.clearSelectIfFilter();
          this.selectAll('level');
        } else {
          this.isSelectAllLevel = false;
          const tempLevel = _.cloneDeep(this.levelFilter.value);
          const idsLevel = [];
          tempLevel.filter((res) => {
            if (res) {
              idsLevel.push(res);
            }
          });
          const selectAll = idsLevel.some((res) => res === 'All');
          if (selectAll) {
            this.isSelectAllLevel = true;
            // this.clearSelectIfFilter();
            this.selectAll('level');
          } else {
            this.levelFilter.setValue(idsLevel);
            // this.clearSelectIfFilter();
            const resultLevel = this.levelFilter.value;
            this.filteredValues.level = resultLevel && resultLevel.length > 0 ? resultLevel : null;
            this.paginator.pageIndex = 0;
            this.getAccountingData();
          }
        }
        break;
      case 'sector':
        if (this.isSelectAllSector) {
          // this.clearSelectIfFilter();
          this.selectAll('sector');
        } else {
          const tempSector = _.cloneDeep(this.sectorFilter.value);
          const idsSector = [];
          tempSector.filter((res) => {
            if (res) {
              idsSector.push(res);
            }
          });

          const selectAll = idsSector.some((res) => res === 'All');
          if (selectAll) {
            this.isSelectAllSector = true;
            // this.clearSelectIfFilter();
            this.selectAll('sector');
          } else {
            this.isSelectAllSector = false;
            this.sectorFilter.setValue(idsSector);
            // this.clearSelectIfFilter();
            const resultSector = this.sectorFilter.value;
            this.filteredValues.sectors = resultSector && resultSector.length > 0 ? resultSector : null;
            this.paginator.pageIndex = 0;
            this.getAccountingData();
          }
        }
        break;
      case 'speciality':
        if (this.isSelectAllSpeciality) {
          // this.clearSelectIfFilter();
          this.selectAll('speciality');
        } else {
          const tempSpeciality = _.cloneDeep(this.specialityFilter.value);
          const idsSpeciality = [];
          tempSpeciality.filter((res) => {
            if (res) {
              idsSpeciality.push(res);
            }
          });

          const selectAll = idsSpeciality.some((res) => res === 'All');
          if (selectAll) {
            this.isSelectAllSpeciality = true;
            // this.clearSelectIfFilter();
            this.selectAll('speciality');
          } else {
            this.isSelectAllSpeciality = false;
            this.specialityFilter.setValue(idsSpeciality);
            // this.clearSelectIfFilter();
            const resultSpeciality = this.specialityFilter.value;
            this.filteredValues.specialties = resultSpeciality && resultSpeciality.length > 0 ? resultSpeciality : null;
            this.paginator.pageIndex = 0;
            this.getAccountingData();
          }
        }
        break;
      default:
        break;
    }
  }

  selectAll(type: string) {
    const searchTxt = ['All'];
    if (type === 'campus') {
      if (this.campusList && this.campusList.length) {
        if (this.isSelectAllCampous) {
          this.isSelectAllCampous = false;
          const idsCampus = [];
          const tempCampus = _.cloneDeep(this.campusFilter.value);
          tempCampus.filter((res) => {
            if (res !== 'All') {
              idsCampus.push(res);
            }
          });

          this.filteredValues.campus = idsCampus && idsCampus.length > 0 ? idsCampus : null;
          this.campusFilter.setValue(idsCampus);
        } else {
          this.isSelectAllCampous = true;
          this.campusFilter.setValue(searchTxt);
          this.filteredValues.campus = null;
        }
      } else {
        if (this.campusFilter) {
          this.campusFilter.setValue(searchTxt);
          this.isSelectAllCampous = !this.isSelectAllCampous;
        } else {
          this.campusFilter.setValue(null);
          this.isSelectAllCampous = !this.isSelectAllCampous;
        }
      }
      // this.clearSelectIfFilter();
      this.paginator.pageIndex = 0;
      this.getAccountingData();
    } else if (type === 'level') {
      if (this.levelList && this.levelList.length) {
        if (this.isSelectAllLevel) {
          this.isSelectAllLevel = false;
          const idsLevel = [];
          const tempLevel = _.cloneDeep(this.levelFilter.value);
          tempLevel.filter((res) => {
            if (res !== 'All') {
              idsLevel.push(res);
            }
          });

          this.filteredValues.level = idsLevel && idsLevel.length > 0 ? idsLevel : null;
          this.levelFilter.setValue(idsLevel);
        } else {
          this.isSelectAllLevel = true;
          this.levelFilter.setValue(searchTxt);
          this.filteredValues.level = null;
        }
      } else {
        if (this.levelFilter) {
          this.levelFilter.setValue(searchTxt);
          this.isSelectAllLevel = !this.isSelectAllLevel;
        } else {
          this.levelFilter.setValue(null);
          this.isSelectAllLevel = !this.isSelectAllLevel;
        }
      }
      // this.clearSelectIfFilter();
      this.paginator.pageIndex = 0;
      this.getAccountingData();
    } else if (type === 'sector') {
      if (this.sectorListFilter && this.sectorListFilter.length) {
        if (this.isSelectAllSector) {
          this.isSelectAllSector = false;
          const idsSector = [];
          const tempSector = _.cloneDeep(this.sectorFilter.value);
          tempSector.filter((res) => {
            if (res !== 'All') {
              idsSector.push(res);
            }
          });
          this.filteredValues.sectors = idsSector && idsSector.length > 0 ? idsSector : null;
          this.sectorFilter.setValue(idsSector);
        } else {
          this.isSelectAllSector = true;
          this.sectorFilter.setValue(searchTxt);
          this.filteredValues.sectors = null;
        }
      } else {
        if (this.sectorFilter) {
          this.sectorFilter.setValue(searchTxt);
          this.isSelectAllSector = !this.isSelectAllSector;
        } else {
          this.sectorFilter.setValue(null);
          this.isSelectAllSector = !this.isSelectAllSector;
        }
      }
      // this.clearSelectIfFilter();
      this.paginator.pageIndex = 0;
      this.getAccountingData();
    } else if (type === 'speciality') {
      if (this.specialityListFilter && this.specialityListFilter.length) {
        if (this.isSelectAllSpeciality) {
          this.isSelectAllSpeciality = false;
          const idsSpeciality = [];
          const tempSpeciality = _.cloneDeep(this.specialityFilter.value);
          tempSpeciality.filter((res) => {
            if (res !== 'All') {
              idsSpeciality.push(res);
            }
          });
          this.filteredValues.specialties = idsSpeciality && idsSpeciality.length > 0 ? idsSpeciality : null;
          this.specialityFilter.setValue(idsSpeciality);
        } else {
          this.isSelectAllSpeciality = true;
          this.specialityFilter.setValue(searchTxt);
          this.filteredValues.specialties = null;
        }
      } else {
        if (this.specialityFilter) {
          this.specialityFilter.setValue(searchTxt);
          this.isSelectAllSpeciality = !this.isSelectAllSpeciality;
        } else {
          this.specialityFilter.setValue(null);
          this.isSelectAllSpeciality = !this.isSelectAllSpeciality;
        }
      }
      // this.clearSelectIfFilter();
      this.paginator.pageIndex = 0;
      this.getAccountingData();
    }
  }
  renderTooltipEntity(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    if (entities && entities.length) {
      for (const entity of entities) {
        count++;
        if (count > 1) {
          if (entity.legal_entity_name) {
            tooltip = tooltip + ', ';
            tooltip = tooltip + entity.legal_entity_name;
          }
        } else {
          if (entity.legal_entity_name) {
            tooltip = tooltip + entity.legal_entity_name;
          }
        }
      }
    }
    return tooltip;
  }
  renderTooltipEntityAccounting(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    if (entities && entities.length) {
      for (const entity of entities) {
        count++;
        if (count > 1) {
          if (entity.account_number) {
            tooltip = tooltip + ', ';
            tooltip = tooltip + entity.account_number;
          }
        } else {
          if (entity.account_number) {
            tooltip = tooltip + entity.account_number;
          }
        }
      }
    }
    return tooltip;
  }
  renderTooltipEntityAnalytical(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    if (entities && entities.length) {
      for (const entity of entities) {
        count++;
        if (count > 1) {
          if (entity.analytical_code) {
            tooltip = tooltip + ', ';
            tooltip = tooltip + entity.analytical_code;
          }
        } else {
          if (entity.analytical_code) {
            tooltip = tooltip + entity.analytical_code;
          }
        }
      }
    }
    return tooltip;
  }
  renderTooltipEntityProgram(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    if (entities && entities.length) {
      for (const entity of entities) {
        count++;
        if (count > 1) {
          if (entity) {
            tooltip = tooltip + ', ';
            tooltip = tooltip + entity;
          }
        } else {
          if (entity) {
            tooltip = tooltip + entity;
          }
        }
      }
    }
    return tooltip;
  }
  renderTooltipEntityAdditional(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    if (entities && entities.length) {
      for (const entity of entities) {
        count++;
        if (count > 1) {
          if (entity.additional_cost) {
            tooltip = tooltip + ', ';
            tooltip = tooltip + entity.additional_cost;
          }
        } else {
          if (entity.additional_cost) {
            tooltip = tooltip + entity.additional_cost;
          }
        }
      }
    }
    return tooltip;
  }

  deleteProfileRate(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translateService.instant('DELETE_ITEM_TEMPLATE.TITLE'),
      html: this.translateService.instant('CONFIRMDELETE', {
        value: data.name ? data.name : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('THUMBSUP.SWEET_ALERT.CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translateService.instant('DASHBOARD_DELETE.NO'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translateService.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translateService.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.subs.sink = this.financeService.DeleteProfilRate(data._id).subscribe(
          (resp) => {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.getAccountingData();
            });
          },
          (error) => {
            this.userService.postErrorLog(error);
            if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
              Swal.fire({
                type: 'warning',
                title: this.translateService.instant('BAD_CONNECTION.Title'),
                html: this.translateService.instant('BAD_CONNECTION.Text'),
                confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
              });
            } else {
              Swal.fire({
                type: 'info',
                title: this.translateService.instant('SORRY'),
                text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translateService.instant('OK'),
              });
            }
          },
        );
      }
    });
  }

  getAllExportData(pageNumber: number) {
    this.isLoading = true;
    const pagination = {
      limit: 500,
      page: pageNumber,
    };
    let filter = '';
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
    filter +=
      this.filteredValues.sectors && this.filteredValues.sectors.length && this.filteredValues.sectors[0]
        ? ` sectors : ` + JSON.stringify(this.filteredValues.sectors)
        : '';
    filter +=
      this.filteredValues.specialties && this.filteredValues.specialties.length && this.filteredValues.specialties[0]
        ? ` specialties : ` + JSON.stringify(this.filteredValues.specialties)
        : '';
    filter += this.filteredValues.legal_entity_id ? ` legal_entity_id : ` + JSON.stringify(this.filteredValues.legal_entity_id) : '';
    filter += ` scholar_season_ids: ["${this.scholarId}"]`;
    filter = 'filter: {' + filter + '}';
    this.subs.sink = this.financeService.GetAdmissionIntakeData(pagination, this.sortValue, filter).subscribe(
      (res: any) => {
        if (res && res.length) {
          this.allInternshipId.push(...res);
          const pages = pageNumber + 1;

          this.getAllExportData(pages);
        } else {
          this.isLoading = false;
          this.exportAllData(this.allInternshipId);
        }
      },
      (error) => {
        this.userService.postErrorLog(error);
        this.isLoading = false;
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }
  onDataExport() {
    this.allInternshipId = [];
    if (this.selectType === 'one') {
      const data = [];
      if (this.dataSelected.length) {
        for (const item of this.dataSelected) {
          let legalEntity = '';
          let analitycal = '';
          let code = '';
          const volume = item.volume_hours && item.volume_hours.length ? item.volume_hours[item.volume_hours.length - 1].volume_hour : '';
          for (const entity of item.legal_entities_id) {
            legalEntity = legalEntity ? legalEntity + ', ' + (entity.name ? entity.name : '') : entity.name ? entity.name : '';
          }
          for (const entity of item.analytical_code_id) {
            analitycal = analitycal
              ? analitycal + ', ' + (entity.analytical_code ? entity.analytical_code : '')
              : entity.analytical_code
              ? entity.analytical_code
              : '';
          }
          for (const entity of item.accounting_account_id) {
            code = code
              ? code + ', ' + (entity.account_number ? entity.account_number : '')
              : entity.account_number
              ? entity.account_number
              : '';
          }
          const obj = [];
          obj[0] = item.school;
          obj[1] = item.campus;
          obj[2] = item.level;
          obj[3] = item.sector_id.name;
          obj[4] = legalEntity ? legalEntity : '-';
          obj[5] = analitycal ? analitycal : '-';
          obj[6] = code ? code : '-';
          data.push(obj);
        }
        const valueRange = { values: data };
        const today = moment().format('DD-MM-YYYY');
        const sheetID = this.translateService.currentLang === 'en' ? 0 : 575276114;
        const title = this.exportName + '_' + today;
        const sheetData = {
          spreadsheetId: '1-IfKljcWkHYOhslgEAeeIMHQYL43gY3etW_WK-igBpY',
          sheetId: sheetID,
          range: 'A7',
        };
        this.exportCsvService.createAndUpdateSpreadsheet(valueRange, title, sheetData);
      }
      Swal.close();
    } else {
      this.getAllExportData(0);
    }
  }
  exportAllData(exportData) {
    const datasForExport = exportData;
    const data = [];
    if (datasForExport && datasForExport.length) {
      for (const item of datasForExport) {
        let legalEntity = '';
        let analitycal = '';
        let code = '';
        const volume = item.volume_hours && item.volume_hours.length ? item.volume_hours[item.volume_hours.length - 1].volume_hour : '';
        for (const entity of item.legal_entities_id) {
          legalEntity = legalEntity ? legalEntity + ', ' + (entity.name ? entity.name : '') : entity.name ? entity.name : '';
        }
        for (const entity of item.analytical_code_id) {
          analitycal = analitycal
            ? analitycal + ', ' + (entity.analytical_code ? entity.analytical_code : '')
            : entity.analytical_code
            ? entity.analytical_code
            : '';
        }
        for (const entity of item.accounting_account_id) {
          code = code
            ? code + ', ' + (entity.account_number ? entity.account_number : '')
            : entity.account_number
            ? entity.account_number
            : '';
        }
        const obj = [];
        obj[0] = item.school;
        obj[1] = item.campus;
        obj[2] = item.level;
        obj[3] = item.sector_id.name;
        obj[4] = legalEntity ? legalEntity : '-';
        obj[5] = analitycal ? analitycal : '-';
        obj[6] = code ? code : '-';
        data.push(obj);
      }
      const valueRange = { values: data };
      const today = moment().format('DD-MM-YYYY');
      const sheetID = this.translateService.currentLang === 'en' ? 0 : 575276114;
      const title = this.exportName + '_' + today;
      const sheetData = {
        spreadsheetId: '1-IfKljcWkHYOhslgEAeeIMHQYL43gY3etW_WK-igBpY',
        sheetId: sheetID,
        range: 'A7',
      };
      this.exportCsvService.createAndUpdateSpreadsheet(valueRange, title, sheetData);
    }
    Swal.close();
  }
  getAllDataForCheckboxConnectLegal(pageNumber) {
    if (this.isCheckedAll) {
      if (pageNumber === 0) {
        this.allDataForCheckboxConnectLegal = [];
        this.dataSelected = [];
      }
      const pagination = {
        limit: 500,
        page: pageNumber,
      };
      this.isLoading = true;
      let filter = '';
      filter += ` school : [` + JSON.stringify(this.schoolData.short_name) + `]`;
      filter +=
        this.filteredValues.campus && this.filteredValues.campus.length && this.filteredValues.campus[0]
          ? ` campus : ` + JSON.stringify(this.filteredValues.campus)
          : '';
      filter +=
        this.filteredValues.level && this.filteredValues.level.length && this.filteredValues.level[0]
          ? ` level : ` + JSON.stringify(this.filteredValues.level)
          : '';
      filter +=
        this.filteredValues.sectors && this.filteredValues.sectors.length && this.filteredValues.sectors[0]
          ? ` sectors : ` + JSON.stringify(this.filteredValues.sectors)
          : '';
      filter +=
        this.filteredValues.specialties && this.filteredValues.specialties.length && this.filteredValues.specialties[0]
          ? ` specialties : ` + JSON.stringify(this.filteredValues.specialties)
          : '';
      filter += this.filteredValues.legal_entity_id ? ` legal_entity_id : ` + JSON.stringify(this.filteredValues.legal_entity_id) : '';
      filter +=
        this.filteredValues.speciality && this.filteredValues.speciality.length
          ? ` speciality : ` + JSON.stringify(this.filteredValues.speciality)
          : '';
      filter += ` scholar_season_ids: ["${this.scholarId}"]`;
      filter = 'filter: {' + filter + '}';
      this.subs.sink = this.financeService.getAllDataIntakeChannelsForConnectLegal(pagination, this.sortValue, filter).subscribe(
        (students: any) => {
          if (students && students.length) {
            this.allDataForCheckboxConnectLegal.push(...students);
            const page = pageNumber + 1;
            this.getAllDataForCheckboxConnectLegal(page);
          } else {
            this.isLoading = false;
            if (this.isCheckedAll) {
              if (this.allDataForCheckboxConnectLegal && this.allDataForCheckboxConnectLegal.length) {
                this.dataSelected = this.allDataForCheckboxConnectLegal.filter((list) => !this.dataUnselectUser.includes(list._id));
                this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                this.onOpenConnectLegalEntity();
              }
            }
          }
        },
        (error) => {
          this.isReset = false;
          this.isLoading = false;
          this.userService.postErrorLog(error);
          if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
            Swal.fire({
              type: 'warning',
              title: this.translateService.instant('BAD_CONNECTION.Title'),
              html: this.translateService.instant('BAD_CONNECTION.Text'),
              confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          } else {
            Swal.fire({
              type: 'info',
              title: this.translateService.instant('SORRY'),
              text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translateService.instant('OK'),
            });
          }
        },
      );
    } else {
      this.onOpenConnectLegalEntity();
    }
  }

  onOpenConnectLegalEntity() {
    if (this.dataSelected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translateService.instant('Followup_S8.Title'),
        html: this.translateService.instant('Followup_S8.Text', { menu: this.translateService.instant('School-Tab.Legal') }),
        confirmButtonText: this.translateService.instant('Followup_S8.Button'),
      });
      return;
    }

    this.subs.sink = this.dialog
      .open(ConnectLegalEntityDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          scholar: this.scholarSeason,
          school: this.schoolData,
          selected: this.dataSelected,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getAccountingData();
          this.getAllFilterDropdown();
          this.clearSelectIfFilter();
        }
      });
  }

  sectorSelected(value) {
    if (value && value !== 'AllS') {
      const list = [];
      list.push(value);
      this.filteredValues.sector = list;
      this.getAccountingData();
    } else {
      this.filteredValues.sector = [];
      this.getAccountingData();
    }
  }

  specialitySelected(value) {
    if (value && value !== 'AllS') {
      const list = [];
      list.push(value);
      this.filteredValues.speciality = list;
      this.getAccountingData();
    } else {
      this.filteredValues.speciality = [];
      this.getAccountingData();
    }
  }

  legalEntitySelected(value) {
    if (value && value !== 'AllS') {
      this.filteredValues.legal_entity_id = value;
      this.getAccountingData('legal entity select if');
    } else {
      this.filteredValues.legal_entity_id = null;
      this.legallFiltered = of(this.legalListFilter);
      this.getAccountingData('legal entity select else');
    }
  }
  getAllFilterDropdown() {
    const filter = {
      scholar_season_id: this.scholarId,
      candidate_school_ids: [this.schoolId],
    };
    // Sector
    this.subs.sink = this.financeService.GetAllSectorsDropdown(filter).subscribe(
      (res) => {
        if (res) {
          this.sectorListFilter = res;
          this.sectorListFilter = this.sectorListFilter.sort((a, b) => {
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
          });
          this.sectorlFiltered = this.sectorFilterCtrl.valueChanges.pipe(
            startWith(''),
            map((searchText) =>
              searchText
                ? this.sectorListFilter
                    .filter((type) => (type ? type.name.toLowerCase().includes(searchText.toLowerCase()) : false))
                    .sort((a: any, b: any) => a.name.localeCompare(b.name))
                : this.sectorListFilter.sort((a: any, b: any) => a.name.localeCompare(b.name)),
            ),
          );
        }
      },
      (error) => {
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );

    this.subs.sink = this.financeService.getSpecialityIntakeChannelDropDown(this.schoolId, this.scholarId).subscribe(
      (res) => {
        if (res) {
          this.specialityListFilter = res;
          this.specialityListFilter = this.specialityListFilter.sort((a, b) => {
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
          });
          this.specialityFiltered = this.specialityFilterCtrl.valueChanges.pipe(
            startWith(''),
            map((searchText) =>
              searchText
                ? this.specialityListFilter
                    .filter((type) => (type ? type.name.toLowerCase().includes(searchText.toLowerCase()) : false))
                    .sort((a: any, b: any) => a.name.localeCompare(b.name))
                : this.specialityListFilter.sort((a: any, b: any) => a.name.localeCompare(b.name)),
            ),
          );
        }
      },
      (error) => {
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );

    // Legal
    this.subs.sink = this.financeService.getAllLegalEntityByScholar(this.scholarId).subscribe(
      (res) => {
        if (res) {
          this.legalListFilter = res;
          this.legalListFilter = this.legalListFilter.sort((a: any, b: any) =>
            this.utilService.simplifyRegex(a.legal_entity_name).localeCompare(this.utilService.simplifyRegex(b.legal_entity_name)),
          );
          this.legallFiltered = of(this.legalListFilter);
          this.subs.sink = this.legalFilterCtrl.valueChanges.subscribe((search) => {
            if (search && typeof search === 'string') {
              const result = this.legalListFilter.filter((data) => {
                if (data?.legal_entity_name) {
                  return this.utilService.simplifyRegex(data?.legal_entity_name).includes(this.utilService.simplifyRegex(search));
                }
              });

              this.legallFiltered = of(result);
            }
          });
        }
      },
      (error) => {
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );

    // analytical

    this.subs.sink = this.financeService.GetAllAnalyticalCodes(this.scholarId).subscribe(
      (code) => {
        if (code) {
          this.analyticListFilter = code;
          this.analyticlFiltered = this.analyticFilterCtrl.valueChanges.pipe(
            startWith(''),
            map((searchText) =>
              searchText
                ? this.analyticListFilter.filter((type) =>
                    type ? type.analytical_code.toLowerCase().includes(searchText.toLowerCase()) : false,
                  )
                : this.analyticListFilter,
            ),
          );
        }
      },
      (error) => {
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );

    // accounting

    this.subs.sink = this.financeService.GetAllAccountingAccounts(this.scholarId).subscribe(
      (acc) => {
        if (acc) {
          this.accountingAccountListFilter = acc;
          this.accountingAccountlFiltered = this.accountingAccountFilterCtrl.valueChanges.pipe(
            startWith(''),
            map((searchText) =>
              searchText
                ? this.accountingAccountListFilter.filter((type) =>
                    type ? type.account_number.toLowerCase().includes(searchText.toLowerCase()) : false,
                  )
                : this.accountingAccountListFilter,
            ),
          );
        }
      },
      (error) => {
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }

  displayWithLegal(value) {
    if (value) {
      if (value === 'All') {
        return this.translateService.instant('All');
      }
      const found = this.legalListFilter.find((data) => data._id.toLowerCase().trim().includes(value));
      if (found) {
        return found.legal_entity_name;
      } else {
        return value;
      }
    } else {
      return value;
    }
  }

  displayWithAnalytical(value) {
    if (value) {
      const found = this.analyticListFilter.find((data) => data._id.toLowerCase().trim().includes(value));
      if (found) {
        return found.analytical_code;
      } else {
        return value;
      }
    } else {
      return value;
    }
  }

  displayWithAccount(value) {
    if (value) {
      const found = this.accountingAccountListFilter.find((data) => data._id.toLowerCase().trim().includes(value));
      if (found) {
        return found.account_number;
      } else {
        return value;
      }
    } else {
      return value;
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected() || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length)) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
      this.allPaidLeaveAllowanceRateCheckbox = [];
      this.allDataForCheckboxConnectLegal = [];
      this.allDataForAddInductedHours = [];
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
      this.allPaidLeaveAllowanceRateCheckbox = [];
      this.allDataForCheckboxConnectLegal = [];
      this.allDataForAddInductedHours = [];
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.selection.select(row._id);
        }
      });

      // this.getDataAllForCheckbox(0);
    }
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isWaitingForResponse = true;
    let filter = '';
    filter += ` school : [` + JSON.stringify(this.schoolData.short_name) + `]`;
    filter +=
      this.filteredValues.campus && this.filteredValues.campus.length && this.filteredValues.campus[0]
        ? ` campus : ` + JSON.stringify(this.filteredValues.campus)
        : '';
    filter +=
      this.filteredValues.level && this.filteredValues.level.length && this.filteredValues.level[0]
        ? ` level : ` + JSON.stringify(this.filteredValues.level)
        : '';
    filter +=
      this.filteredValues.sectors && this.filteredValues.sectors.length && this.filteredValues.sectors[0]
        ? ` sectors : ` + JSON.stringify(this.filteredValues.sectors)
        : '';
    filter +=
      this.filteredValues.specialties && this.filteredValues.specialties.length && this.filteredValues.specialties[0]
        ? ` specialties : ` + JSON.stringify(this.filteredValues.specialties)
        : '';
    filter += this.filteredValues.legal_entity_id ? ` legal_entity_id : ` + JSON.stringify(this.filteredValues.legal_entity_id) : '';
    filter +=
      this.filteredValues.speciality && this.filteredValues.speciality.length
        ? ` speciality : ` + JSON.stringify(this.filteredValues.speciality)
        : '';
    filter += ` scholar_season_ids: ["${this.scholarId}"]`;
    filter = 'filter: {' + filter + '}';
    this.subs.sink = this.financeService.GetAdmissionIntakeDataCheckbox(pagination, this.sortValue, filter).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.allStudentForCheckbox.push(...students);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
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
        this.userService.postErrorLog(error);
        this.isReset = false;
        this.isWaitingForResponse = false;
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  showOptions(info, row) {
    if (this.isCheckedAll) {
      if (row) {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.dataUnselectUser.push(row._id);
          this.selection.deselect(row._id);
        } else {
          const indx = this.dataUnselectUser.findIndex((list) => list === row._id);
          this.dataUnselectUser.splice(indx, 1);
          this.selection.select(row._id);
        }
      }
    } else {
      if (row) {
        if (this.dataSelected && this.dataSelected.length) {
          const dataFilter = this.dataSelected.filter((resp) => resp._id === row._id);
          if (dataFilter && dataFilter.length < 1) {
            this.dataSelected.push(row);
          } else {
            const indexFilter = this.dataSelected.findIndex((resp) => resp._id === row._id);
            this.dataSelected.splice(indexFilter, 1);
          }
        } else {
          this.dataSelected.push(row);
        }
      }
    }
    const numSelected = this.dataSelected.length;
    if (numSelected > 0) {
      this.disabledExport = false;
    } else {
      this.disabledExport = true;
    }
    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.userSelected.push(user);
      this.userSelectedId.push(user._id);
    });
  }

  getUniqueLegals(entities) {
    return _.uniqBy(entities, '_id');
  }

  checkIfCandidateSelectNotNull(select, menu) {
    if (select < 1 && (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser.length))) {
      Swal.fire({
        type: 'info',
        title: this.translateService.instant('Followup_S8.Title'),
        html: this.translateService.instant('Followup_S8.Text', { menu: this.translateService.instant('School-Tab.Legal') }),
        confirmButtonText: this.translateService.instant('Followup_S8.Button'),
      });
      return true;
    }
    return false;
  }
  getAllIdForCheckbox(pageNumber) {
    if (this.isCheckedAll) {
      if (this.dataUnselectUser.length < 1) {
        this.downloadCSV();
      } else {
        if (pageNumber === 0) {
          this.allExportForCheckbox = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        let filter = '';
        filter += ` school : [` + JSON.stringify(this.schoolData.short_name) + `]`;
        filter +=
          this.filteredValues.campus && this.filteredValues.campus.length && this.filteredValues.campus[0]
            ? ` campus : ` + JSON.stringify(this.filteredValues.campus)
            : '';
        filter +=
          this.filteredValues.level && this.filteredValues.level.length && this.filteredValues.level[0]
            ? ` level : ` + JSON.stringify(this.filteredValues.level)
            : '';
        filter +=
          this.filteredValues.sectors && this.filteredValues.sectors.length && this.filteredValues.sectors[0]
            ? ` sectors : ` + JSON.stringify(this.filteredValues.sectors)
            : '';
        filter +=
          this.filteredValues.specialties && this.filteredValues.specialties.length && this.filteredValues.specialties[0]
            ? ` specialties : ` + JSON.stringify(this.filteredValues.specialties)
            : '';
        filter += this.filteredValues.legal_entity_id ? ` legal_entity_id : ` + JSON.stringify(this.filteredValues.legal_entity_id) : '';
        filter +=
          this.filteredValues.speciality && this.filteredValues.speciality.length
            ? ` speciality : ` + JSON.stringify(this.filteredValues.speciality)
            : '';
        filter += ` scholar_season_ids: ["${this.scholarId}"]`;
        filter = 'filter: {' + filter + '}';
        this.subs.sink = this.financeService.getAllIdIntakeChannelsForCheckbox(pagination, this.sortValue, filter).subscribe(
          (students: any) => {
            if (students && students.length) {
              this.allExportForCheckbox.push(...students);
              const page = pageNumber + 1;
              this.getAllIdForCheckbox(page);
            } else {
              this.isLoading = false;
              if (this.isCheckedAll) {
                if (this.allExportForCheckbox && this.allExportForCheckbox.length) {
                  this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  this.downloadCSV();
                }
              }
            }
          },
          (error) => {
            this.isReset = false;
            this.isLoading = false;
            this.userService.postErrorLog(error);
            if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
              Swal.fire({
                type: 'warning',
                title: this.translateService.instant('BAD_CONNECTION.Title'),
                html: this.translateService.instant('BAD_CONNECTION.Text'),
                confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
              });
            } else {
              Swal.fire({
                type: 'info',
                title: this.translateService.instant('SORRY'),
                text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translateService.instant('OK'),
              });
            }
          },
        );
      }
    } else {
      this.downloadCSV();
    }
  }
  onAddPaidLeaveAllowanceRateCheckbox(pageNumber) {
    if (this.isCheckedAll) {
      if (pageNumber === 0) {
        this.allPaidLeaveAllowanceRateCheckbox = [];
        this.dataSelected = [];
      }
      const pagination = {
        limit: 500,
        page: pageNumber,
      };
      this.isLoading = true;
      let filter = '';
      filter += ` school : [` + JSON.stringify(this.schoolData.short_name) + `]`;
      filter +=
        this.filteredValues.campus && this.filteredValues.campus.length && this.filteredValues.campus[0]
          ? ` campus : ` + JSON.stringify(this.filteredValues.campus)
          : '';
      filter +=
        this.filteredValues.level && this.filteredValues.level.length && this.filteredValues.level[0]
          ? ` level : ` + JSON.stringify(this.filteredValues.level)
          : '';
      filter +=
        this.filteredValues.sectors && this.filteredValues.sectors.length && this.filteredValues.sectors[0]
          ? ` sectors : ` + JSON.stringify(this.filteredValues.sectors)
          : '';
      filter +=
        this.filteredValues.specialties && this.filteredValues.specialties.length && this.filteredValues.specialties[0]
          ? ` specialties : ` + JSON.stringify(this.filteredValues.specialties)
          : '';
      filter += this.filteredValues.legal_entity_id ? ` legal_entity_id : ` + JSON.stringify(this.filteredValues.legal_entity_id) : '';
      filter +=
        this.filteredValues.speciality && this.filteredValues.speciality.length
          ? ` speciality : ` + JSON.stringify(this.filteredValues.speciality)
          : '';
      filter += ` scholar_season_ids: ["${this.scholarId}"]`;
      filter = 'filter: {' + filter + '}';
      this.subs.sink = this.financeService.getAllIdIntakeChannelsForCheckbox(pagination, this.sortValue, filter).subscribe(
        (students: any) => {
          if (students && students.length) {
            this.allPaidLeaveAllowanceRateCheckbox.push(...students);
            const page = pageNumber + 1;
            this.onAddPaidLeaveAllowanceRateCheckbox(page);
          } else {
            this.isLoading = false;
            if (this.isCheckedAll) {
              if (this.allPaidLeaveAllowanceRateCheckbox && this.allPaidLeaveAllowanceRateCheckbox.length) {
                this.dataSelected = this.allPaidLeaveAllowanceRateCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                if (this.dataSelected && this.dataSelected.length) {
                  this.onAddPaidLeaveAllowanceRate();
                }
              }
            }
          }
        },
        (error) => {
          this.isReset = false;
          this.isLoading = false;
          this.userService.postErrorLog(error);
          if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
            Swal.fire({
              type: 'warning',
              title: this.translateService.instant('BAD_CONNECTION.Title'),
              html: this.translateService.instant('BAD_CONNECTION.Text'),
              confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          } else {
            Swal.fire({
              type: 'info',
              title: this.translateService.instant('SORRY'),
              text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translateService.instant('OK'),
            });
          }
        },
      );
    } else {
      this.onAddPaidLeaveAllowanceRate();
    }
  }
  downloadCSV() {
    if (this.checkIfCandidateSelectNotNull(this.dataSelected.length, 'School-Tab.Legal')) {
      return;
    } else {
      const inputOptions = {
        ',': this.translateService.instant('IMPORT_DECISION_S1.COMMA'),
        ';': this.translateService.instant('IMPORT_DECISION_S1.SEMICOLON'),
        tab: this.translateService.instant('IMPORT_DECISION_S1.TAB'),
      };
      Swal.fire({
        type: 'question',
        title: this.translateService.instant('EXPORT_DECISION.TITLE'),
        width: 465,
        allowEscapeKey: true,
        showCancelButton: true,
        cancelButtonText: this.translateService.instant('IMPORT_DECISION_S1.CANCEL'),
        confirmButtonText: this.translateService.instant('IMPORT_DECISION_S1.OK'),
        input: 'radio',
        inputOptions: inputOptions,
        inputValue: this.translateService && this.translateService.currentLang === 'fr' ? ';' : '',
        inputValidator: (value) => {
          return new Promise((resolve, reject) => {
            if (value) {
              resolve('');
              Swal.enableConfirmButton();
            } else {
              Swal.disableConfirmButton();
              reject(this.translateService.instant('IMPORT_DECISION_S1.INVALID'));
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
    const lang = this.translateService.currentLang.toLowerCase();
    const importStudentTemlate = `downloadAccountingAccountData/`;
    let filter;
    if (
      (this.dataSelected.length && !this.isCheckedAll) ||
      (this.isCheckedAll && this.dataUnselectUser.length && this.dataSelected.length)
    ) {
      const mappedIds = [...new Set(this.dataSelected.map((res) => `"` + res._id + `"`))];
      filter =
        `filter={"scholar_season_ids": ["` +
        this.scholarId +
        '"], "program_ids": [' +
        mappedIds.toString() +
        '], "school": ["' +
        this.schoolData.short_name +
        '"] }';
    } else {
      filter = this.cleanFilterDataCSV();
    }
    const sorting = this.sortingForExport();
    const fullURL =
      url + importStudentTemlate + fileType + '/' + lang + '?' + filter + '&' + sorting + '&' + `user_type_id="${this.currentUserTypeId}"`;
    console.log('fullURL', fullURL);
    // element.href = encodeURI(url + importStudentTemlate + fileType + '/' + lang + '?' + filter);
    // console.log(element.href);
    // element.target = '_blank';
    // element.download = 'Template Import CSV';
    // document.body.appendChild(element);
    // element.click();
    // document.body.removeChild(element);
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
      }),
    };

    this.isLoading = true;
    this.httpClient.get(`${encodeURI(fullURL)}`, httpOptions).subscribe(
      (res) => {
        if (res) {
          this.isLoading = false;
          Swal.fire({
            type: 'success',
            title: this.translateService.instant('ReAdmission_S3.TITLE'),
            text: this.translateService.instant('ReAdmission_S3.TEXT'),
            confirmButtonText: this.translateService.instant('ReAdmission_S3.BUTTON'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => this.clearSelectIfFilter());
        } else {
          this.isLoading = false;
        }
      },
      (err) => {
        this.isLoading = false;
        console.log('uat 389 error', err);
      },
    );
  }
  sortingForExport() {
    let data = '';
    if (this.sortValue) {
      const sortData = _.cloneDeep(this.sortValue);
      Object.keys(sortData).forEach((key) => {
        if (sortData[key]) {
          data = data ? data + ',' + `"${key}":"${sortData[key]}"` : data + `"${key}":"${sortData[key]}"`;
        }
      });
    }
    return 'sorting={' + data + '}';
  }
  clearSelectIfFilter() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
    this.allPaidLeaveAllowanceRateCheckbox = [];
    this.allDataForCheckboxConnectLegal = [];
    this.allDataForAddInductedHours = [];
  }

  cleanFilterDataCSV() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key !== 'campus' &&
          key !== 'level' &&
          key !== 'sectors' &&
          key !== 'specialties' &&
          key !== 'school' &&
          key !== 'scholar_season_ids'
        ) {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        } else if (key === 'campus') {
          let campus = [];
          if (this.filteredValues.campus && this.filteredValues.campus.length) {
            campus = this.filteredValues.campus.map((res) => `"` + res + `"`);
          }
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${campus}]` : filterQuery + `"${key}":[${campus}]`;
        } else if (key === 'school') {
          if (this.schoolData && this.schoolData.short_name && this.schoolData.short_name.length) {
            filterQuery = filterQuery
              ? filterQuery + ',' + `"${key}":["${this.schoolData.short_name}"]`
              : filterQuery + `"${key}":["${this.schoolData.short_name}"]`;
          }
        } else if (key === 'scholar_season_ids') {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":["${this.scholarId}"]` : filterQuery + `"${key}":["${this.scholarId}"]`;
        } else if (key === 'level') {
          let level = [];
          if (this.filteredValues.level && this.filteredValues.level.length) {
            level = this.filteredValues.level.map((res) => `"` + res + `"`);
          }
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${level}]` : filterQuery + `"${key}":[${level}]`;
        } else if (key === 'sectors') {
          let sectors = [];
          if (this.filteredValues.sectors && this.filteredValues.sectors.length) {
            sectors = this.filteredValues.sectors.map((res) => `"` + res + `"`);
          }
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${sectors}]` : filterQuery + `"${key}":[${sectors}]`;
        } else if (key === 'specialties') {
          let specialties = [];
          if (this.filteredValues.specialties && this.filteredValues.specialties.length) {
            specialties = this.filteredValues.specialties.map((res) => `"` + res + `"`);
          }
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${specialties}]` : filterQuery + `"${key}":[${specialties}]`;
        }
      }
    });
    return 'filter={' + filterQuery + '}';
  }

  onAddPaidLeaveAllowanceRate() {
    if (this.dataSelected && this.dataSelected.length < 1 && !this.isCheckedAll) {
      Swal.fire({
        type: 'info',
        title: this.translateService.instant('Followup_S8.Title'),
        html: this.translateService.instant('Followup_S8.Text', { menu: this.translateService.instant('School-Tab.Legal') }),
        confirmButtonText: this.translateService.instant('Followup_S8.Button'),
      });
    } else {
      this.AddPaidLeaveAllowanceRateDialog();
    }
  }

  AddPaidLeaveAllowanceRateDialog() {
    this.subs.sink = this.dialog
      .open(AddPaidLeaveAllowanceDialogComponent, {
        width: '800px',
        disableClose: true,
        data: {
          selectedData: this.dataSelected,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getAccountingData();
          this.selection.clear();
          this.dataSelected = [];
          this.isCheckedAll = false;
          this.dataUnselectUser = [];
          this.allExportForCheckbox = [];
          this.allPaidLeaveAllowanceRateCheckbox = [];
        }
      });
  }

  onAddInducedHoursCoefficient() {
    if (this.dataSelected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translateService.instant('Followup_S8.Title'),
        html: this.translateService.instant('Followup_S8.Text', { menu: this.translateService.instant('School-Tab.Legal') }),
        confirmButtonText: this.translateService.instant('Followup_S8.Button'),
      });
    } else {
      this.AddInducedHoursCoefficientDialog();
    }
  }

  AddInducedHoursCoefficientDialog() {
    this.subs.sink = this.dialog
      .open(AddInducedHourCoefficientDialogComponent, {
        width: '800px',
        disableClose: true,
        data: {
          selectedData: this.dataSelected,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getAccountingData();
          this.selection.clear();
          this.dataSelected = [];
          this.isCheckedAll = false;
          this.dataUnselectUser = [];
          this.allExportForCheckbox = [];
          this.allPaidLeaveAllowanceRateCheckbox = [];
        }
      });
  }

  getAllIdForAddInductedHours(pageNumber) {
    if (this.isCheckedAll) {
      if (pageNumber === 0) {
        this.allDataForAddInductedHours = [];
        this.dataSelected = [];
      }
      const pagination = {
        limit: 500,
        page: pageNumber,
      };
      this.isLoading = true;
      let filter = '';
      filter += ` school : [` + JSON.stringify(this.schoolData.short_name) + `]`;
      filter +=
        this.filteredValues.campus && this.filteredValues.campus.length && this.filteredValues.campus[0]
          ? ` campus : ` + JSON.stringify(this.filteredValues.campus)
          : '';
      filter +=
        this.filteredValues.level && this.filteredValues.level.length && this.filteredValues.level[0]
          ? ` level : ` + JSON.stringify(this.filteredValues.level)
          : '';
      filter +=
        this.filteredValues.sectors && this.filteredValues.sectors.length && this.filteredValues.sectors[0]
          ? ` sectors : ` + JSON.stringify(this.filteredValues.sectors)
          : '';
      filter +=
        this.filteredValues.specialties && this.filteredValues.specialties.length && this.filteredValues.specialties[0]
          ? ` specialties : ` + JSON.stringify(this.filteredValues.specialties)
          : '';
      filter += this.filteredValues.legal_entity_id ? ` legal_entity_id : ` + JSON.stringify(this.filteredValues.legal_entity_id) : '';
      filter +=
        this.filteredValues.speciality && this.filteredValues.speciality.length
          ? ` speciality : ` + JSON.stringify(this.filteredValues.speciality)
          : '';
      filter += ` scholar_season_ids: ["${this.scholarId}"]`;
      filter = 'filter: {' + filter + '}';
      this.subs.sink = this.financeService.getAllIdIntakeChannelsForAddInducedHours(pagination, this.sortValue, filter).subscribe(
        (students: any) => {
          if (students && students.length) {
            this.allDataForAddInductedHours.push(...students);
            const page = pageNumber + 1;
            this.getAllIdForAddInductedHours(page);
          } else {
            this.isLoading = false;
            if (this.isCheckedAll) {
              if (this.allDataForAddInductedHours && this.allDataForAddInductedHours.length) {
                this.dataSelected = this.allDataForAddInductedHours.filter((list) => !this.dataUnselectUser.includes(list._id));
                this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                this.onAddInducedHoursCoefficient();
              }
            }
          }
        },
        (error) => {
          this.isReset = false;
          this.isLoading = false;
          this.userService.postErrorLog(error);
          if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
            Swal.fire({
              type: 'warning',
              title: this.translateService.instant('BAD_CONNECTION.Title'),
              html: this.translateService.instant('BAD_CONNECTION.Text'),
              confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          } else {
            Swal.fire({
              type: 'info',
              title: this.translateService.instant('SORRY'),
              text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translateService.instant('OK'),
            });
          }
        },
      );
    } else {
      this.onAddInducedHoursCoefficient();
    }
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      // Table Filters below
      {
        type: 'table_filter',
        name: 'campus',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.campusList,
        filterRef: this.campusFilter,
        displayKey: 'name',
        savedValue: 'name',
        isSelectionInput: true,
      },
      {
        type: 'table_filter',
        name: 'level',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.levelList,
        filterRef: this.levelFilter,
        displayKey: 'name',
        savedValue: 'name',
        isSelectionInput: true,
      },
      {
        type: 'table_filter',
        name: 'sectors',
        column: 'Sector',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.sectorListFilter,
        filterRef: this.sectorFilter,
        displayKey: 'name',
        savedValue: 'name',
        isSelectionInput: true,
      },
      {
        type: 'table_filter',
        name: 'specialties',
        column: 'Speciality',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.specialityListFilter,
        filterRef: this.specialityFilter,
        displayKey: 'name',
        savedValue: 'name',
        isSelectionInput: true,
      },
      {
        type: 'table_filter',
        name: 'legal_entity_id',
        column: 'ADMISSION.TABLE_LEGAL_ENTITIES.Legal Entity',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.legalListFilter,
        filterRef: this.legalFilterCtrl,
        displayKey: 'legal_entity_name',
        savedValue: '_id',
        isSelectionInput: true,
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
    console.log('cek', this.filterBreadcrumbData);
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
    this.clearSelectIfFilter();
    if (filterItem.name === 'campus') {
      this.campusFilter.setValue(['All'], { emitEvent: false });
    }
    if (filterItem.name === 'level') {
      this.levelFilter.setValue(['All'], { emitEvent: false });
    }
    if (filterItem.name === 'sectors') {
      this.sectorFilter.setValue(['All'], { emitEvent: false });
    }
    if (filterItem.name === 'specialties') {
      this.specialityFilter.setValue(['All'], { emitEvent: false });
    }
    if (filterItem.name === 'legal_entity_id') {
      this.legalFilterCtrl.setValue('All', { emitEvent: false });
    }
    this.getAccountingData();
  }
}
