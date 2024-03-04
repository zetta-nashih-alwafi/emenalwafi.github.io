import { UtilityService } from './../../service/utility/utility.service';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TeacherManagementService } from 'app/service/teacher-management/teacher-management.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { AddUserDialogComponent } from 'app/shared/components/add-user-dialog/add-user-dialog.component';
import { UserEmailDialogComponent } from 'app/users/user-email-dialog/user-email-dialog.component';
import { UserService } from 'app/service/user/user.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { ImportTeacherDialogComponent } from '../import-teacher-dialog/import-teacher-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import * as moment from 'moment';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AskRequiredDocumentsDialogComponent } from './ask-required-documents-dialog/ask-required-documents-dialog.component';
import { FinancesService } from 'app/service/finance/finance.service';

@Component({
  selector: 'ms-teacher-management-table',
  templateUrl: './teacher-management-table.component.html',
  styleUrls: ['./teacher-management-table.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class TeacherManagementTableComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();
  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = ['checkbox', 'name', 'user_type', 'entity', 'cddu', 'convention', 'status', 'action'];
  filterColumns: string[] = [
    'checkboxFilter',
    'nameFilter',
    'user_typeFilter',
    'entityFilter',
    'cdduFilter',
    'conventionFilter',
    'statusFilter',
    'actionFilter',
  ];
  sortValue = null;
  isWaitingForResponse = false;
  noData: any;
  usersCount = 0;
  filterNameValue = {
    name: null,
    status: null,
    statuses: null,
    contract_statuses: null,
  };

  filteredValueSuperFilter = {
    scholar_season_ids: null,
    school_ids: null,
    campus_ids: null,
    type_of_contracts: null,
  };

  filterNameValueAll = {
    name: 'All',
    status: 'All',
    statuses: 'All',
    contract_statuses: 'All',
    cddu: 'All',
    convention: 'All',
    scholar_season_ids: 'All',
    school_ids: 'All',
    campus_ids: 'All',
    type_of_contracts: 'All',
  };
  nameFilter = new UntypedFormControl('', []);
  statusFilter = new UntypedFormControl(null);
  conventionFilter = new UntypedFormControl(null);
  cdduFilter = new UntypedFormControl(null);
  disabledActions = false;
  teacherSelected: any[];
  teacherSelectedId: any[];
  statusFilterList: any[];
  isReset = true;
  tempDataFilter = {
    status: null,
    cddu: null,
    convention: null,
    scholar_season_id: null,
    school_ids: null,
    campus_ids: null,
    type_of_contracts: null,
  };

  // =================== CheckBox Selection ============================

  selection = new SelectionModel<any>(true, []);
  pageSelected = [];
  isCheckedAll = false;
  dataSelected = [];
  allTeachersForCheckbox = [];
  selectType: any;
  mailUser: MatDialogRef<UserEmailDialogComponent>;
  private timeOutVal: any;
  private intVal: any;
  isUsingLink = false;

  scholarFilter = new UntypedFormControl('All');
  schoolsFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  typeOfContractFilter = new UntypedFormControl(null);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  currentUser: any;
  isPermission: string[];
  currentUserTypeId: any;
  hyperplanningStatus: any;
  allExportForCheckbox = [];
  dataUnselectUser = [];
  isLoading = false;
  filterBreadcrumbData = [];
  cdduConventionList = [];

  campusList = [];
  schoolList = [];
  scholarList = [];
  typeOfContractList = [];

  typeOfContractSelected = [];
  schoolSelected = [];
  scholarSelected = [];
  campusSelected = [];

  schoolName = '';
  campusName = '';
  typeOfContractName = '';

  listObjective = [];
  campusListBackup = [];
  typeOfContractListBackup = [];
  originalScholarList = [];

  isSuperFilterApplied = false;
  isDisabled = true;

  userTypeLoginId: any;
  userScholarSelected = '';
  userSchoolSelected: any;

  constructor(
    private teacherManagementService: TeacherManagementService,
    private translate: TranslateService,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    public permission: PermissionService,
    private authService: AuthService,
    private candidatesService: CandidatesService,
    private http: HttpClient,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private utilService: UtilityService,
    private pageTitleService: PageTitleService,
    private financeService: FinancesService,
  ) {}

  ngOnInit() {
    this.statusFilterList = [
      { value: 'active', label: this.translate.instant('Active') },
      { value: 'pending', label: this.translate.instant('pending') },
      { value: 'incorrect_email', label: this.translate.instant('incorrect_email') },
    ];
    this.cdduConventionList = [
      {
        value: 'not_sent',
        label: this.translate.instant('statusList.not_sent'),
      },
      {
        value: 'not_completed',
        label: this.translate.instant('statusList.not_completed'),
      },
      {
        value: 'waiting_for_validation',
        label: this.translate.instant('statusList.waiting_for_validation'),
      },
      {
        value: 'rejected',
        label: this.translate.instant('statusList.rejected'),
      },
      {
        value: 'validated',
        label: this.translate.instant('statusList.validated'),
      },
      {
        value: 'document_expired',
        label: this.translate.instant('statusList.document_expired'),
      },
    ];
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();

    if (this.isPermission && this.isPermission.length) {
      if (this.currentUser && this.currentUser.entities && this.currentUser.entities.length) {
        this.userTypeLoginId = this.currentUser.entities.find((resp) => resp.type && resp.type.name === this.isPermission[0]);
      }
    }

    if (this.scholarFilter.value) {
      this.userScholarSelected = this.scholarFilter.value;
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }

    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.getDataScholarSeasons();
    this.getAllTeacher();
    this.initializeUserFilter();
    this.setStatusFilter();
    this.setStatusTypeOfContractCDDU();
    this.setStatusTypeOfContractConvention();
    this.getDataTypeOfContract();
    this.pageTitleService.setTitle('NAV.Teachers');
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getDataScholarSeasons();
      this.getDataTypeOfContract();
      this.statusFilterList = [
        { value: 'active', label: this.translate.instant('Active') },
        { value: 'pending', label: this.translate.instant('pending') },
        { value: 'incorrect_email', label: this.translate.instant('incorrect_email') },
      ];
      this.cdduConventionList = [
        {
          value: 'not_sent',
          label: this.translate.instant('statusList.not_sent'),
        },
        {
          value: 'not_completed',
          label: this.translate.instant('statusList.not_completed'),
        },
        {
          value: 'waiting_for_validation',
          label: this.translate.instant('statusList.waiting_for_validation'),
        },
        {
          value: 'rejected',
          label: this.translate.instant('statusList.rejected'),
        },
        {
          value: 'validated',
          label: this.translate.instant('statusList.validated'),
        },
        {
          value: 'document_expired',
          label: this.translate.instant('statusList.document_expired'),
        },
      ];

      if (this.campusFilter.value) {
        this.getDataTypeOfContract();
      }
    });
  }

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.originalScholarList = _.cloneDeep(resp);
          this.scholarList = [];
          this.scholarList = this.originalScholarList.sort((firstTemp, lastTemp) =>
            firstTemp.scholar_season > lastTemp.scholar_season ? 1 : lastTemp.scholar_season > firstTemp.scholar_season ? -1 : 0,
          );
          this.scholarList.unshift({ _id: 'All', scholar_season: this.translate.instant('All') });
          this.scholarList = _.uniqBy(this.scholarList, '_id');
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  scholarSelect() {
    if (this.scholarFilter?.value && this.scholarFilter?.value !== this.userScholarSelected) {
      this.schoolList = [];
      this.campusList = [];
      if (this.schoolsFilter?.value) {
        this.schoolsFilter.setValue(null);
      }
      if (this.campusFilter?.value) {
        this.campusFilter.setValue(null);
      }
      this.userScholarSelected = this.scholarFilter?.value;
    }
    if (!this.scholarFilter.value || this.scholarFilter.value.length === 0) {
      this.filteredValueSuperFilter.scholar_season_ids = null;
      this.scholarSelected = [];
      this.schoolList = [];
      this.campusList = [];
      this.getDataForList();
    } else {
      this.filteredValueSuperFilter.scholar_season_ids = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : null;
      this.scholarSelected = this.scholarFilter.value;
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }
  }

  getDataForList(scholar_season?) {
    this.subs.sink = this.teacherManagementService.GetDataForSchoolSuperFilter(scholar_season, this.userTypeLoginId.type._id).subscribe(
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
            this.schoolList = this.listObjective;
            this.schoolList = this.schoolList.sort((firstTemp, lastTemp) =>
              firstTemp.short_name > lastTemp.short_name ? 1 : lastTemp.short_name > firstTemp.short_name ? -1 : 0,
            );
          } else {
            this.listObjective = resp;
            this.schoolList = this.listObjective;
            this.schoolList = this.schoolList.sort((firstTemp, lastTemp) =>
              firstTemp.short_name > lastTemp.short_name ? 1 : lastTemp.short_name > firstTemp.short_name ? -1 : 0,
            );
          }
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  checkSuperFilterSchool() {
    const form = this.schoolsFilter.value;
    if (form && form.length) {
      this.schoolsFilter.patchValue(form);
    } else {
      this.schoolsFilter.patchValue(null);
    }
    this.getDataCampus();
  }

  checkSuperFilterCampus() {
    const form = this.campusFilter.value;
    if (form && form.length) {
      this.campusFilter.patchValue(form);
      this.filteredValueSuperFilter.campus_ids = form;
    } else {
      this.campusFilter.patchValue(null);
      this.filteredValueSuperFilter.campus_ids = null;
    }
  }

  checkSuperFilterTypeOfContract() {
    const form = this.typeOfContractFilter.value;
    if (form && form.length) {
      this.typeOfContractFilter.patchValue(form);
      this.filteredValueSuperFilter.type_of_contracts = form;
    } else {
      this.typeOfContractFilter.patchValue(null);
      this.filteredValueSuperFilter.type_of_contracts = null;
    }
  }

  getDataCampus() {
    if ((this.schoolsFilter?.value || !this.schoolsFilter?.value?.length) && this.schoolsFilter?.value !== this.userSchoolSelected) {
      this.campusList = [];
      this.schoolName = '';

      if (this.campusFilter?.value) {
        this.campusFilter.setValue(null);
      }
      this.userSchoolSelected = this.schoolsFilter?.value;
    }

    const schools = this.schoolsFilter.value;

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
      if (schools && !schools.includes('All')) {
        this.filteredValueSuperFilter.school_ids = this.schoolsFilter.value;
        schools.forEach((element) => {
          const sName = this.schoolList.find((list) => list._id === element);
          this.schoolName = this.schoolName ? this.schoolName + ',' + sName.short_name : sName.short_name;
        });
        this.currentUser.app_data.school_package.forEach((element) => {
          if (element && element.school && element.school._id && schools.includes(element.school._id)) {
            this.campusList = _.concat(this.campusList, element.school.campuses);
          }
        });
      } else if (schools && schools.includes('All')) {
        this.currentUser.app_data.school_package.forEach((element) => {
          if (element && element.school && element.school._id) {
            this.campusList = _.concat(this.campusList, element.school.campuses);
          }
        });
        this.filteredValueSuperFilter.school_ids = null;
      }
    } else {
      if (schools && !schools.includes('All') && this.listObjective && this.listObjective.length) {
        const scampusList = this.listObjective.filter((list) => {
          return schools.includes(list._id);
        });

        scampusList.filter((campus) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.filter((campusess) => {
              this.campusList.push(campusess);
            });
          }
        });
        this.filteredValueSuperFilter.school_ids = this.schoolsFilter.value;
      } else if (schools && schools.includes('All') && this.listObjective && this.listObjective.length) {
        this.listObjective.forEach((list) => {
          if (list.campuses && list.campuses.length) {
            list.campuses.forEach((campus) => {
              this.campusList.push(campus);
            });
          }
        });
        this.filteredValueSuperFilter.school_ids = null;
      } else {
        this.filteredValueSuperFilter.school_ids = null;
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
    this.campusList = _.uniqBy(campuses, '_id');
    this.campusList = this.campusList.sort((firstTemp, secondTemp) =>
      firstTemp.name > secondTemp.name ? 1 : secondTemp.name > firstTemp.name ? -1 : 0,
    );
  }

  getDataTypeOfContract() {
    this.typeOfContractList = [];
    this.typeOfContractList = [
      {
        value: 'cddu',
        label: this.translate.instant('cddu'),
      },
      {
        value: 'convention',
        label: this.translate.instant('convention'),
      },
    ];
  }

  applySuperFilter() {
    this.isSuperFilterApplied = true;
    this.paginator.firstPage();
    this.getAllTeacher();
    this.isSuperFilterApplied = false;
    this.isDisabled = true;
  }

  cleanFilterData(filteredValues?) {
    const filterData = _.cloneDeep(filteredValues);
    Object.keys(filterData).forEach((key) => {
      if ((!filterData[key] && filterData[key] !== false) || !filterData[key].length) {
        delete filterData[key];
      }
    });

    if (filterData?.scholar_season_ids) {
      filterData.scholar_season_ids = [filterData?.scholar_season_ids];
    }

    return filterData;
  }

  cleanSortData(sortValue) {
    Object.keys(sortValue).forEach((key) => {
      if (!sortValue[key] && sortValue[key] !== false) {
        delete sortValue[key];
      }
    });

    if (sortValue && sortValue?.type_of_contract && !sortValue?.contract_status) {
      delete sortValue['type_of_contract'];
    }

    return sortValue;
  }

  getAllTeacher() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    const tempFilter = { ...this.filterNameValue, ...this.filteredValueSuperFilter };
    const finalFilter = this.cleanFilterData(tempFilter);

    let sortValue;
    if (this.sortValue) {
      sortValue = this.cleanSortData(this.sortValue);
    }

    this.subs.sink = this.teacherManagementService.getAllTeachers(pagination, finalFilter, sortValue).subscribe({
      next: (resp) => {
        const mapTeacher = this.mappingCDDUandConvention(resp);
        this.dataSource.data = _.cloneDeep(mapTeacher);
        this.usersCount = resp && resp.length ? resp[0].count_document : 0;
        this.isWaitingForResponse = false;
        this.noData = this.dataSource.connect().pipe(map((data) => data.length === 0));
        this.isReset = false;
        this.getUpdateInfo();
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      error: (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    });
  }

  mappingCDDUandConvention(teachers) {
    let result = [];
    result = teachers.map((teacher) => ({
      ...teacher,
      cddu: this.mappingFormStatus(teacher?.teacher_required_document_process_ids, 'cddu'),
      convention: this.mappingFormStatus(teacher?.teacher_required_document_process_ids, 'convention'),
    }));
    return result;
  }

  mappingFormStatus(teacher_required_document_process_ids, type) {
    switch (type) {
      case 'cddu':
        if (teacher_required_document_process_ids && teacher_required_document_process_ids?.length) {
          const result = teacher_required_document_process_ids
            .filter((data) => data?.contract_type === 'cddu')
            .map((data) => data?.form_status);
          return result?.length ? result[0] : 'not_sent';
        } else {
          return 'not_sent';
        }
      case 'convention':
        if (teacher_required_document_process_ids && teacher_required_document_process_ids?.length) {
          const result = teacher_required_document_process_ids
            .filter((data) => data?.contract_type === 'convention')
            .map((data) => data?.form_status);
          return result?.length ? result[0] : 'not_sent';
        } else {
          return 'not_sent';
        }
    }
  }

  displayTooltip(status) {
    if (status === 'not_completed') {
      return this.translate.instant('statusList.not_completed');
    } else if (status === 'waiting_for_validation') {
      return this.translate.instant('statusList.waiting_for_validation');
    } else if (status === 'rejected') {
      return this.translate.instant('statusList.rejected');
    } else if (status === 'validated') {
      return this.translate.instant('statusList.validated');
    } else if (status === 'document_expired') {
      return this.translate.instant('statusList.document_expired');
    }
  }

  getUpdateInfo() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.candidatesService.getAppPermission().subscribe(
      (ress) => {
        if (ress && ress.hyperplanning) {
          this.hyperplanningStatus = ress.hyperplanning;
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
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

  updateHyperplanning() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherManagementService.sendTeacherToHyperplanning().subscribe(
      (resp) => {
        if (resp) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            text: this.translate.instant('We are updating hyperplanning, it can take few minutes before the status change'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          });
        }
        this.isWaitingForResponse = false;
        this.clearSelection();
        this.getAllTeacher();
      },
      (error) => {
        this.isWaitingForResponse = false;
        console.log(error);
        this.authService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('There is no template connected to this program')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            text: this.translate.instant('There is no template connected to this program'),
            confirmButtonText: this.translate.instant('Okay'),
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

  // ============== Initialization Filter =================================

  initializeUserFilter() {
    this.subs.sink = this.scholarFilter.valueChanges.subscribe((value) => {
      this.filteredValueSuperFilter.school_ids = null;
      this.filteredValueSuperFilter.campus_ids = null;
      this.isDisabled = false;
    });

    this.subs.sink = this.schoolsFilter.valueChanges.subscribe((value) => {
      this.filteredValueSuperFilter.campus_ids = null;
      this.isDisabled = false;
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((value) => {
      this.isDisabled = false;
    });

    this.subs.sink = this.typeOfContractFilter.valueChanges.subscribe((value) => {
      this.isDisabled = false;
    });

    this.subs.sink = this.nameFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      this.teacherSelected = [];
      this.teacherSelectedId = [];
      const search = this.utilService.simpleDiacriticSensitiveRegex(name);
      if (search.match(/^[a-zA-Z0-9_-\s]*$/)) {
        this.filterNameValue.name = name;
        this.paginator.pageIndex = 0;
        this.getAllTeacher();
      } else {
        this.nameFilter.setValue('');
        this.filterNameValue.name = '';
        this.paginator.pageIndex = 0;
        this.getAllTeacher();
      }
    });

    // this.subs.sink = this.statusFilter.valueChanges.subscribe((status) => {
    //   this.filterNameValue.status = status === 'AllM' ? null : status;
    //   this.paginator.pageIndex = 0;
    //   this.getAllTeacher();
    // });
  }

  setStatusFilter() {
    const isSame = JSON.stringify(this.tempDataFilter.status) === JSON.stringify(this.statusFilter.value);
    if (isSame) {
      return;
    } else if (this.statusFilter.value?.length) {
      this.filterNameValue.statuses = this.statusFilter.value;
      this.tempDataFilter.status = this.statusFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTeacher();
      }
    } else {
      if (this.tempDataFilter.status?.length && !this.statusFilter.value?.length) {
        this.filterNameValue.statuses = this.statusFilter.value;
        this.tempDataFilter.status = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllTeacher();
        }
      } else {
        return;
      }
    }
  }

  setStatusTypeOfContractCDDU() {
    const isSame = JSON.stringify(this.tempDataFilter?.cddu) === JSON.stringify(this.cdduFilter.value);
    if (isSame) {
      return;
    } else if (this.cdduFilter.value?.length) {
      if (!this.filterNameValue.contract_statuses) {
        this.filterNameValue.contract_statuses = [];
        this.tempDataFilter.cddu = [];
      }

      this.filterNameValue.contract_statuses = this.mapFilterCDDUorConvention('CDDU');

      this.tempDataFilter.cddu = this.cdduFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTeacher();
      }
    } else {
      if (this.tempDataFilter.cddu?.length && !this.cdduFilter.value?.length) {
        this.filterNameValue.contract_statuses = this.mapFilterCDDUorConvention('Convention');
        this.tempDataFilter.cddu = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllTeacher();
        }
      } else {
        return;
      }
    }
  }

  setStatusTypeOfContractConvention() {
    const isSame = JSON.stringify(this.tempDataFilter?.convention) === JSON.stringify(this.conventionFilter.value);
    if (isSame) {
      return;
    } else if (this.conventionFilter.value?.length) {
      if (!this.filterNameValue.contract_statuses) {
        this.filterNameValue.contract_statuses = [];
        this.tempDataFilter.convention = [];
      }
      this.filterNameValue.contract_statuses = this.mapFilterCDDUorConvention('Convention');
      this.tempDataFilter.convention = this.conventionFilter.value;

      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTeacher();
      }
    } else {
      if (this.tempDataFilter.convention?.length && !this.conventionFilter.value?.length) {
        this.filterNameValue.contract_statuses = this.mapFilterCDDUorConvention('CDDU');
        this.tempDataFilter.convention = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllTeacher();
        }
      } else {
        return;
      }
    }
  }

  mapFilterCDDUorConvention(from) {
    if (from === 'CDDU') {
      if (this.cdduFilter?.value && this.cdduFilter?.value?.length) {
        return this.cdduFilter.value
          .map((cddu) => ({ type_of_contract: 'cddu', contract_status: cddu }))
          .concat(
            (this.conventionFilter.value &&
              this.conventionFilter.value.map((convention) => ({ type_of_contract: 'convention', contract_status: convention }))) ||
              [],
          );
      } else {
        return null;
      }
    } else if (from === 'Convention') {
      if (this.conventionFilter?.value && this.conventionFilter?.value?.length) {
        return this.conventionFilter.value
          .map((convention) => ({ type_of_contract: 'convention', contract_status: convention }))
          .concat(
            (this.cdduFilter.value && this.cdduFilter.value.map((cddu) => ({ type_of_contract: 'cddu', contract_status: cddu }))) || [],
          );
      } else {
        return null;
      }
    }
  }

  clearSelection() {
    this.dataSelected = [];
    this.teacherSelected = [];
    this.teacherSelectedId = [];
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
    this.paginator.pageIndex = 0;
    this.disabledActions = false;
  }

  // ============== Reset Filter =================================

  resetFilter() {
    this.campusList = [];
    this.schoolList = [];
    this.isReset = true;
    this.userScholarSelected = '';
    this.userSchoolSelected = '';
    this.filterNameValue = {
      name: null,
      status: null,
      statuses: null,
      contract_statuses: null,
    };

    this.filteredValueSuperFilter = {
      scholar_season_ids: null,
      school_ids: null,
      campus_ids: null,
      type_of_contracts: null,
    };

    this.scholarFilter.patchValue('All');
    this.schoolsFilter.patchValue(null);
    this.campusFilter.patchValue(null);
    this.typeOfContractFilter.patchValue(null);

    if (this.scholarFilter?.value) this.userScholarSelected = this.scholarFilter?.value;

    this.nameFilter.setValue('', { emitEvent: false });
    this.statusFilter.setValue(null, { emitEvent: false });
    this.conventionFilter.setValue(null, { emitEvent: false });
    this.cdduFilter.setValue(null, { emitEvent: false });
    this.tempDataFilter = {
      status: null,
      cddu: null,
      convention: null,
      scholar_season_id: null,
      school_ids: null,
      campus_ids: null,
      type_of_contracts: null,
    };
    this.paginator.pageIndex = 0;
    this.disabledActions = false;
    this.sortValue = null;
    this.sort.direction = '';
    this.sort.active = '';
    this.filterBreadcrumbData = [];
    this.isDisabled = true;
    this.getDataScholarSeasons();
    this.clearSelection();
    this.getAllTeacher();
    if (this.scholarFilter.value) {
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }
  }

  // ============== Get Entities ===================================

  getUniqueEntities(entities) {
    return _.uniqBy(entities, 'entity_name');
  }

  getUniqueUserType(entities) {
    return _.uniqBy(
      entities.filter((entity) => entity && entity.type),
      'type.name',
    );
  }

  renderTooltipEntity(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    const type = _.uniqBy(entities, 'entity_name');
    for (const entity of type) {
      count++;
      if (count > 1) {
        if (entity.entity_name) {
          tooltip = tooltip + ', ';
          tooltip = tooltip + this.translate.instant(entity.entity_name);
        }
      } else {
        if (entity.entity_name) {
          tooltip = tooltip + this.translate.instant(entity.entity_name);
        }
      }
    }
    return tooltip;
  }

  renderTooltipType(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    const type = _.uniqBy(
      entities.filter((entity) => entity && entity.type),
      'type.name',
    );
    for (const entity of type) {
      count++;
      if (count > 1) {
        if (entity.type) {
          tooltip = tooltip + ', ';
          tooltip = tooltip + this.translate.instant('USER_TYPES.' + entity.type.name);
        }
      } else {
        if (entity.type) {
          tooltip = tooltip + this.translate.instant('USER_TYPES.' + entity.type.name);
        }
      }
    }
    return tooltip;
  }
  getAllIdForCheckbox(pageNumber) {
    if (this.isCheckedAll) {
      if (this.dataUnselectUser.length < 1) {
        this.csvDownloadTeacher();
      } else {
        if (pageNumber === 0) {
          this.allExportForCheckbox = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const tempFilter = { ...this.filterNameValue, ...this.filteredValueSuperFilter };
        const finalFilter = this.cleanFilterData(tempFilter);
        this.subs.sink = this.teacherManagementService
          .getAllTeachersForCheckbox(pagination, finalFilter, this.sortValue)
          .subscribe(
            (teachers) => {
              if (teachers && teachers.length) {
                this.allExportForCheckbox.push(...teachers);
                const page = pageNumber + 1;
                this.getAllIdForCheckbox(page);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll) {
                  if (this.allExportForCheckbox && this.allExportForCheckbox.length) {
                    this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                    this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                    this.csvDownloadTeacher();
                  }
                }
              }
            },
            (error) => {
              this.isWaitingForResponse = false;
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
      this.csvDownloadTeacher();
    }
  }

  csvDownloadTeacher() {
    if (
      this.dataSelected &&
      this.dataSelected.length < 1 &&
      (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser.length > 1))
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('teacher') }),
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
        title: this.translate.instant('EXPORT_DECISION.TITLE'),
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
    let filtered;
    console.log('filter', filter);
    if (
      (this.dataSelected.length && !this.isCheckedAll) ||
      (this.dataUnselectUser && this.dataUnselectUser.length && this.isCheckedAll && this.dataSelected.length)
    ) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      const billing = `"user_ids":` + '[' + mappedUserId.toString() + ']';
      if (filter.length > 9) {
        filtered = filter.slice(0, 8) + billing + ',' + filter.slice(8);
      } else {
        filtered = filter.slice(0, 8) + billing + filter.slice(8);
      }
    } else if (this.isCheckedAll && this.dataUnselectUser && !this.dataUnselectUser.length) {
      filtered = filter;
    }
    console.log('_fil', filtered);

    const exportTeachersData = `exportTeachersData/`;
    let fullURL;
    if (filtered) {
      fullURL = url + exportTeachersData + fileType + '/' + lang + '?' + filtered + '&user_type_id="' + this.currentUserTypeId + '"';
    } else {
      fullURL = url + exportTeachersData + fileType + '/' + lang + '?user_type_id="' + this.currentUserTypeId + '"';
    }
    console.log('fullURL', fullURL);
    this.isUsingLink = false;
    if (this.isUsingLink) {
      element.href = encodeURI(fullURL);
      element.target = '_blank';
      element.download = 'Teachers Export CSV';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      const token = localStorage.getItem(environment.tokenKey);
      this.isLoading = true;
      this.subs.sink = this.http
        .get(
          encodeURI(fullURL),
          token
            ? {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            : null,
        )
        .subscribe(
          (res) => {
            this.isLoading = false;
            if (res) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('ReAdmission_S3.TITLE'),
                text: this.translate.instant('ReAdmission_S3.TEXT'),
                confirmButtonText: this.translate.instant('ReAdmission_S3.BUTTON'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.clearSelection();
              });
            }
          },
          (err) => {
            this.isLoading = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ')) : err,
              confirmButtonText: this.translate.instant('ReAdmission_S3.BUTTON'),
            });
          },
        );
    }
  }

  cleanFilterDataDownload() {
    const filterData = _.cloneDeep({ ...this.filterNameValue, ...this.filteredValueSuperFilter });
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'name') {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        } else if (key === 'contract_statuses') {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${JSON.stringify(filterData[key])}` : filterQuery + `"${key}":${JSON.stringify(filterData[key])}`;
        } else if (key === 'statuses') {
          const dataMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${dataMap}]` : filterQuery + `"${key}":[${dataMap}]`;
        } else if (key === 'school_ids') {
          const schoolsMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${schoolsMap}]` : filterQuery + `"${key}":[${schoolsMap}]`;
        } else if (key === 'type_of_contracts') {
          const typeOfContractMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"${key}":[${typeOfContractMap}]`
            : filterQuery + `"${key}":[${typeOfContractMap}]`;
        } else if (key === 'campus_ids') {
          const campusesMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${campusesMap}]` : filterQuery + `"${key}":[${campusesMap}]`;
        } else if (key === 'scholar_season_ids') {
          const scholarSeasonsMap = filterData[key];
          filterQuery = filterQuery
            ? filterQuery + ',' + `"${key}":["${scholarSeasonsMap}"]`
            : filterQuery + `"${key}":["${scholarSeasonsMap}"]`;
        }
      }
    });
    return 'filter={' + filterQuery + '}';
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return this.isCheckedAll ? true : numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    console.log('master masuk');

    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
    } else {
      console.log('master else masuk');
      this.selection.clear();
      this.dataSelected = [];
      this.isCheckedAll = true;
      this.allTeachersForCheckbox = [];
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
      // this.getDataAllForCheckbox(0);
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
    }
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 50,
      page: pageNumber,
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherManagementService.getAllTeachersForCheckbox(pagination, this.filterNameValue, this.sortValue).subscribe(
      (teachers) => {
        if (teachers && teachers.length) {
          this.allTeachersForCheckbox.push(...teachers);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
          this.isWaitingForResponse = false;
          if (this.isCheckedAll) {
            if (this.allTeachersForCheckbox && this.allTeachersForCheckbox.length) {
              this.allTeachersForCheckbox.forEach((element) => {
                this.selection.select(element._id);
                this.dataSelected.push(element);
              });
              this.disabledActions = true;
            }
            this.pageSelected.push(this.paginator.pageIndex);
          } else {
            this.pageSelected = [];
          }
        }
      },
      (error) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(error);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('OK'),
        });
      },
    );
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
      this.disabledActions = true;
    } else {
      this.disabledActions = false;
    }
    this.teacherSelected = [];
    this.teacherSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.teacherSelected.push(user);
      this.teacherSelectedId.push(user._id);
    });
    console.log(this.teacherSelected);
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  // ================= Dialog Add Teacher ==========================
  addTeacher() {
    this.subs.sink = this.dialog
      .open(AddUserDialogComponent, {
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        width: '660px',
        data: { type: 'create-teacher' },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.goToTeacherCardDetail(resp._id, true);
        }
      });
  }

  importTeacher(fileType) {
    this.subs.sink = this.dialog
      .open(ImportTeacherDialogComponent, {
        disableClose: true,
        width: '600px',
        minHeight: '100px',
        data: { fileDelimiter: fileType },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getAllTeacher();
        }
      });
  }

  goToTeacherCardDetail(userId: string, dialog?) {
    const params = { teacherId: userId, tab: 'details' };
    const url = this.router?.createUrlTree(['users/teacher-list'], { queryParams: params });
    window?.open(url?.toString(), '_blank');
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  sendMail(data) {
    this.mailUser = this.dialog.open(UserEmailDialogComponent, {
      disableClose: true,
      width: '750px',
      data: data,
    });
  }

  deactiveUser(userId: string, civility: string, firstName: string, lastName: string, user: any) {
    const unixUserTypeId = _.uniqBy(user.entities, 'type._id');
    let timeDisabled = 3;
    if (unixUserTypeId === '61dd3ccff647127fd6bf65d7') {
      this.isWaitingForResponse = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('DELETE_USER.UNDER_CONSTRUCTION'),
        allowEscapeKey: true,
        allowOutsideClick: false,
        confirmButtonText: this.translate.instant('ConnectAs.Button'),
      });
    } else {
      Swal.fire({
        allowOutsideClick: false,
        type: 'question',
        title: this.translate.instant('DeleteTeacher_S1.TITLE'),
        html: this.translate.instant('DeleteTeacher_S1.TEXT', {
          civility: civility !== 'neutral' ? this.translate.instant(civility) : '',
          firstName: firstName,
          lastName: lastName,
        }),
        showCancelButton: true,
        confirmButtonText: this.translate.instant('DeleteTeacher_S1.BUTTON1', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('DeleteTeacher_S1.BUTTON2'),
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          this.intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('DeleteTeacher_S1.BUTTON1') + ' in ' + ` (${timeDisabled})` + ' sec';
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('DeleteTeacher_S1.BUTTON1');
            Swal.enableConfirmButton();
            // clearTimeout(time);
            clearInterval(this.intVal);
          }, timeDisabled * 1000);
          // clearTimeout(this.timeOutVal);
        },
      }).then((isConfirm) => {
        if (isConfirm.value) {
          this.subs.sink = this.userService.deleteUser(userId).subscribe(
            (resp) => {
              if (resp) {
                if (!resp.errors) {
                  Swal.fire({
                    allowOutsideClick: false,
                    confirmButtonText: this.translate.instant('OK'),
                    type: 'success',
                    title: this.translate.instant('DELETE_USER.SUCCESS_TITLE'),
                    text: this.translate.instant('DELETE_USER.SUCCESS_TEXT'),
                  });
                  this.getAllTeacher();
                } else if (resp.errors && resp.errors[0] && resp.errors[0].message === 'the mentor is already used in student contract') {
                  Swal.fire({
                    allowOutsideClick: false,
                    confirmButtonText: this.translate.instant('DeleteMent_S1.BUTTON'),
                    type: 'info',
                    title: this.translate.instant('DeleteMent_S1.TITLE'),
                    text: this.translate.instant('DeleteMent_S1.TEXT'),
                  });
                  this.getAllTeacher();
                } else if (resp.errors && resp.errors[0] && resp.errors[0].message === 'user should transfer the responsibility first') {
                  Swal.fire({
                    allowOutsideClick: false,
                    confirmButtonText: this.translate.instant('DeleteTypeUser.Btn-Confirm'),
                    type: 'info',
                    title: this.translate.instant('DeleteTypeUser.Title'),
                    text: this.translate.instant('DeleteTypeUser.Body'),
                  });
                  this.getAllTeacher();
                } else if (resp.errors && resp.errors[0] && resp.errors[0].message === 'user still have todo tasks') {
                  Swal.fire({
                    allowOutsideClick: false,
                    confirmButtonText: this.translate.instant('DeleteUserTodo.Btn-Confirm'),
                    type: 'warning',
                    title: this.translate.instant('DeleteUserTodo.Title'),
                    text: this.translate.instant('DeleteUserTodo.Body'),
                  });
                  this.getAllTeacher();
                } else if (resp.errors && resp.errors[0] && resp.errors[0].message === 'Teacher already assigned to program sequence') {
                  Swal.fire({
                    title: this.translate.instant('DeleteTeacher_S2.TITLE'),
                    html: this.translate.instant('DeleteTeacher_S2.TEXT', {
                      civility: civility !== 'neutral' ? this.translate.instant(civility) : '',
                      firstName: firstName,
                      lastName: lastName,
                    }),
                    type: 'warning',
                    showConfirmButton: true,
                    confirmButtonText: this.translate.instant('DeleteTeacher_S2.BUTTON1'),
                  });
                  this.getAllTeacher();
                } else if (resp.errors && resp.errors[0] && resp.errors[0].message) {
                  Swal.fire({
                    allowOutsideClick: false,
                    confirmButtonText: this.translate.instant('OK'),
                    type: 'info',
                    title: this.translate.instant('Error'),
                    text: resp.errors[0].message,
                  });
                }
              }
            },
            (err) => {
              this.authService.postErrorLog(err);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            },
          );
        }
      });
    }
  }

  sortData(sort: Sort) {
    if (sort?.active === 'cddu' || sort?.active === 'convention') {
      this.sortValue = {
        type_of_contract: sort?.active,
        contract_status: sort?.direction ? sort?.direction : null,
      };
    } else {
      this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : null } : null;
    }
    this.paginator.pageIndex = 0;
    this.getAllTeacher();
  }

  templateForImport() {
    const inputOptions = {
      ',': this.translate.instant('IMPORT_TEMPLATE_S1.COMMA'),
      ';': this.translate.instant('IMPORT_TEMPLATE_S1.SEMICOLON'),
      tab: this.translate.instant('IMPORT_TEMPLATE_S1.TAB'),
    };

    Swal.fire({
      type: 'question',
      title: this.translate.instant('IMPORT_TEMPLATE_S1.TITLE'),
      width: 465,
      allowEscapeKey: true,
      showCancelButton: true,
      cancelButtonText: this.translate.instant('IMPORT_TEMPLATE_S1.CANCEL'),
      confirmButtonText: this.translate.instant('IMPORT_TEMPLATE_S1.OK'),
      input: 'radio',
      inputValue: ';',
      inputOptions: inputOptions,
    }).then((separator) => {
      console.log(separator);
      if (separator && separator.value) {
        this.teacherManagementService.downloadTemplateTeacherManagement(separator.value);
      }
    });
  }

  csvTypeSelectionUpload() {
    const inputOptions = {
      ',': this.translate.instant('IMPORT_DECISION_S1.COMMA'),
      ';': this.translate.instant('IMPORT_DECISION_S1.SEMICOLON'),
      tab: this.translate.instant('IMPORT_DECISION_S1.TAB'),
    };

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
      inputValue: ';',
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
        this.importTeacher(fileType);
      }
    });
  }

  translateTime(time) {
    if (time) {
      const timeLocal = this.parseUtcToLocalPipe.transform(time);
      return timeLocal && timeLocal !== 'Invalid date' && moment(timeLocal, 'HH:mm').format('HH[h]mm') !== 'Invalid date'
        ? moment(timeLocal, 'HH:mm').format('HH[h]mm')
        : '00h00';
    } else {
      return '';
    }
  }

  translateDate(date, time) {
    if (date && time) {
      return this.parseUtcToLocalPipe.transformDate(date, time);
    } else {
      return '';
    }
  }

  ngAfterViewInit() {
    // this.dataSource.sort = this.sort;
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getAllTeacher();
          }
        }),
      )
      .subscribe();
  }

  isAllDropdownSelected(type) {
    if (type === 'scholar') {
      const selected = this.scholarFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.scholarList.length;
      return isAllSelected;
    } else if (type === 'school') {
      const selected = this.schoolsFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.schoolList.length;
      return isAllSelected;
    } else if (type === 'campus') {
      const selected = this.campusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.campusList.length;
      return isAllSelected;
    } else if (type === 'typeOfContract') {
      const selected = this.typeOfContractFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.typeOfContractList.length;
      return isAllSelected;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.statusFilterList.length;
      return isAllSelected;
    } else if (type === 'convention') {
      const selected = this.conventionFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.cdduConventionList.length;
      return isAllSelected;
    } else if (type === 'cddu') {
      const selected = this.cdduFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.cdduConventionList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'scholar') {
      const selected = this.scholarFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.scholarList.length;
      return isIndeterminate;
    } else if (type === 'school') {
      const selected = this.schoolsFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.schoolList.length;
      return isIndeterminate;
    } else if (type === 'campus') {
      const selected = this.campusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.campusList.length;
      return isIndeterminate;
    } else if (type === 'typeOfContract') {
      const selected = this.typeOfContractFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.typeOfContractList.length;
      return isIndeterminate;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.statusFilterList.length;
      return isIndeterminate;
    } else if (type === 'convention') {
      const selected = this.conventionFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.cdduConventionList.length;
      return isIndeterminate;
    } else if (type === 'cddu') {
      const selected = this.cdduFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.cdduConventionList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'scholar') {
      if (event.checked) {
        this.scholarFilter.patchValue('All', { emitEvent: false });
      } else {
        this.scholarFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'school') {
      if (event.checked) {
        const schoolData = this.schoolList.map((el) => el._id);
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
    } else if (type === 'typeOfContract') {
      if (event.checked) {
        const typeOfContractData = this.typeOfContractList.map((el) => el?.value);
        this.typeOfContractFilter.patchValue(typeOfContractData, { emitEvent: false });
      } else {
        this.typeOfContractFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'status') {
      if (event.checked) {
        const statusData = this.statusFilterList.map((el) => el.value);
        this.statusFilter.patchValue(statusData);
      } else {
        this.statusFilter.patchValue(null);
      }
    } else if (type === 'convention') {
      if (event.checked) {
        const statusData = this.cdduConventionList.map((el) => el.value);
        this.conventionFilter.patchValue(statusData);
      } else {
        this.conventionFilter.patchValue(null);
      }
    } else if (type === 'cddu') {
      if (event.checked) {
        const statusData = this.cdduConventionList.map((el) => el.value);
        this.cdduFilter.patchValue(statusData);
      } else {
        this.cdduFilter.patchValue(null);
      }
    }
  }

  filterBreadcrumbFormat() {
    let cdduStatusesSelected = [];
    let conventionStatusesSelected = [];
    if (this.filterNameValue?.contract_statuses?.length) {
      this.filterNameValue?.contract_statuses?.map((contractStatus) => {
        if (contractStatus?.type_of_contract === 'convention') {
          conventionStatusesSelected.push(contractStatus?.contract_status);
        } else if (contractStatus?.type_of_contract === 'cddu') {
          cdduStatusesSelected.push(contractStatus?.contract_status);
        }
      });
    }
    const filterValue = {
      statuses:
        this.statusFilter?.value?.length && !this.statusFilter?.value?.includes('All') && this.filterNameValue?.statuses
          ? this.filterNameValue?.statuses
          : null,
      cddu:
        this.cdduFilter?.value?.length && !this.cdduFilter?.value?.includes('All') && cdduStatusesSelected && cdduStatusesSelected?.length
          ? cdduStatusesSelected
          : null,
      convention:
        this.conventionFilter?.value?.length &&
        !this.conventionFilter?.value?.includes('All') &&
        conventionStatusesSelected &&
        conventionStatusesSelected?.length
          ? conventionStatusesSelected
          : null,
    };
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'scholar_season_ids', // name of the key in the object storing the filter
        column: 'CARDDETAIL.Scholar Season', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValueSuperFilter, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.scholarList, // the array/list holding the dropdown options
        filterRef: this.scholarFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'scholar_season', // the key displayed in the html (only applicable to array of objects)
        savedValue: '_id', // the value saved when user select an option (e.g. _id)
        resetValue: 'All',
      },
      {
        type: 'super_filter',
        name: 'school_ids',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.School',
        isMultiple: this.schoolsFilter?.value?.length === this.schoolList?.length ? false : true,
        filterValue:
          this.schoolsFilter?.value?.length === this.schoolList?.length ? this.filterNameValueAll : this.filteredValueSuperFilter,
        filterList: this.schoolsFilter?.value?.length === this.schoolList?.length ? null : this.schoolList,
        filterRef: this.schoolsFilter,
        isSelectionInput: this.schoolsFilter?.value?.length === this.schoolList?.length ? false : true,
        displayKey: this.schoolsFilter?.value?.length === this.schoolList?.length ? null : 'short_name',
        savedValue: this.schoolsFilter?.value?.length === this.schoolList?.length ? null : '_id',
      },
      {
        type: 'super_filter',
        name: 'campus_ids',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus',
        isMultiple: this.campusFilter?.value?.length === this.campusList?.length ? false : true,
        filterValue: this.campusFilter?.value?.length === this.campusList?.length ? this.filterNameValueAll : this.filteredValueSuperFilter,
        filterList: this.campusFilter?.value?.length === this.campusList?.length ? null : this.campusList,
        filterRef: this.campusFilter,
        isSelectionInput: this.campusFilter?.value?.length === this.campusList?.length ? false : true,
        displayKey: this.campusFilter?.value?.length === this.campusList?.length ? null : 'name',
        savedValue: this.campusFilter?.value?.length === this.campusList?.length ? null : '_id',
      },
      {
        type: 'super_filter',
        name: 'type_of_contracts',
        column: 'Type of contract',
        isMultiple: this.typeOfContractFilter?.value?.length === this.typeOfContractList?.length ? false : true,
        filterValue:
          this.typeOfContractFilter?.value?.length === this.typeOfContractList?.length
            ? this.filterNameValueAll
            : this.filteredValueSuperFilter,
        filterList: this.typeOfContractFilter?.value?.length === this.typeOfContractList?.length ? null : this.typeOfContractList,
        filterRef: this.typeOfContractFilter,
        isSelectionInput: this.typeOfContractFilter?.value?.length === this.typeOfContractList?.length ? false : true,
        displayKey: this.typeOfContractFilter?.value?.length === this.typeOfContractList?.length ? null : 'label',
        savedValue: this.typeOfContractFilter?.value?.length === this.typeOfContractList?.length ? null : 'value',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'name', // name of the key in the object storing the filter
        column: 'Name', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filterNameValue, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.nameFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'statuses', // name of the key in the object storing the filter
        column: 'Status', // name of the column in the table or the field if super filter
        isMultiple: this.statusFilter?.value?.length === this.statusFilterList?.length ? false : true, // can it support multiple selection
        filterValue: this.statusFilter?.value?.length === this.statusFilterList?.length ? this.filterNameValueAll : filterValue, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.statusFilter?.value?.length === this.statusFilterList?.length ? null : this.statusFilterList, // the array/list holding the dropdown options
        filterRef: this.statusFilter, // the ref to form control binded to the filter
        isSelectionInput: this.statusFilter?.value?.length === this.statusFilterList?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.statusFilter?.value?.length === this.statusFilterList?.length ? null : 'value', // the key displayed in the html (only applicable to array of objects)
        savedValue: this.statusFilter?.value?.length === this.statusFilterList?.length ? null : 'value', // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'cddu', // name of the key in the object storing the filter
        column: 'cddu', // name of the column in the table or the field if super filter
        isMultiple: this.cdduFilter?.value?.length === this.cdduConventionList?.length ? false : true, // can it support multiple selection
        filterValue: this.cdduFilter?.value?.length === this.cdduConventionList?.length ? this.filterNameValueAll : filterValue, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.cdduFilter?.value?.length === this.cdduConventionList?.length ? null : this.cdduConventionList, // the array/list holding the dropdown options
        filterRef: this.cdduFilter, // the ref to form control binded to the filter
        isSelectionInput: this.cdduFilter?.value?.length === this.cdduConventionList?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.cdduFilter?.value?.length === this.cdduConventionList?.length ? null : 'value', // the key displayed in the html (only applicable to array of objects)
        savedValue: this.cdduFilter?.value?.length === this.cdduConventionList?.length ? null : 'value', // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'convention', // name of the key in the object storing the filter
        column: 'convention', // name of the column in the table or the field if super filter
        isMultiple: this.conventionFilter?.value?.length === this.cdduConventionList?.length ? false : true, // can it support multiple selection
        filterValue: this.conventionFilter?.value?.length === this.cdduConventionList?.length ? this.filterNameValueAll : filterValue, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.conventionFilter?.value?.length === this.cdduConventionList?.length ? null : this.cdduConventionList, // the array/list holding the dropdown options
        filterRef: this.conventionFilter, // the ref to form control binded to the filter
        isSelectionInput: this.conventionFilter?.value?.length === this.cdduConventionList?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.conventionFilter?.value?.length === this.cdduConventionList?.length ? null : 'value', // the key displayed in the html (only applicable to array of objects)
        savedValue: this.conventionFilter?.value?.length === this.cdduConventionList?.length ? null : 'value', // the value saved when user select an option (e.g. _id)
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.filteredValueSuperFilter, this.filterNameValue);

      if (filterItem?.column === 'cddu') {
        const filteredData = this.filterNameValue?.contract_statuses?.filter(
          (contractStatus) => contractStatus?.type_of_contract !== 'cddu',
        );
        this.filterNameValue.contract_statuses = filteredData;
      } else if (filterItem?.column === 'convention') {
        const filteredData = this.filterNameValue?.contract_statuses?.filter(
          (contractStatus) => contractStatus?.type_of_contract !== 'convention',
        );
        this.filterNameValue.contract_statuses = filteredData;
      }

      if (filterItem.name === 'scholar_season_ids') {
        this.scholarFilter.setValue('All');
        this.scholarSelect();
      } else if (filterItem.name === 'school_ids') {
        this.schoolsFilter.setValue(null);
        this.checkSuperFilterSchool();
      } else if (filterItem.name === 'campus_ids') {
        this.campusFilter.setValue(null);
        this.checkSuperFilterCampus();
      } else if (filterItem.name === 'type_of_contracts') {
        this.typeOfContractFilter.setValue(null);
        this.checkSuperFilterTypeOfContract();
      }

      this.clearSelection();
      this.getAllTeacher();
    }
  }

  requiredDocument() {
    if ((!this.dataSelected || this.dataSelected.length === 0) && !this.isCheckedAll) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Teacher') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      const tempFilter = { ...this.filterNameValue, ...this.filteredValueSuperFilter };
      const finalFilter = this.cleanFilterData(tempFilter);
      this.subs.sink = this.dialog
        .open(AskRequiredDocumentsDialogComponent, {
          panelClass: 'certification-rule-pop-up',
          disableClose: true,
          width: '700px',
          data: {
            isSelectAll: this.isCheckedAll ? true : false,
            filter: finalFilter,
            dataSelected: this.dataSelected,
          },
        })
        .afterClosed()
        .subscribe((resp) => {
          if (resp) {
            this.getAllTeacher();
          }
        });
    }
  }
}
