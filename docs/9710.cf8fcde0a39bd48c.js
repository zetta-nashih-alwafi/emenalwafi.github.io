"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[9710],{79710:(S,$,c)=>{c.d($,{o:()=>A});var d=c(591),n=c(13125),s=c(24850),f=c(92340),h=c(94650),C=c(80529),v=c(18497),b=c(89383);let A=(()=>{class y{constructor(e,t,a){this.httpClient=e,this.apollo=t,this.translate=a,this.sideNavTutorial=!1,this.widthMainContent=100,this.widthSideContent=0,this.indexStep=new d.X(null),this.statusStepOne=new d.X(!1),this.statusStepTwo=new d.X(!1),this.statusStepThree=new d.X(!1),this.statusStepFour=new d.X(!1),this.statusStepFive=new d.X(!1),this.statusStepSix=new d.X(!1),this.statusStepSeven=new d.X(!1),this.statusStepEight=new d.X(!1),this.statusStepNine=new d.X(!1),this.statusStepTen=new d.X(!1),this.statusEditMode=new d.X(!1),this.statusEditModeTwo=new d.X(!1),this.statusEditModeThree=new d.X(!1),this.statusEditModeFour=new d.X(!1),this.statusEditModeFive=new d.X(!1),this.statusEditModeSix=new d.X(!1),this.statusEditModeSeven=new d.X(!1),this.statusEditModeEight=new d.X(!1),this.tutorialContractActive=new d.X(!1),this.dataCandidate=new d.X(null),this.formStepTwo=new d.X(null),this.dataCompany=new d.X(null),this.dataJobOfferOne=new d.X(null),this.dataJobOfferTwo=new d.X(null),this.dataJobOfferThree=new d.X(null),this.dataContractStepOne=new d.X(null),this.dataContractStepTwo=new d.X(null),this.dataContractStepThree=new d.X(null),this.dataContractStepFour=new d.X(null),this.dataContractStepFive=new d.X(null),this.dataContractStepSix=new d.X(null),this.dataSurvey=new d.X(null),this.tutorialSelected=new d.X(null),this.stepOneForm=new d.X(!1),this.candidateOneStduent=new d.X(null),this.isSaved=new d.X(!1),this.isSaved$=this.isSaved.asObservable()}setIsSaved(){this.isSaved.next(!0)}setIndexStep(e){this.indexStep.next(e)}setStatusStepOne(e){this.statusStepOne.next(e)}setTutorialSelected(e){this.tutorialSelected.next(e)}setTutorialContractActive(e){this.tutorialContractActive.next(e)}setStatusStepTwo(e){this.statusStepTwo.next(e)}setFormStepTwo(e){this.formStepTwo.next(e)}setStatusStepThree(e){this.statusStepThree.next(e)}setStatusStepFour(e){this.statusStepFour.next(e)}setStatusStepFive(e){this.statusStepFive.next(e)}setStatusStepSix(e){this.statusStepSix.next(e)}setStatusStepSeven(e){this.statusStepSeven.next(e)}setStatusStepEight(e){this.statusStepEight.next(e)}setStatusStepNine(e){this.statusStepNine.next(e)}setStatusStepTen(e){this.statusStepTen.next(e)}setStatusEditMode(e){this.statusEditMode.next(e)}setStatusEditModeTwo(e){this.statusEditModeTwo.next(e)}setStatusEditModeThree(e){this.statusEditModeThree.next(e)}setStatusEditModeFour(e){this.statusEditModeFour.next(e)}setStatusEditModeFive(e){this.statusEditModeFive.next(e)}setStatusEditModeSix(e){this.statusEditModeSix.next(e)}setStatusEditModeSeven(e){this.statusEditModeSeven.next(e)}setStatusEditModeEight(e){this.statusEditModeEight.next(e)}setDataCandidate(e){this.dataCandidate.next(e)}setDataJobOne(e){this.dataJobOfferOne.next(e)}setDataCompany(e){this.dataCompany.next(e)}setDataJobTwo(e){this.dataJobOfferTwo.next(e)}setDataJobThree(e){this.dataJobOfferThree.next(e)}setDataContractStepOne(e){this.dataContractStepOne.next(e)}setDataContractStepTwo(e){this.dataContractStepTwo.next(e)}setDataContractStepThree(e){this.dataContractStepThree.next(e)}setDataContractStepFour(e){this.dataContractStepFour.next(e)}setDataContractStepFive(e){this.dataContractStepFive.next(e)}setDataContractStepSix(e){this.dataContractStepSix.next(e)}setDataSurvey(e){this.dataSurvey.next(e)}setCandidateOneStduent(e){this.candidateOneStduent.next(e)}disableValidateStepOne(e){this.stepOneForm.next(e)}getAllTags(e,t,a,i){return this.apollo.watchQuery({query:n.ZP`
          query GetAllTags(
            $menuTable: EnumMenuTable
            $isUsedByStudent: Boolean
            $userTypeIds: [ID]
            $candidateAdmissionStatuses: [EnumCandidateAdmissionStatus]
          ) {
            GetAllTags(
              menu_table: $menuTable
              is_used_by_student: $isUsedByStudent
              user_type_ids: $userTypeIds
              candidate_admission_statuses: $candidateAdmissionStatuses
            ) {
              _id
              name
            }
          }
        `,variables:{isUsedByStudent:e,menuTable:t,userTypeIds:a,candidateAdmissionStatuses:i},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(o=>o.data.GetAllTags))}getAllAdmissionMember(e,t,a){return this.apollo.watchQuery({query:n.ZP`
          query GetAllAdmissionMembers($pagination: PaginationInput, $sort: AdmissionMemberSortingInput) {
            GetAllAdmissionMembers(pagination: $pagination, sorting: $sort, ${a}) {
                user_id {
                  _id
                  dev_member_intake_channels
                  first_name
                  last_name
                  civility
                  profile_picture
                  portable_phone
                  email
                  entities {
                    school {
                      _id
                      short_name
                    }
                    campus {
                      _id
                      name
                    }
                  }
                }
                count_document
                work_location
                number_candidate_affected
                number_candidate_first_call_not_done
                number_candidate_first_call_done
                percentage_candidate_first_call_done
                number_candidate_first_email_not_done
                number_candidate_first_email_done
                percentage_candidate_first_email_done
                number_candidate_lost
                number_candidate_low
                number_candidate_medium
                number_candidate_high
                number_candidate_not_registered
                number_candidate_registered
                percentage_candidate_registered
                number_candidate_connection_not_done
                number_candidate_connection_done
                percentage_candidate_connection_done
                number_candidate_personal_information_not_done
                number_candidate_personal_information_done
                percentage_candidate_personal_information_done
                number_candidate_signature_not_done
                number_candidate_signature_done
                percentage_candidate_signature_done
                number_candidate_method_of_payment_not_done
                number_candidate_method_of_payment_done
                percentage_candidate_method_of_payment_done
                number_candidate_payment_not_done
                number_candidate_payment_done
                percentage_candidate_payment_done
              }
            }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(i=>i.data.GetAllAdmissionMembers))}getAllFormContractFCProcesses(e,t,a){return this.apollo.query({query:n.ZP`query GetAllFormProcesses($pagination: PaginationInput, $sorting: FormProcessSortingInput, $user_type_ids: [ID])  {
        GetAllFormProcesses (
          ${t}
          pagination: $pagination,
          sorting: $sorting
          user_type_ids: $user_type_ids
          ) {
            _id
            user_who_reject_and_stop{
              _id
              first_name
              last_name
              civility
            }
            rejected_and_stop_at{
              date
              time
            }
            reason_rejected
            candidate_id {
              _id
              first_name
              last_name
              civility
              email
              school_mail
              intake_channel {
                _id
                program
              }
              scholar_season {
                _id
                scholar_season
              }
              payment_supports {
                relation
                family_name
                name
                civility
                email
                parent_address {
                  address
                  additional_address
                  postal_code
                  city
                  region
                  department
                  country
                }
              }
              candidate_unique_number
            }
            contract_validator_signatory_status {
              user_id {
                civility
                first_name
                last_name
              }
              is_already_sign
            }
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
              form_builder_name
              steps {
                _id
                step_title
                user_who_complete_step {
                  name
                }
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
            admission_financement_ids {
              _id
              organization_id {
                _id
                organization_type
              }
              company_branch_id {
                _id
                company_name
              }
            }
            admission_status
            contract_manager {
              _id
              civility
              first_name
              last_name
            }
            send_date {
              date
              time
            }
            created_at
            start_date
            end_date
            count_document
            contract_status
            financer
            user_id {
              _id
              first_name
              last_name
              civility
            }
        }
      }`,variables:{pagination:e,user_type_ids:a||""},fetchPolicy:"network-only"}).pipe((0,s.U)(i=>i.data.GetAllFormProcesses))}getAllScholarSeasonCRMDropdown(){return this.apollo.query({query:n.ZP`
          query GetAllScholarSeasonCRMDropdown{
            GetAllScholarSeasonCRMDropdown
          }
        `,fetchPolicy:"network-only"}).pipe((0,s.U)(e=>e.data.GetAllScholarSeasonCRMDropdown))}getAllFormContractFCProcessesStudentCard(e,t,a){return this.apollo.query({query:n.ZP`query GetAllFormProcesses($pagination: PaginationInput, $sorting: FormProcessSortingInput, $user_type_ids: [ID])  {
      GetAllFormProcesses (
        ${t}
        pagination: $pagination,
        sorting: $sorting
        user_type_ids: $user_type_ids
        ) {
          _id
          user_who_reject_and_stop{
            _id
            first_name
            last_name
            civility
          }
          rejected_and_stop_at{
            date
            time
          }
          reason_rejected
          candidate_id {
            _id
            civility
            first_name
            last_name
            candidate_unique_number
            email
            school_mail
            candidate_admission_status
            payment_supports {
              relation
              family_name
              name
              civility
              tele_phone
              email
              parent_address {
                address
                additional_address
                postal_code
                city
                region
                department
                country
              }
            }
            intake_channel {
              _id
              program
            }
          }
            contract_validator_signatory_status {
              user_id {
                civility
                first_name
                last_name
              }
              is_already_sign
            }
            form_builder_id {
              _id
              form_builder_name
              steps {
                _id
                step_title
                user_who_complete_step {
                  name
                }
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
            admission_financement_id {
              _id
              organization_name
              organization_id{
                _id
                organization_type
              }
            }
            start_date
            end_date
            contract_manager {
              _id
              civility
              first_name
              last_name
            }
            send_date {
              date
              time
            }
            financer
            contract_status
            count_document
            form_builder_pdf_s3_file_name
            admission_financement_ids {
              _id
              organization_id {
                _id
                organization_type
              }
              company_branch_id {
                _id
              }
            }
      }
    }`,variables:{pagination:e,user_type_ids:a||""},fetchPolicy:"network-only"}).pipe((0,s.U)(i=>i.data.GetAllFormProcesses))}generateContractPDF(e,t,a){return this.apollo.mutate({mutation:n.ZP`
          mutation GenerateFormBuilderContractTemplatePDF($form_process_step_id: ID, $formProcessStepId: ID, $isPreview: Boolean, $lang: String) {
            GenerateFormBuilderContractTemplatePDF(_id: $form_process_step_id, form_process_step_id: $formProcessStepId, is_preview: $isPreview, lang: $lang)
          }
        `,variables:{formBuilderId:e,formProcessStepId:t,isPreview:a,lang:localStorage.getItem("currentLang")}}).pipe((0,s.U)(i=>i.data.GenerateFormBuilderContractTemplatePDF))}getAllDataContractAdmission(e,t,a){return this.apollo.query({query:n.ZP`query GetAllFormProcesses($pagination: PaginationInput, $sorting: FormProcessSortingInput, $user_type_ids: [ID])  {
        GetAllFormProcesses (
          ${t}
          pagination: $pagination,
          sorting: $sorting
          user_type_ids: $user_type_ids
          ) {
            _id
            candidate_id {
              _id
              first_name
              last_name
              civility
              intake_channel {
                _id
                program
              }
              scholar_season {
                _id
                scholar_season
              }
              candidate_unique_number
            }
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
              form_builder_name
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
            admission_financement_ids {
              _id
              organization_id {
                _id
                organization_type
              }
              company_branch_id {
                _id
                company_name
              }
            }
            admission_status
            contract_manager {
              _id
              civility
              first_name
              last_name
            }
            send_date {
              date
              time
            }
            created_at
            start_date
            end_date
            count_document
            contract_status
            financer
            user_id {
              _id
              first_name
              last_name
              civility
            }
        }
      }`,variables:{pagination:e,user_type_ids:a},fetchPolicy:"network-only"}).pipe((0,s.U)(i=>i.data.GetAllFormProcesses))}getAllFormProcessesCheckboxId(e,t,a){return this.apollo.query({query:n.ZP`query GetAllFormProcesses($pagination: PaginationInput, $sorting: FormProcessSortingInput, $user_type_ids: [ID])  {
        GetAllFormProcesses (
          ${t}
          pagination: $pagination,
          sorting: $sorting
          user_type_ids: $user_type_ids
          ) {
            _id
        }
      }`,variables:{pagination:e,user_type_ids:a},fetchPolicy:"network-only"}).pipe((0,s.U)(i=>i.data.GetAllFormProcesses))}getTemplateNameDropdown(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllTemplateNameDropdown {
            GetAllTemplateNameDropdown
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(e=>e.data.GetAllTemplateNameDropdown))}getAllContactsOrg(e){return this.apollo.watchQuery({query:n.ZP`
          query GetAllContacts($organization_ids: [ID]) {
            GetAllContacts(organization_ids: $organization_ids) {
              _id
              email
              civility
              first_name
              last_name
            }
          }
        `,variables:{organization_ids:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllContacts))}getAllUsersCompanyContract(e){return this.apollo.watchQuery({query:n.ZP`
          query GetAllUsersCompanyContract{
            GetAllUsers(company_staff: true, company: "${e}") {
              _id
              email
              civility
              first_name
              last_name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllUsers))}getAllUserManyCompanyContract(e){return this.apollo.watchQuery({query:n.ZP`
          query GetAllUsers($companies: [ID]) {
            GetAllUsers(company_staff: true, companies: $companies) {
              _id
              email
              civility
              first_name
              last_name
            }
          }
        `,variables:{companies:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllUsers))}getFinancierDropdown(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllFinancerDropdown {
            GetAllFinancerDropdown
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(e=>e.data.GetAllFinancerDropdown))}getTypeOfFinancementDropdown(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllTypeOfFinancementDropdown {
            GetAllTypeOfFinancementDropdown
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(e=>e.data.GetAllTypeOfFinancementDropdown))}getContractManagerDropdown(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllContractManagerDropdown {
            GetAllContractManagerDropdown {
              _id
              civility
              first_name
              last_name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(e=>e.data.GetAllContractManagerDropdown))}getAllCandidatesWithUserType(e,t,a,i){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}) {
                  _id
                  jury_decision
                  trial_date
                  region
                  civility
                  first_name
                  last_name
                  telephone
                  payment_method
                  is_admitted
                  email
                  is_oscar_updated
                  finance
                  nationality
                  candidate_unique_number
                  candidate_admission_status
                  financement
                  school_mail
                  diploma_status
                  admission_document_process_status
                  billing_id {
                    _id
                    deposit_status
                    is_deposit_completed
                    deposit_pay_amount
                    deposit
                    account_number
                  }
                  campus {
                    _id
                    name
                    address
                    levels {
                      _id
                      name
                    }
                    specialities {
                      _id
                      name
                    }
                  }
                  photo
                  registration_email_due_date {
                    due_date
                    due_time
                  }
                  reg_n8_sent_date {
                    sent_date
                    sent_time
                  }
                  announcement_call
                  announcement_email {
                    sent_date
                    sent_time
                  }
                  intake_channel {
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                    sigle
                    admission_form_id {
                      _id
                      form_builder_name
                    }
                  }
                  registration_profile {
                    _id
                    name
                    is_down_payment
                    discount_on_full_rate
                    type_of_formation {
                      _id
                      type_of_information
                    }
                    additional_cost_ids {
                      additional_cost
                      amount
                    }
                  }
                  engagement_level
                  level {
                    _id
                    name
                    specialities {
                      _id
                      name
                    }
                  }
                  speciality {
                    _id
                    name
                  }
                  scholar_season {
                    _id
                    scholar_season
                  }
                  sector {
                    _id
                    name
                  }
                  school {
                    _id
                    short_name
                    long_name
                    campuses {
                      _id
                      name
                      levels {
                        _id
                        name
                      }
                    }
                  }
                  connection
                  personal_information
                  signature
                  method_of_payment
                  payment
                  admission_member_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  fixed_phone
                  is_whatsapp
                  participate_in_open_house_day
                  participate_in_job_meeting
                  count_document
                  user_id {
                    _id
                  }
                  # This one from 049
                  payment_splits {
                    payer_name
                    percentage
                  }
                  payment_supports {
                    relation
                    family_name
                    name
                    civility
                    tele_phone
                    email
                    parent_address {
                      address
                      additional_address
                      postal_code
                      city
                      region
                      department
                      country
                    }
                  }
                  program_desired
                  trial_date
                  date_added
                  selected_payment_plan {
                    name
                    times
                    additional_expense
                    total_amount
                    payment_date {
                      date
                      amount
                    }
                    down_payment
                  }
                  registered_at {
                    date
                    time
                  }
                  resign_after_school_begins_at {
                    date
                    time
                  }
                  no_show_at {
                    date
                    time
                  }
                  hubspot_deal_id
                  hubspot_contact_id
                  is_hubspot_updated
                  is_manual_updated
                  continuous_formation_manager_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  admission_process_id {
                    _id
                    steps {
                      _id
                      index
                      step_title
                      step_type
                      step_status
                      status
                      is_only_visible_based_on_condition
                    }
                  }
                  latest_previous_program{
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_readmission
                  previous_programs {
                    _id
                  }
                }
              }
        `,variables:{user_type_ids:i||"",pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(o=>o.data.GetAllCandidates))}getAllCandidatesFITable(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
                  _id
                  jury_decision
                  trial_date
                  region
                  civility
                  first_name
                  last_name
                  telephone
                  payment_method
                  is_admitted
                  email
                  is_oscar_updated
                  finance
                  nationality
                  registration_profile_type
                  candidate_unique_number
                  candidate_admission_status
                  is_future_program_assigned
                  program_status
                  is_program_assigned
                  financement
                  school_mail
                  diploma_status
                  admission_document_process_status
                  billing_id {
                    _id
                    deposit_status
                    is_deposit_completed
                    deposit_pay_amount
                    deposit
                    account_number
                  }
                  campus {
                    _id
                    name
                    address
                    levels {
                      _id
                      name
                    }
                    specialities {
                      _id
                      name
                    }
                  }
                  photo
                  registration_email_due_date {
                    due_date
                    due_time
                  }
                  reg_n8_sent_date {
                    sent_date
                    sent_time
                  }
                  announcement_call
                  announcement_email {
                    sent_date
                    sent_time
                  }
                  intake_channel {
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                    sigle
                    admission_form_id {
                      _id
                      form_builder_name
                    }
                  }
                  registration_profile {
                    _id
                    name
                    is_down_payment
                    discount_on_full_rate
                    type_of_formation {
                      _id
                      type_of_information
                    }
                    additional_cost_ids {
                      additional_cost
                      amount
                    }
                  }
                  engagement_level
                  level {
                    _id
                    name
                    specialities {
                      _id
                      name
                    }
                  }
                  speciality {
                    _id
                    name
                  }
                  scholar_season {
                    _id
                    scholar_season
                  }
                  sector {
                    _id
                    name
                  }
                  school {
                    _id
                    short_name
                    long_name
                    campuses {
                      _id
                      name
                      levels {
                        _id
                        name
                      }
                    }
                  }
                  connection
                  personal_information
                  signature
                  method_of_payment
                  payment
                  admission_member_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  fixed_phone
                  is_whatsapp
                  participate_in_open_house_day
                  participate_in_job_meeting
                  count_document
                  user_id {
                    _id
                  }
                  payment_splits {
                    payer_name
                    percentage
                  }
                  payment_supports {
                    relation
                    family_name
                    name
                    civility
                    tele_phone
                    email
                    parent_address {
                      address
                      additional_address
                      postal_code
                      city
                      region
                      department
                      country
                    }
                  }
                  program_desired
                  trial_date
                  date_added
                  selected_payment_plan {
                    name
                    times
                    additional_expense
                    total_amount
                    payment_date {
                      date
                      amount
                    }
                    down_payment
                  }
                  registered_at {
                    date
                    time
                  }
                  resign_after_school_begins_at {
                    date
                    time
                  }
                  no_show_at {
                    date
                    time
                  }
                  hubspot_deal_id
                  hubspot_contact_id
                  is_hubspot_updated
                  is_manual_updated
                  continuous_formation_manager_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  admission_process_id {
                    _id
                    steps {
                      _id
                      index
                      step_title
                      step_type
                      step_status
                      status
                      is_only_visible_based_on_condition
                    }
                  }
                  latest_previous_program{
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_readmission
                  previous_programs {
                    _id
                  }
                }
              }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getAllAssignment(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput, $lang: String) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching, lang: $lang) {
                  _id
                  financial_situation
                  readmission_status
                  jury_decision
                  trial_date
                  region
                  civility
                  first_name
                  last_name
                  telephone
                  payment_method
                  is_admitted
                  email
                  is_oscar_updated
                  finance
                  nationality
                  registration_profile_type
                  candidate_unique_number
                  candidate_admission_status
                  financement
                  financial_situation
                  student_id{
                    _id
                  }
                  latest_previous_program {
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  initial_intake_channel
                  billing_id {
                    _id
                    deposit_status
                    is_deposit_completed
                    deposit_pay_amount
                    deposit
                    account_number
                    accumulated_late
                  }
                  campus {
                    _id
                    name
                    address
                    levels {
                      _id
                      name
                    }
                    specialities {
                      _id
                      name
                    }
                  }
                  photo
                  registration_email_due_date {
                    due_date
                    due_time
                  }
                  reg_n8_sent_date {
                    sent_date
                    sent_time
                  }
                  announcement_call
                  announcement_email {
                    sent_date
                    sent_time
                  }
                  intake_channel {
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                    sigle
                    admission_form_id {
                      _id
                      form_builder_name
                    }
                  }
                  registration_profile {
                    _id
                    name
                    is_down_payment
                    discount_on_full_rate
                    type_of_formation {
                      _id
                      type_of_information
                    }
                    additional_cost_ids {
                      additional_cost
                      amount
                    }
                  }
                  engagement_level
                  level {
                    _id
                    name
                    specialities {
                      _id
                      name
                    }
                  }
                  speciality {
                    _id
                    name
                  }
                  scholar_season {
                    _id
                    scholar_season
                  }
                  sector {
                    _id
                    name
                  }
                  school {
                    _id
                    short_name
                    long_name
                    campuses {
                      _id
                      name
                      levels {
                        _id
                        name
                      }
                    }
                  }
                  connection
                  personal_information
                  signature
                  method_of_payment
                  payment
                  admission_member_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  fixed_phone
                  is_whatsapp
                  participate_in_open_house_day
                  participate_in_job_meeting
                  count_document
                  user_id {
                    _id
                  }
                  payment_splits {
                    payer_name
                    percentage
                  }
                  payment_supports {
                    relation
                    family_name
                    name
                    civility
                    tele_phone
                    email
                    parent_address {
                      address
                      additional_address
                      postal_code
                      city
                      region
                      department
                      country
                    }
                  }
                  program_desired
                  trial_date
                  date_added
                  selected_payment_plan {
                    name
                    times
                    additional_expense
                    total_amount
                    payment_date {
                      date
                      amount
                    }
                    down_payment
                  }
                  registered_at {
                    date
                    time
                  }
                  resign_after_school_begins_at {
                    date
                    time
                  }
                  no_show_at {
                    date
                    time
                  }
                  hubspot_deal_id
                  hubspot_contact_id
                  is_hubspot_updated
                  is_manual_updated
                  continuous_formation_manager_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  admission_process_id {
                    _id
                    steps {
                      _id
                      index
                      step_title
                      step_type
                      step_status
                      status
                    }
                  }
                }
              }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{},lang:this.translate.currentLang},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getAllAssignmentCheckbox(e,t,a,i){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($pagination: PaginationInput, $sort: CandidateSortInput, $user_type_ids: [ID]) {
          GetAllCandidates(${e}, sorting: $sort, pagination: $pagination, user_type_ids: $user_type_ids) {
                  _id
                  jury_decision
                  trial_date
                  region
                  civility
                  first_name
                  last_name
                  telephone
                  payment_method
                  is_admitted
                  email
                  is_oscar_updated
                  finance
                  nationality
                  registration_profile_type
                  candidate_unique_number
                  candidate_admission_status
                  billing_id {
                    _id
                    deposit_status
                    is_deposit_completed
                    deposit_pay_amount
                    deposit
                    account_number
                  }
                  campus {
                    _id
                    name
                    address
                    levels {
                      _id
                      name
                    }
                    specialities {
                      _id
                      name
                    }
                  }
                  photo
                  registration_email_due_date {
                    due_date
                    due_time
                  }
                  reg_n8_sent_date {
                    sent_date
                    sent_time
                  }
                  announcement_call
                  announcement_email {
                    sent_date
                    sent_time
                  }
                  intake_channel {
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                  }
                  registration_profile {
                    _id
                    name
                    is_down_payment
                    discount_on_full_rate
                    type_of_formation {
                      _id
                      type_of_information
                    }
                    additional_cost_ids {
                      additional_cost
                      amount
                    }
                  }
                  engagement_level
                  level {
                    _id
                    name
                    specialities {
                      _id
                      name
                    }
                  }
                  speciality {
                    _id
                    name
                  }
                  scholar_season {
                    _id
                    scholar_season
                  }
                  sector {
                    _id
                    name
                  }
                  school {
                    _id
                    short_name
                    long_name
                    campuses {
                      _id
                      name
                      levels {
                        _id
                        name
                      }
                    }
                  }
                  connection
                  personal_information
                  signature
                  method_of_payment
                  payment
                  admission_member_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  fixed_phone
                  is_whatsapp
                  participate_in_open_house_day
                  participate_in_job_meeting
                  count_document
                  user_id {
                    _id
                  }
                  payment_splits {
                    payer_name
                    percentage
                  }
                  payment_supports {
                    relation
                    family_name
                    name
                    civility
                    tele_phone
                    email
                    parent_address {
                      address
                      additional_address
                      postal_code
                      city
                      region
                      department
                      country
                    }
                  }
                  program_desired
                  trial_date
                  date_added
                  selected_payment_plan {
                    name
                    times
                    additional_expense
                    total_amount
                    payment_date {
                      date
                      amount
                    }
                    down_payment
                  }
                  registered_at {
                    date
                    time
                  }
                  resign_after_school_begins_at {
                    date
                    time
                  }
                  no_show_at {
                    date
                    time
                  }
                  hubspot_deal_id
                  hubspot_contact_id
                  is_hubspot_updated
                  is_manual_updated
                }
              }
        `,variables:{pagination:a,sort:t||{},user_type_ids:i},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(o=>o.data.GetAllCandidates))}UpdateJuryDecision(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String) {
            UpdateCandidate(_id: "${e}", candidate_input: $candidate_input, lang: $lang) {
              _id
              jury_decision
            }
          }
        `,variables:{candidate_input:t,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(a=>a.data.UpdateCandidate))}UpdateProgramDesired(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String) {
            UpdateCandidate(_id: "${e}", candidate_input: $candidate_input, lang: $lang) {
              _id
              program_desired
            }
          }
        `,variables:{candidate_input:t,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(a=>a.data.UpdateCandidate))}getAllCandidatesFICheckbox(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
                  _id
                  is_oscar_updated
                  is_hubspot_updated
                  is_manual_updated
                  intake_channel {
                    _id
                    program
                    scholar_season_id {
                      _id
                    }
                  }
                  registration_profile {
                    _id
                    name
                  }
                  school {
                    _id
                    short_name
                    long_name
                  }
                  campus {
                    _id
                    name
                  }
                  level {
                    _id
                    name
                  }
                  scholar_season {
                    _id
                    scholar_season
                  }
                  speciality {
                    _id
                    name
                  }
                  sector {
                    _id
                    name
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                  }
                  nationality
                  civility
                  first_name
                  last_name
                  email
                  school_mail
                  announcement_call
                  announcement_email {
                    sent_date
                    sent_time
                  }
                  admission_member_id {
                    _id
                    first_name
                    last_name
                    civility
                    email
                  }
                  payment_supports {
                    relation
                    family_name
                    name
                    civility
                    email
                  }
                  candidate_admission_status
                  user_id {
                    _id
                  }
                }
              }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getAllCandidatesFCCheckbox(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
                  _id
                  is_oscar_updated
                  is_hubspot_updated
                  is_manual_updated
                  intake_channel {
                    _id
                    program
                    scholar_season_id {
                      _id
                    }
                  }
                  registration_profile {
                    _id
                    name
                  }
                  school {
                    _id
                    short_name
                    long_name
                  }
                  campus {
                    _id
                    name
                  }
                  level {
                    _id
                    name
                  }
                  scholar_season {
                    _id
                    scholar_season
                  }
                  speciality {
                    _id
                    name
                  }
                  sector {
                    _id
                    name
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                  }
                  nationality
                  civility
                  first_name
                  last_name
                  email
                  school_mail
                  announcement_call
                  announcement_email {
                    sent_date
                    sent_time
                  }
                  admission_member_id {
                    _id
                    first_name
                    last_name
                    civility
                    email
                  }
                  payment_supports {
                    relation
                    family_name
                    name
                    civility
                    email
                  }
                  candidate_admission_status
                  user_id {
                    _id
                  }
                }
              }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getAllOscarCampus(e,t,a,i,o,_){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort,
            filter: {candidate_admission_status: admitted, ${i}, ${o?`source_type: ${o}`:""} crm_table: oscar}, ${a}
          ) {
              _id
              region
              civility
              first_name
              last_name
              count_document
              telephone
              email
              program_desired
              trial_date
              date_added
              nationality
              oscar_campus_id
              hubspot_deal_id
              hubspot_contact_id
            }
          }
        `,variables:{user_type_ids:_,pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(r=>r.data.GetAllCandidates))}getAllOscarCampusForExport(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(pagination: $pagination, sorting: $sort,
            filter: {candidate_admission_status: admitted, ${i}, ${o?`source_type: ${o}`:""} crm_table: oscar}, ${a}
          ) {
              _id
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getAllOscarCampusForAssign(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(pagination: $pagination, sorting: $sort,
            filter: {candidate_admission_status: admitted, ${i}, ${o?`source_type: ${o}`:""} crm_table: oscar}, ${a}
          ) {
              _id
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getAllReadmissionCheckbox(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query getAllReadmissionCheckbox($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
                  _id
                  jury_decision
                  civility
                  first_name
                  last_name
                  telephone
                  payment_method
                  email
                  school_mail
                  finance
                  nationality
                  candidate_admission_status
                  campus {
                    _id
                    name
                  }
                  intake_channel {
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                  }
                  registration_profile {
                    _id
                    name
                    type_of_formation {
                      _id
                      type_of_information
                    }
                  }
                  level {
                    _id
                    name
                  }
                  speciality {
                    _id
                    name
                  }
                  scholar_season {
                    _id
                    scholar_season
                  }
                  sector {
                    _id
                    name
                  }
                  school {
                    _id
                    short_name
                    long_name
                  }
                  payment_supports {
                    relation
                    family_name
                    name
                    civility
                    email
                  }
                  date_added
                  announcement_call
                  announcement_email {
                    sent_date
                    sent_time
                  }
                }
              }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getAllOscarCampusCheckbox(e,t,a,i,o,_){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort,
            filter: {candidate_admission_status: admitted, ${i}, ${o?`source_type: ${o}`:""} crm_table: oscar}, ${a}
          ) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,variables:{user_type_ids:_,pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(r=>r.data.GetAllCandidates))}getAllHubspotCampus(e,t,a,i,o,_,r,l,m,p){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(
            user_type_ids: $user_type_ids, 
            pagination: $pagination, 
            sorting: $sort,
            filter: {candidate_admission_status: admitted, ${i?`oscar_campus_tenant_key: "${i}"`:""}, ${o?`source_type: ${o}`:""},
            crm_table: hubspot, 
            ${_?`previous_schools: ${_}`:""},
            ${r?`previous_campuses: ${r}`:""},
            ${l?`previous_levels: ${l}`:""},
            ${p?`hubspot_scholar_seasons: ${p}`:""}}, 
            ${a}
          ) {
              _id
              region
              civility
              first_name
              last_name
              count_document
              telephone
              email
              program_desired
              trial_date
              date_added
              nationality
              oscar_campus_id
              hubspot_deal_id
              hubspot_contact_id
              previous_school
              previous_campus
              previous_level
              hubspot_scholar_season
            }
          }
        `,variables:{pagination:e,user_type_ids:m,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(g=>g.data.GetAllCandidates))}getAllHubspotCampusCheckbox(e,t,a,i,o,_,r,l,m,p){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort,
            filter: {candidate_admission_status: admitted, ${i?`oscar_campus_tenant_key: "${i}"`:""}, ${o?`source_type: ${o}`:""},
            crm_table: hubspot, ${_?`previous_schools: ${_}`:""},
            ${r?`previous_campuses: ${r}`:""},
            ${l?`previous_levels: ${l}`:""},
            ${p?`hubspot_scholar_seasons: ${p}`:""}}, ${a}
          ) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,variables:{pagination:e,user_type_ids:m,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(g=>g.data.GetAllCandidates))}getAllHubspotCampusCheckboxId(e,t,a,i,o,_,r,l,m){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(pagination: $pagination, sorting: $sort,
            filter: {candidate_admission_status: admitted, ${i?`oscar_campus_tenant_key: "${i}"`:""}, ${o?`source_type: ${o}`:""},
            crm_table: hubspot, ${_?`previous_schools: ${_}`:""},
            ${r?`previous_campuses: ${r}`:""},
            ${l?`previous_levels: ${l}`:""},
            ${m?`hubspot_scholar_seasons: ${m}`:""}}, ${a}
          ) {
              _id
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(p=>p.data.GetAllCandidates))}getAllHubspotCampusCheckboxForAssign(e,t,a,i,o,_,r,l,m){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(pagination: $pagination, sorting: $sort,
            filter: {candidate_admission_status: admitted, ${i?`oscar_campus_tenant_key: "${i}"`:""}, ${o?`source_type: ${o}`:""},
            crm_table: hubspot, ${_?`previous_schools: ${_}`:""},
            ${r?`previous_campuses: ${r}`:""},
            ${l?`previous_levels: ${l}`:""},
            ${m?`hubspot_scholar_seasons: ${m}`:""}}, ${a}
          ) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(p=>p.data.GetAllCandidates))}getAllProgramDesiredOfCandidate(e){return this.apollo.watchQuery({query:n.ZP`
          query GetAllProgramDesiredOfCandidate($oscar_campus_tenant_keys: [String]) {
            GetAllProgramDesiredOfCandidate(oscar_campus_tenant_keys: $oscar_campus_tenant_keys)
          }
        `,fetchPolicy:"network-only",variables:{oscar_campus_tenant_keys:e}}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllProgramDesiredOfCandidate))}GetAllTenantKeyOfCandidate(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllTenantKeyOfCandidate{
            GetAllTenantKeyOfCandidate
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(e=>e.data.GetAllTenantKeyOfCandidate))}GetAllTrialDateOfCandidate(e,t){return this.apollo.watchQuery({query:n.ZP`
          query GetAllTrialDateOfCandidate($oscar_campus_tenant_keys: [String], $programs_desired: [String]) {
            GetAllTrialDateOfCandidate(
              oscar_campus_tenant_keys: $oscar_campus_tenant_keys
              programs_desired: $programs_desired
              candidate_admission_statuses: [admitted]
            )
          }
        `,fetchPolicy:"network-only",variables:{oscar_campus_tenant_keys:e,programs_desired:t}}).valueChanges.pipe((0,s.U)(a=>a.data.GetAllTrialDateOfCandidate))}GetAllTrialDateOfCandidateFollowUP(e){return this.apollo.watchQuery({query:n.ZP`
          query GetAllTrialDateOfCandidate($candidate_admission_statuses: [EnumCandidateAdmissionStatus]) {
            GetAllTrialDateOfCandidate(candidate_admission_statuses: $candidate_admission_statuses)
          }
        `,fetchPolicy:"network-only",variables:{candidate_admission_statuses:e}}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllTrialDateOfCandidate))}getCandidateRegistration(e){return this.apollo.watchQuery({query:n.ZP`
        query GetOneCandidate{
          GetOneCandidate(_id: "${e}") {
            _id
            is_adult
            is_emancipated_minor
            legal_representative{
                unique_id
                first_name
                last_name
                email
                phone_number
                parental_link
                address
                postal_code
                city
            }
            region
            civility
            first_name
            last_name
            telephone
            payment_method
            is_admitted
            email
            finance
            candidate_admission_status
            nationality
            last_name_used
            first_name_used
            address
            additional_address
            country
            city
            post_code
            date_of_birth
            country_of_birth
            nationality
            nationality_second
            post_code_of_birth
            city_of_birth
            campus {
              _id
              name
              address
              levels {
                _id
                name
              }
              specialities {
                _id
                name
              }
            }
            photo
            announcement_call
            announcement_email {
              sent_date
              sent_time
            }
            registration_profile_type
            intake_channel {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
              admission_document {
                s3_file_name
                document_name
              }
            }
            registration_profile {
              _id
              name
              is_down_payment
              type_of_formation {
                _id
                type_of_information
              }
              description
              payment_modes {
                _id
                name
                description
                additional_cost
                currency
                term
                payment_date {
                  date
                  amount
                  percentage
                }
              }
            }
            engagement_level
            level {
              _id
              name
              specialities {
                _id
                name
              }
            }
            speciality {
              _id
              name
            }
            scholar_season {
              _id
              scholar_season
            }
            sector {
              _id
              name
            }
            school {
              _id
              school_logo
              short_name
              long_name
              campuses {
                _id
                name
                bank {
                  name
                  city
                  address
                }
                levels {
                  _id
                  name
                }
              }
            }
            connection
            personal_information
            signature
            method_of_payment
            payment
            admission_member_id {
              _id
              first_name
              last_name
              civility
              profile_picture
              email
              position
            }
            fixed_phone
            is_whatsapp
            participate_in_open_house_day
            participate_in_job_meeting
            count_document
            user_id {
              _id
            }
            payment_splits {
              payer_name
              percentage
            }
            selected_payment_plan {
              name
              times
              additional_expense
              total_amount
              payment_date {
                date
                amount
              }
            }
            payment_supports {
              upload_document_rib
              family_name
              relation
              name
              sex
              civility
              tele_phone
              email
              iban
              bic
              autorization_account
              parent_address {
                address
                additional_address
                postal_code
                city
                region
                department
                country
              }
            }
            program_desired
            trial_date
            iban
            bic
            autorization_account
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetOneCandidate))}getOneCandidate(e){return this.apollo.watchQuery({query:n.ZP`
        query GetOneCandidateNewContact{
          GetOneCandidate(_id: "${e}") {
            _id
            region
            civility
            first_name
            last_name
            telephone
            payment_method
            is_admitted
            email
            nationality
            phone_number_indicative
            campus {
              _id
              name
              address
              levels {
                _id
                name
              }
              specialities {
                _id
                name
              }
            }
            photo
            announcement_call
            announcement_email {
              sent_date
              sent_time
            }
            intake_channel {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
            registration_profile {
              _id
              name
              type_of_formation {
                _id
                type_of_information
              }
            }
            engagement_level
            level {
              _id
              name
              specialities {
                _id
                name
              }
            }
            speciality {
              _id
              name
            }
            scholar_season {
              _id
              scholar_season
            }
            sector {
              _id
              name
            }
            school {
              _id
              short_name
              long_name
              campuses {
                _id
                name
                levels {
                  _id
                  name
                }
              }
            }
            city
            address
            post_code
            connection
            personal_information
            signature
            method_of_payment
            payment
            admission_member_id {
              _id
              first_name
              last_name
              civility
              profile_picture
              email
              position
            }
            fixed_phone
            is_whatsapp
            participate_in_open_house_day
            participate_in_job_meeting
            count_document
            user_id {
              _id
            }
            payment_splits {
              payer_name
              percentage
            }
            payment_supports {
              relation
              family_name
              name
              civility
              tele_phone
              email
              parent_address {
                address
                additional_address
                postal_code
                city
                region
                department
                country
              }
            }
            program_desired
            trial_date
            emergency_contacts {
              civility
              email
              family_name
              fixed_phone
              is_contact_person_in_emergency
              name
              relation
              tele_phone
              phone_number_indicative
              parent_address{
                address
                postal_code
                city
                post_code_of_birth
                city_of_birth
                is_main_address
              }
            }
            is_emancipated_minor
            legal_representative{
                unique_id
                first_name
                last_name
                email
                phone_number
                parental_link
                address
                postal_code
                city
              }
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetOneCandidate))}getOneCandidateCard(e){return this.apollo.watchQuery({query:n.ZP`
        query GetOneCandidateCard{
          GetOneCandidate(_id: "${e}") {
            _id
            jury_decision
            trial_date
            region
            civility
            first_name
            last_name
            telephone
            payment_method
            is_admitted
            email
            is_oscar_updated
            finance
            nationality
            registration_profile_type
            candidate_unique_number
            candidate_admission_status
            financement
            school_mail
            diploma_status
            admission_document_process_status
            billing_id {
              _id
              deposit_status
              is_deposit_completed
              deposit_pay_amount
              deposit
              account_number
            }
            campus {
              _id
              name
              address
              levels {
                _id
                name
              }
              specialities {
                _id
                name
              }
            }
            photo
            registration_email_due_date {
              due_date
              due_time
            }
            reg_n8_sent_date {
              sent_date
              sent_time
            }
            announcement_call
            announcement_email {
              sent_date
              sent_time
            }
            intake_channel {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
            type_of_formation_id {
              _id
              type_of_information
              type_of_formation
              sigle
              admission_form_id {
                _id
                form_builder_name
              }
            }
            registration_profile {
              _id
              name
              is_down_payment
              discount_on_full_rate
              type_of_formation {
                _id
                type_of_information
              }
              additional_cost_ids {
                additional_cost
                amount
              }
            }
            engagement_level
            level {
              _id
              name
              specialities {
                _id
                name
              }
            }
            speciality {
              _id
              name
            }
            scholar_season {
              _id
              scholar_season
            }
            sector {
              _id
              name
            }
            school {
              _id
              short_name
              long_name
              campuses {
                _id
                name
                levels {
                  _id
                  name
                }
              }
            }
            connection
            personal_information
            signature
            method_of_payment
            payment
            admission_member_id {
              _id
              first_name
              last_name
              civility
              profile_picture
              email
              position
            }
            fixed_phone
            is_whatsapp
            participate_in_open_house_day
            participate_in_job_meeting
            count_document
            user_id {
              _id
            }
            # This one from 049
            payment_splits {
              payer_name
              percentage
            }
            payment_supports {
              relation
              family_name
              name
              civility
              tele_phone
              email
              parent_address {
                address
                additional_address
                postal_code
                city
                region
                department
                country
              }
            }
            program_desired
            trial_date
            date_added
            selected_payment_plan {
              name
              times
              additional_expense
              total_amount
              payment_date {
                date
                amount
              }
              down_payment
            }
            registered_at {
              date
              time
            }
            resign_after_school_begins_at {
              date
              time
            }
            no_show_at {
              date
              time
            }
            hubspot_deal_id
            hubspot_contact_id
            is_hubspot_updated
            is_manual_updated
            continuous_formation_manager_id {
              _id
              first_name
              last_name
              civility
              profile_picture
              email
              position
            }
            admission_process_id {
              _id
              steps {
                _id
                index
                step_title
                step_type
                step_status
                status
                is_only_visible_based_on_condition
              }
            }
            latest_previous_program{
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
            type_of_readmission
            previous_programs {
              _id
            }
            student_id {
              _id
            }
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetOneCandidate))}getOneCandidateFile(e){return this.apollo.watchQuery({query:n.ZP`
        query {
          GetOneCandidate(_id: "${e}") {
            candidate_unique_number
            _id
                  jury_decision
                  trial_date
                  region
                  civility
                  first_name
                  last_name
                  telephone
                  payment_method
                  is_admitted
                  email
                  is_oscar_updated
                  finance
                  nationality
                  registration_profile_type
                  candidate_unique_number
                  candidate_admission_status
                  financement
                  school_mail
                  diploma_status
                  admission_document_process_status
                  billing_id {
                    _id
                    deposit_status
                    is_deposit_completed
                    deposit_pay_amount
                    deposit
                    account_number
                  }
                  campus {
                    _id
                    name
                    address
                    levels {
                      _id
                      name
                    }
                    specialities {
                      _id
                      name
                    }
                  }
                  photo
                  registration_email_due_date {
                    due_date
                    due_time
                  }
                  reg_n8_sent_date {
                    sent_date
                    sent_time
                  }
                  announcement_call
                  announcement_email {
                    sent_date
                    sent_time
                  }
                  intake_channel {
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                    sigle
                    admission_form_id {
                      _id
                      form_builder_name
                    }
                  }
                  registration_profile {
                    _id
                    name
                    is_down_payment
                    discount_on_full_rate
                    type_of_formation {
                      _id
                      type_of_information
                    }
                    additional_cost_ids {
                      additional_cost
                      amount
                    }
                  }
                  engagement_level
                  level {
                    _id
                    name
                    specialities {
                      _id
                      name
                    }
                  }
                  speciality {
                    _id
                    name
                  }
                  scholar_season {
                    _id
                    scholar_season
                  }
                  sector {
                    _id
                    name
                  }
                  school {
                    _id
                    short_name
                    long_name
                    campuses {
                      _id
                      name
                      levels {
                        _id
                        name
                      }
                    }
                  }
                  connection
                  personal_information
                  signature
                  method_of_payment
                  payment
                  admission_member_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  fixed_phone
                  is_whatsapp
                  participate_in_open_house_day
                  participate_in_job_meeting
                  count_document
                  user_id {
                    _id
                  }
                  # This one from 049
                  payment_splits {
                    payer_name
                    percentage
                  }
                  payment_supports {
                    relation
                    family_name
                    name
                    civility
                    tele_phone
                    email
                    parent_address {
                      address
                      additional_address
                      postal_code
                      city
                      region
                      department
                      country
                    }
                  }
                  program_desired
                  trial_date
                  date_added
                  selected_payment_plan {
                    name
                    times
                    additional_expense
                    total_amount
                    payment_date {
                      date
                      amount
                    }
                    down_payment
                  }
                  registered_at {
                    date
                    time
                  }
                  resign_after_school_begins_at {
                    date
                    time
                  }
                  no_show_at {
                    date
                    time
                  }
                  hubspot_deal_id
                  hubspot_contact_id
                  is_hubspot_updated
                  is_manual_updated
                  continuous_formation_manager_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  admission_process_id {
                    _id
                    steps {
                      _id
                      index
                      step_title
                      step_type
                      step_status
                      status
                      is_only_visible_based_on_condition
                    }
                  }
                  latest_previous_program{
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_readmission
                  previous_programs {
                    _id
                  }
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetOneCandidate))}getPromoForRegistration(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetPromoAllExternalsForDisplay{
          GetPromoAllExternalsForDisplay(
            school: "${e}",
            campus: "${t}",
            level: "${a}",
            region: "${i}",
            gender: ${o}
            ) {
            _id
            ref_id
            module
            title
            sub_title
            is_published
            story
            school
            campus
            levels
            region
            hobbies
            job
            activity
            integration
            insertion
            program
            video_link
            image_upload
            generic
            is_published
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetPromoAllExternalsForDisplay))}getPromoForAlumni(){return this.apollo.watchQuery({query:n.ZP`
          query {
            GetAllPromoExternals(filter: { module: "006_Alumni" }) {
              _id
              ref_id
              module
              title
              sub_title
              is_published
              story
              school
              campus
              levels
              region
              hobbies
              job
              activity
              integration
              insertion
              program
              video_link
              image_upload
              generic
              is_published
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(e=>e.data.GetAllPromoExternals))}getAllPromo(){return this.apollo.watchQuery({query:n.ZP`
          query {
            GetAllPromoExternals {
              _id
              ref_id
              module
              title
              sub_title
              is_published
              story
              school
              campus
              levels
              region
              hobbies
              job
              activity
              integration
              insertion
              program
              video_link
              image_upload
              generic
              is_published
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(e=>e.data.GetAllPromoExternals))}getCandidateDetails(e){return this.apollo.watchQuery({query:n.ZP`
        query GetOneCandidate{
          GetOneCandidate(_id: "${e}") {
            _id
            region
            civility
            first_name
            last_name
            telephone
            payment_method
            is_admitted
            registration_certificate
            email
            registration_certificate
            nationality
            candidate_unique_number
            candidate_admission_status
            readmission_status
            program_status
            financial_situation
            is_future_program_assigned
            admission_process_id {
              _id
              steps {
                step_type
              }
            }
            student_id {
              _id
              program_sequence_ids {
                _id
                name
                program_id {
                  _id
                  program
                }
                program_sequence_groups {
                  _id
                  student_classes {
                    name
                    students_id {
                      _id
                    }
                    program_sequence_id {
                      program_modules_id {
                        program_subjects_id {
                          name
                        }
                      }
                    }
                  }
                }
                start_date{
                  date
                  time
                }
                end_date{
                  date
                  time
                }
                type_of_sequence
              }
            }
            billing_id {
              _id
              profil_rate
              account_number
              deposit
              deposit_pay_amount
              terms {
                _id
                term_pay_date {
                  date
                  time
                }
                is_locked
                is_term_paid
                term_pay_amount
                term_payment {
                  date
                  time
                }
                term_payment_deferment {
                  date
                  time
                }
                is_partial
                term_amount
              }
              accumulated_late
              amount_late
            }
            campus {
              _id
              name
              address
              levels {
                _id
                name
              }
              specialities {
                _id
                name
              }
            }
            photo
            registration_email_due_date {
              due_date
              due_time
            }
            reg_n8_sent_date {
              sent_date
              sent_time
            }
            announcement_call
            announcement_email {
              sent_date
              sent_time
            }
            intake_channel {
              _id
              program
              school_id {
                short_name
              }
              campus {
                name
              }
              level {
                name
              }
              scholar_season_id {
                _id
                scholar_season
              }
              speciality_id {
                name
              }
              course_sequence_id {
                program_sequences_id {
                  program_sequence_groups {
                    _id
                    student_classes {
                      name
                      students_id {
                        _id
                      }
                      program_sequence_id {
                        program_modules_id {
                          program_subjects_id {
                            name
                          }
                        }
                      }
                    }
                  }
                  name
                  type_of_sequence
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
            }
            type_of_formation_id {
              _id
              type_of_information
              type_of_formation
            }
            registration_profile {
              _id
              name
              discount_on_full_rate
              additional_cost_ids {
                additional_cost
                amount
              }
              type_of_formation {
                _id
                type_of_information
              }
              is_down_payment
            }
            engagement_level
            level {
              _id
              name
              specialities {
                _id
                name
              }
            }
            speciality {
              _id
              name
            }
            scholar_season {
              _id
              scholar_season
            }
            sector {
              _id
              name
            }
            school {
              _id
              short_name
              long_name
              campuses {
                _id
                name
                levels {
                  _id
                  name
                }
              }
            }
            selected_payment_plan {
              total_amount
              down_payment
            }
            school_mail
            connection
            personal_information
            signature
            method_of_payment
            payment
            admission_member_id {
              _id
              first_name
              last_name
              civility
              profile_picture
              email
              position
            }
            fixed_phone
            is_whatsapp
            participate_in_open_house_day
            participate_in_job_meeting
            count_document
            user_id {
              _id
            }
            payment_splits {
              payer_name
              percentage
            }
            payment_supports {
              relation
              family_name
              name
              civility
              tele_phone
              email
              parent_address {
                address
                additional_address
                postal_code
                city
                region
                department
                country
              }
            }
            program_desired
            trial_date
            school_contract_pdf_link
            date_added
            engaged_at {
              date
              time
            }
            registered_at {
              date
              time
            }
            resigned_after_engaged_at {
              date
              time
            }
            resign_after_school_begins_at {
              date
              time
            }
            no_show_at {
              date
              time
            }
            resigned_after_registered_at {
              date
              time
            }
            inscription_at {
              date
              time
            }
            resigned_at {
              date
              time
            }
            candidate_sign_date {
              date
              time
            }
            school_contract_pdf_link
            bill_validated_at {
              date
              time
            }
            payment_transfer_check_data {
              s3_document_name
            }
            financement_validated_at {
              date
              time
            }
            initial_intake_channel
            latest_previous_program {
              _id
              program
              school_id {
                short_name
              }
              campus {
                name
              }
              level {
                name
              }
              scholar_season_id {
                _id
                scholar_season
              }
              speciality_id {
                name
              }
            }
            previous_programs {
              _id
            telephone
            payment_method
            is_admitted
            registration_certificate
            candidate_unique_number
            candidate_admission_status
            admission_process_id {
              _id
              steps {
                step_type
              }
            }
            billing_id {
              _id
              account_number
              deposit
              deposit_pay_amount
              terms {
                _id
                term_pay_date {
                  date
                  time
                }
                is_locked
                is_term_paid
                term_pay_amount
                term_payment {
                  date
                  time
                }
                term_payment_deferment {
                  date
                  time
                }
                is_partial
                term_amount
              }
              accumulated_late
            }
            campus {
              _id
              name
              address
              levels {
                _id
                name
              }
              specialities {
                _id
                name
              }
            }
            registration_email_due_date {
              due_date
              due_time
            }
            reg_n8_sent_date {
              sent_date
              sent_time
            }
            announcement_call
            announcement_email {
              sent_date
              sent_time
            }
            intake_channel {
              _id
              program
              school_id {
                short_name
              }
              campus {
                name
              }
              level {
                name
              }
              scholar_season_id {
                _id
                scholar_season
              }
              speciality_id {
                name
              }
            }
            type_of_formation_id {
              _id
              type_of_information
              type_of_formation
            }
            registration_profile {
              _id
              name
              discount_on_full_rate
              additional_cost_ids {
                additional_cost
                amount
              }
              type_of_formation {
                _id
                type_of_information
              }
              is_down_payment
            }
            engagement_level
            level {
              _id
              name
              specialities {
                _id
                name
              }
            }
            speciality {
              _id
              name
            }
            scholar_season {
              _id
              scholar_season
            }
            sector {
              _id
              name
            }
            school {
              _id
              short_name
              long_name
              campuses {
                _id
                name
                levels {
                  _id
                  name
                }
              }
            }
            selected_payment_plan {
              total_amount
              down_payment
            }
            school_mail
            connection
            personal_information
            signature
            method_of_payment
            payment
            admission_member_id {
              _id
              first_name
              last_name
              civility
              profile_picture
              email
              position
            }
            is_whatsapp
            participate_in_open_house_day
            participate_in_job_meeting
            count_document
            user_id
            payment_splits {
              payer_name
              percentage
            }
            program_desired
            trial_date
            school_contract_pdf_link
            date_added
            engaged_at {
              date
              time
            }
            registered_at {
              date
              time
            }
            resign_after_school_begins_at {
              date
              time
            }
            no_show_at {
              date
              time
            }
            resigned_after_engaged_at {
              date
              time
            }
            resigned_after_registered_at {
              date
              time
            }
            inscription_at {
              date
              time
            }
            resigned_at {
              date
              time
            }
            candidate_sign_date {
              date
              time
            }
            school_contract_pdf_link
            bill_validated_at {
              date
              time
            }
            payment_transfer_check_data {
              s3_document_name
            }
            financement_validated_at {
              date
              time
            }
            initial_intake_channel
            latest_previous_program {
              _id
              program
              school_id {
                short_name
              }
              campus {
                name
              }
              level {
                name
              }
              scholar_season_id {
                _id
                scholar_season
              }
              speciality_id {
                name
              }
            }
            }
            mission_card_validated_at {
              date
              time
            }
            resignation_missing_prerequisites_at {
              date
              time
            }
            current_school_contract_amendment_form {
              _id
              school_amendment_form_link
              school_amendment_pdf_name
              form_status
            }
            full_rate_id {
              amount_internal
              amount_external
            }
            registration_profile_type
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetOneCandidate))}getAllStepValidationMessages(e,t,a){return this.apollo.watchQuery({query:n.ZP`
        query GetAllStepValidationMessages{
          GetStepValidationMessageForDisplay(school: "${e}", campus: "${t}", validation_step: ${a}
          ) {
            _id
            validation_step
            first_title
            second_title
            school
            campus
            image_upload
            video_link
            is_published
            generic
            region
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(i=>i.data.GetStepValidationMessageForDisplay))}getStepValidationMessages(e,t,a){return this.apollo.watchQuery({query:n.ZP`
        query GetStepValidationMessages{
          GetStepValidationMessageForDisplay(school: "${e}", campus: "${t}", validation_step: ${a}
          ) {
            _id
            first_title
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(i=>i.data.GetStepValidationMessageForDisplay))}GetAllDownPayment(e,t,a,i){return this.apollo.watchQuery({query:n.ZP`
          query GetAllDownPayment($school_id: ID, $scholar_season_id: ID, $campus: ID, $level: ID) {
            GetAllDownPayment(school_id: $school_id, scholar_season_id: $scholar_season_id, campus: $campus, level: $level) {
              amount
            }
          }
        `,fetchPolicy:"network-only",variables:{scholar_season_id:e,school_id:t,campus:a,level:i}}).valueChanges.pipe((0,s.U)(o=>o.data.GetAllDownPayment))}GetAllFullRate(e,t,a,i){return this.apollo.watchQuery({query:n.ZP`
          query GetAllFullRate($school_id: ID, $scholar_season_id: ID, $campus: ID, $level: ID) {
            GetAllFullRate(school_id: $school_id, scholar_season_id: $scholar_season_id, campus: $campus, level: $level) {
              amount_external
              amount_internal
            }
          }
        `,fetchPolicy:"network-only",variables:{scholar_season_id:e,school_id:t,campus:a,level:i}}).valueChanges.pipe((0,s.U)(o=>o.data.GetAllFullRate))}GetAllProfilRatesByName(e){return this.apollo.watchQuery({query:n.ZP`
          query {
            GetAllProfilRates(filter: {name: "${e}"}) {
              _id
              name
              description
              payment_modes {
                _id
                name
                description
                additional_cost
                currency
                term
                payment_date {
                  date
                  amount
                  percentage
                }
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllProfilRates))}GetDevLeader(e){return this.apollo.watchQuery({query:n.ZP`
        query GetDevLeader{
          GetAllUsers(user_type: ["617f64ec5a48fe2228518810"], candidate_campus: "${e}") {
            _id
            first_name
            civility
            last_name
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllUsers))}GetDevMember(e){return this.apollo.watchQuery({query:n.ZP`
        query GetDevMember{
          GetAllUsers(user_type: ["617f64ec5a48fe2228518811"], candidate_campus: "${e}") {
            _id
            first_name
            civility
            last_name
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllUsers))}GetDevLeaders(e){return this.apollo.watchQuery({query:n.ZP`
        query {
          GetAllUsers(candidate_campus: "${e}") {
            _id
            first_name
            civility
            last_name
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllUsers))}GetDevMembers(e){return this.apollo.watchQuery({query:n.ZP`
        query {
          GetAllUsers(candidate_campus: "${e}") {
            _id
            first_name
            civility
            last_name
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllUsers))}getNationalityCandidate(e,t,a){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCandidates($pagination: PaginationInput, $sort: CandidateSortInput) {
            GetAllCandidates(pagination: $pagination, sorting: $sort, ${a}) {
                  _id
                  nationality
                }
              }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(i=>i.data.GetAllCandidates))}getAllMemberAdmission(){return this.apollo.query({query:n.ZP`
          query getAllMemberAdmission($entity: [EnumEntityType!]) {
            GetAllUsers(entity: $entity) {
              _id
              civility
              first_name
              last_name
              profile_picture
              entities {
                school {
                  _id
                  short_name
                }
                campus {
                  _id
                  name
                }
              }
            }
          }
        `,variables:{entity:["admission"]},fetchPolicy:"network-only"}).pipe((0,s.U)(e=>e.data.GetAllUsers))}getAllMemberByDirector(e,t){return this.apollo.query({query:n.ZP`
          query GetAllUsers($campuses: [ID]) {
            GetAllUsers(campuses: $campuses, school: "${t}") {
              _id
              civility
              first_name
              last_name
              profile_picture
              entities {
                candidate_school
                candidate_campus
              }
            }
          }
        `,variables:{campuses:e},fetchPolicy:"network-only"}).pipe((0,s.U)(a=>a.data.GetAllUsers))}getMentorAdmissionAssignMentor(e){return this.apollo.query({query:n.ZP`
          query getMentorAdmissionAssignMentor {
            GetAllStudents(${e}) {
              _id
              civility
              first_name
              last_name
              candidate_school
              candidate_campus
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,s.U)(t=>t.data.GetAllStudents))}getAllIntakeChannelDropdown(e){return this.apollo.query({query:n.ZP`
          query GetAllIntakeChannelDropdown{
            GetAllIntakeChannelDropdown
          }
        `,fetchPolicy:"network-only"}).pipe((0,s.U)(t=>t.data.GetAllIntakeChannelDropdown))}getIntakeChannelDropdown(){return this.apollo.query({query:n.ZP`
          query GetAllPrograms{
            GetAllPrograms {
              _id
              intake_channel
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,s.U)(e=>e.data.GetAllPrograms))}getIntakeChannelCampusDropdown(e){return this.apollo.query({query:n.ZP`
          query GetAllIntakeChannels{
            GetAllIntakeChannels(${e}) {
              _id
              intake_channel
              campus
              school
              level
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,s.U)(t=>t.data.GetAllIntakeChannels))}SendNotifN1(e){return this.apollo.mutate({mutation:n.ZP`
          mutation SendCandidateN1($candidate_ids: [ID!]!, $lang: String) {
            SendCandidateN1(candidate_ids: $candidate_ids, lang: $lang)
          }
        `,variables:{candidate_ids:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(t=>t.data.SendCandidateN1))}SendReadRegN1(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation SendReadRegN1($candidate_ids: [ID!]!, $lang: String, $is_include_flyer: Boolean) {
            SendReadRegN1(candidate_ids: $candidate_ids, lang: $lang, is_include_flyer: $is_include_flyer)
          }
        `,variables:{candidate_ids:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr",is_include_flyer:t}}).pipe((0,s.U)(a=>a.data.SendReadRegN1))}SendReadRegN2(e){return this.apollo.mutate({mutation:n.ZP`
          mutation SendReadRegN2($candidate_ids: [ID!]!, $lang: String) {
            SendReadRegN2(candidate_ids: $candidate_ids, lang: $lang)
          }
        `,variables:{candidate_ids:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(t=>t.data.SendReadRegN1))}SendNotifRegistrationN8(e){return this.apollo.mutate({mutation:n.ZP`
          mutation SendNotificationREGISTRATION_N8($candidate_id: ID!, $lang: String) {
            SendNotificationREGISTRATION_N8(candidate_id: $candidate_id, lang: $lang)
          }
        `,variables:{candidate_id:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(t=>t.data.SendNotificationREGISTRATION_N8))}SendNotifRegistrationN8ResendNewForm(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation SendNotificationREGISTRATION_N8($candidate_id: ID!, $lang: String, $isReinscriptionNo: Boolean) {
            SendNotificationREGISTRATION_N8(candidate_id: $candidate_id, lang: $lang, isReinscriptionNo: $isReinscriptionNo)
          }
        `,variables:{candidate_id:e,isReinscriptionNo:t,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(a=>a.data.SendNotificationREGISTRATION_N8))}ImportGeneralDashboardAdmission(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation ImportGeneralDashboardAdmission(
            $import_general_admission_dashboard_input: ImportGeneralDashboardAdmissionInput
            $file: Upload!
            $lang: String
          ) {
            ImportGeneralDashboardAdmission(
              import_general_admission_dashboard_input: $import_general_admission_dashboard_input
              file: $file
              lang: $lang
            ) {
              _id
            }
          }
        `,variables:{file:t,import_general_admission_dashboard_input:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},context:{useMultipart:!0}}).pipe((0,s.U)(a=>a.data.ImportGeneralDashboardAdmission))}ImportReconciliationAndLetterage(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation ImportReconciliationAndLetterage(
            $import_reconciliation_letterage_input: ImportReconciliationLetterageInput
            $file: Upload!
          ) {
            ImportReconciliationAndLetterage(import_reconciliation_letterage_input: $import_reconciliation_letterage_input, file: $file) {
              confirm_reconciliation {
                _id
                accounting_document
                transaction_date
                transaction_time
                transaction_type
                description
                from
                to
                bank
                reference
                amount
                amount_type
                candidate_id
                intake_channel
                letter
                student_id {
                  _id
                  first_name
                  last_name
                  civility
                  email
                  candidate_id {
                    _id
                    payment_supports {
                      civility
                      name
                      family_name
                    }
                  }
                }
              }
              assign_reconciliation {
                _id
                accounting_document
                transaction_date
                transaction_time
                transaction_type
                description
                from
                to
                bank
                reference
                amount
                amount_type
                candidate_id
                intake_channel
                letter
                student_ids {
                  _id
                  first_name
                  last_name
                  civility
                  email
                  candidate_id {
                    _id
                    payment_supports {
                      civility
                      name
                      family_name
                    }
                  }
                }
              }
            }
          }
        `,variables:{file:t,import_reconciliation_letterage_input:e},context:{useMultipart:!0}}).pipe((0,s.U)(a=>a.data.ImportReconciliationAndLetterage))}finishReconciliationAndLetterage(e){return this.apollo.mutate({mutation:n.ZP`
          mutation FinishReconciliationAndLetterage($reconciliationAndLetterage: [ReconciliationAndLetterageInput]) {
            FinishReconciliationAndLetterage(reconciliation_letterage_input: $reconciliationAndLetterage)
          }
        `,variables:{reconciliationAndLetterage:e}}).pipe((0,s.U)(t=>t.data.FinishReconciliationAndLetterage))}assignReconciliation(e){return this.apollo.mutate({mutation:n.ZP`
          mutation AssignReconciliation($reconciliationAndLetterage: [ReconciliationAndLetterageInput]) {
            AssignReconciliation(reconciliation_letterage_input: $reconciliationAndLetterage) {
              confirm_lettrage {
                _id
                accounting_document
                transaction_date
                transaction_time
                transaction_type
                transaction
                description
                from
                to
                bank
                reference
                amount
                candidate_id
                intake_channel
                letter
                student_id {
                  _id
                  first_name
                  last_name
                  civility
                  email
                  candidate_id {
                    _id
                    intake_channel
                    payment_supports {
                      civility
                      name
                      family_name
                    }
                  }
                  billing_id {
                    deposit
                    deposit_status
                    intake_channel
                    deposit_pay_amount
                    is_deposit_completed
                    terms {
                      _id
                      is_term_paid
                      term_amount
                      term_pay_amount
                      term_payment {
                        date
                        time
                      }
                    }
                  }
                }
                term_index
              }
              assign_lettrage {
                _id
                accounting_document
                transaction_date
                transaction_time
                transaction_type
                transaction
                description
                from
                to
                bank
                reference
                amount
                candidate_id
                intake_channel
                letter
                student_id {
                  _id
                  first_name
                  last_name
                  civility
                  email
                  candidate_id {
                    _id
                    intake_channel
                    payment_supports {
                      civility
                      name
                      family_name
                    }
                  }
                  billing_id {
                    deposit
                    deposit_status
                    intake_channel
                    deposit_pay_amount
                    is_deposit_completed
                    terms {
                      _id
                      is_term_paid
                      term_amount
                      term_pay_amount
                      term_payment {
                        date
                        time
                      }
                    }
                  }
                }
                term_index
              }
            }
          }
        `,variables:{reconciliationAndLetterage:e}}).pipe((0,s.U)(t=>t.data.AssignReconciliation))}SendRegistrationNotification(e){return this.apollo.mutate({mutation:n.ZP`
          mutation SendRegistrationNotification($candidate_id: ID!, $lang: String) {
            SendRegistrationNotification(candidate_id: $candidate_id, lang: $lang) {
              _id
            }
          }
        `,variables:{candidate_id:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(t=>t.data.SendCandidateN1))}ChangeMentorToManyCandidate(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation ChangeMentorToManyCandidate($candidates_id: [ID!]!, $mentors_id: [ID!]!, $lang: String) {
            ChangeMentorToManyCandidate(candidates_id: $candidates_id, mentors_id: $mentors_id, lang: $lang) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,variables:{candidates_id:e,mentors_id:t,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(a=>a.data.ChangeMentorToManyCandidate))}AssignProfilRateToManyCandidate(e,t,a,i){return this.apollo.mutate({mutation:n.ZP`
          mutation AssignProfilRateToManyCandidate($candidates_id: [ID!]!, $volume_hour: Float, $lang: String) {
            AssignProfilRateToManyCandidate(
              candidates_id: $candidates_id,
              profil_rate: "${t}",
              registration_profile_type: ${a},
              volume_hour: $volume_hour,
              lang: $lang
              ) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,variables:{candidates_id:e,volume_hour:i||null,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(o=>o.data.AssignProfilRateToManyCandidate))}AssignProfilRateToManyCandidateForReadmission(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation AssignProfilRateToManyCandidateForReadmission(
            $fi_input: AssignProfileRateInput
            $fc_input: AssignProfileRateInput
            $lang: String
          ) {
            AssignProfilRateToManyCandidateForReadmission(fi_input: $fi_input, fc_input: $fc_input, lang: $lang) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,variables:{fi_input:e,fc_input:t,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(a=>a.data.AssignProfilRateToManyCandidateForReadmission))}UpdateManyStudentAdmissionProcessStep(e){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateManyStudentAdmissionProcessStep($input: [UpdateManyStudentAdmissionProcessStepInput]) {
            UpdateManyStudentAdmissionProcessStep(input: $input) {
              _id
              step_title
            }
          }
        `,variables:{input:e}}).pipe((0,s.U)(t=>t.data.UpdateManyStudentAdmissionProcessStep))}ChangeAdmissionMemberToManyCandidate(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation ChangeAdmissionMemberToManyCandidate($candidates_id: [ID!]!, $admission_members_id: [ID!]!, $lang: String) {
            ChangeAdmissionMemberToManyCandidate(candidates_id: $candidates_id, admission_members_id: $admission_members_id, lang: $lang) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,variables:{candidates_id:e,admission_members_id:t,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(a=>a.data.ChangeAdmissionMemberToManyCandidate))}ChangeAdmissionMemberToManyCandidateFC(e,t,a){return this.apollo.mutate({mutation:n.ZP`
          mutation ChangeAdmissionMemberToManyCandidate(
            $candidates_id: [ID!]!
            $admission_members_id: [ID]
            $lang: String
            $continuous_formation_managers_id: [ID]
          ) {
            ChangeAdmissionMemberToManyCandidate(
              candidates_id: $candidates_id
              admission_members_id: $admission_members_id
              lang: $lang
              continuous_formation_managers_id: $continuous_formation_managers_id
            ) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,variables:{candidates_id:e,admission_members_id:t,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr",continuous_formation_managers_id:a}}).pipe((0,s.U)(i=>i.data.ChangeAdmissionMemberToManyCandidate))}AcceptRejectTransferCampus(e,t,a){return this.apollo.mutate({mutation:n.ZP`
          mutation AcceptRejectTransferCampus($candidate_id: ID!, $campus: String!, $is_accepted: Boolean!, $lang: String) {
            AcceptRejectTransferCampus(candidate_id: $candidate_id, campus: $campus, is_accepted: $is_accepted, lang: $lang) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,variables:{candidate_id:e,campus:t,is_accepted:a,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(i=>i.data.AcceptRejectTransferCampus))}UpdateCandidateCall(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String) {
            UpdateCandidate(_id: "${e}", candidate_input: $candidate_input, lang: $lang) {
              _id
            }
          }
        `,variables:{candidate_input:t,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(a=>a.data.UpdateCandidate))}UpdateCandidateStatusPostPone(e,t,a){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String, $is_prevent_resend_notif: Boolean) {
            UpdateCandidate(_id: "${e}", candidate_input: $candidate_input, lang: $lang, is_prevent_resend_notif: $is_prevent_resend_notif) {
              _id
            }
          }
        `,variables:{candidate_input:t,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr",is_prevent_resend_notif:a}}).pipe((0,s.U)(i=>i.data.UpdateCandidate))}UpdateCandidateStatus(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String) {
            UpdateCandidate(_id: "${e}", candidate_input: $candidate_input, lang: $lang) {
              _id
            }
          }
        `,variables:{candidate_input:t,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(a=>a.data.UpdateCandidate))}UpdateCandidate(e,t,a){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String, $is_save_identity_student: Boolean) {
            UpdateCandidate(_id: "${e}", candidate_input: $candidate_input, lang: $lang, is_save_identity_student: $is_save_identity_student) {
              _id
              region
              civility
              first_name
              last_name
              telephone
              payment_method
              is_admitted
              email
              nationality
              campus {
                _id
                name
                address
                levels {
                  _id
                  name
                }
                specialities {
                  _id
                  name
                }
              }
              photo
              announcement_call
              announcement_email {
                sent_date
                sent_time
              }
              intake_channel {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
              registration_profile {
                _id
                name
                type_of_formation {
                  _id
                  type_of_information
                }
              }
              engagement_level
              level {
                _id
                name
                specialities {
                  _id
                  name
                }
              }
              speciality {
                _id
                name
              }
              scholar_season {
                _id
                scholar_season
              }
              sector {
                _id
                name
              }
              school {
                _id
                short_name
                long_name
                campuses {
                  _id
                  name
                  levels {
                    _id
                    name
                  }
                }
              }
              parents {
                relation
                family_name
                name
                civility
                is_same_address
                is_parent_also_payment_support
                parent_address {
                  address
                  additional_address
                }
              }
              connection
              personal_information
              signature
              method_of_payment
              payment
              admission_member_id {
                _id
                first_name
                last_name
                civility
                profile_picture
                email
                position
              }
              fixed_phone
              is_whatsapp
              participate_in_open_house_day
              participate_in_job_meeting
              count_document
              user_id {
                _id
              }
              payment_splits {
                payer_name
                percentage
              }
              payment_supports {
                relation
                family_name
                name
                civility
                tele_phone
                email
                parent_address {
                  address
                  additional_address
                  postal_code
                  city
                  region
                  department
                  country
                }
              }
              program_desired
              trial_date
            }
          }
        `,variables:{candidate_input:t,is_save_identity_student:a,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(i=>i.data.UpdateCandidate))}UpdateCandidateId(e,t,a){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String, $is_save_identity_student: Boolean) {
            UpdateCandidate(_id: "${e}", candidate_input: $candidate_input, lang: $lang, is_save_identity_student: $is_save_identity_student) {
              _id
            }
          }
        `,variables:{candidate_input:t,is_save_identity_student:a,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(i=>i.data.UpdateCandidate))}UpdateManyCandidates(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateManyCandidates($candidate_input: CandidateInput!, $candidates_id: [ID]!) {
            UpdateManyCandidates(candidates_id: $candidates_id, candidate_input: $candidate_input) {
              _id
            }
          }
        `,variables:{candidate_input:t,candidates_id:e}}).pipe((0,s.U)(a=>a.data.UpdateManyCandidates))}UpdateJuryDecisionCandidates(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateManyCandidates($candidate_input: CandidateInput!, $jury_decision_inputs: [JuryDecisionInput]) {
            UpdateManyCandidates(candidate_input: $candidate_input, jury_decision_inputs: $jury_decision_inputs) {
              _id
            }
          }
        `,variables:{candidate_input:t,jury_decision_inputs:e}}).pipe((0,s.U)(a=>a.data.UpdateManyCandidates))}UpdateManyJuryDecision(e,t,a,i){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateManyCandidates($candidate_input: CandidateInput!, $select_all: Boolean, $is_readmission: Boolean) {
            UpdateManyCandidates(${e}, candidate_input: $candidate_input, select_all: $select_all, is_readmission: $is_readmission) {
              _id
            }
          }
        `,variables:{candidate_input:i,is_readmission:a,select_all:t}}).pipe((0,s.U)(o=>o.data.UpdateManyCandidates))}UpdateIncamingCall(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String) {
            UpdateCandidate(_id: "${e}", candidate_input: $candidate_input, lang: $lang) {
              _id
            }
          }
        `,variables:{candidate_input:t,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(a=>a.data.UpdateCandidate))}getCandidates(e,t,a){return this.httpClient.get("assets/data/candidates.json")}getNationality(){return this.httpClient.get("assets/data/nationality.json")}getTemplateImport(){const e=f.N.apiUrl.replace("graphql","");return this.httpClient.post(`${e}downloadGeneralAdmissionTemplateCSV`,{openingDate:"04/01/2021",closingDate:"27/06/2021",delimiter:";",lang:"fr",scholarSeasons:["21-22"],schools:["EFAP"],campuses:["PARIS","LYON"],levels:["2","1"]},{headers:{Accept:"text/csv","Content-Type":"application/json"}})}downloadTemplateCSV(e,t,a,i,o,_,r,l,m){const p=localStorage.getItem("currentLang"),g=f.N.apiUrl.replace("graphql",""),u=document.createElement("a");u.href=m?`${g}downloadGeneralAdmissionTemplateCSV/${e}/${t}/${a}/${p}/${i}/${o}/${_}/${r}/${l}/${m}`:`${g}downloadGeneralAdmissionTemplateCSV/${e}/${t}/${a}/${p}/${i}/${o}/${_}/${r}/${l}`,u.target="_blank",u.download="Student Import CSV",document.body.appendChild(u),u.click(),document.body.removeChild(u)}GetDataForImportObjectives(e,t){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCandidateSchool($user_type_id: ID){
            GetAllCandidateSchool(filter: { short_name: "${e}" }, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              scholar_season_id {
                _id
                scholar_season
                rncp_titles{
                  _id
                }
              }
              campuses {
                _id
                name
                levels {
                  _id
                  name
                  specialities {
                    name
                  }
                }
                scholar_season_id {
                  _id
                  scholar_season
                  rncp_titles{
                      _id
                  }
                }
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{user_type_id:t}}).valueChanges.pipe((0,s.U)(a=>a.data.GetAllCandidateSchool))}GetAllStudentAdmissionProcesses(e){return this.apollo.watchQuery({query:n.ZP`
          query GetAllFormProcesses($filter: FormProcessFilterInput) {
            GetAllFormProcesses(filter: $filter) {
              _id
              steps {
                _id
                step_title
                is_validation_required
                validator {
                  _id
                  name
                }
                is_user_who_receive_the_form_as_validator
                step_type
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e}}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllFormProcesses))}GetAllFormProces(e){return this.apollo.watchQuery({query:n.ZP`
          query GetAllFormProcesses($filter: FormProcessFilterInput) {
            GetAllFormProcesses(filter: $filter) {
              _id
              candidate_id {
                _id
                first_name
                last_name
                civility
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
              steps {
                _id
                step_title
                is_validation_required
                validator {
                  _id
                  name
                  entity
                }
                is_user_who_receive_the_form_as_validator
                step_type
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e}}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllFormProcesses))}getDataAdmissionProcessForValidator(e){return this.apollo.watchQuery({query:n.ZP`
          query GetAllFormProcesses($filter: FormProcessFilterInput) {
            GetAllFormProcesses(filter: $filter) {
              _id
              candidate_id {
                _id
                civility
                last_name
                first_name
                _id
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
              steps {
                _id
                step_title
                is_validation_required
                validator {
                  _id
                  name
                  entity
                }
                is_user_who_receive_the_form_as_validator
                step_type
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e}}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllFormProcesses))}GetAllCandidateSchoolByScholarSeason(e,t){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCandidateSchool($user_type_id: ID) {
            GetAllCandidateSchool(scholar_season_id: "${e}", user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              campuses {
                _id
                name
                levels {
                  _id
                  name
                  specialities {
                    name
                  }
                }
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{user_type_id:t}}).valueChanges.pipe((0,s.U)(a=>a.data.GetAllCandidateSchool))}GetDataSchoolCampus(e,t){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCandidateSchool($user_type_id: ID){
            GetAllCandidateSchool(filter: { short_name: "${e}" }, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              campuses {
                name
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{short_name:e||null,user_type_id:t||null}}).valueChanges.pipe((0,s.U)(a=>a.data.GetAllCandidateSchool))}GetDataSchoolCampusByShortNames(e,t){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCandidateSchool($short_names: [String], $user_type_id: ID){
            GetAllCandidateSchool(filter: { short_names: $short_names }, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              campuses {
                name
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{short_names:e||null,user_type_id:t||null}}).valueChanges.pipe((0,s.U)(a=>a.data.GetAllCandidateSchool))}GetDataSchool(e,t){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCandidateSchool($user_type_id: ID){
            GetAllCandidateSchool(filter: { short_name: "${e}" }, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
            }
          }
        `,fetchPolicy:"network-only",variables:{user_type_id:t}}).valueChanges.pipe((0,s.U)(a=>a.data.GetAllCandidateSchool))}GetDataCandidatePerSchool(e,t){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCandidateSchool($user_type_id: ID){
            GetAllCandidateSchool(filter: { short_name: "${e}" }, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              campuses {
                name
                bank {
                  name
                  city
                  address
                }
                levels {
                  name
                  specialities {
                    name
                  }
                }
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{user_type_id:t}}).valueChanges.pipe((0,s.U)(a=>a.data.GetAllCandidateSchool))}GetTutorialContract(){return this.httpClient.get("assets/data/contract-tutorial.json")}GetFirstLastObjectiveDate(e,t,a,i){return this.apollo.watchQuery({query:n.ZP`
          query GetFirstLastObjectiveDate($scholar_seasons: [ID], $schools: [ID], $campuses: [ID], $levels: [ID]) {
            GetFirstLastObjectiveDate(scholar_seasons: $scholar_seasons, schools: $schools, campuses: $campuses, levels: $levels) {
              first_dates
              last_dates
            }
          }
        `,variables:{scholar_seasons:e,schools:t,levels:i,campuses:a},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(o=>o.data.GetFirstLastObjectiveDate))}getAlumniCards(e,t){return this.apollo.watchQuery({query:n.ZP`
          query GetAllAlumni($pagination: PaginationInput) {
            GetAllAlumni(${e}, pagination: $pagination) {
              _id
            candidate_id {
              first_name
              last_name
              civility
              first_name_used
              last_name_used
              address
              city_of_birth
              country_of_birth
              email
            }
            upload_picture
            phone_number
            email
            professional_email
            date_of_birth
            civility
            first_name
            used_first_name
            last_name
            used_last_name
            created_at
            updated_at
            updated_by
            email_status
            promo_year
            school {
              _id
              short_name
            }
            campus {
              _id
              name
            }
            level {
              _id
              name
            }
            sector {
              _id
              name
            }
            speciality {
              _id
              name
            }
            city
            country
            professional_status
            company
            activity_sector
            job_name
            last_survey_sent {
              date
              time
            }
            sent_by {
              _id
              first_name
              last_name
              civility
              email
            }
            email_status
              count_document
            }
          }
        `,variables:{pagination:t},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(a=>a.data.GetAllAlumni))}getAllInternships(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
          query GetAllInternships(
            $pagination: PaginationInput
            $sorting: InternshipSortingInput
            $user_type_login_id: ID!
          ) {
            GetAllInternships(pagination: $pagination, ${t&&"filter: {}"!==t?t+", ":""}sorting: $sorting${i&&"searching: {}"!==i?", "+i:""}, user_type_login_id: $user_type_login_id) {
              _id
              internship_creation_step
              internship_report_due_date {
                date
                time
              }
              mentor_evaluation_due_date {
                date
                time
              }
              student_id {
                _id
                civility
                email
                user_id {
                  _id
                }
                first_name
                last_name
                specialization {
                  _id
                  name
                  sectors {
                    name
                    _id
                  }
                }
                # scholar_season {
                #   _id
                #   scholar_season
                # }
                candidate_school{
                  _id
                  short_name
                }
                candidate_campus{
                  _id
                  name
                }
                candidate_level{
                  _id
                  name
                }
                tele_phone
                candidate_id {
                  _id
                }
                companies {
                  status
                  is_active
                  company {
                    _id
                    # country
                    company_entity_id {
                      _id
                    }
                    status
                    company_name
                    company_logo
                    # description
                    brand
                    type_of_company
                    # type_of_industry
                    no_RC
                    mentor_ids {
                      _id
                    }
                    school_ids {
                      _id
                      short_name
                    }
                    company_addresses {
                      address
                      city
                      country
                      is_main_address
                      postal_code
                      region
                      department
                    }
                    count_document
                    # images {
                    #   s3_file_name
                    # }
                    company_logo
                    # banner
                    activity
                    # twitter_link
                    # instagram_link
                    # facebook_link
                    # youtube_link
                    # video_link
                    # website_link
                  }
                }
              }
              company_relation_member_id {
                _id
                first_name
                last_name
                civility
              }
              is_published
              internship_status
              agreement_status
              company_branch_id {
                _id
                company_name
              }
              internship_date {
                date_from
                date_to
                duration_in_weeks
                duration_in_months
              }
              is_company_manager_already_sign
              is_mentor_already_sign
              is_student_already_sign
              student_sign_status
              mentor_sign_status
              company_manager_sign_status
              company_relation_member_sign_status
              pdf_file_name
              count_document
            }
          }
        `,variables:{pagination:e,user_type_login_id:o,sorting:a||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllInternships))}getAllInternshipsCheckbox(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
          query GetAllInternships(
            $pagination: PaginationInput
            $sorting: InternshipSortingInput
            $user_type_login_id: ID!
          ) {
            GetAllInternships(pagination: $pagination, ${t&&"filter: {}"!==t?t+", ":""}sorting: $sorting${i&&"searching: {}"!==i?", "+i:""}, user_type_login_id: $user_type_login_id) {
              _id
              student_id {
                _id
                civility
                email
                user_id {
                  _id
                }
                first_name
                last_name
                candidate_school
                candidate_campus
                candidate_level
                tele_phone
                candidate_id {
                  _id
                }
              }
              count_document
            }
          }
        `,variables:{pagination:e,user_type_login_id:o,sorting:a||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllInternships))}getAllSpecialityInternships(e){return this.apollo.watchQuery({query:n.ZP`
          query GetAllInternships($user_type_login_id: ID!) {
            GetAllInternships(user_type_login_id: $user_type_login_id) {
              student_id {
                specialization {
                  _id
                  name
                  sectors {
                    name
                    _id
                  }
                }
              }
            }
          }
        `,variables:{user_type_login_id:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllInternships))}GetAllUsersCRM(e,t,a,i,o,_,r,l,m){return this.apollo.watchQuery({query:n.ZP`
          query GetAllUsers(
            $user_type: [ID!]
            $pagination: PaginationInput
            $last_name: String
            $sorting: UserSorting
            $school: ID
            $programs: [String]
            $campuses: [ID]
            $schools: [ID]
            $levels: [ID]
          ) {
            GetAllUsers(
              user_type: $user_type
              pagination: $pagination
              last_name: $last_name
              sorting: $sorting
              school: $school
              programs: $programs
              campuses: $campuses
              schools: $schools
              levels: $levels
            ) {
              _id
              civility
              first_name
              last_name
              profile_picture
              email
              programs
              entities {
                entity_name
                school_type
                school {
                  _id
                  short_name
                }
                campus {
                  _id
                  name
                }
                level {
                  _id
                  name
                }
                type {
                  _id
                  name
                }
              }
              user_status
              count_document
            }
          }
        `,variables:{user_type:e,pagination:t||null,last_name:a||null,sorting:i||null,school:o||null,programs:_||null,campuses:l||null,schools:r||null,levels:m||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(p=>p.data.GetAllUsers))}GetAllUsersByCRM(e,t,a,i,o,_,r,l,m){return this.apollo.watchQuery({query:n.ZP`
          query GetAllUsers(
            $user_type: [ID!]
            $pagination: PaginationInput
            $last_name: String
            $sorting: UserSorting
            $school: ID
            $programs: [String]
            $campuses: [ID]
            $schools: [ID]
            $levels: [ID]
          ) {
            GetAllUsers(
              user_type: $user_type
              pagination: $pagination
              last_name: $last_name
              sorting: $sorting
              school: $school
              programs: $programs
              campuses: $campuses
              schools: $schools
              levels: $levels
            ) {
              _id
              civility
              first_name
              last_name
              profile_picture
              email
              programs
              entities {
                entity_name
                school_type
                candidate_campus
                candidate_school
                candidate_level
                type {
                  _id
                  name
                }
              }
              user_status
              count_document
            }
          }
        `,variables:{user_type:e,pagination:t||null,last_name:a||null,sorting:i||null,school:o||null,programs:_||null,campuses:l||null,schools:r||null,levels:m||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(p=>p.data.GetAllUsers))}GetAllUsersCRMDropdown(e,t,a,i,o,_){return this.apollo.watchQuery({query:n.ZP`
          query GetAllUsers(
            $user_type: [ID!]
            $pagination: PaginationInput
            $last_name: String
            $sorting: UserSorting
            $candidate_campuses: [String]
            $schools: [ID]
          ) {
            GetAllUsers(
              user_type: $user_type
              candidate_campuses: $candidate_campuses
              schools: $schools
              pagination: $pagination
              last_name: $last_name
              sorting: $sorting
            ) {
              _id
              civility
              first_name
              last_name
              profile_picture
              email
              entities {
                candidate_campus
                schools
                candidate_level
                type {
                  _id
                  name
                }
              }
              user_status
              count_document
            }
          }
        `,variables:{user_type:e,candidate_campuses:t||null,schools:a||null,pagination:i||null,last_name:o||null,sorting:_||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(r=>r.data.GetAllUsers))}changeCompanyRelationMemberofStudents(e){return this.apollo.mutate({mutation:n.ZP`
          mutation ChangeCompanyRelationMemberofStudents(
            $change_company_relation_member_of_students: [CompanyRelationMemberofStudentsInput]
          ) {
            ChangeCompanyRelationMemberofStudents(change_company_relation_member_of_students: $change_company_relation_member_of_students) {
              _id
            }
          }
        `,variables:{change_company_relation_member_of_students:e}}).pipe((0,s.U)(t=>t.data.ChangeCompanyRelationMemberofStudents))}GetOneUserCRM(e){return this.apollo.watchQuery({query:n.ZP`
          query GetOneUserCRM($_id: ID) {
            GetOneUser(_id: $_id) {
              _id
              civility
              first_name
              last_name
              profile_picture
              user_addresses {
                address
                postal_code
                country
                city
                department
                region
                is_main_address
              }
              email
              position
              office_phone
              portable_phone
              entities {
                school {
                  _id
                  short_name
                }
                campus {
                  _id
                  name
                }
                level {
                  _id
                  name
                }
                type {
                  _id
                  name
                }
              }
              user_status
              count_document
            }
          }
        `,variables:{_id:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetOneUser))}getAllCandidateSchoolDropdown(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCandidateSchool {
            GetAllCandidateSchool {
              _id
              short_name
              campuses {
                name
                levels {
                  name
                }
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(e=>e.data.GetAllCandidateSchool))}getAllStudents(e,t,a){return this.apollo.watchQuery({query:n.ZP`
          query GetAllStudents($pagination: PaginationInput, $filter: FilterStudent, $student_ids: [ID]) {
            GetAllStudents(pagination: $pagination, filter: $filter, student_ids: $student_ids) {
              _id
              civility
              first_name
              last_name
              photo
              email
              tele_phone
              is_photo_in_s3
              photo_s3_path
              candidate_school
              candidate_campus
              candidate_level
              status
              count_document
              date_of_birth
              place_of_birth
              student_address {
                address
                postal_code
                country
                city
                region
                department
                is_main_address
              }
              companies {
                internship_id {
                  _id
                  status
                }
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,filter:t,student_ids:a||[]}}).valueChanges.pipe((0,s.U)(i=>i.data.GetAllStudents))}getCandidatesParentData(e){return this.apollo.query({query:n.ZP`
        query GetCandidatesParentData{
          GetOneCandidate(_id: "${e}"){
            _id
            address
            post_code
            country
            city
            region
            department
            payment_supports {
              _id
              relation
              account_holder_name
              bic
              iban
              financial_support_status
              cost
              family_name
              name
              sex
              civility
              tele_phone
              phone_number_indicative
              email
              upload_document_rib
              autorization_account
              parent_address {
                address
                postal_code
                city
                region
                department
                country
              }
            }
            parents {
              _id
              account_holder_name
              bic
              iban
              financial_support_status
              relation
              family_name
              name
              sex
              civility
              tele_phone
              phone_number_indicative
              email
              is_same_address
              job
              professional_email
              profession
              is_parent_also_payment_support
              is_contact_person_in_emergency
              parent_address {
                address
                postal_code
                country
                city
                region
                department
                is_main_address
              }
            }
          }
        }
        `,fetchPolicy:"network-only"}).pipe((0,s.U)(t=>t.data.GetOneCandidate))}triggerNotificationInternship_N1(e){return this.apollo.mutate({mutation:n.ZP`
          mutation TriggerNotificationINTERNSHIP_N1($internship_ids: [ID], $lang: String) {
            TriggerNotificationINTERNSHIP_N1(internship_ids: $internship_ids, lang: $lang)
          }
        `,variables:{internship_ids:e,lang:this.translate.currentLang}}).pipe((0,s.U)(t=>t.data.TriggerNotificationINTERNSHIP_N1))}triggerNotificationINTERNSHIP_N2(e){return this.apollo.mutate({mutation:n.ZP`
          mutation TriggerNotificationINTERNSHIP_N2($internship_id: ID, $lang: String) {
            TriggerNotificationINTERNSHIP_N2(internship_id: $internship_id, lang: $lang)
          }
        `,variables:{internship_id:e,lang:this.translate.currentLang}}).pipe((0,s.U)(t=>t.data.TriggerNotificationINTERNSHIP_N2))}triggerNotificationINTERNSHIP_N6(e){return this.apollo.mutate({mutation:n.ZP`
          mutation TriggerNotificationINTERNSHIP_N6($internship_id: ID, $lang: String) {
            TriggerNotificationINTERNSHIP_N6(internship_id: $internship_id, lang: $lang)
          }
        `,variables:{internship_id:e,lang:this.translate.currentLang}}).pipe((0,s.U)(t=>t.data.TriggerNotificationINTERNSHIP_N6))}triggerNotificationINTERNSHIP_N4(e){return this.apollo.mutate({mutation:n.ZP`
          mutation TriggerNotificationINTERNSHIP_N4($internship_id: ID, $lang: String) {
            TriggerNotificationINTERNSHIP_N4(internship_id: $internship_id, lang: $lang)
          }
        `,variables:{internship_id:e,lang:this.translate.currentLang}}).pipe((0,s.U)(t=>t.data.TriggerNotificationINTERNSHIP_N4))}TriggerNotificationINTERNSHIP_N5(e,t,a){return this.apollo.mutate({mutation:n.ZP`
          mutation TriggerNotificationINTERNSHIP_N5($old_CRM_id: ID, $new_CRM_id: ID, $internship_ids: [ID], $lang: String) {
            TriggerNotificationINTERNSHIP_N5(old_CRM_id: $old_CRM_id, new_CRM_id: $new_CRM_id, internship_ids: $internship_ids, lang: $lang)
          }
        `,variables:{old_CRM_id:e,new_CRM_id:t,internship_ids:a,lang:this.translate.currentLang}}).pipe((0,s.U)(i=>i.data.TriggerNotificationINTERNSHIP_N5))}getAllProgramsDropdown(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllUserProgramsDropdown {
            GetAllUserProgramsDropdown
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(e=>e.data.GetAllUserProgramsDropdown))}GetAllProgramsByScholar(e){return this.apollo.watchQuery({query:n.ZP`
          query {
            GetAllPrograms(filter: {scholar_season_id: "${e}"}) {
              _id
              program
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllPrograms))}CreatePayment(e){return this.apollo.mutate({mutation:n.ZP`
          mutation CreatePayment($payment_input: CreatePaymentInput!) {
            CreatePayment(payment_input: $payment_input) {
              psp_reference
              result_code
              amount {
                currency
                value
              }
              merchant_reference
              refusal_reason
              refusal_reason_code
            }
          }
        `,variables:{payment_input:e}}).pipe((0,s.U)(t=>t.data.CreatePayment))}getAllScholarSeasons(e,t){return this.apollo.watchQuery({query:n.ZP`
          query GetAllScholarSeasons($filter: ScholarSeasonFilterInput, $for_next_season: Boolean) {
            GetAllScholarSeasons(filter: $filter, for_next_season: $for_next_season) {
              _id
              scholar_season
              description
              from {
                date_utc
                time_utc
              }
              to {
                date_utc
                time_utc
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e||null,for_next_season:t||null}}).valueChanges.pipe((0,s.U)(a=>a.data.GetAllScholarSeasons))}GetAllScholarSeasonsPublished(e,t,a){return this.apollo.watchQuery({query:n.ZP`
          query GetAllScholarSeasons($pagination: PaginationInput) {
            GetAllScholarSeasons(pagination: $pagination, filter: { is_published: true }) {
              _id
              scholar_season
              description
              from {
                date_utc
                time_utc
              }
              to {
                date_utc
                time_utc
              }
              is_published
              count_document
            }
          }
        `,variables:{pagination:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(i=>i.data.GetAllScholarSeasons))}getAllSchoolDropdown(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCandidateSchool {
            GetAllCandidateSchool {
              _id
              short_name
              long_name
              campuses {
                _id
                name
                levels {
                  _id
                  name
                }
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(e=>e.data.GetAllCandidateSchool))}GetAllSchoolFilter(e,t,a,i,o,_){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCandidateSchool($user_type_ids: [ID], $is_from_crm: Boolean,$include_all: Boolean, $is_assignment_table: Boolean){
            GetAllCandidateSchool(${t} scholar_season_id: "${e}", user_type_ids: $user_type_ids, is_from_crm: $is_from_crm,include_all:$include_all,is_assignment_table:$is_assignment_table) {
              _id
              short_name
              long_name
              campuses {
                _id
                name
                address
                post_code
                city
                country
                currency
                bank {
                  name
                  contacts {
                    first_name
                    last_name
                    civility
                    sex
                    position
                    fixed_phone
                    mobile_phone
                    email
                  }
                  address
                  post_code
                  city
                  country
                }
                levels {
                  _id
                  name
                  code
                  description
                  extra_fees {
                    name
                    amount
                  }
                  rate_profiles {
                    name
                    down_payment
                    payment_plan {
                      name
                      times
                      additional_expense
                      payment_date {
                        date
                        amount
                      }
                    }
                  }
                  documents {
                    name
                    url
                  }
                  terms_and_condition
                  specialities {
                    name
                  }
                }
                specialities {
                  _id
                  name
                }
              }
              levels {
                _id
                name
                code
                description
                extra_fees {
                  name
                  amount
                }
                rate_profiles {
                  name
                  down_payment
                  payment_plan {
                    name
                    times
                    additional_expense
                    payment_date {
                      date
                      amount
                    }
                  }
                }
                documents {
                  name
                  url
                }
                terms_and_condition
                specialities {
                  name
                }
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{user_type_ids:a,is_from_crm:i,include_all:o,is_assignment_table:_||null}}).valueChanges.pipe((0,s.U)(r=>r.data.GetAllCandidateSchool))}GetAllSchoolFilterTrombs(e,t,a){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCandidateSchool($user_type_logins: [ID]){
            GetAllCandidateSchool(${t} scholar_season_id: "${e}", user_type_logins: $user_type_logins) {
              _id
              short_name
              long_name
              campuses {
                _id
                name
                address
                post_code
                city
                country
                currency
                bank {
                  name
                  contacts {
                    first_name
                    last_name
                    civility
                    sex
                    position
                    fixed_phone
                    mobile_phone
                    email
                  }
                  address
                  post_code
                  city
                  country
                }
                levels {
                  _id
                  name
                  code
                  description
                  extra_fees {
                    name
                    amount
                  }
                  rate_profiles {
                    name
                    down_payment
                    payment_plan {
                      name
                      times
                      additional_expense
                      payment_date {
                        date
                        amount
                      }
                    }
                  }
                  documents {
                    name
                    url
                  }
                  terms_and_condition
                  specialities {
                    name
                  }
                }
                specialities {
                  _id
                  name
                }
              }
              levels {
                _id
                name
                code
                description
                extra_fees {
                  name
                  amount
                }
                rate_profiles {
                  name
                  down_payment
                  payment_plan {
                    name
                    times
                    additional_expense
                    payment_date {
                      date
                      amount
                    }
                  }
                }
                documents {
                  name
                  url
                }
                terms_and_condition
                specialities {
                  name
                }
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{user_type_logins:a}}).valueChanges.pipe((0,s.U)(i=>i.data.GetAllCandidateSchool))}GetAllSchoolDropdown(e,t,a){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCandidateSchool($filter: CandidateSchoolFilterInput, $scholar_season_id: ID, $user_type_id: ID) {
            GetAllCandidateSchool(filter: $filter, scholar_season_id: $scholar_season_id, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              campuses {
                _id
                name
                address
                post_code
                city
                country
                currency
                bank {
                  name
                  contacts {
                    first_name
                    last_name
                    civility
                    sex
                    position
                    fixed_phone
                    mobile_phone
                    email
                  }
                  address
                  post_code
                  city
                  country
                }
                levels {
                  _id
                  name
                  code
                  description
                  extra_fees {
                    name
                    amount
                  }
                  rate_profiles {
                    name
                    down_payment
                    payment_plan {
                      name
                      times
                      additional_expense
                      payment_date {
                        date
                        amount
                      }
                    }
                  }
                  documents {
                    name
                    url
                  }
                  terms_and_condition
                  specialities {
                    name
                  }
                }
                specialities {
                  _id
                  name
                }
              }
              levels {
                _id
                name
                code
                description
                extra_fees {
                  name
                  amount
                }
                rate_profiles {
                  name
                  down_payment
                  payment_plan {
                    name
                    times
                    additional_expense
                    payment_date {
                      date
                      amount
                    }
                  }
                }
                documents {
                  name
                  url
                }
                terms_and_condition
                specialities {
                  name
                }
              }
            }
          }
        `,variables:{filter:e,scholar_season_id:t,user_type_id:a},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(i=>i.data.GetAllCandidateSchool))}GetAllCampuses(e,t,a,i){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCampuses($filter: CampusFilterInput, $user_type_ids: [ID], $is_from_crm: Boolean, $include_all: Boolean) {
            GetAllCampuses(filter: $filter, user_type_ids: $user_type_ids, is_from_crm: $is_from_crm, include_all: $include_all) {
              _id
              name
              address
              post_code
              city
              country
              currency
              bank {
                name
              }
              levels {
                _id
                name
              }
              specialities {
                _id
                name
              }
            }
          }
        `,variables:{filter:e,user_type_ids:t,is_from_crm:a,include_all:i},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(o=>o.data.GetAllCampuses))}GetAllSpecializationsByScholar(e){return this.apollo.watchQuery({query:n.ZP`
          query GetAllSpecializations($filter: SpecializationFilterInput) {
            GetAllSpecializations(filter: $filter) {
              _id
              name
              sigli
              intake_channel
              description
              programs {
                _id
                program
              }
              sectors {
                name
              }
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllSpecializations))}GetAllLevels(e,t,a,i){return this.apollo.watchQuery({query:n.ZP`
          query GetAllLevels($filter: LevelFilterInput, $user_type_ids: [ID], $is_from_crm: Boolean, $include_all: Boolean) {
            GetAllLevels(filter: $filter, user_type_ids: $user_type_ids, is_from_crm: $is_from_crm, include_all: $include_all) {
              _id
              name
              code
              description
              specialities {
                _id
                name
              }
              documents {
                name
                url
              }
              terms_and_condition
            }
          }
        `,variables:{filter:e,user_type_ids:t,is_from_crm:a,include_all:i},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(o=>o.data.GetAllLevels))}GetAllSpecializationsWithoutFilter(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllSpecializations {
            GetAllSpecializations {
              _id
              name
              sectors {
                _id
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(e=>e.data.GetAllSpecializations))}getLatestCandidateOscarTable(){return this.apollo.mutate({mutation:n.ZP`
          mutation RefreshCandidateFromOscarCampus{
            RefreshCandidateFromOscarCampus {
              message
              total_created
            }
          }
        `}).pipe((0,s.U)(e=>e.data.RefreshCandidateFromOscarCampus))}refreshCandidateFromHubSpot(){return this.apollo.mutate({mutation:n.ZP`
          mutation RefreshCandidateFromHubSpot{
            RefreshCandidateFromHubSpot
          }
        `}).pipe((0,s.U)(e=>e.data.RefreshCandidateFromHubSpot))}AssignProgramToCandidate(e,t,a,i,o,_){return this.apollo.mutate({mutation:n.ZP`
          mutation AssignProgramToCandidate(
            $candidate_ids: [ID!]!
            $select_all: Boolean
            $filter: CandidateAssignProgramFilterInput
            $searching: CandidateSearchInput
            $assign_program_to_candidate_input: AssignProgramToCandidateInput
            $is_readmission: Boolean
          ) {
            AssignProgramToCandidate(
              candidate_ids: $candidate_ids
              select_all: $select_all
              filter: $filter
              searching: $searching
              assign_program_to_candidate_input: $assign_program_to_candidate_input
              is_readmission: $is_readmission
            )
          }
        `,variables:{select_all:e,assign_program_to_candidate_input:t,filter:a||null,is_readmission:_||null,searching:i||null,candidate_ids:o||[]}}).pipe((0,s.U)(r=>r.data.AssignProgramToCandidate))}getDevMemberDropdown(e,t,a){return this.apollo.watchQuery({query:n.ZP`
        query getAdmissionUsers($entity: [EnumEntityType!], $user_type: [ID!]) {
          GetAllUsers(entity: $entity, user_type: $user_type, campus: "${e}",
          school: "${t}", level: "${a}"
          ) {
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
            }
          }
        }
        `,variables:{entity:["admission"],user_type:["617f64ec5a48fe2228518810","617f64ec5a48fe2228518811"]},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(i=>i.data.GetAllUsers))}getAcademicMemberDropdown(e,t,a){return this.apollo.watchQuery({query:n.ZP`
          query getAcademicMemberDropdown(
            $entity: [EnumEntityType!]
            $user_type: [ID!]
            $candidate_schools: [ID]
            $candidate_campuses: [ID]
            $candidate_levels: [ID]
          ) {
            GetAllUsers(
              entity: $entity
              user_type: $user_type
              candidate_campuses: $candidate_campuses
              candidate_schools: $candidate_schools
              candidate_levels: $candidate_levels
            ) {
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
              }
            }
          }
        `,variables:{entity:["academic"],user_type:["617f64ec5a48fe2228518813"],candidate_campuses:e,candidate_schools:t,candidate_levels:a},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(i=>i.data.GetAllUsers))}getAcadMemberDropdown(e,t,a){return this.apollo.watchQuery({query:n.ZP`
        query getAcademicUsers($entity: [EnumEntityType!], $user_type: [ID!]) {
          GetAllUsers(entity: $entity, user_type: $user_type, campus: "${e}",
          school: "${t}", level: "${a}"
          ) {
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
            }
          }
        }
        `,variables:{entity:["academic"],user_type:["617f64ec5a48fe2228518813"]},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(i=>i.data.GetAllUsers))}getAllCandidateCampus(e,t){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCampuses($filter: CampusFilterInput, $include_all: Boolean) {
            GetAllCampuses(filter: $filter, include_all: $include_all) {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e,include_all:t}}).valueChanges.pipe((0,s.U)(a=>a.data.GetAllCampuses))}SendRegistrationN1(e){return this.apollo.mutate({mutation:n.ZP`
          mutation SendRegistrationN1($candidate_ids: [ID!]!, $lang: String) {
            SendRegistrationN1(candidate_ids: $candidate_ids, lang: $lang)
          }
        `,variables:{candidate_ids:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(t=>t.data.SendRegistrationN1))}SendRegistrationN1WithFlyer(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation SendRegistrationN1($candidate_ids: [ID!]!, $lang: String, $is_include_flyer: Boolean) {
            SendRegistrationN1(candidate_ids: $candidate_ids, lang: $lang, is_include_flyer: $is_include_flyer)
          }
        `,variables:{candidate_ids:e,is_include_flyer:t,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(a=>a.data.SendRegistrationN1))}UpdateCandidateCRMStatus(e){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateCandidateCRMStatus($candidate_ids: [ID]) {
            UpdateCandidateCRMStatus(candidate_ids: $candidate_ids)
          }
        `,variables:{candidate_ids:e}}).pipe((0,s.U)(t=>t.data.UpdateCandidateCRMStatus))}GetAllCandidateNationalities(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCandidateNationalities {
            GetAllCandidateNationalities
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(e=>e.data.GetAllCandidateNationalities))}GetAllCandidateComments(e){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCandidateComments($filter: CandidateCommentFilterInput) {
            GetAllCandidateComments(filter: $filter) {
              _id
              candidate_id {
                _id
                first_name
                last_name
                civility
                photo
              }
              created_by {
                _id
                first_name
                last_name
                civility
                profile_picture
              }
              subject
              comment
              is_personal_situation
              is_restrictive_conditions
              is_reply
              reply_for_comment_id {
                _id
                candidate_id {
                  _id
                  first_name
                  last_name
                  civility
                  photo
                }
                created_by {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                }
                subject
                comment
                category
                is_reply
                tagged_user_ids {
                  _id
                  first_name
                  last_name
                  civility
                }
                date_created
              }
              reply_comment_ids {
                _id
                candidate_id {
                  _id
                  first_name
                  last_name
                  civility
                  photo
                }
                created_by {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                }
                subject
                comment
                category
                is_reply
                tagged_user_ids {
                  _id
                  first_name
                  last_name
                  civility
                }
                date_created
              }
              tagged_user_ids {
                _id
                first_name
                last_name
                civility
              }
              date_created
              category
              actor {
                civility
                first_name
                last_name
              }
              master_transaction_id {
                is_manual_action
                date_action {
                  date
                  time
                }
                credit
                debit
                note
                reference
              }
              param_comment
              payment_amount
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllCandidateComments))}GetOneCandidateComment(e){return this.apollo.watchQuery({query:n.ZP`
          query GetOneCandidateComment($_id: ID!) {
            GetOneCandidateComment(_id: $_id) {
              _id
              candidate_id {
                _id
                first_name
                last_name
                civility
                photo
              }
              created_by {
                _id
                first_name
                last_name
                civility
                profile_picture
              }
              subject
              comment
              is_personal_situation
              is_restrictive_conditions
              is_reply
              reply_for_comment_id {
                _id
                candidate_id {
                  _id
                  first_name
                  last_name
                  civility
                  photo
                }
                created_by {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                }
                subject
                comment
                category
                is_reply
                tagged_user_ids {
                  _id
                  first_name
                  last_name
                  civility
                }
                date_created
              }
              reply_comment_ids {
                _id
                candidate_id {
                  _id
                  first_name
                  last_name
                  civility
                  photo
                }
                created_by {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                }
                subject
                comment
                category
                is_reply
                tagged_user_ids {
                  _id
                  first_name
                  last_name
                  civility
                }
                date_created
              }
              tagged_user_ids {
                _id
                first_name
                last_name
                civility
              }
              category
              date_created
            }
          }
        `,variables:{_id:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetOneCandidateComment))}GetAllCandidateCommentCategories(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCandidateCommentCategories{
            GetAllCandidateCommentCategories
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(e=>e.data.GetAllCandidateCommentCategories))}CreateCandidateComment(e){return this.apollo.mutate({mutation:n.ZP`
          mutation CreateCandidateComment($candidate_comment_input: CandidateCommentInput) {
            CreateCandidateComment(candidate_comment_input: $candidate_comment_input) {
              _id
            }
          }
        `,variables:{candidate_comment_input:e}}).pipe((0,s.U)(t=>t.data.CreateCandidateComment))}UpdateCandidateComment(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateCandidateComment($_id: ID!, $candidate_comment_input: CandidateCommentInput) {
            UpdateCandidateComment(_id: $_id, candidate_comment_input: $candidate_comment_input) {
              _id
            }
          }
        `,variables:{_id:e,candidate_comment_input:t}}).pipe((0,s.U)(a=>a.data.UpdateCandidateComment))}DeleteCandidateComment(e){return this.apollo.mutate({mutation:n.ZP`
          mutation DeleteCandidateComment($_id: ID!) {
            DeleteCandidateComment(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:e}}).pipe((0,s.U)(t=>t.data.DeleteCandidateComment))}GetCandidateCommentsFilterList(e){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCandidateComments($filter: CandidateCommentFilterInput) {
            GetAllCandidateComments(filter: $filter) {
              created_by {
                _id
                first_name
                last_name
                civility
              }
              date_created
              category
              is_reply
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllCandidateComments))}TransferProgramOfCandidate(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation TransferProgramOfCandidate($assign_program_to_candidate_input: AssignProgramToCandidateInput, $lang: String) {
            TransferProgramOfCandidate(candidate_id: "${e}", assign_program_to_candidate_input: $assign_program_to_candidate_input, lang: $lang) {
              _id
              region
            }
          }
        `,variables:{assign_program_to_candidate_input:t,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,s.U)(a=>a.data.TransferProgramOfCandidate))}GetFirstDateOfRegisteredCandidate(e,t,a,i,o,_,r){return this.apollo.watchQuery({query:n.ZP`
          query GetFirstDateOfRegisteredCandidate(
            $scholar_season_id: ID
            $school_ids: [ID]
            $campus_ids: [ID]
            $level_ids: [ID]
            $sector_ids: [ID]
            $speciality_ids: [ID]
            $start_date: String
          ) {
            GetFirstDateOfRegisteredCandidate(
              scholar_season_id: $scholar_season_id
              school_ids: $school_ids
              campus_ids: $campus_ids
              level_ids: $level_ids
              sector_ids: $sector_ids
              speciality_ids: $speciality_ids
              start_date: $start_date
            ) {
              date
              time
            }
          }
        `,variables:{scholar_season_id:e,school_ids:t,campus_ids:a,level_ids:i,sector_ids:o,speciality_ids:_||null,start_date:r},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(l=>l.data.GetFirstDateOfRegisteredCandidate))}getUserContinuousFormationManager(e,t,a,i){return this.apollo.query({query:n.ZP`
          query GetAllUsers($userType: [ID!], $candidateSchool: ID, $candidateCampus: ID, $candidateLevel: ID) {
            GetAllUsers(user_type: $userType, level: $candidateLevel, school: $candidateSchool, campus: $candidateCampus) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,variables:{userType:e,candidateCampus:t,candidateSchool:a,candidateLevel:i},fetchPolicy:"network-only"}).pipe((0,s.U)(o=>o.data.GetAllUsers))}getAppPermission(){return this.apollo.query({query:n.ZP`
          query GetAppPermission{
            GetAppPermission {
              candidate_import {
                is_hubspot_running
                hubspot_last_import_date {
                  time
                  date
                }
                oscar_last_import_date {
                  date
                  time
                }
              }
              hyperplanning {
                teacher_last_updated {
                  date
                  time
                }
                student_last_updated {
                  date
                  time
                }
                is_update_student_running
                is_update_teacher_running
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,s.U)(e=>e.data.GetAppPermission))}getAllAdmissionFinancements(){return this.apollo.query({query:n.ZP`
          query GetAllAdmissionFinancements{
            GetAllAdmissionFinancements {
              _id
              candidate_id {
                _id
              }
              admission_process_id {
                _id
              }
              organization_name
              rate_per_hours
              hours
              total
              remaining_due
              document_pdf
              status
              count_document
              is_financement_validated
              created_by {
                _id
                first_name
                last_name
              }
            }
        `,fetchPolicy:"network-only"}).pipe((0,s.U)(e=>e.data.GetAllAdmissionFinancements))}createAdmissionFinancement(e){return this.apollo.mutate({mutation:n.ZP`
          mutation CreateAdmissionFinancement($payload: AdmissionFinancementInput) {
            CreateAdmissionFinancement(admission_financement_input: $payload) {
              _id
            }
          }
        `,variables:{payload:e}}).pipe((0,s.U)(t=>t.data.CreateAdmissionFinancement))}GetAllSchoolCRMDropdown(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllSchoolCRMDropdown{
            GetAllSchoolCRMDropdown
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(e=>e.data.GetAllSchoolCRMDropdown))}GetAllCampusCRMDropdown(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCampusCRMDropdown{
            GetAllCampusCRMDropdown
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(e=>e.data.GetAllCampusCRMDropdown))}GetAllLevelCRMDropdown(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllLevelCRMDropdown{
            GetAllLevelCRMDropdown
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(e=>e.data.GetAllLevelCRMDropdown))}generateStudentBilling(e,t,a,i){return this.apollo.mutate({mutation:n.ZP`
          mutation GenerateStudentBilling(
            $select_all: Boolean
            $filter: BillingFilterInput
            $billing_student_ids: [ID]
            $user_type_ids: [ID]
          ) {
            GenerateStudentBilling(
              select_all: $select_all
              filter: $filter
              billing_student_ids: $billing_student_ids
              user_type_ids: $user_type_ids
            ) {
              _id
            }
          }
        `,variables:{select_all:e,filter:t,billing_student_ids:a,user_type_ids:i||null}}).pipe((0,s.U)(o=>o.data.GenerateStudentBilling))}getAllIdForReadmissionCheckbox(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
                  _id
                }
              }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getAllFiIdForCheckbox(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
                  _id
                }
              }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getAllIdForAssignmentCheckbox(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput, $user_type_ids: [ID]) {
          GetAllCandidates(pagination: $pagination, sorting: $sort, ${a}, searching: $searching, user_type_ids: $user_type_ids) {
                  _id
                }
              }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getAllDesiredForAssignmentCheckbox(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
                  _id
                  program_desired
                }
              }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getAllProgramForAssignmentCheckbox(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
                  _id
                  last_name
                  first_name
                  civility
                  program_desired
                  jury_decision
                  financial_situation
                }
              }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getAllEmailForAssignmentCheckbox(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
                  _id
                  civility
                  first_name
                  last_name
                  email
                  school_mail
                }
              }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getAllJuryForAssignmentCheckbox(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
                  _id
                  jury_decision
                }
              }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getFIDataCrmOk(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            is_oscar_updated
            is_hubspot_updated
            is_manual_updated
            candidate_admission_status
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getFIDataRegisProfil(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            intake_channel {
              _id
              program
              scholar_season_id {
                _id
              }
            }
            type_of_formation_id {
              _id
            }
            registration_profile {
              _id
              name
            }
            school {
              _id
              short_name
              long_name
            }
            campus {
              _id
              name
            }
            level {
              _id
              name
            }
            speciality {
              _id
              name
            }
            sector {
              _id
              name
            }
            civility
            first_name
            last_name
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getFIDataForCall(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            registration_profile {
              _id
            }
            announcement_call
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getFIDataForFirstMail(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            registration_profile {
              _id
            }
            announcement_call
            announcement_email {
              sent_date
              sent_time
            }
            civility
            first_name
            last_name
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getFIDataForDevMember(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            admission_member_id {
              _id
              first_name
              last_name
              civility
              email
            }
            civility
            first_name
            last_name
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getFIDataForSendMail(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            civility
            first_name
            last_name
            email
            school_mail
            payment_supports {
              relation
              family_name
              name
              civility
              email
            }
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getFCDataCrmOk(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            is_oscar_updated
            is_hubspot_updated
            is_manual_updated
            candidate_admission_status
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getFCDataRegisProfil(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            intake_channel {
              _id
              program
              scholar_season_id {
                _id
              }
            }
            type_of_formation_id {
              _id
            }
            registration_profile {
              _id
              name
            }
            school {
              _id
              short_name
              long_name
            }
            campus {
              _id
              name
            }
            level {
              _id
              name
            }
            speciality {
              _id
              name
            }
            sector {
              _id
              name
            }
            civility
            first_name
            last_name
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getFCDataForCall(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            registration_profile {
              _id
            }
            announcement_call
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getFCDataForFirstMail(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            registration_profile {
              _id
            }
            announcement_call
            announcement_email {
              sent_date
              sent_time
            }
            civility
            first_name
            last_name
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getFCDataForDevMember(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            admission_member_id {
              _id
              first_name
              last_name
              civility
              email
            }
            civility
            first_name
            last_name
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getFCDataForSendMail(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            civility
            first_name
            last_name
            email
            school_mail
            payment_supports {
              relation
              family_name
              name
              civility
              email
            }
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getReadmissionDataRegisProfil(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            financial_situation
            intake_channel {
              _id
              program
              scholar_season_id {
                _id
              }
            }
            type_of_formation_id {
              _id
            }
            registration_profile {
              _id
              name
            }
            school {
              _id
              short_name
              long_name
            }
            campus {
              _id
              name
            }
            level {
              _id
              name
            }
            speciality {
              _id
              name
            }
            sector {
              _id
              name
            }
            civility
            first_name
            last_name
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getReadmissionDataForFirstMail(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            registration_profile {
              _id
            }
            announcement_call
            announcement_email {
              sent_date
              sent_time
            }
            civility
            first_name
            last_name
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getReadmissionDataForDevMember(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            admission_member_id {
              _id
              first_name
              last_name
              civility
              email
            }
            type_of_formation_id {
              _id
              type_of_information
              type_of_formation
            }
            civility
            first_name
            last_name
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getReadmissionDataForSendMail(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            civility
            first_name
            last_name
            email
            school_mail
            payment_supports {
              relation
              family_name
              name
              civility
              email
            }
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getReadmissionDataForEditJury(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            jury_decision
            civility
            first_name
            last_name
            latest_previous_program {
              _id
              scholar_season_id {
                _id
                scholar_season
              }
            }           
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getReadmissionDataForReminder(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            announcement_email {
              sent_date
              sent_time
            }
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getReadmissionDataForAdmissionId(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
            _id
            admission_process_id {
              _id
            }
          }
        }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}CheckPaymentCompleted(e){return this.apollo.watchQuery({query:n.ZP`
          query CheckPaymentCompleted($candidate_id: ID!) {
            CheckPaymentCompleted(candidate_id: $candidate_id)
          }
        `,variables:{candidate_id:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.CheckPaymentCompleted))}getAllAdmissionFinancementsTransfer(e){return this.apollo.watchQuery({query:n.ZP`
          query GetAllAdmissionFinancements($filter: AdmissionFinancementFilterInput) {
            GetAllAdmissionFinancements(filter: $filter) {
              _id
              actual_status
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllAdmissionFinancements))}getAllCandidatesFc(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput, $lang: String) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching, lang: $lang) {
                  _id
                  jury_decision
                  trial_date
                  region
                  civility
                  first_name
                  last_name
                  telephone
                  payment_method
                  is_admitted
                  email
                  is_oscar_updated
                  finance
                  nationality
                  registration_profile_type
                  candidate_unique_number
                  candidate_admission_status
                  is_future_program_assigned
                  program_status
                  is_program_assigned
                  financement
                  school_mail
                  diploma_status
                  admission_document_process_status
                  billing_id {
                    _id
                    deposit_status
                    is_deposit_completed
                    deposit_pay_amount
                    deposit
                    account_number
                  }
                  campus {
                    _id
                    name
                    address
                    levels {
                      _id
                      name
                    }
                    specialities {
                      _id
                      name
                    }
                  }
                  photo
                  registration_email_due_date {
                    due_date
                    due_time
                  }
                  reg_n8_sent_date {
                    sent_date
                    sent_time
                  }
                  announcement_call
                  announcement_email {
                    sent_date
                    sent_time
                  }
                  intake_channel {
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                    sigle
                    admission_form_id {
                      _id
                      form_builder_name
                    }
                  }
                  registration_profile {
                    _id
                    name
                    is_down_payment
                    discount_on_full_rate
                    type_of_formation {
                      _id
                      type_of_information
                    }
                    additional_cost_ids {
                      additional_cost
                      amount
                    }
                  }
                  engagement_level
                  level {
                    _id
                    name
                    specialities {
                      _id
                      name
                    }
                  }
                  speciality {
                    _id
                    name
                  }
                  scholar_season {
                    _id
                    scholar_season
                  }
                  sector {
                    _id
                    name
                  }
                  school {
                    _id
                    short_name
                    long_name
                    campuses {
                      _id
                      name
                      levels {
                        _id
                        name
                      }
                    }
                  }
                  connection
                  personal_information
                  signature
                  method_of_payment
                  payment
                  admission_member_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  fixed_phone
                  is_whatsapp
                  participate_in_open_house_day
                  participate_in_job_meeting
                  count_document
                  user_id {
                    _id
                  }
                  payment_splits {
                    payer_name
                    percentage
                  }
                  payment_supports {
                    relation
                    family_name
                    name
                    civility
                    tele_phone
                    email
                    parent_address {
                      address
                      additional_address
                      postal_code
                      city
                      region
                      department
                      country
                    }
                  }
                  program_desired
                  trial_date
                  date_added
                  selected_payment_plan {
                    name
                    times
                    additional_expense
                    total_amount
                    payment_date {
                      date
                      amount
                    }
                    down_payment
                  }
                  registered_at {
                    date
                    time
                  }
                  resign_after_school_begins_at {
                    date
                    time
                  }
                  no_show_at {
                    date
                    time
                  }
                  hubspot_deal_id
                  hubspot_contact_id
                  is_hubspot_updated
                  is_manual_updated
                  continuous_formation_manager_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  admission_process_id {
                    _id
                    steps {
                      _id
                      index
                      step_title
                      step_type
                      step_status
                      status
                      is_only_visible_based_on_condition
                    }
                  }
                  latest_previous_program{
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_readmission
                  previous_programs {
                    _id
                  }
                }
              }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{},lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getAllFcIdForCheckbox(e,t,a,i,o){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${a}, searching: $searching) {
                  _id
                }
              }
        `,variables:{user_type_ids:o,pagination:e,sort:t||{},searching:i||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(_=>_.data.GetAllCandidates))}getAllCandidatesTabStudent(e,t){return this.apollo.watchQuery({query:n.ZP`
          query getAllCandidatesTabStudent($filter: CandidateFilterInput, $user_type_ids: [ID]) {
            GetAllCandidates(filter: $filter, user_type_ids: $user_type_ids) {
              _id
              region
              require_visa_permit
              civility
              first_name
              last_name
              telephone
              phone_number_indicative
              payment_method
              is_admitted
              registration_certificate
              email
              registration_certificate
              nationality
              candidate_unique_number
              candidate_admission_status
              program_status
              jury_decision
              readmission_status
              is_future_program_assigned
              financial_situation
              current_school_contract_amendment_form {
                _id
                school_amendment_form_link
                school_amendment_pdf_name
                form_status
              }
              reason_no_reinscription
              reinscription_yes_no {
                is_answer_yes
                answer_label
              }
              registration_profile_type
              full_rate_id {
                amount_internal
                amount_external
              }
              is_program_assigned
              admission_process_id {
                _id
                steps {
                  step_type
                }
              }
              student_id {
                _id
                user_id {
                  _id
                }
                program_sequence_ids {
                  _id
                  name
                  program_id {
                    _id
                    program
                  }
                  program_sequence_groups {
                    _id
                    student_classes {
                      name
                      students_id {
                        _id
                      }
                      program_sequence_id {
                        program_modules_id {
                          program_subjects_id {
                            name
                          }
                        }
                      }
                    }
                  }
                  start_date {
                    date
                    time
                  }
                  end_date {
                    date
                    time
                  }
                  type_of_sequence
                }
              }
              billing_id {
                _id
                profil_rate
                account_number
                deposit
                deposit_pay_amount
                terms {
                  _id
                  term_pay_date {
                    date
                    time
                  }
                  is_locked
                  is_term_paid
                  term_pay_amount
                  term_payment {
                    date
                    time
                  }
                  term_payment_deferment {
                    date
                    time
                  }
                  is_partial
                  term_amount
                }
                accumulated_late
              }
              campus {
                _id
                name
                address
                levels {
                  _id
                  name
                }
                specialities {
                  _id
                  name
                }
              }
              photo
              registration_email_due_date {
                due_date
                due_time
              }
              reg_n8_sent_date {
                sent_date
                sent_time
              }
              announcement_call
              announcement_email {
                sent_date
                sent_time
              }
              intake_channel {
                _id
                program
                school_id {
                  short_name
                }
                campus {
                  name
                }
                level {
                  name
                }
                scholar_season_id {
                  _id
                  scholar_season
                }
                speciality_id {
                  name
                }
                course_sequence_id {
                  program_sequences_id {
                    program_sequence_groups {
                      _id
                      student_classes {
                        name
                        students_id {
                          _id
                        }
                        program_sequence_id {
                          program_modules_id {
                            program_subjects_id {
                              name
                            }
                          }
                        }
                      }
                    }
                    name
                    type_of_sequence
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
              }
              type_of_formation_id {
                _id
                type_of_information
                type_of_formation
              }
              registration_profile {
                _id
                name
                discount_on_full_rate
                additional_cost_ids {
                  additional_cost
                  amount
                }
                type_of_formation {
                  _id
                  type_of_information
                }
                is_down_payment
              }
              engagement_level
              level {
                _id
                name
                specialities {
                  _id
                  name
                }
              }
              speciality {
                _id
                name
              }
              scholar_season {
                _id
                scholar_season
                from {
                  date_utc
                  time_utc
                }
                to {
                  date_utc
                  time_utc
                }
              }
              sector {
                _id
                name
              }
              school {
                _id
                short_name
                long_name
                campuses {
                  _id
                  name
                  levels {
                    _id
                    name
                  }
                }
              }
              selected_payment_plan {
                total_amount
                down_payment
              }
              school_mail
              connection
              personal_information
              signature
              method_of_payment
              payment
              admission_member_id {
                _id
                first_name
                last_name
                civility
                profile_picture
                email
                position
              }
              fixed_phone
              is_whatsapp
              participate_in_open_house_day
              participate_in_job_meeting
              count_document
              user_id {
                _id
              }
              payment_splits {
                payer_name
                percentage
              }
              payment_supports {
                relation
                family_name
                name
                civility
                tele_phone
                email
                parent_address {
                  address
                  additional_address
                  postal_code
                  city
                  region
                  department
                  country
                }
              }
              program_desired
              trial_date
              school_contract_pdf_link
              date_added
              engaged_at {
                date
                time
              }
              registered_at {
                date
                time
              }
              resigned_after_engaged_at {
                date
                time
              }
              resign_after_school_begins_at {
                date
                time
              }
              no_show_at {
                date
                time
              }
              resigned_after_registered_at {
                date
                time
              }
              inscription_at {
                date
                time
              }
              resigned_at {
                date
                time
              }
              candidate_sign_date {
                date
                time
              }
              school_contract_pdf_link
              bill_validated_at {
                date
                time
              }
              payment_transfer_check_data {
                s3_document_name
              }
              financement_validated_at {
                date
                time
              }
              initial_intake_channel
              latest_previous_program {
                _id
                program
                school_id {
                  short_name
                }
                campus {
                  name
                }
                level {
                  name
                }
                scholar_season_id {
                  _id
                  scholar_season
                }
                speciality_id {
                  name
                }
              }
              previous_programs {
                _id
                telephone
                payment_method
                is_admitted
                registration_certificate
                candidate_unique_number
                candidate_admission_status
                admission_process_id {
                  _id
                  steps {
                    step_type
                  }
                }
                billing_id {
                  _id
                  account_number
                  deposit
                  deposit_pay_amount
                  terms {
                    _id
                    term_pay_date {
                      date
                      time
                    }
                    is_locked
                    is_term_paid
                    term_pay_amount
                    term_payment {
                      date
                      time
                    }
                    term_payment_deferment {
                      date
                      time
                    }
                    is_partial
                    term_amount
                  }
                  accumulated_late
                }
                campus {
                  _id
                  name
                  address
                  levels {
                    _id
                    name
                  }
                  specialities {
                    _id
                    name
                  }
                }
                registration_email_due_date {
                  due_date
                  due_time
                }
                reg_n8_sent_date {
                  sent_date
                  sent_time
                }
                announcement_call
                announcement_email {
                  sent_date
                  sent_time
                }
                intake_channel {
                  _id
                  program
                  school_id {
                    short_name
                  }
                  campus {
                    name
                  }
                  level {
                    name
                  }
                  scholar_season_id {
                    _id
                    scholar_season
                  }
                  speciality_id {
                    name
                  }
                }
                type_of_formation_id {
                  _id
                  type_of_information
                  type_of_formation
                }
                registration_profile {
                  _id
                  name
                  discount_on_full_rate
                  additional_cost_ids {
                    additional_cost
                    amount
                  }
                  type_of_formation {
                    _id
                    type_of_information
                  }
                  is_down_payment
                }
                engagement_level
                level {
                  _id
                  name
                  specialities {
                    _id
                    name
                  }
                }
                speciality {
                  _id
                  name
                }
                scholar_season {
                  _id
                  scholar_season
                }
                sector {
                  _id
                  name
                }
                school {
                  _id
                  short_name
                  long_name
                  campuses {
                    _id
                    name
                    levels {
                      _id
                      name
                    }
                  }
                }
                selected_payment_plan {
                  total_amount
                  down_payment
                }
                school_mail
                connection
                personal_information
                signature
                method_of_payment
                payment
                admission_member_id {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                  email
                  position
                }
                is_whatsapp
                participate_in_open_house_day
                participate_in_job_meeting
                count_document
                user_id
                payment_splits {
                  payer_name
                  percentage
                }
                program_desired
                trial_date
                school_contract_pdf_link
                date_added
                engaged_at {
                  date
                  time
                }
                registered_at {
                  date
                  time
                }
                resign_after_school_begins_at {
                  date
                  time
                }
                no_show_at {
                  date
                  time
                }
                resigned_after_engaged_at {
                  date
                  time
                }
                resigned_after_registered_at {
                  date
                  time
                }
                inscription_at {
                  date
                  time
                }
                resigned_at {
                  date
                  time
                }
                candidate_sign_date {
                  date
                  time
                }
                school_contract_pdf_link
                bill_validated_at {
                  date
                  time
                }
                payment_transfer_check_data {
                  s3_document_name
                }
                financement_validated_at {
                  date
                  time
                }
                initial_intake_channel
                latest_previous_program {
                  _id
                  program
                  school_id {
                    short_name
                  }
                  campus {
                    name
                  }
                  level {
                    name
                  }
                  scholar_season_id {
                    _id
                    scholar_season
                  }
                  speciality_id {
                    name
                  }
                }
              }
              mission_card_validated_at {
                date
                time
              }
              resignation_missing_prerequisites_at {
                date
                time
              }
              cvec_number
              ine_number
              is_adult
              is_emancipated_minor
              visa_document_process_id{
                _id
                form_type
                steps{
                  _id
                  step_status
                }
                form_status
              }
            }
          }
        `,variables:{filter:e,user_type_ids:t},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(a=>a.data.GetAllCandidates))}getAllProgramsToGetSpeciality(e){return this.apollo.watchQuery({query:n.ZP`
          query GetAllPrograms($filter: ProgramFilterInput) {
            GetAllPrograms(filter: $filter) {
              _id
              speciality_id {
                _id
                name
                sigli
                intake_channel
                description
                sectors {
                  name
                }
              }
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetAllPrograms))}getAllStudentCard(e,t,a,i,o){return this.apollo.query({query:n.ZP`
          query GetAllStudents(
            $pagination: PaginationInput
            $sorting: StudentSorting
            $filter: FilterStudent
            $user_type_ids: [ID]
            $student_ids: [ID]
          ) {
            GetAllStudents(
              pagination: $pagination
              sorting: $sorting
              filter: $filter
              user_type_ids: $user_type_ids
              student_ids: $student_ids
            ) {
              _id
              civility
              first_name
              last_name
              count_document
              candidate_id {
                _id
                student_id {
                  _id
                }
                is_program_assigned
                program_status
                candidate_admission_status
                jury_decision
                trial_date
                region
                civility
                first_name
                last_name
                telephone
                payment_method
                is_admitted
                email
                is_oscar_updated
                finance
                nationality
                candidate_unique_number
                candidate_admission_status
                financement
                school_mail
                diploma_status
                admission_document_process_status
                is_future_program_assigned
                billing_id {
                  _id
                  deposit_status
                  is_deposit_completed
                  deposit_pay_amount
                  deposit
                  account_number
                }
                campus {
                  _id
                  name
                  address
                  levels {
                    _id
                    name
                  }
                  specialities {
                    _id
                    name
                  }
                }
                photo
                registration_email_due_date {
                  due_date
                  due_time
                }
                reg_n8_sent_date {
                  sent_date
                  sent_time
                }
                announcement_call
                announcement_email {
                  sent_date
                  sent_time
                }
                intake_channel {
                  _id
                  program
                  scholar_season_id {
                    _id
                    scholar_season
                  }
                }
                type_of_formation_id {
                  _id
                  type_of_information
                  type_of_formation
                  sigle
                  admission_form_id {
                    _id
                    form_builder_name
                  }
                }
                registration_profile {
                  _id
                  name
                  is_down_payment
                  discount_on_full_rate
                  type_of_formation {
                    _id
                    type_of_information
                  }
                  additional_cost_ids {
                    additional_cost
                    amount
                  }
                }
                engagement_level
                level {
                  _id
                  name
                  specialities {
                    _id
                    name
                  }
                }
                speciality {
                  _id
                  name
                }
                scholar_season {
                  _id
                  scholar_season
                }
                sector {
                  _id
                  name
                }
                school {
                  _id
                  short_name
                  long_name
                  campuses {
                    _id
                    name
                    levels {
                      _id
                      name
                    }
                  }
                }
                connection
                personal_information
                signature
                method_of_payment
                payment
                admission_member_id {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                  email
                  position
                }
                fixed_phone
                is_whatsapp
                participate_in_open_house_day
                participate_in_job_meeting
                count_document
                user_id {
                  _id
                }
                # This one from 049
                payment_splits {
                  payer_name
                  percentage
                }
                payment_supports {
                  relation
                  family_name
                  name
                  civility
                  tele_phone
                  email
                  parent_address {
                    address
                    additional_address
                    postal_code
                    city
                    region
                    department
                    country
                  }
                }
                program_desired
                trial_date
                date_added
                selected_payment_plan {
                  name
                  times
                  additional_expense
                  total_amount
                  payment_date {
                    date
                    amount
                  }
                  down_payment
                }
                registered_at {
                  date
                  time
                }
                resign_after_school_begins_at {
                  date
                  time
                }
                no_show_at {
                  date
                  time
                }
                hubspot_deal_id
                hubspot_contact_id
                is_hubspot_updated
                is_manual_updated
                continuous_formation_manager_id {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                  email
                  position
                }
                admission_process_id {
                  _id
                  steps {
                    _id
                    index
                    step_title
                    step_type
                    step_status
                    status
                    is_only_visible_based_on_condition
                  }
                }
                latest_previous_program {
                  _id
                  program
                  scholar_season_id {
                    _id
                    scholar_season
                  }
                }
                type_of_readmission
                previous_programs {
                  _id
                }
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,sorting:t,filter:a,user_type_ids:i,student_ids:o||null}}).pipe((0,s.U)(_=>_.data.GetAllStudents))}getAllStudentCardIdentity(e,t,a,i){return this.apollo.query({query:n.ZP`
          query GetAllStudents($pagination: PaginationInput, $sorting: StudentSorting, $filter: FilterStudent, $student_ids: [ID], $is_permission_active: Boolean) {
            GetAllStudents(pagination: $pagination, sorting: $sorting, filter: $filter, student_ids: $student_ids, is_permission_active: $is_permission_active) {
              _id
              civility
              first_name
              last_name
              count_document
              candidate_id {
                _id
                student_id{
                  _id
                }
                is_program_assigned
                program_status
                candidate_admission_status
                jury_decision
                trial_date
                region
                civility
                first_name
                last_name
                telephone
                payment_method
                is_admitted
                email
                is_oscar_updated
                finance
                nationality
                candidate_unique_number
                candidate_admission_status
                financement
                school_mail
                diploma_status
                admission_document_process_status
                is_future_program_assigned
                billing_id {
                  _id
                  deposit_status
                  is_deposit_completed
                  deposit_pay_amount
                  deposit
                  account_number
                }
                campus {
                  _id
                  name
                  address
                  levels {
                    _id
                    name
                  }
                  specialities {
                    _id
                    name
                  }
                }
                photo
                registration_email_due_date {
                  due_date
                  due_time
                }
                reg_n8_sent_date {
                  sent_date
                  sent_time
                }
                announcement_call
                announcement_email {
                  sent_date
                  sent_time
                }
                intake_channel {
                  _id
                  program
                  scholar_season_id {
                    _id
                    scholar_season
                  }
                }
                type_of_formation_id {
                  _id
                  type_of_information
                  type_of_formation
                  sigle
                  admission_form_id {
                    _id
                    form_builder_name
                  }
                }
                registration_profile {
                  _id
                  name
                  is_down_payment
                  discount_on_full_rate
                  type_of_formation {
                    _id
                    type_of_information
                  }
                  additional_cost_ids {
                    additional_cost
                    amount
                  }
                }
                engagement_level
                level {
                  _id
                  name
                  specialities {
                    _id
                    name
                  }
                }
                speciality {
                  _id
                  name
                }
                scholar_season {
                  _id
                  scholar_season
                }
                sector {
                  _id
                  name
                }
                school {
                  _id
                  short_name
                  long_name
                  campuses {
                    _id
                    name
                    levels {
                      _id
                      name
                    }
                  }
                }
                connection
                personal_information
                signature
                method_of_payment
                payment
                admission_member_id {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                  email
                  position
                }
                fixed_phone
                is_whatsapp
                participate_in_open_house_day
                participate_in_job_meeting
                count_document
                user_id {
                  _id
                }
                # This one from 049
                payment_splits {
                  payer_name
                  percentage
                }
                payment_supports {
                  relation
                  family_name
                  name
                  civility
                  tele_phone
                  email
                  parent_address {
                    address
                    additional_address
                    postal_code
                    city
                    region
                    department
                    country
                  }
                }
                program_desired
                trial_date
                date_added
                selected_payment_plan {
                  name
                  times
                  additional_expense
                  total_amount
                  payment_date {
                    date
                    amount
                  }
                  down_payment
                }
                registered_at {
                  date
                  time
                }
                resign_after_school_begins_at {
                  date
                  time
                }
                no_show_at {
                  date
                  time
                }
                hubspot_deal_id
                hubspot_contact_id
                is_hubspot_updated
                is_manual_updated
                continuous_formation_manager_id {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                  email
                  position
                }
                admission_process_id {
                  _id
                  steps {
                    _id
                    index
                    step_title
                    step_type
                    step_status
                    status
                    is_only_visible_based_on_condition
                  }
                }
                latest_previous_program {
                  _id
                  program
                  scholar_season_id {
                    _id
                    scholar_season
                  }
                }
                type_of_readmission
                previous_programs {
                  _id
                }
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,sorting:t,filter:a,student_ids:i||null,is_permission_active:!1}}).pipe((0,s.U)(o=>o.data.GetAllStudents))}getOneCandidatesTabStudent(e){return this.apollo.watchQuery({query:n.ZP`
          query GetOneCandidate($_id: ID!) {
            GetOneCandidate(_id: $_id) {
              _id
              region
              civility
              first_name
              last_name
              telephone
              payment_method
              is_admitted
              registration_certificate
              email
              registration_certificate
              nationality
              candidate_unique_number
              candidate_admission_status
              program_status
              jury_decision
              readmission_status
              reason_no_reinscription
              reinscription_yes_no {
                is_answer_yes
                answer_label
              }
              admission_process_id {
                _id
                steps {
                  step_type
                }
              }
              student_id {
                _id
                program_sequence_ids {
                  _id
                  name
                  program_id {
                    _id
                    program
                  }
                  program_sequence_groups {
                    _id
                    student_classes {
                      name
                      students_id {
                        _id
                      }
                      program_sequence_id {
                        program_modules_id {
                          program_subjects_id {
                            name
                          }
                        }
                      }
                    }
                  }
                  start_date {
                    date
                    time
                  }
                  end_date {
                    date
                    time
                  }
                  type_of_sequence
                }
              }
              billing_id {
                _id
                profil_rate
                account_number
                deposit
                deposit_pay_amount
                terms {
                  _id
                  term_pay_date {
                    date
                    time
                  }
                  is_locked
                  is_term_paid
                  term_pay_amount
                  term_payment {
                    date
                    time
                  }
                  term_payment_deferment {
                    date
                    time
                  }
                  is_partial
                  term_amount
                }
                accumulated_late
              }
              campus {
                _id
                name
                address
                levels {
                  _id
                  name
                }
                specialities {
                  _id
                  name
                }
              }
              photo
              registration_email_due_date {
                due_date
                due_time
              }
              reg_n8_sent_date {
                sent_date
                sent_time
              }
              announcement_call
              announcement_email {
                sent_date
                sent_time
              }
              intake_channel {
                _id
                program
                school_id {
                  short_name
                }
                campus {
                  name
                }
                level {
                  name
                }
                scholar_season_id {
                  _id
                  scholar_season
                }
                speciality_id {
                  name
                }
                course_sequence_id {
                  program_sequences_id {
                    program_sequence_groups {
                      _id
                      student_classes {
                        name
                        students_id {
                          _id
                        }
                        program_sequence_id {
                          program_modules_id {
                            program_subjects_id {
                              name
                            }
                          }
                        }
                      }
                    }
                    name
                    type_of_sequence
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
              }
              type_of_formation_id {
                _id
                type_of_information
                type_of_formation
              }
              registration_profile {
                _id
                name
                discount_on_full_rate
                additional_cost_ids {
                  additional_cost
                  amount
                }
                type_of_formation {
                  _id
                  type_of_information
                }
                is_down_payment
              }
              engagement_level
              level {
                _id
                name
                specialities {
                  _id
                  name
                }
              }
              speciality {
                _id
                name
              }
              scholar_season {
                _id
                scholar_season
              }
              sector {
                _id
                name
              }
              school {
                _id
                short_name
                long_name
                campuses {
                  _id
                  name
                  levels {
                    _id
                    name
                  }
                }
              }
              selected_payment_plan {
                total_amount
                down_payment
              }
              school_mail
              connection
              personal_information
              signature
              method_of_payment
              payment
              admission_member_id {
                _id
                first_name
                last_name
                civility
                profile_picture
                email
                position
              }
              fixed_phone
              is_whatsapp
              participate_in_open_house_day
              participate_in_job_meeting
              count_document
              user_id {
                _id
              }
              payment_splits {
                payer_name
                percentage
              }
              payment_supports {
                relation
                family_name
                name
                civility
                tele_phone
                email
                parent_address {
                  address
                  additional_address
                  postal_code
                  city
                  region
                  department
                  country
                }
              }
              program_desired
              trial_date
              school_contract_pdf_link
              date_added
              engaged_at {
                date
                time
              }
              registered_at {
                date
                time
              }
              resigned_after_engaged_at {
                date
                time
              }
              resign_after_school_begins_at {
                date
                time
              }
              no_show_at {
                date
                time
              }
              resigned_after_registered_at {
                date
                time
              }
              inscription_at {
                date
                time
              }
              resigned_at {
                date
                time
              }
              candidate_sign_date {
                date
                time
              }
              school_contract_pdf_link
              bill_validated_at {
                date
                time
              }
              payment_transfer_check_data {
                s3_document_name
              }
              financement_validated_at {
                date
                time
              }
              initial_intake_channel
              latest_previous_program {
                _id
                program
                school_id {
                  short_name
                }
                campus {
                  name
                }
                level {
                  name
                }
                scholar_season_id {
                  _id
                  scholar_season
                }
                speciality_id {
                  name
                }
              }
              previous_programs {
                _id
                telephone
                payment_method
                is_admitted
                registration_certificate
                candidate_unique_number
                candidate_admission_status
                admission_process_id {
                  _id
                  steps {
                    step_type
                  }
                }
                billing_id {
                  _id
                  account_number
                  deposit
                  deposit_pay_amount
                  terms {
                    _id
                    term_pay_date {
                      date
                      time
                    }
                    is_locked
                    is_term_paid
                    term_pay_amount
                    term_payment {
                      date
                      time
                    }
                    term_payment_deferment {
                      date
                      time
                    }
                    is_partial
                    term_amount
                  }
                  accumulated_late
                }
                campus {
                  _id
                  name
                  address
                  levels {
                    _id
                    name
                  }
                  specialities {
                    _id
                    name
                  }
                }
                registration_email_due_date {
                  due_date
                  due_time
                }
                reg_n8_sent_date {
                  sent_date
                  sent_time
                }
                announcement_call
                announcement_email {
                  sent_date
                  sent_time
                }
                intake_channel {
                  _id
                  program
                  school_id {
                    short_name
                  }
                  campus {
                    name
                  }
                  level {
                    name
                  }
                  scholar_season_id {
                    _id
                    scholar_season
                  }
                  speciality_id {
                    name
                  }
                }
                type_of_formation_id {
                  _id
                  type_of_information
                  type_of_formation
                }
                registration_profile {
                  _id
                  name
                  discount_on_full_rate
                  additional_cost_ids {
                    additional_cost
                    amount
                  }
                  type_of_formation {
                    _id
                    type_of_information
                  }
                  is_down_payment
                }
                engagement_level
                level {
                  _id
                  name
                  specialities {
                    _id
                    name
                  }
                }
                speciality {
                  _id
                  name
                }
                scholar_season {
                  _id
                  scholar_season
                }
                sector {
                  _id
                  name
                }
                school {
                  _id
                  short_name
                  long_name
                  campuses {
                    _id
                    name
                    levels {
                      _id
                      name
                    }
                  }
                }
                selected_payment_plan {
                  total_amount
                  down_payment
                }
                school_mail
                connection
                personal_information
                signature
                method_of_payment
                payment
                admission_member_id {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                  email
                  position
                }
                is_whatsapp
                participate_in_open_house_day
                participate_in_job_meeting
                count_document
                user_id
                payment_splits {
                  payer_name
                  percentage
                }
                program_desired
                trial_date
                school_contract_pdf_link
                date_added
                engaged_at {
                  date
                  time
                }
                registered_at {
                  date
                  time
                }
                resign_after_school_begins_at {
                  date
                  time
                }
                no_show_at {
                  date
                  time
                }
                resigned_after_engaged_at {
                  date
                  time
                }
                resigned_after_registered_at {
                  date
                  time
                }
                inscription_at {
                  date
                  time
                }
                resigned_at {
                  date
                  time
                }
                candidate_sign_date {
                  date
                  time
                }
                school_contract_pdf_link
                bill_validated_at {
                  date
                  time
                }
                payment_transfer_check_data {
                  s3_document_name
                }
                financement_validated_at {
                  date
                  time
                }
                initial_intake_channel
                latest_previous_program {
                  _id
                  program
                  school_id {
                    short_name
                  }
                  campus {
                    name
                  }
                  level {
                    name
                  }
                  scholar_season_id {
                    _id
                    scholar_season
                  }
                  speciality_id {
                    name
                  }
                }
              }
              mission_card_validated_at {
                date
                time
              }
              resignation_missing_prerequisites_at {
                date
                time
              }
              cvec_number
              ine_number
            }
          }
        `,variables:{_id:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(t=>t.data.GetOneCandidate))}}return y.\u0275fac=function(e){return new(e||y)(h.\u0275\u0275inject(C.eN),h.\u0275\u0275inject(v._M),h.\u0275\u0275inject(b.sK))},y.\u0275prov=h.\u0275\u0275defineInjectable({token:y,factory:y.\u0275fac,providedIn:"root"}),y})()}}]);