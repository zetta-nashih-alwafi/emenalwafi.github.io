import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { map, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { DocumentIntakeBuilderService } from 'app/service/document-intake-builder/document-intake-builder.service';
import { environment } from 'environments/environment';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-document-template-builder-step',
  templateUrl: './document-template-builder-step.component.html',
  styleUrls: ['./document-template-builder-step.component.scss'],
})
export class DocumentTemplateBuilderStepComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() templateId;
  @Input() templateData;
  isWaitingForResponse = false;
  isTopWaitingForResponse = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  contract_template_published = new UntypedFormControl(false);
  contract_template_text: string;
  editor: any;
  dataCount = 0;
  private subs = new SubSink();
  scholarPeriodCount;
  titleData: any;
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
  noData: any;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  initialData: any = '';
  displayedColumns: string[] = ['key', 'description', 'action'];
  filterColumns: string[] = ['keyFilter', 'descriptionFilter', 'actionFilter'];
  filteredValues = {
    key: '',
    description: '',
  };

  pdfId;

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

  constructor(
    private translateService: TranslateService,
    private router: Router,
    private documentBuilderService: DocumentIntakeBuilderService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // console.log('_template', this.templateId);
    this.subs.sink = this.translateService.onLangChange.pipe().subscribe((result) => {
      if (result) {
        this.fetchKeysAndPopulateTable();
      }
    });
    this.initEditor();
    this.fetchKeysAndPopulateTable();
  }

  getIntakeBuilderData() {
    this.isTopWaitingForResponse = true;
    if (this.templateId) {
      this.isTopWaitingForResponse = true;
      this.subs.sink = this.documentBuilderService.getOneDocumentBuilder(this.templateId).subscribe(
        (resp) => {
          this.isTopWaitingForResponse = false;
          if (resp) {
            if (resp._id) {
              this.pdfId = resp._id;
            }
            if (resp.template_html) {
              this.editor.setData(resp.template_html);
              this.initialData = resp.template_html;
            }
            this.isTopWaitingForResponse = false;
          }
        },
        (error) => {
          this.authService.postErrorLog(error);
          this.isTopWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        },
      );
    }
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        tap(() => {
          if (!this.isReset) {
            this.fetchKeysAndPopulateTable();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  initEditor() {
    this.subs.sink = DecoupledEditor.create(document.querySelector('.document-editor__editable'), this.config)
      .then((editor) => {
        const toolbarContainer = document.querySelector('.document-editor__toolbar');
        toolbarContainer.appendChild(editor.ui.view.toolbar.element);
        this.editor = editor;
        if (this.templateData && this.templateData.is_published) {
          editor.isReadOnly = true;
        }
        this.getIntakeBuilderData();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  fetchKeysAndPopulateTable() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.documentBuilderService
      .getDocumentBuilderListOfKeys(this.templateData && this.templateData.document_type ? this.templateData.document_type : null)
      .subscribe(
        (resp) => {
          if (resp?.length) {
            this.isWaitingForResponse = false;
            this.dataSource.data = resp;
            this.dataCount = resp.length;
          }
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.dataSource.paginator = this.paginator;
        },
        (error) => {
          this.authService.postErrorLog(error);
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        },
      );
  }

  resetTable() {
    this.isReset = true;
    this.fetchKeysAndPopulateTable();
  }

  // handle copying click event
  async onCopyToClipBoard(element: { key: string; description: string }) {
    if (navigator.clipboard) {
      return await navigator.clipboard.writeText(element.key);
    }
  }

  publishPreContractForm(event: MatSlideToggleChange) {
    // console.log(event);
    if (event && event.checked) {
      Swal.fire({
        type: 'warning',
        title: this.translateService.instant('Are you sure?'),
        text: this.translateService.instant('This will publish the pre-contract form'),
        confirmButtonText: this.translateService.instant('Yes'),
        cancelButtonText: this.translateService.instant('No'),
        showCancelButton: true,
      }).then((result) => {
        return;
      });
    } else {
      Swal.fire({
        type: 'warning',
        title: this.translateService.instant('Are you sure?'),
        text: this.translateService.instant('This will unpublish the pre-contract form'),
        confirmButtonText: this.translateService.instant('Yes'),
        cancelButtonText: this.translateService.instant('No'),
        showCancelButton: true,
      }).then((result) => {
        return;
      });
    }
  }

  onSave(forPreview?) {
    this.isTopWaitingForResponse = true;
    const payload = {
      template_html: this.editor.getData(),
    };
    if (forPreview) {
      if (this.templateData && this.templateData.is_published) {
        this.onPreview();
      } else {
        if (this.templateId) {
          this.subs.sink = this.documentBuilderService.UpdateDocumentBuilder(this.templateId, payload).subscribe(
            (res) => {
              if (res) {
                this.onPreview();
              }
            },
            (error) => {
              this.authService.postErrorLog(error);
              this.isTopWaitingForResponse = false;
              Swal.fire({
                type: 'info',
                title: this.translateService.instant('SORRY'),
                text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translateService.instant('OK'),
              });
            },
          );
        } else {
          this.isTopWaitingForResponse = false;
        }
      }
    } else {
      if (this.templateId) {
        this.subs.sink = this.documentBuilderService.UpdateDocumentBuilder(this.templateId, payload).subscribe(
          (res) => {
            if (res) {
              this.isTopWaitingForResponse = false;
              Swal.fire({
                type: 'success',
                title: this.translateService.instant('Bravo!'),
                confirmButtonText: this.translateService.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.getIntakeBuilderData();
              });
            }
          },
          (error) => {
            this.authService.postErrorLog(error);
            this.isTopWaitingForResponse = false;
            Swal.fire({
              type: 'info',
              title: this.translateService.instant('SORRY'),
              text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translateService.instant('OK'),
            });
          },
        );
      } else {
        this.isTopWaitingForResponse = false;
      }
    }
  }

  onPreview() {
    if (this.templateId) {
      this.isTopWaitingForResponse = true;
      this.subs.sink = this.documentBuilderService.GeneratePreviewForDocumentBuilder(this.templateId).subscribe(
        (res) => {
          if (res) {
            this.isTopWaitingForResponse = false;
            this.downloadDoc(res);
          } else {
            this.isTopWaitingForResponse = false;
          }
        },
        (error) => {
          this.authService.postErrorLog(error);
          this.isTopWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        },
      );
    }
  }

  sortData(sort) {}

  isFormUnchanged() {
    // if (!this.editor) {
    //   return;
    // }
    // if (!this.initialData) {
    //   return false;
    // }
    const initialData = JSON.stringify(this.initialData);
    const currentData = JSON.stringify(this.editor.getData());
    // console.log('_vali', initialData, currentData);

    if (initialData === currentData) {
      this.documentBuilderService.setDocumentTemplateSaved(true);
      return true;
    } else {
      this.documentBuilderService.setDocumentTemplateSaved(false);
      return false;
    }
  }

  downloadDoc(filename: string) {
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = `${environment.apiUrl}/fileuploads/${filename}?download=true`.replace('/graphql', '');
    a.download = filename;
    a.click();
    a.remove();
  }

  leave() {
    // this.router.navigate(['teacher-contract/contract-template']);
    this.router.navigate(['/document-builder']);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
