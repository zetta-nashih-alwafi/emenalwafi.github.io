import { Component, ViewChild, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TutorialService } from '../../service/tutorial/tutorial.service';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { SubSink } from 'subsink';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import swal from 'sweetalert2';
import { UntypedFormControl } from '@angular/forms';
import * as _ from 'lodash';
import { UserService } from '../../service/user/user.service';
import { Observable } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { UtilityService } from 'app/service/utility/utility.service';
import { ReplyUrgentMessageDialogComponent } from 'app/mailbox/reply-urgent-message-dialog/reply-urgent-message-dialog.component';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { TestCreationService } from 'app/service/test/test-creation.service';
import Swal from 'sweetalert2';
import { CoreService } from 'app/service/core/core.service';
import { TutorialTabComponent } from '../tutorial-tab.component';
import { FilterBreadcrumbComponent } from 'app/filter-breadcrumb/filter-breadcrumb.component';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';

@Component({
  selector: 'ms-tutorial-app',
  templateUrl: './tutorial-app.component.html',
  styleUrls: ['./tutorial-app.component.scss'],
})
export class TutorialAppComponent implements OnInit, OnDestroy, AfterViewInit {
  replyUrgentMessageDialogComponent: MatDialogRef<ReplyUrgentMessageDialogComponent>;
  listUserType;
  filteredUserType: Observable<any[]>;
  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = ['module', 'subModule', 'userType', 'presentation', 'video', 'scenario', 'qa', 'action'];
  filterColumns: string[] = [
    'moduleFilter',
    'subModuleFilter',
    'userTypeFilter',
    'presentationFilter',
    'videoFilter',
    'scenarioFilter',
    'qaFilter',
    'actionFilter',
  ];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  private subs = new SubSink();
  config: MatDialogConfig = {
    disableClose: true,
    width: '650px',
  };
  noData: any;
  currentUser: any;
  originalUserType: any;
  userTypeList: any;
  isWaitingForResponse = false;
  dataLoaded = false;
  isReset = false;
  sortValue = null;
  moduleFilter = new UntypedFormControl('');
  subModuleFilter = new UntypedFormControl('');
  userTypeSearchFilter = new UntypedFormControl('');
  indexFilter = new UntypedFormControl('');
  titleFilter = new UntypedFormControl('');
  userTypeFilter = new UntypedFormControl('');
  descriptionFilter = new UntypedFormControl('');
  filteredValues = {
    module: '',
    sub_module: '',
  };
  listTutorialModule = {
    candidateTableList: [],
    admissionMemberList: [],
    financeTableList: [],
    financeMemberList: [],
    historyFinanceList: [],
    reconciliationList: [],
    cheques: [],
  };
  private timeOutVal: any;
  private intVal: any;
  isUserAcadDir = false;
  isUserAcadAdmin = false;
  isUserADMTCAdmin = false;
  isUserADMTCDirector = false;
  isUserADMTCVisitor = false;
  isEditable = true;
  createAble = true;
  dataCount = 0;
  actionColumn = 0;
  titleColumn = 0;
  userColumn = 0;
  descColumn = 0;
  isPermission: any;
  filterBreadcrumbData: any[] = [];

  constructor(
    private tutorialService: TutorialService,
    public translate: TranslateService,
    public dialog: MatDialog,
    private authService: AuthService,
    private userService: UserService,
    private testService: TestCreationService,
    public utilService: UtilityService,
    private mailboxService: MailboxService,
    public permissionService: PermissionService,
    private permissions: NgxPermissionsService,
    public coreService: CoreService,
    private tutorialTab: TutorialTabComponent,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    this.isPermission = this.authService.getPermission();
    this.currentUser = this.authService.getLocalStorageUser();
    this.getTutorialData();
    this.initializeUser();
    this.filterBreadcrumbData = [];
    this.filterBreadcrumbFormat();

    // this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
    this.subs.sink = this.moduleFilter.valueChanges.pipe(debounceTime(500)).subscribe((module) => {
      this.filteredValues['module'] = module;
      this.paginator.pageIndex = 0;
      this.getTutorialData();
      // this.dataSource.filter = JSON.stringify(this.filteredValues);
    });
  }

