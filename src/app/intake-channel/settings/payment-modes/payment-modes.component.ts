import { HttpHeaders, HttpClient } from '@angular/common/http';
import { UtilityService } from 'app/service/utility/utility.service';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FinancesService } from 'app/service/finance/finance.service';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { SelectionModel } from '@angular/cdk/collections';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { ExportCsvService } from 'app/service/export-csv/export-csv.service';
import { AddPaymentModesDialogComponent } from './add-payment-modes-dialog/add-payment-modes-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PermissionService } from 'app/service/permission/permission.service';

@Component({
  selector: 'ms-payment-modes',
  templateUrl: './payment-modes.component.html',
  styleUrls: ['./payment-modes.component.scss'],
})
export class PaymentModesComponent implements OnInit, OnDestroy, AfterViewInit {
  dataSource = new MatTableDataSource([]);
  titleData: any;
  noData: any;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  displayedColumns: string[] = ['select', 'mode', 'description', 'terms', 'percentages', 'additional', 'action'];
  filteredValues = {
    name: '',
    description: '',
    scholar_season_id: '',
  };
  dataSelected = [];
  pageSelected = [];
  allStudentForCheckbox = [];
  intakeChannelCount;
  isWaitingForResponse = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  selection = new SelectionModel<any>(true, []);

  intackChannelCount;
  isLoading: Boolean = false;
  dataCount = 0;
  private subs = new SubSink();
  modeFilter = new UntypedFormControl('');
  descriptionFilter = new UntypedFormControl('');
  private timeOutVal: any;
  disabledExport = true;
  selectType;
  paymentSelected = [];
  scholarSeasonId: any;
  scholarSeasons: any;
  allInternshipId = [];
  exportName: string;
  isCheckedAll = false;

  dataSelectedId: any[];
  userSelected = [];
  userSelectedId = [];

  allExportForCheckbox = [];
  dataUnselectUser = [];
  buttonClicked = '';
  currentUserTypeId: any;

  @Input('scholarSeasonId') set selectedScholarSeasonID(value) {
    this.filteredValues.scholar_season_id = value || null;
    this.scholarSeasonId = value || null;
  }
  constructor(
    private dialog: MatDialog,
    private financeService: FinancesService,
    private translateService: TranslateService,
    private pageTitleService: PageTitleService,
    private exportCsvService: ExportCsvService,
    private utilityService: UtilityService,
    private userService: AuthService,
    public permission: PermissionService,
    private httpClient: HttpClient,
  ) {}
  ngOnInit() {
    const currentUser = this.userService.getLocalStorageUser();
    const isPermission = this.userService.getPermission();
    const currentUserEntity = currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    this.initFilter();
    this.getSchoolsData();

    this.pageTitleService.setTitle(
      this.translateService.instant('INTAKE_CHANNEL.PAGE_TITLE.Settings') +
        ' - ' +
        this.translateService.instant('ADMISSION.TITLE_PAYMENT_MODES'),
    );
    this.subs.sink = this.translateService.onLangChange.subscribe(() => {
      this.pageTitleService.setTitle(
        this.translateService.instant('INTAKE_CHANNEL.PAGE_TITLE.Settings') +
          ' - ' +
          this.translateService.instant('ADMISSION.TITLE_PAYMENT_MODES'),
      );
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getSchoolsData();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getSchoolsData() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    this.subs.sink = this.financeService.getAllPaymentModes(pagination, this.sortValue, filter).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.dataSource.data = students;
          this.paginator.length = students[0].count_document;
          this.dataCount = students[0].count_document;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.disabledExport = true;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
      },
      (err) => {
        // Record error log
        this.userService.postErrorLog(err);
        this.disabledExport = true;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
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
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: err && err['message'] ? this.translateService.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.selection.clear();
      this.allExportForCheckbox = [];
      this.dataSelected = [];
      this.isCheckedAll = false;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getSchoolsData();
      }
    }
  }

