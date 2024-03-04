import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
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
import { FinancesService } from 'app/service/finance/finance.service';
import { EditJuryDecisionDialogComponent } from './edit-jury-decision-dialog/edit-jury-decision-dialog.component';
import { EditProgramDesiredDialogComponent } from './edit-program-desired-dialog/edit-program-desired-dialog.component';
import { Router } from '@angular/router';
import { OscarAssignProgramDialogComponent } from 'app/shared/components/oscar-assign-program-dialog/oscar-assign-program-dialog.component';
import { MailInternshipDialogComponent } from 'app/internship-file/mail-internship-dialog/mail-internship-dialog.component';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { InternshipEmailDialogComponent } from 'app/internship-file/internship-email-dialog/internship-email-dialog.component';
import { ImportContractProcessDialogComponent } from 'app/shared/components/import-contract-process-dialog/import-contract-process-dialog.component';
import { UpdateFinancialSupportStatusDialogComponent } from 'app/re-admissions/assignment-readmission/update-financial-support-status-dialog/update-financial-support-status-dialog.component';
import { CoreService } from 'app/service/core/core.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { SendMultipleEmailComponent } from 'app/internship-file/send-multiple-email/send-multiple-email.component';

@Component({
  selector: 'ms-assignment-readmission',
  templateUrl: './assignment-readmission.component.html',
  styleUrls: ['./assignment-readmission.component.scss'],
  providers: [ParseLocalToUtcPipe, ParseUtcToLocalPipe],
})
export class AssignmentReadmissionComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();

  // Table Configuration
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  // scholarFilter = new UntypedFormControl('All');
  dataCount = 0;
  noData;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
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
  filterForm: UntypedFormGroup;
  filterBreadcrumbData: any[] = [];

  displayedColumns: string[] = [
    'select',
    'student_number',
    'name',
    'intake_channel',
    'program',
    'type_of_formation',
    'financial_situation',
    'jury_decision',
    'program_desired',
    'action',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'numberFilter',
    'nameFilter',
    'intakeChannelFilter',
    'currentProgramFilter',
    'typeFilter',
    'financeFilter',
    'juryFilter',
    'desiredFilter',
    'actionFilter',
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

  typeFilterList = [
    { value: 'classic', key: 'classic' },
    { value: 'continuous_total_funding', key: 'continuous_total_funding' },
    { value: 'continuous_partial_funding', key: 'continuous_partial_funding' },
    { value: 'continuous_personal_funding', key: 'continuous_personal_funding' },
  ];

  financeFilterList = [
    { value: 'reject_and_stop', key: 'reject_and_stop' },
    { value: 'ask_for_revision', key: 'ask_for_revision' },
    { value: 'accept', key: 'accept' },
    { value: 'not_started', key: 'not_started' },
    { value: 'need_validation', key: 'need_validation' },
    { value: 'no_financement', key: 'no_financement' },
  ];

  juryList = [
    { value: 'admitted_for_next_year', key: 'Admitted for next year' },
    { value: 'admitted_if_internship_is_validated', key: 'Admitted if internship is validated' },
    { value: 'admitted_for_retake', key: 'Admitted for retake' },
    { value: 'admitted_for_repetition', key: 'Admitted for repetition' },
    { value: 'excluded', key: 'Excluded' },
    { value: 'graduated', key: 'Graduated' },
    { value: 'waiting_for_jury', key: 'Waiting for jury' },
  ];

  currentUser;
  isDirectorAdmission = false;
  listObjective;

  shieldAccountIcon = '../../../../../assets/img/shield-account.png';
  numberFilter = new UntypedFormControl('');
  nameFilter = new UntypedFormControl('');
  intakeChannelFilter = new UntypedFormControl('');
  currentProgramFilter = new UntypedFormControl('');
  schoolsFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  levelFilter = new UntypedFormControl(null);
  sectorsFilter = new UntypedFormControl(null);
  specialitiesFilter = new UntypedFormControl(null);
  schoolsAboveFilter = new UntypedFormControl(null);
  campusAboveFilter = new UntypedFormControl(null);
  levelAboveFilter = new UntypedFormControl(null);
  programsDesiredFilter = new UntypedFormControl(null);
  typeFilter = new UntypedFormControl(null);
  financeFilter = new UntypedFormControl(null);
  juryFilter = new UntypedFormControl(null);
  newScholarFilter = new UntypedFormControl();

  dateFilter = new UntypedFormControl('');

  listTypeOfInformation: any;

  programsFilterCtrl = new UntypedFormControl('');
  programsListFilter: Observable<any[]>;
  programsList = [];
  tenantKeyList = [];
  dataSelectedAll: any;
  previousLength = 0;
  pageSelected = [];

  school = [];
  levels = [];
  scholars = [];
  originalScholar = [];
  scholarSelected = [];
  levelSelected = [];
  campusSelected = [];
  trialDateFilter: Observable<any[]>;
  trialDateList = ['22/09/2021', '22/10/2021'];

  schoolList = [];
  campusList = [];
  levelList = [];
  specilityList = [];
  sectorList = [];

  filteredValues = {
    candidate: '',
    intake_channel_name: '',
    candidate_unique_number: '',
    scholar_season: '',
    campus: '',
    level: '',
    school: '',
    sectors: null,
    specialities: null,
    jury_decision: null,
    financement: null,
    programs_desired: '',
    candidate_admission_statuses: null,
    readmission_status: 'assignment_table',
    initial_intake_channel: '',
    type_of_formation: '',
    latest_previous_program: '',
    type_of_readmission: '',
    last_reminder_date: '',
    convention: '',
    date_readmission_assigned: '',
    financial_situation: null,
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

  tableUpdateInfo;
  isPermission: any;
  currentUserTypeId: any;
  currentScholar: any;
  allStudentForCheckbox = [];

  campusListBackup = [];
  levelListBackup = [];

  schoolName = '';
  campusName = '';
  levelName = '';
  dataUnselectUser = [];
  buttonClicked = '';
  allExportForCheckbox = [];
  allFinancialForCheckbox = [];
  allJuryForCheckbox = [];
  allDesiredForCheckbox = [];
  allProgramForCheckbox = [];
  allEmailForCheckbox = [];
  updateFinancialSupportStatusDialogComponent: MatDialogRef<UpdateFinancialSupportStatusDialogComponent>;
  editJuryDecisionDialogComponent: MatDialogRef<EditJuryDecisionDialogComponent>;
  editProgramDesiredDialogComponent: MatDialogRef<EditProgramDesiredDialogComponent>;
  oscarAssignProgramDialogComponent: MatDialogRef<OscarAssignProgramDialogComponent>;
  mailInternshipDialogComponent: MatDialogRef<MailInternshipDialogComponent>;
  sendMultipleEmailComponent: MatDialogRef<SendMultipleEmailComponent>;

  superFilter = {
    scholar_season: '',
    school: '',
    campus: '',
    level: '',
    sectors: null,
    specialities: null,
  };

  isDisabled = true;
  isMultipleFilter = false;
  financeList = [];
  isFirstLoad = true;

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
    private financeService: FinancesService,
    private fb: UntypedFormBuilder,
    private router: Router,
    private intakeChannelService: IntakeChannelService,
    private coreService: CoreService,
    private httpClient: HttpClient,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService,
  ) {}

  ngOnInit() {
    this.getDataScholarSeasons();
    this.initFilter();
    this.initFilterForm();
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    // this.getAssignmentData();
    this.sortingDropdownFilter();
    this.initDropdown();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.scholars = [];
      this.scholars = this.originalScholar.sort((a, b) =>
        a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
      );
      this.scholars = _.uniqBy(this.scholars, '_id');
      this.sortingDropdownFilter();
      this.initDropdown();
      this.getAssignmentData()
    });
    this.pageTitleService.setTitle('NAV.Assignment');
  }
  initDropdown() {
    this.financeList = [
      {
        value: 'ok',
        key: 'OK',
        label: this.translate.instant('OK'),
      },
      {
        value: 'not_ok',
        key: 'NOT OK',
        label: this.translate.instant('NOT OK'),
      },
    ];
    this.juryList = this.juryList.map((filter) => {
      return {
        ...filter,
        label: this.translate.instant(filter.value),
      };
    });
  }

  sortingDropdownFilter() {
    // Sort jury list decision dropdown
    this.juryList = this.juryList.sort((a, b) =>
      this.translate.instant(a.value).toLowerCase().localeCompare(this.translate.instant(b.value).toLowerCase()),
    );

    // Sort Type of formation dropdown
    this.getAllTypeOfInformation();
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
          if (!this.isReset && !this.isFirstLoad) {
            this.getAssignmentData();
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

  initFilterForm() {
    this.filterForm = this.fb.group({
      schools: [null],
      campuses: [null],
      levels: [null],
    });
  }

  getAssignmentData() {
    this.isWaitingForResponse = true;
    this.isFirstLoad = false;
    this.dataSource.data = [];
    this.paginator.length = 0;
    this.dataCount = 0;

    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    // const filter = {
    //   readmission_status: 'assignment_table'
    // };
    const filter = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService.getAllAssignment(pagination, this.sortValue, filter, null, userTypesList).subscribe(
      (students: any) => {
        console.log(students);
        if (students && students.length) {
          const student = _.cloneDeep(students);
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

  getDataForList(data?) {
    const name = data ? data : '';
    const filter = 'filter: { scholar_season_id:' + `"${name}"` + '}';
    this.subs.sink = this.candidatesService.GetAllSchoolFilter(name, filter, this.currentUserTypeId).subscribe(
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
            this.school = this.listObjective;
            this.school = this.school.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0));
          } else {
            this.listObjective = resp;
            this.school = this.listObjective;
            this.school = this.school.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0));
          }
          this.getDataCampus();
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

  getDataScholarSeasons() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        // console.log(resp);
        if (resp && resp.length) {
          this.originalScholar = _.cloneDeep(resp);
          this.scholars = [];
          this.scholars = this.originalScholar.sort((a, b) =>
            a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
          );
          // this.scholars.unshift({ _id: 'All', scholar_season: this.translate.instant('All') });
          this.scholars = _.uniqBy(this.scholars, '_id');
          let currentYear = new Date().getFullYear().toString().substring(2);
          currentYear = currentYear.replace(currentYear, '-' + currentYear);
          this.currentScholar = this.scholars.find((scholarSeasons) => scholarSeasons.scholar_season.includes(currentYear));
          this.newScholarFilter.patchValue(this.currentScholar._id, { emitEvent: false });
          this.filteredValues.scholar_season = this.newScholarFilter.value;
          this.superFilter.scholar_season = this.newScholarFilter.value;
          const scholarSeason = this.newScholarFilter.value ? this.newScholarFilter.value : '';
          this.getDataForList(scholarSeason);
          this.getAssignmentData();
        } else {
          const scholarSeason = this.newScholarFilter.value ? this.newScholarFilter.value : '';
          this.getDataForList(scholarSeason);
          this.isWaitingForResponse = false;
        }
        this.isFirstLoad = false;
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        this.isFirstLoad = false;
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

  newScholarSelect() {
    this.levels = [];
    this.campusList = [];
    this.sectorList = [];
    this.specilityList = [];
    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.sectorsFilter.value) {
      this.sectorsFilter.setValue(null);
    }
    if (this.specialitiesFilter.value) {
      this.specialitiesFilter.setValue(null);
    }

    this.superFilter.scholar_season = this.newScholarFilter.value ? this.newScholarFilter.value : null;
    this.scholarSelected = this.newScholarFilter.value ? this.newScholarFilter.value : null;
    const scholarSeason = this.newScholarFilter.value ? this.newScholarFilter.value : '';
    this.getDataForList(scholarSeason);
  }

  checkSuperFilterSchool() {
    const form = this.schoolsFilter.value;
    if (form && form.length) {
      this.schoolsFilter.patchValue(form);
    } else {
      this.schoolsFilter.patchValue(null);
    }
    this.getDataCampus();
  }
  checkSuperFilterCampus() {
    const form = this.campusFilter.value;
    if (form && form.length) {
      this.campusFilter.patchValue(form);
    } else {
      this.campusFilter.patchValue(null);
    }
    this.getDataLevel();
  }
  checkSuperFilterLevel() {
    const form = this.levelFilter.value;
    if (form && form.length) {
      this.levelFilter.patchValue(form);
    } else {
      this.levelFilter.patchValue(null);
    }
    this.getDataByLevel();
  }
  checkSuperFilterSector() {
    const form = this.sectorsFilter.value;
    if (form && form.length) {
      this.sectorsFilter.patchValue(form);
    } else {
      this.sectorsFilter.patchValue(null);
    }
    this.getDataSpecialityBySector();
  }
  checkSuperFilterSpecialities() {
    const form = this.specialitiesFilter.value;
    if (form && form.length) {
      this.specialitiesFilter.patchValue(form);
    } else {
      this.specialitiesFilter.patchValue(null);
    }
  }

  getDataCampus() {
    this.schoolName = '';
    this.levels = [];
    this.campusList = [];
    this.sectorList = [];
    this.specilityList = [];
    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.sectorsFilter.value) {
      this.sectorsFilter.setValue(null);
    }
    if (this.specialitiesFilter.value) {
      this.specialitiesFilter.setValue(null);
    }

    const school = this.schoolsFilter.value;

    if (
      this.currentUser &&
      this.currentUser.entities &&
      this.currentUser.entities.length &&
      this.currentUser.app_data &&
      this.currentUser.app_data.school_package &&
      this.currentUser.app_data.school_package.length &&
      this.schoolsFilter.value &&
      this.schoolsFilter.value.length
    ) {
      if (school && !school.includes('All')) {
        school.forEach((element) => {
          const sName = this.school.find((list) => list._id === element);
          this.schoolName = this.schoolName ? this.schoolName + ',' + sName.short_name : sName.short_name;
        });
      }
      this.currentUser.app_data.school_package.forEach((element) => {
        if (element && element.school && element.school._id && (school.includes(element.school._id) || school.includes('All'))) {
          this.campusList = _.concat(this.campusList, element.school.campuses);
        }
      });
    } else {
      if (school && !school.includes('All')) {
        school.forEach((element) => {
          const sName = this.school.find((list) => list._id === element);
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
      } else if (school && school.includes('All') && this.listObjective && this.listObjective.length) {
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
    }

    this.getDataLevel();
    this.campusList = _.uniqBy(this.campusList, 'name');
    this.campusList = this.campusList.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }

  getDataLevel() {
    this.levels = [];
    this.sectorList = [];
    this.specilityList = [];
    this.campusName = '';
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.sectorsFilter.value) {
      this.sectorsFilter.setValue(null);
    }
    if (this.specialitiesFilter.value) {
      this.specialitiesFilter.setValue(null);
    }
    this.campusSelected = [];
    const schools = this.schoolsFilter.value;
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
      if (sCampus && sCampus.length && !sCampus.includes('All')) {
        this.currentUser.app_data.school_package.forEach((element) => {
          if (element && element.school && element.school._id && (schools.includes(element.school._id) || schools.includes('All'))) {
            const sLevelList = this.campusList.filter((list) => {
              return sCampus.includes(list.name);
            });

            sLevelList.forEach((lev) => {
              if (lev && lev.levels && lev.levels.length) {
                this.levels = _.concat(this.levels, lev.levels);
              }
            });
          }
        });
      } else if (sCampus && sCampus.includes('All') && this.campusList && this.campusList.length) {
        this.campusList.forEach((lev) => {
          if (lev && lev.levels && lev.levels.length) {
            this.levels = _.concat(this.levels, lev.levels);
          }
        });
      }
    } else {
      if (schools && sCampus && !sCampus.includes('All')) {
        sCampus.forEach((element) => {
          const sName = this.campusList.find((list) => list.name === element);
          this.campusSelected.push(sName._id);
          this.campusName = this.campusName ? this.campusName + ',' + sName.name : sName.name;
        });
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
      } else if (sCampus && sCampus.includes('All')) {
        this.campusList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
            });
          }
        });
      } else {
        this.levels = [];
        this.sectorList = [];
        this.specilityList = [];
      }
    }
    this.levels = _.uniqBy(this.levels, 'name');
    this.levels = this.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }

  getDataByLevel() {
    this.levels = _.uniqBy(this.levels, 'name');
    this.levels = this.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
    this.levelName = '';
    this.levelSelected = [];
    if (this.levelFilter.value && !this.levelFilter.value.includes('All')) {
      const sLevel = this.levelFilter.value;

      sLevel.forEach((element) => {
        const sName = this.levels.find((list) => list.name === element);
        this.levelSelected.push(sName._id);
        console.log(sName);
        this.levelName = this.levelName ? this.levelName + ',' + sName.name : sName.name;
      });
    }
    this.getDataSectorByLevel();
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    let schoolsMap;
    let levelsMap;
    let campusesMap;
    let specialitiesMap;
    let sectorsMap;
    let dataMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'candidate' ||
          key === 'intake_channel_name' ||
          key === 'candidate_unique_number' ||
          key === 'scholar_season' ||
          key === 'initial_intake_channel' ||
          key === 'type_of_formation' ||
          key === 'latest_previous_program' ||
          key === 'type_of_readmission' ||
          key === 'last_reminder_date' ||
          key === 'convention' ||
          key === 'date_readmission_assigned'
        ) {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        } else if (key === 'candidate_admission_statuses' || key === 'financial_situations' || key === 'jury_decisions') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'school') {
          schoolsMap = filterData.school.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` schools:[${schoolsMap}]`;
        } else if (key === 'level') {
          levelsMap = filterData.level.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` candidate_levels:[${levelsMap}]`;
        } else if (key === 'campus') {
          campusesMap = filterData.campus.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` candidate_campuses:[${campusesMap}]`;
        } else if (key === 'sectors') {
          sectorsMap = filterData.sectors.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` sectors:[${sectorsMap}]`;
        } else if (key === 'specialities') {
          specialitiesMap = filterData.specialities.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` specialities:[${specialitiesMap}]`;
        } else if (key === 'programs_desired') {
          filterQuery = filterQuery + ` programs_desired:["${filterData[key]}"]`;
        } else if (key === 'type_of_formations') {
          dataMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` ${key}:[${dataMap}]`;
        } else {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        }
      }
    });
    if (this.isDirectorAdmission && !this.filteredValues.school) {
      if (this.currentUser && this.currentUser.entities) {
        this.schoolsFilter.setValue(this.currentUser.entities[0].candidate_school);
        filterQuery = filterQuery + ` school: "${this.currentUser.entities[0].candidate_school}"`;
      }
    }
    console.log(filterQuery);
    return 'filter: {' + filterQuery + '}';
  }

  cleanFilterDataEditJury() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    let schoolsMap;
    let levelsMap;
    let campusesMap;
    let specialitiesMap;
    let sectorsMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'candidate' ||
          key === 'intake_channel_name' ||
          key === 'candidate_unique_number' ||
          key === 'scholar_season' ||
          key === 'initial_intake_channel' ||
          key === 'type_of_formation' ||
          key === 'latest_previous_program' ||
          key === 'type_of_readmission' ||
          key === 'last_reminder_date' ||
          key === 'convention' ||
          key === 'date_readmission_assigned'
        ) {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        } else if (key === 'candidate_admission_statuses') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'school') {
          schoolsMap = filterData.school.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` schools:[${schoolsMap}]`;
        } else if (key === 'level') {
          levelsMap = filterData.level.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` candidate_levels:[${levelsMap}]`;
        } else if (key === 'campus') {
          campusesMap = filterData.campus.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` candidate_campuses:[${campusesMap}]`;
        } else if (key === 'sectors') {
          sectorsMap = filterData.sectors.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` sectors:[${sectorsMap}]`;
        } else if (key === 'specialities') {
          specialitiesMap = filterData.specialities.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` specialities:[${specialitiesMap}]`;
        } else if (key === 'programs_desired') {
          filterQuery = filterQuery + ` programs_desired:["${filterData[key]}"]`;
        } else if (key === 'readmission_status') {
        } else {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        }
      }
    });
    if (this.isDirectorAdmission && !this.filteredValues.school) {
      if (this.currentUser && this.currentUser.entities) {
        this.schoolsFilter.setValue(this.currentUser.entities[0].candidate_school);
        filterQuery = filterQuery + ` school: "${this.currentUser.entities[0].candidate_school}"`;
      }
    }
    console.log(filterQuery);
    return 'filter: {' + filterQuery + '}';
  }

  cleanFilterDataExport() {
    const filterData = _.cloneDeep(this.filteredValues);
    let schoolsMap;
    let levelsMap;
    let campusesMap;
    let sectorsMap;
    let specialitiesMap;
    let filterQuery = '';
    let dataMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'candidate' ||
          key === 'intake_channel_name' ||
          key === 'candidate_unique_number' ||
          key === 'scholar_season' ||
          key === 'jury_decision' ||
          key === 'financement' ||
          key === 'program_desired' ||
          key === 'initial_intake_channel' ||
          key === 'type_of_formation' ||
          key === 'latest_previous_program' ||
          key === 'type_of_readmission' ||
          key === 'last_reminder_date' ||
          key === 'convention' ||
          key === 'date_readmission_assigned' ||
          key === 'financial_situation'
        ) {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        } else if (
          key === 'candidate_admission_statuses' ||
          key === 'type_of_formations' ||
          key === 'financial_situations' ||
          key === 'jury_decisions'
        ) {
          dataMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${dataMap}]` : filterQuery + `"${key}":[${dataMap}]`;
        } else if (key === 'candidate_admission_statuses') {
          filterQuery = filterQuery
            ? filterQuery + ',' + `"${key}":["${filterData[key]}"]`
            : filterQuery + `"${key}":["${filterData[key]}"]`;
        } else if (key === 'school') {
          schoolsMap = filterData.school.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ',' + `"schools":[${schoolsMap}]`;
        } else if (key === 'level') {
          levelsMap = filterData.level.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ',' + `"candidate_levels":[${levelsMap}]`;
        } else if (key === 'sectors') {
          sectorsMap = filterData.sectors.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ',' + `"sectors":[${sectorsMap}]`;
        } else if (key === 'specialities') {
          specialitiesMap = filterData.specialities.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ',' + `"specialities":[${specialitiesMap}]`;
        } else if (key === 'campus') {
          campusesMap = filterData.campus.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ',' + `"candidate_campuses":[${campusesMap}]`;
        } else if (key === 'readmission_status') {
        } else {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${filterData[key]}` : filterQuery + `"${key}":${filterData[key]}`;
        }
      }
    });
    return 'filter={' + filterQuery + '}';
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAssignmentData();
      }
    }
  }

  // school sama campus sama level belum ditambahin disini inget ya
  initFilter() {
    this.subs.sink = this.nameFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!name.match(symbol) && !name.match(symbol1)) {
        if (!this.isReset) {
          if (this.nameFilter.value) {
            this.filteredValues.candidate = name ? name : '';
            this.paginator.pageIndex = 0;
            this.getAssignmentData();
          } else if (!name && this.filteredValues.candidate !== '') {
            this.nameFilter.setValue('');
            this.filteredValues.candidate = '';
            this.paginator.pageIndex = 0;
            if (!this.isReset) {
              this.getAssignmentData();
            }
          }
        }
      } else {
        this.nameFilter.setValue('');
        this.filteredValues.candidate = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAssignmentData();
        }
      }
    });

    this.subs.sink = this.numberFilter.valueChanges.pipe(debounceTime(400)).subscribe((tel) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!tel.match(symbol) && !tel.match(symbol1)) {
        if (!this.isReset) {
          if (this.numberFilter.value) {
            this.filteredValues.candidate_unique_number = tel ? tel : '';
            this.paginator.pageIndex = 0;
            this.getAssignmentData();
          } else if (!tel && this.filteredValues.candidate_unique_number !== '') {
            this.numberFilter.setValue('');
            this.filteredValues.candidate_unique_number = '';
            this.paginator.pageIndex = 0;
            if (!this.isReset) {
              this.getAssignmentData();
            }
          }
        }
      } else {
        this.numberFilter.setValue('');
        this.filteredValues.candidate_unique_number = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAssignmentData();
        }
      }
    });

    this.subs.sink = this.intakeChannelFilter.valueChanges.pipe(debounceTime(400)).subscribe((email) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!email.match(symbol) && !email.match(symbol1)) {
        if (!this.isReset) {
          if (this.intakeChannelFilter.value) {
            this.filteredValues.initial_intake_channel = email ? email : '';
            this.paginator.pageIndex = 0;
            this.getAssignmentData();
          } else if (!email && this.filteredValues.initial_intake_channel !== '') {
            this.intakeChannelFilter.setValue('');
            this.filteredValues.initial_intake_channel = '';
            this.paginator.pageIndex = 0;
            if (!this.isReset) {
              this.getAssignmentData();
            }
          }
        }
      } else {
        this.intakeChannelFilter.setValue('');
        this.filteredValues.initial_intake_channel = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAssignmentData();
        }
      }
    });

    this.subs.sink = this.typeFilter.valueChanges.subscribe((statusSearch) => {
      this.isMultipleFilter = true;
    });

    this.subs.sink = this.financeFilter.valueChanges.subscribe((statusSearch) => {
      this.isMultipleFilter = true;
    });

    this.subs.sink = this.juryFilter.valueChanges.subscribe((statusSearch) => {
      this.isMultipleFilter = true;
    });

    // filter above table
    this.subs.sink = this.newScholarFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.scholar_season = statusSearch ? statusSearch : '';
      this.superFilter.scholar_season = statusSearch ? statusSearch : null;
      if (this.schoolsFilter.value) {
        this.schoolsFilter.setValue(null);
      }
      const scholarSeason = statusSearch ? statusSearch : '';
      this.getDataForList(scholarSeason);
      if (!this.isReset) {
        this.getAssignmentData();
      }
    });

    this.subs.sink = this.schoolsFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.level = '';
      this.superFilter.campus = '';
      this.superFilter.school = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.level = '';
      this.superFilter.campus = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    this.subs.sink = this.levelFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.level = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    this.subs.sink = this.sectorsFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.sectors = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    this.subs.sink = this.specialitiesFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.specialities = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });
    // end superfilter

    this.subs.sink = this.campusAboveFilter.valueChanges.subscribe((campus) => {
      this.campusFilter.setValue(null);
      this.filteredValues.campus = campus;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAssignmentData();
      }
    });

    this.subs.sink = this.schoolsAboveFilter.valueChanges.subscribe((school) => {
      this.schoolsFilter.setValue(null);
      this.previous_school = school;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAssignmentData();
      }
    });

    this.subs.sink = this.levelAboveFilter.valueChanges.subscribe((level) => {
      this.levelFilter.setValue(null);
      this.previous_level = level;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAssignmentData();
      }
    });

    this.subs.sink = this.programsDesiredFilter.valueChanges.pipe(debounceTime(400)).subscribe((program) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!program.match(symbol) && !program.match(symbol1)) {
        if (!this.isReset) {
          if (this.programsDesiredFilter.value) {
            this.filteredValues.programs_desired = program ? program : '';
            this.paginator.pageIndex = 0;
            this.getAssignmentData();
          } else if (!program && this.filteredValues.programs_desired !== '') {
            this.programsDesiredFilter.setValue('');
            this.filteredValues.programs_desired = '';
            this.paginator.pageIndex = 0;
            if (!this.isReset) {
              this.getAssignmentData();
            }
          }
        }
      } else {
        this.programsDesiredFilter.setValue('');
        this.filteredValues.programs_desired = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAssignmentData();
        }
      }
    });

    this.subs.sink = this.currentProgramFilter.valueChanges.pipe(debounceTime(400)).subscribe((trialDate) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!trialDate.match(symbol) && !trialDate.match(symbol1)) {
        if (!this.isReset) {
          if (this.currentProgramFilter.value) {
            this.filteredValues.intake_channel_name = trialDate ? trialDate : '';
            this.paginator.pageIndex = 0;
            this.getAssignmentData();
          } else if (!trialDate && this.filteredValues.intake_channel_name !== '') {
            this.currentProgramFilter.setValue('');
            this.filteredValues.intake_channel_name = '';
            this.paginator.pageIndex = 0;
            if (!this.isReset) {
              this.getAssignmentData();
            }
          }
        }
      } else {
        this.currentProgramFilter.setValue('');
        this.filteredValues.intake_channel_name = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAssignmentData();
        }
      }
    });
  }

  clearSelectIfFilter() {
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
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
    console.log('this.selection', this.selection);
    this.selectType = info;
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
      this.isCheckedAll = false;
      this.dataUnselectUser = [];
      this.allStudentForCheckbox = [];
      this.allEmailForCheckbox = [];
      this.allExportForCheckbox = [];
      this.allFinancialForCheckbox = [];
      this.allJuryForCheckbox = [];
      this.allProgramForCheckbox = [];
      this.allDesiredForCheckbox = [];
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.isCheckedAll = true;
      this.dataUnselectUser = [];
      this.allStudentForCheckbox = [];
      this.allEmailForCheckbox = [];
      this.allExportForCheckbox = [];
      this.allFinancialForCheckbox = [];
      this.allJuryForCheckbox = [];
      this.allProgramForCheckbox = [];
      this.allDesiredForCheckbox = [];
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
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService.getAllAssignmentCheckbox(filter, this.sortValue, pagination, userTypesList).subscribe(
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
                this.dataSelected.push(element);
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
    return this.isCheckedAll ? true : numSelected === numRows;
  }

  refetchDataKeepFilter() {
    this.clearSelectIfFilter();
    this.getAssignmentData();
  }

  resetFilter() {
    this.isReset = true;
    this.isMultipleFilter = false;
    this.selection.clear();
    this.dataSelected = [];
    this.dataUnselectUser = [];
    this.isCheckedAll = false;
    this.allExportForCheckbox = [];
    this.allEmailForCheckbox = [];
    this.allFinancialForCheckbox = [];
    this.allJuryForCheckbox = [];
    this.allProgramForCheckbox = [];
    this.allDesiredForCheckbox = [];
    this.filterBreadcrumbData = [];
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.filteredValues = {
      candidate: '',
      intake_channel_name: '',
      candidate_unique_number: '',
      scholar_season: this.currentScholar?._id,
      campus: '',
      level: '',
      school: '',
      sectors: '',
      specialities: '',
      jury_decision: null,
      financement: null,
      programs_desired: '',
      candidate_admission_statuses: null,
      readmission_status: 'assignment_table',
      initial_intake_channel: '',
      type_of_formation: '',
      latest_previous_program: '',
      type_of_readmission: '',
      last_reminder_date: '',
      convention: '',
      date_readmission_assigned: '',
      financial_situation: null,
    };
    this.superFilter = {
      scholar_season: this.currentScholar?._id,
      school: '',
      campus: '',
      level: '',
      sectors: null,
      specialities: null,
    };

    this.numberFilter.patchValue(null, { emitEvent: false });
    this.nameFilter.patchValue(null, { emitEvent: false });
    this.intakeChannelFilter.patchValue(null, { emitEvent: false });
    this.currentProgramFilter.patchValue(null, { emitEvent: false });
    this.programsDesiredFilter.patchValue(null, { emitEvent: false });
    this.typeFilter.patchValue(null, { emitEvent: false });
    this.financeFilter.patchValue(null, { emitEvent: false });
    this.juryFilter.patchValue(null, { emitEvent: false });
    this.campusFilter.patchValue(null);
    this.levelFilter.patchValue(null);
    this.sectorsFilter.patchValue(null);
    this.specialitiesFilter.patchValue(null);
    this.schoolsFilter.patchValue(null);
    // this.scholarFilter.patchValue('All');
    this.newScholarFilter.patchValue(this.currentScholar?._id, { emitEvent: false });
    this.programsFilterCtrl.patchValue(null, { emitEvent: false });

    // this.dataSource.filter = null;
    this.sortValue = null;

    this.selectType = '';
    this.sort.direction = '';
    this.sort.active = '';
    this.isDisabled = true;
    this.getAssignmentData();

    const scholarSeason = this.newScholarFilter.value ? this.newScholarFilter.value : '';
    this.getDataForList(scholarSeason);
  }

  customFilterPredicate() {
    const myFilterPredicate = function (data, filter: string): boolean {
      console.log('_ini filter', filter);

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

  openAssingProgram(type, data?) {
    if (type === 'above') {
      if (this.dataSelected.length < 1) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Followup_S8.Title'),
          html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
          confirmButtonText: this.translate.instant('Followup_S8.Button'),
        });
      } else {
        const isNoJuryDecision = this.dataSelected.some(
          (x) => x.jury_decision === '' || x.jury_decision === null || x.financial_situation === '' || x.financial_situation === null,
        );
        if (isNoJuryDecision) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('ReAdmission_S1.Title'),
            text: this.translate.instant('ReAdmission_S1.Text'),
            confirmButtonText: this.translate.instant('ReAdmission_S1.Button'),
            showCancelButton: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          });
        } else {
          let selectType;
          let filter;
          let countDocument;
          if (this.selectType === 'one') {
            selectType = 'one';
            filter = null;
            console.log('candidatesId', this.dataSelected);
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
          const fsRed = this.dataSelected.filter((element) => element.financial_situation === 'not_ok');
          if (fsRed?.length) {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('ReAdmission_S9.TITLE'),
              text: this.translate.instant('ReAdmission_S9.TEXT'),
              confirmButtonText: this.translate.instant('ReAdmission_S9.BUTTON1'),
              cancelButtonText: this.translate.instant('ReAdmission_S9.BUTTON2'),
              showCancelButton: true,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((confirm) => {
              if (confirm?.value) {
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
                      from: 'readmission',
                    },
                  })
                  .afterClosed()
                  .subscribe((result) => {
                    if (result) {
                      this.disabledExport = true;
                      this.disabledAssign = true;
                      this.refetchDataKeepFilter();
                    }
                  });
              }
            });
          } else {
            this.oscarAssignProgramDialogComponent = this.dialog.open(OscarAssignProgramDialogComponent, {
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
                from: 'readmission',
              },
            });
            this.subs.sink = this.oscarAssignProgramDialogComponent.afterClosed().subscribe((result) => {
              if (result) {
                this.disabledExport = true;
                this.disabledAssign = true;
                this.refetchDataKeepFilter();
              }
              this.oscarAssignProgramDialogComponent = null;
            });
          }
        }
      }
    } else {
      if (!data.jury_decision || !data.financial_situation) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('ReAdmission_S1.Title'),
          text: this.translate.instant('ReAdmission_S1.Text'),
          confirmButtonText: this.translate.instant('ReAdmission_S1.Button'),
          showCancelButton: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        });
      } else {
        const candidatesId = [];
        candidatesId.push(data);
        if (data?.financial_situation === 'not_ok') {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('ReAdmission_S9.TITLE'),
            text: this.translate.instant('ReAdmission_S9.TEXT'),
            confirmButtonText: this.translate.instant('ReAdmission_S9.BUTTON1'),
            cancelButtonText: this.translate.instant('ReAdmission_S9.BUTTON2'),
            showCancelButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then((confirm) => {
            if (confirm?.value) {
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
                    from: 'readmission',
                  },
                })
                .afterClosed()
                .subscribe((result) => {
                  if (result) {
                    this.disabledExport = true;
                    this.disabledAssign = true;
                    this.refetchDataKeepFilter();
                  }
                });
            }
          });
        } else {
          this.oscarAssignProgramDialogComponent = this.dialog.open(OscarAssignProgramDialogComponent, {
            width: '600px',
            minHeight: '100px',
            panelClass: 'certification-rule-pop-up',
            disableClose: true,
            autoFocus: false,
            restoreFocus: false,
            data: {
              candidateId: candidatesId,
              from: 'readmission',
            },
          });
          this.subs.sink = this.oscarAssignProgramDialogComponent.afterClosed().subscribe((result) => {
            if (result) {
              this.disabledExport = true;
              this.disabledAssign = true;
              this.refetchDataKeepFilter();
            }
            this.oscarAssignProgramDialogComponent = null;
          });
        }
      }
    }
  }

  getAllTypeOfInformation() {
    this.subs.sink = this.intakeChannelService.getAllTypeOfInformationDropdown().subscribe(
      (res) => {
        if (res) {
          this.listTypeOfInformation = res.map((item) => {
            return {
              ...item,
              label: this.translate.instant('type_formation.' + item.type_of_formation),
            };
          });
          this.listTypeOfInformation = this.listTypeOfInformation.sort((a, b) =>
            this.translate
              .instant('type_formation.' + a.type_of_formation)
              .toLowerCase()
              .localeCompare(this.translate.instant('type_formation.' + b.type_of_formation).toLowerCase()),
          );
        }
      },
      (error) => {
        this.authService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  checkFilterAboveTable(filter) {
    // Filter school, campus, level above table

    if (this.schoolsAboveFilter.value) {
      filter['schools'] = this.schoolsAboveFilter.value;
    }
    if (this.campusAboveFilter.value) {
      filter['campuses'] = this.campusAboveFilter.value;
    }
    if (this.levelAboveFilter.value) {
      filter['levels'] = this.levelAboveFilter.value;
    }

    // Filter school, campus, level in table

    if (this.schoolsFilter.value) {
      const schools = [];
      schools.push(this.schoolsFilter.value);
      filter['schools'] = schools;
    }
    if (this.campusFilter.value) {
      const campuses = [];
      campuses.push(this.campusFilter.value);
      filter['campuses'] = campuses;
    }
    if (this.levelFilter.value) {
      const levels = [];
      levels.push(this.levelFilter.value);
      filter['levels'] = levels;
    }
    if (this.sectorsFilter.value) {
      let sectors = [];
      sectors = this.sectorsFilter.value;
      filter['sectors'] = sectors;
    }
    if (this.specialitiesFilter.value) {
      let specialities = [];
      specialities = this.specialitiesFilter.value;
      filter['specialities'] = specialities;
    }

    return filter;
  }

  refetchCandidateData() {
    this.isLoading = true;
    this.subs.sink = this.candidatesService.getLatestCandidateOscarTable().subscribe(
      (resp) => {
        console.log(resp);
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
        console.log(resp);
        if (resp) {
          if (resp === 'Candidate import from HubSpot is in progress') {
            this.clearSelectIfFilter();
            this.getAssignmentData();
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
        console.log(err);
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
            this.clearSelectIfFilter();
            this.getAssignmentData();
          } else {
            this.isLoading = false;
            this.clearSelectIfFilter();
            this.getAssignmentData();
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
        this.getAssignmentData();
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
      if (this.dataSelected.length) {
        console.log('selection', this.dataSelected);
        for (const hubspot of this.dataSelected) {
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
        console.log('data', data);
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
      // this.getAllExportData(0);
    }
  }

  // getAllExportData(pageNumber: number) {
  //   this.isLoading = true;
  //   const pagination = {
  //     limit: 500,
  //     page: pageNumber,
  //   };
  //   const filter = this.cleanFilterData();
  //   this.subs.sink = this.candidatesService
  //     .getAllHubspotCampus(
  //       pagination,
  //       this.sortValue,
  //       filter,
  //       this.filteredValues.oscar_campus_tenant_key,
  //       this.source_type,
  //       this.previous_school,
  //       this.previous_campus,
  //       this.previous_level,
  //     )
  //     .subscribe(
  //       (res) => {
  //         if (res && res.length) {
  //           this.allDataExport.push(...res);
  //           const pages = pageNumber + 1;
  //           // console.log(this.allDataExport);

  //           this.getAllExportData(pages);
  //         } else {
  //           this.isLoading = false;
  //           this.exportAllData(this.allDataExport);
  //         }
  //       },
  //       (err) => {
  //         if (
  //           err && err['message'] && (err['message'].includes('jwt expired') ||
  //           err['message'].includes('str & salt required') ||
  //           err['message'].includes('Authorization header is missing') ||
  //           err['message'].includes('salt'))
  //         ) {
  //           this.authService.handlerSessionExpired();
  //           return;
  //         }
  //         Swal.fire({
  //           type: 'info',
  //           title: this.translate.instant('SORRY'),
  //           text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
  //           confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
  //         });
  //       },
  //     );
  // }

  exportAllData(exportData: any) {
    const datasForExport = _.uniqBy(exportData, '_id');
    const data = [];
    if (datasForExport && datasForExport.length) {
      console.log('selection', datasForExport);
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
      console.log('data', data);
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
    if (
      this.dataSelected &&
      this.dataSelected.length < 1 &&
      (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser.length > 1))
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
    const filter = this.cleanFilterDataExport();
    let filtered;
    if ((this.dataSelected.length && !this.isCheckedAll) || (this.dataUnselectUser && this.dataUnselectUser.length)) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      const billing = `"candidate_ids":` + '[' + mappedUserId.toString() + ']';
      if (filter.length > 9) {
        filtered = filter.slice(0, 8) + '"readmission_status":"assignment_table"' + ',' + billing + ',' + filter.slice(8);
      } else {
        filtered = filter.slice(0, 8) + '"readmission_status":"assignment_table"' + ',' + billing + filter.slice(8);
      }
    } else if (this.isCheckedAll) {
      if (filter.slice(8) === '}') {
        filtered = filter.slice(0, 8) + '"readmission_status":"assignment_table"' + filter.slice(8);
      } else {
        filtered = filter.slice(0, 8) + '"readmission_status":"assignment_table",' + filter.slice(8);
      }
    }
    console.log(filtered);
    const userTypesList =
      this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id.map((res) => `"` + res + `"`) : [];
    const importStudentTemlate = `downloadAssignmentTableCSV/`;
    const sorting = this.sortingForExport();
    let fullURL;
    fullURL =
      url +
      importStudentTemlate +
      fileType +
      '/' +
      lang +
      '/' +
      this.currentUser._id +
      '/' +
      this.currentUserTypeId +
      '?' +
      filtered +
      '&' +
      sorting +
      '&user_type_ids=[' +
      userTypesList +
      ']';
    console.log('fullURL', fullURL);
    // element.href = encodeURI(fullURL);
    // console.log(element.href);
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
      }),
    };

    this.isLoading = true;
    this.httpClient.get(`${encodeURI(fullURL)}`, httpOptions).subscribe(
      (res) => {
        console.log('uat 389', res);
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
        console.log('uat 389 error', err);
        this.isLoading = false;
      },
    );

    // element.target = '_blank';
    // element.download = 'Assignment Table';
    // document.body.appendChild(element);
    // element.click();
    // document.body.removeChild(element);
    // this.coreService.sidenavOpen = true;
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
        this.getAssignmentData();
      }
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
  checkIsSelected(row) {
    return this.selection.isSelected(row._id);
  }

  editJury() {
    if (this.dataSelected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      const dialogRef = this.dialog.open(EditJuryDecisionDialogComponent, {
        width: '660px',
        minHeight: '100px',
        disableClose: true,
        data: {
          id: this.dataSelected.map((list) => list._id),
          select_all: this.isCheckedAll && this.dataUnselectUser.length < 1 ? true : false,
          filter: this.cleanFilterDataEditJury(),
          is_readmission: true,
          data: this.dataSelected,
        },
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res) {
          this.clearSelectIfFilter();
          this.getAssignmentData();
        }
      });
    }
  }

  editProgram() {
    if (this.dataSelected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      const dialogRef = this.dialog.open(EditProgramDesiredDialogComponent, {
        width: '660px',
        minHeight: '100px',
        disableClose: true,
        data: {
          id: this.dataSelected.map((list) => list._id),
          select_all: this.isCheckedAll && this.dataUnselectUser.length < 1 ? true : false,
          filter: this.cleanFilterDataEditJury(),
          is_readmission: true,
          data: this.dataSelected,
        },
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res) {
          this.clearSelectIfFilter();
          this.selection.clear();
          this.dataSelected = [];
          this.isCheckedAll = false;
          this.getAssignmentData();
        }
      });
    }
  }

  viewCandidateInfo(candidateId, tab?) {
    const query = {
      selectedCandidate: candidateId,
      sortValue: JSON.stringify(this.sortValue) || '',
      tab: tab || '',
      paginator: JSON.stringify({
        pageIndex: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize,
      }),
    };
    if (tab) {
      const url = this.router.createUrlTree(['candidate-file'], { queryParams: query });
      window.open(url.toString(), '_blank');
    } else {
      // this.router.navigate(['candidate-file'], { queryParams: query });
      const url = this.router.createUrlTree(['candidate-file'], { queryParams: query });
      window.open(url.toString(), '_blank');
    }
  }

  sendMultipleEmail() {
    if (this.dataSelected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      let data = this.dataSelected;
      data = data.map((res) => {
        return {
          candidate: {
            email: res.email,
            emailDefault: res.school_mail,
          },
        };
      });
      this.sendMultipleEmailComponent = this.dialog.open(SendMultipleEmailComponent, {
        disableClose: true,
        width: '750px',
        data: data,
        autoFocus: false,
      });
      this.subs.sink = this.sendMultipleEmailComponent.afterClosed().subscribe((resulta) => {
        if (resulta) {
          this.clearSelectIfFilter();
          this.getAssignmentData();
        }
        this.sendMultipleEmailComponent = null;
      });
    }
  }

  intakeChannel(data) {
    let intakeChannel = '';
    if (data && data.initial_intake_channel && data.scholar_season && data.intake_channel.program && data.scholar_season.scholar_season) {
      intakeChannel = data.scholar_season.scholar_season.concat(' ', data.initial_intake_channel.program);
      return data.initial_intake_channel;
    } else {
      return '';
    }
  }

  currentProgram(data) {
    let intakeChannel = '';
    if (
      data &&
      data.intake_channel &&
      data.intake_channel.scholar_season_id &&
      data.intake_channel.program &&
      data.intake_channel.scholar_season_id.scholar_season
    ) {
      intakeChannel = data.intake_channel.scholar_season_id.scholar_season.concat(' ', data.intake_channel.program);
      return intakeChannel;
    } else {
      return '';
    }
  }

  sendMail(data) {
    // console.log('_data', data);
    if (data) {
      const mappedData = {
        candidate_id: {
          candidate_admission_status: data.candidate_admission_status,
          civility: data.civility,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
        },
        financial_supports: data.payment_supports,
        fromCandidate: true,
      };
      this.subs.sink = this.dialog
        .open(InternshipEmailDialogComponent, {
          width: '600px',
          minHeight: '100px',
          disableClose: true,
          data: mappedData,
        })
        .afterClosed()
        .subscribe((resp) => {
          if (!this.isReset && resp) {
            this.getAssignmentData();
          }
        });
    }
  }

  templateForImport() {
    const inputOptions = {
      ',': this.translate.instant('IMPORT_TEMPLATE_S1.COMMA'),
      ';': this.translate.instant('IMPORT_TEMPLATE_S1.SEMICOLON'),
      tab: this.translate.instant('IMPORT_TEMPLATE_S1.TAB'),
    };

    Swal.fire({
      type: 'question',
      title: this.translate.instant('IMPORT_TEMPLATE_S1.TITLE'),
      width: 465,
      allowEscapeKey: true,
      showCancelButton: true,
      cancelButtonText: this.translate.instant('IMPORT_TEMPLATE_S1.CANCEL'),
      confirmButtonText: this.translate.instant('IMPORT_TEMPLATE_S1.OK'),
      input: 'radio',
      inputValue: ';',
      inputOptions: inputOptions,
    }).then((separator) => {
      console.log(separator);
      if (separator && separator.value) {
        this.downloadCSVTemplate(separator.value);
      }
    });
  }

  downloadCSVTemplate(fileType) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const path = '';
    const lang = this.translate.currentLang.toLowerCase();
    let importStudentTemlate = 'downloadAssignmentTemplateCSV';
    importStudentTemlate = importStudentTemlate + '/' + fileType + '/' + lang;
    element.href = url + importStudentTemlate + path;

    element.target = '_blank';
    element.download = 'Template Import CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  csvTypeSelectionUpload() {
    const inputOptions = {
      ',': this.translate.instant('IMPORT_DECISION_S1.COMMA'),
      ';': this.translate.instant('IMPORT_DECISION_S1.SEMICOLON'),
      tab: this.translate.instant('IMPORT_DECISION_S1.TAB'),
    };

    Swal.fire({
      type: 'question',
      title: this.translate.instant('IMPORT_DECISION_S1.TITLE'),
      width: 465,
      allowEscapeKey: true,
      showCancelButton: true,
      cancelButtonText: this.translate.instant('IMPORT_DECISION_S1.CANCEL'),
      confirmButtonText: this.translate.instant('IMPORT_DECISION_S1.OK'),
      input: 'radio',
      inputOptions: inputOptions,
      inputValue: ';',
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
        this.openImportDialog(fileType);
      }
    });
  }

  openImportDialog(fileType) {
    let delimeter = null;
    switch (fileType) {
      case ',':
        delimeter = ',';
        break;
      case ';':
        delimeter = ';';
        break;
      case 'tab':
        delimeter = 'tab';
        break;
      default:
        delimeter = null;
        break;
    }
    // const schoolId;
    // const titleId = this.setupScheduleInfo && this.setupScheduleInfo.rncp_id ? this.setupScheduleInfo.rncp_id._id : null;
    // const classId = this.setupScheduleInfo && this.setupScheduleInfo.class_id ? this.setupScheduleInfo.class_id._id : null;
    this.dialog
      .open(ImportContractProcessDialogComponent, {
        width: '500px',
        panelClass: 'certification-rule-pop-up',
        minHeight: '200px',
        disableClose: true,
        data: {
          delimeter: delimeter,
          type: 'assignment',
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.isLoading = false;
          this.clearSelectIfFilter();
          this.getAssignmentData();
        }
      });
  }

  openFinancialDialog() {
    if (this.dataSelected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      const dialogRef = this.dialog.open(UpdateFinancialSupportStatusDialogComponent, {
        width: '660px',
        minHeight: '100px',
        disableClose: true,
        data: this.dataSelected,
      });

      dialogRef.afterClosed().subscribe((resp) => {
        if (resp) {
          this.isLoading = false;
          this.clearSelectIfFilter();
          this.getAssignmentData();
        }
      });
    }
  }
  getDataSectorByLevel() {
    // const scholar = this.scholarFilter.value && this.scholarFilter.value !== 'All' ? true : false;
    const scholar = this.newScholarFilter.value ? true : false;
    const school = this.schoolsFilter.value && this.schoolsFilter.value.length ? true : false;
    const campus = this.campusSelected && this.campusSelected.length ? true : false;
    const level = this.levelSelected && this.levelSelected.length ? true : false;
    let allSchool = [];
    let allCampus = [];
    let allLevel = [];
    if (this.schoolsFilter.value && this.schoolsFilter.value.includes('All') && this.listObjective && this.listObjective.length) {
      allSchool = this.listObjective.map((data) => data._id);
    }
    if (this.campusFilter.value && this.campusFilter.value.includes('All') && this.campusList && this.campusList.length) {
      allCampus = this.campusList.map((data) => data._id);
    }
    if (this.levelFilter.value && this.levelFilter.value.includes('All') && this.levels && this.levels.length) {
      allLevel = this.levels.map((data) => data._id);
    }
    const filter = {
      // scholar_season_id: scholar ? this.scholarFilter.value : null,
      scholar_season_id: scholar ? this.newScholarFilter.value : null,
      candidate_school_ids: allSchool && allSchool.length > 0 ? allSchool : school ? this.schoolsFilter.value : null,
      campuses: allCampus && allCampus.length > 0 ? allCampus : campus ? this.campusSelected : null,
      levels: allLevel && allLevel.length > 0 ? allLevel : level ? this.levelSelected : null,
    };
    this.sectorList = [];
    this.specilityList = [];
    const campusValue = this.superFilter.campus;
    const levelValue = this.superFilter.level;
    if (school || campus) {
      this.subs.sink = this.financeService.GetAllSectorsDropdown(filter).subscribe(
        (resp) => {
          if (!this.campusFilter.value && campusValue) {
            this.campusFilter.setValue(campusValue);
            this.getDataLevel();
          }
          if (!this.levelFilter.value && levelValue) {
            this.levelFilter.setValue(levelValue);
          }
          if (resp && resp.length) {
            this.sectorsFilter.setValue(null);
            this.specialitiesFilter.setValue(null);
            this.superFilter.sectors = null;
            this.superFilter.specialities = null;
            this.sectorList = resp;
            // this.getDataSpecialityBySector();
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
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
    } else {
      this.sectorsFilter.setValue(null, { emitEvent: false });
      this.specialitiesFilter.setValue(null, { emitEvent: false });
      this.superFilter.sectors = null;
      this.superFilter.specialities = null;
    }
  }

  getDataSpecialityBySector() {
    // const scholar = this.scholarFilter.value && this.scholarFilter.value !== 'All' ? true : false;
    const scholar = this.newScholarFilter.value ? true : false;
    const school = this.schoolsFilter.value && this.schoolsFilter.value.length ? true : false;
    const campus = this.campusSelected && this.campusSelected.length ? true : false;
    const level = this.levelSelected && this.levelSelected.length ? true : false;
    const sector = this.sectorsFilter.value && this.sectorsFilter.value.length ? true : false;
    let allSchool = [];
    let allCampus = [];
    let allLevel = [];
    let allSector = [];
    if (this.schoolsFilter.value && this.schoolsFilter.value.includes('All') && this.listObjective && this.listObjective.length) {
      allSchool = this.listObjective.map((data) => data._id);
    }
    if (this.campusFilter.value && this.campusFilter.value.includes('All') && this.campusList && this.campusList.length) {
      allCampus = this.campusList.map((data) => data._id);
    }
    if (this.levelFilter.value && this.levelFilter.value.includes('All') && this.levels && this.levels.length) {
      allLevel = this.levels.map((data) => data._id);
    }
    if (this.sectorsFilter.value && this.sectorsFilter.value.includes('All') && this.sectorList && this.sectorList.length) {
      allSector = this.sectorList.map((data) => data._id);
    }
    const filter = {
      // scholar_season_id: scholar ? this.scholarFilter.value : null,
      scholar_season_id: scholar ? this.newScholarFilter.value : null,
      candidate_school_ids: allSchool && allSchool.length ? allSchool : school ? this.schoolsFilter.value : null,
      campuses: allCampus && allCampus.length ? allCampus : campus ? this.campusSelected : null,
      levels: allLevel && allLevel.length ? allLevel : level ? this.levelSelected : null,
      sectors: allSector && allSector.length ? allSector : sector ? this.sectorsFilter.value : null,
    };
    this.specilityList = [];
    if (school || campus || sector) {
      this.subs.sink = this.candidatesService.GetAllSpecializationsByScholar(filter).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.specialitiesFilter.setValue(null);
            this.superFilter.specialities = null;
            this.specilityList = resp;
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
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
    } else {
      this.specialitiesFilter.setValue(null, { emitEvent: false });
      this.superFilter.specialities = null;
    }
  }

  // ************************ Below is function for all button above table candidate FI
  getAllIdForCheckbox(pageNumber) {
    if (this.buttonClicked === 'export') {
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
          const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
          this.subs.sink = this.candidatesService
            .getAllIdForAssignmentCheckbox(pagination, this.sortValue, filter, null, userTypesList)
            .subscribe(
              (students: any) => {
                if (students && students.length) {
                  this.allExportForCheckbox.push(...students);
                  const page = pageNumber + 1;
                  this.getAllIdForCheckbox(page);
                } else {
                  this.isLoading = false;
                  if (this.isCheckedAll && this.allExportForCheckbox && this.allExportForCheckbox.length) {
                    this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                    this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                    console.log('getAllIdForCheckbox', this.dataSelected);
                    this.downloadCSV();
                  }
                }
              },
              (error) => {
                this.isReset = false;
                this.isLoading = false;
                this.authService.postErrorLog(error);
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
  getDataForFinancial(pageNumber) {
    if (this.buttonClicked === 'financial') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allFinancialForCheckbox = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const filter = this.cleanFilterData();
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        this.subs.sink = this.candidatesService
          .getAllIdForAssignmentCheckbox(pagination, this.sortValue, filter, null, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                this.allFinancialForCheckbox.push(...students);
                const page = pageNumber + 1;
                this.getDataForFinancial(page);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allFinancialForCheckbox && this.allFinancialForCheckbox.length) {
                  this.dataSelected = this.allFinancialForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  console.log('getAllIdForCheckbox', this.dataSelected);
                  if (this.dataSelected && this.dataSelected.length) {
                    this.openFinancialDialog();
                  }
                }
              }
            },
            (error) => {
              this.isReset = false;
              this.isLoading = false;
              this.authService.postErrorLog(error);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('OK'),
              });
            },
          );
      } else {
        this.openFinancialDialog();
      }
    }
  }
  getDataForJury(pageNumber) {
    if (this.buttonClicked === 'jury') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allJuryForCheckbox = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const filter = this.cleanFilterData();
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        this.subs.sink = this.candidatesService
          .getAllJuryForAssignmentCheckbox(pagination, this.sortValue, filter, null, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                this.allJuryForCheckbox.push(...students);
                const page = pageNumber + 1;
                this.getDataForJury(page);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allJuryForCheckbox && this.allJuryForCheckbox.length) {
                  this.dataSelected = this.allJuryForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  console.log('getAllIdForCheckbox', this.dataSelected);
                  if (this.dataSelected && this.dataSelected.length) {
                    this.editJury();
                  }
                }
              }
            },
            (error) => {
              this.isReset = false;
              this.isLoading = false;
              this.authService.postErrorLog(error);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('OK'),
              });
            },
          );
      } else {
        this.editJury();
      }
    }
  }
  getDataForDesired(pageNumber) {
    if (this.buttonClicked === 'desired') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allDesiredForCheckbox = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const filter = this.cleanFilterData();
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        this.subs.sink = this.candidatesService
          .getAllDesiredForAssignmentCheckbox(pagination, this.sortValue, filter, null, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                this.allDesiredForCheckbox.push(...students);
                const page = pageNumber + 1;
                this.getDataForDesired(page);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allDesiredForCheckbox && this.allDesiredForCheckbox.length) {
                  this.dataSelected = this.allDesiredForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  console.log('getAllIdForCheckbox', this.dataSelected);
                  if (this.dataSelected && this.dataSelected.length) {
                    this.editProgram();
                  }
                }
              }
            },
            (error) => {
              this.isReset = false;
              this.isLoading = false;
              this.authService.postErrorLog(error);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('OK'),
              });
            },
          );
      } else {
        this.editProgram();
      }
    }
  }
  getDataForProgram(pageNumber) {
    if (this.buttonClicked === 'program') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allProgramForCheckbox = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const filter = this.cleanFilterData();
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        this.subs.sink = this.candidatesService
          .getAllProgramForAssignmentCheckbox(pagination, this.sortValue, filter, null, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                this.allProgramForCheckbox.push(...students);
                const page = pageNumber + 1;
                this.getDataForProgram(page);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allProgramForCheckbox && this.allProgramForCheckbox.length) {
                  this.dataSelected = this.allProgramForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  console.log('getAllIdForCheckbox', this.dataSelected);
                  if (this.dataSelected && this.dataSelected.length) {
                    this.openAssingProgram('above');
                  }
                }
              }
            },
            (error) => {
              this.isReset = false;
              this.isLoading = false;
              this.authService.postErrorLog(error);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('OK'),
              });
            },
          );
      } else {
        this.openAssingProgram('above');
      }
    }
  }
  getDataForEmail(pageNumber) {
    if (this.buttonClicked === 'email') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allEmailForCheckbox = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const filter = this.cleanFilterData();
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        this.subs.sink = this.candidatesService
          .getAllEmailForAssignmentCheckbox(pagination, this.sortValue, filter, null, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                this.allEmailForCheckbox.push(...students);
                const page = pageNumber + 1;
                this.getDataForEmail(page);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allEmailForCheckbox && this.allEmailForCheckbox.length) {
                  this.dataSelected = this.allEmailForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  console.log('getAllIdForCheckbox', this.dataSelected);
                  if (this.dataSelected && this.dataSelected.length) {
                    this.sendMultipleEmail();
                  }
                }
              }
            },
            (error) => {
              this.isReset = false;
              this.isLoading = false;
              this.authService.postErrorLog(error);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('OK'),
              });
            },
          );
      } else {
        this.sendMultipleEmail();
      }
    }
  }
  // End of Functionality Button Above table

  controllerButton(action) {
    switch (action) {
      case 'export':
        setTimeout(() => {
          this.getAllIdForCheckbox(0);
        }, 500);
        break;
      case 'financial':
        setTimeout(() => {
          this.getDataForFinancial(0);
        }, 500);
        break;
      case 'jury':
        setTimeout(() => {
          this.getDataForJury(0);
        }, 500);
        break;
      case 'desired':
        setTimeout(() => {
          this.getDataForDesired(0);
        }, 500);
        break;
      case 'program':
        setTimeout(() => {
          this.getDataForProgram(0);
        }, 500);
        break;
      case 'email':
        setTimeout(() => {
          this.getDataForEmail(0);
        }, 500);
        break;
      default:
        this.refetchDataKeepFilter();
    }
  }

  applySuperFilter() {
    this.filteredValues = {
      ...this.filteredValues,
      scholar_season: this.superFilter.scholar_season,
      school: this.superFilter.school,
      campus: this.superFilter.campus,
      level: this.superFilter.level,
      sectors: this.superFilter.sectors,
      specialities: this.superFilter.specialities,
    };
    this.paginator.firstPage();
    this.isDisabled = true;
    this.getAssignmentData();
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.superFilter, this.filteredValues);
    if (filterItem.name === 'scholar_season') {
      this.newScholarFilter.setValue('All');
      this.filteredValues.scholar_season = null;
      this.filteredValues.school = null;
      this.filteredValues.campus = null;
      this.filteredValues.level = null;
      this.filteredValues.sectors = null;
      this.filteredValues.specialities = null;
      this.newScholarSelect();
    } else if (filterItem.name === 'school') {
      this.schoolsFilter.setValue(null);
      this.filteredValues.school = null;
      this.filteredValues.campus = null;
      this.filteredValues.level = null;
      this.filteredValues.sectors = null;
      this.filteredValues.specialities = null;
      this.getDataCampus();
    } else if (filterItem.name === 'campus') {
      this.campusFilter.setValue(null);
      this.filteredValues.campus = null;
      this.filteredValues.level = null;
      this.filteredValues.sectors = null;
      this.filteredValues.specialities = null;
      this.getDataByLevel();
    } else if (filterItem.name === 'level') {
      this.levelFilter.setValue(null);
      this.filteredValues.level = null;
      this.filteredValues.sectors = null;
      this.filteredValues.specialities = null;
      this.getDataSectorByLevel();
    } else if (filterItem.name === 'sectors') {
      this.sectorsFilter.setValue(null);
      this.filteredValues.sectors = null;
      this.filteredValues.specialities = null;
      this.getDataSpecialityBySector();
    } else if (filterItem.name === 'specialities') {
      this.specialitiesFilter.setValue(null);
      this.filteredValues.specialities = null;
    }
    this.clearSelectIfFilter();
    this.getAssignmentData();
  }

  filterBreadcrumbFormat() {
    const filteredValuesAll = {
      school: 'All',
      campus: 'All',
      level: 'All',
      sectors: 'All',
      specialities: 'All',
      type_of_formations: 'All',
      jury_decisions: 'All',
      financial_situations: 'All',
    };
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'scholar_season', // name of the key in the object storing the filter
        column: 'CARDDETAIL.Scholar Season', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.superFilter, // the object holding the filter value (e.g. filteredValues | superFilter)
        filterList: this.scholars, // the array/list holding the dropdown options
        filterRef: this.newScholarFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'scholar_season', // the key displayed in the html (only applicable to array of objects)
        savedValue: '_id', // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'super_filter',
        name: 'school',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.School',
        isMultiple: this.schoolsFilter?.value?.length === this.school?.length ? false : true,
        filterValue: this.schoolsFilter?.value?.length === this.school?.length ? filteredValuesAll : this.superFilter,
        filterList: this.schoolsFilter?.value?.length === this.school?.length ? null : this.school,
        filterRef: this.schoolsFilter,
        displayKey: this.schoolsFilter?.value?.length === this.school?.length ? null : 'short_name',
        savedValue: this.schoolsFilter?.value?.length === this.school?.length ? null : '_id',
        isSelectionInput: this.schoolsFilter?.value?.length === this.school?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'campus',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus',
        isMultiple: this.campusFilter?.value?.length === this.campusList?.length ? false : true,
        filterValue: this.campusFilter?.value?.length === this.campusList?.length ? filteredValuesAll : this.superFilter,
        filterList: this.campusFilter?.value?.length === this.campusList?.length ? null : this.campusList,
        filterRef: this.campusFilter,
        displayKey: this.campusFilter?.value?.length === this.campusList?.length ? null : 'name',
        savedValue: this.campusFilter?.value?.length === this.campusList?.length ? null : 'name',
        isSelectionInput: this.campusFilter?.value?.length === this.campusList?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'level',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level',
        isMultiple: this.levelFilter?.value?.length === this.levels?.length ? false : true,
        filterValue: this.levelFilter?.value?.length === this.levels?.length ? filteredValuesAll : this.superFilter,
        filterList: this.levelFilter?.value?.length === this.levels?.length ? null : this.levels,
        filterRef: this.levelFilter,
        displayKey: this.levelFilter?.value?.length === this.levels?.length ? null : 'name',
        savedValue: this.levelFilter?.value?.length === this.levels?.length ? null : 'name',
        isSelectionInput: this.levelFilter?.value?.length === this.levels?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'sectors',
        column: 'ALUMNI.Sector',
        isMultiple: this.sectorsFilter?.value?.length === this.sectorList?.length ? false : true,
        filterValue: this.sectorsFilter?.value?.length === this.sectorList?.length ? filteredValuesAll : this.superFilter,
        filterList: this.sectorsFilter?.value?.length === this.sectorList?.length ? null : this.sectorList,
        filterRef: this.sectorsFilter,
        displayKey: this.sectorsFilter?.value?.length === this.sectorList?.length ? null : 'name',
        savedValue: this.sectorsFilter?.value?.length === this.sectorList?.length ? null : '_id',
        isSelectionInput: this.sectorsFilter?.value?.length === this.sectorList?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'specialities',
        column: 'ALUMNI.Speciality',
        isMultiple: this.specialitiesFilter?.value?.length === this.specilityList?.length ? false : true,
        filterValue: this.specialitiesFilter?.value?.length === this.specilityList?.length ? filteredValuesAll : this.superFilter,
        filterList: this.specialitiesFilter?.value?.length === this.specilityList?.length ? null : this.specilityList,
        filterRef: this.specialitiesFilter,
        displayKey: this.specialitiesFilter?.value?.length === this.specilityList?.length ? null : 'name',
        savedValue: this.specialitiesFilter?.value?.length === this.specilityList?.length ? null : '_id',
        isSelectionInput: this.specialitiesFilter?.value?.length === this.specilityList?.length ? false : true,
      },
      // Table Filters below
      {
        type: 'table_filter',
        name: 'candidate_unique_number',
        column: 'Student Number',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.numberFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'candidate',
        column: 'Student Name',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.nameFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'initial_intake_channel',
        column: 'Intake Channel',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.intakeChannelFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'intake_channel_name',
        column: 'Current Program',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.currentProgramFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'type_of_formations',
        column: 'Type of Formation',
        isMultiple: this.typeFilter?.value?.length === this.listTypeOfInformation?.length ? false : true,
        filterValue: this.typeFilter?.value?.length === this.listTypeOfInformation?.length ? filteredValuesAll : this.filteredValues,
        filterList: this.typeFilter?.value?.length === this.listTypeOfInformation?.length ? null : this.listTypeOfInformation,
        filterRef: this.typeFilter,
        displayKey: this.typeFilter?.value?.length === this.listTypeOfInformation?.length ? null : 'type_of_formation',
        savedValue: this.typeFilter?.value?.length === this.listTypeOfInformation?.length ? null : '_id',
        isSelectionInput: this.typeFilter?.value?.length === this.listTypeOfInformation?.length ? false : true,
        translationPrefix: this.typeFilter?.value?.length === this.listTypeOfInformation?.length ? null : 'type_formation.',
      },
      {
        type: 'table_filter',
        name: 'financial_situations',
        column: 'Financial Situation',
        isMultiple: this.financeFilter?.value?.length === this.financeList?.length ? false : true,
        filterValue: this.financeFilter?.value?.length === this.financeList?.length ? filteredValuesAll : this.filteredValues,
        filterList: this.financeFilter?.value?.length === this.financeList?.length ? null : this.financeList,
        filterRef: this.financeFilter,
        displayKey: this.financeFilter?.value?.length === this.financeList?.length ? null : 'key',
        savedValue: this.financeFilter?.value?.length === this.financeList?.length ? null : 'value',
        isSelectionInput: this.financeFilter?.value?.length === this.financeList?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'jury_decisions',
        column: 'Jury Decision',
        isMultiple: this.juryFilter?.value?.length === this.juryList?.length ? false : true,
        filterValue: this.juryFilter?.value?.length === this.juryList?.length ? filteredValuesAll : this.filteredValues,
        filterList: this.juryFilter?.value?.length === this.juryList?.length ? null : this.juryList,
        filterRef: this.juryFilter,
        displayKey: this.juryFilter?.value?.length === this.juryList?.length ? null : 'value',
        savedValue: this.juryFilter?.value?.length === this.juryList?.length ? null : 'value',
        isSelectionInput: this.juryFilter?.value?.length === this.juryList?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'programs_desired',
        column: 'Program Desired',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.programsDesiredFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
    ];

    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  isAllDropdownSelected(type) {
    if (type === 'scholar') {
      // const selected = this.scholarFilter.value;
      const selected = this.newScholarFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.scholars.length;
      return isAllSelected;
    } else if (type === 'school') {
      const selected = this.schoolsFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.school.length;
      return isAllSelected;
    } else if (type === 'campus') {
      const selected = this.campusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.campusList.length;
      return isAllSelected;
    } else if (type === 'level') {
      const selected = this.levelFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.levels.length;
      return isAllSelected;
    } else if (type === 'sector') {
      const selected = this.sectorsFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.sectorList.length;
      return isAllSelected;
    } else if (type === 'speciality') {
      const selected = this.specialitiesFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.specilityList.length;
      return isAllSelected;
    } else if (type === 'typeOfFormation') {
      const selected = this.typeFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listTypeOfInformation.length;
      return isAllSelected;
    } else if (type === 'finance') {
      const selected = this.financeFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.financeList.length;
      return isAllSelected;
    } else if (type === 'jury') {
      const selected = this.juryFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.juryList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'scholar') {
      // const selected = this.scholarFilter.value;
      const selected = this.newScholarFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.scholars.length;
      return isIndeterminate;
    } else if (type === 'school') {
      const selected = this.schoolsFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.school.length;
      return isIndeterminate;
    } else if (type === 'campus') {
      const selected = this.campusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.campusList.length;
      return isIndeterminate;
    } else if (type === 'level') {
      const selected = this.levelFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.levels.length;
      return isIndeterminate;
    } else if (type === 'sector') {
      const selected = this.sectorsFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.sectorList.length;
      return isIndeterminate;
    } else if (type === 'speciality') {
      const selected = this.specialitiesFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.specilityList.length;
      return isIndeterminate;
    } else if (type === 'typeOfFormation') {
      const selected = this.typeFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listTypeOfInformation.length;
      return isIndeterminate;
    } else if (type === 'finance') {
      const selected = this.financeFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.financeList.length;
      return isIndeterminate;
    } else if (type === 'jury') {
      const selected = this.juryFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.juryList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'scholar') {
      if (event.checked) {
        // this.scholarFilter.patchValue('All', { emitEvent: false });
        this.newScholarFilter.patchValue(this.currentScholar, { emitEvent: false });
      } else {
        // this.scholarFilter.patchValue(null, { emitEvent: false });
        this.newScholarFilter.patchValue(this.currentScholar, { emitEvent: false });
      }
    } else if (type === 'school') {
      if (event.checked) {
        const schoolData = this.school.map((el) => el._id);
        this.schoolsFilter.patchValue(schoolData, { emitEvent: false });
      } else {
        this.schoolsFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'campus') {
      if (event.checked) {
        const campusData = this.campusList.map((el) => el.name);
        this.campusFilter.patchValue(campusData, { emitEvent: false });
      } else {
        this.campusFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'level') {
      if (event.checked) {
        const levelData = this.levels.map((el) => el.name);
        this.levelFilter.patchValue(levelData, { emitEvent: false });
      } else {
        this.levelFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'sector') {
      if (event.checked) {
        const sectorData = this.sectorList.map((el) => el._id);
        this.sectorsFilter.patchValue(sectorData, { emitEvent: false });
      } else {
        this.sectorsFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'speciality') {
      if (event.checked) {
        const specialityData = this.specilityList.map((el) => el._id);
        this.specialitiesFilter.patchValue(specialityData, { emitEvent: false });
      } else {
        this.specialitiesFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'typeOfFormation') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.listTypeOfInformation.map((el) => el._id);
        this.typeFilter.patchValue(data, { emitEvent: false });
      } else {
        this.typeFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'finance') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.financeList.map((el) => el.value);
        this.financeFilter.patchValue(data, { emitEvent: false });
      } else {
        this.financeFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'jury') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.juryList.map((el) => el.value);
        this.juryFilter.patchValue(data, { emitEvent: false });
      } else {
        this.juryFilter.patchValue(null, { emitEvent: false });
      }
    }
  }
  onFilterSelectMultiple(key) {
    if (this.isMultipleFilter) {
      this.isMultipleFilter = false;
      const value =
        key === 'type_of_formations'
          ? this.typeFilter.value
          : key === 'financial_situations'
          ? this.financeFilter.value
          : key === 'jury_decisions'
          ? this.juryFilter.value
          : null;
      this.filteredValues[key] = value?.length ? value : null;
      this.paginator.pageIndex = 0;
      this.selection.clear();
      this.dataSelected = [];
      this.isCheckedAll = false;
      if (!this.isReset) {
        this.getAssignmentData();
      }
    }
  }
  displayTooltip(form, data, key) {
    if (form?.length && data?.length) {
      const value = data.filter((temp) => form.includes(temp[key]));
      if (value?.length) {
        return value.map((item) => item?.label)?.join(', ');
      }
    }
  }
}
