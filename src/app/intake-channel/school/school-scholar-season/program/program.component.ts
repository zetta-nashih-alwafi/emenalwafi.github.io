import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { UntypedFormControl } from '@angular/forms';
import { AddProgramDialogComponent } from './add-program-dialog/add-program-dialog.component';
import { environment } from 'environments/environment';
import { PermissionService } from 'app/service/permission/permission.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';

type ProgramTableActions = 'export' | null;

@Component({
  selector: 'ms-program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.scss'],
})
export class ProgramComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() schoolId: any;
  @Input() scholarSeasonId: any;
  @Input() schoolData: any;
  @Input() scholarSeason: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private subs = new SubSink();

  selection = new SelectionModel<any>(true, []);
  dataSource = new MatTableDataSource([]);
  titleData: any;
  noData: any;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  displayedColumns: string[] = ['select', 'scholarSeason', 'school', 'campus', 'level', 'sector', 'speciality', 'action'];
  filterColumns: string[] = [
    'selectFilter',
    'scholarSeasonFilter',
    'schoolFilter',
    'campusFilter',
    'levelFilter',
    'sectorFilter',
    'specialityFilter',
    'actionFilter',
  ];

  isWaitingForResponse = false;
  isClickingExport = false;
  dataCount = 0;
  isCheckedAll: boolean;
  buttonClicked: ProgramTableActions = null;
  dataProgramForExport: any[] = [];
  dataUnselect: any[] = [];
  dataSelected: any[] = [];
  dataSelectedId: any[];
  userSelected = [];
  userSelectedId = [];
  pageSelected = [];
  allStudentForCheckbox = [];
  disabledExport: any;
  selectType: any;

  campusFilterCtrl = new UntypedFormControl(['All']);
  levelFilterCtrl = new UntypedFormControl(['All']);
  sectorFilterCtrl = new UntypedFormControl(['All']);
  specialityFilterCtrl = new UntypedFormControl(['All']);

  campusList: any = [];
  levelList: any = [];
  sectorList: any = [];
  specialityList: any = [];
  allFilter: any = [];

  filteredValues = {
    scholar_season_id: '',
    school_id: [],
    campus: null,
    level: null,
    speciality: null,
    sector: null,
  };
  programsDatas: any;
  isLoading: boolean;
  timeOutVal: any;

  // ======== Start 'select all' variables ========
  // On the first init, the all options are selected.
  isSelectAllCampus = true;
  isSelectAllLevel = true;
  isSelectAllSector = true;
  isSelectAllSpeciality = true;
  isPermission: any;
  currentUserTypeId: any;
  // ======== End 'select all' variables ========
  filterBreadcrumbData: any[] = [];

  currentUser: any;
  constructor(
    private intakeService: IntakeChannelService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private http: HttpClient,
    public permission: PermissionService,
    private authService: AuthService,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.getDropdownFilter(0);
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getDataProgramSchoolScholarSeason();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataProgramForExport = [];
      this.dataUnselect = [];
      this.dataSelected = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
      this.filterBreadcrumbData = [];
    } else {
      this.selection.clear();
      this.dataProgramForExport = [];
      this.dataUnselect = [];
      this.dataSelected = [];
      this.allStudentForCheckbox = [];
      this.filterBreadcrumbData = [];
      this.isCheckedAll = true;
      this.dataSource.data.map((row) => {
        console.log('ROW ', row);
        if (!this.dataUnselect.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
    }
  }

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
          const idx = this.dataUnselect.findIndex((list) => list === row._id);
          this.dataUnselect.splice(idx, 1);
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
      console.log('dataSelected 123', this.dataSelected);
      const numSelected = this.selection.selected.length;
      if (numSelected > 0) {
        this.disabledExport = false;
      } else {
        this.disabledExport = true;
      }
      this.userSelected = [];
      this.userSelectedId = [];
      this.dataSelectedId = [];
      this.selectType = info;
      const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
      data.map((user) => {
        this.userSelected.push(user);
        this.userSelectedId.push(user._id);
        this.dataSelectedId.push(user._id);
      });
      console.log('dataSelectedId', this.dataSelectedId);
    }
  }

  resetFilter() {
    this.isReset = true;
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataProgramForExport = [];
    this.filterBreadcrumbData = [];
    this.dataUnselect = [];
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.paginator.pageIndex = 0;
    this.campusFilterCtrl.setValue(['All'], { emitEvent: false });
    this.levelFilterCtrl.setValue(['All'], { emitEvent: false });
    this.sectorFilterCtrl.setValue(['All'], { emitEvent: false });
    this.specialityFilterCtrl.setValue(['All'], { emitEvent: false });

    const school_id = [];
    if (this.schoolId) {
      school_id.push(this.schoolId);
    }

    this.filteredValues = {
      scholar_season_id: this.scholarSeasonId,
      school_id,
      campus: null,
      level: null,
      speciality: null,
      sector: null,
    };

    this.isSelectAllCampus = true;
    this.isSelectAllLevel = true;
    this.isSelectAllSector = true;
    this.isSelectAllSpeciality = true;

    this.getDataProgramSchoolScholarSeason();
  }

  getDataProgramSchoolScholarSeason(from?) {
    this.isWaitingForResponse = true;

    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.filteredValues.scholar_season_id = this.scholarSeasonId;
    this.filteredValues.school_id = [this.schoolId];

    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.intakeService.GetAllSelectedSchoolProgramScholarSeason(this.filteredValues, pagination, userTypesList).subscribe(
      (res) => {
        // console.log(res);
        if (res && res.length > 0) {
          // this.checkDataCreateFromZero(this.scholarSeason);
          const result = _.cloneDeep(res);
          this.programsDatas = _.cloneDeep(result);
          this.dataSource.data = result;
          this.paginator.length = result[0].count_document;
          this.dataCount = result[0].count_document;
          this.disabledExport = true;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
          this.disabledExport = true;
        }
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
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
        } else {
          this.swalError(err);
        }
      },
    );
  }

  updateSchool() {
    if (this.schoolData && this.schoolData._id) {
      const payload = {
        empty_scholar_seasons: this.schoolData.empty_scholar_seasons,
      };
      this.subs.sink = this.intakeService.updateCommonCandidateSchool(this.schoolData._id, payload).subscribe(
        (resp) => {},
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          if (err['message'] === 'GraphQL error: Short name already taken!') {
            Swal.fire({
              title: this.translate.instant('USER_S15.TITLE'),
              html: this.translate.instant('duplicate_school'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('USER_S15.OK'),
            });
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
  }

  checkDataCreateFromZero(scholarSeason) {
    let isThere = false;
    if (this.schoolData && this.schoolData.empty_scholar_seasons && this.schoolData.empty_scholar_seasons.length) {
      if (scholarSeason && scholarSeason._id) {
        this.schoolData.empty_scholar_seasons.forEach((element, idx) => {
          if (element._id === scholarSeason._id) {
            this.schoolData.empty_scholar_seasons.splice(idx, 1);
            isThere = true;
          }
        });
        if (isThere) {
          this.updateSchool();
        }
      }
    }
  }

  getDropdownFilter(pageNumber) {
    // this.resetFilterDropdown();
    this.isWaitingForResponse = true;
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.filteredValues.scholar_season_id = this.scholarSeasonId;
    this.filteredValues.school_id = [this.schoolId];

    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.intakeService
      .GetAllSelectedSchoolProgramScholarSeasonFilter(this.filteredValues, pagination, userTypesList)
      .subscribe(
        (info) => {
          if (info && info.length) {
            this.isWaitingForResponse = true;
            this.allFilter.push(...info);
            const page = pageNumber + 1;
            this.getDropdownFilter(page);
          } else {
            this.isWaitingForResponse = false;
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
              // console.log('_filter list', this.campusList, this.sectorList, this.levelList, this.specialityList);
            }
          }
        },
        (error) => {
          this.authService.postErrorLog(error);
          this.isWaitingForResponse = false;
          this.isLoading = false;
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

  uniqByFilter() {
    if (this.campusList && this.campusList.length > 0) {
      this.campusList = _.uniqBy(this.campusList, '_id');
      this.campusList = this.campusList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }
    if (this.levelList && this.levelList.length > 0) {
      this.levelList = _.uniqBy(this.levelList, '_id');
      this.levelList = this.levelList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }
    if (this.sectorList && this.sectorList.length > 0) {
      this.sectorList = _.uniqBy(this.sectorList, '_id');
      this.sectorList = this.sectorList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }
    if (this.specialityList && this.specialityList.length > 0) {
      this.specialityList = _.uniqBy(this.specialityList, '_id');
      this.specialityList = this.specialityList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }
  }

  selectAll(type: string) {
    const searchTxt = ['All'];
    if (type === 'campus') {
      if (this.campusList && this.campusList.length) {
        if (this.isSelectAllCampus) {
          this.isSelectAllCampus = false;
          this.campusFilterCtrl.setValue(null);
          this.filteredValues.campus = null;
          if (!this.isReset) {
            this.getDataProgramSchoolScholarSeason();
          }
        } else {
          this.isSelectAllCampus = true;
          this.campusFilterCtrl.setValue(searchTxt);
          this.filteredValues.campus = null;
          if (!this.isReset) {
            this.getDataProgramSchoolScholarSeason();
          }
        }
      } else {
        if (this.isSelectAllCampus) {
          this.campusFilterCtrl.setValue(searchTxt);
          this.isSelectAllCampus = !this.isSelectAllCampus;
        } else {
          this.campusFilterCtrl.setValue(null);
          this.isSelectAllCampus = !this.isSelectAllCampus;
        }
      }
    } else if (type === 'level') {
      if (this.levelList && this.levelList.length) {
        if (this.isSelectAllLevel) {
          this.isSelectAllLevel = false;
          this.levelFilterCtrl.setValue(null);
          this.filteredValues.level = null;
          if (!this.isReset) {
            this.getDataProgramSchoolScholarSeason();
          }
        } else {
          this.isSelectAllLevel = true;
          this.levelFilterCtrl.setValue(searchTxt);
          this.filteredValues.level = null;
          if (!this.isReset) {
            this.getDataProgramSchoolScholarSeason();
          }
        }
      } else {
        if (this.isSelectAllLevel) {
          this.levelFilterCtrl.setValue(searchTxt);
          this.isSelectAllLevel = !this.isSelectAllLevel;
        } else {
          this.levelFilterCtrl.setValue(null);
          this.isSelectAllLevel = !this.isSelectAllLevel;
        }
      }
    } else if (type === 'sector') {
      if (this.sectorList && this.sectorList.length) {
        if (this.isSelectAllSector) {
          this.isSelectAllSector = false;
          this.sectorFilterCtrl.setValue(null);
          this.filteredValues.sector = null;
          if (!this.isReset) {
            this.getDataProgramSchoolScholarSeason();
          }
        } else {
          this.isSelectAllSector = true;
          this.sectorFilterCtrl.setValue(searchTxt);
          this.filteredValues.sector = null;
          if (!this.isReset) {
            this.getDataProgramSchoolScholarSeason();
          }
        }
      } else {
        if (this.isSelectAllSector) {
          this.sectorFilterCtrl.setValue(searchTxt);
          this.isSelectAllSector = !this.isSelectAllSector;
        } else {
          this.sectorFilterCtrl.setValue(null);
          this.isSelectAllSector = !this.isSelectAllSector;
        }
      }
    } else if (type === 'speciality') {
      if (this.specialityList && this.specialityList.length) {
        if (this.isSelectAllSpeciality) {
          this.isSelectAllSpeciality = false;
          this.specialityFilterCtrl.setValue(null);
          this.filteredValues.speciality = null;
          if (!this.isReset) {
            this.getDataProgramSchoolScholarSeason();
          }
        } else {
          this.isSelectAllSpeciality = true;
          this.specialityFilterCtrl.setValue(searchTxt);
          this.filteredValues.speciality = null;
          if (!this.isReset) {
            this.getDataProgramSchoolScholarSeason();
          }
        }
      } else {
        if (this.isSelectAllSpeciality) {
          this.specialityFilterCtrl.setValue(searchTxt);
          this.isSelectAllSpeciality = !this.isSelectAllSpeciality;
        } else {
          this.specialityFilterCtrl.setValue(null);
          this.isSelectAllSpeciality = !this.isSelectAllSpeciality;
        }
      }
    }
  }

  setFilterSelected(type) {
    switch (type) {
      case 'campus':
        const tempCampus = _.cloneDeep(this.campusFilterCtrl.value);
        const selectAllCampus = tempCampus.find((resp) => resp === 'All');
        const selectNonAllCampus = tempCampus.find((resp) => resp !== 'All');
        if (!selectAllCampus && tempCampus.length) {
          // handle if all option not selected
          this.isSelectAllCampus = false;
          const idsCampus = [];
          tempCampus.filter((res) => {
            if (res) {
              idsCampus.push(res);
            }
          });
          this.campusFilterCtrl.setValue(idsCampus);
          // this.clearSelectIfFilter();
          const resultCampus = this.campusFilterCtrl.value;
          this.filteredValues.campus = resultCampus && resultCampus.length > 0 ? resultCampus : null;
          this.paginator.pageIndex = 0;
        } else {
          if (selectNonAllCampus && tempCampus.length) {
            // handle if all option has already selected before
            const indexAll = tempCampus.findIndex((resp) => resp === 'All');
            tempCampus.splice(indexAll, 1);
            this.isSelectAllCampus = false;
            this.campusFilterCtrl.setValue(tempCampus);
            this.filteredValues.campus = tempCampus;
          } else {
            // handle if the whole option deselected
            this.filteredValues.campus = null;
            this.paginator.pageIndex = 0;
          }
        }
        if (!this.isReset) {
          this.getDataProgramSchoolScholarSeason();
        }
        break;
      case 'level':
        const tempLevel = _.cloneDeep(this.levelFilterCtrl.value);
        const selectAllLevel = tempLevel.find((resp) => resp === 'All');
        const selectNonAllLevel = tempLevel.find((resp) => resp !== 'All');
        if (!selectAllLevel && tempLevel.length) {
          this.isSelectAllLevel = false;
          const idsLevel = [];
          tempLevel.filter((res) => {
            if (res) {
              idsLevel.push(res);
            }
          });
          this.levelFilterCtrl.setValue(idsLevel);
          // this.clearSelectIfFilter();
          const resultLevel = this.levelFilterCtrl.value;
          this.filteredValues.level = resultLevel && resultLevel.length > 0 ? resultLevel : null;
          this.paginator.pageIndex = 0;
        } else {
          if (selectNonAllLevel && tempLevel.length) {
            // handle if all option has already selected before
            const indexAll = tempLevel.findIndex((resp) => resp === 'All');
            tempLevel.splice(indexAll, 1);
            this.isSelectAllLevel = false;
            this.levelFilterCtrl.setValue(tempLevel);
            this.filteredValues.level = tempLevel;
          } else {
            // handle if the whole option deselected
            this.filteredValues.level = null;
            this.paginator.pageIndex = 0;
          }
        }
        if (!this.isReset) {
          this.getDataProgramSchoolScholarSeason();
        }
        break;
      case 'sector':
        const tempSector = _.cloneDeep(this.sectorFilterCtrl.value);
        const selectAllSector = tempSector.find((resp) => resp === 'All');
        const selectNonAllSector = tempSector.find((resp) => resp !== 'All');
        if (!selectAllSector && tempSector.length) {
          this.isSelectAllSector = false;
          const idsSector = [];
          tempSector.filter((res) => {
            if (res) {
              idsSector.push(res);
            }
          });
          this.sectorFilterCtrl.setValue(idsSector);
          // this.clearSelectIfFilter();
          const resultSector = this.sectorFilterCtrl.value;
          this.filteredValues.sector = resultSector && resultSector.length > 0 ? resultSector : null;
          this.paginator.pageIndex = 0;
        } else {
          if (selectNonAllSector && tempSector.length) {
            // handle if all option has already selected before
            const indexAll = tempSector.findIndex((resp) => resp === 'All');
            tempSector.splice(indexAll, 1);
            this.isSelectAllSector = false;
            this.sectorFilterCtrl.setValue(tempSector);
            this.filteredValues.sector = tempSector;
          } else {
            // handle if the whole option deselected
            this.filteredValues.sector = null;
            this.paginator.pageIndex = 0;
          }
        }
        if (!this.isReset) {
          this.getDataProgramSchoolScholarSeason();
        }
        break;
      case 'speciality':
        const tempSpeciality = _.cloneDeep(this.specialityFilterCtrl.value);
        const selectAllSpeciality = tempSpeciality.find((resp) => resp === 'All');
        const selectNonAllSpeciality = tempSpeciality.find((resp) => resp !== 'All');
        if (!selectAllSpeciality && tempSpeciality.length) {
          this.isSelectAllSpeciality = false;
          const idsSpeciality = [];
          tempSpeciality.filter((res) => {
            if (res) {
              idsSpeciality.push(res);
            }
          });
          this.specialityFilterCtrl.setValue(idsSpeciality);
          // this.clearSelectIfFilter();
          const resultSpeciality = this.specialityFilterCtrl.value;
          this.filteredValues.speciality = resultSpeciality && resultSpeciality.length > 0 ? resultSpeciality : null;
          this.paginator.pageIndex = 0;
        } else {
          if (selectNonAllSpeciality && tempSpeciality.length) {
            // handle if all option has already selected before
            const indexAll = tempSpeciality.findIndex((resp) => resp === 'All');
            tempSpeciality.splice(indexAll, 1);
            this.isSelectAllSpeciality = false;
            this.specialityFilterCtrl.setValue(tempSpeciality);
            this.filteredValues.speciality = tempSpeciality;
          } else {
            // handle if the whole option deselected
            this.filteredValues.speciality = null;
            this.paginator.pageIndex = 0;
          }
        }
        if (!this.isReset) {
          this.getDataProgramSchoolScholarSeason();
        }
        break;
      default:
        break;
    }
  }

  clearSelectIfFilter() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.userSelected = [];
    this.userSelectedId = [];
    this.dataSelected = [];
    this.dataSelectedId = [];
  }

  resetFilterDropdown() {
    this.campusList = [];
    this.levelList = [];
    this.sectorList = [];
    this.specialityList = [];
  }

  swalError(err) {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('SORRY'),
      text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
      confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
    });
  }

  onDelete(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('SCHOOL_S3.TITLE'),
      html: this.translate.instant('SCHOOL_S3.TEXT', {
        name: data.program ? data.program : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('SCHOOL_S3.BUTTON-1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('SCHOOL_S3.BUTTON-2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      width: '33em',
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('SCHOOL_S3.BUTTON-1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('SCHOOL_S3.BUTTON-1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.isWaitingForResponse = true;
        this.subs.sink = this.intakeService.deleteProgramSelected(data._id).subscribe(
          (resp) => {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.isWaitingForResponse = false;
              this.paginator.pageIndex = 0;
              this.getDataProgramSchoolScholarSeason();
            });
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
            this.isWaitingForResponse = false;
            if (err['message'] === 'GraphQL error: Cannot delete program, because this program already connected to candidate') {
              Swal.fire({
                title: this.translate.instant('SCHOOL_S3a.TITLE'),
                html: this.translate.instant('SCHOOL_S3a.TEXT'),
                type: 'info',
                showConfirmButton: true,
                confirmButtonText: this.translate.instant('SCHOOL_S3a.BUTTON-1'),
              });
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
              this.swalError(err);
            }
          },
        );
      }
    });
  }

  onOpenAddDialog(selectedData, isEdit?) {
    const dialogRef = this.dialog.open(AddProgramDialogComponent, {
      width: '1000px',
      minHeight: '16vh',
      disableClose: true,
      data: {
        isEdit: isEdit,
        dataTable: selectedData ? selectedData : null,
        school: this.schoolData,
        scholarSeason: this.scholarSeason,
      },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.getDataProgramSchoolScholarSeason();
        this.getDropdownFilter(0);
      }
    });
  }

  downloadCSV() {
    if (this.dataSelected?.length < 1 && !this.isCheckedAll) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('School-Tab.Programs') }),
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

  cleanFilterDataDownload() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    let school;
    let campus;
    let level;
    let sector;
    let speciality;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'scholar_season_id') {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        } else if (key === 'school_id') {
          school = filterData.school_id.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"school_id":[${school}]` : filterQuery + `"school_id":[${school}]`;
        } else if (key === 'level') {
          level = filterData.level.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"level":[${level}]` : filterQuery + `"level":[${level}]`;
        } else if (key === 'campus') {
          campus = filterData.campus.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"campus":[${campus}]` : filterQuery + `"campus":[${campus}]`;
        } else if (key === 'sector') {
          sector = filterData.sector.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"sector":[${sector}]` : filterQuery + `"sector":[${sector}]`;
        } else if (key === 'speciality') {
          speciality = filterData.speciality.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"speciality":[${speciality}]` : filterQuery + `"speciality":[${speciality}]`;
        } else {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${filterData[key]}` : filterQuery + `"${key}":${filterData[key]}`;
        }
      }
    });
    return 'filter={' + filterQuery + '}';
  }

  openDownloadCsv(fileType) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const filter = this.cleanFilterDataDownload();
    let filtered;
    if ((this.dataSelectedId?.length && !this.isCheckedAll) || this.dataUnselect?.length > 0) {
      const mappedUserId = this.dataSelectedId.map((res) => `"` + res + `"`);
      const billing = `"program_ids":` + '[' + mappedUserId.toString() + ']';
      const scholarSeason = `"scholar_season_id": "${this.scholarSeasonId}",`;
      const schoolId = `"school_id": ["${this.schoolId}"],`;
      filtered = filter.slice(0, 8) + scholarSeason + schoolId + billing + '}';
    } else {
      const scholarSeason = `"scholar_season_id": "${this.scholarSeasonId}",`;
      const schoolId = `"school_id": ["${this.schoolId}"],`;
      const billing = `"program_ids":` + '[]';
      filtered = filter.slice(0, 8) + scholarSeason + schoolId + billing + '}';
    }

    // console.log('_fil', filtered);

    const importStudentTemplate = `downloadProgramData/`;
    const uri = encodeURI(
      url + importStudentTemplate + fileType + '/' + lang + '?' + filtered + '&' + `user_type_id="${this.currentUserTypeId}"`,
    );
    const option = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem(environment.tokenKey)),
      }),
    };

    this.isLoading = true;
    this.subs.sink = this.http.get(uri, option).subscribe(
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
          }).then(() => {
            this.clearSelectIfFilter();
            this.getDataProgramSchoolScholarSeason();
          });
        } else {
          this.isLoading = false;
        }
      },
      (err) => {
        this.isLoading = false;
      },
    );
  }

  controlButton(action: ProgramTableActions) {
    switch (action) {
      case 'export':
        setTimeout(() => {
          this.prepareDataForExport(0);
        }, 500);
        break;
      default:
        break;
    }
  }

  prepareDataForExport(pageIndex: number) {
    if (this.buttonClicked === 'export') {
      if (this.isCheckedAll) {
        if (this.dataUnselect.length < 1) {
          this.downloadCSV();
        } else {
          if (pageIndex === 0) {
            this.dataProgramForExport = [];
            this.dataSelected = [];
          }
          const pagination = {
            limit: 500,
            page: pageIndex,
          };
          const filter = {
            ...this.filteredValues,
            scholar_season_id: this.scholarSeasonId,
            school_id: [this.schoolId],
          };

          this.isLoading = true;
          this.subs.sink = this.intakeService.GetAllProgramsID(filter, pagination).subscribe(
            (res) => {
              if (res && res.length) {
                this.dataProgramForExport.push(...res);
                this.prepareDataForExport(pageIndex + 1);
              } else {
                this.isLoading = false;
                if (this.isCheckedAll && this.dataProgramForExport?.length > 0) {
                  this.dataSelected = this.dataProgramForExport.filter((program) => {
                    return this.dataUnselect.includes(program?._id);
                  });
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected?.length > 0) {
                    this.downloadCSV();
                  }
                }
              }
            },
            (err) => {
              this.isReset = false;
              this.isLoading = false;
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
              } else {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('SORRY'),
                  text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                  confirmButtonText: this.translate.instant('OK'),
                });
              }
            },
          );
        }
      } else {
        this.downloadCSV();
      }
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // Function to remove breadcrumb filter
  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
    this.clearSelectIfFilter();
    if (filterItem.name === 'campus') {
      this.campusFilterCtrl.setValue(['All'], { emitEvent: false });
    }
    if (filterItem.name === 'level') {
      this.levelFilterCtrl.setValue(['All'], { emitEvent: false });
    }
    if (filterItem.name === 'sector') {
      this.sectorFilterCtrl.setValue(['All'], { emitEvent: false });
    }
    if (filterItem.name === 'speciality') {
      this.specialityFilterCtrl.setValue(['All'], { emitEvent: false });
    }
    this.getDataProgramSchoolScholarSeason();
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      // Table Filters below
      {
        type: 'table_filter',
        name: 'campus',
        column: 'Program_Table_School_Detail.Campus',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.campusList,
        filterRef: this.campusFilterCtrl,
        displayKey: 'name',
        savedValue: '_id',
        isSelectionInput: true,
      },
      {
        type: 'table_filter',
        name: 'level',
        column: 'Program_Table_School_Detail.Level',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.levelList,
        filterRef: this.levelFilterCtrl,
        displayKey: 'name',
        savedValue: '_id',
        isSelectionInput: true,
      },
      {
        type: 'table_filter',
        name: 'sector',
        column: 'Program_Table_School_Detail.Sector',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.sectorList,
        filterRef: this.sectorFilterCtrl,
        displayKey: 'name',
        savedValue: '_id',
        isSelectionInput: true,
      },
      {
        type: 'table_filter',
        name: 'speciality',
        column: 'Program_Table_School_Detail.Speciality',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.specialityList,
        filterRef: this.specialityFilterCtrl,
        displayKey: 'name',
        savedValue: '_id',
        isSelectionInput: true,
      },
    ];

    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }
}
