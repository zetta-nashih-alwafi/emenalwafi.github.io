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
import { ReconciliationDialogComponent } from 'app/internship-file/reconciliation-dialog/reconciliation-dialog.component';
import { FinancesService } from 'app/service/finance/finance.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import * as moment from 'moment';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { ChequeEditDialogComponent } from '../cheque-edit-dialog/cheque-edit-dialog.component';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { CoreService } from 'app/service/core/core.service';

@Component({
  selector: 'ms-confirmation-step',
  templateUrl: './confirmation-step.component.html',
  styleUrls: ['./confirmation-step.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseStringDatePipe, ParseLocalToUtcPipe],
})
export class ConfirmationStepComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'select',
    'date',
    'bank',
    'cheaqueNumber',
    'payor',
    'student',
    'studentAccount',
    'financialSupport',
    'amount',
    'curr',
    'lettering',
    'action',
  ];
  filterColumns: String[] = [
    'selectFilter',
    'dateFilter',
    'bankFilter',
    'cheaqueNumberFilter',
    'payorFilter',
    'studentFilter',
    'studentAccountFilter',
    'financialSupportFilter',
    'amountFilter',
    'currFilter',
    'letteringFilter',
    'actionFilter',
  ];
  tutorialIcon = '../../assets/img/tutorial.png';
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
  confirmed = false;
  disableThisMonth = true;
  titleList = [];
  originalTitleList = [];
  schoolList = [];
  dataBilling = [];
  originalCandidateList = [];
  isLoading: Boolean;
  dummyData = [];
  legalEntity: any;
  stepData = [];
  dataEntityCheque: any;

  constructor(
    private candidatesHistoryService: CandidatesHistoryService,
    private candidateService: CandidatesService,
    private dialog: MatDialog,
    private financeService: FinancesService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private parseStringDatePipe: ParseStringDatePipe,
    private translate: TranslateService,
    private parseLocalToUTCPipe: ParseLocalToUtcPipe,
    public coreService: CoreService,
  ) {}

  ngOnInit() {
    // this.currentUser = this.authService.getLocalStorageUser();
    // this.initFilter();
    this.subs.sink = this.financeService.dataCheque.subscribe((val: any) => {
      if (val) {
        this.dummyData = val;
        this.getCandidatesHistoryData();
      }
    });
    this.subs.sink = this.financeService.dataBilling.subscribe((val: any) => {
      if (val) {
        this.dataBilling = val;
      }
    });
    this.subs.sink = this.financeService.confirmed.subscribe((val: any) => {
      this.confirmed = val;
    });
    this.subs.sink = this.financeService.dataChequeEnitty.subscribe((val) => {
      this.dataEntityCheque = val;
    });
    this.subs.sink = this.financeService.allDataCheque.subscribe((val) => {
      this.stepData = val;
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  renderTooltipEntity(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    for (const entity of entities) {
      count++;
      if (count > 1) {
        if (entity) {
          tooltip = tooltip + ', ';
          tooltip = tooltip + entity;
        }
      } else {
        if (entity) {
          tooltip = tooltip + entity;
        }
      }
    }
    return tooltip;
  }

  getCandidatesHistoryData() {
    // console.log('this.dummyData', this.dummyData);
    this.dataSource.data = this.dummyData;
    this.paginator.length = this.dummyData && this.dummyData.length ? this.dummyData.length : 0;
    this.dataCount = this.dummyData && this.dummyData.length ? this.dummyData.length : 0;
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

  confirmCheque() {
    this.confirmed = true;
    this.financeService.setConfirmation(true);
    this.financeService.setDataCheque(this.dummyData);
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

  translateDates(date) {
    return moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
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
    // console.log(this.filteredValues);
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
    const totalStudentAssigned = this.dummyData.reduce((acc, curr) => {
      if (curr.accounting_document) {
        acc = acc + 1;
      }
      return acc;
    }, 0);
    data.student_ids = _.uniqBy(data.student_ids, '_id');
    // console.log('Data Recon', data);
    this.subs.sink = this.dialog
      .open(ReconciliationDialogComponent, {
        width: '800px',
        minHeight: '100px',
        disableClose: true,
        data: { ...data, totalStudentAssigned },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result && result._id) {
          // modify the table data with the data from dialog
          const tableDataIndex = this.dummyData.findIndex((dt) => dt._id === result._id);
          this.dummyData[tableDataIndex] = result;
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
      data.student_id = data.candidate_id._id;
      delete data.student_ids;
    });
    return payload;
  }

  validateData() {
    // update step 5 data in service
    console.log('Data Payload', this.dummyData, this.dataEntityCheque, this.stepData);
    const payload = {
      legal_entity: this.dataEntityCheque.legal_id,
      bank: this.dataEntityCheque.bank_name,
      account_number: this.dataEntityCheque.accounting_account,
      cheque_details: [],
      status: 'active',
    };
    const data = this.dummyData.map((list) => {
      return {
        cheque_number: list.cheque_number,
        currency: list.currency,
        amount: list.amount,
        cheque_date: {
          date: moment(list.date, 'DD/MM/YYYY').format('DD/MM/YYYY'),
          time: '15:59',
        },
        bank: list.bank_name,
        financial_supports: list.financial_support,
        payer: list.payor,
        // term_payment: list.term_payment,
        // term_amount: list.term_amount,
        // term_index: list.term_index - 1,
        // term_type: list.term_type,
        student_id: list.student_id,
        billing_id: list.billing_id,
        letterage: [],
      };
    });
    payload.cheque_details = data;
    payload.cheque_details.forEach((element) => {
      element.cheque_date.date = this.parseLocalToUTCPipe.transformDate(element.cheque_date.date, '15:59');
    });
    this.dummyData.forEach((element) => {
      const dataTerm = [];
      const dataCheque = [];
      if (element.term_amount && element.term_amount.length) {
        element.term_amount.forEach((el, indexBill) => {
          if (el) {
            const term_payment = {
              date: element.term_payment.date[indexBill],
              time: element.term_payment.time[indexBill],
            };
            const pay = {
              term_payment: term_payment,
              term_amount: element.term_amount[indexBill],
              term_index: parseInt(element.term_index[indexBill]) - 1,
              term_type: element.term_type[indexBill],
            };
            dataTerm.push(pay);
          } else {
            const term_payment = {
              date: null,
              time: null,
            };
            const pay = {
              term_payment: null,
              term_amount: 0,
              term_index: parseInt(element.term_index[indexBill]) - 1,
              term_type: element.term_type[indexBill],
            };
            dataTerm.push(pay);
          }
        });
        const datas = {
          letterage: dataTerm,
          billing_id: element.billing_id,
        };
        dataCheque.push(datas);
        payload.cheque_details.forEach((el) => {
          if (dataCheque && dataCheque.length) {
            dataCheque.forEach((cheq) => {
              if (el.billing_id === cheq.billing_id) {
                el.letterage = cheq.letterage;
              }
            });
          }
        });
      }
    });
    this.subs.sink = this.financeService.CreateCheque(payload).subscribe(
      (list) => {
        // console.log(list);
        this.financeService.setStatusStepThreeCheque(true);
        this.financeService.setCurrentStep(3);
        Swal.fire({
          type: 'success',
          title: 'Bravo !',
        });
      },
      (err) => {
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

  formatNumber(data) {
    let num = '';
    if (data) {
      num = parseInt(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
      num = num.toString().slice(0, -3);
    }
    return num;
  }

  deleteStudent(data) {
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('REMOVE_CHEQUE.TITLE'),
      html: this.translate.instant('REMOVE_CHEQUE.TEXT', {
        candidateName: data.student,
      }),
      showCancelButton: true,
      allowEscapeKey: true,
      allowOutsideClick: false,
      reverseButtons: true,
      confirmButtonText: this.translate.instant('REMOVE_CHEQUE.BUTTON_1'),
      cancelButtonText: this.translate.instant('REMOVE_CHEQUE.BUTTON_2'),
    }).then((res) => {
      if (res.value) {
        this.dummyData.splice(data.index, 1);
        this.getCandidatesHistoryData();
        Swal.fire({
          type: 'success',
          text: this.translate.instant('Cheque deleted'),
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('PAYMENT_FOLLOW_S5.BUTTON'),
        }).then((resss) => {});
      }
    });
  }

  editChequeTransaction(data) {
    this.subs.sink = this.dialog
      .open(ChequeEditDialogComponent, {
        width: '1350px',
        minHeight: '100px',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {});
  }

  previous() {
    this.financeService.setCurrentStep(1);
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
  toggleSidebar() {
    if (this.coreService.sidenavOpen) {
      this.coreService.sidenavOpen = !this.coreService.sidenavOpen;
    }
    this.coreService.sidenavTutorialOpen = !this.coreService.sidenavTutorialOpen;
  }
}
