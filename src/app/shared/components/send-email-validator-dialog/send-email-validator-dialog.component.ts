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
import { CandidatesService } from 'app/service/candidates/candidates.service';
import * as moment from 'moment';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { timeout } from 'd3';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-send-email-validator-dialog',
  templateUrl: './send-email-validator-dialog.component.html',
  styleUrls: ['./send-email-validator-dialog.component.scss'],
  providers: [ParseLocalToUtcPipe],
})
export class SendEmailValidatorDialogComponent implements OnInit {
  templateForm: UntypedFormGroup;
  private subs = new SubSink();
  isAllEmpty = true;

  templates = [];
  today = new Date();
  userTypeList = [];
  userList: any;
  validatorUserList = [];
  generalValidatorUserList = [];
  isWaitingForResponse = false;
  isWaitingForFormat = false;
  isValid = true;
  dataAdmissions = [];
  admissionNeedValidator = [];
  admissionNeedValidatorMap = [];
  listEntitiesNonProgram = ['operator', 'company'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<SendEmailValidatorDialogComponent>,
    private contractService: TeacherContractService,
    private candidateService: CandidatesService,
    public translate: TranslateService,
    private utilService: UtilityService,
    private academicService: AcademicKitService,
    private parseLocalToUTCPipe: ParseLocalToUtcPipe,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initForm();
    this.getAllUserType();
    if (this.data && this.data.isNeedValidator) {
      this.getDataAdmission();
    }
    // console.log('this.data', this.data);
  }

