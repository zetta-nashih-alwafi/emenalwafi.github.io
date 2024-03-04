import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { FormFollowUpService } from '../form-follow-up.service';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UtilityService } from 'app/service/utility/utility.service';
import swal from 'sweetalert2';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';

@Component({
  selector: 'ms-general-form-follow-up',
  templateUrl: './general-form-follow-up.component.html',
  styleUrls: ['./general-form-follow-up.component.scss'],
})
export class GeneralFormFollowUpComponent implements OnInit, AfterViewInit, OnDestroy {
  private subs = new SubSink();

  displayedColumns: string[] = ['templateName', 'type', 'action'];
  filterColumns: string[] = ['templateNameFilter', 'typeFilter', 'actionFilter'];
  dataSource = new MatTableDataSource([]);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataCount: number;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  sortValue: any;
  isWaitingForResponse;
  templateCount = 0;
  noData: any;

  datas: any;

  filteredValues = {
    form_builder_name: '',
    template_types: [], /// this code is only to trick the payload, because the dropdown list is only one, happen in reset too
    is_already_sent: true,
    logged_in_user_type_id: '',
    template_type: null,
  };

  filteredValuesAll = {
    template_types: 'All',
  };

  templateNameFilter: UntypedFormControl = new UntypedFormControl('');

  typeFilter: UntypedFormControl = new UntypedFormControl(null);
  typeFilterData = [{ value: 'one_time_form', key: 'One Time Form', label: this.translate.instant('One Time Form') }];

  classFilter: UntypedFormControl = new UntypedFormControl('');
  classFilterData: any;
  filteredClass: Observable<any>;
  filteredClassByTitle: any;
  private timeOutVal: any;

  titleManagerFilter = new UntypedFormControl('');
  userData: any;
  isUserAcadDir: any;
  isUserCertifierAdmin: boolean;
  isWaitingNotify = false;
  entityData: any;
  filterBreadcrumbData: FilterBreadCrumbItem[] = [];
  isMultipleFilter = false;
  dataSelected: any[];
  isCheckedAll: boolean;
  userSelected: any[];
  tempDataFilter = {
    formTypes: null,
  };
  isReset: boolean = false;

