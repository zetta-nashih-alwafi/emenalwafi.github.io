import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { SelectionModel } from '@angular/cdk/collections';
import { UserManagementService } from '../../user-management/user-management.service';
import { AddOrganizationDialogComponent } from '../add-organization-dialog/add-organization-dialog.component';
import { FormFillingService } from 'app/form-filling/form-filling.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { FilterBreadcrumbComponent } from 'app/filter-breadcrumb/filter-breadcrumb.component';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
})
export class OrganizationComponent implements OnInit, AfterViewInit, OnDestroy {
  replyUrgentMessageDialogComponent: MatDialogRef<ReplyUrgentMessageDialogComponent>;
  private subs = new SubSink();
  displayedColumns: string[] = ['select', 'organization_type', 'name', 'action'];
  filterColumns: string[] = ['selectFilter', 'organizationTypeFilter', 'nameFilter', 'actionFilter'];
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  // userDialogComponent: MatDialogRef<UsersDialogComponent>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  organizationTypeFilter = new UntypedFormControl('All');
  nameFilter = new UntypedFormControl('');

  typeList = [
    {
      value: 'All',
      key: 'All',
    },
    {
      value: 'OPCO',
      key: 'OPCO',
    },
    {
      value: 'CPF',
      key: 'CPF',
    },
    {
      value: 'Transition Pro',
      key: 'Transition Pro',
    },
    {
      value: 'Pôle Emploi',
      key: 'Pôle Emploi',
    },
    {
      value: 'Région',
      key: 'Région',
    },
    {
      value: 'Company',
      key: 'Company',
    },
    {
      value: 'Other financing organization',
      key: 'Other financing organization',
    },
  ];
  dataLoaded = false;
  organizationCount = 0;
  sortValue: any;
  isCheckedAll = false;
  filteredValues = {
    organization_type: null,
    organization_name: null,
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

  isWasSelectAll = false;
  disabledExport = true;
  selectType: any;
  orgSelected: any[];
  filterBreadcrumbData: any[] = [];
  dataUnselectUser = [];
  dataSelected = [];

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
    private formFillingService: FormFillingService,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit() {
    this.initializeFilter();
    this.getListOrganization();
    this.pageTitleService.setTitle('List of Organization');
  }

  ngAfterViewInit() {
    // this.dataSource.sort = this.sort;
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          this.getListOrganization();
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getListOrganization() {
    this.dataSource.data = [];
    this.paginator.length = 0;
    this.organizationCount = 0;
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.subs.sink = this.formFillingService.getAllOrganizationsPagination(this.filteredValues, pagination, this.sortValue).subscribe(
      (res) => {
        if (res && res.length) {
          this.dataSource.data = res;
          this.paginator.length = res[0].count_document;
          this.organizationCount = res[0].count_document;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.organizationCount = 0;
        }
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
        this.isWaitingForResponse = false;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        this.dataSource.data = [];
        this.dataSource.paginator = this.paginator;
        this.organizationCount = 0;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  /********************** FILTER AND SORT ************/

  initializeFilter() {
    this.subs.sink = this.nameFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      name = name ? name : '';
      const symbol = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/;
      const symbol1 = /\\/;
      if (!name.match(symbol) && !name.match(symbol1)) {
        this.filteredValues.organization_name = name;
        this.paginator.pageIndex = 0;
        this.getListOrganization();
      } else {
        this.nameFilter.setValue('');
        this.filteredValues.organization_name = '';
        this.paginator.pageIndex = 0;
        this.getListOrganization();
      }
    });

    this.subs.sink = this.organizationTypeFilter.valueChanges.subscribe((status) => {
      this.filteredValues.organization_type = status === 'All' ? '' : status;
      this.paginator.pageIndex = 0;
      this.getListOrganization();
    });
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      this.getListOrganization();
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

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return this.isCheckedAll ? true : numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.isCheckedAll = false;
      this.dataUnselectUser = [];
      this.dataSelected = [];
    } else {
      this.selection.clear();
      this.isCheckedAll = true;
      this.dataUnselectUser = [];
      this.dataSelected = [];
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

  /** Reset Functionality User Table */
  resetSelection() {
    this.orgSelected = [];
    this.dataSelected = [];
    this.dataUnselectUser = [];
    this.selection.clear();
    this.filteredValues = {
      organization_type: null,
      organization_name: null,
    };
    this.isCheckedAll = false;
    this.sort.direction = '';
    this.sort.active = '';
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sortValue = null;
    this.paginator.pageIndex = 0;
    this.organizationTypeFilter.setValue('All', { emitEvent: false });
    this.nameFilter.setValue('', { emitEvent: false });
    this.filterBreadcrumbData = [];
    this.getListOrganization();
  }

  addOrganization() {
    this.subs.sink = this.dialog
      .open(AddOrganizationDialogComponent, {
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        width: '660px',
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getListOrganization();
        }
      });
  }

  goToOrganizationDetail(orgId: string) {
    this.router.navigate(['organization-detail'], { relativeTo: this.route, queryParams: { organization: orgId } });
  }

  deleteOrganization(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('DELETE_ORGANIZATION.TITLE'),
      html: this.translate.instant('CONFIRMDELETE', {
        value: data.name ? data.name : '',
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
          confirmBtnRef.innerText = this.translate.instant('DELETE_ORGANIZATION.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_ORGANIZATION.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      this.isWaitingForResponseTop = true;
      if (res.value) {
        this.subs.sink = this.formFillingService.deleteOrganization(data._id).subscribe(
          (resp) => {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.isWaitingForResponseTop = false;
              this.getListOrganization();
            });
          },
          (err) => {
            this.authService.postErrorLog(err);
            if (err['message'] === 'GraphQL error: Organization is already connected to Admission Financement') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('Organization_S1.TITLE'),
                text: this.translate.instant('Organization_S1.TEXT'),
                confirmButtonText: this.translate.instant('Organization_S1.BUTTON_1'),
              }).then(() => {
                this.isWaitingForResponseTop = false;
              });
            } else {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              }).then(() => {
                this.isWaitingForResponseTop = false;
              });
            }
          },
        );
      }
    });
  }

  validateActionButtonDelete(element) {
    let allow = true;
    if (this.orgSelected && this.orgSelected.length > 0) {
      allow = false;
    }
    return allow;
  }

  validateActionButtonEdit(element) {
    let allow = true;
    if (this.orgSelected && this.orgSelected.length > 0) {
      allow = false;
    }
    return allow;
  }

  showOptions(info, row?) {
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
    // console.log('showOptions', this.isWasSelectAll, info);
    this.orgSelected = [];
    this.selectType = info;
    const data = this.selection.selected;
    data.forEach((org) => {
      this.orgSelected.push(org);
    });
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'organization_type', // name of the key in the object storing the filter
        column: 'Type of Organization', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.typeList, // the array/list holding the dropdown options
        filterRef: this.organizationTypeFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'value', // the key displayed in the html (only applicable to array of objects)
        savedValue: 'key', // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'table_filter',
        name: 'organization_name',
        column: 'Organization Name',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.nameFilter,
        isSelectionInput: false,
        displayKey: null,
        savedValue: null,
        noTranslate: true
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }
  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
    this.selection.clear();
    this.getListOrganization();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
}
