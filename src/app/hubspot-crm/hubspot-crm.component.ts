import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
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
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { ImportOscarDialogComponent } from 'app/oscar-campus/import-oscar-dialog/import-oscar-dialog.component';
import { PermissionService } from 'app/service/permission/permission.service';
import { OscarAssignProgramDialogComponent } from 'app/shared/components/oscar-assign-program-dialog/oscar-assign-program-dialog.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'ms-hubspot-crm',
  templateUrl: './hubspot-crm.component.html',
  styleUrls: ['./hubspot-crm.component.scss'],
  providers: [ParseLocalToUtcPipe, ParseUtcToLocalPipe],
})
export class HubspotCrmComponent implements OnInit, OnDestroy, AfterViewInit {
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
  dataSelected = [];
  dataUnselect = [];
  buttonClicked = '';

  displayedColumns: string[] = [
    'select',
    'dateAdded',
    'identity',
    'telephone',
    'email',
    'scholarSeason',
    'school',
    'campus',
    'level',
    'program_desired',
    'trial_date',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'dateAddedFilter',
    'identityFilter',
    'telephoneFilter',
    'emailFilter',
    'scholarSeasonsFilter',
    'schoolFilter',
    'campusFilter',
    'levelFilter',
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

  nameFilter = new UntypedFormControl('');
  telFilter = new UntypedFormControl('');
  emailFilter = new UntypedFormControl('');
  scholarSeasonsFilter = new UntypedFormControl(null);
  schoolsFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  levelFilter = new UntypedFormControl(null);
  scholarSeasonsAboveFilter = new UntypedFormControl(null);
  schoolsAboveFilter = new UntypedFormControl(null);
  campusAboveFilter = new UntypedFormControl(null);
  levelAboveFilter = new UntypedFormControl(null);
  programsDesiredFilter = new UntypedFormControl(null);
  trialDateSupFilter = new UntypedFormControl(null);


  dateFilter = new UntypedFormControl('');

  programsFilterCtrl = new UntypedFormControl('');
  programsListFilter: Observable<any[]>;
  programsList = [];
  tenantKeyList = [];
  dataSelectedAll: any;
  previousLength = 0;
  pageSelected = [];

  trialDateCtrl = new UntypedFormControl('');
  trialDateFilter: Observable<any[]>;
  trialDateList = ['22/09/2021', '22/10/2021'];

  schoolList = [];
  campusList = [];
  levelList = [];

  filteredValues = {
    name: '',
    telephone: '',
    email: '',
    oscar_campus_tenant_key: [],
    date_added: '',
    program_desired: '',
    trial_date: '',
  };

  superFilter = {
    previous_school: null,
    previous_campus: null,
    previous_level: null,
    hubspot_scholar_seasons: null
  };

  programSelected = '';
  tenantKeySelected = '';

  sourceFilterList = [
    { value: 'All', key: 'AllM' },
    { value: 'oscar', key: 'Oscar' },
    { value: 'manual', key: 'Manual' },
    { value: 'hubspot', key: 'Hubspot' },
  ];
  sourceFilterCtrl = new UntypedFormControl('All');
  source_type = '';

  previous_school = [];
  previous_campus = [];
  previous_level = [];
  previous_scholarSeason = [];

  tableUpdateInfo;
  isPermission: any;
  currentUserTypeId: any;
  allStudentForCheckbox = [];
  dataUnselectUser = [];
  allExportForCheckbox = [];
  allAssignForCheckbox = [];
  isDropdownFilterTable = false
  filterBreadcrumbData = [];

  filteredValuesAll = {
    previous_school: 'AllM',
    previous_campus: 'AllM',
    previous_level: 'AllM',
    hubspot_scholar_seasons: 'AllM'
  };

  // it still continue development on ERP_032
  scholarSeasonList =[];

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
    this.getHubspotCampusData();
    this.getDataForList();
    this.getSchoolList();
    this.getCampusList();
    this.getLevelList();
    this.getScholarSeasonList();
    this.pageTitleService.setTitle('CRM');
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
            this.getHubspotCampusData();
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
          // console.log(ress.candidate_import);
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

  getHubspotCampusData() {
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
    
    let preScholarSeason = '';
    let preSchool = '';
    let preCampus = '';
    let preLevel = '';

    if (this.previous_scholarSeason && this.previous_scholarSeason.length) {
      preScholarSeason = JSON.stringify(this.previous_scholarSeason);
    }
    if (this.previous_school && this.previous_school.length) {
      preSchool = JSON.stringify(this.previous_school);
    }
    if (this.previous_campus && this.previous_campus.length) {
      preCampus = JSON.stringify(this.previous_campus);
    }
    if (this.previous_level && this.previous_level.length) {
      preLevel = JSON.stringify(this.previous_level);
    }

    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService
      .getAllHubspotCampus(
        pagination,
        this.sortValue,
        filter,
        this.filteredValues.oscar_campus_tenant_key,
        this.source_type,
        preSchool,
        preCampus,
        preLevel,
        userTypesList,
        preScholarSeason,
      )
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
          this.filterBreadcrumbData = [];
          this.filterBreadcrumbFormat();
          this.isWaitingForResponse = false;
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

  getSchoolList() {
    this.schoolList = [];
    this.subs.sink = this.candidatesService.GetAllSchoolCRMDropdown().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.schoolList = resp;
          this.schoolList = this.schoolList.filter((item) => item !== '').map((item) => item);
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

  // it still continue development on ERP_032
  getScholarSeasonList(){

    // it still continue development on ERP_032 comment
    this.scholarSeasonList = [];
    this.subs.sink = this.candidatesService.getAllScholarSeasonCRMDropdown().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.scholarSeasonList = resp;
          this.scholarSeasonList = this.scholarSeasonList.filter((item) => item !== '').map((item) => item);
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

  getCampusList() {
    this.campusList = [];
    this.subs.sink = this.candidatesService.GetAllCampusCRMDropdown().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.campusList = resp;
          this.campusList = this.campusList.filter((item) => item !== '').map((item) => item);
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

  getLevelList() {
    this.tenantKeyList = [];
    this.subs.sink = this.candidatesService.GetAllLevelCRMDropdown().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.levelList = resp;
          this.levelList = this.levelList.filter((item) => item !== '').map((item) => item);
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

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'name' ||
          key === 'telephone' ||
          key === 'email' ||
          // key === 'school' ||
          key === 'date_added' ||
          key === 'program_desired' ||
          key === 'trial_date' ||
          key === 'campus' ||
          key === 'level' ||
          key === 'school'
        ) {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        } else if (key !== 'oscar_campus_tenant_key') {
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
          // key === 'school' ||
          key === 'date_added' ||
          key === 'program_desired' ||
          key === 'trial_date' ||
          key === 'campus' ||
          key === 'level' ||
          key === 'school' ||
          key === 'scholarSeason'
        ) {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        } else if (key === 'oscar_campus_tenant_key') {
        } else {
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
    if (sort.active) {
      this.sortValue = sort.direction ? { [sort.active]: sort.direction } : null;
    } else {
      this.sortValue = null;
    }
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.getHubspotCampusData();
    }
  }

  // school sama campus sama level belum ditambahin disini inget ya
  initFilter() {
    this.subs.sink = this.sourceFilterCtrl.valueChanges.subscribe((statusSearch) => {
      this.source_type = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getHubspotCampusData();
      }
    });

    this.subs.sink = this.nameFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[()|{}\[\]:;<>?,+*$&#%^!\/]/g;
      const symbol1 = /\\/;
      if (!name.match(symbol) && !name.match(symbol1)) {
        if (!this.isReset) {
          if (this.nameFilter.value) {
            this.filteredValues.name = name ? name : '';
            this.paginator.pageIndex = 0;
            this.getHubspotCampusData();
          } else if (!name && this.filteredValues.name !== '') {
            this.nameFilter.setValue('');
            this.filteredValues.name = '';
            this.paginator.pageIndex = 0;
            if (!this.isReset) {
              this.getHubspotCampusData();
            }
          }
        }
      } else {
        this.nameFilter.setValue('');
        this.filteredValues.name = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getHubspotCampusData();
        }
      }
    });

    this.subs.sink = this.telFilter.valueChanges.pipe(debounceTime(400)).subscribe((tel) => {
      const symbol = /[()|{}\[\]:;<>?,+*$&#%^!\/]/g;
      const symbol1 = /\\/;
      if (!tel.match(symbol) && !tel.match(symbol1)) {
        if (!this.isReset) {
          if (this.telFilter.value) {
            this.filteredValues.telephone = tel ? tel : '';
            this.paginator.pageIndex = 0;
            this.getHubspotCampusData();
          } else if (!tel && this.filteredValues.telephone !== '') {
            this.telFilter.setValue('');
            this.filteredValues.telephone = '';
            this.paginator.pageIndex = 0;
            if (!this.isReset) {
              this.getHubspotCampusData();
            }
          }
        }
      } else {
        this.telFilter.setValue('');
        this.filteredValues.telephone = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getHubspotCampusData();
        }
      }
    });

    this.subs.sink = this.emailFilter.valueChanges.pipe(debounceTime(400)).subscribe((email) => {
      const symbol = /[()|{}\[\]:;<>?,+*$&#%^!\/]/g;
      const symbol1 = /\\/;
      if (!email.match(symbol) && !email.match(symbol1)) {
        if (!this.isReset) {
          if (this.emailFilter.value) {
            this.filteredValues.email = email ? email : '';
            this.paginator.pageIndex = 0;
            this.getHubspotCampusData();
          } else if (!email && this.filteredValues.email !== '') {
            this.emailFilter.setValue('');
            this.filteredValues.email = '';
            this.paginator.pageIndex = 0;
            if (!this.isReset) {
              this.getHubspotCampusData();
            }
          }
        }
      } else {
        this.emailFilter.setValue('');
        this.filteredValues.email = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getHubspotCampusData();
        }
      }
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((campus) => {
      this.isDropdownFilterTable = true
    });

    this.subs.sink = this.scholarSeasonsFilter.valueChanges.subscribe((scholarSeason) => {
      this.isDropdownFilterTable = true
    });

    this.subs.sink = this.schoolsFilter.valueChanges.subscribe((school) => {
      this.isDropdownFilterTable = true
    });


    this.subs.sink = this.levelFilter.valueChanges.subscribe((level) => {
      this.isDropdownFilterTable = true
    });

    this.subs.sink = this.scholarSeasonsAboveFilter.valueChanges.subscribe((scholarSeason) => {
      this.scholarSeasonsFilter.setValue(null, { emitEvent: false });
      this.superFilter.hubspot_scholar_seasons = scholarSeason;
    });

    this.subs.sink = this.schoolsAboveFilter.valueChanges.subscribe((school) => {
      this.schoolsFilter.setValue(null, { emitEvent: false });
      this.superFilter.previous_school = school;
    });

    this.subs.sink = this.campusAboveFilter.valueChanges.subscribe((campus) => {
      this.campusFilter.setValue(null, { emitEvent: false });
      this.superFilter.previous_campus = campus;
    });

    this.subs.sink = this.levelAboveFilter.valueChanges.subscribe((level) => {
      this.levelFilter.setValue(null, { emitEvent: false });
      this.superFilter.previous_level = level;
    });

    this.subs.sink = this.dateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.date_added = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getHubspotCampusData();
        }
      }
    });

