import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { ExportCsvService } from 'app/service/export-csv/export-csv.service';
import Swal from 'sweetalert2';
import { NgxPermissionsService } from 'ngx-permissions';
import { Observable } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ImportOscarDialogComponent } from './import-oscar-dialog/import-oscar-dialog.component';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { PermissionService } from 'app/service/permission/permission.service';
import { OscarAssignProgramDialogComponent } from 'app/shared/components/oscar-assign-program-dialog/oscar-assign-program-dialog.component';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';

@Component({
  selector: 'ms-oscar-campus',
  templateUrl: './oscar-campus.component.html',
  styleUrls: ['./oscar-campus.component.scss'],
  providers: [ParseLocalToUtcPipe, ParseUtcToLocalPipe],
})
export class OscarCampusComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();

  // Table Configuration
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  dataCount = 0;
  noData;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  userSelected: any[];
  userSelectedId: any[];
  isCheckedAll = false;
  isWaitingForResponse = false;
  disabledExport = false;
  selectType: any;
  disabledAssign = false;
  isLoading = false;
  exportName: string;
  sortValue = null;
  allDataExport = [];

  displayedColumns: string[] = ['select', 'source', 'dateAdded', 'identity', 'telephone', 'email', 'program_desired', 'trial_date'];
  filterColumns: string[] = [
    'selectFilter',
    'sourceFilter',
    'dateAddedFilter',
    'identityFilter',
    'telephoneFilter',
    'emailFilter',
    'programFilter',
    'trialFilter',
  ];

  dummyData = [
    {
      identity: 'Mr John Doe',
      telephone: '93838199119',
      email: 'johnDoe@yopmail.com',
      program: 'EFAP PARIS - MBA MDB PT - Octobre 2021',
      trial: '22/09/2021',
    },
    {
      identity: 'Mrs Danise Doe',
      telephone: '7827271',
      email: 'danise@yopmail.com',
      program: 'EFAP PARIS - MBA CME - 2021',
      trial: '22/10/2021',
    },
  ];

  school;
  currentUser;
  isDirectorAdmission = false;
  listObjective;
  dataSelectedAll: any;
  dataSelected = [];
  previousLength = 0;
  pageSelected = [];

  nameFilter = new UntypedFormControl('');
  telFilter = new UntypedFormControl('');
  emailFilter = new UntypedFormControl('');
  schoolsFilter = new UntypedFormControl(null);
  programsDesiredFilter = new UntypedFormControl(null);
  trialDateSupFilter = new UntypedFormControl(null);
  schoolsAboveFilter = new UntypedFormControl(null);
  programsDesiredAboveFilter = new UntypedFormControl(null);
  trialDateSupAboveFilter = new UntypedFormControl(null);

  dateFilter = new UntypedFormControl('');

  programsFilterCtrl = new UntypedFormControl('');
  programsListFilter: Observable<any[]>;
  programsList = [];
  tenantKeyList = [];

  trialDateCtrl = new UntypedFormControl('');
  trialDateFilter: Observable<any[]>;
  trialDateList = ['22/09/2021', '22/10/2021'];

  filteredValues = {
    name: '',
    telephone: '',
    email: '',
    oscar_campus_tenant_key: '',
    date_added: '',
    program_desired: '',
    trial_date: '',
    source_types: null
  };

  superFilter = {
    oscar_campus_tenant_key: '',
    program_desired: '',
    trial_date: '',
  };

  filteredValuesAll = {
    oscar_campus_tenant_key: 'All',
    program_desired: 'All',
    trial_date: 'All',
    source_types: 'All'
  }

  programSelected = '';
  tenantKeySelected = '';

  sourceFilterList = [
    // { value: 'All', key: 'AllM' },
    { value: 'oscar', key: 'Oscar' },
    { value: 'manual', key: 'Manual' },
  ];
  sourceFilterCtrl = new UntypedFormControl(null);
  source_type = '';

  tableUpdateInfo;
  isPermission: any;
  currentUserTypeId: any;
  allStudentForCheckbox = [];
  isDisabled = true;

  allOscarForExport = [];
  allOscarForAssign = [];
  dataUnselectUser = [];
  buttonClicked = '';
  isMultipleFilter = false

  filterBreadcrumbData: FilterBreadCrumbItem[] = [];

  constructor(
    private authService: AuthService,
    private permissionsService: NgxPermissionsService,
    private candidatesService: CandidatesService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private parseLocalToUTCPipe: ParseLocalToUtcPipe,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    private exportCsvService: ExportCsvService,
    public permission: PermissionService,
    private httpClient: HttpClient,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit() {
    this.initFilter();
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.initDropdown()
    this.getOscarCampusData();
    this.getDataForList();
    this.getTenantKey();
    this.getTrialDate();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.initDropdown()
    })
    this.pageTitleService.setTitle('CRM');
  }
  initDropdown() {
    this.sourceFilterList = this.sourceFilterList.map(filter => {
      return {
        ...filter,
        label: this.translate.instant(filter.key)
      }
    })
  }

  translateDate(date, time) {
    if (date && time) {
      return this.parseUtcToLocalPipe.transformDate(date, time);
    } else {
      return '';
    }
  }

  translateTime(time) {
    if (time) {
      const timeLocal = this.parseUtcToLocalPipe.transform(time);
      return timeLocal && timeLocal !== 'Invalid date' && moment(timeLocal, 'HH:mm').format('HH[h]mm') !== 'Invalid date'
        ? moment(timeLocal, 'HH:mm').format('HH[h]mm')
        : '00h00';
    } else {
      return '';
    }
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getOscarCampusData();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getUpdateInfo() {
    this.subs.sink = this.candidatesService.getAppPermission().subscribe(
      (ress) => {
        if (ress && ress.candidate_import) {
          this.tableUpdateInfo = ress.candidate_import;
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
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

  getOscarCampusData() {
    // this.isWaitingForResponse = true;
    // setTimeout(() => {
    //   this.isWaitingForResponse = false;
    //   this.dataSource.data = this.dummyData;
    //   this.dataSource.paginator = this.paginator;
    //   this.dataCount = this.dataSource.data.length;
    // }, 1000);
    this.isWaitingForResponse = true;
    this.dataSource.data = [];
    this.paginator.length = 0;
    this.dataCount = 0;

    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    const filterQuery = this.makeFilterQuery();

    console.log('filter and filterquery', filter, filterQuery);

    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService
      .getAllOscarCampus(pagination, this.sortValue, filter, filterQuery, this.source_type, userTypesList)
      .subscribe(
        (students: any) => {
          this.getUpdateInfo();
          if (students && students.length) {
            const student = _.cloneDeep(students);
            // student.forEach((element) => {
            //   if (element.telephone && element.telephone.includes(' ')) {
            //     element.telephone = element.telephone.replaceAll(' ', '');
            //   }
            // });
            this.dataSource.data = student;
            this.paginator.length = students[0].count_document;
            this.dataCount = students[0].count_document;
          } else {
            this.dataSource.data = [];
            this.paginator.length = 0;
            this.dataCount = 0;
          }
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isReset = false;
          this.isWaitingForResponse = false;
          this.filterBreadcrumbData = [];
          this.filterBreadcrumbFormat();
        },
        (err) => {
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

  getProgramDesired() {
    this.programsList = [];
    this.trialDateList = [];
    let key = _.cloneDeep(this.superFilter.oscar_campus_tenant_key);
    const formValue = this.schoolsAboveFilter.value;
    if (formValue && formValue.includes('All')) {
      key = this.tenantKeyList;
    }
    this.tenantKeySelected = key ? key : [];
    this.subs.sink = this.candidatesService.getAllProgramDesiredOfCandidate(this.tenantKeySelected).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.programsList = resp;
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
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

  getTrialDate() {
    this.trialDateList = [];
    let prog = _.cloneDeep(this.superFilter.program_desired);
    let key = _.cloneDeep(this.superFilter.oscar_campus_tenant_key);
    const tenantForm = this.schoolsAboveFilter.value;
    const programForm = this.programsDesiredAboveFilter.value;
    if (programForm && programForm.includes('All')) {
      prog = this.programsList;
    }
    if (tenantForm && tenantForm.includes('All')) {
      key = this.tenantKeyList;
    }
    this.programSelected = this.superFilter.program_desired || (programForm && programForm.includes('All') && prog) ? prog : [];
    this.tenantKeySelected = key && this.programSelected && this.programSelected.length > 0 ? key : [];
    this.subs.sink = this.candidatesService.GetAllTrialDateOfCandidate(this.tenantKeySelected, this.programSelected).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.trialDateList = resp;
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
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

  getTenantKey() {
    this.tenantKeyList = [];
    this.subs.sink = this.candidatesService.GetAllTenantKeyOfCandidate().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.tenantKeyList = resp;
          this.tenantKeyList = this.tenantKeyList.map(tenant => {
            return { _id: tenant, label: this.translate.instant('tenant_list.' + tenant) };
          })
          this.getProgramDesired();
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
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

  makeFilterQuery() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    let tenantKeyMap;
    let programsMap;
    let trialMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'name' ||
          key === 'telephone' ||
          key === 'email' ||
          // key === 'school' ||
          key === 'date_added'
        ) {
        } else if (key === 'oscar_campus_tenant_key') {
          tenantKeyMap = filterData.oscar_campus_tenant_key.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` oscar_campus_tenant_keys:[${tenantKeyMap}]`;
        } else if (key === 'program_desired' && Array.isArray(filterData.program_desired)) {
          programsMap = filterData.program_desired.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` programs_desired:[${programsMap}]`;
        } else if (key === 'trial_date' && Array.isArray(filterData.trial_date)) {
          trialMap = filterData.trial_date.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` trial_dates:[${trialMap}]`;
        } else if (key === 'source_types') {
          // dataMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (!Array.isArray(filterData.program_desired) || !Array.isArray(filterData.trial_date)) {
        } else {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        }
      }
    });
    // if (this.isDirectorAdmission && !this.filteredValues.school) {
    //   if (this.currentUser && this.currentUser.entities) {
    //     this.schoolsFilter.setValue(this.currentUser.entities[0].candidate_school);
    //     filterQuery = filterQuery + ` school: "${this.currentUser.entities[0].candidate_school}"`;
    //   }
    // }
    return filterQuery;
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    console.log('cleanFilterData', this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'trial_date' || key === 'program_desired') {
          if (!Array.isArray(filterData.program_desired) && !Array.isArray(filterData.trial_date)) {
            filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
          }
        } else if (
          key === 'name' ||
          key === 'telephone' ||
          key === 'email' ||
          // key === 'school' ||
          key === 'date_added'
        ) {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        } else if (key === 'oscar_campus_tenant_key') {
        } else if (key !== 'source_types') {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        }
      }
    });
    // if (this.isDirectorAdmission && !this.filteredValues.school) {
    //   if (this.currentUser && this.currentUser.entities) {
    //     this.schoolsFilter.setValue(this.currentUser.entities[0].candidate_school);
    //     filterQuery = filterQuery + ` school: "${this.currentUser.entities[0].candidate_school}"`;
    //   }
    // }
    return 'searching: {' + filterQuery + '}';
  }

  makeFilterExportQuery() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    let tenantKeyMap;
    let programsMap;
    let trialMap;
    let dataMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'name' ||
          key === 'telephone' ||
          key === 'email' ||
          // key === 'school' ||
          key === 'date_added'
        ) {
        } else if (key === 'oscar_campus_tenant_key') {
          tenantKeyMap = filterData.oscar_campus_tenant_key.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"oscar_campus_tenant_keys":[${tenantKeyMap}]`
            : filterQuery + `"oscar_campus_tenant_keys":[${tenantKeyMap}]`;
        } else if (key === 'program_desired' && Array.isArray(filterData.program_desired)) {
          programsMap = filterData.program_desired.map((res) => `"` + encodeURIComponent(res) + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"programs_desired":[${programsMap}]`
            : filterQuery + `"programs_desired":[${programsMap}]`;
        } else if (key === 'trial_date' && Array.isArray(filterData.trial_date)) {
          trialMap = filterData.trial_date.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"trial_dates":[${trialMap}]` : filterQuery + `"trial_dates":[${trialMap}]`;
        } else if (key === 'source_types') {
          dataMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${dataMap}]` : filterQuery + `"${key}":[${dataMap}]`;
        } else if (key !== 'trial_date' && key !== 'program_desired') {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${filterData[key]}` : filterQuery + `"${key}":${filterData[key]}`;
        }
      }
    });
    // if (this.isDirectorAdmission && !this.filteredValues.school) {
    //   if (this.currentUser && this.currentUser.entities) {
    //     this.schoolsFilter.setValue(this.currentUser.entities[0].candidate_school);
    //     filterQuery = filterQuery + ` school: "${this.currentUser.entities[0].candidate_school}"`;
    //   }
    // }
    return filterQuery;
  }

  cleanFilterDataExport() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'name' ||
          key === 'telephone' ||
          key === 'email' ||
          key === 'trial_date' ||
          key === 'program_desired' ||
          // key === 'school' ||
          key === 'date_added'
        ) {
          if (!Array.isArray(filterData.program_desired) && !Array.isArray(filterData.trial_date)) {
            filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
          }
        } else if (key === 'oscar_campus_tenant_key' || key === 'program_desired' || key === 'trial_date') {
        } else if (key !== 'source_types') {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${filterData[key]}` : filterQuery + `"${key}":${filterData[key]}`;
        }
      }
    });
    // if (this.isDirectorAdmission && !this.filteredValues.school) {
    //   if (this.currentUser && this.currentUser.entities) {
    //     this.schoolsFilter.setValue(this.currentUser.entities[0].candidate_school);
    //     filterQuery = filterQuery + ` school: "${this.currentUser.entities[0].candidate_school}"`;
    //   }
    // }
    return 'searching={' + filterQuery + '}';
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getOscarCampusData();
      }
    }
  }

  initFilter() {
    this.subs.sink = this.sourceFilterCtrl.valueChanges.subscribe((statusSearch) => {
      // this.clearSelectIfFilter();
      this.isMultipleFilter = true
    });

    this.subs.sink = this.nameFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!name.match(symbol) && !name.match(symbol1)) {
        if (!this.isReset) {
          if (this.nameFilter.value) {
            this.filteredValues.name = name ? name : '';
            this.paginator.pageIndex = 0;
            // this.clearSelectIfFilter();
            this.getOscarCampusData();
          } else if (!name && this.filteredValues.name !== '') {
            this.nameFilter.setValue('');
            this.filteredValues.name = '';
            this.paginator.pageIndex = 0;
            if (!this.isReset) {
              // this.clearSelectIfFilter();
              this.getOscarCampusData();
            }
          }
        }
      } else {
        this.nameFilter.setValue('');
        this.filteredValues.name = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          // this.clearSelectIfFilter();
          this.getOscarCampusData();
        }
      }
    });

    this.subs.sink = this.telFilter.valueChanges.pipe(debounceTime(400)).subscribe((tel) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!tel.match(symbol) && !tel.match(symbol1)) {
        if (!this.isReset) {
          if (this.telFilter.value) {
            this.filteredValues.telephone = tel ? tel : '';
            this.paginator.pageIndex = 0;
            // this.clearSelectIfFilter();
            this.getOscarCampusData();
          } else if (!tel && this.filteredValues.telephone !== '') {
            this.telFilter.setValue('');
            this.filteredValues.telephone = '';
            this.paginator.pageIndex = 0;
            if (!this.isReset) {
              // this.clearSelectIfFilter();
              this.getOscarCampusData();
            }
          }
        }
      } else {
        this.telFilter.setValue('');
        this.filteredValues.telephone = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          // this.clearSelectIfFilter();
          this.getOscarCampusData();
        }
      }
    });

    this.subs.sink = this.emailFilter.valueChanges.pipe(debounceTime(400)).subscribe((email) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!email.match(symbol) && !email.match(symbol1)) {
        if (!this.isReset) {
          if (this.emailFilter.value) {
            this.filteredValues.email = email ? email : '';
            this.paginator.pageIndex = 0;
            // this.clearSelectIfFilter();
            this.getOscarCampusData();
          } else if (!email && this.filteredValues.email !== '') {
            this.emailFilter.setValue('');
            this.filteredValues.email = '';
            this.paginator.pageIndex = 0;
            if (!this.isReset) {
              // this.clearSelectIfFilter();
              this.getOscarCampusData();
            }
          }
        }
      } else {
        this.emailFilter.setValue('');
        this.filteredValues.email = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          // this.clearSelectIfFilter();
          this.getOscarCampusData();
        }
      }
    });

    this.subs.sink = this.dateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.date_added = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          // this.clearSelectIfFilter();
          this.getOscarCampusData();
        }
      }
    });

    this.subs.sink = this.schoolsAboveFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.schoolsFilter.setValue(null, { emitEvent: false });
      this.trialDateCtrl.setValue(null, { emitEvent: false });
      this.programsFilterCtrl.setValue(null, { emitEvent: false });
      this.trialDateSupAboveFilter.setValue(null, { emitEvent: false });
      this.programsDesiredAboveFilter.setValue(null, { emitEvent: false });
      this.trialDateList = [];
      this.programsList = [];
      this.superFilter.program_desired = '';
      this.superFilter.trial_date = '';
      this.superFilter.oscar_campus_tenant_key = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
      if (!this.isReset) {
        // this.getTrialDate();
        this.getProgramDesired();
      }
    });

    this.subs.sink = this.programsDesiredAboveFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.programsFilterCtrl.setValue(null, { emitEvent: false });
      console.log('this.filteredValues.program_desired', this.filteredValues.program_desired);
      this.filteredValues.program_desired = '';
      this.trialDateCtrl.setValue(null, { emitEvent: false });
      this.trialDateSupAboveFilter.setValue(null, { emitEvent: false });
      this.trialDateList = [];
      this.superFilter.trial_date = '';
      this.superFilter.program_desired = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
      if (!this.isReset && statusSearch) {
        this.getTrialDate();
      }
    });

    this.subs.sink = this.trialDateSupAboveFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.trialDateCtrl.setValue(null, { emitEvent: false });
      this.superFilter.trial_date = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    this.subs.sink = this.programsFilterCtrl.valueChanges.pipe(debounceTime(400)).subscribe((program) => {
      if (this.programsFilterCtrl.value !== '') {
        const symbol = /[()|{}\[\]:;<>?,\/]/;
        const symbol1 = /\\/;
        if (!program) {
          return;
        }
        if (!program?.match(symbol) && !program?.match(symbol1)) {
          if (!this.isReset) {
            if (this.programsFilterCtrl.value) {
              this.programsDesiredAboveFilter.setValue(null, { emitEvent: false });
              this.filteredValues.program_desired = program ? program : '';
              this.paginator.pageIndex = 0;
              this.getOscarCampusData();
            } else if (!program && this.filteredValues.program_desired !== '') {
              this.programsFilterCtrl.setValue('');
              this.filteredValues.program_desired = '';
              this.paginator.pageIndex = 0;
              if (!this.isReset) {
                this.getOscarCampusData();
              }
            }
          }
        }
      } else {
        this.filteredValues.program_desired = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          // this.clearSelectIfFilter();
          this.getOscarCampusData();
        }
      }
    });

    this.subs.sink = this.trialDateCtrl.valueChanges.pipe(debounceTime(400)).subscribe((trialDate) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!trialDate.match(symbol) && !trialDate.match(symbol1)) {
        if (!this.isReset) {
          if (this.trialDateCtrl.value) {
            this.trialDateSupAboveFilter.setValue(null, { emitEvent: false });
            this.filteredValues.trial_date = trialDate ? trialDate : '';
            this.paginator.pageIndex = 0;
            // this.clearSelectIfFilter();
            this.getOscarCampusData();
          } else if (!trialDate && this.filteredValues.trial_date !== '') {
            this.trialDateCtrl.setValue('');
            this.filteredValues.trial_date = '';
            this.paginator.pageIndex = 0;
            if (!this.isReset) {
              // this.clearSelectIfFilter();
              this.getOscarCampusData();
            }
          }
        }
      } else {
        this.trialDateCtrl.setValue('');
        this.filteredValues.trial_date = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          // this.clearSelectIfFilter();
          this.getOscarCampusData();
        }
      }
    });
  }

  clearSelectIfFilter() {
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    this.allOscarForExport = [];
    this.allOscarForAssign = [];
  }

  getDataForList() {
    if (this.isDirectorAdmission) {
      const name =
        this.currentUser && this.currentUser.entities && this.currentUser.entities[0] ? this.currentUser.entities[0].candidate_school : '';
      this.subs.sink = this.candidatesService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe(
        (resp) => {
          if (resp) {
            this.listObjective = resp;
            this.school = this.listObjective;
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
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
    } else {
      const name = '';
      this.subs.sink = this.candidatesService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe(
        (resp) => {
          if (resp) {
            this.listObjective = resp;
            this.school = this.listObjective;
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
  }

  setSchoolFilter() {
    if (!this.schoolsAboveFilter.value || this.schoolsAboveFilter.value.length === 0) {
      this.filteredValues['school'] = '';
      this.getOscarCampusData();
    } else {
      this.filteredValues['school'] = this.schoolsAboveFilter.value;
      this.getOscarCampusData();
    }
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
    const numSelected = this.selection.selected.length;
    if (numSelected > 0) {
      this.disabledExport = false;
      this.disabledAssign = false;
    } else {
      this.disabledExport = true;
      this.disabledAssign = true;
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

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
      this.dataUnselectUser = [];
      this.allOscarForExport = [];
      this.allOscarForExport = [];
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      this.allOscarForAssign = [];
      this.allOscarForExport = [];
      this.dataUnselectUser = [];
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
      limit: 500,
      page: pageNumber,
    };
    this.isWaitingForResponse = true;
    const filter = this.cleanFilterData();
    const filterQuery = this.makeFilterQuery();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService
      .getAllOscarCampusCheckbox(pagination, this.sortValue, filter, filterQuery, this.source_type, userTypesList)
      .subscribe(
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
                });
              }
              this.pageSelected.push(this.paginator.pageIndex);
            } else {
              this.pageSelected = [];
            }
          }
        },
        (err) => {
          this.isReset = false;
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err);
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

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    // console.log(numSelected, numRows);
    return numSelected === numRows || numSelected > numRows;
  }

  resetDataKeepFilter() {
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];

    this.getOscarCampusData();
  }

  resetFilter() {
    this.isReset = true;
    this.isMultipleFilter = false
    this.source_type = '';
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.filteredValues = {
      name: '',
      telephone: '',
      email: '',
      oscar_campus_tenant_key: '',
      date_added: '',
      program_desired: '',
      trial_date: '',
      source_types: null
    };
    this.superFilter = {
      oscar_campus_tenant_key: '',
      program_desired: '',
      trial_date: '',
    };
    // this.nameFilter = new FormControl('');
    // this.telFilter = new FormControl('');
    // this.emailFilter = new FormControl('');
    // this.dateFilter = new FormControl('');
    // this.schoolsFilter = new FormControl(null);
    // this.programsDesiredFilter = new FormControl(null);
    // this.trialDateSupFilter = new FormControl(null);
    // this.schoolsAboveFilter = new FormControl(null);
    // this.programsDesiredAboveFilter = new FormControl(null);
    // this.trialDateSupAboveFilter = new FormControl(null);
    // this.programsFilterCtrl = new FormControl('');
    // this.trialDateCtrl = new FormControl('');

    this.nameFilter.patchValue(null, { emitEvent: false });
    this.telFilter.patchValue(null, { emitEvent: false });
    this.emailFilter.patchValue(null, { emitEvent: false });
    this.dateFilter.patchValue(null, { emitEvent: false });
    this.schoolsFilter.patchValue(null, { emitEvent: false });
    this.programsDesiredFilter.patchValue(null, { emitEvent: false });
    this.trialDateSupFilter.patchValue(null, { emitEvent: false });
    this.schoolsAboveFilter.patchValue(null, { emitEvent: false });
    this.programsDesiredAboveFilter.patchValue(null, { emitEvent: false });
    this.trialDateSupAboveFilter.patchValue(null, { emitEvent: false });
    this.programsFilterCtrl.patchValue(null, { emitEvent: false });
    this.trialDateCtrl.patchValue(null, { emitEvent: false });
    this.sourceFilterCtrl.patchValue(null, { emitEvent: false });

    // this.dataSource.filter = null;
    this.sortValue = null;
    this.programsList = [];
    this.trialDateList = [];
    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = '';
    this.sort.direction = '';
    this.sort.active = '';
    this.getOscarCampusData();
    this.isDisabled = true;
    if (this.schoolsAboveFilter.value && this.schoolsAboveFilter.value.includes('All')) {
      this.getProgramDesired();
    }
  }

  customFilterPredicate() {
    const myFilterPredicate = function (data, filter: string): boolean {
      const searchString = JSON.parse(filter);
      const nameFound = data.identity.toString().trim().toLowerCase().indexOf(searchString.name.toLowerCase()) !== -1;
      const telFound = data.telephone.toString().trim().toLowerCase().indexOf(searchString.tel.toLowerCase()) !== -1;
      const emailFound = data.email.toString().trim().toLowerCase().indexOf(searchString.email.toLowerCase()) !== -1;
      const programFound = searchString.program
        ? searchString.program.toLowerCase() === 'alls'
          ? true
          : data.program.toString().trim().toLowerCase().indexOf(searchString.program.toLowerCase()) === 0
        : true;
      const trialFound = searchString.trial
        ? searchString.trial.toLowerCase() === 'alls'
          ? true
          : data.trial.toString().trim().toLowerCase().indexOf(searchString.trial.toLowerCase()) === 0
        : true;
      return nameFound && telFound && emailFound && programFound && trialFound;
    };

    return myFilterPredicate;
  }

  // typeProgram(value) {
  //   console.log(value);
  //   this.filteredValues.program = value;
  //   this.dataSource.filter = JSON.stringify(this.filteredValues);
  // }

  // typeDate(value) {
  //   console.log(value);
  //   this.filteredValues.trial = value;
  //   this.dataSource.filter = JSON.stringify(this.filteredValues);
  // }

  openAssingProgram() {
    if (this.dataSelected && this.dataSelected.length < 1 && !this.isCheckedAll) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      let candidatesId;
      let selectType;
      let filter;
      let countDocument;
      let dataSelecteds;
      if (this.selectType === 'one') {
        if (this.allStudentForCheckbox && this.allStudentForCheckbox.length) {
          dataSelecteds = this.dataSelected;
        }
        candidatesId = this.allStudentForCheckbox && this.allStudentForCheckbox.length ? _.uniqBy(dataSelecteds, '_id') : this.dataSelected;
        selectType = 'one';
        filter = null;
      } else {
        if (this.allStudentForCheckbox && this.allStudentForCheckbox.length) {
          dataSelecteds = this.dataSelected;
        }
        candidatesId = this.allStudentForCheckbox && this.allStudentForCheckbox.length ? _.uniqBy(dataSelecteds, '_id') : this.dataSelected;
        selectType = 'all';
        filter = _.cloneDeep(this.filteredValues);
        filter.crm_table = 'oscar';
        if (this.source_type) {
          filter.source_type = this.source_type;
        }
        countDocument = this.dataCount;
      }
      this.subs.sink = this.dialog
        .open(OscarAssignProgramDialogComponent, {
          width: '600px',
          minHeight: '100px',
          panelClass: 'certification-rule-pop-up',
          disableClose: true,
          autoFocus: false,
          restoreFocus: false,
          data: {
            candidateId: candidatesId,
            type: selectType,
            filter: filter,
            countDocument: countDocument,
            from: 'crm',
          },
        })
        .afterClosed()
        .subscribe((resp) => {
          if (resp) {
            this.disabledExport = true;
            this.disabledAssign = true;
            // this.resetFilter();
            this.resetDataKeepFilter();
            if (this.schoolsAboveFilter.value && this.schoolsAboveFilter.value.includes('All')) {
              this.getProgramDesired();
            }
          }
        });
    }
  }

  refetchCandidateData() {
    this.isLoading = true;
    this.subs.sink = this.candidatesService.getLatestCandidateOscarTable().subscribe(
      (resp) => {
        if (resp && resp.total_created !== 0) {
          this.isLoading = false;
          this.swalFetchComplete(resp.total_created);
        } else {
          this.isLoading = false;
          this.swalFetchComplete(resp.total_created);
        }
      },
      (err) => {
        this.isLoading = false;
        this.authService.postErrorLog(err);
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
          this.handleError(err);
        }
      },
    );
  }

  refreshCandidateFromHubSpot() {
    this.isLoading = true;
    this.subs.sink = this.candidatesService.refreshCandidateFromHubSpot().subscribe(
      (resp) => {
        this.getUpdateInfo();
        if (resp) {
          if (resp === 'Candidate import from HubSpot is in progress') {
            // this.clearSelectIfFilter();
            this.getOscarCampusData();
            Swal.fire({
              type: 'success',
              title: this.translate.instant('HUBSPOT_S1.TITLE'),
              text: this.translate.instant('HUBSPOT_S1.TEXT'),
              confirmButtonText: this.translate.instant('HUBSPOT_S1.BUTTON 1'),
              showCancelButton: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            });
          }
          this.isLoading = false;
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        if (err && err['message']) {
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
          }
          console.log(err['message']);
          if (err['message'] === 'GraphQL error: Import from hubspot already in progress') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('HUBSPOT_S2.TITLE'),
              text: this.translate.instant('HUBSPOT_S2.TEXT'),
              confirmButtonText: this.translate.instant('HUBSPOT_S2.BUTTON 1'),
              showCancelButton: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            });
            this.isLoading = false;
            // this.clearSelectIfFilter();
            this.getOscarCampusData();
          } else {
            this.isLoading = false;
            // this.clearSelectIfFilter();
            this.getOscarCampusData();
            this.handleError(err);
          }
        }
      },
    );
  }

  swalFetchComplete(data) {
    Swal.fire({
      type: 'success',
      title: this.translate.instant('OSCAR_S6.Title'),
      text: this.translate.instant('OSCAR_S6.Text', { numberOfStudent: data }),
      confirmButtonText: this.translate.instant('OSCAR_S6.BUTTON'),
      showCancelButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.value) {
        this.getOscarCampusData();
        this.getTenantKey();
        // this.getProgramDesired();
        this.getTrialDate();
      }
    });
  }

  transformDate(data) {
    if (data) {
      const date = this.parseUtcToLocalPipe.fixDateFormatUtc(data);
      return date;
    } else {
      return '';
    }
  }

  onDataExport() {
    if (this.selectType === 'one') {
      const data = [];
      if (this.selection.selected.length) {
        for (const oscar of this.selection.selected) {
          const obj = [];
          const date = this.transformDate(oscar.date_added);
          const candidate =
            oscar.civility && oscar.last_name && oscar.first_name
              ? (oscar.civility && oscar.civility !== 'neutral' ? this.translate.instant(oscar.civility) : '') +
              ' ' +
              (oscar.last_name ? oscar.last_name.toUpperCase() : '') +
              ' ' +
              (oscar.first_name ? oscar.first_name : '')
              : '-';

          obj[0] = date ? date : '-';
          obj[1] = candidate;
          obj[2] = oscar.telephone ? oscar.telephone : '-';
          obj[3] = oscar.email ? oscar.email : '-';
          obj[4] = oscar.program_desired ? oscar.program_desired : '-';
          obj[5] = oscar.trial_date ? oscar.trial_date : '-';
          data.push(obj);
        }
        const valueRange = { values: data };
        const today = moment().format('DD-MM-YYYY');
        const sheetID = this.translate.currentLang === 'en' ? 0 : 595478485;
        const title = this.exportName + '_' + today;
        const sheetData = {
          spreadsheetId: '1_zJPBU3NVCU9J-XwvC0eeAN6h-nIEj1mCUkhc2a0On0',
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

  getAllExportData(pageNumber: number) {
    this.isLoading = true;
    const pagination = {
      limit: 500,
      page: pageNumber,
    };
    const filter = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService
      .getAllOscarCampus(pagination, this.sortValue, filter, this.filteredValues.oscar_campus_tenant_key, this.source_type, userTypesList)
      .subscribe(
        (res) => {
          if (res && res.length) {
            this.allDataExport.push(...res);
            const pages = pageNumber + 1;

            this.getAllExportData(pages);
          } else {
            this.isLoading = false;
            this.exportAllData(this.allDataExport);
          }
        },
        (err) => {
          this.isLoading = false;
          this.authService.postErrorLog(err);
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

  exportAllData(exportData: any) {
    const datasForExport = _.uniqBy(exportData, '_id');
    const data = [];
    if (datasForExport && datasForExport.length) {
      for (const oscar of datasForExport) {
        const obj = [];
        const date = this.transformDate(oscar.date_added);
        const candidate =
          oscar.civility && oscar.last_name && oscar.first_name
            ? (oscar.civility && oscar.civility !== 'neutral' ? this.translate.instant(oscar.civility) : '') +
            ' ' +
            (oscar.last_name ? oscar.last_name.toUpperCase() : '') +
            ' ' +
            (oscar.first_name ? oscar.first_name : '')
            : '-';

        obj[0] = date ? date : '-';
        obj[1] = candidate;
        obj[2] = oscar.telephone ? oscar.telephone : '-';
        obj[3] = oscar.email ? oscar.email : '-';
        obj[4] = oscar.program_desired ? oscar.program_desired : '-';
        obj[5] = oscar.trial_date ? oscar.trial_date : '-';
        data.push(obj);
      }
      const valueRange = { values: data };
      const today = moment().format('DD-MM-YYYY');
      const sheetID = this.translate.currentLang === 'en' ? 0 : 595478485;
      const title = this.exportName + '_' + today;
      const sheetData = {
        spreadsheetId: '1_zJPBU3NVCU9J-XwvC0eeAN6h-nIEj1mCUkhc2a0On0',
        sheetId: sheetID,
        range: 'A7',
      };
      this.exportCsvService.createAndUpdateSpreadsheet(valueRange, title, sheetData);
    }
    Swal.close();
  }

  downloadCSV() {
    if (this.dataSelected && this.dataSelected.length < 1 && !this.isCheckedAll) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
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
    const search = this.cleanFilterDataExport();
    const sFilter = this.makeFilterExportQuery();

    const importStudentTemlate = `downloadOscarCampusData/`;
    let filter;
    const userTypesList =
      this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id.map((res) => `"` + res + `"`) : [];
    if ((this.dataSelected.length && !this.isCheckedAll) || (this.dataUnselectUser && this.dataUnselectUser.length)) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      filter =
        `filter={"candidate_ids":` +
        `[` +
        mappedUserId.toString() +
        `],"source_type":"` +
        this.source_type +
        `","crm_table":"oscar"` +
        (sFilter ? ', ' + sFilter : '') +
        `}`;
    } else {
      filter = `filter={"source_type":"` + this.source_type + `","crm_table":"oscar"` + (sFilter ? ', ' + sFilter : '') + `}`;
    }
    const fullURL =
      url +
      importStudentTemlate +
      fileType +
      '/' +
      lang +
      '/' +
      this.currentUser?._id +
      '?' +
      filter +
      '&' +
      search +
      '&user_type_ids=[' +
      userTypesList +
      ']' +
      '&' +
      `user_type_id="${this.currentUserTypeId}"`;
    console.log('fullURL', fullURL);
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
            title: this.translate.instant('ReAdmission_S3.TITLE'),
            text: this.translate.instant('ReAdmission_S3.TEXT'),
            confirmButtonText: this.translate.instant('ReAdmission_S3.BUTTON'),
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
      },
    );
    // element.href = encodeURI(fullURL);
    // console.log(element.href);
    // element.target = '_blank';
    // element.download = 'Template Import CSV';
    // document.body.appendChild(element);
    // element.click();
    // document.body.removeChild(element);
  }

  handleError(err) {
    if (err['message'] === 'GraphQL error: Some data cannot be imported!') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('OSCAR_S5.TITLE'),
        text: this.translate.instant('OSCAR_S5.TEXT'),
        confirmButtonText: this.translate.instant('OSCAR_S5.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    }
  }

  displayUserTelephone(element) {
    const telephone = element;
    // if (element && element.includes(' ')) {
    //   telephone = element.replaceAll(' ', '');
    // }
    return telephone;
  }

  displayTooltipSource(data) {
    if (data.oscar_campus_id) {
      return this.translate.instant('Oscar');
    } else if (data.hubspot_contact_id && data.hubspot_deal_id) {
      return this.translate.instant('Hubspot');
    } else {
      return this.translate.instant('Manual');
    }
  }

  openImport() {
    const dialogRef = this.dialog.open(ImportOscarDialogComponent, {
      disableClose: true,
      width: '600px',
      minHeight: '100px',
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.getOscarCampusData();
      }
    });
  }

  applySuperFilter() {
    this.paginator.pageIndex = 0;
    this.filteredValues = {
      ...this.filteredValues,
      oscar_campus_tenant_key: this.superFilter.oscar_campus_tenant_key,
      program_desired: this.superFilter.program_desired,
      trial_date: this.superFilter.trial_date,
    };
    console.log('this.filteredValues', this.filteredValues);
    this.isDisabled = true;
    this.getOscarCampusData();
  }
  checkSuperFilterCRM() {
    const form = this.schoolsAboveFilter.value;
    if (form && form.length) {
      this.schoolsAboveFilter.patchValue(form);
    } else {
      this.schoolsAboveFilter.patchValue(null);
    }
  }
  checkSuperFilterProgramDesired() {
    const form = this.programsDesiredAboveFilter.value;
    if (form && form.length) {
      this.programsDesiredAboveFilter.patchValue(form);
    } else {
      this.programsDesiredAboveFilter.patchValue(null);
    }
  }
  checkSuperFilterTrialDate() {
    const form = this.trialDateSupAboveFilter.value;
    if (form && form.length) {
      this.trialDateSupAboveFilter.patchValue(form);
    } else {
      this.trialDateSupAboveFilter.patchValue(null);
    }
  }
  // ************************ Below is function for all button above table candidate FI
  getAllOscarForExportCheckbox(pageNumber, action) {
    if (this.buttonClicked === 'export') {
      if (this.isCheckedAll) {
        if (this.dataUnselectUser.length < 1) {
          this.downloadCSV();
        } else {
          if (pageNumber === 0) {
            this.allOscarForExport = [];
            this.dataSelected = [];
          }
          const pagination = {
            limit: 500,
            page: pageNumber,
          };
          this.isLoading = true;
          const filter = this.cleanFilterData();
          const filterQuery = this.makeFilterQuery();
          this.subs.sink = this.candidatesService
            .getAllOscarCampusForExport(pagination, this.sortValue, filter, filterQuery, this.source_type)
            .subscribe(
              (students: any) => {
                if (students && students.length) {
                  const resp = _.cloneDeep(students);
                  this.allOscarForExport = _.concat(this.allOscarForExport, resp);
                  const page = pageNumber + 1;
                  this.getAllOscarForExportCheckbox(page, action);
                } else {
                  this.isLoading = false;
                  if (this.isCheckedAll) {
                    if (this.allOscarForExport && this.allOscarForExport.length) {
                      this.dataSelected = this.allOscarForExport.filter((list) => !this.dataUnselectUser.includes(list._id));
                      this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                      console.log('getAllOscarCampusForExport', this.dataSelected);
                      if (this.dataSelected && this.dataSelected.length) {
                        this.downloadCSV();
                      }
                    }
                  }
                }
              },
              (error) => {
                this.isReset = false;
                this.isLoading = false;
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('SORRY'),
                  text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                  confirmButtonText: this.translate.instant('OK'),
                });
              },
            );
        }
      } else {
        this.downloadCSV();
      }
    }
  }
  getAllOscarForAssignCheckbox(pageNumber, action) {
    if (this.buttonClicked === 'assign') {
      if (this.isCheckedAll) {
        if (this.dataUnselectUser.length < 1) {
          this.openAssingProgram();
        } else {
          if (pageNumber === 0) {
            this.allOscarForAssign = [];
            this.dataSelected = [];
            this.allStudentForCheckbox = [];
          }
          const pagination = {
            limit: 500,
            page: pageNumber,
          };
          this.isLoading = true;
          const filter = this.cleanFilterData();
          const filterQuery = this.makeFilterQuery();
          this.subs.sink = this.candidatesService
            .getAllOscarCampusForAssign(pagination, this.sortValue, filter, filterQuery, this.source_type)
            .subscribe(
              (students: any) => {
                if (students && students.length) {
                  const resp = _.cloneDeep(students);
                  this.allOscarForAssign = _.concat(this.allOscarForAssign, resp);
                  const page = pageNumber + 1;
                  this.getAllOscarForAssignCheckbox(page, action);
                } else {
                  this.isLoading = false;
                  if (this.isCheckedAll) {
                    if (this.allOscarForAssign && this.allOscarForAssign.length) {
                      this.dataSelected = this.allOscarForAssign.filter((list) => !this.dataUnselectUser.includes(list._id));
                      this.allStudentForCheckbox = this.allOscarForAssign.filter((list) => !this.dataUnselectUser.includes(list._id));
                      this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                      console.log('getAllOscarCampusForAssign', this.dataSelected);
                      if (this.dataSelected && this.dataSelected.length) {
                        this.openAssingProgram();
                      }
                    }
                  }
                }
              },
              (error) => {
                this.isReset = false;
                this.isLoading = false;
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('SORRY'),
                  text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                  confirmButtonText: this.translate.instant('OK'),
                });
              },
            );
        }
      } else {
        this.openAssingProgram();
      }
    }
  }
  // ************************ END
  removeSuperFilter(removeFilterCascadeName) {
    if (this.filterBreadcrumbData?.length && removeFilterCascadeName?.length) {
      removeFilterCascadeName.forEach((filter) => {
        const filterBreadcrumb = this.filterBreadcrumbData.find((data) => data.name === filter);
        if (filterBreadcrumb) {
          filterBreadcrumb.filterRef.setValue(null, { emitEvent: false });
          this.superFilter[filterBreadcrumb.name] = null;
          this.filteredValues[filterBreadcrumb.name] = null;
        }
      });
    }
  }
  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem && filterItem.type === 'super_filter') {
      this.filteredValues[filterItem.name] = null;
      if (filterItem.name === 'oscar_campus_tenant_key') {
        this.removeSuperFilter(['program_desired', 'trial_date']);
      } else if (filterItem.name === 'program_desired') {
        this.removeSuperFilter(['trial_date']);
      }
    }
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.superFilter, this.filteredValues, null, true);
    this.clearSelectIfFilter();
    this.getOscarCampusData();
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'oscar_campus_tenant_key', // name of the key in the object storing the filter
        column: 'Entité CRM', // name of the column in the table or the field if super filter
        isMultiple: this.schoolsAboveFilter?.value?.length === this.tenantKeyList?.length ? false : true, // can it support multiple selection
        filterValue: this.schoolsAboveFilter?.value?.length === this.tenantKeyList?.length ? this.filteredValuesAll : this.filteredValues, // the object holding the filter value (e.g. filteredValues | superFilter)
        filterList: this.schoolsAboveFilter?.value?.length === this.tenantKeyList?.length ? null : this.tenantKeyList, // the array/list holding the dropdown options
        filterRef: this.schoolsAboveFilter, // the ref to form control binded to the filter
        isSelectionInput: this.schoolsAboveFilter?.value?.length === this.tenantKeyList?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.schoolsAboveFilter?.value?.length === this.tenantKeyList?.length ? null : 'label', // the key displayed in the html (only applicable to array of objects)
        savedValue: this.schoolsAboveFilter?.value?.length === this.tenantKeyList?.length ? null : '_id', // the value saved when user select an option (e.g. _id),
      },
      

      // Table Filters Below
      {
        type: 'table_filter',
        name: 'source_types',
        column: 'Source',
        isMultiple: this.sourceFilterCtrl?.value?.length === this.sourceFilterList?.length ? false : true,
        filterValue: this.sourceFilterCtrl?.value?.length === this.sourceFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.sourceFilterCtrl?.value?.length === this.sourceFilterList?.length ? null : this.sourceFilterList,
        filterRef: this.sourceFilterCtrl,
        displayKey: this.sourceFilterCtrl?.value?.length === this.sourceFilterList?.length ? null : 'key',
        savedValue: this.sourceFilterCtrl?.value?.length === this.sourceFilterList?.length ? null : 'value',
        isSelectionInput: this.sourceFilterCtrl?.value?.length === this.sourceFilterList?.length ? false : true,
        resetValue: 'All',
      },
      {
        type: 'table_filter',
        name: 'date_added',
        column: 'Date added',
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
        name: 'name',
        column: 'Name',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.nameFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        resetValue: '',
      },
      {
        type: 'table_filter',
        name: 'telephone',
        column: 'Telephone',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.telFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        resetValue: '',
      },
      {
        type: 'table_filter',
        name: 'email',
        column: 'email',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.emailFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        resetValue: '',
      },
    ];

    // *************** Hanlde trial/meeting date filter
    const trialDateIndex = filterInfo.findIndex((data) => data?.name === 'trial_date');
    if (trialDateIndex !== -1) {
      filterInfo.splice(trialDateIndex, 1);
    }
    
    if (this.trialDateSupAboveFilter.value && !this.trialDateCtrl.value) {
      filterInfo.push({
        type: 'super_filter',
        name: 'trial_date',
        column: 'Trial date',
        isMultiple:  this.trialDateSupAboveFilter?.value?.length === this.trialDateList?.length ? false : true,
        filterValue: this.trialDateSupAboveFilter?.value?.length === this.trialDateList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.trialDateSupAboveFilter?.value?.length === this.trialDateList?.length ? null : this.trialDateList,
        filterRef: this.trialDateSupAboveFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: this.trialDateSupAboveFilter?.value?.length === this.trialDateList?.length ? false : true,
        noTranslate: true
      });
    } else if (!this.trialDateSupAboveFilter.value && this.trialDateCtrl.value) {
      filterInfo.push({
        type: 'table_filter',
        name: 'trial_date',
        column: 'Trial date',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.trialDateCtrl,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        resetValue: '',
        noTranslate: true
      });
    }

    if (!this.programsDesiredAboveFilter.value && this.programsFilterCtrl.value) {
      filterInfo.push( {
        type: 'table_filter',
        name: 'program_desired',
        column: 'Program desired',
        isMultiple: false,
        filterValue: this.programsDesiredAboveFilter?.value ? null : this.filteredValues,
        filterList: null,
        filterRef: this.programsFilterCtrl,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        resetValue: '',
        noTranslate: true
      });
    }

    else if (this.programsDesiredAboveFilter.value && !this.programsFilterCtrl.value) {
      filterInfo.push({
        type: 'super_filter',
        name: 'program_desired',
        column: 'Program desired',
        isMultiple: this.programsDesiredAboveFilter?.value?.length === this.programsList?.length ? false : true,
        filterValue: this.programsDesiredAboveFilter?.value?.length === this.programsList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList:  this.programsDesiredAboveFilter?.value?.length === this.programsList?.length ? null : this.programsList,
        filterRef: this.programsDesiredAboveFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: this.programsDesiredAboveFilter?.value?.length === this.programsList?.length ? false : true,
        resetValue: null,
        noTranslate: true
      });
    }

    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  controllerButton(action) {
    switch (action) {
      case 'export':
        setTimeout(() => {
          this.getAllOscarForExportCheckbox(0, 'export');
        }, 500);
        break;
      case 'assign':
        setTimeout(() => {
          this.getAllOscarForAssignCheckbox(0, 'assign');
        }, 500);
        break;
      default:
        // this.resetFilter();
        this.resetDataKeepFilter();
    }
  }

  isAllDropdownSelected(type) {
    if (type === 'crm') {
      const selected = this.schoolsAboveFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.tenantKeyList.length;
      return isAllSelected;
    } else if (type === 'program') {
      const selected = this.programsDesiredAboveFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.programsList.length;
      return isAllSelected;
    } else if (type === 'trial') {
      const selected = this.trialDateSupAboveFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.trialDateList.length;
      return isAllSelected;
    } else if (type === 'source') {
      const selected = this.sourceFilterCtrl.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.sourceFilterList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'crm') {
      const selected = this.schoolsAboveFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.tenantKeyList.length;
      return isIndeterminate;
    } else if (type === 'program') {
      const selected = this.programsDesiredAboveFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.programsList.length;
      return isIndeterminate;
    } else if (type === 'trial') {
      const selected = this.trialDateSupAboveFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.trialDateList.length;
      return isIndeterminate;
    } else if (type === 'source') {
      const selected = this.sourceFilterCtrl.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.sourceFilterList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'crm') {
      if (event.checked) {
        const tenantData = this.tenantKeyList.map((el) => el._id);
        this.schoolsAboveFilter.patchValue(tenantData, { emitEvent: false });
      } else {
        this.schoolsAboveFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'program') {
      if (event.checked) {
        this.programsDesiredAboveFilter.patchValue(this.programsList, { emitEvent: false });
      } else {
        this.programsDesiredAboveFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'trial') {
      if (event.checked) {
        this.trialDateSupAboveFilter.patchValue(this.trialDateList, { emitEvent: false });
      } else {
        this.trialDateSupAboveFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'source') {
      this.isMultipleFilter = true
      if (event.checked) {
        const data = this.sourceFilterList.map(item => item.value)
        this.sourceFilterCtrl.patchValue(data, { emitEvent: false });
      } else {
        this.sourceFilterCtrl.patchValue(null, { emitEvent: false });
      }
    }
  }
  onFilterSelectMultiple(key) {
    if (this.isMultipleFilter) {
      this.isMultipleFilter = false
      let value = key === 'source_types' ? this.sourceFilterCtrl.value : null
      this.filteredValues[key] = value?.length ? value : null
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getOscarCampusData();
      }
    }
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
}