  getTranslateType(name) {
    if (name) {
      const value = this.translate.instant('USER_TYPES.' + name);
      return value;
    }
  }

  keysrt(key) {
    return function (a, b) {
      if (a[key] > b[key]) {
        return 1;
      } else if (a[key] < b[key]) {
        return -1;
      }
      return 0;
    };
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getTutorialData();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  openUserTypeColumn() {
    let allow = false;
    if (this.isUserAcadAdmin || this.isUserAcadDir || this.isUserADMTCAdmin || this.isUserADMTCDirector || this.isUserADMTCVisitor) {
      allow = true;
    }
    return allow;
  }

  sortData(sort: Sort) {
    // console.log('sort', sort);
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getTutorialData();
      }
    }
  }

  getTutorialData() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    // const filter = this.cleanFilterData();
    // console.log('filter', filter);

    this.subs.sink = this.tutorialService.GetAllInAppTutorial(this.filteredValues, this.sortValue, pagination).subscribe(
      (tutorialList) => {
        this.isWaitingForResponse = false;
        if (tutorialList && tutorialList.length) {
          tutorialList = tutorialList.sort((tutorialListA, tutorialListB) => {
            if (this.utilService.simplifyRegex(tutorialListA?.module) < this.utilService.simplifyRegex(tutorialListB.module)) {
              return -1;
            } else if (this.utilService.simplifyRegex(tutorialListA?.module) > this.utilService.simplifyRegex(tutorialListB.module)) {
              return 1;
            } else {
              return 0;
            }
          });
          this.dataSource.data = tutorialList;
          this.paginator.length = tutorialList[0].count_document;
          this.dataCount = tutorialList[0].count_document;
          const dataCandidateList = tutorialList.filter((resp) => resp?.module === 'Candidate Follow Up');
          const admissionList = tutorialList.filter((resp) => resp?.module === 'Admission Member');
          const financeFollowList = tutorialList.filter((resp) => resp?.module === 'Finance Follow Up');
          const financeMemberList = tutorialList.filter((resp) => resp?.module === 'Financial Member');
          const historyList = tutorialList.filter((resp) => resp?.module === 'History Finance');
          const reconciliationList = tutorialList.filter((resp) => resp?.module === 'Reconciliation & Lettrage');
          const chequesList = tutorialList.filter((resp) => resp?.module === 'Cheques');
          this.listTutorialModule = {
            admissionMemberList: admissionList,
            candidateTableList: dataCandidateList,
            financeTableList: financeFollowList,
            financeMemberList: financeMemberList,
            historyFinanceList: historyList,
            reconciliationList: reconciliationList,
            cheques: chequesList,
          };
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.filterBreadcrumbFormat();
        this.noData = this.dataSource.connect().pipe(map((data) => data.length === 0));
        this.isReset = false;
      },
      (err) => {
        this.authService.postErrorLog(err);
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

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      if (filterData[key]) {
        filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
      }
    });
    return filterQuery;
  }

  initializeUser() {
    this.subs.sink = this.moduleFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      statusSearch = statusSearch ? statusSearch.toLowerCase() : '';
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.filteredValues.module = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getTutorialData();
        }
      } else {
        this.moduleFilter.setValue('');
        this.filteredValues.module = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getTutorialData();
        }
      }
    });
    this.subs.sink = this.subModuleFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      statusSearch = statusSearch ? statusSearch.toLowerCase() : '';
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.filteredValues.sub_module = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getTutorialData();
        }
      } else {
        this.subModuleFilter.setValue('');
        this.filteredValues.sub_module = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getTutorialData();
        }
      }
    });
  }

  toggleSidebar(data) {
    this.tutorialService.setTutorialView(data);
    if (this.coreService.sidenavOpen) {
      this.coreService.sidenavOpen = !this.coreService.sidenavOpen;
    }
    this.coreService.sidenavTutorialOpen = true;
  }

  setSubModuleFilter(type) {
    // check if previously selected then select again, if yes then reset dropdown before filtering again
    if (this.filteredValues.sub_module && this.filteredValues.sub_module !== type.sub_module) {
      this.filteredUserType = this.originalUserType;
    }
    this.subModuleFilter.setValue(type.name);
    this.filteredValues.sub_module = type.sub_module;
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.getTutorialData();
    }
  }

  resetFilter() {
    this.isReset = true;
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.titleFilter.setValue('');
    this.userTypeFilter.setValue('');
    this.descriptionFilter.setValue('');
    this.moduleFilter.setValue(null, { emitEvent: false });
    this.subModuleFilter.setValue(null, { emitEvent: false });

    this.filteredValues = {
      module: '',
      sub_module: '',
    };
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.filterBreadcrumbData = [];
    this.getTutorialData();
  }

  deleteTutorial(data) {
    // console.log(data);
    if (!data?.is_published) {
      let timeDisabled = 3;
      swal
        .fire({
          title: 'Attention',
          html: this.translate.instant('TUTORIAL_MENU.TUTO_S5.TEXT', { tutorialName: data.module }),
          type: 'warning',
          allowEscapeKey: true,
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('SWEET_ALERT.DELETE.CONFIRM', { timer: timeDisabled }),
          cancelButtonText: this.translate.instant('SWEET_ALERT.DELETE.CANCEL'),
          onOpen: () => {
            Swal.disableConfirmButton();
            const confirmBtnRef = swal.getConfirmButton();
            const intVal = setInterval(() => {
              timeDisabled -= 1;
              confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM') + ' in ' + timeDisabled + ' sec';
              if (timeDisabled < 0) {
                clearInterval(intVal);
                confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM');
              }
            }, 1000);
            this.timeOutVal = setTimeout(() => {
              confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM');
              Swal.enableConfirmButton();
              clearInterval(intVal);
              clearTimeout(this.timeOutVal);
            }, timeDisabled * 1000);
            // clearTimeout(this.timeOutVal);
          },
          onClose: () => {
            clearInterval(this.intVal);
            clearTimeout(this.timeOutVal);
          },
        })
        .then((res) => {
          if (res.value && data?._id) {
            this.subs.sink = this.tutorialService.DeleteInAppTutorial(data._id).subscribe(
              (resp) => {
                swal.fire({
                  type: 'success',
                  title: this.translate.instant('TUTORIAL_SZ.TITLE'),
                  html: this.translate.instant('TUTORIAL_SZ.TEXT'),
                  confirmButtonText: this.translate.instant('TUTORIAL_SZ.BUTTON'),
                });
                this.getTutorialData();
              },
              (err) => {
                this.authService.postErrorLog(err);
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
    } else {
      swal
        .fire({
          title: this.translate.instant('INAPP_S7.TITLE', { module: data.module }),
          text: this.translate.instant('INAPP_S7.TEXT'),
          type: 'info',
          allowEscapeKey: true,
          allowOutsideClick: true,
          confirmButtonText: this.translate.instant('INAPP_S7.BUTTON'),
        })
        .then((res) => {
          if (res.value) {
            this.getTutorialData();
          }
        });
    }
  }

  publishTutorial(data) {
    if (data?.is_published) {
      const payload = {
        is_published: !data.is_published,
      };
      swal
        .fire({
          title: this.translate.instant('INAPP_SX1.TITLE', { module: data.module }),
          text: this.translate.instant('INAPP_SX1.TEXT'),
          type: 'warning',
          allowEscapeKey: true,
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('INAPP_SX1.BUTTON_1'),
          cancelButtonText: this.translate.instant('INAPP_SX1.BUTTON_2'),
        })
        .then((res) => {
          if (res.value && data?._id) {
            this.subs.sink = this.tutorialService.UpdateInAppTutorial(data._id, payload).subscribe(
              (resp) => {
                swal.fire({
                  type: 'success',
                  title: this.translate.instant('INAPP_SX2.TITLE'),
                  html: this.translate.instant('INAPP_SX2.TEXT'),
                  confirmButtonText: this.translate.instant('INAPP_SX2.BUTTON'),
                });
                this.getTutorialData();
              },
              (err) => {
                this.authService.postErrorLog(err);
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
    } else {
      const payload = {
        is_published: !data.is_published,
      };
      swal
        .fire({
          title: this.translate.instant('INAPP_S1.TITLE', { module: data.module }),
          text: this.translate.instant('INAPP_S1.TEXT'),
          type: 'warning',
          allowEscapeKey: true,
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('INAPP_S1.BUTTON_1'),
          cancelButtonText: this.translate.instant('INAPP_S1.BUTTON_2'),
        })
        .then((res) => {
          if (res.value && data?._id) {
            this.subs.sink = this.tutorialService.UpdateInAppTutorial(data._id, payload).subscribe(
              (resp) => {
                swal.fire({
                  type: 'success',
                  title: this.translate.instant('INAPP_S2.TITLE'),
                  html: this.translate.instant('INAPP_S2.TEXT'),
                  confirmButtonText: this.translate.instant('INAPP_S2.BUTTON'),
                });
                this.getTutorialData();
              },
              (err) => {
                this.authService.postErrorLog(err);
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

  viewTutorial(data: string) {
    window.open('//' + data, '_blank');
  }

  changeOptionUserType(value) {
    if (value.option && value.option.value) {
      this.userTypeFilter.setValue(value.option.value._id);
      this.userTypeSearchFilter.setValue(value.option.value.name);
    }
  }

  computeTutorialTooltip(userTypes: any[]): string {
    let tooltip = '';
    let count = 0;
    const type = _.uniqBy(userTypes, 'name');
    for (const entity of type) {
      count++;
      if (count > 1) {
        if (entity) {
          tooltip = tooltip + ', ';
          tooltip = tooltip + this.translate.instant('USER_TYPES.' + entity.name);
        }
      } else {
        if (entity) {
          tooltip = tooltip + this.translate.instant('USER_TYPES.' + entity.name);
        }
      }
    }
    return tooltip;
  }

  tutorialDialog(data) {
    if (!data) {
      this.tutorialService.setTutorialStep(1);
      this.tutorialTab.selected = 1;
      this.tutorialService.setTutorialView(null);
      this.tutorialService.setTutorialEdit(null);
    } else {
      this.tutorialService.setTutorialStep(1);
      this.tutorialTab.selected = 1;
      this.tutorialService.setTutorialView(data);
      this.tutorialService.setTutorialEdit(data);
    }
  }

  editTutorial(data) {
    this.isWaitingForResponse = false;
    if (data) {
      setTimeout(() => {
        this.tutorialService.setTutorialView(data);
        this.tutorialService.setTutorialEdit(data);
        this.tutorialService.setTutorialStep(1);
        this.tutorialTab.selected = 1;
      }, 5);
      this.isWaitingForResponse = true;
    }
  }

  forwardTutorial(data) {}

  getUniqueUserType(title) {
    return _.uniqBy(title, 'name');
  }

  /*
   * Render tooltip for column type
   * */
  renderTooltipType(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    const type = _.uniqBy(entities, 'name');
    for (const entity of type) {
      count++;
      if (count > 1) {
        if (entity) {
          tooltip = tooltip + ', ';
          tooltip = tooltip + this.translate.instant('USER_TYPES.' + entity.name);
        }
      } else {
        if (entity) {
          tooltip = tooltip + this.translate.instant('USER_TYPES.' + entity.name);
        }
      }
    }
    return tooltip;
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'module', // name of the key in the object storing the filter
        column: 'Module', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.moduleFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'table_filter',
        name: 'sub_module',
        column: 'Sub Module',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.subModuleFilter,
        isSelectionInput: false,
        displayKey: null,
        savedValue: null,
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
    this.getTutorialData();
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    this.subs.unsubscribe();
  }
}
