import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AddProfileRateDialogComponent } from 'app/internship-file/add-profile-rate-dialog/add-profile-rate-dialog.component';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-scholarship-fees-tab',
  templateUrl: './scholarship-fees-tab.component.html',
  styleUrls: ['./scholarship-fees-tab.component.scss'],
})
export class ScholarshipFeesTabComponent implements OnInit, OnDestroy, AfterViewInit {
  intakeChannelCount;
  dataSource = new MatTableDataSource([]);
  titleData: any;
  noData: any;
  displayedColumns: string[] = ['scholarshipFees', 'description', 'availablePaymentModes', 'action'];
  filterColumns: string[] = ['scholarshipFeesFilter', 'descriptionFilter', 'availablePaymentModesFilter', 'actionFilter'];
  filteredValues = {
    name: '',
    description: '',
    payment_mode: '',
  };
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  scholarshipFeesCount;
  isWaitingForResponse = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isLoading: Boolean = false;
  dataCount = 0;
  private subs = new SubSink();

  scholarshipFeesFilter = new UntypedFormControl('');
  availablePaymentModesFilter = new UntypedFormControl('');
  descriptionFilter = new UntypedFormControl('');
  private timeOutVal: any;

  constructor(
    private admissionEntrypointService: AdmissionEntrypointService,
    private dialog: MatDialog,
    private financeService: FinancesService,
    private translateService: TranslateService,
    private pageTitleService: PageTitleService,
  ) {}
  ngOnInit() {
    this.initFilter();
    this.getScholarshipFeesData();
    const name = 'ADMISSION.TITLE_SCHOLARSHIP_FEES';
    this.pageTitleService.setTitle(name);
    // this.pageTitleService.setIcon('login');

    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      const name = 'ADMISSION.TITLE_SCHOLARSHIP_FEES';
      this.pageTitleService.setTitle(name);
      // this.pageTitleService.setIcon('login');
    });
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  getScholarshipFeesData() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    this.subs.sink = this.financeService.GetAllProfilRates(pagination, this.sortValue, filter).subscribe((scholarshipFees: any) => {
      if (scholarshipFees && scholarshipFees.length) {
        this.dataSource.data = scholarshipFees;
        this.paginator.length = scholarshipFees[0].count_document;
        this.dataCount = scholarshipFees[0].count_document;
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
        title: this.translateService.instant('SORRY'),
        text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
        confirmButtonText: this.translateService.instant('OK'),
      });
    })
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getScholarshipFeesData();
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
        this.getScholarshipFeesData();
      }
    }
  }

  resetTable() {
    this.isReset = true;
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });

    this.filteredValues = {
      name: '',
      description: '',
      payment_mode: '',
    };

    this.scholarshipFeesFilter.setValue('');
    this.descriptionFilter.setValue('');
    this.availablePaymentModesFilter.setValue('');
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.getScholarshipFeesData();
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

  initFilter() {
    this.subs.sink = this.scholarshipFeesFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.filteredValues.name = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getScholarshipFeesData();
        } else if (statusSearch === '') {
          this.scholarshipFeesFilter.setValue('');
          this.filteredValues.name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getScholarshipFeesData();
          }
        }
      } else {
        this.scholarshipFeesFilter.setValue('');
        this.filteredValues.name = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getScholarshipFeesData();
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
          this.getScholarshipFeesData();
        } else if (statusSearch === '') {
          this.descriptionFilter.setValue('');
          this.filteredValues.description = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getScholarshipFeesData();
          }
        }
      } else {
        this.descriptionFilter.setValue('');
        this.filteredValues.description = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getScholarshipFeesData();
        }
      }
    });
    this.subs.sink = this.availablePaymentModesFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.filteredValues.payment_mode = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getScholarshipFeesData();
        } else if (statusSearch === '') {
          this.availablePaymentModesFilter.setValue('');
          this.filteredValues.payment_mode = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getScholarshipFeesData();
          }
        }
      } else {
        this.availablePaymentModesFilter.setValue('');
        this.filteredValues.payment_mode = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getScholarshipFeesData();
        }
      }
    });
  }
  renderTooltipEntity(entities: any[]): string {
    let tooltip = '';
    let count = 0;
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
    return tooltip;
  }
  addProfileRateDialog() {
    this.subs.sink = this.dialog
      .open(AddProfileRateDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        this.getScholarshipFeesData();
      });
  }

  editProfileRateDialog(data) {
    this.subs.sink = this.dialog
      .open(AddProfileRateDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {
        this.getScholarshipFeesData();
      });
  }
  deleteProfileRate(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translateService.instant('DELETE_ITEM_TEMPLATE.TITLE'),
      html: this.translateService.instant('CONFIRMDELETE', {
        value: data.name ? data.name : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('THUMBSUP.SWEET_ALERT.CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translateService.instant('DASHBOARD_DELETE.NO'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translateService.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translateService.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.subs.sink = this.financeService.DeletePaymentMode(data._id).subscribe((resp) => {
          console.log('Edit Payment Mode', resp);
          Swal.fire({
            type: 'success',
            title: 'Bravo!',
            confirmButtonText: 'OK',
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.getScholarshipFeesData();
          });
        }, (error) => {
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        })
      }
    });
  }
}
