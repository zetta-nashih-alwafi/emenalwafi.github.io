import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { UntypedFormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { AddCrmDialogComponent } from '../add-crm-dialog/add-crm-dialog.component';
import { DueDateDialogComponent } from '../due-date-dialog/due-date-dialog.component';
import * as _ from 'lodash';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FinancesService } from 'app/service/finance/finance.service';
import * as moment from 'moment';
import { MailCanidateDialogComponent } from 'app/candidates/mail-candidates-dialog/mail-candidates-dialog.component';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { SendMailDialogComponent } from 'app/mailbox/send-mail-dialog/send-mail-dialog.component';
import Swal from 'sweetalert2';
import { ApplicationUrls } from 'app/shared/settings';
import { ExportCsvService } from 'app/service/export-csv/export-csv.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { UserService } from 'app/service/user/user.service';
import { LoginAsUserDialogComponent } from 'app/shared/components/login-as-user-dialog/login-as-user-dialog.component';

@Component({
  selector: 'ms-internship-follow-up',
  templateUrl: './internship-follow-up.component.html',
  styleUrls: ['./internship-follow-up.component.scss'],
})
export class InternshipTableComponent implements OnInit, AfterViewInit {
  filterColumns: string[] = [
    'selectFilter',
    'familyNameFilter',
    'nameFilter',
    'schoolFilter',
    'campusFilter',
    'levelFilter',
    'specialityFilter',
    'sectorFilter',
    // 'periodeFilter',
    // 'legalDurationFilter',
    'companyRelationMemberFilter',
    // 'studentStatusFilter',
    'agreementStatusFilter',
    'studentFilter',
    'mentorFilter',
    'companyManagerFilter',
    'crmFilter',
    'companyFilter',
    'internshipStatusFilter',
    // 'effectiveDurationFilter',
    'startDateFilter',
    'endDateFilter',
    'totalDurationAgreementFilter',
    // 'internshipReportFilter',
    // 'evalProFilter',
    // 'internshipValidatedFilter',
    'actionFilter',
  ];
  displayedColumns: string[] = [
    'select',
    'familyName',
    'name',
    'school',
    'campus',
    'level',
    'speciality',
    'sector',
    // 'periode',
    // 'legalDuration',
    'companyRelationMember',
    // 'studentStatus',
    'agreementStatus',
    'student',
    'mentor',
    'companyManager',
    'crm',
    'company',
    'internshipStatus',
    // 'effectiveDuration',
    'startDate',
    'endDate',
    'totalDurationAgreement',
    // 'internshipReport',
    // 'evalPro',
    // 'internshipValidated',
    'action',
  ];

  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  allStudentForCheckbox = [];
  dataSelected = [];
  isCheckedAll = false;
  pageSelected = [];
  disabledExport = true;
  dataCount = 0;
  noData;
  userSelected = [];
  userSelectedId: any[];
  internshipId = [];
  selectType;
  allInternshipId = [];

  private subs = new SubSink();
  flagsIconPath = '../../../../../assets/icons/flags-nationality/';
  isLoading: Boolean = false;
  internshipJobData = [];

  // dummy Data delete if dynamic
  internshipFollowUpData = [];

  filteredValues = {
    school_id: '',
    periode: '',
    student_status: '',
    crm_is_published: null,
    is_student_already_sign: null,
    is_hr_mentor_already_sign: null,
    is_company_manager_already_sign: null,
    company_branch_id: null,
    agreement_date_asked: null,
    agreement_status: null,
    internship_status: null,
    internship_start_date: null,
    company_hr: '',
    student: '',
    company: '',
    season: null,
    levels: [],
    campus_names: [],
    school_names: [],
    scholars: [],
    student_sign_status: null,
    mentor_sign_status: null,
    company_manager_sign_status: null,
    company_relation_member_sign_status: null,
    internship_end_date: null,
  };

  searchValues = {
    family_name: '',
    first_name: '',
    campus_name: '',
    school_name: '',
    level: '',
    company_relation_member: '',
    internship_status: '',
    agreement_status: '',
    company_name: '',
    sector: '',
    speciality: '',
  };

  familyNameFilter = new UntypedFormControl(null);
  nameFilter = new UntypedFormControl(null);
  companyRelationMemberFilter = new UntypedFormControl(null);
  studentStatusFilter = new UntypedFormControl(null);
  internshipStatusFilter = new UntypedFormControl(null);
  companyFilter = new UntypedFormControl(null);
  schoolFilter = new UntypedFormControl(null);
  companyManagerFilter = new UntypedFormControl(null);
  sectorFilter = new UntypedFormControl(null);
  specialityFilter = new UntypedFormControl(null);
  schoolFilterList = [
    { value: '', key: 'AllS' },
    { value: 'EFAP', key: 'EFAP' },
    { value: 'CESACOM', key: 'CESACOM' },
  ];
  campusFilter = new UntypedFormControl(null);
  campusFilterList = [
    { value: '', key: 'AllS' },
    { value: 'Paris', key: 'Paris' },
    { value: 'German', key: 'German' },
  ];
  multipleCampusFilter = new UntypedFormControl(null);
  multipleCampusFilterList = [
    { value: null, key: 'AllS' },
    { value: 'Paris', key: 'Paris' },
    { value: 'German', key: 'German' },
  ];
  seasonFilter = new UntypedFormControl(null);
  seasonFilterList = [
    { value: null, key: 'AllS' },
    { value: '16-17', key: '16-17' },
    { value: '17-18', key: '17-18' },
  ];
  schoolsFilter = new UntypedFormControl(null);
  schoolsFilterList = [
    { value: null, key: 'AllS' },
    { value: 'EFAP', key: 'EFAP' },
    { value: 'CESACOM', key: 'CESACOM' },
  ];
  levelsFilter = new UntypedFormControl(null);
  levelsFilterList = [
    { value: null, key: 'AllS' },
    { value: '1', key: '1' },
    { value: '2', key: '2' },
    { value: '3', key: '3' },
    { value: '4', key: '4' },
    { value: '5', key: '5' },
  ];
  levelFilter = new UntypedFormControl(null);
  levelFilterList = [
    { value: '1', key: '1' },
    { value: '2', key: '2' },
    { value: '3', key: '3' },
    { value: '4', key: '4' },
    { value: '5', key: '5' },
  ];
  periodeFilter = new UntypedFormControl(null);
  periodeFilterList = [
    { value: '', key: 'AllS' },
    { value: 'August', key: 'August' },
    { value: 'September', key: 'September' },
    { value: 'November', key: 'November' },
    { value: 'Desember', key: 'Desember' },
    { value: 'January', key: 'January' },
  ];
  agreementFilter = new UntypedFormControl(null);
  agreementFilterList = [
    { value: 'agreement_signed', key: 'Agreement signed' },
    { value: 'no_agreement', key: 'No agreement' },
    { value: 'waiting_for_signature', key: 'Waiting for signature' },
  ];
  internshipFilterList = [
    { value: 'empty', key: 'Empty' },
    { value: 'in_progress', key: 'In Progress' },
    { value: 'finished', key: 'Finished' },
    { value: 'interrupted', key: 'Interrupted' },
    { value: 'postponned', key: 'Postponned' },
  ];
  crmFilter = new UntypedFormControl(null);
  crmFilterList = [
    { value: 'signed', key: 'Company relation member validated the agreement' },
    { value: 'validate_information', key: 'Company relation member sent the agreement' },
    { value: 'not_validate_information', key: "Company relation member didn't send the agreement" },
  ];
  companyHrFilter = new UntypedFormControl(null);
  companyHrFilterList = [
    { value: 'signed', key: 'Mentor signed' },
    { value: 'validate_information', key: 'Mentor validate the informations' },
    { value: 'not_validate_information', key: "Mentor didn't validate information" },
  ];
  studentFilter = new UntypedFormControl(null);
  studentFilterList = [
    { value: 'signed', key: 'Student signed' },
    { value: 'validate_information', key: 'Student validate the informations' },
    { value: 'not_validate_information', key: "Student didn't validate information" },
  ];
  companyManagerFilterList = [
    { value: 'signed', key: 'Company manager signed' },
    { value: 'validate_information', key: 'Company manager validate the informations' },
    { value: 'not_validate_information', key: "Company manager didn't validate information" },
  ];

