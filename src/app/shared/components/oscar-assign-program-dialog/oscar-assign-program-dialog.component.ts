import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FinancesService } from 'app/service/finance/finance.service';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { UtilityService } from 'app/service/utility/utility.service';

@Component({
  selector: 'ms-oscar-assign-program-dialog',
  templateUrl: './oscar-assign-program-dialog.component.html',
  styleUrls: ['./oscar-assign-program-dialog.component.scss'],
})
export class OscarAssignProgramDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  assignProgramForm: UntypedFormGroup;
  filterFormCtrl: UntypedFormGroup;

  scholarList: any[] = [];
  filteredScholar: Observable<any[]>;
  schoolList: any[] = [];
  filteredSchool: Observable<any[]>;
  campusList: any[] = [];
  filteredCampus: Observable<any[]>;
  levelList: any[] = [];
  filteredLevel: Observable<any[]>;
  sectorList: any[] = [];
  filteredSector: Observable<any[]>;
  specialityList: any[] = [];
  filteredSpeciality: Observable<any[]>;
  formationList: any[] = [];
  filteredFormation: Observable<any[]>;
  memberList: any[] = [];
  filteredMember: Observable<any[]>;

  selectedScholarId: any;
  selectedSchoolId: any;
  selectedLevelId: any;
  selectedSectorId: any;
  selectedCampusId: any;
  selectedSpecialityId: any;
  selectedFormationId: any;
  selectedMemberId: any;
  isWaitingForResponse = false;

  isUserAdmissionMember = false;
  selectAll = false;
  filteredValues;
  candidateId;
  countDocument;
  private intVal;
  private timeOutVal;
  isPermission: string[];
  currentUser: any;
  currentUserTypeId: string;
  isDisplayNone = false;
  isContinous = false;
  listContinousManager = [];
  filteredManager: Observable<any[]>;
  isAcadDirMember = false

  constructor(
    public dialogRef: MatDialogRef<OscarAssignProgramDialogComponent>,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private candidateService: CandidatesService,
    private admissionEntrypointService: AdmissionEntrypointService,
    private financeService: FinancesService,
    private permissions: NgxPermissionsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: AuthService,
  ) {}

  ngOnInit() {
    console.log('MAT_DIALOG_DATA', this.data);
    this.isPermission = this.userService.getPermission();
    this.currentUser = this.userService.getLocalStorageUser();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.isUserAdmissionMember = this.permissions.getPermission('Admission Member') ? true : false;
    this.isAcadDirMember = this.permissions.getPermission('Academic Director') || this.permissions.getPermission('Academic Member') ? true : false
    console.log(this.data);
    if (this.data.type === 'all') {
      this.selectAll = true;
      this.filteredValues = this.data.filter;
      this.countDocument = this.data.countDocument;
      this.candidateId = this.data.candidateId;
      console.log(this.filteredValues);
    } else {
      this.selectAll = false;
      this.candidateId = this.data.candidateId;
      console.log(this.candidateId);
    }
    this.initForm();
    this.initFilterForm();
    this.getScholarSeason();

    if (this.isUserAdmissionMember) {
      const member = {
        _id: this.currentUser._id,
        name:
          (this.currentUser.civility !== 'neutral' ? this.translate.instant(this.currentUser.civility) + ' ' : '') +
          this.currentUser.last_name.toUpperCase() +
          ' ' +
          this.currentUser.first_name,
      };
      this.memberList.push(member);
      this.assignProgramForm.get('dev_member').setValue(this.currentUser._id);
      this.filterFormCtrl.get('devMember').setValue(member.name);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  initForm() {
    this.assignProgramForm = this.fb.group({
      scholar_season: ['', Validators.required],
      school: ['', Validators.required],
      campus: ['', Validators.required],
      level: ['', Validators.required],
      sector: ['', Validators.required],
      type_of_formation_id: ['', Validators.required],
      speciality: [''],
      continuous_formation_manager_id: [''],
      dev_member: ['', Validators.required],
    });
  }

  initFilterForm() {
    this.filterFormCtrl = this.fb.group({
      scholarSeason: ['', Validators.required],
      school: ['', Validators.required],
      campus: ['', Validators.required],
      level: ['', Validators.required],
      sector: ['', Validators.required],
      type_of_formation_id: ['', Validators.required],
      speciality: [''],
      continuous_formation_manager_id: [''],
      devMember: ['', Validators.required],
    });
  }

  getScholarSeason() {
    this.isWaitingForResponse = true;
    let filter = {
      is_published: true,
    };
    const isForNextSeason = this.data?.from === 'readmission'? true: false
    if(this.data?.from === 'readmission' && this.data?.candidateId?.length){
      filter['candidate_id'] = this.data?.candidateId[0]?._id
    }
    this.subs.sink = this.candidateService.getAllScholarSeasons(filter,isForNextSeason).subscribe(
      (res) => {
        console.log('_schol', res);
        if (res) {
          this.scholarList = res;
          this.isWaitingForResponse = false;
          this.initFilter();
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
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

  initFilter() {
    this.filteredScholar = this.filterFormCtrl.controls['scholarSeason'].valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.scholarList.filter((scholar) =>
          scholar ? scholar.scholar_season.toLowerCase().includes(searchText.toString().toLowerCase()) : true,
        ),
      ),
    );

    this.filteredSchool = this.filterFormCtrl.controls['school'].valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.schoolList.filter((school) => (school ? school.short_name.toLowerCase().includes(searchText.toLowerCase()) : true)),
      ),
    );

    this.filteredCampus = this.filterFormCtrl.controls['campus'].valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.campusList.filter((campus) => (campus ? campus.name.toLowerCase().includes(searchText.toLowerCase()) : true)),
      ),
    );

    this.filteredLevel = this.filterFormCtrl.controls['level'].valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        searchText
          ? this.levelList
              .filter((level) => (level ? level.name.toLowerCase().includes(searchText.toString().toLowerCase()) : true))
              .sort((a: any, b: any) => a.name - b.name)
          : this.levelList.sort((a: any, b: any) => a.name - b.name),
      ),
    );

    this.filteredSector = this.filterFormCtrl.controls['sector'].valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.sectorList.filter((sector) => (sector ? sector.name.toLowerCase().includes(searchText.toLowerCase()) : true)),
      ),
    );

    this.filteredSpeciality = this.filterFormCtrl.controls['speciality'].valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.specialityList.filter((speciality) => (speciality ? speciality.name.toLowerCase().includes(searchText.toLowerCase()) : true)),
      ),
    );

    this.filteredFormation = this.filterFormCtrl.controls['type_of_formation_id'].valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.formationList.filter((formation) =>
          formation
            ? this.translate
                .instant('type_formation.' + formation.type_of_information)
                .toLowerCase()
                .includes(searchText.toLowerCase())
            : true,
        ),
      ),
    );

    this.filteredMember = this.filterFormCtrl.controls['devMember'].valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.memberList.filter((devMember) => (devMember ? devMember.name.toLowerCase().includes(searchText.toLowerCase()) : true)),
      ),
    );
  }

  getUserTypeIdList() {
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type : [];
    const userTypeIdList = [];
    if (userTypesList) {
      const operator_dir = userTypesList.filter((user) => user.name === 'operator_dir');
      if (operator_dir?.length) {
        userTypeIdList.push(operator_dir[0]?._id);
      } else {
        const operator_admin = userTypesList.filter((user) => user.name === 'operator_admin');
        if (operator_admin?.length) {
          userTypeIdList.push(operator_admin[0]?._id);
        } else {
          userTypesList.forEach((user) => {
            if (
              user.name === 'Admission Director' ||
              user.name === 'Admission Member' ||
              user.name === 'Continuous formation manager'
            ) {
              userTypeIdList.push(user._id);
            }
          });
        }
      }
      // userTypesList.forEach(user => {
      //   if (
      //     user.name === 'operator_dir' ||
      //     user.name === 'operator_admin' ||
      //     user.name === 'Admission Director' ||
      //     user.name === 'Admission Member' ||
      //     user.name === 'Academic Director' ||
      //     user.name === 'Continuous formation manager'
      //   ) {
      //     userTypeIdList.push(user._id);
      //   }
      // });
    }
    return userTypeIdList;
  }

  getSchoolDropdown(data) {
    console.log('scholar id', data);
    this.isWaitingForResponse = true;
    this.isDisplayNone = false;
    this.schoolList = [];
    this.campusList = [];
    this.levelList = [];
    this.sectorList = [];
    this.specialityList = [];
    this.formationList = [];
    this.listContinousManager = [];
    this.isContinous = false;
    if (!this.isUserAdmissionMember) {
      this.memberList = [];
      this.assignProgramForm.controls['dev_member'].patchValue('');
      this.filterFormCtrl.controls['devMember'].patchValue('');
    }
    this.assignProgramForm.controls['school'].patchValue('');
    this.assignProgramForm.controls['campus'].patchValue('');
    this.assignProgramForm.controls['level'].patchValue('');
    this.assignProgramForm.controls['sector'].patchValue('');
    this.assignProgramForm.controls['speciality'].patchValue('');
    this.assignProgramForm.controls['type_of_formation_id'].patchValue('');
    this.assignProgramForm.controls['continuous_formation_manager_id'].patchValue('');
    this.filterFormCtrl.controls['school'].patchValue('');
    this.filterFormCtrl.controls['campus'].patchValue('');
    this.filterFormCtrl.controls['level'].patchValue('');
    this.filterFormCtrl.controls['sector'].patchValue('');
    this.filterFormCtrl.controls['speciality'].patchValue('');
    this.filterFormCtrl.controls['type_of_formation_id'].patchValue('');
    this.filterFormCtrl.controls['continuous_formation_manager_id'].patchValue('');

    const userTypeList = this.getUserTypeIdList();
    console.log(userTypeList);

    this.selectedScholarId = data;
    this.assignProgramForm.controls['scholar_season'].patchValue(this.selectedScholarId);
    const filter = 'filter: { scholar_season_id:' + `"${data}"` + '}';
    console.log(filter);
    const isAssignmentTable = this.isAcadDirMember && this.data?.from === 'readmission' ? true : false
    this.subs.sink = this.candidateService.GetAllSchoolFilter(data, filter, userTypeList, true,null,isAssignmentTable).subscribe(
      (res) => {
        console.log('_school', res);
        if (res) {
          this.schoolList = res;
          this.schoolList = this.schoolList.sort((a: any, b: any) => a?.short_name?.localeCompare(b?.short_name));
          this.initFilter();
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
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

  getCampusDropdown(data) {
    console.log('school id', data);
    this.isWaitingForResponse = true;
    this.isDisplayNone = false;
    this.campusList = [];
    this.levelList = [];
    this.sectorList = [];
    this.specialityList = [];
    this.listContinousManager = [];
    this.formationList = [];
    this.isContinous = false;
    if (!this.isUserAdmissionMember) {
      this.memberList = [];
      this.filterFormCtrl.controls['devMember'].patchValue('');
    }
    this.assignProgramForm.controls['campus'].patchValue('');
    this.assignProgramForm.controls['level'].patchValue('');
    this.assignProgramForm.controls['sector'].patchValue('');
    this.assignProgramForm.controls['speciality'].patchValue('');
    this.assignProgramForm.controls['type_of_formation_id'].patchValue('');
    this.assignProgramForm.controls['continuous_formation_manager_id'].patchValue('');
    this.filterFormCtrl.controls['campus'].patchValue('');
    this.filterFormCtrl.controls['level'].patchValue('');
    this.filterFormCtrl.controls['sector'].patchValue('');
    this.filterFormCtrl.controls['speciality'].patchValue('');
    this.filterFormCtrl.controls['type_of_formation_id'].patchValue('');
    this.filterFormCtrl.controls['continuous_formation_manager_id'].patchValue('');

    this.selectedSchoolId = data;
    this.assignProgramForm.controls['school'].patchValue(this.selectedSchoolId);
    const filter = {
      scholar_season_id: this.selectedScholarId,
      school_id: this.selectedSchoolId,
    };

    const userTypeList = this.getUserTypeIdList();
    const isIncludeAll = this.isAcadDirMember && this.data?.from === 'readmission' ? true : null
    this.subs.sink = this.candidateService.GetAllCampuses(filter, userTypeList, true,isIncludeAll).subscribe(
      (res) => {
        console.log('_campuses', res);
        if (res) {
          this.campusList = res;
          this.campusList = this.campusList.sort((a: any, b: any) => a?.name?.localeCompare(b?.name));
          this.initFilter();
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
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
    console.log('campus list', this.campusList);
  }

  getLevelDropdown(data) {
    console.log('campus id', data);
    this.isWaitingForResponse = true;
    this.isDisplayNone = false;
    this.levelList = [];
    this.sectorList = [];
    this.specialityList = [];
    this.formationList = [];
    this.listContinousManager = [];
    this.isContinous = false;
    if (!this.isUserAdmissionMember) {
      this.memberList = [];
      this.assignProgramForm.controls['dev_member'].patchValue('');
      this.filterFormCtrl.controls['devMember'].patchValue('');
    }
    this.assignProgramForm.controls['level'].patchValue('');
    this.assignProgramForm.controls['sector'].patchValue('');
    this.assignProgramForm.controls['speciality'].patchValue('');
    this.assignProgramForm.controls['type_of_formation_id'].patchValue('');
    this.assignProgramForm.controls['continuous_formation_manager_id'].patchValue('');
    this.filterFormCtrl.controls['level'].patchValue('');
    this.filterFormCtrl.controls['sector'].patchValue('');
    this.filterFormCtrl.controls['speciality'].patchValue('');
    this.filterFormCtrl.controls['type_of_formation_id'].patchValue('');
    this.filterFormCtrl.controls['continuous_formation_manager_id'].patchValue('');

    this.selectedCampusId = data;
    this.assignProgramForm.controls['campus'].patchValue(this.selectedCampusId);
    // const level = this.campusList.filter((campus) => campus && campus._id === data ? campus : false);
    // this.levelList = level[0].levels;
    const filter = {
      scholar_season_id: this.selectedScholarId,
      school_id: this.selectedSchoolId,
      campus_id: this.selectedCampusId,
    };

    const userTypeList = this.getUserTypeIdList();
    const isIncludeAll = this.isAcadDirMember && this.data?.from === 'readmission' ? true : null
    this.subs.sink = this.candidateService.GetAllLevels(filter, userTypeList, true,isIncludeAll).subscribe(
      (res) => {
        console.log('_levels', res);
        if (res) {
          this.levelList = res;
          this.initFilter();
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
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
    console.log('level list', this.levelList);
  }

  getSectorDropdown(data) {
    console.log('level id', data);
    this.isWaitingForResponse = true;
    this.isDisplayNone = false;
    this.sectorList = [];
    this.specialityList = [];
    this.formationList = [];
    this.listContinousManager = [];
    this.isContinous = false;
    if (!this.isUserAdmissionMember) {
      this.memberList = [];
      this.assignProgramForm.controls['dev_member'].patchValue('');
      this.filterFormCtrl.controls['devMember'].patchValue('');
    }
    this.assignProgramForm.controls['sector'].patchValue('');
    this.assignProgramForm.controls['speciality'].patchValue('');
    this.assignProgramForm.controls['type_of_formation_id'].patchValue('');
    this.assignProgramForm.controls['continuous_formation_manager_id'].patchValue('');
    this.filterFormCtrl.controls['sector'].patchValue('');
    this.filterFormCtrl.controls['speciality'].patchValue('');
    this.filterFormCtrl.controls['type_of_formation_id'].patchValue('');
    this.filterFormCtrl.controls['continuous_formation_manager_id'].patchValue('');

    this.selectedLevelId = data;
    this.assignProgramForm.controls['level'].patchValue(this.selectedLevelId);
    const filter = {
      scholar_season_id: this.selectedScholarId,
      candidate_school_ids: [this.selectedSchoolId],
      campuses: [this.selectedCampusId],
      levels: [this.selectedLevelId],
    };
    console.log(filter);
    this.subs.sink = this.financeService.GetAllSectorsDropdown(filter).subscribe(
      (res) => {
        console.log('_sector', res);
        if (res) {
          this.sectorList = res;
          this.initFilter();
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
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

  getSpecialityDropdown(data) {
    console.log('sector id', data);
    this.isWaitingForResponse = true;
    this.isDisplayNone = false;
    this.specialityList = [];
    this.formationList = [];
    this.listContinousManager = [];
    this.isContinous = false;
    if (!this.isUserAdmissionMember) {
      this.memberList = [];
      this.assignProgramForm.controls['dev_member'].patchValue('');
      this.filterFormCtrl.controls['devMember'].patchValue('');
    }
    this.formationList = [];
    this.assignProgramForm.controls['type_of_formation_id'].patchValue('');
    this.assignProgramForm.controls['speciality'].patchValue('');
    this.assignProgramForm.controls['continuous_formation_manager_id'].patchValue('');
    this.filterFormCtrl.controls['speciality'].patchValue('');
    this.filterFormCtrl.controls['type_of_formation_id'].patchValue('');
    this.filterFormCtrl.controls['continuous_formation_manager_id'].patchValue('');

    this.selectedSectorId = data;
    this.assignProgramForm.controls['sector'].patchValue(this.selectedSectorId);
    const filter = {
      scholar_season_id: this.selectedScholarId,
      school_id: [this.selectedSchoolId],
      campus: [this.selectedCampusId],
      level: [this.selectedLevelId],
      sector: [this.selectedSectorId],
    };
    this.subs.sink = this.candidateService.getAllProgramsToGetSpeciality(filter).subscribe(
      (res) => {
        const programsData = _.cloneDeep(res);
        const noneSpeciality = programsData.find((list) => !list?.speciality_id?._id);
        const listSpeciality = [];
        programsData.forEach((element) => {
          if (element?.speciality_id?._id) {
            listSpeciality.push(element?.speciality_id);
          }
        });
        console.log('_speciality', res, noneSpeciality, listSpeciality);
        if (noneSpeciality) {
          this.isDisplayNone = true;
        } else {
          this.isDisplayNone = false;
        }
        if (listSpeciality && listSpeciality?.length) {
          this.specialityList = listSpeciality;
          this.initFilter();
          this.isWaitingForResponse = false;
        } else {
          this.getTypeFormationDropdown(null);
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
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
    console.log('speciality list', this.specialityList);
  }

  getTypeFormationDropdown(data?) {
    console.log('speciality id', data);
    this.isWaitingForResponse = true;
    if (data) {
      if (data !== 'none') {
        this.selectedSpecialityId = data;
        this.assignProgramForm.controls['speciality'].patchValue(this.selectedSpecialityId);
      } else {
        this.selectedSpecialityId = null;
        this.assignProgramForm.controls['speciality'].patchValue(null);
      }
    }
    this.subs.sink = this.admissionEntrypointService.getAllTypeOfInformationByScholar(this.selectedScholarId).subscribe(
      (res) => {
        console.log('_speciality', res);
        if (res) {
          this.formationList = res.filter((type) => type.type_of_formation);
          this.initFilter();
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
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
    console.log('speciality list', this.specialityList);
  }

  displayWithType(value) {
    if (value) {
      const found = this.formationList.find((data) => data.type_of_formation.toLowerCase().trim().includes(value));
      if (found) {
        return this.translate.instant('type_formation.' + found.type_of_formation);
      } else {
        return value;
      }
    } else {
      return value;
    }
  }

  getDevMemberDropdown(data?) {
    // TODO : Fetch real data when there is api to get dev member
    console.log('FORMATION id', data);

    if (data.type_of_formation !== 'classic') {
      this.isContinous = true;
    } else {
      this.isContinous = false;
    }

    this.isWaitingForResponse = true;
    this.memberList = [];

    this.assignProgramForm.get('continuous_formation_manager_id').setValue('');
    this.filterFormCtrl.get('continuous_formation_manager_id').setValue('');

    // this.assignProgramForm.controls['dev_member'].patchValue('');
    // this.filterFormCtrl.controls['devMember'].patchValue('');

    if (!this.isUserAdmissionMember) {
      this.assignProgramForm.controls['dev_member'].patchValue('');
      this.filterFormCtrl.controls['devMember'].patchValue('');
    }
    if (data !== 'none') {
      this.selectedFormationId = data._id;
      this.assignProgramForm.controls['type_of_formation_id'].patchValue(this.selectedFormationId);
    } else {
      this.selectedFormationId = null;
      this.assignProgramForm.controls['type_of_formation_id'].patchValue(null);
    }
    const candidateSchool = this.assignProgramForm.controls['school'].value;
    const candidateCampus = this.assignProgramForm.controls['campus'].value;
    const candidateLevel = this.assignProgramForm.controls['level'].value;
    if (this.isUserAdmissionMember) {
      const member = {
        _id: this.currentUser._id,
        name:
          (this.currentUser.civility !== 'neutral' ? this.translate.instant(this.currentUser.civility) + ' ' : '') +
          this.currentUser.last_name.toUpperCase() +
          ' ' +
          this.currentUser.first_name,
      };
      this.memberList.push(member);
    }
    if (this.data.from !== 'readmission') {
      this.subs.sink = this.candidateService.getDevMemberDropdown('', '', '').subscribe(
        (res) => {
          console.log('_devMember', res);
          if (res) {
            const members = _.cloneDeep(res);
            members.forEach((member) => {
              if (member && member._id) {
                const obj = {
                  _id: member._id,
                  name:
                    (member.civility !== 'neutral' ? this.translate.instant(member.civility) + ' ' : '') +
                    member.last_name.toUpperCase() +
                    ' ' +
                    member.first_name,
                };
                this.memberList.push(obj);
              }
            });
            // this.memberList = res;
            this.isWaitingForResponse = false;
            this.initFilter();
            this.getContinuousFormationManagerList(candidateCampus, candidateSchool, candidateLevel);
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.userService.postErrorLog(err);
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
    } else {
      // console.log(candidateCampus, candidateSchool, candidateLevel);
      this.subs.sink = this.candidateService.getAcadMemberDropdown(candidateCampus, candidateSchool, candidateLevel).subscribe(
        (res) => {
          console.log('_devMember', res);
          if (res) {
            const members = _.cloneDeep(res);
            members.forEach((member) => {
              if (member && member._id) {
                const obj = {
                  _id: member._id,
                  name:
                    (member.civility !== 'neutral' ? this.translate.instant(member.civility) + ' ' : '') +
                    member.last_name.toUpperCase() +
                    ' ' +
                    member.first_name,
                };
                this.memberList.push(obj);
              }
            });
            // this.memberList = res;
            this.isWaitingForResponse = false;
            this.initFilter();
            this.getContinuousFormationManagerList(candidateCampus, candidateSchool, candidateLevel);
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.userService.postErrorLog(err);
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
    console.log('devMember list', this.memberList);
  }

  selectDevMember(data) {
    console.log('_devMember id', data);
    this.selectedMemberId = data;
    this.assignProgramForm.controls['dev_member'].patchValue(this.selectedMemberId);
  }

  checkProgram(school, campus, level, program) {
    if (campus) {
      campus = campus.slice(0, 3).toUpperCase();
    }
    if (school) {
      school = school.slice(0, 3).toUpperCase();
    }
    if (level) {
      level = level;
    }
    if (school) {
      program = school;
    }
    if (campus) {
      program = program + campus;
    }
    if (level) {
      program = program + ' ' + level;
    }
    return program;
  }

  checkFormValidity(): boolean {
    if (this.filterFormCtrl.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.filterFormCtrl.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  submit() {
    if (this.isContinous && !this.assignProgramForm.get('continuous_formation_manager_id').value) {
      this.filterFormCtrl.get('continuous_formation_manager_id').setValidators(Validators.required);
      this.filterFormCtrl.get('continuous_formation_manager_id').updateValueAndValidity();
      this.checkFormValidity();
    } else {
      this.filterFormCtrl.get('continuous_formation_manager_id').clearValidators();
      this.filterFormCtrl.get('continuous_formation_manager_id').updateValueAndValidity();
      if (this.checkFormValidity()) {
        return;
      }

      this.isWaitingForResponse = true;
      const program = this.checkProgram(
        this.filterFormCtrl.controls['school'].value,
        this.filterFormCtrl.controls['campus'].value,
        this.filterFormCtrl.controls['level'].value,
        '',
      );
      const payload = this.assignProgramForm.getRawValue();
      if (
        this.selectedSpecialityId === null ||
        payload.speciality === null ||
        this.selectedSpecialityId === undefined ||
        payload.speciality === ''
      ) {
        delete payload.speciality;
      }
      console.log('payload', payload, this.selectedSpecialityId);
      if (this.selectAll) {
        const candidates = this.countDocument;
        const type = true;
        this.swalOscarS2(type, candidates, program, payload);
      } else {
        const type = false;
        let candidate_ids = [];
        let candidate;
        this.candidateId.forEach((candidates) => {
          candidate_ids.push(candidates._id);
        });

        if (candidate_ids.length === 1) {
          candidate = this.candidateId[0].first_name + ' ' + this.candidateId[0].last_name;
          candidate_ids = _.uniqBy(candidate_ids);
          this.swalOscarS1(type, candidate, program, payload, candidate_ids);
        } else {
          candidate = candidate_ids.length;
          this.swalOscarS2(type, candidate, program, payload, candidate_ids);
        }
      }
    }
  }

  assignCandidateReadmission(type, payload, candidate_ids?) {
    let filter: any = null;
    let search: any = null;

    // console.log('hihihihi');

    if (this.filteredValues && this.filteredValues.crm_table && this.filteredValues.crm_table === 'oscar') {
      if (this.data.from !== 'readmission') {
        filter = {
          source_type: this.filteredValues && this.filteredValues.source_type ? this.filteredValues.source_type : null,
          crm_table: this.filteredValues && this.filteredValues.crm_table ? this.filteredValues.crm_table : null,
          program_desired:
            this.filteredValues && Array.isArray(this.filteredValues.program_desired) ? this.filteredValues.program_desired : [],
          trial_date: this.filteredValues && Array.isArray(this.filteredValues.trial_date) ? this.filteredValues.trial_date : [],
          oscar_campus_tenant_key:
            this.filteredValues && Array.isArray(this.filteredValues.oscar_campus_tenant_key)
              ? this.filteredValues.oscar_campus_tenant_key
              : [],
        };
      } else {
        filter = {
          source_type: this.filteredValues && this.filteredValues.source_type ? this.filteredValues.source_type : null,
          program_desired:
            this.filteredValues && Array.isArray(this.filteredValues.program_desired) ? this.filteredValues.program_desired : [],
          trial_date: this.filteredValues && Array.isArray(this.filteredValues.trial_date) ? this.filteredValues.trial_date : [],
          oscar_campus_tenant_key:
            this.filteredValues && Array.isArray(this.filteredValues.oscar_campus_tenant_key)
              ? this.filteredValues.oscar_campus_tenant_key
              : [],
        };
      }

      search = {
        name: this.filteredValues && this.filteredValues.name ? this.filteredValues.name : '',
        telephone: this.filteredValues && this.filteredValues.telephone ? this.filteredValues.telephone : '',
        email: this.filteredValues && this.filteredValues.email ? this.filteredValues.email : '',
        date_added: this.filteredValues && this.filteredValues.date_added ? this.filteredValues.date_added : '',
        program_desired:
          this.filteredValues && !Array.isArray(this.filteredValues.program_desired) ? this.filteredValues.program_desired : '',
        trial_date: this.filteredValues && !Array.isArray(this.filteredValues.trial_date) ? this.filteredValues.trial_date : '',
      };
    }

    if (this.filteredValues && this.filteredValues.crm_table && this.filteredValues.crm_table === 'hubspot') {
      if (this.data.from !== 'readmission') {
        filter = {
          crm_table: this.filteredValues && this.filteredValues.crm_table ? this.filteredValues.crm_table : null,
          schools:
            this.filteredValues && this.filteredValues.school && this.filteredValues.school.length > 0 ? this.filteredValues.school : [],
          campuses:
            this.filteredValues && this.filteredValues.campus && this.filteredValues.campus.length > 0 ? this.filteredValues.campus : [],
          levels: this.filteredValues && this.filteredValues.level && this.filteredValues.level.length > 0 ? this.filteredValues.level : [],
        };
      } else {
        filter = {
          scholar_season:
            this.filteredValues && this.filteredValues.scholar_season && this.filteredValues.scholar_season.length > 0
              ? this.filteredValues.scholar_season
              : null,
          schools:
            this.filteredValues && this.filteredValues.school && this.filteredValues.school.length > 0 ? this.filteredValues.school : [],
          campuses:
            this.filteredValues && this.filteredValues.campus && this.filteredValues.campus.length > 0 ? this.filteredValues.campus : [],
          levels: this.filteredValues && this.filteredValues.level && this.filteredValues.level.length > 0 ? this.filteredValues.level : [],
          candidate: this.filteredValues && this.filteredValues.candidate ? this.filteredValues.candidate : null,
          candidate_unique_number:
            this.filteredValues && this.filteredValues.candidate_unique_number ? this.filteredValues.candidate_unique_number : null,
          candidate_admission_statuses:
            this.filteredValues && this.filteredValues.candidate_admission_statuses ? this.filteredValues.candidate_admission_statuses : [],
          initial_intake_channel:
            this.filteredValues && this.filteredValues.initial_intake_channel ? this.filteredValues.initial_intake_channel : null,
          intake_channel_name:
            this.filteredValues && this.filteredValues.intake_channel_name ? this.filteredValues.intake_channel_name : null,
          type_of_formation: this.filteredValues && this.filteredValues.type_of_formation ? this.filteredValues.type_of_formation : null,
          financial_situation:
            this.filteredValues && this.filteredValues.financial_situation ? this.filteredValues.financial_situation : null,
          jury_decision: this.filteredValues && this.filteredValues.jury_decision ? this.filteredValues.jury_decision : null,
          readmission_program_desired:
            this.filteredValues && this.filteredValues.programs_desired ? this.filteredValues.programs_desired : null,
          sectors:
            this.filteredValues && this.filteredValues.sectors && this.filteredValues.sectors.length > 0 ? this.filteredValues.sectors : [],
          specialities:
            this.filteredValues && this.filteredValues.specialities && this.filteredValues.specialities.length > 0
              ? this.filteredValues.specialities
              : [],
        };
      }

      search = {
        name: this.filteredValues && this.filteredValues.name ? this.filteredValues.name : '',
        telephone: this.filteredValues && this.filteredValues.telephone ? this.filteredValues.telephone : '',
        email: this.filteredValues && this.filteredValues.email ? this.filteredValues.email : '',
        date_added: this.filteredValues && this.filteredValues.date_added ? this.filteredValues.date_added : '',
        program_desired: this.filteredValues && this.filteredValues.program_desired ? this.filteredValues.program_desired : '',
        trial_date: this.filteredValues && this.filteredValues.trial_date ? this.filteredValues.trial_date : '',
      };
    }

    // for parameter
    // console.log('_type', type);
    // console.log('_payload', payload);
    // console.log('_filter', filter);
    // console.log('_search', search);
    // console.log('_candidate_ids', candidate_ids);

    this.isWaitingForResponse = true;

    this.subs.sink = this.candidateService.AssignProgramToCandidate(type, payload, filter, search, candidate_ids, true).subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: 'Bravo!',
            confirmButtonText: 'OK',
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            console.log('select type All');
            this.dialogRef.close('select type All');
          });
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
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
          this.handleError(err);
        }
      },
    );
  }

  assignCandidate(type, payload, candidate_ids?) {
    console.log('hahahah');
    let filter: any = null;
    let search: any = null;

    if (this.filteredValues && this.filteredValues.crm_table && this.filteredValues.crm_table === 'oscar') {
      if (this.data.from !== 'readmission') {
        filter = {
          source_type: this.filteredValues && this.filteredValues.source_type ? this.filteredValues.source_type : null,
          crm_table: this.filteredValues && this.filteredValues.crm_table ? this.filteredValues.crm_table : null,
          program_desired:
            this.filteredValues && Array.isArray(this.filteredValues.program_desired) ? this.filteredValues.program_desired : [],
          trial_date: this.filteredValues && Array.isArray(this.filteredValues.trial_date) ? this.filteredValues.trial_date : [],
          oscar_campus_tenant_key:
            this.filteredValues && Array.isArray(this.filteredValues.oscar_campus_tenant_key)
              ? this.filteredValues.oscar_campus_tenant_key
              : [],
        };
      } else {
        filter = {
          source_type: this.filteredValues && this.filteredValues.source_type ? this.filteredValues.source_type : null,
          program_desired:
            this.filteredValues && Array.isArray(this.filteredValues.program_desired) ? this.filteredValues.program_desired : [],
          trial_date: this.filteredValues && Array.isArray(this.filteredValues.trial_date) ? this.filteredValues.trial_date : [],
          oscar_campus_tenant_key:
            this.filteredValues && Array.isArray(this.filteredValues.oscar_campus_tenant_key)
              ? this.filteredValues.oscar_campus_tenant_key
              : [],
        };
      }

      search = {
        name: this.filteredValues && this.filteredValues.name ? this.filteredValues.name : '',
        telephone: this.filteredValues && this.filteredValues.telephone ? this.filteredValues.telephone : '',
        email: this.filteredValues && this.filteredValues.email ? this.filteredValues.email : '',
        date_added: this.filteredValues && this.filteredValues.date_added ? this.filteredValues.date_added : '',
        program_desired:
          this.filteredValues && !Array.isArray(this.filteredValues.program_desired) ? this.filteredValues.program_desired : '',
        trial_date: this.filteredValues && !Array.isArray(this.filteredValues.trial_date) ? this.filteredValues.trial_date : '',
      };
    }

    if (this.filteredValues && this.filteredValues.crm_table && this.filteredValues.crm_table === 'hubspot') {
      if (this.data.from !== 'readmission') {
        filter = {
          crm_table: this.filteredValues && this.filteredValues.crm_table ? this.filteredValues.crm_table : null,
          schools:
            this.filteredValues && this.filteredValues.school && this.filteredValues.school.length > 0 ? this.filteredValues.school : [],
          campuses:
            this.filteredValues && this.filteredValues.campus && this.filteredValues.campus.length > 0 ? this.filteredValues.campus : [],
          levels: this.filteredValues && this.filteredValues.level && this.filteredValues.level.length > 0 ? this.filteredValues.level : [],
        };
      } else {
        filter = {
          schools:
            this.filteredValues && this.filteredValues.school && this.filteredValues.school.length > 0 ? this.filteredValues.school : [],
          campuses:
            this.filteredValues && this.filteredValues.campus && this.filteredValues.campus.length > 0 ? this.filteredValues.campus : [],
          levels: this.filteredValues && this.filteredValues.level && this.filteredValues.level.length > 0 ? this.filteredValues.level : [],
        };
      }

      search = {
        name: this.filteredValues && this.filteredValues.name ? this.filteredValues.name : '',
        telephone: this.filteredValues && this.filteredValues.telephone ? this.filteredValues.telephone : '',
        email: this.filteredValues && this.filteredValues.email ? this.filteredValues.email : '',
        date_added: this.filteredValues && this.filteredValues.date_added ? this.filteredValues.date_added : '',
        program_desired: this.filteredValues && this.filteredValues.program_desired ? this.filteredValues.program_desired : '',
        trial_date: this.filteredValues && this.filteredValues.trial_date ? this.filteredValues.trial_date : '',
      };
    }

    this.isWaitingForResponse = true;
    this.subs.sink = this.candidateService.AssignProgramToCandidate(type, payload, filter, search, candidate_ids, false).subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: 'Bravo!',
            confirmButtonText: 'OK',
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            console.log('select type All');
            this.dialogRef.close('select type All');
          });
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
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
          this.handleError(err);
        }
      },
    );
  }

  swalOscarS1(type, candidate, program, payload, candidate_ids) {
    let timeDisabled = 3;
    Swal.fire({
      type: 'question',
      title: this.translate.instant('Oscar_S1.Title'),
      html: this.translate.instant('Oscar_S1.Text', { candidate: candidate, program: program }),
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('Oscar_S1.Button 1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('Oscar_S1.Button 2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        this.intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('Oscar_S1.Button 1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('Oscar_S1.Button 1');
          Swal.enableConfirmButton();
          clearInterval(this.intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      this.isWaitingForResponse = false;
      if (res.value) {
        if (this.data.from === 'crm') {
          this.assignCandidate(type, payload, candidate_ids);
        } else {
          this.assignCandidateReadmission(type, payload, candidate_ids);
        }
      }
    });
  }

  swalOscarS2(type, candidate, program, payload, candidate_ids?) {
    let timeDisabled = 3;
    Swal.fire({
      type: 'question',
      title: this.translate.instant('Oscar_S2.Title'),
      html: this.translate.instant('Oscar_S2.Text', { totalCandidate: candidate, program: program }),
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('Oscar_S2.Button 1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('Oscar_S2.Button 2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        this.intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('Oscar_S2.Button 1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('Oscar_S2.Button 1');
          Swal.enableConfirmButton();
          clearInterval(this.intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      this.isWaitingForResponse = false;
      if (res.value) {
        if (candidate_ids) {
          if (this.data.from === 'crm') {
            this.assignCandidate(type, payload, candidate_ids);
          } else {
            this.assignCandidateReadmission(type, payload, candidate_ids);
          }
        } else {
          if (this.data.from === 'crm') {
            this.assignCandidate(type, payload);
          } else {
            this.assignCandidateReadmission(type, payload);
          }
        }
      }
    });
  }

  handleError(err) {
    if (err['message'] === 'GraphQL error: some candidate already have program') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('OSCAR_S4.TITLE'),
        html: this.translate.instant('OSCAR_S4.TEXT'),
        confirmButtonText: this.translate.instant('OSCAR_S4.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then(() => {
        this.dialogRef.close('select type All');
      });
    } else if (err['message'] === 'GraphQL error: cannot assign the same program with the current program') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('TransferSameProgram.Title'),
        text: this.translate.instant('TransferSameProgram.Text'),
        confirmButtonText: this.translate.instant('TransferSameProgram.Button'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then(() => {});
    } else if (err['message'] === 'GraphQL error: Exceed the maximum limit of 300 students') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('ReAdmission_S4.Title'),
        text: this.translate.instant('ReAdmission_S4.Text'),
        confirmButtonText: this.translate.instant('ReAdmission_S4.Button'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then(() => {
        this.dialogRef.close('select type All');
      });
    } else if (err['message'] === 'GraphQL error: Legal Entity not found!') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('OSCAR_S3.TITLE'),
        text: this.translate.instant('OSCAR_S3.TEXT'),
        confirmButtonText: this.translate.instant('OSCAR_S3.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then(() => {
        this.dialogRef.close('select type All');
      });
    } else if (err['message'] === 'GraphQL error: Program not found!') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Oscar_S5.TITLE'),
        text: this.translate.instant('Oscar_S5.TEXT'),
        confirmButtonText: this.translate.instant('Oscar_S5.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then(() => {
        this.dialogRef.close('select type All');
      });
    } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
        this.dialogRef.close('select type All');
      });
    }
  }

  getContinuousFormationManagerList(candidateCampus, candidateSchool, candidateLevel) {
    // query to get list of user with type continous formation manager
    const userType = ['61ceb560688f572138e023b2'];
    this.subs.sink = this.candidateService
      .getUserContinuousFormationManager(userType, candidateCampus, candidateSchool, candidateLevel)
      .subscribe(
        (res) => {
          if (res) {
            this.listContinousManager = res;
            this.filteredManager = this.filterFormCtrl.get('continuous_formation_manager_id').valueChanges.pipe(
              startWith(''),
              map((searchText) =>
                this.listContinousManager.filter((data) =>
                  data ? data.first_name.toLowerCase().includes(searchText.toString().toLowerCase()) : true,
                ),
              ),
            );
          }
        },
        (err) => {
          this.userService.postErrorLog(err);
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

  selectOptionContinousFormationManager(data) {
    this.assignProgramForm.get('continuous_formation_manager_id').patchValue(data._id);
    const name =
      (data.civility && data.civility === 'neutral' ? '' : this.translate.instant(data.civility)) +
      ' ' +
      data.first_name +
      ' ' +
      data.last_name;
    this.filterFormCtrl.get('continuous_formation_manager_id').patchValue(name);
  }
}
