import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { debounceTime, map, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { SelectionModel } from '@angular/cdk/collections';
import { UntypedFormControl } from '@angular/forms';
import { UserService } from 'app/service/user/user.service';
import { UserManagementService } from 'app/user-management/user-management.service';
import Swal from 'sweetalert2';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { AddOrganizationContactComponent } from './add-organization-contact/add-organization-contact.component';
import { FormFillingService } from 'app/form-filling/form-filling.service';
import { InternshipEmailDialogComponent } from 'app/internship-file/internship-email-dialog/internship-email-dialog.component';
import { MailInternshipDialogComponent } from 'app/internship-file/mail-internship-dialog/mail-internship-dialog.component';
import { PermissionService } from 'app/service/permission/permission.service';
import { CountryService } from 'app/shared/services/country.service';
import { UtilityService } from 'app/service/utility/utility.service';

@Component({
  selector: 'ms-organization-detail-contact',
  templateUrl: './organization-detail-contact.component.html',
  styleUrls: ['./organization-detail-contact.component.scss'],
})
export class OrganizationDetailContactComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() orgId: string;
  scholarPeriodCount;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  noData: any;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  displayedColumns: string[] = ['select', 'name', 'email', 'phone', 'action'];
  filterColumns: string[] = ['selectFilter', 'nameFilter', 'emailFilter', 'phoneFilter', 'actionFilter'];
  filteredValues = {
    name: null,
    email: null,
  };

  nameFilter = new UntypedFormControl('');
  emailFilter = new UntypedFormControl('');

  isWaitingForResponse = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isLoading: Boolean = false;
  dataCount = 0;
  sortValue: any;
  isCheckedAll = false;
  intackChannelCount = 0;
  private subs = new SubSink();

  private timeOutVal: any;
  types = [];
  schools = [];
  campuses = [];
  levels = [];
  originalEntityList: any;
  isOperator: boolean;

  isWasSelectAll = false;
  disabledExport = true;
  selectType: any;
  orgSelected: any[];

  // *************** START OF property to store data of country dial code
  countryCodeList: any[] = [];
  // *************** END OF property to store data of country dial code

  constructor(
    private translate: TranslateService,
    private dialog: MatDialog,
    private userService: UserService,
    private userMgtService: UserManagementService,
    private authService: AuthService,
    private formFillingService: FormFillingService,
    public permission:PermissionService,
    private countryService: CountryService,
    private utilService: UtilityService
  ) {}

  ngOnInit() {
    this.initFilter();
    this.checkIsOperator();
    this.getAllContact();
    this.getAllCountryCodes();
    this.subs.sink = this.translate.onLangChange.subscribe(() => {
      this.sortCountryCode();
    })
  }

  sortCountryCode() {
    this.countryCodeList = this.countryCodeList.sort((firstData, secondData) => {
      if (this.utilService.simplifyRegex(this.translate.instant(firstData?.name)) < this.utilService.simplifyRegex(this.translate.instant(secondData?.name))) {
        return -1;
      } else if (this.utilService.simplifyRegex(this.translate.instant(firstData?.name)) > this.utilService.simplifyRegex(this.translate.instant(secondData?.name))) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  ngOnChanges() {
    this.resetTable();
    this.getAllContact();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        tap(() => {
          if (!this.isReset) {
            this.getAllContact();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }
  
  getAllCountryCodes() {
    this.countryCodeList = this.countryService?.getAllCountriesNationality();
  }

  checkIsOperator() {
    this.isOperator = this.authService.getCurrentUser().entities.some((entity) => entity.entity_name && entity.entity_name === 'operator');
  }

  getAllContact() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.getAllContacts(this.orgId, this.filteredValues, this.sortValue, null, null).subscribe(
      (res) => {
        if (res) {
          console.log(res);
          this.dataSource.data = res;
          this.dataSource.paginator = this.paginator;
          this.dataCount = res.length;
        } else {
          this.dataSource.data = [];
          this.dataSource.paginator = this.paginator;
          this.dataCount = 0;
        }
        this.isWaitingForResponse = false;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
      },
      (err) => {
        this.isWaitingForResponse = false
        this.dataSource.data = []
        this.dataSource.paginator = this.paginator,
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      } 
    );
  }

  // init listener to the filters
  initFilter() {
    this.subs.sink = this.nameFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/;
      const symbol1 = /\\/;
      if (!name.match(symbol) && !name.match(symbol1)) {
        this.filteredValues.name = name;
        this.paginator.pageIndex = 0;
        this.getAllContact();
      } else {
        this.nameFilter.setValue('');
        this.filteredValues.name = '';
        this.paginator.pageIndex = 0;
        this.getAllContact();
      }
    });

    this.subs.sink = this.emailFilter.valueChanges.pipe(debounceTime(400)).subscribe((email) => {
      const symbol = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/;
      const symbol1 = /\\/;
      if (!email.match(symbol) && !email.match(symbol1)) {
        this.filteredValues.email = email;
        this.paginator.pageIndex = 0;
        this.getAllContact();
      } else {
        this.emailFilter.setValue('');
        this.filteredValues.email = '';
        this.paginator.pageIndex = 0;
        this.getAllContact();
      }
    });
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    this.paginator.pageIndex = 0;
    this.getAllContact();
  }

  // on reset button click
  resetTable() {
    this.isReset = true;
    this.selection.clear();
    this.isCheckedAll = false;
    this.paginator.pageIndex = 0;
    this.orgSelected = [];
    // this.sort.sort({ id: '', start: 'asc', disableClear: false });

    this.filteredValues = {
      name: '',
      email: '',
    };

    this.sort.direction = '';
    this.sort.active = '';
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sortValue = null;
    this.nameFilter.patchValue(null, { emitEvent: false });
    this.emailFilter.patchValue(null, { emitEvent: false });
    this.getAllContact();
  }

  addContact() {
    this.subs.sink = this.dialog
      .open(AddOrganizationContactComponent, {        
        minWidth: '600px',
        disableClose: true,
        data: {
          orgId: this.orgId,
          countryCodeList: this.countryCodeList,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getAllContact();
        }
      });
  }

  editContact(data) {
    this.subs.sink = this.dialog
      .open(AddOrganizationContactComponent, {        
        minWidth: '600px',
        disableClose: true,
        data: {
          orgId: this.orgId,
          data: data,
          countryCodeList: this.countryCodeList,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getAllContact();
        }
      });
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  deleteContact(id: string) {
    // alert('yes this button');
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('Warning'),
      text: this.translate.instant('Are you sure you want to delete this contact'),
      showCancelButton: true,
      allowEscapeKey: true,
      confirmButtonText: this.translate.instant('SWEET_ALERT.DELETE.CONFIRM'),
      cancelButtonText: this.translate.instant('SWEET_ALERT.DELETE.CANCEL'),
    }).then((result) => {
      clearTimeout(this.timeOutVal);
      if (result.value) {
        this.removeContact(id);
      }
    });
  }

  temporarilyDisableConfirmButton(timeDisabled) {
    const confirmBtnRef = Swal.getConfirmButton();
    confirmBtnRef.setAttribute('disabled', '');
    const time = setInterval(() => {
      timeDisabled -= 1;
      confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM') + ' in ' + timeDisabled + ' sec';
    }, 1000);

    this.timeOutVal = setTimeout(() => {
      confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM');
      confirmBtnRef.removeAttribute('disabled');
      clearInterval(time);
      clearTimeout(this.timeOutVal);
    }, timeDisabled * 1000);
  }

  removeContact(id) {
    this.isWaitingForResponse = true;
    console.log(id);
    this.subs.sink = this.formFillingService.deleteContact(id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          Swal.fire({
            type: 'success',
            title: 'Bravo!',
            confirmButtonText: 'OK',
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.getAllContact();
          });
        }
      },
      (error) => {
        this.isWaitingForResponse = false;
        this.swalError(error);
        return;
      },
    );
  }

  swalError(err) {
    this.isWaitingForResponse = false;
    console.log('[Response BE][Error] : ', err);
    if (err['message'] === 'GraphQL error: This admission user type already have student admitted to this user!') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('User_S3.TITLE'),
        text: this.translate.instant('User_S3.TEXT'),
        confirmButtonText: this.translate.instant('User_S3.BUTTON'),
      });
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: 'OK',
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
    if (this.isAllSelected()) {
      this.selection.clear();
      this.isCheckedAll = false;
    } else {
      this.isCheckedAll = true;
      this.dataSource.data.forEach((row) => this.selection.select(row));
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  sendMail(data) {
    if (data) {
      if (data.email === '') {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Org_S3.TITLE'),
          text: this.translate.instant('Org_S3.TEXT'),
          confirmButtonText: this.translate.instant('Org_S3.BUTTON'),
        });
      } else {
        const mappedData = [
          {
            civility: data.civility,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
          },
        ];
        this.subs.sink = this.dialog
          .open(MailInternshipDialogComponent, {
            disableClose: true,
            width: '750px',
            data: mappedData,
          })
          .afterClosed()
          .subscribe((resp) => {
            if (resp) {
            } else {
            }
          });
      }
    }
  }

  validateActionButtonEmail(element) {
    let allow = true;
    if (this.orgSelected && this.orgSelected.length > 0) {
      allow = false;
    }
    return allow;
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

  showOptions(info) {
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
    console.log('showOptions', this.isWasSelectAll, info);
    this.orgSelected = [];
    this.selectType = info;
    const data = this.selection.selected;
    data.forEach((org) => {
      this.orgSelected.push(org);
    });
  }
}
