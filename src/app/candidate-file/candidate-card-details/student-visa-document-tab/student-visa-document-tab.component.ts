import * as _ from 'lodash';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SubSink } from 'subsink';
import { AskVisaDocumentDialogComponent } from './ask-visa-document-dialog/ask-visa-document-dialog.component';
import { RejectVisaDocumentDialogComponent } from './reject-visa-document-dialog/reject-visa-document-dialog.component';
import { StudentsService } from 'app/service/students/students.service';
import { debounceTime, scan, startWith, take, tap } from 'rxjs/operators';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { UntypedFormControl } from '@angular/forms';
import * as moment from 'moment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { TeacherManagementService } from 'app/service/teacher-management/teacher-management.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { MatSelect } from '@angular/material/select';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { UtilityService } from 'app/service/utility/utility.service';
import { MatOptionSelectionChange } from '@angular/material/core';
import { AddValidityDateDialogComponent } from 'app/user-management/user-management-detail/user-details/user-details-parent-tabs/user-details-required-documents-tab/add-validity-date-dialog/add-validity-date-dialog.component';
import { environment } from 'environments/environment';

@Component({
  selector: 'ms-student-visa-document-tab',
  templateUrl: './student-visa-document-tab.component.html',
  styleUrls: ['./student-visa-document-tab.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class StudentVisaDocumentTabComponent implements OnInit, OnDestroy, OnChanges {
  private subs = new SubSink();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() candidateId;
  @Input() candidateData;
  @Input() programId;

  isWaitingForResponse: boolean = false;

  displayedColumns: string[] = ['documentName', 'dateAdded', 'dateOfValidity', 'status', 'action'];
  filterColumns: string[] = ['documentNameFilter', 'dateAddedFilter', 'dateOfValidityFilter', 'statusFilter', 'actionFilter'];
  filteredValues = {
    document_name: null,
    date_added: null,
    date_of_validity: null,
    validation_statuses: null,
  };

  dataSource = new MatTableDataSource([]);
  sortValue = null;
  documentCount;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;

  statusList = [];

  documentNameFilter = new UntypedFormControl(null);
  dateAddedFilter = new UntypedFormControl(null);
  dateOfValidityFilter = new UntypedFormControl(null);
  statusFilter = new UntypedFormControl(null);

  currentUser: any;

  @ViewChild('templateColumn') templateColumnRef: MatSelect;

  tempDraggableColumnFilter: any = [];
  tempDraggableColumn: any = [];
  latestSelectedColumn: any = null;
  tempColumnListTable: any = [];
  columnCtrl = new UntypedFormControl(null);

  defaultDisplayedColumns = [
    {
      name: 'REQUIRED_DOCUMENT_TABS.DOCUMENT_NAME',
      colName: 'documentName',
      filterName: 'documentNameFilter',
    },
    {
      name: 'REQUIRED_DOCUMENT_TABS.DATE_ADDED',
      colName: 'dateAdded',
      filterName: 'dateAddedFilter',
    },
    {
      name: 'REQUIRED_DOCUMENT_TABS.DATE_OF_VALIDITY',
      colName: 'dateOfValidity',
      filterName: 'dateOfValidityFilter',
    },
    {
      name: 'REQUIRED_DOCUMENT_TABS.STATUS',
      colName: 'status',
      filterName: 'statusFilter',
    },
    {
      name: 'Action',
      colName: 'action',
      filterName: 'actionFilter',
    },
  ];

  conditionalGraphqlField = {
    documentName: true,
    dateAdded: true,
    dateOfValidity: true,
    status: true,
    action: true,
  };

  isPermission: any;
  currentUserTypeId;

  private timeOutVal: any;

  constructor(
    public dialog: MatDialog,
    private studentsService: StudentsService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private translate: TranslateService,
    private teacherManagementService: TeacherManagementService,
    private authService: AuthService,
    private utilService: UtilityService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const user = this.authService.getLocalStorageUser();
    const currentUserEntity = user?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = [currentUserEntity?.type?._id];
    this.initFilter();
    // this.getAllStudentVisaDocument();
    this.getStatusList();
    this.checkTemplateTable();

    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getStatusList();
    });
  }

  ngOnChanges(): void {}

  ngAfterViewInit(): void {
    this.selectionChangesColumn();
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getAllStudentVisaDocument();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getAllStudentVisaDocument(data?) {
    this.isWaitingForResponse = true;

    const pagination = {
      limit: this.paginator && this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator && this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    const filter = this.cleanFilterData();
    this.checkFilterAndSorting();
    this.checkConditionalGraphql();
    this.subs.sink = this.studentsService
      .getStudentVisaDocument(
        pagination,
        this.conditionalGraphqlField,
        this.candidateId,
        this.sortValue,
        filter,
        ['visa_document'],
        this.programId,
      )
      .subscribe(
        (response) => {
          this.isWaitingForResponse = false;
          if (response && response?.length) {
            // *************** mapping status color
            const newData = (_.cloneDeep(response) || []).map((data) => {
              data.dateAdded = data?.created_at;
              data.dateValidation = this.parseUTCToLocalPipe.transformDate(data?.date_of_expired?.date, data?.date_of_expired?.time);
              data.step_status = data?.document_status;
              if (data?.step_status === 'waiting_validation') {
                data.step_status_color = 'orange';
              } else if (data?.step_status === 'rejected') {
                data.step_status_color = 'red';
              } else if (data?.step_status === 'validated') {
                data.step_status_color = 'green';
              } else if (data?.step_status === 'expired') {
                data.step_status_color = 'purple';
              }

              return data;
            });
            this.documentCount = response.length && response[0] && response[0].count_document ? response[0].count_document : 0;
            this.dataSource.data = newData;
          } else {
            this.dataSource.data = [];
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
        },
      );
  }

  getStatusList() {
    this.statusList = [
      { key: this.translate.instant( 'statusList.waiting_validation'), value: 'waiting_validation' },
      { key: this.translate.instant( 'statusList.rejected'), value: 'rejected' },
      { key: this.translate.instant( 'statusList.validated'), value: 'validated' },
      { key: this.translate.instant( 'statusList.expired'), value: 'expired' }
    ];
    this.sortStatusList();
  };

  sortStatusList() {
    if(this.statusList?.length) {
      const tempStatusList = this.statusList?.map((statusData) => {
        const tempStatus = this.utilService.simpleDiacriticSensitiveRegex(statusData?.key?.toLowerCase());
        statusData.statusForSort = tempStatus?.toLowerCase();

        return statusData;
      })
      
      this.statusList = _.sortBy(tempStatusList, 'statusForSort');
    }
  }

  initFilter() {
    this.subs.sink = this.documentNameFilter.valueChanges.pipe(debounceTime(800)).subscribe((nameSearch) => {
      this.filteredValues.document_name = nameSearch;
      this.paginator.pageIndex = 0;
      this.getAllStudentVisaDocument();
    });

    this.subs.sink = this.dateAddedFilter.valueChanges.pipe(debounceTime(500)).subscribe((dataSearch) => {
      if (dataSearch) {
        const newDate = moment(dataSearch).format('DD/MM/YYYY');
        this.filteredValues.date_added = newDate;
      } else {
        this.filteredValues.date_added = null;
      }
      this.paginator.pageIndex = 0;
      this.getAllStudentVisaDocument();
    });

    this.subs.sink = this.dateOfValidityFilter.valueChanges.pipe(debounceTime(500)).subscribe((dataSearch) => {
      if (dataSearch) {
        const newDate = moment(dataSearch).format('DD/MM/YYYY');
        this.filteredValues.date_of_validity = newDate;
      } else {
        this.filteredValues.date_of_validity = null;
      }
      this.paginator.pageIndex = 0;
      this.getAllStudentVisaDocument();
    });
  }

  onFilterSelect() {
    if (this.statusFilter.value) {
      this.filteredValues.validation_statuses = this.statusFilter.value;
      this.getAllStudentVisaDocument();
    }
  }

  isAllDropdownSelected(filterName) {
    if (filterName === 'statusFilter') {
      const selected = this.statusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.statusList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(filterName) {
    if (filterName === 'statusFilter') {
      const selected = this.statusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.statusList.length;
      return isIndeterminate;
    }
  }

  selectAllData(filterName: string, data) {
    if (filterName === 'statusFilter') {
      if (data.checked) {
        const allTemplate = this.statusList.map((data) => data.value);
        this.statusFilter.patchValue(allTemplate);
      } else {
        this.statusFilter.patchValue(null, { emitEvent: false });
      }
    }
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    this.paginator.pageIndex = 0;
    this.getAllStudentVisaDocument();
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    Object.keys(filterData).forEach((key) => {
      if (!filterData[key] && filterData[key] !== false) {
        delete filterData[key];
      }
    });

    if (!filterData?.validation_statuses?.length) delete filterData['validation_statuses'];

    return filterData;
  }

  resetFilter() {
    this.filteredValues = {
      document_name: null,
      date_added: null,
      date_of_validity: null,
      validation_statuses: null,
    };

    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sortValue = null;
    this.sort.active = null;
    this.sort.direction = null;

    this.documentNameFilter.setValue(null,{emitEvent:false});
    this.dateAddedFilter.setValue(null,{emitEvent:false});
    this.dateOfValidityFilter.setValue(null,{emitEvent:false});
    this.statusFilter.setValue(null),{emitEvent:false};
    this.getAllStudentVisaDocument();
    this.checkTemplateTable();
  }

  askForVisaDocument(data) {
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    if (data) {
      this.subs.sink = this.dialog
        .open(AskVisaDocumentDialogComponent, {
          data: {
            student: data,
            from: 'single',
            userTypesList,
          },
          panelClass: 'certification-rule-pop-up',
          disableClose: true,
          width: '650px',
        })
        .afterClosed()
        .subscribe();
    }
  }

  rejectVisaDocument(data) {
    if(data){
      const documentName = data?.document_name ? this.translate.instant('COUNTRY_NATIONALITY.DOCUMENT_NAME.' + data?.document_name) : '';
      const studentName = this.candidateData
        ? (this.candidateData?.civility === 'neutral' ? '' : this.translate.instant(this.candidateData?.civility)) +
          ' ' +
          this.candidateData?.first_name +
          ' ' +
          this.candidateData?.last_name?.toUpperCase()
        : '';
      Swal.fire({
        title: this.translate.instant('RejectVisaDocument_S1.TITLE', { documentName }),
        text: this.translate.instant('RejectVisaDocument_S1.TEXT', { studentName }),
        type: 'warning',
        allowEscapeKey: true,
        allowEnterKey: false,
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('RejectVisaDocument_S1.BUTTON1'),
        cancelButtonText: this.translate.instant('RejectVisaDocument_S1.BUTTON2'),
      }).then((resp) => {
        if(resp?.value){
          this.subs.sink = this.dialog
            .open(RejectVisaDocumentDialogComponent, {
              panelClass: 'certification-rule-pop-up',
              disableClose: true,
              width: '700px',
              autoFocus: false,
              data: {
                document: data,
                candidate: this.candidateData,
              },
            }).afterClosed().subscribe((val) => {
              if (val) {
                this.getAllStudentVisaDocument();
              }
            });
          };
        }
      );
    }
  }

  validateVisaDocument(data) {
    if (data) {
      const documentName = data?.document_name ? this.translate.instant('COUNTRY_NATIONALITY.DOCUMENT_NAME.' + data?.document_name) : '';
      const studentData = this.candidateData
        ? (this.candidateData?.civility === 'neutral' ? '' : this.translate.instant(this.candidateData?.civility)) +
          ' ' +
          this.candidateData?.first_name +
          ' ' +
          this.candidateData?.last_name.toUpperCase()
        : '';
      Swal.fire({
        title: this.translate.instant('ValidateVisaDocument_S1.TITLE', { documentName }),
        text: this.translate.instant('ValidateVisaDocument_S1.TEXT', { studentData }),
        type: 'warning',
        allowEscapeKey: true,
        allowEnterKey: false,
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('Validate'),
        cancelButtonText: this.translate.instant('Cancel'),
      }).then((resp) => {
        if (resp.value) {
          this.isWaitingForResponse = true;
          const payload = { _id: data?._id, validationStatus: 'validated' };
          const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
          this.subs.sink = this.studentsService?.validateOrRejectAcadDocument(payload, userTypesList,this.currentUser?._id).subscribe(
            (resp) => {
              this.isWaitingForResponse = false;
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.getAllStudentVisaDocument();
              });
            },
            (err) => {
              this.isWaitingForResponse = false;
              this.authService.postErrorLog(err);
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
            },
          );
        }
      });
    }
  }

  onAddValidity(data) {
    this.subs.sink = this.dialog
      .open(AddValidityDateDialogComponent, {
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        width: '700px',
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getAllStudentVisaDocument();
        }
      });
  }

  viewVisaDocument(data) {
    if (!data?.s3_file_name) {
      return;
    }
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = `${environment.apiUrl}/fileuploads/${data?.s3_file_name}`.replace('/graphql', '');
    a.click();
    a.remove();
  }

  sendReminder() {
    const studentId = this.candidateId;
    let timeDisabled = 3;
    const studentName = (this.candidateData?.civility === 'neutral' ? '' : this.translate.instant(this.candidateData?.civility)) + " " + this.candidateData?.first_name + " " + this.candidateData?.last_name.toUpperCase();
    const filter = {
      candidate_ids: [studentId]
    }
    if(studentId) {
      if (this.candidateData?.visa_document_process_id?.form_status === 'not_sent' ||
      (this.candidateData?.require_visa_permit && !this.candidateData?.visa_document_process_id)) {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('DocumentVisaReminder_S2.TITLE', { studentName }),
          html: this.translate.instant('DocumentVisaReminder_S2.TEXT'),
          confirmButtonText: 'OK',
          allowOutsideClick: false,
          allowEnterKey: false,
          allowEscapeKey: false,
        });
      } else {
        Swal.fire({
          title: this.translate.instant('DocumentVisaReminder_S1.TITLE', { studentName }),
          text: this.translate.instant('DocumentVisaReminder_S1.TEXT', { studentName }),
          type: 'warning',
          allowEscapeKey: true,
          allowEnterKey: false,
          allowOutsideClick: false,
          showCancelButton: true,
          confirmButtonText: this.translate.instant('Yes', { timer: timeDisabled }),
          cancelButtonText: this.translate.instant('No'),
          onOpen: () => {
            Swal.getConfirmButton().setAttribute('disabled', '');
            const confirmBtnRef = Swal.getConfirmButton();
            const intVal = setInterval(() => {
              timeDisabled -= 1;
              confirmBtnRef.innerText = this.translate.instant('Reminder_ONE_TIME_FORM.Button1') + ` (${timeDisabled})`;
            }, 1000);
    
            this.timeOutVal = setTimeout(() => {
              confirmBtnRef.innerText = this.translate.instant('Reminder_ONE_TIME_FORM.Button1');
              Swal.getConfirmButton().removeAttribute('disabled');
              clearInterval(intVal);
              clearTimeout(this.timeOutVal);
            }, timeDisabled * 1000);
          },
        }).then((resp) => {
          clearTimeout(this.timeOutVal);
          if (resp.value) {
            this.isWaitingForResponse = true;
            this.subs.sink = this.studentsService.sendReminderVisaDocument(this.currentUserTypeId, filter).subscribe(
              (resp) => {
                this.isWaitingForResponse = false;
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('Bravo!'),
                  confirmButtonText: this.translate.instant('OK'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.getAllStudentVisaDocument();
                });
            },
            (err) => {
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
              } else {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('SORRY'),
                  text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                  confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                });
              }
            },
          )}
        });
      }
    }
  }

  translateDate(dataDate, dataTime) {
    let format;
    if (dataDate) {
      const time = dataTime ? dataTime : '15:59';
      const date = moment(dataDate).format('DD/MM/YYYY');
      const localDate = this.parseUTCToLocalPipe.transformDate(date && date !== 'Invalid date' ? date : dataDate, time);
      format = localDate !== 'Invalid date' ? localDate : null;
    } else {
      format = '-';
    }
    return format;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // *************** Column Specialization section
  checkTemplateTable() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.authService
      .GetUserTableColumnSettings(this.currentUser?._id)
      .pipe(take(1))
      .subscribe(
        (resp) => {
          if (resp && resp?.length) {
            localStorage.setItem('templateTable', JSON.stringify(resp));
          }
          const dataFromLocalStorage = JSON.parse(localStorage.getItem('templateTable'));
          // *************** Condition for checking if from localstorage have any value, it will get from here
          if (dataFromLocalStorage?.length) {
            // *************** Check if it is have table_name for certain table
            const allStudentTableTemplate = dataFromLocalStorage.find((lcl) => lcl.table_name === 'visa_document');
            // *************** If condition meet it will reorder based on value that stored in local storage
            if (allStudentTableTemplate) {
              const arrayType = this.utilService.checkArrayType(allStudentTableTemplate?.display_column);
              const isArrayObj = arrayType === 'object' ? true : false;
              this.displayedColumns = allStudentTableTemplate?.display_column?.map((col) => (isArrayObj ? col?.column_name : col));
              this.filterColumns = allStudentTableTemplate.filter_column;
              const filterValue = [];

              const displayColumns = allStudentTableTemplate?.display_column?.map((col) => (isArrayObj ? col?.column_name : col));
              displayColumns.forEach((resp) => {
                const findIndex = this.defaultDisplayedColumns.findIndex((def) => def.colName === resp);
                if (findIndex !== -1) {
                  filterValue.push(this.defaultDisplayedColumns[findIndex]);
                }
              });
              this.resetFilterWhenUpdateColumn();
              this.columnCtrl.patchValue(filterValue);
              // Get Data Unbalanced
              this.getAllStudentVisaDocument('init');
            } else {
              // *************** If condition doesnt meet it will reorder based on default column that we have
              this.columnCtrl.patchValue(this.defaultDisplayedColumns);
              this.updateColumn(this.defaultDisplayedColumns);
            }
          } else {
            // *************** If condition doesnt meet it will reorder based on default column that we have
            this.columnCtrl.patchValue(this.defaultDisplayedColumns);
            this.updateColumn(this.defaultDisplayedColumns);
          }
        },
        (err) => {
          Swal.fire({
            type: 'info',
            title: 'Warning',
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }

  updateColumn(data) {
    this.isWaitingForResponse = true;
    this.displayedColumns = [];
    this.filterColumns = [];
    // *************** Condition if when user drag column in it will store in tempDraggableColumn and this condition is for if user have done drag column
    if (this.tempDraggableColumn?.length && this.tempDraggableColumnFilter?.length && data?.length) {
      const tempDataColumn = data.map((dt) => dt.colName);
      const tempDataColumnFilter = data.map((dt) => dt.filterName);

      // *************** Condition if user remove selected column after drag column to another location
      if (this.tempDraggableColumn?.length > data?.length) {
        const distinctDataColumn = this.tempDraggableColumn.filter((curr) => tempDataColumn.includes(curr));
        const distinctDataColumnFilter = this.tempDraggableColumnFilter.filter((curr) => tempDataColumnFilter.includes(curr));

        const arrayType = this.utilService.checkArrayType(distinctDataColumn);
        const isArrayObj = arrayType === 'object' ? true : false;
        this.displayedColumns = distinctDataColumn?.map((col) => (isArrayObj ? col?.column_name : col));
        this.filterColumns = distinctDataColumnFilter;

        this.checkFilterAndSorting();
        this.resetFilterWhenUpdateColumn();

        this.tempDraggableColumn = _.cloneDeep(this.displayedColumns);
        this.tempDraggableColumnFilter = _.cloneDeep(this.filterColumns);
        setTimeout(() => {
          if (this.dataSource.data.length) {
            this.isWaitingForResponse = false;
          }
        }, 500);

        const columns = _.cloneDeep(this.displayedColumns);
        const table = {
          table_name: 'visa_document',
          display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
          filter_column: _.cloneDeep(this.filterColumns),
        };

        this.createOrUpdateUserTableColumnSettings(table);
        this.getAllStudentVisaDocument('1');
      } else if (this.tempDraggableColumn?.length < data?.length) {
        // *************** Condition if user add new column after drag column to another location

        const distinctDataColumn = tempDataColumn.filter((curr) => !this.tempDraggableColumn.includes(curr));
        const distinctDataColumnFilter = tempDataColumnFilter.filter((curr) => !this.tempDraggableColumnFilter.includes(curr));

        const arrayType = this.utilService.checkArrayType(distinctDataColumn);
        const isArrayObj = arrayType === 'object' ? true : false;
        this.displayedColumns = this.tempDraggableColumn.concat(distinctDataColumn?.map((col) => (isArrayObj ? col?.column_name : col)));
        this.filterColumns = this.tempDraggableColumnFilter.concat(distinctDataColumnFilter);

        this.checkFilterAndSorting();
        this.resetFilterWhenUpdateColumn();

        this.tempDraggableColumn = _.cloneDeep(this.displayedColumns);
        this.tempDraggableColumnFilter = _.cloneDeep(this.filterColumns);

        setTimeout(() => {
          if (this.dataSource.data.length) {
            this.isWaitingForResponse = false;
          }
        }, 500);

        const columns = _.cloneDeep(this.displayedColumns);
        const table = {
          table_name: 'visa_document',
          display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
          filter_column: _.cloneDeep(this.filterColumns),
        };

        this.createOrUpdateUserTableColumnSettings(table);
        this.getAllStudentVisaDocument('2');
      }
    } else {
      // *************** Condition if user didnt move any column it will reorder based on order stream column result
      if (data?.length) {
        data.forEach((resp) => {
          this.displayedColumns.push(resp.colName);
          this.filterColumns.push(resp.filterName);
        });

        setTimeout(() => {
          if (this.dataSource.data.length) {
            this.isWaitingForResponse = false;
          }
        }, 500);

        const arrayType = this.utilService.checkArrayType(this.displayedColumns);
        const isArrayObj = arrayType === 'object' ? true : false;
        const columns = _.cloneDeep(this.displayedColumns);
        const table = {
          table_name: 'visa_document',
          display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
          filter_column: _.cloneDeep(this.filterColumns),
        };

        this.checkFilterAndSorting();
        this.resetFilterWhenUpdateColumn();

        this.createOrUpdateUserTableColumnSettings(table);
        this.getAllStudentVisaDocument('3');
      } else {
        // *************** Condition if user didnt do any changes (add or remove), it will get latest update from local storage (because every updated it will saved into localstorage)
        if (!data.length && !this.columnCtrl.value.length) {
          this.displayedColumns = [];
          this.filterColumns = [];
          this.tempDraggableColumn = [];
          this.tempDraggableColumnFilter = [];

          const arrayType = this.utilService.checkArrayType(this.displayedColumns);
          const isArrayObj = arrayType === 'object' ? true : false;
          const columns = _.cloneDeep(this.displayedColumns);
          const table = {
            table_name: 'visa_document',
            display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
            filter_column: _.cloneDeep(this.filterColumns),
          };

          this.checkFilterAndSorting();
          this.resetFilterWhenUpdateColumn();

          this.createOrUpdateUserTableColumnSettings(table);
          this.getAllStudentVisaDocument('4');
        } else {
          const dataFromLocalStorage = JSON.parse(localStorage.getItem('templateTable'));
          const allStudentTableTemplate = dataFromLocalStorage?.find((lcl) => lcl.table_name === 'visa_document');
          if (allStudentTableTemplate) {
            const arrayType = this.utilService.checkArrayType(allStudentTableTemplate.display_column);
            const isArrayObj = arrayType === 'object' ? true : false;
            this.displayedColumns = allStudentTableTemplate.display_column?.map((col) => (isArrayObj ? col?.column_name : col));
            this.filterColumns = allStudentTableTemplate.filter_column;
            this.tempDraggableColumn = allStudentTableTemplate.display_column?.map((col) => (isArrayObj ? col?.column_name : col));
            this.tempDraggableColumnFilter = allStudentTableTemplate.filter_column;
            this.checkFilterAndSorting();
            this.resetFilterWhenUpdateColumn();
            this.getAllStudentVisaDocument('5');
            setTimeout(() => {
              if (this.dataSource.data.length) {
                this.isWaitingForResponse = false;
              }
            }, 500);
          }
        }
      }
    }
  }

  resetFilterWhenUpdateColumn() {
    this.isWaitingForResponse = true;
    this.dataSource.data = [];
    this.isReset = true;
    this.paginator.pageIndex = 0;
  }

  selectionChangesColumn() {
    // *************** For stream value selection changes, and to get latest added and removed
    this.templateColumnRef.optionSelectionChanges
      .pipe(
        scan((acc: string[], change: MatOptionSelectionChange) => {
          if (change.isUserInput && change.source.value) {
            this.latestSelectedColumn = change.source.value;
          }
          // *************** Condition for checking if source selected and it was coming from user input not patchvalue or directly update from formcontrol
          if (change.source.selected && change.isUserInput) {
            return [...acc, change.source.value];
          } else {
            // *************** Condition for checking if coming from user input and doesnt have any selected data before
            if (change.isUserInput) {
              return acc.filter((entry) => entry !== change.source.value);
            } else {
              // *************** Condition for checking if directly update from formcontrol
              this.tempDraggableColumn = [];
              this.tempDraggableColumnFilter = [];
              return this.columnCtrl.value;
            }
          }
        }, []),
      )
      .subscribe((selectedValues: any) => {
        // *************** Call function for reorder column based on selected
        this.tempColumnListTable = selectedValues;
      });
  }

  defaultTemplateColumn() {
    this.columnCtrl.patchValue(this.defaultDisplayedColumns);
    this.updateColumn(this.defaultDisplayedColumns);
  }

  checkConditionalGraphql() {
    const fieldKeys = Object.keys(this.conditionalGraphqlField);

    // *************** Need to make all the value in object to be false before check from that visibile colum
    fieldKeys.forEach((key) => {
      this.conditionalGraphqlField[key] = false;
    });

    const actionFound = this.displayedColumns.includes('action');

    if (actionFound) {
      // *************** Need to check if action is visible all other column will have true value
      fieldKeys.forEach((key) => {
        this.conditionalGraphqlField[key] = true;
      });
    } else {
      this.displayedColumns.forEach((col) => {
        this.conditionalGraphqlField[col] = true;
      });
    }
  }
  checkFilterAndSorting() {
    if (this.latestSelectedColumn) {
      if (this.defaultDisplayedColumns?.length) {
        this.defaultDisplayedColumns.forEach((col) => {
          if (!this.displayedColumns.includes(col?.colName)) {
            switch (col.colName) {
              case 'documentName':
                this.filteredValues.document_name = null;
                this.latestSelectedColumn = null;
                this.documentNameFilter.setValue(null, { emitEvent: false });

                if (this.sortValue?.document_name) {
                  this.sortValue = null;
                  this.sort.direction = '';
                  this.sort.active = '';
                }
                break;
              case 'dateAdded':
                this.filteredValues.date_added = null;
                this.latestSelectedColumn = null;
                this.dateAddedFilter.setValue(null, { emitEvent: false });

                if (this.sortValue?.date_added) {
                  this.sortValue = null;
                  this.sort.direction = '';
                  this.sort.active = '';
                }
                break;
              case 'dateOfValidity':
                this.filteredValues.date_of_validity = null;
                this.latestSelectedColumn = null;
                this.dateOfValidityFilter.setValue(null, { emitEvent: false });

                if (this.sortValue?.date_of_validity) {
                  this.sortValue = null;
                  this.sort.direction = '';
                  this.sort.active = '';
                }
                break;
              case 'status':
                this.filteredValues.validation_statuses = null;
                this.latestSelectedColumn = null;
                this.statusFilter.setValue(null, { emitEvent: false });

                if (this.sortValue?.validation_status) {
                  this.sortValue = null;
                  this.sort.direction = '';
                  this.sort.active = '';
                }
                break;
              default:
                this.latestSelectedColumn = null;
                break;
            }
          }
        });
      }
    } else {
      return;
    }
  }

  openColumnDropdown() {
    this.templateColumnRef.open();
  }

  handleClose(isOpened) {
    if (!isOpened) {
      const list = this.tempColumnListTable?.map((resp) => resp.colName);
      const isSame = list?.length === this.displayedColumns?.length ? list.every((resp) => this.displayedColumns.includes(resp)) : false;
      if (!isSame) {
        if (!this.tempColumnListTable?.length && !this.columnCtrl.value?.length) {
          this.updateColumn([]);
        } else {
          if (this.tempColumnListTable.length) {
            this.updateColumn(this.tempColumnListTable);
            this.tempColumnListTable = [];
          }
        }
      }
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
    moveItemInArray(this.filterColumns, event.previousIndex, event.currentIndex);

    this.tempDraggableColumn = _.cloneDeep(this.displayedColumns);
    this.tempDraggableColumnFilter = _.cloneDeep(this.filterColumns);

    const arrayType = this.utilService.checkArrayType(this.displayedColumns);
    const isArrayObj = arrayType === 'object' ? true : false;
    const columns = _.cloneDeep(this.displayedColumns);

    const table = {
      table_name: 'visa_document',
      display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
      filter_column: _.cloneDeep(this.filterColumns),
    };

    this.createOrUpdateUserTableColumnSettings(table);
  }

  createOrUpdateUserTableColumnSettings(data) {
    if (data) {
      this.subs.sink = this.authService.CreateOrUpdateUserTableColumnSettings(this.currentUser?._id, data).subscribe(
        (resp) => {
          if (resp) {
            this.authService?.refreshTemplateTables(this.currentUser?._id);
          }
        },
        (err) => {
          Swal.fire({
            type: 'info',
            title: 'Warning',
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
  }
}
