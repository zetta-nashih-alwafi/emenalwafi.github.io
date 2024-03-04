import { MatDialog } from '@angular/material/dialog';
import { AddTeacherManualDocumentDialogComponent } from './add-teacher-manual-document-dialog/add-teacher-manual-document-dialog.component';
import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { debounceTime, startWith, tap, map, filter } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { StudentsService } from 'app/service/students/students.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import * as moment from 'moment';
import { UtilityService } from 'app/service/utility/utility.service';
import { TeacherManagementService } from 'app/service/teacher-management/teacher-management.service';
import Swal from 'sweetalert2';
import { AcademicKitService } from 'app/service/rncpTitles/academickit.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-teacher-document-tab',
  templateUrl: './teacher-document-tab.component.html',
  styleUrls: ['./teacher-document-tab.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class TeacherDocumentTabComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() teacherId;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private subs = new SubSink();
  dataSource = new MatTableDataSource([]);

  displayedColumns: string[] = ['documentName', 'type', 'uploadDate', 'action'];
  filterColumns: string[] = ['documentNameFilter', 'typeFilter', 'uploadDateFilter', 'actionFilter'];

  isReset;
  documentNameFilter = new UntypedFormControl('');
  uploadDateFilter = new UntypedFormControl(null);
  dataDocumentType = [
    { value: 'All', name: 'All' },
    { value: 'teacher_document', name: 'Teacher Document' },
    { value: 'expected_document', name: 'Expected Document' },
    { value: 'manual_document', name: 'Manual Document' },
    { value: 'required_document', name: 'Required Document' },
  ];
  documentTypeFilter = new UntypedFormControl(null);

  noData;
  isWaitingForResponse = false;
  filteredValues = {
    teacher_id: null,
    updated_at: null,
    document_name: null,
  };
  sortValue = null;
  documentCount = 0;
  filteredDocumentType: Observable<any[]>;
  type = ['teacher_document', 'expected_document', 'manual_document', 'required_document'];
  dropdownDocumentType = [];

  constructor(
    private translate: TranslateService,
    private studentsService: StudentsService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private utilService: UtilityService,
    private teacherManagementService: TeacherManagementService,
    private dialog: MatDialog,
    private acadService: AcademicKitService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.getTableData();
    this.initFilter();
    this.dropdownType();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.dropdownType();
    });
  }

  ngOnChanges() {
    this.resetSelection();
    this.dropdownType();
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          this.getTableData();
        }),
      )
      .subscribe();
  }

  dropdownType() {
    if (this.documentTypeFilter.value && this.dropdownDocumentType.length) {
      const find = this.dropdownDocumentType.find((type) => type.name === this.documentTypeFilter.value);
      this.dropdownDocumentType = this.dataDocumentType.map((type) => {
        return { value: type.value, name: this.translate.instant(type.value) };
      });
      if (find) {
        this.documentTypeFilter.patchValue(this.translate.instant(find.value));
      } else {
        this.documentTypeFilter.patchValue(null);
      }
    } else {
      this.dropdownDocumentType = this.dataDocumentType.map((type) => {
        return { value: type.value, name: this.translate.instant(type.value) };
      });
      this.filteredDocumentType = of(this.dropdownDocumentType);
    }
  }

  getTableData() {
    const pagination = {
      limit: this.paginator && this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator && this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.filteredValues.teacher_id = this.teacherId;
    this.isWaitingForResponse = true;

    this.subs.sink = this.teacherManagementService
      .getAllTeacherDocuments(pagination, this.filteredValues, this.sortValue, this.type)
      .subscribe(
        (response) => {
          this.isWaitingForResponse = false;
          if (response) {
            this.dataSource.data = _.cloneDeep(response);
            this.documentCount = response.length && response[0] && response[0].count_document ? response[0].count_document : 0;
          } else {
            this.dataSource.data = [];
          }
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
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

  resetSelection() {
    this.paginator.pageIndex = 0;
    this.documentNameFilter.setValue('', { emitEvent: false });
    this.uploadDateFilter.setValue(null, { emitEvent: false });
    this.documentTypeFilter.setValue(null, { emitEvent: false });
    this.filteredValues = {
      teacher_id: this.teacherId,
      updated_at: null,
      document_name: null,
    };
    this.type = ['teacher_document', 'expected_document', 'manual_document', 'required_document'];
    this.sortValue = null;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.getTableData();
  }

  translateDate(date) {
    if (date) {
      const time = moment.utc(date).format('HH:mm');
      const localDate = this.parseUTCToLocalPipe
        .transformDateInDateFormat(moment(date).format('DD/MM/YYYY'), time)
        .format('DD-MM-YYYY hh:mm A');
      if (localDate !== 'Invalid date') {
        return localDate;
      }
    }
  }

  initFilter() {
    this.subs.sink = this.documentNameFilter.valueChanges.pipe(debounceTime(500)).subscribe((searchText) => {
      this.paginator.pageIndex = 0;
      this.filteredValues.document_name = searchText;
      this.getTableData();
    });
    this.subs.sink = this.uploadDateFilter.valueChanges.pipe(debounceTime(500)).subscribe((dueDate) => {
      if (dueDate) {
        this.paginator.pageIndex = 0;
        const filterDate = moment(dueDate).format('DD/MM/YYYY');
        this.filteredValues.updated_at = filterDate;
        this.getTableData();
      }
    });
    this.subs.sink = this.documentTypeFilter.valueChanges.subscribe((type) => {
      if (type) {
        if (this.dropdownDocumentType.length) {
          const filteredDocumentTypes = this.dropdownDocumentType.filter((document) =>
            this.utilService.simplifyRegex(document.name).includes(this.utilService.simplifyRegex(type)),
          );
          this.filteredDocumentType = of(filteredDocumentTypes);
        }
      } else {
        this.filteredDocumentType = of(this.dropdownDocumentType);
      }
    });
  }

  selectedDocumentType(type) {
    if (type !== 'All') {
      this.paginator.pageIndex = 0;
      this.type = type;
      // this.filteredValues.type_of_document = type;
      this.getTableData();
    } else if (type === 'All') {
      this.paginator.pageIndex = 0;
      this.type = ['teacher_document', 'expected_document', 'manual_document', 'required_document'];
      // this.filteredValues.type_of_document = null;
      this.getTableData();
    }
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    this.paginator.pageIndex = 0;
    this.getTableData();
  }

  download(fileUrl: string) {
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = `${environment.apiUrl}/fileuploads/${fileUrl}?download=true`.replace('/graphql', '');
    a.click();
    a.remove();
  }

  translateDocType(data) {
    if (data === 'expected_document') {
      return this.translate.instant('Doc expected - Contract');
    } else if (data === 'teacher_document') {
      return this.translate.instant('Teacher - Contract');
    } else if (data) {
      return this.translate.instant(data);
    } else {
      return '';
    }
  }

  onUploadDocument() {
    this.subs.sink = this.dialog
      .open(AddTeacherManualDocumentDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          teacher_id: this.teacherId,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          //  console.log(res);
          this.getTableData();
        }
      });
  }

  editDocument(data) {
    this.subs.sink = this.dialog
      .open(AddTeacherManualDocumentDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          type: 'edit',
          teacher_id: this.teacherId,
          data,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.getTableData();
        }
      });
  }

  deleteDocument(data) {
    // console.log('uat 445', data);
    if (data && data._id) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('CERTIFICATION_RULE.DELETE_DOCUMENT.TITLE'),
        text: this.translate.instant('CERTIFICATION_RULE.DELETE_DOCUMENT.TEXT', { DocumentName: data.document_name }),
        confirmButtonText: this.translate.instant('CERTIFICATION_RULE.DELETE_DOCUMENT.CONFIRMBTN'),
        cancelButtonText: this.translate.instant('CERTIFICATION_RULE.DELETE_DOCUMENT.CANCELBTN'),
        showCancelButton: true,
        allowOutsideClick: false,
      }).then((confirm) => {
        if (confirm.value) {
          this.isWaitingForResponse = true;
          this.subs.sink = this.acadService.deleteAcadDoc(data._id).subscribe(
            (res) => {
              this.isWaitingForResponse = false;
              if (res) {
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('Bravo!'),
                  confirmButtonText: this.translate.instant('OK'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.getTableData();
                });
              }
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
      });
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
