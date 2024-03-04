import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
// import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js'
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SpeechToTextDialogComponent } from 'app/shared/components/speech-to-text-dialog/speech-to-text-dialog.component';
import Swal from 'sweetalert2';


@Component({
  selector: 'ms-job-offer-note-tab',
  templateUrl: './job-offer-note-tab.component.html',
  styleUrls: ['./job-offer-note-tab.component.scss']
})
export class JobOfferNoteTabComponent implements OnInit {
  public Editor = DecoupledEditor;
  translatePipe: TranslatePipe;
  @ViewChild('editor', { static: true }) editor: DecoupledEditor;
  @Input() candidate;
  public config = {
    placeholder: this.translate.instant('Title'),
    height: '20rem',
    toolbar: [
      'heading',
      '|',
      'fontsize',
      '|',
      'bold',
      'italic',
      'Underline',
      'strikethrough',
      'highlight',
      '|',
      'alignment',
      '|',
      'numberedList',
      'bulletedList',
      '|',
    ],
  };
  form: UntypedFormGroup;
  counter = 0;
  greenHeartIcon = '../../../../../assets/img/enagement_icon_green.png';

  constructor(public translate: TranslateService, private fb: UntypedFormBuilder, private dialog: MatDialog) {}

  ngOnInit() {
    this.initAddNoteForm();
  }
  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }
  initAddNoteForm() {
    this.form = this.fb.group({
      note: [null, Validators.required],
    });
  }
  incrementCounter() {
    if (this.counter < 30) {
      this.counter += 1;
    } else {
      this.counter = 30;
    }
  }
  decrementCounter() {
    if (this.counter > 0) {
      this.counter -= 1;
    } else {
      this.counter = 0;
    }
  }
  recordNote() {
    this.dialog
      .open(SpeechToTextDialogComponent, {
        width: '800px',
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

  saveNote() {
    Swal.fire({
      type: 'success',
      title: this.translate.instant('SAVENOTE.TITLE'),
      html: this.translate.instant('SAVENOTE.TEXT'),
      confirmButtonText: this.translate.instant('SAVENOTE.BUTTON'),
      allowOutsideClick: false,
    }).then((res) => {
      this.form.get('note').patchValue('');
      // this.initAddNoteForm();
    });
  }
}
