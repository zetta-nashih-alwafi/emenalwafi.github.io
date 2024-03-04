import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SubSink } from 'subsink';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Inject } from '@angular/core';
import * as _ from 'lodash';
import { StudentsService } from 'app/service/students/students.service';
import { StudentsTableService } from '../StudentTable.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { AcademicKitService } from 'app/service/rncpTitles/academickit.service';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'app/service/auth-service/auth.service';
import * as moment from 'moment';
@Component({
  selector: 'ms-add-document-builder-dialog',
  templateUrl: './add-document-builder-dialog.component.html',
  styleUrls: ['./add-document-builder-dialog.component.scss'],
})
export class AddDocumentBuilderDialogComponent implements OnInit, OnDestroy {
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  uploadDocForm: FormGroup;
  selectedFile: File;
  isWaitingForResponse = false;
  isInvoiceDisplay = true;
  firstForm: any;

  private subs = new SubSink();

  fileTypesControl = new FormControl('');
  fileTypes = [];
  selectedFileType = '';
  selectedMaxSize = 0;
  listDataDropdown = [];
  documentInvoiceName: string;

  constructor(
    public dialogRef: MatDialogRef<AddDocumentBuilderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public parentData,
    private fb: FormBuilder,
    private translate: TranslateService,
    private utilService: UtilityService,
    private fileUploadService: FileUploadService,
    private acadKitService: AcademicKitService,
    private studentsService: StudentsTableService,
    private httpClient: HttpClient,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    console.log(this.parentData);
    this.initUploadDocForm();
    this.getDataDropdown();
  }

