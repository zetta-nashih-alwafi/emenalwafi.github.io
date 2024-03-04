import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cacheable } from 'ngx-cacheable';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SequenceService {
  constructor(public httpClient: HttpClient, private apollo: Apollo, private translate: TranslateService) {}

  GetAllDashboardCourseAndSequences(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllDashboardCourseAndSequences($pagination: PaginationInput) {
            GetAllDashboardCourseAndSequences(pagination: $pagination, ${filter}) {
              _id
              sequence
              scholar_season_id {
                _id
                scholar_season
              }
              school_id {
                _id
                short_name
                long_name
              }
              campus
              level
              specialization_id {
                _id
                name
              }
              semester
              date_start
              date_end
              is_internal_group
              is_enseignement
              is_enterprise
              is_universitaire
              status
              courses {
                _id
                modules {
                  module_name
                  courses {
                    is_optional_course
                    material
                    number_of_courses
                    duration
                    total_number_of_group
                    number_of_group_per_session
                    ects
                  }
                }
                status
              }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllDashboardCourseAndSequences']));
  }

  getAllGroupIntakeChannels(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllGroupIntakeChannels($pagination: PaginationInput, $sort: GroupIntakeChannelSorting) {
            GetAllGroupIntakeChannels(pagination: $pagination, sorting: $sort, ${filter}) {
          _id
          intake_channel
          external_effective
          internal_effective
          result_effective
          effective
          number_max_student_per_group
          number_external_groups
          Number_internal_groups
          status
          count_document
        }
      }
      `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGroupIntakeChannels']));
  }

  getAllGroupIntakeDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllGroupIntakeChannels {
              _id
              intake_channel
              external_effective
              internal_effective
              result_effective
              effective
              number_max_student_per_group
              number_external_groups
              Number_internal_groups
              status
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGroupIntakeChannels']));
  }

  CreateGroupIntakeChannel(group_intake_channel_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateGroupIntakeChannel($group_intake_channel_input: GroupIntakeChannelInput) {
            CreateGroupIntakeChannel(group_intake_channel_input: $group_intake_channel_input) {
              _id
            }
          }
        `,
        variables: {
          group_intake_channel_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateGroupIntakeChannel']));
  }

  UpdateGroupIntakeChannel(group_intake_channel_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateGroupIntakeChannel($group_intake_channel_input: GroupIntakeChannelInput, $_id: ID!) {
            UpdateGroupIntakeChannel(group_intake_channel_input: $group_intake_channel_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          group_intake_channel_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateGroupIntakeChannel']));
  }

  DeleteGroupIntakeChannel(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteGroupIntakeChannel($_id: ID!) {
            DeleteGroupIntakeChannel(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteGroupIntakeChannel']));
  }

  GetAllSubjectCourseAndSequences(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSubjectCourseAndSequences($pagination: PaginationInput, $sort: SubjectCourseAndSequenceSorting) {
            GetAllSubjectCourseAndSequences(pagination: $pagination, sorting: $sort, ${filter}) {
              _id
              short_name
              full_name
              status
              count_document
        }
      }
      `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSubjectCourseAndSequences']));
  }

  GetAllSubjectDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllSubjectCourseAndSequences {
              _id
              short_name
              full_name
              status
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSubjectCourseAndSequences']));
  }

  CreateSubjectCourseAndSequence(subject_course_and_sequence_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateSubjectCourseAndSequence($subject_course_and_sequence_input: SubjectCourseAndSequenceInput) {
            CreateSubjectCourseAndSequence(subject_course_and_sequence_input: $subject_course_and_sequence_input) {
              _id
            }
          }
        `,
        variables: {
          subject_course_and_sequence_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateSubjectCourseAndSequence']));
  }

  UpdateSubjectCourseAndSequence(subject_course_and_sequence_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateSubjectCourseAndSequence($subject_course_and_sequence_input: SubjectCourseAndSequenceInput, $_id: ID!) {
            UpdateSubjectCourseAndSequence(subject_course_and_sequence_input: $subject_course_and_sequence_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          subject_course_and_sequence_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateSubjectCourseAndSequence']));
  }

  DeleteSubjectCourseAndSequence(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteSubjectCourseAndSequence($_id: ID!) {
            DeleteSubjectCourseAndSequence(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteSubjectCourseAndSequence']));
  }

  GetAllModuleCourseAndSequences(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllModuleCourseAndSequences($pagination: PaginationInput, $sort: ModuleCourseAndSequenceSorting) {
            GetAllModuleCourseAndSequences(pagination: $pagination, sorting: $sort, ${filter}) {
              _id
              short_name
              full_name
              status
              count_document
        }
      }
      `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllModuleCourseAndSequences']));
  }

  GetAllModuleDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllModuleCourseAndSequences {
              _id
              short_name
              full_name
              status
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllModuleCourseAndSequences']));
  }

  CreateModuleCourseAndSequence(module_course_and_sequence_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateModuleCourseAndSequence($module_course_and_sequence_input: ModuleCourseAndSequenceInput) {
            CreateModuleCourseAndSequence(module_course_and_sequence_input: $module_course_and_sequence_input) {
              _id
            }
          }
        `,
        variables: {
          module_course_and_sequence_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateModuleCourseAndSequence']));
  }

  UpdateModuleCourseAndSequence(module_course_and_sequence_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateModuleCourseAndSequence($module_course_and_sequence_input: ModuleCourseAndSequenceInput, $_id: ID!) {
            UpdateModuleCourseAndSequence(module_course_and_sequence_input: $module_course_and_sequence_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          module_course_and_sequence_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateModuleCourseAndSequence']));
  }

  DeleteModuleCourseAndSequence(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteModuleCourseAndSequence($_id: ID!) {
            DeleteModuleCourseAndSequence(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteModuleCourseAndSequence']));
  }

  GetAllSequenceCourseAndSequences(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSequenceCourseAndSequences($pagination: PaginationInput, $sort: SequenceCourseAndSequenceFilter) {
            GetAllSequenceCourseAndSequences(pagination: $pagination, sorting: $sort, ${filter}) {
              _id
              sequence
              scholar_season_id {
                _id
                scholar_season
              }
              school_id {
                _id
                short_name
                long_name
              }
              level
              campus
              specialization_id {
                _id
                name
              }
              semester
              date_start
              date_end
              is_internal_group
              is_enseignement
              is_enterprise
              is_universitaire
              status
        }
      }
      `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSequenceCourseAndSequences']));
  }

  GetAllSequenceDropdown(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSequenceCourseAndSequences {
            GetAllSequenceCourseAndSequences(${filter}) {
              _id
              sequence
              scholar_season_id {
                _id
                scholar_season
              }
              school_id {
                _id
                short_name
                long_name
              }
              level
              campus
              specialization_id {
                _id
                name
              }
              semester
              date_start
              date_end
              is_internal_group
              is_enseignement
              is_enterprise
              is_universitaire
              status
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSequenceCourseAndSequences']));
  }

  GetAllGroupCourseCourseAndSequences(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllGroupCourseCourseAndSequences($pagination: PaginationInput, $sort: CourseCourseAndSequenceSorting) {
            GetAllGroupCourseCourseAndSequences(pagination: $pagination, sorting: $sort, ${filter}) {
              _id
              courses {
                sequence_id {
                  _id
                  sequence
                  date_start
                  date_end
                }
                scholar_season_id {
                  _id
                  scholar_season
                }
                school_id {
                  _id
                  short_name
                  long_name
                }
                campus
                level
                specialization_id {
                  _id
                  name
                }
                modules {
                  module_name
                  student_number
                  is_optional_course
                  courses {
                    _id
                    material
                    number_of_courses
                    obligatoire
                    session
                    duration {
                      hour
                      minute
                    }
                    total_number_of_group
                    number_of_group_per_session
                    ects
                    is_optional_course
                    place_limit
                    places
                    student_number
                    course_number
                    course_name
                  }
                  module_optional
                  }
                }
              count_document
            }
          }
      `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGroupCourseCourseAndSequences']));
  }

  GetAllGroupSequenceCourseAndSequences(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllGroupSequenceCourseAndSequences($pagination: PaginationInput, $sort: SequenceCourseAndSequenceSorting) {
            GetAllGroupSequenceCourseAndSequences(pagination: $pagination, sorting: $sort, ${filter}) {
              _id
              sequences {
                sequence
                date_start
                date_end
                scholar_season_id {
                  _id
                }
                school_id {
                  _id
                }
                campus
                level
                specialization_id {
                  _id
                }
                semester
                is_internal_group
                is_external_group
                is_enseignement
                is_enterprise
                is_universitaire
                status
              }
              count_document
            }
      }
      `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGroupSequenceCourseAndSequences']));
  }

  CreateSequenceCourseAndSequence(sequence_course_and_sequence_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateSequenceCourseAndSequence($sequence_course_and_sequence_input: SequenceCourseAndSequenceInput) {
            CreateSequenceCourseAndSequence(sequence_course_and_sequence_input: $sequence_course_and_sequence_input) {
              _id
            }
          }
        `,
        variables: {
          sequence_course_and_sequence_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateSequenceCourseAndSequence']));
  }

  UpdateSequenceCourseAndSequence(sequence_course_and_sequence_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateSequenceCourseAndSequence($sequence_course_and_sequence_input: SequenceCourseAndSequenceInput, $_id: ID!) {
            UpdateSequenceCourseAndSequence(sequence_course_and_sequence_input: $sequence_course_and_sequence_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          sequence_course_and_sequence_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateSequenceCourseAndSequence']));
  }

  DeleteSequenceCourseAndSequence(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteSequenceCourseAndSequence($_id: ID!) {
            DeleteSequenceCourseAndSequence(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteSequenceCourseAndSequence']));
  }

  GetAllCourseCourseAndSequences(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCourseCourseAndSequences($pagination: PaginationInput) {
            GetAllCourseCourseAndSequences(pagination: $pagination, ${filter}) {
              _id
              scholar_season_id {
                _id
                scholar_season
              }
              school_id {
                _id
                short_name
              }
              campus
              level
              specialization_id {
                _id
                name
              }
              sequence_id {
                _id
                sequence
              }
              modules {
                _id
                module_name
                student_number
                is_optional_course
                courses {
                  _id
                  material
                  number_of_courses
                  obligatoire
                  session
                  duration {
                    hour
                    minute
                  }
                  total_number_of_group
                  number_of_group_per_session
                  ects
                  is_optional_course
                  place_limit
                  places
                  student_number
                  course_number
                  course_name
                }
                module_optional
                }
              status
        }
      }
      `,
        variables: {
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCourseCourseAndSequences']));
  }

  GetAllCoursePopulation(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllCourseCourseAndSequences(${filter}) {
              _id
              scholar_season_id {
                _id
                scholar_season
              }
              school_id {
                _id
                short_name
              }
              campus
              level
              specialization_id {
                _id
                name
              }
              sequence_id {
                _id
                sequence
              }
              modules {
                _id
                module_name
                student_number
                is_optional_course
                courses {
                  material
                  number_of_courses
                  obligatoire
                  session
                  duration {
                    hour
                    minute
                  }
                  total_number_of_group
                  number_of_group_per_session
                  ects
                  is_optional_course
                  place_limit
                  places
                  student_number
                  course_number
                  course_name
                }
                module_optional
                }
              status
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCourseCourseAndSequences']));
  }

  GetAllCourseDropdown(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllCourseCourseAndSequences(${filter}) {
              _id
              modules {
                module_name
                courses {
                  material
                  course_name
                  _id
                }
              }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCourseCourseAndSequences']));
  }

  CreateCourseCourseAndSequence(course_course_and_sequence_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateCourseCourseAndSequence($course_course_and_sequence_input: CourseCourseAndSequenceInput) {
            CreateCourseCourseAndSequence(course_course_and_sequence_input: $course_course_and_sequence_input) {
              _id
            }
          }
        `,
        variables: {
          course_course_and_sequence_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateCourseCourseAndSequence']));
  }

  UpdateCourseCourseAndSequence(course_course_and_sequence_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCourseCourseAndSequence($course_course_and_sequence_input: CourseCourseAndSequenceInput, $_id: ID!) {
            UpdateCourseCourseAndSequence(course_course_and_sequence_input: $course_course_and_sequence_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          course_course_and_sequence_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateCourseCourseAndSequence']));
  }

  DeleteCourseCourseAndSequence(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteCourseCourseAndSequence($_id: ID!) {
            DeleteCourseCourseAndSequence(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteCourseCourseAndSequence']));
  }

  GetAllSubSequenceCourseAndSequences(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSubSequenceCourseAndSequences($pagination: PaginationInput) {
            GetAllSubSequenceCourseAndSequences(pagination: $pagination, ${filter}) {
              _id
              scholar_season_id {
                _id
                scholar_season
              }
              school_id {
                _id
                short_name
              }
              campus
              level
              specialization_id {
                _id
                name
              }
              sequence_id {
                _id
                sequence
              }
              courses_id {
                _id
              }
              sub_sequences {
                start_date
                end_date
                course_ids {
                  _id
                }
              }
              status
        }
      }
      `,
        variables: {
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSubSequenceCourseAndSequences']));
  }

  GetAllSubSequenceDropdown(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllSubSequenceCourseAndSequences(${filter}) {
              _id
              scholar_season_id {
                _id
                scholar_season
              }
              school_id {
                _id
                short_name
              }
              campus
              level
              specialization_id {
                _id
                name
              }
              sequence_id {
                _id
                sequence
              }
              courses_id {
                _id
              }
              sub_sequences {
                start_date
                end_date
                course_ids {
                  _id
                }
              }
              status
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSubSequenceCourseAndSequences']));
  }

  CreateSubSequenceCourseAndSequence(sub_sequence_course_and_sequence_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateSubSequenceCourseAndSequence($sub_sequence_course_and_sequence_input: SubSequenceCourseAndSequenceInput) {
            CreateSubSequenceCourseAndSequence(sub_sequence_course_and_sequence_input: $sub_sequence_course_and_sequence_input) {
              _id
            }
          }
        `,
        variables: {
          sub_sequence_course_and_sequence_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateSubSequenceCourseAndSequence']));
  }

  UpdateSubSequenceCourseAndSequence(sub_sequence_course_and_sequence_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateSubSequenceCourseAndSequence(
            $sub_sequence_course_and_sequence_input: SubSequenceCourseAndSequenceInput
            $_id: ID!
          ) {
            UpdateSubSequenceCourseAndSequence(sub_sequence_course_and_sequence_input: $sub_sequence_course_and_sequence_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          sub_sequence_course_and_sequence_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateSubSequenceCourseAndSequence']));
  }

  DeleteSubSequenceCourseAndSequence(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteSubSequenceCourseAndSequence($_id: ID!) {
            DeleteSubSequenceCourseAndSequence(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteSubSequenceCourseAndSequence']));
  }
}
