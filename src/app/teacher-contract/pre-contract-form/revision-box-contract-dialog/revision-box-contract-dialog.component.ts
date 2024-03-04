import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { UntypedFormControl } from '@angular/forms';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import * as moment from 'moment';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { SpeechToTextDialogComponent } from 'app/shared/components/speech-to-text-dialog/speech-to-text-dialog.component';

@Component({
  templateUrl: './revision-box-contract-dialog.component.html',
  styleUrls: ['./revision-box-contract-dialog.component.scss'],
  providers: [ParseLocalToUtcPipe],
})
export class RevisionBoxContractDialogComponent implements OnInit {
  public Editor = DecoupledEditor;
  @ViewChild('editor', { static: true }) editor: DecoupledEditor;
  text_message = new UntypedFormControl(null);

  public config = {
    height: '20rem',
  };

  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    private dialogRef: MatDialogRef<RevisionBoxContractDialogComponent>,
    private parseToUTC: ParseLocalToUtcPipe,
    private contractService: TeacherContractService,
    @Inject(MAT_DIALOG_DATA) public data: { formData: any; stepId: string; existingMessages?: any[]; type?: string },
  ) {}

  ngOnInit() {
    console.log('existingMessages', this.data);
    if (this.data.existingMessages) {
      this.data.existingMessages = this.formatExistingMessages(_.cloneDeep(this.data.existingMessages));
    }
  }

  formatExistingMessages(messages) {
    return messages.map((message) => {
      if (message && message.created_by && typeof message.created_by === 'object') {
        return {
          ...message,
          created_by: message.created_by._id,
          user_type_id: message && message.user_type_id && message.user_type_id._id ? message.user_type_id._id : null,
        };
      } else {
        return { ...message };
      }
    });
  }

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

  onSubmit() {
    if (this.data && this.data.type === 'reply') {
      this.reply();
    } else {
      this.askForRevision();
    }
  }

  askForRevision() {
    if (this.data.formData.userId) {
      const today = new Date();
      const payloadArray = this.data && this.data.existingMessages ? this.data.existingMessages : [];
      console.log(payloadArray);
      console.log(this.data.formData);
      payloadArray.push({
        created_date: this.parseToUTC.transformDate(today.toLocaleDateString('en-GB'), '15:59'),
        created_time: this.parseToUTC.transform(moment().format('HH:mm')),
        created_by: this.data.formData.userId === this.data.formData.formId ? null : this.data.formData.userId,
        message: this.text_message.value,
        user_type_id: this.data.formData && this.data.formData.userTypeId ? this.data.formData.userTypeId : null,
      });
      if (this.data.stepId) {
        // Ask Revision for Step
        this.contractService.askRevisionContractProcessStep(this.data.stepId, payloadArray).subscribe((resp) => {
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((ressp) => {
              this.closeDialog(ressp);
            });
          }
        });
      } else {
        // Ask Revision for process
        this.contractService.askRevisionContractProcess(this.data.formData.formId, payloadArray).subscribe((resp) => {
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((ressp) => {
              this.closeDialog(ressp);
            });
          }
        });
      }
    }
  }

  reply() {
    // if (this.data.formData.userId) {
    const today = new Date();
    // const payloadArray = this.data && this.data.existingMessages ? this.data.existingMessages : [];
    const payloadArray = [];
    payloadArray.push({
      created_date: this.parseToUTC.transformDate(today.toLocaleDateString('en-GB'), '15:59'),
      created_time: this.parseToUTC.transform(moment().format('HH:mm')),
      created_by: this.data.formData.userId === this.data.formData.formId ? null : this.data.formData.userId,
      message: this.text_message.value,
      user_type_id: this.data.formData && this.data.formData.userTypeId ? this.data.formData.userTypeId : null,
    });
    if (this.data.stepId) {
      // Ask Revision for Step
      this.contractService.replyRevisionMessageContractProcessStep(this.data.stepId, payloadArray).subscribe((resp) => {
        if (resp) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then((ressp) => {
            this.closeDialog(ressp);
          });
        }
      });
    } else {
      // Ask Revision for process
      this.contractService.replyRevisionMessageContractProcess(this.data.formData.formId, payloadArray).subscribe((resp) => {
        if (resp) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then((ressp) => {
            this.closeDialog(ressp);
          });
        }
      });
    }
    // }
  }

  closeDialog(resp?: any) {
    this.dialogRef.close(resp);
  }
}
