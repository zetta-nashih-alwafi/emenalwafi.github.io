import { UtilityService } from 'app/service/utility/utility.service';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import * as moment from 'moment';
import { SelectionModel } from '@angular/cdk/collections';
import { environment } from 'environments/environment';
import { ExportCsvService } from 'app/service/export-csv/export-csv.service';
import { AddAdditionalExpenseDialogComponent } from './add-additional-expense-dialog/add-additional-expense-dialog.component';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'ms-additional-expense',
  templateUrl: './additional-expense.component.html',
  styleUrls: ['./additional-expense.component.scss'],
})
export class AdditionalExpenseComponent implements OnInit, OnDestroy, AfterViewInit {
  intakeChannelCount;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  userSelected = [];
  userSelectedId = [];
  titleData: any;
  noData: any;
  displayedColumns: string[] = ['select', 'additionalCosts', 'description', 'amount', 'action'];
  filteredValues = {
    additional_cost: '',
    description: '',
    amount: null,
    scholar_season_id: '',
  };
  exportName: string;
  allInternshipId = [];
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  additionalCostsCount;
  isWaitingForResponse = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isLoading: Boolean = false;
  dataCount = 0;
  private subs = new SubSink();
  scholarId: any;
  additionalCostsFilter = new UntypedFormControl('');
  amountFilter = new UntypedFormControl('');
  descriptionFilter = new UntypedFormControl('');
  private timeOutVal: any;
  scholarSeasons: any;

  isCheckedAll = false;
  disabledExport = true;
  selectType: any;
  dataSelected = [];
  dataSelectedId = [];
  allStudentForCheckbox = [];
  pageSelected = [];
  dataUnselectUser = [];
  allExportForCheckbox = [];
  currentUserTypeId

  constructor(
    private dialog: MatDialog,
    private intakeChannelService: IntakeChannelService,
    private translateService: TranslateService,
    private pageTitleService: PageTitleService,
    private exportCsvService: ExportCsvService,
    private utilityService: UtilityService,
    public permission: PermissionService,
    private authService: AuthService,
    private httpClient: HttpClient,
  ) {}

