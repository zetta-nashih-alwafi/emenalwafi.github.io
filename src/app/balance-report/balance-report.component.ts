import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, SimpleChanges } from '@angular/core';
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
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TransactionReportService } from 'app/transaction-report/transaction-report.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { FinancesService } from 'app/service/finance/finance.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { MatDialog } from '@angular/material/dialog';
import { ExportPayoutDialogComponent } from './export-payout-dialog/export-payout-dialog.component';

@Component({
  selector: 'ms-balance-report',
  templateUrl: './balance-report.component.html',
  styleUrls: ['./balance-report.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseLocalToUtcPipe],
})
export class BalanceReportComponent implements OnInit, OnDestroy, AfterViewInit {
  intakeChannelCount;
  // dataSource = new MatTableDataSource([]);
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  titleData: any;
  noData: any;
  dateRange: string;
  displayedColumns: string[] = [
    'select',
    'legal_entity',
    'number',
    'candidate',
    'currency',
    'amount',
    'transaction_status',
    'date',
    'action',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'legalEntityFilter',
    'numberFilter',
    'studentFilter',
    'currencyFilter',
    'amountFilter',
    'statusFilter',
    'dateFilter',
    'actionFilter',
  ];

  dateFilter = new UntypedFormControl('');
  legalEntityFilter = new UntypedFormControl(null);
  studentFilter = new UntypedFormControl(null);
  statusFilter = new UntypedFormControl(null);
  studentNumberFilter = new UntypedFormControl('');
  fromDateFilter = new UntypedFormControl(null);
  toDateFilter = new UntypedFormControl(null);
  
  filteredValues = {
    candidate_last_name: '',
    legal_entities: null,
    transaction_status: null,
    date: '',
    from_date: null,
    to_date: null,
    student_number: null,
  };
  dataLoaded: Boolean = false;

  filteredValuesAll = {
    candidate_last_name: 'All',
    legal_entities: 'All',
    transaction_status: 'All',
    date: 'All',
    from_date: 'All',
    to_date: 'All',
    student_number: 'All',
  };

  statusFilterDropdown = [
    { value: 'PendingCredit', viewValue: 'PendingCredit' },
    { value: 'CreditFailed', viewValue: 'CreditFailed' },
    { value: 'Credited', viewValue: 'Credited' },
    { value: 'PendingDebit', viewValue: 'PendingDebit' },
    { value: 'CreditClosed', viewValue: 'CreditClosed' },
    { value: 'CreditSuspended', viewValue: 'CreditSuspended' },
    { value: 'DebitFailed', viewValue: 'DebitFailed' },
    { value: 'Debited', viewValue: 'Debited' },
    { value: 'DebitReversedReceived', viewValue: 'DebitReversedReceived' },
    { value: 'DebitedReversed', viewValue: 'DebitedReversed' },
    { value: 'ChargebackReceived', viewValue: 'ChargebackReceived' },
    { value: 'Chargeback', viewValue: 'Chargeback' },
    { value: 'ChargebackReversedReceived', viewValue: 'ChargebackReversedReceived' },
    { value: 'ChargebackReversed', viewValue: 'ChargebackReversed' },
    { value: 'Converted', viewValue: 'Converted' },
    { value: 'ManualCorrected', viewValue: 'ManualCorrected' },
    { value: 'Payout', viewValue: 'Payout' },
    { value: 'PayoutReversed', viewValue: 'PayoutReversed' },
    { value: 'PendingFundTransfer', viewValue: 'PendingFundTransfer' },
    { value: 'FundTransfer', viewValue: 'FundTransfer' },
  ];

  paymentFilterDropdown = [
    { value: 'Mastercard', viewValue: 'Mastercard' },
    { value: 'Visa', viewValue: 'Visa' },
    { value: 'SEPA', viewValue: 'SEPA' },
    { value: 'American Express', viewValue: 'American Express' },
    { value: 'Carte Bancaire', viewValue: 'Carte Bancaire' },
  ];

  sortedData: any[];
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

  isProd = false;
  dataUnselectUser = [];
  allExportForCheckbox = [];
  currentUserTypeId;

  filterBreadcrumbData: any[] = [];

  constructor(
    private transactionService: TransactionReportService,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    private parseLocalToUtcPipe: ParseLocalToUtcPipe,
    private translate: TranslateService,
    private route: Router,
    private financeService: FinancesService,
    private authService: AuthService,
    public permission: PermissionService,
    private httpClient: HttpClient,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.getBalanceReportData();
    this.initFilter();
    this.isProd = false;
    this.getLegalEntityForDropdown();
    this.setStatusFilterDropdown();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setStatusFilterDropdown()
      // this.test(10000);
      this.getBalanceReportData();
    });
    this.pageTitleService.setTitle('Online Payment Balance Report');
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
          if (!this.isReset) {
            this.getBalanceReportData();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  initFilter() {
    // date filter above table
    this.subs.sink = this.fromDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.from_date = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getBalanceReportData();
        }
      }
    });
    this.subs.sink = this.toDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.to_date = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getBalanceReportData();
        }
      }
    });
    this.subs.sink = this.studentNumberFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        this.filteredValues.student_number = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getBalanceReportData();
        }
      } else {
        this.filteredValues.student_number = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getBalanceReportData();
        }
      }
    });
    this.subs.sink = this.dateFilter.valueChanges.subscribe((date) => {
      this.dateRange = null;
      this.filteredValues.from_date = null;
      this.filteredValues.to_date = null;

      // With offset need default time 15:59
      this.filteredValues.date = date ? this.parseLocalToUtcPipe.transformDate(moment(date).format('DD/MM/YYYY'), '15:59') : null;
      // const parse = this.parseLocalToUtcPipe.transformJavascriptDate(date);
      // const isoString = moment(date).toISOString();
      // console.log(date, parse, isoString);
      // this.filteredValues.date = parse ? parse.date : '';
      this.paginator.pageIndex = 0;
      this.getBalanceReportData();
    });

    this.subs.sink = this.legalEntityFilter.valueChanges.pipe(debounceTime(400)).subscribe((legal) => {
      this.filteredValues.legal_entities = legal;
      this.paginator.pageIndex = 0;
      this.getBalanceReportData();
    });

    this.subs.sink = this.studentFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      this.filteredValues.candidate_last_name = name;
      this.paginator.pageIndex = 0;
      this.getBalanceReportData();
    });

    this.subs.sink = this.statusFilter.valueChanges.subscribe((status) => {
      console.log('FORM CONTROL: ', this.statusFilter.value)
      this.filteredValues.transaction_status = status === 'All' ? '' : status;
      this.paginator.pageIndex = 0;
      this.getBalanceReportData();
    });
  }

  getBalanceReportData() {
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    // const filter = this.cleanFilterData();

    const filter = _.cloneDeep(this.filteredValues);
    if (this.filteredValues.date || this.filteredValues.from_date || this.filteredValues.to_date) {
      filter['offset'] = moment().utcOffset();
    }

    this.subs.sink = this.transactionService.getAllBalanceReports(filter, this.sortValue, pagination).subscribe(
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
        this.getBalanceReportData();
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

  setStatusFilterDropdown() {
    this.statusFilterDropdown = this.statusFilterDropdown.map((data) => {
      return {
        ...data,
        label: this.translate.instant('BALANCE_STATUS.' + data.viewValue)
      }
    })
    console.log('STATUS FILOTER DROPDOQWN: ', this.statusFilterDropdown)
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
      this.dataUnselectUser = [];
      this.dataSelected = [];
    } else {
      this.selection.clear();
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      this.dataUnselectUser = [];
      this.dataSelected = [];
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
      // this.getDataAllForCheckbox(0);
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
    this.dataUnselectUser = [];
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.allExportForCheckbox = [];
    this.pageSelected = [];
    this.allStudentForCheckbox = [];
    this.selection.clear();
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });

    this.filteredValues = {
      candidate_last_name: null,
      legal_entities: null,
      transaction_status: null,
      date: null,
      from_date: null,
      to_date: null,
      student_number: null,
    };

    this.dateFilter.patchValue(null, { emitEvent: false });
    this.legalEntityFilter.patchValue('', { emitEvent: false });
    this.studentFilter.patchValue(null, { emitEvent: false });
    this.statusFilter.patchValue(null, { emitEvent: false });
    this.studentNumberFilter.patchValue(null, { emitEvent: false });
    this.fromDateFilter.patchValue(null, { emitEvent: false });
    this.toDateFilter.patchValue(null, { emitEvent: false });

    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.selectType = '';
    this.filterBreadcrumbData = [];
    this.getBalanceReportData();
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if ((filterData[key] || filterData[key] === false) && (key !== 'form_date' && key !== 'to_date')) {
        filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
      }
      if ((filterData[key] || filterData[key] === false) && (key === 'form_date' || key === 'to_date')) {
        filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
      }
    });
    return 'filter: {' + filterQuery + '}';
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

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isWaitingForResponse = true;
    const filter = _.cloneDeep(this.filteredValues);
    if (this.filteredValues.date || this.filteredValues.from_date || this.filteredValues.to_date) {
      filter['offset'] = moment().utcOffset();
    }
    this.subs.sink = this.transactionService.getAllBalanceReportsCheckbox(filter, this.sortValue, pagination).subscribe(
      (resp: any) => {
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
      (error) => {
        // Record error log
        this.authService.postErrorLog(error);
        this.isReset = false;
        this.isWaitingForResponse = false;
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

  exportPayout() {
    this.isCheckedAll = false;
    this.dataUnselectUser = [];
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.allExportForCheckbox = [];
    this.pageSelected = [];
    this.allStudentForCheckbox = [];
    this.selection.clear();
    this.dialog.open(ExportPayoutDialogComponent, {
      disableClose: true,
      width: '750px',
      minHeight: '100px',
      panelClass: 'certification-rule-pop-up',
      autoFocus: false,
      restoreFocus: false,
    })
  }

  getDataExportForCheckbox(pageNumber) {
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
        const filter = _.cloneDeep(this.filteredValues);
        if (this.filteredValues.date || this.filteredValues.from_date || this.filteredValues.to_date) {
          filter['offset'] = moment().utcOffset();
        }
        this.isLoading = true;
        this.subs.sink = this.transactionService.getAllBalanceReportsCheckbox(filter, this.sortValue, pagination).subscribe(
          (resp: any) => {
            if (resp && resp.length) {
              this.allExportForCheckbox.push(...resp);
              const page = pageNumber + 1;
              this.getDataExportForCheckbox(page);
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
          (error) => {
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
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Balance') }),
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
          this.openDownloadCsv(fileType);
        }
      });
    }
  }

  openDownloadCsv(fileType) {
    const candidate_last_name = this.filteredValues.candidate_last_name !== null ? this.filteredValues.candidate_last_name : '';
    const legal_entity = this.filteredValues.legal_entities?.length ? this.filteredValues.legal_entities.map((res) => `"` + res + `"`) : '';
    const date = this.filteredValues.date !== null ? this.filteredValues.date : '';
    const from_date = this.filteredValues.from_date !== null ? this.filteredValues.from_date : null;
    const to_date = this.filteredValues.to_date !== null ? this.filteredValues.to_date : null;
    const student_number = this.filteredValues.student_number !== null ? this.filteredValues.student_number : '';
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const importStudentTemlate = `downloadBalanceReportCSV/`;
    let transaction_status = '';
    const filterOffset = date || from_date || to_date ? `","offset":"` + moment().utcOffset() : '';
    if (this.filteredValues.transaction_status && this.filteredValues.transaction_status.length) {
      transaction_status = this.filteredValues.transaction_status.map((res) => `"` + res + `"`);
    }

    let filter;
    if (
      (this.dataSelected && this.dataSelected.length && !this.isCheckedAll) ||
      (this.dataUnselectUser && this.dataUnselectUser.length && this.isCheckedAll && this.dataSelected.length)
    ) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      filter =
        `"filter":{"balance_report_ids":` +
        `[` +
        mappedUserId.toString() +
        `],"date":"` +
        date +
        `","from_date":` +
        (from_date ? `"${from_date}"` : null) +
        `,"to_date":` +
        (to_date ? `"${to_date}"` : null) +
        `,"student_number":"` +
        student_number +
        `","legal_entities":[` +
        legal_entity +
        `],"transaction_status":[` +
        transaction_status +
        `],"candidate_last_name":"` +
        candidate_last_name +
        filterOffset +
        `"}`;
    } else {
      filter =
        `"filter":{"date":"` +
        date +
        `","from_date":` +
        (from_date ? `"${from_date}"` : null) +
        `,"to_date":` +
        (to_date ? `"${to_date}"` : null) +
        `,"student_number":"` +
        student_number +
        `","legal_entities":[` +
        legal_entity +
        `],"transaction_status":[` +
        transaction_status +
        `],"candidate_last_name":"` +
        candidate_last_name +
        filterOffset +
        `"}`;
    }
    console.log('_test', filter)
    const sorting = this.sortingForExport();
    const fullURL = url + importStudentTemlate + fileType + '/' + lang;
    console.log('fullUrl', fullURL);
    // element.href = encodeURI(url + importStudentTemlate + fileType + '/' + lang + '?' + filter);
    // console.log(element.href);
    // element.target = '_blank';
    // element.download = 'Balance Report CSV';
    // document.body.appendChild(element);
    // element.click();
    // document.body.removeChild(element);
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
        'Content-Type': 'application/json',
      }),
    };
    const payload = '{' + filter + ',' + sorting + ',"user_type_id":' + `"${this.currentUserTypeId}"` + '}';

    this.isLoading = true;
    this.subs.sink = this.httpClient.post(`${encodeURI(fullURL)}`, payload, httpOptions).subscribe(
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
        console.log('uat 389 error', err);
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
    this.allExportForCheckbox = [];
  }

  viewDetail(id) {
    const query = { id: id };
    const url = this.route.createUrlTree(['/balance-report/payout-detail'], { queryParams: query });
    window.open(url.toString(), '_blank');
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
        this.listOfLegalEntity = [];
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

  isAllDropdownSelected(type) {
    if (type === 'status') {
      const selected = this.statusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.statusFilterDropdown.length;
      return isAllSelected;
    } else if (type === 'legal_entity') {
      const selected = this.legalEntityFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listOfLegalEntity.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'status') {
      const selected = this.statusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.statusFilterDropdown.length;
      return isIndeterminate;
    } else if (type === 'legal_entity') {
      const selected = this.legalEntityFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listOfLegalEntity.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'status') {
      if (event.checked) {
        const statusData = this.statusFilterDropdown.map((el) => el.value);
        this.statusFilter.patchValue(statusData);
      } else {
        this.statusFilter.patchValue(null);
      }
    } else if (type === 'legal_entity') {
      if (event.checked) {
        const statusData = this.listOfLegalEntity.map((el) => el.legal_entity_name);
        this.legalEntityFilter.patchValue(statusData);
      } else {
        this.legalEntityFilter.patchValue(null);
      }
    }
  }
  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter', 
        name: 'legal_entities', 
        column: 'Legal Entity', 
        isMultiple: this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? false : true,
        filterValue: this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? null : this.listOfLegalEntity,
        filterRef: this.legalEntityFilter, 
        isSelectionInput: this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? false : true,
        displayKey: this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? null : 'legal_entity_name',
        savedValue: this.legalEntityFilter?.value?.length === this.listOfLegalEntity?.length ? null : 'legal_entity_name',
      },
      {
        type: 'table_filter',
        name: 'student_number',
        column: 'student number',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.studentNumberFilter,
        isSelectionInput: false,
        displayKey: null,
        savedValue: null,
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
        name: 'transaction_status',
        column: 'Status',
        isMultiple: this.statusFilter?.value?.length === this.statusFilterDropdown?.length ? false : true,
        filterValue: this.statusFilter?.value?.length === this.statusFilterDropdown?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.statusFilter?.value?.length === this.statusFilterDropdown?.length ? null : this.statusFilterDropdown,
        filterRef: this.statusFilter,
        isSelectionInput: this.statusFilter?.value?.length === this.statusFilterDropdown?.length ? false : true,
        displayKey: this.statusFilter?.value?.length === this.statusFilterDropdown?.length ? null : 'viewValue',
        savedValue: this.statusFilter?.value?.length === this.statusFilterDropdown?.length ? null : 'value',
        translationPrefix: 'BALANCE_STATUS.',
      },
      {
        type: 'table_filter',
        name: 'date',
        column: 'Date Initiated',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.dateFilter,
        isSelectionInput: false,
        displayKey: null,
        savedValue: null,
      },
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'from_date', // name of the key in the object storing the filter
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
        name: 'to_date', // name of the key in the object storing the filter
        column: 'To', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.toDateFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.filteredValues, this.filteredValues);
    if (filterItem?.name === 'legal_entity') {
      this.legalEntityFilter.patchValue('');
    }
    this.clearSelectIfFilter();
    this.getBalanceReportData();
  }
}
