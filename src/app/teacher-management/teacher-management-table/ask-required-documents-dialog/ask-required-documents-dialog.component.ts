import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep } from 'lodash';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { TeacherManagementService } from 'app/service/teacher-management/teacher-management.service';
import { UsersService } from 'app/service/users/users.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
  selector: 'ms-ask-required-documents-dialog',
  templateUrl: './ask-required-documents-dialog.component.html',
  styleUrls: ['./ask-required-documents-dialog.component.scss']
})
export class AskRequiredDocumentsDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink()
  formRequiredDocument: UntypedFormGroup;

  usersValidator = [];

  isWaitingForResponse: boolean = false;

  currentUser: any;
  isPermission: any;
  currentUserTypeId: any;

  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AskRequiredDocumentsDialogComponent>,
    public translate: TranslateService,
    private utilService: UtilityService,
    private authService: AuthService,
    private teacherManagementServive: TeacherManagementService,
    private usersService: UsersService,
    @Inject(MAT_DIALOG_DATA) public parentData: any,
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    this.initForm();
    this.getAllUsers();
  }

  initForm() {
    this.formRequiredDocument = this.fb.group({
      contract_type: [null, Validators.required],
      user_validator: [null, Validators.required],
    });
  }

  populateUserToForm() {
    const userList = cloneDeep(this.usersValidator);
    const currentUserId = this.currentUser._id;
    if(userList) {
      const foundUser = userList?.filter((user) => user?._id === currentUserId);
      if(foundUser?.length) {
        this.formRequiredDocument?.get('user_validator')?.patchValue(foundUser[0]?._id);
      };
    }
  }

  getAllUsers() {
    this.isWaitingForResponse = true;
    this.usersValidator = [];
    const validatorUserTypes = ["6209f2dc74890f0ecad16670"];
    this.subs.sink = this.usersService.getAllUserForTeacherManagement(validatorUserTypes).subscribe(
      (resp) => {
        const users = _.cloneDeep(resp);
        users?.map((user) => {
          user.full_name = user?.last_name.toUpperCase() + ' ' + user?.first_name + ' ' + this.translate?.instant(user?.civility);
          return user;
        });

        this.usersValidator = users;
        if(this.usersValidator?.length) {
          this.populateUserToForm();
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.usersValidator = [];
        this.isWaitingForResponse = false;
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.authService.handlerSessionExpired();
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

  userValidatorSelect() {

  }

  validateDocument() {
    if(this.formRequiredDocument?.invalid) {
      this.isWaitingForResponse = false;
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then(() => {
        this.formRequiredDocument.markAllAsTouched();
        return;
      })
    } else {
      const payload = this.createPayload();
      this.isWaitingForResponse = true;
      this.subs.sink = this.teacherManagementServive.askRequiredDocumentsForTeachers(payload).subscribe(
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
              this.dialogRef.close(true);
            });
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err);
          if(err && err['message'] && err['message']?.includes('Teacher already get the notification')){
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('AskRequiredDocument_S1.TITLE'),
              text: this.translate.instant('AskRequiredDocument_S1.TEXT'),
              confirmButtonText: this.translate.instant('AskRequiredDocument_S1.BUTTON')
            }).then(() => {
              this.dialogRef.close(true);
            });
          } else if (err && err['message'] && err['message']?.includes('At least one of the Teacher selected already receive the notification to complete the required document')){
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('AskRequiredDocument_S2.TITLE'),
              text: this.translate.instant('AskRequiredDocument_S2.TEXT'),
              confirmButtonText: this.translate.instant('AskRequiredDocument_S2.BUTTON')
            }).then(() => {
              this.dialogRef.close(true);
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

  cleanFilterData(data) {
    const filterData = cloneDeep(data);
    Object.keys(filterData).forEach((key) => {
      if (!filterData[key] && filterData[key] !== false || filterData[key] === 'All' || !filterData[key].length) {
        delete filterData[key];
      }
    });
    return filterData;
  }

  createPayload() {
    const payload = this.formRequiredDocument.getRawValue();
    payload.selected_teacher_ids = this.parentData?.dataSelected ? this.parentData?.dataSelected?.map(teacher => teacher?._id) : [this.parentData?.teacher_id];
    payload.filter = this.parentData?.filter ? this.cleanFilterData(this.parentData?.filter) : null;
    payload.sorting = this.parentData?.sorting ?  this.parentData?.sorting : null;
    payload.user_type_sender_id = this.currentUserTypeId ? this.currentUserTypeId : null;
    return payload;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
