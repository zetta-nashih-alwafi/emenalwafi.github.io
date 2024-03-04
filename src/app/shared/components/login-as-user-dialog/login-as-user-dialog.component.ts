import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UserTableData } from 'app/users/user.model';
import * as _ from 'lodash';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { UtilityService } from 'app/service/utility/utility.service';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UserService } from 'app/service/user/user.service';
import { SubSink } from 'subsink';
import { UsersService } from 'app/service/users/users.service';

@Component({
  selector: 'ms-login-as-user-dialog',
  templateUrl: './login-as-user-dialog.component.html',
  styleUrls: ['./login-as-user-dialog.component.scss'],
})
export class LoginAsUserDialogComponent implements OnInit, OnDestroy {
  loginAsUserForm: UntypedFormGroup;
  private subs = new SubSink();
  entities: string[] = [];
  userTypes: string[] = [];
  isWaitingForResponse = false;

  // *************** Variable to bind entity, school type, and school, we do not use formgroup for this
  // selectedEntityName = '';
  // selectedSchoolType = '';
  // selectedSchoolId = '';
  userData: any;
  userTypeSelected: any;
  userDataEntity: any;
  entitiesData = [];
  schoolTypes = [];
  schools = [];
  userTypeList = [];
  entityAdmtc = ['ADMTC Director', 'ADMTC Admin', 'ADMTC Staff', 'ADMTC Sales'];
  entityAcademic = [
    'Academic Director',
    'Academic Admin',
    'Animator Business Game',
    'Corrector',
    'Cross Corrector',
    'PC School Director',
    'Teacher',
    'Professional Jury Member',
    'Jury Member',
    'CR School Director',
    'Corrector Certifier',
    'Corrector Quality',
    'President of Jury',
  ];
  entityPC = [
    'Academic Director',
    'Academic Admin',
    'Animator Business Game',
    'Corrector',
    'Cross Corrector',
    'PC School Director',
    'Teacher',
    'Professional Jury Member',
    'Jury Member',
  ];
  entityCertifier = ['CR School Director', 'Corrector Certifier', 'Corrector Quality', 'President of Jury'];
  entityCompany = ['Mentor', 'HR'];
  entityFinancial = ['Financial Member'];
  entityUnix: any;
  userTypeUnix: any;
  constructor(
    public dialogRef: MatDialogRef<LoginAsUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public parentData: UserTableData,
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    private ngxPermissionService: NgxPermissionsService,
    private utilService: UtilityService,
    private translate: TranslateService,
    private router: Router,
    private userService: UserService,
    private usersService: UsersService,
  ) {}

  ngOnInit() {
    this.userTypeUnix = _.uniqBy(this.parentData.entities, 'type.name');
    this.entityUnix = _.uniqBy(this.parentData.entities, 'entity_name');
    this.initForm();
    this.getUserData();
    console.log('ini data dari parent', this.parentData, this.userTypeUnix, this.entityUnix);
  }

  initForm() {
    this.loginAsUserForm = this.fb.group({
      entity: [null, Validators.required],
      schoolType: [null],
      school: [null],
      user_type: [null],
    });
  }

