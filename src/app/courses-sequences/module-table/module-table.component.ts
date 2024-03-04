import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { environment } from 'environments/environment';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AddModuleDialogComponent } from './add-module-dialog/add-module-dialog.component';
import { ImportContractProcessDialogComponent } from 'app/shared/components/import-contract-process-dialog/import-contract-process-dialog.component';
import { PermissionService } from 'app/service/permission/permission.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-module-table',
  templateUrl: './module-table.component.html',
  styleUrls: ['./module-table.component.scss'],
})
export class ModuleTableComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();

  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  noData: any;
  displayedColumns: string[] = ['select', 'name', 'short_name', 'english_name', 'action'];
  filterColumns: string[] = ['select_filter', 'name_filter', 'short_name_filter', 'english_name_filter', 'action_filter'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  sortValue = null;
  dataCount = 0;

  dataLoaded: Boolean = false;
  isWaitingForResponse = false;
  isLoading: Boolean = false;
  isReset: Boolean = false;

  isCheckedAll = false;
  disabledExport = true;
  selectType: any;
  dataSelected = [];
  dataSelectedId = [];
  allStudentForCheckbox = [];
  pageSelected = [];

  private timeOutVal: any;

  filteredValues = {
    short_name: null,
    name: null,
    english_name: null,
  };

  dataUnselectUser = [];
  allExportForCheckbox = [];
  nameFilter = new UntypedFormControl(null);
  shortNameFilter = new UntypedFormControl(null);
  englishNameFilter = new UntypedFormControl(null);
  filterBreadcrumbData: any[] = [];
  currentUserTypeId: any;

  constructor(
    private translate: TranslateService,
    private courseSequenceService: CourseSequenceService,
    private dialog: MatDialog,
    public permission: PermissionService,
    private authService: AuthService,
    private httpClient: HttpClient,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    if (!this.isReset) {
      this.getModulesData('init');
    }
    this.initFilter();
    this.pageTitleService.setTitle('course_sequence.Modules');
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getModulesData('afterview');
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getModulesData(type?) {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.subs.sink = this.courseSequenceService.getAllModule(pagination, this.filteredValues, this.sortValue).subscribe(
      (resp: any) => {
        if (resp && resp.length) {
          this.dataSource.data = resp;
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
        if (error) {
          // Record error log
          this.authService.postErrorLog(error);
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
          this.isWaitingForResponse = false;
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
        }
      },
    );
  }

  initFilter() {
    this.subs.sink = this.nameFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        this.filteredValues.name = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        // this.resetCheckbox();
        if (!this.isReset) {
          this.getModulesData('fullname1');
        }
      } else {
        // this.resetCheckbox();
        this.filteredValues.name = null;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getModulesData('fullname2');
        }
      }
    });

    this.subs.sink = this.shortNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        this.filteredValues.short_name = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        // this.resetCheckbox();
        if (!this.isReset) {
          this.getModulesData('shortname1');
        }
      } else {
        this.filteredValues.short_name = null;
        this.paginator.pageIndex = 0;
        // this.resetCheckbox();
        if (!this.isReset) {
          this.getModulesData('shortname2');
        }
      }
    });

    this.subs.sink = this.englishNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        this.filteredValues.english_name = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        // this.resetCheckbox();
        if (!this.isReset) {
          this.getModulesData('englishname1');
        }
      } else {
        this.filteredValues.english_name = null;
        this.paginator.pageIndex = 0;
        // this.resetCheckbox();
        if (!this.isReset) {
          this.getModulesData('englishname2');
        }
      }
    });
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getModulesData('sort');
      }
    }
  }

  // start checkbox
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return this.isCheckedAll ? true : (numSelected === numRows);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
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
    }
  }

  getAllIdForCheckbox(pageNumber) {
    if (this.isCheckedAll) {
      if (this.dataUnselectUser.length < 1) {
        this.csvDownload();
      } else {
        if (pageNumber === 0) {
          this.allExportForCheckbox = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isWaitingForResponse = true;
        this.subs.sink = this.courseSequenceService.getAllModulesIdForCheckbox(pagination, this.filteredValues, this.sortValue).subscribe(
          (modules: any) => {
            if (modules && modules.length) {
              this.allExportForCheckbox.push(...modules);
              const page = pageNumber + 1;
              this.getAllIdForCheckbox(page);
            } else {
              this.isWaitingForResponse = false;
              if (this.isCheckedAll) {
                if (this.allExportForCheckbox && this.allExportForCheckbox.length) {
                  this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length) {
                    this.csvDownload();
                  }
                }
              }
            }
          },
          (error) => {
            this.isReset = false;
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
    } else {
      this.csvDownload();
    }
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
    if (numSelected > 0) {
      this.disabledExport = false;
    } else {
      this.disabledExport = true;
    }
    this.dataSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.dataSelectedId.push(user._id);
    });
  }
  // end checkbox

  // start export
  csvDownload() {
    if (
      this.dataSelected &&
      this.dataSelected.length < 1 &&
      (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length))
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('course_sequence.Module') }),
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
            if ((<HTMLInputElement>e.target).value) {
              Swal.enableConfirmButton();
            }
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
    const name = this.filteredValues.name !== null ? this.filteredValues.name : '';
    const short_name = this.filteredValues.short_name !== null ? this.filteredValues.short_name : '';
    const english_name = this.filteredValues.english_name !== null ? this.filteredValues.english_name : '';
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const importStudentTemlate = `downloadModuleCSV/`;
    // console.log('_ini filter', filter, this.userSelectedId);
    let filter;
    if (
      (this.dataSelected && this.dataSelected.length && !this.isCheckedAll) ||
      (this.dataUnselectUser && this.dataUnselectUser.length && this.isCheckedAll)
    ) {
      let mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      mappedUserId = _.cloneDeep(mappedUserId);
      console.log(mappedUserId.length, 'panjang id selected');
      filter =
        `filter={"modules_id":` +
        `[` +
        mappedUserId.toString() +
        `],"name":"` +
        name +
        `","short_name":"` +
        short_name +
        `","english_name":"` +
        english_name +
        `"}`;
    } else {
      filter = `filter={"name":"` + name + `","short_name":"` + short_name + `","english_name":"` + english_name + `"}`;
    }
    const sorting = this.sortingForExport();
    const fullURL =
      url + importStudentTemlate + fileType + '/' + lang + '?' + filter + '&' + sorting + '&' + `user_type_id="${this.currentUserTypeId}"`;
    console.log(fullURL, 'fullURL::::::::::');
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
      }),
    };

    this.isWaitingForResponse = true;
    this.httpClient.get(`${encodeURI(fullURL)}`, httpOptions).subscribe(
      (res) => {
        if (res) {
          console.log(res, 'res');
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('ReAdmission_S3.TITLE'),
            text: this.translate.instant('ReAdmission_S3.TEXT'),
            confirmButtonText: this.translate.instant('ReAdmission_S3.BUTTON'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => this.resetCheckbox);
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        console.log('uat 389 error', err);
      },
    );
    // element.href = encodeURI(url + importStudentTemlate + fileType + '/' + lang + '?' + filter);
    // console.log(element.href);
    // element.target = '_blank';
    // element.download = 'Template Import CSV';
    // document.body.appendChild(element);
    // element.click();
    // document.body.removeChild(element);
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
  cleanFilterDataDownload() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'short_name' || key === 'name' || key === 'english_name') {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        } else {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${filterData[key]}` : filterQuery + `"${key}":${filterData[key]}`;
        }
      }
    });
    return 'filter={' + filterQuery + '}';
  }
  // end export

  resetCheckbox() {
    this.selection.clear();
    this.dataSelected = [];
    this.pageSelected = [];
    this.isCheckedAll = false;
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
  }

  resetTable() {
    this.isReset = true;
    this.isCheckedAll = false;
    this.selection.clear();
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.selectType = '';
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.filterBreadcrumbData = [];
    this.filteredValues = {
      short_name: null,
      name: null,
      english_name: null,
    };
    this.nameFilter.setValue(null, { emitEvent: false });
    this.shortNameFilter.setValue(null, { emitEvent: false });
    this.englishNameFilter.setValue(null, { emitEvent: false });
    this.getModulesData('reset');
  }

  deleteModule(id) {
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('MODULE_RS1.TITLE'),
      html: this.translate.instant('MODULE_RS1.TEXT'),
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('MODULE_RS1.BUTTON_1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('MODULE_RS1.BUTTON_2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      width: '33em',
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('MODULE_RS1.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('MODULE_RS1.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.isWaitingForResponse = true;
        this.subs.sink = this.courseSequenceService.DeleteModule(id).subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            if (resp) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('MODULE_RS2.TITLE'),
                html: this.translate.instant('MODULE_RS2.TEXT'),
                confirmButtonText: this.translate.instant('MODULE_RS2.BUTTON_1'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.getModulesData('deleteModule');
              });
            }
          },
          (error) => {
            // Record error log
            this.authService.postErrorLog(error);
            this.isWaitingForResponse = false;
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
            }
          },
        );
      }
    });
  }

  addModule() {
    this.subs.sink = this.dialog
      .open(AddModuleDialogComponent, {
        width: '800px',
        disableClose: true,
        panelClass: 'certification-rule-pop-up',
        data: {
          type: 'add',
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getModulesData('addSubject');
        }
      });
  }

  editModule(data) {
    this.subs.sink = this.dialog
      .open(AddModuleDialogComponent, {
        width: '800px',
        disableClose: true,
        panelClass: 'certification-rule-pop-up',
        data: {
          type: 'edit',
          ...data,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getModulesData('editSubject');
        }
      });
  }

  downloadModule() {
    const inputOptions = {
      ',': this.translate.instant('IMPORT_TEMPLATE_S1.COMMA'),
      ';': this.translate.instant('IMPORT_TEMPLATE_S1.SEMICOLON'),
      tab: this.translate.instant('IMPORT_TEMPLATE_S1.TAB'),
    };

    Swal.fire({
      type: 'question',
      title: this.translate.instant('IMPORT_TEMPLATE_S1.TITLE'),
      width: 465,
      allowEscapeKey: true,
      showCancelButton: true,
      cancelButtonText: this.translate.instant('IMPORT_TEMPLATE_S1.CANCEL'),
      confirmButtonText: this.translate.instant('IMPORT_TEMPLATE_S1.OK'),
      input: 'radio',
      inputValue: ';',
      inputOptions: inputOptions,
    }).then((separator) => {
      if (separator && separator.value) {
        this.downloadCSVTemplate(separator.value);
      }
    });
  }

  downloadCSVTemplate(fileType) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const path = '';
    const lang = this.translate.currentLang.toLowerCase();
    let importStudentTemlate = 'downloadImportModuleTemplate';
    importStudentTemlate = importStudentTemlate + '/' + fileType + '/' + lang;
    element.href = url + importStudentTemlate + path;

    element.target = '_blank';
    element.download = 'Template Import CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  csvTypeSelectionUpload() {
    const inputOptions = {
      ',': this.translate.instant('IMPORT_DECISION_S1.COMMA'),
      ';': this.translate.instant('IMPORT_DECISION_S1.SEMICOLON'),
      tab: this.translate.instant('IMPORT_DECISION_S1.TAB'),
    };

    Swal.fire({
      type: 'question',
      title: this.translate.instant('IMPORT_DECISION_S1.TITLE'),
      width: 465,
      allowEscapeKey: true,
      showCancelButton: true,
      cancelButtonText: this.translate.instant('IMPORT_DECISION_S1.CANCEL'),
      confirmButtonText: this.translate.instant('IMPORT_DECISION_S1.OK'),
      input: 'radio',
      inputOptions: inputOptions,
      inputValue: ';',
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
        this.openImportDialog(fileType);
      }
    });
  }

  openImportDialog(fileType) {
    let delimeter = null;
    switch (fileType) {
      case ',':
        delimeter = ',';
        break;
      case ';':
        delimeter = ';';
        break;
      case 'tab':
        delimeter = 'tab';
        break;
      default:
        delimeter = null;
        break;
    }
    // const schoolId;
    // const titleId = this.setupScheduleInfo && this.setupScheduleInfo.rncp_id ? this.setupScheduleInfo.rncp_id._id : null;
    // const classId = this.setupScheduleInfo && this.setupScheduleInfo.class_id ? this.setupScheduleInfo.class_id._id : null;
    this.dialog
      .open(ImportContractProcessDialogComponent, {
        width: '500px',
        panelClass: 'certification-rule-pop-up',
        minHeight: '200px',
        disableClose: true,
        data: {
          delimeter: delimeter,
          type: 'module',
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getModulesData('import');
        }
      });
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
      this.clearSelectIfFilter();
      this.getModulesData();
    }
  }

  clearSelectIfFilter() {
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter',
        name: 'name',
        column: 'course_sequence.Name',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.nameFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'short_name',
        column: 'course_sequence.Short name',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.shortNameFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'english_name',
        column: 'course_sequence.English name',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.englishNameFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
}
