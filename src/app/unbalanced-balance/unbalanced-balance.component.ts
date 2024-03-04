import { FilterBreadcrumbService } from './../filter-breadcrumb/service/filter-breadcrumb.service';
import { PermissionService } from './../service/permission/permission.service';
import Swal from 'sweetalert2';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { FinancesService } from './../service/finance/finance.service';
import { startWith, tap, map, debounceTime } from 'rxjs/operators';
import { AuthService } from 'app/service/auth-service/auth.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { SubSink } from 'subsink';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, OnChanges } from '@angular/core';
import * as _ from 'lodash';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PreviewPdfRulePopUp } from 'app/shared/components/preview-pdf-rule-pop-up/preview-pdf-rule-pop-up.component';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';

@Component({
  selector: 'ms-unbalanced-balance',
  templateUrl: './unbalanced-balance.component.html',
  styleUrls: ['./unbalanced-balance.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class UnbalancedBalanceComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  private subs = new SubSink();
  currentUser;
  isPermission;
  isWaitingForResponse = false; // for the table loading
  isLoading = false; // for page loading
  isReset = false;

  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  noData: any;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  sortValue = null;
  dataCount = 0;
  dataLoaded = false;

  filterForm: UntypedFormGroup;
  studentNumberFilter = new UntypedFormControl(null);
  studentNameFilter = new UntypedFormControl(null);
  legalEntityFilter = new UntypedFormControl(null);
  programFilter = new UntypedFormControl('AllF');
  reasonFilter = new UntypedFormControl('AllF');
  dateFilter = new UntypedFormControl(null);
  studentStatusFilter = new UntypedFormControl(null);
  clickedActionButton: any;

  displayedColumns: string[] = [
    'checkbox',
    'student-number',
    'student-name',
    'status',
    'program',
    'legal-entity',
    'debit',
    'credit',
    'balance',
    'reason',
    'date',
    'action',
  ];
  filterCols: string[] = this.displayedColumns.map((col) => `${col}-filter`);

  // permission
  allowExport = false;
  allowReset = false;
  allowSendSchoolContract = false;
  listOfProgram = [];
  listOfLegalEntity = [];
  dataSelected = [];
  dataSelectedId = [];
  selectType: any;
  dataUnselect = [];
  isCheckedAll = false;
  filteredValues = {
    student_number: '',
    student_name: '',
    program_id: '',
    legal_entity_names: null,
    reason: '',
    display_table: '',
    date: '',
    offset: null,
    candidate_admission_statuses: null
  };
  studentStatusFilterList = [];

  tempDataFilter = {
    legalEntity: null,
    candidate_admission_statuses:null
  }

  filteredValuesAll = {
    legal_entity_names: 'All',   
    candidate_admission_statuses:'All',  
  };

  listOfReason = [
    { key: 'no_reason', value: 'no_reason' },
    { key: 'manual_billing', value: 'manual_billing' },
    { key: 'manual_payment', value: 'manual_payment' },
    { key: 'manual_refund', value: 'manual_refund' },
    { key: 'manual_avoir', value: 'manual_avoir' },
    { key: 'od_cash_transfer', value: 'od_cash_transfer' },
    { key: 'od_student_balance_adjustement', value: 'od_student_balance_adjustement' },
    { key: 'report_inscription', value: 'report_inscription' },
    { key: 'chargeback', value: 'chargeback' },
    { key: 'transfer', value: 'transfer' },
  ];

  filterBreadcrumbData: any[] = [];

  private timeOutVal: any;

  constructor(
    private translate: TranslateService,
    private authService: AuthService,
    private financeService: FinancesService,
    private permissions: PermissionService,
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();

    this.initFilter();
    this.getPermissions();
    this.getAllUnbalancedBalancesData('init');
    this.getDropdown();
    this.filterBreadcrumbFormat();
    this.translateList();
    this.translateListChange();
    this.pageTitleService.setTitle('Unbalanced Balance');
    this.getStudentStatusFilterList();
  }

  ngOnChanges(): void {}

  ngAfterViewInit(): void {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getAllUnbalancedBalancesData('after view init');
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  translateList() {
    this.listOfReason = this.listOfReason.sort((a, b) => {
      return this.translate
        .instant('UNBALANCED_ACCOUNT_REASONS.' + a.key)
        .localeCompare(this.translate.instant('UNBALANCED_ACCOUNT_REASONS.' + b.key));
    });
  }

  translateListChange() {
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.translateList();
      this.getStudentStatusFilterList()
    });
  }

  getPermissions(): void {
    this.allowExport = Boolean(this.permissions.unbalancedBalanceActionExportPermission());
    this.allowReset = Boolean(this.permissions.unbalancedBalanceActionResetPermission());
    this.allowSendSchoolContract = Boolean(this.permissions.unbalancedBalanceActionSendSchoolContractAmandementPermission());
  }

  initFilter() {
    this.subs.sink = this.studentNumberFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.student_number = statusSearch ? statusSearch : null;
      this.paginator.firstPage();
      if (!this.isReset) {
        this.getAllUnbalancedBalancesData();
      }
    });

    this.subs.sink = this.studentNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.student_name = statusSearch ? statusSearch : null;
      this.paginator.firstPage();
      if (!this.isReset) {
        this.getAllUnbalancedBalancesData();
      }
    });

    this.subs.sink = this.programFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.program_id = statusSearch !== 'AllF' ? statusSearch : '';
      this.paginator.firstPage();
      if (!this.isReset) {
        this.getAllUnbalancedBalancesData();
      }
    });

    this.subs.sink = this.reasonFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.reason = statusSearch !== 'AllF' ? statusSearch : '';
      this.paginator.firstPage();
      if (!this.isReset) {
        this.getAllUnbalancedBalancesData();
      }
    });

    this.subs.sink = this.dateFilter?.valueChanges?.pipe(debounceTime(400))?.subscribe((dateSearch) => {
      if (dateSearch) {
        const newDate = moment(dateSearch)?.format('DD/MM/YYYY');
        this.filteredValues.date = newDate;
        this.filteredValues.offset = this.filteredValues?.date ? moment()?.utcOffset() : '';
        this.paginator?.firstPage();
        if (!this.isReset) {
          this.getAllUnbalancedBalancesData();
        }
      }
    });
  }

  getDropdown() {
    // get list of program for dropdown
    this.subs.sink = this.financeService.getAllProgramOfOperationLineUnbalance().subscribe(
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

    // get list of legal entities for dropdown
    this.subs.sink = this.financeService.getAllLegalEntitiesOfUnbalancedBalance().subscribe(
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
  }

  onSort(sort: Sort) {
    this.sortValue = sort.active && sort.direction ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    this.filteredValues.offset = sort?.active === 'date' ? moment()?.utcOffset() : '';
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAllUnbalancedBalancesData('sort');
      }
    }
  }

  getAllUnbalancedBalancesData(from?) {
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    const filter = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    const lang = this.translate.currentLang.toLowerCase();
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.getAllUnbalancedBalances(userTypesList, pagination, filter, this.sortValue, lang).subscribe(
      (resp: any) => {
        if (resp && resp.length) {
          let temp = _.cloneDeep(resp);
          temp = temp.map((data) => {
            let filteredHistoryReason = data?.history_reason?.filter((history) => {
              if (data?.reason) {
                return history?.reason === data?.reason;
              } else if (data?.reason === '') {
                return history?.reason === 'empty_reason' || history?.reason === '';
              }
            });
            let dateHistoryReason = '';
            if (filteredHistoryReason?.length) {
              dateHistoryReason = filteredHistoryReason[filteredHistoryReason?.length - 1]?.date;
            } else {
              dateHistoryReason = data?.history_reason[data?.history_reason?.length - 1]?.date;
            }
            return {
              ...data,
              date_history_reason: dateHistoryReason ? this.parseDateFormat(dateHistoryReason) : '',
            };
          });
          this.dataSource.data = temp;
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

  resetFilter() {
    this.filterBreadcrumbData = [];
    this.isReset = true;
    this.studentNumberFilter.setValue(null, { emitEvent: false });
    this.studentNameFilter.setValue(null, { emitEvent: false });
    this.legalEntityFilter.setValue(null, { emitEvent: false });
    this.studentStatusFilter.setValue(null, { emitEvent: false });
    this.programFilter.setValue('AllF', { emitEvent: false });
    this.reasonFilter.setValue('AllF', { emitEvent: false });
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.dateFilter.setValue(null, { emitEvent: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;

    this.clearSelection();
    this.paginator.firstPage();

    this.filteredValues = {
      student_number: '',
      student_name: '',
      program_id: '',
      legal_entity_names: null,
      reason: '',
      display_table: '',
      date: '',
      offset: null,
      candidate_admission_statuses: null
    };

    this.tempDataFilter = {      
      legalEntity: null,   
      candidate_admission_statuses: null
    };

    if (this.isReset) {
      this.getAllUnbalancedBalancesData('reset');
    }
  }

  clearSelection() {
    this.selection.clear();
    this.dataSelected = [];
    this.dataUnselect = [];
    this.isCheckedAll = false;
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (!filterData[key] && filterData[key] !== false) {
        delete filterData[key];
      }
    });
    return filterData;
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
    return ` "sorting": {${data}}`;
  }
  cleanFilterDataExport() {
    const sorting = this.sortingForExport();
    const filterMapping = _.cloneDeep(this.filteredValues);
    if ((this.dataSelected.length && !this.isCheckedAll) || (this.dataUnselect && this.dataUnselect.length)) {
      const mappedUserId = this.dataSelected.map((res) => res._id);
      filterMapping['student_unbalance_ids'] = mappedUserId;
    }
    const userTypesList =
      this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id.map((res) => '"' + res + '"') : [];
    const filterData = _.cloneDeep(filterMapping);
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (!filterData[key] && filterData[key] !== false) {
        delete filterData[key];
      }
    });
    return `{ "filter": ${JSON.stringify(filterData)},${sorting}, "user_type_ids": [${userTypesList}] }`;
  }

  formatCurrency(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
    } else {
      num = '0.00';
    }
    return num;
  }

  displayProgram(data) {
    let program = '';
    if (data?.intake_channel?.scholar_season_id?.scholar_season && data?.intake_channel?.program) {
      program = data?.intake_channel?.scholar_season_id?.scholar_season.concat(' ', data?.intake_channel?.program);
      return program;
    } else {
      return '';
    }
  }

  /** The label for the checkbox on the passed row */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
  }

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

  controllerButton(action: string) {
    this.clickedActionButton = action;
    setTimeout(() => {
      const cases = {
        'export-sage': this.getAllDataForExportSage.bind(this),
      };
      cases[action](0);
    }, 500);
  }

  getAllDataForExportSage(page: number) {
    if (this.clickedActionButton !== 'export-sage') {
      return;
    }

    const pagination = { limit: 500, page };
    const sorting = this.sortValue;
    const filter = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];

    if (this.isCheckedAll) {
      if (this.dataUnselect.length < 1) {
        this.exportSAGE();
      } else {
        if (page === 0) {
          this.dataSelected = [];
        }
        this.isLoading = true;
        this.subs.sink = this.financeService.getAllDataExportUnbalancedBalances(userTypesList, pagination, filter, sorting).subscribe(
          (resp) => {
            if (resp && resp.length && resp.length > 0) {
              this.dataSelected.push(...resp);
              this.getAllDataForExportSage(page + 1);
            } else {
              this.isLoading = false;
              if (this.isCheckedAll && this.dataSelected && this.dataSelected.length) {
                this.dataSelected = this.dataSelected.filter((item) => !this.dataUnselect.includes(item._id));
                if (this.dataSelected && this.dataSelected.length) {
                  this.exportSAGE();
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
      this.exportSAGE();
    }
  }

  exportSAGE() {
    if (this.dataSelected && this.dataSelected.length < 1 && !this.isCheckedAll) {
      return Swal.fire({
        type: 'warning',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: String(this.translate.instant('Operation lines')).toLocaleLowerCase() }),
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
          const endPoint = 'exportUnbalancedBalances/';
          this.openDownloadCsv(fileType, endPoint);
        }
      });
    }
  }

  openDownloadCsv(fileType, endPoint) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const lang = this.translate.currentLang.toLowerCase();
    const exportEndPoint = endPoint;
    console.log('dataSelected', this.dataSelected);
    const filter = this.cleanFilterDataExport();
    console.log('filter', filter);
    const uri = encodeURI(url + exportEndPoint + fileType + '/' + lang);
    console.log('URL export csv', uri);
    const options = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
        'Content-Type': 'application/json',
      }),
    };
    const payload = filter;

    this.isLoading = true;
    this.http.post(uri, payload, options).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
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
            this.clearSelection();
          });
        }
      },
      (err) => {
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

  viewCandidateInfo(candidateId, tab?, subTab?, candidateSelected?) {
    const currentProgram = candidateSelected ? candidateSelected?.candidate_id?.intake_channel?._id : '';
    const query = {
      selectedCandidate: candidateId,
      sortValue: '',
      tab: tab || '',
      subTab: subTab || '',
      paginator: JSON.stringify({
        pageIndex: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize,
      }),
      currentProgram,
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

  onSendSchoolContract(data) {
    this.subs.sink = this.dialog
      .open(PreviewPdfRulePopUp, {
        width: '1200px',
        minHeight: '100px',
        data: {
          candidate: data,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.resetFilter();
        }
      });
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter',
        name: 'student_number',
        column: 'Student Number',
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
        column: 'Student name',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.studentNameFilter,
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
        name: 'reason',
        column: 'Reason',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.listOfReason,
        filterRef: this.reasonFilter,
        displayKey: 'key',
        savedValue: 'value',
        isSelectionInput: true,
        translationPrefix: 'UNBALANCED_ACCOUNT_REASONS.',
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadcrumbData = [];
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
    if(filterItem.name === 'program_id'){
      this.programFilter.patchValue('AllF')
      this.filteredValues.program_id = ''
    } else if(filterItem.name === 'reason'){
      this.reasonFilter.patchValue('AllF')
      this.filteredValues.reason = ''
    }
    this.getAllUnbalancedBalancesData('init');
  }

  parseDateFormat(dateData) {
    if (dateData) {
      const parsed = moment.utc(dateData).format('DD/MM/YYYY');
      return parsed;
    } else {
      return '';
    }
  }
  parseDateToLocal(dateData) {
    if (dateData) {
      const parsed = moment(dateData).format('DD/MM/YYYY');
      return parsed;
    } else {
      return '';
    }
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
        this.getAllUnbalancedBalancesData();
      }
    } else {
      if (this.tempDataFilter.legalEntity?.length && !this.legalEntityFilter.value?.length) {
        this.filteredValues.legal_entity_names = this.legalEntityFilter.value;
        this.tempDataFilter.legalEntity = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllUnbalancedBalancesData();
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
    } else if (type === 'studentStatus') {
      const selected = this.studentStatusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.studentStatusFilterList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelectedTable(type) {
    if (type === 'legalEntity') {
      const selected = this.legalEntityFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listOfLegalEntity.length;
      return isIndeterminate;
    } else if (type === 'studentStatus') {
      const selected = this.studentStatusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.studentStatusFilterList.length;
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
    } else if (type === 'studentStatus') {
      if (event.checked) {
        const resultData = this.studentStatusFilterList.map((el) => el.value);
        this.studentStatusFilter.patchValue(resultData, { emitEvent: false });
      } else {
        this.studentStatusFilter.patchValue(null, { emitEvent: false });
      }
    }
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
      {
        value: 'financement_validated',
        key: 'financement_validated',
        label: this.translate.instant('financement_validated'),
      },
      // { value: 'deactivated', key: 'Deactivated' },
    ];

    this.studentStatusFilterList = this.studentStatusFilterList.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
  }

  setStudentStatusFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.candidate_admission_statuses) === JSON.stringify(this.studentStatusFilter.value);
    if (isSame) {
      return;
    } else if (this.studentStatusFilter.value?.length) {
      this.filteredValues.candidate_admission_statuses = this.studentStatusFilter.value;
      this.tempDataFilter.candidate_admission_statuses = this.studentStatusFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllUnbalancedBalancesData();
      }
    } else {
      if (this.tempDataFilter.candidate_admission_statuses?.length && !this.studentStatusFilter.value?.length) {

        this.filteredValues.candidate_admission_statuses = this.studentStatusFilter.value;
        this.tempDataFilter.candidate_admission_statuses = null;

        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllUnbalancedBalancesData();
        }
      } else {
        return;
      }
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
}
