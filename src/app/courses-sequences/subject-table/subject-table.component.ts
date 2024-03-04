import { AuthService } from 'app/service/auth-service/auth.service';
import { AddSubjectDialogComponent } from './add-subject-dialog/add-subject-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from './../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { SelectionModel } from '@angular/cdk/collections';
import { startWith, tap, debounceTime } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { UntypedFormControl } from '@angular/forms';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { MatPaginator } from '@angular/material/paginator';
import { Sort, MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PermissionService } from 'app/service/permission/permission.service';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import * as moment from 'moment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ImportContractProcessDialogComponent } from 'app/shared/components/import-contract-process-dialog/import-contract-process-dialog.component';
import { UserProfileData } from 'app/users/user.model';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-subject-table',
  templateUrl: './subject-table.component.html',
  styleUrls: ['./subject-table.component.scss'],
})
export class SubjectTableComponent implements OnInit, OnDestroy, AfterViewInit {
  isWaitingForResponse = false;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  sortValue = null;
  dataLoaded: Boolean = false;
  dataSource = new MatTableDataSource([]);
  displayedColumns = ['select', 'name', 'shortName', 'englishName', 'action'];
  filterColumns = ['selectFilter', 'nameFilter', 'shortNameFilter', 'englishNameFilter', 'actionFilter'];
  nameFilter = new UntypedFormControl('');
  shortNameFilter = new UntypedFormControl('');
  englishNameFilter = new UntypedFormControl('');
  filteredValues = {
    name: null,
    short_name: null,
    english_name: null,
  };

  dataCount = 0;
  isReset = false;

  dataSelected = [];
  pageSelected = [];
  timeOutVal: any;
  allSubjectsForCheckbox = [];
  isCheckedAll = false;
  selectedType;
  dataSelectedId = [];
  buttonClicked: string;

  subs = new SubSink();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  selection = new SelectionModel<any>(true, []);
  dataUnselectSubject: any;
  currentUser: any;
  currentUserTypeId: any;
  filterBreadcrumbData: any[] = [];

