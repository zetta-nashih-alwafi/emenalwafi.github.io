import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
import { FinancesService } from 'app/service/finance/finance.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { environment } from 'environments/environment';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AddInterventionDialogComponent } from './add-intervention-dialog/add-intervention-dialog.component';

@Component({
  selector: 'ms-teacher-management-follow-up',
  templateUrl: './teacher-management-follow-up.component.html',
  styleUrls: ['./teacher-management-follow-up.component.scss'],
})
export class TeacherManagementFollowUpComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();
  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = [
    'checkbox',
    'source',
    'teacher',
    'program',
    'legal_entity',
    'sequence',
    'subject',
    'volume_of_hours',
    'type_of_contract',
    'hourly_rate',
    'type_of_intervention',
    'status',
    'action',
  ];
  filterColumns: string[] = [
    'checkboxFilter',
    'sourceFilter',
    'teacherFilter',
    'programFilter',
    'legal_entityFilter',
    'sequenceFilter',
    'subjectFilter',
    'volume_of_hoursFilter',
    'type_of_contractFilter',
    'hourly_rateFilter',
    'type_of_interventionFilter',
    'statusFilter',
    'actionFilter',
  ];
  isWaitingForResponse = false;
  noData: any;
  dataCount = 0;
  sortValue = null;

  // =================== Filter Above Table Forms and Value ============================
  levels = [];
  school = [];
  scholars = [];
  originalScholar = [];
  campusList = [];
  scholarSelected = [];
  listObjective = [];
  campusListBackup = [];
  levelListBackup = [];
  schoolName = '';
  campusName = '';
  levelName = '';
  scholarFilter = new UntypedFormControl('All');
  schoolsFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  levelFilter = new UntypedFormControl(null);
  filterBreadcrumbData: any[] = [];

  // =================== Filter Table Forms and Value ============================

  filteredValue = {
    sequence_id: null,
    module_id: null,
    subject_id: null,
    type_of_group: null,
    teacher_name: null,
    type_of_intervention: null,
    type_of_contract: null,
    program_id: null,
    legal_entity_id: null,
    subject: null,
    status: null,
    isForFollowUpTable: true,
    generation_source: null,
  };

  filteredValuesAll = {
    scholar_season_id: 'All',
    schools_id: 'All',
    campuses_id: 'All',
    levels_id: 'All',
    program_id: 'All',
    legal_entity_id: 'All',
    sequence_id: 'All',
    subject_id: 'All',
    type_of_contract: 'All',
    type_of_intervention: 'All',
    status: 'All',
    generation_source: 'All',
  };

  filteredValueSuperFilter = {
    scholar_season_id: null,
    schools_id: null,
    campuses_id: null,
    levels_id: null,
  };
  programList = [];
  legalEntitiyList = [];
  sequenceList = [];
  subjectList = [];
  type_of_contract_list = [];
  statusList = [];
  type_of_intervention_list = [];
  teacherFilter = new UntypedFormControl('', []);
  programFilter = new UntypedFormControl(null);
  legal_entity_filter = new UntypedFormControl(null);
  type_of_contract_filter = new UntypedFormControl(null, []);
  subjectFilter = new UntypedFormControl(null, []);
  type_of_intervention_filter = new UntypedFormControl(null, []);
  statusFilter = new UntypedFormControl(null);
  sequence_filter = new UntypedFormControl(null, []);
  sourceFilter = new UntypedFormControl(null);
  sourceList = [];
  // =================== CheckBox Selection ============================

  selection = new SelectionModel<any>(true, []);
  pageSelected = [];
  isCheckedAll = false;
  dataSelected = [];
  allTeachersForCheckbox = [];
  selectType: any;
  teacherSelected: any[];
  teacherSelectedId: any[];
  disabledActions = false;
  currentUser: any;
  isPermission: any;
  userTypeLoginId: any;

  superFilterVal: any;
  isSuperFilterApplied = false;
  isDisabled = true;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  allContractForCheckbox = [];
  allExportForCheckbox = [];
  dataUnselectUser = [];
  buttonClicked = '';

  tempDataFilter = {
    program: null,
    legalEntity: null,
    sequence: null,
    subject: null,
    typeOfContract: null,
    typeOfIntervention: null,
    status: null,
    source: null,
  };
  isReset: boolean = false;
  intVal: any;
  timeOutVal: any;

  constructor(
    private teacherManagementService: TeacherManagementService,
    private translate: TranslateService,
    private router: Router,
    public dialog: MatDialog,
    private financeService: FinancesService,
    private authService: AuthService,
    private candidatesService: CandidatesService,
    public permission: PermissionService,
    private httpClient: HttpClient,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    if (this.isPermission && this.isPermission.length) {
      if (this.currentUser && this.currentUser.entities && this.currentUser.entities.length) {
        this.userTypeLoginId = this.currentUser.entities.find((resp) => resp.type && resp.type.name === this.isPermission[0]);
      }
    }
    this.getAllTeacherSubjects();
    this.initializeUserFilter();
    this.getDataScholarSeasons();
    this.getAllTypeOfInterventionDropdown();
    this.getAllProgramSubjectDropdown();
    this.getAllProgramSequenceDropdown();
    this.getAllTeacherSubjectLegalEntityDropdown();
    this.getAllTeacherSequenceDropdown();
    this.getDropdownStatic();

    if (this.scholarFilter.value) {
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.scholars = [];
      this.scholars = this.originalScholar.sort((a, b) =>
        a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
      );
      this.scholars.unshift({ _id: 'All', scholar_season: this.translate.instant('All') });
      this.scholars = _.uniqBy(this.scholars, '_id');
      this.getDropdownStatic();
    });
    this.pageTitleService.setTitle('NAV.Follow up Teacher Management');
  }

  getDropdownStatic() {
    this.type_of_contract_list = [
      {
        value: 'cddu',
        label: this.translate.instant('cddu'),
      },
      {
        value: 'convention',
        label: this.translate.instant('convention'),
      },
    ];

    this.statusList = [
      {
        value: 'not_created',
        label: this.translate.instant('CONTRACT_STATUS.not_created'),
      },
      {
        value: 'created_not_sent',
        label: this.translate.instant('CONTRACT_STATUS.created_not_sent'),
      },
      {
        value: 'sent',
        label: this.translate.instant('CONTRACT_STATUS.sent'),
      },
    ];
    this.sourceList = [
      {
        value: 'manual',
        label: this.translate.instant('manual'),
      },
      {
        value: 'automatic',
        label: this.translate.instant('automatic'),
      },
    ];
  }

  getAllTeacherSubjects(type?) {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    if (type === 'superFilter') {
      this.superFilterVal = _.cloneDeep(this.filteredValueSuperFilter);
    }
    const filter = { ...this.filteredValue, ...this.superFilterVal };

    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.teacherManagementService.getAllTeacherSubjects(pagination, filter, this.sortValue, userTypesList).subscribe({
      next: (resp: any) => {
        this.dataSource.data = _.cloneDeep(resp);
        // this.getDropDownData(resp);
        this.dataCount = resp && resp.length ? resp[0].count_document : 0;
        this.isWaitingForResponse = false;
        this.noData = this.dataSource.connect().pipe(map((data) => data.length === 0));
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      error: (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    });
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : null } : null;
    this.paginator.pageIndex = 0;
    this.getAllTeacherSubjects();
  }

  getDropDownData(resp) {
    if (resp) {
      resp.forEach((element) => {
        if (element && element.program_id) {
          this.programList.push(element.program_id);
        }
        if (element && element.type_of_intervention_id && element.type_of_intervention_id.legal_entity_id) {
          this.legalEntitiyList.push(element.type_of_intervention_id.legal_entity_id);
        }
        if (element && element.program_subject_id) {
          this.subjectList.push(element.program_subject_id);
        }
        if (element && element.type_of_intervention_id) {
          this.type_of_intervention_list.push(element.type_of_intervention_id);
        }
      });
      this.programList = _.uniqBy(this.programList, '_id');
      this.legalEntitiyList = _.uniqBy(this.legalEntitiyList, '_id');
      this.type_of_intervention_list = _.uniqBy(this.type_of_intervention_list, '_id');
      this.subjectList = _.uniqBy(this.subjectList, '_id');
      console.log(this.type_of_intervention_list);
    } else {
      this.programList = [];
      this.legalEntitiyList = [];
      this.type_of_intervention_list = [];
      this.subjectList = [];
    }
  }

  getAllTypeOfInterventionDropdown() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherManagementService.getAllTypeOfInterventionDropdown().subscribe(
      (resp) => {
        if (resp && resp.length) {
          resp.forEach((element) => {
            if (element && element.type_of_intervention) {
              this.type_of_intervention_list.push(element.type_of_intervention);
            }
          });
          this.type_of_intervention_list = this.type_of_intervention_list.filter((val, ind, arr) => arr.indexOf(val) === ind);
          this.type_of_intervention_list = _.sortBy(this.type_of_intervention_list);
          this.type_of_intervention_list = this.type_of_intervention_list.map((resp) => {
            return {
              value: resp,
              label: this.translate.instant(resp),
            };
          });
        } else {
          this.type_of_intervention_list = [];
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.authService.postErrorLog(err);
      },
    );
  }

  getAllProgramSubjectDropdown() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherManagementService.getAllProgramSubjectDropdown().subscribe(
      (resp) => {
        if (resp && resp.length) {
          resp.forEach((element) => {
            if (element && element._id) {
              this.subjectList.push(element);
            }
          });
          this.subjectList = _.uniqBy(this.subjectList, 'name');
          this.subjectList = _.sortBy(this.subjectList, 'name');
        } else {
          this.subjectList = [];
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.authService.postErrorLog(err);
      },
    );
  }

  getAllProgramSequenceDropdown() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherManagementService.getAllProgramSequenceDropdown().subscribe(
      (resp) => {
        if (resp && resp.length) {
          const response = _.cloneDeep(resp);
          const programs = response?.map((data) => {
            return {
              _id: data?._id,
              program:
                data?.scholar_season_id && data?.scholar_season_id?.scholar_season
                  ? data?.scholar_season_id?.scholar_season + ' ' + data?.program
                  : data?.program,
            };
          });
          this.programList = _.uniqBy(programs, '_id');
          this.programList = _.sortBy(programs, 'program');
        } else {
          this.programList = [];
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.authService.postErrorLog(err);
      },
    );
  }

  getAllTeacherSubjectLegalEntityDropdown() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherManagementService.getAllTeacherSubjectLegalEntityDropdown().subscribe(
      (resp) => {
        if (resp && resp.length) {
          resp.forEach((element) => {
            if (element && element._id) {
              this.legalEntitiyList.push(element);
            }
          });
          this.legalEntitiyList = _.uniqBy(this.legalEntitiyList, '_id');
          this.legalEntitiyList = _.sortBy(this.legalEntitiyList, 'legal_entity_name');
        } else {
          this.legalEntitiyList = [];
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.authService.postErrorLog(err);
      },
    );
  }

  getAllTeacherSequenceDropdown() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherManagementService.getAllTeacherSequenceDropdown().subscribe(
      (resp) => {
        if (resp && resp.length) {
          resp.forEach((element) => {
            if (element && element._id) {
              this.sequenceList.push(element);
            }
          });
          this.sequenceList = _.uniqBy(this.sequenceList, 'name');
          this.sequenceList = _.sortBy(this.sequenceList, 'name');
        } else {
          this.sequenceList = [];
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.authService.postErrorLog(err);
      },
    );
  }

  generateContract() {
    if (!this.dataSelected || this.dataSelected.length === 0) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Teacher') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      const statusData = this.dataSelected.map((data) => data.contract_status);
      const teachersData = this.dataSelected.filter(
        (data) => data.contract_status === 'created_not_sent' || data.contract_status === 'sent',
      );
      const teacherHasContract = _.uniqBy(teachersData, 'teacher_id._id');
      console.log(teacherHasContract);
      if (statusData.includes('sent') || statusData.includes('created_not_sent')) {
        const teacherList = teacherHasContract.map((data) => {
          return `<li>${data?.teacher_id?.civility ? this.translate.instant(data?.teacher_id?.civility) : ''} ${
            data?.teacher_id?.first_name
          } ${data?.teacher_id?.last_name}</li>`;
        });
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('GenerateContract_S1.TITLE'),
          html: this.translate.instant('GenerateContract_S1.TEXT', { teacherList: teacherList.join(' ') }),
          confirmButtonText: this.translate.instant('OK'),
        });
      } else {
        const comparedArray = [];
        const comparedData = this.dataSelected[0];
        this.dataSelected.forEach((record) => {
          const seasonCompare = _.isEqual(comparedData.program_id.scholar_season_id._id, record.program_id.scholar_season_id._id);
          const teacherCompare = _.isEqual(comparedData.teacher_id, record.teacher_id);
          const legal_entityCompare = _.isEqual(
            comparedData.type_of_intervention_id.legal_entity_id._id,
            record.type_of_intervention_id.legal_entity_id._id,
          );
          const contactCompare = _.isEqual(
            comparedData.type_of_intervention_id.type_of_contract,
            record.type_of_intervention_id.type_of_contract,
          );

          if (seasonCompare && teacherCompare && legal_entityCompare && contactCompare) {
            comparedArray.push(true);
          } else {
            comparedArray.push(false);
          }
        });

        if (comparedArray.includes(false)) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('GenerateContract_S2.TITLE'),
            html: this.translate.instant('GenerateContract_S2.TEXT'),
            confirmButtonText: this.translate.instant('OK'),
          });
        } else {
          const teacherSubjectIds = this.dataSelected.map((element) => element._id);
          localStorage.setItem('teacherSubjectIds', JSON.stringify(teacherSubjectIds));
          // this.router.navigate(['teacher-contract/contract-process'], {queryParams: {'fromFollowup': 'true'}});
          const url = this.router.createUrlTree(['teacher-contract/contract-process'], { queryParams: { fromFollowup: 'true' } });
          window.open(url.toString(), '_blank');
        }
      }
    }
  }

  generateContractOne(data) {
    const teacherSubjectIds = [];
    teacherSubjectIds.push(data._id);
    console.log('teacherSubjectIds', teacherSubjectIds);
    localStorage.setItem('teacherSubjectIds', JSON.stringify(teacherSubjectIds));
    // this.router.navigate(['teacher-contract/contract-process'], {queryParams: {'fromFollowup': 'true'}});
    const url = this.router.createUrlTree(['teacher-contract/contract-process'], { queryParams: { fromFollowup: 'true' } });
    window.open(url.toString(), '_blank');
  }

  viewContract(element) {
    const name = element.teacher_id.last_name + ' ' + element.teacher_id.first_name;
    this.router.navigate(['teacher-contract/contract-management'], { queryParams: { teacher: name } });
  }

  // ============== Initialization Filter =================================

  initializeUserFilter() {
    this.subs.sink = this.scholarFilter.valueChanges.subscribe((value) => {
      this.filteredValueSuperFilter.schools_id = null;
      this.filteredValueSuperFilter.campuses_id = null;
      this.filteredValueSuperFilter.levels_id = null;
      this.isDisabled = false;
    });
    this.subs.sink = this.schoolsFilter.valueChanges.subscribe((value) => {
      this.filteredValueSuperFilter.campuses_id = null;
      this.filteredValueSuperFilter.levels_id = null;
      this.isDisabled = false;
    });
    this.subs.sink = this.campusFilter.valueChanges.subscribe((value) => {
      this.filteredValueSuperFilter.levels_id = null;
      this.isDisabled = false;
    });
    this.subs.sink = this.levelFilter.valueChanges.subscribe((value) => {
      this.isDisabled = false;
    });
    this.subs.sink = this.teacherFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      this.teacherSelected = [];
      this.teacherSelectedId = [];
      this.disabledActions = false;
      if (!name.match(symbol) && !name.match(symbol1)) {
        this.filteredValue.teacher_name = name;
        this.paginator.pageIndex = 0;
        this.getAllTeacherSubjects();
      } else {
        this.teacherFilter.setValue('');
        this.filteredValue.teacher_name = '';
        this.paginator.pageIndex = 0;
        this.getAllTeacherSubjects();
      }
    });

    // this.subs.sink = this.programFilter.valueChanges.subscribe({
    //   next: (program) => {
    //     console.log('PROGRAM FILTER', program);
    //     if (program && program.length === 0) {
    //       this.filteredValue.program_id = null;
    //       this.programFilter.setValue(['All']);
    //       this.getAllTeacherSubjects();
    //     } else {
    //       this.filteredValue.program_id = program[0] === 'All' ? null : program;
    //       this.paginator.pageIndex = 0;
    //       this.selection.clear();
    //       this.isCheckedAll = false;
    //       this.teacherSelected = [];
    //       this.teacherSelectedId = [];
    //       const selectedStatus = [];
    //       if (program !== 'All') {
    //         selectedStatus.push(program);
    //       }
    //       this.programFilter.setValue(selectedStatus);
    //       this.getAllTeacherSubjects();
    //     }
    //   },
    // });

    // this.subs.sink = this.legal_entity_filter.valueChanges.subscribe({
    //   next: (entity) => {
    //     if (entity && entity.length === 0) {
    //       this.filteredValue.legal_entity_id = null;
    //       this.getAllTeacherSubjects();
    //     } else {
    //       this.filteredValue.legal_entity_id = entity[0] === 'All' ? null : entity;
    //       this.paginator.pageIndex = 0;
    //       this.selection.clear();
    //       this.isCheckedAll = false;
    //       this.teacherSelected = [];
    //       this.teacherSelectedId = [];
    //       this.getAllTeacherSubjects();
    //     }
    //   },
    // });

    // this.subs.sink = this.subjectFilter.valueChanges.subscribe({
    //   next: (subject) => {
    //     if (subject && subject.length === 0) {
    //       this.filteredValue.subject_id = null;
    //       this.getAllTeacherSubjects();
    //     } else {
    //       this.filteredValue.subject_id = subject[0] === 'All' ? null : subject;
    //       this.paginator.pageIndex = 0;
    //       this.selection.clear();
    //       this.isCheckedAll = false;
    //       this.teacherSelected = [];
    //       this.teacherSelectedId = [];
    //       this.getAllTeacherSubjects();
    //     }
    //   },
    // });

    // this.subs.sink = this.type_of_contract_filter.valueChanges.subscribe({
    //   next: (contract) => {
    //     if (contract && contract.length === 0) {
    //       this.filteredValue.type_of_contract = null;
    //       this.getAllTeacherSubjects();
    //     } else {
    //       this.filteredValue.type_of_contract = contract[0] === 'All' ? null : contract;
    //       this.paginator.pageIndex = 0;
    //       this.selection.clear();
    //       this.isCheckedAll = false;
    //       this.teacherSelected = [];
    //       this.teacherSelectedId = [];
    //       this.getAllTeacherSubjects();
    //     }
    //   },
    // });

    // this.subs.sink = this.type_of_intervention_filter.valueChanges.subscribe({
    //   next: (intervention) => {
    //     if (intervention && intervention.length === 0) {
    //       this.filteredValue.type_of_intervention = null;
    //       this.getAllTeacherSubjects();
    //     } else {
    //       this.filteredValue.type_of_intervention = intervention[0] === 'All' ? null : intervention;
    //       this.paginator.pageIndex = 0;
    //       this.selection.clear();
    //       this.isCheckedAll = false;
    //       this.teacherSelected = [];
    //       this.teacherSelectedId = [];
    //       this.getAllTeacherSubjects();
    //     }
    //   },
    // });

    // this.subs.sink = this.statusFilter.valueChanges.subscribe({
    //   next: (status) => {
    //     if (status && status.length === 0) {
    //       this.filteredValue.status = null;
    //       this.getAllTeacherSubjects();
    //     } else {
    //       this.filteredValue.status = status[0] === 'All' ? null : status;
    //       this.paginator.pageIndex = 0;
    //       this.selection.clear();
    //       this.isCheckedAll = false;
    //       this.teacherSelected = [];
    //       this.teacherSelectedId = [];
    //       this.getAllTeacherSubjects();
    //     }
    //   },
    // });
  }

  setProgramFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.program) === JSON.stringify(this.programFilter?.value);
    if (isSame) {
      return;
    } else if (this.programFilter?.value?.length) {
      this.filteredValue.program_id = this.programFilter?.value;
      this.tempDataFilter.program = this.programFilter?.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTeacherSubjects();
      }
    } else {
      if (this.tempDataFilter.program?.length && !this.programFilter?.value?.length) {
        this.filteredValue.program_id = this.programFilter?.value;
        this.tempDataFilter.program = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllTeacherSubjects();
        }
      } else {
        return;
      }
    }
  }

  setLegalEntityFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.legalEntity) === JSON.stringify(this.legal_entity_filter.value);
    if (isSame) {
      return;
    } else if (this.legal_entity_filter.value?.length) {
      this.filteredValue.legal_entity_id = this.legal_entity_filter.value;
      this.tempDataFilter.legalEntity = this.legal_entity_filter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTeacherSubjects();
      }
    } else {
      if (this.tempDataFilter.legalEntity?.length && !this.legal_entity_filter.value?.length) {
        this.filteredValue.legal_entity_id = this.legal_entity_filter.value;
        this.tempDataFilter.legalEntity = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllTeacherSubjects();
        }
      } else {
        return;
      }
    }
  }

  setSequenceFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.sequence) === JSON.stringify(this.sequence_filter.value);
    if (isSame) {
      return;
    } else if (this.sequence_filter.value?.length) {
      this.filteredValue.sequence_id = this.sequence_filter.value;
      this.tempDataFilter.sequence = this.sequence_filter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTeacherSubjects();
      }
    } else {
      if (this.tempDataFilter.sequence?.length && !this.sequence_filter.value?.length) {
        this.filteredValue.sequence_id = this.sequence_filter.value;
        this.tempDataFilter.sequence = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllTeacherSubjects();
        }
      } else {
        return;
      }
    }
  }

  setSubjectFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.subject) === JSON.stringify(this.subjectFilter.value);
    if (isSame) {
      return;
    } else if (this.subjectFilter.value?.length) {
      this.filteredValue.subject_id = this.subjectFilter.value;
      this.tempDataFilter.subject = this.subjectFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTeacherSubjects();
      }
    } else {
      if (this.tempDataFilter.subject?.length && !this.subjectFilter.value?.length) {
        this.filteredValue.subject_id = this.subjectFilter.value;
        this.tempDataFilter.subject = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllTeacherSubjects();
        }
      } else {
        return;
      }
    }
  }

  setContractFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.typeOfContract) === JSON.stringify(this.type_of_contract_filter.value);
    if (isSame) {
      return;
    } else if (this.type_of_contract_filter.value?.length) {
      this.filteredValue.type_of_contract = this.type_of_contract_filter.value;
      this.tempDataFilter.typeOfContract = this.type_of_contract_filter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTeacherSubjects();
      }
    } else {
      if (this.tempDataFilter.typeOfContract?.length && !this.type_of_contract_filter.value?.length) {
        this.filteredValue.type_of_contract = this.type_of_contract_filter.value;
        this.tempDataFilter.typeOfContract = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllTeacherSubjects();
        }
      } else {
        return;
      }
    }
  }

  setInterventionFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.typeOfIntervention) === JSON.stringify(this.type_of_intervention_filter.value);
    if (isSame) {
      return;
    } else if (this.type_of_intervention_filter.value?.length) {
      this.filteredValue.type_of_intervention = this.type_of_intervention_filter.value;
      this.tempDataFilter.typeOfIntervention = this.type_of_intervention_filter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTeacherSubjects();
      }
    } else {
      if (this.tempDataFilter.typeOfIntervention?.length && !this.type_of_intervention_filter.value?.length) {
        this.filteredValue.type_of_intervention = this.type_of_intervention_filter.value;
        this.tempDataFilter.typeOfIntervention = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllTeacherSubjects();
        }
      } else {
        return;
      }
    }
  }

  setStatusFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.status) === JSON.stringify(this.statusFilter.value);
    if (isSame) {
      return;
    } else if (this.statusFilter.value?.length) {
      this.filteredValue.status = this.statusFilter.value;
      this.tempDataFilter.status = this.statusFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTeacherSubjects();
      }
    } else {
      if (this.tempDataFilter.status?.length && !this.statusFilter.value?.length) {
        this.filteredValue.status = this.statusFilter.value;
        this.tempDataFilter.status = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllTeacherSubjects();
        }
      } else {
        return;
      }
    }
  }

  clearSelectIfFilter() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
    this.allContractForCheckbox = [];
    this.allExportForCheckbox = [];
    this.dataUnselectUser = [];
    this.paginator.pageIndex = 0;
    this.disabledActions = false;
  }

  scholarSelect() {
    this.school = [];
    this.campusList = [];
    this.levels = [];
    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.schoolsFilter.value) {
      this.schoolsFilter.setValue(null);
    }
    if (!this.scholarFilter.value || this.scholarFilter.value.length === 0) {
      this.filteredValueSuperFilter.scholar_season_id = null;
      this.scholarSelected = [];
      this.school = [];
      this.levels = [];
      this.campusList = [];
      this.getDataForList();
    } else {
      this.filteredValueSuperFilter.scholar_season_id = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : null;
      this.scholarSelected = this.scholarFilter.value;
      const scholarSeason = this.scholarFilter.value !== 'All' ? this.scholarFilter.value : '';
      this.getDataForList(scholarSeason);
    }
  }

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.originalScholar = _.cloneDeep(resp);
          this.scholars = [];
          this.scholars = this.originalScholar.sort((a, b) =>
            a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
          );
          this.scholars.unshift({ _id: 'All', scholar_season: this.translate.instant('All') });
          this.scholars = _.uniqBy(this.scholars, '_id');
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

  getDataCampus() {
    this.levels = [];
    this.campusList = [];
    this.schoolName = '';

    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
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
        this.filteredValueSuperFilter.schools_id = this.schoolsFilter.value;
        schools.forEach((element) => {
          const sName = this.school.find((list) => list._id === element);
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
        this.filteredValueSuperFilter.schools_id = null;
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
        this.filteredValueSuperFilter.schools_id = this.schoolsFilter.value;
      } else if (schools && schools.includes('All') && this.listObjective && this.listObjective.length) {
        this.listObjective.forEach((list) => {
          if (list.campuses && list.campuses.length) {
            list.campuses.forEach((campus) => {
              this.campusList.push(campus);
            });
          }
        });
        this.filteredValueSuperFilter.schools_id = null;
      } else {
        this.filteredValueSuperFilter.schools_id = null;
      }
    }
    this.getDataLevel();
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
  checkSuperFilterCampus() {
    const form = this.campusFilter.value;
    if (form && form.length) {
      this.campusFilter.patchValue(form);
    } else {
      this.campusFilter.patchValue(null);
    }
    this.getDataLevel();
  }
  getDataLevel() {
    this.levels = [];
    this.campusName = '';
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }

    const schools = this.schoolsFilter.value;
    const sCampus = this.campusFilter.value;
    this.filteredValueSuperFilter.campuses_id =
      this.campusFilter.value && !this.campusFilter.value.includes('All') ? this.campusFilter.value : null;

    if (
      this.currentUser &&
      this.currentUser.entities &&
      this.currentUser.entities.length &&
      this.currentUser.app_data &&
      this.currentUser.app_data.school_package &&
      this.currentUser.app_data.school_package.length &&
      this.campusFilter.value &&
      this.campusFilter.value.length &&
      this.campusList &&
      this.campusList.length
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
      } else if (sCampus && sCampus.length && sCampus.includes('All')) {
        this.campusList.forEach((lev) => {
          if (lev && lev.levels && lev.levels.length) {
            this.levels = _.concat(this.levels, lev.levels);
          }
        });
        this.filteredValueSuperFilter.campuses_id = null;
      }
    } else {
      if (schools && sCampus && !sCampus.includes('All') && this.campusList && this.campusList.length) {
        sCampus.forEach((element) => {
          const sName = this.campusList.find((list) => list._id === element);
          this.campusName = this.campusName ? this.campusName + ',' + sName.name : sName.name;
        });

        const sLevelList = this.campusList.filter((list) => {
          return sCampus.includes(list._id);
        });

        sLevelList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
              this.levelListBackup = this.levels;
            });
          }
        });
      } else if (sCampus && sCampus.includes('All') && this.campusList && this.campusList.length) {
        this.campusList.forEach((list) => {
          if (list.levels && list.levels.length) {
            list.levels.forEach((level) => {
              this.levels.push(level);
              this.levelListBackup = this.levels;
            });
          }
        });
        this.filteredValueSuperFilter.campuses_id = null;
      } else {
        this.filteredValueSuperFilter.campuses_id = null;
      }
    }
    this.levels = _.uniqBy(this.levels, 'name');
    this.levels = this.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }
  checkSuperFilterLevel() {
    const form = this.levelFilter.value;
    if (form && form.length) {
      this.levelFilter.patchValue(form);
    } else {
      this.levelFilter.patchValue(null);
    }
    this.getDataByLevel();
  }
  getDataByLevel() {
    // const level = this.levelFilter.value;
    // if (this.levelFilter.value) {
    //   this.filteredValues.level = level === '' ? '' : level;
    // } else {
    //   this.filteredValues.level = '';
    // }
    this.levelName = '';

    if (this.levelFilter.value && this.levelFilter.value.length && !this.levelFilter.value.includes('All')) {
      const sLevel = this.levelFilter.value;
      this.filteredValueSuperFilter.levels_id = this.levelFilter.value;

      sLevel.forEach((element) => {
        const sName = this.levels.find((list) => list._id === element);
        console.log(sName);
        this.levelName = this.levelName ? this.levelName + ',' + sName.name : sName.name;
      });
    } else {
      this.filteredValueSuperFilter.levels_id = null;
    }
    this.levels = _.uniqBy(this.levels, 'name');
    this.levels = this.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }

  // ============== Reset Filter =================================

  resetFilter() {
    this.teacherFilter.patchValue('', { emitEvent: false });
    this.programFilter.patchValue(null, { emitEvent: false });
    this.legal_entity_filter.patchValue(null, { emitEvent: false });
    this.sequence_filter.patchValue(null, { emitEvent: false });
    this.subjectFilter.patchValue(null, { emitEvent: false });
    this.statusFilter.patchValue(null, { emitEvent: false });
    this.type_of_contract_filter.patchValue(null, { emitEvent: false });
    this.type_of_intervention_filter.patchValue(null, { emitEvent: false });
    this.scholarFilter.patchValue('All');
    this.schoolsFilter.patchValue(null);
    this.campusFilter.patchValue(null);
    this.levelFilter.patchValue(null);
    this.sourceFilter.patchValue(null, { emitEvent: false });

    this.filteredValue = {
      sequence_id: null,
      module_id: null,
      subject_id: null,
      type_of_group: null,
      teacher_name: null,
      type_of_intervention: null,
      type_of_contract: null,
      program_id: null,
      legal_entity_id: null,
      subject: null,
      status: null,
      isForFollowUpTable: true,
      generation_source: null,
    };

    this.filteredValueSuperFilter = {
      scholar_season_id: null,
      schools_id: null,
      campuses_id: null,
      levels_id: null,
    };
    this.tempDataFilter.source = null;

    this.superFilterVal = null;
    this.allContractForCheckbox = [];
    this.allExportForCheckbox = [];
    this.dataUnselectUser = [];

    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.paginator.pageIndex = 0;
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
    this.levels = [];
    this.school = [];
    this.scholars = [];
    this.campusList = [];
    this.disabledActions = false;
    this.getDataScholarSeasons();
    this.getAllTeacherSubjects();
    this.isDisabled = true;
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

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return this.isCheckedAll ? true : numSelected === numRows || numSelected > numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.allContractForCheckbox = [];
      this.allExportForCheckbox = [];
      this.dataUnselectUser = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
    } else {
      console.log('master else masuk');
      this.selection.clear();
      this.dataSelected = [];
      this.isCheckedAll = true;
      // this.allTeachersForCheckbox = [];
      this.allContractForCheckbox = [];
      this.allExportForCheckbox = [];
      this.dataUnselectUser = [];
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
      limit: 300,
      page: pageNumber,
    };
    this.isWaitingForResponse = true;
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.teacherManagementService
      .getAllTeacherSubjectsCheckbox(pagination, this.filteredValue, this.sortValue, userTypesList)
      .subscribe(
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
                this.disabledActions = false;
              }
              this.pageSelected.push(this.paginator.pageIndex);
            } else {
              this.pageSelected = [];
            }
          }
        },
        (error) => {
          this.authService.postErrorLog(error);
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
    this.selectType = info;
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  // +++++++++++++ EXPORT +++++++++++++++ //
  csvDownloadFollowUpTeacher() {
    if (this.selection.selected.length < 1) {
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
    if ((this.dataSelected.length && !this.isCheckedAll) || (this.dataUnselectUser && this.dataUnselectUser.length)) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      const billing = `"teacher_subject_id":` + '[' + mappedUserId.toString() + ']';
      if (filter.length > 9) {
        filtered = filter.slice(0, 8) + billing + ',' + filter.slice(8);
      } else {
        filtered = filter.slice(0, 8) + billing + filter.slice(8);
      }
    } else if (this.isCheckedAll) {
      filtered = filter;
    }
    console.log('_fil', filtered);
    const userId = this.currentUser._id;
    const userTypeId = this.userTypeLoginId.type._id;

    const exportTeachersData = `downloadTeacherFollowUpCSV/`;
    let fullURL;
    const userTypesList =
      this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id.map((res) => `"` + res + `"`) : [];
    if (filtered) {
      fullURL =
        url +
        exportTeachersData +
        fileType +
        '/' +
        lang +
        '/' +
        userId +
        '/' +
        userTypeId +
        '?' +
        filtered +
        '&user_type_ids=[' +
        userTypesList +
        ']';
    } else {
      fullURL =
        url + exportTeachersData + fileType + '/' + lang + '/' + userId + '/' + userTypeId + '&user_type_ids=[' + userTypesList + ']';
    }
    console.log('fullURL', fullURL);

    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
      }),
    };

    this.isWaitingForResponse = true;
    this.httpClient.get(`${encodeURI(fullURL)}`, httpOptions).subscribe(
      (res) => {
        if (res) {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('ReAdmission_S3.TITLE'),
            text: this.translate.instant('ReAdmission_S3.TEXT'),
            confirmButtonText: this.translate.instant('ReAdmission_S3.BUTTON'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => this.clearSelectIfFilter());
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
      },
    );
  }

  cleanFilterDataDownload() {
    const filterData = _.cloneDeep({ ...this.filteredValue, ...this.filteredValueSuperFilter });
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'isForFollowUpTable') {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${filterData[key]}` : filterQuery + `"${key}":${filterData[key]}`;
        } else if (key === 'teacher_name' || key === 'scholar_season_id') {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        } else if (key === 'schools_id') {
          const schoolsMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${schoolsMap}]` : filterQuery + `"${key}":[${schoolsMap}]`;
        } else if (key === 'levels_id') {
          const levelsMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${levelsMap}]` : filterQuery + `"${key}":[${levelsMap}]`;
        } else if (key === 'campuses_id') {
          const campusesMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${campusesMap}]` : filterQuery + `"${key}":[${campusesMap}]`;
        } else if (key === 'program_id') {
          const programsMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${programsMap}]` : filterQuery + `"${key}":[${programsMap}]`;
        } else if (key === 'legal_entity_id') {
          const legalEntityMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${legalEntityMap}]` : filterQuery + `"${key}":[${legalEntityMap}]`;
        } else if (key === 'sequence_id') {
          const sequenceMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${sequenceMap}]` : filterQuery + `"${key}":[${sequenceMap}]`;
        } else if (key === 'subject_id') {
          const subjectsMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${subjectsMap}]` : filterQuery + `"${key}":[${subjectsMap}]`;
        } else if (key === 'type_of_intervention') {
          const typeOfInterventionMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"${key}":[${typeOfInterventionMap}]`
            : filterQuery + `"${key}":[${typeOfInterventionMap}]`;
        } else if (key === 'status' || key === 'type_of_contract') {
          const statusMap = filterData[key].map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${statusMap}]` : filterQuery + `"${key}":[${statusMap}]`;
        } else if (key === 'generation_source') {
          const statusMap = filterData[key];
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${statusMap}"` : filterQuery + `"${key}":"${statusMap}"`;
        }
      }
    });
    return 'filter={' + filterQuery + '}';
  }

  applySuperFilter() {
    this.isSuperFilterApplied = true;
    this.paginator.firstPage();
    this.getAllTeacherSubjects('superFilter');
    this.isSuperFilterApplied = false;
    this.isDisabled = true;
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  ngAfterViewInit() {
    // this.dataSource.sort = this.sort;
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isSuperFilterApplied) {
            this.getAllTeacherSubjects();
          }
        }),
      )
      .subscribe();
  }

  getDataDownloadCSVCheckbox(pageNumber, action) {
    if (this.buttonClicked === 'export') {
      if (this.isCheckedAll) {
        if (this.dataUnselectUser.length < 1) {
          this.csvDownloadFollowUpTeacher();
        } else {
          if (pageNumber === 0) {
            this.allExportForCheckbox = [];
            this.dataSelected = [];
          }
          const pagination = {
            limit: 500,
            page: pageNumber,
          };
          this.isWaitingForResponse = true;
          const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
          const filter = { ...this.filteredValue, ...this.superFilterVal };
          this.subs.sink = this.teacherManagementService
            .getAllTeacherForExportCheckbox(pagination, filter, this.sortValue, userTypesList)
            .subscribe(
              (students: any) => {
                if (students && students.length) {
                  const resp = _.cloneDeep(students);
                  this.allExportForCheckbox = _.concat(this.allExportForCheckbox, resp);
                  const page = pageNumber + 1;
                  this.getDataDownloadCSVCheckbox(page, action);
                } else {
                  this.isWaitingForResponse = false;
                  if (this.isCheckedAll && this.allExportForCheckbox && this.allExportForCheckbox.length) {
                    this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                    this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                    if (this.dataSelected && this.dataSelected.length) {
                      this.csvDownloadFollowUpTeacher();
                    }
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
      } else {
        this.csvDownloadFollowUpTeacher();
      }
    }
  }

  getDataGenerateContractCheckbox(pageNumber, action) {
    if (this.buttonClicked === 'contract') {
      if (this.isCheckedAll) {
        if (pageNumber === 0) {
          this.allContractForCheckbox = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isWaitingForResponse = true;
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        const filter = { ...this.filteredValue, ...this.superFilterVal };
        this.subs.sink = this.teacherManagementService
          .getAllTeacherForContractCheckbox(pagination, filter, this.sortValue, userTypesList)
          .subscribe(
            (students: any) => {
              if (students && students.length) {
                const resp = _.cloneDeep(students);
                this.allContractForCheckbox = _.concat(this.allContractForCheckbox, resp);
                const page = pageNumber + 1;
                this.getDataGenerateContractCheckbox(page, action);
              } else {
                this.isWaitingForResponse = false;
                if (this.isCheckedAll && this.allContractForCheckbox && this.allContractForCheckbox.length) {
                  this.dataSelected = this.allContractForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length) {
                    this.generateContract();
                  }
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
      } else {
        this.generateContract();
      }
    }
  }

  controllerButton(action) {
    switch (action) {
      case 'contract':
        setTimeout(() => {
          this.getDataGenerateContractCheckbox(0, 'contract');
        }, 500);
        break;
      case 'export':
        setTimeout(() => {
          this.getDataDownloadCSVCheckbox(0, 'export');
        }, 500);
        break;
      case 'add-new-intervention':
        setTimeout(() => {
          this.openAddNewIntervention();
        }, 500);
        break;
      default:
        this.resetFilter();
    }
  }

  openAddNewIntervention() {
    this.subs.sink = this.dialog
      .open(AddInterventionDialogComponent, {
        width: '540px',
        minHeight: '100px',
        disableClose: true,
        panelClass: 'certification-rule-pop-up',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
        }
      });
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    console.log('ini filteritem', filterItem);
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.filteredValueSuperFilter, this.filteredValue);
    if (filterItem.name === 'scholar_season_id') {
      this.scholarFilter.setValue('All');
      this.scholarSelect();
    } else if (filterItem.name === 'schools_id') {
      this.schoolsFilter.setValue(null);
      this.checkSuperFilterSchool();
    } else if (filterItem.name === 'campuses_id') {
      this.campusFilter.setValue(null);
      this.getDataCampus();
    }
    this.clearSelectIfFilter();
    const type = filterItem.type === 'super_filter' ? 'superFilter' : 'tableFilter';
    this.getAllTeacherSubjects(type);
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'scholar_season_id', // name of the key in the object storing the filter
        column: 'CARDDETAIL.Scholar Season', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValueSuperFilter, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.scholars, // the array/list holding the dropdown options
        filterRef: this.scholarFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'scholar_season', // the key displayed in the html (only applicable to array of objects)
        savedValue: '_id', // the value saved when user select an option (e.g. _id)
        resetValue: 'All',
      },
      {
        type: 'super_filter',
        name: 'schools_id',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.School',
        isMultiple: this.schoolsFilter?.value?.length === this.school?.length ? false : true,
        filterValue: this.schoolsFilter?.value?.length === this.school?.length ? this.filteredValuesAll : this.filteredValueSuperFilter,
        filterList: this.schoolsFilter?.value?.length === this.school?.length ? null : this.school,
        filterRef: this.schoolsFilter,
        isSelectionInput: this.schoolsFilter?.value?.length === this.school?.length ? false : true,
        displayKey: this.schoolsFilter?.value?.length === this.school?.length ? null : 'short_name',
        savedValue: this.schoolsFilter?.value?.length === this.school?.length ? null : '_id',
      },
      {
        type: 'super_filter',
        name: 'campuses_id',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus',
        isMultiple: this.campusFilter?.value?.length === this.campusList?.length ? false : true,
        filterValue: this.campusFilter?.value?.length === this.campusList?.length ? this.filteredValuesAll : this.filteredValueSuperFilter,
        filterList: this.campusFilter?.value?.length === this.campusList?.length ? null : this.campusList,
        filterRef: this.campusFilter,
        isSelectionInput: this.campusFilter?.value?.length === this.campusList?.length ? false : true,
        displayKey: this.campusFilter?.value?.length === this.campusList?.length ? null : 'name',
        savedValue: this.campusFilter?.value?.length === this.campusList?.length ? null : '_id',
      },
      {
        type: 'super_filter',
        name: 'levels_id',
        column: 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level',
        isMultiple: this.levelFilter?.value?.length === this.levels?.length ? false : true,
        filterValue: this.levelFilter?.value?.length === this.levels?.length ? this.filteredValuesAll : this.filteredValueSuperFilter,
        filterList: this.levelFilter?.value?.length === this.levels?.length ? null : this.levels,
        filterRef: this.levelFilter,
        isSelectionInput: this.levelFilter?.value?.length === this.levels?.length ? false : true,
        displayKey: this.levelFilter?.value?.length === this.levels?.length ? null : 'name',
        savedValue: this.levelFilter?.value?.length === this.levels?.length ? null : '_id',
      },
      // Table Filters below
      {
        type: 'table_filter',
        name: 'teacher_name',
        column: 'TEACHER_FOLLOW_UP.Teacher',
        isMultiple: false,
        filterValue: this.filteredValue,
        filterList: null,
        filterRef: this.teacherFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'program_id',
        column: 'TEACHER_FOLLOW_UP.Program',
        isMultiple: this.programFilter?.value?.length === this.programList?.length ? false : true,
        filterValue: this.programFilter?.value?.length === this.programList?.length ? this.filteredValuesAll : this.filteredValue,
        filterList: this.programFilter?.value?.length === this.programList?.length ? null : this.programList,
        filterRef: this.programFilter,
        isSelectionInput: this.programFilter?.value?.length === this.programList?.length ? false : true,
        displayKey: this.programFilter?.value?.length === this.programList?.length ? null : 'program',
        savedValue: this.programFilter?.value?.length === this.programList?.length ? null : '_id',
      },
      {
        type: 'table_filter',
        name: 'legal_entity_id',
        column: 'TEACHER_FOLLOW_UP.Legal entity',
        isMultiple: this.legal_entity_filter?.value?.length === this.legalEntitiyList?.length ? false : true,
        filterValue:
          this.legal_entity_filter?.value?.length === this.legalEntitiyList?.length ? this.filteredValuesAll : this.filteredValue,
        filterList: this.legal_entity_filter?.value?.length === this.legalEntitiyList?.length ? null : this.legalEntitiyList,
        filterRef: this.legal_entity_filter,
        isSelectionInput: this.legal_entity_filter?.value?.length === this.legalEntitiyList?.length ? false : true,
        displayKey: this.legal_entity_filter?.value?.length === this.legalEntitiyList?.length ? null : 'legal_entity_name',
        savedValue: this.legal_entity_filter?.value?.length === this.legalEntitiyList?.length ? null : '_id',
      },
      {
        type: 'table_filter',
        name: 'sequence_id',
        column: 'TEACHER_FOLLOW_UP.Sequence',
        isMultiple: this.sequence_filter?.value?.length === this.sequenceList?.length ? false : true,
        filterValue: this.sequence_filter?.value?.length === this.sequenceList?.length ? this.filteredValuesAll : this.filteredValue,
        filterList: this.sequence_filter?.value?.length === this.sequenceList?.length ? null : this.sequenceList,
        filterRef: this.sequence_filter,
        isSelectionInput: this.sequence_filter?.value?.length === this.sequenceList?.length ? false : true,
        displayKey: this.sequence_filter?.value?.length === this.sequenceList?.length ? null : 'name',
        savedValue: this.sequence_filter?.value?.length === this.sequenceList?.length ? null : 'name',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'subject_id',
        column: 'TEACHER_FOLLOW_UP.Subject',
        isMultiple: this.subjectFilter?.value?.length === this.subjectList?.length ? false : true,
        filterValue: this.subjectFilter?.value?.length === this.subjectList?.length ? this.filteredValuesAll : this.filteredValue,
        filterList: this.subjectFilter?.value?.length === this.subjectList?.length ? null : this.subjectList,
        filterRef: this.subjectFilter,
        isSelectionInput: this.subjectFilter?.value?.length === this.subjectList?.length ? false : true,
        displayKey: this.subjectFilter?.value?.length === this.subjectList?.length ? null : 'name',
        savedValue: this.subjectFilter?.value?.length === this.subjectList?.length ? null : 'name',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'type_of_contract',
        column: 'TEACHER_FOLLOW_UP.Type of contract',
        isMultiple: this.type_of_contract_filter?.value?.length === this.type_of_contract_list?.length ? false : true,
        filterValue:
          this.type_of_contract_filter?.value?.length === this.type_of_contract_list?.length ? this.filteredValuesAll : this.filteredValue,
        filterList: this.type_of_contract_filter?.value?.length === this.type_of_contract_list?.length ? null : this.type_of_contract_list,
        filterRef: this.type_of_contract_filter,
        isSelectionInput: this.type_of_contract_filter?.value?.length === this.type_of_contract_list?.length ? false : true,
        displayKey: this.type_of_contract_filter?.value?.length === this.type_of_contract_list?.length ? null : 'label',
        savedValue: this.type_of_contract_filter?.value?.length === this.type_of_contract_list?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'type_of_intervention',
        column: 'TEACHER_FOLLOW_UP.Type of intervention',
        isMultiple: this.type_of_intervention_filter?.value?.length === this.type_of_intervention_list?.length ? false : true,
        filterValue:
          this.type_of_intervention_filter?.value?.length === this.type_of_intervention_list?.length
            ? this.filteredValuesAll
            : this.filteredValue,
        filterList:
          this.type_of_intervention_filter?.value?.length === this.type_of_intervention_list?.length
            ? null
            : this.type_of_intervention_list,
        filterRef: this.type_of_intervention_filter,
        isSelectionInput: this.type_of_intervention_filter?.value?.length === this.type_of_intervention_list?.length ? false : true,
        displayKey: this.type_of_intervention_filter?.value?.length === this.type_of_intervention_list?.length ? null : 'label',
        savedValue: this.type_of_intervention_filter?.value?.length === this.type_of_intervention_list?.length ? null : 'value',
        resetValue: null,
      },
      {
        type: 'table_filter',
        name: 'status',
        column: 'Status',
        isMultiple: this.statusFilter?.value?.length === this.statusList?.length ? false : true,
        filterValue: this.statusFilter?.value?.length === this.statusList?.length ? this.filteredValuesAll : this.filteredValue,
        filterList: this.statusFilter?.value?.length === this.statusList?.length ? null : this.statusList,
        filterRef: this.statusFilter,
        isSelectionInput: this.statusFilter?.value?.length === this.statusList?.length ? false : true,
        displayKey: this.statusFilter?.value?.length === this.statusList?.length ? null : 'value',
        savedValue: this.statusFilter?.value?.length === this.statusList?.length ? null : 'value',
        translationPrefix: this.statusFilter?.value?.length !== this.statusList?.length ? 'CONTRACT_STATUS.' : null,
      },
      {
        type: 'table_filter',
        name: 'generation_source',
        column: 'Source',
        isMultiple: this.sourceFilter?.value?.length === this.sourceList?.length ? false : true,
        filterValue: this.sourceFilter?.value?.length === this.sourceList?.length ? this.filteredValuesAll : this.filteredValue,
        filterList: this.sourceFilter?.value?.length === this.sourceList?.length ? null : this.sourceList,
        filterRef: this.sourceFilter,
        isSelectionInput: this.sourceFilter?.value?.length === this.sourceList?.length ? false : true,
        displayKey: this.sourceFilter?.value?.length === this.sourceList?.length ? null : 'value',
        savedValue: this.sourceFilter?.value?.length === this.sourceList?.length ? null : 'value',
      },
    ];

    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  isAllDropdownSelected(type) {
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
    } else if (type === 'program') {
      const selected = this.programFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.programList.length;
      return isAllSelected;
    } else if (type === 'legalEntity') {
      const selected = this.legal_entity_filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.legalEntitiyList.length;
      return isAllSelected;
    } else if (type === 'sequence') {
      const selected = this.sequence_filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.sequenceList.length;
      return isAllSelected;
    } else if (type === 'subject') {
      const selected = this.subjectFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.subjectList.length;
      return isAllSelected;
    } else if (type === 'contract') {
      const selected = this.type_of_contract_filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.type_of_contract_list.length;
      return isAllSelected;
    } else if (type === 'intervention') {
      const selected = this.type_of_intervention_filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.type_of_intervention_list.length;
      return isAllSelected;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.statusList.length;
      return isAllSelected;
    } else if (type === 'source') {
      const selected = this.sourceFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.sourceList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
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
    } else if (type === 'program') {
      const selected = this.programFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.programList.length;
      return isIndeterminate;
    } else if (type === 'legalEntity') {
      const selected = this.legal_entity_filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.legalEntitiyList.length;
      return isIndeterminate;
    } else if (type === 'sequence') {
      const selected = this.sequence_filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.sequenceList.length;
      return isIndeterminate;
    } else if (type === 'subject') {
      const selected = this.subjectFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.subjectList.length;
      return isIndeterminate;
    } else if (type === 'contract') {
      const selected = this.type_of_contract_filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.type_of_contract_list.length;
      return isIndeterminate;
    } else if (type === 'intervention') {
      const selected = this.type_of_intervention_filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.type_of_intervention_list.length;
      return isIndeterminate;
    } else if (type === 'status') {
      const selected = this.statusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.statusList.length;
      return isIndeterminate;
    } else if (type === 'source') {
      const selected = this.sourceFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.sourceList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
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
    } else if (type === 'program') {
      if (event.checked) {
        const programData = this.programList.map((el) => el._id);
        this.programFilter.patchValue(programData);
      } else {
        this.programFilter.patchValue(null);
      }
    } else if (type === 'legalEntity') {
      if (event.checked) {
        const legalData = this.legalEntitiyList.map((el) => el._id);
        this.legal_entity_filter.patchValue(legalData);
      } else {
        this.legal_entity_filter.patchValue(null);
      }
    } else if (type === 'sequence') {
      if (event.checked) {
        const sequenceData = this.sequenceList.map((el) => el.name);
        this.sequence_filter.patchValue(sequenceData);
      } else {
        this.sequence_filter.patchValue(null);
      }
    } else if (type === 'subject') {
      if (event.checked) {
        const subjectData = this.subjectList.map((el) => el.name);
        this.subjectFilter.patchValue(subjectData);
      } else {
        this.subjectFilter.patchValue(null);
      }
    } else if (type === 'contract') {
      if (event.checked) {
        const contractData = this.type_of_contract_list.map((el) => el.value);
        this.type_of_contract_filter.patchValue(contractData);
      } else {
        this.type_of_contract_filter.patchValue(null);
      }
    } else if (type === 'intervention') {
      if (event.checked) {
        const interventionData = this.type_of_intervention_list.map((el) => el.value);
        this.type_of_intervention_filter.patchValue(interventionData);
      } else {
        this.type_of_intervention_filter.patchValue(null);
      }
    } else if (type === 'status') {
      if (event.checked) {
        const statusData = this.statusList.map((el) => el.value);
        this.statusFilter.patchValue(statusData);
      } else {
        this.statusFilter.patchValue(null);
      }
    } else if (type === 'source') {
      if (event.checked) {
        const statusData = this.sourceList.map((el) => el.value);
        this.sourceFilter.patchValue(statusData);
      } else {
        this.sourceFilter.patchValue(null);
      }
    }
  }
  deleteTeacherSubject(data) {
    let timeDisabled = 3;
    Swal.fire({
      allowOutsideClick: false,
      type: 'question',
      title: this.translate.instant('Attention'),
      html: this.translate.instant('DELETE_USER.QUESTION', {
        civility: data?.teacher_id?.civility !== 'neutral' ? this.translate.instant(data?.teacher_id?.civility) : '',
        firstName: data?.teacher_id?.first_name ? data?.teacher_id?.first_name : '',
        lastName: data?.teacher_id?.last_name ? data?.teacher_id?.last_name.toUpperCase() : '',
      }),
      showCancelButton: true,
      confirmButtonText: this.translate.instant('SWEET_ALERT.DELETE.CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('SWEET_ALERT.DELETE.CANCEL'),
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        this.intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM') + ' in ' + ` (${timeDisabled})` + ' sec';
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(this.intVal);
        }, timeDisabled * 1000);
      },
    }).then((isConfirm) => {
      if (isConfirm.value) {
        this.isWaitingForResponse = true;
        this.subs.sink = this.teacherManagementService.deleteTeacherSubject(data?._id).subscribe(
          (resp) => {
            if (resp) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.getAllTeacherSubjects();
              });
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
    });
  }
  setSourceFilter() {
    this.dataSelected = [];
    this.isCheckedAll = false;
    const isSame = JSON.stringify(this.tempDataFilter.source) === JSON.stringify(this.sourceFilter.value);
    if (isSame) {
      return;
    } else if (this.sourceFilter.value?.length) {
      const sourceValue = this.sourceFilter.value?.length === 1 ? this.sourceFilter.value[0] : null;
      this.filteredValue.generation_source = sourceValue;
      this.tempDataFilter.source = this.sourceFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTeacherSubjects();
      }
    } else {
      if (this.tempDataFilter.source?.length && !this.sourceFilter.value?.length) {
        this.filteredValue.generation_source = null;
        this.tempDataFilter.source = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllTeacherSubjects();
        }
      } else {
        return;
      }
    }
  }
  editManual(element){
    if(element?._id){
      const url = this.router.createUrlTree(['teacher-management/intervention-form'], { queryParams: { teacherSubject:element?._id } });
      window.open(url.toString(), '_blank');
    }
  }
}
