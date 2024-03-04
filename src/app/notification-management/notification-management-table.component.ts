import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { SubSink } from 'subsink';
import { UntypedFormControl } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'app/service/utility/utility.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { map, tap } from 'rxjs/operators';
import { NotificationManagementService } from './notification-management.service';
import * as _ from 'lodash';
import { PermissionService } from 'app/service/permission/permission.service';
import Swal from 'sweetalert2';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { FilterBreadcrumbComponent } from 'app/filter-breadcrumb/filter-breadcrumb.component';

import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-notification-management-table',
  templateUrl: './notification-management-table.component.html',
  styleUrls: ['./notification-management-table.component.scss'],
})
export class NotificationManagementTableComponent implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns: string[] = ['module', 'reference', 'when', 'action'];
  filterColumns: string[] = ['moduleFilter', 'referenceFilter', 'whenFilter', 'actionFilter'];
  dataSource = new MatTableDataSource([]);
  noData: any;
  selection = new SelectionModel<any>(true, []);
  private subs = new SubSink();
  isWaitingForResponse = true;
  dataCount = 0;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  sortValue = null;

  moduleFilter = new UntypedFormControl('AllS');
  referenceFilter = new UntypedFormControl('AllS');
  isReset = false;

  filteredValues = {
    module: '',
    notification_reference: '',
  };
  currentPage = 0;

  modules = [];
  references = [];
  classFiltered: Observable<any[]>;
  titleFiltered: Observable<any[]>;
  isPageLoading = false;
  filteredModules: Observable<{ module: string }[]>;
  filteredReferences: Observable<{ notification_reference: string }[]>;
  filterBreadcrumbData: any[] = [];

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private translate: TranslateService,
    private utilService: UtilityService,
    private pageTitleService: PageTitleService,
    private route: ActivatedRoute,
    private notificationService: NotificationManagementService,
    public permission: PermissionService,
    private authService: AuthService,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(this.translate.instant('Notification_Title'));
      // this.pageTitleService.setIcon('clipboard-flow');
    });
    this.pageTitleService.setTitle(this.translate.instant('Notification_Title'));
    this.pageTitleService.setIcon('clipboard-flow');
    this.fetchDropdowns();
    this.initFilterListeners();
    this.fetchNotificationsData();
    this.filterBreadcrumbData = [];
    this.filterBreadcrumbFormat();
    this.paginator.pageSize = 10;
  }

  initFilterListeners() {
    this.filteredReferences = of(this.references);
    this.filteredModules = of(this.modules);

    // this.subs.sink = this.moduleFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
    //   if (typeof statusSearch === 'string') {
    //     const filteredModule = this.modules.filter((module) =>
    //       this.utilService
    //         .simpleDiacriticSensitiveRegex(module.toLowerCase())
    //         .includes(this.utilService.simpleDiacriticSensitiveRegex(statusSearch.toLowerCase())),
    //     );
    //     this.filteredModules = of(filteredModule);
    //     if (statusSearch === '') {
    //       this.filteredModules = of(this.modules);
    //     }
    //   }
    // });

    // this.subs.sink = this.referenceFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
    //   if (typeof statusSearch === 'string') {
    //     const filteredReference = this.references.filter((ref) =>
    //       this.utilService
    //         .simpleDiacriticSensitiveRegex(ref.notification_reference.toLowerCase())
    //         .includes(this.utilService.simpleDiacriticSensitiveRegex(statusSearch.toLowerCase())),
    //     );
    //     this.filteredReferences = of(filteredReference);
    //     if (statusSearch === '') {
    //       this.filteredReferences = of(this.references);
    //     }
    //   }
    // });
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        tap(() => {
          if (!this.isReset) {
            this.fetchNotificationsData();
          }
        }),
      )
      .subscribe();
  }

  fetchNotificationsData() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    this.subs.sink = this.notificationService
      .getAllNotificationReferencesForTable(this.filteredValues, pagination, this.sortValue)
      .subscribe(
        (notifications) => {
          if (notifications.length) {
            notifications?.map((notif) => {
              if(notif?.notification_reference === 'Chargeback_DP_N1') {
                notif.when = 'When there is chargeback on Payment of DP (only for DP)';
              };
            })
            this.dataSource.data = notifications;
            this.dataCount = notifications.length &&  notifications[0] ? notifications[0].count_document : 0;
          } else {
            this.dataSource.data = [];
            this.dataCount = 0;
            this.paginator.length = 0;
          }
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isReset = false;
          this.isWaitingForResponse = false;
          this.filterBreadcrumbFormat();
        },
        (err) => {
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }

  fetchDropdowns() {
    const requests = [this.notificationService.getAllModulesForDropdown(), this.notificationService.getAllReferencesForDropdown()];

    this.subs.sink = forkJoin(requests).subscribe(
      ([modules, references]) => {
        const modulesDropdown = [];
        modules.forEach((el) => {
          if (!modulesDropdown.includes(el.module)) {
            if(el?.module) {
              modulesDropdown.push(el.module);
            }
          }
        });
        this.modules = modulesDropdown;
        this.filteredModules = of(this.modules);
        this.references = references;
        this.filteredReferences = of(this.references);
      },
      (err) => {
        this.authService.postErrorLog(err);
      },
    );
  }

  displayTranslatedModules(module) {
    if (module) {
      const found = _.find(this.modules, (type) => type === module);
      const moduleName = found;
      return this.translate.instant(moduleName);
    } else {
      return '';
    }
  }

  fetchReferencesDropdown() {}

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.fetchNotificationsData();
    }
  }

  resetAllFilter() {
    this.isReset = true;
    this.paginator.pageIndex = 0;
    this.filteredValues = {
      module: '',
      notification_reference: '',
    };
    this.filterBreadcrumbData = [];
    // this.dataSource.filter = JSON.stringify(this.filteredValues);
    this.moduleFilter.setValue('AllS', { emitEvent: false });
    this.referenceFilter.setValue('AllS', { emitEvent: false });
    this.fetchNotificationsData();
    this.fetchDropdowns();
  }

  onModuleSelect(value) {
    this.filteredValues.module = value === 'AllS' ? '' : value;
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.fetchNotificationsData();
    }
  }

  onReferenceSelect(value) {
    this.filteredValues.notification_reference = value === 'AllS' ? '' : value;
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.fetchNotificationsData();
    }
  }

  goToNotificationDetail(element) {
    this.router.navigate(['notification-detail'], { relativeTo: this.route, queryParams: { id: element._id } });
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'module', // name of the key in the object storing the filter
        column: 'Module', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.moduleFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'table_filter',
        name: 'notification_reference',
        column: 'Notification Reference',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.referenceFilter,
        isSelectionInput: false,
        displayKey: null,
        savedValue: null,
        noTranslate: true,
      },
    ];

    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
    if (filterItem?.name === 'module') {
      this.moduleFilter.patchValue('AllS');
    } else if (filterItem?.name === 'notification_reference') {
      this.referenceFilter.patchValue('AllS');
    }
    this.fetchNotificationsData();
  }

  ngOnDestroy() {
    this.pageTitleService.setTitle('');
    this.pageTitleService.setIcon('');
    this.subs.unsubscribe();
  }
}
