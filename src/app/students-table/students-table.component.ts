import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { SendMultipleEmailComponent } from 'app/internship-file/send-multiple-email/send-multiple-email.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { environment } from 'environments/environment';
import * as _ from 'lodash';
import * as moment from 'moment';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { AssignSequenceDialogComponent } from './assign-sequence-dialog/assign-sequence-dialog.component';
import { SendOneTimeFormDialogComponent } from './send-one-time-form-dialog/send-one-time-form-dialog.component';
import { StudentsTableService } from './StudentTable.service';
import { DomSanitizer } from '@angular/platform-browser';
import { InternshipEmailDialogComponent } from 'app/internship-file/internship-email-dialog/internship-email-dialog.component';

@Component({
  selector: 'ms-students-table',
  templateUrl: './students-table.component.html',
  styleUrls: ['./students-table.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class StudentsTableComponent implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns: string[] = [
    'checkbox',
    'student-number',
    'name',
    'intake-channel',
    'type-of-registration',
    'type-of-formation',
    'current-program',
    'status',
    'registration-date',
    'financial-situation',
    'payment-information',
    'assignment-sequence',
    'current-sequence',
    'current-group',
    'type-of-sequence',
    'action',
  ];
  candidate_admission_statuses = [
    'admission_in_progress',
    'bill_validated',
    'engaged',
    'registered',
    'resigned',
    'resigned_after_engaged',
    'resigned_after_registered',
    'report_inscription',
    'in_scholarship',
    'mission_card_validated',
    'resignation_missing_prerequisites',
    'resign_after_school_begins',
    'no_show',
    // 'deactivated',
  ];
  filterCols: string[] = this.displayedColumns.map((col) => `${col}-filter`);
  allowExport = false;
  allowActions = false;
  allowAssignSequences = false;
  allowSendEmail = false;
  filterBreadcrumbData: any[] = [];

  superFilter = {
    value: {
      scholar_season_id: null,
      school_ids: null,
      campus_ids: null,
      level_ids: null,
      sector_ids: null,
      speciality_ids: null,
      tag_ids: null,
    },
    controls: {
      scholar_season_filter: new UntypedFormControl('All'),
      schools_filter: new UntypedFormControl(null),
      campuses_filter: new UntypedFormControl(null),
      levels_filter: new UntypedFormControl(null),
      sector_filter: new UntypedFormControl(null),
      speciality_filter: new UntypedFormControl(null),
      tagFilter: new UntypedFormControl(null),
    },
  };

  superFilterVal: any;
  isSuperFilterApplied = false;

  filter = {
    value: {
      student_number: null,
      full_name: null,
      initial_intake_channel: null,
      type_of_registration: null,
      type_of_formation: null,
      programs: null,
      student_status: 'registered',
      registration_date: null,
      financial_situations: null,
      modality_step_special_form_statuses: null,
      assignment_sequences: null,
      current_sequence: null,
      current_student_class: null,
      type_of_sequence: null,
      offset: null,
      initial_intake_channels: null,
      type_of_registrations: null,
      type_of_formations: null,
      type_of_sequences: null,
      student_statuses: null,
      is_registered_table: true,
    },
    controls: {
      student_number: new UntypedFormControl(null),
      full_name: new UntypedFormControl(null),
      initial_intake_channel_filter: new UntypedFormControl(null),
      current_program_filter: new UntypedFormControl(null),
      registration_date: new UntypedFormControl(null),
      current_sequence: new UntypedFormControl(null),
      current_group: new UntypedFormControl(null),
      type_of_sequence: new UntypedFormControl(null),
      // controls below are added only for the sake of clearing mat-select value when resetting the filter.
      type_of_registration: new UntypedFormControl(null),
      type_of_formation: new UntypedFormControl(null),
      student_status: new UntypedFormControl(null),
      financial_situation: new UntypedFormControl(null),
      modality_step_special_form_status: new UntypedFormControl(null),
      assignment_sequence: new UntypedFormControl(null),
      // superfilter
      scholar_season_filter: new UntypedFormControl(null),
      schools_filter: new UntypedFormControl(null),
      campuses_filter: new UntypedFormControl(null),
      levels_filter: new UntypedFormControl(null),
      sector_filter: new UntypedFormControl(null),
      speciality_filter: new UntypedFormControl(null),
      tagFilter: new UntypedFormControl(null),
    },
  };

  listObjective = [];
  originalScholar = [];

  dropdowns = {
    intake_channels: {
      initial: [],
      filtered: [],
    },
    type_of_registrations: [
      {
        value: 'admission',
        label: this.translate.instant('perimeter.admission'),
      },
      {
        value: 'readmission',
        label: this.translate.instant('perimeter.readmission'),
      },
    ],
    type_of_formations: [],
    programs: {
      initial: [],
      filtered: [],
    },
    statuses: [{ value: 'registered', label: this.translate.instant('registered') }],
    financial_situations: [
      { value: 'ok', label: this.translate.instant('ok') },
      { value: 'not_ok', label: this.translate.instant('not_ok') },
    ],
    modality_step_special_form_statuses: [
      {
        value: 'no_modality_payment',
        label: this.translate.instant('PAYMENT_INFORMATION.no_modality_payment'),
      },
      {
        value: 'sent',
        label: this.translate.instant('PAYMENT_INFORMATION.sent'),
      },
      {
        value: 'completed',
        label: this.translate.instant('PAYMENT_INFORMATION.completed'),
      },
    ],
    type_of_sequences: [
      {
        value: 'enseignement',
        label: this.translate.instant('course_sequence.enseignement'),
      },
      {
        value: 'period_in_company',
        label: this.translate.instant('course_sequence.period_in_company'),
      },
      {
        value: 'school_exchange',
        label: this.translate.instant('course_sequence.school_exchange'),
      },
    ],
    // superfilter
    scholar_season: [],
    schools: [],
    campuses: [],
    levels: [],
    sectors: [],
    specialities: [],
    tagList: [],
  };

  dialogConfig: MatDialogConfig = {
    disableClose: true,
    minWidth: '750px',
    autoFocus: false,
  };

  private subs = new SubSink();

  studentIds: string[] = [];
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  noData: any;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  sortValue = null;
  dataCount = 0;

  dataLoaded: Boolean = false;
  isWaitingForResponse = false;
  isLoading: Boolean = false;
  isReset: Boolean = false;

  isCheckedAll = false;
  disabledExport = true;
  selectType: any;
  dataSelected = [];
  dataSelectedId = [];
  dataUnselect = [];
  clickedActionButton: string | null = null;
  allStudentForCheckbox = [];
  allStudentsData = [];
  allStudentsEmail = [];
  pageSelected = [];

  shieldAccountIcon = '../../../../../assets/img/shield-account.png';

  currentUser: any;
  isPermission: any;
  currentUserTypeId: any;
  hyperplanningStatus: any;
  authService: any;
  studentSafeUrl;
  isDisabled = true;
  isMultipleFilter = false;
  dropdownAssignmentSequence = [
    { value: true, label: this.translate.instant('Yes') },
    { value: false, label: this.translate.instant('No') },
  ];

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router,
    private permissions: PermissionService,
    private pageTitle: PageTitleService,
    private translate: TranslateService,
    private studentService: StudentsTableService,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    private candidatesService: CandidatesService,
    private userService: AuthService,
    private financeService: FinancesService,
    private utilityService: UtilityService,
    private sanitizer: DomSanitizer,
    private pageTitleService: PageTitleService,
  ) {}

  ngOnInit() {
    this.studentSafeUrl = this.safeUrl();
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.pageTitleService.setTitle('NAV.STUDENT.Registered');

    this.getTypeOfSequenesDropdown()

    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getDataScholarSeasons();
      if (this.dropdowns?.type_of_registrations?.length) {
        this.dropdowns.type_of_registrations = this.dropdowns.type_of_registrations.map((type) => {
          return {
            value: type.value,
            label: this.translate.instant('perimeter.' + type.value),
          };
        });
      }
      if (this.dropdowns?.type_of_sequences?.length) {
        this.getTypeOfSequenesDropdown()
      }
      if (this.dropdowns?.statuses?.length) {
        this.dropdowns.statuses = this.dropdowns.statuses.map((type) => {
          return {
            value: type.value,
            label: this.translate.instant(type.value),
          };
        });
      }
      if (this.dropdowns?.modality_step_special_form_statuses?.length) {
        this.dropdowns.modality_step_special_form_statuses = this.dropdowns.modality_step_special_form_statuses.map((type) => {
          return {
            value: type.value,
            label: this.translate.instant('PAYMENT_INFORMATION.' + type.value),
          };
        });
      }
      if (this.dropdowns?.financial_situations?.length) {
        this.dropdowns.financial_situations = this.dropdowns.financial_situations.map((type) => {
          return {
            value: type.value,
            label: this.translate.instant(type.value),
          };
        });
      }
      if (this.dropdownAssignmentSequence?.length) {
        this.dropdownAssignmentSequence = this.dropdownAssignmentSequence.map((type) => {
          return {
            value: type.value,
            label: type.value === true ? this.translate.instant('Yes') : this.translate.instant('No'),
          };
        });
      }
      if(this.dropdowns?.specialities?.length){
        this.dropdowns.specialities = this.dropdowns.specialities.map(speciality => {
          if(speciality?._id === 'none'){
            speciality.name = this.translate.instant('None')
          }
          return {
            ...speciality
          }
        })
      }
    });

    // this.setTitle();
    this.getPermissions();
    this.getDataScholarSeasons();
    this.getDataTags();
    this.getDropdowns();
    this.sinkFilter();
    this.getAllStudents('init');
    if (this.superFilter.controls.scholar_season_filter.value && this.superFilter.controls.scholar_season_filter.value === 'All') {
      this.getDataForList();
    }
  }

  getTypeOfSequenesDropdown() {
    this.dropdowns.type_of_sequences = [
      {
        value: 'enseignement',
        label: this.translate.instant('course_sequence.enseignement'),
      },
      {
        value: 'period_in_company',
        label: this.translate.instant('course_sequence.period_in_company'),
      },
      {
        value: 'school_exchange',
        label: this.translate.instant('course_sequence.school_exchange'),
      },
    ],
    this.dropdowns.type_of_sequences = this.dropdowns.type_of_sequences.map((type) => {
      return {
        value: type.value,
        label: this.translate.instant('course_sequence.' + type.value),
      };
    }).sort((a, b) => this.utilityService.simplifyRegex(a.label).localeCompare(this.utilityService.simplifyRegex(b.label)));
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset && !this.isSuperFilterApplied) {
            this.getAllStudents('afterview');
          }
          this.dataLoaded = true;
          this.isSuperFilterApplied = false;
        }),
      )
      .subscribe();
  }
  safeUrl() {
    const url = `${environment.studentEnvironment}/session/login`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onSort(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAllStudents('sort');
      }
    }
  }

  clearSelectIfFilter() {
    this.selection.clear();
    this.dataSelected = [];
    this.pageSelected = [];
    this.isCheckedAll = false;
    this.selectType = '';
  }

  resetFilter(): void {
    this.isReset = true;
    Object.keys(this.filter.controls).forEach((key) => {
      this.filter.controls[key].setValue(null, { emitEvent: false });
    });
    Object.keys(this.filter.value).forEach((key) => {
      this.filter.value[key] = null;
    });
    Object.keys(this.superFilter.controls).forEach((key) => {
      if (key === 'scholar_season_filter') {
        this.superFilter.controls[key].setValue('All', { emitEvent: false });
      } else {
        this.superFilter.controls[key].setValue(null, { emitEvent: false });
      }
    });
    Object.keys(this.superFilter.value).forEach((key) => {
      this.superFilter.value[key] = null;
    });

    this.selection.clear();
    this.paginator.firstPage();

    this.isCheckedAll = false;
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.dataUnselect = [];
    this.selectType = '';
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.filter.value.student_status = 'registered';
    this.filter.value.is_registered_table = true;
    this.dropdowns.schools = [];
    this.dropdowns.campuses = [];
    this.dropdowns.levels = [];
    this.dropdowns.sectors = [];
    this.dropdowns.specialities = [];
    this.dropdowns.tagList = [];

    this.superFilterVal = null;
    this.filterBreadcrumbData = [];

    this.isMultipleFilter = false;

    if (this.isReset) {
      this.getAllStudents('reset');
      this.getDataTags();
    }

    this.superFilter.controls.scholar_season_filter.setValue('All');
    this.superFilter.controls.schools_filter.setValue(null);
    this.superFilter.controls.campuses_filter.setValue(null);
    this.superFilter.controls.levels_filter.setValue(null);
    this.superFilter.controls.sector_filter.setValue(null);
    this.superFilter.controls.speciality_filter.setValue(null);
    this.superFilter.controls.tagFilter.setValue(null);
    this.isDisabled = true;

    if (this.superFilter.controls.scholar_season_filter.value && this.superFilter.controls.scholar_season_filter.value === 'All') {
      this.getDataForList();
    }
  }

  getAllStudents(type?) {
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    if (type === 'superFilter') {
      this.superFilterVal = _.cloneDeep(this.cleanSuperFilterData());
    }
    this.filter.value.offset = this.filter.value.registration_date ? moment().utcOffset() : null;
    const filter = { ...this.cleanFilterData(), ...this.superFilterVal };
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.studentService.GetAllStudentsTable(pagination, filter, this.sortValue).subscribe(
      (resp: any) => {
        if (resp && resp.length) {
          this.dataSource.data = resp;
          // console.log('dataSource =>', this.dataSource.data);
          this.paginator.length = resp[0].count_document;
          this.dataCount = resp[0].count_document;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
        this.dropdowns.intake_channels.filtered = [...this.dropdowns.intake_channels.initial];
        this.dropdowns.programs.initial = this.dropdowns.programs.initial.sort((a, b) =>
          this.utilityService.simplifyRegex(a.program).localeCompare(this.utilityService.simplifyRegex(b.program)),
        );
        this.dropdowns.programs.filtered = [...this.dropdowns.programs.initial];
        this.filterBreadcrumbFormat(filter);
        this.getUpdateInfo();
      },
      (error) => {
        this.userService.postErrorLog(error);
        if (error) {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
          this.isWaitingForResponse = false;
          this.handleNetworkError(error);
        }
      },
    );
  }

  handleNetworkError(err: unknown) {
    const commonNetworkErrorMessages = ['jwt expired', 'str & salt required', 'Authorization header is missing', 'salt', 'UnAuthenticated'];
    const lower: (str: string) => string = (str) => str.toLocaleLowerCase();
    if (err instanceof Error) {
      if (commonNetworkErrorMessages.find((msg) => lower(err.message).includes(lower(msg)))) {
        this.userService.handlerSessionExpired();
      }
    } else if (typeof err === 'string') {
      if (commonNetworkErrorMessages.find((msg) => lower(err).includes(lower(msg)))) {
        this.userService.handlerSessionExpired();
      }
    }
  }

  getUpdateInfo() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.candidatesService.getAppPermission().subscribe(
      (ress) => {
        console.log('hyperplanning', ress);
        if (ress && ress.hyperplanning) {
          this.hyperplanningStatus = ress.hyperplanning;
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.userService.postErrorLog(err);
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('UnAuthenticated') ||
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
    this.subs.sink = this.studentService.sendStudentsToHyperplanning().subscribe(
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
        this.getAllStudents();
      },
      (error) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(error);
        console.log(error);
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

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filter.value);
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] === null) {
        delete filterData[key];
      }
    });
    return filterData;
  }

  cleanSuperFilterData() {
    if (this.superFilter.value.school_ids && this.superFilter.value.school_ids.length === 0) {
      this.superFilter.value.school_ids = null;
    }

    if (this.superFilter.value.campus_ids && this.superFilter.value.campus_ids.length === 0) {
      this.superFilter.value.campus_ids = null;
    }

    if (this.superFilter.value.level_ids && this.superFilter.value.level_ids.length === 0) {
      this.superFilter.value.level_ids = null;
    }

    if (this.superFilter.value.speciality_ids && this.superFilter.value.speciality_ids.length === 0) {
      this.superFilter.value.speciality_ids = null;
    }

    if (this.superFilter.value.sector_ids && this.superFilter.value.sector_ids.length === 0) {
      this.superFilter.value.sector_ids = null;
    }

    if (this.superFilter.value.tag_ids && this.superFilter.value.tag_ids.length === 0) {
      this.superFilter.value.tag_ids = null;
    }

    return this.superFilter.value;
  }

  transformDate(data) {
    if (data && data.date && data.time) {
      const date = data.date;
      const time = data.time;

      const datee = this.parseUtcToLocalPipe.transformDate(date, time);
      return datee;
    } else {
      return '';
    }
  }

  intakeChannel(data) {
    let intakeChannel = '';
    if (data && data.initial_intake_channel && data.scholar_season && data.intake_channel.program && data.scholar_season.scholar_season) {
      intakeChannel = data.scholar_season.scholar_season.concat(' ', data.initial_intake_channel.program);
      return data.initial_intake_channel;
    } else {
      return '';
    }
  }

  currentProgram(data) {
    let intakeChannel = '';
    if (data && data.program && data.program.scholar_season_id && data.program.program && data.program.scholar_season_id.scholar_season) {
      intakeChannel = data.program.scholar_season_id.scholar_season.concat(' ', data.program.program);
      return intakeChannel;
    } else {
      return '';
    }
  }

  // setTitle(): void {
  //   // this.pageTitle.setIcon('school');
  //   this.pageTitle.setTitle(this.translate.instant('NAV.Students'));
  // }

  getPermissions(): void {
    this.allowSendEmail = Boolean(this.permissions.studentsSendEmail());
    this.allowAssignSequences = Boolean(this.permissions.studentsAssignSequence());
    this.allowActions = Boolean(this.permissions.studentsActions());
    this.allowExport = Boolean(this.permissions.studentsExport());
  }

  getDropdowns(): void {
    this.subs.sink = this.studentService.getAllStudentInitialIntakeChannel().subscribe(
      (res) => {
        if (res && res.length) {
          this.dropdowns.intake_channels.initial = [...res];
          this.dropdowns.intake_channels.filtered = [...res];
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
        console.error('Error fetching intake channels dropdown', err);
      },
    );

    this.subs.sink = this.studentService.getAllTypeOfFormationDropdown().subscribe(
      (res) => {
        if (res && res.length) {
          this.dropdowns.type_of_formations = [...res];
          this.dropdowns.type_of_formations = this.dropdowns.type_of_formations.sort((a, b) =>
            this.utilityService.simplifyRegex(a.sigle).localeCompare(this.utilityService.simplifyRegex(b.sigle)),
          );
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
        console.error('Error fetching type of formations dropdown', err);
      },
    );

    this.subs.sink = this.studentService.getAllProgramsByUserType(this.currentUserTypeId).subscribe(
      (res) => {
        const programs = _.cloneDeep(res);
        if (programs && programs.length) {
          programs.forEach((program) => {
            if (program.scholar_season_id && program.scholar_season_id.scholar_season) {
              program.program = program.scholar_season_id.scholar_season + ' ' + program.program;
            } else {
              program.program = program.program;
            }
          });
          this.dropdowns.programs.initial = [...programs];
          this.dropdowns.programs.filtered = [...programs];
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
        console.error('Error fetching student programs', err);
      },
    );
  }

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.originalScholar = _.cloneDeep(resp);
          this.dropdowns.scholar_season = [];
          this.dropdowns.scholar_season = this.originalScholar.sort((a, b) =>
            a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
          );
          this.dropdowns.scholar_season.unshift({ _id: 'All', scholar_season: this.translate.instant('All') });
          this.dropdowns.scholar_season = _.uniqBy(this.dropdowns.scholar_season, '_id');
          console.log('SCHOLAR: ', this.dropdowns.scholar_season);
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
        }
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
    this.dropdowns.schools = [];
    this.dropdowns.campuses = [];
    this.dropdowns.levels = [];
    this.dropdowns.sectors = [];
    this.dropdowns.specialities = [];

    if (this.superFilter.controls.schools_filter.value) {
      this.superFilter.controls.schools_filter.setValue(null);
    }
    if (this.superFilter.controls.campuses_filter.value) {
      this.superFilter.controls.campuses_filter.setValue(null);
    }
    if (this.superFilter.controls.levels_filter.value) {
      this.superFilter.controls.levels_filter.setValue(null);
    }
    if (this.superFilter.controls.sector_filter.value) {
      this.superFilter.controls.sector_filter.setValue(null);
    }
    if (this.superFilter.controls.speciality_filter.value) {
      this.superFilter.controls.speciality_filter.setValue(null);
    }
    if (!this.superFilter.controls.scholar_season_filter.value || this.superFilter.controls.scholar_season_filter.value.length === 0) {
      this.superFilter.value.scholar_season_id = '';
    } else {
      this.superFilter.value.scholar_season_id =
        this.superFilter.controls.scholar_season_filter.value !== 'All' ? this.superFilter.controls.scholar_season_filter.value : '';
      this.getDataForList(this.superFilter.value.scholar_season_id);
    }
  }

  getDataForList(data?) {
    const name = data ? data : '';
    const filter = 'filter: { scholar_season_id:' + `"${name}"` + '}';
    this.subs.sink = this.candidatesService.GetAllSchoolFilter(name, filter, this.currentUserTypeId).subscribe(
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
            this.dropdowns.schools = this.listObjective;
            this.dropdowns.schools = this.dropdowns.schools.sort((a, b) =>
              a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0,
            );
          } else {
            this.listObjective = resp;
            this.dropdowns.schools = this.listObjective;
            this.dropdowns.schools = this.dropdowns.schools.sort((a, b) =>
              a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0,
            );
          }
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  checkSuperfilterSchool() {
    const formValue = this.superFilter.controls.schools_filter.value;
    if (formValue && formValue.length) {
      this.superFilter.controls.schools_filter.patchValue(formValue);
    } else {
      this.superFilter.controls.schools_filter.patchValue(null);
    }
    this.getDataCampus();
  }

  getDataCampus() {
    this.dropdowns.specialities = [];
    this.dropdowns.sectors = [];
    this.dropdowns.levels = [];
    this.dropdowns.campuses = [];

    if (this.superFilter.controls.campuses_filter.value) {
      this.superFilter.controls.campuses_filter.setValue(null);
    }
    if (this.superFilter.controls.levels_filter.value) {
      this.superFilter.controls.levels_filter.setValue(null);
    }
    if (this.superFilter.controls.sector_filter.value) {
      this.superFilter.controls.sector_filter.setValue(null);
    }
    if (this.superFilter.controls.speciality_filter.value) {
      this.superFilter.controls.speciality_filter.setValue(null);
    }
    console.log('listobjective', this.listObjective);
    if (
      this.currentUser &&
      this.currentUser.entities &&
      this.currentUser.entities.length &&
      this.currentUser.app_data &&
      this.currentUser.app_data.school_package &&
      this.superFilter.controls.schools_filter &&
      this.currentUser.app_data.school_package.length
    ) {
      const schools = this.superFilter.controls.schools_filter.value;
      console.log('getDataLevel', schools);
      this.currentUser.app_data.school_package.forEach((element) => {
        if (element && element.school && element.school._id && schools.includes(element.school._id) && !schools.includes('All')) {
          this.dropdowns.campuses = _.concat(this.dropdowns.campuses, element.school.campuses);
        } else if (element && element.school && element.school._id && schools.includes('All')) {
          this.dropdowns.campuses = _.concat(this.dropdowns.campuses, element.school.campuses);
        }
      });
      console.log('this.dropdowns.campuses', this.dropdowns.campuses);
      this.getDataLevel();
    } else {
      if (
        this.superFilter.controls.schools_filter.value &&
        !this.superFilter.controls.schools_filter.value.includes('All') &&
        this.listObjective &&
        this.listObjective.length
      ) {
        const school = this.superFilter.controls.schools_filter.value;

        const scampusList = this.listObjective.filter((list) => {
          return school.includes(list._id);
        });
        scampusList.filter((campus, n) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.filter((campusess, nex) => {
              this.dropdowns.campuses.push(campusess);
            });
          }
        });
        this.getDataLevel();
      } else if (
        this.superFilter.controls.schools_filter.value &&
        this.superFilter.controls.schools_filter.value.includes('All') &&
        this.listObjective &&
        this.listObjective.length
      ) {
        this.listObjective.forEach((campus) => {
          if (campus.campuses && campus.campuses.length) {
            campus.campuses.forEach((campusess) => {
              this.dropdowns.campuses.push(campusess);
            });
          }
        });
        this.getDataLevel();
      } else {
        this.dropdowns.campuses = [];
        this.getDataLevel();
      }
    }
    const campuses = _.chain(this.dropdowns.campuses)
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
    this.dropdowns.campuses = _.uniqBy(campuses, '_id');
    this.dropdowns.campuses = this.dropdowns.campuses.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }
  checkSuperfilterCampus() {
    const formValue = this.superFilter.controls.campuses_filter.value;
    if (formValue && formValue.length) {
      this.superFilter.controls.campuses_filter.patchValue(formValue);
    } else {
      this.superFilter.controls.campuses_filter.patchValue(null);
    }
    this.getDataLevel();
  }
  getDataLevel() {
    this.dropdowns.specialities = [];
    this.dropdowns.sectors = [];
    this.dropdowns.levels = [];
    if (this.superFilter.controls.levels_filter.value) {
      this.superFilter.controls.levels_filter.setValue(null);
    }
    if (this.superFilter.controls.sector_filter.value) {
      this.superFilter.controls.sector_filter.setValue(null);
    }
    if (this.superFilter.controls.speciality_filter.value) {
      this.superFilter.controls.speciality_filter.setValue(null);
    }

    if (
      this.currentUser &&
      this.currentUser.entities &&
      this.currentUser.entities.length &&
      this.currentUser.app_data &&
      this.currentUser.app_data.school_package &&
      this.superFilter.controls.schools_filter &&
      this.superFilter.controls.campuses_filter &&
      this.currentUser.app_data.school_package.length
    ) {
      const schools = this.superFilter.controls.schools_filter.value;
      const sCampus = this.superFilter.controls.campuses_filter.value;
      if (sCampus && sCampus.length && !sCampus.includes('All')) {
        this.currentUser.app_data.school_package.forEach((element) => {
          if (element && element.school && element.school._id && (schools.includes(element.school._id) || schools.includes('All'))) {
            const sLevelList = this.dropdowns.campuses.filter((list) => {
              return sCampus.includes(list._id);
            });
            sLevelList.forEach((lev) => {
              if (lev && lev.levels && lev.levels.length) {
                this.dropdowns.levels = _.concat(this.dropdowns.levels, lev.levels);
              }
            });
          }
        });
      } else if (
        sCampus &&
        sCampus.length &&
        sCampus.includes('All') &&
        this.dropdowns &&
        this.dropdowns.campuses &&
        this.dropdowns.campuses.length
      ) {
        this.dropdowns.campuses.forEach((lev) => {
          if (lev && lev.levels && lev.levels.length) {
            this.dropdowns.levels = _.concat(this.dropdowns.levels, lev.levels);
          }
        });
      }
      console.log('getDataLevel', this.currentUser.app_data.school_package, schools, sCampus, this.dropdowns);
    } else {
      if (
        this.superFilter.controls.campuses_filter.value &&
        !this.superFilter.controls.campuses_filter.value.includes('All') &&
        this.dropdowns &&
        this.dropdowns.campuses &&
        this.dropdowns.campuses.length
      ) {
        const sCampus = this.superFilter.controls.campuses_filter.value;
        const sLevelList = this.dropdowns.campuses.filter((list) => {
          return sCampus.includes(list._id);
        });
        sLevelList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.dropdowns.levels.push(level);
            });
          }
        });
      } else if (
        this.superFilter.controls.campuses_filter.value &&
        this.superFilter.controls.campuses_filter.value.includes('All') &&
        this.dropdowns &&
        this.dropdowns.campuses &&
        this.dropdowns.campuses.length
      ) {
        this.dropdowns.campuses.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.dropdowns.levels.push(level);
            });
          }
        });
      } else {
        this.dropdowns.levels = [];
      }
    }
    this.dropdowns.levels = _.uniqBy(this.dropdowns.levels, 'name');
    this.dropdowns.levels = this.dropdowns.levels.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  }
  checkSuperfilterLevel() {
    const formValue = this.superFilter.controls.levels_filter.value;
    if (formValue && formValue.length) {
      this.superFilter.controls.levels_filter.patchValue(formValue);
    } else {
      this.superFilter.controls.levels_filter.patchValue(null);
    }
    this.getDataSector();
  }
  getDataSector() {
    this.dropdowns.specialities = [];
    this.dropdowns.sectors = [];
    if (this.superFilter.controls.sector_filter.value) {
      this.superFilter.controls.sector_filter.setValue(null);
    }
    if (this.superFilter.controls.speciality_filter.value) {
      this.superFilter.controls.speciality_filter.setValue(null);
    }
    let filterLevel = [];
    let filterCampus = [];
    let filterSchool = [];
    if (
      this.superFilter.controls.levels_filter.value &&
      this.superFilter.controls.levels_filter.value.includes('All') &&
      this.dropdowns &&
      this.dropdowns.levels &&
      this.dropdowns.levels.length
    ) {
      filterLevel = this.dropdowns.levels.map((level) => level._id);
    }
    if (
      this.superFilter.controls.campuses_filter.value &&
      this.superFilter.controls.campuses_filter.value.includes('All') &&
      this.dropdowns &&
      this.dropdowns.campuses &&
      this.dropdowns.campuses.length
    ) {
      filterCampus = this.dropdowns.campuses.map((campus) => campus._id);
    }
    if (
      this.superFilter.controls.schools_filter.value &&
      this.superFilter.controls.schools_filter.value.includes('All') &&
      this.dropdowns &&
      this.dropdowns.schools &&
      this.dropdowns.schools.length
    ) {
      filterSchool = this.dropdowns.schools.map((school) => school._id);
    }
    const filter = {
      scholar_season_id:
        this.superFilter.value.scholar_season_id && this.superFilter.value.scholar_season_id !== 'All'
          ? this.superFilter.value.scholar_season_id
          : null,
      candidate_school_ids:
        filterSchool && filterSchool.length ? filterSchool : this.superFilter.value.school_ids ? this.superFilter.value.school_ids : null,
      campuses:
        filterCampus && filterCampus.length ? filterCampus : this.superFilter.value.campus_ids ? this.superFilter.value.campus_ids : null,
      levels: filterLevel && filterLevel.length ? filterLevel : this.superFilter.value.level_ids ? this.superFilter.value.level_ids : null,
    };
    if (this.superFilter.value.level_ids || filterLevel.length) {
      this.subs.sink = this.financeService.GetAllSectorsDropdown(filter).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.dropdowns.sectors = resp;
            this.dropdowns.sectors = _.uniqBy(this.dropdowns.sectors, 'name');
            this.dropdowns.sectors = this.dropdowns.sectors.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
          }
        },
        (err) => {
          this.userService.postErrorLog(err);
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
    } else {
      this.dropdowns.sectors = [];
      this.dropdowns.specialities = [];
    }
  }
  checkSuperfilterSector() {
    const formValue = this.superFilter.controls.sector_filter.value;
    if (formValue && formValue.length) {
      this.superFilter.controls.sector_filter.patchValue(formValue);
    } else {
      this.superFilter.controls.sector_filter.patchValue(null);
    }
    this.getDataSpeciality();
  }
  getDataSpeciality() {
    this.dropdowns.specialities = [];
    if (this.superFilter.controls.speciality_filter.value) {
      this.superFilter.controls.speciality_filter.setValue(null);
    }
    let filterLevel = [];
    let filterCampus = [];
    let filterSchool = [];
    let filterSector = [];
    if (
      this.superFilter.controls.levels_filter.value &&
      this.superFilter.controls.levels_filter.value.includes('All') &&
      this.dropdowns &&
      this.dropdowns.levels &&
      this.dropdowns.levels.length
    ) {
      filterLevel = this.dropdowns.levels.map((level) => level._id);
    }
    if (
      this.superFilter.controls.campuses_filter.value &&
      this.superFilter.controls.campuses_filter.value.includes('All') &&
      this.dropdowns &&
      this.dropdowns.campuses &&
      this.dropdowns.campuses.length
    ) {
      filterCampus = this.dropdowns.campuses.map((campus) => campus._id);
    }
    if (
      this.superFilter.controls.schools_filter.value &&
      this.superFilter.controls.schools_filter.value.includes('All') &&
      this.dropdowns &&
      this.dropdowns.schools &&
      this.dropdowns.schools.length
    ) {
      filterSchool = this.dropdowns.schools.map((school) => school._id);
    }
    if (
      this.superFilter.controls.sector_filter.value &&
      this.superFilter.controls.sector_filter.value.includes('All') &&
      this.dropdowns &&
      this.dropdowns.sectors &&
      this.dropdowns.sectors.length
    ) {
      filterSector = this.dropdowns.sectors.map((sector) => sector._id);
    }
    const filter = {
      scholar_season_id:
        this.superFilter.value.scholar_season_id && this.superFilter.value.scholar_season_id !== 'All'
          ? this.superFilter.value.scholar_season_id
          : null,
      candidate_school_ids:
        filterSchool && filterSchool.length ? filterSchool : this.superFilter.value.school_ids ? this.superFilter.value.school_ids : null,
      campuses:
        filterCampus && filterCampus.length ? filterCampus : this.superFilter.value.campus_ids ? this.superFilter.value.campus_ids : null,
      levels: filterLevel && filterLevel.length ? filterLevel : this.superFilter.value.level_ids ? this.superFilter.value.level_ids : null,
      sectors:
        filterSector && filterSector.length ? filterSector : this.superFilter.value.sector_ids ? this.superFilter.value.sector_ids : null,
    };
    if (
      this.superFilter.value.sector_ids ||
      (this.superFilter.controls.sector_filter.value && this.superFilter.controls.sector_filter.value.includes('All'))
    ) {
      this.subs.sink = this.candidatesService.GetAllSpecializationsByScholar(filter).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.dropdowns.specialities = resp;
            this.dropdowns.specialities = _.uniqBy(this.dropdowns.specialities, 'name');
            this.dropdowns.specialities = this.dropdowns.specialities.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
            this.dropdowns.specialities.unshift({
              _id:'none',
              name: this.translate.instant('None')
            })
          }
        },
        (err) => {
          this.userService.postErrorLog(err);
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
    } else {
      this.dropdowns.specialities = [];
    }
  }

  checkSuperfilterSpeciality() {
    const formValue = this.superFilter.controls.speciality_filter.value;
    if (formValue && formValue.length) {
      this.superFilter.controls.speciality_filter.patchValue(formValue);
    } else {
      this.superFilter.controls.speciality_filter.patchValue(null);
    }
    this.getDataBySpeciality();
  }

  getDataBySpeciality() {
    console.log('_fil', this.filter.value);
  }

  getDataTags() {
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService.getAllTags(true, 'finance_student', userTypesList, this.candidate_admission_statuses).subscribe(
      (resp) => {
        if (resp && resp.length) {
          console.log('ini tagList', resp);

          this.dropdowns.tagList = resp;
          this.dropdowns.tagList = this.dropdowns.tagList.sort((a, b) => {
            if (this.utilityService.simplifyRegex(a.name?.toLowerCase()) < this.utilityService.simplifyRegex(b.name?.toLowerCase())) {
              return -1;
            } else if (
              this.utilityService.simplifyRegex(a.name?.toLowerCase()) > this.utilityService.simplifyRegex(b.name?.toLowerCase())
            ) {
              return 1;
            } else {
              return 0;
            }
          });
        }
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

  checkSuperFilterTags() {
    const form = this.superFilter?.controls?.tagFilter?.value;
    if (form && form.length) {
      this.superFilter?.controls?.tagFilter?.patchValue(form);
    } else {
      this.superFilter?.controls?.tagFilter?.patchValue(null);
    }
  }

  sinkFilter(): void {
    this.subs.sink = this.filter.controls.student_number.valueChanges.pipe(debounceTime(500)).subscribe((value: string) => {
      this.filter.value.student_number = Boolean(value) ? value : null;
      // this.clearSelectIfFilter();
      this.paginator.firstPage();
      if (!this.isReset) {
        this.getAllStudents('filter student number');
      }
    });

    this.subs.sink = this.filter.controls.full_name.valueChanges.pipe(debounceTime(500)).subscribe((value: string) => {
      this.filter.value.full_name = Boolean(value) ? value : null;
      // this.clearSelectIfFilter();
      this.paginator.firstPage();
      if (!this.isReset) {
        this.getAllStudents('filter full name');
      }
    });

    this.subs.sink = this.filter.controls.initial_intake_channel_filter.valueChanges.subscribe((text: string) => {
      this.isMultipleFilter = true;
      // if (typeof text === 'string') {
      //   this.dropdowns.intake_channels.filtered = this.dropdowns.intake_channels.initial.filter((option: string | null) => {
      //     return typeof option === 'string' && option.length && option.toLocaleLowerCase().trim().includes(text.toLocaleLowerCase().trim());
      //   });
      // } else {
      //   this.dropdowns.intake_channels.filtered = [...this.dropdowns.intake_channels.initial];
      // }
    });
    this.subs.sink = this.filter.controls.current_program_filter.valueChanges.subscribe((text: string) => {
      this.isMultipleFilter = true;
      // if (typeof text === 'string') {
      //   this.dropdowns.programs.filtered = this.dropdowns.programs.initial.filter((option: any) => {
      //     return option && option.program && option.program.toLocaleLowerCase().trim().includes(text.toLocaleLowerCase().trim());
      //   });
      // } else {
      //   this.dropdowns.programs.filtered = [...this.dropdowns.programs.initial];
      // }
    });

    this.subs.sink = this.filter.controls.registration_date.valueChanges.subscribe((date: Date | null) => {
      if (date instanceof Date) {
        this.filter.value.registration_date = moment(date).format('DD/MM/YYYY');
      } else {
        this.filter.value.registration_date = null;
      }
      // this.clearSelectIfFilter();
      this.paginator.firstPage();
      if (!this.isReset) {
        this.getAllStudents('filter regis date');
      }
    });

    this.subs.sink = this.filter.controls.current_sequence.valueChanges.pipe(debounceTime(500)).subscribe((value: string) => {
      this.filter.value.current_sequence = Boolean(value) ? value : null;
      // this.clearSelectIfFilter();
      this.paginator.firstPage();
      if (!this.isReset) {
        this.getAllStudents('filter current seq');
      }
    });

    this.subs.sink = this.filter.controls.current_group.valueChanges.pipe(debounceTime(500)).subscribe((value: string) => {
      this.filter.value.current_student_class = Boolean(value) ? value : null;
      // this.clearSelectIfFilter();
      this.paginator.firstPage();
      if (!this.isReset) {
        this.getAllStudents('filter current seq');
      }
    });
    this.subs.sink = this.filter.controls.type_of_registration.valueChanges.subscribe((text) => {
      this.isMultipleFilter = true;
    });
    this.subs.sink = this.filter.controls.type_of_formation.valueChanges.subscribe((text) => {
      this.isMultipleFilter = true;
    });
    this.subs.sink = this.filter.controls.type_of_sequence.valueChanges.subscribe((text) => {
      this.isMultipleFilter = true;
    });
    this.subs.sink = this.filter.controls.student_status.valueChanges.subscribe((text) => {
      this.isMultipleFilter = true;
    });
    this.subs.sink = this.filter.controls.modality_step_special_form_status.valueChanges.subscribe((text) => {
      this.isMultipleFilter = true;
    });
    this.subs.sink = this.filter.controls.financial_situation.valueChanges.subscribe((text) => {
      this.isMultipleFilter = true;
    });
    this.subs.sink = this.filter.controls.assignment_sequence.valueChanges.subscribe((text) => {
      this.isMultipleFilter = true;
    });
    // superfilter
    this.subs.sink = this.superFilter.controls.scholar_season_filter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.value.speciality_ids = null;
      this.superFilter.value.sector_ids = null;
      this.superFilter.value.level_ids = null;
      this.superFilter.value.campus_ids = null;
      this.superFilter.value.school_ids = null;
      this.superFilter.value.scholar_season_id = statusSearch === null || (this.isReset && statusSearch === 'All') ? null : statusSearch;
    });

    this.subs.sink = this.superFilter.controls.schools_filter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.value.speciality_ids = null;
      this.superFilter.value.sector_ids = null;
      this.superFilter.value.level_ids = null;
      this.superFilter.value.campus_ids = null;
      this.superFilter.value.school_ids = statusSearch && statusSearch.length && !statusSearch.includes('All') ? statusSearch : null;
    });

    this.subs.sink = this.superFilter.controls.campuses_filter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.value.speciality_ids = null;
      this.superFilter.value.sector_ids = null;
      this.superFilter.value.level_ids = null;
      this.superFilter.value.campus_ids = statusSearch && statusSearch.length && !statusSearch.includes('All') ? statusSearch : null;
    });

    this.subs.sink = this.superFilter.controls.levels_filter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.value.speciality_ids = null;
      this.superFilter.value.sector_ids = null;
      this.superFilter.value.level_ids = statusSearch && statusSearch.length && !statusSearch.includes('All') ? statusSearch : null;
    });

    this.subs.sink = this.superFilter.controls.sector_filter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.value.speciality_ids = null;
      this.superFilter.value.sector_ids = statusSearch && statusSearch.length && !statusSearch.includes('All') ? statusSearch : null;
    });
    this.subs.sink = this.superFilter.controls.speciality_filter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.value.speciality_ids = statusSearch && statusSearch.length && !statusSearch.includes('All') ? statusSearch : null;
    });
    this.subs.sink = this.superFilter.controls.tagFilter.valueChanges.subscribe((statusSearch) => {
      this.isDisabled = false;
      this.superFilter.value.tag_ids = statusSearch === '' || (statusSearch && statusSearch.includes('All')) ? [] : statusSearch;
    });
  }

  displayWithProgramNameFn(id: string | null) {
    if (id === this.translate.instant('All')) {
      return id;
    } else if (!id) {
      return '';
    }
    const program = this.dropdowns.programs.initial.find((programs) => programs && programs._id && id && programs._id === id);
    if (program && program.program) {
      return program.program;
    } else {
      return '';
    }
  }

  onFilterSelect(key: string, value: string | null, form?: string) {
    if (form) {
      value = this.filter?.controls[form]?.value;
      console.log('cek value', value);
      // this.filter.value[key] = value !== 'All' ? value : null;
    } else {
      this.filter.value[key] = value !== 'All' ? value : null;
    }
    if (key === 'student_statuses') {
      this.filter.value.student_status = 'registered';
    }
    this.isMultipleFilter = false;
    // this.clearSelectIfFilter();
    this.paginator.firstPage();
    if (!this.isReset) {
      this.getAllStudents('filter select');
    }
  }
  onFilterSelectMultiple(key: string, form: string) {
    if (this.isMultipleFilter) {
      this.isMultipleFilter = false;
      const value = this.filter?.controls[form]?.value;
      this.filter.value[key] = value?.length ? value : null;
      if (key === 'student_statuses') {
        if (this.filter?.value?.student_statuses?.length) {
          this.filter.value.student_status = null;
        } else {
          this.filter.value.student_status = 'registered';
        }
      }
      // this.clearSelectIfFilter();
      this.paginator.firstPage();
      if (!this.isReset) {
        this.getAllStudents('filter select');
      }
    }
  }

  goToStudentCard(id, row, tab?) {
    console.log('cek row', row);
    const query = {
      selectedCandidate: id,
      sortValue: JSON.stringify(this.sortValue) || '',
      tab: tab || '',
      paginator: JSON.stringify({
        pageIndex: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize,
      }),
    };
    const url = this.router.createUrlTree(['candidate-file'], { queryParams: query });
    window.open(url.toString(), '_blank');
  }

  openSendSingleEmailDialog(student: any) {
    if (student) {
      const tempFinancialSupport = student?.candidate_id?.payment_supports?.map((supportData) => {
        supportData.intake_channel = student?.program;
        supportData.candidate = {
          _id: student?.candidate_id?._id,
        };

        return supportData;
      })
      const mappedData = {
        candidate_id: {
          _id: student?.candidate_id?._id,
          candidate_admission_status: student?.student_status,
          civility: student?.candidate_id?.civility,
          email: student?.candidate_id?.email,
          emailDefault: student?.candidate_id?.school_mail,
          first_name: student?.candidate_id?.first_name,
          last_name: student?.candidate_id?.last_name,
          intake_channel: student?.program,
        },
        financial_supports: tempFinancialSupport,
        triggeredFromStudent: true,
      };
      this.subs.sink = this.dialog
        .open(InternshipEmailDialogComponent, {
          width: '600px',
          minHeight: '100px',
          disableClose: true,
          data: mappedData,
        })
        .afterClosed()
        .subscribe((resp) => {
          if (!this.isReset && resp) {
            this.getAllStudents('send email');
          }
        });
    }
  }

  openSendMultipleEmailDialog() {
    if (this.dataSelected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Students') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      const dataStudent = this.dataSelected;
      let dataToSend = [];
      if (dataStudent?.length) {
        dataStudent.forEach((res) => {
          let financialTemp = [];
          if (res?.candidate_id?.payment_supports?.length) {
            financialTemp = res.candidate_id.payment_supports
              .filter((filtered) => filtered.relation)
              .map((pay) => {
                return pay.email;
              });
          }
          const temp = {
            candidate: {
              candidate_id: res.candidate_id,
              email: res.email,
              _id: res.candidate_id && res.candidate_id._id ? res.candidate_id._id : null,
              intake_channel: res?.program
            },
            financial_supp: {
              email: financialTemp,
            },
          };
          dataToSend.push(temp);
        });
      }
      Swal.fire({
        title: this.translate.instant('Followup_S3.Title'),
        html: this.translate.instant('Followup_S3.Text'),
        type: 'question',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: this.translate.instant('Followup_S3.BUTTON 1'),
        cancelButtonText: this.translate.instant('Followup_S3.BUTTON 2'),
      }).then((result) => {
        if (result && result.value) {
          dataToSend = dataToSend.map((mail) => {
            return {
              ...mail,
              triggeredFromStudent: true,
            };
          });
        } else {
          dataToSend = dataToSend.map((res) => {
            delete res.financial_supp;
            res.triggeredFromStudent = true;
            return res;
          });
        }
        this.subs.sink = this.dialog
          .open(SendMultipleEmailComponent, {
            ...this.dialogConfig,
            data: dataToSend,
          })
          .afterClosed()
          .subscribe(
            () => {
              this.clearSelectIfFilter();
            },
            (err) => {
              console.error('Something went wrong after closing send multiple email dialog.', err);
            },
          );
      });
    }
  }

  onAssignMultipleSequence() {
    if (this.dataSelected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Students') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      let program = [];
      if (this.dataSelected && this.dataSelected.map((res) => res.program) && this.dataSelected.map((res) => res.program).length) {
        program = this.dataSelected.map((res) => res.program);
        program = _.uniqBy(program, '_id');
      }

      const data = Array.isArray(this.dataSelected) ? this.dataSelected : [];
      const program_sequence_ids = data.filter(
        item => item?.candidate_id?.program_sequence_ids
      ).map(
        (res) => res.candidate_id.program_sequence_ids
      );
      const candidates = data.filter(
        item => item?._id && item?.candidate_id?._id
      ).map(
        (res) => ({
          student_id: res._id,
          candidate_id: res.candidate_id._id,
        })
      );

      if (program.length > 1) {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('StudTable_S2.Title'),
          html: this.translate.instant('StudTable_S2.Text'),
          confirmButtonText: this.translate.instant('StudTable_S2.Button'),
        });
      } else {
        this.subs.sink = this.dialog
          .open(AssignSequenceDialogComponent, {
            width: '800px',
            minHeight: '100px',
            disableClose: true,
            data: {
              candidates,
              program_id: program[0] === null ? null : program[0]._id,
              program_sequence_ids,
              type: 'multiple',
            },
          })
          .afterClosed()
          .subscribe((resp) => {
            if (resp) {
              this.getAllStudents();
              this.selection.clear();
              this.dataSelected = [];
              this.pageSelected = [];
              this.dataUnselect = [];
              this.allStudentForCheckbox = [];
              this.isCheckedAll = false;
            }
          });
      }
    }
  }

  onAssignSequence(element) {
    this.subs.sink = this.dialog
      .open(AssignSequenceDialogComponent, {
        width: '800px',
        minHeight: '100px',
        disableClose: true,
        data: {
          student_id: element._id,
          candidate_id: element.candidate_id._id,
          program_id: element.program ? element.program._id : null,
          program_sequence_ids: element.candidate_id.program_sequence_ids,
          type: 'single',
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getAllStudents();
          this.selection.clear();
          this.dataSelected = [];
          this.pageSelected = [];
          this.dataUnselect = [];
          this.allStudentForCheckbox = [];
          this.isCheckedAll = false;
        }
      });
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
    return this.isCheckedAll ? true : numSelected === numRows || numSelected > numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.dataUnselect = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.dataUnselect = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      this.dataSource.data.map((row) => {
        if (!this.dataUnselect.includes(row.candidate_id._id)) {
          this.selection.select(row.candidate_id._id);
        }
      });
    }
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    const filter = { ...this.cleanFilterData(), ...this.superFilterVal };
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.studentService.GetAllStudentsTable(pagination, filter, this.sortValue).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.allStudentForCheckbox.push(...students);
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
      (error) => {
        this.isReset = false;
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(error);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('OK'),
        });
      },
    );
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

  showOptions(info, row) {
    if (this.isCheckedAll) {
      if (row) {
        if (!this.dataUnselect.includes(row.candidate_id._id)) {
          this.dataUnselect.push(row.candidate_id._id);
          this.selection.deselect(row.candidate_id._id);
        } else {
          const indx = this.dataUnselect.findIndex((list) => list === row.candidate_id._id);
          this.dataUnselect.splice(indx, 1);
          this.selection.select(row.candidate_id._id);
        }
      }
    } else {
      if (row) {
        if (this.dataSelected && this.dataSelected.length) {
          const dataFilter = this.dataSelected.filter((resp) => resp.candidate_id._id === row.candidate_id._id);
          if (dataFilter && dataFilter.length < 1) {
            this.dataSelected.push(row);
          } else {
            const indexFilter = this.dataSelected.findIndex((resp) => resp.candidate_id._id === row.candidate_id._id);
            this.dataSelected.splice(indexFilter, 1);
          }
        } else {
          this.dataSelected.push(row);
        }
      }
    }
    const numSelected = this.dataSelected.length;
    if (numSelected > 0) {
      this.disabledExport = false;
    } else {
      this.disabledExport = true;
    }
    this.dataSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.dataSelectedId.push(user.candidate_id._id);
    });
  }

  downloadCSV() {
    if (this.dataSelected && this.dataSelected.length < 1 && !this.isCheckedAll) {
      return Swal.fire({
        type: 'warning',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: String(this.translate.instant('student')).toLocaleLowerCase() }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      const inputOptions = {
        ',': this.translate.instant('IMPORT_DECISION_S1.COMMA'),
        ';': this.translate.instant('IMPORT_DECISION_S1.SEMICOLON'),
        tab: this.translate.instant('IMPORT_DECISION_S1.TAB'),
      };
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

  cleanFilterDataCSV() {
    let filterData = _.cloneDeep(this.filter.value);
    if (this.superFilterVal) {
      filterData = { ...filterData, ...this.superFilterVal };
    }
    let filterQuery = '';
    let schoolsMap;
    let levelsMap;
    let tagsMap;
    let campusesMap;
    let sectorsMap;
    let specialitiesMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'school_ids') {
          schoolsMap = filterData.school_ids.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ',' + `"school_ids":[${schoolsMap}]`;
        } else if (key === 'campus_ids') {
          campusesMap = filterData.campus_ids.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ',' + `"campus_ids":[${campusesMap}]`;
        } else if (key === 'level_ids') {
          levelsMap = filterData.level_ids.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ',' + `"level_ids":[${levelsMap}]`;
        } else if (key === 'sector_ids') {
          sectorsMap = filterData.sector_ids.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ',' + `"sector_ids":[${sectorsMap}]`;
        } else if (key === 'speciality_ids') {
          specialitiesMap = filterData.speciality_ids.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ',' + `"speciality_ids":[${specialitiesMap}]`;
        } else if (key === 'tags') {
          tagsMap = filterData.tags.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ',' + `"tag_ids":[${tagsMap}]`;
        } else if (
          key === 'initial_intake_channels' ||
          key === 'type_of_registrations' ||
          key === 'type_of_formations' ||
          key === 'type_of_sequences' ||
          key === 'student_statuses' ||
          key === 'programs' ||
          key === 'modality_step_special_form_statuses' ||
          key === 'financial_situations' ||
          key === 'assignment_sequences'
        ) {
          const dataMap = filterData[key]?.map((res) => `"` + res + `"`);
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":[${dataMap}]` : filterQuery + `"${key}":[${dataMap}]`;
        } else {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        }
      }
    });
    return '"filter":{' + filterQuery + '}';
  }

  openDownloadCsv(fileType) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const lang = this.translate.currentLang.toLowerCase();
    const importStudentTemplate = `downloadStudentCSV/`;
    console.log('_ini filter', this.dataSelected);
    let filter;
    if (
      (this.dataSelected.length && !this.isCheckedAll) ||
      // (this.allStudentForCheckbox && this.allStudentForCheckbox.length && this.selectType === 'one')
      (this.dataUnselect && this.dataUnselect.length)
    ) {
      const mappedCandidateIds = [...new Set(this.dataSelected.map((res) => `"${res.candidate_id._id}"`))]
      const mappedStudentIds = [...new Set(this.dataSelected.map((res) => `"` + res._id + `"`))];
      filter = '"filter":{"student_ids": [' + mappedStudentIds.toString() + '], "candidate_ids": [' + mappedCandidateIds.toString() + '], "offset": "' + moment().utcOffset() + '"}';
    } else if (this.isCheckedAll) {
      filter = this.cleanFilterDataCSV();
    }
    console.log('INI JUGA FILTER', filter);
    const userTypesList =
      this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id.map((res) => `"` + res + `"`) : [];
    const uri = encodeURI(url + importStudentTemplate + fileType + '/' + lang);
    const options = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
        'Content-Type': 'application/json',
      }),
    };
    const payload = '{' + filter + `,"user_type_id":"${this.currentUserTypeId}"` + ',"user_type_ids":[' + userTypesList + ']}';

    this.isWaitingForResponse = true;
    this.http.post(uri, payload, options).subscribe(
      (res) => {
        this.isWaitingForResponse = false;
        if (res) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('ReAdmission_S3.TITLE'),
            text: this.translate.instant('ReAdmission_S3.TEXT'),
            confirmButtonText: this.translate.instant('ReAdmission_S3.BUTTON'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => this.clearSelectIfFilter());
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  openOneTimeFormDialog(isCheckedAll?) {
    if (this.selection.selected.length < 1) {
      return Swal.fire({
        type: 'warning',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: String(this.translate.instant('student')).toLocaleLowerCase() }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      // const selectedStudent = this.dataSelected.map((data) => data._id);
      this.subs.sink = this.dialog
        .open(SendOneTimeFormDialogComponent, {
          width: '800px',
          panelClass: 'one-time-pop-up',
          data: {
            students: this.dataSelected,
            selectType: this.selectType,
            isCheckedAll: this.isCheckedAll,
          },
          disableClose: true,
        })
        .afterClosed()
        .subscribe((resp) => {
          if (resp) {
            this.getAllStudents();
            this.selection.clear();
            this.dataSelected = [];
            this.pageSelected = [];
            this.dataUnselect = [];
            this.allStudentForCheckbox = [];
            this.isCheckedAll = false;
          }
        });
    }
  }
  controllerButton(action: string) {
    this.clickedActionButton = action;
    setTimeout(() => {
      const cases = {
        'send-mail': this.getAllStudentsForSendingMail.bind(this),
        'assign-sequence': this.getAllStudentsForAssigningSequences.bind(this),
        export: this.getAllStudentsForExport.bind(this),
        'one-time-form': this.getAllStudentsForOneTimeForm.bind(this),
      };
      cases[action](0);
    }, 500);
  }

  getAllStudentsForSendingMail(page: number) {
    if (this.clickedActionButton !== 'send-mail') {
      return;
    }

    const pagination = { limit: 500, page };
    const sort = this.sortValue;
    const filter = { ...this.cleanFilterData(), ...this.superFilterVal };

    if (this.isCheckedAll) {
      if (page === 0) {
        this.dataSelected = [];
      }
      this.isLoading = true;
      const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
      this.subs.sink = this.studentService.getMultipleEmails(pagination, sort, filter).subscribe(
        (students: any) => {
          if (students && students.length && students.length > 0) {
            this.dataSelected.push(...students);
            this.getAllStudentsForSendingMail(page + 1);
          } else {
            this.isLoading = false;
            if (this.isCheckedAll && this.dataSelected && this.dataSelected.length) {
              this.dataSelected = this.dataSelected.filter((item) => !this.dataUnselect.includes(item._id));
              console.log('getMultipleEmails', this.dataSelected);
              if (this.dataSelected && this.dataSelected.length) {
                this.openSendMultipleEmailDialog();
              }
            }
          }
        },
        (err: any) => {
          this.userService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          });
        },
      );
    } else {
      this.openSendMultipleEmailDialog();
    }
  }

  getAllStudentsForAssigningSequences(page: number) {
    if (this.clickedActionButton !== 'assign-sequence') {
      return;
    }

    const pagination = { limit: 500, page };
    const sort = this.sortValue;
    const filter = { ...this.cleanFilterData(), ...this.superFilterVal };

    if (this.isCheckedAll) {
      if (page === 0) {
        this.dataSelected = [];
      }
      this.isLoading = true;
      const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
      this.subs.sink = this.studentService.getMultipleStudentProgramAndProgramSequences(pagination, filter, sort).subscribe(
        (students: any) => {
          if (students && students.length && students.length > 0) {
            this.dataSelected.push(...students);
            this.getAllStudentsForAssigningSequences(page + 1);
          } else {
            this.isLoading = false;
            if (this.isCheckedAll && this.dataSelected && this.dataSelected.length) {
              this.dataSelected = this.dataSelected.filter((item) => !this.dataUnselect.includes(item.candidate_id._id));
              if (this.dataSelected && this.dataSelected.length) {
                this.onAssignMultipleSequence();
              }
            }
          }
        },
        (err: any) => {
          this.userService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          });
        },
      );
    } else {
      this.onAssignMultipleSequence();
    }
  }

  connectAsStudent(student) {
    console.log('_123', student);

    this.isLoading = true;
    const currentUser = this.utilityService.getCurrentUser();
    const studentUserId = student && student.user_id && student.user_id._id ? student.user_id._id : null;
    if (currentUser && studentUserId && student.student_status === 'registered') {
      this.subs.sink = this.userService.loginAsUser(currentUser._id, studentUserId).subscribe(
        (resp) => {
          this.isLoading = false;
          if (resp?.user?.student_id?._id) {
            const tempUser = resp.user;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('SUCCESS'),
              html: this.translate.instant('USER_S7_SUPERUSER.TEXT', {
                UserCivility: this.translate.instant(student.civility),
                UserFirstName: student.first_name,
                UserLastName: student.last_name,
              }),
              allowEscapeKey: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('UNDERSTOOD'),
            }).then((result) => {
              const studentType = '5a067bba1c0217218c75f8ab';
              if (tempUser.entities[0].type._id === studentType || tempUser.student_id) {
                this.userService.connectAsStudent(resp, 'Student', 'connect');
              }
            });
          } else {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('Student_Not_Registered.TITLE'),
              html: this.translate.instant('Student_Not_Registered.TEXT', {
                civility: student.civility === 'neutral' ? '' : `${this.translate.instant(student.civility)} `,
                firstname: student.first_name,
                lastname: student.last_name,
              }),
              confirmButtonText: this.translate.instant('Student_Not_Registered.BUTTON'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          }
        },
        (err) => {
          this.isLoading = false;
          if (err['message'] === 'GraphQL error: you cannot logged in as this user') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SWAL_CONNECTAS.TITLE'),
              html: this.translate.instant('SWAL_CONNECTAS.TEXT'),
              allowEscapeKey: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('SWAL_CONNECTAS.BUTTON'),
            });
          }
        },
      );
    } else {
      this.isLoading = false;
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Student_Not_Registered.TITLE'),
        html: this.translate.instant('Student_Not_Registered.TEXT', {
          civility: student.civility === 'neutral' ? '' : `${this.translate.instant(student.civility)} `,
          firstname: student.first_name,
          lastname: student.last_name,
        }),
        confirmButtonText: this.translate.instant('Student_Not_Registered.BUTTON'),
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: false,
      });
    }
  }

  ngOnDestroy() {
    this.pageTitleService.setTitle(null);
    this.subs.unsubscribe();
  }
  getAllStudentsForExport(page: number) {
    if (this.clickedActionButton !== 'export') {
      return;
    }

    const pagination = { limit: 500, page };
    const sort = this.sortValue;
    const filter = { ...this.cleanFilterData(), ...this.superFilterVal };

    if (this.isCheckedAll) {
      if (this.dataUnselect.length < 1) {
        this.downloadCSV();
      } else {
        if (page === 0) {
          this.dataSelected = [];
        }
        this.isLoading = true;
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
        this.subs.sink = this.studentService.getMultipleStudentId(pagination, filter, sort).subscribe(
          (students: any) => {
            if (students && students.length && students.length > 0) {
              this.dataSelected.push(...students);
              this.getAllStudentsForExport(page + 1);
            } else {
              this.isLoading = false;
              if (this.isCheckedAll && this.dataSelected && this.dataSelected.length) {
                this.dataSelected = this.dataSelected.filter((item) => !this.dataUnselect.includes(item._id));
                console.log('getMultipleStudentId', this.dataSelected);
                if (this.dataSelected && this.dataSelected.length) {
                  this.downloadCSV();
                }
              }
            }
          },
          (err: any) => {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            });
          },
        );
      }
    } else {
      this.downloadCSV();
    }
  }

  getAllStudentsForOneTimeForm(page: number) {
    if (this.clickedActionButton !== 'one-time-form') {
      return;
    }

    const pagination = { limit: 500, page };
    const sort = this.sortValue;
    const filter = { ...this.cleanFilterData(), ...this.superFilterVal };

    if (this.isCheckedAll) {
      if (page === 0) {
        this.dataSelected = [];
      }
      this.isLoading = true;
      const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
      this.subs.sink = this.studentService.getStudentOneTime(pagination, sort, filter).subscribe(
        (students: any) => {
          if (students && students.length && students.length > 0) {
            this.dataSelected.push(...students);
            this.getAllStudentsForOneTimeForm(page + 1);
          } else {
            this.isLoading = false;
            if (this.isCheckedAll && this.dataSelected && this.dataSelected.length) {
              this.dataSelected = this.dataSelected.filter((item) => !this.dataUnselect.includes(item.candidate_id._id));
              if (this.dataSelected && this.dataSelected.length) {
                this.openOneTimeFormDialog(this.isCheckedAll);
              }
            }
          }
        },
        (err: any) => {
          this.userService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          });
        },
      );
    } else {
      this.openOneTimeFormDialog();
    }
  }

  applySuperFilter() {
    this.isSuperFilterApplied = true;
    this.paginator.firstPage();
    this.getAllStudents('superFilter');
    this.isSuperFilterApplied = false;
    this.isDisabled = true;
  }

  filterBreadcrumb(type, column, value, key, isMultiple, noTranslate?) {
    const newFilterValue = {
      type: type,
      column: column,
      value: value,
      key: key,
      isMultiple: isMultiple,
      noTranslate: noTranslate,
    };

    const findFilterBreadcrumb = this.filterBreadcrumbData.findIndex(
      (filterData) => filterData?.type === type && filterData?.column === column,
    );
    if (findFilterBreadcrumb !== -1) {
      this.filterBreadcrumbData[findFilterBreadcrumb] = newFilterValue;
      if (
        !this.filterBreadcrumbData[findFilterBreadcrumb]?.value?.length &&
        !this.filterBreadcrumbData[findFilterBreadcrumb]?.key?.length
      ) {
        this.filterBreadcrumbData.splice(findFilterBreadcrumb, 1);
      }
    } else if (findFilterBreadcrumb === -1 && newFilterValue?.value?.length) {
      this.filterBreadcrumbData.push(newFilterValue);
    }
  }

  filterBreadcrumbFormat(filteredValues: typeof this.filter.value & typeof this.superFilter.value) {
    let type: 'super_filter' | 'table_filter' | 'action_filter',
      column: string,
      value: string, // stringify number and boolean
      key: string | string[],
      isMultiple: boolean,
      noTranslate: boolean;
    if (filteredValues?.scholar_season_id) {
      type = 'super_filter';
      column = 'CARDDETAIL.Scholar Season';
      value = filteredValues.scholar_season_id;
      key = this.dropdowns.scholar_season.find((season) => season?._id === value)?.scholar_season || '';
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    } else {
      type = 'super_filter';
      column = 'CARDDETAIL.Scholar Season';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }

    if (filteredValues?.school_ids?.length) {
      type = 'super_filter';
      column = 'ADMISSION.TABLE_ADMISSION_CHANNEL.School';
      value =
        this.superFilter?.controls?.schools_filter?.value?.length === this.dropdowns?.schools?.length
          ? ['AllM']
          : filteredValues.school_ids;
      key =
        this.superFilter?.controls?.schools_filter?.value?.length === this.dropdowns?.schools?.length
          ? ['AllM']
          : filteredValues.school_ids
              .map((id) => {
                const school = this.dropdowns.schools.find((schools) => schools?._id === id);
                return school?.short_name;
              })
              .filter(Boolean);
      isMultiple = true;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    } else {
      type = 'super_filter';
      column = 'ADMISSION.TABLE_ADMISSION_CHANNEL.School';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }

    if (filteredValues?.campus_ids?.length) {
      type = 'super_filter';
      column = 'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus';
      value =
        this.superFilter?.controls?.campuses_filter?.value?.length === this.dropdowns?.campuses?.length
          ? ['AllM']
          : filteredValues.campus_ids;
      key =
        this.superFilter?.controls?.campuses_filter?.value?.length === this.dropdowns?.campuses?.length
          ? ['AllM']
          : filteredValues.campus_ids
              .map((id) => {
                const campus = this.dropdowns.campuses.find((campuss) => campuss?._id === id);
                return campus?.name;
              })
              .filter(Boolean);
      isMultiple = true;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    } else {
      type = 'super_filter';
      column = 'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }

    if (filteredValues?.level_ids?.length) {
      type = 'super_filter';
      column = 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level';
      value =
        this.superFilter?.controls?.levels_filter?.value?.length === this.dropdowns?.levels?.length ? ['AllM'] : filteredValues.level_ids;
      key =
        this.superFilter?.controls?.levels_filter?.value?.length === this.dropdowns?.levels?.length
          ? ['AllM']
          : filteredValues.level_ids
              .map((id) => {
                const level = this.dropdowns.levels.find((levels) => levels?._id === id);
                return level?.name;
              })
              .filter(Boolean);
      isMultiple = true;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    } else {
      type = 'super_filter';
      column = 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }

    if (filteredValues?.sector_ids?.length) {
      type = 'super_filter';
      column = 'ADMISSION.TABLE_ADMISSION_CHANNEL.Sector';
      value =
        this.superFilter?.controls?.sector_filter?.value?.length === this.dropdowns?.sectors?.length ? ['AllM'] : filteredValues.sector_ids;
      key =
        this.superFilter?.controls?.sector_filter?.value?.length === this.dropdowns?.sectors?.length
          ? ['AllM']
          : filteredValues.sector_ids
              .map((id) => {
                const sector = this.dropdowns.sectors.find((sectors) => sectors?._id === id);
                return sector?.name;
              })
              .filter(Boolean);
      isMultiple = true;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    } else {
      type = 'super_filter';
      column = 'ADMISSION.TABLE_ADMISSION_CHANNEL.Sector';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }

    if (filteredValues?.speciality_ids?.length) {
      type = 'super_filter';
      column = 'ADMISSION.TABLE_ADMISSION_CHANNEL.Speciality';
      value =
        this.superFilter?.controls?.speciality_filter?.value?.length === this.dropdowns?.specialities?.length
          ? ['AllM']
          : filteredValues.speciality_ids;
      key =
        this.superFilter?.controls?.speciality_filter?.value?.length === this.dropdowns?.specialities?.length
          ? ['AllM']
          : filteredValues.speciality_ids
              .map((id) => {
                const speciality = this.dropdowns.specialities.find((specialitys) => specialitys?._id === id);
                if(speciality?.name === 'None' || speciality?.name === 'Aucune'){
                  speciality.name = 'None'
                }
                return speciality?.name;
              })
              .filter(Boolean);
      isMultiple = true;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    } else {
      type = 'super_filter';
      column = 'ADMISSION.TABLE_ADMISSION_CHANNEL.Speciality';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }
    console.log({ type, column, key, value, isMultiple });

    if (filteredValues?.student_number) {
      type = 'table_filter';
      column = 'Student Number';
      value = filteredValues.student_number;
      key = filteredValues.student_number;
      isMultiple = false;
      noTranslate = true;
      this.filterBreadcrumb(type, column, value, key, isMultiple, noTranslate);
    } else {
      type = 'table_filter';
      column = 'Student Number';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }

    if (filteredValues?.full_name) {
      type = 'table_filter';
      column = 'Name';
      value = filteredValues.full_name;
      key = filteredValues.full_name;
      isMultiple = false;
      noTranslate = true;
      this.filterBreadcrumb(type, column, value, key, isMultiple, noTranslate);
    } else {
      type = 'table_filter';
      column = 'Name';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }

    if (filteredValues?.initial_intake_channels?.length) {
      type = 'table_filter';
      column = 'Intake Channel';
      value =
        this.filter?.controls?.initial_intake_channel_filter?.value.length === this.dropdowns?.intake_channels?.filtered?.length
          ? ['AllM']
          : filteredValues.initial_intake_channels;
      key =
        this.filter?.controls?.initial_intake_channel_filter?.value.length === this.dropdowns?.intake_channels?.filtered?.length
          ? ['AllM']
          : filteredValues.initial_intake_channels;
      isMultiple = true;
      noTranslate = true;
      this.filterBreadcrumb(type, column, value, key, isMultiple, noTranslate);
    } else {
      type = 'table_filter';
      column = 'Intake Channel';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }

    if (filteredValues?.type_of_registrations?.length) {
      type = 'table_filter';
      column = 'Type of Registration';
      value =
        this.filter?.controls?.type_of_registration?.value?.length === this.dropdowns?.type_of_registrations?.length
          ? ['AllM']
          : filteredValues.type_of_registrations;
      key =
        this.filter?.controls?.type_of_registration?.value?.length === this.dropdowns?.type_of_registrations?.length
          ? ['AllM']
          : filteredValues.type_of_registrations.map((values) => {
              return 'perimeter.' + values;
            });
      isMultiple = true;
      console.log('KEY', key);
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    } else {
      type = 'table_filter';
      column = 'Type of Registration';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }

    if (filteredValues?.type_of_formations?.length) {
      type = 'table_filter';
      column = 'Type of Formation';
      value =
        this.filter?.controls?.type_of_formation?.value?.length === this.dropdowns?.type_of_formations?.length
          ? ['AllM']
          : filteredValues.type_of_formations;
      key =
        this.filter?.controls?.type_of_formation?.value?.length === this.dropdowns?.type_of_formations?.length
          ? ['AllM']
          : filteredValues.type_of_formations.map((values) => {
              return this.dropdowns.type_of_formations.find((types) => types?._id === values)?.sigle || '';
            });
      isMultiple = true;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    } else {
      type = 'table_filter';
      column = 'Type of Formation';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }
    if (filteredValues?.student_statuses?.length) {
      type = 'table_filter';
      column = 'Status';
      value =
        this.filter?.controls?.student_status?.value?.length === this.dropdowns?.statuses?.length
          ? ['AllM']
          : filteredValues.student_statuses;
      key =
        this.filter?.controls?.student_status?.value?.length === this.dropdowns?.statuses?.length
          ? ['AllM']
          : filteredValues.student_statuses;
      isMultiple = true;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    } else if (filteredValues?.student_status) {
      type = 'table_filter';
      column = 'Status';
      value = filteredValues.student_status;
      key = filteredValues.student_status;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    } else {
      type = 'table_filter';
      column = 'Status';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }

    if (filteredValues?.registration_date) {
      type = 'table_filter';
      column = 'Registration Date';
      value = filteredValues.registration_date;
      key = filteredValues.registration_date;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }

    if (filteredValues?.current_sequence) {
      type = 'table_filter';
      column = 'Current Sequence';
      key = filteredValues.current_sequence;
      value = filteredValues.current_sequence;
      isMultiple = false;
      noTranslate = true;
      this.filterBreadcrumb(type, column, value, key, isMultiple, noTranslate);
    } else {
      type = 'table_filter';
      column = 'Current Sequence';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }

    if (filteredValues?.current_student_class) {
      // current group
      type = 'table_filter';
      column = 'Current group';
      key = filteredValues.current_student_class;
      value = filteredValues.current_student_class;
      isMultiple = false;
      noTranslate = true;
      this.filterBreadcrumb(type, column, value, key, isMultiple, noTranslate);
    } else {
      type = 'table_filter';
      column = 'Current group';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }

    if (filteredValues?.type_of_sequences?.length) {
      type = 'table_filter';
      column = 'Type of Sequence';
      key =
        this.filter?.controls?.type_of_sequence?.value?.length === this.dropdowns?.type_of_sequences?.length
          ? ['AllM']
          : filteredValues.type_of_sequences.map((values) => 'course_sequence.' + values);
      value =
        this.filter?.controls?.type_of_sequence?.value?.length === this.dropdowns?.type_of_sequences?.length
          ? ['AllM']
          : filteredValues.type_of_sequences;
      isMultiple = true;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    } else {
      type = 'table_filter';
      column = 'Type of Sequence';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }

    if (filteredValues?.programs?.length) {
      type = 'table_filter';
      column = 'Current Program';
      value =
        this.filter?.controls?.current_program_filter?.value?.length === this.dropdowns?.programs?.filtered?.length
          ? ['AllM']
          : filteredValues.programs;
      key =
        this.filter?.controls?.current_program_filter?.value?.length === this.dropdowns?.programs?.filtered?.length
          ? ['AllM']
          : filteredValues.programs.map((values) => {
              return this.dropdowns.programs.filtered.find((program) => program?._id === values)?.program || '';
            });
      isMultiple = true;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    } else {
      type = 'table_filter';
      column = 'Current Program';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }

    if (filteredValues?.financial_situations?.length) {
      type = 'table_filter';
      column = 'Financial Situation';
      value =
        this.filter?.controls?.financial_situation?.value?.length === this.dropdowns?.financial_situations?.length
          ? ['AllM']
          : filteredValues.financial_situations;
      key =
        this.filter?.controls?.financial_situation?.value?.length === this.dropdowns?.financial_situations?.length
          ? ['AllM']
          : filteredValues.financial_situations;
      isMultiple = true;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    } else {
      type = 'table_filter';
      column = 'Financial Situation';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }

    if (filteredValues?.modality_step_special_form_statuses?.length) {
      type = 'table_filter';
      column = 'Payment Information';
      key =
        this.filter?.controls?.modality_step_special_form_status?.value?.length ===
        this.dropdowns?.modality_step_special_form_statuses?.length
          ? ['AllM']
          : filteredValues.modality_step_special_form_statuses.map((values) => 'PAYMENT_INFORMATION.' + values);
      value =
        this.filter?.controls?.modality_step_special_form_status?.value?.length ===
        this.dropdowns?.modality_step_special_form_statuses?.length
          ? ['AllM']
          : filteredValues.modality_step_special_form_statuses;
      isMultiple = true;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    } else {
      type = 'table_filter';
      column = 'Payment Information';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }

    if (filteredValues?.assignment_sequences?.length) {
      type = 'table_filter';
      column = 'Assignment Sequence';
      key =
        this.filter?.controls?.assignment_sequence?.value?.length === this.dropdownAssignmentSequence?.length
          ? ['AllM']
          : filteredValues.assignment_sequences.map((values) => (values ? 'Yes' : 'No'));
      value =
        this.filter?.controls?.assignment_sequence?.value?.length === this.dropdownAssignmentSequence?.length
          ? ['AllM']
          : filteredValues.assignment_sequences.map((values) => String(values));
      isMultiple = true;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    } else {
      type = 'table_filter';
      column = 'Assignment Sequence';
      key = null;
      value = null;
      isMultiple = false;
      this.filterBreadcrumb(type, column, value, key, isMultiple);
    }
  }

  removeFilterBreadcrumb(filter) {
    if (filter?.type === 'super_filter') {
      const superFilters: string[] = [
        'CARDDETAIL.Scholar Season',
        'ADMISSION.TABLE_ADMISSION_CHANNEL.School',
        'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus',
        'ADMISSION.TABLE_ADMISSION_CHANNEL.Level',
        'ADMISSION.TABLE_ADMISSION_CHANNEL.Sector',
        'ADMISSION.TABLE_ADMISSION_CHANNEL.Speciality',
      ];
      const lookup = {
        'CARDDETAIL.Scholar Season': () => {
          this.superFilter.controls.scholar_season_filter.setValue('All');
          this.superFilter.value.scholar_season_id = null;
          if (this.superFilterVal.scholar_season_id) {
            this.superFilterVal.scholar_season_id = null;
          }
          const columns = superFilters;
          this.filterBreadcrumbData = this.filterBreadcrumbData.filter(
            (data) => data?.type !== 'super_filter' && !columns.includes(data?.column),
          );
          this.scholarSelect();
          this.applySuperFilter();
        },
        'ADMISSION.TABLE_ADMISSION_CHANNEL.School': () => {
          this.superFilter.controls.schools_filter.setValue(null);
          this.superFilter.value.school_ids = [];
          if (this.superFilterVal?.school_ids) {
            this.superFilterVal.school_ids = [];
          }
          const idx = superFilters.findIndex((filters) => filters === 'ADMISSION.TABLE_ADMISSION_CHANNEL.School');
          const columns = superFilters.splice(idx, superFilters.length - idx);
          this.filterBreadcrumbData = this.filterBreadcrumbData.filter(
            (data) => data?.type === 'super_filter' && !columns.includes(data?.column),
          );
          this.checkSuperfilterSchool();
          this.applySuperFilter();
        },
        'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus': () => {
          this.superFilter.controls.campuses_filter.setValue(null);
          this.superFilter.value.campus_ids = [];
          if (this.superFilterVal?.campus_ids) {
            this.superFilterVal.campus_ids = [];
          }
          const idx = superFilters.findIndex((filters) => filters === 'ADMISSION.TABLE_ADMISSION_CHANNEL.Campus');
          const columns = superFilters.splice(idx, superFilters.length - idx);
          this.filterBreadcrumbData = this.filterBreadcrumbData.filter(
            (data) => data?.type === 'super_filter' && !columns.includes(data?.column),
          );
          this.checkSuperfilterCampus();
          this.applySuperFilter();
        },
        'ADMISSION.TABLE_ADMISSION_CHANNEL.Level': () => {
          this.superFilter.controls.levels_filter.setValue(null);
          this.superFilter.value.level_ids = [];
          if (this.superFilterVal?.level_ids) {
            this.superFilterVal.level_ids = [];
          }
          const idx = superFilters.findIndex((filters) => filters === 'ADMISSION.TABLE_ADMISSION_CHANNEL.Level');
          const columns = superFilters.splice(idx, superFilters.length - idx);
          this.filterBreadcrumbData = this.filterBreadcrumbData.filter(
            (data) => data?.type === 'super_filter' && !columns.includes(data?.column),
          );
          this.checkSuperfilterLevel();
          this.applySuperFilter();
        },
        'ADMISSION.TABLE_ADMISSION_CHANNEL.Sector': () => {
          this.superFilter.controls.sector_filter.setValue(null);
          this.superFilter.value.sector_ids = [];
          if (this.superFilterVal?.sector_ids) {
            this.superFilterVal.sector_ids = [];
          }
          const idx = superFilters.findIndex((filters) => filters === 'ADMISSION.TABLE_ADMISSION_CHANNEL.Sector');
          const columns = superFilters.splice(idx, superFilters.length - idx);
          this.filterBreadcrumbData = this.filterBreadcrumbData.filter(
            (data) => data?.type === 'super_filter' && !columns.includes(data?.column),
          );
          this.checkSuperfilterSector();
          this.applySuperFilter();
        },
        'ADMISSION.TABLE_ADMISSION_CHANNEL.Speciality': () => {
          this.superFilter.controls.speciality_filter.setValue(null);
          this.superFilter.value.speciality_ids = [];
          if (this.superFilterVal?.speciality_ids) {
            this.superFilterVal.speciality_ids = [];
          }
          const idx = superFilters.findIndex((filters) => filters === 'ADMISSION.TABLE_ADMISSION_CHANNEL.Speciality');
          const columns = superFilters.splice(idx, superFilters.length - idx);
          this.filterBreadcrumbData = this.filterBreadcrumbData.filter(
            (data) => data?.type === 'super_filter' && !columns.includes(data?.column),
          );
          this.checkSuperfilterSpeciality();
          this.applySuperFilter();
        },
      };
      if (lookup[filter?.column]) {
        lookup[filter.column]();
      }

      if (filter.name === 'scholar_season') {
        this.superFilter.controls.scholar_season_filter.setValue('All');
        this.scholarSelect();
      } else if (filter.name === 'school') {
        this.superFilter.controls.schools_filter.setValue('');
        this.checkSuperfilterSchool();
      } else if (filter.name === 'campus') {
        this.superFilter.controls.campuses_filter.setValue('');
        this.checkSuperfilterCampus();
      } else if (filter.name === 'level') {
        this.superFilter.controls.campuses_filter.setValue('');
        this.checkSuperfilterLevel();
      } else if (filter.name === 'sectors') {
        this.superFilter.controls.sector_filter.setValue('');
        this.checkSuperfilterSector();
      } else if (filter.name === 'specialities') {
        this.superFilter.controls.speciality_filter.setValue('');
      }
    } else if (filter?.type === 'table_filter') {
      const columns = {
        'Student Number': {
          formControlRef: this.filter.controls.student_number,
          upcomingValue: null,
        },
        Name: {
          formControlRef: this.filter.controls.full_name,
          upcomingValue: null,
        },
        'Intake Channel': {
          formControlRef: this.filter.controls.initial_intake_channel_filter,
          upcomingValue: null,
          callback: () => {
            this.onFilterSelect('initial_intake_channels', null);
          },
        },
        'Type of Registration': {
          formControlRef: this.filter.controls.type_of_registration,
          upcomingValue: null,
          callback: () => {
            this.onFilterSelect('type_of_registrations', null);
          },
        },
        'Type of Formation': {
          formControlRef: this.filter.controls.type_of_formation,
          upcomingValue: null,
          callback: () => {
            this.onFilterSelect('type_of_formations', null);
          },
        },
        'Current Program': {
          formControlRef: this.filter.controls.current_program_filter,
          upcomingValue: null,
          callback: () => {
            this.onFilterSelect('programs', null);
          },
        },
        Status: {
          formControlRef: this.filter.controls.student_status,
          upcomingValue: null,
          callback: () => {
            this.onFilterSelect('student_statuses', null);
          },
        },
        'Registration Date': {
          formControlRef: this.filter.controls.registration_date,
          upcomingValue: null,
        },
        'Financial Situation': {
          formControlRef: this.filter.controls.financial_situation,
          upcomingValue: null,
          callback: () => {
            this.onFilterSelect('financial_situations', null);
          },
        },
        'Payment Information': {
          formControlRef: this.filter.controls.modality_step_special_form_status,
          upcomingValue: null,
          callback: () => {
            this.onFilterSelect('modality_step_special_form_statuses', null);
          },
        },
        'Assignment Sequence': {
          formControlRef: this.filter.controls.assignment_sequence,
          upcomingValue: null,
          callback: () => {
            this.onFilterSelect('assignment_sequences', null);
          },
        },
        'Current Sequence': {
          formControlRef: this.filter.controls.current_sequence,
          upcomingValue: null,
        },
        'Current group': {
          formControlRef: this.filter.controls.current_group,
          upcomingValue: null,
        },
        'Type of Sequence': {
          formControlRef: this.filter.controls.type_of_sequence,
          upcomingValue: null,
          callback: () => {
            this.onFilterSelect('type_of_sequences', null);
          },
        },
      };
      const column = columns[filter?.column];
      column.formControlRef.setValue(column.upcomingValue);
      const idx = this.filterBreadcrumbData.findIndex((data) => data?.type === 'table_filter' && data?.column === filter?.column);
      if (idx >= 0) {
        this.filterBreadcrumbData.splice(idx, 1);
        if (column?.callback) {
          column.callback();
        }
      } else if (column?.callback) {
        column.callback();
      }
    }
  }
  isAllDropdownSelected(type) {
    if (type === 'scholar') {
      const selected = this.superFilter.controls.scholar_season_filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.dropdowns.scholar_season.length;
      return isAllSelected;
    } else if (type === 'school') {
      const selected = this.superFilter.controls.schools_filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.dropdowns.schools.length;
      return isAllSelected;
    } else if (type === 'campus') {
      const selected = this.superFilter.controls.campuses_filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.dropdowns.campuses.length;
      return isAllSelected;
    } else if (type === 'level') {
      const selected = this.superFilter.controls.levels_filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.dropdowns.levels.length;
      return isAllSelected;
    } else if (type === 'sector') {
      const selected = this.superFilter.controls.sector_filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.dropdowns.sectors.length;
      return isAllSelected;
    } else if (type === 'speciality') {
      const selected = this.superFilter.controls.speciality_filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.dropdowns.specialities.length;
      return isAllSelected;
    } else if (type === 'intakeChannel') {
      const selected = this.filter.controls.initial_intake_channel_filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.dropdowns.intake_channels.filtered.length;
      return isAllSelected;
    } else if (type === 'typeRegistration') {
      const selected = this.filter.controls.type_of_registration.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.dropdowns.type_of_registrations.length;
      return isAllSelected;
    } else if (type === 'typeOfFormation') {
      const selected = this.filter.controls.type_of_formation.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.dropdowns.type_of_formations.length;
      return isAllSelected;
    } else if (type === 'typeOfSequence') {
      const selected = this.filter.controls.type_of_sequence.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.dropdowns.type_of_sequences.length;
      return isAllSelected;
    } else if (type === 'studentStatus') {
      const selected = this.filter.controls.student_status.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.dropdowns.statuses.length;
      return isAllSelected;
    } else if (type === 'programs') {
      const selected = this.filter.controls.current_program_filter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.dropdowns.programs.filtered.length;
      return isAllSelected;
    } else if (type === 'paymentInformation') {
      const selected = this.filter.controls.modality_step_special_form_status.value;
      const isAllSelected =
        selected && selected.length !== 0 && selected.length === this.dropdowns.modality_step_special_form_statuses.length;
      return isAllSelected;
    } else if (type === 'financialSituation') {
      const selected = this.filter.controls.financial_situation.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.dropdowns.financial_situations.length;
      return isAllSelected;
    } else if (type === 'assignSequence') {
      const selected = this.filter.controls.assignment_sequence.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.dropdownAssignmentSequence.length;
      return isAllSelected;
    } else if (type === 'tags') {
      const selected = this.superFilter?.controls?.tagFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.dropdowns.tagList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'scholar') {
      const selected = this.superFilter.controls.scholar_season_filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.dropdowns.scholar_season.length;
      return isIndeterminate;
    } else if (type === 'school') {
      const selected = this.superFilter.controls.schools_filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.dropdowns.schools.length;
      return isIndeterminate;
    } else if (type === 'campus') {
      const selected = this.superFilter.controls.campuses_filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.dropdowns.campuses.length;
      return isIndeterminate;
    } else if (type === 'level') {
      const selected = this.superFilter.controls.levels_filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.dropdowns.levels.length;
      return isIndeterminate;
    } else if (type === 'sector') {
      const selected = this.superFilter.controls.sector_filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.dropdowns.sectors.length;
      return isIndeterminate;
    } else if (type === 'speciality') {
      const selected = this.superFilter.controls.speciality_filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.dropdowns.specialities.length;
      return isIndeterminate;
    } else if (type === 'intakeChannel') {
      const selected = this.filter.controls.initial_intake_channel_filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.dropdowns.intake_channels.filtered.length;
      return isIndeterminate;
    } else if (type === 'typeRegistration') {
      const selected = this.filter.controls.type_of_registration.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.dropdowns.type_of_registrations.length;
      return isIndeterminate;
    } else if (type === 'typeOfFormation') {
      const selected = this.filter.controls.type_of_formation.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.dropdowns.type_of_formations.length;
      return isIndeterminate;
    } else if (type === 'typeOfSequence') {
      const selected = this.filter.controls.type_of_sequence.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.dropdowns.type_of_sequences.length;
      return isIndeterminate;
    } else if (type === 'studentStatus') {
      const selected = this.filter.controls.student_status.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.dropdowns.statuses.length;
      return isIndeterminate;
    } else if (type === 'programs') {
      const selected = this.filter.controls.current_program_filter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.dropdowns.programs.filtered.length;
      return isIndeterminate;
    } else if (type === 'paymentInformation') {
      const selected = this.filter.controls.modality_step_special_form_status.value;
      const isIndeterminate =
        selected && selected.length !== 0 && selected.length !== this.dropdowns.modality_step_special_form_statuses.length;
      return isIndeterminate;
    } else if (type === 'financialSituation') {
      const selected = this.filter.controls.financial_situation.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.dropdowns.financial_situations.length;
      return isIndeterminate;
    } else if (type === 'assignSequence') {
      const selected = this.filter.controls.assignment_sequence.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.dropdownAssignmentSequence.length;
      return isIndeterminate;
    } else if (type === 'tags') {
      const selected = this.superFilter?.controls?.tagFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.dropdowns.tagList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'scholar') {
      if (event.checked) {
        this.superFilter.controls.scholar_season_filter.patchValue('AllF', { emitEvent: false });
      } else {
        this.superFilter.controls.scholar_season_filter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'school') {
      if (event.checked) {
        const schoolData = this.dropdowns.schools.map((el) => el._id);
        this.superFilter.controls.schools_filter.patchValue(schoolData, { emitEvent: false });
      } else {
        this.superFilter.controls.schools_filter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'campus') {
      if (event.checked) {
        const schoolData = this.dropdowns.campuses.map((el) => el._id);
        this.superFilter.controls.campuses_filter.patchValue(schoolData, { emitEvent: false });
      } else {
        this.superFilter.controls.campuses_filter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'level') {
      if (event.checked) {
        const schoolData = this.dropdowns.levels.map((el) => el._id);
        this.superFilter.controls.levels_filter.patchValue(schoolData, { emitEvent: false });
      } else {
        this.superFilter.controls.levels_filter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'sector') {
      if (event.checked) {
        const schoolData = this.dropdowns.sectors.map((el) => el._id);
        this.superFilter.controls.sector_filter.patchValue(schoolData, { emitEvent: false });
      } else {
        this.superFilter.controls.sector_filter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'speciality') {
      if (event.checked) {
        const schoolData = this.dropdowns.specialities.map((el) => el._id);
        this.superFilter.controls.speciality_filter.patchValue(schoolData, { emitEvent: false });
      } else {
        this.superFilter.controls.speciality_filter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'intakeChannel') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.dropdowns.intake_channels.filtered.map((el) => el);
        this.filter.controls.initial_intake_channel_filter.patchValue(data, { emitEvent: false });
      } else {
        this.filter.controls.initial_intake_channel_filter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'typeRegistration') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.dropdowns.type_of_registrations.map((el) => el?.value);
        this.filter.controls.type_of_registration.patchValue(data, { emitEvent: false });
      } else {
        this.filter.controls.type_of_registration.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'typeOfFormation') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.dropdowns.type_of_formations.map((el) => el?._id);
        this.filter.controls.type_of_formation.patchValue(data, { emitEvent: false });
      } else {
        this.filter.controls.type_of_formation.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'typeOfSequence') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.dropdowns.type_of_sequences.map((el) => el?.value);
        this.filter.controls.type_of_sequence.patchValue(data, { emitEvent: false });
      } else {
        this.filter.controls.type_of_sequence.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'studentStatus') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.dropdowns.statuses.map((el) => el?.value);
        this.filter.controls.student_status.patchValue(data, { emitEvent: false });
      } else {
        this.filter.controls.student_status.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'programs') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.dropdowns.programs.filtered.map((el) => el?._id);
        this.filter.controls.current_program_filter.patchValue(data, { emitEvent: false });
      } else {
        this.filter.controls.current_program_filter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'paymentInformation') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.dropdowns.modality_step_special_form_statuses.map((el) => el?.value);
        this.filter.controls.modality_step_special_form_status.patchValue(data, { emitEvent: false });
      } else {
        this.filter.controls.modality_step_special_form_status.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'financialSituation') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.dropdowns.financial_situations.map((el) => el?.value);
        this.filter.controls.financial_situation.patchValue(data, { emitEvent: false });
      } else {
        this.filter.controls.financial_situation.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'assignSequence') {
      this.isMultipleFilter = true;
      if (event.checked) {
        const data = this.dropdownAssignmentSequence.map((el) => el?.value);
        this.filter.controls.assignment_sequence.patchValue(data, { emitEvent: false });
      } else {
        this.filter.controls.assignment_sequence.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'tags') {
      if (event.checked) {
        const tagsData = this.dropdowns.tagList.map((el) => el._id);
        this.superFilter?.controls?.tagFilter.patchValue(tagsData, { emitEvent: false });
      } else {
        this.superFilter?.controls?.tagFilter.patchValue(null, { emitEvent: false });
      }
    }
  }
}
