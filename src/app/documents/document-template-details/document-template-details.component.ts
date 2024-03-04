import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup, MatTab, MatTabHeader } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { DocumentIntakeBuilderService } from 'app/service/document-intake-builder/document-intake-builder.service';
import { Observable } from 'rxjs';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { DocumentTemplateBuilderStepComponent } from './document-template-builder-step/document-template-builder-step.component';
import { DocumentTemplateParameterStepComponent } from './document-template-parameter-step/document-template-parameter-step.component';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-document-template-details',
  templateUrl: './document-template-details.component.html',
  styleUrls: ['./document-template-details.component.scss'],
})
export class DocumentTemplateDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('docBuilderTabGroup', { static: false }) docBuilderTabGroup: MatTabGroup;
  @ViewChild('documentBuilder', { static: false }) documentBuilders: DocumentTemplateBuilderStepComponent;
  @ViewChild('documentParameter', { static: false }) documentParameters: DocumentTemplateParameterStepComponent;

  templateIsPublished = false;
  private subs = new SubSink();
  templateId: any;
  templateData: any;
  templateName: any;
  selectedIndex = 0;
  isDocumentTemplateSaved = true;

  constructor(
    private router: ActivatedRoute,
    private translate: TranslateService,
    private pageTitleService: PageTitleService,
    private documentBuilderService: DocumentIntakeBuilderService,
    private translateService: TranslateService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.router.queryParams.subscribe((res) => {
      if (res && res.templateId) {
        this.templateId = res.templateId;
        this.getTemplateData();
      }
    });

    this.subs.sink = this.documentBuilderService.isDocumentTemplateSaved.subscribe((val) => {
      this.isDocumentTemplateSaved = val;
    });
    // ************* Used for validation
    setTimeout(() => {
      this.docBuilderTabGroup._handleClick = this.interceptTabChange.bind(this);
    }, 500);

    const name = this.translate.instant('Document Template');
    this.pageTitleService.setTitle(name + (this.templateName ? ' - ' + this.templateName : ''));

    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      const names = this.translate.instant('Document Template');
      this.pageTitleService.setTitle(names + (this.templateName ? ' - ' + this.templateName : ''));
    });
  }

  getTemplateData() {
    this.subs.sink = this.documentBuilderService.getOneDocumentBuilder(this.templateId).subscribe(
      (resp) => {
        if (resp) {
          this.templateData = _.cloneDeep(resp);
          // console.log('template', this.templateData, resp);
          this.templateName = this.templateData?.document_builder_name;
          const name = this.translate.instant('Document Template');
          this.pageTitleService.setTitle(name + (this.templateName ? ' - ' + this.templateName : ''));
          if (this.templateData?.is_published) {
            this.documentBuilderService.setTemplateIsPublished(true);
            this.templateIsPublished = true;
          } else {
            this.documentBuilderService.setTemplateIsPublished(true);
            this.templateIsPublished = false;
          }
        }
      },
      (error) => {
        this.authService.postErrorLog(error);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translateService.instant('OK'),
        });
      },
    );
  }

  interceptTabChange(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
    let validation: Boolean;
    validation = false;
    let selectedIndex = 0;
    if (this.docBuilderTabGroup.selectedIndex === 0) {
      const form = this.documentParameters.isFormUnchanged();
      selectedIndex = 0;
      if (!this.isDocumentTemplateSaved) {
        validation = true;
      }
    } else if (this.docBuilderTabGroup.selectedIndex === 1) {
      const form = this.documentBuilders.isFormUnchanged();
      selectedIndex = 1;
      if (!this.isDocumentTemplateSaved) {
        validation = true;
      }
    }

    if (validation) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('TMTC_S01.TITLE'),
        text: this.translate.instant('TMTC_S01.TEXT'),
        confirmButtonText: this.translate.instant('TMTC_S01.BUTTON_1'),
        showCancelButton: true,
        cancelButtonText: this.translate.instant('TMTC_S01.BUTTON_2'),
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.value) {
          this.documentBuilderService.setDocumentTemplateSaved(false);
          setTimeout(() => {
            this.selectedIndex = selectedIndex;
          }, 5);
          return MatTabGroup.prototype._handleClick.apply(this.docBuilderTabGroup, arguments);
        } else {
          this.documentBuilderService.setDocumentTemplateSaved(true);
          this.selectedIndex = idx;
          return MatTabGroup.prototype._handleClick.apply(this.docBuilderTabGroup, arguments);
        }
      });
    } else {
      this.documentBuilderService.setDocumentTemplateSaved(true);
      return MatTabGroup.prototype._handleClick.apply(this.docBuilderTabGroup, arguments);
    }
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    let validation: Boolean;
    validation = false;
    let selectedIndex = 0;
    if (this.docBuilderTabGroup.selectedIndex === 0) {
      const form = this.documentParameters.isFormUnchanged();
      selectedIndex = 0;
      if (!this.isDocumentTemplateSaved) {
        validation = true;
      }
    } else if (this.docBuilderTabGroup.selectedIndex === 1) {
      const form = this.documentBuilders.isFormUnchanged();
      selectedIndex = 1;
      if (!this.isDocumentTemplateSaved) {
        validation = true;
      }
    }
    if (validation) {
      return new Promise((resolve, reject) => {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('TMTC_S01.TITLE'),
          text: this.translate.instant('TMTC_S01.TEXT'),
          confirmButtonText: this.translate.instant('TMTC_S01.BUTTON_1'),
          showCancelButton: true,
          cancelButtonText: this.translate.instant('TMTC_S01.BUTTON_2'),
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((result) => {
          if (result.value) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    } else {
      return true;
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
