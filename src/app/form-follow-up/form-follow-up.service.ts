import { Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
  providedIn: 'root',
})
export class FormFollowUpService {
  constructor(private apollo: Apollo, private translate: TranslateService) {}

  getAllFormFollowUpDropdown(template_type, user_type_ids?): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllFormFollowUpDropdownTable($template_type: [String], $user_type_ids: [ID]) {
            GetAllFormFollowUpDropdown(template_type: $template_type, user_type_ids: $user_type_ids) {
              program_ids {
                _id
                program
                school_id {
                  _id
                  short_name
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          template_type,
          user_type_ids,
        },
      })
      .pipe(map((resp) => resp.data['GetAllFormFollowUpDropdown']));
  }

  getAllGeneralFormFollowUpDropdown(form_builder_id, user_type_ids?): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllGeneralFormFollowUpDropdown($form_builder_id: ID!, $user_type_ids: [ID]) {
            GetAllGeneralFormFollowUpDropdown(form_builder_id: $form_builder_id, user_type_ids: $user_type_ids) {
              program_ids {
                program
                school_id {
                  _id
                  short_name
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          form_builder_id,
          user_type_ids,
        },
      })
      .pipe(map((resp) => resp.data['GetAllGeneralFormFollowUpDropdown']));
  }

  getallSchoolDetailForm(filter, user_type_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllCandidateSchoolDetail($filter: CandidateSchoolFilterInput) {
            GetAllCandidateSchool(filter: $filter) {
              _id
              short_name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
          user_type_id,
        },
      })
      .pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  getAllFormFollowUp(filter, sorting, pagination, template_type): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllFormFollowUp($pagination: PaginationInput, $sorting: FormFollowUpSortingInput, $template_type: [String]) {
            GetAllFormFollowUp(filter : {${filter}}, sorting : $sorting, pagination : $pagination, template_type: $template_type) {
              count_document
              form_builder_id {
                _id
                form_builder_name
                template_type
              }
              program_id {
                _id
                program
              }
              is_student_in_progress_form_process
            }
          }
        `,
        variables: {
          pagination,
          sorting: sorting ? sorting : null,
          template_type: template_type && template_type.length > 0 ? template_type : null,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllFormFollowUp']));
  }

  getRncpClass(filter, pagination): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllFormFollowUp($pagination: PaginationInput) {
            GetAllFormFollowUp(filter : {${filter}},  pagination : $pagination) {
              count_document
              class_id {
                _id
                name
                parent_rncp_title {
                  _id
                  long_name
                  short_name
                  admtc_dir_responsible {
                    _id
                    first_name
                    last_name
                  }
                }
              }
              form_builder_id {
                _id
                form_builder_name
                template_type
              }
            }
          }
        `,
        variables: {
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllFormFollowUp']));
  }

  getAllStudentAdmissionProcesses(pagination, filter, sorting): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllStudentAdmissionProcesses(
            $pagination: PaginationInput
            $filter: StudentAdmissionProcessFilterInput
            $sorting: StudentAdmissionProcessSortingInput
          ) {
            GetAllStudentAdmissionProcesses(filter: $filter, pagination: $pagination, sorting: $sorting) {
              student_id {
                _id
                first_name
                last_name
                civility
                admission_process_id {
                  _id
                }
                user_id {
                  _id
                  first_name
                  last_name
                }
              }
              school_id {
                _id
                short_name
                long_name
              }
              rncp_title_id {
                _id
                short_name
                long_name
                admtc_dir_responsible {
                  _id
                  first_name
                  last_name
                  civility
                }
              }
              steps {
                _id
                step_title
                step_type
                step_status
              }
              class_id {
                _id
                name
              }
              count_document
            }
          }
        `,
        variables: {
          pagination: pagination,
          sorting: sorting ? sorting : {},
          filter: filter,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudentAdmissionProcesses']));
  }
  getAllFormProcesses(pagination, filter, sorting): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllFormProcesses($pagination: PaginationInput, $filter: FormProcessFilterInput, $sorting: FormProcessSortingInput) {
            GetAllFormProcesses(filter: $filter, pagination: $pagination, sorting: $sorting) {
              _id
              updated_at
              student_id {
                _id
                first_name
                last_name
                civility
                email
                admission_process_id {
                  _id
                }
                user_id {
                  _id
                  first_name
                  last_name
                }
              }
              school_id {
                _id
                short_name
                long_name
              }
              form_builder_id {
                _id
                steps {
                  _id
                  step_title
                }
              }
              steps {
                _id
                step_title
                step_type
                step_status
                is_only_visible_based_on_condition
                form_builder_step {
                  _id
                }
              }
              class_id {
                _id
                name
              }
              admission_status
              created_at
              count_document
              user_id {
                _id
                first_name
                last_name
                civility
              }
              candidate_id {
                _id
                civility
                last_name
                first_name
                email
                admission_document_process_id {
                  _id
                }
                payment_supports {
                  _id
                  relation
                  email
                }
              }
              program {
                program
              }
            }
          }
        `,
        variables: {
          pagination: pagination,
          sorting: sorting ? sorting : {},
          filter: filter,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllFormProcesses']));
  }

