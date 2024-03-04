"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[3173],{73173:(f,p,_)=>{_.d(p,{c:()=>c});var i=_(13125),l=_(591),a=_(24850),d=_(94650),u=_(18497);let c=(()=>{class s{constructor(e){this.apollo=e,this._childrenFormValidationStatus=!0,this.contractTemplateSource=new l.X(null),this.contractTemplateData$=this.contractTemplateSource.asObservable(),this.stepSource=new l.X(null),this.stepData$=this.stepSource.asObservable(),this._stepState=[],this.stepTypeList=["question_and_field","document_expected","condition_acceptance","academic_journey"],this.stepTypeListForAlumni=["question_and_field","document_expected","document_to_validate"],this.stepTypeListForContract=["question_and_field","document_expected","step_summary"],this.stepTypeContinousList=["question_and_field","document_expected","campus_validation","document_to_validate","step_summary","down_payment_mode","finance","scholarship_fee","modality_payment"],this.validatorList=["user_receive_form","school_admin","program_director","school_director"],this.statusStepParameterList=["engaged","bill_validated","registered","financement_validated","mission_card_validated"],this.listOfLegalStatus=["Artisan-commer\xe7ant","Commer\xe7ant","Artisan","Officier public ou minist\xe9riel","Profession lib\xe9rale","Exploitant agricole","Agent commercial","Associ\xe9 g\xe9rant de Soci\xe9t\xe9","(Autre) Personne physique","Indivision","Soci\xe9t\xe9 cr\xe9\xe9e de fait","Soci\xe9t\xe9 en participation","Fiducie","Paroisse hors zone concordataire","Autre groupement de droit priv\xe9 non dot\xe9 de la personnalit\xe9 morale","Personne morale de droit \xe9tranger, immatricul\xe9e au RCS","Personne morale de droit \xe9tranger, non immatricul\xe9e au RCS","Etablissement public ou r\xe9gie \xe0 caract\xe8re industriel ou commercial","Soci\xe9t\xe9 coop\xe9rative commerciale particuli\xe8re","Soci\xe9t\xe9 en nom collectif","Soci\xe9t\xe9 en commandite","Soci\xe9t\xe9 \xe0 responsabilit\xe9 limit\xe9e (SARL)","Soci\xe9t\xe9 anonyme \xe0 conseil d'administration","Soci\xe9t\xe9 anonyme \xe0 directoire","Soci\xe9t\xe9 par actions simplifi\xe9e","Soci\xe9t\xe9 europ\xe9enne","Caisse d'\xe9pargne et de pr\xe9voyance","Groupement d'int\xe9r\xeat \xe9conomique","Soci\xe9t\xe9 coop\xe9rative agricole","Soci\xe9t\xe9 d'assurance mutuelle","Soci\xe9t\xe9 civile","Autre personne morale de droit priv\xe9 inscrite au registre du commerce et des soci\xe9t\xe9s","Administration de l'\xe9tat","Collectivit\xe9 territoriale","Etablissement public administratif","Autre personne morale de droit public administratif","Organisme g\xe9rant un r\xe9gime de protection sociale \xe0 adh\xe9sion obligatoire","Organisme mutualiste","Comit\xe9 d'entreprise","Organisme professionnel","Organisme de retraite \xe0 adh\xe9sion non obligatoire","Syndicat de propri\xe9taires","Association loi 1901 ou assimil\xe9","Fondation","Autre personne morale de droit priv\xe9"],this.QuestionnaireConsts={fieldTypes:[{value:"date",view:"Date"},{value:"text",view:"Text"},{value:"number",view:"Number"},{value:"pfereferal",view:"PFE Referal"},{value:"jurymember",view:"Jury Member"},{value:"longtext",view:"Long Text"},{value:"signature",view:"Signature"},{value:"correctername",view:"Corrector Name"}],requiredFieldsTypes:[{value:"eventName",view:"Name of the Event",type:"text",removed:!1},{value:"dateRange",view:"Date Range",type:"date",removed:!1},{value:"dateFixed",view:"Date Fixed",type:"date",removed:!1},{value:"titleName",view:"Title Name",type:"text",removed:!1},{value:"status",view:"Status",type:"text",removed:!1}],questionnaireFields:["student_civility","student_first_name","student_last_name","student_phone","student_email","student_date_of_birth","student_place_of_birth","student_nationality","student_address","student_zipcode","student_country","student_city","student_department","student_region","parent_relation","parent_civility","parent_first_name","parent_last_name","parent_phone","parent_email","parent_address","parent_zipcode","parent_country","parent_city","parent_department","parent_region","student_title","student_class","student_specialization"],questionnaireFieldsForAlumni:["alumni_civility","alumni_first_name","alumni_last_name","alumni_last_name_used","alumni_promo_year","alumni_sector","alumni_email","alumni_school","alumni_speciality","alumni_campus","alumni_telephone","alumni_date_of_birth","alumni_address","alumni_zip_code","alumni_country","alumni_city","alumni_department","alumni_region","alumni_professional_status","alumni_job_name","alumni_company","alumni_activity_sector","upload_picture","alumni_rncp_title"],questionnaireFieldsForTeacher:["TEACHER_CIVILITY","TEACHER_FIRST_NAME","TEACHER_LAST_NAME","TEACHER_MOBILE","TEACHER_EMAIL","CONTRACT_TYPE","START_DATE","END_DATE","TEACHER_TYPE_INTERVENTION_1","TEACHER_TYPE_INTERVENTION_2","TEACHER_TYPE_INTERVENTION_3","TEACHER_TYPE_INTERVENTION_4","TEACHER_TYPE_INTERVENTION_5","TEACHER_TYPE_INTERVENTION_6","TEACHER_PROGRAMS_1","TEACHER_PROGRAMS_2","TEACHER_PROGRAMS_3","TEACHER_PROGRAMS_4","TEACHER_PROGRAMS_5","TEACHER_PROGRAMS_6","TEACHER_SUBJECTS_1","TEACHER_SUBJECTS_2","TEACHER_SUBJECTS_3","TEACHER_SUBJECTS_4","TEACHER_SUBJECTS_5","TEACHER_SUBJECTS_6","TEACHER_HOURLY_RATE_1","TEACHER_HOURLY_RATE_2","TEACHER_HOURLY_RATE_3","TEACHER_HOURLY_RATE_4","TEACHER_HOURLY_RATE_5","TEACHER_HOURLY_RATE_6","TEACHER_TOTAL_HOURS_1","TEACHER_TOTAL_HOURS_2","TEACHER_TOTAL_HOURS_3","TEACHER_TOTAL_HOURS_4","TEACHER_TOTAL_HOURS_5","TEACHER_TOTAL_HOURS_6","TEACHER_TRIAL_PERIOD_1","TEACHER_TRIAL_PERIOD_2","TEACHER_TRIAL_PERIOD_3","TEACHER_TRIAL_PERIOD_4","TEACHER_TRIAL_PERIOD_5","TEACHER_TRIAL_PERIOD_6","TEACHER_INDUCED_HOUR_COEFFICIENT_1","TEACHER_INDUCED_HOUR_COEFFICIENT_2","TEACHER_INDUCED_HOUR_COEFFICIENT_3","TEACHER_INDUCED_HOUR_COEFFICIENT_4","TEACHER_INDUCED_HOUR_COEFFICIENT_5","TEACHER_INDUCED_HOUR_COEFFICIENT_6","EMAIL_SIGNALEMENTS","PAID_LEAVE_ALLOWANCE_RATE_1","PAID_LEAVE_ALLOWANCE_RATE_2","PAID_LEAVE_ALLOWANCE_RATE_3","PAID_LEAVE_ALLOWANCE_RATE_4","PAID_LEAVE_ALLOWANCE_RATE_5","PAID_LEAVE_ALLOWANCE_RATE_6","RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_1","RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_2","RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_3","RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_4","RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_5","RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_6","TEACHER_COMPENSATION_PAID_VACATION_1","TEACHER_COMPENSATION_PAID_VACATION_2","TEACHER_COMPENSATION_PAID_VACATION_3","TEACHER_COMPENSATION_PAID_VACATION_4","TEACHER_COMPENSATION_PAID_VACATION_5","TEACHER_COMPENSATION_PAID_VACATION_6","TEACHER_VOLUME_HOURS_INDUCED_1","TEACHER_VOLUME_HOURS_INDUCED_2","TEACHER_VOLUME_HOURS_INDUCED_3","TEACHER_VOLUME_HOURS_INDUCED_4","TEACHER_VOLUME_HOURS_INDUCED_5","TEACHER_VOLUME_HOURS_INDUCED_6","TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_1","TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_2","TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_3","TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_4","TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_5","TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_6","TEACHER_TOTAL_PERIOD_1","TEACHER_TOTAL_PERIOD_2","TEACHER_TOTAL_PERIOD_3","TEACHER_TOTAL_PERIOD_4","TEACHER_TOTAL_PERIOD_5","TEACHER_TOTAL_PERIOD_6","TOTAL_AMOUNT"],questionnaireFieldsForContract:["student_civility","student_first_name","student_last_name","student_address","volume_hour","school","campus","level","sector","speciality","full_rate","campus_address","school_stamp","legal_entity_address","legal_entity_region","legal_entity_siret","start_date","end_date","financer","type_of_financement","company_address","mentor","mentor_function","ceo","company_siret","legal_status","legal_entity_name"],documentExpectedFields:["diploma","exemption_block_justification","derogation"],questionAnswerTypes:[{name:"NUMERIC",key:"numeric"},{name:"DATE",key:"date"},{name:"LONG_ANSWER",key:"long_answer"},{name:"SHORT_ANSWER",key:"free_text"},{name:"DROPDOWN_MULTIPLE_OPTION",key:"dropdown_multiple_option"},{name:"DROPDOWN_SINGLE_OPTION",key:"dropdown_single_option"},{name:"SINGLE_OPTION",key:"single_option"},{name:"MULTIPLE_OPTION",key:"multiple_option"},{name:"EMAIL",key:"email"}],questionPositions:["left","right"],expectedDocumentTypes:[{value:"document_pdf_upload",view:"Document (PDF) Upload"}],modalityPaymentFieldType:["financial_support_link","financial_support_civility","financial_support_first_name","financial_support_last_name","financial_support_phone_number","financial_support_home_phone","financial_support_email","financial_support_address","financial_support_postcode","financial_support_city","financial_support_country","financial_support_departement","financial_support_region","student_iban","student_bic","financial_support_iban","financial_support_bic"],questionAndFieldType:["student_civility","first_name","last_name","phone_number","home_phone","email","date_of_birth","place_of_birth","country_of_birth","city_of_birth","post_code_of_birth","nationality","address","postcode","student_country","city","departement","region","parent_link","parent_civility","parent_first_name","parent_last_name","parent_phone","parent_home_phone","parent_email","parent_address","parent_postcode","parent_city","parent_country","parent_department","parent_region","school_mail","upload_picture"]},this.conditionTypeList=["upload_pdf","use_from_certification_rule","ck_editor"],this.conditionTypeListContinous=["upload_pdf","ck_editor","program_condition_document","doc_builder"],this.conditionTypeListAlumni=["upload_pdf","ck_editor","doc_builder"]}getContractTemplateData(){return this.contractTemplateSource.getValue()}setContractTemplateData(e){this.contractTemplateSource.next(e)}resetContractTemplateData(){this.contractTemplateSource.next(null)}setStepData(e){this.stepSource.next(e)}getStepTypeList(){return this.stepTypeList}getStepTypeContinousList(){return this.stepTypeContinousList}getStepTypContractList(){return this.stepTypeListForContract}getStepTypeForAlumni(){return this.stepTypeListForAlumni}getValidatorList(){return this.validatorList}getQuestionnaireConst(){return this.QuestionnaireConsts}getListOfLegalStatus(){return this.listOfLegalStatus}getConditionDocTypeList(){return this.conditionTypeList}getConditionDocTypeContinousList(){return this.conditionTypeListContinous}getConditionDocTypeAlumniList(){return this.conditionTypeListAlumni}get childrenFormValidationStatus(){return this._childrenFormValidationStatus}set childrenFormValidationStatus(e){this._childrenFormValidationStatus=e}set stepState(e){this._stepState=e}get stepState(){return this._stepState}setStepStateStatus(e,t){!this._stepState||!this._stepState[e]||(this._stepState[e].completed=t,console.log(this.stepState))}setContractTemplateStep(e,t){const r=this.getContractTemplateData();r&&r.steps&&r.steps[e]&&(r.steps[e]=t,this.setContractTemplateData(r))}getUserTypesForValidator(){return this.apollo.watchQuery({query:i.ZP`
          query {
            GetAllUserTypes(exclude_company: true, show_student_type: include_student) {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllUserTypes))}getAllContractProcesses(e,t,r){return this.apollo.watchQuery({query:i.ZP`
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
        `,variables:{pagination:e,filter:t,sorting:r||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(n=>n.data.GetAllContractProcesses))}GetAllOrganizations(e){return this.apollo.query({query:i.ZP`
          query GetAllOrganizations($filter: OrganizationFilterInput) {
            GetAllOrganizations(filter: $filter) {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e}}).pipe((0,a.U)(t=>t.data.GetAllOrganizations))}getOneContractProcess(e){return this.apollo.query({query:i.ZP`
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
        `,variables:{_id:e,contract_process_input:t}}).pipe((0,a.U)(r=>r.data.UpdateContractProcess))}getAllFormBuilders(e,t,r){return this.apollo.watchQuery({query:i.ZP`
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
        `,variables:{pagination:e,filter:t,sorting:r||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(n=>n.data.GetAllFormBuilders))}deleteContractProcess(e){return this.apollo.mutate({mutation:i.ZP`
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
        `,variables:{form_builder_input:e}}).pipe((0,a.U)(t=>t.data.CreateFormBuilder))}updateFormBuilderTemplate(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateFormBuilder($templateId: ID!, $form_builder_input: FormBuilderInput) {
            UpdateFormBuilder(_id: $templateId, form_builder_input: $form_builder_input) {
              _id
            }
          }
        `,variables:{templateId:e,form_builder_input:t}}).pipe((0,a.U)(r=>r.data.UpdateFormBuilder))}getFormBuilderTemplateFirstTab(e){return this.apollo.query({query:i.ZP`
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
                    options
                    count_document
                    special_question {
                      step_type
                      campus_validation
                      document_acceptance_type
                      document_acceptance_text
                      document_acceptance_pdf
                      document_builder_scholar_season_id
                      document_builder_id
                      summary_header
                      summary_footer
                    }
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
        `,variables:{templateId:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetOneFormBuilder))}getContractSignatoryDropdown(e){return this.apollo.query({query:i.ZP`
          query{
            GetOneFormBuilder(_id: "${e}"){
              _id
              contract_signatory{
                _id
                name
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetOneFormBuilder))}getOneFormBuilderStep(e){return this.apollo.query({query:i.ZP`
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
              status
              is_step_included_in_summary
              is_user_who_receive_the_form_as_validator
              is_change_candidate_status_after_validated
              candidate_status_after_validated
              count_document
              segments {
                _id
                segment_title
                document_for_condition
                acceptance_text
                acceptance_pdf
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
                  special_question {
                    step_type
                    campus_validation
                    document_acceptance_type
                    document_acceptance_text
                    document_acceptance_pdf
                    document_builder_scholar_season_id
                    document_builder_id
                    summary_header
                    summary_footer
                  }
                }
              }
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
              status
              count_document
              segments {
                _id
                segment_title
                document_for_condition
                acceptance_text
                acceptance_pdf
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
                  special_question {
                    step_type
                    campus_validation
                    document_acceptance_type
                    document_acceptance_text
                    document_acceptance_pdf
                    document_builder_scholar_season_id
                    document_builder_id
                    summary_header
                    summary_footer
                  }
                }
              }
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
        `,variables:{templateId:e}}).pipe((0,a.U)(t=>t.data.UnpublishFormBuilder))}createFormBuilderStep(e){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateFormBuilderStep($form_builder_step_input: FormBuilderStepInput) {
            CreateFormBuilderStep(form_builder_step_input: $form_builder_step_input) {
              _id
              step_title
            }
          }
        `,variables:{form_builder_step_input:e}}).pipe((0,a.U)(t=>t.data.CreateFormBuilderStep))}deleteFormBuilderStep(e){return this.apollo.mutate({mutation:i.ZP`
          mutation {
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
          mutation {
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
        `,variables:{pre_contract_template_pdf_input:t,pdfId:e}}).pipe((0,a.U)(r=>r.data.UpdatePreContractTemplatePDF))}getContractTemplateKeysData(){return this.apollo.query({query:i.ZP`
          query GetListFormBuilderQuestionRefIds($lang: String) {
            GetListFormBuilderQuestionRefIds(lang: $lang) {
              key
              description
            }
          }
        `,variables:{lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},fetchPolicy:"network-only"}).pipe((0,a.U)(e=>e.data.GetListFormBuilderQuestionRefIds))}getContractTemplateKeysDropdown(e,t){return this.apollo.query({query:i.ZP`
          query GetListPreContractTemplateQuestionRefIds($lang: String, $pre_contract_template_id: ID, $pre_contract_template_step_id: ID) {
            GetListPreContractTemplateQuestionRefIds(
              lang: $lang
              pre_contract_template_id: $pre_contract_template_id
              pre_contract_template_step_id: $pre_contract_template_step_id
            ) {
              key
              description
            }
          }
        `,variables:{lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr",pre_contract_template_id:e,pre_contract_template_step_id:t},fetchPolicy:"network-only"}).pipe((0,a.U)(r=>r.data.GetListPreContractTemplateQuestionRefIds))}getAlumniTemplateKeysData(e,t){return this.apollo.query({query:i.ZP`
          query GetAlumniFormBuilderQuestionRefIds($lang: String, $formBuilderId: ID, $formBuilderStepId: ID) {
            GetAlumniFormBuilderQuestionRefIds(lang: $lang, form_builder_id: $formBuilderId, form_builder_step_id: $formBuilderStepId) {
              key
              description
            }
          }
        `,variables:{lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr",formBuilderId:e,formBuilderStepId:t},fetchPolicy:"network-only"}).pipe((0,a.U)(r=>r.data.GetAlumniFormBuilderQuestionRefIds))}getListFormBuilderQuestionRefIds(){return this.apollo.query({query:i.ZP`
          query GetListFormBuilderQuestionRefIds($lang: String) {
            GetListFormBuilderQuestionRefIds(lang: $lang) {
              key
              description
            }
          }
        `,variables:{lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},fetchPolicy:"network-only"}).pipe((0,a.U)(e=>e.data.GetListFormBuilderQuestionRefIds))}duplicateContractTemplate(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation DuplicatePreContractTemplate($pre_contract_template_id: ID!, $pre_form_builder_name: String!) {
            DuplicatePreContractTemplate(
              pre_contract_template_id: $pre_contract_template_id
              pre_form_builder_name: $pre_form_builder_name
            ) {
              _id
            }
          }
        `,variables:{pre_contract_template_id:e,pre_form_builder_name:t}}).pipe((0,a.U)(r=>r.data.DuplicatePreContractTemplate))}getContractTemplateTextTab(e){return this.apollo.query({query:i.ZP`
          query GetOnePreContractTemplateTab($templateId: ID!) {
            GetOnePreContractTemplatePDF(pre_contract_template_id: $templateId) {
              _id
              template_html
            }
          }
        `,variables:{templateId:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetOnePreContractTemplatePDF))}importContractProcess(e,t,r){return this.apollo.mutate({mutation:i.ZP`
          mutation ImportContractProcess($payload: ImportContractProcessInput, $lang: String, $file: Upload!) {
            ImportContractProcess(import_contract_process_input: $payload, lang: $lang, file: $file) {
              _id
            }
          }
        `,variables:{payload:e,lang:t,file:r},context:{useMultipart:!0}}).pipe((0,a.U)(n=>n.data.ImportContractProcess))}generatePreContractTemplatePDF(e){return this.apollo.mutate({mutation:i.ZP`
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
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllPreContractTemplates))}sendContractProcess(e,t,r,n){return this.apollo.mutate({mutation:i.ZP`
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
        `,variables:{contractProcessId:e,templateId:t,selectAll:r,filter:n}}).pipe((0,a.U)(o=>o.data.SendContractProcess))}SendEmailContractProcess(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation SendEmailContractProcessReminder($contractProcessId: ID!, $lang: String) {
            SendEmailContractProcess(_id: $contractProcessId, lang: $lang) {
              _id
            }
          }
        `,variables:{contractProcessId:e,lang:t}}).pipe((0,a.U)(r=>r.data.SendEmailContractProcess))}createUpdateContractProcessStepAndQuestion(e){return this.apollo.mutate({mutation:i.ZP`
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
        `,variables:{form_builder_id:e,form_builder_name:t}}).pipe((0,a.U)(r=>r.data.DuplicateFormBuilder))}getAllFormBuildersDropdown(e={status:!0}){return this.apollo.watchQuery({query:i.ZP`
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
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e}}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllFormBuilders))}getAllFormBuildersAlumni(){return this.apollo.watchQuery({query:i.ZP`
          query GetAllFormBuilders {
            GetAllFormBuilders(filter: { status: true, template_type: alumni, hide_form: false }) {
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
        `,fetchPolicy:"network-only",variables:{lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,a.U)(e=>e.data.GetDocumentBuilderListOfKeys))}GetAllStepNotificationsAndMessages(e,t,r){return this.apollo.watchQuery({query:i.ZP`
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
            }
          }
        `,variables:{form_builder_id:e,step_id:t,pagination:r},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(n=>n.data.GetAllStepNotificationsAndMessages))}GetAllStepNotificationsAndMessagesForAlumni(e,t,r){return this.apollo.watchQuery({query:i.ZP`
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
        `,variables:{form_builder_id:e,step_id:t,pagination:r},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(n=>n.data.GetAllStepNotificationsAndMessages))}GetAllStepNotificationsAndMessagesForContract(e,t,r){return this.apollo.watchQuery({query:i.ZP`
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
            }
          }
        `,variables:{form_builder_id:e,step_id:t,pagination:r},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(n=>n.data.GetAllStepNotificationsAndMessages))}UpdateStepNotificationAndMessage(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateStepNotificationAndMessage($_id: ID!, $step_notification_and_message_input: StepNotificationAndMessageInput) {
            UpdateStepNotificationAndMessage(_id: $_id, step_notification_and_message_input: $step_notification_and_message_input) {
              _id
            }
          }
        `,variables:{_id:e,step_notification_and_message_input:t}}).pipe((0,a.U)(r=>r.data.UpdateStepNotificationAndMessage))}AcceptStudentAdmissionProcessStep(e,t,r,n,o){return this.apollo.mutate({mutation:i.ZP`
          mutation AcceptSudentAdmissionProcessStep(
            $_id: ID
            $student_admission_process_id: ID!
            $lang: String
            $loggin_user_id: ID
            $is_submit_validation: Boolean
          ) {
            AcceptStudentAdmissionProcessStep(
              _id: $_id
              student_admission_process_id: $student_admission_process_id
              lang: $lang
              loggin_user_id: $loggin_user_id
              is_submit_validation: $is_submit_validation
            ) {
              _id
            }
          }
        `,variables:{_id:t,student_admission_process_id:r,lang:n,loggin_user_id:e,is_submit_validation:!!o}}).pipe((0,a.U)(y=>y.data.StudentAdmissionProcessStep))}deleteStepNotificationAndMessage(e){return this.apollo.mutate({mutation:i.ZP`
          mutation DeleteStepNotificationAndMessage($_id: ID!) {
            DeleteStepNotificationAndMessage(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:e}}).pipe((0,a.U)(t=>t.data.DeleteStepNotificationAndMessage))}createStepNotificationAndMessage(e){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateStepNotificationAndMessage($step_notification_and_message_input: StepNotificationAndMessageInput) {
            CreateStepNotificationAndMessage(step_notification_and_message_input: $step_notification_and_message_input) {
              _id
            }
          }
        `,variables:{step_notification_and_message_input:e}}).pipe((0,a.U)(t=>t.data.CreateStepNotificationAndMessage))}SendPreviewStepNotification(e,t,r,n){return this.apollo.mutate({mutation:i.ZP`
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
        `,variables:{step_id:t,form_process_id:r,is_preview:n,loggin_user_id:e}}).pipe((0,a.U)(o=>o.data.SendPreviewFormBuilderStepNotification))}GetAllStepNotificationsAndMessagesDetail(e,t){return this.apollo.watchQuery({query:i.ZP`
          query GetAllStepNotificationsAndMessages($form_builder_id: ID, $step_id: ID) {
            GetAllStepNotificationsAndMessages(form_builder_id: $form_builder_id, step_id: $step_id) {
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
        `,variables:{form_builder_id:e,step_id:t},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(r=>r.data.GetAllStepNotificationsAndMessages))}GenerateStepMessage(e,t,r){return this.apollo.mutate({mutation:i.ZP`
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
        `,variables:{step_id:e,form_process_id:t,is_preview:r}}).pipe((0,a.U)(n=>n.data.GenerateFormBuilderStepMessage))}getAllAdmissionFinancements(e,t){return this.apollo.query({query:i.ZP`
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
                user_id {
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
        `,fetchPolicy:"network-only",variables:{filter:e,pagination:t}}).pipe((0,a.U)(r=>r.data.GetAllAdmissionFinancements))}getOneCandidateAdmission(e){return this.apollo.query({query:i.ZP`
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
              user_id{
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
        `,fetchPolicy:"network-only",variables:{_id:e}}).pipe((0,a.U)(t=>t.data.GetOneCandidate))}CreateAdmissionFinancement(e){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateAdmissionFinancement($admission_financement_input: AdmissionFinancementInput) {
            CreateAdmissionFinancement(admission_financement_input: $admission_financement_input) {
              _id
            }
          }
        `,variables:{admission_financement_input:e}}).pipe((0,a.U)(t=>t.data.CreateAdmissionFinancement))}UpdateAdmissionFinancement(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateAdmissionFinancement($admission_financement_input: AdmissionFinancementInput, $_id: ID!, $lang: String) {
            UpdateAdmissionFinancement(admission_financement_input: $admission_financement_input, _id: $_id, lang: $lang) {
              _id
            }
          }
        `,variables:{_id:e,admission_financement_input:t,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,a.U)(r=>r.data.UpdateAdmissionFinancement))}DeleteAdmissionFinancement(e){return this.apollo.mutate({mutation:i.ZP`
          mutation DeleteAdmissionFinancement($_id: ID!) {
            DeleteAdmissionFinancement(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:e}}).pipe((0,a.U)(t=>t.data.DeleteAdmissionFinancement))}GetAllCompanies(e){return this.apollo.query({query:i.ZP`
          query GetAllCompanies($filter: CompanyFilterInput) {
            GetAllCompanies(filter: $filter) {
              _id
              company_name
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
        `,variables:{siret:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetCompanyEtalabBySiret))}CreateCompanyByCases(e,t,r,n){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateCompanyByCases(
            $message: String
            $company_branch_id: ID
            $company_entity_id: ID
            $companies: [CompanyEtalabBranchEntityInput]
          ) {
            CreateCompanyByCases(
              message: $message
              company_branch_id: $company_branch_id
              company_entity_id: $company_entity_id
              companies: $companies
            ) {
              _id
              company_type
              no_RC
            }
          }
        `,variables:{message:e,company_branch_id:t,company_entity_id:r,companies:n}}).pipe((0,a.U)(o=>o.data.CreateCompanyByCases))}GetAllUsers(e){return this.apollo.query({query:i.ZP`
        query GetAllUsers($company_id: ID, $company_staff: Boolean) {
          GetAllUsers(company: $company_id, company_staff: $company_staff) {
            _id
            email
            civility
            first_name
            last_name
            full_name
            position
            office_phone
            direct_line
            portable_phone
            entities {
              companies {
                _id
                company_name
              }
              school {
                _id
                short_name
              }
              assigned_rncp_title {
                _id
                short_name
              }
              type {
                _id
                name
              }
              entity_name
            }
            user_status
            count_document
          }
        }
      `,variables:{company_id:e,company_staff:!0},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetAllUsers))}}return s.\u0275fac=function(e){return new(e||s)(d.\u0275\u0275inject(u._M))},s.\u0275prov=d.\u0275\u0275defineInjectable({token:s,factory:s.\u0275fac,providedIn:"root"}),s})()}}]);