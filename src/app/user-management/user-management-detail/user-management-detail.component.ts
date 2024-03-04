import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { CoreService } from 'app/service/core/core.service';
import { Observable } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { UsersService } from 'app/service/users/users.service';
import { UserManagementService } from '../user-management.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-user-management-detail',
  templateUrl: './user-management-detail.component.html',
  styleUrls: ['./user-management-detail.component.scss'],
})
export class UserManagementDetailComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  toggleCardList: boolean = false;
  isWaitingForResponse: Boolean = true;
  selectedMentor: any = null;
  selectedAdmissionMember: any = null;
  admissionMemberList = [];
  dataCount = 0;
  private selectedIndex;
  mentorList = [];
  campusList = [];
  schoolsList = [];
  levelList = [];
  listObjective = [];
  levels = [];
  school = [];
  intakeChannelList = [];
  admissionMemberFilteredList: Observable<any>;
  admissionMemberFilter = new UntypedFormControl('');
  mentorFilter = new UntypedFormControl('');
  mentorFilteredList: Observable<any>;
  campusFilter = new UntypedFormControl(null);
  campusFilteredList: any[];
  schoolFilter = new UntypedFormControl(null);
  schoolsFilteredList: any[];
  userFilter = new UntypedFormControl('');
  intakeChannelFilter = new UntypedFormControl('');
  intakeChannelFilteredList: Observable<any>;
  searchByNameFilter = new UntypedFormControl('');
  myInnerHeight = 1920;
  currSelectedUserId = '';
  currSelectedUser: any;
  userList = [];
  tab = '';
  filteredValues = {
    last_name: null,
    school: null,
    campus: null,
    title: null,
    user_type: null,
    entity: null,
    user_status: null,
    isForTeacherCard: null,
  };
  isFirstLoad = true;
  isReset = false;
  sortValue = null;
  private subs = new SubSink();
  maleCandidateIcon = '../../../../../assets/img/student_icon.png';
  femaleCandidateIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  userProfilePic = '../../../../../assets/img/user-1.jpg';
  userProfilePic1 = '../../../../../assets/img/user-3.jpg';
  userProfilePic2 = '../../../../../assets/img/user-5.jpg';
  greenHeartIcon = '../../../../../assets/img/enagement_icon_green.png';
  isPermission: any;
  currentUser: any;
  currentUserTypeId: any;

  isUserList = false;
  isTeacherList = false;

  backupUserParam: any;
  userIdFromTable: any;

  constructor(
    private route: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private translate: TranslateService,
    private coreService: CoreService,
    private usersService: UsersService,
    private userMgtService: UserManagementService,
    private userService: AuthService,
  ) {}

  ngOnInit() {
    this.isPermission = this.userService.getPermission();
    this.currentUser = this.userService.getLocalStorageUser();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.route.queryParams.subscribe((query) => {
      this.sortValue = query.sortValue || null;
      // const pagination = JSON.parse(query.paginator);
      // this.paginator = Object.assign(this.paginator, pagination);
      // this.filteredValues = JSON.parse(query.filteredValues);
      this.tab = query.tab;

      let urlList;
      this.route.url.subscribe((url) => {
        urlList = url[0].path;
      });

      if (urlList === 'teacher-list') {
        this.isTeacherList = true;
      } else {
        this.isUserList = true;
      }

      if (query.user) {
        // if param includes a user Id, fetch that single user first
        this.getOneUser(query.user);
      } else if (query.teacherId) {
        this.getOneUser(query.teacherId);
      } else {
        this.getAllUsers();
      }

      this.updatePageTitle();
      this.initFilter();
      this.getDataForList();

      this.coreService.sidenavOpen = false;
    });
  }

  updatePageTitle() {
    const cardTitle = this.isTeacherList ? 'Teacher Card' : 'User Card';
    this.pageTitleService.setTitle(this.translate.instant(cardTitle));
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(this.translate.instant(cardTitle));
    });
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        tap(() => {
          if (!this.isFirstLoad) {
            this.getAllUsers();
          }
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  // *************** To Get Height window screen and put in style css height
  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 231;
    return this.myInnerHeight
  }
  // *************** To Get Height window screen and put in style css height
  getCardHeight() {
    this.myInnerHeight = window.innerHeight - 263;
    return this.myInnerHeight
  }

  initFilter() {
    this.subs.sink = this.schoolFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.campus = '';
      this.filteredValues.school = statusSearch === '' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAllUsers();
      }
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.campus = statusSearch === '' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAllUsers();
      }
    });

    this.subs.sink = this.userFilter.valueChanges.pipe(debounceTime(400)).subscribe((searchTxt) => {
      if (searchTxt === '') {
        this.filteredValues.last_name = '';
        this.getAllUsers();
      } else {
        this.filteredValues.last_name = searchTxt === 'All' ? '' : searchTxt;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllUsers();
        }
      }
    });
  }

  getOneUser(userId: string) {
    this.isWaitingForResponse = true;
    if(userId) {
      this.userIdFromTable = userId
      this.currSelectedUserId = userId
    }
    this.subs.sink = this.usersService.getOneUserForCardList(userId).subscribe(
      (user) => {
        this.isWaitingForResponse = false;
        this.userList.unshift(user);
        this.backupUserParam = user;
        this.getAllUsers(true);
      },
      (err) => {
        // Record error log
        this.userService.postErrorLog(err);
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

  // Get candidate data
  getAllUsers(queryParamHasUserId: boolean = false) {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    const filterAsString = this.getStringFormatOfFilteredValue();
    const superFilterData = {
      school: _.cloneDeep(this.filteredValues.school),
      campus: _.cloneDeep(this.filteredValues.campus),
      last_name: _.cloneDeep(this.filteredValues.last_name),
    }
    const isFiltered = Object.keys(superFilterData).filter(key => superFilterData[key])?.length ? true : false;
    this.subs.sink = this.usersService.getAllUserForCardList(pagination, this.sortValue, filterAsString).subscribe(
      (users: any) => {
        if (users && users.length) {
          if (queryParamHasUserId) {
            this.userList.push(users); // this will be in the form of [{}, []]
            this.userList = [].concat(...this.userList); // flatten array above with the user data fetched from param
          } else {
            this.userList = _.cloneDeep(users);
          }
          if (isFiltered && superFilterData?.last_name) { // check if last name filter is filtered, then select the first result
            this.currSelectedUserId = this.userList[0]?._id
          }
           // if the pagination index is 0, and the page is not filtered, then unshift the user data from table and select it
          if (this.paginator?.pageIndex === 0 && this.backupUserParam && !isFiltered) {
            if (this.userList[0]?._id !== this.backupUserParam?._id) {
              this.userList.unshift(this.backupUserParam)
            }
            if (this.currSelectedUserId === this.userIdFromTable) {
              this.currSelectedUser = this.userList[0];
              this.currSelectedUserId = this.currSelectedUser?._id || null;
            }
          }
          if (this.paginator?.pageIndex > 0) {
            this.userList = this.userList.filter(user => user?._id !== this.backupUserParam?._id)  // prevent displaying duplicates on pagination index greater than 0
          }
          this.userList = _.uniqBy([...this.userList], '_id'); // make it unique by id to prevent displaying duplicates
          this.paginator.length = users[0].count_document;
          this.dataCount = users && users.length > 0 && users[0].count_document ? users[0].count_document : 0;
        } else {
          this.userList = [];
          this.paginator.length = 0;
        }
        this.isFirstLoad = false;
        this.isReset = false;
        this.isWaitingForResponse = false;
      },
      (err) => {
        // Record error log
        this.userService.postErrorLog(err);
        this.isWaitingForResponse = false;
        this.userList = [];
        this.paginator.length = 0;
        this.isReset = false;
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

  getStringFormatOfFilteredValue(): string {
    if (this.isTeacherList) {
      this.filteredValues.entity = 'academic';
      this.filteredValues.user_type = ['61dd3ccff647127fd6bf65d7'];
      this.filteredValues.isForTeacherCard = true;
    }
    let filter = ``;
    filter += this.filteredValues.last_name ? `last_name : "${this.filteredValues.last_name}"` : '';
    filter += this.filteredValues.user_type ? `user_type: "${this.filteredValues.user_type}"` : '';
    filter += this.filteredValues.school ? `school: "${this.filteredValues.school}"` : '';
    filter += this.filteredValues.campus ? `campuses: ["${this.filteredValues.campus}"]` : '';
    filter += this.filteredValues.title ? `title: "${this.filteredValues.title}"` : '';
    filter += this.filteredValues.entity ? `entity: ${this.filteredValues.entity}` : '';
    filter += this.filteredValues.user_status ? ` user_status: ${this.filteredValues.user_status}` : '';
    filter += this.filteredValues.isForTeacherCard ? ` isForTeacherCard: ${this.filteredValues.isForTeacherCard}` : '';

    return filter;
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  updatedSelectedUser(newSelection) {
    this.currSelectedUserId = null;
    this.currSelectedUserId = newSelection;
    const filteredUser = this.userList.filter((user) => newSelection === user._id);
    this.currSelectedUser = filteredUser[0];
  }

  resetUsers() {
    this.isReset = true;
    this.paginator.pageIndex = 0;

    this.levels = [];
    this.campusList = [];
    this.filteredValues = {
      last_name: null,
      school: null,
      campus: null,
      title: null,
      user_type: this.isTeacherList ? ['61dd3ccff647127fd6bf65d7'] : null,
      entity: this.isTeacherList ? 'academic' : null,
      isForTeacherCard: this.isTeacherList ? true : null,
      user_status: null,
    };
    this.userFilter.setValue('', { emitEvent: false });
    this.schoolFilter.setValue(null, { emitEvent: false });
    this.campusFilter.setValue(null, { emitEvent: false });
    this.sortValue = null;
    this.getAllUsers();
  }

  reload(value) {
    if (value) {
      this.getAllUsers();
    }
  }

  loadingCommentTab(value) {
    this.isWaitingForResponse = value;
  }

  getDataForList(data?) {
    const name = data ? data : '';
    const filter = 'filter: { scholar_season_id:' + `"${name}"` + '}';
    this.subs.sink = this.userMgtService.GetAllSchoolFilter(filter, this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp) {
          this.listObjective = resp;
          this.school = this.listObjective;
          if (resp?.length) {
            this.school = this.school.sort((a, b) => a.short_name.localeCompare(b.short_name))
          }
          this.getDataCampus();
        }
      },
      (err) => {
        // Record error log
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

  getDataCampus() {
    this.levels = [];
    this.campusList = [];
    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.schoolFilter.value) {
      const school = this.schoolFilter.value;
      const scampusList = this.listObjective.filter((list) => {
        return school.includes(list._id);
      });
      scampusList.filter((campus, n) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses, nex) => {
            this.campusList.push(campuses);
          });
        }
      });
    } else {
      this.campusList = [];
    }

    this.campusList = _.uniqBy(this.campusList, 'name');
    if (this.campusList?.length) {
      this.campusList = this.campusList.sort((a, b) => a.name.localeCompare(b.name))
    }
  }
  

  // getDataLevel() {
  //   this.levels = [];
  //   if (this.levelFilter.value) {
  //     this.levelFilter.setValue(null);
  //   }
  //   const sCampus = this.campusFilter.value;
  //   if (this.campusFilter.value) {
  //     const sLevelList = this.campusList.filter((list) => {
  //       return sCampus.includes(list._id);
  //     });
  //     sLevelList.forEach((element) => {
  //       if (element && element.levels && element.levels.length) {
  //         element.levels.forEach((level) => {
  //           this.levels.push(level);
  //         });
  //       }
  //     });
  //   } else {
  //     this.levels = [];
  //   }
  //   this.levels = _.uniqBy(this.levels, 'name');
  // }

  // getDataByLevel() {
  //   this.levels = _.uniqBy(this.levels, 'name');
  // }
}
