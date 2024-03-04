import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { PermissionService } from 'app/service/permission/permission.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { FormBuilderService } from '../form-builder.service';

@Component({
  selector: 'ms-add-form-template-dialog',
  templateUrl: './add-form-template-dialog.component.html',
  styleUrls: ['./add-form-template-dialog.component.scss'],
})
export class AddFormTemplateDialogComponent implements OnInit {
  typeForm: UntypedFormGroup;
  private subs = new SubSink();
  templateId;
  alumniOptionPermision;

  constructor(
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<AddFormTemplateDialogComponent>,
    private formBuilderService: FormBuilderService,
    private utilService: UtilityService,
    public permission: PermissionService,
  ) {}

  ngOnInit() {
    this.initFormBuilder();

    this.alumniOptionPermision = this.permission.showAlumniSurveyOptionPerm();
  }

  initFormBuilder() {
    const currentUser = this.utilService.getCurrentUser();

    this.typeForm = this.fb.group({
      template_type: [null, [Validators.required]],
      created_by: [currentUser._id, [Validators.required]],
    });
  }

  onValidate() {
    console.log(this.typeForm.value);
    if (this.typeForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.typeForm.markAllAsTouched();
      return true;
    } else {
      Swal.fire({
        type: 'success',
        title: 'Bravo!',
        confirmButtonText: 'OK',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then(() => {
        this.dialogRef.close(this.typeForm.get('template_type').value);
      });
    }
  }
}
