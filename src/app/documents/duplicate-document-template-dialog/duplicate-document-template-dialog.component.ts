import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SubSink } from 'subsink';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { DocumentIntakeBuilderService } from 'app/service/document-intake-builder/document-intake-builder.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  templateUrl: './duplicate-document-template-dialog.component.html',
  styleUrls: ['./duplicate-document-template-dialog.component.scss'],
})
export class DuplicateDocumentTemplateDialogComponent implements OnInit, OnDestroy {
  duplicateTemplateForm: UntypedFormGroup;
  private subs = new SubSink();

  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<DuplicateDocumentTemplateDialogComponent>,
    private translate: TranslateService,
    private router: Router,
    private documentBuilderService: DocumentIntakeBuilderService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public parentData: any,
  ) {}

  ngOnInit() {
    // console.log(this.parentData);
    this.initForm();
  }

  initForm() {
    this.duplicateTemplateForm = this.fb.group({
      _id: [this.parentData.templateId, Validators.required],
      document_builder_name: ['', [Validators.required]],
    });
  }

  submit() {
    // console.log(this.duplicateTemplateForm.value);
    const payload = this.duplicateTemplateForm.getRawValue();

    const templateName = this.duplicateTemplateForm.controls['document_builder_name'].value;
    let found = [];
    if (this.parentData?.documents?.length) {
      found = this.parentData.documents.filter((name) =>
        name && name.document_builder_name ? name.document_builder_name.toLowerCase() === templateName.toLowerCase() : null,
      );
    }
    // console.log(found);
    if (found && found.length !== 0) {
      Swal.fire({
        title: this.translate.instant('Uniquename_S1.TITLE'),
        text: this.translate.instant('Uniquename_S1.TEXT'),
        type: 'info',
        showConfirmButton: true,
        confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
      }).then(() => {
        this.duplicateTemplateForm.controls['document_builder_name'].patchValue('');
      });
    } else {
      this.saveDuplicateTemplate(payload);
    }
  }

  saveDuplicateTemplate(payload) {
    this.subs.sink = this.documentBuilderService.DuplicateDocumentBuilder(payload?._id, payload?.document_builder_name).subscribe(
      (resp) => {
        if (resp) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo !'),
            confirmButtonText: this.translate.instant('OK'),
          }).then((result) => {
            this.dialogRef.close(true);
          });
        }
      },
      (error) => {
        this.authService.postErrorLog(error);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('OK'),
        });
      },
    );
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
