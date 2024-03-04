import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormArray } from '@angular/forms';
import { UrgentMessageService } from 'app/service/urgent-message/urgent-message.service';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { UserService } from 'app/service/user/user.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { UsersService } from 'app/service/users/users.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FinancesService } from 'app/service/finance/finance.service';
import * as _ from 'lodash';

@Component({
  selector: 'ms-urgent-message-dialog',
  templateUrl: './urgent-message-dialog.component.html',
  styleUrls: ['./urgent-message-dialog.component.scss'],
})
export class UrgentMessageDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  urgentMessageForm: UntypedFormGroup;
  mailData: any;
  recpList: any;
  // users: any;
  // userTypes: any;
  // userList: any;
  currentUser: any;
  rncpTitles: any;
  userTypesList: any;
  userList: any;
  userRecipientList: any;
  rncpTitlesList: any;
  originalUserTypesList: any;
  originalUserList: any;
  originalRncpTitlesList: any;
  checked;
  isWaitingForResponse = false;
  isWaitingForResponseScholar = false;
  isWaitingForResponseSchool = false;
  isWaitingForResponseSector = false;
  isWaitingForResponseSpeciality = false;
  titleReady = false;
  userReady = false;
  userTypeReady = false;
  titles = [];
  autocompleteUsers = [];
  autocompleteUserTypes = [];
  filteredTitles: Observable<string[]>;
  filteredUsers: Observable<string[]>;
  filteredUserTypes: Observable<string[]>;
  selectedTitleId: string[] = [];
  selectedScholarSeasonId: string[] = [];
  selectedSchoolId: string[] = [];
  selectedLevelId: string[] = [];
  selectedCampusId: string[] = [];
  selectedSectorId: string[] = [];
  selectedSpecialityId: string[] = [];
  selectedUserTypeId: string[] = [];
  scholars: any[] = [];
  school: any[] = [];
  levels: any[] = [];
  campusList: any[] = [];
  sectorList: any[] = [];
  specialityList: any[] = [];
  listObjective: any[] = [];
  isPermission: string[];
  currentUserTypeId: any;
  realCampusList: any = [];
  originalListSectors: any = [];
  originalListSpeciality: any = [];
  isSelectAllCampus = false;
  isSelectAllLevel = false;
  isSelectAllSector = false;
  isSelectAllSpeciality = false;

  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<UrgentMessageDialogComponent>,
    private urgentMessageService: UrgentMessageService,
    private userService: UserService,
    private autService: AuthService,
    private rncpTitleService: RNCPTitlesService,
    private mailboxService: MailboxService,
    public translate: TranslateService,
    private financeService: FinancesService,
    private candidateService: CandidatesService,
  ) {}

  ngOnInit() {
    this.currentUser = this.autService.getLocalStorageUser();
    this.isPermission = this.autService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.initializeForm();
    this.currentUser = this.autService.getLocalStorageUser();
    this.getUserTypeList();
    this.getDataScholarSeasons();
    this.getDataForList();
    this.getDataForSectors();
  }

  getDataScholarSeasons() {
    this.isWaitingForResponseScholar = true;
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        this.isWaitingForResponseScholar = false;
        if (resp && resp.length) {
          this.scholars = resp;
        }
      },
      (err) => {
        this.autService.postErrorLog(err)
        this.isWaitingForResponseScholar = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getDataForList() {
    const name = '';
    this.subs.sink = this.candidateService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp) {
          this.listObjective = resp;
        }
      },
      (err) => {
        this.autService.postErrorLog(err)
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getDataCampus() {
    this.levels = [];
    this.campusList = [];
    this.realCampusList = [];
    this.sectorList = [];
    this.specialityList = [];
    this.urgentMessageForm.get('campuses').setValue(null);
    this.urgentMessageForm.get('levels').setValue(null);
    this.urgentMessageForm.get('sectors').setValue(null);
    this.urgentMessageForm.get('specialities').setValue(null);
    let school = this.urgentMessageForm.get('school_id').value;
    if (school && school.length && (school === 'ALL' || school === 'Tous')) {
      const scholarSeasonSelected = this.urgentMessageForm.get('scholar_season_id').value;
      let listSchoolsBasedOnScholarSeason;
      listSchoolsBasedOnScholarSeason = this.listObjective.filter((res) =>
        res.scholar_season_id.find((sch) => sch._id === scholarSeasonSelected),
      );
      const dataSchool = [];
      if (listSchoolsBasedOnScholarSeason.length > 0) {
        const dataTemp = listSchoolsBasedOnScholarSeason.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
        if (dataTemp.length > 0) {
          dataTemp.forEach((element) => {
            dataSchool.push(element._id);
          });
          this.urgentMessageForm.get('school_id').patchValue(dataSchool);
          const sCampusList = dataTemp;
          const optionAll = {
            _id: 'ALL',
            name: 'AllS',
          };
          this.campusList.push(optionAll);
          sCampusList.forEach((element) => {
            if (element && element.campuses && element.campuses.length) {
              element.campuses.forEach((campuses) => {
                this.campusList.push(campuses);
                this.realCampusList.push(campuses);
              });
            }
          });
          this.campusList = _.uniqBy(this.campusList, '_id');
        } else {
          this.campusList = [];
          this.realCampusList = [];
        }
      } else {
        this.campusList = [];
        this.realCampusList = [];
      }
    } else {
      school = _.cloneDeep(this.urgentMessageForm.get('school_id').value);
      const sSchools = this.listObjective.filter((list) => {
        return school.includes(list._id);
      });
      const optionAll = {
        _id: 'ALL',
        name: 'AllS',
      };
      this.campusList.push(optionAll);
      sSchools.filter((campus, n) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses, nex) => {
            this.campusList.push(campuses);
            this.realCampusList.push(campuses);
          });
        }
      });
      this.campusList = _.uniqBy(this.campusList, '_id');
    }
  }

  getDataSchool() {
    this.urgentMessageForm.get('school_id').setValue(null);
    this.urgentMessageForm.get('campuses').setValue(null);
    this.urgentMessageForm.get('levels').setValue(null);
    this.urgentMessageForm.get('sectors').setValue(null);
    this.urgentMessageForm.get('specialities').setValue(null);
    this.school = [];
    this.campusList = [];
    this.levels = [];
    this.specialityList = [];
    this.sectorList = [];
    const scholarSeasonIdSelected = this.urgentMessageForm.get('scholar_season_id').value;
    // Filter listobjective list and find scholar season that had been selected
    const sSchools = this.listObjective.filter((res) => res.scholar_season_id.find((sch) => sch._id === scholarSeasonIdSelected));
    if (sSchools.length > 0) {
      this.school.push(...sSchools);
    } else {
      this.school = [];
    }
  }

  getDataLevel(type) {
    this.levels = [];
    this.urgentMessageForm.get('levels').setValue(null);
    this.urgentMessageForm.get('sectors').setValue(null);
    this.urgentMessageForm.get('specialities').setValue(null);
    let sCampus = _.cloneDeep(this.urgentMessageForm.get('campuses').value);
    const ssCampus = sCampus.filter((list) => list === 'ALL' || list === 'Tous');
    if (ssCampus && ssCampus.length && (ssCampus[0] === 'ALL' || ssCampus[0] === 'Tous')) {
      const dataCampus = [];
      const dataTemp = this.realCampusList.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
      dataTemp.forEach((element) => {
        dataCampus.push(element._id);
      });
      this.urgentMessageForm.get('campuses').patchValue(['ALL', ...dataCampus]);
      const sLevelList = dataTemp;
      const optionAll = {
        _id: 'ALL',
        name: 'AllS',
      };
      this.levels.push(optionAll);
      sLevelList.forEach((element) => {
        if (element && element.levels && element.levels.length) {
          element.levels.forEach((level) => {
            this.levels.push(level);
          });
        }
      });
      this.levels = _.uniqBy(this.levels, '_id');
    } else {
      sCampus = _.cloneDeep(this.urgentMessageForm.get('campuses').value);
      if (sCampus && sCampus.length) {
        const sLevelList = this.realCampusList.filter((list) => {
          return sCampus.includes(list._id);
        });
        const optionAll = {
          _id: 'ALL',
          name: 'AllS',
        };
        this.levels.push(optionAll);
        sLevelList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
            });
          }
        });
        this.levels = _.uniqBy(this.levels, '_id');
      } else {
        this.levels = [];
      }
    }
    if (sCampus && sCampus.length && (sCampus.includes('ALL') || sCampus.includes('Tous'))) {
      this.isSelectAllCampus = true;
      if (!this.isSelectAllCampus) {
        const dataTemps = sCampus.filter((list) => list !== 'ALL' && list !== 'Tous');
        this.urgentMessageForm.get('campuses').setValue(dataTemps);
      } else if (
        type &&
        type.value &&
        type.value.length &&
        (type.value.includes('ALL') || type.value.includes('Tous')) &&
        type.value.length === this.realCampusList.length
      ) {
        const dataTemps = sCampus.filter((list) => list !== 'ALL' && list !== 'Tous');
        this.urgentMessageForm.get('campuses').setValue(dataTemps);
      }
    } else {
      if (this.realCampusList.length !== 1 && this.realCampusList.length === sCampus.length) {
        if (this.isSelectAllCampus) {
          this.isSelectAllCampus = false;
        }
      }
    }
  }

  clickCampus(type) {
    const sCampus = _.cloneDeep(this.urgentMessageForm.get('campuses').value);
    if (type === 'ALL' && this.realCampusList.length === sCampus.length) {
      this.isSelectAllCampus = false;
      this.urgentMessageForm.get('campuses').setValue(null);
    }
  }
  clickLevel(type) {
    const sLevels = _.cloneDeep(this.urgentMessageForm.get('levels').value);
    const dataTemps = this.levels.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
    if (type === 'ALL' && dataTemps.length === sLevels.length) {
      this.isSelectAllLevel = false;
      this.urgentMessageForm.get('levels').setValue(null);
    }
  }
  clickSector(type) {
    const sSectors = _.cloneDeep(this.urgentMessageForm.get('sectors').value);
    const dataTemps = this.sectorList.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
    if (type === 'ALL' && dataTemps.length === sSectors.length) {
      this.isSelectAllSector = false;
      this.urgentMessageForm.get('sectors').setValue(null);
    }
  }
  clickSpeciality(type) {
    const sSpecialities = _.cloneDeep(this.urgentMessageForm.get('specialities').value);
    const dataTemps = this.specialityList.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
    if (type === 'ALL' && dataTemps.length === sSpecialities.length) {
      this.isSelectAllSpeciality = false;
      this.urgentMessageForm.get('specialities').setValue(null);
    }
  }

  getDataForSectors() {
    this.isWaitingForResponseSector = true;
    this.subs.sink = this.financeService.GetAllSectorsDropdownWithoutFilter().subscribe(
      (res) => {
        this.isWaitingForResponseSector = false;
        if (res) {
          this.originalListSectors = res.map((data) => {
            const school = data.school_id.map((sch) => sch._id);
            const campus = data.campus_id.map((cam) => cam._id);
            const level = data.level_id.map((lvl) => lvl._id);
            const scholar_season_id = data && data.scholar_season_id && data.scholar_season_id._id ? data.scholar_season_id._id : null;
            return {
              _id: data._id,
              name: data.name,
              school_id: school,
              level_id: level,
              campus_id: campus,
              scholar_season_id: scholar_season_id,
            };
          });
        }
      },
      (err) => {
        this.autService.postErrorLog(err)
        this.isWaitingForResponseSector = false;
        this.originalListSectors = [];
      },
    );
  }

  getSectors(type) {
    this.urgentMessageForm.get('sectors').setValue(null);
    this.urgentMessageForm.get('specialities').setValue(null);
    this.sectorList = [];

    const sLevel = _.cloneDeep(this.urgentMessageForm.get('levels').value);
    const ssLevel = sLevel.filter((list) => list === 'ALL' || list === 'Tous');
    if (ssLevel && ssLevel.length && (ssLevel[0] === 'ALL' || ssLevel[0] === 'Tous')) {
      const dataLevel = [];
      const dataTemp = this.levels.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
      dataTemp.forEach((element) => {
        dataLevel.push(element._id);
      });
      this.urgentMessageForm.get('levels').patchValue(['ALL', ...dataLevel]);
    }
    if (sLevel && sLevel.length && (sLevel.includes('ALL') || sLevel.includes('Tous'))) {
      this.isSelectAllLevel = !this.isSelectAllLevel;
      if (!this.isSelectAllLevel) {
        const dataTemps = sLevel.filter((list) => list !== 'ALL' && list !== 'Tous');
        this.urgentMessageForm.get('levels').setValue(dataTemps);
      }
    } else {
      this.isSelectAllLevel = false;
    }

    const scholarSeason = this.urgentMessageForm.get('scholar_season_id').value;

    const campuses = this.urgentMessageForm.get('campuses').value;
    const levels = this.urgentMessageForm.get('levels').value;
    const filter = {
      scholar_season_id: scholarSeason,
      candidate_school_ids: this.urgentMessageForm.get('school_id').value,
      campuses: campuses && campuses.length ? campuses.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
      levels: levels && levels.length ? levels.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
    };

    const optionAll = {
      _id: 'ALL',
      name: 'AllS',
    };

    if (this.originalListSectors.length > 0) {
      let listOriginal = this.originalListSectors.filter((sec) => {
        const school = sec.school_id.includes(filter.candidate_school_ids) ? filter.candidate_school_ids : null;
        const campus = filter.campuses.some((camp) => sec.campus_id && sec.campus_id.includes(camp));
        const level = filter.levels.some((lvl) => sec.level_id.includes(lvl));
        const scholar_season_id = filter.scholar_season_id === sec.scholar_season_id;
        if (school && campus && level && scholar_season_id) {
          return sec;
        }
      });

      if (listOriginal.length > 0) {
        this.sectorList.push(optionAll);
        listOriginal = listOriginal.map((list) => {
          return {
            _id: list._id,
            name: list.name,
          };
        });
        listOriginal.forEach((element) => {
          this.sectorList.push(element);
        });
      } else {
        this.sectorList = [];
      }
    } else {
      this.sectorList = [];
    }
  }

  getSpeciality(type) {
    this.urgentMessageForm.get('specialities').setValue(null);
    this.specialityList = [];

    const sSectors = _.cloneDeep(this.urgentMessageForm.get('sectors').value);
    const ssSectors = sSectors.filter((list) => list === 'ALL' || list === 'Tous');
    if (ssSectors && ssSectors.length && (ssSectors[0] === 'ALL' || ssSectors[0] === 'Tous')) {
      const dataSectors = [];
      const dataTemp = this.sectorList.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
      dataTemp.forEach((element) => {
        dataSectors.push(element._id);
      });
      this.urgentMessageForm.get('sectors').patchValue(['ALL', ...dataSectors]);
    }
    if (sSectors && sSectors.length && (sSectors.includes('ALL') || sSectors.includes('Tous'))) {
      this.isSelectAllSector = !this.isSelectAllSector;
      if (!this.isSelectAllSector) {
        const dataTemps = sSectors.filter((list) => list !== 'ALL' && list !== 'Tous');
        this.urgentMessageForm.get('sectors').setValue(dataTemps);
      }
    } else {
      this.isSelectAllSector = false;
    }

    const scholarSeason = this.urgentMessageForm.get('scholar_season_id').value;
    const campuses = this.urgentMessageForm.get('campuses').value;
    const levels = this.urgentMessageForm.get('levels').value;
    const sectors = this.urgentMessageForm.get('sectors').value;
    const speciality = this.urgentMessageForm.get('specialities').value;
    const filter = {
      scholar_season_id: scholarSeason,
      candidate_school_ids: this.urgentMessageForm.get('school_id').value,
      campuses: campuses && campuses.length ? campuses.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
      levels: levels && levels.length ? levels.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
      sectors: sectors && sectors.length ? sectors.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
    };

    this.selectedSpeciality('');
    const optionAll = {
      _id: 'ALL',
      name: 'AllS',
    };
    this.isWaitingForResponseSector = true;
    this.subs.sink = this.candidateService.GetAllSpecializationsByScholar(filter).subscribe(
      (res) => {
        this.isWaitingForResponseSector = false;
        if (res) {
          this.originalListSpeciality = _.cloneDeep(res);
          if (this.originalListSpeciality.length > 0) {
            this.specialityList = [];
            let listOriginal = this.originalListSpeciality;
            if (listOriginal.length > 0) {
              this.specialityList.push(optionAll);
              listOriginal = listOriginal.map((list) => {
                return {
                  _id: list._id,
                  name: list.name,
                };
              });
              listOriginal.forEach((element) => {
                this.specialityList.push(element);
              });
            } else {
              this.specialityList = [];
            }
          } else {
            this.specialityList = [];
          }
        }
      },
      (err) => {
        this.isWaitingForResponseSector = false;
        this.specialityList = [];
        this.autService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  selectSpeciality(type) {
    let speciality = this.urgentMessageForm.get('specialities').value;
    if (type === 'None') {
      if (speciality && speciality.length < 1) {
        this.urgentMessageForm.get('specialities').setValue(null);
      } else {
        this.urgentMessageForm.get('specialities').setValue(['None']);
      }
    } else {
      if (speciality && speciality.length) {
        speciality = speciality.filter((list) => list !== 'None');
        this.urgentMessageForm.get('specialities').setValue(speciality);
      }
    }
  }

  getUserList() {
    const school_id = this.urgentMessageForm.get('school_id').value;
    const campuses = this.urgentMessageForm.get('campuses').value;
    const levels = this.urgentMessageForm.get('levels').value;
    const sectors = this.urgentMessageForm.get('sectors').value;
    const speciality = this.urgentMessageForm.get('specialities').value;
    const filter = {
      candidate_school_ids: this.urgentMessageForm.get('school_id').value,
      campuses: campuses && campuses.length ? campuses.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
      levels: levels && levels.length ? levels.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
      sectors: sectors && sectors.length ? sectors.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
    };
    this.userService.getUserEdh(school_id).subscribe(
      (resp) => {
        const dataUser = resp.filter((list) => {
          const camp =
            list.entities && list.entities.length
              ? list.entities.filter((fil) => fil.campus && filter.campuses.includes(fil.campus._id))
              : [];
          const level =
            list.entities && list.entities.length ? list.entities.filter((fil) => fil.level && filter.levels.includes(fil.level._id)) : [];
          return camp && camp.length && level && level.length;
        });
        this.userList = resp;
        this.originalUserList = resp;
        this.subs.sink = this.urgentMessageForm
          .get('users')
          .valueChanges.pipe(debounceTime(400))
          .subscribe((searchString) => {
            this.userList = this.originalUserList.filter((com) =>
              com.last_name
                .toLowerCase()
                .trim()
                .includes(searchString && searchString.length ? searchString.toLowerCase() : ''),
            );
          });
      },
      (err) => {
        this.autService.postErrorLog(err)
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  getUserTypeList() {
    this.subs.sink = this.userService.getUserTypesByEntityEdh().subscribe(
      (userTypes) => {
        this.userTypesList = userTypes;
        this.originalUserTypesList = userTypes;
        this.subs.sink = this.urgentMessageForm
          .get('userTypes')
          .valueChanges.pipe(debounceTime(400))
          .subscribe((searchString) => {
            this.userTypesList = this.originalUserTypesList.filter((com) =>
              com.name
                .toLowerCase()
                .trim()
                .includes(searchString && searchString.length ? searchString.toLowerCase() : ''),
            );
          });
      },
      (err) => {
        this.autService.postErrorLog(err)
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  selectedSpeciality(type) {
    this.userReady = false;
    const sSpeciality = _.cloneDeep(this.urgentMessageForm.get('specialities').value);
    if (sSpeciality && sSpeciality.length && (sSpeciality.includes('ALL') || sSpeciality.includes('Tous'))) {
      const dataSpeciality = [];
      const dataTemp = this.specialityList.filter((list) => list !== 'ALL' && list !== 'Tous');
      dataTemp.forEach((element) => {
        dataSpeciality.push(element._id);
      });
      this.urgentMessageForm.get('specialities').patchValue(['ALL', ...dataSpeciality]);
      this.isSelectAllSpeciality = !this.isSelectAllSpeciality;
      if (!this.isSelectAllSpeciality) {
        const dataTemps = sSpeciality.filter((list) => list !== 'ALL' && list !== 'Tous');
        this.urgentMessageForm.get('specialities').setValue(dataTemps);
      }
    } else {
      this.isSelectAllSpeciality = false;
    }
    if (!this.urgentMessageForm.get('categoryChecked').value) {
      this.getUserList();
    } else {
      const selectedUserType = this.urgentMessageForm.get('originalUserTypes').value;
      if (selectedUserType === '5fe98eeadb866c403defdc6c') {
        const campuses = this.urgentMessageForm.get('campuses').value;
        const levels = this.urgentMessageForm.get('levels').value;
        const sectors = this.urgentMessageForm.get('sectors').value;
        const speciality = this.urgentMessageForm.get('specialities').value;
        const filter = {
          school: this.urgentMessageForm.get('school_id').value,
          campuses: campuses && campuses.length ? campuses.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
          levels: levels && levels.length ? levels.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
        };
        this.userService.getAllCandidates(filter).subscribe((resp) => {
          this.userRecipientList = resp;
        }, (err) => {
          this.autService.postErrorLog(err)
        });
      } else {
        this.userService.getUserTypesByEntityEdh().subscribe((resp) => {
          this.userRecipientList = resp;
        }, (err) => {
          this.autService.postErrorLog(err)
        });
      }
    }
  }

  selectedUser(selectedUser) {
    this.userReady = false;
    this.urgentMessageForm.get('originalUser').setValue(selectedUser._id);
    this.urgentMessageForm.get('email').setValue(selectedUser.email);
  }

  selectedUserType(selectedUserType) {
    this.userReady = false;
    // if selected user type is student, call API getUserTypeStudent
    if (selectedUserType === '5fe98eeadb866c403defdc6c') {
      const campuses = this.urgentMessageForm.get('campuses').value;
      const levels = this.urgentMessageForm.get('levels').value;
      const sectors = this.urgentMessageForm.get('sectors').value;
      const speciality = this.urgentMessageForm.get('specialities').value;
      const filter = {
        school: this.urgentMessageForm.get('school_id').value,
        campuses: campuses && campuses.length ? campuses.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
        levels: levels && levels.length ? levels.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
      };
      this.userService.getAllCandidates(filter).subscribe((resp) => {
        this.userRecipientList = resp;
      }, (err) => {
        this.autService.postErrorLog(err)
      });
    } else {
      this.userService.getUserTypesByEntityEdh().subscribe((resp) => {
        this.userRecipientList = resp;
      }, (err) => {
        this.autService.postErrorLog(err)
      });
    }
    this.selectedUserTypeId = [selectedUserType];
  }

  initializeForm() {
    this.urgentMessageForm = this.fb.group({
      subject: ['', Validators.required],
      categoryChecked: [false, Validators.required],
      users: [[], Validators.required],
      originalUser: [''],
      userTypes: [[]],
      originalUserTypes: [''],
      message: ['', Validators.required],
      email: [''],
      school_id: [null, Validators.required],
      campuses: [null, Validators.required],
      scholar_season_id: [null, Validators.required],
      levels: [null, Validators.required],
      sectors: [null, Validators.required],
      specialities: [null],
    });
  }

  sendMessage(): void {
    if (this.urgentMessageForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
      this.urgentMessageForm.markAllAsTouched();
      return;
    }
    const formValues = this.urgentMessageForm.value;
    if (formValues.subject !== '' || (formValues.message !== '' && formValues.message !== undefined)) {
      const receiversArray = [];
      this.mailData = {};
      const recipient = this.userRecipientList;
      // let senderArray = {
      //   sender: this.currentUser.email,
      //   is_read: false,
      //   mail_type: 'sent',
      // };
      if (formValues.categoryChecked) {
        // recipient.forEach((element) => {
        //   receiversArray.push({ recipients: element.email, rank: 'a', is_read: false, mail_type: 'inbox' });
        // });
      } else {
        receiversArray.push({ recipients: formValues.email, rank: 'a', is_read: false, mail_type: 'inbox' });
        this.mailData.recipient_properties = receiversArray;
      }
      const MailAttachment = [];
      const MailAttachment1 = [];
      const campuses = this.urgentMessageForm.get('campuses').value;
      const levels = this.urgentMessageForm.get('levels').value;
      const sectors = this.urgentMessageForm.get('sectors').value;
      const speciality = this.urgentMessageForm.get('specialities').value;

      if (this.selectedUserTypeId && this.selectedUserTypeId.length) {
        this.mailData.user_type_selection = true;
        this.mailData.group_detail = {
          user_types: this.selectedUserTypeId,
          school_id: this.urgentMessageForm.get('school_id').value,
          campuses: campuses && campuses.length ? campuses.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
          scholar_season_id: this.urgentMessageForm.get('scholar_season_id').value,
          levels: levels && levels.length ? levels.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
          sectors: sectors && sectors.length ? sectors.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
          specialities:
            speciality && speciality.length ? speciality.filter((list) => list !== 'ALL' && list !== 'Tous' && list !== 'None') : [],
        };
      }
      this.mailData.sender_property = {
        sender: this.currentUser.email,
        is_read: false,
        mail_type: 'sent',
      };
      this.mailData.subject = formValues.subject;
      this.mailData.message = formValues.message;
      this.mailData.is_sent = true;
      this.mailData.status = 'active';
      this.mailData.is_urgent_mail = true;
      // this.mailData.is_urgent_mail = this.isUrgentFlag;
      this.mailData.tags = ['sent'];
      this.subs.sink = this.mailboxService.createMail(this.mailData).subscribe(
        (data: any) => {
          this.dialogRef.close();
          Swal.fire({
            title: this.translate.instant('URGENTMESSAGE_S1.TITLE'),
            html: this.translate.instant('URGENTMESSAGE_S1.TEXT'),
            allowEscapeKey: true,
            type: 'success',
            confirmButtonText: this.translate.instant('URGENTMESSAGE_S1.BUTTON'),
          });
        },
        (err) => {
          this.autService.postErrorLog(err);
          this.dialogRef.close();
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

  categoryChange(event) {
    // event.checked ? this.urgentMessageForm.controls['users'].setValue('') : this.urgentMessageForm.controls['userTypes'].setValue('');
    if (event.checked) {
      console.log('Check');
      this.urgentMessageForm.get('users').patchValue(null);
      this.urgentMessageForm.get('users').updateValueAndValidity();
      this.urgentMessageForm.get('users').clearValidators();
      this.urgentMessageForm.get('users').updateValueAndValidity();
      this.urgentMessageForm.get('userTypes').setValidators([Validators.required]);
      this.urgentMessageForm.get('userTypes').updateValueAndValidity();
    } else {
      console.log('Unceck');
      this.urgentMessageForm.get('userTypes').patchValue(null);
      this.urgentMessageForm.get('userTypes').updateValueAndValidity();
      this.urgentMessageForm.get('userTypes').clearValidators();
      this.urgentMessageForm.get('userTypes').updateValueAndValidity();
      this.urgentMessageForm.get('users').setValidators([Validators.required]);
      this.urgentMessageForm.get('users').updateValueAndValidity();
    }
  }
  keyupUser(event) {
    this.userReady = true;
  }
  keyupUserType(event) {
    this.userTypeReady = true;
  }
  keyupTitle(event) {
    this.titleReady = true;
  }

  valueChange(event) {
    if (event === 'title') {
      this.titleReady = false;
    } else if (event === 'user') {
      this.userReady = false;
    } else if (event === 'type') {
      this.userTypeReady = false;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