  getAllJoinedFormProcessForStudentCard(candidate_id, intake_channel, pagination, filter, sorting): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getAllJoinedFormProcessForStudentCard(
            $pagination: PaginationInput
            $filter: JoinedFormProcessFilterInput
            $sorting: JoinedFormProcessSortingInput
            $candidate_id: ID
            $intake_channel: ID
            $lang: String
          ) {
            GetAllJoinedFormProcess(filter: $filter, pagination: $pagination, sorting: $sorting, intake_channel: $intake_channel, candidate_id: $candidate_id, lang: $lang) {
              _id
              updated_at
              form_builder_id {
                _id
                form_builder_name
                template_type
              }
              steps {
                _id
                step_title
                step_type
                step_status
                form_builder_step {
                  _id
                }
              }
              created_at
              count_document
              send_date {
                date
                time
              }
              form_type
              template_name
              status_form
            }
          }
        `,
        variables: {
          intake_channel,
          candidate_id,
          pagination: pagination,
          sorting: sorting ? sorting : {},
          filter: filter,
          lang: this.translate.currentLang,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllJoinedFormProcess']));
  }

  getAllFormFollowUpProcesses(pagination, filter, sorting, user_type_ids): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllFormProcesses(
            $user_type_ids: [ID]
            $pagination: PaginationInput
            $filter: FormProcessFilterInput
            $sorting: FormProcessSortingInput
          ) {
            GetAllFormProcesses(user_type_ids: $user_type_ids, filter: $filter, pagination: $pagination, sorting: $sorting) {
              _id
              updated_at
              status
              student_id {
                _id
                first_name
                last_name
                civility
                email
                admission_process_id {
                  _id
                }
                user_id {
                  _id
                  first_name
                  last_name
                }
              }
              school_id {
                _id
                short_name
                long_name
              }
              form_builder_id {
                _id
                form_builder_name
                template_type
                steps {
                  _id
                  step_title
                }
              }
              steps {
                _id
                step_title
                step_type
                step_status
                is_only_visible_based_on_condition
                form_builder_step {
                  _id
                }
              }
              class_id {
                _id
                name
              }
              admission_status
              created_at
              count_document
              user_id {
                _id
                first_name
                last_name
                civility
              }
              candidate_id {
                _id
                first_name
                last_name
                civility
                email
                candidate_admission_status
                school_mail
                payment_supports {
                  relation
                  family_name
                  name
                  civility
                  email
                }
              }
              program {
                program
                _id
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
            }
          }
        `,
        variables: {
          pagination: pagination,
          sorting: sorting ? sorting : {},
          filter: filter,
          user_type_ids,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllFormProcesses']));
  }
  getAllIdForSendReminder(pagination, filter, sorting, user_type_ids): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllFormProcesses(
            $user_type_ids: [ID]
            $pagination: PaginationInput
            $filter: FormProcessFilterInput
            $sorting: FormProcessSortingInput
          ) {
            GetAllFormProcesses(user_type_ids: $user_type_ids, filter: $filter, pagination: $pagination, sorting: $sorting) {
              _id
            }
          }
        `,
        variables: {
          pagination: pagination,
          sorting: sorting ? sorting : {},
          filter: filter,
          user_type_ids,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllFormProcesses']));
  }

  getAllEmailFormProcess(pagination, filter, sorting, user_type_ids): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getAllEmailFormProcess($user_type_ids: [ID], $pagination: PaginationInput, $filter: FormProcessFilterInput, $sorting: FormProcessSortingInput) {
            GetAllFormProcesses(user_type_ids: $user_type_ids, filter: $filter, pagination: $pagination, sorting: $sorting) {
              _id
              student_id {
                _id
                email
                candidate_id {
                  _id
                  email
                  school_mail
                }
              }
              candidate_id {
                _id
                email
                school_mail
              }
            }
          }
        `,
        variables: {
          pagination: pagination,
          sorting: sorting ? sorting : {},
          filter: filter,
          user_type_ids
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllFormProcesses']));
  }

