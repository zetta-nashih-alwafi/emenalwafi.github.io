import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { CoreService } from 'app/service/core/core.service';
import { DocumentIntakeBuilderService } from 'app/service/document-intake-builder/document-intake-builder.service';
import { UntypedFormControl } from '@angular/forms';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { DuplicateDocumentTemplateDialogComponent } from './duplicate-document-template-dialog/duplicate-document-template-dialog.component';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { FormBuilderService } from 'app/form-builder/form-builder.service';

@Component({
  selector: 'ms-documents-tab',
  templateUrl: './documents-tab.component.html',
  styleUrls: ['./documents-tab.component.scss'],
})
export class DocumentsTabComponent implements OnInit, OnDestroy, AfterViewInit {
  // Table config
  dataSource = new MatTableDataSource([]);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  titleData: any;
  noData: any;
  dataCount = 0;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  isWaitingForResponse = false;
  sortValue = null;
  displayedColumns: string[] = ['documentName', 'documentType', 'createdDate', 'creator', 'status', 'visible', 'action'];
  filterColumns: string[] = [
    'documentNameFilter',
    'documentTypeFilter',
    'createdDateFilter',
    'creatorFilter',
    'statusFilter',
    'visibleFilter',
    'actionFilter',
  ];

  private subs = new SubSink();

  docNameFilter = new UntypedFormControl('');
  docTypeFilterCtrl = new UntypedFormControl('');
  dateFilter = new UntypedFormControl('');
  creatorFilter = new UntypedFormControl('');
  statusFilterCtrl = new UntypedFormControl('');
  visibleFilter = new UntypedFormControl('');
  docTypeFilterList: Observable<any[]>;
  statusFilterList: Observable<any[]>;

  statusList = [
    { key: true, value: 'Published' },
    { key: false, value: 'Unpublished' },
  ];

  docTypeList = [
    { key: 'bill', value: 'Bill' },
    { key: 'registration_certificate', value: 'Registration Certificate' },
  ];

  orgStatusList = [
    { key: true, value: 'Published' },
    { key: false, value: 'Unpublished' },
  ];

  orgDocTypeList = [
    { key: 'bill', value: 'Bill' },
    { key: 'registration_certificate', value: 'Registration Certificate' },
  ];
  visibleList = [
    { name: 'FORM_BUILDER.Available', id: 'false' },
    { name: 'FORM_BUILDER.Hidden', id: 'true' },
  ];

  dummyData = [
    {
      template_name: 'Documents 2',
      template_type: 'Registration Certificate',
      created_date: '20/10/2021',
      creator_name: 'John Doe',
      status: 'published',
      template_id: '2',
    },
    {
      template_name: 'Documents 1',
      template_type: 'Bill',
      created_date: '19/10/2021',
      creator_name: 'John Doe',
      status: 'not_published',
      template_id: '1',
    },
  ];
  filteredValues = {
    document_type: '',
    scholar_season_id: '',
    document_template_name: '',
    creator: '',
    created_date: '',
    status: '',
    hide_form: null,
  };

  scholarSeasonId;
  scholarSeasons;
  templateUrl: any;
  allDocumentData = [];
  isWaitingForResponsePDF: boolean;
  isPreview = false;
  private timeOutVal: any;

