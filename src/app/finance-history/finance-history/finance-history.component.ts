import * as _ from 'lodash';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SubSink } from 'subsink';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { UntypedFormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { FinancesService } from 'app/service/finance/finance.service';
import * as moment from 'moment';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { Router } from '@angular/router';
import { MailHistoryFinanceDialogComponent } from 'app/internship-file/mail-history-finance-dialog/mail-history-finance-dialog.component';
import { AddHistoryTaskDialogComponent } from 'app/internship-file/add-history-task-dialog/add-history-task-dialog.component';
import { HistoryReconciliationDialogComponent } from 'app/internship-file/history-reconciliation-dialog/history-reconciliation-dialog.component';
import { HistoryLettrageDialogComponent } from 'app/internship-file/history-lettrage-dialog/history-lettrage-dialog.component';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';
import { PermissionService } from 'app/service/permission/permission.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';

@Component({
  selector: 'ms-finance-history',
  templateUrl: './finance-history.component.html',
  styleUrls: ['./finance-history.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseStringDatePipe],
})
export class FinanceHistoryComponent implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns: string[] = [
    'select',
    'accounting',
    'date',
    'type',
    'transaction',
    'from',
    'to',
    'bank',
    'reference',
    'debit',
    'amount',
    'student',
    'program',
    'lettrage',
    'action',
  ];
  filterColumns: String[] = [
    'selectFilter',
    'accountingFilter',
    'dateFilter',
    'typeFilter',
    'transactionFilter',
    'fromFilter',
    'toFilter',
    'bankFilter',
    'referenceFilter',
    'debitFilter',
    'amountFilter',
    'studentFilter',
    'programFilter',
    'lettrageFilter',
    'actionFilter',
  ];
  filterDate = '';
  accountDocumentFilter = new UntypedFormControl('');
  dateFilyer = new UntypedFormControl('');
  transactionFilter = new UntypedFormControl('All');
  descriptionFilter = new UntypedFormControl('');
  bankFilter = new UntypedFormControl('All');
  fromFilter = new UntypedFormControl('');
  toFilter = new UntypedFormControl('');
  studentNameFilter = new UntypedFormControl('');
  studentFilter = new UntypedFormControl('');
  selection = new SelectionModel<any>(true, []);

  nationalityFilterList = [
    { value: 'All', key: 'AllF' },
    { value: 'FR', key: 'French' },
    { value: 'US', key: 'American' },
    { value: 'GB', key: 'United Kingdom' },
  ];

  intakeChannelFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: '20-21_EFAPAR_1', key: '20-21 EFAPAR 1' },
    { value: '21-22_EFATOU_2', key: '21-22 EFATOU 2' },
    { value: '20-21_ICABOR_1', key: '20-21 ICABOR 1' },
  ];
  actionFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: 'wap_sms', key: 'Whatsapp or SMS' },
    { value: 'email', key: 'Email' },
    { value: 'note', key: 'Note' },
  ];
  engagementLevelFilterList = [
    { value: 'AllM', key: 'AllM' },
    { value: 'lost', key: 'Lost' },
    { value: 'low', key: 'Low' },
    { value: 'medium', key: 'Medium' },
    { value: 'high', key: 'High' },
    { value: 'registered', key: 'Registered' },
  ];

  filteredValues = {
    accounting_document: '',
    date: '',
    transaction_type: '',
    description: '',
    from: '',
    to: '',
    student_last_name: '',
    student_id: '',
    date_from: '',
    date_to: '',
    school: '',
    bank: '',
    campus: '',
    level: '',
    scholar_season: '',
  };

  superFilter = {
    level: '',
    campus: '',
    school: '',
    scholar_season: '',
  };
  schoolName = '';
  maleIcon = '../../../../../assets/img/student_icon.png';
  femaleIcon = '../../../../../assets/img/student_icon_fem.png';
  greenHeartIcon = '../../../../../assets/img/enagement_icon_green.png';
  flagsIconPath = '../../../../../assets/icons/flags/';
  dataSource = new MatTableDataSource([]);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  config: MatDialogConfig = {
    disableClose: true,
    width: '600px',
  };
  bank = [];
  dataCount = 0;
  private subs = new SubSink();
  noData: any;
  currentUser: any;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  exportName: 'Export';
  selectType: any;
  entityData: any;
  userSelected: any[];
  userSelectedId: any[];
  disableExport = true;
  disableToday = true;
  disableYesterday = true;
  disableLast7Days = true;
  disableLast30Days = true;
  isThereFilter = false;
  disableThisMonth = true;
  titleList = ['All', 'Avoir', 'Decaissement', 'Encaissement', 'payment'];
  originalTitleList = [];
  schoolList = [];
  originalCandidateList = [];
  isLoading: Boolean;
  dummyData = [];
  campusList = [];
  listObjective = [];
  levels = [];
  school = [];
  scholars = [];
  originalScholar = [];
  scholarSelected = [];
  studentType = [];
  paymentMode = [];
  intakeList = [];
  schoolsFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  levelFilter = new UntypedFormControl(null);
  scholarFilter = new UntypedFormControl('All');
  mailStudentsDialog: MatDialogRef<MailHistoryFinanceDialogComponent>;
  isPermission: any;
  currentUserTypeId: any;
  allStudentForCheckbox = [];
  dataSelected = [];
  dataUnselected = [];
  buttonClicked = '';
  allHistoryForExport: any[] = [];
  isCheckedAll = false;
  pageSelected = [];
  disabledExport = true;
  totalDebit: any;
  totalCredit: any;
  isSelectAllSchool = false;
  isSelectAllCampous = false;
  isSelectAllLevel = false;
  displayOnProd = true;
  campusListBackup = [];
  name = [];
  whichFilterOn = null;
  isDisabled = true;
  schoolFiltered;
  campusFiltered;
  levelFiltered;
  filterBreadcrumbData: any[] = [];
  actionFilterDate = {
    date: '',
  };

  constructor(
    private candidatesService: CandidatesService,
    private dialog: MatDialog,
    private financeService: FinancesService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private parseStringDatePipe: ParseStringDatePipe,
    private router: Router,
    private http: HttpClient,
    private pageTitleService: PageTitleService,
    private translate: TranslateService,
    private userService: AuthService,
    public permission: PermissionService,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.initFilter();
    this.getCandidatesHistoryData();
    this.getDataScholarSeasons();
    this.getBankDropdown();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getFirstScholarSelect();
      this.getBankDropdown();
    });
    if (this.scholarFilter.value) {
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }
  }

  getFirstScholarSelect() {
    this.scholars = [];
    this.scholars = this.originalScholar.sort((a, b) =>
      a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
    );
    if (this.scholarFilter.value && (this.scholarFilter.value.trim() === 'All' || this.scholarFilter.value.trim() === 'Tous')) {
      this.scholars.unshift({ _id: 'All', scholar_season: this.translate.instant('All') });
      this.scholars = _.uniqBy(this.scholars, '_id');
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected() || (this.isCheckedAll && this.dataUnselected && this.dataUnselected.length)) {
      this.selection.clear();
      this.dataSelected = [];
      this.dataUnselected = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
      this.allHistoryForExport = [];
      this.enableAllTopActions();
      if (this.dataSource.data && this.dataSource.data.length) {
        this.totalDebit = this.dataSource.data[0].total_debit ? this.dataSource.data[0].total_debit : 0;
        this.totalCredit = this.dataSource.data[0].total_credit ? this.dataSource.data[0].total_credit : 0;
      } else {
        this.totalDebit = 0;
        this.totalCredit = 0;
      }
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.dataUnselected = [];
      this.isCheckedAll = true;
      this.allHistoryForExport = [];
      this.disableAllTopActions();
      this.dataSource.data.map((row) => {
        if (!this.dataUnselected.includes(row?._id)) {
          this.selection.select(row?._id);
        }
      });
    }
  }

  showOptions(info, row) {
    if (this.isCheckedAll) {
      if (row) {
        if (!this.dataUnselected.includes(row._id)) {
          this.dataUnselected.push(row._id);
          this.selection.deselect(row._id);
        } else {
          const indx = this.dataUnselected.findIndex((list) => list === row._id);
          this.dataUnselected.splice(indx, 1);
          this.selection.select(row._id);
        }
      }
    } else {
      if (row) {
        const dataFilter = this.dataSelected.filter((resp) => resp._id === row._id);
        if (dataFilter && dataFilter.length < 1) {
          this.dataSelected.push(row);
        } else {
          const indexFilter = this.dataSelected.findIndex((resp) => resp._id === row._id);
          this.dataSelected.splice(indexFilter, 1);
        }
      }
    }
    // if (info === 'one') {
    //   this.isCheckedAll = false;
    // }
    const numSelected = this.dataSelected.length;
    if (numSelected > 0) {
      this.disabledExport = false;
    } else {
      this.disabledExport = true;
    }
    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.userSelected.push(user);
      this.userSelectedId.push(user._id);
    });
    if (this.dataSelected.length > 0) {
      this.totalCredit = 0;
      this.totalDebit = 0;
      this.dataSelected.forEach((item) => {
        this.totalCredit += item.credit;
        this.totalDebit += item.debit;
      });
    }
  }

  /*
   getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isLoading = true;
    const filters = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.financeService.GetAllTransactionHistoriesCheckbox(pagination, filters, userTypesList).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.allStudentForCheckbox.push(...students);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
          this.isLoading = false;
          if (this.isCheckedAll) {
            if (this.allStudentForCheckbox && this.allStudentForCheckbox.length) {
              this.allStudentForCheckbox.forEach((element) => {
                this.selection.select(element._id);
                this.dataSelected.push(element);
              });
            }
            if (this.dataSource.data && this.dataSource.data.length) {
              this.totalDebit = this.dataSource.data[0].total_debit ? this.dataSource.data[0].total_debit : 0;
              this.totalCredit = this.dataSource.data[0].total_credit ? this.dataSource.data[0].total_credit : 0;
            } else {
              this.totalDebit = 0;
              this.totalCredit = 0;
            }
            this.pageSelected.push(this.paginator.pageIndex);
          } else {
            this.pageSelected = [];
          }
        }
      },
      (error) => {
        this.isReset = false;
        this.isLoading = false;
        // Record error log
        this.userService.postErrorLog(error);
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
*/

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasons().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.originalScholar = _.cloneDeep(resp);
          this.scholars = [];
          this.scholars = this.originalScholar.sort((a, b) =>
            a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
          );
          this.scholars.unshift({ _id: 'All', scholar_season: this.translate.instant('All') });
          this.scholars = _.uniqBy(this.scholars, '_id');
        }
      },
      (err) => {
        // Record error log
        this.userService.postErrorLog(err);
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
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
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  getDataForList(data?) {
    const name = data ? data : '';
    const filters = 'filter: { scholar_season_id:' + `"${name}"` + '}';
    this.subs.sink = this.candidatesService.GetAllSchoolFilter(name, filters, this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp) {
          if (
            this.currentUser &&
            this.currentUser.entities &&
            this.currentUser.entities.length &&
            this.currentUser.app_data &&
            this.currentUser.app_data.school_package &&
            this.currentUser.app_data.school_package.length
          ) {
            const schoolsList = [];
            this.currentUser.app_data.school_package.forEach((element) => {
              schoolsList.push(element.school);
            });
            this.listObjective = schoolsList;
            this.school = this.listObjective;
            this.school = this.school.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0));
          } else {
            this.listObjective = resp;
            this.school = this.listObjective;
            this.school = this.school.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0));
          }
          // this.getDataCampus();
        }
      },
      (err) => {
        // Record error log
        this.userService.postErrorLog(err);
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
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
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  scholarSelect() {
    this.schoolName = '';
    this.school = [];
    this.campusList = [];
    this.levels = [];
    if (this.schoolsFilter.value) {
      this.schoolsFilter.setValue(null);
    }
    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }

    if (!this.scholarFilter.value || this.scholarFilter.value.length === 0) {
      // this.filteredValues['scholar_season'] = '';
      this.scholarSelected = [];
      this.school = [];
      this.campusList = [];
      this.levels = [];
    } else {
      // this.filteredValues['scholar_season'] = this.scholarFilter.value;
      this.scholarSelected = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : null;
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }
  }

  selectSchoolFilter() {
    const form = this.schoolsFilter.value;
    if (form && form.length) {
      this.schoolsFilter.patchValue(form);
    } else {
      this.schoolsFilter.patchValue(null);
    }
    this.getDataCampus();
  }
  selectCampusFilter() {
    const form = this.campusFilter.value;
    if (form && form.length) {
      this.campusFilter.patchValue(form);
    } else {
      this.campusFilter.patchValue(null);
    }
    this.getDataLevel();
  }
  selectLevelFilter() {
    const form = this.levelFilter.value;
    if (form && form.length) {
      this.levelFilter.patchValue(form);
    } else {
      this.levelFilter.patchValue(null);
    }
    this.getDataByLevel();
  }

  getDataCampus() {
    this.schoolName = '';
    this.levels = [];
    this.campusList = [];
    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }

    const school = this.schoolsFilter.value;
    if (
      this.currentUser &&
      this.currentUser.entities &&
      this.currentUser.entities.length &&
      this.currentUser.app_data &&
      this.currentUser.app_data.school_package &&
      this.currentUser.app_data.school_package.length &&
      this.schoolsFilter.value &&
      this.schoolsFilter.value.length
    ) {
      if (school && !school.includes('All')) {
        school.forEach((element) => {
          const sName = this.school.find((list) => list._id === element);
          this.schoolName = this.schoolName ? this.schoolName + ',' + sName.short_name : sName.short_name;
        });
      }
      this.currentUser.app_data.school_package.forEach((element) => {
        if (element && element.school && element.school._id && (school.includes(element.school._id) || school.includes('All'))) {
          this.campusList = _.concat(this.campusList, element.school.campuses);
        }
      });
    } else {
      if (school && !school.includes('All')) {
        school.forEach((element) => {
          const sName = this.school.find((list) => list._id === element);
          this.schoolName = this.schoolName ? this.schoolName + ',' + sName.short_name : sName.short_name;
        });

        const scampusList = this.listObjective.filter((list) => {
          return school.includes(list._id);
        });
        scampusList.filter((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.filter((campusData, nex) => {
              this.campusList.push(campusData);
              this.campusListBackup = this.campusList;
            });
          }
        });
      } else if (school && school.includes('All') && this.listObjective && this.listObjective.length) {
        this.listObjective.forEach((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.forEach((campusData, nex) => {
              this.campusList.push(campusData);
              this.campusListBackup = this.campusList;
            });
          }
        });
      } else {
        this.campusList = [];
      }
    }

    this.getDataLevel();
    const campuses = _.chain(this.campusList)
      .groupBy('name')
      .map((value, key) => ({
        name: key,
        _id: value && value.length ? value[0]._id : null,
        campuses: value,
      }))
      .value();
    if (campuses && campuses.length) {
      campuses.forEach((element, idx) => {
        let levelList = [];
        if (element && element.campuses && element.campuses.length) {
          element.campuses.forEach((camp, idCampx) => {
            levelList = _.concat(levelList, camp.levels);
          });
        }
        campuses[idx]['levels'] = _.uniqBy(levelList, 'name');
      });
    }
    this.campusList = _.uniqBy(campuses, '_id');
    this.campusList = this.campusList.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }

  getDataLevel() {
    this.levels = [];
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    const schools = this.schoolsFilter.value;
    const sCampus = this.campusFilter.value;
    if (
      this.currentUser &&
      this.currentUser.entities &&
      this.currentUser.entities.length &&
      this.currentUser.app_data &&
      this.currentUser.app_data.school_package &&
      this.currentUser.app_data.school_package.length &&
      this.campusFilter.value &&
      this.campusFilter.value.length
    ) {
      if (sCampus && sCampus.length && !sCampus.includes('All')) {
        this.currentUser.app_data.school_package.forEach((element) => {
          if (element && element.school && element.school._id && (schools.includes(element.school._id) || schools.includes('All'))) {
            const sLevelList = this.campusList.filter((list) => {
              return sCampus.includes(list.name);
            });

            sLevelList.forEach((lev) => {
              if (lev && lev.levels && lev.levels.length) {
                this.levels = _.concat(this.levels, lev.levels);
              }
            });
          }
        });
      } else if (sCampus && sCampus.length && sCampus.includes('All') && this.campusList && this.campusList.length) {
        this.campusList.forEach((lev) => {
          if (lev && lev.levels && lev.levels.length) {
            this.levels = _.concat(this.levels, lev.levels);
          }
        });
      }
    } else {
      if (schools && sCampus && !sCampus.includes('All')) {
        const sLevelList = this.campusList.filter((list) => {
          return sCampus.includes(list.name);
        });

        sLevelList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
            });
          }
        });
      } else if (sCampus && sCampus.includes('All') && this.campusList && this.campusList.length) {
        this.campusList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
            });
          }
        });
      } else {
        this.levels = [];
      }
    }
    this.levels = _.uniqBy(this.levels, 'name');
    this.levels = this.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }

  replaceToName(element) {
    let name = element;
    if (element) {
      if (element.includes('MR ')) {
        name = element.replaceAll('MR', this.translate.instant('MR'));
      }
      if (element.includes('MRS ')) {
        name = element.replaceAll('MRS', this.translate.instant('MRS'));
      }
      if (element.includes('neutral')) {
        name = element.replaceAll('neutral', '');
      }
    }
    return name;
  }
  getDataByLevel() {
    this.levels = _.uniqBy(this.levels, 'name');
    this.levels = this.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getCandidatesHistoryData();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      // Table Filters below
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'accounting_document', // name of the key in the object storing the filter
        column: 'Accounting Document', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.accountDocumentFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'date',
        column: 'Date',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.dateFilyer,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'transaction_type',
        column: 'Type of transaction',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.transactionFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'from',
        column: 'From',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.fromFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'bank',
        column: 'Bank',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.bankFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'student_last_name',
        column: 'Student',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.studentNameFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'super_filter',
        name: 'scholar_season',
        column: 'CARDDETAIL.Scholar Season',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.scholars,
        filterRef: this.scholarFilter,
        displayKey: 'scholar_season',
        savedValue: '_id',
        isSelectionInput: true,
        resetValue: 'All',
      },
      {
        type: 'super_filter',
        name: 'school',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.School',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.school,
        filterRef: this.schoolsFilter,
        displayKey: 'short_name',
        savedValue: '_id',
        isSelectionInput: true,
      },
      {
        type: 'super_filter',
        name: 'campus',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.campusList,
        filterRef: this.campusFilter,
        displayKey: 'name',
        savedValue: 'name',
        isSelectionInput: true,
      },
      {
        type: 'super_filter',
        name: 'level',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.levels,
        filterRef: this.levelFilter,
        displayKey: 'name',
        savedValue: 'name',
        isSelectionInput: true,
      },
      {
        type: 'action_filter',
        name: 'date',
        column: '',
        isMultiple: false,
        filterValue: this.actionFilterDate,
        filterList: null,
        filterRef: null,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
    ];

    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }
  removeSuperFilter(removeFilterCascadeName) {
    if (this.filterBreadcrumbData?.length && removeFilterCascadeName?.length) {
      removeFilterCascadeName.forEach((filter) => {
        const filterBreadcrumb = this.filterBreadcrumbData.find((data) => data.name === filter);
        if (filterBreadcrumb) {
          filterBreadcrumb.filterRef.setValue(null, { emitEvent: false });
          this.superFilter[filterBreadcrumb.name] = null;
          this.filteredValues[filterBreadcrumb.name] = null;
        }
      });
    }
  }
  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.filteredValues, this.filteredValues, this.actionFilterDate);
    if (filterItem.type === 'action_filter') {
      this.filterDate = '';
      this.whichFilterOn = null;
      this.filteredValues.date_from = '';
      this.filteredValues.date_to = '';
    } else if (filterItem.type === 'super_filter') {
      this.superFilter[filterItem.name] = null;
      if (filterItem.name === 'scholar_season') {
        this.removeSuperFilter(['school', 'campus', 'level']);
        const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
        this.getDataForList(scholarSeason);
      } else if (filterItem.name === 'school') {
        this.removeSuperFilter(['campus', 'level']);
        this.getDataCampus();
      } else if (filterItem.name === 'campus') {
        this.removeSuperFilter(['level']);
        this.getDataLevel();
      }
      this.applySuperFilter();
    }
    if (filterItem.type !== 'super_filter') {
      this.getCandidatesHistoryData();
    }
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesHistoryData();
      }
    }
  }

  resetTable() {
    this.isReset = true;
    this.selection.clear();
    this.dataSelected = [];
    this.pageSelected = [];
    this.dataUnselected = [];
    this.isCheckedAll = false;
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.whichFilterOn = null;
    this.schoolName = '';
    this.filterDate = '';
    this.filteredValues = {
      accounting_document: '',
      date: '',
      transaction_type: '',
      description: '',
      from: '',
      to: '',
      student_last_name: '',
      student_id: '',
      date_from: '',
      date_to: '',
      school: '',
      campus: '',
      bank: '',
      level: '',
      scholar_season: '',
    };

    this.superFilter = {
      level: '',
      campus: '',
      school: '',
      scholar_season: '',
    };

    this.schoolsFilter.setValue(null, { emitEvent: false });
    this.campusFilter.setValue(null, { emitEvent: false });
    this.levelFilter.setValue(null, { emitEvent: false });
    this.scholarFilter.setValue('All', { emitEvent: false });
    this.accountDocumentFilter.setValue('', { emitEvent: false });
    this.dateFilyer.setValue('', { emitEvent: false });
    this.transactionFilter.setValue('All', { emitEvent: false });
    this.bankFilter.setValue('All', { emitEvent: false });
    this.descriptionFilter.setValue('', { emitEvent: false });
    this.fromFilter.setValue('', { emitEvent: false });
    this.toFilter.setValue('', { emitEvent: false });
    this.studentNameFilter.setValue('', { emitEvent: false });
    this.studentFilter.setValue('', { emitEvent: false });

    this.school = [];
    this.campusList = [];
    this.levels = [];
    this.scholarSelected = [];
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.getCandidatesHistoryData();
    this.isDisabled = true;
    if (this.scholarFilter.value) {
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }
    this.filterBreadcrumbData = [];
    this.actionFilterDate.date = '';
  }

  getCandidatesHistoryData() {
    this.isLoading = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filters = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.financeService.GetAllTransactionHistories(pagination, filters, userTypesList).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.dataSource.data = students;

          this.dataSource.data.forEach((element) => {
            if (element && element.from && element.from.includes('neutral')) {
              element.from = element.from.replace('neutral ', '');
            }
          });

          this.paginator.length = students[0].count_document;
          this.dataCount = students[0].count_document;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }

        if (this.dataSelected.length === 0 && this.dataSource.data && this.dataSource.data.length) {
          this.totalDebit = this.dataSource.data[0].total_debit ? this.dataSource.data[0].total_debit : 0;
          this.totalCredit = this.dataSource.data[0].total_credit ? this.dataSource.data[0].total_credit : 0;
        } else if (this.dataSelected.length === 0) {
          this.totalDebit = 0;
          this.totalCredit = 0;
        }

        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isLoading = false;
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      (err) => {
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isLoading = false;
        // Record error log
        this.userService.postErrorLog(err);

        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
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
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  getBankDropdown() {
    this.subs.sink = this.financeService.GetAllBanksFromTransactionhistory().subscribe(
      (resp) => {
        this.bank = resp.filter(Boolean);
      },
      (err) => {
        // Record error log
        this.userService.postErrorLog(err);
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
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
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  parseIndex(index) {
    return parseInt(index);
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    if (numSelected) {
      this.enableAllTopActions();
    } else {
      this.disableAllTopActions();
    }

    return numSelected === numRows;
  }

  initFilter() {
    this.subs.sink = this.accountDocumentFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,+*$&#%^!\/]/g;
      const symbol1 = /\\/;
      if (statusSearch) {
        if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
          this.filteredValues.accounting_document = statusSearch ? statusSearch : '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.pageSelected = [];
            this.getCandidatesHistoryData();
          }
        } else {
          const dataReplace = statusSearch.replace(symbol, '');
          this.accountDocumentFilter.setValue(dataReplace);
        }
      } else {
        this.filteredValues.accounting_document = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.selection.clear();
          this.dataSelected = [];
          this.pageSelected = [];
          this.isCheckedAll = false;
          this.getCandidatesHistoryData();
        }
      }
    });
    this.subs.sink = this.fromFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,+*$&#%^!\/]/g;
      const symbol1 = /\\/;
      if (statusSearch) {
        if (statusSearch && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
          this.filteredValues.from = statusSearch ? statusSearch : '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.pageSelected = [];
            this.getCandidatesHistoryData();
          }
        } else {
          const dataReplace = statusSearch.replace(symbol, '');
          this.fromFilter.setValue(dataReplace);
        }
      } else {
        this.filteredValues.from = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.selection.clear();
          this.dataSelected = [];
          this.pageSelected = [];
          this.isCheckedAll = false;
          this.getCandidatesHistoryData();
        }
      }
    });
    this.subs.sink = this.studentNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,+*$&#%^!\/]/g;
      const symbol1 = /\\/;
      if (statusSearch) {
        if (statusSearch && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
          this.filteredValues.student_last_name = statusSearch ? statusSearch : '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.pageSelected = [];
            this.getCandidatesHistoryData();
          }
        } else {
          const dataReplace = statusSearch.replace(symbol, '');
          this.studentNameFilter.setValue(dataReplace);
        }
      } else {
        this.filteredValues.student_last_name = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.selection.clear();
          this.dataSelected = [];
          this.pageSelected = [];
          this.isCheckedAll = false;
          this.getCandidatesHistoryData();
        }
      }
    });
    this.subs.sink = this.dateFilyer.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.date = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.pageSelected = [];
          this.getCandidatesHistoryData();
        }
      }
    });
    this.subs.sink = this.transactionFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.transaction_type = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.pageSelected = [];
        this.getCandidatesHistoryData();
      }
    });
    this.subs.sink = this.bankFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.bank = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.pageSelected = [];
        this.getCandidatesHistoryData();
      }
    });
    this.subs.sink = this.descriptionFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.description = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.pageSelected = [];
        this.getCandidatesHistoryData();
      }
    });
    this.subs.sink = this.schoolsFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.level = '';
      this.superFilter.campus = '';
      this.superFilter.school = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
      if (!this.isReset) {
        this.pageSelected = [];
      }
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.level = '';
      this.superFilter.campus = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
      if (!this.isReset) {
        this.pageSelected = [];
      }
    });

    this.subs.sink = this.levelFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.level = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
      if (!this.isReset) {
        this.pageSelected = [];
      }
    });

    this.subs.sink = this.scholarFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.level = '';
      this.superFilter.campus = '';
      this.superFilter.school = '';
      this.superFilter.scholar_season = statusSearch === '' || statusSearch === 'All' ? '' : statusSearch;
      if (!this.isReset) {
        this.pageSelected = [];
      }
    });
  }
  // disable all top action buttons
  disableAllTopActions() {
    this.disableExport = true;
    this.disableToday = true;
    this.disableYesterday = true;
    this.disableLast7Days = true;
    this.disableLast30Days = true;
    this.disableThisMonth = true;
  }
  enableAllTopActions() {
    this.disableExport = false;
    this.disableToday = false;
    this.disableYesterday = false;
    this.disableLast7Days = false;
    this.disableLast30Days = false;
    this.disableThisMonth = false;
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';

    let schoolsMap;
    let campusesMap;
    let levelsMap;

    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'school') {
          schoolsMap = filterData.school.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` schools:[${schoolsMap}]`;
        } else if (key === 'scholar_season') {
          filterQuery = filterQuery + ` scholar_season:"${filterData[key]}"`;
        } else if (key === 'level') {
          levelsMap = filterData.level.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` candidate_levels:[${levelsMap}]`;
        } else if (key === 'campus') {
          campusesMap = filterData.campus.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` candidate_campuses:[${campusesMap}]`;
        } else {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        }
      }
    });

    // const filterPayload = {
    //   filter: filterQuery,
    // };
    // return filterPayload;
    // return _.omitBy(filterData, _.isNil);
    // return filterQuery;
    return 'filter: {' + filterQuery + '}';
  }

  lettrageDialog(data) {
    this.subs.sink = this.dialog
      .open(HistoryLettrageDialogComponent, {
        width: '800px',
        minHeight: '100px',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {
        this.updateTransactionLettrage(resp);
      });
  }

  reconciliationDialog(data) {
    const totalStudentAssigned = this.dummyData.reduce((acc, curr) => {
      if (curr.accounting_document) {
        acc = acc + 1;
      }
      return acc;
    }, 0);
    const studentArray = [];
    if (data && data.student_id) {
      studentArray.push(data.student_id);
    }
    data.student_ids = studentArray;
    this.subs.sink = this.dialog
      .open(HistoryReconciliationDialogComponent, {
        width: '800px',
        minHeight: '100px',
        disableClose: true,
        data: { ...data, totalStudentAssigned },
      })
      .afterClosed()
      .subscribe((result) => {
        this.updateTransactionReconciliation(result);
      });
  }

  translateDate(datee, timee) {
    const finalTime = timee ? timee : '15:59';
    if (datee) {
      const date = this.parseStringDatePipe.transformStringToDate(this.parseUTCToLocalPipe.transformDate(datee, finalTime));
      return moment(date, 'DD/MM/YYYY').format('DD/MM/YY');
    } else {
      return '';
    }
  }

  updateTransactionReconciliation(data) {
    const payload = {
      candidate_id: data.candidate_id ? data.candidate_id : null,
      student_id: data.student_id ? data.student_id._id : null,
      from: data.from,
    };
    this.subs.sink = this.financeService.UpdateTransactionHistory(payload, data._id).subscribe(
      (resp) => {
        if (resp) {
          this.getCandidatesHistoryData();
        }
      },
      (err) => {
        // Record error log
        this.userService.postErrorLog(err);
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
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
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  updateTransactionLettrage(result) {
    if (result && result._id) {
      const dataSelected = [];
      // modify the table data with the data from dialog
      const tableDataIndex = this.dummyData.findIndex((dt) => dt._id === result._id);
      let selected = result.student_id.billing_id.terms.filter((list) => list.status && list.status === true);
      this.dummyData[tableDataIndex] = result;
      if (result.transaction && result.transaction === 'deposit') {
        const deposit = {
          transaction: 'deposit',
          term_index: null,
          term_payment: null,
        };
        dataSelected.push(deposit);
      }
      if (selected && selected.length) {
        selected = selected.sort((a, b) => (a.term_index > b.term_index ? 1 : -1));
        selected.forEach((list) => {
          const terms = {
            transaction: 'term',
            term_index: list.term_index,
            term_payment: list.term_payment,
          };
          dataSelected.push(terms);
        });
      }
      this.subs.sink = this.financeService.ChangeLetterage(dataSelected, result._id).subscribe(
        (resp) => {
          if (resp) {
            this.getCandidatesHistoryData();
          }
        },
        (err) => {
          // Record error log
          this.userService.postErrorLog(err);
          if (
            err &&
            err['message'] &&
            (err['message'].includes('jwt expired') ||
              err['message'].includes('str & salt required') ||
              err['message'].includes('Authorization header is missing') ||
              err['message'].includes('salt'))
          ) {
            this.userService.handlerSessionExpired();
            return;
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
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    }
  }

  formatCurrency(data) {
    let num = '';
    if (data) {
      num = parseInt(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
      num = num.toString().slice(0, -3);
    }
    return num;
  }

  resetFilterObject() {
    this.whichFilterOn = null;
    this.filteredValues = {
      accounting_document: '',
      date: '',
      transaction_type: '',
      description: '',
      from: '',
      to: '',
      student_last_name: '',
      student_id: '',
      date_from: '',
      date_to: '',
      school: '',
      bank: '',
      campus: '',
      level: '',
      scholar_season: '',
    };
  }

  todayDetails() {
    this.filterDate = 'today';
    this.actionFilterDate.date = 'Today';
    this.whichFilterOn = 'today';
    this.filteredValues.date_from = moment().format('DD/MM/YYYY');
    this.filteredValues.date_to = moment().add(1, 'days').format('DD/MM/YYYY');
    this.getCandidatesHistoryData();
  }

  filterDateRange(dateRange) {
    this.filterDate = dateRange;
    this.whichFilterOn = dateRange;
    if (dateRange === 'yesterday') {
      this.actionFilterDate.date = 'Yesterday';
      this.filteredValues.date_from = moment().subtract(1, 'days').format('DD/MM/YYYY');
      this.filteredValues.date_to = moment().format('DD/MM/YYYY');
    } else if (dateRange === 'lastWeek') {
      this.actionFilterDate.date = 'Last 7 days';
      this.filteredValues.date_from = moment().subtract(6, 'days').format('DD/MM/YYYY');
      this.filteredValues.date_to = moment().add(1, 'days').format('DD/MM/YYYY');
    } else if (dateRange === 'lastMonth') {
      this.actionFilterDate.date = 'Last 30 days';
      this.filteredValues.date_from = moment().subtract(29, 'days').format('DD/MM/YYYY');
      this.filteredValues.date_to = moment().add(1, 'days').format('DD/MM/YYYY');
    } else if (dateRange === 'thisMonth') {
      this.actionFilterDate.date = 'This month';
      this.filteredValues.date_to = moment().endOf('month').add(1, 'days').format('DD/MM/YYYY');
      this.filteredValues.date_from = moment().startOf('month').format('DD/MM/YYYY');
    }

    this.getCandidatesHistoryData();
  }

  // viewProfileInfo(profileId, tab?) {
  //   const query = {
  //     selectedProfile: profileId,
  //     tab: tab ? tab : '',
  //   };
  //   const url = this.router.createUrlTree(['internship-file'], { queryParams: query });
  //   window.open(url.toString(), '_blank');
  // }

  viewProfileInfo(profileId, tab?) {
    const query = {
      selectedCandidate: profileId,
      sortValue: this.sortValue || '',
      tab: tab || '',
      paginator: JSON.stringify({
        pageIndex: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize,
      }),
    };
    const url = this.router.createUrlTree(['candidate-file'], { queryParams: query });
    window.open(url.toString(), '_blank');
  }

  sendMailDialog(data) {
    this.mailStudentsDialog = this.dialog.open(MailHistoryFinanceDialogComponent, {
      disableClose: true,
      width: '750px',
      data: data,
    });
  }

  addTask(data) {
    this.subs.sink = this.dialog
      .open(AddHistoryTaskDialogComponent, {
        width: '600px',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {});
  }
  getDate(element) {
    let dates;
    if (
      element &&
      element.candidate_id &&
      element.candidate_id.billing_id &&
      element.candidate_id.billing_id.terms &&
      element.candidate_id.billing_id.terms.length &&
      element.term_index &&
      element.candidate_id.billing_id.terms[parseInt(element.term_index)]
    ) {
      dates = element.candidate_id.billing_id.terms[parseInt(element.term_index)].term_payment.date;
    }
    return dates;
  }

  getAmount(element) {
    let amount;
    if (
      element &&
      element.candidate_id &&
      element.candidate_id.billing_id &&
      element.candidate_id.billing_id.terms &&
      element.candidate_id.billing_id.terms.length &&
      element.term_index &&
      element.candidate_id.billing_id.terms[parseInt(element.term_index)]
    ) {
      amount = element.candidate_id.billing_id.terms[parseInt(element.term_index)].term_amount;
    }
    return amount;
  }

  getCreditOrDebitAmount(element) {
    if (element && element.credit && element.credit > 0) {
      return element.credit;
    } else if (element && element.debit && element.debit > 0) {
      return element.debit;
    } else {
      return 0;
    }
  }

  intakeChannel(data) {
    let intakeChannel = '';
    if (
      data &&
      data.intake_channel &&
      data.intake_channel.scholar_season_id &&
      data.intake_channel.program &&
      data.intake_channel.scholar_season_id.scholar_season
    ) {
      intakeChannel = data.intake_channel.scholar_season_id.scholar_season.concat(' ', data.intake_channel.program);
      return intakeChannel;
    } else {
      return '';
    }
  }

  downloadCSV() {
    if (!this.dataSelected.length && (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselected && this.dataUnselected.length))) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Finance History') }),
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
        title: this.translate.instant('IMPORT_DECISION_S1.TITLE'),
        width: 465,
        allowEscapeKey: true,
        showCancelButton: true,
        cancelButtonText: this.translate.instant('IMPORT_DECISION_S1.CANCEL'),
        confirmButtonText: this.translate.instant('IMPORT_DECISION_S1.OK'),
        input: 'radio',
        inputOptions: inputOptions,
        inputValue: this.translate && this.translate.currentLang === 'fr' ? ';' : '',
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
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const search = this.cleanFilterDataExport();
    const importStudentTemlate = `downloadFinanceHistory/`;
    let filtered = '';
    let ids = '';
    console.log('check', this.isCheckedAll, this.dataSelected);
    if (
      (this.dataSelected.length && !this.isCheckedAll) ||
      (this.isCheckedAll && this.dataUnselected && this.dataUnselected.length && this.dataSelected.length)
    ) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      ids = `"transaction_ids":` + `[` + mappedUserId.toString() + `]`;
    }
    filtered =
      search.slice(0, 10) +
      ids +
      (search &&
      search.slice(10) !== '}' &&
      this.dataSelected.length &&
      (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselected && this.dataUnselected.length))
        ? ','
        : '') +
      search.slice(10);
    const userTypesList =
      this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id.map((res) => `"` + res + `"`) : [];
    const fullUrl = url + importStudentTemlate + fileType + '/' + lang + '/' + this.currentUser._id;
    console.log('fullURL', fullUrl);
    const uri = encodeURI(fullUrl);
    const options = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
        'Content-Type': 'application/json',
      }),
    };
    const payload =
      '{' + filtered + ',' + '"user_type_ids":[' + userTypesList + ']' + ',"user_type_id":' + `"${this.currentUserTypeId}"` + '}';
    this.isLoading = true;
    this.subs.sink = this.http.post(uri, payload, options).subscribe(
      (response) => {
        this.isLoading = false;
        if (response) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('ReAdmission_S3.TITLE'),
            text: this.translate.instant('ReAdmission_S3.TEXT'),
            confirmButtonText: this.translate.instant('ReAdmission_S3.BUTTON'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.getCandidatesHistoryData();
            this.selection.clear();
            this.dataSelected = [];
            this.pageSelected = [];
            this.dataUnselected = [];
            this.allStudentForCheckbox = [];
            this.isCheckedAll = false;
          });
        }
      },
      (error) => {
        this.isLoading = false;
      },
    );
  }

  cleanFilterDataExport() {
    this.isThereFilter = false;
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    let schoolsMap;
    let campusesMap;
    let levelsMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'school') {
          schoolsMap = filterData.school.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + `, "schools":[${schoolsMap}]` : filterQuery + ` "schools":[${schoolsMap}]`;
        } else if (key === 'campus') {
          campusesMap = filterData.campus.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + `, "candidate_campuses":[${campusesMap}]`
            : filterQuery + ` "candidate_campuses":[${campusesMap}]`;
        } else if (key === 'level') {
          levelsMap = filterData.level.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + `, "candidate_levels":[${levelsMap}]`
            : filterQuery + ` "candidate_levels":[${levelsMap}]`;
        } else {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        }
      }
    });
    if (filterQuery) {
      this.isThereFilter = true;
    }
    return '"filter":{' + filterQuery + '}';
  }

  applySuperFilter() {
    this.pageSelected = [];
    this.paginator.pageIndex = 0;
    this.filteredValues = {
      ...this.filteredValues,
      scholar_season: this.superFilter.scholar_season,
      school: this.superFilter.school,
      campus: this.superFilter.campus,
      level: this.superFilter.level,
    };
    this.isDisabled = true;
    this.getCandidatesHistoryData();
  }

  getAllFinanceForExport(pageIndex: number) {
    if (this.buttonClicked === 'export') {
      if (this.isCheckedAll) {
        if (this.dataUnselected.length < 1) {
          this.downloadCSV();
        } else {
          if (pageIndex === 0) {
            this.allHistoryForExport = [];
            this.dataSelected = [];
          }
          const filter = this.cleanFilterData();
          const pagination = {
            limit: 500,
            page: pageIndex,
          };
          this.isLoading = true;
          this.subs.sink = this.financeService.GetAllTransactionHistoriesForExport(pagination, filter, this.currentUserTypeId).subscribe(
            (histories) => {
              if (histories?.length) {
                this.allHistoryForExport = _.concat(this.allHistoryForExport, _.cloneDeep(histories));
                this.getAllFinanceForExport(pageIndex + 1);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.allHistoryForExport.length > 0) {
                  this.dataSelected = this.allHistoryForExport.filter((item) => !this.dataUnselected.includes(item?._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  this.downloadCSV();
                }
              }
            },
            (error) => {
              this.isReset = false;
              this.isLoading = false;
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error?.message || error,
                confirmButtonText: this.translate.instant('OK'),
                allowOutsideClick: false,
              });
            },
          );
        }
      } else {
        this.downloadCSV();
      }
    }
  }

  controllerButton(action: string) {
    switch (action) {
      case 'export':
        setTimeout(() => {
          this.getAllFinanceForExport(0);
        }, 500);
        break;
      default:
        this.resetFilterObject();
    }
  }

  isAllDropdownSelected(type) {
    if (type === 'scholar') {
      const selected = this.scholarFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.scholars.length;
      return isAllSelected;
    } else if (type === 'school') {
      const selected = this.schoolsFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.school.length;
      return isAllSelected;
    } else if (type === 'campus') {
      const selected = this.campusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.campusList.length;
      return isAllSelected;
    } else if (type === 'level') {
      const selected = this.levelFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.levels.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'scholar') {
      const selected = this.scholarFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.scholars.length;
      return isIndeterminate;
    } else if (type === 'school') {
      const selected = this.schoolsFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.school.length;
      return isIndeterminate;
    } else if (type === 'campus') {
      const selected = this.campusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.campusList.length;
      return isIndeterminate;
    } else if (type === 'level') {
      const selected = this.levelFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.levels.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'scholar') {
      if (event.checked) {
        this.scholarFilter.patchValue('All', { emitEvent: false });
      } else {
        this.scholarFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'school') {
      if (event.checked) {
        const schoolData = this.school.map((el) => el._id);
        this.schoolsFilter.patchValue(schoolData, { emitEvent: false });
      } else {
        this.schoolsFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'campus') {
      if (event.checked) {
        const campusData = this.campusList.map((el) => el.name);
        this.campusFilter.patchValue(campusData, { emitEvent: false });
      } else {
        this.campusFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'level') {
      if (event.checked) {
        const levelData = this.levels.map((el) => el.name);
        this.levelFilter.patchValue(levelData, { emitEvent: false });
      } else {
        this.levelFilter.patchValue(null, { emitEvent: false });
      }
    }
  }

  ngOnDestroy() {
    this.pageTitleService.setMessage('');
    this.subs.unsubscribe();
  }
}
