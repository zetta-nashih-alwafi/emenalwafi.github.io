import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FormFollowUpService } from 'app/form-follow-up/form-follow-up.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { debounceTime, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-candidate-form-tab',
  templateUrl: './candidate-form-tab.component.html',
  styleUrls: ['./candidate-form-tab.component.scss'],
  providers: [ParseUtcToLocalPipe]
})
export class CandidateFormTabComponent implements OnInit, AfterViewInit, OnDestroy {
  private subs = new SubSink();
  @Input() scholarSeasonData;
  @Input() candidateId;
  @Input() isStudentCard;
  displayedColumns: string[] = ['templateName', 'type', 'sendDate', 'lastModified', 'status', 'action'];
  filterColumns: string[] = ['templateNameFilter', 'typeFilter', 'sendDateFilter', 'lastModifiedFilter', 'statusFilter', 'actionFilter'];
  dataSource = new MatTableDataSource([]);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isWaitingForResponse: Boolean = false;
  noData: any;
  dataCount: any;
  sortValue = null;
  templateNameFilter =  new UntypedFormControl(null);
  typeFilter = new UntypedFormControl(null);
  statusFilter = new UntypedFormControl(null);
  sendDateFilter = new UntypedFormControl(null);
  lastModifiedFilter = new UntypedFormControl(null);

  templateTypeList = [];

  statusList = [];

  filteredValues = {
    template_name: null,
    form_type: [],
    send_date: null,
    last_modified: null,
    offset: null,
    status_form: [],
  };
  currentUser: any;

