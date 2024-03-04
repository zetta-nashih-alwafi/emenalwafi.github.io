import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { UserService } from 'app/service/user/user.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { PermissionService } from 'app/service/permission/permission.service';

@Component({
  selector: 'ms-add-manual-task-dialog',
  templateUrl: './add-manual-task-dialog.component.html',
  styleUrls: ['./add-manual-task-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class AddManualTaskDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  form: UntypedFormGroup;
  userList: any;
  campusList = [];
  isDirectorAdmission: boolean;
  isMemberAdmission: boolean;
  isOperator: boolean;
  currentUser: any;
  listObjective: any;
  school: any[];
  realCampusList: any;
  today: any;
  toggelUsers = new UntypedFormControl(false);
  filteredUser: Observable<any[]>;
  filteredUserType: Observable<any[]>;
  selectedUserId: any;
  isWaitingForResponse;

  internalTaskToggle = false;
  internalChecked;
  isPermission: any;
  currentUserTypeId: any;

  constructor(
    public dialogRef: MatDialogRef<AddManualTaskDialogComponent>,
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public parentData: { taskData: any; type: string },
    private translate: TranslateService,
    private permissionsService: NgxPermissionsService,
    private parseStringDatePipe: ParseStringDatePipe,
    private authService: AuthService,
    private candidateService: CandidatesService,
    private userService: UserService,
    private rncpTitleService: RNCPTitlesService,
    public permissionService: PermissionService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.initializeForm();
    this.getDataForList();
    this.today = new Date();
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.isMemberAdmission = !!this.permissionsService.getPermission('Member Admission');
    this.isOperator = !!this.permissionsService.getPermission('operator_admin')
      ? true
      : !!this.permissionsService.getPermission('operator_dir');
    this.subs.sink = this.toggelUsers.valueChanges.subscribe((res) => {
      this.checkListUsers(res);
    });

    // reset shcool and user field if school changes value
    this.subs.sink = this.form.get('school').valueChanges.subscribe((ress) => {
      this.form.get('users').patchValue(null, { emitEvent: false }); // reset form value
      this.form.get('userTypes').patchValue(null, { emitEvent: false }); // reset form value
      this.userList = []; // clean the user dropdown list
    });

    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) =>{
      this.getAllUsersOperator()
    })
  }

  checkListUsers(res) {
    if (res) {
      this.getAllUsers();
    } else {
      this.getUserSchoolAndCampusSelected();
    }
  }

  getAllUsers() {
    this.userList = [];
    this.subs.sink = this.userService.getUserTypesAddTasks().subscribe(
      (userTypes) => {
        if (userTypes) {
          this.userList = _.cloneDeep(userTypes);
          if (this.parentData.taskData) {
            const user = this.form.get('userTypes').value;
            this.form.get('userTypes').setValue(user);
            // this.displayWithUserTypes(this.form.get('userTypes').value);
          }
          this.filteredUserType = this.form.get('userTypes').valueChanges.pipe(
            startWith(''),
            map((searchTxt) =>
              searchTxt
                ? this.userList.filter((option) =>
                    option && option ? option.name.toLowerCase().includes(searchTxt.toString().toLowerCase()) : '',
                  )
                : this.userList,
            ),
          );
        }
      },
      (err) => {
        // Record error log
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

  getAllUsersOperator() {
    this.userList = [];
    this.subs.sink = this.userService.getAllUserOperator().subscribe(
      (res) => {
        if (res) {
          console.log('user', res);
          this.userList = res.map((ress) => {
            return {
              _id: ress._id,
              name:
                ress.civility !== 'neutral'
                  ? this.translate.instant(ress.civility) + ' ' + ress.last_name + ' ' + ress.first_name
                  : ress.last_name + ' ' + ress.first_name,
            };
          });
          if (this.parentData.taskData) {
            const user = this.form.get('users').value;
            this.form.get('users').setValue(user);
            // this.displayWithUserTypes(this.form.get('userTypes').value);
          }
          this.filteredUser = this.form.get('users').valueChanges.pipe(
            startWith(''),
            map((searchTxt) =>
              searchTxt
                ? this.userList.filter((option) =>
                    option && option ? option.name.toLowerCase().includes(searchTxt.toString().toLowerCase()) : '',
                  )
                : this.userList,
            ),
          );
        }
      },
      (err) => {
        // Record error log
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

  getUserSchoolAndCampusSelected() {
    this.userList = [];
    if (this.form.get('school').value && this.form.get('campus').value) {
      this.subs.sink = this.userService
        .getUserBasedonSchoolandCampuses(this.form.get('school').value, this.form.get('campus').value)
        .subscribe(
          (res) => {
            if (res) {
              const usersList = res.map((resp) => {
                return {
                  _id: resp._id,
                  name:
                    resp.civility !== 'neutral'
                      ? resp.last_name + ' ' + resp.first_name + ' ' + this.translate.instant(resp.civility)
                      : resp.last_name + ' ' + resp.first_name,
                };
              });
              this.userList = _.cloneDeep(usersList);
              if (this.parentData.taskData) {
                const user = this.form.get('users').value;
                this.form.get('users').setValue(user);
                // this.displayWithUsers(this.form.get('users').value);
              }
              this.filteredUser = this.form.get('users').valueChanges.pipe(
                startWith(''),
                map((searchTxt) =>
                  searchTxt
                    ? this.userList.filter((option) =>
                        option && option ? option.name.toLowerCase().includes(searchTxt.toString().toLowerCase()) : '',
                      )
                    : this.userList,
                ),
              );
            }
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
    } else {
      this.userList = [];
    }
  }

  initializeForm() {
    this.form = this.fb.group({
      // internalTask: [this.internalTaskToggle, Validators.required],
      school: [null, Validators.required],
      campus: [null, Validators.required],
      users: [null],
      userTypes: [null],
      priority: ['1', Validators.required],
      due_date: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  selectUser(selected) {
    this.selectedUserId = selected;
  }

  categoryChange(event) {
    if (event.checked) {
      this.form.get('users').patchValue(null);
      this.form.get('users').updateValueAndValidity();
      this.form.get('users').clearValidators();
      this.form.get('users').updateValueAndValidity();
      this.form.get('userTypes').setValidators([Validators.required]);
      this.form.get('userTypes').updateValueAndValidity();
    } else {
      this.form.get('userTypes').patchValue(null);
      this.form.get('userTypes').updateValueAndValidity();
      this.form.get('userTypes').clearValidators();
      this.form.get('userTypes').updateValueAndValidity();
      this.form.get('users').setValidators([Validators.required]);
      this.form.get('users').updateValueAndValidity();
    }
  }

  getDataSchool() {
    this.school = [];
    this.campusList = [];
    this.userList = [];
    this.school = this.listObjective.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0));
  }

  getDataForList() {
    if (this.isDirectorAdmission) {
      const name =
        this.currentUser && this.currentUser.entities && this.currentUser.entities[0] ? this.currentUser.entities[0].candidate_school : '';
      this.subs.sink = this.candidateService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe(
        (resp) => {
          if (resp) {
            this.listObjective = resp;
            this.getDataSchool();
            if (this.parentData.taskData) {
              this.patchvalue();
              const dataEdit = this.parentData.taskData;
              if (dataEdit && dataEdit.type && dataEdit.type === 'internal_task') {
                this.getAllUsersOperator();
              }
            }
          }
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    } else {
      const name = '';
      this.subs.sink = this.candidateService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe(
        (resp) => {
          if (resp) {
            this.listObjective = resp;
            this.getDataSchool();
            if (this.parentData.taskData) {
              this.patchvalue();
              const dataEdit = this.parentData.taskData;
              if (dataEdit && dataEdit.type && dataEdit.type === 'internal_task') {
                this.getAllUsersOperator();
              }
            }
          }
        },
        (err) => {
          // Record error log
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
  }

  getDataPatchCampus() {
    this.campusList = [];
    this.realCampusList = [];
    const school = this.form.get('school').value;
    if (school) {
      const scampusList = this.listObjective.filter((list) => {
        return school.includes(list._id);
      });
      const optionAll = {
        _id: 'ALL',
        name: this.translate.instant('ALL'),
      };
      scampusList.filter((campus, n) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses, nex) => {
            this.campusList.push(campuses);
            this.realCampusList.push(campuses);
          });
        }
      });
      this.campusList = _.uniqBy(this.campusList, '_id').sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
      this.campusList.unshift(optionAll);
    } else {
      this.campusList = [];
    }
  }

  getDataCampus() {
    this.campusList = [];
    this.realCampusList = [];
    this.form.get('campus').setValue(null);
    const school = this.form.get('school').value;
    if (school) {
      const scampusList = this.listObjective.filter((list) => {
        return school.includes(list._id);
      });
      const optionAll = {
        _id: 'ALL',
        name: this.translate.instant('ALL'),
      };
      scampusList.filter((campus, n) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses, nex) => {
            this.campusList.push(campuses);
            this.realCampusList.push(campuses);
          });
        }
      });
      this.campusList = _.uniqBy(this.campusList, '_id').sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
      this.campusList.unshift(optionAll);
    } else {
      this.campusList = [];
    }
  }

  getDataLevel() {
    let sCampus = _.cloneDeep(this.form.get('campus').value);
    sCampus = sCampus.filter((list) => list === 'ALL' || list === 'Tous');
    if (sCampus && sCampus.length && (sCampus[0] === 'ALL' || sCampus[0] === 'Tous')) {
      const dataCampus = [];
      const dataTemp = this.realCampusList.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
      dataTemp.forEach((element) => {
        dataCampus.push(element._id);
      });
      this.form.get('campus').patchValue(dataCampus);
      this.getUserSchoolAndCampusSelected();
    } else {
      this.getUserSchoolAndCampusSelected();
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  submit() {
    if (this.form.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
      this.form.markAllAsTouched();
    } else {
      if (this.parentData.type === 'Add') {
        const payload = this.createPayload();
        this.subs.sink = this.rncpTitleService.createTaskNonSchool(payload).subscribe(
          (resp) => {
            Swal.fire({
              title: this.translate.instant('TASKCREATED.TITLE'),
              html: this.translate.instant('TASKCREATED.TEXT'),
              allowEscapeKey: true,
              type: 'success',
              confirmButtonText: this.translate.instant('TASKCREATED.BUTTON'),
            }).then((res) => {
              this.dialogRef.close(true);
            });
          },
          (err) => {
            // Record error log
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
      if (this.parentData.type === 'Edit') {
        const payload = this.createPayload();
        payload.rncp = this.parentData.taskData.rncp;
        this.subs.sink = this.rncpTitleService.updateTask(payload, this.parentData.taskData._id).subscribe(
          (resp) => {
            Swal.fire({
              title: this.translate.instant('TASKCREATED.TITLE'),
              html: this.translate.instant('TASKCREATED.TEXT'),
              allowEscapeKey: true,
              type: 'success',
              confirmButtonText: this.translate.instant('TASKCREATED.BUTTON'),
            }).then((res) => {
              this.dialogRef.close(true);
            });
          },
          (err) => {
            // Record error log
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
    }
  }

  createPayload() {
    const payload = _.cloneDeep(this.form.value);
    if (!this.toggelUsers.value) {
      payload.user_selection = {
        selection_type: 'user',
        user_id: payload.users,
      };
    } else {
      payload.user_selection = {
        selection_type: 'user_type',
        user_type_id: payload.userTypes,
      };
    }
    // payload.due_date = payload.users = this.selectedUserId;
    payload.priority = Number(payload.priority);
    payload.created_by = this.currentUser._id;
    payload.created_date = {
      date: this.getCurrentUtcDate(),
      time: this.getCurrentUtcTime(),
    };
    payload.due_date = {
      date: moment(payload.due_date).format('DD/MM/YYYY'),
      time: '15:59',
    };

    // delete payload.school;

    if (this.internalTaskToggle) {
      payload.type = 'internal_task';
    }

    payload.campuses = payload.campus;
    delete payload.campus;
    delete payload.users;
    delete payload.userTypes;
    return payload;
  }

  getCurrentUtcDate() {
    return moment.utc().format('DD/MM/YYYY');
  }

  getCurrentUtcTime() {
    return moment.utc().format('HH:mm');
  }

  patchvalue() {
    const dataEdit = _.cloneDeep(this.parentData.taskData);

    if (dataEdit && dataEdit.school) {
      dataEdit.school = dataEdit.school._id;
    }
    if (dataEdit && dataEdit.campuses && dataEdit.campuses.length) {
      dataEdit.campus = dataEdit.campuses.map((resp) => resp._id);
    }
    if (dataEdit && dataEdit.user_selection && dataEdit.user_selection.user_id) {
      dataEdit.users = dataEdit.user_selection.user_id._id;
    }
    if (dataEdit && dataEdit.user_selection && dataEdit.user_selection.user_type_id) {
      this.toggelUsers.setValue(true);
      dataEdit.userTypes = dataEdit.user_selection.user_type_id._id;
    }
    if (dataEdit && dataEdit.type && dataEdit.type === 'internal_task') {
      this.internalChecked = true;
      this.internalTaskToggle = true;
      this.form.get('school').clearValidators();
      this.form.get('school').updateValueAndValidity();
      this.form.get('school').setErrors(null);
      this.form.get('campus').clearValidators();
      this.form.get('campus').updateValueAndValidity();
      this.form.get('campus').setErrors(null);
    }
    dataEdit.due_date = this.parseStringDatePipe.transformStringToDate(dataEdit.due_date.date);
    dataEdit.priority = dataEdit.priority.toString();
    this.form.patchValue(dataEdit);
    this.getDataPatchCampus();
    if (this.toggelUsers.value) {
      this.getAllUsers();
    } else {
      this.getUserSchoolAndCampusSelected();
    }
  }

  intenalTaskToggleChange(event) {
    this.internalTaskToggle = event.checked;
    this.form.get('users').patchValue(null, { emitEvent: false }); // reset form value
    this.userList = []; // clean the user dropdown list
    if (this.internalTaskToggle) {
      // this.getAllUsers();
      this.getAllUsersOperator();
      this.form.get('school').clearValidators();
      this.form.get('school').updateValueAndValidity();
      this.form.get('school').setErrors(null);
      this.form.get('campus').clearValidators();
      this.form.get('campus').updateValueAndValidity();
      this.form.get('campus').setErrors(null);

      // set field null
      this.form.get('campus').patchValue(null, { emitEvent: false }); // reset form value
      this.form.get('school').patchValue(null, { emitEvent: false }); // reset form value
    } else {
      this.form.get('school').setValidators(Validators.required);
      this.form.get('campus').setValidators(Validators.required);
      this.getUserSchoolAndCampusSelected();
    }
  }

  displayWithUsers(value) {
    if (value) {
      const found = this.userList.find((data) => data._id.toLowerCase().trim().includes(value));
      if (found) {
        return found.name;
      } else {
        return value;
      }
    } else {
      return value;
    }
  }

  displayWithUserTypes(value) {
    if (value) {
      const found = this.userList.find((data) => data._id.toLowerCase().trim().includes(value));
      if (found) {
        if (this.toggelUsers.value) {
          return this.translate.instant('USER_TYPES.' + found.name);
        } else {
          return found.name;
        }
      } else {
        return value;
      }
    } else {
      return value;
    }
  }

  setUserValidator(event: MatSlideToggleChange) {
    if (event.checked) {
      this.form.get('users').setErrors(null);
      this.form.get('users').clearValidators();
      this.form.get('users').updateValueAndValidity();
    } else {
      this.form.get('userTypes').setErrors(null);
      this.form.get('userTypes').clearValidators();
      this.form.get('userTypes').updateValueAndValidity();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
