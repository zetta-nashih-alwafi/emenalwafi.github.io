import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TaskService } from 'app/service/task/task.service';
import * as _ from 'lodash';
import swal from 'sweetalert2';
import Swal from 'sweetalert2';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-assign-corrector-dialog',
  templateUrl: './assign-corrector-dialog.component.html',
  styleUrls: ['./assign-corrector-dialog.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class AssignCorrectorDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  assignCorrrectorForm: UntypedFormGroup;

  testData;
  currentUser: any;
  studentCount;
  noUsers = false;
  backupTestData;
  specializationId: string;
  blockConditionId: string;

  userTypes = [];
  userCorrectorList = [];

  correctorAssigned = [];

  isGroupTest = false;

  isWaitingForResponse = false;
  isWaitingForUserList = true;

  constructor(
    public dialogRef: MatDialogRef<AssignCorrectorDialogComponent>,
    private fb: UntypedFormBuilder,
    private taskService: TaskService,
    private parseUTCtoLocal: ParseUtcToLocalPipe,
    private translate: TranslateService,
    private autService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.currentUser = this.autService.getLocalStorageUser();
    this.initForm();
    this.getUserTypesId();
    if (this.data && this.data.task && this.data.task.test && this.data.task.test._id) {
      this.getTestData(this.data.task.test._id);
    }
    if (this.data && this.data.edit) {
      this.editData();
    }
    console.log('Assign corrector dialog data: ', this.data);
  }

  initForm() {
    this.assignCorrrectorForm = this.fb.group({
      test_id: [this.data.task.test && this.data.task.test._id ? this.data.task.test._id : '', Validators.required],
      school_id: [this.data.task.school && this.data.task.school._id ? this.data.task.school._id : '', Validators.required],
      update_corrector: [false, Validators.required],
      correctors_id: ['', Validators.required],
    });
  }

  editData() {
    this.assignCorrrectorForm.get('update_corrector').patchValue(true);
  }

  getUserTypesId() {
    this.userTypes = this.taskService.getUserTypesCorrectorsID();
  }

  getTestData(testId) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.taskService.getTestDetail(testId).subscribe((resp) => {
      this.isWaitingForResponse = false;
      if (resp) {
        // set test and backup test data
        this.testData = resp;
        this.backupTestData = _.cloneDeep(resp);

        // get the corrector list
        if (resp && resp.correction_type) {
          this.getCorrectorUsers(
            resp.correction_type,
            this.data.titleId,
            this.data.task.school && this.data.task.school._id ? this.data.task.school._id : '',
          );
        }

        // check if group test
        if (resp && resp.group_test) {
          this.isGroupTest = true;
        } else {
          this.isGroupTest = false;
        }

        // get block id for test evaluation expertise
        if (
          this.testData &&
          this.testData.block_of_competence_condition_id &&
          this.testData.block_of_competence_condition_id._id &&
          this.testData.class_id &&
          this.testData.class_id.type_evaluation === 'expertise'
        ) {
          this.blockConditionId = this.testData.block_of_competence_condition_id._id;
        }

        // get specialization id if block is specialization
        if (
          resp &&
          resp.block_of_competence_condition_id &&
          resp.block_of_competence_condition_id.specialization &&
          resp.block_of_competence_condition_id.specialization._id
        ) {
          this.specializationId = resp.block_of_competence_condition_id.specialization._id;
        }

        // Filter assigned corrector based on school
        if (this.backupTestData && this.backupTestData.corrector_assigned && this.backupTestData.corrector_assigned.length) {
          this.backupTestData.corrector_assigned = _.filter(
            this.backupTestData.corrector_assigned,
            (corrector) =>
              (corrector && corrector.school_id && corrector.school_id._id ? corrector.school_id._id : '') === this.data.task.school._id,
          );
        }
      }
      if (this.data.task && this.data.task.type === 'retake_assign_corrector') {
        // if task is assign retake student
        this.getRetakeStudentCount(this.data.titleId, this.data.task.school._id, this.data.task.class_id._id);
      } else {
        // if task is normal assign student
        this.getStudentCount(this.data.titleId, this.data.task.school._id, this.data.task.class_id._id);
      }
    }, (err) => {
      this.isWaitingForResponse = false
      this.autService.postErrorLog(err);
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  getStudentCount(titleId, schoolId, classId) {
    if (this.isGroupTest) {
      this.subs.sink = this.taskService.getTestGroups(this.data.task.test._id, schoolId).subscribe((resp) => {
        if (resp && resp.length) {
          this.studentCount = resp.length;
        } else {
          this.studentCount = 0;
        }
        this.filterCorrector(this.assignCorrrectorForm.get('correctors_id').value);
      }, (err) => {
        this.autService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      });
    } else {
      this.subs.sink = this.taskService
        .getStudentCount(titleId, schoolId, classId, this.specializationId, this.blockConditionId)
        .subscribe((resp) => {
          if (resp && resp.length) {
            console.log(resp);
            this.studentCount = resp[0].count_document;
          } else {
            this.studentCount = 0;
          }
          this.filterCorrector(this.assignCorrrectorForm.get('correctors_id').value);
        }, (err) => {
          this.autService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        });
    }
  }

  getRetakeStudentCount(titleId, schoolId, classId) {
    if (this.isGroupTest) {
      this.subs.sink = this.taskService.getTestGroups(this.data.task.test._id, schoolId).subscribe((resp) => {
        console.log(resp);
        if (resp && resp.length) {
          this.studentCount = resp.length;
        } else {
          this.studentCount = 0;
        }
      }, (err) => {
        this.autService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      });
    } else {
      this.subs.sink = this.taskService
        .getRetakeStudentCount(
          titleId,
          schoolId,
          classId,
          this.specializationId,
          this.blockConditionId,
          this.data.task.test._id,
          this.data.task.test.evaluation_id._id,
        )
        .subscribe((resp) => {
          if (resp && resp.length) {
            this.studentCount = resp[0].count_document;
          } else {
            this.studentCount = 0;
          }
        }, (err) => {
          this.autService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        });
    }
  }

  getCorrectorUsers(type, titleId, schoolId) {
    let selectedUserTypeId = '';
    if (type) {
      if (type === 'prep_center') {
        const data = _.find(this.userTypes, (userType) => userType.name === 'Corrector');
        if (data._id) {
          selectedUserTypeId = data._id;
        }
      } else if (type === 'certifier') {
        const data = _.find(this.userTypes, (userType) => userType.name === 'Corrector Certifier');
        if (data._id) {
          selectedUserTypeId = data._id;
        }
      } else if (type === 'operator') {
        const data = _.find(this.userTypes, (userType) => userType.name === 'operator_admin');
        if (data._id) {
          selectedUserTypeId = data._id;
        }
      } else if (type === 'cross_correction') {
        const data = _.find(this.userTypes, (userType) => userType.name === 'Corrector Certifier');
        if (data._id) {
          selectedUserTypeId = data._id;
        }
      }
    }

    if (selectedUserTypeId) {
      // ************ for corrector type: certifier
      if (type === 'certifier') {
        this.isWaitingForUserList = true;
        this.subs.sink = this.taskService.getCorrectorCertifierUsers([titleId], [selectedUserTypeId]).subscribe((resp) => {
          this.isWaitingForUserList = false;
          this.setUserCorrectorList(resp);
        }, (err) => {
          this.isWaitingForUserList = false
          this.autService.postErrorLog(err)
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        });
      } else {
        this.isWaitingForUserList = true;
        this.subs.sink = this.taskService.getCorrectorUsers([titleId], [schoolId], [selectedUserTypeId]).subscribe((resp) => {
          this.isWaitingForUserList = false;
          this.setUserCorrectorList(resp);
        }, (err) => {
          this.isWaitingForUserList = false
          this.autService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        });
      }
    }
  }

  setUserCorrectorList(correctors) {
    if (correctors) {
      this.userCorrectorList = correctors;
      if (this.data && this.data.edit && this.backupTestData.corrector_assigned && this.backupTestData.corrector_assigned.length) {
        const tempCorrector = [];
        this.backupTestData.corrector_assigned.forEach((corrector) => {
          if (corrector.corrector_id && corrector.corrector_id._id) {
            tempCorrector.push(corrector.corrector_id._id);
          }
        });
        this.assignCorrrectorForm.get('correctors_id').patchValue(tempCorrector);
        if (this.studentCount) {
          this.filterCorrector(this.assignCorrrectorForm.get('correctors_id').value);
        }
      }
    } else {
      this.userCorrectorList = [];
    }
  }

  selectCorrectors(data: MatSelectChange) {
    this.correctorAssigned = [];
    const selectedCorrector = data.value;
    this.filterCorrector(selectedCorrector);
  }

  filterCorrector(data) {
    console.log(data);
    if (data) {
      const selectedCorrector = data;
      const studentPerCorrector = Math.ceil(this.studentCount / selectedCorrector.length);
      let currentStudent = this.studentCount;

      selectedCorrector.forEach((correctorId) => {
        const correctorFound = _.find(this.userCorrectorList, (corrector) => corrector._id === correctorId);
        console.log(correctorFound);
        this.correctorAssigned.push({
          corrector: correctorFound,
          student: studentPerCorrector <= currentStudent ? studentPerCorrector : currentStudent,
        });
        console.log(studentPerCorrector, currentStudent);
        currentStudent -= studentPerCorrector <= currentStudent ? studentPerCorrector : currentStudent;
      });
      console.log(this.correctorAssigned);
    }
  }

  getTranslatedDate(dateRaw) {
    if (dateRaw && dateRaw.date_utc && dateRaw.time_utc) {
      return this.parseUTCtoLocal.transformDateToStringFormat(dateRaw.date_utc, dateRaw.time_utc);
    } else {
      return '';
    }
  }

  getTranslatedTextOneCorrector() {
    const user = this.assignCorrrectorForm.get('correctors_id').value;
    const userId = user[0];
    const userData = _.find(this.userCorrectorList, (corrector) => corrector._id === userId);
    console.log(this.assignCorrrectorForm);
    console.log(this.userCorrectorList);
    console.log(userData);

    const translatedCivility =
      userData && userData.civility && userData.civility !== 'neutral' ? this.translate.instant(userData.civility) : '';
    let assignedText = '';
    if (this.currentUser._id === userId) {
      assignedText = this.translate.instant(`ASSIGN_CORRECTOR_DIALOG.ASSIGN_MYSELF`);
    } else if (userData) {
      assignedText = this.translate.instant(`ASSIGN_CORRECTOR_DIALOG.SCHOOL_1_CORRECTOR`, {
        civility: translatedCivility,
        firstname: userData.first_name,
        lastname: userData.last_name,
      });
    }
    return assignedText;
  }

  submitAssignCorrector() {
    if (this.data.task && this.data.task.type === 'retake_assign_corrector') {
      // for retake assign corrector
      this.saveAssignedCorrectorForRetake();
    } else {
      // for normal assign corrector
      this.saveAssignedCorrector();
    }
  }

  saveAssignedCorrector() {
    const result = this.assignCorrrectorForm.value;
    this.isWaitingForResponse = true;
    this.subs.sink = this.taskService
      .assignCorrector(result.test_id, result.school_id, result.correctors_id, result.update_corrector)
      .subscribe((resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          // Mark task as done and start the next task
          this.isWaitingForResponse = true;
          this.subs.sink = this.taskService
            .startNextTask(this.data.task._id, result.correctors_id, result.update_corrector, this.translate.currentLang)
            .subscribe(
              (response) => {
                this.isWaitingForResponse = false;
                if (response) {
                  swal
                    .fire({
                      type: 'success',
                      title: 'Bravo !',
                      allowOutsideClick: false,
                    })
                    .then(() => {
                      this.dialogRef.close('reset');
                    });
                }
              },
              (err) => {
                this.isWaitingForResponse = false;
                this.autService.postErrorLog(err);
                this.swalError(err);
              },
            );
          // if (this.isGroupTest && result.update_corrector) {
          //   this.subs.sink = this.taskService
          //   .startNextTaskForGroup(this.data.task._id, result.correctors_id, result.update_corrector, this.translate.currentLang)
          //   .subscribe((response) => {
          //     this.isWaitingForResponse = false;
          //     if (response) {
          //       swal
          //         .fire({
          //           type: 'success',
          //           title: 'Bravo !',
          //           allowOutsideClick: false,
          //         })
          //         .then(() => {
          //           this.dialogRef.close('reset');
          //         });
          //     }
          //   } , (err) => {
          //     this.isWaitingForResponse = false;
          //     this.swalError(err);
          //   });
          // } else {

          // }
        }
      }, (err) => {
        this.isWaitingForResponse = false
        this.autService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      });
  }

  saveAssignedCorrectorForRetake() {
    const result = this.assignCorrrectorForm.value;
    this.isWaitingForResponse = true;
    this.subs.sink = this.taskService
      .assignCorrectorForRetake(result.test_id, result.school_id, result.correctors_id, result.update_corrector, this.data.task._id)
      .subscribe((resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          swal
            .fire({
              type: 'success',
              title: 'Bravo !',
              allowOutsideClick: false,
            })
            .then(() => {
              this.dialogRef.close('reset');
            });
        }
      }, (err) => {
        this.autService.postErrorLog(err)
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      });
  }

  isCorrectorMoreThanStudent() {
    const correctorCount = this.assignCorrrectorForm.get('correctors_id').value
      ? this.assignCorrrectorForm.get('correctors_id').value.length
      : 0;
    const studentcount = this.studentCount;
    if (correctorCount > studentcount) {
      return true;
    } else {
      return false;
    }
  }

  swalError(err) {
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