    this.subs.sink = this.programsFilterCtrl.valueChanges.pipe(debounceTime(400)).subscribe((program) => {
      const symbol = /[()|{}\[\]:;<>?,+*$&#%^!\/]/g;
      const symbol1 = /\\/;
      if (!program.match(symbol) && !program.match(symbol1)) {
        if (!this.isReset) {
          if (this.programsFilterCtrl.value) {
            this.filteredValues.program_desired = program ? program : '';
            this.paginator.pageIndex = 0;
            this.getHubspotCampusData();
          } else if (!program && this.filteredValues.program_desired !== '') {
            this.programsFilterCtrl.setValue('');
            this.filteredValues.program_desired = '';
            this.paginator.pageIndex = 0;
            if (!this.isReset) {
              this.getHubspotCampusData();
            }
          }
        }
      } else {
        this.programsFilterCtrl.setValue('');
        this.filteredValues.program_desired = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getHubspotCampusData();
        }
      }
    });

    this.subs.sink = this.trialDateCtrl.valueChanges.pipe(debounceTime(400)).subscribe((trialDate) => {
      const symbol = /[()|{}\[\]:;<>?,+*$&#%^!\/]/g;
      const symbol1 = /\\/;
      if (!trialDate.match(symbol) && !trialDate.match(symbol1)) {
        if (!this.isReset) {
          if (this.trialDateCtrl.value) {
            this.filteredValues.trial_date = trialDate ? trialDate : '';
            this.paginator.pageIndex = 0;
            this.getHubspotCampusData();
          } else if (!trialDate && this.filteredValues.trial_date !== '') {
            this.trialDateCtrl.setValue('');
            this.filteredValues.trial_date = '';
            this.paginator.pageIndex = 0;
            if (!this.isReset) {
              this.getHubspotCampusData();
            }
          }
        }
      } else {
        this.trialDateCtrl.setValue('');
        this.filteredValues.trial_date = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getHubspotCampusData();
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
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
    this.allAssignForCheckbox = [];
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
  }

  setSchoolFilter() {
    if (!this.schoolsAboveFilter.value || this.schoolsAboveFilter.value.length === 0) {
      this.filteredValues['school'] = '';
      this.getHubspotCampusData();
    } else {
      this.filteredValues['school'] = this.schoolsAboveFilter.value;
      this.getHubspotCampusData();
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
    if (this.isAllSelected() || (this.isCheckedAll && this.dataUnselectUser.length)) {
      this.selection.clear();
      this.dataSelected = [];
      this.dataUnselect = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
      this.allAssignForCheckbox = [];
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.dataUnselect = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
      this.allAssignForCheckbox = [];
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
    let preScholarSeason = '';
    let preSchool = '';
    let preCampus = '';
    let preLevel = '';

    if (this.previous_scholarSeason && this.previous_scholarSeason.length) {
      preScholarSeason = JSON.stringify(this.previous_scholarSeason);
    }
    if (this.previous_school && this.previous_school.length) {
      preSchool = JSON.stringify(this.previous_school);
    }
    if (this.previous_campus && this.previous_campus.length) {
      preCampus = JSON.stringify(this.previous_campus);
    }
    if (this.previous_level && this.previous_level.length) {
      preLevel = JSON.stringify(this.previous_level);
    }
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService
      .getAllHubspotCampusCheckbox(
        pagination,
        this.sortValue,
        filter,
        this.filteredValues.oscar_campus_tenant_key,
        this.source_type,
        preSchool,
        preCampus,
        preLevel,
        userTypesList,
        preScholarSeason
      )
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
    return this.isCheckedAll ? true : numSelected === numRows || numSelected > numRows;
  }

  refetchDataKeepFilter() {
    this.clearSelectIfFilter();
    this.getHubspotCampusData();
  }

  resetFilter() {
    this.isReset = true;
    this.previous_scholarSeason = []
    this.previous_school = [];
    this.previous_campus = [];
    this.previous_level = [];
    this.source_type = 'hubspot';
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
    this.allAssignForCheckbox = [];
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.filteredValues = {
      name: '',
      telephone: '',
      email: '',
      oscar_campus_tenant_key: [],
      date_added: '',
      program_desired: '',
      trial_date: '',
    };

    this.superFilter = {
      previous_school: null,
      previous_campus: null,
      previous_level: null,
      hubspot_scholar_seasons: null
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
    this.scholarSeasonsFilter.patchValue(null, { emitEvent: false });    
    this.schoolsFilter.patchValue(null, { emitEvent: false });
    this.campusFilter.patchValue(null, { emitEvent: false });
    this.levelFilter.patchValue(null, { emitEvent: false });
    this.programsDesiredFilter.patchValue(null, { emitEvent: false });
    this.trialDateSupFilter.patchValue(null, { emitEvent: false });
    this.scholarSeasonsAboveFilter.patchValue(null, { emitEvent: false });
    this.schoolsAboveFilter.patchValue(null, { emitEvent: false });
    this.campusAboveFilter.patchValue(null, { emitEvent: false });
    this.levelAboveFilter.patchValue(null, { emitEvent: false });
    this.programsFilterCtrl.patchValue(null, { emitEvent: false });
    this.trialDateCtrl.patchValue(null, { emitEvent: false });
    this.sourceFilterCtrl.patchValue('hubspot', { emitEvent: false });

    // this.dataSource.filter = null;
    this.sortValue = null;

    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = '';
    this.sort.direction = '';
    this.sort.active = '';
    this.isDropdownFilterTable = false
    this.filterBreadcrumbData = [];
    this.getHubspotCampusData();
  }

  customFilterPredicate() {
    const myFilterPredicate = function (data, filter: string): boolean {
      const searchString = JSON.parse(filter);
      const nameFound = data.identity.toString().trim().toLowerCase().indexOf(searchString.name.toLowerCase()) !== -1;
      const telFound = data.telephone.toString().trim().toLowerCase().indexOf(searchString.tel.toLowerCase()) !== -1;
      const emailFound = data.email.toString().trim().toLowerCase().indexOf(searchString.email.toLowerCase()) !== -1;
      const schoolFound = data.school.toString().trim().toLowerCase().indexOf(searchString.school.toLowerCase()) !== -1;
      const campusFound = data.campus.toString().trim().toLowerCase().indexOf(searchString.campus.toLowerCase()) !== -1;
      const levelFound = data.email.toString().trim().toLowerCase().indexOf(searchString.level.toLowerCase()) !== -1;
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
      return nameFound && telFound && emailFound && schoolFound && campusFound && levelFound && programFound && trialFound;
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
  getAllAssignForCheckbox(pageNumber) {
    if (this.isCheckedAll) {
      if (pageNumber === 0) {
        this.allAssignForCheckbox = [];
        this.dataSelected = [];
      }
      const pagination = {
        limit: 500,
        page: pageNumber,
      };
      this.isLoading = true;
      const filter = this.cleanFilterData();
      let preSchool = '';
      let preCampus = '';
      let preLevel = '';
      let preScholarSeason = '';

      if (this.previous_scholarSeason && this.previous_scholarSeason.length) {
        preScholarSeason = JSON.stringify(this.previous_scholarSeason);
      }
      if (this.previous_school && this.previous_school.length) {
        preSchool = JSON.stringify(this.previous_school);
      }
      if (this.previous_campus && this.previous_campus.length) {
        preCampus = JSON.stringify(this.previous_campus);
      }
      if (this.previous_level && this.previous_level.length) {
        preLevel = JSON.stringify(this.previous_level);
      }
      this.subs.sink = this.candidatesService
        .getAllHubspotCampusCheckboxForAssign(
          pagination,
          this.sortValue,
          filter,
          this.filteredValues.oscar_campus_tenant_key,
          this.source_type,
          preSchool,
          preCampus,
          preLevel,
          preScholarSeason
        )
        .subscribe(
          (students: any) => {
            if (students && students.length) {
              this.allAssignForCheckbox.push(...students);
              const page = pageNumber + 1;
              this.getAllAssignForCheckbox(page);
            } else {
              this.isLoading = false;
              if (this.isCheckedAll) {
                if (this.allAssignForCheckbox && this.allAssignForCheckbox.length) {
                  this.dataSelected = this.allAssignForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  this.openAssingProgram();
                }
              }
            }
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
    } else {
      this.openAssingProgram();
    }
  }
  openAssingProgram() {
    if (!this.dataSelected.length) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      let selectType;
      let filter;
      let countDocument;
      if (this.selectType === 'one') {
        selectType = 'one';
        filter = null;
      } else {
        selectType = 'all';
        filter = _.cloneDeep(this.filteredValues);
        filter.crm_table = 'hubspot';
        if (this.source_type) {
          filter.source_type = this.source_type;
        }
        filter = this.checkFilterAboveTable(filter);
        countDocument = this.dataCount;
      }
      console.log('cek filter', filter);
      this.subs.sink = this.dialog
        .open(OscarAssignProgramDialogComponent, {
          width: '600px',
          minHeight: '100px',
          panelClass: 'certification-rule-pop-up',
          disableClose: true,
          autoFocus: false,
          restoreFocus: false,
          data: {
            candidateId: this.dataSelected,
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
            this.refetchDataKeepFilter();
          }
        });
    }
  }

  checkFilterAboveTable(filter) {
    // Filter school, campus, level above table
    if(this.scholarSeasonsAboveFilter.value){
      const scholarSeason = this.scholarSeasonsAboveFilter.value
      filter['scholarSeason'] = scholarSeason;
    }
    if (this.schoolsAboveFilter.value) {
      filter['school'] = this.schoolsAboveFilter.value;
    }
    if (this.campusAboveFilter.value) {
      filter['campus'] = this.campusAboveFilter.value;
    }
    if (this.levelAboveFilter.value) {
      filter['level'] = this.levelAboveFilter.value;
    }

    // Filter school, campus, level in table
    if(this.scholarSeasonsFilter.value){
      const scholarSeason = this.scholarSeasonsFilter.value
      filter['scholarSeason'] = scholarSeason;
    }
    if (this.schoolsFilter.value) {
      const schools = this.schoolsFilter.value;
      // schools.push(this.schoolsFilter.value);
      filter['school'] = schools;
    }
    if (this.campusFilter.value) {
      const campuses = this.campusFilter.value;
      // campuses.push(this.campusFilter.value);
      filter['campus'] = campuses;
    }
    if (this.levelFilter.value) {
      const levels = this.levelFilter.value;
      // levels.push(this.levelFilter.value);
      filter['level'] = levels;
    }

    return filter;
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
            this.clearSelectIfFilter();
            this.getHubspotCampusData();
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
            this.clearSelectIfFilter();
            this.getHubspotCampusData();
          } else {
            this.isLoading = false;
            this.clearSelectIfFilter();
            this.getHubspotCampusData();
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
        this.getHubspotCampusData();
        this.getSchoolList();
        this.getCampusList();
        this.getLevelList();
      }
    });
  }

  transformDate(data) {
    if (data) {
      // const date = moment(data, 'YYYY-MM-DDTHH:mm:ss.SSSSZ').format('DD/MM/YYYY');
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
        for (const hubspot of this.selection.selected) {
          const obj = [];
          const date = this.transformDate(hubspot.date_added);
          const candidate =
            hubspot.civility && hubspot.last_name && hubspot.first_name
              ? (hubspot.civility && hubspot.civility !== 'neutral' ? this.translate.instant(hubspot.civility) : '') +
              ' ' +
              (hubspot.last_name ? hubspot.last_name.toUpperCase() : '') +
              ' ' +
              (hubspot.first_name ? hubspot.first_name : '')
              : '-';

          obj[0] = date ? date : '-';
          obj[1] = candidate;
          obj[2] = hubspot.telephone ? hubspot.telephone : '-';
          obj[3] = hubspot.email ? hubspot.email : '-';
          obj[4] = hubspot.program_desired ? hubspot.program_desired : '-';
          obj[5] = hubspot.trial_date ? hubspot.trial_date : '-';
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
      .getAllHubspotCampus(
        pagination,
        this.sortValue,
        filter,
        this.filteredValues.oscar_campus_tenant_key,
        this.source_type,
        this.previous_school,
        this.previous_campus,
        this.previous_level,
        userTypesList,
        this.previous_scholarSeason,
      )
      .subscribe(
        (res) => {
          if (res && res.length) {
            this.allDataExport.push(...res);
            const pages = pageNumber + 1;
            // console.log(this.allDataExport);

            this.getAllExportData(pages);
          } else {
            this.isLoading = false;
            this.exportAllData(this.allDataExport);
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

  exportAllData(exportData: any) {
    const datasForExport = _.uniqBy(exportData, '_id');
    const data = [];
    if (datasForExport && datasForExport.length) {
      for (const hubspot of datasForExport) {
        const obj = [];
        const date = this.transformDate(hubspot.date_added);
        const candidate =
          hubspot.civility && hubspot.last_name && hubspot.first_name
            ? (hubspot.civility && hubspot.civility !== 'neutral' ? this.translate.instant(hubspot.civility) : '') +
            ' ' +
            (hubspot.last_name ? hubspot.last_name.toUpperCase() : '') +
            ' ' +
            (hubspot.first_name ? hubspot.first_name : '')
            : '-';

        obj[0] = date ? date : '-';
        obj[1] = candidate;
        obj[2] = hubspot.telephone ? hubspot.telephone : '-';
        obj[3] = hubspot.email ? hubspot.email : '-';
        obj[4] = hubspot.program_desired ? hubspot.program_desired : '-';
        obj[5] = hubspot.trial_date ? hubspot.trial_date : '-';
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
        const filter = this.cleanFilterData();
        let preScholarSeason = '';
        let preSchool = '';
        let preCampus = '';
        let preLevel = '';

        if (this.previous_scholarSeason && this.previous_scholarSeason.length) {
          preScholarSeason = JSON.stringify(this.previous_scholarSeason);
        }
        if (this.previous_school && this.previous_school.length) {
          preSchool = JSON.stringify(this.previous_school);
        }
        if (this.previous_campus && this.previous_campus.length) {
          preCampus = JSON.stringify(this.previous_campus);
        }
        if (this.previous_level && this.previous_level.length) {
          preLevel = JSON.stringify(this.previous_level);
        }
        this.subs.sink = this.candidatesService
          .getAllHubspotCampusCheckboxId(
            pagination,
            this.sortValue,
            filter,
            this.filteredValues.oscar_campus_tenant_key,
            this.source_type,
            preSchool,
            preCampus,
            preLevel,
            preScholarSeason
          )
          .subscribe(
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
    } else {
      this.downloadCSV();
    }
  }

  downloadCSV() {
    if (
      this.dataSelected &&
      this.dataSelected.length < 1 &&
      (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length))
    ) {
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
    const importStudentTemlate = `downloadOscarCampusData/`;
    let filter;

    let preScholarSeason = '';
    let keyScholarSeason = '';
    let preSchool = '';
    let preCampus = '';
    let preLevel = '';
    let keySchool = '';
    let keyCampus = '';
    let keyLevel = '';
    
    if(this.previous_scholarSeason && this.previous_scholarSeason.length && Array.isArray(this.previous_scholarSeason)){
      keyScholarSeason = 'hubspot_scholar_seasons';
      preScholarSeason = JSON.stringify(this.previous_scholarSeason);
    }
    if (this.previous_school && this.previous_school.length && Array.isArray(this.previous_school)) {
      keySchool = 'previous_schools';
      preSchool = JSON.stringify(this.previous_school);
    }
    if (this.previous_campus && this.previous_campus.length && Array.isArray(this.previous_campus)) {
      keyCampus = 'previous_campuses';
      preCampus = JSON.stringify(this.previous_campus);
    }
    if (this.previous_level && this.previous_level.length && Array.isArray(this.previous_level)) {
      keyLevel = 'previous_levels';
      preLevel = JSON.stringify(this.previous_level);
    }
    if (this.previous_school && this.previous_school.length && !Array.isArray(this.previous_school)) {
      keySchool = 'previous_school';
      preSchool = JSON.stringify(this.previous_school);
    }
    if (this.previous_campus && this.previous_campus.length && !Array.isArray(this.previous_campus)) {
      keyCampus = 'previous_campus';
      preCampus = JSON.stringify(this.previous_campus);
    }
    if (this.previous_level && this.previous_level.length && !Array.isArray(this.previous_level)) {
      keyLevel = 'previous_level';
      preLevel = JSON.stringify(this.previous_level);
    }
    const userTypesList =
      this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id.map((res) => `"` + res + `"`) : [];
    if (
      (this.dataSelected && this.dataSelected.length && !this.isCheckedAll) ||
      (this.dataUnselectUser && this.dataUnselectUser.length && this.isCheckedAll && this.dataSelected.length)
    ) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      filter =
        `filter={"candidate_ids":` +
        `[` +
        mappedUserId.toString() +
        `],"source_type":"` +
        this.source_type +
        `","crm_table":"hubspot"
        ${preSchool ? `,"${keySchool}":` + preSchool : ''}` +
        `${preCampus ? `,"${keyCampus}":` + preCampus : ''}` +
        `${preLevel ? `,"${keyLevel}":` + preLevel : ''}` +
        `${preScholarSeason ? `,"${keyScholarSeason}":` + preScholarSeason : ''}` +
        `
      }`;
    } else {
      filter =
        `filter={"source_type":"` +
        this.source_type +
        `","crm_table":"hubspot"
        ${preSchool ? `,"${keySchool}":` + preSchool : ''}` +
        `${preCampus ? `,"${keyCampus}":` + preCampus : ''}` +
        `${preLevel ? `,"${keyLevel}":` + preLevel : ''}` +
        `${preScholarSeason ? `,"${keyScholarSeason}":` + preScholarSeason : ''}` +
        `
      }`;
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
    // element.href = encodeURI(url + importStudentTemlate + fileType + '/' + lang + '?' + filter + '&' + search);
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
        console.log('uat 389 error', err);
      },
    );
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
        this.getHubspotCampusData();
      }
    });
  }

  applySuperFilter() {
    this.paginator.pageIndex = 0;
    // it still continue development on ERP_032
    this.previous_scholarSeason = 
      this.previous_scholarSeason && this.scholarSeasonsFilter?.value && !this.superFilter.hubspot_scholar_seasons
      ? this.scholarSeasonsFilter.value
      : this.superFilter.hubspot_scholar_seasons;
    this.previous_school =
      this.previous_school && this.schoolsFilter?.value && !this.superFilter.previous_school
        ? this.schoolsFilter.value
        : this.superFilter.previous_school;
    this.previous_campus =
      this.previous_campus && this.campusFilter?.value && !this.superFilter.previous_campus
        ? this.campusFilter.value
        : this.superFilter.previous_campus;
    this.previous_level =
      this.previous_level && this.levelFilter?.value && !this.superFilter.previous_level
        ? this.levelFilter?.value
        : this.superFilter.previous_level;
    this.getHubspotCampusData();
  }
  filterBreadcrumbFormat() {
    const previousScholarSeasonTable = this.previous_scholarSeason && (!this.scholarSeasonsAboveFilter.value || !this.scholarSeasonsAboveFilter?.value?.length) ? this.previous_scholarSeason : null;
    const previousSchoolTable =
      this.previous_school && (!this.schoolsAboveFilter.value || !this.schoolsAboveFilter?.value?.length) ? this.previous_school : null;
    const previousCampusTable =
      this.previous_campus && (!this.campusAboveFilter.value || !this.campusAboveFilter?.value?.length) ? this.previous_campus : null;
    const previousLevelTable =
      this.previous_level && (!this.levelAboveFilter.value || !this.levelAboveFilter?.value?.length) ? this.previous_level : null;

    const filterInfo: FilterBreadCrumbInput[] = [
      // Super Filter
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'hubspot_scholar_seasons', // name of the key in the object storing the filter
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Scholar_Season', // name of the column in the table or the field if super filter
        isMultiple: this.scholarSeasonsAboveFilter?.value?.length === this.scholarSeasonList?.length ? false : true, // can it support multiple selection
        filterValue: this.scholarSeasonsAboveFilter?.value?.length === this.scholarSeasonList?.length ? this.filteredValuesAll : this.superFilter, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.scholarSeasonsAboveFilter?.value?.length === this.scholarSeasonList?.length ? null : this.scholarSeasonList, // the array/list holding the dropdown options
        filterRef: this.scholarSeasonsAboveFilter, // the ref to form control binded to the filter
        isSelectionInput: this.scholarSeasonsAboveFilter?.value?.length === this.scholarSeasonList?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'previous_school', // name of the key in the object storing the filter
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.School', // name of the column in the table or the field if super filter
        isMultiple: this.schoolsAboveFilter?.value?.length === this.schoolList?.length ? false : true, // can it support multiple selection
        filterValue: this.schoolsAboveFilter?.value?.length === this.schoolList?.length ? this.filteredValuesAll : this.superFilter, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.schoolsAboveFilter?.value?.length === this.schoolList?.length ? null : this.schoolList, // the array/list holding the dropdown options
        filterRef: this.schoolsAboveFilter, // the ref to form control binded to the filter
        isSelectionInput: this.schoolsAboveFilter?.value?.length === this.schoolList?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'previous_campus', // name of the key in the object storing the filter
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus', // name of the column in the table or the field if super filter
        isMultiple: this.campusAboveFilter?.value?.length === this.campusList?.length ? false : true, // can it support multiple selection
        filterValue: this.campusAboveFilter?.value?.length === this.campusList?.length ? this.filteredValuesAll : this.superFilter, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.campusAboveFilter?.value?.length === this.campusList?.length ? null : this.campusList, // the array/list holding the dropdown options
        filterRef: this.campusAboveFilter, // the ref to form control binded to the filter
        isSelectionInput: this.campusAboveFilter?.value?.length === this.campusList?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'previous_level', // name of the key in the object storing the filter
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level', // name of the column in the table or the field if super filter
        isMultiple: this.levelAboveFilter?.value?.length === this.levelList?.length ? false : true, // can it support multiple selection
        filterValue: this.levelAboveFilter?.value?.length === this.levelList?.length ? this.filteredValuesAll : this.superFilter, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.levelAboveFilter?.value?.length === this.levelList?.length ? null : this.levelList, // the array/list holding the dropdown options
        filterRef: this.levelAboveFilter, // the ref to form control binded to the filter
        isSelectionInput: this.levelAboveFilter?.value?.length === this.levelList?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      // Table
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'date_added', // name of the key in the object storing the filter
        column: 'Date added', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.dateFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'name', // name of the key in the object storing the filter
        column: 'Student Name', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.nameFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'telephone', // name of the key in the object storing the filter
        column: 'Telephone', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.telFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'email', // name of the key in the object storing the filter
        column: 'email', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.emailFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: null, // name of the key in the object storing the filter
        column: 'Scholar_Season', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.scholarSeasonsFilter?.value?.length === this.scholarSeasonList?.length ? 'AllM' : previousScholarSeasonTable, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.scholarSeasonsFilter?.value?.length === this.scholarSeasonList?.length ? null : this.scholarSeasonList, // the array/list holding the dropdown options
        filterRef: this.scholarSeasonsFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: null, // name of the key in the object storing the filter
        column: 'School', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.schoolsFilter?.value?.length === this.schoolList?.length ? 'AllM' : previousSchoolTable, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.schoolsFilter?.value?.length === this.schoolList?.length ? null : this.schoolList, // the array/list holding the dropdown options
        filterRef: this.schoolsFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: null, // name of the key in the object storing the filter
        column: 'Campus', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.campusFilter?.value?.length === this.campusList?.length ? 'AllM' : previousCampusTable, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.campusFilter?.value?.length === this.campusList?.length ? null : this.campusList, // the array/list holding the dropdown options
        filterRef: this.campusFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: null, // name of the key in the object storing the filter
        column: 'Level', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.levelFilter?.value?.length === this.levelList?.length ? 'AllM' : previousLevelTable, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.levelFilter?.value?.length === this.levelList?.length ? null : this.levelList, // the array/list holding the dropdown options
        filterRef: this.levelFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'program_desired', // name of the key in the object storing the filter
        column: 'Program desired', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.programsFilterCtrl, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'trial_date', // name of the key in the object storing the filter
        column: 'Trial date', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.trialDateCtrl, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true,
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      if (filterItem?.type === 'table_filter' && filterItem?.column === 'Scholar_Season') {
        this.previous_scholarSeason = null;
        this.scholarSeasonsFilter.patchValue(null, { emitEvent: false });
      } else if (filterItem?.type === 'table_filter' && filterItem?.column === 'School') {
        this.previous_school = null;
        this.schoolsFilter.patchValue(null, { emitEvent: false });
      } else if (filterItem?.type === 'table_filter' && filterItem?.column === 'Campus') {
        this.previous_campus = null;
        this.campusFilter.patchValue(null, { emitEvent: false });
      } else if (filterItem?.type === 'table_filter' && filterItem?.column === 'Level') {
        this.previous_level = null;
        this.levelFilter.patchValue(null, { emitEvent: false });
      } else {
        this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.superFilter, this.filteredValues);
      }

      if (filterItem?.type === 'super_filter' && filterItem?.column === 'ADMISSION.TABLE_ADMISSION_CHANNEL.Scholar_Season'){
        this.previous_scholarSeason = null;
      } else if (filterItem?.type === 'super_filter' && filterItem?.column === 'ADMISSION.TABLE_ADMISSION_CHANNEL.School') {
        this.previous_school = null;
      } else if (filterItem?.type === 'super_filter' && filterItem?.column === 'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus') {
        this.previous_campus = null;
      } else if (filterItem?.type === 'super_filter' && filterItem?.column === 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level') {
        this.previous_level = null;
      }
      this.clearSelectIfFilter();
      this.getHubspotCampusData();
    }
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
  checkIsSelected(row) {
    return this.selection.isSelected(row._id) || (this.isCheckedAll && !this.dataUnselectUser.includes(row._id));
  }

  checkSuperFilterScholarSeason(){
    const form = this.scholarSeasonsAboveFilter.value;
    if (form && form.length) {
      this.scholarSeasonsAboveFilter.patchValue(form);
    } else {
      this.scholarSeasonsAboveFilter.patchValue(null);
    }
  }

  checkSuperFilterSchool() {
    const form = this.schoolsAboveFilter.value;
    if (form && form.length) {
      this.schoolsAboveFilter.patchValue(form);
    } else {
      this.schoolsAboveFilter.patchValue(null);
    }
  }

  checkSuperFilterCampus() {
    const form = this.campusAboveFilter.value;
    if (form && form.length) {
      this.campusAboveFilter.patchValue(form);
    } else {
      this.campusAboveFilter.patchValue(null);
    }
  }

  checkSuperFilterLevel() {
    const form = this.levelAboveFilter.value;
    if (form && form.length) {
      this.levelAboveFilter.patchValue(form);
    } else {
      this.levelAboveFilter.patchValue(null);
    }
  }

  isAllDropdownSelected(type) {
    if(type === 'scholarSeason'){
      const selected = this.scholarSeasonsAboveFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.scholarSeasonList.length;
      return isAllSelected;
    } else if (type === 'school') {
      const selected = this.schoolsAboveFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.schoolList.length;
      return isAllSelected;
    } else if (type === 'campus') {
      const selected = this.campusAboveFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.campusList.length;
      return isAllSelected;
    } else if (type === 'level') {
      const selected = this.levelAboveFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.levelList.length;
      return isAllSelected;
    } else if (type === 'scholarSeasonTable'){
      const selected = this.scholarSeasonsFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.scholarSeasonList.length;
      return isAllSelected;
    } else if (type === 'schoolTable') {
      const selected = this.schoolsFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.schoolList.length;
      return isAllSelected;
    } else if (type === 'campusTable') {
      const selected = this.campusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.campusList.length;
      return isAllSelected;
    } else if (type === 'levelTable') {
      const selected = this.levelFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.levelList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if(type === 'scholarSeason'){
      const selected = this.scholarSeasonsAboveFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.scholarSeasonList.length;
      return isIndeterminate;
    } else if (type === 'school') {
      const selected = this.schoolsAboveFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.schoolList.length;
      return isIndeterminate;
    } else if (type === 'campus') {
      const selected = this.campusAboveFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.campusList.length;
      return isIndeterminate;
    } else if (type === 'level') {
      const selected = this.levelAboveFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.levelList.length;
      return isIndeterminate;
    } else if (type === 'scholarSeasonTable'){
      const selected = this.scholarSeasonsFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.scholarSeasonList.length;
      return isIndeterminate;
    } else if (type === 'schoolTable') {
      const selected = this.schoolsFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.schoolList.length;
      return isIndeterminate;
    } else if (type === 'campusTable') {
      const selected = this.campusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.campusList.length;
      return isIndeterminate;
    } else if (type === 'levelTable') {
      const selected = this.levelFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.levelList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'scholarSeason'){
      if (event.checked) {
        this.scholarSeasonsAboveFilter.patchValue(this.scholarSeasonList, { emitEvent: false });
      } else {
        this.scholarSeasonsAboveFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'school') {
      if (event.checked) {
        this.schoolsAboveFilter.patchValue(this.schoolList, { emitEvent: false });
      } else {
        this.schoolsAboveFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'campus') {
      if (event.checked) {
        this.campusAboveFilter.patchValue(this.campusList, { emitEvent: false });
      } else {
        this.campusAboveFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'level') {
      if (event.checked) {
        this.levelAboveFilter.patchValue(this.levelList, { emitEvent: false });
      } else {
        this.levelAboveFilter.patchValue(null, { emitEvent: false });
      }
    } else if(type === 'scholarSeasonTable'){
      this.isDropdownFilterTable = true;
      if (event.checked) {
        this.scholarSeasonsFilter.patchValue(this.scholarSeasonList, { emitEvent: false });
      } else {
        this.scholarSeasonsFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'schoolTable') {
      this.isDropdownFilterTable = true
      if (event.checked) {
        this.schoolsFilter.patchValue(this.schoolList, { emitEvent: false });
      } else {
        this.schoolsFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'campusTable') {
      this.isDropdownFilterTable = true
      if (event.checked) {
        this.campusFilter.patchValue(this.campusList, { emitEvent: false });
      } else {
        this.campusFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'levelTable') {
      this.isDropdownFilterTable = true
      if (event.checked) {
        this.levelFilter.patchValue(this.levelList, { emitEvent: false });
      } else {
        this.levelFilter.patchValue(null, { emitEvent: false });
      }
    }
  }
  selectMultipleFilter(from) {
    if (this.isDropdownFilterTable) {
      this.isDropdownFilterTable = false
      if(from === 'scholarSeasonTable'){
        this.scholarSeasonsAboveFilter.setValue(null, { emitEvent: false });
        const data = this.scholarSeasonsFilter.value
        this.previous_scholarSeason = data;
      } else if (from === 'schoolTable') {
        this.schoolsAboveFilter.setValue(null, { emitEvent: false });
        const data = this.schoolsFilter.value
        this.previous_school = data;
      } else if (from === 'campusTable') {
        this.campusAboveFilter.setValue(null, { emitEvent: false });
        const data = this.campusFilter.value
        this.previous_campus = data;
      } else if (from === 'levelTable') {
        this.levelAboveFilter.setValue(null, { emitEvent: false });
        const data = this.levelFilter.value
        this.previous_level = data;
      }
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getHubspotCampusData();
      }
    }
  }
}
