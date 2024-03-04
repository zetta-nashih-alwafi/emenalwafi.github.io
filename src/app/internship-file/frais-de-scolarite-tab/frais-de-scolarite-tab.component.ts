import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
// import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CandidatesHistoryService } from 'app/service/candidates-history/candidates-history.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { SpeechToTextDialogComponent } from 'app/shared/components/speech-to-text-dialog/speech-to-text-dialog.component';
import { environment } from 'environments/environment';
import { map } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AvoirDialogComponent } from '../avoir-dialog/avoir-dialog.component';
import { DecaissementDialogComponent } from '../decaissement-dialog/decaissement-dialog.component';
import * as moment from 'moment';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { FinancesService } from 'app/service/finance/finance.service';

@Component({
  selector: 'ms-frais-de-scolarite-tab',
  templateUrl: './frais-de-scolarite-tab.component.html',
  styleUrls: ['./frais-de-scolarite-tab.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseStringDatePipe],
})
export class InternshipFeesComponent implements OnInit, OnChanges {
  dataSource = new MatTableDataSource([]);
  dataSources = new MatTableDataSource([]);
  displayedColumns: string[] = ['select', 'accounting', 'date', 'transaction', 'debit', 'credit', 'solde', 'rec', 'pay'];
  filterColumns: String[] = [
    'selectFilter',
    'accountingFilter',
    'dateFilter',
    'transactionFilter',
    'debitFilter',
    'creditFilter',
    'soldeFilter',
    'recFilter',
    'payFilter',
  ];
  maleIcon = '../../../../../assets/img/student_icon.png';
  femaleIcon = '../../../../../assets/img/student_icon_fem.png';
  yesterdayIcon = '../../../../../assets/img/icon-yesterday.png';
  last7DaysIcon = '../../../../../assets/img/icon-7-days.png';
  last30DaysIcon = '../../../../../assets/img/icon-30-days.png';
  thisMonthIcon = '../../../../../assets/img/icon-this-month.png';

  actionFilter = new UntypedFormControl('AllF');
  notificationFilter = new UntypedFormControl('');
  admissionMemberFilter = new UntypedFormControl('');
  dateFilter = new UntypedFormControl('');
  timeFilter = new UntypedFormControl('');
  selection = new SelectionModel<any>(true, []);
  filteredValues = {
    action: '',
    admission_member: '',
    email_address: '',
  };
  @Input() candidate: any;
  @Input() candidateId: string;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  config: MatDialogConfig = {
    disableClose: true,
    width: '600px',
  };
  dataCount = 0;
  totalCredit = 0;
  totalDebit = 0;
  totalBalance = 0;
  studentBilling: any;
  private subs = new SubSink();
  noData: any;
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
  actionFilterList = [];
  private timeOutVal: any;
  financeFilter = new UntypedFormControl('Excellent');
  financeFilterList = [
    { value: 'excellent', key: 'Excellent' },
    { value: 'good', key: 'Bon' },
    { value: 'bad', key: 'Mauvais' },
    { value: 'doubtful', key: 'Douteux' },
    { value: 'litigation', key: 'Contentieux' },
  ];
  year: string;
  yearPlusOne: string;
  constructor(
    private candidatesHistoryService: CandidatesHistoryService,
    private dialog: MatDialog,
    public translate: TranslateService,
    public financeService: FinancesService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private parseStringDatePipe: ParseStringDatePipe,
  ) {}

  ngOnInit() {
    this.getCandidatesHistoryData();
    this.getCandidateBilling();
    this.year = moment().format('YYYY');
    this.yearPlusOne = moment().add('1', 'y').format('YYYY');
  }

  ngOnChanges() {
    this.year = moment().format('YYYY');
    this.yearPlusOne = moment().add('1', 'y').format('YYYY');
    console.log('candidate data :: ', this.candidateId, this.candidate);
    this.getCandidatesHistoryData();
    this.getCandidateBilling();
  }

  getCandidatesHistoryData() {
    console.log('getCandidatesHistoryData Clicked');
    this.isLoading = true;
    this.dataSource.data = [];
    this.paginator.length = 0;
    this.dataCount = 0;
    this.subs.sink = this.candidatesHistoryService.getAllTransactionHistoriesOfCandidate(this.candidateId).subscribe((histories) => {
      if (histories && histories.length) {
        this.dataSource.data = histories;
        this.paginator.length = histories.length;
        this.dataCount = histories.length;
        this.getDataPayment(histories);
      } else {
        this.dataSource.data = [];
        this.dataCount = 0;
        this.totalCredit = 0;
        this.totalDebit = 0;
        this.totalBalance = 0;
      }
      this.isLoading = false;
      this.dataSource.paginator = this.paginator;
      this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
    }, (err) => {
      this.dataSource.data = [];
      this.dataCount = 0;
      this.totalCredit = 0;
      this.totalDebit = 0;
      this.totalBalance = 0;
      this.isLoading = false;
      this.dataSource.paginator = this.paginator;
      this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  mappingTermDats(data) {
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

    if (data.billing_id && data.billing_id.terms && data.billing_id.terms.length) {
      data.billing_id.terms.forEach((terms) => {
        const termsMoment = moment(terms.term_payment.date, 'DD/MM/YYYY');
        const checkMonthTerms = termsMoment.format('M');

        if (checkMonthTerms === isOctober) {
          data.terms_1 = terms;
          terms.terms_index = 0;
        }
        if (checkMonthTerms === isNovember) {
          data.terms_2 = terms;
          terms.terms_index = 1;
        }
        if (checkMonthTerms === isDecember) {
          data.terms_3 = terms;
          terms.terms_index = 2;
        }
        if (checkMonthTerms === isJanuary) {
          data.terms_4 = terms;
          terms.terms_index = 3;
        }
        if (checkMonthTerms === isFebruary) {
          data.terms_5 = terms;
          terms.terms_index = 4;
        }
        if (checkMonthTerms === isMarch) {
          data.terms_6 = terms;
          terms.terms_index = 5;
        }
        if (checkMonthTerms === isApril) {
          data.terms_7 = terms;
          terms.terms_index = 6;
        }
        if (checkMonthTerms === isMay) {
          data.terms_8 = terms;
          terms.terms_index = 7;
        }
        if (checkMonthTerms === isJune) {
          data.terms_9 = terms;
          terms.terms_index = 8;
        }
        if (checkMonthTerms === isJuly) {
          data.terms_10 = terms;
          terms.terms_index = 9;
        }
        if (checkMonthTerms === isAugust) {
          data.terms_11 = terms;
          terms.terms_index = 10;
        }
        if (checkMonthTerms === isSeptember) {
          data.terms_12 = terms;
          terms.terms_index = 11;
        }
      });
    }
    console.log('data', data);
    this.studentBilling = data;
  }

  checkIsNumber(num) {
    let allow = false;
    if (Number.isInteger(num)) {
      allow = true;
    }
    return allow;
  }

  parseIndex(index) {
    return parseInt(index);
  }
  getDataPayment(histories) {
    this.totalCredit = 0;
    this.totalDebit = 0;
    this.totalBalance = 0;
    histories.forEach((element) => {
      this.totalCredit += parseInt(element.credit);
      this.totalDebit += parseInt(element.debit);
    });
    this.totalBalance = this.totalCredit - this.totalDebit;
  }
  resetTable() {
    console.log('Reset Clicked');
    this.getCandidatesHistoryData();
    this.getCandidateBilling();
  }

  translateCivility(data) {
    if (data && (data.includes('MRS ') || data.includes('Mrs ') || data.includes('mrs ') || data.includes('Mme '))) {
      data = data.replaceAll('MRS', this.translate.instant('MRS'));
      data = data.replaceAll('Mrs', this.translate.instant('MRS'));
      data = data.replaceAll('mrs', this.translate.instant('MRS'));
      data = data.replaceAll('Mme', this.translate.instant('MRS'));
    } else if (data && (data.includes('MR ') || data.includes('Mr ') || data.includes('mr ') || data.includes('M. '))) {
      data = data.replaceAll('MR', this.translate.instant('MR'));
      data = data.replaceAll('Mr', this.translate.instant('MR'));
      data = data.replaceAll('mr', this.translate.instant('MR'));
      data = data.replaceAll('M.', this.translate.instant('MR'));
    }
    return data;
  }

  getCandidateBilling() {
    this.subs.sink = this.financeService.GetOneCandidate(this.candidateId).subscribe((histories) => {
      if (histories) {
        this.mappingTermDats(histories);
        if (histories.billing_id && histories.billing_id.financial_profile) {
          this.financeFilter.setValue(histories.billing_id.financial_profile);
        }
        console.log('Data', histories);
      }
    }, (err) => {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  formatCurrency(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
      num = num.toString().slice(0, -3);
    }
    return num;
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    // if (numSelected) {
    //   this.enableAllTopActions();
    // } else {
    //   this.disableAllTopActions();
    // }

    return numSelected === numRows;
  }

  translateDate(datee, timee) {
    let dates = '';
    const finalTime = timee ? timee : '15:59';
    if (datee) {
      const date = this.parseStringDatePipe.transformStringToDate(this.parseUTCToLocalPipe.transformDate(datee, finalTime));
      dates = moment(date, 'DD/MM/YYYY').format('DD/MM/YY');
    }
    return dates;
  }

  translateDates(date) {
    const check = moment(date, 'DD-MM-YYYY').format('DD MMM YYYY');
    return check;
  }

  showOptions(info) {
    const numSelected = this.selection.selected.length;
    if (numSelected > 0) {
      this.enableAllTopActions();
    } else {
      this.disableAllTopActions();
    }
    this.selectType = info;
    const data = this.selection.selected;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach((row) => this.selection.select(row));
    // if (this.selection.hasValue() && !this.isAllSelected()) {
    //   this.enableAllTopActions();
    // } else {
    //   this.disableAllTopActions();
    // }
  }

  initFilter() {}
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

  avoirDialog(data) {
    this.subs.sink = this.dialog
      .open(AvoirDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: this.studentBilling.billing_id,
      })
      .afterClosed()
      .subscribe((resp) => {
        this.getCandidatesHistoryData();
        this.getCandidateBilling();
      });
  }

  decaissementDialog(data) {
    this.subs.sink = this.dialog
      .open(DecaissementDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: this.studentBilling.billing_id,
      })
      .afterClosed()
      .subscribe((resp) => {
        this.getCandidatesHistoryData();
        this.getCandidateBilling();
      });
  }

  checkStringData(data) {
    const display = true;
    // if (data.includes('.')) {
    //   display = false;
    // }
    return display;
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
    const found = moment().isAfter(moment(planned, 'DD/MM/YYYY'));
    return found;
  }

  isNonPayable(data, range1, range2) {
    let found = true;
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

  updateFinancialStatus() {
    const payload = {
      financial_profile: this.financeFilter.value,
    };
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('FINANCIAL_PROFILE_S1.TITLE'),
      html: this.translate.instant('FINANCIAL_PROFILE_S1.TEXT', {
        candidateName:
          (this.studentBilling.civility !== 'neutral' ? this.translate.instant(this.studentBilling.civility) + ' ' : '') +
          this.studentBilling.first_name +
          ' ' +
          this.studentBilling.last_name,
        financial: this.translate.instant(this.financeFilter.value),
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: this.translate.instant('FINANCIAL_PROFILE_S1.BUTTON_1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('FINANCIAL_PROFILE_S1.BUTTON_2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('FINANCIAL_PROFILE_S1.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('FINANCIAL_PROFILE_S1.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        console.log('Data Payload', payload);
        this.subs.sink = this.financeService.UpdateBilling(payload, this.studentBilling.billing_id._id).subscribe((list) => {
          console.log('Data Updated', list);
          Swal.fire({
            type: 'success',
            title: 'Bravo!',
            confirmButtonText: this.translate.instant('OK'),
          });
        }, (err) => {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        });
      }
    });
  }
}
