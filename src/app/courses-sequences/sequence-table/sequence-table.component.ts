import { PermissionService } from 'app/service/permission/permission.service';
import { debounceTime, startWith, tap } from 'rxjs/operators';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { cloneDeep } from 'lodash';
import * as _ from 'lodash';
import { SubSink } from 'subsink';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import * as moment from 'moment';
import { SelectionModel } from '@angular/cdk/collections';
import { environment } from 'environments/environment';
import Swal from 'sweetalert2';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AddSequenceDialogComponent } from './add-sequence-dialog/add-sequence-dialog.component';
import { UtilityService } from 'app/service/utility/utility.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';
@Component({
  selector: 'ms-sequence-table',
  templateUrl: './sequence-table.component.html',
  styleUrls: ['./sequence-table.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class SequenceTableComponent implements OnInit, OnDestroy, AfterViewInit {
  isWaitingForResponse = false;
  dataSource = new MatTableDataSource([]);
  displayedColumns = ['select', 'name', 'typeSequence', 'description', 'startDate', 'endDate', 'action'];
  filterColumns = [
    'selectFilter',
    'nameFilter',
    'typeSequenceFilter',
    'descriptionFilter',
    'startDateFilter',
    'endDateFilter',
    'actionFilter',
  ];
  dataLoaded: Boolean = false;
  sortValue = null;
  nameFilter = new UntypedFormControl('');
  typeSequenceFilter = new UntypedFormControl(null);
  descriptionFilter = new UntypedFormControl('');
  startDateFilter = new UntypedFormControl('');
  endDateFilter = new UntypedFormControl('');
  numberOfWeeksFilter = new UntypedFormControl('');
  filteredValues: any = {
    name: null,
    type_of_sequences: null,
    description: null,
    start_date: null,
    end_date: null,
    number_of_week: null
  };
  filteredValuesAll = {
    type_of_sequences: 'All',
  };
  selectedType;
  isCheckedAll = false;
  isReset = false;
  dataCount = 0;
  timeOutVal: any;
  subs = new SubSink();
  sequenceTypes = [];
  dataUnselect = [];
  sequenceTypesOri: string[];
  selection = new SelectionModel<any>(true, []);
  isAllChecked = false;
  dialogRef: MatDialogRef<AddSequenceDialogComponent>;
  dialogConfig: MatDialogConfig = {
    width: '1000px',
    minHeight: '100px',
    disableClose: true,
  };
  dataSelected = [];
  allStudentForCheckbox = [];
  sequenceTypesOriGlobal = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  allExportForCheckbox: any[] = [];
  tempDataFilter = {
    sequnce: null,
  };
  currentUserTypeId: any;
  filterBreadcrumbData: any[] = [];

  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    private courseSequenceService: CourseSequenceService,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    public permissionService: PermissionService,
    private utilService: UtilityService,
    private authService: AuthService,
    private httpClient: HttpClient,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService,
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    this.sequenceTypesOri = this.courseSequenceService.getTypesOfSequence();
    this.sequenceTypes = [];
    let sequenceTypesObj = [];
    this.sequenceTypesOri.forEach((item) => {
      const type = this.getTranslateSequenceType(item);
      sequenceTypesObj.push({ original: item, name: item, code: type });
    });
    sequenceTypesObj = sequenceTypesObj.sort((groupA, groupB) => {
      if (this.utilService.simplifyRegex(groupA.code) < this.utilService.simplifyRegex(groupB.code)) {
        return -1;
      } else if (this.utilService.simplifyRegex(groupA.code) > this.utilService.simplifyRegex(groupB.code)) {
        return 1;
      } else {
        return 0;
      }
    });
    this.sequenceTypesOriGlobal = sequenceTypesObj;
    this.mappingSequenceTypes(this.sequenceTypesOriGlobal);

    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.sequenceTypes = [];
      let sequenceTypesObjs = [];
      this.sequenceTypesOri.forEach((item) => {
        const type = this.getTranslateSequenceType(item);
        sequenceTypesObjs.push({ original: item, name: item, code: type });
      });
      sequenceTypesObjs = sequenceTypesObjs.sort((groupA, groupB) => {
        if (this.utilService.simplifyRegex(groupA.code) < this.utilService.simplifyRegex(groupB.code)) {
          return -1;
        } else if (this.utilService.simplifyRegex(groupA.code) > this.utilService.simplifyRegex(groupB.code)) {
          return 1;
        } else {
          return 0;
        }
      });
      this.sequenceTypes = sequenceTypesObjs.map((list) => list.name);
    });

    this.getAllSequence();
    this.initFilter();
    this.pageTitleService.setTitle('course_sequence.Sequences');
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.mappingSequenceTypes(this.sequenceTypesOriGlobal);
      this.filterBreadcrumbFormat();
    });
  }

  mappingSequenceTypes(sequenceTypesObj) {
    this.sequenceTypes = sequenceTypesObj.map((list) => {
      return {
        value: list.name,
        label: this.translate.instant('course_sequence.' + list.name),
      };
    });
  }

  getTranslateSequenceType(name) {
    if (name) {
      const value = this.translate.instant('course_sequence.' + name);
      return value;
    }
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getAllSequence();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getAllSequence() {
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.courseSequenceService
      .getAllSequence(pagination, this.filteredValues, this.sortValue, this.translate.currentLang)
      .subscribe(
        (resp) => {
          if (resp && resp.length) {
            const data = cloneDeep(resp);
            data.forEach((temp) => {
              if (temp.start_date && temp.start_date.date) {
                const time = temp.start_date.time ? temp.start_date.time : '15:59';
                const date = this.transformDateToLocal(temp.start_date.date, time);
                if (date && date !== 'Invalid date') {
                  temp.startDate = date;
                }
              }
              if (temp.end_date && temp.end_date.date) {
                const time = temp.end_date.time ? temp.end_date.time : '15:59';
                const date = this.transformDateToLocal(temp.end_date.date, time);
                if (date && date !== 'Invalid date') {
                  temp.endDate = date;
                }
              }
            });
            this.dataSource.data = cloneDeep(data);
            this.dataCount = resp[0] && resp[0].count_document ? resp[0].count_document : 0;
            this.paginator.length = resp[0] && resp[0].count_document ? resp[0].count_document : 0;
          } else {
            this.dataSource.data = [];
            this.paginator.length = 0;
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
    this.subs.sink = this.nameFilter.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.filteredValues.name = this.nameFilter.value;
      this.paginator.firstPage();
      this.getAllSequence();
    });

    this.subs.sink = this.descriptionFilter.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.filteredValues.description = this.descriptionFilter.value;
      this.paginator.firstPage();
      this.getAllSequence();
    });

    this.subs.sink = this.startDateFilter.valueChanges.subscribe((value) => {
      this.filteredValues.start_date = value instanceof Date ? moment(value).format('DD/MM/YYYY') : null;
      this.filteredValues['offset'] = moment().utcOffset();
      this.paginator.firstPage();
      this.getAllSequence();
    });

    this.subs.sink = this.endDateFilter.valueChanges.subscribe((value) => {
      this.filteredValues.end_date = value instanceof Date ? moment(value).format('DD/MM/YYYY') : null;
      this.filteredValues['offset'] = moment().utcOffset();
      this.paginator.firstPage();
      this.getAllSequence();
    });

    this.subs.sink = this.numberOfWeeksFilter.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.filteredValues.number_of_week = this.numberOfWeeksFilter.value ? Number(this.numberOfWeeksFilter.value) : null;
      this.paginator.firstPage();
      this.getAllSequence();
    });
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAllSequence();
      }
    }
  }
  resetFilter() {
    this.isReset = true;
    this.selection.clear();
    this.dataSelected = [];
    this.allStudentForCheckbox = [];
    this.allExportForCheckbox = [];
    this.dataUnselect = [];
    this.isAllChecked = false;
    this.sortValue = null;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.nameFilter.setValue(null, { emitEvent: false });
    this.typeSequenceFilter.setValue(null, { emitEvent: false });
    this.descriptionFilter.setValue(null, { emitEvent: false });
    this.startDateFilter.setValue(null, { emitEvent: false });
    this.endDateFilter.setValue(null, { emitEvent: false });
    this.numberOfWeeksFilter.setValue(null, { emitEvent: false });
    this.filteredValues = {
      name: null,
      type_of_sequences: null,
      description: null,
      start_date: null,
      end_date: null,
      number_of_week: null
    };

    if ('offset' in this.filteredValues) {
      delete this.filteredValues['offset'];
    }

    this.paginator.pageIndex = 0;
    this.filterBreadcrumbData = [];
    this.getAllSequence();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return this.isAllChecked ? true : numSelected === numRows || numSelected > numRows;
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  masterToggle($event) {
    if (this.isAllSelected() || (this.isAllChecked && this.dataUnselect && this.dataUnselect.length)) {
      this.selection.clear();
      this.isAllChecked = false;
      this.dataSelected = [];
      this.allExportForCheckbox = [];
      this.dataUnselect = [];
    } else {
      this.selection.clear();
      this.isAllChecked = true;
      this.dataSelected = [];
      this.dataUnselect = [];
      this.allStudentForCheckbox = [];
      this.allExportForCheckbox = [];
      this.dataSource.data.map((row) => {
        if (!this.dataUnselect.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
      // this.getDataAllForCheckbox(0);
    }
  }

  getAllIdSequenceForExport(pageNumber) {
    if (this.isAllChecked) {
      if (this.dataUnselect.length < 1) {
        this.exportDataToCSV();
      } else {
        if (pageNumber === 0) {
          this.allExportForCheckbox = [];
          this.dataSelected = [];
          // this.allCandidateData = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isWaitingForResponse = true;
        this.filteredValues['offset'] = moment().utcOffset();
        this.subs.sink = this.courseSequenceService.getAllIdSequenceForExport(pagination, this.filteredValues, this.sortValue).subscribe(
          (data: any) => {
            if (data && data.length) {
              const resp = _.cloneDeep(data);
              this.allExportForCheckbox = _.concat(this.allExportForCheckbox, resp);
              const page = pageNumber + 1;
              this.getAllIdSequenceForExport(page);
            } else {
              this.isWaitingForResponse = false;
              if (this.isAllChecked) {
                if (this.allExportForCheckbox && this.allExportForCheckbox.length) {
                  this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselect.includes(list._id));
                  // this.allCandidateData = this.allExportForCheckbox.filter((list) => !this.dataUnselect.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length) {
                    this.exportDataToCSV();
                  }
                }
              }
            }
          },
          (err) => {
            this.isReset = false;
            this.isWaitingForResponse = false;
            console.log(err);
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
    } else {
      this.exportDataToCSV();
    }
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isWaitingForResponse = true;
    this.filteredValues['offset'] = moment().utcOffset();
    this.subs.sink = this.courseSequenceService
      .getAllSequence(pagination, this.filteredValues, this.sortValue, this.translate.currentLang)
      .subscribe(
        (students: any) => {
          if (students && students.length) {
            this.allStudentForCheckbox.push(...students);
            const page = pageNumber + 1;
            this.getDataAllForCheckbox(page);
          } else {
            this.isWaitingForResponse = false;
            if (this.isAllChecked) {
              if (this.allStudentForCheckbox && this.allStudentForCheckbox.length) {
                this.allStudentForCheckbox.forEach((element) => {
                  this.selection.select(element._id);
                  this.dataSelected.push(element);
                });
              }
            }
          }
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          this.isReset = false;
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

  onIndividualToggle($event, row) {
    if (row && row._id) {
      this.selection.toggle(row._id);
    }
  }

  deleteSequence(id: string, name: string) {
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('SEQUENCE_RS1.TITLE'),
      html: this.translate.instant('SEQUENCE_RS1.TEXT'),
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('SEQUENCE_RS1.BUTTON_1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('SEQUENCE_RS1.BUTTON_2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      width: '33em',
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('SEQUENCE_RS1.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('SEQUENCE_RS1.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.isWaitingForResponse = true;
        this.subs.sink = this.courseSequenceService.deleteSequence(id).subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            if (resp) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('SEQUENCE_RS2.TITLE'),
                html: this.translate.instant('SEQUENCE_RS2.TEXT'),
                confirmButtonText: this.translate.instant('SEQUENCE_RS2.BUTTON_1'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then((confirms) => {
                this.getAllSequence();
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

  addSequence() {
    this.dialogRef = this.dialog.open(AddSequenceDialogComponent, {
      ...this.dialogConfig,
      data: {
        type: 'add',
        from: 'table',
      },
    });

    this.subs.sink = this.dialogRef.afterClosed().subscribe((reason) => {
      if (reason === 'success') {
        Swal.fire({
          type: 'success',
          title: 'Bravo!',
        }).then(() => {
          this.getAllSequence();
        });
      }
    });
  }

  editSequence({ _id, name, description, type_of_sequence, start_date, end_date, number_of_week }) {
    const formData = {
      _id: _id ? _id : null,
      name: name ? name : null,
      description: description ? description : null,
      type_of_sequence: type_of_sequence ? type_of_sequence : null,
      start_date: this.parseUtcToLocalPipe.transformDateToJavascriptDate(start_date.date, start_date.time),
      end_date: this.parseUtcToLocalPipe.transformDateToJavascriptDate(end_date.date, end_date.time),
      number_of_week: number_of_week ? number_of_week : null,
      action: 'edit',
    };

    this.dialogRef = this.dialog.open(AddSequenceDialogComponent, {
      ...this.dialogConfig,
      data: {
        type: 'edit',
        formData,
      },
    });

    this.subs.sink = this.dialogRef.afterClosed().subscribe((reason) => {
      if (reason === 'success') {
        Swal.fire({
          type: 'success',
          title: 'Bravo!',
        }).then(() => {
          this.getAllSequence();
        });
      }
    });
  }

  exportDataToCSV() {
    if (this.dataSelected && this.dataSelected.length < 1 && !this.isAllChecked) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('course_sequence.Sequence') }),
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

  async exportDataToCSVs() {
    const inputOptions = {
      comma: this.translate.instant('Export_S1.COMMA'),
      semicolon: this.translate.instant('Export_S1.SEMICOLON'),
      tab: this.translate.instant('Export_S1.TAB'),
    };
    const inputValues = {
      comma: ',',
      semicolon: ';',
      tab: '	', // yes, this is a tab
    };
    if (!this.selection.selected.length) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('course_sequence.Sequence') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      const result = await Swal.fire({
        type: 'question',
        allowOutsideClick: false,
        title: this.translate.instant('Export_S1.TITLE'),
        allowEscapeKey: true,
        confirmButtonText: this.translate.instant('Export_S1.OK'),
        input: 'radio',
        inputOptions: inputOptions,
        showCancelButton: true,
        cancelButtonText: this.translate.instant('DASHBOARD_DELETE.Cancel'),
        inputValue: this.translate && this.translate.currentLang === 'fr' ? ';' : '',
        inputValidator: (value) => {
          return new Promise((resolve, reject) => {
            if (value) {
              resolve('');
            } else {
              reject(this.translate.instant('Export_S1.INVALID'));
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
          if (inputValue === 'semicolon') {
            Swal.enableConfirmButton();
          }
        },
      });
      if (result.value && Object.keys(inputValues).includes(result.value)) {
        const filter = {
          sequences_id: [...this.selection.selected],
        };
        const url = environment.apiUrl.replace(
          '/graphql',
          `//${inputValues[result.value]}/${localStorage.getItem('currentLang')}?filter=${JSON.stringify(filter)}`,
        );
        Swal.close();
        window.open(encodeURI(url), '_blank');
      }
    }
  }

  showOptions(info, row?) {
    if (this.isAllChecked) {
      if (row) {
        if (!this.dataUnselect.includes(row._id)) {
          this.dataUnselect.push(row._id);
          this.selection.deselect(row._id);
        } else {
          const indx = this.dataUnselect.findIndex((list) => list === row._id);
          this.dataUnselect.splice(indx, 1);
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
  }

  openDownloadCsv(fileType) {
    const name = this.filteredValues.name !== null ? this.filteredValues.name : '';
    const description = this.filteredValues.description !== null ? this.filteredValues.description : '';
    const start_date = this.filteredValues.start_date !== null ? this.filteredValues.start_date : '';
    const end_date = this.filteredValues.end_date !== null ? this.filteredValues.end_date : '';
    const number_of_week = this.filteredValues.number_of_week !== null ? this.filteredValues.number_of_week : '';
    const type_of_sequence = this.filteredValues.type_of_sequences?.length ? this.filteredValues.type_of_sequences.map(value => `"` + value + `"`) : '';
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const importTemplateSequenceCSV = `downloadSequenceCSV/`;

    let filter;
    const selectedId = this.dataSelected.map((data) => data._id);
    const sequences = selectedId.map((list) => `"` + list + `"`);
    if (!this.isAllChecked || this.selectedType === 'one') {
      filter =
        `filter={"sequences_id":[` +
        sequences +
        `],"name":"` +
        name +
        `","description":"` +
        description +
        `","start_date":"` +
        start_date +
        `","end_date":"` +
        end_date +
        `","number_of_week":"` +
        number_of_week +
        `","type_of_sequences":[` +
        type_of_sequence +
        `],"offset":"` +
        moment().utcOffset() +
        `"}`;
    } else {
      filter =
        `filter={"name":"` +
        name +
        `","description":"` +
        description +
        `","start_date":"` +
        start_date +
        `","end_date":"` +
        end_date +
        `","number_of_week":"` +
        number_of_week +
        `","type_of_sequences":[` +
        type_of_sequence +
        `],"offset":"` +
        moment().utcOffset() +
        `"}`;
    }
    const sorting = this.sortingForExport();
    const fullURL =
      url +
      importTemplateSequenceCSV +
      fileType +
      '/' +
      lang +
      '?' +
      filter +
      '&' +
      sorting +
      '&' +
      `user_type_id="${this.currentUserTypeId}"`;
    console.log('fullURL', fullURL);

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
          }).then(() => {
            this.selection.clear();
            this.isCheckedAll = false;
            this.dataSelected = [];
          });
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        console.log(err);
        this.isWaitingForResponse = false;
      },
    );
    // element.href = encodeURI(url + importTemplateSequenceCSV + fileType + '/' + lang + '?' + filter);
    // console.log(element.href);
    // element.target = '_blank';
    // element.download = 'Sequence CSV';
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

  transformDateToLocal(date, time) {
    return this.parseUtcToLocalPipe.transformDate(date, time);
  }

  onOpenDuplicateDialog(data) {
    const formData = {
      _id: data._id ? data._id : null,
      name: null,
      description: data.description ? data.description : null,
      type_of_sequence: data.type_of_sequence ? data.type_of_sequence : null,
      start_date: this.parseUtcToLocalPipe.transformDateToJavascriptDate(data.start_date.date, data.start_date.time),
      end_date: this.parseUtcToLocalPipe.transformDateToJavascriptDate(data.end_date.date, data.end_date.time),
      number_of_week: data.number_of_week ? data.number_of_week : null,
      action: 'duplicate',
    };
    this.subs.sink = this.dialog
      .open(AddSequenceDialogComponent, {
        width: '800px',
        disableClose: true,
        data: {
          type: 'duplicate',
          formData,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          Swal.fire({
            type: 'success',
            title: 'Bravo!',
          }).then(() => {
            this.getAllSequence();
          });
        }
      });
  }
  setTypeOfSequenceFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.sequnce) === JSON.stringify(this.typeSequenceFilter.value);
    if (isSame) {
      return;
    } else if (this.typeSequenceFilter.value?.length) {
      this.filteredValues.type_of_sequences = this.typeSequenceFilter.value;
      this.tempDataFilter.sequnce = this.typeSequenceFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllSequence();
      }
    } else {
      if (this.tempDataFilter.sequnce?.length && !this.typeSequenceFilter.value?.length) {
        this.filteredValues.type_of_sequences = this.typeSequenceFilter.value;
        this.tempDataFilter.sequnce = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllSequence();
        }
      } else {
        return;
      }
    }
  }
  isAllDropdownSelectedTable(type) {
    if (type === 'sequence') {
      const selected = this.typeSequenceFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.sequenceTypes.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelectedTable(type) {
    if (type === 'sequence') {
      const selected = this.typeSequenceFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.sequenceTypes.length;
      return isIndeterminate;
    }
  }
  selectAllDataTable(event, type) {
    if (type === 'sequence') {
      if (event.checked) {
        const typeRegistrationList = this.sequenceTypes.map((el) => el?.value);
        this.typeSequenceFilter.patchValue(typeRegistrationList, { emitEvent: false });
      } else {
        this.typeSequenceFilter.patchValue(null, { emitEvent: false });
      }
    }
  }

  clearSelectIfFilter() {
    this.selection?.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'name', // name of the key in the object storing the filter
        column: 'course_sequence.Name', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.nameFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'type_of_sequences',
        column: 'course_sequence.Type of sequence',
        isMultiple: this.typeSequenceFilter?.value?.length === this.sequenceTypes?.length ? false : true,
        filterValue: this.typeSequenceFilter?.value?.length === this.sequenceTypes?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.typeSequenceFilter?.value?.length === this.sequenceTypes?.length ? null : this.sequenceTypes,
        filterRef: this.typeSequenceFilter,
        isSelectionInput: this.typeSequenceFilter?.value?.length === this.sequenceTypes?.length ? null : true,
        displayKey: this.typeSequenceFilter?.value?.length === this.sequenceTypes?.length ? null : 'label',
        savedValue: this.typeSequenceFilter?.value?.length === this.sequenceTypes?.length ? null : 'value',
      },
      {
        type: 'table_filter',
        name: 'description',
        column: 'course_sequence.Description',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.descriptionFilter,
        isSelectionInput: false,
        displayKey: null,
        savedValue: null,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'start_date',
        column: 'course_sequence.Start date',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.startDateFilter,
        isSelectionInput: false,
        displayKey: null,
        savedValue: null,
      },
      {
        type: 'table_filter',
        name: 'end_date',
        column: 'course_sequence.End date',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.endDateFilter,
        isSelectionInput: false,
        displayKey: null,
        savedValue: null,
      },
    ];

    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
    this.clearSelectIfFilter();
    this.getAllSequence();
  }
}
