import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { AddNewUserDialogComponent } from './add-new-user-dialog/add-new-user-dialog.component';
import Swal from 'sweetalert2';
import { UtilityService } from 'app/service/utility/utility.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { UserService } from 'app/service/user/user.service';
import { LoginAsUserDialogComponent } from 'app/shared/components/login-as-user-dialog/login-as-user-dialog.component';
import { UserEmailDialogComponent } from 'app/users/user-email-dialog/user-email-dialog.component';
import { UsersService } from 'app/service/users/users.service';
import * as moment from 'moment';
import { ExportCsvService } from 'app/service/export-csv/export-csv.service';

@Component({
  selector: 'ms-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.scss'],
})
export class UsersTableComponent implements OnInit, AfterViewInit, OnDestroy {
  private subs = new SubSink();

  // Table Configuration
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  disabledExport = true;
  isLoading = false;
  selectType: any;
  dataCount = 0;
  noData;
  sortValue = null;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  userSelected: any[];
  userSelectedId: any[];
  isCheckedAll = false;
  maleIcon = '../../../../../assets/img/student_icon.png';
  femaleIcon = '../../../../../assets/img/student_icon_fem.png';

  displayedColumns: string[] = ['select', 'name', 'programs', 'usertype', 'status', 'action'];
  filterColumns: string[] = ['selectFilter', 'nameFilter', 'programsFilter', 'usertypeFilter', 'statusFilter', 'actionFilter'];

  programsFilterCtrl = new UntypedFormControl('');
  nameFilter = new UntypedFormControl('');
  programsListFilter: Observable<any[]>;
  programsList = [];

  filteredValues = {
    name: '',
    program: '',
  };

  schoolsFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  levelFilter = new UntypedFormControl(null);
  listObjective: any[];
  school: any;
  levels: any[];
  campusList: any[];
  schoolName = '';

  private timeOutVal: any;
  private intVal: any;
  mailUser: MatDialogRef<UserEmailDialogComponent>;
  currentUser: any;
  isPermission: string[];
  userTypeLoginId: any;

  exportName: string;
  last_name: string;
  programs = null;
  allUserData: any = [];

  schoolFilterName = [];
  isMemberCompany = false;
  entityList: any;
  currentUserTypeId: any;

  constructor(
    private usersService: UsersService,
    private translate: TranslateService,
    private pageTitleService: PageTitleService,
    private candidatesService: CandidatesService,
    private dialog: MatDialog,
    private utilService: UtilityService,
    private authService: AuthService,
    public permissionService: PermissionService,
    private route: ActivatedRoute,
    private ngxPermissionService: NgxPermissionsService,
    private router: Router,
    private userService: UserService,
    private exportCsvService: ExportCsvService,
  ) {}

  ngOnInit() {
    this.isMemberCompany = !!this.ngxPermissionService.getPermission('Company Relation Member');
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    if (this.isPermission && this.isPermission.length) {
      if (this.currentUser && this.currentUser.entities && this.currentUser.entities.length) {
        this.entityList = this.currentUser.entities.filter((resp) => resp.type && resp.type.name === this.isPermission[0]);
      }
    }
    if (this.isPermission && this.isPermission.length) {
      if (this.currentUser && this.currentUser.entities && this.currentUser.entities.length) {
        this.userTypeLoginId = this.currentUser.entities.find((resp) => resp.type && resp.type.name === this.isPermission[0]);
      }
    }

    // console.log('this.isPermission', this.userTypeLoginId);

    this.getDataForList();
    this.initFilter();
    this.getDataUsers();
    this.getProgramsDropdown();
  }

