import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { ApplicationUrls } from 'app/shared/settings';
import { AuthService } from 'app/service/auth-service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-internship-file',
  templateUrl: './internship-file.component.html',
  styleUrls: ['./internship-file.component.scss'],
})
export class InternshipFileComponent implements OnInit, AfterViewInit, OnDestroy {
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  isWaitingForResponse: Boolean = true;
  selectedMentor: any = null;
  registerCandidate = false;
  selectedAdmissionMember: any = null;
  admissionMemberList = [];
  private selectedIndex;
  mentorList = [];
  campusList = [];
  schoolsList = [];
  intakeChannelList = [];
  admissionMemberFilteredList: Observable<any>;
  admissionMemberFilter = new UntypedFormControl('');
  mentorFilter = new UntypedFormControl('');
  mentorFilteredList: Observable<any>;
  campusFilter = new UntypedFormControl(null);
  campusFilteredList: Observable<any>;
  schoolFilter = new UntypedFormControl('');
  schoolsFilteredList: Observable<any>;
  intakeChannelFilter = new UntypedFormControl('');
  intakeChannelFilteredList: Observable<any>;
  schoolsFilter = new UntypedFormControl(null);
  levelFilter = new UntypedFormControl(null);
  searchByNameFilter = new UntypedFormControl('');
  myInnerHeight = 1920;
  currSelectedCandidateId = '';
  currSelectedCandidate: any;
  candidatesList = [];
  // paginator = { pageSize: 10, pageIndex: 0, length: 0 };
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataCount = 0;

