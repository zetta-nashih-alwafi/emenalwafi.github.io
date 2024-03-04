import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { NgxPermissionsService } from 'ngx-permissions';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { TeacherManagementService } from 'app/service/teacher-management/teacher-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'ms-add-intervention-form',
  templateUrl: './add-intervention-form.component.html',
  styleUrls: ['./add-intervention-form.component.scss'],
})
export class AddInterventionFormComponent implements OnInit, OnDestroy {
  @ViewChild(NgSelectComponent) ngSelectComponent: NgSelectComponent;
  interventionForm: UntypedFormGroup;
  private subs = new SubSink();
  // *************** field dropdown
  originalScholar = [];
  scholars = [];
  campusList = [];
  listObjective = [];
  school = [];
  levels = [];
  levelListBackup = [];
  sectorList = [];
  specialityList = [];
  sequenceList = [];
  subjectList = [];
  typeInterventionList = [];
  originalTypeInterventionList = [];
  teacherList = [];

  // *************** field temp selected
  legalEntitySelected = null;
  levelIdSelected = null;
  campusIdSelected = null;
  isDisplayNone = false;

  // *************** field permission
  isDirectorAdmission = false;
  isPermission = null;
  currentUser = null;
  currentUserTypeId = null;
  isEdit = false;
  selectedTypeInterventionSet: Set<any>;
  initialForm = null;
  isWaitingForResponse = false;
  firstLoad = true;

  teacherSubjectId;

  constructor(
    private fb: UntypedFormBuilder,
    private pageTitleService: PageTitleService,
    private translate: TranslateService,
    private financeService: FinancesService,
    private authService: AuthService,
    private permissionsService: NgxPermissionsService,
    private candidatesService: CandidatesService,
    private courseSequenceService: CourseSequenceService,
    private utilService: UtilityService,
    private teacherService: TeacherManagementService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.queryParams.subscribe((query) => {
      this.isEdit = false;
      if (query?.teacherSubject) {
        this.isEdit = true;
        this.teacherSubjectId = query.teacherSubject;
        this.getOneTeacherSubject(this.teacherSubjectId);
      } else {
        this.getAllDropdown();
      }
    });
    this.onChangePageTitle();
    this.getPermission();
  }

