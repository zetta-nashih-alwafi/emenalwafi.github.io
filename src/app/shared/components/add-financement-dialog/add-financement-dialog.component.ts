import { NgxPermissionsService } from 'ngx-permissions';
import Validator from '@adyen/adyen-web/dist/types/utils/Validator/Validator';
import { I } from '@angular/cdk/keycodes';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { Observable } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { AddCompanyStaffDialogComponent } from 'app/companies/add-company-staff-dialog/add-company-staff-dialog.component';

@Component({
  selector: 'ms-add-financement-dialog',
  templateUrl: './add-financement-dialog.component.html',
  styleUrls: ['./add-financement-dialog.component.scss'],
})
export class AddFinancementDialogComponent implements OnInit {
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  addFinancementForm: UntypedFormGroup;
  private subs = new SubSink();
  selectedFile: File;
  financementData: any;
  isAddMore = false;

  // this dummy data for the table
  filedList = [
    { _id: 1, name: 'OPCO' },
    { _id: 2, name: 'Pole Emploi' },
  ];

  typeOfOrganization = ['OPCO', 'CPF', 'Transition Pro', 'Pôle Emploi', 'Région', 'Company', 'Other financing organization'];

  isWaitingForResponse = false;
  documenPDFName = '';
  candidateId: string;
  admissionId: string;
  organization: any;
  selectOrganizationType = '';

  totalCtrl = new UntypedFormControl(false);
  rateCtrl = new UntypedFormControl(false);

  organizationName = '';

  statusList = ['rejected', 'accepted', 'submitted_for_validation', 'in_progress_by_fc_in_charge'];

  filteredValues = {
    organization_type: '',
    organization_name: '',
  };
  hoursMandatory: boolean;
  totalMandatory: boolean;

  currentUser: any;
  organizationNameFilter = new UntypedFormControl(null, Validators.required);
  organizationSelectContact = new UntypedFormControl(null, Validators.required);
  organizationSiretNumber = new UntypedFormControl(null, Validators.required);
  organizationNameFiltered: Observable<any[]>;
  organizationNameSelected = false;
  organizationContactFiltered: Observable<any[]>;
  companyBySiretData: any;
  company_id: any;
  companyContacts: any;

  configCat: MatDialogConfig = {
    disableClose: true,
    width: '1070px',
    minHeight: '81%',
  };
  isCompany: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    public dialogRef: MatDialogRef<AddFinancementDialogComponent>,
    private fb: UntypedFormBuilder,
    private utilService: UtilityService,
    private fileUploadService: FileUploadService,
    private translate: TranslateService,
    private formBuilderService: FormBuilderService,
    private router: ActivatedRoute,
    private auth: AuthService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    // get candidate id
    this.currentUser = this.auth.getLocalStorageUser();
    console.log(this.currentUser);
    this.candidateId = this.parentData.candidateId;
    this.admissionId = this.parentData.admission_process_id;
    if (this.parentData.isFCManager) {
      this.initFormFcManager();
    } else {
      this.initFormStudent();
    }
    this.fetchDialog();
    this.initFilter();
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  initFilter() {
    this.subs.sink = this.addFinancementForm
      .get('organization_type')
      .valueChanges.pipe(debounceTime(400))
      .subscribe((res) => {
        if (res) {
          this.filteredValues.organization_type = res;
          if (res !== 'Company') {
            this.getOrganization();
          }
        }
      });
    this.organizationNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((res) => {
      if (!res) {
        this.organizationNameSelected = false;
      }
    });
  }

  initFormStudent() {
    this.addFinancementForm = this.fb.group({
      organization_type: [null, Validators.required],
      organization_name: [null, Validators.required],
      organization_name_other: [null],
      company_user_id: [null, Validators.required],
      document_pdf: [null],
      is_financement_validated: [false, Validators.required],
      additional_information: [null],
    });
  }

  initFormFcManager() {
    this.addFinancementForm = this.fb.group({
      organization_type: [null, Validators.required],
      organization_name: [null, Validators.required],
      organization_name_other: [null],
      rate_per_hours: [null],
      hours: [null],
      document_pdf: [null],
      total: [null],
      is_financement_validated: [false, Validators.required],
      actual_status: [null, Validators.required],
      additional_information: [null],
    });
  }

