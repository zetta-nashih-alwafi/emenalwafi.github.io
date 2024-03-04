"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[3119],{58800:(O,v,c)=>{c.d(v,{D:()=>D});var r=c(24850),l=c(13125),f=c(92340),h=c(94650),T=c(80529),u=c(18497),y=c(89383);let D=(()=>{class e{constructor(t,n,s){this.httpClient=t,this.apollo=n,this.translate=s}getAllTeachers(t,n,s){return this.apollo.query({query:l.ZP`
          query GetAllTeachers($pagination: PaginationInput, $filter: TeacherFilterInput, $sorting: TeacherSortingInput, $lang: String) {
            GetAllTeachers(pagination: $pagination, filter: $filter, sorting: $sorting, lang: $lang) {
              _id
              first_name
              civility
              last_name
              user_status
              count_document
              email
              entities {
                entity_name
                type {
                  _id
                  name
                }
              }
              teacher_required_document_process_ids {
                contract_type
                form_status
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:t,filter:n,sorting:s,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"}}).pipe((0,r.U)(d=>d.data.GetAllTeachers))}getAllTeachersForCheckbox(t,n,s){return this.apollo.query({query:l.ZP`
          query GetAllTeachers($pagination: PaginationInput, $filter: TeacherFilterInput, $sorting: TeacherSortingInput) {
            GetAllTeachers(pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:t,filter:n,sorting:s}}).pipe((0,r.U)(d=>d.data.GetAllTeachers))}createTeacher(t){return this.apollo.mutate({mutation:l.ZP`
          mutation CreateTeacher($userInput: UserInput) {
            CreateTeacher(create_teacher_input: $userInput) {
              _id
              civility
              first_name
              last_name
              email
            }
          }
        `,variables:{userInput:t}}).pipe((0,r.U)(n=>n.data.CreateTeacher))}validateOrRejectAcadDocument(t,n,s){return this.apollo.mutate({mutation:l.ZP`
          mutation ValidateOrRejectAcadDocument($acad_doc_id: ID!, $validation_status: EnumValidationStatus,$sender_user_type_ids: [ID],$sender_user_id: ID) {
            ValidateOrRejectAcadDocument(acad_doc_id: $acad_doc_id, validation_status: $validation_status,sender_user_type_ids:$sender_user_type_ids,sender_user_id:$sender_user_id) {
              _id
            }
          }
        `,variables:{acad_doc_id:t?._id,validation_status:t?.validationStatus,sender_user_type_ids:n,sender_user_id:s}}).pipe((0,r.U)(d=>d.data.ValidateOrRejectAcadDocument))}sendReminderRequiredDocument(t){return this.apollo.mutate({mutation:l.ZP`
          mutation SendReminderRequiredDocument($user_id: ID!) {
            SendReminderRequiredDocument(user_id: $user_id) {
              _id
            }
          }
        `,variables:{user_id:t,lang:this.translate?.currentLang?this.translate.currentLang:"fr"}}).pipe((0,r.U)(n=>n.data.SendReminderRequiredDocument))}getAllTypeOfIntervention(t,n,s){return this.apollo.query({query:l.ZP`
          query GetAllTypeOfIntervention(
            $pagination: PaginationInput
            $filter: TypeOfInterventionFilterInput
            $sorting: TypeOfInterventionSorting
          ) {
            GetAllTypeOfIntervention(pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
              scholar_season_id {
                _id
                scholar_season
              }
              user_id {
                _id
                first_name
                last_name
              }
              legal_entity_id {
                _id
                legal_entity_name
              }
              type_of_intervention
              hourly_rate
              type_of_contract
              count_document
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:t,filter:n,sorting:s}}).pipe((0,r.U)(d=>d.data.GetAllTypeOfIntervention))}getAllTypeOfInterventionManualTeacher(t){return this.apollo.query({query:l.ZP`
          query GetAllTypeOfIntervention($filter: TypeOfInterventionFilterInput) {
            GetAllTypeOfIntervention(filter: $filter) {
              _id
              scholar_season_id {
                _id
                scholar_season
              }
              user_id {
                _id
                first_name
                last_name
              }
              legal_entity_id {
                _id
                legal_entity_name
              }
              type_of_intervention
              hourly_rate
              type_of_contract
              count_document
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:t}}).pipe((0,r.U)(n=>n.data.GetAllTypeOfIntervention))}getAllLegalEntitiesDropdown(t){return this.apollo.watchQuery({query:l.ZP`
          query GetAllLegalEntities($filter: LegalEntityFilterInput) {
            GetAllLegalEntities(filter: $filter) {
              _id
              legal_entity_name
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:t}}).valueChanges.pipe((0,r.U)(n=>n.data.GetAllLegalEntities))}getAllTeacherFromLegalEntity(t,n){return this.apollo.watchQuery({query:l.ZP`
          query GetAllTeacherFromLegalEntity($legal_entity_id: ID!, $scholar_season_id: ID) {
            GetAllTeacherFromLegalEntity(legal_entity_id: $legal_entity_id, scholar_season_id: $scholar_season_id) {
              _id
              first_name
              last_name
              civility
            }
          }
        `,fetchPolicy:"network-only",variables:{legal_entity_id:t,scholar_season_id:n}}).valueChanges.pipe((0,r.U)(s=>s.data.GetAllTeacherFromLegalEntity))}createManualTeacherSubject(t){return this.apollo.mutate({mutation:l.ZP`
          mutation CreateManualTeacherSubject($manual_teacher_subject_input: TeacherSubjectManualInput) {
            CreateManualTeacherSubject(manual_teacher_subject_input: $manual_teacher_subject_input) {
              _id
            }
          }
        `,variables:{manual_teacher_subject_input:t}}).pipe((0,r.U)(n=>n.data.CreateManualTeacherSubject))}getAllTypeOfInterventionDropdownData(t){return this.apollo.query({query:l.ZP`
          query GetAllTypeOfIntervention($filter: TypeOfInterventionFilterInput) {
            GetAllTypeOfIntervention(filter: $filter) {
              _id
              scholar_season_id {
                _id
                scholar_season
              }
              user_id {
                _id
                first_name
                last_name
              }
              legal_entity_id {
                _id
                legal_entity_name
              }
              type_of_intervention
              hourly_rate
              type_of_contract
              count_document
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:t}}).pipe((0,r.U)(n=>n.data.GetAllTypeOfIntervention))}getAllTypeOfInterventionDropdown(){return this.apollo.query({query:l.ZP`
          query GetAllTypeOfInterventionDropdown {
            GetAllTypeOfInterventionDropdown {
              _id
              scholar_season_id {
                _id
                scholar_season
              }
              user_id {
                _id
                first_name
                last_name
              }
              legal_entity_id {
                _id
                legal_entity_name
              }
              type_of_intervention
              hourly_rate
              type_of_contract
              count_document
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,r.U)(t=>t.data.GetAllTypeOfInterventionDropdown))}getAllProgramSequenceDropdown(){return this.apollo.query({query:l.ZP`
          query GetAllProgramSequenceDropdown {
            GetAllProgramSequenceDropdown {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,r.U)(t=>t.data.GetAllProgramSequenceDropdown))}getAllProgramSubjectDropdown(){return this.apollo.query({query:l.ZP`
          query getAllProgramSubjectDropdown {
            getAllProgramSubjectDropdown {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,r.U)(t=>t.data.getAllProgramSubjectDropdown))}getAllTeacherSubjectLegalEntityDropdown(){return this.apollo.query({query:l.ZP`
          query getAllTeacherSubjectLegalEntityDropdown {
            getAllTeacherSubjectLegalEntityDropdown {
              _id
              legal_entity_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,r.U)(t=>t.data.getAllTeacherSubjectLegalEntityDropdown))}getAllTeacherSequenceDropdown(){return this.apollo.query({query:l.ZP`
          query GetAllTeacherSubjectProgramSequenceDropdown {
            GetAllTeacherSubjectProgramSequenceDropdown {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,r.U)(t=>t.data.GetAllTeacherSubjectProgramSequenceDropdown))}createIntervention(t){return this.apollo.mutate({mutation:l.ZP`
          mutation CreateTypeOfIntervention($type_intervention_input: TypeOfInterventionInput!) {
            CreateTypeOfIntervention(type_intervention_input: $type_intervention_input) {
              _id
            }
          }
        `,variables:{type_intervention_input:t}}).pipe((0,r.U)(n=>n.data.CreateTypeOfIntervention))}updateIntervention(t,n){return this.apollo.mutate({mutation:l.ZP`
          mutation UpdateTypeOfIntervention($_id: ID!, $type_intervention_input: TypeOfInterventionInput!) {
            UpdateTypeOfIntervention(_id: $_id, type_intervention_input: $type_intervention_input) {
              _id
            }
          }
        `,variables:{_id:t,type_intervention_input:n}}).pipe((0,r.U)(s=>s.data.UpdateTypeOfIntervention))}deleteIntervention(t){return this.apollo.mutate({mutation:l.ZP`
          mutation DeleteTypeOfIntervention($_id: ID!) {
            DeleteTypeOfIntervention(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:t}}).pipe((0,r.U)(n=>n.data.DeleteTypeOfIntervention))}getAllTeacherSubjects(t,n,s,d){return this.apollo.query({query:l.ZP`
          query GetAllTeacherSubject(
            $pagination: PaginationInput
            $filter: TeacherSubjectFilter
            $sorting: TeacherSubjectSorting
            $user_type_ids: [ID]
          ) {
            GetAllTeacherSubject(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids) {
              # subject
              # volume_of_hour
              _id
              count_document
              contract_status
              volume_hours_assigned
              generation_source
              program_sequence_id {
                _id
                name
              }
              program_subject_id {
                _id
                name
                volume_hours_total
                program_sessions_id {
                  _id
                  name
                  volume_hours
                }
              }
              program_session {
                _id
                name
                volume_hours
                volume_hours_assigned
              }
              teacher_id {
                _id
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
              sequence_id {
                name
              }
              course_subject_id {
                name
              }
              type_of_intervention_id {
                _id
                type_of_intervention
                type_of_contract
                hourly_rate
                legal_entity_id {
                  _id
                  legal_entity
                  legal_entity_name
                }
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:t,sorting:s,filter:n,user_type_ids:d}}).pipe((0,r.U)(m=>m.data.GetAllTeacherSubject))}getAllTeacherSubjectsCheckbox(t,n,s,d){return this.apollo.query({query:l.ZP`
          query GetAllTeacherSubject(
            $pagination: PaginationInput
            $filter: TeacherSubjectFilter
            $sorting: TeacherSubjectSorting
            $user_type_ids: [ID]
          ) {
            GetAllTeacherSubject(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids) {
              _id
              contract_status
              volume_hours_assigned
              program_subject_id {
                _id
                name
                volume_hours_total
                program_sessions_id {
                  _id
                  name
                  volume_hours
                }
              }
              program_session {
                _id
                name
                volume_hours
                volume_hours_assigned
              }
              teacher_id {
                _id
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
              type_of_intervention_id {
                _id
                type_of_intervention
                type_of_contract
                hourly_rate
                legal_entity_id {
                  _id
                  legal_entity
                  legal_entity_name
                }
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:t,sorting:s,filter:n,user_type_ids:d}}).pipe((0,r.U)(m=>m.data.GetAllTeacherSubject))}getAllTeacherForExportCheckbox(t,n,s,d){return this.apollo.query({query:l.ZP`
          query GetAllTeacherSubject(
            $pagination: PaginationInput
            $filter: TeacherSubjectFilter
            $sorting: TeacherSubjectSorting
            $user_type_ids: [ID]
          ) {
            GetAllTeacherSubject(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids) {
              _id
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:t,sorting:s,filter:n,user_type_ids:d}}).pipe((0,r.U)(m=>m.data.GetAllTeacherSubject))}getAllTeacherForContractCheckbox(t,n,s,d){return this.apollo.query({query:l.ZP`
          query GetAllTeacherSubject(
            $pagination: PaginationInput
            $filter: TeacherSubjectFilter
            $sorting: TeacherSubjectSorting
            $user_type_ids: [ID]
          ) {
            GetAllTeacherSubject(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids) {
              _id
              contract_status
              teacher_id {
                _id
                civility
                first_name
                last_name
              }
              program_id {
                scholar_season_id {
                  _id
                }
              }
              type_of_intervention_id {
                legal_entity_id {
                  _id
                }
                type_of_contract
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:t,sorting:s,filter:n,user_type_ids:d}}).pipe((0,r.U)(m=>m.data.GetAllTeacherSubject))}getAllTeacherSubjectsAssignTable(t,n,s,d){return this.apollo.query({query:l.ZP`
          query GetAllTeacherSubject(
            $pagination: PaginationInput
            $filter: TeacherSubjectFilter
            $sorting: TeacherSubjectSorting
            $user_type_ids: [ID]
          ) {
            GetAllTeacherSubject(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids) {
              _id
              count_document
              number_of_group
              number_of_group_assigned
              volume_hours_assigned
              program_sequence_id {
                _id
                name
              }
              program_module_id {
                _id
                name
              }
              program_session {
                _id
                name
                duration
                class_group
                volume_hours
                volume_hours_student
                volume_hours_assigned
              }
              program_subject_id {
                _id
                name
                program_sessions_id {
                  _id
                  name
                  duration
                  class_group
                  volume_hours
                  volume_hours_student
                }
              }
              teacher_id {
                _id
                civility
                first_name
                last_name
              }
              type_of_intervention_id {
                _id
                type_of_intervention
                type_of_contract
                hourly_rate
              }
              program_id {
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
                course_sequence_id {
                  _id
                  program_sequences_id {
                    _id
                  }
                }
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:t,sorting:s,filter:n,user_type_ids:d}}).pipe((0,r.U)(m=>m.data.GetAllTeacherSubject))}getAllTeacherSubjectsAssignTableDropdown(t,n){return this.apollo.query({query:l.ZP`
          query GetAllTeacherSubject($filter: TeacherSubjectFilter, $user_type_ids: [ID]) {
            GetAllTeacherSubject(filter: $filter, user_type_ids: $user_type_ids) {
              _id
              count_document
              number_of_group
              number_of_group_assigned
              program_sequence_id {
                _id
                name
              }
              program_module_id {
                _id
                name
              }
              program_subject_id {
                _id
                name
                program_sessions_id {
                  _id
                  name
                  duration
                  class_group
                  volume_hours
                  volume_hours_student
                }
              }
              teacher_id {
                _id
                civility
                first_name
                last_name
              }
              type_of_intervention_id {
                _id
                type_of_intervention
                type_of_contract
                hourly_rate
              }
              program_id {
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
                course_sequence_id {
                  _id
                  program_sequences_id {
                    _id
                  }
                }
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{user_type_ids:n,filter:t}}).pipe((0,r.U)(s=>s.data.GetAllTeacherSubject))}askRequiredDocumentsForTeachers(t){return this.apollo.mutate({mutation:l.ZP`
          mutation AskRequiredDocumentForTeachers(
            $type_of_contract: EnumFilterTypeOfContract
            $user_validator: ID
            $filter: TeacherFilterInput
            $sorting: TeacherSortingInput
            $selected_teacher_ids: [ID]
            $lang: String
            $user_type_sender_id: ID
          ) {
            AskRequiredDocumentForTeachers(
              type_of_contract: $type_of_contract
              user_validator: $user_validator
              filter: $filter
              sorting: $sorting
              selected_teacher_ids: $selected_teacher_ids
              lang: $lang
              user_type_sender_id: $user_type_sender_id
            )
          }
        `,variables:{type_of_contract:t?.contract_type,user_validator:t?.user_validator,filter:t?.filter,sorting:t?.sorting,selected_teacher_ids:t?.selected_teacher_ids,lang:this.translate?.currentLang?this.translate.currentLang:"fr",user_type_sender_id:t?.user_type_sender_id}}).pipe((0,r.U)(n=>n.data.AskRequiredDocumentForTeachers))}GetDataForImportObjectives(t,n){return this.apollo.watchQuery({query:l.ZP`
          query{
            GetAllCandidateSchool(filter: { scholar_season_id: "${t}" }, user_type_id: "${n}") {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,r.U)(s=>s.data.GetAllCandidateSchool))}GetDataForSchoolSuperFilter(t,n){return this.apollo.watchQuery({query:l.ZP`
          query GetAllCandidateSchool($user_type_id: ID) {
            GetAllCandidateSchool(filter: { scholar_season_id: "${t}" }, user_type_id: $user_type_id) {
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
        `,variables:{user_type_id:n},fetchPolicy:"network-only"}).valueChanges.pipe((0,r.U)(s=>s.data.GetAllCandidateSchool))}getAllScholarSeasons(t,n,s){return this.apollo.query({query:l.ZP`
          query GetAllScholarSeasons($pagination: PaginationInput, $sort: ScholarSeasonSortingInput) {
            GetAllScholarSeasons(pagination: $pagination, sorting: $sort, filter: { is_published: true }) {
              _id
              scholar_season
            }
          }
        `,variables:{pagination:t,sort:n||{}},fetchPolicy:"network-only"}).pipe((0,r.U)(d=>d.data.GetAllScholarSeasons))}getAllLegalEntities(t){return this.apollo.query({query:l.ZP`
          query GetAllLegalEntities($filter: LegalEntityFilterInput) {
            GetAllLegalEntities(filter: $filter) {
              _id
              legal_entity_name
            }
          }
        `,variables:{filter:t},fetchPolicy:"network-only"}).pipe((0,r.U)(n=>n.data.GetAllLegalEntities))}getDropDownTypeOfIntervention(t){return this.apollo.query({query:l.ZP`
          query GetAllTypeOfIntervention($filter: TypeOfInterventionFilterInput) {
            GetAllTypeOfIntervention(filter: $filter) {
              _id
              type_of_intervention
              type_of_contract
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:t}}).pipe((0,r.U)(n=>n.data.GetAllTypeOfIntervention))}assignTeacherToSubject(t){return this.apollo.mutate({mutation:l.ZP`
          mutation AssignTeacherToSubject($teacher_subject_id: ID, $teacher_id: ID, $number_of_group: Int, $type_of_intervention_id: ID) {
            AssignTeacherToSubject(
              teacher_subject_id: $teacher_subject_id
              teacher_id: $teacher_id
              number_of_group: $number_of_group
              type_of_intervention_id: $type_of_intervention_id
            ) {
              teacher_id {
                _id
                civility
                first_name
                last_name
              }
              program_subject_id {
                _id
                name
              }
            }
          }
        `,variables:{teacher_subject_id:t.teacher_subject_id,teacher_id:t.teacher_id,number_of_group:t.number_of_group,type_of_intervention_id:t.type_of_intervention_id}}).pipe((0,r.U)(n=>n.data.AssignTeacherToSubject))}deleteTeacherFromSubject(t,n,s,d){return this.apollo.mutate({mutation:l.ZP`
        mutation DeleteTeacherFromSubject($teacher_subject_id: ID, $teacher_id: ID, $number_of_group: Int, $type_of_intervention_id: ID) {
          DeleteTeacherFromSubject(
            teacher_subject_id: $teacher_subject_id
            teacher_id: $teacher_id
            number_of_group: $number_of_group
            type_of_intervention_id: $type_of_intervention_id
          ) {
            _id
            program_subject_id {
              _id
              name
            }
            teacher_id {
              _id
              first_name
              last_name
            }
            program_id {
              program
            }
          }
        }
      `,variables:{teacher_subject_id:t,teacher_id:n,number_of_group:s,type_of_intervention_id:d}})}getTeacherDropdown(t,n,s){return this.apollo.query({query:l.ZP`
          query GetAllTeachers($filter: TeacherFilterInput, $pagination: PaginationInput) {
            GetAllTeachers(filter: $filter, pagination: $pagination) {
              _id
              first_name
              last_name
              civility
            }
          }
        `,fetchPolicy:"network-only",variables:{user_type_login:t,filter:n,pagination:s||null}}).pipe((0,r.U)(d=>d.data.GetAllTeachers))}getTypeInterventionDropDown(t){return this.apollo.query({query:l.ZP`
          query GetAllTypeOfIntervention($teacher_id: ID) {
            GetAllTypeOfIntervention(filter: { teacher_id: $teacher_id }) {
              _id
              type_of_intervention
              teacher_id {
                _id
                first_name
                last_name
              }
              legal_entity_id {
                _id
                legal_entity
                legal_entity_name
              }
            }
          }
        `,variables:{teacher_id:t}}).pipe((0,r.U)(n=>n.data.GetAllTypeOfIntervention))}getTypeOfInterventionAssignTeacher(t){return this.apollo.query({query:l.ZP`
          query GetAllTypeOfIntervention($filter: TypeOfInterventionFilterInput) {
            GetAllTypeOfIntervention(filter: $filter) {
              _id
              type_of_intervention
              type_of_contract
              teacher_id {
                _id
                first_name
                last_name
              }
              legal_entity_id {
                _id
                legal_entity
                legal_entity_name
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:t}}).pipe((0,r.U)(n=>n.data.GetAllTypeOfIntervention))}getOneProgram(t){return this.apollo.query({query:l.ZP`
          query GetOneProgram($programId: ID!) {
            GetOneProgram(_id: $programId) {
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
              scholar_season_id {
                _id
                scholar_season
              }
              speciality_id {
                _id
                name
              }
            }
          }
        `,variables:{programId:t}}).pipe((0,r.U)(n=>n.data.GetOneProgram))}downloadTemplateTeacherManagement(t){const n=localStorage.getItem("currentLang"),s=f.N.apiUrl.replace("graphql",""),d=document.createElement("a");d.href=`${s}downloadImportTeacherTemplate/${t}/${n}`,d.target="_blank",d.download="Template Oscar CSV",document.body.appendChild(d),d.click(),document.body.removeChild(d)}ImportTeacherData(t,n){return this.apollo.mutate({mutation:l.ZP`
          mutation ImportTeacherData($file_delimiter: String, $file: Upload!, $lang: String) {
            ImportTeacherData(file_delimiter: $file_delimiter, file: $file, lang: $lang) {
              is_error
              total_imported_teachers
            }
          }
        `,variables:{file:n,file_delimiter:t,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},context:{useMultipart:!0}}).pipe((0,r.U)(s=>s.data.ImportTeacherData))}getAllTeacherDocuments(t,n,s,d){return this.apollo.query({query:l.ZP`
          query GetAllTeacherDocuments(
            $pagination: PaginationInput
            $filteredValues: TeacherDocumentsFilterInput
            $sortValue: TeacherDocumentsSortingInput
            $type: [String]
            $lang: String
          ) {
            GetAllTeacherDocuments(
              type_of_documents: $type
              pagination: $pagination
              filter: $filteredValues
              sorting: $sortValue
              lang: $lang
            ) {
              _id
              document_name
              type_of_document
              count_document
              s3_file_name
              created_at
              type_of_contract
              date_of_validation {
                date
                time
              }
              document_status
              date_of_expired {
                date
                time
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:t,filteredValues:n,sortValue:s,type:d,lang:this.translate?.currentLang?this.translate.currentLang:"fr"}}).pipe((0,r.U)(m=>m.data.GetAllTeacherDocuments))}sendTeacherToHyperplanning(){return this.apollo.mutate({mutation:l.ZP`
          mutation SendTeacherToHyperplanning {
            SendTeacherToHyperplanning
          }
        `}).pipe((0,r.U)(t=>t.data.SendTeacherToHyperplanning))}updateAcadDoc(t,n){return this.apollo.mutate({mutation:l.ZP`
          mutation UpdateAcadDoc($_id: ID!, $doc_input: AcadDocumentInput) {
            UpdateAcadDoc(_id: $_id, doc_input: $doc_input) {
              _id
            }
          }
        `,variables:{doc_input:n,_id:t}}).pipe((0,r.U)(s=>s.data.UpdateAcadDoc))}deleteTeacherSubject(t){return this.apollo.mutate({mutation:l.ZP`
          mutation DeleteTeacherSubject($_id: ID!) {
            DeleteTeacherSubject(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:t}}).pipe((0,r.U)(n=>n.data.DeleteTeacherSubject))}updateTeacherSubject(t,n){return this.apollo.mutate({mutation:l.ZP`
          mutation UpdateTeacherSubject($_id: ID!, $teacher_subject_input: TeacherSubjectInput) {
            UpdateTeacherSubject(_id: $_id, teacher_subject_input: $teacher_subject_input) {
              _id
            }
          }
        `,variables:{_id:t,teacher_subject_input:n}}).pipe((0,r.U)(s=>s.data.UpdateTeacherSubject))}duplicateTypeOfIntervention(t,n){return this.apollo.mutate({mutation:l.ZP`
          mutation DuplicateTypeOfIntervention($type_of_intervention_ids: [ID!]!, $destination_scholar_season_id: ID!) {
            DuplicateTypeOfIntervention(
              type_of_intervention_ids: $type_of_intervention_ids
              destination_scholar_season_id: $destination_scholar_season_id
            ) {
              _id
              scholar_season_id {
                scholar_season
              }
            }
          }
        `,variables:{type_of_intervention_ids:t,destination_scholar_season_id:n}}).pipe((0,r.U)(s=>s.data.DuplicateTypeOfIntervention))}getOneTeacherSubject(t){return this.apollo.query({query:l.ZP`
          query GetOneTeacherSubject($_id: ID) {
            GetOneTeacherSubject(_id: $_id) {
              _id
              generation_source
              teacher_id {
                _id
                civility
                first_name
                last_name
              }
              type_of_intervention_id {
                _id
                type_of_intervention
                type_of_contract
                hourly_rate
                legal_entity_id {
                  _id
                  legal_entity_name
                }
              }
              program_id {
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
                scholar_season_id {
                  _id
                  scholar_season
                }
                sector_id {
                  _id
                  name
                }
                speciality_id {
                  _id
                  name
                }
              }
              sequence_id {
                _id
                name
              }
              course_subject_id {
                _id
                name
                short_name
              }
              volume_hours_assigned
            }
          }
        `,fetchPolicy:"network-only",variables:{_id:t}}).pipe((0,r.U)(n=>n.data.GetOneTeacherSubject))}}return e.\u0275fac=function(t){return new(t||e)(h.\u0275\u0275inject(T.eN),h.\u0275\u0275inject(u._M),h.\u0275\u0275inject(y.sK))},e.\u0275prov=h.\u0275\u0275defineInjectable({token:e,factory:e.\u0275fac,providedIn:"root"}),e})()},13119:(O,v,c)=>{c.d(v,{K:()=>ee});var r=c(24006),l=c(65938),f=c(62395),h=c(68745),T=c(35226),u=c.n(T),y=c(17489),e=c(94650),I=c(52688),t=c(610),n=c(87746),s=c(89383),d=c(96334),m=c(58800),P=c(12334),$=c(84075),S=c(73555),x=c(4859),U=c(97392),E=c(59549),M=c(284),w=c(51572),A=c(71948),C=c(36895),b=c(88796);const L=["mobileNumber"];function j(o,p){1&o&&(e.\u0275\u0275elementContainerStart(0),e.\u0275\u0275elementStart(1,"div",12),e.\u0275\u0275element(2,"mat-spinner",13),e.\u0275\u0275elementEnd(),e.\u0275\u0275elementContainerEnd())}function R(o,p){1&o&&(e.\u0275\u0275elementStart(0,"mat-error"),e.\u0275\u0275text(1),e.\u0275\u0275pipe(2,"translate"),e.\u0275\u0275elementEnd()),2&o&&(e.\u0275\u0275advance(1),e.\u0275\u0275textInterpolate(e.\u0275\u0275pipeBind1(2,1,"This field is required")))}function q(o,p){1&o&&(e.\u0275\u0275elementStart(0,"span",20),e.\u0275\u0275text(1),e.\u0275\u0275pipe(2,"translate"),e.\u0275\u0275elementEnd()),2&o&&(e.\u0275\u0275advance(1),e.\u0275\u0275textInterpolate(e.\u0275\u0275pipeBind1(2,1,"Invalid email")))}function B(o,p){1&o&&e.\u0275\u0275element(0,"mat-progress-spinner",25),2&o&&e.\u0275\u0275property("diameter",25)}function G(o,p){if(1&o){const a=e.\u0275\u0275getCurrentView();e.\u0275\u0275elementContainerStart(0),e.\u0275\u0275elementStart(1,"div",21)(2,"button",22),e.\u0275\u0275listener("click",function(){e.\u0275\u0275restoreView(a);const _=e.\u0275\u0275nextContext(2);return e.\u0275\u0275resetView(_.verifyEmail())}),e.\u0275\u0275text(3),e.\u0275\u0275pipe(4,"translate"),e.\u0275\u0275elementEnd()(),e.\u0275\u0275elementStart(5,"div",23),e.\u0275\u0275template(6,B,1,1,"mat-progress-spinner",24),e.\u0275\u0275elementEnd(),e.\u0275\u0275elementContainerEnd()}if(2&o){const a=e.\u0275\u0275nextContext(2);e.\u0275\u0275advance(2),e.\u0275\u0275property("disabled",a.addNewUserForm.get("email").invalid),e.\u0275\u0275advance(1),e.\u0275\u0275textInterpolate1(" ",e.\u0275\u0275pipeBind1(4,3,"COMPANY.Check Email Availability")," "),e.\u0275\u0275advance(3),e.\u0275\u0275property("ngIf",a.isVerifyingEmail)}}function N(o,p){1&o&&(e.\u0275\u0275elementContainerStart(0),e.\u0275\u0275elementStart(1,"mat-radio-button",45),e.\u0275\u0275text(2),e.\u0275\u0275pipe(3,"translate"),e.\u0275\u0275elementEnd(),e.\u0275\u0275elementContainerEnd()),2&o&&(e.\u0275\u0275advance(2),e.\u0275\u0275textInterpolate(e.\u0275\u0275pipeBind1(3,1,"Neutral")))}function F(o,p){1&o&&(e.\u0275\u0275elementStart(0,"mat-error"),e.\u0275\u0275text(1),e.\u0275\u0275pipe(2,"translate"),e.\u0275\u0275elementEnd()),2&o&&(e.\u0275\u0275advance(1),e.\u0275\u0275textInterpolate(e.\u0275\u0275pipeBind1(2,1,"This field is required")))}function W(o,p){1&o&&(e.\u0275\u0275elementStart(0,"mat-error"),e.\u0275\u0275text(1),e.\u0275\u0275pipe(2,"translate"),e.\u0275\u0275elementEnd()),2&o&&(e.\u0275\u0275advance(1),e.\u0275\u0275textInterpolate(e.\u0275\u0275pipeBind1(2,1,"This field is required")))}function k(o,p){1&o&&(e.\u0275\u0275elementStart(0,"mat-error"),e.\u0275\u0275text(1),e.\u0275\u0275pipe(2,"translate"),e.\u0275\u0275elementEnd()),2&o&&(e.\u0275\u0275advance(1),e.\u0275\u0275textInterpolate1(" ",e.\u0275\u0275pipeBind1(2,1,"You can only input number in this field")," "))}function K(o,p){if(1&o&&(e.\u0275\u0275elementStart(0,"span",48),e.\u0275\u0275text(1),e.\u0275\u0275elementEnd()),2&o){const a=e.\u0275\u0275nextContext().item;e.\u0275\u0275advance(1),e.\u0275\u0275textInterpolate1("+",null==a?null:a.dialCode,"")}}function Z(o,p){if(1&o&&(e.\u0275\u0275element(0,"img",46),e.\u0275\u0275template(1,K,2,1,"span",47)),2&o){const a=p.item,i=e.\u0275\u0275nextContext(3);e.\u0275\u0275property("src",i.flagsIconPath+(null==a?null:a.flagIcon)+".svg",e.\u0275\u0275sanitizeUrl),e.\u0275\u0275advance(1),e.\u0275\u0275property("ngIf",null==a?null:a.flagIcon)}}function V(o,p){if(1&o&&(e.\u0275\u0275elementContainerStart(0),e.\u0275\u0275element(1,"img",50),e.\u0275\u0275text(2),e.\u0275\u0275pipe(3,"translate"),e.\u0275\u0275elementContainerEnd()),2&o){const a=e.\u0275\u0275nextContext().$implicit,i=e.\u0275\u0275nextContext(3);e.\u0275\u0275advance(1),e.\u0275\u0275property("src",i.flagsIconPath+(null==a?null:a.flagIcon)+".svg",e.\u0275\u0275sanitizeUrl),e.\u0275\u0275advance(1),e.\u0275\u0275textInterpolate2(" ",e.\u0275\u0275pipeBind1(3,3,null==a?null:a.name)," +",null==a?null:a.dialCode," ")}}function Q(o,p){if(1&o&&(e.\u0275\u0275elementStart(0,"ng-option",49),e.\u0275\u0275template(1,V,4,5,"ng-container",10),e.\u0275\u0275elementEnd()),2&o){const a=p.$implicit;e.\u0275\u0275property("value",a),e.\u0275\u0275advance(1),e.\u0275\u0275property("ngIf",null==a?null:a.name)}}function X(o,p){1&o&&(e.\u0275\u0275elementStart(0,"mat-error"),e.\u0275\u0275text(1),e.\u0275\u0275pipe(2,"translate"),e.\u0275\u0275elementEnd()),2&o&&(e.\u0275\u0275advance(1),e.\u0275\u0275textInterpolate1(" ",e.\u0275\u0275pipeBind1(2,1,"You can only input number in this field")," "))}function H(o,p){1&o&&(e.\u0275\u0275elementStart(0,"mat-error"),e.\u0275\u0275text(1),e.\u0275\u0275pipe(2,"translate"),e.\u0275\u0275elementEnd()),2&o&&(e.\u0275\u0275advance(1),e.\u0275\u0275textInterpolate(e.\u0275\u0275pipeBind1(2,1,"This field is required")))}function Y(o,p){if(1&o){const a=e.\u0275\u0275getCurrentView();e.\u0275\u0275elementContainerStart(0),e.\u0275\u0275elementStart(1,"div",2)(2,"div",26)(3,"mat-radio-group",27)(4,"span"),e.\u0275\u0275text(5),e.\u0275\u0275pipe(6,"translate"),e.\u0275\u0275elementEnd(),e.\u0275\u0275elementStart(7,"mat-radio-button",28),e.\u0275\u0275text(8),e.\u0275\u0275pipe(9,"translate"),e.\u0275\u0275elementEnd(),e.\u0275\u0275elementStart(10,"mat-radio-button",29),e.\u0275\u0275text(11),e.\u0275\u0275pipe(12,"translate"),e.\u0275\u0275elementEnd(),e.\u0275\u0275template(13,N,4,3,"ng-container",10),e.\u0275\u0275elementEnd()()(),e.\u0275\u0275elementStart(14,"div",2)(15,"div",30)(16,"mat-form-field",17),e.\u0275\u0275element(17,"input",31),e.\u0275\u0275pipe(18,"translate"),e.\u0275\u0275template(19,F,3,3,"mat-error",10),e.\u0275\u0275elementEnd()(),e.\u0275\u0275elementStart(20,"div",30)(21,"mat-form-field",17),e.\u0275\u0275element(22,"input",32),e.\u0275\u0275pipe(23,"translate"),e.\u0275\u0275template(24,W,3,3,"mat-error",10),e.\u0275\u0275elementEnd()()(),e.\u0275\u0275elementStart(25,"div",2)(26,"div",33)(27,"mat-form-field",17),e.\u0275\u0275element(28,"input",34),e.\u0275\u0275pipe(29,"translate"),e.\u0275\u0275template(30,k,3,3,"mat-error",10),e.\u0275\u0275elementEnd()(),e.\u0275\u0275elementStart(31,"div",33)(32,"div",2)(33,"div",35)(34,"mat-label",36),e.\u0275\u0275text(35),e.\u0275\u0275pipe(36,"translate"),e.\u0275\u0275elementEnd(),e.\u0275\u0275elementStart(37,"div",37)(38,"ng-select",38),e.\u0275\u0275listener("change",function(_){e.\u0275\u0275restoreView(a);const g=e.\u0275\u0275nextContext(2);return e.\u0275\u0275resetView(g.selectionDialCode(_))}),e.\u0275\u0275template(39,Z,2,2,"ng-template",39),e.\u0275\u0275template(40,Q,2,2,"ng-option",40),e.\u0275\u0275elementEnd()(),e.\u0275\u0275elementStart(41,"div",41)(42,"mat-form-field"),e.\u0275\u0275element(43,"input",42,43),e.\u0275\u0275template(45,X,3,3,"mat-error",10),e.\u0275\u0275elementEnd()()()()(),e.\u0275\u0275elementStart(46,"div",33)(47,"mat-form-field",17),e.\u0275\u0275element(48,"input",44),e.\u0275\u0275pipe(49,"translate"),e.\u0275\u0275template(50,H,3,3,"mat-error",10),e.\u0275\u0275elementEnd()()(),e.\u0275\u0275elementContainerEnd()}if(2&o){const a=e.\u0275\u0275nextContext(2);e.\u0275\u0275advance(5),e.\u0275\u0275textInterpolate1("",e.\u0275\u0275pipeBind1(6,18,"Civility")," *"),e.\u0275\u0275advance(3),e.\u0275\u0275textInterpolate(e.\u0275\u0275pipeBind1(9,20,"MR")),e.\u0275\u0275advance(3),e.\u0275\u0275textInterpolate(e.\u0275\u0275pipeBind1(12,22,"MRS")),e.\u0275\u0275advance(2),e.\u0275\u0275property("ngIf",null==a.coreService?null:a.coreService.neutralCivility),e.\u0275\u0275advance(4),e.\u0275\u0275propertyInterpolate("placeholder",e.\u0275\u0275pipeBind1(18,24,"First Name")),e.\u0275\u0275advance(2),e.\u0275\u0275property("ngIf",a.addNewUserForm.get("first_name").hasError("required")),e.\u0275\u0275advance(3),e.\u0275\u0275propertyInterpolate("placeholder",e.\u0275\u0275pipeBind1(23,26,"Last Name")),e.\u0275\u0275advance(2),e.\u0275\u0275property("ngIf",a.addNewUserForm.get("last_name").hasError("required")),e.\u0275\u0275advance(4),e.\u0275\u0275propertyInterpolate("placeholder",e.\u0275\u0275pipeBind1(29,28,"Office Phone")),e.\u0275\u0275advance(2),e.\u0275\u0275property("ngIf",a.addNewUserForm.get("office_phone").hasError("number")),e.\u0275\u0275advance(5),e.\u0275\u0275textInterpolate(e.\u0275\u0275pipeBind1(36,30,"CARDDETAIL.Phone")),e.\u0275\u0275advance(3),e.\u0275\u0275property("formControl",a.dialCodeControl)("clearable",!1)("appendTo","body"),e.\u0275\u0275advance(2),e.\u0275\u0275property("ngForOf",a.countryCodeList),e.\u0275\u0275advance(5),e.\u0275\u0275property("ngIf",a.addNewUserForm.get("portable_phone").hasError("number")),e.\u0275\u0275advance(3),e.\u0275\u0275propertyInterpolate("placeholder",e.\u0275\u0275pipeBind1(49,32,"Position")),e.\u0275\u0275advance(2),e.\u0275\u0275property("ngIf",a.addNewUserForm.get("position").hasError("required")&&((null==a.addNewUserForm?null:a.addNewUserForm.get("position").dirty)||(null==a.addNewUserForm?null:a.addNewUserForm.get("position").touched)))}}function z(o,p){if(1&o&&(e.\u0275\u0275elementContainerStart(0),e.\u0275\u0275elementStart(1,"div",14)(2,"div",15)(3,"div",16)(4,"mat-form-field",17),e.\u0275\u0275element(5,"input",18),e.\u0275\u0275pipe(6,"translate"),e.\u0275\u0275template(7,R,3,3,"mat-error",10),e.\u0275\u0275elementEnd(),e.\u0275\u0275template(8,q,3,3,"span",19),e.\u0275\u0275elementEnd(),e.\u0275\u0275template(9,G,7,5,"ng-container",10),e.\u0275\u0275elementEnd(),e.\u0275\u0275template(10,Y,51,34,"ng-container",10),e.\u0275\u0275elementEnd(),e.\u0275\u0275elementContainerEnd()),2&o){const a=e.\u0275\u0275nextContext();e.\u0275\u0275advance(1),e.\u0275\u0275property("formGroup",a.addNewUserForm),e.\u0275\u0275advance(4),e.\u0275\u0275propertyInterpolate("placeholder",e.\u0275\u0275pipeBind1(6,6,"Mail")),e.\u0275\u0275advance(2),e.\u0275\u0275property("ngIf",a.addNewUserForm.get("email").hasError("required")),e.\u0275\u0275advance(1),e.\u0275\u0275property("ngIf",a.is_email_invalid),e.\u0275\u0275advance(1),e.\u0275\u0275property("ngIf",a.isAlreadyRegistered),e.\u0275\u0275advance(1),e.\u0275\u0275property("ngIf",!a.isAlreadyRegistered)}}function J(o,p){if(1&o){const a=e.\u0275\u0275getCurrentView();e.\u0275\u0275elementStart(0,"div",51)(1,"button",52),e.\u0275\u0275listener("click",function(){e.\u0275\u0275restoreView(a);const _=e.\u0275\u0275nextContext();return e.\u0275\u0275resetView(_.closeDialog())}),e.\u0275\u0275text(2),e.\u0275\u0275pipe(3,"translate"),e.\u0275\u0275elementEnd(),e.\u0275\u0275elementStart(4,"button",53),e.\u0275\u0275listener("click",function(){e.\u0275\u0275restoreView(a);const _=e.\u0275\u0275nextContext();return e.\u0275\u0275resetView(_.submit())}),e.\u0275\u0275text(5),e.\u0275\u0275pipe(6,"translate"),e.\u0275\u0275pipe(7,"translate"),e.\u0275\u0275elementEnd()()}if(2&o){const a=e.\u0275\u0275nextContext();e.\u0275\u0275advance(2),e.\u0275\u0275textInterpolate(e.\u0275\u0275pipeBind1(3,2,"CANCEL")),e.\u0275\u0275advance(3),e.\u0275\u0275textInterpolate1(" ",a.parentData&&a.parentData.type&&"create-teacher"===a.parentData.type?e.\u0275\u0275pipeBind1(6,4,"Validate"):e.\u0275\u0275pipeBind1(7,6,"submit")," ")}}let ee=(()=>{class o{constructor(a,i,_,g,te,ne,ae,ie,re,oe,le){this.parentData=a,this.fb=i,this.dialogRef=_,this.authService=g,this.router=te,this.userService=ne,this.translate=ae,this.coreService=ie,this.teacherManagementService=re,this.countryService=oe,this.utilService=le,this.subs=new h.Y,this.flagsIconPath="../../../../../assets/icons/flags-nationality/",this.dialCodeControl=new r.UntypedFormControl(null),this.isWaitingForResponse=!1,this.isAlreadyRegistered=!0,this.emailDomainList=["brassart.fr","efap.com","icart.fr","efj.fr","cread.fr","ecole-mopa.fr","esec.edu","groupe-edh.com","zetta-edh.com","mbadmb.com","intervenantedh-ext.com","3wa.fr","mode-estah.com","esec.fr","3wacademy.fr"]}ngOnInit(){this.currentUser=this.authService.getLocalStorageUser();const a=this.authService.getPermission(),i=this.currentUser?.entities?.find(_=>_?.type?.name===a[0]);this.currentUserTypeId=i?.type?._id,this.initForm(),this.setTitleDialog(),this.initEmail(),this.getAllCountryCodes(),this.subs.sink=this.translate.onLangChange.subscribe(()=>{this.sortCountryCode()})}sortCountryCode(){this.countryCodeList=this.countryCodeList.sort((a,i)=>this.utilService.simplifyRegex(this.translate.instant(a?.name))<this.utilService.simplifyRegex(this.translate.instant(i?.name))?-1:this.utilService.simplifyRegex(this.translate.instant(a?.name))>this.utilService.simplifyRegex(this.translate.instant(i?.name))?1:0)}getAllCountryCodes(){this.countryCodeList=this.countryService?.getAllCountriesNationality()}selectionDialCode(a){this.addNewUserForm?.get("phone_number_indicative")?.reset(),this.addNewUserForm?.get("phone_number_indicative")?.patchValue(a?.dialCode)}setTitleDialog(){this.titleDialog=this.parentData&&this.parentData.type&&"create-teacher"===this.parentData.type?"Add Teacher":"Add New User"}initForm(){this.addNewUserForm=this.fb.group({civility:["",[r.Validators.required]],email:["",[f.dN.email,r.Validators.required]],first_name:["",[r.Validators.required]],last_name:["",[r.Validators.required]],office_phone:["",[r.Validators.maxLength(11),f.dN.number]],portable_phone:["",[f.dN.number]],phone_number_indicative:[null],position:[null,[r.Validators.required]]})}initEmail(){this.addNewUserForm.get("email").valueChanges.subscribe(a=>{this.isAlreadyRegistered||(this.isAlreadyRegistered=!0,this.isVerifyingEmail=!1)})}verifyEmail(){this.isVerifyingEmail=!0;const a="user"===this.parentData?.from||null;this.tempEmail=this.addNewUserForm.get("email").value,this.subs.sink=this.userService.verifyEmail(this.addNewUserForm.get("email").value,a).subscribe(i=>{i?._id||!i?.incorrect_email?i?._id?(this.isVerifyingEmail=!1,u().fire({type:"warning",title:this.translate.instant("SWAL_USER_EXIST.TITLE"),text:this.translate.instant("SWAL_USER_EXIST.TEXT"),confirmButtonText:this.translate.instant("SWAL_USER_EXIST.BUTTON_1"),showCancelButton:!0,cancelButtonText:this.translate.instant("SWAL_USER_EXIST.BUTTON_2")}).then(_=>{_.value&&this.router.navigate(["/users/user-list"],{queryParams:{user:i._id}}),this.dialogRef.close()})):this.isAlreadyRegistered=!1:u().fire({type:"info",title:this.translate.instant("SWAL_VALIDITY_EMAIL.TITLE"),html:this.translate.instant("SWAL_VALIDITY_EMAIL.TEXT",{emailDomainList:this.emailDomainList.map(_=>`<li>${_}</li>`).join("")}),allowEscapeKey:!0,allowOutsideClick:!1,confirmButtonText:this.translate.instant("SWAL_VALIDITY_EMAIL.BUTTON")}).then(()=>{this.dialogRef.close()})},i=>{if(this.isVerifyingEmail=!1,this.authService.postErrorLog(i),i&&i.message&&i.message.includes("Network error: Http failure response for"))u().fire({type:"warning",title:this.translate.instant("BAD_CONNECTION.Title"),html:this.translate.instant("BAD_CONNECTION.Text"),confirmButtonText:this.translate.instant("BAD_CONNECTION.Button"),allowOutsideClick:!1,allowEnterKey:!1,allowEscapeKey:!1});else if(i.message?.includes("GraphQL error: This Email Already Used As Student")){const _=i.message.replaceAll("GraphQL error: This Email Already Used As Student","");let g;_?.includes("MRS")?g=_.replace(/\sMRS\s/gi,`${this.translate.instant("CARDDETAIL.MRS")} `):_?.includes("MR")&&(g=_.replace(/\sMR\s/gi,`${this.translate.instant("CARDDETAIL.MR")} `)),u().fire({type:"warning",title:this.translate.instant("Checkavailability_S2.TITLE"),text:this.translate.instant("Checkavailability_S2.TEXT",{student:g}),footer:'<span style="margin-left: auto">Checkavailability_S2</span>',confirmButtonText:this.translate.instant("Checkavailability_S2.BTN")}).then(()=>{})}else u().fire({type:"info",title:this.translate.instant("SORRY"),text:i&&i.message?this.translate.instant(i.message.replaceAll("GraphQL error: ","")):i,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})})}checkFormValidity(){return!!this.addNewUserForm.invalid&&(u().fire({type:"info",title:this.translate.instant("FormSave_S1.TITLE"),html:this.translate.instant("FormSave_S1.TEXT"),confirmButtonText:this.translate.instant("FormSave_S1.BUTTON")}),this.addNewUserForm.markAllAsTouched(),!0)}submit(){if(!this.checkFormValidity())if("create-teacher"===(this.parentData&&this.parentData.type?this.parentData.type:"")){this.isWaitingForResponse=!0;const i=y.cloneDeep(this.addNewUserForm.value);this.createTeacher(i)}else{this.isWaitingForResponse=!0;const i=y.cloneDeep(this.addNewUserForm.value);this.createUser(i)}}createUser(a){this.subs.sink=this.userService.registerUser(a,null,this.currentUserTypeId).subscribe(i=>{this.isWaitingForResponse=!1,u().fire({type:"success",title:this.translate.instant("Bravo!"),confirmButtonText:this.translate.instant("OK"),allowEnterKey:!1,allowEscapeKey:!1,allowOutsideClick:!1}).then(()=>{this.dialogRef.close(i)})},i=>{if(this.isWaitingForResponse=!1,this.authService.postErrorLog(i),console.log(i.message),i.message&&"GraphQL error: Phone Number Exist"===i.message)u().fire({type:"warning",title:this.translate.instant("SWAL_PHONE_EXIST.TITLE"),text:this.translate.instant("SWAL_PHONE_EXIST.TEXT"),confirmButtonText:this.translate.instant("SWAL_PHONE_EXIST.BUTTON_1"),allowEnterKey:!1,allowEscapeKey:!1,allowOutsideClick:!1}).then(_=>{_.value&&this.mobileNumberInput.nativeElement.focus()});else if(i&&i.message&&i.message.includes("Invalid Email"))return void u().fire({type:"info",title:this.translate.instant("SWAL_VALIDITY_EMAIL.TITLE"),html:this.translate.instant("SWAL_VALIDITY_EMAIL.TEXT",{emailDomainList:this.emailDomainList.map(_=>`<li>${_}</li>`).join("")}),allowOutsideClick:!1,allowEscapeKey:!1,allowEnterKey:!1,confirmButtonText:this.translate.instant("SWAL_VALIDITY_EMAIL.BUTTON")}).then(()=>{this.isAlreadyRegistered=!1});i.message&&"GraphQL error: user was already created but the status is deleted"===i.message&&(this.isWaitingForResponse=!0,this.subs.sink=this.userService.registerUserExisting(a,null,this.currentUserTypeId).subscribe(_=>{this.isWaitingForResponse=!1,u().fire({type:"success",title:this.translate.instant("Bravo!"),confirmButtonText:this.translate.instant("OK"),allowEnterKey:!1,allowEscapeKey:!1,allowOutsideClick:!1}).then(()=>{this.dialogRef.close(_)})},_=>{this.isWaitingForResponse=!1,this.authService.postErrorLog(_),_&&_.message&&_.message.includes("Network error: Http failure response for")?u().fire({type:"warning",title:this.translate.instant("BAD_CONNECTION.Title"),html:this.translate.instant("BAD_CONNECTION.Text"),confirmButtonText:this.translate.instant("BAD_CONNECTION.Button"),allowOutsideClick:!1,allowEnterKey:!1,allowEscapeKey:!1}):u().fire({type:"info",title:this.translate.instant("SORRY"),text:_&&_.message?this.translate.instant(_.message.replaceAll("GraphQL error: ","")):_,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})}))})}createTeacher(a){this.subs.sink=this.teacherManagementService.createTeacher(a).subscribe(i=>{this.isWaitingForResponse=!1,u().fire({type:"success",title:this.translate.instant("Bravo!"),confirmButtonText:this.translate.instant("OK"),allowEnterKey:!1,allowEscapeKey:!1,allowOutsideClick:!1}).then(()=>{this.is_email_invalid=!1,this.dialogRef.close(i)})},i=>{this.isWaitingForResponse=!1,this.authService.postErrorLog(i),console.log(i.message),i.message&&"GraphQL error: Phone Number Exist"===i.message&&u().fire({type:"warning",title:this.translate.instant("SWAL_PHONE_EXIST.TITLE"),text:this.translate.instant("SWAL_PHONE_EXIST.TEXT"),confirmButtonText:this.translate.instant("SWAL_PHONE_EXIST.BUTTON_1"),allowEnterKey:!1,allowEscapeKey:!1,allowOutsideClick:!1}).then(_=>{_.value&&this.mobileNumberInput.nativeElement.focus()}),i.message&&"GraphQL error: user was already created but the status is deleted"===i.message&&(this.isWaitingForResponse=!0,this.subs.sink=this.userService.registerUserExisting(a,null,this.currentUserTypeId).subscribe(_=>{this.isWaitingForResponse=!1,u().fire({type:"success",title:this.translate.instant("Bravo!"),confirmButtonText:this.translate.instant("OK"),allowEnterKey:!1,allowEscapeKey:!1,allowOutsideClick:!1}).then(()=>{this.dialogRef.close(_)})},_=>{this.isWaitingForResponse=!1,this.authService.postErrorLog(_),u().fire({type:"info",title:this.translate.instant("SORRY"),text:_&&_.message?this.translate.instant(_.message.replaceAll("GraphQL error: ","")):_,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})})),i.message&&"GraphQL error: Invalid Email"===i.message&&(this.is_email_invalid=!0)})}ngOnDestroy(){this.subs.unsubscribe()}closeDialog(){this.dialogRef.close()}}return o.\u0275fac=function(a){return new(a||o)(e.\u0275\u0275directiveInject(l.WI),e.\u0275\u0275directiveInject(r.UntypedFormBuilder),e.\u0275\u0275directiveInject(l.so),e.\u0275\u0275directiveInject(I.e),e.\u0275\u0275directiveInject(t.F0),e.\u0275\u0275directiveInject(n.K),e.\u0275\u0275directiveInject(s.sK),e.\u0275\u0275directiveInject(d.p),e.\u0275\u0275directiveInject(m.D),e.\u0275\u0275directiveInject(P.T),e.\u0275\u0275directiveInject($.t))},o.\u0275cmp=e.\u0275\u0275defineComponent({type:o,selectors:[["ms-add-user-dialog"]],viewQuery:function(a,i){if(1&a&&e.\u0275\u0275viewQuery(L,5),2&a){let _;e.\u0275\u0275queryRefresh(_=e.\u0275\u0275loadQuery())&&(i.mobileNumberInput=_.first)}},decls:18,vars:6,consts:[["cdkDrag","","cdkDragRootElement",".cdk-overlay-pane","cdkDragHandle","",1,"dialog-border"],[1,"dialogTitleWrapper","header-dialog"],[1,"p-grid"],[1,"w-30","no-padding"],["mat-icon-button","",1,"mt-5px"],[1,"p-col-10","no-padding"],[1,"dialogTitle"],[1,"w-65","no-padding"],["mat-icon-button","","tabindex","-1",1,"close-icon","float-right",3,"click"],["mat-dialog-content","",1,"mat-dialog-content","dialog-body",2,"overflow","hidden !important"],[4,"ngIf"],["mat-dialog-actions","","class","justify-content-end mr-10",4,"ngIf"],[1,"center-spinner"],["color","accent"],[3,"formGroup"],[1,"p-grid",2,"margin-bottom","0.5em"],[1,"p-col-4","pad-y-none","email-field",2,"align-self","center"],["color","accent",1,"full-wid"],["matInput","","formControlName","email","type","email","required","",3,"placeholder"],["class","error",4,"ngIf"],[1,"error"],[1,"p-col-4","pad-y-none",2,"align-self","center"],["mat-raised-button","","color","accent",3,"disabled","click"],[1,"p-col-3",2,"margin-top","0.5em"],["mode","indeterminate","color","accent",3,"diameter",4,"ngIf"],["mode","indeterminate","color","accent",3,"diameter"],[1,"p-col-12","pad-y-none"],["formControlName","civility","required","",2,"color","black"],["value","MR",2,"margin-left","8px"],["value","MRS",2,"margin-left","8px"],[1,"p-col-6","pad-y-none"],["matInput","","formControlName","first_name","type","text","required","",3,"placeholder"],["matInput","","formControlName","last_name","type","text","required","",3,"placeholder"],[1,"p-col-4","pad-y-none"],["matInput","","formControlName","office_phone","type","tel","maxlength","11",3,"placeholder"],[1,"no-padding-y","p-grid",2,"position","relative"],[1,"label-for-phone"],[1,"phone-number","p-col-6","pr-0"],["bindLabel","name",1,"custom-dropdownpanel-dialcode",3,"formControl","clearable","appendTo","change"],["ng-label-tmp",""],[3,"value",4,"ngFor","ngForOf"],[1,"phone-number","p-col-6","pl-12"],["matInput","","formControlName","portable_phone","type","tel","maxlength","11"],["mobileNumber",""],["matInput","","formControlName","position","type","text",3,"placeholder"],["value","neutral",2,"margin-left","8px"],[1,"flag-icon-trigger",3,"src"],["class","ml-4",4,"ngIf"],[1,"ml-4"],[3,"value"],[1,"flag-icon",3,"src"],["mat-dialog-actions","",1,"justify-content-end","mr-10"],["mat-button","","mat-raised-button","","color","warn",3,"click"],["mat-button","","mat-raised-button","","color","primary",1,"mr-0",3,"click"]],template:function(a,i){1&a&&(e.\u0275\u0275elementStart(0,"div",0)(1,"div",1)(2,"div",2)(3,"div",3)(4,"mat-icon",4),e.\u0275\u0275text(5," person_add_alt_1 "),e.\u0275\u0275elementEnd()(),e.\u0275\u0275elementStart(6,"div",5)(7,"h3",6),e.\u0275\u0275text(8),e.\u0275\u0275pipe(9,"translate"),e.\u0275\u0275elementEnd()(),e.\u0275\u0275elementStart(10,"div",7)(11,"button",8),e.\u0275\u0275listener("click",function(){return i.closeDialog()}),e.\u0275\u0275elementStart(12,"mat-icon"),e.\u0275\u0275text(13,"close"),e.\u0275\u0275elementEnd()()()()()(),e.\u0275\u0275elementStart(14,"div",9),e.\u0275\u0275template(15,j,3,0,"ng-container",10),e.\u0275\u0275template(16,z,11,8,"ng-container",10),e.\u0275\u0275elementEnd(),e.\u0275\u0275template(17,J,8,8,"div",11)),2&a&&(e.\u0275\u0275advance(8),e.\u0275\u0275textInterpolate(e.\u0275\u0275pipeBind1(9,4,i.titleDialog)),e.\u0275\u0275advance(7),e.\u0275\u0275property("ngIf",i.isWaitingForResponse),e.\u0275\u0275advance(1),e.\u0275\u0275property("ngIf",!i.isWaitingForResponse),e.\u0275\u0275advance(1),e.\u0275\u0275property("ngIf",!i.isAlreadyRegistered))},dependencies:[S.Zt,S.Bh,x.lW,l.xY,l.H8,U.Hw,E.TO,E.KE,E.hX,M.Nt,w.Ou,A.VQ,A.U0,r.DefaultValueAccessor,r.NgControlStatus,r.NgControlStatusGroup,r.RequiredValidator,r.MaxLengthValidator,r.FormControlDirective,r.FormGroupDirective,r.FormControlName,C.sg,C.O5,b.w9,b.jq,b.mR,s.X$],styles:[".dialogTitle[_ngcontent-%COMP%]{display:inline-block}.dialogTitleWrapper[_ngcontent-%COMP%]{color:#000}.dialog-border[_ngcontent-%COMP%]{border-bottom:1px solid black}.no-padding[_ngcontent-%COMP%]{padding:0}.float-right[_ngcontent-%COMP%]{float:right}.mt-15[_ngcontent-%COMP%]{margin-top:15px}[_nghost-%COMP%]  .mat-radio-outer-circle{border-color:#0000008a!important}[_nghost-%COMP%]  .mat-form-field-underline{background-color:#0000001f!important}.mr-0[_ngcontent-%COMP%]{margin-right:0}.mr-10[_ngcontent-%COMP%]{margin-right:10px}.header-dialog[_ngcontent-%COMP%]{margin-top:15px;padding:0 5px 0 15px}.mat-dialog-content[_ngcontent-%COMP%]{margin-right:0;margin-left:0;margin-top:15px}.w-30[_ngcontent-%COMP%]{width:30px}.w-65[_ngcontent-%COMP%]{width:65px}.mt-5px[_ngcontent-%COMP%]{margin-top:5px}[_nghost-%COMP%]  .mat-radio-group.ng-invalid.ng-touched span{color:#f44336!important}.email-field[_ngcontent-%COMP%]{position:relative}.error[_ngcontent-%COMP%]{position:absolute;top:45px;left:10px;margin:0;padding:0;color:#f44336;font-size:12px;min-width:100px}[_nghost-%COMP%]  .p-col-4.pad-y-none{height:75px}.flag-icon[_ngcontent-%COMP%]{vertical-align:text-top;margin-right:12px;height:14px;width:20px;display:inline-block}.flag-icon-trigger[_ngcontent-%COMP%]{vertical-align:text-top;margin-right:2px;height:16px;width:16px;display:inline-block}.border-button[_ngcontent-%COMP%]{border-bottom:1px solid #dadada}.phone-number.p-col-6[_ngcontent-%COMP%], .phone-number.p-col-6[_ngcontent-%COMP%]{padding:0!important}.phone-number.p-col-6.pr-0[_ngcontent-%COMP%]{padding-right:0!important}.phone-number.p-col-6.pl-12[_ngcontent-%COMP%]{padding-left:12px!important}[_nghost-%COMP%]  .phone-number .mat-select-value-text{margin-left:0!important}.label-for-phone[_ngcontent-%COMP%]{position:absolute;font-size:11px;color:#aaa;opacity:.8;bottom:42px}.ml-4[_ngcontent-%COMP%]{margin-left:4px}[_nghost-%COMP%]  .ng-select .ng-select-container{background-color:#fff0;color:#000;border:none;border-radius:0!important;border-bottom:1px solid rgba(151,151,151,.3)!important;box-shadow:unset;min-height:36px;align-items:center}[_nghost-%COMP%]  .ng-select .ng-dropdown-panel{min-width:-moz-fit-content!important;min-width:fit-content!important;width:-moz-fit-content!important;width:fit-content!important}[_nghost-%COMP%]  .ng-select.ng-invalid.ng-touched .ng-select-container{border-bottom:1px solid #f44336!important}[_nghost-%COMP%]  .ng-select.ng-invalid.ng-touched .ng-placeholder{color:#f44336!important}[_nghost-%COMP%]  .ng-select{margin-bottom:16px;padding-top:3px}[_nghost-%COMP%]  .ng-select .ng-select-container .ng-value-container .ng-input>input{color:#000;box-sizing:content-box;background:none;border:0;box-shadow:none;outline:0;cursor:default;padding-left:0!important;width:100%}[_nghost-%COMP%]  .ng-select.ng-select-single .ng-select-container .ng-value-container .ng-input{padding-left:0!important;margin-top:6px!important}[_nghost-%COMP%]  .ng-select .ng-select-container .ng-value-container{padding-left:0!important;margin-top:8px!important}[_nghost-%COMP%]  .ng-select.ng-select-single .ng-select-container .ng-value-container, .ng-select.ng-select-single[_ngcontent-%COMP%]   .ng-select-container[_ngcontent-%COMP%]   .ng-value-container[_ngcontent-%COMP%]   .ng-value[_ngcontent-%COMP%]{font-size:14px!important}[_nghost-%COMP%]  .ng-select .ng-dropdown-panel{text-align:left!important;font-size:15px!important}[_nghost-%COMP%]  .ng-select.ng-select-single .ng-select-container .ng-value-container .ng-placeholder{font-size:16px}  .ng-dropdown-panel.custom-dropdownpanel-dialcode{width:-moz-fit-content!important;width:fit-content!important}"]}),o})()}}]);