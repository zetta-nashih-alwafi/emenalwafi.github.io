import { AcademicKitService } from './../../../../service/rncpTitles/academickit.service';
import Swal from 'sweetalert2';
import { FileUploadService } from './../../../../service/file-upload/file-upload.service';
import { UtilityService } from './../../../../service/utility/utility.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SubSink } from 'subsink';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Inject } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'ms-add-student-manual-document-dialog',
  templateUrl: './add-student-manual-document-dialog.component.html',
  styleUrls: ['./add-student-manual-document-dialog.component.scss']
})
export class AddStudentManualDocumentDialogComponent implements OnInit, OnDestroy {
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
    public dialogRef: MatDialogRef<AddStudentManualDocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public parentData,
    private fb: FormBuilder,
    private translate: TranslateService,
    private utilService: UtilityService,
    private fileUploadService: FileUploadService,
    private acadKitService: AcademicKitService,
  ) {}

  ngOnInit() {
    console.log('PARENT DATA', this.parentData);
    this.initUploadDocForm();
    if (this.parentData.type === 'edit' && this.parentData.document) {
      this.uploadDocForm.patchValue({
        name: this.parentData.document.document_name || '',
        s3_file_name: this.parentData.document.s3_file_name || '',
      })
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
  }

  uploadSubmitFlyer() {
    this.isWaitingForResponse = true;
    if (this.parentData.type === 'edit' && !this.fileUploaderDoc.nativeElement.value) {
      this.submitFlyer();
    } else {
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
          this.isWaitingForResponse = false;
          console.log('err',err)
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
      candidate_id: this.parentData.candidate_id,
    };
    if (this.parentData.type === 'edit' && this.parentData.document && this.parentData.document._id) {
      console.log('MASUK EDIT COY', this.parentData)
      this.subs.sink = this.acadKitService.updateAcadDoc(this.parentData.document._id, payload).subscribe(
        (res) => {
          this.isWaitingForResponse = false;
          if (res) {
            this.dialogRef.close(this.uploadDocForm.value);
          }
          return;
        },
        (err) => {
          this.isWaitingForResponse = false
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      )
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
          this.isWaitingForResponse = false
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
