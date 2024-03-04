import { Component, OnInit, OnDestroy, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { AcademicKitService } from 'app/service/rncpTitles/academickit.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-add-teacher-manual-document-dialog',
  templateUrl: './add-teacher-manual-document-dialog.component.html',
  styleUrls: ['./add-teacher-manual-document-dialog.component.scss'],
})
export class AddTeacherManualDocumentDialogComponent implements OnInit, OnDestroy {
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  uploadDocForm: FormGroup;
  selectedFile: File;
  isWaitingForResponse = false;
  firstForm: any;

  private subs = new SubSink();

  fileTypesControl = new FormControl('');
  fileTypes = [];
  selectedFileType = '';
  selectedMaxSize = 0;

  constructor(
    public dialogRef: MatDialogRef<AddTeacherManualDocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public parentData,
    private fb: FormBuilder,
    private translate: TranslateService,
    private utilService: UtilityService,
    private fileUploadService: FileUploadService,
    private acadKitService: AcademicKitService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // console.log(this.parentData);
    this.initUploadDocForm();
    if (this.parentData && this.parentData.type === 'edit' && this.parentData.data) {
      this.uploadDocForm.patchValue({
        name: this.parentData.data.document_name ? this.parentData.data.document_name : '',
        s3_file_name: this.parentData.data.s3_file_name ? this.parentData.data.s3_file_name : null,
      });
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
    // console.log(this.uploadDocForm.value);
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
  }

  uploadSubmitFlyer() {
    if (this.parentData.type === 'edit' && !this.fileUploaderDoc.nativeElement.value) {
      this.submitFlyer();
    } else {
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
          // console.log('err', err);
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
  }

  submitFlyer() {
    this.isWaitingForResponse = true;
    const payload = {
      document_name: this.uploadDocForm.get('name').value,
      type_of_document: 'manual_document',
      s3_file_name: this.uploadDocForm.get('s3_file_name').value,
      uploaded_for_other_user: this.parentData.teacher_id,
    };
    if (this.parentData && this.parentData.type === 'edit' && this.parentData.data && this.parentData.data._id) {
      this.subs.sink = this.acadKitService.updateAcadDoc(this.parentData.data._id, payload).subscribe(
        (res) => {
          this.isWaitingForResponse = false;
          if (res) {
            this.dialogRef.close(this.uploadDocForm.value);
          }
          return;
        },
        (err) => {
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    } else {
      this.subs.sink = this.acadKitService.createAcadDoc(payload).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            this.dialogRef.close(this.uploadDocForm.value);
          }
          return;
        },
        (err) => {
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
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