  constructor(
    public permissionService: PermissionService,
    private courseSequenceService: CourseSequenceService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private httpClient: HttpClient,
    private authService: AuthService,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit() {
    this.getAllSubject();
    this.initFilter();
    this.initCurrentUser();
    this.pageTitleService.setTitle('course_sequence.Subjects');
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getAllSubject();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  initCurrentUser() {
    this.currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser.entities.find((resp) => resp.type.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity.type._id;
  }

  getAllSubject() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.subs.sink = this.courseSequenceService.getAllCourseSubject(pagination, this.filteredValues, this.sortValue).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.dataSource.data = cloneDeep(resp);
          this.dataCount = resp[0] && resp[0].count_document ? resp[0].count_document : 0;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.isReset = false;
        this.isWaitingForResponse = false;
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
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
        }
      },
    );
  }

  initFilter() {
    this.subs.sink = this.nameFilter.valueChanges.pipe(debounceTime(400)).subscribe((filter) => {
      this.filteredValues.name = filter ? filter : null;
      this.paginator.pageIndex = 0;
      // this.clearSelectIfFilter();
      if (!this.isReset) {
        this.getAllSubject();
      }
    });
    this.subs.sink = this.shortNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((filter) => {
      this.filteredValues.short_name = filter ? filter : null;
      this.paginator.pageIndex = 0;
      // this.clearSelectIfFilter();
      if (!this.isReset) {
        this.getAllSubject();
      }
    });
    this.subs.sink = this.englishNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((filter) => {
      this.filteredValues.english_name = filter ? filter : null;
      this.paginator.pageIndex = 0;
      // this.clearSelectIfFilter();
      if (!this.isReset) {
        this.getAllSubject();
      }
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return this.isCheckedAll ? true : (numSelected === numRows || numSelected > numRows);
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
      this.dataUnselectSubject = [];
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.allSubjectsForCheckbox = [];
      this.isCheckedAll = true;
      this.dataUnselectSubject = [];
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselectSubject.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
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
        if (!this.dataUnselectSubject.includes(row._id)) {
          this.dataUnselectSubject.push(row._id);
          this.selection.deselect(row._id);
        } else {
          const indx = this.dataUnselectSubject.findIndex((list) => list === row._id);
          this.dataUnselectSubject.splice(indx, 1);
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
    this.selectedType = info;
    this.dataSelectedId = [];
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.dataSelectedId.push(user._id);
    });
  }
  clearSelectIfFilter() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
    this.pageSelected = [];
    this.allSubjectsForCheckbox = [];
    this.dataSelectedId = [];
  }
  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAllSubject();
      }
    }
  }
  resetFilter() {
    this.isReset = true;
    this.filteredValues = {
      name: null,
      short_name: null,
      english_name: null,
    };
    this.filterBreadcrumbData = [];
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.nameFilter.setValue('', { emitEvent: false });
    this.shortNameFilter.setValue('', { emitEvent: false });
    this.englishNameFilter.setValue('', { emitEvent: false });
    this.paginator.pageIndex = 0;
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
    this.dataUnselectSubject = [];
    this.pageSelected = [];
    this.allSubjectsForCheckbox = [];
    this.dataSelectedId = [];

    this.getAllSubject();
  }

  deleteSubject(id) {
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('SUBJECT_RS1.TITLE'),
      html: this.translate.instant('SUBJECT_RS1.TEXT'),
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('SUBJECT_RS1.BUTTON_1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('SUBJECT_RS1.BUTTON_2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      width: '33em',
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('SUBJECT_RS1.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('SUBJECT_RS1.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.isWaitingForResponse = true;
        this.subs.sink = this.courseSequenceService.deleteCourseSubject(id).subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            if (resp) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('SUBJECT_RS2.TITLE'),
                html: this.translate.instant('SUBJECT_RS2.TEXT'),
                confirmButtonText: this.translate.instant('SUBJECT_RS2.BUTTON_1'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then((confirms) => {
                this.getAllSubject();
              });
            }
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
            this.isWaitingForResponse = false;
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
            }
          },
        );
      }
    });
  }

  addSubject() {
    this.subs.sink = this.dialog
      .open(AddSubjectDialogComponent, {
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
          this.getAllSubject();
        }
      });
  }

  editSubject(data) {
    this.subs.sink = this.dialog
      .open(AddSubjectDialogComponent, {
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
          this.getAllSubject();
        }
      });
  }

  downloadSubject() {
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
    let importStudentTemlate = 'downloadCourseSubjectTableTemplateCSV';
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
          type: 'subject',
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.clearSelectIfFilter();
          this.getAllSubject();
        }
      });
  }

  controllerButton(action) {
    switch (action) {
      case 'export':
        setTimeout(() => {
          this.getAllIdForCheckbox(0);
        }, 500);
        break;
    }
  }

  getAllIdForCheckbox(pageNumber) {
    if (this.isCheckedAll) {
      if (this.dataUnselectSubject.length < 1) {
        this.csvDownloadAdmission();
      } else {
        if (pageNumber === 0) {
          this.allSubjectsForCheckbox = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isWaitingForResponse = true;
        this.subs.sink = this.courseSequenceService.getAllCourseSubjectIds(pagination, this.filteredValues, this.sortValue).subscribe(
          (subject: any) => {
            if (subject && subject.length) {
              this.allSubjectsForCheckbox.push(...subject);
              const page = pageNumber + 1;
              this.getAllIdForCheckbox(page);
            } else {
              this.isWaitingForResponse = false;
              if (this.isCheckedAll && this.allSubjectsForCheckbox && this.allSubjectsForCheckbox.length) {
                this.dataSelected = this.allSubjectsForCheckbox.filter((list) => !this.dataUnselectSubject.includes(list._id));
                this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                if (this.dataSelected && this.dataSelected.length) {
                  this.csvDownloadAdmission();
                }
              }
            }
          },
          (error) => {
            this.isReset = false;
            this.isWaitingForResponse = false;
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
      this.csvDownloadAdmission();
    }
  }

  csvDownloadAdmission() {
    if (this.selection.selected.length < 1 && !this.isCheckedAll) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Candidate') }),
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

  downloadCSV(fileType) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const lang = this.translate.currentLang.toLowerCase();
    const name = this.filteredValues.name !== null ? this.filteredValues.name : '';
    const short_name = this.filteredValues.short_name !== null ? this.filteredValues.short_name : '';
    const english_name = this.filteredValues.english_name !== null ? this.filteredValues.english_name : '';
    let filter;
    if (
      (this.dataSelectedId && this.dataSelectedId.length && !this.isCheckedAll) ||
      (this.allSubjectsForCheckbox && this.allSubjectsForCheckbox.length && this.selectedType === 'one')
    ) {
      let subjectId = this.dataSelectedId.map((res) => `"` + res + `"`);
      subjectId = _.cloneDeep(subjectId);
      filter =
        `filter={"subject_id":` +
        `[` +
        subjectId.toString() +
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
    console.log('filtere', filter);
    window.open(encodeURI(`${url}downloadCourseSubjectCSV/${fileType}/${lang}?${filter}`), '_blank');
  }

  openDownloadCsv(fileType) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const name = this.filteredValues.name !== null ? this.filteredValues.name : '';
    const short_name = this.filteredValues.short_name !== null ? this.filteredValues.short_name : '';
    const english_name = this.filteredValues.english_name !== null ? this.filteredValues.english_name : '';
    let filter;
    if (
      (this.dataSelected && this.dataSelected.length && !this.isCheckedAll) ||
      (this.dataSelected && this.dataSelected.length && this.dataUnselectSubject && this.dataUnselectSubject.length)
    ) {
      let subjectId = this.dataSelected.map((res) => `"` + res._id + `"`);
      subjectId = _.cloneDeep(subjectId);
      filter =
        `filter={"subject_id":` +
        `[` +
        subjectId.toString() +
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

    const importStudentTemlate = `downloadCourseSubjectCSV/`;
    const sorting = this.sortingForExport();
    let fullURL;
    fullURL = url + importStudentTemlate + fileType + '/' + lang + '?' + filter + '&' + sorting + '&' + `user_type_id="${this.currentUserTypeId}"`;

    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
      }),
    };

    this.isWaitingForResponse = true;
    this.httpClient.get(`${encodeURI(fullURL)}`, httpOptions).subscribe(
      (res) => {
        if (res) {
          this.isWaitingForResponse = false;
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
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        console.log('error export', err);
      },
    );
    console.log('fullURL', fullURL);
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

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if(filterItem) {
      this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null , this.filteredValues);
      this.clearSelectIfFilter();
      this.getAllSubject();   
    }
  }

  filterBreadcrumbFormat(){
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
        noTranslate: true
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
        noTranslate: true
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
        noTranslate: true
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }


  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
}
