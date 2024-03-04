import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { Observable, of } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { FinancesService } from 'app/service/finance/finance.service';
import { AlumniService } from 'app/service/alumni/alumni.service';
import { AddAlumniDialogComponent } from 'app/alumni/add-alumni-dialog/add-alumni-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import Swal from 'sweetalert2';
import { ApplicationUrls } from 'app/shared/settings';
import * as moment from 'moment';
import { PermissionService } from 'app/service/permission/permission.service';

@Component({
  selector: 'ms-alumni-file',
  templateUrl: './alumni-file.component.html',
  styleUrls: ['./alumni-file.component.scss'],
})
export class AlumniFileComponent implements OnInit, OnDestroy, AfterViewInit {
  isWaitingForResponse: Boolean = true;
  selectedMentor: any = null;
  selectedAdmissionMember: any = null;
  admissionMemberList = [];
  private selectedIndex;
  intakeChannelList = [];
  admissionMemberFilteredList: Observable<any>;
  admissionMemberFilter = new UntypedFormControl('');
  mentorFilter = new UntypedFormControl('');
  mentorFilteredList: Observable<any>;
  campusFilter = new UntypedFormControl(null);
  // campusFilteredList: Observable<any>;
  schoolFilter = new UntypedFormControl('');
  schoolsFilteredList: Observable<any>;
  intakeChannelFilter = new UntypedFormControl('');
  intakeChannelFilteredList: Observable<any>;
  searchByNameFilter = new UntypedFormControl('');
  myInnerHeight = 1920;
  currSelectedCandidateId = '';
  currSelectedCandidate: any;
  candidatesList = [];
  tab = '';
  tabs = {
    'note-tab': 'Add a Note',
    'history-tab': 'Candidate history',
    'edit-tab': 'Modifications',
    'information-tab': 'Information',
  };
  filteredValues = {
    full_name: '',
    used_family_name: '',
    name: '',
    promo_year: '',
    school: '',
    campus: '',
    sector: '',
    speciality: '',
    country: '',
    city: '',
    professional_status: '',
    company: '',
    updated_at: '',
    sent_by: '',
    survey_sent: '',

    latest_updated: null,
    last_survey_sent: null,
    offset: null,

    // abovetable
    promo_years: '',
    schools: '',
    campuses: '',
    sectors: '',
    specialities: '',
  };
  isReset = false;
  sortValue = null;
  private subs = new SubSink();
  maleCandidateIcon = '../../../../../assets/img/student_icon.png';
  femaleCandidateIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  userProfilePic = '../../../../../assets/img/user-1.jpg';
  userProfilePic1 = '../../../../../assets/img/user-3.jpg';
  userProfilePic2 = '../../../../../assets/img/user-5.jpg';
  greenHeartIcon = '../../../../../assets/img/enagement_icon_green.png';
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  // Configuration of the Popup Size and display
  configCat: MatDialogConfig = {
    disableClose: true,
    panelClass: 'certification-rule-pop-up',
    minWidth: '95%',
    minHeight: '81%',
  };
  promotionList = [];
  school = [];
  promoFilter = new UntypedFormControl(null);
  schoolsFilter = new UntypedFormControl(null);
  specialityFilter = new UntypedFormControl(null);
  sectorFilter = new UntypedFormControl(null);
  filteredSchool: Observable<any[]>;
  filteredCampus: Observable<any[]>;
  listObjective = [];
  levels = [];
  campusList = [];
  schoolName = '';
  specilityList = [];
  mentorList = [];
  schoolsList = [];
  sectorList = [];
  campusListCandidate = [];
  dataCount = 0;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  currentUser: any;
  isPermission: any;
  currentUserTypeId: any;
  turnOnCascade = true;
  filterBreadcrumbData = [];

