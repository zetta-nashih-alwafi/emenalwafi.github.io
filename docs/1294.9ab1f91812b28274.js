"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[1294],{61294:(g,p,s)=>{s.d(p,{c:()=>m});var i=s(13125),l=s(591),a=s(24850),d=s(94650),u=s(18497);let m=(()=>{class _{constructor(e){this.apollo=e,this._childrenFormValidationStatus=!0,this.contractTemplateSource=new l.X(null),this.contractTemplateData$=this.contractTemplateSource.asObservable(),this.currentStepDetailForm=new l.X(null),this.stepDetailFormData$=this.currentStepDetailForm.asObservable(),this.stepSource=new l.X(null),this.stepData$=this.stepSource.asObservable(),this._parentChildValidation=!0,this._stepState=[],this.stepTypeList=["question_and_field","document_expected","condition_acceptance","academic_journey","final_message"],this.stepTypeListForAlumni=["question_and_field","document_expected","document_to_validate","final_message"],this.stepTypeListForContract=["question_and_field","document_expected","step_summary","final_message"],this.stepTypeContinousList=["question_and_field","document_expected","summary","step_with_signing_process","final_message","document_to_validate"],this.stepTypeListForStudent=["question_and_field","document_expected","summary","final_message","step_with_signing_process","campus_validation","document_to_validate","down_payment_mode","finance","scholarship_fee","modality_payment"],this.stepTypeListForTeacher=["question_and_field","document_expected","summary","step_with_signing_process","final_message"],this.stepDocumentAdmissionList=["question_and_field","document_expected","document_to_validate","final_message"],this.validatorList=["user_receive_form","school_admin","program_director","school_director"],this.statusStepParameterList=["engaged","bill_validated","registered","financement_validated","mission_card_validated","in_scholarship","resigned_after_registered","resigned","resignation_missing_prerequisites","resign_after_school_begins","no_show"],this.listOfLegalStatus=["Artisan-commer\xe7ant","Commer\xe7ant","Artisan","Officier public ou minist\xe9riel","Profession lib\xe9rale","Exploitant agricole","Agent commercial","Associ\xe9 g\xe9rant de Soci\xe9t\xe9","(Autre) Personne physique","Indivision","Soci\xe9t\xe9 cr\xe9\xe9e de fait","Soci\xe9t\xe9 en participation","Fiducie","Paroisse hors zone concordataire","Autre groupement de droit priv\xe9 non dot\xe9 de la personnalit\xe9 morale","Personne morale de droit \xe9tranger, immatricul\xe9e au RCS","Personne morale de droit \xe9tranger, non immatricul\xe9e au RCS","Etablissement public ou r\xe9gie \xe0 caract\xe8re industriel ou commercial","Soci\xe9t\xe9 coop\xe9rative commerciale particuli\xe8re","Soci\xe9t\xe9 en nom collectif","Soci\xe9t\xe9 en commandite","Soci\xe9t\xe9 \xe0 responsabilit\xe9 limit\xe9e (SARL)","Soci\xe9t\xe9 anonyme \xe0 conseil d'administration","Soci\xe9t\xe9 anonyme \xe0 directoire","Soci\xe9t\xe9 par actions simplifi\xe9e","Soci\xe9t\xe9 europ\xe9enne","Caisse d'\xe9pargne et de pr\xe9voyance","Groupement d'int\xe9r\xeat \xe9conomique","Soci\xe9t\xe9 coop\xe9rative agricole","Soci\xe9t\xe9 d'assurance mutuelle","Soci\xe9t\xe9 civile","Autre personne morale de droit priv\xe9 inscrite au registre du commerce et des soci\xe9t\xe9s","Administration de l'\xe9tat","Collectivit\xe9 territoriale","Etablissement public administratif","Autre personne morale de droit public administratif","Organisme g\xe9rant un r\xe9gime de protection sociale \xe0 adh\xe9sion obligatoire","Organisme mutualiste","Comit\xe9 d'entreprise","Organisme professionnel","Organisme de retraite \xe0 adh\xe9sion non obligatoire","Syndicat de propri\xe9taires","Association loi 1901 ou assimil\xe9","Fondation","Autre personne morale de droit priv\xe9"],this.QuestionnaireConsts={fieldTypes:[{value:"date",view:"Date"},{value:"text",view:"Text"},{value:"number",view:"Number"},{value:"pfereferal",view:"PFE Referal"},{value:"jurymember",view:"Jury Member"},{value:"longtext",view:"Long Text"},{value:"signature",view:"Signature"},{value:"correctername",view:"Corrector Name"}],requiredFieldsTypes:[{value:"eventName",view:"Name of the Event",type:"text",removed:!1},{value:"dateRange",view:"Date Range",type:"date",removed:!1},{value:"dateFixed",view:"Date Fixed",type:"date",removed:!1},{value:"titleName",view:"Title Name",type:"text",removed:!1},{value:"status",view:"Status",type:"text",removed:!1}],qualityFileQuestionnaireFields:["student_civility","student_first_name","student_last_name","student_phone","student_email"],questionnaireFields:["student_civility","student_first_name","student_last_name","student_phone","student_email","student_date_of_birth","student_place_of_birth","student_nationality","student_address","student_zipcode","student_country","student_city","student_department","student_region","parent_relation","parent_civility","parent_first_name","parent_last_name","parent_phone","parent_email","parent_address","parent_zipcode","parent_country","parent_city","parent_department","parent_region","student_title","student_class","student_specialization"],questionnaireFieldsForAlumni:["alumni_civility","alumni_first_name","alumni_last_name","alumni_last_name_used","alumni_promo_year","alumni_sector","alumni_email","alumni_school","alumni_speciality","alumni_campus","alumni_telephone","alumni_date_of_birth","alumni_address","alumni_zip_code","alumni_country","alumni_city","alumni_department","alumni_region","alumni_professional_status","alumni_job_name","alumni_company","alumni_activity_sector","upload_picture","alumni_rncp_title"],questionnaireFieldsForTeacher:["TEACHER_CIVILITY","TEACHER_FIRST_NAME","TEACHER_LAST_NAME","TEACHER_MOBILE","TEACHER_EMAIL","CONTRACT_TYPE","START_DATE","END_DATE","EMAIL_SIGNALEMENTS","TOTAL_AMOUNT"],questionnaireFieldsForContract:["student_civility","student_first_name","student_last_name","student_address","volume_hour","school","campus","level","sector","speciality","full_rate","campus_address","school_stamp","legal_entity_address","legal_entity_region","legal_entity_siret","start_date","end_date","financer","type_of_financement","company_address","mentor","mentor_function","ceo","company_siret","legal_status","legal_entity_name"],documentExpectedFields:["diploma","exemption_block_justification","derogation"],questionAnswerTypes:[{name:"NUMERIC",key:"numeric"},{name:"DATE",key:"date"},{name:"TIME",key:"time"},{name:"DURATION",key:"duration"},{name:"EMAIL",key:"email"},{name:"SHORT_ANSWER",key:"short_text"},{name:"LONG_ANSWER",key:"long_text"},{name:"DROPDOWN_MULTIPLE_OPTION",key:"dropdown_multiple_option"},{name:"DROPDOWN_SINGLE_OPTION",key:"dropdown_single_option"},{name:"MULTIPLE_OPTION",key:"multiple_option"},{name:"SINGLE_OPTION",key:"single_option"},{name:"PARENT_CHILD_OPTION",key:"parent_child_option"},{name:"SINGLE_OPTION_READMISSION_YES_OR_NO",key:"single_option_readmission_yes_or_no"},{name:"SINGLE_OPTION_REASON_NOT_READMISSION",key:"single_option_reason_not_readmission"}],questionAnswerTypesAdmissionDocument:[{name:"NUMERIC",key:"numeric"},{name:"DATE",key:"date"},{name:"TIME",key:"time"},{name:"DURATION",key:"duration"},{name:"LONG_ANSWER",key:"long_text"},{name:"SHORT_ANSWER",key:"short_text"},{name:"DROPDOWN_MULTIPLE_OPTION",key:"dropdown_multiple_option"},{name:"DROPDOWN_SINGLE_OPTION",key:"dropdown_single_option"},{name:"SINGLE_OPTION",key:"single_option"},{name:"MULTIPLE_OPTION",key:"multiple_option"},{name:"EMAIL",key:"email"},{name:"SINGLE_OPTION_DIPLOMA",key:"single_option_diploma"},{name:"PARENT_CHILD_OPTION",key:"parent_child_option"}],questionAnswerTypesOneTimeForm:[{name:"NUMERIC",key:"numeric"},{name:"DATE",key:"date"},{name:"TIME",key:"time"},{name:"DURATION",key:"duration"},{name:"EMAIL",key:"email"},{name:"SHORT_ANSWER",key:"short_text"},{name:"LONG_ANSWER",key:"long_text"},{name:"DROPDOWN_MULTIPLE_OPTION",key:"dropdown_multiple_option"},{name:"DROPDOWN_SINGLE_OPTION",key:"dropdown_single_option"},{name:"MULTIPLE_OPTION",key:"multiple_option"},{name:"SINGLE_OPTION",key:"single_option"},{name:"SINGLE_OPTION_DIPLOMA",key:"single_option_diploma"},{name:"PARENT_CHILD_OPTION",key:"parent_child_option"}],questionPositions:["left","right"],expectedDocumentTypes:[{value:"document_pdf_upload",view:"Document (PDF) Upload"},{value:"admission_document",view:"Admission document"}],modalityPaymentFieldType:["financial_support_link","financial_support_civility","financial_support_first_name","financial_support_last_name","financial_support_phone_number","financial_support_home_phone","financial_support_email","financial_support_address","financial_support_postcode","financial_support_city","financial_support_country","financial_support_departement","financial_support_region","financial_support_account_holder_name","financial_support_iban","financial_support_bic","financial_support_cost","student_acccount_holder_name","student_iban","student_bic","student_cost"],questionAndFieldType:["student_civility","first_name","last_name","used_first_name","used_last_name","phone_number","home_phone","email","date_of_birth","place_of_birth","country_of_birth","city_of_birth","post_code_of_birth","nationality","nationality_second","address","postcode","student_country","city","departement","region","parent_link","parent_civility","parent_first_name","parent_last_name","parent_phone","parent_home_phone","parent_email","parent_address","parent_postcode","parent_city","parent_country","parent_department","parent_region","school_mail","upload_picture","emergency_contact_last_name","emergency_contact_first_name","emergency_contact_email","emergency_contact_telephone","emergency_contact_relation","emergency_contact_address","emergency_contact_city","emergency_contact_zipcode","student_college_name","student_college_city","student_college_zipcode","student_college_country"],numericConditions:["Greater than","Greater than or equal to","Less than","Less than or equal to","Equal to","Not equal to","Between","Not between","Whole number"],multipleOptionConditions:["Select at least","Select at most","Select exactly"],textValidationCondition:["Max Character","Min Character"],questionAndFieldAdmissionDocumentType:["student_civility","first_name","last_name","phone_number","home_phone","email","date_of_birth","place_of_birth","country_of_birth","city_of_birth","post_code_of_birth","nationality","address","postcode","student_country","city","departement","region","parent_link","parent_civility","parent_first_name","parent_last_name","parent_phone","parent_home_phone","parent_email","parent_address","parent_postcode","parent_city","parent_country","parent_department","parent_region","school_mail","upload_picture","cvec_number","ine_number","emergency_contact_last_name","emergency_contact_first_name","emergency_contact_email","emergency_contact_telephone","emergency_contact_relation","emergency_contact_address","emergency_contact_city","emergency_contact_zipcode","student_college_name","student_college_city","student_college_zipcode","student_college_country"]},this.conditionTypeList=["upload_pdf","use_from_certification_rule","ck_editor"],this.conditionTypeListContinous=["upload_pdf","ck_editor","program_condition_document","doc_builder"]}get parentChildValidation(){return this._parentChildValidation}set parentChildValidation(e){this._parentChildValidation=e}getContractTemplateData(){return this.contractTemplateSource.getValue()}setContractTemplateData(e){this.contractTemplateSource.next(e)}resetContractTemplateData(){this.contractTemplateSource.next(null)}setStepData(e){this.stepSource.next(e)}getStepTypeList(){return this.stepTypeList}getStepTypeListForStudent(){return this.stepTypeListForStudent}getStepTypeListForTeacher(){return this.stepTypeListForTeacher}getStepTypeOneTimeForm(){return this.stepTypeContinousList}getStepTypeAdmissionDocument(){return this.stepDocumentAdmissionList}getStepTypContractList(){return this.stepTypeListForContract}getStepTypeForAlumni(){return this.stepTypeListForAlumni}getValidatorList(){return this.validatorList}getQuestionnaireConst(){return this.QuestionnaireConsts}getConditionDocTypeList(){return this.conditionTypeListContinous}get childrenFormValidationStatus(){return this._childrenFormValidationStatus}set childrenFormValidationStatus(e){this._childrenFormValidationStatus=e}set stepState(e){this._stepState=e}get stepState(){return this._stepState}setStepStateStatus(e,t){!this._stepState||!this._stepState[e]||(this._stepState[e].completed=t,console.log(this.stepState))}setContractTemplateStep(e,t){const n=this.getContractTemplateData();n&&n.steps&&n.steps[e]&&(n.steps[e]=t,this.setContractTemplateData(n))}updateCurrentStepDetailForm(e){this.currentStepDetailForm.next(e)}getUserTypesForValidator(){return this.apollo.watchQuery({query:i.ZP`
          query GetAllUserTypes {
            GetAllUserTypes(exclude_company: true, show_student_type: include_student) {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllUserTypes))}getAllContractProcesses(e,t,n){return this.apollo.watchQuery({query:i.ZP`
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
        `,variables:{pagination:e,filter:t,sorting:n||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(o=>o.data.GetAllContractProcesses))}getOneContractProcess(e){return this.apollo.query({query:i.ZP`
          query {
            GetOneContractProcess(_id: "${e}") {
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
        `,fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetOneContractProcess))}createContractProcess(e){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateContractProcess($contract_process_input: ContractProcessInput) {
            CreateContractProcess(contract_process_input: $contract_process_input) {
              _id
            }
          }
        `,variables:{contract_process_input:e}}).pipe((0,a.U)(t=>t.data.CreateContractProcess))}updateContractProcess(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateContractProcess($_id: ID, $contract_process_input: ContractProcessInput) {
            UpdateContractProcess(_id: $_id, contract_process_input: $contract_process_input) {
              _id
            }
          }
        `,variables:{_id:e,contract_process_input:t}}).pipe((0,a.U)(n=>n.data.UpdateContractProcess))}getAllFormBuilders(e,t,n,o){return this.apollo.watchQuery({query:i.ZP`
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
        `,variables:{pagination:e,filter:t,lang:n,sorting:o||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(r=>r.data.GetAllFormBuilders))}getAllFormBuilderSteps(e){return this.apollo.query({query:i.ZP`
          query GetAllFormBuilderSteps($filter: FormBuilderStepFilterInput) {
            GetAllFormBuilderSteps(filter: $filter) {
              _id
              step_title
              is_final_step
              step_type
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetAllFormBuilderSteps))}deleteContractProcess(e){return this.apollo.mutate({mutation:i.ZP`
          mutation {
            DeleteContractProcess(_id: "${e}") {
              _id
            }
          }
        `}).pipe((0,a.U)(t=>t.data.DeleteContractProcess))}createFormBuilderTemplate(e){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateFormBuilder($form_builder_input: FormBuilderInput) {
            CreateFormBuilder(form_builder_input: $form_builder_input) {
              _id
            }
          }
        `,variables:{form_builder_input:e}}).pipe((0,a.U)(t=>t.data.CreateFormBuilder))}connectAdmissionDocumentTemplateToProgram(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation ConnectAdmissionDocumentTemplateToProgram($form_builder_id: ID, $program_ids: [ID]) {
            ConnectAdmissionDocumentTemplateToProgram(form_builder_id: $form_builder_id, program_ids: $program_ids) {
              _id
            }
          }
        `,variables:{form_builder_id:e,program_ids:t}}).pipe((0,a.U)(n=>n.data.ConnectAdmissionDocumentTemplateToProgram))}updateFormBuilderTemplate(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateFormBuilder($templateId: ID!, $form_builder_input: FormBuilderInput) {
            UpdateFormBuilder(_id: $templateId, form_builder_input: $form_builder_input) {
              _id
            }
          }
        `,variables:{templateId:e,form_builder_input:t}}).pipe((0,a.U)(n=>n.data.UpdateFormBuilder))}getFormBuilderTemplateFirstTab(e){return this.apollo.query({query:i.ZP`
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
        `,variables:{templateId:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetOneFormBuilder))}getOneFormBuilderForCheckingContractRouter(e){return this.apollo.query({query:i.ZP`
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
        `,variables:{templateId:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetOneFormBuilder))}getOneFormBuilder(e){return this.apollo.query({query:i.ZP`
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
        `,variables:{templateId:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetOneFormBuilder))}getOneFormBuilderStep(e){return this.apollo.query({query:i.ZP`
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
        `,variables:{_id:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetOneFormBuilderStep))}getOneFormBuilderStepForAlumni(e){return this.apollo.query({query:i.ZP`
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
        `,variables:{_id:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetOneFormBuilderStep))}publishContractTemplateFirstTab(e){return this.apollo.mutate({mutation:i.ZP`
          mutation PublishFormBuilder($templateId: ID!) {
            PublishFormBuilder(_id: $templateId) {
              _id
            }
          }
        `,variables:{templateId:e}}).pipe((0,a.U)(t=>t.data.PublishFormBuilder))}unpublishContractTemplateFirstTab(e){return this.apollo.mutate({mutation:i.ZP`
          mutation UnpublishFormBuilder($templateId: ID!) {
            UnpublishFormBuilder(_id: $templateId) {
              _id
            }
          }
        `,variables:{templateId:e}}).pipe((0,a.U)(t=>t.data.UnpublishFormBuilder))}createFormBuilderStep(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateFormBuilderStep($form_builder_id: ID, $form_builder_step_input: FormBuilderStepInput) {
            CreateFormBuilderStep(form_builder_id: $form_builder_id, form_builder_step_input: $form_builder_step_input) {
              _id
              step_title
              step_type
            }
          }
        `,variables:{form_builder_id:e,form_builder_step_input:t}}).pipe((0,a.U)(n=>n.data.CreateFormBuilderStep))}deleteFormBuilderStep(e){return this.apollo.mutate({mutation:i.ZP`
          mutation DeleteFormBuilderStep{
            DeleteFormBuilderStep(_id: "${e}") {
              _id
            }
          }
        `}).pipe((0,a.U)(t=>t.data.DeleteFormBuilderStep))}getAllSubjectsDropdown(){return this.apollo.query({query:i.ZP`
          query GetAllSubjectCourseAndSequences {
            GetAllSubjectCourseAndSequences {
              _id
              short_name
              full_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,a.U)(e=>e.data.GetAllSubjectCourseAndSequences))}deleteFormBuilderTemplate(e){return this.apollo.mutate({mutation:i.ZP`
          mutation DeleteFormBuilderStep{
            DeleteFormBuilder(_id: "${e}") {
              _id
            }
          }
        `}).pipe((0,a.U)(t=>t.data.DeleteFormBuilder))}createUpdateFormBuilderStep(e){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateUpdateFormBuilderStep($form_builder_step_input: CreateUpdateFormBuilderStepInput) {
            CreateUpdateFormBuilderStep(form_builder_step_input: $form_builder_step_input) {
              _id
            }
          }
        `,variables:{form_builder_step_input:e}}).pipe((0,a.U)(t=>t.data.CreateUpdateFormBuilderStep))}createContractTemplateTextTab(e){return this.apollo.mutate({mutation:i.ZP`
          mutation CreatePreContractTemplatePDF($pre_contract_template_pdf_input: PreContractTemplatePDFInput) {
            CreatePreContractTemplatePDF(pre_contract_template_pdf_input: $pre_contract_template_pdf_input) {
              _id
            }
          }
        `,variables:{pre_contract_template_pdf_input:e}}).pipe((0,a.U)(t=>t.data.CreatePreContractTemplatePDF))}updateContractTemplateTextTab(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdatePreContractTemplatePDF($pre_contract_template_pdf_input: PreContractTemplatePDFInput, $pdfId: ID) {
            UpdatePreContractTemplatePDF(pre_contract_template_pdf_input: $pre_contract_template_pdf_input, _id: $pdfId) {
              _id
            }
          }
        `,variables:{pre_contract_template_pdf_input:t,pdfId:e}}).pipe((0,a.U)(n=>n.data.UpdatePreContractTemplatePDF))}getContractTemplateKeysData(e,t){return this.apollo.query({query:i.ZP`
          query GetListPreContractTemplateQuestionRefIds($templateId: ID, $lang: String) {
            GetListPreContractTemplateQuestionRefIds(pre_contract_template_id: $templateId, lang: $lang) {
              key
              description
            }
          }
        `,variables:{templateId:e,lang:t},fetchPolicy:"network-only"}).pipe((0,a.U)(n=>n.data.GetListPreContractTemplateQuestionRefIds))}duplicateContractTemplate(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation DuplicatePreContractTemplate($pre_contract_template_id: ID!, $pre_form_builder_name: String!) {
            DuplicatePreContractTemplate(
              pre_contract_template_id: $pre_contract_template_id
              pre_form_builder_name: $pre_form_builder_name
            ) {
              _id
            }
          }
        `,variables:{pre_contract_template_id:e,pre_form_builder_name:t}}).pipe((0,a.U)(n=>n.data.DuplicatePreContractTemplate))}getContractTemplateTextTab(e){return this.apollo.query({query:i.ZP`
          query GetOnePreContractTemplateTab($templateId: ID!) {
            GetOnePreContractTemplatePDF(pre_contract_template_id: $templateId) {
              _id
              template_html
            }
          }
        `,variables:{templateId:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetOnePreContractTemplatePDF))}importContractProcess(e,t,n){return this.apollo.mutate({mutation:i.ZP`
          mutation ImportContractProcess($payload: ImportContractProcessInput, $lang: String, $file: Upload!) {
            ImportContractProcess(import_contract_process_input: $payload, lang: $lang, file: $file) {
              _id
            }
          }
        `,variables:{payload:e,lang:t,file:n},context:{useMultipart:!0}}).pipe((0,a.U)(o=>o.data.ImportContractProcess))}generatePreContractTemplatePDF(e){return this.apollo.mutate({mutation:i.ZP`
        mutation {
          GeneratePreContractTemplatePDF(
            _id: "${e}",
            is_preview: true
          )
        }
      `}).pipe((0,a.U)(t=>t.data.GeneratePreContractTemplatePDF))}GetAllProgramsDropdown(){return this.apollo.query({query:i.ZP`
          query GetAllProgramsDropdown {
            GetAllPrograms {
              _id
              program
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,a.U)(e=>e.data.GetAllPrograms))}getPreContractTemplatesDropdown(e){return this.apollo.watchQuery({query:i.ZP`
          query GetPreContractTemplatesDropdown($filter: FormBuilderFilterInput) {
            GetAllPreContractTemplates(filter: $filter) {
              _id
              form_builder_name
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllPreContractTemplates))}sendContractProcess(e,t,n,o){return this.apollo.mutate({mutation:i.ZP`
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
        `,variables:{contractProcessId:e,templateId:t,selectAll:n,filter:o}}).pipe((0,a.U)(r=>r.data.SendContractProcess))}SendEmailContractProcess(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation SendEmailContractProcessReminder($contractProcessId: ID!, $lang: String) {
            SendEmailContractProcess(_id: $contractProcessId, lang: $lang) {
              _id
            }
          }
        `,variables:{contractProcessId:e,lang:t}}).pipe((0,a.U)(n=>n.data.SendEmailContractProcess))}createUpdateContractProcessStepAndQuestion(e){return this.apollo.mutate({mutation:i.ZP`
          mutation savePreContractForm($contract_process_step_input: CreateUpdateContractProcessStepInput) {
            CreateUpdateContractProcessStepAndQuestion(contract_process_step_input: $contract_process_step_input) {
              _id
            }
          }
        `,variables:{contract_process_step_input:e}}).pipe((0,a.U)(t=>t.data.CreateUpdateContractProcessStepAndQuestion))}duplicateFormBuilder(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation DuplicateFormBuilder($form_builder_id: ID!, $form_builder_name: String!) {
            DuplicateFormBuilder(form_builder_id: $form_builder_id, form_builder_name: $form_builder_name) {
              _id
            }
          }
        `,variables:{form_builder_id:e,form_builder_name:t}}).pipe((0,a.U)(n=>n.data.DuplicateFormBuilder))}getAllFormBuildersDropdown(e={status:!0}){return this.apollo.watchQuery({query:i.ZP`
          query GetAllFormBuilders($filter: FormBuilderFilterInput) {
            GetAllFormBuilders(filter: $filter) {
              _id
              form_builder_name
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e}}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllFormBuilders))}getAllFormBuildersFormationDropdown(e){return this.apollo.watchQuery({query:i.ZP`
          query getAllFormBuildersFormationDropdown($filter: FormBuilderFilterInput) {
            GetAllFormBuilders(filter: $filter) {
              _id
              form_builder_name
              is_used_readmission
              is_used_admission
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e}}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllFormBuilders))}getAllFormBuildersAlumni(){return this.apollo.watchQuery({query:i.ZP`
          query GetAllFormBuilders {
            GetAllFormBuilders(filter: { status: true, template_type: alumni }) {
              _id
              form_builder_name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllFormBuilders))}getAllFormBuildersTeacher(e){return this.apollo.watchQuery({query:i.ZP`
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
        `,fetchPolicy:"network-only",variables:{filter:e}}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllFormBuilders))}getAllFormBuildersContract(){return this.apollo.watchQuery({query:i.ZP`
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllFormBuilders))}getStatusStepParameters(){return this.statusStepParameterList}getDocumentBuilderListOfKeys(){return this.apollo.query({query:i.ZP`
          query GetDocumentBuilderListOfKeys($lang: String) {
            GetDocumentBuilderListOfKeys(document_type: bill, lang: $lang) {
              key
              description
            }
          }
        `,fetchPolicy:"network-only",variables:{lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,a.U)(e=>e.data.GetDocumentBuilderListOfKeys))}GetAllStepNotificationsAndMessages(e,t,n){return this.apollo.watchQuery({query:i.ZP`
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
        `,variables:{form_builder_id:e,step_id:t,pagination:n},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(o=>o.data.GetAllStepNotificationsAndMessages))}getAllStepNotificationsAndMessages(e,t,n){return this.apollo.watchQuery({query:i.ZP`
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
        `,fetchPolicy:"network-only",variables:{form_builder_id:e,step_id:t,pagination:n}}).valueChanges.pipe((0,a.U)(o=>o.data.GetAllStepNotificationsAndMessages))}createStepNotificationAndMessage(e){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateFormBuilderStepNotificationAndMessage($step_notification_and_message_input: StepNotificationAndMessageInput) {
            CreateFormBuilderStepNotificationAndMessage(step_notification_and_message_input: $step_notification_and_message_input) {
              _id
              type
              ref_id
            }
          }
        `,variables:{step_notification_and_message_input:e}}).pipe((0,a.U)(t=>t.data.CreateFormBuilderStepNotificationAndMessage))}deleteStepNotificationAndMessage(e){return this.apollo.mutate({mutation:i.ZP`
          mutation DeleteStepNotificationAndMessage($_id: ID!) {
            DeleteStepNotificationAndMessage(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:e}}).pipe((0,a.U)(t=>t.data.DeleteStepNotificationAndMessage))}getOneStepNotificationAndMessage(e){return this.apollo.watchQuery({query:i.ZP`
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
        `,fetchPolicy:"network-only",variables:{_id:e}}).valueChanges.pipe((0,a.U)(t=>t.data.GetOneStepNotificationAndMessage))}getOneFormBuilderStepType(e){return this.apollo.query({query:i.ZP`
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
        `,variables:{_id:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetOneFormBuilderStep))}GetAllStepNotificationsAndMessagesForAlumni(e,t,n){return this.apollo.watchQuery({query:i.ZP`
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
        `,variables:{form_builder_id:e,step_id:t,pagination:n},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(o=>o.data.GetAllStepNotificationsAndMessages))}GetAllStepNotificationsAndMessagesForContract(e,t,n){return this.apollo.watchQuery({query:i.ZP`
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
        `,variables:{form_builder_id:e,step_id:t,pagination:n},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(o=>o.data.GetAllStepNotificationsAndMessages))}UpdateStepNotificationAndMessage(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateStepNotificationAndMessage($_id: ID!, $step_notification_and_message_input: StepNotificationAndMessageInput) {
            UpdateStepNotificationAndMessage(_id: $_id, step_notification_and_message_input: $step_notification_and_message_input) {
              _id
            }
          }
        `,variables:{_id:e,step_notification_and_message_input:t}}).pipe((0,a.U)(n=>n.data.UpdateStepNotificationAndMessage))}getAllFormBuilderKey(e,t,n,o){return this.apollo.query({query:i.ZP`
          query GetAllFormBuilderKey($filter: FilterKeyInput, $lang: String, $form_builder_step_id: ID, $sort: SortingKeyInput) {
            GetAllFormBuilderKey(filter: $filter, lang: $lang, form_builder_step_id: $form_builder_step_id, sorting: $sort) {
              key
              description
            }
          }
        `,variables:{filter:e,lang:t,form_builder_step_id:n,sort:o||{}},fetchPolicy:"network-only"}).pipe((0,a.U)(r=>r.data.GetAllFormBuilderKey))}SendPreviewStepNotification(e,t,n,o){return this.apollo.mutate({mutation:i.ZP`
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
        `,variables:{step_id:e,is_preview:t,lang:n,notification_id:o}}).pipe((0,a.U)(r=>r.data.SendPreviewFormBuilderStepNotification))}generateFormBuilderStepMessage(e,t,n,o){return this.apollo.mutate({mutation:i.ZP`
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
        `,variables:{step_id:e,form_process_id:t,is_preview:n,trigger_condition:o}}).pipe((0,a.U)(r=>r.data.GenerateFormBuilderStepMessage))}getAllAdmissionFinancements(e,t){return this.apollo.query({query:i.ZP`
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
        `,fetchPolicy:"network-only",variables:{filter:e,pagination:t}}).pipe((0,a.U)(n=>n.data.GetAllAdmissionFinancements))}getOneCandidateAdmission(e){return this.apollo.query({query:i.ZP`
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
        `,fetchPolicy:"network-only",variables:{_id:e}}).pipe((0,a.U)(t=>t.data.GetOneCandidate))}generateFormBuilderContractTemplatePDF(e,t){return this.apollo.mutate({mutation:i.ZP`
        mutation GenerateFormBuilderContractTemplatePDF{
          GenerateFormBuilderContractTemplatePDF(
            _id: "${e}",
            is_preview: true
            lang: "${t}"
          )
        }
        `}).pipe((0,a.U)(n=>n.data.GenerateFormBuilderContractTemplatePDF))}CreateAdmissionFinancement(e){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateAdmissionFinancement($admission_financement_input: AdmissionFinancementInput) {
            CreateAdmissionFinancement(admission_financement_input: $admission_financement_input) {
              _id
            }
          }
        `,variables:{admission_financement_input:e}}).pipe((0,a.U)(t=>t.data.CreateAdmissionFinancement))}GenerateStepMessage(e,t,n){return this.apollo.mutate({mutation:i.ZP`
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
        `,variables:{step_id:e,form_process_id:t,is_preview:n}}).pipe((0,a.U)(o=>o.data.GenerateFormBuilderStepMessage))}DeleteAdmissionFinancement(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation DeleteAdmissionFinancement($_id: ID!, $amount_splits: [AdmissionFinancementAmountSplitsInput]) {
            DeleteAdmissionFinancement(_id: $_id, amount_splits: $amount_splits) {
              _id
            }
          }
        `,variables:{_id:e,amount_splits:t}}).pipe((0,a.U)(n=>n.data.DeleteAdmissionFinancement))}GetAllCompanies(e){return this.apollo.query({query:i.ZP`
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
        `,variables:{filter:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetAllCompanies))}GetCompanyEtalabBySiret(e){return this.apollo.query({query:i.ZP`
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
        `,variables:{siret:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetCompanyEtalabBySiret))}createCompanyByCases(e,t,n,o){return this.apollo.mutate({mutation:i.ZP`
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
        `,variables:{message:e,company_branch_id:t,company_entity_id:n,companies:o}}).pipe((0,a.U)(r=>r.data.CreateCompanyByCases))}getAllUser(e,t){return this.apollo.query({query:i.ZP`
          query GetAllUsers($company: ID, $companyStaff: Boolean, $userTypeName: String) {
            GetAllUsers(company: $company, company_staff: $companyStaff, user_type_name: $userTypeName) {
              _id
              civility
              first_name
              last_name
              position
            }
          }
        `,variables:{company:e,companyStaff:!0,userTypeName:t},fetchPolicy:"network-only"}).pipe((0,a.U)(n=>n.data.GetAllUsers))}getAllContact(e){return this.apollo.query({query:i.ZP`
          query GetAllContacts($org_id: ID) {
            GetAllContacts(organization_id: $org_id) {
              _id
              civility
              first_name
              last_name
              position
            }
          }
        `,variables:{org_id:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetAllContacts))}getAllFormBuildersAdmissionDoc(){return this.apollo.watchQuery({query:i.ZP`
          query GetAllFormBuilders {
            GetAllFormBuilders(filter: { status: true, template_type: admission_document }) {
              _id
              form_builder_name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllFormBuilders))}GetAllOrganizations(e){return this.apollo.query({query:i.ZP`
          query GetAllOrganizations($filter: OrganizationFilterInput) {
            GetAllOrganizations(filter: $filter) {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e}}).pipe((0,a.U)(t=>t.data.GetAllOrganizations))}UpdateAdmissionFinancement(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateAdmissionFinancement($admission_financement_input: AdmissionFinancementInput, $_id: ID!, $lang: String) {
            UpdateAdmissionFinancement(admission_financement_input: $admission_financement_input, _id: $_id, lang: $lang) {
              _id
            }
          }
        `,variables:{_id:e,admission_financement_input:t,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,a.U)(n=>n.data.UpdateAdmissionFinancement))}getAllFormBuildersByTemplate(e){return this.apollo.watchQuery({query:i.ZP`
          query GetAllFormBuilders {
            GetAllFormBuilders(filter: { status: true, template_type: ${e}, hide_form: false }) {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllFormBuilders))}sendOneTimeFormToStudent(e,t,n,o,r,y){return this.apollo.mutate({mutation:i.ZP`
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
        `,variables:{student_ids:e,candidate_ids:t,form_builder_id:n,lang:o,step_validator_input:r,contract_validator_signatory_status:y}}).pipe((0,a.U)(f=>f.data.SendOneTimeFormToStudent))}hideFormBuilderTemplate(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation hideFormBuilderTemplate($templateId: ID!, $form_builder_input: FormBuilderInput) {
            UpdateFormBuilder(_id: $templateId, form_builder_input: $form_builder_input) {
              _id
              hide_form
            }
          }
        `,variables:{templateId:e,form_builder_input:t}}).pipe((0,a.U)(n=>n.data.UpdateFormBuilder))}}return _.\u0275fac=function(e){return new(e||_)(d.\u0275\u0275inject(u._M))},_.\u0275prov=d.\u0275\u0275defineInjectable({token:_,factory:_.\u0275fac,providedIn:"root"}),_})()}}]);