import { HttpClient } from '@angular/common/http';
import { Injectable, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Cacheable } from 'ngx-cacheable';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UtilityService } from '../utility/utility.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service/auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ManualTaskDialogComponent } from 'app/task/manual-task-dialog/manual-task-dialog.component';
import { FormFillingService } from 'app/form-filling/form-filling.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { UntypedFormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource = new MatTableDataSource([]);
  CurUser: any;
  isWaitingForResponseTask: boolean = false;
  isWaitingForResponse: boolean = false;
  taskManualDialogComponent: MatDialogRef<ManualTaskDialogComponent>;
  pagination = {
    limit: 10,
    page: 0,
  };
  private subs = new SubSink();
  filterValues = {
    test_id: '',
    is_not_parent_task: true,
    task_statuses: [],
    from: '',
    to: '',
    rncp_title: '',
    priorities: null,
    due_date: {
      date: '',
      time: '',
    },
    created_at: {
      date: '',
      time: '',
    },
    // subject_test: '',
    descriptions: null,
    school_ids: null,
    campuses: null,
    offset: null,
  };

  sortingValues = {
    due_date: 'desc',
    status: '',
    from: '',
    to: '',
    priority: '',
    created_at: '',
    school: '',
  };
  statusListUnmap = [
    {
      label: 'ToDo',
      value: 'todo',
    },
    {
      label: 'Done',
      value: 'done',
    },
  ];

  priorityList = [
    {
      label: '1',
      value: 1,
    },
    {
      label: '2',
      value: 2,
    },
    {
      label: '3',
      value: 3,
    },
  ];

  filteredValuesAll = {
    task_statuses: 'All',
    priorities: 'All',
    descriptions: 'All',
    school_ids: 'All',
    campuses: 'All',
  };

  filteredSchool: Observable<any[]>;
  filterSchoolList = [];

  filteredCampus: Observable<any[]>;
  filterCampusList = [];

  filteredTitle: Observable<any[]>;
  filterTitleList = [];

  filteredTaskType: Observable<any[]>;
  taskTypeList = [];

  isReset: boolean;
  filterBreadcrumbData: any;
  currentUser: any;

  filteredRncpTitle: Observable<string[]>;
  dueDateFilter = new UntypedFormControl('');
  taskStatusFilter = new UntypedFormControl(null);
  createdByFilter = new UntypedFormControl();
  assignedFilter = new UntypedFormControl();
  priorityFilter = new UntypedFormControl(null);
  createdDateFilter = new UntypedFormControl('');
  schoolFilter = new UntypedFormControl(null);
  campusFilter = new UntypedFormControl(null);
  descriptionFilter = new UntypedFormControl(null);

  constructor(
    private httpClient: HttpClient, 
    private apollo: Apollo, 
    private utilService: UtilityService,
    private router: Router,
    private authService: AuthService,
    public dialog: MatDialog,
    private formFillingService: FormFillingService,
    private translate: TranslateService,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {
      this.CurUser = this.authService.getLocalStorageUser();
    }

  @Cacheable()
  getTask(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/task.json');
  }

  // getMyTask(): Observable<any> {

  // }

  getUserTypesCorrectorsID() {
    return [
      {
        _id: '5a2e1ecd53b95d22c82f9559',
        name: 'Corrector',
      },
      {
        _id: '5b210d24090336708818ded1',
        name: 'Corrector Certifier',
      },
      {
        _id: '5a2e1ecd53b95d22c82f954e',
        name: 'operator_admin',
      },
    ];
  }

  getMarkEntryProgress(testId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
            query {
              GetTestProgress(_id: "${testId}") {
                mark_entry_done {
                  _id
                }
              }
            }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetTestProgress']));
  }

  getTestProgress(testId: string, schoolId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
            query GetTestProgress{
              GetTestProgress(_id: "${testId}", school_id: "${schoolId}") {
                mark_entry_done {
                  _id
                }
                validate_done {
                  _id
                }
              }
            }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetTestProgress']));
  }

  checkMarkEntryStarted(testId: string, schoolId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
            query {
              GetAllTestCorrections(test_id: "${testId}", school_id: "${schoolId}") {
                _id
              }
            }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTestCorrections']));
  }

  getTestDetail(testId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneTest{
            GetOneTest(_id: "${testId}") {
              _id
              correction_type
              group_test
              block_type
              parent_rncp_title {
                long_name
              }
              class_id {
                name
                type_evaluation
              }
              evaluation_id {
                _id
                evaluation
              }
              subject_id {
                subject_name
              }
              date {
                date_utc
                time_utc
              }
              corrector_assigned {
                corrector_id {
                  _id
                  first_name
                  last_name
                  civility
                }
                school_id {
                  _id
                }
                no_of_student
              }
              block_of_competence_condition_id {
                _id
                specialization {
                  _id
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneTest']));
  }

  getStudentCount(
    titleId: string,
    schoolId: string,
    classId: string,
    specializationId: string,
    blockCompId: string,
    pagination = { limit: 1, page: 0 },
    status = 'active_pending',
  ) {
    return this.apollo
      .query({
        query: gql`
          query GetAllStudentsForAssignCorrector(
            $titleId: ID
            $classId: ID
            $schoolId: ID
            $pagination: PaginationInput
            $status: EnumFilterStatus
          ) {
            GetAllStudents(
              rncp_title: $titleId,
              current_class: $classId,
              school: $schoolId,
              ${specializationId ? `specialization_id: "${specializationId}"` : ''}
              ${blockCompId ? `block_of_competence_condition_id: "${blockCompId}"` : ``}
              pagination: $pagination,
              status: $status
            ) {
              count_document
            }
          }
        `,
        variables: {
          titleId,
          classId,
          schoolId,
          pagination,
          status,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getRetakeStudentCount(
    titleId: string,
    schoolId: string,
    classId: string,
    specializationId: string,
    blockCompId: string,
    testId: string,
    evaluationId: string,
    pagination = { limit: 1, page: 0 },
    status = 'retaking',
  ) {
    return this.apollo
      .query({
        query: gql`
          query GetAllRetakeStudentsForAssignCorrector(
            $titleId: ID
            $classId: ID
            $schoolId: ID
            $testId: ID
            $evaluationId: ID
            $pagination: PaginationInput
            $status: EnumFilterStatus
          ) {
            GetAllStudents(
              rncp_title: $titleId,
              current_class: $classId,
              school: $schoolId,
              for_final_retake_test: true,
              test_for_final_retake: $testId,
              evaluation_for_final_retake: $evaluationId,
              ${specializationId ? `specialization_id: "${specializationId}"` : ''}
              ${blockCompId ? `block_of_competence_condition_id: "${blockCompId}"` : ``}
              pagination: $pagination,
              status: $status
            ) {
              count_document
            }
          }
        `,
        variables: {
          titleId,
          classId,
          schoolId,
          testId,
          evaluationId,
          pagination,
          status,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getTestGroups(testId: string, schoolId: string) {
    return this.apollo
      .query({
        query: gql`
      query getAllGroupsOfAssignCorrector{
        GetAllTestGroups(test_id: "${testId}", school_id: "${schoolId}") {
          _id
          test {
            _id
          }
          name
          students {
            student_id {
              _id
            }
          }
          school {
            _id
          }
          rncp {
            _id
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTestGroups']));
  }

  getCorrectorUsers(title, schools, user_type) {
    return this.apollo
      .query({
        query: gql`
          query GetAllUsers($title: [ID!], $schools: [ID], $user_type: [ID!]) {
            GetAllUsers(title: $title, schools: $schools, user_type: $user_type) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        variables: {
          title,
          schools,
          user_type,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getCorrectorCertifierUsers(title, user_type) {
    return this.apollo
      .query({
        query: gql`
          query GetAllUsers($title: [ID!], $user_type: [ID!]) {
            GetAllUsers(title: $title, user_type: $user_type) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        variables: {
          title,
          user_type,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  assignCorrector(test_id, school_id, correctors_id, update_corrector) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SaveAssignedCorrector($test_id: ID!, $school_id: ID!, $correctors_id: [ID!], $update_corrector: Boolean) {
            SaveAssignedCorrector(
              test_id: $test_id
              school_id: $school_id
              correctors_id: $correctors_id
              update_corrector: $update_corrector
            ) {
              _id
            }
          }
        `,
        variables: {
          test_id,
          school_id,
          correctors_id,
          update_corrector,
        },
      })
      .pipe(map((resp) => resp.data['SaveAssignedCorrector']));
  }

  studentJustification(task_id, reason) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation StudentJustification($task_id: ID, $reason: String) {
            StudentJustification(task_id: $task_id, reason: $reason) {
              _id
            }
          }
        `,
        variables: {
          task_id,
          reason,
        },
      })
      .pipe(map((resp) => resp.data['StudentJustification']));
  }

  juryJustification(task_id, reason) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation JuryJustification($task_id: ID, $reason: String) {
            JuryJustification(task_id: $task_id, reason: $reason) {
              _id
            }
          }
        `,
        variables: {
          task_id,
          reason,
        },
      })
      .pipe(map((resp) => resp.data['JuryJustification']));
  }

  assignCorrectorForRetake(test_id, school_id, correctors_id, update_corrector, taskId) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SaveAssignedCorrectorForFinalRetake(
            $test_id: ID!
            $school_id: ID!
            $correctors_id: [ID!]
            $update_corrector: Boolean
            $taskId: ID
          ) {
            SaveAssignedCorrectorForFinalRetake(
              test_id: $test_id
              school_id: $school_id
              correctors_id: $correctors_id
              update_corrector: $update_corrector
              task_id: $taskId
            ) {
              _id
            }
          }
        `,
        variables: {
          test_id,
          school_id,
          correctors_id,
          update_corrector,
          taskId,
        },
      })
      .pipe(map((resp) => resp.data['SaveAssignedCorrectorForFinalRetake']));
  }

  startNextTask(done_task_id, next_assigned_users, update_assigned_user, lang) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DoneAndStartNextTask($done_task_id: ID!, $next_assigned_users: [ID!], $update_assigned_user: Boolean, $lang: String) {
            DoneAndStartNextTask(
              done_task_id: $done_task_id
              next_assigned_users: $next_assigned_users
              update_assigned_user: $update_assigned_user
              lang: $lang
            ) {
              _id
            }
          }
        `,
        variables: {
          done_task_id,
          next_assigned_users,
          update_assigned_user,
          lang,
        },
      })
      .pipe(map((resp) => resp.data['DoneAndStartNextTask']));
  }

  startNextTaskForGroup(done_task_id, next_assigned_groups, update_assigned_group, lang) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DoneAndStartNextTask($done_task_id: ID!, $next_assigned_groups: [ID!], $update_assigned_group: Boolean, $lang: String) {
            DoneAndStartNextTask(
              done_task_id: $done_task_id
              next_assigned_groups: $next_assigned_groups
              update_assigned_group: $update_assigned_group
              lang: $lang
            ) {
              _id
            }
          }
        `,
        variables: {
          done_task_id,
          next_assigned_groups,
          update_assigned_group,
          lang,
        },
      })
      .pipe(map((resp) => resp.data['DoneAndStartNextTask']));
  }

  getMyTask(pagination, sorting, filter, user_login_type) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTasks($pagination: PaginationInput, $sorting: TaskSortingInput, $filter: TaskFilterInput, $user_login_type: ID) {
            GetAllTasks(pagination: $pagination, sorting: $sorting, filter: $filter, user_login_type: $user_login_type) {
              _id
              rncp {
                _id
              }
              form_process_id {
                civility
                first_name
                last_name
                form_builder_id {
                  _id
                  template_type
                }
              }
              test_group_id {
                _id
                name
              }
              task_status
              due_date {
                date
                time
              }
              created_by {
                _id
                first_name
                last_name
                civility
              }
              created_date {
                date
                time
              }
              rncp {
                _id
                short_name
              }
              school {
                _id
                short_name
                country
              }
              campuses {
                _id
                name
              }
              class_id {
                _id
                name
              }
              #created_by {
              #  _id
              #  civility
              #  first_name
              #  last_name
              #}
              user_selection {
                user_id {
                  _id
                  civility
                  first_name
                  last_name
                  student_id {
                    _id
                  }
                  entities {
                    campus {
                      name
                    }
                  }
                }
                user_type_id {
                  _id
                  name
                }
              }
              description
              type
              test {
                _id
                date_type
                type
                date_type
                name
                group_test
                correction_type
                subject_id {
                  subject_name
                }
                evaluation_id {
                  _id
                  evaluation
                }
                parent_category {
                  _id
                  folder_name
                }
              }
              priority
              count_document
              expected_document_id
              task_status
              for_each_student
              for_each_group
              expected_document {
                file_type
              }
              student_id {
                _id
                first_name
                last_name
                civility
              }
              action_taken
              document_expecteds {
                name
              }
              fc_contract_process_id {
                _id
              }
              employability_survey_id {
                _id
              }
              jury_member_id
              jury_id {
                _id
                name
                type
                jury_members {
                  _id
                  students {
                    student_id {
                      _id
                    }
                    date_test
                    test_hours_start
                  }
                }
              }
              candidate_id {
                _id
                civility
                first_name
                last_name
                intake_channel {
                  _id
                  program
                  scholar_season_id {
                    _id
                    scholar_season
                  }
                }
              }
              contract_process {
                _id
                civility
                last_name
                first_name
              }
              admission_process_id {
                _id
              }
              admission_process_step_name
            }
          }
        `,
        variables: {
          sorting,
          pagination,
          filter,
          user_login_type,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllTasks'];
        }),
      );
  }

  getAllSchool(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllCandidateSchool {
            GetAllCandidateSchool {
              _id
              short_name
              long_name
              campuses {
                _id
                name
                levels {
                  _id
                  name
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllCandidateSchool'];
        }),
      );
  }

  getOneTask(taskId) {
    return this.apollo
      .query({
        query: gql`
          query GetOneTask($_id: ID!) {
            GetOneTask(_id: $_id) {
              _id
              test_group_id {
                _id
                name
              }
              task_status
              due_date {
                date
                time
              }
              created_date {
                date
                time
              }
              rncp {
                _id
                short_name
              }
              school {
                _id
                short_name
              }
              class_id {
                _id
                name
              }
              created_by {
                _id
                civility
                first_name
                last_name
              }
              user_selection {
                user_id {
                  _id
                  civility
                  first_name
                  last_name
                  student_id {
                    _id
                  }
                }
                user_type_id {
                  _id
                  name
                }
              }
              description
              type
              test {
                _id
                date_type
                type
                date_type
                name
                group_test
                correction_type
                subject_id {
                  subject_name
                }
                evaluation_id {
                  _id
                  evaluation
                }
                parent_category {
                  _id
                  folder_name
                }
              }
              priority
              count_document
              expected_document_id
              task_status
              for_each_student
              for_each_group
              expected_document {
                file_type
              }
              student_id {
                _id
                first_name
                last_name
                civility
              }
              action_taken
              document_expecteds {
                name
              }
              employability_survey_id {
                _id
              }
              jury_id {
                _id
                name
              }
            }
          }
        `,
        variables: {
          _id: taskId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneTask'];
        }),
      );
  }

  GetADMTCTitleDropdownList() {
    return this.apollo
      .query({
        query: gql`
          query GetTitleDropdownList{
            GetTitleDropdownList {
              _id
              short_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetTitleDropdownList']));
  }

  updateManualTask(taskId, payload) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateTask($_id: ID!, $task_input: AcadTaskInput) {
            UpdateTask(_id: $_id, task_input: $task_input) {
              _id
            }
          }
        `,
        variables: {
          _id: taskId,
          task_input: payload,
        },
      })
      .pipe(map((resp) => resp.data['UpdateTask']));
  }

  doneManualTask(taskId: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DoneAndStartNextTaskManualTask($done_task_id: ID!) {
            DoneAndStartNextTask(done_task_id: $done_task_id) {
              _id
            }
          }
        `,
        variables: {
          done_task_id: taskId,
        },
      })
      .pipe(map((resp) => resp.data['DoneAndStartNextTask']));
  }

  deleteManualTask(taskId: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteTask($_id: ID!) {
            DeleteTask(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id: taskId,
        },
      })
      .pipe(map((resp) => resp.data['DeleteTask']));
  }

  getTaskForJury(_id) {
    return this.apollo
      .query({
        query: gql`
          query {
            GetOneTask(_id: "${_id}") {
              jury_member_id
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneTask'];
        }),
      );
  }

  getJuryFromTask(_id) {
    return this.apollo
      .query({
        query: gql`
          query {
            GetOneJuryMember(_id: "${_id}") {
              students {
                student_id {
                  _id
                }
                date_test
                test_hours_start
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneJuryMember'];
        }),
      );
  }

  // ERP_072
  openTask(task: any) {
    if (task && task.task_status && task.task_status === 'todo') {
      if (task && task.description) {
        if (task && task.description === 'Validate Financement') {
          this.viewCandidateInfo(task, 'Student', 'Financement');
        }
      }
      if (task && task.type) {
        if (task.type === 'fc_contract_process') {
          this.goToFCContractForm(task);
        } else if (task.type === 'add_task' || task.type === 'addTask' || task.type === 'internal_task') {
          this.openManualTask(task);
        }
      }
      if (task.type === 'student_confirm_certificate') {
        // when we login as student, redirect him to my file menu, tab "details of certification"
        if (this.utilService.isUserStudent()) {
          this.redirectToMyFileDetailOfCertificationTab();
        }
      }
      if (task.type && task.type === 'validate_contract_process') {
        this.goToForm(task);
      }
      if (task.type && task.type === 'validate_student_admission_process') {
        this.goToFormContinousAdmissionFC(task);
      }
      if (
        task.type === 'complete_form_process' ||
        task.type === 'revision_form_proses' ||
        task.type === 'validate_form_process' ||
        task.type === 'final_validate_form_process'
      ) {
        this.goToAdmissionProcessForm(task);
      }
    }
  }

  viewCandidateInfo(task, tab?, subTab?) {
    // console.log(candidateId);
    const selectedProgram = task?.candidate_id?.intake_channel?._id
    const query = {
      selectedCandidate: task?.candidate_id?._id,
      tab: tab || '',
      subTab: subTab || '',
      paginator: JSON.stringify({
        pageIndex: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize,
      }),
    };
    if (selectedProgram) {
      query['selectedProgram'] = selectedProgram
    }
    // console.log(query);
    if (tab) {
      const url = this.router.createUrlTree(['candidate-file'], { queryParams: query });
      window.open(url.toString(), '_blank');
    } else {
      // this.router.navigate(['candidate-file'], { queryParams: query });
      const url = this.router.createUrlTree(['candidate-file'], { queryParams: query });
      window.open(url.toString(), '_blank');
    }
  }

  goToFCContractForm(task: any) {
    // console.log('GOTO FC CONTRACT FORM', task);
    if (task && task.fc_contract_process_id && task.fc_contract_process_id._id) {
      const url = this.router.createUrlTree(['form-fc-contract'], {
        queryParams: {
          formId: task.fc_contract_process_id._id,
          userId: this.CurUser._id,
          candidateId: task.candidate_id && task.candidate_id._id ? task.candidate_id._id : '',
          formType: 'fc_contract',
          type: 'edit',
        },
      });
      window.open(url.toString(), '_blank');
    }
  }

  openManualTask(task) {
    const dialogRef = this.dialog.open(ManualTaskDialogComponent, {
      width: '600px',
      minHeight: '100px',
      panelClass: 'certification-rule-pop-up',
      disableClose: true,
      data: { taskData: task },
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      this.getMyTasks();
    });
  }

  redirectToMyFileDetailOfCertificationTab() {
    this.router.navigate(['/my-file'], {
      queryParams: { identity: 'verification' },
    });
  }

  goToForm(taskData) {
    const url = this.router.createUrlTree(['/form-teacher-contract'], {
      queryParams: { formId: taskData.contract_process._id, userId: taskData.user_selection.user_id._id, formType: 'teacher_contract' },
    });
    window.open(url.toString(), '_blank');
  }

  goToFormContinousAdmissionFC(taskData) {
    const userTypeId = this.authService.getCurrentUser().entities[0].type._id;

    const url = this.router.createUrlTree(['/form-fill'], {
      queryParams: {
        formId: taskData.admission_process_id._id,
        formType: 'student_admission',
        userId: taskData.user_selection.user_id._id,
        userTypeId: userTypeId,
      },
    });
    window.open(url.toString(), '_blank');
  }

  goToAdmissionProcessForm(taskData) {
    this.isWaitingForResponseTask = true;
    this.subs.sink = this.formFillingService.getOneTaskForFormFilling(taskData._id).subscribe(
      (result) => {
        this.isWaitingForResponseTask = false;
        if (result) {
          const dataForm = _.cloneDeep(result);
          const domainUrl = this.router.url.split('/')[0];
          const processId = result.form_process_id && result.form_process_id._id ? result.form_process_id._id : null;
          const userId =
            result.user_selection && result.user_selection.user_id && result.user_selection.user_id._id
              ? result.user_selection.user_id._id
              : null;
          let userTypeId = null;
          const taskUserTypeId = result?.user_selection?.user_type_id?._id ? result?.user_selection?.user_type_id?._id : null;
          if(taskUserTypeId && this.CurUser?.app_data?.user_type_id?.length){
            userTypeId = this.CurUser?.app_data?.user_type_id?.find(user => user === taskUserTypeId)
          }
          if(!userTypeId){
            userTypeId = this.authService.getCurrentUser().entities[0].type._id;
          }
          if (processId && userId) {
            if (
              dataForm &&
              dataForm.form_process_id &&
              dataForm.form_process_id.form_builder_id &&
              dataForm.form_process_id.form_builder_id.template_type === 'student_admission'
            ) {
              window.open(
                `${domainUrl}/form-fill?formId=${processId}&formType=student_admission&userId=${userId}&userTypeId=${userTypeId}`,
                '_blank',
              );
            } else if (
              dataForm &&
              dataForm.form_process_id &&
              dataForm.form_process_id.form_builder_id &&
              dataForm.form_process_id.form_builder_id.template_type === 'fc_contract'
            ) {
              const whoCompleteTheForm = result?.form_process_step_id?.user_who_complete_step?._id;
              const actorCompleteForm = dataForm?.user_selection?.user_type_id?._id
                ? dataForm?.user_selection?.user_type_id?._id
                : whoCompleteTheForm;
              window.open(
                `${domainUrl}/form-fill?formId=${processId}&formType=fc_contract&userId=${userId}&userTypeId=${actorCompleteForm}`,
                '_blank',
              );
            } else if (
              dataForm &&
              dataForm.form_process_id &&
              dataForm.form_process_id.form_builder_id &&
              dataForm.form_process_id.form_builder_id.template_type === 'teacher_contract'
            ) {
              window.open(
                `${domainUrl}/form-fill?formId=${processId}&formType=teacher_contract&userId=${userId}&userTypeId=${userTypeId}`,
                '_blank',
              );
            } else if (
              dataForm &&
              dataForm.form_process_id &&
              dataForm.form_process_id.form_builder_id &&
              dataForm.form_process_id.form_builder_id.template_type === 'one_time_form'
            ) {
              window.open(
                `${domainUrl}/form-fill?formId=${processId}&formType=one_time_form&userId=${userId}&userTypeId=${userTypeId}`,
                '_blank',
              );
            } else if (
              dataForm &&
              dataForm.form_process_id &&
              dataForm.form_process_id.form_builder_id &&
              dataForm.form_process_id.form_builder_id.template_type === 'admission_document'
            ) {
              window.open(
                `${domainUrl}/form-fill?formId=${processId}&formType=admissionDocument&userId=${userId}&userTypeId=${userTypeId}`,
                '_blank',
              );
            }
          }
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponseTask = false;
        this.swalError(err);
      },
    );
  }

  getMyTasks() {
    this.pagination = {
      limit: 10,
      page: this.paginator.pageIndex,
    };

    const params =
      this.filterValues.due_date.date ||
      this.filterValues.due_date.time ||
      this.filterValues.created_at.date ||
      this.filterValues.created_at.time;
    this.filterValues.offset = params ? moment().utcOffset() : null;
    const sorting = this.cleanSortingPayload();
    // console.log('sorting 2', sorting);
    const filter = this.cleanFilterPayload();
    // console.log('filter', filter);
    this.isWaitingForResponse = true;
    this.isReset = false;
    this.getMyTask(this.pagination, sorting, filter, this.currentUser).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.dataSource.data = resp;
        if (resp && resp.length) {
          this.paginator.length = resp[0].count_document ? resp[0].count_document : 0;
        } else {
          this.paginator.length = 0;
        }
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
        // if (this.isCheckedAll) {
        //   this.dataSource.data.forEach((row) => this.selection.select(row));
        // }
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
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
        }
        this.swalError(err);
      },
    );
  }

  filterBreadcrumbFormat() {
    const filterInfo: any[] = [
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'due_date', // name of the key in the object storing the filter
        column: 'TASK.Due_Date', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filterValues?.due_date?.date ? this.filterValues : null,
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.dueDateFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null,
        nestedKey: 'date',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'task_statuses', // name of the key in the object storing the filter
        column: 'TASK.Status', // name of the column in the table or the field if super filter
        isMultiple: this.taskStatusFilter?.value?.length === this.statusListUnmap?.length ? false : true, // can it support multiple selection
        filterValue: this.taskStatusFilter?.value?.length === this.statusListUnmap?.length ? this.filteredValuesAll : this.filterValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.taskStatusFilter?.value?.length === this.statusListUnmap?.length ? null : this.statusListUnmap, // the array/list holding the dropdown options
        filterRef: this.taskStatusFilter, // the ref to form control binded to the filter
        isSelectionInput: this.taskStatusFilter?.value?.length === this.statusListUnmap?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.taskStatusFilter?.value?.length === this.statusListUnmap?.length ? null : 'label', // the key displayed in the html (only applicable to array of objects)
        savedValue: this.taskStatusFilter?.value?.length === this.statusListUnmap?.length ? null : 'value',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'from', // name of the key in the object storing the filter
        column: 'TASK.From', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filterValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.createdByFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'to', // name of the key in the object storing the filter
        column: 'TASK.Assigned_To', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filterValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.assignedFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'priorities', // name of the key in the object storing the filter
        column: 'P', // name of the column in the table or the field if super filter
        isMultiple: this.priorityFilter?.value?.length === this.priorityList?.length ? false : true, // can it support multiple selection
        filterValue: this.priorityFilter?.value?.length === this.priorityList?.length ? this.filteredValuesAll : this.filterValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.priorityFilter?.value?.length === this.priorityList?.length ? null : this.priorityList, // the array/list holding the dropdown options
        filterRef: this.priorityFilter, // the ref to form control binded to the filter
        isSelectionInput: this.priorityFilter?.value?.length === this.priorityList?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.priorityFilter?.value?.length === this.priorityList?.length ? null : 'label', // the key displayed in the html (only applicable to array of objects)
        savedValue: this.priorityFilter?.value?.length === this.priorityList?.length ? null : 'value',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'created_at', // name of the key in the object storing the filter
        column: 'TASK.Created', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filterValues?.created_at?.date ? this.filterValues : null,
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.createdDateFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null,
        nestedKey: 'date',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'school_ids', // name of the key in the object storing the filter
        column: 'TASK.School', // name of the column in the table or the field if super filter
        isMultiple: this.schoolFilter?.value?.length === this.filterSchoolList?.length ? false : true, // can it support multiple selection
        filterValue: this.schoolFilter?.value?.length === this.filterSchoolList?.length ? this.filteredValuesAll : this.filterValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.schoolFilter?.value?.length === this.filterSchoolList?.length ? null : this.filterSchoolList, // the array/list holding the dropdown options
        filterRef: this.schoolFilter, // the ref to form control binded to the filter
        isSelectionInput: this.schoolFilter?.value?.length === this.filterSchoolList?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.schoolFilter?.value?.length === this.filterSchoolList?.length ? null : 'short_name', // the key displayed in the html (only applicable to array of objects)
        savedValue: this.schoolFilter?.value?.length === this.filterSchoolList?.length ? null : '_id',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'campuses', // name of the key in the object storing the filter
        column: 'TASK.Campus', // name of the column in the table or the field if super filter
        isMultiple: this.campusFilter?.value?.length === this.filterCampusList?.length ? false : true, // can it support multiple selection
        filterValue: this.campusFilter?.value?.length === this.filterCampusList?.length ? this.filteredValuesAll : this.filterValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.campusFilter?.value?.length === this.filterCampusList?.length ? null : this.filterCampusList, // the array/list holding the dropdown options
        filterRef: this.campusFilter, // the ref to form control binded to the filter
        isSelectionInput: this.campusFilter?.value?.length === this.filterCampusList?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.campusFilter?.value?.length === this.filterCampusList?.length ? null : 'name', // the key displayed in the html (only applicable to array of objects)
        savedValue: this.campusFilter?.value?.length === this.filterCampusList?.length ? null : 'name',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'descriptions', // name of the key in the object storing the filter
        column: 'Description', // name of the column in the table or the field if super filter
        isMultiple: this.descriptionFilter?.value?.length === this.taskTypeList?.length ? false : true, // can it support multiple selection
        filterValue: this.descriptionFilter?.value?.length === this.taskTypeList?.length ? this.filteredValuesAll : this.filterValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.descriptionFilter?.value?.length === this.taskTypeList?.length ? null : this.taskTypeList, // the array/list holding the dropdown options
        filterRef: this.descriptionFilter, // the ref to form control binded to the filter
        isSelectionInput: this.descriptionFilter?.value?.length === this.taskTypeList?.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.descriptionFilter?.value?.length === this.taskTypeList?.length ? null : 'name', // the key displayed in the html (only applicable to array of objects)
        savedValue: this.descriptionFilter?.value?.length === this.taskTypeList?.length ? null : 'name',
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  cleanFilterPayload() {
    const payloadFilter = _.cloneDeep(this.filterValues);
    if (payloadFilter) {
      if (!payloadFilter.test_id) {
        delete payloadFilter.test_id;
      }
      if (!payloadFilter.task_statuses || !payloadFilter.task_statuses?.length) {
        delete payloadFilter.task_status;
      }
      if (!payloadFilter.from) {
        delete payloadFilter.from;
      }
      if (!payloadFilter.to) {
        delete payloadFilter.to;
      }
      if (!payloadFilter.rncp_title) {
        delete payloadFilter.rncp_title;
      }
      if (!payloadFilter.priorities || !payloadFilter.priorities?.length) {
        delete payloadFilter.priorities;
      }
      if (!payloadFilter.school_ids || !payloadFilter.school_ids?.length) {
        delete payloadFilter.school_ids;
      }
      if (!payloadFilter.campuses || !payloadFilter.campuses?.length) {
        delete payloadFilter.campuses;
      }
      if (!payloadFilter.descriptions || !payloadFilter.descriptions?.length) {
        delete payloadFilter.descriptions;
      }
      if (payloadFilter.due_date && (!payloadFilter.due_date.date || !payloadFilter.due_date.time)) {
        delete payloadFilter.due_date;
      }
      if (payloadFilter.created_at && (!payloadFilter.created_at.date || !payloadFilter.created_at.time)) {
        delete payloadFilter.created_at;
      }
      if (!payloadFilter.offset) {
        delete payloadFilter.offset;
      }

      // check if entity is academic and its not chief group academic then will pass schoolId
      const user = this.utilService.getCurrentUser();
      if (
        user &&
        user.entities &&
        user.entities[0] &&
        user.entities[0].school_type === 'preparation_center' &&
        user.entities[0].school &&
        user.entities[0].school?._id
      ) {
        payloadFilter.school_id = user.entities[0].school?._id;
      }
      if (!payloadFilter.school_id) {
        delete payloadFilter.school_id;
      }
    }
    return payloadFilter;
  }

  cleanSortingPayload() {
    const payloadSorting = _.cloneDeep(this.sortingValues);
    if (payloadSorting) {
      if (!payloadSorting.due_date) {
        delete payloadSorting.due_date;
      }
      if (!payloadSorting.status) {
        delete payloadSorting.status;
      }
      if (!payloadSorting.from) {
        delete payloadSorting.from;
      }
      if (!payloadSorting.to) {
        delete payloadSorting.to;
      }
      if (!payloadSorting.priority) {
        delete payloadSorting.priority;
      }
      if (!payloadSorting.created_at) {
        delete payloadSorting.created_at;
      }
      if (!payloadSorting.school) {
        delete payloadSorting.school;
      }
    }
    return payloadSorting;
  }

  swalError(err) {
    // console.log('[Response BE][Error] : ', err);
    Swal.fire({
      type: 'info',
      title: this.translate.instant('SORRY'),
      text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
      confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
    });
  }
}
