import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FormBuilderService {
  private _childrenFormValidationStatus: boolean = true;
  private contractTemplateSource = new BehaviorSubject<any>(null);
  public contractTemplateData$ = this.contractTemplateSource.asObservable();
  private currentStepDetailForm = new BehaviorSubject<any>(null);
  public stepDetailFormData$ = this.currentStepDetailForm.asObservable();

  private stepSource = new BehaviorSubject<any>(null);
  public stepData$ = this.stepSource.asObservable();

  private _parentChildValidation: boolean = true;

  _stepState = [];

  // theme$: Observable<[string, boolean]>;

  stepTypeList = [
    'question_and_field',
    'document_expected',
    'condition_acceptance',
    'academic_journey',
    'summary',
    'final_message',
    'step_with_signing_process',
  ];

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
    qualityFileQuestionnaireFields: ['student_civility', 'student_first_name', 'student_last_name', 'student_phone', 'student_email'],
    questionnaireFields: [
      'student_civility',
      'student_first_name',
      'student_last_name',
      'student_phone',
      'student_email',
      'student_date_of_birth',
      'student_place_of_birth',
      'student_nationality',
      'student_address',
      'student_zipcode',
      'student_country',
      'student_city',
      'student_department',
      'student_region',
      'parent_relation',
      'parent_civility',
      'parent_first_name',
      'parent_last_name',
      'parent_phone',
      'parent_email',
      'parent_address',
      'parent_zipcode',
      'parent_country',
      'parent_city',
      'parent_department',
      'parent_region',
      'student_title',
      'student_class',
      'student_specialization',
    ],
    documentExpectedFields: ['diploma', 'exemption_block_justification', 'derogation'],
    questionAnswerTypes: [
      { name: 'NUMERIC', key: 'numeric' },
      { name: 'DATE', key: 'date' },
      { name: 'TIME', key: 'time' },
      { name: 'DURATION', key: 'duration' },
      // { name: 'FREE_TEXT', key: 'free_text' },
      { name: 'EMAIL', key: 'email' },
      { name: 'SHORT_TEXT', key: 'short_text' },
      { name: 'LONG_TEXT', key: 'long_text' },
      { name: 'MULTIPLE_OPTION', key: 'multiple_option' },
      { name: 'DROPDOWN_MULTIPLE_OPTION', key: 'dropdown_multiple_option' },
      { name: 'DROPDOWN_SINGLE_OPTION', key: 'dropdown_single_option' },
      { name: 'SINGLE_OPTION', key: 'single_option' },
      { name: 'PARENT_CHILD_OPTION', key: 'parent_child_option' },
    ],
    questionPositions: ['left', 'right'],
    expectedDocumentTypes: [
      {
        value: 'document_pdf_upload',
        view: 'Document (PDF) Upload',
      },
    ],
    numericConditions: [
      'Greater than',
      'Greater than or equal to',
      'Less than',
      'Less than or equal to',
      'Equal to',
      'Not equal to',
      'Between',
      'Not between',
      'Whole number',
    ],
    multipleOptionConditions: ['Select at least', 'Select at most', 'Select exactly'],
    textValidationCondition: ['Max Character', 'Min Character'],
  };

  listOfLegalStatus = [
    'Artisan-commerçant',
    'Commerçant',
    'Artisan',
    'Officier public ou ministériel',
    'Profession libérale',
    'Exploitant agricole',
    'Agent commercial',
    'Associé gérant de Société',
    '(Autre) Personne physique',
    'Indivision',
    'Société créée de fait',
    'Société en participation',
    'Fiducie',
    'Paroisse hors zone concordataire',
    'Autre groupement de droit privé non doté de la personnalité morale',
    'Personne morale de droit étranger, immatriculée au RCS',
    'Personne morale de droit étranger, non immatriculée au RCS',
    'Etablissement public ou régie à caractère industriel ou commercial',
    'Société coopérative commerciale particulière',
    'Société en nom collectif',
    'Société en commandite',
    'Société à responsabilité limitée (SARL)',
    "Société anonyme à conseil d'administration",
    'Société anonyme à directoire',
    'Société par actions simplifiée',
    'Société européenne',
    "Caisse d'épargne et de prévoyance",
    "Groupement d'intérêt économique",
    'Société coopérative agricole',
    "Société d'assurance mutuelle",
    'Société civile',
    'Autre personne morale de droit privé inscrite au registre du commerce et des sociétés',
    "Administration de l'état",
    'Collectivité territoriale',
    'Etablissement public administratif',
    'Autre personne morale de droit public administratif',
    'Organisme gérant un régime de protection sociale à adhésion obligatoire',
    'Organisme mutualiste',
    "Comité d'entreprise",
    'Organisme professionnel',
    'Organisme de retraite à adhésion non obligatoire',
    'Syndicat de propriétaires',
    'Association loi 1901 ou assimilé',
    'Fondation',
    'Autre personne morale de droit privé',
  ];

  conditionTypeList = ['upload_pdf', 'use_from_certification_rule', 'ck_editor'];

  get parentChildValidation() {
    return this._parentChildValidation;
  }

  set parentChildValidation(value: boolean) {
    this._parentChildValidation = value;
  }

  constructor(private apollo: Apollo) {}

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

  getListOfLegalStatus() {
    return this.listOfLegalStatus;
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

  updateCurrentStepDetailForm(stepFormObject: any) {
    this.currentStepDetailForm.next(stepFormObject);
  }

  getUserTypesForValidator(): Observable<{ _id: string; name: string }[]> {
    return this.apollo
      .watchQuery<{ _id: string; name: string }[]>({
        query: gql`
          query GetUserTypesForValidator{
            GetAllUserTypes(exclude_company: true, show_student_type: include_student) {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getAllContractProcesses(pagination: { page: number; limit: number }, filter: any, sorting?: any): Observable<any[]> {
    return this.apollo
      .watchQuery<{ _id: string; name: string }[]>({
        query: gql`
          query GetAllContractProcesses(
            $pagination: PaginationInput
            $filter: ContractProcessFilterInput
            $sorting: ContractProcessSortingInput
          ) {
            GetAllContractProcesses(pagination: $pagination, filter: $filter, sorting: $sorting) {
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
                step_title
                step_status
              }
              contract_status
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllContractProcesses']));
  }

  getOneContractProcess(_id: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query {
            GetOneContractProcess(_id: "${_id}") {
              _id
              civility
              first_name
              last_name
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
              end_date
              total_hours
              hourly_rate
              steps {
                _id
                step_title
                step_type
                step_status
                is_validation_required
                validator
                direction
                step_status
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
                    answer
                    answer_multiple {
                      type
                    }
                    answer_date {
                      date
                    }
                  }
                }
              }
              contract_status
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneContractProcess']));
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

  getAllFormBuilders(pagination: { page: number; limit: number }, filter: any, sorting?: any): Observable<any[]> {
    return this.apollo
      .watchQuery<{ _id: string; name: string }[]>({
        query: gql`
          query GetAllFormBuilders($pagination: PaginationInput, $filter: FormBuilderFilterInput, $sorting: FormBuilderSortingInput) {
            GetAllFormBuilders(pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
              form_builder_name
              created_at
              count_document
              created_by {
                _id
                civility
                first_name
                last_name
              }
              template_type
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllFormBuilders']));
  }

  getAllFormBuilderSteps(filter: { form_builder_id: string; is_only_visible_based_on_condition: boolean }) {
    return this.apollo
      .query({
        query: gql`
          query GetAllFormBuilderSteps($filter: FormBuilderStepFilterInput) {
            GetAllFormBuilderSteps(filter: $filter) {
              _id
              step_title
              is_final_step
            }
          }
        `,
        variables: { filter },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllFormBuilderSteps']));
  }

  deleteContractProcess(_id: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation {
            DeleteContractProcess(_id: "${_id}") {
              _id
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['DeleteContractProcess']));
  }

  createFormBuilderTemplate(form_builder_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateFormBuilder($form_builder_input: FormBuilderInput) {
            CreateFormBuilder(form_builder_input: $form_builder_input) {
              _id
            }
          }
        `,
        variables: {
          form_builder_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateFormBuilder']));
  }

  updateFormBuilderTemplate(templateId, form_builder_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateFormBuilder($templateId: ID!, $form_builder_input: FormBuilderInput) {
            UpdateFormBuilder(_id: $templateId, form_builder_input: $form_builder_input) {
              _id
            }
          }
        `,
        variables: {
          templateId,
          form_builder_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateFormBuilder']));
  }

  getFormBuilderTemplateFirstTab(templateId): Observable<any> {
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
                is_final_step
                is_only_visible_based_on_condition
              }
              is_contract_signatory_in_order
              is_final_validator_active
              template_type
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
                validator
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
      .pipe(map((resp) => resp.data['GetOneFormBuilder']));
  }

  getOneFormBuilderStep(stepId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneFormBuilderStep($_id: ID!) {
            GetOneFormBuilderStep(_id: $_id) {
              _id
              step_title
              step_type
              is_validation_required
              validator {
                _id
                name
              }
              is_final_step
              is_include_in_summary
              is_only_visible_based_on_condition
              user_who_complete_step {
                _id
                name
              }
              direction
              count_document
              contract_signatory {
                _id
                name
              }
              is_contract_signatory_in_order
              contract_template_pdf
              segments {
                _id
                segment_title
                document_for_condition
                acceptance_text
                acceptance_pdf
                reject_button
                accept_button
                is_rejection_allowed
                is_download_mandatory
                is_on_reject_complete_the_step
                questions {
                  _id
                  index
                  is_field
                  field_type
                  field_position
                  is_editable
                  is_required
                  is_router_on
                  ref_id
                  answer_type
                  question_label
                  text_validation {
                    condition
                    number
                    custom_error_text
                  }
                  numeric_validation {
                    condition
                    number
                    min_number
                    max_number
                    custom_error_text
                  }
                  special_question {
                    summary_header
                    summary_footer
                  }
                  options {
                    option_name
                    is_continue_next_step
                    is_go_to_final_step
                    additional_step_id
                  }
                  final_message_question {
                    final_message_image {
                      name
                      s3_file_name
                    }
                    final_message_summary_header
                    final_message_summary_footer
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
                      question_type
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
                          question_type
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
                              question_type
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
                                  question_type
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
                                      question_type
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
                  count_document
                }
              }
              contract_signatory {
                _id
                name
              }
              is_contract_signatory_in_order
            }
          }
        `,
        variables: {
          _id: stepId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneFormBuilderStep']));
  }

  publishContractTemplateFirstTab(templateId): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation PublishFormBuilder($templateId: ID!) {
            PublishFormBuilder(_id: $templateId) {
              _id
            }
          }
        `,
        variables: {
          templateId,
        },
      })
      .pipe(map((resp) => resp.data['PublishFormBuilder']));
  }

  unpublishContractTemplateFirstTab(templateId): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UnpublishFormBuilder($templateId: ID!) {
            UnpublishFormBuilder(_id: $templateId) {
              _id
            }
          }
        `,
        variables: {
          templateId,
        },
      })
      .pipe(map((resp) => resp.data['UnpublishFormBuilder']));
  }

  createFormBuilderStep(form_builder_id, form_builder_step_input): Observable<{ _id: string; step_title: string }> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateFormBuilderStep($form_builder_id: ID, $form_builder_step_input: FormBuilderStepInput) {
            CreateFormBuilderStep(form_builder_id: $form_builder_id, form_builder_step_input: $form_builder_step_input) {
              _id
              step_title
              step_type
            }
          }
        `,
        variables: {
          form_builder_id,
          form_builder_step_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateFormBuilderStep']));
  }

  deleteFormBuilderStep(_id: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteFormBuilderStep{
            DeleteFormBuilderStep(_id: "${_id}") {
              _id
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['DeleteFormBuilderStep']));
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

  deleteFormBuilderTemplate(_id: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteFormBuilderTemplate{
            DeleteFormBuilder(_id: "${_id}") {
              _id
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['DeleteFormBuilder']));
  }

  createUpdateFormBuilderStep(form_builder_step_input: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateUpdateFormBuilderStep($form_builder_step_input: CreateUpdateFormBuilderStepInput) {
            CreateUpdateFormBuilderStep(form_builder_step_input: $form_builder_step_input) {
              _id
            }
          }
        `,
        variables: {
          form_builder_step_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateUpdateFormBuilderStep']));
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

  duplicateContractTemplate(pre_contract_template_id, pre_form_builder_name): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DuplicatePreContractTemplate($pre_contract_template_id: ID!, $pre_form_builder_name: String!) {
            DuplicatePreContractTemplate(
              pre_contract_template_id: $pre_contract_template_id
              pre_form_builder_name: $pre_form_builder_name
            ) {
              _id
            }
          }
        `,
        variables: {
          pre_contract_template_id,
          pre_form_builder_name,
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
              _id
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

  generatePreContractTemplatePDF(_id: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
        mutation {
          GeneratePreContractTemplatePDF(
            _id: "${_id}",
            is_preview: true
          )
        }
      `,
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
          query GetPreContractTemplatesDropdown($filter: FormBuilderFilterInput) {
            GetAllPreContractTemplates(filter: $filter) {
              _id
              form_builder_name
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
          ) {
            SendContractProcess(
              contract_process_ids: $contractProcessId
              pre_contract_template_id: $templateId
              is_select_all: $selectAll
              filter: $filter
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

  duplicateFormBuilder(form_builder_id, form_builder_name): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DuplicateFormBuilder($form_builder_id: ID!, $form_builder_name: String!) {
            DuplicateFormBuilder(form_builder_id: $form_builder_id, form_builder_name: $form_builder_name) {
              _id
            }
          }
        `,
        variables: {
          form_builder_id,
          form_builder_name,
        },
      })
      .pipe(map((resp) => resp.data['DuplicateFormBuilder']));
  }

  getAllFormBuildersDropdown(filter = { status: true }): Observable<any[]> {
    return this.apollo
      .watchQuery<[]>({
        query: gql`
          query GetAllFormBuilders($filter: FormBuilderFilterInput) {
            GetAllFormBuilders(filter: $filter) {
              _id
              form_builder_name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFormBuilders']));
  }

  getAllStepNotificationsAndMessages(form_builder_id, step_id, pagination): Observable<any[]> {
    return this.apollo
      .watchQuery<[]>({
        query: gql`
          query GetAllStepNotificationsAndMessages($form_builder_id: ID, $step_id: ID, $pagination: PaginationInput) {
            GetAllStepNotificationsAndMessages(form_builder_id: $form_builder_id, step_id: $step_id, pagination: $pagination) {
              _id
              type
              ref_id
              subject
              body
              first_button
              second_button
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          form_builder_id,
          step_id,
          pagination,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStepNotificationsAndMessages']));
  }

  createStepNotificationAndMessage(step_notification_and_message_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateFormBuilderStepNotificationAndMessage($step_notification_and_message_input: StepNotificationAndMessageInput) {
            CreateFormBuilderStepNotificationAndMessage(step_notification_and_message_input: $step_notification_and_message_input) {
              _id
              type
              ref_id
            }
          }
        `,
        variables: {
          step_notification_and_message_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateFormBuilderStepNotificationAndMessage']));
  }

  deleteStepNotificationAndMessage(_id): Observable<any> {
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

  getOneStepNotificationAndMessage(_id): Observable<any> {
    return this.apollo
      .watchQuery<[]>({
        query: gql`
          query GetOneStepNotificationAndMessage($_id: ID!) {
            GetOneStepNotificationAndMessage(_id: $_id) {
              _id
              type
              ref_id
              recipient_id {
                _id
                name
              }
              recipient_cc_id {
                _id
                name
              }
              is_include_pdf_this_step
              pdf_attachments {
                name
                s3_file_name
              }
              subject
              body
              first_button
              second_button
              signatory_id {
                _id
                name
              }
              trigger_condition
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          _id,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneStepNotificationAndMessage']));
  }

  getOneFormBuilderStepType(stepId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneFormBuilderStep($_id: ID!) {
            GetOneFormBuilderStep(_id: $_id) {
              _id
              step_title
              step_type
              is_validation_required
              contract_signatory {
                _id
                name
              }
            }
          }
        `,
        variables: {
          _id: stepId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneFormBuilderStep']));
  }

  updateStepNotificationAndMessage(_id, step_notification_and_message_input): Observable<any> {
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

  getAllFormBuilderKey(filter, lang, form_builder_step_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllFormBuilderKey($filter: FilterKeyInput, $lang: String, $form_builder_step_id: ID) {
            GetAllFormBuilderKey(filter: $filter, lang: $lang, form_builder_step_id: $form_builder_step_id) {
              key
              description
            }
          }
        `,
        variables: {
          filter,
          lang,
          form_builder_step_id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllFormBuilderKey']));
  }

  SendPreviewStepNotification(step_id, is_preview, lang, notification_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendPreviewFormBuilderStepNotification($step_id: ID, $is_preview: Boolean, $lang: String, $notification_id: ID) {
            SendPreviewFormBuilderStepNotification(
              step_id: $step_id
              is_preview: $is_preview
              lang: $lang
              notification_id: $notification_id
            ) {
              _id
            }
          }
        `,
        variables: {
          step_id,
          is_preview,
          lang,
          notification_id,
        },
      })
      .pipe(map((resp) => resp.data['SendPreviewFormBuilderStepNotification']));
  }

  generateFormBuilderStepMessage(step_id, form_process_id, is_preview, trigger_condition, message_id?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GenerateFormBuilderStepMessage(
            $step_id: ID
            $form_process_id: ID
            $is_preview: Boolean
            $trigger_condition: EnumStepNotificationAndMessageTriggerCondition
            $message_id: ID
          ) {
            GenerateFormBuilderStepMessage(
              step_id: $step_id
              form_process_id: $form_process_id
              is_preview: $is_preview
              trigger_condition: $trigger_condition
              message_id: $message_id
            ) {
              _id
              type
              subject
              body
              first_button
              second_button
            }
          }
        `,
        variables: {
          step_id,
          form_process_id,
          is_preview,
          trigger_condition,
          message_id: message_id ? message_id : null,
        },
      })
      .pipe(map((resp) => resp.data['GenerateFormBuilderStepMessage']));
  }

  generateFormBuilderContractTemplatePDF(_id, lang): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
        mutation GenerateFormBuilderContractTemplatePDF{
          GenerateFormBuilderContractTemplatePDF(
            _id: "${_id}",
            is_preview: true
            lang: "${lang}"
          )
        }
        `,
      })
      .pipe(map((resp) => resp.data['GenerateFormBuilderContractTemplatePDF']));
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

  getOneCandidateAdmission(_id) {
    return this.apollo
      .query({
        query: gql`
          query GetOneCandidate($_id: ID!) {
            GetOneCandidate(_id: $_id) {
              _id
              billing_id {
                deposit_pay_amount
              }
              admission_process_id {
                _id
              }
              registration_profile_type
              volume_hour
              school {
                _id
                school_logo
              }
              scholar_season {
                _id
              }
              speciality {
                _id
              }
              campus {
                _id
              }
              level {
                _id
              }
              sector {
                _id
              }
              selected_payment_plan {
                additional_expense
                total_amount
              }
              user_id {
                _id
              }
              registration_profile {
                discount_on_full_rate
                additional_cost_ids {
                  amount
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
      .pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  getAllAdmissionFinancements(filter, pagination) {
    return this.apollo
      .query({
        query: gql`
          query GetAllAdmissionFinancements($filter: AdmissionFinancementFilterInput, $pagination: PaginationInput) {
            GetAllAdmissionFinancements(filter: $filter, pagination: $pagination) {
              _id
              candidate_id {
                _id
                registration_profile_type
                volume_hour
                school {
                  _id
                }
                scholar_season {
                  _id
                }
                speciality {
                  _id
                }
                campus {
                  _id
                }
                level {
                  _id
                }
                sector {
                  _id
                }
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
          pagination,
        },
      })
      .pipe(map((resp) => resp.data['GetAllAdmissionFinancements']));
  }
}
