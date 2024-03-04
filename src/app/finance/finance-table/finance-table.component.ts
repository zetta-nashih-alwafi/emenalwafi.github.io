import { FilterBreadCrumbItem } from './../../models/bread-crumb-filter.model';
import { FilterBreadCrumbInput } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { SpecialCaseReasonComponent } from './../../shared/components/special-case-reason/special-case-reason.component';
import { SelectionModel } from '@angular/cdk/collections';
import { DpRegulationDialogComponent } from 'app/shared/components/dp-regulation-dialog/dp-regulation-dialog.component';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewChecked,
  AfterContentChecked,
  OnChanges,
} from '@angular/core';
import { FormControl, UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AddPaymentDialogComponent } from 'app/internship-file/add-payment-dialog/add-payment-dialog.component';
import { InternshipCallDialogComponent } from 'app/internship-file/internship-call-dialog/internship-call-dialog.component';
import { InternshipWhatsappDialogComponent } from 'app/internship-file/internship-whatsapp-dialog/internship-whatsapp-dialog.component';
import { TermsAmountDialogComponent } from 'app/internship-file/tems-amount-dialog/tems-amount-dialog.component';
import { FinancesService } from 'app/service/finance/finance.service';
import * as moment from 'moment';
import { SubSink } from 'subsink';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { BlockStudentsDialogComponent } from 'app/internship-file/block-students-dialog/block-students-dialog.component';
import Swal from 'sweetalert2';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { UtilityService } from 'app/service/utility/utility.service';
import { environment } from 'environments/environment';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { CoreService } from 'app/service/core/core.service';
import { TermPaymentService } from 'app/term-payment/term-payment.service';
import { SendMultipleEmailComponent } from 'app/internship-file/send-multiple-email/send-multiple-email.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { MonthTermDetailsDialogComponent } from 'app/candidate-file/candidate-card-details/month-term-details-dialog/month-term-details-dialog.component';
import { StudentsTableService } from 'app/students-table/StudentTable.service';
import { ExportControllingReportDialogComponent } from './export-controlling-report-dialog/export-controlling-report-dialog.component';
@Component({
  selector: 'ms-finance-table',
  templateUrl: './finance-table.component.html',
  styleUrls: ['./finance-table.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class FinanceTableComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked, AfterContentChecked, OnChanges {
  private subs = new SubSink();
  today: Date;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  isLoading = false;
  dataCount = 0;
  noData;
  selectType: any;
  disabledExport = true;
  isTerm1 = false;
  isTerm2 = false;
  isTerm3 = false;
  isTerm4 = false;
  isTerm5 = false;
  isTerm6 = false;
  isTerm7 = false;
  isTerm8 = false;
  isTerm9 = false;
  isTerm10 = false;
  isTerm11 = false;
  isTerm12 = false;
  isDeposit = false;
  isNonPlan = false;
  sortValue = null;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  userSelected: any[];
  userSelectedId: any[];
  isCheckedAll = false;
  tagList = [];
  listFilter = [];
  dataSelectedAll: any;
  previousLength = 0;

  displayedColumns: string[] = [
    'select',
    'accountNumber',
    'student',
    'currentProgram',
    'typeOfRegistration',
    'legalEntity',
    'profileFinance',
    'status',
    'type',
    'profileRate',
    'paymentMethod',
    'sponsorFinance',
    'specialCase',
    'latestAskForPayment',
    'totalAmount',
    'amountBilled',
    'amountPaid',
    'remainingDue',
    'amountLate',
    'accumulatedLate',
    'deposit',
    'notRespected',
    'notSettled',
    'term1',
    'term2',
    'term3',
    'term4',
    'term5',
    'term6',
    'term7',
    'term8',
    'term9',
    'term10',
    'term11',
    'term12',
    'action',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'accountNumberFilter',
    'studentFilter',
    'currentProgramFilter',
    'typeOfRegistrationFilter',
    'legalEntityFilter',
    'profileFinanceFilter',
    'statusFilter',
    'typeFilter',
    'profileRateFilter',
    'paymentMethodFilter',
    'sponsorFinanceFilter',
    'specialCaseFilter',
    'latestAskForPaymentFilter',
    'totalAmountFilter',
    'amountBilledFilter',
    'amountPaidFilter',
    'remainingDueFilter',
    'amountLateFilter',
    'accumulatedLateFilter',
    'depositFilter',
    'notRespectedFilter',
    'notSettledFilter',
    'term1Filter',
    'term2Filter',
    'term3Filter',
    'term4Filter',
    'term5Filter',
    'term6Filter',
    'term7Filter',
    'term8Filter',
    'term9Filter',
    'term10Filter',
    'term11Filter',
    'term12Filter',
    'actionFilter',
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

  maleIcon = '../../../assets/img/student_icon.png';
  femaleIcon = '../../../assets/img/student_icon_fem.png';
  greenHeartIcon = '../../../assets/img/enagement_icon_green.png';
  flagsIconPath = '../../../assets/icons/flags-nationality/';
  shieldAccountIcon = '../../../assets/img/shield-account.png';
  schoolName = '';
  campusName = '';
  levelName = '';
  listTerm = [];
  filteredValues = {
    intake_channel: '',
    intake_channels: null,
    student_type: null,
    student_types: null,
    candidate_last_name: '',
    payment_method: '',
    payment_methods: null,
    financial_profile: null,
    financial_profiles: null,
    candidate_admission_status: null,
    candidate_admission_statuses: null,
    deposit_done: null,
    term_count: null,
    term_counts: null,
    term_paid: '',
    scholar_season_id: '',
    school_id: '',
    campus: '',
    level: '',
    tags: '',
    account_number: '',
    financial_profile_not_respected: null,
    financial_support_last_name: null,
    modality_step_special_form_status: null,
    modality_step_special_form_statuses: null,
    down_payment_status: null,
    down_payment_statuses: null,
    first_term_status: null,
    second_term_status: null,
    third_term_status: null,
    fourth_term_status: null,
    fifth_term_status: null,
    sixth_term_status: null,
    seventh_term_status: null,
    eighth_term_status: null,
    ninth_term_status: null,
    tenth_term_status: null,
    eleventh_term_status: null,
    twelveth_term_status: null,
    first_term_statuses: null,
    second_term_statuses: null,
    third_term_statuses: null,
    fourth_term_statuses: null,
    fifth_term_statuses: null,
    sixth_term_statuses: null,
    seventh_term_statuses: null,
    eighth_term_statuses: null,
    ninth_term_statuses: null,
    tenth_term_statuses: null,
    eleventh_term_statuses: null,
    twelveth_term_statuses: null,
    term_from: null,
    term_to: null,
    term_status: null,
    legal_entity_name: '',
    legal_entity_names: null,
    pay_n2: null,
    pay_n2s: null,
    offset: moment().utcOffset(),
    sectors: '',
    specialities: '',
    type_of_registration: null,
    type_of_registrations: null,
    is_have_special_case: null,
    is_have_special_cases: null,
    schools: null,
  };

  filteredValuesAll = {
    intake_channel: 'All',
    intake_channels: 'All',
    student_type: 'All',
    student_types: 'All',
    candidate_last_name: 'All',
    payment_method: 'All',
    payment_methods: 'All',
    financial_profile: 'All',
    financial_profiles: 'All',
    candidate_admission_status: 'All',
    candidate_admission_statuses: 'All',
    deposit_done: 'All',
    term_count: 'All',
    term_counts: 'All',
    term_paid: 'All',
    scholar_season_id: 'All',
    school_id: 'All',
    campus: 'All',
    level: 'All',
    tags: 'All',
    account_number: 'All',
    financial_profile_not_respected: 'All',
    financial_support_last_name: 'All',
    modality_step_special_form_status: 'All',
    modality_step_special_form_statuses: 'All',
    down_payment_status: 'All',
    down_payment_statuses: 'All',
    first_term_status: 'All',
    second_term_status: 'All',
    third_term_status: 'All',
    fourth_term_status: 'All',
    fifth_term_status: 'All',
    sixth_term_status: 'All',
    seventh_term_status: 'All',
    eighth_term_status: 'All',
    ninth_term_status: 'All',
    tenth_term_status: 'All',
    eleventh_term_status: 'All',
    twelveth_term_status: 'All',
    first_term_statuses: 'All',
    second_term_statuses: 'All',
    third_term_statuses: 'All',
    fourth_term_statuses: 'All',
    fifth_term_statuses: 'All',
    sixth_term_statuses: 'All',
    seventh_term_statuses: 'All',
    eighth_term_statuses: 'All',
    ninth_term_statuses: 'All',
    tenth_term_statuses: 'All',
    eleventh_term_statuses: 'All',
    twelveth_term_statuses: 'All',
    term_from: 'All',
    term_to: 'All',
    term_status: 'All',
    legal_entity_name: 'All',
    legal_entity_names: 'All',
    pay_n2: 'All',
    pay_n2s: 'All',
    offset: moment().utcOffset(),
    sectors: 'All',
    specialities: 'All',
    type_of_registration: 'All',
    type_of_registrations: 'All',
    is_have_special_cases: 'All',
  };

  superFilter = {
    level: '',
    tags: '',
    campus: '',
    school_id: '',
    scholar_season_id: '',
    sectors: '',
    specialities: '',
  };

  typeFilterList = [];

  paymentFilterList = [
    { value: 'All', key: 'AllS' },
    { value: 'Credit Card', key: 'Credit Card' },
    { value: 'Transfer', key: 'Transfer' },
    { value: 'Cheque', key: 'Cheque' },
  ];
  paymentInformationFilterList = [];
  specialCaseFilterList = [
    { value: true, key: 'Yes' },
    { value: false, key: 'No' },
  ];
  financeFilterList = [];
  programFilterList = [
    { value: 'All', key: 'AllS' },
    { value: '20-21 EFAPAR 1', key: '20-21 EFAPAR 1' },
    { value: '21-22 EFATOU 2', key: '21-22 EFATOU 2' },
    { value: '20-21 ICABOR 1', key: '20-21 ICABOR 1' },
  ];

  connectionFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: 'uploaded', key: 'Uploaded' },
    { value: 'approved', key: 'Approved' },
    { value: 'rejected', key: 'Rejected' },
  ];

  internProfileFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: 'approved', key: 'Approved' },
    { value: 'rejected', key: 'Rejected' },
    { value: 'published', key: 'Published' },
    { value: 'unpublished', key: 'Unpublished' },
  ];

  listOfLegalEntity: any;
  legalEntityFilter = new UntypedFormControl(null);
  schoolsFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  levelFilter = new UntypedFormControl(null);
  tagFilter = new UntypedFormControl(null);
  scholarFilter = new UntypedFormControl('All');
  sectorFilter = new UntypedFormControl(null);
  specialityFilter = new UntypedFormControl(null);
  currentProgramFilter = new UntypedFormControl(null);
  typeFilter = new UntypedFormControl(null);
  studentFilter = new UntypedFormControl('');
  accountFilter = new UntypedFormControl('');
  paymentFilter = new UntypedFormControl(null);
  paymentInformationFilter = new UntypedFormControl(null);
  specialCaseFilter = new UntypedFormControl(null);
  profileRateFilter = new UntypedFormControl(null);
  financialFilter = new UntypedFormControl(null);
  studentStatusFilter = new UntypedFormControl(null);
  latestAskForPaymentFilter = new UntypedFormControl(null);
  campusList = [];
  listObjective = [];
  levels = [];
  school = [];
  scholars = [];
  sectorList = [];
  specialityList = [];
  scholarSelected = [];
  studentType = [];
  paymentMode = [];
  intakeList = [];
  filteredCurrentProgram: Observable<any[]>;
  year: string;
  yearPlusOne: string;
  dataTableTerms: any;
  selectedProgram: string;
  financialSupportFilter = new UntypedFormControl('');
  depositFilter = new UntypedFormControl(null);
  terms1Filter = new UntypedFormControl(null);
  terms2Filter = new UntypedFormControl(null);
  terms3Filter = new UntypedFormControl(null);
  terms4Filter = new UntypedFormControl(null);
  terms5Filter = new UntypedFormControl(null);
  terms6Filter = new UntypedFormControl(null);
  terms7Filter = new UntypedFormControl(null);
  terms8Filter = new UntypedFormControl(null);
  terms9Filter = new UntypedFormControl(null);
  terms10Filter = new UntypedFormControl(null);
  terms11Filter = new UntypedFormControl(null);
  terms12Filter = new UntypedFormControl(null);
  filteredFinancialSupport: Observable<any[]>;
  financialSupportList = [];
  studentStatusFilterList = [];
  DPandTermsFilterList = [];

  DPFilterList = [];

  statusFilterList = [
    { value: 'All', key: 'All' },
    { value: 'not_billed', key: 'Not billed' },
    { value: 'billed', key: 'Generated' },
    { value: 'partially_paid', key: 'Partially paid' },
    { value: 'paid', key: 'Paid' },
  ];

  latestAskForPaymentFilterList: any = [];

  currentUser: any;
  isPermission: any;
  currentUserTypeId: any;
  allStudentForCheckbox = [];
  allBillingForCheckbox = [];
  allEmailForCheckbox = [];
  allExportForCheckbox = [];
  allExportOfAllLinesForCheckbox = [];
  dataSelected = [];
  buttonClicked = '';

  fromDateFilter = new UntypedFormControl(null);
  toDateFilter = new UntypedFormControl(null);
  statusFilter = new UntypedFormControl('All');
  hasNoTerms: boolean;
  campusListBackup = [];
  dataUnselectUser = [];
  isDisabled = true;
  schoolFiltered;
  campusFiltered;
  levelFiltered;
  filterBreadcrumbData = [];

  sendMultipleEmailComponent: MatDialogRef<SendMultipleEmailComponent>;
  private timeOutVal: any;

  type_of_registration = new UntypedFormControl(null);
  type_of_registrations = [];

  tempDataFilter = {
    currentProgram: null,
    is_have_special_cases: null,
    legalEntity: null,
    financialProfile: null,
    status: null,
    type: null,
    admissionProfile: null,
    paymentMethod: null,
    paymentInformation: null,
    latestAskForPayment: null,
    typeOfRegistration: null,
    deposit: null,
    terms1: null,
    terms2: null,
    terms3: null,
    terms4: null,
    terms5: null,
    terms6: null,
    terms7: null,
    terms8: null,
    terms9: null,
    terms10: null,
    terms11: null,
    terms12: null,
  };
  isNoDepositPaidAndSomeHistoriesDifferent: boolean = false;

  exportFilteredValues;

  changeDueDateAmountTermPermission = [
    'registered',
    'no_show', 
    'resigned_after_registered', 
    'resignation_missing_prerequisites', 
    'resign_after_school_begins'
  ]
  constructor(
    private pageTitleService: PageTitleService,
    private candidatesService: CandidatesService,
    private router: Router,
    private dialog: MatDialog,
    private translate: TranslateService,
    private financeService: FinancesService,
    private cdr: ChangeDetectorRef,
    private utilService: UtilityService,
    private studentService: StudentsTableService,
    private userService: AuthService,
    public permission: PermissionService,
    private coreService: CoreService,
    private termPaymentService: TermPaymentService,
    private httpClient: HttpClient,
    private parseUtcToLocal: ParseUtcToLocalPipe,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    this.getTypesList();
    this.getPaymentModeList();
    this.getFinanceProfileList();
    this.getPaymentInformationList();
    this.getStudentStatusList();
    this.getDownPaymentList();
    this.getTermOptionList();
    this.getLatestPaymentsList();
    this.getTypeOfRegistrationList();
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.year = moment().format('YYYY');
    this.yearPlusOne = moment().add('1', 'y').format('YYYY');
    this.pageTitleService.setTitle('Follow Up Student');
    this.today = new Date();
    this.initFilter();
    this.getDataBilling('First');
    this.getDataScholarSeasons();
    this.getDataTerms();
    this.getDataTags();
    this.sortingFilterOption();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.sortingFilterOption();
      this.getLegalEntityForDropdown();
      this.getTypesList();
      this.getPaymentModeList();
      this.getFinanceProfileList();
      this.getPaymentInformationList();
      this.getStudentStatusList();
      this.getDownPaymentList();
      this.getTermOptionList();
      this.getLatestPaymentsList();
      this.getTypeOfRegistrationList();
      this.getDataTerms();
      // if (
      //   this.currentProgramFilter.value &&
      //   (this.currentProgramFilter.value.trim() === 'All' || this.currentProgramFilter.value.trim() === 'Tous') &&
      //   !this.filteredValues.intake_channel
      // ) {
      //   this.currentProgramFilter.patchValue(this.translate.instant('All'));
      // }
      this.getDataScholarSeasons();
    });
    this.getLegalEntityForDropdown();
    this.getFinancialDropdownList();
    if (this.scholarFilter.value) {
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }
  }

  getTypeOfRegistrationList() {
    this.type_of_registrations = [
      {
        value: 'admission',
        label: this.translate.instant('perimeter.admission'),
      },
      {
        value: 'readmission',
        label: this.translate.instant('perimeter.readmission'),
      },
    ];

    this.type_of_registrations = this.type_of_registrations.sort((a, b) => a.label.toLowerCase().localeCompare(b.label));
  }

  getLatestPaymentsList() {
    this.latestAskForPaymentFilterList = [
      { label: 'Sent', value: 'sent', key: this.translate.instant('Sent') },
      { label: 'Not sent', value: 'not_sent', key: this.translate.instant('Not sent') },
      { label: 'Today', value: 'today', key: this.translate.instant('Today') },
      { label: 'Yesterday', value: 'yesterday', key: this.translate.instant('Yesterday') },
      { label: 'Last 7 days', value: 'last_7_days', key: this.translate.instant('Last 7 days') },
      { label: 'Last 30 days', value: 'last_30_days', key: this.translate.instant('Last 30 days') },
      { label: 'This month', value: 'this_month', key: this.translate.instant('This month') },
    ];
  }

  getTermOptionList() {
    this.DPandTermsFilterList = [
      { value: 'not_billed', key: 'Not billed', label: this.translate.instant('Not billed') },
      { value: 'billed', key: 'Billed', label: this.translate.instant('Billed') },
      { value: 'partially_paid', key: 'Partially paid', label: this.translate.instant('Partially paid') },
      { value: 'paid', key: 'Paid', label: this.translate.instant('Paid') },
      { value: 'pending', key: 'Pending', label: this.translate.instant('Pending') },
      { value: 'not_authorised', key: 'rejected', label: this.translate.instant('rejected') },
      { value: 'chargeback', key: 'chargeback', label: this.translate.instant('chargeback') },
    ];
  }

  getDownPaymentList() {
    this.DPFilterList = [
      { value: 'paid', key: 'Paid', label: this.translate.instant('DP_Status.paid') },
      { value: 'not_paid', key: 'Not Paid', label: this.translate.instant('DP_Status.not_paid') },
      { value: 'pending', key: 'Pending', label: this.translate.instant('DP_Status.pending') },
      { value: 'rejected', key: 'Rejected', label: this.translate.instant('DP_Status.rejected') },
      { value: 'billed', key: 'Billed', label: this.translate.instant('DP_Status.billed') },
      { value: 'not_billed', key: 'Not billed', label: this.translate.instant('DP_Status.not_billed') },
      { value: 'partialy_paid', key: 'Partially paid', label: this.translate.instant('DP_Status.partialy_paid') },
    ];

    this.DPFilterList = this.DPFilterList.sort((a, b) => a.label.toLowerCase().localeCompare(b.label));
  }

  getStudentStatusList() {
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
      { value: 'financement_validated', key: 'Financement valided', label: this.translate.instant('Financement valided') },
      { value: 'registered', key: 'Registered', label: this.translate.instant('Registered') },
      { value: 'resigned', key: 'Resigned', label: this.translate.instant('Resigned') },
      { value: 'resigned_after_engaged', key: 'Resigned after engaged', label: this.translate.instant('Resigned after engaged') },
      { value: 'mission_card_validated', key: 'mission_card_validated', label: this.translate.instant('mission_card_validated') },
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

    this.studentStatusFilterList = this.studentStatusFilterList.sort((a, b) => a.label.toLowerCase().localeCompare(b.label));
  }

  getPaymentInformationList() {
    this.paymentInformationFilterList = [
      {
        value: 'no_modality_payment',
        key: 'no_modality_payment',
        label: this.translate.instant('PAYMENT_INFORMATION.no_modality_payment'),
      },
      { value: 'sent', key: 'sent', label: this.translate.instant('PAYMENT_INFORMATION.sent') },
      { value: 'completed', key: 'completed', label: this.translate.instant('PAYMENT_INFORMATION.completed') },
    ];

    this.paymentInformationFilterList = this.paymentInformationFilterList.sort((a, b) => a.label.toLowerCase().localeCompare(b.label));
  }

  getFinanceProfileList() {
    this.financeFilterList = [
      { value: 'excellent', key: 'Excellent', label: this.translate.instant('Excellent') },
      { value: 'good', key: 'Bon', label: this.translate.instant('Bon') },
      { value: 'bad', key: 'Mauvais', label: this.translate.instant('Mauvais') },
      { value: 'doubtful', key: 'Douteux', label: this.translate.instant('Douteux') },
      { value: 'litigation', key: 'Contentieux', label: this.translate.instant('Contentieux') },
    ];

    this.financeFilterList = this.financeFilterList.sort((a, b) => a.label.toLowerCase().localeCompare(b.label));
  }

  getTypesList() {
    this.typeFilterList = [
      { value: 'classic', key: 'classic', label: this.translate.instant('type_formation.classic') },
      {
        value: 'continuous_total_funding',
        key: 'continuous_total_funding',
        label: this.translate.instant('type_formation.continuous_total_funding'),
      },
      {
        value: 'continuous_partial_funding',
        key: 'continuous_partial_funding',
        label: this.translate.instant('type_formation.continuous_partial_funding'),
      },
      {
        value: 'continuous_personal_funding',
        key: 'continuous_personal_funding',
        label: this.translate.instant('type_formation.continuous_personal_funding'),
      },
      {
        value: 'continuous_contract_pro',
        key: 'continuous_contract_pro',
        label: this.translate.instant('type_formation.continuous_contract_pro'),
      },
    ];

    this.typeFilterList = this.typeFilterList.sort((a, b) => a.label.toLowerCase().localeCompare(b.label));
  }

  getPaymentModeList() {
    this.paymentMode = [
      { value: 'not_done', key: 'not_done', label: this.translate.instant('not_done') },
      { value: 'check', key: 'Check', label: this.translate.instant('Check') },
      { value: 'transfer', key: 'Transfer', label: this.translate.instant('Transfer') },
      { value: 'credit_card', key: 'Credit card', label: this.translate.instant('Credit card') },
      { value: 'sepa', key: 'SEPA', label: this.translate.instant('SEPA') },
      { value: 'cash', key: 'Cash', label: this.translate.instant('Cash') },
    ];

    this.paymentMode = this.paymentMode.sort((a, b) => a.label.toLowerCase().localeCompare(b.label));
  }

  getDataTags() {
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService.getAllTags(true, 'finance_student', userTypesList, this.candidate_admission_statuses).subscribe(
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
  sortingFilterOption() {
    this.financeFilterList = _.cloneDeep(
      this.financeFilterList.sort((a, b) =>
        this.utilService?.simpleDiacriticSensitiveRegex(this.translate.instant(a?.key)) >
        this.utilService?.simpleDiacriticSensitiveRegex(this.translate.instant(b?.key))
          ? 1
          : -1,
      ),
    );
    this.studentStatusFilterList = _.cloneDeep(
      this.studentStatusFilterList.sort((a, b) =>
        this.utilService?.simpleDiacriticSensitiveRegex(this.translate.instant(a?.key)) >
        this.utilService?.simpleDiacriticSensitiveRegex(this.translate.instant(b?.key))
          ? 1
          : -1,
      ),
    );
    this.paymentMode = _.cloneDeep(
      this.paymentMode.sort((a, b) =>
        this.utilService?.simpleDiacriticSensitiveRegex(this.translate.instant(a?.key)) >
        this.utilService?.simpleDiacriticSensitiveRegex(this.translate.instant(b?.key))
          ? 1
          : -1,
      ),
    );

    this.paymentInformationFilterList = _.cloneDeep(
      this.paymentInformationFilterList.sort((a, b) =>
        this.utilService?.simpleDiacriticSensitiveRegex(this.translate.instant('PAYMENT_INFORMATION.' + a?.key)) >
        this.utilService?.simpleDiacriticSensitiveRegex(this.translate.instant('PAYMENT_INFORMATION.' + b?.key))
          ? 1
          : -1,
      ),
    );

    this.DPFilterList = _.cloneDeep(
      this.DPFilterList.sort((a, b) =>
        this.utilService?.simpleDiacriticSensitiveRegex(this.translate.instant('DP_Status.' + a?.value)) >
        this.utilService?.simpleDiacriticSensitiveRegex(this.translate.instant('DP_Status.' + b?.value))
          ? 1
          : -1,
      ),
    );

    this.DPandTermsFilterList = _.cloneDeep(
      this.DPandTermsFilterList.sort((a, b) =>
        this.utilService?.simpleDiacriticSensitiveRegex(this.translate.instant(a?.key)) >
        this.utilService?.simpleDiacriticSensitiveRegex(this.translate.instant(b?.key))
          ? 1
          : -1,
      ),
    );

    this.specialCaseFilterList = this.specialCaseFilterList.sort((a,b) => {
      return this.translate.instant((a?.key)).localeCompare(this.translate.instant((b?.key)))
    })
  }

  getProgramDropdownList() {
    const filter = {
      schools: this.superFilter?.school_id?.length ? this.superFilter.school_id : null,
      campuses: this.superFilter?.campus?.length ? this.superFilter.campus : null,
      levels: this.superFilter?.level?.length ? this.superFilter.level : null,
      scholar_season_id: this.superFilter?.scholar_season_id ? this.superFilter.scholar_season_id : null,
    };
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.financeService.getAllProgramBillingDropdown(filter, userTypesList).subscribe(
      (res: any) => {
        if (res) {
          const response = _.cloneDeep(res);
          const programs = response.map((data) => {
            return {
              _id: data._id,
              program:
                data.scholar_season_id && data.scholar_season_id.scholar_season
                  ? data.scholar_season_id.scholar_season + ' ' + data.program
                  : data.program,
            };
          });
          this.intakeList = _.uniqBy(programs, '_id');
          this.intakeList = this.intakeList.sort((intakeA, intakeB) => {
            if (this.utilService.simplifyRegex(intakeA.program) < this.utilService.simplifyRegex(intakeB.program)) {
              return -1;
            } else if (this.utilService.simplifyRegex(intakeA.program) > this.utilService.simplifyRegex(intakeB.program)) {
              return 1;
            } else {
              return 0;
            }
          });
          this.filteredCurrentProgram = of(this.intakeList);

          this.listFilter = response;
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
  }

  getFinancialDropdownList() {
    this.subs.sink = this.financeService.GetFinancialSupportsDropdown().subscribe(
      (res) => {
        if (res) {
          this.financialSupportList = res.sort((a, b) => a - b);
          this.filteredFinancialSupport = of(this.financialSupportList);
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

  ngOnChanges() {}

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }
  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getDataBilling('ngAfterViewInit');
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return this.isCheckedAll ? true : numSelected === numRows;
  }

  setCurrentProgramFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    const isSame = JSON.stringify(this.tempDataFilter.currentProgram) === JSON.stringify(this.currentProgramFilter.value);
    if (isSame) {
      return;
    } else if (this.currentProgramFilter.value?.length) {
      this.filteredValues.intake_channels = this.currentProgramFilter.value;
      this.tempDataFilter.currentProgram = this.currentProgramFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getDataBilling('currentProgramFilter');
      }
    } else {
      if (this.tempDataFilter.currentProgram?.length && !this.currentProgramFilter.value?.length) {
        this.filteredValues.intake_channels = this.currentProgramFilter.value;
        this.tempDataFilter.currentProgram = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('currentProgramFilter');
        }
      } else {
        return;
      }
    }
  }

  initFilter() {
    this.subs.sink = this.currentProgramFilter.valueChanges.subscribe((statusSearch) => {
      if (typeof statusSearch === 'string') {
        const result = this.intakeList.filter((program) =>
          this.utilService.simplifyRegex(program.program).includes(this.utilService.simplifyRegex(statusSearch)),
        );
        // console.log(result);
        this.filteredCurrentProgram = of(result);
      }
    });

    // this.subs.sink = this.typeFilter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.student_type = statusSearch === 'All' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('typeFilter');
    //   }
    // });

    // this.subs.sink = this.financialFilter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.financial_profile = statusSearch === 'All' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('financialFilter');
    //   }
    // });

    // this.subs.sink = this.paymentFilter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.payment_method = statusSearch === 'All' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('paymentFilter');
    //   }
    // });

    // this.subs.sink = this.paymentInformationFilter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.modality_step_special_form_status = statusSearch === 'All' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('paymentInformationFilter');
    //   }
    // });

    // this.subs.sink = this.profileRateFilter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.term_count = statusSearch === 'All' ? '' : parseInt(statusSearch);
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('profileRateFilter');
    //   }
    // });

    // this.subs.sink = this.specialCaseFilter.valueChanges.subscribe((statusSearch) => {
      // this.selection.clear();
      // this.dataSelected = [];
      // this.isCheckedAll = false;
      // this.userSelected = [];
      // this.userSelectedId = [];
      // this.filteredValues.is_have_special_case = statusSearch === 'All' ? '' : statusSearch === 'Yes' ? true : false;
      // this.paginator.pageIndex = 0;
      // if (!this.isReset) {
      //   this.getDataBilling('specialCase');
      // }
    // });

    this.subs.sink = this.studentFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch === '') {
          this.studentFilter.setValue(null, { emitEvent: false });
          this.filteredValues.candidate_last_name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getDataBilling('studentFilter 1');
          }
        }
        this.filteredValues.candidate_last_name = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataBilling('studentFilter 2');
        }
      } else {
        this.studentFilter.setValue(null, { emitEvent: false });
        this.filteredValues.candidate_last_name = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataBilling('studentFilter 3');
        }
      }
    });
    this.subs.sink = this.financialSupportFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch === '') {
          this.studentFilter.setValue(null, { emitEvent: false });
          this.filteredValues.financial_support_last_name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getDataBilling('studentFilter 1');
          }
        }
        this.filteredValues.financial_support_last_name = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataBilling('studentFilter 2');
        }
      } else {
        this.studentFilter.setValue(null, { emitEvent: false });
        this.filteredValues.financial_support_last_name = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataBilling('studentFilter 3');
        }
      }
    });
    this.subs.sink = this.accountFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch.length < 0) {
          return;
        } else if (statusSearch === '') {
          this.accountFilter.setValue(null, { emitEvent: false });
          this.filteredValues.account_number = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getDataBilling('accountFilter 1');
          }
        }
        this.filteredValues.account_number = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataBilling('accountFilter 2');
        }
      } else {
        this.accountFilter.setValue(null, { emitEvent: false });
        this.filteredValues.account_number = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataBilling('accountFilter 3');
        }
      }
    });
    this.subs.sink = this.schoolsFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.level = '';
      this.superFilter.campus = '';
      this.superFilter.school_id = statusSearch === '' ? '' : statusSearch;
      this.isDisabled = false;
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.level = '';
      // if(!this.isDisabled){
      //   this.superFilter.level = '';
      // }
      this.superFilter.campus = statusSearch === '' ? '' : statusSearch;
      this.isDisabled = false;
    });

    this.subs.sink = this.levelFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.level = statusSearch === '' ? '' : statusSearch;
      this.isDisabled = false;
    });

    this.subs.sink = this.tagFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.tags = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
      this.isDisabled = false;
    });

    this.subs.sink = this.tagFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.tags = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
      if (statusSearch) {
        this.isDisabled = false;
      }
    });

    this.subs.sink = this.scholarFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.level = '';
      this.superFilter.campus = '';
      this.superFilter.school_id = '';
      this.superFilter.scholar_season_id = statusSearch === '' || (statusSearch === 'All' && this.isReset) ? '' : statusSearch;
      this.isDisabled = false;
    });
    this.subs.sink = this.sectorFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.sectors = statusSearch === '' || (statusSearch && statusSearch.includes('AllF')) ? '' : statusSearch;
    });
    this.subs.sink = this.specialityFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.specialities = statusSearch === '' || (statusSearch && statusSearch.includes('AllF')) ? '' : statusSearch;
    });
    // filtering for deposit
    // this.subs.sink = this.depositFilter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.down_payment_status = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('deposit filter');
    //   }
    // });

    // filtering for each terms
    // this.subs.sink = this.terms1Filter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.first_term_status = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('deposit term 1');
    //   }
    // });
    // this.subs.sink = this.terms2Filter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.second_term_status = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('deposit term 2');
    //   }
    // });
    // this.subs.sink = this.terms3Filter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.third_term_status = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('deposit term 3');
    //   }
    // });
    // this.subs.sink = this.terms4Filter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.fourth_term_status = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('deposit term 4');
    //   }
    // });
    // this.subs.sink = this.terms5Filter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.fifth_term_status = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('deposit term 5');
    //   }
    // });
    // this.subs.sink = this.terms6Filter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.sixth_term_status = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('deposit term 6');
    //   }
    // });
    // this.subs.sink = this.terms7Filter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.seventh_term_status = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('deposit term 7');
    //   }
    // });
    // this.subs.sink = this.terms8Filter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.eighth_term_status = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('deposit term 8');
    //   }
    // });
    // this.subs.sink = this.terms9Filter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.ninth_term_status = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('deposit term 9');
    //   }
    // });
    // this.subs.sink = this.terms10Filter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.tenth_term_status = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('deposit term 10');
    //   }
    // });
    // this.subs.sink = this.terms11Filter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.eleventh_term_status = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('deposit term 11');
    //   }
    // });
    // this.subs.sink = this.terms12Filter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.twelveth_term_status = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('deposit term 12');
    //   }
    // });
    // this.subs.sink = this.legalEntityFilter.valueChanges.pipe(debounceTime(400)).subscribe((legal) => {
    //   this.filteredValues.legal_entity_name = legal;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getDataBilling('studentStatusFilter');
    //   }
    // });
    // this.subs.sink = this.studentStatusFilter.valueChanges.subscribe((statusSearch) => {
    //   if (statusSearch && statusSearch !== 'AllM') {
    //     this.filteredValues.candidate_admission_status = statusSearch;
    //     this.paginator.pageIndex = 0;
    //     if (!this.isReset) {
    //       this.getDataBilling('studentStatusFilter');
    //     }
    //   } else {
    //     this.filteredValues.candidate_admission_status = null;
    //     this.paginator.pageIndex = 0;
    //     if (!this.isReset) {
    //       this.getDataBilling('studentStatusFilter');
    //     }
    //   }
    // });

    this.subs.sink = this.fromDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.term_from = newDate;
        this.allStudentForCheckbox = [];
        this.allBillingForCheckbox = [];
        this.allEmailForCheckbox = [];
        this.allExportForCheckbox = [];
        this.allExportOfAllLinesForCheckbox = [];
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataBilling('fromDate');
        }
      }
    });

    this.subs.sink = this.toDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.term_to = newDate;
        this.allStudentForCheckbox = [];
        this.allBillingForCheckbox = [];
        this.allEmailForCheckbox = [];
        this.allExportForCheckbox = [];
        this.allExportOfAllLinesForCheckbox = [];
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataBilling('toDate');
        }
      }
    });

    // this.subs.sink = this.latestAskForPaymentFilter.valueChanges.subscribe((value) => {
    //   this.selection.clear();
    //   this.dataSelected = [];
    //   this.isCheckedAll = false;
    //   this.allStudentForCheckbox = [];
    //   this.allBillingForCheckbox = [];
    //   this.allEmailForCheckbox = [];
    //   this.allExportForCheckbox = [];
    //   this.allExportOfAllLinesForCheckbox = [];
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.paginator.pageIndex = 0;
    //   this.filteredValues.pay_n2 = value === 'all' ? null : value;
    //   if (!this.isReset) {
    //     this.getDataBilling('latestAskForPayment');
    //   }
    // });

    this.subs.sink = this.statusFilter.valueChanges.subscribe((statusSearch) => {
      this.allStudentForCheckbox = [];
      this.allBillingForCheckbox = [];
      this.allEmailForCheckbox = [];
      this.allExportForCheckbox = [];
      this.allExportOfAllLinesForCheckbox = [];
      this.filteredValues.term_status = statusSearch === 'All' ? null : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataBilling('statusFilter');
      }
    });
  }

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.scholars = resp;
          this.scholars = this.scholars.sort((a, b) =>
            a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
          );
          // this.scholarFilter.setValue(this.scholars[0]._id);
          this.scholars.unshift({ _id: 'All', scholar_season: this.translate.instant('AllF') });
          this.scholars = _.uniqBy(this.scholars, '_id');
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

  getDataBilling(data) {
    /*     console.log('Reload Page', data); */
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
    this.getProgramDropdownList();
    this.subs.sink = this.financeService.getAllBilling(pagination, this.sortValue, filter, userTypesList).subscribe(
      (students: any) => {
        if (this.isDisabled) {
          if (this.filteredValues.campus && !this.campusFilter.value) {
            this.campusFilter.setValue(this.filteredValues.campus);
          }
          if (this.filteredValues.level && !this.levelFilter.value) {
            this.getDataLevel();
            this.levelFilter.setValue(this.filteredValues.level);
          }
          this.isDisabled = true;
        }
        if (students && students.length) {
          this.mappingTermDats(students);
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isLoading = false;
        this.coreService.sidenavOpen = false;
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
        // this.campusFilter.setValue(this.filteredValues.campus);
        // this.levelFilter.setValue(this.filteredValues.level);
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

  checkIfTermHaveChargebackAndHaveDifferentStatus(termData: any) {
    if(termData?.length === 1) {
      const tempTermData = termData[0];
      if((tempTermData?.term_status === 'partially_paid' && tempTermData?.term_amount_chargeback) || (tempTermData?.term_amount_chargeback && (tempTermData?.term_amount_chargeback !== tempTermData?.term_pay_amount))) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  checkDepositPaidAndDepositHistories(studentData: any) {
    const tempBillingData = studentData;
    if(tempBillingData) {
      if(
          ((
            tempBillingData?.deposit_status && 
            tempBillingData?.dp_histories?.length
          ) &&
          !(
            (tempBillingData?.deposit_status === 'paid' || tempBillingData?.deposit_status === 'not_billed') &&
            tempBillingData?.dp_histories?.length === 1 && 
            tempBillingData?.dp_histories?.[0]?.deposit_status === 'chargeback'
          )) ||
          (
            tempBillingData?.deposit_status === 'paid' && 
            tempBillingData?.dp_histories?.[0]?.deposit_status === 'chargeback' &&
            tempBillingData?.deposit
          )
        ) {
          return true;
        } else {
          return false;
        }
    } else {
      return false;
    }
  }

  mappingTermDats(billing) {
    this.dataSource.data = [];
    this.paginator.length = 0;
    this.dataCount = 0;
    this.dataTableTerms = [];
    let data;
    data = _.cloneDeep(billing);
    const dateList = {
      january: moment('01/01/2021', 'DD/MM/YYYY'),
      february: moment('01/02/2021', 'DD/MM/YYYY'),
      march: moment('01/03/2021', 'DD/MM/YYYY'),
      april: moment('01/04/2021', 'DD/MM/YYYY'),
      may: moment('01/05/2021', 'DD/MM/YYYY'),
      june: moment('01/06/2021', 'DD/MM/YYYY'),
      july: moment('01/07/2021', 'DD/MM/YYYY'),
      august: moment('01/08/2021', 'DD/MM/YYYY'),
      september: moment('01/09/2021', 'DD/MM/YYYY'),
      october: moment('01/10/2021', 'DD/MM/YYYY'),
      november: moment('01/11/2021', 'DD/MM/YYYY'),
      december: moment('01/12/2021', 'DD/MM/YYYY'),
    };
    const isJanuary = dateList.january.format('M');
    const isFebruary = dateList.february.format('M');
    const isMarch = dateList.march.format('M');
    const isApril = dateList.april.format('M');
    const isMay = dateList.may.format('M');
    const isJune = dateList.june.format('M');
    const isJuly = dateList.july.format('M');
    const isAugust = dateList.august.format('M');
    const isSeptember = dateList.september.format('M');
    const isOctober = dateList.october.format('M');
    const isNovember = dateList.november.format('M');
    const isDecember = dateList.december.format('M');

    data.forEach((element) => {
      const term1 = [];
      const term2 = [];
      const term3 = [];
      const term4 = [];
      const term5 = [];
      const term6 = [];
      const term7 = [];
      const term8 = [];
      const term9 = [];
      const term10 = [];
      const term11 = [];
      const term12 = [];
      element.sent_pay_n2_datetime_str = '';
      if (element?.sent_pay_n2?.date && element?.sent_pay_n2?.time) {
        const { date, time } = element.sent_pay_n2;
        element.sent_pay_n2_datetime_str = this.parseUtcToLocal.transformDate(date, time);
      }
      element.terms.forEach((terms, index) => {
        let termsMoment;
        if (terms?.term_payment_deferment?.date) {
          termsMoment = moment(terms.term_payment_deferment.date, 'DD/MM/YYYY');
        } else {
          termsMoment = moment(terms.term_payment.date, 'DD/MM/YYYY');
        }
        const checkMonthTerms = termsMoment.format('M');
        if (checkMonthTerms === isAugust && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          term1.push(terms);
        }
        if (checkMonthTerms === isSeptember && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          term2.push(terms);
        }
        if (checkMonthTerms === isOctober && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          term3.push(terms);
        }
        if (checkMonthTerms === isNovember && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          term4.push(terms);
        }
        if (checkMonthTerms === isDecember && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          term5.push(terms);
        }
        if (checkMonthTerms === isJanuary && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          term6.push(terms);
        }
        if (checkMonthTerms === isFebruary && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          term7.push(terms);
        }
        if (checkMonthTerms === isMarch && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          term8.push(terms);
        }
        if (checkMonthTerms === isApril && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          term9.push(terms);
        }
        if (checkMonthTerms === isMay && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          term10.push(terms);
        }
        if (checkMonthTerms === isJune && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          term11.push(terms);
        }
        if (checkMonthTerms === isJuly && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          term12.push(terms);
        }
      });

      let totalDpDepositChargeback = 0
      if (element?.dp_histories?.length) {
        totalDpDepositChargeback = element.dp_histories.reduce((acc, history) => {
          if (history?.deposit_status === 'chargeback' && typeof history?.deposit_pay_amount === 'number') {
            return acc += history.deposit_pay_amount;
          }
        }, 0)
      }
      
      element.dp_deposit_chargeback = totalDpDepositChargeback;
      element.term_1 = term1;
      element.term_2 = term2;
      element.term_3 = term3;
      element.term_4 = term4;
      element.term_5 = term5;
      element.term_6 = term6;
      element.term_7 = term7;
      element.term_8 = term8;
      element.term_9 = term9;
      element.term_10 = term10;
      element.term_11 = term11;
      element.term_12 = term12;
    });
    this.dataSource.data = data;
    console.log('DATA SOURCE: ', this.dataSource.data);
    this.paginator.length = data[0].count_document;
    this.dataCount = data[0].count_document;
    this.dataTableTerms = data;
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataBilling('Sort');
      }
    }
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    let schoolsMap;
    let campusesMap;
    let levelsMap;
    let tagsMap;
    let sectorsMap;
    let specialitiesMap;
    let intakeChannelsMap;
    let paymentMethodMap;
    const listTypeTerms = [
      'first_term_statuses',
      'second_term_statuses',
      'third_term_statuses',
      'fourth_term_statuses',
      'fifth_term_statuses',
      'sixth_term_statuses',
      'seventh_term_statuses',
      'eighth_term_statuses',
      'ninth_term_statuses',
      'tenth_term_statuses',
      'eleventh_term_statuses',
      'twelveth_term_statuses',
    ];
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'intake_channel' ||
          key === 'candidate_last_name' ||
          key === 'payment_method' ||
          key === 'financial_profil' ||
          key === 'term_paid' ||
          key === 'account_number' ||
          key === 'scholar_season_id' ||
          key === 'term_from' ||
          key === 'term_to' ||
          key === 'legal_entity_name' ||
          key === 'financial_support_last_name'
        ) {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        } else if (key === 'is_have_special_cases') {
          filterQuery = filterQuery + ` is_have_special_cases:[${filterData.is_have_special_cases}]`;
        } else if (key === 'term_counts') {
          filterQuery = filterQuery + ` term_counts:[${filterData.term_counts}]`;
        } else if (key === 'type_of_registrations') {
          filterQuery = filterQuery + ` type_of_registrations:[${filterData.type_of_registrations}]`;
        } else if (key === 'pay_n2s') {
          filterQuery = filterQuery + ` pay_n2s:[${filterData.pay_n2s}]`;
        } else if (key === 'legal_entity_names') {
          const legals = filterData.legal_entity_names.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` legal_entity_names:[${legals}]`;
        } else if (listTypeTerms.includes(key)) {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'down_payment_statuses') {
          filterQuery = filterQuery + ` down_payment_statuses:[${filterData.down_payment_statuses}]`;
        } else if (key === 'candidate_admission_statuses') {
          filterQuery = filterQuery + ` candidate_admission_statuses:[${filterData.candidate_admission_statuses}]`;
        } else if (key === 'modality_step_special_form_statuses') {
          filterQuery = filterQuery + ` modality_step_special_form_statuses:[${filterData.modality_step_special_form_statuses}]`;
        } else if (key === 'financial_profiles') {
          filterQuery = filterQuery + ` financial_profiles:[${filterData.financial_profiles}]`;
        } else if (key === 'payment_methods') {
          paymentMethodMap = filterData.payment_methods.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` payment_methods:[${paymentMethodMap}]`;
        } else if (key === 'student_types') {
          filterQuery = filterQuery + ` student_types:[${filterData.student_types}]`;
        } else if (key === 'intake_channels') {
          intakeChannelsMap = filterData.intake_channels.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` intake_channels:[${intakeChannelsMap}]`;
        } else if (key === 'school_id') {
          schoolsMap = filterData.school_id.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` schools:[${schoolsMap}]`;
        } else if (key === 'level') {
          levelsMap = filterData.level.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` candidate_levels:[${levelsMap}]`;
        } else if (key === 'campus') {
          campusesMap = filterData.campus.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` candidate_campuses:[${campusesMap}]`;
        } else if (key === 'tags') {
          tagsMap = filterData.tags.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` tag_ids:[${tagsMap}]`;
        } else if (key === 'sectors') {
          sectorsMap = filterData.sectors.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` sectors:[${sectorsMap}]`;
        } else if (key === 'specialities') {
          specialitiesMap = filterData.specialities.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` specialities:[${specialitiesMap}]`;
        } else {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        }
      }
    });
    console.log(filterQuery);
    return 'filter: {' + filterQuery + '}';
  }

  cleanFilterSuperData(type?) {
    const filterData = _.cloneDeep(this.superFilter);
    let filterQuery = '';
    let schoolsMap;
    let campusesMap;
    let tagsMap;
    let levelsMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'scholar_season_id') {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        } else if (key === 'school_id') {
          schoolsMap = filterData.school_id.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` schools:[${schoolsMap}]`;
        } else if (key === 'level') {
          levelsMap = filterData.level.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` levels:[${levelsMap}]`;
        } else if (key === 'campus') {
          campusesMap = filterData.campus.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` campuses:[${campusesMap}]`;
        } else if (key === 'tags' && type !== 'program') {
          tagsMap = filterData.tags.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` tag_ids:[${tagsMap}]`;
        } else if (key !== 'sectors' && key !== 'specialities') {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        }
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.isCheckedAll = false;
      this.dataUnselectUser = [];
      this.allStudentForCheckbox = [];
      this.allBillingForCheckbox = [];
      this.allEmailForCheckbox = [];
      this.allExportForCheckbox = [];
      this.allExportOfAllLinesForCheckbox = [];
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.allStudentForCheckbox = [];
      this.allBillingForCheckbox = [];
      this.allEmailForCheckbox = [];
      this.allExportForCheckbox = [];
      this.allExportOfAllLinesForCheckbox = [];
      this.isCheckedAll = true;
      // this.getDataAllForCheckbox(0);
      this.dataUnselectUser = [];
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
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
    this.subs.sink = this.financeService.getAllBillingCheckbox(pagination, this.sortValue, filter, userTypesList).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.allStudentForCheckbox.push(...students);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
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

    if (this.userSelected && this.userSelected.length > 0) {
      const foundNoTerms = this.userSelected.every((res) => res.terms && res.terms.length === 0);
      if (foundNoTerms) {
        this.hasNoTerms = true;
      } else {
        this.hasNoTerms = false;
      }
    }
  }

  sendMultipleEmail() {
    if (this.dataSelected.length < 1) {
      this.isLoading = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('finance') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-followup-s8');
        },
      });
    } else {
      let data = this.dataSelected;
      if (data) {
        data = data.map((res) => {
          if (res && res.is_financial_support) {
            return {
              candidate: {
                candidate_id: res.candidate_id,
                email: res && res.financial_support_info && res.financial_support_info.email ? res.financial_support_info.email : null,
                emailDefault:
                  res && res.financial_support_info && res.financial_support_info.email ? res.financial_support_info.email : null,
                intake_channel: res?.intake_channel,
              },
              triggeredFromFinance: true,
            };
          } else {
            return {
              candidate: {
                candidate_id: res.candidate_id,
                email: res.candidate_id ? res.candidate_id.email : null,
                emailDefault: res.candidate_id ? res.candidate_id.school_mail : null,
                intake_channel: res?.intake_channel,
              },
              triggeredFromFinance: true,
            };
          }
        });
        console.log('_masuk', data);
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
        });
      }
    }
  }

  viewCandidateInfo(candidateId, tab?, subTab?, intakeChannelId?) {
    const query = {
      selectedCandidate: candidateId,
      sortValue: '',
      selectedProgram: intakeChannelId || '',
      tab: tab || '',
      subTab: subTab || '',
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

  translateDate(date) {
    if (date && date.date && date.time) {
    }
    const check = moment(date, 'DD-MM-YYYY').format('DD MMM YYYY');
    return check;
  }
  translateDates(date) {
    let check = '';
    if (date && date.date && date.time) {
      check = moment(date, 'DD-MM-YYYY').format('DD MMM');
    }
    return check;
  }

  internshipCallDialog(data) {
    this.subs.sink = this.dialog
      .open(InternshipCallDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (!this.isReset && resp) {
          this.getDataBilling('InternshipCallDialogComponent');
        }
      });
  }

  internshipMailDialog(data) {
    console.log(data);
    if (data && data.candidate_id) {
      let email = data.candidate_id.email ? data.candidate_id.email : null;
      let emailDefault = data.candidate_id.school_mail ? data.candidate_id.school_mail : null;
      if (data && data.is_financial_support) {
        email = data.financial_support_info && data.financial_support_info.email ? data.financial_support_info.email : null;
        emailDefault = data.financial_support_info && data.financial_support_info.email ? data.financial_support_info.email : null;
      }

      const mappedData = [
        {
          candidate: {
            candidate_id: data && data.candidate_id ? data.candidate_id : null,
            email: email,
            emailDefault: emailDefault,
            intake_channel: data?.intake_channel,
          },
          triggeredFromFinance: true,
        },
      ];

      this.sendMultipleEmailComponent = this.dialog.open(SendMultipleEmailComponent, {
        disableClose: true,
        width: '750px',
        data: mappedData,
        autoFocus: false,
      });
      this.subs.sink = this.sendMultipleEmailComponent.afterClosed().subscribe((resulta) => {
        if (resulta) {
          this.resetCandidateKeepFilter();
        }
      });
    }
  }

  internshipWhatsappDialog(data) {
    this.subs.sink = this.dialog
      .open(InternshipWhatsappDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (!this.isReset && resp) {
          this.getDataBilling('InternshipWhatsappDialogComponent');
        }
      });
  }

  addPaymentDialog(data) {
    let hasNoTerm = this.checkBillingDoesntHaveTerm(data);
    hasNoTerm = false;
    if (hasNoTerm) {
      // swal if no terms
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Finance_S1.Title'),
        html: this.translate.instant('Finance_S1.Text'),
        confirmButtonText: this.translate.instant('Finance_S1.Button'),
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: false,
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-finance-s1');
        },
      });
    } else {
      let width = '765px';
      if (data.terms.length === 6) {
        width = '780px';
      } else if (data.terms.length === 7) {
        width = '860px';
      } else if (data.terms.length === 8) {
        width = '925px';
      }
      if (data?.student_type?.type_of_information === 'continuous_partial_funding') {
        this.subs.sink = this.dialog
          .open(AddPaymentDialogComponent, {
            width: width,
            minHeight: '100px',
            disableClose: true,
            data: data,
          })
          .afterClosed()
          .subscribe((resp) => {
            if (!this.isReset && resp) {
              this.getDataBilling('AddPaymentDialogComponent');
            }
          });
      } else {
        const candidateId = data && data.candidate_id && data.candidate_id._id ? data.candidate_id._id : null;
        this.isLoading = true;
        this.subs.sink = this.candidatesService.CheckPaymentCompleted(candidateId).subscribe(
          (list) => {
            this.isLoading = false;
            this.subs.sink = this.dialog
              .open(AddPaymentDialogComponent, {
                width: width,
                minHeight: '100px',
                disableClose: true,
                data: data,
              })
              .afterClosed()
              .subscribe((resp) => {
                if (!this.isReset && resp) {
                  this.getDataBilling('AddPaymentDialogComponent');
                }
              });
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
                type: 'info',
                title: this.translate.instant('BAD_CONNECTION.Title'),
                html: this.translate.instant('BAD_CONNECTION.Text'),
                confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
              });
            } else if (err && err['message'] && err['message'].includes('step summary not done')) {
              Swal.fire({
                type: 'warning',
                title: this.translate.instant('PAY_SUM_S1_IMPROVEMENT.Title'),
                html: this.translate.instant('PAY_SUM_S1_IMPROVEMENT.Text'),
                confirmButtonText: this.translate.instant('PAY_SUM_S1_IMPROVEMENT.Button'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
                onOpen: (modalEl) => {
                  modalEl.setAttribute('data-cy', 'swal-pay-sum-s1');
                },
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
  }
  blockStudentsDialog(data) {
    if (!data.is_student_blocked) {
      this.subs.sink = this.dialog
        .open(BlockStudentsDialogComponent, {
          width: '600px',
          minHeight: '100px',
          disableClose: true,
          data: data,
        })
        .afterClosed()
        .subscribe((resp) => {
          if (!this.isReset && resp) {
            this.getDataBilling('BlockStudentsDialogComponent');
          }
        });
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('PAYMENT_FOLLOW_S4.TITLE'),
        html: this.translate.instant('PAYMENT_FOLLOW_S4.TEXT', {
          candidateName:
            (data.candidate_id.civility !== 'neutral' ? this.translate.instant(data.candidate_id.civility) + ' ' : '') +
            data.candidate_id.first_name +
            ' ' +
            data.candidate_id.last_name,
        }),
        showCancelButton: true,
        allowEscapeKey: true,
        allowOutsideClick: false,
        reverseButtons: true,
        confirmButtonText: this.translate.instant('PAYMENT_FOLLOW_S4.BUTTON_1'),
        cancelButtonText: this.translate.instant('PAYMENT_FOLLOW_S4.BUTTON_2'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-payment-follow-s4');
        },
      }).then((res) => {
        if (res.value) {
          const payload = {
            is_student_blocked: false,
          };
          this.subs.sink = this.financeService.UpdateBilling(payload, data._id).subscribe(
            (list) => {
              // console.log('Data Updated', list);
              this.getDataBilling('blockStudent');
              Swal.fire({
                type: 'success',
                title: this.translate.instant('PAYMENT_FOLLOW_S5.TITLE'),
                html: this.translate.instant('PAYMENT_FOLLOW_S5.TEXT', {
                  candidateName:
                    (data.candidate_id.civility !== 'neutral' ? this.translate.instant(data.candidate_id.civility) + ' ' : '') +
                    data.candidate_id.first_name +
                    ' ' +
                    data.candidate_id.last_name,
                }),
                allowOutsideClick: false,
                confirmButtonText: this.translate.instant('PAYMENT_FOLLOW_S5.BUTTON'),
                onOpen: (modalEl) => {
                  modalEl.setAttribute('data-cy', 'swal-payment-follow-s5');
                },
              }).then((resss) => {
                if (!this.isReset) {
                  this.getDataBilling('BlockStudentsDialogComponent');
                }
              });
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
      });
    }
  }

  intakeChannel(data) {
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
  termAmountDialog(data) {
    const hasNoTerm = this.checkBillingDoesntHaveTerm(data);
    if (hasNoTerm) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Finance_S1.Title'),
        html: this.translate.instant('Finance_S1.Text'),
        confirmButtonText: this.translate.instant('Finance_S1.Button'),
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: false,
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-finance-s1');
        },
      });
    } else {
      const termData = _.cloneDeep(data);
      const index = [];
      const termAvoir = termData.terms.filter((res, idx) => {
        if (res.term_amount === 0) {
          index.push(idx);
          return res;
        }
      });
      if (termAvoir && termAvoir.length > 0 && index && index.length > 0) {
        termData['term_avoir'] = termAvoir;
        termData['index'] = index;
      }
      // console.log('_term', termAvoir, termData);
      this.subs.sink = this.dialog
        .open(TermsAmountDialogComponent, {
          width: '1050px',
          minHeight: '100px',
          disableClose: true,
          data: termData,
        })
        .afterClosed()
        .subscribe((resp) => {
          if (!this.isReset && resp) {
            this.getDataBilling('TermsAmountDialogComponent');
          }
        });
    }
  }

  // refetch candidate data but keep current filter
  resetCandidateKeepFilter() {
    this.clearSelectIfFilter();
    this.getDataBilling('resetCandidate');
    this.getDataTerms();
  }

  resetCandidate() {
    this.selection.clear();
    this.dataSource.data = [];
    this.dataCount = 0;
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    this.dataUnselectUser = [];
    this.isReset = true;
    this.paginator.pageIndex = 0;
    this.paginator.length = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.schoolName = '';
    this.campusName = '';
    this.levelName = '';
    this.schoolName = '';
    this.school = [];
    this.campusList = [];
    this.levels = [];
    this.sectorList = [];
    this.specialityList = [];
    this.filteredValues = {
      intake_channel: '',
      intake_channels: null,
      student_type: null,
      student_types: null,
      candidate_last_name: '',
      payment_method: '',
      payment_methods: null,
      financial_profile: null,
      financial_profiles: null,
      deposit_done: null,
      candidate_admission_status: null,
      candidate_admission_statuses: null,
      term_paid: '',
      school_id: '',
      campus: '',
      level: '',
      tags: '',
      scholar_season_id: '',
      term_count: null,
      term_counts: null,
      account_number: '',
      financial_profile_not_respected: null,
      financial_support_last_name: null,
      modality_step_special_form_status: null,
      modality_step_special_form_statuses: null,
      down_payment_status: null,
      down_payment_statuses: null,
      first_term_status: null,
      second_term_status: null,
      third_term_status: null,
      fourth_term_status: null,
      fifth_term_status: null,
      sixth_term_status: null,
      seventh_term_status: null,
      eighth_term_status: null,
      ninth_term_status: null,
      tenth_term_status: null,
      eleventh_term_status: null,
      twelveth_term_status: null,
      first_term_statuses: null,
      second_term_statuses: null,
      third_term_statuses: null,
      fourth_term_statuses: null,
      fifth_term_statuses: null,
      sixth_term_statuses: null,
      seventh_term_statuses: null,
      eighth_term_statuses: null,
      ninth_term_statuses: null,
      tenth_term_statuses: null,
      eleventh_term_statuses: null,
      twelveth_term_statuses: null,
      term_from: null,
      term_status: null,
      term_to: null,
      legal_entity_name: null,
      legal_entity_names: null,
      pay_n2: null,
      pay_n2s: null,
      offset: moment().utcOffset(),
      sectors: '',
      specialities: '',
      type_of_registration: null,
      type_of_registrations: null,
      is_have_special_case: null,
      is_have_special_cases: null,
      schools: null,
    };

    this.superFilter = {
      level: '',
      tags: '',
      campus: '',
      school_id: '',
      scholar_season_id: '',
      sectors: '',
      specialities: '',
    };

    this.legalEntityFilter.patchValue(null, { emitEvent: false });
    this.schoolsFilter.setValue(null, { emitEvent: false });
    this.campusFilter.setValue(null, { emitEvent: false });
    this.levelFilter.setValue(null, { emitEvent: false });
    this.tagFilter.setValue(null, { emitEvent: false });
    this.scholarFilter.setValue('All', { emitEvent: false });
    this.sectorFilter.setValue(null, { emitEvent: false });
    this.specialityFilter.setValue(null, { emitEvent: false });
    this.currentProgramFilter.setValue(null, { emitEvent: false });
    this.typeFilter.setValue(null, { emitEvent: false });
    this.paymentFilter.setValue(null, { emitEvent: false });
    this.paymentInformationFilter.setValue(null, { emitEvent: false });
    this.specialCaseFilter.setValue(null, { emitEvent: false });
    this.profileRateFilter.setValue(null, { emitEvent: false });
    this.studentFilter.setValue('', { emitEvent: false });
    this.accountFilter.setValue('', { emitEvent: false });
    this.financialFilter.setValue(null, { emitEvent: false });
    this.studentStatusFilter.setValue(null, { emitEvent: false });
    this.latestAskForPaymentFilter.setValue(null, { emitEvent: false });
    this.type_of_registration.setValue(null, { emitEvent: false });
    this.tagFilter.setValue(null, { emitEvent: false });
    this.selectType = '';
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.isTerm1 = false;
    this.isTerm2 = false;
    this.isTerm3 = false;
    this.isTerm4 = false;
    this.isTerm5 = false;
    this.isTerm6 = false;
    this.isTerm7 = false;
    this.isTerm8 = false;
    this.isTerm9 = false;
    this.isTerm10 = false;
    this.isTerm11 = false;
    this.isTerm12 = false;
    this.isDeposit = false;
    this.isNonPlan = false;
    this.financialSupportFilter.setValue('', { emitEvent: false });
    this.depositFilter.setValue(null, { emitEvent: false });
    this.terms1Filter.setValue(null, { emitEvent: false });
    this.terms2Filter.setValue(null, { emitEvent: false });
    this.terms3Filter.setValue(null, { emitEvent: false });
    this.terms4Filter.setValue(null, { emitEvent: false });
    this.terms5Filter.setValue(null, { emitEvent: false });
    this.terms6Filter.setValue(null, { emitEvent: false });
    this.terms7Filter.setValue(null, { emitEvent: false });
    this.terms8Filter.setValue(null, { emitEvent: false });
    this.terms9Filter.setValue(null, { emitEvent: false });
    this.terms10Filter.setValue(null, { emitEvent: false });
    this.terms11Filter.setValue(null, { emitEvent: false });
    this.terms12Filter.setValue(null, { emitEvent: false });

    this.fromDateFilter.setValue(null, { emitEvent: false });
    this.toDateFilter.setValue(null, { emitEvent: false });
    this.statusFilter.setValue('All', { emitEvent: false });
    this.filterBreadcrumbData = [];

    this.getDataBilling('resetCandidate');
    this.getDataTerms();

    this.isDisabled = true;
    if (this.scholarFilter.value) {
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }

    this.tempDataFilter = {
      currentProgram: null,
      is_have_special_cases: null,
      legalEntity: null,
      financialProfile: null,
      status: null,
      type: null,
      admissionProfile: null,
      paymentMethod: null,
      paymentInformation: null,
      latestAskForPayment: null,
      deposit: null,
      typeOfRegistration: null,
      terms1: null,
      terms2: null,
      terms3: null,
      terms4: null,
      terms5: null,
      terms6: null,
      terms7: null,
      terms8: null,
      terms9: null,
      terms10: null,
      terms11: null,
      terms12: null,
    };
  }

  filterDeposit() {
    // this.filteredValues.deposit_done = !this.filteredValues.deposit_done;
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    if (!this.isDeposit) {
      this.filteredValues.deposit_done = false;
      this.isDeposit = true;
    } else {
      this.filteredValues.deposit_done = null;
      this.isDeposit = false;
    }
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.getDataBilling('filterDeposit');
    }
  }

  filterFinanceProfile() {
    // this.filteredValues.financial_profile_not_respected = !this.filteredValues.financial_profile_not_respected;
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    this.filteredValues.financial_profile_not_respected = this.filteredValues.financial_profile_not_respected ? null : true;
    if (this.filteredValues.financial_profile_not_respected) {
      this.isNonPlan = true;
    } else {
      this.isNonPlan = false;
    }
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.getDataBilling('filterDeposit');
    }
  }

  filterTerm(name) {
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    if (name) {
      this.filteredValues['first_term'] = true;
      this.filteredValues['second_term'] = true;
      this.filteredValues['third_term'] = true;
      this.filteredValues['fourth_term'] = true;
      this.filteredValues['fifth_term'] = true;
      this.filteredValues['sixth_term'] = true;
      this.filteredValues['seventh_term'] = true;
      this.filteredValues['eighth_term'] = true;
      this.filteredValues['ninth_term'] = true;
      this.filteredValues['tenth_term'] = true;
      this.filteredValues['eleventh_term'] = true;
      this.filteredValues['twelveth_term'] = true;
      if (name === '31/10/' + this.year) {
        this.filteredValues['first_term'] = !this.filteredValues['first_term'];
        delete this.filteredValues['second_term'];
        delete this.filteredValues['third_term'];
        delete this.filteredValues['fourth_term'];
        delete this.filteredValues['fifth_term'];
        delete this.filteredValues['sixth_term'];
        delete this.filteredValues['seventh_term'];
        delete this.filteredValues['eighth_term'];
        delete this.filteredValues['ninth_term'];
        delete this.filteredValues['tenth_term'];
        delete this.filteredValues['eleventh_term'];
        delete this.filteredValues['twelveth_term'];

        if (!this.isTerm1) {
          this.isTerm1 = true;
        } else {
          this.isTerm1 = false;
          delete this.filteredValues['first_term'];
        }
        this.isTerm2 = false;
        this.isTerm3 = false;
        this.isTerm4 = false;
        this.isTerm5 = false;
        this.isTerm6 = false;
        this.isTerm7 = false;
        this.isTerm8 = false;
        this.isTerm9 = false;
        this.isTerm10 = false;
        this.isTerm11 = false;
        this.isTerm12 = false;
      } else if (name === '30/11/' + this.year) {
        this.filteredValues['second_term'] = !this.filteredValues['second_term'];
        delete this.filteredValues['first_term'];
        delete this.filteredValues['third_term'];
        delete this.filteredValues['fourth_term'];
        delete this.filteredValues['fifth_term'];
        delete this.filteredValues['sixth_term'];
        delete this.filteredValues['seventh_term'];
        delete this.filteredValues['eighth_term'];
        delete this.filteredValues['ninth_term'];
        delete this.filteredValues['tenth_term'];
        delete this.filteredValues['eleventh_term'];
        delete this.filteredValues['twelveth_term'];

        if (!this.isTerm2) {
          this.isTerm2 = true;
        } else {
          this.isTerm2 = false;
          delete this.filteredValues['second_term'];
        }

        this.isTerm1 = false;
        this.isTerm3 = false;
        this.isTerm4 = false;
        this.isTerm5 = false;
        this.isTerm6 = false;
        this.isTerm7 = false;
        this.isTerm8 = false;
        this.isTerm9 = false;
        this.isTerm10 = false;
        this.isTerm11 = false;
        this.isTerm12 = false;
      } else if (name === '31/12/' + this.year) {
        this.filteredValues['third_term'] = !this.filteredValues['third_term'];
        delete this.filteredValues['second_term'];
        delete this.filteredValues['first_term'];
        delete this.filteredValues['fourth_term'];
        delete this.filteredValues['fifth_term'];
        delete this.filteredValues['sixth_term'];
        delete this.filteredValues['seventh_term'];
        delete this.filteredValues['eighth_term'];
        delete this.filteredValues['ninth_term'];
        delete this.filteredValues['tenth_term'];
        delete this.filteredValues['eleventh_term'];
        delete this.filteredValues['twelveth_term'];

        if (!this.isTerm3) {
          this.isTerm3 = true;
        } else {
          this.isTerm3 = false;
          delete this.filteredValues['third_term'];
        }

        this.isTerm1 = false;
        this.isTerm2 = false;
        this.isTerm4 = false;
        this.isTerm5 = false;
        this.isTerm6 = false;
        this.isTerm7 = false;
        this.isTerm8 = false;
        this.isTerm9 = false;
        this.isTerm10 = false;
        this.isTerm11 = false;
        this.isTerm12 = false;
      } else if (name === '31/01/' + this.yearPlusOne) {
        this.filteredValues['fourth_term'] = !this.filteredValues['fourth_term'];
        delete this.filteredValues['second_term'];
        delete this.filteredValues['third_term'];
        delete this.filteredValues['first_term'];
        delete this.filteredValues['fifth_term'];
        delete this.filteredValues['sixth_term'];
        delete this.filteredValues['seventh_term'];
        delete this.filteredValues['eighth_term'];
        delete this.filteredValues['ninth_term'];
        delete this.filteredValues['tenth_term'];
        delete this.filteredValues['eleventh_term'];
        delete this.filteredValues['twelveth_term'];

        if (!this.isTerm4) {
          this.isTerm4 = true;
        } else {
          this.isTerm4 = false;
          delete this.filteredValues['fourth_term'];
        }

        this.isTerm1 = false;
        this.isTerm2 = false;
        this.isTerm3 = false;
        this.isTerm5 = false;
        this.isTerm6 = false;
        this.isTerm7 = false;
        this.isTerm8 = false;
        this.isTerm9 = false;
        this.isTerm10 = false;
        this.isTerm11 = false;
        this.isTerm12 = false;
      } else if (name === '28/02/' + this.yearPlusOne) {
        this.filteredValues['fifth_term'] = !this.filteredValues['fifth_term'];
        delete this.filteredValues['second_term'];
        delete this.filteredValues['third_term'];
        delete this.filteredValues['fourth_term'];
        delete this.filteredValues['first_term'];
        delete this.filteredValues['sixth_term'];
        delete this.filteredValues['seventh_term'];
        delete this.filteredValues['eighth_term'];
        delete this.filteredValues['ninth_term'];
        delete this.filteredValues['tenth_term'];
        delete this.filteredValues['eleventh_term'];
        delete this.filteredValues['twelveth_term'];

        if (!this.isTerm5) {
          this.isTerm5 = true;
        } else {
          this.isTerm5 = false;
          delete this.filteredValues['fifth_term'];
        }

        this.isTerm1 = false;
        this.isTerm2 = false;
        this.isTerm3 = false;
        this.isTerm4 = false;
        this.isTerm6 = false;
        this.isTerm7 = false;
        this.isTerm8 = false;
        this.isTerm9 = false;
        this.isTerm10 = false;
        this.isTerm11 = false;
        this.isTerm12 = false;
      } else if (name === '31/03/' + this.yearPlusOne) {
        this.filteredValues['sixth_term'] = !this.filteredValues['sixth_term'];
        delete this.filteredValues['second_term'];
        delete this.filteredValues['third_term'];
        delete this.filteredValues['fourth_term'];
        delete this.filteredValues['fifth_term'];
        delete this.filteredValues['first_term'];
        delete this.filteredValues['seventh_term'];
        delete this.filteredValues['eighth_term'];
        delete this.filteredValues['ninth_term'];
        delete this.filteredValues['tenth_term'];
        delete this.filteredValues['eleventh_term'];
        delete this.filteredValues['twelveth_term'];

        if (!this.isTerm6) {
          this.isTerm6 = true;
        } else {
          this.isTerm6 = false;
          delete this.filteredValues['sixth_term'];
        }

        this.isTerm1 = false;
        this.isTerm2 = false;
        this.isTerm3 = false;
        this.isTerm4 = false;
        this.isTerm5 = false;
        this.isTerm7 = false;
        this.isTerm8 = false;
        this.isTerm9 = false;
        this.isTerm10 = false;
        this.isTerm11 = false;
        this.isTerm12 = false;
      } else if (name === '30/04/' + this.yearPlusOne) {
        this.filteredValues['seventh_term'] = !this.filteredValues['seventh_term'];
        delete this.filteredValues['second_term'];
        delete this.filteredValues['third_term'];
        delete this.filteredValues['fourth_term'];
        delete this.filteredValues['fifth_term'];
        delete this.filteredValues['sixth_term'];
        delete this.filteredValues['first_term'];
        delete this.filteredValues['eighth_term'];
        delete this.filteredValues['ninth_term'];
        delete this.filteredValues['tenth_term'];
        delete this.filteredValues['eleventh_term'];
        delete this.filteredValues['twelveth_term'];

        if (!this.isTerm7) {
          this.isTerm7 = true;
        } else {
          this.isTerm7 = false;
          delete this.filteredValues['seventh_term'];
        }

        this.isTerm1 = false;
        this.isTerm2 = false;
        this.isTerm3 = false;
        this.isTerm4 = false;
        this.isTerm5 = false;
        this.isTerm6 = false;
        this.isTerm8 = false;
        this.isTerm9 = false;
        this.isTerm10 = false;
        this.isTerm11 = false;
        this.isTerm12 = false;
      } else if (name === '31/05/' + this.yearPlusOne) {
        this.filteredValues['eighth_term'] = !this.filteredValues['eighth_term'];
        delete this.filteredValues['second_term'];
        delete this.filteredValues['third_term'];
        delete this.filteredValues['fourth_term'];
        delete this.filteredValues['fifth_term'];
        delete this.filteredValues['sixth_term'];
        delete this.filteredValues['seventh_term'];
        delete this.filteredValues['first_term'];
        delete this.filteredValues['ninth_term'];
        delete this.filteredValues['tenth_term'];
        delete this.filteredValues['eleventh_term'];
        delete this.filteredValues['twelveth_term'];

        if (!this.isTerm8) {
          this.isTerm8 = true;
        } else {
          this.isTerm8 = false;
          delete this.filteredValues['eighth_term'];
        }

        this.isTerm1 = false;
        this.isTerm2 = false;
        this.isTerm3 = false;
        this.isTerm4 = false;
        this.isTerm5 = false;
        this.isTerm6 = false;
        this.isTerm7 = false;
        this.isTerm9 = false;
        this.isTerm10 = false;
        this.isTerm11 = false;
        this.isTerm12 = false;
      } else if (name === '30/06/' + this.yearPlusOne) {
        this.filteredValues['ninth_term'] = !this.filteredValues['ninth_term'];
        delete this.filteredValues['second_term'];
        delete this.filteredValues['third_term'];
        delete this.filteredValues['fourth_term'];
        delete this.filteredValues['fifth_term'];
        delete this.filteredValues['sixth_term'];
        delete this.filteredValues['seventh_term'];
        delete this.filteredValues['eighth_term'];
        delete this.filteredValues['first_term'];
        delete this.filteredValues['tenth_term'];
        delete this.filteredValues['eleventh_term'];
        delete this.filteredValues['twelveth_term'];

        if (!this.isTerm9) {
          this.isTerm9 = true;
        } else {
          this.isTerm9 = false;
          delete this.filteredValues['ninth_term'];
        }

        this.isTerm1 = false;
        this.isTerm2 = false;
        this.isTerm3 = false;
        this.isTerm4 = false;
        this.isTerm5 = false;
        this.isTerm6 = false;
        this.isTerm7 = false;
        this.isTerm8 = false;
        this.isTerm10 = false;
        this.isTerm11 = false;
        this.isTerm12 = false;
      } else if (name === '31/07/' + this.yearPlusOne) {
        this.filteredValues['tenth_term'] = !this.filteredValues['tenth_term'];
        delete this.filteredValues['second_term'];
        delete this.filteredValues['third_term'];
        delete this.filteredValues['fourth_term'];
        delete this.filteredValues['fifth_term'];
        delete this.filteredValues['sixth_term'];
        delete this.filteredValues['seventh_term'];
        delete this.filteredValues['eighth_term'];
        delete this.filteredValues['ninth_term'];
        delete this.filteredValues['first_term'];
        delete this.filteredValues['eleventh_term'];
        delete this.filteredValues['twelveth_term'];

        if (!this.isTerm10) {
          this.isTerm10 = true;
        } else {
          this.isTerm10 = false;
          delete this.filteredValues['tenth_term'];
        }

        this.isTerm1 = false;
        this.isTerm2 = false;
        this.isTerm3 = false;
        this.isTerm4 = false;
        this.isTerm5 = false;
        this.isTerm6 = false;
        this.isTerm7 = false;
        this.isTerm8 = false;
        this.isTerm9 = false;
        this.isTerm11 = false;
        this.isTerm12 = false;
      } else if (name === '31/08/' + this.yearPlusOne) {
        this.filteredValues['eleventh_term'] = !this.filteredValues['eleventh_term'];
        delete this.filteredValues['second_term'];
        delete this.filteredValues['third_term'];
        delete this.filteredValues['fourth_term'];
        delete this.filteredValues['fifth_term'];
        delete this.filteredValues['sixth_term'];
        delete this.filteredValues['seventh_term'];
        delete this.filteredValues['eighth_term'];
        delete this.filteredValues['ninth_term'];
        delete this.filteredValues['tenth_term'];
        delete this.filteredValues['first_term'];
        delete this.filteredValues['twelveth_term'];

        if (!this.isTerm11) {
          this.isTerm11 = true;
        } else {
          this.isTerm11 = false;
          delete this.filteredValues['eleventh_term'];
        }

        this.isTerm1 = false;
        this.isTerm2 = false;
        this.isTerm3 = false;
        this.isTerm4 = false;
        this.isTerm5 = false;
        this.isTerm6 = false;
        this.isTerm7 = false;
        this.isTerm8 = false;
        this.isTerm9 = false;
        this.isTerm10 = false;
        this.isTerm12 = false;
      } else if (name === '30/09/' + this.yearPlusOne) {
        this.filteredValues['twelveth_term'] = !this.filteredValues['twelveth_term'];
        delete this.filteredValues['second_term'];
        delete this.filteredValues['third_term'];
        delete this.filteredValues['fourth_term'];
        delete this.filteredValues['fifth_term'];
        delete this.filteredValues['sixth_term'];
        delete this.filteredValues['seventh_term'];
        delete this.filteredValues['eighth_term'];
        delete this.filteredValues['ninth_term'];
        delete this.filteredValues['tenth_term'];
        delete this.filteredValues['eleventh_term'];
        delete this.filteredValues['first_term'];

        if (!this.isTerm12) {
          this.isTerm12 = true;
        } else {
          this.isTerm12 = false;
          delete this.filteredValues['twelveth_term'];
        }

        this.isTerm1 = false;
        this.isTerm2 = false;
        this.isTerm3 = false;
        this.isTerm4 = false;
        this.isTerm5 = false;
        this.isTerm6 = false;
        this.isTerm7 = false;
        this.isTerm8 = false;
        this.isTerm9 = false;
        this.isTerm10 = false;
        this.isTerm11 = false;
      }
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataBilling('filterTerm');
      }
    } else {
      this.filteredValues.term_paid = '';
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataBilling('filterTerm 2');
      }
    }
  }

  blockStudent(element) {
    const payload = {
      is_student_blocked: !element.is_student_blocked,
    };
    this.subs.sink = this.financeService.UpdateBilling(payload, element._id).subscribe(
      (list) => {
        // console.log('Data Updated', list);
        this.getDataBilling('blockStudent');
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

  scholarSelect() {
    this.school = [];
    this.levels = [];
    this.campusList = [];
    if (this.schoolsFilter.value) {
      this.schoolsFilter.setValue(null);
    }
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
    this.sectorList = [];
    this.specialityList = [];
    if (!this.scholarFilter.value || this.scholarFilter.value.length === 0) {
      this.superFilter['scholar_season_id'] = '';
      this.scholarSelected = [];
    } else {
      this.superFilter['scholar_season_id'] =
        this.scholarFilter.value && this.scholarFilter.value !== 'All' ? this.scholarFilter.value : null;
      this.scholarSelected = this.scholarFilter.value;
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }
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

  getDataCampus() {
    console.log('getDataCampus sini');
    this.schoolName = '';
    this.levels = [];
    this.campusList = [];
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
    this.sectorList = [];
    this.specialityList = [];
    const school = this.schoolsFilter.value;
    this.superFilter.school_id = this.schoolsFilter.value && !this.schoolsFilter.value.includes('All') ? this.schoolsFilter.value : null;

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
            campus.campuses.filter((campusess, nex) => {
              this.campusList.push(campusess);
              this.campusListBackup = this.campusList;
            });
          }
        });
        this.getDataLevel();
      } else if (school && school.includes('All')) {
        this.listObjective.forEach((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.forEach((campusess, nex) => {
              this.campusList.push(campusess);
              this.campusListBackup = this.campusList;
            });
          }
        });
        this.getDataLevel();
      } else {
        this.campusList = [];
        this.getDataLevel();
      }
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
  checkSuperFilterCampus() {
    const form = this.campusFilter.value;
    if (form && form.length) {
      this.campusFilter.patchValue(form);
    } else {
      this.campusFilter.patchValue(null);
    }
    this.getDataLevel();
  }

  getDataLevel() {
    const schools = this.schoolsFilter.value;
    const sCampus = this.campusFilter.value;
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.sectorFilter.value) {
      this.sectorFilter.setValue(null);
    }
    if (this.specialityFilter.value) {
      this.specialityFilter.setValue(null);
    }
    this.sectorList = [];
    this.specialityList = [];
    this.levels = [];
    if (sCampus) {
      this.levels = [];
      this.campusName = '';
      this.superFilter.campus = this.campusFilter.value && !this.campusFilter.value.includes('All') ? this.campusFilter.value : null;

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
        } else if (sCampus && sCampus.length && sCampus.includes('All') && this.campusList && this.campusList.length) {
          this.campusList.forEach((lev) => {
            if (lev && lev.levels && lev.levels.length) {
              this.levels = _.concat(this.levels, lev.levels);
            }
          });
        }
      } else {
        if (sCampus && !sCampus.includes('All')) {
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
              });
            }
          });
        } else if (sCampus && sCampus.includes('All') && this.campusList && this.campusList.length) {
          this.campusList.forEach((element) => {
            if (element && element.levels && element.levels.length) {
              element.levels.forEach((level) => {
                this.levels.push(level);
              });
            }
          });
        } else {
          this.levels = [];
        }
      }
      this.levels = _.uniqBy(this.levels, 'name');
      this.levels = this.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
    }
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

  checkSuperFilterTags() {
    const form = this.tagFilter.value;
    if (form && form.length) {
      this.tagFilter.patchValue(form);
    } else {
      this.tagFilter.patchValue(null);
    }
  }

  getDataByLevel() {
    this.levels = _.uniqBy(this.levels, 'name');
    this.levels = this.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
    this.levelName = '';

    this.superFilter.level = this.levelFilter.value && !this.levelFilter.value.includes('All') ? this.levelFilter.value : null;
    if (this.levelFilter.value && !this.levelFilter.value.includes('All')) {
      const sLevel = this.levelFilter.value;

      sLevel.forEach((element) => {
        const sName = this.levels.find((list) => list.name === element);
        this.levelName = this.levelName ? this.levelName + ',' + sName.name : sName.name;
      });
    }
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
    this.superFilter.sectors = null;
    this.superFilter.specialities = null;

    if (this.schoolsFilter.value?.length && this.schoolsFilter.value.includes('All') && this.listObjective?.length) {
      allSchool = this.listObjective.map((data) => data._id);
    }
    if (this.campusFilter.value?.length && this.campusList?.length) {
      if (this.campusFilter.value.includes('All')) {
        allCampus = this.campusList.map((data) => data._id);
      } else {
        const campusName = this.campusFilter.value;
        campusIds = this.campusList.filter((campus) => campusName.includes(campus?.name))?.map((campus) => campus._id);
      }
    }
    if (this.levelFilter.value?.length && this.levels?.length) {
      if (this.levelFilter.value.includes('All')) {
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
    this.superFilter.specialities = null;

    if (this.schoolsFilter.value?.length && this.schoolsFilter.value.includes('All') && this.listObjective?.length) {
      allSchool = this.listObjective.map((data) => data._id);
    }
    if (this.campusFilter.value?.length && this.campusList?.length) {
      if (this.campusFilter.value.includes('All')) {
        allCampus = this.campusList.map((data) => data._id);
      } else {
        const campusName = this.campusFilter.value;
        campusIds = this.campusList.filter((campus) => campusName.includes(campus?.name))?.map((campus) => campus._id);
      }
    }
    if (this.levelFilter.value?.length && this.levels?.length) {
      if (this.levelFilter.value.includes('All')) {
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

  checkIsBetween(data, range1, range2) {
    const found = data.term_payment.date === range2;
    return found;
  }

  checkMomentIsBetween(data, range1, range2) {
    const found =
      moment(data.term_payment.date).isBetween(moment(range1, 'DD/MM/YYYY'), moment(range2, 'DD/MM/YYYY')) ||
      data.term_payment.date === range2;
    return found;
  }

  changedPlan(data) {
    let found = false;
    if (data.term_payment_deferment && data.term_payment_deferment.date) {
      found =
        moment().isBefore(moment(data.term_payment_deferment.date, 'DD/MM/YYYY')) ||
        moment().isSame(moment(data.term_payment_deferment.date, 'DD/MM/YYYY'));
    }
    return found;
  }

  checkPaymentLate(planned) {
    const lastPlanMonth = moment(planned, 'DD/MM/YYYY').endOf('month');
    const lastCurrentMonth = moment().endOf('month');
    const found = lastCurrentMonth.isAfter(moment(lastPlanMonth, 'DD/MM/YYYY'));
    return found;
  }

  isNonPayable(data, range1, range2) {
    let found = false;
    found = true;
    if (data && data.length) {
      data.forEach((element) => {
        if (element.term_payment && element.term_payment.date) {
          const payable =
            moment(element.term_payment.date).isBetween(moment(range1, 'DD/MM/YYYY'), moment(range2, 'DD/MM/YYYY')) ||
            element.term_payment.date === range2;
          if (payable) {
            found = false;
          }
        }
      });
    }
    return found;
  }

  formatCurrency(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
      // num = num.toString().slice(0, -3);
    }
    return num;
  }

  formatCurrencyFloat(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
      // num = num.toString().slice(0, -3);
    }
    return num;
  }

  formatCurrencyHistory(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
    }
    return num;
  }

  checkIsNumber(num) {
    let allow = false;
    if (Number.isInteger(num)) {
      allow = true;
    }
    return allow;
  }

  formatNonDecimal(data) {
    let num: any = '';
    if (data) {
      num = Math.round(data);
    }
    return num;
  }

  getTermsIndex(data, range1, range2) {
    let index = 0;
    if (data && data.length) {
      data.forEach((element, indexTerm) => {
        const found =
          moment(element.term_payment.date).isBetween(moment(range1, 'DD/MM/YYYY'), moment(range2, 'DD/MM/YYYY')) ||
          element.term_payment.date === range2;
        if (found) {
          index = indexTerm;
        }
      });
    }
    return index;
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  getDataTerms() {
    this.subs.sink = this.financeService.GetTermProfilRates().subscribe(
      (list) => {
        if (list && list.length) {
          this.listTerm = list.sort(function (a, b) {
            return a - b;
          });
          // console.log('this.listTerm', this.listTerm);
          this.listTerm = this.listTerm.map((resp) => {
            return {
              value: resp,
              label: resp + ' ' + this.translate.instant('termss'),
            };
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

  downloadCSV() {
    if (this.dataSelected.length < 1 && !this.isCheckedAll && this.buttonClicked !== 'export-controlling') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('finance') }),
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
          if (this.buttonClicked === 'export' || this.buttonClicked === 'export-controlling') {
            this.openDownloadCsv(fileType);
          } 
        }
      });
    }
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
    const listTypeTerms = [
      'first_term_statuses',
      'second_term_statuses',
      'third_term_statuses',
      'fourth_term_statuses',
      'fifth_term_statuses',
      'sixth_term_statuses',
      'seventh_term_statuses',
      'eighth_term_statuses',
      'ninth_term_statuses',
      'tenth_term_statuses',
      'eleventh_term_statuses',
      'twelveth_term_statuses',
    ];
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'intake_channel' ||
          key === 'candidate_last_name' ||
          key === 'payment_method' ||
          key === 'financial_profile' ||
          key === 'term_paid' ||
          key === 'account_number' ||
          key === 'scholar_season_id' ||
          key === 'student_type' ||
          key === 'candidate_admission_status' ||
          key === 'deposit_done' ||
          key === 'term_count' ||
          key === 'financial_profile_not_respected' ||
          key === 'financial_support_last_name' ||
          key === 'modality_step_special_form_status' ||
          key === 'down_payment_status' ||
          key === 'first_term_status' ||
          key === 'second_term_status' ||
          key === 'third_term_status' ||
          key === 'fourth_term_status' ||
          key === 'fifth_term_status' ||
          key === 'sixth_term_status' ||
          key === 'seventh_term_status' ||
          key === 'eighth_term_status' ||
          key === 'ninth_term_status' ||
          key === 'tenth_term_status' ||
          key === 'eleventh_term_status' ||
          key === 'twelveth_term_status' ||
          key === 'term_from' ||
          key === 'term_to' ||
          key === 'term_status' ||
          key === 'pay_n2' ||
          key === 'type_of_registration' ||
          key === 'legal_entity_name'
        ) {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        } else if (key === 'is_have_special_cases') {
          const is_have_special_cases = filterData.is_have_special_cases;
          filterQuery = filterQuery ? filterQuery + ',' + `"is_have_special_cases":[${is_have_special_cases}]` : filterQuery + `"is_have_special_cases":[${is_have_special_cases}]`;
        } else if (key === 'term_counts') {
          const termsCount = filterData.term_counts.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"term_counts":[${termsCount}]` : filterQuery + `"term_counts":[${termsCount}]`;
        } else if (key === 'type_of_registrations') {
          const typeOfRegistration = filterData.type_of_registrations.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"type_of_registrations":[${typeOfRegistration}]`
            : filterQuery + `"type_of_registrations":[${typeOfRegistration}]`;
        } else if (key === 'pay_n2s') {
          const latestPayment = filterData.pay_n2s.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"pay_n2s":[${latestPayment}]` : filterQuery + `"pay_n2s":[${latestPayment}]`;
        } else if (key === 'legal_entity_names') {
          const legals = filterData.legal_entity_names.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"legal_entity_names":[${legals}]`
            : filterQuery + `"legal_entity_names":[${legals}]`;
        } else if (listTypeTerms.includes(key)) {
          const result = filterData[key]?.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${result}]` : filterQuery + `"${key}":[${result}]`;
        } else if (key === 'school_id') {
          schoolsMap = filterData.school_id.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"schools":[${schoolsMap}]` : filterQuery + `"schools":[${schoolsMap}]`;
        } else if (key === 'level') {
          levelsMap = filterData.level.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"candidate_levels":[${levelsMap}]`
            : filterQuery + `"candidate_levels":[${levelsMap}]`;
        } else if (key === 'campus') {
          campusesMap = filterData.campus.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"candidate_campuses":[${campusesMap}]`
            : filterQuery + `"candidate_campuses":[${campusesMap}]`;
        } else if (key === 'tags') {
          tagsMap = filterData.tags.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"tag_ids":[${tagsMap}]` : filterQuery + `"tag_ids":[${tagsMap}]`;
        } else if (key === 'sectors') {
          sectorsMap = filterData.sectors.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"sectors":[${sectorsMap}]` : filterQuery + `"sectors":[${sectorsMap}]`;
        } else if (key === 'specialities') {
          specialitiesMap = filterData.specialities.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"specialities":[${specialitiesMap}]`
            : filterQuery + `"specialities":[${specialitiesMap}]`;
        } else if (key === 'intake_channels') {
          const intakeChannelsMap = filterData.intake_channels.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"intake_channels":[${intakeChannelsMap}]`
            : filterQuery + `"intake_channels":[${intakeChannelsMap}]`;
        } else if (key === 'student_types') {
          const studentTypesMap = filterData.student_types.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"student_types":[${studentTypesMap}]`
            : filterQuery + `"student_types":[${studentTypesMap}]`;
        } else if (key === 'payment_methods') {
          const paymentMethodsMap = filterData.payment_methods.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"payment_methods":[${paymentMethodsMap}]`
            : filterQuery + `"payment_methods":[${paymentMethodsMap}]`;
        } else if (key === 'financial_profiles') {
          const financialProfilesMap = filterData.financial_profiles.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"financial_profiles":[${financialProfilesMap}]`
            : filterQuery + `"financial_profiles":[${financialProfilesMap}]`;
        } else if (key === 'modality_step_special_form_statuses') {
          const modalityuStepMap = filterData.modality_step_special_form_statuses.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"modality_step_special_form_statuses":[${modalityuStepMap}]`
            : filterQuery + `"modality_step_special_form_statuses":[${modalityuStepMap}]`;
        } else if (key === 'candidate_admission_statuses') {
          const candidateAdmissionStatusMap = filterData.candidate_admission_statuses.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"candidate_admission_statuses":[${candidateAdmissionStatusMap}]`
            : filterQuery + `"candidate_admission_statuses":[${candidateAdmissionStatusMap}]`;
        } else if (key === 'down_payment_statuses') {
          const downPaymentStatuses = filterData.down_payment_statuses.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"down_payment_statuses":[${downPaymentStatuses}]`
            : filterQuery + `"down_payment_statuses":[${downPaymentStatuses}]`;
        } else {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${filterData[key]}` : filterQuery + `"${key}":${filterData[key]}`;
        }
      }
    });
    return 'filter={' + filterQuery + '}';
  }

  cleanFilterDataDownloadExport() {
    let filterQuery = '';
    if(this.exportFilteredValues){
      const filterData = _.cloneDeep(this.exportFilteredValues);
      Object.keys(filterData).forEach((key) => {
        // only add key that has value to the query. so it wont send filter with empty string
        if (filterData[key] || filterData[key] === false) {
          if (
            key === 'scholar_season_id'
          ) {
            filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
          }else if(key=== 'schools' || key === 'offset') {
            filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${filterData[key]}` : filterQuery + `"${key}":${filterData[key]}`;
          }
        }
      });
    }
    return 'filter={' + filterQuery + '}';
  }

  openDownloadCsv(fileType) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const filter = this.cleanFilterDataDownload();
    const importStudentTemlate = `downloadFinanceCandidateData/`;
    // console.log('_ini filter', filter, this.userSelectedId);
    let filtered;
    if (this.buttonClicked !== 'export-controlling' && (this.dataSelected.length && !this.isCheckedAll) || (this.dataUnselectUser && this.dataUnselectUser.length)) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      const billing = `"billing_ids":` + '[' + mappedUserId.toString() + ']';
      if (filter.length > 9) {
        filtered = filter.slice(0, 8) + billing + ',' + filter.slice(8);
      } else {
        filtered = filter.slice(0, 8) + billing + filter.slice(8);
      }
    } else if (this.isCheckedAll && this.buttonClicked !== 'export-controlling') {
      filtered = filter;
    }else if(this.buttonClicked=== 'export-controlling'){
      filtered = this.cleanFilterDataDownloadExport()
    }
    const userTypesList =
      this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id.map((res) => `"` + res + `"`) : [];

    let sorting = this.sortingForExport();
    let fullURL;
    fullURL =
      url +
      importStudentTemlate +
      fileType +
      '/' +
      lang +
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


    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
      }),
    };

    this.isLoading = true;    
    if(this.buttonClicked === 'export') {
      this.exportFinanceStudent(fullURL, httpOptions);
    } else if(this.buttonClicked === 'export-controlling') {
      fullURL = url+'downloadControlingReport/'+ fileType + '/' + lang + '/' + this.currentUserTypeId;
      const uri = encodeURI(fullURL);
      filtered = this.cleanFilterDataExportControlling();
      if (this.buttonClicked !== 'export-controlling' && (this.dataSelected && this.dataSelected?.length && !this.isCheckedAll) || (this.dataUnselectUser && this.dataUnselectUser?.length)) {
        const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
        const billing = `"billing_ids":` + '[' + mappedUserId.toString() + ']';
        if (filtered.length > 9) {          
          filtered = filtered.slice(0, 10) + billing + ',' + filtered.slice(10);          
        } else {
          filtered = filtered.slice(0, 10) + billing + filtered.slice(10);
        }
      }       
      sorting = this.sortingForExportOfAllLines();
      const httpOptions = {
        headers: new HttpHeaders({
          Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
          'Content-Type': 'application/json',
        }),
      };
      const payload = '{'+ filtered + ',' + '"user_type_ids":[' + userTypesList + ']' + ',"user_type_id":' + `"${this.currentUserTypeId}"`+',' + sorting + '}';
      this.exportControllingStudent(uri,httpOptions,payload);
    }
  }

  cleanFilterDataExportControlling() {    
    const filterData = _.cloneDeep(this.exportFilteredValues);
    Object.keys(filterData).forEach((key) => {
      if (!filterData[key] && filterData[key] !== false) {
        delete filterData[key];
      }else if(key !== 'scholar_season_id' && key!== 'schools' && key !== 'offset') {
        delete filterData[key];
      }
    });
    return '"filter":' + JSON.stringify(filterData);
  }

  exportControllingStudent(uri, httpOptions, payload) {
    this.subs.sink = this.httpClient.post(uri, payload, httpOptions).subscribe(
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
            onOpen: (modalEl) => {
              modalEl.setAttribute('data-cy', 'swal-readmission-s3');
            },
          }).then(() => {
            if(this.buttonClicked === 'export-controlling' && this.exportFilteredValues){
              this.exportFilteredValues['scholar_season_id'] = null
              this.exportFilteredValues['schools'] = null;
            }
            this.resetCandidateKeepFilter();
          });
        } else {
          this.isLoading = false;
        }
      },
      (err) => {
        this.isLoading = false;
      },
    );
  }

  exportFinanceStudent(fullURL, httpOptions) {
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
            onOpen: (modalEl) => {
              modalEl.setAttribute('data-cy', 'swal-readmission-s3');
            },
          }).then(() => {
            this.resetCandidateKeepFilter();
          });
        } else {
          this.isLoading = false;
        }
      },
      (err) => {
        this.isLoading = false;
      },
    );
  }
  sortingForExportOfAllLines() {
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

  checkHasFullDiscount(element) {
    if (
      element &&
      element.candidate_id &&
      element.candidate_id.registration_profile &&
      element.candidate_id.registration_profile.discount_on_full_rate &&
      element.candidate_id.registration_profile.discount_on_full_rate === 100
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkHasNoDP(element) {
    if (
      element &&
      element.candidate_id &&
      element.candidate_id.registration_profile &&
      element.candidate_id.registration_profile.is_down_payment &&
      element.candidate_id.registration_profile.is_down_payment === 'no'
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkHasNoAddtionalCost(element) {
    if (
      element &&
      element.candidate_id &&
      element.candidate_id.selected_payment_plan &&
      element.candidate_id.selected_payment_plan.additional_expense === 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkNoPayment(element) {
    if (this.checkHasFullDiscount(element) && this.checkHasNoAddtionalCost(element) && this.checkHasNoDP(element)) {
      return true;
    } else {
      return false;
    }
  }

  checkHasMethodPayment(element) {
    // to check if candidate has 100% discount method of payment will be x
    if (this.checkHasFullDiscount(element)) {
      return true;
    } else {
      return false;
    }
  }

  checkPartiallyTerms(element) {
    // check if partial or not
    if (element && element.is_partial) {
      // make sure term_pay_date and term_payment has value because we need to check if element.term_payment if after element.term_pay_date
      if (element.term_pay_date && element.term_pay_date.date && element.term_payment && element.term_payment.date) {
        const paidDate = moment(element.term_pay_date.date, 'DD/MM/YYYY').endOf('month');
        const dueDate = moment(element.term_payment.date, 'DD/MM/YYYY').endOf('month');
        const isLate = paidDate.isAfter(moment(dueDate, 'DD/MM/YYYY'));
        if (isLate) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  checkIfCandidateTransferHasAmountPaid(amount_paid) {
    // to check if candidate has amount paid after transfer
    if (amount_paid !== '') {
      return true;
    } else {
      return false;
    }
  }

  checkIfCandidateTransferHasDP(downPayment) {
    // to check if candidate has deposit pay amount after transfer
    if (downPayment > 0) {
      return true;
    } else {
      return false;
    }
  }

  onGenerate() {
    if (this.dataSelected.length < 1) {
      this.isLoading = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8_A.Title'),
        html: this.translate.instant('Followup_S8_A.Text', { menu: this.translate.instant('finance') }),
        confirmButtonText: this.translate.instant('Followup_S8_A.Button'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-followup-s8-a');
        },
      });
    } else if (this.hasNoTerms) {
      this.isLoading = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Finance_S1.Title'),
        html: this.translate.instant('Finance_S1.Text'),
        confirmButtonText: this.translate.instant('Finance_S1.Button'),
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: false,
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-finance-s1');
        },
      });
    } else {
      const id = [];
      this.dataSelected.forEach((item) => {
        id.push(item._id);
      });
      Swal.fire({
        type: 'question',
        text: this.translate.instant('Generate.question'),
        showCancelButton: true,
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
        cancelButtonText: this.translate.instant('INTERNSHIP_S2.BUTTON_2'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-generate-billing');
        },
      }).then((resp) => {
        if (resp.value) {
          const payloadFilter = _.cloneDeep(this.filteredValues);
          if (payloadFilter.school_id) {
            if (Array.isArray(payloadFilter.school_id)) {
              payloadFilter.school_id = payloadFilter.school_id && payloadFilter.school_id.length ? payloadFilter.school_id[0] : null;
            }
          } else {
            payloadFilter.school_id = null;
          }
          if (payloadFilter.campus && payloadFilter.school_id) {
            if (Array.isArray(payloadFilter.campus)) {
              payloadFilter.campus = payloadFilter.campus && payloadFilter.campus.length ? payloadFilter.campus[0] : null;
              const campus = this.campusList.find((list) => list && list.name === payloadFilter.campus);
              payloadFilter.campus = campus._id;
            }
          } else {
            payloadFilter.campus = null;
          }
          if (payloadFilter.level) {
            if (Array.isArray(payloadFilter.level)) {
              payloadFilter.level = payloadFilter.level && payloadFilter.level.length ? payloadFilter.level[0] : null;
              const lvl = this.levels.find((list) => list && list.name === payloadFilter.level);
              payloadFilter.level = lvl._id;
            }
          } else {
            payloadFilter.level = null;
          }
          if (payloadFilter.hasOwnProperty('tags')) {
            payloadFilter['tag_ids'] = payloadFilter.tags ? payloadFilter.tags : null;
            delete payloadFilter.tags;
          }
          payloadFilter.tag_ids = payloadFilter.tag_ids?.length ? payloadFilter.tag_ids : null;
          this.isLoading = true;
          const userTypesList = this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
          this.subs.sink = this.candidatesService.generateStudentBilling(this.isCheckedAll, payloadFilter, id, userTypesList).subscribe(
            (res) => {
              this.isLoading = false;
              if (res) {
                Swal.fire({
                  type: 'success',
                  title: 'Bravo!',
                  confirmButtonText: 'OK',
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                  onOpen: (modalEl) => {
                    modalEl.setAttribute('data-cy', 'swal-bravo');
                  },
                }).then(() => {
                  this.resetCandidateKeepFilter();
                });
              }
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
              }
              console.log('_err', err['message']);
              if (err['message'] === 'GraphQL error: some student has type of fomation initial') {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('Finance_S2.TITLE'),
                  html: this.translate.instant('Finance_S2.TEXT'),
                  confirmButtonText: this.translate.instant('Finance_S2.BUTTON'),
                  onOpen: (modalEl) => {
                    modalEl.setAttribute('data-cy', 'swal-finance-s2');
                  },
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
          this.isLoading = false;
        }
      });
    }
  }

  openDialogExportControllingReport() {
    this.subs.sink = this.dialog
      .open(ExportControllingReportDialogComponent, {
        width: '600px',
        minHeight: '100px',
        data: {
          currentUserTypeId: this.currentUser
        },
        disableClose: true,
        panelClass: 'certification-rule-pop-up',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {          
          this.exportFilteredValues = _.cloneDeep(this.filteredValues)
          this.exportFilteredValues.scholar_season_id = res?.scholar_season;
          this.exportFilteredValues.schools = res?.schools;       
          this.getDataDownloadCSVCheckbox(0);
        }
      });
  }

  checkBillingDoesntHaveTerm(data) {
    if (data && data.terms && data.terms.length === 0) {
      return true;
    } else {
      return false;
    }
  }
  getLegalEntityForDropdown() {
    this.subs.sink = this.financeService.getAllLegalEntitiesDropdownByActiveBilling().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.listOfLegalEntity = _.cloneDeep(resp.sort((a, b) => (a.legal_entity_name > b.legal_entity_name ? 1 : -1)));
        } else {
          this.listOfLegalEntity = [];
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

  getNameForAskingPayment(data) {
    const name = [];
    if (data.is_financial_support) {
      const financier = data.financial_support_info;
      if (financier.name) {
        name.push(financier.name);
      }
      if (financier.family_name) {
        name.push(String(financier.family_name).toUpperCase());
      }
      if (financier.civility) {
        name.push(this.translate.instant(financier.civility));
      } // End financier
    } else {
      const candidate = data.candidate_id;
      if (candidate.first_name) {
        name.push(candidate.first_name);
      }
      if (candidate.last_name) {
        name.push(String(candidate.last_name).toUpperCase());
      }
      if (candidate.civility && candidate.civility !== 'neutral') {
        name.push(this.translate.instant(candidate.civility));
      } // End candidate
    }
    return name.join(' ');
  }

  askingForPaymentAction(data) {
    if (
      data?.deposit_status !== 'paid' &&
      data?.candidate_id?.registration_profile?.is_down_payment !== 'no' &&
      data?.candidate_id?.payment !== 'done'
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('ASKING_PAYMENT_S4.TITLE'),
        html: this.translate.instant('ASKING_PAYMENT_S4.TEXT'),
        confirmButtonText: this.translate.instant('ASKING_PAYMENT_S4.BUTTON'),
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: false,
      });
      return;
    }

    let tempAccumulated = 0;
    let tempTermsSelectedStudent: boolean;
    data?.terms?.forEach((term) => {
      if (term?.term_amount_chargeback) {
        tempAccumulated += term.term_amount_chargeback;
      } else if (term?.term_pay_amount) {
        tempAccumulated += term.term_pay_amount;
      };
    });

    if(
      (tempAccumulated && tempAccumulated === data?.amount_billed) ||
      !data?.terms?.length || 
      data?.terms?.every((term) => term?.is_term_paid && !term?.is_partial)
    ) {
      tempTermsSelectedStudent = true;
    } else {
      tempTermsSelectedStudent = false;
    }

    const id = [];
    id.push(data._id);
    const inputOptions = {
      transfer: this.translate.instant('ASKING_PAYMENT.Transfer'),
      unpaid: this.translate.instant('ASKING_PAYMENT.Unpaid'),
    };

    if(tempTermsSelectedStudent) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('ASKING_PAYMENT_S5.TITLE'),
        html: this.translate.instant('ASKING_PAYMENT_S5.TEXT'),
        confirmButtonText: this.translate.instant('ASKING_PAYMENT_S5.BUTTON'),
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: false,
      }).then(() => {
        return;
      });
    } else {
      Swal.fire({
        title: this.translate.instant('ASKING_PAYMENT.TITLE'),
        type: 'question',
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('ASKING_PAYMENT.BUTTON1'),
        cancelButtonText: this.translate.instant('ASKING_PAYMENT.BUTTON2'),
        allowOutsideClick: false,
        allowEnterKey: false,
        input: 'radio',
        inputOptions: inputOptions,
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
            if ((<HTMLInputElement>e.target).value) {
              Swal.enableConfirmButton();
            }
          });
          // const input = Swal.getInput();
          // const inputValue = input.getAttribute('value');
          // if (inputValue === ';') {
          //   Swal.enableConfirmButton();
          // }
        },
      }).then((resp) => {
        if (resp.value === 'transfer') {
          this.sendPayN2(id);
        } else if (resp.value === 'unpaid') {
          this.sendPayN9(id);
        }
      });
    }

  }

  askingForPaymentAbove() {
    if (this.dataSelected && this.dataSelected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8_A.Title'),
        html: this.translate.instant('Followup_S8_A.Text', { menu: this.translate.instant('finance') }),
        confirmButtonText: this.translate.instant('Followup_S8_A.Button'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-followup-s8-a');
        },
      });
    } else {
      const selected = this.dataSelected;
      const id = [];
      if (selected && selected.length && selected.length > 0) {
        for (const billing of selected) {
          if (billing && billing._id) {
            id.push(billing._id);
          } else {
            continue;
          }
        }
      }

      const inputOptions = {
        transfer: this.translate.instant('ASKING_PAYMENT.Transfer'),
        unpaid: this.translate.instant('ASKING_PAYMENT.Unpaid'),
      };

      const tempTermsSelectedStudent = [];
      selected?.forEach((student) => {
        let tempAccumulated;
        student?.terms?.forEach((term) => {
          if (term?.term_amount_chargeback) {
            tempAccumulated += term.term_amount_chargeback;
          } else if (term?.term_pay_amount) {
            tempAccumulated += term.term_pay_amount;
          };
        });

        if(
          (tempAccumulated && tempAccumulated === student?.amount_billed) ||
          !student?.terms?.length || 
          student?.terms?.every((term) => term?.is_term_paid && !term?.is_partial)
        ) {
          tempTermsSelectedStudent?.push(true);
        } else {
          tempTermsSelectedStudent?.push(false);
        }
      })
      if (tempTermsSelectedStudent?.length > 1 && tempTermsSelectedStudent?.some(Boolean)) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('ASKING_PAYMENT_S3.TITLE'),
          html: this.translate.instant('ASKING_PAYMENT_S3.TEXT'),
          confirmButtonText: this.translate.instant('ASKING_PAYMENT_S3.BUTTON'),
          allowOutsideClick: false,
          allowEnterKey: false,
          allowEscapeKey: false,
        }).then(() => {
          if(tempTermsSelectedStudent?.every(Boolean)) {
            return;
          } else {
            Swal.fire({
              title: this.translate.instant('ASKING_PAYMENT.TITLE'),
              type: 'question',
              allowEscapeKey: true,
              showCancelButton: true,
              confirmButtonText: this.translate.instant('ASKING_PAYMENT.BUTTON1'),
              cancelButtonText: this.translate.instant('ASKING_PAYMENT.BUTTON2'),
              allowOutsideClick: false,
              allowEnterKey: false,
              input: 'radio',
              inputOptions: inputOptions,
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
                  if ((<HTMLInputElement>e.target).value) {
                    Swal.enableConfirmButton();
                  }
                });
              },
            }).then((resp) => {
              if (resp.value === 'transfer') {
                this.sendPayN2(id);
              } else if (resp.value === 'unpaid') {
                this.sendPayN9(id);
              }
            });
          }
        });
      } else {
        if(tempTermsSelectedStudent?.length === 1 && tempTermsSelectedStudent?.every(Boolean)) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('ASKING_PAYMENT_S5.TITLE'),
            html: this.translate.instant('ASKING_PAYMENT_S5.TEXT'),
            confirmButtonText: this.translate.instant('ASKING_PAYMENT_S5.BUTTON'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          }).then(() => {
            return;
          });
        } else {
          Swal.fire({
            title: this.translate.instant('ASKING_PAYMENT.TITLE'),
            type: 'question',
            allowEscapeKey: true,
            showCancelButton: true,
            confirmButtonText: this.translate.instant('ASKING_PAYMENT.BUTTON1'),
            cancelButtonText: this.translate.instant('ASKING_PAYMENT.BUTTON2'),
            allowOutsideClick: false,
            allowEnterKey: false,
            input: 'radio',
            inputOptions: inputOptions,
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
                if ((<HTMLInputElement>e.target).value) {
                  Swal.enableConfirmButton();
                }
              });
              // const input = Swal.getInput();
              // const inputValue = input.getAttribute('value');
              // if (inputValue === ';') {
              //   Swal.enableConfirmButton();
              // }
            },
          }).then((resp) => {
            // clearTimeout(this.timeOutVal);
            if (resp.value === 'transfer') {
              this.sendPayN2(id);
            } else if (resp.value === 'unpaid') {
              this.sendPayN9(id);
            }
          });
        }
      }
    }
  }

  sendPayN2(payload) {
    const filter = this.cleanFilterData();
    this.isLoading = true;
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.termPaymentService.sendPayN2(filter, payload, userTypesList).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          if (res?.includes('asking for payment is in progress')) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('ASKING_PAYMENT_S6.TITLE'),
              html: this.translate.instant('ASKING_PAYMENT_S6.TEXT'),
              confirmButtonText: this.translate.instant('ASKING_PAYMENT_S6.BUTTON 1'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
              onOpen: (modalEl) => {
                modalEl.setAttribute('data-cy', 'swal-bravo');
              },
            }).then(() => {
              this.selection.clear();
              this.dataSelected = [];
              this.isCheckedAll = false;
              this.userSelected = [];
              this.userSelectedId = [];
              this.getDataBilling('After Send PAY_N2');
            });
          } else {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
              onOpen: (modalEl) => {
                modalEl.setAttribute('data-cy', 'swal-bravo');
              },
            }).then(() => {
              this.selection.clear();
              this.dataSelected = [];
              this.isCheckedAll = false;
              this.userSelected = [];
              this.userSelectedId = [];
              this.getDataBilling('After Send PAY_N2');
            });
          }
        }
      },
      (err) => {
        this.isLoading = false;
        this.userService.postErrorLog(err);
        const msg = String(err?.message ? err.message : err);
        if (msg.includes('Your down payment has not been paid, please complete the payment before continuing the asking payment')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('ASKING_PAYMENT_S4.TITLE'),
            html: this.translate.instant('ASKING_PAYMENT_S4.TEXT'),
            confirmButtonText: this.translate.instant('ASKING_PAYMENT_S4.BUTTON'),
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

  sendPayN9(payload) {
    const filter = this.cleanFilterData();
    this.isLoading = true;
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.termPaymentService.sendPayN9(filter, payload, userTypesList).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          if (res?.includes('asking for payment is in progress')) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('ASKING_PAYMENT_S6.TITLE'),
              html: this.translate.instant('ASKING_PAYMENT_S6.TEXT'),
              confirmButtonText: this.translate.instant('ASKING_PAYMENT_S6.BUTTON 1'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
              onOpen: (modalEl) => {
                modalEl.setAttribute('data-cy', 'swal-bravo');
              },
            }).then(() => {
              this.selection.clear();
              this.dataSelected = [];
              this.isCheckedAll = false;
              this.userSelected = [];
              this.userSelectedId = [];
              this.getDataBilling('After Send PAY_N2');
            });
          } else {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
              onOpen: (modalEl) => {
                modalEl.setAttribute('data-cy', 'swal-bravo');
              },
            }).then(() => {
              this.selection.clear();
              this.dataSelected = [];
              this.isCheckedAll = false;
              this.userSelected = [];
              this.userSelectedId = [];
              this.getDataBilling('After Send PAY_N2');
            });
          }
        }
      },
      (err) => {
        this.isLoading = false;
        this.userService.postErrorLog(err);
        const msg = String(err?.message ? err.message : err);
        if (msg.includes('Your down payment has not been paid, please complete the payment before continuing the asking payment')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('ASKING_PAYMENT_S4.TITLE'),
            html: this.translate.instant('ASKING_PAYMENT_S4.TEXT'),
            confirmButtonText: this.translate.instant('ASKING_PAYMENT_S4.BUTTON'),
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

  getDataAskingForPaymentCheckbox(pageNumber) {
    if (this.buttonClicked === 'payment') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allBillingForCheckbox = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const filter = this.cleanFilterData();
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        this.subs.sink = this.financeService.getAllBillingIdCheckbox(pagination, this.sortValue, filter, userTypesList).subscribe(
          (students: any) => {
            if (students && students.length) {
              this.allBillingForCheckbox.push(...students);
              const page = pageNumber + 1;
              this.getDataAskingForPaymentCheckbox(page);
            } else {
              this.isLoading = false;
              if (this.isCheckedAll && this.allBillingForCheckbox && this.allBillingForCheckbox.length) {
                this.dataSelected = this.allBillingForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                if (this.dataSelected && this.dataSelected.length) {
                  this.askingForPaymentAbove();
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
        this.askingForPaymentAbove();
      }
    }
  }
  getDataGenerateCheckbox(pageNumber) {
    if (this.buttonClicked === 'billing') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allBillingForCheckbox = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const filter = this.cleanFilterData();
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        this.subs.sink = this.financeService.getAllBillingIdCheckbox(pagination, this.sortValue, filter, userTypesList).subscribe(
          (students: any) => {
            if (students && students.length) {
              this.allBillingForCheckbox.push(...students);
              const page = pageNumber + 1;
              this.getDataGenerateCheckbox(page);
            } else {
              this.isLoading = false;
              if (this.isCheckedAll && this.allBillingForCheckbox && this.allBillingForCheckbox.length) {
                this.dataSelected = this.allBillingForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                if (this.dataSelected && this.dataSelected.length) {
                  this.onGenerate();
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
        this.onGenerate();
      }
    }
  }
  getDataSendMultipleEmailCheckbox(pageNumber) {
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
        this.subs.sink = this.financeService.getAllBillingSendEmailCheckbox(pagination, this.sortValue, filter, userTypesList).subscribe(
          (students: any) => {
            if (students && students.length) {
              this.allEmailForCheckbox.push(...students);
              const page = pageNumber + 1;
              this.getDataSendMultipleEmailCheckbox(page);
            } else {
              this.isLoading = false;
              if (this.isCheckedAll && this.allEmailForCheckbox && this.allEmailForCheckbox.length) {
                this.dataSelected = this.allEmailForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
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
  getDataDownloadCSVCheckbox(pageNumber) {
    if (this.buttonClicked === 'export' || this.buttonClicked === 'export-controlling') {
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
          this.subs.sink = this.financeService.getAllBillingIdCheckbox(pagination, this.sortValue, filter, userTypesList).subscribe(
            (students: any) => {
              if (students && students.length) {
                this.allExportForCheckbox.push(...students);
                const page = pageNumber + 1;
                this.getDataDownloadCSVCheckbox(page);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allExportForCheckbox && this.allExportForCheckbox.length) {
                  this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length) {
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

  controllerButton(action) {
    switch (action) {
      case 'payment':
        setTimeout(() => {
          this.getDataAskingForPaymentCheckbox(0);
        }, 500);
        break;
      case 'billing':
        setTimeout(() => {
          this.getDataGenerateCheckbox(0);
        }, 500);
        break;
      case 'email':
        setTimeout(() => {
          this.getDataSendMultipleEmailCheckbox(0);
        }, 500);
        break;
      case 'export':
        setTimeout(() => {
          this.getDataDownloadCSVCheckbox(0);
        }, 500);
        break;
      case 'export-controlling':
        this.openDialogExportControllingReport();
        break;
      default:
        this.resetCandidateKeepFilter();
    }
  }

  
  clearSelectIfFilter() {
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.selectType = '';
    this.userSelected = [];
    this.userSelectedId = [];
  }

  applySuperFilter() {
    this.dataSource.data = [];
    this.dataCount = 0;
    this.dataUnselectUser = [];
    this.paginator.pageIndex = 0;
    this.paginator.length = 0;
    this.filteredValues = {
      ...this.filteredValues,
      scholar_season_id: this.superFilter.scholar_season_id,
      school_id: this.superFilter.school_id,
      campus: this.superFilter.campus,
      level: this.superFilter.level,
      tags: this.superFilter.tags,
      sectors: this.superFilter.sectors,
      specialities: this.superFilter.specialities,
    };
    this.isDisabled = true;
    this.paginator.firstPage();
    this.getDataBilling('superFilter');
  }
  filterBreadcrumbFormat() {

    const profileRateValue =
      this.filteredValues.term_counts || this.filteredValues?.term_counts === 0
        ? this.filteredValues.term_counts + ' ' + this.translate.instant('termss')
        : null;
    const filterInfo: FilterBreadCrumbInput[] = [
      // super filter
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'scholar_season_id', // name of the key in the object storing the filter
        column: 'CARDDETAIL.Scholar Season', // name of the column in the table or the field if super filter
        isMultiple: true, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.scholars, // the array/list holding the dropdown options
        filterRef: this.scholarFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'scholar_season', // the key displayed in the html (only applicable to array of objects)
        savedValue: '_id', // the value saved when user select an option (e.g. _id)
        resetValue: 'All',
      },
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'school_id', // name of the key in the object storing the filter
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.School', // name of the column in the table or the field if super filter
        isMultiple: this.schoolsFilter?.value?.length === this.school?.length ? false : true,
        filterValue: this.schoolsFilter?.value?.length === this.school?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.schoolsFilter?.value?.length === this.school?.length ? null : this.school,
        filterRef: this.schoolsFilter,
        isSelectionInput: this.schoolsFilter?.value?.length === this.school?.length ? false : true,
        displayKey: this.schoolsFilter?.value?.length === this.school?.length ? null : 'short_name',
        savedValue: this.schoolsFilter?.value?.length === this.school?.length ? null : '_id',
        resetValue: null,
      },
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'campus', // name of the key in the object storing the filter
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus', // name of the column in the table or the field if super filter
        isMultiple: this.campusFilter?.value?.length === this.campusList?.length ? false : true,
        filterValue: this.campusFilter?.value?.length === this.campusList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.campusFilter?.value?.length === this.campusList?.length ? null : this.campusList,
        filterRef: this.campusFilter,
        isSelectionInput: this.campusFilter?.value?.length === this.campusList?.length ? false : true,
        displayKey: this.campusFilter?.value?.length === this.campusList?.length ? null : 'name',
        savedValue: this.campusFilter?.value?.length === this.campusList?.length ? null : 'name',
      },
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'level', // name of the key in the object storing the filter
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level', // name of the column in the table or the field if super filter
        isMultiple: this.levelFilter?.value?.length === this.levels?.length ? false : true,
        filterValue: this.levelFilter?.value?.length === this.levels?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.levelFilter?.value?.length === this.levels?.length ? null : this.levels,
        filterRef: this.levelFilter,
        isSelectionInput: this.levelFilter?.value?.length === this.levels?.length ? false : true,
        displayKey: this.levelFilter?.value?.length === this.levels?.length ? null : 'name',
        savedValue: this.levelFilter?.value?.length === this.levels?.length ? null : 'name',
      },
      {
        type: 'super_filter',
        name: 'sectors',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Sector',
        isMultiple: this.sectorFilter?.value?.length === this.sectorList?.length ? false : true,
        filterValue: this.sectorFilter?.value?.length === this.sectorList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.sectorFilter?.value?.length === this.sectorList?.length ? null : this.sectorList,
        filterRef: this.sectorFilter,
        isSelectionInput: this.sectorFilter?.value?.length === this.sectorList?.length ? false : true,
        displayKey: this.sectorFilter?.value?.length === this.sectorList?.length ? null : 'name',
        savedValue: this.sectorFilter?.value?.length === this.sectorList?.length ? null : '_id',
      },
      {
        type: 'super_filter',
        name: 'specialities',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Speciality',
        isMultiple: this.specialityFilter?.value?.length === this.specialityList?.length ? false : true,
        filterValue: this.specialityFilter?.value?.length === this.specialityList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.specialityFilter?.value?.length === this.specialityList?.length ? null : this.specialityList,
        filterRef: this.specialityFilter,
        isSelectionInput: this.specialityFilter?.value?.length === this.specialityList?.length ? false : true,
        displayKey: this.specialityFilter?.value?.length === this.specialityList?.length ? null : 'name',
        savedValue: this.specialityFilter?.value?.length === this.specialityList?.length ? null : '_id',
      },
      {
        type: 'super_filter',
        name: 'tags',
        column: 'All_Students.Tag',
        isMultiple: this.tagFilter?.value?.length === this.tagList?.length ? false : true,
        filterValue: this.tagFilter?.value?.length === this.tagList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.tagFilter?.value?.length === this.tagList?.length ? null : this.tagList,
        filterRef: this.tagFilter,
        isSelectionInput: this.tagFilter?.value?.length === this.tagList?.length ? false : true,
        displayKey: this.tagFilter?.value?.length === this.tagList?.length ? null : 'name',
        savedValue: this.tagFilter?.value?.length === this.tagList?.length ? null : '_id',
      },
      // filter above table
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'term_from', // name of the key in the object storing the filter
        column: 'From', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.fromDateFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'term_to', // name of the key in the object storing the filter
        column: 'To', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.toDateFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'term_status', // name of the key in the object storing the filter
        column: 'Status', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.statusFilterList, // the array/list holding the dropdown options
        filterRef: this.statusFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'key', // the key displayed in the html (only applicable to array of objects)
        savedValue: 'value', // the value saved when user select an option (e.g. _id)
        resetValue: 'All',
      },
      // Table Filter
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'account_number', // name of the key in the object storing the filter
        column: 'Account Number', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.accountFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'candidate_last_name',
        column: 'Student',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.studentFilter,
        isSelectionInput: false,
        displayKey: null,
        savedValue: null,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'intake_channels',
        column: 'Current Program',
        isMultiple: this.currentProgramFilter?.value?.length === this.intakeList?.length ? false : true,
        filterValue: this.currentProgramFilter?.value?.length === this.intakeList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.currentProgramFilter?.value?.length === this.intakeList?.length ? null : this.intakeList,
        filterRef: this.currentProgramFilter,
        isSelectionInput: this.currentProgramFilter?.value?.length === this.intakeList?.length ? false : true,
        displayKey: this.currentProgramFilter?.value?.length === this.intakeList?.length ? null : 'program',
        savedValue: this.currentProgramFilter?.value?.length === this.intakeList?.length ? null : '_id',
        resetValue: null,
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
        name: 'financial_profiles',
        column: 'Financial Profile',
        isMultiple: this.financialFilter?.value?.length === this.financeFilterList?.length ? false : true,
        filterValue: this.financialFilter?.value?.length === this.financeFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.financialFilter?.value?.length === this.financeFilterList?.length ? null : this.financeFilterList,
        filterRef: this.financialFilter,
        isSelectionInput: this.financialFilter?.value?.length === this.financeFilterList?.length ? false : true,
        displayKey: this.financialFilter?.value?.length === this.financeFilterList?.length ? null : 'key',
        savedValue: this.financialFilter?.value?.length === this.financeFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'candidate_admission_statuses',
        column: 'AdmissionFollowUp.Status',
        isMultiple: this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length ? false : true,
        filterValue:
          this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length ? null : this.studentStatusFilterList,
        filterRef: this.studentStatusFilter,
        isSelectionInput: this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length ? false : true,
        displayKey: this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length ? null : 'key',
        savedValue: this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'student_types',
        column: 'Type',
        isMultiple: this.typeFilter?.value?.length === this.typeFilterList?.length ? false : true,
        filterValue: this.typeFilter?.value?.length === this.typeFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.typeFilter?.value?.length === this.typeFilterList?.length ? null : this.typeFilterList,
        filterRef: this.typeFilter,
        isSelectionInput: this.typeFilter?.value?.length === this.typeFilterList?.length ? false : true,
        displayKey: this.typeFilter?.value?.length === this.typeFilterList?.length ? null : 'key',
        savedValue: this.typeFilter?.value?.length === this.typeFilterList?.length ? null : 'value',
        resetValue: null,
        translationPrefix: this.typeFilter?.value?.length !== this.typeFilterList?.length ? 'type_formation.' : null,
      },
      {
        type: 'table_filter',
        name: 'term_counts',
        column: 'Profil rate',
        isMultiple: this.profileRateFilter?.value?.length === this.listTerm?.length ? false : true,
        filterValue: this.profileRateFilter?.value?.length === this.listTerm?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.profileRateFilter?.value?.length === this.listTerm?.length ? null : this.listTerm,
        filterRef: this.profileRateFilter,
        isSelectionInput: this.profileRateFilter?.value?.length === this.listTerm?.length ? false : true,
        displayKey: this.profileRateFilter?.value?.length === this.listTerm?.length ? null : 'label',
        savedValue: this.profileRateFilter?.value?.length === this.listTerm?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'payment_methods',
        column: 'Paiement Method',
        isMultiple: this.paymentFilter?.value?.length === this.paymentMode?.length ? false : true,
        filterValue: this.paymentFilter?.value?.length === this.paymentMode?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.paymentFilter?.value?.length === this.paymentMode?.length ? null : this.paymentMode,
        filterRef: this.paymentFilter,
        isSelectionInput: this.paymentFilter?.value?.length === this.paymentMode?.length ? false : true,
        displayKey: this.paymentFilter?.value?.length === this.paymentMode?.length ? null : 'key',
        savedValue: this.paymentFilter?.value?.length === this.paymentMode?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'type_of_registrations',
        column: 'Type of Registration',
        isMultiple: this.type_of_registration?.value?.length === this.type_of_registrations?.length ? false : true,
        filterValue:
          this.type_of_registration?.value?.length === this.type_of_registrations?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.type_of_registration?.value?.length === this.type_of_registrations?.length ? null : this.type_of_registrations,
        filterRef: this.type_of_registration,
        isSelectionInput: this.type_of_registration?.value?.length === this.type_of_registrations?.length ? false : true,
        displayKey: this.type_of_registration?.value?.length === this.type_of_registrations?.length ? null : 'label',
        savedValue: this.type_of_registration?.value?.length === this.type_of_registrations?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'financial_support_last_name',
        column: 'Finance Sponsor',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.financialSupportFilter,
        isSelectionInput: false,
        displayKey: null,
        savedValue: null,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'is_have_special_cases',
        column: 'Special Case',
        isMultiple: this.specialCaseFilter?.value?.length === this.specialCaseFilterList?.length ? false : true,
        filterValue:
          this.specialCaseFilter?.value?.length === this.specialCaseFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.specialCaseFilter?.value?.length === this.specialCaseFilterList?.length ? null : this.specialCaseFilterList,
        filterRef: this.specialCaseFilter,
        isSelectionInput: this.specialCaseFilter?.value?.length === this.specialCaseFilterList?.length ? false : true,
        displayKey: this.specialCaseFilter?.value?.length === this.specialCaseFilterList?.length ? null : 'key',
        savedValue: this.specialCaseFilter?.value?.length === this.specialCaseFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'pay_n2s',
        column: 'Latest Ask For Payment',
        isMultiple: this.latestAskForPaymentFilter?.value?.length === this.latestAskForPaymentFilterList?.length ? false : true,
        filterValue:
          this.latestAskForPaymentFilter?.value?.length === this.latestAskForPaymentFilterList?.length
            ? this.filteredValuesAll
            : this.filteredValues,
        filterList:
          this.latestAskForPaymentFilter?.value?.length === this.latestAskForPaymentFilterList?.length
            ? null
            : this.latestAskForPaymentFilterList,
        filterRef: this.latestAskForPaymentFilter,
        isSelectionInput: this.latestAskForPaymentFilter?.value?.length === this.latestAskForPaymentFilterList?.length ? false : true,
        displayKey: this.latestAskForPaymentFilter?.value?.length === this.latestAskForPaymentFilterList?.length ? null : 'label',
        savedValue: this.latestAskForPaymentFilter?.value?.length === this.latestAskForPaymentFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'down_payment_statuses',
        column: 'Deposit',
        isMultiple: this.depositFilter?.value?.length === this.DPFilterList?.length ? false : true,
        filterValue: this.depositFilter?.value?.length === this.DPFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.depositFilter?.value?.length === this.DPFilterList?.length ? null : this.DPFilterList,
        filterRef: this.depositFilter,
        isSelectionInput: this.depositFilter?.value?.length === this.DPFilterList?.length ? false : true,
        displayKey: this.depositFilter?.value?.length === this.DPFilterList?.length ? null : 'value',
        savedValue: this.depositFilter?.value?.length === this.DPFilterList?.length ? null : 'value',
        resetValue: null,
        translationPrefix: this.depositFilter?.value?.length !== this.DPFilterList?.length ? 'DP_Status.' : null,
      },
      {
        type: 'table_filter',
        name: 'first_term_statuses',
        column: 'Term 1',
        isMultiple: this.terms1Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms1Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms1Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms1Filter,
        isSelectionInput: this.terms1Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms1Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms1Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'second_term_statuses',
        column: 'Term 2',
        isMultiple: this.terms2Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms2Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms2Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms2Filter,
        isSelectionInput: this.terms2Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms2Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms2Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'third_term_statuses',
        column: 'Term 3',
        isMultiple: this.terms3Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms3Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms3Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms3Filter,
        isSelectionInput: this.terms3Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms3Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms3Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'fourth_term_statuses',
        column: 'Term 4',
        isMultiple: this.terms4Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms4Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms4Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms4Filter,
        isSelectionInput: this.terms4Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms4Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms4Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'fifth_term_statuses',
        column: 'Term 5',
        isMultiple: this.terms5Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms5Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms5Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms5Filter,
        isSelectionInput: this.terms5Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms5Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms5Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'sixth_term_statuses',
        column: 'Term 6',
        isMultiple: this.terms6Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms6Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms6Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms6Filter,
        isSelectionInput: this.terms6Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms6Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms6Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'seventh_term_statuses',
        column: 'Term 7',
        isMultiple: this.terms7Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms7Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms7Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms7Filter,
        isSelectionInput: this.terms7Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms7Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms7Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'eighth_term_statuses',
        column: 'Term 8',
        isMultiple: this.terms8Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms8Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms8Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms8Filter,
        isSelectionInput: this.terms8Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms8Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms8Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'ninth_term_statuses',
        column: 'Term 9',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.DPandTermsFilterList,
        filterRef: this.terms9Filter,
        isSelectionInput: true,
        displayKey: this.terms9Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms9Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'tenth_term_statuses',
        column: 'Term 10',
        isMultiple: this.terms10Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms10Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms10Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms10Filter,
        isSelectionInput: this.terms10Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms10Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms10Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'eleventh_term_statuses',
        column: 'Term 11',
        isMultiple: this.terms11Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms11Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms11Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms11Filter,
        isSelectionInput: this.terms11Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms11Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms11Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'twelveth_term_statuses',
        column: 'Term 12',
        isMultiple: this.terms12Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms12Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms12Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms12Filter,
        isSelectionInput: this.terms12Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms12Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms12Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }
  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      if (
        filterItem?.type === 'super_filter' &&
        (filterItem?.name === 'scholar_season_id' ||
          filterItem?.name === 'school_id' ||
          filterItem?.name === 'campus' ||
          filterItem?.name === 'level')
      ) {
        this.superFilter[filterItem?.name] = null;
      } else if (filterItem?.column === 'Profil rate') {
        this.filteredValues.term_count = null;
      } else if (filterItem.name === 'intake_channel' && filterItem?.type === 'table_filter') {
        filterItem.resetValue = this.translate.instant('All');
      }

      if (filterItem.name === 'scholar_season_id') {
        this.scholarFilter.setValue('');
        this.scholarSelect();
        this.filteredValues.school_id = '';
        this.filteredValues.campus = '';
        this.filteredValues.level = '';
        this.filteredValues.sectors = '';
        this.filteredValues.specialities = '';
      } else if (filterItem.name === 'school_id') {
        this.checkSuperFilterSchool();
        // this.getDataForList('')
        this.filteredValues.campus = '';
        this.filteredValues.level = '';
        this.filteredValues.sectors = '';
        this.filteredValues.specialities = '';
      } else if (filterItem.name === 'campus') {
        // this.campusFilter.setValue('')
        this.checkSuperFilterCampus();
        this.filteredValues.level = '';
        this.filteredValues.sectors = '';
        this.filteredValues.specialities = '';
      } else if (filterItem.name === 'level') {
        //  this.levelFilter.setValue('')
        this.checkSuperFilterLevel();
        this.filteredValues.sectors = '';
        this.filteredValues.specialities = '';
      } else if (filterItem.name === 'sectors') {
        this.sectorFilter.setValue('');
        this.selectSectorFilter();
        this.filteredValues.specialities = '';
      } else if (filterItem.name === 'specialities') {
        this.specialityFilter.setValue('');
      }
      this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.filteredValues, this.filteredValues, this.filteredValues);
      this.clearSelectIfFilter();
      this.getDataBilling('filter breadcrumb');
    }
  }

  // onFilterSelect(value: string | null) {
  //   const result = value !== 'All' ? value : null;
  //   this.filteredValues.type_of_registration = result;
  //   this.clearSelectIfFilter();
  //   this.paginator.firstPage();
  //   if (!this.isReset) {
  //     this.getDataBilling('filter select');
  //   }
  // }

  isAllDropdownSelectedTable(type) {
    const listTypeTerms = [
      'terms1',
      'terms2',
      'terms3',
      'terms4',
      'terms5',
      'terms6',
      'terms7',
      'terms8',
      'terms9',
      'terms10',
      'terms11',
      'terms12',
    ];
    if (type === 'intakeChannel') {
      const selected = this.currentProgramFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.intakeList.length;
      return isAllSelected;
    } else if (type === 'studentType') {
      const selected = this.typeFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.typeFilterList.length;
      return isAllSelected;
    } else if (type === 'paymentMethod') {
      const selected = this.paymentFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.paymentMode.length;
      return isAllSelected;
    } else if (type === 'profileFinance') {
      const selected = this.financialFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.financeFilterList.length;
      return isAllSelected;
    } else if (type === 'paymentInformation') {
      const selected = this.paymentInformationFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.paymentInformationFilterList.length;
      return isAllSelected;
    } else if (type === 'studentStatus') {
      const selected = this.studentStatusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.studentStatusFilterList.length;
      return isAllSelected;
    } else if (type === 'downPayment') {
      const selected = this.depositFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPFilterList.length;
      return isAllSelected;
    } else if (listTypeTerms.includes(type)) {
      return this.handleCheckedTerms(type);
    } else if (type === 'legalEntity') {
      const selected = this.legalEntityFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listOfLegalEntity.length;
      return isAllSelected;
    } else if (type === 'latestPayment') {
      const selected = this.latestAskForPaymentFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.latestAskForPaymentFilterList.length;
      return isAllSelected;
    } else if (type === 'typeRegistration') {
      const selected = this.type_of_registration.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.type_of_registrations.length;
      return isAllSelected;
    } else if (type === 'profileRate') {
      const selected = this.profileRateFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listTerm.length;
    }
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
    } else if (type === 'tags') {
      const selected = this.tagFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.tagList.length;
      return isAllSelected;
    } else if (type === 'specialCase') {
      const selected = this.specialCaseFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.specialCaseFilterList.length;
      return isAllSelected;
    }
  }

  handleCheckedTerms(terms) {
    if (terms === 'terms1') {
      const selected = this.terms1Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms2') {
      const selected = this.terms2Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms3') {
      const selected = this.terms3Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms4') {
      const selected = this.terms4Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms5') {
      const selected = this.terms5Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms6') {
      const selected = this.terms6Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms7') {
      const selected = this.terms7Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms8') {
      const selected = this.terms8Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms9') {
      const selected = this.terms9Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms10') {
      const selected = this.terms10Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms11') {
      const selected = this.terms11Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms12') {
      const selected = this.terms12Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelectedTable(type) {
    const listTypeTerms = [
      'terms1',
      'terms2',
      'terms3',
      'terms4',
      'terms5',
      'terms6',
      'terms7',
      'terms8',
      'terms9',
      'terms10',
      'terms11',
      'terms12',
    ];
    if (type === 'intakeChannel') {
      const selected = this.currentProgramFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.intakeList.length;
      return isIndeterminate;
    } else if (type === 'studentType') {
      const selected = this.typeFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.typeFilterList.length;
      return isIndeterminate;
    } else if (type === 'paymentMethod') {
      const selected = this.paymentFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.paymentMode.length;
      return isIndeterminate;
    } else if (type === 'profileFinance') {
      const selected = this.financialFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.financeFilterList.length;
      return isIndeterminate;
    } else if (type === 'paymentInformation') {
      const selected = this.paymentInformationFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.paymentInformationFilterList.length;
      return isIndeterminate;
    } else if (type === 'studentStatus') {
      const selected = this.studentStatusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.studentStatusFilterList.length;
      return isIndeterminate;
    } else if (type === 'downPayment') {
      const selected = this.depositFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPFilterList.length;
      return isIndeterminate;
    } else if (listTypeTerms.includes(type)) {
      return this.handleSomeFilterGotSelected(type);
    } else if (type === 'legalEntity') {
      const selected = this.legalEntityFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listOfLegalEntity.length;
      return isIndeterminate;
    } else if (type === 'latestPayment') {
      const selected = this.latestAskForPaymentFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.latestAskForPaymentFilterList.length;
      return isIndeterminate;
    } else if (type === 'typeRegistration') {
      const selected = this.type_of_registration.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.type_of_registrations.length;
      return isIndeterminate;
    } else if (type === 'profileRate') {
      const selected = this.profileRateFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listTerm.length;
      return isIndeterminate;
    } else if (type === 'specialCase') {
      const selected = this.specialCaseFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.specialCaseFilterList.length;
      return isIndeterminate;
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
      return isIndeterminate;
    } else if (type === 'specialCase') {
      const selected = this.specialCaseFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.specialCaseFilterList.length;
      return isIndeterminate;
    }
  }

  handleSomeFilterGotSelected(terms) {
    if (terms === 'terms1') {
      const selected = this.terms1Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms2') {
      const selected = this.terms2Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms3') {
      const selected = this.terms3Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms4') {
      const selected = this.terms4Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms5') {
      const selected = this.terms5Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms6') {
      const selected = this.terms6Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms7') {
      const selected = this.terms7Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms8') {
      const selected = this.terms8Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms9') {
      const selected = this.terms9Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms10') {
      const selected = this.terms10Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms11') {
      const selected = this.terms11Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms12') {
      const selected = this.terms12Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    }
  }

  selectAllDataTable(event, type) {
    const listTypeTerms = [
      'terms1',
      'terms2',
      'terms3',
      'terms4',
      'terms5',
      'terms6',
      'terms7',
      'terms8',
      'terms9',
      'terms10',
      'terms11',
      'terms12',
    ];
    if (type === 'intakeChannel') {
      if (event.checked) {
        const intakeChannels = this.intakeList.map((el) => el?._id);
        this.currentProgramFilter.patchValue(intakeChannels, { emitEvent: false });
      } else {
        this.currentProgramFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'studentType') {
      if (event.checked) {
        const studentTypes = this.typeFilterList.map((el) => el?.value);
        this.typeFilter.patchValue(studentTypes, { emitEvent: false });
      } else {
        this.typeFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'paymentMethod') {
      if (event.checked) {
        const paymentMethods = this.paymentMode.map((el) => el?.value);
        this.paymentFilter.patchValue(paymentMethods, { emitEvent: false });
      } else {
        this.paymentFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'profileFinance') {
      if (event.checked) {
        const profilFinances = this.financeFilterList.map((el) => el?.value);
        this.financialFilter.patchValue(profilFinances, { emitEvent: false });
      } else {
        this.financialFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'paymentInformation') {
      if (event.checked) {
        const paymentInformationList = this.paymentInformationFilterList.map((el) => el?.value);
        this.paymentInformationFilter.patchValue(paymentInformationList, { emitEvent: false });
      } else {
        this.paymentInformationFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'studentStatus') {
      if (event.checked) {
        const studentStatusFilterList = this.studentStatusFilterList.map((el) => el?.value);
        this.studentStatusFilter.patchValue(studentStatusFilterList, { emitEvent: false });
      } else {
        this.studentStatusFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'downPayment') {
      if (event.checked) {
        const downPaymentList = this.DPFilterList.map((el) => el?.value);
        this.depositFilter.patchValue(downPaymentList, { emitEvent: false });
      } else {
        this.depositFilter.patchValue(null, { emitEvent: false });
      }
    } else if (listTypeTerms.includes(type)) {
      if (event.checked) {
        this.handleSelectAllTerms(type, true);
      } else {
        this.handleSelectAllTerms(type, false);
      }
    } else if (type === 'legalEntity') {
      if (event.checked) {
        const legalEntityList = this.listOfLegalEntity.map((el) => el?.legal_entity_name);
        this.legalEntityFilter.patchValue(legalEntityList, { emitEvent: false });
      } else {
        this.legalEntityFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'latestPayment') {
      if (event.checked) {
        const latestPaymentList = this.latestAskForPaymentFilterList.map((el) => el?.value);
        this.latestAskForPaymentFilter.patchValue(latestPaymentList, { emitEvent: false });
      } else {
        this.latestAskForPaymentFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'typeRegistration') {
      if (event.checked) {
        const typeRegistrationList = this.type_of_registrations.map((el) => el?.value);
        this.type_of_registration.patchValue(typeRegistrationList, { emitEvent: false });
      } else {
        this.type_of_registration.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'profileRate') {
      if (event.checked) {
        const profileRateList = this.listTerm.map((el) => el?.value);
        this.profileRateFilter.patchValue(profileRateList, { emitEvent: false });
      } else {
        this.profileRateFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'specialCase') {
      if (event.checked) {
        const specialCaseList = this.specialCaseFilterList.map((el) => el?.key);
        this.specialCaseFilter.patchValue(specialCaseList, { emitEvent: false });
      } else {
        this.specialCaseFilter.patchValue(null, { emitEvent: false });
      }
    }
  }

  handleSelectAllTerms(terms, checked) {
    const termsList = this.DPandTermsFilterList.map((el) => el?.value);
    if (terms === 'terms1') {
      if (checked) {
        this.terms1Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms1Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.first_term_statuses = this.terms1Filter.value;
    } else if (terms === 'terms2') {
      if (checked) {
        this.terms2Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms2Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.second_term_statuses = this.terms2Filter.value;
    } else if (terms === 'terms3') {
      if (checked) {
        this.terms3Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms3Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.third_term_statuses = this.terms3Filter.value;
    } else if (terms === 'terms4') {
      if (checked) {
        this.terms4Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms4Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.fourth_term_statuses = this.terms4Filter.value;
    } else if (terms === 'terms5') {
      if (checked) {
        this.terms5Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms5Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.fifth_term_statuses = this.terms5Filter.value;
    } else if (terms === 'terms6') {
      if (checked) {
        this.terms6Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms6Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.sixth_term_statuses = this.terms6Filter.value;
    } else if (terms === 'terms7') {
      if (checked) {
        this.terms7Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms7Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.seventh_term_statuses = this.terms7Filter.value;
    } else if (terms === 'terms8') {
      if (checked) {
        this.terms8Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms8Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.eighth_term_statuses = this.terms8Filter.value;
    } else if (terms === 'terms9') {
      if (checked) {
        this.terms9Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms9Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.ninth_term_statuses = this.terms9Filter.value;
    } else if (terms === 'terms10') {
      if (checked) {
        this.terms10Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms10Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.tenth_term_statuses = this.terms10Filter.value;
    } else if (terms === 'terms11') {
      if (checked) {
        this.terms11Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms11Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.eleventh_term_statuses = this.terms11Filter.value;
    } else if (terms === 'terms12') {
      if (checked) {
        this.terms12Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms12Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.twelveth_term_statuses = this.terms12Filter.value;
    }
  }

  setStudentTypeFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    const isSame = JSON.stringify(this.tempDataFilter.type) === JSON.stringify(this.typeFilter.value);
    if (isSame) {
      return;
    } else if (this.typeFilter.value?.length) {
      this.filteredValues.student_types = this.typeFilter.value;
      this.tempDataFilter.type = this.typeFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getDataBilling('typeFilter');
      }
    } else {
      if (this.tempDataFilter.type?.length && !this.typeFilter.value?.length) {
        this.filteredValues.student_types = this.typeFilter.value;
        this.tempDataFilter.type = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('typeFilter');
        }
      } else {
        return;
      }
    }
  }

  setPaymentModeFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    const isSame = JSON.stringify(this.tempDataFilter.paymentMethod) === JSON.stringify(this.paymentFilter.value);
    if (isSame) {
      return;
    } else if (this.paymentFilter.value?.length) {
      this.filteredValues.payment_methods = this.paymentFilter.value;
      this.tempDataFilter.paymentMethod = this.paymentFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getDataBilling('paymentFilter');
      }
    } else {
      if (this.tempDataFilter.paymentMethod?.length && !this.paymentFilter.value?.length) {
        this.filteredValues.payment_methods = this.paymentFilter.value;
        this.tempDataFilter.paymentMethod = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('paymentFilter');
        }
      } else {
        return;
      }
    }
  }

  setFinancialProfile() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    const isSame = JSON.stringify(this.tempDataFilter.financialProfile) === JSON.stringify(this.financialFilter.value);
    if (isSame) {
      return;
    } else if (this.financialFilter.value?.length) {
      this.filteredValues.financial_profiles = this.financialFilter.value;
      this.tempDataFilter.financialProfile = this.financialFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getDataBilling('financialFilter');
      }
    } else {
      if (this.tempDataFilter.financialProfile?.length && !this.financialFilter.value?.length) {
        this.filteredValues.financial_profiles = this.financialFilter.value;
        this.tempDataFilter.financialProfile = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('financialFilter');
        }
      } else {
        return;
      }
    }
  }

  setSpecialCaseFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    const isSame = JSON.stringify(this.tempDataFilter.is_have_special_cases) === JSON.stringify(this.specialCaseFilter.value);
    if (isSame) {
      return;
    } else if (this.specialCaseFilter.value?.length) {
      this.filteredValues.is_have_special_cases = this.specialCaseFilter.value;
      this.tempDataFilter.is_have_special_cases = this.specialCaseFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getDataBilling('specialCase');
      }
    } else {
      if (this.tempDataFilter.is_have_special_cases?.length && !this.specialityFilter.value?.length) {
        this.filteredValues.is_have_special_cases = this.specialCaseFilter.value;
        this.tempDataFilter.is_have_special_cases = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('specialCase');
        }
      } else {
        return;
      }
    }
  }

  setPaymentInformation() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    this.filteredValues.modality_step_special_form_statuses = this.paymentInformationFilter.value;
    const isSame = JSON.stringify(this.tempDataFilter.paymentInformation) === JSON.stringify(this.paymentInformationFilter.value);
    if (isSame) {
      return;
    } else if (this.paymentInformationFilter.value?.length) {
      this.filteredValues.modality_step_special_form_statuses = this.paymentInformationFilter.value;
      this.tempDataFilter.paymentInformation = this.paymentInformationFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getDataBilling('paymentInformationFilter');
      }
    } else {
      if (this.tempDataFilter.status?.length && !this.paymentInformationFilter.value?.length) {
        this.filteredValues.modality_step_special_form_statuses = this.paymentInformationFilter.value;
        this.tempDataFilter.paymentInformation = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('paymentInformationFilter');
        }
      } else {
        return;
      }
    }
  }

  setStudentStatusFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    const isSame = JSON.stringify(this.tempDataFilter.status) === JSON.stringify(this.studentStatusFilter.value);
    if (isSame) {
      return;
    } else if (this.studentStatusFilter.value?.length) {
      this.filteredValues.candidate_admission_statuses = this.studentStatusFilter.value;
      this.tempDataFilter.status = this.studentStatusFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getDataBilling('studentStatusFilter');
      }
    } else {
      if (this.tempDataFilter.status?.length && !this.studentStatusFilter.value?.length) {
        this.filteredValues.candidate_admission_statuses = this.studentStatusFilter.value;
        this.tempDataFilter.status = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('studentStatusFilter');
        }
      } else {
        return;
      }
    }
  }

  setDownPaymentFilter() {
    const isSame = JSON.stringify(this.tempDataFilter.deposit) === JSON.stringify(this.depositFilter.value);
    if (isSame) {
      return;
    } else if (this.depositFilter.value?.length) {
      this.filteredValues.down_payment_statuses = this.depositFilter.value;
      this.tempDataFilter.deposit = this.depositFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getDataBilling('depositFilter');
      }
    } else {
      if (this.tempDataFilter.deposit?.length && !this.depositFilter.value?.length) {
        this.filteredValues.down_payment_statuses = this.depositFilter.value;
        this.tempDataFilter.deposit = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('depositFilter');
        }
      } else {
        return;
      }
    }
  }

  setTermsFilter(terms) {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];

    if (terms === 'terms1') {
      const isSame = JSON.stringify(this.tempDataFilter.terms1) === JSON.stringify(this.terms1Filter.value);
      if (isSame) {
        return;
      } else if (this.terms1Filter.value?.length) {
        this.filteredValues.first_term_statuses = this.terms1Filter.value;
        this.tempDataFilter.terms1 = this.terms1Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('terms1Filter');
        }
      } else {
        if (this.tempDataFilter.terms1?.length && !this.terms1Filter.value?.length) {
          this.filteredValues.first_term_statuses = this.terms1Filter.value;
          this.tempDataFilter.terms1 = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getDataBilling('terms1Filter');
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms2') {
      const isSame = JSON.stringify(this.tempDataFilter.terms2) === JSON.stringify(this.terms2Filter.value);
      if (isSame) {
        return;
      } else if (this.terms2Filter.value?.length) {
        this.filteredValues.second_term_statuses = this.terms2Filter.value;
        this.tempDataFilter.terms2 = this.terms2Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('terms2Filter');
        }
      } else {
        if (this.tempDataFilter.terms2?.length && !this.terms2Filter.value?.length) {
          this.filteredValues.second_term_statuses = this.terms2Filter.value;
          this.tempDataFilter.terms2 = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getDataBilling('terms2Filter');
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms3') {
      const isSame = JSON.stringify(this.tempDataFilter.terms3) === JSON.stringify(this.terms3Filter.value);
      if (isSame) {
        return;
      } else if (this.terms3Filter.value?.length) {
        this.filteredValues.third_term_statuses = this.terms3Filter.value;
        this.tempDataFilter.terms3 = this.terms3Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('terms3Filter');
        }
      } else {
        if (this.tempDataFilter.terms3?.length && !this.terms3Filter.value?.length) {
          this.filteredValues.third_term_statuses = this.terms3Filter.value;
          this.tempDataFilter.terms3 = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getDataBilling('terms3Filter');
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms4') {
      const isSame = JSON.stringify(this.tempDataFilter.terms4) === JSON.stringify(this.terms4Filter.value);
      if (isSame) {
        return;
      } else if (this.terms4Filter.value?.length) {
        this.filteredValues.fourth_term_statuses = this.terms4Filter.value;
        this.tempDataFilter.terms4 = this.terms4Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('terms4Filter');
        }
      } else {
        if (this.tempDataFilter.terms4?.length && !this.terms4Filter.value?.length) {
          this.filteredValues.fourth_term_statuses = this.terms4Filter.value;
          this.tempDataFilter.terms4 = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getDataBilling('terms4Filter');
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms5') {
      const isSame = JSON.stringify(this.tempDataFilter.terms5) === JSON.stringify(this.terms5Filter.value);
      if (isSame) {
        return;
      } else if (this.terms5Filter.value?.length) {
        this.filteredValues.fifth_term_statuses = this.terms5Filter.value;
        this.tempDataFilter.terms5 = this.terms5Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('terms5Filter');
        }
      } else {
        if (this.tempDataFilter.terms5?.length && !this.terms5Filter.value?.length) {
          this.filteredValues.fifth_term_statuses = this.terms5Filter.value;
          this.tempDataFilter.terms5 = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getDataBilling('terms5Filter');
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms6') {
      const isSame = JSON.stringify(this.tempDataFilter.terms6) === JSON.stringify(this.terms6Filter.value);
      if (isSame) {
        return;
      } else if (this.terms6Filter.value?.length) {
        this.filteredValues.sixth_term_statuses = this.terms6Filter.value;
        this.tempDataFilter.terms6 = this.terms6Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('terms6Filter');
        }
      } else {
        if (this.tempDataFilter.terms6?.length && !this.terms6Filter.value?.length) {
          this.filteredValues.sixth_term_statuses = this.terms6Filter.value;
          this.tempDataFilter.terms6 = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getDataBilling('terms6Filter');
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms7') {
      const isSame = JSON.stringify(this.tempDataFilter.terms7) === JSON.stringify(this.terms7Filter.value);
      if (isSame) {
        return;
      } else if (this.terms7Filter.value?.length) {
        this.filteredValues.seventh_term_statuses = this.terms7Filter.value;
        this.tempDataFilter.terms7 = this.terms7Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('terms7Filter');
        }
      } else {
        if (this.tempDataFilter.terms7?.length && !this.terms7Filter.value?.length) {
          this.filteredValues.seventh_term_statuses = this.terms7Filter.value;
          this.tempDataFilter.terms7 = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getDataBilling('terms7Filter');
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms8') {
      const isSame = JSON.stringify(this.tempDataFilter.terms8) === JSON.stringify(this.terms8Filter.value);
      if (isSame) {
        return;
      } else if (this.terms8Filter.value?.length) {
        this.filteredValues.eighth_term_statuses = this.terms8Filter.value;
        this.tempDataFilter.terms8 = this.terms8Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('terms8Filter');
        }
      } else {
        if (this.tempDataFilter.terms8?.length && !this.terms8Filter.value?.length) {
          this.filteredValues.eighth_term_statuses = this.terms8Filter.value;
          this.tempDataFilter.terms8 = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getDataBilling('terms8Filter');
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms9') {
      const isSame = JSON.stringify(this.tempDataFilter.terms9) === JSON.stringify(this.terms9Filter.value);
      if (isSame) {
        return;
      } else if (this.terms9Filter.value?.length) {
        this.filteredValues.ninth_term_statuses = this.terms9Filter.value;
        this.tempDataFilter.terms9 = this.terms9Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('terms9Filter');
        }
      } else {
        if (this.tempDataFilter.terms9?.length && !this.terms9Filter.value?.length) {
          this.filteredValues.ninth_term_statuses = this.terms9Filter.value;
          this.tempDataFilter.terms9 = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getDataBilling('terms9Filter');
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms10') {
      const isSame = JSON.stringify(this.tempDataFilter.terms10) === JSON.stringify(this.terms10Filter.value);
      if (isSame) {
        return;
      } else if (this.terms10Filter.value?.length) {
        this.filteredValues.tenth_term_statuses = this.terms10Filter.value;
        this.tempDataFilter.terms10 = this.terms10Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('terms10Filter');
        }
      } else {
        if (this.tempDataFilter.terms10?.length && !this.terms10Filter.value?.length) {
          this.filteredValues.tenth_term_statuses = this.terms10Filter.value;
          this.tempDataFilter.terms10 = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getDataBilling('terms10Filter');
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms11') {
      const isSame = JSON.stringify(this.tempDataFilter.terms11) === JSON.stringify(this.terms11Filter.value);
      if (isSame) {
        return;
      } else if (this.terms11Filter.value?.length) {
        this.filteredValues.eleventh_term_statuses = this.terms11Filter.value;
        this.tempDataFilter.terms11 = this.terms11Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('terms11Filter');
        }
      } else {
        if (this.tempDataFilter.terms11?.length && !this.terms11Filter.value?.length) {
          this.filteredValues.eleventh_term_statuses = this.terms11Filter.value;
          this.tempDataFilter.terms11 = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getDataBilling('terms11Filter');
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms12') {
      const isSame = JSON.stringify(this.tempDataFilter.terms12) === JSON.stringify(this.terms12Filter.value);
      if (isSame) {
        return;
      } else if (this.terms12Filter.value?.length) {
        this.filteredValues.twelveth_term_statuses = this.terms12Filter.value;
        this.tempDataFilter.terms12 = this.terms12Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('terms12Filter');
        }
      } else {
        if (this.tempDataFilter.terms12?.length && !this.terms12Filter.value?.length) {
          this.filteredValues.twelveth_term_statuses = this.terms12Filter.value;
          this.tempDataFilter.terms12 = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getDataBilling('terms12Filter');
          }
        } else {
          return;
        }
      }
    }
  }

  setLegalEntityFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    const isSame = JSON.stringify(this.tempDataFilter.legalEntity) === JSON.stringify(this.legalEntityFilter.value);
    if (isSame) {
      return;
    } else if (this.legalEntityFilter.value?.length) {
      this.filteredValues.legal_entity_names = this.legalEntityFilter.value;
      this.tempDataFilter.legalEntity = this.legalEntityFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getDataBilling('legalEntityFilter');
      }
    } else {
      if (this.tempDataFilter.legalEntity?.length && !this.legalEntityFilter.value?.length) {
        this.filteredValues.legal_entity_names = this.legalEntityFilter.value;
        this.tempDataFilter.legalEntity = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('legalEntityFilter');
        }
      } else {
        return;
      }
    }
  }

  setLastestPaymentFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    const isSame = JSON.stringify(this.tempDataFilter.latestAskForPayment) === JSON.stringify(this.latestAskForPaymentFilter.value);
    if (isSame) {
      return;
    } else if (this.latestAskForPaymentFilter.value?.length) {
      this.filteredValues.pay_n2s = this.latestAskForPaymentFilter.value;
      this.tempDataFilter.latestAskForPayment = this.latestAskForPaymentFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getDataBilling('latestAskForPaymentFilter');
      }
    } else {
      if (this.tempDataFilter.latestAskForPayment?.length && !this.latestAskForPaymentFilter.value?.length) {
        this.filteredValues.pay_n2s = this.latestAskForPaymentFilter.value;
        this.tempDataFilter.latestAskForPayment = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('latestAskForPaymentFilter');
        }
      } else {
        return;
      }
    }
  }

  setTypeOfRegistrationFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    const isSame = JSON.stringify(this.tempDataFilter.typeOfRegistration) === JSON.stringify(this.type_of_registration.value);
    if (isSame) {
      return;
    } else if (this.type_of_registration.value?.length) {
      this.filteredValues.type_of_registrations = this.type_of_registration.value;
      this.tempDataFilter.typeOfRegistration = this.type_of_registration.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getDataBilling('type_of_registration');
      }
    } else {
      if (this.tempDataFilter.typeOfRegistration?.length && !this.type_of_registration.value?.length) {
        this.filteredValues.type_of_registrations = this.type_of_registration.value;
        this.tempDataFilter.typeOfRegistration = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('type_of_registration');
        }
      } else {
        return;
      }
    }
  }

  setProfileRateFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    const isSame = JSON.stringify(this.tempDataFilter.typeOfRegistration) === JSON.stringify(this.profileRateFilter.value);
    if (isSame) {
      return;
    } else if (this.profileRateFilter.value?.length) {
      this.filteredValues.term_counts = this.profileRateFilter.value;
      this.tempDataFilter.typeOfRegistration = this.profileRateFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getDataBilling('profileRateFilter');
      }
    } else {
      if (this.tempDataFilter.typeOfRegistration?.length && !this.profileRateFilter.value?.length) {
        this.filteredValues.term_counts = this.profileRateFilter.value;
        this.tempDataFilter.typeOfRegistration = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataBilling('profileRateFilter');
        }
      } else {
        return;
      }
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
    }
  }
  onFilterSelect(value: string | null) {
    const result = value !== 'All' ? value : null;
    this.filteredValues.type_of_registration = result;
    this.clearSelectIfFilter();
    this.paginator.firstPage();
    if (!this.isReset) {
      this.getDataBilling('filter select');
    }
  }
  viewTermDetail(term, month) {
    this.subs.sink = this.dialog
      .open(MonthTermDetailsDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          terms: term,
          month: month,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        // code...
      });
  }
  updateSpecialCase(value) {
    this.subs.sink = this.dialog
      .open(SpecialCaseReasonComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        autoFocus: false,
        panelClass: 'certification-rule-pop-up',
        data: {
          is_have_special_case: value?.is_have_special_case,
          candidate_id: value?.candidate_id?._id,
          billing_id: value?._id,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.resetCandidateKeepFilter();
        }
      });
  }

  getDPDetail(id) {
    this.subs.sink = this.dialog
      .open(DpRegulationDialogComponent, {
        width: '800px',
        disableClose: true,
        data: {
          billing_id: id,
        },
      })
      .afterClosed()
      .subscribe((result) => {});
  }
}
