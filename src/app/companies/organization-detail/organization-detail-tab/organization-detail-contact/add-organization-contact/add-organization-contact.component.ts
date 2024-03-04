import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserManagementService } from 'app/user-management/user-management.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CoreService } from 'app/service/core/core.service';
import { CustomValidators } from 'ng2-validation';
import { FormFillingService } from 'app/form-filling/form-filling.service';

@Component({
  selector: 'ms-add-organization-contact',
  templateUrl: './add-organization-contact.component.html',
  styleUrls: ['./add-organization-contact.component.scss'],
})
export class AddOrganizationContactComponent implements OnInit {
  private subs = new SubSink();
  addOrganizationContactForm: UntypedFormGroup;

  // *************** START OF property to store data of country dial code
  flagsIconPath = '../../../../../assets/icons/flags-nationality/';
  countryCodeList: any[] = [];
  dialCodeControl = new UntypedFormControl(null)
  // *************** END OF property to store data of country dial code

  isWaitingForResponse = false;
  currentUser: any;
  isOperatorSelected: boolean = false;
  isOperator: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddOrganizationContactComponent>,
    private formFillingService: FormFillingService,
    private translate: TranslateService,
    private authService: AuthService,
    public coreService: CoreService,
  ) {}

  ngOnInit() {
    // this.currentUser = this.authService.getLocalStorageUser();
    this.checkIsOperator();
    this.initForm();
    console.log('is operator?', this.isOperator);
    if(this.parentData?.countryCodeList?.length) {
      this.countryCodeList = this.parentData?.countryCodeList;
    }
    if (this.parentData && this.parentData.data) {
      this.addOrganizationContactForm.patchValue(this.parentData.data);
      if(this.parentData?.data?.phone_number_indicative) {
        const findIdx = this.countryCodeList?.findIndex((country) => country?.dialCode === this.parentData?.data?.phone_number_indicative);
        if(findIdx >= 0) this.dialCodeControl?.patchValue(this.countryCodeList[findIdx]);
      };
    }
  }

  initForm() {
    this.addOrganizationContactForm = this.fb.group({
      civility: ['', [Validators.required]],
      email: ['', [CustomValidators.email]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      telephone: ['', [Validators.maxLength(11), CustomValidators.number]],
      status: ['active'],
      organization_id: [this.parentData.orgId],
      phone_number_indicative: [null],
    });
  }

  selectionDialCode(event) {
    this.addOrganizationContactForm?.get('phone_number_indicative')?.reset();
    this.addOrganizationContactForm?.get('phone_number_indicative')?.patchValue(event?.dialCode);
  }

  checkIsOperator() {
    this.isOperator = this.authService.getCurrentUser().entities.some((entity) => entity.entity_name && entity.entity_name === 'operator');
  }

  flattenArray(arr: any[]) {
    // used to flatten array inside of array into just a single array using merging method
    return arr.reduce((acc, val) => acc.concat(val), []);
  }

  sortNameAlphabetically(arr: any[], key: string) {
    return arr.sort((a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0));
  }

  cleanObject(object) {
    for (const [key, value] of Object.entries(object)) {
      if (value === null) {
        delete object[key];
      }
    }
    return object;
  }

  checkValidation() {
    const civility = this.addOrganizationContactForm.get('civility').value;
    const first_name = this.addOrganizationContactForm.get('first_name').value;
    const last_name = this.addOrganizationContactForm.get('last_name').value;
    if (civility && first_name && last_name) {
      return true;
    } else {
      return false;
    }
  }

  checkFormValidity(): boolean {
    if (this.addOrganizationContactForm.invalid || !this.checkValidation()) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.addOrganizationContactForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  submit() {
    if (this.checkFormValidity()) {
      return;
    }
    const payload = _.cloneDeep(this.addOrganizationContactForm.value);
    this.isWaitingForResponse = true;
    if (this.parentData && this.parentData.data) {
      this.subs.sink = this.formFillingService.updateContact(this.parentData.data._id, payload).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close(resp);
            });
          }
        },
        (error) => {
          this.showSwalError(error);
          return;
        },
      );
    } else {
      this.subs.sink = this.formFillingService.createContact(payload).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close(resp);
            });
          }
        },
        (error) => {
          this.showSwalError(error);
          return;
        },
      );
    }
  }

  showSwalError(err) {
    this.isWaitingForResponse = false;
    Swal.fire({
      type: 'info',
      title: this.translate.instant('SORRY'),
      text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
      confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
