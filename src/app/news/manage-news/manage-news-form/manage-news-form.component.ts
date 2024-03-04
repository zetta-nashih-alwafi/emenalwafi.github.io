import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CKEditorComponent } from '@ckeditor/ckeditor5-angular';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { NewsService } from 'app/news/news.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UtilityService } from 'app/service/utility/utility.service';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { Observable, observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
  selector: 'ms-manage-news-form',
  templateUrl: './manage-news-form.component.html',
  styleUrls: ['./manage-news-form.component.scss'],
})
export class ManageNewsFormComponent implements OnInit, OnDestroy {
  @Input() selectedData: any;
  @ViewChild('editor') editor: DecoupledEditor;
  public Editor = DecoupledEditor;
  public config = {
    placeholder: "Description de l'actualité...",
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

  @Output() onSaveNews: EventEmitter<any> = new EventEmitter();

  private subs = new SubSink();

  newsForm: FormGroup;
  isPublished: boolean = false;
  currentUser;
  createdBy;
  firstData: any;
  isWaitingForResponse = false;

  constructor(
    public _translate: TranslateService,
    private fb: FormBuilder,
    private _newsService: NewsService,
    private _utilityService: UtilityService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getLocalStorageUser();
    this.initForm();
    this.subs.sink = this.newsForm.valueChanges.subscribe((newValue) => {
      this._newsService.updateUserNewsConfig(newValue);
      this.comparison();
    });

    this.subs.sink = this._newsService.resetForm$.subscribe((resp) => {
      this.enableForm();
      if (resp) {
        this.saveNews();
      } else {
        this.newsForm.reset();
        this.newsForm.markAsUntouched();
        this.isPublished = false;
      }
    });

    this._newsService.newsId$.subscribe((data) => {
      if (data !== '') {
        this.getOneNews(data);
      } else {
        this.firstData = {
          _id: null,
          title: null,
          description: null,
        };
        this.enableForm();
        this.newsForm.reset();
        this.newsForm.markAsUntouched();
        this.isPublished = false;
      }
    });
  }

  initForm() {
    this.newsForm = this.fb.group({
      _id: [null],
      title: ['', [Validators.required, Validators.maxLength(300)]],
      description: ['', Validators.required],
    });
  }

  disableForm() {
    this.newsForm.get('_id').disable();
    this.newsForm.get('title').disable();
  }

  enableForm() {
    this.newsForm.get('_id').enable();
    this.newsForm.get('title').enable();
  }

  getOneNews(newsId) {
    this.isWaitingForResponse = true;
    this.subs.sink = this._newsService.getOneNews(newsId).subscribe((dataOneNews) => {
      this.isWaitingForResponse = false;
      const createData = {
        _id: dataOneNews?._id,
        title: dataOneNews?.title,
        description: dataOneNews?.description,
      };
      this.createdBy = dataOneNews?.created_by;
      this.isPublished = dataOneNews?.is_published;
      if (this.isPublished) {
        if (this.editor?.editorInstance) {
          this.editor.editorInstance.isReadOnly = true;
        }
        this.disableForm();
      } else {
        if (this.editor?.editorInstance) {
          this.editor.editorInstance.isReadOnly = false;
        }
        this.enableForm();
      }
      this.firstData = _.cloneDeep(createData);
      this.newsForm.patchValue(createData);
    });
  }

  saveNewsButton() {
    this.saveNews();
  }

  saveNews(publish?: boolean) {
    this.isWaitingForResponse = true;
    const currentUser = this._utilityService.getCurrentUser();

    if (this.newsForm.valid) {
      if (this.newsForm.get('_id').value) {
        const { _id, ...newsInput } = this.newsForm.value;
        newsInput.created_by = this.createdBy._id;
        // Update
        const newsId = this.newsForm.get('_id').value;
        this.subs.sink = this._newsService.updateNews(newsId, newsInput).subscribe((resp) => {
          Swal.fire({
            type: 'success',
            title: this._translate.instant('Bravo'),
            confirmButtonText: this._translate.instant('OK'),
            allowOutsideClick: false,
            allowEscapeKey: false,
            footer: '<span class="tw-w-full tw-text-end">Bravo_S1</span>',
          }).then(() => {
            const createData = {
              _id: resp?._id,
              title: resp?.title,
              description: resp?.description,
            };
            this.newsForm.patchValue(createData);
            this._newsService.updateUserNewsDataConfig(createData);
            this._newsService.setComparisonForm(true);
            this.isWaitingForResponse = false;
            if (publish) {
              const newsId = this.newsForm.get('_id').value;
              if (newsId) {
                this.publishNewsCallAPI(newsId);
                this.disableForm();
              }
            }
          });
        });
      } else {
        // CreateNews
        const { _id, ...newsInput } = this.newsForm.value;
        newsInput.created_by = currentUser._id;
        this.subs.sink = this._newsService.createNews(newsInput).subscribe((resp) => {
          Swal.fire({
            type: 'success',
            title: this._translate.instant('Bravo'),
            confirmButtonText: this._translate.instant('OK'),
            allowOutsideClick: false,
            allowEscapeKey: false,
            footer: '<span class="tw-w-full tw-text-end">Bravo_S1</span>',
          }).then(() => {
            const createData = {
              _id: resp?._id,
              title: resp?.title,
              description: resp?.description,
              created_by: {
                _id: this.currentUser._id,
              },
            };
            this.newsForm.patchValue(createData);
            this._newsService.updateUserNewsDataConfig(resp);
            this._newsService.updateNewsId(resp?._id);
            this._newsService.setComparisonForm(true);
            this.isWaitingForResponse = false;
            if (publish) {
              if (resp && resp?._id) {
                this.publishNewsCallAPI(resp?._id);
                this.disableForm();
              }
            }
          });
        });
      }
    } else {
      if (this.newsForm.get('title').hasError('maxlength')) {
        Swal.fire({
          type: 'warning',
          title: this._translate.instant('News_S6.TITLE'),
          html: this._translate.instant('News_S6.TEXT'),
          confirmButtonText: this._translate.instant('News_S6.BUTTON 1'),
          footer: '<span class="tw-w-full tw-text-end">News_S6</span>',
          allowOutsideClick: false,
          allowEnterKey: false,
          allowEscapeKey: false,
        });
      } else {
        Swal.fire({
          type: 'warning',
          title: this._translate.instant('FormSave_S1.TITLE'),
          html: this._translate.instant('FormSave_S1.TEXT'),
          confirmButtonText: this._translate.instant('FormSave_S1.BUTTON'),
          footer: '<span class="tw-w-full tw-text-end">FormSave_S1</span>',
          allowOutsideClick: false,
          allowEnterKey: false,
          allowEscapeKey: false,
        });
      }
      this.isWaitingForResponse = false;
      this.newsForm.markAllAsTouched();
    }
  }

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  publishNews(event: MatSlideToggleChange) {
    if (this.newsForm.get('title').hasError('maxlength')) {
      Swal.fire({
        type: 'warning',
        title: this._translate.instant('News_S6.TITLE'),
        html: this._translate.instant('News_S6.TEXT'),
        confirmButtonText: this._translate.instant('News_S6.BUTTON 1'),
        footer: '<span class="tw-w-full tw-text-end">News_S6</span>',
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: false,
      });
      if (event && event?.source) {
        event.source.checked = false;
      }
    } else if (this.newsForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this._translate.instant('FormSave_S1.TITLE'),
        html: this._translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this._translate.instant('FormSave_S1.BUTTON'),
        footer: '<span class="tw-w-full tw-text-end">FormSave_S1</span>',
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: false,
      });
      this.newsForm.markAllAsTouched();
      if (event && event?.source) {
        event.source.checked = false;
      }
    } else {
      if (!this.isPublished) {
        Swal.fire({
          type: 'warning',
          title: this._translate.instant('News_S1.TITLE'),
          html: this._translate.instant('News_S1.TEXT'),
          confirmButtonText: this._translate.instant('News_S1.BUTTON 1'),
          cancelButtonText: this._translate.instant('News_S1.BUTTON 2'),
          showCancelButton: true,
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
          footer: '<span class="tw-w-full tw-text-end">News_S1</span>',
        }).then((result) => {
          if (result.value) {
            this.saveNews(true);
          } else {
            if (event && event?.source) {
              event.source.checked = this.isPublished;
            }
          }
        });
      } else {
        Swal.fire({
          type: 'warning',
          title: this._translate.instant('News_S3.TITLE'),
          html: this._translate.instant('News_S3.TEXT'),
          confirmButtonText: this._translate.instant('News_S3.BUTTON 1'),
          cancelButtonText: this._translate.instant('News_S3.BUTTON 2'),
          showCancelButton: true,
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
          footer: '<span class="tw-w-full tw-text-end">News_S3</span>',
        }).then((result) => {
          if (result.value) {
            const newsId = this.newsForm.get('_id').value;
            if (newsId) {
              this._newsService.updateUserNewsDataConfig(result);
              this.unPublishNewsCallAPI(newsId);
            }
          } else {
            if (event && event?.source) {
              event.source.checked = this.isPublished;
            }
          }
        });
      }
    }
  }

  publishNewsCallAPI(id) {
    this.subs.sink = this._newsService.publishNews(id).subscribe((resp) => {
      this._newsService.updateUserNewsDataConfig([]);
      this._newsService.setComparisonForm(true);
      if (resp && resp?._id) {
        this._newsService.updateNewsId(resp?._id);
      }
    });
  }

  unPublishNewsCallAPI(id) {
    this.subs.sink = this._newsService.unPublishNews(id).subscribe((resp) => {
      this._newsService.updateUserNewsDataConfig([]);
      this._newsService.setComparisonForm(true);
      Swal.fire({
        type: 'success',
        title: this._translate.instant('Bravo'),
        confirmButtonText: this._translate.instant('OK'),
        allowOutsideClick: false,
        allowEscapeKey: false,
        footer: '<span class="tw-w-full tw-text-end">Bravo_S1</span>',
      }).then(() => {
        if (resp && resp?._id) {
          this._newsService.updateNewsId(resp?._id);
        }
      });
    });
  }

  comparison() {
    const firstForm = JSON.stringify(this.firstData);
    const form = JSON.stringify(this.newsForm.getRawValue());
    if (firstForm === form) {
      this._newsService.setComparisonForm(true);
      return true;
    } else {
      this._newsService.setComparisonForm(false);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
