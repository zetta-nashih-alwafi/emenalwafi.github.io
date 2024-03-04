import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { debounceTime, map, startWith, take, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { ConditionDialogComponent } from './condition-dialog/condition-dialog.component';
import * as _ from 'lodash';
import { FlyerDialogComponent } from 'app/admission-entrypoint/intake-channel-tab/flyer-dialog/flyer-dialog.component';
import * as moment from 'moment';
import { UtilityService } from 'app/service/utility/utility.service';
import { environment } from 'environments/environment';
import { ExportCsvService } from 'app/service/export-csv/export-csv.service';
import { RemoveRegistrationProfileDialogComponent } from './remove-registration-profile-dialog/remove-registration-profile-dialog.component';
import { ConnectRegistrationProfileDialogComponent } from './connect-registration-profile-dialog/connect-registration-profile-dialog.component';
import { FinancesService } from 'app/service/finance/finance.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { ConnectAdmissionDocumentDialogComponent } from './connect-admission-document-dialog/connect-admission-document-dialog.component';
import { AssignProgramDirectorDialogComponent } from './assign-program-director-dialog/assign-program-director-dialog.component';
import { AssingStartingDateDialogComponent } from './assign-starting-date-dialog/assign-starting-date-dialog.component';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { AuthService } from 'app/service/auth-service/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { ConnectCvecFormDialogComponent } from './connect-cvec-form-dialog/connect-cvec-form-dialog.component';
import { AdmissionDocumentDialogComponent } from './admission-document-dialog/admission-document-dialog.component';

@Component({
  selector: 'ms-admission',
  templateUrl: './admission.component.html',
  styleUrls: ['./admission.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class AdmissionComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  private subs = new SubSink();
  @Input() tabIndex;
  @Input() school;
  @Input() scholarSeason;

  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = [
    'select',
    'scholar_season',
    'school',
    'campus',
    'level',
    'sector',
    'speciality',
    'startingDate',
    'registration_profile',
    'doc_expected',
    'template_cvec',
    'conditions',
    'flyer',
    'program_director',
    'action',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'scholar_seasonFilter',
    'schoolFilter',
    'campusFilter',
    'levelFilter',
    'sectorFilter',
    'specialityFilter',
    'startingDateFilter',
    'registration_profileFilter',
    'doc_expectedFilter',
    'templateCVECFilter',
    'conditionsFilter',
    'flyerFilter',
    'program_directorFilter',
    'actionFilter',
  ];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  sortValue = null;
  dataCount = 0;
  noData: any;

  selection = new SelectionModel<any>(true, []);
  isCheckedAll = false;
  disabledExport = true;
  selectType: any;
  userSelected = [];
  dataSelected = [];
  dataSelectedId = [];
  allStudentForCheckbox = [];
  pageSelected = [];

  filterBreadcrumbData: any[] = [];
  exportName: string;

  isReset: Boolean = false;
  isWaitingForResponse = false;
  dataLoaded: Boolean = false;

  campusFilterCtrl = new UntypedFormControl(['All']);
  levelFilterCtrl = new UntypedFormControl(['All']);
  sectorFilterCtrl = new UntypedFormControl(['All']);
  specialityFilterCtrl = new UntypedFormControl(['All']);
  startingDateFilterCtrl = new UntypedFormControl(null);
  regisFilterCtrl = new UntypedFormControl('All');

  campusList: any = [];
  levelList: any = [];
  sectorList: any = [];
  specialityList: any = [];
  regisList: any = [];
  allFilter: any = [];

  filteredValues = {
    scholar_season_ids: null,
    school: null,
    campus: null,
    level: null,
    speciality: null,
    sector: null,
    registration_profile: null,
    start_date: null,
    offset: moment().utcOffset(),
  };
  isLoading = false;
  isLoading2 = false;
  isLoadingData = false;
  hasNoRegistrationProfileConnected = false;
  isSelectAllCampus = true;
  isSelectAllLevel = true;
  isSelectAllSector = true;
  isSelectAllSpeciality = true;
  isSelectAllRegis = true;
  dataUnselectUser = [];
  allExportForCheckbox = [];
  allAssignStartDateForCheckbox = [];
  allRegistrationProfileForCheckbox = [];
  allProgramDirectorForCheckbox = [];
  allCVECFormForCheckbox = [];
  allDocumentFormForCheckbox = [];
  allConnectProfileForCheckbox = [];
  allAddConditionForCheckbox = [];
  allConnectAdmissionDocForCheckbox = [];
  isDummyProgramDirector = true;
  currentUser: any;
  currentUserTypeId: any;

  constructor(
    private intakeService: IntakeChannelService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private utilityService: UtilityService,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private exportCsvService: ExportCsvService,
    private financesService: FinancesService,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    public permission: PermissionService,
    private authService: AuthService,
    private httpClient: HttpClient,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    this.filteredValues = {
      scholar_season_ids: [this.scholarSeason._id],
      school: this.school.short_name,
      campus: null,
      level: null,
      speciality: null,
      sector: null,
      registration_profile: null,
      start_date: null,
      offset: moment().utcOffset(),
    };
    this.initFilter();
    this.getDropdownFilter(0);
    this.getAllRegistrationProfile();
    this.getSpecialityDropdown();
  }

  ngOnChanges() {
    this.filteredValues = {
      scholar_season_ids: [this.scholarSeason._id],
      school: this.school.short_name,
      campus: null,
      level: null,
      speciality: null,
      sector: null,
      registration_profile: null,
      start_date: null,
      offset: moment().utcOffset(),
    };
    this.initFilter();
    this.getDropdownFilter(0);
    this.getAllRegistrationProfile();
    this.getSpecialityDropdown();
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getallIntakeChannels();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getallIntakeChannels() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.subs.sink = this.intakeService.GetAllSchoolIntakeChannel(this.filteredValues, pagination, this.sortValue).subscribe(
      (resp: any) => {
        if (resp && resp.length) {
          this.dataSource.data = _.cloneDeep(resp);
          this.paginator.length = resp[0]?.count_document;
          this.dataCount = resp[0]?.count_document;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
      },
      (error) => {
        if (error) {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(error);
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
        }
      },
    );
    this.filterBreadcrumbFormat()
  }

  getAllRegistrationProfile() {
    this.isLoading2 = true;
    this.subs.sink = this.intakeService.GetAllRegistrationProfileForDropdown().subscribe(
      (list) => {
        this.isLoading2 = false;
        this.regisList = list;
      },
      (error) => {
        this.isLoading2 = false;
        this.authService.postErrorLog(error);
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
  getSpecialityDropdown() {
    this.specialityList = [];
    const schoolId = this.school && this.school._id ? this.school._id : null;
    const scholarId = this.scholarSeason && this.scholarSeason._id ? this.scholarSeason._id : null;
    this.isLoadingData = true;
    this.subs.sink = this.financesService.getSpecialityIntakeChannelDropDown(schoolId, scholarId).subscribe(
      (res) => {
        if (res) {
          this.specialityList = res;
        }
        this.isLoadingData = false;
      },
      (error) => {
        this.isLoadingData = false;
        this.authService.postErrorLog(error);
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

  getDropdownFilter(pageNumber) {
    this.resetFilterDropdown();
    this.isLoading = true;
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    const school_id = [];
    if (this.school && this.school._id) {
      school_id.push(this.school._id);
    }

    const filter = {
      scholar_season_id: this.scholarSeason && this.scholarSeason._id ? this.scholarSeason._id : null,
      school_id: school_id,
    };

    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.intakeService.GetAllSelectedSchoolProgramScholarSeasonFilter(filter, pagination, userTypesList).subscribe(
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
            });
            this.uniqByFilter();
          }
        }
      },
      (error) => {
        this.isLoading = false;
        this.authService.postErrorLog(error);
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

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getallIntakeChannels();
      }
    }
  }

  initFilter() {
    this.subs.sink = this.startingDateFilterCtrl.valueChanges.pipe(debounceTime(400)).subscribe((date) => {
      if (date) {
        const newDate = moment(date).format('DD/MM/YYYY');
        this.filteredValues.start_date = newDate;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          // this.clearSelectIfFilter();
          this.getallIntakeChannels();
        }
      }
    });
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
      this.levelList = this.levelList.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
    }
    if (this.sectorList && this.sectorList.length > 0) {
      this.sectorList = _.uniqBy(this.sectorList, '_id');
    }
    if (this.specialityList && this.specialityList.length > 0) {
      this.specialityList = _.uniqBy(this.specialityList, '_id');
    }
  }

  selectRegist(event) {
    if (event === 'All') {
      this.regisFilterCtrl.setValue('All');
      this.filteredValues.registration_profile = null;
    } else {
      this.regisFilterCtrl.setValue(event);
      this.filteredValues.registration_profile = event;
    }

    this.paginator.pageIndex = 0;
    // this.clearSelectIfFilter();
    if (!this.isReset) {
      this.getallIntakeChannels();
    }
  }

  setFilterSelected(type) {
    switch (type) {
      case 'campus':
        if (this.isSelectAllCampus) {
          // this.clearSelectIfFilter();
          this.selectAll('campus');
        } else {
          const tempCampus = _.cloneDeep(this.campusFilterCtrl.value);
          const idsCampus = [];
          tempCampus.filter((res) => {
            if (res) {
              idsCampus.push(res);
            }
          });
          const selectAll = idsCampus.some((res) => res === 'All');
          if (selectAll) {
            this.isSelectAllCampus = true;
            // this.clearSelectIfFilter();
            this.selectAll('campus');
          } else {
            this.isSelectAllCampus = false;
            this.campusFilterCtrl.setValue(idsCampus);
            // this.clearSelectIfFilter();
            const resultCampus = this.campusFilterCtrl.value;
            this.filteredValues.campus = resultCampus && resultCampus.length > 0 ? resultCampus : null;
            this.paginator.pageIndex = 0;
            this.getallIntakeChannels();
          }
        }
        break;
      case 'level':
        if (this.isSelectAllLevel) {
          // this.clearSelectIfFilter();
          this.selectAll('level');
        } else {
          this.isSelectAllLevel = false;
          const tempLevel = _.cloneDeep(this.levelFilterCtrl.value);
          const idsLevel = [];
          tempLevel.filter((res) => {
            if (res) {
              idsLevel.push(res);
            }
          });
          const selectAll = idsLevel.some((res) => res === 'All');
          if (selectAll) {
            this.isSelectAllLevel = true;
            // this.clearSelectIfFilter();
            this.selectAll('level');
          } else {
            this.levelFilterCtrl.setValue(idsLevel);
            // this.clearSelectIfFilter();
            const resultLevel = this.levelFilterCtrl.value;
            this.filteredValues.level = resultLevel && resultLevel.length > 0 ? resultLevel : null;
            this.paginator.pageIndex = 0;
            this.getallIntakeChannels();
          }
        }
        break;
      case 'sector':
        if (this.isSelectAllSector) {
          // this.clearSelectIfFilter();
          this.selectAll('sector');
        } else {
          const tempSector = _.cloneDeep(this.sectorFilterCtrl.value);
          const idsSector = [];
          tempSector.filter((res) => {
            if (res) {
              idsSector.push(res);
            }
          });

          const selectAll = idsSector.some((res) => res === 'All');
          if (selectAll) {
            this.isSelectAllSector = true;
            // this.clearSelectIfFilter();
            this.selectAll('sector');
          } else {
            this.isSelectAllSector = false;
            this.sectorFilterCtrl.setValue(idsSector);
            // this.clearSelectIfFilter();
            const resultSector = this.sectorFilterCtrl.value;
            this.filteredValues.sector = resultSector && resultSector.length > 0 ? resultSector : null;
            this.paginator.pageIndex = 0;
            this.getallIntakeChannels();
          }
        }
        break;
      case 'speciality':
        if (this.isSelectAllSpeciality) {
          // this.clearSelectIfFilter();
          this.selectAll('speciality');
        } else {
          const tempSpeciality = _.cloneDeep(this.specialityFilterCtrl.value);
          const idsSpeciality = [];
          tempSpeciality.filter((res) => {
            if (res) {
              idsSpeciality.push(res);
            }
          });

          const selectAll = idsSpeciality.some((res) => res === 'All');
          if (selectAll) {
            this.isSelectAllSpeciality = true;
            // this.clearSelectIfFilter();
            this.selectAll('speciality');
          } else {
            this.isSelectAllSpeciality = false;
            this.specialityFilterCtrl.setValue(idsSpeciality);
            // this.clearSelectIfFilter();
            const resultSpeciality = this.specialityFilterCtrl.value;
            this.filteredValues.speciality = resultSpeciality && resultSpeciality.length > 0 ? resultSpeciality : null;
            this.paginator.pageIndex = 0;
            this.getallIntakeChannels();
          }
        }
        break;
      default:
        break;
    }
  }

  selectAll(type: string) {
    const searchTxt = ['All'];
    if (type === 'campus') {
      if (this.campusList && this.campusList.length) {
        if (this.isSelectAllCampus) {
          this.isSelectAllCampus = false;
          const idsCampus = [];
          const tempCampus = _.cloneDeep(this.campusFilterCtrl.value);
          tempCampus.filter((res) => {
            if (res !== 'All') {
              idsCampus.push(res);
            }
          });

          this.filteredValues.campus = idsCampus && idsCampus.length > 0 ? idsCampus : null;
          this.campusFilterCtrl.setValue(idsCampus);
        } else {
          this.isSelectAllCampus = true;
          this.campusFilterCtrl.setValue(searchTxt);
          this.filteredValues.campus = null;
        }
      } else {
        if (this.campusFilterCtrl) {
          this.campusFilterCtrl.setValue(searchTxt);
          this.isSelectAllCampus = !this.isSelectAllCampus;
        } else {
          this.campusFilterCtrl.setValue(null);
          this.isSelectAllCampus = !this.isSelectAllCampus;
        }
      }

      // this.clearSelectIfFilter();
      this.paginator.pageIndex = 0;
      this.getallIntakeChannels();
    } else if (type === 'level') {
      if (this.levelList && this.levelList.length) {
        if (this.isSelectAllLevel) {
          this.isSelectAllLevel = false;
          const idsLevel = [];
          const tempLevel = _.cloneDeep(this.levelFilterCtrl.value);
          tempLevel.filter((res) => {
            if (res !== 'All') {
              idsLevel.push(res);
            }
          });

          this.filteredValues.level = idsLevel && idsLevel.length > 0 ? idsLevel : null;
          this.levelFilterCtrl.setValue(idsLevel);
        } else {
          this.isSelectAllLevel = true;
          this.levelFilterCtrl.setValue(searchTxt);
          this.filteredValues.level = null;
        }
      } else {
        if (this.levelFilterCtrl) {
          this.levelFilterCtrl.setValue(searchTxt);
          this.isSelectAllCampus = !this.isSelectAllLevel;
        } else {
          this.levelFilterCtrl.setValue(null);
          this.isSelectAllCampus = !this.isSelectAllLevel;
        }
      }

      // this.clearSelectIfFilter();
      this.paginator.pageIndex = 0;
      this.getallIntakeChannels();
    } else if (type === 'sector') {
      if (this.sectorList && this.sectorList.length) {
        if (this.isSelectAllSector) {
          this.isSelectAllSector = false;
          const idsSector = [];
          const tempSector = _.cloneDeep(this.sectorFilterCtrl.value);
          tempSector.filter((res) => {
            if (res !== 'All') {
              idsSector.push(res);
            }
          });
          this.filteredValues.sector = idsSector && idsSector.length > 0 ? idsSector : null;
          this.sectorFilterCtrl.setValue(idsSector);
        } else {
          this.isSelectAllSector = true;
          this.sectorFilterCtrl.setValue(searchTxt);
          this.filteredValues.sector = null;
        }
      } else {
        if (this.sectorFilterCtrl) {
          this.sectorFilterCtrl.setValue(searchTxt);
          this.isSelectAllSector = !this.isSelectAllSector;
        } else {
          this.sectorFilterCtrl.setValue(null);
          this.isSelectAllSector = !this.isSelectAllSector;
        }
      }

      // this.clearSelectIfFilter();
      this.paginator.pageIndex = 0;
      this.getallIntakeChannels();
    } else if (type === 'speciality') {
      if (this.specialityList && this.specialityList.length) {
        if (this.isSelectAllSpeciality) {
          this.isSelectAllSpeciality = false;
          const idsSpeciality = [];
          const tempSpeciality = _.cloneDeep(this.specialityFilterCtrl.value);
          tempSpeciality.filter((res) => {
            if (res !== 'All') {
              idsSpeciality.push(res);
            }
          });
          this.filteredValues.speciality = idsSpeciality && idsSpeciality.length > 0 ? idsSpeciality : null;
          this.specialityFilterCtrl.setValue(idsSpeciality);
        } else {
          this.isSelectAllSpeciality = true;
          this.specialityFilterCtrl.setValue(searchTxt);
          this.filteredValues.speciality = null;
        }
      } else {
        if (this.specialityFilterCtrl) {
          this.specialityFilterCtrl.setValue(searchTxt);
          this.isSelectAllSpeciality = !this.isSelectAllSpeciality;
        } else {
          this.specialityFilterCtrl.setValue(null);
          this.isSelectAllSpeciality = !this.isSelectAllSpeciality;
        }
      }

      // this.clearSelectIfFilter();
      this.paginator.pageIndex = 0;
      this.getallIntakeChannels();
    }
  }

  clearSelectIfFilter() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
    this.allAssignStartDateForCheckbox = [];
    this.allRegistrationProfileForCheckbox = [];
    this.allProgramDirectorForCheckbox = [];
    this.allCVECFormForCheckbox = [];
    this.allDocumentFormForCheckbox = [];
  }

  resetFilterDropdown() {
    this.campusList = [];
    this.levelList = [];
    this.sectorList = [];
    // this.specialityList = [];
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected() || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length)) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
      this.allAssignStartDateForCheckbox = [];
      this.allRegistrationProfileForCheckbox = [];
      this.allConnectProfileForCheckbox = [];
      this.allAddConditionForCheckbox = [];
      this.allConnectAdmissionDocForCheckbox = [];
      this.allProgramDirectorForCheckbox = [];
      this.allCVECFormForCheckbox = [];
      this.allDocumentFormForCheckbox = [];
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
      this.allAssignStartDateForCheckbox = [];
      this.allRegistrationProfileForCheckbox = [];
      this.allProgramDirectorForCheckbox = [];
      this.allCVECFormForCheckbox = [];
      this.allDocumentFormForCheckbox = [];
      this.allConnectProfileForCheckbox = [];
      this.allAddConditionForCheckbox = [];
      this.allConnectAdmissionDocForCheckbox = [];
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
    }
  }

  getAllIdForCheckbox(pageNumber) {
    if (this.isCheckedAll) {
      if (this.dataUnselectUser.length < 1) {
        this.downloadCSV();
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
        this.subs.sink = this.intakeService
          .GetAllSchoolIntakeChannelIdCheckbox(this.filteredValues, pagination, this.sortValue)
          .subscribe((admissions: any) => {
            if (admissions && admissions.length) {
              this.allExportForCheckbox.push(...admissions);
              const page = pageNumber + 1;
              this.getAllIdForCheckbox(page);
            } else {
              this.isWaitingForResponse = false;
              if (this.isCheckedAll) {
                if (this.allExportForCheckbox && this.allExportForCheckbox.length) {
                  this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length) {
                    this.downloadCSV();
                  }
                }
              }
            }
          });
      }
    } else {
      this.downloadCSV();
    }
  }

  getAllAssignStartDateForCheckbox(pageNumber) {
    if (this.isCheckedAll) {
      if (pageNumber === 0) {
        this.allAssignStartDateForCheckbox = [];
        this.dataSelected = [];
      }
      const pagination = {
        limit: 500,
        page: pageNumber,
      };
      this.isWaitingForResponse = true;
      const filter = _.cloneDeep(this.filteredValues)
      const sort = _.cloneDeep(this.sortValue)
      this.subs.sink = this.intakeService.GetAllSchoolIntakeChannelIdCheckbox(filter, pagination, sort).pipe(take(1)).subscribe(
        (admissions) => {
          if (admissions && admissions.length) {
            this.allAssignStartDateForCheckbox.push(...admissions);
            const page = pageNumber + 1;
            this.getAllAssignStartDateForCheckbox(page);
          } else {
            this.isWaitingForResponse = false;
            if (this.isCheckedAll) {
              if (this.allAssignStartDateForCheckbox && this.allAssignStartDateForCheckbox.length) {
                this.dataSelected = this.allAssignStartDateForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                if (this.dataSelected && this.dataSelected.length) {
                  this.assignStartingDate();
                }
              }
            }
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err);
        },
      );
    } else {
      this.assignStartingDate();
    }
  }

  getAllRegistrationProfileForCheckbox(pageNumber, action) {
    if (this.isCheckedAll) {
      if (pageNumber === 0) {
        this.allRegistrationProfileForCheckbox = [];
        this.dataSelected = [];
      }
      const pagination = {
        limit: 500,
        page: pageNumber,
      };
      this.isWaitingForResponse = true;
      this.hasNoRegistrationProfileConnected = false;
      const filter = _.cloneDeep(this.filteredValues)
      const sort = _.cloneDeep(this.sortValue)
      this.subs.sink = this.intakeService.GetAllRegistrationProfileForCheckbox(filter, pagination, sort).pipe(take(1)).subscribe(
        (admissions) => {
          if (admissions && admissions.length) {
            this.allRegistrationProfileForCheckbox.push(...admissions);
            const page = pageNumber + 1;
            this.getAllRegistrationProfileForCheckbox(page, action);
          } else {
            this.isWaitingForResponse = false;
            if (this.allRegistrationProfileForCheckbox && this.allRegistrationProfileForCheckbox.length) {
              this.dataSelected = this.allRegistrationProfileForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
              this.dataSelected = _.uniqBy(this.dataSelected, '_id');
              if (this.dataSelected && this.dataSelected.length) {
                const hasNoRegistrationProfileConnected = this.dataSelected.find((res) => !res.profil_rate);
                if (hasNoRegistrationProfileConnected) {
                  this.hasNoRegistrationProfileConnected = true;
                } else {
                  this.hasNoRegistrationProfileConnected = false;
                }
                if (action === 'remove') {
                  this.removeRegistration();
                }
              } else {
                this.hasNoRegistrationProfileConnected = false;
              }
            }
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err);
        },
      );
    } else {
      if (action === 'remove') {
        this.removeRegistration();
      }
    }
  }

  getAllDirectorProgramForCheckbox(pageNumber) {
    if (this.isCheckedAll) {
      if (pageNumber === 0) {
        this.allProgramDirectorForCheckbox = [];
        this.dataSelected = [];
      }
      const pagination = {
        limit: 500,
        page: pageNumber,
      };
      this.isWaitingForResponse = true;
      this.hasNoRegistrationProfileConnected = false;
      const filter = _.cloneDeep(this.filteredValues)
      const sort = _.cloneDeep(this.sortValue)
      this.subs.sink = this.intakeService
        .GetAllSchoolIntakeChannelDirectorCheckbox(filter, pagination, sort)
        .pipe(take(1))
        .subscribe((admissions: any) => {
          if (admissions && admissions.length) {
            this.allProgramDirectorForCheckbox.push(...admissions);
            const page = pageNumber + 1;
            this.getAllDirectorProgramForCheckbox(page);
          } else {
            this.isWaitingForResponse = false;
            if (this.allProgramDirectorForCheckbox && this.allProgramDirectorForCheckbox.length) {
              this.dataSelected = this.allProgramDirectorForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
              this.dataSelected = _.uniqBy(this.dataSelected, '_id');
              if (this.dataSelected && this.dataSelected.length) {
                this.AssignProgramDirector('multiple');
              }
            }
          }
        });
    } else {
      this.AssignProgramDirector('multiple');
    }
  }

  getAllCVECFormForCheckBox(pageNumber) {
    if (this.isCheckedAll) {
      if (pageNumber === 0) {
        this.allCVECFormForCheckbox = [];
        this.dataSelected = [];
      }
      const pagination = {
        limit: 500,
        page: pageNumber,
      };
      this.isWaitingForResponse = true;
      this.hasNoRegistrationProfileConnected = false;
      const filter = _.cloneDeep(this.filteredValues)
      const sort = _.cloneDeep(this.sortValue)
      this.subs.sink = this.intakeService
        .GetAllSchoolIntakeChannel(filter, pagination, sort)
        .pipe(take(1))
        .subscribe((admissions: any) => {
          if (admissions && admissions.length) {
            this.allCVECFormForCheckbox.push(...admissions);
            const page = pageNumber + 1;
            this.getAllCVECFormForCheckBox(page);
          } else {
            this.isWaitingForResponse = false;
            if (this.allCVECFormForCheckbox && this.allCVECFormForCheckbox.length) {
              this.dataSelected = this.allCVECFormForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
              this.dataSelected = _.uniqBy(this.dataSelected, '_id');
              if (this.dataSelected && this.dataSelected.length) {
                this.connectCVECForm('multiple');
              }
            }
          }
        });
    } else {
      this.connectCVECForm('multiple');
    }
  }

  getAllAdmissionDocumentForCheckBox(pageNumber) {
    if (this.isCheckedAll) {
      if (pageNumber === 0) {
        this.allCVECFormForCheckbox = [];
        this.dataSelected = [];
      }
      const pagination = {
        limit: 500,
        page: pageNumber,
      };
      this.isWaitingForResponse = true;
      this.hasNoRegistrationProfileConnected = false;
      const filter = _.cloneDeep(this.filteredValues)
      const sort = _.cloneDeep(this.sortValue)
      this.subs.sink = this.intakeService
        .GetAllSchoolIntakeChannel(filter, pagination, sort)
        .pipe(take(1))
        .subscribe((admissions: any) => {
          if (admissions && admissions.length) {
            this.allCVECFormForCheckbox.push(...admissions);
            const page = pageNumber + 1;
            this.getAllAdmissionDocumentForCheckBox(page);
          } else {
            this.isWaitingForResponse = false;
            if (this.allCVECFormForCheckbox && this.allCVECFormForCheckbox.length) {
              this.dataSelected = this.allCVECFormForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
              this.dataSelected = _.uniqBy(this.dataSelected, '_id');
              if (this.dataSelected && this.dataSelected.length) {
                this.admissionDocument('multiple');
              }
            }
          }
        });
    } else {
      this.admissionDocument('multiple');
    }
  }

  getAllDocumentFormForCheckbox(pageNumber) {
    if (this.isCheckedAll) {
      if (pageNumber === 0) {
        this.allDocumentFormForCheckbox = [];
        this.dataSelected = [];
      }
      const pagination = {
        limit: 500,
        page: pageNumber,
      };
      this.isWaitingForResponse = true;
      this.hasNoRegistrationProfileConnected = false;
      const filter = _.cloneDeep(this.filteredValues)
      const sort = _.cloneDeep(this.sortValue)
      this.subs.sink = this.intakeService
        .GetAllSchoolIntakeChannel(filter, pagination, sort)
        .pipe(take(1))
        .subscribe((admissions: any) => {
          if (admissions && admissions.length) {
            this.allDocumentFormForCheckbox.push(...admissions);
            const page = pageNumber + 1;
            this.getAllDocumentFormForCheckbox(page);
          } else {
            this.isWaitingForResponse = false;
            if (this.allDocumentFormForCheckbox && this.allDocumentFormForCheckbox.length) {
              this.dataSelected = this.allDocumentFormForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
              this.dataSelected = _.uniqBy(this.dataSelected, '_id');
              if (this.dataSelected && this.dataSelected.length) {
                this.connectAdmissionDoc();
              }
            }
          }
        });
    } else {
      this.connectAdmissionDoc();
    }
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
    const numSelected = this.dataSelected.length;
    this.disabledExport = numSelected <= 0;
    this.userSelected = [];
    this.dataSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.dataSelectedId.push(user._id);
      this.userSelected.push(user);
    });

    if (this.dataSelected && this.dataSelected.length > 0) {
      const hasNoRegistrationProfileConnected = this.dataSelected.find((res) => !res.profil_rate);
      this.hasNoRegistrationProfileConnected = !!hasNoRegistrationProfileConnected;
    } else {
      this.hasNoRegistrationProfileConnected = false;
    }
  }

  resetTable() {
    this.isReset = true;
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.paginator.pageIndex = 0;
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.resetterFilter();
    this.filteredValues = {
      scholar_season_ids: [this.scholarSeason._id],
      school: this.school.short_name,
      campus: null,
      level: null,
      speciality: null,
      sector: null,
      registration_profile: null,
      start_date: null,
      offset: moment().utcOffset(),
    };
    this.getallIntakeChannels();
  }

  resetterFilter() {
    this.campusFilterCtrl.setValue(['All'], { emitEvent: false });
    this.levelFilterCtrl.setValue(['All'], { emitEvent: false });
    this.specialityFilterCtrl.setValue(['All'], { emitEvent: false });
    this.startingDateFilterCtrl.setValue(null, { emitEvent: false });
    this.sectorFilterCtrl.setValue(['All'], { emitEvent: false });
    this.regisFilterCtrl.setValue('All', { emitEvent: false });
    this.isSelectAllCampus = true;
    this.isSelectAllLevel = true;
    this.isSelectAllSector = true;
    this.isSelectAllSpeciality = true;
    this.isSelectAllRegis = true;
  }

  renderTooltipProfileRate(profileRate: any[]): string {
    let tooltip = '';
    let count = 0;
    if (profileRate && profileRate.length) {
      for (const profile of profileRate) {
        count++;
        if (count > 1) {
          if (profile && profile.name) {
            tooltip = tooltip + ', ';
            tooltip = tooltip + profile.name;
          }
        } else {
          if (profile && profile.name) {
            tooltip = tooltip + profile.name;
          }
        }
      }
    }
    return tooltip;
  }

  renderTooltipAdmissionDoc(admissionDoc: any[]): string {
    let tooltip = '';
    if (admissionDoc && admissionDoc.length) {
      if (admissionDoc[admissionDoc.length - 1]) {
        tooltip = admissionDoc[admissionDoc.length - 1].form_builder_name;
      }
    }
    return tooltip;
  }

  onEditFlyer(element) {
    this.subs.sink = this.dialog
      .open(FlyerDialogComponent, {
        width: '600px',
        minHeight: '100px',
        data: element,
        disableClose: true,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.clearSelectIfFilter();
          this.getallIntakeChannels();
        }
      });
  }

  onDownloadFlyer(element) {
    const fileUrl = element.admission_flyer.s3_file_name;
    if (!fileUrl) {
      return;
    }
    const link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.download = fileUrl;
    link.href = `${environment.apiUrl}/fileuploads/${fileUrl}?download=true`.replace('/graphql', '');
    link.target = '_blank';
    link.click();
    link.remove();
  }

  onEditCondition(element) {
    this.subs.sink = this.dialog
      .open(ConditionDialogComponent, {
        width: '600px',
        minHeight: '100px',
        data: [element],
        disableClose: true,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.clearSelectIfFilter();
          this.getallIntakeChannels();
        }
      });
  }

  onDownloadCondition(element) {
    const fileUrl = element.admission_document.s3_file_name;
    if (!fileUrl) {
      return;
    }
    const link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.download = fileUrl;
    link.href = `${environment.apiUrl}/fileuploads/${fileUrl}?download=true`.replace('/graphql', '');
    link.target = '_blank';
    link.click();
    link.remove();
  }

  connectAdmissionDoc() {
    if (
      (this.dataSelected &&
        !this.dataSelected.length &&
        (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length))) === true
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Admission') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
      return;
    }
    const ids = this.dataSelected.map((list) => list._id);
    const formBuilderId = this.dataSelected
      .filter((list) => list.admission_document_template && list.admission_document_template._id)
      .map((list) => list.admission_document_template._id);
    this.subs.sink = this.dialog
      .open(ConnectAdmissionDocumentDialogComponent, {
        width: '800px',
        disableClose: true,
        data: {
          select_all: ((this.selection.hasValue() && this.isAllSelected()) || this.isCheckedAll) && this.dataUnselectUser.length <= 0,
          filter: ((this.selection.hasValue() && this.isAllSelected()) || this.isCheckedAll) && this.dataUnselectUser.length <= 0 ? this.generateFilterForMutation() : this.filteredValues,
          program_ids: ids,
          item: this.dataSelected.length > 1 ? 'multiple' : 'single',
          selected: this.dataSelected,
          form_builder_id: formBuilderId && formBuilderId.length ? formBuilderId[0] : null,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.clearSelectIfFilter();
          this.getallIntakeChannels();
        }
      });
  }

  AssignProgramDirector(item: string, element: Object = {}) {
    if (item === 'single') {
      this.subs.sink = this.dialog
        .open(AssignProgramDirectorDialogComponent, {
          width: '600px',
          minHeight: '100px',
          data: {
            intake: [element],
            filter: null,
            select_all: false,
          },
          disableClose: true,
        })
        .afterClosed()
        .subscribe((res) => {
          if (res) {
            this.clearSelectIfFilter();
            this.getallIntakeChannels();
          }
        });
    } else if (item === 'multiple') {
      if (
        (this.dataSelected &&
          !this.dataSelected.length &&
          (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length))) === true
      ) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Followup_S8.Title'),
          html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Admission') }),
          confirmButtonText: this.translate.instant('Followup_S8.Button'),
        });
        return;
      }

      this.subs.sink = this.dialog
        .open(AssignProgramDirectorDialogComponent, {
          width: '600px',
          minHeight: '100px',
          data: {
            intake: this.dataSelected,
            filter: this.filteredValues,
            select_all: ((this.selection.hasValue() && this.isAllSelected()) || this.isCheckedAll) && this.dataUnselectUser.length <= 0,
          },
          disableClose: true,
        })
        .afterClosed()
        .subscribe((res) => {
          if (res) {
            this.clearSelectIfFilter();
            this.getallIntakeChannels();
          }
        });
    }
  }

  connectCVECForm(item: string, element: Object = {}) {
    console.log('_element', element)
    if (item === 'single') {
      this.subs.sink = this.dialog
        .open(ConnectCvecFormDialogComponent, {
          width: '650px',
          panelClass: 'certification-rule-pop-up',
          data: {
            programIds: [element],
            item,
            filter: null,
            select_all: false,
          },
          disableClose: true,
        })
        .afterClosed()
        .subscribe((res) => {
          if (res) {
            this.clearSelectIfFilter();
            this.getallIntakeChannels();
          }
        });
    } else if (item === 'multiple') {
      if (
        (this.dataSelected &&
          !this.dataSelected.length &&
          (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length))) === true
      ) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Followup_S8.Title'),
          html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Admission') }),
          confirmButtonText: this.translate.instant('Followup_S8.Button'),
        });
        return;
      }

      this.subs.sink = this.dialog
        .open(ConnectCvecFormDialogComponent, {
          width: '650px',
          data: {
            programIds: this.dataSelected,
            filter: ((this.selection.hasValue() && this.isAllSelected()) || this.isCheckedAll) && this.dataUnselectUser.length <= 0 ? this.generateFilterForMutation() : this.filteredValues,
            select_all: ((this.selection.hasValue() && this.isAllSelected()) || this.isCheckedAll) && this.dataUnselectUser.length <= 0,
            item: this.dataSelected.length > 1 ? item : 'single',
          },
          disableClose: true,
          panelClass: 'certification-rule-pop-up',
        })
        .afterClosed()
        .subscribe((res) => {
          if (res) {
            this.clearSelectIfFilter();
            this.getallIntakeChannels();
          }
        });
    }
  }

  admissionDocument(item: string, element: Object = {}) {
    console.log('_element', element)
    if (item === 'single') {
      this.subs.sink = this.dialog
        .open(AdmissionDocumentDialogComponent, {
          width: '650px',
          panelClass: 'certification-rule-pop-up',
          data: {
            programIds: [element],
            item,
            filter: null,
            select_all: false,
          },
          disableClose: true,
        })
        .afterClosed()
        .subscribe((res) => {
          if (res) {
            this.clearSelectIfFilter();
            this.getallIntakeChannels();
          }
        });
    } else if (item === 'multiple') {
      if (
        (this.dataSelected &&
          !this.dataSelected.length &&
          (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length))) === true
      ) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Followup_S8.Title'),
          html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Admission') }),
          confirmButtonText: this.translate.instant('Followup_S8.Button'),
        });
        return;
      }

      this.subs.sink = this.dialog
        .open(AdmissionDocumentDialogComponent, {
          width: '650px',
          data: {
            programIds: this.dataSelected,
            item: this.dataSelected.length > 1 ? item : 'single',
            filter: ((this.selection.hasValue() && this.isAllSelected()) || this.isCheckedAll) && this.dataUnselectUser.length <= 0 ? this.generateFilterForMutation() : this.filteredValues,
            select_all: ((this.selection.hasValue() && this.isAllSelected()) || this.isCheckedAll) && this.dataUnselectUser.length <= 0,
          },
          disableClose: true,
          panelClass: 'certification-rule-pop-up',
        })
        .afterClosed()
        .subscribe((res) => {
          if (res) {
            this.clearSelectIfFilter();
            this.getallIntakeChannels();
          }
        });
    }
  }

  generateFilterForMutation() {
    let filter = _.cloneDeep(this.filteredValues);
    if(filter?.campus) {
      const tempDataCampusIds = [];
      filter?.campus.forEach((val) => {
        const findCampus = this.campusList.find((campus) => campus?.name === val);
        tempDataCampusIds.push(findCampus?._id);
      })
      filter.campus = tempDataCampusIds;
    };

    if(filter?.level) {
      const tempDataLevelIds = [];
      filter?.level.forEach((val) => {
        const findLevel = this.levelList.find((level) => level?.name === val);
        tempDataLevelIds.push(findLevel?._id);
      })
      filter.level = tempDataLevelIds;
    };

    if(filter?.school) {
      filter = { ...filter, school_id: [this.school?._id] }
      delete filter?.school;
    };

    return filter;
  }

  addConditionCheck(pageNumber) {
    if (
      (this.dataSelected &&
        !this.dataSelected.length &&
        (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length))) === true
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Admission') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
      return;
    }
    const pagination = {
      limit: 500,
      page: pageNumber,
    };
    const filter = _.cloneDeep(this.filteredValues)
    const sort = _.cloneDeep(this.sortValue)

    this.isWaitingForResponse = true;

    this.subs.sink = this.intakeService.getConnectRegistrationCheckboxId(filter, pagination, sort).pipe(take(1)).subscribe(
      (admissions) => {
        if (admissions && admissions.length) {
          const resp = _.cloneDeep(admissions);
          this.allAddConditionForCheckbox = _.concat(this.allAddConditionForCheckbox, resp);
          const page = pageNumber + 1;
          this.addConditionCheck(page);
        } else {
          this.isWaitingForResponse = false;
          if (this.isCheckedAll) {
            if (this.allAddConditionForCheckbox && this.allAddConditionForCheckbox.length) {
              this.dataSelected = this.allAddConditionForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
              this.dataSelected = _.uniqBy(this.dataSelected, '_id');
            }
          }
          this.subs.sink = this.dialog
            .open(ConditionDialogComponent, {
              width: '600px',
              minHeight: '100px',
              data: this.dataSelected,
              disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
              if (res) {
                this.clearSelectIfFilter();
                this.getallIntakeChannels();
              }
            });
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err);
      },
    );
  }

  assignStartingDate() {
    if (
      this.dataSelected &&
      !this.dataSelected.length &&
      (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length))
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Admission') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
      return;
    }
    this.subs.sink = this.dialog
      .open(AssingStartingDateDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          programIds: this.dataSelected,
          filter: this.filteredValues,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.clearSelectIfFilter();
          this.getallIntakeChannels();
        }
      });
  }

  removeRegistration() {
    if (
      this.dataSelected &&
      !this.dataSelected.length &&
      (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length))
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Admission') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
      return;
    } else {
      if (this.hasNoRegistrationProfileConnected) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('ADMISSION_S1.TITLE'),
          html: this.translate.instant('ADMISSION_S1.TEXT'),
          confirmButtonText: this.translate.instant('ADMISSION_S1.BUTTON'),
        });
      } else {
        let regisList = [];
        this.dataSelected.map((item) => {
          if (item.profil_rate && item.profil_rate.length > 0) {
            for (let i = 0; i < item.profil_rate.length; i++) {
              regisList.push(item.profil_rate[i]);
            }
          }
        });
        regisList = regisList.reduce((unique, o) => {
          if (!unique.some((obj) => obj._id === o._id && obj.name === o.name)) {
            unique.push(o);
          }
          return unique;
        }, []);
        this.dataSelected = this.dataSelected.map((list) => {
          return {
            scholar_season_id: this.scholarSeason._id,
            school_id: this.school._id,
            ...list,
          };
        });
        this.subs.sink = this.dialog
          .open(RemoveRegistrationProfileDialogComponent, {
            width: '600px',
            minHeight: '100px',
            disableClose: true,
            data: {
              data: this.dataSelected,
              regisList: regisList,
            },
          })
          .afterClosed()
          .subscribe((res) => {
            if (res) {
              this.clearSelectIfFilter();
              this.getallIntakeChannels();
            }
          });
      }
    }
  }

  connectRegistration(pageNumber) {
    if (
      (this.dataSelected &&
        !this.dataSelected.length &&
        (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length))) === true
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Admission') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
      return;
    } else {
      const pagination = {
        limit: 500,
        page: pageNumber,
      };
      const filter = _.cloneDeep(this.filteredValues)
      const sort = _.cloneDeep(this.sortValue)
      this.isWaitingForResponse = true;
      this.subs.sink = this.intakeService.getConnectRegistrationCheckboxId(filter, pagination, sort).pipe(take(1)).subscribe(
        (admissions) => {
          if (admissions && admissions.length) {
            const resp = _.cloneDeep(admissions);
            this.allConnectProfileForCheckbox = _.concat(this.allConnectProfileForCheckbox, resp);
            const page = pageNumber + 1;
            this.connectRegistration(page);
          } else {
            this.isWaitingForResponse = false;
            if (this.isCheckedAll) {
              if (this.allConnectProfileForCheckbox && this.allConnectProfileForCheckbox.length) {
                this.dataSelected = this.allConnectProfileForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                this.dataSelected = _.uniqBy(this.dataSelected, '_id');
              }
            }

            this.dataSelected = this.dataSelected.map((list) => {
              return {
                scholar_season_id: this.scholarSeason._id,
                school_id: this.school._id,
                ...list,
              };
            });

            this.subs.sink = this.dialog
              .open(ConnectRegistrationProfileDialogComponent, {
                width: '600px',
                minHeight: '100px',
                data: this.dataSelected,
                disableClose: true,
              })
              .afterClosed()
              .subscribe((res) => {
                if (res) {
                  this.clearSelectIfFilter();
                  this.getallIntakeChannels();
                }
              });
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err);
        },
      );
    }
  }

  cleanFilterDataCSV() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key !== 'campus' &&
          key !== 'level' &&
          key !== 'sector' &&
          key !== 'speciality' &&
          key !== 'school' &&
          key !== 'scholar_season_ids'
        ) {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        } else if (key === 'campus') {
          let campus = [];
          if (this.filteredValues.campus && this.filteredValues.campus.length) {
            campus = this.filteredValues.campus.map((res) => `"` + res + `"`);
          }
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${campus}]` : filterQuery + `"${key}":[${campus}]`;
        } else if (key === 'school') {
          if (this.school && this.school.short_name && this.school.short_name.length) {
            filterQuery = filterQuery
              ? filterQuery + ',' + `"${key}":["${this.school.short_name}"]`
              : filterQuery + `"${key}":["${this.school.short_name}"]`;
          }
        } else if (key === 'scholar_season_ids') {
          filterQuery = filterQuery
            ? filterQuery + ',' + `"${key}":["${this.scholarSeason._id}"]`
            : filterQuery + `"${key}":["${this.scholarSeason._id}"]`;
        } else if (key === 'level') {
          let level = [];
          if (this.filteredValues.level && this.filteredValues.level.length) {
            level = this.filteredValues.level.map((res) => `"` + res + `"`);
          }
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${level}]` : filterQuery + `"${key}":[${level}]`;
        } else if (key === 'sector') {
          let sector = [];
          if (this.filteredValues.sector && this.filteredValues.sector.length) {
            sector = this.filteredValues.sector.map((res) => `"` + res + `"`);
          }
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${sector}]` : filterQuery + `"${key}":[${sector}]`;
        } else if (key === 'speciality') {
          let speciality = [];
          if (this.filteredValues.speciality && this.filteredValues.speciality.length) {
            speciality = this.filteredValues.speciality.map((res) => `"` + res + `"`);
          }
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${speciality}]` : filterQuery + `"${key}":[${speciality}]`;
        }
      }
    });
    return 'filter={' + filterQuery + '}';
  }

  downloadCSV() {
    if (
      this.dataSelected &&
      this.dataSelected.length < 1 &&
      (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length))
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Admission') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
      return;
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
            if ((<HTMLInputElement>e.target).value) {
              Swal.enableConfirmButton();
            }
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
    const importStudentTemlate = `downloadAdmissionChannel/`;
    let filter;
    if (
      (this.dataSelected && this.dataSelected.length && !this.isCheckedAll) ||
      (this.dataUnselectUser && this.dataUnselectUser.length && this.isCheckedAll)
    ) {
      const mappedIds = this.dataSelected.map((res) => `"` + res._id + `"`);
      filter =
        `filter={"scholar_season_ids": ["` +
        this.scholarSeason._id +
        '"], "program_ids": [' +
        mappedIds.toString() +
        '], "school": ["' +
        this.school.short_name +
        '"] }';
    } else {
      // filter = `filter={}`;
      filter = this.cleanFilterDataCSV();
    }
    const sorting = this.sortingForExport();
    const fullURL =
      url + importStudentTemlate + fileType + '/' + lang + '?' + filter + '&' + sorting + '&' + `user_type_id="${this.currentUserTypeId}"`;
    console.log(fullURL, 'fullURL::::::::::');
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
      }),
    };

    this.isWaitingForResponse = true;
    this.httpClient.get(`${encodeURI(fullURL)}`, httpOptions).subscribe(
      (res) => {
        if (res) {
          console.log(res, 'res');
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
        console.log('uat 389 error', err);
      },
    );
    // element.href = encodeURI(url + importStudentTemlate + fileType + '/' + lang + '?' + filter);
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
  exportAllData(exportData) {
    const datasForExport = exportData;
    const data = [];
    if (datasForExport && datasForExport.length) {
      for (const item of datasForExport) {
        let intake = '';
        const volume = item.volume_hours && item.volume_hours.length ? item.volume_hours[item.volume_hours.length - 1].volume_hour : '';
        for (const entity of item.legal_entities_id) {
          intake = intake
            ? intake + ', ' + (entity.legal_entity_name ? entity.legal_entity_name : '')
            : entity.legal_entity_name
            ? entity.legal_entity_name
            : '';
        }
        const obj = [];
        obj[0] = item.intake_channel;
        obj[1] = item.season;
        obj[2] = item.school;
        obj[3] = item.campus;
        obj[4] = item.level;
        obj[5] = item.sector_id ? item.sector_id.name : '-';
        obj[6] = item.speciality_id ? item.speciality_id.name : '-';
        obj[7] = item.down_payment_id && item.down_payment_id.internal ? item.down_payment_id.internal : '-';
        obj[8] = item.down_payment_id && item.down_payment_id.external ? item.down_payment_id.external : '-';
        obj[9] = item.full_rate_id && item.full_rate_id.amount_internal ? item.full_rate_id.amount_internal : '-';
        obj[10] = item.full_rate_id && item.full_rate_id.amount_external ? item.full_rate_id.amount_external : '-';
        obj[11] = intake ? intake : '-';
        obj[12] = volume ? volume : '-';
        data.push(obj);
      }
      const valueRange = { values: data };
      const today = moment().format('DD-MM-YYYY');
      const sheetID = this.translate.currentLang === 'en' ? 0 : 997136311;
      const title = this.exportName + '_' + today;
      const sheetData = {
        spreadsheetId: '1j7EAJvvHoPC7DffQxfIPVNGKztSZc0YyjE-I2zf0r2I',
        sheetId: sheetID,
        range: 'A4',
      };
      this.exportCsvService.createAndUpdateSpreadsheet(valueRange, title, sheetData);
    }
    Swal.close();
  }

  filterBreadcrumbFormat(){

    const filterInfo: FilterBreadCrumbInput[] = [     
      // Table Filter
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'campus', // name of the key in the object storing the filter
        column: 'Campus', // name of the column in the table or the field if super filter
        isMultiple: true, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.campusList, // the array/list holding the dropdown options
        filterRef: this.campusFilterCtrl, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'name', // the key displayed in the html (only applicable to array of objects)
        savedValue: 'name', // the value saved when user select an option (e.g. _id)
        noTranslate: true,
        resetValue: 'All',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'level', // name of the key in the object storing the filter
        column: 'Level', // name of the column in the table or the field if super filter
        isMultiple: true, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.levelList, // the array/list holding the dropdown options
        filterRef: this.levelFilterCtrl, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'name', // the key displayed in the html (only applicable to array of objects)
        savedValue: 'name', // the value saved when user select an option (e.g. _id)
        noTranslate: true,
        resetValue: 'All',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'sector', // name of the key in the object storing the filter
        column: 'Sector', // name of the column in the table or the field if super filter
        isMultiple: true, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.sectorList, // the array/list holding the dropdown options
        filterRef: this.sectorFilterCtrl, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'name', // the key displayed in the html (only applicable to array of objects)
        savedValue: '_id', // the value saved when user select an option (e.g. _id)
        noTranslate: true,
        resetValue: 'All',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'speciality', // name of the key in the object storing the filter
        column: 'Speciality', // name of the column in the table or the field if super filter
        isMultiple: true, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.specialityList, // the array/list holding the dropdown options
        filterRef: this.specialityFilterCtrl, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'name', // the key displayed in the html (only applicable to array of objects)
        savedValue: '_id', // the value saved when user select an option (e.g. _id)
        noTranslate: true,
        resetValue: 'All',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'start_date', // name of the key in the object storing the filter
        column: 'Starting date', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.startingDateFilterCtrl, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true,
        resetValue: 'All',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'registration_profile', // name of the key in the object storing the filter
        column: 'Registration Profile', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.regisList, // the array/list holding the dropdown options
        filterRef: this.regisFilterCtrl, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'name', // the key displayed in the html (only applicable to array of objects)
        savedValue: 'name', // the value saved when user select an option (e.g. _id)
        noTranslate: true,
        resetValue: 'All',
      }
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
   
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      if (
        filterItem?.type === 'table_filter' &&
        (filterItem?.name === 'campus' ||
          filterItem?.name === 'level' ||
          filterItem?.name === 'sector' ||
          filterItem?.name === 'speciality'
          )
      ) {
        this.selectAll(filterItem?.name)
        
      } else if(filterItem?.name === 'registration_profile'){
        this.selectRegist('All')
      } else if(filterItem?.name === 'start_date'){
        this.startingDateFilterCtrl.patchValue(null, { emitEvent: false });
        this.filteredValues.start_date = null
      }
    }
    this.getallIntakeChannels();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  transformStartDate(data) {
    if (data && data.start_date && data.start_date.date && data.start_date.time) {
      const date = data.start_date.date;
      const time = data.start_date.time;

      const datee = this.parseUtcToLocalPipe.transformDate(date, time);
      return datee;
    } else {
      return '';
    }
  }
}