  getUserData() {
    if (this.parentData && this.parentData._id) {
      this.subs.sink = this.usersService.getOneUserForLoginAs(this.parentData._id).subscribe(
        (resp) => {
          console.log(resp);
          this.userData = _.cloneDeep(resp);
          this.entitiesData = this.userData.entities;
          if (this.entityUnix && this.entityUnix.length < 2) {
            this.entities.push(this.entityUnix[0].entity_name);
            this.loginAsUserForm.get('entity').patchValue(this.entityUnix[0].entity_name);
            this.getSchoolTypesDropdown({ value: this.entityUnix[0].entity_name, source: null });
          } else {
            this.getEntitiesDropdown(this.userData);
          }
          this.getUserTypeDropdown();
        },
        (err) => {
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

  getEntitiesDropdown(userData) {
    this.schoolTypes = [];
    this.schools = [];
    this.userTypeList = [];
    console.log('user data ', userData);
    if (userData && userData.entities && userData.entities.length) {
      userData.entities.forEach((entity) => {
        if (entity.entity_name) {
          this.entities.push(entity.entity_name);
        }
      });
      this.entities = _.uniq(this.entities);
      if (this.entities && this.entities.length === 1) {
        this.loginAsUserForm.get('entity').patchValue(this.entities[0]);
        this.getSchoolTypesDropdown({ value: this.entities[0], source: null });
      }
      this.getUserTypeDropdown();
    }
  }

  getSchoolTypesDropdown(event: MatSelectChange) {
    this.schoolTypes = [];
    this.schools = [];
    this.userTypeList = [];
    this.loginAsUserForm.get('schoolType').patchValue(null, { emitEvent: false });
    const entityName = event.value;
    console.log('this.getSchoolTypesDropdown', entityName);
    // const selectedEntityName = this.loginAsUserForm.get('entity').value;
    if (entityName === 'academic') {
      this.userData.entities.forEach((entity) => {
        if (entity.entity_name === entityName) {
          if (entity.school_type && entity.school_type) {
            this.schoolTypes.push(entity.school_type);
          }
        }
      });
      this.schoolTypes = _.uniq(this.schoolTypes);
      if (this.schoolTypes && this.schoolTypes.length === 1) {
        this.loginAsUserForm.get('schoolType').patchValue(this.schoolTypes[0]);
        this.getSchoolsDropdown({ value: this.schoolTypes[0], source: null });
      }
    }
    this.getUserTypeDropdown();
  }

  getSchoolsDropdown(event: MatSelectChange) {
    this.schools = [];
    this.userTypeList = [];
    this.loginAsUserForm.get('school').patchValue(null, { emitEvent: false });
    const selectedEntityName = this.loginAsUserForm.get('entity').value;
    const schoolTypeName = event.value;
    console.log('this.getSchoolsDropdown', schoolTypeName);
    console.log(event);
    this.userData.entities.forEach((entity) => {
      if (entity.entity_name === selectedEntityName && entity.school_type === schoolTypeName) {
        if (entity.school && entity.school) {
          this.schools.push(entity.school);
        }
      }
    });
    this.schools = _.uniqBy(this.schools, '_id');
    if (this.schools && this.schools.length === 1) {
      this.loginAsUserForm.get('school').patchValue(this.schools[0]._id);
    }
    this.getUserTypeDropdown();
  }

  getUserTypeDropdown() {
    this.userTypeList = [];
    this.loginAsUserForm.get('user_type').patchValue(null, { emitEvent: false });
    console.log('this.userData.entities', this.userData.entities);
    let entitySelected = [];
    if (this.loginAsUserForm.get('entity').value) {
      console.log('Entity Cascade');
      entitySelected = this.userData.entities.filter((entity) => {
        return entity.entity_name === this.loginAsUserForm.get('entity').value;
      });
    }
    if (this.loginAsUserForm.get('entity').value === 'academic') {
      console.log('Entity Academic!');
      if (this.loginAsUserForm.get('schoolType').value) {
        console.log('School Type Cascade');
        entitySelected = entitySelected.filter((entity) => {
          return entity.school_type === this.loginAsUserForm.get('schoolType').value;
        });
      }
      if (this.loginAsUserForm.get('school').value) {
        console.log('School Cascade');
        entitySelected = entitySelected.filter((entity) => {
          return entity.school && entity.school._id === this.loginAsUserForm.get('school').value;
        });
      }
    }
    if (entitySelected && entitySelected.length) {
      this.userTypeList = entitySelected.map((entity) => {
        return { value: entity.type._id, label: entity.type.name };
      });
      this.userTypeList = _.uniqBy(this.userTypeList, 'value');
      if (this.userTypeList && this.userTypeList.length === 1) {
        this.loginAsUserForm.get('user_type').patchValue(this.userTypeList[0].value);
      }
    }
    console.log('this.userTypeList', this.userTypeList, entitySelected);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  loginAsUser() {
    const currentUser = this.utilService.getCurrentUser();
    this.isWaitingForResponse = true;

    this.getUserTableColumnSettings(this.parentData?._id)
    this.subs.sink = this.authService.loginAsUser(currentUser._id, this.parentData._id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          console.log(resp);
          Swal.fire({
            allowOutsideClick: false,
            type: 'success',
            title: this.translate.instant('SUCCESS'),
            html: this.translate.instant('USER_S7_SUPERUSER.TEXT', {
              UserCivility: this.parentData.civility !== 'neutral' ? this.translate.instant(this.parentData.civility) : '',
              UserFirstName: this.parentData.first_name,
              UserLastName: this.parentData.last_name,
            }),
            allowEscapeKey: true,
            confirmButtonText: this.translate.instant('UNDERSTOOD'),
          }).then((result) => {
            this.dialogRef.close();
            this.authService.backupLocalUserProfileAndToken();

            const selectedEntityName = this.loginAsUserForm.get('entity').value;
            const selectedSchoolType = this.loginAsUserForm.get('schoolType').value;
            const selectedSchoolId = this.loginAsUserForm.get('school').value;
            const selectedUserTypeId = this.loginAsUserForm.get('user_type').value;

            const userLogin = _.cloneDeep(resp['user']);
            const tempResp = _.cloneDeep(resp);
            console.log(resp);
            console.log(userLogin);
            const entities = userLogin.entities.filter((ent) => {
              if (selectedEntityName === 'academic') {
                console.log('select academic entity_name = :', selectedEntityName && ent.school_type === selectedSchoolType);
                console.log('entity Name : ', ent);
                if (selectedSchoolId) {
                  return (
                    ent.entity_name === selectedEntityName &&
                    ent.school_type === selectedSchoolType &&
                    ent.school._id === selectedSchoolId &&
                    ent.type._id === selectedUserTypeId
                  );
                } else {
                  return (
                    ent.entity_name === selectedEntityName && ent.school_type === selectedSchoolType && ent.type._id === selectedUserTypeId
                  );
                }
              } else {
                console.log('not select academic entity_name =:', selectedEntityName);
                console.log('entity Name : ', ent);
                return ent.entity_name === selectedEntityName && ent.type._id === selectedUserTypeId;
              }
            });
            const program = this.utilService.setDataProgram(entities)
            const sortedEntities = this.utilService.sortEntitiesByHierarchy(entities);

            const permissions = [];
            const permissionsId = [];
            if (sortedEntities && sortedEntities.length > 0) {
              sortedEntities.forEach((entity) => {
                console.log('UserType name : ', entity.type.name);
                permissions.push(entity.type.name);
                permissionsId.push(entity.type._id);
              });
            }

            const temp = userLogin;
            temp.entities = sortedEntities;
            temp.app_data = program
            tempResp.user = temp;

            this.authService.setLocalUserProfileAndToken(tempResp);
            this.authService.setPermission(permissions);
            this.ngxPermissionService.flushPermissions();
            this.ngxPermissionService.loadPermissions(permissions);
            this.userService.reloadCurrentUser(true);
            const listExceptionUserTypeId = ['6278e02eb97bfb30674e76b0', '6278e027b97bfb30674e76af', '5fe98eeadb866c403defdc6c'];
            if (permissionsId.findIndex((permission) => listExceptionUserTypeId.includes(permission)) < 0) {
              this.router.navigate(['/home']);
            } else {
              this.router.navigate(['/task']);
            }
          });
        }
      },
      (err) => {
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

  getUserTableColumnSettings(user_id) {
    if (user_id) {
      this.subs.sink = this.authService.GetUserTableColumnSettings(user_id).subscribe(
        (resp) => {
          if (resp && resp?.length) {
            localStorage.setItem('templateTable', JSON.stringify(resp));
          }
        },
        (err) => {
          Swal.fire({
            type: 'info',
            title: 'Warning',
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
  }
  hierarchyUserType() {
    const selectedEntityName = this.loginAsUserForm.get('entity').value;
    const selectedSchoolType = this.loginAsUserForm.get('schoolType').value;
    const selectedSchoolId = this.loginAsUserForm.get('school').value;
    if (selectedEntityName === 'admtc') {
      const dataEntity = this.entitiesData.filter((entity) => {
        return (entity.entity_name = 'admtc');
      });
      const unixUserType = _.uniqBy(dataEntity, 'type.name');
      console.log('unixUserType => ', unixUserType, dataEntity);
    } else if (selectedEntityName === 'academic') {
      const dataEntity = this.entitiesData.filter((entity) => {
        return (entity.entity_name = 'academic');
      });
      const unixUserType = _.uniqBy(dataEntity, 'type.name');
      console.log('unixUserType => ', unixUserType, dataEntity);
    } else if (selectedEntityName === 'company') {
      const dataEntity = this.entitiesData.filter((entity) => {
        return (entity.entity_name = 'company');
      });
      const unixUserType = _.uniqBy(dataEntity, 'type.name');
      console.log('unixUserType => ', unixUserType, dataEntity);
    } else {
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
