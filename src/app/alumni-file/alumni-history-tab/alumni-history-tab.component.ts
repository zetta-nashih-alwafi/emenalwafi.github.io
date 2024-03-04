import { Observable } from 'rxjs';
import * as _ from 'lodash';
import * as moment from 'moment';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, Input, OnChanges, EventEmitter, Output } from '@angular/core';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SubSink } from 'subsink';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { UntypedFormControl } from '@angular/forms';
import { CandidatesHistoryService } from 'app/service/candidates-history/candidates-history.service';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslateService } from '@ngx-translate/core';
import { AlumniService } from 'app/service/alumni/alumni.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { PermissionService } from 'app/service/permission/permission.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-alumni-history-tab',
  templateUrl: './alumni-history-tab.component.html',
  styleUrls: ['./alumni-history-tab.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseLocalToUtcPipe],
})
export class AlumniHistoryTabComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() candidate;
  @Output() reloadData: EventEmitter<boolean> = new EventEmitter();
  alumniId = '';
  today: Date;
  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = ['select', 'date', 'time', 'action', 'description', 'who'];

  filterColumns: String[] = ['selectFilter', 'dateFilter', 'timeFilter', 'actionFilter', 'descriptionFilter', 'whoFilter'];

  maleIcon = '../../../../../assets/img/student_icon.png';
  femaleIcon = '../../../../../assets/img/student_icon_fem.png';
  yesterdayIcon = '../../../../../assets/img/icon-yesterday.png';
  last7DaysIcon = '../../../../../assets/img/icon-7-days.png';
  last30DaysIcon = '../../../../../assets/img/icon-30-days.png';
  thisMonthIcon = '../../../../../assets/img/icon-this-month.png';

  // actionFilter = new UntypedFormControl('All');
  descriptionFilter = new UntypedFormControl('');
  whoFilter = new UntypedFormControl('');
  dateFilter = new UntypedFormControl('');
  actionFilter = new UntypedFormControl('AllF');
  // timeFilter = new UntypedFormControl('');
  selection = new SelectionModel<any>(true, []);
  filteredValues = {
    history_date: '',
    description: '',
    who: '',
    action: '',
  };
  isWaitingForResponse = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  config: MatDialogConfig = {
    disableClose: true,
    width: '600px',
  };
  actionList = ['Send survey', 'Update informations', 'Create commentary', 'Alumni Created'];

  dataCount = 0;
  private subs = new SubSink();
  noData: any;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  exportName: 'Export';
  selectType: any;
  entityData: any;
  userSelected: any[];
  disableExport = true;
  disableToday = true;
  disableYesterday = true;
  disableLast7Days = true;
  disableLast30Days = true;
  disableThisMonth = true;
  titleList = [];
  originalTitleList = [];
  schoolList = [];
  originalCandidateList = [];
  isLoading: Boolean;

  dataSelected = [];
  pageSelected = [];
  isCheckedAll = false;
  allStudentForCheckbox = [];
  disabledExport = false;
  userSelectedId = [];

  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    private alumniService: AlumniService,
    public utilitySevice: UtilityService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private parseLocalToUtcPipe: ParseLocalToUtcPipe,
    public permissionService: PermissionService,
    private authService: AuthService
  ) {}
  ngOnInit() {
    this.today = new Date();
    this.initFilter();
    this.getAlumniHistoryData();
  }

  ngOnChanges() {
    this.resetTable();
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getAlumniHistoryData();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAlumniHistoryData();
      }
    }
  }

  resetCheckbox() {
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
  }

  getTime(data) {
    let time = '';
    if (data.action === 'survey') {
      time = this.parseUTCToLocalPipe.transform(data.history_time);
    } else {
      time = data.history_time ? data.history_time : '-';
    }
    return time;
  }

  parseDateToLocal(createdAt) {
    const date = createdAt.history_date;
    const time = createdAt.history_time;

    if (date && time) {
      const parsed = this.parseUTCToLocalPipe.transformDate(date, time);
      return parsed;
    } else {
      return '';
    }
  }

  parseTimeToLocal(createdAt) {
    const time = createdAt.history_time;

    if (time) {
      const parsed = this.parseUTCToLocalPipe.transform(time);
      return parsed;
    } else {
      return '';
    }
  }

  getAlumniHistoryData() {
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    if (this.candidate && this.candidate._id) {
      this.alumniId = this.candidate._id;
    } else {
      this.alumniId = null;
    }
    const filter = this.cleanFilterData();
    if (this.alumniId) {
      this.isLoading = true;
      this.isWaitingForResponse = true;
      this.subs.sink = this.alumniService.getAllAlumniHistoryDetail(pagination, filter, this.alumniId, this.sortValue).subscribe(
        (histories) => {
          if (histories && histories.length) {
            this.dataSource.data = histories;
            this.paginator.length = histories[0].count_document;
            this.dataCount = histories[0].count_document;
          } else {
            this.dataSource.data = [];
            this.paginator.length = 0;
            this.dataCount = 0;
          }
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isReset = false;
          this.isLoading = false;
          this.isWaitingForResponse = false;
        },
        (error) => {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isReset = false;
          this.isLoading = false;
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
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    // console.log(numSelected, numRows);
    return numSelected === numRows || numSelected > numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      this.getDataAllForCheckbox(0);
    }
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  showOptions(info, row) {
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
    const numSelected = this.selection.selected.length;
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
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isLoading = true;
    const filter = this.cleanFilterData();
    this.subs.sink = this.alumniService.getAllAlumniHistoryCheckbox(pagination, filter, this.alumniId, this.sortValue).subscribe(
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
            this.pageSelected.push(this.paginator.pageIndex);
          } else {
            this.pageSelected = [];
          }
        }
      },
      (error) => {
        this.isReset = false;
        this.isLoading = false;
        this.authService.postErrorLog(error);
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

  cleanFilterDataExport() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      if (filterData[key] || filterData[key] === false) {
        if (key === 'last_survey_sent') {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${filterData[key]}` : filterQuery + `"${key}":${filterData[key]}`;
        } else {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        }
      }
    });
    return 'filter= {' + filterQuery + '}';
  }

  csvDownload() {
    if (this.selection.selected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Alumni') }),
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
    const action = this.filteredValues.action !== null ? this.filteredValues.action : '';
    const description = this.filteredValues.description !== null ? this.filteredValues.description : '';
    const history_date = this.filteredValues.history_date !== null ? this.filteredValues.history_date : '';
    const who = this.filteredValues.who !== null ? this.filteredValues.who : '';
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const endPoint = `downloadAlumniHistoryCSV/`;
    let filtered;
    if (
      (this.dataSelected.length && !this.isCheckedAll) ||
      (this.allStudentForCheckbox && this.allStudentForCheckbox.length && this.selectType === 'one')
    ) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      console.log(mappedUserId);
      filtered =
        `filter={"alumni_history_ids":` +
        `[` +
        mappedUserId.toString() +
        `],"action":"` +
        action +
        `","description":"` +
        description +
        `","history_date":"` +
        history_date +
        `","who":"` +
        who +
        `"}`;
    } else {
      filtered =
        `filter={"action":"` + action + `","description":"` + description + `","history_date":"` + history_date + `","who":"` + who + `"}`;
    }
    element.href = encodeURI(url + endPoint + fileType + '/' + lang + '/' + this.alumniId + '?' + filtered);
    console.log(element.href);
    element.target = '_blank';
    element.download = 'Template Import CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  initFilter() {
    this.subs.sink = this.actionFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.action = statusSearch === 'AllF' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      this.resetCheckbox();
      if (!this.isReset) {
        this.getAlumniHistoryData();
      }
    });
    this.subs.sink = this.dateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        this.resetCheckbox();
        console.log('dateFilyer 1');
        const newDate = date ? this.parseLocalToUtcPipe.transformDate(moment(date).format('DD/MM/YYYY'), '15:59') : null;
        this.filteredValues.history_date = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAlumniHistoryData();
        }
      }
    });

    this.subs.sink = this.descriptionFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      this.resetCheckbox();
      if (!name.match(symbol) && !name.match(symbol1)) {
        this.filteredValues.description = name;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAlumniHistoryData();
        }
      } else {
        this.descriptionFilter.setValue('');
        this.filteredValues.description = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAlumniHistoryData();
        }
      }
    });

    this.subs.sink = this.whoFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      this.resetCheckbox();
      if (!name.match(symbol) && !name.match(symbol1)) {
        this.filteredValues.who = name;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAlumniHistoryData();
        }
      } else {
        this.whoFilter.setValue('');
        this.filteredValues.who = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAlumniHistoryData();
        }
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

  resetTable() {
    this.isReset = true;
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.filteredValues = {
      history_date: '',
      description: '',
      who: '',
      action: '',
    };

    this.descriptionFilter.setValue('', { emitEvent: false });
    this.actionFilter.setValue('AllF', { emitEvent: false });
    this.whoFilter.setValue('', { emitEvent: false });
    this.dateFilter.setValue('', { emitEvent: false });

    this.sortValue = null;

    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = '';
    this.sort.direction = '';
    this.sort.active = '';
    this.getAlumniHistoryData();
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      if (filterData[key] || filterData[key] === false) {
        filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  filterDateRange(dateRange) {
    // this.filterDate = dateRange;
    // if (dateRange === 'yesterday') {
    //   this.filteredValues.date_from = moment().subtract(1, 'days').format('DD/MM/YYYY');
    //   this.filteredValues.date_to = moment().format('DD/MM/YYYY');
    // } else if (dateRange === 'lastWeek') {
    //   this.filteredValues.date_from = moment().subtract(7, 'days').format('DD/MM/YYYY');
    //   this.filteredValues.date_to = moment().add(1, 'days').format('DD/MM/YYYY');
    // } else if (dateRange === 'lastMonth') {
    //   this.filteredValues.date_from = moment().subtract(1, 'months').format('DD/MM/YYYY');
    //   this.filteredValues.date_to = moment().add(1, 'days').format('DD/MM/YYYY');
    // } else if (dateRange === 'thisMonth') {
    //   this.filteredValues.date_to = moment().add(1, 'months').format('DD/MM/YYYY');
    //   this.filteredValues.date_from = moment().format('DD/MM/YYYY');
    // }
    // this.getAlumniHistoryData();
  }


  updateAlumniSurveyDescription(element) {
    let data = '';
    data = element.replace('Send survey', this.translate.instant('Send surveys'));
    return data;
  }
}
