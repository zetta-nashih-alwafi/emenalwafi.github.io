import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewChecked,
  AfterContentChecked,
} from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import Swal from 'sweetalert2';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { UntypedFormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { AssignTimelineTemplateDialogComponent } from '../../timeline-template/assign-timeline-template-dialog/assign-timeline-template-dialog.component';
import * as _ from 'lodash';
import { AddPaymentOrganizationDialogComponent } from './add-payment-organization-dialog/add-payment-organization-dialog.component';
import { ChangePaymentOrganizationDialogComponent } from './change-payment-organization-dialog/change-payment-organization-dialog.component';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { Router } from '@angular/router';
import { FinancesService } from 'app/service/finance/finance.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import * as moment from 'moment';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { InternshipEmailDialogComponent } from 'app/internship-file/internship-email-dialog/internship-email-dialog.component';
import { FormFillingService } from 'app/form-filling/form-filling.service';
import { environment } from 'environments/environment';
import { PermissionService } from 'app/service/permission/permission.service';
import { MonthTermDetailsDialogComponent } from './../../candidate-file/candidate-card-details/month-term-details-dialog/month-term-details-dialog.component';
import { ExportControllingReportDialogComponent } from 'app/finance/finance-table/export-controlling-report-dialog/export-controlling-report-dialog.component';

@Component({
  selector: 'ms-finance-organization',
  templateUrl: './finance-organization.component.html',
  styleUrls: ['./finance-organization.component.scss'],
})
export class FinanceOrganizationComponent implements OnInit, OnDestroy, AfterViewChecked, AfterContentChecked, AfterViewInit {
  private subs = new SubSink();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  fromDateFilter = new UntypedFormControl(null);
  toDateFilter = new UntypedFormControl(null);
  statusFilter = new UntypedFormControl('All');

  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);

  typeList = [];

  studentTypeList = ['classic', 'continuous', 'continuous_total_funding', 'continuous_partial_funding', 'continuous_personal_funding'];

  dataCount = 0;
  noData;
  sortValue = null;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  userSelected: any[];
  userSelectedId: any[];
  isCheckedAll = false;
  isLoading = false;
  isWaitingForResponse = false;
  schoolName = '';
  isTerm1 = false;
  isTerm2 = false;
  isTerm3 = false;
  isTerm4 = false;
  isTerm5 = false;
  isTerm6 = false;
  isTerm7 = false;
  isTerm8 = false;
  isTerm9 = false;
  isTerm10 = false;
  isTerm11 = false;
  isTerm12 = false;
  isDeposit = false;
  isNonPlan = false;
  pageSelected = [];
  tagList = [];
  dataTableTerms: any;
  currentUserTypeId: any;
  listObjective = [];
  currentUser: any;

  displayedColumns: string[] = [
    'select',
    'organizationType',
    'organizationName',
    'studentNumber',
    'studentName',
    'studentProgram',
    'formationType',
    'totalAmount',
    'amountBilled',
    'amountPaid',
    'remainingDue',
    'amountLate',
    'accumulatedLate',
    // 'downPayment',
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
    'action',
  ];

  filterColumns: string[] = [
    'selectFilter',
    'organizationTypeFilter',
    'organizationNameFilter',
    'studentNumberFilter',
    'studentNameFilter',
    'studentProgramFilter',
    'formationTypeFilter',
    'totalAmountFilter',
    'amountBilledFilter',
    'amountPaidFilter',
    'remainingDueFilter',
    'amountLateFilter',
    'accumulatedLateFilter',
    // 'downPaymentFilter',
    'notRespectedFilter',
    'notSettledFilter',
    'term1Filter',
    'term2Filter',
    'term3Filter',
    'term4Filter',
    'term5Filter',
    'term6Filter',
    'term7Filter',
    'term8Filter',
    'term9Filter',
    'term10Filter',
    'term11Filter',
    'term12Filter',
    'actionFilter',
  ];
  candidate_admission_statuses = [
    'admission_in_progress',
    'bill_validated',
    'engaged',
    'registered',
    'resigned',
    'resigned_after_engaged',
    'resigned_after_registered',
    'report_inscription',
    'in_scholarship',
    'mission_card_validated',
    'resignation_missing_prerequisites',
    'resign_after_school_begins',
    'no_show',
    // 'deactivated',
  ];

  DPandTermsFilterList = [];

  programFilterList = [
    { value: 'All', key: 'AllS' },
    { value: '20-21 EFAPAR 1', key: '20-21 EFAPAR 1' },
    { value: '21-22 EFATOU 2', key: '21-22 EFATOU 2' },
    { value: '20-21 ICABOR 1', key: '20-21 ICABOR 1' },
  ];
  typeFilterList = [
    { value: 'All', key: 'AllS' },
    { value: 'classic', key: 'Classic' },
    { value: 'alternance', key: 'Alternance' },
    { value: 'special', key: 'Special' },
  ];
  paymentFilterList = [
    { value: 'All', key: 'AllS' },
    { value: 'Credit Card', key: 'Credit Card' },
    { value: 'Transfer', key: 'Transfer' },
    { value: 'Cheque', key: 'Cheque' },
  ];

  statusFilterList = [
    { value: 'All', key: 'AllS' },
    { value: 'not_billed', key: 'Not billed' },
    { value: 'billed', key: 'Generated' },
    { value: 'partially_paid', key: 'Partially paid' },
    { value: 'paid', key: 'Paid' },
  ];

  timeOutVal: any;

  templateNameFilterCtrl = new UntypedFormControl('');
  templateNameFiltered: Observable<any[]>;
  templateNameList = [
    {
      name: 'Dummy Filter 1',
    },
    {
      name: 'Filtered 2',
    },
  ];

  organizationTypeFilter = new UntypedFormControl(null);
  organizationNameFilter = new UntypedFormControl(null);
  studentNumberFilter = new UntypedFormControl(null);
  studentTypeFilter = new UntypedFormControl(null);
  depositFilter = new UntypedFormControl('AllM');
  schoolsFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  levelFilter = new UntypedFormControl(null);
  tagFilter = new UntypedFormControl(null);
  scholarFilter = new UntypedFormControl('All');
  sectorFilter = new UntypedFormControl(null);
  specialityFilter = new UntypedFormControl(null);
  currentProgramFilter = new UntypedFormControl(null);
  typeFilter = new UntypedFormControl(null);
  studentFilter = new UntypedFormControl('');
  accountFilter = new UntypedFormControl('');
  paymentFilter = new UntypedFormControl(null);
  profileRateFilter = new UntypedFormControl(null);
  financialFilter = new UntypedFormControl(null);
  studentStatusFilter = new UntypedFormControl('');
  terms1Filter = new UntypedFormControl(null);
  terms2Filter = new UntypedFormControl(null);
  terms3Filter = new UntypedFormControl(null);
  terms4Filter = new UntypedFormControl(null);
  terms5Filter = new UntypedFormControl(null);
  terms6Filter = new UntypedFormControl(null);
  terms7Filter = new UntypedFormControl(null);
  terms8Filter = new UntypedFormControl(null);
  terms9Filter = new UntypedFormControl(null);
  terms10Filter = new UntypedFormControl(null);
  terms11Filter = new UntypedFormControl(null);
  terms12Filter = new UntypedFormControl(null);

  dataSelected = [];
  allStudentForCheckbox = [];

  disabledExport = true;
  disabledGenerate = true;
  selectType: any;
  listFilter = [];
  studentType = [];
  intakeList = [];
  filteredCurrentProgram: Observable<any[]>;
  filteredType: Observable<any[]>;
  filteredFormation: Observable<any[]>;
  selectedProgram: string;
  selectedFormation: string;
  selectedType: string;
  scholarSelected = [];
  scholars = [];
  originalScholar = [];
  school = [];
  campusList = [];
  levels = [];
  filteredValues = {
    type_of_organization: '',
    intake_channel: '',
    student_type: '',
    candidate_id: '',
    // deposit_status: null,
    campuses: null,
    levels: null,
    tag_ids: null,
    school_ids: null,
    scholar_season_id: null,
    sectors: null,
    specialities: null,
    first_term: null,
    second_term: null,
    third_term: null,
    fourth_term: null,
    fifth_term: null,
    sixth_term: null,
    seventh_term: null,
    eighth_term: null,
    ninth_term: null,
    tenth_term: null,
    eleventh_term: null,
    twelveth_term: null,
    term_from: '',
    term_to: '',
    term_status: null,
    // New filter multiple
    type_of_organizations: null,
    intake_channels: null,
    student_types: null,
    first_terms: null,
    second_terms: null,
    third_terms: null,
    fourth_terms: null,
    fifth_terms: null,
    sixth_terms: null,
    seventh_terms: null,
    eighth_terms: null,
    ninth_terms: null,
    tenth_terms: null,
    eleventh_terms: null,
    twelveth_terms: null,
  };

  superFilter = {
    levels: '',
    campuses: '',
    school_ids: '',
    scholar_season_id: '',
    tag_ids: '',
    sectors: '',
    specialities: '',
  };

  searchValues = {
    organization_type: '',
    organization_name: '',
    student_number: '',
    student_name: '',
  };
  hasNoTerms = false;

  schoolSelected: any[];
  campusSelected: any[];
  levelSelected: any[];
  tagSelected: any[];
  isPermission: any;
  isDisabled = true;
  scholarSeasonFiltered;
  schoolFiltered;
  campusFiltered;
  levelFiltered;
  dataUnselectUser = [];
  allExportForCheckbox = [];
  allGenerateForCheckbox = [];
  allAssignDataForCheckbox = [];
  allMailDataForCheckbox = [];
  filterBreadcrumbData = [];
  sectorList = [];
  specialityList = [];

  tempDataFilter = {
    typeOrganization: null,
    intakeChannels: null,
    studentTypes: null,
    firstTerms: null,
    secondTerms: null,
    thirdTerms: null,
    fourthTerms: null,
    fifthTerms: null,
    sixthTerms: null,
    seventhTerms: null,
    eighthTerms: null,
    ninthTerms: null,
    tenthTerms: null,
    eleventhTerms: null,
    twelvethTerms: null,
  };

  filteredValuesAll = {
    levels: 'All',
    campuses: 'All',
    school_ids: 'All',
    scholar_season_id: 'All',
    sectors: 'All',
    specialities: 'All',
    type_of_organizations: 'All',
    intake_channels: 'All',
    student_types: 'All',
    first_terms: 'All',
    second_terms: 'All',
    third_terms: 'All',
    fourth_terms: 'All',
    fifth_terms: 'All',
    sixth_terms: 'All',
    seventh_terms: 'All',
    eighth_terms: 'All',
    ninth_terms: 'All',
    tenth_terms: 'All',
    eleventh_terms: 'All',
    twelveth_terms: 'All',
  };
  exportFilteredValues;
  buttonClicked = '';

  constructor(
    public dialog: MatDialog,
    private candidatesService: CandidatesService,
    private pageTitleService: PageTitleService,
    private router: Router,
    private translate: TranslateService,
    private http: HttpClient,
    private financeService: FinancesService,
    private cdr: ChangeDetectorRef,
    private utilService: UtilityService,
    private userService: AuthService,
    private formFillingService: FormFillingService,
    private authService: AuthService,
    public permission: PermissionService,
    private httpClient: HttpClient,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    // this.isLoading = true;
    this.getTermOptionList();
    this.initFilter();
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.getAllFinanceOrganization();
    this.getDataTags();
    this.getDataScholarSeasons();
    this.getDataBillingForFilter();
    this.sortingAllList();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.sortingAllList();
      if (this.studentType?.length) {
        this.studentType = this.studentType.map((type) => {
          return {
            ...type,
            label: this.translate.instant('type_formation.' + type.type_of_formation),
          };
        });
      }

      this.getTermOptionList();
      // if (
      //   this.currentProgramFilter.value &&
      //   (this.currentProgramFilter.value.trim() === 'All' || this.currentProgramFilter.value.trim() === 'Tous') &&
      //   this.filteredValues &&
      //   !this.filteredValues.intake_channel
      // ) {
      //   this.currentProgramFilter.setValue(this.translate.instant('All'));
      // }
      // if (
      //   this.studentTypeFilter.value &&
      //   (this.studentTypeFilter.value.trim() === 'All' || this.studentTypeFilter.value.trim() === 'Tous') &&
      //   this.filteredValues &&
      //   !this.filteredValues.student_type
      // ) {
      //   this.studentTypeFilter.setValue(this.translate.instant('All'));
      // }
      // if (
      //   this.organizationTypeFilter.value &&
      //   (this.organizationTypeFilter.value.trim() === 'All' || this.organizationTypeFilter.value.trim() === 'Tous') &&
      //   this.searchValues &&
      //   !this.searchValues.organization_type
      // ) {
      //   this.organizationTypeFilter.setValue(this.translate.instant('All'));
      // }
      if (this.filterBreadcrumbData?.length) {
        this.filterBreadcrumbFormat();
      }
    });
    if (this.scholarFilter.value) {
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }
    this.pageTitleService.setTitle('Follow Up Organization');
  }

  sortingAllList() {
    this.typeList = [
      {
        name: this.translate.instant('ADMISIONSTEPFINANCEMENT.OPCO'),
      },
      {
        name: this.translate.instant('ADMISIONSTEPFINANCEMENT.CPF'),
      },
      {
        name: this.translate.instant('ADMISIONSTEPFINANCEMENT.Transition Pro'),
      },
      {
        name: this.translate.instant('ADMISIONSTEPFINANCEMENT.Pôle Emploi'),
      },
      {
        name: this.translate.instant('ADMISIONSTEPFINANCEMENT.Région'),
      },
      {
        name: this.translate.instant('ADMISIONSTEPFINANCEMENT.Company'),
      },
      {
        name: this.translate.instant('ADMISIONSTEPFINANCEMENT.Other financing organization'),
      },
    ];
    this.typeList = this.typeList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }
  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getAllFinanceOrganization();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getDataTags() {
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService
      .getAllTags(true, 'finance_organization', userTypesList, this.candidate_admission_statuses)
      .subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.tagList = resp;
            this.tagList = this.tagList.sort((a, b) => {
              if (this.utilService.simplifyRegex(a.name?.toLowerCase()) < this.utilService.simplifyRegex(b.name?.toLowerCase())) {
                return -1;
              } else if (this.utilService.simplifyRegex(a.name?.toLowerCase()) > this.utilService.simplifyRegex(b.name?.toLowerCase())) {
                return 1;
              } else {
                return 0;
              }
            });
          }
        },
        (err) => {
          this.userService.postErrorLog(err);
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
  getTermOptionList() {
    this.DPandTermsFilterList = [
      { value: 'not_billed', key: 'Not billed', label: this.translate.instant('Not billed') },
      { value: 'billed', key: 'Billed', label: this.translate.instant('Billed') },
      { value: 'partially_paid', key: 'Partially paid', label: this.translate.instant('Partially paid') },
      { value: 'paid', key: 'Paid', label: this.translate.instant('Paid') },
    ];
    this.DPandTermsFilterList = this.DPandTermsFilterList.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
  }

  // ngOnChanges() {
  // }

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.originalScholar = _.cloneDeep(resp);
          this.scholars = [];
          this.scholars = this.originalScholar.sort((a, b) =>
            a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
          );
          this.scholars.unshift({ _id: 'All', scholar_season: this.translate.instant('All') });
          this.scholars = _.uniqBy(this.scholars, '_id');
          // this.scholarFilter.setValue(this.scholars[0]._id);
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
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

  getDataBillingForFilter() {
    this.subs.sink = this.financeService.GetAllFinanceIntakeChannelDropdown().subscribe(
      (res: any) => {
        if (res) {
          const response = _.cloneDeep(res);
          this.intakeList = _.uniqBy(response, '_id');
          this.intakeList = this.intakeList.sort((intakeA, intakeB) => {
            if (this.utilService.simplifyRegex(intakeA.program) < this.utilService.simplifyRegex(intakeB.program)) {
              return -1;
            } else if (this.utilService.simplifyRegex(intakeA.program) > this.utilService.simplifyRegex(intakeB.program)) {
              return 1;
            } else {
              return 0;
            }
          });
          this.filteredCurrentProgram = of(this.intakeList);

          this.listFilter = response;
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
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
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );

    this.subs.sink = this.financeService.GetAllFinanceTypeOfFormationDropdown().subscribe(
      (res: any) => {
        if (res) {
          const response = _.cloneDeep(res);
          this.studentType = response;

          this.studentType = _.uniqBy(response, '_id');
          this.studentType = this.studentType.sort((typeA, typeB) => {
            if (
              this.utilService.simplifyRegex(this.translate.instant('type_formation.' + typeA.type_of_formation)) <
              this.utilService.simplifyRegex(this.translate.instant('type_formation.' + typeB.type_of_formation))
            ) {
              return -1;
            } else if (
              this.utilService.simplifyRegex(this.translate.instant('type_formation.' + typeA.type_of_formation)) >
              this.utilService.simplifyRegex(this.translate.instant('type_formation.' + typeB.type_of_formation))
            ) {
              return 1;
            } else {
              return 0;
            }
          });

          this.studentType = this.studentType.map((type) => {
            return {
              ...type,
              label: this.translate.instant('type_formation.' + type.type_of_formation),
            };
          });

          this.filteredFormation = this.studentTypeFilter.valueChanges.pipe(
            startWith(''),
            map((searchText) =>
              searchText
                ? this.studentType.filter((type) =>
                    type
                      ? this.translate
                          .instant('type_formation.' + type.type_of_formation)
                          .toLowerCase()
                          .includes(searchText.toLowerCase())
                      : false,
                  )
                : this.studentType,
            ),
          );
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
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

  initFilter() {
    this.subs.sink = this.fromDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.term_from = newDate;
        this.allStudentForCheckbox = [];
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllFinanceOrganization();
        }
      }
    });

    this.subs.sink = this.toDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.term_to = newDate;
        this.allStudentForCheckbox = [];
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllFinanceOrganization();
        }
      }
    });

    this.filteredType = of(this.typeList);
    // this.subs.sink = this.organizationTypeFilter.valueChanges.subscribe((statusSearch) => {
    //   this.allStudentForCheckbox = [];
    //   if (typeof statusSearch === 'string') {
    //     const result = this.typeList.filter((program) =>
    //       this.utilService.simplifyRegex(this.translate.instant(program.name)).includes(this.utilService.simplifyRegex(statusSearch)),
    //     );
    //     this.filteredType = of(result);
    //   } else {
    //     this.filteredType = of(this.typeList);
    //   }
    // });

    // this.subs.sink = this.currentProgramFilter.valueChanges.subscribe((statusSearch) => {
    //   this.allStudentForCheckbox = [];
    //   if (typeof statusSearch === 'string') {
    //     const result = this.intakeList.filter((program) =>
    //       this.utilService.simplifyRegex(program.program).includes(this.utilService.simplifyRegex(statusSearch)),
    //     );
    //     // console.log(result);
    //     this.filteredCurrentProgram = of(result);
    //   }
    // });

    this.subs.sink = this.studentFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.allStudentForCheckbox = [];
      const symbol = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/;
      const symbol1 = /\\/;
      if (statusSearch && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch === '') {
          this.studentFilter.setValue(null, { emitEvent: false });
          this.searchValues.student_name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAllFinanceOrganization();
          }
        }
        this.searchValues.student_name = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllFinanceOrganization();
        }
      } else {
        this.studentFilter.setValue(null, { emitEvent: false });
        this.searchValues.student_name = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllFinanceOrganization();
        }
      }
    });

    this.subs.sink = this.organizationNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.allStudentForCheckbox = [];
      const symbol = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/;
      const symbol1 = /\\/;
      if (statusSearch && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch === '') {
          this.organizationNameFilter.setValue(null, { emitEvent: false });
          this.searchValues.organization_name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAllFinanceOrganization();
          }
        }
        this.searchValues.organization_name = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllFinanceOrganization();
        }
      } else {
        this.organizationNameFilter.setValue(null, { emitEvent: false });
        this.searchValues.organization_name = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllFinanceOrganization();
        }
      }
    });

    this.subs.sink = this.studentNumberFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.allStudentForCheckbox = [];
      const symbol = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/;
      const symbol1 = /\\/;
      if (statusSearch && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch === '') {
          this.studentNumberFilter.setValue(null, { emitEvent: false });
          this.searchValues.student_number = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAllFinanceOrganization();
          }
        }
        this.searchValues.student_number = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllFinanceOrganization();
        }
      } else {
        this.studentNumberFilter.setValue(null, { emitEvent: false });
        this.searchValues.student_number = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllFinanceOrganization();
        }
      }
    });

    // this.subs.sink = this.organizationTypeFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   const symbol = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/;
    //   const symbol1 = /\\/;
    //   if (statusSearch && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
    //     if (statusSearch === '') {
    //       this.organizationTypeFilter.setValue(null, { emitEvent: false });
    //       this.filteredValues.type_of_organization = '';
    //       this.paginator.pageIndex = 0;
    //       if (!this.isReset) {
    //         this.getAllFinanceOrganization();
    //       }
    //     }
    //     this.filteredValues.type_of_organization = statusSearch ? statusSearch : '';
    //     this.paginator.pageIndex = 0;
    //     if (!this.isReset) {
    //       this.getAllFinanceOrganization();
    //     }
    //   } else {
    //     this.organizationTypeFilter.setValue(null, { emitEvent: false });
    //     this.filteredValues.type_of_organization = '';
    //     this.paginator.pageIndex = 0;
    //     if (!this.isReset) {
    //       this.getAllFinanceOrganization();
    //     }
    //   }
    // });

    // this.subs.sink = this.typeFilter.valueChanges.subscribe((statusSearch) => {
    //   this.allStudentForCheckbox = [];
    //   this.filteredValues.student_type = statusSearch === 'All' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getAllFinanceOrganization();
    //   }
    // });

    // this.subs.sink = this.depositFilter.valueChanges.subscribe((statusSearch) => {
    //   this.selection.clear();
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.filteredValues.deposit_status = statusSearch === 'AllM' ? '' : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getAllFinanceOrganization();
    //   }
    // });

    // this.subs.sink = this.tagFilter.valueChanges.subscribe((statusSearch) => {
    //   this.isDisabled = false;
    //   this.dataSelected = [];
    //   this.allStudentForCheckbox = [];
    //   this.isCheckedAll = false;
    //   this.userSelected = [];
    //   this.userSelectedId = [];
    //   this.superFilter.tags = statusSearch && statusSearch.length > 0 && !statusSearch.includes('All') ? statusSearch : null;
    //   const found =
    //     statusSearch && statusSearch.length > 0 && this.tagList && this.tagList.length > 0 && !statusSearch.includes('All')
    //       ? this.tagList.filter((res) => statusSearch.includes(res._id))
    //       : null;
    //   this.tagSelected = found && found.map((res) => res.name);
    // });

    this.subs.sink = this.tagFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.tag_ids = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.allStudentForCheckbox = [];
      this.superFilter.levels = null;
      this.superFilter.campuses = statusSearch && statusSearch.length > 0 && !statusSearch.includes('All') ? statusSearch : null;
      const found =
        statusSearch && statusSearch.length > 0 && this.campusList && this.campusList.length > 0 && !statusSearch.includes('All')
          ? this.campusList.filter((res) => statusSearch.includes(res._id))
          : null;
      this.campusSelected = found && found.map((res) => res.name);
    });

    this.subs.sink = this.levelFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.allStudentForCheckbox = [];
      this.superFilter.levels = statusSearch && statusSearch.length > 0 && !statusSearch.includes('All') ? statusSearch : null;
      const found =
        statusSearch && statusSearch.length > 0 && this.levels && this.levels.length > 0 && !statusSearch.includes('All')
          ? this.levels.filter((res) => statusSearch.includes(res._id))
          : null;
      this.levelSelected = found && found.map((res) => res.name);
    });
    this.subs.sink = this.sectorFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.allStudentForCheckbox = [];
      this.superFilter.sectors = statusSearch === '' || (statusSearch && statusSearch.includes('AllF')) ? '' : statusSearch;
    });
    this.subs.sink = this.specialityFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.allStudentForCheckbox = [];
      this.superFilter.specialities = statusSearch === '' || (statusSearch && statusSearch.includes('AllF')) ? '' : statusSearch;
    });
    this.subs.sink = this.schoolsFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.allStudentForCheckbox = [];
      this.superFilter.levels = null;
      this.superFilter.campuses = null;
      this.superFilter.school_ids = statusSearch && statusSearch.length > 0 && !statusSearch.includes('All') ? statusSearch : null;
      const found =
        statusSearch && statusSearch.length > 0 && this.school && this.school.length > 0 && !statusSearch.includes('All')
          ? this.school.filter((res) => statusSearch.includes(res._id))
          : null;
      this.schoolSelected = found && found.map((res) => res.short_name);
    });

    this.subs.sink = this.scholarFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.allStudentForCheckbox = [];
      this.superFilter.levels = null;
      this.superFilter.campuses = null;
      this.superFilter.school_ids = null;
      const dataScholar = !statusSearch || statusSearch === 'All' || statusSearch === 'ALL' ? null : statusSearch;
      this.superFilter.scholar_season_id = dataScholar;
      this.getDataForList(dataScholar);
    });

    this.subs.sink = this.statusFilter.valueChanges.subscribe((statusSearch) => {
      this.allStudentForCheckbox = [];
      this.filteredValues.term_status = statusSearch === 'All' ? null : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAllFinanceOrganization();
      }
    });

    this.subs.sink = this.tagFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.tag_ids = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
      if (statusSearch) {
        this.isDisabled = false;
      }
    });

    // filtering for each terms
    // this.subs.sink = this.terms1Filter.valueChanges.subscribe((statusSearch) => {
    //   this.allStudentForCheckbox = [];
    //   this.filteredValues.first_term = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getAllFinanceOrganization();
    //   }
    // });
    // this.subs.sink = this.terms2Filter.valueChanges.subscribe((statusSearch) => {
    //   this.allStudentForCheckbox = [];
    //   this.filteredValues.second_term = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getAllFinanceOrganization();
    //   }
    // });
    // this.subs.sink = this.terms3Filter.valueChanges.subscribe((statusSearch) => {
    //   this.allStudentForCheckbox = [];
    //   this.filteredValues.third_term = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getAllFinanceOrganization();
    //   }
    // });
    // this.subs.sink = this.terms4Filter.valueChanges.subscribe((statusSearch) => {
    //   this.allStudentForCheckbox = [];
    //   this.filteredValues.fourth_term = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getAllFinanceOrganization();
    //   }
    // });
    // this.subs.sink = this.terms5Filter.valueChanges.subscribe((statusSearch) => {
    //   this.allStudentForCheckbox = [];
    //   this.filteredValues.fifth_term = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getAllFinanceOrganization();
    //   }
    // });
    // this.subs.sink = this.terms6Filter.valueChanges.subscribe((statusSearch) => {
    //   this.allStudentForCheckbox = [];
    //   this.filteredValues.sixth_term = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getAllFinanceOrganization();
    //   }
    // });
    // this.subs.sink = this.terms7Filter.valueChanges.subscribe((statusSearch) => {
    //   this.allStudentForCheckbox = [];
    //   this.filteredValues.seventh_term = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getAllFinanceOrganization();
    //   }
    // });
    // this.subs.sink = this.terms8Filter.valueChanges.subscribe((statusSearch) => {
    //   this.allStudentForCheckbox = [];
    //   this.filteredValues.eighth_term = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getAllFinanceOrganization();
    //   }
    // });
    // this.subs.sink = this.terms9Filter.valueChanges.subscribe((statusSearch) => {
    //   this.allStudentForCheckbox = [];
    //   this.filteredValues.ninth_term = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getAllFinanceOrganization();
    //   }
    // });
    // this.subs.sink = this.terms10Filter.valueChanges.subscribe((statusSearch) => {
    //   this.allStudentForCheckbox = [];
    //   this.filteredValues.tenth_term = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getAllFinanceOrganization();
    //   }
    // });
    // this.subs.sink = this.terms11Filter.valueChanges.subscribe((statusSearch) => {
    //   this.allStudentForCheckbox = [];
    //   this.filteredValues.eleventh_term = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getAllFinanceOrganization();
    //   }
    // });
    // this.subs.sink = this.terms12Filter.valueChanges.subscribe((statusSearch) => {
    //   this.allStudentForCheckbox = [];
    //   this.filteredValues.twelveth_term = statusSearch === 'AllM' ? null : statusSearch;
    //   this.paginator.pageIndex = 0;
    //   if (!this.isReset) {
    //     this.getAllFinanceOrganization();
    //   }
    // });
  }

  // setCurrentProgramFilter(statusSearch) {
  //   this.allStudentForCheckbox = [];
  //   if (statusSearch !== 'All') {
  //     this.filteredValues.intake_channel = statusSearch._id;
  //     this.selectedProgram = statusSearch.program;
  //     this.paginator.pageIndex = 0;
  //     if (!this.isReset) {
  //       this.getAllFinanceOrganization();
  //     }
  //   } else {
  //     this.filteredValues.intake_channel = '';
  //     this.selectedProgram = statusSearch.program;
  //     this.paginator.pageIndex = 0;
  //     if (!this.isReset) {
  //       this.getAllFinanceOrganization();
  //     }
  //   }
  // }

  // setStudentTypeFilter(statusSearch) {
  //   this.allStudentForCheckbox = [];
  //   this.isCheckedAll = false;
  //   if (statusSearch !== 'All') {
  //     this.filteredValues.student_type = statusSearch._id;
  //     this.selectedType = statusSearch;
  //     this.paginator.pageIndex = 0;
  //     if (!this.isReset) {
  //       this.getAllFinanceOrganization();
  //     }
  //   } else {
  //     this.filteredValues.student_type = '';
  //     this.selectedType = statusSearch;
  //     this.paginator.pageIndex = 0;
  //     if (!this.isReset) {
  //       this.getAllFinanceOrganization();
  //     }
  //   }
  // }

  // setOrganizationTypeFilter(statusSearch) {
  //   this.filteredType = of(this.typeList);
  //   this.allStudentForCheckbox = [];
  //   if (statusSearch !== 'All') {
  //     // this.filteredValues.type_of_organization = statusSearch;
  //     this.searchValues.organization_type = statusSearch;
  //     this.selectedFormation = statusSearch.program;
  //     this.paginator.pageIndex = 0;
  //     if (!this.isReset) {
  //       this.getAllFinanceOrganization();
  //     }
  //   } else {
  //     // this.filteredValues.type_of_organization = '';
  //     this.searchValues.organization_type = '';
  //     this.selectedFormation = statusSearch.program;
  //     this.paginator.pageIndex = 0;
  //     if (!this.isReset) {
  //       this.getAllFinanceOrganization();
  //     }
  //   }
  // }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected() || (this.isCheckedAll && this.dataUnselectUser.length)) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
      this.allGenerateForCheckbox = [];
      this.allAssignDataForCheckbox = [];
      this.allMailDataForCheckbox = [];
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      // this.getDataAllForCheckbox(0);
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
      this.allGenerateForCheckbox = [];
      this.allAssignDataForCheckbox = [];
      this.allMailDataForCheckbox = [];
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
    }
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isLoading = true;
    const filter = this.filteredValues;
    const search = this.searchValues;
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.financeService.GetAllFinanceOrganization(filter, pagination, search, this.sortValue, userTypesList).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.allStudentForCheckbox.push(...students);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
          this.isLoading = false;
          if (this.isCheckedAll) {
            if (this.allStudentForCheckbox && this.allStudentForCheckbox.length) {
              this.allStudentForCheckbox.forEach((element) => {
                this.selection.select(element._id);
                this.dataSelected.push(element);
              });
            }
            this.pageSelected.push(this.paginator.pageIndex);
          } else {
            this.pageSelected = [];
          }
        }
      },
      (error) => {
        this.userService.postErrorLog(error);
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
    const numSelected = this.dataSelected.length;
    if (numSelected > 0) {
      this.disabledExport = false;
    } else {
      this.disabledExport = true;
    }
    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.userSelected.push(user);
      this.userSelectedId.push(user._id);
    });

    if (this.userSelected && this.userSelected.length > 0) {
      const foundNoTerms = this.userSelected.every((res) => res.terms && res.terms.length === 0);
      if (foundNoTerms) {
        this.hasNoTerms = true;
      } else {
        this.hasNoTerms = false;
      }
    }
  }

  resetFilter() {
    this.selection.clear();
    this.dataSelected = [];
    this.allStudentForCheckbox = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    this.isReset = true;
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
    this.allGenerateForCheckbox = [];
    this.allAssignDataForCheckbox = [];
    this.allMailDataForCheckbox = [];
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.schoolName = '';
    this.filteredValues = {
      type_of_organization: '',
      intake_channel: '',
      student_type: '',
      candidate_id: '',
      // deposit_status: null,
      campuses: null,
      levels: null,
      tag_ids: null,
      school_ids: null,
      scholar_season_id: null,
      first_term: null,
      second_term: null,
      third_term: null,
      fourth_term: null,
      fifth_term: null,
      sixth_term: null,
      seventh_term: null,
      eighth_term: null,
      ninth_term: null,
      tenth_term: null,
      eleventh_term: null,
      twelveth_term: null,
      term_from: '',
      term_to: '',
      term_status: null,
      sectors: null,
      specialities: null,
      // new multiple filter
      type_of_organizations: null,
      intake_channels: null,
      student_types: null,
      first_terms: null,
      second_terms: null,
      third_terms: null,
      fourth_terms: null,
      fifth_terms: null,
      sixth_terms: null,
      seventh_terms: null,
      eighth_terms: null,
      ninth_terms: null,
      tenth_terms: null,
      eleventh_terms: null,
      twelveth_terms: null,
    };

    this.superFilter = {
      levels: '',
      campuses: '',
      school_ids: '',
      scholar_season_id: '',
      tag_ids: '',
      sectors: '',
      specialities: '',
    };

    this.searchValues = {
      organization_type: '',
      organization_name: '',
      student_name: '',
      student_number: '',
    };

    this.tempDataFilter = {
      typeOrganization: null,
      intakeChannels: null,
      studentTypes: null,
      firstTerms: null,
      secondTerms: null,
      thirdTerms: null,
      fourthTerms: null,
      fifthTerms: null,
      sixthTerms: null,
      seventhTerms: null,
      eighthTerms: null,
      ninthTerms: null,
      tenthTerms: null,
      eleventhTerms: null,
      twelvethTerms: null,
    };

    this.selectType = '';
    this.organizationTypeFilter.setValue(null, { emitEvent: false });
    this.organizationNameFilter.setValue(null, { emitEvent: false });
    this.studentNumberFilter.setValue(null, { emitEvent: false });
    this.schoolsFilter.setValue(null, { emitEvent: false });
    this.campusFilter.setValue(null, { emitEvent: false });
    this.levelFilter.setValue(null, { emitEvent: false });
    this.scholarFilter.setValue('All', { emitEvent: false });
    this.sectorFilter.setValue(null, { emitEvent: false });
    this.specialityFilter.setValue(null, { emitEvent: false });
    this.currentProgramFilter.setValue(null, { emitEvent: false });
    this.typeFilter.setValue(null, { emitEvent: false });
    this.paymentFilter.setValue(null, { emitEvent: false });
    this.profileRateFilter.setValue(null, { emitEvent: false });
    this.studentFilter.setValue('', { emitEvent: false });
    this.accountFilter.setValue('', { emitEvent: false });
    this.financialFilter.setValue(null, { emitEvent: false });
    this.fromDateFilter.setValue(null, { emitEvent: false });
    this.toDateFilter.setValue(null, { emitEvent: false });
    this.statusFilter.setValue('All', { emitEvent: false });
    this.tagFilter.setValue(null, { emitEvent: false });
    this.studentTypeFilter.setValue(null, { emitEvent: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.isTerm1 = false;
    this.isTerm2 = false;
    this.isTerm3 = false;
    this.isTerm4 = false;
    this.isTerm5 = false;
    this.isTerm6 = false;
    this.isTerm7 = false;
    this.isTerm8 = false;
    this.isTerm9 = false;
    this.isTerm10 = false;
    this.isTerm11 = false;
    this.isTerm12 = false;
    this.isDeposit = false;
    this.isNonPlan = false;
    this.terms1Filter.setValue(null);
    this.terms2Filter.setValue(null);
    this.terms3Filter.setValue(null);
    this.terms4Filter.setValue(null);
    this.terms5Filter.setValue(null);
    this.terms6Filter.setValue(null);
    this.terms7Filter.setValue(null);
    this.terms8Filter.setValue(null);
    this.terms9Filter.setValue(null);
    this.terms10Filter.setValue(null);
    this.terms11Filter.setValue(null);
    this.terms12Filter.setValue(null);

    this.school = [];
    this.campusList = [];
    this.levels = [];
    this.scholarSelected = [];
    this.schoolSelected = [];
    this.campusSelected = [];
    this.levelSelected = [];
    this.sectorList = [];
    this.specialityList = [];

    this.filteredType = of(this.typeList);
    this.getAllFinanceOrganization();
    this.getDataBillingForFilter();
    this.isDisabled = true;
    this.filterBreadcrumbData = [];
    if (this.scholarFilter.value) {
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAllFinanceOrganization();
      }
    }
  }
  getAllDataCheckboxForGenerate(pageNumber) {
    if (this.isCheckedAll) {
      if (pageNumber === 0) {
        this.allGenerateForCheckbox = [];
        this.dataSelected = [];
      }
      const pagination = {
        limit: 500,
        page: pageNumber,
      };
      this.isWaitingForResponse = true;
      const filter = this.filteredValues;
      const search = this.searchValues;
      this.subs.sink = this.financeService.GetAllFinanceOrganizationForGenerate(filter, pagination, search, this.sortValue).subscribe(
        (students: any) => {
          if (students && students.length) {
            this.allGenerateForCheckbox.push(...students);
            const page = pageNumber + 1;
            this.getAllDataCheckboxForGenerate(page);
          } else {
            this.isWaitingForResponse = false;
            if (this.isCheckedAll) {
              if (this.allGenerateForCheckbox && this.allGenerateForCheckbox.length) {
                this.dataSelected = this.allGenerateForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                if (this.dataSelected && this.dataSelected.length) {
                  const foundNoTerms = this.dataSelected.every((res) => res.term_times === 0);
                  if (foundNoTerms) {
                    this.hasNoTerms = true;
                  } else {
                    this.hasNoTerms = false;
                  }
                }
                this.onGenerate();
              }
            }
          }
        },
        (error) => {
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
    } else {
      this.onGenerate();
    }
  }

  onGenerate() {
    if (
      this.dataSelected.length < 1 &&
      (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length))
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8_A.Title'),
        html: this.translate.instant('Followup_S8_A.Text', { menu: this.translate.instant('finance') }),
        confirmButtonText: this.translate.instant('Followup_S8_A.Button'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-followup-s8-a');
        },
      });
    } else if (this.hasNoTerms) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Organization_S2.Title'),
        text: this.translate.instant('Organization_S2.Body'),
        confirmButtonText: this.translate.instant('Organization_S2.Button'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-organization-s2');
        },
      });
    } else {
      const id = [];
      this.dataSelected.forEach((item) => {
        id.push(item._id);
      });
      Swal.fire({
        type: 'question',
        text: this.translate.instant('Generate.question'),
        showCancelButton: true,
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
        cancelButtonText: this.translate.instant('INTERNSHIP_S2.BUTTON_2'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-generate-billing');
        },
      }).then((resp) => {
        this.isWaitingForResponse = true;
        this.isLoading = true;
        if (resp.value) {
          const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
          this.subs.sink = this.financeService
            .GenerateBillingFinanceOrganization(this.isCheckedAll, this.filteredValues, this.searchValues, id, userTypesList)
            .subscribe(
              (response) => {
                this.isLoading = false;
                if (response) {
                  Swal.fire({
                    type: 'success',
                    title: 'Bravo!',
                    confirmButtonText: 'OK',
                    allowEnterKey: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    onOpen: (modalEl) => {
                      modalEl.setAttribute('data-cy', 'swal-bravo');
                    },
                  }).then(() => {
                    this.isLoading = false;
                    this.isWaitingForResponse = false;
                    this.getAllFinanceOrganization();
                    this.selection.clear();
                    this.dataSelected = [];
                    this.allStudentForCheckbox = [];
                    this.allExportForCheckbox = [];
                    this.allGenerateForCheckbox = [];
                    this.allAssignDataForCheckbox = [];
                    this.allMailDataForCheckbox = [];
                    this.isCheckedAll = false;
                    this.userSelected = [];
                    this.userSelectedId = [];
                  });
                } else {
                  this.isLoading = false;
                  this.isWaitingForResponse = false;
                }
              },
              (err) => {
                this.userService.postErrorLog(err);
                this.isLoading = false;
                this.isWaitingForResponse = false;
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
          this.isLoading = false;
          this.isWaitingForResponse = false;
        }
      });
    }
  }
  getAllDataCheckboxForAssign(pageNumber) {
    if (this.isCheckedAll) {
      if (pageNumber === 0) {
        this.allAssignDataForCheckbox = [];
        this.dataSelected = [];
      }
      const pagination = {
        limit: 500,
        page: pageNumber,
      };
      this.isWaitingForResponse = true;
      const filter = this.filteredValues;
      const search = this.searchValues;
      this.subs.sink = this.financeService.GetAllFinanceOrganizationForGenerate(filter, pagination, search, this.sortValue).subscribe(
        (students: any) => {
          if (students && students.length) {
            this.allAssignDataForCheckbox.push(...students);
            const page = pageNumber + 1;
            this.getAllDataCheckboxForAssign(page);
          } else {
            this.isWaitingForResponse = false;
            if (this.isCheckedAll) {
              if (this.allAssignDataForCheckbox && this.allAssignDataForCheckbox.length) {
                this.dataSelected = this.allAssignDataForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                if (this.dataSelected && this.dataSelected.length) {
                  const foundNoTerms = this.dataSelected.every((res) => res.term_times === 0);
                  if (foundNoTerms) {
                    this.hasNoTerms = true;
                  } else {
                    this.hasNoTerms = false;
                  }
                }
                this.onAssign();
              }
            }
          }
        },
        (error) => {
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
    } else {
      this.onAssign();
    }
  }
  onAssign() {
    if (!this.dataSelected.length && (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length))) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8_A.Title'),
        html: this.translate.instant('Followup_S8_A.Text', { menu: this.translate.instant('finance') }),
        confirmButtonText: this.translate.instant('Followup_S8_A.Button'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-followup-s8-a');
        },
      });
    } else {
      if (!this.hasNoTerms) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Organization_S4.Title'),
          html: this.translate.instant('Organization_S4.Body'),
          confirmButtonText: this.translate.instant('Organization_S4.Button'),
          allowOutsideClick: false,
          allowEnterKey: false,
          allowEscapeKey: false,
          onOpen: (modalEl) => {
            modalEl.setAttribute('data-cy', 'swal-organization-s4');
          },
        });
      } else {
        this.openDialogAdd(this.dataSelected);
      }
    }
  }

  openDialogAdd(data?) {
    const id = [];
    if (data && data.length && data.length >= 1) {
      data.forEach((item) => {
        id.push(item?._id || item);
      });
    } else {
      id.push(data._id);
    }
    this.subs.sink = this.dialog
      .open(AssignTimelineTemplateDialogComponent, {
        width: '1320px',
        minHeight: '100px',
        disableClose: true,

        // this for static and dinamic dialog data
        data: {
          comps: {
            title: this.translate.instant('Assign timeline'),
            icon: null,
          },
          source: data,
          filter: this.filteredValues,
          search: this.searchValues,
          select_all: this.isCheckedAll,
          _id: id,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (!this.isReset && resp) {
          this.getAllFinanceOrganization();
          this.selection.clear();
          this.dataSelected = [];
          this.allStudentForCheckbox = [];
          this.isCheckedAll = false;
          this.userSelected = [];
          this.userSelectedId = [];
          this.allExportForCheckbox = [];
          this.allAssignDataForCheckbox = [];
          this.allMailDataForCheckbox = [];
          this.allGenerateForCheckbox = [];
        }
      });
  }
  openAddPaymentDialog(type, data) {
    const foundNoTerms = data && data?.terms?.length && data?.terms?.length > 0 ? false : true;
    if (foundNoTerms) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Organization_S2.Title'),
        text: this.translate.instant('Organization_S2.Body'),
        confirmButtonText: this.translate.instant('Organization_S2.Button'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-organization-s2');
        },
      });
    } else {
      this.subs.sink = this.dialog
        .open(AddPaymentOrganizationDialogComponent, {
          // width: width,
          width: '825px',
          minHeight: '100px',
          disableClose: true,
          // this for static and dinamic dialog data
          data: {
            comps: {
              title: type === 'add' ? 'Input a payment' : 'Edit a payment',
              icon: null,
              isEdit: type === 'edit' ? true : false,
              callFrom: 'payment_organization',
            },
            source: data,
            type: 'financeOrg',
          },
        })
        .afterClosed()
        .subscribe((resp) => {
          if (!this.isReset && resp) {
            this.getAllFinanceOrganization();
          }
        });
    }
  }

  openEditTermsDialog(data) {
    const termData = _.cloneDeep(data);
    const foundNoTerms = data && data.term_times && data.term_times > 0 ? false : true;
    const index = [];
    const termAvoir = termData.terms.filter((res, idx) => {
      if (res.term_amount === 0) {
        index.push(idx);
        return res;
      }
    });

    if (termAvoir && termAvoir.length > 0 && index && index.length > 0) {
      termData['term_avoir'] = termAvoir;
      termData['index'] = index;
    }

    if (foundNoTerms) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Organization_S2.Title'),
        text: this.translate.instant('Organization_S2.Body'),
        confirmButtonText: this.translate.instant('Organization_S2.Button'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-organization-s2');
        },
      });
    } else {
      this.subs.sink = this.dialog
        .open(ChangePaymentOrganizationDialogComponent, {
          width: '1050px',
          minHeight: '100px',
          disableClose: true,
          data: {
            comps: {
              tite: '',
            },
            source: termData,
          },
        })
        .afterClosed()
        .subscribe((resp) => {
          if (!this.isReset && resp) {
            this.getAllFinanceOrganization();
          }
        });
    }
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] === null || filterData[key] === '') {
        delete filterData[key];
      }
    });
    return filterData;
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
        const termsMoment = moment(terms.term_payment.date, 'DD/MM/YYYY');
        const checkMonthTerms = termsMoment.format('M');
        if (checkMonthTerms === isAugust && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          term1.push(terms);
        }
        if (checkMonthTerms === isSeptember && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          term2.push(terms);
        }
        if (checkMonthTerms === isOctober && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          term3.push(terms);
        }
        if (checkMonthTerms === isNovember && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          term4.push(terms);
        }
        if (checkMonthTerms === isDecember && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          term5.push(terms);
        }
        if (checkMonthTerms === isJanuary && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          term6.push(terms);
        }
        if (checkMonthTerms === isFebruary && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          term7.push(terms);
        }
        if (checkMonthTerms === isMarch && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          term8.push(terms);
        }
        if (checkMonthTerms === isApril && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          term9.push(terms);
        }
        if (checkMonthTerms === isMay && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          term10.push(terms);
        }
        if (checkMonthTerms === isJune && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          term11.push(terms);
        }
        if (checkMonthTerms === isJuly && terms.term_amount !== 0) {
          terms.terms_index = index + 1;
          term12.push(terms);
        }
      });
      element.terms_1 = term1;
      element.terms_2 = term2;
      element.terms_3 = term3;
      element.terms_4 = term4;
      element.terms_5 = term5;
      element.terms_6 = term6;
      element.terms_7 = term7;
      element.terms_8 = term8;
      element.terms_9 = term9;
      element.terms_10 = term10;
      element.terms_11 = term11;
      element.terms_12 = term12;
    });
    this.dataSource.data = data;
    this.paginator.length = data[0].count_document;
    this.dataCount = data[0].count_document;
    this.dataTableTerms = data;
  }

  getAllFinanceOrganization() {
    // console.log('Reload Page', data);
    this.dataSource.data = [];
    this.paginator.length = 0;
    this.dataCount = 0;
    this.isLoading = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    // console.log(pagination);
    const filter = this.cleanFilterData();
    const search = this.searchValues;
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.financeService.GetAllFinanceOrganization(filter, pagination, search, this.sortValue, userTypesList).subscribe(
      (students: any) => {
        if (this.isCheckedAll) {
          const pageDetecting = this.pageSelected.filter((page) => page === pagination.page);
          if (pageDetecting && pageDetecting.length < 1) {
            if (students && students.length) {
              students.forEach((element) => {
                this.selection.select(element);
              });
            }
          }
          this.pageSelected.push(this.paginator.pageIndex);
        } else {
          this.pageSelected = [];
        }
        if (students && students.length) {
          this.mappingTermDats(students);
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isLoading = false;
        this.isReset = false;
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      (err) => {
        this.userService.postErrorLog(err);
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.dataCount = 0;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isLoading = false;
        this.isReset = false;
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
  checkSuperFilterCampus() {
    const form = this.campusFilter.value;
    if (form && form.length) {
      this.campusFilter.patchValue(form);
    } else {
      this.campusFilter.patchValue(null);
    }
    this.getDataLevel();
  }

  getDataLevel() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    this.levels = [];
    this.sectorList = [];
    this.specialityList = [];
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.sectorFilter.value) {
      this.sectorFilter.setValue(null);
    }
    if (this.specialityFilter.value) {
      this.specialityFilter.setValue(null);
    }
    const schools = this.schoolsFilter.value;
    const sCampus = this.campusFilter.value;

    if (
      this.currentUser &&
      this.currentUser.entities &&
      this.currentUser.entities.length &&
      this.currentUser.app_data &&
      this.currentUser.app_data.school_package &&
      this.currentUser.app_data.school_package.length &&
      this.campusFilter.value &&
      this.campusFilter.value.length
    ) {
      if (sCampus && sCampus.length && !sCampus.includes('All')) {
        this.currentUser.app_data.school_package.forEach((element) => {
          if (element && element.school && element.school._id && (schools.includes(element.school._id) || schools.includes('All'))) {
            const sLevelList = this.campusList.filter((list) => {
              return sCampus.includes(list._id);
            });
            sLevelList.forEach((lev) => {
              if (lev && lev.levels && lev.levels.length) {
                this.levels = _.concat(this.levels, lev.levels);
              }
            });
          }
        });
      } else if (sCampus && sCampus.includes('All') && this.campusList && this.campusList.length) {
        this.campusList.forEach((lev) => {
          if (lev && lev.levels && lev.levels.length) {
            this.levels = _.concat(this.levels, lev.levels);
          }
        });
      }
    } else {
      if (schools && sCampus && !sCampus.includes('All')) {
        const sLevelList = this.campusList.filter((list) => {
          return sCampus.includes(list._id);
        });
        sLevelList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
            });
          }
        });
      } else if (sCampus && sCampus.includes('All') && this.campusList && this.campusList.length) {
        this.campusList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
            });
          }
        });
      } else {
        this.levels = [];
      }
    }
    this.levels = _.uniqBy(this.levels, 'name');
    this.levels = this.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }
  checkSuperFilterSchool() {
    const form = this.schoolsFilter.value;
    if (form && form.length) {
      this.schoolsFilter.patchValue(form);
    } else {
      this.schoolsFilter.patchValue(null);
    }
    this.getDataCampus();
  }

  getDataCampus() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    this.levels = this.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
    this.levels = [];
    this.campusList = [];
    this.sectorList = [];
    this.specialityList = [];
    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.sectorFilter.value) {
      this.sectorFilter.setValue(null);
    }
    if (this.specialityFilter.value) {
      this.specialityFilter.setValue(null);
    }
    const schools = this.schoolsFilter.value;
    if (
      this.currentUser &&
      this.currentUser.entities &&
      this.currentUser.entities.length &&
      this.currentUser.app_data &&
      this.currentUser.app_data.school_package &&
      this.currentUser.app_data.school_package.length &&
      this.schoolsFilter.value &&
      this.schoolsFilter.value.length
    ) {
      this.superFilter.school_ids = this.schoolsFilter.value && !this.schoolsFilter.value.includes('All') ? this.schoolsFilter.value : null;
      if (schools && !schools.includes('All')) {
        schools.forEach((element) => {
          const sName = this.school.find((list) => list._id === element);
          this.schoolName = this.schoolName ? this.schoolName + ',' + sName.short_name : sName.short_name;
        });
      }
      this.currentUser.app_data.school_package.forEach((element) => {
        if (element && element.school && element.school._id && (schools.includes(element.school._id) || schools.includes('All'))) {
          this.campusList = _.concat(this.campusList, element.school.campuses);
        }
      });
    } else {
      if (schools && !schools.includes('All')) {
        const school = this.schoolsFilter.value;
        const scampusList = this.listObjective.filter((list) => {
          return school.includes(list._id);
        });
        scampusList.filter((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.filter((campusData, nex) => {
              this.campusList.push(campusData);
            });
          }
        });
      } else if (schools && schools.includes('All') && this.listObjective && this.listObjective.length) {
        this.listObjective.forEach((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.forEach((campusData, nex) => {
              this.campusList.push(campusData);
            });
          }
        });
      } else {
        this.campusList = [];
      }
    }

    this.getDataLevel();
    const campuses = _.chain(this.campusList)
      .groupBy('name')
      .map((value, key) => ({
        name: key,
        _id: value && value.length ? value[0]._id : null,
        campuses: value,
      }))
      .value();
    if (campuses && campuses.length) {
      campuses.forEach((element, idx) => {
        let levelList = [];
        if (element && element.campuses && element.campuses.length) {
          element.campuses.forEach((camp, idCampx) => {
            levelList = _.concat(levelList, camp.levels);
          });
        }
        campuses[idx]['levels'] = _.uniqBy(levelList, 'name');
      });
    }
    this.campusList = _.uniqBy(campuses, '_id');
    this.campusList = this.campusList.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }

  getDataForList(data?) {
    const name = data && data !== 'ALL' && data !== 'All' ? data : '';
    const filter = 'filter: { scholar_season_id:' + `"${name}"` + '}';
    this.subs.sink = this.candidatesService.GetAllSchoolFilter(name, filter, this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp) {
          if (
            this.currentUser &&
            this.currentUser.entities &&
            this.currentUser.entities.length &&
            this.currentUser.app_data &&
            this.currentUser.app_data.school_package &&
            this.currentUser.app_data.school_package.length
          ) {
            console.log('data 1.2');
            const schoolsList = [];
            this.currentUser.app_data.school_package.forEach((element) => {
              schoolsList.push(element.school);
            });
            this.listObjective = schoolsList;
            this.school = this.listObjective;
            this.school = this.school.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0));
          } else {
            this.listObjective = resp;
            this.school = this.listObjective;
            this.school = this.school.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0));
          }
          this.getDataCampus();
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
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

  scholarSelect() {
    console.log('scholar selected:: ');
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    this.school = [];
    this.levels = [];
    this.campusList = [];
    this.sectorList = [];
    this.specialityList = [];
    if (this.schoolsFilter.value) {
      this.schoolsFilter.setValue(null);
    }
    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.sectorFilter.value) {
      this.sectorFilter.setValue(null);
    }
    if (this.specialityFilter.value) {
      this.specialityFilter.setValue(null);
    }
    if (!this.scholarFilter.value || this.scholarFilter.value.length === 0) {
      this.superFilter['scholar_season_id'] = '';
      this.scholarSelected = [];
      this.getDataForList();
    } else {
      this.superFilter['scholar_season_id'] =
        this.scholarFilter.value !== 'All' && this.scholarFilter.value !== 'ALL' ? this.scholarFilter.value : null;
      // this.scholarSelected = this.scholarFilter.value;
      const found = this.scholars.find((res) => res._id === this.scholarFilter.value);
      this.scholarSelected = found && found ? found.scholar_season : null;
      // this.getAllFinanceOrganization('scholars Filter');
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }
  }
  checkSuperFilterLevel() {
    const form = this.levelFilter.value;
    if (form && form.length) {
      this.levelFilter.patchValue(form);
    } else {
      this.levelFilter.patchValue(null);
    }
    this.getDataByLevel();
  }
  checkSuperFilterTags() {
    const form = this.tagFilter.value;
    if (form && form.length) {
      this.tagFilter.patchValue(form);
    } else {
      this.tagFilter.patchValue(null);
    }
  }

  getDataByLevel() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    this.levels = _.uniqBy(this.levels, 'name');
    this.getAllSector();
  }
  getAllSector() {
    let allSchool = [];
    let allCampus = [];
    let allLevel = [];

    this.sectorList = [];
    this.specialityList = [];
    this.sectorFilter.setValue(null);
    this.specialityFilter.setValue(null);
    this.superFilter.sectors = null;
    this.superFilter.specialities = null;

    if (this.schoolsFilter.value?.length && this.schoolsFilter.value.includes('All') && this.listObjective?.length) {
      allSchool = this.listObjective.map((data) => data._id);
    }
    if (this.campusFilter.value?.length && this.campusList?.length && this.campusFilter.value.includes('All')) {
      allCampus = this.campusList.map((data) => data._id);
    }
    if (this.levelFilter.value?.length && this.levelFilter.value.includes('All') && this.levels?.length) {
      allLevel = this.levels.map((data) => data._id);
    }
    const filter = {
      scholar_season_id: this.scholarFilter.value && !this.scholarFilter.value?.includes('All') ? this.scholarFilter.value : null,
      candidate_school_ids: allSchool?.length ? allSchool : this.schoolsFilter.value?.length ? this.schoolsFilter.value : null,
      campuses: allCampus?.length ? allCampus : this.campusFilter?.value?.length ? this.campusFilter.value : null,
      levels: allLevel?.length ? allLevel : this.levelFilter.value?.length ? this.levelFilter.value : null,
    };
    if (this.levelFilter.value?.length) {
      this.subs.sink = this.financeService.GetAllSectorsDropdown(filter).subscribe(
        (resp) => {
          if (resp?.length) {
            this.sectorList = _.cloneDeep(resp);
          }
        },
        (err) => {
          this.userService.postErrorLog(err);
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
          }
        },
      );
    }
  }
  selectSectorFilter() {
    const form = this.sectorFilter.value;
    if (form && form.length) {
      this.sectorFilter.patchValue(form);
    } else {
      this.sectorFilter.patchValue(null);
    }
    this.getAllSpeciality();
  }
  getAllSpeciality() {
    let allSchool = [];
    let allCampus = [];
    let allLevel = [];
    let allSector = [];

    this.specialityList = [];
    this.specialityFilter.setValue(null);
    this.superFilter.specialities = null;

    if (this.schoolsFilter.value?.length && this.schoolsFilter.value.includes('All') && this.listObjective?.length) {
      allSchool = this.listObjective.map((data) => data._id);
    }
    if (this.campusFilter.value?.length && this.campusList?.length && this.campusFilter.value.includes('All')) {
      allCampus = this.campusList.map((data) => data._id);
    }
    if (this.levelFilter.value?.length && this.levelFilter.value.includes('All') && this.levels?.length) {
      allLevel = this.levels.map((data) => data._id);
    }
    if (this.sectorFilter?.value?.length && this.sectorList?.length) {
      allSector = this.sectorList.map((sector) => sector._id);
    }
    const filter = {
      scholar_season_id: this.scholarFilter.value && !this.scholarFilter.value?.includes('All') ? this.scholarFilter.value : null,
      candidate_school_ids: allSchool?.length ? allSchool : this.schoolsFilter.value?.length ? this.schoolsFilter.value : null,
      campuses: allCampus?.length ? allCampus : this.campusFilter.value?.length ? this.campusFilter.value : null,
      levels: allLevel?.length ? allLevel : this.levelFilter.value?.length ? this.levelFilter.value : null,
      sectors: allSector && allSector.length ? allSector : this.sectorFilter?.value?.lenth ? this.sectorFilter.value : null,
    };
    if (this.sectorFilter?.value?.length) {
      this.subs.sink = this.candidatesService.GetAllSpecializationsByScholar(filter).subscribe(
        (resp) => {
          if (resp?.length) {
            this.specialityList = _.cloneDeep(resp);
          }
        },
        (err) => {
          this.userService.postErrorLog(err);
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
          }
        },
      );
    }
  }
  selectSpecialityFilter() {
    const form = this.specialityFilter.value;
    if (form && form.length) {
      this.specialityFilter.patchValue(form);
    }
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

  checkHasFullDiscount(element) {
    if (
      element &&
      element.candidate_id &&
      element.candidate_id.registration_profile &&
      element.candidate_id.registration_profile.discount_on_full_rate &&
      element.candidate_id.registration_profile.discount_on_full_rate === 100
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkHasNoDP(element) {
    if (
      element &&
      element.candidate_id &&
      element.candidate_id.registration_profile &&
      element.candidate_id.registration_profile.is_down_payment &&
      element.candidate_id.registration_profile.is_down_payment === 'no'
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkHasNoAddtionalCost(element) {
    if (
      element &&
      element.candidate_id &&
      element.candidate_id.selected_payment_plan &&
      element.candidate_id.selected_payment_plan.additional_expense === 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkNoPayment(element) {
    if (this.checkHasFullDiscount(element) && this.checkHasNoAddtionalCost(element)) {
      return true;
    } else {
      return false;
    }
  }

  checkHasMethodPayment(element) {
    // to check if candidate has 100% discount method of payment will be x
    if (this.checkHasFullDiscount(element)) {
      return true;
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

  checkIsNumber(num) {
    let allow = false;
    if (Number.isInteger(num)) {
      allow = true;
    }
    return allow;
  }

  getTermsIndex(data, range1, range2) {
    let index = 0;
    if (data && data.length) {
      data.forEach((element, indexTerm) => {
        const found =
          moment(element.term_payment.date).isBetween(moment(range1, 'DD/MM/YYYY'), moment(range2, 'DD/MM/YYYY')) ||
          element.term_payment.date === range2;
        if (found) {
          index = indexTerm;
        }
      });
    }
    return index;
  }

  checkPaymentLate(planned) {
    const lastPlanMonth = moment(planned, 'DD/MM/YYYY').endOf('month');
    const lastCurrentMonth = moment().endOf('month');
    const found = lastCurrentMonth.isAfter(moment(lastPlanMonth, 'DD/MM/YYYY'));
    return found;
  }

  isNonPayable(data, range1, range2) {
    let found = false;
    found = true;
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

  changedPlan(data) {
    let found = false;
    if (data.term_payment_deferment && data.term_payment_deferment.date) {
      found =
        moment().isBefore(moment(data.term_payment_deferment.date, 'DD/MM/YYYY')) ||
        moment().isSame(moment(data.term_payment_deferment.date, 'DD/MM/YYYY'));
    }
    return found;
  }

  formatCurrencyFloat(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
      num = num.toString().slice(0, -3);
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

  checkPartiallyTerms(element) {
    // check if partial or not
    if (element && element.is_partial) {
      // make sure term_pay_date and term_payment has value because we need to check if element.term_payment if after element.term_pay_date
      if (element.term_pay_date && element.term_pay_date.date && element.term_payment && element.term_payment.date) {
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

  formatCurrency(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
    }
    return num;
  }

  viewCandidateInfo(candidateId, tab?, subTab?) {
    const query = {
      selectedCandidate: candidateId,
      tab: tab || '',
      subTab: subTab || '',
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
  getAllDataCheckboxForMultipleMail(pageNumber) {
    if (this.isCheckedAll) {
      if (pageNumber === 0) {
        this.allMailDataForCheckbox = [];
        this.dataSelected = [];
      }
      const pagination = {
        limit: 500,
        page: pageNumber,
      };
      this.isWaitingForResponse = true;
      const filter = this.filteredValues;
      const search = this.searchValues;
      this.subs.sink = this.financeService.GetAllFinanceOrganizationForMultipleMail(filter, pagination, search, this.sortValue).subscribe(
        (students: any) => {
          if (students && students.length) {
            this.allMailDataForCheckbox.push(...students);
            const page = pageNumber + 1;
            this.getAllDataCheckboxForMultipleMail(page);
          } else {
            this.isWaitingForResponse = false;
            if (this.isCheckedAll) {
              if (this.allMailDataForCheckbox && this.allMailDataForCheckbox.length) {
                this.dataSelected = this.allMailDataForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                this.multipleMail();
              }
            }
          }
        },
        (error) => {
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
    } else {
      this.multipleMail();
    }
  }
  multipleMail() {
    if (!this.dataSelected.length && (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length))) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('finance') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-followup-s8');
        },
      });
    } else {
      this.isWaitingForResponse = true;
      let item;
      const id = [];
      this.dataSelected.forEach((items) => {
        if (items && items.organization_id) {
          id.push(items.organization_id._id);
        }
      });
      const orgId =
        this.dataSelected && this.dataSelected.length && this.dataSelected[0] && this.dataSelected[0].organization_id
          ? this.dataSelected[0].organization_id._id
          : null;
      this.subs.sink = this.financeService.getAllContacts(id, null, null, null, null).subscribe(
        (res) => {
          if (res) {
            item = _.cloneDeep(res);
            this.isWaitingForResponse = false;
            if (item && item.length > 0) {
              this.subs.sink = this.dialog
                .open(InternshipEmailDialogComponent, {
                  width: '600px',
                  minHeight: '100px',
                  disableClose: true,
                  data: {
                    data: item,
                    note: 'finance_org',
                  },
                })
                .afterClosed()
                .subscribe((resp) => {
                  if (!this.isReset && resp) {
                    this.getAllFinanceOrganization();
                  }
                });
            } else {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('NO_CONTACT.TITLE'),
                text: this.translate.instant('NO_CONTACT.TEXT'),
                confirmButtonText: this.translate.instant('NO_CONTACT.BUTTON'),
                onOpen: (modalEl) => {
                  modalEl.setAttribute('data-cy', 'swal-no-contact');
                },
              });
            }
          }
        },
        (error) => {
          this.userService.postErrorLog(error);
          this.isLoading = false;
          this.swalError(error);
          return;
        },
      );
    }
  }

  internshipMailDialog(data) {
    const orgId = data && data.organization_id ? data.organization_id._id : null;
    this.isWaitingForResponse = true;
    let item;
    this.subs.sink = this.formFillingService.getAllContacts(orgId, null, null, null, null).subscribe(
      (res) => {
        if (res) {
          item = _.cloneDeep(res);
          this.isWaitingForResponse = false;
          if (item && item.length > 0) {
            this.subs.sink = this.dialog
              .open(InternshipEmailDialogComponent, {
                width: '600px',
                minHeight: '100px',
                disableClose: true,
                data: {
                  data: item,
                  note: 'finance_org',
                },
              })
              .afterClosed()
              .subscribe((resp) => {
                if (!this.isReset && resp) {
                  this.getAllFinanceOrganization();
                }
              });
          } else {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('NO_CONTACT.TITLE'),
              text: this.translate.instant('NO_CONTACT.TEXT'),
              confirmButtonText: this.translate.instant('NO_CONTACT.BUTTON'),
              onOpen: (modalEl) => {
                modalEl.setAttribute('data-cy', 'swal-no-contact');
              },
            });
          }
        }
      },
      (error) => {
        this.userService.postErrorLog(error);
        this.isLoading = false;
        this.swalError(error);
        return;
      },
    );
  }

  swalError(err) {
    this.isLoading = false;
    console.log('[Response BE][Error] : ', err);
    if (err['message'] === 'GraphQL error: This admission user type already have student admitted to this user!') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('User_S3.TITLE'),
        text: this.translate.instant('User_S3.TEXT'),
        confirmButtonText: this.translate.instant('User_S3.BUTTON'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-user-s3');
        },
      });
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
        confirmButtonText: 'OK',
      });
    }
  }
  getAllIdForCheckbox(pageNumber) {
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
        this.isWaitingForResponse = true;
        const filter = this.filteredValues;
        const search = this.searchValues;
        this.subs.sink = this.financeService.GetAllFinanceOrganizationId(filter, pagination, search, this.sortValue).subscribe(
          (students: any) => {
            if (students && students.length) {
              this.allExportForCheckbox.push(...students);
              const page = pageNumber + 1;
              this.getAllIdForCheckbox(page);
            } else {
              this.isWaitingForResponse = false;
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
    } else {
      this.downloadCSV();
    }
  }

  downloadCSV() {
    if (
      this.dataSelected &&
      this.dataSelected.length < 1 &&
      (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length)) &&
      this.buttonClicked !== 'export-controlling'
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('finance') }),
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
          if (this.buttonClicked === 'export-controlling') {
            this.openExportControllerCsv(fileType);
          } else {
            this.openDownloadCsv(fileType);
          }
        }
      });
    }
  }

  cleanFilterDataDownload() {
    const filterData = _.cloneDeep(this.filteredValues);
    let schoolsMap;
    let levelsMap;
    let campusesMap;
    let tagsMap;
    let sectorsMap;
    let specialitiesMap;
    const multipleFilter = [
      'type_of_organizations',
      'intake_channels',
      'student_types',
      'first_terms',
      'second_terms',
      'third_terms',
      'fourth_terms',
      'fifth_terms',
      'sixth_terms',
      'seventh_terms',
      'eighth_terms',
      'ninth_terms',
      'tenth_terms',
      'eleventh_terms',
      'twelveth_terms',
    ];

    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'intake_channel' ||
          key === 'student_type' ||
          key === 'candidate_id' ||
          key === 'first_term' ||
          key === 'second_term' ||
          key === 'third_term' ||
          key === 'fifth_term' ||
          key === 'sixth_term' ||
          key === 'seventh_term' ||
          key === 'eighth_term' ||
          key === 'ninth_term' ||
          key === 'tenth_term' ||
          key === 'eleventh_term' ||
          key === 'twelveth_term' ||
          key === 'term_from' ||
          key === 'term_to' ||
          key === 'term_status' ||
          key === 'scholar_season_id' ||
          key === 'type_of_organization'
        ) {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        } else if (multipleFilter.includes(key)) {
          const mappedData = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${mappedData}]` : filterQuery + `"${key}":[${mappedData}]`;
        } else if (key === 'school_ids') {
          schoolsMap = filterData.school_ids.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"school_ids":[${schoolsMap}]` : filterQuery + `"school_ids":[${schoolsMap}]`;
        } else if (key === 'levels') {
          levelsMap = filterData.levels.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"levels":[${levelsMap}]` : filterQuery + `"levels":[${levelsMap}]`;
        } else if (key === 'campuses') {
          campusesMap = filterData.campuses.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"campuses":[${campusesMap}]` : filterQuery + `"campuses":[${campusesMap}]`;
        } else if (key === 'tag_ids') {
          tagsMap = filterData.tag_ids.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"tag_ids":[${tagsMap}]` : filterQuery + `"tag_ids":[${tagsMap}]`;
        } else if (key === 'sectors') {
          sectorsMap = filterData.sectors.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"sectors":[${sectorsMap}]` : filterQuery + `"sectors":[${sectorsMap}]`;
        } else if (key === 'specialities') {
          specialitiesMap = filterData.specialities.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"specialities":[${specialitiesMap}]`
            : filterQuery + `"specialities":[${specialitiesMap}]`;
        } else {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${filterData[key]}` : filterQuery + `"${key}":${filterData[key]}`;
        }
      }
    });
    return 'filter={' + filterQuery + '}';
  }

  cleanSearchingDataDownload() {
    const filterData = _.cloneDeep(this.searchValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'organization_name' || key === 'student_number' || key === 'student_name' || key === 'organization_type') {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        }
      }
    });
    return 'search={' + filterQuery + '}';
  }
  cleanFilterDataExportControlling() {
    const filterData = _.cloneDeep(this.exportFilteredValues);
    Object.keys(filterData).forEach((key) => {
      if (!filterData[key] && filterData[key] !== false) {
        delete filterData[key];
      } else if (key !== 'scholar_season_id' && key !== 'schools' && key !== 'offset') {
        delete filterData[key];
      }
    });
    return '"filter":' + JSON.stringify(filterData);
  }
  openDownloadCsv(fileType) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const filter = this.cleanFilterDataDownload();
    const search = this.cleanSearchingDataDownload();
    const importStudentTemlate = `downloadFinanceOrganizationCSV/`;
    // console.log('_ini filter', filter, this.userSelectedId);
    let filtered;
    if (
      (this.dataSelected && this.dataSelected.length && !this.isCheckedAll) ||
      (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length)
    ) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      const billing = `"finance_organization_ids":` + '[' + mappedUserId.toString() + ']';
      if (filter.length > 9) {
        filtered = filter.slice(0, 8) + billing + ',' + filter.slice(8);
      } else {
        filtered = filter.slice(0, 8) + billing + filter.slice(8);
      }
    } else if (this.isCheckedAll) {
      filtered = filter;
    }
    let uri = '';
    const userTypesList =
      this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id.map((res) => `"` + res + `"`) : [];
    const sorting = this.sortingForExport();
    console.log('uat389', filtered);
    let fullUrl;
    if (search) {
      console.log('uat389', search);
      fullUrl =
        url +
        importStudentTemlate +
        fileType +
        '/' +
        lang +
        '/' +
        this.currentUser._id +
        '/' +
        this.currentUserTypeId +
        '?' +
        filtered +
        '&' +
        search +
        '&user_type_ids=[' +
        userTypesList +
        ']' +
        '&' +
        sorting;
      uri = encodeURI(fullUrl);
    } else {
      fullUrl =
        url +
        importStudentTemlate +
        fileType +
        '/' +
        lang +
        '/' +
        this.currentUser._id +
        '/' +
        this.currentUserTypeId +
        '?' +
        filtered +
        '&user_type_ids=[' +
        userTypesList +
        ']' +
        '&' +
        sorting;
      uri = encodeURI(fullUrl);
    }
    this.buttonClicked = '';
    console.log('fullURL', fullUrl);
    // element.target = '_blank';
    // element.download = 'Template Import CSV';
    // document.body.appendChild(element);
    // element.click();
    // document.body.removeChild(element);
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
      }),
    };

    this.isWaitingForResponse = true;
    this.httpClient.get(`${uri}`, httpOptions).subscribe(
      (res) => {
        if (res) {
          this.isWaitingForResponse = false;
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
          this.isWaitingForResponse = false;
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
  openExportControllerCsv(fileType) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const lang = this.translate.currentLang.toLowerCase();
    let fullURL;
    let filtered;
    fullURL = url + 'downloadControlingReport/' + fileType + '/' + lang + '/' + this.currentUserTypeId;
    const uri = encodeURI(fullURL);
    filtered = this.cleanFilterDataExportControlling();
    console.log('fullURL', fullURL);
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
      }),
    };
    const userTypesList =
      this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id.map((res) => `"` + res + `"`) : [];
    const sorting = this.sortingForExportOfAllLines();

    const payload =
      '{' +
      filtered +
      ',' +
      '"user_type_ids":[' +
      userTypesList +
      ']' +
      ',"user_type_id":' +
      `"${this.currentUserTypeId}"` +
      ',' +
      sorting +
      '}';
    this.exportControllingStudent(uri, httpOptions, payload);
  }
  exportControllingStudent(uri, httpOptions, payload) {
    this.isLoading = true;
    this.isWaitingForResponse = true;
    this.subs.sink = this.httpClient.post(uri, payload, httpOptions).subscribe(
      (res) => {
        if (res) {
          this.isLoading = false;
          this.isWaitingForResponse = false;
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
            if (this.buttonClicked === 'export-controlling' && this.exportFilteredValues) {
              this.buttonClicked = '';
              this.exportFilteredValues['scholar_season_id'] = null;
              this.exportFilteredValues['schools'] = null;
            }
            this.resetCandidateKeepFilter();
          });
        } else {
          this.isLoading = false;
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isLoading = false;
        this.isWaitingForResponse = false;
      },
    );
  }
  sortingForExportOfAllLines() {
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
  // refetch candidate data but keep current filter
  resetCandidateKeepFilter() {
    this.clearSelectIfFilter();
    this.getAllFinanceOrganization();
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
    return 'sorting={' + data + '}';
  }
  applySuperFilter() {
    this.allStudentForCheckbox = [];
    this.isCheckedAll = false;
    this.paginator.pageIndex = 0;
    this.filteredValues = {
      ...this.filteredValues,
      scholar_season_id: this.superFilter.scholar_season_id,
      school_ids: this.superFilter.school_ids,
      campuses: this.superFilter.campuses,
      levels: this.superFilter.levels,
      tag_ids: this.superFilter.tag_ids,
      sectors: this.superFilter.sectors ? this.superFilter.sectors : null,
      specialities: this.superFilter.specialities ? this.superFilter.specialities : null,
    };
    this.isDisabled = true;
    this.getAllFinanceOrganization();
  }
  clearSelectIfFilter() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
  }
  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      // super filter
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'scholar_season_id', // name of the key in the object storing the filter
        column: 'CARDDETAIL.Scholar Season', // name of the column in the table or the field if super filter
        isMultiple: true, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.scholars, // the array/list holding the dropdown options
        filterRef: this.scholarFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'scholar_season', // the key displayed in the html (only applicable to array of objects)
        savedValue: '_id', // the value saved when user select an option (e.g. _id)
        resetValue: 'All',
      },
      {
        type: 'super_filter',
        name: 'school_ids',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.School',
        isMultiple: this.schoolsFilter?.value?.length === this.school?.length ? false : true,
        filterValue: this.schoolsFilter?.value?.length === this.school?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.schoolsFilter?.value?.length === this.school?.length ? null : this.school,
        filterRef: this.schoolsFilter,
        displayKey: this.schoolsFilter?.value?.length === this.school?.length ? null : 'short_name',
        savedValue: this.schoolsFilter?.value?.length === this.school?.length ? null : '_id',
        isSelectionInput: this.schoolsFilter?.value?.length === this.school?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'campuses',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus',
        isMultiple: this.campusFilter?.value?.length === this.campusList?.length ? false : true,
        filterValue: this.campusFilter?.value?.length === this.campusList?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.campusFilter?.value?.length === this.campusList?.length ? null : this.campusList,
        filterRef: this.campusFilter,
        displayKey: this.campusFilter?.value?.length === this.campusList?.length ? null : 'name',
        savedValue: this.campusFilter?.value?.length === this.campusList?.length ? null : '_id',
        isSelectionInput: this.campusFilter?.value?.length === this.campusList?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'levels',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level',
        isMultiple: this.levelFilter?.value?.length === this.levels?.length ? false : true,
        filterValue: this.levelFilter?.value?.length === this.levels?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.levelFilter?.value?.length === this.levels?.length ? null : this.levels,
        filterRef: this.levelFilter,
        displayKey: this.levelFilter?.value?.length === this.levels?.length ? null : 'name',
        savedValue: this.levelFilter?.value?.length === this.levels?.length ? null : '_id',
        isSelectionInput: this.levelFilter?.value?.length === this.levels?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'sectors',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Sector',
        isMultiple: this.sectorFilter?.value?.length === this.sectorList?.length ? false : true,
        filterValue: this.sectorFilter?.value?.length === this.sectorList?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.sectorFilter?.value?.length === this.sectorList?.length ? null : this.sectorList,
        filterRef: this.sectorFilter,
        displayKey: this.sectorFilter?.value?.length === this.sectorList?.length ? null : 'name',
        savedValue: this.sectorFilter?.value?.length === this.sectorList?.length ? null : '_id',
        isSelectionInput: this.sectorFilter?.value?.length === this.sectorList?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'specialities',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Speciality',
        isMultiple: this.specialityFilter?.value?.length === this.specialityList?.length ? false : true,
        filterValue: this.specialityFilter?.value?.length === this.specialityList?.length ? this.filteredValuesAll : this.superFilter,
        filterList: this.specialityFilter?.value?.length === this.specialityList?.length ? null : this.specialityList,
        filterRef: this.specialityFilter,
        displayKey: this.specialityFilter?.value?.length === this.specialityList?.length ? null : 'name',
        savedValue: this.specialityFilter?.value?.length === this.specialityList?.length ? null : '_id',
        isSelectionInput: this.specialityFilter?.value?.length === this.specialityList?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'term_from',
        column: 'From',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.fromDateFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
      },
      {
        type: 'super_filter',
        name: 'term_to',
        column: 'To',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.toDateFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
      },
      {
        type: 'super_filter',
        name: 'term_status',
        column: 'Status',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.statusFilterList,
        filterRef: this.statusFilter,
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'key',
        savedValue: 'value',
        resetValue: 'All',
      },
      // tabel
      {
        type: 'table_filter',
        name: 'type_of_organizations',
        column: 'Type of Organization',
        isMultiple: this.organizationTypeFilter?.value?.length === this.typeList?.length ? false : true,
        filterValue: this.organizationTypeFilter?.value?.length === this.typeList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.organizationTypeFilter?.value?.length === this.typeList?.length ? null : this.typeList,
        filterRef: this.organizationTypeFilter,
        displayKey: this.organizationTypeFilter?.value?.length === this.typeList?.length ? null : 'name',
        savedValue: this.organizationTypeFilter?.value?.length === this.typeList?.length ? null : 'name',
        isSelectionInput: this.organizationTypeFilter?.value?.length === this.typeList?.length ? false : true,
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'organization_name',
        column: 'Organization Name',
        isMultiple: false,
        filterValue: this.searchValues,
        filterList: null,
        filterRef: this.organizationNameFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'student_number',
        column: 'Student Number',
        isMultiple: false,
        filterValue: this.searchValues,
        filterList: null,
        filterRef: this.studentNumberFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'student_name',
        column: 'Student Name',
        isMultiple: false,
        filterValue: this.searchValues,
        filterList: null,
        filterRef: this.studentFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'intake_channels',
        column: 'Student Program',
        isMultiple: this.currentProgramFilter?.value?.length === this.intakeList?.length ? false : true,
        filterValue: this.currentProgramFilter?.value?.length === this.intakeList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.currentProgramFilter?.value?.length === this.intakeList?.length ? null : this.intakeList,
        filterRef: this.currentProgramFilter,
        displayKey: this.currentProgramFilter?.value?.length === this.intakeList?.length ? null : 'program',
        savedValue: this.currentProgramFilter?.value?.length === this.intakeList?.length ? null : '_id',
        isSelectionInput: this.currentProgramFilter?.value?.length === this.intakeList?.length ? false : true,
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'student_types',
        column: 'Type of Formation',
        isMultiple: this.studentTypeFilter?.value?.length === this.studentType?.length ? false : true,
        filterValue: this.studentTypeFilter?.value?.length === this.studentType?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.studentTypeFilter?.value?.length === this.studentType?.length ? null : this.studentType,
        filterRef: this.studentTypeFilter,
        displayKey: this.studentTypeFilter?.value?.length === this.studentType?.length ? null : 'type_of_formation',
        savedValue: this.studentTypeFilter?.value?.length === this.studentType?.length ? null : '_id',
        isSelectionInput: this.studentTypeFilter?.value?.length === this.studentType?.length ? false : true,
        resetValue: null,
      },
      // term
      {
        type: 'table_filter',
        name: 'first_terms',
        column: 'Term 1',
        isMultiple: this.terms1Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms1Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms1Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms1Filter,
        isSelectionInput: this.terms1Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms1Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms1Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'second_terms',
        column: 'Term 2',
        isMultiple: this.terms2Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms2Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms2Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms2Filter,
        isSelectionInput: this.terms2Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms2Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms2Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'third_terms',
        column: 'Term 3',
        isMultiple: this.terms3Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms3Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms3Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms3Filter,
        isSelectionInput: this.terms3Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms3Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms3Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'fourth_terms',
        column: 'Term 4',
        isMultiple: this.terms4Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms4Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms4Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms4Filter,
        isSelectionInput: this.terms4Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms4Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms4Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'fifth_terms',
        column: 'Term 5',
        isMultiple: this.terms5Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms5Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms5Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms5Filter,
        isSelectionInput: this.terms5Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms5Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms5Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'sixth_terms',
        column: 'Term 6',
        isMultiple: this.terms6Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms6Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms6Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms6Filter,
        isSelectionInput: this.terms6Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms6Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms6Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'seventh_terms',
        column: 'Term 7',
        isMultiple: this.terms7Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms7Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms7Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms7Filter,
        isSelectionInput: this.terms7Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms7Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms7Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'eighth_terms',
        column: 'Term 8',
        isMultiple: this.terms8Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms8Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms8Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms8Filter,
        isSelectionInput: this.terms8Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms8Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms8Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'ninth_terms',
        column: 'Term 9',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.DPandTermsFilterList,
        filterRef: this.terms9Filter,
        isSelectionInput: true,
        displayKey: this.terms9Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms9Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'tenth_terms',
        column: 'Term 10',
        isMultiple: this.terms10Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms10Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms10Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms10Filter,
        isSelectionInput: this.terms10Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms10Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms10Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'eleventh_terms',
        column: 'Term 11',
        isMultiple: this.terms11Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms11Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms11Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms11Filter,
        isSelectionInput: this.terms11Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms11Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms11Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'twelveth_terms',
        column: 'Term 12',
        isMultiple: this.terms12Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        filterValue: this.terms12Filter?.value?.length === this.DPandTermsFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.terms12Filter?.value?.length === this.DPandTermsFilterList?.length ? null : this.DPandTermsFilterList,
        filterRef: this.terms12Filter,
        isSelectionInput: this.terms12Filter?.value?.length === this.DPandTermsFilterList?.length ? false : true,
        displayKey: this.terms12Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'key',
        savedValue: this.terms12Filter?.value?.length === this.DPandTermsFilterList?.length ? null : 'value',
        resetValue: null,
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
    console.log('cek data', this.filterBreadcrumbData);
  }
  removeSuperFilter(removeFilterCascadeName) {
    if (this.filterBreadcrumbData?.length && removeFilterCascadeName?.length) {
      removeFilterCascadeName.forEach((filter) => {
        const filterBreadcrumb = this.filterBreadcrumbData.find((data) => data.name === filter);
        if (filterBreadcrumb) {
          filterBreadcrumb.filterRef.setValue(null, { emitEvent: false });
          this.superFilter[filterBreadcrumb.name] = null;
          this.filteredValues[filterBreadcrumb.name] = null;
        }
      });
    }
  }
  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      let superFilterValue;
      let tableFilterValue;
      if (filterItem.name === 'term_from' || filterItem.name === 'term_to' || filterItem.name === 'term_status') {
        superFilterValue = this.filteredValues;
      } else {
        superFilterValue = this.superFilter;
      }
      if (
        filterItem.name === 'organization_type' ||
        filterItem.name === 'organization_name' ||
        filterItem.name === 'student_number' ||
        filterItem.name === 'student_name'
      ) {
        tableFilterValue = this.searchValues;
      } else {
        tableFilterValue = this.filteredValues;
      }

      this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, superFilterValue, tableFilterValue);
      if (filterItem.type === 'super_filter' && superFilterValue) {
        if (this.filteredValues && this.filteredValues[filterItem?.name]) {
          this.filteredValues[filterItem?.name] = null;
        }
        if (filterItem.name === 'scholar_season_id') {
          this.removeSuperFilter(['school_ids', 'campuses', 'levels', 'sectors', 'specialities']);
          const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
          this.getDataForList(scholarSeason);
        } else if (filterItem.name === 'school_ids') {
          this.removeSuperFilter(['campuses', 'levels', 'sectors', 'specialities']);
          this.getDataCampus();
        } else if (filterItem.name === 'campuses') {
          this.removeSuperFilter(['levels', 'sectors', 'specialities']);
          this.getDataLevel();
        } else if (filterItem.name === 'levels') {
          this.removeSuperFilter(['sectors', 'specialities']);
          this.getDataByLevel();
        } else if (filterItem.name === 'sectors') {
          this.removeSuperFilter(['specialities']);
          this.getAllSpeciality();
        }
        this.isDisabled = true;
        this.paginator.pageIndex = 0;
      }
      this.clearSelectIfFilter();
      this.getAllFinanceOrganization();
    }
  }

  viewTermDetail(term, month) {
    console.log(term, 'data term view');
    this.subs.sink = this.dialog
      .open(MonthTermDetailsDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          terms: term,
          month: month,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        // code...
      });
  }

  isAllDropdownSelected(type) {
    const listTypeTerms = [
      'terms1',
      'terms2',
      'terms3',
      'terms4',
      'terms5',
      'terms6',
      'terms7',
      'terms8',
      'terms9',
      'terms10',
      'terms11',
      'terms12',
    ];

    if (type === 'scholar') {
      const selected = this.scholarFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.scholars.length;
      return isAllSelected;
    } else if (type === 'school') {
      const selected = this.schoolsFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.school.length;
      return isAllSelected;
    } else if (type === 'campus') {
      const selected = this.campusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.campusList.length;
      return isAllSelected;
    } else if (type === 'level') {
      const selected = this.levelFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.levels.length;
      return isAllSelected;
    } else if (type === 'sector') {
      const selected = this.sectorFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.sectorList.length;
      return isAllSelected;
    } else if (type === 'speciality') {
      const selected = this.specialityFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.specialityList.length;
      return isAllSelected;
    } else if (type === 'tags') {
      const selected = this.tagFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.tagList.length;
    } else if (type === 'typeOrganization') {
      const selected = this.organizationTypeFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.typeList.length;
      return isAllSelected;
    } else if (listTypeTerms.includes(type)) {
      return this.handleCheckedTerms(type);
    } else if (type === 'intakeChannels') {
      const selected = this.currentProgramFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.intakeList.length;
      return isAllSelected;
    } else if (type === 'studentTypes') {
      const selected = this.studentTypeFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.studentType.length;
      return isAllSelected;
    }
  }

  handleCheckedTerms(terms) {
    if (terms === 'terms1') {
      const selected = this.terms1Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms2') {
      const selected = this.terms2Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms3') {
      const selected = this.terms3Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms4') {
      const selected = this.terms4Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms5') {
      const selected = this.terms5Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms6') {
      const selected = this.terms6Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms7') {
      const selected = this.terms7Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms8') {
      const selected = this.terms8Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms9') {
      const selected = this.terms9Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms10') {
      const selected = this.terms10Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms11') {
      const selected = this.terms11Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    } else if (terms === 'terms12') {
      const selected = this.terms12Filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.DPandTermsFilterList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    const listTypeTerms = [
      'terms1',
      'terms2',
      'terms3',
      'terms4',
      'terms5',
      'terms6',
      'terms7',
      'terms8',
      'terms9',
      'terms10',
      'terms11',
      'terms12',
    ];

    if (type === 'scholar') {
      const selected = this.scholarFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.scholars.length;
      return isIndeterminate;
    } else if (type === 'school') {
      const selected = this.schoolsFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.school.length;
      return isIndeterminate;
    } else if (type === 'campus') {
      const selected = this.campusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.campusList.length;
      return isIndeterminate;
    } else if (type === 'level') {
      const selected = this.levelFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.levels.length;
      return isIndeterminate;
    } else if (type === 'sector') {
      const selected = this.sectorFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.sectorList.length;
      return isIndeterminate;
    } else if (type === 'speciality') {
      const selected = this.specialityFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.specialityList.length;
      return isIndeterminate;
    } else if (type === 'tags') {
      const selected = this.tagFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.tagList.length;
    } else if (type === 'typeOrganization') {
      const selected = this.organizationTypeFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.typeList.length;
      return isIndeterminate;
    } else if (listTypeTerms.includes(type)) {
      return this.handleSomeFilterGotSelected(type);
    } else if (type === 'intakeChannels') {
      const selected = this.currentProgramFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.intakeList.length;
      return isIndeterminate;
    } else if (type === 'studentTypes') {
      const selected = this.studentTypeFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.studentType.length;
      return isIndeterminate;
    }
  }

  handleSomeFilterGotSelected(terms) {
    if (terms === 'terms1') {
      const selected = this.terms1Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms2') {
      const selected = this.terms2Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms3') {
      const selected = this.terms3Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms4') {
      const selected = this.terms4Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms5') {
      const selected = this.terms5Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms6') {
      const selected = this.terms6Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms7') {
      const selected = this.terms7Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms8') {
      const selected = this.terms8Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms9') {
      const selected = this.terms9Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms10') {
      const selected = this.terms10Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms11') {
      const selected = this.terms11Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    } else if (terms === 'terms12') {
      const selected = this.terms12Filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.DPandTermsFilterList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    const listTypeTerms = [
      'terms1',
      'terms2',
      'terms3',
      'terms4',
      'terms5',
      'terms6',
      'terms7',
      'terms8',
      'terms9',
      'terms10',
      'terms11',
      'terms12',
    ];

    if (type === 'scholar') {
      if (event.checked) {
        this.scholarFilter.patchValue('All', { emitEvent: false });
      } else {
        this.scholarFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'school') {
      if (event.checked) {
        const schoolData = this.school.map((el) => el._id);
        this.schoolsFilter.patchValue(schoolData, { emitEvent: false });
      } else {
        this.schoolsFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'campus') {
      if (event.checked) {
        const campusData = this.campusList.map((el) => el._id);
        this.campusFilter.patchValue(campusData, { emitEvent: false });
      } else {
        this.campusFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'level') {
      if (event.checked) {
        const levelData = this.levels.map((el) => el._id);
        this.levelFilter.patchValue(levelData, { emitEvent: false });
      } else {
        this.levelFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'sector') {
      if (event.checked) {
        const sectorData = this.sectorList.map((el) => el._id);
        this.sectorFilter.patchValue(sectorData, { emitEvent: false });
      } else {
        this.sectorFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'speciality') {
      if (event.checked) {
        const specialityData = this.specialityList.map((el) => el._id);
        this.specialityFilter.patchValue(specialityData, { emitEvent: false });
      } else {
        this.specialityFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'tags') {
      if (event.checked) {
        const tagsData = this.tagList.map((el) => el._id);
        this.tagFilter.patchValue(tagsData, { emitEvent: false });
      } else {
        this.tagFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'typeOrganization') {
      if (event.checked) {
        const mappedData = this.typeList.map((el) => el.name);
        this.organizationTypeFilter.patchValue(mappedData, { emitEvent: false });
      } else {
        this.organizationTypeFilter.patchValue(null, { emitEvent: false });
      }
    } else if (listTypeTerms.includes(type)) {
      if (event.checked) {
        this.handleSelectAllTerms(type, true);
      } else {
        this.handleSelectAllTerms(type, false);
      }
    } else if (type === 'intakeChannels') {
      if (event.checked) {
        const mappedData = this.intakeList.map((el) => el._id);
        this.currentProgramFilter.patchValue(mappedData, { emitEvent: false });
      } else {
        this.currentProgramFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'studentTypes') {
      if (event.checked) {
        const mappedData = this.studentType.map((el) => el._id);
        this.studentTypeFilter.patchValue(mappedData, { emitEvent: false });
      } else {
        this.studentTypeFilter.patchValue(null, { emitEvent: false });
      }
    }
  }

  handleSelectAllTerms(terms, checked) {
    const termsList = this.DPandTermsFilterList.map((el) => el?.value);
    if (terms === 'terms1') {
      if (checked) {
        this.terms1Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms1Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.first_terms = this.terms1Filter.value;
    } else if (terms === 'terms2') {
      if (checked) {
        this.terms2Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms2Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.second_terms = this.terms2Filter.value;
    } else if (terms === 'terms3') {
      if (checked) {
        this.terms3Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms3Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.third_terms = this.terms3Filter.value;
    } else if (terms === 'terms4') {
      if (checked) {
        this.terms4Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms4Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.fourth_terms = this.terms4Filter.value;
    } else if (terms === 'terms5') {
      if (checked) {
        this.terms5Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms5Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.fifth_terms = this.terms5Filter.value;
    } else if (terms === 'terms6') {
      if (checked) {
        this.terms6Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms6Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.sixth_terms = this.terms6Filter.value;
    } else if (terms === 'terms7') {
      if (checked) {
        this.terms7Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms7Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.seventh_terms = this.terms7Filter.value;
    } else if (terms === 'terms8') {
      if (checked) {
        this.terms8Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms8Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.eighth_terms = this.terms8Filter.value;
    } else if (terms === 'terms9') {
      if (checked) {
        this.terms9Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms9Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.ninth_terms = this.terms9Filter.value;
    } else if (terms === 'terms10') {
      if (checked) {
        this.terms10Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms10Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.tenth_terms = this.terms10Filter.value;
    } else if (terms === 'terms11') {
      if (checked) {
        this.terms11Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms11Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.eleventh_terms = this.terms11Filter.value;
    } else if (terms === 'terms12') {
      if (checked) {
        this.terms12Filter.patchValue(termsList, { emitEvent: false });
      } else {
        this.terms12Filter.patchValue(null, { emitEvent: false });
      }
      this.filteredValues.twelveth_terms = this.terms12Filter.value;
    }
  }

  setOrganizationFilter() {
    const isSame = JSON.stringify(this.tempDataFilter.typeOrganization) === JSON.stringify(this.organizationTypeFilter.value);
    if (isSame) {
      return;
    } else if (this.organizationTypeFilter.value?.length) {
      this.filteredValues.type_of_organizations = this.organizationTypeFilter.value;
      this.tempDataFilter.typeOrganization = this.organizationTypeFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllFinanceOrganization();
      }
    } else {
      if (this.tempDataFilter.typeOrganization?.length && !this.organizationTypeFilter.value?.length) {
        this.filteredValues.type_of_organizations = this.organizationTypeFilter.value;
        this.tempDataFilter.typeOrganization = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllFinanceOrganization();
        }
      } else {
        return;
      }
    }
  }

  setIntakeChannelFilter() {
    const isSame = JSON.stringify(this.tempDataFilter.intakeChannels) === JSON.stringify(this.currentProgramFilter.value);
    if (isSame) {
      return;
    } else if (this.currentProgramFilter.value?.length) {
      this.filteredValues.intake_channels = this.currentProgramFilter.value;
      this.tempDataFilter.intakeChannels = this.currentProgramFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllFinanceOrganization();
      }
    } else {
      if (this.tempDataFilter.intakeChannels?.length && !this.currentProgramFilter.value?.length) {
        this.filteredValues.intake_channels = this.currentProgramFilter.value;
        this.tempDataFilter.intakeChannels = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllFinanceOrganization();
        }
      } else {
        return;
      }
    }
  }

  setStudentTypesFilter() {
    const isSame = JSON.stringify(this.tempDataFilter.studentTypes) === JSON.stringify(this.studentTypeFilter.value);
    if (isSame) {
      return;
    } else if (this.studentTypeFilter.value?.length) {
      this.filteredValues.student_types = this.studentTypeFilter.value;
      this.tempDataFilter.studentTypes = this.studentTypeFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllFinanceOrganization();
      }
    } else {
      if (this.tempDataFilter.studentTypes?.length && !this.studentTypeFilter.value?.length) {
        this.filteredValues.student_types = this.studentTypeFilter.value;
        this.tempDataFilter.studentTypes = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllFinanceOrganization();
        }
      } else {
        return;
      }
    }
  }

  setTermsFilter(terms) {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];

    if (terms === 'terms1') {
      const isSame = JSON.stringify(this.tempDataFilter.firstTerms) === JSON.stringify(this.terms1Filter.value);
      if (isSame) {
        return;
      } else if (this.terms1Filter.value?.length) {
        this.filteredValues.first_terms = this.terms1Filter.value;
        this.tempDataFilter.firstTerms = this.terms1Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllFinanceOrganization();
        }
      } else {
        if (this.tempDataFilter.firstTerms?.length && !this.terms1Filter.value?.length) {
          this.filteredValues.first_terms = this.terms1Filter.value;
          this.tempDataFilter.firstTerms = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getAllFinanceOrganization();
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms2') {
      const isSame = JSON.stringify(this.tempDataFilter.secondTerms) === JSON.stringify(this.terms2Filter.value);
      if (isSame) {
        return;
      } else if (this.terms2Filter.value?.length) {
        this.filteredValues.second_terms = this.terms2Filter.value;
        this.tempDataFilter.secondTerms = this.terms2Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllFinanceOrganization();
        }
      } else {
        if (this.tempDataFilter.secondTerms?.length && !this.terms2Filter.value?.length) {
          this.filteredValues.second_terms = this.terms2Filter.value;
          this.tempDataFilter.secondTerms = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getAllFinanceOrganization();
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms3') {
      const isSame = JSON.stringify(this.tempDataFilter.thirdTerms) === JSON.stringify(this.terms3Filter.value);
      if (isSame) {
        return;
      } else if (this.terms3Filter.value?.length) {
        this.filteredValues.third_terms = this.terms3Filter.value;
        this.tempDataFilter.thirdTerms = this.terms3Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllFinanceOrganization();
        }
      } else {
        if (this.tempDataFilter.thirdTerms?.length && !this.terms3Filter.value?.length) {
          this.filteredValues.third_terms = this.terms3Filter.value;
          this.tempDataFilter.thirdTerms = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getAllFinanceOrganization();
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms4') {
      const isSame = JSON.stringify(this.tempDataFilter.fourthTerms) === JSON.stringify(this.terms4Filter.value);
      if (isSame) {
        return;
      } else if (this.terms4Filter.value?.length) {
        this.filteredValues.fourth_terms = this.terms4Filter.value;
        this.tempDataFilter.fourthTerms = this.terms4Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllFinanceOrganization();
        }
      } else {
        if (this.tempDataFilter.fourthTerms?.length && !this.terms4Filter.value?.length) {
          this.filteredValues.fourth_terms = this.terms4Filter.value;
          this.tempDataFilter.fourthTerms = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getAllFinanceOrganization();
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms5') {
      const isSame = JSON.stringify(this.tempDataFilter.fifthTerms) === JSON.stringify(this.terms5Filter.value);
      if (isSame) {
        return;
      } else if (this.terms5Filter.value?.length) {
        this.filteredValues.fifth_terms = this.terms5Filter.value;
        this.tempDataFilter.fifthTerms = this.terms5Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllFinanceOrganization();
        }
      } else {
        if (this.tempDataFilter.fifthTerms?.length && !this.terms5Filter.value?.length) {
          this.filteredValues.fifth_terms = this.terms5Filter.value;
          this.tempDataFilter.fifthTerms = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getAllFinanceOrganization();
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms6') {
      const isSame = JSON.stringify(this.tempDataFilter.sixthTerms) === JSON.stringify(this.terms6Filter.value);
      if (isSame) {
        return;
      } else if (this.terms6Filter.value?.length) {
        this.filteredValues.sixth_terms = this.terms6Filter.value;
        this.tempDataFilter.sixthTerms = this.terms6Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllFinanceOrganization();
        }
      } else {
        if (this.tempDataFilter.sixthTerms?.length && !this.terms6Filter.value?.length) {
          this.filteredValues.sixth_terms = this.terms6Filter.value;
          this.tempDataFilter.sixthTerms = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getAllFinanceOrganization();
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms7') {
      const isSame = JSON.stringify(this.tempDataFilter.seventhTerms) === JSON.stringify(this.terms7Filter.value);
      if (isSame) {
        return;
      } else if (this.terms7Filter.value?.length) {
        this.filteredValues.seventh_terms = this.terms7Filter.value;
        this.tempDataFilter.seventhTerms = this.terms7Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllFinanceOrganization();
        }
      } else {
        if (this.tempDataFilter.seventhTerms?.length && !this.terms7Filter.value?.length) {
          this.filteredValues.seventh_terms = this.terms7Filter.value;
          this.tempDataFilter.seventhTerms = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getAllFinanceOrganization();
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms8') {
      const isSame = JSON.stringify(this.tempDataFilter.eighthTerms) === JSON.stringify(this.terms8Filter.value);
      if (isSame) {
        return;
      } else if (this.terms8Filter.value?.length) {
        this.filteredValues.eighth_terms = this.terms8Filter.value;
        this.tempDataFilter.eighthTerms = this.terms8Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllFinanceOrganization();
        }
      } else {
        if (this.tempDataFilter.eighthTerms?.length && !this.terms8Filter.value?.length) {
          this.filteredValues.eighth_terms = this.terms8Filter.value;
          this.tempDataFilter.eighthTerms = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getAllFinanceOrganization();
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms9') {
      const isSame = JSON.stringify(this.tempDataFilter.ninthTerms) === JSON.stringify(this.terms9Filter.value);
      if (isSame) {
        return;
      } else if (this.terms9Filter.value?.length) {
        this.filteredValues.ninth_terms = this.terms9Filter.value;
        this.tempDataFilter.ninthTerms = this.terms9Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllFinanceOrganization();
        }
      } else {
        if (this.tempDataFilter.ninthTerms?.length && !this.terms9Filter.value?.length) {
          this.filteredValues.ninth_terms = this.terms9Filter.value;
          this.tempDataFilter.ninthTerms = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getAllFinanceOrganization();
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms10') {
      const isSame = JSON.stringify(this.tempDataFilter.tenthTerms) === JSON.stringify(this.terms10Filter.value);
      if (isSame) {
        return;
      } else if (this.terms10Filter.value?.length) {
        this.filteredValues.tenth_terms = this.terms10Filter.value;
        this.tempDataFilter.tenthTerms = this.terms10Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllFinanceOrganization();
        }
      } else {
        if (this.tempDataFilter.tenthTerms?.length && !this.terms10Filter.value?.length) {
          this.filteredValues.tenth_terms = this.terms10Filter.value;
          this.tempDataFilter.tenthTerms = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getAllFinanceOrganization();
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms11') {
      const isSame = JSON.stringify(this.tempDataFilter.eleventhTerms) === JSON.stringify(this.terms11Filter.value);
      if (isSame) {
        return;
      } else if (this.terms11Filter.value?.length) {
        this.filteredValues.eleventh_terms = this.terms11Filter.value;
        this.tempDataFilter.eleventhTerms = this.terms11Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllFinanceOrganization();
        }
      } else {
        if (this.tempDataFilter.eleventhTerms?.length && !this.terms11Filter.value?.length) {
          this.filteredValues.eleventh_terms = this.terms11Filter.value;
          this.tempDataFilter.eleventhTerms = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getAllFinanceOrganization();
          }
        } else {
          return;
        }
      }
    } else if (terms === 'terms12') {
      const isSame = JSON.stringify(this.tempDataFilter.twelvethTerms) === JSON.stringify(this.terms12Filter.value);
      if (isSame) {
        return;
      } else if (this.terms12Filter.value?.length) {
        this.filteredValues.twelveth_terms = this.terms12Filter.value;
        this.tempDataFilter.twelvethTerms = this.terms12Filter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllFinanceOrganization();
        }
      } else {
        if (this.tempDataFilter.twelvethTerms?.length && !this.terms12Filter.value?.length) {
          this.filteredValues.twelveth_terms = this.terms12Filter.value;
          this.tempDataFilter.twelvethTerms = null;
          if (!this.isReset) {
            this.paginator.pageIndex = 0;
            this.getAllFinanceOrganization();
          }
        } else {
          return;
        }
      }
    }
  }

  controllerButton(action) {
    switch (action) {
      case 'export-controlling':
        this.openDialogExportControllingReport();
        break;
      default:
        this.resetFilter();
    }
  }

  openDialogExportControllingReport() {
    this.subs.sink = this.dialog
      .open(ExportControllingReportDialogComponent, {
        width: '600px',
        minHeight: '100px',
        data: {
          currentUserTypeId: this.currentUser,
        },
        disableClose: true,
        panelClass: 'certification-rule-pop-up',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.exportFilteredValues = _.cloneDeep(this.filteredValues);
          this.exportFilteredValues.scholar_season_id = res?.scholar_season;
          this.exportFilteredValues.schools = res?.schools;
          this.downloadCSV();
        }
      });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
}
