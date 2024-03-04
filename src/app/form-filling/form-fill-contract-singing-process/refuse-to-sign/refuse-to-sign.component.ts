import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FormFillingService } from 'app/form-filling/form-filling.service';
import { SubSink } from 'subsink';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { SpeechToTextDialogComponent } from 'app/shared/components/speech-to-text-dialog/speech-to-text-dialog.component';
import { UntypedFormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from 'app/service/auth-service/auth.service';
@Component({
  selector: 'ms-refuse-to-sign',
  templateUrl: './refuse-to-sign.component.html',
  styleUrls: ['./refuse-to-sign.component.scss'],
})
export class RefuseToSignComponent implements OnInit, OnDestroy {
  isWaitingForResponse = false;
  reasonText = new UntypedFormControl(null, [Validators.required]);
  @ViewChild('editor', { static: true }) editor: DecoupledEditor;
  private subs = new SubSink();
  public Editor = DecoupledEditor;
  public config = {
    height: '20rem',
  };

  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    private dialogRef: MatDialogRef<RefuseToSignComponent>,
    private formFillingService: FormFillingService,
    @Inject(MAT_DIALOG_DATA) public data,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {}
  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }
  recordNote() {
    this.dialog
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
  submit() {
    if (this.reasonText.invalid) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      this.reasonText.markAllAsTouched();
      return;
    }
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService
      .rejectFormProcessSigningStep(this.reasonText?.value, this.data?.formId, this.data?.stepId, this.data?.userId)
      .subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo'),
            confirmButtonText: this.translate.instant('OK'),
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then((result) => {
            this.closeDialog(resp);
          });
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err);
          Swal.fire({
            type: 'error',
            title: 'Error',
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }
  closeDialog(resp?: any) {
    this.dialogRef.close(resp);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
