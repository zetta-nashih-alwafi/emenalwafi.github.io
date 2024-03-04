import { startWith, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserService } from './../../../service/user/user.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { UtilityService } from './../../../service/utility/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from './../../../service/auth-service/auth.service';
import { Component, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { LoginAsUserDialogComponent } from 'app/shared/components/login-as-user-dialog/login-as-user-dialog.component';
import { PermissionService } from 'app/service/permission/permission.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'environments/environment';

@Component({
  selector: 'ms-quick-search-list-dialog',
  templateUrl: './quick-search-list-dialog.component.html',
  styleUrls: ['./quick-search-list-dialog.component.scss'],
})
export class QuickSearchListDialogComponent implements OnInit, AfterViewInit {
  private subs = new SubSink();
  dataSource = new MatTableDataSource([]);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = [];
  filterColumns: string[] = [];

  groupCount = 0;
  noData: any;

  sortValue = null;
  isReset = false;
  dataLoaded = false;
  isWaitingForResponse = false;
  isEdit = false;
  isConnect = false;

  isADMTC = false;
  isAcadDirAdmin = false;
  currentUser;
  studentSafeUrl: SafeResourceUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<QuickSearchListDialogComponent>,
    private translate: TranslateService,
    private authService: AuthService,
    public dialog: MatDialog,
    private utilService: UtilityService,
    private ngxPermissionService: NgxPermissionsService,
    private userService: UserService,
    private router: Router,
    public permissionService: PermissionService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.studentSafeUrl = this.safeUrl();
    if (this.data && this.data.data && this.data.data.length) {
      console.log('ini this data', this.data);
      if (this.data.type === 'user') {
        this.displayedColumns = ['lastName', 'firstName', 'userType', 'school', 'action'];
        this.filterColumns = ['lastNameFilter', 'firstNameFilter', 'userTypeFilter', 'schoolFilter', 'actionFilter'];
      } else if (this.data.type === 'teacher') {
        this.displayedColumns = ['lastName', 'firstName', 'school', 'action'];
        this.filterColumns = ['lastNameFilter', 'firstNameFilter', 'schoolFilter', 'actionFilter'];
      } else if (this.data.type === 'student') {
        this.displayedColumns = ['lastName', 'firstName', 'school', 'action'];
        this.filterColumns = ['lastNameFilter', 'firstNameFilter', 'schoolFilter', 'actionFilter'];
      } else if (this.data.type === 'mentor') {
        this.displayedColumns = ['lastName', 'firstName', 'company', 'action'];
        this.filterColumns = ['lastNameFilter', 'firstNameFilter', 'companyFilter', 'actionFilter'];
      } else if (this.data.type === 'tag') {
        this.displayedColumns = ['lastName', 'firstName', 'school', 'tag', 'action'];
        this.filterColumns = ['lastNameFilter', 'firstNameFilter', 'schoolFilter', 'tagFilter', 'actionFilter'];
      } else if (this.data.type === 'email' && this.data.data.length) {
        this.displayedColumns = ['lastName', 'firstName', 'userType', 'school', 'action'];
        this.filterColumns = ['lastNameFilter', 'firstNameFilter', 'userTypeFilter', 'schoolFilter', 'actionFilter'];
      } else {
        this.displayedColumns = ['school', 'action'];
        this.filterColumns = ['schoolFilter', 'actionFilter'];
      }
      if (this.data?.type === 'email') {
        this.getDataQuickSearchEmail();
      } else {
        this.dataSource.data = this.data.data;
        this.dataSource.paginator = this.paginator;
        this.groupCount = this.data.data.length;
      }
    }

    console.log('TEST', this.data);
  }
  getDataQuickSearchEmail() {
    const pagination = {
      limit: this.paginator?.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator?.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.isWaitingForResponse = true;
    const email = this.data?.filter?.email ? this.data.filter.email : null;
    const school = this.data?.filter?.schools ? this.data.filter.schools : null;
    const usertype = this.data?.filter?.user_type ? this.data.filter.user_type : null;
    this.subs.sink = this.userService.getQuickSearchEmail(email, school, usertype, pagination).subscribe((resp) => {
      if (resp?.length) {
        const temp = _.cloneDeep(resp);
        const dataEmail = temp.map((dataa) => {
          return {
            ...dataa,
            isStudent: dataa?.candidate_id ? true : false,
            school: dataa?.candidate_id ? dataa.candidate_id.school : null,
          };
        });
        this.dataSource.data = dataEmail;
      } else {
        this.dataSource.data = [];
      }
      this.groupCount = resp?.length && resp[0]?.count_document ? resp[0].count_document : 0;
      this.isWaitingForResponse = false;
    });
  }
  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (this.data?.type === 'email') {
            this.getDataQuickSearchEmail();
          }
        }),
      )
      .subscribe();
  }

  safeUrl() {
    const url = `${environment.studentEnvironment}/session/login`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getUniqueSchools(entities) {
    const entity = _.filter(entities, function (dataa) {
      return dataa.school !== null;
    });
    return _.uniqBy(entity, 'school.short_name');
  }

  renderTooltipGlobal(entities: any[], dataType?): string {
    let tooltip = '';
    if (dataType === 'company') {
      const type = _.uniqBy(entities, 'companies.company_name');
      for (const entity of type) {
        if (entity.school) {
          tooltip = tooltip + entity.school.company_name + `, `;
        }
      }
    } else {
      const type = _.uniqBy(entities, 'school.short_name');
      for (const entity of type) {
        if (entity.school) {
          tooltip = tooltip + entity.school.short_name + `, `;
        }
      }
    }
    return tooltip.substring(0, tooltip.length - 2);
  }

  editSelection(selectedData) {
    if (this.data.type === 'student') {
      this.goToStudent(selectedData);
    } else if (this.data.type === 'school') {
      this.goToSchool(selectedData);
    } else if (this.data.type === 'user') {
      this.goToUser(selectedData, this.data.type);
    } else if (this.data.type === 'teacher') {
      this.goToTeacher(selectedData);
    } else if (this.data.type === 'mentor') {
      this.goToMentor(selectedData);
    } else if (this.data.type === 'tag') {
      this.goToStudent(selectedData);
    } else if (this.data?.type === 'email' && selectedData?.candidate_id) {
      this.goToStudent(selectedData?.candidate_id);
    } else if (this.data?.type === 'email' && !selectedData?.candidate_id) {
      this.goToUser(selectedData, this.data.type);
    }
  }
  goToTeacher(teacher) {
    window.open(`./users/teacher-list?teacherId=${teacher._id}`, '_blank');
  }

  goToUser(user, type) {
    window.open(`./users/user-list?user=${user._id}`, '_blank');
  }

  goToSchool(school) {
    window.open(`./schools/school-detail/${school._id}`, '_blank');
  }

  goToStudent(student) {
    window.open(`./candidate-file?selectedCandidate=${student._id}`, '_blank');
  }

  goToMentor(mentor) {
    const query = {
      selectedMentor: mentor._id ? mentor._id : null,
      companyId:
        mentor.entities && mentor.entities.length && mentor.entities[0].companies.length ? mentor.entities[0].companies[0]._id : null,
    };
    const url = this.router.createUrlTree(['companies/branches'], { queryParams: query });
    window.open(url.toString(), '_blank');
  }

  closeDialog() {
    this.dialogRef.close();
  }

  sortData(sort: Sort) {}

  connectAsUser(element, type) {
    console.log('element', element);
    const currentUser = this.utilService.getCurrentUser();
    let id;
    let unixUserType;
    let unixEntities;
    let unixSchoolType = [];
    let unixSchool = [];
    if (type === 'student') {
      if (element && element.user_id) {
        id = element.user_id._id;
        unixUserType = _.uniqBy(element.user_id.entities, 'type.name');
      }
    } else {
      if (element) {
        id = element._id;
        unixUserType = _.uniqBy(element.entities, 'type.name');
        unixEntities = _.uniqBy(element.entities, 'entity_name');
        if (unixEntities && unixEntities.length && unixEntities[0].entity_name === 'academic') {
          unixSchoolType = _.uniqBy(element.entities, 'school_type');
          unixSchool = _.uniqBy(element.entities, 'school._id');
        }
      }
    }
    console.log('unixEntities =>', unixEntities, unixUserType);
    if (id && unixUserType.length === 1) {
      this.isConnect = true;      this.isWaitingForResponse = true;
      this.subs.sink = this.authService.loginAsUser(currentUser._id, id).subscribe(
        (resp) => {
          if (resp) {
            console.log('resp', resp);
            const tempUser = resp.user;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('SUCCESS'),
              html: this.translate.instant('USER_S7_SUPERUSER.TEXT', {
                UserCivility: this.translate.instant(element.civility),
                UserFirstName: element.first_name,
                UserLastName: element.last_name,
              }),
              allowEscapeKey: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('UNDERSTOOD'),
            }).then((result) => {
              this.authService.backupLocalUserProfileAndToken();
              this.authService.setLocalUserProfileAndToken(resp);
              this.authService.setPermission([tempUser.entities[0].type.name]);
              this.ngxPermissionService.flushPermissions();
              this.ngxPermissionService.loadPermissions([tempUser.entities[0].type.name]);
              this.userService.reloadCurrentUser(true);
              this.router.navigate(['/mailbox/inbox']);
              this.closeDialog();
            });
          } else {
            this.isConnect = false;
            this.isWaitingForResponse = false;
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: you cannot logged in as this user') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SWAL_CONNECTAS.TITLE'),
              html: this.translate.instant('SWAL_CONNECTAS.TEXT'),
              allowEscapeKey: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('SWAL_CONNECTAS.BUTTON'),
            });
          }
        },
      );
    } else {
      this.dialog
        .open(LoginAsUserDialogComponent, {
          disableClose: true,
          panelClass: 'certification-rule-pop-up',
          width: '615px',
          data: element,
        })
        .afterClosed()
        .subscribe((resp) => {
          this.closeDialog();
        });
    }
  }

  sortHierachyEntitas(params) {
    if (this.data?.type === 'user' || this.data?.type === 'email') {
      const mergeHierarcy = this.utilService.mergeHierarchyPermission(_.cloneDeep(params?.entities), 'quickSearch');
      const hierarcyEntitas = this.utilService.sortEntitiesByHierarchy(_.cloneDeep(mergeHierarcy));
      if (hierarcyEntitas[0]?.type?.name.toLowerCase() === 'candidate' && this.data?.type === 'email') {
        return this.translate.instant('USER_TYPES.Student');
      } else {
        return this.translate.instant('USER_TYPES.' + hierarcyEntitas[0]?.type?.name);
      }
    } else {
      return '';
    }
  }

  checkEntitiesStudentOrCandidate(data) {
    const mergeHierarcy = this.utilService.mergeHierarchyPermission(_.cloneDeep(data?.entities));
    const hierarcyEntitas = this.utilService.sortEntitiesByHierarchy(_.cloneDeep(mergeHierarcy));
    if (
      (hierarcyEntitas?.length && hierarcyEntitas[0]?.type?.name.toLowerCase() === 'candidate') ||
      hierarcyEntitas?.length && hierarcyEntitas[0]?.type?.name.toLowerCase() === 'student'
    ) {
      return false;
    } else {
      return true;
    }
  }

  connectAsStudent(student) {
    this.isWaitingForResponse = true;
    const currentUser = this.utilService.getCurrentUser();
    const studentUserId = student && student.user_id && student.user_id._id ? student.user_id._id : null;
    if (currentUser && studentUserId && student?.student_id?.student_status === 'registered') {
      this.subs.sink = this.authService.loginAsUser(currentUser._id, studentUserId).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp && resp.user) {
            const tempUser = resp.user;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('SUCCESS'),
              html: this.translate.instant('USER_S7_SUPERUSER.TEXT', {
                UserCivility: this.translate.instant(student.civility),
                UserFirstName: student.first_name,
                UserLastName: student.last_name,
              }),
              allowEscapeKey: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('UNDERSTOOD'),
            }).then((result) => {
              const studentType = '5a067bba1c0217218c75f8ab';
              const candidateType = '5fe98eeadb866c403defdc6c';
              if (tempUser.entities[0].type._id === studentType || tempUser.student_id || tempUser.entities[0].type._id === candidateType) {
                this.authService.connectAsStudent(resp, 'Student', 'connect');
              }
            });
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: you cannot logged in as this user') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SWAL_CONNECTAS.TITLE'),
              html: this.translate.instant('SWAL_CONNECTAS.TEXT'),
              allowEscapeKey: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('SWAL_CONNECTAS.BUTTON'),
            });
          }
        },
      );
  }
}
}
