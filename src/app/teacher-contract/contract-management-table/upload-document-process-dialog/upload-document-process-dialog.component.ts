import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  templateUrl: './upload-document-process-dialog.component.html',
  styleUrls: ['./upload-document-process-dialog.component.scss'],
})
export class UploadDocumentProcessDialogComponent implements OnInit, OnDestroy {
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  uploadDocForm: UntypedFormGroup;
  selectedFile: File;
  isWaitingForResponse = false;
  firstForm: any;

  private subs = new SubSink();

  fileTypesControl = new UntypedFormControl('');
  fileTypes = [];
  selectedFileType = '';
  selectedMaxSize = 0;

  constructor(
    public dialogRef: MatDialogRef<UploadDocumentProcessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public parentData,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private utilService: UtilityService,
    private fileUploadService: FileUploadService,
    private contractService: TeacherContractService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // console.log(this.parentData);
    this.initUploadDocForm();
    if (this.parentData && this.parentData && this.parentData.additional_documents && this.parentData.additional_documents.length) {
      const payload = {
        name: this.parentData.additional_documents[0].name,
        s3_file_name: this.parentData.additional_documents[0].s3_file_name,
      };
      this.uploadDocForm.patchValue(payload);
    }
    this.firstForm = _.cloneDeep(this.uploadDocForm.value);
  }

  initUploadDocForm() {
    this.uploadDocForm = this.fb.group({
      name: ['', Validators.required],
      s3_file_name: [''],
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  openUploadWindow() {
    this.fileUploaderDoc.nativeElement.click();
    this.selectedMaxSize = 0;
  }

  addFile(fileInput: Event) {
    const acceptable = ['pdf'];
    const file = (<HTMLInputElement>fileInput.target).files[0];
    const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
    if (acceptable.includes(fileType)) {
      const tempFile = (<HTMLInputElement>fileInput.target).files[0];
      if (this.utilService.countFileSize(tempFile, this.selectedMaxSize)) {
        this.selectedFile = (<HTMLInputElement>fileInput.target).files[0];
        this.uploadDocForm.get('s3_file_name').setValue(this.selectedFile.name);
      } else {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('UPLOAD_RESTRICT_TO_FILESIZE_File.TITLE'),
          html: this.translate.instant('UPLOAD_RESTRICT_TO_FILESIZE_File.TEXT', { size: this.selectedMaxSize }),
          confirmButtonText: this.translate.instant('UPLOAD_RESTRICT_TO_FILESIZE_File.BUTTON'),
          allowOutsideClick: false,
        });
      }
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
        text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.pdf' }),
        allowEscapeKey: false,
        allowOutsideClick: false,
        allowEnterKey: false,
      });
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.fileUploaderDoc.nativeElement.value = null;
    this.uploadDocForm.get('s3_file_name').setValue('');
    if (this.parentData && this.parentData && this.parentData.additional_documents && this.parentData.additional_documents.length) {
      this.uploadDocForm.get('s3_file_name').setValue(this.parentData.additional_documents[0].s3_file_name);
    }
  }

  uploadSubmitFlyer() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.fileUploadService.singleUpload(this.selectedFile).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.uploadDocForm.get('s3_file_name').setValue(resp.s3_file_name);
          this.submitFlyer();
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            allowOutsideClick: false,
            confirmButtonText: this.translate.instant('ok'),
          });
        }
      },
      (err) => {
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

  submitFlyer() {
    this.isWaitingForResponse = true;
    const payload = {
      additional_documents: [this.uploadDocForm.value],
    };
    this.contractService.updateContractProcess(this.parentData._id, payload).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.dialogRef.close(this.uploadDocForm.value);
        }
        return;
      },
      (err) => {
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
        }
      },
    );
  }

  isUploadedNewFile() {
    return this.selectedFile || !this.uploadDocForm.get('s3_file_name').value;
  }

  isUploadedFileExist() {
    let exis = false;
    if (this.selectedFile || this.uploadDocForm.get('s3_file_name').value) {
      exis = true;
    }
    return exis;
  }
  comparison() {
    const firstForm = JSON.stringify(this.firstForm);
    const form = JSON.stringify(this.uploadDocForm.value);
    if (firstForm === form) {
      return true;
    } else {
      if (this.isUploadedNewFile()) {
        return true;
      } else {
        return false;
      }
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