  filterBreadcrumbData: any[] = [];

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private coreService: CoreService,
    private documentBuilderService: DocumentIntakeBuilderService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private userService: AuthService,
    public permission: PermissionService,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService,
    private formBuilderService: FormBuilderService,
  ) {}

  ngOnInit() {
    // this.route.queryParams.subscribe((res) => {
    //   console.log('_res', res);
    //   if (res && res.scholarSeasonId) {
    //     this.scholarSeasonId = res.scholarSeasonId;
    //     this.filteredValues.scholar_season_id = this.scholarSeasonId;
    //   }
    //   if (res && res.title) {
    //     this.scholarSeasons = res.title;
    //   } else {
    //     this.scholarSeasons = '';
    //   }
    // });
    this.coreService.sidenavOpen = !this.coreService.sidenavOpen;
    this.getDocumentsData();
    this.initFilter();
    this.sortFilter();
    this.pageTitleService.setTitle('List of Document Template');
    this.subs.sink = this.translateService.onLangChange.subscribe((event: LangChangeEvent)=>{
      this.sortFilter();
    })
  }

  ngAfterViewInit(): void {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getDocumentsData();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getDocumentsData() {
    this.isWaitingForResponse = true;
    this.isPreview = false;
    this.dataSource.data = [];
    this.paginator.length = 0;
    this.dataCount = 0;

    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    this.subs.sink = this.documentBuilderService.getAllDocuments(pagination, this.sortValue, filter).subscribe(
      (resp: any) => {
        if (resp && resp.length) {
          this.allDocumentData = _.cloneDeep(resp);
          this.dataSource.data = this.allDocumentData;
          this.paginator.length = resp[0].count_document;
          this.dataCount = resp[0].count_document;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      (error) => {
        // Record error log
        this.userService.postErrorLog(error);
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translateService.instant('SORRY'),
          text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translateService.instant('OK'),
        });
      },
    );
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'document_template_name' || key === 'scholar_season_id' || key === 'creator' || key === 'created_date') {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        } else {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        }
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  initFilter() {

    this.subs.sink = this.docNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      this.filteredValues.document_template_name = name ? name : '';
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDocumentsData();
      }
    });

    this.subs.sink = this.creatorFilter.valueChanges.pipe(debounceTime(400)).subscribe((searchTxt) => {
      this.filteredValues.creator = searchTxt ? searchTxt : '';
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDocumentsData();
      }
    });

    this.subs.sink = this.dateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.created_date = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDocumentsData();
        }
      }
    });
    this.subs.sink = this.statusFilterCtrl.valueChanges.pipe(debounceTime(400)).subscribe((legal) => {
      this.filteredValues.status = legal;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDocumentsData();
      }
    });
    this.subs.sink = this.docTypeFilterCtrl.valueChanges.pipe(debounceTime(400)).subscribe((legal) => {
      this.filteredValues.document_type = legal;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDocumentsData();
      }
    });
    this.subs.sink = this.visibleFilter.valueChanges.pipe().subscribe((text) => {
      this.filteredValues.hide_form = text === 'true' ? true : text === 'false' ? false : null;
      this.paginator.pageIndex = 0;
      this.getDocumentsData();
    });
    
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDocumentsData();
      }
    }
  }

  resetTable() {
    this.isReset = true;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.filteredValues = {
      document_type: '',
      scholar_season_id: this.scholarSeasonId,
      document_template_name: '',
      creator: '',
      created_date: '',
      status: null,
      hide_form: null,
    };
    this.paginator.pageIndex = 0;
    this.docNameFilter.patchValue('', { emitEvent: false });
    this.docTypeFilterCtrl.patchValue('', { emitEvent: false });
    this.creatorFilter.patchValue('', { emitEvent: false });
    this.dateFilter.patchValue('', { emitEvent: false });
    this.statusFilterCtrl.patchValue(null, { emitEvent: false });
    this.visibleFilter.patchValue(null, { emitEvent: false });
    this.sortValue = null;
    this.sort.direction = '';
    this.sort.active = '';
    this.filterBreadcrumbData = [];
    this.getDocumentsData();
  }

  selectDocType(data) {
    this.paginator.pageIndex = 0;
    if (data === 'AllS') {
      this.filteredValues.document_type = '';
      this.getDocumentsData();
    } else {
      this.filteredValues.document_type = data;
      this.getDocumentsData();
    }
  }

  selectStatus(data) {
    this.paginator.pageIndex = 0;
    if (data === 'AllS') {
      this.filteredValues.status = '';
      this.getDocumentsData();
    } else {
      this.filteredValues.status = data;
      this.getDocumentsData();
    }
  }

  goToDocumentBuilder(data) {
    // const scholarSeasonData = {
    //   _id: this.scholarSeasonId,
    //   title: this.scholarSeasons,
    // };
    // this.documentBuilderService.setScholarSeasonId(scholarSeasonData);
    if (data !== 'new') {
      this.router.navigate(['document-builder/document-template'], {
        queryParams: { templateId: data._id },
      });
    } else {
      this.router.navigate(['document-builder/document-template']);
    }
  }

  duplicateTemplate(template) {
    console.log(template);
    this.subs.sink = this.dialog
      .open(DuplicateDocumentTemplateDialogComponent, {
        width: '400px',
        minHeight: '100px',
        disableClose: true,
        data: {
          templateId: template._id,
          documents: this.allDocumentData,
        },
      })
      .afterClosed()
      .subscribe((response) => {
        if (response) {
          this.getDocumentsData();
        }
      });
  }

  deleteDocumentBuilder(data) {
    if (data._id) {
      const docName = data.document_builder_name;
      let timeDisabled = 3;
      Swal.fire({
        type: 'warning',
        title: this.translateService.instant('DocumentBuilder_S1.Title', { templateName: docName }),
        text: this.translateService.instant('DocumentBuilder_S1.Text', { templateName: docName }),
        confirmButtonText: this.translateService.instant('DocumentBuilder_S1.Button 1', { timer: timeDisabled }),
        cancelButtonText: this.translateService.instant('DocumentBuilder_S1.Button 2'),
        showCancelButton: true,
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          const intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translateService.instant('DocumentBuilder_S1.Button 1') + ` (${timeDisabled})`;
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translateService.instant('DocumentBuilder_S1.Button 1');
            Swal.enableConfirmButton();
            clearInterval(intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      }).then((result) => {
        if (result.value) {
          this.isWaitingForResponse = true;
          this.subs.sink = this.documentBuilderService.DeleteTemplate(data._id).subscribe(
            (resp) => {
              if (resp) {
                Swal.fire({
                  type: 'success',
                  title: 'Bravo!',
                  confirmButtonText: 'OK',
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.isWaitingForResponse = false;
                  this.getDocumentsData();
                });
              }
            },
            (err) => {
              // Record error log
              this.userService.postErrorLog(err);
              this.isWaitingForResponse = false;
              if (
                err &&
                err['message'] &&
                (err['message'].includes('jwt expired') ||
                  err['message'].includes('str & salt required') ||
                  err['message'].includes('Authorization header is missing') ||
                  err['message'].includes('salt'))
              ) {
                this.userService.handlerSessionExpired();
                return;
              }
              this.showSwalError(err);
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

  showSwalError(err) {
    Swal.fire({
      type: 'info',
      title: this.translateService.instant('SORRY'),
      text: err && err['message'] ? this.translateService.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
      confirmButtonText: this.translateService.instant('DISCONNECT_SCHOOL.BUTTON3'),
    });
  }

  translateDate(date) {
    return moment(date).format('DD/MM/YYYY');
  }

  openDetail(data) {
    this.isPreview = true;
    if (data && data.preview_pdf_url) {
      this.isWaitingForResponsePDF = true;
      this.templateUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `${environment.apiUrl}/fileuploads/${data.preview_pdf_url}`.replace('/graphql', ''),
      );
      if (this.templateUrl) {
        this.isWaitingForResponsePDF = false;
      }
    } else {
      this.templateUrl = '';
    }
    // this.templateUrl = data.
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'document_template_name', // name of the key in the object storing the filter
        column: 'Document Template Name', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.docNameFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true
      },
      {
        type: 'table_filter',
        name: 'document_type',
        column: 'Document Type',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.orgDocTypeList,
        filterRef: this.docTypeFilterCtrl,
        isSelectionInput: true,
        displayKey: 'key',
        savedValue: 'key',
      },
      {
        type: 'table_filter',
        name: 'created_date',
        column: 'Created Date',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.dateFilter,
        isSelectionInput: false,
        displayKey: null,
        savedValue: null,
      },
      {
        type: 'table_filter',
        name: 'creator',
        column: 'Creator',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.creatorFilter,
        isSelectionInput: false,
        displayKey: null,
        savedValue: null,
        noTranslate: true
      },
      {
        type: 'table_filter',
        name: 'status',
        column: 'Status',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.orgStatusList,
        filterRef: this.statusFilterCtrl,
        isSelectionInput: true,
        displayKey: 'value',
        savedValue: 'key',
      },
    ];

    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
    this.getDocumentsData();
  }

  hideForm(selectedForm) {
    const { hide_form, _id } = selectedForm;
    const hidePayload = {
      hide_form: hide_form === null || hide_form === '' ? false : !hide_form,
    };

    if (!hide_form) {
      Swal.fire({
        title: this.translateService.instant('Hide_S1.Title'),
        html: this.translateService.instant('Hide_S1.Body'),
        type: 'warning',
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translateService.instant('Hide_S1.Button1'),
        cancelButtonText: this.translateService.instant('Hide_S1.Button2'),
        allowOutsideClick: false,
        allowEnterKey: false,
      }).then((res) => {
        if (res.value) {
          this.isWaitingForResponse = true;
          this.subs.sink = this.documentBuilderService.hideDocumentBuilder(_id, hidePayload).subscribe(
            (res) => {
              this.isWaitingForResponse = false;
              if (res) {
                Swal.fire({
                  type: 'success',
                  title: 'Bravo!',
                  confirmButtonText: 'OK',
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  // ************* collect again data
                  this.getDocumentsData();
                });
              }
            },
            (err) => {
              this.userService.postErrorLog(err);
              this.isWaitingForResponse = false;
              Swal.fire({
                type: 'info',
                title: this.translateService.instant('SORRY'),
                text: err && err['message'] ? this.translateService.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translateService.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            },
          );
        }
      });
    } else {
      Swal.fire({
        title: this.translateService.instant('Hide_S2.Title'),
        html: this.translateService.instant('Hide_S2.Body'),
        type: 'warning',
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translateService.instant('Hide_S2.Button1'),
        cancelButtonText: this.translateService.instant('Hide_S2.Button2'),
        allowOutsideClick: false,
        allowEnterKey: false,
      }).then((res) => {
        if (res?.value) {
          this.isWaitingForResponse = true;
          this.subs.sink = this.documentBuilderService.hideDocumentBuilder(_id, hidePayload).subscribe(
            (ress) => {
              this.isWaitingForResponse = false;
              if (ress) {
                Swal.fire({
                  type: 'success',
                  title: 'Bravo!',
                  confirmButtonText: 'OK',
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  // ************* collect again data
                  this.getDocumentsData();
                });
              }
            },
            (err) => {
              this.userService.postErrorLog(err);
              this.isWaitingForResponse = false;
              Swal.fire({
                type: 'info',
                title: this.translateService.instant('SORRY'),
                text: err && err['message'] ? this.translateService.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translateService.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            },
          );
        }
      });
    }
  }

  sortFilter(){
    this.visibleList = this.visibleList.sort((a, b) =>
    this.translateService.instant(a.name) > this.translateService.instant(b.name)
      ? 1
      : this.translateService.instant(b.name) > this.translateService.instant(a.name)
      ? -1
      : 0,
  );
  }
}
