"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[777],{50777:(v,h,_)=>{_.d(h,{r:()=>r});var d=_(591),p=_(24742),i=_(13125),l=_(24850),f=_(92340),y=_(94650),k=_(80529),$=_(18497),g=_(89383),c=function(u,e,t,a){var s,o=arguments.length,n=o<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,t):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(u,e,t,a);else for(var m=u.length-1;m>=0;m--)(s=u[m])&&(n=(o<3?s(n):o>3?s(e,t,n):s(e,t))||n);return o>3&&n&&Object.defineProperty(e,t,n),n};class r{constructor(e,t,a){this.httpClient=e,this.apollo=t,this.translate=a,this.selectedTitleSource=new d.X(null),this.scrollEvent=new d.X(null),this.courseSequenceData=new d.X(null),this.courseData=new d.X(null),this.sequenceEditData=new d.X(null),this.titleIntake=new d.X(null),this.courseSequenceEditMode=new d.X(!1),this.courseEditMode=new d.X(!1),this._childrenFormValidationStatus=!0,this.getScrollEvent$=this.scrollEvent.asObservable(),this.getCourseSequenceData$=this.courseSequenceData.asObservable(),this.getCourseData$=this.courseData.asObservable(),this.getCourseSequenceEditMode$=this.courseSequenceEditMode.asObservable(),this.getCourseEditMode$=this.courseEditMode.asObservable(),this.getSequenceEditData$=this.sequenceEditData.asObservable(),this.getTitleIntake$=this.titleIntake.asObservable(),this.scoreData=new d.X(null),this.selectedDataStudent$=this.scoreData.asObservable()}setEventScroll(e){this.scrollEvent.next(e)}setCourseSequenceData(e){this.courseSequenceData.next(e)}setSequenceData(e){this.sequenceEditData.next(e)}setCourseData(e){this.courseData.next(e)}setCourseSequenceEditMode(e){this.courseSequenceEditMode.next(e)}setCourseEditMode(e){this.courseEditMode.next(e)}setSelectedTitle(e){this.selectedTitleSource.next(e)}setTitleIntake(e){this.titleIntake.next(e)}getSelectedTitle(){return this.selectedTitleSource.value}get childrenFormValidationStatus(){return this._childrenFormValidationStatus}set childrenFormValidationStatus(e){this._childrenFormValidationStatus=e}setDataScore(e){this.scoreData.next(e)}downloadFile(e){const t=f.N.apiUrl.replace("/graphql","");return this.httpClient.post(`${t}/download/statusUpdateCsv`,e,{responseType:"text"}).pipe((0,l.U)(a=>a))}downloadGrandOralResult(e){const t=f.N.apiUrl.replace("/graphql","");return this.httpClient.post(`${t}/download/grandOralPdfFinalTranscript`,e,{responseType:"json"}).pipe((0,l.U)(a=>a))}getCountries(){return["Albania","Armenia","Austria","Belarus","Belgium","Bolivia","Bosnia and Herzegovina","Croatia","Cyprus","Czech Republic","Denmark","Estonia","Ethiopia","Finland","France","Georgia","Germany","Greece","Greenland","Hungary","Iceland","Ireland","Isle of Man","Israel","Italy","Latvia","Lesotho","Liberia","Liechtenstein","Lithuania","Luxembourg","Maldives","Netherlands","Netherlands","Norway","Poland","Portugal","Romania","Senegal","Serbia and Montenegro","Slovakia","Slovenia","Spain","Sweden","Switzerland","United Kingdom","Venezuela"]}getEnumTaskType(){return[{name:"Assign Corrector",value:"Assign Corrector"},{name:"Marks Entry",value:"Marks Entry"},{name:"Validate Test",value:"Validate Test"},{name:"Document Expected",value:"document_expected"},{name:"Create Groups",value:"Create Groups"},{name:"Assign Student",value:"assign_student_for_jury"},{name:"Upload Grand Oral CV",value:"student_upload_grand_oral_cv"},{name:"Upload Grand Oral Presentation",value:"student_upload_grand_oral_presentation"},{name:"Manual Task",value:"add_task"}]}getEnumTaskTypeEdh(){return[{name:"Complete contract/convention form",value:"Complete contract/convention form"},{name:"Step validation required",value:"Step validation required"},{name:"Validate Financement",value:"Validate Financement"},{name:"Validate Contract Process Step",value:"validate_contract_process"},{name:"Validate FC Contract Process Step",value:"validate_fc_contract_process"},{name:"Validate Student Admission Process",value:"validate_student_admission_process"},{name:"Validate One Time Form",value:"validate_one_time_form"}]}getTitleDropdown(e){return this.apollo.query({query:i.ZP`
        query {
          GetAllTitles(should_have_class: ${e}) {
            _id
            short_name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetAllTitles))}getTitleSearchDropdown(e){return this.apollo.query({query:i.ZP`
        query {
          GetTitleDropdownList(should_have_class: ${!0}, search: "${e}") {
            _id
            short_name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetTitleDropdownList))}getScholarSeasons(){return this.apollo.query({query:i.ZP`
          query {
            GetAllScholarSeasons {
              _id
              scholar_season
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(e=>e.data.GetAllScholarSeasons))}getTitleConditionSearchDropdown(e,t){return this.apollo.query({query:i.ZP`
        query {
          GetTitleDropdownList(
            should_have_class_with_condition: ${!0},
            type_evaluation: ${e},
            sub_type_evaluation: ${t}
            ) {
            _id
            short_name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetTitleDropdownList))}getTitleConditionSearchNotScore(e){return this.apollo.query({query:i.ZP`
        query {
          GetTitleDropdownList(
            should_have_class_with_condition: ${!0},
            type_evaluation: ${e}
            ) {
            _id
            short_name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetTitleDropdownList))}getClassDropdown(e,t){return this.apollo.query({query:i.ZP`
        query {
          GetClassDropdownList(rncp_id: "${e}", search: "${t}") {
            _id
            name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetClassDropdownList))}getClassConditionDropdown(e,t,a){return this.apollo.query({query:i.ZP`
        query {
          GetClassDropdownList(should_have_condition: ${!0}, rncp_id: "${e}", search: "${t}", type_evaluation: ${a}) {
            _id
            name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(o=>o.data.GetClassDropdownList))}getClassConditionDropdownWithScore(e,t,a,o){return this.apollo.query({query:i.ZP`
        query {
          GetClassDropdownList(
            should_have_condition: ${!0},
            rncp_id: "${e}",
            search: "${t}",
            type_evaluation: ${a},
            sub_type_evaluation : ${o}) {
            _id
            name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(n=>n.data.GetClassDropdownList))}getOneTitleById(e){return this.apollo.query({query:i.ZP`
        query {
          GetOneTitle(_id: "${e}") {
            _id
            rncp_logo
            is_certifier_also_pc
            short_name
            long_name
            rncp_code
            rncp_level
            rncp_level_europe
            is_published
            journal_text
            journal_date
            certifier {
              _id
              short_name
              long_name
              logo
              school_address {
                region
                postal_code
                department
                city
                country
                address1
                address2
                is_main_address
              }
            }
            specializations {
              _id
              name
              is_specialization_assigned
            }
            operator_dir_responsible {
              _id
              first_name
              last_name
              civility
            }
            academic_kit {
              is_created
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneTitle))}getSchoolList(e){return this.apollo.query({query:i.ZP`
        query {
          GetOneTitle(_id: "${e}") {
            _id
            preparation_centers {
              _id
              short_name
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneTitle.preparation_centers))}getAllZipCode(){return this.apollo.query({query:i.ZP`
          query {
            GetAllZipCodes {
              city
              province
              country
            }
          }
        `}).pipe((0,l.U)(e=>e.data.GetAllZipCodes))}getFilteredZipCode(e,t){return this.apollo.query({query:i.ZP`
      query GetAllZipCodes{
        GetAllZipCodes(zip_code: "${e}", country: "${t}") {
          city
          province
          academy
          region_code
          department
        }
      }
      `}).pipe((0,l.U)(a=>a.data.GetAllZipCodes))}getRncpTitlesDetails(){return this.apollo.query({query:i.ZP`
          query {
            GetAllTitles {
              _id
              short_name
              long_name
              rncp_level
              rncp_level_europe
              is_published
              certifier {
                _id
                short_name
                logo
              }
              operator_dir_responsible {
                _id
                first_name
                last_name
              }
              academic_kit {
                is_created
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(e=>e.data.GetAllTitles))}getRncpTitlesForUrgent(e){return this.apollo.query({query:i.ZP`
          query {
            GetTitleDropdownList(search: "${e}") {
              _id
              short_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetTitleDropdownList))}getRncpTitlesForTutorial(){return this.apollo.query({query:i.ZP`
          query {
            GetAllTitles {
              _id
              short_name
              long_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(e=>e.data.GetAllTitles))}getRncpTitlesForTutorialAcad(e){return this.apollo.query({query:i.ZP`
          query ($rncp_title_ids: [ID]) {
            GetAllTitles(rncp_title_ids: $rncp_title_ids) {
              _id
              short_name
              long_name
            }
          }
        `,variables:{rncp_title_ids:e},fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetAllTitles))}getRncpTitlesByUser(e,t="all"){return this.apollo.query({query:i.ZP`
          query ($is_published: Boolean, $filter_by_user_login: EnumFilterByUserLogin) {
            GetAllTitles(is_published: $is_published, filter_by_user_login: $filter_by_user_login) {
              _id
              short_name
              long_name
              rncp_level
              rncp_level_europe
              is_published
              certifier {
                _id
                short_name
              }
              operator_dir_responsible {
                _id
                first_name
                last_name
              }
              academic_kit {
                is_created
              }
            }
          }
        `,variables:{is_published:e,filter_by_user_login:t},fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllTitles))}getRncpTitlesByUserForAcademic(e,t){return this.apollo.query({query:i.ZP`
          query ($is_published: Boolean, $rncp_title_ids: [ID]) {
            GetAllTitles(is_published: $is_published, rncp_title_ids: $rncp_title_ids) {
              _id
              short_name
              long_name
              rncp_level
              rncp_level_europe
              is_published
              certifier {
                _id
                short_name
                logo
              }
              operator_dir_responsible {
                _id
                first_name
                last_name
              }
              academic_kit {
                is_created
              }
            }
          }
        `,variables:{is_published:e,rncp_title_ids:t},fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllTitles))}getRncpTitlesForAcademic(e){return this.apollo.query({query:i.ZP`
          query ($rncp_title_ids: [ID]) {
            GetAllTitles(rncp_title_ids: $rncp_title_ids) {
              _id
              short_name
              long_name
              rncp_level
              rncp_level_europe
              is_published
              certifier {
                _id
                short_name
              }
              operator_dir_responsible {
                _id
                first_name
                last_name
              }
              academic_kit {
                is_created
              }
            }
          }
        `,variables:{rncp_title_ids:e},fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetAllTitles))}getRncpTitlesBySchool(e,t){return this.apollo.query({query:i.ZP`
          query ($is_published: Boolean, $school_id: [String]) {
            GetAllTitles(is_published: $is_published, school_id: $school_id) {
              _id
              short_name
              long_name
              rncp_level
              rncp_level_europe
              is_published
              certifier {
                _id
                short_name
                logo
              }
              operator_dir_responsible {
                _id
                first_name
                last_name
              }
              academic_kit {
                is_created
              }
            }
          }
        `,variables:{is_published:e,school_id:t},fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllTitles))}getRncpTitlesBySchoolTypeAndId(e,t){return this.apollo.query({query:i.ZP`
        query getAllTitleDropdownUserDialog {
          GetAllTitles(school_type: "${e}", school_id: "${t}") {
            _id
            short_name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllTitles))}getRncpTitlesBySchoolId(e){return this.apollo.query({query:i.ZP`
        query GetTitleDropdown {
          GetAllTitles(school_id: "${e}", school_type: "preparation_center") {
            _id
            short_name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetAllTitles))}getRncpTitlesDropdownForCorrectorProblematic(e,t){return this.apollo.query({query:i.ZP`
        query GetTitleDropdownProblematic {
          GetAllTitles(school_id: "${e}", user_login_type: "${t}") {
            _id
            short_name
          }
        }
      `}).pipe((0,l.U)(a=>a.data.GetAllTitles))}getClassDropdownForCorrectorProblematic(e,t){return this.apollo.query({query:i.ZP`
        query GetClassDropdownProblematic {
          GetAllClasses(rncp_id: "${e}", user_login_type: "${t}") {
            _id
            name
            status
          }
        }
      `}).pipe((0,l.U)(a=>a.data.GetAllClasses))}getRncpTitlesCompany(){return this.apollo.query({query:i.ZP`
          query {
            GetAllTitles(school_type: "preparation_center") {
              _id
              short_name
            }
          }
        `}).pipe((0,l.U)(e=>e.data.GetAllTitles))}getTitleByAcadir(e){return this.apollo.query({query:i.ZP`
        query{
          GetAllTitles(filter_by_user_login: acadir, school_id: "${e}"){
            _id
            short_name
          }
        }
      `}).pipe((0,l.U)(t=>t.data.GetAllTitles))}getClasses(){return this.apollo.query({query:i.ZP`
          query {
            GetAllClasses {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(e=>e.data.GetAllClasses))}getClassesByTitle(e){return this.apollo.query({query:i.ZP`
        query GetAllClasses{
          GetAllClasses(rncp_id: "${e}") {
            _id
            name
            type_evaluation
            already_have_jury_decision
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetAllClasses))}getClassOfTitle(e){return this.apollo.query({query:i.ZP`
        query {
          GetOneTitle(_id: "${e}") {
            classes {
              _id
              name
              status
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneTitle.classes))}getSpecializations(e){return this.apollo.query({query:i.ZP`
        query {
          GetOneTitle(_id: "${e}") {
            specializations {
              _id
              name
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneTitle.specializations))}getSelectedRncpTitle(){return{long_name:"Responsable Administratif Bilingue - Office Manager",rncp_level:"6",short_name:"S-RAB 2020",_id:"5b69d1c481935943d24d25e8",is_published:!0}}createNewTitle(e){return this.apollo.mutate({mutation:i.ZP`
        mutation createTitle($title_input: RncpTitleInput) {
          CreateTitle(title_input: $title_input) {
            _id
          }
        }
      `,variables:{title_input:e},errorPolicy:"all"})}createTask(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateTask($task_input: AcadTaskInput, $lang: String!, $user_login_school_id: ID) {
            CreateTask(task_input: $task_input, lang: $lang, user_login_school_id: $user_login_school_id) {
              _id
            }
          }
        `,variables:{user_login_school_id:t,task_input:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},errorPolicy:"all"}).pipe((0,l.U)(a=>a))}updateTask(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateTask($task_input: AcadTaskInput, $_id: ID!) {
            UpdateTask(task_input: $task_input, _id: $_id) {
              _id
            }
          }
        `,variables:{_id:t,task_input:e},errorPolicy:"all"}).pipe((0,l.U)(a=>a))}createTaskNonSchool(e){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateTask($task_input: AcadTaskInput, $lang: String!) {
            CreateTask(task_input: $task_input, lang: $lang) {
              _id
            }
          }
        `,variables:{task_input:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},errorPolicy:"all"}).pipe((0,l.U)(t=>t))}getFilteredCertifierSchool(e){return this.apollo.query({query:i.ZP`
        query {
          GetSchoolDropdownList(search: "${e}", school_type:"certifier") {
            _id
            short_name
            long_name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetSchoolDropdownList))}getAllCertifierSchool(){return this.apollo.query({query:i.ZP`
          query GetAllCertifierSchool {
            GetSchoolDropdownList(school_type: "certifier") {
              _id
              long_name
              short_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(e=>e.data.GetSchoolDropdownList))}getFilteredAllSchool(e){return this.apollo.query({query:i.ZP`
        query {
          GetSchoolDropdownList(search: "${e}") {
            _id
            short_name
            long_name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetSchoolDropdownList))}getOneCertifierSchool(e){return this.apollo.query({query:i.ZP`
        query {
          GetOneSchool(_id:"${e}") {
            _id
            short_name
            long_name
            logo
            school_address {
              address1
              address2
              postal_code
              country
              city
              region
              department
              is_main_address
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneSchool))}getSchoolName(e){return this.apollo.query({query:i.ZP`
        query {
          GetOneSchool(_id:"${e}") {
            _id
            short_name
            long_name
            logo
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneSchool))}getCertifierSchool(){return this.apollo.query({query:i.ZP`
          query {
            GetAllSchools(school_type: "certifier") {
              _id
              short_name
              long_name
              logo
              school_address {
                address1
                address2
                postal_code
                city
                country
                region
                department
              }
            }
          }
        `}).pipe((0,l.U)(e=>e.data.GetAllSchools))}getAllSchoolDropdown(e){return this.apollo.query({query:i.ZP`
          query GetAllSchools($rncp_title_ids: [ID]) {
            GetAllSchools(rncp_title_ids: $rncp_title_ids) {
              _id
              short_name
              long_name
              logo
              school_address {
                address1
                address2
                postal_code
                city
                country
                region
                department
              }
            }
          }
        `,variables:{rncp_title_ids:e||""},fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetAllSchools))}getRncpTitles(){return this.httpClient.get("assets/data/rncp-titles.json")}getShortRncpTitles(){return this.httpClient.get("assets/data/short-rncp-titles.json")}getPendingTask(){return this.httpClient.get("assets/data/pendingtask.json")}getCalendar(){return this.httpClient.get("assets/data/calendar.json")}getAcademicKit(){return this.httpClient.get("assets/data/academickit.json")}getAcadClass(){return this.httpClient.get("assets/data/acadClass.json")}getAcadDocuments(){return this.httpClient.get("assets/data/acadDocuments.json")}getTitleName(e){return this.apollo.query({query:i.ZP`
          query GetOneTitle($titleId: ID!) {
            GetOneTitle(_id: $titleId) {
              short_name
              long_name
            }
          }
        `,variables:{titleId:e}}).pipe((0,l.U)(t=>t.data.GetOneTitle))}getAllPendingTasks(e,t,a,o,n){return this.apollo.query({query:i.ZP`
          query GetPendingTasks(
            $titleId: ID
            $pagination: PaginationInput
            $sorting: PendingTaskSorting
            $filter: PendingTaskFilter
            $userTypeId: ID
          ) {
            GetPendingTasks(rncp_id: $titleId, pagination: $pagination, sorting: $sorting, filter: $filter, user_login_type: $userTypeId) {
              _id
              test_group_id {
                _id
                name
              }
              jury_id {
                _id
                name
                type
              }
              due_date {
                date
                time
              }
              created_date {
                date
                time
              }
              school {
                _id
                short_name
              }
              rncp {
                _id
                short_name
              }
              class_id {
                _id
                name
              }
              created_by {
                _id
                civility
                first_name
                last_name
              }
              user_selection {
                user_id {
                  _id
                  civility
                  first_name
                  last_name
                  student_id {
                    _id
                  }
                }
                user_type_id {
                  _id
                  name
                }
              }
              description
              type
              test {
                _id
                date_type
                name
                group_test
                correction_type
                subject_id {
                  subject_name
                }
                evaluation_id {
                  _id
                  evaluation
                }
                parent_category {
                  _id
                  folder_name
                }
              }
              priority
              count_document
              expected_document_id
              task_status
              for_each_student
              for_each_group
              expected_document {
                file_type
              }
              student_id {
                _id
                first_name
                last_name
                civility
              }
              action_taken
              document_expecteds {
                name
              }
            }
          }
        `,variables:{titleId:e,sorting:a,pagination:t,filter:o,userTypeId:n},fetchPolicy:"network-only"}).pipe((0,l.U)(s=>s.data.GetPendingTasks))}getAllPendingTasksBySchool(e,t,a,o,n,s){return this.apollo.query({query:i.ZP`
          query GetPendingTasks(
            $titleId: ID
            $pagination: PaginationInput
            $sorting: PendingTaskSorting
            $filter: PendingTaskFilter
            $school_id: ID
            $userTypeId: ID
          ) {
            GetPendingTasks(
              rncp_id: $titleId
              pagination: $pagination
              sorting: $sorting
              filter: $filter
              school_id: $school_id
              user_login_type: $userTypeId
            ) {
              _id
              test_group_id {
                _id
                name
              }
              created_date {
                date
                time
              }
              due_date {
                date
                time
              }
              school {
                _id
                short_name
              }
              rncp {
                _id
                short_name
              }
              class_id {
                _id
                name
              }
              created_by {
                _id
                civility
                first_name
                last_name
              }
              user_selection {
                user_id {
                  _id
                  civility
                  first_name
                  last_name
                  student_id {
                    _id
                  }
                }
                user_type_id {
                  _id
                  name
                }
              }
              description
              type
              test {
                _id
                date_type
                name
                group_test
                correction_type
                subject_id {
                  subject_name
                }
                evaluation_id {
                  _id
                  evaluation
                }
                parent_category {
                  _id
                  folder_name
                }
              }
              priority
              count_document
              expected_document_id
              task_status
              for_each_student
              for_each_group
              expected_document {
                file_type
              }
              student_id {
                _id
                first_name
                last_name
                civility
              }
              action_taken
              document_expecteds {
                name
              }
            }
          }
        `,variables:{titleId:e,sorting:a,pagination:t,filter:o,school_id:n,userTypeId:s},fetchPolicy:"network-only"}).pipe((0,l.U)(m=>m.data.GetPendingTasks))}checkPendingTask(e,t,a={limit:1,page:0}){return this.apollo.query({query:i.ZP`
          query GetPendingTasks($school_id: ID, $rncp_id: ID, $pagination: PaginationInput) {
            GetPendingTasks(school_id: $school_id, rncp_id: $rncp_id, pagination: $pagination) {
              _id
            }
          }
        `,variables:{rncp_id:e,pagination:a,school_id:t},fetchPolicy:"network-only"}).pipe((0,l.U)(o=>o.data.GetPendingTasks))}getRncpTitleListData(e){return this.apollo.query({query:i.ZP`
        query {
          GetAllTitles(should_have_condition_of_award: ${e||!1}) {
            _id
            short_name
            long_name
            classes {
              _id
              name
            }
          }
        }
      `}).pipe((0,l.U)(a=>a.data.GetAllTitles))}getAllRncpTitleListData(e,t){return this.apollo.query({query:i.ZP`
        query($rncp_title_ids: [ID]) {
          GetAllTitles(should_have_condition_of_award: ${e||!1}, rncp_title_ids: $rncp_title_ids) {
            _id
            short_name
            long_name
          }
        }
      `,variables:{rncp_title_ids:t}}).pipe((0,l.U)(o=>o.data.GetAllTitles))}getRncpTitleListSearch(e){return this.apollo.query({query:i.ZP`
        query {
          GetAllTitles(school_id: "${e}") {
            _id
            short_name
            long_name
          }
        }
      `}).pipe((0,l.U)(t=>t.data.GetAllTitles))}getUserTypeListSearch(e){return this.apollo.query({query:i.ZP`
        query GetDropdownUserType($exclude_company: Boolean){
          GetAllUserTypes(school: "${e}", exclude_company: $exclude_company) {
            _id
            name
            entity
          }
        }
      `,variables:{exclude_company:!0}}).pipe((0,l.U)(t=>t.data.GetAllUserTypes))}getClassByRncpTitle(e){return this.apollo.query({query:i.ZP`
        query {
          GetAllClasses(rncp_id: "${e}") {
            _id
            name
            description
            type_evaluation
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetAllClasses))}deleteClass(e){return this.apollo.mutate({mutation:i.ZP`
      mutation {
        DeleteClass(_id : "${e}") {
          _id
        }
      }
      `,errorPolicy:"all"})}updateRncpTitle(e,t){return this.apollo.mutate({mutation:i.ZP`
        mutation UpdateTitle($id: ID!, $titleData: RncpTitleUpdateInput) {
          UpdateTitle(_id: $id, title_input: $titleData) {
            _id
            is_published
          }
        }
      `,variables:{id:e,titleData:t},errorPolicy:"all"})}getRncpTitleById(e){return this.apollo.query({query:i.ZP`
        query GetOneTitle{
          GetOneTitle(_id: "${e}") {
            short_name
            long_name
            _id
          }
        }
      `}).pipe((0,l.U)(t=>t.data.GetOneTitle))}getOneUserTypes(e){return this.apollo.query({query:i.ZP`
      query{
        GetOneUserType(_id:"${e}"){
          _id
          name
          entity
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneUserType))}getClassById(e){return this.apollo.query({query:i.ZP`
        query {
          GetOneClass(_id: "${e}") {
            _id
            name
            description
            type_evaluation
            allow_job_description
            allow_problematic
            allow_mentor_evaluation
            allow_employability_survey
            is_mentor_selected_in_job_description
            is_job_desc_active
            is_problematic_active
            is_employability_survey_active
            problematic_send_to_certifier_time
            job_desc_activation_date {
              date
              time
            }
            questionnaire_template_id {
              _id
            }
            problematic_questionnaire_template_id {
              _id
            }
            problematic_activation_date {
              date
              time
            }
            identity_verification {
              allow_auto_send_identity_verification
              identity_verification_activation_date {
                date_utc
                time_utc
              }
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneClass))}getClassByIdOnCompany(e){return this.apollo.query({query:i.ZP`
        query {
          GetOneClass(_id: "${e}") {
            _id
            name
            description
            type_evaluation
            allow_job_description
            allow_problematic
            allow_mentor_evaluation
            allow_employability_survey
            is_mentor_selected_in_job_description
            is_job_desc_active
            is_problematic_active
            is_employability_survey_active
            problematic_send_to_certifier_time
            job_desc_activation_date {
              date
              time
            }
            questionnaire_template_id {
              _id
            }
            problematic_questionnaire_template_id {
              _id
            }
            problematic_activation_date {
              date
              time
            }
            identity_verification {
              allow_auto_send_identity_verification
              identity_verification_activation_date {
                date_utc
                time_utc
              }
            }
            test_auto_pro_published(class_id: "${e}")
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneClass))}getClassForValidation(e){return this.apollo.query({query:i.ZP`
        query {
          GetOneClass(_id: "${e}") {
            _id
            name
            pass_fail_conditions {
              _id
              condition_name
              condition_type
              condition_parameters {
                correlation
                validation_type
                validation_parameter {
                  parameter_type
                  percentage_value
                  block_id {
                    _id
                    block_of_competence_condition
                  }
                  subject_id {
                    _id
                    subject_name
                  }
                  evaluation_id {
                    _id
                    evaluation
                  }
                  sign
                }
                pass_mark
              }
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneClass))}getClassESById(e){return this.apollo.query({query:i.ZP`
        query {
          GetOneClass(_id: "${e}") {
            _id
            parent_rncp_title{
              _id
            }
            employability_surveys{
              _id
              employability_survey_sent
              questionnaire_template_id{
                _id
              }
              send_date
              send_time
              expiration_date
              expiration_time
              send_only_to_pass_student
              send_only_to_not_mention_continue_study
              send_only_to_pass_latest_retake_student
              with_rejection_flow
              is_required_for_certificate
              validator
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneClass))}getClassScoreConversionById(e){return this.apollo.query({query:i.ZP`
        query {
          GetOneClass(_id: "${e}") {
            _id
            name
            description
            type_evaluation
            allow_job_description
            allow_problematic
            allow_mentor_evaluation
            score_conversions_competency {
              _id
              sign
              score
              phrase
              letter
            }
            score_conversions_soft_skill {
              _id
              sign
              score
              phrase
              letter
            }
            max_score_competency
            max_score_soft_skill
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneClass))}getQuestionaireJobDesc(){return this.apollo.query({query:i.ZP`
          query {
            GetAllQuestionnaireTemplate(filter: { questionnaire_type: job_description }) {
              _id
              questionnaire_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(e=>e.data.GetAllQuestionnaireTemplate))}getQuestionaireProblematic(){return this.apollo.query({query:i.ZP`
          query {
            GetAllQuestionnaireTemplate(filter: { questionnaire_type: problematic }) {
              _id
              questionnaire_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(e=>e.data.GetAllQuestionnaireTemplate))}getQuestionaireES(){return this.apollo.query({query:i.ZP`
          query {
            GetAllQuestionnaireTemplate(filter: { questionnaire_type: employability_survey, published_status: publish }) {
              _id
              questionnaire_name
              is_continue_study
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(e=>e.data.GetAllQuestionnaireTemplate))}createNewClass(e){return this.apollo.mutate({mutation:i.ZP`
        mutation CreateClass($any: any) {
          CreateClass(class_input: $any) {
            _id
            description
            name
          }
        }
      `,variables:{any:e},errorPolicy:"all"})}createNewClassDuplicate(e,t){return this.apollo.mutate({mutation:i.ZP`
        mutation CreateClass($any: any, $duplicateClass: Duplicateany) {
          CreateClass(class_input: $any, duplicate_class: $duplicateClass) {
            _id
            description
            name
          }
        }
      `,variables:{any:e,duplicateClass:t},errorPolicy:"all"})}updateClassParameter(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateClassParameter($classId: ID!, $any: any) {
            UpdateClass(_id: $classId, class_input: $any) {
              name
              max_score_soft_skill
              max_score_competency
              score_conversions_competency {
                sign
                score
                phrase
                letter
              }
              score_conversions_soft_skill {
                sign
                score
                phrase
                letter
              }
            }
          }
        `,variables:{classId:e,any:t},errorPolicy:"all"}).pipe((0,l.U)(a=>a))}updateClass(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateClass($classId: ID!, $any: any) {
            UpdateClass(_id: $classId, class_input: $any) {
              name
            }
          }
        `,variables:{classId:e,any:t}}).pipe((0,l.U)(a=>a.data.UpdateClass))}updateScore(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateClassOnEvalExpertise($classId: ID!, $any: any) {
            UpdateClass(_id: $classId, class_input: $any) {
              max_score_competency
              score_conversions_competency {
                sign
                score
                phrase
                letter
              }
              max_score_soft_skill
              score_conversions_soft_skill {
                sign
                score
                phrase
                letter
              }
            }
          }
        `,variables:{classId:e,any:t}}).pipe((0,l.U)(a=>a.data.UpdateClass))}getAllFinalTranscriptParameters(){return this.apollo.query({query:i.ZP`
        query {
          GetAllFinalTranscriptParameter {
            final_n2_deadline
            final_n3_deadline
            final_n3_special_text
            final_n7_jury_decision
            final_n7_extra_retake
          }
        }
      `})}getOneFinalTranscriptParameter(e,t){return this.apollo.query({query:i.ZP`
      query {
        GetOneFinalTranscriptParameter(rncp_id : "${e}", class_id : "${t}") {
          _id
          final_n2_deadline
          final_n3_deadline
          final_n3_special_text
          final_n7_jury_decision
          final_n7_extra_retake
        }
      }
      `,fetchPolicy:"network-only"})}createFinalTranscriptParameter(e){return this.apollo.mutate({mutation:i.ZP`
      mutation {
        CreateFinalTranscriptParameter(final_transcript_parameter_input : {
          rncp_id : "${e.rncp_id}",
          class_id : "${e.class_id}",
          final_n2_deadline : "${e.N2_Deadline}",
          final_n3_deadline : "${e.N3_Deadline}",
          final_n3_special_text : "${e.N3_Special_Text}",
          final_n7_jury_decision : "${e.N7_Date_Jury_Decision}",
          final_n7_extra_retake : "${e.N7_Retake_Date}"
        }) {
          _id
          final_n2_deadline
          final_n3_deadline
          final_n3_special_text
          final_n7_jury_decision
          final_n7_extra_retake
        }
      }`})}updateFinalTranscriptParameter(e,t){return this.apollo.mutate({mutation:i.ZP`
      mutation{
        UpdateFinalTranscriptParameter(_id:"${e}", final_transcript_parameter_input:{
          rncp_id : "${t.rncp_id}",
          class_id : "${t.class_id}",
          final_n2_deadline : "${t.N2_Deadline}",
          final_n3_deadline : "${t.N3_Deadline}",
          final_n3_special_text : "${t.N3_Special_Text}",
          final_n7_jury_decision : "${t.N7_Date_Jury_Decision}",
          final_n7_extra_retake : "${t.N7_Retake_Date}"
        }){
          final_n2_deadline
          final_n3_deadline
          final_n3_special_text
          final_n7_jury_decision
          final_n7_extra_retake
        }
      }`})}createCertificateParameter(e){return this.apollo.mutate({mutation:i.ZP`
      mutation{
        CreateCertificateParameter(certificate_parameter_input:{
          rncp_id : "${e.rncp_id}",
          class_id : "${e.class_id}",
          rncp_logo : {
            file_name : "",
            file_path : ""
          },
          certifier_logo : {
            file_name : "",
            file_path : ""
          },
          certifier_admin_signature : {
            file_name : "${e.adminName}",
            file_path : "${e.adminSrc}"
          },
          certifier_stamp :{
            file_name : "${e.stampName}",
            file_path : "${e.stampSrc}"
          },
          certificate_background_image: {
            file_name : "${e.BGName}",
            file_path : "${e.BGSrc}"
          },
          font_type :"${e.fontType}",
          font_size: ${e.fontSize},
          header : "${e.headers}",
          footer : "${e.footers}",
          certificate_issuance_date : "${e.date}"
        }){
          certifier_admin_signature{
            file_name
            file_path
          }
          certifier_stamp{
            file_name
            file_path
          }
          certificate_background_image{
            file_name
            file_path
          }
          font_type
          font_size
          header
          footer
          certificate_issuance_date
        }
      }
      `})}updateCertificateParameter(e){return this.apollo.mutate({mutation:i.ZP`
      mutation{
        UpdateCertificateParameter(_id : "${e._id}", certificate_parameter_input:{
          rncp_id : "${e.rncp_id}",
          class_id : "${e.class_id}",
          rncp_logo : {
            file_name : "",
            file_path : ""
          },
          certifier_logo : {
            file_name : "",
            file_path : ""
          },
          certifier_admin_signature : {
            file_name : "${e.adminName}",
            file_path : "${e.adminSrc}"
          },
          certifier_stamp :{
            file_name : "${e.stampName}",
            file_path : "${e.stampSrc}"
          },
          certificate_background_image: {
            file_name : "${e.BGName}",
            file_path : "${e.BGSrc}"
          },
          font_type :"${e.fontType}",
          font_size: ${e.fontSize},
          header : "${e.headers}",
          footer : "${e.footers}",
          certificate_issuance_date : "${e.date}"
        }){
          certifier_admin_signature{
            file_name
            file_path
          }
          certifier_stamp{
            file_name
            file_path
          }
          certificate_background_image{
            file_name
            file_path
          }
          font_type
          font_size
          header
          footer
          certificate_issuance_date
        }
      }
      `})}getOneCertificateParameter(e){return this.apollo.query({query:i.ZP`
      query{
        GetOneCertificateParameter(rncp_id:"${e.rncp_id}", class_id:"${e.class_id}"){
          _id
          certifier_admin_signature{
            file_name
            file_path
          }
          certifier_stamp{
            file_name
            file_path
          }
          certificate_background_image{
            file_name
            file_path
          }
          font_type
          font_size
          header
          footer
          certificate_issuance_date
        }
      }
      `,fetchPolicy:"network-only"})}getFirstCondition(e,t){return this.apollo.query({query:i.ZP`
      query{
        GetFirstConditionSetUp (rncp_id:"${e}", class_id:"${t}"){
          type_evaluation
          sub_type_evaluation
          evaluation_step
          evaluation_max_point
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetFirstConditionSetUp))}saveFirstCondition(e,t){return this.apollo.mutate({mutation:i.ZP`
        mutation CreateUpdateCondition($classId: ID!, $firstStepData: FirstConditionSetUpInput) {
          CreateUpdateCondition(class_id: $classId, first_step_input: $firstStepData) {
            type_evaluation
            sub_type_evaluation
          }
        }
      `,variables:{classId:e,firstStepData:t},errorPolicy:"all"})}duplicateCondition(e,t){return this.apollo.mutate({mutation:i.ZP`
        mutation CreateUpdateCondition($classId: ID!, $duplicateConditionInput: DuplicateConditionInput) {
          CreateUpdateCondition(class_id: $classId, duplicate_condition: $duplicateConditionInput) {
            type_evaluation
            sub_type_evaluation
          }
        }
      `,variables:{classId:e,duplicateConditionInput:t},errorPolicy:"all"})}getTitleShortName(e){return this.apollo.query({query:i.ZP`
      query{
        GetOneTitle(_id:"${e}"){
          short_name
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneTitle))}getClassName(e){return this.apollo.query({query:i.ZP`
      query{
        GetOneClass(_id:"${e}"){
          name
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneClass))}GetBlockOfCompetenceConditionDropdownList(e,t,a){return this.apollo.query({query:i.ZP`
      query{
        GetBlockOfCompetenceConditionDropdownList(type_evaluation:${e}, sub_type_evaluation:${t}, search:"${a}"){
          _id
          block_of_competence_condition
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(o=>o.data.GetBlockOfCompetenceConditionDropdownList))}getClassCondition(e,t){return this.apollo.query({query:i.ZP`
      query{
        GetOneClass(_id:"${e}"){
          name
          type_evaluation
          sub_type_evaluation
          evaluation_step
          evaluation_max_point
          parent_rncp_title {
            short_name
            long_name
          }
          competency {
            allow_competency_auto_evaluation
            allow_competency_pro_evaluation
          }
          soft_skill {
            allow_soft_skill
            allow_soft_skill_auto_evaluation
            allow_soft_skill_pro_evaluation
          }
          test_auto_pro_created(class_id:"${e}", ${t?`block_type: ${t}`:""})
          test_auto_pro_published(class_id:"${e}", ${t?`block_type: ${t}`:""})
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetOneClass))}getAllBlockOfCompetenceConditions(e,t){return this.apollo.query({query:i.ZP`
      query{
        GetAllBlockOfCompetenceConditions(rncp_title_id:"${e}", class_id:"${t}"){
          _id
          block_rncp_reference
          rncp_title {
            _id
          }
          class_id {
            _id
          }
          block_of_competence_condition
          description
          max_point
          min_score
          block_of_competence_condition_credit
          transversal_block
          is_retake_by_block
          selected_block_retake {
            _id
            block_of_competence_condition
          }
          is_specialization
          specialization {
            _id
          }
          count_for_title_final_score
          page_break
          block_of_tempelate_competence {
            _id
            ref_id
          }
          block_of_tempelate_soft_skill {
            _id
            ref_id
          }
          block_type
          is_auto_pro_eval
          ref_id
          order
          subjects {
            _id
            rncp_title {
              _id
            }
            class_id {
              _id
            }
            is_subject_transversal_block
            subject_transversal_block_id {
              _id
              subject_name
            }
            subject_name
            max_point
            minimum_score_for_certification
            coefficient
            count_for_title_final_score
            credit
            order
            evaluations {
              _id
              evaluation
              type
              weight
              coefficient
              minimum_score
              result_visibility
              parallel_intake
              auto_mark
              retake_during_the_year
              student_eligible_to_join
              retake_when_absent_justified
              retake_when_absent_not_justified
              use_different_notation_grid
              retake_evaluation {
                _id
                evaluation
                type
              }
              score_not_calculated_for_retake_block
              test_is_not_retake_able_in_retake_block
              selected_evaluation_retake_block {
                _id
                evaluation
              }
              order
              published_test_id {
                is_published
              }
            }
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllBlockOfCompetenceConditions))}getAllBlockConditionsForValidation(e,t){return this.apollo.query({query:i.ZP`
      query{
        GetAllBlockOfCompetenceConditions(rncp_title_id:"${e}", class_id:"${t}", count_for_title_final_score: true){
          _id
          block_rncp_reference
          rncp_title {
            _id
          }
          class_id {
            _id
          }
          block_of_competence_condition
          description
          max_point
          min_score
          block_of_competence_condition_credit
          transversal_block
          is_retake_by_block
          selected_block_retake {
            _id
            block_of_competence_condition
          }
          is_specialization
          specialization {
            _id
          }
          count_for_title_final_score
          page_break
          block_of_tempelate_competence {
            _id
            ref_id
          }
          block_of_tempelate_soft_skill {
            _id
            ref_id
          }
          block_type
          is_auto_pro_eval
          ref_id
          order
          subjects {
            _id
            rncp_title {
              _id
            }
            class_id {
              _id
            }
            is_subject_transversal_block
            subject_transversal_block_id {
              _id
              subject_name
            }
            subject_name
            max_point
            minimum_score_for_certification
            coefficient
            count_for_title_final_score
            credit
            order
            evaluations {
              _id
              evaluation
              type
              weight
              coefficient
              minimum_score
              result_visibility
              parallel_intake
              auto_mark
              retake_during_the_year
              student_eligible_to_join
              retake_when_absent_justified
              retake_when_absent_not_justified
              use_different_notation_grid
              retake_evaluation {
                _id
                evaluation
                type
              }
              score_not_calculated_for_retake_block
              test_is_not_retake_able_in_retake_block
              selected_evaluation_retake_block {
                _id
                evaluation
              }
              order
            }
          }
          pass_fail_conditions {
            _id
            condition_name
            condition_type
            condition_parameters {
              correlation
              validation_type
              validation_parameter {
                parameter_type
                percentage_value
                block_id {
                  _id
                  block_of_competence_condition
                }
                subject_id {
                  _id
                  subject_name
                }
                evaluation_id {
                  _id
                  evaluation
                }
                sign
              }
              pass_mark
            }
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllBlockOfCompetenceConditions))}getAllFinalTranscriptResult(e,t,a){return this.apollo.query({query:i.ZP`
          query {
            GetAllFinalTranscriptResult(rncp_title_id: "${e}", class_id: "${t}", student_id: "${a}") {
              student_id {
                _id
                first_name
                last_name
                civility
                email
                date_of_birth
                place_of_birth
              }
              rncp_id {
                _id
                short_name
                long_name
                rncp_level
                journal_text
                certifier {
                  _id
                  short_name
                  long_name
                }
                preparation_centers {
                  _id
                  short_name
                  long_name
                }
              }
              class_id {
                _id
                name
              }
              school_id {
                _id
                short_name
                long_name
              }
              total_mark
              total_point
              max_point
              pass_fail_status
              parameter_obtained_name
              parameter_obtained_id {
                condition_name
              }
              block_of_competence_conditions {
                block_id {
                  _id
                  block_of_competence_condition
                  max_point
                  min_score
                  block_of_competence_condition_credit
                }
                pass_fail_status
                total_mark
                total_point
                total_coefficient
                max_point
                subjects {
                  subject_id {
                    _id
                    subject_name
                  }
                  total_mark
                  total_point
                  coefficient
                  total_coefficient
                  total_credit
                  total_weight
                  max_point
                  pass_fail_status
                  evaluations {
                    evaluation_id {
                      _id
                      evaluation
                      weight
                      coefficient
                      minimum_score
                    }
                    total_mark
                    total_point
                    mark
                    weight
                    coefficient
                    pass_fail_status
                  }
                }
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(o=>o.data.GetAllFinalTranscriptResult))}createUpdateBlockOfCompetenceCondition(e,t,a){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateUpdateBlockOfCompetenceCondition($rncpId: ID!, $classId: ID!, $blocks: [BlockOfCompetenceConditionInput]) {
            CreateUpdateBlockOfCompetenceCondition(
              rncp_title_id: $rncpId
              class_id: $classId
              block_of_competence_condition_input: $blocks
            ) {
              _id
              rncp_title {
                _id
              }
              class_id {
                _id
              }
              block_of_competence_condition
              description
              max_point
              min_score
              block_of_competence_condition_credit
              transversal_block
              is_retake_by_block
              selected_block_retake {
                _id
              }
              is_specialization
              count_for_title_final_score
            }
          }
        `,variables:{rncpId:e,classId:t,blocks:a},errorPolicy:"all"}).pipe((0,l.U)(o=>o))}updateMaxPoint(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation updateMaxPoint($classId: ID!, $any: any) {
            UpdateClass(_id: $classId, class_input: $any) {
              _id
              name
              evaluation_max_point
            }
          }
        `,variables:{classId:e,any:t}}).pipe((0,l.U)(a=>a.data.UpdateClass))}deleteBlockCompetence(e){return this.apollo.mutate({mutation:i.ZP`
      mutation {
        DeleteBlockOfCompetenceCondition(_id: "${e}"){
          _id
        }
      }
      `,errorPolicy:"all"})}deleteEvaluationCompetence(e){return this.apollo.mutate({mutation:i.ZP`
      mutation {
        DeleteEvaluation(_id: "${e}"){
          _id
        }
      }
      `,errorPolicy:"all"})}deleteSubjectCompetence(e){return this.apollo.mutate({mutation:i.ZP`
      mutation {
        DeleteSubject(_id: "${e}"){
          _id
        }
      }
      `,errorPolicy:"all"})}getAllBlockOfCompetenceTemplateDropdown(e,t){return this.apollo.query({query:i.ZP`
      query GetAllBlockOfCompetenceTemplateDropdown{
        GetAllBlockOfCompetenceTemplates(rncp_title_id:"${e}", class_id:"${t}"){
          _id
          ref_id
          name
          phrase_names {
            phrase_type
            name
          }
          competence_templates_id {
            _id
            ref_id
            name
            short_name
            phrase_names {
              name
            }
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllBlockOfCompetenceTemplates))}getAllBlockOfSoftSkillTemplateDropdown(e,t){return this.apollo.query({query:i.ZP`
      query GetAllBlockOfSoftSkillTemplateDropdown{
        GetAllSoftSkillBlockTemplates(rncp_title_id:"${e}", class_id:"${t}"){
          _id
          ref_id
          name
          phrase_names {
            name
            phrase_type
          }
          competence_softskill_templates_id {
            _id
            ref_id
            name
            short_name
            phrase_names {
              name
            }
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllSoftSkillBlockTemplates))}getAllBlockOfCompetenceTemplate(e,t){return this.apollo.query({query:i.ZP`
      query{
        GetAllBlockOfCompetenceTemplates(rncp_title_id:"${e}", class_id:"${t}"){
          _id
          ref_id
          name
          description
          note
          phrase_names {
            _id
            phrase_type
            name
            phrase_parameters {
              correlation
              pass_mark
              validation_type
              validation_parameter {
                parameter_type
                percentage_value
                ratio_value
                sign
                competence_id {
                  _id
                }
                criteria_of_evaluation_template_id  {
                  _id
                }
              }
            }
          }
          competence_templates_id {
            _id
            ref_id
            name
            short_name
            description
            phrase_names {
              _id
              name
              phrase_parameters {
                correlation
                pass_mark
                validation_type
                validation_parameter {
                  parameter_type
                  percentage_value
                  ratio_value
                  sign
                  criteria_of_evaluation_template_id  {
                    _id
                  }
                }
              }
            }
            criteria_of_evaluation_templates_id {
              _id
              ref_id
              name
              description
            }
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllBlockOfCompetenceTemplates))}getAllCriteriaOfEvaluationTemplateQuestions(e){return this.apollo.query({query:i.ZP`
      query GetAllCriteriaOfEvaluationTemplateQuestions{
        GetAllCriteriaOfEvaluationTemplateQuestions(
          criteria_of_evaluation_template_id: "${e}"
        ) {
        _id
        question
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetAllCriteriaOfEvaluationTemplateQuestions))}saveOneBlockOfCompetenceTemplate(e,t,a){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateUpdateBlockOfCompetenceTemplate($rncpId: ID!, $classId: ID!, $payload: [BlockOfCompetenceTemplateInput]) {
            CreateUpdateBlockOfCompetenceTemplate(
              rncp_title_id: $rncpId
              class_id: $classId
              block_of_competence_template_input: $payload
            ) {
              _id
            }
          }
        `,variables:{rncpId:e,classId:t,payload:a}}).pipe((0,l.U)(o=>o.data.CreateUpdateBlockOfCompetenceTemplate))}deleteBlockOfCompetenceTemplate(e){return this.apollo.mutate({mutation:i.ZP`
      mutation DeleteBlockOfCompetenceTemplate{
        DeleteBlockOfCompetenceTemplate(_id: "${e}")
      }
      `,errorPolicy:"all"})}deleteCompetencyTemplate(e){return this.apollo.mutate({mutation:i.ZP`
      mutation DeleteCompetenceTemplate{
        DeleteCompetenceTemplate(_id: "${e}")
      }
      `,errorPolicy:"all"})}deleteCriteriaEvaluationTemplate(e){return this.apollo.mutate({mutation:i.ZP`
      mutation DeleteCriteriaOfEvaluationTemplate{
        DeleteCriteriaOfEvaluationTemplate(_id: "${e}")
      }
      `,errorPolicy:"all"})}createOneBlockOfCompetenceTemplate(e,t,a){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateBlockOfCompetenceTemplate($rncpId: ID!, $classId: ID!, $payload: BlockOfCompetenceTemplateInput) {
            CreateBlockOfCompetenceTemplate(rncp_title_id: $rncpId, class_id: $classId, block_of_competence_template_input: $payload) {
              _id
              ref_id
              name
              description
              note
            }
          }
        `,variables:{rncpId:e,classId:t,payload:a}}).pipe((0,l.U)(o=>o.data.CreateBlockOfCompetenceTemplate))}getOneGrandOralValidation(e,t){return this.apollo.query({query:i.ZP`
      query GetOneGrandOralValidation{
        GetOneGrandOralValidation(rncp_id:"${e}", class_id:"${t}"){
          _id
          rncp_id {
            _id
          }
          class_id {
            _id
          }
          phrase_names {
            _id
            name
            phrase_type
            phrase_parameters {
              correlation
              validation_type
              min_level_mastery
              validation_parameter {
                parameter_type
                percentage_value
                ratio_value
                sign
                block_id {
                  _id
                }
                competence_id {
                  _id
                }
              }
            }
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetOneGrandOralValidation))}createGrandOralValidation(e){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateGrandOralValidation($payload: GrandOralValidationInput) {
            CreateGrandOralValidation(grand_oral_validation_input: $payload) {
              _id
              rncp_id {
                _id
              }
              class_id {
                _id
              }
              phrase_names {
                _id
                name
                phrase_type
                phrase_parameters {
                  correlation
                  validation_type
                  min_level_mastery
                  validation_parameter {
                    parameter_type
                    percentage_value
                    ratio_value
                    sign
                    block_id {
                      _id
                    }
                    competence_id {
                      _id
                    }
                  }
                }
              }
            }
          }
        `,variables:{payload:e}}).pipe((0,l.U)(t=>t.data.CreateGrandOralValidation))}updateGrandOralValidation(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateGrandOralValidation($payload: GrandOralValidationInput, $_id: ID) {
            UpdateGrandOralValidation(grand_oral_validation_input: $payload, _id: $_id) {
              _id
              rncp_id {
                _id
              }
              class_id {
                _id
              }
              phrase_names {
                _id
                name
                phrase_type
                phrase_parameters {
                  correlation
                  validation_type
                  min_level_mastery
                  validation_parameter {
                    parameter_type
                    percentage_value
                    ratio_value
                    sign
                    block_id {
                      _id
                    }
                    competence_id {
                      _id
                    }
                  }
                }
              }
            }
          }
        `,variables:{payload:e,_id:t}}).pipe((0,l.U)(a=>a.data.UpdateGrandOralValidation))}deleteGrandOralValidation(e){return this.apollo.mutate({mutation:i.ZP`
          mutation DeleteGrandOralValidation($_id: ID) {
            DeleteGrandOralValidation(_id: $_id) {
              rncp_id
              class_id
            }
          }
        `,variables:{_id:e}}).pipe((0,l.U)(t=>t.data.DeleteGrandOralValidation))}createOneCompetenceTemplate(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateCompetenceTemplate($blockId: ID!, $payload: CompetenceTemplateInput) {
            CreateCompetenceTemplate(block_of_competence_template_id: $blockId, competence_template_input: $payload) {
              _id
              ref_id
              name
              short_name
              description
            }
          }
        `,variables:{blockId:e,payload:t}}).pipe((0,l.U)(a=>a.data.CreateCompetenceTemplate))}createOneCriteriaOfEvaluationTemplate(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateCriteriaOfEvaluationTemplate($competenceId: ID!, $payload: CriteriaOfEvaluationTemplateInput) {
            CreateCriteriaOfEvaluationTemplate(competence_template_id: $competenceId, criteria_of_evaluation_template_input: $payload) {
              _id
              ref_id
              name
              description
            }
          }
        `,variables:{competenceId:e,payload:t}}).pipe((0,l.U)(a=>a.data.CreateCriteriaOfEvaluationTemplate))}saveAllCompetencyTemplate(e,t,a){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateUpdateBlockOfCompetenceTemplate($rncpId: ID!, $classId: ID!, $payload: [BlockOfCompetenceTemplateInput]) {
            CreateUpdateBlockOfCompetenceTemplate(
              rncp_title_id: $rncpId
              class_id: $classId
              block_of_competence_template_input: $payload
            ) {
              _id
              name
              description
              note
            }
          }
        `,variables:{rncpId:e,classId:t,payload:a},errorPolicy:"all"}).pipe((0,l.U)(o=>o))}getAllBlockOfSoftSkillTemplate(e,t){return this.apollo.query({query:i.ZP`
      query GetAllSoftSkillBlockTemplates{
        GetAllSoftSkillBlockTemplates(rncp_title_id:"${e}", class_id:"${t}"){
          _id
          ref_id
          name
          description
          note
          phrase_names {
            _id
            name
            phrase_type
            phrase_parameters {
              correlation
              pass_mark
              validation_type
              validation_parameter {
                parameter_type
                percentage_value
                ratio_value
                sign
                competence_softskill_template_id {
                  _id
                }
                criteria_of_evaluation_softskill_template_id {
                  _id
                }
              }
            }
          }
          competence_softskill_templates_id {
            _id
            ref_id
            name
            short_name
            description
            phrase_names {
              _id
              name
              phrase_parameters {
                correlation
                pass_mark
                validation_type
                validation_parameter {
                  parameter_type
                  percentage_value
                  ratio_value
                  sign
                  criteria_of_evaluation_softskill_template_id {
                    _id
                  }
                }
              }
            }
            criteria_of_evaluation_softskill_templates_id {
              _id
              ref_id
              name
              description
            }
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllSoftSkillBlockTemplates))}createOneBlockOfSoftSkillTemplate(e,t,a){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateSoftSkillBlockTemplate($rncpId: ID!, $classId: ID!, $payload: SoftSkillBlockTemplateInput) {
            CreateSoftSkillBlockTemplate(rncp_title_id: $rncpId, class_id: $classId, soft_skill_block_template_input: $payload) {
              _id
              ref_id
              name
              description
              note
            }
          }
        `,variables:{rncpId:e,classId:t,payload:a}}).pipe((0,l.U)(o=>o.data.CreateSoftSkillBlockTemplate))}createOneSoftSkillCompetenceTemplate(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateSoftSkillCompetenceTemplate($blockId: ID!, $payload: SoftSkillCompetenceTemplateInput) {
            CreateSoftSkillCompetenceTemplate(soft_skill_block_template_id: $blockId, soft_skill_competence_template_input: $payload) {
              _id
              ref_id
              name
              short_name
              description
            }
          }
        `,variables:{blockId:e,payload:t}}).pipe((0,l.U)(a=>a.data.CreateSoftSkillCompetenceTemplate))}createOneSoftSkillCriteriaOfEvaluationTemplate(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateSoftSkillEvaluationTemplate($competenceId: ID!, $payload: SoftSkillEvaluationTemplateInput) {
            CreateSoftSkillEvaluationTemplate(
              soft_skill_competence_template_id: $competenceId
              soft_skill_evaluation_template_input: $payload
            ) {
              _id
              ref_id
              name
              description
            }
          }
        `,variables:{competenceId:e,payload:t}}).pipe((0,l.U)(a=>a.data.CreateSoftSkillEvaluationTemplate))}saveAllSoftSkillTemplate(e,t,a){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateUpdateSoftSkillBlockOfCompetenceTemplate($rncpId: ID!, $classId: ID!, $payload: [SoftSkillBlockTemplateInput]) {
            CreateUpdateSoftSkillBlockOfCompetenceTemplate(
              rncp_title_id: $rncpId
              class_id: $classId
              soft_skill_block_template_input: $payload
            ) {
              _id
              name
              description
              note
            }
          }
        `,variables:{rncpId:e,classId:t,payload:a}}).pipe((0,l.U)(o=>o))}GetAllTitleDropdownListBySchool(e){return this.apollo.query({query:i.ZP`
        query GetAllTitleDropdownListBySchool{
          GetTitleDropdownList(school_id: "${e}") {
            _id
            short_name
            specializations {
              _id
              name
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetTitleDropdownList))}GetAllDocs(e,t,a){return this.apollo.query({query:i.ZP`
        query GetAllDocs{
          GetAllDocs(
            rncp_title_id: "${e}"
            student_id: "${t}"
            type_of_documents: [document_expected, pdf_result, student_upload_grand_oral_presentation, student_upload_grand_oral_cv, grand_oral_pdf, grand_oral_result_pdf]
            uploaded_for_student_group: true
          ) {
            _id
            status
            document_name
            document_generation_type
            s3_file_name
            parent_folder {
              parent_rncp_title {
                _id
              }
              school {
                _id
              }
              folder_name
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
                  _id
                }
                uploaded_for_student {
                  first_name
                  last_name
                }
                uploaded_for_other_user {
                  first_name
                  last_name
                }
                uploaded_for_group {
                  _id
                  name
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
              type_b_documents {
                _id
                document_name
                type_of_document
                s3_file_name
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
                  _id
                }
                uploaded_for_student {
                  first_name
                  last_name
                }
                uploaded_for_other_user {
                  first_name
                  last_name
                }
                uploaded_for_group {
                  _id
                  name
                }
              }
              grand_oral_pdfs {
                _id
                document_name
                s3_file_name
                type_of_document
                jury_organization_id {
                  _id
                }
                uploaded_for_student {
                  _id
                  first_name
                  last_name
                }
              }
              grand_oral_result_pdfs(logged_in_user_type_id: "${a}") {
                _id
                document_name
                s3_file_name
                type_of_document
                jury_organization_id {
                  _id
                }
                uploaded_for_student {
                  _id
                  first_name
                  last_name
                }
              }
              cv_docs{
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
                  _id
                }
                uploaded_for_student {
                  first_name
                  last_name
                }
                uploaded_for_other_user {
                  first_name
                  last_name
                }
                uploaded_for_group {
                  _id
                  name
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
              presentation_docs {
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
                  _id
                }
                uploaded_for_student {
                  first_name
                  last_name
                }
                uploaded_for_other_user {
                  first_name
                  last_name
                }
                uploaded_for_group {
                  _id
                  name
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
              tests {
                _id
                name
                group_test
                correction_type
                is_published
                documents {
                  _id
                  document_generation_type
                  document_name
                  type_of_document
                  s3_file_name
                  published_for_student
                  parent_class_id {
                    _id
                    name
                  }
                }
              }
              parent_folder_id {
                _id
                is_default_folder
                folder_name
              }
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(o=>o.data.GetAllDocs))}deleteBlockOfSoftSkillTemplate(e){return this.apollo.mutate({mutation:i.ZP`
      mutation DeleteSoftSkillBlockTemplate{
        DeleteSoftSkillBlockTemplate(_id: "${e}")
      }
      `,errorPolicy:"all"})}deleteSoftSkillCompetencyTemplate(e){return this.apollo.mutate({mutation:i.ZP`
      mutation DeleteSoftSkillCompetenceTemplate{
        DeleteSoftSkillCompetenceTemplate(_id: "${e}")
      }
      `,errorPolicy:"all"})}deleteSoftSkillCriteriaEvaluationTemplate(e){return this.apollo.mutate({mutation:i.ZP`
      mutation DeleteSoftSkillEvaluationTemplate{
        DeleteSoftSkillEvaluationTemplate(_id: "${e}")
      }
      `,errorPolicy:"all"})}GetAllTitleDropdownList(e){return this.apollo.query({query:i.ZP`
        query GetAllTitleDropdownList{
          GetTitleDropdownList(search: "${e}") {
            _id
            short_name
            specializations {
              _id
              name
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetTitleDropdownList))}GetAllTitlePublish(e){return this.apollo.query({query:i.ZP`
        query GetAllTitlePublish{
          GetTitleDropdownList(search: "${e}", isPublished: publish) {
            _id
            short_name
            specializations {
              _id
              name
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetTitleDropdownList))}getAllClassDropdownList(e){return this.apollo.query({query:i.ZP`
      query {
        GetClassDropdownList(rncp_id : "${e}"){
          _id
          name
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetClassDropdownList))}getAllClassDropdownListByEvaluationType(e,t){return this.apollo.query({query:i.ZP`
      query {
        GetClassDropdownList(rncp_id : "${e}" type_evaluation: ${t}){
          _id
          name
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetClassDropdownList))}getAlltestDropdownList(e,t){return this.apollo.query({query:i.ZP`
      query GetAlltestDropdownList{
        GetAllTests(rncp_title_id : "${e}", class_id : "${t}"){
          _id
          name
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllTests))}getAllTestGroupTestDropdownList(e,t){return this.apollo.query({query:i.ZP`
      query GetAllTestGroupTestDropdownList{
        GetAllTests(rncp_title_id : "${e}", class_id : "${t}", is_group_test: true){
          _id
          name
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllTests))}getOneTitleByIdForCourse(e){return this.apollo.query({query:i.ZP`
        query GetOneTitleByIdForCourse{
          GetOneTitle(_id: "${e}") {
            _id
            short_name
            classes {
              _id
              name
            }
            specializations {
              _id
              name
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneTitle))}GetAllDocuments(e,t){return this.apollo.query({query:i.ZP`
        query GetAllDocuments{
          GetAllDocs(published_for_student: true, rncp_title_id: "${e}") {
            _id
            document_name
            ${t}
            parent_class_id{
              _id
              name
            }
            published_for_student
            s3_file_name
            type_of_document
            document_generation_type
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllDocs))}CountParentFolderDeepForDocument(e){return this.apollo.query({query:i.ZP`
        query CountParentFolderDeepForDocument{
          CountParentFolderDeepForDocument(rncp_title_id: "${e}")
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.CountParentFolderDeepForDocument))}getClassNameFromId(e){return this.apollo.query({query:i.ZP`
        query GetClassNameFromId{
          GetOneClass(_id: "${e}") {
            name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetOneClass))}getTitlesOfCurrentUser(e){return this.apollo.query({query:i.ZP`
        query GetTitlesOfCurrentUser{
          GetAllTitles(filter_by_user_login: all, school_id: "${e}"){
            _id
            short_name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetAllTitles))}GetListTutorialAdded(){return this.apollo.watchQuery({query:i.ZP`
          query {
            GetAllInAppTutorial {
              _id
              module
              is_published
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(e=>e.data.GetAllInAppTutorial))}importStep2Template(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation ImportAcademicSkillTemplate($import_block_template_input: ImportBlockTemplateInput, $file: Upload!) {
            ImportAcademicSkillTemplate(import_block_template_input: $import_block_template_input, file: $file) {
              _id
              ref_id
            }
          }
        `,variables:{import_block_template_input:e,file:t},context:{useMultipart:!0}}).pipe((0,l.U)(a=>a.data.ImportAcademicSkillTemplate))}importStep3Template(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation ImportSoftSkillTemplate($import_block_template_input: ImportBlockTemplateInput, $file: Upload!) {
            ImportSoftSkillTemplate(import_block_template_input: $import_block_template_input, file: $file) {
              _id
              ref_id
            }
          }
        `,variables:{import_block_template_input:e,file:t},context:{useMultipart:!0}}).pipe((0,l.U)(a=>a.data.ImportSoftSkillTemplate))}exportGroupCSV(e,t,a,o,n){return this.apollo.mutate({mutation:i.ZP`
      mutation ExportGroupCSV{
        ExportGroups(rncp_id: "${e}", class_id: "${t}", test_id: "${a}", delimiter: "${o}", lang: "${n}")
      }
      `,errorPolicy:"all"}).pipe((0,l.U)(s=>s.data.ExportGroups))}TaskN7ForStatusUpdate(e){return this.apollo.mutate({mutation:i.ZP`
          mutation TaskN7ForStatusUpdate($rncp_id: ID!, $class_id: ID!, $test_id: [ID]) {
            TaskN7ForStatusUpdate(rncp_id: $rncp_id, class_id: $class_id, test_id: $test_id, lang: "${this.translate.currentLang}")
          }
        `,variables:{rncp_id:e.rncp_id,class_id:e.class_id,test_id:e.test_id}}).pipe((0,l.U)(t=>t.data.TaskN7ForStatusUpdate))}GetResponseForStatusUpdate(e,t){return this.apollo.query({query:i.ZP`
        query GetResponseForStatusUpdate{
          GetResponseForStatusUpdate(rncp_id: "${e}", class_id: "${t}")
        }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetResponseForStatusUpdate))}GetResponseForExportStatusUpdate(e,t,a){return this.apollo.query({query:i.ZP`
          query GetResponseForExportStatusUpdate($lang: String!) {
            GetResponseForExportStatusUpdate(lang: $lang, rncp_id: "${e}", class_id: "${t}", test_id: "${a}") {
              _id
              school {
                _id
                short_name
                long_name
              }
              rncp_title {
                _id
                short_name
                long_name
              }
              current_class {
                _id
                name
              }
              first_name
              last_name
              civility
              email
              test_name
              document_name
              student_document_name
              document_link
              upload_date
              upload_time
              student_score
              group_name
            }
          }
        `,variables:{lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},fetchPolicy:"network-only"}).pipe((0,l.U)(o=>o.data.GetResponseForExportStatusUpdate))}SendEmailStatusUpdate(e,t){return this.apollo.mutate({mutation:i.ZP`
          mutation SendEmailStatusUpdate($test_id: [ID], $delimiter: EnumDelimiter) {
            SendEmailStatusUpdate(test_id:$test_id , delimiter: $delimiter, lang: "${this.translate.currentLang}")
          }
        `,variables:{test_id:e,delimiter:t}}).pipe((0,l.U)(a=>a.data.SendEmailStatusUpdate))}saveNewQuestion(e){return this.apollo.mutate({mutation:i.ZP`
        mutation {
          CreateCriteriaOfEvaluationTemplateQuestion(criteria_of_evaluation_template_question_input: {
            s3_file_name: "${e.s3_file_name}",
            block_of_template_competence_id: "${e.block_of_template_competence_id}"
          }) {
            s3_file_name
            block_of_template_competence_id {
              _id
              name
            }
            status
          }
        }
        `}).pipe((0,l.U)(t=>t))}getLimitationForDocument(e){return this.apollo.query({query:i.ZP`
          query GetLimitationForDocument($doc_id: ID) {
            GetLimitationForDocument(doc_id: $doc_id) {
              student_allow
              operator_allow
              acad_allow
            }
          }
        `,variables:{doc_id:e},fetchPolicy:"network-only"}).pipe((0,l.U)(t=>t.data.GetLimitationForDocument))}getGrandOralPDF(e,t,a){return this.apollo.query({query:i.ZP`
          query GetGrandOralPDF($jury_id: ID, $student_id: ID, $user_type_id: ID) {
            GetGrandOralPDF(jury_id: $jury_id, student_id: $student_id, user_type_id: $user_type_id)
          }
        `,fetchPolicy:"network-only",variables:{jury_id:e,student_id:t,user_type_id:a}}).pipe((0,l.U)(o=>o.data.GetGrandOralPDF))}}r.\u0275fac=function(e){return new(e||r)(y.\u0275\u0275inject(k.eN),y.\u0275\u0275inject($._M),y.\u0275\u0275inject(g.sK))},r.\u0275prov=y.\u0275\u0275defineInjectable({token:r,factory:r.\u0275fac,providedIn:"root"}),c([(0,p.q)()],r.prototype,"getRncpTitles",null),c([(0,p.q)()],r.prototype,"getShortRncpTitles",null),c([(0,p.q)()],r.prototype,"getPendingTask",null),c([(0,p.q)()],r.prototype,"getCalendar",null),c([(0,p.q)()],r.prototype,"getAcademicKit",null),c([(0,p.q)()],r.prototype,"getAcadClass",null),c([(0,p.q)()],r.prototype,"getAcadDocuments",null)}}]);