import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import * as moment from 'moment';
import { TransactionReportService } from 'app/transaction-report/transaction-report.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { environment } from 'environments/environment';
import Swal from 'sweetalert2';
import { UntypedFormControl } from '@angular/forms';
import { E } from '@angular/cdk/keycodes';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-payout-details-details',
  templateUrl: './payout-details-details.component.html',
  styleUrls: ['./payout-details-details.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseLocalToUtcPipe],
})
export class PayoutDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = ['number', 'candidate', 'currency', 'amount', 'transaction_status', 'date', 'time', 'action'];
  filterColumns: string[] = [
    'numberFilter',
    'studentFilter',
    'currencyFilter',
    'amountFilter',
    'statusFilter',
    'dateFilter',
    'timeFilter',
    'actionFilter',
  ];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isLoading: Boolean = false;
  sortedData: any[];
  isWaitingForResponse = false;
  noData: any;
  private subs = new SubSink();
  balanceId: any;
  balanceData: any;
  sortValue = null;
  dataLoaded: Boolean = false;
  dataCount = 0;
  isReset: Boolean = false;
  filteredValues = {
    candidate_last_name: null,
    transaction_status: ['Credited', 'Debited', 'Payout', 'Chargeback', 'ChargebackReceived'],
    balance_report_id: null,
    student_number: null,
  };
  statusFilterDropdown = [
    { value: 'Credited', viewValue: 'Credited' },
    { value: 'Debited', viewValue: 'Debited' },
    { value: 'Payout', viewValue: 'Payout' },
    { value: 'Chargeback', viewValue: 'Chargeback' },
    { value: 'ChargebackReceived', viewValue: 'ChargebackReceived' },
  ];
  dateFilter = new UntypedFormControl('');
  timeFilter = new UntypedFormControl('');
  studentFilter = new UntypedFormControl(null);
  statusFilter = new UntypedFormControl(null);
  studentNumberFilter = new UntypedFormControl('');
  currentUserTypeId;
  constructor(
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionReportService,
    private parseLocalToUtcPipe: ParseLocalToUtcPipe,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private translate: TranslateService,
    private router: Router,
    private authService: AuthService,
    private httpClient: HttpClient,
  ) {}

  ngOnInit() {
    this.balanceId = this.activatedRoute.snapshot.queryParams.id;
    const currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    this.initFilter();
    if (this.balanceId) {
      this.getPayoutDetail(this.balanceId);
    }
    this.setStatusFilterDropdown();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setStatusFilterDropdown();
      if (this.balanceId) {
        this.getPayoutDetail(this.balanceId);
      }
    });
  }

  getPayoutDetail(balanceId: string) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.transactionService.getOneBalanceReports(balanceId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          console.log(resp);
          const temp = _.cloneDeep(resp);
          this.balanceData = temp;
          this.getBalanceReportData();
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.balanceData = null;
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

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getBalanceReportData();
      }
    }
  }

  getBalanceReportData() {
    if (this.balanceData) {
      this.isLoading = true;
      const pagination = {
        limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
        page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
      };
      this.filteredValues.balance_report_id = this.balanceId;
      const filter = _.cloneDeep(this.filteredValues);
      // filter['offset'] = moment().utcOffset();
      console.log('this.filteredValues', this.filteredValues);
      this.subs.sink = this.transactionService.getAllPayoutBalanceReports(filter, this.sortValue, pagination).subscribe(
        (resp: any) => {
          console.log('_stud', resp);
          this.isLoading = false;
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
        },
        (err) => {
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

  resetTable() {
    this.isReset = true;
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });

    this.filteredValues = {
      candidate_last_name: null,
      balance_report_id: this.balanceId,
      transaction_status: ['Credited', 'Debited', 'Payout', 'Chargeback', 'ChargebackReceived'],
      student_number: null,
    };
    this.studentFilter.patchValue(null, { emitEvent: false });
    this.statusFilter.patchValue(null, { emitEvent: false });
    this.studentNumberFilter.patchValue(null, { emitEvent: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.getBalanceReportData();
  }

  translateDate(date, time) {
    const result = '';
    if (date && time) {
      return moment(date + time, 'DD/MM/YYYYHH:mm').toDate();
    }

    return result;
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

  translateTotalMinus(total: any): String {
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
    if (result && result.includes('-')) {
      result = result.replace('-', '');
    }
    return result;
  }

  translateFeeAndNet(number: number): String {
    const result = '-';
    if (number) {
      return number.toFixed(2);
    }
    return result;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  downloadCSV() {
    const inputOptions = {
      ',': this.translate.instant('IMPORT_DECISION_S1.COMMA'),
      ';': this.translate.instant('IMPORT_DECISION_S1.SEMICOLON'),
      tab: this.translate.instant('IMPORT_DECISION_S1.TAB'),
    };
    // const currentLang = this.translate.currentLang;
    Swal.fire({
      type: 'question',
      title: this.translate.instant('Please select file for export document csv'),
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

  openDownloadCsv(fileType) {
    const balance_report_id = this.balanceId;
    const candidate_last_name = this.filteredValues.candidate_last_name !== null ? this.filteredValues.candidate_last_name : '';
    const student_number = this.filteredValues.student_number !== null ? this.filteredValues.student_number : '';
    let transaction_status;
    if (this.filteredValues.transaction_status && this.filteredValues.transaction_status.length) {
      transaction_status = this.filteredValues.transaction_status.map((res) => `"` + res + `"`);
    }
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const lang = this.translate.currentLang.toLowerCase();
    const importStudentTemlate = `downloadBalanceReportCSV/`;
    let filter;
    if (transaction_status) {
      filter =
        `"filter":{"balance_report_id":"` +
        balance_report_id +
        // `","offset":"` +
        // moment().utcOffset() +
        `","is_payout_detail":true` +
        `,"candidate_last_name":"` +
        candidate_last_name +
        `","student_number":"` +
        student_number +
        `","transaction_status":[` +
        transaction_status +
        `]}`;
    } else {
      filter =
        `"filter":{"balance_report_id":"` +
        balance_report_id +
        `","is_payout_detail":true` +
        `","candidate_last_name":"` +
        candidate_last_name +
        `","student_number":"` +
        student_number +
        // `","offset":"` +
        // moment().utcOffset() +
        `"}`;
    }
    const sorting = this.sortingForExport();
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
        'Content-Type': 'application/json',
      }),
    };
    const payload = '{' + filter + ',' + sorting + ',"user_type_id":' + `"${this.currentUserTypeId}"` + '}';
    this.isLoading = true;
    const fullURL = url + importStudentTemlate + fileType + '/' + lang;
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
          });
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
  parseDateToLocal(createdAt) {
    if (createdAt) {
      const date = createdAt.date;
      const time = createdAt.time;
      if (date && time) {
        const parsed = this.parseUTCToLocalPipe.transformDate(date, time);
        return parsed;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  parseTimeToLocal(createdAt) {
    if (createdAt) {
      const time = createdAt.time;

      if (time) {
        const parsed = this.parseUTCToLocalPipe.transform(time);
        return parsed;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }
  initFilter() {
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
    this.subs.sink = this.studentFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      this.filteredValues.candidate_last_name = name;
      this.paginator.pageIndex = 0;
      this.getBalanceReportData();
    });

    this.subs.sink = this.statusFilter.valueChanges.subscribe((status) => {
      this.filteredValues.transaction_status = status?.length ? status : ['Credited', 'Debited', 'Payout', 'Chargeback', 'ChargebackReceived'];
      this.paginator.pageIndex = 0;
      this.getBalanceReportData();
    });
  }

  viewCandidateInfo(candidateId, tab?,subTab?) {
    const query = {
      selectedCandidate: candidateId,
      sortValue: this.sortValue || '',
      tab: tab || '',
      subTab:subTab || '',
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
  setStatusFilterDropdown() {
    this.statusFilterDropdown = this.statusFilterDropdown.map((data) => {
      return {
        ...data,
        label: this.translate.instant('BALANCE_STATUS.' + data.viewValue)
      }
    })
  }
  isAllDropdownSelected(type) {
    if (type === 'status') {
      const selected = this.statusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.statusFilterDropdown.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'status') {
      const selected = this.statusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.statusFilterDropdown.length;
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
    }
  }
}
