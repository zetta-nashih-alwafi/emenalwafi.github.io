import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CustomValidators } from 'ng2-validation';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { UserService } from 'app/service/user/user.service';
import { TranslateService } from '@ngx-translate/core';
import { CoreService } from 'app/service/core/core.service';
import { FormFillingService } from 'app/form-filling/form-filling.service';

@Component({
  selector: 'ms-add-organization-dialog',
  templateUrl: './add-organization-dialog.component.html',
  styleUrls: ['./add-organization-dialog.component.scss'],
})
export class AddOrganizationDialogComponent implements OnInit {
  @ViewChild('mobileNumber', { static: false }) mobileNumberInput;
  private subs = new SubSink();
  addNewOrganizationForm: UntypedFormGroup;
  typeList = ['OPCO', 'CPF', 'Transition Pro', 'Pôle Emploi', 'Région', 'Other financing organization'];

  isWaitingForResponse = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddOrganizationDialogComponent>,
    private authService: AuthService,
    private router: Router,
    private formFillingService: FormFillingService,
    private translate: TranslateService,
    public coreService: CoreService,
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.addNewOrganizationForm = this.fb.group({
      organization_type: ['', [Validators.required]],
      name: ['', [Validators.required]],
      organization_id: [''],
      pole_emploi_region: [''],
    });
  }

  checkFormValidity(): boolean {
    if (this.addNewOrganizationForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.addNewOrganizationForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  submit() {
    if (this.addNewOrganizationForm.get('organization_type').value === 'Pôle Emploi') {
      this.addNewOrganizationForm.get('organization_id').setValidators(Validators.required);
      this.addNewOrganizationForm.get('organization_id').updateValueAndValidity();
    } else {
      this.addNewOrganizationForm.get('organization_id').clearValidators();
      this.addNewOrganizationForm.get('organization_id').updateValueAndValidity();
    }

    if (this.checkFormValidity()) {
      return;
    }
    this.isWaitingForResponse = true;
    const payload = _.cloneDeep(this.addNewOrganizationForm.value);
    this.createOrganization(payload);
  }

  createOrganization(payload) {
    this.subs.sink = this.formFillingService.createOrganization(payload).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then(() => {
          this.dialogRef.close(resp);
        });
      },
      (error) => {
        this.isWaitingForResponse = false;
        console.log(error, error.message);
        if (error.message && error.message === 'GraphQL error: Organization is already exist') {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('SWAL_ORGANIZATION_EXIST.TITLE'),
            text: this.translate.instant('SWAL_ORGANIZATION_EXIST.TEXT'),
            confirmButtonText: this.translate.instant('SWAL_ORGANIZATION_EXIST.BUTTON_1'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
