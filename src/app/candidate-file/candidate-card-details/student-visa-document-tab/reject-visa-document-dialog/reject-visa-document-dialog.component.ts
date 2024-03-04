import Validator from '@adyen/adyen-web/dist/types/utils/Validator/Validator';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { StudentsService } from 'app/service/students/students.service';
import { SpeechToTextDialogComponent } from 'app/shared/components/speech-to-text-dialog/speech-to-text-dialog.component';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
@Component({
  selector: 'ms-reject-visa-document-dialog',
  templateUrl: './reject-visa-document-dialog.component.html',
  styleUrls: ['./reject-visa-document-dialog.component.scss'],
})
export class RejectVisaDocumentDialogComponent implements OnInit, OnDestroy {
  @ViewChild('editor', { static: true }) editor: DecoupledEditor;
  reason = new UntypedFormControl(null, Validators.required);

  private subs = new SubSink();
  public Editor = DecoupledEditor;
  public config = {
    height: '20rem',
  };

  isWaitingForResponse = false;
  currentUser;
  constructor(
    public dialogRef: MatDialogRef<RejectVisaDocumentDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data,
    private translate: TranslateService,
    private studentsService: StudentsService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getLocalStorageUser();
  }
  recordNote() {
    this.subs.sink = this.dialog
      .open(SpeechToTextDialogComponent, {
        width: '700px',
        minHeight: '300px',
        panelClass: 'candidate-note-record',
        disableClose: true,
        data: '',
      })
      .afterClosed()
      .subscribe((text) => {
        const editorInstance = this.editor.editorInstance;
        if (text.trim()) {
          const voiceText = `${text}`;
          const displayText = editorInstance.getData() + voiceText;
          editorInstance.setData(displayText);
        }
      });
  }
  rejectDoc() {
    if (this.reason?.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.reason.markAllAsTouched();
      return;
    }
    if (this.data) {
      this.isWaitingForResponse = true;
      const payload = { _id: this.data?.document?._id, validationStatus: 'rejected', reason: this.reason?.value };
      const userTypesList = this.currentUser && this.currentUser?.app_data ? this.currentUser?.app_data?.user_type_id : [];
      this.subs.sink = this.studentsService?.validateOrRejectAcadDocument(payload,userTypesList,this.currentUser?._id)?.subscribe(
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
            this.closeDialog('rejected');
          });
        },
        (err) => {
          this.isWaitingForResponse = false;
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
  closeDialog(text?) {
    this.dialogRef.close(text);
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
