import { Component, Input, OnInit, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { FinancesService } from 'app/service/finance/finance.service';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { TrombinoscopePdfDialogComponent } from 'app/shared/components/trombinoscope-pdf-dialog/trombinoscope-pdf-dialog.component';
import { StudentsService } from 'app/service/students/students.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { validatorOnlyContainsSpaceorEnterOnly } from 'app/service/customvalidator.validator';

@Component({
  selector: 'ms-tromb-filter-card',
  templateUrl: './tromb-filter-card.component.html',
  styleUrls: ['./tromb-filter-card.component.scss'],
})
export class TrombFilterCardComponent implements OnInit, OnDestroy, OnChanges {
  @Input() scholarId;
  @Input() isShow;
  @Input() scholarSeasonChange$;
  @Output() schoolIds = new EventEmitter<any>();
  @Output() campusIds = new EventEmitter<any>();
  @Output() levelIds = new EventEmitter<any>();
  @Output() sectorIds = new EventEmitter<any>();
  @Output() specialityIds = new EventEmitter<any>();
  @Output() sequenceId = new EventEmitter<any>();
  @Output() typeOfGroupId = new EventEmitter<any>();
  @Output() groupId = new EventEmitter<any>();
  @Output() applyFilterValue = new EventEmitter<any>();
  @Output() resetData = new EventEmitter<boolean>();
  private subs = new SubSink();
  currentUserTypeId: any;
  currentUser: any;
  isPermission: any;
  formFilter: FormGroup;
  listObjective = [];
  listSequence = [];
  schoolsOri = [{ _id: 'All', short_name: 'All schools' }];
  campusListOri = [{ _id: 'All', name: 'All campus' }];
  levelsOri = [{ _id: 'All', name: 'All levels' }];
  sectorOri = [{ _id: 'All', name: 'All sectors' }];
  specialityOri = [
    { _id: 'All', sigli: 'All speciality' },
    { _id: 'None', sigli: 'None' },
  ];
  schools = [];
  campusList = [];
  levels = [];
  sector = [];
  speciality = [{ _id: 'None', sigli: this.translate.instant('None') }];
  sequences = [];
  typeOfGroups = [];
  groups = [];
  dialogConfig: MatDialogConfig = {
    disableClose: true,
    minWidth: '750px',
    autoFocus: false,
  };
  allowExport = false;
  preFilter = false;
  dialogRef: MatDialogRef<TrombinoscopePdfDialogComponent>;

  schoolCurrentFilter;
  schoolFilterSame;
  campusCurrentFilter;
  campusFilterSame;
  levelCurrentFilter;
  levelFilterSame;
  sectorCurrentFilter;
  sectorFilterSame;
  specialityCurrentFilter;
  specialityFilterSame;
  sequenceCurrentFilter;
  sequenceFilterSame;
  typeGroupCurrentFilter;
  typeGroupFilterSame;

  // Filter Values
  schoolFilterValue;
  campusFilterValue;
  levelFilterValue;
  sectorFilterValue;
  specialityFilterValue;
  sequenceFilterValue;
  typeOfGroupFilterValue;
  groupFilterValue;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private userService: AuthService,
    private candidatesService: CandidatesService,
    private financeService: FinancesService,
    private studentsService: StudentsService,
    private utilService: UtilityService,
    private dialog: MatDialog,
    private permissions: PermissionService,
  ) {}

  ngOnInit() {
    this.isPermission = this.userService.getPermission();
    this.currentUser = this.userService.getLocalStorageUser();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.initFormFilter();
    this.getPermissions();
    this.translateDropdown();
  }
  ngOnChanges() {
    if (this.isShow) {
      this.getSchools(this.scholarId);
    } else {
      this.listObjective = [];
      this.listSequence = [];
      this.schools = [];
      this.campusList = [];
      this.levels = [];
      this.sector = [];
      this.speciality = [];
      this.sequences = [];
      this.typeOfGroups = [];
      this.groups = [];

      this.formFilter?.get('school').setValue([]);
      this.formFilter?.get('campus').setValue([]);
      this.formFilter?.get('level').setValue([]);
      this.formFilter?.get('sector').setValue([]);
      this.formFilter?.get('speciality').setValue([]);
      this.formFilter?.get('sequence').setValue(null);
      this.formFilter?.get('type_of_group').setValue(null);
      this.formFilter?.get('group').setValue(null);
      // Filter Values
      this.schoolFilterValue = null;
      this.campusFilterValue = null;
      this.levelFilterValue = null;
      this.sectorFilterValue = null;
      this.specialityFilterValue = null;
      this.sequenceFilterValue = null;
      this.typeOfGroupFilterValue = null;
      this.groupFilterValue = null;
    }
  }
  /**
   * For translation dropdown label and mutate ng-select [items]
   *
   * Somehow according to ng-select spec to trigger change detection
   * we can't use array.push() function instead use spread operator array = [...array]
   *
   * [Change Detection](https://github.com/ng-select/ng-select#change-detection)
   */
  translateDropdown() {
    this.subs.sink = this.translate.onLangChange.subscribe(() => {
      // const schools = this.schoolsOri.map((item) => {
      //   const school = {
      //     _id: item._id,
      //     short_name: this.translate.instant(item.short_name),
      //   };
      //   return school;
      // });
      // this.schools = [...schools];
      // const campusList = this.campusListOri.map((item) => {
      //   const campus = {
      //     _id: item._id,
      //     name: this.translate.instant(item.name),
      //   };
      //   return campus;
      // });
      // this.campusList = [...campusList];
      // const levels = this.levelsOri.map((item) => {
      //   const level = {
      //     _id: item._id,
      //     name: this.translate.instant(item.name),
      //   };
      //   return level;
      // });
      // this.levels = [...levels];
      // const sector = this.sectorOri.map((item) => {
      //   const sector = {
      //     _id: item._id,
      //     name: this.translate.instant(item.name),
      //   };
      //   return sector;
      // });
      // this.sector = [...sector];
      // const speciality = this.specialityOri.map((item) => {
      //   const spec = {
      //     _id: item._id,
      //     sigli: this.translate.instant(item.sigli),
      //   };
      //   return spec;
      // });
      // this.speciality = [...speciality];
      this.speciality = this.speciality.map((resp) => {
        if (resp && resp._id && resp._id === 'None') {
          resp.sigli = this.translate.instant('None');
        }
        return resp;
      });
    });
  }

  preSelect() {
    this.preFilter = true;
    this.selectSchool();
    this.formFilter.get('campus').setValue([], { emitEvent: false });
    this.selectCampus();
    this.formFilter.get('level').setValue([], { emitEvent: false });
    this.selectLevel();
    this.formFilter.get('sector').setValue([], { emitEvent: false });
    this.selectSector();
    this.formFilter.get('speciality').setValue([], { emitEvent: false });
    this.selectSpeciality();
  }

  initFormFilter() {
    this.formFilter = this.fb.group({
      school: [[]],
      campus: [[]],
      level: [[]],
      sector: [[]],
      speciality: [[]],
      sequence: [null],
      type_of_group: [null],
      group: [null],
    });
  }

  getPermissions(): void {
    this.allowExport = Boolean(this.permissions.studentsTrombinoscopeExport());
  }

  checkAllSuperFilter(typeFilter) {
    if (typeFilter === 'school') {
      const schoolFilter = this.formFilter.get('school').value.length;
      const schoolList = this.schools.length;
      if (schoolFilter === schoolList) {
        return true;
      } else {
        return false;
      }
    }

    if (typeFilter === 'campus') {
      const campusFilter = this.formFilter.get('campus').value.length;
      const campusList = this.campusList.length;
      if (campusFilter === campusList) {
        return true;
      } else {
        return false;
      }
    }

    if (typeFilter === 'level') {
      const levelFilter = this.formFilter.get('level').value.length;
      const levelList = this.levels.length;
      if (levelFilter === levelList) {
        return true;
      } else {
        return false;
      }
    }

    if (typeFilter === 'sector') {
      const sectorFilter = this.formFilter.get('sector').value.length;
      const sectorList = this.sector.length;
      if (sectorFilter === sectorList) {
        return true;
      } else {
        return false;
      }
    }

    if (typeFilter === 'speciality') {
      const specialityFilter = this.formFilter.get('speciality').value.length;
      const specialityList = this.speciality.length;
      if (specialityFilter === specialityList) {
        return true;
      } else {
        return false;
      }
    }
  }

  checkSuperFilterIndeterminate(typeFilter) {
    if (typeFilter === 'school') {
      const schoolFilter = this.formFilter.get('school').value.length;
      const schoolList = this.schools.length;
      if (schoolFilter !== schoolList && schoolFilter !== 0) {
        return true;
      } else {
        return false;
      }
    }

    if (typeFilter === 'campus') {
      const campusFilter = this.formFilter.get('campus').value.length;
      const campusList = this.campusList.length;
      if (campusFilter !== campusList && campusFilter !== 0) {
        return true;
      } else {
        return false;
      }
    }

    if (typeFilter === 'level') {
      const levelFilter = this.formFilter.get('level').value.length;
      const levelList = this.levels.length;
      if (levelFilter !== levelList && levelFilter !== 0) {
        return true;
      } else {
        return false;
      }
    }

    if (typeFilter === 'sector') {
      const sectorFilter = this.formFilter.get('sector').value.length;
      const sectorList = this.sector.length;
      if (sectorFilter !== sectorList && sectorFilter !== 0) {
        return true;
      } else {
        return false;
      }
    }

    if (typeFilter === 'speciality') {
      const specialityFilter = this.formFilter.get('speciality').value.length;
      const specialityList = this.speciality.length;
      if (specialityFilter !== specialityList && specialityFilter !== 0) {
        return true;
      } else {
        return false;
      }
    }
  }

  selectedAllSuperFilter(typeFilter, event) {
    if (typeFilter === 'school') {
      const schoolFilter = this.formFilter.get('school');
      const schoolList = this.schools.map((school) => school._id);
      if (event.checked) {
        schoolFilter.patchValue(schoolList, { emitEvent: false });
      } else {
        schoolFilter.patchValue([], { emitEvent: false });
      }
    }

    if (typeFilter === 'campus') {
      const campusFilter = this.formFilter.get('campus');
      const campusList = this.campusList.map((campus) => campus._id);
      if (event.checked) {
        campusFilter.patchValue(campusList, { emitEvent: false });
      } else {
        campusFilter.patchValue([], { emitEvent: false });
      }
    }

    if (typeFilter === 'level') {
      const levelFilter = this.formFilter.get('level');
      const levelList = this.levels.map((level) => level._id);
      if (event.checked) {
        levelFilter.patchValue(levelList, { emitEvent: false });
      } else {
        levelFilter.patchValue([], { emitEvent: false });
      }
    }

    if (typeFilter === 'sector') {
      const sectorFilter = this.formFilter.get('sector');
      const sectorList = this.sector.map((sector) => sector._id);
      if (event.checked) {
        sectorFilter.patchValue(sectorList, { emitEvent: false });
      } else {
        sectorFilter.patchValue([], { emitEvent: false });
      }
    }

    if (typeFilter === 'speciality') {
      const specialityFilter = this.formFilter.get('speciality');
      const specialityList = this.speciality.map((speciality) => speciality._id);
      if (event.checked) {
        specialityFilter.patchValue(specialityList, { emitEvent: false });
      } else {
        specialityFilter.patchValue([], { emitEvent: false });
      }
    }
  }

  getSchools(data?) {
    const name = data ? data : '';
    const filter = 'filter: { scholar_season_id:' + `"${name}"` + '}';
    const userTypesIds = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService.GetAllSchoolFilterTrombs(name, filter, userTypesIds).subscribe(
      (resp) => {
        if (resp) {
          let school = _.cloneDeep(resp);
          school = school.sort((schoolA, schoolB) => {
            if (this.utilService.simplifyRegex(schoolA.short_name) < this.utilService.simplifyRegex(schoolB.short_name)) {
              return -1;
            } else if (this.utilService.simplifyRegex(schoolA.short_name) > this.utilService.simplifyRegex(schoolB.short_name)) {
              return 1;
            } else {
              return 0;
            }
          });
          // const allOpt = [{_id: 'All', short_name: 'All schools'}];
          // this.schoolsOri = [...allOpt, ...school];
          // this.schools = this.schoolsOri.map((item) => {
          //   const school = {
          //     _id: item._id,
          //     short_name: this.translate.instant(item.short_name)
          //   }
          //   return school;
          // });
          this.schools = _.cloneDeep(school);
          this.listObjective = _.cloneDeep(resp);
          // to get all dropdown value for the first time (prefilter)
          if (!this.schools?.length) {
            this.formFilter.get('school').patchValue([]);
          } else {
            this.preSelect();
          }
        }
      },
      (err) => {
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
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

  selectSchool(event?) {
    this.preFilter = event ? false : true;
    if (this.schoolCurrentFilter === this.formFilter.get('school').value) {
      this.schoolFilterSame = true;
    } else {
      this.schoolFilterSame = false;
    }
    let schoolIdValues = this.formFilter.get('school').value;
    this.schoolCurrentFilter = schoolIdValues;
    if (!this.schoolFilterSame) {
      // We reset dropdown array to only display all
      this.campusList = [];
      this.levels = [];
      this.sector = [];
      this.speciality = [];
      this.sequences = [];
      this.typeOfGroups = [];
      this.groups = [];
      this.formFilter.get('campus').setValue([]);
      this.formFilter.get('level').setValue([]);
      this.formFilter.get('sector').setValue([]);
      this.formFilter.get('speciality').setValue([]);
      this.formFilter.get('sequence').setValue(null);
      this.formFilter.get('type_of_group').setValue(null);
      this.formFilter.get('group').setValue(null);

      // Filter Values
      this.campusFilterValue = null;
      this.levelFilterValue = null;
      this.sectorFilterValue = null;
      this.specialityFilterValue = null;
      this.sequenceFilterValue = null;
      this.typeOfGroupFilterValue = null;
      this.groupFilterValue = null;
    }
    // disable sequence control
    this.formFilter.get('sequence').disable();
    this.formFilter.get('type_of_group').disable();
    this.formFilter.get('group').disable();

    if (schoolIdValues.includes('All')) {
      const allValue = schoolIdValues.findIndex((el) => el === 'All');
      if (allValue !== 0) {
        schoolIdValues = '';
      } else if (allValue === 0) {
        schoolIdValues.splice(allValue, 1);
      }
      this.formFilter.get('school').setValue(['All']);
    }

    if (schoolIdValues && schoolIdValues.length) {
      this.formFilter.get('school').setValue(schoolIdValues);
      this.schoolFilterValue = schoolIdValues;
      // this.schoolIds.emit(schoolIdValues);
    } else {
      this.schoolFilterValue = null;
      // this.schoolIds.emit(null);
    }

    let schoolIdValuesFilter = schoolIdValues;

    if (schoolIdValuesFilter && !schoolIdValuesFilter.length) {
      schoolIdValuesFilter = null;
    }
    if (schoolIdValuesFilter) {
      this.getCampusesDropdown(schoolIdValuesFilter);
    }
  }

  getCampusesDropdown(schoolIdValues) {
    const filter = {
      scholar_season_id: this.scholarId,
      school_ids: schoolIdValues ? schoolIdValues : null,
    };
    // this.campusListOri = [{_id: 'All', name: 'All campus'}];
    const userTypesLogins = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.financeService.getAllCampusesDropdownCascadeFilterTrombs(filter, userTypesLogins).subscribe(
      (resp) => {
        if (resp) {
          let campusList = _.cloneDeep(resp);
          campusList = _.uniqBy(campusList, '_id');
          campusList = _.sortBy(campusList, ['name']);
          this.campusList = campusList;
          // this.campusListOri = [...this.campusListOri, ...campusList];
          // this.campusList = this.campusListOri.map((item) => {
          //   const campus = {
          //     _id: item._id,
          //     name: this.translate.instant(item.name)
          //   }
          //   return campus;
          // });
        } else {
          this.campusList = [];
          // this.campusListOri = [{_id: 'All', name: 'All campus'}];
          // this.campusList = [{_id: 'All', name: this.translate.instant('All campus')}];
        }
      },
      (err) => {
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
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

  selectCampus(event?) {
    this.preFilter = event ? false : true;
    if (this.campusCurrentFilter === this.formFilter.get('campus').value) {
      this.campusFilterSame = true;
    } else {
      this.campusFilterSame = false;
    }
    let schoolIdValues = this.formFilter.get('school').value;
    let campusIdValues = this.formFilter.get('campus').value;
    this.campusCurrentFilter = campusIdValues;
    if (!this.campusFilterSame) {
      // We reset dropdown array to only display all
      this.levels = [];
      this.sector = [];
      this.speciality = [];
      this.sequences = [];
      this.typeOfGroups = [];
      this.groups = [];
      this.formFilter.get('level').setValue([]);
      this.formFilter.get('sector').setValue([]);
      this.formFilter.get('speciality').setValue([]);
      this.formFilter.get('sequence').setValue(null);
      this.formFilter.get('type_of_group').setValue(null);
      this.formFilter.get('group').setValue(null);

      // Filter Values
      this.levelFilterValue = null;
      this.sectorFilterValue = null;
      this.specialityFilterValue = null;
      this.sequenceFilterValue = null;
      this.typeOfGroupFilterValue = null;
      this.groupFilterValue = null;
    }
    // disable sequence control
    this.formFilter.get('sequence').disable();
    this.formFilter.get('type_of_group').disable();
    this.formFilter.get('group').disable();

    if (campusIdValues.includes('All')) {
      const allValue = campusIdValues.findIndex((el) => el === 'All');
      if (allValue !== 0) {
        campusIdValues = '';
      } else if (allValue === 0) {
        campusIdValues.splice(allValue, 1);
      }
      this.formFilter.get('campus').setValue(['All']);
    }
    if (campusIdValues && campusIdValues.length) {
      this.formFilter.get('campus').setValue(campusIdValues);
      this.campusFilterValue = campusIdValues;
      // this.campusIds.emit(campusIdValues);
    } else {
      this.campusFilterValue = null;
      // this.campusIds.emit(null);
    }

    let schoolIdValuesFilter = schoolIdValues;
    let campusIdValuesFilter = campusIdValues;

    if (schoolIdValuesFilter && !schoolIdValuesFilter.length) {
      schoolIdValuesFilter = null;
    }
    if (campusIdValuesFilter && !campusIdValuesFilter.length) {
      campusIdValuesFilter = null;
    }

    if (schoolIdValuesFilter && campusIdValuesFilter) {
      this.getLevelsDropdown(schoolIdValuesFilter, campusIdValuesFilter);
    }
  }

  getLevelsDropdown(schoolIdValues, campusIdValues) {
    const filter = {
      scholar_season_id: this.scholarId,
      school_ids: schoolIdValues ? schoolIdValues : null,
      campus_ids: campusIdValues ? campusIdValues : null,
    };
    // this.levelsOri = [{_id: 'All', name: 'All levels'}];
    const userTypesIds = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.financeService.getAllLevelsDropdownCascadeFilterTrombs(filter, userTypesIds).subscribe(
      (resp) => {
        if (resp) {
          let levels = _.cloneDeep(resp);
          levels = _.uniqBy(levels, '_id');
          levels = _.sortBy(levels, ['name']);
          this.levels = levels;
          // this.levelsOri = [...this.levelsOri, ...levels];
          // this.levels = this.levelsOri.map((item) => {
          //   const level = {
          //     _id: item._id,
          //     name: this.translate.instant(item.name)
          //   }
          //   return level;
          // });
        } else {
          this.levels = [];
          // this.levelsOri = [{_id: 'All', name: 'All levels'}];
          // this.levels = [{_id: 'All', name: this.translate.instant('All levels')}];
        }
      },
      (err) => {
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
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

  selectLevel(event?) {
    this.preFilter = event ? false : true;
    if (this.levelCurrentFilter === this.formFilter.get('level').value) {
      this.levelFilterSame = true;
    } else {
      this.levelFilterSame = false;
    }
    let schoolIdValues = this.formFilter.get('school').value;
    let campusIdValues = this.formFilter.get('campus').value;
    let levelIdValues = this.formFilter.get('level').value;
    this.levelCurrentFilter = levelIdValues;
    if (!this.levelFilterSame) {
      // We reset dropdown array to only display all
      this.sector = [];
      this.speciality = [];
      this.sequences = [];
      this.typeOfGroups = [];
      this.groups = [];
      this.formFilter.get('sector').setValue([]);
      this.formFilter.get('speciality').setValue([]);
      this.formFilter.get('sequence').setValue(null);
      this.formFilter.get('type_of_group').setValue(null);
      this.formFilter.get('group').setValue(null);

      // Filter Values
      this.sectorFilterValue = null;
      this.specialityFilterValue = null;
      this.sequenceFilterValue = null;
      this.typeOfGroupFilterValue = null;
      this.groupFilterValue = null;
    }
    // disable sequence control
    this.formFilter.get('sequence').disable();
    this.formFilter.get('type_of_group').disable();
    this.formFilter.get('group').disable();

    if (levelIdValues.includes('All')) {
      const allValue = levelIdValues.findIndex((el) => el === 'All');
      if (allValue !== 0) {
        levelIdValues = '';
      } else if (allValue === 0) {
        levelIdValues.splice(allValue, 1);
      }
      this.formFilter.get('level').setValue(['All']);
    }

    if (levelIdValues && levelIdValues.length) {
      this.formFilter.get('level').setValue(levelIdValues);
      this.levelFilterValue = levelIdValues;
      // this.levelIds.emit(levelIdValues);
    } else {
      this.levelFilterValue = null;
      // this.levelIds.emit(null);
    }

    let schoolIdValuesFilter = schoolIdValues;
    let campusIdValuesFilter = campusIdValues;
    let levelIdValuesFilter = levelIdValues;

    if (schoolIdValuesFilter && !schoolIdValuesFilter.length) {
      schoolIdValuesFilter = null;
    }
    if (campusIdValuesFilter && !campusIdValuesFilter.length) {
      campusIdValuesFilter = null;
    }
    if (levelIdValuesFilter && !levelIdValuesFilter.length) {
      levelIdValuesFilter = null;
    }

    if (schoolIdValuesFilter && campusIdValuesFilter && levelIdValuesFilter) {
      this.getSectorDropdown(schoolIdValuesFilter, campusIdValuesFilter, levelIdValuesFilter);
    }
  }

  getSectorDropdown(schoolIdValues, campusIdValues, levelIdValues) {
    const filter = {
      scholar_season_id: this.scholarId,
      candidate_school_ids: schoolIdValues ? schoolIdValues : [],
      campuses: campusIdValues ? campusIdValues : [],
      levels: levelIdValues ? levelIdValues : [],
    };
    // this.sectorOri = [{_id: 'All', name: 'All sectors'}];
    this.subs.sink = this.financeService.GetAllSectorsDropdown(filter).subscribe(
      (resp) => {
        if (resp && resp.length) {
          let sector = _.cloneDeep(resp);
          sector = _.sortBy(sector, ['name']);
          this.sector = sector;
          // this.sectorOri = [...this.sectorOri, ...sector];
          // this.sector = this.sectorOri.map((item) => {
          //   const sector = {
          //     _id: item._id,
          //     name: this.translate.instant(item.name)
          //   }
          //   return sector;
          // });
        } else {
          this.sector = [];
          // this.sectorOri = [{_id: 'All', name: 'All sectors'}];
          // this.sector = [{_id: 'All', name: this.translate.instant('All sectors')}];
        }
      },
      (err) => {
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
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

  selectSector(event?) {
    this.preFilter = event ? false : true;
    if (this.sectorCurrentFilter === this.formFilter.get('sector').value) {
      this.sectorFilterSame = true;
    } else {
      this.sectorFilterSame = false;
    }
    let schoolIdValues = this.formFilter.get('school').value;
    let campusIdValues = this.formFilter.get('campus').value;
    let levelIdValues = this.formFilter.get('level').value;
    let sectorIdValues = this.formFilter.get('sector').value;
    this.sectorCurrentFilter = sectorIdValues;
    if (!this.sectorFilterSame) {
      // We reset dropdown array to only display all
      this.speciality = [];
      this.sequences = [];
      this.typeOfGroups = [];
      this.groups = [];
      this.formFilter.get('speciality').setValue([]);
      this.formFilter.get('sequence').setValue(null);
      this.formFilter.get('type_of_group').setValue(null);
      this.formFilter.get('group').setValue(null);

      // Filter Values
      this.specialityFilterValue = null;
      this.sequenceFilterValue = null;
      this.typeOfGroupFilterValue = null;
      this.groupFilterValue = null;
    }
    // disable sequence control
    this.formFilter.get('sequence').disable();
    this.formFilter.get('type_of_group').disable();
    this.formFilter.get('group').disable();

    if (sectorIdValues.includes('All')) {
      const allValue = sectorIdValues.findIndex((el) => el === 'All');
      if (allValue !== 0) {
        sectorIdValues = '';
      } else if (allValue === 0) {
        sectorIdValues.splice(allValue, 1);
      }
      this.formFilter.get('sector').setValue(['All']);
    }

    if (sectorIdValues && sectorIdValues.length) {
      this.formFilter.get('sector').setValue(sectorIdValues);
      this.sectorFilterValue = sectorIdValues;
      // this.sectorIds.emit(sectorIdValues);
    } else {
      this.sectorFilterValue = null;
      // this.sectorIds.emit(null);
    }

    let schoolIdValuesFilter = schoolIdValues;
    let campusIdValuesFilter = campusIdValues;
    let levelIdValuesFilter = levelIdValues;
    let sectorIdValuesFilter = sectorIdValues;

    if (schoolIdValuesFilter && !schoolIdValuesFilter.length) {
      schoolIdValuesFilter = null;
    }
    if (campusIdValuesFilter && !campusIdValuesFilter.length) {
      campusIdValuesFilter = null;
    }
    if (levelIdValuesFilter && !levelIdValuesFilter.length) {
      levelIdValuesFilter = null;
    }
    if (sectorIdValuesFilter && !sectorIdValuesFilter.length) {
      sectorIdValuesFilter = null;
    }

    if (schoolIdValuesFilter && campusIdValuesFilter && levelIdValuesFilter && sectorIdValuesFilter) {
      this.getSpecializationDropdown(schoolIdValuesFilter, campusIdValuesFilter, levelIdValuesFilter, sectorIdValuesFilter);
    }
  }

  getSpecializationDropdown(schoolIdValues, campusIdValues, levelIdValues, sectorIdValues) {
    const filter = {
      scholar_season_id: this.scholarId,
    };
    if (schoolIdValues) {
      filter['candidate_school_ids'] = schoolIdValues;
    }
    if (campusIdValues) {
      filter['campuses'] = campusIdValues;
    }
    if (levelIdValues) {
      filter['levels'] = levelIdValues;
    }
    if (sectorIdValues) {
      filter['sectors'] = sectorIdValues;
    }
    // this.specialityOri = [{_id: 'All', sigli: 'All speciality'}, {_id: 'None', sigli: 'None'}];
    this.subs.sink = this.candidatesService.GetAllSpecializationsByScholar(filter).subscribe(
      (resp) => {
        if (resp && resp.length) {
          let speciality = _.cloneDeep(resp);
          speciality = _.sortBy(speciality, ['sigli']);
          this.speciality = speciality;
          this.speciality.unshift({ _id: 'None', sigli: this.translate.instant('None') });
          // this.specialityOri = [...this.specialityOri, ...speciality];
          // this.speciality = this.specialityOri.map((item) => {
          //   const spec = {
          //     _id: item._id,
          //     sigli: this.translate.instant(item.sigli)
          //   }
          //   return spec;
          // });
        } else {
          this.speciality = [];
          this.speciality.push({ _id: 'None', sigli: this.translate.instant('None') });
          // this.specialityOri = [{_id: 'All', sigli: 'All speciality'}, {_id: 'None', sigli: 'None'}];
          // this.speciality = [{_id: 'All', sigli: this.translate.instant('All speciality')}, {_id: 'None', sigli: this.translate.instant('None')}];
        }
      },
      (err) => {
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
        }
        this.levelIds.emit(null);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  selectSpeciality(event?) {
    this.preFilter = event ? false : true;
    if (this.specialityCurrentFilter === this.formFilter.get('speciality').value) {
      this.specialityFilterSame = true;
    } else {
      this.specialityFilterSame = false;
    }
    let schoolIdValues = this.formFilter.get('school').value;
    let campusIdValues = this.formFilter.get('campus').value;
    let levelIdValues = this.formFilter.get('level').value;
    let sectorIdValues = this.formFilter.get('sector').value;
    let specialityIdValues = this.formFilter.get('speciality').value;
    this.specialityCurrentFilter = specialityIdValues;
    if (!this.specialityFilterSame) {
      this.sequences = [];
      this.typeOfGroups = [];
      this.groups = [];
      this.formFilter.get('sequence').setValue(null);
      this.formFilter.get('type_of_group').setValue(null);
      this.formFilter.get('group').setValue(null);

      // Filter Values
      this.sequenceFilterValue = null;
      this.typeOfGroupFilterValue = null;
      this.groupFilterValue = null;
    }

    if (specialityIdValues.includes('All')) {
      const allValue = specialityIdValues.findIndex((el) => el === 'All');
      if (allValue !== 0) {
        specialityIdValues = '';
      } else if (allValue === 0) {
        specialityIdValues.splice(allValue, 1);
      }
      this.formFilter.get('speciality').setValue(['All']);
    }

    // if(specialityIdValues.includes('None')) {
    //   const noneValue = specialityIdValues.findIndex((el) => el === 'None');
    //   if (noneValue !== 0){
    //     specialityIdValues = '';
    //   } else if (noneValue === 0){
    //     specialityIdValues.splice(noneValue, 1);
    //   }
    //   this.formFilter.get('speciality').setValue(['None']);
    // }

    if (specialityIdValues && specialityIdValues.length) {
      if (specialityIdValues !== 'All') {
        this.formFilter.get('speciality').setValue(specialityIdValues);
        this.specialityFilterValue = specialityIdValues;
        // this.specialityIds.emit(specialityIdValues);
      } else {
        this.specialityFilterValue = null;
        // this.specialityIds.emit(null);
      }
    } else {
      this.specialityFilterValue = null;
      // this.specialityIds.emit(null);
    }
    console.log('uat 533', schoolIdValues, campusIdValues, levelIdValues, sectorIdValues, this.formFilter.get('speciality').value);
    if (
      schoolIdValues &&
      schoolIdValues.length &&
      campusIdValues &&
      campusIdValues.length &&
      levelIdValues &&
      levelIdValues.length &&
      sectorIdValues &&
      sectorIdValues.length &&
      this.formFilter.get('speciality').value &&
      this.formFilter.get('speciality').value.length
    ) {
      this.getSequenceDropdown(schoolIdValues, campusIdValues, levelIdValues, sectorIdValues, this.formFilter.get('speciality').value);
    }
  }

  getSequenceDropdown(schoolIdValues, campusIdValues, levelIdValues, sectorIdValues, specialityIdValues) {
    if (
      schoolIdValues &&
      schoolIdValues.length &&
      schoolIdValues.length === 1 &&
      schoolIdValues[0] &&
      schoolIdValues[0] !== 'All' &&
      campusIdValues &&
      campusIdValues.length &&
      campusIdValues.length === 1 &&
      campusIdValues[0] &&
      campusIdValues[0] !== 'All' &&
      levelIdValues &&
      levelIdValues.length &&
      levelIdValues.length === 1 &&
      levelIdValues[0] &&
      levelIdValues[0] !== 'All' &&
      sectorIdValues &&
      sectorIdValues.length &&
      sectorIdValues.length === 1 &&
      sectorIdValues[0] &&
      sectorIdValues[0] !== 'All' &&
      specialityIdValues &&
      specialityIdValues.length &&
      specialityIdValues.length === 1 &&
      specialityIdValues[0] &&
      specialityIdValues[0] !== 'All'
    ) {
      let filter = {
        scholar_season_id: this.scholarId,
        school_id: schoolIdValues[0],
        campus_id: campusIdValues[0],
        level_id: levelIdValues[0],
      };
      if (specialityIdValues[0] === 'All') {
        filter['speciality'] = '';
      } else if (specialityIdValues.includes('None')) {
        filter['speciality'] = 'None';
      } else {
        filter['speciality'] = specialityIdValues[0];
      }
      delete filter['speciality_id']
      console.log('FILTER', filter);
      this.subs.sink = this.studentsService.getAllProgramSequence(filter).subscribe((resp) => {
        if (resp && resp.length) {
          this.sequences = _.cloneDeep(resp);
          this.sequences = _.sortBy(this.sequences, ['name']);
          this.listSequence = _.cloneDeep(resp);

          // enable sequence control once user select speciality none or specific speciality
          this.formFilter.get('sequence').enable();
          this.formFilter.get('type_of_group').enable();
          this.formFilter.get('group').enable();
        } else {
          this.sequences = [];
        }
      });
    } else {
      this.sequences = [];
      // disable sequence control if user select more than 1 speciality or not none
      this.formFilter.get('sequence').disable();
      this.formFilter.get('type_of_group').disable();
      this.formFilter.get('group').disable();
    }
  }

  selectSequence(event?) {
    this.preFilter = event ? false : true;
    if (this.sequenceCurrentFilter === this.formFilter.get('sequence').value) {
      this.sequenceFilterSame = true;
    } else {
      this.sequenceFilterSame = false;
    }
    let sequenceIdValue = this.formFilter.get('sequence').value;
    this.sequenceCurrentFilter = sequenceIdValue;
    if (!this.sequenceFilterSame) {
      this.typeOfGroups = [];
      this.groups = [];
      this.formFilter.get('type_of_group').setValue(null);
      this.formFilter.get('group').setValue(null);

      // Filter Values
      this.typeOfGroupFilterValue = null;
      this.groupFilterValue = null;
    }

    if (sequenceIdValue && sequenceIdValue.includes('All')) {
      sequenceIdValue = '';
      this.formFilter.get('sequence').setValue('All');
    } else if (!sequenceIdValue) {
      sequenceIdValue = '';
      this.formFilter.get('sequence').setValue(null);
    }

    if (sequenceIdValue) {
      this.sequenceFilterValue = sequenceIdValue;
      // this.sequenceId.emit(sequenceIdValue);
      const selectedSequence = this.listSequence.find((seq) => seq._id === sequenceIdValue);
      console.log('selectedSequence', selectedSequence);
      if (selectedSequence && selectedSequence.program_sequence_groups && selectedSequence.program_sequence_groups.length) {
        selectedSequence.program_sequence_groups.forEach((element) => {
          this.typeOfGroups.push(...element.group_class_types);
        });
        this.typeOfGroups = _.sortBy(this.typeOfGroups, ['name']);
      }
    } else {
      this.sequenceFilterValue = null;
      // this.sequenceId.emit(null);
      this.formFilter.get('sequence').setValue(null);
    }
  }

  selectTypeOfGroup(event?) {
    this.preFilter = event ? false : true;
    let typeOfGroupIdValue = this.formFilter.get('type_of_group').value;
    if (this.typeGroupCurrentFilter === this.formFilter.get('type_of_group').value) {
      this.typeGroupFilterSame = true;
    } else {
      this.typeGroupFilterSame = false;
    }
    this.typeGroupCurrentFilter = typeOfGroupIdValue;
    if (!this.typeGroupFilterSame) {
      this.groups = [];
      this.formFilter.get('group').setValue(null);

      // Filter Values
      this.groupFilterValue = null;
    }

    if (typeOfGroupIdValue && typeOfGroupIdValue.includes('All')) {
      typeOfGroupIdValue = '';
      this.formFilter.get('type_of_group').setValue('All');
    } else if (!typeOfGroupIdValue) {
      typeOfGroupIdValue = '';
      this.formFilter.get('type_of_group').setValue(null);
    }

    if (typeOfGroupIdValue) {
      this.typeOfGroupFilterValue = typeOfGroupIdValue;
      // this.typeOfGroupId.emit(typeOfGroupIdValue);

      let sequenceIdValue = this.formFilter.get('sequence').value;
      const selectedSequence = this.listSequence.find((seq) => seq._id === sequenceIdValue);

      if (typeOfGroupIdValue === 'class') {
        if (selectedSequence && selectedSequence.program_sequence_groups && selectedSequence.program_sequence_groups.length) {
          selectedSequence.program_sequence_groups.forEach((element) => {
            this.groups.push(...element.student_classes);
          });
        } else {
          this.groups = [];
        }
      } else {
        if (selectedSequence && selectedSequence.program_sequence_groups && selectedSequence.program_sequence_groups.length) {
          const groupClassTypes = [];
          selectedSequence.program_sequence_groups.forEach((element) => {
            groupClassTypes.push(...element.group_class_types);
          });

          if (groupClassTypes && groupClassTypes.length) {
            let typeOfGroupIdValue = this.formFilter.get('type_of_group').value;
            const selectedTypeOfGroup = this.typeOfGroups.find((type) => type._id === typeOfGroupIdValue);
            if (selectedTypeOfGroup && selectedTypeOfGroup.group_classes_id && selectedTypeOfGroup.group_classes_id.length) {
              this.groups.push(...selectedTypeOfGroup.group_classes_id);
            } else {
              this.groups = [];
            }
          }
        } else {
          this.groups = [];
        }
      }

      this.groups = _.sortBy(this.groups, ['name']);
    } else {
      this.typeOfGroupFilterValue = null;
      // this.typeOfGroupId.emit(null);
      this.formFilter.get('type_of_group').setValue(null);
      this.formFilter.get('group').setValue(null);
    }
  }

  selectGroup(event?) {
    this.preFilter = event ? false : true;
    let groupIdValue = this.formFilter.get('group').value;
    let typeOfGroupIdValue = this.formFilter.get('type_of_group').value;

    if (!groupIdValue || groupIdValue.includes('All')) {
      groupIdValue = '';
      this.formFilter.get('group').setValue(null);

      // Filter Values
      this.groupFilterValue = null;
    }

    if (groupIdValue) {
      this.groupFilterValue = [typeOfGroupIdValue, groupIdValue];
      // this.groupId.emit([typeOfGroupIdValue, groupIdValue]);
    } else {
      this.groupFilterValue = null;
      // this.groupId.emit(null);
      this.formFilter.get('group').setValue(null);
    }
  }

  isDisable() {
    let disable = false;
    if (
      (this.formFilter.get('school').value && this.formFilter.get('school').value.length) ||
      (this.formFilter.get('campus').value && this.formFilter.get('campus').value.length) ||
      (this.formFilter.get('level').value && this.formFilter.get('level').value.length) ||
      (this.formFilter.get('sector').value && this.formFilter.get('sector').value.length) ||
      (this.formFilter.get('speciality').value && this.formFilter.get('speciality').value.length)
    ) {
      disable = false;
    } else {
      disable = true;
    }

    return disable;
  }

  applyFilter() {
    this.schoolIds.emit(this.schoolFilterValue);
    this.campusIds.emit(this.campusFilterValue);
    this.levelIds.emit(this.levelFilterValue);
    this.sectorIds.emit(this.sectorFilterValue);
    this.specialityIds.emit(this.specialityFilterValue);
    this.sequenceId.emit(this.sequenceFilterValue);
    this.typeOfGroupId.emit(this.typeOfGroupFilterValue);
    this.groupId.emit(this.groupFilterValue);
    this.applyFilterValue.emit(true);
  }

  openPDFdialog() {
    const school_id =
      this.formFilter.get('school').value && this.formFilter.get('school').value[0] !== 'All' ? this.formFilter.get('school').value : null;
    const campus =
      this.formFilter.get('campus').value && this.formFilter.get('campus').value[0] !== 'All' ? this.formFilter.get('campus').value : null;
    const level =
      this.formFilter.get('level').value && this.formFilter.get('level').value[0] !== 'All' ? this.formFilter.get('level').value : null;
    const sector =
      this.formFilter.get('sector').value && this.formFilter.get('sector').value[0] !== 'All' ? this.formFilter.get('sector').value : null;
    let speciality;
    const sequence = this.formFilter.get('sequence').value ? this.formFilter.get('sequence').value : null;
    const typeOfGroup = this.formFilter.get('type_of_group').value ? this.formFilter.get('type_of_group').value : null;
    const group = this.formFilter.get('group').value ? this.formFilter.get('group').value : null;

    if (this.formFilter.get('speciality').value && this.formFilter.get('speciality').value[0] === 'All') {
      speciality = null;
    } else {
      speciality = this.formFilter.get('speciality').value;
    }

    this.dialog
      .open(TrombinoscopePdfDialogComponent, {
        ...this.dialogConfig,
        data: {
          scholar_season_id: this.scholarId,
          school_id: school_id,
          campus: campus,
          level: level,
          sector: sector,
          speciality: speciality,
          sequence: sequence,
          typeOfGroup: typeOfGroup,
          group: group,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        console.log(resp);
        if (resp === 'success') {
          this.reset();
        }
      });
  }

  reset() {
    this.preFilter = true;
    this.listObjective = [];
    this.listSequence = [];
    this.schools = [];
    this.campusList = [];
    this.levels = [];
    this.sector = [];
    this.speciality = [];
    this.sequences = [];
    this.typeOfGroups = [];
    this.groups = [];

    this.formFilter.get('school').setValue([]);
    this.formFilter.get('campus').setValue([]);
    this.formFilter.get('level').setValue([]);
    this.formFilter.get('sector').setValue([]);
    this.formFilter.get('speciality').setValue([]);
    this.formFilter.get('sequence').setValue(null);
    this.formFilter.get('type_of_group').setValue(null);
    this.formFilter.get('group').setValue(null);
    // Filter Values
    this.schoolFilterValue = null;
    this.campusFilterValue = null;
    this.levelFilterValue = null;
    this.sectorFilterValue = null;
    this.specialityFilterValue = null;
    this.sequenceFilterValue = null;
    this.typeOfGroupFilterValue = null;
    this.groupFilterValue = null;

    this.getSchools(this.scholarId);
    this.resetData.emit(true);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