  constructor(
    private route: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private translate: TranslateService,
    private candidatesService: CandidatesService,
    private financeService: FinancesService,
    private alumniService: AlumniService,
    public dialog: MatDialog,
    private userService: AuthService,
    public permissionService: PermissionService,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    let name = this.translate.instant('NAV.alumni-cards');
    this.pageTitleService.setTitle(name);

    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      name = this.translate.instant('NAV.alumni-cards');
      this.pageTitleService.setTitle(name);
    });
    // this.getDataForList();
    // this.getDataFilliere();
    this.getDataDropdown();
    this.initFilter();
    this.getAllIntakeChannelDropdown();

    this.route.queryParams.subscribe((query) => {
      this.currSelectedCandidateId = query.selectedProfile;
      this.sortValue = query.sortValue ? JSON.parse(query.sortValue) : null;
      const pagination = query.paginator ? JSON.parse(query.paginator) : null;
      if (pagination) {
        this.paginator = Object.assign(this.paginator, pagination);
      }
      if (query.filteredValues) {
        this.filteredValues = JSON.parse(query.filteredValues);
        console.log('this.filteredValues', this.filteredValues);
        if (this.filteredValues && this.filteredValues.schools) {
          this.schoolsFilter.setValue(this.filteredValues.schools);
        }
        if (this.filteredValues && this.filteredValues.campuses) {
          this.campusFilter.setValue(this.filteredValues.campuses);
        }
        if (this.filteredValues && this.filteredValues.promo_years) {
          this.promoFilter.setValue(this.filteredValues.promo_years);
        }
        if (this.filteredValues && this.filteredValues.specialities) {
          this.specialityFilter.setValue(this.filteredValues.specialities);
        }
        if (this.filteredValues && this.filteredValues.sectors) {
          this.sectorFilter.setValue(this.filteredValues.sectors);
        }
      }
      this.tab = query.tab;
    });
    this.getCandidatesData();
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getCandidatesData();
          }
        }),
      )
      .subscribe();
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  // *************** To Get Height window screen and put in style css height
  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 231;
    return this.myInnerHeight;
  }
  // *************** To Get Height window screen and put in style css height
  getCardHeight() {
    this.myInnerHeight = window.innerHeight - 263;
    return this.myInnerHeight;
  }
  checkSuperFilterPromo() {
    const form = this.promoFilter.value;
    if (form && form.length) {
      this.promoFilter.setValue(form);
    } else {
      this.promoFilter.setValue(null);
    }
    this.filteredValues.promo_years =
      this.promoFilter.value?.length && !this.promoFilter.value.includes('All') ? this.promoFilter.value : null;
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.getCandidatesData();
    }
  }
  checkSuperFilterSchool() {
    const form = this.schoolsFilter.value;
    if (form && form.length) {
      this.schoolsFilter.setValue(form);
    } else {
      this.schoolsFilter.setValue(null);
    }
    this.getDataCampusBySchool('');
  }
  getDataCampusBySchool(event?) {
    console.log('getDataCampusBySchool', event);
    const school = this.schoolsFilter.value && this.schoolsFilter.value.length ? true : false;
    const filter = {
      school: school && this.schoolsFilter.value && !this.schoolsFilter.value.includes('All') ? this.schoolsFilter.value : null,
    };
    if (this.turnOnCascade) {
      this.campusList = [];
      if (this.schoolsFilter.value && this.schoolsFilter.value.length) {
        this.subs.sink = this.alumniService.GetAllAlumniCampusBySchool(filter).subscribe(
          (resp) => {
            if (resp && resp.length) {
              this.campusFilter.setValue(null, { emitEvent: false });
              this.sectorFilter.setValue(null, { emitEvent: false });
              this.specialityFilter.setValue(null, { emitEvent: false });
              this.filteredValues.campuses = null;
              this.filteredValues.sectors = null;
              this.filteredValues.specialities = null;
              this.campusList = this.standardizeDataList(resp);
              this.getDataSectorByCampus(event);
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
      } else {
        this.campusFilter.setValue(null, { emitEvent: false });
        this.sectorFilter.setValue(null, { emitEvent: false });
        this.specialityFilter.setValue(null, { emitEvent: false });
        this.filteredValues.campuses = null;
        this.filteredValues.sectors = null;
        this.filteredValues.specialities = null;
        this.getDataCampus();
      }
    }
  }
  checkSuperFilterCampus() {
    const form = this.campusFilter.value;
    if (form && form.length) {
      this.campusFilter.setValue(form);
    } else {
      this.campusFilter.setValue(null);
    }
    this.getDataSectorByCampus('');
  }

  getDataSectorByCampus(event?) {
    console.log('getDataSectorByCampus', event);
    const school = this.schoolsFilter.value && this.schoolsFilter.value.length ? true : false;
    const campus = this.campusFilter.value && this.campusFilter.value.length ? true : false;
    const filter = {
      school: school && this.schoolsFilter.value && !this.schoolsFilter.value.includes('All') ? this.schoolsFilter.value : null,
      campus: campus && this.campusFilter.value && !this.campusFilter.value.includes('All') ? this.campusFilter.value : null,
    };
    if (this.turnOnCascade) {
      this.sectorList = [];
      if (school || campus) {
        this.subs.sink = this.alumniService.GetAllAlumniSectorByCampus(filter).subscribe(
          (resp) => {
            if (resp && resp.length) {
              this.sectorFilter.setValue(null, { emitEvent: false });
              this.specialityFilter.setValue(null, { emitEvent: false });
              this.filteredValues.sectors = null;
              this.filteredValues.specialities = null;
              this.sectorList = resp;
              this.getDataSpecialityBySector(event);
            }
          },
          (err) => {
            this.userService.postErrorLog(err);
          },
        );
      } else {
        this.sectorFilter.setValue(null, { emitEvent: false });
        this.specialityFilter.setValue(null, { emitEvent: false });
        this.filteredValues.sectors = null;
        this.filteredValues.specialities = null;
        this.getDataSector();
      }
    }
  }
  checkSuperFilterSector() {
    const form = this.sectorFilter.value;
    if (form && form.length) {
      this.sectorFilter.setValue(form);
    } else {
      this.sectorFilter.setValue(null);
    }
    this.getDataSpecialityBySector('');
  }

  getDataSpecialityBySector(event?) {
    console.log('getDataSpecialityBySector', event);
    const school = this.schoolsFilter.value && this.schoolsFilter.value.length ? true : false;
    const campus = this.campusFilter.value && this.campusFilter.value.length ? true : false;
    const sector = this.sectorFilter.value && this.sectorFilter.value.length ? true : false;
    const filter = {
      school: school && this.schoolsFilter.value && !this.schoolsFilter.value.includes('All') ? this.schoolsFilter.value : null,
      campus: campus && this.campusFilter.value && !this.campusFilter.value.includes('All') ? this.campusFilter.value : null,
      sector: sector && this.sectorFilter.value && !this.sectorFilter.value.includes('All') ? this.sectorFilter.value : null,
    };
    if (this.turnOnCascade) {
      this.specilityList = [];
      if (school || campus || sector) {
        this.subs.sink = this.alumniService.GetAllAlumniSpecialityBySector(filter).subscribe(
          (resp) => {
            if (resp && resp.length) {
              this.specialityFilter.setValue(null, { emitEvent: false });
              this.filteredValues.specialities = null;
              this.specilityList = resp;
            }
          },
          (err) => {
            this.userService.postErrorLog(err);
          },
        );
      } else {
        this.specialityFilter.setValue(null, { emitEvent: false });
        this.filteredValues.specialities = null;
        this.getDataSpeciality();
      }
    }
  }
  checkSuperFilterSpeciality() {
    const form = this.specialityFilter.value;
    if (form && form.length) {
      this.specialityFilter.setValue(form);
    } else {
      this.specialityFilter.setValue(null);
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
  //   this.levels = [];
  //   this.campusList = [];
  //   if (this.campusFilter.value) {
  //     this.campusFilter.setValue(null);
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
  //     // this.getDataLevel();
  //   } else {
  //     this.listObjective.filter((campus, n) => {
  //       if (campus.campuses && campus.campuses.length) {
  //         campus.campuses.filter((campuses, nex) => {
  //           this.campusList.push(campuses);
  //         });
  //       }
  //     });
  //     this.filteredCampus = of(this.campusList.map((nam) => nam.name));
  //     // this.getDataLevel();
  //   }

  //   this.campusList = _.uniqBy(this.campusList, 'name');
  // }

  initFilter() {
    this.subs.sink = this.promoFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.promo_years = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      // if (!this.isReset) {
      //   this.getCandidatesData();
      // }
    });

    this.subs.sink = this.schoolsFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.schools = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData();
      }
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.campuses = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData();
      }
    });

    this.subs.sink = this.specialityFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.specialities = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData();
      }
    });

    this.subs.sink = this.sectorFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.sectors = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData();
      }
    });

    this.subs.sink = this.searchByNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!name.match(symbol) && !name.match(symbol1)) {
        this.filteredValues.full_name = name;
        this.filteredValues.name = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData();
        }
      } else {
        this.searchByNameFilter.setValue('', { emitEvent: false });
        this.filteredValues.full_name = '';
        this.filteredValues.name = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData();
        }
      }
    });
  }

  // Get candidate data
  getCandidatesData(type?) {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    this.subs.sink = this.candidatesService.getAlumniCards(filter, pagination).subscribe(
      (candidates: any) => {
        console.log('_can', candidates);
        if (candidates && candidates.length) {
          this.candidatesList = candidates;
          console.log(this.candidatesList);

          this.paginator.length = candidates[0].count_document;
          const filteredCandidate = candidates.filter((candidate) => this.currSelectedCandidateId === candidate._id);
          // filter out student_mentor_id  with null value
          const mentors = candidates.filter((candidate) => candidate.student_mentor_id).map((candidate) => candidate.student_mentor_id);
          // filter out admissions_members with null value
          const admissionMembers = candidates
            .filter((candidate) => candidate.admission_member_id)
            .map((candidate) => candidate.admission_member_id);
          const schools = candidates.filter((candidate) => candidate.school).map((candidate) => candidate.school);
          const campus = candidates.filter((candidate) => candidate.campus).map((candidate) => candidate.campus);
          this.mentorList = _.uniqBy(mentors, '_id');
          this.admissionMemberList = _.uniqBy(admissionMembers, '_id');
          // this.schoolsList = _.uniqBy(schools);
          this.campusListCandidate = _.uniqBy(campus);
          if (type === 'reset') {
            this.currSelectedCandidate = candidates[0];
            this.currSelectedCandidateId = candidates[0]._id;
          } else {
            this.currSelectedCandidate = filteredCandidate && filteredCandidate.length ? filteredCandidate[0] : candidates[0];
            this.currSelectedCandidateId = filteredCandidate && filteredCandidate.length ? filteredCandidate[0]._id : candidates[0]._id;
          }
          this.dataCount = candidates[0].count_document;
        } else {
          this.candidatesList = [];
          this.paginator.length = 0;
        }
        this.isWaitingForResponse = false;
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
        setTimeout(() => {
          this.isReset = false;
        }, 500);
      },
      (error) => {
        this.candidatesList = [];
        this.paginator.length = 0;
        this.isReset = false;
        this.isWaitingForResponse = false;
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
  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'promo_years', // name of the key in the object storing the filter
        column: 'ALUMNI.Promo year', // name of the column in the table or the field if super filter
        isMultiple: true, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.promotionList, // the array/list holding the dropdown options
        filterRef: this.promoFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        resetValue: ['All'],
      },
      {
        type: 'super_filter',
        name: 'schools',
        column: 'ALUMNI.School',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.schoolsList,
        filterRef: this.schoolsFilter,
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'short_name',
        savedValue: 'short_name',
        resetValue: ['All'],
      },
      {
        type: 'super_filter',
        name: 'campuses',
        column: 'ALUMNI.Campus',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.campusList,
        filterRef: this.campusFilter,
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'short_name',
        savedValue: '_id',
        resetValue: ['All'],
      },
      {
        type: 'super_filter',
        name: 'sectors',
        column: 'ALUMNI.Sector',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.sectorList,
        filterRef: this.sectorFilter,
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'name',
        savedValue: '_id',
        resetValue: ['All'],
      },
      {
        type: 'super_filter',
        name: 'specialities',
        column: 'ALUMNI.Speciality',
        isMultiple: true,
        filterValue: this.filteredValues,
        filterList: this.specilityList,
        filterRef: this.specialityFilter,
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'name',
        savedValue: '_id',
        resetValue: ['All'],
      },
      {
        type: 'super_filter',
        name: 'full_name',
        column: 'ALUMNI.Search a name',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.searchByNameFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }
  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.filteredValues);
      if (filterItem.type === 'super_filter') {
        if (filterItem.name === 'schools') {
          this.filteredValues.campuses = null;
          this.filteredValues.sectors = null;
          this.filteredValues.specialities = null;
          this.getDataCampusBySchool();
        } else if (filterItem.name === 'campuses') {
          this.filteredValues.sectors = null;
          this.filteredValues.specialities = null;
          this.getDataSectorByCampus();
        } else if (filterItem.name === 'sectors') {
          this.filteredValues.specialities = null;
          this.getDataSpecialityBySector();
        }
        this.paginator.pageIndex = 0;
      }
      this.getCandidatesData();
    }
  }

  reload(value) {
    if (value) {
      this.getCandidatesData();
    }
  }

  addAlumni() {
    this.subs.sink = this.dialog
      .open(AddAlumniDialogComponent, {
        ...this.configCat,
      })
      .afterClosed()
      .subscribe((isRegistered) => {
        if (isRegistered) {
          this.searchByNameFilter.setValue(isRegistered.last_name, { emitEvent: false });
          this.filteredValues.full_name = isRegistered.last_name;
          this.filteredValues.name = isRegistered.first_name;
        }
        this.getCandidatesData();
      });
  }

  getAllIntakeChannelDropdown() {
    const filter = '';
    this.subs.sink = this.candidatesService.getAllIntakeChannelDropdown(filter).subscribe(
      (list: any) => {
        if (list && list.length) {
          this.intakeChannelList = _.uniqBy(list);
          this.intakeChannelFilteredList = of(this.intakeChannelList);
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

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    let promoYearMap;
    let schoolsMap;
    let campusesMap;
    let sectorMap;
    let specialityMap;
    Object.keys(filterData).forEach((key) => {
      if (filterData[key] || filterData[key] === false) {
        if (key === 'last_survey_sent') {
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
        } else if (key === 'offset') {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        } else {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        }
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  selectMentor(mentorId) {
    const filteredMentor = this.mentorList.filter((mentor) => mentor._id === mentorId);
    this.selectedMentor = filteredMentor.length ? filteredMentor[0] : null;
  }
  selectAdmissionMember(admissionMemberId) {
    console.log(admissionMemberId);
    const filteredAdmissionMember = this.admissionMemberList.filter((member) => member._id === admissionMemberId);
    this.selectedAdmissionMember = filteredAdmissionMember.length ? filteredAdmissionMember[0] : null;
  }
  filterAdmissionMember(value) {
    return this.admissionMemberList.filter((member) => RegExp(`^${value}.*`, 'ig').test(member.last_name));
  }
  filterMentor(value) {
    return this.mentorList.filter((mentor) => RegExp(`^${value}.*`, 'ig').test(mentor.last_name));
  }
  filterCampus(value) {
    return this.campusList.filter((campus) => RegExp(`^${value}.*`, 'ig').test(campus));
  }
  filterSchool(value) {
    return this.schoolsList.filter((school) => RegExp(`^${value}.*`, 'ig').test(school));
  }
  filterIntakeChannel(value) {
    return this.intakeChannelList.filter((intakeChannel) => RegExp(`^${value}.*`, 'ig').test(intakeChannel));
  }
  updatedSelectedCandidate(newSelection) {
    this.currSelectedCandidateId = newSelection;
    const filteredCandidate = this.candidatesList.filter((candidate) => newSelection === candidate._id);
    this.currSelectedCandidate = filteredCandidate[0];
  }
  resetCandidateFile() {
    this.isReset = true;
    this.paginator.pageIndex = 0;

    this.filteredValues = {
      full_name: '',
      used_family_name: '',
      name: '',
      promo_year: '',
      school: '',
      campus: '',
      sector: '',
      speciality: '',
      country: '',
      city: '',
      professional_status: '',
      company: '',
      updated_at: '',
      sent_by: '',
      survey_sent: '',

      latest_updated: null,
      last_survey_sent: null,
      offset: null,

      // abovetable
      promo_years: '',
      schools: '',
      campuses: '',
      sectors: '',
      specialities: '',
    };
    this.searchByNameFilter.setValue('', { emitEvent: false });
    this.intakeChannelFilter.setValue('All', { emitEvent: false });
    this.admissionMemberFilter.setValue('', { emitEvent: false });
    this.mentorFilter.setValue('', { emitEvent: false });
    this.schoolFilter.setValue('', { emitEvent: false });
    this.campusFilter.setValue(null, { emitEvent: false });

    this.promoFilter.setValue(null, { emitEvent: false });
    this.sectorFilter.setValue(null, { emitEvent: false });
    this.schoolsFilter.setValue(null, { emitEvent: false });
    this.specialityFilter.setValue(null, { emitEvent: false });

    this.sortValue = null;
    this.filterBreadcrumbData = [];
    this.getCandidatesData('reset');
    this.getAllIntakeChannelDropdown();
  }

  getDataDropdown() {
    this.getDataPromoYear();
    this.getDataSchool();
    this.getDataCampus();
    this.getDataSector();
    this.getDataSpeciality();
  }

  getDataPromoYear() {
    this.promotionList = [];
    this.subs.sink = this.alumniService.GetAllAlumniPromoYear().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.promotionList = resp.filter((program) => program !== '');
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
          this.schoolsList = resp;
          console.log('SCHOOLS LIST ON GETDATA: ', this.schoolsList);
        }
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
          this.campusList = resp;
          this.campusList = this.standardizeDataList(this.campusList);
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
        }
      },
      (error) => {
        this.userService.postErrorLog(error);
      },
    );
  }

  getDataSpeciality() {
    this.specilityList = [];
    this.subs.sink = this.alumniService.GetAllAlumniSpeciality().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.specilityList = resp;
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

  standardizeDataList(data: any) {
    // this function is to standardize list of data format
    const data2 = data.map((a) => ({
      _id: a,
      short_name: a,
    }));

    return data2;
  }
  isAllDropdownSelected(type) {
    if (type === 'promo') {
      const selected = this.promoFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.promotionList.length;
      return isAllSelected;
    } else if (type === 'school') {
      const selected = this.schoolsFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.schoolsList.length;
      return isAllSelected;
    } else if (type === 'campus') {
      const selected = this.campusFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.campusList.length;
      return isAllSelected;
    } else if (type === 'sector') {
      const selected = this.sectorFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.sectorList.length;
      return isAllSelected;
    } else if (type === 'speciality') {
      const selected = this.specialityFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.specilityList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'promo') {
      const selected = this.promoFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.promotionList.length;
      return isIndeterminate;
    } else if (type === 'school') {
      const selected = this.schoolsFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.schoolsList.length;
      return isIndeterminate;
    } else if (type === 'campus') {
      const selected = this.campusFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.campusList.length;
      return isIndeterminate;
    } else if (type === 'sector') {
      const selected = this.sectorFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.sectorList.length;
      return isIndeterminate;
    } else if (type === 'speciality') {
      const selected = this.specialityFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.specilityList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'promo') {
      if (event.checked) {
        this.promoFilter.patchValue(this.promotionList, { emitEvent: false });
      } else {
        this.promoFilter.patchValue(null, { emitEvent: false });
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
        this.campusFilter.patchValue(campusData, { emitEvent: false });
      } else {
        this.campusFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'sector') {
      if (event.checked) {
        const sectorData = this.sectorList.map((el) => el._id);
        this.sectorFilter.patchValue(sectorData, { emitEvent: false });
      } else {
        this.sectorFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'speciality') {
      if (event.checked) {
        const specialityData = this.specilityList.map((el) => el._id);
        this.specialityFilter.patchValue(specialityData, { emitEvent: false });
      } else {
        this.specialityFilter.patchValue(null, { emitEvent: false });
      }
    }
  }
}
