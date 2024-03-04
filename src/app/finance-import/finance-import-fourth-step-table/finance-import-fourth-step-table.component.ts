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
import * as moment from 'moment';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { CoreService } from 'app/service/core/core.service';

@Component({
  selector: 'ms-finance-import-fourth-step-table',
  templateUrl: './finance-import-fourth-step-table.component.html',
  styleUrls: ['./finance-import-fourth-step-table.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseStringDatePipe],
})
export class FinanceImportFourthStepTableComponent implements OnInit, OnDestroy {
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
    'transaction',
    'lettrage',
    // 'action',
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
    'transactionFilter',
    'lettrageFilter',
    // 'actionFilter',
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
  stepFiveData = [];

  constructor(
    private candidatesHistoryService: CandidatesHistoryService,
    private dialog: MatDialog,
    private financeService: FinancesService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private parseStringDatePipe: ParseStringDatePipe,
    public coreService: CoreService,
  ) {}

  ngOnInit() {
    // this.currentUser = this.authService.getLocalStorageUser();
    // this.initFilter();
    this.subs.sink = this.financeService.dataStepFour.subscribe((val: any) => {
      if (val) {
        this.dummyData = val;
        this.getCandidatesHistoryData();
      }
    });
    this.subs.sink = this.financeService.dataStepFive.subscribe((val) => {
      this.stepFiveData = val;
      console.log('get step 5 data :: ', this.stepFiveData);
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
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

  thumbsUp(index: number) {
    this.dummyData[index].letter = !this.dummyData[index].letter;
    this.getCandidatesHistoryData();
  }

  getCandidatesHistoryData() {
    this.dataSource.data = this.dummyData;
    // this.paginator.length = this.dummyData.length;
    this.dataSource.paginator = this.paginator;
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
      })
      .afterClosed()
      .subscribe((resp) => {});
  }

  validateData() {
    // update step 5 data in service
    const dataStepFour = this.dummyData.map((list) => {
      return {
        accounting_document: list.accounting_document,
        amount: list.amount,
        bank: list.bank,
        candidate_id: list.candidate_id,
        description: list.description,
        from: list.from,
        intake_channel: list.intake_channel,
        letter: list.letter,
        reference: list.reference,
        student_id: list.student_id,
        term_index: list.term_index,
        to: list.to,
        transaction: list.transaction,
        transaction_date: list.transaction_date,
        transaction_time: list.transaction_time,
        transaction_type: list.transaction_type,
        _id: list._id,
        letterages: [
          {
            transaction: list.transaction,
            term_index: parseInt(list.term_index),
            term_payment: list.student_id.billing_id
              ? list.student_id.billing_id.terms[parseInt(list.term_index)].term_payment
              : { date: '', time: '' },
          },
        ],
      };
    });
    console.log('set step 5 data :: ', this.stepFiveData, dataStepFour);
    this.financeService.setDataStepFive([...this.stepFiveData, ...dataStepFour]);
    this.financeService.setStatusStepFour(true);
    this.financeService.setCurrentStep(4);
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
