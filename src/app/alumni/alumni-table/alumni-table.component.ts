import { FilterBreadcrumbService } from './../../filter-breadcrumb/service/filter-breadcrumb.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from './../../models/bread-crumb-filter.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewChecked,
  AfterContentChecked,
  OnChanges,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { FinancesService } from 'app/service/finance/finance.service';
import * as moment from 'moment';
import { SubSink } from 'subsink';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import Swal from 'sweetalert2';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { UtilityService } from 'app/service/utility/utility.service';
import { AlumniService } from 'app/service/alumni/alumni.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { SendAlumniSurveyDialogComponent } from 'app/alumni-file/send-alumni-survey/send-alumni-survey-dialog.component';
import { environment } from 'environments/environment';
import { UserEmailDialogComponent } from 'app/users/user-email-dialog/user-email-dialog.component';
@Component({
  selector: 'ms-alumni-table',
  templateUrl: './alumni-table.component.html',
  styleUrls: ['./alumni-table.component.scss'],
})
export class AlumniTableComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked, AfterContentChecked, OnChanges {
  private subs = new SubSink();
  today: Date;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  isLoading = false;
  dataCount = 0;
  noData;
  selectType: any;
  disabledExport = true;
  isTerm1 = false;
  isTerm2 = false;
  isTerm3 = false;
  isTerm4 = false;
  isTerm5 = false;
  isTerm6 = false;
  isTerm7 = false;
  isTerm8 = false;
  isDeposit = false;
  isNonPlan = false;
  sortValue = null;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  userSelected: any[];
  userSelectedId: any[];
  isCheckedAll = false;
  listFilter = [];

  displayedColumns: string[] = [
    'select',
    'lastName',
    'usedLastName',
    'firstName',
    'promoYear',
    'school',
    'campus',
    'sector',
    'speciality',
    'rncp',
    'city',
    'country',
    'professionalStatus',
    'company',
    'activitySector',
    'jobName',
    'lastSurveySent',
    'sentBy',
    'lastSurveyCompleted',
    // 'emailStatus',
    'action',
  ];

  // displayedColumns: string[] = [
  //   'select',
  //   'familyName',
  //   'usedFamilyName',
  //   'name',
  //   'promoYear',
  //   'school',
  //   'campus',
  //   'speciality',
  //   'master',
  //   'masterPromo',
  //   'myCity',
  //   'myCountry',
  //   'situationPro',
  //   'company',
  //   'activitySector',
  //   'jobName',
  //   'updateDate',
  //   'updateBy',
  //   'action',
  // ];

  filterColumns: string[] = [
    'selectFilter',
    'lastNameFilter',
    'usedLastNameFilter',
    'firstNameFilter',
    'promoYearFilter',
    'schoolFilter',
    'campusFilter',
    'sectorFilter',
    'specialityFilter',
    'rncpFilter',
    'cityFilter',
    'countryFilter',
    'professionalStatusFilter',
    'companyFilter',
    'activitySectorFilter',
    'jobNameFilter',
    'lastSurveySentFilter',
    'sentByFilter',
    'lastSurveyCompletedFilter',
    // 'emailStatusFilter',
    'actionFilter',
  ];

  // filterColumns: string[] = [
  //   'selectFilter',
  //   'familyNameFilter',
  //   'usedFamilyNameFilter',
  //   'nameFilter',
  //   'promoYearFilter',
  //   'schoolFilter',
  //   'campusTableFilter',
  //   'specialityFilter',
  //   'masterFilter',
  //   'masterPromoFilter',
  //   'myCityFilter',
  //   'myCountryFilter',
  //   'situationProFilter',
  //   'companyFilter',
  //   'activitySectorFilter',
  //   'jobNameFilter',
  //   'updateDateFilter',
  //   'updateByFilter',
  //   'actionFilter',
  // ];

  isAlumni3 = false;
  isAlumni6 = false;
  isAlumni9 = false;
  isAlumni12 = false;
  // masterFilter = new UntypedFormControl('');
  // masterPromoFilter = new UntypedFormControl('');
  // myCityFilter = new UntypedFormControl('');
  // myCountryFilter = new UntypedFormControl('');
  // situationProFilter = new UntypedFormControl('');
  // activitySectorFilter = new UntypedFormControl('');
  // jobNameFilter = new UntypedFormControl('');
  // updateByFilter = new UntypedFormControl('');
  // levelFilter = new UntypedFormControl(null);
  // latestUpdateFilter = new UntypedFormControl(null);
  // schoolsFilter = new UntypedFormControl(null);
  // campusFilter = new UntypedFormControl(null);
  // promoFilter = new UntypedFormControl(null);
  // sectorFilter = new UntypedFormControl(null);
  // specialityFilter = new UntypedFormControl(null);
  // insideTable
  familyNameFilter = new UntypedFormControl('');
  usedFamilyNameFilter = new UntypedFormControl('');
  nameFilter = new UntypedFormControl('');
  promoYearFilter = new UntypedFormControl('All');
  schoolFilter = new UntypedFormControl('All');
  campusFilter = new UntypedFormControl('All');
  sectorFilter = new UntypedFormControl('All');
  specialityFilter = new UntypedFormControl('All');
  rncpFilter = new UntypedFormControl('');
  cityFilter = new UntypedFormControl('All');
  countryFilter = new UntypedFormControl('All');
  professionalStatusFilter = new UntypedFormControl('All');
  companyFilter = new UntypedFormControl('All');
  updateDateFilter = new UntypedFormControl(null);
  lastSurveyCompletedFilter = new UntypedFormControl('All');
  sentByFilter = new UntypedFormControl('All');

  lastSentSurveyFilter = new UntypedFormControl(null);
  turnOnCascade = true;
  // aboveTable
  promoYearsFilter = new UntypedFormControl(null);
  schoolsFilter = new UntypedFormControl(null);
  campusesFilter = new UntypedFormControl(null);
  sectorsFilter = new UntypedFormControl(null);
  specialitiesFilter = new UntypedFormControl(null);

  maleIcon = '../../../assets/img/student_icon.png';
  femaleIcon = '../../../assets/img/student_icon_fem.png';
  greenHeartIcon = '../../../assets/img/enagement_icon_green.png';
  flagsIconPath = '../../../assets/icons/flags-nationality/';
  shieldAccountIcon = '../../../assets/img/shield-account.png';
  schoolName = '';
  listTerm = [];
  filteredValues = {
    family_name: '',
    used_family_name: '',
    name: '',
    promo_year: '',
    school: '',
    campus: '',
    sector: '',
    speciality: '',
    rncp_title: '',
    country: '',
    city: '',
    professional_status: '',
    company: '',
    updated_at: '',
    sent_by: '',
    survey_sent: '',

    latest_updated: null,
    last_survey_sent: null,
    last_survey_completed: null,
    offset: null,

    // abovetable
    promo_years: '',
    schools: '',
    campuses: '',
    sectors: '',
    specialities: '',
  };
  superFilterValue = {
    promo_years: '',
    schools: '',
    campuses: '',
    sectors: '',
    specialities: '',
  };
  superFilteCurrentValue;

