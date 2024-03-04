"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[2194],{72194:(h,p,l)=>{l.d(p,{p:()=>c});var a=l(13125),i=l(24850),s=l(94650),_=l(80529),u=l(18497);let c=(()=>{class r{constructor(e,t){this.httpClient=e,this.apollo=t}GetAllSpecializations(e,t=null,o){return this.apollo.watchQuery({query:a.ZP`
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
              sigli
            }
          }
        `,variables:{pagination:e,sortValue:t,filter:o},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(n=>n.data.GetAllSpecializations))}GetAllSpecializationsByScholar(){return this.apollo.watchQuery({query:a.ZP`
          query GetAllSpecializationsByScholar{
            GetAllSpecializations {
              _id
              name
              intake_channel
              description
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllSpecializations))}DeleteSpecialization(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteSpecialization($_id: ID!) {
            DeleteSpecialization(_id: $_id) {
              name
            }
          }
        `,variables:{_id:e}}).pipe((0,i.U)(t=>t.data.DeleteSpecialization))}CreateSpecialization(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateSpecialization($specialization_input: SpecializationInput) {
            CreateSpecialization(specialization_input: $specialization_input) {
              name
            }
          }
        `,variables:{specialization_input:e}}).pipe((0,i.U)(t=>t.data.CreateSpecialization))}UpdateSpecialization(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateSpecialization($specialization_input: SpecializationInput, $_id: ID!) {
            UpdateSpecialization(specialization_input: $specialization_input, _id: $_id) {
              name
            }
          }
        `,variables:{_id:t,specialization_input:e}}).pipe((0,i.U)(o=>o.data.UpdateSpecialization))}GetAllSectorsTable(e,t){return this.apollo.watchQuery({query:a.ZP`
          query GetAllSectors($pagination: PaginationInput, $sorting: SectorSortingInput) {
            GetAllSectors(pagination: $pagination, sorting: $sorting) {
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
        `,variables:{pagination:e,sorting:t||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(o=>o.data.GetAllSectors))}DeleteSector(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteSector($_id: ID!) {
            DeleteSector(_id: $_id) {
              name
            }
          }
        `,variables:{_id:e}}).pipe((0,i.U)(t=>t.data.DeleteSector))}CreateSector(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateSector($sector_input: SectorInput) {
            CreateSector(sector_input: $sector_input) {
              _id
              name
            }
          }
        `,variables:{sector_input:e}}).pipe((0,i.U)(t=>t.data.CreateSector))}UpdateSector(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateSector($sector_input: SectorInput, $_id: ID!) {
            UpdateSector(sector_input: $sector_input, _id: $_id) {
              _id
            }
          }
        `,variables:{_id:t,sector_input:e}}).pipe((0,i.U)(o=>o.data.UpdateSector))}GetAllSitesTable(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllSite($pagination: PaginationInput) {
            GetAllSite(pagination: $pagination) {
              _id
              name
              address
              zip_code
              country
              city
              count_document
            }
          }
        `,variables:{pagination:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(t=>t.data.GetAllSite))}GetAllSites(){return this.apollo.watchQuery({query:a.ZP`
          query GetAllSites{
            GetAllSite {
              _id
              name
              address
              zip_code
              country
              city
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllSite))}DeleteSite(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteSite($_id: ID!) {
            DeleteSite(_id: $_id) {
              name
            }
          }
        `,variables:{_id:e}}).pipe((0,i.U)(t=>t.data.DeleteSite))}CreateSite(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateSite($site_input: SiteInput) {
            CreateSite(site_input: $site_input) {
              _id
              name
            }
          }
        `,variables:{site_input:e}}).pipe((0,i.U)(t=>t.data.CreateSite))}UpdateSite(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateSite($site_input: SiteInput, $_id: ID!) {
            UpdateSite(site_input: $site_input, _id: $_id) {
              _id
            }
          }
        `,variables:{_id:t,site_input:e}}).pipe((0,i.U)(o=>o.data.UpdateSite))}GetAllCampuses(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllCampusesIntakeChannel($filter: CampusFilterInput) {
            GetAllCampuses(filter: $filter) {
              _id
              name
              short_name
              analytical_code
              sites {
                site_id {
                  _id
                  name
                  address
                  zip_code
                  country
                  city
                }
                is_main_address
              }
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(t=>t.data.GetAllCampuses))}GetOneCandidateSchool(e,t){return this.apollo.watchQuery({query:a.ZP`
          query GetOneCandidateSchoolIntakeChannel($_id: ID!, $scholar_season_id: ID) {
            GetOneCandidateSchool(_id: $_id, scholar_season_id: $scholar_season_id) {
              _id
              short_name
              long_name
              scholar_season_id {
                _id
                scholar_season
              }
              campuses {
                levels {
                  _id
                  name
                  code
                  specialities {
                    _id
                    name
                    sectors {
                      _id
                      name
                    }
                  }
                }
                _id
                name
              }
              levels {
                _id
                name
                code
              }
            }
          }
        `,variables:{_id:e,scholar_season_id:t},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(o=>o.data.GetOneCandidateSchool))}GetOneCampus(e){return this.apollo.watchQuery({query:a.ZP`
          query GetOneCampusIntakeChannel($_id: ID!) {
            GetOneCampus(_id: $_id) {
              _id
              name
              short_name
              address
              analytical_code
              sites {
                site_id {
                  _id
                  name
                  address
                  zip_code
                  country
                  city
                }
                is_main_address
              }
            }
          }
        `,variables:{_id:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(t=>t.data.GetOneCampus))}CreateCampus(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateCampus($campus_input: CampusInput) {
            CreateCampus(campus_input: $campus_input) {
              _id
            }
          }
        `,variables:{campus_input:e}}).pipe((0,i.U)(t=>t.data.CreateCampus))}UpdateCampus(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateCampusIntakeChannel($campus_input: CampusInput, $_id: ID!) {
            UpdateCampus(campus_input: $campus_input, _id: $_id) {
              _id
            }
          }
        `,variables:{_id:t,campus_input:e}}).pipe((0,i.U)(o=>o.data.UpdateCampus))}GetAllLevelsTable(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllLevels($pagination: PaginationInput) {
            GetAllLevels(pagination: $pagination) {
              _id
              name
              description
              accounting_plan
              count_document
            }
          }
        `,variables:{pagination:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(t=>t.data.GetAllLevels))}DeleteLevel(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteLevel($_id: ID!) {
            DeleteLevel(_id: $_id) {
              name
            }
          }
        `,variables:{_id:e}}).pipe((0,i.U)(t=>t.data.DeleteLevel))}CreateLevel(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateLevel($level_input: LevelInput) {
            CreateLevel(level_input: $level_input) {
              _id
              name
            }
          }
        `,variables:{level_input:e}}).pipe((0,i.U)(t=>t.data.CreateLevel))}UpdateLevel(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateLevel($level_input: LevelInput, $_id: ID!) {
            UpdateLevel(level_input: $level_input, _id: $_id) {
              _id
            }
          }
        `,variables:{_id:t,level_input:e}}).pipe((0,i.U)(o=>o.data.UpdateLevel))}UpdateScholarSeason(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateScholarSeason($scholar_season_input: ScholarSeasonInput, $_id: ID!) {
            UpdateScholarSeason(scholar_season_input: $scholar_season_input, _id: $_id) {
              _id
              scholar_season
            }
          }
        `,variables:{_id:t,scholar_season_input:e}}).pipe((0,i.U)(o=>o.data.UpdateScholarSeason))}GetAllSchools(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllCandidateSchool($user_type_id: ID) {
            GetAllCandidateSchool(user_type_id: $user_type_id) {
              _id
              short_name
              long_name
            }
          }
        `,fetchPolicy:"network-only",variables:{user_type_id:e}}).valueChanges.pipe((0,i.U)(t=>t.data.GetAllCandidateSchool))}GetOneSchool(e){return this.apollo.watchQuery({query:a.ZP`
          query GetOneCandidateSchool{
            GetOneCandidateSchool(_id: "${e}") {
              _id
              school_logo
              short_name
              long_name
              platform_account
              tele_phone
              accounting_plan
              signalement_email
              school_stamp
              empty_scholar_seasons {
                _id
                scholar_season
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(t=>t.data.GetOneCandidateSchool))}GetOneSchoolLegal(e,t){return this.apollo.watchQuery({query:a.ZP`
          query GetOneCandidateSchool{
            GetOneCandidateSchool(_id: "${e}", scholar_season_id: "${t}") {
              _id
              school_logo
              short_name
              long_name
              tele_phone
              accounting_plan
              signalement_email
              campuses {
                levels {
                  _id
                  name
                  code
                  specialities {
                    _id
                    name
                    sectors {
                      _id
                      name
                    }
                  }
                }
                _id
                name
              }
              levels {
                _id
                name
                code
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(o=>o.data.GetOneCandidateSchool))}CreateCandidateSchool(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateCandidateSchool($candidate_school_input: CandidateSchoolInput) {
            CreateCandidateSchool(candidate_school_input: $candidate_school_input) {
              _id
              short_name
              platform_account
            }
          }
        `,variables:{candidate_school_input:e}}).pipe((0,i.U)(t=>t.data.CreateCandidateSchool))}UpdateCandidateSchool(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateCandidateSchool($candidate_school_input: CandidateSchoolInput, $_id: ID) {
            UpdateCandidateSchool(candidate_school_input: $candidate_school_input, _id: $_id) {
              _id
              school_logo
              short_name
              long_name
              tele_phone
              accounting_plan
              signalement_email
              platform_account
            }
          }
        `,variables:{_id:t,candidate_school_input:e}}).pipe((0,i.U)(o=>o.data.UpdateCandidateSchool))}GetAllPublishedScholarSeasons(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllScholarSeasons {
            GetAllScholarSeasons(filter: {is_published: ${e}}) {
              _id
              scholar_season
              is_published
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(t=>t.data.GetAllScholarSeasons))}DuplicateScholarSeason(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DuplicateScholarSeason($duplicate_scholar_season_input: DuplicateScholarSeasonInput!) {
            DuplicateScholarSeason(duplicate_scholar_season_input: $duplicate_scholar_season_input) {
              _id
            }
          }
        `,variables:{duplicate_scholar_season_input:e}}).pipe((0,i.U)(t=>t.data.DuplicateScholarSeason))}GetAllSchoolProgram(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllPrograms($filter: ProgramFilterInput) {
            GetAllPrograms(filter: $filter) {
              _id
              program
              school_id {
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
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
              count_document
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(t=>t.data.GetAllPrograms))}GetAllSchoolIntakeChannel(e,t,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllIntakeChannels($filter: IntakeChannelFilterInput, $pagination: PaginationInput, $sort: IntakeChannelSortingInput) {
            GetAllIntakeChannels(filter: $filter, pagination: $pagination, sorting: $sort) {
              _id
              intake_channel
              scholar_season
              school
              campus
              level
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
              profil_rate {
                _id
                name
                scholar_season_id {
                  _id
                }
              }
              admission_flyer {
                s3_file_name
                document_name
              }
              admission_document {
                s3_file_name
                document_name
              }
              admission_document_template {
                _id
                form_builder_name
              }
              count_document
              start_date {
                date
                time
              }
              program_director_id {
                _id
              }
              cvec_template_id { 
                form_builder_name
                _id
              }
              cvec_send_date
              cvec_validators {
                user_validator {
                  _id
                  first_name
                  last_name
                  civility
                }
                validator {
                  _id
                }
                form_builder_step_id {
                  _id
                }
              }
              adm_doc_validators {
                user_validator {
                  _id
                  first_name
                  last_name
                  civility
                }
                validator {
                  _id
                }
                form_builder_step_id {
                  _id
                }
              }
              adm_doc_names
            }
          }
        `,variables:{filter:e,pagination:t,sort:o||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(n=>n.data.GetAllIntakeChannels))}GetAllSchoolIntakeChannelIdCheckbox(e,t,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllIntakeChannels($filter: IntakeChannelFilterInput, $pagination: PaginationInput, $sort: IntakeChannelSortingInput) {
            GetAllIntakeChannels(filter: $filter, pagination: $pagination, sorting: $sort) {
              _id
            }
          }
        `,variables:{filter:e,pagination:t,sort:o||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(n=>n.data.GetAllIntakeChannels))}GetAllSchoolIntakeChannelDirectorCheckbox(e,t,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllIntakeChannels($filter: IntakeChannelFilterInput, $pagination: PaginationInput, $sort: IntakeChannelSortingInput) {
            GetAllIntakeChannels(filter: $filter, pagination: $pagination, sorting: $sort) {
              _id
              program_director_id {
                _id
              }
            }
          }
        `,variables:{filter:e,pagination:t,sort:o||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(n=>n.data.GetAllIntakeChannels))}GetAllRegistrationProfileForCheckbox(e,t,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllRegistrationProfileForCheckbox(
            $filter: IntakeChannelFilterInput
            $pagination: PaginationInput
            $sort: IntakeChannelSortingInput
          ) {
            GetAllIntakeChannels(filter: $filter, pagination: $pagination, sorting: $sort) {
              _id
              intake_channel
              profil_rate {
                _id
                name
                scholar_season_id {
                  _id
                }
              }
            }
          }
        `,variables:{filter:e,pagination:t,sort:o||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(n=>n.data.GetAllIntakeChannels))}GetAllRegistrationProfile(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllProfilRates($filter: ProfilRateFilterInput) {
            GetAllProfilRates(filter: $filter) {
              _id
              name
              scholar_season_programs {
                scholar_season_id {
                  _id
                }
                school_id {
                  _id
                }
                programs {
                  _id
                }
              }
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(t=>t.data.GetAllProfilRates))}GetAllRegistrationProfileForDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query GetAllRegistrationProfileForDropdown {
            GetAllProfilRates {
              _id
              name
              scholar_season_programs {
                scholar_season_id {
                  _id
                }
                school_id {
                  _id
                }
                programs {
                  _id
                }
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllProfilRates))}getAllTypeOfInformation(e,t){return this.apollo.watchQuery({query:a.ZP`
          query GetAllTypeOfInformation($pagination: PaginationInput, $filter: TypeOfInformationFilterInput) {
            GetAllTypeOfInformation(pagination: $pagination, filter: $filter) {
              _id
              type_of_information
              type_of_formation
              description
              count_document
              sigle
              admission_form_id {
                _id
                form_builder_name
              }
              readmission_form_id {
                _id
                form_builder_name
              }
              document_builder_id {
                _id
                document_builder_name
              }
              form_builder_id {
                _id
                form_builder_name
              }
              accounting_plan
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,filter:t}}).valueChanges.pipe((0,i.U)(o=>o.data.GetAllTypeOfInformation))}deleteTypeOfInformation(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteTypeOfInformation($_id: ID!) {
            DeleteTypeOfInformation(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:e}}).pipe((0,i.U)(t=>t.data.DeleteTypeOfInformation))}updateTypeOfInformation(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateTypeOfInformation($_id: ID!, $type_of_information_input: TypeOfInformationInput) {
            UpdateTypeOfInformation(_id: $_id, type_of_information_input: $type_of_information_input) {
              _id
            }
          }
        `,variables:{_id:e,type_of_information_input:t}}).pipe((0,i.U)(o=>o.data.UpdateTypeOfInformation))}createTypeOfInformation(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateTypeOfInformation($type_of_information_input: TypeOfInformationInput) {
            CreateTypeOfInformation(type_of_information_input: $type_of_information_input) {
              _id
            }
          }
        `,variables:{type_of_information_input:e}}).pipe((0,i.U)(t=>t.data.CreateTypeOfInformation))}getAllTypeOfInformationDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query GetAllTypeOfInformation {
            GetAllTypeOfInformation {
              _id
              type_of_information
              description
              type_of_formation
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllTypeOfInformation))}GetAllAdditionalCosts(e,t,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllAdditionalCosts($pagination: PaginationInput, $sort: AdditionalCostSortingInput) {
            GetAllAdditionalCosts(pagination: $pagination, sorting: $sort, ${o}) {
              count_document
              additional_cost
              description
              amount
              currency
              _id
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(n=>n.data.GetAllAdditionalCosts))}GetAllAdditionalCostsId(e,t,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllAdditionalCosts($pagination: PaginationInput, $sort: AdditionalCostSortingInput) {
            GetAllAdditionalCosts(pagination: $pagination, sorting: $sort, ${o}) {
              _id
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(n=>n.data.GetAllAdditionalCosts))}DeleteAdditionalCost(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteAdditionalCost($_id: ID!) {
            DeleteAdditionalCost(_id: $_id) {
              description
            }
          }
        `,variables:{_id:e}}).pipe((0,i.U)(t=>t.data.DeleteAdditionalCost))}GetAllAdditionalCostsDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query GetAllAdditionalCosts {
            GetAllAdditionalCosts {
              _id
              additional_cost
              description
              amount
              currency
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllAdditionalCosts))}UpdateAdditionalCost(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateAdditionalCost($additional_cost_input: AdditionalCostInput, $_id: ID!) {
            UpdateAdditionalCost(additional_cost_input: $additional_cost_input, _id: $_id) {
              description
            }
          }
        `,variables:{_id:t,additional_cost_input:e}}).pipe((0,i.U)(o=>o.data.UpdateAdditionalCost))}CreateAdditionalCost(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateAdditionalCost($additional_cost_input: AdditionalCostInput) {
            CreateAdditionalCost(additional_cost_input: $additional_cost_input) {
              description
            }
          }
        `,variables:{additional_cost_input:e}}).pipe((0,i.U)(t=>t.data.CreateAdditionalCost))}getAllPaymentModes(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllPaymentModes($filter: PaymentModeFilterInput) {
            GetAllPaymentModes(filter: $filter) {
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
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(t=>t.data.GetAllPaymentModes))}getAllAdditionalCostsDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query GetAllAdditionalCosts {
            GetAllAdditionalCosts {
              additional_cost
              _id
              amount
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllAdditionalCosts))}GetAllProgramsID(e,t){return this.apollo.query({query:a.ZP`
          query GetAllProgramsID($filter: ProgramFilterInput, $pagination: PaginationInput) {
            GetAllPrograms(filter: $filter, pagination: $pagination) {
              _id
            }
          }
        `,variables:{filter:e,pagination:t},fetchPolicy:"network-only"}).pipe((0,i.U)(o=>o.data.GetAllPrograms))}GetAllSelectedSchoolProgramScholarSeason(e,t,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllSelectedSchoolProgramScholarSeason(
            $filter: ProgramFilterInput
            $pagination: PaginationInput
            $user_type_logins: [ID]
          ) {
            GetAllPrograms(filter: $filter, pagination: $pagination, user_type_logins: $user_type_logins) {
              _id
              program
              school_id {
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
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
              scholar_season_id {
                _id
                scholar_season
              }
              count_document
            }
          }
        `,variables:{filter:e,pagination:t,user_type_logins:o},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(n=>n.data.GetAllPrograms))}GetAllSelectedSchoolProgramScholarSeasonFilter(e,t,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllSelectedSchoolProgramScholarSeason(
            $filter: ProgramFilterInput
            $pagination: PaginationInput
            $user_type_logins: [ID]
          ) {
            GetAllPrograms(filter: $filter, pagination: $pagination, user_type_logins: $user_type_logins) {
              _id
              school_id {
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
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,variables:{filter:e,pagination:t,user_type_logins:o},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(n=>n.data.GetAllPrograms))}deleteProgramSelected(e){return this.apollo.mutate({mutation:a.ZP`
          mutation deleteProgramSelected($_id: ID!) {
            DeleteProgram(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:e}}).pipe((0,i.U)(t=>t.data.DeleteProgram))}getSectorDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query getSectorDropdown {
            GetAllSectors {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllSectors))}getAllCampusesDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query getAllCampusesDropdown {
            GetAllCampuses {
              _id
              name
              short_name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllCampuses))}getAllSpecializationsDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query getAllSpecializationsDropdown {
            GetAllSpecializations {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllSpecializations))}getAllLevelsDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query getAllLevelsDropdown {
            GetAllLevels {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllLevels))}AssignProgramToSchool(e){return this.apollo.mutate({mutation:a.ZP`
          mutation AssignProgramToSchool($program_to_school_input: AssignProgramToSchoolInput) {
            AssignProgramToSchool(program_to_school_input: $program_to_school_input) {
              _id
            }
          }
        `,variables:{program_to_school_input:e}}).pipe((0,i.U)(t=>t.data.AssignProgramToSchool))}GetAllSchoolScholar(e,t){return this.apollo.watchQuery({query:a.ZP`
          query GetAllCandidateSchool($short_names: [String], $user_type_id: ID) {
            GetAllCandidateSchool(filter: { short_names: $short_names }, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              scholar_season_id {
                _id
                scholar_season
              }
              campuses {
                levels {
                  _id
                  name
                  code
                  specialities {
                    _id
                    name
                    sectors {
                      _id
                      name
                    }
                  }
                }
                _id
                name
              }
              levels {
                _id
                name
                code
              }
            }
          }
        `,variables:{short_names:e,user_type_id:t},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(o=>o.data.GetAllCandidateSchool))}AssignProgramToProfileRates(e,t,o){return this.apollo.mutate({mutation:a.ZP`
          mutation AssignProgramToProfileRates(
            $scholar_season_id: ID
            $school_id: ID
            $intake_channel_inputs: [ProgramToProfileRateInput]
          ) {
            AssignProgramToProfileRates(
              scholar_season_id: $scholar_season_id
              school_id: $school_id
              intake_channel_inputs: $intake_channel_inputs
            ) {
              _id
            }
          }
        `,variables:{scholar_season_id:e,school_id:t,intake_channel_inputs:o}}).pipe((0,i.U)(n=>n.data.ProfilRate))}updateProgram(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateProgram($_id: ID!, $program_input: ProgramInput) {
            UpdateProgram(_id: $_id, program_input: $program_input) {
              _id
            }
          }
        `,variables:{_id:e,program_input:t}}).pipe((0,i.U)(o=>o.data.UpdateProgram))}updatePrograms(e,t,o,n){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdatePrograms($program_ids: [ID], $program_input: ProgramInput, $is_select_all: Boolean, $filter: ProgramFilterInput) {
            UpdatePrograms(program_ids: $program_ids, program_input: $program_input, is_select_all: $is_select_all, filter: $filter)
          }
        `,variables:{program_ids:e,program_input:t,is_select_all:o,filter:n}}).pipe((0,i.U)(d=>d.data.UpdatePrograms))}updateProgramStartDate(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdatePrograms($program_ids: [ID], $program_input: ProgramInput) {
            UpdatePrograms(program_ids: $program_ids, program_input: $program_input)
          }
        `,variables:{program_ids:e,program_input:t}}).pipe((0,i.U)(o=>o.data.UpdatePrograms))}updateCommonCandidateSchool(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateCommonCandidateSchool($_id: ID, $candidate_school_input: CandidateSchoolInput) {
            UpdateCommonCandidateSchool(_id: $_id, candidate_school_input: $candidate_school_input) {
              _id
              empty_scholar_seasons {
                _id
                scholar_season
              }
            }
          }
        `,variables:{_id:e,candidate_school_input:t}}).pipe((0,i.U)(o=>o.data.UpdateCommonCandidateSchool))}AssignProgramDirectorToManyPrograms(e,t,o,n){return this.apollo.mutate({mutation:a.ZP`
          mutation AssignProgramDirectorToManyPrograms(
            $intake_channel_ids: [ID]
            $program_director_id: [ID]
            $filter: IntakeChannelFilterInput
            $select_all: Boolean
          ) {
            AssignProgramDirectorToManyPrograms(
              intake_channel_ids: $intake_channel_ids
              program_director_id: $program_director_id
              filter: $filter
              select_all: $select_all
            ) {
              _id
            }
          }
        `,variables:{intake_channel_ids:e,program_director_id:t,filter:o,select_all:n}}).pipe((0,i.U)(d=>d.data.AssignProgramDirectorToManyPrograms))}GetAllTypeInformationIntakeChannelIdCheckbox(e,t){return this.apollo.watchQuery({query:a.ZP`
          query GetAllTypeInformationIntakeChannelIdCheckbox($pagination: PaginationInput, $filter: TypeOfInformationFilterInput) {
            GetAllTypeOfInformation(filter: $filter, pagination: $pagination) {
              _id
            }
          }
        `,variables:{filter:e,pagination:t},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(o=>o.data.GetAllTypeOfInformation))}getConnectRegistrationCheckboxId(e,t,o){return this.apollo.watchQuery({query:a.ZP`
          query getConnectRegistrationCheckboxId(
            $filter: IntakeChannelFilterInput
            $pagination: PaginationInput
            $sort: IntakeChannelSortingInput
          ) {
            GetAllIntakeChannels(filter: $filter, pagination: $pagination, sorting: $sort) {
              _id
              intake_channel
              scholar_season
            }
          }
        `,variables:{filter:e,pagination:t,sort:o||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(n=>n.data.GetAllIntakeChannels))}GetAllAdditionalExpensesIntakeChannelIdCheckbox(e,t,o){return this.apollo.watchQuery({query:a.ZP`
          query GetAllAdditionalExpensesIntakeChannelIdCheckbox ($pagination: PaginationInput, $sort: AdditionalCostSortingInput) {
            GetAllAdditionalCosts(pagination: $pagination, sorting: $sort, ${o}) {
              _id
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(n=>n.data.GetAllAdditionalCosts))}GetAllUserAdmission(){return this.apollo.watchQuery({query:a.ZP`
          query {
            GetAllUsers(user_type: "617f64ec5a48fe2228518812") {
              _id
              first_name
              last_name
              civility
              entities {
                type {
                  _id
                  name
                }
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllUsers))}GetAllUserAdmissionWithIntake(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllUsers($intake_channel_ids: [ID]) {
            GetAllUsers(user_type: "617f64ec5a48fe2228518812", intake_channel_ids: $intake_channel_ids) {
              _id
              first_name
              last_name
              civility
              entities {
                type {
                  _id
                  name
                }
              }
            }
          }
        `,variables:{intake_channel_ids:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(t=>t.data.GetAllUsers))}}return r.\u0275fac=function(e){return new(e||r)(s.\u0275\u0275inject(_.eN),s.\u0275\u0275inject(u._M))},r.\u0275prov=s.\u0275\u0275defineInjectable({token:r,factory:r.\u0275fac,providedIn:"root"}),r})()}}]);