  ngOnInit() {
    this.initFilter();
    this.getAdditionalCostsData();

    this.pageTitleService.setTitle(
      this.translateService.instant('INTAKE_CHANNEL.PAGE_TITLE.Settings') + ' - ' + this.translateService.instant('Additional expenses'),
    );
    this.subs.sink = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(
        this.translateService.instant('INTAKE_CHANNEL.PAGE_TITLE.Settings') + ' - ' + this.translateService.instant('Additional expenses'),
      );
    });
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
    const currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getAdditionalCostsData() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    this.subs.sink = this.intakeChannelService.GetAllAdditionalCosts(pagination, this.sortValue, filter).subscribe(
      (additionalCosts: any) => {
        if (additionalCosts && additionalCosts.length) {
          this.dataSource.data = additionalCosts;
          this.paginator.length = additionalCosts[0].count_document;
          this.dataCount = additionalCosts[0].count_document;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
      },
      (error) => {
        // Record error log
        this.authService.postErrorLog(error);
        this.isReset = false;
        this.isWaitingForResponse = false;
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.dataCount = 0;
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

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getAdditionalCostsData();
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
        this.getAdditionalCostsData();
      }
    }
  }

  resetTable() {
    this.isReset = true;
    this.isCheckedAll = false;
    this.selection.clear();
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
    this.selectType = '';
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;

    this.filteredValues = {
      additional_cost: '',
      description: '',
      amount: null,
      scholar_season_id: this.scholarId,
    };

    this.additionalCostsFilter.setValue(null);
    this.descriptionFilter.setValue(null);
    this.amountFilter.setValue(null);
    this.getAdditionalCostsData();
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'amount') {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        } else {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        }
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
    this.subs.sink = this.additionalCostsFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (statusSearch !== null && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch === '') {
          this.additionalCostsFilter.setValue(null);
          this.filteredValues.additional_cost = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAdditionalCostsData();
          }
        }
        this.filteredValues.additional_cost = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAdditionalCostsData();
        }
      } else {
        if (statusSearch !== null) {
          this.additionalCostsFilter.setValue(null);
          this.filteredValues.additional_cost = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAdditionalCostsData();
          }
        }
      }
    });
    this.subs.sink = this.descriptionFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (statusSearch !== null && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch === '') {
          this.descriptionFilter.setValue(null);
          this.filteredValues.description = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAdditionalCostsData();
          }
        }
        this.filteredValues.description = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAdditionalCostsData();
        }
      } else {
        if (statusSearch !== null) {
          this.descriptionFilter.setValue(null);
          this.filteredValues.description = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAdditionalCostsData();
          }
        }
      }
    });
    this.subs.sink = this.amountFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (statusSearch !== null && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch === '') {
          this.amountFilter.setValue(null);
          this.filteredValues.amount = null;
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAdditionalCostsData();
          }
        }
        this.filteredValues.amount = statusSearch ? parseInt(statusSearch) : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAdditionalCostsData();
        }
      } else {
        if (statusSearch !== null) {
          this.amountFilter.setValue(null);
          this.filteredValues.amount = null;
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAdditionalCostsData();
          }
        }
      }
    });
  }

  renderTooltipEntity(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    if (entities && entities.length) {
      for (const entity of entities) {
        count++;
        if (count > 1) {
          if (entity.name) {
            tooltip = tooltip + ', ';
            tooltip = tooltip + entity.name;
          }
        } else {
          if (entity.name) {
            tooltip = tooltip + entity.name;
          }
        }
      }
    }
    return tooltip;
  }

  addProfileRateDialog() {
    this.subs.sink = this.dialog
      .open(AddAdditionalExpenseDialogComponent, {
        width: '750px',
        minHeight: '100px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getAdditionalCostsData();
        }
      });
  }

  editProfileRateDialog(data) {
    this.subs.sink = this.dialog
      .open(AddAdditionalExpenseDialogComponent, {
        width: '750px',
        minHeight: '100px',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getAdditionalCostsData();
        }
      });
  }

  deleteProfileRate(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translateService.instant('Additional_S1.Title'),
      html: this.translateService.instant('Additional_S1.Text', {
        name: data.additional_cost ? data.additional_cost : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Additional_S1.Button1', { timer: timeDisabled }),
      cancelButtonText: this.translateService.instant('Additional_S1.Button2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translateService.instant('Additional_S1.Button1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translateService.instant('Additional_S1.Button1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.subs.sink = this.intakeChannelService.DeleteAdditionalCost(data._id).subscribe(
          (resp) => {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.getAdditionalCostsData();
            });
          },
          (error) => {
            // Record error log
            this.authService.postErrorLog(error);
            if (error['message'] === 'GraphQL error: Cannot delete additional cost, additional cost already connected to program') {
              Swal.fire({
                type: 'info',
                title: this.translateService.instant('Additional_S1a.Title'),
                html: this.translateService.instant('Additional_S1a.Text'),
                confirmButtonText: this.translateService.instant('Additional_S1a.Button1'),
              });
            } else if (
              error['message'] === 'GraphQL error: Cannot delete additional cost, additional cost already connected to candidate'
            ) {
              Swal.fire({
                type: 'info',
                title: this.translateService.instant('Additional_S1b.Title'),
                html: this.translateService.instant('Additional_S1b.Text'),
                confirmButtonText: this.translateService.instant('Additional_S1b.Button1'),
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

  onDataExport() {
    if (this.selectType === 'one') {
      const data = [];
      if (this.selection.selected.length) {
        for (const item of this.selection.selected) {
          const obj = [];
          obj[0] = item.additional_cost;
          obj[1] = item.description;
          obj[2] = item.amount + (item.currency ? ' - ' + item.currency : '');
          data.push(obj);
        }
        const valueRange = { values: data };
        const today = moment().format('DD-MM-YYYY');
        const sheetID = this.translateService.currentLang === 'en' ? 0 : 1745465488;
        const title = this.exportName + '_' + today;
        const sheetData = {
          spreadsheetId: '12xGfxeY6-rEH_EI7ylSx_fvIZILV7BTZ81LgT-wsMh4',
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
    this.subs.sink = this.intakeChannelService.GetAllAdditionalCosts(pagination, this.sortValue, filter).subscribe(
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
        this.authService.postErrorLog(error);
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
        }
        Swal.fire({
          type: 'info',
          title: this.translateService.instant('SORRY'),
          text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translateService.instant('OK'),
        });
      },
    );
  }

  exportAllData(exportData) {
    const datasForExport = _.uniqBy(exportData, '_id');
    const data = [];
    if (datasForExport && datasForExport.length) {
      for (const item of datasForExport) {
        const obj = [];
        obj[0] = item.additional_cost;
        obj[1] = item.description;
        obj[2] = item.amount + (item.currency ? ' - ' + item.currency : '');
        data.push(obj);
      }
      const valueRange = { values: data };
      const today = moment().format('DD-MM-YYYY');
      const sheetID = this.translateService.currentLang === 'en' ? 0 : 1745465488;
      const title = this.exportName + '_' + today;
      const sheetData = {
        spreadsheetId: '12xGfxeY6-rEH_EI7ylSx_fvIZILV7BTZ81LgT-wsMh4',
        sheetId: sheetID,
        range: 'A7',
      };
      this.exportCsvService.createAndUpdateSpreadsheet(valueRange, title, sheetData);
    }
    Swal.close();
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected() || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length)) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      // this.getDataAllForCheckbox(0);
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
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
    const filter = this.cleanFilterData();
    this.isWaitingForResponse = true;
    this.subs.sink = this.intakeChannelService.GetAllAdditionalCosts(pagination, this.sortValue, filter).subscribe(
      (students: any) => {
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
        this.isReset = false;
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

    const numSelected = this.dataSelected.length;
    if (numSelected > 0) {
      this.disabledExport = false;
    } else {
      this.disabledExport = true;
    }
    this.dataSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.dataSelectedId.push(user._id);
    });
  }
  getAllDataForExportCheckbox(pageNumber) {
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
        const filter = this.cleanFilterData();
        this.isLoading = true;
        this.subs.sink = this.intakeChannelService.GetAllAdditionalCostsId(pagination, this.sortValue, filter).subscribe(
          (students: any) => {
            if (students && students.length) {
              this.allExportForCheckbox.push(...students);
              const page = pageNumber + 1;
              this.getAllDataForExportCheckbox(page);
            } else {
              this.isLoading = false;
              if (this.isCheckedAll) {
                if (this.allExportForCheckbox && this.allExportForCheckbox.length) {
                  this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  this.downloadCSV();
                }
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
    } else {
      this.downloadCSV();
    }
  }
  downloadCSV() {
    if (!this.dataSelected.length && (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser.length))) {
      Swal.fire({
        type: 'info',
        title: this.translateService.instant('Followup_S8.Title'),
        html: this.translateService.instant('Followup_S8.Text', {
          menu: this.translateService.instant('ADMISSION_PAYMENT.Additional cost'),
        }),
        confirmButtonText: this.translateService.instant('Followup_S8.Button'),
      });
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
    const lang = this.translateService.currentLang.toLowerCase();
    const importStudentTemlate = `downloadAdditionalCost/`;
    let filter;
    if (
      this.dataSelected.length &&
      (!this.isCheckedAll || (this.dataUnselectUser.length && this.isCheckedAll && this.dataSelected.length))
    ) {
      const mappedIds = [...new Set(this.dataSelected.map((res) => `"` + res._id + `"`))];
      filter = 'filter={"additional_cost_ids": [' + mappedIds.toString() + '] }';
    } else {
      filter = this.cleanFilterDataCSV();
    }
    const fullURL = url + importStudentTemlate + fileType + '/' + lang + '?' + filter+'&' + `user_type_id="${this.currentUserTypeId}"`;
    console.log('fullURL', fullURL);
    // element.href = encodeURI(url + importStudentTemlate + fileType + '/' + lang + '?' + filter);
    // console.log(element.href);
    // element.target = '_blank';
    // element.download = 'Template Import CSV';
    // document.body.appendChild(element);
    // element.click();
    // document.body.removeChild(element);
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
          }).then(() => this.clearSelectIfFilter());
        } else {
          this.isLoading = false;
        }
      },
      (err) => {
        this.isLoading = false;
        console.log('uat 389 error', err);
      },
    );
  }
  clearSelectIfFilter() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
  }

  getAllIdForCheckbox(pageNumber) {
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

        const filter = this.cleanFilterData();
        this.isWaitingForResponse = true;

        this.subs.sink = this.intakeChannelService
          .GetAllAdditionalExpensesIntakeChannelIdCheckbox(pagination, this.sortValue, filter)
          .subscribe(
            (admissions: any) => {
              if (admissions && admissions.length) {
                const resp = _.cloneDeep(admissions);
                this.allExportForCheckbox = _.concat(this.allExportForCheckbox, resp);
                const page = pageNumber + 1;
                this.getAllIdForCheckbox(page);
              } else {
                this.isWaitingForResponse = false;
                if (this.isCheckedAll) {
                  if (this.allExportForCheckbox && this.allExportForCheckbox.length) {
                    this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                    this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                    if (this.dataSelected && this.dataSelected.length) {
                      this.downloadCSV();
                    }
                  }
                }
              }
            },
            (error) => {
              console.log('error download csv');
              console.log(error);
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
