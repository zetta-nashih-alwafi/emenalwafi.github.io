import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cacheable } from 'ngx-cacheable';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { environment } from 'environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class TeacherManagementService {
  constructor(private httpClient: HttpClient, private apollo: Apollo, private translate: TranslateService) {}

  getAllTeachers(pagination, filter, sorting) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTeachers($pagination: PaginationInput, $filter: TeacherFilterInput, $sorting: TeacherSortingInput, $lang: String) {
            GetAllTeachers(pagination: $pagination, filter: $filter, sorting: $sorting, lang: $lang) {
              _id
              first_name
              civility
              last_name
              user_status
              count_document
              email
              entities {
                entity_name
                type {
                  _id
                  name
                }
              }
              teacher_required_document_process_ids {
                contract_type
                form_status
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          filter,
          sorting,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['GetAllTeachers']));
  }

  getAllTeachersForCheckbox(pagination, filter, sorting) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTeachers($pagination: PaginationInput, $filter: TeacherFilterInput, $sorting: TeacherSortingInput) {
            GetAllTeachers(pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          filter,
          sorting,
        },
      })
      .pipe(map((resp) => resp.data['GetAllTeachers']));
  }

  createTeacher(payload: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateTeacher($userInput: UserInput) {
            CreateTeacher(create_teacher_input: $userInput) {
              _id
              civility
              first_name
              last_name
              email
            }
          }
        `,
        variables: {
          userInput: payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateTeacher']));
  }

  validateOrRejectAcadDocument(payload,sender_user_type_ids?,sender_user_id?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ValidateOrRejectAcadDocument($acad_doc_id: ID!, $validation_status: EnumValidationStatus,$sender_user_type_ids: [ID],$sender_user_id: ID) {
            ValidateOrRejectAcadDocument(acad_doc_id: $acad_doc_id, validation_status: $validation_status,sender_user_type_ids:$sender_user_type_ids,sender_user_id:$sender_user_id) {
              _id
            }
          }
        `,
        variables: {
          acad_doc_id: payload?._id,
          validation_status: payload?.validationStatus,
          sender_user_type_ids,
          sender_user_id
        },
      })
      .pipe(map((resp) => resp.data['ValidateOrRejectAcadDocument']));
  }

  sendReminderRequiredDocument(payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendReminderRequiredDocument($user_id: ID!) {
            SendReminderRequiredDocument(user_id: $user_id) {
              _id
            }
          }
        `,
        variables: {
          user_id: payload,
          lang: this.translate?.currentLang ? this.translate.currentLang : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SendReminderRequiredDocument']));
  }

  getAllTypeOfIntervention(pagination, filter, sorting) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTypeOfIntervention(
            $pagination: PaginationInput
            $filter: TypeOfInterventionFilterInput
            $sorting: TypeOfInterventionSorting
          ) {
            GetAllTypeOfIntervention(pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
              scholar_season_id {
                _id
                scholar_season
              }
              user_id {
                _id
                first_name
                last_name
              }
              legal_entity_id {
                _id
                legal_entity_name
              }
              type_of_intervention
              hourly_rate
              type_of_contract
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          filter,
          sorting,
        },
      })
      .pipe(map((resp) => resp.data['GetAllTypeOfIntervention']));
  }

  getAllTypeOfInterventionManualTeacher(filter) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTypeOfIntervention($filter: TypeOfInterventionFilterInput) {
            GetAllTypeOfIntervention(filter: $filter) {
              _id
              scholar_season_id {
                _id
                scholar_season
              }
              user_id {
                _id
                first_name
                last_name
              }
              legal_entity_id {
                _id
                legal_entity_name
              }
              type_of_intervention
              hourly_rate
              type_of_contract
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .pipe(map((resp) => resp.data['GetAllTypeOfIntervention']));
  }

  getAllLegalEntitiesDropdown(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllLegalEntities($filter: LegalEntityFilterInput) {
            GetAllLegalEntities(filter: $filter) {
              _id
              legal_entity_name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllLegalEntities']));
  }

  getAllTeacherFromLegalEntity(legal_entity_id, scholar_season_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTeacherFromLegalEntity($legal_entity_id: ID!, $scholar_season_id: ID) {
            GetAllTeacherFromLegalEntity(legal_entity_id: $legal_entity_id, scholar_season_id: $scholar_season_id) {
              _id
              first_name
              last_name
              civility
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          legal_entity_id,
          scholar_season_id,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTeacherFromLegalEntity']));
  }

  createManualTeacherSubject(manual_teacher_subject_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateManualTeacherSubject($manual_teacher_subject_input: TeacherSubjectManualInput) {
            CreateManualTeacherSubject(manual_teacher_subject_input: $manual_teacher_subject_input) {
              _id
            }
          }
        `,
        variables: {
          manual_teacher_subject_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateManualTeacherSubject']));
  }

  getAllTypeOfInterventionDropdownData(filter) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTypeOfIntervention($filter: TypeOfInterventionFilterInput) {
            GetAllTypeOfIntervention(filter: $filter) {
              _id
              scholar_season_id {
                _id
                scholar_season
              }
              user_id {
                _id
                first_name
                last_name
              }
              legal_entity_id {
                _id
                legal_entity_name
              }
              type_of_intervention
              hourly_rate
              type_of_contract
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .pipe(map((resp) => resp.data['GetAllTypeOfIntervention']));
  }

  getAllTypeOfInterventionDropdown() {
    return this.apollo
      .query({
        query: gql`
          query GetAllTypeOfInterventionDropdown {
            GetAllTypeOfInterventionDropdown {
              _id
              scholar_season_id {
                _id
                scholar_season
              }
              user_id {
                _id
                first_name
                last_name
              }
              legal_entity_id {
                _id
                legal_entity_name
              }
              type_of_intervention
              hourly_rate
              type_of_contract
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTypeOfInterventionDropdown']));
  }

  getAllProgramSequenceDropdown() {
    return this.apollo
      .query({
        query: gql`
          query GetAllProgramSequenceDropdown {
            GetAllProgramSequenceDropdown {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllProgramSequenceDropdown']));
  }

  getAllProgramSubjectDropdown() {
    return this.apollo
      .query({
        query: gql`
          query getAllProgramSubjectDropdown {
            getAllProgramSubjectDropdown {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['getAllProgramSubjectDropdown']));
  }

  getAllTeacherSubjectLegalEntityDropdown() {
    return this.apollo
      .query({
        query: gql`
          query getAllTeacherSubjectLegalEntityDropdown {
            getAllTeacherSubjectLegalEntityDropdown {
              _id
              legal_entity_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['getAllTeacherSubjectLegalEntityDropdown']));
  }

  getAllTeacherSequenceDropdown() {
    return this.apollo
      .query({
        query: gql`
          query GetAllTeacherSubjectProgramSequenceDropdown {
            GetAllTeacherSubjectProgramSequenceDropdown {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTeacherSubjectProgramSequenceDropdown']));
  }

  createIntervention(type_intervention_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateTypeOfIntervention($type_intervention_input: TypeOfInterventionInput!) {
            CreateTypeOfIntervention(type_intervention_input: $type_intervention_input) {
              _id
            }
          }
        `,
        variables: {
          type_intervention_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateTypeOfIntervention']));
  }

  updateIntervention(_id, type_intervention_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateTypeOfIntervention($_id: ID!, $type_intervention_input: TypeOfInterventionInput!) {
            UpdateTypeOfIntervention(_id: $_id, type_intervention_input: $type_intervention_input) {
              _id
            }
          }
        `,
        variables: {
          _id,
          type_intervention_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateTypeOfIntervention']));
  }

  deleteIntervention(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteTypeOfIntervention($_id: ID!) {
            DeleteTypeOfIntervention(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteTypeOfIntervention']));
  }

  getAllTeacherSubjects(pagination: any, filter: any, sorting: any, user_type_ids: any) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTeacherSubject(
            $pagination: PaginationInput
            $filter: TeacherSubjectFilter
            $sorting: TeacherSubjectSorting
            $user_type_ids: [ID]
          ) {
            GetAllTeacherSubject(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids) {
              # subject
              # volume_of_hour
              _id
              count_document
              contract_status
              volume_hours_assigned
              generation_source
              program_sequence_id {
                _id
                name
              }
              program_subject_id {
                _id
                name
                volume_hours_total
                program_sessions_id {
                  _id
                  name
                  volume_hours
                }
              }
              program_session {
                _id
                name
                volume_hours
                volume_hours_assigned
              }
              teacher_id {
                _id
                first_name
                last_name
                civility
              }
              program_id {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
              sequence_id {
                name
              }
              course_subject_id {
                name
              }
              type_of_intervention_id {
                _id
                type_of_intervention
                type_of_contract
                hourly_rate
                legal_entity_id {
                  _id
                  legal_entity
                  legal_entity_name
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          sorting,
          filter,
          user_type_ids,
        },
      })
      .pipe(map((resp) => resp.data['GetAllTeacherSubject']));
  }

  getAllTeacherSubjectsCheckbox(pagination: any, filter?: any, sorting?: any, user_type_ids?: any) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTeacherSubject(
            $pagination: PaginationInput
            $filter: TeacherSubjectFilter
            $sorting: TeacherSubjectSorting
            $user_type_ids: [ID]
          ) {
            GetAllTeacherSubject(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids) {
              _id
              contract_status
              volume_hours_assigned
              program_subject_id {
                _id
                name
                volume_hours_total
                program_sessions_id {
                  _id
                  name
                  volume_hours
                }
              }
              program_session {
                _id
                name
                volume_hours
                volume_hours_assigned
              }
              teacher_id {
                _id
                first_name
                last_name
                civility
              }
              program_id {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
              type_of_intervention_id {
                _id
                type_of_intervention
                type_of_contract
                hourly_rate
                legal_entity_id {
                  _id
                  legal_entity
                  legal_entity_name
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          sorting,
          filter,
          user_type_ids,
        },
      })
      .pipe(map((resp) => resp.data['GetAllTeacherSubject']));
  }

  getAllTeacherForExportCheckbox(pagination: any, filter?: any, sorting?: any, user_type_ids?: any) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTeacherSubject(
            $pagination: PaginationInput
            $filter: TeacherSubjectFilter
            $sorting: TeacherSubjectSorting
            $user_type_ids: [ID]
          ) {
            GetAllTeacherSubject(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids) {
              _id
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          sorting,
          filter,
          user_type_ids,
        },
      })
      .pipe(map((resp) => resp.data['GetAllTeacherSubject']));
  }

  getAllTeacherForContractCheckbox(pagination: any, filter?: any, sorting?: any, user_type_ids?: any) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTeacherSubject(
            $pagination: PaginationInput
            $filter: TeacherSubjectFilter
            $sorting: TeacherSubjectSorting
            $user_type_ids: [ID]
          ) {
            GetAllTeacherSubject(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids) {
              _id
              contract_status
              teacher_id {
                _id
                civility
                first_name
                last_name
              }
              program_id {
                scholar_season_id {
                  _id
                }
              }
              type_of_intervention_id {
                legal_entity_id {
                  _id
                }
                type_of_contract
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          sorting,
          filter,
          user_type_ids,
        },
      })
      .pipe(map((resp) => resp.data['GetAllTeacherSubject']));
  }

  getAllTeacherSubjectsAssignTable(pagination: any, filter?: any, sorting?: any, user_type_ids?) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTeacherSubject(
            $pagination: PaginationInput
            $filter: TeacherSubjectFilter
            $sorting: TeacherSubjectSorting
            $user_type_ids: [ID]
          ) {
            GetAllTeacherSubject(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids) {
              _id
              count_document
              number_of_group
              number_of_group_assigned
              volume_hours_assigned
              program_sequence_id {
                _id
                name
              }
              program_module_id {
                _id
                name
              }
              program_session {
                _id
                name
                duration
                class_group
                volume_hours
                volume_hours_student
                volume_hours_assigned
              }
              program_subject_id {
                _id
                name
                program_sessions_id {
                  _id
                  name
                  duration
                  class_group
                  volume_hours
                  volume_hours_student
                }
              }
              teacher_id {
                _id
                civility
                first_name
                last_name
              }
              type_of_intervention_id {
                _id
                type_of_intervention
                type_of_contract
                hourly_rate
              }
              program_id {
                _id
                program
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
                  program_sequences_id {
                    _id
                  }
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          sorting,
          filter,
          user_type_ids,
        },
      })
      .pipe(map((resp) => resp.data['GetAllTeacherSubject']));
  }
  getAllTeacherSubjectsAssignTableDropdown(filter?: any, user_type_ids?: any) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTeacherSubject($filter: TeacherSubjectFilter, $user_type_ids: [ID]) {
            GetAllTeacherSubject(filter: $filter, user_type_ids: $user_type_ids) {
              _id
              count_document
              number_of_group
              number_of_group_assigned
              program_sequence_id {
                _id
                name
              }
              program_module_id {
                _id
                name
              }
              program_subject_id {
                _id
                name
                program_sessions_id {
                  _id
                  name
                  duration
                  class_group
                  volume_hours
                  volume_hours_student
                }
              }
              teacher_id {
                _id
                civility
                first_name
                last_name
              }
              type_of_intervention_id {
                _id
                type_of_intervention
                type_of_contract
                hourly_rate
              }
              program_id {
                _id
                program
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
                  program_sequences_id {
                    _id
                  }
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          user_type_ids,
          filter,
        },
      })
      .pipe(map((resp) => resp.data['GetAllTeacherSubject']));
  }

  askRequiredDocumentsForTeachers(payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AskRequiredDocumentForTeachers(
            $type_of_contract: EnumFilterTypeOfContract
            $user_validator: ID
            $filter: TeacherFilterInput
            $sorting: TeacherSortingInput
            $selected_teacher_ids: [ID]
            $lang: String
            $user_type_sender_id: ID
          ) {
            AskRequiredDocumentForTeachers(
              type_of_contract: $type_of_contract
              user_validator: $user_validator
              filter: $filter
              sorting: $sorting
              selected_teacher_ids: $selected_teacher_ids
              lang: $lang
              user_type_sender_id: $user_type_sender_id
            )
          }
        `,
        variables: {
          type_of_contract: payload?.contract_type,
          user_validator: payload?.user_validator,
          filter: payload?.filter,
          sorting: payload?.sorting,
          selected_teacher_ids: payload?.selected_teacher_ids,
          lang: this.translate?.currentLang ? this.translate.currentLang : 'fr',
          user_type_sender_id: payload?.user_type_sender_id,
        },
      })
      .pipe(map((resp) => resp.data['AskRequiredDocumentForTeachers']));
  }

  GetDataForImportObjectives(scholar_season_id, userTypeId): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query{
            GetAllCandidateSchool(filter: { scholar_season_id: "${scholar_season_id}" }, user_type_id: "${userTypeId}") {
              _id
              short_name
              long_name
              scholar_season_id {
                _id
                scholar_season
                rncp_titles{
                  _id
                }
              }
              campuses {
                _id
                name
                levels {
                  _id
                  name
                  specialities {
                    name
                  }
                }
                scholar_season_id {
                  _id
                  scholar_season
                  rncp_titles{
                      _id
                  }
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  GetDataForSchoolSuperFilter(scholar_season_id, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($user_type_id: ID) {
            GetAllCandidateSchool(filter: { scholar_season_id: "${scholar_season_id}" }, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              scholar_season_id {
                _id
                scholar_season
                rncp_titles{
                  _id
                }
              }
              campuses {
                _id
                name
                levels {
                  _id
                  name
                  specialities {
                    name
                  }
                }
                scholar_season_id {
                  _id
                  scholar_season
                  rncp_titles{
                      _id
                  }
                }
              }
            }
          }
        `,
        variables: {
          user_type_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  getAllScholarSeasons(pagination?, sortValue?, filter?): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllScholarSeasons($pagination: PaginationInput, $sort: ScholarSeasonSortingInput) {
            GetAllScholarSeasons(pagination: $pagination, sorting: $sort, filter: { is_published: true }) {
              _id
              scholar_season
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllScholarSeasons']));
  }

  getAllLegalEntities(filter) {
    return this.apollo
      .query({
        query: gql`
          query GetAllLegalEntities($filter: LegalEntityFilterInput) {
            GetAllLegalEntities(filter: $filter) {
              _id
              legal_entity_name
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllLegalEntities']));
  }

  getDropDownTypeOfIntervention(filter) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTypeOfIntervention($filter: TypeOfInterventionFilterInput) {
            GetAllTypeOfIntervention(filter: $filter) {
              _id
              type_of_intervention
              type_of_contract
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .pipe(map((resp) => resp.data['GetAllTypeOfIntervention']));
  }

  assignTeacherToSubject(payload: { teacher_subject_id; teacher_id; number_of_group; type_of_intervention_id }) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AssignTeacherToSubject($teacher_subject_id: ID, $teacher_id: ID, $number_of_group: Int, $type_of_intervention_id: ID) {
            AssignTeacherToSubject(
              teacher_subject_id: $teacher_subject_id
              teacher_id: $teacher_id
              number_of_group: $number_of_group
              type_of_intervention_id: $type_of_intervention_id
            ) {
              teacher_id {
                _id
                civility
                first_name
                last_name
              }
              program_subject_id {
                _id
                name
              }
            }
          }
        `,
        variables: {
          teacher_subject_id: payload.teacher_subject_id,
          teacher_id: payload.teacher_id,
          number_of_group: payload.number_of_group,
          type_of_intervention_id: payload.type_of_intervention_id,
        },
      })
      .pipe(map((resp) => resp.data['AssignTeacherToSubject']));
  }

  deleteTeacherFromSubject(teacher_subject_id, teacher_id, number_of_group, type_of_intervention_id) {
    return this.apollo.mutate({
      mutation: gql`
        mutation DeleteTeacherFromSubject($teacher_subject_id: ID, $teacher_id: ID, $number_of_group: Int, $type_of_intervention_id: ID) {
          DeleteTeacherFromSubject(
            teacher_subject_id: $teacher_subject_id
            teacher_id: $teacher_id
            number_of_group: $number_of_group
            type_of_intervention_id: $type_of_intervention_id
          ) {
            _id
            program_subject_id {
              _id
              name
            }
            teacher_id {
              _id
              first_name
              last_name
            }
            program_id {
              program
            }
          }
        }
      `,
      variables: {
        teacher_subject_id,
        teacher_id,
        number_of_group,
        type_of_intervention_id,
      },
    });
  }

  getTeacherDropdown(user_type_login, filter, pagination?) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTeachers($filter: TeacherFilterInput, $pagination: PaginationInput) {
            GetAllTeachers(filter: $filter, pagination: $pagination) {
              _id
              first_name
              last_name
              civility
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          user_type_login,
          filter,
          pagination: pagination ? pagination : null,
        },
      })
      .pipe(map((resp) => resp.data['GetAllTeachers']));
  }

  getTypeInterventionDropDown(teacher_id) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTypeOfIntervention($teacher_id: ID) {
            GetAllTypeOfIntervention(filter: { teacher_id: $teacher_id }) {
              _id
              type_of_intervention
              teacher_id {
                _id
                first_name
                last_name
              }
              legal_entity_id {
                _id
                legal_entity
                legal_entity_name
              }
            }
          }
        `,
        variables: {
          teacher_id,
        },
      })
      .pipe(map((resp) => resp.data['GetAllTypeOfIntervention']));
  }

  getTypeOfInterventionAssignTeacher(filter) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTypeOfIntervention($filter: TypeOfInterventionFilterInput) {
            GetAllTypeOfIntervention(filter: $filter) {
              _id
              type_of_intervention
              type_of_contract
              teacher_id {
                _id
                first_name
                last_name
              }
              legal_entity_id {
                _id
                legal_entity
                legal_entity_name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .pipe(map((resp) => resp.data['GetAllTypeOfIntervention']));
  }

  getOneProgram(programId) {
    return this.apollo
      .query({
        query: gql`
          query GetOneProgram($programId: ID!) {
            GetOneProgram(_id: $programId) {
              program
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
              scholar_season_id {
                _id
                scholar_season
              }
              speciality_id {
                _id
                name
              }
            }
          }
        `,
        variables: {
          programId,
        },
      })
      .pipe(map((resp) => resp.data['GetOneProgram']));
  }

  downloadTemplateTeacherManagement(delimiter) {
    const lang = localStorage.getItem('currentLang');
    const API_URL = environment.apiUrl.replace('graphql', '');
    const element = document.createElement('a');
    element.href = `${API_URL}downloadImportTeacherTemplate/${delimiter}/${lang}`;
    element.target = '_blank';
    element.download = 'Template Oscar CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  ImportTeacherData(file_delimiter, file): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ImportTeacherData($file_delimiter: String, $file: Upload!, $lang: String) {
            ImportTeacherData(file_delimiter: $file_delimiter, file: $file, lang: $lang) {
              is_error
              total_imported_teachers
            }
          }
        `,
        variables: {
          file,
          file_delimiter,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['ImportTeacherData']));
  }

  getAllTeacherDocuments(pagination, filteredValues?, sortValue?, type?) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTeacherDocuments(
            $pagination: PaginationInput
            $filteredValues: TeacherDocumentsFilterInput
            $sortValue: TeacherDocumentsSortingInput
            $type: [String]
            $lang: String
          ) {
            GetAllTeacherDocuments(
              type_of_documents: $type
              pagination: $pagination
              filter: $filteredValues
              sorting: $sortValue
              lang: $lang
            ) {
              _id
              document_name
              type_of_document
              count_document
              s3_file_name
              created_at
              type_of_contract
              date_of_validation {
                date
                time
              }
              document_status
              date_of_expired {
                date
                time
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          filteredValues,
          sortValue,
          type,
          lang: this.translate?.currentLang ? this.translate.currentLang : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['GetAllTeacherDocuments']));
  }

  sendTeacherToHyperplanning(): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendTeacherToHyperplanning {
            SendTeacherToHyperplanning
          }
        `,
      })
      .pipe(map((resp) => resp.data['SendTeacherToHyperplanning']));
  }
  updateAcadDoc(_id, doc_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateAcadDoc($_id: ID!, $doc_input: AcadDocumentInput) {
            UpdateAcadDoc(_id: $_id, doc_input: $doc_input) {
              _id
            }
          }
        `,
        variables: {
          doc_input,
          _id,
        },
      })
      .pipe(map((resp) => resp.data['UpdateAcadDoc']));
  }
  deleteTeacherSubject(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteTeacherSubject($_id: ID!) {
            DeleteTeacherSubject(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteTeacherSubject']));
  }

  updateTeacherSubject(_id, teacher_subject_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateTeacherSubject($_id: ID!, $teacher_subject_input: TeacherSubjectInput) {
            UpdateTeacherSubject(_id: $_id, teacher_subject_input: $teacher_subject_input) {
              _id
            }
          }
        `,
        variables: {
          _id,
          teacher_subject_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateTeacherSubject']));
  }

  duplicateTypeOfIntervention(type_of_intervention_ids, destination_scholar_season_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DuplicateTypeOfIntervention($type_of_intervention_ids: [ID!]!, $destination_scholar_season_id: ID!) {
            DuplicateTypeOfIntervention(
              type_of_intervention_ids: $type_of_intervention_ids
              destination_scholar_season_id: $destination_scholar_season_id
            ) {
              _id
              scholar_season_id {
                scholar_season
              }
            }
          }
        `,
        variables: {
          type_of_intervention_ids,
          destination_scholar_season_id,
        },
      })
      .pipe(map((resp) => resp.data['DuplicateTypeOfIntervention']));
  }
  getOneTeacherSubject(_id) {
    return this.apollo
      .query({
        query: gql`
          query GetOneTeacherSubject($_id: ID) {
            GetOneTeacherSubject(_id: $_id) {
              _id
              generation_source
              teacher_id {
                _id
                civility
                first_name
                last_name
              }
              type_of_intervention_id {
                _id
                type_of_intervention
                type_of_contract
                hourly_rate
                legal_entity_id {
                  _id
                  legal_entity_name
                }
              }
              program_id {
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
                scholar_season_id {
                  _id
                  scholar_season
                }
                sector_id {
                  _id
                  name
                }
                speciality_id {
                  _id
                  name
                }
              }
              sequence_id {
                _id
                name
              }
              course_subject_id {
                _id
                name
                short_name
              }
              volume_hours_assigned
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['GetOneTeacherSubject']));
  }
}
