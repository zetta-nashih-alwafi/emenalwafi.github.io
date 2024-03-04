import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { TeacherManagementService } from 'app/service/teacher-management/teacher-management.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-import-teacher-dialog',
  templateUrl: './import-teacher-dialog.component.html',
  styleUrls: ['./import-teacher-dialog.component.scss']
})
export class ImportTeacherDialogComponent implements OnInit {

  @ViewChild('importFile', { static: false }) importFile: any;

  importForm: UntypedFormGroup;
  file: File;
  fileType: any;
  isWaitingForResponse = false;
  templateDownloaded = false;
  scholars = [];
  dataSchoolOriginal;
  private subs = new SubSink();
  private timeOutVal: any;
  isFileUploaded = true;

  delimeter = [
    { key: 'COMMA [ , ]', value: ',' },
    { key: 'SEMICOLON [ ; ]', value: ';' },
    { key: 'TAB [ ]', value: 'tab' },
  ];

  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<ImportTeacherDialogComponent>,
    public translate: TranslateService,
    private utilService: UtilityService,
    private teacherManagementServive: TeacherManagementService,
    private userService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
  }

  handleInputChange(fileInput: Event) {
    this.isWaitingForResponse = true;
    const file = (<HTMLInputElement>fileInput.target).files[0];
    this.file = (<HTMLInputElement>fileInput.target).files[0];

    // *************** Accept Reject File Upload outside allowed accept
    const acceptable = ['csv', 'tsv'];
    const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
    if (acceptable.includes(fileType)) {
      this.isWaitingForResponse = false;
      this.isFileUploaded = true;
    } else {
      this.file = null;
      this.isWaitingForResponse = false;
      this.isFileUploaded = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
        text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.csv, .tsv' }),
        allowEscapeKey: false,
        allowOutsideClick: false,
        allowEnterKey: false,
      });
    }
  }

  openUploadWindow() {
    this.importFile.nativeElement.click();
  }



 submit(){
    // ************* Call api for import
    this.isWaitingForResponse = true;
    console.log('_file', this.file);
    if (this.file) {
      this.subs.sink = this.teacherManagementServive.ImportTeacherData(this.data.fileDelimiter, this.file).subscribe(
        (res) => {
          if (!res.is_error) {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Teacher_Import_S1.TITLE'),
              html: this.translate.instant('Teacher_Import_S1.TEXT', { numberTeachers: res.total_imported_teachers }),
              confirmButtonText: this.translate.instant('Teacher_Import_S1.BUTTON'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close(true);
            });
          } else {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('Oscar_S8_Import.TITLE'),
              html: this.translate.instant('Oscar_S8_Import.TEXT'),
              confirmButtonText: this.translate.instant('Oscar_S8_Import.BUTTON'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close(true);
            });
          }
        },
        (err) => {
          this.userService.postErrorLog(err)
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
  }


  resetValue() {
    this.templateDownloaded = false;
    this.file = null;
  }

  swalError(err) {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('SORRY'),
      text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
      confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}