  fetchDialog() {
    if (this.parentData && this.parentData.comps && this.parentData.comps.isEdit) {
      if (this.parentData.info && !this.parentData.isFCManager) {
        const dumyDialog = {
          organization_type: this.parentData.info.organization_id
            ? this.parentData.info.organization_id.organization_type
            : this.parentData.info.organization_type,
          organization_name: this.parentData.info.organization_id
            ? this.parentData.info.organization_id._id
            : this.translate.instant('other'),
          document_pdf: this.parentData.info.document_pdf,
          additional_information: this.parentData.info.additional_information,
          organization_name_other: this.parentData.info.organization_name,
        };
        // console.log('_parent data', this.parentData);

        if (!this.parentData.info.organization_id && this.parentData.info.company_branch_id) {
          dumyDialog.organization_type = 'Company';
          dumyDialog.organization_name = this.parentData.info.company_branch_id
            ? this.parentData.info.company_branch_id._id
            : this.translate.instant('other');
          this.filteredValues.organization_type = 'Company';
        } else {
          this.filteredValues.organization_type = this.parentData.info.organization_id
            ? this.parentData.info.organization_id.organization_type
            : this.parentData.info.organization_type;
        }

        this.getOrganization(dumyDialog);
        this.documenPDFName = this.parentData.info.document_pdf;
      }

      if (this.parentData.info && this.parentData.isFCManager) {
        const dumyDialog = {
          organization_type: this.parentData.info.organization_id
            ? this.parentData.info.organization_id.organization_type
            : this.parentData.info.organization_type,
          organization_name: this.parentData.info.organization_id
            ? this.parentData.info.organization_id._id
            : this.translate.instant('other'),
          rate_per_hours: this.parentData.info.rate_per_hours,
          hours: this.parentData.info.hours,
          document_pdf: this.parentData.info.document_pdf,
          additional_information: this.parentData.info.additional_information,
          organization_name_other: this.parentData.info.organization_name,
          actual_status: this.parentData.info.actual_status,
        };

        if (dumyDialog.rate_per_hours && dumyDialog.hours) {
          this.rateCtrl.setValue(true);
          this.totalCtrl.setValue(false);
          this.hoursMandatory = true;
          this.totalMandatory = false;
        }

        if (this.parentData.info.total && !dumyDialog.rate_per_hours && !dumyDialog.hours) {
          dumyDialog['total'] = this.parentData.info.total;
          this.rateCtrl.setValue(false);
          this.totalCtrl.setValue(true);
          this.hoursMandatory = false;
          this.totalMandatory = true;
        }

        console.log('_parent data', this.parentData);
        if (!this.parentData.info.organization_id && this.parentData.info.company_branch_id) {
          dumyDialog.organization_type = 'Company';
          dumyDialog.organization_name = this.parentData.info.company_branch_id
            ? this.parentData.info.company_branch_id._id
            : this.translate.instant('other');
          this.filteredValues.organization_type = 'Company';
        } else {
          this.filteredValues.organization_type = this.parentData.info.organization_id
            ? this.parentData.info.organization_id.organization_type
            : this.parentData.info.organization_type;
        }

        this.getOrganization(dumyDialog);
        this.documenPDFName = this.parentData.info.document_pdf;
      }
    }
  }

  openUploadWindow() {
    this.fileUploaderDoc.nativeElement.click();
  }

  chooseFile(fileInput) {
    const acceptable = ['pdf'];
    const file = (<HTMLInputElement>fileInput.target)?.files[0];
    if (file) {
      this.isWaitingForResponse = true;
      const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
      console.log(fileType);
      if (acceptable.includes(fileType)) {
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (resp) => {
            console.log('_resp upload', resp);
            this.isWaitingForResponse = false;
            this.addFinancementForm.get('document_pdf').patchValue(resp.s3_file_name);
            this.documenPDFName = resp.s3_file_name;
          },
          (err) => {
            this.isWaitingForResponse = false;
            console.log('[Response BE][Error] : ', err);
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      } else {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
          text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.pdf' }),
          allowEscapeKey: false,
          allowOutsideClick: false,
          allowEnterKey: false,
        });
        this.isWaitingForResponse = false;
      }
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.fileUploaderDoc.nativeElement.value = null;
    this.addFinancementForm.get('document_pdf').setValue('');
    this.documenPDFName = '';
  }

