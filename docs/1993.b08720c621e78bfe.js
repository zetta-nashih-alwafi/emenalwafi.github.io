"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[1993,4318],{83481:(y,p,u)=>{u.d(p,{k:()=>c});var i=u(13125),a=u(24850),_=u(94650),d=u(18497),m=u(80529);let c=(()=>{class o{constructor(e,t){this.apollo=e,this.http=t}getCompanies(){return this.http.get("assets/data/companies.json")}getEntitiesName(){return["admtc","academic","company","group_of_schools"]}getEntitiesCompany(){return["company"]}getCountries(){return["Albania","Armenia","Austria","Belarus","Belgium","Bolivia","Bosnia and Herzegovina","Croatia","Cyprus","Czech Republic","Denmark","Estonia","Ethiopia","Finland","France","Georgia","Germany","Greece","Greenland","Hungary","Iceland","Ireland","Isle of Man","Israel","Italy","Latvia","Lesotho","Liberia","Liechtenstein","Lithuania","Luxembourg","Maldives","Netherlands","Netherlands","Norway","Poland","Portugal","Romania","Senegal","Serbia and Montenegro","Slovakia","Slovenia","Spain","Sweden","Switzerland","United Kingdom","Venezuela"]}getAllAlumni(){return this.apollo.watchQuery({query:i.ZP`
          query {
            GetAllAlumni {
              _id
              pro_tel
              per_tel
              student_id {
                first_name
                last_name
                civility
                first_name_used
                last_name_used
                is_photo_in_s3
                photo
                photo_s3_path
                email
                professional_email
              }
              civility
              first_name
              used_first_name
              last_name
              used_last_name
              email
              city
              country
              phone_number
              professional_email
              professional_phone_number
              promo_year
              school
              campus
              speciality
              professional_status
              company
              activity_sector
              job_name
              alumni_survey_id {
                _id
              }
              created_by
              updated_by
              status
              count_document
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllAlumni))}getAllAlumniFollowUp(e,t,l,r){return this.apollo.watchQuery({query:i.ZP`
        query GetAllAlumni($user_type_ids: [ID], $pagination: PaginationInput, $sort: AlumniSortingInput) {
          GetAllAlumni(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${l}) {
            _id
            last_survey_completed
            rncp_title
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
            updated_at
            email
            professional_email
            date_of_birth
            civility
            first_name
            used_first_name
            last_name
            used_last_name
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
            alumni_survey_process_ids {
              _id
              form_builder_id {
                _id
                form_builder_name
              }
            }
            email_status
              count_document
            }
          }
        `,variables:{user_type_ids:r,pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(s=>s.data.GetAllAlumni))}getAllAlumniFollowUpCheckbox(e,t,l,r){return this.apollo.watchQuery({query:i.ZP`
        query GetAllAlumni($user_type_ids: [ID], $pagination: PaginationInput, $sort: AlumniSortingInput) {
          GetAllAlumni(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${l}) {
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
            updated_at
            email
            professional_email
            date_of_birth
            civility
            first_name
            used_first_name
            last_name
            used_last_name
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
            alumni_survey_process_ids {
              _id
              form_builder_id {
                _id
                form_builder_name
              }
            }
            email_status
            count_document
          }
        }
        `,variables:{user_type_ids:r,pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(s=>s.data.GetAllAlumni))}getAllAlumniForExportCheckbox(e,t,l,r){return this.apollo.watchQuery({query:i.ZP`
        query GetAllAlumni($user_type_ids: [ID], $pagination: PaginationInput, $sort: AlumniSortingInput) {
          GetAllAlumni(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${l}) {
            _id
          }
        }
        `,variables:{user_type_ids:r,pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(s=>s.data.GetAllAlumni))}getAllAlumniForSurveyCheckbox(e,t,l,r){return this.apollo.watchQuery({query:i.ZP`
        query GetAllAlumni($user_type_ids: [ID], $pagination: PaginationInput, $sort: AlumniSortingInput) {
          GetAllAlumni(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${l}) {
            _id
          }
        }
        `,variables:{user_type_ids:r,pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(s=>s.data.GetAllAlumni))}getAllAlumniTrombinoscope(e){return this.apollo.watchQuery({query:i.ZP`
          query GetAllAlumni($pagination: PaginationInput) {
            GetAllAlumni(pagination: $pagination) {
              _id
              student_id {
                first_name
                last_name
                civility
                first_name_used
                last_name_used
                student_address {
                  city_of_birth
                  country_of_birth
                }
                email
                professional_email
              }
              date_of_birth
              civility
              first_name
              used_first_name
              last_name
              used_last_name
              email
              city
              country
              phone_number
              professional_email
              professional_phone_number
              promo_year
              school
              campus
              speciality
              professional_status
              company
              activity_sector
              job_name
              alumni_survey_id {
                _id
              }
              pro_tel
              per_tel
              updated_at
              updated_by
              status
              count_document
              promo_name
              master
              master_promo
              personal_postcode
              personal_address
            }
          }
        `,variables:{pagination:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllAlumni))}getAllAlumniTrombinoscopeAlumni(e,t){return this.apollo.watchQuery({query:i.ZP`
          query GetAllAlumni($pagination: PaginationInput) {
            GetAllAlumni(pagination: $pagination, ${t}) {
              _id
              student_id {
                first_name
                last_name
                civility
                first_name_used
                last_name_used
                student_address {
                  city_of_birth
                  country_of_birth
                }
                email
                professional_email
              }
              date_of_birth
              civility
              first_name
              used_first_name
              last_name
              used_last_name
              email
              city
              country
              phone_number
              professional_email
              professional_phone_number
              promo_year
              school
              campus
              speciality
              professional_status
              company
              activity_sector
              job_name
              alumni_survey_id {
                _id
              }
              pro_tel
              per_tel
              updated_at
              updated_by
              status
              count_document
              promo_name
              master
              master_promo
              personal_postcode
              personal_address
            }
          }
        `,variables:{pagination:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(l=>l.data.GetAllAlumni))}getOneAlumni(e){return this.apollo.watchQuery({query:i.ZP`
          query {
            GetOneAlumni(_id:"${e}") {
              _id
              student_id {
                first_name
                last_name
                civility
                first_name_used
                last_name_used
                email
                tele_phone
              }
              civility
              pro_tel
              per_tel
              first_name
              used_first_name
              last_name
              used_last_name
              email
              city
              country
              phone_number
              professional_email
              professional_phone_number
              promo_year
              school
              campus
              speciality
              professional_status
              company
              activity_sector
              job_name
              alumni_survey_id {
                _id
                photo
              }
              created_by
              updated_by
              status
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(t=>t.data.GetOneAlumni))}getOneAlumniByStudent(e){return this.apollo.watchQuery({query:i.ZP`
          query {
            GetOneAlumni(student_id:"${e}") {
              _id
              student_id {
                first_name
                last_name
                civility
                first_name_used
                last_name_used
                email
                tele_phone
              }
              civility
              pro_tel
              per_tel
              first_name
              used_first_name
              last_name
              used_last_name
              email
              city
              country
              phone_number
              professional_email
              professional_phone_number
              promo_year
              school
              campus
              speciality
              professional_status
              company
              activity_sector
              job_name
              alumni_survey_id {
                _id
                photo
              }
              created_by
              updated_by
              status
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(t=>t.data.GetOneAlumni))}getAllAlumniMember(e,t,l){return this.apollo.watchQuery({query:i.ZP`
        query GetAllUsers($pagination: PaginationInput, $sort: UserSorting) {
          GetAllUsers(pagination: $pagination, sorting: $sort, ${l}, user_type: "60b4421aa16cc71e0c37132d") {
            _id
            first_name
            civility
            last_name
            entities {
              entity_name
              candidate_school
              type {
                name
                _id
              }
            }
            user_status
            email
            portable_phone
              count_document
            }
          }
        `,variables:{pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(r=>r.data.GetAllUsers))}UpdateAlumni(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateAlumni($alumni_input: AlumniInput, $_id: ID!) {
            UpdateAlumni(alumni_input: $alumni_input, _id: $_id) {
              _id
            }
          }
        `,variables:{_id:t,alumni_input:e}}).pipe((0,a.U)(l=>l.data.UpdateAlumni))}getOneAlumniDetail(e){return this.apollo.watchQuery({query:i.ZP`
        query GetOneAlumniDetail {
          GetOneAlumni(_id: "${e}") {
            _id
            civility
            first_name
            last_name
            used_last_name
            promo_year
            school {
              _id
            }
            campus {
              _id
            }
            sector {
              _id
            }
            speciality {
              _id
            }
            date_of_birth
            email
            personal_address
            personal_postcode
            country
            city
            department
            region
            professional_status
            company
            activity_sector
            job_name
            phone_number
            # rncp_title
            user_id {
              _id
            }
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(t=>t.data.GetOneAlumni))}getOneAlumniSurveyDetail(e){return this.apollo.watchQuery({query:i.ZP`
        query GetOneAlumni {
          GetOneAlumni(_id: "${e}") {
            _id
            alumni_survey_process_ids {
              _id
              date_sent {
                date
                time
              }
              survey_status
              name
              form_builder_id {
                _id
                form_builder_name
              }
            }
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(t=>t.data.GetOneAlumni))}getOneAlumniSurvey(e){return this.apollo.watchQuery({query:i.ZP`
        query {
          GetOneAlumniSurvey(_id: "${e}") {
            _id
            civility
            first_name
            used_first_name
            last_name
            used_last_name
            promo_year
            school
            campus
            speciality
            email
            phone_number
            photo
            city
            country
            is_working
            siret
            company
            company_activity
            job_occupied
            professional_phone_number
            professional_email
            define_school_efap
            is_following_social_media
            is_allow_receive_newsletter
            email_newsletter
            alumni_id {
              _id
            }
            status
            pro_postcode
            pro_sector_precise
            pro_city
            pro_country
            date_of_birth
            com_sur_mail_pro
            com_sur_mail_perso
            created_by
            created_at
            master
            master_promo
            dead
            promo_name
            mentor
            personal_address
            personal_postcode
            pro_tel
            per_tel
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(t=>t.data.GetOneAlumniSurvey))}SendAlumniSurvey(e){return this.apollo.mutate({mutation:i.ZP`
          mutation SendAlumniSurvey($alumni_survey_inputs: [AlumniSurveyInput]) {
            SendAlumniSurvey(alumni_survey_inputs: $alumni_survey_inputs) {
              _id
            }
          }
        `,variables:{alumni_survey_inputs:e}}).pipe((0,a.U)(t=>t.data.SendAlumniSurvey))}UpdateAlumniSurvey(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateAlumniSurvey($alumni_survey_input: AlumniSurveyInput, $_id: ID!) {
            UpdateAlumniSurvey(alumni_survey_input: $alumni_survey_input, _id: $_id) {
              _id
            }
          }
        `,variables:{_id:t,alumni_survey_input:e}}).pipe((0,a.U)(l=>l.data.UpdateAlumniSurvey))}SendAlumniN1Notification(e,t,l){return this.apollo.mutate({mutation:i.ZP`
          mutation SendAlumniN1Notification($_id: [ID!], $form_builder_id: ID, $user_type_id: ID) {
            SendAlumniN1Notification(_id: $_id, form_builder_id: $form_builder_id, user_type_id: $user_type_id)
          }
        `,variables:{_id:e,form_builder_id:t,user_type_id:l}}).pipe((0,a.U)(r=>r.data.SendAlumniN1Notification))}createAlumniHistory(e){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateAlumniHistory($alumni_history_input: AlumniHistoryInput) {
            CreateAlumniHistory(alumni_history_input: $alumni_history_input) {
              _id
            }
          }
        `,variables:{alumni_history_input:e}}).pipe((0,a.U)(t=>t.data.CreateAlumniHistory))}CreateAlumni(e){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateAlumni($alumni_input: AlumniInput) {
            CreateAlumni(alumni_input: $alumni_input) {
              _id
            }
          }
        `,variables:{alumni_input:e}}).pipe((0,a.U)(t=>t.data.CreateAlumni))}getAllAlumniHistory(e,t,l){return this.apollo.watchQuery({query:i.ZP`
        query GetAllAlumniHistories($pagination: PaginationInput) {
          GetAllAlumniHistories(pagination: $pagination, ${t}, alumni_id: "${l}") {
            _id
            history_date
            history_time
            action
            description
            who {
              first_name
              last_name
              civility
            }
            status
            alumni_id {
              _id
              updated_at
            }
            count_document
          }
        }
        `,variables:{pagination:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(r=>r.data.GetAllAlumniHistories))}getAllAlumniHistoryDetail(e,t,l,r){return this.apollo.watchQuery({query:i.ZP`
        query GetAllAlumniHistories($pagination: PaginationInput, $sorting: AlumniHistorySortingInput, $lang: String) {
          GetAllAlumniHistories(pagination: $pagination, ${t}, alumni_id: "${l}", sorting: $sorting, lang: $lang) {
            _id
            history_date
            history_time
            action
            description
            who {
              first_name
              last_name
              civility
            }
            status
            alumni_id {
              _id
              updated_at
            }
            count_document
          }
        }
        `,variables:{pagination:e,sorting:r||{},lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(s=>s.data.GetAllAlumniHistories))}getAllAlumniHistoryCheckbox(e,t,l,r){return this.apollo.watchQuery({query:i.ZP`
        query GetAllAlumniHistories($pagination: PaginationInput, $sorting: AlumniHistorySortingInput, ) {
          GetAllAlumniHistories(pagination: $pagination, ${t}, alumni_id: "${l}", sorting: $sorting) {
            _id
            history_date
            history_time
            action
            description
            who {
              first_name
              last_name
              civility
            }
            status
            alumni_id {
              _id
              updated_at
            }
            count_document
          }
        }
        `,variables:{pagination:e,sorting:r||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(s=>s.data.GetAllAlumniHistories))}GetAllAlumniPromoYear(){return this.apollo.watchQuery({query:i.ZP`
          query GetAllAlumniPromoYear {
            GetAllAlumniPromoYear
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllAlumniPromoYear))}GetAllAlumniSchool(){return this.apollo.watchQuery({query:i.ZP`
          query GetAllAlumniSchool {
            GetAllAlumniSchoolDropdown{
              _id
              short_name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllAlumniSchoolDropdown))}GetAllAlumniCampus(){return this.apollo.watchQuery({query:i.ZP`
          query GetAllAlumniCampus {
            GetAllAlumniCampusDropdown
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllAlumniCampusDropdown))}GetAllAlumniFiliere(){return this.apollo.watchQuery({query:i.ZP`
          query {
            GetAllAlumniFiliere
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllAlumniFiliere))}GetAllAlumniSector(){return this.apollo.watchQuery({query:i.ZP`
          query GetAllAlumniSector {
            GetAllAlumniSectorDropdown{
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllAlumniSectorDropdown))}GetAllAlumniSpeciality(){return this.apollo.watchQuery({query:i.ZP`
          query GetAllAlumniSpeciality{
            GetAllAlumniSpecialityDropdown{
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllAlumniSpecialityDropdown))}GetAllAlumniCity(){return this.apollo.watchQuery({query:i.ZP`
          query GetAllAlumniCity{
            GetAllAlumniCityDropdown
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllAlumniCityDropdown))}GetAllAlumniCountry(){return this.apollo.watchQuery({query:i.ZP`
          query GetAllAlumniCountry{
            GetAllAlumniCountryDropdown
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllAlumniCountryDropdown))}GetAllAlumniCompany(){return this.apollo.watchQuery({query:i.ZP`
          query GetAllAlumniCompany{
            GetAllAlumniCompanyDropdown
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllAlumniCompanyDropdown))}GetAllAlumniSurveySender(){return this.apollo.watchQuery({query:i.ZP`
          query GetAllAlumniSurveySender{
            GetAllAlumniSenderSurveyDropdown{
              _id
              civility
              first_name
              last_name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllAlumniSenderSurveyDropdown))}getAllSpecializations(e){return this.apollo.watchQuery({query:i.ZP`
          query GetAllSpecializations($sectorId: ID) {
            GetAllSpecializations(filter: {sector: $sectorId}){
              _id
              name
            }
          }
        `,fetchPolicy:"network-only",variables:{sectorId:e}}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllSpecializations))}getAllSpecialities(e){return this.apollo.watchQuery({query:i.ZP`
          query GetAllSpecializations($filter: SpecializationFilterInput) {
            GetAllSpecializations(filter: $filter){
              _id
              name
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e}}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllSpecializations))}getAllSectors(e){return this.apollo.watchQuery({query:i.ZP`
          query GetAllSectors($filter: SectorFilterInput) {
            GetAllSectors(filter: $filter) {
              _id
              name
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllSectors))}getAllCandidateSchool(e){return this.apollo.watchQuery({query:i.ZP`
          query GetAllCandidateSchool($user_type_id: ID){
            GetAllCandidateSchool(user_type_id: $user_type_id) {
              _id
              short_name
              campuses {
                _id
                name
              }
            }
          }
        `,variables:{user_type_id:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllCandidateSchool))}GetAllAlumniComments(e){return this.apollo.watchQuery({query:i.ZP`
          query GetAllAlumniComments($filter: AlumniCommentFilterInput) {
            GetAllAlumniComments(filter: $filter) {
              _id
              alumni_id {
                _id
                first_name
                last_name
                civility
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
                alumni_id {
                  _id
                  first_name
                  last_name
                  civility
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
                alumni_id {
                  _id
                  first_name
                  last_name
                  civility
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
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllAlumniComments))}GetOneAlumniComment(e){return this.apollo.watchQuery({query:i.ZP`
          query GetOneAlumniComment($_id: ID!) {
            GetOneAlumniComment(_id: $_id) {
              _id
              alumni_id {
                _id
                first_name
                last_name
                civility
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
                alumni_id {
                  _id
                  first_name
                  last_name
                  civility
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
                alumni_id {
                  _id
                  first_name
                  last_name
                  civility
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
        `,variables:{_id:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(t=>t.data.GetOneAlumniComment))}GetAllAlumniCommentCategories(){return this.apollo.watchQuery({query:i.ZP`
          query GetAllAlumniCommentCategories{
            GetAllAlumniCommentCategories
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllAlumniCommentCategories))}CreateAlumniComment(e){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateAlumniComment($alumni_comment_input: AlumniCommentInput) {
            CreateAlumniComment(alumni_comment_input: $alumni_comment_input) {
              _id
            }
          }
        `,variables:{alumni_comment_input:e}}).pipe((0,a.U)(t=>t.data.CreateAlumniComment))}UpdateAlumniComment(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateAlumniComment($_id: ID!, $alumni_comment_input: AlumniCommentInput) {
            UpdateAlumniComment(_id: $_id, alumni_comment_input: $alumni_comment_input) {
              _id
            }
          }
        `,variables:{_id:e,alumni_comment_input:t}}).pipe((0,a.U)(l=>l.data.UpdateAlumniComment))}DeleteAlumniComment(e){return this.apollo.mutate({mutation:i.ZP`
          mutation DeleteAlumniComment($_id: ID!) {
            DeleteAlumniComment(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:e}}).pipe((0,a.U)(t=>t.data.DeleteAlumniComment))}GetAlumniCommentsFilterList(e){return this.apollo.watchQuery({query:i.ZP`
          query GetAllAlumniComments($filter: AlumniCommentFilterInput) {
            GetAllAlumniComments(filter: $filter) {
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
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllAlumniComments))}GetAllAlumniCampusBySchool(e){return this.apollo.watchQuery({query:i.ZP`
          query GetAllAlumniCampusDropdown($filter: AlumniCampusDropdownFilterInput) {
            GetAllAlumniCampusDropdown(filter: $filter)
          }
        `,fetchPolicy:"network-only",variables:{filter:e}}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllAlumniCampusDropdown))}GetAllAlumniSectorByCampus(e){return this.apollo.watchQuery({query:i.ZP`
          query GetAllAlumniSectorDropdown($filter: AlumniSectorDropdownFilterInput) {
            GetAllAlumniSectorDropdown(filter: $filter){
              _id
              name
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e}}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllAlumniSectorDropdown))}GetAllAlumniSpecialityBySector(e){return this.apollo.watchQuery({query:i.ZP`
          query GetAllAlumniSpecialityDropdown($filter: AlumniSpecialityDropdownFilterInput) {
            GetAllAlumniSpecialityDropdown(filter: $filter){
              _id
              name
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e}}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllAlumniSpecialityDropdown))}}return o.\u0275fac=function(e){return new(e||o)(_.\u0275\u0275inject(d._M),_.\u0275\u0275inject(m.eN))},o.\u0275prov=_.\u0275\u0275defineInjectable({token:o,factory:o.\u0275fac,providedIn:"root"}),o})()},34318:(y,p,u)=>{function _(n){return n&&n.value&&"string"==typeof n.value&&!n.value.replace(/\s/g,"").length&&n.setValue(""),null}function o(n){const e=n&&n.value&&"string"==typeof n.value&&!n.value.replace(/\s/g,"").length;return e&&n.setValue(""),e?{whitespace:!0}:null}u.d(p,{I8:()=>_,Zx:()=>o})},83515:(y,p,u)=>{u.d(p,{w:()=>d});var i=u(15439),_=u(94650);let d=(()=>{class m{transform(o,n){return o?i(o,"HH:mm").add(-i().utcOffset(),"m").format("HH:mm"):""}transformDate(o,n){return o?i(o+n,"DD/MM/YYYYHH:mm").add(-i().utcOffset(),"m").format("DD/MM/YYYY"):""}transformDateTime(o,n){return o?i(o+n,"DD/MM/YYYYHH:mm").add(-i().utcOffset(),"m").format("DD/MM/YYYYHH:mm"):""}transformJavascriptDate(o){if(o){const n=i(o).format("DD/MM/YYYY"),e=i(o).format("HH:mm"),t=i(n+e,"DD/MM/YYYYHH:mm").add(-i().utcOffset(),"m");return{date:t.format("DD/MM/YYYY"),time:t.format("HH:mm")}}return""}}return m.\u0275fac=function(o){return new(o||m)},m.\u0275pipe=_.\u0275\u0275definePipe({name:"parseLocalToUtc",type:m,pure:!0}),m})()}}]);