  getDataDropdown() {
    this.listDataDropdown = [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.studentsService.getAllDocumentsPublished().subscribe(
      (list) => {
        this.isWaitingForResponse = false;
        if (list && list.length) {
          this.listDataDropdown = list;
        } else {
          this.listDataDropdown = [];
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        console.log('err', err);
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

  initUploadDocForm() {
    this.uploadDocForm = this.fb.group({
      document_id: ['', Validators.required],
      document_builder_name: ['', Validators.required],
      s3_file_name: [''],
    });
  }
  getDataDocument(dataEvent) {
    const findIdx = this.listDataDropdown?.findIndex((doc) => doc?.document_builder_name === dataEvent);
    const data = this.listDataDropdown[findIdx]?._id;
    if (data) {
      this.uploadDocForm.get('document_id').setValue(data);
      if (this.parentData && !this.parentData.is_multiple) {
        this.isWaitingForResponse = true;
        this.subs.sink = this.studentsService.GenerateDocumentBuilderPDFForStudent(this.parentData._id, data).subscribe(
          (list) => {
            this.isWaitingForResponse = false;
            if (list) {
              this.uploadDocForm.get('s3_file_name').setValue(list);
              this.selectedFile = list;
            } else {
              this.uploadDocForm.get('s3_file_name').setValue(null);
              this.selectedFile = null;
            }
          },
          (err) => {
            this.authService.postErrorLog(err);
            this.isWaitingForResponse = false;
            console.log('err', err);
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
  }

  closeDialog() {
    this.dialogRef.close();
  }

  checkFormValidity(): boolean {
    if (this.uploadDocForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        onOpen: (modelEl) => {
          modelEl.setAttribute('data-cy', 'swal-formsave-s1');
        },
      });
      this.uploadDocForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  submit() {
    if (this.checkFormValidity()) {
      return;
    }
    let payload;
    console.log('Data Payload', this.uploadDocForm.value);
    if (this.uploadDocForm.get('document_builder_name').value === this.translate.instant('INVOICE')) {
      payload = this.uploadDocForm.value;
      payload.document_builder_name = 'Invoice';
      payload.invoice_name = this.documentInvoiceName;
    } else {
      const path = this.uploadDocForm.get('s3_file_name').value;
      payload = {
        path: `${environment.apiUrl}/fileuploads/${path}`.replace('/graphql', ''),
        file_name: this.uploadDocForm.get('document_builder_name').value,
      };
      if (this.parentData && this.parentData.is_multiple) {
        payload = this.uploadDocForm.value;
      }
    }
    this.dialogRef.close(payload);
  }

  selectDocument(event) {
    if(event && event === 'Invoice') {
      this.getInvoiceData();
    } else if(event && event !== 'Invoice') {
      this.getDataDocument(event);
    }
  }

  getInvoiceData() {
    this.isWaitingForResponse = true;
    const currentDate = moment(new Date(), 'DD/MM/YYYY').format('DDMMYYYY');
    const currentTime = moment(new Date()).format('HH:mm');
    if (this.parentData.candidate_data && this.parentData.candidate_data.length) {
      const url = environment.apiUrl.replace('/graphql', '');
      const id =
        this.parentData?.candidate_data[0]?.candidate?.candidate_id?._id || this.parentData?.candidate_data[0]?.candidate?._id || this.parentData?.candidate_data[0]?._id || null;
      const scholarSeasonId = this.parentData?.candidate_data[0]?.intake_channel?.scholar_season_id?._id || this.parentData?.candidate_data[0]?.candidate?.intake_channel?.scholar_season_id?._id || null;
      const intakeChannelId = this.parentData?.candidate_data[0]?.intake_channel?._id || this.parentData?.candidate_data[0]?.candidate?.intake_channel?._id || null;
      const fullURL = 
        `${url}/downloadStudentInvoice/${id}/${this.translate.currentLang}/${scholarSeasonId}/${intakeChannelId}?date=${currentDate}&time=${currentTime}`;
      this.httpClient.get(fullURL, { responseType: 'text' }).subscribe(
        (resp) => {
          console.log('invoice', resp);
          if (resp) {
            this.isWaitingForResponse = false;
            const nameInvoice = this.translate.instant('INVOICE');
            this.uploadDocForm.get('document_id').setValue(nameInvoice);
            this.uploadDocForm.get('document_builder_name').setValue(this.translate.instant('INVOICE'));
            this.documentInvoiceName = resp;
          } else {
            const nameInvoice = this.translate.instant('INVOICE');
            this.uploadDocForm.get('document_id').setValue(nameInvoice);
            this.uploadDocForm.get('document_builder_name').setValue(this.translate.instant('INVOICE'));
            this.documentInvoiceName = nameInvoice;
            this.isWaitingForResponse = false;
          }
        },
        (err) => {
          const nameInvoice = this.translate.instant('INVOICE');
          this.uploadDocForm.get('document_id').setValue(nameInvoice);
          this.uploadDocForm.get('document_builder_name').setValue(this.translate.instant('INVOICE'));
          this.documentInvoiceName = nameInvoice;
          this.isWaitingForResponse = false;
        },
      );
    } else if (this.parentData && this.parentData._id) {
      const url = environment.apiUrl.replace('/graphql', '');
      const fullURL = `${url}/downloadStudentInvoice/${this.parentData._id}/${this.translate.currentLang}`;
      this.httpClient.get(fullURL, { responseType: 'text' }).subscribe(
        (resp) => {
          if (resp) {
            this.isWaitingForResponse = false;
            this.uploadDocForm.get('document_id').setValue(resp);
            this.uploadDocForm.get('document_builder_name').setValue(this.translate.instant('INVOICE'));
            this.documentInvoiceName = resp;
          } else {
            const nameInvoice = this.translate.instant('INVOICE');
            this.uploadDocForm.get('document_id').setValue(nameInvoice);
            this.uploadDocForm.get('document_builder_name').setValue(this.translate.instant('INVOICE'));
            this.documentInvoiceName = nameInvoice;
            this.isWaitingForResponse = false;
          }
        },
        (err) => {
          const nameInvoice = this.translate.instant('INVOICE');
          this.uploadDocForm.get('document_id').setValue(nameInvoice);
          this.uploadDocForm.get('document_builder_name').setValue(this.translate.instant('INVOICE'));
          this.documentInvoiceName = nameInvoice;
          this.isWaitingForResponse = false;
        },
      );
    } else {
      this.isWaitingForResponse = false;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
