import { FilterBreadcrumbService } from './../../filter-breadcrumb/service/filter-breadcrumb.service';
import { Observable, of } from 'rxjs';
import * as _ from 'lodash';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, OnChanges } from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SubSink } from 'subsink';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AuthService } from 'app/service/auth-service/auth.service';
import Swal from 'sweetalert2';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { MailCanidateDialogComponent } from '../mail-candidates-dialog/mail-candidates-dialog.component';
import { AssignRateProfileDialogComponent } from '../../shared/components/assign-rate-dialog/assign-rate-dialog.component';
import { TransferAdmissionDialogComponent } from '../transfer-admission-member/transfer-admission-member-dialog.component';
import { AssignMemberDialogComponent } from '../assign-member-dialog/assign-member-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { StudentsService } from 'app/service/students/students.service';
import { TransferCampusDialogComponent } from '../transfer-campus/transfer-campus-dialog.component';
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
import { timeHours } from 'd3';
import { SendEmailValidatorDialogComponent } from 'app/shared/components/send-email-validator-dialog/send-email-validator-dialog.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StudentsTableService } from 'app/students-table/StudentTable.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';

@Component({
  selector: 'ms-candidates',
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class CandidatesComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
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
    'connection',
    'personalInfo',
    'methodOfPayment',
    'condition',
    'signature',
    'payment',
    'downPayment',
    'registrationDate',
    'admissionDocument',
    'dueDate',
    'trial_date',
    'devMember',
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
    'connectionFilter',
    'personalInfoFilter',
    'methodOfPaymentFilter',
    'conditionFilter',
    'signatureFilter',
    'paymentFilter',
    'downPaymentFilter',
    'registrationDateFilter',
    'admissionDocumentFilter',
    'dueDateFilter',
    'trialFilter',
    'devMemberFilter',
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
  connectionFilter = new UntypedFormControl(null);
  personalInfoFilter = new UntypedFormControl(null);
  signatureFilter = new UntypedFormControl(null);
  paymentMethodFilter = new UntypedFormControl(null);
  paymentFilter = new UntypedFormControl(null);
  downPaymentFilter = new UntypedFormControl(null);
  whatsappFilter = new UntypedFormControl('');
  mentorFilter = new UntypedFormControl('');
  devMemberFilter = new UntypedFormControl('');
  openHouseDayParticipationFilter = new UntypedFormControl('');
  jobMeetingParticipationFilter = new UntypedFormControl('');
  scholarFilter = new UntypedFormControl('All');
  conditionFilter = new UntypedFormControl(null);
  studentNumberFilter = new UntypedFormControl('');
  dueDateFilter = new UntypedFormControl(null);
  registrationDateFilter = new UntypedFormControl(null);
  trialDateCtrl = new UntypedFormControl(null);
  admittedFilterList = [];
  typeFilterList = [
    { value: 'All', key: 'AllS' },
    { value: 'classic', key: 'Classic' },
    { value: 'alternance', key: 'Alternance' },
    { value: 'special', key: 'Special' },
  ];
  nationalityFilterList = [];
  backupEntryWayFilterList = [];
  backupProfileList = [];
  announcementCallFilterList = [];
  announcementEmailFilterList = [];
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
  studentStatusFilterList = [];
  connectionFilterList = [];
  personalInfoFilterList = [];
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
  signatureFilterList = [];
  paymentMethodFilterList = [];
  downPaymentFilterList = [];
  paymentFilterList = [
    { value: 'AllM', key: 'AllM' },
    { value: 'paid', key: 'Paid' },
    { value: 'not_paid', key: 'Not paid' },
    { value: 'partialy_paid', key: 'Partially paid' },
    { value: 'pending', key: 'pending' },
    { value: 'not_authorized', key: 'Rejected' },
  ];
  DPFilterList = [];
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
    candidate_admission_statuses: [
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
    ],
    candidate_unique_number: '',
    candidate_admission_status: null,
    registration_profile_status: null,
    registration_profile_statuses: null,
    payment: null,
    registration_email_due_date: '',
    registered_at: '',
    is_admitted: null,
    type_of_formation_name: 'classic',
    candidate: '',
    nationality: '',
    announcement_call: '',
    registration_email_date: '',
    intake_channel: '',
    registration_profile: null,
    engagement_level: '',
    connection: '',
    personal_information: '',
    identificationPapers: '',
    studiesJustification: '',
    contacts: '',
    signature: '',
    method_of_payment: '',
    is_deposit_paid: '',
    student_mentor: '',
    admission_member: '',
    is_whatsapp: null,
    diploma_status: null,
    participate_in_open_house_day: null,
    participate_in_job_meeting: null,
    payment_method: '',
    is_oscar_updated: '',
    admission_document_process_status: null,
    scholar_season: '',
    school: '',
    campus: '',
    level: '',
    tags: '',
    sectors: '',
    specialities: '',
    payments: null,
    is_deposit_paids: null,
    nationalities: null,
    intake_channels: null,
    announcement_calls: null,
    registration_email_dates: null,
    connections: null,
    personal_informations: null,
    is_admitteds: null,
    signatures: null,
    payment_methods: null,
    method_of_payments: null,
    diploma_statuses: null,
    admission_document_process_statuses: null,
    is_oscar_updateds: null,
  };
  filteredValuesSuperFilter = {
    scholar_season: '',
    school: '',
    campus: '',
    level: '',
    tags: '',
    sectors: '',
    specialities: '',
  };
  searching = {
    trial_date: '',
    trial_dates: null,
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
  sectorList = [];
  specialityList = [];
  listObjective = [];
  tagList = [];
  levels = [];
  school = [];
  scholars = [];
  originalScholar = [];
  scholarSelected = [];
  filteredTrialDateList: Observable<any[]>;
  isHasRegistrationProfileandCallNotDone = false;
  isNoRegistrationProfileandCallNotDone = false;
  isHasRegistrationProfile = false;
  isRegistrationProfileDone = false;
  showMultipleCall = true; // Temporary hide button call multiple because BE was not ready yet
  allCandidateData: any = [];
  crmFilter = new UntypedFormControl(null);
  admissionDocumentFilter = new UntypedFormControl(null);
  isWasSelectAll = false;
  isWasRegistered = false;
  listCrm = [];
  listDiploma = [];
  listAdmission = [];
  selectedProgram: any;
  dataSelectedAll: any;
  previousLength = 0;
  allStudentForCheckbox = [];
  allRegisForCheckbox = [];
  allAnnoucmentForCheckbox = [];
  allCallForCheckbox = [];
  allCRMForCheckbox = [];
  allEmailForCheckbox = [];
  allMemberForCheckbox = [];
  allExportForCheckbox = [];
  dataSelected = [];
  listRegistrationProfile = [];
  isPermission: string[];
  currentUserTypeId: any;
  sepaLogo = '../../../../../assets/img/sepa-wt-logo.png';

  campusListBackup = [];
  levelListBackup = [];

  schoolName = '';
  campusName = '';
  levelName = '';
  dataUnselectUser = [];
  buttonClicked = '';
  assignRateProfileDialogComponent: MatDialogRef<AssignRateProfileDialogComponent>;
  sendEmailValidatorDialogComponent: MatDialogRef<SendEmailValidatorDialogComponent>;
  sendMultipleEmailComponent: MatDialogRef<SendMultipleEmailComponent>;
  assignMemberDialogComponent: MatDialogRef<AssignMemberDialogComponent>;
  isDisabled = true;
  filterBreadcrumbData: any[] = [];

  tempDataFilter = {
    nationality: null,
    downPayments: null,
    intakeChannels: null,
    status: null,
    announcementCall: null,
    announcementEmail: null,
    connections: null,
    identity: null,
    conditions: null,
    schoolContract: null,
    downPaymentMethod: null,
    paymentMethods: null,
    admissionDocumentStatus: null,
    oscarStatus: null,
    trialDates: null,
    registrationProfile: null,
  };

  filteredValuesAll = {
    nationalities: 'All',
    intake_channels: 'All',
    registration_profile: 'All',
    announcement_calls: 'All',
    candidate_admission_status: ['All'],
    candidate_admission_statuses: ['All'],
    school: ['All'],
    campus: ['All'],
    level: ['All'],
    candidate_campuses: 'All',
    candidate_levels: 'All',
    sectors: ['All'],
    specialities: ['All'],
    is_oscar_updateds: 'All',
    admission_document_process_statuses: 'All',
    diploma_statuses: 'All',
    is_deposit_paids: 'All',
    payment_methods: 'All',
    signatures: 'All',
    method_of_payments: 'All',
    personal_informations: 'All',
    registration_email_dates: 'All',
    connections: 'All',
    diploma_status:'All',
    payment:'All',
    is_deposit_paid: 'All',
    payment_method: 'All',
    signature: 'All',
    trial_dates: 'All',
    is_admitteds: 'All',
    registration_email_date: 'All',
  };

  constructor(
    private candidatesService: CandidatesService,
    private exportCsvService: ExportCsvService,
    private authService: AuthService,
    private utilService: UtilityService,
    private studentService: StudentsTableService,
    private ngxPermissionService: NgxPermissionsService,
    private userService: UserService,
    public permissionService: PermissionService,
    private translate: TranslateService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private router: Router,
    private permissionsService: NgxPermissionsService,
    private fb: UntypedFormBuilder,
    private financeService: FinancesService,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    private httpClient: HttpClient,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    this.getDPFilterList();
    this.getStudentStatusFilterList();
    this.getAnnouncementCall();
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.initFilterForm();
    const pop = this.route.snapshot.queryParamMap.get('pop');
    if (pop && pop === 'six') {
      this.openTransferCampus('', '');
    }
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.isMemberAdmission = !!this.permissionsService.getPermission('Member Admission');
    this.getDataNAtionality();
    this.getDataTags();
    this.initFilter();
    this.getCandidatesData('First');
    this.getAllIntakeChannelDropdown();
    this.getAllRegistrationProfileDropdown();
    // this.getDataForList();
    this.assignMemberButton = this.translate.instant('Assign dev member');
    this.assignMentorButton = this.translate.instant('Assign mentor');
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.scholars = [];
      this.scholars = this.originalScholar.sort((a, b) =>
        a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
      );
      this.assignText(this.type, this.who);
      if (
        this.trialDateCtrl.value &&
        (this.trialDateCtrl.value.trim() === 'All' || this.trialDateCtrl.value.trim() === 'Tous') &&
        !this.searching.trial_date
      ) {
        this.trialDateCtrl.patchValue(this.translate.instant('All'));
      }

      this.refetchDataScholarSeasons();
      this.getDPFilterList();
      this.getStudentStatusFilterList();
      this.getAnnouncementCall();
      this.getAllRegistrationProfileDropdown();
    });
    this.getDataScholarSeasons();
    // call api for get list trial date dropdown
    this.getTrialDate();
    // call api for get all candidate data
    // call api for get all registration profile for checking in common program
    this.getAllProfileRate();
    if (this.scholarFilter && this.scholarFilter.value) {
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }
    this.pageTitleService.setTitle('List of Candidates');
  }

  getAnnouncementCall() {
    this.listCrm = [
      {
        key: 'OK',
        value: 'ok',
        label: this.translate.instant('OK'),
      },
      {
        key: 'NOT_OK',
        value: 'not_ok',
        label: this.translate.instant('NOT_OK'),
      },
    ];

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
    ];

    this.listDiploma = [
      {
        key: 'yes',
        value: 'yes',
        label: this.translate.instant('yes'),
      },
      {
        key: 'no',
        value: 'no',
        label: this.translate.instant('no'),
      },
      {
        key: 'retake',
        value: 'retake',
        label: this.translate.instant('retake'),
      },
      {
        key: 'sent',
        value: 'sent',
        label: this.translate.instant('sent'),
      },
    ];

    this.paymentMethodFilterList = [
      { value: 'not_done', key: 'not_done', label: this.translate.instant('not_done') },
      { value: 'check', key: 'Check', label: this.translate.instant('Check') },
      { value: 'transfer', key: 'Transfer', label: this.translate.instant('Transfer') },
      { value: 'credit_card', key: 'Credit card', label: this.translate.instant('Credit card') },
      { value: 'sepa', key: 'SEPA', label: this.translate.instant('SEPA') },
      { value: 'cash', key: 'Cash', label: this.translate.instant('Cash') },
    ];

    this.downPaymentFilterList = [
      { value: 'not_done', key: 'not_done', label: this.translate.instant('not_done') },
      { value: 'check', key: 'Check', label: this.translate.instant('Check') },
      { value: 'transfer', key: 'Transfer', label: this.translate.instant('Transfer') },
      { value: 'credit_card', key: 'Credit card', label: this.translate.instant('Credit card') },
      { value: 'sepa', key: 'SEPA', label: this.translate.instant('SEPA') },
      { value: 'cash', key: 'Cash', label: this.translate.instant('Cash') },
    ];

    this.signatureFilterList = [
      { value: 'done', key: 'Done', label: this.translate.instant('Done') },
      { value: 'not_done', key: 'Not done', label: this.translate.instant('Not done') },
    ];

    this.admittedFilterList = [
      { value: true, key: 'Done', label: this.translate.instant('Done') },
      { value: false, key: 'Not done', label: this.translate.instant('Not done') },
    ];

    this.connectionFilterList = [
      { value: 'done', key: 'Done', label: this.translate.instant('Done') },
      { value: 'not_done', key: 'Not done', label: this.translate.instant('Not done') },
    ];

    this.personalInfoFilterList = [
      { value: 'done', key: 'Done', label: this.translate.instant('Done') },
      { value: 'not_done', key: 'Not done', label: this.translate.instant('Not done') },
    ];

    this.announcementCallFilterList = [
      { value: 'done', key: 'Done', label: this.translate.instant('Done') },
      { value: 'not_done', key: 'Not done', label: this.translate.instant('Not done') },
    ];

    this.announcementEmailFilterList = [
      { value: 'not_done', key: 'Not sent', label: this.translate.instant('Not sent') },
      { value: 'today', key: 'Today', label: this.translate.instant('Today') },
      { value: 'yesterday', key: 'Yesterday', label: this.translate.instant('Yesterday') },
      { value: 'last_7_days', key: 'Last 7 days', label: this.translate.instant('Last 7 days') },
      { value: 'last_30_days', key: 'Last 30 days', label: this.translate.instant('Last 30 days') },
      { value: 'this_month', key: 'This month', label: this.translate.instant('This month') },
    ];

    this.announcementCallFilterList = this.announcementCallFilterList.sort((a, b) =>
      a.label.toLowerCase().localeCompare(b.label.toLowerCase()),
    );
  }

  getStudentStatusFilterList() {
    this.studentStatusFilterList = [
      { value: 'admission_in_progress', key: 'Admitted', label: this.translate.instant('Admitted') },
      { value: 'bill_validated', key: 'Bill validated', label: this.translate.instant('Bill validated') },
      { value: 'engaged', key: 'Engaged', label: this.translate.instant('Engaged') },
      { value: 'no_show', key: 'no_show', label: this.translate.instant('no_show') },
      {
        value: 'resign_after_school_begins',
        key: 'resign_after_school_begins',
        label: this.translate.instant('resign_after_school_begins'),
      },
      { value: 'registered', key: 'Registered', label: this.translate.instant('Registered') },
      { value: 'resigned', key: 'Resigned', label: this.translate.instant('Resigned') },
      { value: 'mission_card_validated', key: 'mission_card_validated', label: this.translate.instant('mission_card_validated') },
      { value: 'resigned_after_engaged', key: 'Resigned after engaged', label: this.translate.instant('Resigned after engaged') },
      { value: 'resigned_after_registered', key: 'Resign after registered', label: this.translate.instant('Resign after registered') },
      { value: 'report_inscription', key: 'Report Inscription +1', label: this.translate.instant('Report Inscription +1') },
      { value: 'in_scholarship', key: 'in_scholarship', label: this.translate.instant('in_scholarship') },
      {
        value: 'resignation_missing_prerequisites',
        key: 'resignation_missing_prerequisites',
        label: this.translate.instant('resignation_missing_prerequisites'),
      },
      // { value: 'deactivated', key: 'Deactivated' },
    ];

    this.studentStatusFilterList = this.studentStatusFilterList.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
  }

  getDPFilterList() {
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

  getTrialDate() {
    // get api for list dropdown
    this.subs.sink = this.candidatesService.GetAllTrialDateOfCandidateFollowUP(this.filterTrialDate.candidate_admission_statuses).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.trialDateList = _.cloneDeep(resp);
          this.trialDateList = this.trialDateList.map((trial) => {
            return {
              value: trial,
              label: trial,
            };
          });
          // filtering list based on user input
          // this.filteredTrialDateList = this.trialDateCtrl.valueChanges.pipe(
          //   startWith(''),
          //   map((searchTxt) =>
          //     searchTxt
          //       ? this.trialDateList.filter((option) =>
          //           option && option ? option.toLowerCase().includes(searchTxt.toString().toLowerCase()) : '',
          //         )
          //       : this.trialDateList,
          //   ),
          // );
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
  }

  getCandidatesData(data) {
    // console.log('Reload Page', data);
    console.log('ini scholar getcandidate', this.scholarFilter.value);
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
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];

    this.subs.sink = this.candidatesService
      .getAllCandidatesFITable(pagination, this.sortValue, filter, this.searching, userTypesList)
      .subscribe(
        (students: any) => {
          if (students && students.length) {
            this.dataSource.data = students;
            // console.log('table data', this.dataSource.data);
            this.paginator.length = students[0].count_document;
            this.dataCount = students[0].count_document;
            this.isLoading = false;
          } else {
            this.dataSource.data = [];
            this.paginator.length = 0;
            this.dataCount = 0;
            this.isLoading = false;
          }
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isReset = false;
          this.isLoading = false;
          this.filterBreadcrumbData = [];
          this.filterBreadcrumbFormat();
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
          this.nationalityFilterList = this.nationalityFilterList.map((nat) => {
            return {
              value: nat,
              label: nat,
            };
          });
        } else {
          this.nationalityFilterList = [];
        }
      },
      (err) => {
        this.nationalityFilterList = [];
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
        // this.clearSelectIfFilter();
        this.filteredValues.candidate_unique_number = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('studentNumberFilter');
        }
      } else {
        // this.clearSelectIfFilter();
        this.filteredValues.candidate_unique_number = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('studentNumberFilter');
        }
      }
    });

    this.subs.sink = this.lastNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        // this.clearSelectIfFilter();
        this.filteredValues.candidate = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('lastNameFilter');
        }
      } else {
        // this.clearSelectIfFilter();
        this.filteredValues.candidate = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('lastNameFilter');
        }
      }
    });

    this.subs.sink = this.mentorFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        // this.clearSelectIfFilter();
        this.filteredValues.student_mentor = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('mentorFilter');
        }
      } else {
        // this.clearSelectIfFilter();
        this.filteredValues.student_mentor = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('mentorFilter');
        }
      }
    });

    this.subs.sink = this.devMemberFilter.valueChanges.pipe(debounceTime(600)).subscribe((statusSearch) => {
      if (statusSearch) {
        // this.clearSelectIfFilter();
        this.filteredValues.admission_member = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('devMemberFilter');
        }
      } else {
        // this.clearSelectIfFilter();
        this.filteredValues.admission_member = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('devMemberFilter');
        }
      }
    });

    // this.subs.sink = this.conditionFilter.valueChanges.subscribe((statusSearch) => {
    //   // this.clearSelectIfFilter();
    //   this.filteredValues.is_admitted =
    //     statusSearch === 'All' || statusSearch === '' || statusSearch === null ? null : statusSearch === 'Admitted' ? true : false;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getCandidatesData('admittedFilter');
    //   }
    // });

    // this.subs.sink = this.nationalityFilter.valueChanges.subscribe((statusSearch) => {
    //   // console.log(statusSearch);
    //   // this.clearSelectIfFilter();
    //   this.filteredValues.nationality = statusSearch === 'AllF' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getCandidatesData('nationalityFilter');
    //   }
    // });

    this.subs.sink = this.typeFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (statusSearch && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        // this.clearSelectIfFilter();
        this.filteredValues.type_of_formation_name = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('typeFilter 1');
        }
      } else {
        // this.clearSelectIfFilter();
        this.filteredValues.type_of_formation_name = 'classic';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('typeFilter');
        }
      }
    });

    // this.subs.sink = this.announcementCallFilter.valueChanges.subscribe((statusSearch) => {
    //   // this.clearSelectIfFilter();
    //   this.filteredValues.announcement_call = statusSearch === 'AllF' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getCandidatesData('announcementCallFilter');
    //   }
    // });

    // this.subs.sink = this.announcementEmailFilter.valueChanges.pipe(debounceTime(400)).subscribe((result) => {
    //   if (result && result !== 'AllF') {
    //     // this.clearSelectIfFilter();
    //     this.filteredValues.registration_email_date = result;
    //     this.paginator.pageIndex = 0;
    //     if (!this.isReset) {
    //       this.getCandidatesData('registration_email_date');
    //     }
    //   } else {
    //     // this.clearSelectIfFilter();
    //     this.filteredValues.registration_email_date = '';
    //     this.paginator.pageIndex = 0;
    //     if (!this.isReset) {
    //       this.getCandidatesData('registration_email_date');
    //     }
    //   }
    // });

    this.subs.sink = this.dueDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        // this.clearSelectIfFilter();
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.registration_email_due_date = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('due_date');
        }
      }
    });

    this.subs.sink = this.registrationDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        // this.clearSelectIfFilter();
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.registered_at = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData('due_date');
        }
      }
    });

    this.subs.sink = this.engagementLevelFilter.valueChanges.subscribe((statusSearch) => {
      // this.clearSelectIfFilter();
      this.filteredValues.engagement_level = statusSearch === 'AllM' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('engagementLevelFilter');
      }
    });

    // this.subs.sink = this.connectionFilter.valueChanges.subscribe((statusSearch) => {
    //   // this.clearSelectIfFilter();
    //   this.filteredValues.connection = statusSearch === 'AllF' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getCandidatesData('connectionFilter');
    //   }
    // });

    // this.subs.sink = this.personalInfoFilter.valueChanges.subscribe((statusSearch) => {
    //   // this.clearSelectIfFilter();
    //   this.filteredValues.personal_information = statusSearch === 'AllF' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getCandidatesData('personalInfoFilter');
    //   }
    // });

    // this.subs.sink = this.signatureFilter.valueChanges.subscribe((statusSearch) => {
    //   // this.clearSelectIfFilter();
    //   this.filteredValues.signature = statusSearch === 'AllF' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getCandidatesData('signatureFilter');
    //   }
    // });

    // this.subs.sink = this.paymentMethodFilter.valueChanges.subscribe((statusSearch) => {
    //   // this.clearSelectIfFilter();
    //   this.filteredValues.method_of_payment = statusSearch === 'AllF' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getCandidatesData('paymentMethodFilter');
    //   }
    // });

    // this.subs.sink = this.downPaymentFilter.valueChanges.subscribe((statusSearch) => {
    //   // this.clearSelectIfFilter();
    //   this.filteredValues.payment_method = statusSearch === 'AllF' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getCandidatesData('downPaymentMethod');
    //   }
    // });

    // this.subs.sink = this.paymentFilter.valueChanges.subscribe((statusSearch) => {
    //   // this.clearSelectIfFilter();
    //   if (statusSearch === 'pending' || statusSearch === 'chargeback') {
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
    //   } else if (statusSearch === 'chargeback') {
    //     this.filteredValues.payment = 'chargeback';
    //     this.filteredValues.is_deposit_paid = null;
    //   }
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getCandidatesData('paymentFilter');
    //   }
    // });

    this.subs.sink = this.whatsappFilter.valueChanges.subscribe((statusSearch) => {
      // this.clearSelectIfFilter();
      this.filteredValues.is_whatsapp = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('whatsappFilter');
      }
    });

    this.subs.sink = this.openHouseDayParticipationFilter.valueChanges.subscribe((statusSearch) => {
      // this.clearSelectIfFilter();
      this.filteredValues.participate_in_open_house_day = statusSearch === 'AllF' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('openHouseDayParticipationFilter');
      }
    });

    this.subs.sink = this.jobMeetingParticipationFilter.valueChanges.subscribe((statusSearch) => {
      // this.clearSelectIfFilter();
      this.filteredValues.participate_in_job_meeting = statusSearch === 'AllF' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('jobMeetingParticipationFilter');
      }
    });

    this.subs.sink = this.schoolsFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValuesSuperFilter.level = '';
      this.filteredValuesSuperFilter.campus = '';
      this.filteredValuesSuperFilter.school = statusSearch === '' ? '' : statusSearch;
      if (
        this.filteredValuesSuperFilter.school &&
        (this.filteredValuesSuperFilter.school.length === 0 || this.filteredValuesSuperFilter.school.includes('AllF'))
      ) {
        this.campusName = '';
        this.levelName = '';
      }
      this.isDisabled = false;
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValuesSuperFilter.level = '';
      this.filteredValuesSuperFilter.campus = statusSearch === '' ? '' : statusSearch;
      if (
        this.filteredValuesSuperFilter.campus &&
        (this.filteredValuesSuperFilter.campus.length === 0 || this.filteredValuesSuperFilter.campus.includes('AllF'))
      ) {
        this.levelName = '';
      }
      this.isDisabled = false;
    });

    this.subs.sink = this.levelFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValuesSuperFilter.level = statusSearch === '' ? '' : statusSearch;
      this.isDisabled = false;
    });

    this.subs.sink = this.tagFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.filteredValuesSuperFilter.tags = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    this.subs.sink = this.sectorFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.filteredValuesSuperFilter.sectors = statusSearch === '' || (statusSearch && statusSearch.includes('AllF')) ? '' : statusSearch;
    });
    this.subs.sink = this.specialityFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.filteredValuesSuperFilter.specialities =
        statusSearch === '' || (statusSearch && statusSearch.includes('AllF')) ? '' : statusSearch;
    });
    this.subs.sink = this.scholarFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValuesSuperFilter.level = '';
      this.filteredValuesSuperFilter.campus = '';
      this.filteredValuesSuperFilter.school = '';
      this.filteredValuesSuperFilter.scholar_season = statusSearch === 'All' ? '' : statusSearch;
      if (!this.filteredValuesSuperFilter.scholar_season || this.filteredValuesSuperFilter.scholar_season === 'AllF') {
        this.campusName = '';
        this.schoolName = '';
        this.levelName = '';
      }
      this.isDisabled = false;
    });

    // this.filteredProfileRate = this.profileRateFilter.valueChanges.pipe(
    //   startWith(''),
    //   map((searchTxt) =>
    //     searchTxt
    //       ? this.profileRateFilterList.filter((option) =>
    //           option && option.name ? option.name.toLowerCase().includes(searchTxt.toString().toLowerCase()) : '',
    //         )
    //       : this.profileRateFilterList,
    //   ),
    // );

    // this.subs.sink = this.crmFilter.valueChanges.subscribe((statusSearch) => {
    //   // this.clearSelectIfFilter();
    //   this.filteredValues.is_oscar_updated = statusSearch === 'AllF' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getCandidatesData('oscarFilter');
    //   }
    // });

    // this.subs.sink = this.diplomaStatusFilter.valueChanges.subscribe((statusSearch) => {
    //   // this.clearSelectIfFilter();
    //   this.filteredValues.diploma_status = statusSearch === 'AllF' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getCandidatesData('diplomaStatusFilter');
    //   }
    // });

    // this.subs.sink = this.admissionDocumentFilter.valueChanges.subscribe((statusSearch) => {
    //   // this.clearSelectIfFilter();
    //   this.filteredValues.admission_document_process_status = statusSearch === 'AllF' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getCandidatesData('diplomaStatusFilter');
    //   }
    // });
  }

  applySuperFilter() {
    this.filteredValues = {
      ...this.filteredValues,
      scholar_season:
        this.filteredValuesSuperFilter && this.filteredValuesSuperFilter.scholar_season !== 'AllF'
          ? this.filteredValuesSuperFilter.scholar_season
          : null,
      school:
        this.filteredValuesSuperFilter && this.filteredValuesSuperFilter.school && !this.filteredValuesSuperFilter.school.includes('AllF')
          ? this.filteredValuesSuperFilter.school
          : null,
      campus:
        this.filteredValuesSuperFilter && this.filteredValuesSuperFilter.campus && !this.filteredValuesSuperFilter.campus.includes('AllF')
          ? this.filteredValuesSuperFilter.campus
          : null,
      level:
        this.filteredValuesSuperFilter && this.filteredValuesSuperFilter.level && !this.filteredValuesSuperFilter.level.includes('AllF')
          ? this.filteredValuesSuperFilter.level
          : null,
      tags:
        this.filteredValuesSuperFilter && this.filteredValuesSuperFilter.tags && !this.filteredValuesSuperFilter.tags.includes('All')
          ? this.filteredValuesSuperFilter.tags
          : null,

      sectors:
        this.filteredValuesSuperFilter?.sectors && !this.filteredValuesSuperFilter.sectors?.includes('AllF')
          ? this.filteredValuesSuperFilter.sectors
          : null,
      specialities:
        this.filteredValuesSuperFilter?.specialities && !this.filteredValuesSuperFilter.specialities?.includes('AllF')
          ? this.filteredValuesSuperFilter.specialities
          : null,
    };
    this.clearSelectIfFilter();
    this.paginator.pageIndex = 0;
    this.isDisabled = true;
    this.getCandidatesData('superFilter');
  }

  resetSelection() {
    this.disabledExport = true;
    this.selection.clear();
    this.dataSelected = [];
    this.dataUnselectUser = [];
    this.allRegisForCheckbox = [];
    this.allAnnoucmentForCheckbox = [];
    this.allCallForCheckbox = [];
    this.allCRMForCheckbox = [];
    this.allEmailForCheckbox = [];
    this.allMemberForCheckbox = [];
    this.allExportForCheckbox = [];
    this.isCheckedAll = false;
  }

  resetCandidate() {
    this.resetSelection();
    this.isReset = true;
    this.filterBreadcrumbData = [];
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.schoolName = '';
    this.campusName = '';
    this.levelName = '';

    this.filteredValues = {
      candidate_admission_statuses: [
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
      ],
      payment: null,
      candidate_admission_status: null,
      registration_profile_status: null,
      registration_profile_statuses: null,
      candidate_unique_number: '',
      registration_email_due_date: '',
      registered_at: '',
      is_admitted: null,
      candidate: '',
      type_of_formation_name: 'classic',
      nationality: '',
      announcement_call: '',
      registration_email_date: '',
      intake_channel: '',
      registration_profile: null,
      engagement_level: '',
      connection: '',
      personal_information: '',
      identificationPapers: '',
      studiesJustification: '',
      contacts: '',
      signature: '',
      method_of_payment: '',
      is_deposit_paid: '',
      student_mentor: '',
      admission_member: '',
      is_whatsapp: null,
      diploma_status: null,
      participate_in_open_house_day: null,
      participate_in_job_meeting: null,
      payment_method: '',
      is_oscar_updated: '',
      admission_document_process_status: null,
      school: '',
      campus: '',
      level: '',
      tags: '',
      scholar_season: '',
      sectors: '',
      specialities: '',
      payments: null,
      is_deposit_paids: null,
      nationalities: null,
      intake_channels: null,
      announcement_calls: null,
      registration_email_dates: null,
      connections: null,
      personal_informations: null,
      is_admitteds: null,
      signatures: null,
      payment_methods: null,
      method_of_payments: null,
      diploma_statuses: null,
      admission_document_process_statuses: null,
      is_oscar_updateds: null,
    };
    this.filteredValuesSuperFilter = {
      tags: '',
      school: '',
      campus: '',
      level: '',
      scholar_season: '',
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
    this.connectionFilter.setValue(null);
    this.personalInfoFilter.setValue(null);
    this.signatureFilter.setValue(null);
    this.paymentMethodFilter.setValue(null);
    this.paymentFilter.setValue(null);
    this.devMemberFilter.setValue('');
    this.mentorFilter.setValue('');
    this.whatsappFilter.setValue('All');
    this.conditionFilter.setValue(null);
    this.openHouseDayParticipationFilter.setValue('AllF');
    this.jobMeetingParticipationFilter.setValue('AllF');
    this.downPaymentFilter.setValue(null);
    this.studentNumberFilter.setValue('');
    this.studentStatusFilter.setValue(null);
    this.dueDateFilter.setValue('');
    this.registrationDateFilter.setValue('');
    // reset filter for crm
    this.crmFilter.setValue(null);
    this.admissionDocumentFilter.setValue(null);
    // reset filter value to be null when reset clicked
    this.searching = {
      trial_date: '',
      trial_dates: null,
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
    this.getDataNAtionality();
    this.getCandidatesData('resetCandidate');
    this.school = [];
    this.campusList = [];
    this.levels = [];
    this.sectorList = [];
    this.specialityList = [];
    this.isDisabled = true;
    if (this.scholarFilter && this.scholarFilter.value) {
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }

    this.tempDataFilter = {
      nationality: null,
      downPayments: null,
      intakeChannels: null,
      status: null,
      announcementCall: null,
      announcementEmail: null,
      connections: null,
      identity: null,
      conditions: null,
      schoolContract: null,
      downPaymentMethod: null,
      paymentMethods: null,
      admissionDocumentStatus: null,
      oscarStatus: null,
      trialDates: null,
      registrationProfile: null,
    };
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
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
      this.allRegisForCheckbox = [];
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
      this.allRegisForCheckbox = [];
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

  getDataAllForCheckbox(pageNumber, action) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isLoading = true;
    const filter = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService
      .getAllCandidatesFICheckbox(pagination, this.sortValue, filter, this.searching, userTypesList)
      .subscribe(
        (students: any) => {
          if (students && students.length) {
            this.allStudentForCheckbox.push(...students);
            this.allCandidateData.push(...students);
            const page = pageNumber + 1;
            this.getDataAllForCheckbox(page, action);
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

  getDataTags() {
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService.getAllTags(true, 'admission_fi', userTypesList, this.candidate_admission_statuses).subscribe(
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

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  triggerAnnouncement(element) {
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
        isResendMail: false,
        isFc: false,
        isReadmission: false,
      },
    });
    this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
      if (result) {
        this.resetSelection();
        this.getCandidatesData('afterAssignRateProfile');
      }
      this.sendEmailValidatorDialogComponent = null;
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
          // console.log(this.profileRateFilterList);
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
          this.resetSelection();
          this.getCandidatesData('afterAssignRateProfile');
        });
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
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    // Check user selected for see if already has registration profile and already call
    if (this.dataSelected.length > 0) {
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
        const notDoing1stcall = data.filter((listData) => listData.registration_profile);
        if (notDoing1stcall.length > 0) {
          this.isRegistrationProfileDone = true;
        } else {
          this.isRegistrationProfileDone = false;
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
          if (!list.announcement_email.sent_date && !list.announcement_email.sent_time) {
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
            (list.is_oscar_updated && list.is_oscar_updated === 'update_success') ||
            (list.is_manual_updated && list.is_manual_updated === 'update_success') ||
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
            list.candidate_admission_status !== 'resigned_after_registered' &&
            list.candidate_admission_status !== 'report_inscription'
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
            this.resetSelection();
            this.getCandidatesData('afterAssignRateProfile');
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
              this.resetSelection();
              this.getCandidatesData('afterAssignRateProfile');
              this.viewCandidateInfo(element._id, 'note-tab');
            });
          },
          (err) => {
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
            this.resetSelection();
            this.getCandidatesData('afterAssignRateProfile');
          },
          (err) => {
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
    let tagsMap;
    let sectorsMap;
    let specialitiesMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'candidate' ||
          key === 'diploma_status' ||
          key === 'nationality' ||
          key === 'intake_channel' ||
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
        } else if (key === 'registration_profile_statuses') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'is_oscar_updateds') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'admission_document_process_statuses') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'diploma_statuses') {
          const resultMap = filterData.diploma_statuses.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` diploma_statuses:[${resultMap}]`;
        } else if (key === 'method_of_payments') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'payment_methods') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'signatures') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'is_admitteds') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'personal_informations') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'connections') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'registration_email_dates') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'announcement_calls') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'intake_channels') {
          const intakeMap = filterData.intake_channels.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` intake_channels:[${intakeMap}]`;
        } else if (key === 'payments') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'is_deposit_paids') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'candidate_admission_statuses') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'nationalities') {
          const natMap = filterData.nationalities.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` nationalities:[${natMap}]`;
        } else if (key === 'school') {
          schoolsMap = filterData.school.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` schools:[${schoolsMap}]`;
        } else if (key === 'level') {
          levelsMap = filterData.level.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` candidate_levels:[${levelsMap}]`;
        } else if (key === 'tags') {
          tagsMap = filterData.tags.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` tags:[${tagsMap}]`;
        } else if (key === 'campus') {
          campusesMap = filterData.campus.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` candidate_campuses:[${campusesMap}]`;
        } else if (key === 'sectors') {
          sectorsMap = filterData.sectors.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` sectors:[${sectorsMap}]`;
        } else if (key === 'specialities') {
          specialitiesMap = filterData.specialities.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` specialities:[${specialitiesMap}]`;
        } else if (key === 'registration_profile') {
          filterQuery = filterQuery + ` ${key}: ${JSON.stringify(this.profileRateFilter.value)}`;
        } else {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        }
      }
    });
    if (this.isDirectorAdmission && !this.filteredValuesSuperFilter.school) {
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
    let tagsMap;
    let sectorsMap;
    let specialitiesMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'candidate' ||
          key === 'diploma_status' ||
          key === 'nationality' ||
          key === 'intake_channel' ||
          key === 'admission_member' ||
          key === 'student_mentor' ||
          key === 'telephone' ||
          key === 'email' ||
          key === 'scholar_season' ||
          key === 'candidate_unique_number' ||
          key === 'registration_email_due_date' ||
          key === 'registered_at' ||
          key === 'announcement_call' ||
          key === 'registration_email_date' ||
          key === 'connection' ||
          key === 'is_admitted' ||
          key === 'personal_information' ||
          key === 'signature' ||
          key === 'method_of_payment' ||
          key === 'is_deposit_paid' ||
          key === 'payment_method' ||
          key === 'is_oscar_updated' ||
          key === 'type_of_formation_name'
        ) {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        } else if (key === 'candidate_admission_statuses' || key === 'candidate_admission_status') {
        } else if (key === 'registration_profile_statuses') {
          const resultData = filterData.registration_profile_statuses.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"registration_profile_statuses":[${resultData}]`
            : filterQuery + `"registration_profile_statuses":[${resultData}]`;
        } else if (key === 'is_oscar_updateds') {
          const resultData = filterData.is_oscar_updateds.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"is_oscar_updateds":[${resultData}]`
            : filterQuery + `"is_oscar_updateds":[${resultData}]`;
        } else if (key === 'is_admitteds') {
          const resultData = filterData.is_admitteds;
          filterQuery = filterQuery ? filterQuery + ',' + `"is_admitteds":[${resultData}]` : filterQuery + `"is_admitteds":[${resultData}]`;
        } else if (key === 'signatures') {
          const resultData = filterData.signatures.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"signatures":[${resultData}]` : filterQuery + `"signatures":[${resultData}]`;
        } else if (key === 'payment_methods') {
          const resultData = filterData.payment_methods.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"payment_methods":[${resultData}]`
            : filterQuery + `"payment_methods":[${resultData}]`;
        } else if (key === 'method_of_payments') {
          const resultData = filterData.method_of_payments.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"method_of_payments":[${resultData}]`
            : filterQuery + `"method_of_payments":[${resultData}]`;
        } else if (key === 'diploma_statuses') {
          const resultData = filterData.diploma_statuses.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"diploma_statuses":[${resultData}]`
            : filterQuery + `"diploma_statuses":[${resultData}]`;
        } else if (key === 'admission_document_process_statuses') {
          const resultData = filterData.admission_document_process_statuses.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"admission_document_process_statuses":[${resultData}]`
            : filterQuery + `"admission_document_process_statuses":[${resultData}]`;
        } else if (key === 'is_oscar_updateds') {
          const resultData = filterData.is_oscar_updateds.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"is_oscar_updateds":[${resultData}]`
            : filterQuery + `"is_oscar_updateds":[${resultData}]`;
        } else if (key === 'personal_informations') {
          const resultData = filterData.personal_informations.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"personal_informations":[${resultData}]`
            : filterQuery + `"personal_informations":[${resultData}]`;
        } else if (key === 'connections') {
          const resultData = filterData.connections.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"connections":[${resultData}]` : filterQuery + `"connections":[${resultData}]`;
        } else if (key === 'registration_email_dates') {
          const announceEmailMap = filterData.registration_email_dates.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"registration_email_dates":[${announceEmailMap}]`
            : filterQuery + `"registration_email_dates":[${announceEmailMap}]`;
        } else if (key === 'announcement_calls') {
          const announceMap = filterData.announcement_calls.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"announcement_calls":[${announceMap}]`
            : filterQuery + `"announcement_calls":[${announceMap}]`;
        } else if (key === 'is_deposit_paids') {
          const depositPaid = filterData.is_deposit_paids.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"is_deposit_paids":[${depositPaid}]`
            : filterQuery + `"is_deposit_paids":[${depositPaid}]`;
        } else if (key === 'intake_channels') {
          const intakeMap = filterData.intake_channels.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"intake_channels":[${intakeMap}]`
            : filterQuery + `"intake_channels":[${intakeMap}]`;
        } else if (key === 'nationalities') {
          const natMap = filterData.nationalities.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"nationalities":[${natMap}]` : filterQuery + `"nationalities":[${natMap}]`;
        } else if (key === 'payments') {
          const paymentMap = filterData.payments.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"payments":[${paymentMap}]` : filterQuery + `"payments":[${paymentMap}]`;
        } else if (key === 'school') {
          schoolsMap = filterData.school.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"schools":[${schoolsMap}]` : filterQuery + `"schools":[${schoolsMap}]`;
        } else if (key === 'level') {
          levelsMap = filterData.level.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"candidate_levels":[${levelsMap}]`
            : filterQuery + `"candidate_levels":[${levelsMap}]`;
        } else if (key === 'tags') {
          tagsMap = filterData.tags.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"tags":[${tagsMap}]` : filterQuery + `"tags":[${tagsMap}]`;
        } else if (key === 'campus') {
          campusesMap = filterData.campus.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"candidate_campuses":[${campusesMap}]`
            : filterQuery + `"candidate_campuses":[${campusesMap}]`;
        } else if (key === 'sectors') {
          sectorsMap = filterData.sectors.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"sectors":[${sectorsMap}]` : filterQuery + `"sectors":[${sectorsMap}]`;
        } else if (key === 'specialities') {
          specialitiesMap = filterData.specialities.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"specialities":[${specialitiesMap}]`
            : filterQuery + `"specialities":[${specialitiesMap}]`;
        } else if (key === 'registration_profile') {
          filterQuery = filterQuery
            ? filterQuery + ',' + `"${key}":${JSON.stringify(this.profileRateFilter.value)}`
            : filterQuery + `"${key}":${JSON.stringify(this.profileRateFilter.value)}`;
        } else {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${filterData[key]}` : filterQuery + `"${key}":${filterData[key]}`;
        }
      }
    });
    if (this.isDirectorAdmission && !this.filteredValuesSuperFilter.school) {
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
        if (key === 'trial_date') {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        } else if (key === 'trial_dates') {
          const resultData = filterData.trial_dates.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"trial_dates":[${resultData}]` : filterQuery + `"trial_dates":[${resultData}]`;
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
        isFc: false,
        isReadmission: false,
      },
    });
    this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
      if (result) {
        this.resetSelection();
        this.getCandidatesData('afterAssignRateProfile');
      }
      this.sendEmailValidatorDialogComponent = null;
    });
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
      console.log('yes 1');
      if (type === 'button' && this.dataSelected && this.dataSelected.length < 1) {
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
        let payload = this.dataSelected && this.dataSelected.length ? _.cloneDeep(this.dataSelected) : _.cloneDeep(candidate);
        payload = _.uniqBy(payload, '_id');
        if (type === 'button' && this.dataSelected && this.dataSelected.length > 0) {
          this.dataSelected[0]['isVolumeOfHours'] = false;
        } else if (candidate && candidate.length > 0) {
          candidate[0]['isVolumeOfHours'] = false;
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
                    selected: payload,
                    from: 'crm',
                    isVolumeOfHours: false,
                  },
                });
                this.subs.sink = this.assignRateProfileDialogComponent.afterClosed().subscribe((result) => {
                  if (result) {
                    this.resetSelection();
                    this.getCandidatesData('afterAssignRateProfile');
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

              this.resetSelection();
              this.getCandidatesData('afterAssignRateProfile');
            }
          },
          (err) => {
            this.isLoading = false;
            this.authService.postErrorLog(err);
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
      this.assignAllRegistrationProfile(_.cloneDeep(this.dataSelected));
    }
  }

  crmOk() {
    // console.log('crmOk', this.isWasSelectAll, this.selectType);
    const candidateCrm = this.dataSelected.filter((list) => {
      // return list.announcement_email === 'not_sent';
      if (
        (list.is_oscar_updated && list.is_oscar_updated === 'update_success') ||
        (list.is_manual_updated && list.is_manual_updated === 'update_success') ||
        (list.is_hubspot_updated && list.is_hubspot_updated === 'update_success')
      ) {
        return list;
      }
    });
    this.isCRMOk = false;
    if (candidateCrm && candidateCrm.length) {
      this.isCRMOk = true;
    }
    const candidateReisteredCrm = this.dataSelected.filter((list) => {
      if (
        list.candidate_admission_status !== 'registered' &&
        list.candidate_admission_status !== 'resigned' &&
        list.candidate_admission_status !== 'resigned_after_engaged' &&
        list.candidate_admission_status !== 'resigned_after_registered' &&
        list.candidate_admission_status !== 'report_inscription'
      ) {
        return list;
      }
    });
    this.isWasRegistered = false;
    if (candidateReisteredCrm && candidateReisteredCrm.length) {
      this.isWasRegistered = true;
    }
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
          this.isLoading = true;
          const payload = this.dataSelected.map((resp) => resp._id);
          // console.log(payload);
          this.subs.sink = this.candidatesService.UpdateCandidateCRMStatus(payload).subscribe(
            (resp) => {
              this.isLoading = false;
              if (resp) {
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('CANDIDAT_CRM.TITLE'),
                  html: this.translate.instant('CANDIDAT_CRM.TEXT'),
                  allowOutsideClick: false,
                  confirmButtonText: this.translate.instant('CANDIDAT_CRM.BUTTON'),
                }).then(() => {
                  this.resetSelection();
                  this.getCandidatesData('afterUpdateCandidateCRMStatus');
                });
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
              // console.log(err);
            },
          );
        }
      }
    } else {
      this.crmAllOk(this.dataSelected);
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
        this.resetSelection();
        this.getCandidatesData('afterAssignRateProfile');
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
          this.resetSelection();
          this.getCandidatesData('afterAssignRateProfile');
        }
      });
  }

  openAssignMember(data, type) {
    let dataCandidates = [];
    if (data && data._id) {
      dataCandidates = [data];
    } else {
      dataCandidates = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
      dataCandidates = _.uniqBy(dataCandidates, '_id');
    }
    if (type === 'button' && this.dataSelected && this.dataSelected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      this.assignMemberDialogComponent = this.dialog.open(AssignMemberDialogComponent, {
        width: '600px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: dataCandidates,
      });
      this.subs.sink = this.assignMemberDialogComponent.afterClosed().subscribe((resulta) => {
        if (resulta) {
          this.resetSelection();
          this.getCandidatesData('afterAssign');
        }
        this.assignMemberDialogComponent = null;
      });
    }
  }

  // intakeSelected(event) {
  //   const selected = event;
  // }
  //   if (selected !== 'All') {
  //     // this.clearSelectIfFilter();
  //     this.filteredValues.intake_channel = selected._id;
  //     this.entryWayFilter.setValue(selected.intake_channel, { emitEvent: false });
  //     this.selectedProgram = selected.intake_channel;
  //   } else {
  //     // this.clearSelectIfFilter();
  //     this.filteredValues.intake_channel = null;
  //     this.entryWayFilter.setValue(selected, { emitEvent: false });
  //     this.selectedProgram = 'All';
  //   }
  //   this.paginator.pageIndex = 0;
  //   if (!this.isReset) {
  //     this.getCandidatesData('setIntakeSelected');
  //   }
  // }

  setIntakeSelected(titleId) {
    // check if previously selected then select again, if yes then reset dropdown before filtering again
    if (titleId !== 'All' && this.filteredValues.intake_channel && this.filteredValues.intake_channel !== titleId._id) {
      // this.clearSelectIfFilter();
      this.entryWayFilterList = this.backupEntryWayFilterList;
    }

    if (titleId !== 'All') {
      // this.clearSelectIfFilter();
      this.filteredValues.intake_channel = titleId._id;
      this.selectedProgram = titleId.intake_channel;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('setIntakeSelected');
      }
    } else {
      // this.clearSelectIfFilter();
      this.filteredValues.intake_channel = '';
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData('setIntakeSelected');
      }
    }
  }

  // setTrialDate(value) {
  //   // this.clearSelectIfFilter();
  //   // Set value to searching and reset pagination index
  //   this.searching.trial_date = value;
  //   this.paginator.pageIndex = 0;
  //   if (!this.isReset) {
  //     // refetch the data after search selected
  //     this.getCandidatesData('set trial date');
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

  // enterIntakeFilter(event: MatAutocomplete) {
  //   // console.log(event);
  //   if (event && event.options && event.options.length > 1) {
  //     let titleId = '';
  //     event.options.forEach((option, optionIndex) => {
  //       if (optionIndex === 1 && option) {
  //         // console.log(option);
  //         const foundTitle = this.entryWayFilterList.find((title) => option.value === title);
  //         if (foundTitle) {
  //           titleId = foundTitle;
  //           this.entryWayFilter.setValue(foundTitle);
  //         }
  //       }
  //     });
  //     if (titleId) {
  //       this.setIntakeSelected(titleId);
  //     }
  //   } else {
  //     this.entryWayFilter.setValue('');
  //     this.setIntakeSelected(null);
  //   }
  // }

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
        // this.setProfileSelected(titleId);
      }
    } else {
      this.profileRateFilter.setValue('');
      // this.setProfileSelected(null);
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

  viewAdmissionFile(candidateId) {
    const query = { candidate: candidateId };
    const url = this.router.createUrlTree(['/session/register'], { queryParams: query });
    window.open(url.toString(), '_blank');
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
    // console.log(element);
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

  crmAllOk(data) {
    const candidateCrm = data.filter((list) => {
      // return list.announcement_email === 'not_sent';
      if (
        (list.is_oscar_updated && list.is_oscar_updated === 'update_success') ||
        (list.is_manual_updated && list.is_manual_updated === 'update_success') ||
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
        list.candidate_admission_status !== 'resigned_after_registered' &&
        list.candidate_admission_status !== 'report_inscription'
      ) {
        return list;
      }
    });
    this.isWasRegistered = false;
    if (candidateReisteredCrm && candidateReisteredCrm.length) {
      this.isWasRegistered = true;
    }
    // console.log('crmOk', this.isWasSelectAll, this.selectType);
    if (this.dataSelected && this.dataSelected.length < 1) {
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
        this.isLoading = true;
        const payload = data.map((resp) => resp._id);
        // console.log(payload);
        this.subs.sink = this.candidatesService.UpdateCandidateCRMStatus(payload).subscribe(
          (resp) => {
            this.isLoading = false;
            if (resp) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('CANDIDAT_CRM.TITLE'),
                html: this.translate.instant('CANDIDAT_CRM.TEXT'),
                allowOutsideClick: false,
                confirmButtonText: this.translate.instant('CANDIDAT_CRM.BUTTON'),
              }).then(() => {
                this.resetSelection();
                this.getCandidatesData('afterUpdateCandidateCRMStatus');
              });
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
      if (!list.announcement_email || (!list.announcement_email.sent_date && !list.announcement_email.sent_time)) {
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
    if (candidateAnnoun && candidateAnnoun.length) {
      if (candidateAnnoun.length === data.length) {
        this.isDifferentAnnoucement = false;
      } else {
        this.isDifferentAnnoucement = true;
      }
    } else {
      this.isDifferentAnnoucement = true;
    }
    if (!this.isRegistrationProfileDone) {
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
          isReadmission: false,
        },
      });
      this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
        if (result) {
          this.resetSelection();
          this.getCandidatesData('afterSendEmail');
        }
        this.sendEmailValidatorDialogComponent = null;
      });
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
                this.resetSelection();
                this.getCandidatesData('afterAssignRateProfile');
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
                this.resetSelection();
                this.getCandidatesData('afterAssignRateProfile');
              });
            }
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
      data = _.uniqBy(data, '_id');
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
                  isVolumeOfHours: false,
                },
              });
              this.subs.sink = this.assignRateProfileDialogComponent.afterClosed().subscribe((result) => {
                if (result) {
                  this.resetSelection();
                  this.getCandidatesData('afterAssignRateProfile');
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
            this.resetSelection();
            this.getCandidatesData('afterAssignRateProfile');
          }
        },
        (err) => {
          this.isLoading = false;
          this.authService.postErrorLog(err);
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
    this.campusList = [];
    this.school = [];
    this.levels = [];
    this.sectorList = [];
    this.specialityList = [];
    this.schoolName = '';
    this.campusName = '';
    this.levelName = '';
    if (this.campusFilter.value) {
      console.log(this.campusFilter);
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.schoolsFilter.value) {
      this.schoolsFilter.setValue(null);
    }
    if (this.sectorFilter.value) {
      this.sectorFilter.setValue(null);
    }
    if (this.specialityFilter.value) {
      this.specialityFilter.setValue(null);
    }
    if (!this.scholarFilter.value || this.scholarFilter.value.length === 0) {
      // this.filteredValues['scholar_season'] = '';
      this.scholarSelected = [];
      this.school = [];
      this.levels = [];
      this.campusList = [];
    } else {
      // this.filteredValues['scholar_season'] = this.scholarFilter.value;
      this.scholarSelected = this.scholarFilter.value;
      const scholarSeason = this.scholarFilter.value && this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
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
    this.levels = [];
    this.campusList = [];
    this.schoolName = '';
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
    console.log('listobjective', this.listObjective, this.schoolsFilter);
    const school = this.schoolsFilter.value;
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
        this.schoolsFilter.value &&
        this.schoolsFilter.value.length
      ) {
        this.filteredValuesSuperFilter.school = this.schoolsFilter.value;
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
    } else {
      if (school && school.length && !school.includes('AllF')) {
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
      } else if (this.listObjective && this.listObjective.length && school && school.length && school.includes('AllF')) {
        this.listObjective.filter((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.forEach((campusess, nex) => {
              this.campusList.push(campusess);
            });
          }
        });
      }
    }

    this.getDataLevel();
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
    this.levelName = '';
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
      if (sCampus && sCampus.length && !sCampus.includes('AllF') && this.campusList && this.campusList.length) {
        sCampus.forEach((element) => {
          const sName = this.campusList.find((list) => list.name === element);
          this.campusName = this.campusName ? this.campusName + ',' + sName.name : sName.name;
        });
        this.currentUser.app_data.school_package.forEach((element) => {
          if (element && element.school && element.school._id && (schools.includes(element.school._id) || schools.includes('AllF'))) {
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
      } else if (sCampus && sCampus.length && sCampus.includes('AllF')) {
        this.campusList.forEach((lev) => {
          if (lev && lev.levels && lev.levels.length) {
            this.levels = _.concat(this.levels, lev.levels);
          }
        });
      }
    } else {
      if (sCampus && sCampus.length && !sCampus.includes('AllF')) {
        sCampus.forEach((element) => {
          const sName = this.campusList.find((list) => list.name === element);
          this.campusName = this.campusName ? this.campusName + ',' + sName.name : sName.name;
        });

        const sLevelList = this.campusList.filter((list) => {
          return sCampus.includes(list.name);
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

  checkSuperFilterTags() {
    const form = this.tagFilter.value;
    if (form && form.length) {
      this.tagFilter.patchValue(form);
    } else {
      this.tagFilter.patchValue(null);
    }
  }

  getDataByLevel() {
    this.levelName = '';

    if (this.levelFilter.value && !this.levelFilter.value.includes('AllF')) {
      const sLevel = this.levelFilter.value;

      sLevel.forEach((element) => {
        const sName = this.levels.find((list) => list.name === element);
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
    let campusIds = [];
    let levelIds = [];

    this.sectorList = [];
    this.specialityList = [];
    this.sectorFilter.setValue(null);
    this.specialityFilter.setValue(null);
    this.filteredValuesSuperFilter.sectors = null;
    this.filteredValuesSuperFilter.specialities = null;

    if (this.schoolsFilter.value?.length && this.schoolsFilter.value.includes('AllF') && this.listObjective?.length) {
      allSchool = this.listObjective.map((data) => data._id);
    }
    if (this.campusFilter.value?.length && this.campusList?.length) {
      if (this.campusFilter.value.includes('AllF')) {
        allCampus = this.campusList.map((data) => data._id);
      } else {
        const campusName = this.campusFilter.value;
        campusIds = this.campusList.filter((campus) => campusName.includes(campus?.name))?.map((campus) => campus._id);
      }
    }
    if (this.levelFilter.value?.length && this.levels?.length) {
      if (this.levelFilter.value.includes('AllF')) {
        allLevel = this.levels.map((data) => data._id);
      } else {
        const levelName = this.levelFilter.value;
        levelIds = this.levels.filter((level) => levelName.includes(level.name))?.map((level) => level?._id);
      }
    }
    const filter = {
      scholar_season_id: this.scholarFilter.value && !this.scholarFilter.value?.includes('All') ? this.scholarFilter.value : null,
      candidate_school_ids: allSchool?.length ? allSchool : this.schoolsFilter.value?.length ? this.schoolsFilter.value : null,
      campuses: allCampus?.length ? allCampus : campusIds?.length ? campusIds : null,
      levels: allLevel?.length ? allLevel : levelIds?.length ? levelIds : null,
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
    let campusIds = [];
    let levelIds = [];
    let allSector = [];

    this.specialityList = [];
    this.specialityFilter.setValue(null);
    this.filteredValuesSuperFilter.specialities = null;

    if (this.schoolsFilter.value?.length && this.schoolsFilter.value.includes('AllF') && this.listObjective?.length) {
      allSchool = this.listObjective.map((data) => data._id);
    }
    if (this.campusFilter.value?.length && this.campusList?.length) {
      if (this.campusFilter.value.includes('AllF')) {
        allCampus = this.campusList.map((data) => data._id);
      } else {
        const campusName = this.campusFilter.value;
        campusIds = this.campusList.filter((campus) => campusName.includes(campus?.name))?.map((campus) => campus._id);
      }
    }
    if (this.levelFilter.value?.length && this.levels?.length) {
      if (this.levelFilter.value.includes('AllF')) {
        allLevel = this.levels.map((data) => data._id);
      } else {
        const levelName = this.levelFilter.value;
        levelIds = this.levels.filter((level) => levelName.includes(level.name))?.map((level) => level?._id);
      }
    }
    if (this.sectorFilter?.value?.length && this.sectorList?.length) {
      allSector = this.sectorList.map((sector) => sector._id);
    }
    const filter = {
      scholar_season_id: this.scholarFilter.value && !this.scholarFilter.value?.includes('All') ? this.scholarFilter.value : null,
      candidate_school_ids: allSchool?.length ? allSchool : this.schoolsFilter.value?.length ? this.schoolsFilter.value : null,
      campuses: allCampus?.length ? allCampus : campusIds?.length ? campusIds : null,
      levels: allLevel?.length ? allLevel : levelIds?.length ? levelIds : null,
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
    if (this.dataSelected && this.dataSelected.length < 1) {
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

        console.log('_masuk', data);
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
                this.resetSelection();
                this.getCandidatesData('afterSendMail');
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
                this.resetSelection();
                this.getCandidatesData('afterSendMail');
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
    console.log(notDoing1stcall);
    if (notDoing1stcall.length > 0) {
      this.isHasRegistrationProfileandCallNotDone = true;
    } else {
      this.isHasRegistrationProfileandCallNotDone = false;
    }
    const candidateAnnoun = this.dataSelected.filter((list) => {
      if (list && list.announcement_email) {
        if (list.announcement_email.sent_date || list.announcement_email.sent_time) {
          return list;
        }
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
      } else if (this.dataSelected && this.dataSelected.length < 1) {
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

        this.sendEmailValidatorDialogComponent = this.dialog.open(SendEmailValidatorDialogComponent, {
          width: '800px',
          minHeight: '300px',
          panelClass: 'no-padding',
          disableClose: true,
          data: {
            data: doneRegistrationProfle,
            isNeedValidator: false,
            isResendMail: false,
            isFc: false,
            isReadmission: false,
          },
        });
        this.subs.sink = this.sendEmailValidatorDialogComponent.afterClosed().subscribe((result) => {
          if (result) {
            this.resetSelection();
            this.getCandidatesData('afterSendEmail');
          }
          this.sendEmailValidatorDialogComponent = null;
        });
      }
    } else {
      this.firstEmailAllCandidate(this.dataSelected);
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

  csvDownloadAdmission() {
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
    this.filteredValues.type_of_formation_name = 'classic';
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const filter = this.cleanFilterDataDownload();
    const search = this.cleanSearchingDataDownload();
    let filtered;
    // console.log('filter', filter);
    // console.log('search', search);
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
    let sorting = 'sorting={}';
    if (this.sortValue) {
      sorting = 'sorting=' + JSON.stringify(this.sortValue);
    }

    const userTypesList =
      this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id.map((res) => `"` + res + `"`) : [];
    const importStudentTemlate = `downloadCandidateData/`;
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
        '&' +
        sorting +
        '&user_type_ids=[' +
        userTypesList +
        ']';
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
        '&' +
        sorting +
        '&user_type_ids=[' +
        userTypesList +
        ']';
    }
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
          }).then(() => this.resetSelection());
        } else {
          this.isLoading = false;
        }
      },
      (err) => {
        this.isLoading = false;
      },
    );
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
      element.registration_profile &&
      element.registration_profile.is_down_payment &&
      element.registration_profile.is_down_payment === 'no'
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
    } else if (element.payment && element.payment === 'chargeback') {
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
    if (element.payment === 'not_authorized') {
      return this.translate.instant('Rejecteds');
    } else if (element.payment === 'chargeback') {
      return this.translate.instant('Chargeback');
    } else if (
      (element.billing_id &&
        element.billing_id.deposit >= 0 &&
        element.billing_id.deposit_pay_amount &&
        element.billing_id.deposit_pay_amount >= element.billing_id.deposit) ||
      element?.billing_id?.deposit_status === 'paid'
    ) {
      return this.translate.instant('Paid');
    } else if (
      (element.billing_id &&
        element.billing_id.deposit >= 0 &&
        element.billing_id.deposit_pay_amount &&
        element.billing_id.deposit_pay_amount < element.billing_id.deposit) ||
      element?.billing_id?.deposit_status === 'partially_paid'
    ) {
      return this.translate.instant('Partially paid');
    } else if (element.billing_id && !element.billing_id.deposit) {
      return this.translate.instant('Not paid');
    } else {
      return this.translate.instant('Not paid');
    }
  }

  triggerCallDoneMultiple() {
    const candidateIds = this.dataSelected.filter((list) => !this.dataUnselectUser.includes(list._id)).map((resp) => resp._id);
    const notDoing1stcall = this.dataSelected.filter(
      (listData) => listData.announcement_call === 'done' && listData.registration_profile && !this.dataUnselectUser.includes(listData._id),
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
      if (this.dataSelected && this.dataSelected.length < 1) {
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
        this.isLoading = true;
        this.subs.sink = this.financeService.UpdateCandidateAnnouncementCall(candidateIds).subscribe(
          (res) => {
            this.isLoading = false;
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
                  this.resetSelection();
                  this.getCandidatesData('afterUpdateCandidateAnnouncementCall');
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
                  this.resetSelection();
                  this.getCandidatesData('afterUpdateCandidateAnnouncementCall');
                });
              }
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
    } else {
      this.isLoading = false;
      this.firstCallAllCandidate(this.dataSelected);
    }
  }

  clearSelectIfFilter() {
    this.selection?.clear();
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
  changeStatus(element) {
    const payload = {
      candidate_admission_status: element.candidate_admission_status === 'registered' ? 'report_inscription' : 'registered',
    };
    const civility = element.civility && element.civility === 'neutral' ? '' : this.translate.instant(element.civility);
    const last_name = element.last_name;
    const first_name = element.first_name;
    let timeDisabled = 3;
    if (element.candidate_admission_status === 'registered') {
      Swal.fire({
        title: this.translate.instant('INSCRIPTION_REPORT_S1.TITLE'),
        html: this.translate.instant('INSCRIPTION_REPORT_S1.TEXT', {
          candidateName: civility + ' ' + first_name + ' ' + last_name,
        }),
        type: 'warning',
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('INSCRIPTION_REPORT_S1.BUTTON_1', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
        allowOutsideClick: false,
        allowEnterKey: false,
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          const intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('INSCRIPTION_REPORT_S1.BUTTON_1') + ` (${timeDisabled})`;
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('INSCRIPTION_REPORT_S1.BUTTON_1');
            Swal.enableConfirmButton();
            clearInterval(intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      }).then((res) => {
        clearTimeout(this.timeOutVal);
        if (res.value) {
          this.updateToPostpone(element, payload);
        }
      });
    } else {
      Swal.fire({
        title: this.translate.instant('INSCRIPTION_REPORT_S2.TITLE'),
        html: this.translate.instant('INSCRIPTION_REPORT_S2.TEXT', {
          candidateName: civility + ' ' + first_name + ' ' + last_name,
        }),
        type: 'warning',
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('INSCRIPTION_REPORT_S2.BUTTON_1', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
        allowOutsideClick: false,
        allowEnterKey: false,
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          const intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('INSCRIPTION_REPORT_S2.BUTTON_1') + ` (${timeDisabled})`;
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('INSCRIPTION_REPORT_S2.BUTTON_1');
            Swal.enableConfirmButton();
            clearInterval(intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      }).then((res) => {
        clearTimeout(this.timeOutVal);
        if (res.value) {
          this.updateToPostpone(element, payload);
        }
      });
    }
  }

  updateToPostpone(element, payload) {
    this.isLoading = true;
    this.subs.sink = this.candidatesService.UpdateCandidateStatus(element._id, payload).subscribe(
      (resp) => {
        this.isLoading = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('CANDIDAT_S4.BUTTON'),
        }).then((resss) => {
          this.resetSelection();
          this.getCandidatesData('afterAssignRateProfile');
        });
      },
      (err) => {
        this.isLoading = true;
        this.authService.postErrorLog(err);
        if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('LEGAL_S5.Title'),
            text: this.translate.instant('LEGAL_S5.Text'),
            confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
          });
        } else if (
          err['message'] === 'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
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

  setStatusFilter(status?: string) {
    // check if previously selected then select again, if yes then reset dropdown before filtering again
    const previousFilter = this.studentStatusFilter.value;
    if ((status && status === 'All') || (previousFilter && previousFilter.length === 0)) {
      // this.clearSelectIfFilter();
      if (previousFilter && previousFilter.length > 0) {
        const all = ['All'];
        this.studentStatusFilter.setValue(all);
      }
      this.filteredValues.candidate_admission_status = null;
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
      // this.clearSelectIfFilter();
      this.filteredValues.candidate_admission_status = null;
      this.filteredValues.candidate_admission_statuses = this.studentStatusFilter.value;
      this.paginator.pageIndex = 0;
      this.getCandidatesData('setStatusFIlter selected');
    }
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

    }
  }
  // ************************ Below is function for all button above table candidate FI
  getAllIdForCheckbox(pageNumber, action) {
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
            .getAllFiIdForCheckbox(pagination, this.sortValue, filter, this.searching, userTypesList)
            .subscribe(
              (students: any) => {
                if (students && students.length) {
                  const resp = _.cloneDeep(students);
                  this.allExportForCheckbox = _.concat(this.allExportForCheckbox, resp);
                  const page = pageNumber + 1;
                  this.getAllIdForCheckbox(page, action);
                } else {
                  this.isLoading = false;
                  if (this.isCheckedAll) {
                    if (this.allExportForCheckbox && this.allExportForCheckbox.length) {
                      this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                      this.allCandidateData = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                      this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                      console.log('getAllIdForCheckbox', this.dataSelected);
                      if (this.dataSelected && this.dataSelected.length) {
                        this.csvDownloadAdmission();
                      }
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
        }
      } else {
        this.csvDownloadAdmission();
      }
    }
  }
  getDataCrmOk(pageNumber, action) {
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
        this.subs.sink = this.candidatesService.getFIDataCrmOk(pagination, this.sortValue, filter, this.searching, userTypesList).subscribe(
          (students: any) => {
            if (students && students.length) {
              const resp = _.cloneDeep(students);
              this.allCRMForCheckbox = _.concat(this.allCRMForCheckbox, resp);
              const page = pageNumber + 1;
              this.getDataCrmOk(page, action);
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
        this.crmOk();
      }
    }
  }
  getDataRegisProfil(pageNumber, action) {
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
          .getFIDataRegisProfil(pagination, this.sortValue, filter, this.searching, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allRegisForCheckbox = _.concat(this.allRegisForCheckbox, resp);
                const page = pageNumber + 1;
                this.getDataRegisProfil(page, action);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allRegisForCheckbox && this.allRegisForCheckbox.length) {
                  this.dataSelected = this.allRegisForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.allCandidateData = this.allRegisForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  console.log('getFIDataRegisProfil', this.dataSelected);
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length) {
                    this.openAssignRateProfile('', 'button');
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
        this.openAssignRateProfile(this.dataSelected, 'button');
      }
    }
  }
  getDataForCall(pageNumber, action) {
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
          .getFIDataForCall(pagination, this.sortValue, filter, this.searching, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allCallForCheckbox = _.concat(this.allCallForCheckbox, resp);
                const page = pageNumber + 1;
                this.getDataForCall(page, action);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allCallForCheckbox && this.allCallForCheckbox.length) {
                  this.dataSelected = this.allCallForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.allCandidateData = this.allCallForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  console.log('getFIDataForCall', this.dataSelected);
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length) {
                    this.triggerCallDoneMultiple();
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
        this.triggerCallDoneMultiple();
      }
    }
  }
  getDataForFirstMail(pageNumber, action) {
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
          .getFIDataForFirstMail(pagination, this.sortValue, filter, this.searching, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allAnnoucmentForCheckbox = _.concat(this.allAnnoucmentForCheckbox, resp);
                const page = pageNumber + 1;
                this.getDataForFirstMail(page, action);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allAnnoucmentForCheckbox && this.allAnnoucmentForCheckbox.length) {
                  this.dataSelected = this.allAnnoucmentForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.allCandidateData = this.allAnnoucmentForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  console.log('getFIDataForFirstMail', this.dataSelected);
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length) {
                    this.triggerAnnouncementMultiple();
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
        this.triggerAnnouncementMultiple();
      }
    }
  }
  getFIDataForDevMember(pageNumber, action) {
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
          .getFIDataForDevMember(pagination, this.sortValue, filter, this.searching, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allMemberForCheckbox = _.concat(this.allMemberForCheckbox, resp);
                const page = pageNumber + 1;
                this.getFIDataForDevMember(page, action);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allMemberForCheckbox && this.allMemberForCheckbox.length) {
                  this.dataSelected = this.allMemberForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.allCandidateData = this.allMemberForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  console.log('getFIDataRegisProfil', this.dataSelected);
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length) {
                    this.openAssignMember('', 'button');
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
        this.openAssignMember(this.dataSelected, 'button');
      }
    }
  }
  getFIDataForSendMail(pageNumber, action) {
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
          .getFIDataForSendMail(pagination, this.sortValue, filter, this.searching, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allEmailForCheckbox = _.concat(this.allEmailForCheckbox, resp);
                const page = pageNumber + 1;
                this.getFIDataForSendMail(page, action);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allEmailForCheckbox && this.allEmailForCheckbox.length) {
                  this.dataSelected = this.allEmailForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.allCandidateData = this.allEmailForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  console.log('getFIDataForFirstMail', this.dataSelected);
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
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
  compareUnselectStudent(row) {
    let isChecked = false;
    if (this.isCheckedAll) {
      isChecked = true;
      if (this.dataUnselectUser.includes(row._id)) {
        isChecked = false;
      }
    }
    return isChecked;
  }

  controllerButton(action) {
    switch (action) {
      case 'export':
        setTimeout(() => {
          this.getAllIdForCheckbox(0, 'export');
        }, 500);
        break;
      case 'regis':
        setTimeout(() => {
          this.getDataRegisProfil(0, 'regis');
        }, 500);
        break;
      case 'announcment':
        setTimeout(() => {
          this.getDataForFirstMail(0, 'announcment');
        }, 500);
        break;
      case 'email':
        setTimeout(() => {
          this.getFIDataForSendMail(0, 'email');
        }, 500);
        break;
      case 'call':
        setTimeout(() => {
          this.getDataForCall(0, 'call');
        }, 500);
        break;
      case 'member':
        setTimeout(() => {
          this.getFIDataForDevMember(0, 'member');
        }, 500);
        break;
      case 'crm':
        setTimeout(() => {
          this.getDataCrmOk(0, 'crm');
        }, 500);
        break;
      default:
        this.resetCandidate();
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
    if (filterItem.type === 'super_filter') {
      this.filteredValuesSuperFilter[filterItem?.name] = null;
      this.filteredValues[filterItem?.name] = null;
    } else if (filterItem.type === 'table_filter') {
      this.filteredValues[filterItem?.name] = null;
    }
    if (filterItem?.name === 'scholar_season' && filterItem.type === 'super_filter') {
      this.scholarFilter.patchValue('All');
      this.filteredValues.school = null;
      this.filteredValues.campus = null;
      this.filteredValues.level = null;
      this.filteredValues.sectors = null;
      this.filteredValues.specialities = null;
      this.scholarSelect();
    } else if (filterItem?.name === 'school' && filterItem.type === 'super_filter') {
      this.schoolsFilter.patchValue(null);
      this.filteredValues.campus = null;
      this.filteredValues.level = null;
      this.filteredValues.sectors = null;
      this.filteredValues.specialities = null;
      this.selectSchoolFilter();
    } else if (filterItem?.name === 'campus' && filterItem.type === 'super_filter') {
      this.campusFilter.patchValue(null);
      this.filteredValues.level = null;
      this.filteredValues.sectors = null;
      this.filteredValues.specialities = null;
      this.selectCampusFilter();
    } else if (filterItem?.name === 'level' && filterItem.type === 'super_filter') {
      this.levelFilter.patchValue(null);
      this.filteredValues.sectors = null;
      this.filteredValues.specialities = null;
      this.selectLevelFilter();
    } else if (filterItem?.name === 'sectors' && filterItem.type === 'super_filter') {
      this.sectorFilter.patchValue(null);
      this.filteredValues.specialities = null;
      this.selectSectorFilter();
    } else if (filterItem?.name === 'specialities' && filterItem.type === 'super_filter') {
      this.specialityFilter.patchValue(null);
      this.selectSpecialityFilter();
    } else if (filterItem.column === 'AdmissionFollowUp.Down payment') {
      filterItem.filterRef.patchValue('AllM', { emitEvent: false });
    } else if (filterItem.name === 'registration_profile_status') {
      filterItem.filterRef.patchValue(['All']);
    } else {
      if (filterItem.name === 'admission_document_process_status') {
        this.admissionDocumentFilter.setValue('AllF');
      } else if (filterItem.name === 'trial_date') {
        this.searching.trial_date = '';
        this.trialDateCtrl.setValue(this.translate.instant('All'));
        this.filteredTrialDateList = of(this.trialDateList);
      } else if (filterItem.name === 'announcement_call') {
        this.announcementCallFilter.setValue('AllF');
      } else if (filterItem.name === 'registration_email_date') {
        this.announcementEmailFilter.setValue('AllF');
      } else if (filterItem.name === 'candidate_admission_statuses') {
        this.studentStatusFilter.setValue(['All']);
      } else if (filterItem.name === 'candidate_admission_status') {
        this.studentStatusFilter.setValue(['All']);
      } else if (filterItem.name === 'personal_information') {
        this.personalInfoFilter.setValue('AllF');
      } else if (filterItem.name === 'connection') {
        this.connectionFilter.setValue('AllF');
      } else if (filterItem.name === 'method_of_payment') {
        this.paymentMethodFilter.setValue('AllF');
      } else if (filterItem.name === 'is_oscar_updated') {
        this.crmFilter.setValue('AllF');
      } else if (filterItem.name === 'is_admitted') {
        this.conditionFilter.setValue('All');
      } else if (filterItem.name === 'signature') {
        this.signatureFilter.setValue('AllF');
      } else if (filterItem.name === 'payment_method') {
        this.downPaymentFilter.setValue('AllF');
      } else {
        filterItem.filterRef.patchValue(filterItem.isMultiple ? [filterItem.resetValue] : filterItem.resetValue, { emitEvent: false });
      }
    }
    this.clearSelectIfFilter();
    this.getCandidatesData('resetCandidate');
  }

  filterBreadcrumbFormat() {
    const statusAdmission = this.studentStatusFilter.value;
    const regisProfile = this.filteredValues.registration_profile_status;
    const optionAll = ['All'];
    const conditionList = this.admittedFilterList.map((data) => {
      return {
        key: data.key,
        value: data.value === 'Admitted' ? 'true' : data.value === 'Not admitted' ? 'false' : data.value,
      };
    });
    const filterInfo = [
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'scholar_season', // name of the key in the object storing the filter
        column: 'CARDDETAIL.Scholar Season', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.scholars, // the array/list holding the dropdown options
        filterRef: this.scholarFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'scholar_season', // the key displayed in the html (only applicable to array of objects)
        savedValue: '_id', // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'super_filter',
        name: 'school',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.School',
        isMultiple: true,
        filterValue: this.school?.length === this.schoolsFilter?.value?.length ? this.filteredValuesAll :this.filteredValues,
        filterList: this.school?.length === this.schoolsFilter?.value?.length ? null : this.school,
        filterRef: this.schoolsFilter,
        displayKey: this.school?.length === this.schoolsFilter?.value?.length ? null : 'short_name',
        savedValue: this.school?.length === this.schoolsFilter?.value?.length ? null : '_id',
        isSelectionInput: this.school?.length === this.schoolsFilter?.value?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'campus',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus',
        isMultiple: true,
        filterValue: this.campusList?.length === this.campusFilter?.value?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.campusList?.length === this.campusFilter?.value?.length ? null : this.campusList,
        filterRef:  this.campusFilter,
        displayKey: this.campusList?.length === this.campusFilter?.value?.length ? null : 'name',
        savedValue: this.campusList?.length === this.campusFilter?.value?.length ? null : 'name',
        isSelectionInput: this.campusList?.length === this.campusFilter?.value?.length ? false :true,
      },
      {
        type: 'super_filter',
        name: 'level',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level',
        isMultiple: true,
        filterValue: this.levels?.length === this.levelFilter?.value?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.levels?.length === this.levelFilter?.value?.length ? null : this.levels,
        filterRef:  this.levelFilter,
        displayKey: this.levels?.length === this.levelFilter?.value?.length ? null :'name',
        savedValue: this.levels?.length === this.levelFilter?.value?.length ? null :'name',
        isSelectionInput: this.levels?.length === this.levelFilter?.value?.length ? false :true,
      },
      {
        type: 'super_filter',
        name: 'sectors',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Sector',
        isMultiple: true,
        filterValue: this.sectorList?.length === this.sectorFilter?.value?.length ? this.filteredValuesAll : this.filteredValuesSuperFilter,
        filterList: this.sectorList?.length === this.sectorFilter?.value?.length ? null : this.sectorList,
        filterRef:  this.sectorFilter,
        displayKey: this.sectorList?.length === this.sectorFilter?.value?.length ? null : 'name',
        savedValue: this.sectorList?.length === this.sectorFilter?.value?.length ? null : '_id',
        isSelectionInput: this.sectorList?.length === this.sectorFilter?.value?.length ? false :true,
      },
      {
        type: 'super_filter',
        name: 'specialities',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Speciality',
        isMultiple: true,
        filterValue: this.specialityList?.length === this.specialityFilter?.value?.length ? this.filteredValuesAll : this.filteredValuesSuperFilter,
        filterList: this.specialityList?.length === this.specialityFilter?.value?.length ? null : this.specialityList,
        displayKey: this.specialityList?.length === this.specialityFilter?.value?.length ? null : 'name',
        filterRef: this.specialityFilter,
        savedValue: this.specialityList?.length === this.specialityFilter?.value?.length ? null : '_id',
        isSelectionInput: this.specialityList?.length === this.specialityFilter?.value?.length ? false : true,
      },
      // Table Filters below
      {
        type: 'table_filter',
        name: 'candidate_unique_number',
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
        name: 'candidate',
        column: 'AdmissionFollowUp.Name',
        isMultiple: false,
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
        name: 'nationalities',
        column: 'AdmissionFollowUp.Nationality',
        isMultiple: this.nationalityFilter?.value?.length === this.nationalityFilterList?.length ? false : true,
        filterValue:
          this.nationalityFilter?.value?.length === this.nationalityFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.nationalityFilter?.value?.length === this.nationalityFilterList?.length ? null : this.nationalityFilterList,
        filterRef: this.nationalityFilter,
        displayKey: this.nationalityFilter?.value?.length === this.nationalityFilterList?.length ? null : 'value',
        savedValue: this.nationalityFilter?.value?.length === this.nationalityFilterList?.length ? null : 'value',
        isSelectionInput: this.nationalityFilter?.value?.length === this.nationalityFilterList?.length ? false : true,
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'intake_channels',
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
        name:
          statusAdmission?.length && JSON.stringify(statusAdmission) !== JSON.stringify(optionAll)
            ? 'candidate_admission_statuses'
            : 'candidate_admission_status',
        column: 'AdmissionFollowUp.Status',
        isMultiple: true,
        filterValue: this.studentStatusFilterList?.length === this.studentStatusFilter?.value?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.studentStatusFilterList?.length === this.studentStatusFilter?.value?.length ? null : this.studentStatusFilterList,
        filterRef: this.studentStatusFilter,
        displayKey: this.studentStatusFilterList?.length === this.studentStatusFilter?.value?.length ? null : 'key',
        savedValue: this.studentStatusFilterList?.length === this.studentStatusFilter?.value?.length ? null :'value',
        isSelectionInput: this.studentStatusFilterList?.length === this.studentStatusFilter?.value?.length ? false : true,
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
        name: 'announcement_calls',
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
        name: 'registration_email_dates',
        column: 'AdmissionFollowUp.Registration Email',
        isMultiple: this.announcementEmailFilterList?.length === this.announcementEmailFilter?.value?.length ? false : true,
        filterValue: this.announcementEmailFilterList?.length === this.announcementEmailFilter?.value?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.announcementEmailFilterList?.length === this.announcementEmailFilter?.value?.length ? null : this.announcementEmailFilterList,
        filterRef: this.announcementEmailFilter,
        displayKey: this.announcementEmailFilterList?.length === this.announcementEmailFilter?.value?.length ? null : 'key',
        savedValue: this.announcementEmailFilterList?.length === this.announcementEmailFilter?.value?.length ? null : 'value',
        isSelectionInput: this.announcementEmailFilterList?.length === this.announcementEmailFilter?.value?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'connections',
        column: 'AdmissionFollowUp.Connection',
        isMultiple: this.connectionFilterList?.length === this.connectionFilter?.value?.length ? false : true,
        filterValue: this.connectionFilterList?.length === this.connectionFilter?.value?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.connectionFilterList?.length === this.connectionFilter?.value?.length ? null : this.connectionFilterList ,
        filterRef: this.connectionFilter,
        displayKey:  this.connectionFilterList?.length === this.connectionFilter?.value?.length ? null :'key',
        savedValue:  this.connectionFilterList?.length === this.connectionFilter?.value?.length ? null :'value',
        isSelectionInput:  this.connectionFilterList?.length === this.connectionFilter?.value?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'personal_informations',
        column: 'AdmissionFollowUp.Identity',
        isMultiple: this.personalInfoFilterList?.length === this.personalInfoFilter?.value?.length ? false : true,
        filterValue: this.personalInfoFilterList?.length === this.personalInfoFilter?.value?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.personalInfoFilterList?.length === this.personalInfoFilter?.value?.length ? null : this.personalInfoFilterList,
        filterRef: this.personalInfoFilter,
        displayKey: this.personalInfoFilterList?.length === this.personalInfoFilter?.value?.length ? null : 'key',
        savedValue: this.personalInfoFilterList?.length === this.personalInfoFilter?.value?.length ? null : 'value',
        isSelectionInput: this.personalInfoFilterList?.length === this.personalInfoFilter?.value?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'method_of_payments',
        column: 'AdmissionFollowUp.Payment mode',
        isMultiple: this.paymentMethodFilterList?.length ===  this.paymentMethodFilter?.value?.length ? false : true,
        filterValue: this.paymentMethodFilterList?.length ===  this.paymentMethodFilter?.value?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.paymentMethodFilterList?.length ===  this.paymentMethodFilter?.value?.length ? null :this.paymentMethodFilterList,
        filterRef: this.paymentMethodFilter,
        displayKey: this.paymentMethodFilterList?.length ===  this.paymentMethodFilter?.value?.length ? null : 'key',
        savedValue: this.paymentMethodFilterList?.length ===  this.paymentMethodFilter?.value?.length ? null : 'value',
        isSelectionInput: this.paymentMethodFilterList?.length ===  this.paymentMethodFilter?.value?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'is_admitteds',
        column: 'AdmissionFollowUp.Conditions',
        isMultiple: conditionList?.length ===  this.conditionFilter?.value?.length ? false : true,
        filterValue: conditionList?.length ===  this.conditionFilter?.value?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: conditionList?.length ===  this.conditionFilter?.value?.length ? null : conditionList,
        filterRef: this.conditionFilter,
        displayKey: conditionList?.length ===  this.conditionFilter?.value?.length ? null :'key',
        savedValue: conditionList?.length ===  this.conditionFilter?.value?.length ? null : 'value',
        isSelectionInput: conditionList?.length ===  this.conditionFilter?.value?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'signatures',
        column: 'AdmissionFollowUp.School contract',
        isMultiple: this.signatureFilterList?.length ===  this.signatureFilter?.value?.length ? false : true,
        filterValue: this.signatureFilterList?.length ===  this.signatureFilter?.value?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.signatureFilterList?.length ===  this.signatureFilter?.value?.length ? null : this.signatureFilterList,
        filterRef: this.signatureFilter,
        displayKey: this.signatureFilterList?.length ===  this.signatureFilter?.value?.length ? null : 'key',
        savedValue: this.signatureFilterList?.length ===  this.signatureFilter?.value?.length ? null : 'value',
        isSelectionInput: this.signatureFilterList?.length ===  this.signatureFilter?.value?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'payment_methods',
        column: 'AdmissionFollowUp.Down payment method',
        isMultiple: this.downPaymentFilterList?.length ===  this.downPaymentFilter?.value?.length ? false : true,
        filterValue: this.downPaymentFilterList?.length ===  this.downPaymentFilter?.value?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.downPaymentFilterList?.length ===  this.downPaymentFilter?.value?.length ? null : this.downPaymentFilterList,
        filterRef: this.downPaymentFilterList,
        displayKey: this.downPaymentFilterList?.length ===  this.downPaymentFilter?.value?.length ? null : 'key',
        savedValue: this.downPaymentFilterList?.length ===  this.downPaymentFilter?.value?.length ? null : 'value',
        isSelectionInput: this.downPaymentFilterList?.length ===  this.downPaymentFilter?.value?.length ? false : true,
      },

      {
        type: 'table_filter',
        name: this.filteredValues.payment ? 'payment' : 'is_deposit_paids',
        column: 'AdmissionFollowUp.Down payment',
        isMultiple: this.DPFilterList?.length ===  this.paymentFilter?.value?.length ? false : true,
        filterValue: this.DPFilterList?.length ===  this.paymentFilter?.value?.length ? this.filteredValuesAll :this.filteredValues,
        filterList: this.DPFilterList?.length ===  this.paymentFilter?.value?.length ? null : this.DPFilterList,
        filterRef: this.paymentFilter,
        displayKey: this.DPFilterList?.length ===  this.paymentFilter?.value?.length ? null : 'label',
        savedValue: this.DPFilterList?.length ===  this.paymentFilter?.value?.length ? null : 'value',
        isSelectionInput: this.DPFilterList?.length ===  this.paymentFilter?.value?.length ? false : true,
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
        name: 'registration_email_due_date',
        column: 'AdmissionFollowUp.Due date',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.dueDateFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'trial_dates',
        column: 'Trial date',
        isMultiple: this.trialDateList?.length === this.trialDateCtrl?.value?.length ? false : true,
        filterValue: this.trialDateList?.length === this.trialDateCtrl?.value?.length ? this.filteredValuesAll : this.searching,
        filterList: this.trialDateList?.length === this.trialDateCtrl?.value?.length ? null : this.trialDateList,
        filterRef: this.trialDateCtrl,
        displayKey: this.trialDateList?.length === this.trialDateCtrl?.value?.length ? null : 'label',
        savedValue: this.trialDateList?.length === this.trialDateCtrl?.value?.length ? null : 'value',
        isSelectionInput: this.trialDateList?.length === this.trialDateCtrl?.value?.length ? false : true,
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
      },
      {
        type: 'table_filter',
        name: 'is_oscar_updateds',
        column: 'CRM',
        isMultiple: this.listCrm?.length ===  this.crmFilter?.value?.length ? false : true,
        filterValue: this.listCrm?.length ===  this.crmFilter?.value?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.listCrm?.length ===  this.crmFilter?.value?.length ? null : this.listCrm,
        filterRef: this.crmFilter,
        displayKey: this.listCrm?.length ===  this.crmFilter?.value?.length ? null : 'key',
        savedValue: this.listCrm?.length ===  this.crmFilter?.value?.length ? null : 'value',
        isSelectionInput: this.listCrm?.length ===  this.crmFilter?.value?.length ? false : true,
      },
    ];

    const filterSingle = (mainArray, selectedValue, savedValue, displayKey): string => {
      return mainArray?.find((item) => item[savedValue] === selectedValue)?.[displayKey];
    };

    const filterMultiple = (mainArray, refArray, savedValue, displayKey): any[] => {
      return mainArray?.filter((item) => refArray?.includes(item[savedValue]))?.map((filteredItem) => filteredItem[displayKey]);
    };

    const getKey = (filterItem: FilterBreadCrumbInput) => {
      const value =
        typeof filterItem?.filterValue?.[filterItem?.name] === 'boolean'
          ? String(filterItem?.filterValue?.[filterItem.name])
          : filterItem.filterValue[filterItem.name];
      const isMultiple = filterItem.isMultiple;
      const isSelection = filterItem.isSelectionInput;

      if (!value) {
        return null;
      } // if no value returns null
      if (!isSelection) {
        return value;
      } // if it is a normal non-dropdown input, return the existing value
      return isMultiple
        ? filterMultiple(filterItem.filterList, filterItem.filterValue[filterItem?.name], filterItem.savedValue, filterItem.displayKey)
        : filterSingle(filterItem.filterList, value, filterItem.savedValue, filterItem.displayKey);
    };
    console.log('filterInfo', filterInfo);
    filterInfo.forEach((filterItem: any) => {
      const value: string | any[] =
        typeof filterItem?.filterValue?.[filterItem.name] === 'boolean'
          ? String(filterItem?.filterValue?.[filterItem.name])
          : filterItem?.filterValue?.[filterItem.name];
      const newFilterEntry = {
        type: filterItem.type,
        name: filterItem.name,
        column: filterItem.column,
        value: value || null,
        key: getKey(filterItem),
        noTranslate: filterItem?.noTranslate,
        isMultiple: filterItem.isMultiple,
        filterRef: filterItem.filterRef,
      };
      this.filterBreadcrumb(newFilterEntry);
    });
  }
  isAllDropdownSelected(type) {
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
    }  else if (type === 'tags') {
      const selected = this.tagFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.tagList.length;
    } else if (type === 'downPayment') {
      const selected = this.paymentFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPFilterList.length;
      return isAllSelected;
    } else if (type === 'nationality') {
      const selected = this.nationalityFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.nationalityFilterList.length;
      return isAllSelected;
    } else if (type === 'intakeChannel') {
      const selected = this.nationalityFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.entryWayFilterList.length;
      return isAllSelected;
    } else if (type === 'studentStatus') {
      const selected = this.studentStatusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.studentStatusFilterList.length;
      return isAllSelected;
    } else if (type === 'announcement_call') {
      const selected = this.announcementCallFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.announcementCallFilterList.length;
      return isAllSelected;
    } else if (type === 'connections') {
      const selected = this.connectionFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.connectionFilterList.length;
      return isAllSelected;
    } else if (type === 'personal') {
      const selected = this.personalInfoFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.personalInfoFilterList.length;
      return isAllSelected;
    } else if (type === 'conditions') {
      const selected = this.conditionFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.admittedFilterList.length;
      return isAllSelected;
    } else if (type === 'signature') {
      const selected = this.signatureFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.signatureFilterList.length;
      return isAllSelected;
    } else if (type === 'downPaymentMethod') {
      const selected = this.downPaymentFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.downPaymentFilterList.length;
      return isAllSelected;
    } else if (type === 'paymentMethod') {
      const selected = this.paymentMethodFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.paymentMethodFilterList.length;
      return isAllSelected;
    } else if (type === 'admissionDocument') {
      const selected = this.admissionDocumentFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listAdmission.length;
      return isAllSelected;
    } else if (type === 'oscarStatus') {
      const selected = this.crmFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listCrm.length;
      return isAllSelected;
    } else if (type === 'trialDates') {
      const selected = this.trialDateCtrl.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.trialDateList.length;
      return isAllSelected;
    } else if (type === 'profilRate') {
      const selected = this.profileRateFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.profileRateFilterList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
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
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.tagList.length;
    } else if (type === 'downPayment') {
      const selected = this.paymentFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPFilterList.length;
      return isIndeterminate;
    } else if (type === 'nationality') {
      const selected = this.nationalityFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.nationalityFilterList.length;
      return isIndeterminate;
    } else if (type === 'intakeChannel') {
      const selected = this.entryWayFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.entryWayFilterList.length;
      return isIndeterminate;
    } else if (type === 'studentStatus') {
      const selected = this.studentStatusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.studentStatusFilterList.length;
      return isIndeterminate;
    } else if (type === 'announcement_call') {
      const selected = this.announcementCallFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.announcementCallFilterList.length;
      return isIndeterminate;
    } else if (type === 'connections') {
      const selected = this.connectionFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.connectionFilterList.length;
      return isIndeterminate;
    } else if (type === 'personal') {
      const selected = this.personalInfoFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.personalInfoFilterList.length;
      return isIndeterminate;
    } else if (type === 'conditions') {
      const selected = this.conditionFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.admittedFilterList.length;
      return isIndeterminate;
    } else if (type === 'signature') {
      const selected = this.signatureFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.signatureFilterList.length;
      return isIndeterminate;
    } else if (type === 'downPaymentMethod') {
      const selected = this.downPaymentFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.downPaymentFilterList.length;
      return isIndeterminate;
    } else if (type === 'paymentMethod') {
      const selected = this.paymentMethodFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.paymentMethodFilterList.length;
      return isIndeterminate;
    } else if (type === 'admissionDocument') {
      const selected = this.admissionDocumentFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listAdmission.length;
      return isIndeterminate;
    } else if (type === 'oscarStatus') {
      const selected = this.crmFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listCrm.length;
      return isIndeterminate;
    } else if (type === 'trialDates') {
      const selected = this.trialDateCtrl.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.trialDateList.length;
      return isIndeterminate;
    } else if (type === 'profilRate') {
      const selected = this.profileRateFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.profileRateFilterList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
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
        const tagsData = this.tagList.map((el) => el._id);
        this.tagFilter.patchValue(tagsData, { emitEvent: false });
      } else {
        this.tagFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'downPayment') {
      if (event.checked) {
        const resultData = this.DPFilterList.map((el) => el.value);
        this.paymentFilter.patchValue(resultData, { emitEvent: false });
      } else {
        this.paymentFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'nationality') {
      if (event.checked) {
        const resultData = this.nationalityFilterList.map((el) => el.value);
        this.nationalityFilter.patchValue(resultData, { emitEvent: false });
      } else {
        this.nationalityFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'intakeChannel') {
      if (event.checked) {
        const resultData = this.entryWayFilterList.map((el) => el._id);
        this.entryWayFilter.patchValue(resultData, { emitEvent: false });
      } else {
        this.entryWayFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'studentStatus') {
      if (event.checked) {
        const resultData = this.studentStatusFilterList.map((el) => el.value);
        this.studentStatusFilter.patchValue(resultData, { emitEvent: false });
      } else {
        this.studentStatusFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'announcement_call') {
      if (event.checked) {
        const resultData = this.announcementCallFilterList.map((el) => el.value);
        this.announcementCallFilter.patchValue(resultData, { emitEvent: false });
      } else {
        this.announcementCallFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'announcement_email') {
      if (event.checked) {
        const resultData = this.announcementEmailFilterList.map((el) => el.value);
        this.announcementEmailFilter.patchValue(resultData, { emitEvent: false });
      } else {
        this.announcementEmailFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'connections') {
      if (event.checked) {
        const resultData = this.connectionFilterList.map((el) => el.value);
        this.connectionFilter.patchValue(resultData, { emitEvent: false });
      } else {
        this.connectionFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'personal') {
      if (event.checked) {
        const resultData = this.personalInfoFilterList.map((el) => el.value);
        this.personalInfoFilter.patchValue(resultData, { emitEvent: false });
      } else {
        this.personalInfoFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'conditions') {
      if (event.checked) {
        const resultData = this.admittedFilterList.map((el) => el.value);
        this.conditionFilter.patchValue(resultData, { emitEvent: false });
      } else {
        this.conditionFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'signature') {
      if (event.checked) {
        const resultData = this.signatureFilterList.map((el) => el.value);
        this.signatureFilter.patchValue(resultData, { emitEvent: false });
      } else {
        this.signatureFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'downPaymentMethod') {
      if (event.checked) {
        const resultData = this.downPaymentFilterList.map((el) => el.value);
        this.downPaymentFilter.patchValue(resultData, { emitEvent: false });
      } else {
        this.downPaymentFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'paymentMethod') {
      if (event.checked) {
        const resultData = this.paymentMethodFilterList.map((el) => el.value);
        this.paymentMethodFilter.patchValue(resultData, { emitEvent: false });
      } else {
        this.paymentMethodFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'admissionDocument') {
      if (event.checked) {
        const resultData = this.listAdmission.map((el) => el.value);
        this.admissionDocumentFilter.patchValue(resultData, { emitEvent: false });
      } else {
        this.admissionDocumentFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'oscarStatus') {
      if (event.checked) {
        const resultData = this.listCrm.map((el) => el.value);
        this.crmFilter.patchValue(resultData, { emitEvent: false });
      } else {
        this.crmFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'trialDates') {
      if (event.checked) {
        const resultData = this.trialDateList.map((el) => el.value);
        this.trialDateCtrl.patchValue(resultData, { emitEvent: false });
      } else {
        this.trialDateCtrl.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'profilRate') {
      if (event.checked) {
        const resultData = this.profileRateFilterList.map((el) => el._id);
        this.profileRateFilter.patchValue(resultData, { emitEvent: false });
      } else {
        this.profileRateFilter.patchValue(null, { emitEvent: false });
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
          this.getCandidatesData('paymentFilter');
        }
      } else {
        if (this.tempDataFilter.downPayments?.length && this.paymentFilter.value?.length && !filteredPayment?.length) {
          this.filteredValues.payments = null;
          this.tempDataFilter.downPayments = this.paymentFilter.value;
          if (!this.isReset) {
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
          this.getCandidatesData('paymentFilter');
        }
      } else {
        if (this.tempDataFilter.downPayments?.length && this.paymentFilter.value?.length && !filteredDeposit?.length) {
          this.filteredValues.is_deposit_paids = null;
          this.tempDataFilter.downPayments = this.paymentFilter.value;
          if (!this.isReset) {
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
        this.getCandidatesData('paymentFilter');
      }
    }
  }

  setNationalityFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.nationality) === JSON.stringify(this.nationalityFilter.value);
    if (isSame) {
      return;
    } else if (this.nationalityFilter.value?.length) {
      this.filteredValues.nationalities = this.nationalityFilter.value;
      this.tempDataFilter.nationality = this.nationalityFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('nationalityFilter');
      }
    } else {
      if (this.tempDataFilter.nationality?.length && !this.nationalityFilter.value?.length) {
        this.filteredValues.nationalities = this.nationalityFilter.value;
        this.tempDataFilter.nationality = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('nationalityFilter');
        }
      } else {
        return;
      }
    }
  }

  setIntakeChannelFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.intakeChannels) === JSON.stringify(this.entryWayFilter.value);
    if (isSame) {
      return;
    } else if (this.entryWayFilter.value?.length) {
      this.filteredValues.intake_channels = this.entryWayFilter.value;
      this.tempDataFilter.intakeChannels = this.entryWayFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('entryWayFilter');
      }
    } else {
      if (this.tempDataFilter.intakeChannels?.length && !this.entryWayFilter.value?.length) {
        this.filteredValues.intake_channels = this.entryWayFilter.value;
        this.tempDataFilter.intakeChannels = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('entryWayFilter');
        }
      } else {
        return;
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

  setAnnouncementCallFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.announcementCall) === JSON.stringify(this.announcementCallFilter.value);
    if (isSame) {
      return;
    } else if (this.announcementCallFilter.value?.length) {
      this.filteredValues.announcement_calls = this.announcementCallFilter.value;
      this.tempDataFilter.announcementCall = this.announcementCallFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('announcementCallFilter');
      }
    } else {
      if (this.tempDataFilter.announcementCall?.length && !this.announcementCallFilter.value?.length) {
        this.filteredValues.announcement_calls = this.announcementCallFilter.value;
        this.tempDataFilter.announcementCall = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('announcementCallFilter');
        }
      } else {
        return;
      }
    }
  }

  setAnnouncementEmailFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.announcementEmail) === JSON.stringify(this.announcementEmailFilter.value);
    if (isSame) {
      return;
    } else if (this.announcementEmailFilter.value?.length) {
      this.filteredValues.registration_email_dates = this.announcementEmailFilter.value;
      this.tempDataFilter.announcementEmail = this.announcementEmailFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('announcementEmailFilter');
      }
    } else {
      if (this.tempDataFilter.announcementEmail?.length && !this.announcementEmailFilter.value?.length) {
        this.filteredValues.registration_email_dates = this.announcementEmailFilter.value;
        this.tempDataFilter.announcementEmail = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('announcementEmailFilter');
        }
      } else {
        return;
      }
    }
  }

  setConnectionsFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.connections) === JSON.stringify(this.connectionFilter.value);
    if (isSame) {
      return;
    } else if (this.connectionFilter.value?.length) {
      this.filteredValues.connections = this.connectionFilter.value;
      this.tempDataFilter.connections = this.connectionFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('connectionFilter');
      }
    } else {
      if (this.tempDataFilter.connections?.length && !this.connectionFilter.value?.length) {
        this.filteredValues.connections = this.connectionFilter.value;
        this.tempDataFilter.connections = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('connectionFilter');
        }
      } else {
        return;
      }
    }
  }

  setIdentityFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.identity) === JSON.stringify(this.personalInfoFilter.value);
    if (isSame) {
      return;
    } else if (this.personalInfoFilter.value?.length) {
      this.filteredValues.personal_informations = this.personalInfoFilter.value;
      this.tempDataFilter.identity = this.personalInfoFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('personalInfoFilter');
      }
    } else {
      if (this.tempDataFilter.identity?.length && !this.personalInfoFilter.value?.length) {
        this.filteredValues.personal_informations = this.personalInfoFilter.value;
        this.tempDataFilter.identity = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('personalInfoFilter');
        }
      } else {
        return;
      }
    }
  }

  setConditionFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.conditions) === JSON.stringify(this.conditionFilter.value);
    if (isSame) {
      return;
    } else if (this.conditionFilter.value?.length) {
      this.filteredValues.is_admitteds = this.conditionFilter.value;
      this.tempDataFilter.conditions = this.conditionFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('conditionFilter');
      }
    } else {
      if (this.tempDataFilter.conditions?.length && !this.conditionFilter.value?.length) {
        this.filteredValues.is_admitteds = this.conditionFilter.value;
        this.tempDataFilter.conditions = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('conditionFilter');
        }
      } else {
        return;
      }
    }
  }

  setSignatureFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.schoolContract) === JSON.stringify(this.signatureFilter.value);
    if (isSame) {
      return;
    } else if (this.signatureFilter.value?.length) {
      this.filteredValues.signatures = this.signatureFilter.value;
      this.tempDataFilter.schoolContract = this.signatureFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('signatureFilter');
      }
    } else {
      if (this.tempDataFilter.schoolContract?.length && !this.signatureFilter.value?.length) {
        this.filteredValues.signatures = this.signatureFilter.value;
        this.tempDataFilter.schoolContract = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('signatureFilter');
        }
      } else {
        return;
      }
    }
  }

  setDownPaymentMethodFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.downPaymentMethod) === JSON.stringify(this.downPaymentFilter.value);
    if (isSame) {
      return;
    } else if (this.downPaymentFilter.value?.length) {
      this.filteredValues.payment_methods = this.downPaymentFilter.value;
      this.tempDataFilter.downPaymentMethod = this.downPaymentFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('downPaymentFilter');
      }
    } else {
      if (this.tempDataFilter.downPaymentMethod?.length && !this.downPaymentFilter.value?.length) {
        this.filteredValues.payment_methods = this.downPaymentFilter.value;
        this.tempDataFilter.downPaymentMethod = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('downPaymentFilter');
        }
      } else {
        return;
      }
    }
  }

  setPaymentMethodFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.paymentMethods) === JSON.stringify(this.paymentMethodFilter.value);
    if (isSame) {
      return;
    } else if (this.paymentMethodFilter.value?.length) {
      this.filteredValues.method_of_payments = this.paymentMethodFilter.value;
      this.tempDataFilter.paymentMethods = this.paymentMethodFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('paymentMethodFilter');
      }
    } else {
      if (this.tempDataFilter.paymentMethods?.length && !this.paymentMethodFilter.value?.length) {
        this.filteredValues.method_of_payments = this.paymentMethodFilter.value;
        this.tempDataFilter.paymentMethods = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('paymentMethodFilter');
        }
      } else {
        return;
      }
    }
  }

  setAdmissionDocumentStatusFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.admissionDocumentStatus) === JSON.stringify(this.admissionDocumentFilter.value);
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

  setOscarStatusFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.oscarStatus) === JSON.stringify(this.crmFilter.value);
    if (isSame) {
      return;
    } else if (this.crmFilter.value?.length) {
      this.filteredValues.is_oscar_updateds = this.crmFilter.value;
      this.tempDataFilter.oscarStatus = this.crmFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('crmFilter');
      }
    } else {
      if (this.tempDataFilter.oscarStatus?.length && !this.crmFilter.value?.length) {
        this.filteredValues.is_oscar_updateds = this.crmFilter.value;
        this.tempDataFilter.oscarStatus = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('crmFilter');
        }
      } else {
        return;
      }
    }
  }

  setTrialDatesFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.trialDates) === JSON.stringify(this.trialDateCtrl.value);
    if (isSame) {
      return;
    } else if (this.trialDateCtrl.value?.length) {
      this.searching.trial_dates = this.trialDateCtrl.value;
      this.tempDataFilter.trialDates = this.trialDateCtrl.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCandidatesData('trialDateCtrl');
      }
    } else {
      if (this.tempDataFilter.trialDates?.length && !this.trialDateCtrl.value?.length) {
        this.searching.trial_dates = this.trialDateCtrl.value;
        this.tempDataFilter.trialDates = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCandidatesData('trialDateCtrl');
        }
      } else {
        return;
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
      } else if (element?.billing_id?.deposit_status === 'not_billed' && element?.payment === 'no_down_payment' || this.checkIfDoesntHaveAnyDP(element)) {
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
