import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class StudentsTableService {
  constructor(public httpClient: HttpClient, private apollo: Apollo, private translate: TranslateService) { }

  getAllStudentInitialIntakeChannel(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllStudentInitialIntakeChannel{
            GetAllStudentInitialIntakeChannel
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudentInitialIntakeChannel']));
  }

  getAllProgramsByUserType(userTypeId): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllPrograms($userTypeId: ID) {
            GetAllPrograms(user_type_id: $userTypeId) {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,
        variables: { userTypeId },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetAllPrograms']));
  }

  getAllProgramsByUserTypes(user_type_logins): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllPrograms($user_type_logins: [ID]) {
            GetAllPrograms(user_type_logins: $user_type_logins) {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,
        variables: { user_type_logins },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetAllPrograms']));
  }

  getAllStudentPrograms(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllStudentPrograms {
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
      .pipe(map((res) => res.data['GetAllStudentPrograms']));
  }

  getAllTypeOfFormationDropdown(pagination = { limit: 50, page: 0 }, filter = null): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTypeOfInformation($filter: TypeOfInformationFilterInput, $pagination: PaginationInput) {
            GetAllTypeOfInformation(filter: $filter, pagination: $pagination) {
              _id
              sigle
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTypeOfInformation']));
  }

  getAllStudentsID(filter = null): Observable<{ _id: string }> {
    return this.apollo
      .query({
        query: gql`
          query GetAllStudents($filter: FilterStudent) {
            GetAllStudents(filter: $filter) {
              _id
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetAllStudents']));
  }
  getStudentOneTime(pagination, sort, filter, user_type_ids?): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllStudents($pagination: PaginationInput, $sort: StudentSorting, $filter: FilterStudent, $user_type_ids: [ID]) {
            GetAllStudents(pagination: $pagination, sorting: $sort, filter: $filter, user_type_ids: $user_type_ids) {
              _id
              civility
              first_name
              last_name
              candidate_id {
                _id
              }
              user_id{
                _id
                civility
                first_name
                last_name
              }
            }
          }
        `,
        variables: {
          pagination,
          sort,
          filter,
          user_type_ids,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetAllStudents']));
  }
  getMultipleEmails(pagination, sort, filter, user_type_ids?) {
    return this.apollo
      .query({
        query: gql`
          query GetAllStudentsEmail($pagination: PaginationInput, $sort: StudentSorting, $filter: FilterStudent, $user_type_ids: [ID]) {
            GetAllStudents(pagination: $pagination, sorting: $sort, filter: $filter, user_type_ids: $user_type_ids) {
              _id
              email
              candidate_id {
                _id
              }
            }
          }
        `,
        variables: {
          pagination,
          sort,
          filter,
          user_type_ids,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetAllStudents']));
  }

  getMultipleStudentEmailByID(ids: string[]) {
    return this.apollo
      .query({
        query: gql`
          query GetAllStudentsEmail($ids: [ID]) {
            GetAllStudents(student_ids: $ids) {
              email
              candidate_id {
                _id
                email
                payment_supports {
                  _id
                  relation
                  email
                }
              }
            }
          }
        `,
        variables: {
          ids,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetAllStudents']));
  }

  getAllCandidateIds(ids: string[]) {
    return this.apollo
      .query({
        query: gql`
          query GetAllStudents($ids: [ID], $filter: FilterStudent) {
            GetAllStudents(student_ids: $ids, filter: $filter) {
              _id
              candidate_ids {
                _id
                first_name
                last_name
              }
            }
          }
        `,
        variables: {
          ids,
          filter: {"offset": 100}
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetAllStudents']));
  }


  getMultipleStudentProgramAndProgramSequences(pagination, filter, sort, user_type_ids?) {
    return this.apollo
      .query({
        query: gql`
          query GetMultipleStudentProgramAndProgramSequences(
            $pagination: PaginationInput
            $filter: FilterStudent
            $sort: StudentSorting
            $user_type_ids: [ID]
          ) {
            GetAllStudents(pagination: $pagination, filter: $filter, sorting: $sort, user_type_ids: $user_type_ids) {
              _id
              candidate_id {
                _id
              }
              program {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
              program_sequence_ids {
                _id
                name
                type_of_sequence
              }
            }
          }
        `,
        variables: {
          pagination,
          filter,
          sort,
          user_type_ids,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetAllStudents']));
  }

  getMultipleStudentId(pagination, filter, sort, user_type_ids?) {
    return this.apollo
      .query({
        query: gql`
          query getMultipleStudentId($pagination: PaginationInput, $filter: FilterStudent, $sort: StudentSorting, $user_type_ids: [ID]) {
            GetAllStudents(pagination: $pagination, filter: $filter, sorting: $sort, user_type_ids: $user_type_ids) {
              _id
            }
          }
        `,
        variables: {
          pagination,
          filter,
          sort,
          user_type_ids,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetAllStudents']));
  }

  GetAllStudents(pagination, filter?, sort?, userTypeId?) {
    return this.apollo
      .query({
        query: gql`
          query GetAllStudents(
            $pagination: PaginationInput
            $filter: FilterStudent
            $sort: StudentSorting
            $lang: String
            $userTypeId: ID
          ) {
            GetAllStudents(pagination: $pagination, filter: $filter, sorting: $sort, lang: $lang, user_type_login: $userTypeId) {
              _id
              student_number
              civility
              first_name
              last_name
              email
              initial_intake_channel
              type_of_registration
              type_of_formation {
                _id
                sigle
              }
              scholar_season {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
              program_sequence_ids {
                _id
                name
                type_of_sequence
              }
              program {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
              student_status
              registration_date {
                date
                time
              }
              financial_situation
              program_sequence_ids {
                _id
                name
                type_of_sequence
              }
              current_program_sequence_id {
                _id
                name
                type_of_sequence
              }
              candidate_id {
                _id
                first_name
                last_name
                civility
                email
                modality_step_special_form_status
                payment_supports {
                  _id
                  email
                  relation
                }
              }
              group_class_id {
                _id
                name
              }
              student_class_id {
                _id
                name
              }
              count_document
              user_id {
                _id
                first_name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          filter,
          sort,
          lang: this.translate.currentLang,
          userTypeId,
        },
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  GetAllStudentsTable(pagination, filter?, sort?, user_type_ids?) {
    return this.apollo
      .query({
        query: gql`
          query GetAllStudents(
            $pagination: PaginationInput
            $filter: FilterStudent
            $sort: StudentSorting
            $lang: String
            $user_type_ids: [ID]
          ) {
            GetAllStudents(pagination: $pagination, filter: $filter, sorting: $sort, lang: $lang, user_type_ids: $user_type_ids) {
              _id
              student_number
              civility
              first_name
              last_name
              email
              initial_intake_channel
              type_of_registration
              type_of_formation {
                _id
                sigle
              }
              scholar_season {
                _id
                scholar_season
              }
              program {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
              student_status
              registration_date {
                date
                time
              }
              financial_situation
              candidate_id {
                _id
                first_name
                last_name
                civility
                school_mail
                email
                modality_step_special_form_status
                payment_supports {
                  relation
                  family_name
                  name
                  civility
                  tele_phone
                  email
                  parent_address {
                    address
                    additional_address
                    postal_code
                    city
                    region
                    department
                    country
                  }
                }
                program_sequence_ids {
                  _id
                  name
                  type_of_sequence
                }
                current_program_sequence_id {
                  _id
                  name
                  type_of_sequence
                }
              }
              student_class_id {
                _id
                name
              }
              user_id {
                _id
                civility
                first_name
                last_name
              }
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          filter,
          sort,
          user_type_ids,
          lang: this.translate.currentLang,
        },
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getAllStudentNames(pagination = { limit: 10, page: 0 }, filter = null) {
    return this.apollo
      .query({
        query: gql`
          query GetAllStudentNames($pagination: PaginationInput, $filter: FilterStudent) {
            GetAllStudents(pagination: $pagination, filter: $filter) {
              _id
              civility
              first_name
              last_name
              count_document
            }
          }
        `,
        variables: { pagination, filter },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetAllStudents']));
  }

  GetOneProgram(programId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneProgram($programId: ID!) {
            GetOneProgram(_id: $programId) {
              _id
              course_sequence_id {
                _id
                name
                program_sequences_id {
                  _id
                  name
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
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          programId,
        },
      })
      .pipe(map((res) => res.data['GetOneProgram']));
  }

  RemoveProgramSequenceFromStudent(studentId: string, sequenceId: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation RemoveStudentFromProgramSequence($studentId: ID!, $sequenceId: ID!) {
            RemoveProgramSequenceFromStudent(student_id: $studentId, program_sequence_id: $sequenceId) {
              _id
            }
          }
        `,
        variables: { studentId, sequenceId },
      })
      .pipe(map((res) => res.data['RemoveProgramSequenceFromStudent']));
  }

  GenerateDocumentBuilderPDFForStudent(candidate_id: string, _id: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GenerateDocumentBuilderPDFForStudent($_id: ID!, $candidate_id: ID!, $lang: String) {
            GenerateDocumentBuilderPDFForStudent(_id: $_id, candidate_id: $candidate_id, lang: $lang)
          }
        `,
        variables: { candidate_id, _id, lang: this.translate.currentLang },
      })
      .pipe(map((res) => res.data['GenerateDocumentBuilderPDFForStudent']));
  }

  getAllDocumentsPublished(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllDocumentBuilders {
            GetAllDocumentBuilders(filter: { status: true, hide_form: false }) {
              _id
              document_type
              template_html
              is_published
              preview_pdf_url
              is_published
              document_builder_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllDocumentBuilders']));
  }

  AssignProgramSequencesToStudent(programSequenceIds, studentId, candidateId?): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AssignProgramSequencesToStudent($studentId: ID!, $candidateId: ID, $programSequenceIds: [ID]!) {
            AssignProgramSequencesToStudent(student_id: $studentId, candidate_id: $candidateId, program_sequence_ids: $programSequenceIds) {
              _id
            }
          }
        `,
        variables: {
          studentId,
          candidateId,
          programSequenceIds,
        },
      })
      .pipe(map((resp) => resp.data['AssignProgramSequencesToStudent']));
  }

  AssignManySequencesToManyStudents(assign_program_sequence_input): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AssignManySequencesToManyStudents($assign_program_sequence_input: [AssignProgramSequenceInput]) {
            AssignManySequencesToManyStudents(assign_program_sequence_input: $assign_program_sequence_input) {
              _id
            }
          }
        `,
        variables: {
          assign_program_sequence_input,
        },
      })
      .pipe(map((resp) => resp.data['AssignManySequencesToManyStudents']));
  }

  sendStudentsToHyperplanning(): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendStudentsToHyperplanning{
            SendStudentsToHyperplanning
          }
        `,
      })
      .pipe(map((resp) => resp.data['SendStudentsToHyperplanning']));
  }

  GetAllStudentsTagTable(pagination, conditonalGraphl, filter?, sorting?, user_type_ids?) {
    return this.apollo
      .query({
        query: gql`
          query GetAllCandidates(
            $pagination: PaginationInput
            $filter: CandidateFilterInput
            $sorting: CandidateSortInput
            $user_type_ids: [ID]
            $columnFormationType: Boolean!
            $columnStudentNumber: Boolean!
            $columnName: Boolean!
            $columnCurrentProgram: Boolean!
            $columnTypeOfRegistration: Boolean!
            $columnDownPayment: Boolean!
            $columnRegistrationDate: Boolean!
            $columnVisaDocument: Boolean!
            $lang: String
          ) {
            GetAllCandidates(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids,lang:$lang) {
              _id
              registered_at @include(if: $columnRegistrationDate) {
                date
                time
              }
              type_of_formation_id @include(if: $columnFormationType) {
                _id
                type_of_formation
                sigle
              }
              email
              school_mail
              candidate_unique_number @include(if: $columnStudentNumber)
              first_name @include(if: $columnName)
              last_name @include(if: $columnName)
              civility @include(if: $columnName)
              payment @include(if: $columnDownPayment)
              registration_profile {
                is_down_payment
              }
              billing_id @include(if: $columnDownPayment) {
                deposit
                deposit_pay_amount
                deposit_status
              }
              payment_method
              intake_channel @include(if: $columnCurrentProgram) {
                _id
                program
              }
              scholar_season @include(if: $columnCurrentProgram) {
                _id
                scholar_season
              }
              candidate_admission_status
              readmission_status @include(if: $columnTypeOfRegistration)
              tag_ids {
                _id
                name
              }
              user_id {
                _id
              }
              count_document
              payment_supports {
                relation
                family_name
                name
                civility
                tele_phone
                email
                parent_address {
                  address
                  additional_address
                  postal_code
                  city
                  region
                  department
                  country
                }
              }
              visa_document_process_id @include(if: $columnVisaDocument){
                _id
                form_type
                steps{
                  _id
                  step_status
                }
                form_status
              }
              require_visa_permit
              nationality
              country
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          filter,
          sorting,
          user_type_ids,
          columnFormationType: conditonalGraphl.formationType,
          columnStudentNumber: conditonalGraphl.studentNumber,
          columnName: conditonalGraphl.name,
          columnCurrentProgram: conditonalGraphl.currentProgram,
          columnTypeOfRegistration: conditonalGraphl.typeOfRegistration,
          columnDownPayment: conditonalGraphl.downPayment,
          columnRegistrationDate: conditonalGraphl.registrationDate,
          columnVisaDocument: conditonalGraphl.visaDocument,
          lang: this.translate?.currentLang ? this.translate.currentLang : 'fr'
        },
      })
      .pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  GetAllScholarSeasonsPublished(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllScholarSeasons{
            GetAllScholarSeasons(filter: { is_published: true }) {
              _id
              scholar_season
              description
              from {
                date_utc
                time_utc
              }
              to {
                date_utc
                time_utc
              }
              is_published
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllScholarSeasons']));
  }
  GetAllSchoolSuperFilter(scholar_season_id, filter, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($user_type_ids: [ID]){
            GetAllCandidateSchool(${filter} scholar_season_id: "${scholar_season_id}", user_type_ids: $user_type_ids) {
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
              levels {
                _id
                name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          user_type_ids,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  GetAllSectorsDropdown(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSectors($filter: SectorFilterInput) {
            GetAllSectors(filter: $filter) {
              _id
              name
              programs {
                _id
                program
              }
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSectors']));
  }

  GetAllSpecializationsByScholar(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSpecializations($filter: SpecializationFilterInput) {
            GetAllSpecializations(filter: $filter) {
              _id
              name
              sigli
              intake_channel
              description
              programs {
                _id
                program
              }
              sectors {
                name
              }
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSpecializations']));
  }

  GetAllTagsSuperFilter(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTags{
            GetAllTags(is_used_by_student: true) {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTags']));
  }

  getAllTypeOfInformationDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTypeOfInformation {
            GetAllTypeOfInformation {
              _id
              type_of_information
              type_of_formation
              sigle
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTypeOfInformation']));
  }
  getMultipleEmailsTag(pagination, sort, filter, user_type_ids) {
    return this.apollo
      .query({
        query: gql`
          query GetAllCandidateEmail($pagination: PaginationInput, $sort: CandidateSortInput, $filter: CandidateFilterInput, $user_type_ids: [ID]) {
            GetAllCandidates(pagination: $pagination, sorting: $sort, filter: $filter, user_type_ids: $user_type_ids) {
              _id
              civility
              first_name
              last_name
              email
              school_mail
            }
          }
        `,
        variables: {
          pagination,
          sort,
          filter,
          user_type_ids,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetAllCandidates']));
  }
  getAllStudentsTagForRemoveTag(pagination, filter, sorting, user_type_ids) {
    return this.apollo
      .query({
        query: gql`
          query GetAllCandidates(
            $pagination: PaginationInput
            $filter: CandidateFilterInput
            $sorting: CandidateSortInput
            $user_type_ids: [ID]
          ) {
            GetAllCandidates(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids) {
              _id
              first_name
              last_name
              civility
              tag_ids {
                _id
                name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          filter,
          sorting,
          user_type_ids,
        },
      })
      .pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllStudentsForAskVisaDocument(pagination, filter, sorting, user_type_ids) {
    return this.apollo
      .query({
        query: gql`
          query GetAllCandidates(
            $pagination: PaginationInput
            $filter: CandidateFilterInput
            $sorting: CandidateSortInput
            $user_type_ids: [ID]
          ) {
            GetAllCandidates(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids) {
              _id
              first_name
              last_name
              civility
              tag_ids {
                _id
                name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          filter,
          sorting,
          user_type_ids,
        },
      })
      .pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllIdForStudentTagCheckbox(pagination, sortValue, filter, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $filter: CandidateFilterInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, filter: $filter) {
                  _id
                }
              }
        `,
        variables: {
          filter,
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllForAddTagCheckbox(pagination, sortValue, filter, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $filter: CandidateFilterInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, filter: $filter) {
                  _id
                  tag_ids {
                    _id
                    name
                  }
                }
              }
        `,
        variables: {
          filter,
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllStudentsForSendReminderCheckbox(pagination, filter, sorting, user_type_ids) {
    return this.apollo
      .query({
        query: gql`
          query GetAllCandidates(
            $pagination: PaginationInput
            $filter: CandidateFilterInput
            $sorting: CandidateSortInput
            $user_type_ids: [ID]
          ) {
            GetAllCandidates(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids) {
              _id
              first_name
              last_name
              civility
              tag_ids {
                _id
                name
              }
              visa_document_process_id {
                _id
                form_type
                steps{
                  _id
                  step_status
                }
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
          user_type_ids,
        },
      })
      .pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  sendReminderVisaDocument(payload, filter?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendReminderVisaDocument($lang: String, $filter: CandidateFilterInput, $userTypeIds: [ID]) {
            SendReminderVisaDocument(lang: $lang, filter: $filter, user_type_ids: $userTypeIds)
          }
        `,
        variables: {
          lang: this.translate?.currentLang ? this.translate.currentLang : 'fr',
          filter,
          userTypeIds: payload
        },
      })
      .pipe(map((resp) => resp.data['SendReminderVisaDocument']));
  }
}
