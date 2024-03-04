import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UserService } from 'app/service/user/user.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import * as _ from 'lodash';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { MatDialog } from '@angular/material/dialog';
import { AddDocBuilderDocumentComponent } from '../add-doc-builder-document/add-doc-builder-document.component';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-notification-details',
  templateUrl: './notification-details.component.html',
  styleUrls: ['./notification-details.component.scss'],
})
export class NotificationDetailsComponent implements OnInit, OnDestroy {
  currentEditPdfDocIndex: number = null;
  isPreview: any;
  @Input()
  set refSelected(input) {
    this.refData = input;
    this.initFormDetails();
    this.getNotifData();
  }
  @Input() templateType: any;
  @Input() stepType: any;
  @Input() isPublished: boolean;
  @Output() updateTabs = new EventEmitter();
  @Input() stepData: any;
  @Output() isDisplayPreview = new EventEmitter();
  @ViewChild('handlePdf', { static: false }) uploadInput: any;
  refData: any;
  includePdf = false;
  showDownload = false;
  private subs = new SubSink();
  listData = [];
  isWaitingForResponse = false;
  formDetails: UntypedFormGroup;

  recipientList: any;
  recipientCCList: any;
  signatoryList: any;
  sendingList = [];
  cctList: any;
  userTypesList: any;
  isFormChanged = false
  filterRecipient = new UntypedFormControl('', [Validators.required]);
  filterRecipientCC = new UntypedFormControl('');
  filterSignatory = new UntypedFormControl('', [Validators.required]);
  trigerCondition = new UntypedFormControl('', [Validators.required]);

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
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'],
    },
    image: {
      toolbar: [
        {
          name: 'imageStyle:pictures',
          items: ['imageStyle:alignBlockLeft', 'imageStyle:block', 'imageStyle:alignBlockRight'],
          defaultItem: 'imageStyle:block',
        },
        {
          name: 'imageStyle:icons',
          items: ['imageStyle:alignLeft', 'imageStyle:alignRight'],
          defaultItem: 'imageStyle:alignLeft',
        },
      ],
    },
  };
  editor: any;
  timeOutVal: any;
  teacher_as_recipient = false;
  teacher_as_cc = false;
  teacher_as_signatory = false;
  initialData: any;
  isUploadingFile = false;
  document_name_attachment = new UntypedFormControl('');

  filteredRecipientList;
  filteredRecipientCCList;
  filteredSignatoryList;
  sendingFilterList = [];

  constructor(
    private utilService: UtilityService,
    private fileUploadService: FileUploadService,
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private userService: UserService,
    private formBuilderService: FormBuilderService,
    private dialog: MatDialog,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initFormDetails();
    this.initEditor();
    this.getUserTypes();
    this.populateTriggerConditions();
    this.isFormChanged = false
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getUserTypes();
    });

    if (this.isPublished) {
      this.formDetails.disable();
      this.filterRecipient.disable();
      this.filterRecipientCC.disable();
      this.filterSignatory.disable();
    }
  }

  populateTriggerConditions() {
    if (this.stepType === 'step_with_signing_process') {
      this.sendingList.push(
        {
          key: 'all_signatory_signed',
          value: 'When All Signatory finish the contract signing',
        },
        {
          key: 'need_to_sign_contract',
          value: 'When signatory is needed to sign the contract',
        },
      );
    } else {
      this.sendingList.push({ key: 'validated', value: 'When step is Validated' }, { key: 'send', value: 'When step is Send' });

      if (this.stepData && this.stepData.is_validation_required) {
        this.sendingList.push(
          { key: 'rejected', value: 'When step is Rejected' },
          { key: 'waiting_for_validation', value: 'When step is Submit and waiting for validation' },
        );
      }
    }

    if (this.stepType !== 'final_message') {
      this.sendingList.push({ key: 'reminder', value: 'Reminder' });
    }
    this.sendingList = _.uniqBy(this.sendingList, 'key');
    this.sendingFilterList = [...this.sendingList];
  }

  getNotifData() {
    this.isWaitingForResponse = true;
    this.listData = [];
    this.subs.sink = this.formBuilderService.getOneStepNotificationAndMessage(this.refData._id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          if (resp.type === 'notification') {
            let data = _.cloneDeep(resp);

            if (data.pdf_attachments && data.pdf_attachments.length) {
              this.getAttachmentsFormarray().clear();
              data.pdf_attachments.forEach((pdfData) => {
                this.getAttachmentsFormarray().push(this.initAttachmentsForm());
                this.listData.push({ _id: pdfData.name, name: pdfData.s3_file_name, type: 'uploaded_doc' });
              });
              this.showDownload = true;
            } else {
              this.getAttachmentsFormarray().clear();
            }

            if (data.document_builder && data.document_builder.length) {
              this.getDocBuilderFormarray().clear();
              data.document_builder.forEach((docObject) => {
                this.getDocBuilderFormarray().push(this.initDocBuilderForm());
                this.listData.push({
                  _id: docObject.document_builder_id._id,
                  // scholar_id: docObject.document_builder_scholar_season._id,
                  name: docObject.document_builder_id.document_builder_name,
                  type: 'doc_builder',
                });
              });
              this.showDownload = true;
              data.document_builder = data.document_builder.map((docBuilder) => ({
                document_builder_id: docBuilder.document_builder_id._id,
                // document_builder_scholar_season: docBuilder.document_builder_scholar_season._id,
              }));
            } else {
              data.document_builder = []; // setting it to empty array instead of null to prevent forEach error when patching to form array
            }

            if (data.recipient_id && data.recipient_id.length) {
              data.recipient_id = data.recipient_id.map((recipient) => (recipient && recipient._id ? recipient._id : null));
            }

            if (data.recipient_cc_id && data.recipient_cc_id.length) {
              data.recipient_cc_id = data.recipient_cc_id.map((recipient) => (recipient && recipient._id ? recipient._id : null));
            }

            if (data.signatory_id) data.signatory_id = data.signatory_id && data.signatory_id._id ? data.signatory_id._id : null;

            this.formDetails.patchValue(data);
            this.initialData = _.cloneDeep(this.formDetails.value);
            this.editor.setData(data.body);
            this.trigerCondition.patchValue(resp.trigger_condition ? this.displaySendingConditionFn(resp.trigger_condition) : '');

            this.initValueChange();
          }
        }
      },
      (err) => {
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

  initEditor() {
    this.subs.sink = DecoupledEditor.create(document.querySelector('.document-editor__editable'), this.config)
      .then((editor) => {
        const toolbarContainer = document.querySelector('.document-editor__toolbar');
        toolbarContainer.appendChild(editor.ui.view.toolbar.element);
        if (this.isPublished) editor.isReadOnly = true;
        this.editor = editor;
        document.querySelector('.document-editor__editable').addEventListener('keyup', () => {
          this.isFormChanged = true
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  initFormDetails() {
    this.formDetails = this.fb.group({
      _id: [null],
      ref_id: [this.refData.ref_id, [Validators.required]],
      trigger_condition: [null, [Validators.required]],
      recipient_id: [[], [Validators.required]],
      recipient_cc_id: [[]],
      signatory_id: [null, [Validators.required]],
      pdf_attachments: this.fb.array([]),
      subject: [null, [Validators.required]],
      body: [null, [Validators.required]],
      is_include_pdf_this_step: [false],
      financial_support_as_cc: [null],
      document_builder: this.fb.array([]),
    });
  }

  initAttachmentsForm() {
    return this.fb.group({
      name: ['', [Validators.required]],
      s3_file_name: ['', [Validators.required]],
    });
  }

  initDocBuilderForm() {
    return this.fb.group({
      // document_builder_scholar_season: ['', [Validators.required]],
      document_builder_id: ['', [Validators.required]],
    });
  }

  getAttachmentsFormarray(): UntypedFormArray {
    return this.formDetails.get('pdf_attachments') as UntypedFormArray;
  }

  getDocBuilderFormarray(): UntypedFormArray {
    return this.formDetails.get('document_builder') as UntypedFormArray;
  }

  onEditableContainerFocusOut() {
    const group = this.formDetails.get('body');
    if (!group.touched) group.markAsTouched();
  }

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  initValueChange() {
    this.isFormUnchanged();
    this.subs.sink = this.formDetails.valueChanges.subscribe(() => {
      this.isFormChanged = true
      this.isFormUnchanged();
    });

    this.subs.sink = this.trigerCondition.valueChanges.subscribe((text) => {
      if (text && typeof text === 'string') {
        this.sendingFilterList = this.sendingList.filter((item) => {
          return item.value.toLocaleLowerCase().trim().includes(text.toLocaleLowerCase().trim());
        });
      } else {
        this.sendingFilterList = [...this.sendingList];
      }
    });

    // this.subs.sink = this.formDetails.get('trigger_condition').valueChanges.subscribe(() => {
    //   console.log(this.templateType);
    //   if (
    //     this.templateType === 'student_admission' &&
    //     this.stepType === 'step_with_signing_process' &&
    //     this.formDetails.get('trigger_condition').value === 'need_to_sign_contract'
    //   ) {
    //     this.recipientList = this.stepData.contract_signatory.map((item) => {
    //       console.log('contract_signatory', item);
    //       return { _id: item._id, name: this.translate.instant('USER_TYPES.' + item.name) };
    //     });
    //     const studentType = { _id: '5a067bba1c0217218c75f8ab', name: this.translate.instant('USER_TYPES.Student') };
    //     this.recipientList.push(studentType);
    //     this.recipientList = _.uniqBy(this.recipientList, '_id');
    //     this.filteredRecipientList = this.recipientList;

    //     console.log('recipient_id', this.formDetails.get('recipient_id').value);
    //     if (this.formDetails.get('recipient_id').value) {
    //       console.log('recipient_id', this.formDetails.get('recipient_id').value);
    //       this.formDetails.get('recipient_id').patchValue(null);
    //       this.filterRecipient.patchValue(null);
    //     }
    //   } else if (
    //     this.templateType !== 'quality_file' &&
    //     this.stepType === 'step_with_signing_process' &&
    //     this.formDetails.get('trigger_condition').value === 'need_to_sign_contract'
    //   ) {
    //     this.recipientList = this.stepData.contract_signatory.map((item) => {
    //       console.log('contract_signatory', item);
    //       return { _id: item._id, name: this.translate.instant('USER_TYPES.' + item.name) };
    //     });
    //     const acadDirType = { _id: '5a2e1ecd53b95d22c82f9554', name: this.translate.instant('USER_TYPES.Academic Director') };
    //     this.recipientList.push(acadDirType);
    //     this.recipientList = _.uniqBy(this.recipientList, '_id');
    //     this.filteredRecipientList = this.recipientList;
    //   } else {
    //     this.getUserTypes();
    //   }
    // });
  }

  onFileChange($event) {
    const acceptable = ['pdf'];
    const [file] = $event.target.files;
    const documentName = this.document_name_attachment.value;
    const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
    if (acceptable.includes(fileType)) {
      this.isUploadingFile = true;
      // this.subs.sink = this.fileUploadService.singleUpload(file, documentName).subscribe(
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (response) => {
          this.isUploadingFile = false;
          const newFileFormGroup = this.initAttachmentsForm();
          newFileFormGroup.patchValue({
            name: response.file_name,
            s3_file_name: response.s3_file_name,
          });
          const dataUploaded = {
            _id: newFileFormGroup.value.name,
            name: newFileFormGroup.value.s3_file_name,
            type: 'uploaded_doc',
          };
          if (this.currentEditPdfDocIndex !== null) {
            // means we are editing pdf not adding
            const editedPdf = this.listData[this.currentEditPdfDocIndex];
            const formArrayIndex = this.getAttachmentsFormarray().value.findIndex((pdf) => pdf.s3_file_name === editedPdf.name);
            this.getAttachmentsFormarray().at(formArrayIndex).patchValue(newFileFormGroup);
            this.listData[this.currentEditPdfDocIndex] = dataUploaded;
            this.currentEditPdfDocIndex = null;
          } else {
            // adding new doc
            this.getAttachmentsFormarray().push(newFileFormGroup);
            this.listData.push(dataUploaded);
          }
          this.showDownload = true;
          this.document_name_attachment.reset();
        },
        (err) => {
          this.isUploadingFile = false;
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
    } else {
      this.isUploadingFile = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
        text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.pdf' }),
        allowEscapeKey: false,
        allowOutsideClick: false,
        allowEnterKey: false,
      });
    }
  }

  onDeleteFileAt(id) {
    const attachmentName = this.getAttachmentsFormarray().at(id).get('name').value;
    let timeout = 5;
    let confirmInterval;

    Swal.fire({
      type: 'warning',
      title: this.translate.instant('DELETE_ATTACHMENT_S1.TITLE'),
      html: this.translate.instant('DELETE_ATTACHMENT_S1.HTML_TEXT', { attachmentName }),
      confirmButtonText: this.translate.instant('DELETE_ATTACHMENT_S1.CONFIRM_BUTTON_TIMEOUT', { timeout }),
      cancelButtonText: this.translate.instant('NO'),
      showCancelButton: true,
      onOpen: () => {
        timeout--;
        Swal.disableConfirmButton();
        const confirmButtonRef = Swal.getConfirmButton();
        confirmInterval = setInterval(() => {
          if (timeout > 0) {
            confirmButtonRef.innerText = this.translate.instant('DELETE_ATTACHMENT_S1.CONFIRM_BUTTON_TIMEOUT', { timeout });
            timeout--;
          } else {
            Swal.enableConfirmButton();
            confirmButtonRef.innerText = this.translate.instant('YES');
            clearInterval(confirmInterval);
          }
        }, 1000);
      },
    }).then((result) => {
      clearInterval(confirmInterval);
      if (result.value) {
        this.getAttachmentsFormarray().removeAt(id);
      }
    });
  }

  getUserTypes() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.getAllUserTypeWithStudent().subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          this.userTypesList = [...resp];

          if (
            this.templateType === 'student_admission' &&
            this.stepType === 'step_with_signing_process' &&
            this.formDetails.get('trigger_condition').value === 'need_to_sign_contract'
          ) {
            this.userTypesList.push({ _id: '5a067bba1c0217218c75f8ab', name: 'Student' });
          }

          if (this.formDetails.get('trigger_condition').value) {
            const recip = this.sendingList.find((recp) => recp.key === this.formDetails.get('trigger_condition').value);
            this.trigerCondition.patchValue(this.translate.instant(recip.value));
            if (this.isPublished) this.trigerCondition.disable();
          }

          this.userTypesList = _.uniqBy(this.userTypesList, '_id');
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

  displayUserTypeNameFn(id) {
    if (!id || !(this.recipientList && this.recipientList.length)) {
      return '';
    }
    // since recipient, signatory, and cc list all contain same object, it doesn't matter where it search value from
    const index = this.recipientList.findIndex((type) => type._id === id);
    return index >= 0 ? this.translate.instant('USER_TYPES.' + this.recipientList[index].name) : '';
  }
  selectTrigerCondition(value) {
    const rec = this.sendingFilterList.find((val) => val.value === value);
    if (rec) this.formDetails.get('trigger_condition').patchValue(rec.key);
  }

  displayConditionWithFn(value) {
    if (
      value === 'When step is Validated' ||
      value === 'When step is Send' ||
      value === 'When step is Rejected' ||
      value === 'When step is Submit and waiting for validation' ||
      value === 'Reminder' ||
      value === 'When signatory is needed to sign the contract' ||
      value === 'When All Signatory finish the contract signing'
    ) {
      return this.translate.instant(value);
    } else {
      return value;
    }
  }

  selectRecipient(value) {
    const rec = this.recipientList.find((val) => val.name === value);
    if (rec) this.formDetails.get('recipient_id').patchValue(rec._id);
  }
  selectRecipientCC(value) {
    const recCC = this.recipientCCList.find((val) => val.name === value);
    if (recCC) this.formDetails.get('recipient_cc_id').patchValue(recCC._id);
  }
  selectSignatory(value) {
    const sig = this.signatoryList.find((val) => val.name === value);
    if (sig) this.formDetails.get('signatory_id').patchValue(sig._id);
  }

  hasIncludePDFStep() {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('Sorry'),
      text: this.translate.instant('Please uncheck the checkbox for Include attachment PDF of the step first before upload document pdf'),
      confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
    });
  }

  alreadyUploadFileSwal() {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('Sorry'),
      text: this.translate.instant('Please remove the uploaded pdf attachment first before can upload another PDF'),
      confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
    });
  }

  alreadyUploadFileSwalForIncludePDF() {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('Sorry'),
      text: this.translate.instant(
        'Please remove the uploaded pdf attachment first before can check the checkbox for Include attachment PDF of the step',
      ),
      confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
    });
  }

  onValueRecChange() {
    if (this.filterRecipient.value) {
      const searchString = this.utilService.simpleDiacriticSensitiveRegex(this.filterRecipient.value).toLowerCase().trim();
      this.filteredRecipientList = this.recipientList.filter((test) =>
        this.utilService.simpleDiacriticSensitiveRegex(test.name).toLowerCase().trim().includes(searchString),
      );
    } else {
      this.filteredRecipientList = this.recipientList;
      this.formDetails.get('recipient_id').patchValue(null);
      this.formDetails.get('recipient_id').updateValueAndValidity();
    }
  }
  onValueRecCCChange() {
    if (this.filterRecipientCC.value) {
      const searchString = this.utilService.simpleDiacriticSensitiveRegex(this.filterRecipientCC.value).toLowerCase().trim();
      this.filteredRecipientCCList = this.recipientCCList.filter((test) =>
        this.utilService.simpleDiacriticSensitiveRegex(test.name).toLowerCase().trim().includes(searchString),
      );
    } else {
      this.filteredRecipientCCList = this.recipientCCList;
      this.formDetails.get('recipient_cc_id').patchValue(null);
      this.formDetails.get('recipient_cc_id').updateValueAndValidity();
    }
  }
  onValueSigChange() {
    if (this.filterSignatory.value) {
      const searchString = this.utilService.simpleDiacriticSensitiveRegex(this.filterSignatory.value).toLowerCase().trim();
      this.filteredSignatoryList = this.signatoryList.filter((test) =>
        this.utilService.simpleDiacriticSensitiveRegex(test.name).toLowerCase().trim().includes(searchString),
      );
    } else {
      this.filteredSignatoryList = this.signatoryList;
      this.formDetails.get('signatory_id').patchValue(null);
      this.formDetails.get('signatory_id').updateValueAndValidity();
    }
  }

  saveNotifData(preview?,reminder?,hasErrorPreview?) {
    if (this.isPublished) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UserForm_S18.TITLE'),
        text: this.translate.instant('UserForm_S18.TEXT'),
        confirmButtonText: this.translate.instant('UserForm_S18.CONFIRM'),
      });
    } else {
      this.formDetails.get('body').markAsTouched();
      this.formDetails.get('body').markAsDirty();
      this.formDetails.get('body').patchValue(this.editor.getData());
      this.formDetails.get('recipient_cc_id').setValue(this.formDetails.get('recipient_cc_id').value);
      this.formDetails.get('recipient_id').setValue(this.formDetails.get('recipient_id').value);
      if (this.checkFormValidity()) {
        return;
      } else {
        const initialData = JSON.stringify(this.initialData);
        const currentData = JSON.stringify(this.formDetails.getRawValue());
        if (!preview && reminder && (initialData !== currentData || hasErrorPreview)) {
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
        const formData = this.formDetails.getRawValue();
        const payload = {
          type: formData.type,
          trigger_condition: formData.trigger_condition,
          recipient_id: formData.recipient_id,
          recipient_cc_id: formData.recipient_cc_id,
          signatory_id: formData.signatory_id,
          pdf_attachments: formData.pdf_attachments && formData.pdf_attachments.length ? formData.pdf_attachments : [],
          subject: formData.subject,
          body: formData.body,
          document_builder: formData.document_builder && formData.document_builder.length ? formData.document_builder : [],
          is_include_pdf_this_step: formData.is_include_pdf_this_step,
          financial_support_as_cc: formData.financial_support_as_cc,
        };
        this.cleanNullValues(payload);
        this.subs.sink = this.formBuilderService.UpdateStepNotificationAndMessage(this.refData._id, payload).subscribe(
          (resp) => {
            if (resp) {
              this.initialData = _.cloneDeep(this.formDetails.getRawValue());
              this.isFormChanged = false
              this.isFormUnchanged();
              this.isWaitingForResponse = false;
              if (!preview) {
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('Bravo!'),
                  confirmButtonText: this.translate.instant('OK'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then((action) => {
                  this.updateTabs.emit(true);
                  this.populateTriggerConditions();
                });
              } else {
                this.updateTabs.emit(true);
                this.populateTriggerConditions();
              }
            } else {
              this.isWaitingForResponse = false;
            }
          },
          (err) => {
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
    }
  }

  checkFormValidity(): boolean {
    this.formDetails.get('body').patchValue(this.editor.getData());
    if (this.formDetails.invalid) {
      const value = this.formDetails.value;
      if (
        !value.recipient_id ||
        !value.recipient_cc_id ||
        !value.signatory_id ||
        !value.body ||
        !value.subject ||
        !value.sending_condition
      ) {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('Invalid_Form_Warning.TITLE'),
          html: this.translate.instant('Invalid_Form_Warning.TEXT'),
          confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
        });
        this.filterRecipient.markAsTouched();
        this.filterSignatory.markAsTouched();
        this.trigerCondition.markAsTouched();
        this.trigerCondition.markAsDirty();
        this.formDetails.markAllAsTouched();
        this.formDetails.updateValueAndValidity();
        return true;
      } else if (!value.recipient_id || !value.recipient_cc_id || !value.signatory_id || !value.body || !value.subject) {
        return false;
      }
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
    const currentData = JSON.stringify(this.formDetails.getRawValue());
    if (initialData === currentData && !this.formDetails.invalid) {
      this.formBuilderService.childrenFormValidationStatus = true;
      return true;
    } else {
      this.formBuilderService.childrenFormValidationStatus = false;
      return false;
    }
  }

  displaySendingConditionFn(value) {
    if (value === 'validated') {
      return this.translate.instant('When step is Validated');
    } else if (value === 'rejected') {
      return this.translate.instant('When step is Rejected');
    } else if (value === 'send') {
      return this.translate.instant('When step is Send');
    } else if (value === 'done') {
      return this.translate.instant('When the task is Done');
    } else if (value === 'waiting_for_validation') {
      return this.translate.instant('When step is Submit and waiting for validation');
    } else if (value === 'need_to_sign_contract') {
      return this.translate.instant('When signatory is needed to sign the contract');
    } else if (value === 'all_signatory_signed') {
      return this.translate.instant('When All Signatory finish the contract signing');
    } else if (value === 'reminder') {
      return this.translate.instant('Reminder');
    } else {
      return value;
    }
  }

  addDocBuilderDocuemnt(dataToEdit?: { _id: string; name: string; type: string; scholar_id?: string }, indexInList?: number) {
    this.subs.sink = this.dialog
      .open(AddDocBuilderDocumentComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        panelClass: 'no-padding',
        data: dataToEdit ? dataToEdit : null,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          if (dataToEdit) {
            // handle on edit
            const dataFormArrayIndex = this.getDocBuilderFormarray().value.findIndex((doc) => doc.document_builder_id === dataToEdit._id);
            this.getDocBuilderFormarray().at(dataFormArrayIndex).patchValue(resp[1]);
            this.showDownload = true;
            const dataDocBuilder = {
              _id: resp[1].document_builder_id,
              // scholar_id: resp[1].document_builder_scholar_season,
              name: resp[0],
              type: 'doc_builder',
            };
            this.listData[indexInList] = dataDocBuilder;
          } else {
            // handle adding new
            const docBuilderForm = this.initDocBuilderForm();
            docBuilderForm.patchValue(resp[1]);
            this.getDocBuilderFormarray().push(docBuilderForm);
            this.showDownload = true;
            const dataDocBuilder = {
              _id: resp[1].document_builder_id,
              // scholar_id: resp[1].document_builder_scholar_season,
              name: resp[0],
              type: 'doc_builder',
            };
            this.listData.push(dataDocBuilder);
          }
        }
      });
  }

  setTeacherRecipient(item: any) {
    const isTeacher = item.filter((e) => e === 'Teacher');
    if (isTeacher && isTeacher.length) {
      this.teacher_as_recipient = true;
    } else {
      this.teacher_as_recipient = false;
    }
  }

  setTeacherCC(item: any) {
    const isTeacher = item.filter((e) => e === 'Teacher');
    if (isTeacher && isTeacher.length) {
      this.teacher_as_cc = true;
    } else {
      this.teacher_as_cc = false;
    }
  }

  setTeacherSignatory(item: any) {
    const isTeacher = item;
    if (isTeacher === 'Teacher') {
      this.teacher_as_signatory = true;
    } else {
      this.teacher_as_signatory = false;
    }
  }

  onEditDocument(data: { _id: string; name: string; type: string; scholar_id?: string }, indexInList: number) {
    switch (data.type) {
      case 'uploaded_doc':
        const file = this.uploadInput.nativeElement.click();
        this.currentEditPdfDocIndex = indexInList;
        break;
      case 'doc_builder':
        this.addDocBuilderDocuemnt(data, indexInList);
        break;
    }
  }

  async onDeleteDocument(data: { _id: string; name: string; type: string; scholar_id?: string }, indexInList: number) {
    let docIndex;
    const confirm = await this.fireSwalCountDown(data);
    if (!confirm.value) return;
    switch (data.type) {
      case 'uploaded_doc':
        docIndex = this.getAttachmentsFormarray().value.find((doc) => doc._id === data._id && doc._name === data.name);
        this.getAttachmentsFormarray().removeAt(docIndex);
        this.listData.splice(indexInList, 1);
        break;
      case 'doc_builder':
        docIndex = this.getDocBuilderFormarray().value.find((doc) => doc._id === data._id && doc._name === data.name);
        this.getDocBuilderFormarray().removeAt(docIndex);
        this.listData.splice(indexInList, 1);
        break;
    }
  }

  async fireSwalBravo() {
    return await Swal.fire({
      type: 'success',
      title: this.translate.instant('Bravo!'),
      confirmButtonText: this.translate.instant('OK'),
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    });
  }

  async fireSwalCountDown(data) {
    let timeDisabled = 2;
    return await Swal.fire({
      title: this.translate.instant('DELETE_ITEM_TEMPLATE.TITLE'),
      html: this.translate.instant('CONFIRMDELETE', {
        value: data.name ? data.name : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('THUMBSUP.SWEET_ALERT.CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
