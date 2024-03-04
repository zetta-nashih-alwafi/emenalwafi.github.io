import { MonthTermDetailsDialogComponent } from './../../month-term-details-dialog/month-term-details-dialog.component';
import { Router } from '@angular/router';
import { OperationNoteDialogComponent } from './../../operation-note-dialog/operation-note-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, ViewChild, OnChanges, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesHistoryService } from 'app/service/candidates-history/candidates-history.service';
import { CoreService } from 'app/service/core/core.service';
import { DpRegulationDialogComponent } from 'app/shared/components/dp-regulation-dialog/dp-regulation-dialog.component';
import { FinancesService } from 'app/service/finance/finance.service';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import * as _ from 'lodash';
import * as moment from 'moment';
import { map } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { StudentAvoirDialogComponent } from '../../student-avoir-dialog/student-avoir-dialog.component';
import { StudentDecaissementDialogComponent } from '../../student-decaissement-dialog/student-decaissement-dialog.component';
import { PermissionService } from 'app/service/permission/permission.service';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApplicationUrls } from 'app/shared/settings';
import { AddManualBillingDialogComponent } from '../../add-manual-billing-dialog/add-manual-billing-dialog.component';
import { AddManualPaymentDialogComponent } from '../../add-manual-payment-dialog/add-manual-payment-dialog.component';
import { AddDiverseOperationDialogComponent } from '../../add-diverse-operation-dialog/add-diverse-operation-dialog.component';
import { AddBillingDialogComponent } from 'app/shared/components/add-billing-dialog/add-billing-dialog.component';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'ms-student-finance-tab-detail',
  templateUrl: './student-finance-tab-detail.component.html',
  styleUrls: ['./student-finance-tab-detail.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseStringDatePipe],
})
export class StudentFinanceTabDetailComponent implements OnInit, OnChanges, OnDestroy {
  @Input() candidateId: string;
  @Input() scholarSeasonData;
  @Input() showFinancement: boolean;
  registrationData;
  isWaitingForResponse = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource = new MatTableDataSource([]);
  dataSources = new MatTableDataSource([]);

  studentBalanceDataSource = new MatTableDataSource([]);
  studentBalanceDisplayedColumn: string[] = [
    'date',
    'operation-name',
    'payer',
    'flux',
    'nature',
    'debit',
    'credit',
    'solde',
    'status-term',
    'payment-date',
    'accounting-document',
    'balance-date',
    'legal-entity',
    'user',
    'action',
  ];
  balanceCols: string[] = this.studentBalanceDisplayedColumn.map((col) => `${col}-balance`);
  totalCols: string[] = this.studentBalanceDisplayedColumn.map((col) => `${col}-total`);

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
  config: MatDialogConfig = {
    disableClose: true,
    width: '600px',
  };
  dataCount = 0;
  totalCredit = 0;
  totalDebit = 0;
  totalBalance = 0;
  studentBilling: any;
  financeBilling: any;
  studentBillings = [];
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
  isFC: boolean;
  organizationList: any;

  noFinancialData: any;
  financeStatusLoading = false;
  financeStatus = new MatTableDataSource([]);
  financeStatusDisplayedColumns: string[] = [
    'payer',
    'totalAmount',
    'amountBilled',
    'amountPaid',
    'remainingDue',
    'amountLate',
    'accumulatedLate',
    'deposit',
    'notRespected',
    'notSettled',
    'term1',
    'term2',
    'term3',
    'term4',
    'term5',
    'term6',
    'term7',
    'term8',
    'term9',
    'term10',
    'term11',
    'term12',
  ];

  operationNameListAvoir = [
    'avoir',
    'global_avoir',
    'avoir_scholarship_fees',
    'avoir_social_security',
    'avoir_schedule_fees',
    'avoir_administrative_costs',
    'avoir_additional_costs_rejection',
    'avoir_additional_costs_formal_notice',
    'avoir_additional_costs_litigation',
    'avoir_additional_costs_international_transfer',
    'discount_denis_huismann_solidarity_commission',
    'discount_music_business_management',
    'commercial_discount',
    'exceptional_discount',
  ];

  hasBilledTerm = false;
  billingData = [];
  billingPlusFInancement = [];
  studentBalanceCollect = [];
  isDirectorFinance = false;
  isMemberFinance = false;
  isOrganizationDoesntHaveTemplate: boolean = false;
  isCompanyDoesntHaveTemplate: boolean = false;
  personalInformationDummy = "legal_representative"

  // *************** UserType ID for Permission Action Button
  currentUser:any;
  isPermission:any;
  currentUserTypeId:any;
  permissionActionFinance = [
    '617f64ec5a48fe222851880f', // Finance Member
    '617f64ec5a48fe222851880e', // Finance Director
    '6009066808ed8724f5a54836', // Operator Admin
    '5fe98eeadb866c403defdc6b' // Operator Director
  ]
  isNoDepositPaidAndSomeHistoriesDifferent: boolean = false;

  permissionActionFinanceForAcademic = [
    '617f64ec5a48fe2228518813', //Academic Member
    '617f64ec5a48fe2228518812', //Academic Director
  ]

  constructor(
    private candidatesHistoryService: CandidatesHistoryService,
    private dialog: MatDialog,
    public translate: TranslateService,
    public financeService: FinancesService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private parseStringDatePipe: ParseStringDatePipe,
    private pageTitleService: PageTitleService,
    private coreService: CoreService,
    private authService: AuthService,
    public permission: PermissionService,
    private httpClient: HttpClient,
    private router: Router,
    private ngxPermissionService: NgxPermissionsService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService?.getLocalStorageUser();
    this.isPermission = this.authService?.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    this.coreService.sidenavOpen = false;
    this.updatePageTitle();
    console.log(this.studentBilling);
    // if (this.scholarSeasonData.is_current === true) {
    //   this.getCandidatesHistoryData();
    //   this.getDataBilling();
    // }
    this.getCandidatesHistoryData();
    this.getDataBilling();

    this.year = moment().format('YYYY');
    this.yearPlusOne = moment().add('1', 'y').format('YYYY');
  }

  ngOnChanges() {
    this.year = moment().format('YYYY');
    this.yearPlusOne = moment().add('1', 'y').format('YYYY');
    this.financeFilter.setValue('');
    // if (this.scholarSeasonData.is_current === true) {
    //   this.getCandidatesHistoryData();
    //   this.getDataBilling();
    // }
    this.getCandidatesHistoryData();
    this.getDataBilling();

  }

