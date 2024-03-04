import { cloneDeep } from 'lodash';
import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SubSink } from 'subsink';
import { AddValidityDateDialogComponent } from './add-validity-date-dialog/add-validity-date-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TeacherManagementService } from 'app/service/teacher-management/teacher-management.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { startWith, tap, map, debounceTime } from 'rxjs/operators';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import * as moment from 'moment';
import { MatSort, Sort } from '@angular/material/sort';
import { UntypedFormControl } from '@angular/forms';
import { AskRequiredDocumentsDialogComponent } from 'app/teacher-management/teacher-management-table/ask-required-documents-dialog/ask-required-documents-dialog.component';
import { environment } from 'environments/environment';
@Component({
  selector: 'ms-user-details-required-documents-tab',
  templateUrl: './user-details-required-documents-tab.component.html',
  styleUrls: ['./user-details-required-documents-tab.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class UserDetailsRequiredDocumentsTabComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  private subs = new SubSink();
  @Input() userId: any;
  @Input() userData: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  noData;
  documentCount;
  disabledActions: boolean = false;

  isWaitingForResponse: boolean = false;

  displayedColumns: string[] = ['documentName', 'typeOfContract', 'dateAdded', 'dateOfValidity', 'status', 'action'];
  filterColumns: string[] = [
    'documentNameFilter',
    'typeOfContractFilter',
    'dateAddedFilter',
    'dateOfValidityFilter',
    'statusFilter',
    'actionFilter',
  ];

  dataSource = new MatTableDataSource([]);
  filteredValues = {
    type_of_document: 'required_document',
    teacher_id: null,
    document_name: null,
    type_of_contract: null,
    date_added: null,
    date_of_validity: null,
    validation_status: null,
    offset: null,
  };
  sortValue = null;
  documentName = new UntypedFormControl(null);
  typeOfContract = new UntypedFormControl(null);
  dateAdded = new UntypedFormControl(null);
  dateValidity = new UntypedFormControl(null);
  status = new UntypedFormControl(null);

  private timeOutVal: any;

  typeOfContractlist = [];
  statusList = []
  constructor(
    public dialog: MatDialog,
    private teacherManagementService: TeacherManagementService,
    private authService: AuthService,
    private translate: TranslateService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
  ) {}

  ngOnInit(): void {
    this.getAllDocuments();
    this.initFilter();
    this.initDropdown();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.initDropdown()
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.userId) {
      this.resetFilter();
      this.initDropdown();
    }
  }

  initDropdown() {
    this.typeOfContractlist = [
      {
        value: 'cddu',
        label: this.translate.instant('cddu'),
      },
      {
        value: 'convention',
        label: this.translate.instant('convention'),
      },
      {
        value:'cddu_convention',
        label: this.translate.instant('cddu_convention')
      }
    ];
    this.statusList = [
      {
        value: 'validated',
        label: this.translate.instant('statusList.validated'),
      },
      {
        value: 'rejected',
        label: this.translate.instant('statusList.rejected'),
      },
      {
        value:'waiting_validation',
        label: this.translate.instant('statusList.waiting_for_validation')
      },
      {
        value:'expired',
        label: this.translate.instant('statusList.document_expired')
      }
    ];
  }

  cleanSortData(sortValue) {
    Object.keys(sortValue).forEach((key) => {
      if (!sortValue[key] && sortValue[key] !== false) {
        delete sortValue[key];
      }
    });
    return sortValue;
  }

  getAllDocuments() {
    const pagination = {
      limit: this.paginator && this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator && this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.filteredValues.teacher_id = this.userId;
    const type = this.filteredValues.type_of_document;
    let filter = this.cleanFilterData();

    let sortValue;
    if(this.sortValue) {
      sortValue = this.cleanSortData(this.sortValue);
    }

    if(filter?.date_added || filter?.date_of_validity || this.sortValue?.date_added || this.sortValue?.date_of_validity) {
      filter = { ...filter, offset: moment().utcOffset() };
    }
    
    if(filter?.date_added) {
      filter = { ...filter, date_added: { date: filter?.date_added, time: '15:59' } };
    }
    
    if(filter?.date_of_validity) {
      filter = { ...filter, date_of_validity: { date: filter?.date_of_validity, time: '15:59' } };
    }
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherManagementService.getAllTeacherDocuments(pagination, filter, sortValue, type).subscribe(
      (resp) => {
        if (resp?.length) {
          this.dataSource.data = cloneDeep(resp);
        } else {
          this.dataSource.data = [];
        }
        this.documentCount = resp?.length && resp[0]?.count_document ? resp[0].count_document : 0;
        this.noData = this.dataSource.connect().pipe(map((data) => data.length === 0));
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err.message ? this.translate.instant(err.message.replaceAll('GraphQL error: ', '')) : err,
          allowOutsideClick: false,
        });
      },
    );
  }

  cleanFilterData() {
    const filterData = cloneDeep(this.filteredValues);
    Object.keys(filterData).forEach((key) => {
      if (!filterData[key] && filterData[key] !== false || !filterData[key]?.length) {
        delete filterData[key];
      }
    });
    return filterData;
  }

  sendReminder() {
    const teacherId = this.userId;
    let timeDisabled = 3;
    if(teacherId) {
      const teacherName = this.translate.instant(this.userData?.civility) + " " + this.userData?.first_name + " " + this.userData?.last_name.toUpperCase();
      Swal.fire({
        title: this.translate.instant('DocumentReminder_S1.TITLE', { teacherName }),
        text: this.translate.instant('DocumentReminder_S1.TEXT', { teacherName }),
        type: 'warning',
        allowEscapeKey: true,
        allowEnterKey: false,
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('Yes', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('No'),
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          const intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('Reminder_ONE_TIME_FORM.Button1') + ` (${timeDisabled})`;
          }, 1000);
  
          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('Reminder_ONE_TIME_FORM.Button1');
            Swal.enableConfirmButton();
            clearInterval(intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      }).then((resp) => {
        clearTimeout(this.timeOutVal);
        if (resp.value) {
          this.isWaitingForResponse = true;
          this.subs.sink = this.teacherManagementService.sendReminderRequiredDocument(teacherId).subscribe(
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
                this.getAllDocuments();
              });
          },
          (err) => {
            this.isWaitingForResponse = false;
            if(err && err['message'] && err['message'].includes('Cannot send reminder as teacher does not have form required document')) {
              Swal.fire({
                type: 'warning',
                title: this.translate.instant('DocumentReminder_S2.TITLE', { teacherName }),
                html: this.translate.instant('DocumentReminder_S2.TEXT'),
                confirmButtonText: 'OK',
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
              });
            } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
        )
      }
    })
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

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          this.getAllDocuments();
        }),
      )
      .subscribe();
  }

  initFilter() {
    this.subs.sink = this.documentName.valueChanges.pipe(debounceTime(500)).subscribe((search) => {
      this.paginator.pageIndex = 0;
      this.filteredValues.document_name = search;
      this.getAllDocuments();
    });

    this.subs.sink = this.dateAdded.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.date_added = newDate;
        this.paginator.pageIndex = 0;
        this.getAllDocuments();
      }
    });

    this.subs.sink = this.dateValidity.valueChanges.pipe(debounceTime(500)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.date_of_validity = newDate;
        this.paginator.pageIndex = 0;
        this.getAllDocuments();
      }
    });
  }

  onFilterSelect(filterName: string) {
    if(filterName === 'type_of_contract') {
      if(this.typeOfContract.value) {
         this.filteredValues.type_of_contract = this.typeOfContract.value;
         this.getAllDocuments();
      };
    } else if(filterName === 'status') {
      if(this.status.value) {
        this.filteredValues.validation_status = this.status.value;
        this.getAllDocuments();
     };
    }
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : null } : null;
    this.paginator.pageIndex = 0;
    this.getAllDocuments();
  }

  validateOrRejectAcadDocument(data, status) {
    if(data) {
      let timeDisabled = 3;
      const confirmTitle = status === 'validated' ? 'ValidateDocument_S1.TITLE' : 'RejectDocument_S1.TITLE';
      const confirmText = status === 'validated' ? 'ValidateDocument_S1.TEXT' : 'RejectDocument_S1.TEXT';
      const confirmButton = status === 'validated' ? 'Validate' : 'Reject';
      const documentName = data?.document_name ? data.document_name : '';
      const teacherName = this.translate.instant(this.userData?.civility) + " " + this.userData?.first_name + " " + this.userData?.last_name.toUpperCase();
      Swal.fire({
        title: this.translate.instant(confirmTitle, { documentName }),
        text: this.translate.instant(confirmText, { documentName, teacherName }),
        type: 'warning',
        allowEscapeKey: true,
        allowEnterKey: false,
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonText: this.translate.instant(confirmButton),
        cancelButtonText: this.translate.instant('Cancel'),
      }).then((resp) => {
        if (resp.value) {
          this.isWaitingForResponse = true;
          const payload = { _id: data?._id, validationStatus: status }
          this.subs.sink = this.teacherManagementService.validateOrRejectAcadDocument(payload).subscribe(
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
                this.getAllDocuments();
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
        )
      }
    })
    }
  }

  resetFilter() {
    this.paginator.pageIndex = 0;
    this.filteredValues = {
      type_of_document: 'required_document',
      teacher_id: this.userId,
      document_name: null,
      type_of_contract: null,
      date_added: null,
      date_of_validity: null,
      validation_status: null,
      offset: null
    };
    this.documentName.setValue(null, { emitEvent: false });
    this.typeOfContract.setValue(null, { emitEvent: false });
    this.dateAdded.setValue(null, { emitEvent: false });
    this.dateValidity.setValue(null, { emitEvent: false });
    this.status.setValue(null, { emitEvent: false });
    this.sortValue = null;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.getAllDocuments();
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
          this.getAllDocuments();
        }
      });
  }
  viewDocument(data) {
    if (!data?.s3_file_name) {
      return;
    }
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = `${environment.apiUrl}/fileuploads/${data?.s3_file_name}`.replace('/graphql', '');
    a.click();
    a.remove();
  }

  askRequiredDocument() {
    this.subs.sink = this.dialog
      .open(AskRequiredDocumentsDialogComponent, {
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        width: '700px',
        data: {
          dataSelected:[{
            _id:this.userId
          }]
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getAllDocuments();
        }
      });
  }

  isAllDropdownSelected(type) {
    if (type === 'typeContract') {
      const selected = this.typeOfContract.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.typeOfContractlist.length;
      return isAllSelected;
    } else if (type === 'status') {
      const selected = this.status.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.statusList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'typeContract') {
      const selected = this.typeOfContract.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.typeOfContractlist.length;
      return isIndeterminate;
    }else if (type === 'status') {
      const selected = this.status.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.statusList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'typeContract') {
      if (event.checked) {
        const data = this.typeOfContractlist.map((el) => el.value);
        this.typeOfContract.patchValue(data);
      } else {
        this.typeOfContract.patchValue(null);
      }
    }else  if (type === 'status') {
      if (event.checked) {
        const data = this.statusList.map((el) => el.value);
        this.status.patchValue(data);
      } else {
        this.status.patchValue(null);
      }
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeOutVal);
    this.subs.unsubscribe();
  }
}
