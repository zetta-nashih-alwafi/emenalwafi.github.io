import { Component, OnInit, Input, ViewChild, OnDestroy, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StudentsService } from 'app/service/students/students.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SchoolService } from 'app/service/schools/school.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import Swal from 'sweetalert2';
import { SubSink } from 'subsink';
import { ApplicationUrls } from 'app/shared/settings';
import { AuthService } from 'app/service/auth-service/auth.service';
import { HttpClient } from '@angular/common/http';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { ImportObjectiveDialogComponent } from '../import-objective-dialog/import-objective-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';
import { NgxPermissionsService } from 'ngx-permissions';
import { FinancesService } from 'app/service/finance/finance.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { PermissionService } from 'app/service/permission/permission.service';

@Component({
  selector: 'ms-import-registration',
  templateUrl: './import-registration.component.html',
  styleUrls: ['./import-registration.component.scss'],
})
export class ImportRegistrationComponent implements OnInit, OnDestroy, AfterViewChecked {
  private subs = new SubSink();
  @Input() schoolId: string;
  @Input() selectedRncpTitleId: string;
  @Input() selectedClassId: string;
  importForm: UntypedFormGroup;
  importDummyForm: UntypedFormGroup;
  @ViewChild('importFile', { static: false }) importFile: any;
  path: string;
  fileName: string;
  file: any;
  fileType: any;
  templateCSVDownloadName = 'comma';
  currentUser: any;
  server = ApplicationUrls.baseApi;
  isAcadir = false;
  isClose = false;
  isWaitingForResponse = false;
  campusList = [];
  listObjective = [];
  titles = [];
  classes = [];
  levels = [];
  scholars = [];
  school = [];
  delimeter = [
    { key: 'COMMA [ , ]', value: ',' },
    { key: 'SEMICOLON [ ; ]', value: ';' },
    { key: 'TAB [ ]', value: 'tab' },
  ];
  private intVal: any;
  private timeOutVal: any;
  isDelimeterOn = false;
  isLevelOn = false;
  isSchoolOn = false;
  isCampusOn = false;
  isDirectorAdmission = false;
  isMemberAdmission = false;
  templateDonwloaded = false;
  realCampusList: any = [];
  initialForm: any;
  sectorList: any[] = [];
  specialityList: any[] = [];
  isSectorsOn = false;
  isSpecialityOn = false;
  originalListSectors: any = [];
  originalListSpeciality: any = [];
  isDataForListLoading: boolean = false;
  specializationDataLoading: boolean = false;
  isSectorsDataLoading: boolean = false;
  downloadTemplateLoading: boolean = false;
  isFileImported = true;
  isTemplateDownloaded = true;
  isPermission: string[];
  currentUserTypeId: any;

