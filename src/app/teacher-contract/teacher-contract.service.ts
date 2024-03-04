import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as _ from 'lodash';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class TeacherContractService {
  private _childrenFormValidationStatus = true;
  private contractTemplateSource = new BehaviorSubject<any>(null);
  public contractTemplateData$ = this.contractTemplateSource.asObservable();

  private stepSource = new BehaviorSubject<any>(null);
  public stepData$ = this.stepSource.asObservable();

  _stepState = [];

  // theme$: Observable<[string, boolean]>;

  stepTypeList = ['question_and_field', 'document_expected'];
  validatorList = ['user_receive_form', 'school_admin', 'program_director', 'school_director'];

  QuestionnaireConsts = {
    fieldTypes: [
      {
        value: 'date',
        view: 'Date',
      },
      {
        value: 'text',
        view: 'Text',
      },
      {
        value: 'number',
        view: 'Number',
      },
      {
        value: 'pfereferal',
        view: 'PFE Referal',
      },
      {
        value: 'jurymember',
        view: 'Jury Member',
      },
      {
        value: 'longtext',
        view: 'Long Text',
      },
      {
        value: 'signature',
        view: 'Signature',
      },
      {
        value: 'correctername',
        view: 'Corrector Name',
      },
    ],
    requiredFieldsTypes: [
      {
        value: 'eventName',
        view: 'Name of the Event',
        type: 'text',
        removed: false,
      },
      {
        value: 'dateRange',
        view: 'Date Range',
        type: 'date',
        removed: false,
      },
      {
        value: 'dateFixed',
        view: 'Date Fixed',
        type: 'date',
        removed: false,
      },
      {
        value: 'titleName',
        view: 'Title Name',
        type: 'text',
        removed: false,
      },
      {
        value: 'status',
        view: 'Status',
        type: 'text',
        removed: false,
      },
    ],
    questionnaireFields: [
      'TEACHER_CIVILITY',
      'TEACHER_FIRST_NAME',
      'TEACHER_LAST_NAME',
      'TEACHER_MOBILE',
      'TEACHER_EMAIL', //
      // 'TEACHER_TYPE_INTERVENTION', //
      // 'TEACHER_PROGRAMS', //
      // 'TEACHER_SUBJECTS', //
      'CONTRACT_TYPE',
      'START_DATE',
      'END_DATE',
      // 'TOTAL_HOURS',
      // 'HOURLY_RATE',
      'TEACHER_TYPE_INTERVENTION_1',
      'TEACHER_TYPE_INTERVENTION_2',
      'TEACHER_TYPE_INTERVENTION_3',
      'TEACHER_TYPE_INTERVENTION_4',
      'TEACHER_TYPE_INTERVENTION_5',
      'TEACHER_TYPE_INTERVENTION_6',
      'TEACHER_PROGRAMS_1',
      'TEACHER_PROGRAMS_2',
      'TEACHER_PROGRAMS_3',
      'TEACHER_PROGRAMS_4',
      'TEACHER_PROGRAMS_5',
      'TEACHER_PROGRAMS_6',
      'TEACHER_SUBJECTS_1',
      'TEACHER_SUBJECTS_2',
      'TEACHER_SUBJECTS_3',
      'TEACHER_SUBJECTS_4',
      'TEACHER_SUBJECTS_5',
      'TEACHER_SUBJECTS_6',
      'TEACHER_HOURLY_RATE_1',
      'TEACHER_HOURLY_RATE_2',
      'TEACHER_HOURLY_RATE_3',
      'TEACHER_HOURLY_RATE_4',
      'TEACHER_HOURLY_RATE_5',
      'TEACHER_HOURLY_RATE_6',
      'TEACHER_TOTAL_HOURS_1',
      'TEACHER_TOTAL_HOURS_2',
      'TEACHER_TOTAL_HOURS_3',
      'TEACHER_TOTAL_HOURS_4',
      'TEACHER_TOTAL_HOURS_5',
      'TEACHER_TOTAL_HOURS_6',
      'TEACHER_TRIAL_PERIOD_1',
      'TEACHER_TRIAL_PERIOD_2',
      'TEACHER_TRIAL_PERIOD_3',
      'TEACHER_TRIAL_PERIOD_4',
      'TEACHER_TRIAL_PERIOD_5',
      'TEACHER_TRIAL_PERIOD_6',
      'TEACHER_INDUCED_HOUR_COEFFICIENT_1',
      'TEACHER_INDUCED_HOUR_COEFFICIENT_2',
      'TEACHER_INDUCED_HOUR_COEFFICIENT_3',
      'TEACHER_INDUCED_HOUR_COEFFICIENT_4',
      'TEACHER_INDUCED_HOUR_COEFFICIENT_5',
      'TEACHER_INDUCED_HOUR_COEFFICIENT_6',
      'EMAIL_SIGNALEMENTS',
      'PAID_LEAVE_ALLOWANCE_RATE_1',
      'PAID_LEAVE_ALLOWANCE_RATE_2',
      'PAID_LEAVE_ALLOWANCE_RATE_3',
      'PAID_LEAVE_ALLOWANCE_RATE_4',
      'PAID_LEAVE_ALLOWANCE_RATE_5',
      'PAID_LEAVE_ALLOWANCE_RATE_6',
      'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_1',
      'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_2',
      'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_3',
      'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_4',
      'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_5',
      'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_6',
      'TEACHER_COMPENSATION_PAID_VACATION_1',
      'TEACHER_COMPENSATION_PAID_VACATION_2',
      'TEACHER_COMPENSATION_PAID_VACATION_3',
      'TEACHER_COMPENSATION_PAID_VACATION_4',
      'TEACHER_COMPENSATION_PAID_VACATION_5',
      'TEACHER_COMPENSATION_PAID_VACATION_6',
      'TEACHER_VOLUME_HOURS_INDUCED_1',
      'TEACHER_VOLUME_HOURS_INDUCED_2',
      'TEACHER_VOLUME_HOURS_INDUCED_3',
      'TEACHER_VOLUME_HOURS_INDUCED_4',
      'TEACHER_VOLUME_HOURS_INDUCED_5',
      'TEACHER_VOLUME_HOURS_INDUCED_6',
      'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_1',
      'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_2',
      'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_3',
      'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_4',
      'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_5',
      'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_6',
      'TEACHER_TOTAL_PERIOD_1',
      'TEACHER_TOTAL_PERIOD_2',
      'TEACHER_TOTAL_PERIOD_3',
      'TEACHER_TOTAL_PERIOD_4',
      'TEACHER_TOTAL_PERIOD_5',
      'TEACHER_TOTAL_PERIOD_6',
      'TOTAL_AMOUNT',
      'SCHOLAR_SEASON',
    ],
    questionAnswerTypes: [
      { name: 'NUMERIC', key: 'numeric' },
      { name: 'DATE', key: 'date' },
      { name: 'LONG_ANSWER', key: 'long_answer' },
      { name: 'SHORT_ANSWER', key: 'free_text' },
      // { name: 'FREE_TEXT', key: 'free_text' },
      { name: 'DROPDOWN_MULTIPLE_OPTION', key: 'dropdown_multiple_option' },
      { name: 'DROPDOWN_SINGLE_OPTION', key: 'dropdown_single_option' },
      { name: 'SINGLE_OPTION', key: 'single_option' },
      { name: 'MULTIPLE_OPTION', key: 'multiple_option' },
      { name: 'EMAIL', key: 'email' },
    ],
    questionPositions: ['left', 'right'],
    expectedDocumentTypes: [
      {
        value: 'document_pdf_upload',
        view: 'Document (PDF) Upload',
      },
    ],
  };

  conditionTypeList = ['upload_pdf', 'use_from_certification_rule', 'ck_editor'];
  statusStepParameterList = ['engaged', 'bill_validated', 'registered'];

  constructor(private translate: TranslateService, private apollo: Apollo) {}

  getContractTemplateData() {
    return this.contractTemplateSource.getValue();
  }

  setContractTemplateData(data) {
    this.contractTemplateSource.next(data);
  }

  resetContractTemplateData() {
    this.contractTemplateSource.next(null);
  }

  setStepData(data) {
    this.stepSource.next(data);
  }

  getStepTypeList() {
    return this.stepTypeList;
  }

  getValidatorList() {
    return this.validatorList;
  }

  getQuestionnaireConst() {
    return this.QuestionnaireConsts;
  }

  getConditionDocTypeList() {
    return this.conditionTypeList;
  }

  getStatusStepParameters() {
    return this.statusStepParameterList;
  }

  public get childrenFormValidationStatus() {
    return this._childrenFormValidationStatus;
  }

  public set childrenFormValidationStatus(state: boolean) {
    this._childrenFormValidationStatus = state;
  }

  public set stepState(stepState: any[]) {
    this._stepState = stepState;
  }

  public get stepState() {
    return this._stepState;
  }

  setStepStateStatus(index, status: boolean) {
    if (!this._stepState || !this._stepState[index]) {
      return;
    }
    this._stepState[index].completed = status;
    console.log(this.stepState);
  }

  setContractTemplateStep(stepIndex, data) {
    const temp = this.getContractTemplateData();
    if (temp && temp.steps && temp.steps[stepIndex]) {
      temp.steps[stepIndex] = data;
      this.setContractTemplateData(temp);
    }
  }

  getUserTypesForValidator(): Observable<{ _id: string; name: string }[]> {
    return this.apollo
      .watchQuery<{ _id: string; name: string }[]>({
        query: gql`
          query GetAllUserTypes{
            GetAllUserTypes(exclude_company: true) {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getUserTypesForSignFc(): Observable<{ _id: string; name: string }[]> {
    return this.apollo
      .watchQuery<{ _id: string; name: string }[]>({
        query: gql`
          query GetAllUserTypes{
            GetAllUserTypes {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUserTypes']));
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
              }
              first_name
              last_name
              civility
              student_id {
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
      .pipe(map((resp) => resp.data['GetOneUser']));
  }

  getAllContractProcesses(pagination: { page: number; limit: number }, user_type_id, filter: any, sorting?: any): Observable<any[]> {
    return this.apollo
      .watchQuery<{ _id: string; name: string }[]>({
        query: gql`
          query GetAllContractProcesses(
            $pagination: PaginationInput
            $filter: ContractProcessFilterInput
            $sorting: ContractProcessSortingInput
            $user_type_id: ID
          ) {
            GetAllContractProcesses(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_id: $user_type_id) {
              _id
              civility
              first_name
              last_name
              count_document
              email
              portable_phone
              program {
                _id
                program
              }
              subject {
                _id
                full_name
              }
              type_of_intervention
              start_date
              start_time
              end_date
              end_time
              total_hours
              hourly_rate
              steps {
                _id
                index
                step_title
                step_status
              }
              contract_status
              pre_contract_template_id {
                _id
                contract_template_name
                additional_documents {
                  s3_file_name
                  name
                }
              }
              contract_type
              contract_manager {
                _id
                civility
                first_name
                last_name
              }
              interventions {
                type_intervention
                program {
                  _id
                  program
                }
                total_hours
                hourly_rate
                subject_id {
                  _id
                  short_name
                  full_name
                }
              }
              additional_documents {
                s3_file_name
                name
              }
              legal_entity {
                _id
                legal_entity_name
              }
              form_builder_id {
                _id
              }
              contract_validator_signatory_status {
                user_id {
                  civility
                  first_name
                  last_name
                }
                is_already_sign
              }
            }
          }
        `,
        variables: {
          pagination,
          user_type_id,
          filter,
          sorting: sorting ? sorting : null,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllContractProcesses']));
  }

  getAllFormProcesses(pagination, filter, sorting): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllFormProcesses($pagination: PaginationInput, $filter: FormProcessFilterInput, $sorting: FormProcessSortingInput) {
            GetAllFormProcesses(filter: $filter, pagination: $pagination, sorting: $sorting) {
              _id
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
                operator_dir_responsible {
                  _id
                  first_name
                  last_name
                  civility
                }
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
              interventions {
                subject_id {
                  _id
                  short_name
                }
                program {
                  _id
                  program
                }
                type_intervention
              }
              type_of_intervention
              program {
                _id
                program
              }
              subject {
                _id
                short_name
                full_name
              }
              start_date
              start_time
              end_date
              end_time
              contract_manager {
                _id
                civility
                first_name
                last_name
              }
              contract_status
              portable_phone
              email
              contract_type
              first_name
              last_name
              civility
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

  getAllFormContractManageProcesses(pagination, filter, sorting, user_type_ids): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllFormProcesses($user_type_ids: [ID], $pagination: PaginationInput, $filter: FormProcessFilterInput, $sorting: FormProcessSortingInput) {
            GetAllFormProcesses(user_type_ids: $user_type_ids, filter: $filter, pagination: $pagination, sorting: $sorting) {
              _id
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
                operator_dir_responsible {
                  _id
                  first_name
                  last_name
                  civility
                }
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
              interventions {
                subject_id {
                  _id
                  short_name
                }
                program {
                  _id
                  program
                }
                type_intervention
              }
              type_of_intervention
              program {
                _id
                program
              }
              subject {
                _id
                short_name
                full_name
              }
              start_date
              start_time
              end_date
              end_time
              contract_manager {
                _id
                civility
                first_name
                last_name
              }
              contract_status
              portable_phone
              email
              contract_type
              first_name
              last_name
              civility
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

  getDataContractForSendForm(pagination, filter, sorting, user_type_ids): Observable<any> {
    return this.apollo
      .query({
        query: gql`query GetAllFormProcesses($pagination: PaginationInput, $filter: FormProcessFilterInput, $sorting: FormProcessSortingInput, $user_type_ids: [ID])  {
        GetAllFormProcesses (
          filter: $filter
          pagination: $pagination,
          sorting: $sorting,
          user_type_ids: $user_type_ids
          ) {
            _id
          steps{
            _id
          }
          first_name
          last_name
          civility
        }
      }`,
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

  getAllSignalementEmailDropdown(user_type_id) {
    return this.apollo
      .query({
        query: gql`
          query GetAllCandidateSchool($user_type_id: ID) {
            GetAllCandidateSchool(user_type_id: $user_type_id) {
              _id
              short_name
              signalement_email
            }
          }
        `,
        variables: {
          user_type_id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  getAllSignalementEmail() {
    return this.apollo
      .query({
        query: gql`
          query GetAllCandidateSchool{
            GetAllCandidateSchool {
              _id
              short_name
              signalement_email
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  getAllContractManagerDropdown() {
    return this.apollo
      .query({
        query: gql`
          query GetAllUsers{
            GetAllUsers(user_type: ["6209f2dc74890f0ecad16670"]) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getAllLegalRepresentativeDropdown(full_name) {
    return this.apollo
      .query({
        query: gql`
          query GetAllUsers($full_name: String) {
            GetAllUsers(user_type: ["617f64ec5a48fe2228518812"], pagination: { limit: 10, page: 0 }, full_name: $full_name) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          full_name,
        },
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getContractProcessForm(_id: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetOneContractProcess{
          GetOneContractProcess(_id: "${_id}"){
            _id
            civility
            first_name
            last_name
            scholar_season {
              _id
            }
            schools_id {
              _id
            }
            email
            portable_phone
            contract_type
            start_date
            start_time
            end_date
            end_time
            school{
              _id
              short_name
              signalement_email
            }
            contract_manager{
              _id
              civility
              first_name
              last_name
            }
            interventions{
              type_intervention
              program{
                _id
                program
              }
              subject_id{
                _id
                short_name
                full_name
              }
              program_subject_id {
                _id
                name
                short_name
              }
              total_hours
              hourly_rate
              paid_leave_allowance_rate
              rate_excluding_paid_leave_allowance
              compensation_paid_vacation
              total_period
              trial_period
              induced_hours_coefficient
              volume_hours_induced
              total_hours_volume_hours_induced
            }
            legal_entity {
              _id
              legal_entity_name
            }
            form_builder_id {
              _id
            }
            teacher_subject_id {
              teacher_id {
                _id
              }
              legal_representative {
                _id
                first_name
                last_name
              }
              campus_id {
                _id
                name
              }
              level_name
              echelon
            }
            campus{
              _id
              name
            }
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneContractProcess']));
  }

  GetOneFcContractProcess(_id: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetOneFcContractProcess($lang: String) {
          GetOneFcContractProcess(_id: "${_id}") {
            _id
            candidate_id {
              civility
              first_name
              last_name
              email
            }
            fc_contract_manager_signatory {
              recipient_id
              client_id
              is_already_sign
            }
            contract_validator_signatory {
              _id
              name
            }
            is_contract_validator_signatory_in_order
            contract_validator_signatory_status {
              user_type_id {
                _id
                name
              }
              user_id {
                _id
                first_name
                last_name
              }
              is_already_sign
            }
            steps {
              _id
              step_title
              step_type
              step_status
              is_validation_required
              is_user_who_receive_the_form_as_validator
              form_builder_step_id {
                _id
                is_step_included_in_summary
              }
              revision_contract_process {
                _id
              }
              revision_user_type {
                _id
                name
              }
              user_validator {
                _id
                first_name
                civility
                last_name
              }
              validator {
                _id
                name
              }
              direction(
                is_parsed:true
                fc_contract_process_id:"${_id}"
                lang:$lang
                )
              is_step_included_in_summary
              segments {
                _id
                form_builder_segment
                segment_title
                questions {
                  _id
                  index
                  is_field
                  field_type
                  field_position
                  is_editable
                  is_required
                  ref_id
                  answer_type
                  question_label
                  document_validation_status
                  status
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
              revise_request_messages {
                created_date
                created_time
                created_by {
                  _id
                  civility
                  first_name
                  last_name
                  entities {
                    type {
                      name
                    }
                  }
                }
                user_type_id {
                  _id
                  name
                  name_with_entity
                }
                message
              }
            }
            contract_status
            form_builder_id {
              _id
            }
          }
        }
        `,
        variables: {
          lang: this.translate.currentLang ? this.translate.currentLang : 'fr',
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneFcContractProcess']));
  }

  getOneContractProcess(_id: string, is_parsed: boolean = true, lang: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneContractProcess($_id: ID!, $is_parsed: Boolean, $lang: String) {
            GetOneContractProcess(_id: $_id) {
              _id
              civility
              first_name
              last_name
              email
              teacher_signatory {
                teacher_id {
                  _id
                  first_name
                  last_name
                }
                is_already_sign
              }
              portable_phone
              signature_date {
                date
                time
              }
              program {
                _id
                program
              }
              subject {
                _id
                full_name
              }
              program_subject {
                _id
                name
              }
              contract_validator_signatory {
                _id
                name
              }
              is_contract_validator_signatory_in_order
              contract_validator_signatory_status {
                user_type_id {
                  _id
                  name
                }
                user_id {
                  _id
                  first_name
                  last_name
                }
                is_already_sign
              }
              type_of_intervention
              start_date
              end_date
              total_hours
              hourly_rate
              steps {
                _id
                step_title
                step_type
                step_status
                is_validation_required
                is_user_who_receive_the_form_as_validator
                form_builder_step_id {
                  _id
                  is_step_included_in_summary
                }
                revision_contract_process {
                  _id
                }
                revision_user_type {
                  _id
                  name
                }
                user_validator {
                  _id
                  first_name
                  civility
                  last_name
                }
                validator {
                  _id
                  name
                }
                direction(is_parsed: $is_parsed, contract_process_id: $_id, lang: $lang)
                pre_contract_template_step {
                  _id
                  is_step_included_in_summary
                }
                segments {
                  _id
                  pre_contract_template_segment
                  segment_title
                  questions {
                    _id
                    index
                    is_field
                    field_type
                    field_position
                    is_editable
                    is_required
                    ref_id
                    answer_type
                    question_label
                    document_validation_status
                    status
                    is_document_validated
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
                revise_request_messages {
                  created_date
                  created_time
                  created_by {
                    _id
                    civility
                    first_name
                    last_name
                    entities {
                      type {
                        name
                      }
                    }
                  }
                  user_type_id {
                    _id
                    name
                    name_with_entity
                  }
                  message
                }
              }
              contract_status
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
              pre_contract_template_id {
                _id
                contract_template_name
              }
              legal_entity {
                _id
                legal_entity_name
              }
              form_builder_id {
                _id
              }
            }
          }
        `,
        variables: {
          _id,
          is_parsed,
          lang,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneContractProcess']));
  }

  getOneFcContractProcess(_id: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetOneFcContractProcess($lang: String) {
          GetOneFcContractProcess(_id: "${_id}"){
            _id
            candidate_id {
              _id
              civility
              first_name
              last_name
              email
              candidate_unique_number
              intake_channel {
                _id
                program
              }
            }
            form_builder_id {
              _id
              form_builder_name
            }
            steps {
              _id
              step_title
              step_type
              step_status
              is_validation_required
              is_user_who_receive_the_form_as_validator
              is_step_included_in_summary
              form_builder_step_id {
                _id
              }
              revision_contract_process {
                _id
              }
              revision_user_type {
                _id
                name
              }
              user_validator {
                _id
                first_name
                civility
                last_name
              }
              validator {
                _id
                name
              }
              direction(
                is_parsed:true
                fc_contract_process_id:"${_id}"
                lang:$lang
                )
              segments {
                _id
                segment_title
                questions {
                  _id
                  index
                  is_field
                  field_type
                  field_position
                  is_editable
                  is_required
                  ref_id
                  answer_type
                  question_label
                  document_validation_status
                  status
                  options
                  answer
                  answer_multiple
                  answer_number
                  answer_date {
                    date
                    time
                  }
                  special_question {
                    campus_validation(is_parsed: true)
                    summary_header(is_parsed: true)
                    summary_footer(is_parsed: true)
                    document_acceptance_pdf
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
                  entities{
                    type{
                      name
                    }
                  }
                }
                user_type_id{
                  _id
                  name
                  name_with_entity
                }
                message
              }
            }
            admission_financement_id {
              _id
              organization_name
              organization_type
            }
            start_date {
              date
              time
            }
            end_date {
              date
              time
            }
            contract_manager {
              _id
              civility
              first_name
              last_name
            }
            contract_status
            fc_contract_manager_signatory {
              is_already_sign
            }
          }
        }
        `,
        variables: {
          lang: this.translate.currentLang ? this.translate.currentLang : 'fr',
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneFcContractProcess']));
  }

  createContractProcess(contract_process_input): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateContractProcess($contract_process_input: ContractProcessInput) {
            CreateContractProcess(contract_process_input: $contract_process_input) {
              _id
            }
          }
        `,
        variables: {
          contract_process_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateContractProcess']));
  }

  createContractProcessAndSend(contract_process_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateContractProcess($contract_process_input: ContractProcessInput) {
            CreateContractProcess(contract_process_input: $contract_process_input) {
              _id
              civility
              first_name
              last_name
              email
              portable_phone
              contract_type
              start_date
              start_time
              end_date
              end_time
              school {
                _id
                short_name
                signalement_email
              }
              contract_manager {
                _id
                civility
                first_name
                last_name
              }
              interventions {
                type_intervention
                program {
                  _id
                  program
                }
                subject_id {
                  _id
                  short_name
                  full_name
                }
                total_hours
                hourly_rate
                paid_leave_allowance_rate
                rate_excluding_paid_leave_allowance
                compensation_paid_vacation
                total_period
                trial_period
                induced_hours_coefficient
                volume_hours_induced
                total_hours_volume_hours_induced
              }
              legal_entity {
                _id
                legal_entity_name
              }
            }
          }
        `,
        variables: {
          contract_process_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateContractProcess']));
  }

  updateContractProcess(_id: string, contract_process_input): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateContractProcess($_id: ID, $contract_process_input: ContractProcessInput) {
            UpdateContractProcess(_id: $_id, contract_process_input: $contract_process_input) {
              _id
            }
          }
        `,
        variables: {
          _id,
          contract_process_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateContractProcess']));
  }

  updatePreContractTemplate(_id: string, pre_contract_template_input): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdatePreContractTemplate($_id: ID!, $pre_contract_template_input: PreContractTemplateInput) {
            UpdatePreContractTemplate(_id: $_id, pre_contract_template_input: $pre_contract_template_input) {
              _id
            }
          }
        `,
        variables: {
          _id,
          pre_contract_template_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdatePreContractTemplate']));
  }

  getAllPreContractTemplates(pagination: { page: number; limit: number }, filter: any, sorting?: any): Observable<any[]> {
    return this.apollo
      .watchQuery<{ _id: string; name: string }[]>({
        query: gql`
          query GetAllPreContractTemplates(
            $pagination: PaginationInput
            $filter: PreContractTemplateFilterInput
            $sorting: PreContractTemplateSortingInput
          ) {
            GetAllPreContractTemplates(pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
              contract_template_name
              created_at
              count_document
              created_by {
                _id
                civility
                first_name
                last_name
              }
              is_published
            }
          }
        `,
        variables: {
          pagination,
          filter,
          sorting: sorting ? sorting : null,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllPreContractTemplates']));
  }

  deleteContractProcess(_id: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteContractProcess{
            DeleteContractProcess(_id: "${_id}") {
              _id
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['DeleteContractProcess']));
  }

  createContractTemplate(pre_contract_template_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreatePreContractTemplate($pre_contract_template_input: PreContractTemplateInput) {
            CreatePreContractTemplate(pre_contract_template_input: $pre_contract_template_input) {
              _id
            }
          }
        `,
        variables: {
          pre_contract_template_input,
        },
      })
      .pipe(map((resp) => resp.data['CreatePreContractTemplate']));
  }

  updateContractTemplate(templateId, pre_contract_template_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdatePreContractTemplate($templateId: ID!, $pre_contract_template_input: PreContractTemplateInput) {
            UpdatePreContractTemplate(_id: $templateId, pre_contract_template_input: $pre_contract_template_input) {
              _id
            }
          }
        `,
        variables: {
          templateId,
          pre_contract_template_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdatePreContractTemplate']));
  }

  getContractTemplateFirstTab(templateId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOnePreContractTemplateFirstTab($templateId: ID!) {
            GetOnePreContractTemplate(_id: $templateId) {
              _id
              contract_template_name
              is_published
              created_by {
                _id
              }
              steps {
                _id
                step_title
                index
                step_type
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
      .pipe(map((resp) => resp.data['GetOnePreContractTemplate']));
  }

  getOneContractTemplate(templateId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOnePreContractTemplate($templateId: ID!) {
            GetOnePreContractTemplate(_id: $templateId) {
              _id
              contract_template_name
              is_published
              created_by {
                _id
              }
              steps {
                _id
                index
                step_title
                step_type
                is_validation_required
                direction
                status
                validator {
                  _id
                  name
                }
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
                    options
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
      .pipe(map((resp) => resp.data['GetOnePreContractTemplate']));
  }

  getOnePreContractTemplate(templateId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOnePreContractTemplate($_id: ID!) {
            GetOnePreContractTemplate(_id: $_id) {
              _id
              contract_template_name
              is_contract_signatory_in_order
              is_published
              status
              created_at
              count_document
              contract_signatory {
                _id
                name
              }
              steps {
                _id
                index
                step_title
                step_type
                is_validation_required
                validator {
                  _id
                  name
                }
                direction
                count_document
                segments {
                  _id
                  segment_title
                  questions {
                    _id
                    index
                    is_field
                    field_type
                    field_position
                    is_editable
                    is_required
                    ref_id
                    answer_type
                    question_label
                    options
                    count_document
                  }
                }
              }
            }
          }
        `,
        variables: {
          _id: templateId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOnePreContractTemplate']));
  }

  getOnePreContractTemplateStep(stepId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOnePreContractTemplateStep($_id: ID!) {
            GetOnePreContractTemplateStep(_id: $_id) {
              _id
              index
              step_title
              step_type
              is_validation_required
              is_user_who_receive_the_form_as_validator
              is_step_included_in_summary
              validator {
                _id
                name
              }
              direction
              count_document
              segments {
                _id
                segment_title
                questions {
                  _id
                  index
                  is_field
                  field_type
                  field_position
                  is_editable
                  is_required
                  ref_id
                  answer_type
                  question_label
                  options
                  count_document
                }
              }
            }
          }
        `,
        variables: {
          _id: stepId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOnePreContractTemplateStep']));
  }

  publishContractTemplateFirstTab(templateId): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation PublishPreContractTemplate($templateId: ID!) {
            PublishPreContractTemplate(_id: $templateId) {
              _id
            }
          }
        `,
        variables: {
          templateId,
        },
      })
      .pipe(map((resp) => resp.data['PublishPreContractTemplate']));
  }

  createContractTemplateStep(pre_contract_template_step_input, pre_contract_template_id): Observable<{ _id: string; step_title: string }> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreatePreContractTemplateStep(
            $pre_contract_template_step_input: PreContractTemplateStepInput
            $pre_contract_template_id: ID
          ) {
            CreatePreContractTemplateStep(
              pre_contract_template_step_input: $pre_contract_template_step_input
              pre_contract_template_id: $pre_contract_template_id
            ) {
              _id
              step_title
            }
          }
        `,
        variables: {
          pre_contract_template_step_input,
          pre_contract_template_id,
        },
      })
      .pipe(map((resp) => resp.data['CreatePreContractTemplateStep']));
  }

  deleteContractTemplateStep(_id: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation {
            DeletePreContractTemplateStep(_id: "${_id}") {
              _id
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['DeletePreContractTemplateStep']));
  }

  getAllSubjectsDropdown() {
    return this.apollo
      .query({
        query: gql`
          query GetAllSubjectCourseAndSequences {
            GetAllSubjectCourseAndSequences {
              _id
              short_name
              full_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllSubjectCourseAndSequences']));
  }
  getAllProgramSubjects(filter) {
    return this.apollo
      .query({
        query: gql`
          query GetAllProgramSubjects($filter: ProgramSubjectFilterInput) {
            GetAllProgramSubjects(filter: $filter) {
              _id
              short_name
              name
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllProgramSubjects']));
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

  GetAllSubjectCourseAndSequences() {
    return this.apollo
      .query({
        query: gql`
          query GetAllSubjectCourseAndSequences {
            GetAllSubjectCourseAndSequences {
              _id
              short_name
              full_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllSubjectCourseAndSequences']));
  }

  deleteContractTemplate(_id: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation {
            DeletePreContractTemplate(_id: "${_id}") {
              _id
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['DeletePreContractTemplate']));
  }

  createUpdatePreContractTemplateStep(pre_contract_template_step_input: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateUpdatePreContractTemplateStep($pre_contract_template_step_input: CreateUpdatePreContractTemplateStepInput) {
            CreateUpdatePreContractTemplateStep(pre_contract_template_step_input: $pre_contract_template_step_input) {
              _id
            }
          }
        `,
        variables: {
          pre_contract_template_step_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateUpdatePreContractTemplateStep']));
  }

  createContractTemplateTextTab(pre_contract_template_pdf_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreatePreContractTemplatePDF($pre_contract_template_pdf_input: PreContractTemplatePDFInput) {
            CreatePreContractTemplatePDF(pre_contract_template_pdf_input: $pre_contract_template_pdf_input) {
              _id
            }
          }
        `,
        variables: {
          pre_contract_template_pdf_input,
        },
      })
      .pipe(map((resp) => resp.data['CreatePreContractTemplatePDF']));
  }

  updateContractTemplateTextTab(pdfId, pre_contract_template_pdf_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdatePreContractTemplatePDF($pre_contract_template_pdf_input: PreContractTemplatePDFInput, $pdfId: ID) {
            UpdatePreContractTemplatePDF(pre_contract_template_pdf_input: $pre_contract_template_pdf_input, _id: $pdfId) {
              _id
            }
          }
        `,
        variables: {
          pre_contract_template_pdf_input,
          pdfId,
        },
      })
      .pipe(map((resp) => resp.data['UpdatePreContractTemplatePDF']));
  }

  getContractSignatoryDropdown(_id: string) {
    return this.apollo
      .query({
        query: gql`
          query{
            GetOnePreContractTemplate(_id: "${_id}"){
              _id
              contract_signatory{
                _id
                name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOnePreContractTemplate']));
  }

  getContractTemplateKeysDropdown(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetListPreContractTemplateQuestionRefIds {
            GetListPreContractTemplateQuestionRefIds {
              key
              description
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetListPreContractTemplateQuestionRefIds']));
  }

  GetListFCContracTemplateQuestionRefIds(filter: any, form_builder_id, form_builder_step_id, lang): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetListFCContracTemplateQuestionRefIds(
            $filter: ListPreContractTemplateQuestionRefIdsFilterInput
            $form_builder_id: ID
            $form_builder_step_id: ID
            $lang: String
          ) {
            GetListFCContracTemplateQuestionRefIds(
              filter: $filter
              form_builder_id: $form_builder_id
              form_builder_step_id: $form_builder_step_id
              lang: $lang
            ) {
              key
              description
            }
          }
        `,
        variables: {
          filter,
          form_builder_id,
          form_builder_step_id,
          lang,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetListFCContracTemplateQuestionRefIds']));
  }

  GetContractTemplateKeysData(templateId, filter: any, lang): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetListPreContractTemplateQuestionRefIds(
            $templateId: ID
            $filter: ListPreContractTemplateQuestionRefIdsFilterInput
            $lang: String
          ) {
            GetListPreContractTemplateQuestionRefIds(pre_contract_template_id: $templateId, filter: $filter, lang: $lang) {
              key
              description
            }
          }
        `,
        variables: {
          templateId,
          filter,
          lang,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetListPreContractTemplateQuestionRefIds']));
  }

  getContractTemplateKeysData(templateId, lang): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetListPreContractTemplateQuestionRefIds($templateId: ID, $lang: String) {
            GetListPreContractTemplateQuestionRefIds(pre_contract_template_id: $templateId, lang: $lang) {
              key
              description
            }
          }
        `,
        variables: {
          templateId,
          lang,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetListPreContractTemplateQuestionRefIds']));
  }

  duplicateContractTemplate(pre_contract_template_id, pre_contract_template_name): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DuplicatePreContractTemplate($pre_contract_template_id: ID!, $pre_contract_template_name: String!) {
            DuplicatePreContractTemplate(
              pre_contract_template_id: $pre_contract_template_id
              pre_contract_template_name: $pre_contract_template_name
            ) {
              _id
            }
          }
        `,
        variables: {
          pre_contract_template_id,
          pre_contract_template_name,
        },
      })
      .pipe(map((resp) => resp.data['DuplicatePreContractTemplate']));
  }

  getContractTemplateTextTab(templateId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOnePreContractTemplateTab($templateId: ID!) {
            GetOnePreContractTemplatePDF(pre_contract_template_id: $templateId) {
              _id
              template_html
            }
          }
        `,
        variables: {
          templateId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOnePreContractTemplatePDF']));
  }

  importContractProcess(payload, lang, file): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ImportContractProcess($payload: ImportContractProcessInput, $lang: String, $file: Upload!) {
            ImportContractProcess(import_contract_process_input: $payload, lang: $lang, file: $file) {
              imported
              not_imported
            }
          }
        `,
        variables: {
          payload,
          lang,
          file,
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['ImportContractProcess']));
  }

  importAssignmentTableData(file_delimiter, file, lang,user_type_id?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ImportAssignmentTableDataDialog($file_delimiter: String, $lang: String, $file: Upload!,$user_type_id: ID) {
            ImportAssignmentTableData(file_delimiter: $file_delimiter, lang: $lang, file: $file,,user_type_id:$user_type_id)
          }
        `,
        variables: {
          file_delimiter,
          lang,
          file,
          user_type_id:user_type_id? user_type_id:null
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['ImportAssignmentTableData']));
  }

  generatePreContractTemplatePDF(_id: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
        mutation GeneratePreContractTemplatePDF{
          GeneratePreContractTemplatePDF(
            _id: "${_id}",
            is_preview: true
            lang: "${this.translate.currentLang}"
          )
        }
      `,
      })
      .pipe(map((resp) => resp.data['GeneratePreContractTemplatePDF']));
  }

  generateContractTemplatePDF(_id: string, preview: boolean, contractProcessId: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GeneratePreContractTemplatePDF($_id: ID!, $preview: Boolean, $contractProcessId: ID) {
            GeneratePreContractTemplatePDF(_id: $_id, is_preview: $preview, contract_process_id: $contractProcessId)
          }
        `,
        variables: {
          _id,
          preview,
          contractProcessId,
        },
      })
      .pipe(map((resp) => resp.data['GeneratePreContractTemplatePDF']));
  }

  generateContractTemplatePDFfC(_id: string, preview: boolean, fc_contract_process_id: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GeneratePreContractTemplatePDF($_id: ID!, $preview: Boolean, $fc_contract_process_id: ID) {
            GeneratePreContractTemplatePDF(_id: $_id, is_preview: $preview, fc_contract_process_id: $fc_contract_process_id)
          }
        `,
        variables: {
          _id,
          preview,
          fc_contract_process_id,
        },
      })
      .pipe(map((resp) => resp.data['GeneratePreContractTemplatePDF']));
  }

  GetAllProgramsDropdown(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllProgramsDropdown {
            GetAllPrograms {
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
      .pipe(map((resp) => resp.data['GetAllPrograms']));
  }

  GetAllLegalDropdown(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllLegalDropdown {
            GetAllLegalEntities {
              _id
              legal_entity_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllLegalEntities']));
  }

  GetAllPrograms(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllPrograms {
            GetAllPrograms {
              _id
              program
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllPrograms']));
  }

  getPreContractTemplatesDropdown(filter: any): Observable<any[]> {
    return this.apollo
      .watchQuery<{ _id: string; name: string }[]>({
        query: gql`
          query GetPreContractTemplatesDropdown($filter: PreContractTemplateFilterInput) {
            GetAllPreContractTemplates(filter: $filter) {
              _id
              contract_template_name
              is_published
              steps {
                _id
                is_user_who_receive_the_form_as_validator
                validator {
                  _id
                  name
                }
              }
              contract_signatory {
                _id
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllPreContractTemplates']));
  }

  sendContractProcess(contractProcessId: string[], templateId: string, selectAll: boolean, filter): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendContractProcess(
            $contractProcessId: [ID]
            $templateId: ID!
            $selectAll: Boolean
            $filter: ContractProcessFilterInput
            $lang: String
          ) {
            SendContractProcess(
              contract_process_ids: $contractProcessId
              pre_contract_template_id: $templateId
              is_select_all: $selectAll
              filter: $filter
              lang: $lang
            ) {
              _id
            }
          }
        `,
        variables: {
          contractProcessId,
          templateId,
          selectAll,
          filter,
          lang: this.translate.currentLang ? this.translate.currentLang : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SendContractProcess']));
  }

  sendContractProcessWithAssign(
    contractProcessId: string[],
    templateId: string,
    selectAll: boolean,
    filter,
    step_validator_input,
    contract_validator_signatory_status_input,
  ): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendContractProcess(
            $contractProcessId: [ID]
            $templateId: ID!
            $selectAll: Boolean
            $filter: ContractProcessFilterInput
            $step_validator_input: [SendContractProcessStepValidatorInput]
            $contract_validator_signatory_status_input: [SendContractProcessContractValidatorSignatoryStatusInput]
            $lang: String
          ) {
            SendContractProcess(
              contract_process_ids: $contractProcessId
              pre_contract_template_id: $templateId
              is_select_all: $selectAll
              filter: $filter
              step_validator_input: $step_validator_input
              contract_validator_signatory_status_input: $contract_validator_signatory_status_input
              lang: $lang
            ) {
              _id
            }
          }
        `,
        variables: {
          contractProcessId,
          templateId,
          selectAll,
          filter,
          step_validator_input,
          contract_validator_signatory_status_input,
          lang: this.translate.currentLang ? this.translate.currentLang : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SendContractProcess']));
  }

  SendEmailContractProcess(contractProcessId: string, lang: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendEmailContractProcessReminder($contractProcessId: ID!, $lang: String) {
            SendEmailContractProcess(_id: $contractProcessId, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          contractProcessId,
          lang,
        },
      })
      .pipe(map((resp) => resp.data['SendEmailContractProcess']));
  }

  createUpdateContractProcessStepAndQuestion(contract_process_step_input: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation savePreContractForm($contract_process_step_input: CreateUpdateContractProcessStepInput) {
            CreateUpdateContractProcessStepAndQuestion(contract_process_step_input: $contract_process_step_input) {
              _id
            }
          }
        `,
        variables: {
          contract_process_step_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateUpdateContractProcessStepAndQuestion']));
  }

  acceptContractProcessStep(contract_process_id, _id?: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AcceptContractProcessStep($_id: ID, $contract_process_id: ID, $lang: String) {
            AcceptContractProcessStep(_id: $_id, contract_process_id: $contract_process_id, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id: _id ? _id : null,
          contract_process_id,
          lang: this.translate.currentLang ? this.translate.currentLang : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['AcceptContractProcessStep']));
  }

  createUpdateFCContractProcessStepAndQuestion(fc_contract_process_step_input: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateUpdateFCContractProcessStepAndQuestion($fc_contract_process_step_input: CreateUpdateFcContractProcessStepInput) {
            CreateUpdateFCContractProcessStepAndQuestion(fc_contract_process_step_input: $fc_contract_process_step_input) {
              _id
            }
          }
        `,
        variables: {
          fc_contract_process_step_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateUpdateFCContractProcessStepAndQuestion']));
  }

  acceptFCContractProcessStep(fc_contract_process_id, _id?: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AcceptFCContractProcessStep($_id: ID, $fc_contract_process_id: ID, $lang: String) {
            AcceptFCContractProcessStep(_id: $_id, fc_contract_process_id: $fc_contract_process_id, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id: _id ? _id : null,
          fc_contract_process_id,
          lang: this.translate.currentLang ? this.translate.currentLang : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['AcceptFCContractProcessStep']));
  }

  completeRevisionContractProcessStep(_id?: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CompleteRevisionContractProcessStep($_id: ID!, $lang: String) {
            CompleteRevisionContractProcessStep(_id: $_id, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id: _id ? _id : null,
          lang: this.translate.currentLang ? this.translate.currentLang : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['CompleteRevisionContractProcessStep']));
  }

  GeneratePreContractFormSummaryPDF(_id, lang?) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GeneratePreContractFormSummaryPDF($_id: ID!, $lang: String) {
            GeneratePreContractFormSummaryPDF(_id: $_id, lang: $lang)
          }
        `,
        variables: {
          _id,
          lang: lang ? lang : this.translate.currentLang,
        },
      })
      .pipe(map((resp) => resp.data['GeneratePreContractFormSummaryPDF']));
  }

  askRevisionContractProcessStep(_id: string, revise_request_messages: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AskRevisionContractProcessStep(
            $_id: ID
            $revise_request_messages: [ContractProcessStepReviseRequestMessageInput]
            $lang: String
          ) {
            AskRevisionContractProcessStep(_id: $_id, revise_request_messages: $revise_request_messages, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id,
          revise_request_messages,
          lang: this.translate.currentLang ? this.translate.currentLang : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['AskRevisionContractProcessStep']));
  }

  askRevisionContractProcess(_id: string, revise_request_messages: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AskRevisionContractProcess($_id: ID, $revise_request_messages: [ContractProcessReviseRequestMessageInput]) {
            AskRevisionContractProcess(_id: $_id, revise_request_messages: $revise_request_messages) {
              _id
            }
          }
        `,
        variables: {
          _id,
          revise_request_messages,
        },
      })
      .pipe(map((resp) => resp.data['AskRevisionContractProcess']));
  }

  replyRevisionMessageContractProcessStep(_id: string, revise_request_message: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ReplyRevisionMessageContractProcessStep(
            $_id: ID
            $revise_request_message: [ContractProcessStepReviseRequestMessageInput]
            $lang: String
          ) {
            ReplyRevisionMessageContractProcessStep(_id: $_id, revise_request_messages: $revise_request_message, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id,
          revise_request_message,
          lang: this.translate.currentLang ? this.translate.currentLang : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['ReplyRevisionMessageContractProcessStep']));
  }

  replyRevisionMessageContractProcess(_id: string, revise_request_message: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ReplyRevisionMessageContractProcess($_id: ID, $revise_request_message: [ContractProcessReviseRequestMessageInput]) {
            ReplyRevisionMessageContractProcess(_id: $_id, revise_request_messages: $revise_request_message) {
              _id
            }
          }
        `,
        variables: {
          _id,
          revise_request_message,
        },
      })
      .pipe(map((resp) => resp.data['ReplyRevisionMessageContractProcess']));
  }

  GetOneRandomContractProcess(pre_contract_template_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneRandomContractProcess($pre_contract_template_id: ID!) {
            GetOneRandomContractProcess(pre_contract_template_id: $pre_contract_template_id) {
              _id
              scholar_season {
                _id
                scholar_season
              }
              program {
                _id
                program
              }
              school {
                _id
                short_name
              }
              is_final_validator_in_order
              steps {
                _id
                index
                step_title
                step_type
                step_status
                is_validation_required
                is_step_included_in_summary
                revision_user_type {
                  _id
                  name
                }
                validator {
                  _id
                  name
                }
                direction
                step_status
                segments {
                  _id
                  segment_title
                  questions {
                    _id
                    index
                    document_validation_status
                    status
                    is_field
                    field_type
                    field_position
                    is_editable
                    is_required
                    ref_id
                    options
                    answer_type
                    question_label
                    answer
                    answer_multiple
                    answer_number
                    answer_date {
                      date
                      time
                    }
                    special_question {
                      campus_validation(is_parsed: true)
                      summary_header(is_parsed: true)
                      summary_footer(is_parsed: true)
                      document_acceptance_pdf
                    }
                    final_message_question {
                      final_message_image {
                        name
                        s3_file_name
                      }
                      final_message_summary_header
                      final_message_summary_footer
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
              contract_status
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
          pre_contract_template_id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneRandomContractProcess']));
  }

  GetOneContractProcess(pre_contract_template_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneContractProcess($pre_contract_template_id: ID!) {
            GetOneContractProcess(pre_contract_template_id: $pre_contract_template_id) {
              _id
              scholar_season {
                _id
                scholar_season
              }
              program {
                _id
                program
              }
              school {
                _id
                short_name
              }
              is_final_validator_in_order
              steps {
                _id
                step_title
                step_type
                step_status
                is_validation_required
                revision_user_type {
                  _id
                  name
                }
                validator {
                  _id
                  name
                }
                direction
                step_status
                segments {
                  _id
                  segment_title
                  questions {
                    _id
                    index
                    document_validation_status
                    status
                    is_field
                    field_type
                    field_position
                    is_editable
                    is_required
                    ref_id
                    options
                    answer_type
                    question_label
                    answer
                    answer_multiple
                    answer_number
                    answer_date {
                      date
                      time
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
                  message
                }
              }
              contract_status
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
              legal_entity {
                _id
                legal_entity_name
              }
            }
          }
        `,
        variables: {
          pre_contract_template_id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneContractProcess']));
  }

  UpdateContractProcess(_id, contract_process_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateContractProcess($_id: ID, $contract_process_input: ContractProcessInput) {
            UpdateContractProcess(_id: $_id, contract_process_input: $contract_process_input) {
              _id
            }
          }
        `,
        variables: {
          _id,
          contract_process_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateContractProcess']));
  }

  SubmitContractProcess(_id, user_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SubmitContractProcess($_id: ID, $user_id: ID, $lang: String) {
            SubmitContractProcess(_id: $_id, user_id: $user_id, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id,
          user_id,
          lang: this.translate.currentLang ? this.translate.currentLang : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SubmitContractProcess']));
  }

  SubmitContractProcessTeacher(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SubmitContractProcess($_id: ID, $lang: String) {
            SubmitContractProcess(_id: $_id, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id,
          lang: this.translate.currentLang ? this.translate.currentLang : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SubmitContractProcess']));
  }

  ValidateContractProcess(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SubmitContractProcess($_id: ID, $lang: String) {
            SubmitContractProcess(_id: $_id, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id,
          lang: this.translate.currentLang ? this.translate.currentLang : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SubmitContractProcess']));
  }

  GetAllUsers(userType, userName?): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllUsers($userType: [ID!], $userName: String) {
            GetAllUsers(user_type: $userType, last_name: $userName) {
              _id
              first_name
              civility
              last_name
              entities {
                type {
                  _id
                  name
                }
              }
            }
          }
        `,
        variables: {
          userType,
          userName: userName ? userName : null,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  GetAllUsersIncludeStudent(userType, userName?): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllUsers($userType: [ID!], $userName: String) {
            GetAllUsers(user_type: $userType, last_name: $userName, show_student: include_student, pagination: { limit: 300, page: 0 }) {
              _id
              first_name
              civility
              last_name
              entities {
                type {
                  _id
                  name
                }
              }
            }
          }
        `,
        variables: {
          userType,
          userName: userName ? userName : null,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  GetAllUserValidators(user_type, schools?, campuses?, levels?): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllUsers($user_type: [ID!], $schools: [ID], $campuses: [ID], $levels: [ID]) {
            GetAllUsers(user_type: $user_type, schools: $schools, campuses: $campuses, levels: $levels) {
              _id
              first_name
              civility
              last_name
              entities {
                entity_name
                type {
                  _id
                  name
                }
                school {
                  _id
                }
                campus {
                  _id
                }
                level {
                  _id
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
            }
          }
        `,
        variables: {
          user_type,
          schools,
          campuses,
          levels,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  createStepNotificationAndMessage(step_notification_and_message_input): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateStepNotificationAndMessage($step_notification_and_message_input: StepNotificationAndMessageInput) {
            CreateStepNotificationAndMessage(step_notification_and_message_input: $step_notification_and_message_input) {
              _id
            }
          }
        `,
        variables: {
          step_notification_and_message_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateStepNotificationAndMessage']));
  }

  UpdateStepNotificationAndMessage(_id, step_notification_and_message_input): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateStepNotificationAndMessage($_id: ID!, $step_notification_and_message_input: StepNotificationAndMessageInput) {
            UpdateStepNotificationAndMessage(_id: $_id, step_notification_and_message_input: $step_notification_and_message_input) {
              _id
            }
          }
        `,
        variables: {
          _id,
          step_notification_and_message_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateStepNotificationAndMessage']));
  }

  deleteStepNotificationAndMessage(_id): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteStepNotificationAndMessage($_id: ID!) {
            DeleteStepNotificationAndMessage(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteStepNotificationAndMessage']));
  }

  GetAllStepNotificationsAndMessages(pre_contract_template_id, pre_contract_template_step_id, pagination): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStepNotificationsAndMessages(
            $pre_contract_template_id: ID
            $pre_contract_template_step_id: ID
            $pagination: PaginationInput
          ) {
            GetAllStepNotificationsAndMessages(
              pre_contract_template_id: $pre_contract_template_id
              pre_contract_template_step_id: $pre_contract_template_step_id
              pagination: $pagination
            ) {
              _id
              type
              ref_id
              form_builder_id {
                _id
                form_builder_name
              }
              step_id {
                _id
                step_title
                step_type
              }
              recipient_id {
                _id
                name
              }
              recipient_cc_id {
                _id
                name
              }
              signatory_id {
                _id
                name
              }
              is_include_pdf_this_step
              pdf_attachments
              subject
              body
              first_button
              second_button
              status
              pre_contract_template_id {
                _id
              }
              pre_contract_template_step_id {
                _id
              }
              teacher_as_cc
              teacher_as_recipient
            }
          }
        `,
        variables: {
          pre_contract_template_id,
          pre_contract_template_step_id,
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStepNotificationsAndMessages']));
  }

  GetAllStepNotificationsAndMessagesDetail(pre_contract_template_id, pre_contract_template_step_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStepNotificationsAndMessages($pre_contract_template_id: ID, $pre_contract_template_step_id: ID) {
            GetAllStepNotificationsAndMessages(
              pre_contract_template_id: $pre_contract_template_id
              pre_contract_template_step_id: $pre_contract_template_step_id
            ) {
              _id
              type
              ref_id
              form_builder_id {
                _id
                form_builder_name
              }
              step_id {
                _id
                step_title
                step_type
              }
              recipient_id {
                _id
                name
              }
              recipient_cc_id {
                _id
                name
              }
              signatory_id {
                _id
                name
              }
              is_include_pdf_this_step
              pdf_attachments
              subject
              body
              first_button
              second_button
              status
              pre_contract_template_id {
                _id
              }
              pre_contract_template_step_id {
                _id
              }
              teacher_as_cc
              teacher_as_recipient
              teacher_as_signatory
            }
          }
        `,
        variables: {
          pre_contract_template_id,
          pre_contract_template_step_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStepNotificationsAndMessages']));
  }

  GenerateStepMessage(pre_contract_template_step_id, contract_process_id, is_preview): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GenerateStepMessage($pre_contract_template_step_id: ID, $contract_process_id: ID, $is_preview: Boolean) {
            GenerateStepMessage(
              pre_contract_template_step_id: $pre_contract_template_step_id
              contract_process_id: $contract_process_id
              is_preview: $is_preview
            ) {
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
          pre_contract_template_step_id,
          contract_process_id,
          is_preview,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GenerateStepMessage']));
  }

  GenerateStepMessageFC(pre_contract_template_step_id, fc_contract_process_id, is_preview): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GenerateStepMessage($pre_contract_template_step_id: ID, $fc_contract_process_id: ID, $is_preview: Boolean) {
            GenerateStepMessage(
              pre_contract_template_step_id: $pre_contract_template_step_id
              fc_contract_process_id: $fc_contract_process_id
              is_preview: $is_preview
            ) {
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
          pre_contract_template_step_id,
          fc_contract_process_id,
          is_preview,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GenerateStepMessage']));
  }

  generateTeacherContractProcess(teacher_subjects_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GenerateTeacherContractProcessFromTeacherSubject($teacher_subjects_id: [ID!]) {
            GenerateTeacherContractProcessFromTeacherSubject(teacher_subjects_id: $teacher_subjects_id) {
              user_id {
                _id
              }
              civility
              first_name
              last_name
              scholar_season {
                _id
              }
              email
              portable_phone
              phone_number_indicative
              contract_type
              start_date
              end_date
              contract_manager {
                _id
                civility
                first_name
                last_name
              }
              legal_entity {
                _id
                legal_entity_name
              }
              type_of_intervention
              program {
                _id
              }
              subject {
                _id
              }
              volume_hours
              hourly_rate
              total_amount
              paid_leave_allowance_rate
              induced_hours_coefficient
              interventions {
                type_intervention
                program {
                  _id
                }
                total_hours
                hourly_rate
                program_subject_id {
                  _id
                }
                paid_leave_allowance_rate
                induced_hours_coefficient
                program_sequence_id {
                  start_date {
                    date
                    time
                  }
                  end_date {
                    date
                    time
                  }
                }
                course_subject_id {
                  _id
                }
                sequence_id {
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
              campus_id {
                _id
                name
              }
              echelon
              level_name
            }
          }
        `,
        variables: {
          teacher_subjects_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GenerateTeacherContractProcessFromTeacherSubject']));
  }

  SendPreviewStepNotification(pre_contract_template_step_id, contract_process_id, is_preview, user_id): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendPreviewStepNotification(
            $pre_contract_template_step_id: ID
            $contract_process_id: ID
            $is_preview: Boolean
            $user_id: ID
          ) {
            SendPreviewStepNotification(
              pre_contract_template_step_id: $pre_contract_template_step_id
              contract_process_id: $contract_process_id
              is_preview: $is_preview
              user_id: $user_id
            ) {
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
          pre_contract_template_step_id,
          contract_process_id,
          is_preview,
          user_id,
        },
      })
      .pipe(map((resp) => resp.data['RejectAndStopContractProcess']));
  }

  RejectAndStopContractProcess(_id): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation {
            RejectAndStopContractProcess(_id: "${_id}", lang: "${this.translate.currentLang}") {
              _id
              contract_status
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['RejectAndStopContractProcess']));
  }

  submitFCContractProcess(_id, user_id): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SubmitFCContractProcess($_id: ID, $user_id: ID, $lang: String) {
            SubmitFCContractProcess(_id: $_id, user_id: $user_id, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id,
          user_id: user_id ? user_id : null,
          lang: this.translate.currentLang ? this.translate.currentLang : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SubmitFCContractProcess']));
  }

  submitFCContractProcessWithoutUserId(_id): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SubmitFCContractProcess($_id: ID, $lang: String) {
            SubmitFCContractProcess(_id: $_id, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id,
          lang: this.translate.currentLang,
        },
      })
      .pipe(map((resp) => resp.data['SubmitFCContractProcess']));
  }

  updateFcContractProcessStep(_id, update_fc_process_step_input): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateFcContractProcessStep($_id: ID, $update_fc_process_step_input: FcContractProcessStepInput) {
            UpdateFcContractProcessStep(_id: $_id, update_fc_process_step_input: $update_fc_process_step_input) {
              _id
            }
          }
        `,
        variables: {
          _id,
          update_fc_process_step_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateFcContractProcessStep']));
  }

  RejectAndStopFCContractProcess(_id): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation RejectAndStopFCContractProcess{
            RejectAndStopFCContractProcess(_id: "${_id}", lang: "${this.translate.currentLang}") {
              _id
              contract_status
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['RejectAndStopFCContractProcess']));
  }

  DocusignContractProcess(contract_process_id, urlRedirect, user_id?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DocusignContractProcess($contract_process_id: ID, $user_id: ID, $urlRedirect: String, $lang: String) {
            DocusignContractProcess(contract_process_id: $contract_process_id, user_id: $user_id, urlRedirect: $urlRedirect, lang: $lang)
          }
        `,
        variables: {
          contract_process_id,
          urlRedirect,
          user_id,
          lang: this.translate.currentLang ? this.translate.currentLang : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['DocusignContractProcess']));
  }

  DocusignFCContractProcess(fc_contract_process_id, urlRedirect, user_id?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DocusignFCContractProcess($fc_contract_process_id: ID, $user_id: ID, $urlRedirect: String, $lang: String) {
            DocusignFCContractProcess(
              fc_contract_process_id: $fc_contract_process_id
              user_id: $user_id
              urlRedirect: $urlRedirect
              lang: $lang
            )
          }
        `,
        variables: {
          fc_contract_process_id,
          urlRedirect,
          user_id,
          lang: this.translate.currentLang,
        },
      })
      .pipe(map((resp) => resp.data['DocusignFCContractProcess']));
  }

  UpdateDocusignContractProcess(contract_process_id): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateDocusignContractProcess($contract_process_id: ID) {
            UpdateDocusignContractProcess(contract_process_id: $contract_process_id) {
              _id
            }
          }
        `,
        variables: {
          contract_process_id,
        },
      })
      .pipe(map((resp) => resp.data['UpdateDocusignContractProcess']));
  }

  GetProgramSelected(_id: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetProgramSelected{
            GetOneProgram(_id: "${_id}") {
              _id
              program
              paid_leave_allowance_rate
              induced_hours_coefficient
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneProgram']));
  }

  getAllAdmissionFinancements(filter) {
    return this.apollo
      .query({
        query: gql`
          query GetAllAdmissionFinancements($filter: AdmissionFinancementFilterInput) {
            GetAllAdmissionFinancements(filter: $filter) {
              _id
              candidate_id {
                _id
                last_name
                first_name
                civility
              }
              rate_per_hours
              hours
              total
              remaining_due
              document_pdf
              status
              count_document
              is_financement_validated
              actual_status
              organization_name
              organization_type
              additional_information
              organization_id {
                _id
                name
                organization_type
              }
              created_by {
                _id
                first_name
                last_name
              }
              company_branch_id {
                _id
                company_name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .pipe(map((resp) => resp.data['GetAllAdmissionFinancements']));
  }

  GetOneCompany(_id) {
    return this.apollo
      .query({
        query: gql`
          query GetOneCompany($_id: ID) {
            GetOneCompany(_id: $_id) {
              _id
              company_name
              no_RC
              legal_status
              company_addresses {
                address
                is_main_address
              }
              company_entity_id {
                company_name
              }
              company_status
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['GetOneCompany']));
  }

  GetAllUsersMentorCompany(company, company_staff, user_type) {
    return this.apollo
      .query({
        query: gql`
          query GetAllUsersMentorCompany($company: ID, $company_staff: Boolean, $user_type: [ID!]) {
            GetAllUsers(company: $company, company_staff: $company_staff, user_type: $user_type) {
              _id
              first_name
              last_name
              civility
              position
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          company,
          company_staff,
          user_type,
        },
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  GetAllUsersCEOCompany(user_type, company) {
    return this.apollo
      .query({
        query: gql`
          query GetAllUsersCEOCompany($company: ID, $user_type: [ID!]) {
            GetAllUsers(company: $company, user_type: $user_type) {
              _id
              first_name
              last_name
              civility
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          company,
          user_type,
        },
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }
  importModule(file_delimiter, file, lang): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ImportModule($file_delimiter: String, $lang: String, $file: Upload!) {
            ImportModule(file_delimiter: $file_delimiter, lang: $lang, file: $file) {
              module_added {
                name
                status
                message
              }
              module_not_added {
                name
                status
                message
              }
            }
          }
        `,
        variables: {
          file_delimiter,
          lang,
          file,
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['ImportModule']));
  }
  importSubject(file_delimiter, file, lang): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ImportCourseSubject($file_delimiter: String, $lang: String, $file: Upload) {
            ImportCourseSubject(file_delimiter: $file_delimiter, lang: $lang, file: $file) {
              course_subject_added {
                name
                status
                message
              }
              course_subject_not_added {
                name
                status
                message
              }
            }
          }
        `,
        variables: {
          file_delimiter,
          lang,
          file,
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['ImportCourseSubject']));
  }
  getAllCampuses(user_type_login): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllCampuses {
            GetAllCampuses {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCampuses']));
  }
  getAllUsersFinancementOfStudent(candidate_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUsersFinancementOfStudent($candidate_id: ID) {
            GetAllUsersFinancementOfStudent(candidate_id: $candidate_id) {
              _id
              civility
              first_name
              last_name
              entities {
                type {
                  _id
                  name
                }
              }
            }
          }
        `,
        variables:{
          candidate_id
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsersFinancementOfStudent']));
  }
}
