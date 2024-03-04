import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { AcademicKitService } from 'app/service/rncpTitles/academickit.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'ms-connect-admission-document-dialog',
  templateUrl: './connect-admission-document-dialog.component.html',
  styleUrls: ['./connect-admission-document-dialog.component.scss'],
})
export class ConnectAdmissionDocumentDialogComponent implements OnInit, OnDestroy {
  typeForm: UntypedFormGroup;
  private subs = new SubSink();
  templateId;
  alumniOptionPermision;
  listFormBuilder = [];
  isWaitingForResponse = false;

  studentSignatoryName = new UntypedFormControl(null);
  allFormBuilderTempalate = [];
  userTypeList: any;
  studentSignatory = null;
  signatoryUserList = [];
  validatorUserList = [];
  studentsDropdown = [];
  firstLoad = true;
  private timeOutVal: any;

  constructor(
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<ConnectAdmissionDocumentDialogComponent>,
    private formBuilderService: FormBuilderService,
    @Inject(MAT_DIALOG_DATA) public data,
    private authService: AuthService,
    private intakeChannelService: IntakeChannelService,
    private teacherService: TeacherContractService,
    private utilService: UtilityService,
    private academicService: AcademicKitService,
  ) {}

  ngOnInit() {
    if (this.data?.students?.length === 1) {
      this.studentSignatory = {
        name:
          this.data.students[0]?.last_name?.toUpperCase() +
          ' ' +
          this.data.students[0]?.first_name +
          ' ' +
          (this.data.students[0].civility === '' ? '' : this.translate.instant(this.data.students[0].civility)),
        id: this.data.students[0]?.user_id?._id,
      };
    }
    this.initFormBuilder();
    this.patchValue();
    this.getFormBuilder();
    this.getAllUserType();
  }

  populatedData() {
    const dataProgram = _.cloneDeep(this.data?.selected[0]);

    if (dataProgram?.admission_document_template?.length) {
      const selectedTemplate = this.listFormBuilder.filter((val) => val?._id === dataProgram?.admission_document_template[0]?._id);

      if (dataProgram?.adm_doc_validators?.length) {
        dataProgram?.adm_doc_validators.forEach((admDoc) => {
          const foundIndex = selectedTemplate[0]?.steps?.findIndex((step) => step?._id === admDoc?.form_builder_step_id?._id);
          if (foundIndex >= 0) {
            selectedTemplate[0].steps[foundIndex] = { ...selectedTemplate[0]?.steps[foundIndex], user_validator: admDoc?.user_validator };
          }
        });
      }

      const tempData = {
        form_builder_id: dataProgram?.admission_document_template[0]?._id,
      };

      this.typeForm?.patchValue(tempData);

      if (selectedTemplate?.length) {
        this.selectedTemplate(selectedTemplate[0]);
      }
    }
  }

