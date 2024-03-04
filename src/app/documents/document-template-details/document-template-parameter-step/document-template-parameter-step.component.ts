import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DocumentIntakeBuilderService } from 'app/service/document-intake-builder/document-intake-builder.service';
import { map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { UtilityService } from 'app/service/utility/utility.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-document-template-parameter-step',
  templateUrl: './document-template-parameter-step.component.html',
  styleUrls: ['./document-template-parameter-step.component.scss'],
})
export class DocumentTemplateParameterStepComponent implements OnInit, OnDestroy {
  @Input() templateId;
  templateData;
  isWaitingForResponse = false;
  isTopWaitingForResponse = false;
  editor: any;
  dataCount = 0;
  private subs = new SubSink();
  isEdit = false;

  documentParameterForm: UntypedFormGroup;

  docTypeList = [
    { key: 'bill', value: 'Bill' },
    { key: 'registration_certificate', value: 'Registration Certificate' },
  ];

  docTypeFilterCtrl = new UntypedFormControl('');
  docTypeListFiltered: Observable<any[]>;
  initialForm: any = {};
  saveOn = false;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private fb: UntypedFormBuilder,
    private documentBuilderService: DocumentIntakeBuilderService,
    private utilityService: UtilityService,
    private userService: AuthService,
  ) {}

  ngOnInit() {
    // console.log(this.templateId);
    if (this.templateId) {
      this.isEdit = true;
      this.getTemplateData();
    }
    this.initForm();

    this.docTypeListFiltered = this.docTypeFilterCtrl.valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.docTypeList.filter((type) =>
          type
            ? this.utilityService
                .simplifyRegex(this.translate.instant(type?.value))
                .toLowerCase()
                .includes(searchText.toString().toLowerCase())
            : true,
        ),
      ),
    );

    this.subs.sink = this.docTypeFilterCtrl.valueChanges.subscribe((data) => {
      if (this.docTypeList.find((docType) => docType?.key === data)) {
        if (this.initialForm) {
          if (data === this.initialForm.document_type) {
            this.saveOn = false;
          } else {
            this.saveOn = true;
          }
        } else {
          this.saveOn = true;
        }
      } else {
        this.saveOn = false;
      }
    });
  }

  initForm() {
    this.documentParameterForm = this.fb.group({
      is_published: [false, Validators.required],
      document_builder_name: ['', Validators.required],
      document_type: ['', Validators.required],
    });
    this.initialForm = this.documentParameterForm.getRawValue();
  }

  patchDocumentParamterForm() {
    this.documentParameterForm.controls['is_published'].patchValue(this.templateData?.is_published);
    this.documentParameterForm.controls['document_builder_name'].patchValue(this.templateData?.document_builder_name);
    this.documentParameterForm.controls['document_type'].patchValue(this.templateData?.document_type);
    this.docTypeFilterCtrl.patchValue(this.templateData?.document_type);
  }

  getTemplateData() {
    this.isTopWaitingForResponse = true;
    this.subs.sink = this.documentBuilderService.getOneDocumentBuilder(this.templateId).subscribe(
      (resp) => {
        if (resp) {
          this.templateData = _.cloneDeep(resp);
          this.patchDocumentParamterForm();
          if (this.templateData.is_published) {
            this.documentParameterForm.controls['document_type'].disable();
            this.documentParameterForm.controls['document_builder_name'].disable();
            this.docTypeFilterCtrl.disable();
          }
          this.initialForm = this.documentParameterForm.getRawValue();
          this.isTopWaitingForResponse = false;
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
        this.isTopWaitingForResponse = false;
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  publishDocumentTemplate(event: MatSlideToggleChange) {
    if (event && event.checked) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('DocumentBuilder_S2.Title'),
        confirmButtonText: this.translate.instant('DocumentBuilder_S2.Button 1'),
        cancelButtonText: this.translate.instant('DocumentBuilder_S2.Button 2'),
        showCancelButton: true,
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.value) {
          this.documentParameterForm.controls['is_published'].patchValue(true, { emitEvent: false });
          this.publishTemplateCallAPI();
        } else {
          this.documentParameterForm.controls['is_published'].patchValue(false, { emitEvent: false });
        }
      });
    } else {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('DocumentBuilder_S3.Title'),
        confirmButtonText: this.translate.instant('DocumentBuilder_S3.Button 1'),
        cancelButtonText: this.translate.instant('DocumentBuilder_S3.Button 2'),
        showCancelButton: true,
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.value) {
          this.documentParameterForm.controls['is_published'].patchValue(false, { emitEvent: false });
          this.unpublishTemplateCallAPI();
        } else {
          this.documentParameterForm.controls['is_published'].patchValue(true, { emitEvent: false });
        }
      });
    }
  }

  publishTemplateCallAPI() {
    if (this.templateId) {
      this.isTopWaitingForResponse = true;
      this.subs.sink = this.documentBuilderService.PublishDocumentBuilder(this.templateId).subscribe(
        (resp) => {
          this.isTopWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then((res) => {
            this.initialForm = this.documentParameterForm.getRawValue();
            this.router
              .navigateByUrl('/', { skipLocationChange: true })
              .then(() => this.router.navigate([`/document-builder/document-template`], { queryParams: { templateId: this.templateId } }));
          });
        },
        (err) => {
          this.userService.postErrorLog(err);
          this.isTopWaitingForResponse = false;
          this.documentParameterForm.get('is_published').patchValue(false, { emitEvent: false });
          if (
            err &&
            err['message'] &&
            (err['message'].includes('jwt expired') ||
              err['message'].includes('str & salt required') ||
              err['message'].includes('Authorization header is missing') ||
              err['message'].includes('salt'))
          ) {
            this.userService.handlerSessionExpired();
            return;
          }
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

  unpublishTemplateCallAPI() {
    if (this.templateId) {
      this.isTopWaitingForResponse = true;
      this.subs.sink = this.documentBuilderService.UnpublishDocumentBuilder(this.templateId).subscribe(
        (resp) => {
          this.isTopWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then((res) => {
            this.initialForm = this.documentParameterForm.getRawValue();
            this.router
              .navigateByUrl('/', { skipLocationChange: true })
              .then(() => this.router.navigate([`/document-builder/document-template`], { queryParams: { templateId: this.templateId } }));
          });
        },
        (err) => {
          this.userService.postErrorLog(err);
          this.isTopWaitingForResponse = false;
          this.documentParameterForm.get('is_published').patchValue(false, { emitEvent: false });
          if (
            err &&
            err['message'] &&
            (err['message'].includes('jwt expired') ||
              err['message'].includes('str & salt required') ||
              err['message'].includes('Authorization header is missing') ||
              err['message'].includes('salt'))
          ) {
            this.userService.handlerSessionExpired();
            return;
          }
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

  onSave() {
    this.isTopWaitingForResponse = true;
    const payload = this.documentParameterForm.getRawValue();
    // console.log(payload);

    // If there is templateId, then we update, but if not, then we call create.
    if (this.isEdit) {
      if (this.templateId) {
        this.subs.sink = this.documentBuilderService.UpdateDocumentBuilder(this.templateId, payload).subscribe(
          (resp) => {
            this.isTopWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((resp) => {
              if (resp.value) {
                this.initialForm = this.documentParameterForm.getRawValue();
                this.router
                  .navigateByUrl('/', { skipLocationChange: true })
                  .then(() =>
                    this.router.navigate([`/document-builder/document-template`], { queryParams: { templateId: this.templateId } }),
                  );
              }
            });
          },
          (err) => {
            this.userService.postErrorLog(err);
            this.isTopWaitingForResponse = false;
            if (
              err &&
              err['message'] &&
              (err['message'].includes('jwt expired') ||
                err['message'].includes('str & salt required') ||
                err['message'].includes('Authorization header is missing') ||
                err['message'].includes('salt'))
            ) {
              this.userService.handlerSessionExpired();
              return;
            }
            this.showSwalError(err);
          },
        );
      }
    } else {
      this.subs.sink = this.documentBuilderService.CreateDocumentBuilder(payload).subscribe(
        (res) => {
          if (res) {
            this.isTopWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((resp) => {
              if (resp.value) {
                this.initialForm = this.documentParameterForm.getRawValue();
                this.router
                  .navigateByUrl('/', { skipLocationChange: true })
                  .then(() => this.router.navigate([`/document-builder/document-template`], { queryParams: { templateId: res?._id } }));
              }
            });
          }
        },
        (err) => {
          this.userService.postErrorLog(err);
          this.isTopWaitingForResponse = false;
          if (
            err &&
            err['message'] &&
            (err['message'].includes('jwt expired') ||
              err['message'].includes('str & salt required') ||
              err['message'].includes('Authorization header is missing') ||
              err['message'].includes('salt'))
          ) {
            this.userService.handlerSessionExpired();
            return;
          }
          this.showSwalError(err);
        },
      );
    }
  }

  isFormUnchanged() {
    const initialForm = JSON.stringify(this.initialForm);
    const currentForm = JSON.stringify(this.documentParameterForm.getRawValue());
    if (initialForm === currentForm) {
      this.documentBuilderService.setDocumentTemplateSaved(true);
      return true;
    } else {
      this.documentBuilderService.setDocumentTemplateSaved(false);
      return false;
    }
  }

  typeSelected(data) {
    // console.log(data);
    if (data) {
      this.documentParameterForm.controls['document_type'].patchValue(data);
      // console.log(this.documentParameterForm.value, this.documentParameterForm);
    } else {
      this.documentParameterForm.controls['document_type'].patchValue('');
    }
  }

  showSwalError(err) {
    // console.log(err);
    if (err['message'] === 'GraphQL error: Document builder name and type already exist!') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Uniquename_S1.TITLE'),
        text: this.translate.instant('Uniquename_S1.TEXT'),
        confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    }
  }

  leave() {
    this.router.navigate(['/document-builder']);
  }

  displayFn(value) {
    if (value) {
      const found = this.docTypeList.find((data) => data.key.toLowerCase().trim().includes(value));
      if (found) {
        const value = this.translate.instant(found.value);
        return value;
      } else {
        return value;
      }
    } else {
      return value;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.documentBuilderService.setDocumentTemplateSaved(true);
  }
}