  tab = '';
  tabs = {
    'note-tab': 'Add a Note',
    'history-tab': 'Candidate history',
    'profile-tab': 'Candidature Profile',
  };
  filteredValues = {
    intake_channel: '',
    student_mentor: '',
    admission_member: '',
    school: '',
    campus: '',
    level: '',
  };
  listObjective = [];
  levels = [];
  school = [];
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
  isPermission: string[];
  currentUser: any;
  currentUserTypeId: string;

  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService,
    private candidatesService: CandidatesService,
    private pageTitleService: PageTitleService,
    private userService: AuthService,
  ) {}

  ngOnInit() {
    this.isPermission = this.userService.getPermission();
    this.currentUser = this.userService.getLocalStorageUser();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.pageTitleService.setTitle(this.translate.instant('Student Card Finance'));
    this.getDataForList();
    this.route.queryParams.subscribe((query) => {
      this.currSelectedCandidateId = query.selectedProfile;
      this.sortValue = query.sortValue || null;
      const pagination = query.paginator ? JSON.parse(query.paginator) : null;
      if (pagination) {
        this.paginator = Object.assign(this.paginator, pagination);
      }
      if (query.filteredValues) {
        this.filteredValues = JSON.parse(query.filteredValues);
        console.log('this.filteredValues', this.filteredValues);
        if (this.filteredValues && this.filteredValues.school) {
          this.schoolsFilter.setValue(this.filteredValues.school);
        }
        if (this.filteredValues && this.filteredValues.campus) {
          this.campusFilter.setValue(this.filteredValues.campus);
        }
        if (this.filteredValues && this.filteredValues.level) {
          this.levelFilter.setValue(this.filteredValues.level);
        }
      }
      this.tab = query.tab;
      this.initFilter();
      this.getAllIntakeChannelDropdown();
    });
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
    this.pageTitleService.setTitle(null);
    this.pageTitleService.setIcon(null);
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
  initFilter() {
    this.subs.sink = this.admissionMemberFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch.length < 3) {
          return;
        } else if (statusSearch === '') {
          this.admissionMemberFilter.setValue('');
          this.filteredValues.admission_member = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getCandidatesData();
          }
        }
        this.filteredValues.admission_member = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData();
        }
      } else {
        this.admissionMemberFilter.setValue('');
        this.filteredValues.admission_member = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData();
        }
      }
    });

    this.subs.sink = this.mentorFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch.length < 3) {
          return;
        } else if (statusSearch === '') {
          this.mentorFilter.setValue('');
          this.filteredValues.student_mentor = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getCandidatesData();
          }
        }
        this.filteredValues.student_mentor = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData();
        }
      } else {
        this.mentorFilter.setValue('');
        this.filteredValues.student_mentor = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData();
        }
      }
    });

    this.subs.sink = this.intakeChannelFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.intakeChannelFilteredList = of(this.filterIntakeChannel(statusSearch));
      }
    });
    this.subs.sink = this.schoolFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch.length < 3) {
        return;
      }
      this.filteredValues.school = statusSearch === 'All' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData();
      }
    });
    this.subs.sink = this.schoolsFilter.valueChanges.subscribe((statusSearch) => {
      // this.filteredValues.level = '';
      // this.filteredValues.campus = '';
      this.filteredValues.school = statusSearch === '' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData();
      }
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((statusSearch) => {
      // this.filteredValues.level = '';
      this.filteredValues.campus = statusSearch === '' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData();
      }
    });

    this.subs.sink = this.levelFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.level = statusSearch === '' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData();
      }
    });
  }
  // Get candidate data
  getCandidatesData() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.candidatesService.getAllCandidatesWithUserType(pagination, this.sortValue, filter, userTypesList).subscribe(
      (candidates: any) => {
        if (candidates && candidates.length) {
          this.candidatesList = candidates;
          this.paginator.length = candidates[0].count_document;
          this.dataCount = candidates[0].count_document;
          this.isReset = false;

          const filteredCandidate = candidates.filter((candidate) => this.currSelectedCandidateId === candidate._id);
          // filter out student_mentor_id  with null value
          const mentors = candidates.filter((candidate) => candidate.student_mentor_id).map((candidate) => candidate.student_mentor_id);
          // filter out admissions_members with null value
          const admissionMembers = candidates
            .filter((candidate) => candidate.admission_member_id)
            .map((candidate) => candidate.admission_member_id);
          // const schools = candidates.filter((candidate) => candidate.school).map((candidate) => candidate.school);
          // const campus = candidates.filter((candidate) => candidate.campus).map((candidate) => candidate.campus);
          this.mentorList = _.uniqBy(mentors, '_id');
          this.admissionMemberList = _.uniqBy(admissionMembers, '_id');
          // this.schoolsList = _.uniqBy(schools);
          // this.campusList = _.uniqBy(campus);
          this.currSelectedCandidate = filteredCandidate[0];
        } else {
          this.candidatesList = [];
          this.paginator.length = 0;
        }
        this.isWaitingForResponse = false;
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
  getAllIntakeChannelDropdown() {
    const filter = '';
    this.subs.sink = this.candidatesService.getAllIntakeChannelDropdown(filter).subscribe(
      (list: any) => {
        if (list && list.length) {
          this.intakeChannelList = _.uniqBy(list);
          this.intakeChannelFilteredList = of(this.intakeChannelList);
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

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    let schoolsMap;
    let levelsMap;
    let campusesMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if ((filterData[key] || filterData[key] === false) && key !== 'school_id') {
        if (key === 'intake_channel' || key === 'admission_member' || key === 'student_mentor') {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        } else if (key === 'school') {
          schoolsMap = filterData.school.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` schools:[${schoolsMap}]`;
        } else if (key === 'level') {
          levelsMap = filterData.level.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` candidate_levels:[${levelsMap}]`;
        } else if (key === 'campus') {
          campusesMap = filterData.campus.map((res) => `"` + res + `"`);
          filterQuery = filterQuery + ` candidate_campuses:[${campusesMap}]`;
        } else {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        }
      }
    });
    return 'filter: {' + filterQuery + '}';
  }
  selectMentor(mentorId) {
    const filteredMentor = this.mentorList.filter((mentor) => mentor._id === mentorId);
    this.selectedMentor = filteredMentor.length ? filteredMentor[0] : null;
  }
  setIntakeSelected(intakeChannel: string) {
    // check if previously selected then select again, if yes then reset dropdown before filtering again
    if (this.filteredValues.intake_channel && this.filteredValues.intake_channel !== intakeChannel) {
      this.intakeChannelFilteredList = of(this.intakeChannelList);
    }
    this.filteredValues.intake_channel = intakeChannel;
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.getCandidatesData();
    }
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
      intake_channel: '',
      student_mentor: '',
      admission_member: '',
      school: '',
      campus: '',
      level: '',
    };

    this.intakeChannelFilter.setValue('All');
    this.admissionMemberFilter.setValue('');
    this.mentorFilter.setValue('');
    this.schoolFilter.setValue('');
    this.campusFilter.setValue(null);
    this.schoolsFilter.setValue(null);
    this.levelFilter.setValue(null);
    this.sortValue = null;
    this.getCandidatesData();
    this.getAllIntakeChannelDropdown();
  }

  getDataForList() {
    const name = '';
    this.subs.sink = this.candidatesService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp) {
          // console.log('Data Import => ', resp);
          this.listObjective = resp;
          this.school = this.listObjective;
          this.getDataCampusFirst();
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

  scholarSelected() {}

  getDataCampus() {
    // console.log('school selected ', this.schoolsFilter.value);
    this.levels = [];
    this.campusList = [];
    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.schoolsFilter.value) {
      const school = this.schoolsFilter.value;
      const scampusList = this.listObjective.filter((list) => {
        return school.includes(list._id);
      });
      scampusList.filter((campus, n) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses, nex) => {
            this.campusList.push(campuses);
          });
        }
      });
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

    this.campusList = _.uniqBy(this.campusList, 'name');
  }

  getDataCampusFirst() {
    // console.log('school selected ', this.schoolsFilter.value);
    this.levels = [];
    this.campusList = [];
    if (this.schoolsFilter.value) {
      const school = this.schoolsFilter.value;
      const scampusList = this.listObjective.filter((list) => {
        return school.includes(list._id);
      });
      scampusList.filter((campus, n) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses, nex) => {
            this.campusList.push(campuses);
          });
        }
      });
      this.getDataLevelFirst();
    } else {
      this.listObjective.filter((campus, n) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses, nex) => {
            this.campusList.push(campuses);
          });
        }
      });
      this.getDataLevelFirst();
    }

    this.campusList = _.uniqBy(this.campusList, 'name');
  }

  getDataLevel() {
    this.levels = [];
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    const sCampus = this.campusFilter.value;
    if (this.campusFilter.value) {
      const sLevelList = this.campusList.filter((list) => {
        return sCampus.includes(list.name);
      });
      sLevelList.forEach((element) => {
        element.levels.forEach((level) => {
          this.levels.push(level);
        });
      });
    } else {
      this.campusList.forEach((element) => {
        element.levels.forEach((level) => {
          this.levels.push(level);
        });
      });
    }
    this.levels = _.uniqBy(this.levels, 'name');
  }

  getDataLevelFirst() {
    this.levels = [];
    const sCampus = this.campusFilter.value;
    if (this.campusFilter.value) {
      const sLevelList = this.campusList.filter((list) => {
        return sCampus.includes(list.name);
      });
      sLevelList.forEach((element) => {
        element.levels.forEach((level) => {
          this.levels.push(level);
        });
      });
    } else {
      this.campusList.forEach((element) => {
        element.levels.forEach((level) => {
          this.levels.push(level);
        });
      });
    }
    this.levels = _.uniqBy(this.levels, 'name');
  }
  getDataByLevel() {
    this.levels = _.uniqBy(this.levels, 'name');
  }
}
