import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { TeacherManagementService } from 'app/service/teacher-management/teacher-management.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { map, startWith, tap } from 'rxjs/operators';
import { MatSort, Sort } from '@angular/material/sort';
import { UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'ms-user-details-my-interventions-tab',
  templateUrl: './user-details-my-interventions-tab.component.html',
  styleUrls: ['./user-details-my-interventions-tab.component.scss']
})
export class UserDetailsMyInterventionsTabComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  private subs = new SubSink();

  @Input() teacherId;

  isWaitingForResponse: boolean = false;
  programList = [];
  legalEntityList = [];
  typeOfInterventionList = [];
  subjectList = [];
  sequenceList = [];
  typeOfContractList = [];

  programFilter = new UntypedFormControl(null);
  legalEntityFilter = new UntypedFormControl(null);
  typeOfContractFilter = new UntypedFormControl(null);
  subjectFilter = new UntypedFormControl(null);
  typeOfInterventionFilter = new UntypedFormControl(null);
  sequenceFilter = new UntypedFormControl(null);

  displayedColumns: string[] = [
    'program', 
    'legalEntity', 
    'sequence', 
    'subject', 
    'volumeOfHours', 
    'typeOfContract', 
    'hourlyRate', 
    'typeOfIntervention'
  ];
  filterColumns: string[] = [
    'programFilter',
    'legalEntityFilter',
    'sequenceFilter',
    'subjectFilter',
    'volumeOfHoursFilter',
    'typeOfContractFilter',
    'hourlyRateFilter',
    'typeOfInterventionFilter',
  ];

  filteredValue = {
    sequence_id: null,
    subject_id: null,
    type_of_intervention: null,
    type_of_contract: null,
    program_id: null,
    legal_entity_id: null,
    teacher_id: null,
  };

  tempDataFilter = {
    sequence_id: null,
    subject_id: null,
    type_of_intervention: null,
    type_of_contract: null,
    program_id: null,
    legal_entity_id: null,
    teacher_id: null,
  };

  isReset = false;

  currentUser: any;
  sortValue = null;
  dataSource = new MatTableDataSource([]);

  noData;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataCount: number = 0;

  constructor(
    private teacherManagementService: TeacherManagementService,
    private authService: AuthService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getLocalStorageUser();
    this.filteredValue.teacher_id = this.teacherId;

    this.getAllProgramSequenceDropdown();
    this.getAllTeacherSubjectLegalEntityDropdown();
    this.getAllTeacherSequenceDropdown();
    this.getAllProgramSubjectDropdown();
    this.getDropdownStatic();
    this.getAllTypeOfInterventionDropdown();
    this.getAllTeacherSubjects();

    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getAllTypeOfInterventionDropdown();
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.teacherId) {
      this.resetSelection();
    }
  }

  cleanFilterData(filteredValues?) {
    const filterData = _.cloneDeep(filteredValues);
    Object.keys(filterData).forEach((key) => {
      if (!filterData[key] && filterData[key] !== false || !filterData[key].length) {
        delete filterData[key];
      }
    });

    return filterData;
  }

  getAllTeacherSubjects(type?) {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    const filter = this.cleanFilterData(this.filteredValue);

    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.teacherManagementService.getAllTeacherSubjects(pagination, filter, this.sortValue, userTypesList).subscribe({
      next: (resp: any) => {
        this.dataSource.data = _.cloneDeep(resp);
        this.dataCount = resp && resp.length ? resp[0].count_document : 0;
        this.isWaitingForResponse = false;
        this.noData = this.dataSource.connect().pipe(map((data) => data.length === 0));
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
              this.legalEntityList.push(element);
            }
          });
          this.legalEntityList = _.uniqBy(this.legalEntityList, '_id');
          this.legalEntityList = _.sortBy(this.legalEntityList, 'legal_entity_name');
        } else {
          this.legalEntityList = [];
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

  getDropdownStatic() {
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

  getAllTypeOfInterventionDropdown() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherManagementService.getAllTypeOfInterventionDropdown().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.typeOfInterventionList = [];
          resp.forEach((element) => {
            if (element && element.type_of_intervention) {
              this.typeOfInterventionList.push(element.type_of_intervention);
            }
          });
          this.typeOfInterventionList = this.typeOfInterventionList.filter((val, ind, arr) => arr.indexOf(val) === ind);
          this.typeOfInterventionList = _.sortBy(this.typeOfInterventionList);
          this.typeOfInterventionList = this.typeOfInterventionList.map((resp) => {
            return {
              value: resp,
              label: this.translate.instant(resp),
            };
          });
        } else {
          this.typeOfInterventionList = [];
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.authService.postErrorLog(err);
      },
    );
  }

  setProgramFilter() {
    const isSame = JSON.stringify(this.tempDataFilter.program_id) === JSON.stringify(this.programFilter?.value);
    if (isSame) {
      return;
    } else if (this.programFilter?.value?.length) {
      this.filteredValue.program_id = this.programFilter?.value;
      this.tempDataFilter.program_id = this.programFilter?.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTeacherSubjects();
      }
    } else {
      if (this.tempDataFilter.program_id?.length && !this.programFilter?.value?.length) {
        this.filteredValue.program_id = this.programFilter?.value;
        this.tempDataFilter.program_id = null;
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
    const isSame = JSON.stringify(this.tempDataFilter.legal_entity_id) === JSON.stringify(this.legalEntityFilter.value);
    if (isSame) {
      return;
    } else if (this.legalEntityFilter.value?.length) {
      this.filteredValue.legal_entity_id = this.legalEntityFilter.value;
      this.tempDataFilter.legal_entity_id = this.legalEntityFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTeacherSubjects();
      }
    } else {
      if (this.tempDataFilter.legal_entity_id?.length && !this.legalEntityFilter.value?.length) {
        this.filteredValue.legal_entity_id = this.legalEntityFilter.value;
        this.tempDataFilter.legal_entity_id = null;
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
    const isSame = JSON.stringify(this.tempDataFilter.sequence_id) === JSON.stringify(this.sequenceFilter.value);
    if (isSame) {
      return;
    } else if (this.sequenceFilter.value?.length) {
      this.filteredValue.sequence_id = this.sequenceFilter.value;
      this.tempDataFilter.sequence_id = this.sequenceFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTeacherSubjects();
      }
    } else {
      if (this.tempDataFilter.sequence_id?.length && !this.sequenceFilter.value?.length) {
        this.filteredValue.sequence_id = this.sequenceFilter.value;
        this.tempDataFilter.sequence_id = null;
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
    const isSame = JSON.stringify(this.tempDataFilter.subject_id) === JSON.stringify(this.subjectFilter.value);
    if (isSame) {
      return;
    } else if (this.subjectFilter.value?.length) {
      this.filteredValue.subject_id = this.subjectFilter.value;
      this.tempDataFilter.subject_id = this.subjectFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTeacherSubjects();
      }
    } else {
      if (this.tempDataFilter.subject_id?.length && !this.subjectFilter.value?.length) {
        this.filteredValue.subject_id = this.subjectFilter.value;
        this.tempDataFilter.subject_id = null;
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
    const isSame = JSON.stringify(this.tempDataFilter.type_of_contract) === JSON.stringify(this.typeOfContractFilter.value);
    if (isSame) {
      return;
    } else if (this.typeOfContractFilter.value?.length) {
      this.filteredValue.type_of_contract = this.typeOfContractFilter.value;
      this.tempDataFilter.type_of_contract = this.typeOfContractFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTeacherSubjects();
      }
    } else {
      if (this.tempDataFilter.type_of_contract?.length && !this.typeOfContractFilter.value?.length) {
        this.filteredValue.type_of_contract = this.typeOfContractFilter.value;
        this.tempDataFilter.type_of_contract = null;
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
    const isSame = JSON.stringify(this.tempDataFilter.type_of_intervention) === JSON.stringify(this.typeOfInterventionFilter.value);
    if (isSame) {
      return;
    } else if (this.typeOfInterventionFilter.value?.length) {
      this.filteredValue.type_of_intervention = this.typeOfInterventionFilter.value;
      this.tempDataFilter.type_of_intervention = this.typeOfInterventionFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTeacherSubjects();
      }
    } else {
      if (this.tempDataFilter.type_of_intervention?.length && !this.typeOfInterventionFilter.value?.length) {
        this.filteredValue.type_of_intervention = this.typeOfInterventionFilter.value;
        this.tempDataFilter.type_of_intervention = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllTeacherSubjects();
        }
      } else {
        return;
      }
    }
  }

  resetSelection() {
    this.programFilter = new UntypedFormControl(null);
    this.legalEntityFilter = new UntypedFormControl(null);
    this.typeOfContractFilter = new UntypedFormControl(null);
    this.subjectFilter = new UntypedFormControl(null);
    this.typeOfInterventionFilter = new UntypedFormControl(null);
    this.sequenceFilter = new UntypedFormControl(null);

    this.tempDataFilter = {
      sequence_id: null,
      subject_id: null,
      type_of_intervention: null,
      type_of_contract: null,
      program_id: null,
      legal_entity_id: null,
      teacher_id: null,
    };

    this.filteredValue = {
      sequence_id: null,
      subject_id: null,
      type_of_intervention: null,
      type_of_contract: null,
      program_id: null,
      legal_entity_id: null,
      teacher_id: this.teacherId,
    };

    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.paginator.pageIndex = 0;
    this.getAllTeacherSubjects();
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : null } : null;
    this.paginator.pageIndex = 0;
    this.getAllTeacherSubjects();
  }

  isAllDropdownSelected(type) {
    if (type === 'program') {
      const selected = this.programFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.programList.length;
      return isAllSelected;
    } else if (type === 'legalEntity') {
      const selected = this.legalEntityFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.legalEntityList.length;
      return isAllSelected;
    } else if (type === 'sequence') {
      const selected = this.sequenceFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.sequenceList.length;
      return isAllSelected;
    } else if (type === 'subject') {
      const selected = this.subjectFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.subjectList.length;
      return isAllSelected;
    } else if (type === 'contract') {
      const selected = this.typeOfContractFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.typeOfContractList.length;
      return isAllSelected;
    } else if (type === 'intervention') {
      const selected = this.typeOfInterventionFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.typeOfInterventionList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'program') {
      const selected = this.programFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.programList.length;
      return isIndeterminate;
    } else if (type === 'legalEntity') {
      const selected = this.legalEntityFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.legalEntityList.length;
      return isIndeterminate;
    } else if (type === 'sequence') {
      const selected = this.sequenceFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.sequenceList.length;
      return isIndeterminate;
    } else if (type === 'subject') {
      const selected = this.subjectFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.subjectList.length;
      return isIndeterminate;
    } else if (type === 'contract') {
      const selected = this.typeOfContractFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.typeOfContractList.length;
      return isIndeterminate;
    } else if (type === 'intervention') {
      const selected = this.typeOfInterventionFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.typeOfInterventionList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'program') {
      if (event.checked) {
        const programData = this.programList.map((el) => el._id);
        this.programFilter.patchValue(programData);
      } else {
        this.programFilter.patchValue(null);
      }
    } else if (type === 'legalEntity') {
      if (event.checked) {
        const legalData = this.legalEntityList.map((el) => el._id);
        this.legalEntityFilter.patchValue(legalData);
      } else {
        this.legalEntityFilter.patchValue(null);
      }
    } else if (type === 'sequence') {
      if (event.checked) {
        const sequenceData = this.sequenceList.map((el) => el.name);
        this.sequenceFilter.patchValue(sequenceData);
      } else {
        this.sequenceFilter.patchValue(null);
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
        const contractData = this.typeOfContractList.map((el) => el.value);
        this.typeOfContractFilter.patchValue(contractData);
      } else {
        this.typeOfContractFilter.patchValue(null);
      }
    } else if (type === 'intervention') {
      if (event.checked) {
        const interventionData = this.typeOfInterventionList.map((el) => el.value);
        this.typeOfInterventionFilter.patchValue(interventionData);
      } else {
        this.typeOfInterventionFilter.patchValue(null);
      }
    }
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          this.getAllTeacherSubjects();
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
