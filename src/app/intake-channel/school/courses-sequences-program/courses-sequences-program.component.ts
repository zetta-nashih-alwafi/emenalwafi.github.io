import { FilterBreadcrumbService } from './../../../filter-breadcrumb/service/filter-breadcrumb.service';
import { FilterBreadCrumbItem, FilterBreadCrumbInput } from './../../../models/bread-crumb-filter.model';
import { ConnectSequencesDialogComponent } from './connect-sequences-dialog/connect-sequences-dialog.component';
import Swal from 'sweetalert2';
import { map, startWith, tap } from 'rxjs/operators';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { UntypedFormControl } from '@angular/forms';
import { SubSink } from 'subsink';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild, AfterViewInit, Input, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PermissionService } from 'app/service/permission/permission.service';
@Component({
  selector: 'ms-courses-sequences-program',
  templateUrl: './courses-sequences-program.component.html',
  styleUrls: ['./courses-sequences-program.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class CoursesSequencesProgramComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() schoolId;
  @Input() scholarSeasonId;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  private subs = new SubSink();

  selection = new SelectionModel<any>(true, []);
  dataSource = new MatTableDataSource([]);

  displayedColumns: string[] = [
    'select',
    'scholarSeason',
    'school',
    'campus',
    'level',
    'sector',
    'speciality',
    'template',
    'addedBy',
    'lastModifiedBy',
    'lastModificationDate',
    'hyperplanningStatus',
    'action',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'scholarSeasonFilter',
    'schoolFilter',
    'campusFilter',
    'levelFilter',
    'sectorFilter',
    'specialityFilter',
    'templateFilter',
    'addedByFilter',
    'lastModifiedByFilter',
    'lastModificationDateFilter',
    'hyperplanningStatusFilter',
    'actionFilter',
  ];
  dropdownHyperplanning = [
    { name: 'hyperplanning_status.up_to_date', key: true },
    { name: 'hyperplanning_status.not_up_to_date', key: false },
  ];
  isWaitingForResponse = false;
  isLoading = false;
  dataCount = 0;
  noData: any;
  isReset = false;

  campusFilter = new UntypedFormControl(['All']);
  levelFilter = new UntypedFormControl(['All']);
  sectorFilter = new UntypedFormControl(['All']);
  specialityFilter = new UntypedFormControl(['All']);
  hyperplanningStatusFilter = new UntypedFormControl('All');
  filteredValues = {
    school_id: null,
    campus: null,
    level: null,
    sector: null,
    speciality: null,
    scholar_season_id: null,
    is_should_have_speciality: null,
    hyperplanning_status: null,
  };
  allFilter = [];
  campusList = [];
  levelList = [];
  sectorList = [];
  specialityList = [];

  dataSelected = [];
  dataSelectedId = [];
  selectedType;
  pageSelected = [];
  isCheckedAll = false;
  allStudentForCheckbox = [];
  currentUser;
  isPermission;
  currentUserTypeId;
  hyperplanningStatus;
  isSelectAllCampus = true;
  isSelectAllLevel = true;
  isSelectAllSector = true;
  isSelectAllSpeciality = true;
  isSelectAllHyperPlanning = true;
  filterBreadcrumbData: FilterBreadCrumbItem[] = [];

  constructor(
    private courseSequenceService: CourseSequenceService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private authService: AuthService,
    public permission: PermissionService,
    private router: Router,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.getDropdownFilter(0);
    this.getAllProgram();
    this.initFilter();
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getAllProgram();
          }
        }),
      )
      .subscribe();
  }

  openTabDetail(data, id) {
    window.open('/template-sequences/program-sequence/' + id + '?programId=' + data._id + '&schoolId=' + this.schoolId, '_blank');
  }

  getAllProgram() {
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const school = this.schoolId ? this.schoolId : null;
    const scholarSeason = this.scholarSeasonId ? this.scholarSeasonId : null;
    this.filteredValues.school_id = [school];
    this.filteredValues.scholar_season_id = scholarSeason;
    this.isWaitingForResponse = true;
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.courseSequenceService.getAllProgram(pagination, this.filteredValues, userTypesList).subscribe(
      (resp) => {
        this.getHyperplanningLatestStatus();
        if (resp && resp.length) {
          this.dataSource.data = _.cloneDeep(resp);
          this.dataCount = resp[0] && resp[0].count_document ? resp[0].count_document : 0;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
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

  getHyperplanningLatestStatus() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.courseSequenceService.getHyperplanningLatestStatus(this.schoolId, this.scholarSeasonId).subscribe((resp) => {
      if (resp) {
        this.hyperplanningStatus = resp;
      }
      this.isWaitingForResponse = false;
    });
  }

  initFilter() {
    // this.subs.sink = this.specialityFilter.valueChanges.subscribe((filter) => {
    //   this.filteredValues.speciality = filter && filter.length > 0 ? filter : null;
    //   this.paginator.pageIndex = 0;
    //   this.clearSelect();
    //   if (!this.isReset) {
    //     this.getAllProgram();
    //   }
    // });
  }

  selectCampus(name) {
    const campus = this.specialityFilter.value;
    if (campus && campus.length) {
      if (name === 'All') {
        this.filteredValues.campus = null;
        this.campusFilter.setValue(['All']);
      } else {
        let filterCampus = false;
        if (campus?.length) {
          filterCampus = campus.filter((list) => list !== 'None' && list !== 'All');
        }
        if (filterCampus) {
          this.filteredValues.campus = filterCampus;
          this.specialityFilter.setValue(filterCampus);
        } else {
          this.filteredValues.campus = null;
          this.specialityFilter.setValue(null);
        }
      }
    } else {
      this.filteredValues.campus = null;
      this.specialityFilter.setValue(null);
    }

    this.paginator.pageIndex = 0;
    // this.clearSelect();
    if (!this.isReset) {
      this.getAllProgram();
    }
  }

  setFilterSelected(type) {
    switch (type) {
      case 'campus':
        if (this.isSelectAllCampus) {
          // this.clearSelect();
          this.selectAll('campus');
        } else {
          const tempCampus = _.cloneDeep(this.campusFilter.value);
          const idsCampus = [];
          tempCampus.filter((res) => {
            if (res) {
              idsCampus.push(res);
            }
          });
          const selectAll = idsCampus.some((res) => res === 'All');
          if (selectAll) {
            this.isSelectAllCampus = true;
            // this.clearSelect();
            this.selectAll('campus');
          } else {
            this.isSelectAllCampus = false;
            this.campusFilter.setValue(idsCampus);
            // this.clearSelect();
            const resultCampus = this.campusFilter.value;
            this.filteredValues.campus = resultCampus && resultCampus.length > 0 ? resultCampus : null;
            this.paginator.pageIndex = 0;
            this.getAllProgram();
          }
        }
        break;
      case 'level':
        if (this.isSelectAllLevel) {
          // this.clearSelect();
          this.selectAll('level');
        } else {
          this.isSelectAllLevel = false;
          const tempLevel = _.cloneDeep(this.levelFilter.value);
          const idsLevel = [];
          tempLevel.filter((res) => {
            if (res) {
              idsLevel.push(res);
            }
          });
          const selectAll = idsLevel.some((res) => res === 'All');
          if (selectAll) {
            this.isSelectAllLevel = true;
            // this.clearSelect();
            this.selectAll('level');
          } else {
            this.levelFilter.setValue(idsLevel);
            // this.clearSelect();
            const resultLevel = this.levelFilter.value;
            this.filteredValues.level = resultLevel && resultLevel.length > 0 ? resultLevel : null;
            this.paginator.pageIndex = 0;
            this.getAllProgram();
          }
        }
        break;
      case 'sector':
        if (this.isSelectAllSector) {
          // this.clearSelect();
          this.selectAll('sector');
        } else {
          const tempSector = _.cloneDeep(this.sectorFilter.value);
          const idsSector = [];
          tempSector.filter((res) => {
            if (res) {
              idsSector.push(res);
            }
          });

          const selectAll = idsSector.some((res) => res === 'All');
          if (selectAll) {
            this.isSelectAllSector = true;
            // this.clearSelect();
            this.selectAll('sector');
          } else {
            this.isSelectAllSector = false;
            this.sectorFilter.setValue(idsSector);
            // this.clearSelect();
            const resultSector = this.sectorFilter.value;
            this.filteredValues.sector = resultSector && resultSector.length > 0 ? resultSector : null;
            this.paginator.pageIndex = 0;
            this.getAllProgram();
          }
        }
        break;
      default:
        break;
    }
  }

  selectHyperPlanning(name) {
    if (name === 'All') {
      this.hyperplanningStatusFilter.setValue('All');
      this.filteredValues.hyperplanning_status = null;
    } else {
      this.hyperplanningStatusFilter.setValue(name);
      this.filteredValues.hyperplanning_status = name;
    }

    this.paginator.pageIndex = 0;
    // this.clearSelect();
    if (!this.isReset) {
      this.getAllProgram();
    }
  }

  selectSpeciality(name) {
    const speciality = this.specialityFilter.value;
    if (speciality && speciality.length > 0) {
      if (name === 'None') {
        this.specialityFilter.setValue(['None']);
        this.filteredValues.speciality = null;
        this.filteredValues.is_should_have_speciality = false;
      } else if (name === 'All') {
        this.specialityFilter.setValue(['All']);
        this.filteredValues.speciality = null;
        this.filteredValues.is_should_have_speciality = null;
      } else if (name !== 'None' && name !== 'All') {
        const filterSpeciality = speciality.filter((list) => list !== 'None' && list !== 'All');
        if (filterSpeciality) {
          this.specialityFilter.setValue(filterSpeciality);
          this.filteredValues.speciality = filterSpeciality;
          this.filteredValues.is_should_have_speciality = true;
        }
      }
    } else {
      this.specialityFilter.setValue(null);
      this.filteredValues.speciality = null;
      this.filteredValues.is_should_have_speciality = null;
    }
    this.paginator.pageIndex = 0;
    // this.clearSelect();
    if (!this.isReset) {
      this.getAllProgram();
    }
  }

  clearSelect() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.pageSelected = [];
    this.allStudentForCheckbox = [];
  }
  getDropdownFilter(pageNumber) {
    this.campusList = [];
    this.isLoading = true;
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    const school = this.schoolId ? this.schoolId : null;
    const scholarSeason = this.scholarSeasonId ? this.scholarSeasonId : null;
    this.filteredValues.school_id = [school];
    this.filteredValues.scholar_season_id = scholarSeason;

    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.courseSequenceService.getAllProgram(pagination, this.filteredValues, userTypesList).subscribe(
      (info) => {
        if (info && info.length) {
          this.allFilter.push(...info);
          const page = pageNumber + 1;
          this.getDropdownFilter(page);
        } else {
          this.isLoading = false;
          const allData = _.cloneDeep(this.allFilter);
          if (allData && allData.length) {
            allData.forEach((element) => {
              if (element && element.campus) {
                this.campusList.push(element.campus);
              }
              if (element && element.level) {
                this.levelList.push(element.level);
              }
              if (element && element.sector_id) {
                this.sectorList.push(element.sector_id);
              }
              if (element && element.speciality_id) {
                this.specialityList.push(element.speciality_id);
              }
            });
            this.uniqByFilter();
          }
        }
      },
      (err) => {
        this.isLoading = false;
        // Record error log
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

  uniqByFilter() {
    if (this.campusList && this.campusList.length > 0) {
      this.campusList = _.uniqBy(this.campusList, '_id');
      this.campusList = this.campusList.sort((a, b) => {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
    }
    if (this.levelList && this.levelList.length > 0) {
      this.levelList = _.uniqBy(this.levelList, '_id');
      this.levelList = this.levelList.sort((a, b) => {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
    }
    if (this.sectorList && this.sectorList.length > 0) {
      this.sectorList = _.uniqBy(this.sectorList, '_id');
      this.sectorList = this.sectorList.sort((a, b) => {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
    }
    if (this.specialityList && this.specialityList.length > 0) {
      this.specialityList = _.uniqBy(this.specialityList, '_id');
      this.specialityList = this.specialityList.sort((a, b) => {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
    }
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
  }

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
      if (this.isCheckedAll) {
        this.getDataAllForCheckbox(0);
      }
    }
  }
  getDataAllForCheckbox(pageNumber) {
    this.isWaitingForResponse = true;

    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.filteredValues.scholar_season_id = this.scholarSeasonId;
    this.filteredValues.school_id = [this.schoolId];

    this.subs.sink = this.courseSequenceService.getAllProgram(pagination, this.filteredValues, this.currentUserTypeId).subscribe(
      (info) => {
        if (info && info.length) {
          this.allStudentForCheckbox.push(...info);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
          this.isWaitingForResponse = false;
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
        this.isWaitingForResponse = false;
        // Record error log
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

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  showOptions(info, row) {
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
    this.selectedType = info;
  }

  resetFilter() {
    this.clearSelect();
    this.resetterFilter();
    this.filteredValues = {
      school_id: null,
      campus: null,
      level: null,
      sector: null,
      speciality: null,
      scholar_season_id: null,
      is_should_have_speciality: null,
      hyperplanning_status: null,
    };
    this.paginator.pageIndex = 0;
    this.isReset = true;
    this.filterBreadcrumbData = [];
    this.getAllProgram();
  }

  resetterFilter() {
    this.campusFilter.setValue(['All'], { emitEvent: false });
    this.levelFilter.setValue(['All'], { emitEvent: false });
    this.sectorFilter.setValue(['All'], { emitEvent: false });
    this.specialityFilter.setValue(['All'], { emitEvent: false });
    this.hyperplanningStatusFilter.setValue('All', { emitEvent: false });
    this.isSelectAllCampus = true;
    this.isSelectAllLevel = true;
    this.isSelectAllSector = true;
    this.isSelectAllSpeciality = true;
    this.isSelectAllHyperPlanning = true;
  }

  connectTemplate() {
    if (this.dataSelected && this.dataSelected.length <= 0) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('CONTRACT_PROCESS_FORM.Program') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
      return;
    }
    this.subs.sink = this.dialog
      .open(ConnectSequencesDialogComponent, {
        width: '700px',
        disableClose: true,
        minHeight: '16vh',
        panelClass: 'certification-rule-pop-up',
        data: this.dataSelected,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.clearSelect();
          this.getAllProgram();
        }
      });
  }

  updateHyperplanning() {
    let listId;
    if (!this.dataSelected || !this.dataSelected.length) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('CONTRACT_PROCESS_FORM.Program') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
      return;
    }
    if (this.dataSelected && this.dataSelected.length) {
      listId = this.dataSelected.map((list) => list._id);
    }

    this.isWaitingForResponse = true;
    this.subs.sink = this.courseSequenceService.sendProgramsToHyperplanning(listId).subscribe(
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
        this.clearSelect();
        this.getAllProgram();
      },
      (error) => {
        this.isWaitingForResponse = false;
        // Record error log
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

  assignTeacher(value) {
    const programId = value._id;
    const url = this.router.createUrlTree(['/schools/teachers/assign-teachers'], { queryParams: { programId: programId } });

    window.open(url.toString(), '_blank');
  }

  transformDate(data) {
    if (data && data.date) {
      const date = data.date;
      const time = data.time ? data.time : '15:59';
      const localDate = this.parseUTCToLocalPipe.transformDate(date, time);
      if (localDate !== 'Invalid date') {
        return localDate;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  translateTime(time) {
    if (time) {
      const timeLocal = this.parseUTCToLocalPipe.transform(time);
      return timeLocal && timeLocal !== 'Invalid date' && moment(timeLocal, 'HH:mm').format('HH[h]mm') !== 'Invalid date'
        ? moment(timeLocal, 'HH:mm').format('HH[h]mm')
        : '00h00';
    } else {
      return '';
    }
  }

  translateDate(date, time) {
    if (date && time) {
      return this.parseUTCToLocalPipe.transformDate(date, time);
    } else {
      return '';
    }
  }

  selectAll(type) {
    const searchTxt = ['All'];
    if (type === 'campus') {
      if (this.campusList && this.campusList.length) {
        if (this.isSelectAllCampus) {
          this.isSelectAllCampus = false;
          const idsCampus = [];
          const tempCampus = _.cloneDeep(this.campusFilter.value);
          tempCampus.filter((res) => {
            if (res !== 'All') {
              idsCampus.push(res);
            }
          });

          this.filteredValues.campus = idsCampus && idsCampus.length > 0 ? idsCampus : null;
          this.campusFilter.setValue(idsCampus);
        } else {
          this.isSelectAllCampus = true;
          this.campusFilter.setValue(searchTxt);
          this.filteredValues.campus = null;
        }
      } else {
        if (this.isSelectAllCampus) {
          this.campusFilter.setValue(searchTxt);
          this.isSelectAllCampus = !this.isSelectAllCampus;
        } else {
          this.campusFilter.setValue(null);
          this.isSelectAllCampus = !this.isSelectAllCampus;
        }
      }

      // this.clearSelect();
      this.paginator.pageIndex = 0;
      this.getAllProgram();
    } else if (type === 'level') {
      if (this.levelList && this.levelList.length) {
        if (this.isSelectAllLevel) {
          this.isSelectAllLevel = false;
          const idsLevel = [];
          const tempLevel = _.cloneDeep(this.levelFilter.value);
          tempLevel.filter((res) => {
            if (res !== 'All') {
              idsLevel.push(res);
            }
          });

          this.filteredValues.level = idsLevel && idsLevel.length > 0 ? idsLevel : null;
          this.levelFilter.setValue(idsLevel);
        } else {
          this.isSelectAllLevel = true;
          this.levelFilter.setValue(searchTxt);
          this.filteredValues.level = null;
        }
      } else {
        if (this.isSelectAllLevel) {
          this.levelFilter.setValue(searchTxt);
          this.isSelectAllLevel = !this.isSelectAllLevel;
        } else {
          this.levelFilter.setValue(null);
          this.isSelectAllLevel = !this.isSelectAllLevel;
        }
      }

      // this.clearSelect();
      this.paginator.pageIndex = 0;
      this.getAllProgram();
    } else if (type === 'sector') {
      if (this.sectorList && this.sectorList.length) {
        if (this.isSelectAllSector) {
          this.isSelectAllSector = false;
          const idsSector = [];
          const tempSector = _.cloneDeep(this.sectorFilter.value);
          tempSector.filter((res) => {
            if (res !== 'All') {
              idsSector.push(res);
            }
          });
          this.filteredValues.sector = idsSector && idsSector.length > 0 ? idsSector : null;
          this.sectorFilter.setValue(idsSector);
        } else {
          this.isSelectAllSector = true;
          this.sectorFilter.setValue(searchTxt);
          this.filteredValues.sector = null;
        }
      } else {
        if (this.isSelectAllSector) {
          this.sectorFilter.setValue(searchTxt);
          this.isSelectAllSector = !this.isSelectAllSector;
        } else {
          this.sectorFilter.setValue(null);
          this.isSelectAllSector = !this.isSelectAllSector;
        }
      }

      // this.clearSelect();
      this.paginator.pageIndex = 0;
      this.getAllProgram();
    } else if (type === 'speciality') {
      if (this.specialityList && this.specialityList.length) {
        if (this.isSelectAllSpeciality) {
          this.isSelectAllSpeciality = false;
          this.specialityFilter.setValue(null);
        } else {
          this.isSelectAllSpeciality = true;
          this.specialityFilter.setValue(searchTxt);
        }
      } else {
        if (this.isSelectAllSpeciality) {
          this.specialityFilter.setValue(searchTxt);
          this.isSelectAllSpeciality = !this.isSelectAllSpeciality;
        } else {
          this.specialityFilter.setValue(null);
          this.isSelectAllSpeciality = !this.isSelectAllSpeciality;
        }
      }

      // this.clearSelect();
      this.paginator.pageIndex = 0;
      this.getAllProgram();
    }
  }
  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'campus', // name of the key in the object storing the filter
        column: 'Program_Table_School_Detail.Campus', // name of the column in the table or the field if super filter
        isMultiple: true, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | superFilter)
        filterList: this.campusList, // the array/list holding the dropdown options
        filterRef: this.campusFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'name', // the key displayed in the html (only applicable to array of objects)
        savedValue: '_id', // the value saved when user select an option (e.g. _id)
        resetValue: ['All'],
      },
      {
        type: 'table_filter',
        name: 'level',
        column: 'Program_Table_School_Detail.Level',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.levelList,
        filterRef: this.levelFilter,
        isSelectionInput: true,
        displayKey: 'name',
        savedValue: '_id',
        resetValue: ['All'],
      },
      {
        type: 'table_filter',
        name: 'sector',
        column: 'Program_Table_School_Detail.Sector',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.sectorList,
        filterRef: this.sectorFilter,
        isSelectionInput: true,
        displayKey: 'name',
        savedValue: '_id',
        resetValue: ['All'],
      },
      {
        type: 'table_filter',
        name: 'speciality',
        column: 'Program_Table_School_Detail.Speciality',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.specialityList,
        filterRef: this.specialityFilter,
        isSelectionInput: true,
        displayKey: 'name',
        savedValue: '_id',
        resetValue: ['All'],
      },
      {
        type: 'table_filter',
        name: 'hyperplanning_status',
        column: 'Hyperplanning Status',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.dropdownHyperplanning,
        filterRef: this.hyperplanningStatusFilter,
        isSelectionInput: true,
        displayKey: 'name',
        savedValue: 'key',
        resetValue: 'All',
      },
    ];

    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }
  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
    if (filterItem.name === 'speciality') {
      this.filteredValues.is_should_have_speciality = null;
    }
    this.paginator.pageIndex = 0;
    this.clearSelect();
    this.getAllProgram();
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
