"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[1122],{71122:(C,p,_)=>{_.d(p,{I:()=>m});var c=_(591),r=_(13125),i=_(24850),l=_(94650),d=_(89383),u=_(18497);let m=(()=>{class o{constructor(e,t){this.translate=e,this.apollo=t,this._childrenFormValidationStatus=!0,this.contractTemplateSource=new c.X(null),this.contractTemplateData$=this.contractTemplateSource.asObservable(),this.stepSource=new c.X(null),this.stepData$=this.stepSource.asObservable(),this._stepState=[],this.stepTypeList=["question_and_field","document_expected"],this.validatorList=["user_receive_form","school_admin","program_director","school_director"],this.QuestionnaireConsts={fieldTypes:[{value:"date",view:"Date"},{value:"text",view:"Text"},{value:"number",view:"Number"},{value:"pfereferal",view:"PFE Referal"},{value:"jurymember",view:"Jury Member"},{value:"longtext",view:"Long Text"},{value:"signature",view:"Signature"},{value:"correctername",view:"Corrector Name"}],requiredFieldsTypes:[{value:"eventName",view:"Name of the Event",type:"text",removed:!1},{value:"dateRange",view:"Date Range",type:"date",removed:!1},{value:"dateFixed",view:"Date Fixed",type:"date",removed:!1},{value:"titleName",view:"Title Name",type:"text",removed:!1},{value:"status",view:"Status",type:"text",removed:!1}],questionnaireFields:["TEACHER_CIVILITY","TEACHER_FIRST_NAME","TEACHER_LAST_NAME","TEACHER_MOBILE","TEACHER_EMAIL","CONTRACT_TYPE","START_DATE","END_DATE","TEACHER_TYPE_INTERVENTION_1","TEACHER_TYPE_INTERVENTION_2","TEACHER_TYPE_INTERVENTION_3","TEACHER_TYPE_INTERVENTION_4","TEACHER_TYPE_INTERVENTION_5","TEACHER_TYPE_INTERVENTION_6","TEACHER_PROGRAMS_1","TEACHER_PROGRAMS_2","TEACHER_PROGRAMS_3","TEACHER_PROGRAMS_4","TEACHER_PROGRAMS_5","TEACHER_PROGRAMS_6","TEACHER_SUBJECTS_1","TEACHER_SUBJECTS_2","TEACHER_SUBJECTS_3","TEACHER_SUBJECTS_4","TEACHER_SUBJECTS_5","TEACHER_SUBJECTS_6","TEACHER_HOURLY_RATE_1","TEACHER_HOURLY_RATE_2","TEACHER_HOURLY_RATE_3","TEACHER_HOURLY_RATE_4","TEACHER_HOURLY_RATE_5","TEACHER_HOURLY_RATE_6","TEACHER_TOTAL_HOURS_1","TEACHER_TOTAL_HOURS_2","TEACHER_TOTAL_HOURS_3","TEACHER_TOTAL_HOURS_4","TEACHER_TOTAL_HOURS_5","TEACHER_TOTAL_HOURS_6","TEACHER_TRIAL_PERIOD_1","TEACHER_TRIAL_PERIOD_2","TEACHER_TRIAL_PERIOD_3","TEACHER_TRIAL_PERIOD_4","TEACHER_TRIAL_PERIOD_5","TEACHER_TRIAL_PERIOD_6","TEACHER_INDUCED_HOUR_COEFFICIENT_1","TEACHER_INDUCED_HOUR_COEFFICIENT_2","TEACHER_INDUCED_HOUR_COEFFICIENT_3","TEACHER_INDUCED_HOUR_COEFFICIENT_4","TEACHER_INDUCED_HOUR_COEFFICIENT_5","TEACHER_INDUCED_HOUR_COEFFICIENT_6","EMAIL_SIGNALEMENTS","PAID_LEAVE_ALLOWANCE_RATE_1","PAID_LEAVE_ALLOWANCE_RATE_2","PAID_LEAVE_ALLOWANCE_RATE_3","PAID_LEAVE_ALLOWANCE_RATE_4","PAID_LEAVE_ALLOWANCE_RATE_5","PAID_LEAVE_ALLOWANCE_RATE_6","RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_1","RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_2","RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_3","RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_4","RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_5","RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_6","TEACHER_COMPENSATION_PAID_VACATION_1","TEACHER_COMPENSATION_PAID_VACATION_2","TEACHER_COMPENSATION_PAID_VACATION_3","TEACHER_COMPENSATION_PAID_VACATION_4","TEACHER_COMPENSATION_PAID_VACATION_5","TEACHER_COMPENSATION_PAID_VACATION_6","TEACHER_VOLUME_HOURS_INDUCED_1","TEACHER_VOLUME_HOURS_INDUCED_2","TEACHER_VOLUME_HOURS_INDUCED_3","TEACHER_VOLUME_HOURS_INDUCED_4","TEACHER_VOLUME_HOURS_INDUCED_5","TEACHER_VOLUME_HOURS_INDUCED_6","TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_1","TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_2","TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_3","TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_4","TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_5","TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_6","TEACHER_TOTAL_PERIOD_1","TEACHER_TOTAL_PERIOD_2","TEACHER_TOTAL_PERIOD_3","TEACHER_TOTAL_PERIOD_4","TEACHER_TOTAL_PERIOD_5","TEACHER_TOTAL_PERIOD_6","TOTAL_AMOUNT","SCHOLAR_SEASON"],questionAnswerTypes:[{name:"NUMERIC",key:"numeric"},{name:"DATE",key:"date"},{name:"LONG_ANSWER",key:"long_answer"},{name:"SHORT_ANSWER",key:"free_text"},{name:"DROPDOWN_MULTIPLE_OPTION",key:"dropdown_multiple_option"},{name:"DROPDOWN_SINGLE_OPTION",key:"dropdown_single_option"},{name:"SINGLE_OPTION",key:"single_option"},{name:"MULTIPLE_OPTION",key:"multiple_option"},{name:"EMAIL",key:"email"}],questionPositions:["left","right"],expectedDocumentTypes:[{value:"document_pdf_upload",view:"Document (PDF) Upload"}]},this.conditionTypeList=["upload_pdf","use_from_certification_rule","ck_editor"],this.statusStepParameterList=["engaged","bill_validated","registered"]}getContractTemplateData(){return this.contractTemplateSource.getValue()}setContractTemplateData(e){this.contractTemplateSource.next(e)}resetContractTemplateData(){this.contractTemplateSource.next(null)}setStepData(e){this.stepSource.next(e)}getStepTypeList(){return this.stepTypeList}getValidatorList(){return this.validatorList}getQuestionnaireConst(){return this.QuestionnaireConsts}getConditionDocTypeList(){return this.conditionTypeList}getStatusStepParameters(){return this.statusStepParameterList}get childrenFormValidationStatus(){return this._childrenFormValidationStatus}set childrenFormValidationStatus(e){this._childrenFormValidationStatus=e}set stepState(e){this._stepState=e}get stepState(){return this._stepState}setStepStateStatus(e,t){!this._stepState||!this._stepState[e]||(this._stepState[e].completed=t,console.log(this.stepState))}setContractTemplateStep(e,t){const a=this.getContractTemplateData();a&&a.steps&&a.steps[e]&&(a.steps[e]=t,this.setContractTemplateData(a))}getUserTypesForValidator(){return this.apollo.watchQuery({query:r.ZP`
          query GetAllUserTypes{
            GetAllUserTypes(exclude_company: true) {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllUserTypes))}getUserTypesForSignFc(){return this.apollo.watchQuery({query:r.ZP`
          query GetAllUserTypes{
            GetAllUserTypes {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllUserTypes))}getOneUser(e){return this.apollo.query({query:r.ZP`
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
        `,variables:{_id:e},fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetOneUser))}getAllContractProcesses(e,t,a,n){return this.apollo.watchQuery({query:r.ZP`
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
        `,variables:{pagination:e,user_type_id:t,filter:a,sorting:n||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(s=>s.data.GetAllContractProcesses))}getAllFormProcesses(e,t,a){return this.apollo.query({query:r.ZP`
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
        `,variables:{pagination:e,sorting:a||{},filter:t},fetchPolicy:"network-only"}).pipe((0,i.U)(n=>n.data.GetAllFormProcesses))}getAllFormContractManageProcesses(e,t,a,n){return this.apollo.query({query:r.ZP`
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
        `,variables:{pagination:e,sorting:a||{},filter:t,user_type_ids:n},fetchPolicy:"network-only"}).pipe((0,i.U)(s=>s.data.GetAllFormProcesses))}getDataContractForSendForm(e,t,a,n){return this.apollo.query({query:r.ZP`query GetAllFormProcesses($pagination: PaginationInput, $filter: FormProcessFilterInput, $sorting: FormProcessSortingInput, $user_type_ids: [ID])  {
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
      }`,variables:{pagination:e,sorting:a||{},filter:t,user_type_ids:n},fetchPolicy:"network-only"}).pipe((0,i.U)(s=>s.data.GetAllFormProcesses))}getAllSignalementEmailDropdown(e){return this.apollo.query({query:r.ZP`
          query GetAllCandidateSchool($user_type_id: ID) {
            GetAllCandidateSchool(user_type_id: $user_type_id) {
              _id
              short_name
              signalement_email
            }
          }
        `,variables:{user_type_id:e},fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetAllCandidateSchool))}getAllSignalementEmail(){return this.apollo.query({query:r.ZP`
          query GetAllCandidateSchool{
            GetAllCandidateSchool {
              _id
              short_name
              signalement_email
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(e=>e.data.GetAllCandidateSchool))}getAllContractManagerDropdown(){return this.apollo.query({query:r.ZP`
          query GetAllUsers{
            GetAllUsers(user_type: ["6209f2dc74890f0ecad16670"]) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(e=>e.data.GetAllUsers))}getAllLegalRepresentativeDropdown(e){return this.apollo.query({query:r.ZP`
          query GetAllUsers($full_name: String) {
            GetAllUsers(user_type: ["617f64ec5a48fe2228518812"], pagination: { limit: 10, page: 0 }, full_name: $full_name) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,fetchPolicy:"network-only",variables:{full_name:e}}).pipe((0,i.U)(t=>t.data.GetAllUsers))}getContractProcessForm(e){return this.apollo.query({query:r.ZP`
        query GetOneContractProcess{
          GetOneContractProcess(_id: "${e}"){
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
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetOneContractProcess))}GetOneFcContractProcess(e){return this.apollo.query({query:r.ZP`
        query GetOneFcContractProcess($lang: String) {
          GetOneFcContractProcess(_id: "${e}") {
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
                fc_contract_process_id:"${e}"
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
        `,variables:{lang:this.translate.currentLang?this.translate.currentLang:"fr"},fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetOneFcContractProcess))}getOneContractProcess(e,t=!0,a){return this.apollo.query({query:r.ZP`
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
        `,variables:{_id:e,is_parsed:t,lang:a},fetchPolicy:"network-only"}).pipe((0,i.U)(n=>n.data.GetOneContractProcess))}getOneFcContractProcess(e){return this.apollo.query({query:r.ZP`
        query GetOneFcContractProcess($lang: String) {
          GetOneFcContractProcess(_id: "${e}"){
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
                fc_contract_process_id:"${e}"
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
        `,variables:{lang:this.translate.currentLang?this.translate.currentLang:"fr"},fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetOneFcContractProcess))}createContractProcess(e){return this.apollo.mutate({mutation:r.ZP`
          mutation CreateContractProcess($contract_process_input: ContractProcessInput) {
            CreateContractProcess(contract_process_input: $contract_process_input) {
              _id
            }
          }
        `,variables:{contract_process_input:e}}).pipe((0,i.U)(t=>t.data.CreateContractProcess))}createContractProcessAndSend(e){return this.apollo.mutate({mutation:r.ZP`
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
        `,variables:{contract_process_input:e}}).pipe((0,i.U)(t=>t.data.CreateContractProcess))}updateContractProcess(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation UpdateContractProcess($_id: ID, $contract_process_input: ContractProcessInput) {
            UpdateContractProcess(_id: $_id, contract_process_input: $contract_process_input) {
              _id
            }
          }
        `,variables:{_id:e,contract_process_input:t}}).pipe((0,i.U)(a=>a.data.UpdateContractProcess))}updatePreContractTemplate(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation UpdatePreContractTemplate($_id: ID!, $pre_contract_template_input: PreContractTemplateInput) {
            UpdatePreContractTemplate(_id: $_id, pre_contract_template_input: $pre_contract_template_input) {
              _id
            }
          }
        `,variables:{_id:e,pre_contract_template_input:t}}).pipe((0,i.U)(a=>a.data.UpdatePreContractTemplate))}getAllPreContractTemplates(e,t,a){return this.apollo.watchQuery({query:r.ZP`
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
        `,variables:{pagination:e,filter:t,sorting:a||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(n=>n.data.GetAllPreContractTemplates))}deleteContractProcess(e){return this.apollo.mutate({mutation:r.ZP`
          mutation DeleteContractProcess{
            DeleteContractProcess(_id: "${e}") {
              _id
            }
          }
        `}).pipe((0,i.U)(t=>t.data.DeleteContractProcess))}createContractTemplate(e){return this.apollo.mutate({mutation:r.ZP`
          mutation CreatePreContractTemplate($pre_contract_template_input: PreContractTemplateInput) {
            CreatePreContractTemplate(pre_contract_template_input: $pre_contract_template_input) {
              _id
            }
          }
        `,variables:{pre_contract_template_input:e}}).pipe((0,i.U)(t=>t.data.CreatePreContractTemplate))}updateContractTemplate(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation UpdatePreContractTemplate($templateId: ID!, $pre_contract_template_input: PreContractTemplateInput) {
            UpdatePreContractTemplate(_id: $templateId, pre_contract_template_input: $pre_contract_template_input) {
              _id
            }
          }
        `,variables:{templateId:e,pre_contract_template_input:t}}).pipe((0,i.U)(a=>a.data.UpdatePreContractTemplate))}getContractTemplateFirstTab(e){return this.apollo.query({query:r.ZP`
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
        `,variables:{templateId:e},fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetOnePreContractTemplate))}getOneContractTemplate(e){return this.apollo.query({query:r.ZP`
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
        `,variables:{templateId:e},fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetOnePreContractTemplate))}getOnePreContractTemplate(e){return this.apollo.query({query:r.ZP`
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
        `,variables:{_id:e},fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetOnePreContractTemplate))}getOnePreContractTemplateStep(e){return this.apollo.query({query:r.ZP`
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
        `,variables:{_id:e},fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetOnePreContractTemplateStep))}publishContractTemplateFirstTab(e){return this.apollo.mutate({mutation:r.ZP`
          mutation PublishPreContractTemplate($templateId: ID!) {
            PublishPreContractTemplate(_id: $templateId) {
              _id
            }
          }
        `,variables:{templateId:e}}).pipe((0,i.U)(t=>t.data.PublishPreContractTemplate))}createContractTemplateStep(e,t){return this.apollo.mutate({mutation:r.ZP`
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
        `,variables:{pre_contract_template_step_input:e,pre_contract_template_id:t}}).pipe((0,i.U)(a=>a.data.CreatePreContractTemplateStep))}deleteContractTemplateStep(e){return this.apollo.mutate({mutation:r.ZP`
          mutation {
            DeletePreContractTemplateStep(_id: "${e}") {
              _id
            }
          }
        `}).pipe((0,i.U)(t=>t.data.DeletePreContractTemplateStep))}getAllSubjectsDropdown(){return this.apollo.query({query:r.ZP`
          query GetAllSubjectCourseAndSequences {
            GetAllSubjectCourseAndSequences {
              _id
              short_name
              full_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(e=>e.data.GetAllSubjectCourseAndSequences))}getAllProgramSubjects(e){return this.apollo.query({query:r.ZP`
          query GetAllProgramSubjects($filter: ProgramSubjectFilterInput) {
            GetAllProgramSubjects(filter: $filter) {
              _id
              short_name
              name
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetAllProgramSubjects))}getAllProgramSubjectDropdown(){return this.apollo.query({query:r.ZP`
          query getAllProgramSubjectDropdown {
            getAllProgramSubjectDropdown {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(e=>e.data.getAllProgramSubjectDropdown))}GetAllSubjectCourseAndSequences(){return this.apollo.query({query:r.ZP`
          query GetAllSubjectCourseAndSequences {
            GetAllSubjectCourseAndSequences {
              _id
              short_name
              full_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(e=>e.data.GetAllSubjectCourseAndSequences))}deleteContractTemplate(e){return this.apollo.mutate({mutation:r.ZP`
          mutation {
            DeletePreContractTemplate(_id: "${e}") {
              _id
            }
          }
        `}).pipe((0,i.U)(t=>t.data.DeletePreContractTemplate))}createUpdatePreContractTemplateStep(e){return this.apollo.mutate({mutation:r.ZP`
          mutation CreateUpdatePreContractTemplateStep($pre_contract_template_step_input: CreateUpdatePreContractTemplateStepInput) {
            CreateUpdatePreContractTemplateStep(pre_contract_template_step_input: $pre_contract_template_step_input) {
              _id
            }
          }
        `,variables:{pre_contract_template_step_input:e}}).pipe((0,i.U)(t=>t.data.CreateUpdatePreContractTemplateStep))}createContractTemplateTextTab(e){return this.apollo.mutate({mutation:r.ZP`
          mutation CreatePreContractTemplatePDF($pre_contract_template_pdf_input: PreContractTemplatePDFInput) {
            CreatePreContractTemplatePDF(pre_contract_template_pdf_input: $pre_contract_template_pdf_input) {
              _id
            }
          }
        `,variables:{pre_contract_template_pdf_input:e}}).pipe((0,i.U)(t=>t.data.CreatePreContractTemplatePDF))}updateContractTemplateTextTab(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation UpdatePreContractTemplatePDF($pre_contract_template_pdf_input: PreContractTemplatePDFInput, $pdfId: ID) {
            UpdatePreContractTemplatePDF(pre_contract_template_pdf_input: $pre_contract_template_pdf_input, _id: $pdfId) {
              _id
            }
          }
        `,variables:{pre_contract_template_pdf_input:t,pdfId:e}}).pipe((0,i.U)(a=>a.data.UpdatePreContractTemplatePDF))}getContractSignatoryDropdown(e){return this.apollo.query({query:r.ZP`
          query{
            GetOnePreContractTemplate(_id: "${e}"){
              _id
              contract_signatory{
                _id
                name
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetOnePreContractTemplate))}getContractTemplateKeysDropdown(){return this.apollo.query({query:r.ZP`
          query GetListPreContractTemplateQuestionRefIds {
            GetListPreContractTemplateQuestionRefIds {
              key
              description
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(e=>e.data.GetListPreContractTemplateQuestionRefIds))}GetListFCContracTemplateQuestionRefIds(e,t,a,n){return this.apollo.query({query:r.ZP`
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
        `,variables:{filter:e,form_builder_id:t,form_builder_step_id:a,lang:n},fetchPolicy:"network-only"}).pipe((0,i.U)(s=>s.data.GetListFCContracTemplateQuestionRefIds))}GetContractTemplateKeysData(e,t,a){return this.apollo.query({query:r.ZP`
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
        `,variables:{templateId:e,filter:t,lang:a},fetchPolicy:"network-only"}).pipe((0,i.U)(n=>n.data.GetListPreContractTemplateQuestionRefIds))}getContractTemplateKeysData(e,t){return this.apollo.query({query:r.ZP`
          query GetListPreContractTemplateQuestionRefIds($templateId: ID, $lang: String) {
            GetListPreContractTemplateQuestionRefIds(pre_contract_template_id: $templateId, lang: $lang) {
              key
              description
            }
          }
        `,variables:{templateId:e,lang:t},fetchPolicy:"network-only"}).pipe((0,i.U)(a=>a.data.GetListPreContractTemplateQuestionRefIds))}duplicateContractTemplate(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation DuplicatePreContractTemplate($pre_contract_template_id: ID!, $pre_contract_template_name: String!) {
            DuplicatePreContractTemplate(
              pre_contract_template_id: $pre_contract_template_id
              pre_contract_template_name: $pre_contract_template_name
            ) {
              _id
            }
          }
        `,variables:{pre_contract_template_id:e,pre_contract_template_name:t}}).pipe((0,i.U)(a=>a.data.DuplicatePreContractTemplate))}getContractTemplateTextTab(e){return this.apollo.query({query:r.ZP`
          query GetOnePreContractTemplateTab($templateId: ID!) {
            GetOnePreContractTemplatePDF(pre_contract_template_id: $templateId) {
              _id
              template_html
            }
          }
        `,variables:{templateId:e},fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetOnePreContractTemplatePDF))}importContractProcess(e,t,a){return this.apollo.mutate({mutation:r.ZP`
          mutation ImportContractProcess($payload: ImportContractProcessInput, $lang: String, $file: Upload!) {
            ImportContractProcess(import_contract_process_input: $payload, lang: $lang, file: $file) {
              imported
              not_imported
            }
          }
        `,variables:{payload:e,lang:t,file:a},context:{useMultipart:!0}}).pipe((0,i.U)(n=>n.data.ImportContractProcess))}importAssignmentTableData(e,t,a,n){return this.apollo.mutate({mutation:r.ZP`
          mutation ImportAssignmentTableDataDialog($file_delimiter: String, $lang: String, $file: Upload!,$user_type_id: ID) {
            ImportAssignmentTableData(file_delimiter: $file_delimiter, lang: $lang, file: $file,,user_type_id:$user_type_id)
          }
        `,variables:{file_delimiter:e,lang:a,file:t,user_type_id:n||null},context:{useMultipart:!0}}).pipe((0,i.U)(s=>s.data.ImportAssignmentTableData))}generatePreContractTemplatePDF(e){return this.apollo.mutate({mutation:r.ZP`
        mutation GeneratePreContractTemplatePDF{
          GeneratePreContractTemplatePDF(
            _id: "${e}",
            is_preview: true
            lang: "${this.translate.currentLang}"
          )
        }
      `}).pipe((0,i.U)(t=>t.data.GeneratePreContractTemplatePDF))}generateContractTemplatePDF(e,t,a){return this.apollo.mutate({mutation:r.ZP`
          mutation GeneratePreContractTemplatePDF($_id: ID!, $preview: Boolean, $contractProcessId: ID) {
            GeneratePreContractTemplatePDF(_id: $_id, is_preview: $preview, contract_process_id: $contractProcessId)
          }
        `,variables:{_id:e,preview:t,contractProcessId:a}}).pipe((0,i.U)(n=>n.data.GeneratePreContractTemplatePDF))}generateContractTemplatePDFfC(e,t,a){return this.apollo.mutate({mutation:r.ZP`
          mutation GeneratePreContractTemplatePDF($_id: ID!, $preview: Boolean, $fc_contract_process_id: ID) {
            GeneratePreContractTemplatePDF(_id: $_id, is_preview: $preview, fc_contract_process_id: $fc_contract_process_id)
          }
        `,variables:{_id:e,preview:t,fc_contract_process_id:a}}).pipe((0,i.U)(n=>n.data.GeneratePreContractTemplatePDF))}GetAllProgramsDropdown(){return this.apollo.query({query:r.ZP`
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
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(e=>e.data.GetAllPrograms))}GetAllLegalDropdown(){return this.apollo.query({query:r.ZP`
          query GetAllLegalDropdown {
            GetAllLegalEntities {
              _id
              legal_entity_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(e=>e.data.GetAllLegalEntities))}GetAllPrograms(){return this.apollo.query({query:r.ZP`
          query GetAllPrograms {
            GetAllPrograms {
              _id
              program
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(e=>e.data.GetAllPrograms))}getPreContractTemplatesDropdown(e){return this.apollo.watchQuery({query:r.ZP`
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
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(t=>t.data.GetAllPreContractTemplates))}sendContractProcess(e,t,a,n){return this.apollo.mutate({mutation:r.ZP`
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
        `,variables:{contractProcessId:e,templateId:t,selectAll:a,filter:n,lang:this.translate.currentLang?this.translate.currentLang:"fr"}}).pipe((0,i.U)(s=>s.data.SendContractProcess))}sendContractProcessWithAssign(e,t,a,n,s,P){return this.apollo.mutate({mutation:r.ZP`
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
        `,variables:{contractProcessId:e,templateId:t,selectAll:a,filter:n,step_validator_input:s,contract_validator_signatory_status_input:P,lang:this.translate.currentLang?this.translate.currentLang:"fr"}}).pipe((0,i.U)(g=>g.data.SendContractProcess))}SendEmailContractProcess(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation SendEmailContractProcessReminder($contractProcessId: ID!, $lang: String) {
            SendEmailContractProcess(_id: $contractProcessId, lang: $lang) {
              _id
            }
          }
        `,variables:{contractProcessId:e,lang:t}}).pipe((0,i.U)(a=>a.data.SendEmailContractProcess))}createUpdateContractProcessStepAndQuestion(e){return this.apollo.mutate({mutation:r.ZP`
          mutation savePreContractForm($contract_process_step_input: CreateUpdateContractProcessStepInput) {
            CreateUpdateContractProcessStepAndQuestion(contract_process_step_input: $contract_process_step_input) {
              _id
            }
          }
        `,variables:{contract_process_step_input:e}}).pipe((0,i.U)(t=>t.data.CreateUpdateContractProcessStepAndQuestion))}acceptContractProcessStep(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation AcceptContractProcessStep($_id: ID, $contract_process_id: ID, $lang: String) {
            AcceptContractProcessStep(_id: $_id, contract_process_id: $contract_process_id, lang: $lang) {
              _id
            }
          }
        `,variables:{_id:t||null,contract_process_id:e,lang:this.translate.currentLang?this.translate.currentLang:"fr"}}).pipe((0,i.U)(a=>a.data.AcceptContractProcessStep))}createUpdateFCContractProcessStepAndQuestion(e){return this.apollo.mutate({mutation:r.ZP`
          mutation CreateUpdateFCContractProcessStepAndQuestion($fc_contract_process_step_input: CreateUpdateFcContractProcessStepInput) {
            CreateUpdateFCContractProcessStepAndQuestion(fc_contract_process_step_input: $fc_contract_process_step_input) {
              _id
            }
          }
        `,variables:{fc_contract_process_step_input:e}}).pipe((0,i.U)(t=>t.data.CreateUpdateFCContractProcessStepAndQuestion))}acceptFCContractProcessStep(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation AcceptFCContractProcessStep($_id: ID, $fc_contract_process_id: ID, $lang: String) {
            AcceptFCContractProcessStep(_id: $_id, fc_contract_process_id: $fc_contract_process_id, lang: $lang) {
              _id
            }
          }
        `,variables:{_id:t||null,fc_contract_process_id:e,lang:this.translate.currentLang?this.translate.currentLang:"fr"}}).pipe((0,i.U)(a=>a.data.AcceptFCContractProcessStep))}completeRevisionContractProcessStep(e){return this.apollo.mutate({mutation:r.ZP`
          mutation CompleteRevisionContractProcessStep($_id: ID!, $lang: String) {
            CompleteRevisionContractProcessStep(_id: $_id, lang: $lang) {
              _id
            }
          }
        `,variables:{_id:e||null,lang:this.translate.currentLang?this.translate.currentLang:"fr"}}).pipe((0,i.U)(t=>t.data.CompleteRevisionContractProcessStep))}GeneratePreContractFormSummaryPDF(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation GeneratePreContractFormSummaryPDF($_id: ID!, $lang: String) {
            GeneratePreContractFormSummaryPDF(_id: $_id, lang: $lang)
          }
        `,variables:{_id:e,lang:t||this.translate.currentLang}}).pipe((0,i.U)(a=>a.data.GeneratePreContractFormSummaryPDF))}askRevisionContractProcessStep(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation AskRevisionContractProcessStep(
            $_id: ID
            $revise_request_messages: [ContractProcessStepReviseRequestMessageInput]
            $lang: String
          ) {
            AskRevisionContractProcessStep(_id: $_id, revise_request_messages: $revise_request_messages, lang: $lang) {
              _id
            }
          }
        `,variables:{_id:e,revise_request_messages:t,lang:this.translate.currentLang?this.translate.currentLang:"fr"}}).pipe((0,i.U)(a=>a.data.AskRevisionContractProcessStep))}askRevisionContractProcess(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation AskRevisionContractProcess($_id: ID, $revise_request_messages: [ContractProcessReviseRequestMessageInput]) {
            AskRevisionContractProcess(_id: $_id, revise_request_messages: $revise_request_messages) {
              _id
            }
          }
        `,variables:{_id:e,revise_request_messages:t}}).pipe((0,i.U)(a=>a.data.AskRevisionContractProcess))}replyRevisionMessageContractProcessStep(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation ReplyRevisionMessageContractProcessStep(
            $_id: ID
            $revise_request_message: [ContractProcessStepReviseRequestMessageInput]
            $lang: String
          ) {
            ReplyRevisionMessageContractProcessStep(_id: $_id, revise_request_messages: $revise_request_message, lang: $lang) {
              _id
            }
          }
        `,variables:{_id:e,revise_request_message:t,lang:this.translate.currentLang?this.translate.currentLang:"fr"}}).pipe((0,i.U)(a=>a.data.ReplyRevisionMessageContractProcessStep))}replyRevisionMessageContractProcess(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation ReplyRevisionMessageContractProcess($_id: ID, $revise_request_message: [ContractProcessReviseRequestMessageInput]) {
            ReplyRevisionMessageContractProcess(_id: $_id, revise_request_messages: $revise_request_message) {
              _id
            }
          }
        `,variables:{_id:e,revise_request_message:t}}).pipe((0,i.U)(a=>a.data.ReplyRevisionMessageContractProcess))}GetOneRandomContractProcess(e){return this.apollo.query({query:r.ZP`
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
        `,variables:{pre_contract_template_id:e},fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetOneRandomContractProcess))}GetOneContractProcess(e){return this.apollo.query({query:r.ZP`
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
        `,variables:{pre_contract_template_id:e},fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetOneContractProcess))}UpdateContractProcess(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation UpdateContractProcess($_id: ID, $contract_process_input: ContractProcessInput) {
            UpdateContractProcess(_id: $_id, contract_process_input: $contract_process_input) {
              _id
            }
          }
        `,variables:{_id:e,contract_process_input:t}}).pipe((0,i.U)(a=>a.data.UpdateContractProcess))}SubmitContractProcess(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation SubmitContractProcess($_id: ID, $user_id: ID, $lang: String) {
            SubmitContractProcess(_id: $_id, user_id: $user_id, lang: $lang) {
              _id
            }
          }
        `,variables:{_id:e,user_id:t,lang:this.translate.currentLang?this.translate.currentLang:"fr"}}).pipe((0,i.U)(a=>a.data.SubmitContractProcess))}SubmitContractProcessTeacher(e){return this.apollo.mutate({mutation:r.ZP`
          mutation SubmitContractProcess($_id: ID, $lang: String) {
            SubmitContractProcess(_id: $_id, lang: $lang) {
              _id
            }
          }
        `,variables:{_id:e,lang:this.translate.currentLang?this.translate.currentLang:"fr"}}).pipe((0,i.U)(t=>t.data.SubmitContractProcess))}ValidateContractProcess(e){return this.apollo.mutate({mutation:r.ZP`
          mutation SubmitContractProcess($_id: ID, $lang: String) {
            SubmitContractProcess(_id: $_id, lang: $lang) {
              _id
            }
          }
        `,variables:{_id:e,lang:this.translate.currentLang?this.translate.currentLang:"fr"}}).pipe((0,i.U)(t=>t.data.SubmitContractProcess))}GetAllUsers(e,t){return this.apollo.watchQuery({query:r.ZP`
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
        `,variables:{userType:e,userName:t||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(a=>a.data.GetAllUsers))}GetAllUsersIncludeStudent(e,t){return this.apollo.watchQuery({query:r.ZP`
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
        `,variables:{userType:e,userName:t||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(a=>a.data.GetAllUsers))}GetAllUserValidators(e,t,a,n){return this.apollo.watchQuery({query:r.ZP`
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
        `,variables:{user_type:e,schools:t,campuses:a,levels:n},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(s=>s.data.GetAllUsers))}createStepNotificationAndMessage(e){return this.apollo.mutate({mutation:r.ZP`
          mutation CreateStepNotificationAndMessage($step_notification_and_message_input: StepNotificationAndMessageInput) {
            CreateStepNotificationAndMessage(step_notification_and_message_input: $step_notification_and_message_input) {
              _id
            }
          }
        `,variables:{step_notification_and_message_input:e}}).pipe((0,i.U)(t=>t.data.CreateStepNotificationAndMessage))}UpdateStepNotificationAndMessage(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation UpdateStepNotificationAndMessage($_id: ID!, $step_notification_and_message_input: StepNotificationAndMessageInput) {
            UpdateStepNotificationAndMessage(_id: $_id, step_notification_and_message_input: $step_notification_and_message_input) {
              _id
            }
          }
        `,variables:{_id:e,step_notification_and_message_input:t}}).pipe((0,i.U)(a=>a.data.UpdateStepNotificationAndMessage))}deleteStepNotificationAndMessage(e){return this.apollo.mutate({mutation:r.ZP`
          mutation DeleteStepNotificationAndMessage($_id: ID!) {
            DeleteStepNotificationAndMessage(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:e}}).pipe((0,i.U)(t=>t.data.DeleteStepNotificationAndMessage))}GetAllStepNotificationsAndMessages(e,t,a){return this.apollo.watchQuery({query:r.ZP`
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
        `,variables:{pre_contract_template_id:e,pre_contract_template_step_id:t,pagination:a},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(n=>n.data.GetAllStepNotificationsAndMessages))}GetAllStepNotificationsAndMessagesDetail(e,t){return this.apollo.watchQuery({query:r.ZP`
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
        `,variables:{pre_contract_template_id:e,pre_contract_template_step_id:t},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(a=>a.data.GetAllStepNotificationsAndMessages))}GenerateStepMessage(e,t,a){return this.apollo.watchQuery({query:r.ZP`
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
        `,variables:{pre_contract_template_step_id:e,contract_process_id:t,is_preview:a},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(n=>n.data.GenerateStepMessage))}GenerateStepMessageFC(e,t,a){return this.apollo.watchQuery({query:r.ZP`
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
        `,variables:{pre_contract_template_step_id:e,fc_contract_process_id:t,is_preview:a},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(n=>n.data.GenerateStepMessage))}generateTeacherContractProcess(e){return this.apollo.watchQuery({query:r.ZP`
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
        `,variables:{teacher_subjects_id:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(t=>t.data.GenerateTeacherContractProcessFromTeacherSubject))}SendPreviewStepNotification(e,t,a,n){return this.apollo.mutate({mutation:r.ZP`
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
        `,variables:{pre_contract_template_step_id:e,contract_process_id:t,is_preview:a,user_id:n}}).pipe((0,i.U)(s=>s.data.RejectAndStopContractProcess))}RejectAndStopContractProcess(e){return this.apollo.mutate({mutation:r.ZP`
          mutation {
            RejectAndStopContractProcess(_id: "${e}", lang: "${this.translate.currentLang}") {
              _id
              contract_status
            }
          }
        `}).pipe((0,i.U)(t=>t.data.RejectAndStopContractProcess))}submitFCContractProcess(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation SubmitFCContractProcess($_id: ID, $user_id: ID, $lang: String) {
            SubmitFCContractProcess(_id: $_id, user_id: $user_id, lang: $lang) {
              _id
            }
          }
        `,variables:{_id:e,user_id:t||null,lang:this.translate.currentLang?this.translate.currentLang:"fr"}}).pipe((0,i.U)(a=>a.data.SubmitFCContractProcess))}submitFCContractProcessWithoutUserId(e){return this.apollo.mutate({mutation:r.ZP`
          mutation SubmitFCContractProcess($_id: ID, $lang: String) {
            SubmitFCContractProcess(_id: $_id, lang: $lang) {
              _id
            }
          }
        `,variables:{_id:e,lang:this.translate.currentLang}}).pipe((0,i.U)(t=>t.data.SubmitFCContractProcess))}updateFcContractProcessStep(e,t){return this.apollo.mutate({mutation:r.ZP`
          mutation UpdateFcContractProcessStep($_id: ID, $update_fc_process_step_input: FcContractProcessStepInput) {
            UpdateFcContractProcessStep(_id: $_id, update_fc_process_step_input: $update_fc_process_step_input) {
              _id
            }
          }
        `,variables:{_id:e,update_fc_process_step_input:t}}).pipe((0,i.U)(a=>a.data.UpdateFcContractProcessStep))}RejectAndStopFCContractProcess(e){return this.apollo.mutate({mutation:r.ZP`
          mutation RejectAndStopFCContractProcess{
            RejectAndStopFCContractProcess(_id: "${e}", lang: "${this.translate.currentLang}") {
              _id
              contract_status
            }
          }
        `}).pipe((0,i.U)(t=>t.data.RejectAndStopFCContractProcess))}DocusignContractProcess(e,t,a){return this.apollo.mutate({mutation:r.ZP`
          mutation DocusignContractProcess($contract_process_id: ID, $user_id: ID, $urlRedirect: String, $lang: String) {
            DocusignContractProcess(contract_process_id: $contract_process_id, user_id: $user_id, urlRedirect: $urlRedirect, lang: $lang)
          }
        `,variables:{contract_process_id:e,urlRedirect:t,user_id:a,lang:this.translate.currentLang?this.translate.currentLang:"fr"}}).pipe((0,i.U)(n=>n.data.DocusignContractProcess))}DocusignFCContractProcess(e,t,a){return this.apollo.mutate({mutation:r.ZP`
          mutation DocusignFCContractProcess($fc_contract_process_id: ID, $user_id: ID, $urlRedirect: String, $lang: String) {
            DocusignFCContractProcess(
              fc_contract_process_id: $fc_contract_process_id
              user_id: $user_id
              urlRedirect: $urlRedirect
              lang: $lang
            )
          }
        `,variables:{fc_contract_process_id:e,urlRedirect:t,user_id:a,lang:this.translate.currentLang}}).pipe((0,i.U)(n=>n.data.DocusignFCContractProcess))}UpdateDocusignContractProcess(e){return this.apollo.mutate({mutation:r.ZP`
          mutation UpdateDocusignContractProcess($contract_process_id: ID) {
            UpdateDocusignContractProcess(contract_process_id: $contract_process_id) {
              _id
            }
          }
        `,variables:{contract_process_id:e}}).pipe((0,i.U)(t=>t.data.UpdateDocusignContractProcess))}GetProgramSelected(e){return this.apollo.query({query:r.ZP`
          query GetProgramSelected{
            GetOneProgram(_id: "${e}") {
              _id
              program
              paid_leave_allowance_rate
              induced_hours_coefficient
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetOneProgram))}getAllAdmissionFinancements(e){return this.apollo.query({query:r.ZP`
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
        `,fetchPolicy:"network-only",variables:{filter:e}}).pipe((0,i.U)(t=>t.data.GetAllAdmissionFinancements))}GetOneCompany(e){return this.apollo.query({query:r.ZP`
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
        `,fetchPolicy:"network-only",variables:{_id:e}}).pipe((0,i.U)(t=>t.data.GetOneCompany))}GetAllUsersMentorCompany(e,t,a){return this.apollo.query({query:r.ZP`
          query GetAllUsersMentorCompany($company: ID, $company_staff: Boolean, $user_type: [ID!]) {
            GetAllUsers(company: $company, company_staff: $company_staff, user_type: $user_type) {
              _id
              first_name
              last_name
              civility
              position
            }
          }
        `,fetchPolicy:"network-only",variables:{company:e,company_staff:t,user_type:a}}).pipe((0,i.U)(n=>n.data.GetAllUsers))}GetAllUsersCEOCompany(e,t){return this.apollo.query({query:r.ZP`
          query GetAllUsersCEOCompany($company: ID, $user_type: [ID!]) {
            GetAllUsers(company: $company, user_type: $user_type) {
              _id
              first_name
              last_name
              civility
            }
          }
        `,fetchPolicy:"network-only",variables:{company:t,user_type:e}}).pipe((0,i.U)(a=>a.data.GetAllUsers))}importModule(e,t,a){return this.apollo.mutate({mutation:r.ZP`
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
        `,variables:{file_delimiter:e,lang:a,file:t},context:{useMultipart:!0}}).pipe((0,i.U)(n=>n.data.ImportModule))}importSubject(e,t,a){return this.apollo.mutate({mutation:r.ZP`
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
        `,variables:{file_delimiter:e,lang:a,file:t},context:{useMultipart:!0}}).pipe((0,i.U)(n=>n.data.ImportCourseSubject))}getAllCampuses(e){return this.apollo.query({query:r.ZP`
          query GetAllCampuses {
            GetAllCampuses {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetAllCampuses))}getAllUsersFinancementOfStudent(e){return this.apollo.query({query:r.ZP`
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
        `,variables:{candidate_id:e},fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetAllUsersFinancementOfStudent))}}return o.\u0275fac=function(e){return new(e||o)(l.\u0275\u0275inject(d.sK),l.\u0275\u0275inject(u._M))},o.\u0275prov=l.\u0275\u0275defineInjectable({token:o,factory:o.\u0275fac,providedIn:"root"}),o})()}}]);