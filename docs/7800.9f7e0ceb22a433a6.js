          query GetUserTypesForValidator{
            GetAllUserTypes(exclude_company: true, show_student_type: include_student) {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,b.U)(_=>_.data.GetAllUserTypes))}getAllContractProcesses(_,h,O){return this.apollo.watchQuery({query:m.ZP`
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
        `,variables:{pagination:_,filter:h,sorting:O||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,b.U)(I=>I.data.GetAllContractProcesses))}getOneContractProcess(_){return this.apollo.query({query:m.ZP`
          query {
            GetOneContractProcess(_id: "${_}") {
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
        `,fetchPolicy:"network-only"}).pipe((0,b.U)(h=>h.data.GetOneContractProcess))}createContractProcess(_){return this.apollo.mutate({mutation:m.ZP`
          mutation CreateContractProcess($contract_process_input: ContractProcessInput) {
            CreateContractProcess(contract_process_input: $contract_process_input) {
              _id
            }
          }
        `,variables:{contract_process_input:_}}).pipe((0,b.U)(h=>h.data.CreateContractProcess))}updateContractProcess(_,h){return this.apollo.mutate({mutation:m.ZP`
          mutation UpdateContractProcess($_id: ID, $contract_process_input: ContractProcessInput) {
            UpdateContractProcess(_id: $_id, contract_process_input: $contract_process_input) {
              _id
            }
          }
        `,variables:{_id:_,contract_process_input:h}}).pipe((0,b.U)(O=>O.data.UpdateContractProcess))}getAllFormBuilders(_,h,O){return this.apollo.watchQuery({query:m.ZP`
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
        `,variables:{pagination:_,filter:h,sorting:O||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,b.U)(I=>I.data.GetAllFormBuilders))}getAllFormBuilderSteps(_){return this.apollo.query({query:m.ZP`
          query GetAllFormBuilderSteps($filter: FormBuilderStepFilterInput) {
            GetAllFormBuilderSteps(filter: $filter) {
              _id
              step_title
              is_final_step
            }
          }
        `,variables:{filter:_},fetchPolicy:"network-only"}).pipe((0,b.U)(h=>h.data.GetAllFormBuilderSteps))}deleteContractProcess(_){return this.apollo.mutate({mutation:m.ZP`
          mutation {
            DeleteContractProcess(_id: "${_}") {
              _id
            }
          }
        `}).pipe((0,b.U)(h=>h.data.DeleteContractProcess))}createFormBuilderTemplate(_){return this.apollo.mutate({mutation:m.ZP`
          mutation CreateFormBuilder($form_builder_input: FormBuilderInput) {
            CreateFormBuilder(form_builder_input: $form_builder_input) {
              _id
            }
          }
        `,variables:{form_builder_input:_}}).pipe((0,b.U)(h=>h.data.CreateFormBuilder))}updateFormBuilderTemplate(_,h){return this.apollo.mutate({mutation:m.ZP`
          mutation UpdateFormBuilder($templateId: ID!, $form_builder_input: FormBuilderInput) {
            UpdateFormBuilder(_id: $templateId, form_builder_input: $form_builder_input) {
              _id
            }
          }
        `,variables:{templateId:_,form_builder_input:h}}).pipe((0,b.U)(O=>O.data.UpdateFormBuilder))}getFormBuilderTemplateFirstTab(_){return this.apollo.query({query:m.ZP`
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
        `,variables:{templateId:_},fetchPolicy:"network-only"}).pipe((0,b.U)(h=>h.data.GetOneFormBuilder))}getOneFormBuilder(_){return this.apollo.query({query:m.ZP`
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
        `,variables:{templateId:_},fetchPolicy:"network-only"}).pipe((0,b.U)(h=>h.data.GetOneFormBuilder))}getOneFormBuilderStep(_){return this.apollo.query({query:m.ZP`
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
        `,variables:{_id:_},fetchPolicy:"network-only"}).pipe((0,b.U)(h=>h.data.GetOneFormBuilderStep))}publishContractTemplateFirstTab(_){return this.apollo.mutate({mutation:m.ZP`
          mutation PublishFormBuilder($templateId: ID!) {
            PublishFormBuilder(_id: $templateId) {
              _id
            }
          }
        `,variables:{templateId:_}}).pipe((0,b.U)(h=>h.data.PublishFormBuilder))}unpublishContractTemplateFirstTab(_){return this.apollo.mutate({mutation:m.ZP`
          mutation UnpublishFormBuilder($templateId: ID!) {
            UnpublishFormBuilder(_id: $templateId) {
              _id
            }
          }
        `,variables:{templateId:_}}).pipe((0,b.U)(h=>h.data.UnpublishFormBuilder))}createFormBuilderStep(_,h){return this.apollo.mutate({mutation:m.ZP`
          mutation CreateFormBuilderStep($form_builder_id: ID, $form_builder_step_input: FormBuilderStepInput) {
            CreateFormBuilderStep(form_builder_id: $form_builder_id, form_builder_step_input: $form_builder_step_input) {
              _id
              step_title
              step_type
            }
          }
        `,variables:{form_builder_id:_,form_builder_step_input:h}}).pipe((0,b.U)(O=>O.data.CreateFormBuilderStep))}deleteFormBuilderStep(_){return this.apollo.mutate({mutation:m.ZP`
          mutation DeleteFormBuilderStep{
            DeleteFormBuilderStep(_id: "${_}") {
              _id
            }
          }
        `}).pipe((0,b.U)(h=>h.data.DeleteFormBuilderStep))}getAllSubjectsDropdown(){return this.apollo.query({query:m.ZP`
          query GetAllSubjectCourseAndSequences {
            GetAllSubjectCourseAndSequences {
              _id
              short_name
              full_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,b.U)(_=>_.data.GetAllSubjectCourseAndSequences))}deleteFormBuilderTemplate(_){return this.apollo.mutate({mutation:m.ZP`
          mutation DeleteFormBuilderTemplate{
            DeleteFormBuilder(_id: "${_}") {
              _id
            }
          }
        `}).pipe((0,b.U)(h=>h.data.DeleteFormBuilder))}createUpdateFormBuilderStep(_){return this.apollo.mutate({mutation:m.ZP`
          mutation CreateUpdateFormBuilderStep($form_builder_step_input: CreateUpdateFormBuilderStepInput) {
            CreateUpdateFormBuilderStep(form_builder_step_input: $form_builder_step_input) {
              _id
            }
          }
        `,variables:{form_builder_step_input:_}}).pipe((0,b.U)(h=>h.data.CreateUpdateFormBuilderStep))}createContractTemplateTextTab(_){return this.apollo.mutate({mutation:m.ZP`
          mutation CreatePreContractTemplatePDF($pre_contract_template_pdf_input: PreContractTemplatePDFInput) {
            CreatePreContractTemplatePDF(pre_contract_template_pdf_input: $pre_contract_template_pdf_input) {
              _id
            }
          }
        `,variables:{pre_contract_template_pdf_input:_}}).pipe((0,b.U)(h=>h.data.CreatePreContractTemplatePDF))}updateContractTemplateTextTab(_,h){return this.apollo.mutate({mutation:m.ZP`
          mutation UpdatePreContractTemplatePDF($pre_contract_template_pdf_input: PreContractTemplatePDFInput, $pdfId: ID) {
            UpdatePreContractTemplatePDF(pre_contract_template_pdf_input: $pre_contract_template_pdf_input, _id: $pdfId) {
              _id
            }
          }
        `,variables:{pre_contract_template_pdf_input:h,pdfId:_}}).pipe((0,b.U)(O=>O.data.UpdatePreContractTemplatePDF))}getContractTemplateKeysData(_,h){return this.apollo.query({query:m.ZP`
          query GetListPreContractTemplateQuestionRefIds($templateId: ID, $lang: String) {
            GetListPreContractTemplateQuestionRefIds(pre_contract_template_id: $templateId, lang: $lang) {
              key
              description
            }
          }
        `,variables:{templateId:_,lang:h},fetchPolicy:"network-only"}).pipe((0,b.U)(O=>O.data.GetListPreContractTemplateQuestionRefIds))}duplicateContractTemplate(_,h){return this.apollo.mutate({mutation:m.ZP`
          mutation DuplicatePreContractTemplate($pre_contract_template_id: ID!, $pre_form_builder_name: String!) {
            DuplicatePreContractTemplate(
              pre_contract_template_id: $pre_contract_template_id
              pre_form_builder_name: $pre_form_builder_name
            ) {
              _id
            }
          }
        `,variables:{pre_contract_template_id:_,pre_form_builder_name:h}}).pipe((0,b.U)(O=>O.data.DuplicatePreContractTemplate))}getContractTemplateTextTab(_){return this.apollo.query({query:m.ZP`
          query GetOnePreContractTemplateTab($templateId: ID!) {
            GetOnePreContractTemplatePDF(pre_contract_template_id: $templateId) {
              _id
              template_html
            }
          }
        `,variables:{templateId:_},fetchPolicy:"network-only"}).pipe((0,b.U)(h=>h.data.GetOnePreContractTemplatePDF))}importContractProcess(_,h,O){return this.apollo.mutate({mutation:m.ZP`
          mutation ImportContractProcess($payload: ImportContractProcessInput, $lang: String, $file: Upload!) {
            ImportContractProcess(import_contract_process_input: $payload, lang: $lang, file: $file) {
              _id
            }
          }
        `,variables:{payload:_,lang:h,file:O},context:{useMultipart:!0}}).pipe((0,b.U)(I=>I.data.ImportContractProcess))}generatePreContractTemplatePDF(_){return this.apollo.mutate({mutation:m.ZP`
        mutation {
          GeneratePreContractTemplatePDF(
            _id: "${_}",
            is_preview: true
          )
        }
      `}).pipe((0,b.U)(h=>h.data.GeneratePreContractTemplatePDF))}GetAllProgramsDropdown(){return this.apollo.query({query:m.ZP`
          query GetAllProgramsDropdown {
            GetAllPrograms {
              _id
              program
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,b.U)(_=>_.data.GetAllPrograms))}getPreContractTemplatesDropdown(_){return this.apollo.watchQuery({query:m.ZP`
          query GetPreContractTemplatesDropdown($filter: FormBuilderFilterInput) {
            GetAllPreContractTemplates(filter: $filter) {
              _id
              form_builder_name
            }
          }
        `,variables:{filter:_},fetchPolicy:"network-only"}).valueChanges.pipe((0,b.U)(h=>h.data.GetAllPreContractTemplates))}sendContractProcess(_,h,O,I){return this.apollo.mutate({mutation:m.ZP`
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
        `,variables:{contractProcessId:_,templateId:h,selectAll:O,filter:I}}).pipe((0,b.U)(S=>S.data.SendContractProcess))}SendEmailContractProcess(_,h){return this.apollo.mutate({mutation:m.ZP`
          mutation SendEmailContractProcessReminder($contractProcessId: ID!, $lang: String) {
            SendEmailContractProcess(_id: $contractProcessId, lang: $lang) {
              _id
            }
          }
        `,variables:{contractProcessId:_,lang:h}}).pipe((0,b.U)(O=>O.data.SendEmailContractProcess))}createUpdateContractProcessStepAndQuestion(_){return this.apollo.mutate({mutation:m.ZP`
          mutation savePreContractForm($contract_process_step_input: CreateUpdateContractProcessStepInput) {
            CreateUpdateContractProcessStepAndQuestion(contract_process_step_input: $contract_process_step_input) {
              _id
            }
          }
        `,variables:{contract_process_step_input:_}}).pipe((0,b.U)(h=>h.data.CreateUpdateContractProcessStepAndQuestion))}duplicateFormBuilder(_,h){return this.apollo.mutate({mutation:m.ZP`
          mutation DuplicateFormBuilder($form_builder_id: ID!, $form_builder_name: String!) {
            DuplicateFormBuilder(form_builder_id: $form_builder_id, form_builder_name: $form_builder_name) {
              _id
            }
          }
        `,variables:{form_builder_id:_,form_builder_name:h}}).pipe((0,b.U)(O=>O.data.DuplicateFormBuilder))}getAllFormBuildersDropdown(_={status:!0}){return this.apollo.watchQuery({query:m.ZP`
          query GetAllFormBuilders($filter: FormBuilderFilterInput) {
            GetAllFormBuilders(filter: $filter) {
              _id
              form_builder_name
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:_}}).valueChanges.pipe((0,b.U)(h=>h.data.GetAllFormBuilders))}getAllStepNotificationsAndMessages(_,h,O){return this.apollo.watchQuery({query:m.ZP`
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
        `,fetchPolicy:"network-only",variables:{form_builder_id:_,step_id:h,pagination:O}}).valueChanges.pipe((0,b.U)(I=>I.data.GetAllStepNotificationsAndMessages))}createStepNotificationAndMessage(_){return this.apollo.mutate({mutation:m.ZP`
          mutation CreateFormBuilderStepNotificationAndMessage($step_notification_and_message_input: StepNotificationAndMessageInput) {
            CreateFormBuilderStepNotificationAndMessage(step_notification_and_message_input: $step_notification_and_message_input) {
              _id
              type
              ref_id
            }
          }
        `,variables:{step_notification_and_message_input:_}}).pipe((0,b.U)(h=>h.data.CreateFormBuilderStepNotificationAndMessage))}deleteStepNotificationAndMessage(_){return this.apollo.mutate({mutation:m.ZP`
          mutation DeleteStepNotificationAndMessage($_id: ID!) {
            DeleteStepNotificationAndMessage(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:_}}).pipe((0,b.U)(h=>h.data.DeleteStepNotificationAndMessage))}getOneStepNotificationAndMessage(_){return this.apollo.watchQuery({query:m.ZP`
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
        `,fetchPolicy:"network-only",variables:{_id:_}}).valueChanges.pipe((0,b.U)(h=>h.data.GetOneStepNotificationAndMessage))}getOneFormBuilderStepType(_){return this.apollo.query({query:m.ZP`
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
        `,variables:{_id:_},fetchPolicy:"network-only"}).pipe((0,b.U)(h=>h.data.GetOneFormBuilderStep))}updateStepNotificationAndMessage(_,h){return this.apollo.mutate({mutation:m.ZP`
          mutation UpdateStepNotificationAndMessage($_id: ID!, $step_notification_and_message_input: StepNotificationAndMessageInput) {
            UpdateStepNotificationAndMessage(_id: $_id, step_notification_and_message_input: $step_notification_and_message_input) {
              _id
            }
          }
        `,variables:{_id:_,step_notification_and_message_input:h}}).pipe((0,b.U)(O=>O.data.UpdateStepNotificationAndMessage))}getAllFormBuilderKey(_,h,O){return this.apollo.query({query:m.ZP`
          query GetAllFormBuilderKey($filter: FilterKeyInput, $lang: String, $form_builder_step_id: ID) {
            GetAllFormBuilderKey(filter: $filter, lang: $lang, form_builder_step_id: $form_builder_step_id) {
              key
              description
            }
          }
        `,variables:{filter:_,lang:h,form_builder_step_id:O},fetchPolicy:"network-only"}).pipe((0,b.U)(I=>I.data.GetAllFormBuilderKey))}SendPreviewStepNotification(_,h,O,I){return this.apollo.mutate({mutation:m.ZP`
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
        `,variables:{step_id:_,is_preview:h,lang:O,notification_id:I}}).pipe((0,b.U)(S=>S.data.SendPreviewFormBuilderStepNotification))}generateFormBuilderStepMessage(_,h,O,I,S){return this.apollo.mutate({mutation:m.ZP`
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
        `,variables:{step_id:_,form_process_id:h,is_preview:O,trigger_condition:I,message_id:S||null}}).pipe((0,b.U)(k=>k.data.GenerateFormBuilderStepMessage))}generateFormBuilderContractTemplatePDF(_,h){return this.apollo.mutate({mutation:m.ZP`
        mutation GenerateFormBuilderContractTemplatePDF{
          GenerateFormBuilderContractTemplatePDF(
            _id: "${_}",
            is_preview: true
            lang: "${h}"
          )
        }
        `}).pipe((0,b.U)(O=>O.data.GenerateFormBuilderContractTemplatePDF))}GenerateStepMessage(_,h,O){return this.apollo.mutate({mutation:m.ZP`
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
        `,variables:{step_id:_,form_process_id:h,is_preview:O}}).pipe((0,b.U)(I=>I.data.GenerateFormBuilderStepMessage))}getOneCandidateAdmission(_){return this.apollo.query({query:m.ZP`
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
        `,fetchPolicy:"network-only",variables:{_id:_}}).pipe((0,b.U)(h=>h.data.GetOneCandidate))}getAllAdmissionFinancements(_,h){return this.apollo.query({query:m.ZP`
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
        `,fetchPolicy:"network-only",variables:{filter:_,pagination:h}}).pipe((0,b.U)(O=>O.data.GetAllAdmissionFinancements))}}return p.\u0275fac=function(_){return new(_||p)(A.\u0275\u0275inject(C._M))},p.\u0275prov=A.\u0275\u0275defineInjectable({token:p,factory:p.\u0275fac,providedIn:"root"}),p})()},4987:(ft,et,M)=>{M.d(et,{K:()=>H});var m=M(65938),z=M(68745),b=M(35226),A=M.n(b),C=M(94650),rt=M(74717),p=M(52688),t=M(89383),_=M(11481),h=M(73555),O=M(4859),I=M(97392),S=M(10266),k=M(24006),d=M(24784),V=M(36895);function q(x,F){if(1&x&&(C.\u0275\u0275elementStart(0,"div",4)(1,"div",10),C.\u0275\u0275element(2,"img",11),C.\u0275\u0275elementEnd()()),2&x){const f=C.\u0275\u0275nextContext(2);C.\u0275\u0275advance(2),C.\u0275\u0275property("src",null==f.dataMessage?null:f.dataMessage.image,C.\u0275\u0275sanitizeUrl)}}function P(x,F){if(1&x&&(C.\u0275\u0275elementStart(0,"span"),C.\u0275\u0275text(1),C.\u0275\u0275pipe(2,"translate"),C.\u0275\u0275elementEnd()),2&x){const f=C.\u0275\u0275nextContext(3);C.\u0275\u0275advance(1),C.\u0275\u0275textInterpolate2("",C.\u0275\u0275pipeBind1(2,2,null==f.dataMessage?null:f.dataMessage.second_button)," (",f.count," s)")}}function J(x,F){if(1&x&&(C.\u0275\u0275elementStart(0,"span"),C.\u0275\u0275text(1),C.\u0275\u0275pipe(2,"translate"),C.\u0275\u0275elementEnd()),2&x){const f=C.\u0275\u0275nextContext(3);C.\u0275\u0275advance(1),C.\u0275\u0275textInterpolate(C.\u0275\u0275pipeBind1(2,1,null==f.dataMessage?null:f.dataMessage.second_button))}}const y=function(x){return{disabledd:x}};function R(x,F){if(1&x){const f=C.\u0275\u0275getCurrentView();C.\u0275\u0275elementStart(0,"mat-dialog-actions",12)(1,"button",13),C.\u0275\u0275listener("click",function(){C.\u0275\u0275restoreView(f);const T=C.\u0275\u0275nextContext(2);return C.\u0275\u0275resetView(T.closeDialog())}),C.\u0275\u0275pipe(2,"translate"),C.\u0275\u0275elementStart(3,"span"),C.\u0275\u0275text(4),C.\u0275\u0275pipe(5,"translate"),C.\u0275\u0275elementEnd(),C.\u0275\u0275elementStart(6,"mat-icon",14),C.\u0275\u0275text(7,"touch_app"),C.\u0275\u0275elementEnd()(),C.\u0275\u0275elementStart(8,"button",15),C.\u0275\u0275listener("click",function(){C.\u0275\u0275restoreView(f);const T=C.\u0275\u0275nextContext(2);return C.\u0275\u0275resetView(T.closeDialog("accept"))}),C.\u0275\u0275pipe(9,"translate"),C.\u0275\u0275template(10,P,3,4,"span",16),C.\u0275\u0275template(11,J,3,3,"span",16),C.\u0275\u0275elementStart(12,"mat-icon",14),C.\u0275\u0275text(13,"touch_app"),C.\u0275\u0275elementEnd()()()}if(2&x){const f=C.\u0275\u0275nextContext(2);C.\u0275\u0275advance(1),C.\u0275\u0275propertyInterpolate("matTooltip",C.\u0275\u0275pipeBind1(2,7,null==f.dataMessage?null:f.dataMessage.first_button)),C.\u0275\u0275advance(3),C.\u0275\u0275textInterpolate(C.\u0275\u0275pipeBind1(5,9,null==f.dataMessage?null:f.dataMessage.first_button)),C.\u0275\u0275advance(4),C.\u0275\u0275propertyInterpolate("matTooltip",C.\u0275\u0275pipeBind1(9,11,null==f.dataMessage?null:f.dataMessage.second_button)),C.\u0275\u0275property("ngClass",C.\u0275\u0275pureFunction1(13,y,0!==f.count))("disabled",0!==f.count),C.\u0275\u0275advance(2),C.\u0275\u0275property("ngIf",0!==f.count),C.\u0275\u0275advance(1),C.\u0275\u0275property("ngIf",0===f.count)}}function Q(x,F){if(1&x&&(C.\u0275\u0275elementStart(0,"div",1)(1,"form",2)(2,"div")(3,"mat-dialog-content",3)(4,"div",4)(5,"div",5),C.\u0275\u0275element(6,"b",6),C.\u0275\u0275elementEnd()(),C.\u0275\u0275elementStart(7,"div",7)(8,"div",5),C.\u0275\u0275element(9,"b",6),C.\u0275\u0275elementEnd()(),C.\u0275\u0275template(10,q,3,1,"div",8),C.\u0275\u0275element(11,"br"),C.\u0275\u0275elementEnd(),C.\u0275\u0275template(12,R,14,15,"mat-dialog-actions",9),C.\u0275\u0275elementEnd()()()),2&x){const f=C.\u0275\u0275nextContext();C.\u0275\u0275advance(6),C.\u0275\u0275property("innerHTML",null==f.dataMessage?null:f.dataMessage.subject,C.\u0275\u0275sanitizeHtml),C.\u0275\u0275advance(3),C.\u0275\u0275property("innerHTML",f.bodyMessage,C.\u0275\u0275sanitizeHtml),C.\u0275\u0275advance(1),C.\u0275\u0275property("ngIf",null==f.dataMessage?null:f.dataMessage.image),C.\u0275\u0275advance(2),C.\u0275\u0275property("ngIf",f.dataMessage)}}let H=(()=>{class x{constructor(f,D,T,L,_t,mt){this.dialogRef=f,this.formBuilderService=D,this.userService=T,this.translate=L,this.sanitizer=_t,this.data=mt,this.subs=new z.Y,this.isWaitingForResponse=!1,this.buttonDisabled=!0,this.time=125,this.count=5,this.timeout=setInterval(()=>{this.count>0?this.count-=1:clearInterval(this.timeout)},1e3)}ngOnInit(){this.getTaskMessage(),this.currentUser=this.userService.getLocalStorageUser()}getTaskMessage(){this.isWaitingForResponse=!0,this.data.step_id&&(this.subs.sink=this.formBuilderService.generateFormBuilderStepMessage(this.data.step_id,this.data.form_process_id,this.data.is_preview,this.data&&this.data.triggerCondition?this.data.triggerCondition:null,this.data&&this.data.dataPreview&&this.data.dataPreview._id?this.data.dataPreview._id:null).subscribe(T=>{this.isWaitingForResponse=!1,T?(this.dataMessage=T,this.bodyMessage=this.sanitizer.bypassSecurityTrustHtml(this.dataMessage?.body)):this.closeDialog("empty")},T=>{this.isWaitingForResponse=!1,this.userService.postErrorLog(T),A().fire({type:"warning",title:this.translate.instant("ContractPreview_S2.TITLE"),text:this.translate.instant("ContractPreview_S2.TEXT"),confirmButtonText:this.translate.instant("ContractPreview_S2.BUTTON"),allowEnterKey:!1,allowEscapeKey:!1,allowOutsideClick:!1}).then(()=>{this.dialogRef.close("errorpreview")})}))}closeDialog(f="cancel"){this.dialogRef.close({type:f})}ngOnDestroy(){this.subs.unsubscribe()}}return x.\u0275fac=function(f){return new(f||x)(C.\u0275\u0275directiveInject(m.so),C.\u0275\u0275directiveInject(rt.c),C.\u0275\u0275directiveInject(p.e),C.\u0275\u0275directiveInject(t.sK),C.\u0275\u0275directiveInject(_.H7),C.\u0275\u0275directiveInject(m.WI))},x.\u0275cmp=C.\u0275\u0275defineComponent({type:x,selectors:[["ms-step-dynamic-message-dialog"]],decls:1,vars:1,consts:[["class","background-dark","cdkDrag","","cdkDragRootElement",".cdk-overlay-pane","cdkDragHandle","",4,"ngIf"],["cdkDrag","","cdkDragRootElement",".cdk-overlay-pane","cdkDragHandle","",1,"background-dark"],[1,"header-form"],[1,"content-height"],[1,"p-grid"],[1,"p-col-12","text-center"],[2,"font-size","18px",3,"innerHTML"],[1,"p-grid",2,"max-height","78vh"],["class","p-grid",4,"ngIf"],["align","center","class","align-button",4,"ngIf"],[1,"p-col-12","align-button"],["height","200",1,"preview-image",3,"src"],["align","center",1,"align-button"],["mat-raised-button","","color","primary",1,"btn-opssi",2,"padding-left","5px","padding-right","8px",3,"matTooltip","click"],[1,"mat-icon-default"],["mat-raised-button","","color","accent",1,"btn-opssi",2,"padding-left","5px","padding-right","8px",3,"matTooltip","ngClass","disabled","click"],[4,"ngIf"]],template:function(f,D){1&f&&C.\u0275\u0275template(0,Q,13,4,"div",0),2&f&&C.\u0275\u0275property("ngIf",D.dataMessage)},dependencies:[h.Zt,h.Bh,O.lW,m.xY,m.H8,I.Hw,S.gM,k.\u0275NgNoValidate,k.NgControlStatusGroup,k.NgForm,d.oO,V.mk,V.O5,t.X$],styles:["[_nghost-%COMP%]  .mat-radio-outer-circle{border-color:#3f3f3f}[_nghost-%COMP%]  .mat-form-field-underline{background-color:#0000001f!important}.preview-image[_ngcontent-%COMP%]{margin:10px 0}.header-form[_ngcontent-%COMP%]{padding:18px}.footer-form[_ngcontent-%COMP%]{padding:0 18px 18px}.no-margin[_ngcontent-%COMP%]{margin:0!important}.disabledd[_ngcontent-%COMP%]{background-color:#565656!important;color:#ababab!important}.no-padding[_ngcontent-%COMP%]{padding:0!important}.no-padding-y[_ngcontent-%COMP%]{padding-top:0!important;padding-bottom:0!important}.no-padding-b[_ngcontent-%COMP%], .no-padding-t[_ngcontent-%COMP%]{padding-bottom:0!important}.float-left[_ngcontent-%COMP%]{float:left}.align-button[_ngcontent-%COMP%]{text-align:center!important}[_nghost-%COMP%]     .mat-dialog-content{margin:0!important;padding:0!important;max-height:unset}.step-validation[_ngcontent-%COMP%]{max-height:390px}.background-dark[_ngcontent-%COMP%]{background-color:#3f3f3f;color:#fff}.background-grey[_ngcontent-%COMP%]{background-color:#78909c;color:#fff}.background-white[_ngcontent-%COMP%]{background-color:#fff;color:#000}.color-dark[_ngcontent-%COMP%]{color:#3f3f3f!important}"]}),x})()}}]);