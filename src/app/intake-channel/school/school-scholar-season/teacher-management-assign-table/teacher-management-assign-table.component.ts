import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TeacherManagementService } from 'app/service/teacher-management/teacher-management.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import { AddAssignTeacherDialogComponent } from 'app/shared/components/add-assign-teacher-dialog/add-assign-teacher-dialog.component';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { environment } from 'environments/environment';
import { FinancesService } from 'app/service/finance/finance.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-teacher-management-assign-table',
  templateUrl: './teacher-management-assign-table.component.html',
  styleUrls: ['./teacher-management-assign-table.component.scss'],
})
export class TeacherManagementAssignTableComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();
  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = [
    'checkbox',
    'sequence',
    'module',
    'subject',
    'nb_of_session',
    'duration',
    'volume_of_hours_student',
    'type_of_groups',
    'groups',
    'volume_of_hours',
    'teacher',
    'type_of_intervention',
    'hourly_rate',
    'type_of_contract',
    'action',
  ];

  filterColumns: string[] = [
    'checkboxFilter',
    'sequenceFilter',
    'moduleFilter',
    'subjectFilter',
    'nb_of_sessionFilter',
    'durationFilter',
    'volume_of_hours_studentFilter',
    'type_of_groupsFilter',
    'groupsFilter',
    'volume_of_hoursFilter',
    'teacherFilter',
    'type_of_interventionFilter',
    'hourly_rateFilter',
    'type_of_contractFilter',
    'actionFilter',
  ];
  isWaitingForResponse = false;
  noData: any;
  dataCount = 0;
  disabledActions = false;

  isCheckedAll = false;
  selectType: any;
  dataSelected = [];
  pageSelected = [];
  allDataForCheckbox = [];
  subjectSelected: any[];
  subjectSelectedId: any[];
  selection = new SelectionModel<any>(true, []);
  programId: any;

  sortValue = null;

  filteredValue = {
    sequence_id: null,
    module_id: null,
    subject_id: null,
    type_of_group: null,
    teacher_name: null,
    type_of_intervention: null,
    type_of_contract: null,
    scholar_season_id: null,
    schools_id: null,
    campuses_id: null,
    levels_id: null,
    program_id: null,
    legal_entity_id: null,
    subject: null,
    status: null,
  };

  teacherFilter = new UntypedFormControl('', []);
  sequenceFilter = new UntypedFormControl([], []);
  moduleFilter = new UntypedFormControl([], []);
  subjectFilter = new UntypedFormControl([], []);
  typeOfGroupFilter = new UntypedFormControl([], []);
  typeOfInterventionFilter = new UntypedFormControl([], []);
  typeOfContractFilter = new UntypedFormControl([], []);

  sequenceList = [];
  moduleList = [];
  subjectList = [];
  typeOfGroupList = [];
  typeOfInterventionList = [];
  typeOfContractList = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  programData: any;
  legalEntities = [];
  currentUser: any;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private teacherManagementService: TeacherManagementService,
    private pageTitleService: PageTitleService,
    private financeService: FinancesService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.programId = this.route.snapshot.queryParamMap.get('programId');
    if (this.programId) {
      this.filteredValue.program_id = [this.programId];
    }
    // this.getAllSubjectData();
    this.getDropdownData();
    this.initializeUserFilter();
    this.subs.sink = this.translate.onLangChange.subscribe(() => {
      this.setPageTitle();
    });
    this.getEntityForAssignTeacher();
  }

  getAllSubjectData() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.teacherManagementService
      .getAllTeacherSubjectsAssignTable(pagination, this.filteredValue, this.sortValue, userTypesList)
      .subscribe({
        next: (resp) => {
          if (resp && resp.length) {
            this.setPageTitle();
            this.dataSource.data = _.cloneDeep(resp);
            this.programData = _.cloneDeep(resp && resp.length ? resp[0].program_id : null);
            this.dataCount = resp && resp.length ? resp[0].count_document : 0;
            this.isWaitingForResponse = false;
          } else {
            this.isWaitingForResponse = false;
            this.dataSource.data = [];
            this.paginator.length = 0;
            this.dataCount = 0;
          }
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
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

  setPageTitle() {
    if (this.programData) {
      const school = this.programData.school_id.short_name;
      const program = this.programData.program;
      const title = this.translate.instant('Title Assign Teacher', { school: school, program: program });
      this.pageTitleService.setTitle(title);
    } else {
      this.subs.sink = this.teacherManagementService.getOneProgram(this.programId).subscribe({
        next: (resp) => {
          console.log('Title', resp);
          const title = this.translate.instant('Title Assign Teacher', { school: resp.program, program: resp.school_id.short_name });
          this.pageTitleService.setTitle(title);
        },
        error: (err) => {
          this.authService.postErrorLog(err);
        },
      });
    }
  }

  getDropdownData() {
    this.isWaitingForResponse = true;
    let filterValue;
    if (this.programId) {
      filterValue = {
        program_id: [this.programId],
      };
      // this.filteredValue.program_id = [this.programId];
    }
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.teacherManagementService.getAllTeacherSubjectsAssignTableDropdown(filterValue, userTypesList).subscribe({
      next: (resp) => {
        this.setDropDownData(resp);
        this.isWaitingForResponse = false;
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

  setDropDownData(resp) {
    resp.forEach((element) => {
      if (element.program_sequence_id) {
        this.sequenceList.push(element.program_sequence_id);
      }
      if (element.program_module_id) {
        this.moduleList.push(element.program_module_id);
      }
      if (element.program_subject_id) {
        this.subjectList.push(element.program_subject_id);
      }
      if (element.type_of_intervention_id) {
        this.typeOfInterventionList.push(element.type_of_intervention_id.type_of_intervention);
        this.typeOfContractList.push(element.type_of_intervention_id.type_of_contract);
      }
      if (element.program_subject_id.program_sessions_id[0] && element.program_subject_id.program_sessions_id[0].class_group) {
        this.typeOfGroupList.push(element.program_subject_id.program_sessions_id[0].class_group);
      }
    });
    this.sequenceList = _.uniqBy(this.sequenceList, 'name');
    this.moduleList = _.uniqBy(this.moduleList, 'name');
    this.subjectList = _.uniqBy(this.subjectList, 'name');
    this.typeOfInterventionList = _.uniqBy(this.typeOfInterventionList);
    this.typeOfContractList = _.uniqBy(this.typeOfContractList);
    this.typeOfGroupList = _.uniqBy(this.typeOfGroupList);
  }

  initializeUserFilter() {
    // this.subs.sink = this.sequenceFilter.valueChanges.subscribe({
    //   next: (filter) => {
    //     if (filter && filter.length === 0) {
    //       this.filteredValue.sequence_id = null;
    //       this.getAllSubjectData();
    //     } else {
    //       this.filteredValue.sequence_id = filter[0] === 'All' ? null : filter;
    //       this.paginator.pageIndex = 0;
    //       this.selection.clear();
    //       this.isCheckedAll = false;
    //       this.subjectSelected = [];
    //       this.subjectSelectedId = [];
    //       this.getAllSubjectData();
    //     }
    //   },
    // });

    // this.subs.sink = this.moduleFilter.valueChanges.subscribe({
    //   next: (filter) => {
    //     if (filter && filter.length === 0) {
    //       this.filteredValue.module_id = null;
    //       this.getAllSubjectData();
    //     } else {
    //       this.filteredValue.module_id = filter[0] === 'All' ? null : filter;
    //       this.paginator.pageIndex = 0;
    //       this.selection.clear();
    //       this.isCheckedAll = false;
    //       this.subjectSelected = [];
    //       this.subjectSelectedId = [];
    //       this.getAllSubjectData();
    //     }
    //   },
    // });
    // this.subs.sink = this.subjectFilter.valueChanges.subscribe({
    //   next: (filter) => {
    //     if (filter && filter.length === 0) {
    //       this.filteredValue.subject_id = null;
    //       this.getAllSubjectData();
    //     } else {
    //       this.filteredValue.subject_id = filter[0] === 'All' ? null : filter;
    //       this.paginator.pageIndex = 0;
    //       this.selection.clear();
    //       this.isCheckedAll = false;
    //       this.subjectSelected = [];
    //       this.subjectSelectedId = [];
    //       this.getAllSubjectData();
    //     }
    //   },
    // });

    // this.subs.sink = this.typeOfGroupFilter.valueChanges.subscribe({
    //   next: (filter) => {
    //     if (filter && filter.length === 0) {
    //       this.filteredValue.type_of_group = null;
    //       this.getAllSubjectData();
    //     } else {
    //       this.filteredValue.type_of_group = filter[0] === 'All' ? null : filter;
    //       this.paginator.pageIndex = 0;
    //       this.selection.clear();
    //       this.isCheckedAll = false;
    //       this.subjectSelected = [];
    //       this.subjectSelectedId = [];
    //       this.getAllSubjectData();
    //     }
    //   },
    // });

    // this.subs.sink = this.typeOfInterventionFilter.valueChanges.subscribe({
    //   next: (filter) => {
    //     if (filter && filter.length === 0) {
    //       this.filteredValue.type_of_intervention = null;
    //       this.getAllSubjectData();
    //     } else {
    //       this.filteredValue.type_of_intervention = filter[0] === 'All' ? null : filter;
    //       this.paginator.pageIndex = 0;
    //       this.selection.clear();
    //       this.isCheckedAll = false;
    //       this.subjectSelected = [];
    //       this.subjectSelectedId = [];
    //       this.getAllSubjectData();
    //     }
    //   },
    // });

    // this.subs.sink = this.typeOfContractFilter.valueChanges.subscribe({
    //   next: (filter) => {
    //     if (filter && filter.length === 0) {
    //       this.filteredValue.type_of_contract = null;
    //       this.getAllSubjectData();
    //     } else {
    //       this.filteredValue.type_of_contract = filter[0] === 'All' ? null : filter;
    //       this.paginator.pageIndex = 0;
    //       this.selection.clear();
    //       this.isCheckedAll = false;
    //       this.subjectSelected = [];
    //       this.subjectSelectedId = [];
    //       this.getAllSubjectData();
    //     }
    //   },
    // });

    this.subs.sink = this.teacherFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      this.selection.clear();
      this.isCheckedAll = false;
      this.subjectSelected = [];
      this.subjectSelectedId = [];
      if (!name.match(symbol) && !name.match(symbol1)) {
        this.filteredValue.teacher_name = name;
        this.paginator.pageIndex = 0;
        this.getAllSubjectData();
      } else {
        this.teacherFilter.setValue('');
        this.filteredValue.teacher_name = '';
        this.paginator.pageIndex = 0;
        this.getAllSubjectData();
      }
    });
  }

  setSequenceFilter(filter) {
    const previousFilter = this.sequenceFilter.value;
    if ((filter && filter === 'All') || (previousFilter && previousFilter.length === 0)) {
      if (previousFilter && previousFilter.length > 0) {
        const all = ['All'];
        this.sequenceFilter.setValue(all);
      }
      this.clearSelectIfFilter();
      this.filteredValue.sequence_id = null;
      this.getAllSubjectData();
    } else {
      const temp = _.cloneDeep(this.sequenceFilter.value);
      const selectedFilter = [];
      temp.filter((res) => {
        if (res !== 'All') {
          selectedFilter.push(res);
        }
      });
      this.sequenceFilter.setValue(selectedFilter);
      this.clearSelectIfFilter();
      this.filteredValue.sequence_id = this.sequenceFilter.value;
      this.getAllSubjectData();
    }
  }
  setModulFilter(filter) {
    const previousFilter = this.moduleFilter.value;
    if ((filter && filter === 'All') || (previousFilter && previousFilter.length === 0)) {
      if (previousFilter && previousFilter.length > 0) {
        const all = ['All'];
        this.moduleFilter.setValue(all);
      }
      this.clearSelectIfFilter();
      this.filteredValue.module_id = null;
      this.getAllSubjectData();
    } else {
      const temp = _.cloneDeep(this.moduleFilter.value);
      const selectedFilter = [];
      temp.filter((res) => {
        if (res !== 'All') {
          selectedFilter.push(res);
        }
      });
      this.moduleFilter.setValue(selectedFilter);
      this.clearSelectIfFilter();
      this.filteredValue.module_id = this.moduleFilter.value;
      this.getAllSubjectData();
    }
  }

  setSubjectFilter(filter) {
    const previousFilter = this.subjectFilter.value;
    if ((filter && filter === 'All') || (previousFilter && previousFilter.length === 0)) {
      if (previousFilter && previousFilter.length > 0) {
        const all = ['All'];
        this.subjectFilter.setValue(all);
      }
      this.clearSelectIfFilter();
      this.filteredValue.subject_id = null;
      this.getAllSubjectData();
    } else {
      const temp = _.cloneDeep(this.subjectFilter.value);
      const selectedFilter = [];
      temp.filter((res) => {
        if (res !== 'All') {
          selectedFilter.push(res);
        }
      });
      this.subjectFilter.setValue(selectedFilter);
      this.clearSelectIfFilter();
      this.filteredValue.subject_id = this.subjectFilter.value;
      this.getAllSubjectData();
    }
  }

  setTypeGroupFilter(filter) {
    const previousFilter = this.typeOfGroupFilter.value;
    if ((filter && filter === 'All') || (previousFilter && previousFilter.length === 0)) {
      if (previousFilter && previousFilter.length > 0) {
        const all = ['All'];
        this.typeOfGroupFilter.setValue(all);
      }
      this.clearSelectIfFilter();
      this.filteredValue.type_of_group = null;
      this.getAllSubjectData();
    } else {
      const temp = _.cloneDeep(this.typeOfGroupFilter.value);
      const selectedFilter = [];
      temp.filter((res) => {
        if (res !== 'All') {
          selectedFilter.push(res);
        }
      });
      this.typeOfGroupFilter.setValue(selectedFilter);
      this.clearSelectIfFilter();
      this.filteredValue.type_of_group = this.typeOfGroupFilter.value;
      this.getAllSubjectData();
    }
  }

  setTypeInterventionFilter(filter) {
    const previousFilter = this.typeOfInterventionFilter.value;
    if ((filter && filter === 'All') || (previousFilter && previousFilter.length === 0)) {
      if (previousFilter && previousFilter.length > 0) {
        const all = ['All'];
        this.typeOfInterventionFilter.setValue(all);
      }
      this.clearSelectIfFilter();
      this.filteredValue.type_of_intervention = null;
      this.getAllSubjectData();
    } else {
      const temp = _.cloneDeep(this.typeOfInterventionFilter.value);
      const selectedFilter = [];
      temp.filter((res) => {
        if (res !== 'All') {
          selectedFilter.push(res);
        }
      });
      this.typeOfInterventionFilter.setValue(selectedFilter);
      this.clearSelectIfFilter();
      this.filteredValue.type_of_intervention = this.typeOfInterventionFilter.value;
      this.getAllSubjectData();
    }
  }

  setTypeContractFilter(filter) {
    const previousFilter = this.typeOfContractFilter.value;
    if ((filter && filter === 'All') || (previousFilter && previousFilter.length === 0)) {
      if (previousFilter && previousFilter.length > 0) {
        const all = ['All'];
        this.typeOfContractFilter.setValue(all);
      }
      this.clearSelectIfFilter();
      this.filteredValue.type_of_contract = null;
      this.getAllSubjectData();
    } else {
      const temp = _.cloneDeep(this.typeOfContractFilter.value);
      const selectedFilter = [];
      temp.filter((res) => {
        if (res !== 'All') {
          selectedFilter.push(res);
        }
      });
      this.typeOfContractFilter.setValue(selectedFilter);
      this.clearSelectIfFilter();
      this.filteredValue.type_of_contract = this.typeOfContractFilter.value;
      this.getAllSubjectData();
    }
  }

  clearSelectIfFilter() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
    this.subjectSelected = [];
    this.subjectSelectedId = [];
    this.paginator.pageIndex = 0;
    this.disabledActions = false;
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : null } : null;
    this.paginator.pageIndex = 0;
    this.getAllSubjectData();
  }

  resetFilter() {
    this.programId = this.route.snapshot.queryParamMap.get('programId');
    this.teacherFilter.setValue('', { emitEvent: false });
    this.sequenceFilter.setValue([]);
    this.moduleFilter.setValue([]);
    this.subjectFilter.setValue([]);
    this.typeOfGroupFilter.setValue([]);
    this.typeOfInterventionFilter.setValue([]);
    this.typeOfContractFilter.setValue([]);
    this.filteredValue = {
      sequence_id: null,
      module_id: null,
      subject_id: null,
      type_of_group: null,
      teacher_name: null,
      type_of_intervention: null,
      type_of_contract: null,
      scholar_season_id: null,
      schools_id: null,
      campuses_id: null,
      levels_id: null,
      program_id: this.programId,
      legal_entity_id: null,
      subject: null,
      status: null,
    };
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.paginator.pageIndex = 0;
    this.selection.clear();
    this.isCheckedAll = false;
    this.subjectSelected = [];
    this.subjectSelectedId = [];
    this.dataSelected = [];
    this.getAllSubjectData();
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
      this.isCheckedAll = false;
    } else {
      console.log('master else masuk');
      this.selection.clear();
      this.dataSelected = [];
      this.isCheckedAll = true;
      this.allDataForCheckbox = [];
      this.getDataAllForCheckbox(0);
    }
  }

  getDataAllForCheckbox(pageNumber) {
    console.log('GetAllData Masuk');

    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherManagementService.getAllTeacherSubjectsAssignTable(pagination, this.filteredValue).subscribe(
      (respData) => {
        if (respData && respData.length) {
          this.allDataForCheckbox.push(...respData);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
          this.isWaitingForResponse = false;
          if (this.isCheckedAll) {
            if (this.allDataForCheckbox && this.allDataForCheckbox.length) {
              this.allDataForCheckbox.forEach((element) => {
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
    if (row) {
      const dataFilter = this.dataSelected.filter((resp) => resp._id === row._id);
      if (dataFilter && dataFilter.length < 1) {
        this.dataSelected.push(row);
      } else {
        const indexFilter = this.dataSelected.findIndex((resp) => resp._id === row._id);
        this.dataSelected.splice(indexFilter, 1);
      }
    }
    const numSelected = this.selection.selected.length;
    if (numSelected > 0) {
      this.disabledActions = true;
    } else {
      this.disabledActions = false;
    }
    this.subjectSelected = [];
    this.subjectSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((subject) => {
      this.subjectSelected.push(subject);
      this.subjectSelectedId.push(subject._id);
    });
    console.log(this.dataSelected);
    console.log(this.subjectSelected);
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  getEntityForAssignTeacher() {
    let program;
    this.subs.sink = this.teacherManagementService.getOneProgram(this.programId).subscribe(
      (resp) => {
        program = _.cloneDeep(resp);
        this.getAllIntakeChanels(program);
      },
      (err) => {
        this.authService.postErrorLog(err);
      },
    );
  }

  getAllIntakeChanels(program) {
    const filter = {
      scholar_season_ids: program && program.scholar_season_id ? [program.scholar_season_id._id] : [],
      school: program && program.school_id ? [program.school_id.short_name] : [],
      campus: program && program.campus ? [program.campus.name] : [],
      level: program && program.level ? [program.level.name] : [],
      sectors: program && program.sector_id ? [program.sector_id.name] : [],
      speciality: program && program.speciality_id ? [program.speciality_id._id] : [],
    };
    console.log('PROGRAM', program.program);
    console.log(
      'GETONEPROGRAM',
      `${program.school_id.short_name} ${program.campus.name} ${program.level.name} ${program.sector_id ? program.sector_id.name : ''} ${
        program.speciality_id ? program.speciality_id.name : ''
      }`,
    );
    const programData = `${program.school_id.short_name} ${program.campus.name} ${program.level.name} ${
      program.sector_id ? program.sector_id.name : ''
    } ${program.speciality_id ? program.speciality_id.name : ''}`;
    this.subs.sink = this.financeService.GetAllIntakeChannelsAssignTeacher(filter).subscribe(
      (resp) => {
        // const intekeChanelData = [];
        resp.forEach((legal) => {
          console.log(
            'GETALLINTAKECHANELS',
            `${legal.school} ${legal.campus} ${legal.level} ${legal.sector_id ? legal.sector_id.name : ''} ${
              legal.speciality_id ? legal.speciality_id.name : ''
            }`,
          );
          const intekeChanelData = `${legal.school} ${legal.campus} ${legal.level} ${legal.sector_id ? legal.sector_id.name : ''} ${
            legal.speciality_id ? legal.speciality_id.name : ''
          }`;
          if (intekeChanelData === programData) {
            this.legalEntities.push(legal);
          }
        });
      },
      (err) => {
        this.authService.postErrorLog(err);
      },
    );
  }

  assignTeacher(rowData) {
    this.subs.sink = this.dialog
      .open(AddAssignTeacherDialogComponent, {
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        autoFocus: false,
        width: '600px',
        data: { type: 'assign_teacher', data: rowData, legalEntities: this.legalEntities },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getAllSubjectData();
        }
      });
  }

  deleteTeacherFromSubject(row) {
    const value = row.teacher_id.civility !== 'neutral' ? this.translate.instant(row.teacher_id.civility) : '';
    const firstName = row.teacher_id.first_name.charAt(0).toUpperCase() + row.teacher_id.first_name.slice(1);
    const lastName = row.teacher_id.last_name.toUpperCase();
    // subjectName: row.program_subject_id.name
    Swal.fire({
      title: this.translate.instant('DELETE_ORGANIZATION.TITLE'),
      html: this.translate.instant('CONFIRMDELETE', {
        value: value + ' ' + firstName + ' ' + lastName,
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('DeleteAssignedTeacher_S1.BUTTON1'),
      cancelButtonText: this.translate.instant('No'),
      allowOutsideClick: false,
      allowEnterKey: false,
    }).then((res) => {
      if (res.value) {
        const teacher_subject_id = row._id;
        const teacher_id = row.teacher_id._id;
        const number_of_group = row.number_of_group;
        const type_of_intervention_id = row.type_of_intervention_id._id;
        this.subs.sink = this.teacherManagementService
          .deleteTeacherFromSubject(teacher_subject_id, teacher_id, number_of_group, type_of_intervention_id)
          .subscribe({
            next: (resp) => {
              console.log(resp);
              Swal.fire({
                type: 'success',
                title: 'Bravo!',
                confirmButtonText: 'OK',
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.getAllSubjectData();
              });
            },
            error: (error) => {
              this.authService.postErrorLog(error);
              if (error['message'] === 'GraphQL error: Cant remove teacher that already have contract process') {
                Swal.fire({
                  title: this.translate.instant('DeleteAssignedTeacher_S2.TITLE'),
                  html: this.translate.instant('DeleteAssignedTeacher_S2.TEXT', {
                    civility: row.teacher_id.civility !== 'neutral' ? this.translate.instant(row.teacher_id.civility) : '',
                    firstName: row.teacher_id.first_name.charAt(0).toUpperCase() + row.teacher_id.first_name.slice(1),
                    lastName: row.teacher_id.last_name.toUpperCase(),
                  }),
                  type: 'info',
                  showConfirmButton: true,
                  confirmButtonText: this.translate.instant('DeleteAssignedTeacher_S2.BUTTON1'),
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
          });
      }
    });
  }

  exportTeacherAssignTable() {
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
    let filtered;
    console.log('filter', filter);
    if (this.dataSelected.length && !this.isCheckedAll) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      const billing = `"teacher_subject_ids":` + '[' + mappedUserId.toString() + ']';
      if (filter.length > 9) {
        filtered = filter.slice(0, 8) + billing + ',' + filter.slice(8);
      } else {
        filtered = filter.slice(0, 8) + billing + filter.slice(8);
      }
    } else if (this.isCheckedAll) {
      filtered = filter;
    }
    console.log('_fil', filtered);

    const exportTeachersData = `exportAssignTeacherTable/`;
    let fullURL;
    if (filtered) {
      fullURL = url + exportTeachersData + fileType + '/' + lang + '?' + filtered;
    } else {
      fullURL = url + exportTeachersData + fileType + '/' + lang;
    }
    console.log('fullURL', fullURL);
    element.href = encodeURI(fullURL);
    // console.log(element.href);
    element.target = '_blank';
    element.download = 'Teachers Export CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  cleanFilterDataDownload() {
    const filterData = _.cloneDeep(this.filteredValue);
    let filterQuery = '';
    let sequenceMap;
    let moduleMap;
    let subjectMap;
    let groupMap;
    let interventionMap;
    let contractMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'teacher_name' ||
          key === 'program_id' ||
          key === 'scholar_season_id' ||
          key === 'schools_id' ||
          key === 'campuses_id' ||
          key === 'levels_id' ||
          key === 'legal_entity_id' ||
          key === 'subject' ||
          key === 'status'
        ) {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        } else if (key === 'sequence_id') {
          sequenceMap = filterData.sequence_id.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"sequence_id":[${sequenceMap}]` : filterQuery + `"sequence_id":[${sequenceMap}]`;
        } else if (key === 'module_id') {
          moduleMap = filterData.module_id.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"module_id":[${moduleMap}]` : filterQuery + `"module_id":[${moduleMap}]`;
        } else if (key === 'subject_id') {
          subjectMap = filterData.subject_id.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"subject_id":[${subjectMap}]` : filterQuery + `"subject_id":[${subjectMap}]`;
        } else if (key === 'type_of_group') {
          groupMap = filterData.type_of_group.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"type_of_group":[${groupMap}]` : filterQuery + `"type_of_group":[${groupMap}]`;
        } else if (key === 'type_of_intervention') {
          interventionMap = filterData.type_of_intervention.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"type_of_intervention":[${interventionMap}]`
            : filterQuery + `"type_of_intervention":[${interventionMap}]`;
        } else if (key === 'type_of_contract') {
          contractMap = filterData.type_of_contract.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"type_of_contract":[${contractMap}]`
            : filterQuery + `"type_of_contract":[${contractMap}]`;
        }
      }
    });
    return 'filter={' + filterQuery + '}';
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngAfterViewInit() {
    // this.dataSource.sort = this.sort;
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          this.getAllSubjectData();
        }),
      )
      .subscribe();
  }
}
