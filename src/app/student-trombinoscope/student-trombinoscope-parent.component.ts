import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StudentsService } from 'app/service/students/students.service';
import { SubSink } from 'subsink';
import { debounceTime, startWith, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { FinancesService } from 'app/service/finance/finance.service';
import Swal from 'sweetalert2';
import { AuthService } from 'app/service/auth-service/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject } from 'rxjs';
import { PageTitleService } from 'app/core/page-title/page-title.service';
@Component({
  selector: 'ms-student-trombinoscope-parent',
  templateUrl: './student-trombinoscope-parent.component.html',
  styleUrls: ['./student-trombinoscope-parent.component.scss'],
})
export class StudentTrombinoscopeParentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  private subs = new SubSink();
  filterForm: FormGroup;
  studentData = [];
  dataCount = 0;
  isWaitingForResponse = false;
  isReset: Boolean = false;
  filterValues = {
    is_registered_table: true,
    student_status: 'registered',
    offset: 480,
    scholar_season_id: '',
    full_name: '',
  };
  scholarSeasonDropdown = [];
  type_of_group_name = null;
  type_of_group_id = null;
  group_or_class_id = null;
  isPermission: any;
  currentUser: any;
  currentUserTypeId: any;
  isShow: boolean
  // behavior subject to detect the change whenever the different scholar season selected
  scholarSeasonId$: BehaviorSubject<string> = new BehaviorSubject('');
  // 22-23
  currentScholarSeasonId = '61792005de9a18612a52a5da';
  currentScholarSeason: any;
  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    public studentService: StudentsService,
    private financeService: FinancesService,
    private userService: AuthService,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit() {
    this.isPermission = this.userService.getPermission();
    this.currentUser = this.userService.getLocalStorageUser();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.filterInit();
    this.filterStudentName();
    this.getDataScholarSeasons();
    this.initReset();
    this.pageTitleService.setTitle('NAV.STUDENT.Trombinoscope');
    console.log('Data', this.studentData);
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getAllStudentTrombinoscope();
          }
        }),
      )
      .subscribe();
  }

  getAllStudentTrombinoscope() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 12,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    console.log('type_of_group', this.type_of_group_id);
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.studentService
      .getAllStudentTrombinoscope(
        pagination,
        this.filterValues,
        this.type_of_group_name,
        this.type_of_group_id,
        this.group_or_class_id,
        userTypesList,
      )
      .subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.isWaitingForResponse = false;
            this.studentData = _.cloneDeep(resp);
            this.checkIsScholarSeason();
            this.dataCount = resp[0].count_document;
          } else {
            this.isWaitingForResponse = false;
            this.studentData = [];
            this.checkIsScholarSeason();
            this.dataCount = 0;
          }
          this.isReset = false;
        },
        (err) => {
          this.checkIsScholarSeason();
          this.isWaitingForResponse = false;
          this.isReset = false;
        },
      );
  }

  filterInit() {
    this.filterForm = this.fb.group({
      scholar_season: [''],
      student_name: [''],
    });
  }

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.scholarSeasonDropdown = _.cloneDeep(resp);
          this.scholarSeasonDropdown = this.scholarSeasonDropdown.sort((a, b) =>
            a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
          );
          this.currentScholarSeason = this.scholarSeasonDropdown?.find((season) => season?._id === this.currentScholarSeasonId);
          this.scholarSeasonDropdown = _.uniqBy(this.scholarSeasonDropdown, '_id');
          this.scholarSeasonDropdown = this.scholarSeasonDropdown.filter(list => list?.scholar_season !== 'All')
          this.filterForm.get('scholar_season').patchValue(this.currentScholarSeason?._id);
          this.scholarSelect();
        }
      },
      (err) => {
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
    const scholar = this.filterForm.get('scholar_season').value;
    if (scholar) {
      this.studentData = [];
      this.filterValues.scholar_season_id = scholar;
      this.scholarSeasonId$.next(scholar);
      this.getAllStudentTrombinoscope();
    }
  }

  filterStudentName() {
    this.subs.sink = this.filterForm?.controls?.student_name.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      this.paginator.pageIndex = 0;
      if (value?.length) {
        this.studentData = [];
        this.filterValues.full_name = value;
      } else {
        this.filterValues.full_name = '';
      }
      if (!this.isReset && this.filterForm.get('student_name').value) {
        this.getAllStudentTrombinoscope();
      }
    });
  }

  initReset() {
    this.subs.sink = this.filterForm?.controls?.scholar_season.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      if (this.isReset) {
        this.scholarSeasonId$.next(value);
      }
    });
  }

  filteredSchoolIds(schoolIds) {
    delete this.filterValues['school_ids'];
    delete this.filterValues['campus_ids'];
    delete this.filterValues['level_ids'];
    delete this.filterValues['sector_ids'];
    delete this.filterValues['specialities'];
    delete this.filterValues['program_sequence_id'];
    this.type_of_group_name = null;
    this.type_of_group_id = null;
    this.group_or_class_id = null;

    if (schoolIds && schoolIds.length) {
      this.filterValues['school_ids'] = schoolIds;
    }

    // this.getAllStudentTrombinoscope();
  }

  filteredCampusIds(campusIds) {
    delete this.filterValues['campus_ids'];
    delete this.filterValues['level_ids'];
    delete this.filterValues['sector_ids'];
    delete this.filterValues['specialities'];
    delete this.filterValues['program_sequence_id'];
    this.type_of_group_name = null;
    this.type_of_group_id = null;
    this.group_or_class_id = null;

    if (campusIds && campusIds.length) {
      this.filterValues['campus_ids'] = campusIds;
    }

    // this.getAllStudentTrombinoscope();
  }

  filteredLevelIds(levelIds) {
    delete this.filterValues['level_ids'];
    delete this.filterValues['sector_ids'];
    delete this.filterValues['specialities'];
    delete this.filterValues['program_sequence_id'];
    this.type_of_group_name = null;
    this.type_of_group_id = null;
    this.group_or_class_id = null;

    if (levelIds && levelIds.length) {
      this.filterValues['level_ids'] = levelIds;
    }

    // this.getAllStudentTrombinoscope();
  }

  filteredSectorIds(sectorIds) {
    delete this.filterValues['sector_ids'];
    delete this.filterValues['specialities'];
    delete this.filterValues['program_sequence_id'];
    this.type_of_group_name = null;
    this.type_of_group_id = null;
    this.group_or_class_id = null;

    if (sectorIds && sectorIds.length) {
      this.filterValues['sector_ids'] = sectorIds;
    }

    // this.getAllStudentTrombinoscope();
  }

  filteredSpecialityIds(specialityIds) {
    delete this.filterValues['specialities'];
    delete this.filterValues['program_sequence_id'];
    this.type_of_group_name = null;
    this.type_of_group_id = null;
    this.group_or_class_id = null;

    if (specialityIds && specialityIds.length) {
      this.filterValues['specialities'] = specialityIds;
    }

    // this.getAllStudentTrombinoscope();
  }

  filteredSequenceId(sequenceId) {
    delete this.filterValues['program_sequence_id'];
    this.type_of_group_name = null;
    this.type_of_group_id = null;
    this.group_or_class_id = null;

    if (sequenceId) {
      this.filterValues['program_sequence_id'] = sequenceId;
    }

    // this.getAllStudentTrombinoscope();
  }

  filteredTypeOfGroupId(typeOfGroupId) {
    console.log('event filter', typeOfGroupId);
    this.group_or_class_id = null;
    if (typeOfGroupId === 'class') {
      this.type_of_group_id = null;
      this.type_of_group_name = 'class';
      // this.getAllStudentTrombinoscope();
    } else if (typeOfGroupId && typeOfGroupId !== 'class') {
      this.type_of_group_name = 'group';
      this.type_of_group_id = typeOfGroupId;
      // this.getAllStudentTrombinoscope();
    } else {
      this.type_of_group_id = null;
      this.type_of_group_name = null;
    }
  }

  filteredGroupId(dataGroup) {
    if (dataGroup && dataGroup.length) {
      if (dataGroup[0] === 'class') {
        this.type_of_group_name = 'class';
        this.type_of_group_id = null;
        this.group_or_class_id = dataGroup[1];
        // this.getAllStudentTrombinoscope();
      } else {
        this.type_of_group_name = 'group';
        this.type_of_group_id = dataGroup[0];
        this.group_or_class_id = dataGroup[1];
        // this.getAllStudentTrombinoscope();
      }
    } else {
      this.group_or_class_id = null;
    }
  }

  applyFilter(apply) {
    if (apply) {
      this.getAllStudentTrombinoscope();
    }
  }
  checkIsScholarSeason() {
    this.isShow = true;
    if (this.filterValues.scholar_season_id && !this.studentData?.length) {
      if (
        this.filterValues['school_ids']?.length ||
        this.filterValues['campus_ids']?.length ||
        this.filterValues['level_ids']?.length ||
        this.filterValues['sector_ids']?.length ||
        this.filterValues['specialities']?.length ||
        this.filterValues['program_sequence_id']?.length
      ) {
        this.isShow = true;
      } else {
        this.isShow = false;
      }
    }
  }

  reset(isReset) {
    if (isReset) {
      this.isReset = true;
      if (this.filterForm.get('student_name').value?.length) {
        this.filterForm.get('student_name').setValue('');
      }
      this.filterForm.get('scholar_season').setValue(this.currentScholarSeason?._id);
      this.filterValues.full_name = '';
      this.type_of_group_name = null;
      this.type_of_group_id = null;
      this.group_or_class_id = null;
      this.filterValues.scholar_season_id = this.currentScholarSeason?._id;
      delete this.filterValues['school_ids'];
      delete this.filterValues['campus_ids'];
      delete this.filterValues['level_ids'];
      delete this.filterValues['sector_ids'];
      delete this.filterValues['specialities'];
      delete this.filterValues['program_sequence_id'];
      this.paginator.pageIndex = 0;
      this.getAllStudentTrombinoscope();
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
}
