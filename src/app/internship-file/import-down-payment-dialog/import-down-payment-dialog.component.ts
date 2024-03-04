import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { removeSpaces } from 'app/service/customvalidator.validator';
import { FinancesService } from 'app/service/finance/finance.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { environment } from 'environments/environment';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-import-down-payment-dialog',
  templateUrl: './import-down-payment-dialog.component.html',
  styleUrls: ['./import-down-payment-dialog.component.scss'],
})
export class ImportDownPaymentDialogComponent implements OnInit, OnDestroy {
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
  scholarId: any;
  private subs = new SubSink();
  private timeOutVal: any;

  delimeter = [
    { key: 'COMMA [ , ]', value: ',' },
    { key: 'SEMICOLON [ ; ]', value: ';' },
    { key: 'TAB [ ]', value: 'tab' },
  ];
  isPermission: any;
  currentUser: any;
  currentUserTypeId: any;

  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<ImportDownPaymentDialogComponent>,
    private rncpTitleService: RNCPTitlesService,
    public translate: TranslateService,
    private utilService: UtilityService,
    private financeService: FinancesService,
    private admissionService: AdmissionDashboardService,
    private router: ActivatedRoute,
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
    console.log(this.data);
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
    if (this.data) {
      this.callCheckImportAPI();
    }
  }

  callCheckImportAPI() {
    // ************* To check if there is decision already imputted in the student or not
    this.isWaitingForResponse = true;
    console.log(this.file);
    this.subs.sink = this.financeService.ImportDownPayment(this.importForm.value, this.file).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        console.log(resp);
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
    this.financeService.downloadDownPaymentTemplateCSV(
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
