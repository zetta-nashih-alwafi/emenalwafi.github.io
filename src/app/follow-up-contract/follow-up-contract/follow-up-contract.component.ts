import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, OnChanges } from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SubSink } from 'subsink';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AuthService } from 'app/service/auth-service/auth.service';
import Swal from 'sweetalert2';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { StudentsService } from 'app/service/students/students.service';
import { ActivatedRoute } from '@angular/router';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { UtilityService } from 'app/service/utility/utility.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { UserService } from 'app/service/user/user.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { ApplicationUrls } from 'app/shared/settings';
import { ExportCsvService } from 'app/service/export-csv/export-csv.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { environment } from 'environments/environment';
import { InternshipEmailDialogComponent } from 'app/internship-file/internship-email-dialog/internship-email-dialog.component';
import { SendMultipleEmailComponent } from 'app/internship-file/send-multiple-email/send-multiple-email.component';
import { timeHours } from 'd3';
import { CoreService } from 'app/service/core/core.service';
import { AddContractFollowUpDialogComponent } from '../add-contract-follow-up-dialog/add-contract-follow-up-dialog.component';
import { ContractService } from 'app/service/contract/contract.service';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { RefuseToSignNoteDialogComponent } from '../refuse-to-sign-note-dialog/refuse-to-sign-note-dialog.component';
@Component({
  selector: 'ms-follow-up-contract',
  templateUrl: './follow-up-contract.component.html',
  styleUrls: ['./follow-up-contract.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class FollowUpContractComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  displayedColumns: string[] = [
    'select',
    'studentNumber',
    'name',
    'program',
    'templateName',
    'financier',
    'typeOfFinancement',
    'startDate',
    'endDate',
    'contractManager',
    'sendDate',
    'status',
    'action',
  ];
  filterColumns: String[] = [
    'selectFilter',
    'studentNumberFilter',
    'nameFilter',
    'programFilter',
    'templateNameFilter',
    'financierFilter',
    'typeOfFinancementFilter',
    'startDateFilter',
    'endDateFilter',
    'contractManagerFilter',
    'sendDateFilter',
    'statusFilter',
    'actionFilter',
  ];
  filterForm: UntypedFormGroup;
  isCheckedAll = false;
  filteredValues = {
    school: '',
    campus: '',
    level: '',
    tags: '',
    scholar_season: '',
    student_unique_number: '',
    student_name: '',
    program: '',
    template_names: '',
    financer: '',
    type_of_financement: '',
    start_date: '',
    end_date: '',
    contract_manager: '',
    send_at: '',
    contract_status: null,
    offset: null,
    template_type: 'fc_contract',
  };

  filteredValuesAll = {
    template_names: ['All'],
    contract_manager: ['AllF'],
    contract_status: 'All',
    level: 'All',
    campus: 'All',
    school: 'All',
    scholar_season: 'All',
  };

  superFilter = {
    level: '',
    tags: '',
    campus: '',
    school: '',
    scholar_season: '',
  };

  searching = {
    trial_date: '',
  };
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
  maleIcon = '../../../../../assets/img/student_icon.png';
  femaleIcon = '../../../../../assets/img/student_icon_fem.png';
  greenHeartIcon = '../../../../../assets/img/enagement_icon_green.png';
  flagsIconPath = '../../../../../assets/icons/flags-nationality/';
  shieldAccountIcon = '../../../../../assets/img/shield-account.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  userSelected: any[];
  userSelectedId: any[];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataCount = 0;
  disabledExport = true;
  isSameData = false;
  private subs = new SubSink();
  noData: any;
  currentUser: any;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  exportName: 'Exporter Liste des Candidats';
  selectType: any;
  entityData: any;
  private timeOutVal: any;
  private intervalVal: any;
  titleList = [];
  originalTitleList = [];
  originalNationalityList = [];
  schoolList = [];
  originalCandidateList = [];
  isLoading: Boolean;
  allStudentForExport = [];
  allStudentForCustom = [];
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  campusList = [];
  listObjective = [];
  levels = [];
  school = [];
  scholars = [];
  originalScholar = [];
  scholarSelected = [];
  filteredTrialDateList: Observable<any[]>;
  allCandidateData: any = [];
  isWasSelectAll = false;
  dataSelectedAll: any;
  previousLength = 0;
  pageSelected = [];
  allStudentForCheckbox = [];
  dataSelected = [];
  isPermission: string[];
  currentUserTypeId: any;
  campusListBackup = [];
  levelListBackup = [];
  tagList = [];
  schoolName = '';
  campusName = '';
  levelName = '';
  scholarFilter = new UntypedFormControl('All');
  schoolsFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  levelFilter = new UntypedFormControl(null);
  tagFilter = new UntypedFormControl(null);
  studentNumberFilter = new UntypedFormControl(null);
  nameFilter = new UntypedFormControl(null);
  programFilter = new UntypedFormControl(null);
  templateNameFilter = new UntypedFormControl(null);
  financierFilter = new UntypedFormControl(null);
  typeOfFinancementFilter = new UntypedFormControl(null);
  startDateFilter = new UntypedFormControl(null);
  endDateFilter = new UntypedFormControl(null);
  contractManagerFilter = new UntypedFormControl(null);
  contractManagerFilterDummy = new UntypedFormControl('All');
  sendDateFilter = new UntypedFormControl(null);
  statusFilter = new UntypedFormControl(null);
  statusList = [
    { key: 'Not sent', value: 'not_sent' },
    { key: 'In progress of signing', value: 'in_progress_of_signing' },
    { key: 'Signed', value: 'signed' },
    {key: 'reject_and_stop', value: 'reject_and_stop' },
  ];
  templateNameList = [];
  financierList = [];
  typeOfFinancementList = [];
  contractManagerList = [];
  isWaitingForResponse: boolean;
  isDisabled = true;
  dataUnselectUser = [];
  allExportForCheckbox = [];
  filterBreadcrumbData: FilterBreadCrumbItem[] = [];
  breadcrumbData = {
    contract_manager: null,
  };

  constructor(
    private candidatesService: CandidatesService,
    private exportCsvService: ExportCsvService,
    private authService: AuthService,
    private utilService: UtilityService,
    private ngxPermissionService: NgxPermissionsService,
    private userService: UserService,
    public permissionService: PermissionService,
    private translate: TranslateService,
    public dialog: MatDialog,
    private studentService: StudentsService,
    private route: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private router: Router,
    private permissionsService: NgxPermissionsService,
    private fb: UntypedFormBuilder,
    private financeService: FinancesService,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    private coreService: CoreService,
    private contractService: ContractService,
    private teacherContractService: TeacherContractService,
    private httpClient: HttpClient,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    this.coreService.sidenavOpen = false;
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.initFilterForm();
    this.initFilter();
    this.getDropdown();
    this.getDataTags();
    this.getContractData('First');
    this.initDropdown()    
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.initDropdown()
      this.scholars = [];
      this.scholars = this.originalScholar.sort((a, b) =>
        a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
      );
      this.scholars.unshift({ _id: 'All', scholar_season: this.translate.instant('All') });
      this.scholars = _.uniqBy(this.scholars, '_id');
    });
    this.getDataScholarSeasons();
    if (this.scholarFilter.value) {
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.repopulateContractManagerDropdown();
      this.filterBreadcrumbFormat();
    });

    this.pageTitleService.setTitle('Follow up Contract/Convention');
  }
  initDropdown(){
    this.statusList = this.statusList.map(status =>{
      return{
        ...status,
        label: this.translate.instant(status.key)
      }
    })
  }
  getDataCRM(search) {
    const data = this.contractManagerList.find((option) => option?.last_name + ' ' + option?.first_name === search);
    this.contractManagerFilterDummy.setValue(data?._id);
    this.breadcrumbData.contract_manager = data?._id;
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  ngOnChanges() {}

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getContractData('AfterViewInit');
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }  

  getContractData(data) {
    console.log('_from', data);
    this.isLoading = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    // console.log(pagination);
    const filter = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    // filter.template_type = 'fc_contract';
    console.log('cek filter', filter);
    this.subs.sink = this.candidatesService.getAllFormContractFCProcesses(pagination, filter, userTypesList).subscribe(
      (resp: any) => {
        if (data === 'superFilter') {
          if (!this.campusFilter.value && this.filteredValues.campus) {
            this.campusFilter.setValue(this.filteredValues.campus);
          }
          if (!this.levelFilter.value && this.filteredValues.level) {
            if (this.levels && !this.levels.length) {
              this.getDataLevel();
            }
            this.levelFilter.setValue(this.filteredValues.level);
          }
          this.isDisabled = true;
        }
        if (resp && resp.length) {
          this.dataSource.data = resp;
          // console.log('table data', this.dataSource.data);
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
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
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

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getContractData('sortData');
      }
    }
  }

  initFilterForm() {
    this.filterForm = this.fb.group({
      schools: [null],
      campuses: [null],
      levels: [null],
    });
  }

  initFilter() {
    this.subs.sink = this.schoolsFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.level = '';
      this.superFilter.campus = '';
      this.superFilter.school =
        statusSearch === '' || (statusSearch && statusSearch.includes('All')) || !statusSearch?.length ? '' : statusSearch;
      if (this.superFilter.school && this.superFilter.school.length === 0) {
        this.campusName = '';
        this.levelName = '';
      }
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.level = '';
      this.superFilter.campus =
        statusSearch === '' || (statusSearch && statusSearch.includes('All')) || !statusSearch?.length ? '' : statusSearch;
      console.log(this.superFilter.campus);
      if (this.superFilter.campus && this.filteredValues?.campus?.length === 0) {
        this.levelName = '';
      }
    });

    this.subs.sink = this.levelFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.level =
        statusSearch === '' || (statusSearch && statusSearch.includes('All')) || !statusSearch?.length ? '' : statusSearch;
      this.isDisabled = false;
    });

    this.subs.sink = this.tagFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.tags = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
      if (statusSearch) {
        this.isDisabled = false;
      }
    });

    this.subs.sink = this.scholarFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.level = '';
      this.superFilter.campus = '';
      this.schoolsFilter.setValue(null);
      this.superFilter.scholar_season = statusSearch === '' || statusSearch === 'All' ? null : statusSearch;
      if (!this.superFilter.scholar_season) {
        this.campusName = '';
        this.schoolName = '';
        this.levelName = '';
      }
    });

    this.subs.sink = this.studentNumberFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        this.filteredValues.student_unique_number = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getContractData('studentNumberFilter');
        }
      } else {
        this.filteredValues.student_unique_number = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getContractData('studentNumberFilter');
        }
      }
    });
    this.subs.sink = this.nameFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,+*$&#%^!\/]/g;
      const symbol1 = /\\/;
      if (statusSearch) {
        if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
          this.filteredValues.student_name = statusSearch ? statusSearch.toLowerCase() : '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getContractData('studentNameFilter');
          }
        } else {
          this.nameFilter.setValue('');
          this.filteredValues.student_name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getContractData('studentNameFilter 2');
          }
        }
      } else {
        this.filteredValues.student_name = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getContractData('studentNameFilter 3');
        }
      }
    });
    this.subs.sink = this.programFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,+*$&#%^!\/]/g;
      const symbol1 = /\\/;
      if (statusSearch) {
        if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
          this.filteredValues.program = statusSearch ? statusSearch.toLowerCase() : '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getContractData('programFilter');
          }
        } else {
          this.programFilter.setValue('');
          this.filteredValues.program = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getContractData('programFilter 2');
          }
        }
      } else {
        this.filteredValues.program = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getContractData('programFilter 3');
        }
      }
    });
    this.subs.sink = this.templateNameFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.template_names =
        statusSearch === '' || (statusSearch && statusSearch.includes('All')) || !statusSearch?.length ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getContractData('templateNameFilter');
      }
    });
    this.subs.sink = this.financierFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.financer = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getContractData('financierFilter');
      }
    });
    this.subs.sink = this.typeOfFinancementFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.type_of_financement = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getContractData('typeOfFinancementFilter');
      }
    });
    // start date
    this.subs.sink = this.startDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.start_date = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getContractData('startDateFilter');
        }
      }
    });
    // end date
    this.subs.sink = this.endDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.end_date = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getContractData('endDateFilter');
        }
      }
    });
    // contract manager
    this.subs.sink = this.contractManagerFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.contract_manager = statusSearch === 'All' ? '' : statusSearch;
      this.getDataCRM(statusSearch);
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getContractData('contractManagerFilter');
      }
    });
    // sent date
    this.subs.sink = this.sendDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.send_at = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getContractData('sendDateFilter');
        }
      }
    });
    // status
    this.subs.sink = this.statusFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.contract_status = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getContractData('contractStatusFilter');
      }
    });
  }

  resetCandidate() {
    this.disabledExport = true;
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
    this.isReset = true;
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.schoolName = '';
    this.campusName = '';
    this.levelName = '';
    this.filterBreadcrumbData = [];

    this.breadcrumbData = {
      contract_manager: null,
    };
    this.filteredValues = {
      school: '',
      campus: '',
      level: '',
      tags: '',
      scholar_season: '',
      student_unique_number: '',
      student_name: '',
      program: '',
      template_names: '',
      financer: '',
      type_of_financement: '',
      start_date: '',
      end_date: '',
      contract_manager: '',
      send_at: '',
      contract_status: null,
      offset: null,
      template_type: 'fc_contract',
    };

    this.superFilter = {
      level: '',
      tags: '',
      campus: '',
      school: '',
      scholar_season: '',
    };

    // reset filter value to be null when reset clicked
    this.searching = {
      trial_date: '',
    };
    this.schoolsFilter.setValue(null, { emitEvent: false });
    this.campusFilter.setValue(null, { emitEvent: false });
    this.levelFilter.setValue(null, { emitEvent: false });
    this.scholarFilter.setValue('All', { emitEvent: false });
    this.studentNumberFilter.setValue(null, { emitEvent: false });
    this.nameFilter.setValue(null, { emitEvent: false });
    this.programFilter.setValue(null, { emitEvent: false });
    this.templateNameFilter.setValue(null, { emitEvent: false });
    this.financierFilter.setValue(null, { emitEvent: false });
    this.typeOfFinancementFilter.setValue(null, { emitEvent: false });
    this.startDateFilter.setValue(null, { emitEvent: false });
    this.endDateFilter.setValue(null, { emitEvent: false });
    this.contractManagerFilter.setValue(null, { emitEvent: false });
    this.contractManagerFilterDummy.setValue('All', { emitEvent: false });
    this.sendDateFilter.setValue(null, { emitEvent: false });
    this.statusFilter.setValue(null, { emitEvent: false });
    // reset filter value to be null when reset clicked
    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = '';
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.getContractData('resetCandidate');
    this.school = [];
    this.campusList = [];
    this.levels = [];
    this.isDisabled = true;
    if (this.scholarFilter.value) {
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
  }

  isSomeSelected() {
    return this.selection.selected.length > 0;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected() || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length)) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
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
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    const filter = this.cleanFilterData();
    this.subs.sink = this.candidatesService.getAllFormContractFCProcesses(pagination, filter, userTypesList).subscribe(
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
  }

  cleanFilterData() {
    if (this.filteredValues?.start_date || this.filteredValues?.end_date) {
      this.filteredValues.offset = moment().utcOffset();
    }
    const filterData = _.cloneDeep(this.filteredValues);
    console.log('filterData: ', filterData);
    let filterQuery = '';
    let schoolsMap;
    let levelsMap;
    let campusesMap;
    let tagsMap;
    let templatesMap;
    let contractsMap;
    let financersMap;
    let financementTypeMap;

    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'scholar_season' ||
          key === 'student_unique_number' ||
          key === 'student_name' ||
          key === 'program' ||
          key === 'start_date' ||
          key === 'end_date' ||
          key === 'send_at'
        ) {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        } else if (key === 'candidate_admission_statuses') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
        } else if (key === 'school') {
          schoolsMap = filterData.school.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` schools_id:[${schoolsMap}]`;
        } else if (key === 'level') {
          levelsMap = filterData.level.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` levels:[${levelsMap}]`;
        } else if (key === 'campus') {
          campusesMap = filterData.campus.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` campuses:[${campusesMap}]`;
        } else if (key === 'tags') {
          tagsMap = filterData.tags.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` tag_ids:[${tagsMap}]`;
        } else if (key === 'template_names') {
          templatesMap = filterData.template_names.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` template_names:[${templatesMap}]`;
        } else if (key === 'contract_manager') {
          contractsMap = filterData.contract_manager.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` contract_managers:[${contractsMap}]`;
        } else if (key === 'contract_status') {
          contractsMap = filterData.contract_status.map((res) => `` + res + ``);
          filterQuery = filterQuery + ` contract_statuses:[${contractsMap}]`;
        } else if (key === 'financer') {
          financersMap = filterData.financer.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` financers:[${financersMap}]`;
        } else if (key === 'type_of_financement') {
          financementTypeMap = filterData.type_of_financement.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` type_of_financements:[${financementTypeMap}]`;
        } else {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        }
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  cleanFilterDataDownload() {
    // this.filteredValues.offset = moment().utcOffset();
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    let schoolsMap;
    let levelsMap;
    let campusesMap;
    let tagsMap;
    let templatesMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'scholar_season' ||
          key === 'student_unique_number' ||
          key === 'student_name' ||
          key === 'program' ||
          key === 'start_date' ||
          key === 'end_date' ||
          key === 'send_at' ||
          key === 'template_type'
        ) {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        } else if (key === 'candidate_admission_statuses' || key === 'candidate_admission_status') {
        } else if (key === 'school') {
          schoolsMap = filterData.school.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"schools_id":[${schoolsMap}]` : filterQuery + `"schools_id":[${schoolsMap}]`;
        } else if (key === 'level') {
          levelsMap = filterData.level.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"levels":[${levelsMap}]` : filterQuery + `"levels":[${levelsMap}]`;
        } else if (key === 'campus') {
          campusesMap = filterData.campus.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"campuses":[${campusesMap}]` : filterQuery + `"campuses":[${campusesMap}]`;
        } else if (key === 'tags') {
          tagsMap = filterData.tags.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"tag_ids":[${tagsMap}]` : filterQuery + `"tag_ids":[${tagsMap}]`;
        } else if (key === 'template_names') {
          templatesMap = filterData.template_names.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"template_names":[${templatesMap}]`
            : filterQuery + `"template_names":[${templatesMap}]`;
        } else if (key === 'contract_manager') {
          templatesMap = filterData.contract_manager.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"contract_managers":[${templatesMap}]`
            : filterQuery + `"contract_managers":[${templatesMap}]`;
        } else if (key === 'contract_status') {
          templatesMap = filterData.contract_status.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"contract_statuses":[${templatesMap}]`
            : filterQuery + `"contract_statuses":[${templatesMap}]`;
        } else if (key === 'financer') {
          templatesMap = filterData.financer.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"financers":[${templatesMap}]` : filterQuery + `"financers":[${templatesMap}]`;
        } else if (key === 'type_of_financement') {
          templatesMap = filterData.type_of_financement.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"type_of_financements":[${templatesMap}]`
            : filterQuery + `"type_of_financements":[${templatesMap}]`;
        } else {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${filterData[key]}` : filterQuery + `"${key}":${filterData[key]}`;
        }
      }
    });
    return '"filter":{' + filterQuery + '}';
  }

  cleanSearchingDataDownload() {
    const filterData = _.cloneDeep(this.searching);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'trial_date') {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        }
      }
    });
    return '"searching":{' + filterQuery + '}';
  }

  viewAdmissionFile(candidateId) {
    const query = { candidate: candidateId };
    const url = this.router.createUrlTree(['/session/register'], { queryParams: query });
    window.open(url.toString(), '_blank');
  }

  getDataForList(data?) {
    const name = data ? data : '';
    const filter = { scholar_season_id: name };
    this.subs.sink = this.candidatesService.GetAllSchoolDropdown(filter, name, this.currentUserTypeId).subscribe(
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

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        // console.log(resp);
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

  scholarSelect() {
    this.school = [];
    this.levels = [];
    this.campusList = [];
    if (!this.scholarFilter.value || this.scholarFilter.value.length === 0) {
      this.filteredValues['scholar_season'] = '';
      this.scholarSelected = [];
      if (this.campusFilter.value) {
        this.campusFilter.setValue(null);
      }
      if (this.levelFilter.value) {
        this.levelFilter.setValue(null);
      }
      if (this.schoolsFilter.value) {
        this.schoolsFilter.setValue(null);
      }
      // this.getDataForList();
    } else {
      this.superFilter['scholar_season'] = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : null;
      this.scholarSelected = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : null;
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }
  }

  getDataCampus() {
    // console.log('school selected ', this.schoolsFilter.value);
    this.levels = [];
    this.campusList = [];
    this.schoolName = '';

    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
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
      this.filteredValues.school = this.schoolsFilter.value && !this.schoolsFilter.value.includes('All') ? this.schoolsFilter.value : null;

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

        school.forEach((element) => {
          const sName = this.school.find((list) => list._id === element);
          this.schoolName = this.schoolName ? this.schoolName + ',' + sName.short_name : sName.short_name;
        });

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

  getDataLevel() {
    this.levels = [];
    this.campusName = '';
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
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
        sCampus.forEach((element) => {
          const sName = this.campusList.find((list) => list._id === element);
          this.campusName = this.campusName ? this.campusName + ',' + sName.name : sName.name;
        });

        const sLevelList = this.campusList.filter((list) => {
          return sCampus.includes(list._id);
        });
        sLevelList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
              this.levelListBackup = this.levels;
            });
          }
        });
      } else if (sCampus && sCampus.includes('All') && this.campusList && this.campusList.length) {
        this.campusList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
              this.levelListBackup = this.levels;
            });
          }
        });
      }
    }
    this.levels = _.uniqBy(this.levels, 'name');
    this.levels = this.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }

  getDataByLevel() {
    this.levelName = '';

    if (this.levelFilter.value && !this.levelFilter.value.includes('All')) {
      const sLevel = this.levelFilter.value;

      sLevel.forEach((element) => {
        const sName = this.levels.find((list) => list._id === element);
        console.log(sName);
        this.levelName = this.levelName ? this.levelName + ',' + sName.name : sName.name;
      });
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
  checkSuperFilterCampus() {
    const form = this.campusFilter.value;
    if (form && form.length) {
      this.campusFilter.patchValue(form);
    } else {
      this.campusFilter.patchValue(null);
    }
    this.getDataLevel();
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

  transformDate(data) {
    if (data && data.date && data.time) {
      const date = data.date;
      const time = data.time;

      const datee = this.parseUtcToLocalPipe.transformDate(date, time);
      return datee;
    } else {
      return '';
    }
  }

  transformDateDue(data) {
    if (data && data.due_date && data.due_time) {
      const date = data.due_date;
      const time = data.due_time;

      const datee = this.parseUtcToLocalPipe.transformDate(date, time);
      return datee;
    } else {
      return '';
    }
  }

  clearSelectIfFilter() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
    this.userSelected = [];
    this.userSelectedId = [];
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
  }
  getAllIdForCheckbox(pageNumber) {
    if (this.isCheckedAll) {
      if (this.dataUnselectUser.length < 1) {
        this.csvDownloadAdmission();
      } else {
        if (pageNumber === 0) {
          this.allExportForCheckbox = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const filter = this.cleanFilterData();
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        this.subs.sink = this.candidatesService.getAllFormProcessesCheckboxId(pagination, filter, userTypesList).subscribe(
          (students: any) => {
            if (students && students.length) {
              this.allExportForCheckbox.push(...students);
              const page = pageNumber + 1;
              this.getAllIdForCheckbox(page);
            } else {
              this.isLoading = false;
              if (this.isCheckedAll) {
                if (this.allExportForCheckbox && this.allExportForCheckbox.length) {
                  this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  this.csvDownloadAdmission();
                }
              }
            }
          },
          (error) => {
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
    } else {
      this.csvDownloadAdmission();
    }
  }

  getDataTags() {
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService.getAllTags(true, 'fc_contract', userTypesList, this.candidate_admission_statuses).subscribe(
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

  csvDownloadAdmission() {
    if (
      this.dataSelected &&
      this.dataSelected.length < 1 &&
      (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser.length > 1))
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
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
  }

  openDownloadCsv(fileType) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const importStudentTemlate = `downloadFCContractCSV/`;
    const filter = this.cleanFilterDataDownload();
    const userTypesList =
      this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id.map((res) => `"` + res + `"`) : [];
    const sorting = this.cleanSearchingDataDownload();
    console.log('filter', filter);
    let filtered;
    if ((this.dataSelected.length && !this.isCheckedAll) || (this.dataSelected && this.dataSelected.length && this.isCheckedAll)) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      const billing = `"fc_contract_process_ids":` + '[' + mappedUserId.toString() + ']';
      if (filter.length > 9) {
        filtered = filter.slice(0, 10) + billing + ',' + filter.slice(10);
      } else {
        filtered = filter.slice(0, 10) + billing + filter.slice(10);
      }
    } else if (this.isCheckedAll) {
      filtered = filter;
    }
    const fullURL = url + importStudentTemlate + fileType + '/' + lang + '/' + this.currentUser._id + '/' + this.currentUserTypeId;
    console.log('fullURL', fullURL);
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
        'Content-Type': 'application/json',
      }),
    };

    const payload =
      '{' +
      filtered +
      ',' +
      '"user_type_ids":[' +
      userTypesList +
      ']' +
      ',' +
      sorting +
      ',"user_type_id":' +
      `"${this.currentUserTypeId}"` +
      '}';
    this.isLoading = true;
    this.subs.sink = this.httpClient.post(`${encodeURI(fullURL)}`, payload, httpOptions).subscribe(
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
          }).then(() => this.clearSelectIfFilter());
        } else {
          this.isLoading = false;
        }
      },
      (err) => {
        this.isLoading = false;
        console.log('error uat 389', err);
      },
    );
  }

  addContract() {
    this.subs.sink = this.dialog
      .open(AddContractFollowUpDialogComponent, {
        width: '800px',
        disableClose: true,
        panelClass: 'add-contract-pop-up',
        data: {
          title: 'Add new',
          user_id: null,
          candidate_id: null,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getContractData('addContract');
          this.onGoToForm(resp, 'add');          
        }
      });
  }

  editContract(element) {
    this.subs.sink = this.dialog
      .open(AddContractFollowUpDialogComponent, {
        width: '800px',
        disableClose: true,
        data: {
          title: 'edit',
          user_id: element.candidate_id.user_id,
          candidate_id: element.candidate_id._id,
          element: element,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getContractData('addContract');
        }
      });
  }  

  onGoToForm(element, type) {    
    let userTypeId = "";        
    
    if(type ==='edit') {
      const user_who_complete_step = element?.form_builder_id?.steps && element?.form_builder_id?.steps?.length ? element?.form_builder_id?.steps[0].user_who_complete_step?.name : null;      
      this.currentUser?.app_data?.user_type?.forEach(user => {
        if(user?.name === user_who_complete_step) {
          userTypeId = user?._id
        }
      })          
    } else if(type === 'add') {
      this.currentUser?.app_data?.user_type?.forEach(user => {
        if(user?.name === element?.user_who_complete) {
          userTypeId = user?._id
        }
      })
    }

    if(!userTypeId) {
        userTypeId = this.authService.getCurrentUser().entities[0].type._id;
    }
    
    const url = this.router.createUrlTree(['/form-fill'], {
      queryParams: {
        formId: element._id,
        formType: 'fc_contract',
        userId: this.currentUser._id,
        userTypeId: userTypeId,
      },
    });
    window.open(url.toString(), '_blank');
  }

  deleteContract(element) {
    this.isLoading = true;
    this.subs.sink = this.contractService.deleteFcContractProcess(element._id).subscribe(
      (list) => {
        this.isLoading = false;
        if (list) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            allowOutsideClick: false,
            confirmButtonText: this.translate.instant('CANDIDAT_S4.BUTTON'),
          }).then((resss) => {
            this.getContractData('deleteContract');
          });
        }
      },
      (error) => {
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

  getDropdown() {
    this.getTemplateNameDropdown();
    this.getFinancierDropdown();
    this.getTypeOfFinancementDropdown();
    this.getContractManagerDropdown();
  }
  getTemplateNameDropdown() {
    this.subs.sink = this.candidatesService.getTemplateNameDropdown().subscribe(
      (resp) => {
        if (resp) {
          this.templateNameList = resp;
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
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
  getFinancierDropdown() {
    this.subs.sink = this.candidatesService.getFinancierDropdown().subscribe(
      (resp) => {
        if (resp) {
          this.financierList = resp;
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
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

  getTypeOfFinancementDropdown() {
    this.subs.sink = this.candidatesService.getTypeOfFinancementDropdown().subscribe(
      (resp) => {
        if (resp) {
          this.typeOfFinancementList = resp;
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
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

  getContractManagerDropdown() {
    this.subs.sink = this.candidatesService.getContractManagerDropdown().subscribe(
      (resp) => {
        if (resp?.length) {
          this.contractManagerList = resp
            .map((contract) => {
              return {
                ...contract,
                value: contract?.last_name?.toUpperCase() + ' ' + contract?.first_name,
                full_name:
                  contract?.last_name?.toUpperCase() +
                  ' ' +
                  contract?.first_name +
                  ' ' +
                  (contract?.civility && contract?.civility === 'neutral' ? '' : this.translate.instant(contract?.civility)),
              };
            })
            .sort((a: any, b: any) => a?.full_name?.localeCompare(b?.full_name));
        } else {
          this.contractManagerList = [];
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
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

  repopulateContractManagerDropdown() {
    if (this.contractManagerList && this.contractManagerList.length) {
      this.contractManagerList = this.contractManagerList
        ?.map((send) => {
          return {
            ...send,
            value: send?.last_name?.toUpperCase() + ' ' + send?.first_name,
            full_name:
              send?.last_name?.toUpperCase() +
              ' ' +
              send?.first_name +
              ' ' +
              (send?.civility && send?.civility === 'neutral' ? '' : this.translate.instant(send?.civility)),
          };
        })
        .sort((a: any, b: any) => a?.full_name?.localeCompare(b?.full_name));
    }
  }
  sendMail(data) {
    console.log('_data', data);
    const admission_financement_ids =
      data.admission_financement_ids && data.admission_financement_ids.length
        ? data.admission_financement_ids.map((list) => list.organization_id && list.organization_id._id)
        : [];
    const company_branch_id =
      data.admission_financement_ids && data.admission_financement_ids.length
        ? data.admission_financement_ids.map((list) => list.company_branch_id && list.company_branch_id._id)
        : [];
    if (data) {
      const mappedData = {
        candidate_id: {
          candidate_admission_status: data?.candidate_id?.candidate_admission_status,
          civility: data?.candidate_id?.civility,
          email: data?.candidate_id?.email,
          emailDefault: data?.candidate_id?.school_mail,
          first_name: data?.candidate_id?.first_name,
          last_name: data?.candidate_id?.last_name,
        },
        financial_supports: data?.candidate_id?.payment_supports,
        admission_financement_ids: admission_financement_ids.length ? _.uniqBy(admission_financement_ids) : [],
        company_branch_id: company_branch_id.length ? _.uniqBy(company_branch_id) : [],
      };
      this.subs.sink = this.dialog
        .open(InternshipEmailDialogComponent, {
          width: '600px',
          minHeight: '100px',
          disableClose: true,
          data: mappedData,
        })
        .afterClosed()
        .subscribe((resp) => {
          if (!this.isReset && resp) {
            this.getContractData('send email');
          }
        });
    }
  }

  intakeChannel(data) {
    let intakeChannel = '';
    if (
      data &&
      data.candidate_id &&
      data.candidate_id.intake_channel &&
      data.candidate_id.scholar_season &&
      data.candidate_id.intake_channel.program &&
      data.candidate_id.scholar_season.scholar_season
    ) {
      intakeChannel = data.candidate_id.scholar_season.scholar_season.concat(' ', data.candidate_id.intake_channel.program);
      return intakeChannel;
    } else {
      return '';
    }
  }

  getContractPDF(data) {
    if (data) {
      this.isLoading = true;
      const formBuilderId = data?.form_builder_id?._id;
      let formProcessStepId;
      if(data?.steps?.length) {
        const stepContract = data?.steps?.filter((step) => step?.step_type === 'step_with_signing_process');
        if (stepContract?.length){
          formProcessStepId = stepContract[0]._id;
        }
      }
      if (formBuilderId && formProcessStepId) {
        this.subs.sink = this.candidatesService.generateContractPDF(formBuilderId, formProcessStepId, false).subscribe(
          (contract: any) => {
            if (contract) {
              if (data) {
                const link = document.createElement('a');
                link.setAttribute('type', 'hidden');
                link.href = `${environment.apiUrl}/fileuploads/${contract}`.replace('/graphql', '');
                link.target = '_blank';
                link.click();
                link.remove();
              }
            }
            this.isLoading = false;
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
              this.authService.handlerSessionExpired();
              return;
            }
            Swal.fire({
              type: 'error',
              title: 'Error',
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      }
    }
  }

  getTemplatePDF(data) {
    if (data && data.form_builder_id) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.teacherContractService.getContractTemplateTextTab(data.form_builder_id._id).subscribe(
        (resp) => {
          if (resp && resp._id) {
            const preview = false;
            const formId = data._id;
            this.subs.sink = this.teacherContractService.generateContractTemplatePDFfC(resp._id, preview, formId).subscribe(
              (respn) => {
                this.isWaitingForResponse = false;
                console.log('getPDF>>', respn);
                if (respn) {
                  const link = document.createElement('a');
                  link.setAttribute('type', 'hidden');
                  link.href = `${environment.apiUrl}/fileuploads/${respn}`.replace('/graphql', '');
                  link.target = '_blank';
                  link.click();
                  link.remove();
                }
              },
              (err) => {
                this.isWaitingForResponse = false;
                this.authService.postErrorLog(err);
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
        },
        (err) => {
          this.authService.postErrorLog(err);
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

  getTextForSigningProgressStatus(signatories: any[]): string {
    const text = this.translate.instant('in_progress_of_signing');
    const array = [];
    const signatory = signatories.find((signatorys: any) => signatorys && !signatorys.is_already_sign);
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

  displayTooltip(list, forTable?) {
    // console.log('_list tooltip', list);
    const company = this.translate.instant('Company');
    let tooltip = [];
    if (list && list.length > 0) {
      list.forEach((res) => {
        if (res && res.organization_id) {
          tooltip.push(res.organization_id.organization_type);
        } else if (res && res.company_branch_id) {
          tooltip.push(company);
        }
      });
    }

    if (tooltip && tooltip.length > 0) {
      tooltip = _.uniqBy(tooltip);
      tooltip = tooltip.sort((a, b) => a.localeCompare(b));
    }

    if (tooltip && tooltip.length > 0) {
      if (forTable) {
        return tooltip;
      } else {
        return tooltip.toString();
      }
    } else {
      return '';
    }
  }

  viewCandidateInfo(candidateId, tab?) {
    const query = {
      selectedCandidate: candidateId,
      sortValue: JSON.stringify(this.sortValue) || '',
      tab: tab || '',
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

  sendReminder(contractProcessId) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.SendEmailFcContractProcess(contractProcessId, this.translate.currentLang).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
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

  applySuperFilter() {
    this.filteredValues = {
      ...this.filteredValues,
      scholar_season: this.superFilter.scholar_season,
      school: this.superFilter.school,
      campus: this.superFilter.campus,
      level: this.superFilter.level,
      tags: this.superFilter.tags,
    };

    this.paginator.firstPage();
    this.isDisabled = true;
    this.getContractData('superFilter');
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
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.superFilter, this.filteredValues);
    if (filterItem.type === 'super_filter') {
      this.filteredValues[filterItem.name] = null;
      if (filterItem.name === 'scholar_season') {
        this.removeSuperFilter(['school', 'campus', 'level']);
        const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
        this.getDataForList(scholarSeason);
      } else if (filterItem.name === 'school') {
        this.removeSuperFilter(['campus', 'level']);
        this.getDataCampus();
      } else if (filterItem.name === 'campus') {
        this.removeSuperFilter(['level']);
        this.getDataLevel();
      }
      this.paginator.firstPage();
      this.isDisabled = true;
    }
    if (filterItem?.name === 'contract_manager') {
      // this.contractManagerFilter.setValue('All', { emitEvent: false });
      this.filteredValues.contract_manager = null;
      this.breadcrumbData.contract_manager = null;
    }
    this.clearSelectIfFilter();
    this.getContractData('resetData');
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'scholar_season', // name of the key in the object storing the filter
        column: 'CARDDETAIL.Scholar Season', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.superFilter, // the object holding the filter value (e.g. filteredValues | superFilter)
        filterList: this.scholars, // the array/list holding the dropdown options
        filterRef: this.scholarFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'scholar_season', // the key displayed in the html (only applicable to array of objects)
        savedValue: '_id', // the value saved when user select an option (e.g. _id)
        resetValue: 'All',
      },
      {
        type: 'super_filter',
        name: 'school',
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
        name: 'campus',
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
        name: 'level',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level',
        isMultiple: this.levelFilter?.value?.length === this.levels?.length ? false : true,
        filterValue:  this.levelFilter?.value?.length === this.levels?.length ? this.filteredValuesAll : this.superFilter,
        filterList:  this.levelFilter?.value?.length === this.levels?.length ? null : this.levels,
        filterRef: this.levelFilter,
        displayKey:  this.levelFilter?.value?.length === this.levels?.length ? null : 'name',
        savedValue:  this.levelFilter?.value?.length === this.levels?.length ? null : '_id',
        isSelectionInput:  this.levelFilter?.value?.length === this.levels?.length ? false : true,
      },

      //  Table Filter Below ....
      {
        type: 'table_filter',
        name: 'student_unique_number',
        column: 'CONTRACT/CONVENTION.Student number',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.studentNumberFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'student_name',
        column: 'CONTRACT/CONVENTION.Name',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.nameFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'program',
        column: 'CONTRACT/CONVENTION.Program',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.programFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'template_names',
        column: 'CONTRACT/CONVENTION.Template name',
        isMultiple: this.templateNameFilter?.value?.length === this.templateNameList?.length ? false : true,
        filterValue: this.templateNameFilter?.value?.length === this.templateNameList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.templateNameFilter?.value?.length === this.templateNameList?.length ? null : this.templateNameList,
        filterRef: this.templateNameFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: this.templateNameFilter?.value?.length === this.templateNameList?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'financer',
        column: 'CONTRACT/CONVENTION.Financier',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.financierList,
        filterRef: this.financierFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: true,
      },
      {
        type: 'table_filter',
        name: 'type_of_financement',
        column: 'CONTRACT/CONVENTION.Type of financement',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.typeOfFinancementList,
        filterRef: this.typeOfFinancementFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: true,
      },
      {
        type: 'table_filter',
        name: 'start_date',
        column: 'CONTRACT/CONVENTION.Start date',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.startDateFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'end_date',
        column: 'CONTRACT/CONVENTION.End date',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.endDateFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'contract_manager',
        column: 'CONTRACT/CONVENTION.Contract Manager',
        isMultiple: this.contractManagerFilter?.value?.length === this.contractManagerList?.length ? false : true,
        filterValue: this.contractManagerFilter?.value?.length === this.contractManagerList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.contractManagerFilter?.value?.length === this.contractManagerList?.length ? null : this.contractManagerList,
        filterRef: this.contractManagerFilter,
        displayKey: this.contractManagerFilter?.value?.length === this.contractManagerList?.length ? null : 'full_name',
        savedValue: this.contractManagerFilter?.value?.length === this.contractManagerList?.length ? null : 'value',
        isSelectionInput: this.contractManagerFilter?.value?.length === this.contractManagerList?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'send_at',
        column: 'CONTRACT/CONVENTION.Send date',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.sendDateFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'contract_status',
        column: 'CONTRACT/CONVENTION.Status',
        isMultiple: this.statusFilter?.value?.length === this.statusList?.length ? false : true,
        filterValue: this.statusFilter?.value?.length === this.statusList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.statusFilter?.value?.length === this.statusList?.length ? null : this.statusList,
        filterRef: this.statusFilter,
        displayKey: this.statusFilter?.value?.length === this.statusList?.length ? null : 'key',
        savedValue: this.statusFilter?.value?.length === this.statusList?.length ? null : 'value',
        isSelectionInput: this.statusFilter?.value?.length === this.statusList?.length ? false : true,
      },
    ];
    console.log('filterInfo', filterInfo);
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  isAllDropdownSelected(type) {
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
    } else if (type === 'tags') {
      const selected = this.tagFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.tagList.length;
    } else if (type === 'templateName') {
      const selected = this.templateNameFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.templateNameList.length;
      return isAllSelected;
    } else if (type === 'contractManager') {
      const selected = this.contractManagerFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.contractManagerList.length;
      return isAllSelected;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.statusList.length;
      return isAllSelected;
    } else if (type === 'financier') {
      const selected = this.financierFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.financierList.length;
      return isAllSelected;
    } else if (type === 'type_of_financement') {
      const selected = this.typeOfFinancementFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.typeOfFinancementList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
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
    } else if (type === 'tags') {
      const selected = this.tagFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.tagList.length;
    } else if (type === 'templateName') {
      const selected = this.templateNameFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.templateNameList.length;
      return isIndeterminate;
    } else if (type === 'contractManager') {
      const selected = this.contractManagerFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.templateNameList.length;
      return isIndeterminate;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.statusList.length;
      return isIndeterminate;
    } else if (type === 'financier') {
      const selected = this.financierFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.financierList.length;
      return isIndeterminate;
    } else if (type === 'type_of_financement') {
      const selected = this.typeOfFinancementFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.typeOfFinancementList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
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
    } else if (type === 'tags') {
      if (event.checked) {
        const tagsData = this.tagList.map((el) => el._id);
        this.tagFilter.patchValue(tagsData, { emitEvent: false });
      } else {
        this.tagFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'templateName') {
      if (event.checked) {
        const templateData = this.templateNameList.map((el) => el);
        this.templateNameFilter.patchValue(templateData);
      } else {
        this.templateNameFilter.patchValue(null);
      }
    } else if (type === 'contractManager') {
      if (event.checked) {
        const templateData = this.contractManagerList.map((el) => el.value);
        this.contractManagerFilter.patchValue(templateData);
      } else {
        this.contractManagerFilter.patchValue(null);
      }
    } else if (type === 'status') {
      if (event.checked) {
        const templateData = this.statusList.map((el) => el.value);
        this.statusFilter.patchValue(templateData);
      } else {
        this.statusFilter.patchValue(null);
      }
    } else if (type === 'financier') {
      if (event.checked) {
        const templateData = this.financierList.map((el) => el);
        this.financierFilter.patchValue(templateData);
      } else {
        this.financierFilter.patchValue(null);
      }
    } else if (type === 'type_of_financement') {
      if (event.checked) {
        const templateData = this.typeOfFinancementList.map((el) => el);
        this.typeOfFinancementFilter.patchValue(templateData);
      } else {
        this.typeOfFinancementFilter.patchValue(null);
      }
    }
  }
  openNote(data){
    this.dialog
    .open(RefuseToSignNoteDialogComponent, {
      minWidth: '650px',
      panelClass: 'certification-rule-pop-up',
      disableClose: true,
      data: data,
    })
  }
}
