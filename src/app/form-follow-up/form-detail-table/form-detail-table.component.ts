import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { FilterBreadCrumbItem, FilterBreadCrumbInput } from './../../models/bread-crumb-filter.model';
import { AuthService } from 'app/service/auth-service/auth.service';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { FormFollowUpService } from '../form-follow-up.service';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { cloneDeep, uniqBy } from 'lodash';
import { Observable, forkJoin } from 'rxjs';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import * as moment from 'moment';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { SelectionModel } from '@angular/cdk/collections';
import { SendMultipleEmailComponent } from 'app/internship-file/send-multiple-email/send-multiple-email.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PermissionService } from 'app/service/permission/permission.service';
import { ExportGenerationInfoDialogComponent } from 'app/shared/components/export-generation-info-dialog/export-generation-info-dialog.component';
import { FinancesService } from 'app/service/finance/finance.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { InternshipEmailDialogComponent } from 'app/internship-file/internship-email-dialog/internship-email-dialog.component';

@Component({
  selector: 'ms-form-detail-table',
  templateUrl: './form-detail-table.component.html',
  styleUrls: ['./form-detail-table.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class FormDetailTableComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  filteredSchoolOrigin: Observable<any>;
  selection = new SelectionModel<any>(true, []);

  isWaitingForResponse = false;
  isWaitingNotify = false;
  isReset = false;
  dataLoaded = false;
  formId: any;
  formType: any;
  noData: any;
  studentAdmissionData: any;
  sortValue = null;
  statusStep = [];
  isCheckedAll = false;
  statusMatrix: any[][] = [];
  studentAdmissionCount: any;
  statusForm: any[] = [];
  dataSelected = [];
  pageSelected = [];
  userSelected = [];
  userSelectedId = [];
  dataUnselect = [];
  allIdForReminder = [];
  allStudentsEmail = [];
  selectType = '';

  dataSource = new MatTableDataSource([]);

  displayedColumns: string[] = ['select', 'student', 'school', 'program', 'studentStatus', 'sendDate', 'lastModified', 'action'];
  filterColumns: string[] = [
    'selectFilter',
    'studentFilter',
    'schoolFilter',
    'programFilter',
    'studentStatusFilter',
    'sendDateFilter',
    'lastModifiedFilter',
    'actionFilter',
  ];

  stepsFilterDropdown = [];

  programFilterCtrl: UntypedFormControl = new UntypedFormControl(null);
  programFilterData: any = [];
  filteredProgram: Observable<any>;

  // *** FILTER FORMS *********************************/
  studentFilterCtrl = new UntypedFormControl(null);
  schoolFilterCtrl = new UntypedFormControl(null);
  sendDateFilterCtrl = new UntypedFormControl(null);
  lastModifiedFilterCtrl = new UntypedFormControl(null);

  // *** FILTER FORMS *********************************/
  filteredValues = {
    scholar_season: '',
    campuses: null,
    levels: null,
    schools_id: null,
    sector_ids: null,
    speciality_ids: null,
    school: null,
    form_builder_id: null,
    steps: [],
    offset: null,
    last_modified: null,
    send_date: null,
    candidate_last_name: null,
    candidate_statuses: null,
    programs: null,
    program_id: null,
    logged_in_user_type_id: null,
    template_type: null,
  };

  filteredValuesAll = {
    schools_id: 'All',
    programs: 'All',
    candidate_statuses: 'All',
    campuses: 'All',
    levels: 'All',
    sector_ids: 'All',
    speciality_ids: 'All',
    steps: [],
  };

  dialogConfig: MatDialogConfig = {
    disableClose: true,
    minWidth: '750px',
    autoFocus: false,
  };

  dataTable: any;
  classId: any;
  rncpId: any;
  className: any;
  rncpName: any;
  formName: any;
  private timeOutVal: any;
  optionalStep = [];
  normalStep = [];
  stepData: any = [];
  currentUser: any;
  listObjective;
  programId: any;
  currentUserTypeId: any;
  isPermission: any;
  schoolList: any = [];
  allowSendEmail = false;
  filterForm: UntypedFormGroup;

  campusListBackup = [];
  schoolName = '';
  campusName = '';
  levelName = '';

  scholarFilter = new UntypedFormControl('All');
  schoolsFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  levelFilter = new UntypedFormControl(null);
  sectorsFilter = new UntypedFormControl(null);
  specialitiesFilter = new UntypedFormControl(null);
  studentStatusFilter = new UntypedFormControl(null);
  scholarSelected = [];
  campusSelected = [];
  levelSelected = [];
  originalScholar = [];
  scholars = [];
  school = [];
  levels = [];
  campusList = [];
  specilityList = [];
  sectorList = [];
  studentStatusFilterList = [];

  superFilter = {
    scholar_season: '',
    schools_id: null,
    campuses: null,
    levels: null,
    sector_ids: null,
    speciality_ids: null,
  };
  filterBreadcrumbData: any[] = [];
  stepColumn = [];
  optionalStepColumns: any[];
  steps: any;
  optionalSteps: any;

  tempDataFilter = {
    steps: [],
    programs: [],
    status: [],
    schools: [],
  };

  constructor(
    private pageTitleService: PageTitleService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private formFollowUpService: FormFollowUpService,
    private router: Router,
    private parseUTCtoLocal: ParseUtcToLocalPipe,
    private formBuilderService: FormBuilderService,
    private userService: AuthService,
    private dialog: MatDialog,
    private permissions: PermissionService,
    private fb: UntypedFormBuilder,
    private financeService: FinancesService,
    private candidatesService: CandidatesService,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    this.getAllStatusFilter();
    this.getStudentStatusList();
    this.getParamRoute();
    this.initFilterForm();
    this.getDataScholarSeasons();
    this.initSearch();
    this.getPermissions();

    this.isPermission = this.userService.getPermission();
    this.currentUser = JSON.parse(localStorage.getItem('userProfile'));
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    // this.pageTitleService.setIcon('content-paste-search');

    this.steps = new UntypedFormArray([]);
    this.optionalSteps = new UntypedFormArray([]);
    this.stepsFilterDropdown = this.stepsFilterDropdown.sort((a, b) =>
      this.translate.instant(a.viewValue).localeCompare(this.translate.instant(b.viewValue)),
    );

    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getAllStatusFilter();
      this.getStudentStatusList();
      this.filterBreadcrumbFormat();
      this.stepsFilterDropdown = this.stepsFilterDropdown.sort((a, b) =>
        this.translate.instant(a.viewValue).localeCompare(this.translate.instant(b.viewValue)),
      );

      this.scholars = [];
      this.scholars = this.originalScholar.sort((a, b) =>
        a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
      );
      this.scholars.unshift({ _id: 'All', scholar_season: this.translate.instant('AllF') });
      this.scholars = _.uniqBy(this.scholars, '_id');
    });

    if (this.scholarFilter.value && this.scholarFilter.value === 'All') {
      this.getDataForList();
    }
  }

  getAllStatusFilter() {
    this.stepsFilterDropdown = [
      { value: 'not_started', viewValue: this.translate.instant('Step is not done') },
      { value: 'accept', viewValue: this.translate.instant('Step is completed') },
      { value: 'need_validation', viewValue: this.translate.instant('Step is waiting for validation') },
      { value: 'ask_for_revision', viewValue: this.translate.instant('Step is rejected by the validator') },
      {
        value: 'empty',
        viewValue: this.translate.instant('Empty'),
      },
    ];
  }

  getStudentStatusList() {
    this.studentStatusFilterList = [
      { value: 'admission_in_progress', key: 'Admitted', label: this.translate.instant('Admitted') },
      { value: 'bill_validated', key: 'Bill validated', label: this.translate.instant('Bill validated') },
      { value: 'engaged', key: 'Engaged', label: this.translate.instant('Engaged') },
      { value: 'registered', key: 'Registered', label: this.translate.instant('Registered') },
      { value: 'resigned', key: 'Resigned', label: this.translate.instant('Resigned') },
      { value: 'resigned_after_engaged', key: 'Resigned after engaged', label: this.translate.instant('Resigned after engaged') },
      { value: 'resigned_after_registered', key: 'Resign after registered', label: this.translate.instant('Resign after registered') },
      { value: 'report_inscription', key: 'Report Inscription +1', label: this.translate.instant('Report Inscription +1') },
      { value: 'mission_card_validated', key: 'mission_card_validated', label: this.translate.instant('mission_card_validated') },
      { value: 'financement_validated', key: 'Financement valided', label: this.translate.instant('Financement valided') },
      { value: 'in_scholarship', key: 'in_scholarship', label: this.translate.instant('in_scholarship') },
      {
        value: 'resignation_missing_prerequisites',
        key: 'resignation_missing_prerequisites',
        label: this.translate.instant('resignation_missing_prerequisites'),
      },
      { value: 'no_show', key: 'no_show', label: this.translate.instant('no_show') },
      {
        value: 'resign_after_school_begins',
        key: 'resigned_after_school_begins',
        label: this.translate.instant('resigned_after_school_begins'),
      },
    ];

    this.studentStatusFilterList = this.studentStatusFilterList.sort((a, b) =>
      this.translate.instant(a.key).toLowerCase().localeCompare(this.translate.instant(b.key).toLowerCase()),
    );
  }

  getPermissions(): void {
    this.allowSendEmail = Boolean(this.permissions.studentsSendEmail());
  }

  getParamRoute() {
    if (this.route && this.route.snapshot) {
      const params = this.route.snapshot.params;
      this.formId = params && params.formId ? params.formId : '';

      const queryParams = this.route.snapshot.queryParams;
      this.formType = queryParams && queryParams.form_type ? queryParams.form_type : '';
      this.programId = queryParams && queryParams.programId ? queryParams.programId : '';
    }
  }

  setSchoolFilter(value) {
    if (value && value === 'All') {
      this.filteredValues.school = null;
      this.schoolFilterCtrl.setValue(null);
      this.paginator.pageIndex = 0;
      this.getDataTableFormType();
    } else {
      if (this.filteredValues.programs) {
        this.filteredValues.programs = null;
        this.programFilterCtrl.setValue(null);
      }
      this.filteredValues.school = value._id;
      this.schoolFilterCtrl.setValue(value.short_name);
      this.paginator.pageIndex = 0;
      this.getDataTableFormType();
    }
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getDataTableFormType();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getDataForList(data?) {
    const name = data ? data : '';
    const filter = 'filter: { scholar_season_id:' + `"${name}"` + '}';
    this.subs.sink = this.candidatesService.GetAllSchoolFilter(name, filter, this.currentUserTypeId).subscribe(
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

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        // console.log(resp);
        if (resp && resp.length) {
          this.scholars = [];
          this.originalScholar = _.cloneDeep(resp);
          this.scholars = this.originalScholar.sort((a, b) =>
            a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
          );
          this.scholars.unshift({ _id: 'All', scholar_season: this.translate.instant('AllF') });
          this.scholars = _.uniqBy(this.scholars, '_id');
          // this.scholarFilter.setValue(this.scholars[0]._id);
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
    this.school = [];
    this.levels = [];
    this.campusList = [];
    this.sectorList = [];
    this.specilityList = [];
    if (this.schoolsFilter.value) {
      this.schoolsFilter.setValue(null);
    }
    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.sectorsFilter.value) {
      this.sectorsFilter.setValue(null);
    }
    if (this.specialitiesFilter.value) {
      this.specialitiesFilter.setValue(null);
    }

    if (!this.scholarFilter.value || this.scholarFilter.value.length === 0) {
      this.superFilter.scholar_season = '';
      this.scholarSelected = [];
    } else {
      this.superFilter.scholar_season = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.scholarSelected = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : [];
      this.getDataForList(this.superFilter.scholar_season);
    }
  }

  checkSuperfilterSchool() {
    const formValue = this.schoolsFilter.value;
    if (formValue && formValue.length) {
      this.schoolsFilter.patchValue(formValue);
    } else {
      this.schoolsFilter.patchValue(null);
    }
    this.getDataCampus();
  }

  getDataCampus() {
    this.schoolName = '';
    this.levels = [];
    this.campusList = [];
    this.sectorList = [];
    this.specilityList = [];
    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.sectorsFilter.value) {
      this.sectorsFilter.setValue(null);
    }
    if (this.specialitiesFilter.value) {
      this.specialitiesFilter.setValue(null);
    }

    const school = this.schoolsFilter.value;

    if (
      this.currentUser &&
      this.currentUser.entities &&
      this.currentUser.entities.length &&
      this.currentUser.app_data &&
      this.currentUser.app_data.school_package &&
      this.currentUser.app_data.school_package.length &&
      this.schoolsFilter.value &&
      this.schoolsFilter.value.length
    ) {
      school.forEach((element) => {
        const sName = this.school.find((list) => list._id === element);
        if (sName) {
          this.schoolName = this.schoolName ? this.schoolName + ',' + sName.short_name : sName.short_name;
        }
      });
      this.currentUser.app_data.school_package.forEach((element) => {
        if (element && element.school && element.school._id && school.includes(element.school._id) && !school.includes('All')) {
          this.campusList = _.concat(this.campusList, element.school.campuses);
        } else if (element && element.school && element.school._id && school.includes('All')) {
          this.campusList = _.concat(this.campusList, element.school.campuses);
        }
      });
      this.getDataLevel();
    } else {
      if (school && school.length && this.schoolsFilter.value && !this.schoolsFilter.value.includes('All')) {
        school.forEach((element) => {
          const sName = this.school.find((list) => list._id === element);
          this.schoolName = this.schoolName ? this.schoolName + ',' + sName.short_name : sName.short_name;
        });

        const scampusList = this.listObjective.filter((list) => {
          return school.includes(list._id);
        });
        scampusList.filter((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.filter((campusess, nex) => {
              this.campusList.push(campusess);
              this.campusListBackup = this.campusList;
            });
          }
        });
        this.getDataLevel();
      } else if (school && school.length && this.schoolsFilter.value && this.schoolsFilter.value.includes('All')) {
        this.listObjective.forEach((campus) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.forEach((campusess) => {
              this.campusList.push(campusess);
            });
          }
        });
        this.getDataLevel();
      } else {
        this.getDataLevel();
        this.campusList = [];
        this.specilityList = [];
        this.sectorList = [];
      }
    }
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
    this.campusList = _.uniqBy(this.campusList, 'name');
    this.campusList = this.campusList.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }

  checkSuperfilterCampus() {
    const formValue = this.campusFilter.value;
    if (formValue && formValue.length) {
      this.campusFilter.patchValue(formValue);
    } else {
      this.campusFilter.patchValue(null);
    }
    this.getDataLevel();
  }

  getDataLevel() {
    this.levels = [];
    this.sectorList = [];
    this.specilityList = [];
    this.campusName = '';
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.sectorsFilter.value) {
      this.sectorsFilter.setValue(null);
    }
    if (this.specialitiesFilter.value) {
      this.specialitiesFilter.setValue(null);
    }
    this.campusSelected = [];
    const schools = this.schoolsFilter.value;
    const sCampus = this.campusFilter.value;

    if (
      this.currentUser &&
      this.currentUser.entities &&
      this.currentUser.entities.length &&
      this.currentUser.app_data &&
      this.currentUser.app_data.school_package &&
      this.currentUser.app_data.school_package.length &&
      this.campusFilter.value &&
      this.campusFilter.value.length
    ) {
      if (sCampus && sCampus.length && !sCampus.includes('All')) {
        this.currentUser.app_data.school_package.forEach((element) => {
          if (element && element.school && element.school._id && (schools.includes(element.school._id) || schools.includes('All'))) {
            const sLevelList = this.campusList.filter((list) => {
              return sCampus.includes(list._id);
            });

            sLevelList.forEach((lev) => {
              if (lev && lev.levels && lev.levels.length) {
                this.levels = _.concat(this.levels, lev.levels);
              }
            });
          }
        });
      } else if (sCampus && sCampus.length && sCampus.includes('All') && this.campusList && this.campusList.length) {
        this.campusList.forEach((lev) => {
          if (lev && lev.levels && lev.levels.length) {
            this.levels = _.concat(this.levels, lev.levels);
          }
        });
      }
    } else {
      if (schools && sCampus && sCampus.length && schools.length && this.campusFilter.value && !this.campusFilter.value.includes('All')) {
        sCampus.forEach((element) => {
          const sName = this.campusList.find((list) => {
            return list._id === element;
          });
          this.campusSelected.push(sName._id);
          this.campusName = this.campusName ? this.campusName + ',' + sName.name : sName.name;
        });
        const sLevelList = this.campusList.filter((list) => {
          return sCampus.includes(list._id);
        });
        sLevelList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
            });
          }
        });
      } else if (
        schools &&
        sCampus &&
        sCampus.length &&
        schools.length &&
        this.campusFilter.value &&
        this.campusFilter.value.includes('All')
      ) {
        this.campusList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
            });
          }
        });
      } else {
        this.levels = [];
        this.sectorList = [];
        this.specilityList = [];
      }
    }
    this.levels = _.uniqBy(this.levels, 'name');
    this.levels = this.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }

  checkSuperfilterLevel() {
    const formValue = this.levelFilter.value;
    if (formValue && formValue.length) {
      this.levelFilter.patchValue(formValue);
    } else {
      this.levelFilter.patchValue(null);
    }
    this.getDataSector();
  }

  getDataSector() {
    if (this.sectorsFilter.value) {
      this.sectorsFilter.setValue(null);
    }
    if (this.specialitiesFilter) {
      this.specialitiesFilter.setValue(null);
    }
    this.sectorList = [];
    this.specilityList = [];
    let filterLevel = [];
    let filterCampus = [];
    let filterSchool = [];
    if (this.levelFilter.value && this.levelFilter.value.includes('All') && this.levels && this.levels.length) {
      filterLevel = this.levels.map((level) => level._id);
    }
    if (this.campusFilter.value && this.campusFilter.value.includes('All') && this.campusList && this.campusList.length) {
      filterCampus = this.campusList.map((campus) => campus._id);
    }
    if (this.schoolsFilter.value && this.schoolsFilter.value.includes('All') && this.school && this.school.length) {
      filterSchool = this.school.map((school) => school._id);
    }
    const filter = {
      scholar_season_id:
        this.superFilter.scholar_season && this.superFilter.scholar_season !== 'All' ? this.superFilter.scholar_season : null,
      candidate_school_ids:
        filterSchool && filterSchool.length ? filterSchool : this.superFilter.schools_id ? this.superFilter.schools_id : null,
      campuses: filterCampus && filterCampus.length ? filterCampus : this.superFilter.campuses ? this.superFilter.campuses : null,
      levels: filterLevel && filterLevel.length ? filterLevel : this.superFilter.levels ? this.superFilter.levels : null,
    };
    if (this.superFilter.levels?.length || filterLevel?.length) {
      this.subs.sink = this.financeService.GetAllSectorsDropdown(filter).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.sectorsFilter.setValue(null);
            this.specialitiesFilter.setValue(null);
            this.superFilter.sector_ids = null;
            this.superFilter.speciality_ids = null;
            this.sectorList = resp;
            this.sectorList = _.uniqBy(this.sectorList, 'name');
            this.sectorList = this.sectorList.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
          }
        },
        (err) => {
          // Record error log
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
          }
        },
      );
    } else {
      this.sectorsFilter.setValue(null, { emitEvent: false });
      this.specialitiesFilter.setValue(null, { emitEvent: false });
      this.superFilter.sector_ids = null;
      this.superFilter.speciality_ids = null;
      this.sectorList = [];
      this.specilityList = [];
    }
  }

  checkSuperfilterSector() {
    const formValue = this.sectorsFilter.value;
    if (formValue && formValue.length) {
      this.sectorsFilter.patchValue(formValue);
    } else {
      this.sectorsFilter.patchValue(null);
    }
    this.getDataSpeciality();
  }
  getDataSpeciality() {
    if (this.specialitiesFilter.value) {
      this.specialitiesFilter.setValue(null);
    }
    this.specilityList = [];
    let filterLevel = [];
    let filterCampus = [];
    let filterSchool = [];
    let filterSector = [];

    if (this.levelFilter.value && this.levelFilter.value.includes('All') && this.levels && this.levels.length) {
      filterLevel = this.levels.map((level) => level._id);
    }
    if (this.campusFilter.value && this.campusFilter.value.includes('All') && this.campusList && this.campusList.length) {
      filterCampus = this.campusList.map((campus) => campus._id);
    }
    if (this.schoolsFilter.value && this.schoolsFilter.value.includes('All') && this.school && this.school.length) {
      filterSchool = this.school.map((school) => school._id);
    }
    if (this.sectorsFilter.value && this.sectorsFilter.value.includes('All') && this.sectorList && this.sectorList.length) {
      filterSector = this.sectorList.map((sector) => sector._id);
    }
    const filter = {
      scholar_season_id:
        this.superFilter.scholar_season && this.superFilter.scholar_season !== 'All' ? this.superFilter.scholar_season : null,
      candidate_school_ids:
        filterSchool && filterSchool.length ? filterSchool : this.superFilter.schools_id ? this.superFilter.schools_id : null,
      campuses: filterCampus && filterCampus.length ? filterCampus : this.superFilter.campuses ? this.superFilter.campuses : null,
      levels: filterLevel && filterLevel.length ? filterLevel : this.superFilter.levels ? this.superFilter.levels : null,
      sectors: filterSector && filterSector.length ? filterSector : this.superFilter.sector_ids ? this.superFilter.sector_ids : null,
    };
    if (this.superFilter.sector_ids || (this.sectorsFilter.value && this.sectorsFilter.value.includes('All'))) {
      this.subs.sink = this.candidatesService.GetAllSpecializationsByScholar(filter).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.specialitiesFilter.setValue(null);
            this.superFilter.speciality_ids = null;
            this.specilityList = resp;
            this.specilityList = _.uniqBy(this.specilityList, 'name');
            this.specilityList = this.specilityList.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
          }
        },
        (err) => {
          // Record error log
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
          }
        },
      );
    } else {
      this.specialitiesFilter.setValue(null, { emitEvent: false });
      this.superFilter.speciality_ids = null;
      this.specilityList = [];
    }
  }

  checkSuperfilterSpeciality() {
    const formValue = this.specialitiesFilter.value;
    if (formValue && formValue.length) {
      this.specialitiesFilter.patchValue(formValue);
    } else {
      this.specialitiesFilter.patchValue(null);
    }
  }

  getDataTableFormType() {
    this.getAllStudentAdmissionProcesses();
  }

  resetColumn() {
    this.displayedColumns = ['select', 'student', 'school', 'program', 'studentStatus', 'sendDate', 'lastModified', 'action'];
    this.filterColumns = [
      'selectFilter',
      'studentFilter',
      'schoolFilter',
      'programFilter',
      'studentStatusFilter',
      'sendDateFilter',
      'lastModifiedFilter',
      'actionFilter',
    ];
  }

  setUpStepsColumns(steps) {
    this.resetColumn();

    if (steps?.length) {
      steps.forEach((element, index) => {
        this.displayedColumns.splice(3 + index, 0, element.name);
        this.filterColumns.splice(3 + index, 0, `${element.name}_filter`);
        // console.log('filterColumns', this.filterColumns);
      });

      this.displayedColumns = _.uniqBy(this.displayedColumns);
      this.filterColumns = _.uniqBy(this.filterColumns);
    } else {
      this.resetColumn();
    }
  }

  constructStepMatrix(resp) {
    // console.log('from matrix', resp);
    resp.forEach((element, index) => {
      const boolArray: any[] = element.steps;
      this.statusMatrix[index] = boolArray;
    });
  }

  initFilterForm() {
    this.filterForm = this.fb.group({
      schools: [null],
      campuses: [null],
      levels: [null],
    });
  }

  // SEARCH TABLE DATA
  initSearch() {
    this.subs.sink = this.studentFilterCtrl.valueChanges.pipe(debounceTime(500)).subscribe((searchText) => {
      const symbol = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/;
      const symbol1 = /\\/;
      if (!searchText.match(symbol) && !searchText.match(symbol1)) {
        this.filteredValues.candidate_last_name = searchText ? searchText : '';
        this.paginator.pageIndex = 0;
        this.getDataTableFormType();
      } else {
        this.studentFilterCtrl.setValue('');
        this.filteredValues.candidate_last_name = '';
        this.paginator.pageIndex = 0;
        this.getDataTableFormType();
      }
    });

    this.subs.sink = this.lastModifiedFilterCtrl.valueChanges.pipe(debounceTime(500)).subscribe((searchText) => {
      if (searchText) {
        const newDate = moment(searchText).format('DD/MM/YYYY');
        this.filteredValues.last_modified = newDate;
        this.filteredValues.offset = moment(searchText).utcOffset();
        this.paginator.pageIndex = 0;
        this.getDataTableFormType();
      } else {
        this.filteredValues.last_modified = null;
        this.filteredValues.offset = null;
        this.paginator.pageIndex = 0;
        this.getDataTableFormType();
      }
    });

    this.subs.sink = this.sendDateFilterCtrl.valueChanges.pipe(debounceTime(500)).subscribe((searchText) => {
      if (searchText) {
        const newDate = moment(searchText).format('DD/MM/YYYY');
        this.filteredValues.send_date = newDate;
        this.filteredValues.offset = moment(searchText).utcOffset();
        this.paginator.pageIndex = 0;
        this.getDataTableFormType();
      } else {
        this.filteredValues.send_date = null;
        this.filteredValues.offset = null;
        this.paginator.pageIndex = 0;
        this.getDataTableFormType();
      }
    });

    // start superfilter
    this.subs.sink = this.schoolsFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.levels = null;
      this.superFilter.campuses = null;
      this.superFilter.schools_id = statusSearch && statusSearch.length ? statusSearch : null;
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.levels = null;
      this.superFilter.campuses = statusSearch && statusSearch.length ? statusSearch : null;
    });

    this.subs.sink = this.levelFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.levels = statusSearch && statusSearch.length ? statusSearch : null;
    });

    this.subs.sink = this.sectorsFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.sector_ids = statusSearch && statusSearch.length ? statusSearch : null;
    });

    this.subs.sink = this.specialitiesFilter.valueChanges.subscribe((statusSearch) => {
      this.superFilter.speciality_ids = statusSearch && statusSearch.length ? statusSearch : null;
    });
    // end superfilter
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.dataUnselect = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.isCheckedAll = true;
      this.dataUnselect = [];
      this.dataSource.data.map((row) => {
        if (!this.dataUnselect.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  showOptions(info, row) {
    if (this.isCheckedAll) {
      if (row) {
        if (!this.dataUnselect.includes(row._id)) {
          this.dataUnselect.push(row._id);
          this.selection.deselect(row._id);
        } else {
          const indx = this.dataUnselect.findIndex((list) => list === row._id);
          this.dataUnselect.splice(indx, 1);
          this.selection.select(row._id);
        }
      }
    } else {
      if (row) {
        if (this.dataSelected && this.dataSelected.length) {
          const dataFilter = this.dataSelected.filter((resp) => resp._id === row._id);
          if (dataFilter && dataFilter.length < 1) {
            this.dataSelected.push(row);
          } else {
            const indexFilter = this.dataSelected.findIndex((resp) => resp._id === row._id);
            this.dataSelected.splice(indexFilter, 1);
          }
        } else {
          this.dataSelected.push(row);
        }
      }
    }
    const numSelected = this.dataSelected.length;
    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.userSelected.push(user);
      this.userSelectedId.push(user._id);
    });
  }

  mappedStep(data) {
    this.steps = new UntypedFormArray([]);
    this.optionalSteps = new UntypedFormArray([]);
    this.statusStep = [];
    this.normalStep = [];
    this.statusMatrix = [];
    this.filteredValuesAll.steps = [];
    let tempOptional = [];
    let tempNormal = [];

    if (Array.isArray(this.stepData)) {
      this.stepData.map((data, index) => {
        if (data.is_only_visible_based_on_condition) {
          this.optionalStep.push(data._id);
          tempOptional.push(data._id);
        } else {
          this.normalStep.push(data._id);
          tempNormal.push(data._id);
        }
      });
      if (this.stepData.length) {
        for (let i = 0; i < this.stepData.length; i++) {
          if (!this.stepData[i].is_only_visible_based_on_condition) {
            const findIndex = tempNormal.findIndex((step) => step && this.stepData[i] && step === this.stepData[i]._id);
            if (findIndex >= 0) {
              this.statusStep.push({
                id: tempNormal[findIndex],
                name: `S${findIndex + 1}`,
                step: findIndex,
                statuses: [],
              });
              this.steps.push(new UntypedFormControl(null));
              if (this.filteredValues?.steps?.length) {
                const findStep = this.filteredValues?.steps.find(
                  (step) => step?.step_index === findIndex && step?.step_type_selected === 'mandatory',
                );
                if (!findStep) {
                  this.filteredValues?.steps?.push({ step: null, statuses: [], step_index: findIndex, step_type_selected: 'mandatory' });
                }
              } else {
                this.filteredValues?.steps?.push({ step: null, statuses: [], step_index: findIndex, step_type_selected: 'mandatory' });
              }
              if (this.tempDataFilter?.steps?.length) {
                const findStepTemp = this.tempDataFilter?.steps.find(
                  (step) => step?.step_index === findIndex && step?.step_type_selected === 'mandatory',
                );
                if (!findStepTemp) {
                  this.tempDataFilter?.steps?.push({ step: null, statuses: [], step_index: findIndex, step_type_selected: 'mandatory' });
                }
              } else {
                this.tempDataFilter?.steps?.push({ step: null, statuses: [], step_index: findIndex, step_type_selected: 'mandatory' });
              }
              // this.filteredValuesAll?.steps?.push('All');
              this.filteredValuesAll?.steps?.push({ statuses: 'All' });
            }
          } else if (this.stepData[i].is_only_visible_based_on_condition) {
            const findIndex = tempOptional.findIndex((step) => step && this.stepData[i] && step === this.stepData[i]._id);
            if (findIndex >= 0) {
              this.statusStep.push({
                id: tempOptional[findIndex],
                name: `O${findIndex + 1}`,
                step: findIndex,
                statuses: [],
              });
              this.optionalStep.push(new UntypedFormControl(null));
              this.steps.push(new UntypedFormControl(null));
              if (this.filteredValues?.steps?.length) {
                const findStep = this.filteredValues?.steps.find(
                  (step) => step?.step_index === findIndex && step?.step_type_selected === 'option',
                );
                if (!findStep) {
                  this.filteredValues?.steps?.push({ step: null, statuses: [], step_index: findIndex, step_type_selected: 'option' });
                }
              } else {
                this.filteredValues?.steps?.push({ step: null, statuses: [], step_index: findIndex, step_type_selected: 'option' });
              }
              if (this.tempDataFilter?.steps?.length) {
                const findStepTemp = this.tempDataFilter?.steps.find(
                  (step) => step?.step_index === findIndex && step?.step_type_selected === 'option',
                );
                if (!findStepTemp) {
                  this.tempDataFilter?.steps?.push({ step: null, statuses: [], step_index: findIndex, step_type_selected: 'option' });
                }
              } else {
                this.tempDataFilter?.steps?.push({ step: null, statuses: [], step_index: findIndex, step_type_selected: 'option' });
              }
              // this.filteredValuesAll?.steps?.push('All');
              this.filteredValuesAll?.steps?.push({ statuses: 'All' });
            }
          }
        }
      }
      if (this.filteredValues.steps && this.filteredValues.steps.length > 0) {
        let columnFilter = [];
        this.filteredValues.steps.forEach((filterstep) => {
          this.statusStep.forEach((status, indexStatus) => {
            if (filterstep?.step === indexStatus) {
              const prevFilter = {
                index: indexStatus,
                value: filterstep?.statuses,
              };
              columnFilter.push(prevFilter);
            }
          });
        });
        columnFilter.forEach((col) => {
          this.steps.controls[col?.index].setValue(col?.value);
        });
      }

      if (this.statusStep.length) {
        for (let i = 0; i < this.statusStep.length; i++) {
          this.statusForm[this.statusStep[i].name] = '';
        }
        this.setUpStepsColumns(this.statusStep);
        this.dataSource.data = data;
        this.constructStepMatrix(data);
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      } else {
        this.dataSource.data = data;
        this.setUpStepsColumns([]);
      }
    }
  }

  stepFiltered(stepOption) {
    const steps = [];
    this.steps?.controls?.forEach((element, index) => {
      if (element.value) {
        const step = {
          step_index: index,
          value: element.value,
          // step_type_selected: `mandatory`,
        };
        steps.push(step);
      }
    });
    this.optionalSteps?.controls?.forEach((element, index) => {
      if (element.value) {
        const step = {
          step_index: index,
          value: element.value,
          // step_type_selected: `option`,
        };
        steps.push(step);
      }
    });

    if (steps.length > 0) {
      this.filteredValues.steps = steps;
      this.getDataTableFormType();
    } else {
      this.filteredValues.steps = null;
      this.getDataTableFormType();
    }
  }
  sortData(sort: Sort) {
    // console.log('sort', sort);
    if (sort.active.includes('step_status')) {
      const indexStep = sort.active.substring(sort.active.length - 1);
      // console.log('indexStep', indexStep);
      // console.log('statusStep', this.statusStep);
      const sortStep = {
        steps: {
          step_index: indexStep,
          step_status: sort.direction ? sort.direction : `asc`,
        },
      };
      // console.log('sortStep', sortStep);
      this.sortValue = sortStep;
    } else {
      this.sortValue = this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    }
    if (!this.isWaitingForResponse) {
      this.paginator.pageIndex = 0;
      this.getDataTableFormType();
    }
  }

  resetCheckbox() {
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.dataUnselect = [];
    this.allStudentsEmail = [];
    this.allIdForReminder = [];
  }

  resetSelection() {
    // this.isReset = true;
    this.resetCheckbox();
    this.paginator.pageIndex = 0;
    this.school = [];
    this.levels = [];
    this.campusList = [];
    this.specilityList = [];
    this.sectorList = [];
    this.filteredValues = {
      form_builder_id: this.formId,
      steps: [],
      offset: null,
      last_modified: null,
      send_date: null,
      candidate_last_name: null,
      candidate_statuses: null,
      programs: null,
      program_id: this.programId,
      logged_in_user_type_id: this.currentUserTypeId,
      template_type: this.formType,
      school: null,
      scholar_season: '',
      campuses: null,
      levels: null,
      schools_id: null,
      sector_ids: null,
      speciality_ids: null,
    };

    this.superFilter = {
      scholar_season: '',
      schools_id: null,
      campuses: null,
      levels: null,
      sector_ids: null,
      speciality_ids: null,
    };

    // clear all forms in blockForms
    for (const key of Object.keys(this.statusForm)) {
      this.statusForm[key] = '';
    }

    this.sortValue = null;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.programFilterCtrl.patchValue(null, { emitEvent: false });
    this.studentStatusFilter.setValue(null, { emitEvent: false });
    this.studentFilterCtrl.patchValue(null, { emitEvent: false });
    this.sendDateFilterCtrl.patchValue(null, { emitEvent: false });
    this.schoolFilterCtrl.patchValue(null, { emitEvent: false });
    this.lastModifiedFilterCtrl.patchValue(null, { emitEvent: false });
    this.campusFilter.patchValue(null);
    this.levelFilter.patchValue(null);
    this.sectorsFilter.patchValue(null);
    this.specialitiesFilter.patchValue(null);
    this.schoolsFilter.patchValue(null);
    this.scholarFilter.patchValue('All');
    this.filterBreadcrumbData = [];
    if (this.stepData.length > 0 && this.steps?.length) {
      this.stepData.forEach((element, index) => {
        this.steps.controls[index].setValue(null);
      });
    }

    this.getDataTableFormType();

    if (this.scholarFilter.value && this.scholarFilter.value === 'All') {
      this.getDataForList();
    }
  }

  cleanFilterData() {
    this.filteredValues.offset = moment().utcOffset();
    const filterData = _.cloneDeep(this.filteredValues);
    Object.keys(filterData).forEach((key) => {
      if (!filterData[key] && filterData[key] !== false) {
        delete filterData[key];
      }
    });
    if (filterData?.steps?.length !== 0) {
      const tempData = [];
      filterData?.steps?.forEach((val) => {
        if (val?.step || val?.step === 0) {
          tempData.push(val);
        }
      });
      if (tempData?.length) {
        filterData.steps = tempData;
      } else {
        delete filterData.steps;
      }
    } else {
      delete filterData.steps;
    }
    filterData?.steps?.map((step) => {
      delete step?.step_index;
      delete step?.step_type_selected;
    });

    return filterData;
  }

  getAllStudentAdmissionProcesses() {
    // Need update later on ERP_052 Phase 06
    // return;
    this.isWaitingForResponse = true;
    // console.log(this.paginator);
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    const newFilterValues = {
      ...this.cleanFilterData(),
      form_builder_id: this.formId,
      program_id: this.programId,
      logged_in_user_type_id: this.currentUserTypeId,
      template_type: this.formType, // for now we use a fix value for this filter
    };
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = forkJoin([
      this.formBuilderService.getFormBuilderTemplateFirstTab(this.formId),
      this.formFollowUpService.getAllFormFollowUpProcesses(pagination, newFilterValues, this.sortValue, userTypesList),
    ]).subscribe(
        ([formBuilderData, formProcessesData]) => {
          if (formBuilderData) {
            this.dataTable = formBuilderData;
            this.setPageTitle();
          }
          if (Array.isArray(formBuilderData?.steps)) {
            this.stepData = formBuilderData.steps;
          } else {
            this.stepData = [];
          }
          if (Array.isArray(formProcessesData)) {
            this.studentAdmissionData = cloneDeep(formProcessesData);
            this.studentAdmissionCount = formProcessesData?.[0]?.count_document || 0;

            this.studentAdmissionData.forEach((items) => {
              items['is_student_process_in_validation'] = items.steps.some((item) => {
                return item?.step_status === 'need_validation';
              });
            });
            this.mappedStep(formProcessesData);
          } else {
            this.dataSource.data = [];
            this.paginator.length = 0;
            this.studentAdmissionCount = 0;
          }
          this.noData = !this.studentAdmissionCount;
          this.filterBreadcrumbData = [];
          this.filterBreadcrumbFormat();
          this.isWaitingForResponse = false;
        },
        (err) => {
          // Record error log
          this.userService.postErrorLog(err);
          this.isWaitingForResponse = false;
        },
      );

    this.getDropdown();
  }

  getStepStatus(stepMatrix) {
    let stepStatus;
    if (stepMatrix) {
      stepStatus = stepMatrix.step_status;
    }
    return stepStatus;
  }

  getStepColor(stepMatrix) {
    let stepColor;
    if (stepMatrix) {
      switch (stepMatrix.step_status) {
        case 'not_started':
          stepColor = 'black';
          break;
        case 'accept':
          stepColor = 'green';
          break;
        case 'ask_for_revision':
          stepColor = 'red';
          break;
        case 'need_validation':
          stepColor = 'orange';
          break;
        default:
          stepColor = '';
          break;
      }
    }
    return stepColor;
  }

  setPageTitle() {
    // this.pageTitleService.setIcon('content-paste-search');
    this.pageTitleService.setTitle(
      this.translate.instant('TITLE_FORM_FOLLOW_UP_DETAIL', {
        form_builder_name: this.dataTable.form_builder_name,
      }),
    );

    // Listen to language changes to reset page title
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      // this.pageTitleService.setIcon('content-paste-search');
      this.pageTitleService.setTitle(
        this.translate.instant('TITLE_FORM_FOLLOW_UP_DETAIL', {
          form_builder_name: this.dataTable.form_builder_name,
        }),
      );
    });
  }

  goToForm(form) {
    if (form && form._id) {
      const domainUrl = this.router.url.split('/')[0];
      const formType = this.formType === 'admission_document' ? 'admissionDocument' : this.formType;
      window.open(
        `${domainUrl}/form-filling?formId=${form._id}&formType=${formType}&userId=${this.currentUser._id}&userTypeId=${this.currentUserTypeId}`,
        '_blank',
      );
    }
  }

  checkSendReminder(data?, where?) {
    let timeDisabled = 3;
    this.isWaitingNotify = true;
    Swal.fire({
      title: this.translate.instant('Reminder_ONE_TIME_FORM.Title'),
      text: this.translate.instant('Reminder_ONE_TIME_FORM.Text'),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('Reminder_ONE_TIME_FORM.Button1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('Reminder_ONE_TIME_FORM.Button2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('Reminder_ONE_TIME_FORM.Button1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('Reminder_ONE_TIME_FORM.Button1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((resp: any) => {
      clearTimeout(this.timeOutVal);
      if (resp.value) {
        if (this.formType === 'admission_document') {
          this.subs.sink = this.formFollowUpService.sendReminderAdmissionDocument(null, data._id, null).subscribe(
            async () => {
              Swal.fire({
                type: 'success',
                title: 'Bravo',
                confirmButtonText: 'OK',
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              });
              this.isWaitingNotify = false;
            },
            (error) => {
              // Record error log
              this.userService.postErrorLog(error);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
              this.isWaitingNotify = false;
            },
          );
        } else {
          const lang = localStorage.getItem('currentLang');
          let cloneSelected = [];
          if (where === 'single') {
            cloneSelected = [data];
          } else {
            cloneSelected = _.cloneDeep(this.dataSelected);
          }
          const formProcessids = cloneSelected.map((datas) => datas._id);
          // console.log('cloneSelected', cloneSelected);
          this.subs.sink = this.formFollowUpService.sendReminderOneTimeForm(formProcessids, null, lang).subscribe(
            async () => {
              Swal.fire({
                type: 'success',
                title: 'Bravo',
                confirmButtonText: 'OK',
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              });
              this.isWaitingNotify = false;
              this.resetCheckbox();
            },
            (error) => {
              // Record error log
              this.userService.postErrorLog(error);

              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
              this.isWaitingNotify = false;
            },
          );
        }
      }
      this.isWaitingNotify = false;
    });
  }

  async fireDefaultNotificationReminderSwal(data) {
    if (!data) {
      return;
    }
    let timeDisabled = 2;
    return await Swal.fire({
      title: this.translate.instant('NO_STEP_REMINDER.TITLE', {
        civility: this.translate.instant(data.user_id.civility),
        firstName: data.user_id.first_name,
        lastName: data.user_id.last_name,
      }),
      html: this.translate.instant('NO_STEP_REMINDER.HTML_TEXT', {
        templateName: this.formName,
        stepName: this.checkUserStepStatus(data),
      }),
      type: 'warning',
      showCancelButton: true,
      allowEscapeKey: true,
      confirmButtonText: this.translate.instant('NO_STEP_REMINDER.BUTTON_1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('NO_STEP_REMINDER.BUTTON_2'),
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const time = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('NO_STEP_REMINDER.BUTTON_1') + ' in ' + timeDisabled + ' sec';
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('NO_STEP_REMINDER.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(time);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    });
  }

  sendReminderFormProcess(data) {
    if (!data) {
      return;
    }
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFollowUpService.sendReminderFormProcess(data._id, this.translate.currentLang).subscribe(
      (resp) => {
        if (resp) {
          // console.log(resp);
          Swal.fire({
            type: 'success',
            title: 'Bravo',
          });
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        // Record error log
        this.userService.postErrorLog(err);
      },
    );
  }

  checkUserStepStatus(data) {
    let listStep = `<br>`;
    data.steps.forEach((element, index) => {
      if (element?.step_status !== 'accept') {
        listStep += `-` + element.step_title;
      }
    });
    return listStep;
  }

  leaveDetails() {
    if (this.formType === 'admission_document') {
      this.router.navigate(['form-follow-up/admission-document-follow-up']);
    } else {
      this.router.navigate(['form-follow-up']);
    }
  }

  ngOnDestroy(): void {
    // this.pageTitleService.setFormFollowUp(null);
    clearTimeout(this.timeOutVal);
    this.subs.unsubscribe();
  }

  translateDate(date) {
    return this.parseUTCtoLocal.transform(date);
    // return moment(trnslateDate).format('DD/MM/YYYY hh:mm');
  }

  toUppercase(data) {
    if (data) {
      return data.toUpperCase();
    }
  }

  getDropdown() {
    const templateType = ['admission_document'];
    const userTypesList = this.currentUser?.app_data?.user_type_id ? this.currentUser.app_data.user_type_id : [];
    if (this.formType === 'one_time_form') {
      this.subs.sink = this.formFollowUpService.getAllGeneralFormFollowUpDropdown(this.formId, userTypesList).subscribe(
        (res) => {
          if (res) {
            let dataPrograms = _.uniqBy(res.program_ids, 'program');
            // console.log('dataPrograms', dataPrograms);
            const dataSchools = _.uniqBy(
              res.program_ids?.map((data) => data.school_id),
              '_id',
            );

            const schoolFilter = this.filteredValues.school;
            if (schoolFilter) {
              dataPrograms = _.uniqBy(
                res.program_ids?.filter((data) => data.school_id._id === schoolFilter),
                'program',
              );
            }
            // data dropdown programs general
            this.programFilterData = dataPrograms.sort((a, b) => a.program.localeCompare(b.program));
            // data dropdown schools general
            this.schoolList = dataSchools;
            this.schoolList = this.schoolList.sort((a, b) => a.short_name.localeCompare(b.short_name));

            // data dropdown programs general
            this.programFilterData = dataPrograms.sort((a, b) => a.program.localeCompare(b.program));
            this.filteredProgram = this.programFilterCtrl.valueChanges.pipe(
              startWith(''),
              map((searchTxt) =>
                searchTxt
                  ? this.programFilterData.filter((pro) => pro.program.toLowerCase().trim().includes(searchTxt.toLowerCase().trim()))
                  : this.programFilterData,
              ),
            );
            // data dropdown schools general
            this.schoolList = uniqBy(dataSchools, 'short_name');
            this.schoolList = this.schoolList.sort((a, b) => a.short_name.localeCompare(b.short_name));
            this.filteredSchoolOrigin = this.schoolFilterCtrl.valueChanges.pipe(
              startWith(''),
              map((searchTxt) =>
                searchTxt
                  ? this.schoolList.filter((sch) => sch.short_name.toLowerCase().trim().includes(searchTxt.toLowerCase().trim()))
                  : this.schoolList,
              ),
            );
          }
        },
        (err) => {
          // Record error log
          this.userService.postErrorLog(err);
        },
      );
    } else {
      this.subs.sink = this.formFollowUpService.getAllFormFollowUpDropdown(templateType, userTypesList).subscribe(
        (res) => {
          if (res && res.program_ids && res.program_ids.length > 0) {
            this.programFilterData = res.program_ids.filter((response) => response._id === this.programId);
            this.programFilterData = this.programFilterData.sort((a, b) => a.program.localeCompare(b.program));
            this.filteredProgram = this.programFilterCtrl.valueChanges.pipe(
              startWith(''),
              map((searchTxt) =>
                searchTxt
                  ? this.programFilterData.filter((pro) => pro.program.toLowerCase().trim().includes(searchTxt.toLowerCase().trim()))
                  : this.programFilterData,
              ),
            );
            const dataSchools = _.uniqBy(
              res.program_ids?.map((data) => data.school_id),
              '_id',
            );
            this.schoolList = dataSchools;
            this.schoolList = this.schoolList.sort((a, b) => a.short_name.localeCompare(b.short_name));
          } else {
            this.programFilterData = [];
          }
        },
        (err) => {
          // Record error log
          this.userService.postErrorLog(err);
        },
      );
    }
  }

  checkStepOneTime(data) {
    let result;
    const completeStep = data.filter((datas) => datas?.step_status === 'accept').length;
    if (completeStep === data.length && this.formType === 'one_time_form') {
      result = true;
    } else {
      result = false;
    }
    return result;
  }

  getAllIdForSendReminder(pageNumber) {
    if (this.isCheckedAll) {
      if (pageNumber === 0) {
        this.allIdForReminder = [];
        this.dataSelected = [];
      }
      const pagination = {
        limit: 500,
        page: pageNumber,
      };
      this.isWaitingForResponse = true;
      const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];

      const newFilterValues = {
        ...this.cleanFilterData(),
        form_builder_id: this.formId,
        program_id: this.programId,
        logged_in_user_type_id: this.currentUserTypeId,
        template_type: this.formType, // for now we use a fix value for this filter
      };

      this.subs.sink = this.formFollowUpService
        .getAllIdForSendReminder(pagination, newFilterValues, this.sortValue, userTypesList)
        .subscribe(
          (data: any) => {
            if (data && data.length) {
              const resp = _.cloneDeep(data);
              this.allIdForReminder = _.concat(this.allIdForReminder, resp);
              const page = pageNumber + 1;
              this.getAllIdForSendReminder(page);
            } else {
              this.isWaitingForResponse = false;
              if (this.isCheckedAll) {
                if (this.allIdForReminder && this.allIdForReminder.length) {
                  this.dataSelected = this.allIdForReminder.filter((list) => !this.dataUnselect.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length) {
                    this.sendReminderOneTime();
                  }
                }
              }
            }
          },
          (err) => {
            // Record error log
            this.userService.postErrorLog(err);
            this.isReset = false;
            this.isWaitingForResponse = false;
            console.log(err);
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
      // function send reminder
      this.sendReminderOneTime();
    }
  }

  sendReminderOneTime() {
    // console.log('data selected::', this.dataSelected);

    if (this.selection.selected.length < 1) {
      this.trigerSwalFollowS8();
    } else {
      this.checkSendReminder();
    }
  }

  trigerSwalFollowS8() {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('Followup_S8.Title'),
      html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Students') }),
      confirmButtonText: this.translate.instant('Followup_S8.Button'),
    });
  }

  getAllStudentsForSendingMail(page: number) {
    if (this.isCheckedAll) {
      if (page === 0) {
        this.dataSelected = [];
        this.allStudentsEmail = [];
      }
      const pagination = { limit: 500, page };
      const sort = this.sortValue;
      this.isWaitingForResponse = true;

      const newFilterValues = {
        ...this.cleanFilterData(),
        form_builder_id: this.formId,
        program_id: this.programId,
        logged_in_user_type_id: this.currentUserTypeId,
        template_type: this.formType, // for now we use a fix value for this filter
      };

      const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
      this.subs.sink = this.formFollowUpService.getAllEmailFormProcess(pagination, newFilterValues, sort, userTypesList).subscribe(
        (students: any) => {
          if (students && students.length && students.length > 0) {
            this.allStudentsEmail.push(...students);
            this.getAllStudentsForSendingMail(page + 1);
          } else {
            this.isWaitingForResponse = false;
            if (this.isCheckedAll && this.allStudentsEmail && this.allStudentsEmail.length) {
              this.dataSelected = this.allStudentsEmail.filter((email) => !this.dataUnselect.includes(email._id));
              if (this.dataSelected && this.dataSelected.length) {
                this.openSendMultipleEmailDialog();
              }
            }
          }
        },
        (err: any) => {
          // Record error log
          this.userService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          });
        },
      );
    } else {
      this.openSendMultipleEmailDialog();
    }
  }

  openSendSingleEmailDialog(student: any) {
    if (student) {
      const tempFinancialSupport = student?.candidate_id?.payment_supports?.map((supportData) => {
        supportData.intake_channel = student?.program;
        supportData.candidate = {
          _id: student?.candidate_id?._id,
        };

        return supportData;
      })
      const mappedData = {
        candidate_id: {
          candidate_admission_status: student?.candidate_id?.candidate_admission_status,
          candidate: {
            _id: student?.candidate_id?._id,
          },
          civility: student?.candidate_id?.civility,
          email: student?.candidate_id?.email,
          emailDefault: student?.candidate_id?.school_mail,
          first_name: student?.candidate_id?.first_name,
          last_name: student?.candidate_id?.last_name,
          intake_channel: student?.program,
        },
        financial_supports: tempFinancialSupport,
        triggeredFromStudent: true,
      };
      this.subs.sink = this.dialog
        .open(InternshipEmailDialogComponent, {
          width: '600px',
          minHeight: '100px',
          disableClose: true,
          data: mappedData,
        })
        .afterClosed()
        .subscribe((resp) => {});
    }
  }

  openSendMultipleEmailDialog() {
    if (this.selection.selected.length < 1) {
      this.trigerSwalFollowS8();
    } else {
      const selectedData = _.cloneDeep(this.dataSelected);

      this.subs.sink = this.dialog
        .open(SendMultipleEmailComponent, {
          ...this.dialogConfig,
          data: selectedData.map((mail) => ({
            triggeredFromStudent: true,
            candidate: {
              email: mail?.candidate_id?.email || mail?.student_id?.candidate_id?.email || null,
              emailDefault: mail?.candidate_id?.school_mail || mail?.student_id?.candidate_id?.school_mail || null,
              _id: mail?.candidate_id?._id || null,
              intake_channel: mail?.program,
            },
          })),
        })
        .afterClosed()
        .subscribe(
          () => {
            this.resetCheckbox();
          },
          (err) => {
            console.error('Something went wrong after closing send multiple email dialog.', err);
          },
        );
    }
  }

  getAllIdForExport(pageNumber) {
    if (this.isCheckedAll) {
      if (pageNumber === 0) {
        this.allIdForReminder = [];
        this.dataSelected = [];
      }
      const pagination = {
        limit: 500,
        page: pageNumber,
      };
      this.isWaitingForResponse = true;
      const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
      const newFilterValues = {
        ...this.cleanFilterData(),
        form_builder_id: this.formId,
        program_id: this.programId,
        logged_in_user_type_id: this.currentUserTypeId,
        template_type: this.formType, // for now we use a fix value for this filter
      };
      this.subs.sink = this.formFollowUpService
        .getAllIdForSendReminder(pagination, newFilterValues, this.sortValue, userTypesList)
        .subscribe(
          (data: any) => {
            if (data && data.length) {
              const resp = _.cloneDeep(data);
              this.allIdForReminder = _.concat(this.allIdForReminder, resp);
              const page = pageNumber + 1;
              this.getAllIdForExport(page);
            } else {
              this.isWaitingForResponse = false;
              if (this.isCheckedAll) {
                if (this.allIdForReminder && this.allIdForReminder.length) {
                  this.dataSelected = this.allIdForReminder.filter((list) => !this.dataUnselect.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length) {
                    this.dialogExportResult();
                  }
                }
              }
            }
          },
          (err) => {
            // Record error log
            this.userService.postErrorLog(err);
            this.isReset = false;
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
    } else {
      // function send reminder
      this.dialogExportResult();
    }
  }

  dialogExportResult() {
    if (this.selection.selected.length < 1) {
      this.trigerSwalFollowS8();
    } else {
      const inputOptions = {
        comma: this.translate.instant('Export_S1.COMMA'),
        semicolon: this.translate.instant('Export_S1.SEMICOLON'),
        tab: this.translate.instant('Export_S1.TAB'),
      };
      Swal.fire({
        type: 'question',
        allowOutsideClick: false,
        title: this.translate.instant('EXPORT_DECISION.TITLE'),
        allowEscapeKey: true,
        confirmButtonText: this.translate.instant('Export_S1.OK'),
        input: 'radio',
        inputOptions: inputOptions,
        showCancelButton: true,
        cancelButtonText: this.translate.instant('DASHBOARD_DELETE.Cancel'),
        inputValue: this.translate && this.translate.currentLang === 'fr' ? ';' : '',
        inputValidator: (value) => {
          return new Promise((resolve, reject) => {
            if (value) {
              resolve('');
            } else {
              reject(this.translate.instant('Export_S1.INVALID'));
            }
          });
        },
        onOpen: function () {
          Swal.disableConfirmButton();
          Swal.getContent().addEventListener('click', function (e) {
            Swal.enableConfirmButton();
          });
          const input = Swal.getInput();
          const inputValue = input.getAttribute('value');
          if (inputValue === 'semicolon') {
            Swal.enableConfirmButton();
          }
        },
      }).then((separator) => {
        const formProcessId = this.dataSelected.map((data) => data._id);
        if (separator.value) {
          this.subs.sink = this.dialog
            .open(ExportGenerationInfoDialogComponent, {
              disableClose: true,
              width: '400px',
              data: { data: formProcessId, form_builder_id: this.formId, delimiter: separator.value, sorting: this.sortValue },
            })
            .afterClosed()
            .subscribe((result) => {
              this.resetCheckbox();
            });
        }
      });
    }
  }
  clearSelectIfFilter() {
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
  }

  applySuperFilter() {
    if (this.schoolFilterCtrl.value?.length) {
      this.schoolFilterCtrl.patchValue(null, { emitEvent: false });
      this.filteredValues.schools_id = null;
      this.tempDataFilter.schools = null;
    }
    this.filteredValues = {
      ...this.filteredValues,
      scholar_season: this.superFilter.scholar_season,
      schools_id: this.superFilter.schools_id,
      campuses: this.superFilter.campuses,
      levels: this.superFilter.levels,
      sector_ids: this.superFilter.sector_ids,
      speciality_ids: this.superFilter.speciality_ids,
    };
    this.clearSelectIfFilter();
    this.paginator.firstPage();
    this.getDataTableFormType();
  }
  checkFiltedStepIndex(stepColumn) {
    const findIndex = this.filteredValues.steps.findIndex((step) => step.step === stepColumn);
    return findIndex;
  }
  filterBreadcrumbFormat() {
    // to handle dynamic step column
    const stepsColumnFilterBreadcrumb = [];
    if (this.statusStep?.length) {
      this.statusStep.forEach((step, stepIndex) => {
        const stepFilterName = `S${stepIndex + 1}`;
        const stepFilter = {
          type: 'table_filter',
          name: this.filteredValues?.steps?.length && this.checkFiltedStepIndex(stepIndex) >= 0 ? 'statuses' : null,
          column: step.name,
          isMultiple: this.steps.controls[stepIndex]?.value?.length === this.stepsFilterDropdown?.length ? false : true,
          filterValue:
            this.steps.controls[stepIndex]?.value?.length === this.stepsFilterDropdown?.length
              ? this.filteredValuesAll?.steps[stepIndex]
              : this.filteredValues?.steps?.length && this.checkFiltedStepIndex(stepIndex) >= 0
              ? this.filteredValues?.steps[this.checkFiltedStepIndex(stepIndex)]
              : null,
          filterList: this.steps.controls[stepIndex]?.value?.length === this.stepsFilterDropdown?.length ? null : this.stepsFilterDropdown,
          filterRef: this.steps?.controls[stepIndex],
          displayKey: this.steps.controls[stepIndex]?.value?.length === this.stepsFilterDropdown?.length ? null : 'viewValue',
          savedValue: this.steps.controls[stepIndex]?.value?.length === this.stepsFilterDropdown?.length ? null : 'value',
          isSelectionInput: this.steps.controls[stepIndex]?.value?.length === this.stepsFilterDropdown?.length ? false : true,
        };
        stepsColumnFilterBreadcrumb.push(stepFilter);
      });
    }

    const filterInfoSuperFilter: FilterBreadCrumbInput[] = [
      // Super Filters below
      {
        type: 'super_filter',
        name: 'scholar_season',
        column: 'CARDDETAIL.Scholar Season',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.scholars,
        filterRef: this.scholarFilter,
        displayKey: 'scholar_season',
        savedValue: '_id',
        isSelectionInput: true,
      },
      {
        type: 'super_filter',
        name: 'schools_id',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.School',
        isMultiple: this.schoolsFilter.value?.length === this.school?.length ? false : true,
        filterValue: this.schoolsFilter.value?.length === this.school?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.schoolsFilter.value?.length === this.school?.length ? null : this.school,
        filterRef: this.schoolsFilter,
        displayKey: this.schoolsFilter.value?.length === this.school?.length ? null : 'short_name',
        savedValue: this.schoolsFilter.value?.length === this.school?.length ? null : '_id',
        isSelectionInput: this.schoolsFilter.value?.length === this.school?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'campuses',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus',
        isMultiple: this.campusFilter.value?.length === this.campusList?.length ? false : true,
        filterValue: this.campusFilter.value?.length === this.campusList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.campusFilter.value?.length === this.campusList?.length ? null : this.campusList,
        filterRef: this.campusFilter,
        displayKey: this.campusFilter.value?.length === this.campusList?.length ? null : 'name',
        savedValue: this.campusFilter.value?.length === this.campusList?.length ? null : '_id',
        isSelectionInput: this.campusFilter.value?.length === this.campusList?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'levels',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level',
        isMultiple: this.levelFilter.value?.length === this.levels?.length ? false : true,
        filterValue: this.levelFilter.value?.length === this.levels?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.levelFilter.value?.length === this.levels?.length ? null : this.levels,
        filterRef: this.levelFilter,
        displayKey: this.levelFilter.value?.length === this.levels?.length ? null : 'name',
        savedValue: this.levelFilter.value?.length === this.levels?.length ? null : '_id',
        isSelectionInput: this.levelFilter.value?.length === this.levels?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'sector_ids',
        column: 'ALUMNI.Sector',
        isMultiple: this.sectorsFilter.value?.length === this.sectorList?.length ? false : true,
        filterValue: this.sectorsFilter.value?.length === this.sectorList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.sectorsFilter.value?.length === this.sectorList?.length ? null : this.sectorList,
        filterRef: this.sectorsFilter,
        displayKey: this.sectorsFilter.value?.length === this.sectorList?.length ? null : 'name',
        savedValue: this.sectorsFilter.value?.length === this.sectorList?.length ? null : '_id',
        isSelectionInput: this.sectorsFilter.value?.length === this.sectorList?.length ? false : true,
      },
      {
        type: 'super_filter',
        name: 'speciality_ids',
        column: 'ALUMNI.Speciality',
        isMultiple: this.specialitiesFilter.value?.length === this.specilityList?.length ? false : true,
        filterValue: this.specialitiesFilter.value?.length === this.specilityList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.specialitiesFilter.value?.length === this.specilityList?.length ? null : this.specilityList,
        filterRef: this.specialitiesFilter,
        displayKey: this.specialitiesFilter.value?.length === this.specilityList?.length ? null : 'name',
        savedValue: this.specialitiesFilter.value?.length === this.specilityList?.length ? null : '_id',
        isSelectionInput: this.specialitiesFilter.value?.length === this.specilityList?.length ? false : true,
      },
    ];

    const filterInfoTableFilter: FilterBreadCrumbInput[] = [
      // Table Filters below
      {
        type: 'table_filter',
        name: 'candidate_last_name',
        column: 'Student',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.studentFilterCtrl,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'schools_id',
        column: 'School',
        isMultiple: this.schoolFilterCtrl?.value?.length === this.schoolList?.length ? false : true,
        filterValue: this.schoolFilterCtrl?.value?.length === this.schoolList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.schoolFilterCtrl?.value?.length === this.schoolList?.length ? null : this.schoolList,
        filterRef: this.schoolFilterCtrl,
        displayKey: this.schoolFilterCtrl?.value?.length === this.schoolList?.length ? null : 'short_name',
        savedValue: this.schoolFilterCtrl?.value?.length === this.schoolList?.length ? null : '_id',
        isSelectionInput: this.schoolFilterCtrl?.value?.length === this.schoolList?.length ? false : true,
      },
      ...stepsColumnFilterBreadcrumb,
      {
        type: 'table_filter',
        name: 'programs',
        column: 'Program',
        isMultiple: this.programFilterCtrl?.value?.length === this.programFilterData?.length ? false : true,
        filterValue:
          this.programFilterCtrl?.value?.length === this.programFilterData?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.programFilterCtrl?.value?.length === this.programFilterData?.length ? null : this.programFilterData,
        filterRef: this.programFilterCtrl,
        displayKey: this.programFilterCtrl?.value?.length === this.programFilterData?.length ? null : 'program',
        savedValue: this.programFilterCtrl?.value?.length === this.programFilterData?.length ? null : 'program',
        isSelectionInput: this.programFilterCtrl?.value?.length === this.programFilterData?.length ? false : true,
      },
      {
        type: 'table_filter',
        name: 'candidate_statuses',
        column: 'AdmissionFollowUp.Status',
        isMultiple: this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length ? false : true,
        filterValue:
          this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length ? null : this.studentStatusFilterList,
        filterRef: this.studentStatusFilter,
        isSelectionInput: this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length ? false : true,
        displayKey: this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length ? null : 'key',
        savedValue: this.studentStatusFilter?.value?.length === this.studentStatusFilterList?.length ? null : 'value',
      },
      {
        type: 'table_filter',
        name: 'send_date',
        column: 'Send Date',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.sendDateFilterCtrl,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'last_modified',
        column: 'Last Modified',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.lastModifiedFilterCtrl,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
    ];
    let filterInfo: FilterBreadCrumbInput[] = [];
    if (this.formType !== 'admission_document') {
      filterInfo = [...filterInfoSuperFilter, ...filterInfoTableFilter];
    } else {
      filterInfo = filterInfoTableFilter;
    }
    if (this.formType !== 'one_time_form' && filterInfo?.length) {
      filterInfo = filterInfo.filter((column) => column.name !== 'school' && column.name !== 'program');
    }

    if (this.schoolsFilter.value?.length && !this.schoolFilterCtrl.value?.length) {
      const schoolTableFilterIndex = filterInfo.findIndex(
        (breadcrumbData) => breadcrumbData.type === 'table_filter' && breadcrumbData.name === 'schools_id',
      );
      filterInfo.splice(schoolTableFilterIndex, 1);
    } else if (!this.schoolsFilter.value?.length && this.schoolFilterCtrl.value?.length) {
      const schoolSuperFilterIndex = filterInfo.findIndex(
        (breadcrumbData) => breadcrumbData.type === 'super_filter' && breadcrumbData.name === 'schools_id',
      );
      filterInfo.splice(schoolSuperFilterIndex, 1);
    }
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  removeFilterBreadcrumb(filterItem) {
    if (filterItem?.name === 'statuses' && this.filteredValues?.steps?.length && this.statusStep?.length) {
      const stepColumnIndex = this.statusStep.findIndex((step) => step.name === filterItem?.column);
      if (stepColumnIndex >= 0) {
        this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, null);
        if (this.filteredValues?.steps?.length && this.filteredValues?.steps[stepColumnIndex]) {
          this.filteredValues.steps[stepColumnIndex].statuses = [];
          this.filteredValues.steps[stepColumnIndex].step = null;
        }
        if (this.tempDataFilter?.steps?.length && this.tempDataFilter?.steps[stepColumnIndex]) {
          this.tempDataFilter.steps[stepColumnIndex].statuses = [];
          this.tempDataFilter.steps[stepColumnIndex].step = null;
        }
      }
    } else {
      this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.filteredValues, this.filteredValues);
      if (filterItem.name === 'scholar_season') {
        this.scholarFilter.setValue('All');
        this.superFilter = {
          scholar_season: null,
          schools_id: null,
          campuses: null,
          levels: null,
          sector_ids: null,
          speciality_ids: null,
        };
        this.scholarSelect();
      }
      if (filterItem.name === 'schools_id') {
        this.superFilter = {
          scholar_season: this.superFilter.scholar_season,
          schools_id: null,
          campuses: null,
          levels: null,
          sector_ids: null,
          speciality_ids: null,
        };
        this.checkSuperfilterSchool();
      }
      if (filterItem.name === 'campuses') {
        this.superFilter = {
          scholar_season: this.superFilter.scholar_season,
          schools_id: this.superFilter.schools_id,
          campuses: null,
          levels: null,
          sector_ids: null,
          speciality_ids: null,
        };
        this.checkSuperfilterCampus();
      }
      if (filterItem.name === 'levels') {
        this.superFilter = {
          scholar_season: this.superFilter.scholar_season,
          schools_id: this.superFilter.schools_id,
          campuses: this.superFilter.campuses,
          levels: null,
          sector_ids: null,
          speciality_ids: null,
        };
        this.checkSuperfilterLevel();
      }
      if (filterItem.name === 'sector_ids') {
        this.superFilter = {
          scholar_season: this.superFilter.scholar_season,
          schools_id: this.superFilter.schools_id,
          campuses: this.superFilter.campuses,
          levels: this.superFilter.levels,
          sector_ids: null,
          speciality_ids: null,
        };
        this.checkSuperfilterSector();
      }
      if (filterItem.name === 'candidate_status') {
        this.studentStatusFilter.setValue('All');
      }
      if (filterItem.name === 'speciality_ids') {
        this.checkSuperfilterSpeciality();
      }
    }
    if (this.filteredValues.hasOwnProperty('value')) {
      delete this.filteredValues['value'];
    }
    if (filterItem.type === 'super_filter') {
      this.applySuperFilter();
    } else {
      this.clearSelectIfFilter();
      this.getAllStudentAdmissionProcesses();
    }
  }

  setSchoolFilterTable() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelected = [];
    const isSame = JSON.stringify(this.tempDataFilter?.schools) === JSON.stringify(this.schoolFilterCtrl?.value);
    if (isSame) {
      return;
    } else if (this.schoolFilterCtrl?.value?.length) {
      this.filteredValues.schools_id = this.schoolFilterCtrl?.value;
      this.tempDataFilter.schools = this.schoolFilterCtrl?.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;

        if (this.schoolsFilter.value?.length) {
          this.schoolsFilter.patchValue(null, { emitEvent: false });
          this.filteredValues = {
            ...this.filteredValues,
            campuses: null,
            levels: null,
            sector_ids: null,
            speciality_ids: null,
          };
          this.superFilter = {
            scholar_season: null,
            schools_id: null,
            campuses: null,
            levels: null,
            sector_ids: null,
            speciality_ids: null,
          };
          this.checkSuperfilterSchool();
        }
        this.getDataTableFormType();
      }
    } else {
      if (this.tempDataFilter?.schools?.length && !this.schoolFilterCtrl?.value?.length) {
        this.filteredValues.schools_id = null;
        this.tempDataFilter.schools = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;

          if (this.schoolsFilter.value?.length) {
            this.schoolsFilter.patchValue(null, { emitEvent: false });
            this.filteredValues = {
              ...this.filteredValues,
              campuses: null,
              levels: null,
              sector_ids: null,
              speciality_ids: null,
            };
            this.superFilter = {
              scholar_season: null,
              schools_id: null,
              campuses: null,
              levels: null,
              sector_ids: null,
              speciality_ids: null,
            };
            this.checkSuperfilterSchool();
          }
          this.getDataTableFormType();
        }
      } else {
        return;
      }
    }
  }

  setProgramFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelected = [];
    const isSame = JSON.stringify(this.tempDataFilter?.programs) === JSON.stringify(this.programFilterCtrl?.value);
    if (isSame) {
      return;
    } else if (this.programFilterCtrl?.value?.length) {
      this.filteredValues.programs = this.programFilterCtrl.value;
      this.tempDataFilter.programs = this.programFilterCtrl.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getDataTableFormType();
      }
    } else {
      if (this.tempDataFilter?.programs?.length && !this.programFilterCtrl?.value?.length) {
        this.filteredValues.programs = this.programFilterCtrl.value;
        this.tempDataFilter.programs = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataTableFormType();
        }
      } else {
        return;
      }
    }
  }

  setTypeStatusFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.status) === JSON.stringify(this.studentStatusFilter.value);
    if (isSame) {
      return;
    } else if (this.studentStatusFilter.value?.length) {
      this.filteredValues.candidate_statuses = this.studentStatusFilter.value;
      this.tempDataFilter.status = this.studentStatusFilter.value;
      if (!this.isReset) {
        this.getDataTableFormType();
      }
    } else {
      if (this.tempDataFilter.status?.length && !this.studentStatusFilter.value?.length) {
        this.filteredValues.candidate_statuses = null;
        this.tempDataFilter.status = null;
        if (!this.isReset) {
          this.getDataTableFormType();
        }
      } else {
        return;
      }
    }
  }

  setStepStatusFilter(indexStep) {
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelected = [];
    const isSame = JSON.stringify(this.tempDataFilter?.steps[indexStep]?.statuses) === JSON.stringify(this.steps?.value[indexStep]);
    if (isSame) {
      return;
    } else if (this.steps?.value[indexStep]?.length) {
      this.filteredValues.steps[indexStep].step = indexStep;
      this.filteredValues.steps[indexStep].statuses = this.steps?.value[indexStep];
      this.tempDataFilter.steps[indexStep].step = indexStep;
      this.tempDataFilter.steps[indexStep].statuses = this.steps?.value[indexStep];
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getDataTableFormType();
      }
    } else {
      if (this.tempDataFilter?.steps[indexStep]?.statuses?.length && !this.steps.value[indexStep]?.length) {
        this.filteredValues.steps[indexStep].step = indexStep;
        if (this.steps?.value[indexStep]?.length) {
          this.filteredValues.steps[indexStep].statuses = this.steps?.value[indexStep];
        } else {
          if (this.filteredValues?.steps?.length && this.filteredValues?.steps[indexStep]) {
            this.filteredValues.steps[indexStep].statuses = [];
            this.filteredValues.steps[indexStep].step = null;
          }
          if (this.tempDataFilter?.steps?.length && this.tempDataFilter?.steps[indexStep]) {
            this.tempDataFilter.steps[indexStep].statuses = [];
            this.tempDataFilter.steps[indexStep].step = null;
          }
          // this.filteredValues.steps.splice(indexStep, 1);
        }
        this.tempDataFilter.steps = [];
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getDataTableFormType();
        }
      } else {
        return;
      }
    }
  }

  isAllDropdownSelected(type, indexStep?) {
    if (type === 'scholar') {
      const selected = this.scholarFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.scholars.length;
      return isAllSelected;
    } else if (type === 'school') {
      const selected = this.schoolsFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.school.length;
      return isAllSelected;
    } else if (type === 'campus') {
      const selected = this.campusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.campusList.length;
      return isAllSelected;
    } else if (type === 'level') {
      const selected = this.levelFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.levels.length;
      return isAllSelected;
    } else if (type === 'sector') {
      const selected = this.sectorsFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.sectorList.length;
      return isAllSelected;
    } else if (type === 'speciality') {
      const selected = this.specialitiesFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.specilityList.length;
      return isAllSelected;
    } else if (type === 'step_status') {
      const selected = this.steps.value[indexStep];
      const isAllSelected = selected && selected?.length !== 0 && selected?.length === this.stepsFilterDropdown?.length;
      return isAllSelected;
    } else if (type === 'programs') {
      const selected = this.programFilterCtrl.value;
      const isAllSelected = selected && selected?.length !== 0 && selected?.length === this.programFilterData?.length;
      return isAllSelected;
    } else if (type === 'schools') {
      const selected = this.schoolFilterCtrl.value;
      const isAllSelected = selected && selected?.length !== 0 && selected?.length === this.schoolList?.length;
      return isAllSelected;
    } else if (type === 'studentStatus') {
      const selected = this.studentStatusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.studentStatusFilterList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type, indexStep?) {
    if (type === 'scholar') {
      const selected = this.scholarFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.scholars.length;
      return isIndeterminate;
    } else if (type === 'school') {
      const selected = this.schoolsFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.school.length;
      return isIndeterminate;
    } else if (type === 'campus') {
      const selected = this.campusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.campusList.length;
      return isIndeterminate;
    } else if (type === 'level') {
      const selected = this.levelFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.levels.length;
      return isIndeterminate;
    } else if (type === 'sector') {
      const selected = this.sectorsFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.sectorList.length;
      return isIndeterminate;
    } else if (type === 'speciality') {
      const selected = this.specialitiesFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.specilityList.length;
      return isIndeterminate;
    } else if (type === 'step_status') {
      const selected = this.steps.value[indexStep];
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.stepsFilterDropdown?.length;
      return isIndeterminate;
    } else if (type === 'programs') {
      const selected = this.programFilterCtrl.value;
      const isIndeterminate = selected && selected?.length !== 0 && selected?.length !== this.programFilterData?.length;
      return isIndeterminate;
    } else if (type === 'schools') {
      const selected = this.schoolFilterCtrl.value;
      const isIndeterminate = selected && selected?.length !== 0 && selected?.length !== this.schoolList?.length;
      return isIndeterminate;
    } else if (type === 'studentStatus') {
      const selected = this.studentStatusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.studentStatusFilterList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type, indexStep?) {
    if (type === 'scholar') {
      if (event.checked) {
        this.scholarFilter.patchValue('AllF', { emitEvent: false });
      } else {
        this.scholarFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'school') {
      if (event.checked) {
        const schoolData = this.school.map((el) => el._id);
        this.schoolsFilter.patchValue(schoolData, { emitEvent: false });
      } else {
        this.schoolsFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'campus') {
      if (event.checked) {
        const campusData = this.campusList.map((el) => el._id);
        this.campusFilter.patchValue(campusData, { emitEvent: false });
      } else {
        this.campusFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'level') {
      if (event.checked) {
        const levelData = this.levels.map((el) => el._id);
        this.levelFilter.patchValue(levelData, { emitEvent: false });
      } else {
        this.levelFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'sector') {
      if (event.checked) {
        const sectorData = this.sectorList.map((el) => el._id);
        this.sectorsFilter.patchValue(sectorData, { emitEvent: false });
      } else {
        this.sectorsFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'speciality') {
      if (event.checked) {
        const specialityData = this.specilityList.map((el) => el._id);
        this.specialitiesFilter.patchValue(specialityData, { emitEvent: false });
      } else {
        this.specialitiesFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'step_status') {
      if (event.checked) {
        const stepsData = this.stepsFilterDropdown.map((el) => el.value);
        this.steps.at(indexStep).patchValue(stepsData, { emitEvent: false });
      } else {
        this.steps.at(indexStep).patchValue([], { emitEvent: false });
      }
    } else if (type === 'programs') {
      if (event.checked) {
        const programsData = this.programFilterData.map((el) => el.program);
        this.programFilterCtrl.patchValue(programsData, { emitEvent: false });
      } else {
        this.programFilterCtrl.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'schools') {
      if (event.checked) {
        const schoolsData = this.schoolList.map((el) => el._id);
        this.schoolFilterCtrl.patchValue(schoolsData, { emitEvent: false });
      } else {
        this.schoolFilterCtrl.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'studentStatus') {
      if (event.checked) {
        const typeData = this.studentStatusFilterList.map((el) => el.value);
        this.studentStatusFilter.patchValue(typeData);
      } else {
        this.studentStatusFilter.patchValue(null);
      }
    }
  }
}
