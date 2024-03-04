import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UserService } from 'app/service/user/user.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import * as _ from 'lodash';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { DocumentIntakeBuilderService } from 'app/service/document-intake-builder/document-intake-builder.service';

@Component({
  selector: 'ms-notification-details',
  templateUrl: './notification-details.component.html',
  styleUrls: ['./notification-details.component.scss'],
})
export class NotificationDetailsComponent implements OnInit {
  @Input() refSelected: any;
  @Input() templateType: any;
  @Input() isPublished: boolean;
  @Input() templateId: string;
  @Output() updateTabs = new EventEmitter();

  @ViewChild('handlePdf', { static: false }) uploadInput: any;
  includePdf = false;
  showDownload = false;
  private subs = new SubSink();
  listData = [];
  listShowContract = ['teacher_contract', 'fc_contract'];
  isWaitingForResponse = false;
  formDetails: UntypedFormGroup;

  recipientList: any;
  recipientListFilter: Observable<any[]>;
  cctList: any;
  ccListFilter: Observable<any[]>;
  signatoryList: any;
  signatoryListFilter: Observable<any[]>;
  includeDocBuilder = false;

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
  scholars: any[];
  documentBuilders: any[];

  constructor(
    private utilService: UtilityService,
    private fileUploadService: FileUploadService,
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private userService: UserService,
    private contractService: TeacherContractService,
    private formBuilderService: FormBuilderService,
    private financeService: FinancesService,
    private documentService: DocumentIntakeBuilderService,
  ) {}

  ngOnInit() {
    this.getScholarSeasons();
    if (this.templateType === 'teacher_contract') {
      this.initFormDetailsContract();
      this.getuserTypeDropdown();
    } else {
      this.initFormDetails();
      this.getUserTypes();
    }
    this.initEditor();
  }

