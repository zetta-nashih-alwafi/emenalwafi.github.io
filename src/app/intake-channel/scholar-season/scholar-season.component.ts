import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ReplyUrgentMessageDialogComponent } from 'app/mailbox/reply-urgent-message-dialog/reply-urgent-message-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { SchoolService } from 'app/service/schools/school.service';
import { UserService } from 'app/service/user/user.service';
import { UsersService } from 'app/service/users/users.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { UserEmailDialogComponent } from 'app/users/user-email-dialog/user-email-dialog.component';
import * as moment from 'moment';
import { map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { SelectionModel } from '@angular/cdk/collections';
import { FinancesService } from 'app/service/finance/finance.service';
import { AddScholarSeasonDialogComponent } from './add-scholar-season-dialog/add-scholar-season-dialog.component';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-scholar-season',
  templateUrl: './scholar-season.component.html',
  styleUrls: ['./scholar-season.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseStringDatePipe],
})
export class ScholarSeasonComponent implements OnInit, AfterViewInit, OnDestroy {
  replyUrgentMessageDialogComponent: MatDialogRef<ReplyUrgentMessageDialogComponent>;
  private subs = new SubSink();
  displayedColumns: string[] = ['select', 'name', 'from', 'to', 'description', 'status', 'action'];
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataLoaded = false;
  scholarCount = 0;
  sortValue: any;
  dataSelectedAll: any;
  previousLength = 0;
  pageSelected = [];
  userSelected: any[];
  userSelectedId: any[];
  isCheckedAll = false;
  selectType: any;
  disabledExport = true;
  allScholarForCheckbox = [];
  dataSelected = [];

  // Configuration of the Popup Size and display
  configCat: MatDialogConfig = {
    disableClose: true,
    panelClass: 'certification-rule-pop-up',
    minWidth: '95%',
    minHeight: '81%',
  };

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
  isPermission: string[];
  currentUserTypeId: any;

