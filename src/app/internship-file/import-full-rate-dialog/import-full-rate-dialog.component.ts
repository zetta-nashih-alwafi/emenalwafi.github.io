import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-import-full-rate-dialog',
  templateUrl: './import-full-rate-dialog.component.html',
  styleUrls: ['./import-full-rate-dialog.component.scss'],
})
export class ImportFullRateDialogComponent implements OnInit, OnDestroy {
  @ViewChild('importFile', { static: false }) importFile: any;

  importForm: UntypedFormGroup;
  file: File;
  fileType: any;
  isWaitingForResponse = false;
  templateDownloaded = false;
  scholars = [];
  dataSchoolOriginal;
  scholarFilter = new UntypedFormControl(null);
  schoolFilter = new UntypedFormControl(null);
  private subs = new SubSink();

  delimeter = [
    { key: 'COMMA [ , ]', value: ',' },
    { key: 'SEMICOLON [ ; ]', value: ';' },
    { key: 'TAB [ ]', value: 'tab' },
  ];
  scholarId: any;
  isPermission: string[];
  currentUser: any;
  currentUserTypeId: string;

  constructor(
    private fb: UntypedFormBuilder,
    private admissionService: AdmissionDashboardService,
    public dialogRef: MatDialogRef<ImportFullRateDialogComponent>,
    public translate: TranslateService,
    private utilService: UtilityService,
    private financeService: FinancesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: AuthService,
  ) {}

  ngOnInit() {
    this.isPermission = this.userService.getPermission();
    this.currentUser = this.userService.getLocalStorageUser();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    if (this.data && this.data.scholar_season) {
      this.scholarId = this.data.scholar_season;
    }
    this.delimeter = [
      { key: this.translate.instant('STUDENT_IMPORT.DELIMETER.COMMA'), value: ',' },
      { key: this.translate.instant('STUDENT_IMPORT.DELIMETER.SEMICOLON'), value: ';' },
      { key: this.translate.instant('STUDENT_IMPORT.DELIMETER.TAB'), value: 'tab' },
    ];
    this.initForm();
    this.getDataScholarSeasons();
    this.getDataSchool();
  }

  initForm() {
    this.importForm = this.fb.group({
      school_id: [this.data && this.data.school_id ? this.data.school_id : null, [Validators.required]],
      scholar_season: [this.scholarId],
      file_delimeter: [';', [Validators.required]],
    });
  }

  handleInputChange(fileInput: Event) {
    this.isWaitingForResponse = true;
    const file = (<HTMLInputElement>fileInput.target).files[0];

    // *************** Accept Reject File Upload outside allowed accept
    const acceptable = ['csv', 'tsv'];
    const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
    if (acceptable.includes(fileType)) {
      this.file = (<HTMLInputElement>fileInput.target).files[0];
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

  downloadTemplate() {
    this.templateDownloaded = true;
    this.financeService.downloadFullRateTemplateCSV(
      this.importForm.get('file_delimeter').value,
      this.importForm.get('scholar_season').value,
      this.importForm.get('school_id').value,
    );
    this.importForm.get('file_delimeter').disable();
    this.importForm.get('scholar_season').disable();
    this.importForm.get('school_id').disable();
  }

  resetValue() {
    this.templateDownloaded = false;
    this.importForm.get('file_delimeter').setValue(null);
    this.importForm.get('school_id').setValue(null);
    this.importForm.get('file_delimeter').reset();
    this.importForm.get('school_id').reset();
    this.importForm.get('file_delimeter').enable();
    this.importForm.get('school_id').enable();
    this.importForm.get('file_delimeter').clearValidators();
    this.importForm.get('school_id').clearValidators();
    this.importForm.get('file_delimeter').updateValueAndValidity();
    this.importForm.get('school_id').updateValueAndValidity();
  }

  submit() {
    if (this.data) {
      this.callCheckImportAPI();
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
        // Record error log
        this.userService.postErrorLog(err);
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

  getDataSchool() {
    const school = [];
    this.subs.sink = this.admissionService.GetAllSchoolScholar(school, this.scholarId, this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.dataSchoolOriginal = resp;
          if (!this.importForm.get('school_id').value) {
            this.importForm.get('school_id').setValue(this.scholars[0]._id);
          }
        }
      },
      (err) => {
        // Record error log
        this.userService.postErrorLog(err);
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

  callCheckImportAPI() {
    // ************* To check if there is decision already imputted in the student or not
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.ImportFullRate(this.importForm.value, this.file).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then(() => {
          this.dialogRef.close(true);
        });
      },
      (err) => {
        // Record error log
        this.userService.postErrorLog(err);
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
