import { UtilityService } from 'app/service/utility/utility.service';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { ApplicationUrls } from 'app/shared/settings';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FinancesService } from 'app/service/finance/finance.service';

@Component({
  selector: 'ms-assign-legal-stamp-dialog',
  templateUrl: './assign-legal-stamp-dialog.component.html',
  styleUrls: ['./assign-legal-stamp-dialog.component.scss'],
})
export class AssignLegalStampDialogComponent implements OnInit, OnDestroy, AfterViewInit {
  fileFormGroup: UntypedFormGroup;
  private subs = new SubSink();
  @ViewChild('stampFileInput', { static: false }) stampFileInput: any;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  isWaitingForResponse = false;

  constructor(
    private utilService: UtilityService,
    private fileUploadService: FileUploadService,
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private financeService: FinancesService,
    @Inject(MAT_DIALOG_DATA) public parentData,
    public dialogRef: MatDialogRef<AssignLegalStampDialogComponent>,
  ) {}

  ngOnInit() {
    this.fileFormGroup = this.initAttachmentsForm();
    if (this.parentData?.legal_entity_stamp) {
      this.fileFormGroup?.get('legal_entity_stamp')?.setValue(this.parentData?.legal_entity_stamp);
    }
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  initAttachmentsForm() {
    return this.fb.group({
      legal_entity_stamp: [''],
    });
  }

  onFileChange(event) {
    const acceptable = ['png', 'jpg', 'jpeg'];
    const [file] = event.target.files;
    const fileType = this.utilService.getFileExtension(file?.name).toLowerCase();
    if (file && fileType && acceptable.includes(fileType)) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          this.fileFormGroup?.get('legal_entity_stamp').setValue(resp?.s3_file_name);
        },
        (err) => {
          this.isWaitingForResponse = false;
          console.log(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
    this.resetFileState();
  }

  resetFileState() {
    this.stampFileInput.nativeElement.value = '';
  }
  removeImage() {
    this.fileFormGroup.patchValue({
      legal_entity_stamp: '',
    });
  }

  previewFile() {
    window.open(this.serverimgPath + this.fileFormGroup.get('legal_entity_stamp').value, '_blank');
  }

  checkFormValidity(): boolean {
    if (this.fileFormGroup.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.fileFormGroup.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  validateLegalEntityStamp() {
    if (this.checkFormValidity()) {
      return;
    }
    const stampS3FileName = this.fileFormGroup?.get('legal_entity_stamp').value;
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.UploadStampLegalEntity(stampS3FileName, this.parentData?._id).subscribe(
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
            this.dialogRef.close(this.fileFormGroup?.value);
          });
        }
        return;
      },
      (err) => {
        this.isWaitingForResponse = false;
      },
    );
  }
}
