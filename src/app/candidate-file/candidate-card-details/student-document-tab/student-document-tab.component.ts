import { PageTitleService } from './../../../core/page-title/page-title.service';
import { MatDialog } from '@angular/material/dialog';
import { AddStudentManualDocumentDialogComponent } from './add-student-manual-document-dialog/add-student-manual-document-dialog.component';
import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { debounceTime, startWith, tap, map, scan, take } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { StudentsService } from 'app/service/students/students.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import * as moment from 'moment';
import { UtilityService } from 'app/service/utility/utility.service';
import { AcademicKitService } from 'app/service/rncpTitles/academickit.service';
import Swal from 'sweetalert2';
import { MatSelect } from '@angular/material/select';
import { MatOptionSelectionChange } from '@angular/material/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'ms-student-document-tab',
  templateUrl: './student-document-tab.component.html',
  styleUrls: ['./student-document-tab.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class StudentDocumentTabComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() candidateId;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private subs = new SubSink();
  dataSource = new MatTableDataSource([]);

  isReset;
  documentNameFilter = new UntypedFormControl('');
  uploadDateFilter = new UntypedFormControl(null);

  dataDocumentType = [
    { value: 'admission_document', name: 'Admission Document' },
    { value: 'proof_of_payment', name: 'Proof of Payment' },
    { value: 'manual_document', name: 'Manual Document' },
    { value: 'one_time_form', name: 'One Time Form' },
    { value: 'student_admission', name: 'student_admission' },
    { value: 'fc_contract', name: 'fc_contract' },
    { value: 'visa_document', name: 'Visa Document' },
    { value: 'emancipated_document_proof', name: 'Emancipate Document Proof' },
  ];
  documentTypeFilter = new UntypedFormControl(null);

  noData;
  isWaitingForResponse = false;
  filteredValues = {
    // type_of_document: null,
    date: null,
    document_name: null,
  };
  sortValue = null;
  documentCount = 0;
  filteredDocumentType: Observable<any[]>;
  type = [
    'admission_document',
    'proof_of_payment',
    'manual_document',
    'one_time_form',
    'student_admission',
    'fc_contract',
    'visa_document',
    'emancipated_document_proof',
  ];
  dropdownDocumentType = [];

  // Custom Column
  currentUser: any;
  @ViewChild('templateColumn') templateColumnRef: MatSelect;
  columnCtrl = new UntypedFormControl(null);
  defaultDisplayedColumns = [
    {
      name: 'Document Name',
      colName: 'documentName',
      filterName: 'documentNameFilter',
    },
    {
      name: 'Type',
      colName: 'type',
      filterName: 'typeFilter',
    },
    {
      name: 'Upload Date',
      colName: 'uploadDate',
      filterName: 'uploadDateFilter',
    },
    {
      name: 'Action',
      colName: 'action',
      filterName: 'actionFilter',
    },
  ];

  displayedColumns: any[] = [];
  filterColumns: any[] = [];
  tempDraggableColumnFilter: any = [];
  tempDraggableColumn: any = [];
  latestSelectedColumn: any = null;
  tempColumnListTable: any = [];
  conditionalGraphqlField = {
    documentName: true,
    type: true,
    uploadDate: true,
  };

  constructor(
    private translate: TranslateService,
    private studentsService: StudentsService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private utilService: UtilityService,
    private acadService: AcademicKitService,
    private dialog: MatDialog,
    private pageTitleService: PageTitleService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.updatePageTitle();
    this.getTableData();
    this.initFilter();
    this.dropdownType();
  }
  ngOnChanges() {
    // Get Data User Login
    this.currentUser = this.authService?.getLocalStorageUser();
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

    this.selectionChangesColumn();
  }

  updatePageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('Student Card Documents'));
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(this.translate.instant('Student Card Documents'));
    });
  }
  dropdownType() {
    if (this.documentTypeFilter.value && this.dropdownDocumentType.length) {
      const find = this.dropdownDocumentType.find((type) => type.name === this.documentTypeFilter.value);
      this.dropdownDocumentType = this.dataDocumentType.map((type) => {
        return { value: type.value, name: this.translate.instant(type.value) };
      });
      this.dropdownDocumentType = this.dropdownDocumentType.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
      if (find) {
        this.documentTypeFilter.patchValue(this.translate.instant(find.value));
      } else {
        this.documentTypeFilter.patchValue(null);
      }
    } else {
      this.dropdownDocumentType = this.dataDocumentType.map((type) => {
        return { value: type.value, name: this.translate.instant(type.value) };
      });
      this.dropdownDocumentType = this.dropdownDocumentType.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
      this.filteredDocumentType = of(this.dropdownDocumentType);
    }
  }
  getTableData() {
    const pagination = {
      limit: this.paginator && this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator && this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.isWaitingForResponse = true;
    this.checkConditionalGraphql();
    this.checkFilterAndSorting();
    const lang = this.translate.currentLang.toLowerCase();
    this.subs.sink = this.studentsService
      .getAllMydocument(pagination, this.conditionalGraphqlField, this.candidateId, this.filteredValues, this.sortValue, this.type, lang)
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
        (err) => (this.isWaitingForResponse = false),
      );
  }
  resetSelection() {
    this.paginator.pageIndex = 0;
    this.documentNameFilter.setValue('', { emitEvent: false });
    this.uploadDateFilter.setValue(null, { emitEvent: false });
    this.documentTypeFilter.setValue(null, { emitEvent: false });
    this.filteredValues = {
      // type_of_document: null,
      date: null,
      document_name: null,
    };
    this.type = [
      'admission_document',
      'proof_of_payment',
      'manual_document',
      'one_time_form',
      'student_admission',
      'fc_contract',
      'visa_document',
      'emancipated_document_proof',
    ];
    this.sortValue = null;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.tempDraggableColumn = [];
    this.tempDraggableColumnFilter = [];
    this.checkTemplateTable();
    this.dropdownDocumentType = this.dataDocumentType.map((type) => {
      return { value: type.value, name: this.translate.instant(type.value) };
    });
    this.dropdownDocumentType = this.dropdownDocumentType.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    this.filteredDocumentType = of(this.dropdownDocumentType);
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
        const fitlerDate = moment(dueDate).format('DD/MM/YYYY');
        this.filteredValues.date = fitlerDate;
        this.getTableData();
      }
    });
    this.subs.sink = this.documentTypeFilter.valueChanges.subscribe((type) => {
      if (type) {
        if (this.dropdownDocumentType.length) {
          let filteredDocumentTypes = this.dropdownDocumentType.filter((document) =>
            this.utilService.simplifyRegex(document.name).includes(this.utilService.simplifyRegex(type)),
          );
          filteredDocumentTypes = filteredDocumentTypes.map((type) => {
            return { value: type.value, name: this.translate.instant(type.value) };
          });
          filteredDocumentTypes = filteredDocumentTypes.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
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
      this.type = [
        'admission_document',
        'proof_of_payment',
        'manual_document',
        'one_time_form',
        'student_admission',
        'fc_contract',
        'visa_document',
        'emancipated_document_proof',
      ];
      // this.filteredValues.type_of_document = null;
      this.getTableData();
    }
  }

  sortData(sort: Sort) {
    if (sort.active) {
      this.sortValue = sort.direction ? { [sort.active]: sort.direction } : null;
    } else {
      this.sortValue = null;
    }
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

  edit(doc) {
    this.subs.sink = this.dialog
      .open(AddStudentManualDocumentDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          type: 'edit',
          document: doc,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.getTableData();
        }
      });
  }

  async delete(doc) {
    if (doc._id) {
      const result = await Swal.fire({
        type: 'warning',
        title: this.translate.instant('CERTIFICATION_RULE.DELETE_DOCUMENT.TITLE'),
        text: this.translate.instant('CERTIFICATION_RULE.DELETE_DOCUMENT.TEXT', { DocumentName: doc.document_name }),
        showCancelButton: true,
        confirmButtonText: this.translate.instant('CERTIFICATION_RULE.DELETE_DOCUMENT.CONFIRMBTN'),
        cancelButtonText: this.translate.instant('CERTIFICATION_RULE.DELETE_DOCUMENT.CANCELBTN'),
        allowOutsideClick: false,
      });

      if (!result.value) {
        return;
      }

      this.isWaitingForResponse = true;
      this.subs.sink = this.acadService.deleteAcadDoc(doc._id).subscribe(
        (res) => {
          this.isWaitingForResponse = false;
          if (res) {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
            }).then(() => {
              this.getTableData();
            });
          }
        },
        (err) => {
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
  }

  onUploadDocument() {
    this.subs.sink = this.dialog
      .open(AddStudentManualDocumentDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          candidate_id: this.candidateId,
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

  defaultTemplateColumn() {
    this.columnCtrl.patchValue(this.defaultDisplayedColumns);
    this.updateColumn(this.defaultDisplayedColumns);
  }

  openColumnDropdown() {
    this.templateColumnRef.open();
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
      table_name: 'follow_up_student_card_tab_document',
      display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
      filter_column: _.cloneDeep(this.filterColumns),
    };
    this.createOrUpdateUserTableColumnSettings(table);
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
          table_name: 'follow_up_student_card_tab_document',
          display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
          filter_column: _.cloneDeep(this.filterColumns),
        };

        this.createOrUpdateUserTableColumnSettings(table);
        this.getTableData();
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
          table_name: 'follow_up_student_card_tab_document',
          display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
          filter_column: _.cloneDeep(this.filterColumns),
        };

        this.createOrUpdateUserTableColumnSettings(table);
        this.getTableData();
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
          table_name: 'follow_up_student_card_tab_document',
          display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
          filter_column: _.cloneDeep(this.filterColumns),
        };
        this.checkFilterAndSorting();
        this.resetFilterWhenUpdateColumn();

        this.createOrUpdateUserTableColumnSettings(table);
        this.getTableData();
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
            table_name: 'follow_up_student_card_tab_document',
            display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
            filter_column: _.cloneDeep(this.filterColumns),
          };
          this.checkFilterAndSorting();
          this.resetFilterWhenUpdateColumn();

          this.createOrUpdateUserTableColumnSettings(table);
          this.getTableData();
        } else {
          const dataFromLocalStorage = JSON.parse(localStorage.getItem('templateTable'));
          const documentTableTemplate = dataFromLocalStorage?.find((lcl) => lcl.table_name === 'follow_up_student_card_tab_document');
          if (documentTableTemplate) {
            const arrayType = this.utilService.checkArrayType(documentTableTemplate.display_column);
            const isArrayObj = arrayType === 'object' ? true : false;
            this.displayedColumns = documentTableTemplate.display_column?.map((col) => (isArrayObj ? col?.column_name : col));
            this.filterColumns = documentTableTemplate.filter_column;
            this.tempDraggableColumn = documentTableTemplate.display_column?.map((col) => (isArrayObj ? col?.column_name : col));
            this.tempDraggableColumnFilter = documentTableTemplate.filter_column;
            this.checkFilterAndSorting();
            this.resetFilterWhenUpdateColumn();
            this.getTableData();
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

  resetFilterWhenUpdateColumn() {
    this.isWaitingForResponse = true;
    this.dataSource.data = [];
  }

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
            const documentTableTemplate = dataFromLocalStorage.find((lcl) => lcl.table_name === 'follow_up_student_card_tab_document');
            // *************** If condition meet it will reorder based on value that stored in local storage
            if (documentTableTemplate) {
              const arrayType = this.utilService.checkArrayType(documentTableTemplate?.display_column);
              const isArrayObj = arrayType === 'object' ? true : false;
              this.displayedColumns = documentTableTemplate?.display_column?.map((col) => (isArrayObj ? col?.column_name : col));
              this.filterColumns = documentTableTemplate.filter_column;
              const filterValue = [];

              const displayColumns = documentTableTemplate?.display_column?.map((col) => (isArrayObj ? col?.column_name : col));
              displayColumns.forEach((resp) => {
                const findIndex = this.defaultDisplayedColumns.findIndex((def) => def.colName === resp);
                if (findIndex !== -1) {
                  filterValue.push(this.defaultDisplayedColumns[findIndex]);
                }
              });
              this.resetFilterWhenUpdateColumn();
              this.columnCtrl.patchValue(filterValue);
              // Get Data student
              this.getTableData();
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

          // ************ get data table document when reset button
          this.selectedDocumentType('All');
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
              case 'type':
                this.type = [
                  'admission_document',
                  'proof_of_payment',
                  'manual_document',
                  'one_time_form',
                  'student_admission',
                  'fc_contract',
                  'emancipated_document_proof',
                ];
                this.latestSelectedColumn = null;
                this.documentTypeFilter.setValue(null, { emitEvent: false });

                if (this.sortValue?.type_of_document) {
                  this.sortValue = null;
                  this.sort.direction = '';
                  this.sort.active = '';
                }
                break;
              case 'uploadDate':
                this.filteredValues.date = null;
                this.latestSelectedColumn = null;
                this.uploadDateFilter.setValue(null, { emitEvent: false });
                if (this.sortValue?.date) {
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

  checkConditionalGraphql() {
    // ************ temporary fix. the data not displayed when this component rendered for the first time.
    this.conditionalGraphqlField = {
      documentName: true,
      type: true,
      uploadDate: true,
    };

    const actionFound = this.displayedColumns.includes('action');
    if (actionFound) {
      this.conditionalGraphqlField = {
        documentName: true,
        type: true,
        uploadDate: true,
      };
    } else {
      this.displayedColumns.forEach((col) => {
        if (col) {
          this.conditionalGraphqlField[col] = true;
        }
      });
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