  getStepTypeNotificationMessage(form_builder_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllStepNotificationsAndMessages($form_builder_id: ID!) {
            GetAllStepNotificationsAndMessages(form_builder_id: $form_builder_id) {
              _id
              type
              trigger_condition
            }
          }
        `,
        variables: {
          form_builder_id: form_builder_id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStepNotificationsAndMessages']));
  }

  sendReminderFormProcess(form_process_id, lang) {
    return this.apollo
      .mutate({
        mutation: gql`
        mutation SendReminderFormProcess{
          SendReminderFormProcess(form_process_id: "${form_process_id}", lang:"${lang}")
        }
        `,
      })
      .pipe(map((resp) => resp.data['SendReminderFormProcess']));
  }

  getAllAdmissionDocumentProcesses(pagination, filter, sorting): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllAdmissionDocumentProcessesDetail(
            $filter: AdmissionDocumentProcessFilterInput
            $pagination: PaginationInput
            $sorting: AdmissionDocumentProcessSortingInput
          ) {
            GetAllAdmissionDocumentProcesses(filter: $filter, pagination: $pagination, sorting: $sorting) {
              _id
              count_document
              form_builder_id {
                _id
                form_builder_name
                steps {
                  _id
                  step_title
                }
              }
              steps {
                _id
                form_builder_step {
                  _id
                }
                is_only_visible_based_on_condition
                step_status
                step_title
                step_type
              }
              candidate_id {
                _id
                civility
                first_name
                last_name
                admission_document_process_id {
                  _id
                }
              }
              school_id {
                _id
                short_name
              }
              intake_channel_id {
                _id
                program
              }
              updated_at
              created_at
              admission_status
            }
          }
        `,
        variables: {
          filter,
          sorting,
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllAdmissionDocumentProcesses']));
  }

  sendReminderOneTimeForm(form_process_ids?: string[], form_builder_id?: string, lang?: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendReminderOneTimeForm($form_process_ids: [ID], $form_builder_id: ID, $lang: String) {
            SendReminderOneTimeForm(form_process_ids: $form_process_ids, form_builder_id: $form_builder_id, lang: $lang)
          }
        `,
        variables: {
          form_process_ids: form_process_ids ? form_process_ids : null,
          form_builder_id: form_builder_id ? form_builder_id : null,
          lang,
        },
      })
      .pipe(map((resp) => resp.data['SendReminderOneTimeForm']));
  }

  sendReminderAdmissionDocument(programID?, processID?, formBuilderID?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation Send_ADM_DOC_N4($programID: ID, $processID: ID, $formBuilderID: ID, $lang: String) {
            Send_ADM_DOC_N4(program_id: $programID, form_process_id: $processID, form_builder_id: $formBuilderID, lang: $lang)
          }
        `,
        variables: {
          programID,
          processID,
          formBuilderID,
          lang: this.translate.currentLang,
        },
      })
      .pipe(map((resp) => resp.data['Send_ADM_DOC_N4']));
  }

  generateFormProcessCSV(form_builder_id, form_process_ids, delimiter, file_name, lang, offset, sorting,user_type_id?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GenerateFormProcessCSV(
            $form_process_ids: [ID]
            $form_builder_id: ID
            $lang: String
            $delimiter: EnumDelimiter
            $file_name: String
            $offset: Int
            $sorting: FormProcessSortingInput
            $user_type_id: ID
          ) {
            GenerateFormProcessCSV(
              form_process_ids: $form_process_ids
              form_builder_id: $form_builder_id
              lang: $lang
              delimiter: $delimiter
              file_name: $file_name
              offset: $offset
              sorting: $sorting,
              user_type_id: $user_type_id
            )
          }
        `,
        variables: {
          form_process_ids: form_process_ids ? form_process_ids : null,
          form_builder_id: form_builder_id ? form_builder_id : null,
          lang,
          delimiter,
          file_name,
          sorting,
          offset,
          user_type_id: user_type_id? user_type_id : null
        },
      })
      .pipe(map((resp) => resp.data['GenerateFormProcessCSV']));
  }
}
