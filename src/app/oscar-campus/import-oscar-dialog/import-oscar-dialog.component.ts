import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-import-oscar-dialog',
  templateUrl: './import-oscar-dialog.component.html',
  styleUrls: ['./import-oscar-dialog.component.scss'],
})
export class ImportOscarDialogComponent implements OnInit {
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

  delimeter = [
    { key: 'COMMA [ , ]', value: ',' },
    { key: 'SEMICOLON [ ; ]', value: ';' },
    { key: 'TAB [ ]', value: 'tab' },
  ];

  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<ImportOscarDialogComponent>,
    private rncpTitleService: RNCPTitlesService,
    public translate: TranslateService,
    private utilService: UtilityService,
    private financeService: FinancesService,
    private admissionService: AdmissionDashboardService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.importForm = this.fb.group({
      file_delimeter: [';', [Validators.required]],
    });
  }

  handleInputChange(fileInput: Event) {
    this.isWaitingForResponse = true;
    const file = (<HTMLInputElement>fileInput.target).files[0];
    this.file = (<HTMLInputElement>fileInput.target).files[0];
    console.log(file);

    // *************** Accept Reject File Upload outside allowed accept
    const acceptable = ['csv', 'tsv'];
    const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
    console.log(fileType);
    if (acceptable.includes(fileType)) {
      this.isWaitingForResponse = false;
    } else {
      this.file = null;
      this.isWaitingForResponse = false;
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

  submit() {
    if (!this.importForm.invalid) {
      this.callCheckImportAPI();
    }
  }

  callCheckImportAPI() {
    // ************* Call api for import
    this.isWaitingForResponse = true;
    console.log('_file', this.file);
    if (this.file) {
      this.subs.sink = this.financeService.ImportCandidateData(this.importForm.get('file_delimeter').value, this.file).subscribe(
        (res) => {
          if (!res.is_error) {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Oscar_S7_Import.TITLE'),
              html: this.translate.instant('Oscar_S7_Import.TEXT', { numberStudents: res.total_imported_candidates }),
              confirmButtonText: this.translate.instant('Oscar_S7_Import.BUTTON'),
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

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasons().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.scholars = resp;
          if (!this.importForm.get('scholar_season').value) {
            this.importForm.get('scholar_season').setValue(this.scholars[0]._id);
          }
        }
      },
      (err) => {
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

  downloadTemplate() {
    this.templateDownloaded = true;
    this.financeService.downloadTemplateOscarCSV(this.importForm.get('file_delimeter').value);
    this.importForm.get('file_delimeter').disable();
  }

  resetValue() {
    this.templateDownloaded = false;
    this.file = null;
    this.importForm.get('file_delimeter').setValue(null);
    this.importForm.get('file_delimeter').reset();
    this.importForm.get('file_delimeter').enable();
    this.importForm.get('file_delimeter').clearValidators();
    this.importForm.get('file_delimeter').updateValueAndValidity();
  }

  swalError(err) {
    console.log('[Response BE][Error] : ', err);
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
