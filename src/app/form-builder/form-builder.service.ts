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

  stepTypeList = ['question_and_field', 'document_expected', 'condition_acceptance', 'academic_journey', 'final_message'];
  stepTypeListForAlumni = ['question_and_field', 'document_expected', 'document_to_validate', 'final_message'];
  stepTypeListForContract = ['question_and_field', 'document_expected', 'step_summary', 'final_message'];
  stepTypeContinousList = [
    'question_and_field',
    'document_expected',
    'summary',
    'step_with_signing_process',
    'final_message',
    'document_to_validate',
  ];

  stepTypeListForStudent = [
    'question_and_field',
    'document_expected',
    'summary',
    'final_message',
    'step_with_signing_process',
    'campus_validation',
    'document_to_validate',
    'down_payment_mode',
    'finance',
    'scholarship_fee',
    'modality_payment',
  ];

  stepTypeListForTeacher = ['question_and_field', 'document_expected', 'summary', 'step_with_signing_process', 'final_message'];
  stepDocumentAdmissionList = ['question_and_field', 'document_expected', 'document_to_validate', 'final_message'];
  validatorList = ['user_receive_form', 'school_admin', 'program_director', 'school_director'];
  statusStepParameterList = [
    'engaged',
    'bill_validated',
    'registered',
    'financement_validated',
    'mission_card_validated',
    'in_scholarship',
    'resigned_after_registered',
    'resigned',
    'resignation_missing_prerequisites',
    'resign_after_school_begins',
    'no_show',
  ];
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
    questionnaireFieldsForAlumni: [
      'alumni_civility',
      'alumni_first_name',
      'alumni_last_name',
      'alumni_last_name_used',
      'alumni_promo_year',
      'alumni_sector',
      'alumni_email',
      'alumni_school',
      'alumni_speciality',
      'alumni_campus',
      'alumni_telephone',
      'alumni_date_of_birth',
      'alumni_address',
      'alumni_zip_code',
      'alumni_country',
      'alumni_city',
      'alumni_department',
      'alumni_region',
      'alumni_professional_status',
      'alumni_job_name',
      'alumni_company',
      'alumni_activity_sector',
      'upload_picture',
      'alumni_rncp_title',
    ],
    questionnaireFieldsForTeacher: [
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
      // 'TEACHER_TYPE_INTERVENTION_1',
      // 'TEACHER_TYPE_INTERVENTION_2',
      // 'TEACHER_TYPE_INTERVENTION_3',
      // 'TEACHER_TYPE_INTERVENTION_4',
      // 'TEACHER_TYPE_INTERVENTION_5',
      // 'TEACHER_TYPE_INTERVENTION_6',
      // 'TEACHER_PROGRAMS_1',
      // 'TEACHER_PROGRAMS_2',
      // 'TEACHER_PROGRAMS_3',
      // 'TEACHER_PROGRAMS_4',
      // 'TEACHER_PROGRAMS_5',
      // 'TEACHER_PROGRAMS_6',
      // 'TEACHER_SUBJECTS_1',
      // 'TEACHER_SUBJECTS_2',
      // 'TEACHER_SUBJECTS_3',
      // 'TEACHER_SUBJECTS_4',
      // 'TEACHER_SUBJECTS_5',
      // 'TEACHER_SUBJECTS_6',
      // 'TEACHER_HOURLY_RATE_1',
      // 'TEACHER_HOURLY_RATE_2',
      // 'TEACHER_HOURLY_RATE_3',
      // 'TEACHER_HOURLY_RATE_4',
      // 'TEACHER_HOURLY_RATE_5',
      // 'TEACHER_HOURLY_RATE_6',
      // 'TEACHER_TOTAL_HOURS_1',
      // 'TEACHER_TOTAL_HOURS_2',
      // 'TEACHER_TOTAL_HOURS_3',
      // 'TEACHER_TOTAL_HOURS_4',
      // 'TEACHER_TOTAL_HOURS_5',
      // 'TEACHER_TOTAL_HOURS_6',
      // 'TEACHER_TRIAL_PERIOD_1',
      // 'TEACHER_TRIAL_PERIOD_2',
      // 'TEACHER_TRIAL_PERIOD_3',
      // 'TEACHER_TRIAL_PERIOD_4',
      // 'TEACHER_TRIAL_PERIOD_5',
      // 'TEACHER_TRIAL_PERIOD_6',
      // 'TEACHER_INDUCED_HOUR_COEFFICIENT_1',
      // 'TEACHER_INDUCED_HOUR_COEFFICIENT_2',
      // 'TEACHER_INDUCED_HOUR_COEFFICIENT_3',
      // 'TEACHER_INDUCED_HOUR_COEFFICIENT_4',
      // 'TEACHER_INDUCED_HOUR_COEFFICIENT_5',
      // 'TEACHER_INDUCED_HOUR_COEFFICIENT_6',
      'EMAIL_SIGNALEMENTS',
      // 'PAID_LEAVE_ALLOWANCE_RATE_1',
      // 'PAID_LEAVE_ALLOWANCE_RATE_2',
      // 'PAID_LEAVE_ALLOWANCE_RATE_3',
      // 'PAID_LEAVE_ALLOWANCE_RATE_4',
      // 'PAID_LEAVE_ALLOWANCE_RATE_5',
      // 'PAID_LEAVE_ALLOWANCE_RATE_6',
      // 'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_1',
      // 'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_2',
      // 'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_3',
      // 'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_4',
      // 'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_5',
      // 'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_6',
      // 'TEACHER_COMPENSATION_PAID_VACATION_1',
      // 'TEACHER_COMPENSATION_PAID_VACATION_2',
      // 'TEACHER_COMPENSATION_PAID_VACATION_3',
      // 'TEACHER_COMPENSATION_PAID_VACATION_4',
      // 'TEACHER_COMPENSATION_PAID_VACATION_5',
      // 'TEACHER_COMPENSATION_PAID_VACATION_6',
      // 'TEACHER_VOLUME_HOURS_INDUCED_1',
      // 'TEACHER_VOLUME_HOURS_INDUCED_2',
      // 'TEACHER_VOLUME_HOURS_INDUCED_3',
      // 'TEACHER_VOLUME_HOURS_INDUCED_4',
      // 'TEACHER_VOLUME_HOURS_INDUCED_5',
      // 'TEACHER_VOLUME_HOURS_INDUCED_6',
      // 'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_1',
      // 'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_2',
      // 'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_3',
      // 'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_4',
      // 'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_5',
      // 'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_6',
      // 'TEACHER_TOTAL_PERIOD_1',
      // 'TEACHER_TOTAL_PERIOD_2',
      // 'TEACHER_TOTAL_PERIOD_3',
      // 'TEACHER_TOTAL_PERIOD_4',
      // 'TEACHER_TOTAL_PERIOD_5',
      // 'TEACHER_TOTAL_PERIOD_6',
      'TOTAL_AMOUNT',
    ],
    questionnaireFieldsForContract: [
      'student_civility',
      'student_first_name',
      'student_last_name',
      'student_address',
      'volume_hour',
      'school',
      'campus',
      'level',
      'sector',
      'speciality',
      'full_rate',
      'campus_address',
      'school_stamp',
      'legal_entity_address',
      'legal_entity_region',
      'legal_entity_siret',
      'start_date',
      'end_date',
      'financer',
      'type_of_financement',
      'company_address',
      'mentor',
      'mentor_function',
      'ceo',
      'company_siret',
      'legal_status',
      'legal_entity_name',
    ],
    documentExpectedFields: ['diploma', 'exemption_block_justification', 'derogation'],
    questionAnswerTypes: [
      { name: 'NUMERIC', key: 'numeric' },
      { name: 'DATE', key: 'date' },
      { name: 'TIME', key: 'time' },
      { name: 'DURATION', key: 'duration' },
      { name: 'EMAIL', key: 'email' },
      { name: 'SHORT_ANSWER', key: 'short_text' },
      { name: 'LONG_ANSWER', key: 'long_text' },
      { name: 'DROPDOWN_MULTIPLE_OPTION', key: 'dropdown_multiple_option' },
      { name: 'DROPDOWN_SINGLE_OPTION', key: 'dropdown_single_option' },
      { name: 'MULTIPLE_OPTION', key: 'multiple_option' },
      { name: 'SINGLE_OPTION', key: 'single_option' },
      { name: 'PARENT_CHILD_OPTION', key: 'parent_child_option' },
      { name: 'SINGLE_OPTION_READMISSION_YES_OR_NO', key: 'single_option_readmission_yes_or_no' },
      { name: 'SINGLE_OPTION_REASON_NOT_READMISSION', key: 'single_option_reason_not_readmission' },
      // { name: 'FREE_TEXT', key: 'free_text' },
      // { name: 'UPLOAD_PICTURE', key: 'upload_picture' },
    ],
    questionAnswerTypesAdmissionDocument: [
      { name: 'NUMERIC', key: 'numeric' },
      { name: 'DATE', key: 'date' },
      { name: 'TIME', key: 'time' },
      { name: 'DURATION', key: 'duration' },
      { name: 'LONG_ANSWER', key: 'long_text' },
      { name: 'SHORT_ANSWER', key: 'short_text' },
      // { name: 'FREE_TEXT', key: 'free_text' },
      { name: 'DROPDOWN_MULTIPLE_OPTION', key: 'dropdown_multiple_option' },
      { name: 'DROPDOWN_SINGLE_OPTION', key: 'dropdown_single_option' },
      { name: 'SINGLE_OPTION', key: 'single_option' },
      { name: 'MULTIPLE_OPTION', key: 'multiple_option' },
      { name: 'EMAIL', key: 'email' },
      { name: 'SINGLE_OPTION_DIPLOMA', key: 'single_option_diploma' },
      { name: 'PARENT_CHILD_OPTION', key: 'parent_child_option' },
      // { name: 'UPLOAD_PICTURE', key: 'upload_picture' },
    ],
    questionAnswerTypesOneTimeForm: [
      { name: 'NUMERIC', key: 'numeric' },
      { name: 'DATE', key: 'date' },
      { name: 'TIME', key: 'time' },
      { name: 'DURATION', key: 'duration' },
      { name: 'EMAIL', key: 'email' },
      { name: 'SHORT_ANSWER', key: 'short_text' },
      { name: 'LONG_ANSWER', key: 'long_text' },
      { name: 'DROPDOWN_MULTIPLE_OPTION', key: 'dropdown_multiple_option' },
      { name: 'DROPDOWN_SINGLE_OPTION', key: 'dropdown_single_option' },
      { name: 'MULTIPLE_OPTION', key: 'multiple_option' },
      { name: 'SINGLE_OPTION', key: 'single_option' },
      { name: 'SINGLE_OPTION_DIPLOMA', key: 'single_option_diploma' },
      { name: 'PARENT_CHILD_OPTION', key: 'parent_child_option' },
      // { name: 'FREE_TEXT', key: 'free_text' },
      // { name: 'UPLOAD_PICTURE', key: 'upload_picture' },
    ],
    questionPositions: ['left', 'right'],
    expectedDocumentTypes: [
      {
        value: 'document_pdf_upload',
        view: 'Document (PDF) Upload',
      },
      {
        value: 'admission_document',
        view: 'Admission document',
      },
    ],

    /*
       if user select 'Modality payment' step type in form builder template detail,
       this list can populate field type list option at question of segment
    */
    modalityPaymentFieldType: [
      'financial_support_link',
      'financial_support_civility',
      'financial_support_first_name',
      'financial_support_last_name',
      'financial_support_phone_number',
      'financial_support_home_phone',
      'financial_support_email',
      'financial_support_address',
      'financial_support_postcode',
      'financial_support_city',
      'financial_support_country',
      'financial_support_departement',
      'financial_support_region',
      'financial_support_account_holder_name',
      'financial_support_iban',
      'financial_support_bic',
      'financial_support_cost',
      'student_acccount_holder_name', // Yes, the c are 3
      'student_iban',
      'student_bic',
      'student_cost',
    ],
    questionAndFieldType: [
      'student_civility',
      'first_name',
      'last_name',
      'used_first_name',
      'used_last_name',
      'phone_number',
      'home_phone',
      'email',
      'date_of_birth',
      'place_of_birth',
      'country_of_birth',
      'city_of_birth',
      'post_code_of_birth',
      'nationality',
      'nationality_second',
      'address',
      'postcode',
      'student_country',
      'city',
      'departement',
      'region',
      'parent_link',
      'parent_civility',
      'parent_first_name',
      'parent_last_name',
      'parent_phone',
      'parent_home_phone',
      'parent_email',
      'parent_address',
      'parent_postcode',
      'parent_city',
      'parent_country',
      'parent_department',
      'parent_region',
      'school_mail',
      'upload_picture',
      'emergency_contact_last_name',
      'emergency_contact_first_name',
      'emergency_contact_email',
      'emergency_contact_telephone',
      'emergency_contact_relation',
      'emergency_contact_address',
      'emergency_contact_city',
      'emergency_contact_zipcode',
      'student_college_name',
      'student_college_city',
      'student_college_zipcode',
      'student_college_country'
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
    questionAndFieldAdmissionDocumentType: [
      'student_civility',
      'first_name',
      'last_name',
      'phone_number',
      'home_phone',
      'email',
      'date_of_birth',
      'place_of_birth',
      'country_of_birth',
      'city_of_birth',
      'post_code_of_birth',
      'nationality',
      'address',
      'postcode',
      'student_country',
      'city',
      'departement',
      'region',
      'parent_link',
      'parent_civility',
      'parent_first_name',
      'parent_last_name',
      'parent_phone',
      'parent_home_phone',
      'parent_email',
      'parent_address',
      'parent_postcode',
      'parent_city',
      'parent_country',
      'parent_department',
      'parent_region',
      'school_mail',
      'upload_picture',
      'cvec_number',
      'ine_number',
      'emergency_contact_last_name',
      'emergency_contact_first_name',
      'emergency_contact_email',
      'emergency_contact_telephone',
      'emergency_contact_relation',
      'emergency_contact_address',
      'emergency_contact_city',
      'emergency_contact_zipcode',
      'student_college_name',
      'student_college_city',
      'student_college_zipcode',
      'student_college_country'
    ],
  };

  conditionTypeList = ['upload_pdf', 'use_from_certification_rule', 'ck_editor'];
  conditionTypeListContinous = ['upload_pdf', 'ck_editor', 'program_condition_document', 'doc_builder'];

  constructor(private apollo: Apollo) {}

  get parentChildValidation() {
    return this._parentChildValidation;
  }

  set parentChildValidation(value: boolean) {
    this._parentChildValidation = value;
  }

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

  getStepTypeListForStudent() {
    return this.stepTypeListForStudent;
  }

  getStepTypeListForTeacher() {
    return this.stepTypeListForTeacher;
  }

  getStepTypeOneTimeForm() {
    return this.stepTypeContinousList;
  }

  getStepTypeAdmissionDocument() {
    return this.stepDocumentAdmissionList;
  }

  getStepTypContractList() {
    return this.stepTypeListForContract;
  }

  getStepTypeForAlumni() {
    return this.stepTypeListForAlumni;
  }

  getValidatorList() {
    return this.validatorList;
  }

  getQuestionnaireConst() {
    return this.QuestionnaireConsts;
  }

  getConditionDocTypeList() {
    return this.conditionTypeListContinous;
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

  updateCurrentStepDetailForm(stepFormObject: any) {
    this.currentStepDetailForm.next(stepFormObject);
  }
  getUserTypesForValidator(): Observable<{ _id: string; name: string }[]> {
    return this.apollo
      .watchQuery<{ _id: string; name: string }[]>({
        query: gql`
          query GetAllUserTypes {
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

  getAllFormBuilders(pagination: { page: number; limit: number }, filter: any, lang: string, sorting?: any): Observable<any[]> {
    return this.apollo
      .watchQuery<{ _id: string; name: string }[]>({
        query: gql`
          query GetAllFormBuilders(
            $pagination: PaginationInput
            $filter: FormBuilderFilterInput
            $lang: String
            $sorting: FormBuilderSortingInput
          ) {
            GetAllFormBuilders(pagination: $pagination, filter: $filter, lang: $lang, sorting: $sorting) {
              _id
              form_builder_name
              created_at
              count_document
              created_by {
                _id
                civility
                first_name
                last_name
                status
              }
              template_type
              is_published
              hide_form
            }
          }
        `,
        variables: {
          pagination,
          filter,
          lang,
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
              step_type
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

  connectAdmissionDocumentTemplateToProgram(form_builder_id, program_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ConnectAdmissionDocumentTemplateToProgram($form_builder_id: ID, $program_ids: [ID]) {
            ConnectAdmissionDocumentTemplateToProgram(form_builder_id: $form_builder_id, program_ids: $program_ids) {
              _id
            }
          }
        `,
        variables: {
          form_builder_id,
          program_ids,
        },
      })
      .pipe(map((resp) => resp.data['ConnectAdmissionDocumentTemplateToProgram']));
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

  getOneFormBuilderForCheckingContractRouter(templateId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getOneFormBuilderForCheckingContractRouter($templateId: ID!) {
            GetOneFormBuilder(_id: $templateId) {
              _id
              form_builder_name
              steps {
                _id
                step_title
                step_type
                segments {
                  _id
                  questions {
                    _id
                    is_router_contract_on
                  }
                }
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
              is_include_flyer
              user_type_signatory_with_initial {
                _id
              }
              validator {
                _id
                name
              }
              is_final_step
              is_include_in_summary
              is_only_visible_based_on_condition
              is_change_candidate_status_after_validated
              candidate_status_after_validated
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
                is_multiple_financial_support
                is_student_included
                questions {
                  _id
                  index
                  is_field
                  field_type
                  field_position
                  is_editable
                  is_required
                  is_router_on
                  is_router_contract_on
                  ref_id
                  answer_type
                  question_label
                  modality_question_type
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
                    campus_validation
                    document_acceptance_type
                    document_acceptance_text
                    document_acceptance_pdf
                    document_builder_scholar_season_id
                    document_builder_id
                    summary_header
                    summary_footer
                    document_acceptance_pdf
                  }
                  options {
                    option_name
                    is_continue_next_step
                    is_go_to_final_step
                    additional_step_id
                    is_go_to_final_message
                    additional_contract_step_id
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

  getOneFormBuilderStepForAlumni(stepId: string): Observable<any> {
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
                  is_router_on
                  options {
                    option_name
                    is_continue_next_step
                    is_go_to_final_message
                    additional_step_id
                  }
                  special_question {
                    summary_header
                    summary_footer
                    campus_validation
                    document_acceptance_type
                    document_acceptance_text
                    document_acceptance_pdf
                    document_builder_scholar_season_id
                    document_builder_id
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
          mutation DeleteFormBuilderStep{
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

  getAllFormBuildersFormationDropdown(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<[]>({
        query: gql`
          query getAllFormBuildersFormationDropdown($filter: FormBuilderFilterInput) {
            GetAllFormBuilders(filter: $filter) {
              _id
              form_builder_name
              is_used_readmission
              is_used_admission
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

  getAllFormBuildersAlumni(): Observable<any[]> {
    return this.apollo
      .watchQuery<[]>({
        query: gql`
          query GetAllFormBuilders {
            GetAllFormBuilders(filter: { status: true, template_type: alumni }) {
              _id
              form_builder_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFormBuilders']));
  }

  getAllFormBuildersTeacher(filter: any): Observable<any[]> {
    return this.apollo
      .watchQuery<[]>({
        query: gql`
          query GetAllFormBuilders($filter: FormBuilderFilterInput) {
            GetAllFormBuilders(filter: $filter) {
              _id
              form_builder_name
              is_published
              steps {
                _id
                step_type
                is_user_who_receive_the_form_as_validator
                validator {
                  _id
                  name
                }
                contract_signatory {
                  _id
                  name
                }
              }
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

  getAllFormBuildersContract(): Observable<any[]> {
    return this.apollo
      .watchQuery<[]>({
        query: gql`
          query GetAllFormBuilders {
            GetAllFormBuilders(filter: { status: true, template_type: fc_contract }) {
              _id
              form_builder_name
              contract_signatory {
                _id
                name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFormBuilders']));
  }

  getStatusStepParameters() {
    return this.statusStepParameterList;
  }

  // document_type is static: bill or registration_certificate
  getDocumentBuilderListOfKeys() {
    return this.apollo
      .query({
        query: gql`
          query GetDocumentBuilderListOfKeys($lang: String) {
            GetDocumentBuilderListOfKeys(document_type: bill, lang: $lang) {
              key
              description
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['GetDocumentBuilderListOfKeys']));
  }

  GetAllStepNotificationsAndMessages(form_builder_id, step_id, pagination): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStepNotificationsAndMessages($form_builder_id: ID, $step_id: ID, $pagination: PaginationInput) {
            GetAllStepNotificationsAndMessages(form_builder_id: $form_builder_id, step_id: $step_id, pagination: $pagination) {
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
              financial_support_as_cc
              is_attach_document_builder
              document_builder_scholar_season {
                _id
                scholar_season
              }
              document_builder_id {
                _id
                document_builder_name
              }
            }
          }
        `,
        variables: {
          form_builder_id,
          step_id,
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStepNotificationsAndMessages']));
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
              document_builder {
                document_builder_scholar_season {
                  _id
                  scholar_season
                }
                document_builder_id {
                  _id
                  document_builder_name
                }
              }
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
              financial_support_as_cc
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

  GetAllStepNotificationsAndMessagesForAlumni(form_builder_id, step_id, pagination): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStepNotificationsAndMessages($form_builder_id: ID, $step_id: ID, $pagination: PaginationInput) {
            GetAllStepNotificationsAndMessages(form_builder_id: $form_builder_id, step_id: $step_id, pagination: $pagination) {
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
            }
          }
        `,
        variables: {
          form_builder_id,
          step_id,
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStepNotificationsAndMessages']));
  }

  GetAllStepNotificationsAndMessagesForContract(form_builder_id, step_id, pagination): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStepNotificationsAndMessages($form_builder_id: ID, $step_id: ID, $pagination: PaginationInput) {
            GetAllStepNotificationsAndMessages(form_builder_id: $form_builder_id, step_id: $step_id, pagination: $pagination) {
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
              is_attach_document_builder
              document_builder_scholar_season {
                _id
              }
              document_builder_id {
                _id
              }
            }
          }
        `,
        variables: {
          form_builder_id,
          step_id,
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStepNotificationsAndMessages']));
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

  getAllFormBuilderKey(filter, lang, form_builder_step_id, sortValue?): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllFormBuilderKey($filter: FilterKeyInput, $lang: String, $form_builder_step_id: ID, $sort: SortingKeyInput) {
            GetAllFormBuilderKey(filter: $filter, lang: $lang, form_builder_step_id: $form_builder_step_id, sorting: $sort) {
              key
              description
            }
          }
        `,
        variables: {
          filter,
          lang,
          form_builder_step_id,
          sort: sortValue ? sortValue : {},
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

  generateFormBuilderStepMessage(step_id, form_process_id, is_preview, trigger_condition): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GenerateFormBuilderStepMessage(
            $step_id: ID
            $form_process_id: ID
            $is_preview: Boolean
            $trigger_condition: EnumStepNotificationAndMessageTriggerCondition
          ) {
            GenerateFormBuilderStepMessage(
              step_id: $step_id
              form_process_id: $form_process_id
              is_preview: $is_preview
              trigger_condition: $trigger_condition
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
        },
      })
      .pipe(map((resp) => resp.data['GenerateFormBuilderStepMessage']));
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
                no_RC
              }
              signatory_user_id {
                _id
                civility
                first_name
                last_name
                full_name
              }
              contact_id {
                _id
                civility
                first_name
                last_name
              }
              mentor_user_id {
                _id
                civility
                first_name
                last_name
                full_name
              }
              billing_modality
              email
              address
              postal_code
              country
              city
              other
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
              candidate_unique_number
              type_of_formation_id {
                type_of_formation
              }
              continuous_formation_manager_id {
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
              admission_member_id {
                _id
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
                name
                times
                additional_expense
                down_payment
                total_amount
                payment_date {
                  date
                  amount
                }
              }
              user_id {
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

  CreateAdmissionFinancement(admission_financement_input): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateAdmissionFinancement($admission_financement_input: AdmissionFinancementInput) {
            CreateAdmissionFinancement(admission_financement_input: $admission_financement_input) {
              _id
            }
          }
        `,
        variables: {
          admission_financement_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateAdmissionFinancement']));
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

  DeleteAdmissionFinancement(_id, amount_splits): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteAdmissionFinancement($_id: ID!, $amount_splits: [AdmissionFinancementAmountSplitsInput]) {
            DeleteAdmissionFinancement(_id: $_id, amount_splits: $amount_splits) {
              _id
            }
          }
        `,
        variables: {
          _id,
          amount_splits,
        },
      })
      .pipe(map((resp) => resp.data['DeleteAdmissionFinancement']));
  }

  GetAllCompanies(filter?) {
    return this.apollo
      .query({
        query: gql`
          query GetAllCompanies($filter: CompanyFilterInput) {
            GetAllCompanies(filter: $filter) {
              _id
              company_name
              mentor_ids {
                _id
                first_name
                civility
                last_name
              }
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCompanies']));
  }

  GetCompanyEtalabBySiret(siret?: string) {
    return this.apollo
      .query({
        query: gql`
          query GetCompanyEtalabBySiret($siret: String) {
            GetCompanyEtalabBySiret(siret: $siret) {
              message
              companies {
                _id
                company_type
                company_name
                type_of_company
                type_of_company_by_year
                no_RC
                activity
                activity_branch
                no_of_employee_in_france
                company_addresses {
                  address
                  postal_code
                  city
                  region
                  department
                  country
                  is_main_address
                }
                status
                company_status
                created_at
                updated_at
                sign_of_the_establishment
                nic
                denomination
                no_rc_of_head_office
                slice_of_salary
                no_of_employee_in_france_code
                no_of_employee_in_france_by_year
                slice_of_salaried_workforce_code
                slice_of_salaried_workforce
                slice_of_salaried_workforce_by_year
                slice_of_salaried_workforce_branch
                created_at_of_head_office
                updated_at_of_head_office
                legal_status
              }
              company_name
            }
          }
        `,
        variables: { siret },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetCompanyEtalabBySiret']));
  }

  createCompanyByCases(message?, company_branch_id?, company_entity_id?, companies?) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateCompanyByCases(
            $message: String
            $companyBranchId: ID
            $companyEntityId: ID
            $companies: [CompanyEtalabBranchEntityInput]
          ) {
            CreateCompanyByCases(
              message: $message
              company_branch_id: $companyBranchId
              company_entity_id: $companyEntityId
              companies: $companies
            ) {
              _id
              no_RC
              company_name
              company_type
              mentor_ids {
                first_name
                last_name
                civility
              }
            }
          }
        `,
        variables: {
          message,
          company_branch_id,
          company_entity_id,
          companies,
        },
      })
      .pipe(map((resp) => resp.data['CreateCompanyByCases']));
  }

  getAllUser(company, userTypeName?) {
    return this.apollo
      .query({
        query: gql`
          query GetAllUsers($company: ID, $companyStaff: Boolean, $userTypeName: String) {
            GetAllUsers(company: $company, company_staff: $companyStaff, user_type_name: $userTypeName) {
              _id
              civility
              first_name
              last_name
              position
            }
          }
        `,
        variables: {
          company,
          companyStaff: true,
          userTypeName,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getAllContact(org_id) {
    return this.apollo
      .query({
        query: gql`
          query GetAllContacts($org_id: ID) {
            GetAllContacts(organization_id: $org_id) {
              _id
              civility
              first_name
              last_name
              position
            }
          }
        `,
        variables: {
          org_id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllContacts']));
  }

  getAllFormBuildersAdmissionDoc(): Observable<any[]> {
    return this.apollo
      .watchQuery<[]>({
        query: gql`
          query GetAllFormBuilders {
            GetAllFormBuilders(filter: { status: true, template_type: admission_document }) {
              _id
              form_builder_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFormBuilders']));
  }

  GetAllOrganizations(filter): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllOrganizations($filter: OrganizationFilterInput) {
            GetAllOrganizations(filter: $filter) {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter: filter,
        },
      })
      .pipe(map((resp) => resp.data['GetAllOrganizations']));
  }

  UpdateAdmissionFinancement(_id, admission_financement_input): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateAdmissionFinancement($admission_financement_input: AdmissionFinancementInput, $_id: ID!, $lang: String) {
            UpdateAdmissionFinancement(admission_financement_input: $admission_financement_input, _id: $_id, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id,
          admission_financement_input,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['UpdateAdmissionFinancement']));
  }

  getAllFormBuildersByTemplate(templateType): Observable<any[]> {
    return this.apollo
      .watchQuery<[]>({
        query: gql`
          query GetAllFormBuilders {
            GetAllFormBuilders(filter: { status: true, template_type: ${templateType}, hide_form: false }) {
              _id
              form_builder_name
              steps {
                _id
                step_type
                contract_signatory {
                  _id
                  name
                }
                validator {
                  _id
                  name
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFormBuilders']));
  }

  sendOneTimeFormToStudent(
    student_ids,
    candidate_ids,
    form_builder_id,
    lang,
    step_validator_input,
    contract_validator_signatory_status,
  ): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendOneTimeFormToStudent(
            $student_ids: [ID]
            $candidate_ids: [ID]
            $form_builder_id: ID
            $lang: String
            $step_validator_input: [SendContractProcessStepValidatorInput]
            $contract_validator_signatory_status: [SendContractProcessContractValidatorSignatoryStatusInput]
          ) {
            SendOneTimeFormToStudent(
              student_ids: $student_ids
              candidate_ids: $candidate_ids
              form_builder_id: $form_builder_id
              lang: $lang
              step_validator_input: $step_validator_input
              contract_validator_signatory_status: $contract_validator_signatory_status
            )
          }
        `,
        variables: {
          student_ids,
          candidate_ids,
          form_builder_id,
          lang,
          step_validator_input,
          contract_validator_signatory_status,
        },
      })
      .pipe(map((resp) => resp.data['SendOneTimeFormToStudent']));
  }

  hideFormBuilderTemplate(templateId, form_builder_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation hideFormBuilderTemplate($templateId: ID!, $form_builder_input: FormBuilderInput) {
            UpdateFormBuilder(_id: $templateId, form_builder_input: $form_builder_input) {
              _id
              hide_form
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
}
