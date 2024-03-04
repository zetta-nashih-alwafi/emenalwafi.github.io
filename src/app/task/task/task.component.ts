import { CandidatesService } from './../../service/candidates/candidates.service';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { TaskService } from '../../service/task/task.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { UntypedFormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AddTestTaskDialogComponent } from '../add-test-task-dialog/add-test-task-dialog.component';
import * as moment from 'moment';
import { forkJoin, Observable } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AssignCorrectorDialogComponent } from '../assign-corrector-dialog/assign-corrector-dialog.component';
import { UtilityService } from 'app/service/utility/utility.service';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/service/auth-service/auth.service';
import { ReplyUrgentMessageDialogComponent } from 'app/mailbox/reply-urgent-message-dialog/reply-urgent-message-dialog.component';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { CertificationRuleService } from 'app/service/certification-rule/certification-rule.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { AssignCorrectorProblematicDialogComponent } from 'app/shared/components/assign-corrector-problematic-dialog/assign-corrector-problematic-dialog.component';
import Swal from 'sweetalert2';
import { ManualTaskDialogComponent } from '../manual-task-dialog/manual-task-dialog.component';
import { ValidateProblematicTaskDialogComponent } from 'app/shared/components/validate-problematic-task-dialog/validate-problematic-task-dialog.component';
import { GroupCreationService } from 'app/service/group-creation/group-creation.service';
import { SendCopiesDialogComponent } from '../../shared/send-copies-dialog/send-copies-dialog.component';
import { AddManualTaskDialogComponent } from '../add-manual-task-dialog/add-manual-task-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { FormFillingService } from 'app/form-filling/form-filling.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseLocalToUtcPipe],
})
export class TaskComponent implements OnInit, OnDestroy, AfterViewChecked {
  replyUrgentMessageDialogComponent: MatDialogRef<ReplyUrgentMessageDialogComponent>;
  dataSource = new MatTableDataSource([]);
  searchInternalTask = false;