  isDisplaySurveyCompletedFilter = true;
  typeFilterList = [
    { value: 'All', key: 'AllS' },
    { value: 'classic', key: 'Classic' },
    { value: 'alternance', key: 'Alternance' },
    { value: 'special', key: 'Special' },
  ];
  paymentFilterList = [
    { value: 'All', key: 'AllS' },
    { value: 'Credit Card', key: 'Credit Card' },
    { value: 'Transfer', key: 'Transfer' },
    { value: 'Cheque', key: 'Cheque' },
  ];
  lastSurveyCompletedList = [
    { value: 'All', survey: 'AllS' },
    { value: true, survey: 'Yes' },
    { value: false, survey: 'No' },
  ];
  financeFilterList = [
    { value: 'All', key: 'AllS' },
    { value: 'excellent', key: 'Excellent' },
    { value: 'good', key: 'Bon' },
    { value: 'bad', key: 'Mauvais' },
    { value: 'doubtful', key: 'Douteux' },
    { value: 'litigation', key: 'Contentieux' },
  ];
  programFilterList = [
    { value: 'All', key: 'AllS' },
    { value: '20-21 EFAPAR 1', key: '20-21 EFAPAR 1' },
    { value: '21-22 EFATOU 2', key: '21-22 EFATOU 2' },
    { value: '20-21 ICABOR 1', key: '20-21 ICABOR 1' },
  ];

  connectionFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: 'uploaded', key: 'Uploaded' },
    { value: 'approved', key: 'Approved' },
    { value: 'rejected', key: 'Rejected' },
  ];

  internProfileFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: 'approved', key: 'Approved' },
    { value: 'rejected', key: 'Rejected' },
    { value: 'published', key: 'Published' },
    { value: 'unpublished', key: 'Unpublished' },
  ];
  specilityList = [];
  sectorList = [];
  cityList = [];
  companyList = [];
  countryList = [];
  scholarFilter = new UntypedFormControl('6037096846d75f192bfba48b');
  typeFilter = new UntypedFormControl(null);
  studentFilter = new UntypedFormControl('');
  accountFilter = new UntypedFormControl('');
  paymentFilter = new UntypedFormControl(null);
  profileRateFilter = new UntypedFormControl(null);
  financialFilter = new UntypedFormControl(null);
  filteredCurrentProgram: Observable<any[]>;
  filteredSchool: Observable<any[]>;
  filteredCampus: Observable<any[]>;
  campusList = [];
  listObjective = [];
  levels = [];
  school = [];
  scholars = [];
  studentType = [];
  paymentMode = [];
  promotionList = [];
  schoolsList = [];
  campusesList = [];
  surveySender = [];
  profesionalStatusList = ['employed', 'unemployed'];
  intakeList = [];
  currentUser: any;
  isPermission: string[];
  currentUserTypeId: any;
  allStudentForCheckbox = [];
  dataSelected = [];
  pageSelected = [];

  dataAlumniForExport = [];
  dataAlumniForSurvey = [];
  dataUnselectUser = [];
  buttonClicked = '';
  filterBreadcrumbData = [];

  constructor(
    private pageTitleService: PageTitleService,
    private candidatesService: CandidatesService,
    private router: Router,
    private dialog: MatDialog,
    private translate: TranslateService,
    private financeService: FinancesService,
    private cdr: ChangeDetectorRef,
    private utilService: UtilityService,
    private alumniService: AlumniService,
    private userService: AuthService,
    public permission: PermissionService,
    private httpClient: HttpClient,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.today = new Date();
    // this.getDataForList();
    this.initFilter();
    this.getDataAlumni('First');
    this.getDataDropdown();
    this.superFilteCurrentValue = _.cloneDeep(this.superFilterValue);
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.repopulateDataSentBy();
      this.filterBreadcrumbFormat();
    });
    this.pageTitleService.setTitle('NAV.alumni-follow-up');
  }

  ngOnChanges() {}

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }
  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getDataAlumni('ngAfterViewInit');
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    // console.log(numSelected, numRows);
    return numSelected === numRows || numSelected > numRows;
  }

  setPromoYear(statusSearch) {
    this.filteredValues.promo_year = statusSearch === 'All' ? '' : statusSearch;
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.getDataAlumni('setPromoYear');
    }
  }

  setSchool(statusSearch) {
    this.filteredValues.school = statusSearch === 'All' ? '' : statusSearch;
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.getDataAlumni('setSchool');
    }
  }

  setCampus(statusSearch) {
    this.filteredValues.campus = statusSearch === 'All' ? '' : statusSearch;
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.getDataAlumni('setCampus');
    }
  }

  initFilter() {
    this.subs.sink = this.familyNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[()|{}\[\]:;<>?,+*$&#%^!\/]/g;
      const symbol1 = /\\/;
      if (!name.match(symbol) && !name.match(symbol1)) {
        this.filteredValues.family_name = name;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataAlumni('family_name 1');
        }
      } else {
        const dataReplace = name.replace(symbol, '');
        this.familyNameFilter.setValue(dataReplace);
      }
    });

    this.subs.sink = this.usedFamilyNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[()|{}\[\]:;<>?,+*$&#%^!\/]/g;
      const symbol1 = /\\/;
      if (!name.match(symbol) && !name.match(symbol1)) {
        this.filteredValues.used_family_name = name;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataAlumni('used_family_name 1');
        }
      } else {
        const dataReplace = name.replace(symbol, '');
        this.usedFamilyNameFilter.setValue(dataReplace);
      }
    });

    this.subs.sink = this.nameFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[()|{}\[\]:;<>?,+*$&#%^!\/]/g;
      const symbol1 = /\\/;
      if (!name.match(symbol) && !name.match(symbol1)) {
        this.filteredValues.name = name;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataAlumni('name 1');
        }
      } else {
        const dataReplace = name.replace(symbol, '');
        this.nameFilter.setValue(dataReplace);
      }
    });

    this.subs.sink = this.promoYearFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.promo_year = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataAlumni('promoYearFilter');
      }
    });

    this.subs.sink = this.schoolFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.school = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataAlumni('schoolFilter');
      }
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.campus = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataAlumni('campusFilter');
      }
    });

    this.subs.sink = this.sectorFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.sector = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataAlumni('sectorFilter');
      }
    });

    this.subs.sink = this.specialityFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.speciality = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataAlumni('specialitiesFilter');
      }
    });

    this.subs.sink = this.rncpFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[()|{}\[\]:;<>?,+*$&#%^!\/]/g;
      const symbol1 = /\\/;
      if (!name.match(symbol) && !name.match(symbol1)) {
        this.filteredValues.rncp_title = name;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataAlumni('rncp_tilte 1');
        }
      } else {
        const dataReplace = name.replace(symbol, '');
        this.rncpFilter.setValue(dataReplace);
      }
    });

    this.subs.sink = this.cityFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.city = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataAlumni('cityFilter');
      }
    });

    this.subs.sink = this.countryFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.country = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataAlumni('countryFilter');
      }
    });

    this.subs.sink = this.professionalStatusFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.professional_status = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataAlumni('professionalStatusFilter');
      }
    });

    this.subs.sink = this.companyFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.company = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataAlumni('companyFilter');
      }
    });

    this.subs.sink = this.updateDateFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.survey_sent = statusSearch ? this.translateDate(statusSearch) : null;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataAlumni('updateupdateDateFilter');
      }
    });

    this.subs.sink = this.lastSurveyCompletedFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.last_survey_completed = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataAlumni('lastSurveyCompletedFilter');
      }
    });

    this.subs.sink = this.sentByFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.sent_by = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataAlumni('sentByFilter');
      }
    });

    this.subs.sink = this.lastSentSurveyFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.last_survey_sent = statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataAlumni('sentByFilter');
      }
    });

    // abovetable
    this.subs.sink = this.promoYearsFilter.valueChanges.subscribe((statusSearch) => {
      if (statusSearch && statusSearch.length) {
        const findAll = statusSearch.find((status) => status === 'AllF');
        if (findAll) {
          this.superFilterValue.promo_years = '';
        } else if (!findAll) {
          this.superFilterValue.promo_years = statusSearch;
        }
      } else {
        this.superFilterValue.promo_years = '';
      }
    });

    this.subs.sink = this.schoolsFilter.valueChanges.subscribe((statusSearch) => {
      if (statusSearch && statusSearch.length) {
        const findAll = statusSearch.find((status) => status === 'AllF');
        if (findAll) {
          this.superFilterValue.schools = '';
        } else if (!findAll) {
          this.superFilterValue.schools = statusSearch;
        }
      } else {
        this.superFilterValue.schools = '';
      }
    });
    this.subs.sink = this.campusesFilter.valueChanges.subscribe((statusSearch) => {
      if (statusSearch && statusSearch.length) {
        const findAll = statusSearch.find((status) => status === 'AllF');
        if (findAll) {
          this.superFilterValue.campuses = '';
        } else if (!findAll) {
          this.superFilterValue.campuses = statusSearch;
        }
      } else {
        this.superFilterValue.campuses = '';
      }
    });

    this.subs.sink = this.sectorsFilter.valueChanges.subscribe((statusSearch) => {
      if (statusSearch && statusSearch.length) {
        const findAll = statusSearch.find((status) => status === 'AllF');
        if (findAll) {
          this.superFilterValue.sectors = '';
        } else if (!findAll) {
          this.superFilterValue.sectors = statusSearch;
        }
      } else {
        this.superFilterValue.sectors = '';
      }
    });

    this.subs.sink = this.specialitiesFilter.valueChanges.subscribe((statusSearch) => {
      if (statusSearch && statusSearch.length) {
        const findAll = statusSearch.find((status) => status === 'AllF');
        if (findAll) {
          this.superFilterValue.specialities = '';
        } else if (!findAll) {
          this.superFilterValue.specialities = statusSearch;
        }
      } else {
        this.superFilterValue.specialities = '';
      }
    });
  }

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.scholars = resp;
          // this.scholarFilter.setValue(this.scholars[0]._id);
        }
      },
      (error) => {
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  getDataPromoYear() {
    this.promotionList = [];
    this.subs.sink = this.alumniService.GetAllAlumniPromoYear().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.promotionList = resp.filter((program) => program !== '');
          this.filteredCurrentProgram = of(this.promotionList);
          console.log('ohoyyyy', this.promotionList)
          if (this.promotionList?.length > 0) {
            this.promoYearsFilter.patchValue(null);
          }
        }
      },
      (error) => {
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  getDataSchool() {
    this.schoolsList = [];
    this.subs.sink = this.alumniService.GetAllAlumniSchool().subscribe(
      (resp) => {
        if (resp && resp.length) {
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
            this.schoolsList = this.listObjective;
          } else {
            this.listObjective = resp;
            this.schoolsList = this.listObjective;
          }
          this.schoolsList = this.schoolsList
            ? this.schoolsList.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0))
            : this.schoolsList;

          if (this.schoolsList?.length > 0) {
            this.schoolsFilter.patchValue(null);
          }
        }
        console.log('soyyyy', this.schoolsList)
      },
      (err) => {
        this.userService.postErrorLog(err);
      },
    );
  }

  getDataCampus() {
    this.campusList = [];
    this.subs.sink = this.alumniService.GetAllAlumniCampus().subscribe(
      (resp) => {
        if (resp && resp.length) {
          if (
            this.currentUser &&
            this.currentUser.entities &&
            this.currentUser.entities.length &&
            this.currentUser.app_data &&
            this.currentUser.app_data.school_package &&
            this.schoolsFilter &&
            this.currentUser.app_data.school_package.length
          ) {
            const campuses = [];
            this.currentUser.app_data.school_package.forEach((element) => {
              if (element && element.school && element.school._id) {
                element.school.campuses.forEach((campus) => {
                  campuses.push(campus.name);
                });
                this.campusList = _.concat(this.campusList, campuses);
                this.campusList = this.standardizeDataList(this.campusList);
              }
            });
          } else if (this.schoolsFilter.value) {
            this.campusList = this.standardizeDataList(resp);
            // console.log('scampusList', scampusList, school, this.listObjective);
          } else {
            this.campusList = this.standardizeDataList(resp);
          }

          if (this.campusList?.length > 0) {
            this.campusesFilter.patchValue(null);
          }
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
      },
    );
  }

  getDataSector() {
    this.sectorList = [];
    this.subs.sink = this.alumniService.GetAllAlumniSector().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.sectorList = resp;
          if (this.sectorList?.length > 0) {
            this.sectorsFilter.patchValue(null);
          }
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
      },
    );
  }

  getDataSpeciality() {
    this.specilityList = [];
    this.subs.sink = this.alumniService.GetAllAlumniSpeciality().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.specilityList = resp;
          if (this.specilityList?.length > 0) {
            this.specialitiesFilter.patchValue(null);
          }
        }
      },
      (error) => {
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  getDataCity() {
    this.cityList = [];
    this.subs.sink = this.alumniService.GetAllAlumniCity().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.cityList = resp;
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
      },
    );
  }

  getDataCountry() {
    this.countryList = [];
    this.subs.sink = this.alumniService.GetAllAlumniCountry().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.countryList = resp;
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
      },
    );
  }

  getDataCompany() {
    this.companyList = [];
    this.subs.sink = this.alumniService.GetAllAlumniCompany().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.companyList = resp;
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
      },
    );
  }

  getDataSurveySender() {
    this.surveySender = [];
    this.subs.sink = this.alumniService.GetAllAlumniSurveySender().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.surveySender = resp?.map((send) => {
            return {
              ...send,
              full_name:
                send.last_name.toUpperCase() +
                ' ' +
                send.first_name +
                ' ' +
                (send.civility && send.civility === 'neutral' ? '' : this.translate.instant(send.civility)),
            };
          });
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
      },
    );
  }
  repopulateDataSentBy() {
    if (this.surveySender && this.surveySender.length) {
      this.surveySender = this.surveySender?.map((send) => {
        return {
          ...send,
          full_name:
            send.last_name.toUpperCase() +
            ' ' +
            send.first_name +
            ' ' +
            (send.civility && send.civility === 'neutral' ? '' : this.translate.instant(send.civility)),
        };
      });
    }
  }

  getDataCampusBySchool() {
    this.campusesFilter.setValue(null, { emitEvent: false });
    this.sectorsFilter.setValue(null, { emitEvent: false });
    this.specialitiesFilter.setValue(null, { emitEvent: false });
    this.superFilterValue.campuses = null;
    this.superFilterValue.sectors = null;
    this.superFilterValue.specialities = null;
    const school = this.schoolsFilter.value && this.schoolsFilter.value.length ? true : false;
    const filter = {
      school: school && this.schoolsFilter.value && !this.schoolsFilter.value.includes('AllF') ? this.schoolsFilter.value : null,
    };
    if (this.turnOnCascade) {
      this.campusList = [];
      if (this.schoolsFilter.value && this.schoolsFilter.value.length) {
        this.subs.sink = this.alumniService.GetAllAlumniCampusBySchool(filter).subscribe(
          (resp) => {
            if (
              this.currentUser &&
              this.currentUser.entities &&
              this.currentUser.entities.length &&
              this.currentUser.app_data &&
              this.currentUser.app_data.school_package &&
              this.schoolsFilter &&
              this.currentUser.app_data.school_package.length
            ) {
              const campuses = [];
              this.currentUser.app_data.school_package.forEach((element) => {
                if (element && element.school && element.school._id) {
                  element.school.campuses.forEach((campus) => {
                    campuses.push(campus.name);
                  });
                  this.campusList = _.concat(this.campusList, campuses);
                  this.campusList = this.standardizeDataList(this.campusList);
                }
              });
            } else if (this.schoolsFilter.value) {
              this.campusList = this.standardizeDataList(resp);
            } else {
              this.campusList = this.standardizeDataList(resp);
            }
          },
          (err) => {
            this.userService.postErrorLog(err);
          },
        );
        if (this.campusList?.length > 0) {
          this.campusesFilter.patchValue(null);
        }
      } else {
        this.campusesFilter.setValue(null, { emitEvent: false });
        this.sectorsFilter.setValue(null, { emitEvent: false });
        this.specialitiesFilter.setValue(null, { emitEvent: false });
        this.superFilterValue.campuses = null;
        this.superFilterValue.sectors = null;
        this.superFilterValue.specialities = null;
        this.getDataCampus();
        this.getDataSector();
        this.getDataSpeciality();
      }
      this.getDataSectorByCampus();
    }
  }

  getDataSectorByCampus() {
    this.sectorsFilter.setValue(null, { emitEvent: false });
    this.specialitiesFilter.setValue(null, { emitEvent: false });
    this.superFilterValue.sectors = null;
    this.superFilterValue.specialities = null;
    const school = this.schoolsFilter.value && this.schoolsFilter.value.length ? true : false;
    const campus = this.campusesFilter.value && this.campusesFilter.value.length ? true : false;
    const filter = {
      school: school && this.schoolsFilter.value && !this.schoolsFilter.value.includes('AllF') ? this.schoolsFilter.value : null,
      campus: campus && this.campusesFilter.value && !this.campusesFilter.value.includes('AllF') ? this.campusesFilter.value : null,
    };
    if (this.turnOnCascade) {
      this.sectorList = [];
      if (school || campus) {
        this.subs.sink = this.alumniService.GetAllAlumniSectorByCampus(filter).subscribe(
          (resp) => {
            if (resp && resp.length) {
              this.sectorsFilter.setValue(null, { emitEvent: false });
              this.specialitiesFilter.setValue(null, { emitEvent: false });
              this.superFilterValue.sectors = null;
              this.superFilterValue.specialities = null;
              this.sectorList = resp;
              if (this.sectorList?.length > 0) {
                this.sectorsFilter.patchValue(null);
              }
              this.getDataSpecialityBySector();
            }
          },
          (err) => {
            this.userService.postErrorLog(err);
          },
        );
      } else {
        this.sectorsFilter.setValue(null, { emitEvent: false });
        this.specialitiesFilter.setValue(null, { emitEvent: false });
        this.superFilterValue.sectors = null;
        this.superFilterValue.specialities = null;
        this.getDataSector();
        this.getDataSpeciality();
      }
    }
  }

  getDataSpecialityBySector() {
    this.specialitiesFilter.setValue(null, { emitEvent: false });
    this.superFilterValue.specialities = null;
    const school = this.schoolsFilter.value && this.schoolsFilter.value.length ? true : false;
    const campus = this.campusesFilter.value && this.campusesFilter.value.length ? true : false;
    const sector = this.sectorsFilter.value && this.sectorsFilter.value.length ? true : false;
    const filter = {
      school: school && this.schoolsFilter.value && !this.schoolsFilter.value.includes('AllF') ? this.schoolsFilter.value : null,
      campus: campus && this.campusesFilter.value && !this.campusesFilter.value.includes('AllF') ? this.campusesFilter.value : null,
      sector: sector && this.sectorsFilter?.value && !this.sectorsFilter.value.includes('AllF') ? this.sectorsFilter.value : null,
    };
    if (this.turnOnCascade) {
      this.specilityList = [];
      if (school || campus || sector) {
        this.subs.sink = this.alumniService.GetAllAlumniSpecialityBySector(filter).subscribe(
          (resp) => {
            if (resp && resp.length) {
              this.specialitiesFilter.setValue(null, { emitEvent: false });
              this.superFilterValue.specialities = null;
              this.specilityList = resp;
              if (this.specilityList?.length > 0) {
                this.specialitiesFilter.patchValue(null);
              }
            }
          },
          (err) => {
            this.userService.postErrorLog(err);
          },
        );
      } else {
        this.specialitiesFilter.setValue(null, { emitEvent: false });
        this.superFilterValue.specialities = null;
        this.getDataSpeciality();
      }
    }
  }

  getDataDropdown() {
    this.getDataPromoYear();
    this.getDataSchool();
    this.getDataCampus();
    this.getDataSector();
    this.getDataSpeciality();
    this.getDataCity();
    this.getDataCountry();
    this.getDataCompany();
    this.getDataSurveySender();
  }

  getDataAlumni(data) {
    this.dataSource.data = [];
    this.paginator.length = 0;
    this.dataCount = 0;
    this.isLoading = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.filteredValues.offset = this.filteredValues.survey_sent ? moment().utcOffset() : null;
    const filter = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.alumniService.getAllAlumniFollowUp(pagination, this.sortValue, filter, userTypesList).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.dataSource.data = students;
          this.paginator.length = students[0].count_document;
          this.dataCount = students[0].count_document;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isLoading = false;
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      (error) => {
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.dataCount = 0;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isLoading = false;
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  standardizeDataList(data: any) {
    // this function is to standardize list of data format
    return data?.map((a) => ({ _id: a, short_name: a }));
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataAlumni('Sort');
      }
    }
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    let promoYearMap;
    let schoolsMap;
    let sectorMap;
    let specialityMap;
    let campusesMap;
    Object.keys(filterData).forEach((key) => {
      if (filterData[key] || filterData[key] === false) {
        if (key === 'last_survey_sent' || key === 'offset' || key === 'last_survey_completed') {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        } else if (key === 'promo_years') {
          promoYearMap = filterData.promo_years.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` ${key}:[${promoYearMap}]`;
        } else if (key === 'schools') {
          schoolsMap = filterData.schools.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` ${key}:[${schoolsMap}]`;
        } else if (key === 'sectors') {
          sectorMap = filterData.sectors.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` ${key}:[${sectorMap}]`;
        } else if (key === 'specialities') {
          specialityMap = filterData.specialities.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` ${key}:[${specialityMap}]`;
        } else if (key === 'campuses') {
          campusesMap = filterData.campuses.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` ${key}:[${campusesMap}]`;
        } else {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        }
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = false;
      this.dataUnselectUser = [];
      this.dataAlumniForExport = [];
      this.dataAlumniForSurvey = [];
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      this.dataUnselectUser = [];
      this.dataAlumniForExport = [];
      this.dataAlumniForSurvey = [];
      // this.getDataAllForCheckbox(0);
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
    }
  }

  resetCheckbox() {
    this.selection.clear();
    this.dataSelected = [];
    this.pageSelected = [];
    this.isCheckedAll = false;
    this.dataAlumniForExport = [];
    this.dataAlumniForSurvey = [];
    this.dataUnselectUser = [];
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
        if (!this.dataUnselectUser.includes(row._id)) {
          this.dataUnselectUser.push(row._id);
          this.selection.deselect(row._id);
        } else {
          const indx = this.dataUnselectUser.findIndex((list) => list === row._id);
          this.dataUnselectUser.splice(indx, 1);
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
    const numSelected = this.selection.selected.length;
    if (numSelected > 0) {
      this.disabledExport = false;
    } else {
      this.disabledExport = true;
    }
    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.userSelected.push(user);
      this.userSelectedId.push(user._id);
    });
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 500,
      page: pageNumber,
    };
    this.isLoading = true;
    const filter = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.alumniService.getAllAlumniFollowUpCheckbox(pagination, this.sortValue, filter, userTypesList).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.allStudentForCheckbox.push(...students);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
          this.isLoading = false;
          if (this.isCheckedAll) {
            if (this.allStudentForCheckbox && this.allStudentForCheckbox.length) {
              this.allStudentForCheckbox.forEach((element) => {
                this.selection.select(element._id);
                this.dataSelected.push(element);
              });
            }
            this.pageSelected.push(this.paginator.pageIndex);
          } else {
            this.pageSelected = [];
          }
        }
      },
      (error) => {
        this.isReset = false;
        this.isLoading = false;
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
            title: 'Sorry !',
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  viewProfileInfo(profileId, tab?) {
    const payload = this.filteredValues;
    const query = {
      selectedProfile: profileId,
      sortValue: JSON.stringify(this.sortValue) || '',
      tab: tab || '',
      paginator: JSON.stringify({
        pageIndex: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize,
      }),
      filteredValues: JSON.stringify(payload),
    };
    const url = this.router.createUrlTree(['alumni-cards'], { queryParams: query });
    window.open(url.toString(), '_blank');
  }

  translateDate(date) {
    const check = moment(date).format('DD/MM/YYYY');
    return check;
  }
  translateDates(date) {
    let check = '';
    if (date && date.date && date.time) {
      check = moment(date, 'DD-MM-YYYY').format('DD/MM/YYYY');
    }
    return check;
  }


  internshipMailDialog(data) {
    data.civility = data.civility ? data.civility : '';
    data.first_name = data.first_name;
    data.last_name = data.last_name;
    this.subs.sink = this.dialog
      .open(UserEmailDialogComponent, {
        width: '750px',
        minHeight: '100px',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {});
  }


  resetTable() {
    this.isReset = true;
    this.selection.clear();
    this.dataSelected = [];
    this.dataUnselectUser = [];
    this.dataAlumniForExport = [];
    this.dataAlumniForSurvey = [];
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.schoolName = '';
    this.filteredValues = {
      family_name: '',
      used_family_name: '',
      name: '',
      promo_year: '',
      school: '',
      campus: '',
      sector: '',
      speciality: '',
      rncp_title: '',
      country: '',
      city: '',
      professional_status: '',
      company: '',
      updated_at: '',
      sent_by: '',
      survey_sent: '',

      latest_updated: null,
      last_survey_sent: null,
      last_survey_completed: null,
      offset: null,

      // abovetable
      promo_years: '',
      schools: '',
      campuses: '',
      sectors: '',
      specialities: '',
    };
    this.superFilterValue = {
      promo_years: '',
      schools: '',
      campuses: '',
      sectors: '',
      specialities: '',
    };

    // insideTable
    this.familyNameFilter.setValue('', { emitEvent: false });
    this.usedFamilyNameFilter.setValue('', { emitEvent: false });
    this.nameFilter.setValue('', { emitEvent: false });
    this.promoYearFilter.setValue('All', { emitEvent: false });
    this.schoolFilter.setValue('All', { emitEvent: false });
    this.campusFilter.setValue('All', { emitEvent: false });
    this.sectorFilter.setValue('All', { emitEvent: false });
    this.specialityFilter.setValue('All', { emitEvent: false });
    this.rncpFilter.setValue('', { emitEvent: false });
    this.cityFilter.setValue('All', { emitEvent: false });
    this.countryFilter.setValue('All', { emitEvent: false });
    this.professionalStatusFilter.setValue('All', { emitEvent: false });
    this.companyFilter.setValue('All', { emitEvent: false });
    this.updateDateFilter.setValue(null, { emitEvent: false });
    this.lastSurveyCompletedFilter.setValue('All', { emitEvent: false });
    this.sentByFilter.setValue('All', { emitEvent: false });

    this.lastSentSurveyFilter.setValue(null, { emitEvent: false });

    // aboveTable
    if (this.promotionList?.length > 0) {
      this.promoYearsFilter.setValue(null, { emitEvent: false });
    } else {
      this.promoYearsFilter.setValue(null, { emitEvent: false });
    }
    if (this.schoolsList?.length > 0) {
      this.schoolsFilter.setValue(null, { emitEvent: false });
    } else {
      this.schoolsFilter.setValue(null, { emitEvent: false });
    }
    if (this.campusList?.length > 0) {
      this.campusesFilter.setValue(null, { emitEvent: false });
    } else {
      this.campusesFilter.setValue(null, { emitEvent: false });
    }
    if (this.sectorList?.length > 0) {
      this.sectorsFilter.setValue(null, { emitEvent: false });
    } else {
      this.sectorsFilter.setValue(null, { emitEvent: false });
    }
    if (this.specilityList?.length > 0) {
      this.specialitiesFilter.setValue(null, { emitEvent: false });
    } else {
      this.specialitiesFilter.setValue(null, { emitEvent: false });
    }

    this.sortValue = null;

    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = '';
    this.sort.direction = '';
    this.sort.active = '';
    this.filterBreadcrumbData = [];
    this.getDataAlumni('resetCandidate');
  }

  filterTerm(name) {
    if (name) {
      if (name === '3') {
        this.isAlumni3 = !this.isAlumni3;
        this.isAlumni6 = false;
        this.isAlumni9 = false;
        this.isAlumni12 = false;
        if (this.isAlumni3) {
          this.filteredValues.latest_updated = 3;
        } else {
          this.filteredValues.latest_updated = null;
        }
      } else if (name === '6') {
        this.isAlumni3 = false;
        this.isAlumni6 = !this.isAlumni6;
        this.isAlumni9 = false;
        this.isAlumni12 = false;
        if (this.isAlumni6) {
          this.filteredValues.latest_updated = 6;
        } else {
          this.filteredValues.latest_updated = null;
        }
      } else if (name === '9') {
        this.isAlumni3 = false;
        this.isAlumni6 = false;
        this.isAlumni9 = !this.isAlumni9;
        this.isAlumni12 = false;
        if (this.isAlumni9) {
          this.filteredValues.latest_updated = 9;
        } else {
          this.filteredValues.latest_updated = null;
        }
      } else if (name === '12') {
        this.isAlumni3 = false;
        this.isAlumni6 = false;
        this.isAlumni9 = false;
        this.isAlumni12 = !this.isAlumni12;
        if (this.isAlumni12) {
          this.filteredValues.latest_updated = 12;
        } else {
          this.filteredValues.latest_updated = null;
        }
      }
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataAlumni('filterTerm');
      }
    } else {
      this.filteredValues.latest_updated = null;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataAlumni('filterTerm 2');
      }
    }
  }

  // getDataForList() {
  //   const name = '';
  //   this.subs.sink = this.candidatesService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe((resp) => {
  //     if (resp) {
  //       console.log('Data Import => ', resp);
  //       this.listObjective = resp;
  //       this.school = this.listObjective;
  //       this.filteredSchool = of(this.school.map((das) => das.short_name));
  //       this.getDataCampus();
  //     }
  //   });
  // }

  // getDataCampus() {
  //   // console.log('school selected ', this.schoolsFilter.value);
  //   this.levels = [];
  //   this.campusList = [];
  //   if (this.campusesFilter.value) {
  //     this.campusesFilter.setValue(null);
  //   }
  //   if (this.schoolsFilter.value) {
  //     const school = this.schoolsFilter.value;
  //     const scampusList = this.listObjective.filter((list) => {
  //       return school.includes(list.short_name);
  //     });
  //     this.schoolName = scampusList && scampusList.length ? scampusList[0].short_name : '';
  //     scampusList.filter((campus, n) => {
  //       if (campus.campuses && campus.campuses.length) {
  //         campus.campuses.filter((campuses, nex) => {
  //           this.campusList.push(campuses);
  //         });
  //       }
  //     });
  //     this.filteredCampus = of(this.campusList.map((nam) => nam.name));
  //   } else {
  //     this.listObjective.filter((campus, n) => {
  //       if (campus.campuses && campus.campuses.length) {
  //         campus.campuses.filter((campuses, nex) => {
  //           this.campusList.push(campuses);
  //         });
  //       }
  //     });
  //     this.filteredCampus = of(this.campusList.map((nam) => nam.name));
  //   }

  //   this.campusList = _.uniqBy(this.campusList, 'name');
  // }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  getDataTerms() {
    this.subs.sink = this.financeService.GetTermProfilRates().subscribe(
      (list) => {
        if (list && list.length) {
          this.listTerm = list.sort(function (a, b) {
            return a - b;
          });
          // console.log('this.listTerm', this.listTerm);
        }
      },
      (error) => {
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }
  sendSurvey(alumniId: string) {
    this.subs.sink = this.dialog
      .open(SendAlumniSurveyDialogComponent, {
        width: '800px',
        data: alumniId,
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getDataAlumni('sendSurvey');
        }
      });
  }

  sendNewSurvey() {
    if (this.dataSelected && this.dataSelected.length < 1 && !this.isCheckedAll) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('NAV.Alumni') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      this.subs.sink = this.dialog
        .open(SendAlumniSurveyDialogComponent, {
          width: '800px',
          data: this.dataSelected,
          disableClose: true,
        })
        .afterClosed()
        .subscribe((resp) => {
          if (resp) {
            this.getDataAlumni('sendSurvey');
          }
        });
    }
  }

  cleanFilterDataDownload() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    let promoYearMap;
    let schoolsMap;
    let sectorMap;
    let specialityMap;
    let campusesMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'last_survey_sent' || key === 'offset' || key === 'last_survey_completed') {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${filterData[key]}` : filterQuery + `"${key}":${filterData[key]}`;
        } else if (key === 'promo_years') {
          promoYearMap = filterData.promo_years.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${promoYearMap}]` : filterQuery + `"${key}":[${promoYearMap}]`;
        } else if (key === 'schools') {
          schoolsMap = filterData.schools.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${schoolsMap}]` : filterQuery + `"${key}":[${schoolsMap}]`;
        } else if (key === 'campuses') {
          campusesMap = filterData.campuses.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${campusesMap}]` : filterQuery + `"${key}":[${campusesMap}]`;
        } else if (key === 'sectors') {
          sectorMap = filterData.sectors.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${sectorMap}]` : filterQuery + `"${key}":[${sectorMap}]`;
        } else if (key === 'specialities') {
          specialityMap = filterData.specialities.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${specialityMap}]` : filterQuery + `"${key}":[${specialityMap}]`;
        } else {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        }
      }
    });
    return 'filter={' + filterQuery + '}';
  }

  csvDownload() {
    if (
      this.dataSelected &&
      this.dataSelected.length < 1 &&
      (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length))
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Alumni') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      const inputOptions = {
        ',': this.translate.instant('IMPORT_DECISION_S1.COMMA'),
        ';': this.translate.instant('IMPORT_DECISION_S1.SEMICOLON'),
        tab: this.translate.instant('IMPORT_DECISION_S1.TAB'),
      };
      // const currentLang = this.translate.currentLang;
      Swal.fire({
        type: 'question',
        title: this.translate.instant('IMPORT_DECISION_S1.TITLE'),
        width: 465,
        allowEscapeKey: true,
        showCancelButton: true,
        cancelButtonText: this.translate.instant('IMPORT_DECISION_S1.CANCEL'),
        confirmButtonText: this.translate.instant('IMPORT_DECISION_S1.OK'),
        input: 'radio',
        inputOptions: inputOptions,
        inputValue: this.translate && this.translate.currentLang === 'fr' ? ';' : '',
        inputValidator: (value) => {
          return new Promise((resolve, reject) => {
            if (value) {
              resolve('');
              Swal.enableConfirmButton();
            } else {
              Swal.disableConfirmButton();
              reject(this.translate.instant('IMPORT_DECISION_S1.INVALID'));
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
          if (inputValue === ';') {
            Swal.enableConfirmButton();
          }
        },
      }).then((separator) => {
        if (separator.value) {
          const fileType = separator.value;
          this.openDownloadCsv(fileType);
        }
      });
    }
  }

  openDownloadCsv(fileType) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const filter = this.cleanFilterDataDownload();
    const importStudentTemlate = `downloadAlumniCSV/`;
    // console.log('_ini filter', filter, this.userSelectedId);
    let filtered;
    if (
      (this.dataSelected.length && !this.isCheckedAll) ||
      (this.dataUnselectUser && this.dataUnselectUser.length && this.isCheckedAll && this.dataSelected && this.dataSelected.length)
    ) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      const alumni = `"alumni_ids":` + '[' + mappedUserId.toString() + ']';
      if (filter.length > 9) {
        filtered = filter.slice(0, 8) + alumni + ',' + filter.slice(8);
      } else {
        filtered = filter.slice(0, 8) + alumni + filter.slice(8);
      }
    } else if (this.isCheckedAll) {
      filtered = filter;
    }
    const sorting = this.sortingForExport();
    const userTypeId = `user_type_id=${this.currentUserTypeId}`;
    const fullURL = url + importStudentTemlate + fileType + '/' + lang + '?' + filtered + '&' + sorting + '&' + userTypeId;
    console.log('fullURL', fullURL);

    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
      }),
    };

    this.isLoading = true;
    this.httpClient.get(`${encodeURI(fullURL)}`, httpOptions).subscribe(
      (res) => {
        if (res) {
          this.isLoading = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('ReAdmission_S3.TITLE'),
            text: this.translate.instant('ReAdmission_S3.TEXT'),
            confirmButtonText: this.translate.instant('ReAdmission_S3.BUTTON'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => this.resetTable);
        } else {
          this.isLoading = false;
        }
      },
      (err) => {
        this.isLoading = false;
      },
    );

    // element.href = encodeURI(url + importStudentTemlate + fileType + '/' + lang + '?' + filtered);
    // console.log(element.href);
    // element.target = '_blank';
    // element.download = 'Template Import CSV';
    // document.body.appendChild(element);
    // element.click();
    // document.body.removeChild(element);
  }
  sortingForExport() {
    let data = '';
    if (this.sortValue) {
      const sortData = _.cloneDeep(this.sortValue);
      Object.keys(sortData).forEach((key) => {
        if (sortData[key]) {
          data = data ? data + ',' + `"${key}":"${sortData[key]}"` : data + `"${key}":"${sortData[key]}"`;
        }
      });
    }
    return 'sorting={' + data + '}';
  }
  cancelExportSwal() {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('Followup_S8.Title'),
      html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('NAV.Alumni') }),
      confirmButtonText: this.translate.instant('Followup_S8.Button'),
    });
  }
  applySuperFilter() {
    this.superFilteCurrentValue = _.cloneDeep(this.superFilterValue);
    this.filteredValues.sectors = this.superFilterValue.sectors;
    this.filteredValues.promo_years = this.superFilterValue.promo_years;
    this.filteredValues.schools = this.superFilterValue.schools;
    this.filteredValues.campuses = this.superFilterValue.campuses;
    this.filteredValues.specialities = this.superFilterValue.specialities;
    this.paginator.firstPage();
    this.getDataAlumni('superFilter');
  }

  checkAllFilterPromoYears() {
    const form = this.promoYearsFilter.value;
    if (form && form.length) {
      this.promoYearsFilter.patchValue(form);
    } else {
      this.promoYearsFilter.patchValue(null);
    }
  }

  checkAllFilterSchool() {
    const form = this.schoolsFilter.value;
    if (form && form.length) {
      this.schoolsFilter.patchValue(form);
    } else {
      this.schoolsFilter.patchValue(null);
    }
    this.getDataCampusBySchool();
  }

  checkAllFilterCampus() {
    const form = this.campusesFilter.value;
    if (form && form.length) {
    this.campusesFilter.patchValue(form);
    } else {
      this.campusesFilter.patchValue(null);
    }
    this.getDataSectorByCampus();
  }

  checkAllFilterSector() {
    const form = this.sectorsFilter.value;
    if (form && form.length) {
      this.sectorsFilter.patchValue(form);
    } else {
      this.sectorsFilter.patchValue(null);
    }
    this.getDataSpecialityBySector();
  }

  checkAllFilterSpeciality() {
    const form = this.specialitiesFilter.value;
    if (form && form.length) {
      this.specialitiesFilter.patchValue(form);
    } else {
      this.specialitiesFilter.patchValue(null);
    }
  }

  checkCurrentSuperFilterValue() {
    const initial = JSON.stringify(this.superFilterValue);
    const current = JSON.stringify(this.superFilteCurrentValue);
    if (initial === current) {
      return true;
    } else {
      return false;
    }
  }
  // start get data for checkbox
  getDataAlumniForExport(pageNumber, action) {
    if (this.buttonClicked === 'export') {
      if (this.isCheckedAll) {
        if (this.dataUnselectUser.length < 1) {
          this.csvDownload();
        } else {
          if (pageNumber === 0) {
            this.dataAlumniForExport = [];
            this.dataSelected = [];
          }
          const pagination = {
            limit: 500,
            page: pageNumber,
          };
          this.isLoading = true;
          const filter = this.cleanFilterData();
          const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
          this.subs.sink = this.alumniService.getAllAlumniForExportCheckbox(pagination, this.sortValue, filter, userTypesList).subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.dataAlumniForExport = _.concat(this.dataAlumniForExport, resp);
                const page = pageNumber + 1;
                this.getDataAlumniForExport(page, action);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll) {
                  if (this.dataAlumniForExport && this.dataAlumniForExport.length) {
                    this.dataSelected = this.dataAlumniForExport.filter((list) => !this.dataUnselectUser.includes(list._id));
                    this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                    console.log('getAllAlumniForExportCheckbox', this.dataSelected);
                    this.csvDownload();
                  }
                }
              }
            },
            (error) => {
              this.isReset = false;
              this.isLoading = false;
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('OK'),
              });
            },
          );
        }
      } else {
        this.csvDownload();
      }
    }
  }
  getDataAlumniForSurvey(pageNumber, action) {
    if (this.buttonClicked === 'survey') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.dataAlumniForSurvey = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const filter = this.cleanFilterData();
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        this.subs.sink = this.alumniService.getAllAlumniForSurveyCheckbox(pagination, this.sortValue, filter, userTypesList).subscribe(
          (students: any) => {
            if (students && students.length) {
              const resp = _.cloneDeep(students);
              this.dataAlumniForSurvey = _.concat(this.dataAlumniForSurvey, resp);
              const page = pageNumber + 1;
              this.getDataAlumniForSurvey(page, action);
            } else {
              this.isLoading = false;
              if (this.isCheckedAll) {
                if (this.dataAlumniForSurvey && this.dataAlumniForSurvey.length) {
                  this.dataSelected = this.dataAlumniForSurvey.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  console.log('getAllAlumniForSurveyCheckbox', this.dataSelected);
                  if (this.dataSelected && this.dataSelected.length) {
                    this.sendNewSurvey();
                  }
                }
              }
            }
          },
          (error) => {
            this.isReset = false;
            this.isLoading = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translate.instant('OK'),
            });
          },
        );
      } else {
        this.sendNewSurvey();
      }
    }
  }
  // end get data for checkbox

  controllerButton(action) {
    switch (action) {
      case 'export':
        setTimeout(() => {
          this.getDataAlumniForExport(0, 'export');
        }, 500);
        break;
      case 'survey':
        setTimeout(() => {
          this.getDataAlumniForSurvey(0, 'survey');
        }, 500);
        break;
      default:
        this.resetTable();
    }
  }
  filterBreadcrumbFormat() {
    const lastSentSurveyList = [
      {
        value: 'three_month',
        key: '3 Month and more',
      },
      {
        value: 'six_month',
        key: '6 Month and more',
      },
      {
        value: 'nine_month',
        key: '9 Month and more',
      },
      {
        value: 'one_year',
        key: '1 Year and more',
      },
    ];
    const filterInfo: FilterBreadCrumbInput[] = [
      // Super Filter
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'promo_years', // name of the key in the object storing the filter
        column: 'ALUMNI.Promo year', // name of the column in the table or the field if super filter
        isMultiple: true, // can it support multiple selection
        filterValue: this.superFilterValue, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.promotionList, // the array/list holding the dropdown options
        filterRef: this.promoYearsFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        resetValue: this.promotionList?.length ? ['AllF'] : null,
      },
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'schools', // name of the key in the object storing the filter
        column: 'ALUMNI.School', // name of the column in the table or the field if super filter
        isMultiple: true, // can it support multiple selection
        filterValue: this.superFilterValue, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.schoolsList, // the array/list holding the dropdown options
        filterRef: this.schoolsFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'short_name', // the key displayed in the html (only applicable to array of objects)
        savedValue: 'short_name', // the value saved when user select an option (e.g. _id)
        resetValue: this.schoolsList?.length ? ['AllF'] : null,
      },
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'campuses', // name of the key in the object storing the filter
        column: 'ALUMNI.Campus', // name of the column in the table or the field if super filter
        isMultiple: true, // can it support multiple selection
        filterValue: this.superFilterValue, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.campusList, // the array/list holding the dropdown options
        filterRef: this.campusesFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'short_name', // the key displayed in the html (only applicable to array of objects)
        savedValue: '_id', // the value saved when user select an option (e.g. _id)
        resetValue: this.campusList?.length ? ['AllF'] : null,
      },
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'sectors', // name of the key in the object storing the filter
        column: 'ALUMNI.Sector', // name of the column in the table or the field if super filter
        isMultiple: true, // can it support multiple selection
        filterValue: this.superFilterValue, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.sectorList, // the array/list holding the dropdown options
        filterRef: this.sectorsFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'name', // the key displayed in the html (only applicable to array of objects)
        savedValue: '_id', // the value saved when user select an option (e.g. _id)
        resetValue: this.sectorList?.length ? ['AllF'] : null,
      },
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'specialities', // name of the key in the object storing the filter
        column: 'ALUMNI.Speciality', // name of the column in the table or the field if super filter
        isMultiple: true, // can it support multiple selection
        filterValue: this.superFilterValue, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.specilityList, // the array/list holding the dropdown options
        filterRef: this.specialitiesFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'name', // the key displayed in the html (only applicable to array of objects)
        savedValue: '_id', // the value saved when user select an option (e.g. _id)
        resetValue: this.specilityList?.length ? ['AllF'] : null,
      },
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'last_survey_sent', // name of the key in the object storing the filter
        column: 'ALUMNI.Last sent survey', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: lastSentSurveyList, // the array/list holding the dropdown options
        filterRef: this.lastSentSurveyFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'key', // the key displayed in the html (only applicable to array of objects)
        savedValue: 'value', // the value saved when user select an option (e.g. _id)
        translationPrefix: 'ALUMNI.',
      },
      // Table Filter
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'family_name', // name of the key in the object storing the filter
        column: 'ALUMNI.Last name', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.familyNameFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true
      },
      {
        type: 'table_filter',
        name: 'used_family_name',
        column: 'ALUMNI.Used last name',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.usedFamilyNameFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
        noTranslate: true
      },
      {
        type: 'table_filter',
        name: 'name',
        column: 'ALUMNI.First name',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.nameFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
        noTranslate: true
      },
      {
        type: 'table_filter',
        name: 'promo_year',
        column: 'ALUMNI.Promo year',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.promotionList,
        filterRef: this.promoYearFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
        resetValue: 'All',
      },
      {
        type: 'table_filter',
        name: 'school',
        column: 'ALUMNI.School',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.schoolsList,
        filterRef: this.schoolFilter,
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'short_name',
        savedValue: '_id',
        resetValue: 'All',
      },
      {
        type: 'table_filter',
        name: 'campus',
        column: 'ALUMNI.Campus',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.campusList,
        filterRef: this.campusFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
        resetValue: 'All',
      },
      {
        type: 'table_filter',
        name: 'sector',
        column: 'ALUMNI.Sector',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.sectorList,
        filterRef: this.sectorFilter,
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'name',
        savedValue: '_id',
        resetValue: 'All',
      },
      {
        type: 'table_filter',
        name: 'speciality',
        column: 'ALUMNI.Speciality',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.specilityList,
        filterRef: this.specialityFilter,
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'name',
        savedValue: '_id',
        resetValue: 'All',
      },
      {
        type: 'table_filter',
        name: 'rncp_title',
        column: 'ALUMNI.RNCP/Diploma',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.rncpFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
        noTranslate: true
      },
      {
        type: 'table_filter',
        name: 'city',
        column: 'ALUMNI.City',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.cityList,
        filterRef: this.cityFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
        resetValue: 'All',
        noTranslate: true
      },
      {
        type: 'table_filter',
        name: 'country',
        column: 'ALUMNI.Country',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.countryList,
        filterRef: this.countryFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
        resetValue: 'All',
        noTranslate: true
      },
      {
        type: 'table_filter',
        name: 'professional_status',
        column: 'ALUMNI.Professional status',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.profesionalStatusList,
        filterRef: this.professionalStatusFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
        translationPrefix: 'ALUMNI.',
        resetValue: 'All',
      },
      {
        type: 'table_filter',
        name: 'company',
        column: 'ALUMNI.Company',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.companyList,
        filterRef: this.companyFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
        resetValue: 'All',
        noTranslate: true
      },
      {
        type: 'table_filter',
        name: 'survey_sent',
        column: 'ALUMNI.Last sent survey',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.updateDateFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
      },
      {
        type: 'table_filter',
        name: 'last_survey_completed',
        column: 'ALUMNI.Last survey completed',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.lastSurveyCompletedList,
        filterRef: this.lastSurveyCompletedFilter,
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'survey',
        savedValue: 'value',
      },
      {
        type: 'table_filter',
        name: 'sent_by',
        column: 'ALUMNI.Sent by',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.surveySender,
        filterRef: this.sentByFilter,
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'full_name',
        savedValue: '_id',
        resetValue: 'All',
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }
  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.superFilterValue, this.filteredValues);
      if (filterItem.type === 'super_filter') {
        if (this.filteredValues && this.filteredValues[filterItem?.name]) {
          this.filteredValues[filterItem?.name] = null;
        }
        if (this.superFilterValue && this.superFilterValue[filterItem?.name]) {
          this.superFilterValue[filterItem?.name] = null;
        }
        if (filterItem.name === 'schools') {
          this.getDataCampusBySchool();
        } else if (filterItem.name === 'campuses') {
          this.getDataSectorByCampus();
        } else if (filterItem.name === 'sectors') {
          this.getDataSpecialityBySector();
        }
        this.resetCheckbox();
        this.applySuperFilter();
      } else {
        this.resetCheckbox();
        this.getDataAlumni('removeFilterBreadcrumb');
      }
    }
  }
  isAllDropdownSelected(type) {
    if (type === 'promo') {
      const selected = this.promoYearsFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.promotionList.length;
      return isAllSelected;
    } else if (type === 'school') {
      const selected = this.schoolsFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.schoolsList.length;
      return isAllSelected;
    } else if (type === 'campus') {
      const selected = this.campusesFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.campusList.length;
      return isAllSelected;
    } else if (type === 'sector') {
      const selected = this.sectorsFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.sectorList.length;
      return isAllSelected;
    } else if (type === 'speciality') {
      const selected = this.specialitiesFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.specilityList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'promo') {
      const selected = this.promoYearsFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.promotionList.length;
      return isIndeterminate;
    } else if (type === 'school') {
      const selected = this.schoolsFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.schoolsList.length;
      return isIndeterminate;
    } else if (type === 'campus') {
      const selected = this.campusesFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.campusList.length;
      return isIndeterminate;
    } else if (type === 'sector') {
      const selected = this.sectorsFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.sectorList.length;
      return isIndeterminate;
    } else if (type === 'speciality') {
      const selected = this.specialitiesFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.specilityList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'promo') {
      if (event.checked) {
        const promoData = this.promotionList.map((el) => el);
        this.promoYearsFilter.patchValue(promoData, { emitEvent: false });
      } else {
        this.promoYearsFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'school') {
      if (event.checked) {
        const schoolData = this.schoolsList.map((el) => el.short_name);
        this.schoolsFilter.patchValue(schoolData, { emitEvent: false });
      } else {
        this.schoolsFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'campus') {
      if (event.checked) {
        const campusData = this.campusList.map((el) => el);
        this.campusesFilter.patchValue(campusData, { emitEvent: false });
      } else {
        this.campusesFilter.patchValue(null, { emitEvent: false });
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
    }
  }
}