  getPermission() {
    this.isPermission = this.authService.getPermission();
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.currentUser = this.authService.getLocalStorageUser();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
  }
  getOneTeacherSubject(id) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherService.getOneTeacherSubject(id).subscribe(
      (resp) => {
        if (resp) {
          let temp = _.cloneDeep(resp);
          temp.scholar_season_id = temp?.program_id?.scholar_season_id?._id;
          temp.school_id = temp?.program_id?.school_id?._id;
          temp.campus_id = temp?.program_id?.campus?.name;
          temp.level_id = temp?.program_id?.level?.name;
          temp.sector_id = temp?.program_id?.sector_id?._id;
          temp.speciality_id = temp?.program_id?.speciality_id?._id ? temp?.program_id?.speciality_id?._id : 'None';
          temp.legal_entity_id = temp?.type_of_intervention_id?.legal_entity_id?.legal_entity_name;
          this.legalEntitySelected = {
            _id: temp?.type_of_intervention_id?.legal_entity_id?._id,
            name: temp?.type_of_intervention_id?.legal_entity_id?.legal_entity_name,
          };
          temp.teacher_id = temp?.teacher_id?._id;

          temp.interventions = [
            {
              sequence_id: temp?.sequence_id?._id,
              subject_id: temp?.course_subject_id?._id,
              volume_hours: temp?.volume_hours_assigned,
              type_of_intervention_id: temp?.type_of_intervention_id?._id,
              type_of_contract: temp?.type_of_intervention_id?.type_of_contract,
              hourly_rate: temp?.type_of_intervention_id?.hourly_rate,
            },
          ];
          this.interventionForm.patchValue(temp);          
          this.getTeacherExistingLegalEntity();
          this.getAllDropdown();
          this.getDataForList(this.interventionForm.get('scholar_season_id').value, 'edit');
        } else {
          this.isWaitingForResponse = false;
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
        }
      },
    );
  }
  initForm() {
    this.interventionForm = this.fb.group({
      scholar_season_id: [null, Validators.required],
      school_id: [null, Validators.required],
      campus_id: [null, Validators.required],
      sector_id: [null, [Validators.required]],
      level_id: [null, [Validators.required]],
      speciality_id: [null, Validators.required],
      legal_entity_id: [null, Validators.required],
      teacher_id: [null, Validators.required],
      interventions: this.fb.array([]),
    });
    this.interventionsArray().push(this.newIntervention());
    this.initialForm = this.interventionForm.getRawValue();
  }

  newIntervention(): UntypedFormGroup {
    return this.fb.group({
      sequence_id: [null, Validators.required],
      subject_id: [null, Validators.required],
      volume_hours: [null, [Validators.required, Validators.pattern('^(?:\\d*(?:[.,]\\d{1,2})?|[.,]\\d{1,2})$')]],
      type_of_intervention_id: [null, Validators.required],
      type_of_contract: [null, Validators.required],
      hourly_rate: [null, [Validators.required, Validators.pattern('^(?:\\d*(?:[.,]\\d{1,2})?|[.,]\\d{1,2})$')]],
    });
  }

  interventionsArray(): UntypedFormArray {
    return this.interventionForm.get('interventions') as UntypedFormArray;
  }

  onChangePageTitle() {
    const name = this.teacherSubjectId ? this.translate.instant('Edit Intervention') : this.translate.instant('intervention');
    this.pageTitleService.setTitle(name);
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      const names = this.teacherSubjectId ? this.translate.instant('Edit Intervention') : this.translate.instant('intervention');
      this.pageTitleService.setTitle(names);

      //*************** call getDropdownTeacher reset translate civility
      if (this.legalEntitySelected) {
        this.getTeacherExistingLegalEntity();
      }
    });
  }

  getAllDropdown() {
    this.getDataScholarSeasons();
    this.getDataSequence();
    this.getDataSubject();
  }

  getDataScholarSeasons() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.originalScholar = _.cloneDeep(resp);
          this.scholars = [];
          this.scholars = this.originalScholar.sort((a, b) =>
            a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
          );
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err);
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
          });
        }
      },
    );
  }

  scholarSelect() {
    const scholarSeasonSelected = this.interventionForm.get('scholar_season_id').value;
    if (scholarSeasonSelected && scholarSeasonSelected !== 'None') {
      this.resetCascadeField('scholar_season');

      // *************** Call cascade school
      this.getDataForList(scholarSeasonSelected);
    } else if (scholarSeasonSelected === 'None') {
      this.resetCascadeField('scholar_season');
    }
  }

  getDataForList(data?, from?) {
    if (this.isDirectorAdmission) {
      const name =
        this.currentUser && this.currentUser.entities && this.currentUser.entities[0] ? this.currentUser.entities[0].candidate_school : '';
      this.isWaitingForResponse = true;
      this.subs.sink = this.candidatesService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe(
        (resp) => {
          if (resp) {
            if (
              this.currentUser &&
              this.currentUser.entities &&
              this.currentUser.entities.length &&
              this.currentUser.app_data &&
              this.currentUser.app_data.school_package &&
              this.currentUser.app_data.school_package.length
            ) {
              const schoolsList = [];
              this.currentUser.app_data.school_package.forEach((element) => {
                schoolsList.push(element.school);
              });
              this.listObjective = schoolsList;
              this.school = this.listObjective;
              this.school = this.school.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0));
            } else {
              this.listObjective = resp;
              this.school = this.listObjective;
              this.school = this.school.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0));
            }
            this.getDataCampus(from);
          }
          this.isWaitingForResponse = false;
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err);
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
            });
          }
        },
      );
    } else {
      const name = data ? data : '';
      const filter = { scholar_season_id: name };
      this.isWaitingForResponse = true;
      this.subs.sink = this.candidatesService.GetAllSchoolDropdown(filter, name, this.currentUserTypeId).subscribe(
        (resp) => {
          if (resp) {
            if (
              this.currentUser &&
              this.currentUser.entities &&
              this.currentUser.entities.length &&
              this.currentUser.app_data &&
              this.currentUser.app_data.school_package &&
              this.currentUser.app_data.school_package.length
            ) {
              const schoolsList = [];
              this.currentUser.app_data.school_package.forEach((element) => {
                schoolsList.push(element.school);
              });
              this.listObjective = schoolsList;
              this.school = this.listObjective;
              this.school = this.school.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0));
            } else {
              this.listObjective = resp;
              this.school = this.listObjective;
              this.school = this.school.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0));
            }
            if (from === 'edit') {
              this.getDataCampus(from);
            }
          }
          this.isWaitingForResponse = false;
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err);
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
            });
          }
        },
      );
    }
  }

  selectSchoolFilter() {
    const schoolSelected = this.interventionForm.get('school_id').value;
    if (schoolSelected && schoolSelected !== 'None') {
      this.resetCascadeField('school');

      // *************** Call cascade campus
      this.getDataCampus();
    } else if (schoolSelected === 'None') {
      const scholarSeasonSelected = this.interventionForm.get('scholar_season_id').value;
      if (scholarSeasonSelected) {
        this.resetCascadeField('scholar_season');

        // *************** Call cascade school
        this.getDataForList(scholarSeasonSelected);
      }
    }
  }

  getDataCampus(from?) {
    const school = [this.interventionForm.get('school_id').value];
    if (
      this.currentUser &&
      this.currentUser.entities &&
      this.currentUser.entities[0].campus &&
      this.interventionForm.get('school_id').value
    ) {
      if (
        this.currentUser &&
        this.currentUser.entities &&
        this.currentUser.entities.length &&
        this.currentUser.app_data &&
        this.currentUser.app_data.school_package &&
        this.currentUser.app_data.school_package.length &&
        this.interventionForm.get('school_id').value
      ) {
        this.currentUser.app_data.school_package.forEach((element) => {
          if (element && element.school && element.school._id && school.includes(element.school._id)) {
            this.campusList = _.concat(this.campusList, element.school.campuses);
          }
        });
      } else {
        this.currentUser.entities.forEach((element) => {
          this.listObjective.filter((campus, n) => {
            if (campus.campuses && campus.campuses.length) {
              campus.campuses.filter((campusData, nex) => {
                if (
                  campusData &&
                  element &&
                  element.campus &&
                  element.campus.name &&
                  campusData.name.toLowerCase() === element.campus.name.toLowerCase()
                ) {
                  this.campusList.push(campusData);
                }
              });
            }
          });
        });
      }
    } else {
      if (school && school.length) {
        const scampusList = this.listObjective.filter((list) => {
          return school.includes(list._id);
        });
        scampusList.filter((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.filter((campusData, nex) => {
              this.campusList.push(campusData);
            });
          }
        });
      } else if (this.listObjective && this.listObjective.length && school && school.length && school.includes('AllF')) {
        this.listObjective.filter((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.forEach((campusess, nex) => {
              this.campusList.push(campusess);
            });
          }
        });
      }
    }

    this.getDataLevel(from);
    const campuses = _.chain(this.campusList)
      .groupBy('name')
      .map((value, key) => ({
        name: key,
        _id: value && value.length ? value[0]._id : null,
        campuses: value,
      }))
      .value();
    if (campuses && campuses.length) {
      campuses.forEach((element, idx) => {
        let levelList = [];
        if (element && element.campuses && element.campuses.length) {
          element.campuses.forEach((camp, idCampx) => {
            levelList = _.concat(levelList, camp.levels);
          });
        }
        campuses[idx]['levels'] = _.uniqBy(levelList, 'name');
      });
    }
    this.campusList = _.uniqBy(campuses, '_id');
    this.campusList = this.campusList.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }

  selectCampusFilter() {
    const campusSelected = this.interventionForm.get('campus_id').value;
    if (campusSelected && campusSelected !== 'None') {
      // *************** reset except sequence, subjects, volume of hours , scholar season, school, campus field"
      this.resetCascadeField('campus');

      // *************** Call cascade level
      this.getDataLevel();
    } else if (campusSelected === 'None') {
      this.resetCascadeField('school');
      this.getDataCampus();
    }
  }

  getDataLevel(from?) {
    const schools = [this.interventionForm.get('school_id').value];
    const sCampus = [this.interventionForm.get('campus_id').value];

    if (
      this.currentUser &&
      this.currentUser.entities &&
      this.currentUser.entities.length &&
      this.currentUser.app_data &&
      this.currentUser.app_data.school_package &&
      this.currentUser.app_data.school_package.length &&
      this.interventionForm.get('campus_id').value &&
      this.interventionForm.get('school_id').value
    ) {
      if (sCampus && sCampus.length && this.campusList && this.campusList.length) {
        this.currentUser.app_data.school_package.forEach((element) => {
          if (element && element.school && element.school._id && schools.includes(element.school._id)) {
            const sLevelList = this.campusList.filter((list) => {
              return sCampus.includes(list.name);
            });
            sLevelList.forEach((lev) => {
              if (lev && lev.levels && lev.levels.length) {
                this.levels = _.concat(this.levels, lev.levels);
              }
            });
          }
        });
      } else if (sCampus && sCampus.length) {
        this.campusList.forEach((lev) => {
          if (lev && lev.levels && lev.levels.length) {
            this.levels = _.concat(this.levels, lev.levels);
          }
        });
      }
    } else {
      if (sCampus && sCampus.length) {
        const sLevelList = this.campusList.filter((list) => {
          return sCampus.includes(list.name);
        });
        sLevelList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
              this.levelListBackup = this.levels;
            });
          }
        });
      } else if (this.campusList && this.campusList.length && this.interventionForm.get('campus_id').value) {
        this.campusList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
            });
          }
        });
      }
    }
    this.levels = _.uniqBy(this.levels, 'name');
    this.levels = this.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
    if (from === 'edit') {
      this.getAllTypeOfIntervention();
      this.getAllLegalEntitiesByProgram(from);
      this.getAllSector();
      this.getAllSpeciality();
    }
  }

  selectLevelFilter() {
    const levelSelected = this.interventionForm.get('level_id').value;
    if (levelSelected && levelSelected !== 'None') {
      this.resetCascadeField('level');

      // *************** call cascade sector
      this.getAllSector();
    } else if (levelSelected === 'None') {
      this.resetCascadeField('campus');
      this.getDataLevel();
    }
  }

  getAllSector() {
    this.levels = _.uniqBy(this.levels, 'name');
    this.levels = this.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
    let campusIds = [];
    let levelIds = [];
    if (this.interventionForm.get('campus_id').value) {
      const campusName = [this.interventionForm.get('campus_id').value];
      campusIds = this.campusList.filter((campus) => campusName.includes(campus?.name))?.map((campus) => campus._id);
    }
    if (this.interventionForm.get('level_id').value) {
      const levelName = [this.interventionForm.get('level_id').value];
      levelIds = this.levels.filter((level) => levelName.includes(level.name))?.map((level) => level?._id);
    }
    const filter = {
      scholar_season_id: this.interventionForm.get('scholar_season_id').value ? this.interventionForm.get('scholar_season_id').value : null,
      candidate_school_ids: this.interventionForm.get('school_id').value ? [this.interventionForm.get('school_id').value] : null,
      campuses: campusIds?.length ? campusIds : null,
      levels: levelIds?.length ? levelIds : null,
    };
    if (this.interventionForm.get('level_id').value) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.financeService.GetAllSectorsDropdown(filter).subscribe(
        (resp) => {
          if (resp?.length) {
            this.sectorList = _.cloneDeep(resp);
          }
          this.isWaitingForResponse = false;
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
          }
        },
      );
    } else {
      this.isWaitingForResponse = false;
    }
  }

  selectSectorFilter() {
    const sectorSelected = this.interventionForm.get('sector_id').value;
    if (sectorSelected && sectorSelected !== 'None') {
      this.resetCascadeField('sector');

      // *************** call cascade speciality
      this.getAllSpeciality();
    } else if (sectorSelected === 'None') {
      this.resetCascadeField('level');
      this.getAllSector();
    }
  }

  getAllSpeciality() {
    let campusIds = [];
    let levelIds = [];
    if (this.interventionForm.get('campus_id').value) {
      const campusName = [this.interventionForm.get('campus_id').value];
      campusIds = this.campusList.filter((campus) => campusName.includes(campus?.name))?.map((campus) => campus._id);
      this.campusIdSelected = campusIds[0];
    }
    if (this.interventionForm.get('level_id').value) {
      const levelName = [this.interventionForm.get('level_id').value];
      levelIds = this.levels.filter((level) => levelName.includes(level.name))?.map((level) => level?._id);
      this.levelIdSelected = levelIds[0];
    }
    const filter = {
      scholar_season_id: this.interventionForm.get('scholar_season_id').value ? this.interventionForm.get('scholar_season_id').value : null,
      school_id: this.interventionForm.get('school_id').value ? [this.interventionForm.get('school_id').value] : null,
      campus: campusIds?.length ? campusIds : null,
      level: levelIds?.length ? levelIds : null,
      sector: this.interventionForm.get('sector_id').value ? [this.interventionForm.get('sector_id').value] : null,
    };
    if (this.interventionForm.get('sector_id').value) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.candidatesService.getAllProgramsToGetSpeciality(filter).subscribe(
        (resp) => {
          if (resp?.length) {
            const programsData = _.cloneDeep(resp);
            const noneSpeciality = programsData.find((list) => !list?.speciality_id?._id);
            programsData.forEach((element) => {
              if (element?.speciality_id?._id) {
                this.specialityList.push(element?.speciality_id);
              }
            });
            if (noneSpeciality) {
              this.isDisplayNone = true;
            } else {
              this.isDisplayNone = false;
            }
          }

          this.isWaitingForResponse = false;
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
          }
        },
      );
    }
  }

  selectSpecialityFilter() {
    const specialitySelected = this.interventionForm.get('speciality_id').value;
    if (specialitySelected) {
      this.resetCascadeField('speciality');

      // *************** call cascade legal entity by scholar season, school, campus, level, sector, speciality
      this.getAllLegalEntitiesByProgram();
    }
  }

  getAllLegalEntitiesByProgram(from?) {
    const filter = {
      scholar_season_id: this.interventionForm.get('scholar_season_id').value,
      school_id: this.interventionForm.get('school_id').value,
      campus_id: this.campusIdSelected,
      level_id: this.levelIdSelected,
      sector_id: this.interventionForm.get('sector_id').value,
      speciality_id: this.interventionForm.get('speciality_id').value !== 'None' ? this.interventionForm.get('speciality_id').value : null,
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherService.getAllLegalEntitiesDropdown(filter).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp?.length) {
          if (from !== 'edit') {
            this.legalEntitySelected = {
              _id: resp[0]?._id,
              name: resp[0]?.legal_entity_name,
            };
            this.interventionForm.get('legal_entity_id').patchValue(this.legalEntitySelected?.name);

            if (this.interventionForm.get('teacher_id').value) {
              this.interventionForm.get('teacher_id').patchValue(null);
            }

            this.teacherList = [];

            // *************** call all teacher exisitng on legal entity
            this.getTeacherExistingLegalEntity();
          }
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
      },
    );
  }

  getTeacherExistingLegalEntity() {
    this.isWaitingForResponse = true;
    const scholarSeasonSelected = this.interventionForm?.get('scholar_season_id')?.value ? this.interventionForm.get('scholar_season_id').value : '';
    this.subs.sink = this.teacherService.getAllTeacherFromLegalEntity(this.legalEntitySelected?._id, scholarSeasonSelected).subscribe(
      (resp) => {
        if (resp && resp.length) {
          const teacherTemp = _.cloneDeep(resp);
          const sortedTeacherData = _.sortBy(teacherTemp, 'last_name');
          this.teacherList = sortedTeacherData
            .map((teacher) => ({ ...teacher, name: this.formatNameDropdown(teacher) }))
            .map((teacher) => ({ _id: teacher?._id, name: teacher?.name }));
        }
        if(this.isEdit && this.firstLoad) {
          this.initialForm = this.interventionForm.getRawValue();
        }
        this.firstLoad = false;
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
      },
    );
  }

  formatNameDropdown(teacher) {
    return teacher?.civility !== 'neutral'
      ? teacher?.last_name?.toUpperCase() + ' ' + teacher?.first_name + ' ' + this.translate.instant(teacher?.civility?.toLowerCase())
      : teacher?.last_name + ' ' + teacher?.first_name;
  }

  selectTeacherExisting() {
    const teacherSelected = this.interventionForm.get('teacher_id').value;
    if (teacherSelected && teacherSelected !== 'None') {
      this.resetCascadeField('teacher');

      // *************** call cascade type of intervention by legal_entity_id, teacher_id, scholar_season_id speciality
      this.getAllTypeOfIntervention();
    } else if (teacherSelected === 'None') {
      this.resetCascadeField('speciality');
      this.getAllLegalEntitiesByProgram();
    }
  }

  getDataSequence() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.courseSequenceService.getAllSequenceDropdown().subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.sequenceList = _.cloneDeep(resp);
        this.sequenceList = this.sequenceList.sort((groupA, groupB) => {
          if (this.utilService.simplifyRegex(groupA.name) < this.utilService.simplifyRegex(groupB.name)) {
            return -1;
          } else if (this.utilService.simplifyRegex(groupA.name) > this.utilService.simplifyRegex(groupB.name)) {
            return 1;
          } else {
            return 0;
          }
        });
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
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
        }
      },
    );
  }

  getDataSubject() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.courseSequenceService.getAllCourseSubjectDropdown().subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.subjectList = _.cloneDeep(resp);
        this.subjectList = this.subjectList.sort((groupA, groupB) => {
          if (this.utilService.simplifyRegex(groupA.name) < this.utilService.simplifyRegex(groupB.name)) {
            return -1;
          } else if (this.utilService.simplifyRegex(groupA.name) > this.utilService.simplifyRegex(groupB.name)) {
            return 1;
          } else {
            return 0;
          }
        });
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
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
        }
      },
    );
  }

  decimalFilter(event: any) {
    const reg = /^-?\d*[.,]?\d{0,2}$/;
    let input = event.target.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

  addIntervention() {
    this.interventionsArray().push(this.newIntervention());
    this.filterTypeInterventionSelected();
  }

  removeIntervention(index: number) {
    this.interventionsArray().removeAt(index);
    this.filterTypeInterventionSelected();
  }

  validateTeacherManual() {
    if (this.checkFormValidity()) {
      return;
    } else {
      if (this.isEdit) {
        const payload = this.createPayloadUpdate();
        this.isWaitingForResponse = true;
        this.subs.sink = this.teacherService.updateTeacherSubject(this.teacherSubjectId, payload).subscribe(
          (resp) => {
            if (resp) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo'),
                confirmButtonText: this.translate.instant('OK'),
                allowOutsideClick: false,
                allowEscapeKey: false,
              }).then((res) => {
                if (res.value) {
                  this.router.navigate(['teacher-management']);
                }
              });
            }
            this.isWaitingForResponse = false;
          },
          (err) => {
            this.isWaitingForResponse = false;
          },
        );
      } else {
        const payload = this.createPayload();
        this.isWaitingForResponse = true;
        this.subs.sink = this.teacherService.createManualTeacherSubject(payload).subscribe(
          (resp) => {
            if (resp) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo'),
                confirmButtonText: this.translate.instant('OK'),
                allowOutsideClick: false,
                allowEscapeKey: false,
              }).then((res) => {
                if (res.value) {
                  this.router.navigate(['teacher-management']);
                }
              });
            }
            this.isWaitingForResponse = false;
          },
          (err) => {
            this.isWaitingForResponse = false;
          },
        );
      }
    }
  }

  createPayload() {
    const payload = this.interventionForm.getRawValue();
    payload.level_id = this.levelIdSelected;
    payload.campus_id = this.campusIdSelected;
    payload.speciality_id =
      this.interventionForm?.get('speciality_id')?.value !== 'None' ? this.interventionForm?.get('speciality_id')?.value : null;
    if (payload?.legal_entity_id) {
      delete payload?.legal_entity_id;
    }
    if (payload?.interventions?.length) {
      payload?.interventions?.forEach((intervention) => {
        if (intervention?.type_of_contract) {
          delete intervention?.type_of_contract;
        }
        if (intervention?.hourly_rate) {
          delete intervention?.hourly_rate;
        }
      });
    }
    return payload;
  }

  createPayloadUpdate() {
    const payload = this.interventionForm.getRawValue();
    payload.level_id = this.levelIdSelected;
    payload.campus_id = this.campusIdSelected;
    payload.speciality_id =
      this.interventionForm?.get('speciality_id')?.value !== 'None' ? this.interventionForm?.get('speciality_id')?.value : null;

    if (payload?.legal_entity_id) {
      delete payload?.legal_entity_id;
    }

    if (payload?.interventions?.length) {
      payload?.interventions?.forEach((intervention) => {
        payload.sequence_id = intervention?.sequence_id;
        payload.course_subject_id = intervention?.subject_id;
        payload.type_of_intervention_id = intervention?.type_of_intervention_id;
        payload.volume_hours_assigned = intervention?.volume_hours;
      });
    }

    delete payload?.interventions;

    return payload;
  }

  leave() {
    this.fireUnsavedDataWarningSwal();
  }

  checkFormChanged() {
    const currentForm = JSON.stringify(this.interventionForm.getRawValue());
    const initForm = JSON.stringify(this.initialForm);

    if (currentForm === initForm) {
      return true;
    } else {
      return false;
    }
  }

  fireUnsavedDataWarningSwal() {
    if (!this.checkFormChanged()) {
      return Swal.fire({
        type: 'warning',
        title: this.translate.instant('TMTC_S01.TITLE'),
        text: this.translate.instant('TMTC_S01.TEXT'),
        confirmButtonText: this.translate.instant('TMTC_S01.BUTTON_1'),
        showCancelButton: true,
        cancelButtonText: this.translate.instant('TMTC_S01.BUTTON_2'),
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.value) {
          // I will save first
          return;
        } else {
          // discard changes
          this.router.navigate(['teacher-management']);
        }
      });
    } else {
      // discard changes
      this.router.navigate(['teacher-management']);
    }
  }

  checkFormValidity(): boolean {
    if (this.interventionForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.interventionForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  getAllTypeOfIntervention() {
    this.isWaitingForResponse = true;
    const filter = {
      teacher_id: this.interventionForm.get('teacher_id').value,
      scholar_season_id: [this.interventionForm.get('scholar_season_id').value],
      legal_entity_id: [this.legalEntitySelected?._id],
    };
    this.subs.sink = this.teacherService.getAllTypeOfInterventionManualTeacher(filter).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.originalTypeInterventionList = _.cloneDeep(resp);
          this.filterTypeInterventionSelected();
        }
        this.isWaitingForResponse = false;
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

  selectTypeIntervention(typeInterventionId, index) {
    if (typeInterventionId && typeInterventionId !== 'None') {
      this.originalTypeInterventionList.forEach((data) => {
        if (data?._id === typeInterventionId) {
          if (data?.type_of_contract) {
            const valueTranslate = this.translate.instant('ERP_009_TEACHER_CONTRACT.TYPE_OF_CONTRACT.' + data?.type_of_contract);
            this.interventionsArray().at(index).get('type_of_contract').patchValue(valueTranslate);
          }

          if (data?.hourly_rate) {
            this.interventionsArray().at(index).get('hourly_rate').patchValue(data?.hourly_rate);
          }
        }
      });
    } else if (typeInterventionId === 'None') {
      this.interventionsArray()?.at(index)?.get('type_of_intervention_id').patchValue(null);
      this.interventionsArray()?.at(index)?.get('type_of_contract').patchValue(null);
      this.interventionsArray()?.at(index)?.get('hourly_rate').patchValue(null);
      this.interventionsArray()?.at(index)?.get('type_of_intervention_id').markAsTouched();
      this.interventionsArray()?.at(index)?.get('type_of_contract').markAsTouched();
      this.interventionsArray()?.at(index)?.get('hourly_rate').markAsTouched();
    }
    this.filterTypeInterventionSelected();
  }

  // *************** this function for reset casecade field by field selected
  resetCascadeField(type) {
    let except = [];
    let interventionsFormArrayExcept = ['sequence_id', 'subject_id', 'volume_hours'];
    switch (type) {
      case 'scholar_season':
        // *************** Reset cascade all except [sequence_id, subject_id, volume_hours ] -> interventions | scholar_season field
        except = ['scholar_season_id'];
        this.resetInterventionFormControl(except, interventionsFormArrayExcept);

        // *************** reset list dropdown
        this.school = [];
        this.campusList = [];
        this.levels = [];
        this.sectorList = [];
        this.specialityList = [];
        this.originalTypeInterventionList = [];
        this.teacherList = [];
        this.legalEntitySelected = null;
        this.levelIdSelected = null;
        this.campusIdSelected = null;
        break;
      case 'school':
        // *************** Reset cascade all except [sequence_id, subject_id, volume_hours ] -> interventions | scholar_season, shool_id field"
        except = ['scholar_season_id', 'school_id'];
        this.resetInterventionFormControl(except, interventionsFormArrayExcept);

        // *************** reset list dropdown
        this.levels = [];
        this.campusList = [];
        this.sectorList = [];
        this.specialityList = [];
        this.originalTypeInterventionList = [];
        this.teacherList = [];
        this.legalEntitySelected = null;
        this.levelIdSelected = null;
        this.campusIdSelected = null;
        break;
      case 'campus':
        // *************** Reset cascade all except [sequence_id, subject_id, volume_hours ] -> interventions | scholar_season, shool_id, campus_id field"
        except = ['scholar_season_id', 'school_id', 'campus_id'];
        this.resetInterventionFormControl(except, interventionsFormArrayExcept);

        // *************** reset list dropdown
        this.levels = [];
        this.sectorList = [];
        this.specialityList = [];
        this.originalTypeInterventionList = [];
        this.teacherList = [];
        this.legalEntitySelected = null;
        this.levelIdSelected = null;
        break;
      case 'level':
        // *************** Reset cascade all except [sequence_id, subject_id, volume_hours ] -> interventions | scholar_season, shool_id, campus_id, level_id field"
        except = ['scholar_season_id', 'school_id', 'campus_id', 'level_id'];
        this.resetInterventionFormControl(except, interventionsFormArrayExcept);

        // *************** reset list dropdown
        this.sectorList = [];
        this.specialityList = [];
        this.originalTypeInterventionList = [];
        this.teacherList = [];
        this.legalEntitySelected = null;
        break;
      case 'sector':
        // *************** Reset cascade all except [sequence_id, subject_id, volume_hours ] -> interventions | scholar_season, shool_id, campus_id, level_id, sector_id field""
        except = ['scholar_season_id', 'school_id', 'campus_id', 'level_id', 'sector_id'];
        this.resetInterventionFormControl(except, interventionsFormArrayExcept);

        // *************** reset list dropdown
        this.specialityList = [];
        this.originalTypeInterventionList = [];
        this.teacherList = [];
        this.legalEntitySelected = null;
        break;
      case 'speciality':
        // *************** Reset cascade all except [sequence_id, subject_id, volume_hours ] -> interventions | scholar_season, shool_id, campus_id, level_id, sector_id, speciality_id field""
        except = ['scholar_season_id', 'school_id', 'campus_id', 'level_id', 'sector_id', 'speciality_id', 'legal_entity_id'];
        this.resetInterventionFormControl(except, interventionsFormArrayExcept);

        // *************** reset list dropdown
        this.originalTypeInterventionList = [];
        this.teacherList = [];
        this.legalEntitySelected = null;
        break;
      case 'teacher':
        except = ['scholar_season_id', 'school_id', 'campus_id', 'level_id', 'sector_id', 'speciality_id', 'legal_entity_id', 'teacher_id'];
        this.resetInterventionFormControl(except, interventionsFormArrayExcept);

        // *************** reset list dropdown
        this.originalTypeInterventionList = [];
        break;
    }
  }

  resetInterventionFormControl(except, interventionsFormArrayExcept) {
    Object.keys(this.interventionForm.controls).forEach((control) => {
      if (control === 'interventions') {
        this.resetInterventionsFormArrayExcept(interventionsFormArrayExcept);
      } else if (!except.includes(control)) {
        this.interventionForm.get(control?.toString()).patchValue(null);
      }

      if(except?.length === 1 && except?.includes('scholar_season_id') && this.interventionForm?.get(control?.toString())?.value === 'None') {
        this.interventionForm?.get(control?.toString())?.patchValue(null);
      }
    });
  }

  resetInterventionsFormArrayExcept(except) {
    if (this.interventionsArray()?.length) {
      this.interventionsArray()?.controls?.forEach((intervention, index) => {
        Object.keys((this.interventionsArray().at(0) as UntypedFormGroup).controls).forEach((control) => {
          if (!except.includes(control)) {
            this.interventionsArray()?.at(index).get(control?.toString()).patchValue(null);
          }
        });
      });
    }
  }

  displayTranslate(index) {
    if (this.interventionsArray()?.controls[index]?.get('type_of_contract')?.value) {
      return this.translate.instant(
        `ERP_009_TEACHER_CONTRACT.TYPE_OF_CONTRACT.${this.interventionsArray()?.controls[index]?.get('type_of_contract')?.value}`,
      );
    } else {
      return null;
    }
  }

  filterTypeInterventionSelected() {
    let selectedTypeIntervention = new Set();
    this.interventionsArray().value.forEach((data) => {
      if (data?._id) {
        selectedTypeIntervention.add(data?._id);
      }
    });
    this.selectedTypeInterventionSet = selectedTypeIntervention;
  }

  selectSequence(sequenceId, index) {
    if (sequenceId && sequenceId !== 'None') {
      this.interventionsArray()?.at(index)?.get('sequence_id')?.patchValue(sequenceId);
    } else if (sequenceId === 'None') {
      this.interventionsArray()?.at(index)?.get('sequence_id')?.patchValue(null);
    }
  }

  selectSubject(subjectId, index) {
    if (subjectId && subjectId !== 'None') {
      this.interventionsArray()?.at(index)?.get('subject_id')?.patchValue(subjectId);
    } else if (subjectId === 'None') {
      this.interventionsArray()?.at(index)?.get('subject_id')?.patchValue(null);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
}
