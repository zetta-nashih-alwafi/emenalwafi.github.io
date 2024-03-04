import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AddTemplateDialogComponent } from 'app/notification-management/notification-details/notification-identity/add-template-dialog/add-template-dialog.component';
import { NotificationManagementService } from 'app/notification-management/notification-management.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { DocumentIntakeBuilderService } from 'app/service/document-intake-builder/document-intake-builder.service';
import { error } from 'console';

@Component({
  selector: 'ms-add-attachment-dialog',
  templateUrl: './add-attachment-dialog.component.html',
  styleUrls: ['./add-attachment-dialog.component.scss'],
})
export class AddAttachmentDialogComponent implements OnInit {
  private subs = new SubSink();
  documentBuilderForm = new UntypedFormControl(null);

  uploadedFile = [];
  uploadedFileIds = new Set<string>();

  documentList;
  isWaitingForResponse = false;

  maxWidth;
  maxFormWidth;

  @ViewChild('handlePdf', { static: false }) currentFile: any;

  constructor(
    public dialogRef: MatDialogRef<AddTemplateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translate: TranslateService,
    private notificationService: NotificationManagementService,
    private fileUploadService: FileUploadService,
    private documentService: DocumentIntakeBuilderService,
  ) {}

  ngOnInit() {
    this.widthDecide();
    this.getAllDocumentBuilders();
  }

  widthDecide() {
    if (this.translate.currentLang === 'fr') {
      this.maxWidth = 900;
      this.maxFormWidth = 460;
    } else {
      this.maxWidth = 600;
      this.maxFormWidth = 320;
    }
  }

  onFileChange($event) {
    const [file] = $event?.target?.files;

    if (file) {
      const allowedFileTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png',
        'image/jpeg',
        'image/jpg',
      ];

      const maxSizeInBytes = 100 * 1024 * 1024; // 100 MB

      if (!allowedFileTypes.includes(file.type)) {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('Attachment_FTS.TITLE'),
          text: this.translate.instant('Attachment_FTS.TEXT'),
          confirmButtonText: this.translate.instant('Attachment_FTS.BUTTON'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        });
      } else if (file.size > maxSizeInBytes) {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('Attachment_FSS.TITLE'),
          text: this.translate.instant('Attachment_FSS.TEXT'),
          confirmButtonText: this.translate.instant('Attachment_FSS.BUTTON'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        });
      } else {
        this.isWaitingForResponse = true;
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (resp) => {
            if (resp) {
              const tempUploaded = {
                document_builder_id: null,
                filename: resp?.file_name,
                s3_file_name: resp?.s3_file_name,
                document_type: 'file_uploads',
              };

              this.uploadedFile.push(tempUploaded);
            }
            this.isWaitingForResponse = false;
          },
          (err) => {
            this.isWaitingForResponse = false;
          },
        );
      }
    }
    this.resetFileState();
  }

  resetFileState() {
    this.currentFile.nativeElement.value = '';
  }

  onRemove(index, attachment) {
    if (attachment?.document_builder_id) {
      this.uploadedFileIds.delete(attachment?.document_builder_id);
      const newValue = [...this.uploadedFileIds];
      this.documentBuilderForm.setValue(newValue, { emitEvent: false });
    }
    this.uploadedFile.splice(index, 1);
  }

  getAllDocumentBuilders() {
    const filter = {
      status: true,
      hide_form: false,
    };
    this.subs.sink = this.documentService.getAllDocumentsDropdown(filter).subscribe((resp) => {
      if (resp) {
        const tempDocumentBuilder = resp
          .sort((a, b) => a.document_builder_name.localeCompare(b.document_builder_name, undefined, { caseFirst: 'lower' }))
          .map((document) => ({
            document_builder_id: document?._id,
            filename: document?.document_builder_name,
            s3_file_name: null,
            document_type: 'document_builder',
          }));

        if (this.data?.attachments?.length) {
          this.documentList = tempDocumentBuilder?.filter((document) => {
            return !this.data?.attachments?.some((attach) => document?.document_builder_id === attach?.document_builder_id?._id);
          });
        } else {
          this.documentList = tempDocumentBuilder;
        }
      }
    });
  }

  setDocumentBuilder() {
    // Access the selected items using ngModel
    const selectedItems = this.documentBuilderForm?.value;

    // Identify items to add and remove
    const itemsToAdd = selectedItems?.filter((selectedItemId: string) => !this.uploadedFileIds?.has(selectedItemId));
    const itemsToRemove = Array?.from(this.uploadedFileIds)?.filter((uploadedFileId: string) => !selectedItems?.includes(uploadedFileId));
    // Add new items to Set
    itemsToAdd?.forEach((id: string) => this.uploadedFileIds?.add(id));

    // Remove items from Set
    itemsToRemove?.forEach((id: string) => this.uploadedFileIds?.delete(id));

    // Update selectedDocuments array based on the Set order
    const newItems = Array?.from(this.uploadedFileIds, (id) => {
      const existingItem = this.uploadedFile?.find((item) => item?.document_builder_id === id);

      if (!existingItem) {
        const newItem = this.documentList?.find((item) => item?.document_builder_id === id);
        return newItem;
      }

      return null; // Return null for items that are already in the array
    }).filter((item) => item !== null);

    // Merge the new items with the existing ones from another source
    const tempUploadedFile = [...this.uploadedFile, ...newItems];

    if (itemsToRemove?.length) {
      this.uploadedFile = tempUploadedFile?.filter((item) => !itemsToRemove?.includes(item?.document_builder_id));
    } else {
      this.uploadedFile = tempUploadedFile;
    }
  }

  isAllDropdownSelected(type) {
    if (type === 'documentBuilder') {
      const selected = this.documentBuilderForm.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.documentList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'documentBuilder') {
      const selected = this.documentBuilderForm.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.documentList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'documentBuilder') {
      if (event.checked) {
        const type = this.documentList?.map((el) => el?.document_builder_id);
        this.documentBuilderForm.patchValue(type, { emitEvent: false });
      } else {
        this.documentBuilderForm.patchValue(null, { emitEvent: false });
      }
    }
  }

  createPayload() {
    const origin = _.cloneDeep(this.data?.attachments);
    const newAttachments = _.cloneDeep(this.uploadedFile);
    let merged;
    if (origin?.length) {
      const mappedOrigin = origin.map((attachment) => ({
        document_builder_id: attachment?.document_builder_id?._id ? attachment.document_builder_id._id : null,
        filename: attachment?.filename,
        s3_file_name: attachment?.s3_file_name ? attachment?.s3_file_name : null,
        document_type: attachment?.document_type,
      }));
      merged = [...mappedOrigin, ...newAttachments];
    } else {
      merged = newAttachments;
    }

    const finalResult = {
      attachments: merged,
    };
    return finalResult;
  }

  onValidate() {
    if (!this.uploadedFile?.length) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Attachment_VES.TITLE'),
        text: this.translate.instant('Attachment_VES.TEXT'),
        confirmButtonText: this.translate.instant('Attachment_VES.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      return;
    }
    const payload = this.createPayload();

    this.isWaitingForResponse = true;
    this.subs.sink = this.notificationService.updateNotificationTemplate(this.data?.template_id, payload).subscribe((resp) => {
      if (resp) {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((swalResp) => {
          this.closeDialog(true);
        });
      }
      this.isWaitingForResponse = false;
    });
  }

  closeDialog(resp?) {
    this.dialogRef.close(resp);
  }
}
