import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'app/service/utility/utility.service';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { constants } from 'os';
import * as _ from 'lodash';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { AcademicKitService } from 'app/service/rncpTitles/academickit.service';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-sending-pre-contract-form-dialog',
  templateUrl: './sending-pre-contract-form-dialog.component.html',
  styleUrls: ['./sending-pre-contract-form-dialog.component.scss'],
})
export class SendingPreContractFormDialogComponent implements OnInit {
  templateForm: UntypedFormGroup;
  private subs = new SubSink();
  isAllEmpty = true;

  templates = [];
  userTypeList = [];
  userList: any;
  signatoryUserList = [];
  validatorUserList = [];
  isWaitingForResponse = false;
  isValid = true;
  dataSelected: any;
  dataValidator = [];
  contractManager;
  listSignatoryAuto = ['61dd3ccff647127fd6bf65d7'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<SendingPreContractFormDialogComponent>,
    private contractService: TeacherContractService,
    private formBuilderService: FormBuilderService,
    public translate: TranslateService,
    private utilService: UtilityService,
    private academicService: AcademicKitService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    console.log('data yang di pass', this.data);
    this.initForm();
    this.getPreContractDropdown();
    this.getAllUserType();
    this.getContractManager();

    if (this.data && this.data.type === 'single' && this.data.process) {
      this.templateForm.get('_id').patchValue([this.data.process._id]);
    } else if (this.data.type === 'multiple' && this.data.selectAll) {
      this.templateForm.get('is_select_all').patchValue(this.data.selectAll);
      if (this.data.selection && this.data.selection.length) {
        const teacherHasStep = this.data.selection.filter((list) => {
          if (list.steps && list.steps.length) {
            return list;
          }
        });
        this.isAllEmpty = true;
        if (teacherHasStep && teacherHasStep.length) {
          this.isAllEmpty = false;
        }
      }
    } else if (this.data.type === 'multiple' && !this.data.selectAll && this.data.selection && this.data.selection.length) {
      const processIds = [];
      this.data.selection.forEach((select) => {
        processIds.push(select._id);
      });
      if (this.data.selection && this.data.selection.length) {
        const teacherHasStep = this.data.selection.filter((list) => {
          if (list.steps && list.steps.length) {
            return list;
          }
        });
        this.isAllEmpty = true;
        if (teacherHasStep && teacherHasStep.length) {
          this.isAllEmpty = false;
        }
      }
      this.templateForm.get('_id').patchValue(processIds);
    }
    console.log('this.data', this.data, this.isAllEmpty);
  }

