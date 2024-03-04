import { Component, OnInit, Input, ViewChild, OnDestroy, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import Swal from 'sweetalert2';
import { SubSink } from 'subsink';
import { ApplicationUrls } from 'app/shared/settings';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { ImportFinanceObjectiveDialogComponent } from '../import-finance-objective-dialog/import-finance-objective-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';
import { NgxPermissionsService } from 'ngx-permissions';
import { FinancesService } from 'app/service/finance/finance.service';
import { PermissionService } from 'app/service/permission/permission.service';

@Component({
  selector: 'ms-import-finance',
  templateUrl: './import-finance.component.html',
  styleUrls: ['./import-finance.component.scss'],
})
export class ImportFinanceComponent implements OnInit, OnDestroy, AfterViewChecked {
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
  realCampusList = [];
  realLevelList = [];
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
  initialForm: any;
  sectorList: any[] = [];
  specialityList: any[] = [];
  originalListSectors: any = [];
  originalListSpeciality: any = [];
  isSectorsOn = false;
  isSpecialityOn = false;
  isDataForListLoading: boolean = false;
  specializationDataLoading: boolean = false;
  isSectorsDataLoading: boolean = false;
  downloadTemplateLoading: boolean = false;
  isPermission: string[];
  currentUserTypeId: any;

  constructor(
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private userService: AuthService,
    private fileUploadService: FileUploadService,
    private candidateService: CandidatesService,
    private pageTitleService: PageTitleService,
    private financeService: FinancesService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private permissionsService: NgxPermissionsService,
    public permission: PermissionService,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.isMemberAdmission = !!this.permissionsService.getPermission('Member Admission');
    this.getDataScholarSeasons();
    this.initImportForm();
    this.initDummyImportForm();
    this.getDataForList();
    if (this.translate.currentLang === 'fr') {
      this.importForm.get('delimiter').setValue(';');
    } else {
      this.importForm.get('delimiter').setValue(',');
    }

    this.subs.sink = this.translate.onLangChange.subscribe(() => {
      if (this.translate.currentLang === 'fr') {
        this.importForm.get('delimiter').setValue(';');
      } else {
        this.importForm.get('delimiter').setValue(',');
      }
    });
    this.currentUser = this.userService.getLocalStorageUser();
    this.initialForm = _.cloneDeep(this.importForm.value);
    this.subs.sink = this.importForm.valueChanges.subscribe((resp) => {
      if (resp) {
        this.dataIsChanged();
      }
    });
    this.getDataForSectors();
    this.pageTitleService.setTitle('Platform >> Import of Finance Objectives');
  }

  getDataForList() {
    if (this.isDirectorAdmission) {
      const name =
        this.currentUser && this.currentUser.entities && this.currentUser.entities.length
          ? this.currentUser.entities[0].candidate_school
          : '';

      this.subs.sink = this.candidateService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe(
        (resp) => {
          if (resp) {
            this.listObjective = resp;
          }
        },
        (err) => {
          // Record error log
          this.userService.postErrorLog(err);
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
    } else {
      const name = '';
      this.subs.sink = this.candidateService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe(
        (resp) => {
          if (resp) {
            this.listObjective = resp;
          }
        },
        (err) => {
          // Record error log
          this.userService.postErrorLog(err);
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
  }

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasons().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.scholars = resp;
        }
      },
      (err) => {
        // Record error log
        this.userService.postErrorLog(err);
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
    //   name: this.translate.instant('ALL'),
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
      const dataSchool = [];
      const dataTemp = this.school.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
      if (dataTemp.length > 0) {
        dataTemp.forEach((element) => {
          dataSchool.push(element._id);
        });
        this.importForm.get('schools').patchValue(dataSchool);
        const sCampusList = dataTemp;
        const optionAll = {
          _id: 'ALL',
          name: this.translate.instant('ALL'),
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
      school = _.cloneDeep(this.importForm.get('schools').value);
      const sSchools = this.listObjective.filter((list) => {
        return school.includes(list._id);
      });
      const optionAll = {
        _id: 'ALL',
        name: this.translate.instant('ALL'),
      };
      this.campusList.push(optionAll);
      sSchools.filter((campus) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses) => {
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
    this.sectorList = [];
    this.specialityList = [];
    this.isDelimeterOn = false;
    const optionAll = {
      _id: 'ALL',
      short_name: this.translate.instant('ALL'),
    };
    if (this.listObjective.length > 0) {
      this.school.push(optionAll);
      this.school.push(...this.listObjective);
    } else {
      this.school = [];
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
        name: this.translate.instant('ALL'),
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
        name: this.translate.instant('ALL'),
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
        // Record error log
        this.userService.postErrorLog(err);
        this.originalListSectors = [];
        this.isSectorsDataLoading = false;
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
      scholar_season_id: scholarSeason[0],
      candidate_school_ids: this.importForm.get('schools').value,
      campuses: this.importForm.get('campuses').value,
      levels: this.importForm.get('levels').value,
    };

    const optionAll = {
      _id: 'ALL',
      name: this.translate.instant('ALL'),
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
      scholar_season_id: scholarSeason[0],
      candidate_school_ids: this.importForm.get('schools').value,
      campuses: this.importForm.get('campuses').value,
      levels: this.importForm.get('levels').value,
      sectors: sector,
    };

    // console.log(this.importForm.value);

    const optionAll = {
      _id: 'ALL',
      name: this.translate.instant('ALL'),
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
        // Record error log
        this.userService.postErrorLog(err);
        this.specializationDataLoading = false;
        this.specialityList = [];
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

  resetImport() {
    this.listObjective = [];
    this.sectorList = [];
    this.scholars = [];
    this.school = [];
    this.campusList = [];
    this.levels = [];
    this.specialityList = [];

    this.importForm.get('schools').setValue(null);
    this.importForm.get('campuses').setValue(null);
    this.importForm.get('scholarSeasons').setValue(null);
    this.importForm.get('levels').setValue(null);
    this.importForm.get('sectors').setValue(null);
    this.importForm.get('specialities').setValue(null);
    this.importForm.get('delimiter').setValue('');

    if (this.translate.currentLang === 'fr') {
      this.importForm.get('delimiter').setValue(';');
    } else {
      this.importForm.get('delimiter').setValue(',');
    }

    this.path = '';
    this.fileName = '';
    this.templateDonwloaded = false;

    this.getDataScholarSeasons();
    this.getDataForList();
  }

  handleInputChange(fileInput: Event) {
    // this.dataIsChanged();
    this.isWaitingForResponse = true;
    const file = (<HTMLInputElement>fileInput.target).files[0];
    this.file = (<HTMLInputElement>fileInput.target).files[0];
    this.path = '';
    this.fileName = '';
    if (file) {
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
          // Record error log
          this.userService.postErrorLog(err);
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
    this.resetFileState();
  }

  resetFileState() {
    this.importFile.nativeElement.value = '';
  }

  submitImport() {
    this.isWaitingForResponse = true;
    const payload = _.cloneDeep(this.importForm.value);
    const data = {
      scholar_seasons: payload.scholarSeasons,
      schools: payload.schools,
      campuses: payload.campuses,
      levels: payload.levels,
      file_delimeter: payload.delimiter,
    };
    this.subs.sink = this.financeService.ImportGeneralDashboardFinance(data, this.file).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          Swal.fire({
            type: 'success',
            title: 'Bravo !',
            text: this.translate.instant('import success'),
          });
          this.financeService.importOfFinanceObjectiveValidationStatus = true;
          this.resetImport();
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        // Record error log
        this.userService.postErrorLog(err);
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

  csvTypeSelection() {
    const payload = _.cloneDeep(this.importForm.value);
    payload.action = 'primary';
    this.subs.sink = this.dialog
      .open(ImportFinanceObjectiveDialogComponent, {
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
        }
      });
  }

  dataIsChanged() {
    JSON.stringify(this.initialForm) === JSON.stringify(this.importForm.value)
      ? (this.financeService.importOfFinanceObjectiveValidationStatus = true)
      : (this.financeService.importOfFinanceObjectiveValidationStatus = false);
  }

  canDeactivate(): Promise<boolean> | boolean {
    if (!this.financeService.importOfFinanceObjectiveValidationStatus) {
      return new Promise((resolve) => {
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
            this.financeService.importOfFinanceObjectiveValidationStatus = true;
            resolve(true);
          }
        });
      });
    } else {
      this.financeService.importOfFinanceObjectiveValidationStatus = true;
      return true;
    }
  }

  clearSpeciality() {
    this.specialityList = [];
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.pageTitleService.setTitle(null);
    this.subs.unsubscribe();
  }
}
