import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CourseSequenceService {
  constructor(public httpClient: HttpClient, private apollo: Apollo) {}
  private _childrenFormValidationStatus = true;

  public get childrenFormValidationStatus() {
    return this._childrenFormValidationStatus;
  }

  public set childrenFormValidationStatus(state: boolean) {
    this._childrenFormValidationStatus = state;
  }

  getTypesOfSequence(): string[] {
    return ['enseignement', 'period_in_company', 'school_exchange'];
  }

  // Start Template ================================================================================================
  GetAllTemplateCourseSequence(pagination, filter, sort): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTemplateCourseSequence(
            $pagination: PaginationInput
            $filter: TemplateCourseSequenceFilterInput
            $sort: TemplateCourseSequenceSortingInput
          ) {
            GetAllTemplateCourseSequence(pagination: $pagination, filter: $filter, sorting: $sort) {
              _id
              name
              template_sequences_id {
                _id
                name
              }
              description
              created_date {
                date
                time
              }
              updated_date {
                date
                time
              }
              created_by {
                _id
                first_name
                last_name
                civility
                email
              }
              updated_by {
                _id
                first_name
                last_name
                civility
                email
              }
              is_published
              count_document
            }
          }
        `,
        variables: {
          pagination,
          filter,
          sort: sort ? sort : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTemplateCourseSequence']));
  }

  getAllIdTemplateCourseSequenceCheckbox(pagination, filter, sort): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllTemplateCourseSequence(
            $pagination: PaginationInput
            $filter: TemplateCourseSequenceFilterInput
            $sort: TemplateCourseSequenceSortingInput
          ) {
            GetAllTemplateCourseSequence(pagination: $pagination, filter: $filter, sorting: $sort) {
              _id
            }
          }
        `,
        variables: {
          pagination,
          filter,
          sort: sort ? sort : {},
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTemplateCourseSequence']));
  }

  GetAllTemplateCourseSequenceDropdown(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTemplateCourseSequence($filter: TemplateCourseSequenceFilterInput) {
            GetAllTemplateCourseSequence(filter: $filter) {
              _id
              name
              template_sequences_id {
                _id
                name
                description
                start_date {
                  date
                  time
                }
                end_date {
                  date
                  time
                }
                number_of_week
                status
                sequence_id
                type_of_sequence
                template_modules_id {
                  _id
                  name
                  short_name
                  english_name
                  ects
                  module_id
                  template_sequence_id
                  template_subjects_id {
                    _id
                    name
                    short_name
                    english_name
                    subject_id {
                      _id
                      name
                    }
                    template_sessions_id {
                      _id
                      name
                      volume_hours_student
                      duration
                      class_group
                      volume_hours
                      template_subject_id
                    }
                    volume_student_total
                    volume_hours_total
                    academic_objective
                    note
                    ects
                  }
                }
              }
              description
              created_date {
                date
                time
              }
              updated_date {
                date
                time
              }
              created_by {
                _id
                first_name
                last_name
                civility
                email
              }
              updated_by {
                _id
                first_name
                last_name
                civility
                email
              }
              is_published
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTemplateCourseSequence']));
  }

  GetOneTemplateCourseSequence(_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneTemplateCourseSequence($_id: ID!) {
            GetOneTemplateCourseSequence(_id: $_id) {
              _id
              name
              template_sequences_id {
                _id
                name
              }
              description
              created_date {
                date
                time
              }
              updated_date {
                date
                time
              }
              created_by {
                _id
                first_name
                last_name
                civility
                email
              }
              updated_by {
                _id
                first_name
                last_name
                civility
                email
              }
              is_published
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneTemplateCourseSequence']));
  }

  GetOneTemplateDetailFull(_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneTemplateCourseSequence($_id: ID!) {
            GetOneTemplateCourseSequence(_id: $_id) {
              _id
              name
              template_sequences_id {
                _id
                name
                description
                start_date {
                  date
                  time
                }
                end_date {
                  date
                  time
                }
                number_of_week
                status
                sequence_id
                type_of_sequence
                template_modules_id {
                  _id
                  name
                  short_name
                  english_name
                  ects
                  module_id
                  template_sequence_id
                  template_subjects_id {
                    _id
                    name
                    short_name
                    english_name
                    subject_id {
                      _id
                    }
                    template_sessions_id {
                      _id
                      name
                      volume_hours_student
                      duration
                      class_group
                      volume_hours
                      template_subject_id
                    }
                    volume_student_total
                    volume_hours_total
                    academic_objective
                    note
                    ects
                  }
                }
              }
              description
              created_date {
                date
                time
              }
              updated_date {
                date
                time
              }
              created_by {
                _id
                first_name
                last_name
                civility
                email
              }
              updated_by {
                _id
                first_name
                last_name
                civility
                email
              }
              is_published
            }
          }
        `,
        variables: {
          _id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneTemplateCourseSequence']));
  }

  GetAllUserCreateTemplateDropdown(): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllUserCreateTemplateDropdown{
            GetAllUserCreateTemplateDropdown {
              _id
              first_name
              last_name
              civility
              email
            }
          }
        `,
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUserCreateTemplateDropdown']));
  }

  GetAllUserUpdateTemplateDropdown(): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllUserUpdateTemplateDropdown{
            GetAllUserUpdateTemplateDropdown {
              _id
              first_name
              last_name
              civility
              email
            }
          }
        `,
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUserUpdateTemplateDropdown']));
  }

  DeleteTemplateCourseSequence(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteTemplateCourseSequence($_id: ID!) {
            DeleteTemplateCourseSequence(_id: $_id) {
              name
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteTemplateCourseSequence']));
  }

  CreateTemplateCourseSequence(course_sequence_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateTemplateCourseSequence($course_sequence_input: TemplateCourseSequenceInput!) {
            CreateTemplateCourseSequence(course_sequence_input: $course_sequence_input) {
              name
            }
          }
        `,
        variables: {
          course_sequence_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateTemplateCourseSequence']));
  }

  UpdateTemplateCourseSequence(course_sequence_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateTemplateCourseSequence($course_sequence_input: TemplateCourseSequenceInput!, $_id: ID!) {
            UpdateTemplateCourseSequence(course_sequence_input: $course_sequence_input, _id: $_id) {
              name
            }
          }
        `,
        variables: {
          _id,
          course_sequence_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateTemplateCourseSequence']));
  }

  CreateUpdateTemplateCourseAndSequence(create_update_course_sequence_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateUpdateTemplateCourseAndSequence(
            $create_update_course_sequence_input: CreateUpdateTemplateCourseAndSequenceInput!
          ) {
            CreateUpdateTemplateCourseAndSequence(create_update_course_sequence_input: $create_update_course_sequence_input) {
              name
              _id
            }
          }
        `,
        variables: {
          create_update_course_sequence_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateUpdateTemplateCourseAndSequence']));
  }
  CreateUpdateProgramCourseAndSequence(create_update_program_course_sequence): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateUpdateProgramCourseAndSequence($create_update_program_course_sequence: CreateUpdateProgramCourseSequenceInput!) {
            CreateUpdateProgramCourseAndSequence(create_update_program_course_sequence: $create_update_program_course_sequence) {
              name
              _id
              template_course_sequence_id
            }
          }
        `,
        variables: {
          create_update_program_course_sequence,
        },
      })
      .pipe(map((resp) => resp.data['CreateUpdateProgramCourseAndSequence']));
  }

  DuplicateTemplateCourseSequence(template_course_sequence_id, name): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DuplicateTemplateCourseSequence($template_course_sequence_id: ID!, $name: String!) {
            DuplicateTemplateCourseSequence(template_course_sequence_id: $template_course_sequence_id, name: $name) {
              name
            }
          }
        `,
        variables: {
          template_course_sequence_id,
          name,
        },
      })
      .pipe(map((resp) => resp.data['DuplicateTemplateCourseSequence']));
  }
  // End Template ==================================================================================================

  getAllSequence(pagination, filter, sort, lang): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllSequence($pagination: PaginationInput, $filter: SequenceFilterInput, $sort: SequenceSortingInput, $lang: String) {
            GetAllSequence(pagination: $pagination, filter: $filter, sorting: $sort, lang: $lang) {
              _id
              name
              description
              type_of_sequence
              start_date {
                date
                time
              }
              end_date {
                date
                time
              }
              number_of_week
              status
              count_document
            }
          }
        `,
        variables: {
          pagination,
          filter,
          sort: sort ? sort : {},
          lang,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllSequence']));
  }

  getAllIdSequenceForExport(pagination, filter, sort): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllSequence($pagination: PaginationInput, $filter: SequenceFilterInput, $sort: SequenceSortingInput) {
            GetAllSequence(pagination: $pagination, filter: $filter, sorting: $sort) {
              _id
            }
          }
        `,
        variables: {
          pagination,
          filter,
          sort: sort ? sort : {},
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllSequence']));
  }

  getAllSequenceDropdown(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllSequence{
            GetAllSequence {
              _id
              name
              description
              type_of_sequence
              number_of_week
              status
              start_date {
                date
                time
              }
              end_date {
                date
                time
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllSequence']));
  }

  getAllSequenceId(filter): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllSequenceID($filter: SequenceFilterInput) {
            GetAllSequence(pagination: null, filter: $filter) {
              _id
            }
          }
        `,
        variables: { filter },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllSequence']));
  }

  createSequence(input: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateSequence($input: SequenceInput) {
            CreateSequence(sequence_input: $input) {
              _id
              name
              description
              type_of_sequence
              number_of_week
              status
              start_date {
                date
                time
              }
              end_date {
                date
                time
              }
            }
          }
        `,
        variables: { input },
      })
      .pipe(map((resp) => resp.data['CreateSequence']));
  }

  updateSequence(id: string, input: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateSequence($id: ID!, $input: SequenceInput) {
            UpdateSequence(_id: $id, sequence_input: $input) {
              _id
              name
              description
              type_of_sequence
              number_of_week
              status
              start_date {
                date
                time
              }
              end_date {
                date
                time
              }
            }
          }
        `,
        variables: { id, input },
      })
      .pipe(map((resp) => resp.data['CreateSequence']));
  }

  deleteSequence(_id: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteSequence($_id: ID!) {
            DeleteSequence(_id: $_id) {
              _id
            }
          }
        `,
        variables: { _id },
      })
      .pipe(map((resp) => resp.data['DeleteSequence']));
  }

  // Start Module ==================================================================================================
  getAllModule(pagination, filter, sorting): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllModules($pagination: PaginationInput, $filter: ModuleFilterInput, $sorting: ModuleSortingInput) {
            GetAllModules(pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
              name
              short_name
              english_name
              count_document
            }
          }
        `,
        variables: {
          pagination,
          filter,
          sorting: sorting ? sorting : {},
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllModules']));
  }

  getAllModulesIdForCheckbox(pagination, filter, sorting) {
    return this.apollo
      .query({
        query: gql`
          query GetAllModules($pagination: PaginationInput, $filter: ModuleFilterInput, $sorting: ModuleSortingInput) {
            GetAllModules(pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
            }
          }
        `,
        variables: {
          pagination,
          filter,
          sorting: sorting ? sorting : {},
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllModules']));
  }

  getAllModuleDropdown(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllModules{
            GetAllModules {
              _id
              name
              short_name
              english_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllModules']));
  }

  DeleteModule(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteModule($_id: ID!) {
            DeleteModule(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteModule']));
  }
  CreateModule(module_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateModule($module_input: ModuleInput!) {
            CreateModule(module_input: $module_input) {
              _id
              name
              short_name
              english_name
              count_document
            }
          }
        `,
        variables: {
          module_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateModule']));
  }

  UpdateModule(_id: string, module_input: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateModule($_id: ID!, $module_input: ModuleInput!) {
            UpdateModule(_id: $_id, module_input: $module_input) {
              _id
            }
          }
        `,
        variables: { _id, module_input },
      })
      .pipe(map((resp) => resp.data['UpdateModule']));
  }

  // End Module ====================================================================================================
  createGroupClassType(input: { name: string; group_classes_id: string[]; program_sequence_id: string }): Observable<{ _id: string }> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateGroupClassType($input: GroupClassTypeInput!) {
            CreateGroupClassType(group_class_type_input: $input) {
              _id
            }
          }
        `,
        variables: { input },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp['CreateGroupClassType']));
  }
  getAllCourseSubject(pagination, filter, sorting): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllCourseSubject($pagination: PaginationInput, $filter: CourseSubjectFilterInput, $sorting: CourseSubjectSortingInput) {
            GetAllCourseSubject(pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
              name
              short_name
              english_name
              count_document
            }
          }
        `,
        variables: {
          filter,
          pagination,
          sorting: sorting ? sorting : {},
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCourseSubject']));
  }
  getAllCourseSubjectIds(pagination, filter, sorting): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllCourseSubject($pagination: PaginationInput, $filter: CourseSubjectFilterInput, $sorting: CourseSubjectSortingInput) {
            GetAllCourseSubject(pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
            }
          }
        `,
        variables: {
          filter,
          pagination,
          sorting: sorting ? sorting : {},
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCourseSubject']));
  }
  getAllCourseSubjectDropdown(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllCourseSubject{
            GetAllCourseSubject {
              _id
              name
              short_name
              english_name
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCourseSubject']));
  }
  deleteCourseSubject(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteCourseSubject($_id: ID!) {
            DeleteCourseSubject(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteCourseSubject']));
  }
  CreateCourseSubject(course_subject_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateCourseSubject($course_subject_input: CourseSubjectInput) {
            CreateCourseSubject(course_subject_input: $course_subject_input) {
              _id
              name
              short_name
              english_name
              count_document
            }
          }
        `,
        variables: {
          course_subject_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateCourseSubject']));
  }

  sendProgramsToHyperplanning(program_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendProgramsToHyperplanning($program_ids: [ID]) {
            SendProgramsToHyperplanning(program_ids: $program_ids) {
              _id
              program
            }
          }
        `,
        variables: {
          program_ids,
        },
      })
      .pipe(map((resp) => resp.data['SendProgramsToHyperplanning']));
  }

  UpdateCourseSubject(_id: string, course_subject_input: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCourseSubject($_id: ID!, $course_subject_input: CourseSubjectInput) {
            UpdateCourseSubject(_id: $_id, course_subject_input: $course_subject_input) {
              _id
            }
          }
        `,
        variables: { _id, course_subject_input },
      })
      .pipe(map((resp) => resp.data['UpdateCourseSubject']));
  }
  getAllProgram(pagination, filter, user_type_logins): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllPrograms($pagination: PaginationInput, $filter: ProgramFilterInput, $user_type_logins: [ID]) {
            GetAllPrograms(pagination: $pagination, filter: $filter, user_type_logins: $user_type_logins) {
              _id
              program
              is_hyperplanning_updated
              scholar_season_id {
                _id
                scholar_season
              }
              school_id {
                _id
                short_name
              }
              campus {
                _id
                name
              }
              level {
                _id
                name
              }
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
              course_sequence_id {
                _id
                name
                created_by {
                  _id
                  civility
                  first_name
                  last_name
                }
                updated_by {
                  _id
                  civility
                  first_name
                  last_name
                }
                updated_date {
                  date
                  time
                }
                program_sequences_id {
                  template_sequence_id {
                    _id
                    name
                  }
                }
              }
              count_document
            }
          }
        `,
        variables: {
          filter,
          pagination,
          user_type_logins,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllPrograms']));
  }

  getHyperplanningLatestStatus(school_id, scholar_season_id): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetHyperplanningLatestStatus($school_id: ID!, $scholar_season_id: ID!) {
            GetHyperplanningLatestStatus(school_id: $school_id, scholar_season_id: $scholar_season_id) {
              _id
              is_hyperplanning_updated
              latest_hyperplanning_updated {
                date
                time
              }
            }
          }
        `,
        variables: {
          school_id,
          scholar_season_id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetHyperplanningLatestStatus']));
  }
  GetOneProgramCourseSequence(_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneProgramCourseSequence($_id: ID!) {
            GetOneProgramCourseSequence(_id: $_id) {
              _id
              name
              template_course_sequence_id
              program_sequences_id {
                _id
                name
                description
                sequence_id
                program_sequence_groups {
                  _id
                  name
                  program_sequence_id {
                    _id
                  }
                  number_of_class
                  number_of_student_each_class
                  student_classes {
                    _id
                    name
                    program_sequence_id {
                      _id
                    }
                    students_id {
                      _id
                    }
                  }
                  group_class_types {
                    _id
                    name
                    group_classes_id {
                      name
                      student_classes_id {
                        _id
                        name
                      }
                      program_sequence_id {
                        _id
                      }
                    }
                  }
                }
                type_of_sequence
                start_date {
                  date
                  time
                }
                end_date {
                  date
                  time
                }
                number_of_week
                status
                template_sequence_id {
                  _id
                }
                program_modules_id {
                  _id
                  name
                  short_name
                  english_name
                  ects
                  module_id
                  template_module_id {
                    _id
                  }
                  program_sequence_id {
                    _id
                  }
                  program_subjects_id {
                    _id
                    name
                    short_name
                    english_name
                    note
                    ects
                    template_subject_id {
                      _id
                      volume_student_total
                      volume_hours_total
                      subject_id {
                        _id
                      }
                    }
                    volume_student_total
                    volume_hours_total
                    academic_objective
                    program_sessions_id {
                      _id
                      name
                      volume_hours_student
                      duration
                      class_group
                      volume_hours
                      program_subject_id {
                        _id
                      }
                      template_session_id
                      is_teacher_assigned
                    }
                  }
                }
                number_of_class
                number_of_student_each_class
                student_classes {
                  _id
                  name
                }
              }
              description
              created_date {
                date
                time
              }
              updated_date {
                date
                time
              }
              created_by {
                _id
                first_name
                last_name
                civility
                email
              }
              updated_by {
                _id
                first_name
                last_name
                civility
                email
              }
              is_published
              programs_id {
                _id
                program
              }
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneProgramCourseSequence']));
  }
  getOneProgram(_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneProgramCourseSequence($_id: ID!) {
            GetOneProgramCourseSequence(_id: $_id) {
              _id
              name
              program_sequences_id {
                _id
                name
                description
                type_of_sequence
                number_of_class
                number_of_student_each_class
                student_classes {
                  _id
                  name
                }
                group_classes {
                  name
                  student_classes_id {
                    _id
                    name
                  }
                }
              }
            }
          }
        `,
        variables: {
          _id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneProgramCourseSequence']));
  }

  GetOneProgramCourseSequenceTab(_id): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetOneProgramCourseSequence($_id: ID!) {
            GetOneProgramCourseSequence(_id: $_id) {
              _id
              name
              template_course_sequence_id
              program_sequences_id {
                _id
                name
                description
                sequence_id
                program_sequence_groups {
                  _id
                  name
                  program_sequence_id {
                    _id
                  }
                  number_of_class
                  number_of_student_each_class
                  student_classes {
                    _id
                    name
                    program_sequence_id {
                      _id
                    }
                    students_id {
                      _id
                      first_name
                      civility
                      last_name
                    }
                  }
                  group_class_types {
                    _id
                    name
                    group_classes_id {
                      _id
                      name
                      student_classes_id {
                        _id
                        name
                      }
                      program_sequence_id {
                        _id
                      }
                      group_class_type_id
                    }
                  }
                }
                type_of_sequence
                start_date {
                  date
                  time
                }
                end_date {
                  date
                  time
                }
                number_of_week
                status
                template_sequence_id {
                  _id
                }
                program_modules_id {
                  _id
                  name
                  short_name
                  english_name
                  ects
                  module_id
                  template_module_id {
                    _id
                  }
                  program_sequence_id {
                    _id
                  }
                  program_subjects_id {
                    _id
                    name
                    short_name
                    english_name
                    note
                    ects
                    template_subject_id {
                      _id
                      subject_id {
                        _id
                      }
                    }
                    volume_student_total
                    volume_hours_total
                    academic_objective
                    program_sessions_id {
                      _id
                      name
                      volume_hours_student
                      duration
                      class_group
                      volume_hours
                      program_subject_id {
                        _id
                      }
                      template_session_id
                      is_teacher_assigned
                    }
                  }
                }
                number_of_class
                number_of_student_each_class
                student_classes {
                  _id
                  name
                  students_id {
                    _id
                    first_name
                    civility
                    last_name
                  }
                }
              }
              description
              created_date {
                date
                time
              }
              updated_date {
                date
                time
              }
              created_by {
                _id
                first_name
                last_name
                civility
                email
              }
              updated_by {
                _id
                first_name
                last_name
                civility
                email
              }
              is_published
              programs_id {
                _id
                program
              }
            }
          }
        `,
        variables: {
          _id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneProgramCourseSequence']));
  }

  // student classes
  getAllStudentClasses(filter): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllStudentClasses {
            GetAllStudentClasses(filter: {program_sequence_id: "${filter}"}) {
              _id
              name
              program_sequence_id{
                _id
                name
                number_of_class
                number_of_student_each_class
              }
              students_id{
                _id
                last_name
                first_name
                civility
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudentClasses']));
  }

  CreateUpdateStudentClasses(payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateUpdateStudentClasses(
            $program_sequence_group_id: ID!
            $program_sequence_id: ID!
            $number_of_class: Int
            $number_of_student_each_class: Int
            $student_classes: [StudentClassesInput]
          ) {
            CreateUpdateStudentClasses(
              program_sequence_group_id: $program_sequence_group_id
              program_sequence_id: $program_sequence_id
              number_of_class: $number_of_class
              number_of_student_each_class: $number_of_student_each_class
              student_classes: $student_classes
            ) {
              _id
            }
          }
        `,
        variables: {
          program_sequence_group_id: payload.program_sequence_group_id,
          program_sequence_id: payload.program_sequence_id,
          number_of_class: payload.number_of_class,
          number_of_student_each_class: payload.number_of_student_each_class,
          student_classes: payload.student_classes,
        },
      })
      .pipe(map((resp) => resp.data['CreateUpdateStudentClasses']));
  }

  CreateProgramSequenceGroup(program_sequence_group_input, program_sequence_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateProgramSequenceGroup($program_sequence_group_input: ProgramSequenceGroupInput!, $program_sequence_id: ID) {
            CreateProgramSequenceGroup(
              program_sequence_group_input: $program_sequence_group_input
              program_sequence_id: $program_sequence_id
            ) {
              _id
              name
            }
          }
        `,
        variables: {
          program_sequence_group_input: program_sequence_group_input,
          program_sequence_id: program_sequence_id,
        },
      })
      .pipe(map((resp) => resp.data['CreateProgramSequenceGroup']));
  }
  createUpdateGroupClasses(program_sequence_id, group_classes, group_class_type_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateUpdateGroupClasses($program_sequence_id: ID!, $group_classes: [GroupClassesInput], $group_class_type_id: ID!) {
            CreateUpdateGroupClasses(
              program_sequence_id: $program_sequence_id
              group_classes: $group_classes
              group_class_type_id: $group_class_type_id
            ) {
              _id
            }
          }
        `,
        variables: {
          program_sequence_id,
          group_classes,
          group_class_type_id,
        },
      })
      .pipe(map((resp) => resp.data['CreateUpdateGroupClasses']));
  }
  CreateUpdateGroupTypes(program_sequence_id, group_class_types, program_sequence_group_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateUpdateGroupTypes(
            $program_sequence_id: ID!
            $group_class_types: [GroupClassTypesInput]
            $program_sequence_group_id: ID!
          ) {
            CreateUpdateGroupTypes(
              program_sequence_id: $program_sequence_id
              group_class_types: $group_class_types
              program_sequence_group_id: $program_sequence_group_id
            ) {
              _id
              name
            }
          }
        `,
        variables: {
          program_sequence_id,
          group_class_types,
          program_sequence_group_id,
        },
      })
      .pipe(map((resp) => resp.data['CreateUpdateGroupTypes']));
  }
}
