"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[6834],{94442:(v,h,_)=>{_.d(h,{N:()=>A});var s=_(591),a=_(13125),n=_(24850),u=_(92340),y=_(94650),f=_(80529),$=_(18497),P=_(89383);let A=(()=>{class p{constructor(e,t,i){this.httpClient=e,this.apollo=t,this.translate=i,this.tutorialData=new s.X(null),this.dataEditTutorial=new s.X(null),this.tutorialStep=new s.X(0),this.statusStepOne=new s.X(!1),this.statusStepTwo=new s.X(!1),this.statusStepThree=new s.X(!1),this.statusStepFour=new s.X(!1),this.statusStepFive=new s.X(!1),this.confirmed=new s.X(!1),this.dataStepTwo=new s.X(null),this.dataStepThree=new s.X(null),this.dataStepFour=new s.X(null),this.dataStepFive=new s.X(null),this.legalEntityId=new s.X(null),this.dataCheque=new s.X(null),this.allDataCheque=new s.X(null),this.dataChequeEnitty=new s.X(null),this.dataBilling=new s.X(null),this.reconciliationImport=new s.X(null),this.currentStep=new s.X(0),this.statusStepOneCheque=new s.X(!1),this.statusStepTwoCheque=new s.X(!1),this.statusStepThreeCheque=new s.X(!1),this.statusStepFourCheque=new s.X(!1),this.isAccountingHaveInvalidData=new s.X(!1),this.isDataMerchantBoardingSaved=new s.X(!0),this._childrenFormValidationStatus=!0,this._importRegistrationValidationStatus=!0,this._importofFinanceObjectiveValidationStatus=!0,this._importofFinancialN1ValidationStatus=!0}setDataMerchantBoardingSaved(e){this.isDataMerchantBoardingSaved.next(e)}setTutorialStep(e){this.tutorialStep.next(e)}setLegalEntityId(e){this.legalEntityId.next(e)}setCurrentStep(e){this.currentStep.next(e)}setTutorialView(e){this.tutorialData.next(e)}setTutorialEdit(e){this.dataEditTutorial.next(e)}setReconciliationImport(e){this.reconciliationImport.next(e)}setDataBilling(e){this.dataBilling.next(e)}setDataCheque(e){this.dataCheque.next(e)}setAllDataCheque(e){this.allDataCheque.next(e)}setDataEntityCheque(e){this.dataChequeEnitty.next(e)}setConfirmation(e){this.confirmed.next(e)}setStatusStepOne(e){this.statusStepOne.next(e)}setStatusStepTwo(e){this.statusStepTwo.next(e)}setStatusStepThree(e){this.statusStepThree.next(e)}setStatusStepFour(e){this.statusStepFour.next(e)}setStatusStepFive(e){this.statusStepFive.next(e)}setIsAccountingHaveInvalidData(e){this.isAccountingHaveInvalidData.next(e)}setDataStepTwo(e){this.dataStepTwo.next(e)}setDataStepThree(e){this.dataStepThree.next(e)}setDataStepFour(e){this.dataStepFour.next(e)}setDataStepFive(e){this.dataStepFive.next(e)}setStatusStepTwoCheque(e){this.statusStepTwoCheque.next(e)}setStatusStepThreeCheque(e){this.statusStepThreeCheque.next(e)}setStatusStepFourCheque(e){this.statusStepFourCheque.next(e)}setStatusStepOneCheque(e){this.statusStepOneCheque.next(e)}get childrenFormValidationStatus(){return this._childrenFormValidationStatus}set childrenFormValidationStatus(e){this._childrenFormValidationStatus=e}get importRegistrationValidationStatus(){return this._importRegistrationValidationStatus}set importRegistrationValidationStatus(e){this._importRegistrationValidationStatus=e}get importOfFinanceObjectiveValidationStatus(){return this._importofFinanceObjectiveValidationStatus}set importOfFinanceObjectiveValidationStatus(e){this._importofFinanceObjectiveValidationStatus=e}get importOfFinancialN1ValidationStatus(){return this._importofFinancialN1ValidationStatus}set importOfFinancialN1ValidationStatus(e){this._importofFinancialN1ValidationStatus=e}getAffectedTermsBillingForAddPayment(e,t,i,o){return this.apollo.mutate({mutation:a.ZP`
          mutation GetAffectedTermsBillingForAddPayment(
            $amount: Float
            $billing_id: ID
            $payment_method: EnumPaymentMethod
            $is_from_asking_payment_sepa: Boolean
          ) {
            GetAffectedTermsBilling(
              amount: $amount
              billing_id: $billing_id
              payment_method: $payment_method
              is_from_asking_payment_sepa: $is_from_asking_payment_sepa
            ) {
              _id
              term_id
              term_index
              term_payment {
                date
                time
              }
              term_payment_deferment {
                date
                time
              }
              is_term_pending
              is_locked
              is_term_paid
              term_amount
              term_pay_amount
              term_pay_date {
                date
                time
              }
              is_partial
              term_status
              percentage
              is_regulation
              term_amount_not_authorised
              term_amount_pending
              term_amount_chargeback
              payment_source
              term_source
              payment_type
              amount
              pay_amount
              status
            }
          }
        `,variables:{amount:e,billing_id:t,payment_method:i,is_from_asking_payment_sepa:o},context:{useMultipart:!0}}).pipe((0,n.U)(l=>l.data.GetAffectedTermsBilling))}getAffectedTermsFinancement(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation GetAffectedTermsFinancement($amount: Float, $finance_organization_id: ID) {
            GetAffectedTermsFinancement(amount: $amount, finance_organization_id: $finance_organization_id) {
              _id
              term_id
              term_index
              term_payment {
                date
                time
              }
              term_payment_deferment {
                date
                time
              }
              is_locked
              is_term_paid
              term_amount
              term_pay_amount
              term_pay_date {
                date
                time
              }
              is_partial
              term_status
              percentage
              is_regulation
              payment_source
              term_source
              payment_type
              amount
              pay_amount
              status
            }
          }
        `,variables:{amount:e,finance_organization_id:t},context:{useMultipart:!0}}).pipe((0,n.U)(i=>i.data.GetAffectedTermsFinancement))}getLegalEntityByStudent(e){return this.apollo.query({query:a.ZP`
      query {
        GetLegalEntityByStudent(student_id: "${e}") {
          _id
          name
          banks
        }
      }
      `}).pipe((0,n.U)(t=>t.data.GetLegalEntityByStudent))}getAcountingNumber(e,t){return this.apollo.query({query:a.ZP`
      query {
        GetAcountingNumber(student_id: "${e}", added_number: ${t})
      }
      `}).pipe((0,n.U)(i=>i.data.GetAcountingNumber))}GetAllIntakeChannels(){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllIntakeChannels {
              intake_channel
              intake_channel_detail
              down_payment_id {
                _id
                amount
              }
              full_rate_id {
                _id
                amount_internal
                amount_external
              }
              legal_entities_id {
                _id
                legal_entity_name
              }
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
              volume_hours {
                _id
                volume_hour
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllIntakeChannels))}GetAllIntakeChannelsScholar(e){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllIntakeChannels(${e}) {
              intake_channel
              intake_channel_detail
              down_payment_id {
                _id
                amount
              }
              full_rate_id {
                _id
                amount_internal
                amount_external
              }
              legal_entities_id {
                _id
                legal_entity_name
              }
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
              volume_hours {
                _id
                volume_hour
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllIntakeChannels))}GetAdmissionIntakeData(e,t,i){return this.apollo.watchQuery({query:a.ZP`
            query GetAllIntakeChannels($pagination: PaginationInput, $sort: IntakeChannelSortingInput) {
              GetAllIntakeChannels(pagination: $pagination, sorting: $sort, ${i}) {
              _id
              intake_channel
              school
              campus
              level
              scholar_season
              intake_channel_detail
              down_payment_id {
                _id
                amount
                external
                internal
              }
              full_rate_id {
                _id
                amount_internal
                amount_external
              }
              legal_entities_id {
                _id
                legal_entity_name
              }
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
              volume_hours {
                _id
                volume_hour
              }
              accounting_account_id {
                _id
                account_number
              }
              analytical_code_id {
                _id
                analytical_code
              }
              count_document
              admission_flyer {
                document_name
                s3_file_name
              }
              admission_document {
                document_name
                s3_file_name
              }
              paid_leave_allowance_rate
              induced_hours_coefficient
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllIntakeChannels))}GetAllIntakeChannelsAssignTeacher(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllIntakeChannels($filter: IntakeChannelFilterInput) {
            GetAllIntakeChannels(filter: $filter) {
              legal_entities_id {
                _id
                legal_entity_name
              }
              campus
              school
              level
              sector_id {
                name
              }
              speciality_id {
                _id
                name
              }
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllIntakeChannels))}GetAdmissionIntakeDataCheckbox(e,t,i){return this.apollo.watchQuery({query:a.ZP`
            query GetAllIntakeChannels($pagination: PaginationInput, $sort: IntakeChannelSortingInput) {
              GetAllIntakeChannels(pagination: $pagination, sorting: $sort, ${i}) {
              _id
              intake_channel
              school
              campus
              level
              scholar_season
              intake_channel_detail
              paid_leave_allowance_rate
              induced_hours_coefficient
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllIntakeChannels))}getAllIdIntakeChannelsForCheckbox(e,t,i){return this.apollo.watchQuery({query:a.ZP`
            query GetAllIntakeChannels($pagination: PaginationInput, $sort: IntakeChannelSortingInput) {
              GetAllIntakeChannels(pagination: $pagination, sorting: $sort, ${i}) {
              _id
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllIntakeChannels))}getAllDataIntakeChannelsForConnectLegal(e,t,i){return this.apollo.watchQuery({query:a.ZP`
            query GetAllIntakeChannels($pagination: PaginationInput, $sort: IntakeChannelSortingInput) {
              GetAllIntakeChannels(pagination: $pagination, sorting: $sort, ${i}) {
              _id
              campus
              level
              speciality_id {
                _id
              }
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllIntakeChannels))}getAllIdIntakeChannelsForAddInducedHours(e,t,i){return this.apollo.watchQuery({query:a.ZP`
            query GetAllIntakeChannels($pagination: PaginationInput, $sort: IntakeChannelSortingInput) {
              GetAllIntakeChannels(pagination: $pagination, sorting: $sort, ${i}) {
              _id
              induced_hours_coefficient
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllIntakeChannels))}checkAdmissionIntakeData(e,t){return this.apollo.watchQuery({query:a.ZP`
            query GetAllIntakeChannels($pagination: PaginationInput) {
              GetAllIntakeChannels(pagination: $pagination, ${t}) {
              intake_channel
              is_completed
              count_document
            }
          }
        `,variables:{pagination:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(i=>i.data.GetAllIntakeChannels))}GetAllAccountingData(e){return this.apollo.watchQuery({query:a.ZP`
            query {
              GetAllIntakeChannels(${e}) {
              intake_channel
              intake_channel_detail
              down_payment_id {
                _id
                amount
                external
                internal
              }
              full_rate_id {
                _id
                amount_internal
                amount_external
              }
              legal_entities_id {
                _id
                legal_entity_name
              }
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
              volume_hours {
                _id
                volume_hour
              }
              count_document
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllIntakeChannels))}GetAllIntakeChannelDropdown(e){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllIntakeChannelDropdown
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllIntakeChannelDropdown))}GetAllIntakeChannelNoScholar(e){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllIntakeChannelDropdown(without_scholar_season: true)
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllIntakeChannelDropdown))}getAllProgramsDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllProgramsDropdown(is_without_scholar_season: true)
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllProgramsDropdown))}getAllProgramHaveSector(e){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllPrograms(filter: {is_should_have_sector: true, scholar_season_id: "${e}"}) {
              _id
              program
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllPrograms))}getAllProgramHaveNoSector(e){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllPrograms(filter: {is_should_have_speciality: false, scholar_season_id: "${e}"}) {
              _id
              program
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllPrograms))}getAllProgramForProfile(e,t,i,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllPrograms($school_id: [ID], $campus: [ID], $level: [ID]) {
            GetAllPrograms(filter: {school_id: $school_id, campus: $campus, level: $level, scholar_season_id: "${e}"}) {
              _id
              program
            }
          }
        `,variables:{school_id:t,campus:i,level:o},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(l=>l.data.GetAllPrograms))}getAllProgramWithoutSector(e){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllPrograms(filter: {is_should_have_sector: false, scholar_season_id: "${e}"}) {
              _id
              program
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllPrograms))}getAllProgramByScholar(e){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllPrograms(filter: {scholar_season_id: "${e}"}) {
              _id
              program
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllPrograms))}GetAllCandidateCampus(e,t,i,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllCandidateCampus($pagination: PaginationInput, $sort: CandidateCampusSortingInput) {
            GetAllCandidateCampus(pagination: $pagination, sorting: $sort, ${i}, scholar_season_id: "${o}") {
              _id
              name
              school_id {
                _id
                short_name
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
                name
              }
              count_document
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(l=>l.data.GetAllCandidateCampus))}GetAllInAppTutorial(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllInAppTutorial($pagination: PaginationInput) {
            GetAllInAppTutorial(pagination: $pagination) {
              _id
              module
              sub_modules {
                sub_module
                items {
                  title
                  description
                }
              }
              scenario_checklist_url
              video_presentation
              qa_checklist_url
              count_document
              is_published
              video_url
            }
          }
        `,variables:{pagination:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllInAppTutorial))}GetAllInAppTutorials(){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllInAppTutorial {
              _id
              module
              sub_modules {
                sub_module
                items {
                  title
                  description
                }
              }
              scenario_checklist_url
              video_presentation
              qa_checklist_url
              count_document
              video_url
              is_published
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllInAppTutorial))}GetListTutorialAdded(){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllInAppTutorial {
              _id
              module
              is_published
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllInAppTutorial))}GetListProfileRates(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllProfilRates($filter: ProfilRateFilterInput) {
            GetAllProfilRates(filter: $filter) {
              _id
              name
              is_admission
              is_readmission
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e}}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllProfilRates))}GetListProfileRatesDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllProfilRates {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllProfilRates))}GetReadmissionProfileDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query GetReadmissionProfileDropdown{
            GetReadmissionProfileDropdown {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetReadmissionProfileDropdown))}GetAllUsers(e,t,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllUsers($pagination: PaginationInput, $sort: UserSorting) {
            GetAllUsers(pagination: $pagination, sorting: $sort, ${i}, user_type: "617f64ec5a48fe222851880f") {
              _id
              first_name
              last_name
              civility
              position
              portable_phone
              email
              legal_entity
              work_location
              status
              user_status
              count_document
              entities {
                  type {
                      _id
                      name
                  }
                  entity_name
              }
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllUsers))}GetAllLegalEntitiesForCheckbox(e,t,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllLegalEntitiesForCheckbox($pagination: PaginationInput, $sort: LegalEntitySortingInput) {
            GetAllLegalEntities(pagination: $pagination, sorting: $sort, ${i}) {
             _id
             legal_entity_name
           }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllLegalEntities))}GetAllLegalEntities(e,t,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllLegalEntities($pagination: PaginationInput, $sort: LegalEntitySortingInput) {
            GetAllLegalEntities(pagination: $pagination, sorting: $sort, ${i}) {
             _id
             onboard_step
             legal_entity
             legal_entity_name
             legal_entity_stamp
             psp_reference
             account_code
             account_holder_code
             pci_expired_date {
                  date
                  time
                }
             account_holder_details {
               business_detail {
                 registration_number
                 signatories {
                   signatory_name {
                     first_name
                     gender
                     last_name
                   }
                 }
                 shareholders {
                   first_name
                   gender
                   last_name
                 }
               }
               bank_account_details {
                 iban
                 bank_name
               }
               account_holder_address {
                 country
                 city
                 postal_code
                 street
                 state_or_province
                 house_number_or_name
               }
             }
             immatriculation
             urrsaf_number
             bic
             tva_number
             online_payment_status
             count_document
           }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllLegalEntities))}GetAllSectors(e,t){return this.apollo.watchQuery({query:a.ZP`
          query GetAllSectors($pagination: PaginationInput, $filter: SectorFilterInput) {
            GetAllSectors(pagination: $pagination, filter: $filter) {
              _id
              name
              count_document
              description
              programs {
                _id
                program
              }
              sigli
            }
          }
        `,variables:{pagination:e,filter:t},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(i=>i.data.GetAllSectors))}GetAllSectorsTable(e,t,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllSectors($pagination: PaginationInput, $filter: SectorFilterInput, $sorting: SectorSortingInput) {
            GetAllSectors(pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
              name
              count_document
              description
              programs {
                _id
                program
              }
              school_id {
                _id
                short_name
              }
              campus_id {
                _id
                name
              }
              level_id {
                _id
                name
              }
              sigli
            }
          }
        `,variables:{pagination:e,filter:i,sorting:t||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllSectors))}GetAllSectorsDropdown(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllSectors($filter: SectorFilterInput) {
            GetAllSectors(filter: $filter) {
              _id
              name
              programs {
                _id
                program
              }
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllSectors))}GetAllSpecializations(e,t=null,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllSpecializations(
            $pagination: PaginationInput
            $sortValue: SpecializationSortingInput
            $filter: SpecializationFilterInput
          ) {
            GetAllSpecializations(pagination: $pagination, sorting: $sortValue, filter: $filter) {
              _id
              name
              status
              count_document
              description
              programs {
                _id
                program
              }
              sectors {
                _id
                name
              }
              sigli
            }
          }
        `,variables:{pagination:e,sortValue:t,filter:i},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllSpecializations))}GetAllSpecializationsDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllSpecializations {
              name
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllSpecializations))}GetAllSpecializationsByScholar(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllSpecializationsByScholar{
            GetAllSpecializations(filter: {scholar_season_id: "${e}"}) {
              _id
              name
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllSpecializations))}getSpecialityIntakeChannelDropDown(e,t){return this.apollo.query({query:a.ZP`
          query GetSpecialityIntakeChannelDropDown($candidate_school_id: ID!, $scholar_season_id: ID!) {
            GetSpecialityIntakeChannelDropDown(candidate_school_id: $candidate_school_id, scholar_season_id: $scholar_season_id) {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only",variables:{candidate_school_id:e,scholar_season_id:t}}).pipe((0,n.U)(i=>i.data.GetSpecialityIntakeChannelDropDown))}GetAllSpecializationsByScholarSchool(e,t){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllSpecializations(filter: {scholar_season_id: "${e}", candidate_school_ids: ["${t}"]}) {
              _id
              name
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(i=>i.data.GetAllSpecializations))}GetAllTransactionHistories(e,t,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllTransactionHistories($pagination: PaginationInput, $user_type_ids: [ID]) {
            GetAllTransactionHistories(pagination: $pagination, ${t}, user_type_ids: $user_type_ids) {
              _id
              accounting_document
              transaction_date
              transaction_time
              transaction_type
              description
              transaction
              from
              to
              bank
              debit
              credit
              reference
              term_index
              amount
              candidate_id {
                _id
                first_name
                last_name
                civility
                email
                payment_supports {
                  civility
                  name
                  family_name
                }
                billing_id {
                  deposit
                  intake_channel {
                    _id
                    program
                    scholar_season_id {
                  _id
                  scholar_season
                }
                  }
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
              candidate_id {
                _id
                payment_supports {
                  relation
                  family_name
                  name
                  civility
                  email
                }
              }
              intake_channel {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
              letter
              count_document
              total_debit
              total_credit
            }
          }
        `,variables:{pagination:e,user_type_ids:i},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllTransactionHistories))}GetAllTransactionHistoriesCheckbox(e,t,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllTransactionHistories($pagination: PaginationInput, $user_type_ids: [ID]) {
            GetAllTransactionHistories(pagination: $pagination, ${t}, user_type_ids: $user_type_ids) {
              _id
              debit
              credit
              count_document
            }
          }
        `,variables:{pagination:e,user_type_ids:i},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllTransactionHistories))}GetAllTransactionHistoriesForExport(e,t,i){return this.apollo.query({query:a.ZP`
        query GetAllTransactionHistoriesForExport($pagination: PaginationInput, $user_type_ids: [ID]) {
            GetAllTransactionHistories(pagination: $pagination, ${t}, user_type_ids: $user_type_ids) {
              _id
            }
        }
        `,variables:{pagination:e,user_type_ids:i},fetchPolicy:"network-only"}).pipe((0,n.U)(o=>o.data.GetAllTransactionHistories))}GetAllBanksFromTransactionhistory(){return this.apollo.watchQuery({query:a.ZP`
          query GetAllBanksFromTransactionhistory{
            GetAllBanksFromTransactionhistory
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllBanksFromTransactionhistory))}GetAllCandidateSchool(e,t,i,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllCandidateSchool($pagination: PaginationInput, $sort: CandidateSchoolSortingInput, $user_type_id: ID) {
            GetAllCandidateSchool(pagination: $pagination, sorting: $sort, ${i}, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              school_logo
              tele_phone
              signalement_email
              school_addresses {
                address
                postal_code
                city
                region
                department
                is_main_address
                country
              }
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
              }
              levels {
                _id
                name
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
              count_document
            }
          }
        `,variables:{pagination:e,sort:t||{},user_type_id:o},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(l=>l.data.GetAllCandidateSchool))}GetAllCandidateSchoolWithScholar(e,t,i,o,l){return this.apollo.watchQuery({query:a.ZP`
          query GetAllCandidateSchool($pagination: PaginationInput, $sort: CandidateSchoolSortingInput, $user_type_id: ID) {
            GetAllCandidateSchool(pagination: $pagination, sorting: $sort, ${i}, scholar_season_id: "${o}", user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              school_logo
              tele_phone
              signalement_email
              school_addresses {
                address
                postal_code
                city
                region
                department
                is_main_address
                country
              }
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
              }
              levels {
                _id
                name
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
              count_document
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,variables:{pagination:e,sort:t||{},user_type_id:l},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(r=>r.data.GetAllCandidateSchool))}GetAllCandidateSchoolWithScholarCheckbox(e,t,i,o,l){return this.apollo.watchQuery({query:a.ZP`
          query GetAllCandidateSchool($pagination: PaginationInput, $sort: CandidateSchoolSortingInput, $user_type_id: ID) {
            GetAllCandidateSchool(pagination: $pagination, sorting: $sort, ${i}, scholar_season_id: "${o}", user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              school_logo
              tele_phone
              count_document
            }
          }
        `,variables:{pagination:e,sort:t||{},user_type_id:l},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(r=>r.data.GetAllCandidateSchool))}getSchoolCampusLevelDropdown(e,t,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllCandidateSchool($scholar_season_id: ID, $filter: CandidateSchoolFilterInput, $user_type_id: ID) {
            GetAllCandidateSchool(scholar_season_id: $scholar_season_id, filter: $filter, user_type_id: $user_type_id) {
              _id
              short_name
              count_document
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
        `,variables:{scholar_season_id:e,filter:t||null,user_type_id:i||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllCandidateSchool))}getAllSchoolsDropdown(e,t){return this.apollo.watchQuery({query:a.ZP`
        query GetAllCandidateSchool($user_type_id: ID) {
          GetAllCandidateSchool(scholar_season_id: "${e}", user_type_id: $user_type_id) {
            _id
            short_name
            count_document
          }
        }
      `,fetchPolicy:"network-only",variables:{user_type_id:t}}).valueChanges.pipe((0,n.U)(i=>i.data.GetAllCandidateSchool))}getAllCampusesDropdown(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllCampuses($filter: CampusFilterInput) {
            GetAllCampuses(filter: $filter) {
              _id
              name
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllCampuses))}getAllCampusesDropdownCascadeFilter(e,t){return this.apollo.query({query:a.ZP`
          query GetAllCampuses($filter: CampusFilterInput, $user_type_login: ID) {
            GetAllCampuses(filter: $filter, user_type_login: $user_type_login) {
              _id
              name
            }
          }
        `,variables:{filter:e,user_type_login:t},fetchPolicy:"network-only"}).pipe((0,n.U)(i=>i.data.GetAllCampuses))}getAllCampusesDropdownCascadeFilterTrombs(e,t){return this.apollo.query({query:a.ZP`
          query GetAllCampuses($filter: CampusFilterInput, $user_type_logins: [ID]) {
            GetAllCampuses(filter: $filter, user_type_logins: $user_type_logins) {
              _id
              name
            }
          }
        `,variables:{filter:e,user_type_logins:t},fetchPolicy:"network-only"}).pipe((0,n.U)(i=>i.data.GetAllCampuses))}getAllLevelsDropdown(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllLevels($filter: LevelFilterInput) {
            GetAllLevels(filter: $filter) {
              _id
              name
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllLevels))}getAllLevelsDropdownCascadeFilter(e,t){return this.apollo.query({query:a.ZP`
          query GetAllLevels($filter: LevelFilterInput, $user_type_login: ID) {
            GetAllLevels(filter: $filter, user_type_login: $user_type_login) {
              _id
              name
            }
          }
        `,variables:{filter:e,user_type_login:t},fetchPolicy:"network-only"}).pipe((0,n.U)(i=>i.data.GetAllLevels))}getAllLevelsDropdownCascadeFilterTrombs(e,t){return this.apollo.query({query:a.ZP`
          query GetAllLevels($filter: LevelFilterInput, $user_type_logins: [ID]) {
            GetAllLevels(filter: $filter, user_type_logins: $user_type_logins) {
              _id
              name
            }
          }
        `,variables:{filter:e,user_type_logins:t},fetchPolicy:"network-only"}).pipe((0,n.U)(i=>i.data.GetAllLevels))}GetAllProfilRates(e,t,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllProfilRates($pagination: PaginationInput, $sort: ProfilRateSortingInput) {
            GetAllProfilRates(pagination: $pagination, sorting: $sort, ${i}) {
              _id
              name
              description
              is_down_payment
              discount_on_full_rate
              other_currency
              other_amount
              select_payment_method_available
              is_admission
              is_readmission
              document_builder_id {
                _id
                document_builder_name
                document_type
                is_published
              }
              scholar_season_id {
                _id
              }
              additional_cost_ids {
                _id
                additional_cost
                amount
              }
              payment_modes {
                _id
                name
                description
              }
              programs {
                _id
                program
              }
              count_document
              school_ids {
                _id
              }
              campuses {
                _id
                name
              }
              levels {
                _id
                name
              }
              type_of_formation {
                _id
              }
              dp_additional_cost_amount
              dp_additional_cost_currency
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllProfilRates))}getAllProfilRatesIdForExport(e,t,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllProfilRates($pagination: PaginationInput, $sort: ProfilRateSortingInput) {
            GetAllProfilRates(pagination: $pagination, sorting: $sort, ${i}) {
              _id
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllProfilRates))}GetAllAdditionalCosts(e,t,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllAdditionalCosts($pagination: PaginationInput, $sort: AdditionalCostSortingInput) {
            GetAllAdditionalCosts(pagination: $pagination, sorting: $sort, ${i}) {
              count_document
              additional_cost
              description
              amount
              currency
              _id
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllAdditionalCosts))}GetAllAdditionalCostsDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query GetAllAdditionalCosts {
            GetAllAdditionalCosts {
              _id
              additional_cost
              description
              amount
              currency
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllAdditionalCosts))}getAllPaymentModes(e,t,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllPaymentModes($pagination: PaginationInput, $sort: PaymentModeSortingInput) {
            GetAllPaymentModes(pagination: $pagination, sorting: $sort, ${i}) {
              _id
              name
              description
              additional_cost
              currency
              payment_date {
                date
                amount
                percentage
              }
              select_payment_method_available
              term
              count_document
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllPaymentModes))}getAllPaymentModesForExport(e,t,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllPaymentModes($pagination: PaginationInput, $sort: PaymentModeSortingInput) {
            GetAllPaymentModes(pagination: $pagination, sorting: $sort, ${i}) {
              _id
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllPaymentModes))}GetAllFinanceOrganization(e,t,i,o,l){return this.apollo.watchQuery({query:a.ZP`
          query GetAllFinanceOrganization(
            $filter: FinanceOrganizationFilterInput
            $pagination: PaginationInput
            $search: FinanceOrganizationSearchInput
            $sorting: FinanceOrganizationSortingInput
            $user_type_ids: [ID]
          ) {
            GetAllFinanceOrganization(
              filter: $filter
              pagination: $pagination
              search: $search
              sorting: $sorting
              user_type_ids: $user_type_ids
            ) {
              _id
              candidate_id {
                _id
                last_name
                first_name
                civility
                email
                candidate_admission_status
                registration_profile {
                  is_down_payment
                  discount_on_full_rate
                  additional_cost_ids {
                    _id
                    additional_cost
                    amount
                  }
                }
                selected_payment_plan {
                  additional_expense
                }
                payment_supports {
                  name
                  family_name
                  civility
                  email
                }
              }
              account_number
              organization_id {
                _id
                name
                organization_type
              }
              intake_channel {
                program
              }
              financial_profile
              student_type {
                type_of_information
                type_of_formation
              }
              profil_rate
              is_profil_rate_updated
              payment_method
              financial_supports {
                relation
                family_name
                name
              }
              amount_billed
              amount_paid
              remaining_billed
              amount_late
              accumulated_late
              deposit
              deposit_pay_amount
              deposit_pay_date {
                date
                time
              }
              is_deposit_completed
              overdue
              overdue_not_paid
              is_student_blocked
              terms {
                _id
                is_regulation
                term_payment {
                  date
                  time
                }
                term_payment_deferment {
                  date
                  time
                }
                is_term_paid
                term_amount
                term_pay_amount
                term_status
                term_pay_date {
                  date
                  time
                }
                is_partial
                is_locked
                is_regulation
              }
              count_document
              term_times
              deposit_status
              organization_name
              organization_type
              total_amount
            }
          }
        `,variables:{filter:e,pagination:t,search:i,sorting:o,user_type_ids:l},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(r=>r.data.GetAllFinanceOrganization))}GetAllFinanceOrganizationId(e,t,i,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllFinanceOrganization(
            $filter: FinanceOrganizationFilterInput
            $pagination: PaginationInput
            $search: FinanceOrganizationSearchInput
            $sorting: FinanceOrganizationSortingInput
          ) {
            GetAllFinanceOrganization(filter: $filter, pagination: $pagination, search: $search, sorting: $sorting) {
              _id
            }
          }
        `,variables:{filter:e,pagination:t,search:i,sorting:o},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(l=>l.data.GetAllFinanceOrganization))}GetAllFinanceOrganizationForGenerate(e,t,i,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllFinanceOrganization(
            $filter: FinanceOrganizationFilterInput
            $pagination: PaginationInput
            $search: FinanceOrganizationSearchInput
            $sorting: FinanceOrganizationSortingInput
          ) {
            GetAllFinanceOrganization(filter: $filter, pagination: $pagination, search: $search, sorting: $sorting) {
              _id
              term_times
            }
          }
        `,variables:{filter:e,pagination:t,search:i,sorting:o},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(l=>l.data.GetAllFinanceOrganization))}GetAllFinanceOrganizationForMultipleMail(e,t,i,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllFinanceOrganization(
            $filter: FinanceOrganizationFilterInput
            $pagination: PaginationInput
            $search: FinanceOrganizationSearchInput
            $sorting: FinanceOrganizationSortingInput
          ) {
            GetAllFinanceOrganization(filter: $filter, pagination: $pagination, search: $search, sorting: $sorting) {
              _id
              organization_id {
                _id
                name
              }
            }
          }
        `,variables:{filter:e,pagination:t,search:i,sorting:o},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(l=>l.data.GetAllFinanceOrganization))}GetAllFinanceOrganizationDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query GetAllFinanceOrganization {
            GetAllFinanceOrganization {
              _id
              intake_channel {
                _id
                program
              }
              student_type {
                _id
                type_of_formation
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllFinanceOrganization))}GetOneFinanceOrganization(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllFinanceOrganization($filter: FinanceOrganizationFilterInput) {
            GetAllFinanceOrganization(filter: $filter) {
              _id
              candidate_id {
                _id
                last_name
                first_name
                civility
                email
                candidate_admission_status
                registration_profile {
                  is_down_payment
                  discount_on_full_rate
                  additional_cost_ids {
                    _id
                    additional_cost
                    amount
                  }
                }
                selected_payment_plan {
                  additional_expense
                }
                payment_supports {
                  name
                  family_name
                  civility
                  email
                }
                legal_representative{
                  unique_id
                }
              }
              organization_id {
                _id
                name
                organization_type
              }
              company_branch_id {
                _id
                company_name
              }
              financial_profile
              financial_supports {
                relation
                family_name
                name
              }
              amount_billed
              amount_paid
              remaining_billed
              amount_late
              accumulated_late
              deposit
              deposit_pay_amount
              is_deposit_completed
              overdue
              overdue_not_paid
              terms {
                _id
                term_status
                term_payment {
                  date
                  time
                }
                term_payment_deferment {
                  date
                  time
                }
                is_term_paid
                term_amount
                term_pay_amount
                term_pay_date {
                  date
                  time
                }
                is_partial
                is_locked
                is_regulation
              }
              timeline_template_id {
                _id
              }
              count_document
              term_times
              deposit_status
              total_amount
              student_type {
                type_of_information
                type_of_formation
              }
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllFinanceOrganization))}GetOneFinanceOrganizationForCheckStatus(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllFinanceOrganization($filter: FinanceOrganizationFilterInput) {
            GetAllFinanceOrganization(filter: $filter) {
              _id
              account_number
              terms {
                _id
                term_status
              }
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllFinanceOrganization))}getAllBilling(e,t,i,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllBilling($pagination: PaginationInput, $sort: BillingSortingInput, $user_type_ids: [ID]) {
            GetAllBilling(pagination: $pagination, sorting: $sort, ${i}, user_type_ids: $user_type_ids) {
              _id
              account_number
              is_financial_support
              is_have_special_case
              financial_support_info{
                _id
                relation
                name
                family_name
                civility
                email
              }
              deposit_pay_date {
                date
                time
              }
              is_profil_rate_updated
              student_id {
                _id
                first_name
                last_name
                civility
                email
              }
              candidate_id {
                _id
                last_name
                first_name
                civility
                email
                payment
                school_mail
                candidate_admission_status
                modality_step_special_form_status
                readmission_status
                registration_profile {
                  is_down_payment
                  discount_on_full_rate
                  additional_cost_ids {
                    _id
                    additional_cost
                    amount
                  }
                }
                selected_payment_plan {
                    additional_expense
                }
                payment_supports {
                  relation
                  family_name
                  name
                  civility
                  tele_phone
                  email
                  _id
                }
              }
              financial_profile
              student_type {
                _id
                type_of_information
              }
              amount_billed
              profil_rate
              payment_method
              financial_supports {
                relation
                name
                civility
                email
                family_name
              }
              amount_paid
              remaining_billed
              amount_late
              accumulated_late
              count_document
              intake_channel {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
              deposit
              is_deposit_completed
              deposit_pay_amount
              overdue
              is_student_blocked
              overdue_not_paid
              terms {
                _id
                reference_term_id
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
                term_status
                term_amount_not_authorised
                term_amount_pending
                term_amount_chargeback
                is_regulation
              }
              total_amount
              deposit_status
              legal_entity {
                legal_entity_name
              }
              sent_pay_n2 {
                date
                time
              }
              dp_histories{
                deposit_pay_amount
                deposit_status
                is_deposit_completed
                deposit
                date_inserted{
                  date
                  time
                }
              }
            }
          }
        `,variables:{pagination:e,sort:t||{},user_type_ids:o},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(l=>l.data.GetAllBilling))}getAllProgramBillingDropdown(e,t){return this.apollo.watchQuery({query:a.ZP`
          query GetAllProgramDropdown($filter: DropdownProgramFilterInput, $user_type_ids: [ID]) {
            GetAllProgramDropdown(filter: $filter, user_type_ids: $user_type_ids) {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,variables:{user_type_ids:t,filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(i=>i.data.GetAllProgramDropdown))}getAllBillingCheckbox(e,t,i,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllBilling($pagination: PaginationInput, $sort: BillingSortingInput, $user_type_ids: [ID]) {
            GetAllBilling(pagination: $pagination, sorting: $sort, ${i}, user_type_ids: $user_type_ids) {
              _id
              account_number
              is_profil_rate_updated
              is_financial_support
              financial_support_info{
                _id
                relation
                name
                family_name
                civility
              }
              student_id {
                _id
                first_name
                last_name
                civility
                email
              }
              candidate_id {
                _id
                last_name
                first_name
                civility
                email
                candidate_admission_status
              }
            }
          }
        `,variables:{pagination:e,sort:t||{},user_type_ids:o},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(l=>l.data.GetAllBilling))}getAllBillingSendEmailCheckbox(e,t,i,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllBilling($pagination: PaginationInput, $sort: BillingSortingInput, $user_type_ids: [ID]) {
            GetAllBilling(pagination: $pagination, sorting: $sort, ${i}, user_type_ids: $user_type_ids) {
              _id
              is_financial_support
              financial_support_info{
                _id
                relation
                name
                family_name
                civility
                email
              }
              candidate_id {
                _id
                last_name
                first_name
                civility
                email
                candidate_admission_status
              }
            }
          }
        `,variables:{pagination:e,sort:t||{},user_type_ids:o},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(l=>l.data.GetAllBilling))}getAllBillingIdCheckbox(e,t,i,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllBilling($pagination: PaginationInput, $sort: BillingSortingInput, $user_type_ids: [ID]) {
            GetAllBilling(pagination: $pagination, sorting: $sort, ${i}, user_type_ids: $user_type_ids) {
              _id
              amount_billed
              terms {
                is_term_paid
                is_partial
                term_amount
                term_pay_amount
                term_amount_chargeback
              }
            }
          }
        `,variables:{pagination:e,sort:t||{},user_type_ids:o},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(l=>l.data.GetAllBilling))}getAllBillingForCheque(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllBillingForCheque{
            GetAllBilling(${e}) {
              _id
              account_number
              student_id {
                _id
                first_name
                last_name
                civility
                email
              }
              candidate_id {
                _id
                first_name
                last_name
                civility
                email
              }
              financial_profile
              deposit
              is_deposit_completed
              financial_supports {
                relation
                name
                civility
                email
                family_name
              }
              intake_channel {
                _id
                program
              }
              terms {
                _id
                term_pay_date {
                  date
                  time
                }
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
                term_amount
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllBilling))}getAllBillingForReconciliation(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllBillingForReconciliation{
            GetAllBilling(${e}) {
              _id
              account_number
              student_id {
                _id
                first_name
                last_name
                civility
                email
              }
              financial_profile
              deposit
              is_deposit_completed
              financial_supports {
                relation
                name
                civility
                email
                family_name
              }
              intake_channel {
                _id
                program
              }
              candidate_id {
                _id
                payment_supports {
                  name
                  family_name
                  civility
                }
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllBilling))}getAllBillingForFilter(){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllBilling {
              _id
              student_type {
                _id
                type_of_information
                type_of_formation
              }
              payment_method
              intake_channel {
                _id
                program
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllBilling))}GetFinancialSupportsDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query GetFinancialSupportsDropdown{
            GetFinancialSupportsDropdown
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetFinancialSupportsDropdown))}getAllScholarSeasonsNameAndID(e){return this.apollo.query({query:a.ZP`
          query GetAllScholarSeasonsNameAndID($filter: ScholarSeasonFilterInput) {
            GetAllScholarSeasons(filter: $filter) {
              _id
              scholar_season
              is_published
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetAllScholarSeasons))}GetAllScholarSeasons(e,t,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllScholarSeasons($pagination: PaginationInput) {
            GetAllScholarSeasons(pagination: $pagination) {
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
        `,variables:{pagination:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllScholarSeasons))}getAllScholarCheckbox(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllScholarSeasons($page: PaginationInput) {
            GetAllScholarSeasons(pagination: $page) {
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
        `,variables:{page:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllScholarSeasons))}GetAllScholarSeasonsPublished(e,t,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllScholarSeasons($pagination: PaginationInput, $sort: ScholarSeasonSortingInput) {
            GetAllScholarSeasons(pagination: $pagination, sorting: $sort, filter: { is_published: true }) {
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
        `,variables:{pagination:t,sort:e||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllScholarSeasons))}GetAllScholarSeasonsDropdown(e,t,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllScholarSeasons($pagination: PaginationInput) {
            GetAllScholarSeasons(pagination: $pagination) {
              _id
              scholar_season
              is_published
            }
          }
        `,variables:{pagination:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllScholarSeasons))}getOneBilling(e){return this.apollo.watchQuery({query:a.ZP`
        query {
          GetOneBilling(_id: "${e}") {
            _id
            student_id {
              _id
              first_name
              last_name
              civility
            }
             candidate_id {
              _id
              last_name
              first_name
              civility
            }
            financial_profile
            student_type
            profil_rate
            payment_method
            amount_billed
            financial_supports
            amount_paid
            remaining_billed
            amount_late
            accumulated_late
            deposit
            count_document
            is_deposit_completed
            intake_channel
            overdue
            overdue_not_paid
            terms {
              term_pay_date {
                date
                time
              }
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
              term_amount
            }
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetOneBilling))}getOneBillingDPRegulation(e){return this.apollo.watchQuery({query:a.ZP`
        query GetOneBillingDPRegulation{
          GetOneBilling(_id: "${e}") {
            terms {
              term_amount
              term_source
              term_status
              term_pay_amount
              is_regulation
              term_payment {
                time
                date
              }
            }
            candidate_id {
              payment
            }
            deposit_pay_date {
              date
              time
            }
            deposit
            deposit_pay_amount
            deposit_status
            is_deposit_completed
            deposit_pay_date {
              date
              time
            }
            dp_histories {
              deposit_pay_amount
              deposit_status
              is_deposit_completed
              deposit
              date_inserted {
                date
                time
              }
            }
          }
        }
  `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetOneBilling))}GetAllUsersByLegal(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllUsersByLegalEntity($legal_entity: String) {
            GetAllUsers(legal_entity: $legal_entity) {
              _id
              first_name
              last_name
              civility
              email
              full_name
              entities {
                entity_name
                type {
                  name
                }
              }
            }
          }
        `,variables:{legal_entity:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllUsers))}GetOneCandidate(e){return this.apollo.watchQuery({query:a.ZP`
        query GetOneCandidate{
          GetOneCandidate(_id: "${e}") {
              _id
              first_name
              last_name
              civility
              type_of_formation_id {
                _id
                type_of_formation
              }
              payment
              registration_profile {
                  is_down_payment
                  discount_on_full_rate
                  additional_cost_ids {
                    _id
                    additional_cost
                    amount
                  }
              }
              selected_payment_plan {
                    additional_expense
                }
              candidate_admission_status
              billing_id {
                _id
                amount_paid
                amount_late
                amount_billed
                remaining_billed
                accumulated_late
                overdue
                overdue_not_paid
                deposit
                deposit_pay_amount
                financial_profile
                is_deposit_completed
                terms {
                  _id
                  term_payment {
                    date
                    time
                  }
                  term_payment_deferment {
                    date
                    time
                  }
                  is_partial
                  is_term_paid
                  term_amount
                  term_pay_amount
                  term_pay_date {
                    date
                    time
                  }
                  term_status
                }
                candidate_id {
                  _id
                  civility
                  email
                  first_name
                  last_name
                }
                student_id {
                  _id
                  civility
                  email
                  first_name
                  last_name
                }
                financial_supports {
                  name
                  family_name
                  relation
                  civility
                  email
                }
                total_amount
              }
              type_of_formation_id {
                type_of_formation
              }
            }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetOneCandidate))}getAllDownPayment(e,t){return this.apollo.watchQuery({query:a.ZP`
        query GetAllDownPayment{
          GetAllDownPayment(school_id: "${e}", scholar_season_id: "${t}") {
            _id
            school_id {
              _id
              short_name
            }
            campus {
              _id
              name
            }
            scholar_season_id {
              _id
              scholar_season
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
            amount
            internal
            external
            is_internal_editable
            is_external_editable
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(i=>i.data.GetAllDownPayment))}getAllFullRate(e,t){return this.apollo.watchQuery({query:a.ZP`
        query GetAllFullRate{
          GetAllFullRate(school_id: "${e}", scholar_season_id: "${t}") {
            _id
            school_id {
              _id
              short_name
            }
            campus {
              _id
              name
            }
            scholar_season_id {
              _id
              scholar_season
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
            amount_internal
            amount_external
            is_internal_editable
            is_external_editable
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(i=>i.data.GetAllFullRate))}GetLegalEntityByStudent(e){return this.apollo.watchQuery({query:a.ZP`
        query GetLegalEntityByStudent{
          GetLegalEntityByStudent(student_id: "${e}") {
            _id
            legal_entity_name
            # accounting_account
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetLegalEntityByStudent))}UpdateManyDownPayment(e){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateManyDownPayment($down_payment_inputs: [DownPaymentInput]) {
            UpdateManyDownPayment(down_payment_inputs: $down_payment_inputs) {
              _id
              campus {
                _id
                name
              }
            }
          }
        `,variables:{down_payment_inputs:e},context:{useMultipart:!0}}).pipe((0,n.U)(t=>t.data.UpdateManyDownPayment))}UpdateManyFullRate(e){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateManyFullRate($full_rate_inputs: [FullRateInput], $lang: String) {
            UpdateManyFullRate(full_rate_inputs: $full_rate_inputs, lang: $lang) {
              message
              programs
              isError
              full_rates {
                _id
              }
            }
          }
        `,variables:{full_rate_inputs:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},context:{useMultipart:!0}}).pipe((0,n.U)(t=>t.data.UpdateManyFullRate))}ImportDownPayment(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation ImportDownPayment($import_down_payment_input: ImportDownPaymentInput, $file: Upload!, $lang: String) {
            ImportDownPayment(import_down_payment_input: $import_down_payment_input, file: $file, lang: $lang) {
              _id
              campus {
                _id
              }
            }
          }
        `,variables:{file:t,import_down_payment_input:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},context:{useMultipart:!0}}).pipe((0,n.U)(i=>i.data.ImportDownPayment))}ImportFullRate(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation ImportFullRate($import_full_rate_input: ImportFullRateInput, $file: Upload!, $lang: String) {
            ImportFullRate(import_full_rate_input: $import_full_rate_input, file: $file, lang: $lang) {
              _id
              campus {
                _id
              }
            }
          }
        `,variables:{file:t,import_full_rate_input:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},context:{useMultipart:!0}}).pipe((0,n.U)(i=>i.data.ImportFullRate))}ImportGeneralDashboardFinance(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation ImportGeneralDashboardFinance(
            $import_general_finance_dashboard_input: ImportGeneralDashboardFinanceInput
            $file: Upload!
            $lang: String
          ) {
            ImportGeneralDashboardFinance(
              import_general_finance_dashboard_input: $import_general_finance_dashboard_input
              file: $file
              lang: $lang
            ) {
              _id
            }
          }
        `,variables:{file:t,import_general_finance_dashboard_input:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},context:{useMultipart:!0}}).pipe((0,n.U)(i=>i.data.ImportGeneralDashboardFinance))}ImportGeneralDashboardFinanceN1(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation ImportGeneralDashboardFinanceN1(
            $import_general_finance_dashboard_input: ImportGeneralDashboardFinanceInput
            $file: Upload!
            $lang: String
          ) {
            ImportGeneralDashboardFinanceN1(
              import_general_finance_dashboard_input: $import_general_finance_dashboard_input
              file: $file
              lang: $lang
            ) {
              _id
            }
          }
        `,variables:{file:t,import_general_finance_dashboard_input:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},context:{useMultipart:!0}}).pipe((0,n.U)(i=>i.data.ImportGeneralDashboardFinanceN1))}CreatePaymentMode(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreatePaymentMode($payment_mode_input: PaymentModeInput) {
            CreatePaymentMode(payment_mode_input: $payment_mode_input) {
              name
              description
            }
          }
        `,variables:{payment_mode_input:e}}).pipe((0,n.U)(t=>t.data.CreatePaymentMode))}UpdatePaymentMode(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdatePaymentMode($payment_mode_input: PaymentModeInput, $_id: ID!) {
            UpdatePaymentMode(payment_mode_input: $payment_mode_input, _id: $_id) {
              name
              description
            }
          }
        `,variables:{_id:t,payment_mode_input:e}}).pipe((0,n.U)(i=>i.data.UpdatePaymentMode))}UpdateTransactionHistory(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateTransactionHistory($transaction_history_input: TransactionHistoryInput, $_id: ID) {
            UpdateTransactionHistory(transaction_history_input: $transaction_history_input, _id: $_id) {
              _id
            }
          }
        `,variables:{_id:t,transaction_history_input:e}}).pipe((0,n.U)(i=>i.data.UpdateTransactionHistory))}ChangeLetterage(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation ChangeLetterage($letterages: [ReconciliationAndLetterageTransactionInput], $transaction_history_id: ID) {
            ChangeLetterage(letterages: $letterages, transaction_history_id: $transaction_history_id)
          }
        `,variables:{transaction_history_id:t,letterages:e}}).pipe((0,n.U)(i=>i.data.ChangeLetterage))}DeletePaymentMode(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeletePaymentMode($_id: ID!) {
            DeletePaymentMode(_id: $_id) {
              name
              description
            }
          }
        `,variables:{_id:e}}).pipe((0,n.U)(t=>t.data.DeletePaymentMode))}DeleteAdditionalCost(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteAdditionalCost($_id: ID!) {
            DeleteAdditionalCost(_id: $_id) {
              description
            }
          }
        `,variables:{_id:e}}).pipe((0,n.U)(t=>t.data.DeleteAdditionalCost))}CreateTimelineTemplate(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateTimelineTemplate($timeline_template_input: TimelineTemplateInput) {
            CreateTimelineTemplate(timeline_template_input: $timeline_template_input) {
              template_name
              description
              terms
              percentage_by_term {
                date
                percentage
              }
              status
            }
          }
        `,variables:{timeline_template_input:e}}).pipe((0,n.U)(t=>t.data.CreateTimelineTemplate))}UpdateTimelineTemplate(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateTimelineTemplate($_id: ID!, $timeline_template_input: TimelineTemplateInput) {
            UpdateTimelineTemplate(_id: $_id, timeline_template_input: $timeline_template_input) {
              _id
              template_name
              description
              terms
              percentage_by_term {
                date
                percentage
              }
              status
              count_document
            }
          }
        `,variables:{_id:e,timeline_template_input:t}}).pipe((0,n.U)(i=>i.data.UpdateTimelineTemplate))}CreateProfilRate(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateProfilRate($profil_rate_input: ProfilRateInput) {
            CreateProfilRate(profil_rate_input: $profil_rate_input) {
              name
              description
            }
          }
        `,variables:{profil_rate_input:e}}).pipe((0,n.U)(t=>t.data.CreateProfilRate))}UpdateProfilRate(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateProfilRate($profil_rate_input: ProfilRateInput, $_id: ID) {
            UpdateProfilRate(profil_rate_input: $profil_rate_input, _id: $_id) {
              name
              description
            }
          }
        `,variables:{_id:t,profil_rate_input:e}}).pipe((0,n.U)(i=>i.data.UpdateProfilRate))}CreateAdditionalCost(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateAdditionalCost($additional_cost_input: AdditionalCostInput) {
            CreateAdditionalCost(additional_cost_input: $additional_cost_input) {
              description
            }
          }
        `,variables:{additional_cost_input:e}}).pipe((0,n.U)(t=>t.data.CreateAdditionalCost))}UpdateAdditionalCost(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateAdditionalCost($additional_cost_input: AdditionalCostInput, $_id: ID!) {
            UpdateAdditionalCost(additional_cost_input: $additional_cost_input, _id: $_id) {
              description
            }
          }
        `,variables:{_id:t,additional_cost_input:e}}).pipe((0,n.U)(i=>i.data.UpdateAdditionalCost))}DeleteProfilRate(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteProfilRate($_id: ID) {
            DeleteProfilRate(_id: $_id) {
              description
            }
          }
        `,variables:{_id:e}}).pipe((0,n.U)(t=>t.data.DeleteProfilRate))}CreateLegalEntity(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateLegalEntity($legal_entity_input: LegalEntityInput) {
            CreateLegalEntity(legal_entity_input: $legal_entity_input) {
              _id
              error {
                error_code
                error_description
                field
                field_name
              }
            }
          }
        `,variables:{legal_entity_input:e}}).pipe((0,n.U)(t=>t.data.CreateLegalEntity))}UpdateLegalEntity(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateLegalEntity($legal_entity_input: LegalEntityInput, $_id: ID) {
            UpdateLegalEntity(legal_entity_input: $legal_entity_input, _id: $_id) {
              _id
              error {
                error_code
                error_description
                field
                field_name
              }
            }
          }
        `,variables:{_id:t,legal_entity_input:e}}).pipe((0,n.U)(i=>i.data.UpdateLegalEntity))}UploadStampLegalEntity(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UploadStampLegalEntity($legal_entity_stamp: String!, $_id: ID!) {
            UploadStampLegalEntity(legal_entity_stamp: $legal_entity_stamp, _id: $_id) {
              _id
              legal_entity_stamp
            }
          }
        `,variables:{_id:t,legal_entity_stamp:e}}).pipe((0,n.U)(i=>i.data.UploadStampLegalEntity))}DeleteLegalEntity(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteLegalEntity($_id: ID) {
            DeleteLegalEntity(_id: $_id) {
              legal_entity_name
            }
          }
        `,variables:{_id:e}}).pipe((0,n.U)(t=>t.data.DeleteLegalEntity))}GetPCIQuestionairUrl(e){return this.apollo.query({query:a.ZP`
          query GetPCIQuestionairUrl($input: PciQuestionairInput) {
            GetPCIQuestionairUrl(input: $input) {
              result_code
              psp_reference
              redirect_url
            }
          }
        `,fetchPolicy:"network-only",variables:{input:e}}).pipe((0,n.U)(t=>t.data.GetPCIQuestionairUrl))}CreateAccountingAccount(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateAccountingAccount($input: AccountingAccountInput) {
            CreateAccountingAccount(input: $input) {
              account_number
            }
          }
        `,variables:{input:e}}).pipe((0,n.U)(t=>t.data.CreateAccountingAccount))}CreateAnalyticalCode(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateAnalyticalCode($input: AnalyticalCodeInput) {
            CreateAnalyticalCode(input: $input) {
              analytical_code
            }
          }
        `,variables:{input:e}}).pipe((0,n.U)(t=>t.data.CreateAnalyticalCode))}CreateScholarSeason(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateScholarSeason($scholar_season_input: ScholarSeasonInput) {
            CreateScholarSeason(scholar_season_input: $scholar_season_input) {
              scholar_season
            }
          }
        `,variables:{scholar_season_input:e}}).pipe((0,n.U)(t=>t.data.CreateScholarSeason))}UpdateScholarSeason(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateScholarSeason($scholar_season_input: ScholarSeasonInput, $_id: ID!) {
            UpdateScholarSeason(scholar_season_input: $scholar_season_input, _id: $_id) {
              scholar_season
            }
          }
        `,variables:{_id:t,scholar_season_input:e}}).pipe((0,n.U)(i=>i.data.UpdateScholarSeason))}CreateSector(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateSector($sector_input: SectorInput) {
            CreateSector(sector_input: $sector_input) {
              _id
              name
            }
          }
        `,variables:{sector_input:e}}).pipe((0,n.U)(t=>t.data.CreateSector))}UpdateSector(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateSector($sector_input: SectorInput, $_id: ID!) {
            UpdateSector(sector_input: $sector_input, _id: $_id) {
              _id
            }
          }
        `,variables:{_id:t,sector_input:e}}).pipe((0,n.U)(i=>i.data.UpdateSector))}CreateSpecialization(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateSpecialization($specialization_input: SpecializationInput) {
            CreateSpecialization(specialization_input: $specialization_input) {
              name
            }
          }
        `,variables:{specialization_input:e}}).pipe((0,n.U)(t=>t.data.CreateSpecialization))}UpdateSpecialization(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateSpecialization($specialization_input: SpecializationInput, $_id: ID!) {
            UpdateSpecialization(specialization_input: $specialization_input, _id: $_id) {
              name
            }
          }
        `,variables:{_id:t,specialization_input:e}}).pipe((0,n.U)(i=>i.data.UpdateSpecialization))}UpdateBilling(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateBilling($billing_input: BillingInput, $_id: ID) {
            UpdateBilling(billing_input: $billing_input, _id: $_id) {
              _id
            }
          }
        `,variables:{_id:t,billing_input:e}}).pipe((0,n.U)(i=>i.data.UpdateBilling))}UpdateBillingFromFinanceTable(e,t,i){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateBilling($billing_input: BillingInput, $_id: ID, $sendNotif: Boolean, $lang: String) {
            UpdateBilling(billing_input: $billing_input, _id: $_id, send_notif: $sendNotif, lang: $lang) {
              _id
            }
          }
        `,variables:{_id:t,billing_input:e,sendNotif:i,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,n.U)(o=>o.data.UpdateBilling))}updateBillingDialog(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateBilling($billing_input: BillingInput, $_id: ID, $lang: String) {
            UpdateBilling(billing_input: $billing_input, _id: $_id, lang: $lang) {
              _id
            }
          }
        `,variables:{_id:t,billing_input:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,n.U)(i=>i.data.UpdateBilling))}UpdateFinanceOrganization(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateFinanceOrganization($finance_organization_input: FinanceOrganizationInput, $_id: ID) {
            UpdateFinanceOrganization(finance_organization_input: $finance_organization_input, _id: $_id) {
              _id
            }
          }
        `,variables:{_id:t,finance_organization_input:e}}).pipe((0,n.U)(i=>i.data.UpdateFinanceOrganization))}DeleteScholarSeason(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteScholarSeason($_id: ID!) {
            DeleteScholarSeason(_id: $_id) {
              scholar_season
            }
          }
        `,variables:{_id:e}}).pipe((0,n.U)(t=>t.data.DeleteScholarSeason))}DeleteSector(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteSector($_id: ID!) {
            DeleteSector(_id: $_id) {
              name
            }
          }
        `,variables:{_id:e}}).pipe((0,n.U)(t=>t.data.DeleteSector))}DeleteSpecialization(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteSpecialization($_id: ID!) {
            DeleteSpecialization(_id: $_id) {
              name
            }
          }
        `,variables:{_id:e}}).pipe((0,n.U)(t=>t.data.DeleteSpecialization))}CreateCandidateSchool(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateCandidateSchool($candidate_school_input: CandidateSchoolInput) {
            CreateCandidateSchool(candidate_school_input: $candidate_school_input) {
              short_name
            }
          }
        `,variables:{candidate_school_input:e}}).pipe((0,n.U)(t=>t.data.CreateCandidateSchool))}UpdateCandidateSchool(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateCandidateSchool($candidate_school_input: CandidateSchoolInput, $_id: ID) {
            UpdateCandidateSchool(candidate_school_input: $candidate_school_input, _id: $_id) {
              short_name
            }
          }
        `,variables:{_id:t,candidate_school_input:e}}).pipe((0,n.U)(i=>i.data.UpdateCandidateSchool))}UpdateCandidateSchoolWithScholar(e,t,i){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateCandidateSchool($candidate_school_input: CandidateSchoolInput, $_id: ID, $scholar_season_id: ID) {
            UpdateCandidateSchool(candidate_school_input: $candidate_school_input, _id: $_id, scholar_season_id: $scholar_season_id) {
              short_name
            }
          }
        `,variables:{_id:t,candidate_school_input:e,scholar_season_id:i}}).pipe((0,n.U)(o=>o.data.UpdateCandidateSchool))}AddPayment(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation AddPayment($payment_input: PaymentInput, $_id: ID) {
            AddPayment(payment_input: $payment_input, _id: $_id) {
              _id
            }
          }
        `,variables:{_id:t,payment_input:e}}).pipe((0,n.U)(i=>i.data.AddPayment))}AddPaymentAfterCalculation(e,t,i,o){return this.apollo.mutate({mutation:a.ZP`
          mutation AddPayment(
            $payment_input: PaymentInput
            $_id: ID
            $affected_terms: [AffectedTermBillingInput]
            $billing_input: BillingInput
          ) {
            AddPayment(payment_input: $payment_input, _id: $_id, affected_terms: $affected_terms, billing_input: $billing_input) {
              _id
            }
          }
        `,variables:{_id:t,payment_input:e,affected_terms:i,billing_input:o}}).pipe((0,n.U)(l=>l.data.AddPayment))}AddPaymentFinanceOrganization(e,t,i,o){return this.apollo.mutate({mutation:a.ZP`
          mutation AddPaymentFinanceOrganization(
            $payment_input: PaymentInputFinanceOrganization
            $_id: ID
            $terms_affected: [TermAffectedInput]
            $finance_organization_input: FinanceOrganizationInput
          ) {
            AddPaymentFinanceOrganization(
              payment_input: $payment_input
              _id: $_id
              terms_affected: $terms_affected
              finance_organization_input: $finance_organization_input
            ) {
              _id
            }
          }
        `,variables:{_id:t,payment_input:e,terms_affected:i,finance_organization_input:o}}).pipe((0,n.U)(l=>l.data.AddPaymentFinanceOrganization))}DecaissementPayment(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation DecaissementPayment($payment_input: PaymentInput, $_id: ID) {
            DecaissementPayment(payment_input: $payment_input, _id: $_id) {
              _id
            }
          }
        `,variables:{_id:t,payment_input:e}}).pipe((0,n.U)(i=>i.data.DecaissementPayment))}RefundPaymentFinanceOrganization(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation RefundPaymentFinanceOrganization($payment_input: PaymentInputFinanceOrganization, $_id: ID) {
            RefundPaymentFinanceOrganization(payment_input: $payment_input, _id: $_id) {
              _id
            }
          }
        `,variables:{_id:t,payment_input:e}}).pipe((0,n.U)(i=>i.data.RefundPaymentFinanceOrganization))}AvoirPayment(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation AvoirPayment($payment_input: PaymentInput, $_id: ID) {
            AvoirPayment(payment_input: $payment_input, _id: $_id) {
              _id
            }
          }
        `,variables:{_id:t,payment_input:e}}).pipe((0,n.U)(i=>i.data.AvoirPayment))}AvoirPaymentFinanceOrganization(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation AvoirPaymentFinanceOrganization($payment_input: PaymentInputFinanceOrganization, $_id: ID) {
            AvoirPaymentFinanceOrganization(payment_input: $payment_input, _id: $_id) {
              _id
            }
          }
        `,variables:{_id:t,payment_input:e}}).pipe((0,n.U)(i=>i.data.AvoirPaymentFinanceOrganization))}CreateManualAvoir(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateManualAvoir($payment_line_input: PaymentLineInput!, $billing_id: ID!) {
            CreateManualAvoir(payment_line_input: $payment_line_input, billing_id: $billing_id) {
              _id
            }
          }
        `,variables:{billing_id:t,payment_line_input:e}}).pipe((0,n.U)(i=>i.data.CreateManualAvoir))}CreateManualAvoirFinanceOrganization(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateManualAvoirFinanceOrganization(
            $payment_line_input: PaymentInputFinanceOrganization
            $finance_organization_id: ID
          ) {
            CreateManualAvoirFinanceOrganization(
              payment_line_input: $payment_line_input
              finance_organization_id: $finance_organization_id
            ) {
              _id
            }
          }
        `,variables:{finance_organization_id:t,payment_line_input:e}}).pipe((0,n.U)(i=>i.data.CreateManualAvoirFinanceOrganization))}CreateCheque(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateCheque($cheque_input: ChequeInput) {
            CreateCheque(cheque_input: $cheque_input) {
              _id
            }
          }
        `,variables:{cheque_input:e}}).pipe((0,n.U)(t=>t.data.CreateCheque))}getAllLegalEntities(){return this.apollo.query({query:a.ZP`
          query GetAllLegalEntities{
            GetAllLegalEntities {
              _id
              legal_entity_name
              account_code
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(e=>e.data.GetAllLegalEntities))}getAllLegalEntitiesDropdownByActiveBilling(){return this.apollo.query({query:a.ZP`
          query GetAllLegalEntitiesDropdownByActiveBilling{
            GetLegalEntityDropdownByActiveBilling {
              _id
              legal_entity_name
              account_code
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(e=>e.data.GetLegalEntityDropdownByActiveBilling))}getAllLegalEntityByScholar(e){return this.apollo.query({query:a.ZP`
          query GetAllLegalEntityByScholar{
            GetAllLegalEntities {
              _id
              legal_entity_name
              account_code
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetAllLegalEntities))}getAllLegalEntityPublishByScholar(e){return this.apollo.query({query:a.ZP`
          query GetAllLegalEntityPublishByScholar{
            GetAllLegalEntities(filter: { online_payment_status: publish }) {
              _id
              legal_entity_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetAllLegalEntities))}DeleteCandidateSchool(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteCandidateSchool($_id: ID) {
            DeleteCandidateSchool(_id: $_id, scholar_season_id: "${t}") {
              short_name
            }
          }
        `,variables:{_id:e}}).pipe((0,n.U)(i=>i.data.DeleteCandidateSchool))}GetTermProfilRates(){return this.apollo.watchQuery({query:a.ZP`
          query GetTermProfilRates{
            GetTermProfilRates
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetTermProfilRates))}getAllPaymentModesDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query GetAllPaymentModes{
            GetAllPaymentModes {
              _id
              name
              description
              additional_cost
              currency
              payment_date {
                date
                amount
                percentage
              }
              count_document
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllPaymentModes))}getAllPaymentModesByScholar(e){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllPaymentModes(filter: {scholar_season_id: "${e}"}) {
              _id
              name
              description
              additional_cost
              currency
              payment_date {
                date
                amount
                percentage
              }
              count_document
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllPaymentModes))}GetAllSchool(){return this.apollo.watchQuery({query:a.ZP`
          query GetAllCandidateSchool{
            GetAllCandidateSchool {
              _id
              short_name
              long_name
              campuses {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllCandidateSchool))}GetAllSchoolFilter(e,t,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllCandidateSchool($user_type_id: ID) {
            GetAllCandidateSchool(${e}, scholar_season_id: "${t}", user_type_id: $user_type_id) {
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
                scholar_season_id {
                  _id
                }
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
        `,fetchPolicy:"network-only",variables:{user_type_id:i}}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllCandidateSchool))}GetOneSchoolFilter(e){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetOneCandidateSchool(_id: "${e}") {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetOneCandidateSchool))}getOneLegalEntity(e){return this.apollo.watchQuery({query:a.ZP`
          query getOneLegalEntity{
            GetOneLegalEntity(_id: "${e}") {
                _id
                onboard_step
                legal_entity_name
                psp_reference
                account_code
                account_holder_code
                pci_expired_date {
                  date
                  time
                }
                documents {
                  is_success_upload_adyen
                  error
                  psp_reference
                  s3_file_name
                  owner
                  owner_code
                  document_name
                  document_type
                  is_latest
                }
                account_holder_details {
                  phone_number {
                    phone_country_code
                    phone_number
                    phone_type
                  }
                  account_holder_address {
                    country
                    city
                    postal_code
                    street
                    department
                    state_or_province
                    region_name
                    house_number_or_name
                  }
                  business_detail {
                    registration_number
                    legal_business_name
                    signatories {
                      nationality
                      department
                      signatory_address {
                        country
                        city
                        postal_code
                        street
                        state_or_province
                        region_name
                        house_number_or_name
                        email
                        full_phone_number
                      }
                      signatory_name {
                        first_name
                        gender
                        last_name
                      }
                      signatory_job_title
                      signatory_personal_data {
                        date_of_birth
                      }
                      signatory_code
                    }
                    shareholders {
                      first_name
                      email
                      gender
                      last_name
                      country
                      city
                      postal_code
                      street
                      house_number_or_name
                      shareholder_code
                      job_title
                      full_phone_number
                      shareholder_type
                      department
                      region
                      region_name
                      shareholder_personal_data {
                        date_of_birth
                        nationality
                        document_data {
                          expiration_date
                          issuer_country
                          number
                          type
                        }
                      }
                    }
                  }
                  bank_account_details {
                    bank_account_uuid
                    owner_gender
                    owner_name
                    bank_name
                    country_code
                    currency_code
                    iban
                    owner_country_code
                    bank_address
                    postal_code
                    city
                    department
                    region
                    region_name
                  }
                  email
                  merchant_categoy_code
                  web_address
                  phone_number {
                    phone_country_code
                    phone_number
                    phone_type
                  }
                  store_details {
                    full_phone_number
                    mechant_account
                    merchant_category_code
                    store_name
                    store_reference
                    web_address
                    shopper_interaction
                  }
                }
                account_holder_status {
                  status
                  processing_state {
                    disabled
                    processed_from {
                      currency
                      value
                    }
                    processed_to {
                      currency
                      value
                    }
                    tier_number
                  }
                  payout_state {
                    allow_payout
                    payout_limit {
                      currency
                      value
                    }
                    disabled
                    tier_number
                  }
                }
                error {
                  error_code
                  error_description
                  field
                  field_name
                }
                legal_entity
                verification {
                  account_holder {
                    checks {
                      type
                      status
                      requiredFields
                    }
                  }
                  share_holders {
                    checks {
                      type
                      status
                      requiredFields
                    }
                    shareholderCode
                  }
                }
                rib
                immatriculation
                urrsaf_number
                city
                tva_number
                online_payment_status
                urrsaf_city
                bic
                is_need_upload_live
              }
            }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetOneLegalEntity))}checkStatusLegalEntity(e){return this.apollo.watchQuery({query:a.ZP`
          query CheckStatusLegalEntity{
            GetOneLegalEntity(_id: "${e}") {
                _id
                onboard_step
                legal_entity_name
                psp_reference
                account_code
                account_holder_code
                online_payment_status
                account_holder_details {
                  phone_number {
                    phone_country_code
                    phone_number
                    phone_type
                  }
                  business_detail {
                    registration_number
                    legal_business_name
                    signatories {
                      signatory_name {
                        first_name
                      }
                    }
                    shareholders {
                      first_name
                    }
                  }
                  bank_account_details {
                    owner_name
                  }
                }
                error {
                  error_code
                  error_description
                  field
                  field_name
                }
                legal_entity
              }
            }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetOneLegalEntity))}getSchoolAddressBySiretNumber(e){return this.apollo.watchQuery({query:a.ZP`
          query GetSchoolAddressBySiretNumber{
            GetSchoolAddressBySiretNumber(siret: "${e}") {
              company_name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetSchoolAddressBySiretNumber))}getOneSpecialization(e){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetOneSpecialization(
              _id: "${e}") {
              _id
              name
              programs {
                _id
                program
              }
              description
              sectors {
                _id
                name
              }
              sigli
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetOneSpecialization))}getOneSector(e){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetOneSector(_id: "${e}") {
                _id
                name
                programs {
                  _id
                  program
                }
                sigli
                description
                scholar_season_id {
                  _id
                }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetOneSector))}getAllSectorsForExisting(e,t){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllSectors(filter: {scholar_season_id: "${t}", name: "${e}"}) {
                _id
                name
                programs {
                  _id
                  program
                }
                sigli
                description
                scholar_season_id {
                  _id
                }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(i=>i.data.GetAllSectors))}getAllSpecialityForExisting(e,t){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllSpecializations(filter: {scholar_season_id: "${t}", name: "${e}"}) {
                _id
                name
                programs {
                  _id
                  program
                }
                sectors {
                  _id
                  name
                }
                sigli
                description
                scholar_season_id {
                  _id
                }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(i=>i.data.GetAllSpecializations))}getOneScholarSeason(e){return this.apollo.watchQuery({query:a.ZP`
          query GetOneScholarSeason{
            GetOneScholarSeason(_id: "${e}") {
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
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetOneScholarSeason))}getAllSectorsDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query GetAllSectors {
            GetAllSectors {
              _id
              name
              description
              sigli
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllSectors))}getAllSpecializationsDropdownDialog(){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllSpecializations {
              name
              description
              sigli
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllSpecializations))}getAllLegalEntitiesDropdown(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllLegalEntities($filter: LegalEntityFilterInput) {
            GetAllLegalEntities(filter: $filter) {
              _id
              onboard_step
              legal_entity_name
              psp_reference
              account_code
              account_holder_code
              account_holder_details {
                phone_number {
                  phone_country_code
                  phone_number
                  phone_type
                }
                account_holder_address {
                  country
                  city
                  postal_code
                  street
                  department
                  state_or_province
                  house_number_or_name
                }
                business_detail {
                  registration_number
                  legal_business_name
                  signatories {
                    signatory_address {
                      country
                      city
                      postal_code
                      street
                      state_or_province
                      house_number_or_name
                      email
                      full_phone_number
                    }
                    signatory_name {
                      first_name
                      gender
                      last_name
                    }
                    signatory_job_title
                    signatory_personal_data {
                      date_of_birth
                    }
                    signatory_code
                  }
                  shareholders {
                    first_name
                    gender
                    last_name
                    country
                    city
                    postal_code
                    street
                    house_number_or_name
                    shareholder_code
                    shareholder_type
                    shareholder_personal_data {
                      date_of_birth
                      nationality
                      document_data {
                        expiration_date
                        issuer_country
                        number
                        type
                      }
                    }
                  }
                }
                bank_account_details {
                  bank_account_uuid
                  owner_name
                  country_code
                  currency_code
                  iban
                  owner_country_code
                }
                email
                merchant_categoy_code
                web_address
                phone_number {
                  phone_country_code
                  phone_number
                  phone_type
                }
                store_details {
                  full_phone_number
                  mechant_account
                  merchant_category_code
                  store_name
                  store_reference
                  web_address
                  shopper_interaction
                }
              }
              account_holder_status {
                status
                processing_state {
                  disabled
                  processed_from {
                    currency
                    value
                  }
                  processed_to {
                    currency
                    value
                  }
                  tier_number
                }
                payout_state {
                  allow_payout
                  payout_limit {
                    currency
                    value
                  }
                  disabled
                  tier_number
                }
              }
              error {
                error_code
                error_description
                field
                field_name
              }
              legal_entity
              verification {
                account_holder {
                  checks {
                    type
                    status
                    requiredFields
                  }
                }
                share_holders {
                  checks {
                    type
                    status
                    requiredFields
                  }
                  shareholderCode
                }
              }
              rib
              immatriculation
              urrsaf_number
              city
              tva_number
              online_payment_status
              urrsaf_city
              scholar_season_id {
                _id
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e}}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllLegalEntities))}GetAllAnalyticalCodes(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllAnalyticalCodes{
            GetAllAnalyticalCodes (filter: {scholar_season_id: "${e}"}) {
              _id
              analytical_code
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllAnalyticalCodes))}GetAllAccountingAccounts(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllAccountingAccounts{
            GetAllAccountingAccounts (filter: {scholar_season_id: "${e}"}) {
              _id
              account_number
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllAccountingAccounts))}updateProgramAdmissionFlyer(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateProgramAdmissionFlyer($_id: ID, $admission_flyer: ProgramAdmissionFlyerInput) {
            UpdateProgramAdmissionFlyer(_id: $_id, admission_flyer: $admission_flyer) {
              _id
            }
          }
        `,variables:{_id:e,admission_flyer:t}}).pipe((0,n.U)(i=>i.data.UpdateProgramAdmissionFlyer))}GenerateBillingFinanceOrganization(e,t,i,o,l){return this.apollo.mutate({mutation:a.ZP`
          mutation GenerateBillingFinanceOrganization(
            $select_all: Boolean
            $filter: FinanceOrganizationFilterInput
            $search: FinanceOrganizationSearchInput
            $finance_organization_ids: [ID]
            $user_type_ids: [ID]
          ) {
            GenerateBillingFinanceOrganization(
              select_all: $select_all
              filter: $filter
              search: $search
              finance_organization_ids: $finance_organization_ids
              user_type_ids: $user_type_ids
            ) {
              _id
            }
          }
        `,variables:{select_all:e,filter:t,search:i,finance_organization_ids:o,user_type_ids:l||null}}).pipe((0,n.U)(r=>r.data.GenerateBillingFinanceOrganization))}updateProgram(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateProgram($_id: ID!, $program_input: ProgramInput) {
            UpdateProgram(_id: $_id, program_input: $program_input) {
              _id
            }
          }
        `,variables:{_id:e,program_input:t}}).pipe((0,n.U)(i=>i.data.UpdateProgram))}UpdateLegalEntityNotPublish(e,t,i){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateLegalEntity($legal_entity_input: LegalEntityInput, $_id: ID, $is_publish: Boolean) {
            UpdateLegalEntity(legal_entity_input: $legal_entity_input, _id: $_id, is_publish: $is_publish) {
              _id
              error {
                error_code
                error_description
                field
                field_name
              }
            }
          }
        `,variables:{_id:t,legal_entity_input:e,is_publish:i}}).pipe((0,n.U)(o=>o.data.UpdateLegalEntity))}UpdateCandidateAnnouncementCall(e){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateCandidateAnnouncementCall($candidate_ids: [ID]) {
            UpdateCandidateAnnouncementCall(candidate_ids: $candidate_ids)
          }
        `,variables:{candidate_ids:e}}).pipe((0,n.U)(t=>t.data.UpdateCandidateAnnouncementCall))}GetLegalEntityByCandidate(e){return this.apollo.watchQuery({query:a.ZP`
          query GetLegalEntityByCandidate($candidate_id: ID!) {
            GetLegalEntityByCandidate(candidate_id: $candidate_id) {
              _id
              legal_entity_name
            }
          }
        `,fetchPolicy:"network-only",variables:{candidate_id:e}}).valueChanges.pipe((0,n.U)(t=>t.data.GetLegalEntityByCandidate))}ImportCandidateData(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation ImportCandidateData($file_delimiter: String, $file: Upload!, $lang: String) {
            ImportCandidateData(file_delimiter: $file_delimiter, file: $file, lang: $lang) {
              is_error
              total_imported_candidates
            }
          }
        `,variables:{file:t,file_delimiter:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},context:{useMultipart:!0}}).pipe((0,n.U)(i=>i.data.ImportCandidateData))}GetAllSectorsDropdownWithoutFilter(){return this.apollo.watchQuery({query:a.ZP`
          query GetAllSectors {
            GetAllSectors {
              _id
              name
              programs {
                speciality_id {
                  _id
                  name
                }
              }
              scholar_season_id {
                _id
              }
              school_id {
                _id
              }
              campus_id {
                _id
              }
              level_id {
                _id
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllSectors))}getAllProgram(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllPrograms($filter: ProgramFilterInput) {
            GetAllPrograms(filter: $filter) {
              _id
              program
            }
          }
        `,variables:{filter:e||null}}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllPrograms))}GetListProfileRatesForSameData(){return this.apollo.watchQuery({query:a.ZP`
          query GetListProfileRatesForSameData{
            GetAllProfilRates {
              _id
              programs {
                _id
                program
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllProfilRates))}downloadDownPaymentTemplateCSV(e,t,i){const o=localStorage.getItem("currentLang"),l=u.N.apiUrl.replace("graphql",""),r=document.createElement("a");r.href=`${l}downloadDownPaymentTemplateCSV/${t}/${i}/${e}/${o}`,r.target="_blank",r.download="Student Import CSV",document.body.appendChild(r),r.click(),document.body.removeChild(r)}downloadTemplateOscarCSV(e){const t=localStorage.getItem("currentLang"),i=u.N.apiUrl.replace("graphql",""),o=document.createElement("a");o.href=`${i}downloadImportCandidateTemplate/${e}/${t}`,o.target="_blank",o.download="Template Oscar CSV",document.body.appendChild(o),o.click(),document.body.removeChild(o)}downloadFullRateTemplateCSV(e,t,i){const o=localStorage.getItem("currentLang"),l=u.N.apiUrl.replace("graphql",""),r=document.createElement("a");r.href=`${l}downloadFullRateTemplateCSV/${t}/${i}/${e}/${o}`,r.target="_blank",r.download="Student Import CSV",document.body.appendChild(r),r.click(),document.body.removeChild(r)}downloadImportReconciliationCSV(e,t){const i=localStorage.getItem("currentLang"),o=u.N.apiUrl.replace("graphql",""),l=document.createElement("a");l.href=`${o}downloadImportReconciliationCSV/${t}/${e}/${i}`,l.target="_blank",l.download="Student Import CSV",document.body.appendChild(l),l.click(),document.body.removeChild(l)}downloadGeneralFinanceTemplateCSV(e,t,i,o,l,r,m){const c=localStorage.getItem("currentLang"),g=u.N.apiUrl.replace("graphql",""),d=document.createElement("a");d.href=`${g}downloadGeneralFinanceTemplateCSV/${e}/${t}/${i}/${c}/${o}/${l}/${r}/${m}`,d.target="_blank",d.download="Student Import CSV",document.body.appendChild(d),d.click(),document.body.removeChild(d)}downloadGeneralFinanceN1TemplateCSV(e,t,i,o,l,r,m){const c=localStorage.getItem("currentLang"),g=u.N.apiUrl.replace("graphql",""),d=document.createElement("a");d.href=`${g}downloadGeneralFinanceN1TemplateCSV/${e}/${t}/${i}/${c}/${o}/${l}/${r}/${m}`,d.target="_blank",d.download="Student Import CSV",document.body.appendChild(d),d.click(),document.body.removeChild(d)}getAlumni(){return this.httpClient.get("assets/data/alumni.json")}getAlumniMembers(){return this.httpClient.get("assets/data/alumni-members.json")}getAlumniCards(){return this.httpClient.get("assets/data/alumni-cards.json")}getDialCodeNumber(){return this.httpClient.get("assets/data/dial-code.json")}getAllTimelineTemplate(e,t,i){return this.apollo.watchQuery({query:a.ZP`
          query GetAllTimelineTemplate($filter: TimelineTemplateFilter, $sorting: TimelineTemplateSorting, $pagination: PaginationInput) {
            GetAllTimelineTemplate(filter: $filter, sorting: $sorting, pagination: $pagination) {
              _id
              template_name
              description
              terms
              percentage_by_term {
                date
                percentage
              }
              status
              count_document
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e,sorting:t,pagination:i}}).valueChanges.pipe((0,n.U)(o=>o.data.GetAllTimelineTemplate))}getAllTimelineName(e={template_name:""}){return this.apollo.watchQuery({query:a.ZP`
          query GetAllTimelineTemplate($filter: TimelineTemplateFilter) {
            GetAllTimelineTemplate(filter: $filter) {
              _id
              template_name
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e}}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllTimelineTemplate))}getOneTimelineTemplate(e){return this.apollo.query({query:a.ZP`
          query GetOneTimelineTemplate($id: ID) {
            GetOneTimelineTemplate(_id: $id) {
              _id
              template_name
              description
              terms
              percentage_by_term {
                date
                percentage
              }
              status
              count_document
            }
          }
        `,fetchPolicy:"network-only",variables:{id:e}}).pipe((0,n.U)(t=>t.data.GetOneTimelineTemplate))}GetAllFinanceTypeOfFormationDropdown(){return this.apollo.query({query:a.ZP`
          query GetAllFinanceTypeOfFormationDropdown {
            GetAllFinanceTypeOfFormationDropdown {
              _id
              type_of_information
              type_of_formation
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(e=>e.data.GetAllFinanceTypeOfFormationDropdown))}GetAllFinanceIntakeChannelDropdown(){return this.apollo.query({query:a.ZP`
          query GetAllFinanceIntakeChannelDropdown {
            GetAllFinanceIntakeChannelDropdown {
              _id
              program
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(e=>e.data.GetAllFinanceIntakeChannelDropdown))}GetAllTimelineTemplateNameDropdown(){return this.apollo.query({query:a.ZP`
          query GetAllTimelineTemplateNameDropdown {
            GetAllTimelineTemplateNameDropdown
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(e=>e.data.GetAllTimelineTemplateNameDropdown))}deleteTimelineTemplate(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteTimelineTemplate($_id: ID!) {
            DeleteTimelineTemplate(_id: $_id) {
              template_name
            }
          }
        `,variables:{_id:e}}).pipe((0,n.U)(t=>t.data.DeleteTimelineTemplate))}assignTimelineTemplateData(e,t,i,o,l,r,m){return this.apollo.mutate({mutation:a.ZP`
          mutation AssignTimelineTemplateData(
            $term_times: Int
            $terms: [TermInputForFinancialOrganization]
            $select_all: Boolean
            $filter: FinanceOrganizationFilterInput
            $search: FinanceOrganizationSearchInput
            $finance_organization_ids: [ID]
            $user_type_ids: [ID]
          ) {
            AssignTimelineTemplateData(
              term_times: $term_times
              terms: $terms
              select_all: $select_all
              filter: $filter
              search: $search
              finance_organization_ids: $finance_organization_ids
              user_type_ids: $user_type_ids
            ) {
              _id
            }
          }
        `,variables:{term_times:e,terms:t,select_all:i,filter:o,search:l,finance_organization_ids:r,user_type_ids:m||null}}).pipe((0,n.U)(c=>c.data.AssignTimelineTemplateData))}getAllBillingDeducationDialog(e){return this.apollo.query({query:a.ZP`
          query GetAllBilling($filter: BillingFilterInput) {
            GetAllBilling(filter: $filter) {
              _id
              candidate_id {
                _id
                civility
                first_name
                last_name
                cost
              }
              terms {
                term_pay_amount
                term_amount_pending
                term_amount
                term_status
              }
              student_type {
                type_of_formation
              }
              deposit
              is_financial_support
              total_amount
              financial_support_info {
                _id
                civility
                family_name
                name
                cost
              }
              student_id {
                _id
                first_name
                last_name
                civility
              }
              financial_supports {
                _id
                civility
                name
                family_name
                cost
              }
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetAllBilling))}updateAdmissionFinancementDialog(e,t,i){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateAdmissionFinancement($_id: ID!, $admission_financement_input: AdmissionFinancementInput, $lang: String) {
            UpdateAdmissionFinancement(_id: $_id, admission_financement_input: $admission_financement_input, lang: $lang) {
              _id
            }
          }
        `,variables:{_id:e,admission_financement_input:t,lang:i}}).pipe((0,n.U)(o=>o.data.UpdateAdmissionFinancement))}CreateAdmissionFinancement(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateAdmissionFinancement($admission_financement_input: AdmissionFinancementInput) {
            CreateAdmissionFinancement(admission_financement_input: $admission_financement_input) {
              _id
            }
          }
        `,variables:{admission_financement_input:e}}).pipe((0,n.U)(t=>t.data.CreateAdmissionFinancement))}getAllContacts(e,t,i,o,l){return this.apollo.query({query:a.ZP`
          query GetAllContacts(
            $organization_ids: [ID]
            $filter: ContactFilterInput
            $sorting: ContactSortingInput
            $pagination: PaginationInput
            $searching: ContactSearchInput
          ) {
            GetAllContacts(
              organization_ids: $organization_ids
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
            }
          }
        `,fetchPolicy:"network-only",variables:{organization_ids:e,filter:t,sorting:i,pagination:o,searching:l}}).pipe((0,n.U)(r=>r.data.GetAllContacts))}getAllOperationLinesNonExportTable(e,t,i,o){return this.apollo.query({query:a.ZP`
          query GetAllMasterTableTransactionNonExported(
            $pagination: PaginationInput
            $user_type_ids: [ID]
            $sorting: MasterTransactionSortingInput
            $filter: MasterTransactionFilterInput
            $lang: String
          ) {
            GetAllMasterTableTransaction(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sorting, filter: $filter, lang: $lang) {
              _id
              candidate_id {
                _id
                candidate_unique_number
                first_name
                last_name
                civility
              }
              program_id {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
              payment_date
              payment_time
              transaction_id {
                _id
                legal_entity {
                  _id
                  legal_entity_name
                }
              }
              legal_entity_id {
                _id
                legal_entity_name
              }
              term_id
              term_index
              billing_id {
                _id
                terms {
                  _id
                  term_status
                  term_pay_date {
                    date
                    time
                  }
                }
                is_financial_support
                financial_support_info {
                  _id
                  civility
                  email
                  family_name
                  name
                  relation
                }
              }
              operation_name
              flux
              nature
              debit
              credit
              accounting_document
              balance_date
              balance_time
              finance_organization_id {
                _id
                company_branch_id {
                  _id
                  company_name
                }
                organization_id {
                  _id
                  name
                }
              }
              date_action {
                date
                time
              }
              count_document
              transaction_type
              is_manual_action
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,user_type_ids:t,sorting:i,filter:o,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,n.U)(l=>l.data.GetAllMasterTableTransaction))}getAllOperationLines(e,t,i,o){return this.apollo.query({query:a.ZP`
          query GetAllOperationLines(
            $pagination: PaginationInput
            $user_type_ids: [ID]
            $sorting: OperationLineSortingInput
            $filter: OperationLineFilterInput
            $lang: String
          ) {
            GetAllOperationLines(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sorting, filter: $filter, lang: $lang) {
              _id
              candidate_id {
                _id
                candidate_unique_number
                first_name
                last_name
                civility
              }
              initial_program {
                _id
                scholar_season_id {
                  _id
                  scholar_season
                }
                program
              }
              transaction_date
              transaction_time
              transaction_id {
                _id
                legal_entity {
                  _id
                  legal_entity_name
                }
              }
              legal_entity_id {
                _id
                legal_entity_name
              }
              term_id
              term_index
              billing_id {
                _id
                terms {
                  _id
                  term_status
                  term_pay_date {
                    date
                    time
                  }
                }
                is_financial_support
                financial_support_info {
                  _id
                  civility
                  email
                  family_name
                  name
                  relation
                }
              }
              from
              to
              operation_name
              flux
              nature
              debit
              credit
              account_document
              balance_date {
                date
                time
              }
              finance_organization_id {
                _id
                company_branch_id {
                  _id
                  company_name
                }
                organization_id {
                  _id
                  name
                }
              }
              count_document
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,user_type_ids:t,sorting:i,filter:o,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,n.U)(l=>l.data.GetAllOperationLines))}GetAllDataForExportSage(e,t,i,o){return this.apollo.query({query:a.ZP`
          query GetAllDataForExportSage(
            $pagination: PaginationInput
            $user_type_ids: [ID]
            $sorting: OperationLineSortingInput
            $filter: OperationLineFilterInput
          ) {
            GetAllOperationLines(pagination: $pagination, user_type_ids: $user_type_ids, sorting: $sorting, filter: $filter) {
              _id
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,user_type_ids:t,sorting:i,filter:o}}).pipe((0,n.U)(l=>l.data.GetAllOperationLines))}GetAllDataForExportLinesToExport(e,t,i,o){return this.apollo.query({query:a.ZP`
          query GetAllDataForExportLinesToExport(
            $pagination: PaginationInput
            $user_type_ids: [ID]
            $sorting: OperationLineSortingInput
            $filter: OperationLineFilterInput
          ) {
            GetAllOperationLines(pagination: $pagination, user_type_ids: $user_type_ids, sorting: $sorting, filter: $filter) {
              _id
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,user_type_ids:t,sorting:i,filter:o}}).pipe((0,n.U)(l=>l.data.GetAllOperationLines))}getAllLegalEntitiesOfOperationLine(e){return this.apollo.query({query:a.ZP`
          query getAllLegalEntitiesOfOperationLine($export_status: EnumExportStatus) {
            GetAllLegalEntitiesOfOperationLine(export_status: $export_status) {
              _id
              legal_entity_name
            }
          }
        `,fetchPolicy:"network-only",variables:{export_status:e}}).pipe((0,n.U)(t=>t.data.GetAllLegalEntitiesOfOperationLine))}getAllLegalEntitiesOfUnbalancedBalance(){return this.apollo.query({query:a.ZP`
          query getAllLegalEntitiesOfUnbalancedBalance {
            GetAllLegalEntitiesOfUnbalancedBalance {
              _id
              legal_entity_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(e=>e.data.GetAllLegalEntitiesOfUnbalancedBalance))}getAllProgramOfOperationLineUnbalance(){return this.apollo.query({query:a.ZP`
          query getAllProgramOfOperationLine {
            GetAllProgramOfOperationLine {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(e=>e.data.GetAllProgramOfOperationLine))}getAllProgramOfOperationLine(e){return this.apollo.query({query:a.ZP`
          query getAllProgramOfOperationLine($export_status: EnumExportStatus) {
            GetAllProgramOfOperationLine(export_status: $export_status) {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{export_status:e}}).pipe((0,n.U)(t=>t.data.GetAllProgramOfOperationLine))}getAllProgramOfOperationLines(){return this.apollo.query({query:a.ZP`
          query {
            GetAllProgramOfOperationLine {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(e=>e.data.GetAllProgramOfOperationLine))}getAllOperationNameOfOperationLine(e){return this.apollo.query({query:a.ZP`
          query getAllOperationNameOfOperationLine($export_status: EnumExportStatus) {
            GetAllOperationNameOfOperationLine(export_status: $export_status)
          }
        `,fetchPolicy:"network-only",variables:{export_status:e}}).pipe((0,n.U)(t=>t.data.GetAllOperationNameOfOperationLine))}getAllUnbalancedBalances(e,t,i,o,l){return this.apollo.query({query:a.ZP`
          query getAllUnbalancedBalances(
            $user_type_ids: [ID]
            $pagination: PaginationInput
            $filter: StudentUnbalanceBalanceFilterInput
            $sorting: StudentUnbalanceBalanceSortingInput
            $lang: String
          ) {
            GetAllUnbalancedBalances(user_type_ids: $user_type_ids, pagination: $pagination, filter: $filter, sorting: $sorting, lang: $lang) {
              _id
              candidate_id {
                _id
                candidate_admission_status
                candidate_unique_number #student number column
                last_name #student name column
                first_name #student name column
                civility #student name column
                intake_channel {
                  _id
                  scholar_season_id {
                    _id
                    scholar_season #program column
                  }
                  program #program column
                }
              }
              legal_entity_id {
                _id
                legal_entity_name #legal entity column
              }
              credit #credit column
              debit #debit column
              balance #balance column
              reason #reason column
              status_table #FLAG
              history_reason {
                reason
                date
              }
              count_document
            }
          }
        `,fetchPolicy:"network-only",variables:{user_type_ids:e,pagination:t,filter:i,sorting:o,lang:l}}).pipe((0,n.U)(r=>r.data.GetAllUnbalancedBalances))}getAllDataExportUnbalancedBalances(e,t,i,o){return this.apollo.query({query:a.ZP`
          query getAllDataExportUnbalancedBalances(
            $user_type_ids: [ID]
            $pagination: PaginationInput
            $filter: StudentUnbalanceBalanceFilterInput
            $sorting: StudentUnbalanceBalanceSortingInput
          ) {
            GetAllUnbalancedBalances(user_type_ids: $user_type_ids, pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
            }
          }
        `,fetchPolicy:"network-only",variables:{user_type_ids:e,pagination:t,filter:i,sorting:o}}).pipe((0,n.U)(l=>l.data.GetAllUnbalancedBalances))}createManualBilling(e){return this.apollo.mutate({mutation:a.ZP`
          mutation createManualBilling(
            $billing_id: ID
            $amount: Float
            $payer: String
            $operation_name: String
            $date: DateTimeInput
            $reference: String
            $note: String
          ) {
            CreateManualBilling(
              billing_id: $billing_id
              amount: $amount
              payer: $payer
              operation_name: $operation_name
              date: $date
              reference: $reference
              note: $note
            ) {
              _id
            }
          }
        `,variables:{billing_id:e?.billing_id,amount:e?.amount,payer:e?.payer,operation_name:e?.operation_name,date:{date:e?.date,time:"15:59"},reference:e?.reference,note:e?.note}}).pipe((0,n.U)(t=>t.data.CreateManualBilling))}createManualBillingFinanceOrganization(e){return console.log("BILL INPUT: ",e),this.apollo.mutate({mutation:a.ZP`
          mutation CreateManualBillingFinanceOrganization(
            $finance_organization_id: ID
            $amount: Float
            $payer: String
            $operation_name: String
            $date: DateTimeInput
            $reference: String
            $note: String
          ) {
            CreateManualBillingFinanceOrganization(
              finance_organization_id: $finance_organization_id
              amount: $amount
              payer: $payer
              operation_name: $operation_name
              date: $date
              reference: $reference
              note: $note
            ) {
              _id
            }
          }
        `,variables:{finance_organization_id:e?.finance_organization_id,amount:e?.amount,payer:e?.payer,operation_name:e?.operation_name,date:{date:e?.date,time:"15:59"},reference:e?.reference,note:e?.note}}).pipe((0,n.U)(t=>t.data.CreateManualBillingFinanceOrganization))}createManualBillingImprovement(e){return this.apollo.mutate({mutation:a.ZP`
          mutation createManualBillingImprovement(
            $billing_id: ID
            $amount: Float
            $operation_name: String
            $date: DateTimeInput
            $reference: String
            $note: String
            $payers: [PayersInput]
          ) {
            CreateManualBilling(
              billing_id: $billing_id
              amount: $amount
              operation_name: $operation_name
              date: $date
              payers: $payers
              reference: $reference
              note: $note
            ) {
              _id
            }
          }
        `,variables:{billing_id:e?.billing_id,amount:e?.amount,operation_name:e?.operation_name,date:{date:e?.date,time:"15:59"},payers:e?.payers,note:e?.note,reference:e?.reference}}).pipe((0,n.U)(t=>t.data.CreateManualBilling))}updateManualBillingFinanceOrganization(e){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateManualBillingFinanceOrganization($id: ID, $amount: Float, $operation_name: String, $date: DateTimeInput) {
            UpdateManualBillingFinanceOrganization(_id: $id, amount: $amount, operation_name: $operation_name, date: $date) {
              _id
              note
              reference
            }
          }
        `,variables:{billing_id:e?.billing_id,amount:e?.amount,operation_name:e?.operation_name,date:{date:e?.date,time:"15:59"},payers:e?.payers,note:e?.note,reference:e?.reference}}).pipe((0,n.U)(t=>t.data.CreateManualBilling))}updateManualBilling(e){return this.apollo.mutate({mutation:a.ZP`
          mutation updateManualBilling($id: ID, $amount: Float, $operation_name: String, $date: DateTimeInput, $payers: [PayersInput]) {
            UpdateManualBilling(_id: $id, amount: $amount, operation_name: $operation_name, date: $date, payers: $payers) {
              _id
            }
          }
        `,variables:{id:e?.billing_id,amount:e?.amount,operation_name:e?.operation_name,date:{date:e?.date,time:"15:59"},payers:e?.payers}}).pipe((0,n.U)(t=>t.data.UpdateManualBillingFinanceOrganization))}deleteManualBilling(e){return this.apollo.mutate({mutation:a.ZP`
          mutation deleteManualBilling($id: ID) {
            DeleteManualBilling(_id: $id) {
              _id
            }
          }
        `,variables:{id:e}}).pipe((0,n.U)(t=>t.data.DeleteManualBilling))}deleteManualBillingFinanceOrganization(e){return this.apollo.mutate({mutation:a.ZP`
          mutation deleteManualBillingFinanceOrganization($id: ID) {
            DeleteManualBillingFinanceOrganization(_id: $id) {
              _id
            }
          }
        `,variables:{id:e}}).pipe((0,n.U)(t=>t.data.DeleteManualBillingFinanceOrganization))}deletePayment(e){return this.apollo.mutate({mutation:a.ZP`
          mutation deletePayment($id: ID!) {
            RemovePayment(_id: $id) {
              _id
            }
          }
        `,variables:{id:e}}).pipe((0,n.U)(t=>t.data.RemovePayment))}sendSchoolContractAmendment(e){return this.apollo.mutate({mutation:a.ZP`
          mutation sendSchoolContractAmendment($id: ID) {
            SendSchoolContractAmendment(balance_id: $id) {
              _id
            }
          }
        `,variables:{id:e}}).pipe((0,n.U)(t=>t.data.SendSchoolContractAmendment))}getSchoolContractAmendmentImprovement(e){return this.apollo.query({query:a.ZP`
          query getSchoolContractAmendmentImprovement($candidate_id: ID, $lang: String) {
            SendSchoolContractAmendment(candidate_id: $candidate_id, lang: $lang)
          }
        `,fetchPolicy:"network-only",variables:{candidate_id:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,n.U)(t=>t.data.SendSchoolContractAmendment))}getInitialLegalEntitas(){return this.apollo.query({query:a.ZP`
          query GetAllLegalEntities{
            GetAllLegalEntities {
              _id
              legal_entity_name
              account_code
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(e=>e.data.GetAllLegalEntities))}createManualPaymentLine(e){return this.apollo.mutate({mutation:a.ZP`
          mutation createManualPaymentLine(
            $billing_id: ID!
            $amount: Float
            $payer: String
            $operation_name: String
            $method_of_payment: String
            $payment_line_inputs: [PaymentLineInput]!
            $reference: String
            $note: String
          ) {
            CreateManualPaymentLine(
              billing_id: $billing_id
              amount: $amount
              payer: $payer
              operation_name: $operation_name
              method_of_payment: $method_of_payment
              payment_line_inputs: $payment_line_inputs
              reference: $reference
              note: $note
            ) {
              _id
            }
          }
        `,variables:{billing_id:e?.billing_id,operation_name:e?.operation_name,amount:e?.amount,payer:e?.payer,method_of_payment:e?.method_of_payment,payment_line_inputs:e?.payment_line_inputs,reference:e?.reference,note:e?.note}}).pipe((0,n.U)(t=>t.data.CreateManualPaymentLine))}createManualPaymentLineFinanceOrganization(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateManualPaymentLineFinanceOrganization(
            $finance_organization_id: ID
            $amount: Float
            $payer: String
            $operation_name: String
            $method_of_payment: String
            $payment_line_inputs: [PaymentLineInput]
            $reference: String
            $note: String
          ) {
            CreateManualPaymentLineFinanceOrganization(
              finance_organization_id: $finance_organization_id
              amount: $amount
              payer: $payer
              operation_name: $operation_name
              method_of_payment: $method_of_payment
              payment_line_inputs: $payment_line_inputs
              reference: $reference
              note: $note
            ) {
              _id
            }
          }
        `,variables:{finance_organization_id:e?.billing_id,operation_name:e?.operation_name,amount:e?.amount,payer:e?.payer,method_of_payment:e?.method_of_payment,payment_line_inputs:e?.payment_line_inputs,reference:e?.reference,note:e?.note}}).pipe((0,n.U)(t=>t.data.CreateManualPaymentLineFinanceOrganization))}updateManualPaymentLine(e){return this.apollo.mutate({mutation:a.ZP`
          mutation updateManualPaymentLine($master_transaction_id: ID!, $new_amount: Float) {
            UpdateManualPayment(master_transaction_id: $master_transaction_id, new_amount: $new_amount) {
              _id
            }
          }
        `,variables:{master_transaction_id:e?.master_transaction_id,new_amount:e?.new_amount}}).pipe((0,n.U)(t=>t.data.UpdateManualPayment))}removePayment(e){return this.apollo.mutate({mutation:a.ZP`
          mutation deleteManualPayment($master_transaction_id: ID!) {
            DeleteManualPayment(master_transaction_id: $master_transaction_id) {
              _id
            }
          }
        `,variables:{master_transaction_id:e}}).pipe((0,n.U)(t=>t.data.DeleteManualPayment))}updateManualPaymentFinanceOrganization(e){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateManualPaymentFinanceOrganization($master_transaction_id: ID, $new_amount: Float) {
            UpdateManualPaymentFinanceOrganization(master_transaction_id: $master_transaction_id, new_amount: $new_amount) {
              _id
            }
          }
        `,variables:{master_transaction_id:e?.master_transaction_id,new_amount:e?.new_amount}}).pipe((0,n.U)(t=>t.data.UpdateManualPaymentFinanceOrganization))}deleteManualPayment(e){return this.apollo.mutate({mutation:a.ZP`
          mutation deleteManualPayment($master_transaction_id: ID!) {
            DeleteManualPayment(master_transaction_id: $master_transaction_id) {
              _id
            }
          }
        `,variables:{master_transaction_id:e}}).pipe((0,n.U)(t=>t.data.DeleteManualPayment))}deleteAutomaticPayment(e){return this.apollo.mutate({mutation:a.ZP`
          mutation RemovePayment($_id: ID!) {
            RemovePayment(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:e}}).pipe((0,n.U)(t=>t.data.RemovePayment))}deleteManualPaymentFinanceOrganization(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteManualPaymentFinanceOrganization($master_transaction_id: ID) {
            DeleteManualPaymentFinanceOrganization(master_transaction_id: $master_transaction_id) {
              _id
            }
          }
        `,variables:{master_transaction_id:e}}).pipe((0,n.U)(t=>t.data.DeleteManualPaymentFinanceOrganization))}createManualRefund(e){return this.apollo.mutate({mutation:a.ZP`
          mutation createManualRefund($manual_refund_input: ManualRefundInput) {
            CreateManualRefund(manual_refund_input: $manual_refund_input) {
              _id
            }
          }
        `,variables:{manual_refund_input:e}}).pipe((0,n.U)(t=>t.data.CreateManualRefund))}createManualRefundFinanceOrganization(e){return this.apollo.mutate({mutation:a.ZP`
          mutation createManualRefundFinanceOrganization($manual_refund_input: ManualRefundInput) {
            CreateManualRefundFinanceOrganization(manual_refund_input: $manual_refund_input) {
              _id
            }
          }
        `,variables:{manual_refund_input:e}}).pipe((0,n.U)(t=>t.data.CreateManualRefundFinanceOrganization))}updateManualRefund(e){return this.apollo.mutate({mutation:a.ZP`
          mutation updateManualRefund($master_transaction_id: ID!, $new_amount: Float) {
            UpdateManualRefund(master_transaction_id: $master_transaction_id, new_amount: $new_amount) {
              _id
            }
          }
        `,variables:{master_transaction_id:e?.master_transaction_id,new_amount:e?.new_amount}}).pipe((0,n.U)(t=>t.data.UpdateManualRefund))}updateManualRefundFinanceOrganization(e){return this.apollo.mutate({mutation:a.ZP`
          mutation updateManualRefundFinanceOrganization($master_transaction_id: ID!, $new_amount: Float) {
            UpdateManualRefundFinanceOrganization(master_transaction_id: $master_transaction_id, new_amount: $new_amount) {
              _id
            }
          }
        `,variables:{master_transaction_id:e?.master_transaction_id,new_amount:e?.new_amount}}).pipe((0,n.U)(t=>t.data.UpdateManualRefundFinanceOrganization))}deleteManualRefund(e){return this.apollo.mutate({mutation:a.ZP`
          mutation deleteManualRefund($master_transaction_id: ID!, $new_amount: Float) {
            DeleteManualRefund(master_transaction_id: $master_transaction_id, new_amount: $new_amount) {
              _id
            }
          }
        `,variables:{master_transaction_id:e?.master_transaction_id,new_amount:e?.new_amount}}).pipe((0,n.U)(t=>t.data.DeleteManualRefund))}deleteManualRefundFinanceOrganization(e){return this.apollo.mutate({mutation:a.ZP`
          mutation deleteManualRefundFinanceOrganization($master_transaction_id: ID!, $new_amount: Float) {
            DeleteManualRefundFinanceOrganization(master_transaction_id: $master_transaction_id, new_amount: $new_amount) {
              _id
            }
          }
        `,variables:{master_transaction_id:e?.master_transaction_id,new_amount:e?.new_amount}}).pipe((0,n.U)(t=>t.data.DeleteManualRefundFinanceOrganization))}createManualAvoir(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation createManualAvoir($billing_id: ID!, $payment_line_input: PaymentLineInput!) {
            CreateManualAvoir(billing_id: $billing_id, payment_line_input: $payment_line_input) {
              _id
            }
          }
        `,variables:{billing_id:e,payment_line_input:t}}).pipe((0,n.U)(i=>i.data.CreateManualAvoir))}deleteManualAvoir(e){return this.apollo.mutate({mutation:a.ZP`
          mutation deleteManualAvoir($_id: ID!) {
            DeleteManualAvoir(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:e}}).pipe((0,n.U)(t=>t.data.DeleteManualAvoir))}deleteManualAvoirFinanceOrganization(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteManualAvoirFinanceOrganization($_id: ID) {
            DeleteManualAvoirFinanceOrganization(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:e}}).pipe((0,n.U)(t=>t.data.DeleteManualAvoirFinanceOrganization))}addODCashTransfer(e){return this.apollo.mutate({mutation:a.ZP`
          mutation addODCashTransfer($od_input: AddODCashTransferInput) {
            AddODCashTransfer(od_input: $od_input) {
              _id
            }
          }
        `,variables:{od_input:e}}).pipe((0,n.U)(t=>t.data.AddODCashTransfer))}editODCashTransfer(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation editODCashTransfer($id: ID!, $od_input: AddODCashTransferInput) {
            EditODCashTransfer(master_transaction_id: $id, od_input: $od_input) {
              _id
            }
          }
        `,variables:{id:e,od_input:t}}).pipe((0,n.U)(i=>i.data.EditODCashTransfer))}removeODCashTransfer(e){return this.apollo.mutate({mutation:a.ZP`
          mutation removeODCashTransfer($id: ID!) {
            RemoveODCashTransfer(master_transaction_id: $id) {
              _id
            }
          }
        `,variables:{id:e}}).pipe((0,n.U)(t=>t.data.RemoveODCashTransfer))}addODStudentBalanceAdjustement(e){return this.apollo.mutate({mutation:a.ZP`
          mutation addODStudentBalanceAdjustement($od_input: CreateOdStudentBalanceAdjustmentInput) {
            AddODStudentBalanceAdjustement(od_student_adjustment_input: $od_input) {
              _id
            }
          }
        `,variables:{od_input:e}}).pipe((0,n.U)(t=>t.data.AddODStudentBalanceAdjustement))}addODStudentBalanceAdjustementFinanceOrganization(e){return this.apollo.mutate({mutation:a.ZP`
          mutation addODStudentBalanceAdjustementFinanceOrganization(
            $od_student_adjustment_input: CreateOdStudentBalanceAdjustmentFinanceOrganizationInput
          ) {
            AddODStudentBalanceAdjustementFinanceOrganization(od_student_adjustment_input: $od_student_adjustment_input) {
              _id
            }
          }
        `,variables:{od_student_adjustment_input:e}}).pipe((0,n.U)(t=>t.data.AddODStudentBalanceAdjustementFinanceOrganization))}editODStudentBalanceAdjustement(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation editODStudentBalanceAdjustement($id: ID!, $od_input: CreateOdStudentBalanceAdjustmentInput) {
            EditODStudentBalanceAdjustement(master_transaction_id: $id, od_student_adjustment_input: $od_input) {
              _id
            }
          }
        `,variables:{id:e,od_input:t}}).pipe((0,n.U)(i=>i.data.EditODStudentBalanceAdjustement))}editODStudentBalanceAdjustementFinanceOrganization(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation editODStudentBalanceAdjustementFinanceOrganization(
            $master_transaction_id: ID!
            $od_student_adjustment_input: CreateOdStudentBalanceAdjustmentFinanceOrganizationInput
          ) {
            EditODStudentBalanceAdjustementFinanceOrganization(
              master_transaction_id: $master_transaction_id
              od_student_adjustment_input: $od_student_adjustment_input
            ) {
              _id
            }
          }
        `,variables:{master_transaction_id:e,od_student_adjustment_input:t}}).pipe((0,n.U)(i=>i.data.EditODStudentBalanceAdjustementFinanceOrganization))}removeStudentBalanceAdjustement(e){return this.apollo.mutate({mutation:a.ZP`
          mutation removeStudentBalanceAdjustement($id: ID!) {
            RemoveStudentBalanceAdjustement(master_transaction_id: $id) {
              _id
            }
          }
        `,variables:{id:e}}).pipe((0,n.U)(t=>t.data.RemoveStudentBalanceAdjustement))}GetAllFinanceOrganizationCandidateId(e){return this.apollo.query({query:a.ZP`
          query GetAllFinanceOrganization($filter: FinanceOrganizationFilterInput) {
            GetAllFinanceOrganization(filter: $filter) {
              _id
              candidate_id {
                _id
                last_name
                first_name
                civility
                email
                candidate_admission_status
                registration_profile {
                  is_down_payment
                  discount_on_full_rate
                  additional_cost_ids {
                    _id
                    additional_cost
                    amount
                  }
                }
                selected_payment_plan {
                  additional_expense
                }
                payment_supports {
                  name
                  family_name
                  civility
                  email
                }
              }
              account_number
              company_branch_id {
                _id
                company_name
              }
              organization_id {
                _id
                name
                organization_type
              }
              intake_channel {
                program
              }
              financial_profile
              student_type {
                type_of_information
                type_of_formation
              }
              profil_rate
              is_profil_rate_updated
              payment_method
              financial_supports {
                relation
                family_name
                name
              }
              amount_billed
              amount_paid
              remaining_billed
              amount_late
              accumulated_late
              deposit
              deposit_pay_amount
              deposit_pay_date {
                date
                time
              }
              is_deposit_completed
              overdue
              overdue_not_paid
              is_student_blocked
              terms {
                _id
                term_payment {
                  date
                  time
                }
                term_payment_deferment {
                  date
                  time
                }
                is_term_paid
                term_amount
                term_pay_amount
                term_status
                term_pay_date {
                  date
                  time
                }
                is_partial
                is_locked
              }
              count_document
              term_times
              deposit_status
              organization_name
              organization_type
              total_amount
              admission_financement_id {
                _id
              }
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetAllFinanceOrganization))}checkDisableAddFinancementCadidate(e){return this.apollo.query({query:a.ZP`
          query GetAllBilling($filter: BillingFilterInput) {
            GetAllBilling(filter: $filter) {
              _id
              terms {
                _id
                term_status
              }
              total_amount
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetAllBilling))}checkDisableAddFinancementOrganization(e){return this.apollo.query({query:a.ZP`
          query GetAllFinanceOrganization($filter: FinanceOrganizationFilterInput) {
            GetAllFinanceOrganization(filter: $filter) {
              _id
              terms {
                _id
                term_status
              }
              total_amount
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetAllFinanceOrganization))}getAllProgramOfMasterTransaction(){return this.apollo.query({query:a.ZP`
          query GetProgramDropdownMasterTransaction {
            GetProgramDropdownMasterTransaction {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(e=>e.data.GetProgramDropdownMasterTransaction))}getAllLegalEntitiesOfMasterTransaction(){return this.apollo.query({query:a.ZP`
          query GetLegalEntityDropdownMasterTransaction {
            GetLegalEntityDropdownMasterTransaction {
              _id
              legal_entity_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(e=>e.data.GetLegalEntityDropdownMasterTransaction))}getAllOperationNameDropDownMasterTransaction(){return this.apollo.query({query:a.ZP`
          query GetAllOperationNameDropDownMasterTransaction{
            GetOperationNameDropDownMasterTransaction
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(e=>e.data.GetOperationNameDropDownMasterTransaction))}getAllMasterTransaction(e,t,i,o){return this.apollo.query({query:a.ZP`
          query GetAllMasterTableTransaction(
            $pagination: PaginationInput
            $user_type_ids: [ID]
            $sorting: MasterTransactionSortingInput
            $filter: MasterTransactionFilterInput
            $lang: String
          ) {
            GetAllMasterTableTransaction(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sorting, filter: $filter, lang: $lang) {
              _id
              date_action {
                date
                time
              }
              term_index
              candidate_id {
                _id
                candidate_unique_number
                last_name
                first_name
                civility
                type_of_formation_id {
                  type_of_information
                  type_of_formation
                }
              }
              program_id {
                _id
                program
                scholar_season_id {
                  scholar_season
                }
              }
              legal_entity_id {
                legal_entity_name
              }
              transaction_type
              operation_name
              nature
              flux
              debit
              reference
              note
              credit
              term_index
              user_id {
                last_name
                first_name
                civility
              }
              billing_id {
                _id
                is_financial_support
                financial_support_info {
                  _id
                  civility
                  email
                  family_name
                  name
                  relation
                }
                candidate_id {
                  _id
                  last_name
                  first_name
                  civility
                }
                terms {
                  _id
                  is_regulation
                }
              }
              finance_organization_id {
                _id
                organization_id {
                  _id
                  name
                }
                company_branch_id {
                  _id
                  company_name
                }
              }
              transaction_id {
                psp_reference
              }
              transaction_id {
                latest_status
                latest_response
              }
              count_document
              payment_date
              term_affected {
                term_index
                term_id
                amount
                term_payment {
                  date
                  time
                }
                term_pay_date {
                  date
                  time
                }
                payment_source
                term_pay_amount
                is_regulation
              }
              created_at {
                date
                time
              }
              is_manual_action
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,user_type_ids:t,sorting:i,filter:o,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,n.U)(l=>l.data.GetAllMasterTableTransaction))}getAllDataForExportMasterTransaction(e,t,i,o){return this.apollo.query({query:a.ZP`
          query GetAllDataForExportMasterTransaction(
            $pagination: PaginationInput
            $user_type_ids: [ID]
            $sorting: MasterTransactionSortingInput
            $filter: MasterTransactionFilterInput
          ) {
            GetAllMasterTableTransaction(pagination: $pagination, user_type_ids: $user_type_ids, sorting: $sorting, filter: $filter) {
              _id
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,user_type_ids:t,sorting:i,filter:o}}).pipe((0,n.U)(l=>l.data.GetAllMasterTableTransaction))}removeStudentBalanceAdjustementFinanceOrganization(e){return this.apollo.mutate({mutation:a.ZP`
          mutation removeStudentBalanceAdjustementFinanceOrganization($master_transaction_id: ID!) {
            RemoveStudentBalanceAdjustementFinanceOrganization(master_transaction_id: $master_transaction_id) {
              _id
            }
          }
        `,variables:{master_transaction_id:e}}).pipe((0,n.U)(t=>t.data.RemoveStudentBalanceAdjustementFinanceOrganization))}getAllBillingContract(e,t){return this.apollo.query({query:a.ZP`
          query GetAllBilling($filter: BillingFilterInput, $sorting:BillingSortingInput) {
            GetAllBilling(filter: $filter, sorting: $sorting) {
              _id
              candidate_id {
                _id
                civility
                first_name
                last_name
                candidate_admission_status
                payment
              }
              total_amount
              amount_billed
              amount_paid
              remaining_billed
              deposit
              terms {
                _id
                term_pay_date {
                  date
                  time
                }
                is_term_paid
                term_status
                term_pay_amount
                term_payment {
                  date
                  time
                }
                term_payment_deferment {
                  date
                  time
                }
                term_amount
              }
              is_financial_support
              financial_support_info {
                _id
                civility
                family_name
                name
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e,sorting:t}}).pipe((0,n.U)(i=>i.data.GetAllBilling))}}return p.\u0275fac=function(e){return new(e||p)(y.\u0275\u0275inject(f.eN),y.\u0275\u0275inject($._M),y.\u0275\u0275inject(P.sK))},p.\u0275prov=y.\u0275\u0275defineInjectable({token:p,factory:p.\u0275fac,providedIn:"root"}),p})()}}]);