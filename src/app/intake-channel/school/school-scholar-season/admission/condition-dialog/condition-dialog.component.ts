import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-condition-dialog',
  templateUrl: './condition-dialog.component.html',
  styleUrls: ['./condition-dialog.component.scss'],
})
export class ConditionDialogComponent implements OnInit, OnDestroy {
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
    public dialogRef: MatDialogRef<ConditionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public parentData,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private utilService: UtilityService,
    private fileUploadService: FileUploadService,
    private intakeService: IntakeChannelService,
    private authService:AuthService
  ) {}

  ngOnInit() {
    console.log(this.parentData);
    this.initUploadDocForm();
    if (
      this.parentData &&
      this.parentData.length === 1 &&
      this.parentData[0].admission_document &&
      this.parentData[0].admission_document.document_name &&
      this.parentData[0].admission_document.s3_file_name
    ) {
      this.uploadDocForm.patchValue(this.parentData[0].admission_document);
    }
    this.firstForm = _.cloneDeep(this.uploadDocForm.value);
  }

  initUploadDocForm() {
    this.uploadDocForm = this.fb.group({
      document_name: ['', Validators.required],
      s3_file_name: [''],
    });
  }

  closeDialog() {
    console.log(this.uploadDocForm.value);
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
    if (this.parentData && this.parentData.isUpdate && this.parentData.document && this.parentData.document.s3_file_name) {
      this.uploadDocForm.get('s3_file_name').setValue(this.parentData.document.s3_file_name);
    }
  }

  uploadSubmitFlyer() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.fileUploadService.singleUpload(this.selectedFile).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.s3_file_name) {
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
      (error) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(error)
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  submitFlyer() {
    this.isWaitingForResponse = true;
    const payload = {
      admission_document: this.uploadDocForm.value,
    };
    console.log('payload', payload);
    if (this.parentData && this.parentData.length === 1) {
      let id;
      if (this.parentData[0]._id) {
        id = this.parentData[0]._id;
      }
      this.intakeService.updateProgram(id, payload).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close(this.uploadDocForm.value);
            });
          }
          return;
        },
        (error) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(error)
          if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
              text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translate.instant('OK'),
            });
          }
        },
      );
    } else {
      const temp = _.cloneDeep(this.parentData);
      let program_ids = [];
      if (temp && temp.length) {
        temp.forEach((element) => {
          program_ids.push(element._id.toString());
        });
      }
      console.log(program_ids);
      this.intakeService.updatePrograms(program_ids, payload).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close(this.uploadDocForm.value);
            });
          }
          return;
        },
        (error) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(error)
          if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
              text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translate.instant('OK'),
            });
          }
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