  getContractManager() {
    if (this.data && this.data.process && this.data.process.contract_manager) {
      this.subs.sink = this.contractService.getOneUser(this.data.process.contract_manager._id).subscribe(
        (user) => {
          this.contractManager = user;
        },
        (err) => {
          this.authService.postErrorLog(err);
          if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    }
  }

  initForm() {
    this.templateForm = this.fb.group({
      _id: [null],
      pre_contract_template_id: [null, [Validators.required]],
      is_select_all: [false],
      step_validator_input: this.fb.array([]),
      contract_validator_signatory_status_input: this.fb.array([]),
    });
  }

  initValidatorsForm() {
    return this.fb.group({
      user_validator: [null, [Validators.required]],
      validator: [null],
      pre_contract_template_step_id: [null],
    });
  }

  pushValidator() {
    this.getValidatorArray().push(this.initValidatorsForm());
  }

  getValidatorArray(): UntypedFormArray {
    return this.templateForm.get('step_validator_input') as UntypedFormArray;
  }

  get validatorArr() {
    return this.templateForm.get('step_validator_input') as UntypedFormArray;
  }

  initSignatoryForm() {
    return this.fb.group({
      user_type_id: [null],
      user_id: [null, [Validators.required]],
      is_already_sign: [false],
    });
  }

  pushSignatory() {
    this.getSignatoryArray().push(this.initSignatoryForm());
  }

  get signatoryArr() {
    return this.templateForm.get('contract_validator_signatory_status_input') as UntypedFormArray;
  }

  getSignatoryArray(): UntypedFormArray {
    return this.templateForm.get('contract_validator_signatory_status_input') as UntypedFormArray;
  }

  getPreContractDropdown() {
    const payload = {
      status: true,
      template_type: 'teacher_contract',
      hide_form: false,
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.formBuilderService.getAllFormBuildersTeacher(payload).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        console.log(resp);
        if (resp && resp.length) {
          this.templates = resp.filter((ressp) => ressp.is_published === true);
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  getAllUserType() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.academicService.getAllUserTypes().subscribe(
      (res) => {
        this.isWaitingForResponse = false;
        if (res) {
          this.userTypeList = res;
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  getFilterSignatoryUser(userType, listIndex, name?) {
    if(userType === '61dd3ccff647127fd6bf65d7'){
      const payload = {
        _id: this.data?.process?.user_id?._id,
        civility: this.data?.process?.civility,
        first_name: this.data?.process?.first_name,
        last_name: this.data?.process?.last_name,
      }
      this.selectedUser(listIndex, payload);
    }else{
      this.isWaitingForResponse = true;
      this.subs.sink = this.contractService.GetAllUsers(userType, name).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp && resp.length) {
            const mappedData = resp?.map((data) => {
              data.last_name = data?.last_name?.toLowerCase()?.trim();

              return data;
            })
            const sortedData = _.sortBy(mappedData, 'last_name');
            this.signatoryUserList[listIndex] = sortedData;
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    }
  }

  selectedUser(indexUser,value){
    this.getSignatoryArray().at(indexUser).get('user_id').patchValue(value);
  }

  getFilterValidatorUser(userType, listIndex, name?) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.GetAllUsers(userType, name).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          const mappedData = resp?.map((data) => {
            data.last_name = data?.last_name?.toLowerCase()?.trim();

            return data;
          })
          const sortedData = _.sortBy(mappedData, 'last_name');
          this.validatorUserList[listIndex] = sortedData;
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  filterValidatorUser(value, listIndex, userType) {
    console.log(value.length > 2, value.length === 0);
    if (value.length > 2 || value.length === 0) {
      const filterUser = this.utilService.simpleDiacriticSensitiveRegex(value.toLowerCase());
      this.getFilterValidatorUser(userType, listIndex, filterUser);
    }
  }

  filterSignatoryUser(value, listIndex, userType) {
    console.log(value.length > 2, value.length === 0);
    if (value.length > 2 || value.length === 0) {
      const filterUser = this.utilService.simpleDiacriticSensitiveRegex(value.toLowerCase());
      this.getFilterSignatoryUser(userType, listIndex, filterUser);
    }
  }

  getNameOfUserType(formCtrl, type) {
    let userType;
    const form = formCtrl.value;
    if (this.userTypeList && this.userTypeList.length) {
      if (form && type === 'validator') {
        userType = this.userTypeList.find((resp) => resp._id === form.validator);
      } else if (form && type === 'signatory') {
        userType = this.userTypeList.find((resp) => resp._id === form.user_type_id);
      }
    }
    return userType ? userType.name : '';
  }

  checkFormValidity(): boolean {
    if (this.templateForm.invalid) {
      this.isWaitingForResponse = false;
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.templateForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  triggerSwal() {
    this.isWaitingForResponse = false;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('FormSave_S1.TITLE'),
      html: this.translate.instant('FormSave_S1.TEXT'),
      confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
    });
    this.templateForm.markAllAsTouched();
    this.isValid = false;
    return null;
  }

  onSubmit() {
    this.isWaitingForResponse = true;
    if (this.checkFormValidity()) {
      return;
    }
    const payload = this.templateForm.value;
    let filter = null;
    if (this.data.type === 'multiple' && this.data.selectAll) {
      filter = this.data.filter;
    }
    const signa = payload.contract_validator_signatory_status_input.map((resp) => {
      return {
        user_type_id: resp.user_type_id,
        user_id: resp && resp.user_id && resp.user_id._id ? resp.user_id._id : this.triggerSwal(),
        is_already_sign: false,
      };
    });
    const valid = payload.step_validator_input.map((resp) => {
      return {
        pre_contract_template_step_id: resp.pre_contract_template_step_id,
        user_validator: resp && resp.user_validator && resp.user_validator._id ? resp.user_validator._id : this.triggerSwal(),
        validator: resp.validator,
      };
    });
    console.log(payload);
    if (this.checkFormValidity()) {
      this.isWaitingForResponse = false;
      return;
    }
    if (!this.isValid) {
      this.isWaitingForResponse = false;
      this.isValid = true;
      return;
    }
    let user;
    let civility;
    if (this.data.process) {
      civility =
        this.data.process.civility && this.data.process.civility !== 'neutral' ? this.translate.instant(this.data.process.civility) : '';
      user = civility + ' ' + this.data.process.first_name + ' ' + this.data.process.last_name;
    } else {
      user = this.data.selection
        .map(
          (el) =>
            (el.civility && el.civility !== 'neutral' ? this.translate.instant(el.civility) : '') +
            ' ' +
            el.first_name +
            ' ' +
            el.last_name,
        )
        .join();
    }
    console.log('payload', payload, user);
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('InterCont_S8.Title', {
        user: user,
      }),
      html: this.translate.instant('InterCont_S8.Text', {
        user: user,
      }),
      confirmButtonText: this.translate.instant('InterCont_S8.Button1'),
      cancelButtonText: this.translate.instant('InterCont_S8.Button2'),
      allowEnterKey: false,
      allowOutsideClick: false,
      showCancelButton: true,
      allowEscapeKey: false,
    }).then((confirm) => {
      if (confirm.value) {
        this.subs.sink = this.contractService
          .sendContractProcessWithAssign(payload._id, payload.pre_contract_template_id, payload.is_select_all, filter, valid, signa)
          .subscribe(
            (resp) => {
              this.isWaitingForResponse = false;
              console.log(resp);
              if (this.isAllEmpty) {
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('Bravo!'),
                  confirmButtonText: this.translate.instant('OK'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.dialogRef.close(this.templateForm.value);
                });
              } else {
                Swal.fire({
                  title: this.translate.instant('SendForm_S1.TITLE'),
                  html: this.translate.instant('SendForm_S1.TEXT'),
                  confirmButtonText: this.translate.instant('SendForm_S1.BUTTON_1'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.dialogRef.close(this.templateForm.value);
                });
              }
            },
            (err) => {
              this.authService.postErrorLog(err);
              this.isWaitingForResponse = false;
              if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
                  text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                  confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                });
              }
            },
          );
      } else {
        this.isWaitingForResponse = false;
      }
    });
    // this.dialogRef.close(this.templateForm.value);
  }
  selectedTemplate(data) {
    this.dataSelected = data;
    this.dataSelected.steps = data.steps.filter(
      (list) => list.validator || list.is_user_who_receive_the_form_as_validator || list.step_type === 'step_with_signing_process',
    );
    console.log('dataSelected', this.dataSelected, data);
    const validator = this.templateForm.get('step_validator_input').value;
    const signatory = this.templateForm.get('contract_validator_signatory_status_input').value;

    if (validator && validator.length) {
      for (let i = validator.length - 1; i >= 0; i--) {
        this.validatorArr.removeAt(i);
      }
    }
    if (signatory && signatory.length) {
      for (let i = signatory.length - 1; i >= 0; i--) {
        this.signatoryArr.removeAt(i);
      }
    }
    const dataSteps = data && data.steps && data.steps.length ? data.steps : [];
    const listContractSigning = dataSteps.filter((resp) => resp && resp.step_type && resp.step_type === 'step_with_signing_process');
    let contractSignature = [];
    listContractSigning.forEach(contract => {
      if (contract && contract.contract_signatory && contract.contract_signatory.length) {
      const contract_validator_signatory_status_input = contract.contract_signatory.map((resp) => {
        return {
          user_id: null,
          user_type_id: resp._id,
          is_already_sign: false,
        };
      });
      contractSignature = contractSignature.concat(contract_validator_signatory_status_input);
      }
      contractSignature = _.uniqBy(contractSignature, 'user_type_id');
    })

    contractSignature.forEach((element) => {
      this.pushSignatory();
    });
    this.templateForm.get('contract_validator_signatory_status_input').patchValue(contractSignature);
    let i = 0;
    this.templateForm.get('contract_validator_signatory_status_input').value.forEach((val) => {
      this.signatoryUserList[i] = this.getFilterSignatoryUser(val.user_type_id, i);
      if (val.user_type_id === '6209f2dc74890f0ecad16670' && this.contractManager) {
        this.getSignatoryArray().controls[i].get('user_id').setValue(this.contractManager);
      }
      i++;
    });


    const dataValidator = dataSteps.filter((resp) => (resp && resp.validator) || resp.is_user_who_receive_the_form_as_validator);
    if (dataValidator && dataValidator.length) {
      dataValidator.forEach((element) => {
        if (element.validator || element.is_user_who_receive_the_form_as_validator) {
          this.pushValidator();
        }
      });
      let step_validator_input = dataValidator.map((resp) => {
        return {
          user_validator: resp.is_user_who_receive_the_form_as_validator ? this.data.process._id : null,
          validator: resp && resp.validator ? resp.validator._id : null,
          pre_contract_template_step_id: resp._id,
        };
      });
      step_validator_input = step_validator_input.filter((resp) => resp.user_validator || resp.validator);
      this.templateForm.get('step_validator_input').patchValue(step_validator_input);
      console.log('step validator', step_validator_input, data, this.validatorArr.value);

      let i = 0;
      this.templateForm.get('step_validator_input').value.forEach((val) => {
        console.log(val);
        this.validatorUserList[i] = this.getFilterValidatorUser(val.validator, i);
        if (val.validator === '6209f2dc74890f0ecad16670' && this.contractManager) {
          this.getValidatorArray().controls[i].get('user_validator').setValue(this.contractManager);
        }
        i++;
      });
    }
  }

  displayFullName(user): string {
    console.log(user);
    if (user) {
      const civility =
        user.civility && user.civility !== 'neutral'
          ? user.civility
            ? this.translate
              ? this.translate.instant(user.civility)
              : user.civility
            : ''
          : '';
      return user.last_name.toUpperCase() + ' ' + user.first_name + ' ' + civility;
    }
    return null;
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
