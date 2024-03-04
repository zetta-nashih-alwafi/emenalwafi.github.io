import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AddScholarDialogComponent } from 'app/internship-file/add-scholar-dialog/add-scholar-dialog.component';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { SelectionModel } from '@angular/cdk/collections';
import * as moment from 'moment';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { ExportCsvService } from 'app/service/export-csv/export-csv.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ms-scholar-period-tab',
  templateUrl: './scholar-period-tab.component.html',
  styleUrls: ['./scholar-period-tab.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseStringDatePipe],
})
export class ScholarPeriodTabComponent implements OnInit, OnDestroy, AfterViewInit {
  scholarPeriodCount;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  exportName: string;
  titleData: any;
  noData: any;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  displayedColumns: string[] = ['select', 'period', 'description', 'from', 'to', 'action'];
  filterColumns: string[] = ['selectFilter','periodFilter', 'descriptionFilter', 'fromFilter', 'toFilter', 'actionFilter'];
  filteredValues = {
    scholar_season: '',
    description: '',
    from: '',
    to: '',
  };

  intackChannelCount;
  isWaitingForResponse = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isLoading: Boolean = false;
  dataCount = 0;
  private subs = new SubSink();

  periodFilter = new UntypedFormControl(null);
  descriptionFilter = new UntypedFormControl('');
  fromDateFilter = new UntypedFormControl(null);
  toDateFilter = new UntypedFormControl(null);

  private timeOutVal: any;

  constructor(
    private admissionEntrypointService: AdmissionEntrypointService,
    private dialog: MatDialog,
    private financeSerice: FinancesService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private parseStringDatePipe: ParseStringDatePipe,
    private exportCsvService: ExportCsvService,
    private translate: TranslateService,
  ) {}
  ngOnInit() {
    this.initFilter();
    this.getScholarPeriodData();
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
            this.getScholarPeriodData();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getScholarPeriodData() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    this.subs.sink = this.financeSerice.GetAllScholarSeasons(pagination, this.sortValue, filter).subscribe((scholarPeriod: any) => {
      if (scholarPeriod && scholarPeriod.length) {
        this.dataSource.data = scholarPeriod;
        this.paginator.length = scholarPeriod[0].count_document;
        this.dataCount = scholarPeriod[0].count_document;
      } else {
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.dataCount = 0;
      }
      this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
      this.isReset = false;
      this.isWaitingForResponse = false;
    }, (error) => {
      this.dataSource.data = [];
      this.paginator.length = 0;
      this.dataCount = 0;
      this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
      this.isReset = false;
      this.isWaitingForResponse = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
        confirmButtonText: this.translate.instant('OK'),
      });
    })
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getScholarPeriodData();
      }
    }
  }

  resetTable() {
    this.isReset = true;
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });

    this.filteredValues = {
      scholar_season: '',
      description: '',
      from: '',
      to: '',
    };

    this.periodFilter.setValue('');
    this.descriptionFilter.setValue('');
    this.fromDateFilter.setValue(null);
    this.toDateFilter.setValue(null);
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.getScholarPeriodData();
  }

  initFilter() {
    this.subs.sink = this.periodFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.filteredValues.scholar_season = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getScholarPeriodData();
        } else if (statusSearch === '') {
          this.periodFilter.setValue('');
          this.filteredValues.scholar_season = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getScholarPeriodData();
          }
        }
      } else {
        this.periodFilter.setValue('');
        this.filteredValues.scholar_season = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getScholarPeriodData();
        }
      }
    });
    this.subs.sink = this.descriptionFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.filteredValues.description = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getScholarPeriodData();
        } else if (statusSearch === '') {
          this.descriptionFilter.setValue('');
          this.filteredValues.description = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getScholarPeriodData();
          }
        }
      } else {
        this.descriptionFilter.setValue('');
        this.filteredValues.description = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getScholarPeriodData();
        }
      }
    });
    this.subs.sink = this.fromDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.from = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getScholarPeriodData();
        }
      }
    });
    this.subs.sink = this.toDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.to = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getScholarPeriodData();
        }
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

  addScholarDialog(data) {
    this.subs.sink = this.dialog
      .open(AddScholarDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        this.getScholarPeriodData();
      });
  }
  editScholarDialog(data) {
    this.subs.sink = this.dialog
      .open(AddScholarDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: data
      })
      .afterClosed()
      .subscribe((resp) => {
        this.getScholarPeriodData();
      });
  }
  deleteScholar(data) {
    console.log('_=>', data);
    let timeDisabled = 3;
    Swal
      .fire({
        title: this.translate.instant('DELETE_ITEM_TEMPLATE.TITLE'),
        html: this.translate.instant('CONFIRMDELETE',{
          value:  data.scholar_season? data.scholar_season : '' }),
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
            confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
            Swal.enableConfirmButton();
            clearInterval(intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      })
      .then((res) => {
        clearTimeout(this.timeOutVal);
        if (res.value) {
          this.subs.sink = this.financeSerice.DeleteScholarSeason(data._id).subscribe((resp) => {
            console.log('Edit Payment Mode', resp);
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.getScholarPeriodData();
            });
          }, (error) => {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translate.instant('OK'),
            });
          })
        }
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

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  onDataExport() {
    /**create array of headerdata if want to send header data from UI if not increase row by 1 in A1 notation
    in params = {'range' : ''}*/
    let data = [];
    // data.push(header);
    if (this.selection.selected.length) {
      for (let item of this.selection.selected) {
        let obj = [];
        obj[0] = item.scholar_season;
        obj[1] = item.description;
        obj[2] = item.from.date_utc;
        obj[3] = item.to.date_utc;
        data.push(obj);
      }
      let valueRange = { values: data };
      let today = moment().format('DD-MM-YYYY');
      const sheetID = this.translate.currentLang === 'en' ? 0 : 1634794886;
      let title = this.exportName + '_' + today;
      let sheetData = {
        spreadsheetId: '16Qv12UYGaKjC-Nn1jmW1C1cyDmJHGLLQw-bLLGyyrEY',
        sheetId: sheetID,
        range: 'A4',
      };
      this.exportCsvService.createAndUpdateSpreadsheet(valueRange, title, sheetData);
    }
    Swal.close();
  }
}
