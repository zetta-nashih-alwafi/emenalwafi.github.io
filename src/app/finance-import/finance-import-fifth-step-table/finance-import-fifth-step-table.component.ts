import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { InternshipLettrageDialogComponent } from 'app/internship-file/internship-lettrage-dialog/internship-lettrage-dialog.component';
import { CandidatesHistoryService } from 'app/service/candidates-history/candidates-history.service';
import { debounceTime } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { FinancesService } from 'app/service/finance/finance.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { CoreService } from 'app/service/core/core.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-finance-import-fifth-step-table',
  templateUrl: './finance-import-fifth-step-table.component.html',
  styleUrls: ['./finance-import-fifth-step-table.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseStringDatePipe],
})
export class FinanceImportFifthStepTableComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'select',
    'accounting',
    'type',
    'date',
    // 'transaction',
    'from',
    // 'to',
    // 'bank',
    'reference',
    'amount',
    'student',
    'program',
    'lettrage',
    'action',
  ];
  tutorialIcon = '../../assets/img/tutorial.png';
  filterColumns: String[] = [
    'selectFilter',
    'accountingFilter',
    'typeFilter',
    'dateFilter',
    // 'transactionFilter',
    'fromFilter',
    // 'toFilter',
    // 'bankFilter',
    'referenceFilter',
    'amountFilter',
    'studentFilter',
    'programFilter',
    'lettrageFilter',
    'actionFilter',
  ];
  candidateFilter = new UntypedFormControl('');
  nationalityFilter = new UntypedFormControl('AllF');
  intakeChannelFilter = new UntypedFormControl('AllF');
  preEngagementLevelFilter = new UntypedFormControl('AllM');
  engagementLevelFilter = new UntypedFormControl('AllM');
  actionFilter = new UntypedFormControl('AllF');
  notificationFilter = new UntypedFormControl('');
  actionByFilter = new UntypedFormControl('');
  dateFilter = new UntypedFormControl('');
  timeFilter = new UntypedFormControl('');
  admissionMemberFilter = new UntypedFormControl('');
  selection = new SelectionModel<any>(true, []);

  nationalityFilterList = [
    { value: 'All', key: 'AllF' },
    { value: 'FR', key: 'French' },
    { value: 'US', key: 'American' },
    { value: 'GB', key: 'United Kingdom' },
  ];

  intakeChannelFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: '20-21_EFAPAR_1', key: '20-21 EFAPAR 1' },
    { value: '21-22_EFATOU_2', key: '21-22 EFATOU 2' },
    { value: '20-21_ICABOR_1', key: '20-21 ICABOR 1' },
  ];
  actionFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: 'wap_sms', key: 'Whatsapp or SMS' },
    { value: 'email', key: 'Email' },
    { value: 'note', key: 'Note' },
  ];
  engagementLevelFilterList = [
    { value: 'AllM', key: 'AllM' },
    { value: 'lost', key: 'Lost' },
    { value: 'low', key: 'Low' },
    { value: 'medium', key: 'Medium' },
    { value: 'high', key: 'High' },
    { value: 'registered', key: 'Registered' },
  ];

  filteredValues = {
    candidate: '',
    nationality: '',
    intake_channel: '',
    engagement_level: '',
    action: '',
    admission_member: '',
    email_address: '',
  };
  maleIcon = '../../../../../assets/img/student_icon.png';
  femaleIcon = '../../../../../assets/img/student_icon_fem.png';
  greenHeartIcon = '../../../../../assets/img/enagement_icon_green.png';
  flagsIconPath = '../../../../../assets/icons/flags/';
  dataSource = new MatTableDataSource([]);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  config: MatDialogConfig = {
    disableClose: true,
    width: '600px',
  };
  dataCount = 0;
  private subs = new SubSink();
  noData: any;
  currentUser: any;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  exportName: 'Export';
  selectType: any;
  entityData: any;
  userSelected: any[];
  disableExport = true;
  disableToday = true;
  disableYesterday = true;
  disableLast7Days = true;
  disableLast30Days = true;
  disableThisMonth = true;
  titleList = [];
  originalTitleList = [];
  schoolList = [];
  originalCandidateList = [];
  isLoading: Boolean;
  dummyData = [];

  constructor(
    private candidatesHistoryService: CandidatesHistoryService,
    private candidateService: CandidatesService,
    private dialog: MatDialog,
    private financeService: FinancesService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private parseStringDatePipe: ParseStringDatePipe,
    private translate: TranslateService,
    public coreService: CoreService,
    public userService: AuthService,
  ) {}

  ngOnInit() {
    // this.currentUser = this.authService.getLocalStorageUser();
    // this.initFilter();
    this.subs.sink = this.financeService.dataStepFive.subscribe((val: any) => {
      if (val) {
        this.dummyData = val;
        this.getCandidatesHistoryData();
      }
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getCandidatesHistoryData() {
    this.dataSource.data = this.dummyData;
    this.paginator.length = this.dummyData.length;
    this.dataCount = this.dummyData.length;
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    if (numSelected) {
      this.enableAllTopActions();
    } else {
      this.disableAllTopActions();
    }

    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach((row) => this.selection.select(row));
    if (this.selection.hasValue() && !this.isAllSelected()) {
      this.enableAllTopActions();
    } else {
      this.disableAllTopActions();
    }
  }

  initFilter() {
    this.subs.sink = this.candidateFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.filteredValues.candidate = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesHistoryData();
        }
      } else {
        this.candidateFilter.setValue('');
        this.filteredValues.candidate = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesHistoryData();
        }
      }
    });
  }

  // disable all top action buttons
  disableAllTopActions() {
    this.disableExport = true;
    this.disableToday = true;
    this.disableYesterday = true;
    this.disableLast7Days = true;
    this.disableLast30Days = true;
    this.disableThisMonth = true;
  }

  enableAllTopActions() {
    this.disableExport = false;
    this.disableToday = false;
    this.disableYesterday = false;
    this.disableLast7Days = false;
    this.disableLast30Days = false;
    this.disableThisMonth = false;
  }

  cleanFilterData() {
    console.log(this.filteredValues);
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key]) {
        if (key === 'full_name' || key === 'candidate_id') {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
          // filterQuery = filterData[key];
        } else {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
          // filterQuery = filterData[key];
        }
      }
    });
    return filterQuery;
    // return 'filter: {' + filterQuery + '}';
  }

  lettrageDialog(data) {
    this.subs.sink = this.dialog
      .open(InternshipLettrageDialogComponent, {
        width: '800px',
        minHeight: '100px',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result && result._id) {
          const dataSelected = [];
          // modify the table data with the data from dialog
          const tableDataIndex = this.dummyData.findIndex((dt) => dt._id === result._id);
          let selected = result.student_id.billing_id.terms.filter((list) => list.status && list.status === true);
          this.dummyData[tableDataIndex] = result;
          if (result.transaction && result.transaction === 'deposit') {
            const deposit = {
              transaction: 'deposit',
              term_index: null,
              term_payment: null,
            };
            dataSelected.push(deposit);
          }
          if (selected && selected.length) {
            selected = selected.sort((a, b) => (a.term_index > b.term_index ? 1 : -1));
            selected.forEach((list) => {
              const terms = {
                transaction: 'term',
                term_index: list.term_index,
                term_payment: list.term_payment,
              };
              dataSelected.push(terms);
            });
          }
          this.dummyData[tableDataIndex].letterages = dataSelected;
          this.getCandidatesHistoryData();
        }
      });
  }

  isAllDataGreen() {
    let isAllGreen = true;
    for (const dt of this.dummyData) {
      if (!dt.letter) {
        isAllGreen = false;
        break;
      }
    }
    return isAllGreen;
  }

  formatPayload() {
    const payload = _.cloneDeep(this.dummyData);
    payload.forEach((data) => {
      delete data.term_index;
      delete data.term_payment;
      delete data.transaction;
      data.student_id = data && data.student_id && data.student_id._id ? data.student_id._id : null;
      // data.student_id = data.student_id._id;
    });
    return payload;
  }

  validateData() {
    const payload = this.formatPayload();
    console.log('payload :: ', payload);
    this.isLoading = true;
    this.candidateService.finishReconciliationAndLetterage(payload).subscribe(
      (resp) => {
        this.isLoading = false;
        if (resp) {
          this.financeService.setStatusStepFive(true);
          this.financeService.setCurrentStep(0);
          // Swal.fire({
          //   type: 'success',
          //   title: 'Bravo !',
          //   text: this.translate.instant('import success'),
          // });
        }
      },
      (err) => {
        this.isLoading = false;
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
        if (err['message'] === 'GraphQL error: some school / campus / level not found') {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('REJECT_IMPORT.TITLE'),
            text: this.translate.instant('REJECT_IMPORT.TEXT'),
          });
        }
      },
    );
  }

  translateDate(datee, timee) {
    const finalTime = timee ? timee : '15:59';
    if (datee) {
      const date = this.parseStringDatePipe.transformStringToDate(this.parseUTCToLocalPipe.transformDate(datee, finalTime));
      return moment(date, 'DD/MM/YYYY').format('DD/MM/YY');
    } else {
      return '';
    }
  }
  viewTutorial(data) {
    window.open(
      `https://docs.google.com/presentation/d/1F-3BKfSi3s38iQVs3R9wu2dMjScRZrIewRA512vizIY/edit#slide=id.g409c3d55db_0_0`,
      '_blank',
    );
  }
  toggleSidebar() {
    if (this.coreService.sidenavOpen) {
      this.coreService.sidenavOpen = !this.coreService.sidenavOpen;
    }
    this.coreService.sidenavTutorialOpen = !this.coreService.sidenavTutorialOpen;
  }
}
