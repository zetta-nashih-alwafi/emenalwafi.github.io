import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
// import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { SpeechToTextDialogComponent } from 'app/shared/components/speech-to-text-dialog/speech-to-text-dialog.component';
import { environment } from 'environments/environment';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-internship-profile-tab',
  templateUrl: './internship-profile-tab.component.html',
  styleUrls: ['./internship-profile-tab.component.scss'],
})
export class InternshipProfileComponent implements OnInit {
  public Editor = DecoupledEditor;
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  @ViewChild('fileUploadDocLetter', { static: false }) fileUploaderDocLetter: ElementRef;
  translatePipe: TranslatePipe;
  @Input() candidate;
  pdfIcon = '../../../assets/img/pdf.png';
  uploadCV = [{ name: 'capture', s3_file_name: '1' }];
  private subs = new SubSink();
  imageLetter = [{ name: 'capture', s3_file_name: '1' }];

  constructor(
    public translate: TranslateService,
    private fileUploadService: FileUploadService,
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private utilService: UtilityService,
  ) {}

  ngOnInit() {}
  openUploadWindow() {
    this.fileUploaderDoc.nativeElement.click();
  }

  uploadFile(fileInput: Event) {
    const file = (<HTMLInputElement>fileInput.target).files[0];
    console.log(file);

    // *************** Accept Reject File Upload outside allowed accept
    const acceptable = ['pdf'];
    const fileType = this.utilService.getFileExtension(file.name);
    console.log(fileType);
    if (acceptable.includes(fileType)) {
      // this.file = (<HTMLInputElement>fileInput.target).files[0];
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe((resp) => {
        if (resp) {
          const data = {
            name: 'Capture - ' + (this.uploadCV.length ? this.uploadCV.length + 1 : '1'),
            s3_file_name: resp.s3_file_name,
          };
          this.uploadCV.push(data);
        }
      }, (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      });
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
  openUploadWindowLetter() {
    this.fileUploaderDocLetter.nativeElement.click();
  }

  uploadFileLetter(fileInput: Event) {
    const file = (<HTMLInputElement>fileInput.target).files[0];
    console.log(file);

    // *************** Accept Reject File Upload outside allowed accept
    const acceptable = ['pdf'];
    const fileType = this.utilService.getFileExtension(file.name);
    console.log(fileType);
    if (acceptable.includes(fileType)) {
      // this.file = (<HTMLInputElement>fileInput.target).files[0];
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe((resp) => {
        if (resp) {
          const data = {
            name: 'Capture - ' + (this.imageLetter.length ? this.imageLetter.length + 1 : '1'),
            s3_file_name: resp.s3_file_name,
          };
          this.imageLetter.push(data);
        }
      }, (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      });
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

  openImage(img) {
    if (img === '1') {
      const url = 'https://api.admission.zetta-demo.space/fileuploads/dummy.pdf';
      window.open(url, '_blank');
    } else {
      const url = `${environment.apiUrl}/fileuploads/${img}`.replace('/graphql', '');
      window.open(url, '_blank');
    }
  }
  resetImage() {
    this.uploadCV = [];
  }
  resetImageLetter() {
    this.imageLetter = [];
  }
  openVideo(url) {
    window.open(url, '_blank');
  }
  createStudentProfile() {
    window.open('./student-profile-internship/create', '_blank');
  }
}
