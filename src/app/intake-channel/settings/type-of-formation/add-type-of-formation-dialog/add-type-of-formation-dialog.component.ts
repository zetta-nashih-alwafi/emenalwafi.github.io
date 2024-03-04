import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { UtilityService } from 'app/service/utility/utility.service';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-add-type-of-formation-dialog',
  templateUrl: './add-type-of-formation-dialog.component.html',
  styleUrls: ['./add-type-of-formation-dialog.component.scss'],
})
export class AddTypeOfFormationDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  addTypeOfFormation: UntypedFormGroup;

  listTypeOfInformation: any[];
  listTypeOfInformationCtrl = new UntypedFormControl(null);
  templates: any[] = [];

  isWaitingForResponse = false;
  firstForm: any;
  listOfType = [];
  listOfTypeOriginal = [
    'classic',
    'continuous_total_funding',
    'continuous_partial_funding',
    'continuous_personal_funding',
    'continuous_contract_pro',
  ];

  formCtrlListFiltered: Observable<any[]>;
  formCtrl = new UntypedFormControl('', Validators.required);

  formCtrlReListFiltered: Observable<any[]>;
  formCtrlRe = new UntypedFormControl('', Validators.required);
  templatesRe: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddTypeOfFormationDialogComponent>,
    private intakeChannelService: IntakeChannelService,
    private translate: TranslateService,
    private formBuilderService: FormBuilderService,
    private translateService: TranslateService,
    private utilityService: UtilityService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initForm();
    this.getAllTypeOfInformation();
    this.getAllFormBuilderTemplates();
    this.getAllReadmissionFormBuilderTemplates();
    if (this.data.isEdit) {
      if (this.data && this.data.allDataFormation && this.data.allDataFormation.length <= 1) {
        this.listOfType = this.listOfTypeOriginal;
      } else {
        const alreadySelectedTypes = this.data.allDataFormation.map((formation) => formation.type_of_formation);
        const filtered = this.listOfTypeOriginal.filter((type) => !alreadySelectedTypes.includes(type));
        this.listOfType.push(this.data.typeOfFormationData.type_of_formation);
        if (filtered && filtered.length) {
          filtered.forEach((res) => {
            this.listOfType.push(res);
          });
        }
      }
    } else {
      if (this.data && this.data.allDataFormation && this.data.allDataFormation.length) {
        // need to filter out the type of formations that are already chosen
        const alreadySelectedTypes = this.data.allDataFormation.map((formation) => formation.type_of_formation);
        this.listOfType = this.listOfTypeOriginal.filter((type) => !alreadySelectedTypes.includes(type));
      } else {
        this.listOfType = this.listOfTypeOriginal;
      }
    }
  }

  patchReadmissonFormOnEdit() {
    // console.log('_this data', this.data);
    // console.log('_temp', this.templates);

    if (this.data && this.data.isEdit) {
      if (
        this.data.typeOfFormationData &&
        this.data.typeOfFormationData.form_builder_id &&
        this.data.typeOfFormationData.form_builder_id._id
      ) {
        this.data.typeOfFormationData.form_builder_id = this.data.typeOfFormationData.form_builder_id._id;
      }
      this.addTypeOfFormation.patchValue(this.data.typeOfFormationData);
      this.firstForm = _.cloneDeep(this.addTypeOfFormation.value);
      if (this.data.typeOfFormationData.readmission_form_id) {
        if (this.data && this.data.selectedReAdmissionForm) {
          const origin = _.cloneDeep(this.templatesRe);
          origin.push(this.data.selectedReAdmissionForm);
          this.templatesRe = _.cloneDeep(origin);
          // this.templatesRe = this.templatesRe.filter(
          //   (data) =>
          //     data &&
          //     this.data.selectedReAdmissionForm &&
          //     this.data.selectedReAdmissionForm._id &&
          //     (data.is_used_readmission === false || this.data.selectedReAdmissionForm._id === data._id),
          // );
          this.formCtrlReListFiltered = this.formCtrlRe.valueChanges.pipe(
            startWith(''),
            map((searchText) =>
              this.templatesRe.filter((type) =>
                type.form_builder_name
                  ? this.utilityService.simplifyRegex(type.form_builder_name).toLowerCase().includes(searchText.toString().toLowerCase())
                  : true,
              ),
            ),
          );
        }

        const foundRe = this.templatesRe.find((res) => res._id === this.data.typeOfFormationData.readmission_form_id);
        if (foundRe && foundRe.form_builder_name) {
          this.formCtrlRe.setValue(foundRe.form_builder_name);
        }
      }
      this.isWaitingForResponse = false;
    }
  }

  patchFormOnEdit() {
    // console.log('_this data', this.data);
    // console.log('_temp', this.templates);

    if (this.data && this.data.isEdit) {
      if (
        this.data.typeOfFormationData &&
        this.data.typeOfFormationData.form_builder_id &&
        this.data.typeOfFormationData.form_builder_id._id
      ) {
        this.data.typeOfFormationData.form_builder_id = this.data.typeOfFormationData.form_builder_id._id;
      }
      this.addTypeOfFormation.patchValue(this.data.typeOfFormationData);
      this.firstForm = _.cloneDeep(this.addTypeOfFormation.value);
      if (this.data.typeOfFormationData.admission_form_id) {
        if (this.data && this.data.selectedAdmissionForm) {
          const origin = _.cloneDeep(this.templates);
          origin.push(this.data.selectedAdmissionForm);
          this.templates = _.cloneDeep(origin);
          // this.templates = this.templates.filter(
          //   (data) =>
          //     data &&
          //     this.data.selectedAdmissionForm &&
          //     this.data.selectedAdmissionForm._id &&
          //     (data.is_used_admission === false || this.data.selectedAdmissionForm._id === data._id),
          // );
          this.templates = _.uniqBy(this.templates, '_id');
          this.formCtrlListFiltered = this.formCtrl.valueChanges.pipe(
            startWith(''),
            map((searchText) =>
              this.templates.filter((type) =>
                type.form_builder_name
                  ? this.utilityService.simplifyRegex(type.form_builder_name).toLowerCase().includes(searchText.toString().toLowerCase())
                  : true,
              ),
            ),
          );
        }
        const found = this.templates.find((res) => res._id === this.data.typeOfFormationData.admission_form_id);
        if (found && found.form_builder_name) {
          this.formCtrl.patchValue(found.form_builder_name, { emitEvent: true });
        }
      } else {
        if (this.addTypeOfFormation.get('type_of_formation').value === 'classic') {
          this.formCtrl.setValue(this.translate.instant('type_formation.classic'));
        }
      }
      this.isWaitingForResponse = false;
    }
  }

  initForm() {
    this.addTypeOfFormation = this.fb.group({
      type_of_information: [null, Validators.required],
      type_of_formation: [null, Validators.required],
      sigle: [null, Validators.required],
      description: [null],
      admission_form_id: [null],
      readmission_form_id: [null],
      accounting_plan: [null, Validators.required],
    });
  }

  selectType(type) {
    this.addTypeOfFormation.get('type_of_information').setValue(type);
    if (type.includes('continuous')) {
      this.addTypeOfFormation.get('admission_form_id').setValidators([Validators.required]);
      this.addTypeOfFormation.get('admission_form_id').updateValueAndValidity();
    } else {
      this.addTypeOfFormation.get('admission_form_id').setValue(null);
      this.addTypeOfFormation.get('admission_form_id').clearValidators();
      this.addTypeOfFormation.get('admission_form_id').updateValueAndValidity();
    }
  }

  getAllReadmissionFormBuilderTemplates() {
    if (this.data.isEdit) {
      this.isWaitingForResponse = true;
    }

    const filter = {
      status: true,
      template_type: 'student_admission',
      hide_form: false,
    };

    this.subs.sink = this.formBuilderService.getAllFormBuildersFormationDropdown(filter).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.templatesRe = resp;
          // this.originalFormBuilderReList = _.cloneDeep(resp);
          this.formCtrlReListFiltered = this.formCtrlRe.valueChanges.pipe(
            startWith(''),
            map((searchText) =>
              this.templates.filter((type) =>
                type.form_builder_name
                  ? this.utilityService.simplifyRegex(type.form_builder_name).toLowerCase().includes(searchText.toString().toLowerCase())
                  : true,
              ),
            ),
          );
          if (this.data.isEdit) {
            this.patchReadmissonFormOnEdit();
          }
          this.isWaitingForResponse = false;
        } else {
          this.isWaitingForResponse = false;
          if (this.data.isEdit) {
            this.patchReadmissonFormOnEdit();
          }
        }
      },
      (error) => {
        // Record error log
        this.authService.postErrorLog(error);
        this.isWaitingForResponse = false;
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }

  getAllFormBuilderTemplates() {
    if (this.data.isEdit) {
      this.isWaitingForResponse = true;
    }

    const filter = {
      status: true,
      template_type: 'student_admission',
      is_empty_type_formation: true,
      hide_form: false,
    };

    this.subs.sink = this.formBuilderService.getAllFormBuildersFormationDropdown(filter).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.templates = resp;
          this.formCtrlListFiltered = this.formCtrl.valueChanges.pipe(
            startWith(''),
            map((searchText) =>
              this.templates.filter((type) =>
                type.form_builder_name
                  ? this.utilityService.simplifyRegex(type.form_builder_name).toLowerCase().includes(searchText.toString().toLowerCase())
                  : true,
              ),
            ),
          );
          if (this.data.isEdit) {
            this.patchFormOnEdit();
          }
          this.isWaitingForResponse = false;
        } else {
          this.isWaitingForResponse = false;
          if (this.data.isEdit) {
            this.patchFormOnEdit();
          }
        }
      },
      (error) => {
        // Record error log
        this.authService.postErrorLog(error);
        this.isWaitingForResponse = false;
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }

  checkFormValidity(): boolean {
    if (this.addTypeOfFormation.invalid || this.formCtrl.invalid || this.formCtrlRe.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.addTypeOfFormation.markAllAsTouched();
      const type = this.addTypeOfFormation.get('type_of_information').value;
      if (type) {
        this.formCtrl.markAsTouched();
        this.formCtrlRe.markAsTouched();
      } else {
        this.formCtrl.markAsPristine();
        this.formCtrlRe.markAsPristine();
      }
      return true;
    } else {
      return false;
    }
  }

  onValidate() {
    if (this.checkFormValidity()) {
      return;
    }
    const payload = this.addTypeOfFormation.value;
    if (this.data.isEdit) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.intakeChannelService.updateTypeOfInformation(this.data.typeOfFormationData._id, payload).subscribe(
        (res) => {
          this.isWaitingForResponse = false;
          if (res) {
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
          }
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: Name already exists!') {
            Swal.fire({
              title: this.translate.instant('USERADD_S2.TITLE'),
              html: this.translate.instant('Name is already exists. Please use another name'),
              type: 'warning',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('USERADD_S2.BUTTON'),
            }).then(() => {
              this.dialogRef.close(true);
            });
            return;
          }
          if (err['message'] === 'GraphQL error: you cant change this type of formation because already used in registration profile') {
            Swal.fire({
              title: this.translate.instant('031_ERRORMSG.TITLE'),
              html: this.translate.instant('031_ERRORMSG.TEXT'),
              type: 'warning',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('031_ERRORMSG.BUTTON_1'),
            }).then(() => {
              this.dialogRef.close(true);
            });
            return;
          } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('BAD_CONNECTION.Title'),
              html: this.translate.instant('BAD_CONNECTION.Text'),
              confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          } else {
            this.showSwalError(err);
          }
        },
      );
    } else {
      this.isWaitingForResponse = true;
      this.subs.sink = this.intakeChannelService.createTypeOfInformation(payload).subscribe(
        (res) => {
          this.isWaitingForResponse = false;
          if (res) {
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
          }
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: Name already exists!') {
            Swal.fire({
              title: this.translate.instant('USERADD_S2.TITLE'),
              html: this.translate.instant('Name is already exists. Please use another name'),
              type: 'warning',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('USERADD_S2.BUTTON'),
            }).then(() => {
              this.dialogRef.close(true);
            });
          } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('BAD_CONNECTION.Title'),
              html: this.translate.instant('BAD_CONNECTION.Text'),
              confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          } else {
            this.showSwalError(err);
          }
        },
      );
    }
  }

  getAllTypeOfInformation() {
    this.subs.sink = this.intakeChannelService.getAllTypeOfInformationDropdown().subscribe(
      (res) => {
        if (res) {
          this.listTypeOfInformation = res;
        }
      },
      (error) => {
        // Record error log
        this.authService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }

  selectedTypeOfInformation(selectedData) {
    if (selectedData) {
      this.data = selectedData;
      this.addTypeOfFormation.patchValue(selectedData);
    }
  }

  showSwalError(err) {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('SORRY'),
      text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
      confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
    }).then(() => {
      this.dialogRef.close(true);
    });
  }

  comparison() {
    const firstForm = JSON.stringify(this.firstForm);
    const form = JSON.stringify(this.addTypeOfFormation.value);
    if (firstForm === form) {
      return true;
    } else {
      return false;
    }
  }

  handleSelected(value) {
    if (value) {
      this.addTypeOfFormation.get('admission_form_id').patchValue(value);
      this.formCtrlListFiltered = of(this.templates);
    }
  }

  handleReSelected(value) {
    if (value) {
      this.addTypeOfFormation.get('readmission_form_id').patchValue(value);
      this.formCtrlReListFiltered = of(this.templatesRe);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
