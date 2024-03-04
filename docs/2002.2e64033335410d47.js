"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[2002],{72002:(P,p,l)=>{l.d(p,{Q:()=>g});var r=l(13125),s=l(24850),_=l(94650),u=l(18497),c=l(89383);let g=(()=>{class a{constructor(e,t){this.apollo=e,this.translate=t}getAllFormFollowUpDropdown(e,t){return this.apollo.query({query:r.ZP`
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
        `,fetchPolicy:"network-only",variables:{template_type:e,user_type_ids:t}}).pipe((0,s.U)(i=>i.data.GetAllFormFollowUpDropdown))}getAllGeneralFormFollowUpDropdown(e,t){return this.apollo.query({query:r.ZP`
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
        `,fetchPolicy:"network-only",variables:{form_builder_id:e,user_type_ids:t}}).pipe((0,s.U)(i=>i.data.GetAllGeneralFormFollowUpDropdown))}getallSchoolDetailForm(e,t){return this.apollo.query({query:r.ZP`
          query GetAllCandidateSchoolDetail($filter: CandidateSchoolFilterInput) {
            GetAllCandidateSchool(filter: $filter) {
              _id
              short_name
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e,user_type_id:t}}).pipe((0,s.U)(i=>i.data.GetAllCandidateSchool))}getAllFormFollowUp(e,t,i,o){return this.apollo.query({query:r.ZP`
          query GetAllFormFollowUp($pagination: PaginationInput, $sorting: FormFollowUpSortingInput, $template_type: [String]) {
            GetAllFormFollowUp(filter : {${e}}, sorting : $sorting, pagination : $pagination, template_type: $template_type) {
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
        `,variables:{pagination:i,sorting:t||null,template_type:o&&o.length>0?o:null},fetchPolicy:"network-only"}).pipe((0,s.U)(n=>n.data.GetAllFormFollowUp))}getRncpClass(e,t){return this.apollo.query({query:r.ZP`
          query GetAllFormFollowUp($pagination: PaginationInput) {
            GetAllFormFollowUp(filter : {${e}},  pagination : $pagination) {
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
        `,variables:{pagination:t},fetchPolicy:"network-only"}).pipe((0,s.U)(i=>i.data.GetAllFormFollowUp))}getAllStudentAdmissionProcesses(e,t,i){return this.apollo.query({query:r.ZP`
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
        `,variables:{pagination:e,sorting:i||{},filter:t},fetchPolicy:"network-only"}).pipe((0,s.U)(o=>o.data.GetAllStudentAdmissionProcesses))}getAllFormProcesses(e,t,i){return this.apollo.query({query:r.ZP`
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
        `,variables:{pagination:e,sorting:i||{},filter:t},fetchPolicy:"network-only"}).pipe((0,s.U)(o=>o.data.GetAllFormProcesses))}getAllJoinedFormProcessForStudentCard(e,t,i,o,n){return this.apollo.query({query:r.ZP`
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
        `,variables:{intake_channel:t,candidate_id:e,pagination:i,sorting:n||{},filter:o,lang:this.translate.currentLang},fetchPolicy:"network-only"}).pipe((0,s.U)(d=>d.data.GetAllJoinedFormProcess))}getAllFormFollowUpProcesses(e,t,i,o){return this.apollo.query({query:r.ZP`
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
        `,variables:{pagination:e,sorting:i||{},filter:t,user_type_ids:o},fetchPolicy:"network-only"}).pipe((0,s.U)(n=>n.data.GetAllFormProcesses))}getAllIdForSendReminder(e,t,i,o){return this.apollo.query({query:r.ZP`
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
        `,variables:{pagination:e,sorting:i||{},filter:t,user_type_ids:o},fetchPolicy:"network-only"}).pipe((0,s.U)(n=>n.data.GetAllFormProcesses))}getAllEmailFormProcess(e,t,i,o){return this.apollo.query({query:r.ZP`
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
        `,variables:{pagination:e,sorting:i||{},filter:t,user_type_ids:o},fetchPolicy:"network-only"}).pipe((0,s.U)(n=>n.data.GetAllFormProcesses))}getStepTypeNotificationMessage(e){return this.apollo.query({query:r.ZP`
          query GetAllStepNotificationsAndMessages($form_builder_id: ID!) {
            GetAllStepNotificationsAndMessages(form_builder_id: $form_builder_id) {
              _id
              type
              trigger_condition
            }
          }
        `,variables:{form_builder_id:e},fetchPolicy:"network-only"}).pipe((0,s.U)(t=>t.data.GetAllStepNotificationsAndMessages))}sendReminderFormProcess(e,t){return this.apollo.mutate({mutation:r.ZP`
        mutation SendReminderFormProcess{
          SendReminderFormProcess(form_process_id: "${e}", lang:"${t}")
        }
        `}).pipe((0,s.U)(i=>i.data.SendReminderFormProcess))}getAllAdmissionDocumentProcesses(e,t,i){return this.apollo.query({query:r.ZP`
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
        `,variables:{filter:t,sorting:i,pagination:e},fetchPolicy:"network-only"}).pipe((0,s.U)(o=>o.data.GetAllAdmissionDocumentProcesses))}sendReminderOneTimeForm(e,t,i){return this.apollo.mutate({mutation:r.ZP`
          mutation SendReminderOneTimeForm($form_process_ids: [ID], $form_builder_id: ID, $lang: String) {
            SendReminderOneTimeForm(form_process_ids: $form_process_ids, form_builder_id: $form_builder_id, lang: $lang)
          }
        `,variables:{form_process_ids:e||null,form_builder_id:t||null,lang:i}}).pipe((0,s.U)(o=>o.data.SendReminderOneTimeForm))}sendReminderAdmissionDocument(e,t,i){return this.apollo.mutate({mutation:r.ZP`
          mutation Send_ADM_DOC_N4($programID: ID, $processID: ID, $formBuilderID: ID, $lang: String) {
            Send_ADM_DOC_N4(program_id: $programID, form_process_id: $processID, form_builder_id: $formBuilderID, lang: $lang)
          }
        `,variables:{programID:e,processID:t,formBuilderID:i,lang:this.translate.currentLang}}).pipe((0,s.U)(o=>o.data.Send_ADM_DOC_N4))}generateFormProcessCSV(e,t,i,o,n,d,y,m){return this.apollo.mutate({mutation:r.ZP`
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
        `,variables:{form_process_ids:t||null,form_builder_id:e||null,lang:n,delimiter:i,file_name:o,sorting:y,offset:d,user_type_id:m||null}}).pipe((0,s.U)($=>$.data.GenerateFormProcessCSV))}}return a.\u0275fac=function(e){return new(e||a)(_.\u0275\u0275inject(u._M),_.\u0275\u0275inject(c.sK))},a.\u0275prov=_.\u0275\u0275defineInjectable({token:a,factory:a.\u0275fac,providedIn:"root"}),a})()}}]);