  getProgramsDropdown() {
    this.subs.sink = this.candidatesService.getAllProgramsDropdown().subscribe(
      (res) => {
        if (res) {
          // console.log('_res pro', res);
          this.programsList = _.uniqBy(res);
          this.programsListFilter = this.programsFilterCtrl.valueChanges.pipe(
            startWith(''),
            map((searchText) =>
              this.programsList
                .filter((program) => (program ? program.toLowerCase().includes(searchText.toLowerCase()) : false))
                .sort((a: any, b: any) => a.localeCompare(b)),
            ),
          );
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

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getDataUsers();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getDataUsers() {
    this.isLoading = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const candidateSchool = this.userTypeLoginId.school;
    if (this.isMemberCompany) {
      const userTypes = ['617f64ec5a48fe2228518815'];
      let schoolList = this.entityList.map((list) => list.school);
      let campusList = this.entityList.map((list) => list.campus);
      let levelList = this.entityList.map((list) => list.level);
      schoolList = this.schoolFilterName && this.schoolFilterName.length ? schoolList.concat(this.schoolFilterName) : schoolList;
      campusList = this.campusFilter.value && this.campusFilter.value.length ? campusList.concat(this.campusFilter.value) : campusList;
      levelList = this.levelFilter.value && this.levelFilter.value.length ? levelList.concat(this.levelFilter.value) : levelList;
      schoolList = _.uniqBy(schoolList);
      campusList = _.uniqBy(campusList);
      levelList = _.uniqBy(levelList);
      this.subs.sink = this.candidatesService
        .GetAllUsersCRM(
          userTypes,
          pagination,
          this.last_name,
          this.sortValue,
          candidateSchool,
          this.programs,
          schoolList,
          campusList,
          levelList,
        )
        .subscribe(
          (res) => {
            if (res) {
              const programData = this.getPrograms(res);
              this.dataSource.data = _.cloneDeep(programData);
              this.dataCount = res && res.length > 0 && res[0].count_document ? res[0].count_document : 0;
              // this.programsList = _.uniqBy(this.programsList);
              // this.programsListFilter = this.programsFilterCtrl.valueChanges.pipe(
              //   startWith(''),
              //   map((searchText) =>
              //     this.programsList
              //       .filter((program) => (program ? program.toLowerCase().includes(searchText.toLowerCase()) : false))
              //       .sort((a: any, b: any) => a.localeCompare(b)),
              //   ),
              // );
            }
            this.noData = this.dataSource.connect().pipe(map((data) => data.length === 0));
            this.isReset = false;
            this.isLoading = false;
          },
          (err) => {
            this.dataSource.data = [];
            this.dataCount = 0;
            this.dataSource.paginator = this.paginator;
            this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
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
            this.isLoading = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
    } else {
      const userTypes = ['617f64ec5a48fe2228518815', '617f64ec5a48fe2228518814'];
      this.subs.sink = this.candidatesService
        .GetAllUsersCRM(
          userTypes,
          pagination,
          this.last_name,
          this.sortValue,
          candidateSchool,
          this.programs,
          this.schoolFilterName,
          this.campusFilter.value,
          this.levelFilter.value,
        )
        .subscribe(
          (res) => {
            if (res) {
              const programData = this.getPrograms(res);
              this.dataSource.data = _.cloneDeep(programData);
              this.dataCount = res && res.length > 0 && res[0].count_document ? res[0].count_document : 0;
              // this.programsList = _.uniqBy(this.programsList);
              // this.programsListFilter = this.programsFilterCtrl.valueChanges.pipe(
              //   startWith(''),
              //   map((searchText) =>
              //     this.programsList
              //       .filter((program) => (program ? program.toLowerCase().includes(searchText.toLowerCase()) : false))
              //       .sort((a: any, b: any) => a.localeCompare(b)),
              //   ),
              // );
            }
            this.noData = this.dataSource.connect().pipe(map((data) => data.length === 0));
            this.isReset = false;
            this.isLoading = false;
          },
          (err) => {
            this.dataSource.data = [];
            this.dataCount = 0;
            this.dataSource.paginator = this.paginator;
            this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
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
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
    }
  }

  connectAsUser(user) {
    const currentUser = this.utilService.getCurrentUser();
    const unixUserType = _.uniqBy(user.entities, 'type.name');
    const unixEntities = _.uniqBy(user.entities, 'entity_name');
    let unixSchoolType = [];
    let unixSchool = [];
    if (unixEntities && unixEntities.length && unixEntities[0].entity_name === 'academic') {
      unixSchoolType = _.uniqBy(user.entities, 'school_type');
      unixSchool = _.uniqBy(user.entities, 'school._id');
    }
    this.getUserTableColumnSettings(user?._id)
    // console.log('unixEntities =>', unixEntities, unixUserType);
    // if (user.entities && unixEntities.length === 1 && unixSchoolType.length <= 1 && unixSchool.length <= 1 && unixUserType.length === 1) {
    this.subs.sink = this.authService.loginAsUser(currentUser._id, user._id).subscribe(
      (resp) => {
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

            this.authService.setLocalUserProfileAndToken(tempResp);
            this.authService.setPermission([sortedEntities[0].type.name]);
            this.ngxPermissionService.flushPermissions();
            this.ngxPermissionService.loadPermissions([sortedEntities[0].type.name]);
            this.userService.reloadCurrentUser(true);
            this.router.navigate(['/dashboard-register']);
          });
        }
      },
      (err) => {
        this.isLoading = false;
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
    //   this.dialog.open(LoginAsUserDialogComponent, {
    //     disableClose: true,
    //     panelClass: 'certification-rule-pop-up',
    //     width: '615px',
    //     data: user,
    //   });
    // }
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
  openAddNewUser() {
    const dialog = this.dialog.open(AddNewUserDialogComponent, {
      panelClass: 'certification-rule-pop-up',
      width: '625px',
      disableClose: true,
    });
    dialog.afterClosed().subscribe((res) => {
      // console.log(res);
      if (res) {
        this.getDataUsers();
      }
    });
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataUsers();
      }
    }
  }

  getPrograms(dataUsers) {
    const result = dataUsers.map((res) => {
      const listProgram = [];
      const listUserType = [];
      if (res.entities && res.entities.length > 0) {
        res.entities.forEach((element) => {
          const school = '';
          const campus = '';
          const level = '';
          const program = '';
          let userType = '';
          // program = this.checkProgram(element, campus, school, level, program);
          userType = this.checkUserType(element, userType);
          if (program) {
            this.programsList.push(program);
            listProgram.push(program);
          }
          if (userType) {
            listUserType.push(userType);
          }
        });
      }
      res['ListUser'] = _.uniqBy(listUserType);
      res.programs = _.uniqBy(res.programs);
      // res['ListProgram'] = listProgram;
      return res;
    });
    return result;
  }

  checkUserType(element, userType) {
    if (element.type) {
      if (element.type._id === '617f64ec5a48fe2228518814' || element.type._id === '617f64ec5a48fe2228518815') {
        userType = element.type.name;
      }
    }
    return userType;
  }

  checkProgram(element, campus, school, level, program) {
    if (element.campus) {
      campus = element.campus.slice(0, 3).toUpperCase();
    }
    if (element.school) {
      school = element.school.slice(0, 3).toUpperCase();
    }
    if (element.level) {
      level = element.level;
    }
    if (school) {
      program = school;
    }
    if (campus) {
      program = program + campus;
    }
    if (level) {
      program = program + ' ' + level;
    }
    return program;
  }

  initFilter() {
    this.subs.sink = this.nameFilter.valueChanges.subscribe((searchTxt) => {
      if (searchTxt) {
        this.last_name = searchTxt;
        this.getDataUsers();
      } else {
        this.last_name = '';
        this.getDataUsers();
      }
    });
  }

  resetFilter() {
    this.isReset = true;
    this.disabledExport = true;
    this.selection.clear();
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });

    this.programs = null;
    this.nameFilter.setValue('');
    this.programsFilterCtrl.setValue('');
    this.schoolsFilter.setValue(null);
    this.campusFilter.setValue(null);
    this.levelFilter.setValue(null);
    this.schoolFilterName = null;
    this.isReset = true;
    this.sort.direction = '';
    this.sort.active = '';
    this.paginator.pageIndex = 0;
    this.getDataUsers();
  }

  typeProgram(program) {
    const programs = [];
    this.programs = programs;
    if (program) {
      if (program !== 'AllS') {
        programs.push(program);
        this.programs = programs;
        this.getDataUsers();
      } else {
        this.programs = null;
        this.getDataUsers();
      }
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.isCheckedAll = false;
    } else {
      this.isCheckedAll = true;
      this.dataSource.data.forEach((row) => this.selection.select(row));
    }
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
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
    this.isLoading = true;
    this.subs.sink = this.usersService.sendReminderUserN1(this.translate.currentLang, data._id, this.currentUserTypeId).subscribe(
      (resp) => {
        this.isLoading = false;
        // console.log(resp);
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo !'),
          text: this.translate.instant('Email Sent'),
        });
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
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
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
            this.getDataUsers();
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

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  editUser(res) {
    window.open(`./internship/users/details/${res._id}?last_name=${res.last_name}`, '_blank');
  }
  sendMail(data) {
    this.mailUser = this.dialog.open(UserEmailDialogComponent, {
      disableClose: true,
      width: '750px',
      data: data,
    });
  }

  deactiveUser(userId: string, civility: string, firstName: string, lastName: string) {
    let timeDisabled = 3;
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
        this.subs.sink = this.userService.deleteUser(userId).subscribe((resp) => {
          if (resp) {
            if (!resp.errors) {
              Swal.fire({
                allowOutsideClick: false,
                confirmButtonText: this.translate.instant('OK'),
                type: 'success',
                title: this.translate.instant('DELETE_USER.SUCCESS_TITLE'),
                text: this.translate.instant('DELETE_USER.SUCCESS_TEXT'),
              });
              this.getDataUsers();
            } else if (resp.errors && resp.errors[0] && resp.errors[0].message === 'the mentor is already used in student contract') {
              Swal.fire({
                allowOutsideClick: false,
                confirmButtonText: this.translate.instant('DeleteMent_S1.BUTTON'),
                type: 'info',
                title: this.translate.instant('DeleteMent_S1.TITLE'),
                text: this.translate.instant('DeleteMent_S1.TEXT'),
              });
              this.getDataUsers();
            } else if (resp.errors && resp.errors[0] && resp.errors[0].message === 'user should transfer the responsibility first') {
              Swal.fire({
                allowOutsideClick: false,
                confirmButtonText: this.translate.instant('DeleteTypeUser.Btn-Confirm'),
                type: 'info',
                title: this.translate.instant('DeleteTypeUser.Title'),
                text: this.translate.instant('DeleteTypeUser.Body'),
              });
              this.getDataUsers();
            } else if (resp.errors && resp.errors[0] && resp.errors[0].message === 'user still have todo tasks') {
              Swal.fire({
                allowOutsideClick: false,
                confirmButtonText: this.translate.instant('DeleteUserTodo.Btn-Confirm'),
                type: 'warning',
                title: this.translate.instant('DeleteUserTodo.Title'),
                text: this.translate.instant('DeleteUserTodo.Body'),
              });
              this.getDataUsers();
            } else if (resp.errors && resp.errors[0] && resp.errors[0].message) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text:
                  resp.errors && resp.errors[0]['message']
                    ? this.translate.instant(resp.errors[0]['message'].replaceAll('GraphQL error: ', ''))
                    : resp.errors[0].message,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            }
          }
        });
      }
    });
  }
  showOptions(info) {
    const numSelected = this.selection.selected.length;
    if (numSelected > 0) {
      this.disabledExport = false;
    } else {
      this.disabledExport = true;
    }
    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = info;
    const data = this.selection.selected;
    data.forEach((user) => {
      this.userSelected.push(user);
      this.userSelectedId.push(user._id);
    });
  }

  getDataForList() {
    const name = '';
    this.subs.sink = this.candidatesService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp) {
          // console.log('Data Import => ', resp);
          this.listObjective = resp;
          this.school = this.listObjective;
          this.getDataCampus();
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
  getDataCampus() {
    this.levels = [];
    this.campusList = [];
    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.schoolsFilter.value) {
      const school = this.schoolsFilter.value;
      const scampusList = this.listObjective.filter((list) => {
        return school.includes(list._id);
      });
      const listSelectedSchool = _.cloneDeep(scampusList);
      this.schoolFilterName = listSelectedSchool.map((res) => res.short_name);

      this.schoolName = scampusList && scampusList.length ? scampusList[0].short_name : '';
      scampusList.filter((campus, n) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses, nex) => {
            this.campusList.push(campuses);
          });
        }
      });
      this.getDataLevel();
    } else {
      this.listObjective.filter((campus, n) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses, nex) => {
            this.campusList.push(campuses);
          });
        }
      });
      this.getDataLevel();
    }
    this.campusList = _.uniqBy(this.campusList, 'name');
    this.getDataUsers();
  }

  getDataLevel() {
    this.levels = [];
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    const sCampus = this.campusFilter.value;
    if (this.campusFilter.value) {
      const sLevelList = this.campusList.filter((list) => {
        return sCampus.includes(list.name);
      });
      sLevelList.forEach((element) => {
        element.levels.forEach((level) => {
          this.levels.push(level);
        });
      });
    } else {
      this.campusList.forEach((element) => {
        element.levels.forEach((level) => {
          this.levels.push(level);
        });
      });
    }
    this.levels = _.uniqBy(this.levels, 'name');
    this.getDataUsers();
  }

  getDataByLevel() {
    this.levels = _.uniqBy(this.levels, 'name');
    this.getDataUsers();
  }

  renderTooltipEntity(entities: any[]): string {
    if (entities) {
      let tooltip = '';
      let count = 0;
      for (const entity of entities) {
        count++;
        if (count > 1) {
          if (entity) {
            tooltip = tooltip + ', ';
            tooltip = tooltip + entity;
          }
        } else {
          if (entity) {
            tooltip = tooltip + entity;
          }
        }
      }
      return tooltip;
    } else {
      return;
    }
  }

  renderTooltipEntityUserType(entities: any[]): string {
    if (entities) {
      let tooltip = '';
      let count = 0;
      for (const entity of entities) {
        count++;
        if (count > 1) {
          if (entity) {
            tooltip = tooltip + ', ';
            tooltip = tooltip + this.translate.instant('USER_TYPES.' + entity);
          }
        } else {
          if (entity) {
            tooltip = tooltip + this.translate.instant('USER_TYPES.' + entity);
          }
        }
      }
      return tooltip;
    } else {
      return;
    }
  }

  onDataExport() {
    console.log('_pilih', this.selectType);

    if (this.selectType === 'one') {
      const data = [];
      if (this.selection.selected.length) {
        console.log('selection', this.selection.selected);
        for (const user of this.selection.selected) {
          const obj = [];
          let usertypes = '';
          let programs = '';
          const userName = user._id
            ? (user.civility ? user.civility : '') +
              ' ' +
              (user.last_name ? user.last_name : '') +
              ' ' +
              (user.first_name ? user.first_name : '')
            : '-';
          for (const userType of user.ListUser) {
            usertypes = usertypes
              ? usertypes + ', ' + (userType ? this.translate.instant('USER_TYPES.' + userType) : '')
              : userType
              ? this.translate.instant('USER_TYPES.' + userType)
              : '';
          }
          if (user.programs) {
            for (const program of user.programs) {
              programs = programs ? programs + ', ' + (program ? program : '') : program ? program : '';
            }
          } else {
            programs = '';
          }
          obj[0] = userName;
          obj[1] = programs;
          obj[2] = usertypes;
          obj[3] = user.user_status ? this.translate.instant(user.user_status) : '';
          data.push(obj);
        }
        console.log('data', data);
        const valueRange = { values: data };
        const today = moment().format('DD-MM-YYYY');
        const sheetID = this.translate.currentLang === 'en' ? 0 : 1999359591;
        const title = this.exportName + '_' + today;
        const sheetData = {
          spreadsheetId: '1bRopxI3PEEpnNE1UVq5qkpIwldOhLdPylBy9dUb1xsw',
          sheetId: sheetID,
          range: 'A7',
        };
        this.exportCsvService.createAndUpdateSpreadsheet(valueRange, title, sheetData);
      }
      Swal.close();
    } else {
      this.getAllExportData(0);
    }
  }

  getAllExportData(pageNumber: number) {
    this.isLoading = true;
    const pagination = {
      limit: 500,
      page: pageNumber,
    };
    const userTypes = ['617f64ec5a48fe2228518815', '617f64ec5a48fe2228518814'];
    const candidateSchool = this.userTypeLoginId.candidate_school;
    this.subs.sink = this.candidatesService
      .GetAllUsersCRM(userTypes, pagination, this.last_name, this.sortValue, candidateSchool, this.programs)
      .subscribe(
        (res) => {
          if (res && res.length) {
            this.allUserData.push(...res);
            const pages = pageNumber + 1;
            // console.log(this.allUserData);

            this.getAllExportData(pages);
          } else {
            this.isLoading = false;
            this.exportAllData(this.allUserData);
          }
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
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }

  exportAllData(exportData) {
    const datasForExport = _.uniqBy(exportData, '_id');
    const data = [];
    if (datasForExport && datasForExport.length) {
      console.log('selection', datasForExport);
      for (const user of datasForExport) {
        const obj = [];
        let usertypes = '';
        let programs = '';
        const userName = user._id
          ? (user.civility ? user.civility : '') +
            ' ' +
            (user.last_name ? user.last_name : '') +
            ' ' +
            (user.first_name ? user.first_name : '')
          : '-';
        let listUserType = [];
        for (const userType of user.entities) {
          listUserType.push(userType.type.name);
        }
        listUserType = _.uniqBy(listUserType);
        for (const type of listUserType) {
          usertypes = usertypes
            ? usertypes + ', ' + (type ? this.translate.instant('USER_TYPES.' + type) : '')
            : type
            ? this.translate.instant('USER_TYPES.' + type)
            : '';
        }
        if (user.programs) {
          for (const program of user.programs) {
            programs = programs ? programs + ', ' + (program ? program : '') : program ? program : '';
          }
        } else {
          programs = '';
        }
        obj[0] = userName;
        obj[1] = programs;
        obj[2] = usertypes;
        obj[3] = user.user_status ? this.translate.instant(user.user_status) : '';
        data.push(obj);
      }
      console.log('data', data);
      const valueRange = { values: data };
      const today = moment().format('DD-MM-YYYY');
      const sheetID = this.translate.currentLang === 'en' ? 0 : 1999359591;
      const title = this.exportName + '_' + today;
      const sheetData = {
        spreadsheetId: '1bRopxI3PEEpnNE1UVq5qkpIwldOhLdPylBy9dUb1xsw',
        sheetId: sheetID,
        range: 'A7',
      };
      this.exportCsvService.createAndUpdateSpreadsheet(valueRange, title, sheetData);
    }
    Swal.close();
  }
}
