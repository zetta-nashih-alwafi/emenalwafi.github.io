import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { bufferCount, debounceTime, map, startWith, take, tap } from 'rxjs/operators';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, OnChanges, NgZone } from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { SubSink } from 'subsink';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AuthService } from 'app/service/auth-service/auth.service';
import Swal from 'sweetalert2';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { StudentsService } from 'app/service/students/students.service';
import { ActivatedRoute } from '@angular/router';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { UtilityService } from 'app/service/utility/utility.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { UserService } from 'app/service/user/user.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { ApplicationUrls } from 'app/shared/settings';
import { ExportCsvService } from 'app/service/export-csv/export-csv.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { environment } from 'environments/environment';
import { InternshipEmailDialogComponent } from 'app/internship-file/internship-email-dialog/internship-email-dialog.component';
import { SendMultipleEmailComponent } from 'app/internship-file/send-multiple-email/send-multiple-email.component';
import { AssignRateProfileDialogComponent } from 'app/shared/components/assign-rate-dialog/assign-rate-dialog.component';
import { MailCanidateDialogComponent } from 'app/candidates/mail-candidates-dialog/mail-candidates-dialog.component';
import { TransferAdmissionDialogComponent } from 'app/candidates/transfer-admission-member/transfer-admission-member-dialog.component';
import { TransferCampusDialogComponent } from 'app/candidates/transfer-campus/transfer-campus-dialog.component';
import { AssignMemberFcDialogComponent } from '../../shared/components/assign-member-fc-dialog/assign-member-fc-dialog.component';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { SendEmailValidatorDialogComponent } from 'app/shared/components/send-email-validator-dialog/send-email-validator-dialog.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TransferFcProgramCandidateDialogComponent } from 'app/candidates/transfer-fc-program-candidate/transfer-fc-program-candidate-dialog.component';
import { FilterBreadCrumbItem, FilterBreadCrumbInput } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';

