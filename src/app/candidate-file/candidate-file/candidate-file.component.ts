import Swal from 'sweetalert2';
import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTabGroup } from '@angular/material/tabs';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { Observable, forkJoin, of } from 'rxjs';
import { debounceTime, map, startWith, tap, filter } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { TranslateService } from '@ngx-translate/core';
import { CoreService } from 'app/service/core/core.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { thresholdSturges } from 'd3';

@Component({
  selector: 'ms-candidate-file',
  templateUrl: './candidate-file.component.html',
  styleUrls: ['./candidate-file.component.scss'],
})
export class CandidateFileComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  isWaitingForResponse: Boolean = true;
  selectedMentor: any = null;
  toggleCardList: boolean = false;
  selectedAdmissionMember: any = null;
  admissionMemberList = [];
  dataCount = 0;
  private selectedIndex;
  mentorList = [];
  campusList = [];
  schoolsList = [];
  levelList = [];
  listObjective = [];
  levels = [];
  school = [];
  scholars = [];
  scholarSelected = [];
  intakeChannelList = [];
  admissionMemberFilteredList: Observable<any>;
  admissionMemberFilter = new UntypedFormControl('');
  mentorFilter = new UntypedFormControl('');
  mentorFilteredList: Observable<any>;
  scholarFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  campusFilteredList: any[];
  schoolFilter = new UntypedFormControl(null);
  schoolsFilteredList: any[];
  levelFilter = new UntypedFormControl(null);
  levelFilteredList: any[];
  candidateFilter = new UntypedFormControl('');
  intakeChannelFilter = new UntypedFormControl('');
  intakeChannelFilteredList: Observable<any>;
  searchByNameFilter = new UntypedFormControl('');
  myInnerHeight = 1920;
  currSelectedCandidateId = '';
  candidateIdParam = '';
  candidateIdFromTable = '';
  currSelectedCandidate: any;
  candidatesList = [];
  tab = '';
  subTab = '';
  tabs = {
    'note-tab': 'Add a Note',
    'history-tab': 'Candidate history',
    'edit-tab': 'Modifications',
    'evolution-tab': 'Evolution',
  };
  filteredValues = {
    candidate_admission_statuses: [
      'admission_in_progress',
      'report_inscription',
      'engaged',
      'registered',
      'resigned',
      'resigned_after_engaged',
      'resigned_after_registered',
      'bill_validated',
      'financement_validated',
      'mission_card_validated',
      'in_scholarship',
      'resignation_missing_prerequisites',
      'no_show',
      'resign_after_school_begins',
      // 'deactivated',
    ],
    candidate: null,
    intake_channel: null,
    student_mentor: null,
    admission_member: null,
    scholar_season: null,
    school_ids: null,
    campus_ids: null,
    level_ids: null,
    readmission_status: 'all_candidates',
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
  selectedCandidateName = '';
  currentUser: any;
  isPermission: string[];
  currentUserTypeId: any;
  isFirstLoad = true;
  tempDataParam: any;
  firstCandidateList: any;
  backupStudentParam: any;
  superFilterData = {
    candidate: null,
    scholar_season: null,
    school_ids: null,
    campus_ids: null,
    level_ids: null,
  };

  candidateUniqueNumber;

  constructor(
    private route: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private translate: TranslateService,
    private candidatesService: CandidatesService,
    private coreService: CoreService,

    private userService: AuthService,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.getDataScholarSeasons();
    this.pageTitleService.setTitle(this.translate.instant('Student Card Student'));
    this.coreService.sidenavOpen = false;
    this.initFilter();
    this.route.queryParams.subscribe((query) => {
      // this.currSelectedCandidateId = query.selectedCandidate;
      this.candidateIdParam = query?.selectedCandidate;
      this.candidateIdFromTable = query?.selectedCandidate;
      const sorting = query.sortValue ? JSON.parse(query.sortValue) : null;
      if (sorting && typeof sorting === 'object' && Object.keys(sorting)?.length) {
        const sortTemp = {};
        Object.keys(sorting).forEach((key) => {
          if (key === 'candidate' || key === 'full_name') {
            sortTemp['full_name'] = sorting[key];
          } else if (key === 'candidate_unique_number') {
            sortTemp['candidate_unique_number'] = sorting[key];
          } else if (key === 'type_formation' || key === 'type_of_formation') {
            sortTemp['type_of_formation'] = sorting[key];
          } else if (
            key === 'nationality' ||
            key === 'email' ||
            key === 'intake_channel' ||
            key === 'student_number' ||
            key === 'initial_intake_channel' ||
            key === 'type_of_registration' ||
            key === 'current_program' ||
            key === 'student_status' ||
            key === 'financial_situation' ||
            key === 'registration_date' ||
            key === 'assignment_sequence' ||
            key === 'current_sequence' ||
            key === 'type_of_sequence' ||
            key === 'student_class'
          ) {
            sortTemp[key] = sorting[key];
          }
        });
        this.sortValue = Object.keys(sortTemp)?.length !== 0 ? sortTemp : null;
      }
      if (this.candidateIdParam) {
        this.getOneCandidateCard();
      } else {
        this.getCandidatesData();
      }
      if (query.candidate_name || query.candidateName) {
        let candidateName;
        if (query.candidate_name) {
          candidateName = query.candidate_name;
        }
        if (query.candidateName) {
          candidateName = query.candidateName;
        }
        this.candidateFilter.patchValue(candidateName);
        this.selectedCandidateName = candidateName;
      }
      // const pagination = JSON.parse(query.paginator);
      // this.paginator = Object.assign(this.paginator, pagination);
      // this.filteredValues = JSON.parse(query.filteredValues);
      this.tab = query.tab;
      this.subTab = query.subTab;
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
    this.subs.sink = this.schoolFilter.valueChanges.subscribe((statusSearch) => {
      console.log('statusSearch', statusSearch);
      this.filteredValues.level_ids = '';
      this.filteredValues.campus_ids = '';
      this.filteredValues.school_ids = statusSearch === '' ? '' : statusSearch;
      this.superFilterData.school_ids = statusSearch === '' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData();
      }
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.level_ids = '';
      this.filteredValues.campus_ids = statusSearch === '' ? '' : statusSearch;
      this.superFilterData.campus_ids = statusSearch === '' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData();
      }
    });

    this.subs.sink = this.levelFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.level_ids = statusSearch === '' ? '' : statusSearch;
      this.superFilterData.level_ids = statusSearch === '' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData();
      }
    });
    this.subs.sink = this.candidateFilter.valueChanges.pipe(debounceTime(400)).subscribe((searchTxt) => {
      if (this.selectedCandidateName !== '') {
        this.filteredValues.candidate = this.selectedCandidateName;
        this.superFilterData.candidate = this.selectedCandidateName
        setTimeout(() => {
          this.getCandidatesData();
          this.selectedCandidateName = '';
        }, 500);
      } else if (searchTxt === '') {
        this.filteredValues.candidate = '';
        this.superFilterData.candidate = '';
        this.getCandidatesData();
      } else {
        this.filteredValues.candidate = searchTxt === 'All' ? '' : searchTxt;
        this.superFilterData.candidate = searchTxt === 'All' ? '' : searchTxt;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCandidatesData();
        }
      }
    });

    this.subs.sink = this.scholarFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.level_ids = '';
      this.filteredValues.campus_ids = '';
      this.filteredValues.school_ids = '';
      this.filteredValues.scholar_season = statusSearch === '' ? '' : statusSearch;
      this.superFilterData.scholar_season = statusSearch === '' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCandidatesData();
      }
    });
  }
  getOneCandidateCard() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.candidatesService.getOneCandidateCard(this.candidateIdParam).subscribe(
      (resp) => {
        if (resp?._id) {
          // ******** Need to store selected candidate when get candidate from selected id in param
          if (this.candidateIdParam === this.candidateIdFromTable) {
            this.backupStudentParam = _.cloneDeep(resp);
          }
          this.getDataStudent(resp);
          // For save selected student to always appear on first of the list
          if (this.isFirstLoad) {
            const temp = _.cloneDeep(resp);
            // populate student number to pass it to child (candidate-card-list-component)
            this.candidateUniqueNumber = temp?.candidate_unique_number ? temp?.candidate_unique_number : null;
            temp['studentId'] = temp?.student_id?._id ? temp?.student_id?._id : null;
            temp['candidateName'] = temp?.first_name?.toLowerCase() + ' ' + temp?.last_name?.toLowerCase();
            this.tempDataParam = _.cloneDeep(temp);
          } else {
            this.isFirstLoad = false;
          }
          this.isFirstLoad = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
      },
    );
  }

  getDataStudent(data?) {
    // ************* Usertype id of certifier admin and corrector of problematic
    this.isWaitingForResponse = true;
    const forkParam = [];
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterDataAllStudents();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    const studentIds = data?.student_id?._id ? data.student_id?._id : null;
    if (data) {
      data['studentId'] = studentIds;
      data['candidateName'] = data?.first_name?.toLowerCase() + ' ' + data?.last_name?.toLowerCase();
    }
    this.candidatesList = [];
    let dataStudentSelected: any;
    let dataAllStudent: any;
    if (studentIds?.length) {
      forkParam.push(this.candidatesService.getAllStudentCardIdentity(pagination, this.sortValue, filter, studentIds));
    }
    forkParam.push(this.candidatesService.getAllStudentCard(pagination, this.sortValue, filter, userTypesList, null));

    this.subs.sink = forkJoin(forkParam).subscribe(
      (resp) => {
        if (resp && resp.length) {
          let count = 0;
          if (resp[count] && count === 0 && studentIds?.length > 0) {
            dataStudentSelected = _.cloneDeep(resp[count]);
            count++;
          } else {
            if (!dataStudentSelected?.length && data) {
              dataStudentSelected = [];
              data['candidate_id'] = data;
              dataStudentSelected.push(data);
            }
          }
          if (resp[count] && (count === 1 || (count === 0 && !studentIds?.length))) {
            dataAllStudent = _.cloneDeep(resp[count]);
            if (dataStudentSelected?.length) {
              dataAllStudent.unshift(dataStudentSelected[0]);
            }
            const temp = _.cloneDeep(dataAllStudent);
            const candidates = temp.map((element) => {
              return {
                ...element.candidate_id,
                studentId: element._id,
                candidateName: element?.first_name?.toLowerCase() + ' ' + element?.last_name?.toLowerCase(),
                count_document: element?.count_document,
              };
            });
            this.candidatesList = _.cloneDeep(candidates);
            if (this.candidateFilter.value || this.filteredValues?.candidate) {
              this.currSelectedCandidateId = this.candidatesList[0]?._id;
              // populate student number to pass it to child (candidate-card-list-component)
              this.candidateUniqueNumber = this.candidatesList[0]?.candidate_unique_number
            } else {
              if (data?._id) {
                this.currSelectedCandidateId = this.candidateIdParam ? this.candidateIdParam : this.candidatesList[0]?._id;
              // populate student number to pass it to child (candidate-card-list-component)
                const filteredCandidate = this.candidatesList.filter((candidate) => data?.candidate_unique_number === candidate?.candidate_unique_number);
                this.candidateUniqueNumber = filteredCandidate[0]?.candidate_unique_number
              }
            }

            this.candidatesList = _.uniqBy(this.candidatesList, '_id'); // make it unique by id to prevent displaying duplicates
            this.candidatesList = _.uniqBy(this.candidatesList, 'candidateName'); // make it unique by id to prevent displaying duplicates
            this.dataCount =
              this.candidatesList && this.candidatesList.length > 1 && this.candidatesList[1].count_document
                ? this.candidatesList.length === 1 && this.candidatesList[0].count_document
                  ? this.candidatesList[0].count_document
                  : this.candidatesList[1].count_document
                : 0;
            this.paginator.length = this.dataCount;
            const filteredCandidate = candidates.filter((candidate) => this.currSelectedCandidateId === candidate._id);
            // filter out student_mentor_id  with null value
            const mentors = candidates.filter((candidate) => candidate.student_mentor_id).map((candidate) => candidate.student_mentor_id);
            // filter out admissions_members with null value
            const admissionMembers = candidates
              .filter((candidate) => candidate.admission_member_id)
              .map((candidate) => candidate.admission_member_id);
            this.mentorList = _.uniqBy(mentors, '_id');
            this.admissionMemberList = _.uniqBy(admissionMembers, '_id');
            this.currSelectedCandidate = filteredCandidate[0];
            count++;
          }
          this.isWaitingForResponse = false;
          this.isReset = false;
        } else {
          this.candidatesList = [];
          this.paginator.length = 0;
          this.isWaitingForResponse = false;
          this.isReset = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  // Get candidate data
  getCandidatesData(data?) {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterDataAllStudents();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    const studentIds = data?.student_id?._id ? data.student_id?._id : null;
    if (data) {
      data['studentId'] = studentIds;
      data['candidateName'] = data?.first_name?.toLowerCase() + ' ' + data?.last_name?.toLowerCase();
    }
    this.candidatesList = [];
    this.subs.sink = this.candidatesService.getAllStudentCard(pagination, this.sortValue, filter, userTypesList, studentIds).subscribe(
      (students: any) => {
        if (students?.length) {
          const temp = _.cloneDeep(students);
          const candidates = temp.map((element) => {
            return {
              ...element.candidate_id,
              studentId: element._id,
              candidateName: element?.first_name?.toLowerCase() + ' ' + element?.last_name?.toLowerCase(),
              count_document: element?.count_document,
            };
          });
          this.candidatesList = _.cloneDeep(candidates);
          if (this.candidateFilter.value || this.filteredValues?.candidate) {
            this.currSelectedCandidateId = this.candidatesList[0]?._id;
            // populate student number to pass it to child (candidate-card-list-component)
            this.candidateUniqueNumber = this.candidatesList[0]?.candidate_unique_number
          }
          this.candidatesList = _.uniqBy(this.candidatesList, '_id'); // make it unique by id to prevent displaying duplicates
          this.candidatesList = _.uniqBy(this.candidatesList, 'candidateName'); // make it unique by id to prevent displaying duplicates
          this.dataCount =
            this.candidatesList && this.candidatesList.length > 1 && this.candidatesList[1].count_document
              ? this.candidatesList.length === 1 && this.candidatesList[0].count_document
                ? this.candidatesList[0].count_document
                : this.candidatesList[1].count_document
              : 0;
          this.paginator.length = this.dataCount;
          const filteredCandidate = candidates.filter((candidate) => this.currSelectedCandidateId === candidate._id);
          // filter out student_mentor_id  with null value
          const mentors = candidates.filter((candidate) => candidate.student_mentor_id).map((candidate) => candidate.student_mentor_id);
          // filter out admissions_members with null value
          const admissionMembers = candidates
            .filter((candidate) => candidate.admission_member_id)
            .map((candidate) => candidate.admission_member_id);
          this.mentorList = _.uniqBy(mentors, '_id');
          this.admissionMemberList = _.uniqBy(admissionMembers, '_id');
          const isFiltered = Object.keys(this.superFilterData).filter(key => this.superFilterData[key]).length ? true : false
          // ******** Check if currunt selected candidate id same as we have in param, and backupstudent has value which store selected candidate from param and if paginator index equal zero need to concat the selected candidate into list
          if (this.backupStudentParam && this.paginator?.pageIndex === 0 && !isFiltered) {
            const temp = _.cloneDeep(this.backupStudentParam);
            temp['studentId'] = temp?.student_id?._id ? temp?.student_id?._id : null;
            temp['candidateName'] = temp?.first_name?.toLowerCase() + ' ' + temp?.last_name?.toLowerCase();
            this.backupStudentParam = temp;
            candidates.unshift(this.backupStudentParam);
            this.candidatesList = candidates;
            const filteredCandidates = candidates.filter((candidate) => this.currSelectedCandidateId === candidate._id);
            if (this.currSelectedCandidateId === this.candidateIdParam) {
              this.currSelectedCandidate = filteredCandidates[0];
            }
          } else {
            this.currSelectedCandidate = filteredCandidate[0];
          }
          if (this.paginator?.pageIndex > 0) {
            this.candidatesList = this.candidatesList.filter((user) => user?._id !== this.candidateIdFromTable)
          }
          this.candidatesList = _.uniqBy(this.candidatesList, '_id')
        } else {
          this.candidatesList = [];
          this.paginator.length = 0;
        }
        this.isReset = false;
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.candidatesList = [];
        this.paginator.length = 0;
        this.isReset = false;
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
  cleanFilterDataAllStudents() {
    const filterData = _.cloneDeep(this.filteredValues);
    Object.keys(filterData).forEach((key) => {
      if ((!filterData[key] && filterData[key] !== false) || (Array.isArray(filterData[key]) && !filterData[key]?.length)) {
        delete filterData[key];
      }
    });
    return filterData;
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    let schoolsMap;
    let levelsMap;
    let campusesMap;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'candidate' ||
          key === 'nationality' ||
          key === 'intake_channel' ||
          key === 'admission_member' ||
          key === 'student_mentor' ||
          key === 'telephone' ||
          key === 'email' ||
          key === 'registration_profile' ||
          key === 'scholar_season' ||
          key === 'type_of_formation_name' ||
          key === 'candidate_unique_number' ||
          key === 'registration_email_due_date'
        ) {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        } else if (key === 'candidate_admission_statuses') {
          filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
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
    this.currSelectedCandidateId = newSelection?._id;
    this.candidateIdParam = newSelection?._id;
    const filteredCandidate = this.candidatesList.filter((candidate) => newSelection?._id === candidate._id);
    this.currSelectedCandidate = filteredCandidate[0];
    // populate student number to pass it to child (candidate-card-list-component)
    const filterCandidateUniqueNumber = this.candidatesList.filter((candidate) => newSelection?.candidate_unique_number === candidate?.candidate_unique_number);
    this.candidateUniqueNumber = filterCandidateUniqueNumber[0]?.candidate_unique_number
  }

  resetCandidateFile() {
    this.isReset = true;
    this.paginator.pageIndex = 0;

    this.school = []
    this.levels = [];
    this.campusList = [];
    this.filteredValues = {
      candidate_admission_statuses: [
        'admission_in_progress',
        'engaged',
        'registered',
        'resigned',
        'resigned_after_engaged',
        'resigned_after_registered',
        'bill_validated',
        'financement_validated',
        'mission_card_validated',
        'in_scholarship',
        'resignation_missing_prerequisites',
        'no_show',
        'resign_after_school_begins',
        // 'deactivated',
      ],
      candidate: '',
      intake_channel: '',
      student_mentor: '',
      admission_member: '',
      scholar_season: null,
      school_ids: null,
      campus_ids: null,
      level_ids: null,
      readmission_status: 'all_candidates',
    };
    this.candidateFilter.setValue('', { emitEvent: false });
    this.scholarFilter.setValue(null, { emitEvent: false });
    this.schoolFilter.setValue(null, { emitEvent: false });
    this.campusFilter.setValue(null, { emitEvent: false });
    this.levelFilter.setValue(null, { emitEvent: false });
    this.sortValue = null;
    this.candidateIdParam = this.candidateIdFromTable;
    if (this.currSelectedCandidateId) {
      this.getOneCandidateCard();
    } else {
      this.getCandidatesData();
    }
    this.selectedCandidateName = '';
  }

  reload(value) {
    // if (value) {
    //   this.getCandidatesData();
    // }

    if (value) {
      this.getOneStudentSelected();
    }
  }

  getOneStudentSelected() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.candidatesService.getOneCandidateCard(this.candidateIdFromTable).subscribe(
      (resp) => {
        if (resp?._id) {
          // ******** Need to store selected candidate when get candidate from selected id in param
          if (this.candidateIdParam === this.candidateIdFromTable) {
            this.backupStudentParam = _.cloneDeep(resp);
          }
          this.getDataStudentSelected(resp);
          // For save selected student to always appear on first of the list
          if (this.isFirstLoad) {
            const temp = _.cloneDeep(resp);
            temp['studentId'] = temp?.student_id?._id ? temp?.student_id?._id : null;
            temp['candidateName'] = temp?.first_name?.toLowerCase() + ' ' + temp?.last_name?.toLowerCase();
            this.tempDataParam = _.cloneDeep(temp);
          } else {
            this.isFirstLoad = false;
          }
          this.isFirstLoad = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
      },
    );
  }

  getDataStudentSelected(data?) {
    // ************* Usertype id of certifier admin and corrector of problematic
    this.isWaitingForResponse = true;
    const forkParam = [];
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterDataAllStudents();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    const studentIds = data?.student_id?._id ? data.student_id?._id : null;
    if (data) {
      data['studentId'] = studentIds;
      data['candidateName'] = data?.first_name?.toLowerCase() + ' ' + data?.last_name?.toLowerCase();
    }
    let dataStudentSelected: any;
    let dataAllStudent: any;
    if (studentIds?.length) {
      forkParam.push(this.candidatesService.getAllStudentCardIdentity(pagination, this.sortValue, filter, studentIds));
    }
    forkParam.push(this.candidatesService.getAllStudentCard(pagination, this.sortValue, filter, userTypesList, null));

    this.candidatesList = [];
    this.subs.sink = forkJoin(forkParam).subscribe(
      (resp: any) => {
        console.log('_ini resp', resp);

        if (resp && resp.length) {
          let count = 0;
          if (resp[count] && count === 0 && studentIds?.length > 0) {
            dataStudentSelected = _.cloneDeep(resp[count]);
            count++;
          } else {
            if (!dataStudentSelected?.length && data) {
              dataStudentSelected = [];
              data['candidate_id'] = data;
              dataStudentSelected.push(data);
            }
          }
          if (resp[count] && (count === 1 || (count === 0 && !studentIds?.length))) {
            dataAllStudent = _.cloneDeep(resp[count]);
            if (dataStudentSelected?.length) {
              dataAllStudent.unshift(dataStudentSelected[0]);
            }
            const temp = _.cloneDeep(dataAllStudent);
            const candidates = temp.map((element) => {
              return {
                ...element.candidate_id,
                studentId: element._id,
                candidateName: element?.first_name?.toLowerCase() + ' ' + element?.last_name?.toLowerCase(),
                count_document: element?.count_document,
              };
            });

            const candidatesFilter = candidates.filter((item) => item?._id === this.currSelectedCandidateId);
            if (candidatesFilter?.length) {
              this.getCandidatesDataReload(candidatesFilter[0]);
            } else {
              // ******** Need to pass selected candidate into list of candidate if go to page index 0 this one for make it active again in student card list
              if (this.paginator?.pageSize === 0 && this.backupStudentParam) {
                this.getCandidatesDataReload(this.backupStudentParam);
              } else {
                this.getCandidatesDataReload();
              }
            }
          }

          this.isWaitingForResponse = false;
          this.isReset = false;
        } else {
          this.candidatesList = [];
          this.paginator.length = 0;
          this.isWaitingForResponse = false;
          this.isReset = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getCandidatesDataReload(data?) {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterDataAllStudents();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    const studentIds = null;
    if (data) {
      data['studentId'] = studentIds;
      data['candidateName'] = data?.first_name?.toLowerCase() + ' ' + data?.last_name?.toLowerCase();
    }
    this.candidatesList = [];
    this.subs.sink = this.candidatesService.getAllStudentCard(pagination, this.sortValue, filter, userTypesList, studentIds).subscribe(
      (students: any) => {
        if (students?.length) {
          const temp = _.cloneDeep(students);
          const candidates = temp.map((element) => {
            return {
              ...element.candidate_id,
              studentId: element._id,
              candidateName: element?.first_name?.toLowerCase() + ' ' + element?.last_name?.toLowerCase(),
              count_document: element?.count_document,
            };
          });
          this.candidatesList = _.cloneDeep(candidates);
          if (this.candidateFilter.value || this.filteredValues?.candidate) {
            this.currSelectedCandidateId = this.candidatesList[0]?._id;
            // populate student number to pass it to child (candidate-card-list-component)
            this.candidateUniqueNumber = this.candidatesList[0]?.candidate_unique_number
          }
          this.candidatesList = _.uniqBy(this.candidatesList, '_id'); // make it unique by id to prevent displaying duplicates
          this.candidatesList = _.uniqBy(this.candidatesList, 'candidateName'); // make it unique by id to prevent displaying duplicates
          this.dataCount =
            this.candidatesList && this.candidatesList.length > 1 && this.candidatesList[1].count_document
              ? this.candidatesList.length === 1 && this.candidatesList[0].count_document
                ? this.candidatesList[0].count_document
                : this.candidatesList[1].count_document
              : 0;
          this.paginator.length = this.dataCount;
          if (data) {
            const found = this.candidatesList.find((candlist) => candlist?.candidate_unique_number === data?.candidate_unique_number);
            if (found) {
              this.candidatesList = this.candidatesList.map((cand) => {
                if (cand?.candidate_unique_number === data?.candidate_unique_number) {
                  cand = data;
                  this.currSelectedCandidateId = cand._id;
                  // populate student number to pass it to child (candidate-card-list-component)
                  this.candidateUniqueNumber = cand?.candidate_unique_number
                }
                return cand;
              });
            } else {
              this.candidatesList.unshift(data);
            }
            console.log(found);
          }
          console.log(this.currSelectedCandidateId);
          console.log(this.candidatesList);
          const filteredCandidate = candidates.filter((candidate) => this.currSelectedCandidateId === candidate._id);
          // filter out student_mentor_id  with null value
          const mentors = candidates.filter((candidate) => candidate.student_mentor_id).map((candidate) => candidate.student_mentor_id);
          // filter out admissions_members with null value
          const admissionMembers = candidates
            .filter((candidate) => candidate.admission_member_id)
            .map((candidate) => candidate.admission_member_id);
          this.mentorList = _.uniqBy(mentors, '_id');
          this.admissionMemberList = _.uniqBy(admissionMembers, '_id');
          const isFiltered = Object.keys(this.superFilterData).filter(key => this.superFilterData[key]).length ? true : false
          if (this.backupStudentParam && this.paginator?.pageIndex === 0 && !isFiltered) {
            const temp = _.cloneDeep(this.backupStudentParam);
            temp['studentId'] = temp?.student_id?._id ? temp?.student_id?._id : null;
            temp['candidateName'] = temp?.first_name?.toLowerCase() + ' ' + temp?.last_name?.toLowerCase();
            this.backupStudentParam = temp;
            candidates.unshift(this.backupStudentParam);
            this.candidatesList = candidates;
            const filteredCandidates = candidates.filter((candidate) => this.currSelectedCandidateId === candidate._id);
            if (this.currSelectedCandidateId === this.candidateIdFromTable) {
              this.currSelectedCandidate = filteredCandidates[0];
            }
          } else {
            this.currSelectedCandidate = filteredCandidate[0];
          }
          if (this.paginator?.pageIndex > 0) {
            this.candidatesList = this.candidatesList.filter((user) => user?._id !== this.candidateIdFromTable)
          }
          this.candidatesList = _.uniqBy(this.candidatesList, '_id')
        } else {
          this.candidatesList = [];
          this.paginator.length = 0;
        }
        this.isReset = false;
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.candidatesList = [];
        this.paginator.length = 0;
        this.isReset = false;
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

  loadingCommentTab(value) {
    this.isWaitingForResponse = value;
  }

  getDataScholarSeasons() {
    this.subs.sink = this.candidatesService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.scholars = resp;
          // this.scholarFilter.setValue(this.scholars[0]._id);
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

  getDataForList(data?) {
    const name = data ? data : '';
    const filter = 'filter: { scholar_season_id:' + `"${name}"` + '}';
    // this.subs.sink = this.candidatesService.GetDataForImportObjectives(name).subscribe((resp) => {
    this.subs.sink = this.candidatesService.GetAllSchoolFilter(name, filter, this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp) {
          console.log('Data Import => ', resp);
          this.listObjective = resp;
          this.school = this.listObjective;
          this.getDataCampus();
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
    this.school = [];
    this.levels = [];
    this.campusList = [];
    if (this.schoolFilter.value) {
      this.schoolFilter.setValue(null);
    }
    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }

    if (!this.scholarFilter.value || this.scholarFilter.value.length === 0) {
      this.filteredValues['scholar_season'] = '';
      this.scholarSelected = [];
    } else {
      this.filteredValues['scholar_season'] = this.scholarFilter.value;
      this.scholarSelected = this.scholarFilter.value;
      this.getDataForList(this.scholarFilter.value);
      this.getCandidatesData();
    }
  }

  getDataCampus() {
    console.log('school selected ', this.schoolFilter.value);
    this.levels = [];
    this.campusList = [];
    if (this.campusFilter.value) {
      this.campusFilter.setValue(null);
    }
    if (this.levelFilter.value) {
      this.levelFilter.setValue(null);
    }
    if (this.schoolFilter.value) {
      const school = this.schoolFilter.value;
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
      console.log('scampusList', scampusList, school, this.listObjective);
      this.getDataLevel();
    } else {
      this.campusList = [];
      this.getDataLevel();
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
        return sCampus.includes(list?._id);
      });
      sLevelList.forEach((element) => {
        if (element && element.levels && element.levels.length) {
          element.levels.forEach((level) => {
            this.levels.push(level);
          });
        }
      });
    } else {
      this.levels = [];
    }

    if (this.levels?.length) {
      this.levels = _.uniqBy(this.levels, 'name');
      this.levels = this.levels.sort((a, b) => a.name.localeCompare(b.name))
    }
  }

  getDataByLevel() {
    if (this.levels?.length) {
      this.levels = _.uniqBy(this.levels, 'name');
      this.levels = this.levels.sort((a, b) => a.name.localeCompare(b.name))
    }
  }
}