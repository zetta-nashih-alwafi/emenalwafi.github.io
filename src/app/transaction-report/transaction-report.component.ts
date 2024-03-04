import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { SelectionModel } from '@angular/cdk/collections';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import * as moment from 'moment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TransactionReportService } from './transaction-report.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { FinancesService } from 'app/service/finance/finance.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { UtilityService } from 'app/service/utility/utility.service';
@Component({
  selector: 'ms-transaction-report',
  templateUrl: './transaction-report.component.html',
  styleUrls: ['./transaction-report.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseLocalToUtcPipe],
})
export class TransactionReportComponent implements OnInit, OnDestroy, AfterViewInit {
  intakeChannelCount;
  // dataSource = new MatTableDataSource([]);
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  titleData: any;
  noData: any;
  dateRange: string;
  displayedColumns: string[] = [
    'select',
    'date_transaction.date',
    'date_transaction.time',
    'legal_entity.name',
    'number',
    'student.last_name',
    'status',
    'response',
    'amount',
    'payment',
    'source',
    'operationName',
    'psp',
    'action',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'dateFilter',
    'timeFilter',
    'legalEntityFilter',
    'numberFilter',
    'studentFilter',
    'statusFilter',
    'responseFilter',
    'amountFilter',
    'paymentFilter',
    'sourceFilter',
    'operationNameFilter',
    'pspFilter',
    'actionFilter',
  ];

  dateFilter = new UntypedFormControl('');
  timeFilter = new UntypedFormControl('');
  legalEntityFilter = new UntypedFormControl(null);
  studentFilter = new UntypedFormControl(null);
  statusFilter = new UntypedFormControl(null);
  paymentFilter = new UntypedFormControl(null);
  sourceFilter = new UntypedFormControl(null);

  filteredValues = {
    date: null,
    time: null,
    legal_entity: null,
    legal_entities: null,
    candidate_last_name: null,
    latest_status: null,
    latest_statuses: null,
    card_type: null,
    card_types: null,
    transaction_date: null,
    candidate_unique_number: null,
    source: null
  };

  filteredValuesAll = {
    date: 'All',
    time: 'All',
    legal_entity: 'All',
    legal_entities: 'All',
    candidate_last_name: 'All',
    latest_status: 'All',
    latest_statuses: 'All',
    card_type: 'All',
    card_types: 'All',
    transaction_date: 'All',
    candidate_unique_number: 'All',
    source: 'All'
  }

  filteredValueForBreadcrumb = {
    date: null,
    time: null,
  };
  dataLoaded: Boolean = false;

  statusFilterDropdown = [
    { value: 'authorised', viewValue: 'Authorised' },
    { value: 'settled', viewValue: 'Settled' },
    { value: 'refused', viewValue: 'Refused' },
    { value: 'chargeback', viewValue: 'Chargeback' },
  ];

  paymentFilterDropdown = [];
  sourceList = [];

  sortedData: any[];

  isProd = false;

  listOfLegalEntity: any;

  intackChannelCount;
  isWaitingForResponse = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isLoading: Boolean = false;
  sortValue = null;
  dataCount = 0;
  isReset: Boolean = false;
  private subs = new SubSink();

  isCheckedAll = false;
  disabledExport = true;
  selectType: any;
  dataSelected: any[] = [];
  dataSelectedId: any[];
  allStudentForCheckbox = [];
  pageSelected = [];
  private timeOutVal: any;
  dataUnselectUser = [];
  allStudentForExport = [];
  studentNumberFilter = new UntypedFormControl('');
  filterBreadcrumbData: any[] = [];

  isSourceFilterChange = false;
  currentUser: any;
  isPermission: string[];
  currentUserTypeId: any;

  tempDataFilter = {
    legalEntity: null,
    type: null,
    source: null,
    status: null,
  };

  constructor(
    private translate: TranslateService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionReportService,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    private parseLocalToUtcPipe: ParseLocalToUtcPipe,
    private financeService: FinancesService,
    public permission: PermissionService,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private authService: AuthService,
    private httpClient: HttpClient,
    private utilService: UtilityService,
    private pageTitleService: PageTitleService
  ) {
    this.sortedData = this.dataSource.data.slice();
  }

  ngOnInit() {
    const candidateName = this.activatedRoute.snapshot.queryParamMap.get('candidate');
    const studentNumberParam = this.activatedRoute.snapshot.queryParamMap.get('studentNumber');
    if (candidateName) {
      this.filteredValues.candidate_last_name = candidateName;
      this.studentFilter.patchValue(candidateName, { emitEvent: false });
    } else if (studentNumberParam) {
      this.filteredValues.candidate_unique_number = studentNumberParam
      this.studentNumberFilter.patchValue(studentNumberParam, {emitEvent: false})
    }
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.getTransactionData();
    this.setLegalEntityFilter();
    this.setStatusFilter();
    this.setPaymemtFilter();
    this.setSourceFilter();
    this.initFilter();
    this.isProd = false;
    this.getLegalEntityForDropdown();
    this.getDropdownFilterOption()
    this.sortingFilterOption();
    this.subs.sink = this.translate.onLangChange.subscribe(() => {
      this.getDropdownFilterOption()
      this.sortingFilterOption();
      this.getTransactionData();
    });
    this.pageTitleService.setTitle('Online Payment Transaction Report');
  }

  getDropdownFilterOption() {
    this.paymentFilterDropdown = [
      { value: 'Mastercard', viewValue: this.translate.instant('Mastercard') },
      { value: 'Visa', viewValue: this.translate.instant('Visa') },
      { value: 'SEPA', viewValue: this.translate.instant('SEPA') },
      { value: 'American Express', viewValue: this.translate.instant('American Express') },
      { value: 'Carte Bancaire', viewValue: this.translate.instant('Carte Bancaire') },
      { value: 'VPay', viewValue: this.translate.instant('VPay') },
    ];

    this.sourceList = [
      { value: 'auto_debit', key: this.translate.instant('Auto Debit') },
      { value: 'asking_payment', key: this.translate.instant('Asking payment') },
      { value: 'admission_form', key: this.translate.instant('Admission Form') },
      { value: 'readmission_form', key: this.translate.instant('Readmission form') },
    ];
  }

  sortingFilterOption() {
    this.statusFilterDropdown = _.cloneDeep(
      this.statusFilterDropdown.sort((a, b) =>
        this.utilService?.simpleDiacriticSensitiveRegex(this.translate.instant(a?.value)) >
        this.utilService?.simpleDiacriticSensitiveRegex(this.translate.instant(b?.value))
          ? 1
          : -1,
      ),
    );
    this.paymentFilterDropdown = _.cloneDeep(
      this.paymentFilterDropdown.sort((a, b) => (this.translate.instant(a.viewValue) > this.translate.instant(b.viewValue) ? 1 : -1)),
    );
    this.sourceList = _.cloneDeep(this.sourceList.sort((a, b) => (this.translate.instant(a.key) > this.translate.instant(b.key) ? 1 : -1)));
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getTransactionData();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  initFilter() {
    this.subs.sink = this.studentNumberFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        this.filteredValues.candidate_unique_number = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getTransactionData();
        }
      } else {
        this.filteredValues.candidate_unique_number = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getTransactionData();
        }
      }
    });
    this.subs.sink = this.dateFilter.valueChanges.subscribe((date) => {
      this.dateRange = null;
      this.filteredValues.transaction_date = null;

      // With offset need default time 15:59
      this.filteredValues.date = date ? this.parseLocalToUtcPipe.transformDate(moment(date).format('DD/MM/YYYY'), '15:59') : null;
      // const parse = this.parseLocalToUtcPipe.transformJavascriptDate(date);
      // const isoString = moment(date).toISOString();
      // console.log(date, parse, isoString);
      // this.filteredValues.date = parse ? parse.date : '';

      this.paginator.pageIndex = 0;
      this.getTransactionData();
    });

    this.subs.sink = this.timeFilter.valueChanges.subscribe((time) => {
      const parse = this.parseLocalToUtcPipe.transform(time);
      this.filteredValues.time = parse;
      this.filteredValueForBreadcrumb.time = time;
      this.paginator.pageIndex = 0;
      this.getTransactionData();
    });

    // this.subs.sink = this.legalEntityFilter.valueChanges.pipe(debounceTime(400)).subscribe((legal) => {
    //   this.filteredValues.legal_entity = legal;
    //   this.paginator.pageIndex = 0;
    //   this.getTransactionData();
    // });

    this.subs.sink = this.studentFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      this.filteredValues.candidate_last_name = name;
      this.paginator.pageIndex = 0;
      this.getTransactionData();
    });
    // this.subs.sink = this.statusFilter.valueChanges.subscribe((status) => {
    //   this.filteredValues.latest_status = status === 'All' ? '' : status;
    //   this.paginator.pageIndex = 0;
    //   this.getTransactionData();
    // });

    // this.subs.sink = this.paymentFilter.valueChanges.subscribe((payment) => {
    //   this.filteredValues.card_type = payment === 'All' ? '' : payment;
    //   this.paginator.pageIndex = 0;
    //   this.getTransactionData();
    // });
    this.subs.sink = this.sourceFilter.valueChanges.subscribe((filter) => {
      this.isSourceFilterChange = true;
    });
  }

  setLegalEntityFilter() {
    // this.subs.sink = this.legalEntityFilter.valueChanges.pipe(debounceTime(400)).subscribe((legal) => {
    //   this.filteredValues.legal_entities = legal;
    //   this.paginator.pageIndex = 0;
    //   this.getTransactionData();
    // });
    const isSame = JSON.stringify(this.tempDataFilter.legalEntity) === JSON.stringify(this.legalEntityFilter.value);
    if (isSame) {
      return;
    } else if (this.legalEntityFilter.value?.length) {
      this.filteredValues.legal_entities = this.legalEntityFilter.value;
      this.tempDataFilter.legalEntity = this.legalEntityFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getTransactionData();
      }
    } else {
      if (this.tempDataFilter.legalEntity?.length && !this.legalEntityFilter.value?.length) {
        this.filteredValues.legal_entities = this.legalEntityFilter.value;
        this.tempDataFilter.legalEntity = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getTransactionData();
        }
      } else {
        return;
      }
    }
  }

  setStatusFilter() {
    const isSame = JSON.stringify(this.tempDataFilter.status) === JSON.stringify(this.statusFilter.value);
    if (isSame) {
      return;
    } else if (this.statusFilter.value?.length) {
      this.filteredValues.latest_statuses = this.statusFilter.value;
      this.tempDataFilter.status = this.statusFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getTransactionData();
      }
    } else {
      if (this.tempDataFilter.status?.length && !this.statusFilter.value?.length) {
        this.filteredValues.latest_statuses = this.statusFilter.value;
        this.tempDataFilter.status = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getTransactionData();
        }
      } else {
        return;
      }
    }
  }

  setPaymemtFilter() {
    const isSame = JSON.stringify(this.tempDataFilter.type) === JSON.stringify(this.paymentFilter.value);
    if (isSame) {
      return;
    } else if (this.paymentFilter.value?.length) {
      this.filteredValues.card_types = this.paymentFilter.value;
      this.tempDataFilter.type = this.paymentFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getTransactionData();
      }
    } else {
      if (this.tempDataFilter.type?.length && !this.paymentFilter.value?.length) {
        this.filteredValues.card_types = this.paymentFilter.value;
        this.tempDataFilter.type = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getTransactionData();
        }
      } else {
        return;
      }
    }
  }

  setSourceFilter() {
    const isSame = JSON.stringify(this.tempDataFilter.source) === JSON.stringify(this.sourceFilter.value);
    if (isSame) {
      return;
    } else if (this.sourceFilter.value?.length) {
      this.filteredValues.source = this.sourceFilter.value;
      this.tempDataFilter.source = this.sourceFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getTransactionData();
      }
    } else {
      if (this.tempDataFilter.source?.length && !this.sourceFilter.value?.length) {
        this.filteredValues.source = this.sourceFilter.value;
        this.tempDataFilter.source = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getTransactionData();
        }
      } else {
        return;
      }
    }
  }

  // checkSourceOption(value) {
  //   const form = this.sourceFilter.value;
  //   if (form?.length) {
  //     if (value === 'All') {
  //       this.sourceFilter.patchValue(['All']);
  //     } else {
  //       const filterForm = form.filter((source) => source !== 'All');
  //       if (filterForm?.length) {
  //         this.sourceFilter.patchValue(filterForm);
  //       } else {
  //         this.sourceFilter.patchValue(null);
  //       }
  //     }
  //   } else {
  //     this.sourceFilter.patchValue(null);
  //   }
  // }
  // selectedFilter(event) {
  //   console.log('form', event, this.isSourceFilterChange);
  //   if (!event && this.isSourceFilterChange) {
  //     this.isSourceFilterChange = false;
  //     const form = this.sourceFilter.value;
  //     this.filteredValues.sources = form?.length && !form?.includes('All') ? form : null;
  //     this.paginator.pageIndex = 0;
  //     this.getTransactionData();
  //   }
  // }

  getTransactionData() {
    // this.dataSelected = [];
    // this.dataSelectedId = [];
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    // const filter = this.cleanFilterData();

    const filter = _.cloneDeep(this.filteredValues);
    if(this.filteredValues?.date || this.filteredValues?.time || this.filteredValues?.transaction_date){
      filter['offset'] = moment().utcOffset();
    }
    this.subs.sink = this.transactionService.getAllTransactions(filter, this.sortValue, pagination).subscribe(
      (resp: any) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          const data = _.cloneDeep(resp);
          this.dataSource.data = data;
          this.paginator.length = resp[0].count_document;
          this.dataCount = resp[0].count_document;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isLoading = false;
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.dataCount = 0;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
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

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      // Action Filter
      {
        type: 'action_filter',
        name: 'transaction_date',
        column: null,
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: null,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      // Table Filters below
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'date', // name of the key in the object storing the filter
        column: 'Date', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.dateFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'table_filter',
        name: 'time',
        column: 'Time',
        isMultiple: false,
        filterValue: this.filteredValueForBreadcrumb,
        filterList: null,
        filterRef: this.timeFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'legal_entities',
        column: 'Legal Entity',
        isMultiple: this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? false : true,
        filterValue: this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? null : this.listOfLegalEntity,
        filterRef: this.legalEntityFilter,
        displayKey: this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? null : 'legal_entity_name',
        savedValue: this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? null : 'legal_entity_name',
        isSelectionInput: this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'number',
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
        name: 'candidate_last_name',
        column: 'Student',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.studentFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'latest_statuses',
        column: 'Status',
        isMultiple: this.statusFilter?.value?.length === this.statusFilterDropdown?.length ? false : true,
        filterValue: this.statusFilter?.value?.length === this.statusFilterDropdown?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.statusFilter?.value?.length === this.statusFilterDropdown?.length ? null : this.statusFilterDropdown,
        filterRef: this.statusFilter,
        displayKey: this.statusFilter?.value?.length === this.statusFilterDropdown?.length ? null : 'viewValue',
        savedValue: this.statusFilter?.value?.length === this.statusFilterDropdown?.length ? null : 'value',
        isSelectionInput: this.statusFilter?.value?.length === this.statusFilterDropdown?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'card_types',
        column: 'Payment',
        isMultiple: this.paymentFilter?.value?.length === this.paymentFilterDropdown?.length ? false : true,
        filterValue: this.paymentFilter?.value?.length === this.paymentFilterDropdown?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.paymentFilter?.value?.length === this.paymentFilterDropdown?.length ? null : this.paymentFilterDropdown,
        filterRef: this.paymentFilter,
        displayKey: this.paymentFilter?.value?.length === this.paymentFilterDropdown?.length ? null : 'viewValue',
        savedValue: this.paymentFilter?.value?.length === this.paymentFilterDropdown?.length ? null : 'value',
        isSelectionInput: this.paymentFilter?.value?.length === this.paymentFilterDropdown?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'source',
        column: 'Source',
        isMultiple: this.sourceFilter?.value?.length === this.sourceList?.length ? false : true,
        filterValue: this.sourceFilter?.value?.length === this.sourceList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.sourceFilter?.value?.length === this.sourceList?.length ? null : this.sourceList,
        filterRef: this.sourceFilter,
        displayKey: this.sourceFilter?.value?.length === this.sourceList?.length ? null : 'key',
        savedValue: this.sourceFilter?.value?.length === this.sourceList?.length ? null : 'value',
        isSelectionInput: this.sourceFilter?.value?.length === this.sourceList?.length ? false : true,
      },
    ];

    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues, this.filteredValues);
    if (filterItem?.name === 'time') {
      this.filteredValueForBreadcrumb.time = null;
    } else if (filterItem?.name === 'legal_entity') {
      this.legalEntityFilter.patchValue('')
    } else if (filterItem?.name === 'latest_status') {
      this.statusFilter.patchValue('All')
    }
    this.clearSelectIfFilter();
    this.getTransactionData();
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getTransactionData();
      }
    }
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
    let numRows = 0;
    // const numRows = this.dataSource.data.length;
    if (this.dataSource && this.dataSource.data.length) {
      numRows = this.dataSource.data.length;
    }
    return this.isCheckedAll ? true : numSelected === numRows || numSelected > numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.pageSelected = [];
      this.isCheckedAll = false;
      this.dataSelected = [];
      this.dataUnselectUser = [];
      this.dataSelectedId = [];
    } else {
      this.selection.clear();
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      this.dataSelected = [];
      this.dataUnselectUser = [];
      this.dataSelectedId = [];
      // this.getDataAllForCheckbox(0);
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
    }
  }

  showOptions(info, row?) {
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
    } else {
      this.disabledExport = true;
    }
    // this.dataSelected = [];
    this.dataSelectedId = [];
    this.selectType = info;
    const data = this.selection.selected;
    data.forEach((user) => {
      // this.dataSelected.push(...this.dataSource.data.filter((list) => list._id === user));
      this.dataSelectedId.push(user);
    });
  }

  resetTable() {
    this.isReset = true;
    this.isCheckedAll = false;
    this.selection.clear();
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.pageSelected = [];
    this.allStudentForCheckbox = [];
    this.dataUnselectUser = [];
    this.allStudentForExport = [];
    this.selection.clear();
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });

    this.filteredValues = {
      date: null,
      time: null,
      legal_entity: null,
      legal_entities: null,
      candidate_last_name: null,
      latest_status: null,
      latest_statuses: null,
      card_type: null,
      card_types: null,
      transaction_date: null,
      candidate_unique_number: null,
      source: null
    };

    this.filteredValueForBreadcrumb = {
      date: null,
      time: null,
    };

    this.dateFilter.patchValue(null, { emitEvent: false });
    this.studentNumberFilter.patchValue(null, { emitEvent: false });
    this.timeFilter.patchValue(null, { emitEvent: false });
    this.legalEntityFilter.patchValue(null, { emitEvent: false });
    this.studentFilter.patchValue(null, { emitEvent: false });
    this.statusFilter.patchValue(null, { emitEvent: false });
    this.paymentFilter.patchValue(null, { emitEvent: false });
    this.sourceFilter.patchValue(null, { emitEvent: false });

    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.selectType = '';
    this.filterBreadcrumbData = [];
    this.getTransactionData();
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if ((filterData[key] || filterData[key] === false) && key !== 'transaction_date') {
        filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
      }
      if ((filterData[key] || filterData[key] === false) && key === 'transaction_date') {
        filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  filterDateRange(dateRange) {
    this.dateRange = dateRange;
    if (dateRange === 'today') {
      this.filteredValues.transaction_date = 'today';
      this.filteredValues.date = null;
      this.dateFilter.patchValue(null, { emitEvent: false });
    } else if (dateRange === 'yesterday') {
      this.filteredValues.transaction_date = 'yesterday';
      this.filteredValues.date = null;
      this.dateFilter.patchValue(null, { emitEvent: false });
    } else if (dateRange === 'lastWeek') {
      this.filteredValues.transaction_date = 'last_7_days';
      this.filteredValues.date = null;
      this.dateFilter.patchValue(null, { emitEvent: false });
    } else if (dateRange === 'lastMonth') {
      this.filteredValues.transaction_date = 'last_30_days';
      this.filteredValues.date = null;
      this.dateFilter.patchValue(null, { emitEvent: false });
    }
    this.paginator.pageIndex = 0;
    this.getTransactionData();
  }

  parseDateToLocal(createdAt) {
    const date = createdAt.date;
    const time = createdAt.time;

    if (date && time) {
      const parsed = this.parseUtcToLocalPipe.transformDate(date, time);
      return parsed;
    } else {
      return '';
    }
  }

  parseTimeToLocal(createdAt) {
    const time = createdAt.time;

    if (time) {
      const parsed = this.parseUtcToLocalPipe.transform(time);
      return parsed;
    } else {
      return '';
    }
  }

  viewDetail(id) {
    const query = { id: id };
    const url = this.route.createUrlTree(['/transaction-report/detail'], { queryParams: query });
    window.open(url.toString(), '_blank');
  }

  translateTotal(total: any): String {
    let result = '';
    if (total) {
      if (this.translate.currentLang === 'fr') {
        result = parseFloat(total)
          .toFixed(2)
          .replace(/\d(?=(\d{3})+\.)/g, '$& ');
      } else {
        result = parseFloat(total)
          .toFixed(2)
          .replace(/\d(?=(\d{3})+\.)/g, '$&,');
      }
    }
    return result;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  getLegalEntityForDropdown() {
    this.subs.sink = this.financeService.getAllLegalEntities().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.listOfLegalEntity = _.cloneDeep(resp.sort((a, b) => (a.legal_entity_name > b.legal_entity_name ? 1 : -1)));
        } else {
          this.listOfLegalEntity = [];
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
  getDataForExport(pageNumber) {
    if (this.isCheckedAll) {
      if (this.dataUnselectUser.length < 1) {
        this.downloadCSV();
      } else {
        if (pageNumber === 0) {
          this.allStudentForExport = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const filter = _.cloneDeep(this.filteredValues);
        if(this.filteredValues?.date || this.filteredValues?.time || this.filteredValues?.transaction_date){
          filter['offset'] = moment().utcOffset();
        }
        this.subs.sink = this.transactionService.getAllTransactionsId(filter, this.sortValue, pagination).subscribe(
          (resp: any) => {
            if (resp && resp.length) {
              this.allStudentForExport.push(...resp);
              const page = pageNumber + 1;
              this.getDataForExport(page);
            } else {
              this.isLoading = false;
              if (this.isCheckedAll) {
                if (this.allStudentForExport && this.allStudentForExport.length) {
                  this.dataSelected = this.allStudentForExport.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  // this.dataSelectedId = this.selection.selected;
                  console.log('getAllIdForCheckbox', this.dataSelected);
                  this.downloadCSV();
                }
              }
            }
          },
          (err) => {
            this.isReset = false;
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
                confirmButtonText: this.translate.instant('OK'),
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
      (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser.length > 1))
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Transaction') }),
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
          Swal.getContent().addEventListener('click', function () {
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
    const card_type = this.filteredValues.card_type !== null ? this.filteredValues.card_type : '';
    const date = this.filteredValues.date !== null ? this.filteredValues.date : '';
    const time = this.filteredValues.time !== null ? this.filteredValues.time : '';
    const transaction_date = this.filteredValues.transaction_date !== null ? this.filteredValues.transaction_date : null;
    const legal_entity = this.filteredValues.legal_entity !== null ? this.filteredValues.legal_entity : '';
    const latest_status = this.filteredValues.latest_status !== null ? this.filteredValues.latest_status : '';
    const candidate_last_name = this.filteredValues.candidate_last_name !== null ? this.filteredValues.candidate_last_name : '';
    const candidate_unique_number = this.filteredValues.candidate_unique_number !== null ? this.filteredValues.candidate_unique_number : '';
    const legal_entities = this.filteredValues?.legal_entities?.length ? this.filteredValues.legal_entities.map(value => `"` + value + `"`)  : '';
    const latest_statuses = this.filteredValues?.latest_statuses?.length ? this.filteredValues.latest_statuses.map(value => `"` + value + `"`)  : '';
    const card_types = this.filteredValues?.card_types?.length ? this.filteredValues.card_types.map(value => `"` + value + `"`)  : '';
    const source = this.filteredValues?.source?.length ? this.filteredValues.source.map(value => `"` + value + `"`)  : '';
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const importStudentTemlate = `downloadTransactionCSV/`;
    const filterOffset = date || time || transaction_date ? (`","offset":"` + moment().utcOffset()) : ''
    let filter;
    if (
      (this.dataSelected && this.dataSelected.length && !this.isCheckedAll) ||
      (this.dataUnselectUser && this.dataUnselectUser.length && this.isCheckedAll && this.dataSelected.length)
    ) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      console.log(mappedUserId);
      filter =
        `"filter":{"transaction_ids":` +
        `[` +
        mappedUserId.toString() +
        `],"card_type":"` +
        card_type +
        `","date":"` +
        date +
        `","time":"` +
        time +
        `","transaction_date":"` +
        transaction_date +
        `","candidate_unique_number":"` +
        candidate_unique_number +
        `","legal_entity":"` +
        legal_entity +
        `","latest_status":"` +
        latest_status +
        `","legal_entities":` +
        `[` + legal_entities + `]`+
        `,"latest_statuses":` +
        `[` + latest_statuses + `]`+
        `,"card_types":` +
        `[` + card_types + `]`+
        `,"source":` +
        `[` + source + `]`+
        `,"candidate_last_name":"` +
        candidate_last_name +
        filterOffset +
        `"}`;
    } else {
      filter =
        `"filter":{"card_type":"` +
        card_type +
        `","date":"` +
        date +
        `","time":"` +
        time +
        `","transaction_date":"` +
        transaction_date +
        `","legal_entity":"` +
        legal_entity +
        `","candidate_unique_number":"` +
        candidate_unique_number +
        `","latest_status":"` +
        latest_status +
        `","legal_entities":` +
        `[` + legal_entities + `]`+
        `,"latest_statuses":` +
        `[` + latest_statuses + `]`+
        `,"card_types":` +
        `[` + card_types + `]`+
        `,"source":` +
        `[` + source + `]`+
        `,"candidate_last_name":"` +
        candidate_last_name +
        filterOffset +
        `"}`;
    }
    const sorting = this.sortingForExport();
    const fullURL = url + importStudentTemlate + fileType + '/' + lang;
    console.log('fullUrl', fullURL);
    // element.href = encodeURI(url + importStudentTemlate + fileType + '/' + lang + '?' + filter);
    // console.log(element.href);
    // element.target = '_blank';
    // element.download = 'Transaction Report CSV';
    // document.body.appendChild(element);
    // element.click();
    // document.body.removeChild(element);
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
        'Content-Type': 'application/json',
      }),
    };
    const payload = '{' + filter + ',' + sorting + ',' + '"user_type_id":"' + this.currentUserTypeId + '"}';

    this.isLoading = true;
    this.httpClient.post(`${encodeURI(fullURL)}`, payload, httpOptions).subscribe(
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
          }).then(() => this.clearSelectIfFilter());
        } else {
          this.isLoading = false;
        }
      },
      (err) => {
        this.isLoading = false;
        console.log('uat 389 phase 09 error', err);
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
  clearSelectIfFilter() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
    this.dataUnselectUser = [];
    this.dataSelectedId = [];
    this.allStudentForExport = [];
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    const filter = _.cloneDeep(this.filteredValues);
    if(this.filteredValues?.date || this.filteredValues?.time || this.filteredValues?.transaction_date){
      filter['offset'] = moment().utcOffset();
    }
    this.subs.sink = this.transactionService.getAllTransactions(filter, this.sortValue, pagination).subscribe(
      (resp: any) => {
        this.isWaitingForResponse = true;
        if (resp && resp.length) {
          this.allStudentForCheckbox.push(...resp);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
          this.isWaitingForResponse = false;
          if (this.isCheckedAll) {
            const pageDetecting = this.pageSelected.filter((page) => page === this.paginator.pageIndex);
            if (pageDetecting && pageDetecting.length < 1) {
              if (this.allStudentForCheckbox && this.allStudentForCheckbox.length) {
                this.allStudentForCheckbox.forEach((element) => {
                  this.selection.select(element._id);
                });
              }
            }
            this.dataSelectedId = this.selection.selected;
            this.pageSelected.push(this.paginator.pageIndex);
          } else {
            this.pageSelected = [];
          }
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isReset = false;
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
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }
  checkOperationName(value) {
    let display = '';
    const terms = [];
    if (value?.term_pays?.length) {
      if (value?.term_pays[0]?.term_index === 0 || (value?.term_pays[0]?.term_index && value?.term_pays[0]?.term_index > 0)) {
        value.term_pays.forEach((term) => {
          let date;
          if (term?.term_payment_deferment?.date) {
            const defermentDate = term.term_payment_deferment.date;
            const defermentTime = term?.term_payment_deferment?.time ? term?.term_payment_deferment?.time : '15:59';
            date = this.parseUtcToLocalPipe.transformDate(defermentDate, defermentTime);
          } else if (term?.term_payment?.date) {
            const termDate = term.term_payment.date;
            const termTime = term?.term_payment?.time ? term?.term_payment?.time : '15:59';
            date = this.parseUtcToLocalPipe.transformDate(termDate, termTime);
          }
          const termIndex = term?.term_index >= 0 ? term.term_index + 1 : '';
          const termDisplay = this.translate.instant('Term') + ' ' + termIndex + (date && date !== 'Invalid date' ? ' - ' + date : '');
          terms.push(termDisplay);
        });
      } else {
        const termPayId = value?.term_pays?.map((term) => term?.term_id);
        if (value?.billing_id?.terms?.length && termPayId?.length) {
          termPayId.forEach((termId) => {
            const findTerm = value.billing_id.terms.find((term) => termId === term._id);
            const findTermIndex = value.billing_id.terms.findIndex((term) => termId === term._id);
            if (findTerm && findTermIndex >= 0) {
              let date;
              if (findTerm?.term_payment_deferment?.date) {
                const defermentDate = findTerm.term_payment_deferment.date;
                const defermentTime = findTerm?.term_payment_deferment?.time ? findTerm?.term_payment_deferment?.time : '15:59';
                date = this.parseUtcToLocalPipe.transformDate(defermentDate, defermentTime);
              } else if (findTerm?.term_payment?.date) {
                const termDate = findTerm.term_payment.date;
                const termTime = findTerm?.term_payment?.time ? findTerm?.term_payment?.time : '15:59';
                date = this.parseUtcToLocalPipe.transformDate(termDate, termTime);
              }
              const termIndex = findTermIndex + 1;
              const termDisplay = this.translate.instant('Term') + ' ' + termIndex + (date && date !== 'Invalid date' ? ' - ' + date : '');
              terms.push(termDisplay);
            }
          });
        }
      }
      display = terms?.length ? terms.join(', ') : '';
    } else if (!value?.is_for_term && !value?.term_pays?.length) {
      display = this.translate.instant('Down Payment');
    }
    return display;
  }
  checkSourceName(value) {
    let display = '';
    if (!value?.is_for_term) {
      if (value?.candidate_id?.readmission_status === 'readmission_table') {
        display = this.translate.instant('Readmission form');
      } else if (value?.candidate_id?.readmission_status !== 'readmission_table') {
        display = this.translate.instant('Admission Form');
      }
    } else {
      if (value?.is_from_cronjob && value?.is_for_term && value?.billing_id) {
        display = this.translate.instant('Auto Debit');
      } else if (!value?.is_from_cronjob && value?.is_for_term && value?.billing_id) {
        display = this.translate.instant('Asking payment');
      } else {
        if (value?.candidate_id?.readmission_status === 'readmission_table') {
          display = this.translate.instant('Readmission form');
        } else if (value?.candidate_id?.readmission_status !== 'readmission_table') {
          display = this.translate.instant('Admission Form');
        }
      }
    }
    return display;
  }

  isAllDropdownSelected(type) {
    if (type === 'legalEntity') {
      const selected = this.legalEntityFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listOfLegalEntity.length;
      return isAllSelected;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.statusFilterDropdown.length;
      return isAllSelected;
    } else if (type === 'payment') {
      const selected = this.paymentFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.paymentFilterDropdown.length;
      return isAllSelected;
    } else if (type === 'source') {
      const selected = this.sourceFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.sourceList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'legalEntity') {
      const selected = this.legalEntityFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listOfLegalEntity.length;
      return isIndeterminate;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.statusFilterDropdown.length;
      return isIndeterminate;
    } else if (type === 'payment') {
      const selected = this.paymentFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.paymentFilterDropdown.length;
      return isIndeterminate;
    } else if (type === 'source') {
      const selected = this.sourceFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.sourceList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'legalEntity') {
      if (event.checked) {
        const legalData = this.listOfLegalEntity.map((el) => el.legal_entity_name);
        this.legalEntityFilter.patchValue(legalData);
      } else {
        this.legalEntityFilter.patchValue(null);
      }
    } else if (type === 'status') {
      if (event.checked) {
        const statusData = this.statusFilterDropdown.map((el) => el?.value);
        this.statusFilter.patchValue(statusData);
      } else {
        this.statusFilter.patchValue(null);
      }
    } else if (type === 'payment') {
      if (event.checked) {
        const paymentData = this.paymentFilterDropdown.map((el) => el?.value);
        this.paymentFilter.patchValue(paymentData);
      } else {
        this.paymentFilter.patchValue(null);
      }
    } else if (type === 'source') {
      if (event.checked) {
        const sourceData = this.sourceList.map((el) => el.value);
        this.sourceFilter.patchValue(sourceData);
      } else {
        this.sourceFilter.patchValue(null);
      }
    }
  }
}
