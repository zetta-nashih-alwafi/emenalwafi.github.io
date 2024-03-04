import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import * as _ from 'lodash';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-messages-details',
  templateUrl: './messages-details.component.html',
  styleUrls: ['./messages-details.component.scss'],
})
export class MessagesDetailsComponent implements OnInit {
  _reference: string;
  @Input() refSelected: any;
  @Input() isPublished: boolean;
  @Output() updateTabs = new EventEmitter();
  initialData: any;
  isWaitingForResponse: boolean;

  @Input() set reference(value) {
    this._reference = value;
  }
  public Editor = DecoupledEditor;
  public config = {
    toolbar: [
      'heading',
      '|',
      'fontSize',
      'fontFamily',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'alignment',
      '|',
      'numberedList',
      'bulletedList',
      'todoList',
      '|',
      'indent',
      'outdent',
      '|',
      'link',
      'blockQuote',
      'imageUpload',
      'insertTable',
      'horizontalLine',
      'pageBreak',
      '|',
      'undo',
      'redo',
    ],
    link: {
      addTargetToExternalLinks: true,
    },
  };
  messageForm: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder, private translate: TranslateService, private formBuilderService: FormBuilderService, public activatedRoute: ActivatedRoute) {}

  get reference() {
    return this._reference;
  }

  ngOnInit() {
    this.initForm();
    this.patchNotifForm();
    console.log(this.refSelected);
  }

  initForm() {
    this.messageForm = this.fb.group({
      ref_id: [''],
      body: [''],
      first_button: [''],
      second_button: [''],
    });
  }

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  patchNotifForm() {
    if (this.refSelected) {
      this.messageForm.patchValue(this.refSelected);
      if (this.messageForm.get('first_button').value == '') {
        this.messageForm.get('first_button').setValue('Go back');
        this.messageForm.get('second_button').setValue('Go to next step');
      }
      this.initialData = _.cloneDeep(this.messageForm.getRawValue());
      this.initValueChange();
    }
  }

  initValueChange() {
    this.messageForm.valueChanges.subscribe(() => {
      this.isFormUnchanged();
    });
  }

  saveMessageData() {
    if (this.isPublished) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UserForm_S18.TITLE'),
        text: this.translate.instant('UserForm_S18.TEXT'),
        confirmButtonText: this.translate.instant('UserForm_S18.CONFIRM'),
      });
    } else {
      console.log('form', this.messageForm.controls);
      if (this.checkFormValidity()) {
        return;
      } else {
        this.isWaitingForResponse = true;
        const payload = this.messageForm.getRawValue();
        this.cleanNullValues(payload);
        console.log('payload', payload);
        this.formBuilderService.UpdateStepNotificationAndMessage(this.refSelected._id, payload).subscribe((resp) => {
          if (resp) {
            console.log('resp save', resp);
            this.initialData = _.cloneDeep(this.messageForm.getRawValue());
            this.isFormUnchanged();
            this.isWaitingForResponse = false;
            // this.initFormDetails();
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((action) => {
              this.updateTabs.emit(true);
              // this.populateStepData();
            });
          } else {
            this.isWaitingForResponse = false;
          }
        });
      }
    }
  }

  checkFormValidity(): boolean {
    if (this.messageForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
      this.messageForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  cleanNullValues(obj) {
    return Object.keys(obj).forEach((key) => {
      if (obj[key] && typeof obj[key] === 'object') {
        this.cleanNullValues(obj[key]);
      } else if (obj[key] === null) {
        delete obj[key];
      }
    });
  }

  isFormUnchanged() {
    const initialData = JSON.stringify(this.initialData);
    const currentData = JSON.stringify(this.messageForm.getRawValue());
    console.log('_init', initialData);
    console.log('_init 2', currentData);
    console.log(initialData === currentData);
    if (initialData === currentData) {
      this.formBuilderService.childrenFormValidationStatus = true;
      return true;
    } else {
      this.formBuilderService.childrenFormValidationStatus = false;
      return false;
    }
  }
}