  displayedColumns: string[] = [
    'select',
    'dueDate',
    'taskStatus',
    'createdBy',
    'assigned',
    'priority',
    'createdDate',
    'school',
    'campus',
    'description',
    'Action',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'dueDateFilter',
    'taskStatusFilter',
    'createdByFilter',
    'assignedFilter',
    'priorityFilter',
    'createdDateFilter',
    'schoolFilter',
    'campusFilter',
    'descriptionFilter',
    'ActionFilter',
  ];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  selection = new SelectionModel<any>(true, []);
  userSelected = [];
  userSelectedId = [];
  isCheckedAll = false;
  selectType: any;
  disabledButtonAction = false;
  private subs = new SubSink();
  taskDialogComponent: MatDialogRef<AddManualTaskDialogComponent>;
  taskManualDialogComponent: MatDialogRef<ManualTaskDialogComponent>;
  testTaskDialogComponent: MatDialogRef<AddTestTaskDialogComponent>;
  selectedRncpTitleLongName: any;
  selectedRncpTitleName: any;
  configCertificatioRule: MatDialogConfig = {
    disableClose: true,
  };
  config: MatDialogConfig = {
    autoFocus: false,
    disableClose: true,
    width: '600px',
  };
  taskDetails = [];
  noData: any;
  createdDateArray = [];
  rncpTitleArray = [];
  filteredRncpTitle: Observable<string[]>;
  dueDateFilter = new UntypedFormControl('');
  taskStatusFilter = new UntypedFormControl(null);
  createdByFilter = new UntypedFormControl();
  assignedFilter = new UntypedFormControl();
  priorityFilter = new UntypedFormControl(null);
  createdDateFilter = new UntypedFormControl('');
  schoolFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);

  rncpFilter = new UntypedFormControl('');
  subjectFilter = new UntypedFormControl();
  descriptionFilter = new UntypedFormControl(null);
  currentUser: any;

  isWaitingForResponse = false;
  isWaitingForResponseTask = false;
  isReset = false;

  pagination = {
    limit: 10,
    page: 0,
  };

  filterValues = {
    test_id: '',
    is_not_parent_task: true,
    task_statuses: [],
    from: '',
    to: '',
    rncp_title: '',
    priorities: null,
    due_date: {
      date: '',
      time: '',
    },
    created_at: {
      date: '',
      time: '',
    },
    // subject_test: '',
    descriptions: null,
    school_ids: null,
    campuses: null,
    offset: null,
  };

  filteredValuesAll = {
    task_statuses: 'All',
    priorities: 'All',
    descriptions: 'All',
    school_ids: 'All',
    campuses: 'All',
  };

  sortingValues = {
    due_date: 'desc',
    status: '',
    from: '',
    to: '',
    priority: '',
    created_at: '',
    school: '',
  };

  tempDataFilter = {
    task_status: null,
    priority: null,
    campus: null,
    school: null,
    description: null,
  };

  filteredSchool: Observable<any[]>;
  filterSchoolList = [];

  filteredCampus: Observable<any[]>;
  filterCampusList = [];

  filteredTitle: Observable<any[]>;
  filterTitleList = [];

  filteredTaskType: Observable<any[]>;
  taskTypeList = [];

  private intVal: any;
  private timeOutVal: any;

  /*
    Variable from param, used by notif url
  */
  taskId = '';
  CurUser: any;
  isEditable = true;
  accessInternal = true;
  isAcadDir = false;
  isOperator = false;
  allStudentForCheckbox = [];
  dataSelected = [];
  pageSelected = [];
  disabledExport = true;

  dataUnselectUser = [];
  buttonClicked = '';
  priorityList = [
    {
      label: '1',
      value: 1,
    },
    {
      label: '2',
      value: 2,
    },
    {
      label: '3',
      value: 3,
    },
  ];
  statusListUnmap = [
    {
      label: 'ToDo',
      value: 'todo',
    },
    {
      label: 'Done',
      value: 'done',
    },
  ];
  statusList = [];
  filterBreadcrumbData: FilterBreadCrumbItem[] = [];

  constructor(
    private taskService: TaskService,
    private datepipe: DatePipe,
    public dialog: MatDialog,
    private parseUTCtoLocal: ParseUtcToLocalPipe,
    private translate: TranslateService,
    private utilService: UtilityService,
    private parseLocalToUTCPipe: ParseLocalToUtcPipe,
    private rncpTitlesService: RNCPTitlesService,
    private cdref: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private mailboxService: MailboxService,
    private permissions: NgxPermissionsService,
    private certificationRuleService: CertificationRuleService,
    public permissionService: PermissionService,
    private dateAdapter: DateAdapter<Date>,
    private groupCreationService: GroupCreationService,
    private candidateService: CandidatesService,
    private formFillingService: FormFillingService,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService,
  ) {}

  ngOnInit() {
    this.dateAdapter.setLocale(this.translate.currentLang);
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.dateAdapter.setLocale(this.translate.currentLang);
      this.mappingList();
      this.getEnumTaskTypeDropdownList();
    });
    this.isAcadDir = !!this.permissions.getPermission('Academic Director');
    this.isOperator = !!this.permissions.getPermission('Operator Director') ? true : !!this.permissions.getPermission('Operator Admin');
    this.fromNotifURL();
    this.CurUser = this.authService.getLocalStorageUser();
    this.currentUser = this.utilService.getCurrentUserType();
    this.userTypeChecking();

    this.getSchoolList();
    this.getTitleList();
    this.getEnumTaskTypeDropdownList();
    this.getMyTask();
    this.filterListener();
    this.mappingList();
    if (!!this.permissions.getPermission('Student')) {
      this.getCertificationRule();
    } else {
      this.getUrgentMail();
    }
    this.pageTitleService.setTitle('List of tasks');
    this.filterBreadcrumbFormat();
  }

  ngAfterViewChecked() {
    this.cdref.detectChanges();
  }

  mappingList() {
    this.statusList = this.statusListUnmap.map((item) => {
      return {
        value: item.value,
        label: this.translate.instant(item.label),
      };
    });
  }

  fromNotifURL() {
    this.subs.sink = this.route.queryParamMap.subscribe((queryParams) => {
      this.taskId = queryParams.get('task');

      if (this.taskId) {
        this.taskService.getOneTask(this.taskId).subscribe((response) => {
          if (response && response.task_status && response.task_status === 'todo') {
            this.openTask(response);
          } else if (response && response.task_status && response.task_status === 'done') {
            this.editTask(response);
          }
        });
      }
    });
  }

  getSchoolList() {
    this.subs.sink = this.taskService.getAllSchool().subscribe(
      (resp) => {
        this.filterSchoolList = resp;
        // this.filteredSchool = this.schoolFilter.valueChanges.pipe(
        //   startWith(''),
        //   map((search) => this.filterSchoolList.filter((option) => option.short_name.toLowerCase().includes(search.toLowerCase()))),
        // );
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

  getCampusList() {
    this.filterCampusList = [];
    this.campusFilter.setValue(null);
    this.filterValues.campuses = null;
    this.tempDataFilter.campus = null;
    let selectedSchoolShortName;
    if (this.schoolFilter.value) {
      selectedSchoolShortName = this.schoolFilter.value.map((schoolId) => {
        const schoolFound = this.filterSchoolList.find((schoolData) => schoolData?._id === schoolId);
        if (schoolFound) {
          return schoolFound?.short_name;
        }
      });
    } else {
      selectedSchoolShortName = null;
    }
    this.subs.sink = this.candidateService.GetDataSchoolCampusByShortNames(selectedSchoolShortName).subscribe(
      (resp) => {
        if (resp && resp.length > 1) {
          const tempFilterCampusData = [];
          resp?.forEach((val) => {
            val?.campuses?.forEach((campus) => {
              tempFilterCampusData.push(campus);
            });
          });
          this.filterCampusList = _.uniqBy(tempFilterCampusData, 'name');
        } else {
          this.filterCampusList = resp[0].campuses;
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

  renderTooltipCampuses(campuses: { name: string; _id: string }[]): string {
    let tooltip = '';
    if (campuses && campuses.length) {
      for (let i = 0; i < campuses.length; i++) {
        tooltip = tooltip + campuses[i].name + `, `;
      }
      return tooltip.substring(0, tooltip.length - 2);
    } else {
      return tooltip;
    }
  }

  getTitleList() {
    if (this.utilService.isUserEntityOPERATOR()) {
      this.subs.sink = this.taskService.GetADMTCTitleDropdownList().subscribe(
        (resp) => {
          this.filterTitleList = resp;
          this.filteredTitle = this.rncpFilter.valueChanges.pipe(
            startWith(''),
            map((searchTxt) => this.filterTitleList.filter((option) => option.short_name.toLowerCase().includes(searchTxt.toLowerCase()))),
          );
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
          }
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    } else {
      const userType = this.CurUser?.entities && this.CurUser?.entities?.length ? this.CurUser?.entities[0].type.name : '';
      this.subs.sink = this.authService.getUserById(this.CurUser?._id).subscribe(
        (res) => {
          const dataUSer = res?.entities?.filter((ent) => ent?.type?.name === userType);
          this.filterTitleList = this.utilService.getAllAssignedTitles(dataUSer);
          this.filteredTitle = this.rncpFilter.valueChanges.pipe(
            startWith(''),
            map((searchTxt) => this.filterTitleList.filter((option) => option.short_name.toLowerCase().includes(searchTxt.toLowerCase()))),
          );
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

  getEnumTaskTypeDropdownList() {
    this.taskTypeList = this.rncpTitlesService.getEnumTaskTypeEdh().map((taskType) => {
      return {
        name: taskType.name,
        label: this.translate.instant('PENDING_TASK_TYPE.' + taskType.name),
        value: taskType.value,
      };
    });
    // this.filteredTaskType = this.descriptionFilter.valueChanges.pipe(
    //   startWith(''),
    //   map((searchTxt) => this.taskTypeList.filter((option) => option.name.toLowerCase().includes(searchTxt.toLowerCase()))),
    // );
  }

  getMyTask() {
    this.pagination = {
      limit: 10,
      page: this.paginator.pageIndex,
    };

    const params =
      this.filterValues.due_date.date ||
      this.filterValues.due_date.time ||
      this.filterValues.created_at.date ||
      this.filterValues.created_at.time;
    this.filterValues.offset = params ? moment().utcOffset() : null;
    const sorting = this.cleanSortingPayload();
    const filter = this.cleanFilterPayload();
    this.isWaitingForResponse = true;
    this.isReset = false;
    this.taskService.getMyTask(this.pagination, sorting, filter, this.currentUser).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.dataSource.data = resp;
        if (resp && resp.length) {
          this.paginator.length = resp[0].count_document ? resp[0].count_document : 0;
        } else {
          this.paginator.length = 0;
        }
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
        // if (this.isCheckedAll) {
        //   this.dataSource.data.forEach((row) => this.selection.select(row));
        // }
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
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
        this.swalError(err);
      },
    );
  }

  changePage(event: any) {
    this.getMyTask();
  }

  sortData(sort: Sort) {
    this.sortingValues = {
      due_date: '',
      status: '',
      from: '',
      to: '',
      priority: '',
      created_at: '',
      school: '',
    };
    if (sort.active === 'dueDate' && sort.direction) {
      this.sortingValues.due_date = `${sort.direction}`;
    } else if (sort.active === 'taskStatus' && sort.direction) {
      this.sortingValues.status = `${sort.direction}`;
    } else if (sort.active === 'createdBy' && sort.direction) {
      this.sortingValues.from = `${sort.direction}`;
    } else if (sort.active === 'assigned' && sort.direction) {
      this.sortingValues.to = `${sort.direction}`;
    } else if (sort.active === 'priority' && sort.direction) {
      this.sortingValues.priority = `${sort.direction}`;
    } else if (sort.active === 'createdDate' && sort.direction) {
      this.sortingValues.created_at = `${sort.direction}`;
    } else if (sort.active === 'school' && sort.direction) {
      this.sortingValues.school = `${sort.direction}`;
    } else {
      this.sortingValues.due_date = 'desc';
    }
    this.clearSelectifFilter();
    this.paginator.pageIndex = 0;
    this.getMyTask();
  }

  filterListener() {
    // this.subs.sink = this.taskStatusFilter.valueChanges.pipe(debounceTime(800)).subscribe((task_status) => {
    //   this.filterValues.task_statuses = task_status;
    //   // this.clearSelectifFilter();
    //   this.paginator.pageIndex = 0;
    //   this.getMyTask();
    // });

    this.subs.sink = this.dueDateFilter.valueChanges.subscribe((dueDate) => {
      if (dueDate) {
        const tempDate = moment(dueDate).format('DD/MM/YYYY');
        const newDate = this.parseLocalToUTCPipe.transformDate(tempDate, '15:59');
        const newTime = this.parseLocalToUTCPipe.transform('15:59');
        this.filterValues.due_date.date = newDate;
        this.filterValues.due_date.time = newTime;
        this.filterValues.due_date.date = this.filterValues.due_date.date !== 'Invalid date' ? this.filterValues.due_date.date : '';
        this.filterValues.due_date.time = this.filterValues.due_date.date ? this.filterValues.due_date.time : '';
        // this.clearSelectifFilter();
        this.paginator.pageIndex = 0;
        this.getMyTask();
      }
    });

    this.subs.sink = this.createdDateFilter.valueChanges.subscribe((createdDate) => {
      if (createdDate) {
        const tempDate = moment(createdDate).format('DD/MM/YYYY');
        const newDate = this.parseLocalToUTCPipe.transformDate(tempDate, '15:59');
        const newTime = this.parseLocalToUTCPipe.transform('15:59');
        this.filterValues.created_at.date = newDate;
        this.filterValues.created_at.time = newTime;
        this.filterValues.created_at.date = this.filterValues.created_at.date !== 'Invalid date' ? this.filterValues.created_at.date : '';
        this.filterValues.created_at.time = this.filterValues.created_at.date ? this.filterValues.created_at.time : '';
        // this.clearSelectifFilter();
        this.paginator.pageIndex = 0;
        this.getMyTask();
      }
    });

    // this.subs.sink = this.priorityFilter.valueChanges.pipe(debounceTime(800)).subscribe((priority) => {
    //   if (priority && typeof priority === 'string') {
    //     priority = parseInt(priority, 10);
    //   }
    //   this.filterValues.priority = priority;
    //   // this.clearSelectifFilter();
    //   this.paginator.pageIndex = 0;
    //   this.getMyTask();
    // });

    this.subs.sink = this.createdByFilter.valueChanges.pipe(debounceTime(800)).subscribe((from) => {
      this.filterValues.from = from;
      // this.clearSelectifFilter();
      this.paginator.pageIndex = 0;
      this.getMyTask();
    });

    this.subs.sink = this.assignedFilter.valueChanges.pipe(debounceTime(800)).subscribe((to) => {
      this.filterValues.to = to;
      // this.clearSelectifFilter();
      this.paginator.pageIndex = 0;
      this.getMyTask();
    });
  }

  // setSchoolFilter(schoolId: string) {
  //   this.campusFilter.patchValue('', { emitEvent: false });
  //   this.filterValues.campus = '';

  //   this.filterValues['school_id'] = schoolId;
  //   this.getCampusList();
  //   // this.clearSelectifFilter();
  //   this.paginator.pageIndex = 0;
  //   this.getMyTask();
  // }

  setSchoolFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.school) === JSON.stringify(this.schoolFilter.value);
    if (isSame) {
      return;
    } else if (this.schoolFilter.value?.length) {
      this.filterValues.school_ids = this.schoolFilter.value;
      this.tempDataFilter.school = this.schoolFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getCampusList();
        this.getMyTask();
      }
    } else {
      if (this.tempDataFilter.school?.length && !this.schoolFilter.value?.length) {
        this.filterValues.school_ids = this.schoolFilter.value;
        this.tempDataFilter.school = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getCampusList();
          this.getMyTask();
        }
      } else {
        return;
      }
    }
  }

  // setCampusFilter(campus: string) {
  //   this.filterValues['campus'] = campus;
  //   // this.clearSelectifFilter();
  //   this.paginator.pageIndex = 0;
  //   this.getMyTask();
  // }

  setCampusFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.campus) === JSON.stringify(this.campusFilter.value);
    if (isSame) {
      return;
    } else if (this.campusFilter.value?.length) {
      this.filterValues.campuses = this.campusFilter.value;
      this.tempDataFilter.campus = this.campusFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getMyTask();
      }
    } else {
      if (this.tempDataFilter.campus?.length && !this.campusFilter.value?.length) {
        this.filterValues.campuses = this.campusFilter.value;
        this.tempDataFilter.campus = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getMyTask();
        }
      } else {
        return;
      }
    }
  }

  setTitleFilter(titleId: string) {
    this.filterValues['rncp_title'] = titleId;
    // this.clearSelectifFilter();
    this.paginator.pageIndex = 0;
    this.getMyTask();
  }

  // setTaskTypeFilter(task_type: string) {
  //   this.filterValues['description'] = task_type;
  //   // this.clearSelectifFilter();
  //   this.paginator.pageIndex = 0;
  //   this.getMyTask();
  // }

  setTaskTypeFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.description) === JSON.stringify(this.descriptionFilter.value);
    if (isSame) {
      return;
    } else if (this.descriptionFilter.value?.length) {
      this.filterValues.descriptions = this.descriptionFilter.value;
      this.tempDataFilter.description = this.descriptionFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getMyTask();
      }
    } else {
      if (this.tempDataFilter.description?.length && !this.descriptionFilter.value?.length) {
        this.filterValues.descriptions = this.descriptionFilter.value;
        this.tempDataFilter.description = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getMyTask();
        }
      } else {
        return;
      }
    }
  }

  clearSelectifFilter() {
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
  }

  cleanFilterPayload() {
    const payloadFilter = _.cloneDeep(this.filterValues);
    if (payloadFilter) {
      if (!payloadFilter.test_id) {
        delete payloadFilter.test_id;
      }
      if (!payloadFilter.task_statuses || !payloadFilter.task_statuses?.length) {
        delete payloadFilter.task_status;
      }
      if (!payloadFilter.from) {
        delete payloadFilter.from;
      }
      if (!payloadFilter.to) {
        delete payloadFilter.to;
      }
      if (!payloadFilter.rncp_title) {
        delete payloadFilter.rncp_title;
      }
      if (!payloadFilter.priorities || !payloadFilter.priorities?.length) {
        delete payloadFilter.priorities;
      }
      if (!payloadFilter.school_ids || !payloadFilter.school_ids?.length) {
        delete payloadFilter.school_ids;
      }
      if (!payloadFilter.campuses || !payloadFilter.campuses?.length) {
        delete payloadFilter.campuses;
      }
      if (!payloadFilter.descriptions || !payloadFilter.descriptions?.length) {
        delete payloadFilter.descriptions;
      }
      if (payloadFilter.due_date && (!payloadFilter.due_date.date || !payloadFilter.due_date.time)) {
        delete payloadFilter.due_date;
      }
      if (payloadFilter.created_at && (!payloadFilter.created_at.date || !payloadFilter.created_at.time)) {
        delete payloadFilter.created_at;
      }
      if (!payloadFilter.offset) {
        delete payloadFilter.offset;
      }

      // check if entity is academic and its not chief group academic then will pass schoolId
      const user = this.utilService.getCurrentUser();
      if (
        user &&
        user.entities &&
        user.entities[0] &&
        user.entities[0].school_type === 'preparation_center' &&
        user.entities[0].school &&
        user.entities[0].school?._id
      ) {
        payloadFilter.school_id = user.entities[0].school?._id;
      }
      if (!payloadFilter.school_id) {
        delete payloadFilter.school_id;
      }
    }
    return payloadFilter;
  }

  cleanSortingPayload() {
    const payloadSorting = _.cloneDeep(this.sortingValues);
    if (payloadSorting) {
      if (!payloadSorting.due_date) {
        delete payloadSorting.due_date;
      }
      if (!payloadSorting.status) {
        delete payloadSorting.status;
      }
      if (!payloadSorting.from) {
        delete payloadSorting.from;
      }
      if (!payloadSorting.to) {
        delete payloadSorting.to;
      }
      if (!payloadSorting.priority) {
        delete payloadSorting.priority;
      }
      if (!payloadSorting.created_at) {
        delete payloadSorting.created_at;
      }
      if (!payloadSorting.school) {
        delete payloadSorting.school;
      }
    }
    return payloadSorting;
  }

  translateDate(date) {
    const value = date;
    if (date && typeof date === 'object' && date.time && date.date) {
      return this.parseUTCtoLocal.transformDate(date.date, date.time);
    } else {
      return '';
    }
  }

  reset() {
    this.isReset = true;
    this.selection.clear();
    this.dataSelected = [];
    this.dataUnselectUser = [];
    this.isCheckedAll = false;
    this.pagination = {
      limit: 10,
      page: 0,
    };

    this.filterValues = {
      test_id: '',
      is_not_parent_task: true,
      task_statuses: [],
      from: '',
      to: '',
      priorities: null,
      rncp_title: '',
      due_date: {
        date: '',
        time: '',
      },
      created_at: {
        date: '',
        time: '',
      },
      // subject_test: '',
      descriptions: null,
      school_ids: null,
      campuses: null,
      offset: null,
    };

    this.sortingValues = {
      due_date: 'desc',
      status: '',
      from: '',
      to: '',
      priority: '',
      created_at: '',
      school: '',
    };

    this.tempDataFilter = {
      task_status: null,
      priority: null,
      campus: null,
      school: null,
      description: null,
    };

    this.filterBreadcrumbData = [];
    this.dueDateFilter.patchValue('', { emitEvent: false });
    this.taskStatusFilter.patchValue(null, { emitEvent: false });
    this.createdByFilter.patchValue('', { emitEvent: false });
    this.assignedFilter.patchValue('', { emitEvent: false });
    this.priorityFilter.patchValue(null, { emitEvent: false });
    this.createdDateFilter.patchValue('', { emitEvent: false });
    this.schoolFilter.patchValue(null, { emitEvent: false });
    this.campusFilter.patchValue(null, { emitEvent: false });
    this.getCampusList();
    this.getSchoolList();
    // this.rncpFilter.patchValue('');
    // this.subjectFilter.patchValue('', { emitEvent: false });
    this.descriptionFilter.patchValue(null, { emitEvent: false });

    // reset the sorting arrow
    this.sort.sort({ id: null, start: 'desc', disableClear: false });
    this.getMyTask();
    this.getEnumTaskTypeDropdownList();
  }

  // This function copied from v1
  getTranslateWhat(name, task?: any) {
    if (task) {
      const templateType =
        task.form_process_id && task.form_process_id.form_builder_id && task.form_process_id.form_builder_id.template_type
          ? task.form_process_id.form_builder_id.template_type
          : '';

      if (task.type.toLowerCase() === 'employability_survey_for_student') {
        const dateString = this.translateDate(task.due_date);

        // const dueDate = new Date(task.dueDate.date);
        // const dateString = dueDate.getDate() + '/' + (dueDate.getMonth() + 1) + '/' + dueDate.getFullYear();
        if (this.translate.currentLang.toLowerCase() === 'en') {
          return 'Employability Survey to complete before ' + dateString;
        } else {
          return "Enquête d'employabilité à completer avant le " + dateString;
        }
      } else if (task.type === 'certifier_validation') {
        if (this.translate.currentLang === 'en') {
          return `${'Validate the test correction'} - ${task.school ? task.school.short_name : ''}`;
        } else {
          return `${'Valider la correction'} - ${task.school ? task.school.short_name : ''}`;
        }
      } else if (
        task.type.toLowerCase() === 'operator_jury_decision' ||
        task.type === 'retake_assign_corrector' ||
        task.type === 'validate_test_correction_for_final_retake' ||
        task.type === 'final_retake_marks_entry'
      ) {
        let value = this.translate.instant('TEST.AUTOTASK.' + name.toUpperCase());
        value = value !== 'TEST.AUTOTASK.' + name.toUpperCase() ? value : name;
        if (task.classId) {
          value = value + ' - ' + task.classId.name + ' - ' + task.school.short_name;
        } else {
          value = value + ' - ' + task.school.short_name;
        }
        return value;
      } else if (task.type === 'student_upload_grand_oral_cv' || task.type === 'student_upload_grand_oral_presentation') {
        const value = this.translate.instant(task.description);
        return value;
      } else if (
        task.type === 'online_jury_student_attendance_justification' ||
        task.type === 'online_jury_jury_member_attendance_justification'
      ) {
        const value = this.translate.instant(task.description);
        return value;
      } else if (task.type === 'jury_organization_marks_entry') {
        return `${this.translate.instant('Mark Entry')} - ${
          task && task.student_id && task.student_id.last_name ? task.student_id.last_name : ''
        } ${task && task.student_id && task.student_id.first_name ? task.student_id.first_name : ''} ${
          task && task.student_id && task.student_id.civility && task.student_id.civility !== 'neutral'
            ? this.translate.instant(task.student_id.civility)
            : ''
        }`;
      } else if (
        task.type === 'document_expected' ||
        task.type === 'reupload_expected_document' ||
        task.type === 'upload_final_retake_document'
      ) {
        if (task.type === 'upload_final_retake_document') {
          return (
            (task.rncp && task.rncp.short_name ? task.rncp.short_name : '') +
            ' - ' +
            this.translate.instant('UPLOAD') +
            ' ' +
            task.description +
            ' ' +
            this.translate.instant('DASHBOARD.EXPECTED_DOC_TASK.FOR_FINAL_RETAKE')
          );
        } else if (task.type === 'document_expected') {
          if (task.for_each_student) {
            return (
              (task.student_id
                ? task.student_id.last_name +
                  ' ' +
                  task.student_id.first_name +
                  ' ' +
                  (task.student_id.civility !== 'neutral' ? this.translate.instant(task.student_id.civility) : '')
                : '') +
              ' ' +
              (task && task.test_group_id ? task.test_group_id.name : '') +
              ' ' +
              this.translate.instant('UPLOAD') +
              ' ' +
              task.description

              // this.translate.instant('UPLOAD') +
              // ' ' +
              // task.description +
              // ' for ' +
              // (task.student_id ? task.student_id.last_name + ' ' + task.student_id.first_name + ' ' + task.student_id.civility : '')
            );
          } else {
            return (
              (task && task.test_group_id ? task.test_group_id.name : '') +
              ' ' +
              this.translate.instant('UPLOAD') +
              ' ' +
              task.description +
              ' / ' +
              (task.test ? task.test.name : '')
            );
          }
        } else {
          return this.translate.instant('UPLOAD') + ' ' + task.description;
        }
      } else if (
        task.type === 'calendar_step' &&
        task.test &&
        task.test.groupTest &&
        task.test.correctionType === 'certifier' &&
        task.description.toLowerCase() === 'assign corrector'
      ) {
        let value = this.translate.instant('TEST.AUTOTASK.' + name.toUpperCase());
        value = value + ' - ' + task.school.short_name;
        return value;
      } else if (task.type === 'assign_president_jury') {
        return `${this.translate.instant('JURY_ORGANIZATION.ASSIGN_PRESIDENT_JURY')} - ${task.description}`;
      } else if (task.type === 'assign_student_for_jury') {
        return `${this.translate.instant('JURY_ORGANIZATION.TASK_ASSIGN_STUDENT_GROUP')} - ${task.jury_id.name} - ${
          task.school.short_name
        }`;
      } else if (task.type === 'student_accept_decision_transcript') {
        return `${this.translate.instant('TRANSCRIPT_PROCESS.student_accept_decision')}`;
      } else if (task.type === 'assign_members_of_final_jury') {
        return `${this.translate.instant('JURY_ORGANIZATION.ASSIGN_MEMBER')} - ${task.jury_id.name}`;
      } else if (task.type === 'create_members_of_final_jury') {
        return `${this.translate.instant('JURY_ORGANIZATION.CREATE_PRESIDENT_JURY')} - ${task.description}`;
      } else if (task.type === 'assign_jury') {
        return `${this.translate.instant('JURY_ORGANIZATION.ASSIGN_JURY')} - ${task.description}`;
      } else if (task.type === 'jury_organization_marks_entry') {
        const dueDate = task.due_date && task.due_date.date ? task.due_date.date : '';
        // const dueDate = this.parseStringDate.transformStringToDate(task.due_date.date);
        // const dateString = dueDate.getDate() + '/' + (dueDate.getMonth() + 1) + '/' + dueDate.getFullYear();
        // const jury_name = task.juryId && task.juryId.name ? task.juryId.name : '';
        const school_name = task.school && task.school.short_name ? task.school.short_name : '';
        return `${dueDate} - ${school_name} - ${this.translate.instant('QUALITY_CONTROL_TABLE.MARK_ENTRY')}`;
      } else if (task.type === 'input_student_decision_for_retake_v2') {
        return `${this.translate.instant('RETAKE_EXAM.RETAKE_TASK_DECISION')}`;
      } else if (task.type === 'assign_corrector_of_problematic') {
        return `${this.translate.instant('PROBLEMATIC_019.assign_corrector_of_problematic')}`;
      } else if (task && task.type === 'validate_problematic_task') {
        if (this.translate.currentLang.toLowerCase() === 'en') {
          let taskDetails = name.split(' : ');
          taskDetails[taskDetails.length - 1] = 'Validate Problematics';
          taskDetails = taskDetails.join(' : ');
          return taskDetails;
        } else {
          let taskDetails = name.split(' : ');
          taskDetails[taskDetails.length - 1] = 'Notes de problématique à valider';
          taskDetails = taskDetails.join(' : ');
          return taskDetails;
        }
      } else if (task && task.type && task.type.toLowerCase() === 'validate_cross_correction') {
        if (task.crossCorrectionFor) {
          return '';
        } else if (name) {
          const value = this.translate.instant('TEST.AUTOTASK.' + name.toUpperCase());
          return value !== 'TEST.AUTOTASK.' + name.toUpperCase() ? value : name;
        }
      } else if (
        task &&
        task.type &&
        (task.type === 'calendar_step' || task.test ? task.test.correction_type === 'certifier' : false) &&
        (name === 'Assign Corrector' || name === 'Marks Entry' || name === 'Validate Test')
      ) {
        if (task.school && task.type) {
          const value =
            this.translate.instant('TEST.AUTOTASK.' + name.replace(/_/g, ' ').toUpperCase()) +
            ' ' +
            this.translate.instant('for') +
            ' ' +
            task.school.short_name;
          return value;
        } else if (name) {
          const value = this.translate.instant('TEST.AUTOTASK.' + name.toUpperCase());
          return value !== 'TEST.AUTOTASK.' + name.toUpperCase() ? value : name;
        }
      } else if (task && task.type && task.type === 'problematic_task') {
        // return `${this.translate.instant('PROBLEMATIC_019.PROBLEMATICFORM.TASK_DESCP_INIT')}: ${name}`;
        return this.translate.instant('PROBLEMATIC_019.PROBLEMATICFORM.problematic_rejected_by_school');
      } else if (name) {
        const value = this.translate.instant('TEST.AUTOTASK.' + name.toUpperCase());
        return value !== 'TEST.AUTOTASK.' + name.toUpperCase() ? value : name;
      } else if (task.type === 'complete_form_process') {
        if (
          templateType === 'fc_contract' ||
          templateType === 'teacher_contract' ||
          templateType === 'alumni' ||
          templateType === 'one_time_form'
        ) {
          return this.translate.instant('complete_form_process');
        } else if (templateType === 'student_admission') {
          return this.translate.instant('163_TASKS.student_complete_admission_process');
        }
      } else if (task.type === 'revision_form_proses') {
        if (
          templateType === 'fc_contract' ||
          templateType === 'teacher_contract' ||
          templateType === 'alumni' ||
          templateType === 'one_time_form'
        ) {
          return this.translate.instant('revision_form_proses');
        } else if (templateType === 'student_admission') {
          return this.translate.instant('163_TASKS.revision_admission_proses');
        }
      } else if (task.type === 'validate_form_process') {
        if (
          templateType === 'fc_contract' ||
          templateType === 'teacher_contract' ||
          templateType === 'alumni' ||
          templateType === 'one_time_form'
        ) {
          return this.translate.instant('validate_form_process');
        } else if (templateType === 'student_admission') {
          const stepName =
            task.student_admission_process_step_id && task.student_admission_process_step_id.step_title
              ? task.student_admission_process_step_id.step_title
              : '';
          return this.translate.instant('163_TASKS.validate_admission_process', { stepName: stepName });
        }
      } else if (task.type === 'final_validate_form_process') {
        if (templateType === 'fc_contract' || templateType === 'teacher_contract' || templateType === 'alumni') {
          return this.translate.instant('final_validate_form_process');
        } else if (templateType === 'student_admission') {
          return this.translate.instant('163_TASKS.final_validate_admission_process');
        }
      } else {
        return '';
      }
    }
  }

  openTask(task: any) {
    if (task && task.task_status && task.task_status === 'todo') {
      if (task && task.description) {
        if (task && task.description === 'Validate Financement') {
          this.viewCandidateInfo(task, 'Student', 'Financement');
        }
      }
      if (task && task.type) {
        if (task.type === 'fc_contract_process') {
          this.goToFCContractForm(task);
        } else if (task.type === 'add_task' || task.type === 'addTask' || task.type === 'internal_task') {
          this.openManualTask(task);
        }
      }
      if (task.type === 'student_confirm_certificate') {
        // when we login as student, redirect him to my file menu, tab "details of certification"
        if (this.utilService.isUserStudent()) {
          this.redirectToMyFileDetailOfCertificationTab();
        }
      }
      if (task.type && task.type === 'validate_contract_process') {
        this.goToForm(task);
      }
      if (task.type && task.type === 'validate_student_admission_process') {
        this.goToFormContinousAdmissionFC(task);
      }
      if (
        task.type === 'complete_form_process' ||
        task.type === 'revision_form_proses' ||
        task.type === 'validate_form_process' ||
        task.type === 'final_validate_form_process'
      ) {
        this.goToAdmissionProcessForm(task);
      }
    }
  }

  redirectToMyFileDetailOfCertificationTab() {
    this.router.navigate(['/my-file'], {
      queryParams: { identity: 'verification' },
    });
  }

  redirectToAssignJury(taskData) {
    const juryId = taskData && taskData.jury_id && taskData.jury_id._id ? taskData.jury_id._id : null;
    if (juryId) {
      this.router.navigate(['jury-organization', juryId, 'organize-juries', 'assign-jury']);
    }
  }

  redirectToAssignStudentTable(taskData) {
    const juryId = taskData && taskData.jury_id && taskData.jury_id._id ? taskData.jury_id._id : null;
    if (juryId) {
      this.router.navigate(['jury-organization', juryId, 'organize-juries', 'assign-student-table']);
    }
  }

  goToForm(taskData) {
    const url = this.router.createUrlTree(['/form-teacher-contract'], {
      queryParams: { formId: taskData.contract_process._id, userId: taskData.user_selection.user_id._id, formType: 'teacher_contract' },
    });
    window.open(url.toString(), '_blank');
  }

  goToFCContractForm(task: any) {
    if (task && task.fc_contract_process_id && task.fc_contract_process_id._id) {
      const url = this.router.createUrlTree(['form-fc-contract'], {
        queryParams: {
          formId: task.fc_contract_process_id._id,
          userId: this.CurUser._id,
          candidateId: task.candidate_id && task.candidate_id._id ? task.candidate_id._id : '',
          formType: 'fc_contract',
          type: 'edit',
        },
      });
      window.open(url.toString(), '_blank');
    }
  }

  goToFormContinousAdmissionFC(taskData) {
    const userTypeId = this.authService.getCurrentUser().entities[0].type._id;

    const url = this.router.createUrlTree(['/form-fill'], {
      queryParams: {
        formId: taskData.admission_process_id._id,
        formType: 'student_admission',
        userId: taskData.user_selection.user_id._id,
        userTypeId: userTypeId,
      },
    });
    window.open(url.toString(), '_blank');
  }

  editTask(task) {
    if (this.selection.selected.length > 1) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', {
          menu: 'task',
        }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
      return;
    }
    if (task && task.task_status && task.task_status === 'done') {
      if (task && task.description) {
        if (task.description === 'Assign Corrector' || task.type === 'retake_assign_corrector') {
          // ************* Check the test progress, only able to edit when there is no mark entry done
          const forkParam = [];
          forkParam.push(this.groupCreationService.CheckIfTestCorrectionMarkExistsForStudentGroupTest(task.test._id, task.school._id));
          // forkParam.push(this.taskService.checkMarkEntryStarted(task.test._id, task.school._id));
          forkParam.push(this.taskService.getTestProgress(task.test._id, task.school._id));
          this.isWaitingForResponseTask = true;
          this.subs.sink = forkJoin(forkParam).subscribe(
            (resp: any[]) => {
              this.isWaitingForResponseTask = false;
              let validation = true;
              if (resp && resp.length) {
                const GetAllTestCorrections = resp[0];
                const GetTestProgress = resp[1];

                if (GetAllTestCorrections) {
                  validation = false;
                }

                if (GetTestProgress && GetTestProgress.mark_entry_done && GetTestProgress.mark_entry_done.length) {
                  validation = false;
                }
              }
              if (validation) {
                this.openAssignCorrectorDialog(task, true);
              } else {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('TEST.CHANGE_S1.title'),
                  text: this.translate.instant('TEST.CHANGE_S1.text'),
                  confirmButtonText: this.translate.instant('TEST.CHANGE_S1.confirm_btn'),
                });
              }
            },
            (err) => {
              this.authService.postErrorLog(err);
              this.isWaitingForResponseTask = false;
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
              this.swalError(err);
            },
          );
        } else if (task.description === 'Marks Entry' || task.type === 'final_retake_marks_entry') {
          this.goToMarkEntry(task);
        } else if (task.description === 'Validate Test' || task.type === 'validate_test_correction_for_final_retake') {
          this.goToMarkEntry(task);
        } else if (task.description === 'Create Groups') {
          this.goToGroupCreation(task);
        }
        // if (task.description === 'Assign Corrector of Problematic') {
        //   this.openAssignCorrectorOfProblematicDialog(task, true);
        // }
      }
    } else {
      if (task.type === 'add_task' || task.type === 'addTask' || task.type === 'internal_task') {
        this.editManualTask(task);
      }
    }
  }

  showEditTask(task) {
    if (task && task.task_status && task.task_status === 'done') {
      if (task && task.description) {
        if (task.description === 'Assign Corrector' || task.type === 'retake_assign_corrector') {
          return true;
        }
      }
    } else {
      if (task.type === 'add_task' || task.type === 'addTask') {
        return true;
      }
    }

    return false;
  }

  openEmployabilitySurvey(task) {
    this.router.navigate(['/academic/employability-survey', task.school._id, task.student_id._id, task.employability_survey_id._id]);
  }

  goToMarkEntryGrandOral(row) {
    this.router.navigate(['/grand-oral'], {
      queryParams: { juryId: row.jury_id._id, studentId: row.student_id ? row.student_id._id : null },
    });
  }

  openManualTask(task) {
    const dialogRef = this.dialog.open(ManualTaskDialogComponent, {
      width: '600px',
      minHeight: '100px',
      panelClass: 'certification-rule-pop-up',
      disableClose: true,
      data: { taskData: task },
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      this.getMyTask();
    });
  }

  openValidateProblematicDialog(task) {
    const dialogRef = this.dialog.open(ValidateProblematicTaskDialogComponent, {
      width: '500px',
      minHeight: '100px',
      panelClass: 'certification-rule-pop-up',
      disableClose: true,
      data: task,
    });
  }

  goToAdmissionProcessForm(taskData) {
    this.isWaitingForResponseTask = true;
    this.subs.sink = this.formFillingService.getOneTaskForFormFilling(taskData._id).subscribe(
      (result) => {
        this.isWaitingForResponseTask = false;
        if (result) {
          const dataForm = _.cloneDeep(result);
          const domainUrl = this.router.url.split('/')[0];
          const processId = result.form_process_id && result.form_process_id._id ? result.form_process_id._id : null;
          const userId =
            result.user_selection && result.user_selection.user_id && result.user_selection.user_id._id
              ? result.user_selection.user_id._id
              : null;
          let userTypeId = null;
          const taskUserTypeId = result?.user_selection?.user_type_id?._id ? result?.user_selection?.user_type_id?._id : null;
          if(taskUserTypeId && this.CurUser?.app_data?.user_type_id?.length){
            userTypeId = this.CurUser?.app_data?.user_type_id?.find(user => user === taskUserTypeId)
          }
          if(!userTypeId){
            userTypeId = this.authService.getCurrentUser().entities[0].type._id;
          }
          if (processId && userId) {
            if (
              dataForm &&
              dataForm.form_process_id &&
              dataForm.form_process_id.form_builder_id &&
              dataForm.form_process_id.form_builder_id.template_type === 'student_admission'
            ) {
              window.open(
                `${domainUrl}/form-fill?formId=${processId}&formType=student_admission&userId=${userId}&userTypeId=${userTypeId}`,
                '_blank',
              );
            } else if (
              dataForm &&
              dataForm.form_process_id &&
              dataForm.form_process_id.form_builder_id &&
              dataForm.form_process_id.form_builder_id.template_type === 'fc_contract'
            ) {
              const whoCompleteTheForm = result?.form_process_step_id?.user_who_complete_step?._id;
              const actorCompleteForm = dataForm?.user_selection?.user_type_id?._id
                ? dataForm?.user_selection?.user_type_id?._id
                : whoCompleteTheForm;
              window.open(
                `${domainUrl}/form-fill?formId=${processId}&formType=fc_contract&userId=${userId}&userTypeId=${actorCompleteForm}`,
                '_blank',
              );
            } else if (
              dataForm &&
              dataForm.form_process_id &&
              dataForm.form_process_id.form_builder_id &&
              dataForm.form_process_id.form_builder_id.template_type === 'teacher_contract'
            ) {
              window.open(
                `${domainUrl}/form-fill?formId=${processId}&formType=teacher_contract&userId=${userId}&userTypeId=${userTypeId}`,
                '_blank',
              );
            } else if (
              dataForm &&
              dataForm.form_process_id &&
              dataForm.form_process_id.form_builder_id &&
              dataForm.form_process_id.form_builder_id.template_type === 'one_time_form'
            ) {
              window.open(
                `${domainUrl}/form-fill?formId=${processId}&formType=one_time_form&userId=${userId}&userTypeId=${userTypeId}`,
                '_blank',
              );
            } else if (
              dataForm &&
              dataForm.form_process_id &&
              dataForm.form_process_id.form_builder_id &&
              dataForm.form_process_id.form_builder_id.template_type === 'admission_document'
            ) {
              window.open(
                `${domainUrl}/form-fill?formId=${processId}&formType=admissionDocument&userId=${userId}&userTypeId=${userTypeId}`,
                '_blank',
              );
            }
          }
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponseTask = false;
        this.swalError(err);
      },
    );
  }

  editManualTask(task) {
    this.subs.sink = this.dialog
      .open(AddManualTaskDialogComponent, {
        ...this.config,
        data: {
          taskData: task,
          type: 'Edit',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        this.getMyTask();
      });
  }

  openAssignCorrectorDialog(task, isEdit = false) {
    const dialogRef = this.dialog.open(AssignCorrectorDialogComponent, {
      width: '600px',
      minHeight: '100px',
      panelClass: 'certification-rule-pop-up',
      disableClose: true,
      data: {
        edit: isEdit,
        task: task,
        titleId: task.rncp._id,
      },
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 'reset') {
        this.getMyTask();
      }
    });
  }

  openSendCopiesDialog(task) {
    const dialogRef = this.dialog
      .open(SendCopiesDialogComponent, {
        width: '600px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: task,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.getMyTask();
        }
      });
  }

  openAssignCorrectorOfProblematicDialog(task, isEdit = false) {
    const dialogRef = this.dialog.open(AssignCorrectorProblematicDialogComponent, {
      width: '600px',
      minHeight: '100px',
      panelClass: 'certification-rule-pop-up',
      disableClose: true,
      data: {
        edit: isEdit,
        task: task,
      },
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 'reset') {
        this.getMyTask();
      }
    });
  }

  goToMarkEntry(task) {
    this.router.navigate(['/test-correction', task.rncp._id, task.test._id], { queryParams: { task: task._id, school: task.school._id } });
  }

  goToGroupCreation(task) {
    this.router.navigate(['/group-creation', task.rncp._id, task.test._id, task._id]);
  }

  openExpectedDocumentDialog(task) {
    // this.dialog
    //   .open(UploadExpectedDocTaskComponent, {
    //     width: '700px',
    //     disableClose: true,
    //     data: task,
    //     panelClass: 'expected-doc-task',
    //   })
    //   .afterClosed()
    //   .subscribe((result) => {
    //     if (result) {
    //       // refresh acadkit and mytasktable
    //       this.getMyTask();
    //     }
    //   });
  }

  openCvDialog(task) {
    // this.dialog
    //   .open(UploadCvDocTaskComponent, {
    //     width: '700px',
    //     disableClose: true,
    //     data: task,
    //     panelClass: 'expected-doc-task',
    //   })
    //   .afterClosed()
    //   .subscribe((result) => {
    //     if (result) {
    //       // refresh acadkit and mytasktable
    //       this.getMyTask();
    //     }
    //   });
  }

  openPresentationDialog(task) {
    // this.dialog
    //   .open(UploadPresentationDocumentTaskComponent, {
    //     width: '700px',
    //     disableClose: true,
    //     data: task,
    //     panelClass: 'expected-doc-task',
    //   })
    //   .afterClosed()
    //   .subscribe((result) => {
    //     if (result) {
    //       // refresh acadkit and mytasktable
    //       this.getMyTask();
    //     }
    //   });
  }

  openAbsenceJuryDialog(task) {
    // this.dialog
    //   .open(JustifyAbsenceDialogComponent, {
    //     width: '700px',
    //     disableClose: true,
    //     data: task,
    //     panelClass: 'expected-doc-task',
    //   })
    //   .afterClosed()
    //   .subscribe((result) => {
    //     if (result) {
    //       this.getMyTask();
    //     }
    //   });
  }

  addTask() {
    // this.taskDialogComponent = this.dialog.open(AddManualTaskDialogComponent, { ...this.config, data: { taskData: '', type: 'add' } });
    // this.subs.sink = this.taskDialogComponent.afterClosed().subscribe((result) => {
    //   this.getMyTask();
    // });
    this.subs.sink = this.dialog
      .open(AddManualTaskDialogComponent, {
        ...this.config,
        data: {
          taskData: '',
          type: 'Add',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.getMyTask();
        }
      });
  }

  addTestTask() {
    this.testTaskDialogComponent = this.dialog.open(AddTestTaskDialogComponent, this.config);
    this.subs.sink = this.taskDialogComponent.afterClosed().subscribe((result) => {
      this.getMyTask();
    });
  }

  displayTranslatedType(taskType): string {
    if (taskType) {
      const foundTask = _.find(this.taskTypeList, (type) => type?.name === taskType);
      const taskName = foundTask?.name;
      return this.translate.instant('PENDING_TASK_TYPE.' + taskName);
    } else {
      return '';
    }
  }

  getToolTipUser(element) {
    if (element && element.user_selection && element.user_selection.user_id) {
      return (
        element.user_selection.user_id.last_name.toUpperCase() +
        ' ' +
        element.user_selection.user_id.first_name +
        ' ' +
        (element.user_selection.user_id.civility !== 'neutral' ? this.translate.instant(element.user_selection.user_id.civility) + ' ' : '')
      );
    } else if (element && element.user_selection && element.user_selection.user_type_id) {
      return this.translate.instant(element.user_selection.user_type_id.name);
    } else {
      return '';
    }
  }

  userTypeChecking() {
    const entityData = _.filter(this.CurUser?.entities, function (entity) {
      return (
        entity.type.name === 'CR School Director' ||
        entity.type.name === 'Certifier Admin' ||
        entity.type.name === 'Academic Director' ||
        entity.type.name === 'Academic Admin' ||
        entity.type.name === 'Corrector' ||
        entity.type.name === 'Animator Business game' ||
        entity.type.name === 'Cross Corrector' ||
        entity.type.name === 'Teacher'
      );
    });
    if (entityData && entityData.length) {
      this.isEditable = false;
      this.accessInternal = false;
    } else {
      this.isEditable = true;
      this.accessInternal = true;
    }
  }

  getUrgentMail() {
    this.subs.sink = this.mailboxService.getUrgentMail().subscribe(
      (mailList: any[]) => {
        if (mailList && mailList.length) {
          this.subs.sink = this.dialog
            .open(ReplyUrgentMessageDialogComponent, {
              disableClose: true,
              width: '825px',
              panelClass: 'certification-rule-pop-up',
              data: mailList,
            })
            .afterClosed()
            .subscribe((resp) => {
              this.subs.sink = this.mailboxService.getUrgentMail().subscribe(
                (mailUrgent: any[]) => {
                  if (mailUrgent && mailUrgent.length) {
                    this.replyUrgentMessageDialogComponent = this.dialog.open(ReplyUrgentMessageDialogComponent, {
                      disableClose: true,
                      width: '825px',
                      panelClass: 'certification-rule-pop-up',
                      data: mailUrgent,
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
                  }
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('SORRY'),
                    text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                    confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                  });
                },
              );
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

  getCertificationRule() {
    const studentData = this.authService.getLocalStorageUser();
    const titleId = studentData.entities[0].assigned_rncp_title._id;
    const classId = studentData.entities[0].class._id;
    const studentId = studentData._id;
    this.subs.sink = this.rncpTitlesService.getRncpTitleById(titleId).subscribe(
      (resp) => {
        this.selectedRncpTitleName = resp.short_name;
        this.selectedRncpTitleLongName = resp.long_name;
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
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
    this.subs.sink = this.certificationRuleService.getCertificationRuleSentWithStudent(titleId, classId, studentId).subscribe(
      (dataRule: any) => {
        if (dataRule) {
          // this.showCertificationRule(titleId, classId);
        } else {
          this.getUrgentMail();
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

  showCertificationRule(selectedRncpTitleId, selectedClassId) {
    // this.dialog
    //   .open(CertificationRulePopUpComponent, {
    //     panelClass: 'reply-message-pop-up',
    //     ...this.configCertificatioRule,
    //     data: {
    //       callFrom: 'global',
    //       titleId: selectedRncpTitleId,
    //       classId: selectedClassId,
    //       titleName: this.selectedRncpTitleName,
    //       titleLongName: this.selectedRncpTitleLongName,
    //     },
    //   })
    //   .afterClosed()
    //   .subscribe((result) => {
    //     this.getUrgentMail();
    //   });
  }

  validateEditTask(task) {
    let allow = false;
    if (task.task_status !== 'done') {
      if ((task.created_by && task.created_by._id === this.CurUser._id) || this.isOperator) {
        allow = true;
      }
    }
    return allow;
  }

  validateDeleteTask(task) {
    let allow = false;
    if (task.task_status !== 'done') {
      if ((task.created_by && task.created_by._id === this.CurUser._id) || this.isOperator) {
        allow = true;
      }
    }
    return allow;
  }

  deleteTask(task) {
    if (this.selection.selected.length > 1) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', {
          menu: 'task',
        }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
      return;
    }
    if ((task && task.type === 'add_task') || (task && task.type === 'addTask') || (task && task.type === 'internal_task')) {
      let timeDisabled = 6;
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('SWAL_DELETE_TASK.TITLE'),
        html: this.translate.instant('SWAL_DELETE_TASK.TEXT'),
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('SWAL_DELETE_TASK.BUTTON_1', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('SWAL_DELETE_TASK.BUTTON_2'),
        allowOutsideClick: false,
        allowEnterKey: false,
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          this.intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('SWAL_DELETE_TASK.BUTTON_1') + ` (${timeDisabled})`;
          }, 1000);
          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('SWAL_DELETE_TASK.BUTTON_1');
            Swal.enableConfirmButton();
            clearInterval(this.intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      }).then((res) => {
        clearTimeout(this.timeOutVal);
        if (res.value) {
          this.subs.sink = this.taskService.deleteManualTask(task._id).subscribe(
            (resp) => {
              if (resp) {
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('SWAL_DELETE_SUCCESS.TITLE'),
                  text: this.translate.instant('SWAL_DELETE_SUCCESS.TEXT'),
                  confirmButtonText: this.translate.instant('SWAL_DELETE_SUCCESS.BUTTON'),
                }).then((response) => {
                  this.getMyTask();
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
  }

  swalError(err) {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('SORRY'),
      text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
      confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
    });
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
    this.selectType = info;
  }

  // getDataAllForCheckbox(pageNumber) {
  //   const pagination = {
  //     limit: 300,
  //     page: pageNumber,
  //   };
  //   this.isWaitingForResponse = true;
  //   const sorting = this.cleanSortingPayload();
  //   const filter = this.cleanFilterPayload();
  //   this.isWaitingForResponse = true;
  //   this.taskService.getMyTask(pagination, sorting, filter, this.currentUser).subscribe(
  //     (students) => {
  //       if (students && students.length) {
  //         this.allStudentForCheckbox.push(...students);
  //         const page = pageNumber + 1;
  //         this.getDataAllForCheckbox(page);
  //       } else {
  //         this.isWaitingForResponse = false;
  //         if (this.isCheckedAll) {
  //           if (this.allStudentForCheckbox && this.allStudentForCheckbox.length) {
  //             this.allStudentForCheckbox.forEach((element) => {
  //               this.selection.select(element._id);
  //               this.dataSelected.push(element);
  //             });
  //           }
  //           this.pageSelected.push(this.paginator.pageIndex);
  //         } else {
  //           this.pageSelected = [];
  //         }
  //       }
  //     },
  //     (error) => {
  //       this.isWaitingForResponse = false;
  //       Swal.fire({
  //         type: 'info',
  //         title: this.translate.instant('SORRY'),
  //         text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
  //         confirmButtonText: this.translate.instant('OK'),
  //       });
  //     },
  //   );
  // }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.dataUnselectUser = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.isCheckedAll = true;
      this.dataUnselectUser = [];
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  viewCandidateInfo(task, tab?, subTab?) {
    const selectedProgram = task?.candidate_id?.intake_channel?._id
    const query = {
      selectedCandidate: task?.candidate_id?._id,
      tab: tab || '',
      subTab: subTab || '',
      paginator: JSON.stringify({
        pageIndex: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize,
      }),
    };
    if (selectedProgram) {
      query['selectedProgram'] = selectedProgram
    }
    if (tab) {
      const url = this.router.createUrlTree(['candidate-file'], { queryParams: query });
      window.open(url.toString(), '_blank');
    } else {
      // this.router.navigate(['candidate-file'], { queryParams: query });
      const url = this.router.createUrlTree(['candidate-file'], { queryParams: query });
      window.open(url.toString(), '_blank');
    }
  }

  setStatusFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.task_status) === JSON.stringify(this.taskStatusFilter.value);
    if (isSame) {
      return;
    } else if (this.taskStatusFilter.value?.length) {
      this.filterValues.task_statuses = this.taskStatusFilter.value;
      this.tempDataFilter.task_status = this.taskStatusFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getMyTask();
      }
    } else {
      if (this.tempDataFilter.task_status?.length && !this.taskStatusFilter.value?.length) {
        this.filterValues.task_statuses = this.taskStatusFilter.value;
        this.tempDataFilter.task_status = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getMyTask();
        }
      } else {
        return;
      }
    }
  }

  setPriorityFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.priority) === JSON.stringify(this.priorityFilter.value);
    if (isSame) {
      return;
    } else if (this.priorityFilter.value?.length) {
      this.filterValues.priorities = this.priorityFilter.value;
      this.tempDataFilter.priority = this.priorityFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getMyTask();
      }
    } else {
      if (this.tempDataFilter.priority?.length && !this.priorityFilter.value?.length) {
        this.filterValues.priorities = this.priorityFilter.value;
        this.tempDataFilter.priority = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getMyTask();
        }
      } else {
        return;
      }
    }
  }

  isAllDropdownSelectedTable(type) {
    if (type === 'task_statuses') {
      const selected = this.taskStatusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.statusList.length;
      return isAllSelected;
    } else if (type === 'priorities') {
      const selected = this.priorityFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.priorityList.length;
      return isAllSelected;
    } else if (type === 'school_ids') {
      const selected = this.schoolFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.filterSchoolList.length;
      return isAllSelected;
    } else if (type === 'campuses') {
      const selected = this.campusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.filterCampusList.length;
      return isAllSelected;
    } else if (type === 'descriptions') {
      const selected = this.descriptionFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.taskTypeList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelectedTable(type) {
    if (type === 'task_statuses') {
      const selected = this.taskStatusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.statusList.length;
      return isIndeterminate;
    } else if (type === 'priorities') {
      const selected = this.priorityFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.priorityList.length;
      return isIndeterminate;
    } else if (type === 'school_ids') {
      const selected = this.schoolFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.filterSchoolList.length;
      return isIndeterminate;
    } else if (type === 'campuses') {
      const selected = this.campusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.filterCampusList.length;
      return isIndeterminate;
    } else if (type === 'descriptions') {
      const selected = this.descriptionFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.taskTypeList.length;
      return isIndeterminate;
    }
  }

  selectAllDataTable(event, type) {
    if (type === 'task_statuses') {
      if (event.checked) {
        const valuesList = this.statusList.map((el) => el?.value);
        this.taskStatusFilter.patchValue(valuesList, { emitEvent: false });
      } else {
        this.taskStatusFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'priorities') {
      if (event.checked) {
        const valuesList = this.priorityList.map((el) => el?.value);
        this.priorityFilter.patchValue(valuesList, { emitEvent: false });
      } else {
        this.priorityFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'school_ids') {
      if (event.checked) {
        const valuesList = this.filterSchoolList.map((el) => el?._id);
        this.schoolFilter.patchValue(valuesList, { emitEvent: false });
      } else {
        this.schoolFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'campuses') {
      if (event.checked) {
        const valuesList = this.filterCampusList.map((el) => el?.name);
        this.campusFilter.patchValue(valuesList, { emitEvent: false });
      } else {
        this.campusFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'descriptions') {
      if (event.checked) {
        const valuesList = this.taskTypeList.map((el) => el?.name);
        this.descriptionFilter.patchValue(valuesList, { emitEvent: false });
      } else {
        this.descriptionFilter.patchValue(null, { emitEvent: false });
      }
    }
  }
  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'due_date', // name of the key in the object storing the filter
        column: 'TASK.Due_Date', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filterValues?.due_date?.date ? this.filterValues : null,
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.dueDateFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null,
        nestedKey: 'date',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'task_statuses', // name of the key in the object storing the filter
        column: 'TASK.Status', // name of the column in the table or the field if super filter
        isMultiple: this.taskStatusFilter?.value?.length === this.statusListUnmap?.length ? false : true, // can it support multiple selection
        filterValue: this.taskStatusFilter?.value?.length === this.statusListUnmap?.length ? this.filteredValuesAll : this.filterValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.taskStatusFilter?.value?.length === this.statusListUnmap?.length ? null : this.statusListUnmap, // the array/list holding the dropdown options
        filterRef: this.taskStatusFilter, // the ref to form control binded to the filter
        isSelectionInput: this.taskStatusFilter?.value?.length === this.statusListUnmap?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.taskStatusFilter?.value?.length === this.statusListUnmap?.length ? null : 'label', // the key displayed in the html (only applicable to array of objects)
        savedValue: this.taskStatusFilter?.value?.length === this.statusListUnmap?.length ? null : 'value',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'from', // name of the key in the object storing the filter
        column: 'TASK.From', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filterValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.createdByFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'to', // name of the key in the object storing the filter
        column: 'TASK.Assigned_To', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filterValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.assignedFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'priorities', // name of the key in the object storing the filter
        column: 'P', // name of the column in the table or the field if super filter
        isMultiple: this.priorityFilter?.value?.length === this.priorityList?.length ? false : true, // can it support multiple selection
        filterValue: this.priorityFilter?.value?.length === this.priorityList?.length ? this.filteredValuesAll : this.filterValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.priorityFilter?.value?.length === this.priorityList?.length ? null : this.priorityList, // the array/list holding the dropdown options
        filterRef: this.priorityFilter, // the ref to form control binded to the filter
        isSelectionInput: this.priorityFilter?.value?.length === this.priorityList?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.priorityFilter?.value?.length === this.priorityList?.length ? null : 'label', // the key displayed in the html (only applicable to array of objects)
        savedValue: this.priorityFilter?.value?.length === this.priorityList?.length ? null : 'value',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'created_at', // name of the key in the object storing the filter
        column: 'TASK.Created', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filterValues?.created_at?.date ? this.filterValues : null,
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.createdDateFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null,
        nestedKey: 'date',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'school_ids', // name of the key in the object storing the filter
        column: 'TASK.School', // name of the column in the table or the field if super filter
        isMultiple: this.schoolFilter?.value?.length === this.filterSchoolList?.length ? false : true, // can it support multiple selection
        filterValue: this.schoolFilter?.value?.length === this.filterSchoolList?.length ? this.filteredValuesAll : this.filterValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.schoolFilter?.value?.length === this.filterSchoolList?.length ? null : this.filterSchoolList, // the array/list holding the dropdown options
        filterRef: this.schoolFilter, // the ref to form control binded to the filter
        isSelectionInput: this.schoolFilter?.value?.length === this.filterSchoolList?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.schoolFilter?.value?.length === this.filterSchoolList?.length ? null : 'short_name', // the key displayed in the html (only applicable to array of objects)
        savedValue: this.schoolFilter?.value?.length === this.filterSchoolList?.length ? null : '_id',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'campuses', // name of the key in the object storing the filter
        column: 'TASK.Campus', // name of the column in the table or the field if super filter
        isMultiple: this.campusFilter?.value?.length === this.filterCampusList?.length ? false : true, // can it support multiple selection
        filterValue: this.campusFilter?.value?.length === this.filterCampusList?.length ? this.filteredValuesAll : this.filterValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.campusFilter?.value?.length === this.filterCampusList?.length ? null : this.filterCampusList, // the array/list holding the dropdown options
        filterRef: this.campusFilter, // the ref to form control binded to the filter
        isSelectionInput: this.campusFilter?.value?.length === this.filterCampusList?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.campusFilter?.value?.length === this.filterCampusList?.length ? null : 'name', // the key displayed in the html (only applicable to array of objects)
        savedValue: this.campusFilter?.value?.length === this.filterCampusList?.length ? null : 'name',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'descriptions', // name of the key in the object storing the filter
        column: 'Description', // name of the column in the table or the field if super filter
        isMultiple: this.descriptionFilter?.value?.length === this.taskTypeList?.length ? false : true, // can it support multiple selection
        filterValue: this.descriptionFilter?.value?.length === this.taskTypeList?.length ? this.filteredValuesAll : this.filterValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.descriptionFilter?.value?.length === this.taskTypeList?.length ? null : this.taskTypeList, // the array/list holding the dropdown options
        filterRef: this.descriptionFilter, // the ref to form control binded to the filter
        isSelectionInput: this.descriptionFilter?.value?.length === this.taskTypeList?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.descriptionFilter?.value?.length === this.taskTypeList?.length ? null : 'name', // the key displayed in the html (only applicable to array of objects)
        savedValue: this.descriptionFilter?.value?.length === this.taskTypeList?.length ? null : 'name',
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filterValues);
      if (filterItem.name === 'due_date') {
        this.dueDateFilter.setValue('');
        this.filterValues.due_date = {
          date: '',
          time: '',
        };
      } else if (filterItem.name === 'created_at') {
        this.createdDateFilter.setValue('');
        this.filterValues.created_at = {
          date: '',
          time: '',
        };
      }
      this.resetDropdownAutoComplete(filterItem?.name);
      this.clearSelectifFilter();
      this.getMyTask();
    }
  }

  resetDropdownAutoComplete(name) {
    // to handle programsFilter value Change dropdown async mat auto complete
    if (name === 'school_id') {
      this.schoolFilter.patchValue(null);
    } else if (name === 'campus') {
      // because cascade
      if (this.schoolFilter.value) {
        this.getCampusList();
      } else {
        this.campusFilter.patchValue(null);
      }
    } else if (name === 'description') {
      this.descriptionFilter.patchValue(null);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
}
