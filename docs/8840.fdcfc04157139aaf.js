"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[8840],{58840:(f,h,s)=>{s.d(h,{E:()=>d});var i=s(591),m=s(24742),o=s(13125),l=s(24850),_=s(94650),y=s(80529),S=s(18497);class d{constructor(e,t){this.httpClient=e,this.apollo=t,this.selectedRncpTitleIdSource=new i.X(""),this.selectedClassIdSource=new i.X(""),this.selectedStudentId=new i.X(""),this.selectedRncpTitleId$=this.selectedRncpTitleIdSource.asObservable(),this.selectedClassId$=this.selectedClassIdSource.asObservable(),this.selectedStudentId$=this.selectedStudentId.asObservable(),this.studentData=new i.X(null),this.studentDataIdentity=new i.X(null),this.studentDataParents=new i.X(null),this.studentDataCompany=new i.X(null),this.studentAddress=new i.X(null),this.selectedDataStudent$=this.studentData.asObservable(),this.selectedDataStudentIdentity$=this.studentDataIdentity.asObservable(),this.selectedDataStudentParents$=this.studentDataParents.asObservable(),this.selectedDataStudentCompany$=this.studentDataCompany.asObservable(),this.selectedDataStudentAddress$=this.studentAddress.asObservable(),this.currentStudentTitleIdSource=new i.X(""),this.currentStudentClassIdSource=new i.X(""),this.currentSearchStudentSource=new i.X(""),this.addNewStudent=new i.X(!1),this.importNewStudent=new i.X(!1),this.importFormFilled=new i.X(!1),this.currentStudentTitleId$=this.currentStudentTitleIdSource.asObservable(),this.currentStudentClassId$=this.currentStudentClassIdSource.asObservable(),this.currentSearchStudent$=this.currentSearchStudentSource.asObservable(),this.addNewStudent$=this.addNewStudent.asObservable(),this.importStudent$=this.importNewStudent.asObservable(),this.importFormFilled$=this.importFormFilled.asObservable()}setSelectedRncpTitleId(e){this.selectedRncpTitleIdSource.next(e)}getSelectedRncpTitleId(){return this.selectedRncpTitleIdSource.value}setSelectedClassId(e){this.selectedClassIdSource.next(e)}resetSelectedTitleAndClass(){this.selectedRncpTitleIdSource.next(null),this.selectedClassIdSource.next(null)}setCurrentStudentTitleId(e){this.currentStudentTitleIdSource.next(e)}setCurrentStudentClassId(e){e!==this.currentStudentClassIdSource.value&&this.currentStudentClassIdSource.next(e)}setCurrentStudentId(e){console.log("this.isAddUser : ",e),this.selectedStudentId.next(e)}setcurrentSearchStudent(e){this.currentSearchStudentSource.next(e)}setDataStudent(e){this.studentData.next(e)}setDataStudentIdentity(e){this.studentDataIdentity.next(e)}setDataStudentParents(e){this.studentDataParents.next(e)}setDataStudentCompany(e){this.studentDataCompany.next(e)}setDataStudentAddress(e){this.studentAddress.next(e)}setAddStudent(e){this.addNewStudent.next(e)}setImportStudent(e){this.importNewStudent.next(e)}setImportFormFilled(e){this.importFormFilled.next(e)}getCurrentSearchStudent(){return this.currentSearchStudentSource.getValue()}getCurrentStudentId(){return this.selectedStudentId.getValue()}getCurrentStudentAddress(){return this.studentAddress.getValue()}getAllSchools(e,t,r){return this.apollo.watchQuery({query:o.ZP`
      query GetAllSchools($page: PaginationInput, $sort: SchoolSorting) {
        GetAllSchools(
          ${r}
          pagination: $page
          sorting: $sort
          user_login: true
          ) {
          _id
          short_name
          long_name
          school_address {
            address1
            address2
            postal_code
            city
            region
            country
            department
            is_main_address
          }
          preparation_center_ats {
            rncp_title_id {
              _id
              short_name
            }
          }
          get_specific_users(user_type_id: "5a2e1ecd53b95d22c82f9554"){
            _id
            email
            first_name
            last_name
            civility
          }
          certifier_ats {
            _id
            short_name
          }
          count_document
        }
      }
      `,variables:{page:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllSchools))}getAllCampusesFromSchoolDropdown(e){return this.apollo.query({query:o.ZP`
          query GetAllCampuses($filter: CampusFilterInput) {
            GetAllCampuses(filter: $filter) {
              _id
              name
            }
          }
        `,variables:{filter:{school_ids:e}},fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetAllCampuses))}getAllCampusesFromSchoolWithLevels(e){return this.apollo.query({query:o.ZP`
          query GetAllCampuses($filter: CampusFilterInput) {
            GetAllCampuses(filter: $filter) {
              _id
              name
              levels {
                _id
                name
              }
            }
          }
        `,variables:{filter:{school_id:e}},fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetAllCampuses))}getAllSchoolsByCR(e,t,r,a){return this.apollo.watchQuery({query:o.ZP`
      query GetAllSchools($page: PaginationInput, $sort: SchoolSorting, $certifier_school: ID) {
        GetAllSchools(
          ${r}
          certifier_school: $certifier_school
          pagination: $page
          sorting: $sort
          ) {
          _id
          short_name
          long_name
          school_address {
            address1
            address2
            postal_code
            city
            region
            country
            department
            is_main_address
          }
          get_specific_users(user_type_id: "5a2e1ecd53b95d22c82f9554"){
            _id
            email
            first_name
            last_name
            civility
          }
          preparation_center_ats {
            rncp_title_id {
              _id
              short_name
            }
          }
          certifier_ats {
            _id
            short_name
          }
          count_document
        }
      }
      `,variables:{page:e,sort:t||{},certifier_school:a},fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(n=>n.data.GetAllSchools))}getAllSchoolsByCRToFilter(e){return this.apollo.watchQuery({query:o.ZP`
          query GetAllSchools($certifier_school: ID) {
            GetAllSchools(certifier_school: $certifier_school) {
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
                }
              }
              certifier_ats {
                _id
                short_name
              }
              count_document
            }
          }
        `,variables:{certifier_school:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(t=>t.data.GetAllSchools))}getAllSchoolsByUserOwn(e){return this.apollo.watchQuery({query:o.ZP`
          query GetAllSchools($school_ids: [ID]) {
            GetAllSchools(school_ids: $school_ids) {
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
                }
              }
              certifier_ats {
                _id
                short_name
              }
              count_document
            }
          }
        `,variables:{school_ids:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(t=>t.data.GetAllSchools))}getAllSchoolsByTitleUserOwn(e){return this.apollo.watchQuery({query:o.ZP`
          query GetAllSchools($rncp_title_ids: [ID]) {
            GetAllSchools(rncp_title_ids: $rncp_title_ids) {
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
                }
              }
              certifier_ats {
                _id
                short_name
              }
              count_document
            }
          }
        `,variables:{rncp_title_ids:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(t=>t.data.GetAllSchools))}getAllSchoolsChiefGroupOfSchool(e,t,r,a){return this.apollo.watchQuery({query:o.ZP`
      query GetAllSchoolsChiefGroup($page: PaginationInput, $sort: SchoolSorting, $school_ids: [ID]) {
        GetAllSchools(
          ${r}
          pagination: $page
          sorting: $sort
          school_ids: $school_ids
          ) {
          _id
          short_name
          long_name
          school_address {
            address1
            address2
            postal_code
            city
            region
            country
            department
            is_main_address
          }
          preparation_center_ats {
            rncp_title_id {
              _id
              short_name
            }
          }
          get_specific_users(user_type_id: "5a2e1ecd53b95d22c82f9554"){
            _id
            email
            first_name
            last_name
            civility
          }
          certifier_ats {
            _id
            short_name
          }
          count_document
        }
      }
      `,variables:{page:e,sort:t||{},school_ids:a},fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(n=>n.data.GetAllSchools))}getAllSchoolsCorretorProblematic(e,t,r,a,n){return this.apollo.watchQuery({query:o.ZP`
      query GetAllSchools($page: PaginationInput, $sort: SchoolSorting, $rncp_title_ids: [ID]) {
        GetAllSchools(
          ${r}
          pagination: $page
          sorting: $sort
          user_login_type: "${a}"
          rncp_title_ids: $rncp_title_ids
          ) {
          _id
          short_name
          long_name
          school_address {
            address1
            address2
            postal_code
            city
            region
            country
            department
            is_main_address
          }
          preparation_center_ats {
            rncp_title_id {
              _id
              short_name
            }
          }
          get_specific_users(user_type_id: "5a2e1ecd53b95d22c82f9554"){
            _id
            email
            first_name
            last_name
            civility
          }
          certifier_ats {
            _id
            short_name
          }
          count_document
        }
      }
      `,variables:{page:e,sort:t||{},rncp_title_ids:n},fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(u=>u.data.GetAllSchools))}getAllSchoolDynamicDropdown(e){return this.apollo.watchQuery({query:o.ZP`
      query {
        GetAllSchools(sorting:{short_name:asc}, school_name: "${e}") {
          _id
          short_name
        }
      }
      `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(t=>t.data.GetAllSchools))}getSchoolShortNames(){return this.apollo.watchQuery({query:o.ZP`
          query GetSchoolShortNames{
            GetAllSchools(sorting: { short_name: asc }) {
              _id
              short_name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(e=>e.data.GetAllSchools))}getSchoolCascade(e){return this.apollo.watchQuery({query:o.ZP`
      query GetSchoolCascade{
        GetAllSchools(sorting:{short_name:asc}, rncp_title_name: "${e}") {
          _id
          short_name
        }
      }
      `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(t=>t.data.GetAllSchools))}getAllSchoolIdAndShortName(){return this.apollo.query({query:o.ZP`
          query GetAllSchoolIdAndShortName{
            GetAllSchools {
              _id
              short_name
            }
          }
        `}).pipe((0,l.U)(e=>e.data.GetAllSchools))}getschoolAndCity(){return this.apollo.query({query:o.ZP`
          query GetschoolAndCity{
            GetAllSchools {
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
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(e=>e.data.GetAllSchools))}getSchoolsBySchoolType(e){return this.apollo.watchQuery({query:o.ZP`
      query {
        GetAllSchools(school_type: ${e}) {
          _id
          short_name
        }
      }
      `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(t=>t.data.GetAllSchools))}getSchoolsOfUser(){return this.apollo.watchQuery({query:o.ZP`
          query GetSchoolsOfUser{
            GetAllSchools(user_login: true, sorting: { short_name: asc }) {
              _id
              short_name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(e=>e.data.GetAllSchools))}getSchoolsBySchoolTypeAndUser(e){return this.apollo.watchQuery({query:o.ZP`
      query GetSchoolsBySchoolTypeAndUser{
        GetAllSchools(school_type: ${e}, user_login:true, sorting: { short_name: asc}) {
          _id
          short_name
        }
      }
      `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(t=>t.data.GetAllSchools))}getClassesByTitle(e){return this.apollo.query({query:o.ZP`
        query GetAllClasses{
          GetAllClasses(rncp_id: "${e}", sorting: { name: asc}) {
            _id
            name
          }
        }
      `}).pipe((0,l.U)(t=>t.data.GetAllClasses))}getAllCompany(e,t){return this.apollo.query({query:o.ZP`
        query GetAllCompany{
          GetAllCompanies(search: "${e}", school_id: "${t}") {
            _id
            company_name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(r=>r.data.GetAllCompanies))}getOneDetailCompany(e){return this.apollo.query({query:o.ZP`
        query GetOneDetailCompany{
          GetOneCompany(_id: "${e}") {
            _id
            company_name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneCompany))}getMentorStudent(e,t,r){return this.apollo.query({query:o.ZP`
        query{
          GetAllUsers(entity: company, user_type: "${e}", company: "${t}", company_schools: "${r}"){
            _id
            first_name
            last_name
            civility
            email
            full_name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllUsers))}getMentorInternship(e,t){return this.apollo.query({query:o.ZP`
        query GetAllUsers{
          GetAllUsers(entity: company, user_type: "${e}", company: "${t}"){
            _id
            first_name
            last_name
            civility
            email
            full_name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(r=>r.data.GetAllUsers))}getUserTypeMentor(){return this.apollo.query({query:o.ZP`
          query GetUserTypeMentor{
            GetAllUserTypes(search: "mentor") {
              _id
              name
              entity
            }
          }
        `}).pipe((0,l.U)(e=>e.data.GetAllUserTypes))}getPublishedFoldersAndDocsOfSelectedTitle(e,t){return this.apollo.query({query:o.ZP`
      query {
        GetOneTitle(_id: "${e}" only_folder_with_published_document:true document_published_in_class_id:"${t}") {
          academic_kit {
            categories {
              _id
              folder_name
              is_default_folder
              sub_folders_id {
                _id
                folder_name
              }
            }
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(r=>r.data.GetOneTitle))}getSubfolders(e,t){return this.apollo.query({query:o.ZP`
      query GetSubfolders{
        GetOneAcadKit(_id: "${e}", document_published_in_class_id:"${t}", only_sub_folder_with_published_document:true) {
          documents {
            _id
            document_name
            type_of_document
            s3_file_name
            published_for_student
            parent_class_id {
              _id
              name
            }
            parent_test {
              expected_documents {
                _id
                document_name
              }
              date_type
              date {
                date_utc
                time_utc
              }
            }
            uploaded_for_student {
              first_name
              last_name
            }
            uploaded_for_other_user {
              first_name
              last_name
            }
            document_expected_id {
              _id
              document_name
            }
            publication_date {
              type
              before
              day
              publication_date {
                date
                time
              }
              relative_time
            }
            published_for_user_types_id {
              _id
              name
            }
          }
          sub_folders_id {
            _id
            folder_name
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(r=>r.data.GetOneAcadKit))}getSchoolIdAndShortName(e){return this.apollo.query({query:o.ZP`
      query GetSchoolIdAndShortName{
        GetOneSchool(_id: "${e}") {
          _id
          short_name
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneSchool))}getSchoolSpecialization(e){return this.apollo.watchQuery({query:o.ZP`
      query GetSchoolSpecialization{
        GetOneSchool(_id: "${e}") {
          _id
          preparation_center_ats {
            rncp_title_id {
              _id
            }
            selected_specializations {
              _id
              name
            }
          }
        }
      }
      `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(t=>t.data.GetOneSchool))}createSchool(e){return this.apollo.mutate({mutation:o.ZP`
          mutation createSchool($school_input: SchoolInput) {
            CreateSchool(school_input: $school_input) {
              _id
              short_name
              long_name
            }
          }
        `,variables:{school_input:e}}).pipe((0,l.U)(t=>t.data.CreateSchool))}createStudent(e,t){return this.apollo.mutate({mutation:o.ZP`
          mutation CreateStudent($student_input: StudentInput, $lang: String) {
            CreateStudent(student_input: $student_input, lang: $lang) {
              _id
              first_name
              last_name
            }
          }
        `,variables:{student_input:e,lang:t}}).pipe((0,l.U)(r=>r.data.CreateStudent))}importStudent(e,t,r){return this.apollo.mutate({mutation:o.ZP`
          mutation ImportStudent($import_student_input: ImportStudent!, $file: Upload!, $lang: String) {
            ImportStudent(import_student_input: $import_student_input, file: $file, lang: $lang) {
              studentsAdded {
                name
                status
                message
              }
              studentsNotAdded {
                name
                status
                message
              }
            }
          }
        `,variables:{import_student_input:e,file:t,lang:r},context:{useMultipart:!0}}).pipe((0,l.U)(a=>a.data.ImportStudent))}updateStudent(e,t,r){return this.apollo.mutate({mutation:o.ZP`
          mutation UpdateStudent($_id: ID!, $student_input: StudentInput, $lang: String) {
            UpdateStudent(_id: $_id, student_input: $student_input, lang: $lang) {
              _id
              first_name
              last_name
              rncp_title {
                _id
              }
              current_class {
                _id
              }
            }
          }
        `,variables:{student_input:t,_id:e,lang:r}}).pipe((0,l.U)(a=>a.data.UpdateStudent))}updateSchool(e,t){return this.apollo.mutate({mutation:o.ZP`
          mutation updateSchool($id: ID!, $school_input: SchoolUpdateInput) {
            UpdateSchool(_id: $id, school_input: $school_input) {
              short_name
              long_name
            }
          }
        `,variables:{id:e,school_input:t}}).pipe((0,l.U)(r=>r.data.UpdateSchool))}createTitle(e){return this.apollo.mutate({mutation:o.ZP`
          mutation createTitle($title_input: RncpTitleInput) {
            CreateTitle(title_input: $title_input) {
              short_name
              long_name
            }
          }
        `,variables:{title_input:e}}).pipe((0,l.U)(t=>t.data.CreateTitle))}updateTitle(e,t){return this.apollo.mutate({mutation:o.ZP`
          mutation updateTitle($id: ID!, $title_input: RncpTitleUpdateInput) {
            UpdateTitle(_id: $id, title_input: $title_input) {
              short_name
              long_name
            }
          }
        `,variables:{id:e,title_input:t}}).pipe((0,l.U)(r=>r.data.UpdateTitle))}getOneTitle(e){return this.apollo.watchQuery({query:o.ZP`
      query GetOneTitle{
        GetOneTitle(_id: "${e}") {
          _id
          short_name
          journal_text
          journal_date

          long_name
          rncp_code
          rncp_level
          operator_dir_responsible{
            _id
            first_name
          }
          specializations{
            name
            is_specialization_assigned
          }
        }
      }
      `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(t=>t.data.GetOneTitle))}getSchool(e){return this.apollo.query({query:o.ZP`
      query GetOneSchool{
        GetOneSchool(_id: "${e}") {
          _id
          logo
          long_name
          short_name
          school_address {
            address1
            postal_code
            country
            city
            department
            region
            is_main_address
          }
          retake_center {
            _id
            long_name
          }
          school_ref_id
          group_of_school_id {
            _id
            group_name
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneSchool))}getSchoolPreparationCenterAndCertifier(e){return this.apollo.query({query:o.ZP`
      query GetSchoolPreparationCenterAndCertifier{
        GetOneSchool(_id: "${e}") {
          preparation_center_ats {
            rncp_title_id {
              _id
              short_name
              long_name
            }
            selected_specializations {
              _id
              name
            }
          }
          certifier_ats {
            _id
            short_name
            long_name
            specializations {
              _id
              name
            }
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneSchool))}getSchoolsByTitle(e){return this.apollo.query({query:o.ZP`
      query GetSchoolsByTitle{
        GetOneTitle(_id: "${e}") {
          preparation_centers {
            _id
            short_name
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneTitle))}getAcadofSchool(e){return this.apollo.query({query:o.ZP`
      query GetAcadofSchool{
        GetAllUsers(school: "${e}", user_type:"5a2e1ecd53b95d22c82f9554") {
          _id
          first_name
          last_name
          civility
          email
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetAllUsers))}sendRegistrationEmail(e,t,r,a){return this.apollo.mutate({mutation:o.ZP`
      mutation SendRegistrationEmail{
        SendStudentRegistrationEmail(rncp_title_id: "${e}", class_id: "${t}", school_id: "${r}", lang: "${a}")
      }
      `}).pipe((0,l.U)(n=>n))}getGroupMemberDropdownSchool(){return this.apollo.query({query:o.ZP`
          query GetGroupMemberDropdownSchool{
            GetSchoolDropdownList(school_not_in_group: true) {
              _id
              short_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(e=>e.data.GetSchoolDropdownList))}createGroupOfSchool(e){return this.apollo.mutate({mutation:o.ZP`
          mutation createGroupOfSchool($payload: GroupOfSchoolInput) {
            CreateGroupOfSchool(group_of_school_input: $payload) {
              _id
            }
          }
        `,variables:{payload:e}}).pipe((0,l.U)(t=>t))}editGroupOfSchool(e,t){return this.apollo.mutate({mutation:o.ZP`
          mutation UpdateGroupOfSchool($_id: ID!, $payload: GroupOfSchoolInput) {
            UpdateGroupOfSchool(_id: $_id, group_of_school_input: $payload) {
              _id
            }
          }
        `,variables:{_id:e,payload:t}}).pipe((0,l.U)(r=>r))}deleteGroupOfSchool(e){return this.apollo.mutate({mutation:o.ZP`
          mutation DeleteGroupOfSchool($_id: ID!) {
            DeleteGroupOfSchool(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:e}}).pipe((0,l.U)(t=>t))}getAllGroupOfSchools(e,t,r){return this.apollo.query({query:o.ZP`
          query getAllGroupOfSchoolTable($filter: SchoolGroupFilter, $sorting: SchoolGroupSorting, $pagination: PaginationInput) {
            GetAllGroupOfSchools(filter: $filter, sorting: $sorting, pagination: $pagination) {
              _id
              status
              group_name
              headquarter {
                _id
                short_name
              }
              school_members {
                _id
                short_name
              }
              rncp_titles {
                _id
                short_name
              }
              count_document
            }
          }
        `,variables:{filter:e,sorting:t,pagination:r},fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllGroupOfSchools))}getAllGroupOfSchoolsDropdown(){return this.apollo.query({query:o.ZP`
          query getAllGroupOfSchoolDropdown {
            GetAllGroupOfSchools {
              _id
              group_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(e=>e.data.GetAllGroupOfSchools))}getAllGroupDropdown(){return this.apollo.query({query:o.ZP`
          query GetGroupOfSchoolDropdownListTable {
            GetGroupOfSchoolDropdownList {
              _id
              group_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(e=>e.data.GetGroupOfSchoolDropdownList))}getAllSchoolMemberDropdown(e){return this.apollo.query({query:o.ZP`
      query GetAllSchoolMemberDropdown{
        GetSchoolDropdownList(school_in_group: true, school_group_type: ${e}) {
          _id
          short_name
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetSchoolDropdownList))}getTitleinGroupofSchoolDropdown(){return this.apollo.query({query:o.ZP`
          query GetTitleinGroupofSchoolDropdown{
            GetTitleDropdownList(school_group_title: true) {
              _id
              short_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(e=>e.data.GetTitleDropdownList))}getCountries(){return["Albania","Armenia","Austria","Belarus","Belgium","Bolivia","Bosnia and Herzegovina","Croatia","Cyprus","Czech Republic","Denmark","Democratic republic of Congo","Estonia","Ethiopia","Finland","France","Georgia","Germany","Greece","Greenland","Hungary","Iceland","Indonesia","Ireland","Isle of Man","Israel","Italy","Latvia","Lesotho","Liberia","Liechtenstein","Lithuania","Luxembourg","Maldives","Netherlands","Netherlands","Norway","Poland","Portugal","Romania","Republic of Congo","Senegal","Serbia and Montenegro","Slovakia","Slovenia","Spain","Sweden","Switzerland","United Kingdom","Venezuela"]}getSchools(){return this.httpClient.get("assets/data/school.json")}removeConnectedTitleFromSchool(e,t,r){return this.apollo.mutate({mutation:o.ZP`
      mutation {
        RemoveConnectedTitleFromSchool(
          title_id: "${e}"
          school_id: "${t}"
          connected_as: ${r}
        )
      }`,errorPolicy:"all"}).pipe((0,l.U)(a=>a))}sendEvalProN1(e,t){return this.apollo.mutate({mutation:o.ZP`
      mutation SendEvalProN1($lang: String) {
        SendEvalProN1(
          student_id: "${e}"
          test_id: "${t}"
          lang: $lang
        ) {
          _id
          name
        }
      }`,variables:{lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},errorPolicy:"all"}).pipe((0,l.U)(r=>r))}sendEvalProN3(e,t){return this.apollo.mutate({mutation:o.ZP`
      mutation SendEvalProN3($lang: String) {
        SendEvalProN3(
          student_id: "${e}"
          test_id: "${t}"
          lang: $lang
        ) {
          _id
          name
        }
      }`,variables:{lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},errorPolicy:"all"}).pipe((0,l.U)(r=>r))}getCountry(){return this.httpClient.get("assets/data/country.json")}checkPublishedAutoProEvalTest(e,t){return this.apollo.query({query:o.ZP`
          query CheckPublishedAutoProEvalTest($rncp_title_id: ID, $class_id: ID) {
            CheckPublishedAutoProEvalTest(rncp_title_id: $rncp_title_id, class_id: $class_id) {
              published {
                test_type
                test_id {
                  _id
                  name
                }
              }
              unpublished
            }
          }
        `,variables:{rncp_title_id:e,class_id:t},fetchPolicy:"network-only"}).pipe((0,l.U)(r=>r.data.CheckPublishedAutoProEvalTest))}getAllUserNote(){return this.apollo.query({query:o.ZP`
          query GetAllUsers {
            GetAllUsers {
              _id
              first_name
              last_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(e=>e.data.GetAllUsers))}}d.\u0275fac=function(e){return new(e||d)(_.\u0275\u0275inject(y.eN),_.\u0275\u0275inject(S._M))},d.\u0275prov=_.\u0275\u0275defineInjectable({token:d,factory:d.\u0275fac,providedIn:"root"}),function(c,e,t,r){var u,a=arguments.length,n=a<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,t):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(c,e,t,r);else for(var p=c.length-1;p>=0;p--)(u=c[p])&&(n=(a<3?u(n):a>3?u(e,t,n):u(e,t))||n);a>3&&n&&Object.defineProperty(e,t,n)}([(0,m.q)()],d.prototype,"getSchools",null)}}]);