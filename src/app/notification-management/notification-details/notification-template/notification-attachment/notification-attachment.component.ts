import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { UntypedFormControl } from '@angular/forms';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { NotificationManagementService } from 'app/notification-management/notification-management.service';
import { AddAttachmentDialogComponent } from './add-attachment-dialog/add-attachment-dialog.component';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import Swal from 'sweetalert2';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'ms-notification-attachment',
  templateUrl: './notification-attachment.component.html',
  styleUrls: ['./notification-attachment.component.scss'],
})
export class NotificationAttachmentComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();
  @Input() templateId: any;
  isFileInZip = false;
  attachments = [];

  displayedColumns: string[] = ['select', 'documentName', 'documentType', 'fileExtension', 'action'];
  filterColumns: string[] = ['selectFilter', 'documentNameFilter', 'documentTypeFilter', 'fileExtensionFilter', 'actionFilter'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  dataCount = 0;
  noData: any;
  isReset = false;

  sortValue = null;
  filterValues = {
    filename: null,
    document_type: null,
    file_extension: null,
  };
  documentNameFilter = new UntypedFormControl(null);
  documentTypeFilter = new UntypedFormControl(null);
  fileExtensionFilter = new UntypedFormControl(null);

  fileInZipControl = new UntypedFormControl(null);

  dataSelected = [];
  isCheckedAll = false;
  dataUnselected = [];
  buttonClicked = '';

  documentTypes = [];

  fileExtensions = [];

  timeOutVal: any;

  isWaitingForResponse = false;
  isLoading = false;

  constructor(
    public dialog: MatDialog,
    private notificationService: NotificationManagementService,
    private translate: TranslateService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initFilter();
    this.getDocumentTypeDropdown();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getDocumentTypeDropdown();
    });
  }

  getOneTemplate() {
    if (this.templateId) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.notificationService.getOneTemplate(this.templateId).subscribe((res) => {
        if (res) {
          this.attachments = _.cloneDeep(res?.attachments);
          this.isFileInZip = res.is_attach_file_in_zip ? true : false;
        }
        this.getAllAttachmentDocument();
        this.isWaitingForResponse = false;
      });
    }
  }

  ngAfterViewInit(): void {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getOneTemplate();
          }
        }),
      )
      .subscribe();
  }

  initFilter() {
    this.subs.sink = this.documentNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((resp) => {
      this.filterValues.filename = resp;
      if (!this.isReset) {
        this.getAllAttachmentDocument();
      }
    });
  }

  getAllAttachmentDocument() {
    this.isWaitingForResponse = true;

    const dataSet = _.cloneDeep(this.attachments);
    const pagination = {
      limit: this.paginator && this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator && this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();

    if (dataSet?.length) {
      dataSet.reverse();
    }

    this.subs.sink = this.notificationService.getAllAttachmentsData(dataSet, pagination, filter, this.sortValue).subscribe((resp) => {
      if (resp?.length) {
        this.dataSource.data = _.cloneDeep(resp);
        this.paginator.length = resp[0].count_document;
        this.dataCount = resp[0].count_document;
        this.getFileExtensionDropdown(resp);
      } else {
        this.fileExtensions = [];
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.dataCount = 0;
      }
      this.fileInZipControl.setValue(this.isFileInZip);
      this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
      this.isReset = false;
      this.isWaitingForResponse = false;
    });
  }

  getDocumentTypeDropdown() {
    this.documentTypes = [
      { key: this.translate.instant('Notification management.Document builder'), value: 'document_builder' },
      { key: this.translate.instant('Notification management.File uploads'), value: 'file_uploads' },
    ];
  }

  getFileExtensionDropdown(data) {
    if (this.attachments?.length) {
      const updatedData = this.attachments
        ?.map((item) => ({
          key: item?.document_type !== 'document_builder' ? item?.filename?.substring(item?.filename.lastIndexOf('.')) : null,
          value: item?.document_type !== 'document_builder' ? item?.filename?.substring(item?.filename.lastIndexOf('.')) : null,
        }))
        ?.filter((extension) => extension.key !== null);

      if (updatedData?.length) {
        this.fileExtensions = _.chain(updatedData)
          .uniqBy('key') // Use uniqBy with the 'key' property as the unique identifier
          .sort((a, b) => a.key.localeCompare(b.key))
          .value();
      } else {
        if (this.filterValues?.file_extension?.length) {
          this.filterValues.file_extension = null;
          this.fileExtensionFilter.setValue(null, { emitEvent: false });
        }
        this.fileExtensions = [];
      }
    }
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filterValues);
    Object.keys(filterData).forEach((key) => {
      if (!filterData[key]?.length) {
        delete filterData[key];
      }
    });
    return filterData;
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active && sort.direction ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.getAllAttachmentDocument();
    }
  }

  setDocumentTypeFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.filterValues?.document_type) === JSON.stringify(this.documentTypeFilter?.value);
    if (isSame) {
      return;
    } else if (this.documentTypeFilter?.value?.length) {
      this.filterValues.document_type = this.documentTypeFilter?.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllAttachmentDocument();
      }
    } else {
      if (this.filterValues?.document_type?.length && !this.documentTypeFilter?.value?.length) {
        this.filterValues.document_type = this.documentTypeFilter?.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllAttachmentDocument();
        }
      } else {
        return;
      }
    }
  }

  setFileExtensionFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.filterValues?.file_extension) === JSON.stringify(this.fileExtensionFilter?.value);
    if (isSame) {
      return;
    } else if (this.fileExtensionFilter?.value?.length) {
      this.filterValues.file_extension = this.fileExtensionFilter?.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllAttachmentDocument();
      }
    } else {
      if (this.filterValues?.file_extension?.length && !this.fileExtensionFilter?.value?.length) {
        this.filterValues.file_extension = this.fileExtensionFilter?.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllAttachmentDocument();
        }
      } else {
        return;
      }
    }
  }

  isAllDropdownSelected(type) {
    if (type === 'documentType') {
      const selected = this.documentTypeFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.documentTypes.length;
      return isAllSelected;
    } else if (type === 'fileExtension') {
      const selected = this.fileExtensionFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.fileExtensions.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'documentType') {
      const selected = this.documentTypeFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.documentTypes.length;
      return isIndeterminate;
    } else if (type === 'fileExtension') {
      const selected = this.fileExtensionFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.fileExtensions.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'documentType') {
      if (event.checked) {
        const type = this.documentTypes?.map((el) => el.value);
        this.documentTypeFilter.patchValue(type, { emitEvent: false });
      } else {
        this.documentTypeFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'fileExtension') {
      if (event.checked) {
        const type = this.fileExtensions?.map((el) => el.value);
        this.fileExtensionFilter.patchValue(type, { emitEvent: false });
      } else {
        this.fileExtensionFilter.patchValue(null, { emitEvent: false });
      }
    }
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  isSomeSelected() {
    return this.selection.selected.length > 0;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.isCheckedAll = false;
      this.dataUnselected = [];
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.isCheckedAll = true;
      this.dataUnselected = [];
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselected.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
    }
  }

  showOptions(info, row) {
    if (this.isCheckedAll) {
      if (row) {
        if (!this.dataUnselected.includes(row._id)) {
          this.dataUnselected.push(row._id);
          this.selection.deselect(row._id);
        } else {
          const indx = this.dataUnselected.findIndex((list) => list === row._id);
          this.dataUnselected.splice(indx, 1);
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
  }

  resetTable() {
    this.isReset = true;

    this.sortValue = null;
    this.sort.direction = '';
    this.sort.active = '';

    this.filterValues = {
      filename: null,
      document_type: null,
      file_extension: null,
    };

    this.documentNameFilter.setValue(null, { emitEvent: false });
    this.documentTypeFilter.setValue(null, { emitEvent: false });
    this.fileExtensionFilter.setValue(null, { emitEvent: false });

    this.paginator.pageIndex = 0;

    this.getOneTemplate();
  }

  onAddAttachment() {
    this.subs.sink = this.dialog
      .open(AddAttachmentDialogComponent, {
        panelClass: 'no-padding-pop-up',
        disableClose: true,
        data: {
          template_id: this.templateId,
          attachments: this.attachments,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getOneTemplate();
        }
      });
  }

  onDownloadAttachment(attach) {
    const fileUrl = attach?.s3_file_name;
    if (!fileUrl) {
      return;
    }
    const link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.download = fileUrl;
    link.href = `${environment.apiUrl}/fileuploads/${fileUrl}?download=true`.replace('/graphql', '');
    link.target = '_blank';
    link.click();
    link.remove();
  }

  onViewAttachment(attach) {
    const query = {
      templateId: attach?.document_builder_id?._id ?? attach?.document_builder_id ?? null,
    };
    const url = this.router.createUrlTree(['document-builder/document-template'], { queryParams: query });
    window.open(url.toString(), '_blank');
  }

  createPayload() {
    const origin = _.cloneDeep(this.attachments);
    let merged;
    let finalResult;
    if (origin?.length) {
      const mappedOrigin = origin.map((attachment) => ({
        document_builder_id: attachment?.document_builder_id?._id ? attachment.document_builder_id._id : null,
        filename: attachment?.filename,
        s3_file_name: attachment?.s3_file_name ? attachment?.s3_file_name : null,
        document_type: attachment?.document_type,
      }));
      merged = mappedOrigin;
      finalResult = {
        attachments: merged,
      };
    } else {
      finalResult = {
        attachments: null,
      };
    }
    return finalResult;
  }

  onRemoveAttachment(attach) {
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('Attachment_RS.TITLE'),
      html: this.translate.instant('Attachment_RS.TEXT', { attachment_name: attach?.filename }),
      confirmButtonText: this.translate.instant('Attachment_RS.BUTTON1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('Attachment_RS.BUTTON2'),
      showCancelButton: true,
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: true,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('Attachment_RS.BUTTON1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('Attachment_RS.BUTTON1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((result) => {
      clearTimeout(this.timeOutVal);
      if (result.value) {
        const index = this.attachments.findIndex((attahcment) => attahcment?._id === attach?._id);
        this.attachments?.splice(index, 1);
        const payload = this.createPayload();

        this.isLoading = true;
        this.subs.sink = this.notificationService.updateNotificationTemplate(this.templateId, payload).subscribe((resp) => {
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Attachment_RSS.TITLE'),
              text: this.translate.instant('Attachment_RSS.TEXT'),
              confirmButtonText: this.translate.instant('Attachment_RSS.BUTTON'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((swalResp) => {
              this.isLoading = false;
              this.getOneTemplate();
            });
          }
        });
      }
    });
  }

  onSetFileInZip(event: MatSlideToggleChange) {
    const payload = {
      is_attach_file_in_zip: event?.checked,
    };

    this.isLoading = true;
    this.subs.sink = this.notificationService.updateNotificationTemplate(this.templateId, payload).subscribe((resp) => {
      if (resp) {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((resp) => {
          this.isFileInZip = payload?.is_attach_file_in_zip;
          this.isLoading = false;
          this.getOneTemplate();
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
