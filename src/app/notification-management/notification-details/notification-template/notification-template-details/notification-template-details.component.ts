import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { NotificationManagementService } from 'app/notification-management/notification-management.service';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-notification-template-details',
  templateUrl: './notification-template-details.component.html',
  styleUrls: ['./notification-template-details.component.scss'],
})
export class NotificationTemplateDetailsComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() lang: any;
  @Input() Id: any;
  @Input() published: any;
  private subs = new SubSink();
  isWaitingForResponse: boolean = false;

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

  displayedColumns: string[] = ['key', 'description', 'action'];
  filterColumns: string[] = ['keyFilter', 'descriptionFilter', 'actionFilter'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);

  dummyData = [
    {
      key: '${user_civility}',
      description: 'description of civility',
    },
    {
      key: '${user_first_name}',
      description: 'description of user first name',
    },
    {
      key: '${user_last_name}',
      description: 'description of user last name',
    },
  ];

  dataCount = 0;
  noData: any;
  notificationId: any;
  templateForm: UntypedFormGroup;
  templateData: any;
  subjectDataEN: any;
  subjectDataFR: any;
  bodyData: any;

  constructor(
    private notificationService: NotificationManagementService,
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private translateService: TranslateService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initTemplateForm();
    this.getOneTemplate();
    // this.route.queryParams.subscribe((params) => {
    //   if (params['id']) {
    //     this.notificationId = params['id'];
    //     this.getDataTableKey(params['id']);
    //   }
    // });

    this.notificationId = this.route.snapshot.queryParamMap.get('id');
    if (this.notificationId) {
      this.getDataTableKey(this.notificationId);
    }

    this.subs.sink = this.translateService.onLangChange.pipe().subscribe((res: LangChangeEvent) => {
      this.getDataTableKey(this.notificationId);
    });
  }

  ngAfterViewInit() {
    this.initEditor();
  }

  initTemplateForm() {
    this.templateForm = this.fb.group({
      notification_reference_id: [null],
      is_default_template: [false],
      program_seasons: [null],
      template_name: [null],
      subject_en: [null],
      subject_fr: [null],
      en: [null],
      fr: [null],
      is_publish: [null],
      status: [null],
    });
  }

  getOneTemplate() {
    if (this.Id) {
      this.subs.sink = this.notificationService.getOneTemplate(this.Id).subscribe(
        (res) => {
          if (res) {
            const response = _.cloneDeep(res);
            this.templateData = response;
            // console.log('_res', response);

            // console.log('templateData', this.templateData);
            // this.initEditor();
            if (this.editor && this.templateData && this.templateData.is_publish && !this.templateData.is_default_template) {
              this.editor.isReadOnly = true;
            } else if (this.editor) {
              this.editor.isReadOnly = false;
            }

            if (this.lang === 'EN' && response.en && this.editor) {
              this.editor.setData(response.en);
              this.templateData.en = this.editor.getData();
            }
            if (this.lang === 'FR' && response.fr && this.editor) {
              this.editor.setData(response.fr);
              this.templateData.fr = this.editor.getData();
            }
            this.templateForm.patchValue(response);
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: err && err['message'] ? this.translateService.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translateService.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
  }

  mapKeyGroups(response) {
    const parentData = _.cloneDeep(response);
    let keyList = _.cloneDeep(response?.keys);
    const keyGroupList = _.cloneDeep(response?.key_groups);
    let listKeyFromGroup = [];
    if (response?.key_groups?.length) {
      keyGroupList.forEach((element) => {
        const list = element?.keys.map((resp) => {
          return {
            key: resp?.key,
            description: this.translateService?.currentLang === 'fr' ? resp?.fr_description : resp?.en_description,
          };
        });
        listKeyFromGroup = _.concat(list, listKeyFromGroup);
      });
    }
    keyList = _.concat(keyList, listKeyFromGroup);
    this.dataSource.data = keyList;
    this.dataSource.paginator = this.paginator;
    this.dataCount = keyList.length;
  }

  getDataTableKey(id) {
    this.isWaitingForResponse = true;
    if (id) {
      this.subs.sink = this.notificationService.getOneTemplateKey(id).subscribe(
        (res) => {
          if (res) {
            this.isWaitingForResponse = false;
            const response = _.cloneDeep(res);
            if ((response.keys && response.keys.length > 0) || (response.key_groups && response.key_groups.length > 0)) {
              this.mapKeyGroups(response);
            } else {
              this.dataSource.data = [];
              this.dataCount = 0;
              this.dataSource.paginator = this.paginator;
            }
            this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          this.dataSource.data = [];
          this.dataCount = 0;
          this.dataSource.paginator = this.paginator;
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: err && err['message'] ? this.translateService.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translateService.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
  }

  ngOnChanges() {
    // Call api
    this.resetEditor();
    this.refetch();
  }

  refetch() {
    this.subjectDataFR = true;
    this.subjectDataEN = true;
    this.bodyData = true;
    this.initTemplateForm();
    if (this.Id) {
      this.getOneTemplate();
    }
    if (this.notificationId) {
      this.getDataTableKey(this.notificationId);
    }
  }

  initEditor() {
    DecoupledEditor.create(document.querySelector('.editor_' + this.Id), this.config)
      .then((editor) => {
        if (editor) {
          const toolbarContainer = document.querySelector('.editor-toolbar_' + this.Id);
          toolbarContainer.appendChild(editor.ui.view.toolbar.element);
          this.editor = editor;
        }
        // if (this.templateData && this.templateData.is_publish) {
        //   editor.isReadOnly = true;
        // } else {
        //   editor.isReadOnly = false;
        // }
        // this.getOneTemplate();
      })
      .catch((err) => {
        // console.error(err);
      });
    // console.log('_editor', this.editor, DecoupledEditor);
  }

  async onCopyToClipBoard(element: { key: string; description: string }) {
    if (navigator.clipboard) {
      return await navigator.clipboard.writeText(element.key);
    }
  }

  createPayload() {
    const payload = _.cloneDeep(this.templateForm.value);
    if (this.lang === 'EN') {
      payload.en = this.editor.getData();
    }
    if (this.lang === 'FR') {
      payload.fr = this.editor.getData();
    }
    return payload;
  }

  disablePublish() {
    const payload = _.cloneDeep(this.templateForm.value);
    if (this.lang === 'EN') {
      payload.en = this.editor.getData();
    }
    if (this.lang === 'FR') {
      payload.fr = this.editor.getData();
    }
    if (payload && payload.en && payload.fr && payload.subject_en && payload.subject_fr) {
      return false;
    } else {
      return true;
    }
  }

  checkComparison() {
    const payload = _.cloneDeep(this.templateForm.value);
    const initial = _.cloneDeep(this.templateData);

    let formData;
    let initialData;
    if (this.lang === 'EN') {
      payload.en = this.editor.getData();
      formData = {
        en: payload?.en,
        subject_en: payload?.subject_en,
      };
      initialData = {
        en: initial?.en,
        subject_en: initial?.subject_en,
      };
    }
    if (this.lang === 'FR') {
      payload.fr = this.editor.getData();
      formData = {
        fr: payload?.fr,
        subject_fr: payload?.subject_fr,
      };
      initialData = {
        fr: initial?.fr,
        subject_fr: initial?.subject_fr,
      };
    }

    if (
      JSON.stringify(formData) === JSON.stringify(initialData) ||
      (this.templateData?.is_publish && !this.templateData?.is_default_template)
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkIsFieldFilled() {
    if (this.editor) {
      this.bodyData = this.editor.getData() ? true : false;
    } else {
      this.bodyData = false;
    }
    if (this.lang === 'EN' && this.templateForm.get('subject_en').value) {
      this.subjectDataEN = true;
    } else {
      this.subjectDataEN = false;
    }
    if (this.lang === 'FR' && this.templateForm.get('subject_fr').value) {
      this.subjectDataFR = true;
    } else {
      this.subjectDataFR = false;
    }
  }

  resetEditor() {
    const querySelector = document.querySelectorAll('.document-editor__toolbar');
    for (let i = 0; i < querySelector.length; i++) {
      if (!querySelector[i].className.includes(this.Id)) {
        querySelector[i].remove();
      }
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