  constructor(
    private formFollowUpService: FormFollowUpService,
    private router: Router,
    private authService: AuthService,
    private utilService: UtilityService,
    private translate: TranslateService,
    private formBuilderService: FormBuilderService,
    private pageTitleService: PageTitleService,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    this.userData = this.authService.getCurrentUser();
    this.entityData = this.userData?.entities[0]?.type?._id;
    this.isUserAcadDir = this.utilService.isUserAcadir();
    this.isUserCertifierAdmin = this.utilService.isCertifierAdmin();
    // console.log('acadir', this.isUserAcadDir, 'isUserCertifierAdmin', this.isUserCertifierAdmin);
    // this.isWaitingForResponse = true;
    this.getFormFollowUpDatas();
    this.initFilter();
    this.pageTitleService.setTitle('General');
    this.initDropdown();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.initDropdown();
    });
  }

  ngAfterViewInit() {
    // this.dataSource.sort = this.sort;
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          this.getFormFollowUpDatas();
        }),
      )
      .subscribe();
  }
  initDropdown() {
    this.typeFilterData = this.typeFilterData.map((filter) => {
      return {
        ...filter,
        label: this.translate.instant(filter.key),
      };
    });
  }
  updatePageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('NAV.General Form Follow Up'));
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(this.translate.instant('NAV.General Form Follow Up'));
    });
  }

  getFormFollowUpDatas() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    // const filter = this.getFilter();
    const lang = localStorage.getItem('currentLang');
    this.filteredValues.logged_in_user_type_id = this.entityData;

    const filter = {};
    for (const [key, value] of Object.entries(this.filteredValues)) {
      if (value) {
        if ('template_types' === key && this.filteredValues['template_types']?.length < 1) {
          filter['template_types'] = ['one_time_form'];
        } else {
          filter[key] = value;
        }
      }

      // *************** handle default value "one_time_form" for form type field
      if (key === 'template_types' && !value?.length) {
        filter[key] = ['one_time_form'];
      }
    }
    this.subs.sink = this.formBuilderService.getAllFormBuilders(pagination, filter, lang, this.sortValue).subscribe(
      (resp) => {
        this.datas = _.cloneDeep(resp);
        if (resp) {
          this.filteredClassByTitle = resp;
          this.dataSource.data = resp;
          this.paginator.length = resp && resp[0] && resp[0].count_document ? resp[0].count_document : 0;
          this.dataCount = resp && resp[0] && resp[0].count_document ? resp[0].count_document : 0;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.isWaitingForResponse = false;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.dataCount = 0;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
      },
    );
  }

  initFilter() {
    this.subs.sink = this.templateNameFilter.valueChanges.pipe(debounceTime(800)).subscribe((nameSearch) => {
      this.filteredValues.form_builder_name = nameSearch;
      this.paginator.pageIndex = 0;
      this.getFormFollowUpDatas();
    });
    this.subs.sink = this.typeFilter.valueChanges.subscribe((typeSearch) => {
      this.isMultipleFilter = true;
    });
  }

  checkSendReminder(data) {
    let timeDisabled = 3;
    swal
      .fire({
        title: this.translate.instant('Reminder_ADM_DOC_N4.Title'),
        type: 'warning',
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('Reminder_ADM_DOC_N4.Button1', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('Reminder_ADM_DOC_N4.Button2'),
        allowOutsideClick: false,
        allowEnterKey: false,
        onOpen: () => {
          swal.disableConfirmButton();
          const confirmBtnRef = swal.getConfirmButton();
          const intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('Reminder_ADM_DOC_N4.Button1') + ` (${timeDisabled})`;
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('Reminder_ADM_DOC_N4.Button1');
            swal.enableConfirmButton();
            clearInterval(intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      })
      .then((resp: any) => {
        clearTimeout(this.timeOutVal);
        if (resp.value) {
          this.isWaitingNotify = true;
          const lang = localStorage.getItem('currentLang');
          this.subs.sink = this.formFollowUpService.sendReminderOneTimeForm(null, data._id, lang).subscribe(
            () => {
              swal.fire({
                type: 'success',
                title: 'Bravo',
                confirmButtonText: 'OK',
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              });
              this.isWaitingNotify = false;
            },
            (error) => {
              // Record error log
              this.authService.postErrorLog(error);
              swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
              this.isWaitingNotify = false;
            },
          );
        }
      });
  }

  isAllDropdownSelected(type) {
    if (type === 'form_types') {
      const selected = this.typeFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.typeFilterData.length;
      return isAllSelected;
    }
    if (type === 'type') {
      const selected = this.typeFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.typeFilterData.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'form_types') {
      const selected = this.typeFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.typeFilterData.length;
      return isIndeterminate;
    }
    if (type === 'type') {
      const selected = this.typeFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.typeFilterData.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'form_types') {
      if (event.checked) {
        const data = this.typeFilterData.map((type) => type?.value);
        this.typeFilter.patchValue(data, { emitEvent: false });
      } else {
        this.typeFilter.patchValue(null, { emitEvent: false });
      }
    }
    if (type === 'type') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.typeFilterData.map((el) => el.value);
        this.typeFilter.patchValue(data, { emitEvent: false });
      } else {
        this.typeFilter.patchValue(null, { emitEvent: false });
      }
    }
  }

  setFormTypeFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelected = [];
    const isSame = JSON.stringify(this.tempDataFilter?.formTypes) === JSON.stringify(this.typeFilter?.value);
    if (isSame) {
      return;
    } else if (this.typeFilter.value?.length) {
      this.filteredValues.template_types = this.typeFilter.value;
      this.tempDataFilter.formTypes = this.typeFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getFormFollowUpDatas();
      }
    } else {
      if (this.tempDataFilter.formTypes?.length && !this.typeFilter.value?.length) {
        this.filteredValues.template_types = this.typeFilter.value;
        this.tempDataFilter.formTypes = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getFormFollowUpDatas();
        }
      } else {
        return;
      }
    }
  }

  resetSelection() {
    this.isReset = true;
    this.filteredValues = {
      form_builder_name: '',
      template_types: [], /// this code is only to trick the payload, because the dropdown list is only one
      is_already_sent: true,
      logged_in_user_type_id: this.entityData,
      template_type: null,
    };
    this.isMultipleFilter = false;

    this.templateNameFilter.setValue('', { emitEvent: false });
    this.typeFilter.setValue(null, { emitEvent: false });

    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.filterBreadcrumbData = [];

    this.paginator.pageIndex = 0;

    this.getFormFollowUpDatas();
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (!this.isWaitingForResponse) {
      this.paginator.pageIndex = 0;
      this.getFormFollowUpDatas();
    }
  }

  goToTemplateDetail(templateId, templateType) {
    if (templateId && templateType) {
      this.router.navigate(['/form-follow-up/details/', templateId], {
        queryParams: { form_type: templateType },
      });
    }
  }
  onFilterSelectMultiple(key) {
    if (this.isMultipleFilter) {
      this.isMultipleFilter = false;
      let value = key === 'template_types' ? this.typeFilter.value : null;
      if (key === 'template_types' && value?.length) {
        this.filteredValues.template_type = null;
        this.filteredValues[key] = value;
      } else {
        this.filteredValues.template_type = 'one_time_form';
        this.filteredValues[key] = null;
      }
      this.paginator.pageIndex = 0;
      this.getFormFollowUpDatas();
    }
  }

  filterBreadcrumbFormat() {
    // const formTypeFilter = this.filteredValues?.template_types && !this.typeFilter?.value ? null : this.filteredValues?.template_types;
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'form_builder_name', // name of the key in the object storing the filter
        column: 'Template Name', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.templateNameFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null,
        noTranslate: true,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'template_types', // name of the key in the object storing the filter
        column: 'Form Type', // name of the column in the table or the field if super filter
        isMultiple: this.typeFilter?.value?.length === this.typeFilterData?.length ? false : true, // can it support multiple selection
        filterValue:
          this.typeFilter?.value !== null && this.typeFilter?.value?.length === this.typeFilterData?.length
            ? this.filteredValuesAll
            : this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.typeFilter?.value?.length === this.typeFilterData?.length ? null : this.typeFilterData, // the array/list holding the dropdown options
        filterRef: this.typeFilter, // the ref to form control binded to the filter
        isSelectionInput: this.typeFilter?.value?.length === this.typeFilterData?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.typeFilter?.value?.length === this.typeFilterData?.length ? null : 'label', // the key displayed in the html (only applicable to array of objects)
        savedValue: this.typeFilter?.value?.length === this.typeFilterData?.length ? null : 'value',
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      if (filterItem?.column === 'Form Type') {
        this.filteredValues.template_types = [];
        this.typeFilter.patchValue(null, { emitEvent: false });
        this.tempDataFilter.formTypes = null;
      } else {
        this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
      }
      this.getFormFollowUpDatas();
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeOutVal);
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
}