  handleSubmit() {
    if (this.addFinancementForm.invalid || this.organizationSiretNumber.invalid || this.organizationSelectContact.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
      this.addFinancementForm.markAllAsTouched();
      this.organizationSiretNumber.markAsTouched();
      this.organizationSelectContact.markAsTouched();
    } else {
      if (!this.organizationNameSelected) {
        this.organizationNameFilter.setValue(null);
        this.addFinancementForm.get('organization_name').setValue(null);
        return;
      }

      // validation not choose either total or rate
      let validation;
      if (this.parentData.isFCManager) {
        validation =
          !this.totalCtrl.value && !this.rateCtrl.value && this.addFinancementForm.get('actual_status').value === 'accepted' ? true : false;
      }
      // const statusValidation = this.addFinancementForm.get('actual_status').value === 'accepted' ? true : false;

      if (this.totalCtrl.value && this.parentData.isFCManager) {
        this.addFinancementForm.get('total').setValidators(Validators.required);
        this.addFinancementForm.get('total').updateValueAndValidity();
      } else if (this.parentData.isFCManager) {
        this.addFinancementForm.get('total').clearValidators();
        this.addFinancementForm.get('total').updateValueAndValidity();
      }

      if (this.rateCtrl.value && this.parentData.isFCManager) {
        this.addFinancementForm.get('rate_per_hours').setValidators(Validators.required);
        this.addFinancementForm.get('rate_per_hours').updateValueAndValidity();
        this.addFinancementForm.get('hours').setValidators(Validators.required);
        this.addFinancementForm.get('hours').updateValueAndValidity();
      } else if (this.parentData.isFCManager) {
        this.addFinancementForm.get('rate_per_hours').clearValidators();
        this.addFinancementForm.get('rate_per_hours').updateValueAndValidity();
        this.addFinancementForm.get('hours').clearValidators();
        this.addFinancementForm.get('hours').updateValueAndValidity();
      }

      if (
        this.addFinancementForm.get('organization_name').value === 'other' ||
        this.addFinancementForm.get('organization_name').value === 'Other' ||
        this.addFinancementForm.get('organization_name').value === 'Autre'
      ) {
        this.addFinancementForm.get('organization_name_other').setValidators(Validators.required);
        this.addFinancementForm.get('organization_name_other').updateValueAndValidity();
      } else {
        this.addFinancementForm.get('organization_name_other').setValue(null);
        this.addFinancementForm.get('organization_name_other').clearValidators();
        this.addFinancementForm.get('organization_name_other').updateValueAndValidity();
      }

      if (validation && this.parentData.isFCManager) {
        console.log(validation);
        console.log(this.parentData.isFCManager);

        Swal.fire({
          type: 'info',
          title: this.translate.instant('FINANCEMENT_S4.TITLE'),
          text: this.translate.instant('FINANCEMENT_S4.TEXT'),
          confirmButtonText: this.translate.instant('FINANCEMENT_S4.BUTTON'),
          allowOutsideClick: false,
          allowEnterKey: false,
          allowEscapeKey: false,
        });
      } else {
        this.isWaitingForResponse = true;
        if (this.addFinancementForm.invalid) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('FormSave_S1s.TITLE'),
            html: this.translate.instant('FormSave_S1s.TEXT'),
            confirmButtonText: this.translate.instant('FormSave_S1s.BUTTON 1'),
          });
          this.addFinancementForm.markAllAsTouched();
          this.isWaitingForResponse = false;
          console.log('_form control', this.addFinancementForm.controls);
        } else {
          const payload = this.addFinancementForm.value;
          if (this.candidateId) {
            payload['candidate_id'] = this.candidateId;
          }
          if (this.admissionId) {
            payload['admission_process_id'] = this.admissionId;
          }
          console.log(this.parentData);
          payload.hours = parseFloat(parseFloat(payload.hours).toFixed(2));
          payload.rate_per_hours = parseFloat(parseFloat(payload.rate_per_hours).toFixed(2));
          if (payload.organization_name_other) {
            payload.organization_name = payload.organization_name_other;
            delete payload.organization_name_other;
          } else if (payload.organization_type !== 'Company') {
            payload['organization_id'] = payload.organization_name;
            payload['company_branch_id'] = null;
            delete payload.organization_name;
            delete payload.organization_name_other;
            delete payload.organization_type;
          } else {
            payload['company_branch_id'] = this.company_id;
            payload['organization_id'] = null;
            delete payload.organization_name;
            delete payload.organization_name_other;
            delete payload.organization_type;
          }
          if (this.parentData && this.parentData.actual_status) {
            payload['actual_status'] = this.parentData.actual_status;
          }
          console.log(payload);

          if (this.parentData && this.parentData.comps && this.parentData.comps.isEdit) {
            this.subs.sink = this.formBuilderService.UpdateAdmissionFinancement(this.parentData.info._id, payload).subscribe(
              (res) => {
                if (res) {
                  console.log(res);
                  this.isWaitingForResponse = false;
                  Swal.fire({
                    type: 'success',
                    title: this.translate.instant('Bravo!'),
                    confirmButtonText: this.translate.instant('OK'),
                    allowEnterKey: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                  }).then(() => {
                    this.dialogRef.close(true);
                  });
                } else {
                  this.isWaitingForResponse = false;
                }
              },
              (err) => {
                this.isWaitingForResponse = false;
                if (err['message'] === 'GraphQL error: cannot add financement more than full rate') {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('financement_s11.TITLE'),
                    text: this.translate.instant('financement_s11.TEXT'),
                    confirmButtonText: this.translate.instant('financement_s11.BUTTON_1'),
                  }).then(() => {});
                } else if (
                  err['message'] ===
                  'GraphQL error: Cannot change status to accepted, organization must be added to table organization first'
                ) {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('Finance_Error1.TITLE'),
                    text: this.translate.instant('Finance_Error1.TEXT'),
                    confirmButtonText: this.translate.instant('Finance_Error1.BUTTON_1'),
                  }).then(() => {
                    this.dialogRef.close();
                  });
                } else if (
                  err['message'] === 'GraphQL error: Cannot change status to accepted, company must be added to table company first'
                ) {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('FINANCEMENT_S8.TITLE'),
                    text: this.translate.instant('FINANCEMENT_S8.TEXT'),
                    confirmButtonText: this.translate.instant('FINANCEMENT_S8.BUTTON'),
                  }).then(() => {
                    this.dialogRef.close();
                  });
                } else if (
                  err['message'].includes('Cannot delete financement some of term has been billed or paid') ||
                  err['message'].includes('some terms are billed/paid')
                ) {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('VALIDATION_BILLING_S3.TITLE'),
                    text: this.translate.instant('VALIDATION_BILLING_S3.TEXT'),
                    confirmButtonText: this.translate.instant('VALIDATION_BILLING_S3.BUTTON'),
                  }).then(() => {
                    this.dialogRef.close();
                  });
                } else {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('SORRY'),
                    text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                    confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                  });
                }
              },
            );
          } else {
            if (this.parentData && this.parentData.user_id) {
              console.log(this.parentData.user_id);
              payload['created_by'] = this.parentData.user_id._id;
            }
            this.subs.sink = this.formBuilderService.CreateAdmissionFinancement(payload).subscribe(
              (res) => {
                if (res) {
                  console.log(res);
                  this.isWaitingForResponse = false;
                  Swal.fire({
                    type: 'success',
                    title: this.translate.instant('Bravo!'),
                    confirmButtonText: this.translate.instant('OK'),
                    allowEnterKey: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                  }).then(() => {
                    this.dialogRef.close(true);
                  });
                } else {
                  this.isWaitingForResponse = false;
                }
              },
              (err) => {
                this.isWaitingForResponse = false;
                if (err['message'] === 'GraphQL error: cannot add financement more than full rate') {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('financement_s11.TITLE'),
                    text: this.translate.instant('financement_s11.TEXT'),
                    confirmButtonText: this.translate.instant('financement_s11.BUTTON_1'),
                  }).then(() => {});
                } else if (
                  err['message'].includes('Cannot delete financement some of term has been billed or paid') ||
                  err['message'].includes('some terms are billed/paid')
                ) {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('VALIDATION_BILLING_S3.TITLE'),
                    text: this.translate.instant('VALIDATION_BILLING_S3.TEXT'),
                    confirmButtonText: this.translate.instant('VALIDATION_BILLING_S3.BUTTON'),
                  }).then(() => {
                    this.dialogRef.close();
                  });
                } else {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('SORRY'),
                    text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                    confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                  });
                }
              },
            );
          }

          // Swal.fire({
          //   type: 'success',
          //   title: this.translate.instant('Bravo!'),
          //   confirmButtonText: this.translate.instant('OK'),
          //   allowEnterKey: false,
          //   allowEscapeKey: false,
          //   allowOutsideClick: false,
          // }).then(() => {
          //   this.dialogRef.close(true);
          // });
        }
      }
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  addMore() {
    this.isAddMore = true;
  }

  getOrganization(dummyDialog?) {
    console.log('_filter', this.filteredValues);
    if (this.filteredValues?.organization_type && this.filteredValues?.organization_type !== 'Company') {
      this.isWaitingForResponse = true;
      this.subs.sink = this.formBuilderService.GetAllOrganizations(this.filteredValues).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            this.organization = resp;
            this.organizationNameFiltered = this.organizationNameFilter.valueChanges.pipe(
              startWith(''),
              map((searchText) =>
                searchText
                  ? this.organization.filter((type) => (type ? type.name.toLowerCase().includes(searchText.toLowerCase()) : false))
                  : this.organization,
              ),
            );
          }
          if (this.parentData && this.parentData.comps && this.parentData.comps.isEdit && dummyDialog) {
            this.addFinancementForm.patchValue(dummyDialog);
            this.organizationNameSelected = true;
            const found = this.organization.find((res) => res._id === this.addFinancementForm.get('organization_name').value);
            if (found) {
              this.organizationNameFilter.patchValue(found.name);
            } else {
              this.organizationNameFilter.patchValue(this.translate.instant('other'));
            }
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
  }

  formatDecimalHour() {
    const value = this.addFinancementForm.get('hours').value;
    if (isNaN(value) || (parseFloat(value) * 10) % 1 > 0) {
      return false;
    }
  }

  formatDecimalPerHour() {
    const value = this.addFinancementForm.get('rate_per_hours').value;
    if (isNaN(value) || (parseFloat(value) * 10) % 1 > 0) {
      return false;
    }
  }

  formatDecimalTotalAmount() {
    const value = this.addFinancementForm.get('total').value;
    if (isNaN(value) || (parseFloat(value) * 10) % 1 > 0) {
      return false;
    }
  }

  toggleHours(e) {
    console.log(e);
    if (e && e.checked) {
      this.totalCtrl.setValue(false);
      this.hoursMandatory = true;
      this.totalMandatory = false;

      // reset value in total
      this.addFinancementForm.get('total').setValue(null);
      this.addFinancementForm.get('total').clearValidators();
    } else {
      this.hoursMandatory = false;
      this.addFinancementForm.get('rate_per_hours').setValue(null);
      this.addFinancementForm.get('rate_per_hours').clearValidators();
      this.addFinancementForm.get('hours').setValue(null);
      this.addFinancementForm.get('hours').clearValidators();
    }
  }

  toggleTotal(e) {
    console.log(e);
    if (e && e.checked) {
      this.rateCtrl.setValue(false);
      this.totalMandatory = true;
      this.hoursMandatory = false;

      // reset value rate per hour and hours
      this.addFinancementForm.get('rate_per_hours').setValue(null);
      this.addFinancementForm.get('rate_per_hours').clearValidators();
      this.addFinancementForm.get('hours').setValue(null);
      this.addFinancementForm.get('hours').clearValidators();
    } else {
      this.totalMandatory = false;
      this.addFinancementForm.get('total').setValue(null);
      this.addFinancementForm.get('total').clearValidators();
    }
  }

  setOrganizationName(value) {
    this.organizationNameSelected = true;
    const updateValue = value === 'other' ? this.translate.instant('other') : value;
    this.addFinancementForm.get('organization_name').setValue(updateValue);
  }

  selectType(item) {
    this.selectOrganizationType = item;
    this.organizationNameFilter.setValue(null);
    if (this.selectOrganizationType === 'Company') {
      this.addFinancementForm.get('company_user_id').setValidators([Validators.required]);
      this.addFinancementForm.get('company_user_id').patchValue(null);
      this.addFinancementForm.get('company_user_id').updateValueAndValidity();
      this.organizationSiretNumber.setValidators([Validators.required]);
      this.organizationSiretNumber.patchValue(null);
      this.organizationSiretNumber.updateValueAndValidity();
      this.organizationNameFilter.clearValidators();
      this.organizationNameFilter.patchValue(null);
      this.organizationNameFilter.updateValueAndValidity();
      this.addFinancementForm.get('organization_name').clearValidators();
      this.addFinancementForm.get('organization_name').patchValue(null);
      this.addFinancementForm.get('organization_name').updateValueAndValidity();
      this.organizationSelectContact.setValidators([Validators.required]);
      this.organizationSelectContact.patchValue(null);
      this.organizationSelectContact.updateValueAndValidity();
    } else {
      this.organizationSelectContact.clearValidators();
      this.organizationSelectContact.patchValue(null);
      this.organizationSelectContact.updateValueAndValidity();
      this.addFinancementForm.get('company_user_id').clearValidators();
      this.addFinancementForm.get('company_user_id').patchValue(null);
      this.addFinancementForm.get('company_user_id').updateValueAndValidity();
      this.organizationNameFilter.setValidators([Validators.required]);
      this.organizationNameFilter.patchValue(null);
      this.organizationNameFilter.updateValueAndValidity();
      this.organizationSiretNumber.clearValidators();
      this.organizationSiretNumber.patchValue(null);
      this.organizationSiretNumber.updateValueAndValidity();
      this.addFinancementForm.get('organization_name').setValidators([Validators.required]);
      this.addFinancementForm.get('organization_name').patchValue(null);
      this.addFinancementForm.get('organization_name').updateValueAndValidity();
      this.isCompany = false;
    }
  }

  onVerifySiret() {
    this.isWaitingForResponse = true;
    const addSiret = {
      no_RC: this.organizationSiretNumber.value ? this.organizationSiretNumber.value.toString().replace(/\s/g, '') : null,
    };
    this.organizationSelectContact.setValue(null);
    this.subs.sink = this.formBuilderService.GetAllCompanies(addSiret).subscribe(
      (resp) => {
        if (resp?.length) {
          Swal.fire({
            type: 'success',
            title: 'Bravo !',
            allowOutsideClick: false,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          })
          this.isWaitingForResponse = false;
          this.organizationName = resp[0].company_name;
          this.company_id = resp[0]._id;
          this.isCompany = true;
          this.getAllUserCompanyContacts(this.company_id);
          this.organizationNameSelected = true;
        } else {
          this.getCompanyEtalabBySiret(addSiret.no_RC);
        }
      },
      () => {
        this.isWaitingForResponse = false;
      },
    );
  }

  createCompanyByCases() {
    const siretNumber = this.organizationSiretNumber.value ? this.organizationSiretNumber.value.toString(): null;
    const companies = this.companyBySiretData.companies;
    const message = this.companyBySiretData.message;
    const companyBranch = this.companyBySiretData.companies.find((company) => company.no_RC === siretNumber);
    const companyEntity = this.companyBySiretData.companies.find((company) => company.company_type === 'entity');
    const branchId = companyBranch ? companyBranch._id : null;
    const entityId = companyEntity ? companyEntity._id : null;
    this.isWaitingForResponse = true;
    this.subs.sink = this.formBuilderService.CreateCompanyByCases(message, branchId, entityId, companies).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          Swal.fire({
            type: 'success',
            title: 'Bravo !',
            allowOutsideClick: false,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
          const companyData = resp.filter((company) => company.no_RC === siretNumber);
          if (companyData?.length) {
            this.company_id = companyData[0]?._id;
          }
          this.getAllUserCompanyContacts(this.company_id);
          this.isCompany = true;
          this.organizationNameSelected = true;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        if (err && err['message'] && err['message'].includes('adding company is limited to 30 entity in 1 minute')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('ComLim_s1.TITLE'),
            html: this.translate.instant('ComLim_s1.TEXT'),
            confirmButtonText: this.translate.instant('ComLim_s1.BUTTON'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else if (
          err &&
          err['message'] &&
          (err['message'].includes(
            'the siret you entered is not found on the government api. please double check the siret and try again',
          ) ||
            err['message'].includes('the combination of siret/siren code and zipcode is not detected.'))
        ) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('COMP_S1.TITLE'),
            html: this.translate.instant('COMP_S1.TEXT'),
            confirmButtonText: this.translate.instant('COMP_S1.BUTTON'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  getCompanyEtalabBySiret(siret?: string) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formBuilderService.GetCompanyEtalabBySiret(siret).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.organizationName = resp?.companies[0]?.company_name;
        this.companyBySiretData = resp;
        this.createCompanyByCases();
      },
      (err) => {
        this.isWaitingForResponse = false;
        if (err && err['message'] && err['message'].includes('adding company is limited to 30 entity in 1 minute')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('ComLim_s1.TITLE'),
            html: this.translate.instant('ComLim_s1.TEXT'),
            confirmButtonText: this.translate.instant('ComLim_s1.BUTTON'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else if (err && err['message'] && err['message'].includes('Sorry This Company is closed')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('COMPANY_S20.TITLE'),
            html: this.translate.instant('COMPANY_S20.TEXT', { siret: siret }),
            confirmButtonText: this.translate.instant('COMPANY_S20.BUTTON'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else if (
          err &&
          err['message'] &&
          (err['message'].includes(
            'the siret you entered is not found on the government api. please double check the siret and try again',
          ) ||
            err['message'].includes('the combination of siret/siren code and zipcode is not detected.'))
        ) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('COMP_S1.TITLE'),
            html: this.translate.instant('COMP_S1.TEXT'),
            confirmButtonText: this.translate.instant('COMP_S1.BUTTON'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  getAllUserCompanyContacts(company_id: string) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formBuilderService.GetAllUsers(company_id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.companyContacts = resp;
        this.organizationContactFiltered = this.organizationSelectContact.valueChanges.pipe(
          startWith(''),
          map((searchText) =>
            searchText
              ? this.companyContacts.filter((type) => (type ? type.first_name.toLowerCase().includes(searchText.toLowerCase()) : false))
              : this.companyContacts,
          ),
        );
      },
      (err) => {
        this.isWaitingForResponse = false;
      },
    );
  }

  contactSelect(event) {
    if (event === 'add' && this.company_id) {
      this.dialog
        .open(AddCompanyStaffDialogComponent, {
          ...this.configCat,
          data: {
            operation: 'add',
            companyId: this.company_id,
            logginUserId:this.parentData?.logginUserId,
            from:this.parentData?.from
          },
        })
        .afterClosed()
        .subscribe(() => {
          // Call the function again to repopulate the contacts data of the company
          this.getAllUserCompanyContacts(this.company_id);
          this.organizationSelectContact.patchValue(null);
        });
    } else {
      this.addFinancementForm.get('company_user_id').patchValue(event);
    }
  }

  onPasteSiretNumber(event) {
    event.preventDefault();
    let value = event.clipboardData.getData('text/plain'); 
    value = value.replace(/\s/g, '');
    this.organizationSiretNumber.patchValue(value, {emitEvent:false});
  }
}
