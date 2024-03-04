import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { AddTimelineTemplateDialogComponent } from './add-timeline-template-dialog/add-timeline-template-dialog.component';
import { FinancesService } from 'app/service/finance/finance.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-timeline-template',
  templateUrl: './timeline-template.component.html',
  styleUrls: ['./timeline-template.component.scss'],
})
export class TimelineTemplateComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  private subs = new SubSink();

  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);

  dataCount = 0;
  noData;
  sortValue = null;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  userSelected: any[];
  userSelectedId: any[];
  isCheckedAll = false;
  isLoading = false;
  pageSelected = [];
  allTemplateForCheckbox = [];
  filterBreadcrumbData: any[] = [];

  displayedColumns: string[] = ['select', 'template_name', 'description', 'terms', 'percentage', 'action'];
  filterColumns: string[] = ['selectFilter', 'templateNameFilter', 'descriptionFilter', 'termsFilter', 'percentageFilter', 'actionFilter'];

  dummyData = [
    {
      template_name: 'Dummy 1',
      description: 'Dummy Description',
      terms: 3,
      percentage: '100%',
    },
    {
      template_name: 'Dummy 2',
      description: 'Dummy Description 2',
      terms: 2,
      percentage: '80%',
    },
  ];
  timeOutVal: any;

  // sectorFilterCtrl = new UntypedFormControl(null);
  // sectorlFiltered: Observable<any[]>;
  // sectorListFilter = [];

  templateNameFilterCtrl = new UntypedFormControl('');
  templateNameFiltered: Observable<any[]>;
  templateNameOrigin: Observable<any[]>;
  templateNameListFilter = [];
  templateNameList = [
    {
      name: 'Dummy Filter 1',
    },
    {
      name: 'Filtered 2',
    },
  ];

  filteredValues = {
    template_name: null,
  };

  constructor(
    private translate: TranslateService,
    public dialog: MatDialog,
    private financeService: FinancesService,
    private filterBreadCrumbService: FilterBreadcrumbService,
    public permission: PermissionService,
    private authService: AuthService,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit() {
    console.log('test');
    this.getAllFormBuildersList();
    this.getTimelineTable();
    this.pageTitleService.setTitle('NAV.FINANCE.Timeline template');
    console.log(this.templateNameListFilter);
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        tap(() => {
          console.log('ngAfterViewInit');
          if (!this.isReset) {
            this.getTimelineTable();
          }
        }),
      )
      .subscribe();
  }

  getTimelineTable() {
    this.isLoading = true;
    this.dataSource.data = [];
    // this.paginator.pageIndex = 0;
    // this.dataCount = 0;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.subs.sink = this.financeService.getAllTimelineTemplate(this.filteredValues, this.sortValue, pagination).subscribe(
      (resp) => {
        if (resp && resp.length) {
          console.log('call getAllTimelineTemplate');
          console.log('call resp >>', resp);
          const response = _.cloneDeep(resp);
          this.dataSource.data = response;
          // this.templateNameListFilter = resp.map((el) => el.template_name);
          this.dataCount = response[0] && response[0].count_document ? response[0].count_document : 0;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isLoading = false;
        this.isReset = false;
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isLoading = false;
        this.isReset = false;
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

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isLoading = true;
    const filter = this.filteredValues;
    this.subs.sink = this.financeService.getAllTimelineTemplate(filter, this.sortValue, pagination).subscribe(
      (resp: any) => {
        if (resp && resp.length) {
          this.allTemplateForCheckbox.push(...resp);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
          this.isLoading = false;
          if (this.isCheckedAll) {
            const pageDetecting = this.pageSelected.filter((page) => page === this.paginator.pageIndex);
            if (pageDetecting && pageDetecting.length < 1) {
              if (this.allTemplateForCheckbox && this.allTemplateForCheckbox.length) {
                this.allTemplateForCheckbox.forEach((element) => {
                  this.selection.select(element._id);
                });
              }
            }
            this.userSelectedId = this.selection.selected;
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
        this.isLoading = false;
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

  getAllFormBuildersList() {
    this.subs.sink = this.financeService.GetAllTimelineTemplateNameDropdown().subscribe(
      (res) => {
        if (res) {
          this.templateNameListFilter = res;
          this.templateNameOrigin = of(res);
          this.templateNameFiltered = this.templateNameFilterCtrl.valueChanges.pipe(
            startWith(''),
            map((searchText) =>
              searchText
                ? this.templateNameListFilter
                    .filter((data) => (data ? data.toLowerCase().includes(searchText.toLowerCase()) : false))
                    .sort((a: any, b: any) => a.localeCompare(b))
                : this.templateNameListFilter.sort((a: any, b: any) => a.localeCompare(b)),
            ),
          );
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
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

  sortData(sort: Sort) {
    console.log('sort', sort.active);
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (!this.isLoading) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getTimelineTable();
      }
    }
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
    this.clearSelectIfFilter();
    this.getTimelineTable();
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter',
        name: 'template_name',
        column: 'Template Name',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.templateNameFilterCtrl,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  clearSelectIfFilter() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.allTemplateForCheckbox = [];
  }

  initFilter() {
    // ...
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.pageSelected = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.allTemplateForCheckbox = [];
      this.isCheckedAll = true;
      // this.dataSource.data.forEach((row) => this.selection.select(row));
      this.dataSource.data.forEach((row) => this.selection.select(row));
      this.getDataAllForCheckbox(0);
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  showOptions(info) {
    const numSelected = this.selection.selected.length;
    this.userSelected = [];
    this.userSelectedId = [];
    const data = this.selection.selected;
    data.forEach((user) => {
      this.userSelected.push(...this.dataSource.data.filter((list) => list._id === user));
      this.userSelectedId.push(user);
    });
  }

  deleteTemplate(element) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('Notif_S9.TITLE', { templateName: element.template_name }),
      html: this.translate.instant('Notif_S9.TEXT', { templateName: element.template_name }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('Notif_S9.BUTTON1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('Notif_S9.BUTTON2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: (modalEl) => {
        modalEl.setAttribute('data-cy', 'swal-notif-s9');
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('Notif_S9.BUTTON1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('Notif_S9.BUTTON1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.isLoading = true;
        console.log(element._id);
        this.subs.sink = this.financeService.deleteTimelineTemplate(element._id).subscribe(
          (resp) => {
            this.isLoading = false;
            console.log(resp);
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo !'),
              confirmButtonText: this.translate.instant('OK'),
              onOpen: (modalEl) => {
                modalEl.setAttribute('data-cy', 'swal-bravo');
              },
            }).then((result) => {
              this.paginator.pageIndex = 0;
              this.getTimelineTable();
            });
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
            this.showSwalError(err);
          },
        );
      }
    });
  }

  resetFilter() {
    console.log('reset');
    this.allTemplateForCheckbox = [];
    this.selection.clear();
    this.pageSelected = [];
    this.isCheckedAll = false;
    this.isReset = true;
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });

    this.templateNameFilterCtrl.setValue(null, { emitEvent: false });
    this.templateNameFiltered = this.templateNameOrigin;
    this.filteredValues = {
      template_name: null,
    };
    this.filterBreadcrumbData = [];
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.getTimelineTable();
  }

  openDialogAdd(type, data?) {
    this.subs.sink = this.dialog
      .open(AddTimelineTemplateDialogComponent, {
        width: '1320px',
        minHeight: '100px',
        disableClose: true,

        // this for static and dinamic dialog data
        data: {
          comps: {
            // title: type === 'add' ? 'Add timeline template' : 'Edit timeline template',
            title: type === 'add' ? 'Add timeline template' : 'Edit timeline template',
            icon: null,
            isEdit: type === 'edit' ? true : false,
            callFrom: 'timeline_template',
          },
          source: data,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (!this.isReset && resp) {
          this.getTimelineTable();
        }
      });
  }

  templateNameSelected(data) {
    if (data === 'AllS') {
      this.paginator.pageIndex = 0;
      this.allTemplateForCheckbox = [];
      this.pageSelected = [];
      this.filteredValues.template_name = '';
      if (!this.isReset) {
        this.getTimelineTable();
      }
    } else {
      this.paginator.pageIndex = 0;
      this.allTemplateForCheckbox = [];
      this.pageSelected = [];
      this.filteredValues.template_name = data;
      if (!this.isReset) {
        this.getTimelineTable();
      }
    }
  }

  showSwalError(err) {
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
      }).then(() => {
        // this.dialogRef.close(true);
        this.isLoading = false;
      });
    }
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

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
}
