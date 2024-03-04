import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
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
import { ActivatedRoute } from '@angular/router';
import { StudentsService } from 'app/service/students/students.service';
import { SchoolService } from 'app/service/schools/school.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { HttpClient } from '@angular/common/http';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { ApplicationUrls } from 'app/shared/settings';
import Swal from 'sweetalert2';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import { ChequeEditDialogComponent } from '../cheque-edit-dialog/cheque-edit-dialog.component';
import { CoreService } from 'app/service/core/core.service';

@Component({
  selector: 'ms-cheque-to-bank',
  templateUrl: './cheque-to-bank.component.html',
  styleUrls: ['./cheque-to-bank.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseStringDatePipe],
})
export class ChequeToBankComponent implements OnInit, OnDestroy, AfterViewChecked {
  private subs = new SubSink();
  @Input() schoolId: string;
  @Input() selectedRncpTitleId: string;
  @Input() selectedClassId: string;
  importForm: UntypedFormGroup;
  importDummyForm: UntypedFormGroup;
  @ViewChild('importFile', { static: false }) importFile: any;
  path: string;
  fileName: string;
  file: any;
  fileType: any;
  currentIndex = -1;
  templateCSVDownloadName = 'comma';
  currentUser: any;
  server = ApplicationUrls.baseApi;
  isAcadir = false;
  isClose = false;
  isWaitingForResponse = false;
  campusList = [];
  listObjective = [];
  titles = [];
  classes = [];
  levels = [];
  scholars = [];
  school = [];
  currencyList = [];
  letterList = ['Term 1 - 03/12/2020 - 321 €'];
  studentList = ['Mrs Ole Spinka'];

  bank = [
    'BNP Paribas',
    'Credit Agricole',
    'BPCE',
    'Societe Generale',
    'Groupe Crédit Mutuel',
    'Crédit Cooperatif',
    'La Banque Postale',
    'Crédit du Nord',
    'AXA Banque',
    'Banque Palatine',
    'HSBC France',
    'CIC Banque Transatlantique',
    'BRED Banque Populaire',
  ];

  private intVal: any;
  private timeOutVal: any;
  isDelimeterOn = false;
  isLevelOn = false;
  isSchoolOn = false;
  isCampusOn = false;
  isDirectorAdmission = false;
  isMemberAdmission = false;
  templateDonwloaded = false;
  generalDepositPaid = false;
  dummyData = [];
  termsList = [];
  financialList = [];
  originalTermsList = [];
  originalFinancialList = [];
  studentArrayList: any[][] = [];
  financialArrayList: any[][] = [];
  termArrayList: any[][] = [];
  dataEntity: any;
  dataBilling: any;
  mappingBilling: any;
  originalMappingBilling: any;
  originalMapping: any;
  tutorialIcon = '../../assets/img/tutorial.png';
  constructor(
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private studentService: StudentsService,
    private schoolService: SchoolService,
    private titleService: RNCPTitlesService,
    private translate: TranslateService,
    private userService: AuthService,
    private httpClient: HttpClient,
    private fileUploadService: FileUploadService,
    private candidateService: CandidatesService,
    private pageTitleService: PageTitleService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private financeService: FinancesService,
    private permissionsService: NgxPermissionsService,
    private acadJourneyService: AcademicJourneyService,
    public coreService: CoreService,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.initBankCheque();
    this.currentUser = this.userService.getLocalStorageUser();
    this.dataIsChanged();
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe((list: any[]) => {
      this.currencyList = list;
    });
    this.subs.sink = this.financeService.dataChequeEnitty.subscribe((val) => {
      if (val) {
        this.dataEntity = val;
      }
    });
    this.subs.sink = this.financeService.dataBilling.subscribe((val) => {
      if (val) {
        this.dataBilling = val;
        this.getDataBilling();
      }
    });
    this.getDataBilling();
    this.subs.sink = this.financeService.dataCheque.subscribe((val: any) => {
      if (val) {
        this.dummyData = val;
        if (this.dummyData && this.dummyData.length) {
          this.initBankCheque();
          this.dummyData.forEach((element) => {
            this.arrayCheque.push(this.initImportForm());
          });
          // console.log('this.data service', this.dummyData);
          this.importForm.get('cheque_bank').patchValue(this.dummyData);
        }
      }
    });
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      if (this.dataBilling && this.dataBilling.length) {
        this.mappingBilling = this.dataBilling.map((temp) => {
          return {
            student_name:
              temp.candidate_id.last_name +
              ' ' +
              temp.candidate_id.first_name +
              ' ' +
              (temp.candidate_id.civility
                ? temp.candidate_id.civility === 'neutral'
                  ? ''
                  : this.translate.instant(temp.candidate_id.civility)
                : '') +
              ' ' +
              temp.intake_channel,
            account_number: temp.account_number,
            terms: temp.terms,
            deposit: temp.deposit,
            is_deposit_completed: temp.is_deposit_completed,
            financial_supports: temp.financial_supports,
            billing_id: temp._id,
            student_id: temp.candidate_id._id,
          };
        });
        this.dataBilling.forEach((element) => {
          if (element.financial_supports && element.financial_supports.length) {
            element.financial_supports.forEach((finance) => {
              const data = {
                finance:
                  finance.family_name +
                  ' ' +
                  finance.name +
                  ' ' +
                  (finance.civility ? (finance.civility === 'neutral' ? '' : this.translate.instant(finance.civility)) : '') +
                  ' (' +
                  this.translate.instant('CARDDETAIL.RELATION.' + finance.relation) +
                  ')',
                student_name:
                  element.candidate_id.last_name +
                  ' ' +
                  element.candidate_id.first_name +
                  ' ' +
                  (element.candidate_id.civility
                    ? element.candidate_id.civility === 'neutral'
                      ? ''
                      : this.translate.instant(element.candidate_id.civility)
                    : '') +
                  ' ' +
                  element.intake_channel,
                account_number: element.account_number,
                terms: element.terms,
                deposit: element.deposit,
                is_deposit_completed: element.is_deposit_completed,
                billing_id: element._id,
                student_id: element.candidate_id._id,
              };
              this.financialList.push(data);
            });
          }
        });
      }
    });
  }
  onWheel(event: Event) {
    event?.preventDefault();
  }
  selectStudent() {
    const account = this.importForm.get('student_account').value;
    if (account && this.originalMappingBilling && this.originalMappingBilling.length) {
      const filterAccount = this.originalMappingBilling.filter((list) =>
        list.account_number.toLowerCase().trim().includes(account.toLowerCase()),
      );
      if (filterAccount && filterAccount.length) {
        this.importForm.get('billing_id').setValue(filterAccount[0].billing_id);
        this.importForm.get('student_id').setValue(filterAccount[0].candidate_id);
        this.importForm.get('student').setValue(filterAccount[0].student_name);
        if (filterAccount[0].terms && filterAccount[0].terms.length) {
          filterAccount[0].terms.forEach((element, index) => {
            element.term = index + 1;
          });
          this.termsList = filterAccount[0].terms.filter(
            (list) => (list.is_term_paid === false || list.term_amount !== list.term_pay_amount) && list.term_amount !== 0,
          );
          this.termsList = this.termsList.sort((a, b) => {
            return moment.utc(a.term_payment_deferment).diff(moment.utc(b.term_payment_deferment));
          });
          this.termsList = this.termsList.map((list) => {
            return {
              name:
                this.translate.instant('terms') +
                ' ' +
                list.term +
                ' ' +
                (list.term_payment.date ? ' - ' + list.term_payment.date : '') +
                ' ' +
                (list.term_amount - list.term_pay_amount <= 0 ? ' ' : ' - ' + (list.term_amount - list.term_pay_amount) + ' €'),
              term_amount: list.term_amount,
              term_index: list.term,
              term_type: 'term',
              term_payment: {
                date: list.term_payment.date,
                time: list.term_payment.time,
              },
            };
          });
          // console.log(this.termsList);
        } else {
          this.termsList = [];
        }
        if (filterAccount[0] && filterAccount[0].is_deposit_completed) {
          this.generalDepositPaid = true;
        } else {
          const dp = {
            name: this.translate.instant('Down Payment'),
            term_type: 'deposit',
          };
          this.termsList.push(dp);
        }
        if (filterAccount[0].financial_supports && filterAccount[0].financial_supports.length) {
          this.financialList = [];
          this.financialList = filterAccount[0].financial_supports.map((list) => {
            return {
              finance:
                list.family_name +
                ' ' +
                list.name +
                ' ' +
                (list.civility ? (list.civility === 'neutral' ? '' : this.translate.instant(list.civility)) : '') +
                ' (' +
                this.translate.instant('CARDDETAIL.RELATION.' + list.relation) +
                ')',
              student_name: filterAccount[0].student_name,
              account_number: filterAccount[0].account_number,
              terms: filterAccount[0].terms,
              deposit: filterAccount[0].deposit,
              is_deposit_completed: filterAccount[0].is_deposit_completed,
              billing_id: filterAccount[0].billing_id,
              student_id: filterAccount[0].candidate_id,
            };
          });
        } else {
          this.financialList = [];
          const data = {
            finance: filterAccount[0].student_name,
            student_name: filterAccount[0].student_name,
            account_number: filterAccount[0].account_number,
            terms: filterAccount[0].terms,
            deposit: filterAccount[0].deposit,
            is_deposit_completed: filterAccount[0].is_deposit_completed,
            billing_id: filterAccount[0].billing_id,
            student_id: filterAccount[0].candidate_id,
          };
          this.financialList.push(data);
        }
      }
    } else {
      this.termsList = [];
      this.financialList = [];
      this.importForm.get('billing_id').setValue(null);
      this.importForm.get('student_id').setValue(null);
      this.importForm.get('student').setValue(null);
      this.importForm.get('letter').setValue(null);
      this.importForm.get('financial_support').setValue(null);
    }
  }

  getDataBilling() {
    // console.log('this.dataBilling', this.dataBilling);
    const billing = _.cloneDeep(this.dataBilling);
    if (billing) {
      this.mappingBilling = billing
        .filter((filtered) => filtered.candidate_id)
        .map((temp) => {
          return {
            student_name:
              temp.candidate_id.last_name +
              ' ' +
              temp.candidate_id.first_name +
              ' ' +
              (temp.candidate_id.civility
                ? temp.candidate_id.civility === 'neutral'
                  ? ''
                  : this.translate.instant(temp.candidate_id.civility)
                : '') +
              ' ' +
              temp.intake_channel.program,
            account_number: temp.account_number,
            terms: temp.terms,
            deposit: temp.deposit,
            is_deposit_completed: temp.is_deposit_completed,
            financial_supports: temp.financial_supports,
            billing_id: temp._id,
            student_id: temp.candidate_id._id,
          };
        });
      this.originalMappingBilling = this.mappingBilling;
      billing
        .filter((filtered) => filtered.candidate_id)
        .forEach((element) => {
          if (element.financial_supports && element.financial_supports.length) {
            element.financial_supports.forEach((finance) => {
              const data = {
                finance:
                  finance.family_name +
                  ' ' +
                  finance.name +
                  ' ' +
                  (finance.civility ? (finance.civility === 'neutral' ? '' : this.translate.instant(finance.civility)) : '') +
                  ' (' +
                  this.translate.instant('CARDDETAIL.RELATION.' + finance.relation) +
                  ')',
                student_name:
                  element.candidate_id.last_name +
                  ' ' +
                  element.candidate_id.first_name +
                  ' ' +
                  (element.candidate_id.civility
                    ? element.candidate_id.civility === 'neutral'
                      ? ''
                      : this.translate.instant(element.candidate_id.civility)
                    : '') +
                  ' ' +
                  element.intake_channel,
                account_number: element.account_number,
                terms: element.terms,
                deposit: element.deposit,
                is_deposit_completed: element.is_deposit_completed,
                billing_id: element._id,
                student_id: element.candidate_id._id,
              };
              this.financialList.push(data);
            });
          }
        });
      this.originalFinancialList = this.financialList;
    }
    // console.log('this.financialList', this.financialList);
  }

  studentSelected(event) {
    this.importForm.get('letter').setValue(null);
    this.importForm.get('financial_support').setValue(null);
    console.log('Data Selected', event);
    const billing = _.cloneDeep(this.dataBilling);
    const account = event && event.account_number ? event.account_number : '';
    const billing_id = event && event.billing_id ? event.billing_id : '';
    const student_id = event && event.student_id ? event.student_id : '';
    this.importForm.get('student_account').setValue(account);
    this.importForm.get('billing_id').setValue(billing_id);
    this.importForm.get('student_id').setValue(student_id);
    if (event) {
      if (event.terms && event.terms.length) {
        event.terms.forEach((element, index) => {
          element.term = index + 1;
        });
        this.termsList = event.terms.filter(
          (list) => (list.is_term_paid === false || list.term_amount !== list.term_pay_amount) && list.term_amount !== 0,
        );
        this.termsList = this.termsList.sort((a, b) => {
          return moment.utc(a.term_payment_deferment).diff(moment.utc(b.term_payment_deferment));
        });
        this.termsList = this.termsList.map((list) => {
          return {
            name:
              this.translate.instant('terms') +
              ' ' +
              list.term +
              ' ' +
              (list.term_payment.date ? ' - ' + list.term_payment.date : '') +
              ' ' +
              (list.term_amount - list.term_pay_amount <= 0 ? ' ' : ' - ' + (list.term_amount - list.term_pay_amount) + ' €'),
            term_amount: list.term_amount,
            term_index: list.term,
            term_type: 'term',
            term_payment: {
              date: list.term_payment.date,
              time: list.term_payment.time,
            },
          };
        });
        // console.log(this.termsList);
      } else {
        this.termsList = [];
      }
      if (event && event.is_deposit_completed) {
        this.generalDepositPaid = true;
      } else {
        const dp = {
          name: this.translate.instant('Down Payment'),
          term_type: 'deposit',
        };
        this.termsList.push(dp);
      }
      if (event.financial_supports && event.financial_supports.length) {
        this.financialList = event.financial_supports.map((list) => {
          return {
            finance:
              list.family_name +
              ' ' +
              list.name +
              ' ' +
              (list.civility ? (list.civility === 'neutral' ? '' : this.translate.instant(list.civility)) : '') +
              ' (' +
              this.translate.instant('CARDDETAIL.RELATION.' + list.relation) +
              ')',
            student_name: event.student_name,
            account_number: event.account_number,
            terms: event.terms,
            deposit: event.deposit,
            is_deposit_completed: event.is_deposit_completed,
            billing_id: event.billing_id,
            student_id: event.candidate_id,
          };
        });
        if (this.financialList && this.financialList.length === 1) {
          this.importForm.get('financial_support').setValue(this.financialList[0].finance);
        }
      } else {
        const data = {
          finance: event.student_name,
          student_name: event.student_name,
          account_number: event.account_number,
          terms: event.terms,
          deposit: event.deposit,
          is_deposit_completed: event.is_deposit_completed,
          billing_id: event.billing_id,
          student_id: event.candidate_id,
        };
        this.financialList.push(data);
        if (this.financialList && this.financialList.length === 1) {
          this.importForm.get('financial_support').setValue(this.financialList[0].finance);
        }
      }
    } else {
      this.termsList = [];
      this.financialList = [];
      this.importForm.get('financial_support').setValue(null);
      this.importForm.get('letter').setValue(null);
      this.importForm.get('billing_id').setValue('');
      billing.forEach((element) => {
        if (element.financial_supports && element.financial_supports.length) {
          element.financial_supports.forEach((finance) => {
            const data = {
              finance:
                finance.family_name +
                ' ' +
                finance.name +
                ' ' +
                (finance.civility ? (finance.civility === 'neutral' ? '' : this.translate.instant(finance.civility)) : '') +
                ' (' +
                this.translate.instant('CARDDETAIL.RELATION.' + finance.relation) +
                ')',
              student_name:
                element.candidate_id.last_name +
                ' ' +
                element.candidate_id.first_name +
                ' ' +
                (element.candidate_id.civility
                  ? element.candidate_id.civility === 'neutral'
                    ? ''
                    : this.translate.instant(element.candidate_id.civility)
                  : '') +
                ' ' +
                element.intake_channel,
              account_number: element.account_number,
              terms: element.terms,
              deposit: element.deposit,
              is_deposit_completed: element.is_deposit_completed,
              billing_id: element._id,
              student_id: element.candidate_id._id,
            };
            this.financialList.push(data);
          });
          if (this.financialList && this.financialList.length === 1) {
            this.importForm.get('financial_support').setValue(this.financialList[0].finance);
          }
        }
      });
    }
  }

  financeSelected(event) {
    // console.log('Data Selected', event);
    if (!this.importForm.get('student').value) {
      const account = event && event.account_number ? event.account_number : '';
      const student_name = event && event.student_name ? event.student_name : '';
      const billing_id = event && event.billing_id ? event.billing_id : '';
      const student_id = event && event.candidate_id ? event.candidate_id : '';
      this.importForm.get('student_account').setValue(account);
      this.importForm.get('student').setValue(student_name);
      this.importForm.get('billing_id').setValue(billing_id);
      this.importForm.get('student_id').setValue(student_id);
      if (event) {
        if (event.terms && event.terms.length) {
          event.terms.forEach((element, index) => {
            element.term = index + 1;
          });
          this.termsList = event.terms.filter(
            (list) => (list.is_term_paid === false || list.term_amount !== list.term_pay_amount) && list.term_amount !== 0,
          );
          this.termsList = this.termsList.sort((a, b) => {
            return moment.utc(a.term_payment_deferment).diff(moment.utc(b.term_payment_deferment));
          });
          this.termsList = this.termsList.map((list) => {
            return {
              name:
                this.translate.instant('terms') +
                ' ' +
                list.term +
                ' ' +
                (list.term_payment.date ? ' - ' + list.term_payment.date : '') +
                ' ' +
                (list.term_amount - list.term_pay_amount <= 0 ? ' ' : ' - ' + (list.term_amount - list.term_pay_amount) + ' €'),
              term_amount: list.term_amount,
              term_index: list.term,
              term_type: 'term',
              term_payment: {
                date: list.term_payment.date,
                time: list.term_payment.time,
              },
            };
          });
          // console.log(this.termsList);
        } else {
          this.termsList = [];
        }
        if (event && event.is_deposit_completed) {
          this.generalDepositPaid = true;
        } else {
          const dp = {
            name: this.translate.instant('Down Payment'),
            term_type: 'deposit',
          };
          this.termsList.push(dp);
        }
        // const dataFinance = this.mappingBilling.filter((list) => list.student_id === event.student_id);
        // if (dataFinance && dataFinance.length) {
        //   this.financialList = dataFinance[0].financial_supports;
        // }
      }
    }
  }
  letterSelected(event) {
    // console.log('Data Letter', event);
    if (event) {
      const term_index = event.map((list) => list.term_index);
      this.importForm.get('term_index').setValue(term_index);
    } else {
      this.importForm.get('term_index').setValue(null);
    }
    if (event) {
      const term_amount = event.map((list) => list.term_amount);
      const term_index = event.filter((res) => res && res.term_index).map((list) => list.term_index.toString());
      const date = event.filter((res) => res && res.term_payment && res.term_payment.date).map((list) => list.term_payment.date.toString());
      const time = event.filter((res) => res && res.term_payment && res.term_payment.time).map((list) => list.term_payment.time.toString());
      const term_type = event.filter((res) => res && res.term_type).map((list) => list.term_type);
      this.importForm.get('term_amount').setValue(term_amount);
      this.importForm.get('term_index').setValue(term_index);
      this.importForm.get('term_type').setValue(term_type);
      this.importForm.get('term_payment').get('date').setValue(date);
      this.importForm.get('term_payment').get('time').setValue(time);
    } else {
      this.importForm.get('term_amount').setValue(null);
      this.importForm.get('term_index').setValue(null);
      this.importForm.get('term_type').setValue(null);
      this.importForm.get('term_payment').get('date').setValue(null);
      this.importForm.get('term_payment').get('time').setValue(null);
    }
  }
  initBankCheque() {
    this.importForm = this.fb.group({
      cheque_bank: this.fb.array([]),
      payor: [null, Validators.required],
      student: [null, Validators.required],
      student_account: [null, Validators.required],
      amount: [null, Validators.required],
      financial_support: [null, Validators.required],
      currency: ['EUR', Validators.required],
      letter: [null, Validators.required],
      bank_name: [null, Validators.required],
      cheque_number: ['', Validators.required],
      date: ['', Validators.required],
      term_payment: this.fb.group({
        date: [''],
        time: [''],
      }),
      term_amount: [''],
      term_index: [''],
      term_type: [''],
      billing_id: [''],
      student_id: [''],
    });
  }

  get arrayCheque() {
    return this.importForm.get('cheque_bank') as UntypedFormArray;
  }
  addChequeBank() {
    this.arrayCheque.push(this.initImportForm());
    const data = this.importForm.get('cheque_bank').value;
    this.currentIndex = data && data.length ? data.length - 1 : -1;
    const payload = {
      payor: this.importForm.get('payor').value,
      student: this.importForm.get('student').value,
      student_account: this.importForm.get('student_account').value,
      amount: this.importForm.get('amount').value,
      financial_support: this.importForm.get('financial_support').value,
      currency: this.importForm.get('currency').value,
      letter: this.importForm.get('letter').value,
      bank_name: this.importForm.get('bank_name').value,
      cheque_number: this.importForm.get('cheque_number').value,
      date: this.importForm.get('date').value,
      billing_id: this.importForm.get('billing_id').value,
      term_amount: this.importForm.get('term_amount').value,
      term_index: this.importForm.get('term_index').value,
      term_type: this.importForm.get('term_type').value,
      student_id: this.importForm.get('student_id').value,
      term_payment: {
        date: this.importForm.get('term_payment').get('date').value,
        time: this.importForm.get('term_payment').get('time').value,
      },
    };
    this.importForm.get('cheque_bank').get(this.currentIndex.toString()).patchValue(payload);
    this.importForm.get('payor').setValue(null);
    this.importForm.get('student').setValue(null);
    this.importForm.get('student_account').setValue(null);
    this.importForm.get('amount').setValue(null);
    this.importForm.get('financial_support').setValue(null);
    this.importForm.get('currency').setValue('EUR');
    this.importForm.get('letter').setValue(null);
    this.importForm.get('bank_name').setValue(null);
    this.importForm.get('cheque_number').setValue(null);
    this.importForm.get('date').setValue(null);
    this.importForm.get('billing_id').setValue(null);
    this.importForm.get('student_id').setValue('');
    this.studentArrayList[this.currentIndex] = this.mappingBilling;
    this.financialArrayList[this.currentIndex] = this.financialList;
    this.termArrayList[this.currentIndex] = this.termsList;
    this.financialList = this.originalFinancialList;
    this.mappingBilling = this.originalMappingBilling;
    this.termsList = [];
  }

  removeArrayCheque(arrayIndex) {
    this.arrayCheque.removeAt(arrayIndex);
  }

  initImportForm() {
    return this.fb.group({
      payor: [null, Validators.required],
      student: [null, Validators.required],
      student_account: [null, Validators.required],
      amount: [null, Validators.required],
      financial_support: [null, Validators.required],
      currency: [null, Validators.required],
      letter: [null, Validators.required],
      bank_name: [null, Validators.required],
      cheque_number: ['', Validators.required],
      date: ['', Validators.required],
      term_payment: this.fb.group({
        date: [''],
        time: [''],
      }),
      term_amount: [''],
      term_index: [''],
      term_type: [''],
      billing_id: [''],
      student_id: [''],
    });
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  getDataDelimeter() {
    this.isDelimeterOn = true;
  }

  resetImport() {
    // this.importForm.get('schools').setValue(null);
    // this.importForm.get('campuses').setValue(null);
    // this.importForm.get('scholarSeasons').setValue(null);
    // this.importForm.get('levels').setValue(null);
    this.importForm.get('billing_entity').setValue(null);
    this.importForm.get('bank_name').setValue(null);
    this.importForm.get('delimiter').setValue('');
    this.importForm.get('date').setValue('');
    this.path = '';
    this.fileName = '';
    this.templateDonwloaded = false;
  }

  onCancelImport() {}

  submitImport() {
    const payload = _.cloneDeep(this.importForm.get('cheque_bank').value);
    const all_payload = _.cloneDeep(this.importForm.value);
    if (payload && payload.length) {
      payload.forEach((element, indexStudent) => {
        payload[indexStudent].index = indexStudent;
      });
    }
    this.financeService.setStatusStepTwoCheque(true);
    this.financeService.setDataCheque(payload);
    this.financeService.setAllDataCheque(all_payload);
    this.financeService.setCurrentStep(2);
    // Swal.fire({
    //   type: 'success',
    //   title: 'Bravo !',
    // });
  }

  previous() {
    this.financeService.setCurrentStep(0);
  }
  dataIsChanged() {}

  ngOnDestroy(): void {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }
  studentSelectedArray(event, indexCheque) {
    this.importForm.get('cheque_bank').get(indexCheque.toString()).get('letter').setValue(null);
    this.importForm.get('cheque_bank').get(indexCheque.toString()).get('financial_support').setValue(null);
    console.log('Data Selected', event);
    const billing = _.cloneDeep(this.dataBilling);
    const account = event && event.account_number ? event.account_number : '';
    const billing_id = event && event.billing_id ? event.billing_id : '';
    const student_id = event && event.student_id ? event.student_id : '';
    this.importForm.get('cheque_bank').get(indexCheque.toString()).get('student_account').setValue(account);
    this.importForm.get('cheque_bank').get(indexCheque.toString()).get('billing_id').setValue(billing_id);
    this.importForm.get('cheque_bank').get(indexCheque.toString()).get('student_id').setValue(student_id);
    if (event) {
      if (event.terms && event.terms.length) {
        event.terms.forEach((element, index) => {
          element.term = index + 1;
        });
        this.termArrayList[indexCheque] = event.terms.filter(
          (list) => list.is_term_paid === false || list.term_amount !== list.term_pay_amount,
        );
        this.termArrayList[indexCheque] = this.termArrayList[indexCheque].sort((a, b) => {
          return moment.utc(a.term_payment_deferment).diff(moment.utc(b.term_payment_deferment));
        });
        this.termArrayList[indexCheque] = this.termArrayList[indexCheque].map((list) => {
          return {
            name:
              this.translate.instant('terms') +
              ' ' +
              list.term +
              ' ' +
              (list.term_payment.date ? ' - ' + list.term_payment.date : '') +
              ' ' +
              (list.term_amount - list.term_pay_amount <= 0 ? ' ' : ' - ' + (list.term_amount - list.term_pay_amount) + ' €'),
            term_amount: list.term_amount,
            term_index: list.term,
            term_type: 'term',
            term_payment: {
              date: list.term_payment.date,
              time: list.term_payment.time,
            },
          };
        });
        // console.log(this.termArrayList[indexCheque]);
      } else {
        this.termArrayList[indexCheque] = [];
      }
      if (event && event.is_deposit_completed) {
        this.generalDepositPaid = true;
      } else {
        const dp = {
          name: this.translate.instant('Down Payment'),
          term_type: 'deposit',
        };
        this.termArrayList[indexCheque].push(dp);
      }
      if (event.financial_supports && event.financial_supports.length) {
        this.financialArrayList[indexCheque] = event.financial_supports.map((list) => {
          return {
            finance:
              list.family_name +
              ' ' +
              list.name +
              ' ' +
              (list.civility ? (list.civility === 'neutral' ? '' : this.translate.instant(list.civility)) : '') +
              ' (' +
              this.translate.instant('CARDDETAIL.RELATION.' + list.relation) +
              ')',
            student_name: event.student_name,
            account_number: event.account_number,
            terms: event.terms,
            deposit: event.deposit,
            is_deposit_completed: event.is_deposit_completed,
            billing_id: event.billing_id,
            student_id: event.candidate_id,
          };
        });
      } else {
        const data = {
          finance: event.student_name,
          student_name: event.student_name,
          account_number: event.account_number,
          terms: event.terms,
          deposit: event.deposit,
          is_deposit_completed: event.is_deposit_completed,
          billing_id: event.billing_id,
          student_id: event.candidate_id,
        };
        this.financialArrayList[indexCheque].push(data);
      }
    } else {
      this.termArrayList[indexCheque] = [];
      this.financialArrayList[indexCheque] = [];
      this.importForm.get('cheque_bank').get(indexCheque.toString()).get('financial_support').setValue(null);
      this.importForm.get('cheque_bank').get(indexCheque.toString()).get('letter').setValue(null);
      this.importForm.get('cheque_bank').get(indexCheque.toString()).get('billing_id').setValue('');
      billing.forEach((element) => {
        if (element.financial_supports && element.financial_supports.length) {
          element.financial_supports.forEach((finance) => {
            const data = {
              finance:
                finance.family_name +
                ' ' +
                finance.name +
                ' ' +
                (finance.civility ? (finance.civility === 'neutral' ? '' : this.translate.instant(finance.civility)) : '') +
                ' (' +
                this.translate.instant('CARDDETAIL.RELATION.' + finance.relation) +
                ')',
              student_name:
                element.candidate_id.last_name +
                ' ' +
                element.candidate_id.first_name +
                ' ' +
                (element.candidate_id.civility
                  ? element.candidate_id.civility === 'neutral'
                    ? ''
                    : this.translate.instant(element.candidate_id.civility)
                  : '') +
                ' ' +
                element.intake_channel,
              account_number: element.account_number,
              terms: element.terms,
              deposit: element.deposit,
              is_deposit_completed: element.is_deposit_completed,
              billing_id: element._id,
              student_id: element.candidate_id._id,
            };
            this.financialArrayList[indexCheque].push(data);
          });
        }
      });
    }
  }

  financeSelectedArray(event, indexCheque) {
    // console.log('Data Selected', event);
    if (!this.importForm.get('cheque_bank').get(indexCheque.toString()).get('student').value) {
      const account = event && event.account_number ? event.account_number : '';
      const student_name = event && event.student_name ? event.student_name : '';
      const billing_id = event && event.billing_id ? event.billing_id : '';
      const student_id = event && event.candidate_id ? event.candidate_id : '';
      this.importForm.get('cheque_bank').get(indexCheque.toString()).get('student_account').setValue(account);
      this.importForm.get('cheque_bank').get(indexCheque.toString()).get('student').setValue(student_name);
      this.importForm.get('cheque_bank').get(indexCheque.toString()).get('billing_id').setValue(billing_id);
      this.importForm.get('cheque_bank').get(indexCheque.toString()).get('student_id').setValue(student_id);
      if (event) {
        if (event.terms && event.terms.length) {
          event.terms.forEach((element, index) => {
            element.term = index + 1;
          });
          this.termArrayList[indexCheque] = event.terms.filter(
            (list) => list.is_term_paid === false || list.term_amount !== list.term_pay_amount,
          );
          this.termArrayList[indexCheque] = this.termArrayList[indexCheque].sort((a, b) => {
            return moment.utc(a.term_payment_deferment).diff(moment.utc(b.term_payment_deferment));
          });
          this.termArrayList[indexCheque] = this.termArrayList[indexCheque].map((list) => {
            return {
              name:
                this.translate.instant('terms') +
                ' ' +
                list.term +
                ' ' +
                (list.term_payment.date ? ' - ' + list.term_payment.date : '') +
                ' ' +
                (list.term_amount - list.term_pay_amount <= 0 ? ' ' : ' - ' + (list.term_amount - list.term_pay_amount) + ' €'),
              term_amount: list.term_amount,
              term_index: list.term,
              term_type: 'term',
              term_payment: {
                date: list.term_payment.date,
                time: list.term_payment.time,
              },
            };
          });
          // console.log(this.termArrayList[indexCheque]);
        } else {
          this.termArrayList[indexCheque] = [];
        }
        if (event && event.is_deposit_completed) {
          this.generalDepositPaid = true;
        } else {
          const dp = {
            name: this.translate.instant('Down Payment'),
            term_type: 'deposit',
          };
          this.termArrayList[indexCheque].push(dp);
        }
      }
    }
  }
  letterSelectedArray(event, indexCheque) {
    // console.log('Data Letter', event);
    if (event) {
      const term_amount = event.map((list) => list.term_amount);
      const term_index = event.filter((res) => res && res.term_index).map((list) => list.term_index.toString());
      const date = event.filter((res) => res && res.term_payment && res.term_payment.date).map((list) => list.term_payment.date);
      const time = event.filter((res) => res && res.term_payment && res.term_payment.time).map((list) => list.term_payment.time);
      const term_type = event.filter((res) => res && res.term_type).map((list) => list.term_type);
      this.importForm.get('cheque_bank').get(indexCheque.toString()).get('term_amount').setValue(term_amount);
      this.importForm.get('cheque_bank').get(indexCheque.toString()).get('term_index').setValue(term_index);
      this.importForm.get('cheque_bank').get(indexCheque.toString()).get('term_type').setValue(term_type);
      this.importForm.get('cheque_bank').get(indexCheque.toString()).get('term_payment').get('date').setValue(date);
      this.importForm.get('cheque_bank').get(indexCheque.toString()).get('term_payment').get('time').setValue(time);
    } else {
      this.importForm.get('cheque_bank').get(indexCheque.toString()).get('term_amount').setValue(null);
      this.importForm.get('cheque_bank').get(indexCheque.toString()).get('term_index').setValue(null);
      this.importForm.get('cheque_bank').get(indexCheque.toString()).get('term_type').setValue(null);
      this.importForm.get('cheque_bank').get(indexCheque.toString()).get('term_payment').get('date').setValue(null);
      this.importForm.get('cheque_bank').get(indexCheque.toString()).get('term_payment').get('time').setValue(null);
    }
  }
  toggleSidebar() {
    if (this.coreService.sidenavOpen) {
      this.coreService.sidenavOpen = !this.coreService.sidenavOpen;
    }
    this.coreService.sidenavTutorialOpen = !this.coreService.sidenavTutorialOpen;
  }
}
