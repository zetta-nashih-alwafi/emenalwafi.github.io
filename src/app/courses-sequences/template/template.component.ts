import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PermissionService } from 'app/service/permission/permission.service';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { environment } from 'environments/environment';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import * as moment from 'moment';
import { DuplciateTemplateSequenceDialogComponent } from './duplicate-template-sequence-dialog/duplicate-template-sequence-dialog.component';
import { UtilityService } from 'app/service/utility/utility.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class TemplateSequenceComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  selection = new SelectionModel<any>(true, []);
  dataSource = new MatTableDataSource([]);
  titleData: any;
  noData: any;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  displayedColumns: string[] = [
    'select',
    'templateName',
    'description',
    'createdDate',
    'createdBy',
    'updatedDate',
    'updatedBy',
    'status',
    'action',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'templateNameFilter',
    'descriptionFilter',
    'createdDateFilter',
    'createdByFilter',
    'updatedDateFilter',
    'updatedByFilter',
    'statusFilter',
    'actionFilter',
  ];

  isWaitingForResponse = false;
  isLoading = false;
  isClickingExport = false;
  dataCount = 0;
  isCheckedAll: boolean;
  dataSelected: any[] = [];
  dataSelectedId: any[];
  userSelected = [];
  userSelectedId = [];
  pageSelected = [];
  allStudentForCheckbox = [];
  disabledExport: any;
  selectType: any;

  templateNameFilter = new UntypedFormControl('');
  descriptionFilter = new UntypedFormControl('');
  createdAtFilter = new UntypedFormControl('');
  createdByFilter = new UntypedFormControl(null);
  updatedAtFilter = new UntypedFormControl('');
  updatedByFilter = new UntypedFormControl(null);
  statusFilter = new UntypedFormControl(null);

  campusList: any = [];
  levelList: any = [];
  sectorList: any = [];
  specialityList: any = [];
  allFilter: any = [];

  filteredValues: any = {
    name: '',
    description: '',
    created_at: null,
    created_by: null,
    created_actors: null,
    updated_at: null,
    updated_by: null,
    updated_actors: null,
    is_published: null,
    is_publisheds: null,
    offset: moment().utcOffset(),
  };
  statusList = [
    { value: true, key: 'Published' },
    { value: false, key: 'Not published' },
  ];
  programsDatas: any;
  timeOutVal: any;
  userCreatedList = [];
  userUpdatedList = [];
  dataUnselectUser = [];
  allExportForCheckbox = [];
  currentUser: any;
  isPermission: string[];
  currentUserTypeId: any;

  tempDataFilter = {
    createdBy: null,
    updatedBy: null,
    status: null,
  };
  filterBreadcrumbData: any[] = [];

  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    public permissionService: PermissionService,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    private courseSequenceService: CourseSequenceService,
    private utilService: UtilityService,
    private authService: AuthService,
    private httpClient: HttpClient,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.initFilter();
    this.GetUserCreatedDropdown();
    this.GetUserUpdatedDropdown();
    this.multipleFilter();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.multipleFilter();
      this.getUserCreateName();
      this.getUserUpdateName();
      this.filterBreadcrumbFormat();
    });
    this.pageTitleService.setTitle('course_sequence.Template');
  }
  multipleFilter() {
    this.statusList = this.statusList.map((status) => {
      return {
        ...status,
        label: this.translate.instant(status?.key),
      };
    });
  }
  initFilter() {
    this.subs.sink = this.templateNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      // this.clearSelectIfFilter();
      if (!name.match(symbol) && !name.match(symbol1)) {
        this.filteredValues.name = name;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.GetAllTemplate();
        }
      } else {
        this.templateNameFilter.setValue('');
        this.filteredValues.name = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.GetAllTemplate();
        }
      }
    });
    this.subs.sink = this.descriptionFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      // this.clearSelectIfFilter();
      if (!name.match(symbol) && !name.match(symbol1)) {
        this.filteredValues.description = name;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.GetAllTemplate();
        }
      } else {
        this.descriptionFilter.setValue('');
        this.filteredValues.description = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.GetAllTemplate();
        }
      }
    });
    this.subs.sink = this.createdAtFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.created_at = statusSearch ? this.translateDate(statusSearch) : null;
      this.filteredValues['offset'] = moment().utcOffset();
      this.paginator.pageIndex = 0;
      // this.clearSelectIfFilter();
      if (!this.isReset) {
        this.GetAllTemplate();
      }
    });
    this.subs.sink = this.updatedAtFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.updated_at = statusSearch ? this.translateDate(statusSearch) : null;
      this.filteredValues['offset'] = moment().utcOffset();
      this.paginator.pageIndex = 0;
      // this.clearSelectIfFilter();
      if (!this.isReset) {
        this.GetAllTemplate();
      }
    });

    // this.subs.sink = this.statusFilter.valueChanges.subscribe((status) => {
    //   this.filteredValues.is_published = status === 'All' ? null : status;
    //   this.paginator.pageIndex = 0;
    //   // this.clearSelectIfFilter();
    //   if (!this.isReset) {
    //     this.GetAllTemplate();
    //   }
    // });

    // this.subs.sink = this.createdByFilter.valueChanges.subscribe((status) => {
    //   this.filteredValues.created_by = status === 'All' ? null : status;
    //   this.paginator.pageIndex = 0;
    //   // this.clearSelectIfFilter();
    //   if (!this.isReset) {
    //     this.GetAllTemplate();
    //   }
    // });

    // this.subs.sink = this.updatedByFilter.valueChanges.subscribe((status) => {
    //   this.filteredValues.updated_by = status === 'All' ? null : status;
    //   this.paginator.pageIndex = 0;
    //   // this.clearSelectIfFilter();
    //   if (!this.isReset) {
    //     this.GetAllTemplate();
    //   }
    // });
  }

  setCreatedByFilter() {
    const isSame = JSON.stringify(this.tempDataFilter.createdBy) === JSON.stringify(this.createdByFilter.value);
    if (isSame) {
      return;
    } else if (this.createdByFilter.value?.length) {
      this.filteredValues.created_actors = this.createdByFilter.value;
      this.tempDataFilter.createdBy = this.createdByFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.GetAllTemplate();
      }
    } else {
      if (this.tempDataFilter.createdBy?.length && !this.createdByFilter.value?.length) {
        this.filteredValues.created_actors = this.createdByFilter.value;
        this.tempDataFilter.createdBy = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.GetAllTemplate();
        }
      } else {
        return;
      }
    }
  }

  setUpdateByFilter() {
    const isSame = JSON.stringify(this.tempDataFilter.updatedBy) === JSON.stringify(this.updatedByFilter.value);
    if (isSame) {
      return;
    } else if (this.updatedByFilter.value?.length) {
      this.filteredValues.updated_actors = this.updatedByFilter.value;
      this.tempDataFilter.updatedBy = this.updatedByFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.GetAllTemplate();
      }
    } else {
      if (this.tempDataFilter.updatedBy?.length && !this.updatedByFilter.value?.length) {
        this.filteredValues.updated_actors = this.updatedByFilter.value;
        this.tempDataFilter.updatedBy = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.GetAllTemplate();
        }
      } else {
        return;
      }
    }
  }

  setStatusFilter() {
    const isSame = JSON.stringify(this.tempDataFilter.status) === JSON.stringify(this.statusFilter.value);
    if (isSame) {
      return;
    } else if (this.statusFilter.value?.length) {
      this.filteredValues.is_publisheds = this.statusFilter.value;
      this.tempDataFilter.status = this.statusFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.GetAllTemplate();
      }
    } else {
      if (this.tempDataFilter.status?.length && !this.statusFilter.value?.length) {
        this.filteredValues.is_publisheds = this.statusFilter.value;
        this.tempDataFilter.status = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.GetAllTemplate();
        }
      } else {
        return;
      }
    }
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.GetAllTemplate();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return this.isCheckedAll ? true : numSelected === numRows || numSelected > numRows;
  }

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
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
      // if (this.isCheckedAll) {
      // this.getDataAllForCheckbox(0);
      // }
    }
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
    this.disabledExport = numSelected <= 0;
    this.userSelected = [];
    this.userSelectedId = [];
    this.dataSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.userSelected.push(user);
      this.userSelectedId.push(user._id);
      this.dataSelectedId.push(user._id);
    });
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
        this.isLoading = true;
        this.subs.sink = this.courseSequenceService
          .getAllIdTemplateCourseSequenceCheckbox(pagination, this.filteredValues, this.sortValue)
          .subscribe(
            (templates) => {
              if (templates && templates.length) {
                const resp = _.cloneDeep(templates);
                this.allExportForCheckbox = _.concat(this.allExportForCheckbox, resp);
                const page = pageNumber + 1;
                this.getAllIdForCheckbox(page);
              } else {
                this.isLoading = false;
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
    } else {
      this.downloadCSV();
    }
  }

  filterBreadcrumbFormat() {
    let createdList = [];
    let updatedList = [];
    let statusListBreadcrumb = [];
    if (this.statusList?.length) {
      statusListBreadcrumb = this.statusList.map((status) => {
        return {
          key: status.key,
          value: typeof status?.value === 'boolean' ? String(status?.value) : status.value,
        };
      });
    }
    if (this.userCreatedList?.length) {
      createdList = this.userCreatedList.map((user) => {
        return {
          ...user,
          key:
            user?.last_name?.toUpperCase() +
            ' ' +
            user?.first_name +
            ' ' +
            (user?.civility && user?.civility !== 'neutral' ? this.translate.instant(user.civility) : ''),
        };
      });
    }
    if (this.userUpdatedList?.length) {
      updatedList = this.userUpdatedList.map((user) => {
        return {
          ...user,
          key:
            user?.last_name?.toUpperCase() +
            ' ' +
            user?.first_name +
            ' ' +
            (user?.civility && user?.civility !== 'neutral' ? this.translate.instant(user.civility) : ''),
        };
      });
    }
    const filteredValueAll = {
      created_actors: 'All',
      updated_actors: 'All',
      is_publisheds: 'All',
    };
    const filterInfo: FilterBreadCrumbInput[] = [
      // Table Filters below
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'name', // name of the key in the object storing the filter
        column: 'course_sequence.Template Name', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.templateNameFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'description',
        column: 'course_sequence.Description',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.descriptionFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'created_at',
        column: 'course_sequence.Created date',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.createdAtFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'created_actors',
        column: 'course_sequence.Created by',
        isMultiple: this.createdByFilter?.value?.length === createdList?.length ? false : true,
        filterValue: this.createdByFilter?.value?.length === createdList?.length ? filteredValueAll : this.filteredValues,
        filterList: this.createdByFilter?.value?.length === createdList?.length ? null : createdList,
        filterRef: this.createdByFilter,
        displayKey: this.createdByFilter?.value?.length === createdList?.length ? null : 'key',
        savedValue: this.createdByFilter?.value?.length === createdList?.length ? null : '_id',
        isSelectionInput: this.createdByFilter?.value?.length === createdList?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'updated_at',
        column: 'course_sequence.Updated date',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.updatedAtFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'updated_actors',
        column: 'course_sequence.Updated by',
        isMultiple: this.updatedByFilter?.value?.length === updatedList?.length ? false : true,
        filterValue: this.updatedByFilter?.value?.length === updatedList?.length ? filteredValueAll : this.filteredValues,
        filterList: this.updatedByFilter?.value?.length === updatedList?.length ? null : updatedList,
        filterRef: this.updatedByFilter,
        displayKey: this.updatedByFilter?.value?.length === updatedList?.length ? null : 'key',
        savedValue: this.updatedByFilter?.value?.length === updatedList?.length ? null : '_id',
        isSelectionInput: this.updatedByFilter?.value?.length === updatedList?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'is_publisheds',
        column: 'course_sequence.Status',
        isMultiple: this.statusFilter?.value?.length === statusListBreadcrumb?.length ? false : true,
        filterValue: this.statusFilter?.value?.length === statusListBreadcrumb?.length ? filteredValueAll : this.filteredValues,
        filterList: this.statusFilter?.value?.length === statusListBreadcrumb?.length ? null : this.statusList,
        filterRef: this.statusFilter,
        displayKey: this.statusFilter?.value?.length === statusListBreadcrumb?.length ? null : 'key',
        savedValue: this.statusFilter?.value?.length === statusListBreadcrumb?.length ? null : 'value',
        isSelectionInput: this.statusFilter?.value?.length === statusListBreadcrumb?.length ? false : true,
      },
    ];

    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
    console.log('cek filterbreadcrumb', this.filterBreadcrumbData);
    console.log('cek filtered', this.filteredValues);
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
    if (filterItem.name === 'created_actors') {
      this.tempDataFilter.createdBy = null;
    } else if (filterItem.name === 'updated_actors') {
      this.tempDataFilter.updatedBy = null;
    } else if (filterItem.name === 'is_publisheds') {
      this.tempDataFilter.status = null;
    }
    this.clearSelectIfFilter();
    this.GetAllTemplate();
  }

  resetFilter() {
    this.isReset = true;
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.paginator.pageIndex = 0;
    this.sortValue = null;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];

    this.templateNameFilter.setValue(null, { emitEvent: false });
    this.descriptionFilter.setValue(null, { emitEvent: false });
    this.createdAtFilter.setValue(null, { emitEvent: false });
    this.createdByFilter.setValue(null, { emitEvent: false });
    this.updatedAtFilter.setValue(null, { emitEvent: false });
    this.updatedByFilter.setValue(null, { emitEvent: false });
    this.statusFilter.setValue(null, { emitEvent: false });
    this.tempDataFilter = {
      createdBy: null,
      updatedBy: null,
      status: null,
    };

    this.filteredValues = {
      name: '',
      description: '',
      created_at: null,
      created_by: null,
      created_actors: null,
      updated_at: null,
      updated_by: null,
      updated_actors: null,
      is_published: null,
      is_publisheds: null,
      offset: moment().utcOffset(),
    };

    if ('offset' in this.filteredValues) {
      delete this.filteredValues['offset'];
    }

    this.filterBreadcrumbData = [];
    this.GetUserCreatedDropdown();
    this.GetUserUpdatedDropdown();
    this.GetAllTemplate();
  }

  GetAllTemplate(from?) {
    this.isWaitingForResponse = true;
    this.isLoading = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    this.subs.sink = this.courseSequenceService.GetAllTemplateCourseSequence(pagination, this.filteredValues, this.sortValue).subscribe(
      (res) => {
        if (res && res.length > 0) {
          const result = _.cloneDeep(res);
          this.programsDatas = _.cloneDeep(result);
          this.dataSource.data = result;
          this.paginator.length = result[0].count_document;
          this.dataCount = result[0].count_document;
          this.disabledExport = true;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
          this.disabledExport = true;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
        this.isLoading = false;
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        this.isLoading = false;
        this.swalError(err);
      },
    );
  }

  GetUserCreatedDropdown() {
    this.isWaitingForResponse = true;
    this.userCreatedList = [];
    this.subs.sink = this.courseSequenceService.GetAllUserCreateTemplateDropdown().subscribe(
      (res) => {
        this.isWaitingForResponse = false;
        const temp = _.cloneDeep(res);
        this.userCreatedList = _.uniqBy(temp, '_id');
        this.userCreatedList = this.userCreatedList.sort((groupA, groupB) => {
          if (this.utilService.simplifyRegex(groupA.last_name) < this.utilService.simplifyRegex(groupB.last_name)) {
            return -1;
          } else if (this.utilService.simplifyRegex(groupA.last_name) > this.utilService.simplifyRegex(groupB.last_name)) {
            return 1;
          } else {
            return 0;
          }
        });
        this.getUserCreateName();
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        this.userCreatedList = [];
        this.swalError(err);
      },
    );
  }

  getUserCreateName() {
    this.userCreatedList = this.userCreatedList.map((data) => {
      return {
        ...data,
        newLabel: data.last_name + ' ' + data.first_name + ' ' + this.translate.instant(data.civility),
      };
    });
  }

  GetUserUpdatedDropdown() {
    this.isWaitingForResponse = true;
    this.userUpdatedList = [];
    this.subs.sink = this.courseSequenceService.GetAllUserUpdateTemplateDropdown().subscribe(
      (res) => {
        this.isWaitingForResponse = false;
        const temp = _.cloneDeep(res);
        this.userUpdatedList = _.uniqBy(temp, '_id');
        this.userUpdatedList = this.userUpdatedList.sort((groupA, groupB) => {
          if (this.utilService.simplifyRegex(groupA.last_name) < this.utilService.simplifyRegex(groupB.last_name)) {
            return -1;
          } else if (this.utilService.simplifyRegex(groupA.last_name) > this.utilService.simplifyRegex(groupB.last_name)) {
            return 1;
          } else {
            return 0;
          }
        });
        this.getUserUpdateName();
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        this.userUpdatedList = [];
        this.swalError(err);
      },
    );
  }

  getUserUpdateName() {
    this.userUpdatedList = this.userUpdatedList.map((data) => {
      return {
        ...data,
        newLabel: data.last_name + ' ' + data.first_name + ' ' + this.translate.instant(data.civility),
      };
    });
  }

  getDataAllForCheckbox(pageNumber) {
    this.isWaitingForResponse = true;

    const pagination = {
      limit: 300,
      page: pageNumber,
    };

    this.subs.sink = this.courseSequenceService.GetAllTemplateCourseSequence(pagination, this.filteredValues, this.sortValue).subscribe(
      (info) => {
        if (info && info.length) {
          this.allStudentForCheckbox.push(...info);
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
            this.dataSelectedId = [];
            this.dataSelectedId = this.selection.selected;
            this.pageSelected.push(this.paginator.pageIndex);
          } else {
            this.pageSelected = [];
          }
        }
      },
      (error) => {
        this.isWaitingForResponse = false;
        // Record error log
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

  clearSelectIfFilter() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
  }

  resetFilterDropdown() {
    this.campusList = [];
    this.levelList = [];
    this.sectorList = [];
    this.specialityList = [];
  }

  swalError(err) {
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
  }

  onDelete(data) {
    if (data.is_published) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('TEMPLATE_S4.Title'),
        html: this.translate.instant('TEMPLATE_S4.Text'),
        confirmButtonText: this.translate.instant('TEMPLATE_S4.Button'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      return;
    }
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('TEMPLATE_S3.TITLE'),
      html: this.translate.instant('TEMPLATE_S3.TEXT', {
        name: data.name ? data.name : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('TEMPLATE_S3.BUTTON-1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('TEMPLATE_S3.BUTTON-2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      width: '33em',
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('TEMPLATE_S3.BUTTON-1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('TEMPLATE_S3.BUTTON-1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.isWaitingForResponse = true;
        this.subs.sink = this.courseSequenceService.DeleteTemplateCourseSequence(data._id).subscribe(
          (resp) => {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.isWaitingForResponse = false;
              this.paginator.pageIndex = 0;
              this.GetAllTemplate();
            });
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
            this.isWaitingForResponse = false;
            this.swalError(err);
          },
        );
      }
    });
  }
  openDetailTemplate(_id) {
    if (_id) {
      window.open('template-sequences/form-detail/' + _id, '_blank');
    } else {
      window.open('template-sequences/form-detail', '_blank');
    }
  }

  onOpenDuplicateDialog(data) {
    this.subs.sink = this.dialog
      .open(DuplciateTemplateSequenceDialogComponent, {
        width: '800px',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.GetAllTemplate();
        }
      });
  }

  downloadCSV() {
    if (this.dataSelected && this.dataSelected.length < 1 && !this.isCheckedAll) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('course_sequence.Template') }),
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
        title: this.translate.instant('EXPORT_DECISION.TITLE'),
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
    const template_name = this.filteredValues.name !== null ? this.filteredValues.name : '';
    const description = this.filteredValues.description !== null ? this.filteredValues.description : '';
    const created_at = this.filteredValues.created_at !== null ? this.filteredValues.created_at : '';
    const created_by = this.filteredValues.created_by !== null ? this.filteredValues.created_by : '';
    const updated_at = this.filteredValues.updated_at !== null ? this.filteredValues.updated_at : '';
    const updated_by = this.filteredValues.updated_by !== null ? this.filteredValues.updated_by : '';
    const is_published = this.filteredValues.is_publisheds?.length ? this.filteredValues.is_publisheds : '';
    const created_actors = this.filteredValues.created_actors?.length ? this.filteredValues.created_actors.map(value => `"` + value + `"`) : '';
    const updated_actors = this.filteredValues.updated_actors?.length ? this.filteredValues.updated_actors.map(value => `"` + value + `"`) : '';
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const importTemplateSequenceCSV = `downloadTemplateCourseSequenceCSV/`;

    let filter;
    if ((this.dataSelected.length && !this.isCheckedAll) || (this.dataUnselectUser && this.dataUnselectUser.length)) {
      let mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      mappedUserId = _.cloneDeep(mappedUserId);
      console.log(mappedUserId);
      filter =
        `filter={"template_course_id":` +
        `[` +
        mappedUserId.toString() +
        `],"name":"` +
        template_name +
        `","description":"` +
        description +
        `","created_at":"` +
        created_at +
        `","created_by":"` +
        created_by +
        `","updated_at":"` +
        updated_at +
        `","updated_by":"` +
        updated_by +
        `","is_publisheds":[` +
        is_published +
        `],"created_actors":[` +
        created_actors +
        `],"updated_actors":[` +
        created_actors +
        `],"offset":"` +
        moment().utcOffset() +
        `"}`;
    } else {
      filter =
        `filter={"name":"` +
        template_name +
        `","description":"` +
        description +
        `","created_at":"` +
        created_at +
        `","created_by":"` +
        created_by +
        `","updated_at":"` +
        updated_at +
        `","updated_by":"` +
        updated_by +
        `","is_publisheds":[` +
        is_published +
        `],"created_actors":[` +
        created_actors +
        `],"updated_actors":[` +
        created_actors +
        `],"offset":"` +
        moment().utcOffset() +
        `"}`;
    }
    // element.href = encodeURI(url + importTemplateSequenceCSV + fileType + '/' + lang + '?' + filter);
    // element.target = '_blank';
    // element.download = 'Balance Report CSV';
    // document.body.appendChild(element);
    // element.click();
    // document.body.removeChild(element);
    const sorting = this.sortingForExport();
    const fullUrl =
      url +
      importTemplateSequenceCSV +
      fileType +
      '/' +
      lang +
      '?' +
      filter +
      '&' +
      sorting +
      '&user_type_id="' +
      this.currentUserTypeId +
      '"';
    console.log('FULL URL', fullUrl);
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
      }),
    };

    this.isLoading = true;
    this.httpClient.get(`${encodeURI(fullUrl)}`, httpOptions).subscribe(
      (res) => {
        if (res) {
          this.isLoading = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('ReAdmission_S3.TITLE'),
            text: this.translate.instant('ReAdmission_S3.TEXT'),
            confirmButtonText: this.translate.instant('ReAdmission_S3.BUTTON'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => this.clearSelectIfFilter());
        } else {
          this.isLoading = false;
        }
      },
      (err) => {
        console.log('ERROR', err);
        this.isLoading = false;
      },
    );
  }
  sortingForExport() {
    let data = '';
    if (this.sortValue) {
      const sortData = _.cloneDeep(this.sortValue);
      Object.keys(sortData).forEach((key) => {
        if (sortData[key]) {
          data = data ? data + ',' + `"${key}":"${sortData[key]}"` : data + `"${key}":"${sortData[key]}"`;
        }
      });
    }
    return 'sorting={' + data + '}';
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  transformDate(data) {
    if (data && data.date && data.time) {
      const date = data.date;
      const time = data.time;

      return this.parseUtcToLocalPipe.transformDate(date, time);
    } else {
      return '';
    }
  }
  translateDate(date) {
    return moment(date).format('DD/MM/YYYY');
  }
  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.GetAllTemplate();
      }
    }
  }

  isAllDropdownSelected(type) {
    if (type === 'createdBy') {
      const selected = this.createdByFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.userCreatedList.length;
      return isAllSelected;
    } else if (type === 'updateBy') {
      const selected = this.updatedByFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.userUpdatedList.length;
      return isAllSelected;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.statusList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'createdBy') {
      const selected = this.createdByFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.userCreatedList.length;
      return isIndeterminate;
    } else if (type === 'updatedBy') {
      const selected = this.updatedByFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.userUpdatedList.length;
      return isIndeterminate;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.statusList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'createdBy') {
      if (event.checked) {
        const createdByData = this.userCreatedList.map((el) => el._id);
        this.createdByFilter.patchValue(createdByData);
      } else {
        this.createdByFilter.patchValue(null);
      }
    } else if (type === 'updatedBy') {
      if (event.checked) {
        const updatedByData = this.userUpdatedList.map((el) => el._id);
        this.updatedByFilter.patchValue(updatedByData);
      } else {
        this.updatedByFilter.patchValue(null);
      }
    } else if (type === 'status') {
      if (event.checked) {
        const statusData = this.statusList.map((el) => el.value);
        this.statusFilter.patchValue(statusData);
      } else {
        this.statusFilter.patchValue(null);
      }
    }
  }
}