  initEditor() {
    this.subs.sink = DecoupledEditor.create(document.querySelector('.document-editor__editable'), this.config)
      .then((editor) => {
        const toolbarContainer = document.querySelector('.document-editor__toolbar');
        toolbarContainer.appendChild(editor.ui.view.toolbar.element);
        this.editor = editor;
        this.patchNotifForm();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  initFormDetails() {
    this.formDetails = this.fb.group({
      ref_id: [this.refSelected.ref_id, [Validators.required]],
      recipient_id: [null, [Validators.required]],
      recipient_cc_id: [null],
      signatory_id: [null, [Validators.required]],
      is_include_pdf_this_step: [false],
      is_attach_document_builder: [false],
      document_builder_scholar_season: [null],
      document_builder_id: [null],
      pdf_attachments: [null],
      subject: [null, [Validators.required]],
      body: [null, [Validators.required]],
      financial_support_as_cc: [null],
    });

    this.formDetails.get('ref_id').disable();
  }

  initFormDetailsContract() {
    this.formDetails = this.fb.group({
      ref_id: [this.refSelected.ref_id, [Validators.required]],
      recipient_id: [null, [Validators.required]],
      recipient_cc_id: [null],
      signatory_id: [null, [Validators.required]],
      is_include_pdf_this_step: [false],
      is_attach_document_builder: [false],
      document_builder_scholar_season: [null],
      document_builder_id: [null],
      pdf_attachments: [null],
      subject: [null, [Validators.required]],
      body: [null, [Validators.required]],
      teacher_as_cc: [null],
      teacher_as_recipient: [null],
      teacher_as_signatory: [null],
    });

    if (this.isPublished) {
      this.formDetails.disable();
    }
  }

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  patchNotifFormForAlumni() {
    console.log(this.refSelected);
    this.isWaitingForResponse = true;
    if (this.refSelected) {
      const pagination = {
        limit: 10,
        page: 0,
      };
      this.subs.sink = this.formBuilderService
        .GetAllStepNotificationsAndMessagesForAlumni(this.refSelected.form_builder_id._id, this.refSelected.step_id._id, pagination)
        .subscribe(
          (resp) => {
            if (resp && resp.length) {
              let notifData = _.cloneDeep(resp);
              console.log(notifData);
              notifData = notifData.find((ressp) => ressp.type === 'notification');
              if (notifData) {
                notifData.recipient_id =
                  notifData.recipient_id && notifData.recipient_id.length ? notifData.recipient_id.map((list) => list._id) : null;
                notifData.recipient_cc_id =
                  notifData.recipient_cc_id && notifData.recipient_cc_id.length ? notifData.recipient_cc_id.map((list) => list._id) : null;
                notifData.signatory_id = notifData.signatory_id ? notifData.signatory_id._id : null;
                console.log('notifData', notifData);

                if (notifData && notifData.pdf_attachments && notifData.pdf_attachments.length > 0) {
                  this.listData = [];
                  notifData.pdf_attachments.forEach((res) => {
                    this.listData.push(res);
                  });
                  this.showDownload = true;
                  this.formDetails.get('pdf_attachments').setValue(this.listData);
                }
                if (notifData && notifData.is_include_pdf_this_step) {
                  this.includePdf = true;
                }

                this.formDetails.patchValue(notifData);
                console.log('Patch', this.formDetails.value);
                this.initialData = _.cloneDeep(this.formDetails.getRawValue());
                this.initValueChange();
                this.editor.setData(notifData.body);
              }
            }
            this.isWaitingForResponse = false;
          },
          (err) => {
            console.log(err);
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

  patchNotifFormForContract() {
    console.log(this.refSelected);
    this.isWaitingForResponse = true;
    if (this.refSelected) {
      const pagination = {
        limit: 10,
        page: 0,
      };
      this.subs.sink = this.formBuilderService
        .GetAllStepNotificationsAndMessagesForContract(this.refSelected.form_builder_id._id, this.refSelected.step_id._id, pagination)
        .subscribe(
          (resp) => {
            if (resp && resp.length) {
              let notifData = _.cloneDeep(resp);
              console.log(notifData);
              notifData = notifData.find((ressp) => ressp.type === 'notification');
              if (notifData) {
                notifData.recipient_id =
                  notifData.recipient_id && notifData.recipient_id.length ? notifData.recipient_id.map((list) => list._id) : [];
                notifData.recipient_cc_id =
                  notifData.recipient_cc_id && notifData.recipient_cc_id.length ? notifData.recipient_cc_id.map((list) => list._id) : [];
                notifData.signatory_id = notifData.signatory_id ? notifData.signatory_id._id : null;

                if (notifData && notifData.teacher_as_recipient && notifData.recipient_id) {
                  notifData.recipient_id.push('Teacher');
                  this.teacher_as_recipient = notifData.teacher_as_recipient;
                }
                if (notifData && notifData.teacher_as_cc && notifData.recipient_cc_id) {
                  notifData.recipient_cc_id.push('Teacher');
                  this.teacher_as_cc = notifData.teacher_as_cc;
                }
                if (notifData && notifData.teacher_as_signatory) {
                  notifData.signatory_id = 'Teacher';
                  this.teacher_as_signatory = notifData.teacher_as_signatory;
                }
                if (notifData && notifData.pdf_attachments && notifData.pdf_attachments.length > 0) {
                  this.listData = [];
                  notifData.pdf_attachments.forEach((res) => {
                    this.listData.push(res);
                  });
                  this.showDownload = true;
                  this.formDetails.get('pdf_attachments').setValue(this.listData);
                }
                if (notifData && notifData.is_include_pdf_this_step) {
                  this.includePdf = true;
                }

                this.formDetails.patchValue(notifData);
                console.log('Patch', this.formDetails.value);
                this.initialData = _.cloneDeep(this.formDetails.getRawValue());
                this.initValueChange();
                this.editor.setData(notifData.body);
              }
            }
            this.isWaitingForResponse = false;
          },
          (err) => {
            console.log(err);
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

  patchNotifForm() {
    if (this.templateType === 'alumni') {
      this.patchNotifFormForAlumni();
    } else if (this.templateType === 'teacher_contract' || this.templateType === 'fc_contract') {
      this.patchNotifFormForContract();
    } else if (this.templateType === 'student_admission' || this.templateType === 'admission_document') {
      console.log(this.refSelected);
      this.isWaitingForResponse = true;
      if (this.refSelected) {
        const pagination = {
          limit: 10,
          page: 0,
        };
        this.subs.sink = this.formBuilderService
          .GetAllStepNotificationsAndMessages(this.refSelected.form_builder_id._id, this.refSelected.step_id._id, pagination)
          .subscribe(
            (resp) => {
              if (resp && resp.length) {
                let notifData = _.cloneDeep(resp);
                console.log(notifData);
                notifData = notifData.find((ressp) => ressp.type === 'notification');
                if (notifData) {
                  notifData.recipient_id =
                    notifData.recipient_id && notifData.recipient_id.length ? notifData.recipient_id.map((list) => list._id) : null;
                  notifData.recipient_cc_id =
                    notifData.recipient_cc_id && notifData.recipient_cc_id.length
                      ? notifData.recipient_cc_id.map((list) => list._id)
                      : null;
                  notifData.signatory_id = notifData.signatory_id ? notifData.signatory_id._id : null;
                  notifData.document_builder_scholar_season = notifData.document_builder_scholar_season
                    ? notifData.document_builder_scholar_season._id
                    : null;
                  notifData.document_builder_id = notifData.document_builder_id ? notifData.document_builder_id._id : null;
                  console.log('notifData', notifData, this.listData);
                  if (notifData && notifData.pdf_attachments && notifData.pdf_attachments.length > 0) {
                    this.listData = [];
                    notifData.pdf_attachments.forEach((res) => {
                      this.listData.push(res);
                    });
                    this.showDownload = true;
                    this.formDetails.get('pdf_attachments').setValue(this.listData);
                  }
                  if (notifData && notifData.is_include_pdf_this_step) {
                    this.includePdf = true;
                  }
                  if (notifData && notifData.is_attach_document_builder) {
                    this.includeDocBuilder = true;
                    this.getAllDocumentBuilders(notifData.document_builder_scholar_season);
                  }

                  this.formDetails.patchValue(notifData);
                  console.log('Patch', this.formDetails.value);
                  this.initialData = _.cloneDeep(this.formDetails.getRawValue());
                  this.initValueChange();
                  this.editor.setData(notifData.body);
                }
              }
              this.isWaitingForResponse = false;
            },
            (err) => {
              console.log(err);
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

  initValueChange() {
    this.formDetails.valueChanges.subscribe(() => {
      this.isFormUnchanged();
    });
  }

  onSelectInclude(event) {
    if (this.listData.length > 0 || this.includeDocBuilder) {
      console.log('1');

      event.preventDefault();
      // this.formDetails.get('is_include_pdf_this_step').setValue(false);
      this.alreadyUploadFileSwalForIncludePDF();
    } else {
      event.preventDefault();
      this.includePdf = !this.includePdf;
      this.includeDocBuilder = false;
      this.formDetails.get('is_include_pdf_this_step').setValue(this.includePdf);
      this.formDetails.get('is_attach_document_builder').setValue(this.includeDocBuilder);
      this.formDetails.get('document_builder_scholar_season').patchValue(null);
      this.formDetails.get('document_builder_id').patchValue(null);
    }
  }

  onSelectDocBuilder(event) {
    if (this.listData.length > 0) {
      console.log('1');

      event.preventDefault();
      // this.formDetails.get('is_include_pdf_this_step').setValue(false);
      this.alreadyUploadFileSwalForIncludePDF();
    } else {
      event.preventDefault();
      this.includePdf = false;
      this.includeDocBuilder = !this.includeDocBuilder;
      this.formDetails.get('is_include_pdf_this_step').setValue(this.includePdf);
      this.formDetails.get('is_attach_document_builder').setValue(this.includeDocBuilder);
      if (this.includeDocBuilder) {
        this.formDetails.get('document_builder_id').disable();
      } else {
        this.formDetails.get('document_builder_scholar_season').patchValue(null);
        this.formDetails.get('document_builder_id').patchValue(null);
      }
    }
  }

  toggleShowDownload(from?) {
    if ((this.includePdf || this.includeDocBuilder) && !from) {
      this.hasIncludePDFStep();
    } else if (this.listData.length === 1 && !from) {
      this.alreadyUploadFileSwal();
    } else {
      const file = this.uploadInput.nativeElement.click();
    }
  }

  handleInputChange(fileInput: Event) {
    const acceptable = ['pdf'];
    this.isWaitingForResponse = true;
    if ((<HTMLInputElement>fileInput.target).files.length > 0) {
      const file = (<HTMLInputElement>fileInput.target).files[0];
      const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
      if (acceptable.includes(fileType)) {
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (resp) => {
            if (resp) {
              this.listData = [];
              this.showDownload = true;
              console.log('response of file input is:', resp);
              const fileUpdated = resp.s3_file_name;
              this.listData.push(fileUpdated);
              this.isWaitingForResponse = false;
              this.formDetails.get('pdf_attachments').setValue(this.listData);
              console.log('_form', this.formDetails.value);
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            this.showDownload = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            }).then((res) => {
              console.log('[BE Message] Error is : ', err);
            });
          },
        );
      } else {
        this.isWaitingForResponse = false;
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
    this.uploadInput.nativeElement.value = '';
  }

  deletePDF(data) {
    let timeDisabled = 6;
    Swal.fire({
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
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then(() => {
          this.listData = [];
          this.formDetails.get('pdf_attachments').setValue(this.listData);
        });
      }
    });
  }

  getuserTypeDropdown() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formBuilderService.getContractSignatoryDropdown(this.templateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.recipientList = resp.contract_signatory;
          this.signatoryList = resp.contract_signatory;
          this.cctList = resp.contract_signatory;

          this.recipientList = this.recipientList.filter((list) => list.name !== 'Teacher' && list.name !== 'Contract Manager');
          this.cctList = this.cctList.filter((list) => list.name !== 'Teacher' && list.name !== 'Contract Manager');
          this.signatoryList = this.signatoryList.filter((list) => list.name !== 'Teacher' && list.name !== 'Contract Manager');

          const user = this.formDetails.get('signatory_id').value;
          this.formDetails.get('signatory_id').setValue(user);
          console.log(this.formDetails.get('signatory_id').value);
        }
      },
      (err) => {
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

  getUserTypes() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.getAllUserTypeWithStudent().subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.recipientList = resp;
        this.signatoryList = resp;
        this.cctList = resp;

        if (this.templateType === 'fc_contract') {
          this.recipientList = this.recipientList.filter((x) => x._id !== '61dd3ccff647127fd6bf65d7');
          this.signatoryList = this.signatoryList.filter((x) => x._id !== '61dd3ccff647127fd6bf65d7');
          this.cctList = this.cctList.filter((x) => x._id !== '61dd3ccff647127fd6bf65d7');
        }

        // this.recipientListFilter = this.formDetails.get('recipient_id').valueChanges.pipe(
        //   startWith(''),
        //   map((searchText) =>
        //     this.recipientList
        //       .filter((data) => (data ? data.name.toLowerCase().includes(searchText.toLowerCase()) : false))
        //       .sort((a: any, b: any) => a.name.localeCompare(b.name)),
        //   ),
        // );

        // this.ccListFilter = this.formDetails.get('recipient_cc_id').valueChanges.pipe(
        //   startWith(''),
        //   map((searchText) =>
        //     this.cctList
        //       .filter((data) => (data ? data.name.toLowerCase().includes(searchText.toLowerCase()) : false))
        //       .sort((a: any, b: any) => a.name.localeCompare(b.name)),
        //   ),
        // );
        const user = this.formDetails.get('signatory_id').value;
        this.formDetails.get('signatory_id').setValue(user);
        console.log(this.formDetails.get('signatory_id').value);
        this.signatoryListFilter = this.formDetails.get('signatory_id').valueChanges.pipe(
          map((searchText) => {
            return this.signatoryList
              .filter((data) => (data ? data.name.toLowerCase().includes(searchText.toLowerCase()) : false))
              .sort((a: any, b: any) => a.name.localeCompare(b.name));
          }),
        );
      },
      (err) => {
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

  displayUserTypeNameFn(id) {
    if (!id || !(this.recipientList && this.recipientList.length)) {
      return '';
    }
    // since recipient, signatory, and cc list all contain same object, it doesn't matter where it search value from
    const index = this.recipientList.findIndex((type) => type._id === id);
    return index >= 0 ? this.translate.instant('USER_TYPES.' + this.recipientList[index].name) : '';
  }

  recipientSelected(value) {
    // filter
  }

  ccSelected(value) {}

  signatorySelected(value) {}

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

  saveNotifData() {
    console.log(this.formDetails);
    if (this.isPublished) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UserForm_S18.TITLE'),
        text: this.translate.instant('UserForm_S18.TEXT'),
        confirmButtonText: this.translate.instant('UserForm_S18.CONFIRM'),
      });
    } else {
      this.formDetails.get('body').patchValue(this.editor.getData());

      if (this.templateType === 'teacher_contract') {
        this.formDetails.get('teacher_as_recipient').setValue(this.teacher_as_recipient);
        this.formDetails.get('teacher_as_cc').setValue(this.teacher_as_cc);
        this.formDetails.get('teacher_as_signatory').setValue(this.teacher_as_signatory);
      } else {
        this.formDetails.get('recipient_cc_id').setValue(this.formDetails.get('recipient_cc_id').value);
        this.formDetails.get('recipient_id').setValue(this.formDetails.get('recipient_id').value);
      }
      if (this.checkFormValidity()) {
        return;
      } else {
        this.isWaitingForResponse = true;
        const payload = this.formDetails.getRawValue();
        if (this.templateType === 'teacher_contract') {
          payload.recipient_id = payload.recipient_id.filter((res) => res !== 'Teacher');
          payload.recipient_cc_id = payload.recipient_cc_id.filter((res) => res !== 'Teacher');

          // Teacher as signatory
          if (payload.signatory_id === 'Teacher') {
            payload.signatory_id = null;
          }
        }
        this.cleanNullValues(payload);
        console.log('payload', payload);
        this.formBuilderService.UpdateStepNotificationAndMessage(this.refSelected._id, payload).subscribe((resp) => {
          if (resp) {
            console.log('resp save', resp);
            this.initialData = _.cloneDeep(this.formDetails.getRawValue());
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
    if (this.formDetails.invalid) {
      if (this.formDetails.get('recipient_id').value == null || this.formDetails.get('recipient_cc_id').value == null) {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('Invalid_Form_Warning.TITLE'),
          html: this.translate.instant('Invalid_Form_Warning.TEXT'),
          confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
        });
        this.formDetails.markAllAsTouched();
        return true;
      } else if (
        (this.formDetails.get('recipient_id').value === null && this.formDetails.get('teacher_as_recipient').value === false) ||
        (this.formDetails.get('recipient_cc_id').value === null && this.formDetails.get('teacher_as_cc').value === false) ||
        (this.formDetails.get('signatory_id').value === null && this.templateType !== 'teacher_contract') ||
        (this.templateType === 'teacher_contract' &&
          this.formDetails.get('teacher_as_signatory').value === false &&
          this.formDetails.get('signatory_id').value === null)
      ) {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('Invalid_Form_Warning.TITLE'),
          html: this.translate.instant('Invalid_Form_Warning.TEXT'),
          confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
        });
        this.formDetails.markAllAsTouched();
        return true;
      } else if (
        (this.formDetails.get('recipient_id').value === null && this.formDetails.get('teacher_as_recipient').value === true) ||
        (this.formDetails.get('recipient_cc_id').value === null && this.formDetails.get('teacher_as_cc').value === true) ||
        (this.formDetails.get('signatory_id').value === null && this.templateType !== 'teacher_contract') ||
        (this.templateType === 'teacher_contract' &&
          this.formDetails.get('teacher_as_signatory').value === true &&
          this.formDetails.get('signatory_id').value === null)
      ) {
        return false;
      } else if (this.formDetails.get('recipient_id').value == null || this.formDetails.get('recipient_cc_id').value == null) {
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
    // const initialData = JSON.stringify(this.initialData);
    // const currentData = JSON.stringify(this.formDetails.getRawValue());
    const currentForm = this.formDetails.getRawValue();
    currentForm.body = this.editor.getData();
    const initialData = JSON.stringify(this.initialData);
    const currentData = JSON.stringify(currentForm);
    if (initialData === currentData) {
      this.formBuilderService.childrenFormValidationStatus = true;
      return true;
    } else {
      this.formBuilderService.childrenFormValidationStatus = false;
      return false;
    }
  }

  setTeacherRecipient(item: any) {
    console.log('item', item);
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
      console.log(this.teacher_as_cc);
    } else {
      this.teacher_as_cc = false;
    }
  }

  setTeacherSignatory(item: any) {
    console.log('item', item);
    const isTeacher = item;
    if (isTeacher === 'Teacher') {
      this.teacher_as_signatory = true;
    } else {
      this.teacher_as_signatory = false;
    }
  }
  showContract() {
    let show = false;
    const type = this.templateType;
    if (type && this.listShowContract.includes(type)) {
      show = true;
    }
    return show;
  }

  getScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp) {
          this.scholars = resp;
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  handleDocumentBuilderScholarSeasonSelected() {
    // enable document_builder_id
    this.formDetails.get('document_builder_id').enable();
    this.formDetails.get('document_builder_id').patchValue(null);
    this.getAllDocumentBuilders();
  }

  getAllDocumentBuilders(fromPopulate?) {
    let scholar_season_id = this.formDetails.get('document_builder_scholar_season').value;
    if (fromPopulate) {
      scholar_season_id = fromPopulate;
    } else {
      scholar_season_id = this.formDetails.get('document_builder_scholar_season').value;
    }
    const filter = {
      status: true,
      scholar_season_id,
    };
    this.subs.sink = this.documentService.getAllDocumentsDropdown(filter).subscribe(
      (resp) => {
        if (resp) {
          this.documentBuilders = resp;
        }
      },
      (err) => {
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