  initFormBuilder() {
    this.typeForm = this.fb.group({
      form_builder_id: [null, [Validators.required]],
      program_ids: [null],
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
    return this.typeForm.get('step_validator_input') as UntypedFormArray;
  }

  get signatoryArr() {
    return this.typeForm.get('contract_validator_signatory_status') as UntypedFormArray;
  }

  getSignatoryArray(): UntypedFormArray {
    return this.typeForm.get('contract_validator_signatory_status') as UntypedFormArray;
  }

  getValidatorArray(): UntypedFormArray {
    return this.typeForm.get('step_validator_input') as UntypedFormArray;
  }

  pushSignatory() {
    this.getSignatoryArray().push(this.initSignatoryForm());
  }

  pushValidator() {
    this.getValidatorArray().push(this.initValidatorsForm());
  }

  displayFullName(user): string {
    if (user && user !== 'All') {
      const civility =
        user.civility && user.civility !== 'neutral'
          ? user.civility
            ? this.translate
              ? this.translate.instant(user.civility)
              : user.civility
            : ''
          : '';
      return user.last_name.toUpperCase() + ' ' + user.first_name + ' ' + civility;
    } else if (user === 'All') {
      return this.translate.instant('Any user for selected usertype');
    } else {
      return null;
    }
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

    const validator = this.typeForm.get('step_validator_input').value;
    const signatory = this.typeForm.get('contract_validator_signatory_status').value;

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
      this.typeForm.get('contract_validator_signatory_status').patchValue(contract_validator_signatory_status_input);
      this.typeForm.get('contract_validator_signatory_status').value.forEach((val, index) => {
        if (val?.user_type_id === '5a067bba1c0217218c75f8ab') {
          if (this.studentSignatory) {
            this.studentSignatoryName.patchValue(this.studentSignatory?.name);
          } else {
            if (
              this.data?.students?.length &&
              (!this.data?.isCheckedAll || (this.data?.isCheckedAll && this.data?.students?.length <= 100))
            ) {
              this.data.students.filter((student) => {
                if (student?.user_id?._id) {
                  this.studentsDropdown.push({
                    ...student?.user_id,
                  });
                }
              });
              this.signatoryUserList[index] = this.studentsDropdown;
            } else {
              this.getFilterSignatoryUserIncludeStudent(val?.user_type_id, index);
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

      // *************** handle populate any user selected
      const isConnectAnyUser = this.data?.selected?.filter((data) =>
        data?.adm_doc_validators?.filter((validator) => !validator?.user_validator),
      );
      step_validator_input = step_validator_input.filter((resp) => resp.user_validator || resp.validator);
      if (isConnectAnyUser?.length && this.firstLoad) {
        // *************** handle populate any user selected
        step_validator_input.forEach((resp) => {
          if (!resp.user_validator) {
            resp.user_validator = 'All';
          }
        });
        this.typeForm.get('step_validator_input').patchValue(step_validator_input);
      } else {
        this.typeForm.get('step_validator_input').patchValue(step_validator_input);
      }

      this.typeForm.get('step_validator_input').value.forEach((val, index) => {
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
          this.firstLoad = false;
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
            const findStudent = this.studentsDropdown.filter((student) =>
              this.utilService.simpleDiacriticSensitiveRegex(student?.last_name?.toLowerCase())?.includes(filterUser),
            );
            if (findStudent?.length) {
              this.signatoryUserList[listIndex] = findStudent;
            } else {
              this.getFilterSignatoryUserIncludeStudent(userType, listIndex, filterUser);
            }
          } else {
            setTimeout(() => {
              this.signatoryUserList[listIndex] = this.studentsDropdown;
            }, 600);
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
          if (userType === '5a067bba1c0217218c75f8ab' && this.data?.students?.length) {
            let students = [];
            const temp = _.cloneDeep(resp);
            temp.forEach((student) => {
              const findStudent = this.data.students.find((data) => student._id === data?.user_id?._id);
              if (findStudent) {
                students.push(findStudent);
              }
            });
            this.signatoryUserList[listIndex] = students;
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

  patchValue() {
    if (this.data && this.data.program_ids && this.data.program_ids.length) {
      const payload = this.data;
      this.typeForm.patchValue(payload);
    }
  }

  getFormBuilder() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formBuilderService.getAllFormBuildersByTemplate('one_time_form').subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          this.listFormBuilder = resp;
          if (this.data?.item === 'single') {
            this.populatedData();
          }
        } else {
          this.listFormBuilder = [];
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onValidate() {
    if (this.typeForm.invalid) {
      this.isWaitingForResponse = true;
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      }).then(() => {
        this.isWaitingForResponse = false;
        this.typeForm.markAllAsTouched();
        return;
      });
    } else {
      const tempDataForValidator = this.typeForm.value?.step_validator_input?.map((val) => {
        if (val?.user_validator === 'All') {
          return {
            end_user_type_validator: val?.validator,
            form_builder_step_id: val?.pre_contract_template_step_id,
            validator: val?.validator,
          };
        } else {
          return {
            form_builder_step_id: val?.pre_contract_template_step_id,
            user_validator: val?.user_validator?._id,
            validator: val?.validator,
          };
        }
      });
      const temp = _.cloneDeep(this.data.program_ids);
      const program_ids = [];
      if (temp && temp.length) {
        temp.forEach((element) => {
          program_ids.push(element.toString());
        });
      }
      const templateId = this.typeForm.get('form_builder_id').value;
      const program_input = {
        admission_document_template: templateId !== 'None' ? [templateId] : null,
        adm_doc_validators: tempDataForValidator,
      };

      const filteredValues = this.data?.filter;

      const is_select_all = this.data?.select_all;

      if(templateId === 'None') {
        let timeDisabled = 3;
        Swal.fire({
          title: this.translate.instant('ADM_DOC_S1.TITLE'),
          html: this.translate.instant('ADM_DOC_S1.TEXT'),
          type: 'warning',
          allowEscapeKey: true,
          showCancelButton: true,
          confirmButtonText: this.translate.instant('ADM_DOC_S1.BUTTON 1') + ` (${timeDisabled})`,
          cancelButtonText: this.translate.instant('ADM_DOC_S1.BUTTON 2'),
          allowOutsideClick: false,
          allowEnterKey: false,
          onOpen: () => {
            Swal.disableConfirmButton();
            const confirmBtnRef = Swal.getConfirmButton();
            const intVal = setInterval(() => {
              timeDisabled -= 1;
              confirmBtnRef.innerText = this.translate.instant('ADM_DOC_S1.BUTTON 1') + ` (${timeDisabled})`;
            }, 1000);

            this.timeOutVal = setTimeout(() => {
              confirmBtnRef.innerText = this.translate.instant('ADM_DOC_S1.BUTTON 1');
              Swal.enableConfirmButton();
              clearInterval(intVal);
              clearTimeout(this.timeOutVal);
            }, timeDisabled * 1000);
          },
        }).then((res) => {
          clearTimeout(this.timeOutVal);
          if (res?.value) {
            this.isWaitingForResponse = true;
            this.subs.sink = this.intakeChannelService.updatePrograms(program_ids, program_input, is_select_all, filteredValues).subscribe(
              () => {
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
              },
              (error) => {
                this.isWaitingForResponse = false;
                Swal.fire({
                  type: 'error',
                  title: 'Error',
                  text: error && error['message'] ? error['message'] : error,
                  confirmButtonText: this.translate.instant('OK'),
                });
              },
            );
          }
        });
      } else {
        this.isWaitingForResponse = true;
        this.subs.sink = this.intakeChannelService.updatePrograms(program_ids, program_input, is_select_all, filteredValues).subscribe(
          () => {
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
          },
          (error) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'error',
              title: 'Error',
              text: error && error['message'] ? error['message'] : error,
              confirmButtonText: this.translate.instant('OK'),
            });
          },
        );
      }
    }
  }
}
