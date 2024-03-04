import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { AcademicKitService } from 'app/service/rncpTitles/academickit.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-send-one-time-form-dialog',
  templateUrl: './send-one-time-form-dialog.component.html',
  styleUrls: ['./send-one-time-form-dialog.component.scss'],
})
export class SendOneTimeFormDialogComponent implements OnInit {
  typeForm: UntypedFormGroup;
  private subs = new SubSink();
  listFormBuilder: any[];
  validatorUserList = [];

  isWaitingForResponse: boolean;
  userTypeList: any;
  signatoryUserList = [];
  dataSelected: any;
  studentSignatory = null
  studentsDropdown = []
  studentSignatoryName = new UntypedFormControl(null)

  constructor(
    private fb: UntypedFormBuilder,
    private formBuilderService: FormBuilderService,
    private academicService: AcademicKitService,
    private translate: TranslateService,
    private utilService: UtilityService,
    private teacherService: TeacherContractService,
    private dialogRef: MatDialogRef<SendOneTimeFormDialogComponent>,
    private userService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data,
  ) { }

  ngOnInit(): void {
    if (this.data?.students?.length === 1) {
      this.studentSignatory = {
        name: this.data.students[0]?.last_name?.toUpperCase() + ' ' + this.data.students[0]?.first_name + ' ' + (this.data.students[0].civility === '' ? '' : this.translate.instant(this.data.students[0].civility)),
        id: this.data.students[0]?.user_id?._id
      }
    }
    this.initFormBuilder();
    this.getFormBuilderOneTime();
    this.getAllUserType();
  }

  initFormBuilder() {
    this.typeForm = this.fb.group({
      form_builder_id: [null, [Validators.required]],
      contract_validator_signatory_status: this.fb.array([]),
      step_validator_input: this.fb.array([]),
    });
  }

