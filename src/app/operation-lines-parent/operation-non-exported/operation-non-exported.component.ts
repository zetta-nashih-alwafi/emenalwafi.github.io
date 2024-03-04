import { ParseUtcToLocalPipe } from './../../shared/pipes/parse-utc-to-local.pipe';
import { PermissionService } from './../../service/permission/permission.service';
import { environment } from './../../../environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { debounceTime, startWith, tap, map } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { UntypedFormControl } from '@angular/forms';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import * as moment from 'moment';
import { StudentsTableService } from 'app/students-table/StudentTable.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { MatDialog } from '@angular/material/dialog';
import { ScholarSeasonDialogComponent } from './scholar-season-dialog/scholar-season-dialog.component';

@Component({
  selector: 'ms-operation-non-exported',
  templateUrl: './operation-non-exported.component.html',
  styleUrls: ['./operation-non-exported.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class OperationNonExportedComponent implements OnInit, AfterViewInit, OnDestroy {
  private subs = new SubSink();
  currentUser: any;
  isPermission: any;
  currentUserTypeId: any;
  isWaitingForResponse = false; // for the table loading
  isLoading = false; // for page loading
  isReset = false;

  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  noData: any;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  sortValue = null;
  dataCount = 0;
  dataLoaded = false;
  scholarshipFees = 'Scholarship fees <Student program>';

  // dropdown
  scholarSeasonList = [];
  schoolList = [];
  campusList = [];
  levelList = [];
  sectorList = [];
  specialityList = [];
  listObjective = [];
  listOfProgram = [];
  listOfLegalEntity = [];
  listOfOperationName = [];
  listOfFlux = [
    { key: 'Billing', value: 'billing' },
    { key: 'Payment', value: 'payment' },
    { key: 'Avoir', value: 'avoir' },
    { key: 'Refund', value: 'refund' },
  ];
  listOfNature = [
    { key: 'Billing', value: 'billing' },
    { key: 'SEPA', value: 'sepa' },
    { key: 'Credit card', value: 'credit_card' },
    { key: 'Transfer', value: 'transfer' },
    { key: 'Cash', value: 'cash' },
    { key: 'Check', value: 'check' },
    { key: 'Avoir', value: 'avoir' },
    { key: 'Cash Transfer', value: 'Cash Transfer' },
    { key: 'Adjustment', value: 'adjustment' },
    { key: 'Cancel', value: 'cancel' },
  ];

  // super filter control
  scholarFilter = new UntypedFormControl('AllF');
  schoolFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  levelFilter = new UntypedFormControl(null);
  sectorFilter = new UntypedFormControl(null);
  specialityFilter = new UntypedFormControl(null);

  campusSelected = [];
  levelSelected = [];
  scholarSeasonselected;
  campusListBackup = [];

  schoolName = '';
  campusName = '';
  levelName = '';

  // from and to filter control
  fromFilter = new UntypedFormControl(null);
  toFilter = new UntypedFormControl(null);

  // table filter control
  studentNumberFilter = new UntypedFormControl(null);
  studentNameFilter = new UntypedFormControl(null);
  programFilter = new UntypedFormControl('AllF');
  legalEntityFilter = new UntypedFormControl(null);
  dateFilter = new UntypedFormControl(null);
  operationNameFilter = new UntypedFormControl('AllF');
  payerFilter = new UntypedFormControl(null);
  fluxFilter = new UntypedFormControl('AllF');
  natureFilter = new UntypedFormControl('AllF');

  // super filter
  isSuperFilterApplied = true;
  superFilter = {
    scholar_season_ids: null,
    school_ids: null,
    campus_ids: null,
    level_ids: null,
    sector_ids: null,
    speciality_ids: null,
  };

  // from and to filter
  isFromAndToFilterApplied = true;
  fromAndToFilter = {
    from_date: null,
    to_date: null,
  };

  filteredValues = {
    operation_line_scholar_season_ids: null,
    school_ids: null,
    campus_ids: null,
    level_ids: null,
    sector_ids: null,
    speciality_ids: null,
    from_date: null,
    to_date: null,
    student_number: null,
    student_name: null,    
    legal_entity_names: null,
    date: null,
    operation_name: null,
    payer: null,
    flux: null,
    nature: null,
    offset: null,
    export_status: 'not_exported',
    // operation_line_visual_status: 'displayed',
    program_id: null,
    table_type: 'operation_lines',
  };

  tempDataFilter = {
    legalEntity: null
  }

  filteredValuesAll = {
    legal_entity_names: 'All',    
  };

  displayedColumns: string[] = [
    'checkbox',
    'student-number',
    'student-name',
    'program',
    'legal-entity',
    'date',
    'operation-name',
    'payer',
    'flux',
    'nature',
    'debit',
    'credit',
  ];
  filterCols: string[] = this.displayedColumns.map((col) => `${col}-filter`);

  isCheckedAll = false;
  dataUnselect = [];
  dataSelected = [];
  dataSelectedId = [];
  selectType: any;
  selectedProgram: any;

  clickedActionButton: any;

  // permissions
  allowExportLinesToExport = false;
  allowExportLinesExported = false;
  allowExportAllTheLines = false;
  allowExportSage = false;
  allowReset = false;

  // *************** Breadcrumb
  filterBreadcrumbData: any[] = [];
  listOfOperationNameForBreadcrumb: any;
  tempOperationNameValue: any;
  filteredValuesForBreadCrumb: any;

  constructor(
    public translate: TranslateService,
    private permissions: PermissionService,
    private authService: AuthService,
    private financeService: FinancesService,
    private candidateService: CandidatesService,
    private http: HttpClient,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    private studentService: StudentsTableService,
    private utilService: UtilityService,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    this.getPermissions();
    this.initFilter();
    this.getDropdown();
    this.getScholarSeasons();
    if (this.scholarFilter && this.scholarFilter.value) {
      const scholarSeason = this.scholarFilter.value === 'AllF' ? '' : null;
      this.getSchool(scholarSeason);
    }
    if (!this.isReset) {
      this.getOperationNotExported('init');
    }
    this.filterBreadcrumbFormat();
    this.sortingAllListSelect();
    this.sortingAllListSelectTranslate();
  }

  sortingAllListSelect() {
    this.listOfFlux = this.listOfFlux.sort((a, b) => this.translate.instant(a.key).localeCompare(this.translate.instant(b.key)));
    this.listOfNature = this.listOfNature.sort((a, b) =>
      this.translate.instant('nature_type.' + a.key).localeCompare(this.translate.instant('nature_type.' + b.key)),
    );
    this.listOfOperationName = this.listOfOperationName.sort((a, b) =>
      this.translate.instant('OPERATION_NAME.' + a).localeCompare(this.translate.instant('OPERATION_NAME.' + b)),
    );

    this.listOfOperationNameForBreadcrumb = this.listOfOperationName.map((item) => {
      const firstWord = item.split(' ')[0];
      const translateForFirstWord = this.translate.instant('OPERATION_NAME.' + firstWord);
      const restWord = item.substr(item.indexOf(" ") + 1);
      let finalWord = '';
      if(restWord !== firstWord) {
        finalWord = translateForFirstWord + " " + restWord;
      } else {
        finalWord = translateForFirstWord;
      }
      return finalWord
    });
  }
  sortingAllListSelectTranslate() {
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.sortingAllListSelect();
      const indexTempOperationName = this.listOfOperationName.indexOf(this.filteredValues?.operation_name) ? this.listOfOperationName.indexOf(this.filteredValues?.operation_name) : null;
      if(this.filteredValuesForBreadCrumb?.operation_name) {
        this.filteredValuesForBreadCrumb.operation_name = this.listOfOperationNameForBreadcrumb[indexTempOperationName];
      }
      this.filterBreadcrumbFormat();
    });
  }

  getPermissions(): void {
    this.allowExportLinesToExport = Boolean(this.permissions.operationLinesNotExportedTabActionExportLinesToExportPermission());
    this.allowExportLinesExported = Boolean(this.permissions.operationLinesNotExportedTabActionExportLinesExportedPermission());
    this.allowExportAllTheLines = Boolean(this.permissions.operationLinesNotExportedTabActionExportAllLinesPermission());
    this.allowExportSage = Boolean(this.permissions.operationLinesNotExportedTabActionExportSagePermission());
    this.allowReset = Boolean(this.permissions.operationLinesNotExportedTabActionResetPermission());
  }

  ngAfterViewInit(): void {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getOperationNotExported('after view init');
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  onSort(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getOperationNotExported('sort');
      }
    }
  }

  initFilter() {
    // super filter
    this.subs.sink = this.scholarFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.school_ids = null;
      this.superFilter.campus_ids = null;
      this.superFilter.level_ids = null;
      this.superFilter.sector_ids = null;
      this.superFilter.speciality_ids = null;
      this.superFilter.scholar_season_ids = statusSearch && statusSearch !== 'AllF' ? statusSearch : null;
      this.checkSuperFilter();
    });

    this.subs.sink = this.schoolFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.campus_ids = null;
      this.superFilter.level_ids = null;
      this.superFilter.sector_ids = null;
      this.superFilter.speciality_ids = null;
      this.superFilter.school_ids = statusSearch && !statusSearch.includes('AllF') ? statusSearch : null;
      this.checkSuperFilter();
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.level_ids = null;
      this.superFilter.sector_ids = null;
      this.superFilter.speciality_ids = null;
      this.superFilter.campus_ids = statusSearch && !statusSearch.includes('AllF') ? statusSearch : null;
      this.checkSuperFilter();
    });

    this.subs.sink = this.levelFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.sector_ids = null;
      this.superFilter.speciality_ids = null;
      this.superFilter.level_ids = statusSearch && !statusSearch.includes('AllF') ? statusSearch : null;
      this.checkSuperFilter();
    });

    this.subs.sink = this.sectorFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.speciality_ids = null;
      this.superFilter.sector_ids = statusSearch && !statusSearch.includes('AllF') ? statusSearch : null;
      this.checkSuperFilter();
    });

    this.subs.sink = this.specialityFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.speciality_ids = statusSearch && !statusSearch.includes('AllF') ? statusSearch : null;
      this.checkSuperFilter();
    });
    // end super filter

    // start from and to filter
    this.subs.sink = this.fromFilter.valueChanges.subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.fromAndToFilter.from_date = newDate;
        this.checkFromAndToFilter();
      }
    });
    this.subs.sink = this.toFilter.valueChanges.subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.fromAndToFilter.to_date = newDate;
        this.checkFromAndToFilter();
      }
    });
    // end from and to filter

    // table filter
    this.subs.sink = this.studentNumberFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.student_number = statusSearch ? statusSearch : null;
      this.paginator.firstPage();
      this.clearSelection();
      if (!this.isReset) {
        this.getOperationNotExported('student number filter');
      }
    });

    this.subs.sink = this.studentNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.student_name = statusSearch ? statusSearch : null;
      this.paginator.firstPage();
      this.clearSelection();
      if (!this.isReset) {
        this.getOperationNotExported('student name filter');
      }
    });

    this.subs.sink = this.programFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.program_id = statusSearch === 'AllF' ? null : statusSearch;
      this.paginator.firstPage();
      this.clearSelection();
      if (!this.isReset) {
        this.getOperationNotExported('program filter');
      }
    });

    this.subs.sink = this.dateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.date = newDate;
        this.paginator.firstPage();
        this.clearSelection();
        if (!this.isReset) {
          this.getOperationNotExported('date filter');
        }
      }
    });

    this.subs.sink = this.operationNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.operation_name = statusSearch === 'AllF' ? null : statusSearch;
      const indexTempOperationName = this.listOfOperationName.indexOf(this.filteredValues?.operation_name);
      this.filteredValuesForBreadCrumb = _.cloneDeep(this.filteredValues)
      this.filteredValuesForBreadCrumb.operation_name = this.listOfOperationNameForBreadcrumb[indexTempOperationName];
      this.paginator.firstPage();
      this.clearSelection();
      if (!this.isReset) {
        this.getOperationNotExported('operation name filter');
      }
    });

    this.subs.sink = this.payerFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.payer = statusSearch ? statusSearch : null;
      this.paginator.firstPage();
      this.clearSelection();
      if (!this.isReset) {
        this.getOperationNotExported('payer filter');
      }
    });

    this.subs.sink = this.fluxFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.flux = statusSearch === 'AllF' ? null : statusSearch;
      this.paginator.firstPage();
      this.clearSelection();
      if (!this.isReset) {
        this.getOperationNotExported('flux filter');
      }
    });

    this.subs.sink = this.natureFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.nature = statusSearch === 'AllF' ? null : statusSearch;
      this.paginator.firstPage();
      this.clearSelection();
      if (!this.isReset) {
        this.getOperationNotExported('nature filter');
      }
    });
    // end table filter
  }

  getOperationNotExported(from?) {
    const filter = this.cleanFilterData();
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    const sorting = this.sortValue;
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.getAllOperationLinesNonExportTable(pagination, userTypesList, sorting, filter).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.dataSource.data = _.cloneDeep(resp);
          this.paginator.length = resp[0].count_document;
          this.dataCount = resp[0]?.count_document;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
        // this.filterBreadcrumbData = [];
      },
      (err) => {
        this.isWaitingForResponse = false;
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.authService.handlerSessionExpired();
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
    this.filterBreadcrumbFormat();
  }

  getDropdown() {
    // get list of program for dropdown
    this.subs.sink = this.financeService.getAllProgramOfMasterTransaction().subscribe(
      (res) => {
        const programs = _.cloneDeep(res);
        if (programs && programs.length) {
          programs.forEach((program) => {
            if (program.scholar_season_id && program.scholar_season_id.scholar_season) {
              program.program = program.scholar_season_id.scholar_season + ' ' + program.program;
            } else {
              program.program = program.program;
            }
          });
          this.listOfProgram = _.cloneDeep(programs.sort((a, b) => (a.program > b.program ? 1 : -1)));
        } else {
          this.listOfProgram = [];
        }
      },
      (err) => {
        console.error('Error fetching program dropdown', err);
      },
    );

    // get list of operation name for dropdown
    this.subs.sink = this.financeService.getAllOperationNameDropDownMasterTransaction().subscribe(
      (resp) => {
        let respReduce = [];
        if (resp && resp.length) {
          respReduce = resp.filter((res) => res !== null);
          this.listOfOperationName = respReduce.sort((a, b) => a.localeCompare(b));
          this.sortingAllListSelect();
        } else {
          this.listOfOperationName = [];
        }
      },
      (err) => {
        console.error('Error fetching operation name dropdown', err);
      },
    );

    // get list of legal entities for dropdown
    this.subs.sink = this.financeService.getAllLegalEntitiesOfMasterTransaction().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.listOfLegalEntity = _.cloneDeep(resp.sort((a, b) => (a.legal_entity_name > b.legal_entity_name ? 1 : -1)));
        } else {
          this.listOfLegalEntity = [];
        }
      },
      (err) => {
        console.error('Error fetching legal entity dropdown', err);
      },
    );
  }

  scholarSelect() {
    this.schoolList = [];
    this.campusList = [];
    this.levelList = [];
    this.sectorList = [];
    this.specialityList = [];

    if (this.schoolFilter.value) {
      this.schoolFilter.setValue(null);
    }
    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.sectorFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.specialityFilter.value) {
      this.levelFilter.setValue(null);
    }

    if (!this.scholarFilter.value || this.scholarFilter.value.length === 0) {
      this.superFilter.scholar_season_ids = null;
    } else {
      this.superFilter.scholar_season_ids =
        this.scholarFilter.value && this.scholarFilter.value !== 'AllF' ? this.scholarFilter.value : null;
      this.getSchool(this.superFilter.scholar_season_ids);
    }
  }

  selectSchoolFilter(value) {
    const form = this.schoolFilter.value;
    if (form && form.length) {
      if (value === 'AllF') {
        this.schoolFilter.patchValue(['AllF']);
      } else if (value !== 'AllF') {
        const filter = form.filter((item) => item !== 'AllF');
        if (filter && filter.length) {
          this.schoolFilter.patchValue(filter);
        } else {
          this.schoolFilter.patchValue(null);
        }
      }
    }
    this.getCampus();
  }

  selectCampusFilter(value) {
    const form = this.campusFilter.value;
    if (form && form.length) {
      if (value === 'AllF') {
        this.campusFilter.patchValue(['AllF']);
      } else if (value !== 'AllF') {
        const filter = form.filter((item) => item !== 'AllF');
        if (filter && filter.length) {
          this.campusFilter.patchValue(filter);
        } else {
          this.campusFilter.patchValue(null);
        }
      }
    }
    this.getLevel();
  }

  selectLevelFilter(value) {
    const form = this.levelFilter.value;
    if (form && form.length) {
      if (value === 'AllF') {
        this.levelFilter.patchValue(['AllF']);
      } else if (value !== 'AllF') {
        const filter = form.filter((item) => item !== 'AllF');
        if (filter && filter.length) {
          this.levelFilter.patchValue(filter);
        } else {
          this.levelFilter.patchValue(null);
        }
      }
    }
    this.getDataByLevel();
  }

  selectSectorFilter(value) {
    const form = this.sectorFilter.value;
    if (form && form.length) {
      if (value === 'AllF') {
        this.sectorFilter.patchValue(['AllF']);
      } else {
        const formFilter = form.filter((select) => select !== 'AllF');
        if (formFilter && formFilter.length) {
          this.sectorFilter.patchValue(formFilter);
        } else {
          this.sectorFilter.patchValue(null);
        }
      }
    } else {
      this.sectorFilter.patchValue(null);
    }
    this.getDataSpeciality();
  }

  selectSpecialityFilter(value) {
    const form = this.specialityFilter.value;
    if (form && form.length) {
      if (value === 'AllF') {
        this.specialityFilter.patchValue(['AllF']);
      } else {
        const formFilter = form.filter((select) => select !== 'AllF');
        if (formFilter && formFilter.length) {
          this.specialityFilter.patchValue(formFilter);
        } else {
          this.specialityFilter.patchValue(null);
        }
      }
    } else {
      this.specialityFilter.patchValue(null);
    }
  }

  getScholarSeasons() {
    this.scholarSeasonList = []
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.scholarSeasonList = _.cloneDeep(resp).sort((a, b) => {
            return a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0;
          });
          this.scholarSeasonList = this.scholarSeasonList.filter(list => list?._id !== 'All')
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
          this.authService.handlerSessionExpired();
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

  getSchool(data) {
    const name = data ? data : '';
    const filter = 'filter: { scholar_season_id:' + `"${name}"` + '}';
    this.subs.sink = this.candidateService.GetAllSchoolFilter(name, filter, this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp) {
          if (
            this.currentUser &&
            this.currentUser.entities &&
            this.currentUser.entities.length &&
            this.currentUser.app_data &&
            this.currentUser.app_data.school_package &&
            this.currentUser.app_data.school_package.length
          ) {
            const schoolsList = [];
            this.currentUser.app_data.school_package.forEach((element) => {
              schoolsList.push(element.school);
            });
            this.listObjective = schoolsList;
            this.schoolList = this.listObjective;
            this.schoolList = this.schoolList.sort((a, b) =>
              this.utilService.simplifyRegex(a.short_name) > this.utilService.simplifyRegex(b.short_name)
                ? 1
                : this.utilService.simplifyRegex(b.short_name) > this.utilService.simplifyRegex(a.short_name)
                ? -1
                : 0,
            );
          } else {
            this.listObjective = resp;
            this.schoolList = this.listObjective;
            this.schoolList = this.schoolList.sort((a, b) =>
              this.utilService.simplifyRegex(a.short_name) > this.utilService.simplifyRegex(b.short_name)
                ? 1
                : this.utilService.simplifyRegex(b.short_name) > this.utilService.simplifyRegex(a.short_name)
                ? -1
                : 0,
            );
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
          this.authService.handlerSessionExpired();
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

  getCampus() {
    this.levelList = [];
    this.campusList = [];
    this.sectorList = [];
    this.specialityList = [];

    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.sectorFilter.value) {
      this.sectorFilter.setValue(null);
    }
    if (this.specialityFilter.value) {
      this.specialityFilter.setValue(null);
    }

    const school = this.schoolFilter.value;
    if (
      this.currentUser &&
      this.currentUser.entities &&
      this.currentUser.entities[0].campus &&
      school &&
      school.length &&
      !school.includes('AllF')
    ) {
      if (
        this.currentUser &&
        this.currentUser.entities &&
        this.currentUser.entities.length &&
        this.currentUser.app_data &&
        this.currentUser.app_data.school_package &&
        this.currentUser.app_data.school_package.length &&
        this.schoolFilter.value &&
        this.schoolFilter.value.length
      ) {
        if (school && !school.includes('AllF')) {
          school.forEach((element) => {
            const sName = this.schoolList.find((list) => list._id === element);
            this.schoolName = this.schoolName ? this.schoolName + ',' + sName.short_name : sName.short_name;
          });
        }
        this.currentUser.app_data.school_package.forEach((element) => {
          if (element && element.school && element.school._id && (school.includes(element.school._id) || school.includes('All'))) {
            this.campusList = _.concat(this.campusList, element.school.campuses);
          }
        });
      }
    } else {
      if (school && !school.includes('AllF')) {
        school.forEach((element) => {
          const sName = this.schoolList.find((list) => list._id === element);
          this.schoolName = this.schoolName ? this.schoolName + ',' + sName.short_name : sName.short_name;
        });

        const scampusList = this.listObjective.filter((list) => {
          return school.includes(list._id);
        });
        scampusList.filter((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.filter((campuses, nex) => {
              this.campusList.push(campuses);
              this.campusListBackup = this.campusList;
            });
          }
        });
      } else if (school && school.includes('AllF') && this.listObjective && this.listObjective.length) {
        this.listObjective.forEach((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.forEach((campuses, nex) => {
              this.campusList.push(campuses);
              this.campusListBackup = this.campusList;
            });
          }
        });
      } else {
        this.campusList = [];
      }

      this.campusList = _.uniqBy(this.campusList, 'name');
      this.campusList = this.campusList.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
    }
  }

  getLevel() {
    this.levelList = [];
    this.sectorList = [];
    this.specialityList = [];
    this.campusName = '';

    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.sectorFilter.value) {
      this.sectorFilter.setValue(null);
    }
    if (this.specialityFilter.value) {
      this.specialityFilter.setValue(null);
    }

    this.campusSelected = [];
    const schools = this.schoolFilter.value;
    const sCampus = this.campusFilter.value;

    if (
      this.currentUser &&
      this.currentUser.entities &&
      this.currentUser.entities.length &&
      this.currentUser.app_data &&
      this.currentUser.app_data.school_package &&
      this.currentUser.app_data.school_package.length &&
      this.campusFilter.value &&
      this.campusFilter.value.length
    ) {
      if (sCampus && sCampus.length && !sCampus.includes('AllF') && this.campusList && this.campusList.length) {
        this.currentUser.app_data.school_package.forEach((element) => {
          if (element && element.school && element.school._id && (schools.includes(element.school._id) || schools.includes('AllF'))) {
            const sLevelList = this.campusList.filter((list) => {
              return sCampus.includes(list._id);
            });
            sLevelList.forEach((lev) => {
              if (lev && lev.levels && lev.levels.length) {
                this.levelList = _.concat(this.levelList, lev.levels);
              }
            });
          }
        });
      } else if (sCampus && sCampus.length && sCampus.includes('AllF') && this.campusList && this.campusList.length) {
        this.campusList.forEach((lev) => {
          if (lev && lev.levels && lev.levels.length) {
            this.levelList = _.concat(this.levelList, lev.levels);
          }
        });
      }
    } else {
      if (schools && sCampus && !sCampus.includes('AllF')) {
        sCampus.forEach((element) => {
          const sName = this.campusList.find((list) => list._id === element);
          this.campusSelected.push(sName._id);
          this.campusName = this.campusName ? this.campusName + ',' + sName.short_name : sName.short_name;
        });
        const sLevelList = this.campusList.filter((list) => {
          return sCampus.includes(list._id);
        });
        sLevelList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levelList.push(level);
            });
          }
        });
      } else if (sCampus && sCampus.includes('AllF')) {
        this.campusList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levelList.push(level);
            });
          }
        });
      } else {
        this.levelList = [];
        this.sectorList = [];
        this.specialityList = [];
      }
    }
    this.levelList = _.uniqBy(this.levelList, '_id');
    this.levelList = this.levelList.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }

  getDataByLevel() {
    this.levelList = _.uniqBy(this.levelList, 'name');
    this.levelList = this.levelList.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
    this.levelSelected = [];
    if (this.levelFilter.value && !this.levelFilter.value.includes('AllF')) {
      const sLevel = this.levelFilter.value;
      sLevel.forEach((element) => {
        const sName = this.levelList.find((list) => list._id === element);
        this.levelSelected.push(sName._id);
        this.levelName = this.levelName ? this.levelName + ',' + sName.name : sName.name;
      });
    }
    this.getSector();
  }

  getSector() {
    this.sectorList = [];
    this.specialityList = [];

    if (this.sectorFilter.value) {
      this.sectorFilter.setValue(null);
    }

    if (this.specialityFilter.value) {
      this.specialityFilter.setValue(null);
    }

    const scholar = this.scholarFilter.value && this.scholarFilter.value !== 'AllF' ? true : false;
    const school = this.schoolFilter.value && this.schoolFilter.value.length ? true : false;
    const campus = this.campusSelected && this.campusSelected.length ? true : false;
    const level = this.levelSelected && this.levelSelected.length ? true : false;

    let allSchool = [];
    let allCampus = [];
    let allLevel = [];

    if (this.schoolFilter.value && this.schoolFilter.value.includes('AllF') && this.listObjective && this.listObjective.length) {
      allSchool = this.listObjective.map((data) => data._id);
    }

    if (this.campusFilter.value && this.campusFilter.value.includes('AllF') && this.campusList && this.campusList.length) {
      allCampus = this.campusList.map((data) => data._id);
    }

    if (this.levelFilter.value && this.levelFilter.value.includes('AllF') && this.levelList && this.levelList.length) {
      allLevel = this.levelList.map((data) => data._id);
    }

    const filter = {
      scholar_season_id: scholar ? this.scholarFilter.value : null,
      candidate_school_ids: allSchool && allSchool.length > 0 ? allSchool : school ? this.schoolFilter.value : null,
      campuses: allCampus && allCampus.length > 0 ? allCampus : campus ? this.campusSelected : null,
      levels: allLevel && allLevel.length > 0 ? allLevel : level ? this.levelSelected : null,
    };

    const campusValue = this.superFilter.campus_ids;
    const levelValue = this.superFilter.level_ids;
    const checkingLevelData = this.levelFilter.value;

    if (checkingLevelData?.length || checkingLevelData?.includes('AllF')) {
      this.subs.sink = this.financeService.GetAllSectorsDropdown(filter).subscribe(
        (resp) => {
          if (!this.campusFilter.value && campusValue) {
            this.campusFilter.setValue(campusValue);
            this.getLevel();
          }
          if (!this.levelFilter.value && levelValue) {
            this.levelFilter.setValue(levelValue);
          }
          if (resp && resp.length) {
            this.sectorFilter.setValue(null);
            this.specialityFilter.setValue(null);
            this.superFilter.sector_ids = null;
            this.superFilter.speciality_ids = null;
            this.sectorList = resp.sort((a, b) => a.name.localeCompare(b.name));
          }
        },
        (err) => {
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
  }

  getDataSpeciality() {
    this.specialityList = [];

    if (this.specialityFilter.value) {
      this.specialityFilter.setValue(null);
    }

    const scholar = this.scholarFilter.value && this.scholarFilter.value !== 'AllF' ? true : false;
    const school = this.schoolFilter.value && this.schoolFilter.value.length ? true : false;
    const campus = this.campusSelected && this.campusSelected.length ? true : false;
    const level = this.levelSelected && this.levelSelected.length ? true : false;
    const sector = this.sectorFilter.value && this.sectorFilter.value.length ? true : false;

    let allSchool = [];
    let allCampus = [];
    let allLevel = [];
    let allSector = [];

    if (this.schoolFilter.value && this.schoolFilter.value.includes('AllF') && this.listObjective && this.listObjective.length) {
      allSchool = this.listObjective.map((data) => data._id);
    }

    if (this.campusFilter.value && this.campusFilter.value.includes('AllF') && this.campusList && this.campusList.length) {
      allCampus = this.campusList.map((data) => data._id);
    }

    if (this.levelFilter.value && this.levelFilter.value.includes('AllF') && this.levelList && this.levelList.length) {
      allLevel = this.levelList.map((data) => data._id);
    }

    if (this.sectorFilter.value && this.sectorFilter.value.includes('AllF') && this.levelList && this.levelList.length) {
      allSector = this.sectorList.map((data) => data._id);
    }

    const filter = {
      scholar_season_id: scholar ? this.scholarFilter.value : null,
      candidate_school_ids: allSchool && allSchool.length > 0 ? allSchool : school ? this.schoolFilter.value : null,
      campuses: allCampus && allCampus.length > 0 ? allCampus : campus ? this.campusSelected : null,
      levels: allLevel && allLevel.length > 0 ? allLevel : level ? this.levelSelected : null,
      sectors: allSector && allSector.length ? allSector : sector ? this.sectorFilter.value : null,
    };

    const checkingSectorData = this.sectorFilter.value;
    if (checkingSectorData?.length || checkingSectorData?.includes('AllF')) {
      this.subs.sink = this.candidateService.GetAllSpecializationsByScholar(filter).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.specialityList = resp.sort((a, b) => a.name.replace(' ', '').localeCompare(b.name.replace(' ', '')));
          }
        },
        (err) => {
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
  }

  cleanFilterData() {
    const paramsDate = this.filteredValues.date || this.filteredValues.from_date || this.filteredValues.to_date;
    this.filteredValues.offset = paramsDate ? moment().utcOffset() : null;
    const filterData = _.cloneDeep(this.filteredValues);
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it when key is [] or '' it will be deleted key obejct
      if (filterData[key] === null || !filterData[key]?.length) {
        delete filterData[key];
      }
    });
    return filterData;
  }

  cleanFilterDataExport() {
    const filterData = _.cloneDeep(this.filteredValues);
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it when key is [] or '' it will be deleted key obejct
      if (filterData[key] === null || !filterData[key]?.length) {
        delete filterData[key];
      }
    });
    return ` "filter": ${JSON.stringify(filterData)} `;
  }

  applySuperFilter() {
    this.filteredValues = {
      ...this.filteredValues,
      operation_line_scholar_season_ids: this.superFilter && this.superFilter.scholar_season_ids !== 'AllF'
        ? this.superFilter.scholar_season_ids : null,
      school_ids: this.superFilter && this.superFilter.school_ids !== 'AllF'
        ? this.superFilter.school_ids : null,
      campus_ids: this.superFilter && this.superFilter.campus_ids !== 'AllF' 
        ? this.superFilter.campus_ids : null,
      level_ids: this.superFilter && this.superFilter.level_ids !== 'AllF'
        ? this.superFilter.level_ids: null,
      sector_ids: this.superFilter && this.superFilter.sector_ids !== 'AllF'
        ? this.superFilter.sector_ids : null,
      speciality_ids: this.superFilter && this.superFilter.speciality_ids !== 'ALLF'
        ? this.superFilter.speciality_ids : null,
    };

    this.paginator.firstPage();
    this.clearSelection();
    this.checkSuperFilter();
    if (!this.isReset) {
      this.getOperationNotExported('apply super filter');
    }
  }

  applyFromAndToFilter() {
    this.filteredValues = {
      ...this.filteredValues,
      from_date: this.fromAndToFilter.from_date,
      to_date: this.fromAndToFilter.to_date,
    };
    this.paginator.firstPage();
    this.clearSelection();
    this.checkFromAndToFilter();
    if (!this.isReset) {
      this.getOperationNotExported('apply from and to filter');
    }
  }

  checkSuperFilter() {
    const currentData = {
      ...this.filteredValues,
      operation_line_scholar_season_ids: this.superFilter.scholar_season_ids,
      school_ids: this.superFilter.school_ids,
      campus_ids: this.superFilter.campus_ids,
      level_ids: this.superFilter.level_ids,
      sector_ids: this.superFilter.sector_ids,
      speciality_ids: this.superFilter.speciality_ids,
    };
    const initialData = _.cloneDeep(this.filteredValues);
    const equalForm = _.isEqual(initialData, currentData);
    this.isSuperFilterApplied = equalForm;
  }

  checkFromAndToFilter() {
    const currentData = {
      ...this.filteredValues,
      from_date: this.fromAndToFilter.from_date,
      to_date: this.fromAndToFilter.to_date,
    };
    const initialData = _.cloneDeep(this.filteredValues);
    const equalForm = _.isEqual(initialData, currentData);
    this.isFromAndToFilterApplied = equalForm;
  }

  resetFilter() {
    this.isReset = true;
    this.filterBreadcrumbData = [];
    this.schoolList = [];
    this.campusList = [];
    this.levelList = [];
    this.sectorList = [];
    this.specialityList = [];

    this.filteredValues = {
      operation_line_scholar_season_ids: null,
      school_ids: null,
      campus_ids: null,
      level_ids: null,
      sector_ids: null,
      speciality_ids: null,
      from_date: null,
      to_date: null,
      student_number: null,
      student_name: null,
      program_id: null,
      legal_entity_names: null,
      date: null,
      operation_name: null,
      payer: null,
      flux: null,
      nature: null,
      offset: null,
      export_status: 'not_exported',
      table_type: 'operation_lines',
      // operation_line_visual_status: 'displayed',
    };

    // super filter control
    this.scholarFilter.setValue('AllF');
    this.schoolFilter.setValue(null);
    this.campusFilter.setValue(null);
    this.levelFilter.setValue(null);
    this.sectorFilter.setValue(null);
    this.specialityFilter.setValue(null);

    // from and to filter control
    this.fromFilter.setValue(null);
    this.toFilter.setValue(null);

    // table filter control
    this.studentNumberFilter.setValue(null, { emitEvent: false });
    this.studentNameFilter.setValue(null, { emitEvent: false });
    this.programFilter.setValue('AllF', { emitEvent: false });
    this.legalEntityFilter.setValue(null, { emitEvent: false });
    this.dateFilter.setValue(null, { emitEvent: false });
    this.operationNameFilter.setValue('AllF', { emitEvent: false });
    this.payerFilter.setValue(null, { emitEvent: false });
    this.fluxFilter.setValue('AllF', { emitEvent: false });
    this.natureFilter.setValue('AllF', { emitEvent: false });

    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.clearSelection();
    this.paginator.firstPage();

    this.tempDataFilter = {      
      legalEntity: null,      
    };

    if (this.scholarFilter && this.scholarFilter.value) {
      const scholarSeason = this.scholarFilter.value === 'AllF' ? '' : null;
      this.getSchool(scholarSeason);
    }

    if (this.isReset) {
      this.getOperationNotExported('reset');
    }
  }

  clearSelection() {
    this.selection.clear();
    this.dataSelected = [];
    this.dataUnselect = [];
    this.isCheckedAll = false;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.dataUnselect = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.dataUnselect = [];
      this.isCheckedAll = true;
      this.dataSource.data.map((row) => {
        if (!this.dataUnselect.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
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
        if (!this.dataUnselect.includes(row._id)) {
          this.dataUnselect.push(row._id);
          this.selection.deselect(row._id);
        } else {
          const indx = this.dataUnselect.findIndex((list) => list === row._id);
          this.dataUnselect.splice(indx, 1);
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
    this.dataSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.dataSelectedId.push(user._id);
    });
  }

  controllerButton(action: string) {
    this.clickedActionButton = action;
    setTimeout(() => {
      const cases = {
        'export-sage': this.getAllDataForExportSage.bind(this),
        'lines-to-export': this.getAllDataForExportLinesToExport.bind(this),
        'lines-exported': this.getAllDataForExportLinesToExport.bind(this),
        'all-the-lines': this.openDialogSelectScholarSeason.bind(this),
      };
      cases[action](0);
    }, 500);
  }

  getAllDataForExportSage(page: number) {
    if (this.clickedActionButton !== 'export-sage') {
      return;
    }

    const pagination = { limit: 500, page };
    const sorting = this.sortValue;
    const filter = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];

    if (this.isCheckedAll) {
      if (this.dataUnselect.length < 1) {
        this.exportSAGE();
      } else {
        if (page === 0) {
          this.dataSelected = [];
        }
        this.isLoading = true;
        this.subs.sink = this.financeService.GetAllDataForExportSage(pagination, userTypesList, sorting, filter).subscribe(
          (students: any) => {
            if (students && students.length && students.length > 0) {
              this.dataSelected.push(...students);
              this.getAllDataForExportSage(page + 1);
            } else {
              this.isLoading = false;
              if (this.isCheckedAll && this.dataSelected && this.dataSelected.length) {
                this.dataSelected = this.dataSelected.filter((item) => !this.dataUnselect.includes(item._id));
                if (this.dataSelected && this.dataSelected.length) {
                  this.exportSAGE();
                }
              }
            }
          },
          (err: any) => {
            this.isLoading = true;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            });
          },
        );
      }
    } else {
      this.exportSAGE();
    }
  }

  openDialogSelectScholarSeason() {
    this.subs.sink = this.dialog
      .open(ScholarSeasonDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        panelClass: 'certification-rule-pop-up',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
           this.scholarSeasonselected = [res];
           this.getAllDataForExportLinesToExport(0);
        }
      });
  }

  getAllDataForExportLinesToExport(page: number) {
    if (this.clickedActionButton === 'lines-exported' || this.clickedActionButton === 'all-the-lines') {
      this.visualExtraction(this.clickedActionButton);
    } else if (this.clickedActionButton === 'lines-to-export') {
      const pagination = { limit: 500, page };
      const sorting = this.sortValue;
      const filter = this.cleanFilterData();
      const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];

      if (this.isCheckedAll) {
        if (this.dataUnselect.length < 1) {
          this.visualExtraction(this.clickedActionButton);
        } else {
          if (page === 0) {
            this.dataSelected = [];
          }
          this.isLoading = true;
          this.subs.sink = this.financeService.GetAllDataForExportLinesToExport(pagination, userTypesList, sorting, filter).subscribe(
            (students: any) => {
              if (students && students.length && students.length > 0) {
                this.dataSelected.push(...students);
                this.getAllDataForExportLinesToExport(page + 1);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.dataSelected && this.dataSelected.length) {
                  this.dataSelected = this.dataSelected.filter((item) => !this.dataUnselect.includes(item._id));
                  if (this.dataSelected && this.dataSelected.length) {
                    this.visualExtraction(this.clickedActionButton);
                  }
                }
              }
            },
            (err: any) => {
              this.isLoading = true;
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              });
            },
          );
        }
      } else {
        this.visualExtraction(this.clickedActionButton);
      }
    }
  }

  exportSAGE() {
    if (this.dataSelected && this.dataSelected.length < 1 && !this.isCheckedAll) {
      return Swal.fire({
        type: 'warning',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: String(this.translate.instant('Operation lines')).toLocaleLowerCase() }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-followup-s8');
        },
      });
    } else {
      Swal.fire({
        title: this.translate.instant('Operation_Lines_S1.TITLE'),
        html: this.translate.instant('Operation_Lines_S1.TEXT'),
        type: 'question',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: this.translate.instant('Operation_Lines_S1.BUTTON1'),
        cancelButtonText: this.translate.instant('Operation_Lines_S1.BUTTON2'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-operation-lines-s1');
        },
      }).then((result) => {
        if (result && result.value) {
          const inputOptions = {
            ',': this.translate.instant('IMPORT_DECISION_S1.COMMA'),
            ';': this.translate.instant('IMPORT_DECISION_S1.SEMICOLON'),
            tab: this.translate.instant('IMPORT_DECISION_S1.TAB'),
          };
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
            onOpen: function (modalEl) {
              modalEl.setAttribute('data-cy', 'swal-import-decision-s1');
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
              const endPoint = 'exportOperationLinesSAGE/';
              this.openDownloadCsv(fileType, endPoint);
            }
          });
        }
      });
    }
  }

  visualExtraction(from?) {
    if (this.dataSelected && this.dataSelected.length < 1 && !this.isCheckedAll && this.clickedActionButton === 'lines-to-export') {
      return Swal.fire({
        type: 'warning',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: String(this.translate.instant('Operation lines')).toLocaleLowerCase() }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-followup-s8');
        },
      });
    } else {
      const inputOptions = {
        ',': this.translate.instant('IMPORT_DECISION_S1.COMMA'),
        ';': this.translate.instant('IMPORT_DECISION_S1.SEMICOLON'),
        tab: this.translate.instant('IMPORT_DECISION_S1.TAB'),
      };
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
        onOpen: function (modalEl) {
          modalEl.setAttribute('data-cy', 'swal-import-decision-s1');
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
          const endPoint = 'exportOperationLinesExported/';
          this.openDownloadCsv(fileType, endPoint);
        }
      });
    }
  }

  openDownloadCsv(fileType, endPoint) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const lang = this.translate.currentLang.toLowerCase();
    const exportEndPoint = endPoint;
    let filter;
    if (this.clickedActionButton === 'export-sage' || this.clickedActionButton === 'lines-to-export') {
      if ((this.dataSelected.length && !this.isCheckedAll) || (this.dataUnselect && this.dataUnselect.length)) {
        const mappedIds = [...new Set(this.dataSelected.map((res) => `"` + res._id + `"`))];
        if (this.clickedActionButton === 'export-sage') {
          filter =
            '"filter":{"exclude_master": "true","operation_line_ids": [' +
            mappedIds.toString() +
            '], "export_status": "not_exported", "offset": "' +
            moment().utcOffset() +
            '"}';
        } else {
          filter =
            '"filter":{"operation_line_ids": [' +
            mappedIds.toString() +
            '], "export_status": "not_exported", "offset": "' +
            moment().utcOffset() +
            '"}';
        }
      } else if (this.isCheckedAll) {
        filter = this.cleanFilterDataExport();
      }
    } else if (this.clickedActionButton === 'lines-exported') {
      filter = '"filter":{"exclude_master": "true","export_status": "exported", "offset": "' + moment().utcOffset() + '"}';
    } else if (this.clickedActionButton === 'all-the-lines') {  
      this.scholarSeasonselected = this.scholarSeasonselected.map((res) => `"` + res + `"`)   
      filter = '"filter":{"exclude_master": "true", "offset": "' + moment().utcOffset() + '","operation_line_scholar_season_ids":[' + this.scholarSeasonselected + ']}';
    }
    const userTypesList =
      this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id.map((res) => `"` + res + `"`) : [];
    const uri = encodeURI(url + exportEndPoint + fileType + '/' + lang);
    console.log('URL', uri);
    const options = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
        'Content-Type': 'application/json',
      }),
    };
    const payload = '{' + filter + ',"user_type_ids":[' + userTypesList + ']}';

    this.isLoading = true;
    this.http.post(uri, payload, options).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('ReAdmission_S3.TITLE'),
            text: this.translate.instant('ReAdmission_S3.TEXT'),
            confirmButtonText: this.translate.instant('ReAdmission_S3.BUTTON'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
            onOpen: (modalEl) => {
              modalEl.setAttribute('data-cy', 'swal-readmission-s3');
            },
          }).then(() => {
            this.clearSelection();
            if (this.clickedActionButton === 'export-sage') {
              this.getOperationNotExported();
            }
          });
        }
      },
      (err) => {
        this.isLoading = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  parseDateToLocal(dateData, timeData) {
    if (dateData && timeData) {
      const parsed = this.parseUtcToLocalPipe.transformDate(dateData, timeData);
      return parsed;
    } else {
      return '';
    }
  }

  formatCurrency(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
    }
    return num;
  }

  displayProgram(data) {
    let program = '';
    if (data?.program_id?.scholar_season_id?.scholar_season && data?.program_id?.program) {
      program = data?.program_id?.scholar_season_id?.scholar_season.concat(' ', data?.program_id?.program);
      return program;
    } else {
      return '';
    }
  }

  parseTermIndexToNumber(data) {
    if (data || data===0) {
      return Number(data) + 1;
    }
  }

  displayOperationName(data) {
    if (data?.includes('avoir_scholarship_fees')) {
      return data.replace('avoir_scholarship_fees', this.translate.instant('OPERATION_NAME.avoir_scholarship_fees'));
    } else if(data?.includes('avoir_of_scholarship_fees')){
      return data.replace('avoir_of_scholarship_fees', this.translate.instant('OPERATION_NAME.avoir_of_scholarship_fees'));
    } else if (data?.includes('scholarship_fees')) {
      return data.replace('scholarship_fees', this.translate.instant('OPERATION_NAME.scholarship_fees'));
    } else {
      return this.translate.instant('OPERATION_NAME.' + data);
    }
  }

  filterBreadcrumb(newFilterValue: FilterBreadCrumbItem) {
    const { type, column } = newFilterValue;

    const findFilterBreadcrumb = this.filterBreadcrumbData.findIndex(
      (filterData) => filterData?.type === type && filterData?.column === column,
    );

    if (findFilterBreadcrumb !== -1) {
      this.filterBreadcrumbData[findFilterBreadcrumb] = newFilterValue;
      if (
        !this.filterBreadcrumbData[findFilterBreadcrumb]?.value?.length &&
        !this.filterBreadcrumbData[findFilterBreadcrumb]?.key?.length
      ) {
        this.filterBreadcrumbData.splice(findFilterBreadcrumb, 1);
      }
    } else if (findFilterBreadcrumb === -1 && newFilterValue?.value?.length) {
      this.filterBreadcrumbData.push(newFilterValue);
    }
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadcrumbData = [];
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.superFilter, this.filteredValues);
    if (filterItem.type === 'super_filter') {
      this.superFilter[filterItem?.name] = null;
      this.filteredValues[filterItem?.name] = null;
    } else if (filterItem.type === 'table_filter') {
      this.filteredValues[filterItem?.name] = null;
    }
    if (filterItem?.name === 'scholar_season_ids' && filterItem.type === 'super_filter') {
      this.scholarFilter.setValue('AllF', { emitEvent: false });
      this.schoolFilter.setValue(null);
      this.campusFilter.setValue(null);
      this.levelFilter.setValue(null);
      this.sectorFilter.setValue(null);
      this.specialityFilter.setValue(null);
      this.filteredValues.school_ids = null;
      this.filteredValues.campus_ids = null;
      this.filteredValues.level_ids = null;
      this.filteredValues.sector_ids = null;
      this.filteredValues.speciality_ids = null;
      this.scholarSelect();
    } else if (filterItem?.name === 'school_ids' && filterItem.type === 'super_filter') {
      this.schoolFilter.setValue(null);
      this.campusFilter.setValue(null);
      this.levelFilter.setValue(null);
      this.sectorFilter.setValue(null);
      this.specialityFilter.setValue(null);
      this.filteredValues.campus_ids = null;
      this.filteredValues.level_ids = null;
      this.filteredValues.sector_ids = null;
      this.filteredValues.speciality_ids = null;
      this.selectSchoolFilter('AllF');
    } else if (filterItem?.name === 'campus_ids' && filterItem.type === 'super_filter') {
      this.campusFilter.setValue(null);
      this.levelFilter.setValue(null);
      this.sectorFilter.setValue(null);
      this.specialityFilter.setValue(null);
      this.filteredValues.level_ids = null;
      this.filteredValues.sector_ids = null;
      this.filteredValues.speciality_ids = null;
      this.selectCampusFilter('AllF');
    } else if (filterItem?.name === 'level_ids' && filterItem.type === 'super_filter') {
      this.levelFilter.setValue(null);
      this.sectorFilter.setValue(null);
      this.specialityFilter.setValue(null);
      this.filteredValues.sector_ids = null;
      this.filteredValues.speciality_ids = null;
      this.selectLevelFilter('AllF');
    } else if (filterItem?.name === 'sector_ids' && filterItem.type === 'super_filter') {
      this.sectorFilter.setValue(null);
      this.specialityFilter.setValue(null);
      
      this.filteredValues.speciality_ids = null;
      this.selectSectorFilter('AllF');
    } else if (filterItem?.name === 'speciality_ids' && filterItem.type === 'super_filter') {
      this.specialityFilter.setValue(null);
      this.selectSpecialityFilter('AllF');
    } else {
      if (filterItem.name === 'program_id') {
        this.programFilter.setValue('AllF');
        this.filteredValues.program_id = null;
      } else if (filterItem.name === 'operation_name') {
        this.operationNameFilter.setValue('AllF');
        this.filteredValues.operation_name = null;
      } else if (filterItem.name === 'flux') {
        this.fluxFilter.setValue('AllF');
        this.filteredValues.flux = null;
      } else if (filterItem.name === 'nature') {
        this.natureFilter.setValue('AllF');
        this.filteredValues.nature = null;
      }
    }

    this.getOperationNotExported();
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'super_filter',
        name: 'scholar_season_ids',
        column: 'NAV.INTAKE_CHANNEL.Scholar season',
        isMultiple: false,
        filterValue: this.superFilter,
        filterList: this.scholarSeasonList,
        filterRef: this.scholarFilter,
        isSelectionInput: true,
        displayKey: 'scholar_season',
        savedValue: '_id',
      },
      {
        type: 'super_filter',
        name: 'school_ids',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.School',
        isMultiple: true,
        filterValue: this.superFilter,
        filterList: this.schoolList,
        filterRef: this.schoolFilter,
        isSelectionInput: true,
        displayKey: 'short_name',
        savedValue: '_id',
      },
      {
        type: 'super_filter',
        name: 'campus_ids',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus',
        isMultiple: true,
        filterValue: this.superFilter,
        filterList: this.campusList,
        filterRef: this.campusFilter,
        isSelectionInput: true,
        displayKey: 'name',
        savedValue: '_id',
      },
      {
        type: 'super_filter',
        name: 'level_ids',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level',
        isMultiple: true,
        filterValue: this.superFilter,
        filterList: this.levelList,
        filterRef: this.levelFilter,
        isSelectionInput: true,
        displayKey: 'name',
        savedValue: '_id',
      },
      {
        type: 'super_filter',
        name: 'sector_ids',
        column: 'Sectors',
        isMultiple: true,
        filterValue: this.superFilter,
        filterList: this.sectorList,
        filterRef: this.sectorFilter,
        isSelectionInput: true,
        displayKey: 'name',
        savedValue: '_id',
      },
      {
        type: 'super_filter',
        name: 'speciality_ids',
        column: 'Specialities',
        isMultiple: true,
        filterValue: this.superFilter,
        filterList: this.specialityList,
        filterRef: this.specialityFilter,
        isSelectionInput: true,
        displayKey: 'name',
        savedValue: '_id',
      },
      {
        type: 'super_filter',
        name: 'from_date',
        column: 'From',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.fromFilter,
        isSelectionInput: false,
        displayKey: null,
        savedValue: null,
      },
      {
        type: 'super_filter',
        name: 'to_date',
        column: 'To',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.toFilter,
        isSelectionInput: false,
        displayKey: null,
        savedValue: null,
      },
      {
        type: 'table_filter',
        name: 'student_number',
        column: 'student number',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.studentNumberFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'student_name',
        column: 'Student Name',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.studentNameFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'program_id',
        column: 'Program',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.listOfProgram,
        filterRef: this.programFilter,
        displayKey: 'program',
        savedValue: '_id',
        isSelectionInput: true,
      },
      {
        type: 'table_filter',
        name: 'legal_entity_names',
        column: 'Legal entity',
        isMultiple: this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? false : true,
        filterValue:
          this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? null : this.listOfLegalEntity,
        filterRef: this.legalEntityFilter,
        isSelectionInput: this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? false : true,
        displayKey: this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? null : 'legal_entity_name',
        savedValue: this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? null : 'legal_entity_name',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'date',
        column: 'Date',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.dateFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'operation_name',
        column: 'Operation name',
        isMultiple: false,
        filterValue: this.filteredValuesForBreadCrumb,
        filterList: this.listOfOperationNameForBreadcrumb,
        filterRef: this.operationNameFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: false,
      },
      {
        type: 'table_filter',
        name: 'payer',
        column: 'Payer',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.payerFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'flux',
        column: 'Flux',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.listOfFlux,
        filterRef: this.fluxFilter,
        displayKey: 'key',
        savedValue: 'value',
        isSelectionInput: true,
      },
      {
        type: 'table_filter',
        name: 'nature',
        column: 'Nature',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.listOfNature,
        filterRef: this.natureFilter,
        displayKey: 'key',
        savedValue: 'value',
        isSelectionInput: true,
        translationPrefix: 'nature_type.',
      },
    ]
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  // start multiple selection
  setLegalEntityFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.legalEntity) === JSON.stringify(this.legalEntityFilter.value);
    if (isSame) {
      return;
    } else if (this.legalEntityFilter.value?.length) {
      this.filteredValues.legal_entity_names = this.legalEntityFilter.value;
      this.tempDataFilter.legalEntity = this.legalEntityFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getOperationNotExported();
      }
    } else {
      if (this.tempDataFilter.legalEntity?.length && !this.legalEntityFilter.value?.length) {
        this.filteredValues.legal_entity_names = this.legalEntityFilter.value;
        this.tempDataFilter.legalEntity = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getOperationNotExported();
        }
      } else {
        return;
      }
    }
  }

  isAllDropdownSelectedTable(type) {
    if (type === 'legalEntity') {
      const selected = this.legalEntityFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listOfLegalEntity.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelectedTable(type) {
    if (type === 'legalEntity') {
      const selected = this.legalEntityFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listOfLegalEntity.length;
      return isIndeterminate;
    }
  }

  selectAllDataTable(event, type) {
    if (type === 'legalEntity') {
      if (event.checked) {
        const legalEntityList = this.listOfLegalEntity.map((el) => el?.legal_entity_name);
        this.legalEntityFilter.patchValue(legalEntityList, { emitEvent: false });
      } else {
        this.legalEntityFilter.patchValue(null, { emitEvent: false });
      }
    }
  }
  

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