  constructor(
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private studentService: StudentsService,
    private schoolService: SchoolService,
    private titleService: RNCPTitlesService,
    private translate: TranslateService,
    private userService: AuthService,
    private httpClient: HttpClient,
    private fileUploadService: FileUploadService,
    private candidateService: CandidatesService,
    private pageTitleService: PageTitleService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private permissionsService: NgxPermissionsService,
    private financeService: FinancesService,
    private utilService: UtilityService,
    public permission: PermissionService,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Admission Director');
    this.isMemberAdmission = !!this.permissionsService.getPermission('Admission Member');
    this.getDataScholarSeasons();
    this.initImportForm();
    // this.initDummyImportForm();
    this.getDataForList();
    this.importForm.get('delimiter').setValue(';');

    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.importForm.get('delimiter').setValue(';');
    });

    this.currentUser = this.userService.getLocalStorageUser();
    this.initialForm = _.cloneDeep(this.importForm.value);
    this.subs.sink = this.importForm.valueChanges.subscribe((resp) => {
      if (resp) {
        this.dataIsChanged();
      }
    });
    this.getDataForSectors();
    this.pageTitleService.setTitle('Platform >> Import of Registration Objectives');
  }

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp && resp.length) {
          // console.log('Data', resp);
          this.scholars = resp;
          this.scholars = _.uniqBy(this.scholars, '_id');
          // this.scholars = this.scholars.filter((scholar) => scholar.scholar_season !== '20-21');
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
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
    this.isDataForListLoading = true;
    const name = '';
    this.subs.sink = this.candidateService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp) {
          this.isDataForListLoading = false;
          // console.log('Data Import => ', resp);
          this.listObjective = resp;
        }
      },
      (err) => {
        this.isDataForListLoading = false;
        this.userService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  initImportForm() {
    this.importForm = this.fb.group({
      schools: [null, Validators.required],
      campuses: [null, Validators.required],
      scholarSeasons: [null, Validators.required],
      levels: [null, Validators.required],
      sectors: [null, Validators.required],
      specialities: [null],
      delimiter: ['', Validators.required],
    });
  }

  initDummyImportForm() {
    this.importDummyForm = this.fb.group({
      schools: [null, Validators.required],
      campuses: [null, Validators.required],
      scholarSeasons: [null, Validators.required],
      levels: [null, Validators.required],
      delimiter: ['', Validators.required],
    });
  }
  openUploadWindow() {
    this.importFile.nativeElement.click();
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  getDataCampus() {
    this.levels = [];
    this.campusList = [];
    this.realCampusList = [];
    this.sectorList = [];
    this.specialityList = [];
    this.importForm.get('campuses').setValue(null);
    this.importForm.get('levels').setValue(null);
    this.importForm.get('sectors').setValue(null);
    this.importForm.get('specialities').setValue(null);
    this.isDelimeterOn = false;
    this.isCampusOn = true;
    let school = this.importForm.get('schools').value;
    // const scampusList = this.listObjective.filter((list) => {
    //   return school.includes(list._id);
    // });
    // const optionAll = {
    //   _id: 'ALL',
    //   name: this.translate.instant('AllS'),
    // };
    // this.campusList.push(optionAll);
    // scampusList.filter((campus, n) => {
    //   if (campus.campuses && campus.campuses.length) {
    //     campus.campuses.filter((campuses, nex) => {
    //       this.campusList.push(campuses);
    //       this.realCampusList.push(campuses);
    //     });
    //   }
    // });
    // this.campusList = _.uniqBy(this.campusList, '_id');
    // console.log('Campus Option ', scampusList, this.campusList);

    school = school.filter((list) => list === 'ALL' || list === 'Tous');
    if (school && school.length && (school[0] === 'ALL' || school[0] === 'Tous')) {
      const scholarSeasonSelected = this.importForm.get('scholarSeasons').value;
      let listSchoolsBasedOnScholarSeason;
      if (this.isMemberAdmission || this.isDirectorAdmission) {
        listSchoolsBasedOnScholarSeason = this.listObjective;
      } else {
        listSchoolsBasedOnScholarSeason = this.listObjective.filter((res) =>
          res.scholar_season_id.find((sch) => sch._id === scholarSeasonSelected),
        );
      }
      const dataSchool = [];
      if (listSchoolsBasedOnScholarSeason.length > 0) {
        const dataTemp = listSchoolsBasedOnScholarSeason.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
        if (dataTemp.length > 0) {
          dataTemp.forEach((element) => {
            dataSchool.push(element._id);
          });
          this.importForm.get('schools').patchValue(dataSchool);
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
          // console.log('Data Campus ', this.campusList, sCampusList);
        } else {
          this.campusList = [];
          this.realCampusList = [];
        }
      } else {
        this.campusList = [];
        this.realCampusList = [];
      }
    } else {
      school = _.cloneDeep(this.importForm.get('schools').value);
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
      // console.log('Campus Option ', sSchools, this.campusList);
    }
  }

  getDataSchool() {
    this.importForm.get('schools').setValue(null);
    this.importForm.get('campuses').setValue(null);
    this.importForm.get('levels').setValue(null);
    this.importForm.get('sectors').setValue(null);
    this.importForm.get('specialities').setValue(null);
    this.isSchoolOn = true;
    this.school = [];
    this.campusList = [];
    this.levels = [];
    this.specialityList = [];
    this.sectorList = [];
    this.isDelimeterOn = false;
    if (this.isDirectorAdmission || this.isMemberAdmission) {
      // Grouping by school
      const list = _.chain(this.currentUser.entities)
        // Group the elements of Array based on `school._id` property
        .groupBy('school._id')
        // `key` is group's name (school._id), `value` is the array of objects
        .map((value, key) => ({
          _id: key,
          campuses: _.chain(value)
            // Group the elements of Array based on `campus._id` property
            .groupBy('campus._id')
            // `key` is group's name (campus._id), `value` is the array of objects
            .map((values, keys) => ({
              _id: keys,
              levels: values.map((resp) => {
                return {
                  ...resp.level,
                };
              }),
            }))
            .value(),
        }))
        .value();

      const listName = _.chain(this.currentUser.entities)
        // Group the elements of Array based on `school._id` property
        .groupBy('school.short_name')
        // `key` is group's name (school.short_name), `value` is the array of objects
        .map((value, key) => ({
          short_name: key,
          campuses: _.chain(value)
            // Group the elements of Array based on `campus.name` property
            .groupBy('campus.name')
            // `key` is group's name (campus.name), `value` is the array of objects
            .map((values, keys) => ({
              name: keys,
              levels: values.map((resp) => {
                return {
                  ...resp.level,
                };
              }),
            }))
            .value(),
        }))
        .value();
      list.forEach((ele1, index1) => {
        ele1['short_name'] = listName[index1].short_name;
        ele1.campuses.forEach((camp, indexCamp) => {
          camp['name'] = listName[index1].campuses[indexCamp].name;
        });
      });

      this.listObjective = list;
      const optionAll = {
        _id: 'ALL',
        short_name: 'AllS',
      };
      if (this.listObjective.length > 0) {
        this.school.push(optionAll);
        this.school.push(...this.listObjective);
      } else {
        this.school = [];
      }
    } else {
      const optionAll = {
        _id: 'ALL',
        short_name: 'AllS',
      };
      const scholarSeasonIdSelected = this.importForm.get('scholarSeasons').value;
      // Filter listobjective list and find scholar season that had been selected
      const sSchools = this.listObjective.filter((res) => res.scholar_season_id.find((sch) => sch._id === scholarSeasonIdSelected));
      if (sSchools.length > 0) {
        this.school.push(optionAll);
        this.school.push(...sSchools);
      } else {
        this.school = [];
      }
    }
  }

  getDataLevel() {
    this.levels = [];
    this.importForm.get('levels').setValue(null);
    this.importForm.get('sectors').setValue(null);
    this.importForm.get('specialities').setValue(null);
    let sCampus = _.cloneDeep(this.importForm.get('campuses').value);
    sCampus = sCampus.filter((list) => list === 'ALL' || list === 'Tous');
    if (sCampus && sCampus.length && (sCampus[0] === 'ALL' || sCampus[0] === 'Tous')) {
      const dataCampus = [];
      const dataTemp = this.realCampusList.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
      dataTemp.forEach((element) => {
        dataCampus.push(element._id);
      });
      this.importForm.get('campuses').patchValue(dataCampus);
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
      // console.log('Data Levels ', this.levels, sLevelList);
    } else {
      sCampus = _.cloneDeep(this.importForm.get('campuses').value);
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
      // console.log('Data Levels ', this.levels, sLevelList, this.campusList, sCampus);
      // console.log('_form', this.importForm.value);
    }
  }

  getDataDelimeter() {
    let sSpeciality = _.cloneDeep(this.importForm.get('specialities').value);
    sSpeciality = sSpeciality.filter((list) => list === 'ALL' || list === 'Tous');
    if (sSpeciality && sSpeciality.length && (sSpeciality[0] === 'ALL' || sSpeciality[0] === 'Tous')) {
      const dataLevel = [];
      const dataTemp = this.specialityList.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
      dataTemp.forEach((element) => {
        dataLevel.push(element._id);
      });
      this.importForm.get('specialities').patchValue(dataLevel);
    }
  }

  getDataForSectors() {
    this.isSectorsDataLoading = true;
    this.subs.sink = this.financeService.GetAllSectorsDropdownWithoutFilter().subscribe(
      (res) => {
        // console.log('_sector', res);
        if (res) {
          this.originalListSectors = res.map((data) => {
            const school = data.school_id.map((sch) => sch._id);
            const campus = data.campus_id.map((cam) => cam._id);
            const level = data.level_id.map((lvl) => lvl._id);
            return {
              _id: data._id,
              name: data.name,
              school_id: school,
              level_id: level,
              campus_id: campus,
            };
          });
          this.isSectorsDataLoading = false;
          // console.log('_ori', this.originalListSectors);
        }
      },
      (err) => {
        this.originalListSectors = [];
        this.isSectorsDataLoading = false;
        this.userService.postErrorLog(err);
      },
    );
  }

  getSectors() {
    this.isSectorsOn = true;
    this.importForm.get('sectors').setValue(null);
    this.importForm.get('specialities').setValue(null);
    this.sectorList = [];

    let sLevel = _.cloneDeep(this.importForm.get('levels').value);
    sLevel = sLevel.filter((list) => list === 'ALL' || list === 'Tous');
    if (sLevel && sLevel.length && (sLevel[0] === 'ALL' || sLevel[0] === 'Tous')) {
      const dataLevel = [];
      const dataTemp = this.levels.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
      dataTemp.forEach((element) => {
        dataLevel.push(element._id);
      });
      this.importForm.get('levels').patchValue(dataLevel);
    }

    const scholarSeason = this.importForm.get('scholarSeasons').value;

    const filter = {
      scholar_season_id: scholarSeason,
      candidate_school_ids: this.importForm.get('schools').value,
      campuses: this.importForm.get('campuses').value,
      levels: this.importForm.get('levels').value,
    };

    const optionAll = {
      _id: 'ALL',
      name: 'AllS',
    };

    if (this.originalListSectors.length > 0) {
      let listOriginal = this.originalListSectors.filter((sec) => {
        const school = filter.candidate_school_ids.some((sch) => sec.school_id.includes(sch));
        const campus = filter.campuses.some((camp) => sec.campus_id && sec.campus_id.includes(camp));
        const level = filter.levels.some((lvl) => sec.level_id.includes(lvl));
        if (school && campus && level) {
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

  getSpeciality() {
    this.isDelimeterOn = true;
    this.isSpecialityOn = true;
    this.importForm.get('specialities').setValue(null);
    this.specialityList = [];

    let sSectors = _.cloneDeep(this.importForm.get('sectors').value);
    sSectors = sSectors.filter((list) => list === 'ALL' || list === 'Tous');
    if (sSectors && sSectors.length && (sSectors[0] === 'ALL' || sSectors[0] === 'Tous')) {
      const dataSectors = [];
      const dataTemp = this.sectorList.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
      dataTemp.forEach((element) => {
        dataSectors.push(element._id);
      });
      this.importForm.get('sectors').patchValue(dataSectors);
    }

    const scholarSeason = this.importForm.get('scholarSeasons').value;
    const sector = this.importForm.get('sectors').value;

    const filter = {
      scholar_season_id: scholarSeason,
      candidate_school_ids: this.importForm.get('schools').value,
      campuses: this.importForm.get('campuses').value,
      levels: this.importForm.get('levels').value,
      sectors: sector,
    };

    // console.log(this.importForm.value);

    const optionAll = {
      _id: 'ALL',
      name: 'AllS',
    };

    this.specializationDataLoading = true;
    this.subs.sink = this.candidateService.GetAllSpecializationsByScholar(filter).subscribe(
      (res) => {
        if (res) {
          this.originalListSpeciality = _.cloneDeep(res);
          // console.log(res);
          this.specializationDataLoading = false;
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
        this.specializationDataLoading = false;
        this.specialityList = [];
        this.userService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  resetImport() {
    this.listObjective = [];
    this.sectorList = [];
    this.scholars = [];
    this.school = [];
    this.campusList = [];
    this.levels = [];
    this.specialityList = [];
    this.isTemplateDownloaded = true;
    this.isFileImported = true; 
    this.importForm.reset();

    this.importForm.get('schools').setValue(null);
    this.importForm.get('campuses').setValue(null);
    this.importForm.get('scholarSeasons').setValue(null);
    this.importForm.get('levels').setValue(null);
    this.importForm.get('sectors').setValue(null);
    this.importForm.get('specialities').setValue(null);

    this.importForm.get('delimiter').setValue(';');

    this.isDelimeterOn = false;
    this.path = '';
    this.fileName = '';
    this.templateDonwloaded = false;

    this.getDataScholarSeasons();
    this.getDataForList();
  }

  handleInputChange(fileInput: Event) {
    this.isWaitingForResponse = true;
    const file = (<HTMLInputElement>fileInput.target).files[0];
    this.file = (<HTMLInputElement>fileInput.target).files[0];
    this.isFileImported = true;
    // console.log('this.file', this.file);
    this.path = '';
    this.fileName = '';
    const acceptable = ['csv'];
    if (file) {
      const fileType = this.utilService.getFileExtension(file.name);
      if (acceptable.includes(fileType)) {
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            if (resp) {
              this.path = resp.file_url;
              this.fileName = resp.file_name;
              Swal.fire({
                type: 'success',
                title: this.translate.instant('IMPORT_OBJ_S1.Title'),
                html: this.translate.instant('IMPORT_OBJ_S1.Text'),
                confirmButtonText: this.translate.instant('IMPORT_OBJ_S1.Button'),
              });
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            this.userService.postErrorLog(err);
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      } else {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
          text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.csv' }),
          allowEscapeKey: false,
          allowOutsideClick: false,
          allowEnterKey: false,
        }).then(() => (this.isWaitingForResponse = false));
      }
    }
    this.resetFileState();
  }

  resetFileState() {
    this.importFile.nativeElement.value = '';
  }

  submitImport() {
    if (this.importForm.invalid || !this.file) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
      this.importForm.markAllAsTouched();
      this.isFileImported = false;
      this.isTemplateDownloaded = false;
    } else {
      this.isTemplateDownloaded = true;
      this.isFileImported = true;
      this.isWaitingForResponse = true;
      const payload = _.cloneDeep(this.importForm.value);
      const data = {
        scholar_seasons: payload.scholarSeasons,
        schools: payload.schools,
        campuses: payload.campuses,
        levels: payload.levels,
        file_delimeter: payload.delimiter,
        sectors: payload.sectors,
        specialities: payload.specialities ? payload.specialities : [],
      };
      this.subs.sink = this.candidateService.ImportGeneralDashboardAdmission(data, this.file).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            // console.log('Import Success ', resp);
            Swal.fire({
              type: 'success',
              title: this.translate.instant('IMPORT_OBJ_S2.Title'),
              html: this.translate.instant('IMPORT_OBJ_S2.Text'),
              confirmButtonText: this.translate.instant('IMPORT_OBJ_S2.Button'),
            });
            this.financeService.importRegistrationValidationStatus = true;
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.userService.postErrorLog(err);
          if (err['message'] === 'GraphQL error: some school / campus / level not found') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('REJECT_IMPORT.TITLE'),
              text: this.translate.instant('REJECT_IMPORT.TEXT'),
            });
          } else {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('IMPORT_OBJ_S3.Title'),
              html: this.translate.instant('IMPORT_OBJ_S3.Text'),
              confirmButtonText: this.translate.instant('IMPORT_OBJ_S3.Button'),
            });
          }
        },
      );
    }
  }

  csvTypeSelection() {
    if (this.importForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
      this.importForm.markAllAsTouched();
    } else {
      const payload = _.cloneDeep(this.importForm.value);
      console.log('Payload ', payload);
      payload.action = 'primary';
      this.subs.sink = this.dialog
        .open(ImportObjectiveDialogComponent, {
          width: '600px',
          minHeight: '100px',
          panelClass: 'certification-rule-pop-up',
          disableClose: true,
          data: payload,
        })
        .afterClosed()
        .subscribe((resp) => {
          if (resp && resp === 'downloaded') {
            this.templateDonwloaded = true;
            this.isTemplateDownloaded = true;
          }
        });
      // this.downloadTemplateLoading = true;
      // this.subs.sink = this.candidateService
      //   .GetFirstLastObjectiveDate(payload.scholarSeasons, payload.schools, payload.campuses, payload.levels)
      //   .subscribe(
      //     (list) => {
      //       if (list && list.first_dates.length && list.last_dates.length) {
      //         this.downloadTemplateLoading = false;
      //         if (list.first_dates.length > 1 || list.last_dates.length > 1) {
      //           Swal.fire({
      //             type: 'info',
      //             title: this.translate.instant('IMPORT_DONE.TITLE'),
      //             text: this.translate.instant('IMPORT_DONE.TEXT'),
      //           });
      //         } else {
      //           payload.first_dates = list.first_dates[0];
      //           payload.last_dates = list.last_dates[0];
      //           payload.action = 'second';
      //           this.subs.sink = this.dialog
      //             .open(ImportObjectiveDialogComponent, {
      //               width: '600px',
      //               minHeight: '100px',
      //               panelClass: 'certification-rule-pop-up',
      //               disableClose: true,
      //               data: payload,
      //             })
      //             .afterClosed()
      //             .subscribe((resp) => {
      //               if (resp && resp === 'downloaded') {
      //                 this.templateDonwloaded = true;
      //                 this.isTemplateDownloaded = true;
      //               }
      //             });
      //         }
      //       } else {
      //         this.downloadTemplateLoading = false;
      //         payload.action = 'primary';
      //         this.subs.sink = this.dialog
      //           .open(ImportObjectiveDialogComponent, {
      //             width: '600px',
      //             minHeight: '100px',
      //             panelClass: 'certification-rule-pop-up',
      //             disableClose: true,
      //             data: payload,
      //           })
      //           .afterClosed()
      //           .subscribe((resp) => {
      //             if (resp && resp === 'downloaded') {
      //               this.templateDonwloaded = true;
      //               this.isTemplateDownloaded = true;
      //             }
      //           });
      //       }
      //     },
      //     (err) => {
      //       this.downloadTemplateLoading = false;
      //     },
      //   );
    }
  }

  dataIsChanged() {
    JSON.stringify(this.initialForm) === JSON.stringify(this.importForm.value)
      ? (this.financeService.importRegistrationValidationStatus = true)
      : (this.financeService.importRegistrationValidationStatus = false);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.pageTitleService.setTitle(null);
    this.subs.unsubscribe();
  }

  clearSchool() {
    this.school = [];
  }

  clearLevel() {
    this.getDataCampus();
  }

  clearCampus() {
    this.campusList = [];
    this.realCampusList = [];
  }

  clearSpeciality() {
    this.specialityList = [];
  }

  clearSectors() {
    this.sectorList = [];
  }

  handleRemoveScholarSeason() {
    const scholar = this.importForm.get('scholarSeasons').value;
    // console.log('_sch', scholar);
    if (scholar.length === 0) {
      this.clearSchool();
    }
  }

  handleRemoveSchool() {
    const school = this.importForm.get('schools').value;
    // console.log('_sch', school);
    if (school.length === 0) {
      this.clearCampus();
    }
  }

  handleRemoveCampus() {
    const campus = this.importForm.get('campuses').value;
    // console.log('_cam', campus);
    if (campus.length === 0) {
      this.clearLevel();
    }
  }

  canDeactivate(): Promise<boolean> | boolean {
    if (!this.financeService.importRegistrationValidationStatus) {
      return new Promise((resolve, reject) => {
        Swal.fire({
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
            resolve(false);
          } else if (result.dismiss) {
            this.financeService.importRegistrationValidationStatus = true;
            resolve(true);
          }
        });
      });
    } else {
      this.financeService.importRegistrationValidationStatus = true;
      return true;
    }
  }
}