  getDataAdmission() {
    if (this.data && this.data.data && this.data.data.length) {
      const candidateIds = this.data.data.map((list) => list._id);
      const filter = {
        candidates_id: candidateIds,
        template_type: 'student_admission',
      };
      this.isWaitingForResponse = true;
      this.subs.sink = this.candidateService.getDataAdmissionProcessForValidator(filter).subscribe(
        (list) => {
          this.isWaitingForResponse = false;
          if (list && list.length) {
            this.dataAdmissions = _.cloneDeep(list);
            this.admissionNeedValidator = [];
            this.getDataAdmissionValidator(list);
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

  getDataAdmissionValidator(list) {
    let updatedList = [];
    // Filtering data from dialog to check from list form process candidate have
    this.data.data.forEach((dataCandidate) => {
      const foundAdmission = list.find(
        (element) => dataCandidate.admission_process_id._id === element._id && dataCandidate._id === element.candidate_id._id,
      );
      if (foundAdmission) {
        updatedList.push(foundAdmission);
      }
    });

    updatedList.forEach((element) => {
      if (element && element.steps && element.steps.length) {
        const steps = element.steps
          .filter((step) => step.is_validation_required)
          .map((lis) => {
            return {
              ...element,
              ...lis,
            };
          });
        if (steps && steps.length) {
          this.admissionNeedValidator = _.concat(this.admissionNeedValidator, steps);
        }
      }
    });

    this.admissionNeedValidator = _.uniqBy(this.admissionNeedValidator, '_id');
    this.admissionNeedValidatorMap = this.admissionNeedValidator.map((valid) => {
      return {
        school_id: valid.candidate_id && valid.candidate_id.school && valid.candidate_id.school._id ? valid.candidate_id.school._id : null,
        campus_id: valid.candidate_id && valid.candidate_id.campus && valid.candidate_id.campus._id ? valid.candidate_id.campus._id : null,
        level_id: valid.candidate_id && valid.candidate_id.level && valid.candidate_id.level._id ? valid.candidate_id.level._id : null,
        civility: valid.candidate_id && valid.candidate_id.civility ? valid.candidate_id.civility : null,
        last_name: valid.candidate_id && valid.candidate_id.last_name ? valid.candidate_id.last_name : null,
        first_name: valid.candidate_id && valid.candidate_id.first_name ? valid.candidate_id.first_name : null,
        step_id: valid._id,
        student_admission_process_step_input: {
          step_title: valid.step_title,
          user_validator: null,
          step_type: valid.step_type,
          validator: valid.validator._id,
          entity_user_type: valid.validator.entity,
        },
      };
    });
    let dataSchool = this.data.data.filter((lists) => lists.school && lists.school._id).map((lists) => lists.school._id);
    let dataCampus = this.data.data.filter((lists) => lists.campus && lists.campus._id).map((lists) => lists.campus._id);
    let dataLevel = this.data.data.filter((lists) => lists.level && lists.level._id).map((lists) => lists.level._id);
    let userTypes = this.admissionNeedValidatorMap
      .filter((lists) => lists.student_admission_process_step_input && lists.student_admission_process_step_input.validator)
      .map((lists) => lists.student_admission_process_step_input.validator);
    dataSchool = _.uniqBy(dataSchool);
    dataCampus = _.uniqBy(dataCampus);
    dataLevel = _.uniqBy(dataLevel);
    userTypes = _.uniqBy(userTypes);
    this.getValidatorUser(userTypes, dataSchool, dataCampus, dataLevel);
  }

  initForm() {
    this.templateForm = this.fb.group({
      registration_email_due_date: this.fb.group({
        due_date: [null, Validators.required],
        due_time: ['15:59'],
      }),
      is_include_flyer: [false],
      input: this.fb.array([]),
    });
  }

  initValidatorsForm() {
    return this.fb.group({
      step_id: [null, [Validators.required]],
      civility: [null],
      last_name: [null],
      first_name: [null],
      student_admission_process_step_input: this.fb.group({
        user_validator: [null],
        step_type: [null],
        step_title: [null],
        validator: [null],
      }),
    });
  }

  pushValidator() {
    this.getValidatorArray().push(this.initValidatorsForm());
  }

  getValidatorArray(): UntypedFormArray {
    return this.templateForm.get('input') as UntypedFormArray;
  }

  get validatorArr() {
    return this.templateForm.get('input') as UntypedFormArray;
  }

  saveResendMail() {
    const candidate = this.getUserId(true);

    this.isWaitingForResponse = true;
    if (this.checkFormValidityDueDate()) {
      this.isWaitingForResponse = false;
      return;
    }

    this.subs.sink = this.candidateService.SendNotifRegistrationN8(this.data.data[0]._id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('CANDIDAT_S10.TITLE'),
          html: this.translate.instant('CANDIDAT_S10.TEXT', {
            candidateName: candidate,
          }),
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('CANDIDAT_S10.BUTTON'),
        }).then(() => {
          this.dialogRef.close(true);
        });
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
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
        // console.log(err);
      },
    );
  }

  saveCandidateDate(from?) {
    const usersId = this.getUserId();

    this.isWaitingForResponse = true;
    if (this.checkFormValidityDueDate()) {
      this.isWaitingForResponse = false;
      return;
    }

    const currentTime = moment(this.today).format('HH:mm');
    let dueDate = this.templateForm.get('registration_email_due_date').get('due_date').value;
    dueDate = moment(dueDate).format('DD/MM/YYYY');
    const payload = {
      registration_email_due_date: {
        due_date: this.parseLocalToUTCPipe.transformDate(dueDate, currentTime),
        due_time: this.parseLocalToUTCPipe.transform(currentTime),
      },
    };

    this.subs.sink = this.candidateService.UpdateManyCandidates(usersId, payload).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          if (from) {
            if (this.data?.isResendNewForm) {
              this.triggerResendNewForm();
            } else if (!this.data?.isResendNewForm) {
              this.saveResendMail();
            }
          } else if (this.data.isReadmission) {
            this.triggerReadmission();
          } else {
            this.triggerAnnoucment();
          }
        } else {
          if (from) {
            if (this.data?.isResendNewForm) {
              this.triggerResendNewForm();
            } else if (!this.data?.isResendNewForm) {
              this.saveResendMail();
            }
          } else if (this.data.isReadmission) {
            this.triggerReadmission();
          } else {
            this.triggerAnnoucment();
          }
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
    this.subs.sink = this.academicService.getAllUserTypes().subscribe(
      (res) => {
        if (res) {
          this.userTypeList = res;
        }
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

  getFilterValidatorUser(userType, listIndex, name?) {
    this.subs.sink = this.contractService.GetAllUsers(userType, name).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.validatorUserList[listIndex] = resp;
        } else {
          this.validatorUserList[listIndex] = [];
        }
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

  getValidatorUser(userType, candidate_schools, candidate_campuses, candidate_levels) {
    this.isWaitingForFormat = true;

    // if userType is operator, we need to only pass the userType as filter and remove the rest
    // because if validator is operator, passing school campus and level will result in not getting the operators
    // operators do not belong in any school campus level
    const argument: [string[], string[]?, string[]?, string[]?] =
      userType[0] === '5fe98eeadb866c403defdc6b' ? [userType] : [userType, candidate_schools, candidate_campuses, candidate_levels];

    this.subs.sink = this.contractService.GetAllUserValidators(...argument).subscribe(
      (resp) => {
        this.isWaitingForFormat = false;
        if (resp && resp.length) {
          this.generalValidatorUserList = resp;
          const control = this.templateForm.get('input').value;
          const temp = _.cloneDeep(control);
          for (let i = temp.length - 1; i >= 0; i--) {
            this.validatorArr.removeAt(i);
          }
          this.admissionNeedValidatorMap.forEach((val, ii) => {
            let dataUser = [];
            this.pushValidator();
            if (val && val.student_admission_process_step_input) {
              if (
                val.student_admission_process_step_input.entity_user_type &&
                this.listEntitiesNonProgram.includes(val.student_admission_process_step_input.entity_user_type)
              ) {
                dataUser = resp.filter((re) => {
                  if (re.entities && re.entities.length) {
                    const userL = re.entities.filter(
                      (ent) =>
                        ent.entity_name === val.student_admission_process_step_input.entity_user_type &&
                        ent.type._id === val.student_admission_process_step_input.validator,
                    );
                    if (userL && userL.length) {
                      return re;
                    }
                  }
                });
              } else {
                dataUser = resp.filter((re) => {
                  if (re.entities && re.entities.length) {
                    const userL = re.entities.filter(
                      (ent) =>
                        ent.type._id === val.student_admission_process_step_input.validator &&
                        val.campus_id &&
                        ent.programs &&
                        ent.programs.length &&
                        ent.programs.map((list) => list.campus._id).includes(val.campus_id) &&
                        val.level_id &&
                        ent.programs.map((list) => list.level._id).includes(val.level_id) &&
                        val.school_id &&
                        ent.programs.map((list) => list.school._id).includes(val.school_id),
                    );
                    if (userL && userL.length) {
                      return re;
                    }
                  }
                });
              }
            }
            this.validatorUserList[ii] = dataUser;
          });
          // console.log('this.admissionNeedValidatorMap', resp, this.admissionNeedValidatorMap);
          // console.log('this.validatorUserList', this.validatorUserList);
          this.templateForm.get('input').patchValue(this.admissionNeedValidatorMap);
          // console.log(this.templateForm.controls);
          // console.log(this.templateForm.value);
          setTimeout(() => {}, 500);
        } else {
          this.generalValidatorUserList = [];
          this.admissionNeedValidatorMap.forEach((val, ii) => {
            this.pushValidator();
          });
          this.templateForm.get('input').patchValue(this.admissionNeedValidatorMap);
          // console.log('this.admissionNeedValidatorMap', this.admissionNeedValidatorMap);
          // console.log('this.templateForm', this.templateForm.get('input').value);
        }
      },
      (err) => {
        this.generalValidatorUserList = [];
        this.admissionNeedValidatorMap.forEach((val, ii) => {
          this.pushValidator();
        });
        this.templateForm.get('input').patchValue(this.admissionNeedValidatorMap);
        this.isWaitingForFormat = false;
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

  filterValidatorUser(value, listIndex, userType) {
    // console.log(value.length > 2, value.length === 0);
    if (value.length > 2 || value.length === 0) {
      const filterUser = this.utilService.simpleDiacriticSensitiveRegex(value.toLowerCase());
      this.getFilterValidatorUser(userType, listIndex, filterUser);
    }
  }

  getNameOfUserType(formCtrl, type) {
    let userType;
    const form = formCtrl.value;
    if (this.userTypeList && this.userTypeList.length) {
      userType = this.userTypeList.find((resp) => resp._id === form.student_admission_process_step_input.validator);
    }
    return userType ? userType.name : '';
  }

  checkFormValidity(): boolean {
    // console.log(this.templateForm.value);
    // console.log(this.templateForm.invalid);
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

  checkFormValidityDueDate(): boolean {
    if (this.templateForm.get('registration_email_due_date').invalid) {
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
  checkRequired(index){
    return this.getValidatorArray()?.at(index)?.get('student_admission_process_step_input')?.get('user_validator')?.dirty || this.getValidatorArray()?.at(index)?.get('student_admission_process_step_input')?.get('user_validator')?.touched
  }

  onSubmit() {
    this.isWaitingForResponse = true;
    // console.log(this.data.isReadmission);
    // console.log(this.templateForm.value);
    if (!this.checkIsNeedValidator() && !this.checkIsResendMail() && !this.data.isReadmission) {
      this.saveCandidateDate();
    } else if (this.checkIsResendMail()) {
      this.saveCandidateDate(true);
    } else if (this.data.isReadmission) {
      // console.log('readmission', this.data.data);
      if (this.checkFormValidity()) {
        this.isWaitingForResponse = false;
        return;
      } else {
        this.isWaitingForResponse = true;
        if (!this.checkIsNeedValidator() && !this.checkIsResendMail()) {
          this.saveCandidateDate();
        } else {
          if (this.checkFormValidity()) {
            this.isWaitingForResponse = false;
            return;
          }
          let payload = this.templateForm.value;
          payload = payload.input.map((list) => {
            return {
              step_id: list.step_id,
              student_admission_process_step_input: {
                step_title: list.student_admission_process_step_input.step_title,
                user_validator:
                  list.student_admission_process_step_input &&
                  list.student_admission_process_step_input.user_validator &&
                  list.student_admission_process_step_input.user_validator._id
                    ? list.student_admission_process_step_input.user_validator._id
                    : this.triggerSwal(),
                step_type: list.student_admission_process_step_input.step_type,
                validator: list.student_admission_process_step_input.validator,
              },
            };
          });
          if (!this.isValid) {
            this.isValid = true;
            return;
          }
          this.isWaitingForResponse = true;
          // console.log('payload', payload);
          this.subs.sink = this.candidateService.UpdateManyStudentAdmissionProcessStep(payload).subscribe(
            (resp) => {
              this.saveCandidateDate();
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
                  type: 'info',
                  title: this.translate.instant('SORRY'),
                  text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                  confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                }).then(() => {
                  this.dialogRef.close();
                });
              }
            },
          );
        }
      }
    } else {
      if (this.checkFormValidity()) {
        this.isWaitingForResponse = false;
        return;
      }
      let payload = this.templateForm.value;
      payload = payload.input.map((list) => {
        return {
          step_id: list.step_id,
          student_admission_process_step_input: {
            step_title: list.student_admission_process_step_input.step_title,
            user_validator:
              list.student_admission_process_step_input &&
              list.student_admission_process_step_input.user_validator &&
              list.student_admission_process_step_input.user_validator._id
                ? list.student_admission_process_step_input.user_validator._id
                : this.triggerSwal(),
            step_type: list.student_admission_process_step_input.step_type,
            validator: list.student_admission_process_step_input.validator,
          },
        };
      });
      if (!this.isValid) {
        this.isValid = true;
        return;
      }
      this.isWaitingForResponse = true;
      // console.log('payload', payload);
      this.subs.sink = this.candidateService.UpdateManyStudentAdmissionProcessStep(payload).subscribe(
        (resp) => {
          this.saveCandidateDate();
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
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            }).then(() => {
              this.dialogRef.close();
            });
          }
        },
      );
    }
  }

  triggerReadmission() {
    this.isWaitingForResponse = true;
    const candidateIds = this.data.data.map((list) => list._id);
    const isSendFlyer = this.templateForm.get('is_include_flyer').value;
    this.subs.sink = this.candidateService.SendReadRegN1(candidateIds, isSendFlyer).subscribe(
      (list) => {
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
      (err) => {
        this.isWaitingForResponse = false;
        // console.log('Error :', err);
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
          }).then(() => {
            this.dialogRef.close(true);
          });
        }
      },
    );
  }

  triggerResendNewForm() {
    this.isWaitingForResponse = true;
    const candidateIds = this.data.data.map((list) => list._id);
    this.subs.sink = this.candidateService.SendNotifRegistrationN8ResendNewForm(candidateIds[0], true).subscribe(
      (list) => {
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
      (err) => {
        this.isWaitingForResponse = false;
        // console.log('Error :', err);
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
          }).then(() => {
            this.dialogRef.close(true);
          });
        }
      },
    );
  }

  triggerAnnoucment() {
    const candidatess = this.getUserId(true);
    const usersId = this.getUserId();
    this.isWaitingForResponse = true;
    this.subs.sink = this.candidateService.SendRegistrationN1WithFlyer(usersId, this.templateForm.get('is_include_flyer').value).subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('CANDIDAT_S2.TITLE'),
            html: this.translate.instant('CANDIDAT_S2.TEXT', {
              candidateName: candidatess,
            }),
            allowOutsideClick: false,
            confirmButtonText: this.translate.instant('CANDIDAT_S2.BUTTON'),
          }).then(() => {
            this.dialogRef.close(true);
          });
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
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  displayFullName(user): string {
    // console.log(user);
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

  checkIsNeedValidator() {
    let showValidatorForm = false;
    if (this.data && this.data.isNeedValidator) {
      showValidatorForm = true;
    }
    return showValidatorForm;
  }

  checkIsResendMail() {
    let isResendMail = false;
    if (this.data && this.data.isResendMail) {
      isResendMail = true;
    }
    return isResendMail;
  }

  getUserId(candidates?) {
    let candidatess = '';
    const usersId = [];
    // console.log(this.data.data);
    for (const entity of this.data.data) {
      candidatess = candidatess
        ? candidatess +
          ', ' +
          (entity
            ? (entity.civility !== 'neutral' ? this.translate.instant(entity.civility) + ' ' : '') +
              entity.first_name +
              ' ' +
              entity.last_name
            : '')
        : entity
        ? (entity.civility !== 'neutral' ? this.translate.instant(entity.civility) + ' ' : '') + entity.first_name + ' ' + entity.last_name
        : '';
      usersId.push(entity._id);
    }

    if (candidates) {
      return candidatess;
    } else {
      return usersId;
    }
  }
}
