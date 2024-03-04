import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Sort, MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { bufferCount, debounceTime, map, startWith, take, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { PermissionService } from 'app/service/permission/permission.service';
import { AssignRateProfileDialogComponent } from 'app/shared/components/assign-rate-dialog/assign-rate-dialog.component';
import { SendMultipleEmailComponent } from 'app/internship-file/send-multiple-email/send-multiple-email.component';
import { InternshipEmailDialogComponent } from 'app/internship-file/internship-email-dialog/internship-email-dialog.component';
import { SendEmailValidatorDialogComponent } from 'app/shared/components/send-email-validator-dialog/send-email-validator-dialog.component';
import { ApplicationUrls } from 'app/shared/settings';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import * as moment from 'moment';
import { environment } from 'environments/environment';
import { SendEmailReadmissionDialogComponent } from './send-email-readmission-dialog/send-email-readmission-dialog.component';
import { EditJuryDecisionDialogComponent } from '../assignment-readmission/edit-jury-decision-dialog/edit-jury-decision-dialog.component';
import { ReadmissionService } from 'app/service/re-admission/readmission.service';
import { TransferAdmissionDialogComponent } from 'app/candidates/transfer-admission-member/transfer-admission-member-dialog.component';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AssignMemberFcDialogComponent } from 'app/shared/components/assign-member-fc-dialog/assign-member-fc-dialog.component';
import { TransferFcProgramCandidateDialogComponent } from 'app/candidates/transfer-fc-program-candidate/transfer-fc-program-candidate-dialog.component';
import { UtilityService } from 'app/service/utility/utility.service';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-follow-up-readmission',
  templateUrl: './follow-up-readmission.component.html',
  styleUrls: ['./follow-up-readmission.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class FollowUpReadmissionComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('matTable', { static: false }) table: MatTable<any>;

  private subs = new SubSink();
  currentUser: any;
  isPermission: any;
  currentUserTypeId: any;

  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  isCheckedAll = false;
  dataSelected = [];
  tagList = [];
  disabledAssign = false;
  noData: any;
  displayedColumns: string[] = [
    'select',
    'type_of_formation',
    'student_number',
    'name',
    'previous_program',
    'readmission_program',
    'type_of_readmission',
    'status',
    'jury_decision',
    'registration_profile',
    'readmission_email',
    'date_last_reminder',
    'method_of_payment_dp',
    'down_payment',
    'financement',
    'financial_situation',
    // 'convention',
    'readmission_date',
    'admission_member',
    'fc_in_charge',
    'action',
  ];
  filterColumns: string[] = [
    'select_filter',
    'type_of_formation_filter',
    'student_number_filter',
    'name_filter',
    'previous_program_filter',
    'readmission_program_filter',
    'type_of_readmission_filter',
    'status_filter',
    'juryFilter',
    'registration_profile_filter',
    'readmission_email_filter',
    'date_last_reminder_filter',
    'method_of_payment_dp_filter',
    'down_payment_filter',
    'financement_filter',
    'financial_situation_filter',
    // 'convention_filter',
    'readmission_date_filter',
    'admission_member_filter',
    'fc_in_charge_filter',
    'action_filter',
  ];

  candidate_admission_statuses = [
    'admission_in_progress',
    'bill_validated',
    'engaged',
    'registered',
    'resigned',
    'resigned_after_engaged',
    'resigned_after_registered',
    'report_inscription',
    'in_scholarship',
    'mission_card_validated',
    'resignation_missing_prerequisites',
    'resign_after_school_begins',
    'no_show',
    // 'deactivated',
  ];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  sortValue = null;
  dataCount = 0;

  dataLoaded: Boolean = false;
  isWaitingForResponse = false;
  isLoading: Boolean = false;
  isReset: Boolean = false;

  disabledExport = true;
  selectType: any;
  dataSelectedId = [];
  allStudentForCheckbox = [];
  allRegisForCheckbox = [];
  allAnnoucmentForCheckbox = [];
  allCallForCheckbox = [];
  allCRMForCheckbox = [];
  allEmailForCheckbox = [];
  allMemberForCheckbox = [];
  allExportForCheckbox = [];
  allJuryForCheckbox = [];
  allReminderForCheckbox = [];
  filterBreadcrumbData: any[] = [];

  isEmailSent = false;
  listRegistrationProfile = [];
  isSameData = false;
  isWasSelectAll = false;

  allCandidateData: any = [];
  buttonClicked = '';
  private timeOutVal: any;
  currScholarSeason;
  isFirstLoad = true

  studentStatusFilterList = [
    { value: 'admission_in_progress', key: 'Admitted' },
    { value: 'bill_validated', key: 'Bill validated' },
    { value: 'engaged', key: 'Engaged' },
    { value: 'registered', key: 'Registered' },
    { value: 'resigned', key: 'Resigned' },
    { value: 'resigned_after_engaged', key: 'Resigned after engaged' },
    { value: 'resigned_after_registered', key: 'Resign after registered' },
    { value: 'report_inscription', key: 'Report Inscription +1' },
    { value: 'mission_card_validated', key: 'mission_card_validated' },
    { value: 'financement_validated', key: 'Financement valided' },
    { value: 'in_scholarship', key: 'in_scholarship' },
    { value: 'resignation_missing_prerequisites', key: 'resignation_missing_prerequisites' },
    { value: 'no_show', key: 'no_show' },
    { value: 'resign_after_school_begins', key: 'resigned_after_school_begins' },
    // { value: 'deactivated', key: 'Deactivated' },
  ];

  typeFilterList = [
    { value: 'classic', key: 'classic' },
    { value: 'continuous_total_funding', key: 'continuous_total_funding' },
    { value: 'continuous_partial_funding', key: 'continuous_partial_funding' },
    { value: 'continuous_personal_funding', key: 'continuous_personal_funding' },
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

  financementFilterList = [
    { value: 'accept', key: 'accept' },
    { value: 'not_started', key: 'not_started' },
    { value: 'need_validation', key: 'need_validation' },
    { value: 'ask_for_revision', key: 'ask_for_revision' },
    { value: 'reject_and_stop', key: 'reject_and_stop' },
    { value: 'no_financement', key: 'no_financement' },
  ];
  financialSituationFilterList = [
    { value: 'ok', key: 'ok' },
    { value: 'not_ok', key: 'not_ok' },
  ];

  DPFilterList = [
    { value: 'paid', key: 'Paid' },
    { value: 'not_paid', key: 'Not Paid' },
    { value: 'pending', key: 'Pending' },
    { value: 'rejected', key: 'Rejected' },
    { value: 'billed', key: 'Billed' },
    { value: 'not_billed', key: 'Not billed' },
    { value: 'partialy_paid', key: 'Partially paid' },
    { value: 'chargeback', key: 'chargeback' },
    { value: 'no_down_payment', key: 'Without DP' },
  ];

  paymentMethodFilterList = [
    { value: 'not_done', key: 'not_done' },
    { value: 'check', key: 'Check' },
    { value: 'transfer', key: 'Transfer' },
    { value: 'credit_card', key: 'Credit card' },
    { value: 'sepa', key: 'SEPA' },
    { value: 'cash', key: 'Cash' },
  ];

  typeOfReadmissionList = [
    { value: 'same_school_campus', key: 'same_school_campus' },
    { value: 'same_school_different_campus', key: 'same_school_different_campus' },
    { value: 'different_school_same_campus', key: 'different_school_same_campus' },
    { value: 'different_school_campus', key: 'different_school_campus' },
  ];

  scholars = [];
  originalScholar = [];
  schools = [];
  campuses = [];
  levels = [];
  listObjective = [];

  listSigle: any[] = [];

  filteredValues = {
    scholar_season: null,
    schools: null,
    campuses: null,
    levels: null,
    tags: null,
    sectors: null,
    specialities: null,
    readmission_status: null,
    sigle: null,
    candidate_unique_number: null,
    candidate: null,
    initial_intake_channel: null,
    intake_channel_name: null,
    financement: null,
    financements: null,
    admission_member: '',
    payment_method: null,
    payment_methods: null,
    payment: null,
    is_deposit_paid: null,
    registration_profile_status: null,
    registration_profile_statuses: null,
    registration_profile: null,
    candidate_admission_status: null,
    candidate_admission_statuses: null,
    student_admission_steps: null,
    latest_previous_program: null,
    type_of_readmission: null,
    type_of_readmissions: null,
    announcement_email_date: '',
    last_reminder_date: '',
    date_readmission_assigned: '',
    jury_decision: null,
    jury_decisions: null,
    offset: moment().utcOffset(),
    registered_at: '',
    financial_situation: null,
    announcement_email_date_offset: null,
    payments: null,
    is_deposit_paids: null,
  };

  scholarSeasonFilter = new UntypedFormControl('All');
  schoolsFilter = new UntypedFormControl(null);
  campusesFilter = new UntypedFormControl(null);
  levelsFilter = new UntypedFormControl(null);
  sectorsFilter = new UntypedFormControl(null);
  specialitiesFilter = new UntypedFormControl(null);
  tagFilter = new UntypedFormControl(null);

  sigleFilter = new UntypedFormControl(null);
  studentNumberFilter = new UntypedFormControl(null);
  nameFilter = new UntypedFormControl(null);
  previousProgramFilter = new UntypedFormControl(null);
  readmissionProgramFilter = new UntypedFormControl(null);
  typeOfReadmissionFilter = new UntypedFormControl(null);
  statusFilter = new UntypedFormControl(null);
  juryFilter = new UntypedFormControl(null);
  registrationProfileFilter = new UntypedFormControl(null);
  readmissionEmailFilter = new UntypedFormControl(null);
  dateLastReminderFilter = new UntypedFormControl(null);
  paymentMethodFilter = new UntypedFormControl(null);
  downPaymentFilter = new UntypedFormControl(null);
  financementFilter = new UntypedFormControl(null);
  financialSituationFilter = new UntypedFormControl('All');
  conventionFilter = new UntypedFormControl(null);
  readmissionDateFilter = new UntypedFormControl(null);
  admissionMemberFilter = new UntypedFormControl(null);
  fcInChargeFilter = new UntypedFormControl(null);

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  shieldAccountIcon = '../../../../../assets/img/shield-account.png';
  maleIcon = '../../../../../assets/img/student_icon.png';
  femaleIcon = '../../../../../assets/img/student_icon_fem.png';
  sepaLogo = '../../../../../assets/img/sepa-wt-logo.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';

  searching = {
    continuous_formation_manager_id: '',
  };

  admissionNeedValidator = [];

  profileRateFilterList = [];
  rateList = [];
  backupProfileList: any;

  stepColumn = [];
  optionalStepColumns: any[];
  steps: any;
  optionalSteps: any;
  tempSteps: any;
  tempOptionalSteps: any;
  dataWithFilteredSteps: any = [];
  dataWithFilteredOptionalSteps: any = [];
  totalOptionalSteps: number;
  totalSteps: number;
  OriginStep: any;
  isCheckedAllDropdown = false;

  listStepSone = [
    {
      key: 'done',
      value: 'Done',
    },
    {
      key: 'not_done',
      value: 'Not Done',
    },
    {
      key: 'need_validation',
      value: 'Need Validation',
    },
  ];

  stepStatusList = [
    {
      value: 'reject_and_stop',
      display: 'Reject the process',
    },
    {
      value: 'ask_for_revision',
      display: 'Revision requested',
    },
    {
      value: 'accept',
      display: 'Validate',
    },
    {
      value: 'not_started',
      display: 'Not Started',
    },
    {
      value: 'need_validation',
      display: 'Need Validation',
    },
    {
      value: 'not_published',
      display: 'Empty',
    },
    {
      value: 'revision_completed',
      display: 'Revision Completed',
    },
  ];

  dummyStep = {};
  specilityList = [];
  sectorList = [];
  isDifferentAnnoucement = false;
  isHasRegistrationProfileandCallNotDone = false;
  dataUnselectUser = [];
  assignRateProfileDialogComponent: MatDialogRef<AssignRateProfileDialogComponent>;
  sendEmailValidatorDialogComponent: MatDialogRef<SendEmailValidatorDialogComponent>;
  sendMultipleEmailComponent: MatDialogRef<SendMultipleEmailComponent>;
  assignMemberFcDialogComponent: MatDialogRef<AssignMemberFcDialogComponent>;
  editJuryDecisionDialogComponent: MatDialogRef<EditJuryDecisionDialogComponent>;
  schoolName = '';
  isMultipleFilter = false;

  superFilter = {
    scholar_season: null,
    schools: null,
    campuses: null,
    levels: null,
    sectors: null,
    specialities: null,
    tags: null,
  };

  isDisabled = true;
  transferAdmissionDialogComponent: MatDialogRef<TransferAdmissionDialogComponent>;
  studentsData: any = [];
  isStepsFiltered = false;
  readmissionEmailList = [];

  tempDataFilter = {
    steps: [],
    registrationProfile: null,
  };

  filteredValuesAll = {
    schools: 'All',
    campuses: 'All',
    levels: 'All',
    sectors: 'All',
    specialities: 'All',
    sigle: 'All',
    nationality: 'All',
    type_of_readmissions: 'All',
    jury_decisions: 'All',
    announcement_email_date_offset: 'All',
    payment_methods: 'All',
    registration_profile: 'All',
    candidate_admission_statuses: 'All',
    registration_profile_statuses: 'All',
    down_payment: 'All',
    financements: 'All',
    '0': 'All',
    '1': 'All',
    '2': 'All',
    '3': 'All',
    '4': 'All',
    '5': 'All',
    '6': 'All',
    '7': 'All',
    '8': 'All',
    '9': 'All',
    '10': 'All',
    '11': 'All',
  };

  constructor(
    private translate: TranslateService,
    private financeService: FinancesService,
    private userService: AuthService,
    private candidatesService: CandidatesService,
    private utilService: UtilityService,
    public permission: PermissionService,
    public dialog: MatDialog,
    private admissionService: AdmissionEntrypointService,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    private router: Router,
    private ngZone: NgZone,
    private readmissionService: ReadmissionService,
    private httpClient: HttpClient,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.getDataScholarSeasons();
    this.getDataTypeOfFormation();
    this.initFilter();
    this.getAllProfileRate();
    this.getDataTags();
    this.getAllRegistrationProfileDropdown();
    this.sortingDropdownFilter();
    this.subs.sink = this.translate.onLangChange.subscribe((event) => {
      this.scholars = [];
      this.scholars = this.originalScholar.sort((a, b) =>
        a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
      );
      this.scholars.unshift({ _id: 'All', scholar_season: this.translate.instant('All') });
      this.scholars = _.uniqBy(this.scholars, '_id');
      this.sortingDropdownFilter();
      this.profileRateFilterList = [
        { _id: 'affected', name: this.translate.instant('affected') },
        { _id: 'not_affected', name: this.translate.instant('not_affected') },
        ...this.rateList,
      ];
      this.getCandidatesData('langChange');
    });
    this.pageTitleService.setTitle('NAV.Follow up');
  }

  getDataTags() {
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService.getAllTags(true, 'readmission', userTypesList, this.candidate_admission_statuses).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.tagList = resp;
          this.tagList = this.tagList.sort((a, b) => {
            if (this.utilService.simplifyRegex(a.name?.toLowerCase()) < this.utilService.simplifyRegex(b.name?.toLowerCase())) {
              return -1;
            } else if (this.utilService.simplifyRegex(a.name?.toLowerCase()) > this.utilService.simplifyRegex(b.name?.toLowerCase())) {
              return 1;
            } else {
              return 0;
            }
          });
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

  sortingDropdownFilter() {
    // Sort jury list decision dropdown
    this.juryList = this.juryList
      .sort((a, b) => this.translate.instant(a.value).toLowerCase().localeCompare(this.translate.instant(b.value).toLowerCase()))
      ?.map((list) => {
        return {
          ...list,
          label: this.translate.instant(list.value),
        };
      });

    // Sort status drodpdown
    this.studentStatusFilterList = this.studentStatusFilterList
      .map((list) => {
        return {
          ...list,
          label: this.translate.instant(list.key),
        };
      })
      ?.sort((a, b) => this.translate.instant(a.value).toLowerCase().localeCompare(this.translate.instant(b.value).toLowerCase()));
    this.typeOfReadmissionList = this.typeOfReadmissionList.map((list) => {
      return {
        ...list,
        label: this.translate.instant('READMISSION.' + list.key),
      };
    });
    this.paymentMethodFilterList = this.paymentMethodFilterList.map((data) => {
      return {
        ...data,
        label: this.translate.instant(data.key),
      };
    });
    this.DPFilterList = this.DPFilterList.map((list) => {
      return {
        ...list,
        label: this.translate.instant('DP_Status.' + list.value),
      };
    });
    this.financementFilterList = this.financementFilterList.map((list) => {
      return {
        ...list,
        label: this.translate.instant('Step_Statuses.' + list.key),
      };
    });
    this.listStepSone = this.listStepSone.map((list) => {
      return {
        ...list,
        label: this.translate.instant(list.value),
      };
    });
    this.studentStatusFilterList = this.studentStatusFilterList.sort((a, b) =>
      this.translate.instant(a.value).toLowerCase().localeCompare(this.translate.instant(b.value).toLowerCase()),
    );
    this.readmissionEmailList = [
      { label: 'Sent', value: 'sent', key: this.translate.instant('Sent') },
      { label: 'Not sent', value: 'not_sent', key: this.translate.instant('Not sent') },
      { label: 'Today', value: 'today', key: this.translate.instant('Today') },
      { label: 'Yesterday', value: 'yesterday', key: this.translate.instant('Yesterday') },
      { label: 'Last 7 days', value: 'last_7_days', key: this.translate.instant('Last 7 days') },
      { label: 'Last 30 days', value: 'last_30_days', key: this.translate.instant('Last 30 days') },
      { label: 'This month', value: 'this_month', key: this.translate.instant('This month') },
    ];
  }

  getCandidatesData(data) {
    // console.log('Reload Page', data);
    // need to get data for dynamic column
    this.stepColumn = [];
    this.totalSteps = 0;
    this.filterColumns = [];
    this.displayedColumns = [];

    this.setInitialTableColumn();

    this.dataSource.data = [];
    this.paginator.length = 0;
    this.dataCount = 0;
    this.isLoading = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();

    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.readmissionService
      .getAllCandidatesReadmission(pagination, this.sortValue, filter, this.searching, userTypesList)
      .subscribe(
        (students: any) => {
          // console.log('students', students);
          if (students && students.length) {
            const updated = _.cloneDeep(students);
            this.dataSource.data = _.cloneDeep(updated);
            this.paginator.length = students[0].count_document;
            this.dataCount = students[0].count_document;
            setTimeout(() => {
              this.setTableColumnwithStep(this.dataSource.data);
              this.isLoading = false;
            }, 80);
          } else {
            this.dataSource.data = [];
            this.paginator.length = 0;
            this.dataCount = 0;
            this.isLoading = true;
            setTimeout(() => {
              this.setTableColumnwithStep(this.dataSource.data);
              this.isLoading = false;
            }, 80);
          }
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isReset = false;
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

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('sortData');
      }
    }
  }

  cleanFilterData(from?) {
    this.filteredValues.readmission_status = 'readmission_table';
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    let schoolsMap;
    let levelsMap;
    let tagsMap;
    let sectorsMap;
    let specialitiesMap;
    let campusesMap;
    let candidateIdsMap;
    let financementMap;
    let paymentMethodMap;
    let typeOfReadmissionMap;
    let juryMap;
    let registrationProfileMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'scholar_season' ||
          key === 'candidate_unique_number' ||
          key === 'candidate' ||
          key === 'initial_intake_channel' ||
          key === 'intake_channel_name' ||
          key === 'latest_previous_program' ||
          key === 'announcement_email_date' ||
          key === 'last_reminder_date' ||
          key === 'date_readmission_assigned' ||
          key === 'admission_member' ||
          key === 'registered_at'
        ) {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        } else if (key === 'announcement_email_date_offset') {
          const dataKeyMap = filterData[key]?.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` ${key}:[${dataKeyMap}]`;
        } else if (key === 'registration_profile') {
          filterQuery = filterQuery + ` ${key}: ${JSON.stringify(this.registrationProfileFilter.value)}`;
        } else if (key === 'is_deposit_paids') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'payments') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'candidate_ids') {
          candidateIdsMap = filterData.candidate_ids.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` candidate_ids:[${candidateIdsMap}]`;
        } else if (key === 'schools') {
          schoolsMap = filterData.schools.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` schools:[${schoolsMap}]`;
        } else if (key === 'levels') {
          levelsMap = filterData.levels.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` levels:[${levelsMap}]`;
        } else if (key === 'tags') {
          tagsMap = filterData.tags.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` tags:[${tagsMap}]`;
        } else if (key === 'sectors') {
          sectorsMap = filterData.sectors.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` sectors:[${sectorsMap}]`;
        } else if (key === 'specialities') {
          specialitiesMap = filterData.specialities.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` specialities:[${specialitiesMap}]`;
        } else if (key === 'campuses') {
          campusesMap = filterData.campuses.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` campuses:[${campusesMap}]`;
        } else if (key === 'financements') {
          financementMap = filterData.financements.map((res) => res);
          filterQuery = filterQuery + ` financements:[${financementMap}]`;
        } else if (key === 'payment_methods') {
          paymentMethodMap = filterData.payment_methods.map((res) => res);
          filterQuery = filterQuery + ` payment_methods:[${paymentMethodMap}]`;
        } else if (key === 'type_of_readmissions') {
          typeOfReadmissionMap = filterData.type_of_readmissions.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` type_of_readmissions:[${typeOfReadmissionMap}]`;
        } else if (key === 'sigle') {
          const sigleMap = filterData.sigle.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` sigles:[${sigleMap}]`;
        } else if (key === 'jury_decisions') {
          juryMap = filterData.jury_decisions.map((res) => res);
          filterQuery = filterQuery + ` jury_decisions:[${juryMap}]`;
        } else if (key === 'registration_profile_stasuses') {
          registrationProfileMap = filterData.registration_profile_stasuses.map((res) => res);
          filterQuery = filterQuery + ` registration_profile_stasuses:[${registrationProfileMap}]`;
        } else if (
          key === 'candidate_admission_statuses' ||
          (key === 'registration_profile_statuses' && from!=='getUpdatedData') ||
          key === 'is_deposit_paid' ||
          key === 'payment'
        ) {
          const currKey = key === 'is_deposit_paid' ? 'is_deposit_paids' : key === 'payment' ? 'payments' : key;
          filterQuery = filterQuery + ` ${currKey}:[${filterData[key]}]`;
        } else if (key === 'registration_profile') {
          const dataKeyMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` ${key}:[${dataKeyMap}]`;
        } else if (key === 'student_admission_steps') {
          let filterSteps = JSON.stringify(filterData[key]);
          this.filteredValues.student_admission_steps.forEach((element) => {
            if (filterSteps.includes(`"step"`)) {
              filterSteps = filterSteps.replace(`"step"`, 'step');
            }
            if (filterSteps.includes(`"statuses"`)) {
              filterSteps = filterSteps.replace(`"statuses"`, 'statuses');
            }
            if (filterSteps.includes(`"done"`)) {
              filterSteps = filterSteps.replace(`"done"`, 'done');
            }
            if (filterSteps.includes(`"empty"`)) {
              filterSteps = filterSteps.replace(`"empty"`, 'empty');
            }
            if (filterSteps.includes(`"not_done"`)) {
              filterSteps = filterSteps.replace(`"not_done"`, 'not_done');
            }
            if (filterSteps.includes(`"need_validation"`)) {
              filterSteps = filterSteps.replace(`"need_validation"`, 'need_validation');
            }
            if (filterSteps.includes(`"ask_for_revision"`)) {
              filterSteps = filterSteps.replace(`"ask_for_revision"`, 'ask_for_revision');
            }
            if (filterSteps.includes(`"reject_and_stop"`)) {
              filterSteps = filterSteps.replace(`"reject_and_stop"`, 'reject_and_stop');
            }
            if (filterSteps.includes(`"step_type_selected"`)) {
              filterSteps = filterSteps.replace(`"step_type_selected"`, 'step_type_selected');
            }
            if (filterSteps.includes(`"mandatory"`)) {
              filterSteps = filterSteps.replace(`"mandatory"`, 'mandatory');
            }
            if (filterSteps.includes(`"option"`)) {
              filterSteps = filterSteps.replace(`"option"`, 'option');
            }
          });
          filterQuery = filterQuery + ` ${key}:${filterSteps}`;
        } else if((key !== 'registration_profile_statuses')){
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        }
      }
    });
    // console.log(filterQuery);
    // console.log('ihiyyyy', 'filter: {' + filterQuery + '}')
    return 'filter: {' + filterQuery + '}';
  }

  cleanFilterDataExport() {
    const filterData = _.cloneDeep(this.filteredValues);
    let schoolsMap;
    let levelsMap;
    let tagsMap;
    let campusesMap;
    let specialitiesMap;
    let sectorsMap;
    let registrationProfileMap;
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'scholar_season' ||
          key === 'candidate_unique_number' ||
          key === 'candidate' ||
          key === 'initial_intake_channel' ||
          key === 'latest_previous_program' ||
          key === 'intake_channel_name' ||
          key === 'readmission_status' ||
          key === 'candidate_admission_status' ||
          key === 'announcement_email_date' ||
          key === 'last_reminder_date' ||
          key === 'registered_at' ||
          key === 'payment_method' ||
          key === 'is_deposit_paid' ||
          key === 'financial_situation' ||
          key === 'admission_member' ||
          key === 'registration_profile_status'
        ) {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        } else if (key === 'announcement_email_date_offset') {
          const dataMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${dataMap}]` : filterQuery + `"${key}":[${dataMap}]`;
        } else if (key === 'is_deposit_paids') {
          const depositPaid = filterData.is_deposit_paids.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"is_deposit_paids":[${depositPaid}]`
            : filterQuery + `"is_deposit_paids":[${depositPaid}]`;
        } else if (key === 'payments') {
          const paymentMap = filterData.payments.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"payments":[${paymentMap}]` : filterQuery + `"payments":[${paymentMap}]`;
        } else if (key === 'registration_profile') {
          registrationProfileMap = filterData.registration_profile.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"registration_profile":[${registrationProfileMap}]`
            : filterQuery + `"registration_profile":[${registrationProfileMap}]`;
        } else if (key === 'schools') {
          schoolsMap = filterData.schools.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"schools":[${schoolsMap}]` : filterQuery + `"schools":[${schoolsMap}]`;
        } else if (key === 'levels') {
          levelsMap = filterData.levels.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"levels":[${levelsMap}]` : filterQuery + `"levels":[${levelsMap}]`;
        } else if (key === 'tags') {
          tagsMap = filterData.tags.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"tags":[${tagsMap}]` : filterQuery + `"tags":[${tagsMap}]`;
        } else if (key === 'sectors') {
          sectorsMap = filterData.sectors.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"sectors":[${sectorsMap}]` : filterQuery + `"sectors":[${sectorsMap}]`;
        } else if (key === 'specialities') {
          specialitiesMap = filterData.specialities.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"specialities":[${specialitiesMap}]`
            : filterQuery + `"specialities":[${specialitiesMap}]`;
        } else if (key === 'campuses') {
          campusesMap = filterData.campuses.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"campuses":[${campusesMap}]` : filterQuery + `"campuses":[${campusesMap}]`;
        } else if (key === 'student_admission_steps') {
          const filterSteps = JSON.stringify(filterData[key]);
          filterQuery = filterQuery ? filterQuery + ',' + ` "${key}":${filterSteps}` : filterQuery + ` "${key}":${filterSteps}`;
        } else if (
          key === 'sigle' ||
          key === 'candidate_admission_statuses' ||
          key === 'jury_decisions' ||
          key === 'type_of_readmissions' ||
          key === 'registration_profile_statuses' ||
          key === 'payment_methods' ||
          key === 'payment' ||
          key === 'is_deposit_paid' ||
          key === 'financements'
        ) {
          const dataMap = filterData[key].map((res) => `"` + res + `"`);
          const keyValue =
            key === 'sigle' ? 'sigles' : key === 'payment' ? 'payments' : key === 'is_deposit_paid' ? 'is_deposit_paids' : key;
          filterQuery = filterQuery ? filterQuery + ',' + `"${keyValue}":[${dataMap}]` : filterQuery + `"${keyValue}":[${dataMap}]`;
        } else {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${filterData[key]}` : filterQuery + `"${key}":${filterData[key]}`;
        }
      }
    });
    return '"filter":{' + filterQuery + '}';
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset && !this.isFirstLoad) {
            this.getCandidatesData('AfterViewInit');
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
    this.subs.sink = this.ngZone.onMicrotaskEmpty.pipe(bufferCount(50), take(3)).subscribe((resp) => {
      this.table.updateStickyColumnStyles();
    });
  }

  cleanSelection() {
    this.disabledExport = true;
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
  }

  initFilter() {
    // start superfilter
    this.subs.sink = this.scholarSeasonFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.levels = '';
      this.superFilter.campuses = '';
      this.superFilter.schools = '';
      this.superFilter.scholar_season = statusSearch === '' || statusSearch === 'All' ? '' : statusSearch;
    });

    this.subs.sink = this.schoolsFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.levels = '';
      this.superFilter.campuses = '';
      this.superFilter.schools = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    this.subs.sink = this.campusesFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.levels = '';
      this.superFilter.campuses = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    this.subs.sink = this.levelsFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.levels = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    this.subs.sink = this.sectorsFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.sectors = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    this.subs.sink = this.specialitiesFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.specialities = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    this.subs.sink = this.tagFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.tags = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
      if (statusSearch) {
        this.isDisabled = false;
      }
    });
    // start superfilter

    this.subs.sink = this.sigleFilter.valueChanges.subscribe((statusSearch) => {
      this.isMultipleFilter = true;
    });

    this.subs.sink = this.studentNumberFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        this.filteredValues.candidate_unique_number = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('studentNumberFilter');
        }
      } else {
        this.filteredValues.candidate_unique_number = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('studentNumberFilter');
        }
      }
    });

    this.subs.sink = this.nameFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        this.filteredValues.candidate = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('nameFilter');
        }
      } else {
        this.filteredValues.candidate = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('nameFilter');
        }
      }
    });

    this.subs.sink = this.previousProgramFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        this.filteredValues.latest_previous_program = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('previousProgramFilter');
        }
      } else {
        this.filteredValues.latest_previous_program = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('previousProgramFilter');
        }
      }
    });

    this.subs.sink = this.readmissionProgramFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        this.filteredValues.intake_channel_name = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('readmissionProgramFilter');
        }
      } else {
        this.filteredValues.intake_channel_name = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('readmissionProgramFilter');
        }
      }
    });

    this.subs.sink = this.financementFilter.valueChanges.subscribe((statusSearch) => {
      this.isMultipleFilter = true;
    });

    this.subs.sink = this.readmissionEmailFilter.valueChanges.subscribe((filter) => {
      this.isMultipleFilter = true;
    });
    this.subs.sink = this.financialSituationFilter.valueChanges.subscribe((status) => {
      this.filteredValues.financial_situation = status && status !== 'All' ? status : null;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('juryFilter');
      }
    });

    this.subs.sink = this.dateLastReminderFilter.valueChanges.pipe(debounceTime(400)).subscribe((filter) => {
      if (filter) {
        const newDate = moment(filter).format('DD/MM/YYYY');
        this.filteredValues.last_reminder_date = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('readmissioEmailFilter');
        }
      }
    });

    this.subs.sink = this.conventionFilter.valueChanges.subscribe((statusSearch) => {
      if (statusSearch) {
        this.paginator.pageIndex = 0;
      } else {
        this.paginator.pageIndex = 0;
      }
    });

    this.subs.sink = this.readmissionDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      console.log('value change readmision date', this.readmissionDateFilter.value);
      if (statusSearch) {
        const newDate = moment(statusSearch).format('DD/MM/YYYY');
        this.filteredValues.registered_at = newDate;
        this.getCandidatesData('readmissionDateFilter');
        this.paginator.pageIndex = 0;
      } else {
        this.filteredValues.registered_at = '';
        this.paginator.pageIndex = 0;
        this.getCandidatesData('readmissionDateFilter');
      }
    });

    this.subs.sink = this.admissionMemberFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        this.clearSelectIfFilter();
        this.filteredValues.admission_member = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('admissionMember');
        }
      } else {
        this.filteredValues.admission_member = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('admissionMember');
        }
      }
    });

    this.subs.sink = this.fcInChargeFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        this.searching.continuous_formation_manager_id = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('admissionMember');
        }
      } else {
        this.searching.continuous_formation_manager_id = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('admissionMember');
        }
      }
    });

    this.subs.sink = this.dateLastReminderFilter.valueChanges.pipe(debounceTime(400)).subscribe((filter) => {
      console.log('value change', this.dateLastReminderFilter.value);
      if (filter) {
        const newDate = moment(filter).format('DD/MM/YYYY');
        this.filteredValues.last_reminder_date = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('dateLastReminderFilter');
        }
      }
    });

    this.subs.sink = this.paymentMethodFilter.valueChanges.subscribe((filter) => {
      this.isMultipleFilter = true;
    });

    this.subs.sink = this.downPaymentFilter.valueChanges.subscribe((statusSearch) => {
      this.isMultipleFilter = true;
    });

    this.subs.sink = this.typeOfReadmissionFilter.valueChanges.subscribe((filter) => {
      this.isMultipleFilter = true;
    });

    this.subs.sink = this.statusFilter.valueChanges.subscribe((statusSearch) => {
      this.isMultipleFilter = true;
    });

    this.subs.sink = this.juryFilter.valueChanges.subscribe((statusSearch) => {
      this.isMultipleFilter = true;
    });
    this.subs.sink = this.registrationProfileFilter.valueChanges.subscribe((search) => {
      this.isMultipleFilter = true;
    });
  }

  setJuryFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.subs.sink = this.juryFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.jury_decisions = statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('juryFilter');
      }
    });
  }

  setTypeOfReadmissionFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.subs.sink = this.typeOfReadmissionFilter.valueChanges.subscribe((filter) => {
      this.filteredValues.type_of_readmissions = filter;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('typeOfReadmissionFilter');
      }
    });
  }

  setPaymentMethodFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.subs.sink = this.paymentMethodFilter.valueChanges.subscribe((filter) => {
      this.filteredValues.payment_methods = filter;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('paymentMethodFilter');
      }
    });
  }

  setFinancementFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.subs.sink = this.financementFilter.valueChanges.subscribe((statusSearch) => {
      if (statusSearch) {
        this.filteredValues.financements = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('financementFilter');
        }
      } else {
        this.filteredValues.financements = null;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('financementFilter');
        }
      }
    });
  }

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.originalScholar = _.cloneDeep(resp);
          this.scholars = [];
          this.scholars = this.originalScholar.sort((a, b) =>
            a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
          );
          this.scholars.unshift({ _id: 'All', scholar_season: this.translate.instant('All') });
          this.scholars = _.uniqBy(this.scholars, '_id');

          const currentYear = new Date().getFullYear().toString().substring(2);
          this.currScholarSeason = this.scholars.find((scholarSeasons) => scholarSeasons.scholar_season.includes(currentYear + '-'));
          this.scholarSeasonFilter.patchValue(this.currScholarSeason?._id,{emitEvent:false})
          const scholarSeason = this.scholarSeasonFilter.value && this.scholarSeasonFilter.value !== 'All' ? this.scholarSeasonFilter.value : '';
          this.superFilter.scholar_season = scholarSeason
          this.filteredValues.scholar_season = scholarSeason
          this.getDataForList(scholarSeason);
        }
        this.getCandidatesData('first init');
        this.isFirstLoad = false
      },
      (err) => {
        this.userService.postErrorLog(err);
        this.getCandidatesData('first init');
        this.isFirstLoad = false
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

  scholarSelect() {
    this.schools = [];
    this.campuses = [];
    this.levels = [];
    this.sectorList = [];
    this.specilityList = [];

    if (this.schoolsFilter.value) {
      this.schoolsFilter.setValue(null);
    }
    if (this.campusesFilter.value) {
      this.campusesFilter.setValue(null);
    }
    if (this.levelsFilter.value) {
      this.levelsFilter.setValue(null);
    }
    if (this.sectorsFilter.value) {
      this.sectorsFilter.setValue(null);
    }
    if (this.specialitiesFilter.value) {
      this.specialitiesFilter.setValue(null);
    }

    if (!this.scholarSeasonFilter.value || this.scholarSeasonFilter.value.length === 0) {
      this.superFilter.scholar_season = '';
    } else {
      this.superFilter.scholar_season =
        this.scholarSeasonFilter.value && this.scholarSeasonFilter.value !== 'All' ? this.scholarSeasonFilter.value : null;
      const scholarSeason =
        this.scholarSeasonFilter.value && this.scholarSeasonFilter.value !== 'All' ? this.scholarSeasonFilter.value : '';
      this.getDataForList(scholarSeason);
      // this.getDataReadmission('scholars Filter');
    }
  }

  getDataForList(data?) {
    // console.log(data);
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
            this.schools = this.listObjective;
            this.schools = this.schools.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0));
          } else {
            /* tambahkkan */
            this.listObjective = resp;
            this.schools = this.listObjective;
            this.schools = this.schools.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0));
          }
          // this.getDataCampus();
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
    const form = this.campusesFilter.value;
    if (form && form.length) {
      this.campusesFilter.patchValue(form);
    } else {
      this.campusesFilter.patchValue(null);
    }
    this.getDataLevel();
  }
  checkSuperFilterLevel() {
    const form = this.levelsFilter.value;
    if (form && form.length) {
      this.levelsFilter.patchValue(form);
    } else {
      this.levelsFilter.patchValue(null);
    }
    this.getDataSectorByLevel();
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

  checkSuperFilterTags() {
    const form = this.tagFilter.value;
    if (form && form.length) {
      this.tagFilter.patchValue(form);
    } else {
      this.tagFilter.patchValue(null);
    }
  }

  getDataCampus() {
    this.levels = [];
    this.campuses = [];
    this.sectorList = [];
    this.specilityList = [];

    if (this.campusesFilter.value) {
      this.campusesFilter.setValue(null);
    }
    if (this.levelsFilter.value) {
      this.levelsFilter.setValue(null);
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
      school &&
      school.length
    ) {
      if (school && !school.includes('All') && this.schools && this.schools.length) {
        school.forEach((element) => {
          const sName = this.schools.find((list) => list._id === element);
          this.schoolName = this.schoolName ? this.schoolName + ',' + sName.short_name : sName.short_name;
        });
      }
      this.currentUser.app_data.school_package.forEach((element) => {
        if (element && element.school && element.school._id && (school.includes(element.school._id) || school.includes('All'))) {
          this.campuses = _.concat(this.campuses, element.school.campuses);
        }
      });

      // tambahkan
    } else if (school && !school.includes('All') && this.listObjective && this.listObjective.length) {
      const scampusList = this.listObjective.filter((list) => {
        return school.includes(list._id);
      });
      scampusList.filter((campus, n) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campusess, nex) => {
            this.campuses.push(campusess);
            // this.campusesBackup = this.campuses;
          });
        }
      });
      // console.log('scampusList', scampusList, school, this.listObjective);
    } else {
      if (
        school &&
        this.currentUser &&
        this.currentUser.app_data &&
        this.currentUser.app_data.campus &&
        this.currentUser.app_data.campus.length &&
        this.listObjective &&
        this.listObjective.length
      ) {
        this.currentUser.app_data.campus.forEach((element) => {
          this.listObjective.filter((campus, n) => {
            if (campus.campuses && campus.campuses.length) {
              campus.campuses.filter((campuses, nex) => {
                if (campuses && element && element.name && campuses.name.toLowerCase() === element.name.toLowerCase()) {
                  this.campuses.push(campuses);
                }
              });
            }
          });
        });
      } else if (school && school.includes('All') && this.listObjective && this.listObjective.length) {
        this.listObjective.forEach((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.forEach((campusess, nex) => {
              this.campuses.push(campusess);
            });
          }
        });
      } else {
        this.campuses = [];
      }
    }

    this.getDataLevel();
    const campuses = _.chain(this.campuses)
      .groupBy('name')
      .map((value, key) => ({
        name: key,
        _id: value && value.length ? value[0]._id : null,
        campuses: value,
      }))
      .value();
    if (campuses && campuses.length) {
      campuses.forEach((element, idx) => {
        let levelList = [];
        if (element && element.campuses && element.campuses.length) {
          element.campuses.forEach((camp, idCampx) => {
            levelList = _.concat(levelList, camp.levels);
          });
        }
        campuses[idx]['levels'] = _.uniqBy(levelList, 'name');
      });
    }
    this.campuses = _.uniqBy(campuses, '_id');
    this.campuses = this.campuses.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }

  getDataLevel() {
    this.levels = [];
    this.sectorList = [];
    this.specilityList = [];
    if (this.levelsFilter.value) {
      this.levelsFilter.setValue(null);
    }
    if (this.sectorsFilter.value) {
      this.sectorsFilter.setValue(null);
    }
    if (this.specialitiesFilter.value) {
      this.specialitiesFilter.setValue(null);
    }
    const schools = this.schoolsFilter.value;
    const sCampus = this.campusesFilter.value;

    if (
      this.currentUser &&
      this.currentUser.entities &&
      this.currentUser.entities.length &&
      this.currentUser.app_data &&
      this.currentUser.app_data.school_package &&
      this.currentUser.app_data.school_package.length &&
      this.campusesFilter.value &&
      this.campusesFilter.value.length &&
      schools
    ) {
      if (sCampus && sCampus.length && !sCampus.includes('All')) {
        this.currentUser.app_data.school_package.forEach((element) => {
          if (
            element &&
            element.school &&
            element.school._id &&
            (schools.includes(element.school._id) || schools.includes('All')) &&
            this.campuses &&
            this.campuses.length
          ) {
            const sLevelList = this.campuses.filter((list) => {
              return sCampus.includes(list._id);
            });

            sLevelList.forEach((lev) => {
              if (lev && lev.levels && lev.levels.length) {
                this.levels = _.concat(this.levels, lev.levels);
              }
            });
          }
        });
      } else if (sCampus && sCampus.includes('All') && this.campuses && this.campuses.length) {
        this.campuses.forEach((lev) => {
          if (lev && lev.levels && lev.levels.length) {
            this.levels = _.concat(this.levels, lev.levels);
          }
        });
      }
    } else {
      if (schools && sCampus && !sCampus.includes('All') && this.campuses && this.campuses.length) {
        const sLevelList = this.campuses.filter((list) => {
          return sCampus.includes(list._id);
        });
        sLevelList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
            });
          }
        });
      } else if (sCampus && sCampus.includes('All') && this.campuses && this.campuses.length) {
        this.campuses.forEach((element) => {
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

  getDataByLevel() {}

  clearSelectIfFilter() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
  }

  refetchDataKeepFilter() {
    this.clearSelectIfFilter();
    this.getCandidatesData('reset');
  }

  resetTable() {
    this.isReset = true;
    this.isCheckedAll = false;
    this.isMultipleFilter = false;
    this.isCheckedAllDropdown = false;
    this.isStepsFiltered = false;
    this.selection.clear();
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.dataUnselectUser = [];
    this.selectType = '';
    this.paginator.pageIndex = 0;
    this.sortValue = null;
    this.allStudentForCheckbox = [];
    this.allAnnoucmentForCheckbox = [];
    this.allCallForCheckbox = [];
    this.allCRMForCheckbox = [];
    this.allEmailForCheckbox = [];
    this.allMemberForCheckbox = [];
    this.allExportForCheckbox = [];
    this.allJuryForCheckbox = [];
    this.allReminderForCheckbox = [];
    this.allCandidateData = [];
    this.filteredValues = {
      scholar_season: null,
      schools: null,
      campuses: null,
      levels: null,
      tags: null,
      sectors: null,
      specialities: null,
      readmission_status: null,
      sigle: null,
      candidate_unique_number: null,
      candidate: null,
      initial_intake_channel: null,
      intake_channel_name: null,
      payment_method: null,
      payment_methods: null,
      payment: null,
      is_deposit_paid: null,
      admission_member: null,
      financement: null,
      financements: null,
      registration_profile: null,
      registration_profile_status: null,
      registration_profile_statuses: null,
      candidate_admission_status: null,
      candidate_admission_statuses: null,
      student_admission_steps: null,
      latest_previous_program: null,
      type_of_readmission: null,
      type_of_readmissions: null,
      announcement_email_date: '',
      last_reminder_date: '',
      date_readmission_assigned: '',
      jury_decision: null,
      jury_decisions: null,
      offset: moment().utcOffset(),
      registered_at: '',
      financial_situation: null,
      announcement_email_date_offset: null,
      payments: null,
      is_deposit_paids: null,
    };
    this.superFilter = {
      scholar_season: null,
      schools: null,
      campuses: null,
      levels: null,
      sectors: null,
      specialities: null,
      tags: null,
    };
    this.searching = {
      continuous_formation_manager_id: '',
    };
    this.filterBreadcrumbData = [];
    this.scholarSeasonFilter.setValue(this.currScholarSeason?._id);
    this.schoolsFilter.setValue(null);
    this.tagFilter.setValue('');
    this.campusesFilter.setValue(null);
    this.levelsFilter.setValue(null);
    this.sectorsFilter.setValue(null);
    this.specialitiesFilter.setValue(null);

    this.sigleFilter.setValue(null, { emitEvent: false });
    this.juryFilter.setValue(null, { emitEvent: false });
    this.studentNumberFilter.setValue(null, { emitEvent: false });
    this.nameFilter.setValue(null, { emitEvent: false });
    this.previousProgramFilter.setValue(null, { emitEvent: false });
    this.readmissionProgramFilter.setValue(null, { emitEvent: false });
    this.typeOfReadmissionFilter.setValue(null, { emitEvent: false });
    this.statusFilter.setValue(null, { emitEvent: false });
    this.registrationProfileFilter.setValue(null, { emitEvent: false });
    this.readmissionEmailFilter.setValue(null, { emitEvent: false });
    this.dateLastReminderFilter.setValue(null, { emitEvent: false });
    this.paymentMethodFilter.setValue(null, { emitEvent: false });
    this.downPaymentFilter.setValue(null, { emitEvent: false });
    this.financementFilter.setValue(null, { emitEvent: false });
    this.conventionFilter.setValue(null, { emitEvent: false });
    this.readmissionDateFilter.setValue(null, { emitEvent: false });
    this.admissionMemberFilter.setValue(null, { emitEvent: false });
    this.fcInChargeFilter.setValue(null, { emitEvent: false });
    this.juryFilter.setValue(null, { emitEvent: false });
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.financialSituationFilter.setValue('All', { emitEvent: false });

    this.schools = [];
    this.campuses = [];
    this.levels = [];
    this.sectorList = [];
    this.specilityList = [];

    const scholarSeason = this.scholarSeasonFilter.value && this.scholarSeasonFilter.value !== 'All' ? this.scholarSeasonFilter.value : '';
    this.superFilter.scholar_season = scholarSeason
    this.filteredValues.scholar_season = scholarSeason
    this.getDataForList(scholarSeason);
    this.getCandidatesData('reset');
    this.isDisabled = true;
  }

  getAllProfileRate() {
    this.subs.sink = this.financeService.GetListProfileRatesForSameData().subscribe(
      (res) => {
        if (res) {
          this.listRegistrationProfile = res;
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

  openAssignRateProfile(data, type) {
    this.isEmailSent = false;
    // console.log('openAssignRateProfile', this.selection.selected, type, this.dataSelected);
    if (this.dataSelected && this.dataSelected.length) {
      const candidateProfile = this.dataSelected.filter((list) => {
        if (list.registration_profile !== null) {
          return list;
        }
      });
      if (candidateProfile.length < 1) {
        this.isEmailSent = false;
      } else {
        this.isEmailSent = true;
      }
    } else {
      this.isEmailSent = true;
    }
    const mappedData = this.dataSelected.filter((list) => list.intake_channel).map((res) => res.intake_channel._id);
    const found = [];

    if (this.listRegistrationProfile.length > 0) {
      // Mapped data for get each
      mappedData.forEach((res, index) => {
        const foundedProgram = [];
        this.listRegistrationProfile.filter((elements) => {
          elements.programs.find((element) => {
            if (element._id === res) {
              foundedProgram.push(elements._id);
            }
          });
        });
        found.push(foundedProgram);
      });
      this.isSameData = true;
      let result;
      found.forEach((element, index) => {
        if (found.length > 1) {
          if (found.length - 1 !== index) {
            result = found[0].some((res) => found[index + 1].includes(res));
            if (!result) {
              result = false;
              this.isSameData = false;
              return;
            } else {
            }
          }
        } else {
          result = true;
        }
      });
    }
    let isFSRed = false;
    if (type === 'one' && data) {
      isFSRed = data?.financial_situation === 'not_ok' ? true : false;
    } else if (this.dataSelected?.length) {
      const checkFS = this.dataSelected?.filter((element) => element?.financial_situation === 'not_ok');
      isFSRed = checkFS?.length ? true : false;
    }

    if (
      ((this.selectType === 'one' && this.dataSelected.length) || type !== 'button' || this.selectType === 'all' || !this.selectType) &&
      !this.isWasSelectAll
    ) {
      // console.log('yes 1');
      if (type === 'button' && this.dataSelected.length < 1) {
        // console.log('yes 2');
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Followup_S8.Title'),
          html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
          confirmButtonText: this.translate.instant('Followup_S8.Button'),
        });
      } else if (type === 'button' && this.isEmailSent) {
        // console.log('yes 3');
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Followup_S9.Title'),
          html: this.translate.instant('Followup_S9.Text'),
          confirmButtonText: this.translate.instant('Followup_S9.Button'),
        });
      } else {
        console.log('yes 5');
        const candidate = [];
        candidate.push(data);

        if (type === 'button' && this.dataSelected && this.dataSelected.length > 0) {
          const mapped = this.dataSelected.map((res) => {
            let isVolumeOfHours = false;
            if (res && res.type_of_formation_id && res.type_of_formation_id.type_of_formation !== 'classic') {
              isVolumeOfHours = true;
            }
            return {
              ...res,
              isVolumeOfHours,
            };
          });
          // console.log('_map', mapped);

          this.dataSelected[0]['isVolumeOfHours'] = true;
        } else if (candidate && candidate.length > 0) {
          candidate[0]['isVolumeOfHours'] = true;
        }
        const dataSchool = this.dataSelected.filter((list) => list.school && list.school._id).map((list) => list.school._id);
        const dataCampus = this.dataSelected.filter((list) => list.campus && list.campus._id).map((list) => list.campus._id);
        const dataLevel = this.dataSelected.filter((list) => list.level && list.level._id).map((list) => list.level._id);
        const dataSector = this.dataSelected.filter((list) => list.sector && list.sector._id).map((list) => list.sector._id);
        const dataSpeciality = this.dataSelected
          .filter((list) => list.speciality && list.speciality._id)
          .map((list) => list.speciality._id);
        const scholar = this.dataSelected
          .filter((list) => list.intake_channel && list.intake_channel.scholar_season_id && list.intake_channel.scholar_season_id._id)
          .map((list) => list.intake_channel.scholar_season_id._id);
        const filter = {
          school_ids: _.uniqBy(dataSchool),
          campus_ids: _.uniqBy(dataCampus),
          level_ids: _.uniqBy(dataLevel),
          scholar_season_ids: _.uniqBy(scholar),
          sector_ids: _.uniqBy(dataSector),
          speciality_ids: _.uniqBy(dataSpeciality),
        };
        this.isWaitingForResponse = true;
        this.subs.sink = this.financeService.GetListProfileRates(filter).subscribe(
          (list) => {
            this.isWaitingForResponse = false;
            if (list && list.length) {
              const response = _.cloneDeep(list);
              const readmissionData = response.filter((ListResp) => ListResp.is_readmission);
              // const admissionData = response.filter((ListResp) => ListResp.is_admission);
              if (readmissionData && readmissionData.length < 1) {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('Followup_S10.Title'),
                  html: this.translate.instant('Followup_S10.Text'),
                  confirmButtonText: this.translate.instant('Followup_S10.Button'),
                });
                return;
              } else {
                if (type === 'one' && isFSRed) {
                  Swal.fire({
                    type: 'warning',
                    title: this.translate.instant('ReAdmission_S11.TITLE'),
                    html: this.translate.instant('ReAdmission_S11.TEXT'),
                    confirmButtonText: this.translate.instant('ReAdmission_S11.BUTTON1'),
                    cancelButtonText: this.translate.instant('ReAdmission_S11.BUTTON2'),
                    showCancelButton: true,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                  }).then((confirm) => {
                    if (confirm.value) {
                      this.assignRateProfileDialogComponent = this.dialog.open(AssignRateProfileDialogComponent, {
                        width: '600px',
                        minHeight: '100px',
                        panelClass: 'certification-rule-pop-up',
                        disableClose: true,
                        data: {
                          selected: this.dataSelected && this.dataSelected.length ? this.dataSelected : candidate,
                          from: 'readmission',
                          isVolumeOfHours: true,
                        },
                      });
                      this.subs.sink = this.assignRateProfileDialogComponent.afterClosed().subscribe((result) => {
                        if (result) {
                          if (result.send) {
                            this.sendAnnoucment(result.candidate);
                            this.disabledExport = true;
                            this.isCheckedAll = false;
                            this.selection.clear();
                            this.dataSelected = [];
                          } else {
                            this.refetchDataKeepFilter();
                          }
                          this.assignRateProfileDialogComponent = null;
                        }
                      });
                    }
                  });
                } else if (isFSRed && type === 'button') {
                  Swal.fire({
                    type: 'warning',
                    title: this.translate.instant('ReAdmission_S12.TITLE'),
                    html: this.translate.instant('ReAdmission_S12.TEXT'),
                    confirmButtonText: this.translate.instant('ReAdmission_S12.BUTTON1'),
                    cancelButtonText: this.translate.instant('ReAdmission_S12.BUTTON2'),
                    showCancelButton: true,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                  }).then((confirm) => {
                    if (confirm.value) {
                      this.assignRateProfileDialogComponent = this.dialog.open(AssignRateProfileDialogComponent, {
                        width: '600px',
                        minHeight: '100px',
                        panelClass: 'certification-rule-pop-up',
                        disableClose: true,
                        data: {
                          selected: this.dataSelected && this.dataSelected.length ? this.dataSelected : candidate,
                          from: 'readmission',
                          isVolumeOfHours: true,
                        },
                      });
                      this.subs.sink = this.assignRateProfileDialogComponent.afterClosed().subscribe((result) => {
                        if (result) {
                          if (result.send) {
                            this.sendAnnoucment(result.candidate);
                            this.disabledExport = true;
                            this.isCheckedAll = false;
                            this.selection.clear();
                            this.dataSelected = [];
                          } else {
                            this.refetchDataKeepFilter();
                          }
                          this.assignRateProfileDialogComponent = null;
                        }
                      });
                    }
                  });
                } else {
                  this.assignRateProfileDialogComponent = this.dialog.open(AssignRateProfileDialogComponent, {
                    width: '600px',
                    minHeight: '100px',
                    panelClass: 'certification-rule-pop-up',
                    disableClose: true,
                    data: {
                      selected: this.dataSelected && this.dataSelected.length ? this.dataSelected : candidate,
                      from: 'readmission',
                      isVolumeOfHours: true,
                    },
                  });
                  this.subs.sink = this.assignRateProfileDialogComponent.afterClosed().subscribe((result) => {
                    if (result) {
                      if (result.send) {
                        this.sendAnnoucment(result.candidate);
                        this.disabledExport = true;
                        this.isCheckedAll = false;
                        this.selection.clear();
                        this.dataSelected = [];
                      } else {
                        this.refetchDataKeepFilter();
                      }
                      this.assignRateProfileDialogComponent = null;
                    }
                  });
                }
              }
            } else {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('Followup_S10.Title'),
                html: this.translate.instant('Followup_S10.Text'),
                confirmButtonText: this.translate.instant('Followup_S10.Button'),
              });
              this.refetchDataKeepFilter();
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            this.userService.postErrorLog(err);
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      }
    } else {
      this.assignAllRegistrationProfile(this.dataSelected, type, isFSRed);
    }
  }

  assignAllRegistrationProfile(data, type, isFSRed) {
    if (data && data.length) {
      const candidateProfile = data.filter((list) => {
        if (list.registration_profile === null) {
          return list;
        }
      });
      if (candidateProfile.length === data.length) {
        this.isEmailSent = false;
      } else {
        this.isEmailSent = true;
      }
    } else {
      this.isEmailSent = true;
    }
    const mappedData = data.map((res) => res.intake_channel._id);
    const found = [];

    if (this.listRegistrationProfile.length > 0) {
      // Mapped data for get each
      mappedData.forEach((res, index) => {
        const foundedProgram = [];
        this.listRegistrationProfile.filter((elements) => {
          elements.programs.find((element) => {
            if (element._id === res) {
              foundedProgram.push(elements._id);
            }
          });
        });
        found.push(foundedProgram);
      });
      this.isSameData = true;
      let result;
      found.forEach((element, index) => {
        if (found.length > 1) {
          if (found.length - 1 !== index) {
            result = found[0].some((res) => found[index + 1].includes(res));
            if (!result) {
              result = false;
              this.isSameData = false;
              return;
            }
          }
        } else {
          result = true;
        }
      });
    }
    if (data.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else if (this.isEmailSent) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S9.Title'),
        html: this.translate.instant('Followup_S9.Text'),
        confirmButtonText: this.translate.instant('Followup_S9.Button'),
      });
    } else {
      const candidate = [];
      candidate.push(data);
      const dataSchool = this.dataSelected.filter((list) => list.school && list.school._id).map((list) => list.school._id);
      const dataCampus = this.dataSelected.filter((list) => list.campus && list.campus._id).map((list) => list.campus._id);
      const dataLevel = this.dataSelected.filter((list) => list.level && list.level._id).map((list) => list.level._id);
      const dataSector = this.dataSelected.filter((list) => list.sector && list.sector._id).map((list) => list.sector._id);
      const dataSpeciality = this.dataSelected.filter((list) => list.speciality && list.speciality._id).map((list) => list.speciality._id);
      const scholar = this.dataSelected
        .filter((list) => list.intake_channel && list.intake_channel.scholar_season_id && list.intake_channel.scholar_season_id._id)
        .map((list) => list.intake_channel.scholar_season_id._id);
      const filter = {
        school_ids: _.uniqBy(dataSchool),
        campus_ids: _.uniqBy(dataCampus),
        level_ids: _.uniqBy(dataLevel),
        scholar_season_ids: _.uniqBy(scholar),
        sector_ids: _.uniqBy(dataSector),
        speciality_ids: _.uniqBy(dataSpeciality),
      };
      this.isWaitingForResponse = true;
      this.subs.sink = this.financeService.GetListProfileRates(filter).subscribe(
        (list) => {
          this.isWaitingForResponse = false;
          if (list && list.length) {
            const response = _.cloneDeep(list);
            const readmissionData = response.filter((ListResp) => ListResp.is_readmission);
            // const admissionData = response.filter((ListResp) => ListResp.is_admission);
            if (readmissionData && readmissionData.length < 1) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('Followup_S10.Title'),
                html: this.translate.instant('Followup_S10.Text'),
                confirmButtonText: this.translate.instant('Followup_S10.Button'),
              });
              return;
            } else {
              if (type === 'one' && isFSRed) {
                Swal.fire({
                  type: 'warning',
                  title: this.translate.instant('ReAdmission_S11.TITLE'),
                  html: this.translate.instant('ReAdmission_S11.TEXT'),
                  confirmButtonText: this.translate.instant('ReAdmission_S11.BUTTON1'),
                  cancelButtonText: this.translate.instant('ReAdmission_S11.BUTTON2'),
                  showCancelButton: true,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then((confirm) => {
                  if (confirm.value) {
                    this.assignRateProfileDialogComponent = this.dialog.open(AssignRateProfileDialogComponent, {
                      width: '600px',
                      minHeight: '100px',
                      panelClass: 'certification-rule-pop-up',
                      disableClose: true,
                      data: {
                        selected: data,
                        from: 'readmission',
                        isVolumeOfHours: true,
                      },
                    });
                    this.subs.sink = this.assignRateProfileDialogComponent.afterClosed().subscribe((result) => {
                      if (result) {
                        if (result.send) {
                          this.sendAnnoucment(result.candidate);
                          this.disabledExport = true;
                          this.isCheckedAll = false;
                          this.selection.clear();
                          this.dataSelected = [];
                        } else {
                          this.refetchDataKeepFilter();
                        }
                        this.assignRateProfileDialogComponent = null;
                      }
                    });
                  }
                });
              } else if (isFSRed && type === 'button') {
                Swal.fire({
                  type: 'warning',
                  title: this.translate.instant('ReAdmission_S12.TITLE'),
                  html: this.translate.instant('ReAdmission_S12.TEXT'),
                  confirmButtonText: this.translate.instant('ReAdmission_S12.BUTTON1'),
                  cancelButtonText: this.translate.instant('ReAdmission_S12.BUTTON2'),
                  showCancelButton: true,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then((confirm) => {
                  if (confirm.value) {
                    this.assignRateProfileDialogComponent = this.dialog.open(AssignRateProfileDialogComponent, {
                      width: '600px',
                      minHeight: '100px',
                      panelClass: 'certification-rule-pop-up',
                      disableClose: true,
                      data: {
                        selected: data,
                        from: 'readmission',
                        isVolumeOfHours: true,
                      },
                    });
                    this.subs.sink = this.assignRateProfileDialogComponent.afterClosed().subscribe((result) => {
                      if (result) {
                        if (result.send) {
                          this.sendAnnoucment(result.candidate);
                          this.disabledExport = true;
                          this.isCheckedAll = false;
                          this.selection.clear();
                          this.dataSelected = [];
                        } else {
                          this.refetchDataKeepFilter();
                        }
                        this.assignRateProfileDialogComponent = null;
                      }
                    });
                  }
                });
              } else {
                this.assignRateProfileDialogComponent = this.dialog.open(AssignRateProfileDialogComponent, {
                  width: '600px',
                  minHeight: '100px',
                  panelClass: 'certification-rule-pop-up',
                  disableClose: true,
                  data: {
                    selected: data,
                    from: 'readmission',
                    isVolumeOfHours: true,
                  },
                });
                this.subs.sink = this.assignRateProfileDialogComponent.afterClosed().subscribe((result) => {
                  if (result) {
                    if (result.send) {
                      this.sendAnnoucment(result.candidate);
                      this.disabledExport = true;
                      this.isCheckedAll = false;
                      this.selection.clear();
                      this.dataSelected = [];
                    } else {
                      this.refetchDataKeepFilter();
                    }
                    this.assignRateProfileDialogComponent = null;
                  }
                });
              }
            }
          } else {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('Followup_S10.Title'),
              html: this.translate.instant('Followup_S10.Text'),
              confirmButtonText: this.translate.instant('Followup_S10.Button'),
            });
            this.refetchDataKeepFilter();
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.userService.postErrorLog(err);
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

  sendReadmissionEmail(element?, type?) {
    let data = [];
    if (element && element._id) {
      data = [element];
    } else {
      data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    }
    const notDoing1stcall = data.filter((listData) => !listData.registration_profile);
    if (notDoing1stcall.length > 0) {
      this.isHasRegistrationProfileandCallNotDone = true;
    } else {
      this.isHasRegistrationProfileandCallNotDone = false;
    }
    const candidateAnnoun = data.filter((list) => {
      if (list && list.announcement_email) {
        if (list.announcement_email.sent_date || list.announcement_email.sent_time) {
          return list;
        }
      }
    });
    if (candidateAnnoun.length > 0) {
      this.isDifferentAnnoucement = true;
    } else {
      this.isDifferentAnnoucement = false;
    }
    if (this.isHasRegistrationProfileandCallNotDone) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S12s.Title'),
        html: this.translate.instant('Followup_S12s.Text'),
        confirmButtonText: this.translate.instant('Followup_S12s.Button'),
      });
    } else if (this.isDifferentAnnoucement) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S11.Title'),
        html: this.translate.instant('Followup_S11.Text'),
        confirmButtonText: this.translate.instant('Followup_S11.Button'),
      });
    } else {
      if (type === 'many' && this.dataSelected.length < 1) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Followup_S8.Title'),
          html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
          confirmButtonText: this.translate.instant('Followup_S8.Button'),
        });
      } else {
        if (type === 'many' && this.dataSelected.some((x) => x.registration_profile === '' || x.registration_profile === null)) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('Followup_S12s.Title'),
            html: this.translate.instant('Followup_S12s.Text'),
            confirmButtonText: this.translate.instant('Followup_S12s.Button'),
          });
        } else if (type !== 'many' && (element.registration_profile === '' || element.registration_profile === null)) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('Followup_S12s.Title'),
            html: this.translate.instant('Followup_S12s.Text'),
            confirmButtonText: this.translate.instant('Followup_S12s.Button'),
          });
        } else {
          console.log(data);
          if (data && data.length) {
            const candidateIds = data.map((list) => list._id);
            const candidateAdmissionIds = data.map((res) => res?.admission_process_id?._id);
            const filter = {
              candidates_id: candidateIds,
              template_type: 'student_admission',
            };
            this.isLoading = true;
            this.admissionNeedValidator = [];
            this.subs.sink = this.candidatesService.GetAllStudentAdmissionProcesses(filter).subscribe(
              (list) => {
                this.isLoading = false;
                if (list && list.length) {
                  list.forEach((elements) => {
                    if (elements.steps && elements.steps.length && candidateAdmissionIds.includes(elements._id)) {
                      const steps = elements.steps.filter((step) => step.is_validation_required);
                      if (steps && steps.length) {
                        this.admissionNeedValidator = _.concat(this.admissionNeedValidator, steps);
                      }
                    }
                    this.admissionNeedValidator = _.uniqBy(this.admissionNeedValidator, '_id');
                    console.log('this.admissionNeedValidator', this.admissionNeedValidator);
                  });
                }
                this.triggerDialogSendMailDirectly(list, data);
              },
              (err) => {
                this.isLoading = false;
                console.log('Error :', err);
                this.userService.postErrorLog(err);
                this.sendEmailValidatorDialogComponent = this.dialog.open(SendEmailValidatorDialogComponent, {
                  width: '800px',
                  minHeight: '300px',
                  panelClass: 'no-padding',
                  disableClose: true,
                  data: {
                    data: data,
                    isNeedValidator: false,
                    isResendMail: false,
                    isFc: false,
                    isReadmission: true,
                  },
                });
                this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
                  if (result) {
                    this.refetchDataKeepFilter();
                  }
                  this.sendEmailValidatorDialogComponent = null;
                });
              },
            );
          }
        }
      }
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
      if (data) {
        // console.log('_masuk', data);

        data = data.map((res) => {
          let mappedFinancialSuppEmail;
          if (res.payment_supports && res.payment_supports.length > 0) {
            mappedFinancialSuppEmail = res.payment_supports
              .filter((filtered) => filtered.relation)
              .map((pay) => {
                return pay.email;
              });
          } else {
            mappedFinancialSuppEmail = [];
          }
          return {
            candidate: {
              email: res.email,
              emailDefault: res.school_mail,
            },

            financial_supp: {
              email: mappedFinancialSuppEmail,
            },
          };
        });

        console.log('_data selected', data);
        Swal.fire({
          title: this.translate.instant('Followup_S3.Title'),
          html: this.translate.instant('Followup_S3.Text'),
          type: 'question',
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('Followup_S3.BUTTON 1'),
          cancelButtonText: this.translate.instant('Followup_S3.BUTTON 2'),
        }).then((result) => {
          if (result.value) {
            this.sendMultipleEmailComponent = this.dialog.open(SendMultipleEmailComponent, {
              disableClose: true,
              width: '750px',
              data: data,
              autoFocus: false,
            });
            this.subs.sink = this.sendMultipleEmailComponent.afterClosed().subscribe((resulta) => {
              if (resulta) {
                this.refetchDataKeepFilter();
              }
              this.sendMultipleEmailComponent = null;
            });
          } else {
            // delete financial supp
            data = data.map((res) => {
              delete res.financial_supp;
              return res;
            });
            this.sendMultipleEmailComponent = this.dialog.open(SendMultipleEmailComponent, {
              disableClose: true,
              width: '750px',
              data: data,
              autoFocus: false,
            });
            this.subs.sink = this.sendMultipleEmailComponent.afterClosed().subscribe((resulta) => {
              if (resulta) {
                this.refetchDataKeepFilter();
              }
              this.sendMultipleEmailComponent = null;
            });
          }
        });
      }
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
          emailDefault: data.school_mail,
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
            this.cleanSelection();
            this.getCandidatesData('sendMail');
            // this.getCandidatesData('send email');
          }
        });
    }
  }

  sendAnnoucment(element) {
    let data = [];
    if (element && Array.isArray(element) && element[0]._id) {
      data = element;
    } else if (element && element.id) {
      data = [element];
    } else {
      data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    }
    if (data && data.length) {
      this.studentsData = [];
      const candidateIds = data.map((list) => list._id);
      this.getUpdatedData(candidateIds, data, 0);
    }
  }

  checkIfFullDiscountAndNoDP(element) {
    if (
      element.registration_profile &&
      element.registration_profile.is_down_payment &&
      element.registration_profile.is_down_payment === 'no' &&
      element.registration_profile.discount_on_full_rate &&
      element.registration_profile.discount_on_full_rate === 100 &&
      element.selected_payment_plan.additional_expense === 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkConditionStatusDownPayment(element) {
    // if (element.payment && element.payment === 'not_authorized') {
    //   return 'magenta';
    // } else if (
    //   (element?.billing_id?.deposit >= 0 &&
    //     element?.billing_id?.deposit_pay_amount &&
    //     element?.billing_id?.deposit_pay_amount >= element?.billing_id?.deposit) ||
    //   element?.billing_id?.deposit_status === 'paid'
    // ) {
    //   return 'green';
    // } else if (
    //   (element?.billing_id?.deposit >= 0 &&
    //     element?.billing_id?.deposit_pay_amount &&
    //     element?.billing_id?.deposit_pay_amount < element?.billing_id?.deposit) ||
    //   element?.billing_id?.deposit_status === 'partially_paid'
    // ) {
    //   return 'orange';
    // } else if (!element.billing_id.deposit) {
    //   return 'red';
    // } else {
    //   return 'red';
    // }

    // *************** New conditional when check down payment status

    if (
      element?.payment !== 'sepa_pending' &&
      element?.payment !== 'pending' &&
      element?.payment !== 'not_authorized' &&
      element?.payment !== 'chargeback'
    ) {
      if (element?.billing_id?.deposit_status === 'paid') {
        return 'green';
      } else if (element?.billing_id?.deposit_status === 'partially_paid') {
        return 'orange';
      } else if (element?.billing_id?.deposit_status === 'billed' && element?.signature === 'done') {
        // Not Paid
        return 'blue';
      } else if (element?.billing_id?.deposit_status === 'billed' && element?.signature === 'not_done') {
        // Billed
        return 'blue';
      } else if (element?.billing_id?.deposit_status === 'not_billed') {
        return 'red';
      } else {
        return '';
      }
    } else {
      if (element?.payment === 'sepa_pending' || element?.payment === 'pending') {
        return 'yellow';
      } else if (element?.payment === 'not_authorized') {
        return 'red';
      } else if (element?.payment === 'chargeback') {
        return 'purple';
      }
    }
  }

  checkDpIsNotPaid(element) {
    let isNotPaid = false;
    if (element && element.billing_id) {
      if (!element.billing_id.deposit && !element.billing_id.deposit_pay_amount) {
        isNotPaid = true;
      } else {
        if (!element.payment_method && !element.billing_id.deposit_pay_amount) {
          isNotPaid = true;
        } else if (
          (element.payment_method === 'check' || element.payment_method === 'transfer') &&
          !element.billing_id.deposit_pay_amount
        ) {
          isNotPaid = true;
        } else {
          isNotPaid = false;
        }
      }
    }
    return isNotPaid;
  }

  checkDpIsPaidPartial(element) {
    let isPaid = false;
    if (element && element.billing_id) {
      if (!element.billing_id.deposit && !element.billing_id.deposit_pay_amount) {
        isPaid = false;
      } else {
        if (!element.payment_method && !element.billing_id.deposit_pay_amount) {
          isPaid = false;
        } else if (
          (element.payment_method && element.payment_method !== 'check' && element.payment_method !== 'transfer') ||
          element.billing_id.deposit_pay_amount
        ) {
          isPaid = true;
        } else {
          isPaid = false;
        }
      }
    }
    return isPaid;
  }

  renderTooltipStatusDP(element) {
    // if (element.payment === 'not_authorized') {
    //   return this.translate.instant('Rejecteds');
    // } else if (
    //   (element.billing_id &&
    //     element.billing_id.deposit >= 0 &&
    //     element.billing_id.deposit_pay_amount &&
    //     element.billing_id.deposit_pay_amount >= element.billing_id.deposit) ||
    //   element?.billing_id?.deposit_status === 'paid'
    // ) {
    //   return this.translate.instant('Paid');
    // } else if (
    //   (element.billing_id &&
    //     element.billing_id.deposit >= 0 &&
    //     element.billing_id.deposit_pay_amount &&
    //     element.billing_id.deposit_pay_amount < element.billing_id.deposit) ||
    //   element?.billing_id?.deposit_status === 'partially_paid'
    // ) {
    //   return this.translate.instant('Partially paid');
    // } else if (element.billing_id && !element.billing_id.deposit) {
    //   return this.translate.instant('Not paid');
    // } else {
    //   return this.translate.instant('Not paid');
    // }

    // if (
    //   element?.payment !== 'sepa_pending' &&
    //   element?.payment !== 'pending' &&
    //   element?.payment !== 'not_authorized' &&
    //   element?.payment !== 'chargeback'
    // ) {
    //   if (element?.billing_id?.deposit_status === 'paid') {
    //     return this.translate.instant('Paid');
    //   } else if (element?.billing_id?.deposit_status === 'partially_paid') {
    //     return this.translate.instant('Partially paid');
    //   } else if (element?.billing_id?.deposit_status === 'billed' && element?.signature === 'done') {
    //     // Not Paid
    //     return this.translate.instant('DP_Status.not_paid');
    //   } else if (element?.billing_id?.deposit_status === 'billed' && element?.signature === 'not_done') {
    //     // Billed
    //     return this.translate.instant('DP_Status.billed');
    //   } else if (element?.billing_id?.deposit_status === 'not_billed') {
    //     return this.translate.instant('DP_Status.not_billed');
    //   } else {
    //     return '';
    //   }
    // } else {
    //   if (element?.payment === 'sepa_pending' || element?.payment === 'pending') {
    //     return this.translate.instant('DP_Status.pending');
    //   } else if (element?.payment === 'not_authorized') {
    //     return this.translate.instant('DP_Status.rejected');
    //   } else if (element?.payment === 'chargeback') {
    //     return this.translate.instant('DP_Status.chargeback');
    //   }
    // }

    let downPaymentStatus = '';
    if (
      element?.payment !== 'sepa_pending' &&
      element?.payment !== 'pending' &&
      element?.payment !== 'not_authorized' &&
      element?.payment !== 'chargeback'
    ) {
      if (
        !element?.billing_id?.deposit_pay_amount &&
        element?.billing_id?.deposit_status !== 'billed' &&
        element?.billing_id?.deposit_status !== 'not_billed'
      ) {
        // *************** not paid icon
        downPaymentStatus = 'not_paid';
      } else if (element?.billing_id?.deposit_status === 'paid') {
        // *************** paid icon
        downPaymentStatus = 'paid';
      } else if (element?.billing_id?.deposit_status === 'partially_paid') {
        // *************** partially paid icon
        downPaymentStatus = 'partially_paid';
      } else if (element?.billing_id?.deposit && element?.billing_id?.deposit_status === 'billed') {
        // *************** generated/billed icon
        downPaymentStatus = 'generated';
      } else if (element?.billing_id?.deposit_status === 'not_billed' && element?.payment === 'no_down_payment' ||  this.checkIfDoesntHaveAnyDP(element)) {
        // *************** no downpayment icon
        downPaymentStatus = '';
      } else if (element?.billing_id?.deposit_status === 'not_billed' && !this.checkIfDoesntHaveAnyDP(element)) {
        // *************** not billed icon
        downPaymentStatus = 'not_billed';
      }
    } else {
      if (element?.payment === 'not_authorized') {
        // *************** reject icon
        downPaymentStatus = 'rejected';
      } else if (element?.payment === 'chargeback') {
        // *************** chargeback icon
        downPaymentStatus = 'chargeback';
      } else if (element?.payment === 'pending' || element?.payment === 'sepa_pending') {
        // *************** pending icon
        downPaymentStatus = 'pending';
      }
    }
    return downPaymentStatus;
  }

  checkIfDoesntHaveAnyDP(element) {
    if (
      element &&
      element.registration_profile &&
      element.registration_profile.is_down_payment &&
      element.registration_profile.is_down_payment === 'no'
    ) {
      return true;
    } else {
      return false;
    }
  }

  intakeChannel(data) {
    let intakeChannel = '';
    if (data && data.intake_channel && data.scholar_season && data.intake_channel.program && data.scholar_season.scholar_season) {
      intakeChannel = data.scholar_season.scholar_season.concat(' ', data.intake_channel.program);
      return intakeChannel;
    } else {
      return '';
    }
  }

  previousIntakeChannel(data) {
    let intakeChannel = '';
    if (
      data &&
      data.latest_previous_program &&
      data.latest_previous_program.program &&
      data.latest_previous_program.scholar_season_id &&
      data.latest_previous_program.scholar_season_id.scholar_season
    ) {
      intakeChannel = data.latest_previous_program.scholar_season_id.scholar_season.concat(' ', data.latest_previous_program.program);
      return intakeChannel;
    } else {
      return '';
    }
  }

  transformDate(data) {
    if (data && data.sent_date && data.sent_time) {
      const date = data.sent_date;
      const time = data.sent_time;

      const datee = this.parseUtcToLocalPipe.transformDate(date, time);
      return datee;
    } else {
      return '';
    }
  }

  transformReadmissionDate(data) {
    if (data && data.date && data.time) {
      const date = data.date;
      const time = data.time;

      const datee = this.parseUtcToLocalPipe.transformDate(date, time);
      return datee;
    } else {
      return '';
    }
  }

  transformLastReminderDate(data) {
    if (data && data.date && data.time) {
      const date = data.date;
      const time = data.time;

      const datee = this.parseUtcToLocalPipe.transformDate(date, time);
      return datee;
    } else {
      return '';
    }
  }

  getDataTypeOfFormation() {
    this.subs.sink = this.admissionService.getAllTypeOfInformationDropdown().subscribe(
      (res) => {
        if (res && res.length) {
          const filteredSigle = res.map((resp) => resp.sigle);
          this.listSigle = _.uniqBy(filteredSigle);
          console.log('_list', this.listSigle);
        } else {
          this.listSigle = [];
        }
      },
      (error) => {
        this.listSigle = [];
        this.userService.postErrorLog(error);
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
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return this.isCheckedAll ? true : numSelected === numRows;
  }

  isSomeSelected() {
    return this.selection.selected.length > 0;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.isCheckedAll = false;
      this.allCandidateData = [];
      this.dataUnselectUser = [];
      this.allStudentForCheckbox = [];
      this.allAnnoucmentForCheckbox = [];
      this.allCallForCheckbox = [];
      this.allCRMForCheckbox = [];
      this.allEmailForCheckbox = [];
      this.allMemberForCheckbox = [];
      this.allExportForCheckbox = [];
      this.allJuryForCheckbox = [];
      this.allReminderForCheckbox = [];
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.isCheckedAll = true;
      this.dataUnselectUser = [];
      this.allStudentForCheckbox = [];
      this.allAnnoucmentForCheckbox = [];
      this.allCallForCheckbox = [];
      this.allCRMForCheckbox = [];
      this.allEmailForCheckbox = [];
      this.allMemberForCheckbox = [];
      this.allExportForCheckbox = [];
      this.allJuryForCheckbox = [];
      this.allReminderForCheckbox = [];
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
      // this.getAllIdForCheckbox(0);
    }
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 500,
      page: pageNumber,
    };
    this.isLoading = true;
    const filter = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService
      .getAllReadmissionCheckbox(pagination, this.sortValue, filter, this.searching, userTypesList)
      .subscribe(
        (students: any) => {
          if (students && students.length) {
            this.allStudentForCheckbox.push(...students);
            const page = pageNumber + 1;
            this.getDataAllForCheckbox(page);
          } else {
            this.isLoading = false;
            if (this.isCheckedAll && this.allStudentForCheckbox && this.allStudentForCheckbox.length) {
              this.allStudentForCheckbox.forEach((element) => {
                this.selection.select(element._id);
                this.dataSelected.push(element);
              });
            }
          }
        },
        (err) => {
          this.isReset = false;
          this.isWaitingForResponse = false;
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
    if (info === 'all') {
      this.isWasSelectAll = true;
    }
    if (numSelected > 0) {
      this.disabledExport = false;
      this.disabledAssign = false;
    } else {
      this.disabledExport = true;
      this.disabledAssign = true;
      this.isWasSelectAll = false;
    }
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;

    if (data && data.length) {
      const candidateEmail = data.filter((list) => {
        if (list.registration_profile === null) {
          return list;
        }
      });
      if (candidateEmail && candidateEmail.length) {
        if (candidateEmail.length === data.length) {
          this.isEmailSent = false;
        } else {
          this.isEmailSent = true;
        }
      } else {
        this.isEmailSent = true;
      }
    }
    if (this.dataSelected && this.dataSelected.length) {
      const intake = _.uniqBy(data, 'intake_channel.scholar_season_id._id');
      const mappedData = data.map((res) => res.intake_channel._id);
      const found = [];

      if (this.listRegistrationProfile.length > 0) {
        // Mapped data for get each
        mappedData.forEach((res, index) => {
          const foundedProgram = [];
          this.listRegistrationProfile.filter((elements) => {
            elements.programs.find((element) => {
              if (element._id === res) {
                foundedProgram.push(elements._id);
              }
            });
          });
          found.push(foundedProgram);
        });
        this.isSameData = true;
        let result;
        found.forEach((element, index) => {
          if (found.length > 1) {
            if (found.length - 1 !== index) {
              result = found[0].some((res) => found[index + 1].includes(res));
              if (!result) {
                result = false;
                this.isSameData = false;
                return;
              }
            }
          } else {
            result = true;
          }
        });
      }
    }
  }
  goToStudentCard(id, row, tab?) {
    // console.log('cek row', row);
    const query = {
      selectedCandidate: id,
      sortValue: JSON.stringify(this.sortValue) || '',
      tab: tab || '',
      paginator: JSON.stringify({
        pageIndex: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize,
      }),
    };
    const url = this.router.createUrlTree(['candidate-file'], { queryParams: query });
    window.open(url.toString(), '_blank');
  }

  checkIsSelected(row) {
    return this.selection.isSelected(row._id);
  }

  downloadCSV() {
    if (this.dataSelected.length < 1 && !this.isCheckedAll) {
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
        filtered = filter.slice(0, 10) + billing + ',' + filter.slice(10);
      } else {
        filtered = filter.slice(0, 10) + billing + filter.slice(10);
      }
    } else if (this.isCheckedAll) {
      filtered = filter;
    }
    // console.log(filtered);
    const userTypesList =
      this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id.map((res) => `"` + res + `"`) : [];
    const importStudentTemlate = `downloadReadmissionCSV/`;
    const sorting = this.sortingForExport();
    let fullURL;
    fullURL = url + importStudentTemlate + fileType + '/' + lang + '/' + this.currentUserTypeId;

    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
        'Content-Type': 'application/json',
      }),
    };
    const payload =
      '{' + filtered + ',"user_type_ids":[' + userTypesList + '],' + sorting + ',"user_type_id":' + `"${this.currentUserTypeId}"` + '}';
    this.isWaitingForResponse = true;
    this.httpClient.post(`${encodeURI(fullURL)}`, payload, httpOptions).subscribe(
      (res) => {
        if (res) {
          this.isWaitingForResponse = false;
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
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
      },
    );

    console.log('fullURL', fullURL);

    // element.href = encodeURI(fullURL);
    // // console.log(element.href);
    // element.target = '_blank';
    // element.download = 'Follow Up Readmission Table';
    // document.body.appendChild(element);
    // element.click();
    // document.body.removeChild(element);
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
    return '"sorting":{' + data + '}';
  }
  reSendMail(element) {
    let data = [];
    if (element && element._id) {
      data = [element];
    } else {
      data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    }
    this.subs.sink = this.dialog
      .open(SendEmailValidatorDialogComponent, {
        width: '970px',
        minHeight: '300px',
        panelClass: 'no-padding',
        disableClose: true,
        data: {
          data: data,
          isNeedValidator: false,
          isResendMail: true,
          isFc: false,
          isReadmission: true,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.refetchDataKeepFilter();
        }
      });
  }

  hideActionButtonRate(element) {
    let allow = false;
    if (element && element.admission_member_id && element.admission_member_id._id) {
      allow = true;
    }
    if (element && element.registration_profile && element.registration_profile.name) {
      allow = false;
    }
    return allow;
  }

  hideActionButtonReSendMail(element) {
    let allow = false;
    if (element && element.announcement_email && element.announcement_email.sent_date && element.announcement_email.sent_time) {
      allow = true;
    }
    if (element && element.candidate_admission_status && element.candidate_admission_status === 'registered') {
      allow = false;
    }
    return allow;
  }

  hideActionButtonMail(element) {
    let allow = true;
    if (element && element.announcement_call && element.announcement_call === 'done') {
      allow = true;
    }
    if (element && element.announcement_email && element.announcement_email.sent_date && element.announcement_email.sent_time) {
      allow = false;
    }
    if (element && element.candidate_admission_status && element.candidate_admission_status === 'registered') {
      allow = false;
    }
    return allow;
  }

  getAllRegistrationProfileDropdown() {
    this.subs.sink = this.financeService.GetReadmissionProfileDropdown().subscribe(
      (list) => {
        if (list && list.length) {
          this.rateList = _.cloneDeep(list);
          this.profileRateFilterList = [
            { _id: 'affected', name: this.translate.instant('affected') },
            { _id: 'not_affected', name: this.translate.instant('not_affected') },
            ...this.rateList,
          ];
          this.backupProfileList = _.cloneDeep(list);
        } else {
          this.profileRateFilterList = [
            { _id: 'affected', name: this.translate.instant('affected') },
            { _id: 'not_affected', name: this.translate.instant('not_affected') },
          ];
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
      },
    );
  }
  changeProfileSelected() {
    const value = this.registrationProfileFilter.value;
    const selectedLastValue = value?.length ? value[value.length - 1] : null;
    if (value?.length && (value.includes('not_affected') || value.includes('affected')) && !this.isCheckedAllDropdown) {
      let selectedValue = null;
      if (selectedLastValue === 'not_affected' || selectedLastValue === 'affected') {
        selectedValue = value.filter((data) => data === 'not_affected' || data === 'affected');
      } else {
        selectedValue = value.filter((data) => data !== 'not_affected' && data !== 'affected');
      }
      this.registrationProfileFilter.setValue(selectedValue, { emitEvent: false });
    }
  }

  setProfileSelected(titleId?: string) {
    // check if previously selected then select again, if yes then reset dropdown before filtering again
    const filterValue = this.registrationProfileFilter.value ? this.registrationProfileFilter.value : [];
    const isRegistrationProfile = filterValue.filter((resp) => resp !== 'not_affected' && resp !== 'affected');
    if (
      isRegistrationProfile?.length > 0 &&
      filterValue[filterValue?.length - 1] !== 'affected' &&
      filterValue[filterValue?.length - 1] !== 'not_affected'
    ) {
      const temp = _.cloneDeep(this.registrationProfileFilter.value);
      const ids = [];
      temp.filter((res) => {
        if (res !== 'All' && res !== 'not_affected' && res !== 'affected') {
          ids.push(res);
        }
      });
      this.registrationProfileFilter.patchValue(ids);
      const isSame = JSON.stringify(this.tempDataFilter.registrationProfile) === JSON.stringify(this.registrationProfileFilter.value);
      if (isSame) {
        return;
      } else if (this.registrationProfileFilter.value?.length) {
        this.filteredValues.registration_profile_statuses = null;
        this.filteredValues.registration_profile = ids;
        this.tempDataFilter.registrationProfile = ids;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('registrationProfileFilter');
        }
      } else {
        if (this.tempDataFilter.registrationProfile?.length && !this.registrationProfileFilter.value?.length) {
          this.filteredValues.registration_profile_statuses = null;
          this.filteredValues.registration_profile = null;
          this.tempDataFilter.registrationProfile = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getCandidatesData('registrationProfileFilter');
          }
        } else {
          return;
        }
      }
    } else if (filterValue.length === 0) {
      const isSame = JSON.stringify(this.tempDataFilter.registrationProfile) === JSON.stringify(this.registrationProfileFilter.value);
      if (isSame) {
        return;
      } else if (this.registrationProfileFilter.value?.length) {
        this.filteredValues.registration_profile_statuses = filterValue;
        this.filteredValues.registration_profile = null;
        this.tempDataFilter.registrationProfile = this.registrationProfileFilter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('registrationProfileFilter');
        }
      } else {
        if (this.tempDataFilter.registrationProfile?.length && !this.registrationProfileFilter.value?.length) {
          this.filteredValues.registration_profile_statuses = null;
          this.filteredValues.registration_profile = null;
          this.tempDataFilter.registrationProfile = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getCandidatesData('registrationProfileFilter');
          }
        } else {
          return;
        }
      }
    } else if (
      ((filterValue.includes('not_affected') || filterValue.includes('affected')) && isRegistrationProfile.length === 0) ||
      filterValue[filterValue?.length - 1] === 'affected' ||
      filterValue[filterValue?.length - 1] === 'not_affected'
    ) {
      if (filterValue.includes('not_affected') && !filterValue.includes('affected')) {
        const isSame = JSON.stringify(this.tempDataFilter.registrationProfile) === JSON.stringify(this.registrationProfileFilter.value);
        if (isSame) {
          return;
        } else if (this.registrationProfileFilter.value?.length) {
          const notAffected = ['not_affected'];
          this.registrationProfileFilter.setValue(notAffected);
          this.filteredValues.registration_profile_statuses = notAffected;
          this.filteredValues.registration_profile = null;
          this.tempDataFilter.registrationProfile = this.registrationProfileFilter.value;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getCandidatesData('registrationProfileFilter');
          }
        } else {
          if (this.tempDataFilter.registrationProfile?.length && !this.registrationProfileFilter.value?.length) {
            this.filteredValues.registration_profile_statuses = null;
            this.filteredValues.registration_profile = null;
            this.tempDataFilter.registrationProfile = null;
            if (!this.isReset) {
              this.paginator.pageIndex = 0;
              this.getCandidatesData('registrationProfileFilter');
            }
          } else {
            return;
          }
        }
      }

      if (filterValue.includes('affected') && !filterValue.includes('not_affected')) {
        const isSame = JSON.stringify(this.tempDataFilter.registrationProfile) === JSON.stringify(this.registrationProfileFilter.value);
        if (isSame) {
          return;
        } else if (this.registrationProfileFilter.value?.length) {
          const affected = ['affected'];
          this.registrationProfileFilter.setValue(affected);
          this.filteredValues.registration_profile_statuses = affected;
          this.filteredValues.registration_profile = null;
          this.tempDataFilter.registrationProfile = this.registrationProfileFilter.value;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getCandidatesData('registrationProfileFilter');
          }
        } else {
          if (this.tempDataFilter.registrationProfile?.length && !this.registrationProfileFilter.value?.length) {
            this.filteredValues.registration_profile_statuses = null;
            this.filteredValues.registration_profile = null;
            this.tempDataFilter.registrationProfile = null;
            if (!this.isReset) {
              this.paginator.pageIndex = 0;
              this.getCandidatesData('registrationProfileFilter');
            }
          } else {
            return;
          }
        }
      }

      if (filterValue.includes('affected') && filterValue.includes('not_affected')) {
        const isSame = JSON.stringify(this.tempDataFilter.registrationProfile) === JSON.stringify(this.registrationProfileFilter.value);
        if (isSame) {
          return;
        } else if (this.registrationProfileFilter.value?.length) {
          const affected = ['affected', 'not_affected'];
          this.registrationProfileFilter.setValue(affected);
          this.filteredValues.registration_profile_statuses = affected;
          this.filteredValues.registration_profile = null;
          this.tempDataFilter.registrationProfile = this.registrationProfileFilter.value;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getCandidatesData('registrationProfileFilter');
          }
        } else {
          if (this.tempDataFilter.registrationProfile?.length && !this.registrationProfileFilter.value?.length) {
            this.filteredValues.registration_profile_statuses = null;
            this.filteredValues.registration_profile = null;
            this.tempDataFilter.registrationProfile = null;
            if (!this.isReset) {
              this.paginator.pageIndex = 0;
              this.getCandidatesData('registrationProfileFilter');
            }
          } else {
            return;
          }
        }
      }
    }
  }

  setInitialTableColumn() {
    this.displayedColumns = [
      'select',
      'type_of_formation',
      'student_number',
      'name',
      'previous_program',
      'readmission_program',
      'type_of_readmission',
      'status',
      'jury_decision',
      'registration_profile',
      'readmission_email',
      'date_last_reminder',
      'method_of_payment_dp',
      'down_payment',
      'financement',
      'financial_situation',
      // 'convention',
      'readmission_date',
      'admission_member',
      'fc_in_charge',
      'action',
    ];

    this.filterColumns = [
      'select_filter',
      'type_of_formation_filter',
      'student_number_filter',
      'name_filter',
      'previous_program_filter',
      'readmission_program_filter',
      'type_of_readmission_filter',
      'status_filter',
      'juryFilter',
      'registration_profile_filter',
      'readmission_email_filter',
      'date_last_reminder_filter',
      'method_of_payment_dp_filter',
      'down_payment_filter',
      'financement_filter',
      'financial_situation_filter',
      // 'convention_filter',
      'readmission_date_filter',
      'admission_member_filter',
      'fc_in_charge_filter',
      'action_filter',
    ];
  }

  setTableColumnwithStep(data) {
    this.steps = new UntypedFormArray([]);
    this.optionalSteps = new UntypedFormArray([]);
    const stepColumns = [];
    const optionalStepColumns = [];
    this.totalSteps = 0;
    let maxStepData;
    let maxOptionalStepData;

    if (data && data.length > 0) {
      // filter all the admission process to only contain steps that is non-optional
      const dataWithFilteredSteps = data.map((candidateData) => ({
        ...candidateData,
        admission_process_id: candidateData?.admission_process_id
          ? {
              ...candidateData?.admission_process_id,
              steps:
                candidateData && candidateData?.admission_process_id && candidateData?.admission_process_id?.steps
                  ? candidateData?.admission_process_id?.steps.filter((step) => !step?.is_only_visible_based_on_condition)
                  : candidateData?.admission_process_id?.steps,
            }
          : null,
      }));
      this.dataWithFilteredSteps = dataWithFilteredSteps;
      console.log('data untouched', data);
      console.log('datawithfilteredSteps:', this.dataWithFilteredSteps);
      // find max number of steps in the data
      maxStepData = Math.max.apply(
        Math,
        dataWithFilteredSteps.map((res) =>
          res.admission_process_id && res.admission_process_id.steps ? res.admission_process_id.steps.length : 0,
        ),
      );

      // filter all the admission process to only contain steps that is optional
      const dataWithFilteredOptionalSteps = data.map((candidateData) => ({
        ...candidateData,
        admission_process_id: candidateData?.admission_process_id
          ? {
              ...candidateData?.admission_process_id,
              steps:
                candidateData && candidateData?.admission_process_id && candidateData?.admission_process_id.steps
                  ? candidateData?.admission_process_id?.steps.filter((step) => step?.is_only_visible_based_on_condition)
                  : candidateData?.admission_process_id?.steps,
            }
          : null,
      }));
      this.dataWithFilteredOptionalSteps = dataWithFilteredOptionalSteps;

      // find max number of optional steps in the data
      maxOptionalStepData = Math.max.apply(
        Math,
        dataWithFilteredOptionalSteps.map((res) =>
          res.admission_process_id && res.admission_process_id.steps ? res.admission_process_id.steps.length : 0,
        ),
      );
      const dataOptional = [];
      dataWithFilteredOptionalSteps.map((res) =>
        res.admission_process_id && res.admission_process_id.steps ? dataOptional.push(res.admission_process_id.steps) : dataOptional,
      );
      console.log('dataOptional', dataOptional);
    }

    if (maxStepData && maxStepData !== 0) {
      this.totalSteps = maxStepData;
    } else if (!maxStepData && maxStepData === 0) {
      this.totalSteps = 0;
    }

    if (maxOptionalStepData && maxOptionalStepData !== 0) {
      this.totalOptionalSteps = maxOptionalStepData;
    } else if (!maxOptionalStepData && maxOptionalStepData === 0) {
      this.totalOptionalSteps = 0;
    }

    console.log('_max', maxStepData, maxOptionalStepData);
    console.log(this.totalSteps, this.totalOptionalSteps);

    let i = 0;
    if (maxStepData > 0) {
      for (i; i < this.totalSteps; i++) {
        this.displayedColumns.splice(-9, 0, `S${i + 1}`);
        this.filterColumns.splice(-9, 0, `S${i + 1}_filter`);
        stepColumns.push(`S${i + 1}`);
        this.steps.push(new UntypedFormControl(null));
      }
      console.log('his.filteredValues.student_admission_steps', this.filteredValues.student_admission_steps);
      console.log(this.steps.controls);
      if (this.filteredValues.student_admission_steps && this.filteredValues.student_admission_steps.length > 0) {
        this.filteredValues.student_admission_steps.forEach((element) => {
          this.steps.controls?.[element.step]?.setValue(element?.status);
        });
      }
    }

    // push the total number of optional steps into the displayedColumns and filterColumns
    let j = 0;
    if (maxOptionalStepData > 0) {
      for (j; j < this.totalOptionalSteps; j++) {
        this.displayedColumns.splice(-9, 0, `O${j + 1}`);
        this.filterColumns.splice(-9, 0, `O${j + 1}_filter`);
        optionalStepColumns.push(`O${j + 1}`);
        this.optionalSteps.push(new UntypedFormControl(null));
      }
      console.log('totalOptionalSteps', this.totalOptionalSteps);
      console.log('optional step control', this.optionalSteps.controls);
      console.log('filtered values student admision ', this.filteredValues.student_admission_steps);
      console.log('dataWithFilteredOptionalSteps', this.dataWithFilteredOptionalSteps);
      if (this.filteredValues.student_admission_steps && this.filteredValues.student_admission_steps.length > 0) {
        this.filteredValues.student_admission_steps.forEach((element) => {
          this.optionalSteps.controls[element.step].setValue(element.status);
        });
      }
    }

    this.displayedColumns = _.uniqBy(this.displayedColumns);
    this.filterColumns = _.uniqBy(this.filterColumns);

    console.log('_dis', this.displayedColumns);
    console.log('_fil', this.filterColumns);

    this.stepColumn = stepColumns;
    this.optionalStepColumns = optionalStepColumns;

    if (this.isStepsFiltered === true) {
      this.steps = this.tempSteps;
      this.tempOptionalSteps = this.optionalSteps;
    }
    this.subs.sink = this.ngZone.onMicrotaskEmpty.pipe(bufferCount(50),take(3)).subscribe((resp) => {
      this.table.updateStickyColumnStyles();
    });
    this.filterBreadcrumbData = [];
    this.filterBreadcrumbFormat();
  }

  stepFiltered(stepOption) {
    this.isStepsFiltered = true;
    this.tempSteps = this.steps;
    this.tempOptionalSteps = this.optionalSteps;
    const steps = [];

    this.steps.controls.forEach((element, index) => {
      if (element.value) {
        const step = {
          step: index,
          statuses: element.value,
          step_type_selected: `mandatory`,
        };
        steps.push(step);
      }
    });
    this.optionalSteps.controls.forEach((element, index) => {
      if (element.value) {
        const step = {
          step: index,
          statuses: element.value,
          // step_type_selected: `option`,
        };
        steps.push(step);
      }
    });

    let temp: any;
    if (steps.length > 0) {
      this.filteredValues.student_admission_steps = steps;
      temp = this.steps;
      if (JSON.stringify(this.tempDataFilter.steps) !== JSON.stringify(this.filteredValues.student_admission_steps)) {
        this.getCandidatesData('steps filter');
      }
      this.tempDataFilter.steps = steps;
    } else {
      this.filteredValues.student_admission_steps = null;
      temp = this.steps;
      if (this.tempDataFilter.steps?.length) {
        this.getCandidatesData('steps filter');
      }
      this.tempDataFilter.steps = [];
    }
    this.steps = temp;
  }

  hideActionButtonSeeAdmissionFile(element) {
    let allow;
    if (element && element.announcement_email && element.announcement_email.sent_date && element.announcement_email.sent_time) {
      allow = true;
    } else {
      allow = false;
    }
    return allow;
  }

  viewAdmissionFile(toCandidateId, toFormId) {
    if (toFormId) {
      const query = { formId: toFormId, formType: 'student_admission', userId: this.currentUser._id, userTypeId: this.currentUserTypeId };
      const url = this.router.createUrlTree(['/form-fill'], { queryParams: query });
      window.open(url.toString(), '_blank');
    }
  }

  validateSendEmail(element) {
    let allow = true;
    if (element && element.registration_profile && element.registration_profile !== '') {
      allow = false;
    }
    if (this.dataSelected && this.dataSelected.length > 0) {
      allow = true;
    }
    return allow;
  }

  sendReminder() {
    if (this.dataSelected.length < 1) {
      this.isWaitingForResponse = false;
      this.isLoading = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      if (
        this.dataSelected.some(
          (element) =>
            element.announcement_email && element.announcement_email.sent_date === '' && element.announcement_email.sent_time === '',
        )
      ) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('ReAdmission_S7.Title'),
          html: this.translate.instant('ReAdmission_S7.Text'),
          confirmButtonText: this.translate.instant('ReAdmission_S7.Button'),
        });
      } else {
        const candidateIds = this.dataSelected.map((list) => list._id);
        this.isWaitingForResponse = true;
        this.subs.sink = this.candidatesService.SendReadRegN2(candidateIds).subscribe(
          (list) => {
            this.isWaitingForResponse = false;
            this.isLoading = false;
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            });
            this.refetchDataKeepFilter();
          },
          (err) => {
            this.isWaitingForResponse = false;
            this.isLoading = false;
            console.log('Error :', err);
            this.userService.postErrorLog(err);
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            }).then(() => {
              this.refetchDataKeepFilter();
            });
          },
        );
      }
    }
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
      this.editJuryDecisionDialogComponent = this.dialog.open(EditJuryDecisionDialogComponent, {
        width: '660px',
        minHeight: '100px',
        disableClose: true,
        data: {
          id: this.dataSelected.map((list) => list._id),          
          data: this.dataSelected,
          from: 'readmission_follow_up'
        },
      });
      this.subs.sink = this.editJuryDecisionDialogComponent.afterClosed().subscribe((resulta) => {
        if (resulta) {
          this.refetchDataKeepFilter();
        }
        this.editJuryDecisionDialogComponent = null;
      });
    }
  }
  getDataSectorByLevel() {
    const scholar = this.scholarSeasonFilter.value && this.scholarSeasonFilter.value !== 'All' ? true : false;
    const school = this.schoolsFilter.value && this.schoolsFilter.value.length ? true : false;
    const campus = this.campusesFilter.value && this.campusesFilter.value.length ? true : false;
    const level = this.levelsFilter.value && this.levelsFilter.value.length ? true : false;
    let allSchool = [];
    let allCampus = [];
    let allLevel = [];
    if (this.schoolsFilter.value && this.schoolsFilter.value.includes('All') && this.listObjective && this.listObjective.length) {
      allSchool = this.listObjective.map((data) => data._id);
    }
    if (this.campusesFilter.value && this.campusesFilter.value.includes('All') && this.campuses && this.campuses.length) {
      allCampus = this.campuses.map((data) => data._id);
    }
    if (this.levelsFilter.value && this.levelsFilter.value.includes('All') && this.levels && this.levels.length) {
      allLevel = this.levels.map((data) => data._id);
    }
    const filter = {
      scholar_season_id: scholar ? this.scholarSeasonFilter.value : null,
      candidate_school_ids: allSchool && allSchool.length ? allSchool : school ? this.schoolsFilter.value : null,
      campuses: allCampus && allCampus.length ? allCampus : campus ? this.campusesFilter.value : null,
      levels: allLevel && allLevel.length ? allLevel : level ? this.levelsFilter.value : null,
    };
    this.sectorList = [];
    this.specilityList = [];
    if (school || campus) {
      this.subs.sink = this.financeService.GetAllSectorsDropdown(filter).subscribe(
        (resp) => {
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
          this.userService.postErrorLog(err);
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
      this.sectorsFilter.setValue(null);
      this.specialitiesFilter.setValue(null);
      this.superFilter.sectors = null;
      this.superFilter.specialities = null;
    }
  }

  getDataSpecialityBySector() {
    const scholar = this.scholarSeasonFilter.value && this.scholarSeasonFilter.value !== 'All' ? true : false;
    const school = this.schoolsFilter.value && this.schoolsFilter.value.length ? true : false;
    const campus = this.campusesFilter.value && this.campusesFilter.value.length ? true : false;
    const level = this.levelsFilter.value && this.levelsFilter.value.length ? true : false;
    const sector = this.sectorsFilter.value && this.sectorsFilter.value.length ? true : false;
    let allSchool = [];
    let allCampus = [];
    let allLevel = [];
    let allSector = [];
    if (this.schoolsFilter.value && this.schoolsFilter.value.includes('All') && this.listObjective && this.listObjective.length) {
      allSchool = this.listObjective.map((data) => data._id);
    }
    if (this.campusesFilter.value && this.campusesFilter.value.includes('All') && this.campuses && this.campuses.length) {
      allCampus = this.campuses.map((data) => data._id);
    }
    if (this.levelsFilter.value && this.levelsFilter.value.includes('All') && this.levels && this.levels.length) {
      allLevel = this.levels.map((data) => data._id);
    }
    if (this.sectorsFilter.value && this.sectorsFilter.value.includes('All') && this.sectorList && this.sectorList.length) {
      allSector = this.sectorList.map((data) => data._id);
    }
    const filter = {
      scholar_season_id: scholar ? this.scholarSeasonFilter.value : null,
      candidate_school_ids: allSchool && allSchool.length ? allSchool : school ? this.schoolsFilter.value : null,
      campuses: allCampus && allCampus.length ? allCampus : campus ? this.campusesFilter.value : null,
      levels: allLevel && allLevel.length ? allLevel : level ? this.levelsFilter.value : null,
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
          this.userService.postErrorLog(err);
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
      this.specialitiesFilter.setValue(null);
      this.superFilter.specialities = null;
    }
  }

  openTransferAdmission(data) {
    let isFc = false;
    if (
      data &&
      data.type_of_formation_id &&
      data.type_of_formation_id.type_of_formation &&
      data.type_of_formation_id.type_of_formation !== 'classic'
    ) {
      isFc = true;
    }

    if (isFc) {
      this.transferProgramFC(data);
    } else {
      if (!isFc) {
        const candidate = [];
        candidate.push(data);
        this.transferAdmissionDialogComponent = this.dialog.open(TransferAdmissionDialogComponent, {
          width: '600px',
          minHeight: '100px',
          panelClass: 'certification-rule-pop-up',
          disableClose: true,
          data: {
            data: candidate,
            from: 'readmission-transfer',
          },
        });
        this.subs.sink = this.transferAdmissionDialogComponent.afterClosed().subscribe((result) => {
          if (result) {
            this.refetchDataKeepFilter();
          }
          this.transferAdmissionDialogComponent = null;
        });
      } else {
        if (!data.payment || (data.payment !== 'done' && data.payment !== 'paid')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('Followups_S17.Title'),
            html: this.translate.instant('Followups_S17.Text', {
              name:
                data.last_name.toUpperCase() +
                ' ' +
                data.first_name +
                ' ' +
                (data.civility && data.civility === 'neutral' ? '' : this.translate.instant(data.civility)),
            }),
            confirmButtonText: this.translate.instant('Followups_S17.Button'),
          });
          return;
        }
      }
    }
  }
  transferProgramFC(data) {
    if (data.payment !== 'sepa_pending' && data.payment !== 'pending') {
      this.getAllAdmissionFinancement(data);
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Transfer_Program_S1.TITLE'),
        html: this.translate.instant('Transfer_Program_S1.TEXT'),
        confirmButtonText: this.translate.instant('Transfer_Program_S1.BUTTON'),
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: false,
      });
    }
  }

  getAllAdmissionFinancement(data) {
    console.log('data', data);
    if (data) {
      const filter = {
        candidate_id: data._id,
        admission_process_id: data.admission_process_id && data.admission_process_id._id ? data.admission_process_id._id : null,
        program_id: data.intake_channel && data.intake_channel._id ? data.intake_channel._id : null,
      };
      this.isWaitingForResponse = true;
      this.subs.sink = this.candidatesService.getAllAdmissionFinancementsTransfer(filter).subscribe(
        (resp) => {
          console.log('resp', resp);
          this.isWaitingForResponse = false;
          const financement = _.cloneDeep(resp);
          let checkActualStatus = [];
          if (financement && financement.length) {
            checkActualStatus = financement.filter((status) => status.actual_status === 'accepted');
          }
          if (checkActualStatus && checkActualStatus.length > 0) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('Transfer_Program_S2.TITLE'),
              html: this.translate.instant('Transfer_Program_S2.TEXT'),
              confirmButtonText: this.translate.instant('Transfer_Program_S2.BUTTON'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          } else {
            this.openTransferProgramFC(data);
          }
        },
        (err) => {
          this.userService.postErrorLog(err);
          this.isWaitingForResponse = false;
        },
      );
    }
  }
  openTransferProgramFC(data) {
    const candidate = [];
    candidate.push(data);
    this.subs.sink = this.dialog
      .open(TransferFcProgramCandidateDialogComponent, {
        width: '600px',
        minHeight: '100px',
        maxHeight: '600px',
        disableClose: true,
        panelClass: 'certification-rule-pop-up',
        data: {
          data: candidate,
          from: 'readmission-transfer',
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.refetchDataKeepFilter();
        }
      });
  }

  openAssignMemberFc(data, type) {
    // new function
    if (type === 'button' && this.dataSelected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      const isContinous = this.dataSelected.every(
        (res) =>
          res.type_of_formation_id.type_of_formation === 'continuous_total_funding' ||
          res.type_of_formation_id.type_of_formation === 'continuous_partial_funding' ||
          res.type_of_formation_id.type_of_formation === 'continuous_personal_funding' ||
          res.type_of_formation_id.type_of_formation === 'continuous_contract_pro',
      );
      const isClassic = this.dataSelected.every((res) => res.type_of_formation_id.type_of_formation === 'classic');
      const isMixed = !isContinous && !isClassic ? true : false;

      console.log('_test', isContinous, isClassic, isMixed);
      if (isMixed && type === 'button') {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('ReAdmission_S5.Title'),
          html: this.translate.instant('ReAdmission_S5.Text'),
          confirmButtonText: this.translate.instant('ReAdmission_S5.Button'),
        });
      } else {
        const candidate = [];
        candidate.push(data);
        this.assignMemberFcDialogComponent = this.dialog.open(AssignMemberFcDialogComponent, {
          width: '650px',
          minHeight: '100px',
          panelClass: 'certification-rule-pop-up',
          disableClose: true,
          data: {
            data: this.dataSelected && this.dataSelected.length ? this.dataSelected : candidate,
            type: 're-admission',
          },
        });
        this.subs.sink = this.assignMemberFcDialogComponent.afterClosed().subscribe((resulta) => {
          if (resulta) {
            this.refetchDataKeepFilter();
          }
          this.assignMemberFcDialogComponent = null;
        });
      }
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
            this.allCandidateData = [];
          }
          const pagination = {
            limit: 500,
            page: pageNumber,
          };
          this.isLoading = true;
          const filter = this.cleanFilterData();
          const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
          this.subs.sink = this.candidatesService
            .getAllIdForReadmissionCheckbox(pagination, this.sortValue, filter, this.searching, userTypesList)
            .subscribe(
              (students: any) => {
                if (students && students.length) {
                  const resp = _.cloneDeep(students);
                  this.allExportForCheckbox = _.concat(this.allExportForCheckbox, resp);
                  const page = pageNumber + 1;
                  this.getAllIdForCheckbox(page);
                } else {
                  this.isLoading = false;
                  if (this.isCheckedAll && this.allExportForCheckbox && this.allExportForCheckbox.length) {
                    this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                    this.allCandidateData = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                    this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                    console.log('getAllIdForCheckbox', this.dataSelected);
                    if (this.dataSelected && this.dataSelected.length && this.buttonClicked === 'export') {
                      this.downloadCSV();
                    }
                  }
                }
              },
              (error) => {
                this.isReset = false;
                this.isLoading = false;
                this.userService.postErrorLog(error);
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
  getDataRegisProfil(pageNumber) {
    if (this.buttonClicked === 'regis') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allRegisForCheckbox = [];
          this.dataSelected = [];
          this.allCandidateData = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const filter = this.cleanFilterData();
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        this.subs.sink = this.candidatesService
          .getReadmissionDataRegisProfil(pagination, this.sortValue, filter, this.searching, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allRegisForCheckbox = _.concat(this.allRegisForCheckbox, resp);
                const page = pageNumber + 1;
                this.getDataRegisProfil(page);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allRegisForCheckbox && this.allRegisForCheckbox.length) {
                  this.dataSelected = this.allRegisForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.allCandidateData = this.allRegisForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  console.log('getReadmissionDataRegisProfil', this.dataSelected);
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length && this.buttonClicked === 'regis') {
                    this.openAssignRateProfile('', 'button');
                  }
                }
              }
            },
            (error) => {
              this.isReset = false;
              this.isLoading = false;
              this.userService.postErrorLog(error);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('OK'),
              });
            },
          );
      } else {
        this.openAssignRateProfile(this.dataSelected, 'button');
      }
    }
  }
  getDataForFirstMail(pageNumber) {
    if (this.buttonClicked === 'announcment') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allAnnoucmentForCheckbox = [];
          this.dataSelected = [];
          this.allCandidateData = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const filter = this.cleanFilterData();
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        this.subs.sink = this.candidatesService
          .getReadmissionDataForFirstMail(pagination, this.sortValue, filter, this.searching, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allAnnoucmentForCheckbox = _.concat(this.allAnnoucmentForCheckbox, resp);
                const page = pageNumber + 1;
                this.getDataForFirstMail(page);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allAnnoucmentForCheckbox && this.allAnnoucmentForCheckbox.length) {
                  this.dataSelected = this.allAnnoucmentForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.allCandidateData = this.allAnnoucmentForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  console.log('getReadmissionDataForFirstMail', this.dataSelected);
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length && this.buttonClicked === 'announcment') {
                    this.sendReadmissionEmail(null, 'many');
                  }
                }
              }
            },
            (error) => {
              this.isReset = false;
              this.isLoading = false;
              this.userService.postErrorLog(error);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('OK'),
              });
            },
          );
      } else {
        this.sendReadmissionEmail(this.dataSelected, 'many');
      }
    }
  }
  getReadmissionDataForDevMember(pageNumber) {
    if (this.buttonClicked === 'member') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allMemberForCheckbox = [];
          this.dataSelected = [];
          this.allCandidateData = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const filter = this.cleanFilterData();
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        this.subs.sink = this.candidatesService
          .getReadmissionDataForDevMember(pagination, this.sortValue, filter, this.searching, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allMemberForCheckbox = _.concat(this.allMemberForCheckbox, resp);
                const page = pageNumber + 1;
                this.getReadmissionDataForDevMember(page);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allMemberForCheckbox && this.allMemberForCheckbox.length) {
                  this.dataSelected = this.allMemberForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.allCandidateData = this.allMemberForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  console.log('getReadmissionDataRegisProfil', this.dataSelected);
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length && this.buttonClicked === 'member') {
                    this.openAssignMemberFc('', 'button');
                  }
                }
              }
            },
            (error) => {
              this.isReset = false;
              this.isLoading = false;
              this.userService.postErrorLog(error);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('OK'),
              });
            },
          );
      } else {
        this.openAssignMemberFc(this.dataSelected, 'button');
      }
    }
  }
  getReadmissionDataForSendMail(pageNumber) {
    if (this.buttonClicked === 'email') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allEmailForCheckbox = [];
          this.dataSelected = [];
          this.allCandidateData = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const filter = this.cleanFilterData();
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        this.subs.sink = this.candidatesService
          .getReadmissionDataForSendMail(pagination, this.sortValue, filter, this.searching, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allEmailForCheckbox = _.concat(this.allEmailForCheckbox, resp);
                const page = pageNumber + 1;
                this.getReadmissionDataForSendMail(page);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allEmailForCheckbox && this.allEmailForCheckbox.length) {
                  this.dataSelected = this.allEmailForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.allCandidateData = this.allEmailForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  console.log('getReadmissionDataForFirstMail', this.dataSelected);
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length && this.buttonClicked === 'email') {
                    this.sendMultipleEmail();
                  }
                }
              }
            },
            (error) => {
              this.isReset = false;
              this.isLoading = false;
              this.userService.postErrorLog(error);
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
  getReadmissionDataForEditJury(pageNumber) {
    if (this.buttonClicked === 'jury') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allJuryForCheckbox = [];
          this.dataSelected = [];
          this.allCandidateData = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const filter = this.cleanFilterData();
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        this.subs.sink = this.candidatesService
          .getReadmissionDataForEditJury(pagination, this.sortValue, filter, this.searching, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allJuryForCheckbox = _.concat(this.allJuryForCheckbox, resp);
                const page = pageNumber + 1;
                this.getReadmissionDataForEditJury(page);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allJuryForCheckbox && this.allJuryForCheckbox.length) {
                  this.dataSelected = this.allJuryForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.allCandidateData = this.allJuryForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  console.log('getReadmissionDataForFirstMail', this.dataSelected);
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length && this.buttonClicked === 'jury') {
                    this.editJury();
                  }
                }
              }
            },
            (error) => {
              this.isReset = false;
              this.isLoading = false;
              this.userService.postErrorLog(error);
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
  getReadmissionDataForReminder(pageNumber) {
    if (this.buttonClicked === 'reminder') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allReminderForCheckbox = [];
          this.dataSelected = [];
          this.allCandidateData = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const filter = this.cleanFilterData();
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        this.subs.sink = this.candidatesService
          .getReadmissionDataForReminder(pagination, this.sortValue, filter, this.searching, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allReminderForCheckbox = _.concat(this.allReminderForCheckbox, resp);
                const page = pageNumber + 1;
                this.getReadmissionDataForReminder(page);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allReminderForCheckbox && this.allReminderForCheckbox.length) {
                  this.dataSelected = this.allReminderForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.allCandidateData = this.allReminderForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  console.log('getReadmissionDataForFirstMail', this.dataSelected);
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length && this.buttonClicked === 'reminder') {
                    this.sendReminder();
                  }
                }
              }
            },
            (error) => {
              this.isReset = false;
              this.isLoading = false;
              this.userService.postErrorLog(error);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('OK'),
              });
            },
          );
      } else {
        this.sendReminder();
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
      case 'regis':
        setTimeout(() => {
          this.getDataRegisProfil(0);
        }, 500);
        break;
      case 'announcment':
        setTimeout(() => {
          this.getDataForFirstMail(0);
        }, 500);
        break;
      case 'email':
        setTimeout(() => {
          this.getReadmissionDataForSendMail(0);
        }, 500);
        break;
      case 'member':
        setTimeout(() => {
          this.getReadmissionDataForDevMember(0);
        }, 500);
        break;
      case 'jury':
        setTimeout(() => {
          this.getReadmissionDataForEditJury(0);
        }, 500);
        break;
      case 'reminder':
        setTimeout(() => {
          this.getReadmissionDataForReminder(0);
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
      schools: this.superFilter.schools,
      campuses: this.superFilter.campuses,
      levels: this.superFilter.levels,
      sectors: this.superFilter.sectors,
      specialities: this.superFilter.specialities,
      tags: this.superFilter.tags,
    };
    this.paginator.firstPage();
    this.isReset = true;
    this.isDisabled = true;
    this.getCandidatesData('superFilter');
  }
  getUpdatedData(candidateIds, data, pageNumber) {
    this.isWaitingForResponse = true;
    this.filteredValues['candidate_ids'] = candidateIds;
    const filter = this.cleanFilterData('getUpdatedData');
    let pagination;
    if (data.length <= 10) {
      pagination = {
        limit: data.length,
        page: pageNumber,
      };
    } else {
      pagination = {
        limit: 500,
        page: pageNumber,
      };
    }
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService
      .getReadmissionDataForAdmissionId(pagination, this.sortValue, filter, this.searching, userTypesList)
      .subscribe(
        (students: any) => {
          this.filteredValues['candidate_ids'] = null;
          if (data.length <= 10) {
            if (students && students.length) {
              this.studentsData = _.cloneDeep(students);
              this.studentsData.forEach((elem) => {
                data.forEach((elem2) => {
                  delete elem2.admission_process_id;
                  elem2['admission_process_id'] = elem.admission_process_id;
                  return elem2;
                });
              });
              if (this.studentsData.length) {
                const filters = {
                  candidates_id: candidateIds,
                  template_type: 'student_admission',
                };
                const sourceData = this.studentsData;
                const filteredData = sourceData.filter((res) => candidateIds.includes(res._id));
                const candidateAdmissionIds = filteredData.map((res) => res?.admission_process_id?._id);

                this.isLoading = true;
                this.admissionNeedValidator = [];
                this.subs.sink = this.candidatesService.GetAllStudentAdmissionProcesses(filters).subscribe(
                  (list) => {
                    this.isLoading = false;
                    if (list && list.length) {
                      list.forEach((elements) => {
                        if (elements.steps && elements.steps.length && candidateAdmissionIds.includes(elements._id)) {
                          const steps = elements.steps.filter((step) => step.is_validation_required);
                          if (steps && steps.length) {
                            this.admissionNeedValidator = _.concat(this.admissionNeedValidator, steps);
                          }
                        }
                        this.admissionNeedValidator = _.uniqBy(this.admissionNeedValidator, '_id');
                        console.log('this.admissionNeedValidator', this.admissionNeedValidator);
                      });
                      if (this.admissionNeedValidator && this.admissionNeedValidator.length) {
                        this.sendEmailValidatorDialogComponent = this.dialog.open(SendEmailValidatorDialogComponent, {
                          width: '800px',
                          minHeight: '300px',
                          panelClass: 'no-padding',
                          disableClose: true,
                          data: {
                            data: data,
                            isNeedValidator: true,
                            isResendMail: false,
                            isFc: false,
                            isReadmission: true,
                          },
                        });
                        this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
                          if (result) {
                            this.refetchDataKeepFilter();
                          }
                          this.sendEmailValidatorDialogComponent = null;
                        });
                      } else {
                        this.sendEmailValidatorDialogComponent = this.dialog.open(SendEmailValidatorDialogComponent, {
                          width: '800px',
                          minHeight: '300px',
                          panelClass: 'no-padding',
                          disableClose: true,
                          data: {
                            data: data,
                            isNeedValidator: false,
                            isResendMail: false,
                            isFc: false,
                            isReadmission: true,
                          },
                        });
                        this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
                          if (result) {
                            this.refetchDataKeepFilter();
                          }
                          this.sendEmailValidatorDialogComponent = null;
                        });
                      }
                    } else {
                      this.sendEmailValidatorDialogComponent = this.dialog.open(SendEmailValidatorDialogComponent, {
                        width: '800px',
                        minHeight: '300px',
                        panelClass: 'no-padding',
                        disableClose: true,
                        data: {
                          data: data,
                          isNeedValidator: false,
                          isResendMail: false,
                          isFc: false,
                          isReadmission: true,
                        },
                      });
                      this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
                        if (result) {
                          this.refetchDataKeepFilter();
                        }
                        this.sendEmailValidatorDialogComponent = null;
                      });
                    }
                  },
                  (err) => {
                    this.isLoading = false;
                    // console.log('Error :', err);
                    this.userService.postErrorLog(err);
                    this.sendEmailValidatorDialogComponent = this.dialog.open(SendEmailValidatorDialogComponent, {
                      width: '800px',
                      minHeight: '300px',
                      panelClass: 'no-padding',
                      disableClose: true,
                      data: {
                        data: data,
                        isNeedValidator: false,
                        isResendMail: false,
                        isFc: false,
                        isReadmission: true,
                      },
                    });
                    this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
                      if (result) {
                        this.refetchDataKeepFilter();
                      }
                      this.sendEmailValidatorDialogComponent = null;
                    });
                  },
                );
              }
            }
            this.isWaitingForResponse = false;
          } else {
            if (students && students.length) {
              const resp = _.cloneDeep(students);
              const totalPage = Math.floor(data.length / 500);
              this.allAnnoucmentForCheckbox = _.concat(this.allAnnoucmentForCheckbox, resp);
              let page;
              if (page < totalPage) {
                page = pageNumber + 1;
                this.getUpdatedData(candidateIds, data, page);
              } else {
                this.isWaitingForResponse = false;
                this.studentsData = this.allAnnoucmentForCheckbox.filter((list) => candidateIds.includes(list._id));
                this.studentsData = _.uniqBy(this.studentsData, '_id');
                this.studentsData.forEach((elem) => {
                  data.forEach((elem2) => {
                    delete elem2.admission_process_id;
                    elem2['admission_process_id'] = elem.admission_process_id;
                    return elem2;
                  });
                });
                if (this.studentsData.length) {
                  const filters = {
                    candidates_id: candidateIds,
                    template_type: 'student_admission',
                  };
                  const sourceData = this.studentsData;
                  const filteredData = sourceData.filter((res) => candidateIds.includes(res._id));

                  const candidateAdmissionIds = filteredData.map((res) => res?.admission_process_id?._id);
                  this.isLoading = true;
                  this.admissionNeedValidator = [];
                  this.subs.sink = this.candidatesService.GetAllStudentAdmissionProcesses(filters).subscribe(
                    (list) => {
                      this.isLoading = false;
                      if (list && list.length) {
                        list.forEach((elements) => {
                          if (elements.steps && elements.steps.length && candidateAdmissionIds.includes(elements._id)) {
                            const steps = elements.steps.filter((step) => step.is_validation_required);
                            if (steps && steps.length) {
                              this.admissionNeedValidator = _.concat(this.admissionNeedValidator, steps);
                            }
                          }
                          this.admissionNeedValidator = _.uniqBy(this.admissionNeedValidator, '_id');
                          console.log('this.admissionNeedValidator', this.admissionNeedValidator);
                        });
                      }
                      this.triggerDialogSendMailDirectly(list, data);
                    },
                    (err) => {
                      this.isLoading = false;
                      // console.log('Error :', err);
                      this.userService.postErrorLog(err);
                      this.sendEmailValidatorDialogComponent = this.dialog.open(SendEmailValidatorDialogComponent, {
                        width: '800px',
                        minHeight: '300px',
                        panelClass: 'no-padding',
                        disableClose: true,
                        data: {
                          data: data,
                          isNeedValidator: false,
                          isResendMail: false,
                          isFc: false,
                          isReadmission: true,
                        },
                      });
                      this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
                        if (result) {
                          this.refetchDataKeepFilter();
                        }
                        this.sendEmailValidatorDialogComponent = null;
                      });
                    },
                  );
                }
              }
            } else {
              this.isWaitingForResponse = false;
              this.studentsData = this.allAnnoucmentForCheckbox.filter((list) => candidateIds.includes(list._id));
              this.studentsData = _.uniqBy(this.studentsData, '_id');
              this.studentsData.forEach((elem) => {
                data.forEach((elem2) => {
                  delete elem2.admission_process_id;
                  elem2['admission_process_id'] = elem.admission_process_id;
                  return elem2;
                });
              });
              console.log('_test 2', data);
              if (this.studentsData.length) {
                const filters = {
                  candidates_id: candidateIds,
                  template_type: 'student_admission',
                };
                const sourceData = this.studentsData;
                const filteredData = sourceData.filter((res) => candidateIds.includes(res._id));
                const candidateAdmissionIds = filteredData.map((res) => res?.admission_process_id?._id);
                this.isLoading = true;
                this.admissionNeedValidator = [];
                this.subs.sink = this.candidatesService.GetAllStudentAdmissionProcesses(filters).subscribe(
                  (list) => {
                    this.isLoading = false;
                    if (list && list.length) {
                      list.forEach((elements) => {
                        if (elements.steps && elements.steps.length && candidateAdmissionIds.includes(elements._id)) {
                          const steps = elements.steps.filter((step) => step.is_validation_required);
                          if (steps && steps.length) {
                            this.admissionNeedValidator = _.concat(this.admissionNeedValidator, steps);
                          }
                        }
                        this.admissionNeedValidator = _.uniqBy(this.admissionNeedValidator, '_id');
                        console.log('this.admissionNeedValidator', this.admissionNeedValidator);
                      });
                    }
                    this.triggerDialogSendMailDirectly(list, data);
                  },
                  (err) => {
                    this.isLoading = false;
                    // console.log('Error :', err);
                    this.userService.postErrorLog(err);
                    this.sendEmailValidatorDialogComponent = this.dialog.open(SendEmailValidatorDialogComponent, {
                      width: '800px',
                      minHeight: '300px',
                      panelClass: 'no-padding',
                      disableClose: true,
                      data: {
                        data: data,
                        isNeedValidator: false,
                        isResendMail: false,
                        isFc: false,
                        isReadmission: true,
                      },
                    });
                    this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
                      if (result) {
                        this.refetchDataKeepFilter();
                      }
                      this.sendEmailValidatorDialogComponent = null;
                    });
                  },
                );
              }
            }
          }
        },
        (error) => {
          this.isReset = false;
          this.isWaitingForResponse = false;
          this.userService.postErrorLog(error);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        },
      );
  }
  triggerDialogSendMailDirectly(list, data) {
    this.subs.unsubscribe();
    if (list && list.length) {
      if (this.admissionNeedValidator && this.admissionNeedValidator.length) {
        this.sendEmailValidatorDialogComponent = this.dialog.open(SendEmailValidatorDialogComponent, {
          width: '800px',
          minHeight: '300px',
          panelClass: 'no-padding',
          disableClose: true,
          data: {
            data: data,
            isNeedValidator: true,
            isResendMail: false,
            isFc: false,
            isReadmission: true,
          },
        });
        this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
          if (result) {
            this.refetchDataKeepFilter();
          }
          this.sendEmailValidatorDialogComponent = null;
        });
      } else {
        this.sendEmailValidatorDialogComponent = this.dialog.open(SendEmailValidatorDialogComponent, {
          width: '800px',
          minHeight: '300px',
          panelClass: 'no-padding',
          disableClose: true,
          data: {
            data: data,
            isNeedValidator: false,
            isResendMail: false,
            isFc: false,
            isReadmission: true,
          },
        });
        this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
          if (result) {
            this.refetchDataKeepFilter();
          }
          this.sendEmailValidatorDialogComponent = null;
        });
      }
    } else {
      this.sendEmailValidatorDialogComponent = this.dialog.open(SendEmailValidatorDialogComponent, {
        width: '800px',
        minHeight: '300px',
        panelClass: 'no-padding',
        disableClose: true,
        data: {
          data: data,
          isNeedValidator: false,
          isResendMail: false,
          isFc: false,
          isReadmission: true,
        },
      });
      this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
        if (result) {
          this.refetchDataKeepFilter();
        }
        this.sendEmailValidatorDialogComponent = null;
      });
    }
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem?.name === 'statuses' && this.filteredValues?.student_admission_steps?.length && this.stepColumn?.length) {
      const stepColumnIndex = this.stepColumn.findIndex((step) => step === filterItem?.column);
      if (stepColumnIndex !== -1) {
        const stepFilteredValueIndex = this.checkFiltedStepIndex(stepColumnIndex);
        this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, null);
        if (stepFilteredValueIndex >= 0) {
          this.filteredValues?.student_admission_steps?.splice(stepFilteredValueIndex, 1);
        }
      }
    } else {
      if (filterItem.name === 'scholar_season') {
        this.scholarSeasonFilter.setValue(this.currScholarSeason?._id,{emitEvent:false});
        this.filteredValues.scholar_season = this.scholarSeasonFilter.value && this.scholarSeasonFilter.value!=='All' ? this.scholarSeasonFilter.value : '';
        this.filteredValues.schools = null;
        this.filteredValues.campuses = null;
        this.filteredValues.levels = null;
        this.filteredValues.sectors = null;
        this.filteredValues.specialities = null;
        this.superFilter.scholar_season = this.scholarSeasonFilter.value && this.scholarSeasonFilter.value!=='All' ? this.scholarSeasonFilter.value : '';
        this.superFilter.levels = '';
        this.superFilter.campuses = '';
        this.superFilter.schools = '';  
        this.scholarSelect();
      } else if (filterItem.name === 'schools') {
        this.schoolsFilter.setValue('');
        this.filteredValues.schools = null;
        this.filteredValues.campuses = null;
        this.filteredValues.levels = null;
        this.filteredValues.sectors = null;
        this.filteredValues.specialities = null;
        this.checkSuperFilterSchool();
      } else if (filterItem.name === 'campuses') {
        this.campusesFilter.setValue('');
        this.filteredValues.campuses = null;
        this.filteredValues.levels = null;
        this.filteredValues.sectors = null;
        this.filteredValues.specialities = null;
        this.checkSuperFilterCampus();
      } else if (filterItem.name === 'levels') {
        this.levelsFilter.setValue('');
        this.filteredValues.levels = null;
        this.filteredValues.sectors = null;
        this.filteredValues.specialities = null;
        this.checkSuperFilterLevel();
      } else if (filterItem.name === 'sectors') {
        this.sectorsFilter.setValue('');
        this.filteredValues.sectors = null;
        this.filteredValues.specialities = null;
        this.checkSuperFilterSector();
      } else if (filterItem.name === 'specialities') {
        this.specialitiesFilter.setValue('');
        this.filteredValues.specialities = null;
      }else if (filterItem.column === 'READMISSION.Registration profile') {
        this.registrationProfileFilter.setValue(null, { emitEvent: false });
        this.filteredValues.registration_profile_statuses = null;
        this.filteredValues.registration_profile = null;
      } else if (filterItem.column === 'READMISSION.Down payment') {
        this.filteredValues.payments = null;
        this.filteredValues.is_deposit_paids = null;
        this.downPaymentFilter.setValue(null, { emitEvent: false });
      } else {
        this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.superFilter, this.filteredValues);
      }
    }
    if (filterItem.type === 'table_filter' && this.searching && filterItem.name === 'continuous_formation_manager_id') {
      this.searching[filterItem.name] = '';
    }
    this.clearSelectIfFilter();
    this.getCandidatesData('remove filter');
  }

  checkFiltedStepIndex(stepColumn) {
    const findIndex = this.filteredValues.student_admission_steps.findIndex((step) => step.step === stepColumn);
    console.log('findIndex', findIndex);
    return findIndex;
  }

  filterBreadcrumbFormat(dynamicData?) {
    // to handle dynamic step column
    const stepColumnfilterInfo = [];
    this.stepColumn.forEach((element, index) => {
      const stepFilter = {
        type: 'table_filter',
        name:
          this.steps?.controls[index]?.value?.length && this.steps?.controls[index]?.value?.length !== this.listStepSone?.length
            ? 'statuses'
            : index.toString(),
        column: element,
        isMultiple: this.steps?.controls[index]?.value?.length === this.listStepSone?.length ? false : true,
        filterValue:
          this.steps?.controls[index]?.value?.length === this.listStepSone?.length
            ? this.filteredValuesAll
            : this.filteredValues?.student_admission_steps?.length && this.checkFiltedStepIndex(index) !== -1
            ? this.filteredValues?.student_admission_steps[this.checkFiltedStepIndex(index)]
            : null,
        filterList: this.steps?.controls[index]?.value?.length === this.listStepSone?.length ? null : this.listStepSone,
        filterRef: this.steps?.controls[index],
        displayKey: this.steps?.controls[index]?.value?.length === this.listStepSone?.length ? null : 'value',
        savedValue: this.steps?.controls[index]?.value?.length === this.listStepSone?.length ? null : 'key',
        isSelectionInput: this.steps?.controls[index]?.value?.length === this.listStepSone?.length ? false : true,
        resetValue: null,
      };
      stepColumnfilterInfo.push(stepFilter);
    });
    const allProfileRate = [];
    if (this.isCheckedAllDropdown) {
      if (this.filteredValues.registration_profile_statuses) {
        allProfileRate.push(...this.filteredValues.registration_profile_statuses);
      }
      if (this.filteredValues.registration_profile) {
        allProfileRate.push(...this.filteredValues.registration_profile);
      }
    }
    const paymentValue = [];
    if (this.filteredValues.payment) {
      paymentValue.push(...this.filteredValues.payment);
    }
    if (this.filteredValues.is_deposit_paid) {
      paymentValue.push(...this.filteredValues.is_deposit_paid);
    }
    const profileRate = this.isCheckedAllDropdown
      ? allProfileRate
      : this.filteredValues['registration_profile_statuses']
      ? this.filteredValues['registration_profile_statuses']
      : this.filteredValues['registration_profile'];

    const studentStatusFilterValue = {
      candidate_admission_statuses:
        this.statusFilter?.value?.length && !this.statusFilter?.value?.includes('All') && this.filteredValues?.candidate_admission_statuses
          ? this.filteredValues?.candidate_admission_statuses
          : null,
    };

    const dataDownPayment = {
      down_payment:
        this.filteredValues.payments?.length && this.filteredValues.is_deposit_paids?.length
          ? this.filteredValues.is_deposit_paids.concat(this.filteredValues.payments)
          : !this.filteredValues.payments?.length && this.filteredValues.is_deposit_paids?.length
          ? this.filteredValues.is_deposit_paids
          : this.filteredValues.payments,
    };

    const filterInfo: FilterBreadCrumbInput[] = [
      ...stepColumnfilterInfo,
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'scholar_season', // name of the key in the object storing the filter
        column: 'CARDDETAIL.Scholar Season', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.superFilter, // the object holding the filter value (e.g. filteredValues | superFilter)
        filterList: this.scholars, // the array/list holding the dropdown options
        filterRef: this.scholarSeasonFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'scholar_season', // the key displayed in the html (only applicable to array of objects)
        savedValue: '_id', // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'super_filter',
        name: 'schools',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.School',
        isMultiple: this.schoolsFilter?.value?.length === this.schools?.length ? false : true,
        filterValue: this.schoolsFilter?.value?.length === this.schools?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.schoolsFilter?.value?.length === this.schools?.length ? null : this.schools,
        filterRef: this.schoolsFilter,
        displayKey: this.schoolsFilter?.value?.length === this.schools?.length ? null : 'short_name',
        savedValue: this.schoolsFilter?.value?.length === this.schools?.length ? null : '_id',
        isSelectionInput: this.schoolsFilter?.value?.length === this.schools?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'campuses',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus',
        isMultiple: this.campusesFilter?.value?.length === this.campuses?.length ? false : true,
        filterValue: this.campusesFilter?.value?.length === this.campuses?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.campusesFilter?.value?.length === this.campuses?.length ? null : this.campuses,
        filterRef: this.campusesFilter,
        displayKey: this.campusesFilter?.value?.length === this.campuses?.length ? null : 'name',
        savedValue: this.campusesFilter?.value?.length === this.campuses?.length ? null : '_id',
        isSelectionInput: this.campusesFilter?.value?.length === this.campuses?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'levels',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level',
        isMultiple: this.levelsFilter?.value?.length === this.levels?.length ? false : true,
        filterValue: this.levelsFilter?.value?.length === this.levels?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.levelsFilter?.value?.length === this.levels?.length ? null : this.levels,
        filterRef: this.levelsFilter,
        displayKey: this.levelsFilter?.value?.length === this.levels?.length ? null : 'name',
        savedValue: this.levelsFilter?.value?.length === this.levels?.length ? null : '_id',
        isSelectionInput: this.levelsFilter?.value?.length === this.levels?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'sectors',
        column: 'ALUMNI.Sector',
        isMultiple: this.sectorsFilter?.value?.length === this.sectorList?.length ? false : true,
        filterValue: this.sectorsFilter?.value?.length === this.sectorList?.length ? this.filteredValuesAll : this.superFilter,
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
        filterValue: this.specialitiesFilter?.value?.length === this.specilityList?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.specialitiesFilter?.value?.length === this.specilityList?.length ? null : this.specilityList,
        filterRef: this.specialitiesFilter,
        displayKey: this.specialitiesFilter?.value?.length === this.specilityList?.length ? null : 'name',
        savedValue: this.specialitiesFilter?.value?.length === this.specilityList?.length ? null : '_id',
        isSelectionInput: this.specialitiesFilter?.value?.length === this.specilityList?.length ? false : true,
      },
      // Table Filters below
      {
        type: 'table_filter',
        name: 'sigle',
        column: 'Type of Formation',
        isMultiple: this.sigleFilter?.value?.length === this.listSigle?.length ? false : true,
        filterValue: this.sigleFilter?.value?.length === this.listSigle?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.sigleFilter?.value?.length === this.listSigle?.length ? null : this.listSigle,
        filterRef: this.sigleFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: this.sigleFilter?.value?.length === this.listSigle?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'candidate_unique_number',
        column: 'READMISSION.Student number',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.studentNumberFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'candidate',
        column: 'READMISSION.Name',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.nameFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'latest_previous_program',
        column: 'READMISSION.Previous program',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.previousProgramFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'intake_channel_name',
        column: 'READMISSION.Readmission program',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.readmissionProgramFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'type_of_readmissions',
        column: 'READMISSION.Type of readmission',
        isMultiple: this.typeOfReadmissionFilter?.value?.length === this.typeOfReadmissionList?.length ? false : true,
        filterValue:
          this.typeOfReadmissionFilter?.value?.length === this.typeOfReadmissionList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.typeOfReadmissionFilter?.value?.length === this.typeOfReadmissionList?.length ? null : this.typeOfReadmissionList,
        filterRef: this.typeOfReadmissionFilter,
        displayKey: this.typeOfReadmissionFilter?.value?.length === this.typeOfReadmissionList?.length ? null : 'key',
        savedValue: this.typeOfReadmissionFilter?.value?.length === this.typeOfReadmissionList?.length ? null : 'value',
        isSelectionInput: this.typeOfReadmissionFilter?.value?.length === this.typeOfReadmissionList?.length ? false : true,
        translationPrefix: this.typeOfReadmissionFilter?.value?.length === this.typeOfReadmissionList?.length ? null : 'READMISSION.',
      },
      {
        type: 'table_filter',
        name: 'candidate_admission_statuses',
        column: 'READMISSION.Status',
        isMultiple: this.statusFilter?.value?.length === this.studentStatusFilterList?.length ? false : true,
        filterValue:
          this.statusFilter?.value?.length === this.studentStatusFilterList?.length ? this.filteredValuesAll : studentStatusFilterValue,
        filterList: this.statusFilter?.value?.length === this.studentStatusFilterList?.length ? null : this.studentStatusFilterList,
        filterRef: this.statusFilter,
        displayKey: this.statusFilter?.value?.length === this.studentStatusFilterList?.length ? null : 'key',
        savedValue: this.statusFilter?.value?.length === this.studentStatusFilterList?.length ? null : 'value',
        isSelectionInput: this.statusFilter?.value?.length === this.studentStatusFilterList?.length ? false : true,
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'jury_decisions',
        column: 'Jury Decision',
        isMultiple: this.juryFilter?.value?.length === this.juryList?.length ? false : true,
        filterValue: this.juryFilter?.value?.length === this.juryList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.juryFilter?.value?.length === this.juryList?.length ? null : this.juryList,
        filterRef: this.juryFilter,
        displayKey: this.juryFilter?.value?.length === this.juryList?.length ? null : 'value',
        savedValue: this.juryFilter?.value?.length === this.juryList?.length ? null : 'value',
        isSelectionInput: this.juryFilter?.value?.length === this.juryList?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: this.filteredValues['registration_profile_statuses'] ? 'registration_profile_statuses' : 'registration_profile',
        column: 'READMISSION.Registration profile',
        isMultiple: this.registrationProfileFilter?.value?.length === this.profileRateFilterList?.length - 2 ? false : true,
        filterValue:
          this.registrationProfileFilter?.value?.length === this.profileRateFilterList?.length - 2
            ? this.filteredValuesAll
            : this.filteredValues,
        filterList:
          this.registrationProfileFilter?.value?.length === this.profileRateFilterList?.length - 2 ? null : this.profileRateFilterList,
        filterRef: this.registrationProfileFilter,
        displayKey: this.registrationProfileFilter?.value?.length === this.profileRateFilterList?.length - 2 ? null : 'name',
        savedValue: this.registrationProfileFilter?.value?.length === this.profileRateFilterList?.length - 2 ? null : '_id',
        isSelectionInput: this.registrationProfileFilter?.value?.length === this.profileRateFilterList?.length - 2 ? false : true,
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'announcement_email_date_offset',
        column: 'READMISSION.Readmission email',
        isMultiple: this.readmissionEmailFilter?.value?.length === this.readmissionEmailList?.length ? false : true,
        filterValue:
          this.readmissionEmailFilter?.value?.length === this.readmissionEmailList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.readmissionEmailFilter?.value?.length === this.readmissionEmailList?.length ? null : this.readmissionEmailList,
        filterRef: this.readmissionEmailFilter,
        displayKey: this.readmissionEmailFilter?.value?.length === this.readmissionEmailList?.length ? null : 'key',
        savedValue: this.readmissionEmailFilter?.value?.length === this.readmissionEmailList?.length ? null : 'value',
        isSelectionInput: this.readmissionEmailFilter?.value?.length === this.readmissionEmailList?.length ? false : true,
      },

      // for dynamic table
      {
        type: 'table_filter',
        name: 'last_reminder_date',
        column: 'READMISSION.Date last reminder',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.dateLastReminderFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'payment_methods',
        column: 'READMISSION.Method of payment DP',
        isMultiple: this.paymentMethodFilter?.value?.length === this.paymentMethodFilterList?.length ? false : true,
        filterValue:
          this.paymentMethodFilter?.value?.length === this.paymentMethodFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.paymentMethodFilter?.value?.length === this.paymentMethodFilterList?.length ? null : this.paymentMethodFilterList,
        filterRef: this.paymentMethodFilter,
        displayKey: this.paymentMethodFilter?.value?.length === this.paymentMethodFilterList?.length ? null : 'key',
        savedValue: this.paymentMethodFilter?.value?.length === this.paymentMethodFilterList?.length ? null : 'value',
        isSelectionInput: this.paymentMethodFilter?.value?.length === this.paymentMethodFilterList?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'down_payment',
        column: 'READMISSION.Down payment',
        isMultiple: this.downPaymentFilter?.value?.length === this.DPFilterList?.length ? false : true,
        filterValue: this.downPaymentFilter?.value?.length === this.DPFilterList?.length ? this.filteredValuesAll : dataDownPayment,
        filterList: this.downPaymentFilter?.value?.length === this.DPFilterList?.length ? null : this.DPFilterList,
        filterRef: this.downPaymentFilter,
        displayKey: this.downPaymentFilter?.value?.length === this.DPFilterList?.length ? null : 'value',
        savedValue: this.downPaymentFilter?.value?.length === this.DPFilterList?.length ? null : 'value',
        isSelectionInput: this.downPaymentFilter?.value?.length === this.DPFilterList?.length ? false : true,
        translationPrefix: this.downPaymentFilter?.value?.length === this.DPFilterList?.length ? null : 'DP_Status.',
      },
      {
        type: 'table_filter',
        name: 'financements',
        column: 'READMISSION.Financement',
        isMultiple: this.financementFilter?.value?.length === this.financementFilterList?.length ? false : true,
        filterValue:
          this.financementFilter?.value?.length === this.financementFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.financementFilter?.value?.length === this.financementFilterList?.length ? null : this.financementFilterList,
        filterRef: this.financementFilter,
        displayKey: this.financementFilter?.value?.length === this.financementFilterList?.length ? null : 'key',
        savedValue: this.financementFilter?.value?.length === this.financementFilterList?.length ? null : 'value',
        isSelectionInput: this.financementFilter?.value?.length === this.financementFilterList?.length ? false : true,
        translationPrefix: 'Step_Statuses.',
      },
      {
        type: 'table_filter',
        name: 'registered_at',
        column: 'READMISSION.Readmission date',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.readmissionDateFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'admission_member',
        column: 'ERP_009_TEACHER_CONTRACT.Academic Member',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.admissionMemberFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'continuous_formation_manager_id',
        column: 'READMISSION.FC in charge',
        isMultiple: false,
        filterValue: this.searching,
        filterList: null,
        filterRef: this.fcInChargeFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
    ];

    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }
  isAllDropdownSelected(type, index?) {
    if (type === 'scholar') {
      const selected = this.scholarSeasonFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.scholars.length;
      return isAllSelected;
    } else if (type === 'school') {
      const selected = this.schoolsFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.schools.length;
      return isAllSelected;
    } else if (type === 'campus') {
      const selected = this.campusesFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.campuses.length;
      return isAllSelected;
    } else if (type === 'level') {
      const selected = this.levelsFilter.value;
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
    } else if (type === 'tags') {
      const selected = this.tagFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.tagList.length;
    } else if (type === 'financement') {
      const selected = this.financementFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.financementFilterList.length;
      return isAllSelected;
    } else if (type === 'paymentMethod') {
      const selected = this.paymentMethodFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.paymentMethodFilterList.length;
      return isAllSelected;
    } else if (type === 'typeOfReadmission') {
      const selected = this.typeOfReadmissionFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.typeOfReadmissionList.length;
      return isAllSelected;
    } else if (type === 'jury') {
      const selected = this.juryFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.juryList.length;
      return isAllSelected;
    } else if (type === 'registrationProfile') {
      const selected = this.registrationProfileFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.profileRateFilterList.length;
      return isAllSelected;
    } else if (type === 'steps') {
      const selected = this.steps.controls[index].value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listStepSone.length;
      return isAllSelected;
    } else if (type === 'optionalSteps') {
      const selected = this.optionalSteps.controls[index].value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listStepSone.length;
      return isAllSelected;
    } else if (type === 'typeOfFormation') {
      const selected = this.sigleFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listSigle.length;
      return isAllSelected;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.studentStatusFilterList.length;
      return isAllSelected;
    } else if (type === 'downPayment') {
      const selected = this.downPaymentFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPFilterList.length;
      return isAllSelected;
    } else if (type === 'readmissionEmail') {
      const selected = this.readmissionEmailFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.readmissionEmailList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type, index?) {
    if (type === 'scholar') {
      const selected = this.scholarSeasonFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.scholars.length;
      return isIndeterminate;
    } else if (type === 'school') {
      const selected = this.schoolsFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.schools.length;
      return isIndeterminate;
    } else if (type === 'campus') {
      const selected = this.campusesFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.campuses.length;
      return isIndeterminate;
    } else if (type === 'level') {
      const selected = this.levelsFilter.value;
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
    } else if (type === 'tags') {
      const selected = this.tagFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.tagList.length;
    } else if (type === 'financement') {
      const selected = this.financementFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.financementFilterList.length;
      return isIndeterminate;
    } else if (type === 'paymentMethod') {
      const selected = this.paymentMethodFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.paymentMethodFilterList.length;
      return isIndeterminate;
    } else if (type === 'typeOfReadmission') {
      const selected = this.typeOfReadmissionFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.typeOfReadmissionList.length;
      return isIndeterminate;
    } else if (type === 'jury') {
      const selected = this.juryFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.juryList.length;
      return isIndeterminate;
    } else if (type === 'registrationProfile') {
      const selected = this.registrationProfileFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.profileRateFilterList.length;
      return isIndeterminate;
    } else if (type === 'steps') {
      const selected = this.steps.controls[index].value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listStepSone.length;
      return isIndeterminate;
    } else if (type === 'optionalSteps') {
      const selected = this.optionalSteps.controls[index].value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listStepSone.length;
      return isIndeterminate;
    } else if (type === 'typeOfFormation') {
      const selected = this.sigleFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listSigle.length;
      return isIndeterminate;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.studentStatusFilterList.length;
      return isIndeterminate;
    } else if (type === 'downPayment') {
      const selected = this.downPaymentFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPFilterList.length;
      return isIndeterminate;
    } else if (type === 'readmissionEmail') {
      const selected = this.readmissionEmailFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.readmissionEmailList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type, index?) {
    if (type === 'scholar') {
      if (event.checked) {
        this.scholarSeasonFilter.patchValue('All', { emitEvent: false });
      } else {
        this.scholarSeasonFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'school') {
      if (event.checked) {
        const schoolData = this.schools.map((el) => el._id);
        this.schoolsFilter.patchValue(schoolData, { emitEvent: false });
      } else {
        this.schoolsFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'campus') {
      if (event.checked) {
        const campusData = this.campuses.map((el) => el._id);
        this.campusesFilter.patchValue(campusData, { emitEvent: false });
      } else {
        this.campusesFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'level') {
      if (event.checked) {
        const levelData = this.levels.map((el) => el._id);
        this.levelsFilter.patchValue(levelData, { emitEvent: false });
      } else {
        this.levelsFilter.patchValue(null, { emitEvent: false });
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
    } else if (type === 'tags') {
      if (event.checked) {
        const tagsData = this.tagList.map((el) => el._id);
        this.tagFilter.patchValue(tagsData, { emitEvent: false });
      } else {
        this.tagFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'financement') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const financemnetData = this.financementFilterList.map((el) => el?.value);
        this.financementFilter.patchValue(financemnetData);
      } else {
        this.financementFilter.patchValue(null);
      }
    } else if (type === 'paymentMethod') {
      if (event.checked) {
        const paymentMethodData = this.paymentMethodFilterList.map((el) => el?.value);
        this.paymentMethodFilter.patchValue(paymentMethodData);
      } else {
        this.paymentMethodFilter.patchValue(null);
      }
    } else if (type === 'typeOfReadmission') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const typeOfReadmissionData = this.typeOfReadmissionList.map((el) => el?.value);
        this.typeOfReadmissionFilter.patchValue(typeOfReadmissionData);
      } else {
        this.typeOfReadmissionFilter.patchValue(null);
      }
    } else if (type === 'jury') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const juryData = this.juryList.map((el) => el?.value);
        this.juryFilter.patchValue(juryData);
      } else {
        this.juryFilter.patchValue(null);
      }
    } else if (type === 'registrationProfile') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const registrationProfileData = this.profileRateFilterList.map((el) => el?._id);
        this.registrationProfileFilter.patchValue(registrationProfileData);
        this.isCheckedAllDropdown = true;
      } else {
        this.registrationProfileFilter.patchValue(null);
        this.isCheckedAllDropdown = false;
      }
    } else if (type === 'steps') {
      if (event.checked) {
        const data = this.listStepSone.map((el) => el.key);
        this.steps.controls[index].patchValue(data);
      } else {
        this.steps.controls[index].patchValue(null);
      }
    } else if (type === 'optionalSteps') {
      if (event.checked) {
        const data = this.listStepSone.map((el) => el.key);
        this.optionalSteps.controls[index].patchValue(data);
      } else {
        this.optionalSteps.controls[index].patchValue(null);
      }
    } else if (type === 'typeOfFormation') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.listSigle.map((el) => el);
        this.sigleFilter.patchValue(data);
      } else {
        this.sigleFilter.patchValue(null);
      }
    } else if (type === 'status') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.studentStatusFilterList.map((el) => el.value);
        this.statusFilter.patchValue(data);
      } else {
        this.statusFilter.patchValue(null);
      }
    } else if (type === 'downPayment') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.DPFilterList.map((el) => el.value);
        this.downPaymentFilter.patchValue(data);
      } else {
        this.downPaymentFilter.patchValue(null);
      }
    } else if (type === 'readmissionEmail') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.readmissionEmailList.map((el) => el.value);
        this.readmissionEmailFilter.patchValue(data);
      } else {
        this.readmissionEmailFilter.patchValue(null);
      }
    }
  }
  selectedMultipleFilter(from) {
    if (this.isMultipleFilter) {
      this.isMultipleFilter = false;
      if (from === 'sigle') {
        const value = this.sigleFilter.value;
        this.filteredValues.sigle = value?.length ? value : null;
      } else if (from === 'type_of_readmission') {
        const value = this.typeOfReadmissionFilter.value;
        this.filteredValues.type_of_readmissions = value?.length ? value : null;
      } else if (from === 'status') {
        const value = this.statusFilter.value;
        this.filteredValues.candidate_admission_statuses = value?.length ? value : null;
      } else if (from === 'jury') {
        const value = this.juryFilter.value;
        this.filteredValues.jury_decisions = value?.length ? value : null;
      } else if (from === 'payment_method') {
        const value = this.paymentMethodFilter.value;
        this.filteredValues.payment_methods = value?.length ? value : null;
      } else if (from === 'downPayment') {
        const data1 = ['pending', 'sepa_pending', 'not_authorized', 'chargeback', 'no_down_payment'];
        const data2 = ['paid', 'not_paid', 'partialy_paid', 'rejected', 'billed', 'not_billed'];
        const value = this.downPaymentFilter.value;
        if (value?.length) {
          const dataValue1 = value.filter((element) => data1.includes(element));
          const dataValue2 = value.filter((element) => data2.includes(element));
          this.filteredValues.payments = dataValue1?.length ? dataValue1 : null;
          this.filteredValues.is_deposit_paids = dataValue2?.length ? dataValue2 : null;
        } else {
          this.filteredValues.payments = null;
          this.filteredValues.is_deposit_paids = null;
        }
      } else if (from === 'financement') {
        const value = this.financementFilter.value;
        this.filteredValues.financements = value?.length ? value : null;
      } else if (from === 'readmissionEmail') {
        const value = this.readmissionEmailFilter.value;
        this.filteredValues.announcement_email_date_offset = value?.length ? value : null;
      }
      this.paginator.pageIndex = 0;
      this.getCandidatesData('multipleFilter');
    }
  }

  resendNewForm(element) {
    let data = [];
    if (element && element._id) {
      data = [element];
    } else {
      data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    }
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('ReAdmission_S14.TITLE'),
      html: this.translate.instant('ReAdmission_S14.TEXT'),
      confirmButtonText: this.translate.instant('ReAdmission_S14.BUTTON1'),
      cancelButtonText: this.translate.instant('ReAdmission_S14.BUTTON2'),
      showCancelButton: true,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.value) {
        this.subs.sink = this.dialog
          .open(SendEmailValidatorDialogComponent, {
            width: '970px',
            minHeight: '300px',
            panelClass: 'no-padding',
            disableClose: true,
            data: {
              data: data,
              isNeedValidator: false,
              isResendNewForm: true,
              isResendMail: true,
              isFc: false,
              isReadmission: true,
            },
          })
          .afterClosed()
          .subscribe((resp) => {
            if (resp) {
              this.refetchDataKeepFilter();
            }
          });
      }
    });
  }
  checkStatusReadmission(element) {
    if (
      element?.is_program_assigned &&
      element?.program_status === 'active' &&
      element?.candidate_admission_status === 'registered' &&
      element?.is_future_program_assigned
    ) {
      return false;
    } else {
      return true;
    }
  }
}
