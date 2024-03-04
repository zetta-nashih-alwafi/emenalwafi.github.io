import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserManagementService } from 'app/user-management/user-management.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-add-user-usertype-dialog',
  templateUrl: './add-user-usertype-dialog.component.html',
  styleUrls: ['./add-user-usertype-dialog.component.scss'],
})
export class AddUserUsertypeDialogComponent implements OnInit {
  private subs = new SubSink();
  addNewUserTypeForm: UntypedFormGroup;
  userTypeFinance = ['5fe98eeadb866c403defdc6b', '6009066808ed8724f5a54836', '617f64ec5a48fe222851880e', '617f64ec5a48fe222851880f'];
  isFinanceUser = false;
  isWaitingForResponse = false;
  currentUser: any;
  userTypeList = [];
  campusList = [];
  schoolList = [];
  levelList = [];
  realCampusList = [];
  listObjective = [];
  schoolSelected: any;
  isOperatorSelected: boolean = false;
  isOperator: boolean;
  isPermission: string[];
  currentUserTypeId: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddUserUsertypeDialogComponent>,
    private userMgtService: UserManagementService,
    private translate: TranslateService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    if (this.userTypeFinance.includes(this.currentUserTypeId)) {
      this.isFinanceUser = true;
    }
    // console.log('isFinanceUser : ', this.isFinanceUser, this.currentUserTypeId);
    // console.log('listUserTypeFinance : ', this.userTypeFinance);
    // this.currentUser = this.authService.getLocalStorageUser();
    this.checkIsOperator();
    this.getDataDropdown();
    this.initForm();
    // console.log('is operator?', this.isOperator);
  }

  initForm() {
    this.addNewUserTypeForm = this.fb.group({
      type: [null, Validators.required],
      entity_name: [null, Validators.required],
      school: [null, Validators.required],
      campus: [null, Validators.required],
      level: [null, Validators.required],
    });
  }

  checkIsOperator() {
    this.isOperator = this.authService.getCurrentUser().entities.some((entity) => entity.entity_name && entity.entity_name === 'operator');
  }

  getDataDropdown() {
    this.getDropdownUserTypes();
    this.getDropdownSchool();
  }

  getDropdownUserTypes() {
    const entities = ['academic', 'finance', 'admission', 'company_relation', 'operator', 'alumni'];
    if (!this.isOperator) entities.splice(entities.indexOf('operator'), 1);
    this.subs.sink = this.userMgtService.getAllUserTypeDropdown(entities).subscribe(
      (resp) => {
        const temp = _.cloneDeep(resp);
        if (!this.isFinanceUser) {
          this.userTypeList = temp.filter(
            (usertype) => usertype.name !== 'Candidate' && usertype.name !== 'Teacher' && usertype.entity !== 'finance',
          );
        } else {
          this.userTypeList = temp.filter((usertype) => usertype.name !== 'Candidate' && usertype.name !== 'Teacher');
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

  getDropdownSchool() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.userMgtService.getAllSchoolDropdown(this.currentUserTypeId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.schoolList = resp;
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

  getDataCampus() {
    const schoolId = this.addNewUserTypeForm.get('school').value;
    const selectedSchool = this.schoolList.find((school) => school._id === schoolId);
    // console.log(selectedSchool);
    if (schoolId) {
      this.addNewUserTypeForm.get('campus').patchValue(null);
      this.addNewUserTypeForm.get('level').patchValue(null);
    }
    if (selectedSchool && selectedSchool.campuses) {
      const camp = selectedSchool.campuses.filter((resp) => resp.levels && resp.levels.length);
      this.campusList = [];
      this.campusList.push({ _id: 'all', name: this.translate.instant('ALL') });
      this.campusList.push(...camp);
    } else {
      this.campusList = [];
      this.addNewUserTypeForm.get('campus').patchValue(null);
    }
  }

  getDataLevel() {
    if (this.addNewUserTypeForm.get('campus').value && this.addNewUserTypeForm.get('campus').value.length) {
      const campusesIds = this.addNewUserTypeForm.get('campus').value;
      if (campusesIds) {
        this.addNewUserTypeForm.get('level').patchValue(null);
      }
      let selectedCampusObjects = [];
      // Doing check if selecting all or not, if select all then we need to put campuses of all school into array
      if (campusesIds && campusesIds.includes('all')) {
        selectedCampusObjects = this.campusList.filter((campus) => campus && campus._id !== 'all');
        this.addNewUserTypeForm
          .get('campus')
          .patchValue(this.campusList.filter((campus) => campus && campus._id !== 'all').map((campus) => campus._id));
      } else {
        selectedCampusObjects = this.campusList.filter(
          (campus) => campus && this.addNewUserTypeForm.get('campus').value.includes(campus._id),
        );
      }

      // first get the mapped object of levels from each campuses
      // then flatten the array to get only a single list of levels
      // then sort it alphabetically

      this.levelList = this.sortNameAlphabetically(
        _.uniqBy(this.flattenArray(selectedCampusObjects.map((campus) => campus.levels)), '_id'),
        'name',
      );
      this.levelList.unshift({ _id: 'all', name: this.translate.instant('ALL') });
    } else {
      this.levelList = [];
      this.addNewUserTypeForm.get('level').patchValue(null);
    }
  }

  getDataByLevel() {
    if (this.addNewUserTypeForm.get('level').value && this.addNewUserTypeForm.get('level').value.length) {
      const levelIds = this.addNewUserTypeForm.get('level').value;
      let selectedlevel = [];
      // Doing check if selecting all or not, if select all then we need to put campuses of all school into array
      if (levelIds && levelIds.includes('all')) {
        selectedlevel = this.levelList.filter((level) => level && level._id !== 'all');
        this.addNewUserTypeForm
          .get('level')
          .patchValue(this.levelList.filter((level) => level && level._id !== 'all').map((level) => level._id));
      }
    }
  }

  setUserType() {
    if (this.addNewUserTypeForm.get('type').value) {
      const selectedUserType = this.userTypeList.find((type) => type._id === this.addNewUserTypeForm.get('type').value);
      this.addNewUserTypeForm.get('entity_name').patchValue(selectedUserType.entity);
      // if operator is selected, hide the other fields
      this.isOperatorSelected = selectedUserType.entity === 'operator' ? true : false;
    } else {
      this.isOperatorSelected = false;
    }
  }

  handleRemoveSchool() {
    this.addNewUserTypeForm.get('campus').patchValue(null);
    this.addNewUserTypeForm.get('level').patchValue(null);
  }

  handleRemoveCampus() {
    this.addNewUserTypeForm.get('level').patchValue(null);
  }

  clearCampus() {
    this.addNewUserTypeForm.get('campus').patchValue(null);
  }

  clearLevel() {
    this.addNewUserTypeForm.get('level').patchValue(null);
  }

  flattenArray(arr: any[]) {
    // used to flatten array inside of array into just a single array using merging method
    return arr.reduce((acc, val) => acc.concat(val), []);
  }

  sortNameAlphabetically(arr: any[], key: string) {
    return arr.sort((a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0));
  }

  createPayload() {
    const payload = {
      entities: [_.cloneDeep(this.cleanObject({ ...this.addNewUserTypeForm.value }))],
    };
    if (payload.entities && payload.entities.length) {
      payload.entities.forEach((entity) => {
        let school = null;
        let campus = null;
        let level = null;
        if (entity.school) {
          school = entity.school;
          delete entity.school;
        }
        if (entity.campus) {
          campus = entity.campus;
          delete entity.campus;
        }
        if (entity.level) {
          level = entity.level;
          delete entity.level;
        }
        // console.log('uat 275 campus level', campus, level);
        if (school && campus && level) {
          let programs = [];
          if (campus && campus.length) {
            campus.forEach((camp) => {
              if (level && level.length) {
                level.forEach((lvl) => {
                  programs.push({
                    school,
                    campus: camp,
                    level: lvl,
                  });
                });
              }
            });
          }
          entity.programs = programs;
        } else {
          entity.programs = [];
        }
      });
    }
    return payload;
  }

  cleanObject(object) {
    for (const [key, value] of Object.entries(object)) {
      if (value === null) {
        delete object[key];
      }
    }
    return object;
  }

  checkValidation() {
    const entity = this.addNewUserTypeForm.get('entity_name').value;
    // If not operator then we also need to validate school, campus, and level
    if (entity !== 'operator') {
      const school = this.addNewUserTypeForm.get('school').value;
      const campus = this.addNewUserTypeForm.get('campus').value;
      const level = this.addNewUserTypeForm.get('level').value;
      if (school && campus && campus.length && level && level.length) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  checkFormValidity(): boolean {
    const entity = this.addNewUserTypeForm.get('entity_name').value;
    if (entity !== 'operator') {
      this.addNewUserTypeForm.get('school').setValidators(Validators.required);
      this.addNewUserTypeForm.get('campus').setValidators(Validators.required);
      this.addNewUserTypeForm.get('level').setValidators(Validators.required);

      this.addNewUserTypeForm.get('school').updateValueAndValidity();
      this.addNewUserTypeForm.get('campus').updateValueAndValidity();
      this.addNewUserTypeForm.get('level').updateValueAndValidity();
    } else {
      this.addNewUserTypeForm.get('school').clearValidators();
      this.addNewUserTypeForm.get('campus').clearValidators();
      this.addNewUserTypeForm.get('level').clearValidators();

      this.addNewUserTypeForm.get('school').updateValueAndValidity();
      this.addNewUserTypeForm.get('campus').updateValueAndValidity();
      this.addNewUserTypeForm.get('level').updateValueAndValidity();
    }

    if (this.addNewUserTypeForm.invalid || !this.checkValidation()) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
      this.addNewUserTypeForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  submit() {
    if (this.checkFormValidity()) {
      return;
    }
    const payload = this.createPayload();
    // console.log('uat 275 payload', payload);
    this.isWaitingForResponse = true;
    this.subs.sink = this.userMgtService.updateUserEntities(this.parentData.userId, payload, this.currentUserTypeId).subscribe(
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
            this.dialogRef.close(resp);
          });
        }
      },
      (error) => {
        this.authService.postErrorLog(error);
        this.showSwalError(error);
        return;
      },
    );
  }

  showSwalError(err) {
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
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