  getDataBilling() {
    const filter = {
      candidate_id: this.candidateId,
      intake_channel: this.scholarSeasonData.intake_channel ? this.scholarSeasonData.intake_channel._id : '',
    };
    this.financeStatusLoading = true;
    this.subs.sink = this.candidatesHistoryService.getAllBilling(filter).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.mappingTermStatus(students);
          this.checkBilledTerm(_.cloneDeep(students));
          this.billingData = students;
          if (
            students[0].student_type &&
            students[0].student_type.type_of_formation &&
            students[0].student_type.type_of_formation !== 'classic'
          ) {
            this.isFC = true;
            this.getOneFinanceOrganization();
          } else {
            this.isFC = false;
            this.financeStatusLoading = false;
          }
          this.isNoDepositPaidAndSomeHistoriesDifferent = this.checkDepositPaidAndDepositHistories();
        } else {
          this.financeStatus.data = [];
          this.financeStatusLoading = false;
          this.isNoDepositPaidAndSomeHistoriesDifferent = false;
        }
        this.noFinancialData = this.financeStatus.connect().pipe(map((dataa) => dataa.length === 0));
      },
      (err) => {
        this.financeStatusLoading = false;
        this.noFinancialData = this.financeStatus.connect().pipe(map((dataa) => dataa.length === 0));
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

  checkDepositPaidAndDepositHistories() {
    const tempBillingData = [];
    this.billingData?.map((billing) => {
      if(billing?.deposit || billing?.dp_deposit_chargeback) {
        tempBillingData.push(billing);
      };
    });

    if(tempBillingData?.length && tempBillingData[0]) {
      const firstIdxOfBillingData = tempBillingData[0];
      if(
          ((
            firstIdxOfBillingData?.deposit_status && 
            firstIdxOfBillingData?.dp_histories?.length
          ) &&
          !(
            (firstIdxOfBillingData?.deposit_status === 'paid' || firstIdxOfBillingData?.deposit_status === 'not_billed') &&
            firstIdxOfBillingData?.dp_histories?.length === 1 && 
            firstIdxOfBillingData?.dp_histories?.[0]?.deposit_status === 'chargeback'
          )) ||
          (
            firstIdxOfBillingData?.deposit_status === 'paid' && 
            firstIdxOfBillingData?.dp_histories?.[0]?.deposit_status === 'chargeback' &&
            firstIdxOfBillingData?.deposit
          )
        ) {
          return true;
        } else {
          return false;
        }
    } else {
      return false;
    }
  }

  // If any of the bill has any of the term status listed below, then display the download invoice button
  checkBilledTerm(bills) {
    const billStudent = bills.find((list) => list && list.student_type && list.student_type.type_of_formation);
    console.log('Check Bill', bills, billStudent);
    if (billStudent && billStudent.student_type) {
      if (bills && bills.length && bills.length > 0) {
        for (const bill of bills) {
          if (bill.terms && bill.terms.length && bill.terms.length > 0) {
            for (const term of bill.terms) {
              // const isValidTermStatus = ['billed', 'pending', 'partially_paid', 'not_authorised'].includes(term.term_status);
              const termAmountMoreThanZero = term && term.term_amount && term.term_amount > 0;
              if (termAmountMoreThanZero) {
                if(this.isFC && term?.term_status === 'not_billed') {
                  this.hasBilledTerm = false;
                  break;
                }
                this.hasBilledTerm = true;
                break;
              } else {
                continue;
              }
            } // End For Terms
          } else {
            continue;
          }
        } // End For Bills
      }
    }
  }

  getCandidateOrganization() {
    const filter = {
      candidate_id: this.candidateId,
      intake_channel: this.scholarSeasonData.intake_channel ? this.scholarSeasonData.intake_channel._id : '',
    };
    this.subs.sink = this.candidatesHistoryService.GetAllFinanceOrganization(filter).subscribe(
      (res) => {
        if (res) {
          this.organizationList = res;
        }
      },
      (err) => {
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

  updatePageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('Student Card Finance'));
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(this.translate.instant('Student Card Finance'));
    });
  }

  getCandidatesHistoryData() {
    this.isLoading = true;
    this.subs.sink = this.candidatesHistoryService
      .getAllMasterTransactionHistories(this.candidateId, this.scholarSeasonData.intake_channel._id)
      .subscribe(
        (histories) => {
          if (histories && histories.length) {
            const transactionData = _.cloneDeep(histories);
            const transaction = [];
            transactionData.forEach((element) => {
              let term_status, term_source;
              // get payment date and term status for term

              if (element?.term_id && element?.billing_id) {
                if (element?.billing_id?.terms?.length) {
                  const term = element?.billing_id?.terms?.filter((terms) => terms._id === element?.term_id);

                  if (term?.length) {
                    if (term[0]?.term_amount_chargeback) {
                      term_status = 'chargeback';
                    } else if (term[0]?.term_amount_pending) {
                      term_status = 'pending';
                    } else if (term[0]?.term_amount_not_authorised) {
                      term_status = 'not_authorized';
                    } else if (term[0]?.term_status === 'partially_paid' && element?.payment_date) {
                      term_status = 'paid';
                    } else if (term[0]?.term_status === 'partially_paid' && !element?.payment_date) {
                      term_status = 'billed';
                    } else {
                      term_status = term[0]?.term_status;
                    }
                    term_source = term[0]?.term_source;
                  }
                }
              } else if (element?.term_id && element?.finance_organization_id) {
                const termOrgainzation = element?.finance_organization_id?.terms?.filter((terms) => terms._id === element?.term_id);

                if (termOrgainzation?.length) {
                  if (termOrgainzation[0]?.term_amount_pending) {
                    term_status = 'pending';
                  } else if (termOrgainzation[0]?.term_amount_not_authorised) {
                    term_status = 'not_authorized';
                  } else if (termOrgainzation[0]?.term_status === 'partially_paid' && element?.payment_date) {
                    term_status = 'paid';
                  } else if (termOrgainzation[0]?.term_status === 'partially_paid' && !element?.payment_date) {
                    term_status = 'billed';
                  } else {
                    term_status = termOrgainzation[0]?.term_status;
                  }
                  term_source = '';
                }
              } else if ((!element?.term_id && element?.billing_id) || (!element?.term_id && element?.finance_organization_id)) {
                // get payment date and term status for deposit
                if (element?.operation_name === 'down_payment') {
                  if (element?.candidate_id?.payment === 'pending' && !element?.payment_date) {
                    term_status = 'pending';
                  } else if (element?.candidate_id?.payment === 'pending' && element?.payment_date) {
                    term_status = 'paid';
                  } else if (element?.candidate_id?.payment === 'not_authorized') {
                    term_status = 'not_authorized';
                  } else if (element?.billing_id?.deposit_status === 'partially_paid' && element?.payment_date) {
                    if (element?.is_chargeback) {
                      term_status = 'chargeback';
                    } else {
                      term_status = 'paid';
                    }
                  } else if (element?.billing_id?.deposit_status === 'partially_paid' && !element?.payment_date) {
                    term_status = 'billed';
                  } else {
                    if (element?.is_chargeback) {
                      term_status = 'chargeback';
                    } else {
                      term_status = element?.billing_id?.deposit_status;
                    }
                  }
                  term_source = '';
                } else if (element?.operation_name === 'payment_of_dp') {
                  if (element?.candidate_id?.payment === 'chargeback') {
                    term_status = 'chargeback';
                  } else if (element?.candidate_id?.payment === 'pending') {
                    term_status = 'pending';
                  }
                }
              }

              const temp = {
                ...element,
                term_status: term_status,
                term_source: term_source,
              };
              transaction.push(temp);
            });

            this.studentBalanceDataSource.data = transaction;
            console.log('this.studentBalanceDataSource.data', this.studentBalanceDataSource.data);
            // this.getDataPayment(transaction);
            this.totalCredit = transactionData?.length && transaction[0]?.total_credit ? transaction[0]?.total_credit : 0;
            this.totalDebit = transactionData?.length && transaction[0]?.total_debit ? transaction[0]?.total_debit : 0;
            this.totalBalance = parseFloat((this.totalCredit - this.totalDebit).toFixed(2));
          } else {
            this.studentBalanceDataSource.data = [];
            this.totalCredit = 0;
            this.totalDebit = 0;
            this.totalBalance = 0;
          }
          this.isLoading = false;
          this.noData = this.studentBalanceDataSource.connect().pipe(map((dataa) => dataa.length === 0));
        },
        (err) => {
          this.studentBalanceDataSource.data = [];
          this.dataCount = 0;
          this.totalCredit = 0;
          this.totalDebit = 0;
          this.totalBalance = 0;
          this.isLoading = false;
          this.noData = this.studentBalanceDataSource.connect().pipe(map((dataa) => dataa.length === 0));
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

  mappingTermStatus(data) {
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

    data.forEach((element) => {
      const term1 = [];
      const term2 = [];
      const term3 = [];
      const term4 = [];
      const term5 = [];
      const term6 = [];
      const term7 = [];
      const term8 = [];
      const term9 = [];
      const term10 = [];
      const term11 = [];
      const term12 = [];
      element.terms.forEach((terms, index) => {
        let termsMoment;
        if (terms?.term_payment_deferment?.date) {
          termsMoment = moment(terms.term_payment_deferment.date, 'DD/MM/YYYY');
        } else {
          termsMoment = moment(terms.term_payment.date, 'DD/MM/YYYY');
        }
        const checkMonthTerms = termsMoment.format('M');
        if (checkMonthTerms === isAugust && terms.term_amount !== 0) {
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          terms.terms_index = index + 1;
          element.terms_1 = terms;
          term1.push(terms);
        }
        if (checkMonthTerms === isSeptember && terms.term_amount !== 0) {
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          terms.terms_index = index + 1;
          element.terms_2 = terms;
          term2.push(terms);
        }
        if (checkMonthTerms === isOctober && terms.term_amount !== 0) {
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          terms.terms_index = index + 1;
          element.terms_3 = terms;
          term3.push(terms);
        }
        if (checkMonthTerms === isNovember && terms.term_amount !== 0) {
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          terms.terms_index = index + 1;
          element.terms_4 = terms;
          term4.push(terms);
        }
        if (checkMonthTerms === isDecember && terms.term_amount !== 0) {
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          terms.terms_index = index + 1;
          element.terms_5 = terms;
          term5.push(terms);
        }
        if (checkMonthTerms === isJanuary && terms.term_amount !== 0) {
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          terms.terms_index = index + 1;
          element.terms_6 = terms;
          term6.push(terms);
        }
        if (checkMonthTerms === isFebruary && terms.term_amount !== 0) {
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          terms.terms_index = index + 1;
          element.terms_7 = terms;
          term7.push(terms);
        }
        if (checkMonthTerms === isMarch && terms.term_amount !== 0) {
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          terms.terms_index = index + 1;
          element.terms_8 = terms;
          term8.push(terms);
        }
        if (checkMonthTerms === isApril && terms.term_amount !== 0) {
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          terms.terms_index = index + 1;
          element.terms_9 = terms;
          term9.push(terms);
        }
        if (checkMonthTerms === isMay && terms.term_amount !== 0) {
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          terms.terms_index = index + 1;
          element.terms_10 = terms;
          term10.push(terms);
        }
        if (checkMonthTerms === isJune && terms.term_amount !== 0) {
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          terms.terms_index = index + 1;
          element.terms_11 = terms;
          term11.push(terms);
        }
        if (checkMonthTerms === isJuly && terms.term_amount !== 0) {
          terms['term_amount_chargeback'] = terms['term_amount_chargeback'] ? terms['term_amount_chargeback'] : 0;
          terms['term_amount_not_authorised'] = terms['term_amount_not_authorised'] ? terms['term_amount_not_authorised'] : 0;
          terms['term_amount_pending'] = terms['term_amount_pending'] ? terms['term_amount_pending'] : 0;
          terms.terms_index = index + 1;
          element.terms_12 = terms;
          term12.push(terms);
        }
      });

      let totalDpDepositChargeback = 0
      if (element?.dp_histories?.length) {
        totalDpDepositChargeback = element.dp_histories.reduce((acc, history) => {
          if (history?.deposit_status === 'chargeback' && typeof history?.deposit_pay_amount === 'number') {
            return acc += history.deposit_pay_amount;
          }
        }, 0)
      }
      
      element.dp_deposit_chargeback = totalDpDepositChargeback;
      element.term_1 = term1;
      element.term_2 = term2;
      element.term_3 = term3;
      element.term_4 = term4;
      element.term_5 = term5;
      element.term_6 = term6;
      element.term_7 = term7;
      element.term_8 = term8;
      element.term_9 = term9;
      element.term_10 = term10;
      element.term_11 = term11;
      element.term_12 = term12;
    });
    if (data && data.length) {
      this.studentBilling = data.find((list) => !list.is_financial_support);
      this.financeBilling = data.find((list) => list.is_financial_support);
    }
    this.financeBilling = _.uniqBy(this.financeBilling, '_id');
    this.financeStatus.data = data;
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
        // const dummy = {
        //   _id: '60471cdee4bba1599f483ee7',
        //   term_payment: {
        //     date: '10/01/2021',
        //     time: '15:59',
        //   },
        //   term_payment_deferment: {
        //     date: '',
        //     time: '15:59',
        //   },
        //   is_partial: false,
        //   is_term_paid: false,
        //   term_amount: 790,
        //   term_pay_amount: 0,
        //   term_pay_date: null,
        // };
        const termsMoment = moment(terms.term_payment.date, 'DD/MM/YYYY');
        const checkMonthTerms = termsMoment.format('M');

        if (checkMonthTerms === isAugust && terms.term_amount !== 0) {
          data.terms_1 = terms;
          terms.terms_index = 0;
        }
        if (checkMonthTerms === isSeptember && terms.term_amount !== 0) {
          data.terms_2 = terms;
          terms.terms_index = 1;
        }
        if (checkMonthTerms === isOctober && terms.term_amount !== 0) {
          data.terms_3 = terms;
          terms.terms_index = 2;
        }
        if (checkMonthTerms === isNovember && terms.term_amount !== 0) {
          data.terms_4 = terms;
          terms.terms_index = 3;
        }
        if (checkMonthTerms === isDecember && terms.term_amount !== 0) {
          data.terms_5 = terms;
          terms.terms_index = 4;
        }
        if (checkMonthTerms === isJanuary && terms.term_amount !== 0) {
          data.terms_6 = terms;
          terms.terms_index = 5;
        }
        if (checkMonthTerms === isFebruary && terms.term_amount !== 0) {
          data.terms_7 = terms;
          terms.terms_index = 6;
        }
        if (checkMonthTerms === isMarch && terms.term_amount !== 0) {
          data.terms_8 = terms;
          terms.terms_index = 7;
        }
        if (checkMonthTerms === isApril && terms.term_amount !== 0) {
          data.terms_9 = terms;
          terms.terms_index = 8;
        }
        if (checkMonthTerms === isMay && terms.term_amount !== 0) {
          data.terms_10 = terms;
          terms.terms_index = 9;
        }
        if (checkMonthTerms === isJune && terms.term_amount !== 0) {
          data.terms_11 = terms;
          terms.terms_index = 10;
        }
        if (checkMonthTerms === isJuly && terms.term_amount !== 0) {
          data.terms_12 = terms;
          terms.terms_index = 11;
        }
      });
    }
    console.log('data', data);
    this.studentBilling = data;
    this.financeStatus.data = data;
  }

  mappingTermData(data) {
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

    if (data && data.terms && data.terms.length) {
      data.terms.forEach((terms) => {
        // const dummy = {
        //   _id: '60471cdee4bba1599f483ee7',
        //   term_payment: {
        //     date: '10/01/2021',
        //     time: '15:59',
        //   },
        //   term_payment_deferment: {
        //     date: '',
        //     time: '15:59',
        //   },
        //   is_partial: false,
        //   is_term_paid: false,
        //   term_amount: 790,
        //   term_pay_amount: 0,
        //   term_pay_date: null,
        // };
        const termsMoment = moment(terms.term_payment.date, 'DD/MM/YYYY');
        const checkMonthTerms = termsMoment.format('M');

        if (checkMonthTerms === isAugust && terms.term_amount !== 0) {
          data.terms_1 = terms;
          terms.terms_index = 0;
        }
        if (checkMonthTerms === isSeptember && terms.term_amount !== 0) {
          data.terms_2 = terms;
          terms.terms_index = 1;
        }
        if (checkMonthTerms === isOctober && terms.term_amount !== 0) {
          data.terms_3 = terms;
          terms.terms_index = 2;
        }
        if (checkMonthTerms === isNovember && terms.term_amount !== 0) {
          data.terms_4 = terms;
          terms.terms_index = 3;
        }
        if (checkMonthTerms === isDecember && terms.term_amount !== 0) {
          data.terms_5 = terms;
          terms.terms_index = 4;
        }
        if (checkMonthTerms === isJanuary && terms.term_amount !== 0) {
          data.terms_6 = terms;
          terms.terms_index = 5;
        }
        if (checkMonthTerms === isFebruary && terms.term_amount !== 0) {
          data.terms_7 = terms;
          terms.terms_index = 6;
        }
        if (checkMonthTerms === isMarch && terms.term_amount !== 0) {
          data.terms_8 = terms;
          terms.terms_index = 7;
        }
        if (checkMonthTerms === isApril && terms.term_amount !== 0) {
          data.terms_9 = terms;
          terms.terms_index = 8;
        }
        if (checkMonthTerms === isMay && terms.term_amount !== 0) {
          data.terms_10 = terms;
          terms.terms_index = 9;
        }
        if (checkMonthTerms === isJune && terms.term_amount !== 0) {
          data.terms_11 = terms;
          terms.terms_index = 10;
        }
        if (checkMonthTerms === isJuly && terms.term_amount !== 0) {
          data.terms_12 = terms;
          terms.terms_index = 11;
        }
      });
    }
    console.log('data if financement', data);
    this.financeStatus.data = data;
  }

  checkIsNumber(num) {
    let allow = false;
    if (Number.isInteger(num)) {
      allow = true;
    }
    console.log('Term Amount Value', num, allow);
    return allow;
  }

  parseIndex(index) {
    return parseInt(index);
  }
  getDataPayment(histories) {
    this.totalCredit = 0;
    this.totalDebit = 0;
    this.totalBalance = 0;
    console.log('_his', histories);
    if (histories?.length) {
      histories.forEach((element) => {
        this.totalCredit += parseFloat(element?.credit?.toFixed(2));
        this.totalDebit += parseFloat(element?.debit?.toFixed(2));
      });
    }
    this.totalBalance = parseFloat((this.totalCredit - this.totalDebit).toFixed(2));
  }
  resetTable() {
    this.getCandidatesHistoryData();
    this.getDataBilling();
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
    this.subs.sink = this.financeService.GetOneCandidate(this.candidateId).subscribe(
      (histories) => {
        if (histories) {
          this.mappingTermDats(histories);
          if (histories.billing_id && histories.billing_id.financial_profile) {
            this.financeFilter.setValue(histories.billing_id.financial_profile);
          }
          if (
            histories &&
            histories.type_of_formation_id &&
            histories.type_of_formation_id.type_of_formation &&
            histories.type_of_formation_id.type_of_formation !== 'classic'
          ) {
            this.isFC = true;
            this.getCandidateOrganization();
            this.getOneFinanceOrganization();
          } else {
            this.isFC = false;
          }
        }
      },
      (err) => {
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

  getOneFinanceOrganization() {
    const filter = {
      candidate_id: this.candidateId,
      intake_channel: this.scholarSeasonData.intake_channel ? this.scholarSeasonData.intake_channel._id : '',
    };
    this.billingPlusFInancement = [];
    this.subs.sink = this.financeService.GetOneFinanceOrganization(filter).subscribe(
      (billingId) => {
        if (billingId) {
          const financement = _.cloneDeep(billingId);
          this.checkBilledTerm(_.cloneDeep(billingId));
          this.billingPlusFInancement = [...this.billingData, ...financement];
          this.mappingTermStatus(this.billingPlusFInancement);
          this.checkBilledTerm(_.cloneDeep(this.billingPlusFInancement));
        }
        this.financeStatusLoading = false;
      },
      (err) => {
        this.financeStatusLoading = false;
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

  formatDecimal(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
    }
    return num;
  }

  formatCurrency(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
      // num = num.toString().slice(0, -3);
    }
    return num;
  }

  formatCurrencyHistory(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
    }
    return num;
  }

  formatCurrencyDecimal(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
    }
    return num;
  }

  formatCurrencyBalance(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
      num = num;
    }
    return num;
  }

  formatNonDecimal(data) {
    let num: any = '';
    if (data) {
      num = Math.round(data);
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
      dates = moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
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

  avoirDialog() {
    this.subs.sink = this.dialog
      .open(StudentAvoirDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          dropdown: this.isFC ? this.billingPlusFInancement : this.billingData,
          isFC: this.isFC,
          candidate_id: this.candidateId,
          isUpdate: false,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.resetTable();
        }
      });
  }

  odDialog() {
    const dataDialog = this.isFC ? this.billingPlusFInancement : this.billingData;
    this.subs.sink = this.dialog
      .open(AddDiverseOperationDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          dropdown: dataDialog,
          candidate_id: this.candidateId,
          intake_channel_id: this.scholarSeasonData.intake_channel ? this.scholarSeasonData.intake_channel._id : '',
          financement: this.showFinancement,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.resetTable();
        }
      });
  }

  updateOD(data) {
    const dataDialog = this.isFC ? this.billingPlusFInancement : this.billingData;
    this.subs.sink = this.dialog
      .open(AddDiverseOperationDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          ...data,
          isUpdate: true,
          dropdown: dataDialog,
          candidate_id: this.candidateId,
          intake_channel_id: this.scholarSeasonData.intake_channel ? this.scholarSeasonData.intake_channel._id : '',
          financement: this.showFinancement,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.resetTable();
        }
      });
  }

  deleteOD(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('DELETE_ITEM_TEMPLATE.TITLE'),
      html: this.translate.instant('CONFIRMDELETE', {
        value: data.operation_name
          ? this.translate.instant('OPERATION_NAME.' + data.operation_name, {
              studentProgram: this.displayProgram(data.candidate_id),
            })
          : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`,
      cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.isWaitingForResponse = true;
        if (data.od_type === 'cash_transfer') {
          this.subs.sink = this.financeService.removeODCashTransfer(data._id).subscribe(
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
                this.resetTable();
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
        } else if (data.od_type === 'student_balance_adjustment') {
          if (this.showFinancement && data?.finance_organization_id?._id) {
            this.subs.sink = this.financeService.removeStudentBalanceAdjustementFinanceOrganization(data?._id).subscribe(
              (resp) => {
                this.isWaitingForResponse = false;
                this.swalSuccesRemoveOD();
              },
              (err) => {
                this.isWaitingForResponse = false;
                this.swalErrorRemoveOD(err);
              },
            );
          } else {
            this.subs.sink = this.financeService.removeStudentBalanceAdjustement(data._id).subscribe(
              (resp) => {
                this.isWaitingForResponse = false;
                this.swalSuccesRemoveOD();
              },
              (err) => {
                this.isWaitingForResponse = false;
                this.swalErrorRemoveOD(err);
              },
            );
          }
        }
      }
    });
  }

  swalSuccesRemoveOD() {
    Swal.fire({
      type: 'success',
      title: this.translate.instant('Bravo!'),
      confirmButtonText: this.translate.instant('OK'),
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then(() => {
      this.resetTable();
    });
  }

  swalErrorRemoveOD(err) {
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
  }

  deletePaid(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('DELETE_ITEM_TEMPLATE.TITLE'),
      html: this.translate.instant('CONFIRMDELETE', {
        value:
          data.operation_name === 'payment_of_term'
            ? this.translate.instant('OPERATION_NAME.' + data.operation_name, {
                studentProgram: this.displayProgram(data.candidate_id),
              }) +
              ' ' +
              this.parseTermIndexToNumber(data.term_index)
            : data.operation_name,
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`,
      cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.isWaitingForResponse = true;

        this.subs.sink = this.financeService.deletePayment(data?._id).subscribe(
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
              this.resetTable();
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

  decaissementDialog() {
    this.subs.sink = this.dialog
      .open(StudentDecaissementDialogComponent, {
        width: '700px',
        minHeight: '100px',
        disableClose: true,
        data: {
          dropdown: this.isFC ? this.billingPlusFInancement : this.billingData,
          isFC: this.isFC,
          candidate_id: this.candidateId,
          isUpdate: false,
          financement: this.showFinancement,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.resetTable();
        }
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
    // const found = moment().endOf('month').isAfter(moment(planned, 'DD/MM/YYYY'));
    const lastPlanMonth = moment(planned, 'DD/MM/YYYY').endOf('month');
    const lastCurrentMonth = moment().endOf('month');
    const found = lastCurrentMonth.isAfter(moment(lastPlanMonth, 'DD/MM/YYYY'));
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
          (this.studentBilling && this.studentBilling.civility && this.studentBilling.civility !== 'neutral'
            ? this.translate.instant(this.studentBilling.civility) + ' '
            : '') +
          this.studentBilling?.first_name +
          ' ' +
          this.studentBilling?.last_name,
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
        this.subs.sink = this.financeService.UpdateBilling(payload, this.studentBilling?.billing_id?._id).subscribe(
          (list) => {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: this.translate.instant('OK'),
            });
          },
          (err) => {
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
    });
  }

  getDate(element) {
    let dates;
    if (
      element &&
      element?.billing_id &&
      element?.billing_id?.terms &&
      element?.billing_id?.terms?.length &&
      element?.term_index &&
      element?.billing_id?.terms[parseInt(element?.term_index)]
    ) {
      if (element?.billing_id?.terms[parseInt(element?.term_index)]?.term_payment_deferment?.date) {
        dates = element?.billing_id?.terms[parseInt(element?.term_index)]?.term_payment_deferment?.date;
      } else {
        dates = element?.billing_id?.terms[parseInt(element?.term_index)]?.term_payment?.date;
      }
    }
    return dates;
  }

  getAmount(element) {
    let amount;
    if (
      element &&
      element &&
      element.billing_id &&
      element.billing_id.terms &&
      element.billing_id.terms.length &&
      element.term_index &&
      element?.billing_id.terms[parseInt(element.term_index)]
    ) {
      amount = element?.billing_id.terms[parseInt(element.term_index)].term_amount;
    }
    return amount;
  }

  checkHasFullDiscount(element) {
    if (
      element &&
      element.registration_profile &&
      element.registration_profile.discount_on_full_rate &&
      element.registration_profile.discount_on_full_rate === 100
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkHasNoDP(element) {
    if (
      element &&
      element.registration_profile &&
      element.registration_profile.is_down_payment &&
      element.registration_profile.is_down_payment === 'no'
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkHasNoAddtionalCost(element) {
    if (element && element.selected_payment_plan && element.selected_payment_plan.additional_expense === 0) {
      return true;
    } else {
      return false;
    }
  }

  checkNoPayment(element) {
    if (this.checkHasFullDiscount(element) && this.checkHasNoAddtionalCost(element) && this.checkHasNoDP(element)) {
      return true;
    } else {
      return false;
    }
  }

  checkPartiallyTerms(element) {
    // check if partial or not
    if (element && element.is_partial) {
      // make sure term_pay_date and term_payment has value because we need to check if element.term_payment if after element.term_pay_date
      if (element.term_pay_date && element.term_payment) {
        const paidDate = moment(element.term_pay_date.date, 'DD/MM/YYYY').endOf('month');
        const dueDate = moment(element.term_payment.date, 'DD/MM/YYYY').endOf('month');
        const isLate = paidDate.isAfter(moment(dueDate, 'DD/MM/YYYY'));
        if (isLate) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  checkIfCandidateTransferHasAmountPaid(amount_paid) {
    // to check if candidate has amount paid after transfer
    if (amount_paid !== '') {
      return true;
    } else {
      return false;
    }
  }

  checkIfCandidateTransferHasDP(downPayment) {
    // to check if candidate has deposit pay amount after transfer
    if (downPayment > 0) {
      return true;
    } else {
      return false;
    }
  }

  renderTransactionText(element) {
    const word = this.translate.instant(element.transaction.slice(0, 12));
    const number = element.transaction.slice(12);
    return word + number;
  }

  downloadInvoice() {
    this.isWaitingForResponse = true;
    const url = environment.apiUrl.replace('/graphql', '');
    const today = new Date();
    const currentDate = moment(today, 'DD/MM/YYYY').format('DDMMYYYY');
    const currentTime = moment(today).format('HH:mm');
    const fullURL = `${url}/downloadStudentInvoice/${this.candidateId}/${this.translate.currentLang}/${this.scholarSeasonData.intake_channel.scholar_season_id._id}/${this.scholarSeasonData.intake_channel._id}?date=${currentDate}&time=${currentTime}`;
    this.httpClient.get(fullURL, { responseType: 'text' }).subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          const serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
          const element = document.createElement('a');
          element.href = `${serverimgPath}${resp}?date=${currentDate}&time=${currentTime}&download=true`;
          element.download = 'Invoice Student';
          element.click();
          element.remove();
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
      },
    );
  }

  actionTrigger(item: string) {
    switch (item) {
      case 'billing':
        setTimeout(() => {
          this.addManualBilling();
        }, 500);
        break;
      case 'payment_line':
        setTimeout(() => {
          this.addPaymentLine();
        }, 500);
        break;
      case 'avoir/discount':
        setTimeout(() => {
          this.avoirDialog();
        }, 500);
        break;
      case 'refund':
        setTimeout(() => {
          this.decaissementDialog();
        }, 500);
        break;
      case 'od':
        setTimeout(() => {
          this.odDialog();
        }, 500);
        break;
      default:
        break;
    }
  }

  addManualBilling() {
    let orderPayeurList = this.mappingOrderPayer();
    // new get component
    if (this.isCompanyDoesntHaveTemplate || this.isOrganizationDoesntHaveTemplate) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Add_Billing_Line_S1.TITLE'),
        text: this.translate.instant('Add_Billing_Line_S1.TEXT'),
        confirmButtonText: this.translate.instant('Add_Billing_Line_S1.BUTTON'),
        showCancelButton: false,
        allowOutsideClick: false,
      });
    } else {
      this.subs.sink = this.dialog
        .open(AddBillingDialogComponent, {
          width: '600px',
          minHeight: '100px',
          disableClose: true,
          data: {
            dropdown: orderPayeurList,
          },
        })
        .afterClosed()
        .subscribe((res) => {
          if (res) {
            this.resetTable();
          }
        });
    }
  }

  mappingOrderPayer() {
    let orderPayeurList = [];
    const data = this.isFC ? this.billingPlusFInancement : this.billingData;

    const dataStudent = _.filter(data, { is_financial_support: false });
    const dataFincialSupport = _.filter(data, { is_financial_support: true });
    const dataFinacementOrganization = _.filter(data, 'organization_id');
    const dataFinacementCompany = _.filter(data, 'company_branch_id');

    if (dataStudent?.length > 0) {
      dataStudent.forEach((item) => {
        orderPayeurList.push(item);
      });
    }

    if (dataFincialSupport?.length > 0) {
      dataFincialSupport.forEach((item) => {
        orderPayeurList.push(item);
      });
    }

    if (dataFinacementOrganization?.length > 0) {
      dataFinacementOrganization.forEach((item) => {
        orderPayeurList.push(item);
      });

      this.isOrganizationDoesntHaveTemplate = dataFinacementOrganization.some(
        (resp) => !resp?.timeline_template_id && !resp?.terms?.length,
      );
    }

    if (dataFinacementCompany?.length > 0) {
      dataFinacementCompany.forEach((item) => {
        orderPayeurList.push(item);
      });

      this.isCompanyDoesntHaveTemplate = dataFinacementCompany.some((resp) => !resp?.timeline_template_id && !resp?.terms?.length);
    }

    return orderPayeurList;
  }

  updateManualBilling(data) {
    let orderPayeurList = this.mappingOrderPayer();

    this.subs.sink = this.dialog
      .open(AddBillingDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          ...data,
          billing_id: data?.finance_organization_id ? data?.finance_organization_id?._id : data?.billing_id?._id,
          isUpdate: true,
          dropdown: orderPayeurList,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.resetTable();
        }
      });
  }

  deleteManualBilling(data) {
    let timeDisabled = 3;
    let operationName = '';
    const operationNameReplace = this.displayOperationName(data?.operation_name);

    if (data?.operation_name.includes('scholarship_fees')) {
      operationName = operationNameReplace;
    } else {
      operationName = this.translate.instant('OPERATION_NAME.' + data?.operation_name);
    }

    Swal.fire({
      title: this.translate.instant('DELETE_ITEM_TEMPLATE.TITLE'),
      html: this.translate.instant('CONFIRMDELETE', {
        value: data?.operation_name
          ? this.translate.instant(operationName, {
              studentProgram: this.displayProgram(data.candidate_id),
            })
          : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`,
      cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.isWaitingForResponse = true;
        if (!data?.finance_organization_id) {
          this.subs.sink = this.financeService.deleteManualBilling(data._id).subscribe(
            (resp) => {
              this.isWaitingForResponse = false;
              this.swalSuccessDeleteManualBilling();
            },
            (err) => {
              this.isWaitingForResponse = false;
              this.swalErrorDeleteManualBilling(err);
            },
          );
        } else {
          this.subs.sink = this.financeService.deleteManualBillingFinanceOrganization(data._id).subscribe(
            (resp) => {
              this.isWaitingForResponse = false;
              this.swalSuccessDeleteManualBilling();
            },
            (err) => {
              this.isWaitingForResponse = false;
              this.swalErrorDeleteManualBilling(err);
            },
          );
        }
      }
    });
  }

  removePayment(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('DELETE_ITEM_TEMPLATE.TITLE'),
      html: this.translate.instant('CONFIRMDELETE', {
        value: data.operation_name
          ? this.translate.instant('OPERATION_NAME.' + data.operation_name, {
              studentProgram: this.displayProgram(data.candidate_id),
            }) +
            ' ' +
            this.parseTermIndexToNumber(data?.term_index_display)
          : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('THUMBSUP.SWEET_ALERT.CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.isWaitingForResponse = true;
        this.subs.sink = this.financeService.deletePayment(data?._id).subscribe(
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
              this.resetTable();
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
            } else if (
              err &&
              err['message'] &&
              err['message'].includes('Cannot delete manual payment line because already paid / pending')
            ) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                html: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
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

  swalSuccessDeleteManualBilling() {
    Swal.fire({
      type: 'success',
      title: this.translate.instant('Bravo!'),
      confirmButtonText: this.translate.instant('OK'),
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then(() => {
      this.resetTable();
    });
  }

  swalErrorDeleteManualBilling(err) {
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
  }

  displayDeleteManualPaymentSwal(data) {
    // if operation name null
    if (!data.operation_name) {
      return '';
    }
    // if operation regulation payment
    if (data.operation_name === 'regulation_payment') {
      return (
        this.translate.instant('OPERATION_NAME.payment_of_term', {
          studentProgram: this.displayProgram(data.candidate_id),
        }) +
        ' ' +
        this.parseTermIndexToNumber(data?.term_index) +
        ' - ' +
        this.translate.instant('Regulation')
      );
    } else {
      return (
        this.translate.instant('OPERATION_NAME.' + data.operation_name, {
          studentProgram: this.displayProgram(data.candidate_id),
        }) +
        ' ' +
        this.parseTermIndexToNumber(data?.term_index)
      );
    }
  }

  deleteManualPayment(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('DELETE_ITEM_TEMPLATE.TITLE'),
      html: this.translate.instant('CONFIRMDELETE', {
        value: this.displayDeleteManualPaymentSwal(data),
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`,
      cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.isWaitingForResponse = true;
        if (!data?.finance_organization_id) {
          this.subs.sink = this.financeService.deleteManualPayment(data?._id).subscribe(
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
                this.resetTable();
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
        } else {
          this.subs.sink = this.financeService.deleteManualPaymentFinanceOrganization(data?._id).subscribe(
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
                this.resetTable();
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
      }
    });
  }

  deleteAutomaticPaidPayment(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('DELETE_ITEM_TEMPLATE.TITLE'),
      html: this.translate.instant('CONFIRMDELETE', {
        value: this.displayDeleteManualPaymentSwal(data),
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`,
      cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.isWaitingForResponse = true;
        if (!data?.finance_organization_id) {
          this.subs.sink = this.financeService.deleteAutomaticPayment(data?._id).subscribe(
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
                this.resetTable();
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
        } else {
          this.subs.sink = this.financeService.deleteManualPaymentFinanceOrganization(data?._id).subscribe(
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
                this.resetTable();
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
      }
    });
  }

  deleteManualRefund(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('DELETE_ITEM_TEMPLATE.TITLE'),
      html: this.translate.instant('CONFIRMDELETE', {
        value: data.operation_name
          ? this.translate.instant('OPERATION_NAME.' + data.operation_name, {
              studentProgram: this.displayProgram(data.candidate_id),
            })
          : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`,
      cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      const payload = {
        master_transaction_id: data?._id,
      };
      if (res.value) {
        this.isWaitingForResponse = true;
        if (this.showFinancement && data?.finance_organization_id?._id) {
          this.subs.sink = this.financeService.deleteManualRefundFinanceOrganization(payload).subscribe(
            (resp) => {
              this.isWaitingForResponse = false;
              this.deleteSwalRefundSuccess();
            },
            (err) => {
              this.isWaitingForResponse = false;
              this.deleteSwalRefundError(err);
            },
          );
        } else {
          this.subs.sink = this.financeService.deleteManualRefund(payload).subscribe(
            (resp) => {
              this.isWaitingForResponse = false;
              this.deleteSwalRefundSuccess();
            },
            (err) => {
              this.isWaitingForResponse = false;
              this.deleteSwalRefundError(err);
            },
          );
        }
      }
    });
  }

  deleteSwalRefundError(err) {
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
  }

  deleteSwalRefundSuccess() {
    Swal.fire({
      type: 'success',
      title: this.translate.instant('Bravo!'),
      confirmButtonText: this.translate.instant('OK'),
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then(() => {
      this.resetTable();
    });
  }

  deleteManualAvoir(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('DELETE_ITEM_TEMPLATE.TITLE'),
      html: this.translate.instant('CONFIRMDELETE', {
        value: data.operation_name
          ? `${this.translate.instant('OPERATION_NAME.avoir_scholarship_fees')} ${this.displayProgram(data.candidate_id)}`
          : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`,
      cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.isWaitingForResponse = true;
        if (!data?.finance_organization_id) {
          this.subs.sink = this.financeService.deleteManualAvoir(data?._id).subscribe(
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
                this.resetTable();
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
        } else {
          this.subs.sink = this.financeService.deleteManualAvoirFinanceOrganization(data?._id).subscribe(
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
                this.resetTable();
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
      }
    });
  }

  addPaymentLine() {
    const dataDialog = this.isFC ? this.billingPlusFInancement : this.billingData;
    this.subs.sink = this.dialog
      .open(AddManualPaymentDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          dropdown: dataDialog,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.resetTable();
        }
      });
  }

  updatePaymentLine(data) {
    const dataDialog = this.isFC ? this.billingPlusFInancement : this.billingData;
    this.subs.sink = this.dialog
      .open(AddManualPaymentDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          ...data,
          billing_id: data?.finance_organization_id ? data?.finance_organization_id?._id : data?.billing_id?._id,
          isFinancement: data?.finance_organization_id ? true : false,
          isUpdate: true,
          dropdown: dataDialog,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.resetTable();
        }
      });
  }

  updateRefund(data) {
    const dataDialog = this.isFC ? this.billingPlusFInancement : this.billingData;
    this.subs.sink = this.dialog
      .open(StudentDecaissementDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          ...data,
          candidateId: this.candidateId,
          billing_id: data?.billing_id?._id,
          isUpdate: true,
          dropdown: dataDialog,
          isFC: this.isFC,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.resetTable();
        }
      });
  }

  openOperationNoteDialog(data) {
    this.subs.sink = this.dialog
      .open(OperationNoteDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {
        // code...
      });
  }

  onOpenTransaction(data) {
    const urls = this.router.createUrlTree(['transaction-report'], { queryParams: { studentNumber: data } });
    window.open(urls.toString(), '_blank');
  }

  updateManualOperation(data) {
    if (this.checkManualBilling(data?.operation_name)) {
      this.updateManualBilling(data);
    } else if (this.checkManualPayment(data)) {
      this.updatePaymentLine(data);
    } else if (this.checkManualRefund(data?.operation_name)) {
      this.updateRefund(data);
    } else if (this.checkOD(data?.operation_name)) {
      this.updateOD(data);
    }
  }

  deleteManualOperation(data) {
    if (this.checkIsPaid(data)) {
      this.deletePaid(data);
    } else if (this.checkManualAvoir(data?.operation_name)) {
      this.deleteManualAvoir(data);
    } else if (this.checkManualBilling(data?.operation_name)) {
      this.deleteManualBilling(data);
    } else if (this.checkManualPayment(data)) {
      this.deleteManualPayment(data);
    } else if (this.checkAutomaticPaidPayment(data)) {
      this.deleteAutomaticPaidPayment(data);
    } else if (this.checkManualRefund(data?.operation_name)) {
      this.deleteManualRefund(data);
    } else if (this.checkOD(data?.operation_name)) {
      this.deleteOD(data);
    }
  }

  checkManualOperation(data) {
    return (
      this.checkManualBilling(data) ||
      this.checkManualPayment(data) ||
      this.checkOD(data) ||
      this.checkManualRefund(data) ||
      this.checkManualAvoir(data)
    );
  }

  checkManualEditAvoid(data) {
    return !this.checkManualAvoir(data);
  }

  checkManualBilling(data) {
    if (
      data.includes('scholarship_fees') ||
      data === 'social_security' ||
      data === 'schedule_fees' ||
      data === 'administrative_charges' ||
      data === 'additional_costs_rejection' ||
      data === 'additional_costs_formal_notice' ||
      data === 'additional_costs_litigation' ||
      data === 'additional_costs_international_transfer'
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkManualPayment(data) {
    return (data?.operation_name === 'payment_of_term' || data?.operation_name === 'regulation_payment') && data?.is_manual_action;
  }

  checkAutomaticPaidPayment(data) {
    return (
      (data?.operation_name === 'payment_of_term' || data?.operation_name === 'regulation_payment') &&
      !data?.is_manual_action &&
      data?.status_line_dp_term === 'paid'
    );
  }

  checkAutomaticNotPaidPayment(data) {
    return (
      (data?.operation_name === 'payment_of_term' || data?.operation_name === 'regulation_payment') &&
      !data?.is_manual_action &&
      data?.status_line_dp_term !== 'paid'
    );
  }

  checkOD(data) {
    return data === 'cash_transfer' || data === 'student_balance_adjustment';
  }

  checkIsPaid(data) {
    return (
      data?.term_status === 'paid' &&
      !data?.is_cancelled &&
      data?.export_status === 'not_exported' &&
      !data?.transaction_id &&
      (data?.nature === 'transfer' || data?.nature === '') &&
      data?.operation_name !== 'billing_of_term' &&
      data?.nature !== 'Avoir'
    );
  }

  checkManualRefund(data) {
    return data === 'refund';
  }

  checkManualAvoir(data) {
    if (data.includes('avoir_scholarship_fees')) {
      return true;
    } else {
      return this.operationNameListAvoir.some((res) => data === res);
    }
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

  displayOperationName(data) {
    if (data) {
      if (data?.includes('scholarship_fees')) {
        if (data?.includes('avoir_scholarship_fees')) {
          return data.replace('avoir_scholarship_fees', this.translate.instant('OPERATION_NAME.avoir_scholarship_fees'));
        } else if (data?.includes('avoir_of_scholarship_fees')) {
          return data?.replace('avoir_of_scholarship_fees', this.translate.instant('OPERATION_NAME.avoir_of_scholarship_fees'));
        } else {
          return data?.replace('scholarship_fees', this.translate.instant('OPERATION_NAME.scholarship_fees'));
        }
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
    return '';
  }

  viewTermDetail(term, month) {
    this.subs.sink = this.dialog
      .open(MonthTermDetailsDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          terms: term,
          month: month,
          masterTransactionData: this.studentBalanceDataSource.data,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        // code...
      });
  }

  getDPDetail(id) {
    this.subs.sink = this.dialog
      .open(DpRegulationDialogComponent, {
        width: '800px',
        disableClose: true,
        data: {
          billing_id: id,
        },
      })
      .afterClosed()
      .subscribe((result) => {});
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    this.subs.unsubscribe();
  }

  checkIfTermHaveChargebackAndHaveDifferentStatus(termData: any) {
    if(termData?.length === 1) {
      const tempTermData = termData[0];
      if((tempTermData?.term_status === 'partially_paid' && tempTermData?.term_amount_chargeback) || (tempTermData?.term_amount_chargeback && (tempTermData?.term_amount_chargeback !== tempTermData?.term_pay_amount))) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  displayStatusTermColor(element) {
    let status_term = '';
    if (element?.flux !== 'billing') {
      if (element?.payment_date && element?.status_line_dp_term === 'paid') {
        status_term = 'green';
      } else if (element?.status_line_dp_term === 'pending') {
        status_term = 'orange';
      } else if (element?.status_line_dp_term === 'not_authorised') {
        status_term = 'red';
      } else if (element?.status_line_dp_term === 'chargeback') {
        status_term = 'purple';
      } else if (element?.status_line_dp_term === 'billed') {
        status_term = 'blue';
      }
    }
    return status_term;
  }

  displayStatusTermTooltip(element) {
    let status_term = '-';
    if (element?.flux !== 'billing') {
      if (element?.payment_date && element?.status_line_dp_term === 'paid') {
        status_term = this.translate.instant('Paid');
      } else if (element?.status_line_dp_term === 'pending') {
        status_term = this.translate.instant('Pending');
      } else if (element?.status_line_dp_term === 'not_authorised') {
        status_term = this.translate.instant('Refused');
      } else if (element?.status_line_dp_term === 'chargeback') {
        status_term = this.translate.instant('Chargeback');
      } else if (element?.status_line_dp_term === 'billed') {
        status_term = this.translate.instant('Generated');
      }
    }
    return status_term;
  }

  removeOverpaid(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('DELETE_ITEM_TEMPLATE.TITLE'),
      html: this.translate.instant('CONFIRMDELETE', {
        value: data.operation_name
          ? this.translate.instant('OPERATION_NAME.' + data.operation_name, {
              studentProgram: this.displayProgram(data.candidate_id),
            }) +
            ' ' +
            this.parseTermIndexToNumber(data?.term_index_display)
          : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('THUMBSUP.SWEET_ALERT.CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.isWaitingForResponse = true;
        this.subs.sink = this.financeService.deleteAutomaticPayment(data?._id).subscribe(
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
              this.resetTable();
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