  getFormBuilderOneTime() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formBuilderService.getAllFormBuildersByTemplate('one_time_form').subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.listFormBuilder = resp;
        } else {
          this.listFormBuilder = [];
        }
        this.isWaitingForResponse = false;
      }, (err) => {
        this.userService.postErrorLog(err);
      }
    );
  }

  getAllUserType() {
    this.subs.sink = this.academicService.getAllUserTypesIncludeStudent().subscribe(
      (res) => {
        if (res) {
          this.userTypeList = res;
          console.log('this.userTypeList', this.userTypeList);
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getFilterSignatoryUser(userType, listIndex, name?) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherService.GetAllUsers(userType, name).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          console.log('signatory user:: ', resp, 'index::', listIndex);
          this.signatoryUserList[listIndex] = resp;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  getFilterSignatoryUserIncludeStudent(userType, listIndex, name?) {
    this.subs.sink = this.teacherService.GetAllUsersIncludeStudent(userType, name).subscribe(
      (resp) => {
        if (resp && resp.length) {
          console.log('signatory user include student  :: ', resp);
          if (userType === '5a067bba1c0217218c75f8ab' && this.data?.students?.length) {
            let students = []
            const temp = _.cloneDeep(resp)
            temp.forEach(student => {
              const findStudent = this.data.students.find(data => student._id === data?.user_id?._id)
              if (findStudent) {
                students.push(findStudent)
              }
            })
            this.signatoryUserList[listIndex] = students
          } else {
            this.signatoryUserList[listIndex] = resp;
          }
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  filterSignatoryUser(value, listIndex, userType) {
    console.log(value.length > 2, value.length === 0);
    if (value.length > 2 || value.length === 0) {
      const filterUser = this.utilService.simpleDiacriticSensitiveRegex(value.toLowerCase());
      if (userType === '5a067bba1c0217218c75f8ab') {
        // userType is student
        if (this.studentsDropdown?.length) {
          if (value?.length > 2 && filterUser) {
            const findStudent = this.studentsDropdown.filter(student => this.utilService.simpleDiacriticSensitiveRegex(student?.last_name?.toLowerCase())?.includes(filterUser))
            if (findStudent?.length) {
              this.signatoryUserList[listIndex] = findStudent
            } else {
              this.getFilterSignatoryUserIncludeStudent(userType, listIndex, filterUser);
            }
          } else {
            setTimeout(() => {
              this.signatoryUserList[listIndex] = this.studentsDropdown
            }, 600)
          }
        } else {
          this.getFilterSignatoryUserIncludeStudent(userType, listIndex, filterUser);
        }
      } else {
        this.getFilterSignatoryUser(userType, listIndex, filterUser);
      }
    }
  }

  filterValidatorUser(value, listIndex, userType) {
    if (value.length > 2 || value.length === 0) {
      const filterUser = this.utilService.simpleDiacriticSensitiveRegex(value.toLowerCase());
      this.getFilterValidatorUser(userType, listIndex, filterUser);
    }
  }

  getFilterValidatorUser(userType, listIndex, name?) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherService.GetAllUsers(userType, name).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          this.validatorUserList[listIndex] = resp;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
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
    const userTypeName = userType && userType.name ? this.translate.instant('USER_TYPES.' + userType.name) : '';
    return userTypeName;
  }

  initSignatoryForm() {
    return this.fb.group({
      user_type_id: [null],
      user_id: [null, [Validators.required]],
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
    return this.typeForm.get('step_validator_input') as UntypedFormArray;
  }

  get validatorArr() {
    return this.typeForm.get('step_validator_input') as UntypedFormArray;
  }

  pushSignatory() {
    this.getSignatoryArray().push(this.initSignatoryForm());
  }

  get signatoryArr() {
    return this.typeForm.get('contract_validator_signatory_status') as UntypedFormArray;
  }

  getSignatoryArray(): UntypedFormArray {
    return this.typeForm.get('contract_validator_signatory_status') as UntypedFormArray;
  }

  selectedTemplate(data) {
    const dataTemplate = _.cloneDeep(data);
    // this.dataSelected = data;
    // this.dataSelected.steps = data.steps.filter(
    //   (list) => list.validator || list.is_user_who_receive_the_form_as_validator,
    // );

    const validator = this.typeForm.get('step_validator_input').value;
    const signatory = this.typeForm.get('contract_validator_signatory_status').value;

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

    const dataSteps = dataTemplate && dataTemplate.steps && dataTemplate.steps.length ? dataTemplate.steps : [];
    const dataContractSigning = dataSteps.find((resp) => resp && resp.step_type && resp.step_type === 'step_with_signing_process');
    if (dataContractSigning && dataContractSigning.contract_signatory && dataContractSigning.contract_signatory.length) {
      dataContractSigning.contract_signatory.forEach((element) => {
        this.pushSignatory();
      });
      const contract_validator_signatory_status_input = dataContractSigning.contract_signatory.map((resp) => {
        return {
          user_id: this.studentSignatory && resp?._id === '5a067bba1c0217218c75f8ab' ? this.studentSignatory?.id : null,
          user_type_id: resp._id,
          is_already_sign: false,
        };
      });
      this.typeForm.get('contract_validator_signatory_status').patchValue(contract_validator_signatory_status_input);
      this.typeForm.get('contract_validator_signatory_status').value.forEach((val, index) => {
        if (val?.user_type_id === '5a067bba1c0217218c75f8ab') {
          if (this.studentSignatory) {
            this.studentSignatoryName.patchValue(this.studentSignatory?.name)
          } else {
            if (this.data?.students?.length && (!this.data?.isCheckedAll || (this.data?.isCheckedAll && this.data?.students?.length <= 100))) {
              this.data.students.filter(student => {
                if (student?.user_id?._id) {
                  this.studentsDropdown.push({
                    ...student?.user_id
                  })
                }
              })
              console.log('cek studentdropdown', this.studentsDropdown)
              this.signatoryUserList[index] = this.studentsDropdown
            } else {
              this.getFilterSignatoryUserIncludeStudent(val?.user_type_id, index)
            }
          }
        } else {
          this.getFilterSignatoryUser(val.user_type_id, index);
        }
      });
    }
    const dataValidator = dataSteps.filter((resp) => resp && resp.validator);
    if (dataValidator && dataValidator.length) {
      dataValidator.forEach((element) => {
        if (element.validator) {
          this.pushValidator();
        }
      });
      let step_validator_input = dataValidator.map((resp) => {
        return {
          user_validator: null,
          validator: resp && resp.validator ? resp.validator._id : null,
          pre_contract_template_step_id: resp._id,
        };
      });
      step_validator_input = step_validator_input.filter((resp) => resp.user_validator || resp.validator);
      this.typeForm.get('step_validator_input').patchValue(step_validator_input);

      this.typeForm.get('step_validator_input').value.forEach((val, index) => {
        this.validatorUserList[index] = this.getFilterValidatorUser(val.validator, index);
      });
    }
  }

  onSubmitForm() {
    const payload = this.typeForm.value;
    const lang = this.translate.currentLang;

    const signatoryInput = payload.contract_validator_signatory_status.map((resp) => {
      return {
        user_type_id: resp.user_type_id,
        user_id: resp.user_type_id === '5a067bba1c0217218c75f8ab' && this.studentSignatory ? resp?.user_id : resp?.user_id?._id,
      };
    });
    const validatorInput = payload.step_validator_input.map((resp) => {
      return {
        pre_contract_template_step_id: resp.pre_contract_template_step_id,
        user_validator: resp.user_validator._id,
        validator: resp.validator,
      };
    });
    let studentIds = []
    let candidateIds = []
    if (this.data?.students?.length) {
      studentIds = this.data.students.map(student => student._id)
      candidateIds = this.data.students.map(student => student.candidate_id._id)
    }
    this.isWaitingForResponse = true;
    this.subs.sink = this.formBuilderService
      .sendOneTimeFormToStudent(studentIds, candidateIds, payload.form_builder_id, lang, validatorInput, signatoryInput)
      .subscribe(
        (resp) => {
          console.log('get data', resp);
          this.isWaitingForResponse = false;
          if (resp.includes('some student already receive the form')) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('OneTimeForm_S2.TITLE'),
              text: this.translate.instant('OneTimeForm_S2.TEXT'),
              confirmButtonText: this.translate.instant('OneTimeForm_S2.BUTTON'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close(true);
            });
          } else {
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
          this.isWaitingForResponse = false;
          console.log('error:: ', err);
          this.userService.postErrorLog(err);
          if (err && err['message']?.includes('cannot send same form to students')) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('OneTimeForm_S1.TITLE'),
              text: this.translate.instant('OneTimeForm_S1.TEXT'),
              confirmButtonText: this.translate.instant('OneTimeForm_S1.BUTTON'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
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

  onValidate() {
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
      this.onSubmitForm();
    }
  }

  displayFullName(user): string {
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
}