  scholar: any;

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
    private financeService: FinancesService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private parseStringDatePipe: ParseStringDatePipe,
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
    this.getAllUser();
    this.pageTitleService.setTitle('INTAKE_CHANNEL.PAGE_TITLE.Scholar season');
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
  }

  checkIsOperator() {
    this.isOperator = this.authService.getCurrentUser()?.entities?.some((entity) => entity?.entity_name && entity?.entity_name === 'operator');
  }

  sortData(sort: Sort) {
    // console.log('sort', sort);
    // if (sort.active === 'last_name') {
    //   this.sortValue = sort.direction ? { full_name: sort.direction } : null;
    // } else if (sort.active === 'title') {
    //   this.sortValue = sort.direction ? { title: sort.direction } : null;
    // } else if (sort.active === 'userType') {
    //   this.sortValue = sort.direction ? { user_type: sort.direction } : null;
    // } else if (sort.active === 'user_status') {
    //   this.sortValue = sort.direction ? { user_status: sort.direction } : null;
    // }
    // if (this.dataLoaded) {
    //   this.paginator.pageIndex = 0;
    //   this.getAllUser();
    // }
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

  /*
   * Implement Populate Data User Table
   * */
  getAllUser() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    this.subs.sink = this.financeService.GetAllScholarSeasons(pagination).subscribe(
      (resp) => {
        this.scholar = _.cloneDeep(resp);

        this.dataSource.data = this.scholar;
        this.scholarCount = this.scholar && this.scholar.length ? this.scholar[0].count_document : 0;
        this.isWaitingForResponse = false;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err)
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
      this.pageSelected = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.allScholarForCheckbox = [];
      this.isCheckedAll = true;
      this.getDataAllForCheckbox(0);
    }
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.getAllScholarCheckbox(pagination).subscribe(
      (students) => {
        if (students && students.length) {
          this.allScholarForCheckbox.push(...students);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
          this.isWaitingForResponse = false;
          if (this.isCheckedAll) {
            if (this.allScholarForCheckbox && this.allScholarForCheckbox.length) {
              this.allScholarForCheckbox.forEach((element) => {
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
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(error)
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
    if (row) {
      const dataFilter = this.dataSelected.filter((resp) => resp._id === row._id);
      if (dataFilter && dataFilter.length < 1) {
        this.dataSelected.push(row);
      } else {
        const indexFilter = this.dataSelected.findIndex((resp) => resp._id === row._id);
        this.dataSelected.splice(indexFilter, 1);
      }
    }
    const numSelected = this.selection.selected.length;
    this.disabledExport = numSelected <= 0;
    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.userSelected.push(user);
      this.userSelectedId.push(user._id);
    });
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
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    this.sort.direction = '';
    this.sort.active = '';
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sortValue = null;
    this.paginator.pageIndex = 0;
    this.getAllUser();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  translateDate(datee, timee) {
    const finalTime = timee ? timee : '15:59';
    if (datee) {
      const date = this.parseStringDatePipe.transformStringToDate(this.parseUTCToLocalPipe.transformDate(datee, finalTime));
      return moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
    } else {
      return '';
    }
  }

  addScholarSeason() {
    this.subs.sink = this.dialog
      .open(AddScholarSeasonDialogComponent, {
        width: '800px',
        minHeight: '100px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getAllUser();
        }
      });
  }

  handlePublish(data) {
    let payload = _.cloneDeep(data);
    delete payload._id;
    delete payload.count_document;
    if (data.is_published === true) {
      payload.is_published = false;
      let timeDisabled = 3;
      Swal.fire({
        title: this.translate.instant('SCHOLAR_S2.Title'),
        html: this.translate.instant('SCHOLAR_S2.Text'),
        type: 'info',
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
      }).then((res) => {
        this.isWaitingForResponse = true;
        clearTimeout(this.timeOutVal);
        if (res.value) {
          this.subs.sink = this.financeService.UpdateScholarSeason(payload, data._id).subscribe(
            (resp) => {
              // console.log('Edit Payment Mode', resp);
              this.isWaitingForResponse = false;
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                text: this.translate.instant('This Scholar Season is unpublished !'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.getAllUser();
              });
            },
            (err) => {
              this.isWaitingForResponse = false;
              this.authService.postErrorLog(err)
              if (err['message'] === 'GraphQL error: Scholar season already in used in program') {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('SCHOLAR_S5.Title'),
                  html: this.translate.instant('SCHOLAR_S5.Text'),
                  confirmButtonText: this.translate.instant('SCHOLAR_S5.Button'),
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
                  type: 'warning',
                  title: this.translate.instant('Invalid_Form_Warning.TITLE'),
                  text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                  confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                });
              }
            },
          );
        } else {
          this.isWaitingForResponse = false;
        }
      });
    } else {
      payload.is_published = true;
      let timeDisabled = 3;
      Swal.fire({
        title: this.translate.instant('SCHOLAR_S1.Title'),
        html: this.translate.instant('SCHOLAR_S1.Text'),
        type: 'info',
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
      }).then((res) => {
        this.isWaitingForResponse = true;
        clearTimeout(this.timeOutVal);
        if (res.value) {
          this.subs.sink = this.financeService.UpdateScholarSeason(payload, data._id).subscribe(
            (resp) => {
              // console.log('Edit Payment Mode', resp);
              this.isWaitingForResponse = false;
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                text: this.translate.instant('This Scholar Season is published !'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.getAllUser();
              });
            },
            (err) => {
              this.isWaitingForResponse = false;
              this.authService.postErrorLog(err)
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
        {
          this.isWaitingForResponse = false;
        }
      });
    }
  }

  editScholarDialog(data) {
    if (data.is_published === true) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SCHOLAR_S4.Title'),
        html: this.translate.instant('SCHOLAR_S4.Text'),
        confirmButtonText: this.translate.instant('SCHOLAR_S4.Button'),
      });
    } else {
      this.subs.sink = this.dialog
        .open(AddScholarSeasonDialogComponent, {
          width: '800px',
          minHeight: '100px',
          disableClose: true,
          data: data,
        })
        .afterClosed()
        .subscribe((resp) => {
          this.getAllUser();
        });
    }
  }

  deleteScholar(data) {
    if (data.is_published === true) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SCHOLAR_S3b.Title'),
        html: this.translate.instant('SCHOLAR_S3b.Text'),
        confirmButtonText: this.translate.instant('SCHOLAR_S3b.Button'),
      });
    } else {
      let timeDisabled = 3;
      Swal.fire({
        title: this.translate.instant('SCHOLAR_S3.Title'),
        html: this.translate.instant('SCHOLAR_S3.Text'),
        type: 'info',
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('SCHOLAR_S3.Button1', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('SCHOLAR_S3.Button2'),
        allowOutsideClick: false,
        allowEnterKey: false,
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          const intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('SCHOLAR_S3.Button1') + ` (${timeDisabled})`;
          }, 1000);
          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('SCHOLAR_S3.Button1');
            Swal.enableConfirmButton();
            clearInterval(intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      }).then((res) => {
        clearTimeout(this.timeOutVal);
        if (res.value) {
          this.subs.sink = this.financeService.DeleteScholarSeason(data._id).subscribe(
            (resp) => {
              console.log('Edit Payment Mode', resp);
              Swal.fire({
                type: 'success',
                title: 'Bravo!',
                confirmButtonText: 'OK',
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.getAllUser();
              });
            },
            (error) => {
              this.authService.postErrorLog(error)
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
      });
    }
  }
}
