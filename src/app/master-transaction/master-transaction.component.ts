import { FilterBreadcrumbService } from './../filter-breadcrumb/service/filter-breadcrumb.service';
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
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { FinancesService } from 'app/service/finance/finance.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { MasterTransactiontService } from './master-transaction.service';
import { MatDialog } from '@angular/material/dialog';
import { DetailTransactionMasterDialogComponent } from './detail-transaction-master-dialog/detail-transaction-master-dialog.component';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
@Component({
  selector: 'ms-master-transaction',
  templateUrl: './master-transaction.component.html',
  styleUrls: ['./master-transaction.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseLocalToUtcPipe],
})
export class MasterTransactiontComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();
  private timeOutVal: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  noData: any;
  dateRange: string;
  displayedColumns: string[] = [
    'select',
    'date',
    'time',
    'number',
    'studentName',
    'typeOfFormation',
    'program',
    'legalEntityName',
    'payer',
    'source',
    'operationName',
    'nature',
    'flux',
    'status',
    'debit',
    'credit',
    'actor',
    'action',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'dateFilter',
    'timeFilter',
    'numberFilter',
    'studentFilter',
    'typeOfFormationFilter',
    'programFilter',
    'legalEntityFilter',
    'payerFilter',
    'sourceFilter',
    'operationNameFilter',
    'natureFilter',
    'fluxFilter',
    'statusFilter',
    'debitFilter',
    'creditFilter',
    'actorFilter',
    'actionFilter',
  ];

  dateFilter = new UntypedFormControl('');
  timeFilter = new UntypedFormControl('');
  legalEntityFilter = new UntypedFormControl(null);
  typeOfFormationFilter = new UntypedFormControl(null);
  studentFilter = new UntypedFormControl(null);
  payerFilter = new UntypedFormControl(null);
  studentNumberFilter = new UntypedFormControl('');
  actorFilter = new UntypedFormControl(null);
  programFilter = new UntypedFormControl('All');
  sourceFilter = new UntypedFormControl('All');
  operationNameFilter = new UntypedFormControl('All');
  natureFilter = new UntypedFormControl('All');
  fluxFilter = new UntypedFormControl('All');
  statusFilter = new UntypedFormControl('All');
  debitFilter = new UntypedFormControl(null);
  creditFilter = new UntypedFormControl(null);
  fromDateFilter = new UntypedFormControl(null);
  toDateFilter = new UntypedFormControl(null);

  shieldAccountIcon = '../../../../../assets/img/shield-account.png';

  filteredValues = {
    date: null,
    time: null,
    student_number: null,
    student_name: null,
    program_id: null,
    student_types: null,
    legal_entity_names: null,
    payer: null,
    transaction_type: null,
    operation_name: null,
    nature: null,
    flux: null,
    latest_status: null,
    actor: null,
    offset: null,
    table_type: 'master_transaction_table',
    from_date: null,
    to_date: null,
  };

  tempDataFilter = {
    legalEntity: null,
    typeOfFormation: null,
  }

  filteredValuesAll = {
    legal_entity_names: 'All',    
    student_types: 'All',    
  };

  dataLoaded: Boolean = false;
  sortedData: any[];
  isWaitingForResponse = false;
  isLoading: Boolean = false;
  sortValue = null;
  dataCount = 0;
  isReset: Boolean = false;

  listOfProgram = [];
  listOfLegalEntity = [];
  listOfOperationName = [];

  listOfSource = [
    {
      value: 'manual_payment',
      label: 'Manual payment',
    },
    {
      value: 'asking_payment',
      label: 'Asking payment',
    },
    {
      value: 'auto_debit',
      label: 'Auto debit',
    },
    {
      value: 'dp_of_readmission',
      label: 'DP of Readmission',
    },
    {
      value: 'dp_of_admission',
      label: 'DP of Admission',
    },
    {
      value: 'avoir',
      label: 'Avoir',
    },
    {
      value: 'avoir_transfer',
      label: 'Avoir - Transfer',
    },
    {
      value: 'refund',
      label: 'Refund',
    },
    {
      value: 'chargeback',
      label: 'Chargeback',
    },
    {
      value: 'billing_automatic',
      label: 'Billing Automatic',
    },
    {
      value: 'billing_manual',
      label: 'Biling Manual',
    },
    {
      value: 'billing_of_dp',
      label: 'Billing of DP',
    },
    {
      value: 'billing_of_term',
      label: 'Billing of Terms',
    },
    {
      value: 'billing_of_term_financement',
      label: 'Billing of Terms - financement',
    },
    {
      value: 'od_student_balance_adjustment',
      label: 'OD - Student balance adjustment',
    },
    {
      value: 'od_cash_transfer',
      label: 'OD - Cash Transfer',
    },
    {
      value: 'overpaid',
      label: 'Overpaid',
    },
    {
      value: 'regulation_of_dp',
      label: 'Regulation of DP',
    },
    {
      value: 'regulation_of_term',
      label: 'Regulation of Term',
    },
  ];

  listOfNature = [
    {
      value: 'credit_card',
      label: 'Credit card',
    },
    {
      value: 'sepa',
      label: 'SEPA',
    },
    {
      value: 'transfer',
      label: 'Transfer',
    },
    {
      value: 'billing',
      label: 'Billing',
    },
    {
      value: 'avoir',
      label: 'Avoir',
    },
    {
      value: 'Refund',
      label: 'Refund',
    },
    {
      value: 'Cancel',
      label: 'Cancel',
    },
  ];

  listOfFlux = [
    { label: 'Billing', value: 'billing' },
    { label: 'Payment', value: 'payment' },
    { label: 'Avoir', value: 'avoir' },
    { label: 'Refund', value: 'refund' },
    { label: 'OD', value: 'OD' },
  ];

  listOfStatus = [
    { label: 'authorised', value: 'Authorised' },
    { label: 'chargeback_status', value: 'chargeback' },
    { label: 'refused', value: 'Refused' },
    { label: 'settled', value: 'Settled' },
  ];

  clickedActionButton: any;
  isCheckedAll = false;
  disabledExport = true;
  selectType: any;
  dataUnselect = [];
  dataSelected: any[] = [];
  dataSelectedId: any[];
  pageSelected = [];
  dataUnselectUser = [];
  isSourceFilterChange = false;
  currentUser: any;
  currentUserTypeId: any;
  isPermission: string[];
  filterBreadcrumbData: any[] = [];
  listOfOperationNameForBreadcrumb: any;
  tempOperationNameValue: any;
  filteredValuesForBreadCrumb: any;

  listTypeOfInformation: any[] = [];

  constructor(
    private translate: TranslateService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private transactionService: MasterTransactiontService,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    private parseLocalToUtcPipe: ParseLocalToUtcPipe,
    private financeService: FinancesService,
    public permission: PermissionService,
    private authService: AuthService,
    private httpClient: HttpClient,
    private utilService: UtilityService,
    private dialog: MatDialog,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService,
    private intakeChannelService: IntakeChannelService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.getDropdown();
    this.sortingAllListSelect();
    this.sortingAllListSelectTranslate();
    this.getAllTypeOfInformation();
    this.initFilter();
    if (!this.isReset) {
      this.getMasterTransaction();
    }
    this.filterBreadcrumbFormat();
    this.pageTitleService.setTitle('Master Transaction');
    this.subs.sink = this.translate.onLangChange.subscribe(() => {
      this.getAllTypeOfInformation();
    })
  }

  getAllTypeOfInformation() {
    this.listTypeOfInformation = [
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

    this.listTypeOfInformation = this.listTypeOfInformation.sort((a, b) => a.label.toLowerCase().localeCompare(b.label));
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getMasterTransaction();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getMasterTransaction() {
    const filter = this.cleanFilterData();
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    const sorting = this.sortValue;
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.getAllMasterTransaction(pagination, userTypesList, sorting, filter).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.dataSource.data = _.cloneDeep(resp);
          this.paginator.length = resp[0].count_document;
          this.dataCount = resp[0]?.count_document;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
      },
      (err) => {
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
    this.filterBreadcrumbFormat();
  }

  sortData(sort: Sort) {
    this.sortValue = sort.direction ? { [sort.active]: sort.direction } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getMasterTransaction();
      }
    }
  }

  getDropdown() {
    // get list of program for dropdown
    this.subs.sink = this.financeService.getAllProgramOfMasterTransaction().subscribe(
      (res) => {
        const programs = _.cloneDeep(res);
        if (programs && programs.length) {
          programs.forEach((program) => {
            if (program.scholar_season_id && program.scholar_season_id.scholar_season) {
              program.program = program.scholar_season_id.scholar_season + ' ' + program.program;
            } else {
              program.program = program.program;
            }
          });
          this.listOfProgram = _.cloneDeep(programs.sort((a, b) => (a.program > b.program ? 1 : -1)));
        } else {
          this.listOfProgram = [];
        }
      },
      (err) => {
        console.error('Error fetching program dropdown', err);
      },
    );

    // get list of legal entities  for dropdown
    this.subs.sink = this.financeService.getAllLegalEntitiesOfMasterTransaction().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.listOfLegalEntity = _.cloneDeep(resp.sort((a, b) => (a.legal_entity_name > b.legal_entity_name ? 1 : -1)));
        } else {
          this.listOfLegalEntity = [];
        }
      },
      (err) => {
        console.error('Error fetching legal entity dropdown', err);
      },
    );

    // get list of operation name for dropdown
    this.subs.sink = this.financeService.getAllOperationNameDropDownMasterTransaction().subscribe(
      (resp) => {
        let respReduce = [];
        if (resp && resp.length) {
          respReduce = resp.filter((res) => res !== null);
          this.listOfOperationName = respReduce.sort((a, b) => a.localeCompare(b));
          this.sortingAllListSelect();
        } else {
          this.listOfOperationName = [];
        }
      },
      (err) => {
        console.error('Error fetching operation name dropdown', err);
      },
    );
  }

  displayOperationName(filter, data, from?, index?) {
    let indexParse = Number(index) + 1;
    if (data) {
      if (data?.includes('avoir_scholarship_fees')) {
        return data?.replace('avoir_scholarship_fees', this.translate.instant('OPERATION_NAME.avoir_scholarship_fees'));
      } else if (data?.includes('avoir_of_scholarship_fees')) {
        return data?.replace('avoir_of_scholarship_fees', this.translate.instant('OPERATION_NAME.avoir_of_scholarship_fees'));
      } else if (data?.includes('scholarship_fees')) {
        return data?.replace('scholarship_fees', this.translate.instant('OPERATION_NAME.scholarship_fees'));
      } else if (data?.toLowerCase() === 'billing of down payment') {
        return this.translate.instant('Billing of down payment');
      } else if (data?.includes('Billing Term')) {
        return data?.replace('Billing Term', this.translate.instant('Billing Term'));
      } else if (data?.includes('billing_of_term')) {
        return this.translate.instant('OPERATION_NAME.billing_of_term');
      } else if (data === 'payment_of_dp' && from === 'classic') {
        return this.translate.instant('OPERATION_NAME.down_payment');
      } else if (data === 'regulation_payment') {
        return ( filter === 'non-filter' ) ?
            `${
              this.translate.instant('OPERATION_NAME.payment_of_term') +
              ' ' +
              indexParse +
              ' - ' +
              this.translate.instant('OPERATION_NAME.Regulation')
            }`
          : `${
            this.translate.instant('OPERATION_NAME.payment_of_term') +
            ' - ' +
            this.translate.instant('OPERATION_NAME.Regulation')
          }`
      } else if (data === 'payment_of_term') {
        return ( filter === 'non-filter' ) ?
            `${this.translate.instant('OPERATION_NAME.payment_of_term') + ' ' + index}`
          : `${this.translate.instant('OPERATION_NAME.payment_of_term')}`
      } else {
        return this.translate.instant('OPERATION_NAME.' + data);
      }
    } else {
      return '';
    }
  }

  parseTermIndexToNumber(data) {
    if (data || data === 0) {
      return Number(data) + 1;
    }
  }

  displayTransactionType(data) {
    if (data) {
      return this.translate.instant('master_transaction.' + data);
    } else {
      return '';
    }
  }

  isAvoirOrDiscountOperationName(operationName, transactionType) {
    if (transactionType === 'avoir' && (operationName.includes('avoir') || operationName.includes('discount'))) {
      return true;
    } else {
      return false;
    }
  }

  sortingAllListSelect() {
    this.listOfNature = this.listOfNature.sort((a, b) =>
      this.translate.instant('master_transaction.' + a.label).localeCompare(this.translate.instant('master_transaction.' + b.label)),
    );
    this.listOfFlux = this.listOfFlux.sort((a, b) =>
      this.translate.instant('master_transaction.' + a.label).localeCompare(this.translate.instant('master_transaction.' + b.label)),
    );
    this.listOfSource = this.listOfSource.sort((a, b) =>
      this.translate.instant('master_transaction.' + a.label).localeCompare(this.translate.instant('master_transaction.' + b.label)),
    );
    this.listOfOperationName = this.listOfOperationName.sort((a, b) =>
      this.translate.instant('OPERATION_NAME.' + a).localeCompare(this.translate.instant('OPERATION_NAME.' + b)),
    );

    this.listOfStatus = _.cloneDeep(
      this.listOfStatus.sort((a, b) =>
        this.utilService?.simpleDiacriticSensitiveRegex(this.translate.instant('master_transaction.' + a?.label)) >
        this.utilService?.simpleDiacriticSensitiveRegex(this.translate.instant('master_transaction.' + b?.label))
          ? 1
          : -1,
      ),
    );
    this.listOfOperationNameForBreadcrumb = this.listOfOperationName.map((item) => {
      const firstWord = item.split(' ')[0];
      const translateForFirstWord = this.translate.instant('OPERATION_NAME.' + firstWord);
      const restWord = item.substr(item.indexOf(' ') + 1);
      let finalWord = '';
      if (restWord !== firstWord) {
        finalWord = translateForFirstWord + ' ' + restWord;
      } else {
        finalWord = translateForFirstWord;
      }
      return finalWord;
    });
  }

  sortingAllListSelectTranslate() {
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.sortingAllListSelect();
      const indexTempOperationName = this.listOfOperationName.indexOf(this.filteredValues.operation_name)
        ? this.listOfOperationName.indexOf(this.filteredValues.operation_name)
        : null;
      if (this.filteredValuesForBreadCrumb?.operation_name) {
        this.filteredValuesForBreadCrumb.operation_name = this.listOfOperationNameForBreadcrumb[indexTempOperationName];
      }
      this.filterBreadcrumbFormat();
    });
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.dataUnselect = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.dataUnselect = [];
      this.isCheckedAll = true;
      this.dataSource.data.map((row) => {
        if (!this.dataUnselect.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
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
        if (!this.dataUnselect.includes(row._id)) {
          this.dataUnselect.push(row._id);
          this.selection.deselect(row._id);
        } else {
          const indx = this.dataUnselect.findIndex((list) => list === row._id);
          this.dataUnselect.splice(indx, 1);
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
    this.dataSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.dataSelectedId.push(user._id);
    });
  }

  controllerButton(action: string) {
    this.clickedActionButton = action;
    setTimeout(() => {
      const cases = {
        export: this.getAllDataForExport.bind(this),
      };
      cases[action](0);
    }, 500);
  }

  getAllDataForExport(page: number) {
    if (this.clickedActionButton !== 'export') {
      return;
    }
    const pagination = { limit: 500, page };
    const sorting = this.sortValue;
    const filter = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    if (this.isCheckedAll) {
      if (this.dataUnselect.length < 1) {
        this.downloadCSV();
      } else {
        if (page === 0) {
          this.dataSelected = [];
        }
        this.isLoading = true;
        this.financeService.getAllDataForExportMasterTransaction(pagination, userTypesList, sorting, filter).subscribe(
          (students: any) => {
            if (students && students.length && students.length > 0) {
              this.dataSelected.push(...students);
              this.getAllDataForExport(page + 1);
            } else {
              this.isLoading = false;
              if (this.isCheckedAll && this.dataSelected && this.dataSelected.length) {
                this.dataSelected = this.dataSelected.filter((item) => !this.dataUnselect.includes(item._id));
                if (this.dataSelected && this.dataSelected.length) {
                  this.downloadCSV();
                }
              }
            }
          },
          (err: any) => {
            this.isLoading = true;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            });
          },
        );
      }
    } else {
      this.downloadCSV();
    }
  }

  downloadCSV() {
    if (this.dataSelected && this.dataSelected.length < 1 && !this.isCheckedAll) {
      return Swal.fire({
        type: 'warning',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: String(this.translate.instant('Transaction')).toLocaleLowerCase() }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      const inputOptions = {
        ',': this.translate.instant('IMPORT_DECISION_S1.COMMA'),
        ';': this.translate.instant('IMPORT_DECISION_S1.SEMICOLON'),
        tab: this.translate.instant('IMPORT_DECISION_S1.TAB'),
      };
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
    const lang = this.translate.currentLang.toLowerCase();
    const importStudentTemplate = `exportMasterTransactionTable/`;
    let filter = '';
    const filterOffset = this.filteredValues.date || this.filteredValues.time ? ', "offset": "' + moment().utcOffset() + '"' : '';
    if ((this.dataSelected.length && !this.isCheckedAll) || (this.dataUnselect && this.dataUnselect.length)) {
      const mappedIds = [...new Set(this.dataSelected.map((res) => `"` + res._id + `"`))];
      filter = '"filter":{"master_transaction_ids": [' + mappedIds.toString() + ']' + '}';
    } else if (this.isCheckedAll) {
      filter = this.cleanFilterDataCSV();
    }
    let sorting = '"sorting":{}';
    if (this.sortValue) {
      sorting = '"sorting":' + JSON.stringify(this.sortValue);
    }
    const userTypesList =
      this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id.map((res) => `"` + res + `"`) : [];
    const uri = encodeURI(url + importStudentTemplate + fileType + '/' + lang);
    const options = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
        'Content-Type': 'application/json',
      }),
    };

    const payload = '{' + filter + ',' + sorting + ',"user_type_ids":[' + userTypesList + ']}';

    this.isWaitingForResponse = true;
    this.httpClient.post(uri, payload, options).subscribe(
      (res) => {
        this.isWaitingForResponse = false;
        if (res) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('ReAdmission_S3.TITLE'),
            text: this.translate.instant('ReAdmission_S3.TEXT'),
            confirmButtonText: this.translate.instant('ReAdmission_S3.BUTTON'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => this.clearSelection());
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  cleanFilterDataCSV() {
    const filterData = _.cloneDeep(this.filteredValues);
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] === null) {
        delete filterData[key];
      }
    });
    return ` "filter": ${JSON.stringify(filterData)} `;
  }

  cleanFilterData() {
    if (this.filteredValues.date || this.filteredValues.time || this.filteredValues.from_date || this.filteredValues.to_date) {
      this.filteredValues.offset = moment().utcOffset();
    } else {
      this.filteredValues.offset = null;
    }
    const filterData = _.cloneDeep(this.filteredValues);
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] === null) {
        delete filterData[key];
      }
    });
    return filterData;
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

  resetFilter() {
    this.filterBreadcrumbData = [];
    this.filteredValuesForBreadCrumb = null;
    this.isReset = true;
    this.filteredValues = {
      date: null,
      time: null,
      student_number: null,
      student_name: null,
      program_id: null,
      student_types: null,
      legal_entity_names: null,
      payer: null,
      transaction_type: null,
      operation_name: null,
      nature: null,
      flux: null,
      actor: null,
      offset: null,
      table_type: 'master_transaction_table',
      latest_status: null,
      from_date: null,
      to_date: null,
    };

    this.fromDateFilter.setValue(null, { emitEvent: false });
    this.toDateFilter.setValue(null, { emitEvent: false });

    this.dateFilter.setValue(null, { emitEvent: false });
    this.timeFilter.setValue(null, { emitEvent: false });
    this.studentNumberFilter.setValue(null, { emitEvent: false });
    this.studentFilter.setValue(null, { emitEvent: false });
    this.programFilter.setValue('All', { emitEvent: false });
    this.typeOfFormationFilter.setValue(null, { emitEvent: false });
    this.legalEntityFilter.setValue(null, { emitEvent: false });
    this.payerFilter.setValue(null, { emitEvent: false });
    this.sourceFilter.setValue('All', { emitEvent: false });
    this.operationNameFilter.setValue('All', { emitEvent: false });
    this.natureFilter.setValue('All', { emitEvent: false });
    this.fluxFilter.setValue('All', { emitEvent: false });
    this.statusFilter.setValue('All', { emitEvent: false });
    this.actorFilter.setValue(null, { emitEvent: false });

    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.clearSelection();
    this.paginator.firstPage();
    this.tempDataFilter = {      
      legalEntity: null,
      typeOfFormation: null     
    };
    if (this.isReset) {
      this.getMasterTransaction();
    }
  }

  clearSelection() {
    this.selection.clear();
    this.dataSelected = [];
    this.dataUnselect = [];
    this.isCheckedAll = false;
  }

  initFilter() {
    // date filter above table
    this.subs.sink = this.fromDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.from_date = newDate;
        this.paginator.firstPage();
        this.clearSelection();
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getMasterTransaction();
        }
      }
    });
    this.subs.sink = this.toDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.to_date = newDate;
        this.paginator.firstPage();
        this.clearSelection();
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getMasterTransaction();
        }
      }
    });
    // table filter
    this.subs.sink = this.dateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.date = newDate;
        this.paginator.firstPage();
        this.clearSelection();
        if (!this.isReset) {
          this.getMasterTransaction();
        }
      }
    });

    this.subs.sink = this.timeFilter.valueChanges.subscribe((time) => {
      const parse = this.parseLocalToUtcPipe.transform(time);
      this.filteredValues.time = parse;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getMasterTransaction();
      }
    });

    this.subs.sink = this.studentNumberFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.student_number = statusSearch ? statusSearch : null;
      this.paginator.firstPage();
      this.clearSelection();
      if (!this.isReset) {
        this.getMasterTransaction();
      }
    });

    this.subs.sink = this.studentFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.student_name = statusSearch ? statusSearch : null;
      this.paginator.firstPage();
      this.clearSelection();
      if (!this.isReset) {
        this.getMasterTransaction();
      }
    });

    this.subs.sink = this.payerFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.payer = statusSearch ? statusSearch : null;
      this.paginator.firstPage();
      this.clearSelection();
      if (!this.isReset) {
        this.getMasterTransaction();
      }
    });

    this.subs.sink = this.programFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.program_id = statusSearch === 'All' ? null : statusSearch;
      this.paginator.firstPage();
      this.clearSelection();
      if (!this.isReset) {
        this.getMasterTransaction();
      }
    });

    this.subs.sink = this.sourceFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.transaction_type = statusSearch === 'All' ? null : statusSearch;
      this.paginator.firstPage();
      this.clearSelection();
      if (!this.isReset) {
        this.getMasterTransaction();
      }
    });

    this.subs.sink = this.operationNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.operation_name = statusSearch === 'All' ? null : statusSearch;
      const indexTempOperationName = this.listOfOperationName.indexOf(this.filteredValues.operation_name);
      this.filteredValuesForBreadCrumb = _.cloneDeep(this.filteredValues);
      this.filteredValuesForBreadCrumb.operation_name = this.listOfOperationNameForBreadcrumb[indexTempOperationName];
      this.paginator.firstPage();
      this.clearSelection();
      if (!this.isReset) {
        this.getMasterTransaction();
      }
    });

    this.subs.sink = this.natureFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.nature = statusSearch === 'All' ? null : statusSearch;
      this.paginator.firstPage();
      this.clearSelection();
      if (!this.isReset) {
        this.getMasterTransaction();
      }
    });

    this.subs.sink = this.fluxFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.flux = statusSearch === 'All' ? null : statusSearch;
      this.paginator.firstPage();
      this.clearSelection();
      if (!this.isReset) {
        this.getMasterTransaction();
      }
    });

    this.subs.sink = this.statusFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.latest_status = statusSearch === 'All' ? null : statusSearch;
      this.paginator.firstPage();
      this.clearSelection();
      if (!this.isReset) {
        this.getMasterTransaction();
      }
    });

    this.subs.sink = this.actorFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.actor = statusSearch ? statusSearch : null;
      this.paginator.firstPage();
      this.clearSelection();
      if (!this.isReset) {
        this.getMasterTransaction();
      }
    });
  }

  openDetailTransactionMasterDialog(data) {
    const dataUpdate = this.mapTermAffected(data);    
    this.subs.sink = this.dialog
      .open(DetailTransactionMasterDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: dataUpdate,
      })
      .afterClosed()
      .subscribe((resp) => {
        // code...
      });
  }

  mapTermAffected(data) {    
    if(data?.term_affected && data?.term_affected?.length) {
      data?.term_affected.forEach((term, index) => {
        if(this.getTermAffectedById(data, term?.term_id) >= 0) {
          data.term_affected[index].is_regulation = data?.billing_id?.terms[this.getTermAffectedById(data, term?.term_id)].is_regulation
          
        }
      })
    }
    return data;    
  }

  getTermAffectedById(data, termId) {
    return data?.billing_id?.terms.findIndex(term => term?._id === termId);
  }

  viewCandidateInfo(candidateId, tab?, subTab?) {
    const query = {
      selectedCandidate: candidateId,
      sortValue: '',
      tab: tab || '',
      subTab: subTab || '',
      paginator: JSON.stringify({
        pageIndex: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize,
      }),
    };
    if (tab) {
      const url = this.route.createUrlTree(['candidate-file'], { queryParams: query });
      window.open(url.toString(), '_blank');
    } else {
      const url = this.route.createUrlTree(['candidate-file'], { queryParams: query });
      window.open(url.toString(), '_blank');
    }
  }

  onOpenTransaction(data) {
    const number = data?.candidate_id?.candidate_unique_number;
    const urls = this.route.createUrlTree(['transaction-report'], { queryParams: { studentNumber: number } });
    window.open(urls.toString(), '_blank');
  }

  formatCurrency(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
    }
    return num;
  }

  isDisplayButtonEuro(element) {
    let isDisplay = true;
    // if flux billing hidden button OR
    // if transaction type manual payment AND flux payment OR
    // if flux OD OR
    // if transaction type manual payment AND nature not credit card AND
    // if transaction type manual payment AND nature not sepa
    // if doesnt have transaction id, the button will be hide
    if (
      element?.flux === 'billing' ||
      (element?.transaction_type === 'manual_payment' &&
        element?.nature !== 'credit_card' &&
        element?.transaction_type === 'manual_payment' &&
        element?.nature !== 'sepa') ||
      element?.flux === 'OD' ||
      !element?.transaction_id
    ) {
      isDisplay = false;
    }

    return isDisplay;
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      // date filter above table
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
      {
        type: 'table_filter',
        name: 'date',
        column: 'Date',
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
        name: 'time',
        column: 'Time',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.timeFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'student_number',
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
        name: 'student_name',
        column: 'Student Name',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.studentFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'program_id',
        column: 'Program',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.listOfProgram,
        filterRef: this.programFilter,
        displayKey: 'program',
        savedValue: '_id',
        isSelectionInput: true,
      },
      {
        type: 'table_filter',
        name: 'student_types',
        column: 'READMISSION.Type of formation',
        isMultiple: this.typeOfFormationFilter?.value?.length === this.listTypeOfInformation?.length ? false : true,
        filterValue:
          this.typeOfFormationFilter?.value?.length === this.listTypeOfInformation?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.typeOfFormationFilter?.value?.length === this.listTypeOfInformation?.length ? null : this.listTypeOfInformation,
        filterRef: this.typeOfFormationFilter,
        isSelectionInput: this.typeOfFormationFilter?.value?.length === this.listTypeOfInformation?.length ? false : true,
        displayKey: this.typeOfFormationFilter?.value?.length === this.listTypeOfInformation?.length ? null : 'value',
        savedValue: this.typeOfFormationFilter?.value?.length === this.listTypeOfInformation?.length ? null : 'value',
        resetValue: null,
        translationPrefix: this.typeOfFormationFilter?.value?.length !== this.listTypeOfInformation?.length ? 'type_formation.' : null,
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
        name: 'payer',
        column: 'Payer',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.payerFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'transaction_type',
        column: 'Source',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.listOfSource,
        filterRef: this.sourceFilter,
        displayKey: 'label',
        savedValue: 'value',
        isSelectionInput: true,
      },
      {
        type: 'table_filter',
        name: 'operation_name',
        column: 'Operation Name',
        isMultiple: false,
        filterValue: this.filteredValuesForBreadCrumb,
        filterList: this.listOfOperationNameForBreadcrumb,
        filterRef: this.operationNameFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: false,
      },
      {
        type: 'table_filter',
        name: 'nature',
        column: 'Nature',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.listOfNature,
        filterRef: this.natureFilter,
        displayKey: 'value',
        savedValue: 'label',
        isSelectionInput: false,
        translationPrefix: 'nature_type.',
      },
      {
        type: 'table_filter',
        name: 'flux',
        column: 'Flux',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.listOfFlux,
        filterRef: this.fluxFilter,
        displayKey: 'value',
        savedValue: 'label',
        isSelectionInput: false,
        translationPrefix: 'master_transaction.',
      },
      {
        type: 'table_filter',
        name: 'latest_status',
        column: 'Status',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.listOfStatus,
        filterRef: this.statusFilter,
        displayKey: 'value',
        savedValue: 'label',
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'actor',
        column: 'Actor',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.actorFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadcrumbData = [];
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.filteredValues, this.filteredValues);
    if (filterItem.name === 'program_id') {
      this.programFilter.patchValue('All');
      this.filteredValues.program_id = '';
    } else if (filterItem.name === 'transaction_type') {
      this.sourceFilter.patchValue('All');
      this.filteredValues.transaction_type = '';
    } else if (filterItem.name === 'transaction_type') {
      this.sourceFilter.patchValue('All');
      this.filteredValues.transaction_type = '';
    } else if (filterItem.name === 'operation_name') {
      this.operationNameFilter.patchValue('All');
      this.filteredValues.operation_name = '';
    } else if (filterItem.name === 'nature') {
      this.natureFilter.patchValue('All');
      this.filteredValues.nature = '';
    } else if (filterItem.name === 'flux') {
      this.fluxFilter.patchValue('All');
      this.filteredValues.flux = '';
    } else if (filterItem.name === 'latest_status') {
      this.statusFilter.patchValue('All');
      this.filteredValues.latest_status = '';
    }
    this.getMasterTransaction();
  }

  isDisplayButtonNote(element) {
    let isDisplay = true;
    // if flux billing hidden button
    if (element?.flux === 'billing') {
      isDisplay = false;
    }

    return isDisplay;
  }

  // start multiple selection
  setLegalEntityFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.legalEntity) === JSON.stringify(this.legalEntityFilter.value);
    if (isSame) {
      return;
    } else if (this.legalEntityFilter.value?.length) {
      this.filteredValues.legal_entity_names = this.legalEntityFilter.value;
      this.tempDataFilter.legalEntity = this.legalEntityFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.clearSelection();
        this.getMasterTransaction();
      }
    } else {
      if (this.tempDataFilter.legalEntity?.length && !this.legalEntityFilter.value?.length) {
        this.filteredValues.legal_entity_names = this.legalEntityFilter.value;
        this.tempDataFilter.legalEntity = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.clearSelection();
          this.getMasterTransaction();
        }
      } else {
        return;
      }
    }
  }

  setTypeOfFormationFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.typeOfFormation) === JSON.stringify(this.typeOfFormationFilter.value);
    if (isSame) {
      return;
    } else if (this.typeOfFormationFilter.value?.length) {
      this.filteredValues.student_types = this.typeOfFormationFilter.value;
      this.tempDataFilter.typeOfFormation = this.typeOfFormationFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.clearSelection();
        this.getMasterTransaction();
      }
    } else {
      if (this.tempDataFilter.typeOfFormation?.length && !this.typeOfFormationFilter.value?.length) {
        this.filteredValues.student_types = this.typeOfFormationFilter.value;
        this.tempDataFilter.typeOfFormation = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.clearSelection();
          this.getMasterTransaction();
        }
      } else {
        return;
      }
    }
  }

  isAllDropdownSelectedTable(type) {
    if (type === 'legalEntity') {
      const selected = this.legalEntityFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listOfLegalEntity.length;
      return isAllSelected;
    } else if (type === 'typeOfFormation') {
      const selected = this.typeOfFormationFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listTypeOfInformation.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelectedTable(type) {
    if (type === 'legalEntity') {
      const selected = this.legalEntityFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listOfLegalEntity.length;
      return isIndeterminate;
    } else if (type === 'typeOfFormation') {
      const selected = this.typeOfFormationFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listTypeOfInformation.length;
      return isIndeterminate;
    }
  }

  selectAllDataTable(event, type) {
    if (type === 'legalEntity') {
      if (event.checked) {
        const legalEntityList = this.listOfLegalEntity.map((el) => el?.legal_entity_name);
        this.legalEntityFilter.patchValue(legalEntityList, { emitEvent: false });
      } else {
        this.legalEntityFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'typeOfFormation') {
      if (event.checked) {
        const typeOfFormationList = this.listTypeOfInformation.map((el) => el?.value);
        this.typeOfFormationFilter.patchValue(typeOfFormationList, { emitEvent: false });
      } else {
        this.typeOfFormationFilter.patchValue(null, { emitEvent: false });
      }
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
}
