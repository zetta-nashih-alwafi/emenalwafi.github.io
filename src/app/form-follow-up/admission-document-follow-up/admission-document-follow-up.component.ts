import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, of } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { FormFollowUpService } from '../form-follow-up.service';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UtilityService } from 'app/service/utility/utility.service';
import swal from 'sweetalert2';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';

@Component({
  selector: 'ms-admission-document-follow-up',
  templateUrl: './admission-document-follow-up.component.html',
  styleUrls: ['./admission-document-follow-up.component.scss'],
})
export class AdmissionDocumentFollowUpComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();

  displayedColumns: string[] = ['templateName', 'type', 'program', 'action'];
  filterColumns: string[] = ['templateNameFilter', 'typeFilter', 'programFilter', 'actionFilter'];
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
    template_name: '',
    type: null,
    program_id: null,
    logged_in_user_type_id: '',
  };
  filteredValuesAll = {
    template_name: 'all',
    type: 'all',
    program_id: 'all',
  };

  templateNameFilter: UntypedFormControl = new UntypedFormControl('');

  typeFilter: UntypedFormControl = new UntypedFormControl(null);
  typeFilterData = [{ value: 'admission_document', key: 'Admission Document' }];

  programFilters: UntypedFormControl = new UntypedFormControl(null);
  programFilterData: any = [];
  filteredProgram: Observable<any>;

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
  filterBreadcrumbData: FilterBreadCrumbItem[] = [];
  isMultipleFilter = false;

  constructor(
    private formFollowUpService: FormFollowUpService,
    private router: Router,
    private authService: AuthService,
    private utilService: UtilityService,
    private translate: TranslateService,
    private pageTitleService: PageTitleService,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    this.userData = this.authService.getCurrentUser();
    this.isUserAcadDir = this.utilService.isUserAcadir();
    this.isUserCertifierAdmin = this.utilService.isCertifierAdmin();
    // console.log('acadir', this.isUserAcadDir, 'isUserCertifierAdmin', this.isUserCertifierAdmin);
    // this.isWaitingForResponse = true;
    this.getDropdown();
    this.getFormFollowUpDatas();
    this.initFilter();
    this.initDropdown();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      // this.resetSelection();
      this.displayWith(this.programFilters.value);
      this.initDropdown();
    });
    this.pageTitleService.setTitle('Admission Document Follow Up');
  }
  initDropdown() {
    this.typeFilterData = this.typeFilterData.map((filter) => {
      return {
        ...filter,
        label: this.translate.instant(filter.key),
      };
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

  getDropdown() {
    // let userLogin = '';
    // if (this.isUserAcadDir) {
    //   userLogin = 'acadir';
    // } else if (this.isUserCertifierAdmin) {
    //   userLogin = 'certifier';
    // } else {
    //   userLogin = null;
    // }
    const defaulTemplateType = ['admission_document'];

    this.subs.sink = this.formFollowUpService.getAllFormFollowUpDropdown(defaulTemplateType).subscribe(
      (res) => {
        if (res && res.program_ids && res.program_ids.length > 0) {
          this.programFilterData = res.program_ids;
          this.programFilterData = this.programFilterData.sort((a, b) => a.program.localeCompare(b.program));
          this.filteredProgram = of(this.programFilterData);
          // ************* Start for auto complete
          this.subs.sink = this.programFilters.valueChanges.subscribe((statusSearch) => {
            this.isMultipleFilter = true;
            if (typeof statusSearch === 'string') {
              const result = this.programFilterData.filter((ttl) =>
                this.utilService.simplifyRegex(ttl.program).includes(this.utilService.simplifyRegex(statusSearch)),
              );
              this.filteredProgram = of(result);
            }
          });
        } else {
          this.programFilterData = [];
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
      },
    );
  }

  getFormFollowUpDatas() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    const filter = this.getFilter();

    const defaulTemplateType = !this.filteredValues?.type?.length ? ['admission_document'] : null;
    console.log('cek filter', this.filteredValues, filter);
    this.subs.sink = this.formFollowUpService.getAllFormFollowUp(filter, this.sortValue, pagination, defaulTemplateType).subscribe(
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

  getFilter() {
    const programMap = this.filteredValues?.program_id?.length ? this.filteredValues?.program_id?.map((res) => `"` + res + `"`) : '';
    const typeMap = this.filteredValues.type?.length ? this.filteredValues.type?.map((res) => `"` + res + `"`) : '';

    let filter = ``;
    filter += `logged_in_user_type_id : "${this.userData.entities[0].type._id}"`;
    filter += this.filteredValues.template_name ? `template_name : "${this.filteredValues.template_name}"` : '';
    filter += this.filteredValues.type ? `template_types : [${typeMap}]` : '';
    filter += this.filteredValues.program_id ? `program_ids : [${programMap}]` : '';

    return filter;
  }

  initFilter() {
    this.subs.sink = this.templateNameFilter.valueChanges.pipe(debounceTime(800)).subscribe((nameSearch) => {
      this.filteredValues.template_name = nameSearch;
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
          this.subs.sink = this.formFollowUpService
            .sendReminderAdmissionDocument(data.program_id._id, null, data.form_builder_id._id)
            .subscribe(
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

  resetSelection() {
    this.filteredValues = {
      template_name: '',
      type: null,
      logged_in_user_type_id: '',
      program_id: null,
    };
    this.isMultipleFilter = false;

    this.templateNameFilter.setValue('', { emitEvent: false });
    this.typeFilter.setValue(null, { emitEvent: false });
    this.programFilters.setValue(null, { emitEvent: false });

    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.filterBreadcrumbData = [];

    this.paginator.pageIndex = 0;

    this.getDropdown();
    this.getFormFollowUpDatas();

    this.filteredProgram = of(this.programFilterData);
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (!this.isWaitingForResponse) {
      this.paginator.pageIndex = 0;
      this.getFormFollowUpDatas();
    }
  }

  goToTemplateDetail(templateId, templateType, programId) {
    if (templateId && templateType) {
      this.router.navigate(['/form-follow-up/details/', templateId], {
        queryParams: { form_type: templateType, programId },
      });
    }
  }

  setProgram(data) {
    if (data && data === 'All') {
      this.filteredValues.program_id = null;
      this.programFilters.setValue('All');
      this.paginator.pageIndex = 0;
      this.filteredProgram = of(this.programFilterData);
      this.getFormFollowUpDatas();
    } else {
      this.filteredValues.program_id = data._id;
      this.programFilters.setValue(data.program);
      this.paginator.pageIndex = 0;
      this.getFormFollowUpDatas();
    }
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
      if (filterItem.name === 'program_id') {
        // to handle programsFilter value Change dropdown async mat auto complete
        this.programFilters.patchValue('All');
      }
      this.getFormFollowUpDatas();
    }
  }

  displayWith(value) {
    if (value && value === 'All') {
      return this.translate.instant('All');
    } else {
      return value;
    }
  }
  isAllDropdownSelected(type) {
    if (type === 'type') {
      const selected = this.typeFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.typeFilterData.length;
      return isAllSelected;
    } else if (type === 'program') {
      const selected = this.programFilters.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.programFilterData.length;
      return isAllSelected;
    }
  }
  isSomeDropdownSelected(type) {
    if (type === 'type') {
      const selected = this.typeFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.typeFilterData.length;
      return isIndeterminate;
    } else if (type === 'program') {
      const selected = this.programFilters.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.programFilterData.length;
      return isIndeterminate;
    }
  }
  selectAllData(event, type) {
    if (type === 'type') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.typeFilterData.map((el) => el.value);
        this.typeFilter.patchValue(data, { emitEvent: false });
      } else {
        this.typeFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'program') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.programFilterData.map((el) => el._id);
        this.programFilters.patchValue(data, { emitEvent: false });
      } else {
        this.programFilters.patchValue(null, { emitEvent: false });
      }
    }
  }
  onFilterSelectMultiple(key) {
    if (this.isMultipleFilter) {
      this.isMultipleFilter = false;
      let value = key === 'type' ? this.typeFilter.value : key === 'program_id' ? this.programFilters.value : null;
      this.filteredValues[key] = value?.length ? value : null;
      this.paginator.pageIndex = 0;
      this.getFormFollowUpDatas();
    }
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'template_name', // name of the key in the object storing the filter
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
        name: 'type', // name of the key in the object storing the filter
        column: 'Form Type', // name of the column in the table or the field if super filter
        isMultiple: this.typeFilter?.value?.length === this.typeFilterData?.length ? false : true, // can it support multiple selection
        filterValue: this.typeFilter?.value?.length === this.typeFilterData?.length ? this.filteredValuesAll : this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.typeFilter?.value?.length === this.typeFilterData?.length ? null : this.typeFilterData, // the array/list holding the dropdown options
        filterRef: this.typeFilter, // the ref to form control binded to the filter
        isSelectionInput: this.typeFilter?.value?.length === this.typeFilterData?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.typeFilter?.value?.length === this.typeFilterData?.length ? null : 'label', // the key displayed in the html (only applicable to array of objects)
        savedValue: this.typeFilter?.value?.length === this.typeFilterData?.length ? null : 'value',
        resetValue: '',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'program_id', // name of the key in the object storing the filter
        column: 'Program', // name of the column in the table or the field if super filter
        isMultiple: this.programFilters?.value?.length === this.programFilterData?.length ? false : true, // can it support multiple selection
        filterValue: this.programFilters?.value?.length === this.programFilterData?.length ? this.filteredValuesAll : this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.programFilters?.value?.length === this.programFilterData?.length ? null : this.programFilterData, // the array/list holding the dropdown options
        filterRef: this.programFilters, // the ref to form control binded to the filter
        isSelectionInput: this.programFilters?.value?.length === this.programFilterData?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.programFilters?.value?.length === this.programFilterData?.length ? null : 'program', // the key displayed in the html (only applicable to array of objects)
        savedValue: this.programFilters?.value?.length === this.programFilterData?.length ? null : '_id',
        resetValue: 'All',
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeOutVal);
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
}
