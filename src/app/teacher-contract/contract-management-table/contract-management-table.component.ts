import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { AfterViewInit, Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { SubSink } from 'subsink';
import { UntypedFormArray, UntypedFormControl } from '@angular/forms';
import { ApplicationUrls } from 'app/shared/settings';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { bufferCount, debounceTime, map, startWith, take, tap } from 'rxjs/operators';
import { ImportContractProcessDialogComponent } from '../../shared/components/import-contract-process-dialog/import-contract-process-dialog.component';
import { SendingPreContractFormDialogComponent } from './sending-pre-contract-form-dialog/sending-pre-contract-form-dialog.component';
import { CoreService } from 'app/service/core/core.service';
import { TeacherContractService } from '../teacher-contract.service';
import { UtilityService } from 'app/service/utility/utility.service';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { SendMailDialogComponent } from 'app/mailbox/send-mail-dialog/send-mail-dialog.component';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import * as _ from 'lodash';
import { UploadDocumentProcessDialogComponent } from './upload-document-process-dialog/upload-document-process-dialog.component';
import { PermissionService } from 'app/service/permission/permission.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { FormFillingService } from 'app/form-filling/form-filling.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-contract-management-table',
  templateUrl: './contract-management-table.component.html',
  styleUrls: ['./contract-management-table.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class ContractManagementTableComponent implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns: string[] = [
    'select',
    'teacher',
    'contract_type',
    'numberOfIntervention',
    'email',
    'phone',
    'start',
    'end',
    'intervenant',
    'contractManager',
    // 'hours',
    // 'rate',
    'contract_process_status',
    'action',
  ];

  filterColumns: string[] = [
    'selectFilter',
    'teacherFilter',
    'contractTypeFilter',
    'numberOfInterventionFilter',
    'emailFilter',
    'phoneFilter',
    'startFilter',
    'endFilter',
    'intervenantFilter',
    'contractManagerFilter',
    // 'hoursFilter',
    // 'rateFilter',
    'contract_process_status_filter',
    'actionFilter',
  ];

  originColumns = this.displayedColumns;
  originFilter = this.filterColumns;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('matTable', { static: false }) table: MatTable<any>;

  isCheckedAll = false;
  disabledExport = true;
  isAllEmpty = true;
  dataCount = 0;
  noData;
  userSelected = [];
  userSelectedId = [];
  selectType;
  isWasSelectAll = false;
  isFilterManagerReady = true;

  private subs = new SubSink();
  isLoading: Boolean = false;
  stepColumns = [];
  allDataForCustom = [];
  allDataForExport = [];

  filteredValues = {
    teacher: null,
    intervention_number: null,
    contract_type: null,
    email: null,
    phone: null,
    program: null,
    intervention: null,
    subject: null,
    start_date: null,
    end_date: null,
    contract_manager: null,
    // hours: null,
    // rate: null,
    contract_status: null,
    steps: null,
    template_type: 'teacher_contract',
    contract_types: null,
    intervention_numbers: null,
    contract_statuses: null,
  };

  filteredValuesAll = {
    contract_types: 'All',
    intervention_numbers: 'All',
    contract_statuses: 'All',
    '0': 'All',
    '1': 'All',
    '2': 'All',
    '3': 'All',
    '4': 'All',
    '5': 'All',
    '6': 'All',
    '7': 'All',
    '8': 'All',
    '9': 'All',
    '10': 'All',
    '11': 'All',
  };

  subjects = [];
  programs = [];
  typeOfConracts = [];
  numberIntervention = [1, 2, 3, 4, 5, 6, 7];
  interventions = ['Face to Face', 'Face to Face 2', 'Face to Face 3', 'Face to Face 4', 'Jury', 'Coaching', 'Conference'];
  stepStatusList = [
    {
      value: 'ask_for_revision',
      display: 'Revision requested',
    },
    {
      value: 'accept',
      display: 'Validate',
    },
    {
      value: 'not_started',
      display: 'Not Started',
    },
    {
      value: 'need_validation',
      display: 'Need Validation',
    },
    {
      value: 'empty',
      display: 'Empty',
    },
    // {
    //   value: 'revision_completed',
    //   display: 'Revision Completed',
    // },
  ];

  statusList = [];
  currentUser: any;
  isPermission: string[];
  currentUserTypeId: any;
  isReset: Boolean = false;
  dataLoaded: boolean;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  sortValue = null;
  totalSteps = 0;
  timeOutVal: NodeJS.Timeout;

  /******** FORM FILTERS */

  teacherFilter = new UntypedFormControl(null);
  contractTypeFilter = new UntypedFormControl(null);
  numberInterventionFilter = new UntypedFormControl(null);
  emailFilter = new UntypedFormControl(null);
  phoneFilter = new UntypedFormControl(null);
  startDateFilter = new UntypedFormControl(null);
  endDateFilter = new UntypedFormControl(null);
  programFilter = new UntypedFormControl(null);
  interventionFilter = new UntypedFormControl(null);
  subjectFilter = new UntypedFormControl(null);
  cpFilter = new UntypedFormControl(null);
  statusFilter = new UntypedFormControl(null);
  contractManagerFilter = new UntypedFormControl(null);
  // hoursFilter = new UntypedFormControl(null);
  // rateFilter = new UntypedFormControl(null);

  /**********************/
  isTopWaitingForResponse = false;
  OriginStep: any;
  steps: UntypedFormArray = new UntypedFormArray([]);
  allStudentForCheckbox = [];
  dataSelected = [];
  pageSelected = [];
  dataWithFilteredSteps: any;
  dataWithFilteredOptionalSteps: any;
  totalOptionalSteps: any;
  optionalSteps: any;
  optionalStepColumns: any[];

  dataUnselectUser = [];
  buttonClicked = '';
  allContractForSendForm = [];
  filterBreadcrumbData = [];
  stepColumnsBreadCrumb = [];
  optionColumnsBreadCrumb = [];
  isMultipleFilter = false;
  prevTotalStepMandatory: any = 0;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private translate: TranslateService,
    private authService: AuthService,
    private contractService: TeacherContractService,
    private formFillingService: FormFillingService,
    private utilService: UtilityService,
    private ngZone: NgZone,
    private coreService: CoreService,
    private parseUTCtoLocal: ParseUtcToLocalPipe,
    private permissionNgx: NgxPermissionsService,
    public permission: PermissionService,
    private route: ActivatedRoute,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService,
  ) {}

  ngOnInit() {
    this.coreService.sidenavOpen = false;
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    const teacherName = this.route.snapshot.queryParamMap.get('teacher');
    if (teacherName) {
      this.filteredValues.teacher = teacherName;
      this.teacherFilter.patchValue(teacherName, { emitEvent: false });
    }
    this.multipleFilterDropdown();
    this.getSubjectDropdown();
    this.getProgramDropdown();
    this.initFilter();

    this.stepStatusList = this.stepStatusList.sort((a, b) =>
      this.translate
        .instant('CONTRACT_MANAGEMENT.Step_Statuses.' + a.value)
        .localeCompare(this.translate.instant('CONTRACT_MANAGEMENT.Step_Statuses.' + b.value)),
    );

    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.multipleFilterDropdown();
      this.stepStatusList = this.stepStatusList.sort((a, b) =>
        this.translate
          .instant('CONTRACT_MANAGEMENT.Step_Statuses.' + a.value)
          .localeCompare(this.translate.instant('CONTRACT_MANAGEMENT.Step_Statuses.' + b.value)),
      );
    });
    this.pageTitleService.setTitle('NAV.TEACHER_CONTRACT.CONTRACT_MANAGEMENT');
    // this.getAllContractProcess('init');
  }
  multipleFilterDropdown() {
    this.typeOfConracts = [
      {
        value: 'cddu',
        label: this.translate.instant('ERP_009_TEACHER_CONTRACT.TYPE_OF_CONTRACT.cddu'),
      },
      {
        value: 'convention',
        label: this.translate.instant('ERP_009_TEACHER_CONTRACT.TYPE_OF_CONTRACT.convention'),
      },
    ];
    this.statusList = [
      {
        value: 'not_published',
        display: 'Not Published',
        label: this.translate.instant('CONTRACT_MANAGEMENT.Statuses.not_published'),
      },
      {
        value: 'not_sent',
        display: 'Not sent',
        label: this.translate.instant('CONTRACT_MANAGEMENT.Statuses.not_sent'),
      },
      {
        display: 'In progress of signing',
        value: 'in_progress_of_signing',
        label: this.translate.instant('CONTRACT_MANAGEMENT.Statuses.in_progress_of_signing'),
      },
      {
        value: 'signed',
        display: 'Signed',
        label: this.translate.instant('CONTRACT_MANAGEMENT.Statuses.signed'),
      },
      {
        value: 'reject_and_stop',
        display: 'Reject and Stop',
        label: this.translate.instant('CONTRACT_MANAGEMENT.Statuses.reject_and_stop'),
      },
    ];
    this.stepStatusList = this.stepStatusList.map((list) => {
      return {
        ...list,
        label: this.translate.instant('CONTRACT_MANAGEMENT.Step_Statuses.' + list?.value),
      };
    });
  }

  initFilter() {
    this.subs.sink = this.teacherFilter.valueChanges.pipe(debounceTime(500)).subscribe((statusSearch) => {
      this.filteredValues.teacher = this.utilService.simpleDiacriticSensitiveRegex(statusSearch);
      this.paginator.pageIndex = 0;
      this.getAllContractProcess('teacherFilter');
    });

    this.subs.sink = this.contractTypeFilter.valueChanges.subscribe((statusSearch) => {
      this.isMultipleFilter = true;
    });

    this.subs.sink = this.numberInterventionFilter.valueChanges.subscribe((statusSearch) => {
      this.isMultipleFilter = true;
    });

    this.subs.sink = this.emailFilter.valueChanges.pipe(debounceTime(500)).subscribe((statusSearch) => {
      this.filteredValues.email = this.utilService.simpleDiacriticSensitiveRegex(statusSearch);
      this.paginator.pageIndex = 0;
      this.getAllContractProcess('emailfilter');
    });

    this.subs.sink = this.phoneFilter.valueChanges.pipe(debounceTime(500)).subscribe((statusSearch) => {
      this.filteredValues.phone = statusSearch.toString();
      this.paginator.pageIndex = 0;
      this.getAllContractProcess('phonefilter');
    });

    this.subs.sink = this.programFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.program = statusSearch;
      this.paginator.pageIndex = 0;
      this.getAllContractProcess('programfilter');
    });

    this.subs.sink = this.interventionFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.intervention = statusSearch;
      this.paginator.pageIndex = 0;
      this.getAllContractProcess('interventionfilter');
    });

    this.subs.sink = this.subjectFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.subject = statusSearch;
      this.paginator.pageIndex = 0;
      this.getAllContractProcess('subject');
    });

    this.subs.sink = this.startDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.start_date = newDate;
        this.paginator.pageIndex = 0;
        this.getAllContractProcess('startDateFilter');
      }
    });

    this.subs.sink = this.endDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.end_date = newDate;
        this.paginator.pageIndex = 0;
        this.getAllContractProcess('endDateFilter');
      }
    });

    this.subs.sink = this.contractManagerFilter.valueChanges.pipe(debounceTime(500)).subscribe((statusSearch) => {
      this.filteredValues.contract_manager = this.utilService.simpleDiacriticSensitiveRegex(statusSearch);
      this.paginator.pageIndex = 0;
      this.getAllContractProcess('contractManagerFilter');
    });

    // this.subs.sink = this.hoursFilter.valueChanges.pipe(debounceTime(500)).subscribe((statusSearch) => {
    //   this.filteredValues.hours = statusSearch.toString();
    //   this.paginator.pageIndex = 0;
    //   this.getAllContractProcess('hourfilter');
    // });

    // this.subs.sink = this.rateFilter.valueChanges.pipe(debounceTime(500)).subscribe((statusSearch) => {
    //   this.filteredValues.rate = statusSearch.toString();
    //   this.paginator.pageIndex = 0;
    //   this.getAllContractProcess('ratefilter');
    // });

    this.subs.sink = this.statusFilter.valueChanges.subscribe((statusSearch) => {
      this.isMultipleFilter = true;
    });
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    console.log('sort', sort, this.sortValue, this.dataLoaded, this.isReset);
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAllContractProcess('sort');
      }
    }
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getAllContractProcess('viewinit');
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
    this.subs.sink = this.ngZone.onMicrotaskEmpty.pipe(bufferCount(50), take(3)).subscribe((resp) => {
      this.table.updateStickyColumnStyles();
    });
  }

  getAllContractProcess(from?) {
    // console.log('_from', from);

    this.isLoading = true;
    this.stepColumns = [];
    this.optionalStepColumns = [];
    this.totalSteps = 0;
    this.totalOptionalSteps = 0;
    this.dataWithFilteredSteps = [];
    this.dataWithFilteredOptionalSteps = [];
    this.displayedColumns = [];
    this.filterColumns = [];
    this.setDisplayedColumns();
    this.setFilterColumns();
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    if (!this.isFilterManagerReady) {
      delete this.filteredValues.contract_manager;
    }
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    const filterData = this.cleanFilterData();
    console.log('cek filter data', filterData);
    this.subs.sink = this.contractService
      .getAllFormContractManageProcesses(pagination, filterData, this.sortValue, userTypesList)
      .subscribe(
        (resp) => {
          if (resp) {
            console.log(resp);
            this.isReset = false;
            this.isLoading = false;
            this.dataSource.data = resp;
            this.dataCount = resp && resp[0] && resp[0].count_document ? resp[0].count_document : 0;
            this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
            this.addStepsValue(resp);
            this.filterBreadcrumbData = [];
            this.filterBreadcrumbFormat();
          } else {
            this.dataSource.data = [];
            this.isReset = false;
            this.isLoading = false;
          }
        },
        (err) => {
          this.dataSource.data = [];
          this.isReset = false;
          this.isLoading = false;
          this.authService.postErrorLog(err);
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
          this.handleError(err);
        },
      );
  }
  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    Object.keys(filterData).forEach((key) => {
      if (!filterData[key] && filterData[key] !== false) {
        delete filterData[key];
      }
    });
    return filterData;
  }

  setDisplayedColumns() {
    this.displayedColumns = [
      'select',
      'teacher',
      'contract_type',
      'numberOfIntervention',
      'email',
      'phone',
      'start',
      'end',
      'intervenant',
      'contractManager',
      // 'hours',
      // 'rate',
      'contract_process_status',
      'action',
    ];
  }

  setFilterColumns() {
    this.filterColumns = [
      'selectFilter',
      'teacherFilter',
      'contractTypeFilter',
      'numberOfInterventionFilter',
      'emailFilter',
      'phoneFilter',
      'startFilter',
      'endFilter',
      'intervenantFilter',
      'contractManagerFilter',
      // 'hoursFilter',
      // 'rateFilter',
      'contract_process_status_filter',
      'actionFilter',
    ];
  }

  addStepsValue(data) {
    this.steps = new UntypedFormArray([]);
    this.optionalSteps = new UntypedFormArray([]);
    const stepColumns = [];
    const optionalStepColumns = [];
    this.totalSteps = 0;
    this.totalOptionalSteps = 0;
    let maxStepData;
    let maxOptionalStepData;

    if (data && data.length > 0) {
      // filter all the form process to only contain steps that is non-optional
      const dataWithFilteredSteps = data.map((contractData) => ({
        ...contractData,
        steps:
          contractData && contractData?.steps && contractData?.steps?.length
            ? contractData?.steps.filter((step) => !step?.is_only_visible_based_on_condition)
            : [],
      }));
      this.dataWithFilteredSteps = dataWithFilteredSteps;
      console.log('data untouched', data);
      console.log('datawithfilteredSteps:', this.dataWithFilteredSteps);
      // find max number of steps in the data
      maxStepData = Math.max.apply(
        Math,
        dataWithFilteredSteps.map((res) => (res && res.steps && res.steps.length ? res.steps.length : 0)),
      );

      // filter all the form process to only contain steps that is optional
      const dataWithFilteredOptionalSteps = data.map((contractData) => ({
        ...contractData,
        steps:
          contractData && contractData?.steps && contractData?.steps?.length
            ? contractData?.steps.filter((step) => step?.is_only_visible_based_on_condition)
            : [],
      }));
      this.dataWithFilteredOptionalSteps = dataWithFilteredOptionalSteps;

      // find max number of optional steps in the data
      maxOptionalStepData = Math.max.apply(
        Math,
        dataWithFilteredOptionalSteps.map((res) => (res && res.steps && res.steps.length ? res.steps.length : 0)),
      );
    }
    console.log('maxStepData', maxStepData);
    if (maxStepData && maxStepData !== 0) {
      this.totalSteps = maxStepData;
    } else if (!maxStepData && maxStepData === 0) {
      this.totalSteps = 0;
    }
    console.log('maxOptionalStepData', maxOptionalStepData);
    if (maxOptionalStepData && maxOptionalStepData !== 0) {
      this.totalOptionalSteps = maxOptionalStepData;
    } else if (!maxOptionalStepData && maxOptionalStepData === 0) {
      this.totalOptionalSteps = 0;
    }

    console.log('_max', maxStepData, maxOptionalStepData);

    console.log(this.totalSteps, this.totalOptionalSteps);

    if (maxStepData > 0) {
      // push the total number of steps into the displayedColumns and filterColumns
      let i = 0;
      for (i; i < this.totalSteps; i++) {
        this.displayedColumns.splice(-2, 0, `S${i + 1}`);
        this.filterColumns.splice(-2, 0, `S${i + 1}_filter`);
        stepColumns.push(`S${i + 1}`);
        this.steps.push(new UntypedFormControl(null));
      }
      if (this.steps && this.steps.controls.length) {
        if (this.filteredValues.steps && this.filteredValues.steps.length > 0) {
          this.filteredValues.steps.forEach((element) => {
            if (element.step_type_selected === 'mandatory') {
              this.steps.controls[element.step].setValue(element?.statuses);
            }
          });
        }
      }
    }

    if (maxOptionalStepData > 0) {
      // push the total number of optional steps into the displayedColumns and filterColumns
      let j = 0;
      for (j; j < this.totalOptionalSteps; j++) {
        this.displayedColumns.splice(-2, 0, `O${j + 1}`);
        this.filterColumns.splice(-2, 0, `O${j + 1}_filter`);
        optionalStepColumns.push(`O${j + 1}`);
        this.optionalSteps.push(new UntypedFormControl(null));
      }
      if (this.optionalSteps && this.optionalSteps.controls.length) {
        if (this.filteredValues.steps && this.filteredValues.steps.length > 0) {
          this.filteredValues.steps.forEach((element) => {
            if (element.step_type_selected === 'option') {
              const indexSelected = (element.step - this.totalSteps) - ((this.prevTotalStepMandatory - this.totalSteps) < 0 ? 0 : (this.prevTotalStepMandatory - this.totalSteps));
              this.optionalSteps.controls[indexSelected].setValue(element.statuses);
            }
          });
        }
      }
    }

    this.displayedColumns = _.uniqBy(this.displayedColumns);
    this.filterColumns = _.uniqBy(this.filterColumns);

    console.log('_dis', this.displayedColumns);
    console.log('_fil', this.filterColumns);

    this.stepColumns = stepColumns;
    this.optionalStepColumns = optionalStepColumns;
    console.log('stepColumns', this.stepColumns);
    console.log('optionalStepColumns', this.optionalStepColumns);
  }

  getSubjectDropdown() {
    this.subs.sink = this.contractService.getAllSubjectsDropdown().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.subjects = resp;
        }
      },
      (err) => {
        this.isLoading = false;
        this.authService.postErrorLog(err);
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
          this.handleError(err);
        }
      },
    );
  }

  getProgramDropdown() {
    this.subs.sink = this.contractService.GetAllProgramsDropdown().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.programs = resp;
        }
      },
      (err) => {
        this.isLoading = false;
        this.authService.postErrorLog(err);
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
          this.handleError(err);
        }
      },
    );
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return this.isCheckedAll ? true : numSelected === numRows;
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  onReset() {
    this.resetFilter();
    this.getAllContractProcess('Reset');
  }

  resetFilter() {
    this.userSelected = [];
    this.userSelectedId = [];
    this.isCheckedAll = false;
    this.isReset = true;
    this.isMultipleFilter = false;
    this.selection.clear();
    this.dataSelected = [];
    this.dataUnselectUser = [];
    this.allContractForSendForm = [];
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.filteredValues = {
      teacher: null,
      intervention_number: null,
      contract_type: null,
      email: null,
      phone: null,
      program: null,
      intervention: null,
      subject: null,
      start_date: null,
      end_date: null,
      contract_manager: null,
      // hours: null,
      // rate: null,
      contract_status: null,
      steps: null,
      template_type: 'teacher_contract',
      contract_types: null,
      intervention_numbers: null,
      contract_statuses: null,
    };
    this.teacherFilter.setValue(null, { emitEvent: false });
    this.contractTypeFilter.setValue(null, { emitEvent: false });
    this.numberInterventionFilter.setValue(null, { emitEvent: false });
    this.emailFilter.setValue(null, { emitEvent: false });
    this.phoneFilter.setValue(null, { emitEvent: false });
    this.startDateFilter.setValue(null, { emitEvent: false });
    this.endDateFilter.setValue(null, { emitEvent: false });
    this.programFilter.setValue(null, { emitEvent: false });
    this.interventionFilter.setValue(null, { emitEvent: false });
    this.subjectFilter.setValue(null, { emitEvent: false });
    this.cpFilter.setValue(null, { emitEvent: false });
    this.statusFilter.setValue(null, { emitEvent: false });
    this.contractManagerFilter.setValue(null, { emitEvent: false });
    this.filterBreadcrumbData = [];
    // this.hoursFilter.setValue(null, { emitEvent: false });
    // this.rateFilter.setValue(null, { emitEvent: false });
  }

  // onImportContract() {
  //   this.subs.sink = this.dialog
  //     .open(ImportContractProcessDialogComponent, {
  //       width: '500px',
  //       minHeight: '100px',
  //       panelClass: 'no-padding',
  //     })
  //     .afterClosed()
  //     .subscribe((resp) => {
  //       if (resp) {
  //         console.log(resp);
  //       }
  //     });
  // }

  csvTypeSelectionUpload() {
    const inputOptions = {
      ',': this.translate.instant('IMPORT_DECISION_S1.COMMA'),
      ';': this.translate.instant('IMPORT_DECISION_S1.SEMICOLON'),
      tab: this.translate.instant('IMPORT_DECISION_S1.TAB'),
    };

    Swal.fire({
      type: 'question',
      title: this.translate.instant('IMPORT_DECISION_S1.TITLE'),
      width: 465,
      allowEscapeKey: true,
      showCancelButton: true,
      cancelButtonText: this.translate.instant('IMPORT_DECISION_S1.CANCEL'),
      confirmButtonText: this.translate.instant('IMPORT_DECISION_S1.OK'),
      input: 'radio',
      inputOptions: inputOptions,
      inputValue: ';',
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
        this.openImportDialog(fileType);
      }
    });
  }

  openImportDialog(fileType) {
    let delimeter = null;
    switch (fileType) {
      case ',':
        delimeter = 'comma';
        break;
      case ';':
        delimeter = 'semicollon';
        break;
      case 'tab':
        delimeter = 'tab';
        break;
      default:
        delimeter = null;
        break;
    }
    // const schoolId;
    // const titleId = this.setupScheduleInfo && this.setupScheduleInfo.rncp_id ? this.setupScheduleInfo.rncp_id._id : null;
    // const classId = this.setupScheduleInfo && this.setupScheduleInfo.class_id ? this.setupScheduleInfo.class_id._id : null;
    this.dialog
      .open(ImportContractProcessDialogComponent, {
        width: '500px',
        minHeight: '200px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          delimeter: delimeter,
          type: 'contract',
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.isLoading = false;
          this.getAllContractProcess('add');
          // this.getTableData();
          // this.ngOnInit();
        }
      });
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isLoading = true;
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.contractService
      .getAllFormContractManageProcesses(pagination, this.filteredValues, this.sortValue, userTypesList)
      .subscribe(
        (students) => {
          if (students && students.length) {
            this.allStudentForCheckbox.push(...students);
            const page = pageNumber + 1;
            this.getDataAllForCheckbox(page);
          } else {
            console.log('getDataAllForCheckbox', this.selection, this.isCheckedAll);
            this.isLoading = false;
            // this.selected = true;
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
          this.isReset = false;
          this.isLoading = false;
          this.authService.postErrorLog(error);
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

  // selected = false;
  // checkCheckbox() {
  //   this.selected = false;
  //   if (this.selection.selected.length > 0) {
  //     this.selected = true;
  //   }
  // }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      // this.pageSelected = [];
      this.dataUnselectUser = [];
      this.allContractForSendForm = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.dataUnselectUser = [];
      this.allContractForSendForm = [];
      // this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      // this.getDataAllForCheckbox(0);
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
    }
    // this.checkCheckbox();
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
    const numSelected = this.selection.selected.length;
    if (info === 'all') {
      this.isWasSelectAll = true;
    }
    if (numSelected > 0) {
      this.disabledExport = false;
    } else {
      this.disabledExport = true;
      this.isWasSelectAll = false;
    }
    console.log('showOptions', this.isWasSelectAll, info);
    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = info;
  }

  checkTeacherStep(type, element?) {
    let data = [];
    if (type === 'multiple') {
      data = this.dataSelected;
    } else if (type === 'single') {
      data.push(element);
    }
    if (data && data.length) {
      const teacherHasStep = data.filter((list) => {
        if (list.steps && list.steps.length) {
          return list;
        }
      });
      if (teacherHasStep && teacherHasStep.length) {
        return false;
      } else {
        return true;
      }
    }
  }

  onSendingPreContract(type: string, contractProcess?) {
    console.log('onSendingPreContract', this.isWasSelectAll, type, this.selectType);
    console.log('DATA SELECTED', this.dataSelected);
    if (type === 'multiple' && this.dataSelected.length < 1 && !this.isCheckedAll) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Teacher') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else if (!this.checkTeacherStep(type, contractProcess)) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SendForm_S2.Title'),
        html: this.translate.instant('SendForm_S2.Text'),
        confirmButtonText: this.translate.instant('SendForm_S2.Button'),
      });
    } else {
      this.subs.sink = this.dialog
        .open(SendingPreContractFormDialogComponent, {
          width: '800px',
          panelClass: 'certification-rule-pop-up',
          disableClose: true,
          data: {
            type: type,
            process: contractProcess,
            selection: this.dataSelected,
            selectAll: this.isAllSelected(),
            filter: this.filteredValues,
          },
        })
        .afterClosed()
        .subscribe((resp) => {
          if (resp) {
            console.log(resp);
            this.isLoading = false;
            this.getAllContractProcess('send');
            this.selection.clear();
            this.dataSelected = [];
            this.userSelected = [];
            this.userSelectedId = [];
          }
        });
    }
  }

  getAllDataWithCustomData(pageNumber: number, from) {
    this.isLoading = true;
    if (pageNumber === 0) {
      this.allDataForCustom = [];
    }
    const pagination = {
      limit: 500,
      page: pageNumber,
    };
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.contractService
      .getAllFormContractManageProcesses(pagination, this.filteredValues, this.sortValue, userTypesList)
      .subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.allDataForCustom.push(...resp);
            const page = pageNumber + 1;
            // console.log('this.allStudentForCsv ', this.allDataForCustom);
            // recursively get student data by 500 until we dont get student data anymore
            // we use this way because if we get all the data at once, it will trigger cors policy error because response too big
            this.getAllDataWithCustomData(page, from);
          } else {
            this.isLoading = false;
            const candidateId = this.dataSource.data.map((list) => list._id);
            const dataPage = candidateId.filter((list) => !this.userSelectedId.includes(list));
            const dataFinal = this.allDataForCustom.filter((list) => !dataPage.includes(list._id));
            if (from === 'form') {
              this.sendFormToAllTeacher(dataFinal);
            }
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
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

  getAllDataData(pageNumber: number, from) {
    this.isLoading = true;
    const pagination = {
      limit: 500,
      page: pageNumber,
    };
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.contractService
      .getAllFormContractManageProcesses(pagination, this.filteredValues, this.sortValue, userTypesList)
      .subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.allDataForExport.push(...resp);
            const page = pageNumber + 1;
            // console.log('this.allStudentForCsv ', this.allDataForExport);
            // recursively get student data by 500 until we dont get student data anymore
            // we use this way because if we get all the data at once, it will trigger cors policy error because response too big
            this.getAllDataData(page, from);
          } else {
            this.isLoading = false;
            if (from === 'form') {
              this.sendFormToAllTeacher(this.allDataForExport);
            }
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
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

  sendFormToAllTeacher(data) {
    if (data && data.length) {
      const teacherHasStep = data.filter((list) => {
        if (list.steps && list.steps.length) {
          return list;
        }
      });
      this.isAllEmpty = true;
      if (teacherHasStep && teacherHasStep.length) {
        this.isAllEmpty = false;
      }
    }
    if (this.selection.selected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Teacher') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
      // } else if (!this.isAllEmpty) {
      //   Swal.fire({
      //     type: 'info',
      //     title: this.translate.instant('SendForm_S2.Title'),
      //     html: this.translate.instant('SendForm_S2.Text'),
      //     confirmButtonText: this.translate.instant('SendForm_S2.Button'),
      //   });
    } else {
      this.subs.sink = this.dialog
        .open(SendingPreContractFormDialogComponent, {
          width: '800px',
          panelClass: 'certification-rule-pop-up',
          disableClose: true,
          data: {
            type: 'multiple',
            process: null,
            selection: data,
            selectAll: this.isAllSelected(),
            filter: this.filteredValues,
          },
        })
        .afterClosed()
        .subscribe((resp) => {
          if (resp) {
            console.log(resp);
            this.isLoading = false;
            this.getAllContractProcess('send');
          }
        });
    }
  }

  renderTooltipEntity(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    if (entities && entities.length) {
      for (const entity of entities) {
        count++;
        if (count > 1) {
          if (entity && entity.full_name) {
            tooltip = tooltip + ', ';
            tooltip = tooltip + entity.full_name;
          }
        } else {
          if (entity && entity.full_name) {
            tooltip = tooltip + entity.full_name;
          }
        }
      }
    }
    return tooltip;
  }

  templateForImport() {
    const inputOptions = {
      ',': this.translate.instant('IMPORT_TEMPLATE_S1.COMMA'),
      ';': this.translate.instant('IMPORT_TEMPLATE_S1.SEMICOLON'),
      tab: this.translate.instant('IMPORT_TEMPLATE_S1.TAB'),
    };

    Swal.fire({
      type: 'question',
      title: this.translate.instant('IMPORT_TEMPLATE_S1.TITLE'),
      width: 465,
      allowEscapeKey: true,
      showCancelButton: true,
      cancelButtonText: this.translate.instant('IMPORT_TEMPLATE_S1.CANCEL'),
      confirmButtonText: this.translate.instant('IMPORT_TEMPLATE_S1.OK'),
      input: 'radio',
      inputValue: ';',
      inputOptions: inputOptions,
    }).then((separator) => {
      console.log(separator);
      if (separator && separator.value) {
        this.downloadCSVTemplate(separator.value);
      }
    });
  }

  downloadCSVTemplate(fileType) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const path = '';
    const lang = this.translate.currentLang.toLowerCase();
    let importStudentTemlate = 'downloadContractProcessTemplateCSV';
    importStudentTemlate = importStudentTemlate + '/' + fileType + '/' + lang;
    element.href = url + importStudentTemlate + path;

    element.target = '_blank';
    element.download = 'Template Import CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  onGoToForm(element) {
    const userTypeId = this.authService.getCurrentUser().entities[0].type._id;
    const url = this.router.createUrlTree(['/form-fill'], {
      queryParams: {
        formId: element._id,
        userId: this.authService.getCurrentUser()._id,
        formType: 'teacher_contract',
        userTypeId: userTypeId,
      },
    });
    window.open(url.toString(), '_blank');
  }

  onWhatsappContact(element) {
    if (element) {
      const whatsAppUrl = 'https://api.whatsapp.com/send?phone=' + element.portable_phone + '&text=';
      const whatsAppText = this.translate.instant('whatsapp message contract', {
        first_name: element.first_name,
        last_name: element.last_name,
        civility: element.civility,
      });
      console.log('whatsAppText ', whatsAppText);
      window.open(whatsAppUrl + whatsAppText, '_blank');
    }
  }

  onSendMail(element) {
    element.student_id = { civility: element.civility, first_name: element.first_name, last_name: element.last_name, email: element.email };
    const dialog = this.dialog.open(SendMailDialogComponent, {
      disableClose: true,
      width: '750px',
      panelClass: 'unset-padding',
      data: element,
    });
  }

  onUploadDocument(element) {
    this.subs.sink = this.dialog
      .open(UploadDocumentProcessDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: element,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          //  console.log(res);
          this.getAllContractProcess('upload');
        }
      });
  }

  sendReminder(contractProcessId) {
    this.isTopWaitingForResponse = true;
    this.subs.sink = this.contractService.SendEmailContractProcess(contractProcessId, this.translate.currentLang).subscribe(
      (resp) => {
        this.isTopWaitingForResponse = false;
        if (resp) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          });
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
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

  onDeleteProcess(element) {
    let timeDisabled = 5;
    Swal.fire({
      title: this.translate.instant('DELETE_ITEM_TEMPLATE.TITLE'),
      html: this.translate.instant('CONFIRMDELETE', {
        value: element.first_name && element.last_name ? `${element.first_name} ${element.last_name}` : '',
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
    }).then((resp) => {
      clearTimeout(this.timeOutVal);
      if (resp.value) {
        this.subs.sink = this.contractService.deleteContractProcess(element._id).subscribe(
          async (ressp) => {
            if (ressp) {
              this.isLoading = false;
              await Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              });
              this.getAllContractProcess('delete');
            }
          },
          (err) => {
            this.authService.postErrorLog(err);
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
    });
  }

  translateDate(date, time) {
    if (date && time) {
      return this.parseUTCtoLocal.transformDate(date, time);
    }
  }

  handleError(err) {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('SORRY'),
      text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
      confirmButtonText: this.translate.instant('OK'),
    });
  }
  stepFiltered() {
    const tempOptional = this.optionalSteps.value.map(resp => {
      return {
        statuses: resp,
        step_type_selected: 'option',
      }
    })
    const tempMandatory = this.steps.value.map(resp => {
      return {
        statuses: resp,
        step_type_selected: 'mandatory',
      }
    })

    this.prevTotalStepMandatory = tempMandatory?.length;

    let temp = [...tempMandatory, ...tempOptional];

    temp = temp.map((resp, index) => {
      if (resp?.statuses?.length) {
        return {
          step: index,
          ...resp
        }
      }
    }).filter(resp => resp);

    this.paginator.pageIndex = 0;
    const tempSteps = temp?.length ? temp : null;
    if (JSON.stringify(tempSteps) !== JSON.stringify(this.filteredValues.steps)) {
      if (temp.length > 0) {
        this.filteredValues.steps = temp;
        console.log('after clone', this.filteredValues.steps);
        this.getAllContractProcess('steps filter');
      } else {
        this.filteredValues.steps = null;
        this.getAllContractProcess('steps filter');
      }
    }
  }

  checkRowSelect() {
    let selected = false;
    if (this.userSelected.length > 0) {
      selected = true;
    }
    return selected;
  }

  getTemplatePDF(element) {
    this.isTopWaitingForResponse = true;
    const preview = false;
    const stepContract = element.steps.find((list) => list.step_type === 'step_with_signing_process');
    this.subs.sink = this.formFillingService
      .generateFormBuilderContractTemplatePDF(stepContract.form_builder_step._id, preview, this.translate.currentLang, stepContract._id)
      .subscribe(
        (resp) => {
          console.log(resp);
          this.isTopWaitingForResponse = false;
          if (resp) {
            console.log('getPDF>>', resp);
            if (resp) {
              const link = document.createElement('a');
              link.setAttribute('type', 'hidden');
              link.href = `${environment.apiUrl}/fileuploads/${resp}`.replace('/graphql', '');
              link.target = '_blank';
              link.click();
              link.remove();
            }
          }
        },
        (err) => {
          this.isTopWaitingForResponse = false;
          this.authService.postErrorLog(err);
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

  renderTooltipIntervenant(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    if (entities !== null) {
      for (const entity of entities) {
        if (entity) {
          count++;
          if (count > 1) {
            tooltip += ', ';
          }
          const program =
            entity.program && entity.program.program
              ? entity.type_intervention && entity.subject_id && entity.subject_id.short_name
                ? ` - ` + entity.program.program
                : entity.program.program
              : '';
          const subject =
            entity.subject_id && entity.subject_id.short_name
              ? entity.type_intervention
                ? ` - ` + entity.subject_id.short_name
                : entity.subject_id.short_name
              : '';
          const intervention = entity.type_intervention ? this.translate.instant(entity.type_intervention) : '';
          tooltip += intervention + subject + program;
        }
      }
    }
    return tooltip;
  }

  openNewTab(url, _id?) {
    if (_id) {
      const teacherSubjectIds = _id;
      const urls = this.router.createUrlTree(['teacher-contract/contract-process'], { queryParams: { contractId: teacherSubjectIds, fromContractManagement: 'true' } });
      window.open(urls.toString(), '_blank');
    } else {
      window.open(url, '_blank');
    }
  }

  getTextForSigningProgressStatus(signatories: any[]): string {
    const text = this.translate.instant('in_progress_of_signing');
    const array = [];
    const signatory =
      signatories && signatories.length ? signatories.find((signatorys: any) => signatorys && !signatorys.is_already_sign) : null;
    if (signatory && signatory.user_id) {
      const validator = signatory.user_id;
      if (validator.civility && validator.civility !== 'neutral') {
        array.push(this.translate.instant(validator.civility));
      }
      if (validator.last_name) {
        array.push(String(validator.last_name).toLocaleUpperCase());
      }
      if (validator.first_name) {
        array.push(String(validator.first_name));
      }
    }
    return array.length ? `${text} - ${array.join(' ')}` : text;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
  // countHour(data) {
  //   let hour = 0;
  //   if (data.interventions && data.interventions.length) {
  //     hour = data.interventions.map((item) => item.total_hours).reduce((prev, curr) => prev + curr, 0);
  //   }
  //   return hour;
  // }

  // countHourRate(data) {
  //   let rate = 0;
  //   if (data.interventions && data.interventions.length) {
  //     rate = data.interventions.map((item) => item.hourly_rate).reduce((prev, curr) => prev + curr, 0);
  //   }
  //   return rate;
  // }

  getAllContractForSendForm(pageNumber, action) {
    console.log('unselect', this.dataUnselectUser);

    if (this.buttonClicked === 'sendForm') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allContractForSendForm = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        const filterData = this.cleanFilterData();
        this.contractService.getDataContractForSendForm(pagination, filterData, this.sortValue, userTypesList).subscribe(
          (students: any) => {
            if (students && students.length) {
              const resp = _.cloneDeep(students);
              this.allContractForSendForm = _.concat(this.allContractForSendForm, resp);
              const page = pageNumber + 1;
              this.getAllContractForSendForm(page, action);
            } else {
              this.isLoading = false;
              if (this.isCheckedAll && this.allContractForSendForm && this.allContractForSendForm.length) {
                this.dataSelected = this.allContractForSendForm.filter((list) => !this.dataUnselectUser.includes(list._id));
                this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                console.log('getDataContractForSendForm', this.dataSelected);
                if (this.dataSelected && this.dataSelected.length) {
                  this.onSendingPreContract('multiple');
                }
              }
            }
          },
          (error) => {
            this.isReset = false;
            this.isLoading = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translate.instant('OK'),
            });
          },
        );
      } else {
        this.onSendingPreContract('multiple');
      }
    }
  }

  controllerButton(action) {
    switch (action) {
      case 'sendForm':
        setTimeout(() => {
          this.getAllContractForSendForm(0, 'sendForm');
        }, 500);
        break;
      default:
        this.resetFilter();
    }
  }

  checkFilteredSteps(stepColumnIndex) {
    const findStepIndex = this.filteredValues.steps.findIndex(
      (step) => step.step === stepColumnIndex && step?.step_type_selected === 'mandatory',
    );
    return findStepIndex;
  }
  checkFilteredOptionalSteps(stepColumnIndex) {
    const findStepIndex = this.filteredValues.steps.findIndex(
      (step) => step.step === stepColumnIndex && step?.step_type_selected === 'option',
    );
    return findStepIndex;
  }
  filterBreadcrumbFormat() {
    const stepsStatusFilterInfo = [];
    this.stepColumnsBreadCrumb = this.stepColumns?.length ? this.stepColumns : [];
    if (this.stepColumnsBreadCrumb?.length) {
      this.stepColumnsBreadCrumb.forEach((element, index) => {
        const stepFilter = {
          type: 'table_filter', // type of filter super_filter | table_filter | action_filter
          stepColumnName: 'TEST.STEP',
          name:
            this.steps?.controls[index]?.value?.length && this.steps?.controls[index]?.value?.length !== this.stepStatusList?.length
              ? 'statuses'
              : index.toString(),
          column: index + 1,
          isMultiple: this.steps?.controls[index]?.value?.length === this.stepStatusList?.length ? false : true,
          filterValue:
            this.steps?.controls[index]?.value?.length === this.stepStatusList?.length
              ? this.filteredValuesAll
              : this.filteredValues?.steps?.length && this.checkFilteredSteps(index) !== -1
              ? this.filteredValues?.steps[this.checkFilteredSteps(index)]
              : null,
          filterList: this.steps?.controls[index]?.value?.length === this.stepStatusList?.length ? null : this.stepStatusList,
          filterRef: this.steps?.controls[index],
          displayKey: this.steps?.controls[index]?.value?.length === this.stepStatusList?.length ? null : 'value',
          savedValue: this.steps?.controls[index]?.value?.length === this.stepStatusList?.length ? null : 'value',
          isSelectionInput: this.steps?.controls[index]?.value?.length === this.stepStatusList?.length ? false : true,
          resetValue: null,
          translationPrefix:
            this.steps?.controls[index]?.value?.length !== this.stepStatusList?.length ? 'CONTRACT_MANAGEMENT.Step_Statuses.' : null,
        };
        stepsStatusFilterInfo.push(stepFilter);
      });
    }
    const optionStatusFilterInfo = [];
    this.optionColumnsBreadCrumb = this.optionalStepColumns?.length ? this.optionalStepColumns : [];
    if (this.optionColumnsBreadCrumb?.length) {
      this.optionColumnsBreadCrumb.forEach((element, index) => {
        const stepFilter = {
          type: 'table_filter', // type of filter super_filter | table_filter | action_filter
          name:
            this.optionalSteps?.controls[index]?.value?.length &&
            this.optionalSteps?.controls[index]?.value?.length !== this.stepStatusList?.length
              ? 'statuses'
              : index.toString(),
          column: `O${index + 1}`,
          isMultiple: this.optionalSteps?.controls[index]?.value?.length === this.stepStatusList?.length ? false : true,
          filterValue:
            this.optionalSteps?.controls[index]?.value?.length === this.stepStatusList?.length
              ? this.filteredValuesAll
              : this.filteredValues?.steps?.length && this.checkFilteredSteps(index) !== -1
              ? this.filteredValues?.steps[this.checkFilteredSteps(index)]
              : null,
          filterList: this.optionalSteps?.controls[index]?.value?.length === this.stepStatusList?.length ? null : this.stepStatusList,
          filterRef: this.optionalSteps?.controls[index],
          displayKey: this.optionalSteps?.controls[index]?.value?.length === this.stepStatusList?.length ? null : 'value',
          savedValue: this.optionalSteps?.controls[index]?.value?.length === this.stepStatusList?.length ? null : 'value',
          isSelectionInput: this.optionalSteps?.controls[index]?.value?.length === this.stepStatusList?.length ? false : true,
          resetValue: null,
          translationPrefix:
            this.optionalSteps?.controls[index]?.value?.length !== this.stepStatusList?.length
              ? 'CONTRACT_MANAGEMENT.Step_Statuses.'
              : null,
        };
        optionStatusFilterInfo.push(stepFilter);
      });
    }
    const filterInfo: FilterBreadCrumbInput[] = [
      ...stepsStatusFilterInfo,
      ...optionStatusFilterInfo,
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'teacher', // name of the key in the object storing the filter
        column: 'CONTRACT_MANAGEMENT.teacher', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.teacherFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'contract_types', // name of the key in the object storing the filter
        column: 'CONTRACT_MANAGEMENT.contract_type', // name of the column in the table or the field if super filter
        isMultiple: this.contractTypeFilter?.value?.length === this.typeOfConracts?.length ? false : true,
        filterValue: this.contractTypeFilter?.value?.length === this.typeOfConracts?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.contractTypeFilter?.value?.length === this.typeOfConracts?.length ? null : this.typeOfConracts,
        filterRef: this.contractTypeFilter,
        displayKey: this.contractTypeFilter?.value?.length === this.typeOfConracts?.length ? null : 'value',
        savedValue: this.contractTypeFilter?.value?.length === this.typeOfConracts?.length ? null : 'value',
        isSelectionInput: this.contractTypeFilter?.value?.length === this.typeOfConracts?.length ? false : true,
        translationPrefix: this.contractTypeFilter?.value?.length !== this.typeOfConracts?.length ? 'ERP_009_TEACHER_CONTRACT.TYPE_OF_CONTRACT.' : null,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'intervention_numbers', // name of the key in the object storing the filter
        column: 'Number of intervention', // name of the column in the table or the field if super filter
        isMultiple: this.numberInterventionFilter?.value?.length === this.numberIntervention?.length ? false : true,
        filterValue: this.numberInterventionFilter?.value?.length === this.numberIntervention?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.numberInterventionFilter?.value?.length === this.numberIntervention?.length ? null : this.numberIntervention,
        filterRef: this.numberInterventionFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: this.numberInterventionFilter?.value?.length === this.numberIntervention?.length ? false : true,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'email', // name of the key in the object storing the filter
        column: 'CONTRACT_MANAGEMENT.email', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.emailFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'phone', // name of the key in the object storing the filter
        column: 'CONTRACT_MANAGEMENT.phone', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.phoneFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'start_date', // name of the key in the object storing the filter
        column: 'CONTRACT_MANAGEMENT.start', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.startDateFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'end_date', // name of the key in the object storing the filter
        column: 'CONTRACT_MANAGEMENT.end', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.endDateFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'contract_manager', // name of the key in the object storing the filter
        column: 'Contract Manager', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.contractManagerFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'contract_statuses', // name of the key in the object storing the filter
        column: 'CONTRACT_MANAGEMENT.Contract Process Status', // name of the column in the table or the field if super filter
        isMultiple: this.statusFilter?.value?.length === this.statusList?.length ? false : true,
        filterValue: this.statusFilter?.value?.length === this.statusList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.statusFilter?.value?.length === this.statusList?.length ? null : this.statusList,
        filterRef: this.statusFilter,
        displayKey: this.statusFilter?.value?.length === this.statusList?.length ? null : 'value',
        savedValue: this.statusFilter?.value?.length === this.statusList?.length ? null : 'value',
        isSelectionInput: this.statusFilter?.value?.length === this.statusList?.length ? false : true,
        translationPrefix: this.statusFilter?.value?.length !== this.statusList?.length ? 'CONTRACT_MANAGEMENT.Statuses.' : null,
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
    console.log('cek filter data breadcrumb', this.filterBreadcrumbData);
  }
  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      if (filterItem?.name === 'statuses' && typeof filterItem?.column === 'number' && this.filteredValues?.steps?.length) {
        const findIndex = this.checkFilteredSteps(filterItem?.column - 1);
        this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, null);
        this.filteredValues?.steps?.splice(findIndex, 1);
      } else if (filterItem?.name === 'statuses' && typeof filterItem?.column === 'string' && this.filteredValues?.steps?.length) {
        const index = filterItem?.column?.slice(1);
        const findIndex = this.checkFilteredOptionalSteps(Number(index) - 1);
        this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, null);
        this.filteredValues?.steps?.splice(findIndex, 1);
      } else {
        this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
      }
      this.getAllContractProcess();
    }
  }
  isAllDropdownSelected(type, index?) {
    if (type === 'typeOfContract') {
      const selected = this.contractTypeFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.typeOfConracts.length;
      return isAllSelected;
    } else if (type === 'numberIntervention') {
      const selected = this.numberInterventionFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.numberIntervention.length;
      return isAllSelected;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.statusList.length;
      return isAllSelected;
    } else if (type === 'steps') {
      const selected = this.steps.controls[index].value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.stepStatusList.length;
      return isAllSelected;
    } else if (type === 'optionalSteps') {
      const selected = this.optionalSteps.controls[index].value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.stepStatusList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type, index?) {
    if (type === 'typeOfContract') {
      const selected = this.contractTypeFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.typeOfConracts.length;
      return isIndeterminate;
    } else if (type === 'numberIntervention') {
      const selected = this.numberInterventionFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length !== this.numberIntervention.length;
      return isAllSelected;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length !== this.statusList.length;
      return isAllSelected;
    } else if (type === 'steps') {
      const selected = this.steps.controls[index].value;
      const isAllSelected = selected && selected.length !== 0 && selected.length !== this.stepStatusList.length;
      return isAllSelected;
    } else if (type === 'optionalSteps') {
      const selected = this.optionalSteps.controls[index].value;
      const isAllSelected = selected && selected.length !== 0 && selected.length !== this.stepStatusList.length;
      return isAllSelected;
    }
  }

  selectAllData(event, type, index?) {
    if (type === 'typeOfContract') {
      if (event.checked) {
        const data = this.typeOfConracts.map((el) => el?.value);
        this.contractTypeFilter.patchValue(data);
      } else {
        this.contractTypeFilter.patchValue(null);
      }
    } else if (type === 'numberIntervention') {
      if (event.checked) {
        const data = this.numberIntervention.map((el) => el);
        this.numberInterventionFilter.patchValue(data);
      } else {
        this.numberInterventionFilter.patchValue(null);
      }
    } else if (type === 'status') {
      if (event.checked) {
        const data = this.statusList.map((el) => el?.value);
        this.statusFilter.patchValue(data);
      } else {
        this.statusFilter.patchValue(null);
      }
    } else if (type === 'steps') {
      if (event.checked) {
        const data = this.stepStatusList.map((el) => el.value);
        this.steps.controls[index].patchValue(data);
      } else {
        this.steps.controls[index].patchValue(null);
      }
    } else if (type === 'optionalSteps') {
      if (event.checked) {
        const data = this.stepStatusList.map((el) => el.value);
        this.optionalSteps.controls[index].patchValue(data);
      } else {
        this.optionalSteps.controls[index].patchValue(null);
      }
    }
  }
  selectedMultipleFilter(from) {
    if (this.isMultipleFilter) {
      this.isMultipleFilter = false;
      const value =
        from === 'typeOfContract'
          ? this.contractTypeFilter.value
          : from === 'numberIntervention'
          ? this.numberInterventionFilter.value
          : from === 'status'
          ? this.statusFilter.value
          : null;
      if (from === 'typeOfContract') {
        const dataValue = value?.length ? value.map((temp) => this.utilService.simpleDiacriticSensitiveRegex(temp.toLowerCase())) : null;
        this.filteredValues.contract_types = dataValue?.length ? dataValue : null;
      } else if (from === 'numberIntervention') {
        this.filteredValues.intervention_numbers = value?.length ? value : null;
      } else if (from === 'status') {
        this.filteredValues.contract_statuses = value?.length ? value : null;
      }
      this.paginator.pageIndex = 0;
      this.getAllContractProcess('contractTypeFilter');
    }
  }
}