  constructor(
    private userService: AuthService, 
    private router: Router,
    private formFollowUpService: FormFollowUpService,
    private translate: TranslateService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private pageTitleService: PageTitleService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.userService.getLocalStorageUser();
    this.initFilter();
    this.getAllStudentForm();

    this.getTemplateTypeList();
    this.getStatusList();

    this.pageTitleService.setTitle(this.translate.instant('Student Card Forms'))
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getTemplateTypeList();
      this.getStatusList();
      this.updatePageTitle();
    });
  }

  updatePageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('Student Card Forms'))
  }

  getTemplateTypeList() {
    this.templateTypeList = [
      { key: this.translate.instant('Student Admission'), value: 'student_admission' },
      { key: this.translate.instant('Alumni Survey'), value: 'alumni' },
      { key: this.translate.instant('FC Contract/Convention'), value: 'fc_contract' },
      { key: this.translate.instant('Admission Document'), value: 'admission_document' },
      { key: this.translate.instant('One Time Form'), value: 'one_time_form' },
      { key: this.translate.instant('Visa Document'), value: 'visa_document' },
    ];

    this.templateTypeList = _.sortBy(this.templateTypeList, 'key')
  }

  getStatusList() {
    this.statusList = [
      { key: this.translate.instant('In progress'), value: 'in_progress' },
      { key: this.translate.instant('Rejected by Validator'), value: 'ask_for_revision' },
      { key: this.translate.instant('Closed'), value: 'rejected' },
      { key: this.translate.instant('Waiting for validation'), value: 'waiting_for_validation' },
      { key: this.translate.instant('Completed'), value: 'completed' },
      { key: this.translate.instant('document_expired'), value: 'document_expired' }
    ];

    this.statusList = _.sortBy(this.statusList, 'key')
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          this.getAllStudentForm();
        }),
      )
      .subscribe();
  }

  initFilter() {
    this.subs.sink = this.templateNameFilter.valueChanges.pipe(debounceTime(800)).subscribe((nameSearch) => {
      this.filteredValues.template_name = nameSearch;
      this.paginator.pageIndex = 0;
      this.getAllStudentForm();
    });
    this.subs.sink = this.sendDateFilter.valueChanges.pipe(debounceTime(500)).subscribe((dataSearch) => {
      if (dataSearch) {
        const newDate = moment(dataSearch).format('DD/MM/YYYY');
        this.filteredValues.send_date = newDate;
      } else {
        this.filteredValues.send_date = null;
      }
      this.paginator.pageIndex = 0;
      this.getAllStudentForm();
    });
    this.subs.sink = this.lastModifiedFilter.valueChanges.pipe(debounceTime(500)).subscribe((dataSearch) => {
      if (dataSearch) {
        const newDate = moment(dataSearch).format('DD/MM/YYYY');
        this.filteredValues.last_modified = newDate;
      } else {
        this.filteredValues.last_modified = null;
      }
      this.paginator.pageIndex = 0;
      this.getAllStudentForm();
    })
  }

  getAllStudentForm() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    
    const candidatesId = this.candidateId;
    const intakeChannelId = this.scholarSeasonData?.intake_channel?._id;

    this.filteredValues.offset = moment().utcOffset();
    
    const finalFilteredValues = this.cleanFilterData();
    this.subs.sink = this.formFollowUpService
      .getAllJoinedFormProcessForStudentCard(candidatesId, intakeChannelId, pagination, finalFilteredValues, this.sortValue)
      .subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp && resp.length) {
            this.dataCount = resp[0].count_document;
            this.noData = false;

            // *************** mapping status color
            this.dataSource.data = (resp || []).map((data) => {
              data.sendDate = this.parseUTCToLocalPipe.transformDate(data?.send_date?.date, data?.send_date?.time);
              data.step_status = data?.status_form;
                if(data.step_status === 'completed') {
                  data.step_status_color = 'green';
                } else if(data.step_status === 'in_progress') {
                  data.step_status_color = 'yellow';
                } else if(data.step_status === 'waiting_for_validation') {
                  data.step_status_color = 'orange';
                } else if(data.step_status === 'ask_for_revision') {
                  data.step_status = 'rejected_by_validator';
                  data.step_status_color = 'red';
                } else if(data.step_status === 'rejected') {
                  data.step_status = 'closed';
                  data.step_status_color = 'red';
                } else if(data.step_status === 'document_expired') {
                  data.step_status_color = 'purple';
                }
              if(!data.form_builder_id) {
                // *************** mapping data for admission FI static form
                if(data.form_type === 'visa_document') {
                  data.template_name = 'visa / stay permit';
                } else {
                  data.template_name = 'Admission';
                }
              };
              return data;
            });
          } else {
            this.noData = true;
            this.dataSource.data = [];
            this.paginator.length = 0;
            this.dataCount = 0;
          }
        },
        (err) => {
          // Record error log
          this.userService.postErrorLog(err);
          this.isWaitingForResponse = false;
        }
      );
  }

  onFilterSelect(filterName: string) {
    if(filterName === 'typeFilter') {
      if(this.typeFilter.value) {
         this.filteredValues.form_type = this.typeFilter.value;
         this.getAllStudentForm();
      };
    } else if(filterName === 'statusFilter') {
      if(this.statusFilter.value) {
        this.filteredValues.status_form = this.statusFilter.value;
        this.getAllStudentForm();
     };
    }
  }

  isAllDropdownSelected(filterName) {
    if(filterName === 'typeFilter') {
      const selected = this.typeFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.templateTypeList.length;
      return isAllSelected;
    } else if(filterName === 'statusFilter') {
      const selected = this.statusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.statusList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(filterName) {
    if(filterName === 'typeFilter') {
      const selected = this.typeFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.templateTypeList.length;
      return isIndeterminate;
    } else if(filterName === 'statusFilter') {
      const selected = this.statusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.statusList.length;
      return isIndeterminate;
    }
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    this.paginator.pageIndex = 0;
    this.getAllStudentForm();
  }

  selectAllData(filterName: string, data) {
    if(filterName === 'typeFilter') { 
      if (data.checked) {
        const allTemplate = this.templateTypeList.map(data => data.value);
        this.typeFilter.patchValue(allTemplate);
      } else {
        this.typeFilter.patchValue(null, { emitEvent: false });
      }
    } else if(filterName === 'statusFilter') {
      if (data.checked) {
        const allTemplate = this.statusList.map(data => data.value);
        this.statusFilter.patchValue(allTemplate);
      } else {
        this.statusFilter.patchValue(null, { emitEvent: false });
      }
    }
  }

  goToForm(dataForm) {
    const templateType = dataForm?.form_builder_id?.template_type ? dataForm?.form_builder_id?.template_type : dataForm?.form_type;
    const candidateId = this.candidateId ? this.candidateId : '';
    const currentUserTypeId = this.currentUser?.entities[0].type._id;
    const studentId = this.scholarSeasonData?.student_id?.user_id?._id
    const domainUrl = this.router.url.split('/')[0];
    if(dataForm?.form_builder_id) {
      if(templateType === 'fc_contract') {
        window.open(
          `${domainUrl}/form-fill?formId=${dataForm._id}&formType=${templateType}&userId=${this.currentUser._id}&userTypeId=${currentUserTypeId}&action=view`,
          '_blank',
        );
      } else if(templateType === 'admission_document') {
        const formType = 'admissionDocument';
        window.open(
          `${domainUrl}/form-filling?formId=${dataForm._id}&formType=${formType}&userId=${this.currentUser._id}&userTypeId=${currentUserTypeId}`,
          '_blank',
        );
      } else {
        window.open(
          `${domainUrl}/form-filling?formId=${dataForm._id}&formType=${templateType}&userId=${this.currentUser._id}&userTypeId=${currentUserTypeId}`,
          '_blank',
        );
      }
    } else {
      if(templateType === 'student_admission') {
        window.open(
          `${domainUrl}/session/register?candidate=${candidateId}`,
          '_blank',
        );
      } else if(templateType === 'visa_document') {
        window.open(
          `${domainUrl}/visa-form/${dataForm._id}?formType=required_document&userId=${this.currentUser._id}&userTypeId=${currentUserTypeId}&studentId=${studentId}`,
          '_blank',
        );
      } else {
        window.open(
          `${domainUrl}/form-filling?formId=${dataForm._id}&formType=${templateType}&userId=${this.currentUser._id}&userTypeId=${currentUserTypeId}`,
          '_blank',
        );
      }
    }
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    Object.keys(filterData).forEach((key) => {
      if (!filterData[key] && filterData[key] !== false) {
        delete filterData[key];
      };
    });

    if(!filterData?.form_type?.length) delete filterData['form_type'];
    if(!filterData?.status_form?.length) delete filterData['status_form'];

    return filterData;
  }

  resetFilter() {
    this.filteredValues = {
      template_name: null,
      form_type: [],
      send_date: null,
      last_modified: null,
      status_form: [],
      offset: null
    };

    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sortValue = null;
    this.sort.active = null;
    this.sort.direction = null;
    
    this.templateNameFilter.setValue(null);
    this.typeFilter.setValue(null);
    this.sendDateFilter.setValue(null);
    this.lastModifiedFilter.setValue(null);
    this.statusFilter.setValue(null);
    this.getAllStudentForm();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
