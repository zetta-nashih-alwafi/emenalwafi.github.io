import { Component, ViewChild, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TutorialService } from '../../service/tutorial/tutorial.service';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { SubSink } from 'subsink';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import swal from 'sweetalert2';
import { AddTutorialDialogComponent } from '../add-tutorial-dialog/add-tutorial-dialog.component';
import { UntypedFormControl } from '@angular/forms';
import * as _ from 'lodash';
import { ForwardTutorialDialogComponent } from '../forward-tutorial-dialog/forward-tutorial-dialog.component';
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
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss'],
})
export class TutorialComponent implements OnInit, OnDestroy, AfterViewInit {
  replyUrgentMessageDialogComponent: MatDialogRef<ReplyUrgentMessageDialogComponent>;
  listUserType;
  filteredUserType: Observable<any[]>;
  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = [];
  filterColumns: string[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  private subs = new SubSink();
  tutorialDialogComponent: MatDialogRef<AddTutorialDialogComponent>;
  forwardTutorialDialogComponent: MatDialogRef<ForwardTutorialDialogComponent>;
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
  userTypeSearchFilter = new UntypedFormControl('');
  indexFilter = new UntypedFormControl('');
  titleFilter = new UntypedFormControl('');
  userTypeFilter = new UntypedFormControl('');
  descriptionFilter = new UntypedFormControl('');
  filteredValues = {
    title: '',
    user_type_id: '',
  };
  private timeOutVal: any;
  private intVal: any;
  isUserAcadDir = false;
  isUserAcadAdmin = false;
  isUserOPERATORAdmin = false;
  isUserOPERATORDirector = false;
  isUserOPERATORVisitor = false;
  isEditable = true;
  createAble = true;
  dataCount = 0;
  actionColumn = 0;
  titleColumn = 0;
  userColumn = 0;
  descColumn = 0;

  filterBreadcrumbData: any[] = [];
  userTypeForBreadcrumb = [];

  isPermission: string[];
  currentUserTypeId: any;
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
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit() {
    this.isPermission = this.authService.getPermission();
    this.currentUser = this.authService.getLocalStorageUser();
    this.isUserAcadDir = !!this.permissions.getPermission('Academic Director');
    this.isUserAcadAdmin = !!this.permissions.getPermission('Academic Admin');
    this.isUserOPERATORAdmin = !!this.permissions.getPermission('operator_admin');
    this.isUserOPERATORDirector = !!this.permissions.getPermission('operator_dir');
    this.isUserOPERATORVisitor = !!this.permissions.getPermission('operator_visitor');
    if (this.isUserAcadAdmin || this.isUserAcadDir) {
      this.isEditable = false;
      this.createAble = false;
    }
    if (
      this.isUserAcadAdmin ||
      this.isUserAcadDir ||
      this.isUserOPERATORAdmin ||
      this.isUserOPERATORDirector ||
      this.isUserOPERATORVisitor
    ) {
      this.displayedColumns = ['title', 'user_type', 'description', 'action'];
      this.filterColumns = ['titleFilter', 'userTypeFilter', 'descriptionFilter', 'actionFilter'];
    } else {
      this.displayedColumns = ['title', 'description', 'action'];
      this.filterColumns = ['titleFilter', 'descriptionFilter', 'actionFilter'];
    }
    this.userTypeFilter.setValue(this.translate.instant('All'));
    this.getColumnSectionWidth();
    this.getTutorialData();
    this.initializeUser();
    this.getUrgentMail();
    this.getUserTypeDropdown();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getUserTypeDropdown();
      this.filterBreadcrumbFormat();
      if (
        this.userTypeFilter.value &&
        (this.userTypeFilter.value !== 'All' || this.userTypeFilter.value !== 'Tous') &&
        this.filteredValues?.user_type_id &&
        this.userTypeForBreadcrumb?.length
      ) {
        const currUserType = this.userTypeForBreadcrumb.find((user) => user._id === this.filteredValues?.user_type_id);
        if (currUserType) {
          this.userTypeFilter.setValue(this.translate.instant('USER_TYPES.' + currUserType.name));
        }
      } else if (
        (this.userTypeFilter.value === 'All' || this.userTypeFilter.value === 'Tous') &&
        this.filteredValues &&
        !this.filteredValues.user_type_id
      ) {
        this.userTypeFilter.setValue(this.translate.instant('All'));
      }
      if (this.originalUserType && this.originalUserType.length) {
        this.userTypeList = [];
        this.originalUserType.forEach((item) => {
          const typeEntity = this.getTranslateType(item.name);
          this.userTypeList.push({ _id: item._id, name: typeEntity });
        });
        this.userTypeList = this.userTypeList.sort(this.keysrt('text'));
        this.listUserType = this.userTypeFilter.valueChanges.pipe(
          startWith(''),
          map((searchText) =>
            this.userTypeList
              .filter((title) =>
                title && title.name ? title.name.toLowerCase().includes(searchText ? searchText.toLowerCase() : '') : false,
              )
              .sort((a: any, b: any) => a.name.localeCompare(b.name)),
          ),
        );
      }
    });
    this.pageTitleService.setTitle('List of tutorials');
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
    if (
      this.isUserAcadAdmin ||
      this.isUserAcadDir ||
      this.isUserOPERATORAdmin ||
      this.isUserOPERATORDirector ||
      this.isUserOPERATORVisitor
    ) {
      allow = true;
    }
    return allow;
  }

  sortData(sort: Sort) {
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
    const filter = this.cleanFilterData();
    this.currentUserTypeId = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.tutorialService.getTutorialNonOperator(pagination, this.sortValue, filter, this.currentUserTypeId).subscribe(
      (tutorialList) => {
        this.isWaitingForResponse = false;
        if (tutorialList && tutorialList.length) {
          this.dataSource.data = tutorialList;
          this.paginator.length = tutorialList[0].count_document;
          this.dataCount = tutorialList[0].count_document;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.noData = this.dataSource.connect().pipe(map((data) => data.length === 0));
        this.isReset = false;
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      (err) => {
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.dataCount = 0;
        this.noData = this.dataSource.connect().pipe(map((data) => data.length === 0));
        this.isReset = false;
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
    this.subs.sink = this.titleFilter.valueChanges.pipe(debounceTime(400)).subscribe(
      (statusSearch) => {
        const symbol = /[()|{}\[\]:;<>?,\/]/;
        const symbol1 = /\\/;
        if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
          this.filteredValues.title = statusSearch ? statusSearch : '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getTutorialData();
          }
        } else {
          this.titleFilter.setValue('');
          this.filteredValues.title = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getTutorialData();
          }
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  setUserTypeFilter(type) {
    // check if previously selected then select again, if yes then reset dropdown before filtering again
    if (!type) {
      this.userTypeFilter.setValue(null);
      this.filteredValues.user_type_id = null;
    } else if (type === 'All') {
      this.userTypeFilter.setValue(this.translate.instant('All'));
      this.filteredValues.user_type_id = null;
    } else {
      if (this.filteredValues.user_type_id && this.filteredValues.user_type_id !== type._id) {
        this.filteredUserType = this.originalUserType;
      }
      this.userTypeFilter.setValue(type.name);
      this.filteredValues.user_type_id = type._id;
    }
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.getTutorialData();
    }
  }

  resetFilter() {
    this.isReset = true;
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.titleFilter.setValue('', { emitEvent: false });
    this.userTypeFilter.setValue(this.translate.instant('All'), { emitEvent: false });
    this.descriptionFilter.setValue('', { emitEvent: false });

    this.filteredValues = {
      title: '',
      user_type_id: '',
    };
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.filterBreadcrumbData = [];
    this.getUserTypeDropdown();
    this.getTutorialData();
  }

  deleteTutorial(data) {
    let timeDisabled = 3;
    console.log(data);
    swal
      .fire({
        title: 'Attention',
        html: this.translate.instant('TUTORIAL_MENU.TUTO_S5.TEXT', { tutorialName: data.title }),
        type: 'warning',
        allowEscapeKey: true,
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: this.translate.instant('SWEET_ALERT.DELETE.CONFIRM', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('SWEET_ALERT.DELETE.CANCEL'),
        onOpen: () => {
          swal.disableConfirmButton();
          const confirmBtnRef = swal.getConfirmButton();
          const intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM') + ' in ' + timeDisabled + ' sec';
          }, 1000);
          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM');
            swal.enableConfirmButton();
            clearInterval(intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
          // clearTimeout(this.timeOutVal);
        },
      })
      .then((res) => {
        if (res.value) {
          this.isWaitingForResponse = true;
          this.subs.sink = this.tutorialService.deleteTutorial(data._id).subscribe(
            (resp) => {
              this.isWaitingForResponse = false;
              swal
                .fire({
                  type: 'success',
                  title: this.translate.instant('TUTORIAL_SZ.TITLE'),
                  html: this.translate.instant('TUTORIAL_SZ.TEXT'),
                  confirmButtonText: this.translate.instant('TUTORIAL_SZ.BUTTON'),
                })
                .then(() => this.getTutorialData());
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
      });
  }

  getUserTypeDropdown() {
    if (this.isUserAcadAdmin || this.isUserAcadDir) {
      this.subs.sink = this.userService.getAllUserTypePCStudentDropdown('academic', 'preparation_center').subscribe(
        (userType) => {
          this.userTypeForBreadcrumb = _.cloneDeep(userType);
          this.originalUserType = userType.map((type) => {
            const typeEntity = this.getTranslateType(type.name);
            return { name: typeEntity, _id: type._id };
          });
          this.originalUserType = this.originalUserType.sort(this.keysrt('text'));
          this.listUserType = this.userTypeFilter.valueChanges.pipe(
            startWith(''),
            map((searchText) =>
              this.originalUserType
                .filter((title) =>
                  title && title.name ? title.name.toLowerCase().includes(searchText ? searchText.toLowerCase() : '') : false,
                )
                .sort((a: any, b: any) => a.name.localeCompare(b.name)),
            ),
          );
        },
        (err) => {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    } else {
      this.subs.sink = this.testService.getAllUserType().subscribe(
        (userType) => {
          this.userTypeForBreadcrumb = _.cloneDeep(userType);
          this.originalUserType = userType.map((type) => {
            const typeEntity = this.getTranslateType(type.name);
            return { name: typeEntity, _id: type._id };
          });
          this.originalUserType = this.originalUserType.sort(this.keysrt('text'));
          this.listUserType = this.userTypeFilter.valueChanges.pipe(
            startWith(''),
            map((searchText) =>
              this.originalUserType
                .filter((title) =>
                  title && title.name ? title.name.toLowerCase().includes(searchText ? searchText.toLowerCase() : '') : false,
                )
                .sort((a: any, b: any) => a.name.localeCompare(b.name)),
            ),
          );
        },
        (err) => {
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

  viewTutorial(data) {
    window.open(`${data.link}`, '_blank');
  }

  changeOptionUserType(value) {
    if (value.option && value.option.value && value.option.value._id && value.option.value.name) {
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

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  getUrgentMail() {
    this.subs.sink = this.mailboxService.getUrgentMail().subscribe((mailList: any[]) => {
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
    });
  }

  tutorialDialog(data) {
    if (!data) {
      this.subs.sink = this.dialog
        .open(AddTutorialDialogComponent, this.config)
        .afterClosed()
        .subscribe((resp) => {
          this.getTutorialData();
        });
    } else {
      this.subs.sink = this.dialog
        .open(AddTutorialDialogComponent, {
          disableClose: true,
          width: '650px',
          data: data,
        })
        .afterClosed()
        .subscribe((resp) => {
          this.getTutorialData();
        });
    }
  }

  forwardTutorial(data) {
    this.subs.sink = this.dialog
      .open(ForwardTutorialDialogComponent, {
        disableClose: true,
        width: '800px',
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {
        this.getTutorialData();
      });
  }

  getUniqueUserType(title) {
    return _.uniqBy(title, 'name');
  }

  // *************** To Get Width Section Column and put in style css width
  getColumnSectionWidth() {
    if (
      this.isUserAcadAdmin ||
      this.isUserAcadDir ||
      this.isUserOPERATORAdmin ||
      this.isUserOPERATORDirector ||
      this.isUserOPERATORVisitor
    ) {
      this.titleColumn = 30;
      this.userColumn = 25;
      this.descColumn = 30;
      this.actionColumn = 15;
    } else {
      this.titleColumn = 40;
      this.descColumn = 50;
      this.actionColumn = 10;
    }
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
    this.getTutorialData();
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter',
        name: 'title',
        column: 'TUTORIAL.TITLETUTORIAL',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.titleFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'user_type_id',
        column: 'TUTORIAL.TYPEUSER',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.userTypeForBreadcrumb,
        filterRef: this.userTypeFilter,
        displayKey: 'name',
        savedValue: '_id',
        isSelectionInput: true,
        translationPrefix: 'USER_TYPES.',
        resetValue: this.translate.instant('All'),
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }
}
