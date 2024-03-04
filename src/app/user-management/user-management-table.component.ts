import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ReplyUrgentMessageDialogComponent } from 'app/mailbox/reply-urgent-message-dialog/reply-urgent-message-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { SchoolService } from 'app/service/schools/school.service';
import { UserService } from 'app/service/user/user.service';
import { UsersService } from 'app/service/users/users.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { UserEmailDialogComponent } from 'app/users/user-email-dialog/user-email-dialog.component';
import { UserTableData } from 'app/users/user.model';
import * as moment from 'moment';
import { Observable, of } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { SelectionModel } from '@angular/cdk/collections';
import { AddUserDialogComponent } from 'app/shared/components/add-user-dialog/add-user-dialog.component';
import { UserManagementService } from './user-management.service';
import { environment } from 'environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SendMultipleEmailComponent } from 'app/internship-file/send-multiple-email/send-multiple-email.component';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-user-management-table',
  templateUrl: './user-management-table.component.html',
  styleUrls: ['./user-management-table.component.scss'],
})
export class UserManagementTableComponent implements OnInit, AfterViewInit, OnDestroy {
  replyUrgentMessageDialogComponent: MatDialogRef<ReplyUrgentMessageDialogComponent>;
  private subs = new SubSink();
  displayedColumns: string[] = ['select', 'name', 'school', 'campus', 'userType', 'entity', 'status', 'action'];
  filterColumns: string[] = [
    'selectFilter',
    'nameFilter',
    'schoolFilter',
    'campusFilter',
    'userTypeFilter',
    'entityFilter',
    'statusFilter',
    'actionFilter',
  ];
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  // userDialogComponent: MatDialogRef<UsersDialogComponent>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  nameFilter = new UntypedFormControl('');
  schoolFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  userTypeFilter = new UntypedFormControl(null);
  entityFilter = new UntypedFormControl(null);
  statusFilter = new UntypedFormControl(null);

  schools = [];
  filteredSchoolNames: Observable<any[]>;
  filteredCampuses: Observable<any[]>;
  statusFilterList = [];
  userTypeListFilter: Observable<any[]>;
  userTypeList = [];
  entityList: any = [];
  users: UserTableData[];
  // originalUsers: to preserve original data of users because this.users data being manipulated when login as certifier admin/dir
  dataLoaded = false;
  usersCount = 0;
  sortValue: any;
  dataSelectedAll: any;
  previousLength = 0;
  pageSelected = [];
  userSelected: any[];
  userSelectedId: any[];
  isCheckedAll = false;
  selectType: any;
  disabledExport = true;
  allStudentForCheckbox = [];
  dataSelected = [];

  // Configuration of the Popup Size and display
  configCat: MatDialogConfig = {
    disableClose: true,
    panelClass: 'certification-rule-pop-up',
    minWidth: '95%',
    minHeight: '81%',
  };

  filteredValues = {
    last_name: null,
    school: null,
    campus: null,
    user_type: null,
    entity: null,
    user_status: null,
    schools: null,
    campuses: null,
    user_types: null,
    entities: null,
    user_statuses: null,
  };

  filteredValuesAll = {
    schools: 'All',
    campuses: 'All',
    user_types: 'All',
    entities: 'All',
    user_statuses: 'All',
  };

  loggedInUserSchools: { value: string; label: string }[] = [];
  isWaitingForResponse = false;
  isWaitingForResponseTop = false;
  noData: any;
  entityData: any;
  currentUser: any;
  backupUser: any;
  private timeOutVal: any;
  private intVal: any;
  mailUser: MatDialogRef<UserEmailDialogComponent>;
  originalUserType: any[];
  campuses: any;
  isOperator = false;
  hideExport = false;
  isPermission: string[];
  currentUserTypeId: any;
  dataUnselectUser = [];
  allExportForCheckbox = [];

  buttonClicked = '';
  allEmailForCheckbox = [];
  allCandidateData: any = [];

  tempDataFilter = {
    tempSchools: null,
    tempCampuses: null,
    tempUserTypes: null,
    tempEntities: null,
    tempUserStatuses: null,
  };
  filterBreadcrumbData: any[] = [];