  filteredSchool: Observable<any>;
  filteredCampus: Observable<any>;
  filteredSpeciality: Observable<any>;
  filteredSector: Observable<any>;
  filteredLevel: Observable<any>;
  filteredAgreement: Observable<any>;
  filteredCrm: Observable<any>;
  filteredMentor: Observable<any>;
  filteredStudent: Observable<any>;
  filteredManager: Observable<any>;
  filteredInternStatus: Observable<any>;
  sectorList: any[];
  specialityList: any[];
  levels: any[];
  campusList: any[];
  levelSelected: any[];
  campusSelected: any[];
  scholarSelected: any[];
  schoolSelected: any[];
  listObjective: any;
  schoolName: any;
  school: any;
  scholars: any[];
  scholarFilter = new UntypedFormControl(null);
  currentUser: any;
  isReset: any;
  dataLoaded: boolean;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  sortValue = null;
  exportName: string;
  startDateFilter = new UntypedFormControl(null);
  endDateFilter = new UntypedFormControl(null);
  isPermission: any;
  userTypeLoginId: any;
  currentUserTypeId: any;
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private candidatesService: CandidatesService,
    private financeService: FinancesService,
    private translate: TranslateService,
    private authService: AuthService,
    private ngxPermissionService: NgxPermissionsService,
    private userService: UserService,
    private utilService: UtilityService,
    private exportCsvService: ExportCsvService,
  ) {}

  ngOnInit() {
    this.initFilter();
    this.translateDropdownFirstTime();
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    if (this.isPermission && this.isPermission.length) {
      if (this.currentUser && this.currentUser.entities && this.currentUser.entities.length) {
        this.userTypeLoginId = this.currentUser.entities.find((resp) => resp.type && resp.type.name === this.isPermission[0]);
      }
    }
    console.log('this.isPermission', this.isPermission, this.currentUser, this.userTypeLoginId);
    this.getAllInternship('ngOnInit');
    // this.setFilter();
    this.getDataForList();
    this.getSpecialityData();
    this.getDataScholarSeasons();
  }

  initFilter() {
    this.subs.sink = this.familyNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (statusSearch !== null && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch === '') {
          this.familyNameFilter.setValue(null);
          this.searchValues.family_name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAllInternship('familyNameFilter');
          }
        }
        this.searchValues.family_name = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllInternship('familyNameFilter');
        }
      } else {
        if (statusSearch !== null) {
          this.familyNameFilter.setValue(null);
          this.searchValues.family_name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAllInternship('familyNameFilter');
          }
        }
      }
    });
    this.subs.sink = this.nameFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (statusSearch !== null && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch === '') {
          this.nameFilter.setValue(null);
          this.searchValues.first_name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAllInternship('nameFilter');
          }
        }
        this.searchValues.first_name = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllInternship('nameFilter');
        }
      } else {
        if (statusSearch !== null) {
          this.nameFilter.setValue(null);
          this.searchValues.first_name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAllInternship('nameFilter');
          }
        }
      }
    });
    this.subs.sink = this.companyRelationMemberFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (statusSearch !== null && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch === '') {
          this.companyRelationMemberFilter.setValue(null);
          this.searchValues.company_relation_member = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAllInternship('companyRelationMemberFilter');
          }
        }
        this.searchValues.company_relation_member = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllInternship('companyRelationMemberFilter');
        }
      } else {
        if (statusSearch !== null) {
          this.companyRelationMemberFilter.setValue(null);
          this.searchValues.company_relation_member = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAllInternship('companyRelationMemberFilter');
          }
        }
      }
    });
    this.subs.sink = this.companyFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (statusSearch !== null && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch === '') {
          this.companyFilter.setValue(null);
          this.searchValues.company_name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAllInternship('companyFilter');
          }
        }
        this.searchValues.company_name = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllInternship('company_name');
        }
      } else {
        if (statusSearch !== null) {
          this.companyFilter.setValue(null);
          this.searchValues.company_name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAllInternship('company_name');
          }
        }
      }
    });
    this.filteredLevel = this.levelFilter.valueChanges.pipe(
      startWith(''),
      map((searchText) => {
        if (searchText && typeof searchText === 'string' && searchText !== '') {
          return this.levelFilterList
            .filter((level) => level.key.toLowerCase().includes(searchText.toLowerCase()))
            .sort((a: any, b: any) => a.key.localeCompare(b.key));
        }
        return this.levelFilterList;
      }),
    );
    // this.filteredInternStatus = this.internshipStatusFilter.valueChanges.pipe(
    //   startWith(''),
    //   map((searchText) => {
    //     if (searchText && typeof searchText === 'string' && searchText !== '') {
    //       return this.internshipFilterList
    //         .filter((item) => item.key.toLowerCase().includes(searchText.toLowerCase()))
    //         .sort((a: any, b: any) => a.key.localeCompare(b.key));
    //     }
    //     return this.internshipFilterList;
    //   })
    // );
    this.subs.sink = this.internshipStatusFilter.valueChanges.pipe(debounceTime(200)).subscribe((statusSearch) => {
      if (statusSearch) {
        const list = this.internshipFilterList.filter((type) => type && type.key.toLowerCase().trim().includes(statusSearch));
        this.filteredInternStatus = of(list);
      } else {
        this.filteredInternStatus = of(this.internshipFilterList);
      }
    });
    // this.filteredAgreement = this.agreementFilter.valueChanges.pipe(
    //   startWith(''),
    //   map((searchText) => {
    //     if (searchText && typeof searchText === 'string' && searchText !== '') {
    //       return this.agreementFilterList
    //         .filter((item) => item.key.toLowerCase().includes(searchText.toLowerCase()))
    //         .sort((a: any, b: any) => a.key.localeCompare(b.key));
    //     }
    //     return this.agreementFilterList;
    //   })
    // );
    this.subs.sink = this.agreementFilter.valueChanges.pipe(debounceTime(200)).subscribe((statusSearch) => {
      if (statusSearch) {
        const list = this.agreementFilterList.filter((type) => type && type.key.toLowerCase().trim().includes(statusSearch));
        this.filteredAgreement = of(list);
      } else {
        this.filteredAgreement = of(this.agreementFilterList);
      }
    });
    // this.filteredStudent = this.studentFilter.valueChanges.pipe(
    //   startWith(''),
    //   map((searchText) => {
    //     if (searchText && typeof searchText === 'string' && searchText !== '') {
    //       return this.studentFilterList
    //         .filter((item) => item.key.toLowerCase().includes(searchText.toLowerCase()))
    //         .sort((a: any, b: any) => a.key.localeCompare(b.key));
    //     }
    //     return this.studentFilterList;
    //   })
    // );
    this.subs.sink = this.studentFilter.valueChanges.pipe(debounceTime(200)).subscribe((statusSearch) => {
      if (statusSearch) {
        const list = this.studentFilterList.filter((type) => type && type.key.toLowerCase().trim().includes(statusSearch));
        this.filteredStudent = of(list);
      } else {
        this.filteredStudent = of(this.studentFilterList);
      }
    });
    // this.filteredManager = this.companyManagerFilter.valueChanges.pipe(
    //   startWith(''),
    //   map((searchText) => {
    //     if (searchText && typeof searchText === 'string' && searchText !== '') {
    //       return this.companyManagerFilterList
    //         .filter((item) => item.key.toLowerCase().includes(searchText.toLowerCase()))
    //         .sort((a: any, b: any) => a.key.localeCompare(b.key));
    //     }
    //     return this.companyManagerFilterList;
    //   })
    // );
    this.subs.sink = this.companyManagerFilter.valueChanges.pipe(debounceTime(200)).subscribe((statusSearch) => {
      if (statusSearch) {
        const list = this.companyManagerFilterList.filter((type) => type && type.key.toLowerCase().trim().includes(statusSearch));
        this.filteredManager = of(list);
      } else {
        this.filteredManager = of(this.companyManagerFilterList);
      }
    });
    // this.filteredMentor = this.companyHrFilter.valueChanges.pipe(
    //   startWith(''),
    //   map((searchText) => {
    //     if (searchText && typeof searchText === 'string' && searchText !== '') {
    //       return this.companyHrFilterList
    //         .filter((item) => item.key.toLowerCase().includes(searchText.toLowerCase()))
    //         .sort((a: any, b: any) => a.key.localeCompare(b.key));
    //     }
    //     return this.companyHrFilterList;
    //   })
    // );
    this.subs.sink = this.companyHrFilter.valueChanges.pipe(debounceTime(200)).subscribe((statusSearch) => {
      if (statusSearch) {
        const list = this.companyHrFilterList.filter((type) => type && type.key.toLowerCase().trim().includes(statusSearch));
        this.filteredMentor = of(list);
      } else {
        this.filteredMentor = of(this.companyHrFilterList);
      }
    });
    // this.filteredCrm = this.crmFilter.valueChanges.pipe(
    //   startWith(''),
    //   map((searchText) => {
    //     if (searchText && typeof searchText === 'string' && searchText !== '') {
    //       return this.crmFilterList
    //         .filter((item) => item.key.toLowerCase().includes(searchText.toLowerCase()))
    //         .sort((a: any, b: any) => a.key.localeCompare(b.key));
    //     }
    //     return this.crmFilterList;
    //   })
    // );
    this.subs.sink = this.crmFilter.valueChanges.pipe(debounceTime(200)).subscribe((statusSearch) => {
      if (statusSearch) {
        const list = this.crmFilterList.filter((type) => type && type.key.toLowerCase().trim().includes(statusSearch));
        this.filteredCrm = of(list);
      } else {
        this.filteredCrm = of(this.crmFilterList);
      }
    });

    this.subs.sink = this.startDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.internship_start_date = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllInternship('startDate filter');
        }
      }
    });
    this.subs.sink = this.endDateFilter.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.internship_end_date = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllInternship('endDate filter');
        }
      }
    });

    this.onLanguageChange();
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAllInternship('sortData');
      }
    }
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getAllInternship('ngAfterViewInit');
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getAllInternship(data) {
    console.log('Trigger From', data);
    this.userSelected = [];
    this.internshipId = [];
    this.disabledExport = true;
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.isLoading = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    let filter = this.cleanFilterData();
    console.log(this.filteredValues);
    filter +=
      this.filteredValues.scholars && this.filteredValues.scholars.length ? ` scholars : ` + JSON.stringify(this.scholarSelected) : '';
    filter +=
      this.filteredValues.school_names && this.filteredValues.school_names.length
        ? ` school_names: ` + JSON.stringify(this.schoolSelected)
        : '';
    filter += this.filteredValues.levels && this.filteredValues.levels.length ? ` levels: ` + JSON.stringify(this.levelSelected) : '';
    filter +=
      this.filteredValues.campus_names && this.filteredValues.campus_names.length
        ? ` campus_names: ` + JSON.stringify(this.campusSelected)
        : '';
    filter = 'filter: {' + filter + '}';
    const userTypeId = this.userTypeLoginId && this.userTypeLoginId.type ? this.userTypeLoginId.type._id : null;
    const search = this.cleanFilterDataSearch();
    this.subs.sink = this.candidatesService.getAllInternships(pagination, filter, this.sortValue, search, userTypeId).subscribe(
      (res) => {
        if (res) {
          this.isLoading = false;
          const dataWithEffectiveWeek = this.updateEffectiveDuration(res);
          this.dataSource.data = _.cloneDeep(dataWithEffectiveWeek);
          this.dataCount = res && res.length > 0 && res[0].count_document ? res[0].count_document : 0;
        }
        this.isReset = false;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
      },
      (err) => {
        this.isLoading = false;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getSpecialityData() {
    const userTypeId = this.userTypeLoginId.type._id;
    this.subs.sink = this.candidatesService.getAllSpecialityInternships(userTypeId).subscribe(
      (resp) => {
        if (resp && resp.length) {
          const speciality = _.cloneDeep(resp);
          this.specialityList = speciality.filter((fil) => fil.student_id.specialization).map((list) => list.student_id.specialization);
          if (this.specialityList && this.specialityList.length) {
            this.getSectorData();
          }
          this.specialityList = _.uniqBy(this.specialityList, 'name');
          this.filteredSpeciality = this.specialityFilter.valueChanges.pipe(
            startWith(''),
            map((searchText) => {
              if (searchText && typeof searchText === 'string' && searchText !== '') {
                return this.specialityList
                  .filter((type) => type.name.toLowerCase().includes(searchText.toLowerCase()))
                  .sort((a: any, b: any) => a.name.localeCompare(b.name));
              }
              return this.specialityList;
            }),
          );
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

  getSectorData() {
    const sector = [];
    this.specialityList.forEach((list) => {
      if (list.sectors && list.sectors.length) {
        sector.push(...list.sectors);
      }
    });
    this.sectorList = sector;
    this.sectorList = _.uniqBy(this.sectorList, 'name');
    this.filteredSector = this.sectorFilter.valueChanges.pipe(
      startWith(''),
      map((searchText) => {
        if (searchText && typeof searchText === 'string' && searchText !== '') {
          return this.sectorList
            .filter((type) => type.name.toLowerCase().includes(searchText.toLowerCase()))
            .sort((a: any, b: any) => a.name.localeCompare(b.name));
        }
        return this.sectorList;
      }),
    );
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    // console.log(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'crm_is_published' ||
          key === 'is_student_already_sign' ||
          key === 'is_company_manager_already_sign' ||
          key === 'internship_status' ||
          key === 'agreement_status' ||
          key === 'is_hr_mentor_already_sign' ||
          key === 'student_sign_status' ||
          key === 'mentor_sign_status' ||
          key === 'company_manager_sign_status' ||
          key === 'company_relation_member_sign_status'
        ) {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        } else if (key === 'scholars' || key === 'school_names' || key === 'campus_names' || key === 'levels') {
        } else {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        }
      }
    });
    return filterQuery;
  }

  cleanFilterDataSearch() {
    const filterData = _.cloneDeep(this.searchValues);
    // console.log(this.searchValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
      } else if (key === 'scholars' || key === 'school_names' || key === 'campus_names' || key === 'levels') {
      }
    });
    return 'searching: {' + filterQuery + '}';
  }

  updateEffectiveDuration(res) {
    res.map((data) => {
      const dates = data.internship_date.date_from.split('/');
      const format2 = 'YYYY-MM-DD';
      const newdates = moment().format(format2).split('-');
      const dates1 = moment([dates[2], dates[1], dates[0]]);
      const dates2 = moment([newdates[0], newdates[1], newdates[2]]);
      const diff = dates2.diff(dates1, 'days');
      const result = Math.floor(diff / 7);
      data['effectiveWeek'] = result;
      return data;
    });
    return res;
  }

  setSchoolFilter(value) {
    if (value === 'All') {
      this.searchValues['school_name'] = '';
      this.getAllInternship('School Filter');
    } else {
      this.searchValues['school_name'] = value;
      this.getAllInternship('School Filter');
    }
  }

  setCampusFilter(value) {
    if (value === 'All') {
      this.filteredValues['campus_name'] = '';
      this.getAllInternship('Campus Filter');
    } else {
      console.log(value);
      this.filteredValues['campus_name'] = value;
      this.getAllInternship('Campus Filter');
    }
  }

  setSpecialityFilter(value) {
    if (value === 'All') {
      this.searchValues['speciality'] = '';
      this.getAllInternship('speciality Filter');
    } else {
      // console.log(value);
      this.searchValues['speciality'] = value;
      this.getAllInternship('speciality Filter');
    }
  }

  setSectorFilter(value) {
    if (value === 'All') {
      this.searchValues['sector'] = '';
      this.getAllInternship('sector Filter');
    } else {
      // console.log(value);
      this.searchValues['sector'] = value;
      this.getAllInternship('sector Filter');
    }
  }

  setSchoolsFilter(value) {
    if (!value) {
      this.filteredValues['school_names'] = [];
      this.schoolSelected = [];
      this.getAllInternship('School Filter');
    } else {
      this.filteredValues['school_names'] = value;
      this.schoolSelected = value;
      this.getAllInternship('School Filter');
    }
  }

  setCampusesFilter(value) {
    if (!value) {
      this.filteredValues['campus_names'] = [];
      this.campusSelected = [];
      this.getAllInternship('Campus Filter');
    } else {
      this.filteredValues['campus_names'] = value;
      this.campusSelected = value;
      this.getAllInternship('Campus Filter');
    }
  }

  setLevelFilter(value) {
    if (!value) {
      this.searchValues['level'] = '';
      this.getAllInternship('Level Filter');
    } else {
      // console.log(value);
      this.searchValues['level'] = value;
      this.getAllInternship('Level Filter');
    }
  }

  setAgreementFilter(value) {
    if (!value) {
      this.filteredValues['agreement_status'] = null;
      this.getAllInternship('Agreement Filter');
    } else {
      // console.log(value);
      this.filteredValues['agreement_status'] = value;
      this.getAllInternship('Agreement Filter');
    }
  }

  setCrmFilter(value) {
    if (!value) {
      this.filteredValues['company_relation_member_sign_status'] = '';
      this.getAllInternship('Crm Filter');
    } else {
      // console.log(value);
      this.filteredValues['company_relation_member_sign_status'] = value;
      this.getAllInternship('Crm Filter');
    }
  }

  setMentorFilter(value) {
    if (!value) {
      this.filteredValues['mentor_sign_status'] = '';
      this.getAllInternship('Mentor Filter');
    } else {
      // console.log(value);
      this.filteredValues['mentor_sign_status'] = value;
      this.getAllInternship('Mentor Filter');
    }
  }

  setStudentFilter(value) {
    if (!value) {
      this.filteredValues['student_sign_status'] = '';
      this.getAllInternship('Student Filter');
    } else {
      // console.log(value);
      this.filteredValues['student_sign_status'] = value;
      this.getAllInternship('Student Filter');
    }
  }

  setManagerFilter(value) {
    if (!value) {
      this.filteredValues['company_manager_sign_status'] = '';
      this.getAllInternship('Manager Filter');
    } else {
      // console.log(value);
      this.filteredValues['company_manager_sign_status'] = value;
      this.getAllInternship('Manager Filter');
    }
  }

  setInternStatusFilter(value) {
    if (!value) {
      this.filteredValues['internship_status'] = '';
      this.getAllInternship('Internship status Filter');
    } else {
      // console.log(value);
      this.filteredValues['internship_status'] = value;
      this.getAllInternship('Internship status Filter');
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      this.getDataAllForCheckbox(0);
    }
  }

  showOptions(info, row) {
    if (row) {
      const dataFilter = this.dataSelected.filter((resp) => resp._id === row._id);
      if (dataFilter && dataFilter.length < 1) {
        this.dataSelected.push(row);
      } else {
        const indexFilter = this.dataSelected.findIndex((resp) => resp._id === row._id);
        this.dataSelected.splice(indexFilter, 1);
      }
    }
    const numSelected = this.dataSelected.length;
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
      limit: 300,
      page: pageNumber,
    };
    this.isLoading = true;
    let filter = this.cleanFilterData();
    filter +=
      this.filteredValues.scholars && this.filteredValues.scholars.length ? ` scholars : ` + JSON.stringify(this.scholarSelected) : '';
    filter +=
      this.filteredValues.school_names && this.filteredValues.school_names.length
        ? ` school_names: ` + JSON.stringify(this.schoolSelected)
        : '';
    filter += this.filteredValues.levels && this.filteredValues.levels.length ? ` levels: ` + JSON.stringify(this.levelSelected) : '';
    filter +=
      this.filteredValues.campus_names && this.filteredValues.campus_names.length
        ? ` campus_names: ` + JSON.stringify(this.campusSelected)
        : '';
    filter = 'filter: {' + filter + '}';
    const userTypeId = this.userTypeLoginId && this.userTypeLoginId.type ? this.userTypeLoginId.type._id : null;
    const search = this.cleanFilterDataSearch();
    this.subs.sink = this.candidatesService.getAllInternships(pagination, filter, this.sortValue, search, userTypeId).subscribe(
      (students) => {
        if (students && students.length) {
          this.allStudentForCheckbox.push(...students);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
          // console.log('getDataAllForCheckbox', this.selection, this.isCheckedAll);
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
      (err) => {
        this.isReset = false;
        this.isLoading = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  resetFilter() {
    this.isReset = true;
    this.disabledExport = true;
    this.selection.clear();
    this.dataSelected = [];
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.filteredValues = {
      school_id: null,
      periode: '',
      student_status: '',
      crm_is_published: null,
      is_student_already_sign: null,
      is_company_manager_already_sign: null,
      is_hr_mentor_already_sign: null,
      company_branch_id: null,
      agreement_status: null,
      internship_status: null,
      agreement_date_asked: null,
      internship_start_date: null,
      company_hr: '',
      student: '',
      company: '',
      season: null,
      levels: [],
      campus_names: [],
      school_names: [],
      scholars: [],
      student_sign_status: null,
      mentor_sign_status: null,
      company_manager_sign_status: null,
      company_relation_member_sign_status: null,
      internship_end_date: null,
    };
    this.searchValues = {
      family_name: '',
      first_name: '',
      school_name: '',
      campus_name: null,
      level: null,
      company_relation_member: '',
      internship_status: '',
      agreement_status: '',
      company_name: '',
      sector: '',
      speciality: '',
    };
    this.schoolFilter.setValue(null);
    this.familyNameFilter.setValue(null);
    this.nameFilter.setValue(null);
    this.companyRelationMemberFilter.setValue(null);
    this.studentStatusFilter.setValue('');
    this.internshipStatusFilter.setValue('');
    this.companyFilter.setValue(null);
    this.campusFilter.setValue(null);
    this.levelFilter.setValue(null);
    this.periodeFilter.setValue('');
    this.agreementFilter.setValue(null);
    this.crmFilter.setValue('');
    this.companyHrFilter.setValue('');
    this.studentFilter.setValue('');

    this.multipleCampusFilter.setValue(null);
    this.seasonFilter.setValue(null);
    this.schoolsFilter.setValue(null);
    this.levelsFilter.setValue(null);
    this.companyManagerFilter.setValue(null);
    this.startDateFilter.setValue(null);
    this.endDateFilter.setValue(null);
    this.scholarFilter.setValue(null);
    this.specialityFilter.setValue(null);
    this.sectorFilter.setValue(null);

    this.sort.direction = '';
    this.sort.active = '';

    this.getAllInternship('resetFilter');
  }

  selectedCRMSame() {
    let flag: boolean;
    if (this.userSelected && this.userSelected.length) {
      if (this.userSelected[0].company_relation_member_id && this.userSelected[0].company_relation_member_id._id) {
        const selectedCRM = this.userSelected[0]['company_relation_member_id']['_id'];
        for (const selected of this.userSelected) {
          if (selected && selected.company_relation_member_id && selected.company_relation_member_id._id) {
            const fullName = selected['company_relation_member_id']['_id'];
            if (fullName === selectedCRM) {
              flag = true;
            } else {
              flag = false;
            }
          } else {
            flag = false;
          }
        }
        return flag;
      }
    } else {
      flag = false;
      return flag;
    }
  }

  statusSelectedSigned() {
    let flag: boolean;
    if (this.userSelected && this.userSelected.length) {
      if (this.userSelected[0].company_relation_member_id && this.userSelected[0].company_relation_member_id._id) {
        for (const selected of this.userSelected) {
          if (selected && !selected.dcompany_relation_member_i) {
            flag = false;
            return;
          } else {
            flag = true;
          }
        }
        return flag;
      }
    } else {
      flag = false;
      return flag;
    }
  }

  sendAgreementS1() {
    // console.log('selecType', this.selectType);
    if (this.selectType === 'one') {
      Swal.fire({
        type: 'question',
        text: this.translate.instant('INTERNSHIP_S1.TEXT'),
        showCancelButton: true,
        confirmButtonText: this.translate.instant('INTERNSHIP_S1.BUTTON_1'),
        cancelButtonText: this.translate.instant('INTERNSHIP_S1.BUTTON_2'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((resp) => {
        if (resp.value) {
          if (this.internshipId && this.internshipId.length) {
            this.subs.sink = this.candidatesService.triggerNotificationInternship_N1(this.internshipId).subscribe(
              (response) => {
                if (response) {
                  // console.log('response trigger', response);
                  Swal.fire({
                    type: 'success',
                    title: 'Bravo!',
                    confirmButtonText: 'OK',
                    allowEnterKey: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                  }).then(() => {
                    this.getAllInternship('sendAgreement');
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
      });
    } else {
      this.getAllSendAgreementS1(0);
    }
  }

  getAllSendAgreementS1(pageNumber: number) {
    this.isLoading = true;
    const pagination = {
      limit: 500,
      page: pageNumber,
    };
    let filter = this.cleanFilterData();
    console.log(this.filteredValues);
    filter +=
      this.filteredValues.scholars && this.filteredValues.scholars.length ? ` scholars : ` + JSON.stringify(this.scholarSelected) : '';
    filter +=
      this.filteredValues.school_names && this.filteredValues.school_names.length
        ? ` school_names: ` + JSON.stringify(this.schoolSelected)
        : '';
    filter += this.filteredValues.levels && this.filteredValues.levels.length ? ` levels: ` + JSON.stringify(this.levelSelected) : '';
    filter +=
      this.filteredValues.campus_names && this.filteredValues.campus_names.length
        ? ` campus_names: ` + JSON.stringify(this.campusSelected)
        : '';
    filter = 'filter: {' + filter + '}';
    const userTypeId = this.userTypeLoginId.type._id;
    const search = this.cleanFilterDataSearch();
    this.subs.sink = this.candidatesService.getAllInternships(pagination, filter, this.sortValue, search, userTypeId).subscribe(
      (res) => {
        if (res && res.length) {
          this.allInternshipId.push(...res);
          const pages = pageNumber + 1;
          // console.log(this.allInternshipId);
          this.getAllSendAgreementS1(pages);
        } else {
          this.isLoading = false;
          this.sendAllAgreementS1(this.allInternshipId);
        }
      },
      (err) => {
        this.isLoading = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  sendAllAgreementS1(data) {
    const datas = _.uniqBy(data, '_id');
    const selectedIds = [];
    if (datas && datas.length) {
      datas.forEach((internship) => {
        selectedIds.push(internship._id);
      });
      // ************
      this.isLoading = false;
      console.log('selectedIds', selectedIds);
      Swal.fire({
        type: 'question',
        text: this.translate.instant('INTERNSHIP_S1.TEXT'),
        showCancelButton: true,
        confirmButtonText: this.translate.instant('INTERNSHIP_S1.BUTTON_1'),
        cancelButtonText: this.translate.instant('INTERNSHIP_S1.BUTTON_2'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((resp) => {
        if (resp.value) {
          if (selectedIds && selectedIds.length) {
            this.subs.sink = this.candidatesService.triggerNotificationInternship_N1(selectedIds).subscribe(
              (response) => {
                if (response) {
                  // console.log('response trigger', response);
                  Swal.fire({
                    type: 'success',
                    title: 'Bravo!',
                    confirmButtonText: 'OK',
                    allowEnterKey: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                  }).then(() => {
                    this.getAllInternship('sendAgreement');
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
      });
    }
  }

  sendAgreement() {
    if (this.selection.selected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Internship') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else if (!this.statusSelectedSigned()) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S12.Title'),
        html: this.translate.instant('Followup_S12.Text'),
        confirmButtonText: this.translate.instant('Followup_S12.Button'),
      });
    } else {
      const element = this.userSelected.find((resp) => resp.agreement_status && resp.agreement_status !== 'no_agreement');
      if (element && element.agreement_status) {
        this.sendAgreementS10();
      } else {
        this.sendAgreementS1();
      }
    }
  }

  sendAgreementS10() {
    // console.log('selecType', this.selectType);
    if (this.selectType === 'one') {
      Swal.fire({
        type: 'question',
        text: this.translate.instant('INTERNSHIP_S10.TEXT'),
        showCancelButton: true,
        confirmButtonText: this.translate.instant('INTERNSHIP_S10.BUTTON_1'),
        cancelButtonText: this.translate.instant('INTERNSHIP_S10.BUTTON_2'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((resp) => {
        if (resp.value) {
          if (this.internshipId && this.internshipId.length) {
            this.subs.sink = this.candidatesService.triggerNotificationInternship_N1(this.internshipId).subscribe(
              (response) => {
                if (response) {
                  // console.log('response trigger', response);
                  Swal.fire({
                    type: 'success',
                    title: 'Bravo!',
                    confirmButtonText: 'OK',
                    allowEnterKey: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                  }).then(() => {
                    this.getAllInternship('sendAgreement');
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
      });
    } else {
      this.getAllSendAgreementS10(0);
    }
  }

  getAllSendAgreementS10(pageNumber: number) {
    this.isLoading = true;
    const pagination = {
      limit: 500,
      page: pageNumber,
    };
    let filter = this.cleanFilterData();
    // console.log(this.filteredValues);
    filter +=
      this.filteredValues.scholars && this.filteredValues.scholars.length ? ` scholars : ` + JSON.stringify(this.scholarSelected) : '';
    filter +=
      this.filteredValues.school_names && this.filteredValues.school_names.length
        ? ` school_names: ` + JSON.stringify(this.schoolSelected)
        : '';
    filter += this.filteredValues.levels && this.filteredValues.levels.length ? ` levels: ` + JSON.stringify(this.levelSelected) : '';
    filter +=
      this.filteredValues.campus_names && this.filteredValues.campus_names.length
        ? ` campus_names: ` + JSON.stringify(this.campusSelected)
        : '';
    filter = 'filter: {' + filter + '}';
    const userTypeId = this.userTypeLoginId.type._id;
    const search = this.cleanFilterDataSearch();
    this.subs.sink = this.candidatesService.getAllInternships(pagination, filter, this.sortValue, search, userTypeId).subscribe(
      (res) => {
        if (res && res.length) {
          this.allInternshipId.push(...res);
          const pages = pageNumber + 1;
          // console.log(this.allInternshipId);

          this.getAllSendAgreementS10(pages);
        } else {
          this.isLoading = false;
          this.sendAllAgreementsS10(this.allInternshipId);
        }
      },
      (err) => {
        this.isLoading = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  sendAllAgreementsS10(data) {
    const datas = _.uniqBy(data, '_id');
    const selectedIds = [];
    if (datas && datas.length) {
      datas.forEach((internship) => {
        selectedIds.push(internship._id);
      });
      // ************
      this.isLoading = false;
      // console.log('selectedIds', selectedIds);
      Swal.fire({
        type: 'question',
        text: this.translate.instant('INTERNSHIP_S10.TEXT'),
        showCancelButton: true,
        confirmButtonText: this.translate.instant('INTERNSHIP_S10.BUTTON_1'),
        cancelButtonText: this.translate.instant('INTERNSHIP_S10.BUTTON_2'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((resp) => {
        if (resp.value) {
          if (selectedIds && selectedIds.length) {
            this.subs.sink = this.candidatesService.triggerNotificationInternship_N1(selectedIds).subscribe(
              (response) => {
                if (response) {
                  // console.log('response trigger', response);
                  Swal.fire({
                    type: 'success',
                    title: 'Bravo!',
                    confirmButtonText: 'OK',
                    allowEnterKey: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                  }).then(() => {
                    this.getAllInternship('sendAgreement');
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
      });
    }
  }

  addCrmDialog(data, types: string) {
    if (this.selection.selected.length < 1 && types === 'multiple') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Internship') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else if (!this.selectedCRMSame() && types === 'multiple') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S13.Title'),
        html: this.translate.instant('Followup_S13.Text'),
        confirmButtonText: this.translate.instant('Followup_S13.Button'),
      });
    } else {
      const dataDialog = [];
      if (types === 'multiple') {
        this.subs.sink = this.dialog
          .open(AddCrmDialogComponent, {
            width: '600px',
            minHeight: '100px',
            disableClose: true,
            data: this.userSelected,
          })
          .afterClosed()
          .subscribe((resp) => {
            if (resp) {
              this.selection.clear();
              this.dataSelected = [];
              this.userSelected = [];
              this.getAllInternship('addCrmDialog');
              this.disabledExport = true;
            }
            // console.log('success');
          });
      } else if (types === 'individual') {
        if (data) {
          dataDialog.push(data);
        }
        this.subs.sink = this.dialog
          .open(AddCrmDialogComponent, {
            width: '600px',
            minHeight: '100px',
            disableClose: true,
            data: dataDialog,
          })
          .afterClosed()
          .subscribe((resp) => {
            if (resp) {
              console.log(this.selection);
              this.selection.clear();
              this.dataSelected = [];
              this.userSelected = [];
              this.getAllInternship('addCrmDialog');
              this.disabledExport = true;
            }
            // console.log('success');
          });
      }
    }
  }

  changeDate(data) {
    this.subs.sink = this.dialog
      .open(DueDateDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {
        // console.log('success');
        this.getAllInternship('changeDate');
      });
  }

  viewPDF(pdf) {
    console.log(pdf);
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = `${this.serverimgPath + pdf}`.replace('/graphql', '');
    a.click();
    a.remove();
  }

  goToInternshipAgreement(id) {
    this.isLoading = true;
    const url = this.router.createUrlTree([`/internship-agreement/detail`], { queryParams: { internshipId: id } });
    this.isLoading = false;
    window.open(url.toString(), '_blank');
  }

  amendmentAggrement(id) {
    const url = this.router.createUrlTree([`/internship-agreement/detail`], { queryParams: { internshipId: id, open: 'amendment' } });
    window.open(url.toString(), '_blank');
  }

  getDataForList() {
    const name = '';
    this.subs.sink = this.candidatesService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp) {
          // console.log('Data Import => ', resp);
          this.listObjective = resp;
          this.school = this.listObjective;
          this.getDataCampus();
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
  getDataCampus() {
    this.setSchoolsFilter(this.schoolsFilter.value);
    this.levels = [];
    this.campusList = [];
    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.schoolsFilter.value && this.schoolsFilter.value.length) {
      const school = this.schoolsFilter.value;
      // const scampusList = this.listObjective.filter((list) => {
      //   return school.includes(list._id);
      // });
      // this.schoolName = scampusList && scampusList.length ? scampusList[0].short_name : '';
      // scampusList.filter((campus, n) => {
      //   campus.campuses.filter((campuses, nex) => {
      //     this.campusList.push(campuses);
      //   });
      // });

      const scampusList = [];
      school.forEach((list) => {
        const found = this.listObjective.find((element) => element && element.short_name === list);
        // console.log(found);
        if (found) {
          scampusList.push(found);
        }
      });
      // console.log(scampusList);
      if (scampusList) {
        console.log('masuk');
        scampusList.forEach((campus) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.filter((campuses, nex) => {
              this.campusList.push(campuses);
            });
          }
        });
      }
      // console.log('this.campusList', this.campusList);
      this.getDataLevel();
    } else {
      this.listObjective.filter((campus, n) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses, nex) => {
            this.campusList.push(campuses);
          });
        }
      });
      this.getDataLevel();
    }

    this.filteredSchool = this.schoolFilter.valueChanges.pipe(
      startWith(''),
      map((searchText) => {
        if (searchText && typeof searchText === 'string' && searchText !== '') {
          return this.school
            .filter((type) => type.short_name.toLowerCase().includes(searchText.toLowerCase()))
            .sort((a: any, b: any) => a.short_name.localeCompare(b.short_name));
        }
        return this.school;
      }),
    );

    this.campusList = _.uniqBy(this.campusList, 'name');
  }

  getDataLevel() {
    this.setCampusesFilter(this.campusFilter.value);
    this.levels = [];
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.campusFilter.value && this.campusFilter.value.length) {
      const sCampus = this.campusFilter.value;
      // const sLevelList = this.campusList.filter((list) => {
      //   return sCampus.includes(list.name);
      // });
      // sLevelList.forEach((element) => {
      //   element.levels.forEach((level) => {
      //     this.levels.push(level);
      //   });
      // });
      const sLevelList = [];
      sCampus.forEach((name) => {
        const found = this.campusList.find((element) => element && element.name === name);
        // console.log(found);
        if (found) {
          sLevelList.push(found);
        }
      });
      // console.log(sLevelList);
      if (sLevelList && sLevelList.length) {
        sLevelList.forEach((element) => {
          // console.log('masuk dia');
          if (!(element.levels && element.levels.length)) {
            // incase campus has no level
            // console.log('masuk sini dia kosong');
            this.listObjective.forEach((elements) => {
              if (elements.levels && element.levels.length) {
                elements.levels.forEach((level) => {
                  this.levels.push(level);
                });
              }
            });
          }
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
            });
          }
        });
      } else {
        this.levels = [
          {
            name: 'No item found',
            disabled: true,
          },
        ];
      }
      // console.log('this.levels', this.levels);
    } else {
      this.campusList.forEach((element) => {
        if (element && element.levels && element.levels.length) {
          element.levels.forEach((level) => {
            this.levels.push(level);
          });
        }
      });
    }
    this.levels = _.uniqBy(this.levels, 'name');
    if (this.levels && this.levels.length < 1) {
      this.levels = [
        {
          name: 'No item found',
          disabled: true,
        },
      ];
    }
    this.filteredCampus = this.campusFilter.valueChanges.pipe(
      startWith(''),
      map((searchText) => {
        if (searchText && typeof searchText === 'string' && searchText !== '') {
          return this.campusList
            .filter((type) => type.name.toLowerCase().includes(searchText.toLowerCase()))
            .sort((a: any, b: any) => a.name.localeCompare(b.name));
        }
        return this.campusList;
      }),
    );
  }

  getDataByLevel() {
    this.levels = _.uniqBy(this.levels, 'name');
    if (this.levels && this.levels.length < 1) {
      this.levels = [
        {
          name: 'No item found',
          disabled: true,
        },
      ];
    }
    if (!this.levelsFilter.value || this.levelsFilter.value.length === 0) {
      this.filteredValues['levels'] = [];
      this.levelSelected = [];
      this.getAllInternship('levels Filter');
    } else {
      this.filteredValues['levels'] = this.levelsFilter.value;
      this.levelSelected = this.levelsFilter.value;
      this.getAllInternship('levels Filter');
    }
  }

  selectScholar() {
    if (!this.scholarFilter.value || this.scholarFilter.value.length === 0) {
      this.filteredValues['scholars'] = [];
      this.scholarSelected = [];
      this.getAllInternship('scholars Filter');
    } else {
      this.filteredValues['scholars'] = this.scholarFilter.value;
      this.scholarSelected = this.scholarFilter.value;
      this.getAllInternship('scholars Filter');
    }
  }

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasons().subscribe(
      (resp) => {
        // console.log(resp);
        if (resp && resp.length) {
          this.scholars = resp;
          // this.scholarFilter.setValue(this.scholars[0]._id);
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

  sendMail(element) {
    const dialog = this.dialog.open(SendMailDialogComponent, {
      disableClose: true,
      width: '750px',
      data: element,
    });
  }

  openWhatsapp(element) {
    const whatsAppUrl = 'https://api.whatsapp.com/send?phone=' + element.student_id.tele_phone + '&text=';
    const whatsAppText = this.translate.instant('whatsapp message', {
      name: element.student_id.first_name,
      dev:
        (this.currentUser && this.currentUser.civility && this.currentUser.civility !== 'neutral'
          ? `${this.translate.instant(this.currentUser.civility)} `
          : '') + `${this.currentUser.first_name} ${this.currentUser.last_name}`,
      school: element.student_id.candidate_school,
      campus: element.student_id.candidate_campus,
      position: this.currentUser.position,
    });
    // console.log('curernt ', this.currentUser);
    // console.log('whatsAppText ', whatsAppText);
    window.open(whatsAppUrl + whatsAppText, '_blank');
  }

  displaySchool(school) {
    if (school) {
      const found = this.listObjective.filter((res) => res._id === school);
      if (found.length) {
        return found[0].short_name;
      }
    }
  }

  viewProfileInfo(element, tab?) {
    const payload = {
      school: element.candidate_school,
      campus: element.candidate_campus,
      level: element.candidate_level,
    };
    const query = {
      selectedProfile: element.student_id._id,
      sortValue: this.sortValue || '',
      tab: tab || '',
      // paginator: JSON.stringify({
      //   pageIndex: this.paginator.pageIndex,
      //   pageSize: this.paginator.pageSize,
      // }),
      last_name: element.student_id.last_name,
      filteredValues: JSON.stringify(payload),
    };
    // console.log(element, query);

    const url = this.router.createUrlTree(['student-cards'], { queryParams: query });
    window.open(url.toString(), '_blank');
  }

  onDataExport() {
    if (this.selectType === 'one') {
      const data = [];
      if (this.dataSelected.length) {
        // console.log('selection', this.dataSelected);
        for (const intern of this.dataSelected) {
          const obj = [];
          const crm = intern.company_relation_member_id
            ? (intern.company_relation_member_id.civility ? intern.company_relation_member_id.civility : '') +
              ' ' +
              (intern.company_relation_member_id.last_name ? intern.company_relation_member_id.last_name : '') +
              ' ' +
              (intern.company_relation_member_id.first_name ? intern.company_relation_member_id.first_name : '')
            : '-';

          obj[0] = intern.student_id.last_name;
          obj[1] = intern.student_id.first_name;
          obj[2] = intern.student_id.candidate_school;
          obj[3] = intern.student_id.candidate_campus;
          obj[4] = intern.student_id.candidate_level;
          obj[5] = crm ? crm : '-';
          obj[6] = intern.agreement_status ? this.translate.instant(intern.agreement_status) : '-';
          obj[7] = intern.student_sign_status
            ? this.translate.instant('student_sign_status.' + intern.student_sign_status)
            : this.translate.instant('student_sign_status.not_validate_information');
          obj[8] = intern.mentor_sign_status
            ? this.translate.instant('mentor_sign_status.' + intern.mentor_sign_status)
            : this.translate.instant('mentor_sign_status.not_validate_information');
          obj[9] = intern.company_manager_sign_status
            ? this.translate.instant('company_manager_sign_status.' + intern.company_manager_sign_status)
            : this.translate.instant('company_manager_sign_status.not_validate_information');
          obj[10] = intern.company_relation_member_sign_status
            ? this.translate.instant('company_relation_member_sign_status.' + intern.company_relation_member_sign_status)
            : this.translate.instant('company_relation_member_sign_status.not_validate_information');
          obj[11] = intern.company_branch_id && intern.company_branch_id.company_name ? intern.company_branch_id.company_name : '-';
          obj[12] =
            intern.internship_date.date_from && intern.internship_date.date_to && intern.internship_status
              ? this.translate.instant('internship_status.' + intern.internship_status)
              : '-';
          obj[13] = intern.internship_date && intern.internship_date.date_from ? intern.internship_date.date_from : '-';
          obj[14] = intern.internship_date && intern.internship_date.date_to ? intern.internship_date.date_to : '-';
          obj[15] = intern.internship_date && intern.internship_date.duration_in_months ? intern.internship_date.duration_in_months : '0';

          data.push(obj);
        }
        // console.log('data', data);
        const valueRange = { values: data };
        const today = moment().format('DD-MM-YYYY');
        const sheetID = this.translate.currentLang === 'en' ? 0 : 1409909008;
        const title = this.exportName + '_' + today;
        const sheetData = {
          spreadsheetId: '1XCGGpLCtAc5AgnfyamrsPtOuHqdJpEadYjXLXXqU1cQ',
          sheetId: sheetID,
          range: 'A7',
        };
        this.exportCsvService.createAndUpdateSpreadsheet(valueRange, title, sheetData);
      }
      Swal.close();
    } else {
      this.getAllExportData(0);
    }
  }

  getAllExportData(pageNumber: number) {
    this.isLoading = true;
    const pagination = {
      limit: 500,
      page: pageNumber,
    };
    let filter = this.cleanFilterData();
    // console.log(this.filteredValues);
    filter +=
      this.filteredValues.scholars && this.filteredValues.scholars.length ? ` scholars : ` + JSON.stringify(this.scholarSelected) : '';
    filter +=
      this.filteredValues.school_names && this.filteredValues.school_names.length
        ? ` school_names: ` + JSON.stringify(this.schoolSelected)
        : '';
    filter += this.filteredValues.levels && this.filteredValues.levels.length ? ` levels: ` + JSON.stringify(this.levelSelected) : '';
    filter +=
      this.filteredValues.campus_names && this.filteredValues.campus_names.length
        ? ` campus_names: ` + JSON.stringify(this.campusSelected)
        : '';
    filter = 'filter: {' + filter + '}';
    const userTypeId = this.userTypeLoginId.type._id;
    const search = this.cleanFilterDataSearch();
    this.subs.sink = this.candidatesService.getAllInternships(pagination, filter, this.sortValue, search, userTypeId).subscribe(
      (res) => {
        if (res && res.length) {
          this.allInternshipId.push(...res);
          const pages = pageNumber + 1;
          // console.log(this.allInternshipId);

          this.getAllExportData(pages);
        } else {
          this.isLoading = false;
          this.exportAllData(this.allInternshipId);
        }
      },
      (err) => {
        this.isLoading = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  exportAllData(exportData) {
    const datasForExport = _.uniqBy(exportData, '_id');
    const data = [];
    if (datasForExport && datasForExport.length) {
      // console.log('selection', datasForExport);
      for (const intern of datasForExport) {
        const obj = [];
        const crm = intern.company_relation_member_id
          ? (intern.company_relation_member_id.civility ? intern.company_relation_member_id.civility : '') +
            ' ' +
            (intern.company_relation_member_id.last_name ? intern.company_relation_member_id.last_name : '') +
            ' ' +
            (intern.company_relation_member_id.first_name ? intern.company_relation_member_id.first_name : '')
          : '-';

        obj[0] = intern.student_id.last_name;
        obj[1] = intern.student_id.first_name;
        obj[2] = intern.student_id.candidate_school;
        obj[3] = intern.student_id.candidate_campus;
        obj[4] = intern.student_id.candidate_level;
        obj[5] = crm ? crm : '-';
        obj[6] = intern.agreement_status ? this.translate.instant(intern.agreement_status) : '-';
        obj[7] = intern.student_sign_status
          ? this.translate.instant('student_sign_status.' + intern.student_sign_status)
          : this.translate.instant('student_sign_status.not_validate_information');
        obj[8] = intern.mentor_sign_status
          ? this.translate.instant('mentor_sign_status.' + intern.mentor_sign_status)
          : this.translate.instant('mentor_sign_status.not_validate_information');
        obj[9] = intern.company_manager_sign_status
          ? this.translate.instant('company_manager_sign_status.' + intern.company_manager_sign_status)
          : this.translate.instant('company_manager_sign_status.not_validate_information');
        obj[10] = intern.company_relation_member_sign_status
          ? this.translate.instant('company_relation_member_sign_status.' + intern.company_relation_member_sign_status)
          : this.translate.instant('company_relation_member_sign_status.not_validate_information');
        obj[11] = intern.company_branch_id && intern.company_branch_id.company_name ? intern.company_branch_id.company_name : '-';
        obj[12] =
          intern.internship_date.date_from && intern.internship_date.date_to && intern.internship_status
            ? this.translate.instant('internship_status.' + intern.internship_status)
            : '-';
        obj[13] = intern.internship_date && intern.internship_date.date_from ? intern.internship_date.date_from : '-';
        obj[14] = intern.internship_date && intern.internship_date.date_to ? intern.internship_date.date_to : '-';
        obj[15] = intern.internship_date && intern.internship_date.duration_in_months ? intern.internship_date.duration_in_months : '0';

        data.push(obj);
      }
      // console.log('data', data);
      const valueRange = { values: data };
      const today = moment().format('DD-MM-YYYY');
      const sheetID = this.translate.currentLang === 'en' ? 0 : 1409909008;
      const title = this.exportName + '_' + today;
      const sheetData = {
        spreadsheetId: '1XCGGpLCtAc5AgnfyamrsPtOuHqdJpEadYjXLXXqU1cQ',
        sheetId: sheetID,
        range: 'A7',
      };
      this.exportCsvService.createAndUpdateSpreadsheet(valueRange, title, sheetData);
    }
    Swal.close();
  }

  translateDropdownFirstTime() {
    const studentList = [];
    this.studentFilterList.forEach((item) => {
      const list = this.getTranslateType(item.value, 'student');
      studentList.push({ key: list, value: item.value });
    });
    this.studentFilterList = studentList.sort(this.keysrt('text')); // Re-sort the array
    this.filteredStudent = of(this.studentFilterList);

    const mentorList = [];
    this.companyHrFilterList.forEach((item) => {
      const list = this.getTranslateType(item.value, 'mentor');
      mentorList.push({ key: list, value: item.value });
    });
    this.companyHrFilterList = mentorList.sort(this.keysrt('text')); // Re-sort the array
    this.filteredMentor = of(this.companyHrFilterList);

    const companyManagerList = [];
    this.companyManagerFilterList.forEach((item) => {
      const list = this.getTranslateType(item.value, 'manager');
      companyManagerList.push({ key: list, value: item.value });
    });
    this.companyManagerFilterList = companyManagerList.sort(this.keysrt('text')); // Re-sort the array
    this.filteredManager = of(this.companyManagerFilterList);

    const agreementList = [];
    this.agreementFilterList.forEach((item) => {
      const list = this.getTranslateType(item.value, 'agreement');
      agreementList.push({ key: list, value: item.value });
    });
    this.agreementFilterList = agreementList.sort(this.keysrt('text')); // Re-sort the array
    this.filteredAgreement = of(this.agreementFilterList);

    const crmList = [];
    this.crmFilterList.forEach((item) => {
      const list = this.getTranslateType(item.value, 'crm');
      crmList.push({ key: list, value: item.value });
    });
    this.crmFilterList = crmList.sort(this.keysrt('text')); // Re-sort the array
    this.filteredCrm = of(this.crmFilterList);

    const internshipList = [];
    this.internshipFilterList.forEach((item) => {
      const list = this.getTranslateType(item.value, 'internship');
      internshipList.push({ key: list, value: item.value });
    });
    this.internshipFilterList = internshipList.sort(this.keysrt('text')); // Re-sort the array
    this.filteredInternStatus = of(this.internshipFilterList);
  }

  // To translate dropdown
  onLanguageChange() {
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      const studentList = [];
      this.studentFilterList.forEach((item) => {
        const list = this.getTranslateType(item.value, 'student');
        studentList.push({ key: list, value: item.value });
      });
      this.studentFilterList = studentList.sort(this.keysrt('text')); // Re-sort the array
      this.filteredStudent = of(this.studentFilterList);

      const mentorList = [];
      this.companyHrFilterList.forEach((item) => {
        const list = this.getTranslateType(item.value, 'mentor');
        mentorList.push({ key: list, value: item.value });
      });
      this.companyHrFilterList = mentorList.sort(this.keysrt('text')); // Re-sort the array
      this.filteredMentor = of(this.companyHrFilterList);

      const companyManagerList = [];
      this.companyManagerFilterList.forEach((item) => {
        const list = this.getTranslateType(item.value, 'manager');
        companyManagerList.push({ key: list, value: item.value });
      });
      this.companyManagerFilterList = companyManagerList.sort(this.keysrt('text')); // Re-sort the array
      this.filteredManager = of(this.companyManagerFilterList);

      const agreementList = [];
      this.agreementFilterList.forEach((item) => {
        const list = this.getTranslateType(item.value, 'agreement');
        agreementList.push({ key: list, value: item.value });
      });
      this.agreementFilterList = agreementList.sort(this.keysrt('text')); // Re-sort the array
      this.filteredAgreement = of(this.agreementFilterList);

      const crmList = [];
      this.crmFilterList.forEach((item) => {
        const list = this.getTranslateType(item.value, 'crm');
        crmList.push({ key: list, value: item.value });
      });
      this.crmFilterList = crmList.sort(this.keysrt('text')); // Re-sort the array
      this.filteredCrm = of(this.crmFilterList);

      const internshipList = [];
      this.internshipFilterList.forEach((item) => {
        const list = this.getTranslateType(item.value, 'internship');
        internshipList.push({ key: list, value: item.value });
      });
      this.internshipFilterList = internshipList.sort(this.keysrt('text')); // Re-sort the array
      this.filteredInternStatus = of(this.internshipFilterList);
    });
  }

  getTranslateType(name, type?) {
    if (type === 'student') {
      if (name) {
        const value = this.translate.instant('student_sign_status.' + name);
        return value;
      }
    }
    if (type === 'mentor') {
      if (name) {
        const value = this.translate.instant('mentor_sign_status.' + name);
        return value;
      }
    }
    if (type === 'manager') {
      if (name) {
        const value = this.translate.instant('company_manager_sign_status.' + name);
        return value;
      }
    }
    if (type === 'crm') {
      if (name) {
        const value = this.translate.instant('company_relation_member_sign_status.' + name);
        return value;
      }
    }
    if (type === 'agreement') {
      if (name) {
        const value = this.translate.instant(name);
        return value;
      }
    }
    if (type === 'internship') {
      if (name) {
        const value = this.translate.instant('internship_status.' + name);
        return value;
      }
    }
  }

  keysrt(key) {
    return function (a, b) {
      if (a[key] > b[key]) {
        return 1;
      } else if (a[key] < b[key]) {
        return -1;
      }
      return 0;
    };
  }
  connectAsUser(student) {
    // console.log(student);
    const currentUser = this.utilService.getCurrentUser();
    const studentUserId = student && student.user_id && student.user_id._id ? student.user_id._id : null;
    const unixUserType = _.uniqBy(student.entities, 'type.name');
    // console.log('Make Unix Entity', unixUserType);
    if (currentUser && studentUserId) {
      this.subs.sink = this.authService.loginAsUser(currentUser._id, studentUserId).subscribe(
        (resp) => {
          // console.log(resp);
          if (resp && resp.user) {
            // console.log(resp.user);
            const tempUser = resp.user;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('SUCCESS'),
              html: this.translate.instant('USER_S7_SUPERUSER.TEXT', {
                UserCivility: student.civility !== 'neutral' ? this.translate.instant(student.civility) : '',
                UserFirstName: student.first_name,
                UserLastName: student.last_name,
              }),
              allowEscapeKey: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('UNDERSTOOD'),
            }).then((result) => {
              this.authService.backupLocalUserProfileAndToken();
              this.authService.setLocalUserProfileAndToken(resp);
              this.authService.setPermission([tempUser.entities[0].type.name]);
              this.ngxPermissionService.flushPermissions();
              this.ngxPermissionService.loadPermissions([tempUser.entities[0].type.name]);
              this.userService.reloadCurrentUser(true);
              this.router.navigate(['/my-internships']);
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

  cancelExportSwal() {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('Followup_S8.Title'),
      html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Internship') }),
      confirmButtonText: this.translate.instant('Followup_S8.Button'),
    });
  }
}
