import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { AcademicKitService } from 'app/service/rncpTitles/academickit.service';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';

@Component({
  selector: 'ms-connect-cvec-form-dialog',
  templateUrl: './connect-cvec-form-dialog.component.html',
  styleUrls: ['./connect-cvec-form-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class ConnectCvecFormDialogComponent implements OnInit, OnDestroy {

  private subs = new SubSink();

  isWaitingForResponse: boolean = false;

  cvecForm: UntypedFormGroup;
  studentSignatoryName = new UntypedFormControl(null);

  allFormBuilderTempalate = [];
  userTypeList: any;
  studentSignatory = null;
  signatoryUserList = [];
  validatorUserList = [];
  studentsDropdown = [];
  
  constructor(
    public dialogRef: MatDialogRef<ConnectCvecFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public parentData,
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private parseStringDatePipe: ParseStringDatePipe,
    private formBuilderService: FormBuilderService,
    private intakeChannelService: IntakeChannelService,
    private teacherService: TeacherContractService,
    private authService: AuthService,
    private utilService: UtilityService,
    private academicService: AcademicKitService,
  ) { }

  ngOnInit(): void {
    if (this.parentData?.students?.length === 1) {
      this.studentSignatory = {
        name: 
          this.parentData.students[0]?.last_name?.toUpperCase() + 
          ' ' + 
          this.parentData.students[0]?.first_name + 
          ' ' + 
          (this.parentData.students[0].civility === '' ? 
          '' : this.translate.instant(this.parentData.students[0].civility)),
        id: this.parentData.students[0]?.user_id?._id
      }
    }
    this.getAllFormBuilderTemplate();
    this.initForm();
    this.getAllUserType();
  }

  initForm() {
    this.cvecForm = this.fb.group({
      form_template: [null, Validators.required],
      send_date: [null, Validators.required],
      step_validator_input: this.fb.array([]),
      contract_validator_signatory_status: this.fb.array([]),
    });
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

  get validatorArr() {
    return this.cvecForm.get('step_validator_input') as UntypedFormArray;
  }

  get signatoryArr() {
    return this.cvecForm.get('contract_validator_signatory_status') as UntypedFormArray;
  }

  getSignatoryArray(): UntypedFormArray {
    return this.cvecForm.get('contract_validator_signatory_status') as UntypedFormArray;
  }

  getValidatorArray(): UntypedFormArray {
    return this.cvecForm.get('step_validator_input') as UntypedFormArray;
  }

  pushSignatory() {
    this.getSignatoryArray().push(this.initSignatoryForm());
  }

  pushValidator() {
    this.getValidatorArray().push(this.initValidatorsForm());
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

  getAllUserType() {
    this.subs.sink = this.academicService.getAllUserTypesIncludeStudent().subscribe(
      (res) => {
        if (res) {
          this.userTypeList = res;
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'error',
          title: 'Error',
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  filterValidatorUser(value, listIndex, userType) {
    if (value.length > 2 || value.length === 0) {
      const filterUser = this.utilService.simpleDiacriticSensitiveRegex(value.toLowerCase());
      this.getFilterValidatorUser(userType, listIndex, filterUser);
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
    const userTypeName = userType && userType.name ? this.translate.instant('USER_TYPES.' + userType.name) : '';
    return userTypeName;
  }

  getFilterSignatoryUser(userType, listIndex, name?) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherService.GetAllUsers(userType, name).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          this.signatoryUserList[listIndex] = resp;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'error',
          title: 'Error',
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  selectedTemplate(data) {
    const dataTemplate = _.cloneDeep(data);

    const validator = this.cvecForm.get('step_validator_input').value;
    const signatory = this.cvecForm.get('contract_validator_signatory_status').value;

    if (validator?.length) {
      for (let i = validator.length - 1; i >= 0; i--) {
        this.validatorArr.removeAt(i);
      }
    }
    if (signatory?.length) {
      for (let i = signatory.length - 1; i >= 0; i--) {
        this.signatoryArr.removeAt(i);
      }
    }
    const dataSteps = dataTemplate?.steps?.length ? dataTemplate.steps : [];
    const dataContractSigning = dataSteps.find((resp) => resp?.step_type === 'step_with_signing_process');
    if (dataContractSigning?.contract_signatory?.length) {
      dataContractSigning.contract_signatory.forEach((element) => {
        this.pushSignatory();
      });
      const contract_validator_signatory_status_input = dataContractSigning?.contract_signatory.map((resp) => {
        return {
          user_id: this.studentSignatory && resp?._id === '5a067bba1c0217218c75f8ab' ? this.studentSignatory?.id : null,
          user_type_id: resp._id,
          is_already_sign: false,
        };
      });
      this.cvecForm.get('contract_validator_signatory_status').patchValue(contract_validator_signatory_status_input);
      this.cvecForm.get('contract_validator_signatory_status').value.forEach((val, index) => {
        if (val?.user_type_id === '5a067bba1c0217218c75f8ab') {
          if (this.studentSignatory) {
            this.studentSignatoryName.patchValue(this.studentSignatory?.name)
          } else {
            if (this.parentData?.students?.length && (!this.parentData?.isCheckedAll || (this.parentData?.isCheckedAll && this.parentData?.students?.length <= 100))) {
              this.parentData.students.filter(student => {
                if (student?.user_id?._id) {
                  this.studentsDropdown.push({
                    ...student?.user_id
                  })
                }
              })
              this.signatoryUserList[index] = this.studentsDropdown;
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
          user_validator: resp?.user_validator ? resp.user_validator : null,
          validator: resp && resp.validator ? resp.validator._id : null,
          pre_contract_template_step_id: resp._id,
        };
      });
      step_validator_input = step_validator_input.filter((resp) => resp.user_validator || resp.validator);
      this.cvecForm.get('step_validator_input').patchValue(step_validator_input);

      this.cvecForm.get('step_validator_input').value.forEach((val, index) => {
        this.validatorUserList[index] = this.getFilterValidatorUser(val.validator, index);
      });
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
            type: 'error',
            title: 'Error',
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }
  
  filterSignatoryUser(value, listIndex, userType) {
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

  getFilterSignatoryUserIncludeStudent(userType, listIndex, name?) {
    this.subs.sink = this.teacherService.GetAllUsersIncludeStudent(userType, name).subscribe(
      (resp) => {
        if (resp && resp.length) {
          if (userType === '5a067bba1c0217218c75f8ab' && this.parentData?.students?.length) {
            let students = []
            const temp = _.cloneDeep(resp)
            temp.forEach(student => {
              const findStudent = this.parentData.students.find(data => student._id === data?.user_id?._id)
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
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'error',
          title: 'Error',
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  populatedData() {
    const dataProgram = _.cloneDeep(this.parentData?.programIds[0]);
    const selectedTemplate = this.allFormBuilderTempalate.filter((val) => val?._id === dataProgram?.cvec_template_id?._id);

    if(dataProgram?.cvec_validators?.length) {
      dataProgram?.cvec_validators.forEach((cvec) => {
        const foundIndex = selectedTemplate[0]?.steps?.findIndex((step) => step?._id === cvec?.form_builder_step_id?._id)
        if(foundIndex >= 0) {
          selectedTemplate[0].steps[foundIndex] = { ...selectedTemplate[0]?.steps[foundIndex], user_validator: cvec?.user_validator }
        }
      })
    }

    const sendDate = this.parseStringDatePipe?.transformStringToDate(dataProgram?.cvec_send_date);

    const tempData = {
      form_template: dataProgram?.cvec_template_id?._id,
      send_date: sendDate,
    };

    this.cvecForm?.patchValue(tempData);

    if(selectedTemplate?.length) {
      this.selectedTemplate(selectedTemplate[0]);
    };
  }

  getAllFormBuilderTemplate() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formBuilderService.getAllFormBuildersByTemplate('one_time_form').subscribe((resp) => {
      this.isWaitingForResponse = false;
      if(resp?.length) {
        this.allFormBuilderTempalate = resp;
        if(this.parentData?.item === 'single') {
          this.populatedData();
        };
      } else {
        this.allFormBuilderTempalate = [];
      }
    }, () => {
      this.isWaitingForResponse = false;
    });
  }

  validate() {
    this.isWaitingForResponse = true;
    if (this.cvecForm.invalid) {
      this.isWaitingForResponse = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then(() => {
        this.cvecForm.markAllAsTouched();
        return;
      })
    } else {
      const tempDataForValidator = this.cvecForm.value?.step_validator_input?.map((val) => {
        return {
          form_builder_step_id: val?.pre_contract_template_step_id,
          user_validator: val?.user_validator?._id,
          validator: val?.validator
        };
      })
      const temp = _.cloneDeep(this.parentData.programIds);
      const program_ids = [];
      if (temp && temp.length) {
        temp.forEach((element) => {
          program_ids.push(element._id.toString());
        });
      };
      let sendDate = this.cvecForm.get('send_date').value;
      sendDate = moment(sendDate).format('DD/MM/YYYY');
      const template_id = this.cvecForm.get('form_template').value;
      const program_input = {
        cvec_template_id: template_id,
        cvec_send_date: sendDate,
        cvec_validators: tempDataForValidator
      };

      const filteredValues = this.parentData?.filter;

      const is_select_all = this.parentData?.select_all;
      this.subs.sink = this.intakeChannelService.updatePrograms(program_ids, program_input, is_select_all, filteredValues).subscribe((resp) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: 'Bravo!',
          confirmButtonText: 'OK',
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then(() => {
          this.dialogRef.close(true);
        });
      }, (error) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'error',
          title: 'Error',
          text: error && error['message'] ? error['message'] : error,
          confirmButtonText: this.translate.instant('OK'),
        });
      });
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