  constructor(
    private translate: TranslateService,
    private usersService: UsersService,
    private userService: UserService,
    public dialog: MatDialog,
    private schoolService: SchoolService,
    private utilService: UtilityService,
    private authService: AuthService,
    private router: Router,
    private ngxPermissionService: NgxPermissionsService,
    private mailboxService: MailboxService,
    public permissionService: PermissionService,
    private route: ActivatedRoute,
    private userMgtService: UserManagementService,
    private httpClient: HttpClient,
    private cd: ChangeDetectorRef,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    // this.currentUser = this.authService.getLocalStorageUser();
    // this.entityData = this.currentUser.entities.find((entity) => entity.type.name === 'Academic Director');
    this.checkIsOperator();
    this.initializeUserFilter();
    this.getDropdowns();
    this.getAllUser();
    this.entityList = [
      {
        value: 'academic',
        label: this.translate.instant('academic'),
      },
      {
        value: 'admission',
        label: this.translate.instant('admission'),
      },
      {
        value: 'finance',
        label: this.translate.instant('finance'),
      },
      {
        value: 'company_relation',
        label: this.translate.instant('company_relation'),
      },
      {
        value: 'operator',
        label: this.translate.instant('operator'),
      },
      {
        value: 'alumni',
        label: this.translate.instant('alumni'),
      },
    ];
    this.statusFilterList = [
      {
        value: 'active',
        label: this.translate.instant('active'),
      },
      {
        value: 'pending',
        label: this.translate.instant('pending'),
      },
      {
        value: 'incorrect_email',
        label: this.translate.instant('incorrect_email'),
      },
    ];

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.initializeUserFilter();
      // this.resetSelection();
      // this.displayWithSchool(this.schoolFilter.value);
      // this.displayWithCampus(this.campusFilter.value);
      // this.displayWithUserType(this.userTypeFilter.value);
    });

    this.pageTitleService.setTitle('List of users');
    this.filterBreadcrumbFormat();
  }

  ngAfterViewInit() {
    // this.dataSource.sort = this.sort;
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          this.getAllUser();
          this.dataLoaded = true;
        }),
      )
      .subscribe();
    this.cd.detectChanges();
  }

  checkIsOperator() {
    this.isOperator = this.authService.getCurrentUser()?.entities?.some((entity) => entity?.entity_name && entity?.entity_name === 'operator');
  }

  /********************** FILTER AND SORT ************/

  initializeUserFilter() {
    this.subs.sink = this.nameFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (name !== null && !name.match(symbol) && !name.match(symbol1)) {
        this.filteredValues.last_name = name;
        this.paginator.pageIndex = 0;
        this.getAllUser();
      } else {
        this.nameFilter.setValue('');
        this.filteredValues.last_name = '';
        this.paginator.pageIndex = 0;
        this.getAllUser();
      }
    });
    // this.subs.sink = this.entityFilter.valueChanges.subscribe((entity) => {
    //   this.filteredValues.entity = entity === 'AllM' ? '' : entity;
    //   this.paginator.pageIndex = 0;
    //   this.getAllUser();
    // });
    // this.subs.sink = this.statusFilter.valueChanges.subscribe((status) => {
    //   this.filteredValues.user_status = status === 'AllM' ? '' : status;
    //   this.paginator.pageIndex = 0;
    //   this.getAllUser();
    // });

    this.entityList = [
      {
        value: 'academic',
        label: this.translate.instant('academic'),
      },
      {
        value: 'admission',
        label: this.translate.instant('admission'),
      },
      {
        value: 'finance',
        label: this.translate.instant('finance'),
      },
      {
        value: 'company_relation',
        label: this.translate.instant('company_relation'),
      },
      {
        value: 'operator',
        label: this.translate.instant('operator'),
      },
      {
        value: 'alumni',
        label: this.translate.instant('alumni'),
      },
    ];
    this.statusFilterList = [
      {
        value: 'active',
        label: this.translate.instant('active'),
      },
      {
        value: 'pending',
        label: this.translate.instant('pending'),
      },
      {
        value: 'incorrect_email',
        label: this.translate.instant('incorrect_email'),
      },
    ];
  }

  sortData(sort: Sort) {
    if (sort.active === 'last_name') {
      this.sortValue = sort.direction ? { full_name: sort.direction } : null;
    } else if (sort.active === 'title') {
      this.sortValue = sort.direction ? { title: sort.direction } : null;
    } else if (sort.active === 'userType') {
      this.sortValue = sort.direction ? { user_type: sort.direction } : null;
    } else if (sort.active === 'user_status') {
      this.sortValue = sort.direction ? { user_status: sort.direction } : null;
    }
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      this.getAllUser();
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

  // ************** DROPDOWNS **********************

  getDropdowns() {
    this.getAllSchoolDropdown();
    this.getUserTypesDropdown();
  }

  getAllSchoolDropdown() {
    this.subs.sink = this.userMgtService.getAllSchoolDropdown(this.currentUserTypeId).subscribe(
      (resp) => {
        this.schools = resp.sort((a: any, b: any) => a.short_name.localeCompare(b.short_name));
        // this.filteredSchoolNames = this.schoolFilter.valueChanges.pipe(
        //   startWith(''),
        //   map((searchText) =>
        //     this.schools
        //       .filter((school) =>
        //         school && school.short_name ? school.short_name.toLowerCase().includes(searchText.toLowerCase()) : false,
        //       )
        //       .sort((a: any, b: any) => a.short_name.localeCompare(b.short_name)),
        //   ),
        // );
      },
      (err) => {
        // Record error log
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

  getCampusesDropdown(schoolId: string) {
    this.subs.sink = this.schoolService.getAllCampusesFromSchoolDropdown(schoolId).subscribe(
      (resp) => {
        this.campuses = resp.sort((a, b) => a.name.localeCompare(b.name));
        // this.filteredCampuses = of(this.campuses);
        // this.subs.sink = this.campusFilter.valueChanges.subscribe((search) => {
        //   if (search && typeof search === 'string') {
        //     const result = this.campuses.filter((data) => {
        //       if (data?.name) {
        //         return this.utilService.simplifyRegex(data?.name).includes(this.utilService.simplifyRegex(search));
        //       }
        //     });

        //     this.filteredCampuses = of(result);
        //   }
        // });
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
      },
    );
  }

  getUserTypesDropdown() {
    this.subs.sink = this.userService.getAllUserTypeDropdown().subscribe(
      (resp) => {
        const listType = _.cloneDeep(resp);
        this.userTypeList = [];
        listType.forEach((item) => {
          const value = this.translate.instant('USER_TYPES_WITH_ENTITY.' + item.name_with_entity);
          this.userTypeList.push({ _id: item._id, name_with_entity: value });
        });
        this.originalUserType = _.cloneDeep(resp);
        this.userTypeList = this.userTypeList.sort(this.keysrt('text'));
        this.userTypeListFilter = of(this.userTypeList);
        // this.subs.sink = this.userTypeFilter.valueChanges.subscribe((search) => {
        //   if (search && typeof search === 'string') {
        //     const result = this.userTypeList.filter((data) => {
        //       if (data?.name_with_entity) {
        //         return this.utilService.simplifyRegex(data?.name_with_entity).includes(this.utilService.simplifyRegex(search));
        //       }
        //     });

        //     this.userTypeListFilter = of(result);
        //   }
        // });
      },
      (err) => {
        // Record error log
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

    this.localizeUserTypesListener();
  }

  /******************************************** */

  setSchoolFilter(schoolId: string) {
    if (schoolId !== 'All') {
      this.getCampusesDropdown(schoolId);
    } else {
      this.filteredCampuses = of([]);
      this.campusFilter.setValue('All');
      this.filteredValues.campus = null;
      this.getAllSchoolDropdown();
    }
    // this.filteredValues.user_status = status === 'AllM' ? '' : status;
    this.filteredValues.school = schoolId === 'All' ? '' : schoolId;
    this.paginator.pageIndex = 0;
    this.getAllUser();
  }

  // function serves to listen to changes for language change and localize the user types dropdown
  localizeUserTypesListener() {
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      if (this.originalUserType && this.originalUserType.length) {
        this.userTypeList = [];
        this.originalUserType.forEach((item) => {
          const typeEntity = this.getTranslateType(item.name_with_entity);
          this.userTypeList.push({ _id: item._id, name_with_entity: typeEntity });
        });
        this.userTypeList = this.userTypeList.sort(this.keysrt('text'));
        // this.userTypeListFilter = this.userTypeFilter.valueChanges.pipe(
        //   startWith(''),
        //   map((searchText) =>
        //     this.userTypeList
        //       .filter((title) =>
        //         title && title.name_with_entity ? title.name_with_entity.toLowerCase().includes(searchText.toLowerCase()) : false,
        //       )
        //       .sort((a: any, b: any) => a.name_with_entity.localeCompare(b.name_with_entity)),
        //   ),
        // );
      }
    });
  }

  setCampusFilter(campusId: string | null) {
    if (campusId === 'All' && this.schoolFilter.value && this.schoolFilter.value !== 'All' && this.filteredValues.school) {
      this.filteredCampuses = of(this.campuses);
    }
    this.filteredValues.campus = campusId === 'All' ? null : campusId;
    this.paginator.pageIndex = 0;
    this.getAllUser();
  }

  setTypeFilter(userType: string) {
    if (userType === 'All') {
      this.userTypeListFilter = of(this.userTypeList);
    }
    this.filteredValues.user_type = userType === 'All' ? '' : userType;
    this.paginator.pageIndex = 0;
    this.getAllUser();
  }

  /*
   * Implement Populate Data User Table
   * */
  getAllUser() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    let filter = this.cleanFilterData();

    this.subs.sink = this.usersService.getAllUser(pagination, this.sortValue, filter).subscribe(
      (resp) => {
        this.users = _.cloneDeep(resp);
        this.setUserSchoolAndCampuses(this.users);
        this.setUserOperatorStatus(this.users);

        this.dataSource.data = this.users;
        this.usersCount = this.users && this.users.length ? this.users[0].count_document : 0;
        this.isWaitingForResponse = false;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
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

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'schools') {
          const data = filterData.schools.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `schools:[${data}]` : filterQuery + `schools:[${data}]`;
        } else if (key === 'campuses') {
          const data = filterData.campuses.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `campuses:[${data}]` : filterQuery + `campuses:[${data}]`;
        } else if (key === 'user_types') {
          const data = filterData.user_types.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `user_type:[${data}]` : filterQuery + `user_type:[${data}]`;
        } else if (key === 'entities') {
          const data = filterData.entities;
          filterQuery = filterQuery ? filterQuery + ',' + `entity:[${data}]` : filterQuery + `entity:[${data}]`;
        } else if (key === 'user_statuses') {
          const data = filterData.user_statuses;
          filterQuery = filterQuery ? filterQuery + ',' + `user_statuses:[${data}]` : filterQuery + `user_statuses:[${data}]`;
        } else {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        }
      }
    });

    return filterQuery;
  }

  // Function below to merge all the campuses from different entities of user into 1 array
  setUserSchoolAndCampuses(users: any[]): void {
    // each user can have multiple entities with multiple campuses
    // thus, we need to display all the campuses under one variable from the separate entities
    users.forEach((user, index) => {
      const campuses = [];
      const schools = [];
      if (user.entities && user.entities.length) {
        user.entities.forEach((entity) => {
          if (entity.programs && entity.programs.length) {
            entity.programs.forEach((program) => {
              if (program.campus) {
                campuses.push(program.campus);
              }
              if (program.school) {
                schools.push(program.school);
              }
            });
          }
        });
      }
      // const campuses = user.entities.map((entity) => entity.campus).filter((campus) => campus);
      // const schools = user.entities.map((entity) => entity.school).filter((school) => school);
      user.campuses = _.uniqBy([].concat(...campuses), '_id');
      user.schools = _.uniqBy([].concat(...schools), '_id');
    });
  }

  // check wether a user is operator or has operator in their list of entities
  setUserOperatorStatus(users: any[]): void {
    users.forEach((user, index) => {
      user.isOperator = user?.entities?.some((entity) => entity && entity.entity_name && entity.entity_name === 'operator');
    });
  }

  getTranslateType(name) {
    if (name) {
      const value = this.translate.instant('USER_TYPES_WITH_ENTITY.' + name);
      return value;
    }
  }

  addUser() {
    this.subs.sink = this.dialog
      .open(AddUserDialogComponent, {
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        width: '660px',
        data:{
          from:'user'
        }
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.goToUserCardDetail(resp._id);
        }
      });
  }

  goToUserCardDetail(userId: string) {
    this.router.navigate(['user-list'], { relativeTo: this.route, queryParams: { user: userId } });
  }

  connectAsUser(user: UserTableData) {
    const currentUser = this.utilService.getCurrentUser();
    const unixUserType = _.uniqBy(user.entities, 'type.name');
    const unixEntities = _.uniqBy(user.entities, 'entity_name');
    const unixUserTypeId = _.uniqBy(user.entities, 'type._id');
    let unixSchoolType = [];
    let unixSchool = [];
    if (unixEntities && unixEntities.length && unixEntities[0].entity_name === 'academic') {
      unixSchoolType = _.uniqBy(user.entities, 'school_type');
      unixSchool = _.uniqBy(user.entities, 'school._id');
    }
    this.isWaitingForResponseTop = true;

    this.backupUser = JSON.parse(localStorage.getItem('backupUser'));
    if (this.backupUser) {
      this.isWaitingForResponseTop = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('ConnectAs.Title'),
        html: this.translate.instant('ConnectAs.Text'),
        allowEscapeKey: true,
        allowOutsideClick: false,
        confirmButtonText: this.translate.instant('ConnectAs.Button'),
      });
    } else if (unixUserTypeId === '61dd3ccff647127fd6bf65d7') {
      this.isWaitingForResponseTop = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('ConnectAs.Under Construction'),
        allowEscapeKey: true,
        allowOutsideClick: false,
        confirmButtonText: this.translate.instant('ConnectAs.Button'),
      });
    } else {
      this.getUserTableColumnSettings(user?._id)
      this.subs.sink = this.authService.loginAsUser(currentUser._id, user._id).subscribe(
        (resp) => {
          this.isWaitingForResponseTop = false;
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('SUCCESS'),
              html: this.translate.instant('USER_S7_SUPERUSER.TEXT', {
                UserCivility: user.civility !== 'neutral' ? this.translate.instant(user.civility) : '',
                UserFirstName: user.first_name,
                UserLastName: user.last_name,
              }),
              allowEscapeKey: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('UNDERSTOOD'),
            }).then((result) => {
              this.authService.backupLocalUserProfileAndToken();
              const tempResp = _.cloneDeep(resp);
              const tempProgram = _.cloneDeep(resp);
              const program = this.utilService.setDataProgram(tempProgram.user.entities);
              tempProgram.user.entities = this.utilService.mergeHierarchyPermission(_.cloneDeep(tempProgram.user.entities));
              const sortedEntities = this.utilService.sortEntitiesByHierarchy(tempProgram.user.entities);
              const temp = tempProgram.user;
              temp.entities = sortedEntities;
              temp.app_data = program;
              tempResp.user = temp;
              const permissionsId = [];
              if (sortedEntities && sortedEntities.length > 0) {
                sortedEntities.forEach((entity) => {
                  console.log('UserType name : ', entity.type.name);
                  permissionsId.push(entity.type._id);
                });
              }

              this.authService.setLocalUserProfileAndToken(tempResp);
              this.authService.setPermission([sortedEntities[0].type.name]);
              this.ngxPermissionService.flushPermissions();
              this.ngxPermissionService.loadPermissions([sortedEntities[0].type.name]);
              this.userService.reloadCurrentUser(true);

              const listExceptionUserTypeId = ['6278e02eb97bfb30674e76b0', '6278e027b97bfb30674e76af', '5fe98eeadb866c403defdc6c'];
              if (permissionsId.findIndex((permission) => listExceptionUserTypeId.includes(permission)) < 0) {
                this.router.navigate(['/home']);
              } else {
                this.router.navigate(['/mailbox/inbox']);
              }
            });
          }
        },
        (err) => {
          // Record error log
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
            if (err['message'] === 'GraphQL error: you cannot logged in as this user') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SWAL_CONNECTAS.TITLE'),
                html: this.translate.instant('SWAL_CONNECTAS.TEXT'),
                allowEscapeKey: true,
                allowOutsideClick: false,
                confirmButtonText: this.translate.instant('SWAL_CONNECTAS.BUTTON'),
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
        },
      );
      // } else {
      //   // if user has multiple entity, show dialog to choose entity
      //   this.isWaitingForResponseTop = false;
      //   this.dialog.open(LoginAsUserDialogComponent, {
      //     disableClose: true,
      //     panelClass: 'certification-rule-pop-up',
      //     width: '615px',
      //     data: user,
      //   });
    }
  }

  getUserTableColumnSettings(user_id) {
    if (user_id) {
      this.subs.sink = this.authService.GetUserTableColumnSettings(user_id).subscribe(
        (resp) => {
          if (resp && resp?.length) {
            localStorage.setItem('templateTable', JSON.stringify(resp));
          }
        },
        (err) => {
          Swal.fire({
            type: 'info',
            title: 'Warning',
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
  }
  incorrectPassword(userId: string, civility: string, firstName: string, lastName: string) {
    let timeDisabled = 3;
    Swal.fire({
      allowOutsideClick: false,
      type: 'warning',
      title: this.translate.instant('INCORRECT_EMAIL.TITLE', {
        director: this.translate.instant('Academic Director/Certifier Admin'),
      }),
      html: this.translate.instant('INCORRECT_EMAIL.TEXT', {
        civility: civility !== 'neutral' ? this.translate.instant(civility) : '',
        firstName: firstName,
        lastName: lastName,
      }),
      showCancelButton: true,
      cancelButtonText: this.translate.instant('INCORRECT_EMAIL.CANCEL'),
      confirmButtonText: this.translate.instant('INCORRECT_EMAIL.SEND', { timer: timeDisabled }),
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        this.intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('INCORRECT_EMAIL.SEND') + ' in ' + timeDisabled + ' sec';
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('INCORRECT_EMAIL.SEND');
          Swal.enableConfirmButton();
          clearInterval(this.intVal);
        }, timeDisabled * 1000);
      },
    }).then((isConfirm) => {
      if (isConfirm.value) {
        this.subs.sink = this.userService.inactiveEmail(this.translate.currentLang, userId).subscribe(
          (resp) => {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('OK'),
            });
            this.getAllUser();
          },
          (err) => {
            // Record error log
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
    });
  }

  deactiveUser(userId: string, civility: string, firstName: string, lastName: string, user: UserTableData) {
    const unixUserTypeId = _.uniqBy(user.entities, 'type._id');
    let timeDisabled = 3;
    if (unixUserTypeId === '61dd3ccff647127fd6bf65d7') {
      this.isWaitingForResponseTop = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('DELETE_USER.UNDER_CONSTRUCTION'),
        allowEscapeKey: true,
        allowOutsideClick: false,
        confirmButtonText: this.translate.instant('ConnectAs.Button'),
      });
    } else {
      Swal.fire({
        allowOutsideClick: false,
        type: 'question',
        title: this.translate.instant('Attention'),
        html: this.translate.instant('DELETE_USER.QUESTION', {
          civility: civility !== 'neutral' ? this.translate.instant(civility) : '',
          firstName: firstName,
          lastName: lastName,
        }),
        showCancelButton: true,
        confirmButtonText: this.translate.instant('SWEET_ALERT.DELETE.CONFIRM', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('SWEET_ALERT.DELETE.CANCEL'),
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          this.intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM') + ' in ' + ` (${timeDisabled})` + ' sec';
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM');
            Swal.enableConfirmButton();
            // clearTimeout(time);
            clearInterval(this.intVal);
          }, timeDisabled * 1000);
          // clearTimeout(this.timeOutVal);
        },
      }).then((isConfirm) => {
        if (isConfirm.value) {
          this.subs.sink = this.userService.deleteUser(userId).subscribe(
            (resp) => {
              if (resp) {
                if (!resp.errors) {
                  Swal.fire({
                    allowOutsideClick: false,
                    confirmButtonText: this.translate.instant('OK'),
                    type: 'success',
                    title: this.translate.instant('DELETE_USER.SUCCESS_TITLE'),
                    text: this.translate.instant('DELETE_USER.SUCCESS_TEXT'),
                  });
                  this.getAllUser();
                } else if (resp.errors && resp.errors[0] && resp.errors[0].message === 'the mentor is already used in student contract') {
                  Swal.fire({
                    allowOutsideClick: false,
                    confirmButtonText: this.translate.instant('DeleteMent_S1.BUTTON'),
                    type: 'info',
                    title: this.translate.instant('DeleteMent_S1.TITLE'),
                    text: this.translate.instant('DeleteMent_S1.TEXT'),
                  });
                  this.getAllUser();
                } else if (resp.errors && resp.errors[0] && resp.errors[0].message === 'user should transfer the responsibility first') {
                  Swal.fire({
                    allowOutsideClick: false,
                    confirmButtonText: this.translate.instant('DeleteTypeUser.Btn-Confirm'),
                    type: 'info',
                    title: this.translate.instant('DeleteTypeUser.Title'),
                    text: this.translate.instant('DeleteTypeUser.Body'),
                  });
                  this.getAllUser();
                } else if (resp.errors && resp.errors[0] && resp.errors[0].message === 'user still have todo tasks') {
                  Swal.fire({
                    allowOutsideClick: false,
                    confirmButtonText: this.translate.instant('DeleteUserTodo.Btn-Confirm'),
                    type: 'warning',
                    title: this.translate.instant('DeleteUserTodo.Title'),
                    text: this.translate.instant('DeleteUserTodo.Body'),
                  });
                  this.getAllUser();
                } else if (resp.errors && resp.errors[0] && resp.errors[0].message === 'Teacher already assigned to program sequence') {
                  Swal.fire({
                    title: this.translate.instant('DeleteTeacher_S2.TITLE'),
                    html: this.translate.instant('DeleteTeacher_S2.TEXT', {
                      civility: civility !== 'neutral' ? this.translate.instant(civility) : '',
                      firstName: firstName,
                      lastName: lastName,
                    }),
                    type: 'warning',
                    showConfirmButton: true,
                    confirmButtonText: this.translate.instant('DeleteTeacher_S2.BUTTON1'),
                  });
                  this.getAllUser();
                } else if (resp.errors && resp.errors[0] && resp.errors[0].message) {
                  Swal.fire({
                    allowOutsideClick: false,
                    confirmButtonText: this.translate.instant('OK'),
                    type: 'info',
                    title: this.translate.instant('Error'),
                    text: resp.errors[0].message,
                  });
                }
              }
            },
            (err) => {
              // Record error log
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
      });
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected() || (this.isCheckedAll && this.dataUnselectUser.length)) {
      this.selection.clear();
      this.dataSelected = [];
      this.isCheckedAll = false;
      this.allCandidateData = [];
      this.allExportForCheckbox = [];
      this.dataUnselectUser = [];
      this.allStudentForCheckbox = [];
      this.allExportForCheckbox = [];
      this.allEmailForCheckbox = [];
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.isCheckedAll = true;
      this.allCandidateData = [];
      this.allExportForCheckbox = [];
      this.dataUnselectUser = [];
      this.allStudentForCheckbox = [];
      this.allEmailForCheckbox = [];
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
      // this.getAllIdForCheckbox(0);
    }
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isWaitingForResponse = true;
    let filter = ``;
    filter += this.filteredValues.last_name ? `full_name : "${this.filteredValues.last_name}"` : '';
    filter += this.filteredValues.user_type ? `user_type: "${this.filteredValues.user_type}"` : '';
    filter += this.filteredValues.school ? `school: "${this.filteredValues.school}"` : '';
    filter += this.filteredValues.campus ? `campuses: ["${this.filteredValues.campus}"]` : '';
    filter += this.filteredValues.entity ? `entity: ${this.filteredValues.entity}` : '';
    filter += this.filteredValues.user_status ? ` user_status: ${this.filteredValues.user_status}` : '';
    this.subs.sink = this.usersService.getAllUserCheckbox(pagination, this.sortValue, filter).subscribe(
      (students) => {
        if (students && students.length) {
          this.allStudentForCheckbox.push(...students);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
          this.isWaitingForResponse = false;
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
        // Record error log
        this.authService.postErrorLog(error);
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

    if (numSelected > 0) {
      this.disabledExport = false;
    } else {
      this.disabledExport = true;
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  /** Reset Functionality User Table */
  resetSelection() {
    this.disabledExport = true;
    this.selection.clear();
    this.dataSelected = [];
    this.dataUnselectUser = [];
    this.allEmailForCheckbox = [];
    this.allExportForCheckbox = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    this.filteredValues = {
      last_name: null,
      school: null,
      campus: null,
      user_type: null,
      entity: null,
      user_status: null,
      schools: null,
      campuses: null,
      user_types: null,
      entities: null,
      user_statuses: null,
    };
    this.sort.direction = '';
    this.sort.active = '';
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sortValue = null;
    this.paginator.pageIndex = 0;
    this.nameFilter.setValue('', { emitEvent: false });
    this.schoolFilter.setValue(null, { emitEvent: false });
    this.campusFilter.setValue(null, { emitEvent: false });
    this.userTypeFilter.setValue(null, { emitEvent: false });
    this.entityFilter.setValue(null, { emitEvent: false });
    this.statusFilter.setValue(null, { emitEvent: false });
    this.filterBreadcrumbData = [];
    this.getDropdowns();
    this.getAllUser();

    this.filteredCampuses = of([]);
    this.userTypeListFilter = of(this.userTypeList);

    this.tempDataFilter = {
      tempSchools: null,
      tempCampuses: null,
      tempUserTypes: null,
      tempEntities: null,
      tempUserStatuses: null,
    };
  }

  /*
   * Will render tooltip message for column campus merged
   * */
  renderTooltipSchools(schools: { short_name: string; _id: string }[]): string {
    let tooltip = '';
    for (let i = 1; i < schools.length; i++) {
      tooltip = tooltip + schools[i].short_name + `, `;
    }
    return tooltip.substring(0, tooltip.length - 2);
  }

  renderTooltipCampuses(campuses: { name: string; _id: string }[]): string {
    let tooltip = '';
    for (let i = 1; i < campuses.length; i++) {
      tooltip = tooltip + campuses[i].name + `, `;
    }
    return tooltip.substring(0, tooltip.length - 2);
  }

  /*
   * Render tooltip for column type
   * */
  renderTooltipType(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    const type = _.uniqBy(
      entities.filter((entity) => entity && entity.type),
      'type.name',
    );
    for (const entity of type) {
      count++;
      if (count > 1) {
        if (entity.type) {
          tooltip = tooltip + ', ';
          tooltip = tooltip + this.translate.instant('USER_TYPES.' + entity.type.name);
        }
      } else {
        if (entity.type) {
          tooltip = tooltip + this.translate.instant('USER_TYPES.' + entity.type.name);
        }
      }
    }
    return tooltip;
  }

  /*
   * Render tooltip for column type
   * */
  renderTooltipEntity(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    const type = _.uniqBy(entities, 'entity_name');
    for (const entity of type) {
      count++;
      if (count > 1) {
        if (entity.entity_name) {
          tooltip = tooltip + ', ';
          tooltip = tooltip + this.translate.instant(entity.entity_name);
        }
      } else {
        if (entity.entity_name) {
          tooltip = tooltip + this.translate.instant(entity.entity_name);
        }
      }
    }
    return tooltip;
  }

  getUniqueEntities(entities) {
    return _.uniqBy(entities, 'entity_name');
  }

  getUniqueUserType(entities) {
    return _.uniqBy(
      entities.filter((entity) => entity && entity.type),
      'type.name',
    );
  }

  sendMail(data) {
    this.mailUser = this.dialog.open(UserEmailDialogComponent, {
      disableClose: true,
      width: '750px',
      data: data,
    });
  }

  sendReminderRegistration(data) {
    if (data.user_status === 'active') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('User_Registered_S1.TITLE'),
        text: this.translate.instant('User_Registered_S1.TEXT'),
      });
      return;
    }
    this.isWaitingForResponseTop = true;
    this.subs.sink = this.usersService.sendReminderUserN1(this.translate.currentLang, data._id, this.currentUserTypeId).subscribe(
      (resp) => {
        this.isWaitingForResponseTop = false;
        console.log(resp);
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo !'),
          text: this.translate.instant('Email Sent'),
        });
      },
      (err) => {
        // Record error log
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
                  // Record error log
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
            });
        }
      },
      (err) => {
        // Record error log
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

  ngOnDestroy(): void {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  csvDownload() {
    if (
      this.dataSelected &&
      this.dataSelected.length < 1 &&
      (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser.length > 1))
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('User') }),
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
          this.openDownloadCsv(fileType);
        }
      });
    }
  }

  openDownloadCsv(fileType) {
    let filter;
    const full_name = this.filteredValues.last_name ? this.filteredValues.last_name : '';
    const user_type = this.filteredValues.user_types ? this.filteredValues.user_types : '';
    const school = this.filteredValues.schools ? this.filteredValues.schools : '';
    const campuses = this.filteredValues.campuses ? this.filteredValues.campuses : '';
    const entity = this.filteredValues.entities ? this.filteredValues.entities : '';
    const user_status = this.filteredValues.user_statuses ? this.filteredValues.user_statuses : '';
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const importStudentTemlate = `downloadUserCSV/`;

    if ((this.dataSelected.length && !this.isCheckedAll) || (this.dataUnselectUser && this.dataUnselectUser.length && this.isCheckedAll)) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      console.log(mappedUserId);
      filter =
        `filter={"user_ids":` +
        `[` +
        mappedUserId.toString() +
        `],"full_name":"` +
        full_name +
        `","user_type":[` +
        (user_type?.length ? `"` + user_type + `"` : '') +
        `],"schools":[` +
        (school?.length ? `"` + school + `"` : '') +
        `],"entities":[` +
        (entity?.length ? `"` + entity + `"` : '') +
        `],"campuses":[` +
        (campuses?.length ? `"` + campuses + `"` : '') +
        `],"user_statuses":[` +
        (user_status?.length ? `"` + user_status + `"` : '') +
        `]}`;
    } else {
      filter =
        `filter={"full_name":"` +
        full_name +
        `","user_type":[` +
        (user_type?.length ? `"` + user_type + `"` : '') +
        `],"schools":[` +
        (school?.length ? `"` + school + `"` : '') +
        `],"entities":[` +
        (entity?.length ? `"` + entity + `"` : '') +
        `],"campuses":[` +
        (campuses?.length ? `"` + campuses + `"` : '') +
        `],"user_statuses":[` +
        (user_status?.length ? `"` + user_status + `"` : '') +
        `]}`;
    }
    const sorting = this.sortingForExport();
    const fullURL =
      url + importStudentTemlate + fileType + '/' + lang + '?' + filter + '&' + sorting + '&user_type_id="' + this.currentUserTypeId + '"';
    console.log('fullUrl', fullURL);
    // // console.log('_fil', filtered);
    // element.href = encodeURI(url + importStudentTemlate + fileType + '/' + lang + '?' + filter);
    // console.log(element.href);
    // element.target = '_blank';
    // element.download = 'User CSV';
    // document.body.appendChild(element);
    // element.click();
    // document.body.removeChild(element);
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
      }),
    };

    this.isWaitingForResponseTop = true;
    this.httpClient.get(`${encodeURI(fullURL)}`, httpOptions).subscribe(
      (res) => {
        if (res) {
          this.isWaitingForResponseTop = false;
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
          this.isWaitingForResponseTop = false;
        }
      },
      (err) => {
        this.isWaitingForResponseTop = false;
        console.log('uat389 error', err);
      },
    );
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
  clearSelectIfFilter() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
    this.allExportForCheckbox = [];
    this.dataUnselectUser = [];
  }

  displayWithSchool(value) {
    if (value && value === 'All') {
      return this.translate.instant('All');
    } else {
      return value;
    }
  }

  displayWithCampus(value) {
    if (value && value === 'All') {
      return this.translate.instant('All');
    } else {
      return value;
    }
  }

  displayWithUserType(value) {
    if (value && value === 'All') {
      return this.translate.instant('All');
    } else {
      return value;
    }
  }
  getFIDataForSendMail(pageNumber, action) {
    if (this.buttonClicked === 'email') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allEmailForCheckbox = [];
          this.dataSelected = [];
          this.allCandidateData = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isWaitingForResponseTop = true;
        const filter = this.cleanFilterData();
        this.subs.sink = this.usersService.getAllUserForEmail(pagination, this.sortValue, filter).subscribe(
          (students: any) => {
            if (students && students.length) {
              const resp = _.cloneDeep(students);
              this.allEmailForCheckbox = _.concat(this.allEmailForCheckbox, resp);
              const page = pageNumber + 1;
              this.getFIDataForSendMail(page, action);
            } else {
              this.isWaitingForResponseTop = false;
              if (this.isCheckedAll && this.allEmailForCheckbox && this.allEmailForCheckbox.length) {
                this.dataSelected = this.allEmailForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                this.allCandidateData = this.allEmailForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                if (this.dataSelected && this.dataSelected.length) {
                  this.sendMultipleEmail();
                }
              }
            }
          },
          (error) => {
            // Record error log
            this.authService.postErrorLog(error);
            this.isWaitingForResponseTop = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translate.instant('OK'),
            });
          },
        );
      } else {
        this.sendMultipleEmail();
      }
    }
  }

  sendMultipleEmail() {
    if (this.dataSelected && this.dataSelected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('User') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      let data;
      if (this.isCheckedAll) {
        data = this.allCandidateData;
      } else {
        data = this.dataSelected;
      }
      if (data) {
        // Mapping data for get only email candidate and the support financial
        data = data.map((res) => {
          const mappedFinancialSuppEmail = [];
          return {
            candidate: {
              email: res.email,
              emailDefault: res.email,
            },

            financial_supp: {
              email: mappedFinancialSuppEmail,
            },
          };
        });
        const dialogRef = this.dialog.open(SendMultipleEmailComponent, {
          disableClose: true,
          width: '750px',
          data: data,
          autoFocus: false,
        });

        dialogRef.afterClosed().subscribe((resulta) => {
          if (resulta) {
            this.clearSelectIfFilter();
            this.getAllUser();
          }
        });
      }
    }
  }

  getAllIdForCheckbox(pageNumber, action) {
    if (this.buttonClicked === 'export') {
      if (this.isCheckedAll) {
        if (this.dataUnselectUser.length < 1) {
          this.csvDownload();
        } else {
          if (pageNumber === 0) {
            this.allExportForCheckbox = [];
            this.dataSelected = [];
            this.allCandidateData = [];
          }
          const pagination = {
            limit: 500,
            page: pageNumber,
          };
          this.isWaitingForResponseTop = true;
          const filter = this.cleanFilterData();
          this.subs.sink = this.usersService.getAllUserForEmail(pagination, this.sortValue, filter).subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allExportForCheckbox = _.concat(this.allExportForCheckbox, resp);
                const page = pageNumber + 1;
                this.getAllIdForCheckbox(page, action);
              } else {
                this.isWaitingForResponseTop = false;
                if (this.isCheckedAll) {
                  if (this.allExportForCheckbox && this.allExportForCheckbox.length) {
                    this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                    this.allCandidateData = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                    this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                    if (this.dataSelected && this.dataSelected.length) {
                      this.csvDownload();
                    }
                  }
                }
              }
            },
            (error) => {
              // Record error log
              this.authService.postErrorLog(error);
              this.isWaitingForResponseTop = false;
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('OK'),
              });
            },
          );
        }
      } else {
        this.csvDownload();
      }
    }
  }

  controllerButton(action) {
    switch (action) {
      case 'email':
        setTimeout(() => {
          this.getFIDataForSendMail(0, 'email');
        }, 500);
        break;
      case 'export':
        setTimeout(() => {
          this.getAllIdForCheckbox(0, 'export');
        }, 500);
        break;
      default:
        this.resetSelection();
    }
  }

  isAllDropdownSelected(type) {
    if (type === 'school') {
      const selected = this.schoolFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.schools.length;
      return isAllSelected;
    } else if (type === 'campuses') {
      const selected = this.campusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.campuses.length;
      return isAllSelected;
    } else if (type === 'userTypes') {
      const selected = this.userTypeFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.userTypeList.length;
      return isAllSelected;
    } else if (type === 'entities') {
      const selected = this.entityFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.entityList.length;
      return isAllSelected;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.statusFilterList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'school') {
      const selected = this.schoolFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.schools.length;
      return isIndeterminate;
    } else if (type === 'campuses') {
      const selected = this.campusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.campuses.length;
      return isIndeterminate;
    } else if (type === 'userTypes') {
      const selected = this.userTypeFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.userTypeList.length;
      return isIndeterminate;
    } else if (type === 'entities') {
      const selected = this.entityFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.entityList.length;
      return isIndeterminate;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.statusFilterList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'school') {
      if (event.checked) {
        const data = this.schools.map((el) => el._id);
        this.schoolFilter.patchValue(data, { emitEvent: false });
      } else {
        this.schoolFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'campuses') {
      if (event.checked) {
        const data = this.campuses.map((el) => el._id);
        this.campusFilter.patchValue(data, { emitEvent: false });
      } else {
        this.campusFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'userTypes') {
      if (event.checked) {
        const data = this.userTypeList.map((el) => el._id);
        this.userTypeFilter.patchValue(data, { emitEvent: false });
      } else {
        this.userTypeFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'entities') {
      if (event.checked) {
        const data = this.entityList.map((el) => el.value);
        this.entityFilter.patchValue(data, { emitEvent: false });
      } else {
        this.entityFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'status') {
      if (event.checked) {
        const data = this.statusFilterList.map((el) => el.value);
        this.statusFilter.patchValue(data, { emitEvent: false });
      } else {
        this.statusFilter.patchValue(null, { emitEvent: false });
      }
    }
  }

  setSchoolsFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.tempSchools) === JSON.stringify(this.schoolFilter.value);
    if (isSame) {
      return;
    } else if (this.schoolFilter.value?.length) {
      this.filteredValues.schools = this.schoolFilter.value;
      this.tempDataFilter.tempSchools = this.schoolFilter.value;
      this.paginator.pageIndex = 0;
      this.getCampusesDropdown(this.schoolFilter.value);
      this.getAllUser();
    } else {
      if (this.tempDataFilter.tempSchools?.length && !this.schoolFilter.value?.length) {
        this.filteredValues.schools = this.schoolFilter.value;
        this.tempDataFilter.tempSchools = null;
        this.paginator.pageIndex = 0;
        this.campuses = [];
        this.getAllUser();
      } else {
        return;
      }
    }
  }

  setCampusesFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.tempCampuses) === JSON.stringify(this.campusFilter.value);
    if (isSame) {
      return;
    } else if (this.campusFilter.value?.length) {
      this.filteredValues.campuses = this.campusFilter.value;
      this.tempDataFilter.tempCampuses = this.campusFilter.value;
      this.paginator.pageIndex = 0;
      this.getAllUser();
    } else {
      if (this.tempDataFilter.tempCampuses?.length && !this.campusFilter.value?.length) {
        this.filteredValues.campuses = this.campusFilter.value;
        this.tempDataFilter.tempCampuses = null;
        this.paginator.pageIndex = 0;
        this.getAllUser();
      } else {
        return;
      }
    }
  }

  setUsertypesFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.tempUserTypes) === JSON.stringify(this.userTypeFilter.value);
    if (isSame) {
      return;
    } else if (this.userTypeFilter.value?.length) {
      this.filteredValues.user_types = this.userTypeFilter.value;
      this.tempDataFilter.tempUserTypes = this.userTypeFilter.value;
      this.paginator.pageIndex = 0;
      this.getAllUser();
    } else {
      if (this.tempDataFilter.tempUserTypes?.length && !this.userTypeFilter.value?.length) {
        this.filteredValues.user_types = this.userTypeFilter.value;
        this.tempDataFilter.tempUserTypes = null;
        this.paginator.pageIndex = 0;
        this.getAllUser();
      } else {
        return;
      }
    }
  }

  setEntityFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.tempEntities) === JSON.stringify(this.entityFilter.value);
    if (isSame) {
      return;
    } else if (this.entityFilter.value?.length) {
      this.filteredValues.entities = this.entityFilter.value;
      this.tempDataFilter.tempEntities = this.entityFilter.value;
      this.paginator.pageIndex = 0;
      this.getAllUser();
    } else {
      if (this.tempDataFilter.tempEntities?.length && !this.entityFilter.value?.length) {
        this.filteredValues.entities = this.entityFilter.value;
        this.tempDataFilter.tempEntities = null;
        this.paginator.pageIndex = 0;
        this.getAllUser();
      } else {
        return;
      }
    }
  }

  setStatusFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.tempUserStatuses) === JSON.stringify(this.statusFilter.value);
    if (isSame) {
      return;
    } else if (this.statusFilter.value?.length) {
      this.filteredValues.user_statuses = this.statusFilter.value;
      this.tempDataFilter.tempUserStatuses = this.statusFilter.value;
      this.paginator.pageIndex = 0;
      this.getAllUser();
    } else {
      if (this.tempDataFilter.tempUserStatuses?.length && !this.statusFilter.value?.length) {
        this.filteredValues.user_statuses = this.statusFilter.value;
        this.tempDataFilter.tempUserStatuses = null;
        this.paginator.pageIndex = 0;
        this.getAllUser();
      } else {
        return;
      }
    }
  }
  
  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter',
        name: 'last_name',
        column: 'Name',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.nameFilter,
        isSelectionInput: false,
        displayKey: null,
        savedValue: null,
        noTranslate: true
      },
      {
        type: 'table_filter',
        name: 'schools',
        column: 'School',
        isMultiple: this.schoolFilter?.value?.length === this.schools?.length ? false : true,
        filterValue: this.schoolFilter?.value?.length === this.schools?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.schoolFilter?.value?.length === this.schools?.length ? null : this.schools,
        filterRef: this.schoolFilter,
        isSelectionInput: this.schoolFilter?.value?.length === this.schools?.length ? false : true,
        displayKey: this.schoolFilter?.value?.length === this.schools?.length ? null : 'short_name',
        savedValue: this.schoolFilter?.value?.length === this.schools?.length ? null : '_id',
      },
      {
        type: 'table_filter',
        name: 'campuses',
        column: 'Campus',
        isMultiple: this.campusFilter?.value?.length === this.campuses?.length ? false : true,
        filterValue: this.campusFilter?.value !== null && this.campusFilter?.value?.length === this.campuses?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.campusFilter?.value?.length === this.campuses?.length ? null : this.campuses,
        filterRef: this.campusFilter,
        isSelectionInput: this.campusFilter?.value?.length === this.campuses?.length ? false : true,
        displayKey: this.campusFilter?.value?.length === this.campuses?.length ? null : 'name',
        savedValue: this.campusFilter?.value?.length === this.campuses?.length ? null : '_id',
      },
      {
        type: 'table_filter',
        name: 'user_types',
        column: 'UserType',
        isMultiple: this.userTypeFilter?.value?.length === this.userTypeList?.length ? false : true,
        filterValue: this.userTypeFilter?.value?.length === this.userTypeList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.userTypeFilter?.value?.length === this.userTypeList?.length ? null : this.userTypeList,
        filterRef: this.userTypeFilter,
        isSelectionInput: this.userTypeFilter?.value?.length === this.userTypeList?.length ? false : true,
        displayKey: this.userTypeFilter?.value?.length === this.userTypeList?.length ? null : 'name_with_entity',
        savedValue: this.userTypeFilter?.value?.length === this.userTypeList?.length ? null : '_id',
      },
      {
        type: 'table_filter',
        name: 'entities',
        column: 'Entity',
        isMultiple: this.entityFilter?.value?.length === this.entityList?.length ? false : true,
        filterValue: this.entityFilter?.value?.length === this.entityList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.entityFilter?.value?.length === this.entityList?.length ? null : this.entityList,
        filterRef: this.entityFilter,
        isSelectionInput: this.entityFilter?.value?.length === this.entityList?.length ? false : true,
        displayKey: this.entityFilter?.value?.length === this.entityList?.length ? null : 'label',
        savedValue: this.entityFilter?.value?.length === this.entityList?.length ? null : 'value',
      },
      {
        type: 'table_filter',
        name: 'user_statuses',
        column: 'Status',
        isMultiple: this.statusFilter?.value?.length === this.statusFilterList?.length ? false : true,
        filterValue: this.statusFilter?.value?.length === this.statusFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.statusFilter?.value?.length === this.statusFilterList?.length ? null : this.statusFilterList,
        filterRef: this.statusFilter,
        isSelectionInput: this.statusFilter?.value?.length === this.statusFilterList?.length ? false : true,
        displayKey: this.statusFilter?.value?.length === this.statusFilterList?.length ? null : 'label',
        savedValue: this.statusFilter?.value?.length === this.statusFilterList?.length ? null : 'value',
      },
    ];

    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
    this.clearSelectIfFilter();
    this.getAllUser();
  }
}
