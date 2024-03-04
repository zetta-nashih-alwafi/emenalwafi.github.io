import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { UserService } from 'app/service/user/user.service';
import { CustomValidators } from 'ng2-validation';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { AcademicKitService } from 'app/service/rncpTitles/academickit.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';

@Component({
  selector: 'ms-add-user-entity-dialog',
  templateUrl: './add-user-entity-dialog.component.html',
  styleUrls: ['./add-user-entity-dialog.component.scss'],
})
export class AddUserEntityDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  addNewUserTypeForm: UntypedFormGroup;

  isWaitingForResponse = false;
  currentUser: any;
  userTypeList = [];
  campusList = [];
  schoolList = [];
  levelList = [];
  realCampusList = [];
  listObjective = [];
  schoolSelected: any;
  currentUserTypeId

  constructor(
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddUserEntityDialogComponent>,
    private authService: AuthService,
    private academicService: AcademicKitService,
    private candidateService: CandidatesService,
    private translate: TranslateService,
    private userService: UserService,
  ) {}

  ngOnInit() {
    console.log(this.parentData);
    this.currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.getAllUserType();
    this.getAllCandidateDropdown();
    this.initForm();
  }

  initForm() {
    this.addNewUserTypeForm = this.fb.group({
      usertype: [null],
      school: [null],
      campus: [null],
      level: [null],
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  getAllCandidateDropdown() {
    this.subs.sink = this.candidateService.getAllCandidateSchoolDropdown().subscribe(
      (res) => {
        // console.log(res);
        if (res) {
          this.listObjective = res;
          this.schoolList = this.listObjective;
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getAllUserType() {
    this.subs.sink = this.academicService.getAllUserTypes().subscribe(
      (res) => {
        // console.log(res);
        if (res) {
          this.userTypeList = res.filter((res) => res._id === '617f64ec5a48fe2228518814' || res._id === '617f64ec5a48fe2228518815');
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  submit() {
    const program = this.createProgram();
    let payload;
    if (this.parentData && this.parentData.fromUserTable) {
      payload = this.createPayloadFromUserTable();
    } else {
      payload = this.createPayload(this.parentData);
    }
    if (!payload) {
      Swal.fire({
        type: 'info',
        title: 'NEED SWAL',
        text: 'Sorry, there is the same entity as you created!',
        confirmButtonText: this.translate.instant('OK'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
    } else {
      if (this.parentData && this.parentData.fromUserTable) {
        const payloadFromTable = this.parentData.payload;
        payloadFromTable.entities = payload;
        payload.programs = program;
        this.dialogRef.close(payloadFromTable);
      } else {
        payload.programs = program;
        this.subs.sink = this.userService.updateUser(this.parentData._id, payload,this.currentUserTypeId).subscribe(
          (res) => {
            if (res) {
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

  createPayloadFromUserTable() {
    let submittedEntities = [];
    const primaryData = {
      entity_name: `academic`,
      type: this.addNewUserTypeForm.get('usertype').value,
      school_type: `preparation_center`,
      candidate_school: this.schoolSelected[0],
    };
    let campuses = this.addNewUserTypeForm.get('campus').value;
    let levels = this.addNewUserTypeForm.get('level').value;
    campuses.forEach((cmp) => {
      levels.forEach((lvl) => {
        const fullData = {
          ...primaryData,
          candidate_campus: cmp,
          candidate_level: lvl,
        };
        submittedEntities.push(fullData);
      });
    });
    return submittedEntities;
  }

  createPayload(originData) {
    let updatedEntities;
    let originEntities = [];
    let submittedEntities = [];
    const primaryData = {
      entity_name: `academic`,
      type: this.addNewUserTypeForm.get('usertype').value,
      school_type: `preparation_center`,
      candidate_school: this.schoolSelected[0],
    };
    let campuses = this.addNewUserTypeForm.get('campus').value;
    let levels = this.addNewUserTypeForm.get('level').value;
    campuses.forEach((cmp) => {
      levels.forEach((lvl) => {
        const fullData = {
          ...primaryData,
          candidate_campus: cmp,
          candidate_level: lvl,
        };
        submittedEntities.push(fullData);
      });
    });
    originData.entities.forEach((element) => {
      const orgEnt = {
        entity_name: `academic`,
        type: element.type._id,
        school_type: `preparation_center`,
        candidate_campus: element.candidate_campus,
        candidate_school: element.candidate_school,
        candidate_level: element.candidate_level,
      };
      originEntities.push(orgEnt);
    });

    const found = originEntities.find((res) => {
      const checkCondition =
        res.type === this.addNewUserTypeForm.get('usertype').value &&
        res.candidate_campus === this.addNewUserTypeForm.get('campus').value &&
        res.candidate_school === this.addNewUserTypeForm.get('school').value &&
        res.candidate_level === this.addNewUserTypeForm.get('level').value;
      if (checkCondition) {
        return res;
      }
    });

    if (!found) {
      updatedEntities = originEntities.concat(submittedEntities);
      const payload = {
        civility: originData.civility,
        first_name: originData.first_name,
        last_name: originData.last_name,
        profile_picture: originData.profile_picture,
        email: originData.email,
        position: originData.position,
        office_phone: originData.office_phone,
        portable_phone: originData.portable_phone,
        entities: updatedEntities,
        user_status: originData.user_status,
      };
      console.log(payload);
      return payload;
    } else {
      return null;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getDataCampus() {
    this.levelList = [];
    this.campusList = [];
    this.addNewUserTypeForm.get('campus').setValue(null);
    this.addNewUserTypeForm.get('level').setValue(null);
    const school = this.addNewUserTypeForm.get('school').value;
    let scampusList;
    this.realCampusList = [];
    if (school) {
      scampusList = this.listObjective.filter((list) => {
        return school.includes(list._id);
      });
      const optionAll = {
        name: this.translate.instant('ALL'),
      };
      this.campusList.push(optionAll);
      scampusList.filter((campus, n) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses, nex) => {
            this.campusList.push(campuses);
            this.realCampusList.push(campuses);
          });
        }
      });
      this.campusList = _.uniqBy(this.campusList, 'name');
      const selected = _.cloneDeep(scampusList);
      this.schoolSelected = selected.map((res) => res.short_name);
      console.log('Campus Option ', scampusList, this.campusList, this.schoolSelected);
    }
  }

  getDataLevel() {
    this.levelList = [];
    this.addNewUserTypeForm.get('level').setValue(null);
    let sCampus = _.cloneDeep(this.addNewUserTypeForm.get('campus').value);
    sCampus = sCampus.filter((list) => list === 'ALL' || list === 'Tous');
    if (sCampus && sCampus.length && (sCampus[0] === 'ALL' || sCampus[0] === 'Tous')) {
      const dataCampus = [];
      const dataTemp = this.realCampusList.filter((list) => list.name !== 'ALL' && list.name !== 'Tous');
      dataTemp.forEach((element) => {
        dataCampus.push(element.name);
      });
      this.addNewUserTypeForm.get('campus').patchValue(dataCampus);
      const sLevelList = dataTemp;
      const optionAll = {
        name: this.translate.instant('ALL'),
      };
      this.levelList.push(optionAll);
      sLevelList.forEach((element) => {
        element.levels.forEach((level) => {
          this.levelList.push(level);
        });
      });
      this.levelList = _.uniqBy(this.levelList, 'name');
      console.log('Data Levels ', this.levelList, sLevelList);
    } else {
      sCampus = _.cloneDeep(this.addNewUserTypeForm.get('campus').value);
      const sLevelList = this.realCampusList.filter((list) => {
        return sCampus.includes(list.name);
      });
      const optionAll = {
        name: this.translate.instant('ALL'),
      };
      this.levelList.push(optionAll);
      sLevelList.forEach((element) => {
        element.levels.forEach((level) => {
          this.levelList.push(level);
        });
      });
      this.levelList = _.uniqBy(this.levelList, 'name');
    }
  }

  getDataByLevel() {
    let sLevel = _.cloneDeep(this.addNewUserTypeForm.get('level').value);
    sLevel = sLevel.filter((list) => list === 'ALL' || list === 'Tous');
    if (sLevel && sLevel.length && (sLevel[0] === 'ALL' || sLevel[0] === 'Tous')) {
      const dataLevel = [];
      const dataTemp = this.levelList.filter((list) => list.name !== 'ALL' && list.name !== 'Tous');
      dataTemp.forEach((element) => {
        dataLevel.push(element.name);
      });
      this.addNewUserTypeForm.get('level').patchValue(dataLevel);
    }
  }

  clearLevel() {
    this.getDataCampus();
  }

  clearCampus() {
    this.campusList = [];
    this.realCampusList = [];
  }

  handleRemoveSchool() {
    const school = this.addNewUserTypeForm.get('school').value;
    console.log('_sch', school);
    if (school.length === 0) {
      this.clearCampus();
    }
  }

  handleRemoveCampus() {
    const campus = this.addNewUserTypeForm.get('campus').value;
    console.log('_cam', campus);
    if (campus.length === 0) {
      this.clearLevel();
    }
  }

  createProgram() {
    const listProgram = [];
    let schoolSub = '';
    let campusSub = '';
    let levelSub = '';
    let selectedCampus = this.addNewUserTypeForm.get('campus').value;
    let selectedLevel = this.addNewUserTypeForm.get('level').value;
    this.schoolSelected.forEach((sch) => {
      if (sch) {
        selectedCampus.forEach((camp) => {
          selectedLevel.forEach((lvl) => {
            schoolSub = sch.substring(0, 3).toUpperCase();
            campusSub = camp.substring(0, 3).toUpperCase();
            levelSub = lvl.toUpperCase();
            listProgram.push(`${schoolSub + campusSub} ${levelSub}`);
          });
        });
      }
    });
    console.log('_list pro', listProgram);
    return listProgram;
  }
}
