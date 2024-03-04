import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root',
})
export class FormFillingService {
  private formFillChangeEvent = new BehaviorSubject<boolean>(false);
  public formFillChangeEvent$ = this.formFillChangeEvent.asObservable();
  public refresh: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  triggerFormFillChangeEvent(value: boolean) {
    this.formFillChangeEvent.next(value);
  }

  triggerRefresh(value: boolean) {
    this.refresh.next(value);
  }

  constructor(private apollo: Apollo) {}

  getOneFormBuilder(templateId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneFormBuilder($templateId: ID!) {
            GetOneFormBuilder(_id: $templateId) {
              _id
              form_builder_name
              is_published
              created_by {
                _id
              }
              steps {
                _id
                step_title
                step_type
                is_validation_required
                direction
                status
                segments {
                  _id
                  segment_title
                  questions {
                    _id
                    is_field
                    field_type
                    field_position
                    is_editable
                    is_required
                    ref_id
                    answer_type
                    question_label
                    options {
                      option_name
                      is_continue_next_step
                      is_go_to_final_step
                      additional_step_id
                      is_go_to_final_message
                    }
                    count_document
                  }
                }
              }
              is_contract_signatory_in_order
              contract_signatory {
                _id
                name
              }
            }
          }
        `,
        variables: {
          templateId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneFormBuilder']));
  }

  GetOneRandomStudentAdmissionProcess(form_builder_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneRandomFormProcess($form_builder_id: ID!) {
            GetOneRandomFormProcess(form_builder_id: $form_builder_id) {
              _id
              student_id {
                _id
                first_name
                last_name
              }
              class_id {
                _id
                name
              }
              rncp_title_id {
                _id
                short_name
              }
              school_id {
                _id
                short_name
              }
              status
              steps {
                _id
                step_title
                step_type
                is_validation_required
                direction
                status
                is_only_visible_based_on_condition
                step_status
                user_who_complete_step
                segments {
                  _id
                  segment_title
                  acceptance_pdf
                  acceptance_text
                  questions {
                    _id
                    is_field
                    field_type
                    field_position
                    is_editable
                    is_required
                    ref_id
                    answer_type
                    question_label
                    final_message_question {
                      final_message_image {
                        name
                        s3_file_name
                      }
                      final_message_summary_header
                      final_message_summary_footer
                    }
                    options {
                      option_name
                      is_continue_next_step
                      is_go_to_final_step
                      additional_step_id
                      is_go_to_final_message
                    }
                    answer
                    answer_multiple
                    answer_number
                    document_validation_status
                    is_document_validated
                    answer_date {
                      date
                      time
                    }
                    text_validation {
                      condition
                      number
                      custom_error_text
                    }
                    answer_time
                    answer_duration
                    numeric_validation {
                      condition
                      number
                      min_number
                      max_number
                      custom_error_text
                    }
                    multiple_option_validation {
                      condition
                      number
                      custom_error_text
                    }
                  }
                }
              }
              is_final_validator_active
              final_validators {
                _id
                name
                entity
              }
            }
          }
        `,
        variables: {
          form_builder_id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneRandomFormProcess']));
  }

  getOneStudentAdmissionProcess(formId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneFormProcess($formId: ID!) {
            GetOneFormProcess(_id: $formId) {
              _id
              admission_status
              is_final_validator_active
              signature_date {
                date
                time
              }
              revision_user_type {
                _id
                name
              }
              final_validators {
                _id
                name_with_entity
              }
              final_validator_statuses {
                user_id {
                  _id
                }
                is_already_sign
              }
              student_id {
                _id
                civility
                first_name
                last_name
              }
              class_id {
                _id
                name
              }
              rncp_title_id {
                _id
                short_name
              }
              school_id {
                _id
                short_name
              }
              form_builder_id {
                _id
                form_builder_name
                steps {
                  _id
                  step_title
                  step_type
                }
              }
              steps {
                _id
                step_title
                step_type
                step_status
                is_validation_required
                direction
                status
                step_status
                contract_signatory_status {
                  is_already_sign
                  sign_url
                  latest_requested_url
                  recipient_id
                  client_id
                  user_type_id {
                    _id
                    name
                  }
                  user_id {
                    _id
                    first_name
                    last_name
                  }
                }
                user_recipient_signatory {
                  user_id {
                    _id
                    first_name
                    last_name
                  }
                  is_already_sign
                  latest_requested_url
                  sign_url
                  recipient_id
                  client_id
                }
                is_change_candidate_status_after_validated
                candidate_status_after_validated
                is_only_visible_based_on_condition
                form_builder_step {
                  _id
                  step_title
                  step_type
                }
                signature_date {
                  date
                  time
                }
                revision_user_type {
                  _id
                  name
                }
                validator {
                  _id
                  name
                }
                revise_request_messages {
                  created_date
                  created_time
                  created_by {
                    _id
                    civility
                    first_name
                    last_name
                  }
                  user_type_id {
                    _id
                    name
                  }
                  message
                }
                segments {
                  _id
                  segment_title
                  acceptance_pdf
                  acceptance_text
                  document_for_condition
                  is_upload_pdf_acceptance
                  is_selected_modality
                  is_multiple_financial_support
                  questions {
                    _id
                    is_field
                    field_type
                    field_position
                    is_editable
                    is_required
                    ref_id
                    answer_type
                    question_label
                    options {
                      option_name
                      is_continue_next_step
                      is_go_to_final_step
                      additional_step_id
                      is_go_to_final_message
                    }
                    answer
                    answer_multiple
                    answer_number
                    document_validation_status
                    is_document_validated
                    answer_date {
                      date
                      time
                    }
                    special_question {
                      campus_validation(is_parsed: true, form_process_id: $formId)
                      summary_header(is_parsed: true, form_process_id: $formId)
                      summary_footer(is_parsed: true, form_process_id: $formId)
                      document_acceptance_pdf
                    }
                    final_message_question(admission_process_id: $formId, lang: $lang) {
                      final_message_image {
                        name
                        s3_file_name
                      }
                      final_message_summary_header
                      final_message_summary_footer
                    }
                  }
                  additional_financial_supports {
                    questions {
                      _id
                      is_field
                      field_type
                      field_position
                      is_editable
                      is_required
                      ref_id
                      answer_type
                      question_label
                      options {
                        option_name
                        is_continue_next_step
                        additional_step_id
                        is_go_to_final_message
                      }
                      answer
                      answer_multiple
                      answer_number
                      document_validation_status
                      is_document_validated
                      answer_date {
                        date
                        time
                      }
                      special_question {
                        campus_validation(is_parsed: true, form_process_id: $formId)
                        summary_header(is_parsed: true, form_process_id: $formId)
                        summary_footer(is_parsed: true, form_process_id: $formId)
                        document_acceptance_pdf
                      }
                      final_message_question(admission_process_id: $formId, lang: $lang) {
                        final_message_image {
                          name
                          s3_file_name
                        }
                        final_message_summary_header
                        final_message_summary_footer
                      }
                    }
                  }
                }
              }
              revise_request_messages {
                created_date
                created_time
                created_by {
                  _id
                  civility
                  first_name
                  last_name
                }
                user_type_id {
                  _id
                  name
                }
                message
              }
            }
          }
        `,
        variables: {
          formId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneFormProcess']));
  }
  getOneRandomFormProcess(form_builder_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneRandomFormProcess($form_builder_id: ID!) {
            GetOneRandomFormProcess(form_builder_id: $form_builder_id) {
              _id
              student_id {
                _id
                civility
                first_name
                last_name
                tele_phone
                email
                date_of_birth
                place_of_birth
                nationality
                student_address {
                  address
                  postal_code
                  country
                  city
                  department
                  region
                }
                rncp_title {
                  short_name
                }
                current_class {
                  name
                }
                specialization {
                  name
                }
                parents {
                  relation
                  civility
                  name
                  family_name
                  tele_phone
                  email
                  parent_address {
                    address
                    postal_code
                    country
                    city
                    department
                    region
                  }
                }
              }
              class_id {
                _id
                name
              }
              rncp_title_id {
                _id
                short_name
              }
              school_id {
                _id
                short_name
              }
              status
              steps {
                _id
                step_title
                step_type
                is_validation_required
                is_only_visible_based_on_condition
                step_status
                direction(is_parsed: true)
                status
                user_who_complete_step
                segments {
                  _id
                  segment_title
                  acceptance_pdf
                  acceptance_text
                  is_rejection_allowed
                  is_on_reject_complete_the_step
                  is_download_mandatory
                  accept_button
                  reject_button
                  is_multiple_financial_support,
                  is_student_included
                  questions {
                    _id
                    is_field
                    field_type
                    field_position
                    is_editable
                    is_required
                    ref_id
                    answer_type
                    question_label
                    modality_question_type
                    final_message_question {
                      final_message_image {
                        name
                        s3_file_name
                      }
                      final_message_summary_header
                      final_message_summary_footer
                    }
                    special_question {
                      step_type
                      document_acceptance_pdf
                      summary_header
                      summary_footer
                      campus_validation(is_parsed: true, form_process_id: $form_builder_id, lang: "${localStorage.getItem('currentLang')}")
                    }
                    options {
                      option_name
                      is_continue_next_step
                      is_go_to_final_step
                      additional_step_id
                      is_go_to_final_message
                    }
                    answer
                    answer_multiple
                    answer_number
                    document_validation_status
                    is_document_validated
                    answer_date {
                      date
                      time
                    }
                    text_validation {
                      condition
                      number
                      custom_error_text
                    }
                    answer_time
                    answer_duration
                    numeric_validation {
                      condition
                      number
                      min_number
                      max_number
                      custom_error_text
                    }
                    multiple_option_validation {
                      condition
                      number
                      custom_error_text
                    }
                    parent_child_options {
                      option_text
                      position
                      questions {
                        question_name
                        sort_order
                        answer_type
                        answer
                        answer_multiple
                        questionnaire_field_key
                        is_field
                        is_answer_required
                        options {
                          option_text
                          position
                          related_block_index
                        }
                        parent_child_options {
                          option_text
                          position
                          questions {
                            question_name
                            sort_order
                            answer_type
                            answer
                            answer_multiple
                            questionnaire_field_key
                            is_field
                            is_answer_required
                            options {
                              option_text
                              position
                              related_block_index
                            }
                            parent_child_options {
                              option_text
                              position
                              questions {
                                question_name
                                sort_order
                                answer_type
                                answer
                                answer_multiple
                                questionnaire_field_key
                                is_field
                                is_answer_required
                                options {
                                  option_text
                                  position
                                  related_block_index
                                }
                                parent_child_options {
                                  option_text
                                  position
                                  questions {
                                    question_name
                                    sort_order
                                    answer_type
                                    answer
                                    answer_multiple
                                    questionnaire_field_key
                                    is_field
                                    is_answer_required
                                    options {
                                      option_text
                                      position
                                      related_block_index
                                    }
                                    parent_child_options {
                                      option_text
                                      position
                                      questions {
                                        question_name
                                        sort_order
                                        answer_type
                                        answer
                                        answer_multiple
                                        questionnaire_field_key
                                        is_field
                                        is_answer_required
                                        options {
                                          option_text
                                          position
                                          related_block_index
                                        }
                                        parent_child_options {
                                          option_text
                                          position
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              is_final_validator_active
              final_validators {
                _id
                name
                entity
              }
            }
          }
        `,
        variables: {
          form_builder_id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneRandomFormProcess']));
  }
  getOneFormProcess(formId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetOneFormProcess($formId: ID!) {
          GetOneFormProcess(_id: $formId) {
            _id
            last_name
            first_name
            civility
            contract_status
            is_final_validator_active
            is_form_closed
            admission_status
            program {
              school_id {
                _id
              }
              campus {
                _id
              }
              level {
                _id
              }
            }
            signature_date {
              date
              time
            }
            revision_user_type {
              _id
              name
            }
            final_validators {
              _id
              name_with_entity
            }
            final_validator_statuses {
              user_id {
                _id
              }
              is_already_sign
            }
            alumni_id {
              _id
            }
            student_id {
              user_id {
                _id
                entities {
                  type {
                    _id
                  }
                }
              }
              _id
              civility
              first_name
              last_name
              tele_phone
              email
              date_of_birth
              place_of_birth
              nationality
              student_address {
                address
                postal_code
                country
                city
                department
                region
              }
              rncp_title {
                short_name
              }
              current_class {
                name
              }
              specialization {
                name
              }
              parents {
                relation
                civility
                name
                family_name
                tele_phone
                email
                parent_address {
                  address
                  postal_code
                  country
                  city
                  department
                  region
                }
              }
            }
            candidate_id {
              _id
              user_id{
                _id
              }
            }
            user_id {
              _id
              civility
              first_name
              last_name
              office_phone
              portable_phone
              email
              user_addresses {
                address
                postal_code
                country
                city
                department
                region
              }
              entities {
                type {
                  _id
                }
              }
            }
            class_id {
              _id
              name
            }
            rncp_title_id {
              _id
              short_name
            }
            school_id {
              _id
              short_name
            }
            form_builder_id {
              _id
              template_type
            }
            steps {
              _id
              step_title
              step_type
              step_status
              user_validator {
                _id
              }
              is_validation_required
              is_only_visible_based_on_condition
              direction(is_parsed: true)
              status
              step_status
              form_builder_step {
                _id
              }
              contract_signatory_status {
                is_already_sign
                sign_url
                latest_requested_url
                recipient_id
                client_id
                user_type_id {
                  _id
                  name
                }
                user_id {
                  _id
                  first_name
                  last_name
                }
              }
              is_contract_signatory_in_order
              contract_signatory {
                _id
                name
                description
              }
              contract_template_pdf
              user_recipient_signatory {
                teacher_id {
                  _id
                }
                user_id {
                  _id
                  first_name
                  last_name
                }
                is_already_sign
                latest_requested_url
                sign_url
                recipient_id
                client_id
              }
              is_include_in_summary
              is_final_step
              user_who_complete_step {
                _id
                name
              }
              signature_date {
                date
                time
              }
              revision_user_type {
                _id
                name
              }
              validator {
                _id
                name
              }
              revise_request_messages {
                created_date
                created_time
                created_by {
                  _id
                  civility
                  first_name
                  last_name
                }
                user_type_id {
                  _id
                  name
                }
                message
              }
              segments {
                _id
                segment_title
                acceptance_pdf
                acceptance_text
                document_for_condition
                is_upload_pdf_acceptance
                is_rejection_allowed
                is_download_mandatory
                accept_button
                reject_button
                is_multiple_financial_support,
                is_student_included
                questions {
                  _id
                  is_field
                  field_type
                  field_position
                  is_editable
                  is_router_on
                  is_required
                  ref_id
                  answer_type
                  question_label
                  modality_question_type
                  final_message_question(is_parsed: true) {
                    final_message_image {
                      s3_file_name
                      name
                    }
                    final_message_summary_header
                    final_message_summary_footer
                  }
                  special_question {
                    step_type
                    document_acceptance_pdf
                    summary_header(is_parsed: true, form_process_id: "${formId}", lang: "${localStorage.getItem('currentLang')}")
                    summary_footer(is_parsed: true, form_process_id: "${formId}", lang: "${localStorage.getItem('currentLang')}")
                    campus_validation(is_parsed: true, form_process_id: "${formId}", lang: "${localStorage.getItem('currentLang')}")
                  }
                  multiple_option_validation {
                    condition
                    number
                    custom_error_text
                  }
                  options {
                    option_name
                    is_continue_next_step
                    is_go_to_final_step
                    additional_step_id
                    is_go_to_final_message
                    additional_contract_step_id
                  }
                  answer
                  answer_multiple
                  answer_number
                  answer_time
                  answer_duration
                  phone_number_indicative
                  document_validation_status
                  is_document_validated
                  answer_date {
                    date
                    time
                  }
                  numeric_validation {
                    condition
                    number
                    min_number
                    max_number
                    custom_error_text
                  }
                  multiple_option_validation {
                    condition
                    number
                    custom_error_text
                  }
                  text_validation {
                    condition
                    number
                    custom_error_text
                  }
                  parent_child_options {
                    option_text
                    position
                    questions {
                      question_name
                      sort_order
                      answer_type
                      answer_number
                      answer_date {
                        date
                        time
                      }
                      answer
                      answer_multiple
                      questionnaire_field_key
                      is_field
                      is_answer_required
                      options {
                        option_text
                        position
                        related_block_index
                      }
                      parent_child_options {
                        option_text
                        position
                        questions {
                          question_name
                          sort_order
                          answer_type
                          answer
                          answer_number
                          answer_date {
                            date
                            time
                          }
                          answer_multiple
                          questionnaire_field_key
                          is_field
                          is_answer_required
                          options {
                            option_text
                            position
                            related_block_index
                          }
                          parent_child_options {
                            option_text
                            position
                            questions {
                              question_name
                              sort_order
                              answer_type
                              answer
                              answer_number
                              answer_date {
                                date
                                time
                              }
                              answer_multiple
                              questionnaire_field_key
                              is_field
                              is_answer_required
                              options {
                                option_text
                                position
                                related_block_index
                              }
                              parent_child_options {
                                option_text
                                position
                                questions {
                                  question_name
                                  sort_order
                                  answer_type
                                  answer
                                  answer_number
                                  answer_date {
                                    date
                                    time
                                  }
                                  answer_multiple
                                  questionnaire_field_key
                                  is_field
                                  is_answer_required
                                  options {
                                    option_text
                                    position
                                    related_block_index
                                  }
                                  parent_child_options {
                                    option_text
                                    position
                                    questions {
                                      question_name
                                      sort_order
                                      answer_type
                                      answer
                                      answer_number
                                      answer_date {
                                        date
                                        time
                                      }
                                      answer_multiple
                                      questionnaire_field_key
                                      is_field
                                      is_answer_required
                                      options {
                                        option_text
                                        position
                                        related_block_index
                                      }
                                      parent_child_options {
                                        option_text
                                        position
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
                additional_financial_supports {
                  questions {
                    _id
                    is_field
                    field_type
                    field_position
                    is_editable
                    is_router_on
                    is_required
                    ref_id
                    answer_type
                    question_label
                    modality_question_type
                    final_message_question(is_parsed: true) {
                      final_message_image {
                        s3_file_name
                        name
                      }
                      final_message_summary_header
                      final_message_summary_footer
                    }
                    special_question {
                      step_type
                      document_acceptance_pdf
                      summary_header(
                        is_parsed: true
                        form_process_id: "630c52f209400507e523bd3d"
                        lang: "en"
                      )
                      summary_footer(
                        is_parsed: true
                        form_process_id: "630c52f209400507e523bd3d"
                        lang: "en"
                      )
                      campus_validation(
                        is_parsed: true
                        form_process_id: "630c52f209400507e523bd3d"
                        lang: "en"
                      )
                    }
                    multiple_option_validation {
                      condition
                      number
                      custom_error_text
                    }
                    options {
                      option_name
                      is_continue_next_step
                      is_go_to_final_step
                      additional_step_id
                      is_go_to_final_message
                    }
                    answer
                    answer_multiple
                    answer_number
                    answer_time
                    answer_duration
                    phone_number_indicative
                    document_validation_status
                    is_document_validated
                    answer_date {
                      date
                      time
                    }
                    numeric_validation {
                      condition
                      number
                      min_number
                      max_number
                      custom_error_text
                    }
                    multiple_option_validation {
                      condition
                      number
                      custom_error_text
                    }
                    text_validation {
                      condition
                      number
                      custom_error_text
                    }
                    parent_child_options {
                      option_text
                      position
                      questions {
                        question_name
                        sort_order
                        answer_type
                        answer_number
                        answer_date {
                          date
                          time
                        }
                        answer
                        answer_multiple
                        questionnaire_field_key
                        is_field
                        is_answer_required
                        options {
                          option_text
                          position
                          related_block_index
                        }
                        parent_child_options {
                          option_text
                          position
                          questions {
                            question_name
                            sort_order
                            answer_type
                            answer
                            answer_number
                            answer_date {
                              date
                              time
                            }
                            answer_multiple
                            questionnaire_field_key
                            is_field
                            is_answer_required
                            options {
                              option_text
                              position
                              related_block_index
                            }
                            parent_child_options {
                              option_text
                              position
                              questions {
                                question_name
                                sort_order
                                answer_type
                                answer
                                answer_number
                                answer_date {
                                  date
                                  time
                                }
                                answer_multiple
                                questionnaire_field_key
                                is_field
                                is_answer_required
                                options {
                                  option_text
                                  position
                                  related_block_index
                                }
                                parent_child_options {
                                  option_text
                                  position
                                  questions {
                                    question_name
                                    sort_order
                                    answer_type
                                    answer
                                    answer_number
                                    answer_date {
                                      date
                                      time
                                    }
                                    answer_multiple
                                    questionnaire_field_key
                                    is_field
                                    is_answer_required
                                    options {
                                      option_text
                                      position
                                      related_block_index
                                    }
                                    parent_child_options {
                                      option_text
                                      position
                                      questions {
                                        question_name
                                        sort_order
                                        answer_type
                                        answer
                                        answer_number
                                        answer_date {
                                          date
                                          time
                                        }
                                        answer_multiple
                                        questionnaire_field_key
                                        is_field
                                        is_answer_required
                                        options {
                                          option_text
                                          position
                                          related_block_index
                                        }
                                        parent_child_options {
                                          option_text
                                          position
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            revise_request_messages {
              created_date
              created_time
              created_by {
                _id
                civility
                first_name
                last_name
              }
              user_type_id {
                _id
                name
              }
              message
            }
            is_form_closed
          }
        }

        `,
        variables: {
          formId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneFormProcess']));
  }

  getOneAdmissionDocumentProcess(formId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneAdmissionDocumentProcess($formId: ID!, $lang: String) {
            GetOneAdmissionDocumentProcess(_id: $formId) {
              _id
              admission_status
              is_final_validator_active
              candidate_id {
                _id
              }
              signature_date {
                date
                time
              }
              revision_user_type {
                _id
                name
              }
              final_validators {
                _id
                name_with_entity
              }
              final_validator_statuses {
                user_id {
                  _id
                }
                is_already_sign
              }
              student_id {
                _id
                civility
                first_name
                last_name
              }
              class_id {
                _id
                name
              }
              rncp_title_id {
                _id
                short_name
              }
              school_id {
                _id
                short_name
              }
              form_builder_id {
                _id
                form_builder_name
                steps {
                  _id
                  step_title
                  step_type
                }
              }
              steps {
                _id
                step_title
                step_type
                step_status
                is_validation_required
                is_step_included_in_summary
                direction(is_parsed: true, admission_document_process_id: $formId, lang: $lang)
                status
                step_status
                is_change_candidate_status_after_validated
                candidate_status_after_validated
                is_only_visible_based_on_condition
                form_builder_step {
                  _id
                  step_title
                  step_type
                }
                signature_date {
                  date
                  time
                }
                revision_user_type {
                  _id
                  name
                }
                validator {
                  _id
                  name
                }
                user_validator {
                  _id
                  civility
                  first_name
                  last_name
                  email
                }
                revise_request_messages {
                  created_date
                  created_time
                  created_by {
                    _id
                    civility
                    first_name
                    last_name
                  }
                  user_type_id {
                    _id
                    name
                  }
                  message
                }
                segments {
                  _id
                  segment_title
                  acceptance_pdf
                  acceptance_text
                  document_for_condition
                  is_upload_pdf_acceptance
                  is_selected_modality
                  is_multiple_financial_support
                  questions {
                    _id
                    is_field
                    field_type
                    field_position
                    is_editable
                    is_required
                    ref_id
                    answer_type
                    question_label
                    options {
                      option_name
                      is_continue_next_step
                      additional_step_id
                      is_go_to_final_message
                    }
                    answer
                    answer_multiple
                    answer_number
                    document_validation_status
                    is_document_validated
                    answer_date {
                      date
                      time
                    }
                    special_question {
                      campus_validation(is_parsed: true, form_process_id: $formId)
                      summary_header(is_parsed: true, form_process_id: $formId)
                      summary_footer(is_parsed: true, form_process_id: $formId)
                      document_acceptance_pdf
                    }
                    final_message_question(admission_document_process_id: $formId, lang: $lang) {
                      final_message_image {
                        name
                        s3_file_name
                      }
                      final_message_summary_header
                      final_message_summary_footer
                    }
                  }
                  additional_financial_supports {
                    questions {
                      _id
                      is_field
                      field_type
                      field_position
                      is_editable
                      is_required
                      ref_id
                      answer_type
                      question_label
                      options {
                        option_name
                        is_continue_next_step
                        additional_step_id
                        is_go_to_final_message
                      }
                      answer
                      answer_multiple
                      answer_number
                      document_validation_status
                      is_document_validated
                      answer_date {
                        date
                        time
                      }
                      special_question {
                        campus_validation(is_parsed: true, form_process_id: $formId)
                        summary_header(is_parsed: true, form_process_id: $formId)
                        summary_footer(is_parsed: true, form_process_id: $formId)
                        document_acceptance_pdf
                      }
                      final_message_question(admission_process_id: $formId, lang: $lang) {
                        final_message_image {
                          name
                          s3_file_name
                        }
                        final_message_summary_header
                        final_message_summary_footer
                      }
                    }
                  }
                }
              }
              revise_request_messages {
                created_date
                created_time
                created_by {
                  _id
                  civility
                  first_name
                  last_name
                }
                user_type_id {
                  _id
                  name
                }
                message
              }
            }
          }
        `,
        variables: {
          formId,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneAdmissionDocumentProcess']));
  }

  getOneUser(_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneUser($_id: ID) {
            GetOneUser(_id: $_id) {
              _id
              entities {
                entity_name
                type {
                  _id
                  name
                }
                programs {
                  school {
                    _id
                  }
                  campus {
                    _id
                  }
                  level {
                    _id
                  }
                }
              }
              first_name
              last_name
              civility
              student_id {
                _id
                admission_process_id {
                  _id
                  steps {
                    _id
                    step_type
                    step_status
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
      .pipe(map((resp) => resp.data['GetOneUser']));
  }

  getOneCandidateVisa(_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneCandidate($_id: ID!) {
            GetOneCandidate(_id: $_id) {
              _id
              user_id {
                entities {
                  entity_name
                  type {
                    _id
                    name
                  }
                }
              }
              first_name
              last_name
              civility
              student_id {
                _id
                admission_process_id {
                  _id
                  steps {
                    _id
                    step_type
                    step_status
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
      .pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  createUpdateStudentAdmissionProcessStepAndQuestion(student_admission_process_step_input: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation saveStudentAdmissionStep($student_admission_process_step_input: CreateUpdateStudentAdmissionProcessStepInput) {
            CreateUpdateStudentAdmissionProcessStepAndQuestion(
              student_admission_process_step_input: $student_admission_process_step_input
            ) {
              _id
            }
          }
        `,
        variables: {
          student_admission_process_step_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateUpdateStudentAdmissionProcessStepAndQuestion']));
  }
  createUpdateFormProcessStepAndQuestion(form_process_step_input: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation saveStudentAdmissionStep($form_process_step_input: CreateUpdateFormProcessStepInput) {
            CreateUpdateFormProcessStepAndQuestion(form_process_step_input: $form_process_step_input) {
              _id
            }
          }
        `,
        variables: {
          form_process_step_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateUpdateFormProcessStepAndQuestion']));
  }

  createUpdateAdmissionDocumentProcessStepAndQuestion(admission_document_process_step_input: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation saveAdmissionDocumentStep($admission_document_process_step_input: CreateUpdateAdmissionDocumentProcessStepInput) {
            CreateUpdateAdmissionDocumentProcessStepAndQuestion(
              admission_document_process_step_input: $admission_document_process_step_input
            ) {
              _id
            }
          }
        `,
        variables: {
          admission_document_process_step_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateUpdateAdmissionDocumentProcessStepAndQuestion']));
  }

  acceptStudentAdmissionProcessStep(loggin_user_id, student_admission_process_id, _id?: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AcceptStudentAdmissionProcessStep($_id: ID, $student_admission_process_id: ID!) {
            AcceptStudentAdmissionProcessStep(
              _id: $_id
              student_admission_process_id: $student_admission_process_id
              lang: $lang
              loggin_user_id: $loggin_user_id
            ) {
              _id
            }
          }
        `,
        variables: {
          _id: _id ? _id : null,
          student_admission_process_id,
          loggin_user_id,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['AcceptStudentAdmissionProcessStep']));
  }

  sendPreviewFormBuilderStepNotification(loggin_user_id, step_id, form_process_id, is_preview) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendPreviewFormBuilderStepNotification($step_id: ID, $form_process_id: ID, $is_preview: Boolean, $loggin_user_id: ID) {
            SendPreviewFormBuilderStepNotification(
              step_id: $step_id
              form_process_id: $form_process_id
              is_preview: $is_preview
              loggin_user_id: $loggin_user_id
            ) {
              _id
            }
          }
        `,
        variables: {
          step_id,
          form_process_id,
          is_preview,
          loggin_user_id,
        },
      })
      .pipe(map((resp) => resp.data['SendPreviewFormBuilderStepNotification']));
  }

  GetOneCandidate(_id) {
    return this.apollo
      .query({
        query: gql`
          query GetOneCandidate($_id: ID!) {
            GetOneCandidate(_id: $_id) {
              _id
              user_id {
                _id
              }
              school {
                school_logo
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          _id,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneCandidate'];
        }),
      );
  }

  acceptFormProcessStep(form_process_id, _id?: string, acceptance?: 'accepted' | 'rejected' | null) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AcceptFormProcessStep($_id: ID, $form_process_id: ID!, $acceptance: EnumConditionAcceptanceStatus, $lang: String) {
            AcceptFormProcessStep(_id: $_id, form_process_id: $form_process_id, condition_acceptance_status: $acceptance, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id: _id ? _id : null,
          form_process_id,
          acceptance,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['AcceptFormProcessStep']));
  }

  acceptFormProcessStepFinance(form_process_id, _id?: string, lang?: string, acceptance?: 'accepted' | 'rejected' | null) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AcceptFormProcessStep($_id: ID, $form_process_id: ID!, $acceptance: EnumConditionAcceptanceStatus) {
            AcceptFormProcessStep(_id: $_id, form_process_id: $form_process_id, condition_acceptance_status: $acceptance) {
              _id
            }
          }
        `,
        variables: {
          _id: _id ? _id : null,
          form_process_id,
          lang,
          acceptance,
        },
      })
      .pipe(map((resp) => resp.data['AcceptFormProcessStep']));
  }

  acceptAdmissionDocumentProcessStep(loggin_user_id, admission_document_process_id, _id?: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AcceptAdmissionDocumentProcessStep($_id: ID, $admission_document_process_id: ID!, $lang: String, $loggin_user_id: ID) {
            AcceptAdmissionDocumentProcessStep(
              _id: $_id
              admission_document_process_id: $admission_document_process_id
              lang: $lang
              loggin_user_id: $loggin_user_id
            ) {
              _id
            }
          }
        `,
        variables: {
          _id: _id ? _id : null,
          admission_document_process_id,
          loggin_user_id,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['AcceptAdmissionDocumentProcessStep']));
  }

  askRevisionStudentAdmissionProcessStep(_id: string, revise_request_messages: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AskRevisionStudentAdmissionProcessStep(
            $_id: ID
            $revise_request_messages: [StudentAdmissionProcessStepReviseRequestMessageInput]
          ) {
            AskRevisionStudentAdmissionProcessStep(_id: $_id, revise_request_messages: $revise_request_messages) {
              _id
            }
          }
        `,
        variables: {
          _id,
          revise_request_messages,
        },
      })
      .pipe(map((resp) => resp.data['AskRevisionStudentAdmissionProcessStep']));
  }

  askRevisionFormProcessStep(_id: string, revise_request_messages: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AskRevisionFormProcessStep(
            $_id: ID
            $revise_request_messages: [FormProcessStepReviseRequestMessageInput]
            $lang: String
          ) {
            AskRevisionFormProcessStep(_id: $_id, revise_request_messages: $revise_request_messages, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id,
          revise_request_messages,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['AskRevisionFormProcessStep']));
  }

  askRevisionFormProcess(_id: string, revise_request_messages: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AskRevisionFormProcess($_id: ID, $revise_request_messages: [FormProcessReviseRequestMessageInput]) {
            AskRevisionFormProcess(_id: $_id, revise_request_messages: $revise_request_messages) {
              _id
            }
          }
        `,
        variables: {
          _id,
          revise_request_messages,
        },
      })
      .pipe(map((resp) => resp.data['AskRevisionFormProcess']));
  }

  replyRevisionMessageFormProcessStep(_id: string, revise_request_message: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ReplyRevisionMessageFormProcessStep(
            $_id: ID
            $revise_request_message: FormProcessStepReviseRequestMessageInput
            $lang: String
          ) {
            ReplyRevisionMessageFormProcessStep(_id: $_id, revise_request_message: $revise_request_message, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id,
          revise_request_message,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['ReplyRevisionMessageFormProcessStep']));
  }

  replyRevisionMessageFormProcess(_id: string, revise_request_message: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ReplyRevisionMessageFormProcess($_id: ID, $revise_request_message: FormProcessReviseRequestMessageInput) {
            ReplyRevisionMessageFormProcess(_id: $_id, revise_request_message: $revise_request_message) {
              _id
            }
          }
        `,
        variables: {
          _id,
          revise_request_message,
        },
      })
      .pipe(map((resp) => resp.data['ReplyRevisionMessageFormProcess']));
  }

  askRevisionStudentAdmissionProcess(_id: string, revise_request_messages: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AskRevisionStudentAdmissionProcess(
            $_id: ID
            $revise_request_messages: [StudentAdmissionProcessReviseRequestMessageInput]
          ) {
            AskRevisionStudentAdmissionProcess(_id: $_id, revise_request_messages: $revise_request_messages) {
              _id
            }
          }
        `,
        variables: {
          _id,
          revise_request_messages,
        },
      })
      .pipe(map((resp) => resp.data['AskRevisionStudentAdmissionProcess']));
  }

  askRevisionAdmissionDocumentProcessStep(_id: string, revise_request_messages: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AskRevisionAdmissionDocumentProcessStep(
            $_id: ID
            $revise_request_messages: [AdmissionDocumentProcessStepReviseRequestMessageInput]
            $lang: String
          ) {
            AskRevisionAdmissionDocumentProcessStep(_id: $_id, revise_request_messages: $revise_request_messages, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id,
          revise_request_messages,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['AskRevisionAdmissionDocumentProcessStep']));
  }

  askRevisionAdmissionDocumentProcess(_id: string, revise_request_messages: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AskRevisionAdmissionDocumentProcess(
            $_id: ID
            $revise_request_messages: [AdmissionDocumentProcessReviseRequestMessageInput]
          ) {
            AskRevisionAdmissionDocumentProcess(_id: $_id, revise_request_messages: $revise_request_messages) {
              _id
            }
          }
        `,
        variables: {
          _id,
          revise_request_messages,
        },
      })
      .pipe(map((resp) => resp.data['AskRevisionAdmissionDocumentProcess']));
  }

  replyRevisionMessageStudentAdmissionProcessStep(_id: string, revise_request_message: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ReplyRevisionMessageStudentAdmissionProcessStep(
            $_id: ID
            $revise_request_message: StudentAdmissionProcessStepReviseRequestMessageInput
          ) {
            ReplyRevisionMessageStudentAdmissionProcessStep(_id: $_id, revise_request_message: $revise_request_message) {
              _id
            }
          }
        `,
        variables: {
          _id,
          revise_request_message,
        },
      })
      .pipe(map((resp) => resp.data['ReplyRevisionMessageStudentAdmissionProcessStep']));
  }

  replyRevisionMessageStudentAdmissionProcess(_id: string, revise_request_message: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ReplyRevisionMessageStudentAdmissionProcess(
            $_id: ID
            $revise_request_message: StudentAdmissionProcessReviseRequestMessageInput
          ) {
            ReplyRevisionMessageStudentAdmissionProcess(_id: $_id, revise_request_message: $revise_request_message) {
              _id
            }
          }
        `,
        variables: {
          _id,
          revise_request_message,
        },
      })
      .pipe(map((resp) => resp.data['ReplyRevisionMessageStudentAdmissionProcess']));
  }

  replyRevisionMessageAdmissionDocumentProcessStep(_id: string, revise_request_message: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ReplyRevisionMessageAdmissionDocumentProcessStep(
            $_id: ID
            $revise_request_message: AdmissionDocumentProcessStepReviseRequestMessageInput
            $lang: String
          ) {
            ReplyRevisionMessageAdmissionDocumentProcessStep(_id: $_id, revise_request_message: $revise_request_message, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id,
          revise_request_message,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['ReplyRevisionMessageAdmissionDocumentProcessStep']));
  }

  replyRevisionMessageAdmissionDocumentProcess(_id: string, revise_request_message: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ReplyRevisionMessageAdmissionDocumentProcess(
            $_id: ID
            $revise_request_message: AdmissionDocumentProcessReviseRequestMessageInput
          ) {
            ReplyRevisionMessageAdmissionDocumentProcess(_id: $_id, revise_request_message: $revise_request_message) {
              _id
            }
          }
        `,
        variables: {
          _id,
          revise_request_message,
        },
      })
      .pipe(map((resp) => resp.data['ReplyRevisionMessageAdmissionDocumentProcess']));
  }

  getOneStudentAdmissionProcessStep(_id: string) {
    return this.apollo
      .query({
        query: gql`
          query GetOneStudentAdmissionProcessStep($_id: ID!) {
            GetOneStudentAdmissionProcessStep(_id: $_id) {
              _id
              step_title
              step_type
              is_validation_required
              direction
              status
              validator {
                _id
                name
              }
              revision_user_type {
                _id
                name
              }
              revise_request_messages {
                created_date
                created_time
                created_by {
                  _id
                  civility
                  first_name
                  last_name
                }
                user_type_id {
                  _id
                  name
                }
                message
              }
              segments {
                _id
                segment_title
                acceptance_pdf
                acceptance_text
                document_for_condition
                is_upload_pdf_acceptance
                questions {
                  _id
                  is_field
                  field_type
                  field_position
                  is_editable
                  is_required
                  ref_id
                  answer_type
                  question_label
                  options
                  answer
                  answer_multiple
                  answer_number
                  answer_date {
                    date
                    time
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
      .pipe(map((resp) => resp.data['GetOneStudentAdmissionProcessStep']));
  }

  acceptStudentAdmissionSummary(student_admission_process_id) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AcceptFormProcessStep($student_admission_process_id: ID!) {
            AcceptFormProcessStep(student_admission_process_id: $student_admission_process_id) {
              _id
            }
          }
        `,
        variables: {
          student_admission_process_id,
        },
      })
      .pipe(map((resp) => resp.data['AcceptFormProcessStep']));
  }

  AcceptFormProcessStep(form_process_id) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AcceptFormProcessStep($form_process_id: ID!) {
            AcceptFormProcessStep(form_process_id: $form_process_id) {
              _id
            }
          }
        `,
        variables: {
          form_process_id,
        },
      })
      .pipe(map((resp) => resp.data['AcceptFormProcessStep']));
  }

  validateStudentAdmissionProcess(_id: string, user_type_id?: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ValidateStudentAdmissionProcess($_id: ID!, $user_type_id: ID) {
            ValidateStudentAdmissionProcess(_id: $_id, user_type_id: $user_type_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          user_type_id: user_type_id ? user_type_id : null,
        },
      })
      .pipe(map((resp) => resp.data['ValidateStudentAdmissionProcess']));
  }

  validateFormProcess(_id: string, user_type_id?: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ValidateFormProcess($_id: ID!, $user_type_id: ID) {
            ValidateFormProcess(_id: $_id, user_type_id: $user_type_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          user_type_id: user_type_id ? user_type_id : null,
        },
      })
      .pipe(map((resp) => resp.data['ValidateFormProcess']));
  }

  getOneTaskForFormFilling(taskId) {
    return this.apollo
      .query({
        query: gql`
          query GetOneTaskForFormFilling($_id: ID!) {
            GetOneTask(_id: $_id) {
              _id
              task_status
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
              form_process_step_id {
                _id
                user_who_complete_step {
                  _id
                  name
                }
              }
              form_process_id {
                _id
                form_builder_id {
                  template_type
                }
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

  generatePDFStep(candidate_id: any, step_id: any, lang: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GeneratePDFStep($candidate_id: ID, $step_id: ID, $lang: String) {
            GeneratePDFStep(candidate_id: $candidate_id, step_id: $step_id, lang: $lang)
          }
        `,
        variables: {
          candidate_id,
          step_id,
          lang,
        },
      })
      .pipe(map((resp) => resp.data['GeneratePDFStep']));
  }

  generateAdmissionProcessSumarry(_id: any, for_summary_tab: boolean = false) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GenerateAdmissionProcessSummaryPDF($_id: ID!, $for_summary_tab: Boolean) {
            GenerateAdmissionProcessSummaryPDF(_id: $_id, for_summary_tab: $for_summary_tab)
          }
        `,
        variables: {
          _id,
          for_summary_tab,
        },
      })
      .pipe(map((resp) => resp.data['GenerateAdmissionProcessSummaryPDF']));
  }
  generateFormBuilderContractTemplatePDF(_id, is_preview, lang, form_process_step_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GenerateFormBuilderContractTemplatePDF($_id: ID, $is_preview: Boolean, $lang: String, $form_process_step_id: ID) {
            GenerateFormBuilderContractTemplatePDF(
              _id: $_id
              is_preview: $is_preview
              lang: $lang
              form_process_step_id: $form_process_step_id
            )
          }
        `,
        variables: {
          _id,
          is_preview,
          lang,
          form_process_step_id,
        },
      })
      .pipe(map((resp) => resp.data['GenerateFormBuilderContractTemplatePDF']));
  }
  getOneFormProcessStep(_id) {
    return this.apollo
      .query({
        query: gql`
          query GetOneFormProcessStep($_id: ID) {
            GetOneFormProcessStep(_id: $_id) {
              _id
              step_title
              contract_template_pdf
              form_builder_step {
                _id
              }
            }
          }
        `,
        variables: {
          _id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneFormProcessStep'];
        }),
      );
  }
  acceptFormProcessStepSigningProcess(form_process_id, _id, urlRedirect) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AcceptFormProcessStep($_id: ID, $form_process_id: ID!, $urlRedirect: String) {
            AcceptFormProcessStep(_id: $_id, form_process_id: $form_process_id, urlRedirect: $urlRedirect) {
              _id
            }
          }
        `,
        variables: {
          form_process_id,
          _id,
          urlRedirect,
        },
      })
      .pipe(map((resp) => resp.data['AcceptFormProcessStep']));
  }
  getContractProcessURL(_id, form_process_id, urlRedirect): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GetContractProcessURL($_id: ID, $form_process_id: ID, $urlRedirect: String) {
            GetContractProcessURL(_id: $_id, form_process_id: $form_process_id, urlRedirect: $urlRedirect)
          }
        `,
        variables: {
          _id,
          form_process_id,
          urlRedirect,
        },
      })
      .pipe(map((resp) => resp.data['GetContractProcessURL']));
  }

  createUpdateAlumniSurveyProcessStepAndQuestion(alumni_survey_process_step_input: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateUpdateAlumniSurveyProcessStepAndQuestion(
            $alumni_survey_process_step_input: CreateUpdateAlumniSurveyProcessStepInput
          ) {
            CreateUpdateAlumniSurveyProcessStepAndQuestion(alumni_survey_process_step_input: $alumni_survey_process_step_input) {
              _id
            }
          }
        `,
        variables: {
          alumni_survey_process_step_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateUpdateAlumniSurveyProcessStepAndQuestion']));
  }

  UpdateAlumniSurveyProcess(alumniSurveyProcessId, surveyStatus): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateAlumniSurveyProcess($alumniSurveyProcessId: ID!) {
            UpdateAlumniSurveyProcess(_id: $alumniSurveyProcessId, alumni_survey_process_input: {survey_status: ${surveyStatus}}) {
              _id
            }
          }
        `,
        variables: {
          alumniSurveyProcessId,
        },
      })
      .pipe(map((resp) => resp.data['UpdateCandidateTransferCheckPayment']));
  }

  UpdateCandidateTransferCheckPayment(candidate_id, transfer_check_payment_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidateTransferCheckPayment(
            $candidate_id: ID!
            $transfer_check_payment_input: PaymentTransferCheckDataInput!
            $lang: String
          ) {
            UpdateCandidateTransferCheckPayment(
              candidate_id: $candidate_id
              transfer_check_payment_input: $transfer_check_payment_input
              lang: $lang
            ) {
              _id
            }
          }
        `,
        variables: {
          candidate_id,
          transfer_check_payment_input,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['UpdateCandidateTransferCheckPayment']));
  }

  getCandidateValidation(_id) {
    return this.apollo
      .query({
        query: gql`
          query GetOneCandidate($_id: ID!) {
            GetOneCandidate(_id: $_id) {
              _id
              admission_process_id {
                _id
              }
            }
          }
        `,
        variables: {
          _id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  GenerateStepMessage(step_id, form_process_id, is_preview): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GenerateFormBuilderStepMessage($step_id: ID, $form_process_id: ID, $is_preview: Boolean) {
            GenerateFormBuilderStepMessage(step_id: $step_id, form_process_id: $form_process_id, is_preview: $is_preview) {
              _id
              type
              ref_id
              body
              subject
              first_button
              second_button
            }
          }
        `,
        variables: {
          step_id,
          form_process_id,
          is_preview,
        },
      })
      .pipe(map((resp) => resp.data['GenerateFormBuilderStepMessage']));
  }

  createOrganization(payload: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation createOrganization($organization_input: OrganizationTypeInput) {
            CreateOrganization(organization_input: $organization_input) {
              _id
            }
          }
        `,
        variables: {
          organization_input: payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateOrganization']));
  }

  getAllOrganizationsPagination(filter, pagination, sorting) {
    return this.apollo
      .query({
        query: gql`
          query GetAllOrganizations($filter: OrganizationFilterInput, $pagination: PaginationInput, $sorting: OrganizationSortInput) {
            GetAllOrganizations(filter: $filter, pagination: $pagination, sorting: $sorting) {
              _id
              name
              organization_type
              organization_id
              region
              address
              postal_code
              country
              city
              department
              date_added
              date_updated
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
          pagination,
          sorting,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllOrganizations'];
        }),
      );
  }

  getOneOrganizationForCardList(userId: string) {
    return this.apollo
      .query({
        query: gql`
          query GetOneOrganization {
              GetOneOrganization(_id: "${userId}") {
              _id
              name
              organization_type
              organization_id
              region
              address
              postal_code
              country
              city
              department
              date_added
              date_updated
              pole_emploi_region
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneOrganization']));
  }

  getAllOrganizations(filter, pagination: { page: number; limit: number }, sorting) {
    return this.apollo
      .query({
        query: gql`
          query GetAllOrganizations($filter: OrganizationFilterInput, $pagination: PaginationInput, $sorting: OrganizationSortInput) {
            GetAllOrganizations(filter: $filter, pagination: $pagination, sorting: $sorting) {
              _id
              name
              organization_type
              organization_id
              region
              address
              postal_code
              country
              city
              department
              date_added
              date_updated
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
          pagination,
          sorting,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllOrganizations'];
        }),
      );
  }

  deleteOrganization(_id: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteOrganization($_id: ID!) {
            DeleteOrganization(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteOrganization']));
  }

  getAllContacts(orgId, filter, sorting, pagination, searching) {
    return this.apollo
      .query({
        query: gql`
          query GetAllContacts(
            $organization_id: ID
            $filter: ContactFilterInput
            $sorting: ContactSortingInput
            $pagination: PaginationInput
            $searching: ContactSearchInput
          ) {
            GetAllContacts(
              organization_id: $organization_id
              filter: $filter
              sorting: $sorting
              pagination: $pagination
              searching: $searching
            ) {
              _id
              civility
              first_name
              last_name
              email
              telephone
              status
              phone_number_indicative
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          organization_id: orgId,
          filter,
          sorting,
          pagination,
          searching,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllContacts'];
        }),
      );
  }

  deleteContact(_id: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteContact($_id: ID!) {
            DeleteContact(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteContact']));
  }

  updateContact(id: any, payload: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation updateContact($_id: ID!, $contact_input: ContactInput) {
            UpdateContact(_id: $_id, contact_input: $contact_input) {
              _id
            }
          }
        `,
        variables: {
          _id: id,
          contact_input: payload,
        },
      })
      .pipe(map((resp) => resp.data['UpdateContact']));
  }

  createContact(payload: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation createContact($contact_input: ContactInput) {
            CreateContact(contact_input: $contact_input) {
              _id
            }
          }
        `,
        variables: {
          contact_input: payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateContact']));
  }

  updateOrganization(id: string, payload: any): any {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateOrganization($id: ID!, $organization_input: OrganizationTypeInput) {
            UpdateOrganization(_id: $id, organization_input: $organization_input) {
              _id
            }
          }
        `,
        variables: {
          id: id,
          organization_input: payload,
        },
      })
      .pipe(
        map((resp: any) => {
          if (resp.errors) {
            throw new Error(resp.errors.message);
          } else {
            return resp.data['UpdateOrganization'];
          }
        }),
      );
  }

  GetAllFinancementNotes(admission_financement_id) {
    return this.apollo
      .query({
        query: gql`
          query GetAllFinancementNotes($admission_financement_id: ID) {
            GetAllFinancementNotes(admission_financement_id: $admission_financement_id) {
              _id
              created_by {
                _id
                first_name
                last_name
                civility
              }
              comment
              createdAt
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          admission_financement_id,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllFinancementNotes'];
        }),
      );
  }

  createFinancementNote(payload: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateFinancementNote($payload: FinancementNoteInput) {
            CreateFinancementNote(financement_note_input: $payload) {
              _id
              admission_financement_id {
                _id
              }
              created_by {
                _id
                first_name
                last_name
              }
              comment
              status
              createdAt
            }
          }
        `,
        variables: {
          payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateFinancementNote']));
  }

  DeleteFinancementNote(_id) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteFinancementNote($_id: ID!) {
            DeleteFinancementNote(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteFinancementNote']));
  }

  generatePDFFcContractProcessStep(candidate_id: any, step_id: any, lang: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GeneratePDFFcContractProcessStep($candidate_id: ID, $step_id: ID, $lang: String) {
            GeneratePDFFcContractProcessStep(candidate_id: $candidate_id, step_id: $step_id, lang: $lang)
          }
        `,
        variables: {
          candidate_id,
          step_id,
          lang,
        },
      })
      .pipe(map((resp) => resp.data['GeneratePDFFcContractProcessStep']));
  }
  CheckStatusFormProcess(_id) {
    return this.apollo
      .query({
        query: gql`
          query GetOneFormProcess($_id: ID) {
            GetOneFormProcess(_id: $_id) {
              _id
              name
              steps {
                step_type
                step_status
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          _id,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneFormProcess'];
        }),
      );
  }
  getOneFormProcessv2(_id) {
    return this.apollo
      .query({
        query: gql`
          query GetOneFormProcessv2($_id: ID) {
            GetOneFormProcessv2(_id: $_id) {
              _id
              status
              last_name
              first_name
              civility
              contract_type
              form_status
              is_final_validator_active
              final_validators {
                _id
                name_with_entity
              }
              final_validator_statuses {
                user_id {
                  _id
                }
                is_already_sign
              }
              revision_user_type {
                _id
                name
              }
              user_id {
                _id
              }
              form_builder_id {
                _id
              }
              steps {
                _id
                step_title
                step_type
                step_status
                user_validator {
                  _id
                }
                is_validation_required
                is_only_visible_based_on_condition
                direction(is_parsed: true)
                status
                step_status
                is_final_step
                form_builder_step {
                  _id
                }
                user_who_complete_step {
                  _id
                }
                revision_user_type {
                  _id
                  name
                }
                validator {
                  _id
                  name
                }
                revise_request_messages {
                  created_date
                  created_time
                  created_by {
                    _id
                    civility
                    first_name
                    last_name
                  }
                  user_type_id {
                    _id
                    name
                  }
                  message
                }
                segments {
                  _id
                  segment_title
                  acceptance_pdf
                  acceptance_text
                  document_for_condition
                  is_upload_pdf_acceptance
                  is_rejection_allowed
                  is_download_mandatory
                  accept_button
                  reject_button
                  is_student_included
                  questions {
                    _id
                    is_field
                    field_type
                    field_position
                    is_editable
                    is_required
                    ref_id
                    question_label
                    modality_question_type
                    final_message_question(is_parsed: true) {
                      final_message_image {
                        s3_file_name
                        name
                      }
                      final_message_summary_header
                      final_message_summary_footer
                    }
                    answer
                    answer_multiple
                    answer_number
                    answer_time
                    answer_duration
                    answer_type
                    document_validation_status
                    is_document_validated
                    answer_date {
                      date
                      time
                    }
                    acad_document_id {
                      document_status
                    }
                  }
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          _id,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneFormProcessv2'];
        }),
      );
  }
  acceptFormProcessStepV2(step_id, form_id, step_input,sender_user_type_ids?) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AcceptFormProcessStepV2($step_id: ID!, $form_id: ID!, $step_input: CreateUpdateFormProcessStepInput, $lang: String,$sender_user_type_ids: [ID]) {
            AcceptFormProcessStepV2(step_id: $step_id, form_id: $form_id, step_input: $step_input, lang: $lang,sender_user_type_ids:$sender_user_type_ids) {
              _id
            }
          }
        `,
        variables: {
          step_id,
          form_id,
          step_input,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          sender_user_type_ids
        },
      })
      .pipe(map((resp) => resp.data['AcceptFormProcessStepV2']));
  }
  askRevisionFormProcessV2(_id, revise_request_messages,user_type_ids?) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AskRevisionFormProcessV2($_id: ID, $revise_request_messages: [FormProcessReviseRequestMessageInput], $lang: String,$user_type_ids: [ID]) {
            AskRevisionFormProcessV2(_id: $_id, revise_request_messages: $revise_request_messages, lang: $lang,user_type_ids:$user_type_ids) {
              _id
            }
          }
        `,
        variables: {
          _id,
          revise_request_messages,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          user_type_ids
        },
      })
      .pipe(map((resp) => resp.data['AskRevisionFormProcessV2']));
  }
  rejectFormProcessSigningStep(reason_reject, form_id, step_id, user_id) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation RejectFormProcessSigningStep($reason_reject: String, $form_id: ID, $step_id: ID, $user_id: ID, $lang: String) {
            RejectFormProcessSigningStep(
              reason_reject: $reason_reject
              form_id: $form_id
              step_id: $step_id
              user_id: $user_id
              lang: $lang
            ) {
              _id
            }
          }
        `,
        variables: {
          reason_reject,
          form_id,
          step_id,
          user_id,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['RejectFormProcessSigningStep']));
  }
}
