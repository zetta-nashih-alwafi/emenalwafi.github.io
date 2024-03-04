import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { CoreService } from 'app/service/core/core.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import * as moment from 'moment';
import { DuplicateFormBuilderDialogComponent } from './duplicate-form-builder-dialog/duplicate-form-builder-dialog.component';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { Observable, of } from 'rxjs';
import { PermissionService } from 'app/service/permission/permission.service';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-form-builder-table',
  templateUrl: './form-builder-table.component.html',
  styleUrls: ['./form-builder-table.component.scss'],
})
export class FormBuilderTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource([]);
  isWaitingForResponse = false;
  isTopWaitingForResponse = false;
  noData: any;

  displayedColumns: string[] = ['templateName', 'templateType', 'createdDate', 'creator', 'status', 'visible', 'action'];
  filterColumns: string[] = [
    'templateNameFilter',
    'templateTypeFilter',
    'createdDateFilter',
    'creatorFilter',
    'statusFilter',
    'visibleFilter',
    'actionFilter',
  ];
  templateCount = 0;

  statusList = [
    { name: 'AllM', id: '' },
    { name: 'Published', id: 'true' },
    { name: 'Not Published', id: 'false' },
  ];

  statusListBoolean = [
    { name: 'AllM', id: '' },
    { name: 'Published', id: true },
    { name: 'Not Published', id: false },
  ];

  templateTypeList = [
    { key: 'Student Admission', value: 'student_admission' },
    { key: 'Alumni Survey', value: 'alumni' },
    { key: 'Teacher Contract', value: 'teacher_contract' },
    { key: 'FC Contract/Convention', value: 'fc_contract' },
    { key: 'admission_document', value: 'admission_document' },
    { key: 'One Time Form', value: 'one_time_form' },
  ];
  visibleList = [
    { name: 'FORM_BUILDER.Available', id: 'false' },
    { name: 'FORM_BUILDER.Hidden', id: 'true' },
  ];
  visibleListBoolean = [
    { name: 'FORM_BUILDER.Available', id: false },
    { name: 'FORM_BUILDER.Hidden', id: true },
  ];

  templateNameFilter = new UntypedFormControl('');
  templateTypeFilter = new UntypedFormControl('All');
  createdDateFilter = new UntypedFormControl('');
  creatorFilter = new UntypedFormControl('');
  statusFilter = new UntypedFormControl('');
  visibleFilter = new UntypedFormControl('');
  private subs = new SubSink();
  filteredTempleteType: Observable<any>;

  filterBreadcrumbData: any[] = [];

  filteredValues: any = {
    created_at: null,
    created_by: null,
    status: null,
    form_builder_name: null,
    template_type: null,
    hide_form: null,
  };
  sortValue = null;
  isReset: any = false;
  timeOutVal: any;

  constructor(
    private pageTitleService: PageTitleService,
    private formBuilderService: FormBuilderService,
    public utilService: UtilityService,
    private router: Router,
    public dialog: MatDialog,
    private translate: TranslateService,
    private coreService: CoreService,
    public permission: PermissionService,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private authService: AuthService,
  ) {
    // this.pageTitleService.setTitle(this.translate.instant('List of Form Template'));
  }

  ngOnInit() {
    this.getTemplateTable();
    this.initFilter();
    this.coreService.sidenavOpen = false;

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.initFilter();
      this.displayWith(this.templateTypeFilter.value);
      if (
        this.templateTypeList?.length &&
        this.filteredValues?.template_type &&
        this.templateTypeFilter?.value &&
        (this.templateTypeFilter?.value !== 'All' || this.templateTypeFilter?.value !== 'Tous')
      ) {
        const findTemplate = this.templateTypeList.find((template) => template.key === this.templateTypeFilter?.value);
        if (findTemplate) {
          this.templateTypeFilter.patchValue(this.translate.instant(findTemplate?.key));
        }
      } else if (
        (this.templateTypeFilter?.value === 'All' || this.templateTypeFilter?.value === 'Tous') &&
        !this.filteredValues?.template_type
      ) {
        this.templateTypeFilter.patchValue(this.translate.instant('All'));
      }
      this.getTemplateTable();
    });
    this.pageTitleService.setTitle('List of Form Template');
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        tap(() => {
          if (!this.isReset) {
            this.getTemplateTable();
          }
        }),
      )
      .subscribe();
  }

  getTemplateTable() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const currentLang = this.translate.currentLang;
    this.subs.sink = this.formBuilderService.getAllFormBuilders(pagination, this.filteredValues, currentLang, this.sortValue).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp?.length) {
          this.dataSource.data = resp;
          this.templateCount = resp[0] && resp[0].count_document ? resp[0].count_document : 0;
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isWaitingForResponse = false;

          this.filterBreadcrumbData = [];
          this.filterBreadcrumbFormat();
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.templateCount = 0;
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  addFormBuilder() {
    this.router.navigate(['form-builder/template-detail']);
  }

  goToDetail() {
    this.router.navigate(['/template-detail']);
  }

  initFilter() {
    this.templateTypeList = this.templateTypeList.sort((a, b) =>
      this.translate.instant(a.key) > this.translate.instant(b.key)
        ? 1
        : this.translate.instant(b.key) > this.translate.instant(a.key)
        ? -1
        : 0,
    );
    this.visibleList = this.visibleList.sort((a, b) =>
      this.translate.instant(a.name) > this.translate.instant(b.name)
        ? 1
        : this.translate.instant(b.name) > this.translate.instant(a.name)
        ? -1
        : 0,
    );

    this.subs.sink = this.templateNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((text) => {
      this.filteredValues.form_builder_name = text;
      this.paginator.pageIndex = 0;
      this.getTemplateTable();
    });

    this.filteredTempleteType = this.templateTypeFilter.valueChanges.pipe(
      debounceTime(400),
      startWith(''),
      map((searchText) =>
        searchText
          ? this.templateTypeList
              .filter((type) => {
                if (type && typeof type.key === 'string' && type.value) {
                  const str = this.translate.instant(type.key);
                  return str.toLowerCase().trim().includes(searchText.toLowerCase().trim());
                } else {
                  return false;
                }
              })
              .sort((a: any, b: any) => {
                if (a && a.key && b && b.key) return a.key.localeCompare(b.key);
                else return 0;
              })
          : this.templateTypeList,
      ),
    );

    this.subs.sink = this.createdDateFilter.valueChanges.pipe().subscribe((text) => {
      this.filteredValues.created_at = moment(text).format('DD/MM/YYYY');
      this.filteredValues['offset'] = moment().utcOffset();
      this.paginator.pageIndex = 0;
      this.getTemplateTable();
    });

    this.subs.sink = this.creatorFilter.valueChanges.pipe(debounceTime(400)).subscribe((text) => {
      this.filteredValues.created_by = text;
      this.paginator.pageIndex = 0;
      this.getTemplateTable();
    });

    this.subs.sink = this.statusFilter.valueChanges.pipe().subscribe((text) => {
      this.filteredValues.status = text === 'true' ? true : text === 'false' ? false : null;
      this.paginator.pageIndex = 0;
      this.getTemplateTable();
    });

    this.subs.sink = this.visibleFilter.valueChanges.pipe().subscribe((text) => {
      this.filteredValues.hide_form = text === 'true' ? true : text === 'false' ? false : null;
      this.paginator.pageIndex = 0;
      this.getTemplateTable();
    });
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (!this.isWaitingForResponse) {
      this.paginator.pageIndex = 0;
      this.getTemplateTable();
    }
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
    this.getTemplateTable();
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      // Table Filters below
      {
        type: 'table_filter',
        name: 'form_builder_name',
        column: 'ERP_009_TEACHER_CONTRACT.Template Name',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.templateNameFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'template_type',
        column: 'ERP_009_TEACHER_CONTRACT.Template Type',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.templateTypeFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        resetValue: 'All',
      },
      {
        type: 'table_filter',
        name: 'created_at',
        column: 'FORM_BUILDER.Created Date',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.createdDateFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'created_by',
        column: 'FORM_BUILDER.Creator',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.creatorFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'status',
        column: 'Status',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.statusListBoolean,
        filterRef: this.statusFilter,
        displayKey: 'name',
        savedValue: 'id',
        isSelectionInput: true,
        resetValue: '',
      },
      {
        type: 'table_filter',
        name: 'hide_form',
        column: 'Visibility',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.visibleListBoolean,
        filterRef: this.visibleFilter,
        displayKey: 'name',
        savedValue: 'id',
        isSelectionInput: true,
        resetValue: '',
      },
    ];

    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
    console.log('this.filterBreadcrumbData', this.filterBreadcrumbData);
  }

  setTypeFilter(type) {
    if (type === 'All') {
      this.filteredValues.template_type = null;
      this.paginator.pageIndex = 0;
      this.initFilter();
      this.getTemplateTable();
    } else if (type && type.value && type.key) {
      this.filteredValues.template_type = type.value;
      this.paginator.pageIndex = 0;
      this.getTemplateTable();
    }
  }

  resetSelection() {
    this.paginator.pageIndex = 0;
    this.filteredValues = {
      created_at: null,
      created_by: null,
      status: null,
      form_builder_name: null,
      template_type: null,
      hide_form: null,
    };

    if ('offset' in this.filteredValues) {
      delete this.filteredValues['offset'];
    }

    this.templateTypeList = [
      { key: 'Student Admission', value: 'student_admission' },
      { key: 'Alumni Survey', value: 'alumni' },
      { key: 'Teacher Contract', value: 'teacher_contract' },
      { key: 'FC Contract/Convention', value: 'fc_contract' },
      { key: 'admission_document', value: 'admission_document' },
      { key: 'One Time Form', value: 'one_time_form' },
    ];
    this.templateNameFilter.setValue('', { emitEvent: false });
    this.createdDateFilter.setValue('', { emitEvent: false });
    this.creatorFilter.setValue('', { emitEvent: false });
    this.statusFilter.setValue('', { emitEvent: false });
    this.visibleFilter.setValue('', { emitEvent: false });
    this.templateTypeFilter.setValue('All');

    this.sort.direction = '';
    this.sort.active = '';
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sortValue = null;
    this.initFilter();
    this.filterBreadcrumbData = [];
    this.getTemplateTable();
  }

  duplicateTemplate(template) {
    this.subs.sink = this.dialog
      .open(DuplicateFormBuilderDialogComponent, {
        width: '400px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: template?._id,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.getTemplateTable();
        }
      });
  }

  goToTemplateDetail(templateId: string) {
    this.router.navigate([`form-builder/template-detail`], { queryParams: { templateId: templateId } });
  }

  deleteFormBuilderTemplate(template) {
    const templateId = template?._id;
    const templateName = template?.form_builder_name;
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('UserForm_S11.TITLE', { templateName: templateName }),
      text: this.translate.instant('UserForm_S11.TEXT', { templateName: templateName }),
      confirmButtonText: this.translate.instant('UserForm_S11.CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('UserForm_S11.CANCEL'),
      showCancelButton: true,
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: true,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('UserForm_S11.CONFIRM') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('UserForm_S11.CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((result) => {
      if (result.value) {
        this.isTopWaitingForResponse = true;
        this.subs.sink = this.formBuilderService.deleteFormBuilderTemplate(templateId).subscribe(
          (resp) => {
            this.isTopWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo !'),
              confirmButtonText: this.translate.instant('OK'),
            }).then((result) => {
              this.getTemplateTable();
            });
          },
          (err) => {
            this.authService.postErrorLog(err);
            this.isTopWaitingForResponse = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      }
    });
  }

  translateDate(date) {
    if (date) {
      return moment(date).format('DD/MM/YYYY');
    }
  }

  hideForm(selectedForm) {
    const { hide_form, _id } = selectedForm;
    const hidePayload = {
      hide_form: hide_form === null || hide_form === '' ? false : !hide_form,
    };

    if (!hide_form) {
      Swal.fire({
        title: this.translate.instant('Hide_S1.Title'),
        html: this.translate.instant('Hide_S1.Body'),
        type: 'warning',
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('Hide_S1.Button1'),
        cancelButtonText: this.translate.instant('Hide_S1.Button2'),
        allowOutsideClick: false,
        allowEnterKey: false,
      }).then((res) => {
        if (res.value) {
          this.isTopWaitingForResponse = true;
          this.subs.sink = this.formBuilderService.hideFormBuilderTemplate(_id, hidePayload).subscribe(
            (res) => {
              this.isTopWaitingForResponse = false;
              if (res) {
                Swal.fire({
                  type: 'success',
                  title: 'Bravo!',
                  confirmButtonText: 'OK',
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.getTemplateTable();
                });
              }
            },
            (err) => {
              this.authService.postErrorLog(err);
              this.isTopWaitingForResponse = false;
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            },
          );
        }
      });
    } else {
      Swal.fire({
        title: this.translate.instant('Hide_S2.Title'),
        html: this.translate.instant('Hide_S2.Body'),
        type: 'warning',
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('Hide_S2.Button1'),
        cancelButtonText: this.translate.instant('Hide_S2.Button2'),
        allowOutsideClick: false,
        allowEnterKey: false,
      }).then((res) => {
        if (res.value) {
          this.isTopWaitingForResponse = true;
          this.subs.sink = this.formBuilderService.hideFormBuilderTemplate(_id, hidePayload).subscribe(
            (ress) => {
              this.isTopWaitingForResponse = false;
              if (ress) {
                Swal.fire({
                  type: 'success',
                  title: 'Bravo!',
                  confirmButtonText: 'OK',
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.getTemplateTable();
                });
              }
            },
            (err) => {
              this.authService.postErrorLog(err);
              this.isTopWaitingForResponse = false;
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            },
          );
        }
      });
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  displayWith(value) {
    if (value && (value === 'All' || value === 'Tous')) {
      return this.translate.instant('All');
    } else {
      return value;
    }
  }
}