@Component({
  selector: 'ms-candidates-fc-table',
  templateUrl: './candidates-fc-table.component.html',
  styleUrls: ['./candidates-fc-table.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class CandidatesFcTableComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @ViewChild('matTable', { static: false }) table: MatTable<any>;

  displayedColumns: string[] = [
    'select',
    // 'admitted',
    'typeFormation',
    'studentNumber',
    'name',
    'nationality',
    'entryWay',
    'studentStatus',
    'profileRate',
    'announcementCall',
    'announcementEmail',
    // 'engagementLevel',
    'downPayment',
    'financement',
    'registrationDate',
    'admissionDocument',
    'trial_date',
    'devMember',
    'fcMember',
    'crm',
    // 'mentor',
    // 'telephone',
    // 'whatsapp',
    // 'email',
    // 'openHouseDayParticipation',
    // 'jobMeetingParticipation',
    'action',
  ];
  filterColumns: String[] = [
    'selectFilter',
    // 'admittedFilter',
    'typeFormationFilter',
    'studentNumberFilter',
    'lastNameFilter',
    'nationalityFilter',
    'entryWayFilter',
    'studentStatusFilter',
    'profileRateFilter',
    'announcementCallFilter',
    'announcementEmailFilter',
    // 'engagementLevelFilter',
    'downPaymentFilter',
    'fcFilter',
    'registrationDateFilter',
    'admissionDocumentFilter',
    'trialFilter',
    'devMemberFilter',
    'fcMemberFilter',
    'crmFilter',
    // 'mentorFilter',
    // 'telephoneFilter',
    // 'whatsappFilter',
    // 'emailFilter',
    // 'openHouseDayParticipationFilter',
    // 'jobMeetingParticipationFilter',
    'actionFilter',
  ];
  filterForm: UntypedFormGroup;
  isCheckedAll = false;
  isSendAnnouncment = false;
  admittedFilter = new UntypedFormControl('');
  lastNameFilter = new UntypedFormControl('');
  schoolsFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  levelFilter = new UntypedFormControl(null);
  tagFilter = new UntypedFormControl(null);
  sectorFilter = new UntypedFormControl(null);
  specialityFilter = new UntypedFormControl(null);
  typeFilter = new UntypedFormControl('');
  nationalityFilter = new UntypedFormControl(null);
  announcementCallFilter = new UntypedFormControl(null);
  announcementEmailFilter = new UntypedFormControl(null);
  entryWayFilter = new UntypedFormControl(null);
  entryWayListFilter = new UntypedFormControl('');
  profileRateFilter = new UntypedFormControl(null);
  engagementLevelFilter = new UntypedFormControl('');
  studentStatusFilter = new UntypedFormControl(null);
  whatsappFilter = new UntypedFormControl('');
  mentorFilter = new UntypedFormControl('');
  devMemberFilter = new UntypedFormControl('');
  fcMemberFilter = new UntypedFormControl('');
  openHouseDayParticipationFilter = new UntypedFormControl('');
  jobMeetingParticipationFilter = new UntypedFormControl('');
  scholarFilter = new UntypedFormControl('All');
  conditionFilter = new UntypedFormControl('');
  studentNumberFilter = new UntypedFormControl('');
  registrationDateFilter = new UntypedFormControl(null);
  trialDateCtrl = new UntypedFormControl(null);
  paymentFilter = new UntypedFormControl(null);
  financementFilter = new UntypedFormControl(null);
  admissionDocumentFilter = new UntypedFormControl(null);
  admittedFilterList = [
    { value: 'All', key: 'AllS' },
    { value: 'Admitted', key: 'Done' },
    { value: 'Not admitted', key: 'Not done' },
  ];
  typeFilterList = [
    { value: 'All', key: 'AllS' },
    { value: 'classic', key: 'Classic' },
    { value: 'alternance', key: 'Alternance' },
    { value: 'special', key: 'Special' },
  ];
  nationalityFilterList = [];
  backupEntryWayFilterList = [];
  backupProfileList = [];
  announcementCallFilterList = [
    { value: 'done', key: 'Done' },
    { value: 'not_done', key: 'Not done' },
  ];

  listAdmission = [];

  announcementEmailFilterList = [
    { value: 'not_done', key: 'Not sent' },
    { value: 'today', key: 'Today' },
    { value: 'yesterday', key: 'Yesterday' },
    { value: 'last_7_days', key: 'Last 7 days' },
    { value: 'last_30_days', key: 'Last 30 days' },
    { value: 'this_month', key: 'This month' },
  ];
  entryWayFilterList = [];
  trialDateList = [];

  profileRateFilterList = [];
  engagementLevelFilterList = [
    { value: 'AllM', key: 'AllM' },
    { value: 'lost', key: 'Lost' },
    { value: 'low', key: 'Low' },
    { value: 'medium', key: 'Medium' },
    { value: 'high', key: 'High' },
    { value: 'registered', key: 'Registered' },
  ];
  studentStatusFilterList = [
    { value: 'admission_in_progress', key: 'Admitted' },
    { value: 'bill_validated', key: 'Bill validated' },
    { value: 'engaged', key: 'Engaged' },
    { value: 'no_show', key: 'no_show' },
    { value: 'resign_after_school_begins', key: 'resign_after_school_begins' },
    { value: 'financement_validated', key: 'Financement valided' },
    { value: 'registered', key: 'Registered' },
    { value: 'resigned', key: 'Resigned' },
    { value: 'resigned_after_engaged', key: 'Resigned after engaged' },
    { value: 'resigned_after_registered', key: 'Resign after registered' },
    { value: 'mission_card_validated', key: 'mission_card_validated' },
    { value: 'in_scholarship', key: 'in_scholarship' },
    { value: 'report_inscription', key: 'Report Inscription +1' },
    { value: 'resignation_missing_prerequisites', key: 'resignation_missing_prerequisites' },
  ];
  connectionFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: 'done', key: 'Done' },
    { value: 'not_done', key: 'Not done' },
  ];
  personalInfoFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: 'done', key: 'Done' },
    { value: 'not_done', key: 'Not done' },
  ];
  identificationPapersFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: 'done', key: 'Done' },
    { value: 'not_done', key: 'Not done' },
  ];
  studiesJustificationFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: 'done', key: 'Done' },
    { value: 'not_done', key: 'Not done' },
  ];
  contactsFilterList = [
    { value: 'AllM', key: 'AllM' },
    { value: 'done', key: 'Done' },
    { value: 'not_done', key: 'Not done' },
  ];
  signatureFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: 'done', key: 'Done' },
    { value: 'not_done', key: 'Not done' },
  ];
  paymentMethodFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: 'not_done', key: 'not_done' },
    { value: 'check', key: 'Check' },
    { value: 'transfer', key: 'Transfer' },
    { value: 'credit_card', key: 'Bank Debit' },
  ];
  downPaymentFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: 'not_done', key: 'not_done' },
    { value: 'check', key: 'Check' },
    { value: 'transfer', key: 'Transfer' },
    { value: 'credit_card', key: 'Credit card' },
  ];

  paymentFilterList = [
    { value: 'AllM', key: 'AllM' },
    { value: 'paid', key: 'Paid' },
    { value: 'not_paid', key: 'Not paid' },
    { value: 'partialy_paid', key: 'Partially paid' },
    { value: 'no_down_payment', key: 'no_down_payment' },
    { value: 'pending', key: 'pending' },
    { value: 'not_authorized', key: 'Rejected' },
  ];

  DPFilterList = [];

  financementFilterList = [];

  whatsappFilterList = [
    { value: 'All', key: 'AllM' },
    { value: true, key: 'Yes phone is Whatsapp' },
    { value: false, key: 'No phone is Whatsapp' },
  ];
  openHouseDayParticipationFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: true, key: 'Yes' },
    { value: false, key: 'No' },
  ];
  jobMeetingParticipationFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: true, key: 'Yes' },
    { value: false, key: 'No' },
  ];
  filteredTitles: Observable<any[]>;
  filteredProfileRate: Observable<any[]>;
  filterTrialDate = {
    candidate_admission_statuses: [
      'admission_in_progress',
      'engaged',
      'registered',
      'resigned',
      'resigned_after_engaged',
      'resigned_after_registered',
      'bill_validated',
      'financement_validated',
      'mission_card_validated',
      'in_scholarship',
      'report_inscription',
      'resignation_missing_prerequisites',
      'resign_after_school_begins',
      'no_show',
    ],
  };
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

  filteredValues = {
    student_admission_steps: null,
    candidate_admission_statuses: [
      'admission_in_progress',
      'engaged',
      'registered',
      'resigned',
      'resigned_after_engaged',
      'resigned_after_registered',
      'bill_validated',
      'financement_validated',
      'mission_card_validated',
      'in_scholarship',
      'report_inscription',
      'resignation_missing_prerequisites',
      'resign_after_school_begins',
      'no_show',
    ],
    candidate_unique_number: '',
    candidate_admission_status: null,
    registration_profile_status: null,
    registration_email_due_date: null,
    registered_at: null,
    is_admitted: null,
    trial_dates: null,
    type_of_formation_name: 'continuous',
    candidate: null,
    nationality: null,
    announcement_call: null,
    registration_email_date: null,
    intake_channel: null,
    registration_profile: null,
    registration_profile_statuses: null,
    engagement_level: '',
    connection: '',
    personal_information: '',
    identificationPapers: '',
    studiesJustification: '',
    contacts: '',
    signature: '',
    method_of_payment: null,
    is_deposit_paid: null,
    student_mentor: '',
    admission_member: '',
    is_whatsapp: null,
    participate_in_open_house_day: null,
    participate_in_job_meeting: null,
    school: '',
    campus: '',
    level: '',
    tags: '',
    scholar_season: '',
    payment_method: '',
    is_oscar_updated: null,
    payment: null,
    sigle: null,
    financement: null,
    sectors: '',
    specialities: '',
    payments: null,
    is_deposit_paids: null,
    admission_document_process_statuses: null
  };
  searching = {
    trial_date: '',
    continuous_formation_manager_id: '',
  };
  maleIcon = '../../../../../assets/img/student_icon.png';
  femaleIcon = '../../../../../assets/img/student_icon_fem.png';
  greenHeartIcon = '../../../../../assets/img/enagement_icon_green.png';
  flagsIconPath = '../../../../../assets/icons/flags-nationality/';
  shieldAccountIcon = '../../../../../assets/img/shield-account.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  mailStudentsDialog: MatDialogRef<MailCanidateDialogComponent>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataCount = 0;
  disabledExport = true;
  isSameData = false;
  private subs = new SubSink();
  noData: any;
  currentUser: any;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  exportName: 'Exporter Liste des Candidats';
  selectType: any;
  entityData: any;
  private timeOutVal: any;
  private intervalVal: any;
  titleList = [];
  originalTitleList = [];
  originalNationalityList = [];
  schoolList = [];
  originalCandidateList = [];
  isLoading: Boolean;
  allStudentForExport = [];
  allStudentForCustom = [];
  dataSelected = [];
  allStudentForCheckbox = [];
  allRegisForCheckbox = [];
  allAnnoucmentForCheckbox = [];
  allCallForCheckbox = [];
  allCRMForCheckbox = [];
  allEmailForCheckbox = [];
  allMemberForCheckbox = [];
  allExportForCheckbox = [];
  sectorList = [];
  specialityList = [];

  schoolName = '';
  campusName = '';
  levelName = '';

  assignMemberButton = '';
  assignMentorButton = '';
  who = '';
  type = '';
  isDifferentMember = false;
  isDifferentMentor = false;
  isDifferentIntakeChannel = false;
  isDifferentAnnoucement = false;
  isFirstCallActive = false;
  isFirstMailActive = false;
  isDirectorAdmission = false;
  isMemberAdmission = false;
  isProfileRateActive = false;
  isEmailSent = false;
  isCRMOk = false;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  campusList = [];
  campusListBackup = [];
  levelListBackup = [];
  listObjective = [];
  levels = [];
  tags = [];
  school = [];
  scholars = [];
  scholarSelected = [];
  filteredTrialDateList: Observable<any[]>;
  isHasRegistrationProfileandCallNotDone = false;
  isNoRegistrationProfileandCallNotDone = false;
  isHasRegistrationProfile = false;
  showMultipleCall = true; // Temporary hide button call multiple because BE was not ready yet
  allCandidateData: any = [];
  crmFilter = new UntypedFormControl(null);
  isWasSelectAll = false;
  isWasRegistered = false;
  listCrm = [
    {
      key: 'OK',
      value: 'ok',
    },
    {
      key: 'NOT OK',
      value: 'not_ok',
    },
  ];

  listStepSone = [];
  selectedProgram: any;
  listRegistrationProfile = [];
  stepColumn = [];
  steps: any;
  tempSteps: any;
  totalSteps: number;
  OriginStep: any;

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
  currentUserTypeId: any;
  isPermission: string[];
  isRegistrationProfileDone = false;
  isStepsFiltered = false;
  listSigle: any[] = [];
  admissionNeedValidator = [];
  sigleFilter = new UntypedFormControl(null);
  totalOptionalSteps: number;
  originOptionalStep: any;
  optionalStepColumns: any[];
  originalScholar = [];
  optionalSteps: any;
  tempOptionalSteps: any;
  dataWithFilteredSteps: any = [];
  dataWithFilteredOptionalSteps: any = [];
  OptionalStepData: any;
  dataUnselectUser = [];
  buttonClicked = '';
  assignRateProfileDialogComponent: MatDialogRef<AssignRateProfileDialogComponent>;
  sendEmailValidatorDialogComponent: MatDialogRef<SendEmailValidatorDialogComponent>;
  sendMultipleEmailComponent: MatDialogRef<SendMultipleEmailComponent>;
  assignMemberFcDialogComponent: MatDialogRef<AssignMemberFcDialogComponent>;
  financement = [];
  isWaitingForResponse = false;
  filterBreadcrumbData: FilterBreadCrumbItem[] = [];

  superFilter = {
    scholar_season: '',
    school: '',
    campus: '',
    level: '',
    tags: '',
    sectors: '',
    specialities: '',
  };
  isDisabled = true;

  tempDataFilter = {
    status: null,
    registrationProfile: null,
    steps: [],
    downPayments: null,
    admissionDocumentStatus: null
  };

  filteredValuesAll = {
    school: 'All',
    campus: 'All',
    level: 'All',
    sectors: 'All',
    specialities: 'All',
    sigle: 'All',
    nationality: 'All',
    intake_channel: 'All',
    registration_profile: 'All',
    announcement_call: 'All',
    registration_email_date: 'All',
    financement: 'All',
    trial_dates: 'All',
    admission_document_process_statuses: 'All',
    candidate_admission_statuses: 'All',
    registration_profile_statuses: 'All',
    down_payment: 'All',
    is_oscar_updated: 'All',
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
    private candidatesService: CandidatesService,
    private exportCsvService: ExportCsvService,
    private authService: AuthService,
    private utilService: UtilityService,
    private ngxPermissionService: NgxPermissionsService,
    private userService: UserService,
    public permissionService: PermissionService,
    private translate: TranslateService,
    public dialog: MatDialog,
    private studentService: StudentsService,
    private route: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private router: Router,
    private permissionsService: NgxPermissionsService,
    private fb: UntypedFormBuilder,
    private financeService: FinancesService,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    private ngZone: NgZone,
    private admissionService: AdmissionEntrypointService,
    private httpClient: HttpClient,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.getDataTypeOfFormation();
    // this.subs.sink = this.candidatesService.getNationality().subscribe((list: any[]) => {
    //   this.nationalityFilterList = list;
    //   this.nationalityFilterList = this.nationalityFilterList.sort((a, b) => {
    //     return a.nationality.toLowerCase().localeCompare(b.nationality.toLowerCase());
    //   });
    //   this.originalNationalityList = list;
    // });
    this.initFilterForm();
    const pop = this.route.snapshot.queryParamMap.get('pop');
    if (pop && pop === 'six') {
      this.openTransferCampus('', '');
    }
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.isMemberAdmission = !!this.permissionsService.getPermission('Member Admission');
    this.getDataNAtionality();
    this.initFilter();
    this.getCandidatesData('First');
    this.getAllIntakeChannelDropdown();
    this.getAllRegistrationProfileDropdown();
    this.getDataTags();
    this.getDataScholarSeasons();
    this.getDPList();
    this.getFinancementList();
    this.getStatusList();
    this.getStepStatusList();
    // this.getDataForList();
    this.assignMemberButton = this.translate.instant('Assign dev member');
    this.assignMentorButton = this.translate.instant('Assign mentor');
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.assignText(this.type, this.who);
      if (
        this.trialDateCtrl.value &&
        (this.trialDateCtrl.value.trim() === 'All' || this.trialDateCtrl.value.trim() === 'Tous') &&
        !this.searching.trial_date
      ) {
        this.trialDateCtrl.patchValue(this.translate.instant('All'));
      }
      this.refetchDataScholarSeasons();
      this.getAllRegistrationProfileDropdown();
      this.filterBreadcrumbFormat();
      this.getDPList();
      this.getFinancementList();
      this.getStatusList();
      this.getStepStatusList();
    });
    // call api for get list trial date dropdown
    this.getTrialDate();
    // call api for get all candidate data
    // call api for get all registration profile for checking in common program
    this.getAllProfileRate();
    if (this.scholarFilter && this.scholarFilter.value) {
      const scholarSeason = this.scholarFilter.value && !this.scholarFilter.value.includes('All') ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }

    this.pageTitleService.setTitle('Candidates Follow up FC');
  }

  getStepStatusList() {
    this.listStepSone = [
      {
        key: 'done',
        value: 'Done',
        label: this.translate.instant('Done'),
        labelForSort: this.utilService.simplifyRegex(this.translate.instant('Done')),
      },
      {
        key: 'not_done',
        value: 'Not Done',
        label: this.translate.instant('Not Done'),
        labelForSort: this.utilService.simplifyRegex(this.translate.instant('Not Done')),
      },
      {
        key: 'need_validation',
        value: 'need_validation',
        label: this.translate.instant('need_validation'),
        labelForSort: this.utilService.simplifyRegex(this.translate.instant('need_validation')),
      },
      {
        key: 'reject_and_stop',
        value: 'Reject',
        label: this.translate.instant('Reject'),
        labelForSort: this.utilService.simplifyRegex(this.translate.instant('Reject')),
      },
    ];

    this.listStepSone = _.sortBy(this.listStepSone, 'labelForSort');
  }

  getStatusList() {
    this.listAdmission = [
      {
        key: 'Completed',
        value: 'green',
        label: this.translate.instant('Completed'),
      },
      {
        key: 'Rejected by the validator',
        value: 'red',
        label: this.translate.instant('Rejected by the validator'),
      },
      {
        key: 'In progress',
        value: 'yellow',
        label: this.translate.instant('in_progress'),
      },
      {
        key: 'Waiting for validation',
        value: 'orange',
        label: this.translate.instant('Waiting for validation'),
      },
    ]
  }

  getTooltip(data) {
    if (data === 'green') {
      return this.translate.instant('Completed');
    } else if (data === 'red') {
      return this.translate.instant('Rejected by the validator');
    } else if(data === 'yellow') {
      return this.translate.instant('in_progress');
    } else if(data === 'orange') {
      return this.translate.instant('Waiting for validation');
    } else {
      return;
    }
  }

  getDPList() {
    this.DPFilterList = [
      { value: 'paid', key: 'Paid', label: this.translate.instant('DP_Status.paid') },
      { value: 'not_paid', key: 'Not Paid', label: this.translate.instant('DP_Status.not_paid') },
      { value: 'pending', key: 'Pending', label: this.translate.instant('DP_Status.pending') },
      { value: 'not_authorized', key: 'Rejected', label: this.translate.instant('DP_Status.rejected') },
      { value: 'billed', key: 'Billed', label: this.translate.instant('DP_Status.billed') },
      { value: 'not_billed', key: 'Not billed', label: this.translate.instant('DP_Status.not_billed') },
      { value: 'partialy_paid', key: 'Partially paid', label: this.translate.instant('DP_Status.partialy_paid') },
    ];

    this.DPFilterList = this.DPFilterList.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
  }

  getFinancementList() {
    this.financementFilterList = [
      { value: 'accept', key: 'accept', label: this.translate.instant('Step_Statuses.accept') },
      { value: 'not_started', key: 'not_started', label: this.translate.instant('Step_Statuses.not_started') },
      { value: 'need_validation', key: 'need_validation', label: this.translate.instant('Step_Statuses.need_validation') },
      { value: 'no_financement', key: 'no_financement', label: this.translate.instant('Step_Statuses.no_financement') },
    ];
  }

  getTrialDate() {
    // get api for list dropdown
    this.subs.sink = this.candidatesService.GetAllTrialDateOfCandidateFollowUP(this.filterTrialDate.candidate_admission_statuses).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.trialDateList = resp;
          // filtering list based on user input
          this.filteredTrialDateList = this.trialDateCtrl.valueChanges.pipe(
            startWith(''),
            map((searchTxt) =>
              searchTxt
                ? this.trialDateList.filter((option) =>
                    option && option ? option.toLowerCase().includes(searchTxt.toString().toLowerCase()) : '',
                  )
                : this.trialDateList,
            ),
          );
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.trialDateList = [];
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

  assignText(type, who) {
    this.type = type;
    this.who = who;
    if (who === 'all') {
      if (type === 'top') {
        this.assignMemberButton = this.translate.instant('Assign dev member');
        this.assignMentorButton = this.translate.instant('Assign mentor');
      } else {
        this.assignMemberButton = this.translate.instant('Transfer the file to another dev member');
        this.assignMentorButton = this.translate.instant('Change mentor');
      }
    } else if (who === 'member') {
      if (type === 'top') {
        this.assignMemberButton = this.translate.instant('Assign dev member');
      } else {
        this.assignMemberButton = this.translate.instant('Transfer the file to another dev member');
      }
    } else if (who === 'mentor') {
      if (type === 'top') {
        this.assignMentorButton = this.translate.instant('Assign mentor');
      } else {
        this.assignMentorButton = this.translate.instant('Change mentor');
      }
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  ngOnChanges() {}

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
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

  getDataTypeOfFormation() {
    this.subs.sink = this.admissionService.getAllTypeOfInformationDropdown().subscribe(
      (res) => {
        if (res && res.length) {
          const filteredSigle = res
            .filter(
              (ress) =>
                ress.type_of_formation &&
                ress.type_of_formation &&
                ress.type_of_formation !== 'classic' &&
                ress.type_of_formation !== 'continuous',
            )
            .map((resp) => resp.sigle);
          this.listSigle = _.uniqBy(filteredSigle);
          // console.log('_list', this.listSigle);
        } else {
          this.listSigle = [];
        }
      },
      (error) => {
        // Record error log
        this.authService.postErrorLog(error);
        this.listSigle = [];
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

  getCandidatesData(data) {
    console.log('Reload Page', data);
    this.stepColumn = [];
    this.optionalStepColumns = [];
    this.totalSteps = 0;
    this.totalOptionalSteps = 0;
    this.filterColumns = [];
    this.displayedColumns = [];
    this.dataWithFilteredOptionalSteps = [];
    this.dataWithFilteredSteps = [];

    // initial column
    this.setInitialTableColumn();

    this.dataSource.data = [];
    this.paginator.length = 0;
    this.dataCount = 0;
    this.isLoading = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    // console.log(pagination);
    const filter = this.cleanFilterData();
    console.log('_filter', filter);
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService.getAllCandidatesFc(pagination, this.sortValue, filter, this.searching, userTypesList).subscribe(
      (students: any) => {
        this.filterBreadcrumbData = [];
        if (students && students.length) {
          this.dataSource.data = _.cloneDeep(students);
          // console.log('table data', this.dataSource.data);
          this.paginator.length = students[0].count_document;
          this.dataCount = students[0].count_document;
          this.isLoading = true;
          setTimeout(() => {
            this.setTableColumnwithStep(this.dataSource.data);
            this.isLoading = false;
          }, 3000);
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
          this.isLoading = true;
          setTimeout(() => {
            this.setTableColumnwithStep(this.dataSource.data);
            this.isLoading = false;
          }, 100);
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isLoading = false;
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

    // this.subs.sink = this.candidatesService.getCandidates('pagination', this.sortValue, 'filter').subscribe((candidates) => {
    //   if (candidates && candidates.length) {
    //     this.dataSource.data = candidates;
    //     this.paginator.length = 1;
    //     this.dataCount = 1;
    //   } else {
    //     this.dataSource.data = [];
    //     this.paginator.length = 0;
    //     this.dataCount = 0;
    //   }
    //   this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
    // });
  }

  getDataNAtionality() {
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 500,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    this.subs.sink = this.candidatesService.GetAllCandidateNationalities().subscribe(
      (nationality: any) => {
        if (nationality) {
          this.nationalityFilterList = nationality.filter((res) => res);
        } else {
          this.nationalityFilterList = [];
        }
      },
      (err) => {
        // Record error log
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

  initFilterForm() {
    this.filterForm = this.fb.group({
      schools: [null],
      campuses: [null],
      levels: [null],
    });
  }

  initFilter() {
    this.subs.sink = this.studentNumberFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        this.clearSelectIfFilter();
        this.filteredValues.candidate_unique_number = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('studentNumberFilter');
        }
      } else {
        this.clearSelectIfFilter();
        this.filteredValues.candidate_unique_number = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('studentNumberFilter');
        }
      }
    });

    this.subs.sink = this.lastNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[-!$%^&*()+|~=`{}\[\]:";'<>?,.\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.filteredValues.candidate = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('lastNameFilter');
        }
      } else {
        this.lastNameFilter.setValue('');
        this.filteredValues.candidate = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('lastNameFilter 2');
        }
      }
    });

    this.subs.sink = this.mentorFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.clearSelectIfFilter();
        if (statusSearch === '') {
          this.mentorFilter.setValue('', { emitEvent: false });
          this.filteredValues.student_mentor = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getCandidatesData('mentorFilter');
          }
        }
        this.filteredValues.student_mentor = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('mentorFilter 1');
        }
      } else {
        this.clearSelectIfFilter();
        this.mentorFilter.setValue('');
        this.filteredValues.student_mentor = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('mentorFilter 2');
        }
      }
    });

    this.subs.sink = this.devMemberFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/;
      const symbol1 = /\\/;
      // console.log('_stat', statusSearch);
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.clearSelectIfFilter();
        // fiter when length greater than or equals to 3
        if (statusSearch === '') {
          this.devMemberFilter.setValue('', { emitEvent: false });
          this.filteredValues.admission_member = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getCandidatesData('devMemberFilter');
          }
        } else {
          this.filteredValues.admission_member = statusSearch ? statusSearch : '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getCandidatesData('devMemberFilter 1');
          }
        }
      } else {
        this.clearSelectIfFilter();
        this.devMemberFilter.setValue('');
        this.filteredValues.admission_member = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('devMemberFilter 2');
        }
      }
    });

    this.subs.sink = this.fcMemberFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/;
      const symbol1 = /\\/;
      // console.log('_stat', statusSearch);
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.clearSelectIfFilter();
        // fiter when length greater than or equals to 3
        if (statusSearch === '') {
          this.fcMemberFilter.setValue('', { emitEvent: false });
          this.searching.continuous_formation_manager_id = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getCandidatesData('');
          }
        } else {
          this.searching.continuous_formation_manager_id = statusSearch ? statusSearch : '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getCandidatesData('');
          }
        }
      } else {
        this.clearSelectIfFilter();
        this.searching.continuous_formation_manager_id = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('');
        }
      }
    });

    this.subs.sink = this.conditionFilter.valueChanges.subscribe((statusSearch) => {
      this.clearSelectIfFilter();
      this.filteredValues.is_admitted =
        statusSearch === 'All' || statusSearch === '' || statusSearch === null ? null : statusSearch === 'Admitted' ? true : false;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('admittedFilter');
      }
    });

    // this.subs.sink = this.nationalityFilter.valueChanges.subscribe((statusSearch) => {
    //   // console.log(statusSearch);
    //   this.clearSelectIfFilter();
    //   this.filteredValues.nationality = statusSearch === 'AllF' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getCandidatesData('nationalityFilter');
    //   }
    // });

    this.subs.sink = this.typeFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/;
      const symbol1 = /\\/;
      if (statusSearch && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.clearSelectIfFilter();
        this.filteredValues.type_of_formation_name = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('typeFilter 1');
        }
      } else {
        this.clearSelectIfFilter();
        this.filteredValues.type_of_formation_name = 'continuous';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('typeFilter');
        }
      }
    });

    // this.subs.sink = this.announcementCallFilter.valueChanges.subscribe((statusSearch) => {
    //   this.clearSelectIfFilter();
    //   this.filteredValues.announcement_call = statusSearch === 'AllF' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getCandidatesData('announcementCallFilter');
    //   }
    // });

    // this.subs.sink = this.announcementEmailFilter.valueChanges.pipe(debounceTime(400)).subscribe((result) => {
    //   if (result && result !== 'AllF') {
    //     this.clearSelectIfFilter();
    //     this.filteredValues.registration_email_date = result;
    //     this.paginator.pageIndex = 0;
    //     if (!this.isReset) {
    //       this.getCandidatesData('registration_email_date');
    //     }
    //   } else {
    //     this.clearSelectIfFilter();
    //     this.filteredValues.registration_email_date = '';
    //     this.paginator.pageIndex = 0;
    //     if (!this.isReset) {
    //       this.getCandidatesData('registration_email_date');
    //     }
    //   }
    // });

    this.subs.sink = this.registrationDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        this.clearSelectIfFilter();
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.registered_at = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('due_date');
        }
      }
    });

    this.subs.sink = this.engagementLevelFilter.valueChanges.subscribe((statusSearch) => {
      this.clearSelectIfFilter();
      this.filteredValues.engagement_level = statusSearch === 'AllM' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('engagementLevelFilter');
      }
    });

    this.subs.sink = this.whatsappFilter.valueChanges.subscribe((statusSearch) => {
      this.clearSelectIfFilter();
      this.filteredValues.is_whatsapp = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('whatsappFilter');
      }
    });

    this.subs.sink = this.openHouseDayParticipationFilter.valueChanges.subscribe((statusSearch) => {
      this.clearSelectIfFilter();
      this.filteredValues.participate_in_open_house_day = statusSearch === 'AllF' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('openHouseDayParticipationFilter');
      }
    });

    this.subs.sink = this.jobMeetingParticipationFilter.valueChanges.subscribe((statusSearch) => {
      this.clearSelectIfFilter();
      this.filteredValues.participate_in_job_meeting = statusSearch === 'AllF' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('jobMeetingParticipationFilter');
      }
    });

    // start superfilter
    this.subs.sink = this.schoolsFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.campus = '';
      this.superFilter.level = '';
      this.superFilter.school = statusSearch === '' || (statusSearch && statusSearch.includes('AllF')) ? '' : statusSearch;
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.level = '';
      this.superFilter.campus = statusSearch === '' || (statusSearch && statusSearch.includes('AllF')) ? '' : statusSearch;
    });

    this.subs.sink = this.levelFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.level = statusSearch === '' || (statusSearch && statusSearch.includes('AllF')) ? '' : statusSearch;
    });

    this.subs.sink = this.tagFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.tags = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    this.subs.sink = this.scholarFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.school = '';
      this.superFilter.campus = '';
      this.superFilter.level = '';
      this.superFilter.scholar_season = statusSearch === 'All' ? '' : statusSearch;
    });
    this.subs.sink = this.sectorFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.sectors = statusSearch === '' || (statusSearch && statusSearch.includes('AllF')) ? '' : statusSearch;
    });
    this.subs.sink = this.specialityFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.specialities = statusSearch === '' || (statusSearch && statusSearch.includes('AllF')) ? '' : statusSearch;
    });
    // end superfilter

    // this.filteredTitles = this.entryWayFilter.valueChanges.pipe(
    //   startWith(''),
    //   map((searchTxt) =>
    //     searchTxt
    //       ? this.entryWayFilterList.filter((option) =>
    //         option && option.intake_channel ? option.intake_channel.toLowerCase().includes(searchTxt.toString().toLowerCase()) : '',
    //       )
    //       : this.entryWayFilterList,
    //   ),
    // );

    this.filteredProfileRate = this.profileRateFilter.valueChanges.pipe(
      startWith(''),
      map((searchTxt) =>
        searchTxt
          ? this.profileRateFilterList.filter((option) =>
              option && option.name ? option.name.toLowerCase().includes(searchTxt.toString().toLowerCase()) : '',
            )
          : this.profileRateFilterList,
      ),
    );

    // this.subs.sink = this.crmFilter.valueChanges.subscribe((statusSearch) => {
    //   this.clearSelectIfFilter();
    //   this.filteredValues.is_oscar_updated = statusSearch === 'AllF' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getCandidatesData('oscarFilter');
    //   }
    // });

    // this.subs.sink = this.paymentFilter.valueChanges.subscribe((statusSearch) => {
    //   this.clearSelectIfFilter();
    //   if (statusSearch === 'pending') {
    //     this.filteredValues.payment = statusSearch;
    //     this.filteredValues.is_deposit_paid = null;
    //   } else if (
    //     statusSearch === 'paid' ||
    //     statusSearch === 'not_paid' ||
    //     statusSearch === 'partialy_paid' ||
    //     statusSearch === 'rejected' ||
    //     statusSearch === 'billed' ||
    //     statusSearch === 'not_billed'
    //   ) {
    //     this.filteredValues.is_deposit_paid = statusSearch;
    //     this.filteredValues.payment = null;
    //   } else if (statusSearch === 'AllM') {
    //     this.filteredValues.payment = null;
    //     this.filteredValues.is_deposit_paid = null;
    //   } else if (statusSearch === 'no_down_payment') {
    //     this.filteredValues.payment = statusSearch;
    //   }
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getCandidatesData('paymentFilter');
    //   }
    // });

    // this.subs.sink = this.financementFilter.valueChanges.subscribe((statusSearch) => {
    //   this.clearSelectIfFilter();
    //   console.log(statusSearch);
    //   this.filteredValues.financement = statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getCandidatesData('financementFilter');
    //   }
    // });
  }

  resetCandidateKeepFilter() {
    this.dataSelected = [];
    this.dataUnselectUser = [];
    this.allCandidateData = [];
    this.allStudentForCheckbox = [];
    this.allAnnoucmentForCheckbox = [];
    this.allCallForCheckbox = [];
    this.allCRMForCheckbox = [];
    this.allEmailForCheckbox = [];
    this.allMemberForCheckbox = [];
    this.allExportForCheckbox = [];
    this.selection.clear();
    this.isCheckedAll = false;
    // this.isReset = true;

    this.getCandidatesData('resetCandidate');
  }

  resetCandidate() {
    this.schoolName = '';
    this.campusName = '';
    this.levelName = '';
    this.school = [];
    this.campusList = [];
    this.levels = [];
    this.disabledExport = true;
    this.dataSelected = [];
    this.dataUnselectUser = [];
    this.allCandidateData = [];
    this.allStudentForCheckbox = [];
    this.allAnnoucmentForCheckbox = [];
    this.allCallForCheckbox = [];
    this.allCRMForCheckbox = [];
    this.allEmailForCheckbox = [];
    this.allMemberForCheckbox = [];
    this.allExportForCheckbox = [];
    this.selection.clear();
    this.isCheckedAll = false;
    this.isReset = true;
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });

    this.filteredValues = {
      student_admission_steps: null,
      candidate_admission_statuses: [
        'admission_in_progress',
        'engaged',
        'registered',
        'resigned',
        'resigned_after_engaged',
        'resigned_after_registered',
        'bill_validated',
        'financement_validated',
        'mission_card_validated',
        'in_scholarship',
        'report_inscription',
        'resignation_missing_prerequisites',
        'resign_after_school_begins',
        'no_show',
      ],
      candidate_admission_status: null,
      registration_profile_status: null,
      candidate_unique_number: '',
      registration_email_due_date: '',
      registered_at: '',
      is_admitted: null,
      trial_dates: null,
      candidate: '',
      type_of_formation_name: 'continuous',
      nationality: null,
      announcement_call: null,
      registration_email_date: null,
      intake_channel: null,
      registration_profile: '',
      registration_profile_statuses: '',
      engagement_level: '',
      connection: '',
      personal_information: '',
      identificationPapers: '',
      studiesJustification: '',
      contacts: '',
      signature: '',
      method_of_payment: '',
      is_deposit_paid: null,
      student_mentor: '',
      admission_member: '',
      is_whatsapp: null,
      participate_in_open_house_day: null,
      participate_in_job_meeting: null,
      school: '',
      campus: '',
      level: '',
      scholar_season: '',
      payment_method: '',
      is_oscar_updated: null,
      payment: null,
      sigle: null,
      financement: null,
      tags: '',
      sectors: '',
      specialities: '',
      is_deposit_paids: null,
      payments: null,
      admission_document_process_statuses: null,
    };
    this.superFilter = {
      school: '',
      campus: '',
      level: '',
      scholar_season: '',
      tags: '',
      sectors: '',
      specialities: '',
    };
    this.schoolsFilter.setValue(null);
    this.campusFilter.setValue(null);
    this.levelFilter.setValue(null);
    this.tagFilter.setValue(null);
    this.scholarFilter.setValue('All');
    this.sectorFilter.setValue(null);
    this.specialityFilter.setValue(null);
    this.lastNameFilter.setValue('');
    this.admittedFilter.setValue('All');
    this.typeFilter.setValue('');
    this.nationalityFilter.setValue(null);
    this.announcementCallFilter.setValue(null);
    this.announcementEmailFilter.setValue(null);
    this.entryWayFilter.setValue(null);
    this.entryWayListFilter.setValue('');
    this.profileRateFilter.setValue(null);
    this.engagementLevelFilter.setValue('');
    this.devMemberFilter.setValue('');
    this.fcMemberFilter.setValue('');
    this.mentorFilter.setValue('');
    this.whatsappFilter.setValue('All');
    this.conditionFilter.setValue('All');
    this.openHouseDayParticipationFilter.setValue('AllF');
    this.jobMeetingParticipationFilter.setValue('AllF');
    this.studentNumberFilter.setValue('');
    this.studentStatusFilter.setValue(null);
    this.registrationDateFilter.setValue('');
    this.paymentFilter.setValue(null);
    this.financementFilter.setValue(null);
    this.admissionDocumentFilter.setValue(null);
    // reset filter for crm
    this.crmFilter.setValue(null);
    // reset filter value to be null when reset clicked
    this.searching = {
      trial_date: '',
      continuous_formation_manager_id: '',
    };
    // reset filter value to be null when reset clicked
    this.trialDateCtrl.setValue(null);
    this.selectType = '';
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.isHasRegistrationProfileandCallNotDone = false;
    this.isNoRegistrationProfileandCallNotDone = false;
    this.isHasRegistrationProfile = false;
    this.filterBreadcrumbData = [];
    // Reset sigle filter
    this.sigleFilter.setValue(null);
    this.getDataNAtionality();
    this.getCandidatesData('resetCandidate');
    this.school = [];
    this.campusList = [];
    this.levels = [];
    this.sectorList = [];
    this.specialityList = [];
    this.isDisabled = true;
    if (this.scholarFilter && this.scholarFilter.value) {
      const scholarSeason = this.scholarFilter.value && !this.scholarFilter.value.includes('All') ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }

    this.tempDataFilter = {
      status: null,
      registrationProfile: null,
      steps: [],
      downPayments: null,
      admissionDocumentStatus: null
    };

    if (this.steps?.controls?.length) {
      this.steps?.controls?.forEach((el: UntypedFormControl) => {
        el.setValue(null);
      });
    }
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
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.isCheckedAll = true;
      this.allCandidateData = [];
      this.dataUnselectUser = [];
      this.allStudentForCheckbox = [];
      this.allAnnoucmentForCheckbox = [];
      this.allCallForCheckbox = [];
      this.allCRMForCheckbox = [];
      this.allEmailForCheckbox = [];
      this.allMemberForCheckbox = [];
      this.allExportForCheckbox = [];
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
      // this.getAllIdForCheckbox(0);
    }
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isLoading = true;
    const filter = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService
      .getAllCandidatesFCCheckbox(pagination, this.sortValue, filter, this.searching, userTypesList)
      .subscribe(
        (students: any) => {
          if (students && students.length) {
            this.allStudentForCheckbox.push(...students);
            this.allCandidateData.push(...students);
            const page = pageNumber + 1;
            this.getDataAllForCheckbox(page);
          } else {
            console.log('getDataAllForCheckbox', this.selection, this.isCheckedAll);
            this.isLoading = false;
            if (this.isCheckedAll) {
              if (this.allStudentForCheckbox && this.allStudentForCheckbox.length) {
                this.allStudentForCheckbox.forEach((element) => {
                  this.selection.select(element._id);
                  this.dataSelected.push(element);
                });
              }
            }
          }
        },
        (error) => {
          // Record error log
          this.authService.postErrorLog(error);
          this.isReset = false;
          this.isLoading = false;
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

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  triggerAnnouncement(element) {
    this.isSendAnnouncment = true;
    let candidate = '';
    let candidatess = '';
    candidate = 'one';
    candidatess =
      (element && element.civility && element.civility !== 'neutral' ? this.translate.instant(element.civility) + ' ' : '') +
      element.first_name +
      ' ' +
      element.last_name;
    Swal.fire({
      type: 'info',
      title: this.translate.instant('CANDIDAT_S1.TITLE'),
      html: this.translate.instant('CANDIDAT_S1.TEXT_ALL_VALID', {
        candidateName: candidatess,
      }),
      showCancelButton: true,
      allowEscapeKey: true,
      allowOutsideClick: false,
      reverseButtons: true,
      confirmButtonText: this.translate.instant('CANDIDAT_S1.BUTTON_1'),
      cancelButtonText: this.translate.instant('CANDIDAT_S1.BUTTON_2'),
    }).then((res) => {
      if (res.value) {
        this.isLoading = true;
        if (candidate === 'one') {
          const userId = [];
          userId.push(element._id);
          this.subs.sink = this.candidatesService.SendRegistrationN1(userId).subscribe(
            (resp) => {
              if (resp) {
                this.isLoading = false;
                // console.log(resp);
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('CANDIDAT_S2.TITLE'),
                  html: this.translate.instant('CANDIDAT_S2.TEXT', {
                    candidateName: candidatess,
                  }),
                  allowOutsideClick: false,
                  confirmButtonText: this.translate.instant('CANDIDAT_S2.BUTTON'),
                }).then(() => {
                  this.resetCandidate();
                });
              }
            },
            (err) => {
              // Record error log
              this.authService.postErrorLog(err);
              this.isLoading = false;
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
    });
  }

  getAllIntakeChannelDropdown() {
    this.subs.sink = this.candidatesService.getIntakeChannelDropdown().subscribe(
      (list: any) => {
        if (list && list.length) {
          this.entryWayFilterList = _.cloneDeep(list);
          this.backupEntryWayFilterList = _.cloneDeep(list);
        }
      },
      (err) => {
        // Record error log
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
  }

  getAllRegistrationProfileDropdown() {
    this.subs.sink = this.financeService.GetListProfileRatesDropdown().subscribe(
      (list) => {
        if (list && list.length) {
          this.profileRateFilterList = _.cloneDeep(list);
          this.backupProfileList = _.cloneDeep(list);

          const option = [
            {
              _id: 'affected',
              name: this.translate.instant('Affected'),
            },
            {
              _id: 'not_affected',
              name: this.translate.instant('Not affected'),
            },
          ];

          this.profileRateFilterList = option.concat(this.profileRateFilterList);
          this.profileRateFilterList = _.uniqBy(this.profileRateFilterList, '_id');
        }
      },
      (err) => {
        // Record error log
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
  }

  sendAnnoucmentAll(candidate) {
    this.isSendAnnouncment = false;
    const candidateId = _.cloneDeep(candidate);
    const candidateList = candidateId.map((cand) => {
      return cand._id;
    });
    let candidates = '';
    for (const entity of candidate) {
      candidates = candidates
        ? candidates +
          ', ' +
          (entity
            ? entity.civility !== 'neutral'
              ? this.translate.instant(entity.civility) + ' ' + entity.first_name + ' ' + entity.last_name
              : entity.first_name + ' ' + entity.last_name
            : '')
        : entity
        ? entity.civility !== 'neutral'
          ? this.translate.instant(entity.civility) + ' ' + entity.first_name + ' ' + entity.last_name
          : entity.first_name + ' ' + entity.last_name
        : '';
    }
    // console.log(candidate);
    this.subs.sink = this.candidatesService.SendRegistrationN1(candidateList).subscribe(
      (resp) => {
        // console.log(resp);
        Swal.fire({
          type: 'success',
          title: this.translate.instant('CANDIDAT_S2.TITLE'),
          html: this.translate.instant('CANDIDAT_S2.TEXT', {
            candidateName: candidates,
          }),
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('CANDIDAT_S2.BUTTON'),
        }).then(() => {
          this.isLoading = false;
          this.resetCandidate();
        });
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isLoading = false;
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
          this.resetCandidate();
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
    } else {
      this.disabledExport = true;
      this.isWasSelectAll = false;
    }
    console.log('showOptions', this.isWasSelectAll, info);
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    // Check user selected for see if already has registration profile and already call
    if (this.dataSelected.length > 0) {
      // console.log(data);
      const notDoing1stcalls = data.filter((listData) => listData.announcement_call === 'not_done' || !listData.registration_profile);
      if (notDoing1stcalls.length > 0) {
        this.isHasRegistrationProfileandCallNotDone = true;
      } else {
        this.isHasRegistrationProfileandCallNotDone = false;
      }
      if (this.dataSelected.length > 0) {
        const notDoing1stcall = data.filter((listData) => listData.announcement_call === 'done' && listData.registration_profile);
        if (notDoing1stcall.length > 0) {
          this.isHasRegistrationProfile = true;
        } else {
          this.isHasRegistrationProfile = false;
        }
      }

      if (this.dataSelected.length > 0) {
        const notDoing1stcall = data.filter((listData) => listData.announcement_call === 'not_done' && !listData.registration_profile);
        if (notDoing1stcall.length > 0) {
          this.isNoRegistrationProfileandCallNotDone = true;
        } else {
          this.isNoRegistrationProfileandCallNotDone = false;
        }
      }

      if (this.dataSelected.length > 0) {
        const notDoing1stcall = data.filter((listData) => listData.registration_profile);
        if (notDoing1stcall.length > 0) {
          this.isRegistrationProfileDone = true;
        } else {
          this.isRegistrationProfileDone = false;
        }
      }

      if (data && data.length) {
        const candidateMember = data.filter((list) => {
          return list.admission_member_id;
        });
        // console.log('candidateMember', candidateMember);
        if (candidateMember && candidateMember.length) {
          if (candidateMember.length === data.length) {
            const member = _.uniqBy(candidateMember, 'admission_member_id._id');
            this.assignText('bottom', 'member');
            if (member && member.length > 1) {
              this.isDifferentMember = true;
            } else {
              this.isDifferentMember = false;
            }
          } else {
            this.isDifferentMember = true;
          }
        } else {
          this.assignText('top', 'member');
          this.isDifferentMember = false;
        }
        const candidateMentor = data.filter((list) => {
          return list.student_mentor_id;
        });
        // console.log('candidateMentor', candidateMentor);
        if (candidateMentor && candidateMentor.length) {
          if (candidateMentor.length === data.length) {
            this.assignText('bottom', 'mentor');
            const mentor = _.uniqBy(candidateMentor, 'student_mentor_id._id');
            if (mentor && mentor.length > 1) {
              this.isDifferentMentor = true;
            } else {
              this.isDifferentMentor = false;
            }
          } else {
            this.isDifferentMentor = true;
          }
        } else {
          this.assignText('top', 'mentor');
          this.isDifferentMentor = false;
        }

        const candidateAnnoun = data.filter((list) => {
          // return list.announcement_email === 'not_sent';
          if (
            list &&
            list.announcement_email &&
            !list.announcement_email.sent_date &&
            !list.announcement_email.sent_time &&
            list.announcement_call === 'done'
          ) {
            return list;
          }
        });
        // console.log('candidateMentor', candidateAnnoun);
        if (candidateAnnoun && candidateAnnoun.length) {
          if (candidateAnnoun.length === data.length) {
            this.isDifferentAnnoucement = false;
          } else {
            this.isDifferentAnnoucement = true;
          }
        } else {
          this.isDifferentAnnoucement = true;
        }
        const candidateEmail = data.filter((list) => {
          // return list.announcement_email === 'not_sent';
          if (list.registration_profile === null) {
            return list;
          }
        });
        // console.log('candidateEmail', candidateEmail);
        if (candidateEmail && candidateEmail.length) {
          if (candidateEmail.length === data.length) {
            this.isEmailSent = false;
          } else {
            this.isEmailSent = true;
          }
        } else {
          this.isEmailSent = true;
        }
        const candidateCrm = data.filter((list) => {
          // return list.announcement_email === 'not_sent';
          if (
            list.is_oscar_updated === 'update_success' ||
            list.is_manual_updated === 'update_success' ||
            (list.is_hubspot_updated && list.is_hubspot_updated === 'update_success')
          ) {
            return list;
          }
        });
        // console.log('candidateEmail', candidateEmail);
        this.isCRMOk = false;
        if (candidateCrm && candidateCrm.length) {
          this.isCRMOk = true;
        }
        const candidateReisteredCrm = data.filter((list) => {
          if (
            list.candidate_admission_status !== 'registered' &&
            list.candidate_admission_status !== 'resigned' &&
            list.candidate_admission_status !== 'resigned_after_engaged' &&
            list.candidate_admission_status !== 'resigned_after_registered'
          ) {
            return list;
          }
        });
        this.isWasRegistered = false;
        if (candidateReisteredCrm && candidateReisteredCrm.length) {
          this.isWasRegistered = true;
        }
      }
      const intake = _.uniqBy(data, 'intake_channel.scholar_season_id._id');
      // console.log('intake', intake);
      const mappedData = data.map((res) => res && res.intake_channel && res.intake_channel._id);
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

  callCandidates(element) {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('CANDIDAT_S3.TITLE'),
      html: this.translate.instant('CANDIDAT_S3.TEXT', {
        candidateName:
          (element && element.civility && element.civility !== 'neutral' ? this.translate.instant(element.civility) + ' ' : '') +
          element.first_name +
          ' ' +
          element.last_name,
      }),
      showCancelButton: true,
      allowEscapeKey: true,
      allowOutsideClick: false,
      reverseButtons: true,
      confirmButtonText: this.translate.instant('CANDIDAT_S3.BUTTON_1'),
      cancelButtonText: this.translate.instant('CANDIDAT_S3.BUTTON_2'),
    }).then((res) => {
      if (res.value) {
        const payload = {
          announcement_call: 'done',
        };
        this.subs.sink = this.candidatesService.UpdateCandidateCall(element._id, payload).subscribe(
          (resp) => {
            // console.log('Candidate Updated!', resp);
            this.resetCandidate();
            Swal.fire({
              type: 'success',
              title: this.translate.instant('CANDIDAT_S4.MESSAGE'),
              html: this.translate.instant('CANDIDAT_S4.TEXT', {
                candidateName:
                  (element && element.civility && element.civility !== 'neutral' ? this.translate.instant(element.civility) + ' ' : '') +
                  element.first_name +
                  ' ' +
                  element.last_name,
              }),
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('CANDIDAT_S4.BUTTON'),
            }).then((resss) => {
              this.viewCandidateInfo(element._id, 'Commentaries');
            });
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
            if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('LEGAL_S5.Title'),
                text: this.translate.instant('LEGAL_S5.Text'),
                confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
              });
            } else if (
              err['message'] ===
                'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
              err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')
            ) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('EUROPEAN_COUNTRIES.TITLE'),
                html: this.translate.instant('EUROPEAN_COUNTRIES.TEXT'),
                confirmButtonText: this.translate.instant('EUROPEAN_COUNTRIES.BUTTON'),
              });
            } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('IBAN_S1.Title'),
                text: this.translate.instant('IBAN_S1.Text'),
                confirmButtonText: this.translate.instant('IBAN_S1.Button'),
              });
            } else if (
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
    });
  }

  firstCallCandidates(element) {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('CANDIDAT_S3.TITLE'),
      html: this.translate.instant('CANDIDAT_S3.TEXT', {
        candidateName:
          (element && element.civility && element.civility !== 'neutral' ? this.translate.instant(element.civility) + ' ' : '') +
          element.first_name +
          ' ' +
          element.last_name,
      }),
      showCancelButton: true,
      allowEscapeKey: true,
      allowOutsideClick: false,
      reverseButtons: true,
      confirmButtonText: this.translate.instant('CANDIDAT_S3.BUTTON_1'),
      cancelButtonText: this.translate.instant('CANDIDAT_S3.BUTTON_2'),
    }).then((res) => {
      if (res.value) {
        const payload = {
          announcement_call: 'done',
        };
        this.subs.sink = this.candidatesService.UpdateCandidateCall(element._id, payload).subscribe(
          (resp) => {
            // console.log('Candidate Updated!', resp);
            Swal.fire({
              type: 'success',
              title: this.translate.instant('CANDIDAT_S4.MESSAGE'),
              html: this.translate.instant('CANDIDAT_S4.TEXT', {
                candidateName:
                  (element && element.civility && element.civility !== 'neutral' ? this.translate.instant(element.civility) + ' ' : '') +
                  element.first_name +
                  ' ' +
                  element.last_name,
              }),
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('CANDIDAT_S4.BUTTON'),
            }).then((resss) => {
              this.resetCandidate();
              this.viewCandidateInfo(element._id, 'note-tab');
            });
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
            if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('LEGAL_S5.Title'),
                text: this.translate.instant('LEGAL_S5.Text'),
                confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
              });
            } else if (
              err['message'] ===
                'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
              err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')
            ) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('EUROPEAN_COUNTRIES.TITLE'),
                html: this.translate.instant('EUROPEAN_COUNTRIES.TEXT'),
                confirmButtonText: this.translate.instant('EUROPEAN_COUNTRIES.BUTTON'),
              });
            } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('IBAN_S1.Title'),
                text: this.translate.instant('IBAN_S1.Text'),
                confirmButtonText: this.translate.instant('IBAN_S1.Button'),
              });
            } else if (
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
    });
  }

  inCallCandidates(element) {
    Swal.fire({
      type: 'success',
      // title: this.translate.instant('CANDIDAT_INCOMING.TITLE'),
      html: this.translate.instant('CANDIDAT_INCOMING.TEXT', {
        candidateName:
          (element && element.civility && element.civility !== 'neutral' ? this.translate.instant(element.civility) + ' ' : '') +
          element.first_name +
          ' ' +
          element.last_name,
      }),
      // showCancelButton: true,
      allowEscapeKey: true,
      allowOutsideClick: false,
      confirmButtonText: this.translate.instant('CANDIDAT_INCOMING.BUTTON'),
    }).then((res) => {
      if (res.value) {
        const payload = {
          announcement_call: 'done',
        };
        this.subs.sink = this.candidatesService.UpdateIncamingCall(element._id, payload).subscribe(
          (resp) => {
            // console.log('Candidate Updated!', resp);
            this.resetCandidate();
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
            if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('LEGAL_S5.Title'),
                text: this.translate.instant('LEGAL_S5.Text'),
                confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
              });
            } else if (
              err['message'] ===
                'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
              err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')
            ) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('EUROPEAN_COUNTRIES.TITLE'),
                html: this.translate.instant('EUROPEAN_COUNTRIES.TEXT'),
                confirmButtonText: this.translate.instant('EUROPEAN_COUNTRIES.BUTTON'),
              });
            } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('IBAN_S1.Title'),
                text: this.translate.instant('IBAN_S1.Text'),
                confirmButtonText: this.translate.instant('IBAN_S1.Button'),
              });
            } else if (
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
    });
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    let schoolsMap;
    let levelsMap;
    let campusesMap;
    let tagMap;
    let sectorsMap;
    let specialitiesMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'candidate' ||
          key === 'admission_member' ||
          key === 'student_mentor' ||
          key === 'telephone' ||
          key === 'email' ||
          key === 'scholar_season' ||
          key === 'candidate_unique_number' ||
          key === 'registered_at' ||
          key === 'registration_email_due_date'
        ) {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        } else if (key === 'is_deposit_paids') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'payments') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'candidate_admission_statuses') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
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
            if (filterSteps.includes(`"not_done"`)) {
              filterSteps = filterSteps.replace(`"not_done"`, 'not_done');
            }
            if (filterSteps.includes(`"need_validation"`)) {
              filterSteps = filterSteps.replace(`"need_validation"`, 'need_validation');
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
        } else if (key === 'registration_profile') {
          filterQuery = filterQuery + ` ${key}: ${JSON.stringify(this.profileRateFilter.value)}`;
        } else if (key === 'admission_document_process_statuses') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'registration_profile_statuses') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'school') {
          schoolsMap = filterData.school.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` schools:[${schoolsMap}]`;
        } else if (key === 'level') {
          levelsMap = filterData.level.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` levels:[${levelsMap}]`;
        } else if (key === 'tags') {
          tagMap = filterData.tags.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` tags:[${tagMap}]`;
        } else if (key === 'campus') {
          campusesMap = filterData.campus.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` campuses:[${campusesMap}]`;
        } else if (key === 'sectors') {
          sectorsMap = filterData.sectors.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` sectors:[${sectorsMap}]`;
        } else if (key === 'specialities') {
          specialitiesMap = filterData.specialities.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` specialities:[${specialitiesMap}]`;
        } else if (key === 'sigle') {
          const dataMap = filterData.sigle.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` sigles:[${dataMap}]`;
        } else if (key === 'nationality') {
          const dataMap = filterData.nationality.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` nationalities:[${dataMap}]`;
        } else if (key === 'intake_channel') {
          const dataMap = filterData.intake_channel.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` intake_channels:[${dataMap}]`;
        } else if (key === 'announcement_call') {
          const dataMap = filterData.announcement_call.map((res) => `` + res + ``);
          filterQuery = filterQuery + ` announcement_calls:[${dataMap}]`;
        } else if (key === 'registration_email_date') {
          const dataMap = filterData.registration_email_date.map((res) => `` + res + ``);
          filterQuery = filterQuery + ` registration_email_dates:[${dataMap}]`;
        } else if (key === 'financement') {
          const dataMap = filterData.financement.map((res) => `` + res + ``);
          filterQuery = filterQuery + ` financements:[${dataMap}]`;
        } else if (key === 'is_deposit_paid') {
          const dataMap = filterData.is_deposit_paid.map((res) => `` + res + ``);
          filterQuery = filterQuery + ` is_deposit_paids:[${dataMap}]`;
        } else if (key === 'trial_dates') {
          const dataMap = filterData.trial_dates.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` trial_dates:[${dataMap}]`;
        } else if (key === 'is_oscar_updated') {
          const dataMap = filterData.is_oscar_updated.map((res) => `` + res + ``);
          filterQuery = filterQuery + ` is_oscar_updateds:[${dataMap}]`;
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
    return 'filter: {' + filterQuery + '}';
  }

  cleanFilterDataDownload() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    let schoolsMap;
    let levelsMap;
    let campusesMap;
    let tagMap;
    let sectorsMap;
    let specialitiesMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'candidate' ||
          key === 'admission_member' ||
          key === 'student_mentor' ||
          key === 'telephone' ||
          key === 'email' ||
          key === 'scholar_season' ||
          key === 'candidate_unique_number' ||
          key === 'registration_email_due_date' ||
          key === 'registered_at' ||
          key === 'connection' ||
          key === 'is_admitted' ||
          key === 'personal_information' ||
          key === 'signature' ||
          key === 'method_of_payment' ||
          key === 'is_deposit_paid' ||
          key === 'payment_method' ||
          key === 'type_of_formation_name'
        ) {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        } else if (key === 'is_deposit_paids') {
          const depositPaid = filterData.is_deposit_paids.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"is_deposit_paids":[${depositPaid}]`
            : filterQuery + `"is_deposit_paids":[${depositPaid}]`;
        } else if (key === 'payments') {
          const paymentMap = filterData.payments.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"payments":[${paymentMap}]` : filterQuery + `"payments":[${paymentMap}]`;
        } else if (key === 'registration_profile_statuses') {
          const resultData = filterData.registration_profile_statuses.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"registration_profile_statuses":[${resultData}]`
            : filterQuery + `"registration_profile_statuses":[${resultData}]`;
        } else if (key === 'admission_document_process_statuses') {
          const resultData = filterData.admission_document_process_statuses.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"admission_document_process_statuses":[${resultData}]`
            : filterQuery + `"admission_document_process_statuses":[${resultData}]`;
        } else if (key === 'nationality') {
          const natMap = filterData.nationality.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"nationalities":[${natMap}]` : filterQuery + `"nationalities":[${natMap}]`;
        } else if (key === 'candidate_admission_statuses' || key === 'candidate_admission_status') {
        } else if (key === 'school') {
          schoolsMap = filterData.school.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"schools":[${schoolsMap}]` : filterQuery + `"schools":[${schoolsMap}]`;
        } else if (key === 'level') {
          levelsMap = filterData.level.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"levels":[${levelsMap}]` : filterQuery + `"levels":[${levelsMap}]`;
        } else if (key === 'campus') {
          campusesMap = filterData.campus.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"campuses":[${campusesMap}]` : filterQuery + `"campuses":[${campusesMap}]`;
        } else if (key === 'tags') {
          tagMap = filterData.tags.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"tags":[${tagMap}]` : filterQuery + `"tags":[${tagMap}]`;
        } else if (key === 'sectors') {
          sectorsMap = filterData.sectors.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"sectors":[${sectorsMap}]` : filterQuery + `"sectors":[${sectorsMap}]`;
        } else if (key === 'specialities') {
          specialitiesMap = filterData.specialities.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"specialities":[${specialitiesMap}]`
            : filterQuery + `"specialities":[${specialitiesMap}]`;
        } else if (key === 'student_admission_steps') {
          const filterSteps = JSON.stringify(filterData[key]);
          filterQuery = filterQuery + `"${key}":${filterSteps}`;
        } else if (
          key === 'sigle' ||
          key === 'intake_channel' ||
          key === 'announcement_call' ||
          key === 'financement' ||
          key === 'is_oscar_updated' ||
          key === 'registration_email_date' ||
          key === 'registration_profile' ||
          key === 'trial_dates'
        ) {
          const dataFilterMap = filterData[key].map((res) => `"` + res + `"`);
          const valueKey =
            key === 'sigle'
              ? 'sigles'
              : key === 'intake_channel'
              ? 'intake_channels'
              : key === 'announcement_call'
              ? 'announcement_calls'
              : key === 'financement'
              ? 'financements'
              : key === 'is_oscar_updated'
              ? 'is_oscar_updateds'
              : key === 'registration_email_date'
              ? 'registration_email_dates'
              : key;
          filterQuery = filterQuery
            ? filterQuery + ',' + `"${valueKey}":[${dataFilterMap}]`
            : filterQuery + `"${valueKey}":[${dataFilterMap}]`;
        } else {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${filterData[key]}` : filterQuery + `"${key}":${filterData[key]}`;
        }
      }
    });
    if (this.isDirectorAdmission && !this.filteredValues.school) {
      if (this.currentUser && this.currentUser.entities) {
        this.schoolsFilter.setValue(this.currentUser.entities[0].candidate_school);
        filterQuery = filterQuery + ` school: "${this.currentUser.entities[0].candidate_school}"`;
      }
    }
    return 'filter={' + filterQuery + '}';
  }

  cleanSearchingDataDownload() {
    const filterData = _.cloneDeep(this.searching);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'trial_date' || key === 'continuous_formation_manager_id') {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        }
      }
    });
    return 'searching={' + filterQuery + '}';
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
            this.getCandidatesData('send email');
          }
        });
    }
  }

  reSendMail(element) {
    let data = [];
    if (element && element._id) {
      data = [element];
    } else {
      data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
      data = _.uniqBy(data, '_id');
    }
    this.sendEmailValidatorDialogComponent = this.dialog.open(SendEmailValidatorDialogComponent, {
      width: '800px',
      minHeight: '300px',
      panelClass: 'no-padding',
      disableClose: true,
      data: {
        data: data,
        isNeedValidator: false,
        isResendMail: true,
        isFc: true,
        isReadmission: false,
      },
    });
    this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
      if (result) {
        this.resetCandidate();
      }
      this.sendEmailValidatorDialogComponent = null;
    });
    // const candidate =
    //   (element && element.civility && element.civility !== 'neutral' ? this.translate.instant(element.civility) + ' ' : '') +
    //   element.first_name +
    //   ' ' +
    //   element.last_name;
    // Swal.fire({
    //   type: 'info',
    //   title: this.translate.instant('CANDIDAT_S9.TITLE'),
    //   html: this.translate.instant('CANDIDAT_S9.TEXT', {
    //     candidateName: candidate,
    //   }),
    //   showCancelButton: true,
    //   allowEscapeKey: true,
    //   allowOutsideClick: false,
    //   reverseButtons: true,
    //   confirmButtonText: this.translate.instant('CANDIDAT_S9.BUTTON_1'),
    //   cancelButtonText: this.translate.instant('CANDIDAT_S9.BUTTON_2'),
    // }).then((res) => {
    //   if (res.value) {
    //     this.isLoading = true;
    //     this.subs.sink = this.candidatesService.SendNotifRegistrationN8(element._id).subscribe(
    //       (resp) => {
    //         if (resp) {
    //           this.isLoading = false;
    //           Swal.fire({
    //             type: 'success',
    //             title: this.translate.instant('CANDIDAT_S10.TITLE'),
    //             html: this.translate.instant('CANDIDAT_S10.TEXT', {
    //               candidateName: candidate,
    //             }),
    //             allowOutsideClick: false,
    //             confirmButtonText: this.translate.instant('CANDIDAT_S10.BUTTON'),
    //           }).then(() => {
    //             this.getCandidatesData('triggerAnnouncement');
    //           });
    //         }
    //       },
    //       (err) => {
    //         this.isLoading = false;
    //         if (
    //           err &&
    //           err['message'] &&
    //           (err['message'].includes('jwt expired') ||
    //             err['message'].includes('str & salt required') ||
    //             err['message'].includes('Authorization header is missing') ||
    //             err['message'].includes('salt'))
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
    //   }
    // });
  }

  triggerPromo(element) {
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('PROMO_S1.TITLE'),
      html: this.translate.instant('PROMO_S1.TEXT', {
        candidateName: element.civility + ' ' + element.first_name + ' ' + element.last_name,
      }),
      showCancelButton: true,
      allowEscapeKey: true,
      allowOutsideClick: false,
      confirmButtonText: this.translate.instant('PROMO_S1.BUTTON_1'),
      cancelButtonText: this.translate.instant('PROMO_S1.BUTTON_2'),
    }).then((res) => {
      if (res.value) {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('PROMO_S2.TITLE'),
          text: this.translate.instant('PROMO_S2.TEXT'),
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('PROMO_S2.BUTTON'),
        });
      }
    });
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
            }
          }
        } else {
          result = true;
        }
      });
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
        // console.log('yes 5');
        const candidate = [];
        candidate.push(data);

        if (type === 'button' && this.dataSelected && this.dataSelected.length > 0) {
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
        this.isLoading = true;
        this.subs.sink = this.financeService.GetListProfileRates(filter).subscribe(
          (list) => {
            this.isLoading = false;
            if (list && list.length) {
              const response = _.cloneDeep(list);
              const admissionData = response.filter((ListResp) => ListResp.is_admission);
              if (admissionData && admissionData.length < 1) {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('Followup_S10.Title'),
                  html: this.translate.instant('Followup_S10.Text'),
                  confirmButtonText: this.translate.instant('Followup_S10.Button'),
                });
                return;
              } else {
                this.assignRateProfileDialogComponent = this.dialog.open(AssignRateProfileDialogComponent, {
                  width: '600px',
                  minHeight: '100px',
                  panelClass: 'certification-rule-pop-up',
                  disableClose: true,
                  data: {
                    selected: this.dataSelected && this.dataSelected.length ? this.dataSelected : candidate,
                    from: 'crm',
                    isVolumeOfHours: true,
                  },
                });
                this.subs.sink = this.assignRateProfileDialogComponent.afterClosed().subscribe((result) => {
                  if (result) {
                    this.resetCandidateKeepFilter();
                  }
                  this.assignRateProfileDialogComponent = null;
                });
              }
            } else {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('Followup_S10.Title'),
                html: this.translate.instant('Followup_S10.Text'),
                confirmButtonText: this.translate.instant('Followup_S10.Button'),
              });
              this.resetCandidateKeepFilter();
            }
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
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
    } else {
      this.assignAllRegistrationProfile(this.dataSelected);
    }
  }

  crmOk() {
    console.log('crmOk', this.isWasSelectAll, this.selectType);
    if (
      ((this.selectType === 'one' && this.dataSelected.length) || this.selectType === 'all' || !this.selectType) &&
      !this.isWasSelectAll
    ) {
      if (this.dataSelected.length < 1) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Followup_S8.Title'),
          html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
          confirmButtonText: this.translate.instant('Followup_S8.Button'),
        });
      } else if (this.isCRMOk) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Followup_S15.Title'),
          html: this.translate.instant('Followup_S15.Text'),
          confirmButtonText: this.translate.instant('Followup_S15.Button'),
        });
      } else if (this.isWasRegistered) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Followup_S16.Title'),
          html: this.translate.instant('Followup_S16.Text'),
          confirmButtonText: this.translate.instant('Followup_S16.Button'),
        });
      } else {
        if (this.dataSelected && this.dataSelected.length) {
          const payload = this.dataSelected.map((resp) => resp._id);
          console.log(payload);
          this.subs.sink = this.candidatesService.UpdateCandidateCRMStatus(payload).subscribe(
            (resp) => {
              if (resp) {
                this.isLoading = false;
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('CANDIDAT_CRM.TITLE'),
                  html: this.translate.instant('CANDIDAT_CRM.TEXT'),
                  allowOutsideClick: false,
                  confirmButtonText: this.translate.instant('CANDIDAT_CRM.BUTTON'),
                }).then(() => {
                  this.resetCandidateKeepFilter();
                });
              }
            },
            (err) => {
              // Record error log
              this.authService.postErrorLog(err);
              this.isLoading = false;
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
              // console.log(err);
            },
          );
        }
      }
    } else if (this.isWasSelectAll && this.selectType === 'one') {
      this.allStudentForCustom = [];
      this.allCandidateData = [];
      this.getAllCandiateWithCustomData(0, 'crm');
    } else if (this.selectType === 'all' && this.dataSelected.length && this.isWasSelectAll) {
      const candidateId = this.dataSource.data.map((resp) => resp._id);
      const ids = this.dataSelected.map((resp) => resp._id);
      const dataPage = candidateId.filter((resp) => !ids.includes(resp));
      if (dataPage && dataPage.length) {
        this.allStudentForCustom = [];
        this.allCandidateData = [];
        this.getAllCandiateWithCustomData(0, 'crm');
      } else {
        this.allStudentForExport = [];
        this.allCandidateData = [];
        this.getAllCandiateData(0, 'crm');
      }
    }
  }

  openTransferCampus(data, type) {
    const candidate = [];
    candidate.push(data);
    this.subs.sink = this.dialog
      .open(TransferCampusDialogComponent, {
        width: '600px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: '',
      })
      .afterClosed()
      .subscribe((resp) => {
        this.resetCandidateKeepFilter();
      });
  }

  openTransferAdmission(data, type) {
    const candidate = [];
    candidate.push(data);
    this.subs.sink = this.dialog
      .open(TransferAdmissionDialogComponent, {
        width: '600px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          data: candidate,
          from: 'admission',
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.resetCandidateKeepFilter();
        }
      });
  }

  openAssignMemberFc(data, type) {
    let dataCandidates = [];
    if (data && data._id) {
      dataCandidates = [data];
    } else {
      dataCandidates = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
      dataCandidates = _.uniqBy(dataCandidates, '_id');
    }
    // new function
    if (type === 'button' && this.selection.selected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      this.assignMemberFcDialogComponent = this.dialog.open(AssignMemberFcDialogComponent, {
        width: '650px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          data: dataCandidates,
          type: 'admission',
        },
      });
      this.subs.sink = this.assignMemberFcDialogComponent.afterClosed().subscribe((resulta) => {
        if (resulta) {
          this.resetCandidateKeepFilter();
        }
        this.assignMemberFcDialogComponent = null;
      });
    }
  }

  setIntakeSelected(titleId) {
    // check if previously selected then select again, if yes then reset dropdown before filtering again
    if (titleId !== 'All' && this.filteredValues.intake_channel && this.filteredValues.intake_channel !== titleId._id) {
      this.clearSelectIfFilter();
      this.entryWayFilterList = this.backupEntryWayFilterList;
    }

    if (titleId !== 'All') {
      this.clearSelectIfFilter();
      this.filteredValues.intake_channel = titleId._id;
      this.selectedProgram = titleId.intake_channel;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('setIntakeSelected');
      }
    } else {
      this.clearSelectIfFilter();
      this.filteredValues.intake_channel = null;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('setIntakeSelected');
      }
    }
  }

  setTrialDate() {
    if (this.filteredValues.trial_dates !== this.trialDateCtrl.value) {
      if (this.trialDateCtrl.value?.length) {
        this.filteredValues.trial_dates = this.trialDateCtrl.value;
      } else {
        this.trialDateCtrl.setValue(null);
        this.filteredValues.trial_dates = null;
      }
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('set trial date');
      }
    }
  }

  setCRM() {
    if (this.filteredValues.is_oscar_updated !== this.crmFilter.value) {
      if (this.crmFilter.value?.length) {
        this.filteredValues.is_oscar_updated = this.crmFilter.value;
      } else {
        this.crmFilter.setValue(null);
        this.filteredValues.is_oscar_updated = null;
      }
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('oscarFilter');
      }
    }
  }

  // setProfileSelected(titleId?: string) {
  //   if (this.filteredValues?.registration_profile !== this.profileRateFilter?.value) {
  //     this.clearSelectIfFilter();
  //     this.filteredValues.registration_profile = this.profileRateFilter?.value?.length ? this.profileRateFilter.value : null;
  //     this.paginator.pageIndex = 0;
  //     if (!this.isReset) {
  //       this.getCandidatesData('oscarFilter');
  //     }
  //   }
  // }

  setProfileSelected(titleId?: string) {
    // check if previously selected then select again, if yes then reset dropdown before filtering again
    const filterValue = this.profileRateFilter.value ? this.profileRateFilter.value : [];
    const isEffected = filterValue.every((resp) => resp === 'affected');
    const isNonEffected = filterValue.every((resp) => resp === 'not_affected');
    const isRegistrationProfile = filterValue.filter((resp) => resp !== 'not_affected' && resp !== 'affected');
    if (
      isRegistrationProfile?.length > 0 &&
      filterValue[filterValue?.length - 1] !== 'affected' &&
      filterValue[filterValue?.length - 1] !== 'not_affected'
    ) {
      const temp = _.cloneDeep(this.profileRateFilter.value);
      const ids = [];
      const filteredTemp = temp.filter((res) => {
        if (res !== 'All' && res !== 'not_affected' && res !== 'affected') {
          ids.push(res);
        }
      });
      this.profileRateFilter.patchValue(ids);
      const isSame = JSON.stringify(this.tempDataFilter.registrationProfile) === JSON.stringify(this.profileRateFilter.value);
      if (isSame) {
        return;
      } else if (this.profileRateFilter.value?.length) {
        this.filteredValues.registration_profile_statuses = null;
        this.filteredValues.registration_profile = ids;
        this.tempDataFilter.registrationProfile = ids;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('profileRateFilter');
        }
      } else {
        if (this.tempDataFilter.registrationProfile?.length && !this.profileRateFilter.value?.length) {
          this.filteredValues.registration_profile_statuses = null;
          this.filteredValues.registration_profile = null;
          this.tempDataFilter.registrationProfile = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getCandidatesData('profileRateFilter');
          }
        } else {
          return;
        }
      }
    } else if (filterValue.length === 0) {
      // this.clearSelectIfFilter();
      // const all = ['All'];
      const isSame = JSON.stringify(this.tempDataFilter.registrationProfile) === JSON.stringify(this.profileRateFilter.value);
      if (isSame) {
        return;
      } else if (this.profileRateFilter.value?.length) {
        this.filteredValues.registration_profile_statuses = filterValue;
        this.filteredValues.registration_profile = null;
        this.tempDataFilter.registrationProfile = this.profileRateFilter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('profileRateFilter');
        }
      } else {
        if (this.tempDataFilter.registrationProfile?.length && !this.profileRateFilter.value?.length) {
          this.filteredValues.registration_profile_statuses = null;
          this.filteredValues.registration_profile = null;
          this.tempDataFilter.registrationProfile = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getCandidatesData('profileRateFilter');
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
        // this.clearSelectIfFilter();
        // this.filteredValues.registration_profile_statuses = filterValue;
        // this.filteredValues.registration_profile = null;
        // this.paginator.pageIndex = 0;
        // const notAffected = ['not_affected'];
        // this.profileRateFilter.setValue(notAffected);
        const isSame = JSON.stringify(this.tempDataFilter.registrationProfile) === JSON.stringify(this.profileRateFilter.value);
        if (isSame) {
          return;
        } else if (this.profileRateFilter.value?.length) {
          const notAffected = ['not_affected'];
          this.profileRateFilter.setValue(notAffected);
          this.filteredValues.registration_profile_statuses = notAffected;
          this.filteredValues.registration_profile = null;
          this.tempDataFilter.registrationProfile = this.profileRateFilter.value;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getCandidatesData('profileRateFilter');
          }
        } else {
          if (this.tempDataFilter.registrationProfile?.length && !this.profileRateFilter.value?.length) {
            this.filteredValues.registration_profile_statuses = null;
            this.filteredValues.registration_profile = null;
            this.tempDataFilter.registrationProfile = null;
            if (!this.isReset) {
              this.paginator.pageIndex = 0;
              this.getCandidatesData('profileRateFilter');
            }
          } else {
            return;
          }
        }
      }

      if (filterValue.includes('affected') && !filterValue.includes('not_affected')) {
        const isSame = JSON.stringify(this.tempDataFilter.registrationProfile) === JSON.stringify(this.profileRateFilter.value);
        if (isSame) {
          return;
        } else if (this.profileRateFilter.value?.length) {
          const affected = ['affected'];
          this.profileRateFilter.setValue(affected);
          this.filteredValues.registration_profile_statuses = affected;
          this.filteredValues.registration_profile = null;
          this.tempDataFilter.registrationProfile = this.profileRateFilter.value;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getCandidatesData('profileRateFilter');
          }
        } else {
          if (this.tempDataFilter.registrationProfile?.length && !this.profileRateFilter.value?.length) {
            this.filteredValues.registration_profile_statuses = null;
            this.filteredValues.registration_profile = null;
            this.tempDataFilter.registrationProfile = null;
            if (!this.isReset) {
              this.paginator.pageIndex = 0;
              this.getCandidatesData('profileRateFilter');
            }
          } else {
            return;
          }
        }
      }

      if (filterValue.includes('affected') && filterValue.includes('not_affected')) {
        const isSame = JSON.stringify(this.tempDataFilter.registrationProfile) === JSON.stringify(this.profileRateFilter.value);
        if (isSame) {
          return;
        } else if (this.profileRateFilter.value?.length) {
          const affected = ['affected', 'not_affected'];
          this.profileRateFilter.setValue(affected);
          this.filteredValues.registration_profile_statuses = affected;
          this.filteredValues.registration_profile = null;
          this.tempDataFilter.registrationProfile = this.profileRateFilter.value;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getCandidatesData('profileRateFilter');
          }
        } else {
          if (this.tempDataFilter.registrationProfile?.length && !this.profileRateFilter.value?.length) {
            this.filteredValues.registration_profile_statuses = null;
            this.filteredValues.registration_profile = null;
            this.tempDataFilter.registrationProfile = null;
            if (!this.isReset) {
              this.paginator.pageIndex = 0;
              this.getCandidatesData('profileRateFilter');
            }
          } else {
            return;
          }
        }
      }
    }
  }

  enterIntakeFilter(event: MatAutocomplete) {
    // console.log(event);
    if (event && event.options && event.options.length > 1) {
      let titleId = '';
      event.options.forEach((option, optionIndex) => {
        if (optionIndex === 1 && option) {
          // console.log(option);
          const foundTitle = this.entryWayFilterList.find((title) => option.value === title);
          if (foundTitle) {
            titleId = foundTitle;
            this.entryWayFilter.setValue(foundTitle);
          }
        }
      });
      if (titleId) {
        this.setIntakeSelected(titleId);
      }
    } else {
      this.entryWayFilter.setValue('');
      this.setIntakeSelected(null);
    }
  }

  enterRegistrationFilter(event: MatAutocomplete) {
    // console.log(event);
    if (event && event.options && event.options.length > 1) {
      let titleId = '';
      event.options.forEach((option, optionIndex) => {
        if (optionIndex === 1 && option) {
          // console.log(option);
          const foundTitle = this.profileRateFilterList.find((title) => option.value === title.name);
          if (foundTitle) {
            titleId = foundTitle;
            this.profileRateFilter.setValue(foundTitle);
          }
        }
      });
      if (titleId) {
        this.setProfileSelected(titleId);
      }
    } else {
      this.profileRateFilter.setValue('');
      this.setProfileSelected(null);
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

  viewAdmissionFile(toFormId) {
    // console.log('CANDISDATE ID>>', toCandidateId, '--', 'FORM ID ID>>', toFormId);
    if (toFormId) {
      const userTypeId = this.authService.getCurrentUser().entities[0].type._id;
      const query = { formId: toFormId, formType: 'student_admission', userId: this.currentUser._id, userTypeId: userTypeId };
      const url = this.router.createUrlTree(['/form-fill'], { queryParams: query });
      window.open(url.toString(), '_blank');
    }

    // Old link
    // const query = { candidate: candidateId };
    // const url = this.router.createUrlTree(['/session/register'], { queryParams: query });
    // window.open(url.toString(), '_blank');
  }

  validateActionButtonCall(element) {
    let allow = true;
    if (element && element.registration_profile && element.registration_profile !== '') {
      allow = false;
    }
    if ((this.dataSelected && this.dataSelected.length > 0) || this.isCheckedAll) {
      allow = true;
    }
    return allow;
  }

  validateActionButtonMail(element) {
    let allow = true;
    // if (element && element.announcement_call && element.announcement_call === 'done') {
    //   allow = false;
    // }
    if (element && element.registration_profile && element.registration_profile !== null) {
      allow = false;
    }
    if ((this.dataSelected && this.dataSelected.length > 0) || this.isCheckedAll) {
      allow = true;
    }
    return allow;
  }

  validateActionButtonRate(element) {
    let allow = true;
    if ((this.dataSelected && this.dataSelected.length > 0) || this.isCheckedAll) {
      allow = false;
    }
    return allow;
  }

  hideActionButtonCallIncoming(element) {
    let allow = true;
    if (element && element.announcement_call && element.announcement_call === 'done') {
      allow = false;
    }
    return allow;
  }

  hideActionButtonCall(element) {
    let allow = true;
    if (element && element.registration_profile && element.registration_profile !== '') {
      allow = true;
    }
    if (element && element.announcement_call && element.announcement_call === 'done') {
      allow = false;
    }
    if (element && element.engagement_level && element.engagement_level === 'registered') {
      allow = false;
    }
    // if (element && !element.telephone) {
    //   allow = false;
    // }
    return allow;
  }

  hideActionButtonCallRegular(element) {
    let allow = false;
    if ((element && element.announcement_call && element.announcement_call === 'done') || element.telephone) {
      allow = true;
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

  hideActionButtonRate(element) {
    let allow = false;
    if (element && element.admission_member_id && element.admission_member_id._id) {
      allow = true;
    }
    if (element.registration_profile !== null && element.registration_profile.name !== '') {
      allow = false;
    }
    if (element && element.engagement_level && element.engagement_level === 'registered') {
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

  openWhatsapp(element) {
    const whatsAppUrl = 'https://api.whatsapp.com/send?phone=' + element.telephone + '&text=';
    const whatsAppText = this.translate.instant('whatsapp message', {
      name: element.first_name,
      dev:
        (this.currentUser && this.currentUser.civility && this.currentUser.civility !== 'neutral'
          ? `${this.translate.instant(this.currentUser.civility)} `
          : '') + `${this.currentUser.first_name} ${this.currentUser.last_name}`,
      school: element.school,
      campus: element.campus,
      position: this.currentUser.position,
    });
    // console.log('curernt ', this.currentUser);
    // console.log('whatsAppText ', whatsAppText);
    window.open(whatsAppUrl + whatsAppText, '_blank');
  }

  connectAsUser(user: any) {
    // console.log(user);
    const currentUser = this.utilService.getCurrentUser();
    const studentUserId = user && user.user_id && user.user_id ? user.user_id : null;
    if (currentUser && studentUserId) {
      this.subs.sink = this.authService.loginAsUser(currentUser._id, studentUserId).subscribe(
        (resp) => {
          // console.log(resp);
          if (resp && resp.user) {
            // console.log(resp.user);
            const tempUser = resp.user;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('SUCCESS'),
              html: this.translate.instant('USER_S7_SUPERUSER.TEXT', {
                UserCivility: user.civility !== 'neutral' ? this.translate.instant(user.civility) : '',
                UserFirstName: user.first_name,
                UserLastName: user.last_name,
              }),
              allowEscapeKey: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('UNDERSTOOD'),
            }).then((result) => {
              this.authService.backupLocalUserProfileAndToken();
              this.authService.setLocalUserProfileAndToken(resp);
              this.authService.setPermission([tempUser.entities[0].type.name]);
              this.ngxPermissionService.flushPermissions();
              this.ngxPermissionService.loadPermissions([tempUser.entities[0].type.name]);
              this.userService.reloadCurrentUser(true);
              if (user.connection === 'done' && user.engagement_level !== 'registered') {
                this.router.navigate(['/session/register'], {
                  queryParams: { candidate: user._id },
                });
              } else {
                this.router.navigate(['/rncpTitles']);
              }
            });
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

  getAllCandiateData(pageNumber: number, from) {
    this.isLoading = true;
    const pagination = {
      limit: 500,
      page: pageNumber,
    };
    const filter = this.cleanFilterData();
    console.log('filter', filter);
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService.getAllCandidatesFc(pagination, this.sortValue, filter, this.searching, userTypesList).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.allStudentForExport.push(...students);
          this.allCandidateData.push(...students);
          const page = pageNumber + 1;
          // console.log('this.allStudentForCsv ', this.allStudentForExport);
          // recursively get student data by 500 until we dont get student data anymore
          // we use this way because if we get all the data at once, it will trigger cors policy error because response too big
          this.getAllCandiateData(page, from);
        } else {
          this.isLoading = false;
          if (from === 'assign') {
            this.assignAllRegistrationProfile(this.allStudentForExport);
          } else if (from === 'firstCall') {
            this.firstCallAllCandidate(this.allStudentForExport);
          } else if (from === 'firstEmail') {
            this.firstEmailAllCandidate(this.allStudentForExport);
          } else if (from === 'crm') {
            this.crmAllOk(this.allStudentForExport);
          }
        }
      },
      (err) => {
        // Record error log
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

  getAllCandiateWithCustomData(pageNumber: number, from) {
    this.isLoading = true;
    const pagination = {
      limit: 500,
      page: pageNumber,
    };
    const filter = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService.getAllCandidatesFc(pagination, this.sortValue, filter, this.searching, userTypesList).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.allStudentForCustom.push(...students);
          this.allCandidateData.push(...students);
          const page = pageNumber + 1;
          // console.log('this.allStudentForCsv ', this.allStudentForCustom);
          // recursively get student data by 500 until we dont get student data anymore
          // we use this way because if we get all the data at once, it will trigger cors policy error because response too big
          this.getAllCandiateWithCustomData(page, from);
        } else {
          this.isLoading = false;
          const candidateId = this.dataSource.data.map((resp) => resp._id);
          const ids = this.dataSelected.map((resp) => resp._id);
          const dataPage = candidateId.filter((resp) => !ids.includes(resp));
          const dataFinal = this.allStudentForCustom.filter((resp) => !dataPage.includes(resp._id));
          if (from === 'assign') {
            this.assignAllRegistrationProfile(dataFinal);
          } else if (from === 'firstCall') {
            this.firstCallAllCandidate(dataFinal);
          } else if (from === 'firstEmail') {
            this.firstEmailAllCandidate(dataFinal);
          } else if (from === 'crm') {
            this.crmAllOk(dataFinal);
          }
        }
      },
      (err) => {
        // Record error log
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

  setAdmissionDocumentStatusFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.admissionDocumentStatus) === JSON.stringify(this.admissionDocumentFilter.value);
    console.log('ini', this.admissionDocumentFilter.value)
    if (isSame) {
      return;
    } else if (this.admissionDocumentFilter.value?.length) {
      this.filteredValues.admission_document_process_statuses = this.admissionDocumentFilter.value;
      this.tempDataFilter.admissionDocumentStatus = this.admissionDocumentFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('admissionDocumentFilter');
      }
    } else {
      if (this.tempDataFilter.admissionDocumentStatus?.length && !this.admissionDocumentFilter.value?.length) {
        this.filteredValues.admission_document_process_statuses = this.admissionDocumentFilter.value;
        this.tempDataFilter.admissionDocumentStatus = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('admissionDocumentFilter');
        }
      } else {
        return;
      }
    }
  }

  crmAllOk(data) {
    const candidateCrm = data.filter((list) => {
      // return list.announcement_email === 'not_sent';
      if (
        list.is_oscar_updated === 'update_success' ||
        list.is_manual_updated === 'update_success' ||
        (list.is_hubspot_updated && list.is_hubspot_updated === 'update_success')
      ) {
        return list;
      }
    });
    this.isCRMOk = false;
    if (candidateCrm && candidateCrm.length) {
      this.isCRMOk = true;
    }
    const candidateReisteredCrm = data.filter((list) => {
      if (
        list.candidate_admission_status !== 'registered' &&
        list.candidate_admission_status !== 'resigned' &&
        list.candidate_admission_status !== 'resigned_after_engaged' &&
        list.candidate_admission_status !== 'resigned_after_registered'
      ) {
        return list;
      }
    });
    this.isWasRegistered = false;
    if (candidateReisteredCrm && candidateReisteredCrm.length) {
      this.isWasRegistered = true;
    }
    console.log('crmOk', this.isWasSelectAll, this.selectType);
    if (this.selection.selected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else if (this.isCRMOk) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S15.Title'),
        html: this.translate.instant('Followup_S15.Text'),
        confirmButtonText: this.translate.instant('Followup_S15.Button'),
      });
    } else if (this.isWasRegistered) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S16.Title'),
        html: this.translate.instant('Followup_S16.Text'),
        confirmButtonText: this.translate.instant('Followup_S16.Button'),
      });
    } else {
      if (data && data.length) {
        const payload = data.map((resp) => resp._id);
        console.log(payload);
        this.subs.sink = this.candidatesService.UpdateCandidateCRMStatus(payload).subscribe(
          (resp) => {
            if (resp) {
              this.isLoading = false;
              Swal.fire({
                type: 'success',
                title: this.translate.instant('CANDIDAT_CRM.TITLE'),
                html: this.translate.instant('CANDIDAT_CRM.TEXT'),
                allowOutsideClick: false,
                confirmButtonText: this.translate.instant('CANDIDAT_CRM.BUTTON'),
              }).then(() => {
                this.resetCandidateKeepFilter();
              });
            }
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
            this.isLoading = false;
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
            // console.log(err);
          },
        );
      }
    }
  }

  firstEmailAllCandidate(data) {
    const notDoing1stcall = data.filter((listData) => listData.announcement_call === 'not_done' || !listData.registration_profile);
    if (notDoing1stcall.length > 0) {
      this.isHasRegistrationProfileandCallNotDone = true;
    } else {
      this.isHasRegistrationProfileandCallNotDone = false;
    }
    const candidateAnnoun = data.filter((list) => {
      if (!list.announcement_email.sent_date && !list.announcement_email.sent_time && list.announcement_call === 'done') {
        return list;
      }
    });
    if (candidateAnnoun && candidateAnnoun.length) {
      if (candidateAnnoun.length === data.length) {
        this.isDifferentAnnoucement = false;
      } else {
        this.isDifferentAnnoucement = true;
      }
    } else {
      this.isDifferentAnnoucement = true;
    }

    if (this.dataSelected.length > 0) {
      const notDoing1stcalls = this.dataSelected.filter((listData) => listData.registration_profile);
      if (notDoing1stcalls.length > 0) {
        this.isRegistrationProfileDone = true;
      } else {
        this.isRegistrationProfileDone = false;
      }
    }

    if (!this.isRegistrationProfileDone) {
    }
    if (this.isHasRegistrationProfileandCallNotDone) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S12s.Title'),
        html: this.translate.instant('Followup_S12s.Text'),
        confirmButtonText: this.translate.instant('Followup_S12s.Button'),
      });
    } else if (data.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else if (this.isDifferentAnnoucement) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S11.Title'),
        html: this.translate.instant('Followup_S11.Text'),
        confirmButtonText: this.translate.instant('Followup_S11.Button'),
      });
    } else {
      let candidatess = '';
      const usersId = [];
      for (const entity of data) {
        candidatess = candidatess
          ? candidatess +
            ', ' +
            (entity
              ? (entity.civility !== 'neutral' ? this.translate.instant(entity.civility) + ' ' : '') +
                entity.first_name +
                ' ' +
                entity.last_name
              : '')
          : entity
          ? (entity.civility !== 'neutral' ? this.translate.instant(entity.civility) + ' ' : '') +
            entity.first_name +
            ' ' +
            entity.last_name
          : '';
        usersId.push(entity._id);
      }
      // *************** Check if all data is valid
      const isAllValid = usersId.length === this.dataSelected.length;

      this.sendNotifN1Multiple(usersId, candidatess, isAllValid);
    }
  }

  firstCallAllCandidate(data) {
    const candidateIds = data.map((resp) => resp._id);
    const notDoing1stcall = data.filter((listData) => listData.announcement_call === 'done' && listData.registration_profile);
    if (notDoing1stcall.length > 0) {
      this.isHasRegistrationProfile = true;
    } else {
      this.isHasRegistrationProfile = false;
    }

    const notDoing1stcalls = data.filter((listData) => listData.announcement_call === 'not_done' && !listData.registration_profile);
    if (notDoing1stcalls.length > 0) {
      this.isNoRegistrationProfileandCallNotDone = true;
    } else {
      this.isNoRegistrationProfileandCallNotDone = false;
    }

    if (data.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else if (this.isNoRegistrationProfileandCallNotDone) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S14.Title'),
        html: this.translate.instant('Followup_S14.Text'),
        confirmButtonText: this.translate.instant('Followup_S14.Button'),
      });
    } else {
      this.subs.sink = this.financeService.UpdateCandidateAnnouncementCall(candidateIds).subscribe(
        (res) => {
          if (res) {
            if (this.isHasRegistrationProfile) {
              // call api when one of selected candidate doesnt have a registration profile or call was done will return this swal
              Swal.fire({
                type: 'warning',
                title: this.translate.instant('Followup_S1.TITLE'),
                html: this.translate.instant('Followup_S1.TEXT'),
                confirmButtonText: this.translate.instant('Followup_S1.BUTTON1'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.resetCandidateKeepFilter();
              });
            } else {
              // call api when selected candidate already has a registration profile but not doing first call
              Swal.fire({
                type: 'success',
                title: this.translate.instant('CANDIDAT_INCOMING_S2.TITLE'),
                html: this.translate.instant('CANDIDAT_INCOMING_S2.TEXT'),
                confirmButtonText: this.translate.instant('CANDIDAT_INCOMING_S2.BUTTON'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.resetCandidateKeepFilter();
              });
            }
          }
        },
        (err) => {
          // Record error log
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

  assignAllRegistrationProfile(data) {
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
      this.isLoading = true;
      this.subs.sink = this.financeService.GetListProfileRates(filter).subscribe(
        (list) => {
          this.isLoading = false;
          if (list && list.length) {
            const response = _.cloneDeep(list);
            const admissionData = response.filter((ListResp) => ListResp.is_admission);
            if (admissionData && admissionData.length < 1) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('Followup_S10.Title'),
                html: this.translate.instant('Followup_S10.Text'),
                confirmButtonText: this.translate.instant('Followup_S10.Button'),
              });
              return;
            } else {
              this.assignRateProfileDialogComponent = this.dialog.open(AssignRateProfileDialogComponent, {
                width: '600px',
                minHeight: '100px',
                panelClass: 'certification-rule-pop-up',
                disableClose: true,
                data: {
                  selected: data,
                  from: 'crm',
                  isVolumeOfHours: true,
                },
              });
              this.subs.sink = this.assignRateProfileDialogComponent.afterClosed().subscribe((result) => {
                if (result) {
                  this.resetCandidateKeepFilter();
                }
                this.assignRateProfileDialogComponent = null;
              });
            }
          } else {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('Followup_S10.Title'),
              html: this.translate.instant('Followup_S10.Text'),
              confirmButtonText: this.translate.instant('Followup_S10.Button'),
            });
            this.resetCandidateKeepFilter();
          }
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
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
  }

  getDataForList(data?) {
    if (this.isDirectorAdmission) {
      const name =
        this.currentUser && this.currentUser.entities && this.currentUser.entities[0] ? this.currentUser.entities[0].candidate_school : '';
      this.subs.sink = this.candidatesService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe(
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
          // Record error log
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
      const name = data ? data : '';
      const filter = { scholar_season_id: name };
      // this.subs.sink = this.candidatesService.GetDataForImportObjectives(name).subscribe((resp) => {
      this.subs.sink = this.candidatesService.GetAllSchoolDropdown(filter, name, this.currentUserTypeId).subscribe(
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
          }
        },
        (err) => {
          // Record error log
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

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        // console.log(resp);
        if (resp && resp.length) {
          this.originalScholar = _.cloneDeep(resp);
          this.scholars = [];
          this.scholars = this.originalScholar.sort((a, b) =>
            a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
          );
          this.scholars.unshift({ _id: 'All', scholar_season: this.translate.instant('AllF') });
          this.scholars = _.uniqBy(this.scholars, '_id');
          // this.scholarFilter.setValue(this.scholars[0]._id);
        }
      },
      (err) => {
        // Record error log
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

  refetchDataScholarSeasons() {
    this.scholars = [];
    this.scholars = this.originalScholar.sort((a, b) =>
      a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
    );
    this.scholars.unshift({ _id: 'All', scholar_season: this.translate.instant('AllF') });
    this.scholars = _.uniqBy(this.scholars, '_id');
  }

  scholarSelect() {
    this.school = [];
    this.campusList = [];
    this.levels = [];
    this.sectorList = [];
    this.specialityList = [];
    if (this.schoolsFilter.value) {
      this.schoolsFilter.setValue(null);
    }
    if (this.sectorFilter.value) {
      this.sectorFilter.setValue(null);
    }
    if (this.specialityFilter.value) {
      this.specialityFilter.setValue(null);
    }
    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (!this.scholarFilter.value || this.scholarFilter.value.length === 0) {
      // this.filteredValues['scholar_season'] = '';
      this.scholarSelected = [];
      this.school = [];
      this.levels = [];
      this.campusList = [];
      if (this.campusFilter.value) {
        this.campusFilter.setValue(null);
      }
      if (this.levelFilter.value) {
        this.levelFilter.setValue(null);
      }
      if (this.schoolsFilter.value) {
        this.schoolsFilter.setValue(null);
      }
      // this.getDataForList();
    } else {
      // this.filteredValues['scholar_season'] = this.scholarFilter.value;
      this.scholarSelected = this.scholarFilter.value;
      const scholarSeason = this.scholarFilter.value && !this.scholarFilter.value.includes('All') ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }
  }
  selectSchoolFilter() {
    const form = this.schoolsFilter.value;
    if (form && form.length) {
      this.schoolsFilter.patchValue(form);
    } else {
      this.schoolsFilter.patchValue(null);
    }
    this.getDataCampus();
  }

  getDataCampus() {
    this.schoolName = '';
    this.levels = [];
    this.campusList = [];
    this.sectorList = [];
    this.specialityList = [];
    const school = this.schoolsFilter.value;
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
    if (
      this.currentUser &&
      this.currentUser.entities &&
      this.currentUser.entities[0].campus &&
      school &&
      school?.length &&
      !school.includes('AllF')
    ) {
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
        this.filteredValues.school = this.schoolsFilter.value;
        school.forEach((element) => {
          const sName = this.school.find((list) => list._id === element);
          this.schoolName = this.schoolName ? this.schoolName + ',' + sName.short_name : sName.short_name;
        });
        this.currentUser.app_data.school_package.forEach((element) => {
          if (element && element.school && element.school._id && school.includes(element.school._id)) {
            this.campusList = _.concat(this.campusList, element.school.campuses);
          }
        });
      } else {
        this.currentUser.entities.forEach((element) => {
          this.listObjective.filter((campus, n) => {
            if (campus.campuses && campus.campuses.length) {
              campus.campuses.filter((campusData, nex) => {
                if (
                  campusData &&
                  element &&
                  element.campus &&
                  element.campus.name &&
                  campusData.name.toLowerCase() === element.campus.name.toLowerCase()
                ) {
                  this.campusList.push(campusData);
                }
              });
            }
          });
        });
      }
      this.getDataLevel();
    } else {
      if (school && school?.length && !school.includes('AllF')) {
        school.forEach((element) => {
          const sName = this.school.find((list) => list._id === element);
          this.schoolName = this.schoolName ? this.schoolName + ',' + sName.short_name : sName.short_name;
        });

        const scampusList = this.listObjective.filter((list) => {
          return school.includes(list._id);
        });
        scampusList.filter((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.filter((campusData, nex) => {
              this.campusList.push(campusData);
            });
          }
        });
      } else if (this.listObjective && this.listObjective.length && school && school?.length && school.includes('AllF')) {
        this.listObjective.forEach((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.forEach((campusess, nex) => {
              this.campusList.push(campusess);
            });
          }
        });
      }
      this.getDataLevel();
    }

    const campuses = _.chain(this.campusList)
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
    this.campusList = _.uniqBy(campuses, '_id');
    this.campusList = this.campusList.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }
  selectCampusFilter() {
    const form = this.campusFilter.value;
    if (form && form.length) {
      this.campusFilter.patchValue(form);
    } else {
      this.campusFilter.patchValue(null);
    }
    this.getDataLevel();
  }

  getDataLevel() {
    this.levels = [];
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
      this.campusFilter.value.length &&
      this.schoolsFilter.value
    ) {
      if (sCampus && sCampus.length && !sCampus.includes('AllF')) {
        this.currentUser.app_data.school_package.forEach((element) => {
          if (element && element.school && element.school._id && (schools.includes(element.school._id) || schools.includes('AllF'))) {
            const sLevelList = this.campusList.filter((list) => {
              return sCampus.includes(list._id);
            });
            sLevelList.forEach((lev) => {
              if (lev && lev.levels && lev.levels.length) {
                this.levels = _.concat(this.levels, lev.levels);
              }
            });
          }
        });
      } else if (sCampus && sCampus.length && sCampus.includes('AllF') && this.campusList && this.campusList.length) {
        this.campusList.forEach((lev) => {
          if (lev && lev.levels && lev.levels.length) {
            this.levels = _.concat(this.levels, lev.levels);
          }
        });
      }
    } else {
      if (sCampus && sCampus.length && !sCampus.includes('AllF')) {
        sCampus.forEach((element) => {
          const sName = this.campusList.find((list) => list._id === element);
          this.campusName = this.campusName ? this.campusName + ',' + sName.name : sName.name;
        });

        const sLevelList = this.campusList.filter((list) => {
          return sCampus.includes(list._id);
        });
        sLevelList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
              this.levelListBackup = this.levels;
            });
          }
        });
      } else if (this.campusList && this.campusList.length && this.campusFilter.value && this.campusFilter.value.includes('AllF')) {
        this.campusList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
            });
          }
        });
      }
    }
    this.levels = _.uniqBy(this.levels, 'name');
    this.levels = this.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }

  selectLevelFilter() {
    const form = this.levelFilter.value;
    if (form && form.length) {
      this.levelFilter.patchValue(form);
    } else {
      this.levelFilter.patchValue(null);
    }
    this.getDataByLevel();
  }

  getDataByLevel() {
    this.levelName = '';

    if (this.levelFilter.value && !this.levelFilter.value.includes('AllF')) {
      const sLevel = this.levelFilter.value;

      sLevel.forEach((element) => {
        const sName = this.levels.find((list) => list._id === element);
        this.levelName = this.levelName ? this.levelName + ',' + sName.name : sName.name;
      });
    }
    this.levels = _.uniqBy(this.levels, 'name');
    this.levels = this.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
    this.getAllSector();
  }
  getAllSector() {
    let allSchool = [];
    let allCampus = [];
    let allLevel = [];

    this.sectorList = [];
    this.specialityList = [];
    this.sectorFilter.setValue(null);
    this.specialityFilter.setValue(null);
    this.superFilter.sectors = null;
    this.superFilter.specialities = null;

    if (this.schoolsFilter.value?.length && this.schoolsFilter.value.includes('AllF') && this.listObjective?.length) {
      allSchool = this.listObjective.map((data) => data._id);
    }
    if (this.campusFilter.value?.length && this.campusList?.length && this.campusFilter.value.includes('AllF')) {
      allCampus = this.campusList.map((data) => data._id);
    }
    if (this.levelFilter.value?.length && this.levelFilter.value.includes('AllF') && this.levels?.length) {
      allLevel = this.levels.map((data) => data._id);
    }
    const filter = {
      scholar_season_id: this.scholarFilter.value && !this.scholarFilter.value?.includes('All') ? this.scholarFilter.value : null,
      candidate_school_ids: allSchool?.length ? allSchool : this.schoolsFilter.value?.length ? this.schoolsFilter.value : null,
      campuses: allCampus?.length ? allCampus : this.campusFilter?.value?.length ? this.campusFilter.value : null,
      levels: allLevel?.length ? allLevel : this.levelFilter.value?.length ? this.levelFilter.value : null,
    };
    if (this.levelFilter.value?.length) {
      this.subs.sink = this.financeService.GetAllSectorsDropdown(filter).subscribe(
        (resp) => {
          if (resp?.length) {
            this.sectorList = _.cloneDeep(resp);
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
    }
  }
  selectSectorFilter() {
    const form = this.sectorFilter.value;
    if (form && form.length) {
      this.sectorFilter.patchValue(form);
    } else {
      this.sectorFilter.patchValue(null);
    }
    this.getAllSpeciality();
  }
  getAllSpeciality() {
    let allSchool = [];
    let allCampus = [];
    let allLevel = [];
    let allSector = [];

    this.specialityList = [];
    this.specialityFilter.setValue(null);
    this.superFilter.specialities = null;

    if (this.schoolsFilter.value?.length && this.schoolsFilter.value.includes('AllF') && this.listObjective?.length) {
      allSchool = this.listObjective.map((data) => data._id);
    }
    if (this.campusFilter.value?.length && this.campusList?.length && this.campusFilter.value.includes('AllF')) {
      allCampus = this.campusList.map((data) => data._id);
    }
    if (this.levelFilter.value?.length && this.levelFilter.value.includes('AllF') && this.levels?.length) {
      allLevel = this.levels.map((data) => data._id);
    }
    if (this.sectorFilter?.value?.length && this.sectorList?.length) {
      allSector = this.sectorList.map((sector) => sector._id);
    }
    const filter = {
      scholar_season_id: this.scholarFilter.value && !this.scholarFilter.value?.includes('All') ? this.scholarFilter.value : null,
      candidate_school_ids: allSchool?.length ? allSchool : this.schoolsFilter.value?.length ? this.schoolsFilter.value : null,
      campuses: allCampus?.length ? allCampus : this.campusFilter.value?.length ? this.campusFilter.value : null,
      levels: allLevel?.length ? allLevel : this.levelFilter.value?.length ? this.levelFilter.value : null,
      sectors: allSector && allSector.length ? allSector : this.sectorFilter?.value?.lenth ? this.sectorFilter.value : null,
    };
    if (this.sectorFilter?.value?.length) {
      this.subs.sink = this.candidatesService.GetAllSpecializationsByScholar(filter).subscribe(
        (resp) => {
          if (resp?.length) {
            this.specialityList = _.cloneDeep(resp);
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
    }
  }
  selectSpecialityFilter() {
    const form = this.specialityFilter.value;
    if (form && form.length) {
      this.specialityFilter.patchValue(form);
    } else {
      this.specialityFilter.patchValue(null);
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

  getDataTags() {
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService.getAllTags(true, 'admission_fc', userTypesList, this.candidate_admission_statuses).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.tags = resp;
          this.tags = this.tags.sort((a, b) => {
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

  transformDateDue(data) {
    if (data && data.due_date && data.due_time) {
      const date = data.due_date;
      const time = data.due_time;

      const datee = this.parseUtcToLocalPipe.transformDate(date, time);
      return datee;
    } else {
      return '';
    }
  }

  transformRegistrationDate(data) {
    if (
      data &&
      data.registered_at &&
      data.registered_at.date &&
      data.registered_at.time &&
      data.candidate_admission_status === 'registered'
    ) {
      const date = data.registered_at.date;
      const time = data.registered_at.time;

      const datee = this.parseUtcToLocalPipe.transformDate(date, time);
      return datee;
    } else {
      return '';
    }
  }

  sendMultipleEmail() {
    if (this.selection.selected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      let data;
      // Mapping data for get only email candidate and the support financial
      if (this.isCheckedAll) {
        data = this.allCandidateData;
      } else {
        data = this.dataSelected;
      }
      if (data) {
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

        // console.log('_data selected', data);
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
                this.resetCandidateKeepFilter();
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
                this.resetCandidateKeepFilter();
              }
              this.sendMultipleEmailComponent = null;
            });
          }
        });
      }
    }
  }

  triggerAnnouncementMultiple() {
    this.isRegistrationProfileDone = true;
    this.isDifferentAnnoucement = false;
    const notDoing1stcall = this.dataSelected.filter(
      (listData) => listData.announcement_call === 'not_done' || !listData.registration_profile,
    );
    let doneRegistrationProfle = this.dataSelected.filter((listData) => listData.registration_profile);
    doneRegistrationProfle = _.uniqBy(doneRegistrationProfle, '_id');
    // console.log(notDoing1stcall);
    if (notDoing1stcall.length > 0) {
      this.isHasRegistrationProfileandCallNotDone = true;
    } else {
      this.isHasRegistrationProfileandCallNotDone = false;
    }
    const candidateAnnoun = this.dataSelected.filter((list) => {
      if (list.announcement_email.sent_date || list.announcement_email.sent_time) {
        return list;
      }
    });
    if (this.dataSelected.length > 0) {
      const notDoing1stcalls = this.dataSelected.filter((listData) => listData.registration_profile);
      if (notDoing1stcalls.length > 0) {
        this.isRegistrationProfileDone = true;
      } else {
        this.isRegistrationProfileDone = false;
      }
    }
    if (candidateAnnoun.length > 0) {
      this.isDifferentAnnoucement = true;
    } else {
      this.isDifferentAnnoucement = false;
    }
    if (
      ((this.selectType === 'one' && this.dataSelected.length) || this.selectType === 'all' || !this.selectType) &&
      !this.isWasSelectAll
    ) {
      if (!this.isRegistrationProfileDone) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Followup_S12s.Title'),
          html: this.translate.instant('Followup_S12s.Text'),
          confirmButtonText: this.translate.instant('Followup_S12s.Button'),
        });
      } else if (this.selection.selected.length < 1) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Followup_S8.Title'),
          html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
          confirmButtonText: this.translate.instant('Followup_S8.Button'),
        });
      } else if (this.isDifferentAnnoucement) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Followup_S11.Title'),
          html: this.translate.instant('Followup_S11.Text'),
          confirmButtonText: this.translate.instant('Followup_S11.Button'),
        });
      } else if (this.isRegistrationProfileDone) {
        let candidatess = '';
        const usersId = [];
        for (const entity of doneRegistrationProfle) {
          candidatess = candidatess
            ? candidatess +
              ', ' +
              (entity
                ? (entity.civility !== 'neutral' ? this.translate.instant(entity.civility) + ' ' : '') +
                  entity.first_name +
                  ' ' +
                  entity.last_name
                : '')
            : entity
            ? (entity.civility !== 'neutral' ? this.translate.instant(entity.civility) + ' ' : '') +
              entity.first_name +
              ' ' +
              entity.last_name
            : '';
          usersId.push(entity._id);
        }

        // *************** Check if all data is valid
        const isAllValid = usersId.length === this.dataSelected.length;

        this.sendNotifN1Multiple(usersId, candidatess, isAllValid);
      }
    } else {
      this.firstEmailAllCandidate(this.dataSelected);
    }
  }

  sendNotifN1Multiple(selectedUser, candidatess, isAllValid) {
    const selectedText = isAllValid ? 'CANDIDAT_S1.TEXT_ALL_VALID' : 'CANDIDAT_S1.TEXT_NOT_ALL_VALID';

    Swal.fire({
      type: 'info',
      title: this.translate.instant('CANDIDAT_S1.TITLE'),
      html: this.translate.instant(selectedText, {
        candidateName: candidatess,
      }),
      showCancelButton: true,
      allowEscapeKey: true,
      allowOutsideClick: false,
      reverseButtons: true,
      confirmButtonText: this.translate.instant('CANDIDAT_S1.BUTTON_1'),
      cancelButtonText: this.translate.instant('CANDIDAT_S1.BUTTON_2'),
    }).then((res) => {
      if (res.value) {
        this.isLoading = true;
        // const userId = [selectedUser._id];
        // // console.log(userId);
        this.subs.sink = this.candidatesService.SendRegistrationN1(selectedUser).subscribe(
          (resp) => {
            if (resp) {
              this.isLoading = false;
              // console.log(resp);
              Swal.fire({
                type: 'success',
                title: this.translate.instant('CANDIDAT_S2.TITLE'),
                html: this.translate.instant('CANDIDAT_S2.TEXT', {
                  candidateName: candidatess,
                }),
                allowOutsideClick: false,
                confirmButtonText: this.translate.instant('CANDIDAT_S2.BUTTON'),
              }).then(() => {
                this.resetCandidateKeepFilter();
              });
            }
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
            this.isLoading = false;
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
            // console.log(err);
          },
        );
      }
    });
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

  csvDownloadAdmission() {
    if (this.selection.selected.length < 1 && !this.isCheckedAll) {
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
    this.filteredValues.type_of_formation_name = 'continuous';
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const filter = this.cleanFilterDataDownload();
    const search = this.cleanSearchingDataDownload();
    let filtered;
    console.log('filter', filter);
    console.log('search', search);
    let admissionStatus;
    let admissionStatusMap;
    if (this.filteredValues.candidate_admission_status) {
      admissionStatusMap = `"${this.filteredValues.candidate_admission_status}"`;
      admissionStatus = `"candidate_admission_status":` + admissionStatusMap;
    } else {
      admissionStatusMap = this.filteredValues.candidate_admission_statuses.map((res) => `"` + res + `"`);
      admissionStatus = `"candidate_admission_statuses":` + '[' + admissionStatusMap.toString() + ']';
    }
    if ((this.dataSelected.length && !this.isCheckedAll) || (this.dataUnselectUser && this.dataUnselectUser.length)) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      const billing = `"candidate_ids":` + '[' + mappedUserId.toString() + ']';
      if (filter.length > 9) {
        filtered = filter.slice(0, 8) + admissionStatus + ',' + billing + ',' + filter.slice(8);
      } else {
        filtered = filter.slice(0, 8) + admissionStatus + ',' + billing + filter.slice(8);
      }
    } else if (this.isCheckedAll) {
      filtered = filter.slice(0, 8) + admissionStatus + ',' + filter.slice(8);
    }
    // // console.log('_fil', filtered);

    const userTypesList =
      this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id.map((res) => `"` + res + `"`) : [];
    const importStudentTemlate = `downloadFCCandidateData/`;

    const sorting = this.sortingForExport();
    console.log('uat 389 sorting', sorting);
    let fullURL;
    if (search) {
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
        search +
        '&user_type_ids=[' +
        userTypesList +
        ']' +
        '&' +
        sorting +
        '&' +
        `user_type_id="${this.currentUserTypeId}"`;
    } else {
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
        '&user_type_ids=[' +
        userTypesList +
        ']' +
        '&' +
        sorting +
        '&' +
        `user_type_id="${this.currentUserTypeId}"`;
    }

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
    console.log('fullURL', fullURL);
  }
  sortingForExport() {
    const sortData = _.cloneDeep(this.sortValue);
    let data = '';
    if (this.sortValue) {
      Object.keys(sortData).forEach((key) => {
        if (sortData[key]) {
          data = data ? data + ',' + `"${key}":"${sortData[key]}"` : data + `"${key}":"${sortData[key]}"`;
        }
      });
    }
    return 'sorting={' + data + '}';
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

  checkIfDoesntHaveAnyDP(element) {
    if (
      (element?.registration_profile &&
        element?.registration_profile?.is_down_payment &&
        element?.registration_profile?.is_down_payment === 'no') ||
      !element?.billing_id?.deposit
    ) {
      return true;
    } else {
      return false;
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
    if (element.payment && element.payment === 'not_authorized') {
      return 'magenta';
    }
    if (element.payment && element.payment === 'chargeback') {
      return 'purple';
    } else if (
      (element?.billing_id?.deposit >= 0 &&
        element?.billing_id?.deposit_pay_amount &&
        element?.billing_id?.deposit_pay_amount >= element?.billing_id?.deposit) ||
      element?.billing_id?.deposit_status === 'paid'
    ) {
      return 'green';
    } else if (
      (element?.billing_id?.deposit >= 0 &&
        element?.billing_id?.deposit_pay_amount &&
        element?.billing_id?.deposit_pay_amount < element?.billing_id?.deposit) ||
      element?.billing_id?.deposit_status === 'partially_paid'
    ) {
      return 'orange';
    } else if (!element.billing_id.deposit) {
      return 'red';
    } else {
      return 'red';
    }
  }

  checkDpIsNotPaid(element) {
    let isNotPaid = false;
    if (!element?.billing_id?.deposit && !element?.billing_id?.deposit_pay_amount) {
      isNotPaid = true;
    } else {
      if (!element?.payment_method && !element?.billing_id?.deposit_pay_amount) {
        isNotPaid = true;
      } else if (
        (element?.payment_method === 'check' || element?.payment_method === 'transfer') &&
        !element?.billing_id?.deposit_pay_amount
      ) {
        isNotPaid = true;
      } else {
        isNotPaid = false;
      }
    }
    return isNotPaid;
  }

  checkDpIsPaidPartial(element) {
    let isPaid = false;
    if (!element?.billing_id?.deposit && !element?.billing_id?.deposit_pay_amount) {
      isPaid = false;
    } else {
      if (!element?.payment_method && !element?.billing_id?.deposit_pay_amount) {
        isPaid = false;
      } else if (
        (element?.payment_method && element?.payment_method !== 'check' && element?.payment_method !== 'transfer') ||
        element?.billing_id?.deposit_pay_amount
      ) {
        isPaid = true;
      } else {
        isPaid = false;
      }
    }
    return isPaid;
  }

  renderTooltipStatusDP(element) {
    if (element.payment === 'not_authorized') {
      return this.translate.instant('Rejecteds');
    }
    if (element.payment === 'chargeback') {
      return this.translate.instant('Chargeback');
    } else if (
      (element?.billing_id &&
        element?.billing_id?.deposit >= 0 &&
        element?.billing_id?.deposit_pay_amount &&
        element?.billing_id?.deposit_pay_amount >= element?.billing_id?.deposit) ||
      element?.billing_id?.deposit_status === 'paid'
    ) {
      return this.translate.instant('Paid');
    } else if (
      (element?.billing_id &&
        element?.billing_id?.deposit >= 0 &&
        element?.billing_id?.deposit_pay_amount &&
        element?.billing_id?.deposit_pay_amount < element?.billing_id?.deposit) ||
      element?.billing_id?.deposit_status === 'partially_paid'
    ) {
      return this.translate.instant('Partially paid');
    } else if (element?.billing_id && !element?.billing_id?.deposit) {
      return this.translate.instant('Not paid');
    } else {
      return this.translate.instant('Not paid');
    }
  }

  triggerCallDoneMultiple() {
    const candidateIds = this.dataSelected.map((resp) => resp._id);
    const notDoing1stcall = this.dataSelected.filter(
      (listData) => listData?.announcement_call === 'done' && listData?.registration_profile,
    );
    if (notDoing1stcall.length > 0) {
      this.isHasRegistrationProfile = true;
    } else {
      this.isHasRegistrationProfile = false;
    }

    const notDoing1stcalls = this.dataSelected.filter(
      (listData) => listData.announcement_call === 'not_done' && !listData.registration_profile,
    );
    if (notDoing1stcalls.length > 0) {
      this.isNoRegistrationProfileandCallNotDone = true;
    } else {
      this.isNoRegistrationProfileandCallNotDone = false;
    }
    if (
      ((this.selectType === 'one' && this.dataSelected.length) || this.selectType === 'all' || !this.selectType) &&
      !this.isWasSelectAll
    ) {
      if (this.selection.selected.length < 1) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Followup_S8.Title'),
          html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
          confirmButtonText: this.translate.instant('Followup_S8.Button'),
        });
      } else if (this.isNoRegistrationProfileandCallNotDone) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Followup_S14.Title'),
          html: this.translate.instant('Followup_S14.Text'),
          confirmButtonText: this.translate.instant('Followup_S14.Button'),
        });
      } else {
        this.subs.sink = this.financeService.UpdateCandidateAnnouncementCall(candidateIds).subscribe(
          (res) => {
            if (res) {
              if (this.isHasRegistrationProfile) {
                // call api when one of selected candidate doesnt have a registration profile or call was done will return this swal
                Swal.fire({
                  type: 'warning',
                  title: this.translate.instant('Followup_S1.TITLE'),
                  html: this.translate.instant('Followup_S1.TEXT'),
                  confirmButtonText: this.translate.instant('Followup_S1.BUTTON1'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.resetCandidateKeepFilter();
                });
              } else {
                // call api when selected candidate already has a registration profile but not doing first call
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('CANDIDAT_INCOMING_S2.TITLE'),
                  html: this.translate.instant('CANDIDAT_INCOMING_S2.TEXT'),
                  confirmButtonText: this.translate.instant('CANDIDAT_INCOMING_S2.BUTTON'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.resetCandidateKeepFilter();
                });
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
    } else {
      this.firstCallAllCandidate(this.dataSelected);
    }
  }

  clearSelectIfFilter() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
  }

  getAllProfileRate() {
    this.subs.sink = this.financeService.GetListProfileRatesForSameData().subscribe(
      (res) => {
        if (res) {
          this.listRegistrationProfile = res;
        }
      },
      (err) => {
        // Record error log
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

  setInitialTableColumn() {
    this.displayedColumns = [
      'select',
      'typeFormation',
      'studentNumber',
      'name',
      'nationality',
      'entryWay',
      'studentStatus',
      'profileRate',
      'announcementCall',
      'announcementEmail',
      'downPayment',
      'financement',
      'registrationDate',
      'admissionDocument',
      'trial_date',
      'devMember',
      'fcMember',
      'crm',
      'action',
    ];
    this.filterColumns = [
      'selectFilter',
      'typeFormationFilter',
      'studentNumberFilter',
      'lastNameFilter',
      'nationalityFilter',
      'entryWayFilter',
      'studentStatusFilter',
      'profileRateFilter',
      'announcementCallFilter',
      'announcementEmailFilter',
      'downPaymentFilter',
      'fcFilter',
      'registrationDateFilter',
      'admissionDocumentFilter',
      'trialFilter',
      'devMemberFilter',
      'fcMemberFilter',
      'crmFilter',
      'actionFilter',
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
                candidateData && candidateData?.admission_process_id && candidateData?.admission_process_id?.steps
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
          if (element.step_type_selected === 'mandatory') {
            this.steps.controls[element.step].setValue(element.status);
          }
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
      if (this.filteredValues.student_admission_steps && this.filteredValues.student_admission_steps.length > 0) {
        this.filteredValues.student_admission_steps.forEach((element) => {
          if (element.step_type_selected === 'option') {
            this.optionalSteps.controls[element.step].setValue(element.status);
          }
        });
      }
    }

    this.displayedColumns = _.uniqBy(this.displayedColumns);
    this.filterColumns = _.uniqBy(this.filterColumns);

    this.stepColumn = stepColumns;
    this.optionalStepColumns = optionalStepColumns;

    if (this.isStepsFiltered === true) {
      this.steps = this.tempSteps;
      this.tempOptionalSteps = this.optionalSteps;
    }

    this.subs.sink = this.ngZone.onMicrotaskEmpty.pipe(bufferCount(50), take(3)).subscribe((resp) => {
      this.table.updateStickyColumnStyles();
    });
    this.filterBreadcrumbFormat();
  }

  sendAnnoucment(element, type?) {
    let data = [];
    if (element && element._id) {
      data = [element];
    } else {
      data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
      data = _.uniqBy(data, '_id');
    }
    const notDoing1stcall = data.filter((listData) => !listData.registration_profile);
    if (notDoing1stcall.length > 0) {
      this.isHasRegistrationProfileandCallNotDone = true;
    } else {
      this.isHasRegistrationProfileandCallNotDone = false;
    }
    const candidateAnnoun = data.filter((list) => {
      if (list.announcement_email.sent_date || list.announcement_email.sent_time) {
        return list;
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
    } else if (this.selection.selected.length < 1 && type === 'many') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else if (this.isDifferentAnnoucement) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S11.Title'),
        html: this.translate.instant('Followup_S11.Text'),
        confirmButtonText: this.translate.instant('Followup_S11.Button'),
      });
    } else {
      console.log(data);
      if (data && data.length) {
        const candidateIds = data.map((list) => list._id);
        const filter = {
          candidates_id: candidateIds,
          template_type: 'student_admission',
        };
        const candidateAdmissionIds = data.map((res) => res?.admission_process_id?._id);
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
                    isFc: true,
                    isReadmission: false,
                  },
                });
                this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
                  if (result) {
                    this.resetCandidateKeepFilter();
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
                    isFc: true,
                    isReadmission: false,
                  },
                });
                this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
                  if (result) {
                    this.resetCandidateKeepFilter();
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
                  isFc: true,
                  isReadmission: false,
                },
              });
              this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
                if (result) {
                  this.resetCandidateKeepFilter();
                }
                this.sendEmailValidatorDialogComponent = null;
              });
            }
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
            this.isLoading = false;
            console.log('Error :', err);

            this.sendEmailValidatorDialogComponent = this.dialog.open(SendEmailValidatorDialogComponent, {
              width: '800px',
              minHeight: '300px',
              panelClass: 'no-padding',
              disableClose: true,
              data: {
                data: data,
                isNeedValidator: false,
                isResendMail: false,
                isFc: true,
                isReadmission: false,
              },
            });
            this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
              if (result) {
                this.resetCandidateKeepFilter();
              }
              this.sendEmailValidatorDialogComponent = null;
            });
          },
        );
      }
    }
  }

  triggerAnnoucment(data) {
    let candidatess = '';
    const usersId = [];
    for (const entity of data) {
      candidatess = candidatess
        ? candidatess +
          ', ' +
          (entity
            ? (entity.civility !== 'neutral' ? this.translate.instant(entity.civility) + ' ' : '') +
              entity.first_name +
              ' ' +
              entity.last_name
            : '')
        : entity
        ? (entity.civility !== 'neutral' ? this.translate.instant(entity.civility) + ' ' : '') + entity.first_name + ' ' + entity.last_name
        : '';
      usersId.push(entity._id);
    }
    Swal.fire({
      type: 'info',
      title: this.translate.instant('CANDIDAT_S1.TITLE'),
      html: this.translate.instant('CANDIDAT_S1.TEXT_ALL_VALID', {
        candidateName: candidatess,
      }),
      showCancelButton: true,
      allowEscapeKey: true,
      allowOutsideClick: false,
      reverseButtons: true,
      confirmButtonText: this.translate.instant('CANDIDAT_S1.BUTTON_1'),
      cancelButtonText: this.translate.instant('CANDIDAT_S1.BUTTON_2'),
    }).then((res) => {
      if (res.value) {
        this.subs.sink = this.candidatesService.SendRegistrationN1(usersId).subscribe(
          (resp) => {
            if (resp) {
              this.isLoading = false;
              Swal.fire({
                type: 'success',
                title: this.translate.instant('CANDIDAT_S2.TITLE'),
                html: this.translate.instant('CANDIDAT_S2.TEXT', {
                  candidateName: candidatess,
                }),
                allowOutsideClick: false,
                confirmButtonText: this.translate.instant('CANDIDAT_S2.BUTTON'),
              }).then(() => {
                this.resetCandidateKeepFilter();
              });
            }
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
            this.isLoading = false;
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
    });
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
          step_type_selected: `option`,
        };
        steps.push(step);
      }
    });

    console.log('step filtered', steps);
    let a: any;
    if (steps.length > 0) {
      // if (this.filteredValues.announcement_call !== this.announcementCallFilter.value) {
      //   if(this.announcementCallFilter.value?.length) {
      //     this.filteredValues.announcement_call = this.announcementCallFilter.value;
      //   } else {
      //     this.announcementCallFilter.setValue(null);
      //     this.filteredValues.announcement_call = null;
      //   }
      //   if (!this.isReset) {
      //     this.paginator.pageIndex = 0;
      //     this.getCandidatesData('announcementCallFilter');
      //   }
      // }
      this.filteredValues.student_admission_steps = steps;
      a = this.steps;
      if (JSON.stringify(this.tempDataFilter.steps) !== JSON.stringify(this.filteredValues.student_admission_steps)) {
        this.getCandidatesData('steps filter');
      }
      this.tempDataFilter.steps = steps;
    } else {
      this.filteredValues.student_admission_steps = null;
      a = this.steps;
      if (this.tempDataFilter.steps?.length) {
        this.getCandidatesData('steps filter');
      }
      this.tempDataFilter.steps = [];
    }
    this.steps = a;
  }

  selectSigle() {
    if (this.filteredValues.sigle !== this.sigleFilter.value) {
      if (this.sigleFilter.value?.length) {
        this.filteredValues.sigle = this.sigleFilter.value;
      } else {
        this.sigleFilter.setValue(null);
        this.filteredValues.sigle = null;
      }
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('Sigle');
      }
    }
  }

  selectNationality() {
    if (this.filteredValues.nationality !== this.nationalityFilter.value) {
      if (this.nationalityFilter.value?.length) {
        this.filteredValues.nationality = this.nationalityFilter.value;
      } else {
        this.nationalityFilter.setValue(null);
        this.filteredValues.nationality = null;
      }
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('nationalityFilter');
      }
    }
  }

  selectAnnouncementCall() {
    if (this.filteredValues.announcement_call !== this.announcementCallFilter.value) {
      if (this.announcementCallFilter.value?.length) {
        this.filteredValues.announcement_call = this.announcementCallFilter.value;
      } else {
        this.announcementCallFilter.setValue(null);
        this.filteredValues.announcement_call = null;
      }
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('announcementCallFilter');
      }
    }
  }

  selectAnnouncementEmail() {
    if (this.filteredValues.registration_email_date !== this.announcementEmailFilter.value) {
      if (this.announcementEmailFilter.value?.length) {
        this.filteredValues.registration_email_date = this.announcementEmailFilter.value;
      } else {
        this.announcementEmailFilter.setValue(null);
        this.filteredValues.registration_email_date = null;
      }
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('registration_email_date');
      }
    }
  }

  selectFinancement() {
    if (this.filteredValues.financement !== this.financementFilter.value) {
      if (this.financementFilter.value?.length) {
        this.filteredValues.financement = this.financementFilter.value;
      } else {
        this.financementFilter.setValue(null);
        this.filteredValues.financement = null;
      }
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('financementFilter');
      }
    }
  }

  setDownPaymentFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.dataUnselectUser = [];
    const filteredPayment = this.paymentFilter?.value?.filter((res) => res === 'not_authorized' || res === 'pending');
    const filteredDeposit = this.paymentFilter?.value?.filter((res) => res !== 'not_authorized' && res !== 'pending');

    const isSame = JSON.stringify(this.tempDataFilter.downPayments) === JSON.stringify(this.paymentFilter.value);
    const filterValues = this.paymentFilter.value ? this.paymentFilter.value : [];

    // For filtering payments
    if (isSame) {
      return;
    } else if (this.paymentFilter.value?.length && filteredPayment?.length) {
      if (filteredPayment?.length) {
        this.filteredValues.payments = filteredPayment;
        this.filteredValues.is_deposit_paids = filteredDeposit?.length ? filteredDeposit : null;
        this.tempDataFilter.downPayments = this.paymentFilter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('paymentFilter');
        }
      } else {
        if (this.tempDataFilter.downPayments?.length && this.paymentFilter.value?.length && !filteredPayment?.length) {
          this.filteredValues.payments = null;
          this.tempDataFilter.downPayments = this.paymentFilter.value;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getCandidatesData('paymentFilter');
          }
        }
      }
    }

    // For filtering deposit
    if (isSame) {
      return;
    } else if (this.paymentFilter.value?.length && filteredDeposit?.length) {
      if (filteredDeposit?.length) {
        this.filteredValues.is_deposit_paids = filteredDeposit;
        this.filteredValues.payments = filteredPayment?.length ? filteredPayment : null;
        this.tempDataFilter.downPayments = this.paymentFilter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('paymentFilter');
        }
      } else {
        if (this.tempDataFilter.downPayments?.length && this.paymentFilter.value?.length && !filteredDeposit?.length) {
          this.filteredValues.is_deposit_paids = null;
          this.tempDataFilter.downPayments = this.paymentFilter.value;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getCandidatesData('paymentFilter');
          }
        }
      }
    }

    if (!this.paymentFilter.value?.length && !filteredDeposit?.length && !filteredPayment?.length) {
      this.filteredValues.is_deposit_paids = null;
      this.filteredValues.payments = null;
      this.tempDataFilter.downPayments = null;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('paymentFilter');
      }
    }
  }

  setStatusFilter(status?: string) {
    // check if previously selected then select again, if yes then reset dropdown before filtering again
    // console.log('_stat', status, this.studentStatusFilter.value);
    if (this.filteredValues.candidate_admission_status !== this.studentStatusFilter.value) {
      const previousFilter = this.studentStatusFilter.value;
      if ((status && status === 'All') || (previousFilter && previousFilter.length === 0)) {
        this.clearSelectIfFilter();
        if (previousFilter && previousFilter.length > 0) {
          const all = ['All'];
          this.studentStatusFilter.setValue(all);
        }
        this.filteredValues.candidate_admission_status = null;
        this.filteredValues.candidate_admission_statuses = [
          'admission_in_progress',
          'engaged',
          'registered',
          'resigned',
          'resigned_after_engaged',
          'resigned_after_registered',
          'bill_validated',
          'financement_validated',
          'mission_card_validated',
          'in_scholarship',
          'report_inscription',
          'resignation_missing_prerequisites',
          'no_show',
          'resign_after_school_begins',
        ];
        this.paginator.pageIndex = 0;
        this.getCandidatesData('setStatusFIlter all');
      } else {
        const temp = _.cloneDeep(this.studentStatusFilter.value);
        const selectedStatus = [];
        const filteredTemp = temp.filter((res) => {
          if (res !== 'All') {
            selectedStatus.push(res);
          }
        });
        this.studentStatusFilter.setValue(selectedStatus);
        this.clearSelectIfFilter();
        this.filteredValues.candidate_admission_status = null;
        this.filteredValues.candidate_admission_statuses = this.studentStatusFilter.value;
        this.paginator.pageIndex = 0;
        this.getCandidatesData('setStatusFIlter selected');
      }
    }
  }

  setStudentStatusFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.status) === JSON.stringify(this.studentStatusFilter.value);
    if (isSame) {
      return;
    } else if (this.studentStatusFilter.value?.length) {
      this.filteredValues.candidate_admission_statuses = this.studentStatusFilter.value;
      this.tempDataFilter.status = this.studentStatusFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('studentStatusFilter');
      }
    } else {
      if (this.tempDataFilter.status?.length && !this.studentStatusFilter.value?.length) {
        this.filteredValues.candidate_admission_statuses = [
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
          'no_show',
          'resign_after_school_begins',
          // 'deactivated',
        ];
        this.tempDataFilter.status = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('studentStatusFilter');
        }
      } else {
        return;
      }
    }
  }

  intakeSelected() {
    if (this.filteredValues.intake_channel !== this.entryWayFilter.value) {
      if (this.entryWayFilter?.value?.length) {
        this.filteredValues.intake_channel = this.entryWayFilter.value;
      } else {
        this.entryWayFilter.setValue(null);
        this.filteredValues.intake_channel = null;
      }
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('setIntakeSelected');
      }
    }
  }
  // ************************ Below is function for all button above table candidate FI
  getAllIdForCheckbox(pageNumber) {
    if (this.buttonClicked === 'export') {
      if (this.isCheckedAll) {
        if (this.dataUnselectUser.length < 1) {
          this.csvDownloadAdmission();
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
            .getAllFcIdForCheckbox(pagination, this.sortValue, filter, this.searching, userTypesList)
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
                    this.allCandidateData = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                    this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                    console.log('getAllIdForCheckbox', this.dataSelected);
                    if (this.dataSelected && this.dataSelected.length) {
                      this.csvDownloadAdmission();
                    }
                  }
                }
              },
              (error) => {
                // Record error log
                this.authService.postErrorLog(error);
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
        this.csvDownloadAdmission();
      }
    }
  }

  getDataCrmOk(pageNumber) {
    if (this.buttonClicked === 'crm') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allCRMForCheckbox = [];
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
        this.subs.sink = this.candidatesService.getFCDataCrmOk(pagination, this.sortValue, filter, this.searching, userTypesList).subscribe(
          (students: any) => {
            if (students && students.length) {
              const resp = _.cloneDeep(students);
              this.allCRMForCheckbox = _.concat(this.allCRMForCheckbox, resp);
              const page = pageNumber + 1;
              this.getDataCrmOk(page);
            } else {
              this.isLoading = false;
              if (this.isCheckedAll && this.allCRMForCheckbox && this.allCRMForCheckbox.length) {
                this.dataSelected = this.allCRMForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                this.allCandidateData = this.allCRMForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                console.log('getDataCrmOk', this.dataSelected);
                if (this.dataSelected && this.dataSelected.length) {
                  this.crmOk();
                }
              }
            }
          },
          (error) => {
            // Record error log
            this.authService.postErrorLog(error);
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
      } else {
        this.crmOk();
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
          .getFCDataRegisProfil(pagination, this.sortValue, filter, this.searching, userTypesList)
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
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length) {
                    this.openAssignRateProfile('', 'button');
                  }
                }
              }
            },
            (error) => {
              // Record error log
              this.authService.postErrorLog(error);
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
      } else {
        this.openAssignRateProfile(this.dataSelected, 'button');
      }
    }
  }
  getDataForCall(pageNumber) {
    if (this.buttonClicked === 'call') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allCallForCheckbox = [];
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
          .getFCDataForCall(pagination, this.sortValue, filter, this.searching, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allCallForCheckbox = _.concat(this.allCallForCheckbox, resp);
                const page = pageNumber + 1;
                this.getDataForCall(page);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allCallForCheckbox && this.allCallForCheckbox.length) {
                  this.dataSelected = this.allCallForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.allCandidateData = this.allCallForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length) {
                    this.triggerCallDoneMultiple();
                  }
                }
              }
            },
            (error) => {
              // Record error log
              this.authService.postErrorLog(error);
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
      } else {
        this.triggerCallDoneMultiple();
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
          .getFCDataForFirstMail(pagination, this.sortValue, filter, this.searching, userTypesList)
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
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length) {
                    this.sendAnnoucment('', 'many');
                  }
                }
              }
            },
            (error) => {
              // Record error log
              this.authService.postErrorLog(error);
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
      } else {
        this.sendAnnoucment('', 'many');
      }
    }
  }
  getFCDataForDevMember(pageNumber) {
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
          .getFCDataForDevMember(pagination, this.sortValue, filter, this.searching, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allMemberForCheckbox = _.concat(this.allMemberForCheckbox, resp);
                const page = pageNumber + 1;
                this.getFCDataForDevMember(page);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allMemberForCheckbox && this.allMemberForCheckbox.length) {
                  this.dataSelected = this.allMemberForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.allCandidateData = this.allMemberForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length) {
                    this.openAssignMemberFc('', 'button');
                  }
                }
              }
            },
            (error) => {
              // Record error log
              this.authService.postErrorLog(error);
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
      } else {
        this.openAssignMemberFc(this.dataSelected, 'button');
      }
    }
  }

  getFCDataForSendMail(pageNumber) {
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
          .getFCDataForSendMail(pagination, this.sortValue, filter, this.searching, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allEmailForCheckbox = _.concat(this.allEmailForCheckbox, resp);
                const page = pageNumber + 1;
                this.getFCDataForSendMail(page);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allEmailForCheckbox && this.allEmailForCheckbox.length) {
                  this.dataSelected = this.allEmailForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.allCandidateData = this.allEmailForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length) {
                    this.sendMultipleEmail();
                  }
                }
              }
            },
            (error) => {
              // Record error log
              this.authService.postErrorLog(error);
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
          this.getFCDataForSendMail(0);
        }, 500);
        break;
      case 'call':
        setTimeout(() => {
          this.getDataForCall(0);
        }, 500);
        break;
      case 'member':
        setTimeout(() => {
          this.getFCDataForDevMember(0);
        }, 500);
        break;
      case 'crm':
        setTimeout(() => {
          this.getDataCrmOk(0);
        }, 500);
        break;
      default:
        this.resetCandidateKeepFilter();
    }
  }

  getAllAdmissionFinancement(data) {
    if (data) {
      const filter = {
        candidate_id: data._id,
        admission_process_id: data.admission_process_id && data.admission_process_id._id ? data.admission_process_id._id : null,
        program_id: data.intake_channel && data.intake_channel._id ? data.intake_channel._id : null,
      };
      this.isWaitingForResponse = true;
      this.subs.sink = this.candidatesService.getAllAdmissionFinancementsTransfer(filter).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          this.financement = _.cloneDeep(resp);
          let checkActualStatus = [];
          if (this.financement && this.financement.length) {
            checkActualStatus = this.financement.filter((status) => status.actual_status === 'accepted');
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
            this.openTransferProgram(data);
          }
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
        },
      );
    }
  }
  openTransferProgram(data) {
    const candidate = [];
    candidate.push(data);
    this.subs.sink = this.dialog
      .open(TransferFcProgramCandidateDialogComponent, {
        width: '600px',
        minHeight: '100px',
        maxHeight: '590px',
        disableClose: true,
        panelClass: 'certification-rule-pop-up',
        data: {
          data: candidate,
          from: 'fc',
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.resetCandidateKeepFilter();
        }
      });
  }

  applySuperFilter() {
    this.filteredValues = {
      ...this.filteredValues,
      scholar_season: this.superFilter && this.superFilter.scholar_season !== 'AllF' ? this.superFilter.scholar_season : null,
      school: this.superFilter && this.superFilter.school && !this.superFilter.school.includes('AllF') ? this.superFilter.school : null,
      campus: this.superFilter && this.superFilter.campus && !this.superFilter.campus.includes('AllF') ? this.superFilter.campus : null,
      level: this.superFilter && this.superFilter.level && !this.superFilter.level.includes('AllF') ? this.superFilter.level : null,
      tags: this.superFilter && this.superFilter.tags && !this.superFilter.tags.includes('AllF') ? this.superFilter.tags : null,
      sectors: this.superFilter?.sectors && !this.superFilter.sectors?.includes('AllF') ? this.superFilter.sectors : null,
      specialities:
        this.superFilter?.specialities && !this.superFilter.specialities?.includes('AllF') ? this.superFilter.specialities : null,
    };
    this.clearSelectIfFilter();
    this.paginator.pageIndex = 0;
    this.isDisabled = true;
    this.getCandidatesData('superFilter');
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.superFilter, this.filteredValues);
    if (filterItem?.type === 'table_filter' && filterItem?.column === 'AdmissionFollowUp.Status') {
      this.filteredValues.candidate_admission_statuses = [
        'admission_in_progress',
        'engaged',
        'registered',
        'resigned',
        'resigned_after_engaged',
        'resigned_after_registered',
        'bill_validated',
        'financement_validated',
        'mission_card_validated',
        'in_scholarship',
        'report_inscription',
        'resignation_missing_prerequisites',
        'no_show',
        'resign_after_school_begins',
      ];
    } else if (filterItem?.type === 'super_filter' && filterItem?.name && this.filteredValues && this.filteredValues[filterItem?.name]) {
      this.filteredValues[filterItem?.name] = null;
      console.log('FILTER ITEM: ', filterItem);
      if (filterItem.name === 'scholar_season') {
        this.scholarFilter.setValue('All');
        this.getDataForList('');
      } else if (filterItem.name === 'school') {
        this.schoolsFilter.setValue('');
        this.getDataCampus();
      } else if (filterItem.name === 'campus') {
        this.campusFilter.setValue('');
        this.getDataByLevel();
      } else if (filterItem.name === 'level') {
        this.levelFilter.setValue('');
        this.getAllSector();
      } else if (filterItem.name === 'sectors') {
        this.sectorFilter.setValue('');
        this.getAllSpeciality();
      } else if (filterItem.name === 'specialities') {
        this.specialityFilter.setValue('');
      }
    } else if (
      filterItem?.type === 'table_filter' &&
      filterItem?.name === 'trial_date' &&
      this.filteredValues &&
      this.filteredValues[filterItem?.name]
    ) {
      this.filteredValues[filterItem?.name] = null;
    } else if (filterItem?.type === 'table_filter' && filterItem?.name === 'down_payment' && this.filteredValues) {
      this.filteredValues['payments'] = null;
      this.filteredValues['is_deposit_paids'] = null;
    } else if (
      filterItem?.type === 'table_filter' &&
      filterItem?.name === 'continuous_formation_manager_id' &&
      this.searching &&
      this.searching[filterItem?.name]
    ) {
      this.searching[filterItem?.name] = null;
    } else if (filterItem?.name === 'status' && this.filteredValues?.student_admission_steps?.length && this.stepColumn?.length) {
      const stepIndex = this.stepColumn.findIndex((step) => step === filterItem?.column);
      if (stepIndex !== -1) {
        const stepFilteredValueIndex = this.checkFilteredSteps(stepIndex);
        this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, null);
        if (stepFilteredValueIndex >= 0) {
          this.filteredValues?.student_admission_steps?.splice(stepFilteredValueIndex, 1);
        }
      }
    }
    this.clearSelectIfFilter();
    this.getCandidatesData('resetCandidate');
  }

  checkFilteredSteps(stepColumnIndex) {
    return this.filteredValues.student_admission_steps.findIndex(
      (step) => step.step === stepColumnIndex && step?.step_type_selected === 'mandatory',
    );
  }

  filterBreadcrumbFormat() {
    console.log('FILTERED VALUES: ', this.filteredValues.financement);
    console.log('FILTER REF: ', this.financementFilter.value);
    const studentStatusFilterValue = {
      candidate_admission_statuses:
        this.studentStatusFilter?.value?.length &&
        !this.studentStatusFilter?.value?.includes('All') &&
        this.filteredValues?.candidate_admission_statuses
          ? this.filteredValues?.candidate_admission_statuses
          : null,
    };
    const stepsColumnFilterBreadcrumb = [];
    const dataDownPayment = {
      down_payment:
        this.filteredValues.payments?.length && this.filteredValues.is_deposit_paids?.length
          ? this.filteredValues.is_deposit_paids.concat(this.filteredValues.payments)
          : !this.filteredValues.payments?.length && this.filteredValues.is_deposit_paids?.length
          ? this.filteredValues.is_deposit_paids
          : this.filteredValues.payments,
    };
    if (this.stepColumn?.length) {
      this.stepColumn.forEach((step, stepIndex) => {
        const stepFilter = {
          type: 'table_filter',
          name:
            this.steps?.controls[stepIndex]?.value?.length && this.steps?.controls[stepIndex]?.value?.length !== this.listStepSone?.length
              ? 'statuses'
              : stepIndex.toString(),
          column: step,
          isMultiple: this.steps?.controls[stepIndex]?.value?.length === this.listStepSone?.length ? false : true,
          filterValue:
            this.steps?.controls[stepIndex]?.value?.length === this.listStepSone?.length
              ? this.filteredValuesAll
              : this.filteredValues?.student_admission_steps?.length && this.checkFilteredSteps(stepIndex) !== -1
              ? this.filteredValues?.student_admission_steps[this.checkFilteredSteps(stepIndex)]
              : null,
          filterList: this.steps?.controls[stepIndex]?.value?.length === this.listStepSone?.length ? null : this.listStepSone,
          filterRef: this.steps?.controls[stepIndex],
          displayKey: this.steps?.controls[stepIndex]?.value?.length === this.listStepSone?.length ? null : 'value',
          savedValue: this.steps?.controls[stepIndex]?.value?.length === this.listStepSone?.length ? null : 'key',
          isSelectionInput: this.steps?.controls[stepIndex]?.value?.length === this.listStepSone?.length ? false : true,
          resetValue: '',
        };
        stepsColumnFilterBreadcrumb.push(stepFilter);
      });
    }
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: this.superFilter?.scholar_season !== 'AllF' ? 'scholar_season' : null, // name of the key in the object storing the filter
        column: 'CARDDETAIL.Scholar Season', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.superFilter?.scholar_season !== 'AllF' ? this.superFilter : null,
        filterList: this.scholars, // the array/list holding the dropdown options
        filterRef: this.scholarFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'scholar_season', // the key displayed in the html (only applicable to array of objects)
        savedValue: '_id', // the value saved when user select an option (e.g. _id)
        resetValue: 'All',
      },
      {
        type: 'super_filter',
        name: 'school',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.School',
        isMultiple: this.schoolsFilter?.value?.length === this.school?.length ? false : true,
        filterValue: this.schoolsFilter?.value?.length === this.school?.length ? this.filteredValuesAll : this.superFilter,
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
        filterValue: this.campusFilter?.value?.length === this.campusList?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.campusFilter?.value?.length === this.campusList?.length ? null : this.campusList,
        filterRef: this.campusFilter,
        displayKey: this.campusFilter?.value?.length === this.campusList?.length ? null : 'name',
        savedValue: this.campusFilter?.value?.length === this.campusList?.length ? null : '_id',
        isSelectionInput: this.campusFilter?.value?.length === this.campusList?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'level',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level',
        isMultiple: this.levelFilter?.value?.length === this.levels?.length ? false : true,
        filterValue: this.levelFilter?.value?.length === this.levels?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.levelFilter?.value?.length === this.levels?.length ? null : this.levels,
        filterRef: this.levelFilter,
        displayKey: this.levelFilter?.value?.length === this.levels?.length ? null : 'name',
        savedValue: this.levelFilter?.value?.length === this.levels?.length ? null : '_id',
        isSelectionInput: this.levelFilter?.value?.length === this.levels?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'sectors',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Sector',
        isMultiple: this.sectorFilter?.value?.length === this.sectorList?.length ? false : true,
        filterValue: this.sectorFilter?.value?.length === this.sectorList?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.sectorFilter?.value?.length === this.sectorList?.length ? null : this.sectorList,
        filterRef: this.sectorFilter,
        displayKey: this.sectorFilter?.value?.length === this.sectorList?.length ? null : 'name',
        savedValue: this.sectorFilter?.value?.length === this.sectorList?.length ? null : '_id',
        isSelectionInput: this.sectorFilter?.value?.length === this.sectorList?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'specialities',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Speciality',
        isMultiple: this.specialityFilter?.value?.length === this.specialityList?.length ? false : true,
        filterValue: this.specialityFilter?.value?.length === this.specialityList?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.specialityFilter?.value?.length === this.specialityList?.length ? null : this.specialityList,
        filterRef: this.specialityFilter,
        displayKey: this.specialityFilter?.value?.length === this.specialityList?.length ? null : 'name',
        savedValue: this.specialityFilter?.value?.length === this.specialityList?.length ? null : '_id',
        isSelectionInput: this.specialityFilter?.value?.length === this.specialityList?.length ? false : true,
      },
      // TABLE FILTERS BELOW

      {
        type: 'table_filter',
        name: 'sigle',
        column: 'AdmissionFollowUp.Type of formation',
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
        column: 'student number',
        isMultiple: null,
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
        column: 'AdmissionFollowUp.Name',
        isMultiple: null,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.lastNameFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'nationality',
        column: 'AdmissionFollowUp.Nationality',
        isMultiple: this.nationalityFilter?.value?.length === this.nationalityFilterList?.length ? false : true,
        filterValue:
          this.nationalityFilter?.value?.length === this.nationalityFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.nationalityFilter?.value?.length === this.nationalityFilterList?.length ? null : this.nationalityFilterList,
        filterRef: this.nationalityFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: this.nationalityFilter?.value?.length === this.nationalityFilterList?.length ? false : true,
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'intake_channel',
        column: 'AdmissionFollowUp.Intake channel',
        isMultiple: this.entryWayFilter?.value?.length === this.entryWayFilterList?.length ? false : true,
        filterValue: this.entryWayFilter?.value?.length === this.entryWayFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.entryWayFilter?.value?.length === this.entryWayFilterList?.length ? null : this.entryWayFilterList,
        filterRef: this.entryWayFilter,
        displayKey: this.entryWayFilter?.value?.length === this.entryWayFilterList?.length ? null : 'intake_channel',
        savedValue: this.entryWayFilter?.value?.length === this.entryWayFilterList?.length ? null : '_id',
        isSelectionInput: this.entryWayFilter?.value?.length === this.entryWayFilterList?.length ? false : true,
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'candidate_admission_statuses',
        column: 'AdmissionFollowUp.Status',
        isMultiple: this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length ? false : true,
        filterValue:
          this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length
            ? this.filteredValuesAll
            : studentStatusFilterValue,
        filterList: this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length ? null : this.studentStatusFilterList,
        filterRef: this.studentStatusFilter,
        displayKey: this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length ? null : 'key',
        savedValue: this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length ? null : 'value',
        isSelectionInput: this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length ? false : true,
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: this.filteredValues['registration_profile_statuses'] ? 'registration_profile_statuses' : 'registration_profile',
        column: 'AdmissionFollowUp.Registration profile',
        isMultiple: this.profileRateFilter?.value?.length === this.profileRateFilterList?.length - 2 ? false : true,
        filterValue:
          this.profileRateFilter?.value?.length === this.profileRateFilterList?.length - 2 ? this.filteredValuesAll : this.filteredValues,
        filterList: this.profileRateFilter?.value?.length === this.profileRateFilterList?.length - 2 ? null : this.profileRateFilterList,
        filterRef: this.profileRateFilter,
        displayKey: this.profileRateFilter?.value?.length === this.profileRateFilterList?.length - 2 ? null : 'name',
        savedValue: this.profileRateFilter?.value?.length === this.profileRateFilterList?.length - 2 ? null : '_id',
        isSelectionInput: this.profileRateFilter?.value?.length === this.profileRateFilterList?.length - 2 ? false : true,
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'admission_document_process_statuses',
        column: 'Admission doc',
        isMultiple: this.listAdmission?.length ===  this.admissionDocumentFilter?.value?.length ? false : true,
        filterValue: this.listAdmission?.length ===  this.admissionDocumentFilter?.value?.length ? this.filteredValuesAll :  this.filteredValues,
        filterList: this.listAdmission?.length ===  this.admissionDocumentFilter?.value?.length ? null : this.listAdmission,
        filterRef: this.admissionDocumentFilter,
        displayKey: this.listAdmission?.length ===  this.admissionDocumentFilter?.value?.length ? null : 'key',
        savedValue: this.listAdmission?.length ===  this.admissionDocumentFilter?.value?.length ? null : 'value',
        isSelectionInput: this.listAdmission?.length ===  this.admissionDocumentFilter?.value?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'announcement_call',
        column: 'AdmissionFollowUp.Announcement call',
        isMultiple: this.announcementCallFilter?.value?.length === this.announcementCallFilterList?.length ? false : true,
        filterValue:
          this.announcementCallFilter?.value?.length === this.announcementCallFilterList?.length
            ? this.filteredValuesAll
            : this.filteredValues,
        filterList:
          this.announcementCallFilter?.value?.length === this.announcementCallFilterList?.length ? null : this.announcementCallFilterList,
        filterRef: this.announcementCallFilter,
        displayKey: this.announcementCallFilter?.value?.length === this.announcementCallFilterList?.length ? null : 'key',
        savedValue: this.announcementCallFilter?.value?.length === this.announcementCallFilterList?.length ? null : 'value',
        isSelectionInput: this.announcementCallFilter?.value?.length === this.announcementCallFilterList?.length ? false : true,
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'registration_email_date',
        column: 'AdmissionFollowUp.Registration Email',
        isMultiple: this.announcementEmailFilter?.value?.length === this.announcementEmailFilterList?.length ? false : true,
        filterValue:
          this.announcementEmailFilter?.value?.length === this.announcementEmailFilterList?.length
            ? this.filteredValuesAll
            : this.filteredValues,
        filterList:
          this.announcementEmailFilter?.value?.length === this.announcementEmailFilterList?.length
            ? null
            : this.announcementEmailFilterList,
        filterRef: this.announcementEmailFilter,
        displayKey: this.announcementEmailFilter?.value?.length === this.announcementEmailFilterList?.length ? null : 'key',
        savedValue: this.announcementEmailFilter?.value?.length === this.announcementEmailFilterList?.length ? null : 'value',
        isSelectionInput: this.announcementEmailFilter?.value?.length === this.announcementEmailFilterList?.length ? false : true,
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'down_payment',
        column: 'AdmissionFollowUp.Down payment',
        isMultiple: this.paymentFilter?.value?.length === this.DPFilterList?.length ? false : true,
        filterValue: this.paymentFilter?.value?.length === this.DPFilterList?.length ? this.filteredValuesAll : dataDownPayment,
        filterList: this.paymentFilter?.value?.length === this.DPFilterList?.length ? null : this.DPFilterList,
        filterRef: this.paymentFilter,
        displayKey: this.paymentFilter?.value?.length === this.DPFilterList?.length ? null : 'value',
        savedValue: this.paymentFilter?.value?.length === this.DPFilterList?.length ? null : 'value',
        isSelectionInput: this.paymentFilter?.value?.length === this.DPFilterList?.length ? false : true,
        translationPrefix: this.paymentFilter?.value?.length === this.DPFilterList?.length ? null : 'DP_Status.',
        resetValue: 'AllM',
      },
      {
        type: 'table_filter',
        name: 'financement',
        column: 'AdmissionFollowUp.Financement',
        isMultiple: this.financementFilter?.value?.length === this.financementFilterList?.length ? false : true,
        filterValue:
          this.financementFilter?.value?.length === this.financementFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.financementFilter?.value?.length === this.financementFilterList?.length ? null : this.financementFilterList,
        filterRef: this.financementFilter,
        displayKey: this.financementFilter?.value?.length === this.financementFilterList?.length ? null : 'key',
        savedValue: this.financementFilter?.value?.length === this.financementFilterList?.length ? null : 'value',
        isSelectionInput: this.financementFilter?.value?.length === this.financementFilterList?.length ? false : true,
        translationPrefix: 'Step_Statuses.',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'registered_at',
        column: 'AdmissionFollowUp.Registration Date',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.registrationDateFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'trial_dates',
        column: 'Trial date',
        isMultiple: this.trialDateCtrl?.value?.length === this.trialDateList?.length ? false : true,
        filterValue: this.trialDateCtrl?.value?.length === this.trialDateList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.trialDateCtrl?.value?.length === this.trialDateList?.length ? null : this.trialDateList,
        filterRef: this.trialDateCtrl,
        displayKey: this.trialDateCtrl?.value?.length === this.trialDateList?.length ? null : null,
        savedValue: this.trialDateCtrl?.value?.length === this.trialDateList?.length ? null : null,
        isSelectionInput: this.trialDateCtrl?.value?.length === this.trialDateList?.length ? false : true,
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'admission_member',
        column: 'AdmissionFollowUp.Dev member',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.devMemberFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'continuous_formation_manager_id',
        column: 'FC Member',
        isMultiple: false,
        filterValue: this.searching,
        filterList: null,
        filterRef: this.fcMemberFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'is_oscar_updated',
        column: 'CRM',
        isMultiple: this.crmFilter?.value?.length === this.listCrm?.length ? false : true,
        filterValue: this.crmFilter?.value?.length === this.listCrm?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.crmFilter?.value?.length === this.listCrm?.length ? null : this.listCrm,
        filterRef: this.crmFilter,
        displayKey: this.crmFilter?.value?.length === this.listCrm?.length ? null : 'key',
        savedValue: this.crmFilter?.value?.length === this.listCrm?.length ? null : 'value',
        isSelectionInput: this.crmFilter?.value?.length === this.listCrm?.length ? false : true,
        resetValue: null,
      },
      ...stepsColumnFilterBreadcrumb,
    ];

    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }
  showActionButton() {
    return (
      this.permissionService.crmOkFollowUpContinuous() ||
      this.permissionService.assignRegistrationProfileMultipleFollowUpContinuous() ||
      (this.showMultipleCall && this.permissionService.firstCallDoneMultipleFollowUpContinuous()) ||
      this.permissionService.firstEmailMultipleFollowUpContinuous() ||
      this.permissionService.transferToAnotherMemberMultipleFollowUpContinuous() ||
      this.permissionService.sendEmailMultipleFollowUpContinuous()
    );
  }
  isAllDropdownSelected(type, index?) {
    if (type === 'scholar') {
      const selected = this.scholarFilter.value;
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
      const selected = this.sectorFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.sectorList.length;
      return isAllSelected;
    } else if (type === 'speciality') {
      const selected = this.specialityFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.specialityList.length;
      return isAllSelected;
    } else if (type === 'tags') {
      const selected = this.tagFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.tags.length;
    } else if (type === 'sigle') {
      const selected = this.sigleFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listSigle.length;
      return isAllSelected;
    } else if (type === 'nationality') {
      const selected = this.nationalityFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.nationalityFilterList.length;
      return isAllSelected;
    } else if (type === 'entry_way') {
      const selected = this.entryWayFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.entryWayFilterList.length;
      return isAllSelected;
    } else if (type === 'announcement_call') {
      const selected = this.announcementCallFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.announcementCallFilterList.length;
      return isAllSelected;
    } else if (type === 'announcement_email') {
      const selected = this.announcementEmailFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.announcementEmailFilterList.length;
      return isAllSelected;
    } else if (type === 'financement') {
      const selected = this.financementFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.financementFilterList.length;
      return isAllSelected;
    } else if (type === 'DPFilter') {
      const selected = this.paymentFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPFilterList.length;
      return isAllSelected;
    } else if (type === 'trialDate') {
      const selected = this.trialDateCtrl.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.trialDateList.length;
      return isAllSelected;
    } else if (type === 'crm') {
      const selected = this.crmFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listCrm.length;
      return isAllSelected;
    } else if (type === 'steps') {
      const selected = this.steps.controls[index].value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listStepSone.length;
      return isAllSelected;
    } else if (type === 'optionalSteps') {
      const selected = this.optionalSteps.controls[index].value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listStepSone.length;
      return isAllSelected;
    } else if (type === 'studentStatus') {
      const selected = this.studentStatusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.studentStatusFilterList.length;
      return isAllSelected;
    } else if (type === 'profileRate') {
      const selected = this.profileRateFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.profileRateFilterList.length;
      return isAllSelected;
    } else if (type === 'admissionDocument') {
      const selected = this.admissionDocumentFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listAdmission.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type, index?) {
    if (type === 'scholar') {
      const selected = this.scholarFilter.value;
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
      const selected = this.sectorFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.sectorList.length;
      return isIndeterminate;
    } else if (type === 'speciality') {
      const selected = this.specialityFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.specialityList.length;
      return isIndeterminate;
    } else if (type === 'tags') {
      const selected = this.tagFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.tags.length;
    } else if (type === 'sigle') {
      const selected = this.sigleFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listSigle.length;
      return isIndeterminate;
    } else if (type === 'nationality') {
      const selected = this.nationalityFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.nationalityFilterList.length;
      return isIndeterminate;
    } else if (type === 'entry_way') {
      const selected = this.entryWayFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.entryWayFilterList.length;
      return isIndeterminate;
    } else if (type === 'announcement_call') {
      const selected = this.announcementCallFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.announcementCallFilterList.length;
      return isIndeterminate;
    } else if (type === 'announcement_email') {
      const selected = this.announcementEmailFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.announcementEmailFilterList.length;
      return isIndeterminate;
    } else if (type === 'financement') {
      const selected = this.financementFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.financementFilterList.length;
      return isIndeterminate;
    } else if (type === 'DPFilter') {
      const selected = this.paymentFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPFilterList.length;
      return isIndeterminate;
    } else if (type === 'trialDate') {
      const selected = this.trialDateCtrl.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.trialDateList.length;
      return isIndeterminate;
    } else if (type === 'crm') {
      const selected = this.crmFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listCrm.length;
      return isIndeterminate;
    } else if (type === 'steps') {
      const selected = this.steps.controls[index].value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listStepSone.length;
      return isIndeterminate;
    } else if (type === 'optionalSteps') {
      const selected = this.optionalSteps.controls[index].value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listStepSone.length;
      return isIndeterminate;
    } else if (type === 'studentStatus') {
      const selected = this.studentStatusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.studentStatusFilterList.length;
      return isIndeterminate;
    } else if (type === 'profileRate') {
      const selected = this.profileRateFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.profileRateFilterList.length;
      return isIndeterminate;
    } else if (type === 'admissionDocument') {
      const selected = this.admissionDocumentFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listAdmission.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type, index?) {
    if (type === 'scholar') {
      if (event.checked) {
        this.scholarFilter.patchValue('All', { emitEvent: false });
      } else {
        this.scholarFilter.patchValue(null, { emitEvent: false });
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
        const campusData = this.campusList.map((el) => el._id);
        this.campusFilter.patchValue(campusData, { emitEvent: false });
      } else {
        this.campusFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'level') {
      if (event.checked) {
        const levelData = this.levels.map((el) => el._id);
        this.levelFilter.patchValue(levelData, { emitEvent: false });
      } else {
        this.levelFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'sector') {
      if (event.checked) {
        const sectorData = this.sectorList.map((el) => el._id);
        this.sectorFilter.patchValue(sectorData, { emitEvent: false });
      } else {
        this.sectorFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'speciality') {
      if (event.checked) {
        const specialityData = this.specialityList.map((el) => el._id);
        this.specialityFilter.patchValue(specialityData, { emitEvent: false });
      } else {
        this.specialityFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'tags') {
      if (event.checked) {
        const tagsData = this.tags.map((el) => el._id);
        this.tagFilter.patchValue(tagsData, { emitEvent: false });
      } else {
        this.tagFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'sigle') {
      if (event.checked) {
        const data = this.listSigle.map((el) => el);
        this.sigleFilter.patchValue(data, { emitEvent: false });
      } else {
        this.sigleFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'nationality') {
      if (event.checked) {
        const data = this.nationalityFilterList.map((el) => el);
        this.nationalityFilter.patchValue(data, { emitEvent: false });
      } else {
        this.nationalityFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'entry_way') {
      if (event.checked) {
        const data = this.entryWayFilterList.map((el) => el._id);
        this.entryWayFilter.patchValue(data, { emitEvent: false });
      } else {
        this.entryWayFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'announcement_call') {
      if (event.checked) {
        const data = this.announcementCallFilterList.map((el) => el.value);
        this.announcementCallFilter.patchValue(data, { emitEvent: false });
      } else {
        this.announcementCallFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'announcement_email') {
      if (event.checked) {
        const data = this.announcementEmailFilterList.map((el) => el.value);
        this.announcementEmailFilter.patchValue(data, { emitEvent: false });
      } else {
        this.announcementEmailFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'financement') {
      if (event.checked) {
        const data = this.financementFilterList.map((el) => el.value);
        this.financementFilter.patchValue(data, { emitEvent: false });
      } else {
        this.financementFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'DPFilter') {
      if (event.checked) {
        const data = this.DPFilterList.map((el) => el.value);
        this.paymentFilter.patchValue(data, { emitEvent: false });
      } else {
        this.paymentFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'trialDate') {
      if (event.checked) {
        const data = this.trialDateList.map((el) => el);
        this.trialDateCtrl.patchValue(data, { emitEvent: false });
      } else {
        this.trialDateCtrl.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'crm') {
      if (event.checked) {
        const data = this.listCrm.map((el) => el.value);
        this.crmFilter.patchValue(data, { emitEvent: false });
      } else {
        this.crmFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'steps') {
      if (event.checked) {
        const data = this.listStepSone.map((el) => el.key);
        this.steps.controls[index].patchValue(data, { emitEvent: false });
      } else {
        this.steps.controls[index].patchValue(null, { emitEvent: false });
      }
    } else if (type === 'optionalSteps') {
      if (event.checked) {
        const data = this.listStepSone.map((el) => el.key);
        this.optionalSteps.controls[index].patchValue(data, { emitEvent: false });
      } else {
        this.optionalSteps.controls[index].patchValue(null, { emitEvent: false });
      }
    } else if (type === 'studentStatus') {
      if (event.checked) {
        const data = this.studentStatusFilterList.map((el) => el.value);
        this.studentStatusFilter.patchValue(data, { emitEvent: false });
      } else {
        this.studentStatusFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'profileRate') {
      if (event.checked) {
        const data = this.profileRateFilterList.map((el) => el._id);
        this.profileRateFilter.patchValue(data, { emitEvent: false });
      } else {
        this.profileRateFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'admissionDocument') {
      if (event.checked) {
        const data = this.listAdmission.map((el) => el.value);
        this.admissionDocumentFilter.patchValue(data, { emitEvent: false });
      } else {
        this.admissionDocumentFilter.patchValue(null, { emitEvent: false });
      }
    }
  }

  checkIconDownPayment(element) {
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
  checkStatusButton(element) {
    if (element?.candidate_admission_status === 'registered' && element?.is_future_program_assigned) {
      return false;
    } else {
      return true;
    }
  }
}
