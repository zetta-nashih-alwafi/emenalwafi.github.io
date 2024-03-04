"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[5884],{65884:(g,m,s)=>{s.d(m,{J:()=>u});var p=s(591),o=s(13125),n=s(24850),y=s(94650),c=s(18497),d=s(80529);let u=(()=>{class _{constructor(e,t){this.apollo=e,this.http=t,this.selectedCompanyId=new p.X(""),this.pathCompanyLogo=new p.X(""),this.initCompany=new p.X(!1),this.companyName=new p.X(""),this.companyFilter=new p.X(null),this.refreshCompany=new p.X(!1),this._childrenFormValidationStatus=!0,this.selectedCompanyId$=this.selectedCompanyId.asObservable(),this.pathCompanyLogo$=this.pathCompanyLogo.asObservable(),this.initCompany$=this.initCompany.asObservable(),this.companyName$=this.companyName.asObservable(),this.companyFilter$=this.companyFilter.asObservable(),this.refreshCompany$=this.refreshCompany.asObservable()}setCompanyId(e){this.selectedCompanyId.next(e)}setPathCompany(e){this.pathCompanyLogo.next(e)}setInitCompany(e){this.initCompany.next(e)}setCompanyName(e){this.companyName.next(e)}filterCompany(e){this.companyFilter.next(e)}setRefreshCompany(e){this.initCompany.next(e)}setRefreshEditCompany(e){this.refreshCompany.next(e)}get childrenFormValidationStatus(){return this._childrenFormValidationStatus}set childrenFormValidationStatus(e){this._childrenFormValidationStatus=e}getCompanies(){return this.http.get("assets/data/companies.json")}getEntitiesName(){return["admtc","academic","company","group_of_schools"]}getEntitiesCompany(){return["company"]}getCountries(){return["Albania","Armenia","Austria","Belarus","Belgium","Bolivia","Bosnia and Herzegovina","Croatia","Cyprus","Czech Republic","Denmark","Estonia","Ethiopia","Finland","France","Georgia","Germany","Greece","Greenland","Hungary","Iceland","Ireland","Isle of Man","Israel","Italy","Latvia","Lesotho","Liberia","Liechtenstein","Lithuania","Luxembourg","Maldives","Netherlands","Netherlands","Norway","Poland","Portugal","Romania","Senegal","Serbia and Montenegro","Slovakia","Slovenia","Spain","Sweden","Switzerland","United Kingdom","Venezuela"]}getAllCompanies(e,t,a,i){return this.apollo.query({query:o.ZP`
          query GetAllCompanies(
            $search: String
            $pagination: PaginationInput
            $school_id: ID
            $user_login: EnumCompanyUserLogin
            $filter: CompanyFilterInput
            $sorting: CompanySortInput
          ) {
            GetAllCompanies(
              search: $search
              pagination: $pagination
              school_id: $school_id
              user_login: $user_login
              filter: $filter
              sorting: $sorting
            ) {
              _id
              company_logo
              company_name
              brand
              activity
              type_of_company
              no_RC
              capital
              no_of_employee_in_france
              count_document
              company_addresses {
                address
                postal_code
                city
                country
              }
              company_entity_id{
                company_name
              }
            }
          }
        `,variables:{search:e,pagination:t,filter:a,sorting:i||null},fetchPolicy:"network-only"}).pipe((0,n.U)(r=>r.data.GetAllCompanies))}getAllCompaniesOfAnEntity(e,t){return this.apollo.query({query:o.ZP`
          query GetAllCompanies($search: String, $pagination: PaginationInput, $school_id: ID, $user_login: EnumCompanyUserLogin) {
            GetAllCompanies(search: $search, pagination: $pagination, school_id: $school_id, user_login: $user_login) {
              _id
              company_name
              no_RC
              count_document
              company_addresses {
                address
                postal_code
                city
                country
              }
            }
          }
        `,variables:{search:e,pagination:t},fetchPolicy:"network-only"}).pipe((0,n.U)(a=>a.data.GetAllCompanies))}getAllCompanyEntity(e,t){return this.apollo.query({query:o.ZP`
          query GetAllCompanyEntities($search: String, $pagination: PaginationInput, $school_id: ID, $user_login: EnumCompanyUserLogin) {
            GetAllCompanyEntities(search: $search, pagination: $pagination, school_id: $school_id, user_login: $user_login) {
              _id
              company_name
              no_RC
              count_document
            }
          }
        `,variables:{search:e,pagination:t},fetchPolicy:"network-only"}).pipe((0,n.U)(a=>a.data.GetAllCompanyEntities))}getAllCompaniesDropdown(){return this.apollo.watchQuery({query:o.ZP`
          query GetAllCompaniesDropdown{
            GetAllCompanies {
              _id
              company_name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllCompanies))}RefreshCompany(e){return this.apollo.mutate({mutation:o.ZP`
          mutation RefreshCompany($_id: ID) {
            RefreshCompany(_id: $_id) {
              _id
              company_name
              no_RC
              company_status
              company_name_2
              company_name_3
              company_addresses {
                address
                postal_code
                city
                country
                region
                department
                is_main_address
              }
            }
          }
        `,variables:{_id:e}}).pipe((0,n.U)(t=>t.data.RefreshCompany))}getOneCompany(e){return this.apollo.query({query:o.ZP`
          query GetOneCompany($_id: ID) {
            GetOneCompany(_id: $_id) {
              _id
              company_name
              company_logo
              capital_type
              brand
              activity
              type_of_company
              no_RC
              capital
              no_of_employee_in_france
              no_of_employee_in_france_by_year
              status
              company_status
              created_at
              updated_at
              nic
              company_name_2
              company_name_3
              payroll
              company_addresses {
                address
                postal_code
                city
                country
                region
                department
                is_main_address
              }
              company_entity_id{
                company_name
              }
            }
          }
        `,variables:{_id:e},fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetOneCompany))}getOneCompanyForPayload(e){return this.apollo.query({query:o.ZP`
          query GetOneCompany($_id: ID) {
            GetOneCompany(_id: $_id) {
              company_name
              company_logo
              capital_type
              brand
              activity
              type_of_company
              no_RC
              capital
              no_of_employee_in_france
              company_addresses {
                address
                postal_code
                city
                country
                region
                department
                is_main_address
              }
            }
          }
        `,variables:{_id:e},fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetOneCompany))}getCompanyDropdownList(e){return this.apollo.query({query:o.ZP`
          query GetCompanyDropdownList{
            GetAllCompanies(
              search: "${e}") {
              _id
              company_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetAllCompanies))}getCompanyWithSchool(e,t){return this.apollo.query({query:o.ZP`
          query GetCompanyWithSchool{
            GetAllCompanies(
              school_id:"${t}"
              search: "${e}") {
              _id
              company_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(a=>a.data.GetAllCompanies))}getAllCompanyDropdownList(){return this.apollo.query({query:o.ZP`
          query {
            GetAllCompanies {
              _id
              company_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(e=>e.data.GetAllCompanies))}getAllCompanyByAcadir(e,t,a,i,r){return this.apollo.query({query:o.ZP`
          query GetAllCompanies($school_id: ID, $pagination: PaginationInput) {
            GetAllCompanies(
              school_id: $school_id,
              pagination: $pagination,
              search: "${a}",
              country: "${t}",
              zip_code: "${r}"
              ) {
              _id
              company_logo
              company_name
              brand
              activity
              type_of_company
              no_RC
              capital
              no_of_employee_in_france
              count_document
              company_addresses {
                address
                postal_code
                city
                country
              }
            }
          }
        `,variables:{school_id:e,pagination:i},fetchPolicy:"network-only"}).pipe((0,n.U)(l=>l.data.GetAllCompanies))}getAllCompanyForCheck(e){return this.apollo.query({query:o.ZP`
          query GetAllCompanies($school_id: ID) {
            GetAllCompanies(school_id: $school_id) {
              _id
            }
          }
        `,variables:{school_id:e},fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetAllCompanies))}getAllCompanyBySearch(e,t){return this.apollo.query({query:o.ZP`
          query {
            GetAllCompanies(
              search: "${t}",
              country: "${e}"
            ) {
              _id
              company_logo
              company_name
              brand
              activity
              type_of_company
              no_RC
              capital
              no_of_employee_in_france
              company_addresses {
                address
                postal_code
                city
                country
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(a=>a.data.GetAllCompanies))}getAllCompanyByAdmtc(e,t,a,i){return this.apollo.query({query:o.ZP`
          query GetAllCompanies($pagination: PaginationInput){
            GetAllCompanies(
              search: "${t}",
              country: "${e}",
              pagination: $pagination,
              zip_code: "${i}"
            ) {
              _id
              company_logo
              company_name
              brand
              activity
              type_of_company
              no_RC
              capital
              no_of_employee_in_france
              count_document
              company_addresses {
                address
                postal_code
                city
                country
              }
            }
          }
        `,variables:{pagination:a},fetchPolicy:"network-only"}).pipe((0,n.U)(r=>r.data.GetAllCompanies))}getFilteredZipCode(e,t){return this.apollo.query({query:o.ZP`
      query GetAllZipCodes{
        GetAllZipCodes(zip_code: "${e}", country: "${t}") {
          city
          province
          academy
          department
        }
      }
      `}).pipe((0,n.U)(a=>a.data.GetAllZipCodes))}getCompanyStaff(){return this.apollo.watchQuery({query:o.ZP`
          query {
            GetAllUsers(school: "5a96e37ccdb80b47be7088ec", entity: company) {
              civility
              full_name
              entities {
                companies {
                  _id
                  company_name
                }
                entity_name
                type {
                  name
                }
              }
              status
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllUsers))}getOneMentor(e,t){return this.apollo.watchQuery({query:o.ZP`
          query GetOneUser{
            GetOneUser(
              _id: "${e}"
              email: "${t}"
            ) {
              civility
              first_name
              last_name
              email
              position
              office_phone
              direct_line
              portable_phone
              full_name
              entities {
                companies {
                  _id
                  company_name
                }
                entity_name
                type {
                  _id
                  name
                }
              }
              status
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(a=>a.data.GetOneUser))}getSchoolsByUser(){return this.apollo.watchQuery({query:o.ZP`
          query {
            GetAllSchools(user_login: true, sorting: { short_name: asc }) {
              _id
              short_name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllSchools))}validateCompany(e,t,a){return this.apollo.mutate({mutation:o.ZP`
          mutation ValidateCompany($company_name: String!, $zip_code: String!, $country: String!) {
            ValidateCompany(company_name: $company_name, zip_code: $zip_code, country: $country) {
              message
              companies {
                _id
                company_name
                brand
                activity
                type_of_company
                no_RC
                capital
                no_of_employee_in_france
                company_addresses {
                  address
                  postal_code
                  city
                  country
                }
              }
            }
          }
        `,variables:{company_name:e,zip_code:t,country:a}}).pipe((0,n.U)(i=>i.data.ValidateCompany))}validateMentor(e,t,a,i){return this.apollo.mutate({mutation:o.ZP`
          mutation ValidateMentor($company_id: ID!, $first_name: String!, $last_name: String!, $email: String!) {
            ValidateMentor(company_id: $company_id, first_name: $first_name, last_name: $last_name, email: $email) {
              message
              mentor {
                _id
                email
                civility
                first_name
                last_name
                full_name
                entities {
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
          }
        `,variables:{company_id:e,first_name:t,last_name:a,email:i}}).pipe((0,n.U)(r=>r.data.ValidateMentor))}validateEmailMentor(e,t){return this.apollo.mutate({mutation:o.ZP`
          mutation ValidateMentor($company_id: ID!, $email: String!) {
            ValidateMentor(company_id: $company_id, email: $email) {
              message
              mentor {
                _id
                email
                civility
                first_name
                last_name
                full_name
                direct_line
                office_phone
                portable_phone
                position
                entities {
                  school {
                    _id
                    short_name
                  }
                  assigned_rncp_title {
                    _id
                    short_name
                  }
                  companies {
                    _id
                    company_name
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
          }
        `,variables:{company_id:e,email:t}}).pipe((0,n.U)(a=>a.data.ValidateMentor))}createCompany(e){return this.apollo.mutate({mutation:o.ZP`
          mutation CreateCompany($company_input: CompanyTypeInput) {
            CreateCompany(company_input: $company_input) {
              _id
              company_name
            }
          }
        `,variables:{company_input:e}}).pipe((0,n.U)(t=>t.data.CreateCompany))}updateCompany(e,t){return this.apollo.mutate({mutation:o.ZP`
          mutation UpdateCompany($_id: ID!, $company_input: CompanyTypeInput) {
            UpdateCompany(_id: $_id, company_input: $company_input) {
              _id
              company_name
            }
          }
        `,variables:{_id:e,company_input:t}}).pipe((0,n.U)(a=>a.data.UpdateCompany))}updateCompanyByAcadir(e,t,a,i){return this.apollo.mutate({mutation:o.ZP`
          mutation UpdateCompany($_id: ID!, $company_input: CompanyTypeInput, $update_by_acadir: Boolean, $school_id: ID) {
            UpdateCompany(_id: $_id, company_input: $company_input, update_by_acadir: $update_by_acadir, school_id: $school_id) {
              _id
              company_name
            }
          }
        `,variables:{_id:e,company_input:t,update_by_acadir:a,school_id:i}}).pipe((0,n.U)(r=>r.data.UpdateCompany))}deleteCompany(e){return this.apollo.mutate({mutation:o.ZP`
          mutation DeleteCompany($_id: ID!) {
            DeleteCompany(_id: $_id) {
              _id
              company_name
            }
          }
        `,variables:{_id:e}}).pipe((0,n.U)(t=>t.data.DeleteCompany))}connectSchoolToCompany(e,t){return this.apollo.mutate({mutation:o.ZP`
          mutation ConnectSchoolToCompany($company_id: ID!, $school_ids: [ID]!) {
            ConnectSchoolToCompany(company_id: $company_id, school_ids: $school_ids) {
              _id
              company_name
            }
          }
        `,variables:{company_id:e,school_ids:t}}).pipe((0,n.U)(a=>a.data.ConnectSchoolToCompany))}connectMentorToSchool(e,t,a){return this.apollo.mutate({mutation:o.ZP`
          mutation ConnectMentorToSchool($mentor_ids: [ID]!, $company_id: ID!, $school_ids: [ID]!) {
            ConnectMentorToSchool(mentor_ids: $mentor_ids, company_id: $company_id, school_ids: $school_ids)
          }
        `,variables:{mentor_ids:e,company_id:t,school_ids:a}}).pipe((0,n.U)(i=>i.data.ConnectMentorToSchool))}connectSchoolToMentor(e,t,a){return this.apollo.mutate({mutation:o.ZP`
          mutation ConnectMentorToCompanyAndSchool($mentor_id: ID!, $company_id: ID!, $school_ids: [ID]!) {
            ConnectMentorToCompanyAndSchool(mentor_id: $mentor_id, company_id: $company_id, school_ids: $school_ids) {
              _id
              first_name
            }
          }
        `,variables:{mentor_id:e,company_id:t,school_ids:a}}).pipe((0,n.U)(i=>i.data.ConnectMentorToCompanyAndSchool))}connectSchoolToMentorADMTC(e,t){return this.apollo.mutate({mutation:o.ZP`
          mutation ConnectMentorToCompanyAndSchool($mentor_id: ID!, $company_id: ID!) {
            ConnectMentorToCompanyAndSchool(mentor_id: $mentor_id, company_id: $company_id) {
              _id
              first_name
            }
          }
        `,variables:{mentor_id:e,company_id:t}}).pipe((0,n.U)(a=>a.data.ConnectMentorToCompanyAndSchool))}sendRevisionCompany(e,t,a,i){return this.apollo.mutate({mutation:o.ZP`
          mutation RequestReviseCompany($company_id: ID, $user_login_id: ID, $description: String!, $lang: String) {
            RequestReviseCompany(company_id: $company_id, user_login_id: $user_login_id, description: $description, lang: $lang)
          }
        `,variables:{company_id:e,user_login_id:t,description:a,lang:i}}).pipe((0,n.U)(r=>r.data.RequestReviseCompany))}sendRevisionMentor(e,t,a,i,r){return this.apollo.mutate({mutation:o.ZP`
          mutation RequestReviseMentor($mentor_id: ID, $company_id: ID, $user_login_id: ID, $description: String!, $lang: String) {
            RequestReviseMentor(
              mentor_id: $mentor_id
              company_id: $company_id
              user_login_id: $user_login_id
              description: $description
              lang: $lang
            )
          }
        `,variables:{mentor_id:e,company_id:t,user_login_id:a,description:i,lang:r}}).pipe((0,n.U)(l=>l.data.RequestReviseMentor))}disconnectSchoolFromCompany(e,t){return this.apollo.mutate({mutation:o.ZP`
          mutation DisconnectSchoolFromCompany($company_id: ID!, $school_ids: [ID]!) {
            DisconnectSchoolFromCompany(company_id: $company_id, school_ids: $school_ids) {
              _id
              company_name
            }
          }
        `,variables:{company_id:e,school_ids:t}}).pipe((0,n.U)(a=>a.data.DisconnectSchoolFromCompany))}removeMentorInThisSchool(e,t){return this.apollo.mutate({mutation:o.ZP`
          mutation {
            DeleteMentorFromCompany(mentor_ids: "${t}", company_id: "${e}") {
              _id
              first_name
            }
          }
        `}).pipe((0,n.U)(a=>a.data.DeleteMentorFromCompany))}removeMentorInThisCompany(e,t){return this.apollo.mutate({mutation:o.ZP`
          mutation DeleteMentorFromCompany{
            DeleteMentorFromCompany(mentor_ids: "${t}", company_id: "${e}")
          }
        `}).pipe((0,n.U)(a=>a.data.DeleteMentorFromCompany))}getAllMentor(e){return this.apollo.query({query:o.ZP`
        query GetAllMentor{
          GetAllUsers(
            company: "${e}"
            ) {
            _id
            civility
            first_name
            last_name
            full_name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetAllUsers))}getOneMentorId(e){return this.apollo.query({query:o.ZP`
        query GetOneUser{
          GetOneUser (
            email:"${e}"
          ) {
            _id
            email
            first_name
            last_name
            civility
            entities {
              entity_name
              companies {
                _id
              }
              type {
                _id
                name
              }
            }
            position
            direct_line
            office_phone
            portable_phone
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetOneUser))}populateDataMentor(e,t){return this.apollo.query({query:o.ZP`
        query PopulateDataMentor{
          GetAllUsers(
            company_staff: true
            company: "${e}"
            company_schools: "${t}"
            ) {
            _id
            civility
            first_name
            last_name
            full_name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,n.U)(a=>a.data.GetAllUsers))}getAllUserInStaffCompany(e,t,a,i){return this.apollo.query({query:o.ZP`
        query GetAllUsers($pagination: PaginationInput, $sorting: UserSorting){
          GetAllUsers(
            company_staff: true,
            ${i}
            company: "${e}",
            pagination: $pagination,
            sorting: $sorting
            ) {
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
      `,variables:{pagination:t,sorting:a||{}},fetchPolicy:"network-only"}).pipe((0,n.U)(r=>r.data.GetAllUsers))}getAllUserInStaffCompanyByAcadir(e,t,a,i,r,l,C=!1){return this.apollo.query({query:o.ZP`
        query GetAllUsers($pagination: PaginationInput, $sorting: UserSorting, $company_schools: [ID], $user_type: [ID!], $company_staff: Boolean){
          GetAllUsers(
            ${r}
            company: "${t}",
            company_schools: $company_schools,
            user_type: $user_type,
            pagination: $pagination,
            sorting: $sorting
            company_staff: $company_staff
            ) {
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
      `,variables:{pagination:a,sorting:i||{},company_schools:e,user_type:l||null,company_staff:C},fetchPolicy:"network-only"}).pipe((0,n.U)($=>$.data.GetAllUsers))}getOneUserInStaffCompany(e){return this.apollo.query({query:o.ZP`
        query GetOneUser{
          GetOneUser(_id: "${e}") {
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
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetOneUser))}getAllUserInStaffCompanyByAcadirNoPagination(e,t){return this.apollo.query({query:o.ZP`
        query GetAllUsers($company_schools: [ID]){
          GetAllUsers(
            company_staff: true,
            company: "${t}",
            company_schools: $company_schools,
            ) {
            _id
          }
        }
      `,variables:{company_schools:e},fetchPolicy:"network-only"}).pipe((0,n.U)(a=>a.data.GetAllUsers))}getAllSchools(e,t,a,i){return this.apollo.query({query:o.ZP`
      query GetAllSchools($page: PaginationInput, $sort: SchoolSorting) {
        GetAllSchools(
          ${i}
          company: "${e}"
          pagination: $page
          sorting: $sort
          ) {
          _id
          short_name
          school_address {
            city
            is_main_address
          }
          preparation_center_ats {
            rncp_title_id {
              _id
              short_name
              classes {
                _id
                name
              }
            }
          }
          certifier_ats {
            _id
            short_name
            classes {
              _id
              name
            }
          }
          count_document
        }
      }
      `,variables:{page:t,sort:a||{}},fetchPolicy:"network-only"}).pipe((0,n.U)(r=>r.data.GetAllSchools))}getSchoolsByCompanyId(e){return this.apollo.query({query:o.ZP`
      query GetSchoolByCompanyId($page: PaginationInput) {
        GetAllSchools(
          company: "${e}"
          pagination: $page
          ) {
          _id
          short_name
          count_document
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetAllSchools))}getAllSchoolsDropdown(){return this.apollo.watchQuery({query:o.ZP`
          query GetAllSchoolsDropdown{
            GetAllSchools(sorting: { short_name: asc }) {
              _id
              short_name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(e=>e.data.GetAllSchools))}GetAllTitleDropdownList(e){return this.apollo.query({query:o.ZP`
        query {
          GetTitleDropdownList(school_id: "${e}") {
            _id
            short_name
            specializations {
              _id
              name
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetTitleDropdownList))}getClassesByTitle(e){return this.apollo.query({query:o.ZP`
        query {
          GetAllClasses(rncp_id: "${e}", sorting: { name: asc}) {
            _id
            name
          }
        }
      `}).pipe((0,n.U)(t=>t.data.GetAllClasses))}getOneSchool(e,t,a,i){return this.apollo.query({query:o.ZP`
      query GetAllSchools($page: PaginationInput, $sort: SchoolSorting) {
        GetAllSchools(
          ${i}
          school: "${e}"
          pagination: $page
          sorting: $sort
          ) {
          _id
          short_name
          school_address {
            city
            is_main_address
          }
          preparation_center_ats {
            rncp_title_id {
              _id
              short_name
              classes {
                _id
                name
              }
            }
          }
          certifier_ats {
            _id
            short_name
          }
          count_document
        }
      }
      `,variables:{page:t,sort:a||{}},fetchPolicy:"network-only"}).pipe((0,n.U)(r=>r.data.GetAllSchools))}getSchoolByAcadit(e){return this.apollo.query({query:o.ZP`
      query {
        GetAllSchools(school: "${e}") {
            _id
            short_name
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetAllSchools))}getUserTypesByEntity(e){return this.apollo.watchQuery({query:o.ZP`
        query GetUserTypesByEntity{
          GetAllUserTypes(entity: "${e}") {
            _id
            name
          }
        }
      `,fetchPolicy:"network-only"}).valueChanges.pipe((0,n.U)(t=>t.data.GetAllUserTypes))}getCountry(){return this.apollo.query({query:o.ZP`
      query GetAllCountries {
        GetAllCountries {
          _id
          country
          country_code
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,n.U)(e=>{if(Array.isArray(e.data.GetAllCountries)){let t=e.data.GetAllCountries;return t=t.map(i=>({name:i?.country,code:i?.country_code})),t.filter(i=>i?.name)}return[]}))}GetOneCompanyEntity(e){return this.apollo.query({query:o.ZP`
          query GetOneCompanyEntity($_id: ID!) {
            GetOneCompanyEntity(_id: $_id) {
              _id
              denomination
              company_name
              no_RC
              status
              company_status
              no_rc_of_head_office
              activity
              activity_branch
              slice_of_salaried_workforce_branch
              type_of_company
              type_of_company_by_year
              created_at
              updated_at
              no_of_employee_in_france
              no_of_employee_in_france_by_year
              slice_of_salary
              nic
              slice_of_salaried_workforce
              slice_of_salaried_workforce_by_year
              created_at_of_head_office
              updated_at_of_head_office
              no_rc_of_head_office
              company_branches_id {
                legal_status
              }
              company_addresses {
                address
                postal_code
                city
                country
                region
                department
                is_main_address
              }
            }
          }
        `,variables:{_id:e},fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetOneCompanyEntity))}GetAllBranchesOfCompanyEntity(e){return this.apollo.query({query:o.ZP`
          query GetOneCompanyEntity($_id: ID!) {
            GetOneCompanyEntity(_id: $_id) {
              _id
              company_branches_id {
                _id
                company_name
                no_RC
                company_addresses {
                  address
                  is_main_address
                }
                count_document
              }
            }
          }
        `,variables:{_id:e},fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetOneCompanyEntity))}GetAllCompanyNotes(e){return this.apollo.query({query:o.ZP`
          query GetAllCompanyNotes($filter: CompanyNoteFilterInput) {
            GetAllCompanyNotes(filter: $filter) {
              _id
              company_id {
                _id
                company_name
              }
              company_entity_id {
                _id
                company_name
              }
              created_by {
                civility
                first_name
                last_name
                profile_picture
              }
              subject
              note
              is_reply
              category
              date_created
              tagged_user_ids {
                _id
                civility
                first_name
                last_name
              }
              reply_note_ids {
                _id
                company_id {
                  _id
                  company_name
                }
                created_by {
                  _id
                  civility
                  first_name
                  last_name
                  profile_picture
                }
                subject
                note
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
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetAllCompanyNotes))}GetAllCompanyNoteCategories(){return this.apollo.query({query:o.ZP`
          query GetAllCompanyNoteCategories {
            GetAllCompanyNoteCategories
          }
        `,fetchPolicy:"network-only"}).pipe((0,n.U)(e=>e.data.GetAllCompanyNoteCategories))}CreateCompanyNote(e){return this.apollo.mutate({mutation:o.ZP`
          mutation CreateCompanyNote($company_note_input: CompanyNoteInput) {
            CreateCompanyNote(company_note_input: $company_note_input) {
              _id
            }
          }
        `,variables:{company_note_input:e}}).pipe((0,n.U)(t=>t.data.CreateCompanyNote))}GetOneCompanyNote(e){return this.apollo.query({query:o.ZP`
          query GetOneCompanyNote($_id: ID!) {
            GetOneCompanyNote(_id: $_id) {
              _id
              subject
              note
              category
              date_created
              reply_note_ids {
                _id
                subject
                note
                category
                date_created
                created_by {
                  first_name
                  last_name
                }
                tagged_user_ids {
                  _id
                  first_name
                  last_name
                }
              }
              created_by {
                first_name
                last_name
              }
              tagged_user_ids {
                _id
                first_name
                last_name
              }
            }
          }
        `,variables:{_id:e},fetchPolicy:"network-only"}).pipe((0,n.U)(t=>t.data.GetOneCompanyNote))}UpdateCompanyNote(e,t){return this.apollo.mutate({mutation:o.ZP`
          mutation UpdateCompanyNote($_id: ID!, $company_note_input: CompanyNoteInput) {
            UpdateCompanyNote(_id: $_id, company_note_input: $company_note_input) {
              _id
            }
          }
        `,variables:{company_note_input:t,_id:e}}).pipe((0,n.U)(a=>a.data.UpdateCompanyNote))}DeleteCompanyNote(e){return this.apollo.mutate({mutation:o.ZP`
          mutation DeleteCompanyNote($_id: ID!) {
            DeleteCompanyNote(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:e}}).pipe((0,n.U)(t=>t.data.DeleteCompanyNote))}GetCompanyCaseBySiret(e,t,a){return this.apollo.query({query:o.ZP`
          query GetCompanyEtalabBySiret($siret: String, $country: String, $school_id: ID) {
            GetCompanyEtalabBySiret(siret: $siret, country: $country, school_id: $school_id) {
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
        `,variables:{siret:e,country:t,school_id:a},fetchPolicy:"network-only"}).pipe((0,n.U)(i=>i.data.GetCompanyEtalabBySiret))}CreateCompanyByCases(e,t,a,i,r){return this.apollo.mutate({mutation:o.ZP`
          mutation CreateCompanyByCases(
            $message: String
            $company_branch_id: ID
            $company_entity_id: ID
            $school_to_connect: ID
            $companies: [CompanyEtalabBranchEntityInput]
          ) {
            CreateCompanyByCases(
              message: $message
              company_branch_id: $company_branch_id
              company_entity_id: $company_entity_id
              school_to_connect: $school_to_connect
              companies: $companies
            ) {
              _id
            }
          }
        `,variables:{message:e,company_branch_id:t,company_entity_id:a,school_to_connect:i,companies:r}}).pipe((0,n.U)(l=>l.data.CreateCompanyByCases))}validateCompanyNonFrance(e,t){return this.apollo.mutate({mutation:o.ZP`
          mutation ValidateCompanyNonFrance($company_name: String!, $zip_code: String!) {
            ValidateCompanyNonFrance(company_name: $company_name, zip_code: $zip_code) {
              message
              companies {
                _id
                company_name
                brand
                activity
                type_of_company
                no_RC
                capital
                no_of_employee_in_france
                company_addresses {
                  address
                  postal_code
                  city
                  country
                }
              }
            }
          }
        `,variables:{company_name:e,zip_code:t}}).pipe((0,n.U)(a=>a.data.ValidateCompanyNonFrance))}ImportCompanyData(e,t,a){return this.apollo.mutate({mutation:o.ZP`
          mutation ImportCompanyData($companyInput: ImportCompanyInput!, $file: Upload!, $lang: String,$user_type_id: ID) {
            ImportCompanyBySiret(import_company_input: $companyInput, file: $file, lang: $lang, user_type_id: $user_type_id)
          }
        `,variables:{file:t,companyInput:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr",user_type_id:a||null},context:{useMultipart:!0}}).pipe((0,n.U)(i=>i.data.ImportCompanyBySiret))}importCountryAndNationality(e,t){return this.apollo.mutate({mutation:o.ZP`
          mutation ImportCountryNationality($delimiter: String!, $file: Upload!, $lang: String) {
            ImportCountryNationality(delimiter: $delimiter, file: $file, lang: $lang)
          }
        `,variables:{file:t,delimiter:e?.file_delimeter?e?.file_delimeter:"",lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},context:{useMultipart:!0}}).pipe((0,n.U)(a=>a.data.ImportCountryNationality))}}return _.\u0275fac=function(e){return new(e||_)(y.\u0275\u0275inject(c._M),y.\u0275\u0275inject(d.eN))},_.\u0275prov=y.\u0275\u0275defineInjectable({token:_,factory:_.\u0275fac,providedIn:"root"}),_})()}}]);