import { MailAllStudentsDialogComponent } from './mail-all-students-dialog/mail-all-students-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RemoveTagsDialogComponent } from './remove-tags-dialog/remove-tags-dialog.component';
import { PermissionService } from 'app/service/permission/permission.service';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { UntypedFormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { AuthService } from 'app/service/auth-service/auth.service';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { debounceTime, map, scan, startWith, take, tap } from 'rxjs/operators';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { StudentsTableService } from 'app/students-table/StudentTable.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import * as _ from 'lodash';
import { SelectionModel } from '@angular/cdk/collections';
import { UtilityService } from 'app/service/utility/utility.service';
import { SendMultipleEmailComponent } from 'app/internship-file/send-multiple-email/send-multiple-email.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddTagsDialogComponent } from './add-tags-dialog/add-tags-dialog.component';
import { environment } from 'environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { InternshipEmailDialogComponent } from 'app/internship-file/internship-email-dialog/internship-email-dialog.component';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSelect } from '@angular/material/select';
import { MatOptionSelectionChange } from '@angular/material/core';
import { AskVisaDocumentDialogComponent } from 'app/candidate-file/candidate-card-details/student-visa-document-tab/ask-visa-document-dialog/ask-visa-document-dialog.component';

@Component({
  selector: 'ms-all-students-table',
  templateUrl: './all-students-table.component.html',
  styleUrls: ['./all-students-table.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class AllStudentsTableComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('templateColumn') templateColumnRef: MatSelect;
  private subs = new SubSink();

  // User Login Data
  currentUser: any;
  isPermission: any;
  currentUserTypeId: any;

  // Default table column
  defaultDisplayedColumns = [
    {
      name: 'Selection',
      colName: 'select',
      filterName: 'selectFilter',
    },
    {
      name: 'Formation Type',
      colName: 'formationType',
      filterName: 'formationTypeFilter',
    },
    {
      name: 'Student Number',
      colName: 'studentNumber',
      filterName: 'studentNumberFilter',
    },
    {
      name: 'Name',
      colName: 'name',
      filterName: 'nameFilter',
    },
    {
      name: 'Current Program',
      colName: 'currentProgram',
      filterName: 'currentProgramFilter',
    },
    {
      name: 'Status',
      colName: 'status',
      filterName: 'statusFilter',
    },
    {
      name: 'Type of Registration',
      colName: 'typeOfRegistration',
      filterName: 'typeOfRegistrationFilter',
    },
    {
      name: 'Down Payment',
      colName: 'downPayment',
      filterName: 'downPaymentFilter',
    },
    {
      name: 'Registration Date',
      colName: 'registrationDate',
      filterName: 'registrationDateFilter',
    },
    {
      name: 'Visa Document',
      colName: 'visaDocument',
      filterName: 'visaDocumentFilter',
    },
    {
      name: 'Action',
      colName: 'action',
      filterName: 'actionFilter',
    },
  ];

  // Init Table
  displayedColumns: any[] = [];
  filterColumns: any[] = [];
  dataSource = new MatTableDataSource([]);
  dataCount = 0;
  noData: any;
  isWaitingForResponse = false;
  dataLoaded: Boolean = false;
  isReset: Boolean = false;
  // Checkbox Variable
  selection = new SelectionModel<any>(true, []);
  isCheckedAll = false;
  isWasSelectAll = false;
  dataSelected = [];
  dataUnselectUser = [];
  selectType: any;
  clickedActionButton: string | null = null;
  // Filter Above Table
  scholarSeasonFilter = new UntypedFormControl('All');
  schoolFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  levelFilter = new UntypedFormControl(null);
  sectorFilter = new UntypedFormControl(null);
  specialityFilter = new UntypedFormControl(null);
  tagFilter = new UntypedFormControl(null);
  // Filter Table
  currentProgramFilter = new UntypedFormControl(null);
  formationTypeFilter = new UntypedFormControl(null);
  studentNumberFilter = new UntypedFormControl(null);
  nameFilter = new UntypedFormControl(null);
  statusFilter = new UntypedFormControl(null);
  typeOfRegistrationFilter = new UntypedFormControl(null);
  registrationDateFilter = new UntypedFormControl(null);
  downPaymentFilter = new UntypedFormControl(null);
  columnCtrl = new UntypedFormControl(null);
  visaFilter = new UntypedFormControl(null);

  filteredValuesAll = {
    scholar_season: 'All',
    schools: 'All',
    campuses: 'All',
    levels: 'All',
    sectors: 'All',
    specialities: 'All',
    tags: 'All',
    intake_channel_name: 'All',
    intake_channel_names: 'All',
    candidate: 'All',
    candidate_unique_number: 'All',
    candidate_admission_status: 'All',
    candidate_admission_statuses: 'All',
    readmission_status: 'all_candidates',
    registered_at: 'All',
    sigle: 'All',
    sigles: 'All',
    type_of_registration: 'All',
    type_of_registrations: 'All',
    is_deposit_paid: 'All',
    is_deposit_paids: 'All',
    payment: 'All',
    offset: moment().utcOffset(),
    visa_statuses: 'All',
  };
  filteredValues = {
    scholar_season: null,
    schools: null,
    campuses: null,
    levels: null,
    sectors: null,
    specialities: null,
    tags: null,
    intake_channel_name: null,
    intake_channel_names: null,
    candidate: null,
    candidate_unique_number: null,
    candidate_admission_status: null,
    candidate_admission_statuses: null,
    readmission_status: 'all_candidates',
    registered_at: null,
    sigle: null,
    sigles: null,
    type_of_registration: null,
    type_of_registrations: null,
    is_deposit_paid: null,
    is_deposit_paids: null,
    payment: null,
    payments: null,
    offset: null,
    // is_deposit_paids: null,
    visa_statuses: null,
  };
  sortValue = null;
  // Variable for SuperFilter
  listSchools = [];
  scholarSeasonList = [];
  schoolList = [];
  campusList = [];
  levelList = [];
  specialityList = [];
  sectorList = [];
  tagList = [];
  schoolName = '';
  isDisabled = true;
  superFilter = {
    scholar_season: null,
    schools: null,
    campuses: null,
    levels: null,
    sectors: null,
    specialities: null,
    tags: null,
  };

  // Variable for filter table
  listSigle = [];
  listProgram = [];
  listDefaultProgram = [];
  studentStatusFilterList = [];
  listRegistration = [];
  DPFilterList = [
    { value: 'paid', key: 'Paid', label: '' },
    { value: 'not_paid', key: 'Not Paid', label: '' },
    { value: 'pending', key: 'Pending', label: '' },
    { value: 'rejected', key: 'Rejected', label: '' },
    { value: 'billed', key: 'Billed', label: '' },
    { value: 'not_billed', key: 'Not billed', label: '' },
    { value: 'partialy_paid', key: 'Partially paid', label: '' },
    { value: 'chargeback', key: 'chargeback', label: '' },
    { value: 'no_down_payment', key: 'Without DP', label: '' },
  ];
  listVisa = [];

  // Variable for button above table
  allExportForCheckbox = [];
  allAddTagForCheckbox = [];
  allRemoveTagForCheckbox = [];
  allSendMailForCheckbox = [];
  allSendReminderForCheckbox = [];
  sendMultipleEmailComponent: MatDialogRef<SendMultipleEmailComponent>;
  mailAllStudentsComponent: MatDialogRef<MailAllStudentsDialogComponent>;
  addTagsDialogComponent: MatDialogRef<AddTagsDialogComponent>;
  isLoading = false;
  studentSafeUrl;
  filterBreadcrumbData: any[] = [];

  tempDataTableFilter = {
    formationType: null,
    currentProgram: null,
    status: null,
    typeRegistration: null,
    visa_statuses: null,
  };
  tempDraggableColumnFilter: any = [];
  tempDraggableColumn: any = [];
  conditionalGraphqlField = {
    formationType: true,
    studentNumber: true,
    name: true,
    currentProgram: true,
    typeOfRegistration: true,
    downPayment: true,
    registrationDate: true,
    visaDocument: true,
  };
  latestSelectedColumn: any = null;
  tempColumnListTable: any = [];

  private timeOutVal: any;

  constructor(
    public permission: PermissionService,
    private authService: AuthService,
    private translate: TranslateService,
    private studentService: StudentsTableService,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    private utilityService: UtilityService,
    public dialog: MatDialog,
    private httpClient: HttpClient,
    private router: Router,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private sanitizer: DomSanitizer,
    private utilService: UtilityService,
    private pageTitleService: PageTitleService,
  ) {}

  ngOnInit(): void {
    this.getDownPaymentList();
    this.getTypeOfRegistrationList();
    this.getStudentStatusList();

    this.studentSafeUrl = this.safeUrl();
    // Init Function
    this.initFilter();

    // Get Data User Login
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    // Get Data for Super Filter
    this.getDataScholarSeasons();
    this.getDataTags();
    const scholarSeason =
      this.scholarSeasonFilter.value && this.scholarSeasonFilter.value !== 'All' && this.scholarSeasonFilter.value !== 'AllF'
        ? this.scholarSeasonFilter.value
        : '';
    this.getDataSchool(scholarSeason);

    // Get Data for Filter inside table
    this.getDataTypeOfFormation();
    this.getDataCurrentProgram();
    this.getDropdownVisa();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      if (
        this.currentProgramFilter.value &&
        (this.currentProgramFilter.value.trim() === 'All' || this.currentProgramFilter.value.trim() === 'Tous') &&
        !this.filteredValues.intake_channel_name
      ) {
        this.currentProgramFilter.patchValue(this.translate.instant('All'));
      }
      // Sort status drodpdown
      this.studentStatusFilterList = this.studentStatusFilterList.sort((a, b) =>
        this.translate.instant(a.key).toLowerCase().localeCompare(this.translate.instant(b.key).toLowerCase()),
      );
      this.listRegistration = this.listRegistration?.sort((a, b) =>
        this.translate.instant('perimeter.' + a)?.toLowerCase() > this.translate.instant('perimeter.' + b)?.toLowerCase()
          ? 1
          : this.translate.instant('perimeter.' + b)?.toLowerCase() > this.translate.instant('perimeter.' + a)?.toLowerCase()
          ? -1
          : 0,
      );
      this.getTypeOfRegistrationList();
      this.getStudentStatusList();
      this.getDataScholarSeasons();
      this.getDownPaymentList();
      this.getDropdownVisa();
      this.getAllStudentsData();
    });

    this.pageTitleService.setTitle('NAV.STUDENT.All students');
    this.checkTemplateTable();
  }
  getDropdownVisa() {
    this.listVisa = [
      {
        value: 'not_required',
        label: this.translate.instant('ERP_009_TEACHER_CONTRACT.Not Required'),
      },
      {
        value: 'not_sent',
        label: this.translate.instant('statusList.not_sent'),
      },
      {
        value: 'not_completed',
        label: this.translate.instant('statusList.not_completed'),
      },
      {
        value: 'waiting_for_validation',
        label: this.translate.instant('statusList.waiting_for_validation'),
      },
      {
        value: 'rejected',
        label: this.translate.instant('statusList.rejected'),
      },
      {
        value: 'validated',
        label: this.translate.instant('statusList.validated'),
      },
      {
        value: 'document_expired',
        label: this.translate.instant('statusList.visa_expired'),
      },
    ];

    this.listVisa = this.listVisa.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
  }

  getDownPaymentList() {
    this.DPFilterList = [
      { value: 'paid', key: 'Paid', label: this.translate.instant('DP_Status.paid') },
      { value: 'not_paid', key: 'Not Paid', label: this.translate.instant('DP_Status.not_paid') },
      { value: 'pending', key: 'Pending', label: this.translate.instant('DP_Status.pending') },
      { value: 'not_authorized', key: 'Rejected', label: this.translate.instant('DP_Status.rejected') },
      { value: 'billed', key: 'Billed', label: this.translate.instant('DP_Status.billed') },
      { value: 'not_billed', key: 'Not billed', label: this.translate.instant('DP_Status.not_billed') },
      { value: 'partialy_paid', key: 'Partially paid', label: this.translate.instant('DP_Status.partialy_paid') },
      { value: 'chargeback', key: 'chargeback', label: this.translate.instant('DP_Status.chargeback') },
      { value: 'no_down_payment', key: 'Without DP', label: this.translate.instant('DP_Status.no_down_payment') },
    ];

    this.DPFilterList = this.DPFilterList.sort((a, b) => a.label.toLowerCase().localeCompare(b.label));
  }

  getTypeOfRegistrationList() {
    this.listRegistration = [
      {
        value: 'admission',
        label: this.translate.instant('perimeter.admission'),
      },
      {
        value: 'readmission',
        label: this.translate.instant('perimeter.readmission'),
      },
    ];

    this.listRegistration = this.listRegistration.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
  }

  getStudentStatusList() {
    this.studentStatusFilterList = [
      { value: 'admission_in_progress', key: 'Admitted', label: this.translate.instant('Admitted') },
      { value: 'bill_validated', key: 'Bill validated', label: this.translate.instant('Bill validated') },
      { value: 'engaged', key: 'Engaged', label: this.translate.instant('Engaged') },
      { value: 'registered', key: 'Registered', label: this.translate.instant('Registered') },
      { value: 'resigned', key: 'Resigned', label: this.translate.instant('Resigned') },
      { value: 'resigned_after_engaged', key: 'Resigned after engaged', label: this.translate.instant('Resigned after engaged') },
      { value: 'resigned_after_registered', key: 'Resign after registered', label: this.translate.instant('Resign after registered') },
      { value: 'report_inscription', key: 'Report Inscription +1', label: this.translate.instant('Report Inscription +1') },
      { value: 'mission_card_validated', key: 'mission_card_validated', label: this.translate.instant('mission_card_validated') },
      { value: 'financement_validated', key: 'Financement valided', label: this.translate.instant('Financement valided') },
      { value: 'in_scholarship', key: 'in_scholarship', label: this.translate.instant('in_scholarship') },
      {
        value: 'resignation_missing_prerequisites',
        key: 'resignation_missing_prerequisites',
        label: this.translate.instant('resignation_missing_prerequisites'),
      },
      { value: 'no_show', key: 'no_show', label: this.translate.instant('no_show') },
      {
        value: 'resign_after_school_begins',
        key: 'resigned_after_school_begins',
        label: this.translate.instant('resigned_after_school_begins'),
      },
    ];

    this.studentStatusFilterList = this.studentStatusFilterList.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
  }

  initFilter() {
    // start super filter
    // **********Super Filter For Scholar Season
    this.subs.sink = this.scholarSeasonFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.levels = '';
      this.superFilter.campuses = '';
      this.superFilter.schools = '';
      this.superFilter.scholar_season = statusSearch === '' || statusSearch === 'All' || statusSearch === 'AllF' ? '' : statusSearch;
    });

    // **********Super Filter For School
    this.subs.sink = this.schoolFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.levels = '';
      this.superFilter.campuses = '';
      this.superFilter.schools = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    // **********Super Filter For Campus
    this.subs.sink = this.campusFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.levels = '';
      this.superFilter.campuses = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    // **********Super Filter For Level
    this.subs.sink = this.levelFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.levels = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    // **********Super Filter For sector
    this.subs.sink = this.sectorFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.sectors = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    // **********Super Filter For Speciality
    this.subs.sink = this.specialityFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.specialities = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    // **********Super Filter For Tags
    this.subs.sink = this.tagFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.tags = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });
    // end super filter
    // Start filter inside table

    // **********Filter For Type of formation
    // this.subs.sink = this.formationTypeFilter.valueChanges.subscribe((statusSearch) => {
    //   this.filteredValues.sigle = statusSearch === 'All' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.refetchDataKeepFilter();
    //   }
    // });

    // **********Filter For Type of formation
    // this.subs.sink = this.typeOfRegistrationFilter.valueChanges.subscribe((statusSearch) => {
    //   this.filteredValues.type_of_registration = statusSearch === 'All' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.refetchDataKeepFilter();
    //   }
    // });

    // **********Filter For Student Number
    this.subs.sink = this.studentNumberFilter.valueChanges.pipe(debounceTime(600)).subscribe((statusSearch) => {
      if (statusSearch) {
        this.filteredValues.candidate_unique_number = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.refetchDataKeepFilter();
        }
      } else {
        this.filteredValues.candidate_unique_number = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.refetchDataKeepFilter();
        }
      }
    });

    // **********Filter For Student Name
    this.subs.sink = this.nameFilter.valueChanges.pipe(debounceTime(600)).subscribe((statusSearch) => {
      if (statusSearch) {
        this.filteredValues.candidate = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.refetchDataKeepFilter();
        }
      } else {
        this.filteredValues.candidate = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.refetchDataKeepFilter();
        }
      }
    });

    // **********Filter For Current Program
    // this.subs.sink = this.currentProgramFilter.valueChanges.subscribe((text: string) => {
    //   if (typeof text === 'string' && text !== this.translate.instant('All')) {
    //     this.listProgram = this.listDefaultProgram.filter((option: any) => {
    //       return option && option.program && option.program.toLocaleLowerCase().trim().includes(text.toLocaleLowerCase().trim());
    //     });
    //   } else {
    //     this.listProgram = [...this.listDefaultProgram];
    //   }
    // });

    // **********Filter For Status Student
    // this.subs.sink = this.statusFilter.valueChanges.subscribe((statusSearch) => {
    //   if (statusSearch && statusSearch !== 'All') {
    //     this.filteredValues.candidate_admission_status = statusSearch;
    //     this.filteredValues.candidate_admission_statuses = null;
    //     this.paginator.pageIndex = 0;
    //     if (!this.isReset) {
    //       this.refetchDataKeepFilter();
    //     }
    //   } else {
    //     this.filteredValues.candidate_admission_status = null;
    //     this.filteredValues.candidate_admission_statuses = [
    //       'admission_in_progress',
    //       'bill_validated',
    //       'engaged',
    //       'registered',
    //       'resigned',
    //       'resigned_after_engaged',
    //       'resigned_after_registered',
    //       'report_inscription',
    //       'in_scholarship',
    //       'mission_card_validated',
    //       'resignation_missing_prerequisites',
    //       'no_show',
    //       'resign_after_school_begins',
    //     ];
    //     this.paginator.pageIndex = 0;
    //     if (!this.isReset) {
    //       this.refetchDataKeepFilter();
    //     }
    //   }
    // });

    // **********Filter For Registration Date
    this.subs.sink = this.registrationDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.registered_at = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.refetchDataKeepFilter();
        }
      }
    });

    // **********Filter For Down Payment
    // this.subs.sink = this.downPaymentFilter.valueChanges.subscribe((statusSearch) => {
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
    //   } else if (statusSearch === 'All') {
    //     this.filteredValues.payment = null;
    //     this.filteredValues.is_deposit_paid = null;
    //   }
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.refetchDataKeepFilter();
    //   }
    // });
  }

  // After View Init for Pagination Table
  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset && this.dataLoaded) {
            this.getAllStudentsData('afterview');
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();

    this.selectionChangesColumn();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  // Function for get data table
  getAllStudentsData(from?) {
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.isWaitingForResponse = true;
    this.checkConditionalGraphql();
    this.checkFilterAndSorting();
    this.subs.sink = this.studentService
      .GetAllStudentsTagTable(pagination, this.conditionalGraphqlField, filter, this.sortValue, userTypesList)
      .subscribe(
        (resp: any) => {
          if (resp && resp.length) {
            this.dataSource.data = resp;
            this.paginator.length = resp[0].count_document;
            this.dataCount = resp[0].count_document;
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
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          if (err) {
            this.dataSource.data = [];
            this.paginator.length = 0;
            this.dataCount = 0;
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

  // Function for re-mapping data on filter before request to server for table
  cleanFilterData() {
    this.filteredValues.offset = this.filteredValues.registered_at ? moment().utcOffset() : null;
    const filterData = _.cloneDeep(this.filteredValues);
    Object.keys(filterData).forEach((key) => {
      if (!filterData[key] && filterData[key] !== false) {
        delete filterData[key];
      }
    });
    return filterData;
  }

  // Function for re-mapping data on filter before request to server for export csv
  cleanFilterDataExport() {
    this.filteredValues.offset = this.filteredValues.registered_at ? moment().utcOffset() : null;
    const filterData = _.cloneDeep(this.filteredValues);
    Object.keys(filterData).forEach((key) => {
      if (!filterData[key] && filterData[key] !== false) {
        delete filterData[key];
      }
    });
    return '"filter":' + JSON.stringify(filterData);
  }

  // Function for formatting data current program before display in the table ui
  intakeChannel(data) {
    let intakeChannel = '';
    if (data?.intake_channel?.program && data?.scholar_season?.scholar_season) {
      intakeChannel = data?.scholar_season?.scholar_season?.concat(' ', data?.intake_channel?.program);
      return intakeChannel;
    } else {
      return '';
    }
  }

  // Function for formatting data registration date before display in the table ui
  transformRegistrationDate(data) {
    if (data?.registered_at?.date && data?.registered_at?.time && data?.candidate_admission_status === 'registered') {
      const date = data?.registered_at?.date;
      const time = data?.registered_at?.time;

      const datee = this.parseUtcToLocalPipe.transformDate(date, time);
      return datee;
    } else {
      return '';
    }
  }

  // Function for handling sorting table and request to server
  sortData(sort: Sort) {
    this.sortValue = sort.active && sort.direction ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAllStudentsData('sort');
      }
    }
  }

  // Start Code Super Filter
  // ************** Function get scholar season
  getDataScholarSeasons() {
    this.scholarSeasonList = [];
    this.subs.sink = this.studentService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.scholarSeasonList = resp;
          this.scholarSeasonList = this.scholarSeasonList.sort((a, b) =>
            a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
          );

          this.scholarSeasonList.unshift({ _id: 'All', scholar_season: this.translate.instant('AllF') });
          this.scholarSeasonList = _.uniqBy(this.scholarSeasonList, '_id');
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

  // ************** Function get tag
  getDataTags() {
    this.subs.sink = this.studentService.GetAllTagsSuperFilter().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.tagList = resp;
          this.tagList = this.tagList.sort((a, b) =>
            a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
          );
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

  // ************** Function get school
  getDataSchool(data?) {
    const name = data ? data : '';
    const filter = 'filter: { scholar_season_id:' + `"${name}"` + '}';
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.studentService.GetAllSchoolSuperFilter(name, filter, userTypesList).subscribe(
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
            this.listSchools = schoolsList;
            this.schoolList = this.listSchools;
            this.schoolList = this.schoolList.sort((a, b) => {
              if (
                this.utilService.simplifyRegex(a?.short_name?.toLowerCase()) < this.utilService.simplifyRegex(b?.short_name?.toLowerCase())
              ) {
                return -1;
              } else if (
                this.utilService.simplifyRegex(a?.short_name?.toLowerCase()) > this.utilService.simplifyRegex(b?.short_name?.toLowerCase())
              ) {
                return 1;
              } else {
                return 0;
              }
            });
          } else {
            this.listSchools = resp;
            this.schoolList = this.listSchools;
            this.schoolList = this.schoolList.sort((a, b) => {
              if (
                this.utilService.simplifyRegex(a?.short_name?.toLowerCase()) < this.utilService.simplifyRegex(b?.short_name?.toLowerCase())
              ) {
                return -1;
              } else if (
                this.utilService.simplifyRegex(a?.short_name?.toLowerCase()) > this.utilService.simplifyRegex(b?.short_name?.toLowerCase())
              ) {
                return 1;
              } else {
                return 0;
              }
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

  // ************** Function get campus data
  getDataCampus() {
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
      this.currentUser.entities.length &&
      this.currentUser.app_data &&
      this.currentUser.app_data.school_package &&
      this.currentUser.app_data.school_package.length &&
      school &&
      school.length
    ) {
      if (school && !school.includes('All') && this.schoolList && this.schoolList.length) {
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

      // tambahkan
    } else if (school && !school.includes('All') && this.listSchools && this.listSchools.length) {
      const scampusList = this.listSchools.filter((list) => {
        return school.includes(list._id);
      });
      scampusList.filter((campus, n) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campusess, nex) => {
            this.campusList.push(campusess);
            // this.campusListBackup = this.campusList;
          });
        }
      });
      // console.log('scampusList', scampusList, school, this.listSchools);
    } else {
      if (
        school &&
        this.currentUser &&
        this.currentUser.app_data &&
        this.currentUser.app_data.campus &&
        this.currentUser.app_data.campus.length &&
        this.listSchools &&
        this.listSchools.length
      ) {
        this.currentUser.app_data.campus.forEach((element) => {
          this.listSchools.filter((campus, n) => {
            if (campus.campuses && campus.campuses.length) {
              campus.campuses.filter((campusess, nex) => {
                if (campusess && element && element.name && campusess.name.toLowerCase() === element.name.toLowerCase()) {
                  this.campusList.push(campusess);
                }
              });
            }
          });
        });
      } else if (school && school.includes('All') && this.listSchools && this.listSchools.length) {
        this.listSchools.forEach((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.forEach((campusess, nex) => {
              this.campusList.push(campusess);
            });
          }
        });
      } else {
        this.campusList = [];
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

  // ************** Function get level data
  getDataLevel() {
    this.levelList = [];
    this.sectorList = [];
    this.specialityList = [];
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.sectorFilter.value) {
      this.sectorFilter.setValue(null);
    }
    if (this.specialityFilter.value) {
      this.specialityFilter.setValue(null);
    }
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
      this.campusFilter.value.length &&
      schools
    ) {
      if (sCampus && sCampus.length && !sCampus.includes('All')) {
        this.currentUser.app_data.school_package.forEach((element) => {
          if (
            element &&
            element.school &&
            element.school._id &&
            (schools.includes(element.school._id) || schools.includes('All')) &&
            this.campusList &&
            this.campusList.length
          ) {
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
      } else if (sCampus && sCampus.includes('All') && this.campusList && this.campusList.length) {
        this.campusList.forEach((lev) => {
          if (lev && lev.levels && lev.levels.length) {
            this.levelList = _.concat(this.levelList, lev.levels);
          }
        });
      }
    } else {
      if (schools && sCampus && !sCampus.includes('All') && this.campusList && this.campusList.length) {
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
      } else if (sCampus && sCampus.includes('All') && this.campusList && this.campusList.length) {
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
    this.levelList = _.uniqBy(this.levelList, 'name');
    this.levelList = this.levelList.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }

  // ************** Function get sector data
  getDataSectorByLevel() {
    const scholar =
      this.scholarSeasonFilter.value && this.scholarSeasonFilter.value !== 'All' && this.scholarSeasonFilter.value !== 'AllF'
        ? true
        : false;
    const school = this.schoolFilter.value && this.schoolFilter.value.length ? true : false;
    const campus = this.campusFilter.value && this.campusFilter.value.length ? true : false;
    const level = this.levelFilter.value && this.levelFilter.value.length ? true : false;
    let allSchool = [];
    let allCampus = [];
    let allLevel = [];
    if (this.schoolFilter.value && this.schoolFilter.value.includes('All') && this.listSchools && this.listSchools.length) {
      allSchool = this.listSchools.map((data) => data._id);
    }
    if (this.campusFilter.value && this.campusFilter.value.includes('All') && this.campusList && this.campusList.length) {
      allCampus = this.campusList.map((data) => data._id);
    }
    if (this.levelFilter.value && this.levelFilter.value.includes('All') && this.levelList && this.levelList.length) {
      allLevel = this.levelList.map((data) => data._id);
    }
    const filter = {
      scholar_season_id: scholar ? this.scholarSeasonFilter.value : null,
      candidate_school_ids: allSchool && allSchool.length ? allSchool : school ? this.schoolFilter.value : null,
      campuses: allCampus && allCampus.length ? allCampus : campus ? this.campusFilter.value : null,
      levels: allLevel && allLevel.length ? allLevel : level ? this.levelFilter.value : null,
    };
    this.sectorList = [];
    this.specialityList = [];
    if (school || campus) {
      this.subs.sink = this.studentService.GetAllSectorsDropdown(filter).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.sectorFilter.setValue(null);
            this.specialityFilter.setValue(null);
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
      this.sectorFilter.setValue(null);
      this.specialityFilter.setValue(null);
      this.superFilter.sectors = null;
      this.superFilter.specialities = null;
    }
  }

  // ************** Function get speciality data
  getDataSpecialityBySector() {
    const scholar =
      this.scholarSeasonFilter.value && this.scholarSeasonFilter.value !== 'All' && this.scholarSeasonFilter.value !== 'AllF'
        ? true
        : false;
    const school = this.schoolFilter.value && this.schoolFilter.value.length ? true : false;
    const campus = this.campusFilter.value && this.campusFilter.value.length ? true : false;
    const level = this.levelFilter.value && this.levelFilter.value.length ? true : false;
    const sector = this.sectorFilter.value && this.sectorFilter.value.length ? true : false;
    let allSchool = [];
    let allCampus = [];
    let allLevel = [];
    let allSector = [];
    if (this.schoolFilter.value && this.schoolFilter.value.includes('All') && this.listSchools && this.listSchools.length) {
      allSchool = this.listSchools.map((data) => data._id);
    }
    if (this.campusFilter.value && this.campusFilter.value.includes('All') && this.campusList && this.campusList.length) {
      allCampus = this.campusList.map((data) => data._id);
    }
    if (this.levelFilter.value && this.levelFilter.value.includes('All') && this.levelList && this.levelList.length) {
      allLevel = this.levelList.map((data) => data._id);
    }
    if (this.sectorFilter.value && this.sectorFilter.value.includes('All') && this.sectorList && this.sectorList.length) {
      allSector = this.sectorList.map((data) => data._id);
    }
    const filter = {
      scholar_season_id: scholar ? this.scholarSeasonFilter.value : null,
      candidate_school_ids: allSchool && allSchool.length ? allSchool : school ? this.schoolFilter.value : null,
      campuses: allCampus && allCampus.length ? allCampus : campus ? this.campusFilter.value : null,
      levels: allLevel && allLevel.length ? allLevel : level ? this.levelFilter.value : null,
      sectors: allSector && allSector.length ? allSector : sector ? this.sectorFilter.value : null,
    };
    this.specialityList = [];
    if (school || campus || sector) {
      this.subs.sink = this.studentService.GetAllSpecializationsByScholar(filter).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.specialityFilter.setValue(null);
            this.superFilter.specialities = null;
            const temp = _.cloneDeep(resp);
            this.specialityList = temp.sort((a, b) => {
              if (this.utilService.simplifyRegex(a?.name?.toLowerCase()) < this.utilService.simplifyRegex(b?.name?.toLowerCase())) {
                return -1;
              } else if (this.utilService.simplifyRegex(a?.name?.toLowerCase()) > this.utilService.simplifyRegex(b?.name?.toLowerCase())) {
                return 1;
              } else {
                return 0;
              }
            });
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
      this.specialityFilter.setValue(null);
      this.superFilter.specialities = null;
    }
  }

  // Function when scholar season selected
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
      this.sectorFilter.setValue(null);
    }
    if (this.specialityFilter.value) {
      this.specialityFilter.setValue(null);
    }

    if (!this.scholarSeasonFilter.value || this.scholarSeasonFilter.value.length === 0) {
      this.superFilter.scholar_season = '';
    } else {
      this.superFilter.scholar_season =
        this.scholarSeasonFilter.value && this.scholarSeasonFilter.value !== 'All' && this.scholarSeasonFilter.value !== 'AllF'
          ? this.scholarSeasonFilter.value
          : null;
      const scholarSeason =
        this.scholarSeasonFilter.value && this.scholarSeasonFilter.value !== 'All' && this.scholarSeasonFilter.value !== 'AllF'
          ? this.scholarSeasonFilter.value
          : '';
      this.getDataSchool(scholarSeason);
    }
  }

  // Function to handle super filter when select option
  // ************** Function handling school filter
  checkSuperFilterSchool() {
    const form = this.schoolFilter.value;
    if (form && form.length) {
      this.schoolFilter.patchValue(form);
    } else {
      this.schoolFilter.patchValue(null);
    }
    this.getDataCampus();
  }

  // ************** Function handling campus filter
  checkSuperFilterCampus() {
    const form = this.campusFilter.value;
    if (form && form.length) {
      this.campusFilter.patchValue(form);
    } else {
      this.campusFilter.patchValue(null);
    }
    this.getDataLevel();
  }

  // ************** Function handling level filter
  checkSuperFilterLevel() {
    const form = this.levelFilter.value;
    if (form && form.length) {
      this.levelFilter.patchValue(form);
      this.getDataSectorByLevel();
    } else {
      this.levelFilter.patchValue(null);
      this.sectorList = [];
      this.specialityList = [];
    }
  }

  // ************** Function handling sector filter
  checkSuperFilterSector() {
    const form = this.sectorFilter.value;
    if (form && form.length) {
      this.sectorFilter.patchValue(form);
      this.getDataSpecialityBySector();
    } else {
      this.sectorFilter.patchValue(null);
      this.specialityList = [];
    }
  }

  // ************** Function handling speciality filter
  checkSuperFilterSpecialities() {
    const form = this.specialityFilter.value;
    if (form && form.length) {
      this.specialityFilter.patchValue(form);
    } else {
      this.specialityFilter.patchValue(null);
    }
  }

  // ************** Function handling tag filter
  checkSuperFilterTags() {
    const form = this.tagFilter.value;
    if (form && form.length) {
      this.tagFilter.patchValue(form);
    } else {
      this.tagFilter.patchValue(null);
    }
  }

  // Function to apply super filter
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
    this.clearSelectIfFilter();
    this.isReset = true;
    this.isDisabled = true;
    this.getAllStudentsData('applysuperfilter');
  }
  // End Code Super Filter

  // Cleaning data from variable checkbox
  clearSelectIfFilter() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
  }

  // Re-fetch data student without remove filter
  refetchDataKeepFilter() {
    this.clearSelectIfFilter();
    this.paginator.firstPage();
    this.getAllStudentsData('refetch');
  }

  // Get List type of formation
  getDataTypeOfFormation() {
    this.subs.sink = this.studentService.getAllTypeOfInformationDropdown().subscribe(
      (res) => {
        if (res && res.length) {
          const filteredSigle = res.map((resp) => resp.sigle);
          this.listSigle = _.uniqBy(filteredSigle);
          this.listSigle = this.listSigle.sort((a, b) =>
            a?.toLowerCase() > b?.toLowerCase() ? 1 : b?.toLowerCase() > a?.toLowerCase() ? -1 : 0,
          );
        } else {
          this.listSigle = [];
        }
      },
      (error) => {
        this.listSigle = [];
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
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  // Get List type of formation
  getDataCurrentProgram() {
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.studentService.getAllProgramsByUserTypes(userTypesList).subscribe(
      (res) => {
        const programs = _.cloneDeep(res);
        if (programs && programs.length) {
          programs.forEach((program) => {
            if (program?.scholar_season_id?.scholar_season) {
              program.program = program?.scholar_season_id?.scholar_season + ' ' + program?.program;
            } else {
              program.program = program?.program;
            }
          });
          this.listDefaultProgram = [...programs];
          this.listDefaultProgram = this.listDefaultProgram.sort((a, b) =>
            this.utilityService.simplifyRegex(a.program).localeCompare(this.utilityService.simplifyRegex(b.program)),
          );
          this.listProgram = [...this.listDefaultProgram];
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

  setTypeStatusFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataTableFilter.status) === JSON.stringify(this.statusFilter.value);
    if (isSame) {
      return;
    } else if (this.statusFilter.value?.length) {
      this.filteredValues.candidate_admission_statuses = this.statusFilter.value;
      this.tempDataTableFilter.status = this.statusFilter.value;
      if (!this.isReset) {
        this.refetchDataKeepFilter();
      }
    } else {
      if (this.tempDataTableFilter.status?.length && !this.statusFilter.value?.length) {
        this.filteredValues.candidate_admission_statuses = null;
        this.tempDataTableFilter.status = null;
        if (!this.isReset) {
          this.refetchDataKeepFilter();
        }
      } else {
        return;
      }
    }
  }

  setTypeofRegisFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.filteredValues.type_of_registrations = this.typeOfRegistrationFilter.value;
    const isSame = JSON.stringify(this.tempDataTableFilter.typeRegistration) === JSON.stringify(this.typeOfRegistrationFilter.value);
    if (isSame) {
      return;
    } else if (this.typeOfRegistrationFilter.value?.length) {
      this.filteredValues.type_of_registrations = this.typeOfRegistrationFilter.value;
      this.tempDataTableFilter.typeRegistration = this.typeOfRegistrationFilter.value;
      if (!this.isReset) {
        this.refetchDataKeepFilter();
      }
    } else {
      if (this.tempDataTableFilter.typeRegistration?.length && !this.typeOfRegistrationFilter.value?.length) {
        this.filteredValues.type_of_registrations = this.typeOfRegistrationFilter.value;
        this.tempDataTableFilter.typeRegistration = null;
        if (!this.isReset) {
          this.refetchDataKeepFilter();
        }
      } else {
        return;
      }
    }
  }

  setFormationTypeFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataTableFilter.formationType) === JSON.stringify(this.formationTypeFilter.value);
    if (isSame) {
      return;
    } else if (this.formationTypeFilter.value?.length) {
      this.filteredValues.sigles = this.formationTypeFilter.value;
      this.tempDataTableFilter.formationType = this.formationTypeFilter.value;
      this.getAllStudentsData();
      if (!this.isReset) {
        this.refetchDataKeepFilter();
      }
    } else {
      if (this.tempDataTableFilter.formationType?.length && !this.formationTypeFilter.value?.length) {
        this.filteredValues.sigles = this.formationTypeFilter.value;
        this.tempDataTableFilter.formationType = null;
        if (!this.isReset) {
          this.refetchDataKeepFilter();
        }
      } else {
        return;
      }
    }
  }
  setVisaFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.filteredValues.visa_statuses = this.visaFilter.value;
    const isSame = JSON.stringify(this.tempDataTableFilter.visa_statuses) === JSON.stringify(this.visaFilter.value);
    if (isSame) {
      return;
    } else if (this.visaFilter.value?.length) {
      this.filteredValues.visa_statuses = this.visaFilter.value;
      this.tempDataTableFilter.visa_statuses = this.visaFilter.value;
      if (!this.isReset) {
        this.refetchDataKeepFilter();
      }
    } else {
      if (this.tempDataTableFilter.visa_statuses?.length && !this.visaFilter.value?.length) {
        this.filteredValues.visa_statuses = null;
        this.tempDataTableFilter.visa_statuses = null;
        if (!this.isReset) {
          this.refetchDataKeepFilter();
        }
      } else {
        return;
      }
    }
  }

  // Function for Current Program Filter
  onFilterSelect() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.listProgram = [...this.listDefaultProgram];
    const isSame = JSON.stringify(this.tempDataTableFilter.currentProgram) === JSON.stringify(this.currentProgramFilter.value);
    if (isSame) {
      return;
    } else if (this.currentProgramFilter.value?.length) {
      this.filteredValues.intake_channel_names = this.currentProgramFilter.value;
      this.tempDataTableFilter.currentProgram = this.currentProgramFilter.value;
      if (!this.isReset) {
        this.refetchDataKeepFilter();
      }
    } else {
      if (this.tempDataTableFilter.currentProgram?.length && !this.currentProgramFilter.value?.length) {
        this.filteredValues.intake_channel_names = this.currentProgramFilter.value;
        this.tempDataTableFilter.currentProgram = null;
        if (!this.isReset) {
          this.refetchDataKeepFilter();
        }
      } else {
        return;
      }
    }
  }
  // Function for Current Program Filter to display correct value in the table
  displayWithProgramNameFn(id: string | null) {
    if (id === this.translate.instant('All')) {
      return id;
    } else if (!id) {
      return '';
    }
    const program = this.listDefaultProgram.find((programs) => programs?.program && id && programs?.program === id);
    if (program?.program) {
      return program?.program;
    } else {
      return '';
    }
  }

  // Function for Reset All Filter, Pagination, and Sorting table
  resetTable() {
    this.isReset = true;
    this.isCheckedAll = false;
    this.selection.clear();
    this.dataSelected = [];
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
    this.allAddTagForCheckbox = [];
    this.allRemoveTagForCheckbox = [];
    this.allSendMailForCheckbox = [];
    this.allSendReminderForCheckbox = [];
    this.paginator.pageIndex = 0;
    this.filteredValues = {
      scholar_season: null,
      schools: null,
      campuses: null,
      levels: null,
      sectors: null,
      specialities: null,
      tags: null,
      intake_channel_name: null,
      intake_channel_names: null,
      candidate: null,
      candidate_unique_number: null,
      candidate_admission_status: null,
      candidate_admission_statuses: null,
      readmission_status: 'all_candidates',
      registered_at: null,
      sigle: null,
      sigles: null,
      type_of_registration: null,
      type_of_registrations: null,
      is_deposit_paid: null,
      is_deposit_paids: null,
      payment: null,
      payments: null,
      offset: null,
      visa_statuses: null,
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
    this.scholarSeasonFilter.setValue('All');
    this.schoolFilter.setValue('');
    this.campusFilter.setValue(null);
    this.levelFilter.setValue(null);
    this.sectorFilter.setValue(null);
    this.specialityFilter.setValue(null);
    this.tagFilter.setValue('');

    this.currentProgramFilter.setValue(null, { emitEvent: false });
    this.formationTypeFilter.setValue(null, { emitEvent: false });
    this.studentNumberFilter.setValue(null, { emitEvent: false });
    this.nameFilter.setValue(null, { emitEvent: false });
    this.statusFilter.setValue(null, { emitEvent: false });
    this.typeOfRegistrationFilter.setValue(null, { emitEvent: false });
    this.registrationDateFilter.setValue(null, { emitEvent: false });
    this.downPaymentFilter.setValue(null, { emitEvent: false });
    this.visaFilter.setValue(null, { emitEvent: false });

    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;

    this.schoolList = [];
    this.campusList = [];
    this.levelList = [];
    this.sectorList = [];
    this.specialityList = [];
    this.filterBreadcrumbData = [];

    this.isDisabled = true;
    const scholarSeason = this.scholarSeasonFilter.value && this.scholarSeasonFilter.value !== 'All' ? this.scholarSeasonFilter.value : '';
    this.getDataSchool(scholarSeason);

    // temp data for filter
    this.tempDataTableFilter = {
      formationType: null,
      currentProgram: null,
      status: null,
      typeRegistration: null,
      visa_statuses: null,
    };

    this.tempDraggableColumn = [];
    this.tempDraggableColumnFilter = [];
    this.checkTemplateTable();
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return this.isCheckedAll ? true : numSelected === numRows || numSelected > numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
      this.allAddTagForCheckbox = [];
      this.allRemoveTagForCheckbox = [];
      this.allSendMailForCheckbox = [];
      this.allSendReminderForCheckbox = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
      this.allAddTagForCheckbox = [];
      this.allRemoveTagForCheckbox = [];
      this.allSendMailForCheckbox = [];
      this.allSendReminderForCheckbox = [];
      this.isCheckedAll = true;
      this.dataSource.data.map((row) => {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
    }
  }

  /** Select row 1 by 1 and record it inside 1 variable for global */
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
    this.selectType = info;
  }
  safeUrl() {
    const url = `${environment.studentEnvironment}/session/login`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  connectAsStudent(student) {
    this.isLoading = true;
    const currentUser = this.utilityService.getCurrentUser();
    const studentUserId = student && student.user_id && student.user_id._id ? student.user_id._id : null;
    if (currentUser && studentUserId) {
      this.subs.sink = this.authService.loginAsUser(currentUser._id, studentUserId).subscribe((resp) => {
        this.isLoading = false;
        if (resp?.user?.student_id?._id) {
          const tempUser = resp.user;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('SUCCESS'),
            html: this.translate.instant('USER_S7_SUPERUSER.TEXT', {
              UserCivility: this.translate.instant(student.civility),
              UserFirstName: student.first_name,
              UserLastName: student.last_name,
            }),
            allowEscapeKey: true,
            allowOutsideClick: false,
            confirmButtonText: this.translate.instant('UNDERSTOOD'),
          }).then((result) => {
            const studentType = '5a067bba1c0217218c75f8ab';
            if (tempUser.entities[0].type._id === studentType || tempUser.student_id) {
              this.authService.connectAsStudent(resp, 'Student', 'connect');
            }
          });
        } else {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('Student_Not_Registered.TITLE'),
            html: this.translate.instant('Student_Not_Registered.TEXT', {
              civility: student.civility === 'neutral' ? '' : `${this.translate.instant(student.civility)} `,
              firstname: student.first_name,
              lastname: student.last_name,
            }),
            confirmButtonText: this.translate.instant('Student_Not_Registered.BUTTON'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        }
      });
    } else {
      this.isLoading = false;
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Student_Not_Registered.TITLE'),
        html: this.translate.instant('Student_Not_Registered.TEXT', {
          civility: student.civility === 'neutral' ? '' : `${this.translate.instant(student.civility)} `,
          firstname: student.first_name,
          lastname: student.last_name,
        }),
        confirmButtonText: this.translate.instant('Student_Not_Registered.BUTTON'),
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: false,
      });
    }
  }
  goToStudentCard(student) {
    const query = {
      selectedCandidate: student?._id,
      sortValue: JSON.stringify(this.sortValue) || '',
      tab: '',
      paginator: JSON.stringify({
        pageIndex: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize,
      }),
    };
    const url = this.router.createUrlTree(['candidate-file'], { queryParams: query });
    window.open(url.toString(), '_blank');
  }
  sendEmailStudent(student) {
    if (student) {
      const mappedData = {
        candidate_id: {
          candidate_admission_status: student?.candidate_admission_status,
          civility: student?.civility,
          first_name: student?.first_name,
          last_name: student?.last_name,
          email: student?.email,
          emailDefault: student?.school_mail,
          _id: student?._id,
        },
        financial_supports: student.payment_supports,
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
            this.getAllStudentsData();
          }
        });
    }
  }

  askForVisaDocumentDialog(student) {
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    if (student) {
      this.subs.sink = this.dialog
        .open(AskVisaDocumentDialogComponent, {
          width: '600px',
          panelClass: 'certification-rule-pop-up',
          minHeight: '100px',
          disableClose: true,
          data: {
            student,
            from: 'single',
            userTypesList,
          },
        })
        .afterClosed()
        .subscribe((resp) => {
          if (!this.isReset && resp) {
            this.getAllStudentsData();
          }
        });
    }
  }
  // Function controller for button above table
  controllerButton(action) {
    this.clickedActionButton = action;
    if (this.dataSelected.length < 1 && !this.isCheckedAll) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Student') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      switch (action) {
        case 'export':
          setTimeout(() => {
            this.getAllIdForCheckbox(0);
          }, 500);
          break;
        case 'send_mail':
          setTimeout(() => {
            this.getAllStudentsForSendingMail(0);
          }, 500);
          break;
        case 'add_tag':
          setTimeout(() => {
            this.getAllTagStudentForCheckbox(0);
          }, 500);
          break;
        case 'remove_tag':
          setTimeout(() => {
            this.getAllStudentsForRemoveTag(0);
          }, 500);
          break;
        case 'ask_for_visa_document':
          setTimeout(() => {
            this.getAllForVisaDocument(0);
          }, 500);
          break;
        case 'reminder_for_visa_document':
          setTimeout(() => {
            this.sendReminderForVisaDocument(0);
          }, 500);
          break;
        default:
          this.refetchDataKeepFilter();
      }
    }
  }

  // Get Data Student based on data selected for add tag
  getAllTagStudentForCheckbox(pageNumber) {
    if (this.clickedActionButton === 'add_tag') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allAddTagForCheckbox = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isWaitingForResponse = true;
        const filter = this.cleanFilterData();
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        this.subs.sink = this.studentService.getAllForAddTagCheckbox(pagination, this.sortValue, filter, userTypesList).subscribe(
          (students: any) => {
            if (students && students.length) {
              const resp = _.cloneDeep(students);
              this.allAddTagForCheckbox = _.concat(this.allAddTagForCheckbox, resp);
              const page = pageNumber + 1;
              this.getAllTagStudentForCheckbox(page);
            } else {
              this.isWaitingForResponse = false;
              if (this.isCheckedAll && this.allAddTagForCheckbox && this.allAddTagForCheckbox.length) {
                this.dataSelected = this.allAddTagForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                console.log('getAllIdForCheckbox', this.dataSelected);
                if (this.dataSelected && this.dataSelected.length) {
                  this.openAddMultipleTagDialog();
                }
              }
            }
          },
          (err) => {
            this.isReset = false;
            this.isWaitingForResponse = false;
            this.authService.postErrorLog(err);
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      } else {
        this.openAddMultipleTagDialog();
      }
    }
  }

  checkDisplayedColumn() {
    const selectedColumnData = this.columnCtrl?.value;
    if (selectedColumnData && selectedColumnData?.length) {
      const tempSelectedColumnData = selectedColumnData?.map((selectedColumn) => {
        return selectedColumn?.colName;
      });

      if (tempSelectedColumnData?.length === 1 && tempSelectedColumnData.includes('select')) {
        return true;
      } else {
        return false;
      }
    }
  }

  // Get Data Student based on data selected for export
  getAllIdForCheckbox(pageNumber) {
    if (this.clickedActionButton === 'export') {
      // if (this.checkDisplayedColumn()) {
      //   Swal.fire({
      //     type: 'info',
      //     title: this.translate?.instant('CUSTOM_COLUMN_S1.Title'),
      //     html: this.translate?.instant('CUSTOM_COLUMN_S1.Text'),
      //     confirmButtonText: this.translate?.instant('CUSTOM_COLUMN_S1.Button'),
      //   }).then(() => {
      //     return;
      //   });
      // } else {
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
          this.isWaitingForResponse = true;
          const filter = this.cleanFilterData();
          const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
          this.subs.sink = this.studentService.getAllIdForStudentTagCheckbox(pagination, this.sortValue, filter, userTypesList).subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allExportForCheckbox = _.concat(this.allExportForCheckbox, resp);
                const page = pageNumber + 1;
                this.getAllIdForCheckbox(page);
              } else {
                this.isWaitingForResponse = false;
                if (this.isCheckedAll && this.allExportForCheckbox && this.allExportForCheckbox.length) {
                  this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  console.log('getAllIdForCheckbox', this.dataSelected);
                  if (this.dataSelected && this.dataSelected.length) {
                    this.downloadCSV();
                  }
                }
              }
            },
            (err) => {
              this.isReset = false;
              this.isWaitingForResponse = false;
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
        this.downloadCSV();
      }
      // }
    }
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
        json: this.translate.instant('IMPORT_DECISION_S1.JSON')
      };
      Swal.fire({
        type: 'question',
        title: this.translate.instant('EXPORT_DECISION.TITLE'),
        width: 700,
        allowEscapeKey: true,
        showCancelButton: true,
        cancelButtonText: this.translate.instant('IMPORT_DECISION_S1.CANCEL'),
        confirmButtonText: this.translate.instant('IMPORT_DECISION_S1.OK'),
        input: 'radio',
        inputOptions: inputOptions,
        inputValue: this.translate && this.translate.currentLang === 'fr' ? ';' : '',
        inputValidator: (value) => {
          return new Promise((resolve, reject) => {
            const confirmButtonRef = Swal.getConfirmButton()
            if (value) {
              resolve('');
              confirmButtonRef.removeAttribute('disabled');
            } else {
              confirmButtonRef.setAttribute('disabled', 'true');
              reject(this.translate.instant('IMPORT_DECISION_S1.INVALID'));
            }
          });
        },
        onOpen: function () {
          const confirmButtonRef = Swal.getConfirmButton()
          confirmButtonRef.setAttribute('disabled', 'true');
          Swal.getContent().addEventListener('click', function (e) {
            confirmButtonRef.removeAttribute('disabled');
          });
          const input = Swal.getInput();
          const inputValue = input.getAttribute('value');
          if (inputValue === ';') {
            confirmButtonRef.removeAttribute('disabled');
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
    const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
    if ((this.dataSelected.length && !this.isCheckedAll) || (this.dataUnselectUser && this.dataUnselectUser.length)) {
      const billing = `"candidate_ids":` + '[' + mappedUserId.toString() + ']';
      if (filter.length > 9) {
        filtered = filter.slice(0, 10) + billing + ',' + filter.slice(10);
      } else {
        filtered = filter.slice(0, 10) + billing + filter.slice(10);
      }
    } else if (this.isCheckedAll) {
      filtered = filter;
    }
    const userTypesList =
      this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id.map((res) => `"` + res + `"`) : [];
    const importStudentTemlate = `downloadAllStudentCSV/`;
    const sorting = this.sortingForExport();
    
    let optionIfJson = '';
    if (fileType === 'json') {
      optionIfJson = '"return_json_file": true,'
      fileType = ','
    }
    
    let fullURL;
    fullURL = url + importStudentTemlate + fileType + '/' + lang;

    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
        'Content-Type': 'application/json',
      }),
    };

    const payload = '{' + optionIfJson + filtered + ',"user_type_ids":[' + userTypesList + '],' + sorting + '}';

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

  // Get Data Student based on data selected for send multiple Visa Document
  getAllForVisaDocument(page: number) {
    if (this.clickedActionButton !== 'ask_for_visa_document') {
      return;
    }

    const pagination = { limit: 500, page };
    const sort = this.sortValue;
    const filter = this.cleanFilterData();

    if (this.isCheckedAll) {
      if (page === 0) {
        this.dataSelected = [];
        this.allRemoveTagForCheckbox = [];
      }
      this.isLoading = true;
      const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
      this.subs.sink = this.studentService.getAllStudentsForAskVisaDocument(pagination, filter, sort, userTypesList).subscribe(
        (students: any) => {
          if (students && students?.length > 0) {
            const resp = _.cloneDeep(students);
            this.allRemoveTagForCheckbox = _.concat(this.allRemoveTagForCheckbox, resp);
            this.getAllForVisaDocument(page + 1);
          } else {
            this.isLoading = false;
            if (this.isCheckedAll && this.allRemoveTagForCheckbox?.length) {
              this.dataSelected = this.allRemoveTagForCheckbox.filter((item) => !this.dataUnselectUser.includes(item._id));
              this.dataSelected = _.uniqBy(this.dataSelected, '_id');
              if (this.dataSelected?.length) {
                this.openAskMultipleVisaDialog();
              } else {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('Followup_S8.Title'),
                  html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Student') }),
                  confirmButtonText: this.translate.instant('Followup_S8.Button'),
                });
              }
            }
          }
        },
        (err: any) => {
          this.isLoading = false;
          this.authService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          });
        },
      );
    } else {
      this.openAskMultipleVisaDialog();
    }
  }

  sendReminderForVisaDocument(page) {
    if (this.clickedActionButton !== 'reminder_for_visa_document') {
      return;
    }
    const pagination = { limit: 500, page };
    const sort = this.sortValue;
    const filter = this.cleanFilterData();
    if (this.isCheckedAll) {
      if (page === 0) {
        this.dataSelected = [];
        this.allSendReminderForCheckbox = [];
      }
      this.isLoading = true;
      const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
      this.subs.sink = this.studentService.getAllStudentsForSendReminderCheckbox(pagination, filter, sort, userTypesList).subscribe(
        (students: any) => {
          if (students && students.length && students.length > 0) {
            const resp = _.cloneDeep(students);
            this.allSendReminderForCheckbox = _.concat(this.allSendReminderForCheckbox, resp);
            this.sendReminderForVisaDocument(page + 1);
          } else {
            this.isLoading = false;
            if (this.isCheckedAll && this.allSendReminderForCheckbox && this.allSendReminderForCheckbox?.length) {
              this.dataSelected = this.allSendReminderForCheckbox.filter((item) => !this.dataUnselectUser.includes(item._id));
              this.dataSelected = _.uniqBy(this.dataSelected, '_id');
              if (this.dataSelected?.length) {
                this.sendReminderMultiple();
              } else {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('Followup_S8.Title'),
                  html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Student') }),
                  confirmButtonText: this.translate.instant('Followup_S8.Button'),
                });
              }
            }
          }
        },
        (err: any) => {
          this.isLoading = false;
          this.authService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          });
        },
      );
    } else {
      this.sendReminderMultiple();
    }
  }

  sendReminderMultiple() {
    const selectedData = this.dataSelected;
    let timeDisabled = 3;
    let filter = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    if (selectedData && selectedData?.length) {
      const mappedStudentData = selectedData.map((student) => {
        return student?._id;
      });
      filter = {
        ...filter,
        candidate_ids: mappedStudentData,
      };
      Swal.fire({
        title: this.translate.instant('DocumentVisaReminder_S3.TITLE'),
        text: this.translate.instant('DocumentVisaReminder_S3.TEXT'),
        type: 'warning',
        allowEscapeKey: true,
        allowEnterKey: false,
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('Yes', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('No'),
        onOpen: () => {
          Swal.getConfirmButton().setAttribute('disabled', '');
          const confirmBtnRef = Swal.getConfirmButton();
          const intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('Reminder_ONE_TIME_FORM.Button1') + ` (${timeDisabled})`;
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('Reminder_ONE_TIME_FORM.Button1');
            Swal.getConfirmButton().removeAttribute('disabled');
            clearInterval(intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      }).then((resp) => {
        clearTimeout(this.timeOutVal);
        if (resp.value) {
          this.isWaitingForResponse = true;
          this.subs.sink = this.studentService.sendReminderVisaDocument(userTypesList, filter).subscribe(
            (resp) => {
              this.isWaitingForResponse = false;
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.refetchDataKeepFilter();
              });
            },
            (err) => {
              this.isWaitingForResponse = false;
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
  }

  sendReminder(studentData) {
    const studentId = studentData?._id;
    let timeDisabled = 3;
    const studentName =
      (studentData?.civility === 'neutral' ? '' : this.translate.instant(studentData?.civility)) +
      ' ' +
      studentData?.first_name +
      ' ' +
      studentData?.last_name.toUpperCase();
    const filter = {
      candidate_ids: [studentId],
    };
    const userTypesList = this.currentUser && this.currentUser?.app_data ? this.currentUser?.app_data?.user_type_id : [];
    if (studentId) {
      if (studentData?.visa_document_process_id?.form_status === 'not_sent') {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('DocumentVisaReminder_S2.TITLE', { studentName }),
          html: this.translate.instant('DocumentVisaReminder_S2.TEXT'),
          confirmButtonText: 'OK',
          allowOutsideClick: false,
          allowEnterKey: false,
          allowEscapeKey: false,
        });
      } else {
        Swal.fire({
          title: this.translate.instant('DocumentVisaReminder_S1.TITLE', { studentName }),
          text: this.translate.instant('DocumentVisaReminder_S1.TEXT', { studentName }),
          type: 'warning',
          allowEscapeKey: true,
          allowEnterKey: false,
          allowOutsideClick: false,
          showCancelButton: true,
          confirmButtonText: this.translate.instant('Yes', { timer: timeDisabled }),
          cancelButtonText: this.translate.instant('No'),
          onOpen: () => {
            Swal.getConfirmButton().setAttribute('disabled', '');
            const confirmBtnRef = Swal.getConfirmButton();
            const intVal = setInterval(() => {
              timeDisabled -= 1;
              confirmBtnRef.innerText = this.translate.instant('Reminder_ONE_TIME_FORM.Button1') + ` (${timeDisabled})`;
            }, 1000);

            this.timeOutVal = setTimeout(() => {
              confirmBtnRef.innerText = this.translate.instant('Reminder_ONE_TIME_FORM.Button1');
              Swal.getConfirmButton().removeAttribute('disabled');
              clearInterval(intVal);
              clearTimeout(this.timeOutVal);
            }, timeDisabled * 1000);
          },
        }).then((resp) => {
          clearTimeout(this.timeOutVal);
          if (resp.value) {
            this.isWaitingForResponse = true;
            this.subs.sink = this.studentService.sendReminderVisaDocument(userTypesList, filter).subscribe(
              (resp) => {
                this.isWaitingForResponse = false;
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('Bravo!'),
                  confirmButtonText: this.translate.instant('OK'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.getAllStudentsData();
                });
              },
              (err) => {
                this.isWaitingForResponse = false;
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
    }
  }

  openAskMultipleVisaDialog() {
    const selectedData = this.dataSelected;
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    if (selectedData && selectedData?.length) {
      this.subs.sink = this.dialog
        .open(AskVisaDocumentDialogComponent, {
          disableClose: true,
          width: '750px',
          panelClass: 'certification-rule-pop-up',
          data: {
            selectedData,
            userTypesList,
            from: 'multiple',
          },
          autoFocus: false,
        })
        .afterClosed()
        .subscribe((resp) => {
          if (resp) {
            this.refetchDataKeepFilter();
          }
        });
    }
  }

  // Get Data Student based on data selected for send multiple mail
  getAllStudentsForSendingMail(page: number) {
    if (this.clickedActionButton !== 'send_mail') {
      return;
    }

    const pagination = { limit: 500, page };
    const sort = this.sortValue;
    const filter = this.cleanFilterData();

    if (this.isCheckedAll) {
      if (page === 0) {
        this.dataSelected = [];
        this.allSendMailForCheckbox = [];
      }
      this.isWaitingForResponse = true;
      const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
      this.subs.sink = this.studentService.getMultipleEmailsTag(pagination, sort, filter, userTypesList).subscribe(
        (students: any) => {
          if (students && students.length && students.length > 0) {
            const resp = _.cloneDeep(students);
            this.allSendMailForCheckbox = _.concat(this.allSendMailForCheckbox, resp);
            this.getAllStudentsForSendingMail(page + 1);
          } else {
            this.isWaitingForResponse = false;
            if (this.isCheckedAll && this.allSendMailForCheckbox && this.allSendMailForCheckbox.length) {
              this.dataSelected = this.allSendMailForCheckbox.filter((item) => !this.dataUnselectUser.includes(item._id));
              console.log('getMultipleEmails', this.dataSelected);
              this.dataSelected = _.uniqBy(this.dataSelected, '_id');
              if (this.dataSelected && this.dataSelected.length) {
                this.openSendMultipleEmailDialog();
              }
            }
          }
        },
        (err: any) => {
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
    } else {
      this.openSendMultipleEmailDialog();
    }
  }

  openSendMultipleEmailDialog() {
    let data = this.dataSelected;
    if (data) {
      data = data.map((res) => {
        return {
          candidate: {
            email: res.email,
            emailDefault: res.school_mail,
          },
        };
      });
      this.mailAllStudentsComponent = this.dialog.open(MailAllStudentsDialogComponent, {
        disableClose: true,
        width: '750px',
        data: data,
        autoFocus: false,
      });
      this.subs.sink = this.mailAllStudentsComponent.afterClosed().subscribe((resulta) => {
        if (resulta) {
          this.refetchDataKeepFilter();
        }
        this.mailAllStudentsComponent = null;
      });
    }
  }

  openAddMultipleTagDialog() {
    const data = this.dataSelected;
    if (data) {
      const candidateId = data.map((res) => res?._id);
      const tags = data.map((res) => res?.tag_ids);
      this.addTagsDialogComponent = this.dialog.open(AddTagsDialogComponent, {
        disableClose: true,
        width: '750px',
        data: {
          candidateId: candidateId,
          tags: tags,
          from: 'all-students',
        },
        autoFocus: false,
      });
      this.subs.sink = this.addTagsDialogComponent.afterClosed().subscribe((resulta) => {
        if (resulta) {
          this.refetchDataKeepFilter();
        }
        this.addTagsDialogComponent = null;
      });
    }
  }
  getAllStudentsForRemoveTag(page: number) {
    if (this.clickedActionButton !== 'remove_tag') {
      return;
    }

    const pagination = { limit: 500, page };
    const sort = this.sortValue;
    const filter = this.cleanFilterData();

    if (this.isCheckedAll) {
      if (page === 0) {
        this.dataSelected = [];
        this.allRemoveTagForCheckbox = [];
      }
      this.isLoading = true;
      const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
      this.subs.sink = this.studentService.getAllStudentsTagForRemoveTag(pagination, filter, sort, userTypesList).subscribe(
        (students: any) => {
          if (students && students?.length > 0) {
            const resp = _.cloneDeep(students);
            this.allRemoveTagForCheckbox = _.concat(this.allRemoveTagForCheckbox, resp);
            this.getAllStudentsForRemoveTag(page + 1);
          } else {
            this.isLoading = false;
            if (this.isCheckedAll && this.allRemoveTagForCheckbox?.length) {
              this.dataSelected = this.allRemoveTagForCheckbox.filter((item) => !this.dataUnselectUser.includes(item._id));
              this.dataSelected = _.uniqBy(this.dataSelected, '_id');
              if (this.dataSelected?.length) {
                this.openRemoveTagDialog();
              } else {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('Followup_S8.Title'),
                  html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Student') }),
                  confirmButtonText: this.translate.instant('Followup_S8.Button'),
                });
              }
            }
          }
        },
        (err: any) => {
          this.isLoading = false;
          this.authService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          });
        },
      );
    } else {
      this.openRemoveTagDialog();
    }
  }
  openRemoveTagDialog() {
    let tagList = [];
    const checkStudentTag = this.dataSelected.filter((data) => !data.tag_ids);
    if (this.dataSelected?.length && !checkStudentTag?.length) {
      const firstStudentTag = this.dataSelected[0]?.tag_ids?.length ? this.dataSelected[0].tag_ids : null;
      const students = this.dataSelected.map((data) => {
        return {
          ...data,
          tagIdList: data?.tag_ids?.map((tag) => tag?._id),
        };
      });
      firstStudentTag.forEach((tag) => {
        const checkTag = students.every((student) => student?.tagIdList?.includes(tag?._id));
        if (checkTag) {
          tagList.push(tag);
        }
      });
      tagList = _.uniqBy(tagList, '_id');
    }
    if (checkStudentTag?.length || !tagList?.length) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('student_tags_S2.TITLE'),
        html: this.translate.instant('student_tags_S2.TEXT'),
        confirmButtonText: this.translate.instant('student_tags_S2.BUTTON'),
        allowEscapeKey: true,
        allowOutsideClick: false,
        allowEnterKey: false,
      });
      return;
    }
    this.subs.sink = this.dialog
      .open(RemoveTagsDialogComponent, {
        disableClose: true,
        width: '600px',
        autoFocus: false,
        data: {
          students: this.dataSelected,
          tags: tagList,
        },
        panelClass: 'no-padding-pop-up',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.refetchDataKeepFilter();
        }
      });
  }

  // Function to remove breadcrumb filter
  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadcrumbData = [];
    if (filterItem.type === 'super_filter') {
      if (filterItem.name === 'scholar_season') {
        this.scholarSelect();
        this.scholarSeasonFilter.setValue('All');
        this.filteredValues.scholar_season = null;
        this.filteredValues.schools = null;
        this.filteredValues.campuses = null;
        this.filteredValues.levels = null;
        this.filteredValues.sectors = null;
        this.filteredValues.specialities = null;
        this.filteredValues.tags = null;
      } else if (filterItem.name === 'schools') {
        this.checkSuperFilterSchool();
        this.filteredValues.schools = null;
        this.filteredValues.campuses = null;
        this.filteredValues.levels = null;
        this.filteredValues.sectors = null;
        this.filteredValues.specialities = null;
        this.filteredValues.tags = null;
      } else if (filterItem.name === 'campuses') {
        this.checkSuperFilterCampus();
        this.filteredValues.campuses = null;
        this.filteredValues.levels = null;
        this.filteredValues.sectors = null;
        this.filteredValues.specialities = null;
        this.filteredValues.tags = null;
      } else if (filterItem.name === 'levels') {
        this.checkSuperFilterLevel();
        this.filteredValues.levels = null;
        this.filteredValues.sectors = null;
        this.filteredValues.specialities = null;
        this.filteredValues.tags = null;
      } else if (filterItem.name === 'sectors') {
        this.checkSuperFilterSector();
        this.filteredValues.sectors = null;
        this.filteredValues.specialities = null;
        this.filteredValues.tags = null;
      } else if (filterItem.name === 'specialities') {
        this.checkSuperFilterSpecialities();
        this.filteredValues.specialities = null;
        this.filteredValues.tags = null;
      } else if (filterItem.name === 'tags') {
        this.checkSuperFilterTags();
        this.filteredValues.tags = null;
      }
      this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.superFilter, this.filteredValues);
    } else if (filterItem.type === 'table_filter') {
      if (filterItem.name === 'sigle') {
        this.formationTypeFilter.setValue('All');
      } else if (filterItem.name === 'intake_channel_name') {
        this.currentProgramFilter.setValue(this.translate.instant('All'));
      } else if (filterItem.name === 'candidate_admission_status') {
        this.statusFilter.setValue('All');
      } else if (filterItem.name === 'type_of_registration') {
        this.typeOfRegistrationFilter.setValue('All');
      } else if (filterItem?.name === 'visa_statuses') {
        this.tempDataTableFilter.visa_statuses = null;
      }
      this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
    }
    this.isDisabled = true;
    this.clearSelectIfFilter();
    this.getAllStudentsData();
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'scholar_season', // name of the key in the object storing the filter
        column: 'CARDDETAIL.Scholar Season', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.superFilter, // the object holding the filter value (e.g. filteredValues | superFilter)
        filterList: this.scholarSeasonList, // the array/list holding the dropdown options
        filterRef: this.scholarSeasonFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'scholar_season', // the key displayed in the html (only applicable to array of objects)
        savedValue: '_id', // the value saved when user select an option (e.g. _id)
        resetValue: 'All',
      },
      {
        type: 'super_filter',
        name: 'schools',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.School',
        isMultiple: this.schoolFilter?.value?.length === this.schoolList?.length ? false : true,
        filterValue: this.schoolFilter?.value?.length === this.schoolList?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.schoolFilter?.value?.length === this.schoolList?.length ? null : this.schoolList,
        filterRef: this.schoolFilter,
        displayKey: 'short_name',
        savedValue: '_id',
        isSelectionInput: this.schoolFilter?.value?.length === this.schoolList?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'campuses',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus',
        isMultiple: this.campusFilter?.value?.length === this.campusList?.length ? false : true,
        filterValue: this.campusFilter?.value?.length === this.campusList?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.campusList,
        filterRef: this.campusFilter,
        displayKey: 'name',
        savedValue: '_id',
        isSelectionInput: this.campusFilter?.value?.length === this.campusList?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'levels',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level',
        isMultiple: this.levelFilter?.value?.length === this.levelList?.length ? false : true,
        filterValue: this.levelFilter?.value?.length === this.levelList?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.levelList,
        filterRef: this.levelFilter,
        displayKey: 'name',
        savedValue: '_id',
        isSelectionInput: this.levelFilter?.value?.length === this.levelList?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'sectors',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Sector',
        isMultiple: this.sectorFilter?.value?.length === this.sectorList?.length ? false : true,
        filterValue: this.sectorFilter?.value?.length === this.sectorList?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.sectorList,
        filterRef: this.sectorFilter,
        displayKey: 'name',
        savedValue: '_id',
        isSelectionInput: this.sectorFilter?.value?.length === this.sectorList?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'specialities',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Speciality',
        isMultiple: this.specialityFilter?.value?.length === this.specialityList?.length ? false : true,
        filterValue: this.specialityFilter?.value?.length === this.specialityList?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.specialityList,
        filterRef: this.specialityFilter,
        displayKey: 'name',
        savedValue: '_id',
        isSelectionInput: this.specialityFilter?.value?.length === this.specialityList?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'tags',
        column: 'All_Students.Tag',
        isMultiple: this.tagFilter?.value?.length === this.tagList?.length ? false : true,
        filterValue: this.tagFilter?.value?.length === this.tagList?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.tagList,
        filterRef: this.tagFilter,
        displayKey: 'name',
        savedValue: '_id',
        isSelectionInput: this.tagFilter?.value?.length === this.tagList?.length ? false : true,
      },
      // Table Filters below
      {
        type: 'table_filter',
        name: 'sigles',
        column: 'All_Students.Formation type',
        isMultiple: this.formationTypeFilter?.value?.length === this.listSigle?.length ? false : true,
        filterValue: this.formationTypeFilter?.value?.length === this.listSigle?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.formationTypeFilter?.value?.length === this.listSigle?.length ? null : this.listSigle,
        filterRef: this.formationTypeFilter,
        isSelectionInput: this.formationTypeFilter?.value?.length === this.listSigle?.length ? false : true,
        displayKey: null,
        savedValue: null,
      },
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
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'candidate',
        column: 'AdmissionFollowUp.Name',
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
        name: 'intake_channel_names',
        column: 'Current Program',
        isMultiple: this.currentProgramFilter?.value?.length === this.listProgram?.length ? false : true,
        filterValue: this.currentProgramFilter?.value?.length === this.listProgram?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.currentProgramFilter?.value?.length === this.listProgram?.length ? null : this.listProgram,
        filterRef: this.currentProgramFilter,
        isSelectionInput: this.currentProgramFilter?.value?.length === this.listProgram?.length ? false : true,
        displayKey: this.currentProgramFilter?.value?.length === this.listProgram?.length ? null : 'program',
        savedValue: this.currentProgramFilter?.value?.length === this.listProgram?.length ? null : 'program',
      },
      {
        type: 'table_filter',
        name: 'candidate_admission_statuses',
        column: 'AdmissionFollowUp.Status',
        isMultiple: this.statusFilter?.value?.length === this.studentStatusFilterList?.length ? false : true,
        filterValue:
          this.statusFilter?.value?.length === this.studentStatusFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.statusFilter?.value?.length === this.studentStatusFilterList?.length ? null : this.studentStatusFilterList,
        filterRef: this.statusFilter,
        isSelectionInput: this.statusFilter?.value?.length === this.studentStatusFilterList?.length ? false : true,
        displayKey: this.statusFilter?.value?.length === this.studentStatusFilterList?.length ? null : 'key',
        savedValue: this.statusFilter?.value?.length === this.studentStatusFilterList?.length ? null : 'value',
      },
      {
        type: 'table_filter',
        name: 'type_of_registrations',
        column: 'All_Students.Type of registration',
        isMultiple: this.typeOfRegistrationFilter?.value?.length === this.listRegistration?.length ? false : true,
        filterValue:
          this.typeOfRegistrationFilter?.value?.length === this.listRegistration?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.typeOfRegistrationFilter?.value?.length === this.listRegistration?.length ? null : this.listRegistration,
        filterRef: this.typeOfRegistrationFilter,
        isSelectionInput: this.typeOfRegistrationFilter?.value?.length === this.listRegistration?.length ? false : true,
        displayKey: this.typeOfRegistrationFilter?.value?.length === this.listRegistration?.length ? null : 'label',
        savedValue: this.typeOfRegistrationFilter?.value?.length === this.listRegistration?.length ? null : 'value',
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
        name: 'visa_statuses',
        column: 'Visa Document',
        isMultiple: this.visaFilter?.value?.length === this.listVisa?.length ? false : true,
        filterValue: this.visaFilter?.value?.length === this.listVisa?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.visaFilter?.value?.length === this.listVisa?.length ? null : this.listVisa,
        filterRef: this.visaFilter,
        isSelectionInput: this.visaFilter?.value?.length === this.listVisa?.length ? false : true,
        displayKey: this.visaFilter?.value?.length === this.listVisa?.length ? null : 'label',
        savedValue: this.visaFilter?.value?.length === this.listVisa?.length ? null : 'value',
        noTranslate: this.visaFilter?.value?.length === this.listVisa?.length ? false : true,
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
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

  isAllDropdownSelected(type) {
    if (type === 'scholar') {
      const selected = this.scholarSeasonFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.scholarSeasonList.length;
      return isAllSelected;
    } else if (type === 'school') {
      const selected = this.schoolFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.schoolList.length;
      return isAllSelected;
    } else if (type === 'campus') {
      const selected = this.campusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.campusList.length;
      return isAllSelected;
    } else if (type === 'level') {
      const selected = this.levelFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.levelList.length;
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
    } else if (type === 'intakeChannel') {
      const selected = this.currentProgramFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listProgram.length;
      return isAllSelected;
    } else if (type === 'formationType') {
      const selected = this.formationTypeFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listSigle.length;
      return isAllSelected;
    } else if (type === 'typeOfRegis') {
      const selected = this.typeOfRegistrationFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listRegistration.length;
      return isAllSelected;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.studentStatusFilterList.length;
      return isAllSelected;
    } else if (type === 'visa') {
      const selected = this.visaFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listVisa.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'scholar') {
      const selected = this.scholarSeasonFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.scholarSeasonList.length;
      return isIndeterminate;
    } else if (type === 'school') {
      const selected = this.schoolFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.schoolList.length;
      return isIndeterminate;
    } else if (type === 'campus') {
      const selected = this.campusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.campusList.length;
      return isIndeterminate;
    } else if (type === 'level') {
      const selected = this.levelFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.levelList.length;
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
    } else if (type === 'intakeChannel') {
      const selected = this.currentProgramFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listProgram.length;
      return isIndeterminate;
    } else if (type === 'formationType') {
      const selected = this.formationTypeFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listSigle.length;
      return isIndeterminate;
    } else if (type === 'typeOfRegis') {
      const selected = this.typeOfRegistrationFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listRegistration.length;
      return isIndeterminate;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.studentStatusFilterList.length;
      return isIndeterminate;
    } else if (type === 'visa') {
      const selected = this.visaFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listVisa.length;
      return isIndeterminate;
    }
  }

  selectAllDataTable(event, type) {
    if (type === 'downPayment') {
      if (event.checked) {
        const downPaymentList = this.DPFilterList.map((el) => el?.value);
        this.downPaymentFilter.patchValue(downPaymentList, { emitEvent: false });
      } else {
        this.downPaymentFilter.patchValue(null, { emitEvent: false });
      }
    }
  }

  setDownPaymentFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isPayment = this.downPaymentFilter.value.some(
      (res) => res === 'not_authorized' || res === 'pending' || res === 'chargeback' || res === 'no_down_payment',
    );
    const isDeposit = this.downPaymentFilter.value.filter(
      (res) => res !== 'not_authorized' && res !== 'pending' && res !== 'chargeback' && res !== 'no_down_payment',
    );

    if (isPayment) {
      const filtered = this.downPaymentFilter.value.filter(
        (res) => res === 'not_authorized' || res === 'pending' || res === 'chargeback' || res === 'no_down_payment',
      );
      this.filteredValues.payments = filtered;
    } else {
      this.filteredValues.payments = null;
    }

    if (isDeposit?.length) {
      const filtered = this.downPaymentFilter.value.filter(
        (res) => res !== 'not_authorized' && res !== 'pending' && res !== 'chargeback' && res !== 'no_down_payment',
      );
      this.filteredValues.is_deposit_paids = filtered;
    } else {
      this.filteredValues.is_deposit_paids = null;
    }

    if (!this.isReset) {
      this.refetchDataKeepFilter();
    }
  }

  renderTooltipStatusDP(element) {
    // if (element.payment === 'not_authorized') {
    //   return this.translate.instant('Rejecteds');
    // } else if (element.payment === 'chargeback') {
    //   return this.translate.instant('Chargeback');
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
        downPaymentStatus = 'billed';
      } else if (element?.billing_id?.deposit_status === 'not_billed' && element?.payment === 'no_down_payment') {
        // *************** no downpayment icon
        downPaymentStatus = '';
      } else if (element?.billing_id?.deposit_status === 'not_billed') {
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

  selectAllData(event, type) {
    if (type === 'scholar') {
      if (event.checked) {
        this.scholarSeasonFilter.patchValue('All', { emitEvent: false });
      } else {
        this.scholarSeasonFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'school') {
      if (event.checked) {
        const schoolData = this.schoolList.map((el) => el._id);
        this.schoolFilter.patchValue(schoolData, { emitEvent: false });
      } else {
        this.schoolFilter.patchValue(null, { emitEvent: false });
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
        const levelData = this.levelList.map((el) => el._id);
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
    } else if (type === 'intakeChannel') {
      if (event.checked) {
        const intakeData = this.listProgram.map((el) => el.program);
        this.currentProgramFilter.patchValue(intakeData);
      } else {
        this.currentProgramFilter.patchValue(null);
      }
    } else if (type === 'formationType') {
      if (event.checked) {
        const typeData = this.listSigle.map((el) => el);
        this.formationTypeFilter.patchValue(typeData);
      } else {
        this.formationTypeFilter.patchValue(null);
      }
    } else if (type === 'typeOfRegis') {
      if (event.checked) {
        const typeData = this.listRegistration.map((el) => el?.value);
        this.typeOfRegistrationFilter.patchValue(typeData);
      } else {
        this.typeOfRegistrationFilter.patchValue(null);
      }
    } else if (type === 'status') {
      if (event.checked) {
        const typeData = this.studentStatusFilterList.map((el) => el.value);
        this.statusFilter.patchValue(typeData);
      } else {
        this.statusFilter.patchValue(null);
      }
    } else if (type === 'visa') {
      if (event.checked) {
        const data = this.listVisa.map((el) => el.value);
        this.visaFilter.patchValue(data);
      } else {
        this.visaFilter.patchValue(null);
      }
    }
  }

  selectionChangesColumn() {
    // *************** For stream value selection changes, and to get latest added and removed
    this.templateColumnRef.optionSelectionChanges
      .pipe(
        scan((acc: string[], change: MatOptionSelectionChange) => {
          if (change.isUserInput && change.source.value) {
            this.latestSelectedColumn = change.source.value;
          }
          // *************** Condition for checking if source selected and it was coming from user input not patchvalue or directly update from formcontrol
          if (change.source.selected && change.isUserInput) {
            return [...acc, change.source.value];
          } else {
            // *************** Condition for checking if coming from user input and doesnt have any selected data before
            if (change.isUserInput) {
              return acc.filter((entry) => entry !== change.source.value);
            } else {
              // *************** Condition for checking if directly update from formcontrol
              this.tempDraggableColumn = [];
              this.tempDraggableColumnFilter = [];
              return this.columnCtrl.value;
            }
          }
        }, []),
      )
      .subscribe((selectedValues: any) => {
        // *************** Call function for reorder column based on selected
        this.tempColumnListTable = selectedValues;
      });
  }
  checkTemplateTable() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.authService
      .GetUserTableColumnSettings(this.currentUser?._id)
      .pipe(take(1))
      .subscribe(
        (resp) => {
          if (resp && resp?.length) {
            localStorage.setItem('templateTable', JSON.stringify(resp));
          }
          const dataFromLocalStorage = JSON.parse(localStorage.getItem('templateTable'));
          // *************** Condition for checking if from localstorage have any value, it will get from here
          if (dataFromLocalStorage?.length) {
            // *************** Check if it is have table_name for certain table
            const allStudentTableTemplate = dataFromLocalStorage.find((lcl) => lcl.table_name === 'all_students');
            // *************** If condition meet it will reorder based on value that stored in local storage
            if (allStudentTableTemplate) {
              const arrayType = this.utilService.checkArrayType(allStudentTableTemplate?.display_column);
              const isArrayObj = arrayType === 'object' ? true : false;
              this.displayedColumns = allStudentTableTemplate?.display_column?.map((col) => (isArrayObj ? col?.column_name : col));
              this.filterColumns = allStudentTableTemplate.filter_column;
              const filterValue = [];

              const displayColumns = allStudentTableTemplate?.display_column?.map((col) => (isArrayObj ? col?.column_name : col));
              displayColumns.forEach((resp) => {
                const findIndex = this.defaultDisplayedColumns.findIndex((def) => def.colName === resp);
                filterValue.push(this.defaultDisplayedColumns[findIndex]);
              });
              this.resetFilterWhenUpdateColumn();
              this.columnCtrl.patchValue(filterValue);
              // Get Data student
              this.getAllStudentsData('init');
            } else {
              // *************** If condition doesnt meet it will reorder based on default column that we have
              this.columnCtrl.patchValue(this.defaultDisplayedColumns);
              this.updateColumn(this.defaultDisplayedColumns);
            }
          } else {
            // *************** If condition doesnt meet it will reorder based on default column that we have
            this.columnCtrl.patchValue(this.defaultDisplayedColumns);
            this.updateColumn(this.defaultDisplayedColumns);
          }
        },
        (err) => {
          Swal.fire({
            type: 'info',
            title: 'Warning',
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }

  updateColumn(data) {
    this.isWaitingForResponse = true;
    this.displayedColumns = [];
    this.filterColumns = [];
    // *************** Condition if when user drag column in it will store in tempDraggableColumn and this condition is for if user have done drag column
    if (this.tempDraggableColumn?.length && this.tempDraggableColumnFilter?.length && data?.length) {
      const tempDataColumn = data.map((dt) => dt.colName);
      const tempDataColumnFilter = data.map((dt) => dt.filterName);

      // *************** Condition if user remove selected column after drag column to another location
      if (this.tempDraggableColumn?.length > data?.length) {
        const distinctDataColumn = this.tempDraggableColumn.filter((curr) => tempDataColumn.includes(curr));
        const distinctDataColumnFilter = this.tempDraggableColumnFilter.filter((curr) => tempDataColumnFilter.includes(curr));

        const arrayType = this.utilService.checkArrayType(distinctDataColumn);
        const isArrayObj = arrayType === 'object' ? true : false;
        this.displayedColumns = distinctDataColumn?.map((col) => (isArrayObj ? col?.column_name : col));
        this.filterColumns = distinctDataColumnFilter;

        this.checkFilterAndSorting();
        this.resetFilterWhenUpdateColumn();

        this.tempDraggableColumn = _.cloneDeep(this.displayedColumns);
        this.tempDraggableColumnFilter = _.cloneDeep(this.filterColumns);
        setTimeout(() => {
          if (this.dataSource.data.length) {
            this.isWaitingForResponse = false;
          }
        }, 500);

        const columns = _.cloneDeep(this.displayedColumns);
        const table = {
          table_name: 'all_students',
          display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
          filter_column: _.cloneDeep(this.filterColumns),
        };

        this.createOrUpdateUserTableColumnSettings(table);
        this.getAllStudentsData('1');
      } else if (this.tempDraggableColumn?.length < data?.length) {
        // *************** Condition if user add new column after drag column to another location

        const distinctDataColumn = tempDataColumn.filter((curr) => !this.tempDraggableColumn.includes(curr));
        const distinctDataColumnFilter = tempDataColumnFilter.filter((curr) => !this.tempDraggableColumnFilter.includes(curr));

        const arrayType = this.utilService.checkArrayType(distinctDataColumn);
        const isArrayObj = arrayType === 'object' ? true : false;
        this.displayedColumns = this.tempDraggableColumn.concat(distinctDataColumn?.map((col) => (isArrayObj ? col?.column_name : col)));
        this.filterColumns = this.tempDraggableColumnFilter.concat(distinctDataColumnFilter);

        this.checkFilterAndSorting();
        this.resetFilterWhenUpdateColumn();

        this.tempDraggableColumn = _.cloneDeep(this.displayedColumns);
        this.tempDraggableColumnFilter = _.cloneDeep(this.filterColumns);

        setTimeout(() => {
          if (this.dataSource.data.length) {
            this.isWaitingForResponse = false;
          }
        }, 500);

        const columns = _.cloneDeep(this.displayedColumns);
        const table = {
          table_name: 'all_students',
          display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
          filter_column: _.cloneDeep(this.filterColumns),
        };

        this.createOrUpdateUserTableColumnSettings(table);
        this.getAllStudentsData('2');
      }
    } else {
      // *************** Condition if user didnt move any column it will reorder based on order stream column result
      if (data?.length) {
        data.forEach((resp) => {
          this.displayedColumns.push(resp.colName);
          this.filterColumns.push(resp.filterName);
        });

        setTimeout(() => {
          if (this.dataSource.data.length) {
            this.isWaitingForResponse = false;
          }
        }, 500);

        const arrayType = this.utilService.checkArrayType(this.displayedColumns);
        const isArrayObj = arrayType === 'object' ? true : false;
        const columns = _.cloneDeep(this.displayedColumns);
        const table = {
          table_name: 'all_students',
          display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
          filter_column: _.cloneDeep(this.filterColumns),
        };

        this.checkFilterAndSorting();
        this.resetFilterWhenUpdateColumn();

        this.createOrUpdateUserTableColumnSettings(table);
        this.getAllStudentsData('3');
      } else {
        // *************** Condition if user didnt do any changes (add or remove), it will get latest update from local storage (because every updated it will saved into localstorage)
        if (!data.length && !this.columnCtrl.value.length) {
          this.displayedColumns = [];
          this.filterColumns = [];
          this.tempDraggableColumn = [];
          this.tempDraggableColumnFilter = [];

          const arrayType = this.utilService.checkArrayType(this.displayedColumns);
          const isArrayObj = arrayType === 'object' ? true : false;
          const columns = _.cloneDeep(this.displayedColumns);
          const table = {
            table_name: 'all_students',
            display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
            filter_column: _.cloneDeep(this.filterColumns),
          };

          this.checkFilterAndSorting();
          this.resetFilterWhenUpdateColumn();

          this.createOrUpdateUserTableColumnSettings(table);
          this.getAllStudentsData('4');
        } else {
          const dataFromLocalStorage = JSON.parse(localStorage.getItem('templateTable'));
          const allStudentTableTemplate = dataFromLocalStorage?.find((lcl) => lcl.table_name === 'all_students');
          if (allStudentTableTemplate) {
            const arrayType = this.utilService.checkArrayType(allStudentTableTemplate.display_column);
            const isArrayObj = arrayType === 'object' ? true : false;
            this.displayedColumns = allStudentTableTemplate.display_column?.map((col) => (isArrayObj ? col?.column_name : col));
            this.filterColumns = allStudentTableTemplate.filter_column;
            this.tempDraggableColumn = allStudentTableTemplate.display_column?.map((col) => (isArrayObj ? col?.column_name : col));
            this.tempDraggableColumnFilter = allStudentTableTemplate.filter_column;
            this.checkFilterAndSorting();
            this.resetFilterWhenUpdateColumn();
            this.getAllStudentsData('5');
            setTimeout(() => {
              if (this.dataSource.data.length) {
                this.isWaitingForResponse = false;
              }
            }, 500);
          }
        }
      }
    }
  }

  createOrUpdateUserTableColumnSettings(data) {
    if (data) {
      this.subs.sink = this.authService.CreateOrUpdateUserTableColumnSettings(this.currentUser?._id, data).subscribe(
        (resp) => {
          if (resp) {
            this.authService?.refreshTemplateTables(this.currentUser?._id);
          }
        },
        (err) => {
          Swal.fire({
            type: 'info',
            title: 'Warning',
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
  }

  resetFilterWhenUpdateColumn() {
    this.isWaitingForResponse = true;
    this.dataSource.data = [];
    const columnSelectionVisible = this.displayedColumns.includes('select');
    if (!columnSelectionVisible) {
      this.isReset = true;
      this.isCheckedAll = false;
      this.selection.clear();
      this.dataSelected = [];
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
      this.allAddTagForCheckbox = [];
      this.allRemoveTagForCheckbox = [];
      this.allSendMailForCheckbox = [];
      this.allSendReminderForCheckbox = [];
      this.paginator.pageIndex = 0;
      this.isDisabled = true;
    }
  }

  checkFilterAndSorting() {
    if (this.latestSelectedColumn) {
      if (this.defaultDisplayedColumns?.length) {
        this.defaultDisplayedColumns.forEach((col) => {
          if (!this.displayedColumns.includes(col?.colName)) {
            switch (col.colName) {
              case 'formationType':
                this.filteredValues.sigles = null;
                this.tempDataTableFilter.formationType = null;
                this.latestSelectedColumn = null;
                this.filterBreadcrumbData.filter((resp) => resp.name !== 'sigles');
                this.formationTypeFilter.setValue(null, { emitEvent: false });

                if (this.sortValue?.type_formation) {
                  this.sortValue = null;
                  this.sort.direction = '';
                  this.sort.active = '';
                }
                break;
              case 'studentNumber':
                this.filteredValues.candidate_unique_number = null;
                this.latestSelectedColumn = null;
                this.filterBreadcrumbData.filter((resp) => resp.name !== 'candidate_unique_number');
                this.studentNumberFilter.setValue(null, { emitEvent: false });

                if (this.sortValue?.candidate_unique_number) {
                  this.sortValue = null;
                  this.sort.direction = '';
                  this.sort.active = '';
                }
                break;
              case 'name':
                this.filteredValues.candidate = null;
                this.latestSelectedColumn = null;
                this.filterBreadcrumbData.filter((resp) => resp.name !== 'candidate');
                this.nameFilter.setValue(null, { emitEvent: false });

                if (this.sortValue?.candidate) {
                  this.sortValue = null;
                  this.sort.direction = '';
                  this.sort.active = '';
                }
                break;
              case 'currentProgram':
                this.filteredValues.intake_channel_names = null;
                this.tempDataTableFilter.currentProgram = null;
                this.latestSelectedColumn = null;
                this.filterBreadcrumbData.filter((resp) => resp.name !== 'intake_channel_names');
                this.currentProgramFilter.setValue(null, { emitEvent: false });

                if (this.sortValue?.intake_channel) {
                  this.sortValue = null;
                  this.sort.direction = '';
                  this.sort.active = '';
                }
                break;
              case 'status':
                this.filteredValues.candidate_admission_statuses = null;
                this.tempDataTableFilter.status = null;
                this.latestSelectedColumn = null;
                this.filterBreadcrumbData.filter((resp) => resp.name !== 'candidate_admission_statuses');
                this.statusFilter.setValue(null, { emitEvent: false });

                if (this.sortValue?.candidate_admission_status) {
                  this.sortValue = null;
                  this.sort.direction = '';
                  this.sort.active = '';
                }
                break;
              case 'typeOfRegistration':
                this.filteredValues.type_of_registrations = null;
                this.tempDataTableFilter.typeRegistration = null;
                this.latestSelectedColumn = null;
                this.typeOfRegistrationFilter.setValue(null, { emitEvent: false });
                this.filterBreadcrumbData.filter((resp) => resp.name !== 'type_of_registrations');

                if (this.sortValue?.type_of_registration) {
                  this.sortValue = null;
                  this.sort.direction = '';
                  this.sort.active = '';
                }
                break;
              case 'downPayment':
                this.filteredValues.payments = null;
                this.filteredValues.is_deposit_paids = null;
                this.latestSelectedColumn = null;
                this.downPaymentFilter.setValue(null, { emitEvent: false });

                if (this.sortValue?.payment) {
                  this.sortValue = null;
                  this.sort.direction = '';
                  this.sort.active = '';
                }
                break;
              case 'registrationDate':
                this.filteredValues.registered_at = null;
                this.latestSelectedColumn = null;
                this.registrationDateFilter.setValue(null, { emitEvent: false });
                this.filterBreadcrumbData.filter((resp) => resp.name !== 'registered_at');

                if (this.sortValue?.registered_at) {
                  this.sortValue = null;
                  this.sort.direction = '';
                  this.sort.active = '';
                }
                break;
              case 'visaDocument':
                this.filteredValues.visa_statuses = null;
                this.tempDataTableFilter.visa_statuses = null;
                this.latestSelectedColumn = null;
                this.filterBreadcrumbData.filter((resp) => resp.name !== 'visa_statuses');
                this.visaFilter.setValue(null, { emitEvent: false });

                if (this.sortValue?.visa_status) {
                  this.sortValue = null;
                  this.sort.direction = '';
                  this.sort.active = '';
                }
                break;
              default:
                this.latestSelectedColumn = null;
                break;
            }
          }
        });
      }
    } else {
      return;
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
    moveItemInArray(this.filterColumns, event.previousIndex, event.currentIndex);

    this.tempDraggableColumn = _.cloneDeep(this.displayedColumns);
    this.tempDraggableColumnFilter = _.cloneDeep(this.filterColumns);

    const arrayType = this.utilService.checkArrayType(this.displayedColumns);
    const isArrayObj = arrayType === 'object' ? true : false;
    const columns = _.cloneDeep(this.displayedColumns);
    const table = {
      table_name: 'all_students',
      display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
      filter_column: _.cloneDeep(this.filterColumns),
    };
    this.createOrUpdateUserTableColumnSettings(table);
  }

  checkConditionalGraphql() {
    this.conditionalGraphqlField = {
      formationType: false,
      studentNumber: false,
      name: false,
      currentProgram: false,
      typeOfRegistration: false,
      downPayment: false,
      registrationDate: false,
      visaDocument: false,
    };

    const actionFound = this.displayedColumns.includes('action');
    if (actionFound) {
      this.conditionalGraphqlField = {
        formationType: true,
        studentNumber: true,
        name: true,
        currentProgram: true,
        typeOfRegistration: true,
        downPayment: true,
        registrationDate: true,
        visaDocument: true,
      };
    } else {
      this.displayedColumns.forEach((col) => {
        if (col === 'status') {
          this.conditionalGraphqlField.registrationDate = true;
        } else if (col) {
          this.conditionalGraphqlField[col] = true;
        }
      });
    }
  }

  openColumnDropdown() {
    this.templateColumnRef.open();
  }

  defaultTemplateColumn() {
    this.columnCtrl.patchValue(this.defaultDisplayedColumns);
    this.updateColumn(this.defaultDisplayedColumns);
  }

  handleClose(isOpened) {
    if (!isOpened) {
      const list = this.tempColumnListTable?.map((resp) => resp.colName);
      const isSame = list?.length === this.displayedColumns?.length ? list.every((resp) => this.displayedColumns.includes(resp)) : false;
      if (!isSame) {
        if (!this.tempColumnListTable?.length && !this.columnCtrl.value?.length) {
          this.updateColumn([]);
        } else {
          if (this.tempColumnListTable.length) {
            this.updateColumn(this.tempColumnListTable);
            this.tempColumnListTable = [];
          }
        }
      }
    }
  }
  checkVisa(element) {
    if (element?.visa_document_process_id?.form_status === 'not_completed') {
      return 'icon-header blue';
    } else if (element?.visa_document_process_id?.form_status === 'waiting_for_validation') {
      return 'icon-header orange';
    } else if (element?.visa_document_process_id?.form_status === 'rejected') {
      return 'icon-header red';
    } else if (element?.visa_document_process_id?.form_status === 'validated') {
      return 'icon-header green';
    } else if (element?.visa_document_process_id?.form_status === 'document_expired') {
      return 'icon-header purple';
    } else if (
      element?.visa_document_process_id?.form_status === 'not_sent' ||
      (element?.require_visa_permit && !element?.visa_document_process_id)
    ) {
      return 'icon-header black';
    }
  }
  checkTooltipVisa(element) {
    if (element?.visa_document_process_id?.form_status === 'not_completed') {
      return this.translate.instant('statusList.not_completed');
    } else if (element?.visa_document_process_id?.form_status === 'waiting_for_validation') {
      return this.translate.instant('statusList.waiting_for_validation');
    } else if (element?.visa_document_process_id?.form_status === 'rejected') {
      return this.translate.instant('statusList.rejected');
    } else if (element?.visa_document_process_id?.form_status === 'validated') {
      return this.translate.instant('statusList.validated');
    } else if (element?.visa_document_process_id?.form_status === 'document_expired') {
      return this.translate.instant('statusList.visa_expired');
    } else if (
      element?.visa_document_process_id?.form_status === 'not_sent' ||
      (element?.require_visa_permit && !element?.visa_document_process_id)
    ) {
      return this.translate.instant('statusList.not_sent');
    }
  }
}