  resetTable() {
    this.isReset = true;
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });

    this.filteredValues = {
      name: '',
      description: '',
      scholar_season_id: this.scholarSeasonId,
    };
    this.disabledExport = true;
    this.modeFilter.setValue(null, { emitEvent: false });
    this.descriptionFilter.setValue(null, { emitEvent: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.getSchoolsData();
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

  cleanFilterDataCSV() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
      }
    });
    return 'filter={' + filterQuery + '}';
  }

  initFilter() {
    this.subs.sink = this.modeFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.selection.clear();
        this.isCheckedAll = false;
        this.filteredValues.name = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.selection.clear();
          this.isCheckedAll = false;
          this.getSchoolsData();
        } else if (statusSearch === '') {
          this.selection.clear();
          this.isCheckedAll = false;
          this.modeFilter.setValue('');
          this.filteredValues.name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getSchoolsData();
          }
        }
      } else {
        this.selection.clear();
        this.isCheckedAll = false;
        this.modeFilter.setValue('');
        this.filteredValues.name = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getSchoolsData();
        }
      }
    });
    this.subs.sink = this.descriptionFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.selection.clear();
        this.isCheckedAll = false;
        this.filteredValues.description = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.selection.clear();
          this.isCheckedAll = false;
          this.getSchoolsData();
        } else if (statusSearch === '') {
          this.selection.clear();
          this.isCheckedAll = false;
          this.descriptionFilter.setValue('');
          this.filteredValues.description = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getSchoolsData();
          }
        }
      } else {
        this.selection.clear();
        this.isCheckedAll = false;
        this.descriptionFilter.setValue('');
        this.filteredValues.description = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getSchoolsData();
        }
      }
    });
  }

  addPaymentModeDialog() {
    this.subs.sink = this.dialog
      .open(AddPaymentModesDialogComponent, {
        width: '1320px',
        minHeight: '100px',
        disableClose: true,
        data: {
          scholarSeasonId: this.scholarSeasonId,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getSchoolsData();
        }
      });
  }

  editPaymentModeDialog(data) {
    this.subs.sink = this.dialog
      .open(AddPaymentModesDialogComponent, {
        width: '1320px',
        minHeight: '100px',
        disableClose: true,
        data: {
          ...data,
          scholarSeasonId: this.scholarSeasonId,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getSchoolsData();
        }
      });
  }

  deletePayment(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translateService.instant('PAYMENT_S1.Title'),
      html: this.translateService.instant('PAYMENT_S1.Text', {
        name: data.name ? data.name : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('PAYMENT_S1.Button1', { timer: timeDisabled }),
      cancelButtonText: this.translateService.instant('PAYMENT_S1.Button2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translateService.instant('PAYMENT_S1.Button1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translateService.instant('PAYMENT_S1.Button1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.subs.sink = this.financeService.DeletePaymentMode(data._id).subscribe(
          (resp) => {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.getSchoolsData();
            });
          },
          (error) => {
            // Record error log
            this.userService.postErrorLog(error);
            if (error['message'] === 'GraphQL error: Cannot delete payment mode because payment mode already assigned to student') {
              Swal.fire({
                type: 'info',
                title: this.translateService.instant('Payment_S1b.Title'),
                html: this.translateService.instant('Payment_S1b.Text'),
                confirmButtonText: this.translateService.instant('Payment_S1b.Button1'),
              });
            } else if (error['message'] === 'GraphQL error: Cannot delete payment mode beacuse used in program') {
              Swal.fire({
                type: 'info',
                title: this.translateService.instant('Payment_S1a.Title'),
                html: this.translateService.instant('Payment_S1a.Text'),
                confirmButtonText: this.translateService.instant('Payment_S1a.Button1'),
              });
            } else if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
              Swal.fire({
                type: 'warning',
                title: this.translateService.instant('BAD_CONNECTION.Title'),
                html: this.translateService.instant('BAD_CONNECTION.Text'),
                confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
              });
            } else {
              Swal.fire({
                type: 'info',
                title: this.translateService.instant('SORRY'),
                text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translateService.instant('OK'),
              });
            }
          },
        );
      }
    });
  }

  renderTooltipEntity(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    for (const entity of entities) {
      count++;
      if (count > 1) {
        if (entity.percentage) {
          tooltip = tooltip + '/ ';
          tooltip = tooltip + entity.percentage + '% ';
        }
      } else {
        if (entity.percentage) {
          tooltip = tooltip + entity.percentage + '% ';
        }
      }
    }
    return tooltip;
  }

  renderTooltipEntityPercentage(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    for (const entity of entities) {
      count++;
      if (count > 1) {
        if (entity.percentage) {
          tooltip = tooltip + ', ';
          tooltip = tooltip + entity.percentage;
        }
      } else {
        if (entity.percentage) {
          tooltip = tooltip + entity.percentage;
        }
      }
    }
    return tooltip;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.allExportForCheckbox = [];
      this.dataUnselectUser = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.allExportForCheckbox = [];
      this.dataUnselectUser = [];
      this.isCheckedAll = true;
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
    }
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };

    this.isWaitingForResponse = true;
    let filter = this.cleanFilterData();
    this.subs.sink = this.financeService.getAllPaymentModes(pagination, this.sortValue, filter).subscribe(
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
            this.dataSelectedId = this.selection.selected;
            this.pageSelected.push(this.paginator.pageIndex);
          } else {
            this.pageSelected = [];
          }
        }
      },
      (error) => {
        // Record error log
        this.userService.postErrorLog(error);
        this.isWaitingForResponse = false;
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
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
    this.selectType = info;
  }

  onDataExport() {
    if (this.selectType === 'one') {
      const data = [];
      if (this.selection.selected.length) {
        for (const item of this.selection.selected) {
          const costs =
            (item.additional_cost ? item.additional_cost : '-') + ' ' + (item.additional_cost && item.currency ? '- ' + item.currency : '');
          let percentage = '';
          for (const entity of item.payment_date) {
            percentage = percentage
              ? percentage + ' / ' + (entity.percentage ? entity.percentage + '%' : '')
              : entity.percentage
              ? entity.percentage + '%'
              : '';
          }
          const obj = [];
          obj[0] = item.name;
          obj[1] = item.description;
          obj[2] = item.term;
          obj[3] = percentage;
          obj[4] = costs;
          data.push(obj);
        }
        const valueRange = { values: data };
        const today = moment().format('DD-MM-YYYY');
        const sheetID = this.translateService.currentLang === 'en' ? 0 : 196455259;
        const title = this.exportName + '_' + today;
        const sheetData = {
          spreadsheetId: '1UzT6XzYSYkqILNtzt2mBjuHbIT1yMi9dWgS-inhF4-g',
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
    const filter = this.cleanFilterData();
    this.subs.sink = this.financeService.getAllPaymentModes(pagination, this.sortValue, filter).subscribe(
      (res: any) => {
        if (res && res.length) {
          this.allInternshipId.push(...res);
          const pages = pageNumber + 1;
          this.getAllExportData(pages);
        } else {
          this.isLoading = false;
          this.exportAllData(this.allInternshipId);
        }
      },
      (error) => {
        // Record error log
        this.userService.postErrorLog(error);
        this.isLoading = false;
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }

  exportAllData(exportData) {
    const datasForExport = _.uniqBy(exportData, '_id');
    const data = [];
    if (datasForExport && datasForExport.length) {
      for (const item of datasForExport) {
        const costs =
          (item.additional_cost ? item.additional_cost : '-') + ' ' + (item.additional_cost && item.currency ? '- ' + item.currency : '');
        let percentage = '';
        for (const entity of item.payment_date) {
          percentage = percentage
            ? percentage + ' / ' + (entity.percentage ? entity.percentage + '%' : '')
            : entity.percentage
            ? entity.percentage + '%'
            : '';
        }
        const obj = [];
        obj[0] = item.name;
        obj[1] = item.description;
        obj[2] = item.term;
        obj[3] = percentage;
        obj[4] = costs;
        data.push(obj);
      }
      const valueRange = { values: data };
      const today = moment().format('DD-MM-YYYY');
      const sheetID = this.translateService.currentLang === 'en' ? 0 : 196455259;
      const title = this.exportName + '_' + today;
      const sheetData = {
        spreadsheetId: '1UzT6XzYSYkqILNtzt2mBjuHbIT1yMi9dWgS-inhF4-g',
        sheetId: sheetID,
        range: 'A7',
      };
      this.exportCsvService.createAndUpdateSpreadsheet(valueRange, title, sheetData);
    }
    Swal.close();
  }

  downloadCSV() {
    if (this.utilityService.checkIfCandidateSelectNotNull(this.selection.selected.length, 'Payment Mode')) {
      return;
    } else {
      const inputOptions = {
        ',': this.translateService.instant('IMPORT_DECISION_S1.COMMA'),
        ';': this.translateService.instant('IMPORT_DECISION_S1.SEMICOLON'),
        tab: this.translateService.instant('IMPORT_DECISION_S1.TAB'),
      };
      Swal.fire({
        type: 'question',
        title: this.translateService.instant('IMPORT_DECISION_S1.TITLE'),
        width: 465,
        allowEscapeKey: true,
        showCancelButton: true,
        cancelButtonText: this.translateService.instant('IMPORT_DECISION_S1.CANCEL'),
        confirmButtonText: this.translateService.instant('IMPORT_DECISION_S1.OK'),
        input: 'radio',
        inputOptions: inputOptions,
        inputValue: this.translateService && this.translateService.currentLang === 'fr' ? ';' : '',
        inputValidator: (value) => {
          return new Promise((resolve, reject) => {
            if (value) {
              resolve('');
              Swal.enableConfirmButton();
            } else {
              Swal.disableConfirmButton();
              reject(this.translateService.instant('IMPORT_DECISION_S1.INVALID'));
            }
          });
        },
        onOpen: function () {
          Swal.disableConfirmButton();
          Swal.getContent().addEventListener('click', function () {
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
    const lang = this.translateService.currentLang.toLowerCase();
    const importStudentTemlate = `downloadPaymentModeCSV/`;
    let filter;
    if ((this.dataSelected.length && !this.isCheckedAll) || (this.dataUnselectUser && this.dataUnselectUser.length)) {
      const mappedIds = this.dataSelected.map((res) => `"` + res._id + `"`);
      console.log(mappedIds);
      filter = 'filter={"payment_mode_ids": [' + mappedIds.toString() + '] }';
    } else {
      // filter = `filter={}`;
      filter = this.cleanFilterDataCSV();
    }

    let sorting;
    if (this.sortValue) {
      sorting = `sorting=${JSON.stringify(this.sortValue)}`;
    } else {
      sorting = `sorting={}`;
    }

    let fullURL =
      url + importStudentTemlate + fileType + '/' + lang + '?' + filter + '&' + sorting + '&' + `user_type_id="${this.currentUserTypeId}"`;
    console.log(fullURL);
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
      }),
    };

    this.isLoading = true;
    this.httpClient.get(`${encodeURI(fullURL)}`, httpOptions).subscribe(
      (res) => {
        if (res) {
          this.isLoading = false;
          Swal.fire({
            type: 'success',
            title: this.translateService.instant('ReAdmission_S3.TITLE'),
            text: this.translateService.instant('ReAdmission_S3.TEXT'),
            confirmButtonText: this.translateService.instant('ReAdmission_S3.BUTTON'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.selection.clear();
            this.allExportForCheckbox = [];
            this.dataSelected = [];
            this.isCheckedAll = false;
          });
        } else {
          this.isLoading = false;
        }
      },
      (err) => {
        this.isLoading = false;
      },
    );
  }

  getAllIdForExport(pageNumber, action) {
    if (this.buttonClicked === 'export') {
      if (this.isCheckedAll) {
        if (this.dataUnselectUser.length < 1) {
          this.downloadCSV();
        } else {
          if (pageNumber === 0) {
            this.allExportForCheckbox = [];
            this.dataSelected = [];
          }
          const pagination = {
            limit: 500,
            page: pageNumber,
          };
          this.isLoading = true;
          const filter = this.cleanFilterData();
          this.subs.sink = this.financeService.getAllPaymentModesForExport(pagination, this.sortValue, filter).subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allExportForCheckbox = _.concat(this.allExportForCheckbox, resp);
                const page = pageNumber + 1;
                this.getAllIdForExport(page, action);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll) {
                  if (this.allExportForCheckbox && this.allExportForCheckbox.length) {
                    this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                    this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                    console.log('getAllIdForCheckbox', this.dataSelected);
                    if (this.dataSelected && this.dataSelected.length) {
                      this.downloadCSV();
                    }
                  }
                }
              }
            },
            (error) => {
              this.isReset = false;
              this.isLoading = false;
              Swal.fire({
                type: 'info',
                title: this.translateService.instant('SORRY'),
                text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translateService.instant('OK'),
              });
            },
          );
        }
      } else {
        this.downloadCSV();
      }
    }
  }

  controllerButton(action) {
    switch (action) {
      case 'export':
        setTimeout(() => {
          this.getAllIdForExport(0, 'export');
        }, 500);
        break;
      default:
        this.resetTable();
    }
  }
}
