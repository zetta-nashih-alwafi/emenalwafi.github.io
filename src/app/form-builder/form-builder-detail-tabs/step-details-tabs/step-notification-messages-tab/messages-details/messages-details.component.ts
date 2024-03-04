import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import * as _ from 'lodash';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-messages-details',
  templateUrl: './messages-details.component.html',
  styleUrls: ['./messages-details.component.scss'],
})
export class MessagesDetailsComponent implements OnInit, OnDestroy {
  _reference: string;
  @Input()
  set refSelected(input) {
    this.refData = input;
    this.initForm();
    this.patchNotifForm();
  }
  @Input() isPublished: boolean;
  @Input() stepType: any;
  @Input() stepData: any;
  @Output() updateTabs = new EventEmitter();
  @Output() isDisplayPreview = new EventEmitter();
  initialData: any;
  isWaitingForResponse: boolean;
  refData;
  triggerConditionFilter = new UntypedFormControl(null);
  initialTriggerConditions: Array<{ key: string; value: string }> = [];
  filteredTriggerConditions: Array<{ key: string; value: string }> = [];
  private subs = new SubSink();

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
    mediaEmbed: {
      previewsInData: true,
    },
  };
  messageForm: UntypedFormGroup;
  isFormChanged = false

  constructor(
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private formBuilderService: FormBuilderService,
    private authService: AuthService,
  ) {}

  get reference() {
    return this._reference;
  }

  ngOnInit() {
    this.populateTriggerConditions();
    this.isFormChanged = false
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.messageForm.get('trigger_condition').setValue(this.messageForm.get('trigger_condition').value);
    });

    if (this.isPublished) {
      this.messageForm.disable();
      this.triggerConditionFilter.disable();
    }
  }

  populateTriggerConditions() {
    if (this.stepType === 'step_with_signing_process') {
      this.initialTriggerConditions.push({
        key: 'all_signatory_signed',
        value: 'When All Signatory finish the contract signing',
      });
    } else {
      this.initialTriggerConditions.push({ key: 'validated', value: 'When step is Validated' });
      // { key: 'rejected', value: 'When step is Rejected' },
      // { key: 'waiting_for_validation', value: 'When step is Submit and waiting for validation' });

      if (this.stepData && this.stepData.is_validation_required) {
        this.initialTriggerConditions.push(
          { key: 'rejected', value: 'When step is Rejected' },
          { key: 'waiting_for_validation', value: 'When step is Submit and waiting for validation' },
        );
      }
    }
    this.filteredTriggerConditions = [...this.initialTriggerConditions];
  }

  initForm() {
    this.messageForm = this.fb.group({
      ref_id: [{ value: '', readonly: true, disabled: true }, [Validators.required]],
      trigger_condition: [null, [Validators.required]],
      body: [''],
      first_button: ['', [Validators.required]],
      second_button: ['', [Validators.required]],
    });
  }

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  onTriggerConditionFilter($event) {
    if (!$event.target.value) {
      this.filteredTriggerConditions = [...this.initialTriggerConditions];
    } else {
      this.filteredTriggerConditions = this.initialTriggerConditions.filter((condition) => {
        const translatedText = this.getTranslationForCondition(condition.key);
        return translatedText.toLowerCase().trim().includes($event.target.value.toLowerCase().trim());
      });
    }
  }

  patchNotifForm() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formBuilderService.getOneStepNotificationAndMessage(this.refData._id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          if (resp.type === 'message') {
            let data = _.cloneDeep(resp);
            this.messageForm.patchValue(data);
            if (this.messageForm.get('first_button').value == '') {
              this.messageForm.get('first_button').setValue('Go back');
            }
            if (this.messageForm.get('second_button').value == '') {
              this.messageForm.get('second_button').setValue('Go to next step');
            }
            this.initialData = _.cloneDeep(this.messageForm.getRawValue());
            this.initValueChange();
          }
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        // Record error log
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getTranslationForCondition(name): string {
    if (name) {
      const translations = {
        validated: 'When step is Validated',
        rejected: 'When step is Rejected',
        send: 'When step is Send',
        done: 'When the task is Done',
        waiting_for_validation: 'When step is Submit and waiting for validation',
        need_to_sign_contract: 'When signatory is needed to sign the contract',
        all_signatory_signed: 'When All Signatory finish the contract signing',
      };
      return this.translate.instant(translations[name]);
    }
  }

  initValueChange() {
    this.isFormUnchanged();
    this.subs.sink = this.messageForm.valueChanges.subscribe(() => {
      this.isFormChanged = true
      this.isFormUnchanged();
    });
  }

  saveMessageData(reminder?,from?,hasErrorPreview?) {
    if (this.isPublished) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UserForm_S18.TITLE'),
        text: this.translate.instant('UserForm_S18.TEXT'),
        confirmButtonText: this.translate.instant('UserForm_S18.CONFIRM'),
      });
    } else {
      if (this.checkFormValidity()) {
        return;
      } else {
        const initialData = JSON.stringify(this.initialData);
        const currentData = JSON.stringify(this.messageForm.getRawValue());
        if (!from && reminder && (initialData !== currentData || hasErrorPreview)) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('ContractPreview_S1.TITLE'),
            text: this.translate.instant('ContractPreview_S1.TEXT'),
            confirmButtonText: this.translate.instant('ContractPreview_S1.BUTTON1'),
            showCancelButton: true,
            cancelButtonText: this.translate.instant('ContractPreview_S1.BUTTON2'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(result=>{
            if(result.value){
              this.isDisplayPreview.emit(true)
            }
          })
          return;
        }
        this.isWaitingForResponse = true;
        const payload = this.messageForm.getRawValue();
        this.cleanNullValues(payload);
        this.subs.sink = this.formBuilderService.UpdateStepNotificationAndMessage(this.refData._id, payload).subscribe(
          (resp) => {
            if (resp) {
              this.initialData = _.cloneDeep(this.messageForm.getRawValue());
              this.isFormUnchanged();
              this.isFormChanged = false
              this.isWaitingForResponse = false;
              if(from === 'preview'){
                this.updateTabs.emit(true)
              }else{
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('Bravo!'),
                  confirmButtonText: this.translate.instant('OK'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.updateTabs.emit(true);
                });
              }
            } else {
              this.isWaitingForResponse = false;
            }
          },
          (err) => {
            this.authService.postErrorLog(err);
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
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
    if (initialData === currentData && !this.messageForm.invalid) {
      this.formBuilderService.childrenFormValidationStatus = true;
      return true;
    } else {
      this.formBuilderService.childrenFormValidationStatus = false;
      return false;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
