"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[9725],{69725:(f,u,s)=>{s.d(u,{P:()=>c});var n=s(13125),a=s(24850),d=s(94650),_=s(80529),p=s(18497),m=s(89383);let c=(()=>{class o{constructor(e,t,i){this.httpClient=e,this.apollo=t,this.translate=i}getAllStudentInitialIntakeChannel(){return this.apollo.query({query:n.ZP`
          query GetAllStudentInitialIntakeChannel{
            GetAllStudentInitialIntakeChannel
          }
        `,fetchPolicy:"network-only"}).pipe((0,a.U)(e=>e.data.GetAllStudentInitialIntakeChannel))}getAllProgramsByUserType(e){return this.apollo.query({query:n.ZP`
          query GetAllPrograms($userTypeId: ID) {
            GetAllPrograms(user_type_id: $userTypeId) {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,variables:{userTypeId:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetAllPrograms))}getAllProgramsByUserTypes(e){return this.apollo.query({query:n.ZP`
          query GetAllPrograms($user_type_logins: [ID]) {
            GetAllPrograms(user_type_logins: $user_type_logins) {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,variables:{user_type_logins:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetAllPrograms))}getAllStudentPrograms(){return this.apollo.query({query:n.ZP`
          query {
            GetAllStudentPrograms {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,a.U)(e=>e.data.GetAllStudentPrograms))}getAllTypeOfFormationDropdown(e={limit:50,page:0},t=null){return this.apollo.watchQuery({query:n.ZP`
          query GetAllTypeOfInformation($filter: TypeOfInformationFilterInput, $pagination: PaginationInput) {
            GetAllTypeOfInformation(filter: $filter, pagination: $pagination) {
              _id
              sigle
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,filter:t}}).valueChanges.pipe((0,a.U)(i=>i.data.GetAllTypeOfInformation))}getAllStudentsID(e=null){return this.apollo.query({query:n.ZP`
          query GetAllStudents($filter: FilterStudent) {
            GetAllStudents(filter: $filter) {
              _id
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetAllStudents))}getStudentOneTime(e,t,i,r){return this.apollo.query({query:n.ZP`
          query GetAllStudents($pagination: PaginationInput, $sort: StudentSorting, $filter: FilterStudent, $user_type_ids: [ID]) {
            GetAllStudents(pagination: $pagination, sorting: $sort, filter: $filter, user_type_ids: $user_type_ids) {
              _id
              civility
              first_name
              last_name
              candidate_id {
                _id
              }
              user_id{
                _id
                civility
                first_name
                last_name
              }
            }
          }
        `,variables:{pagination:e,sort:t,filter:i,user_type_ids:r},fetchPolicy:"network-only"}).pipe((0,a.U)(l=>l.data.GetAllStudents))}getMultipleEmails(e,t,i,r){return this.apollo.query({query:n.ZP`
          query GetAllStudentsEmail($pagination: PaginationInput, $sort: StudentSorting, $filter: FilterStudent, $user_type_ids: [ID]) {
            GetAllStudents(pagination: $pagination, sorting: $sort, filter: $filter, user_type_ids: $user_type_ids) {
              _id
              email
              candidate_id {
                _id
              }
            }
          }
        `,variables:{pagination:e,sort:t,filter:i,user_type_ids:r},fetchPolicy:"network-only"}).pipe((0,a.U)(l=>l.data.GetAllStudents))}getMultipleStudentEmailByID(e){return this.apollo.query({query:n.ZP`
          query GetAllStudentsEmail($ids: [ID]) {
            GetAllStudents(student_ids: $ids) {
              email
              candidate_id {
                _id
                email
                payment_supports {
                  _id
                  relation
                  email
                }
              }
            }
          }
        `,variables:{ids:e},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetAllStudents))}getAllCandidateIds(e){return this.apollo.query({query:n.ZP`
          query GetAllStudents($ids: [ID], $filter: FilterStudent) {
            GetAllStudents(student_ids: $ids, filter: $filter) {
              _id
              candidate_ids {
                _id
                first_name
                last_name
              }
            }
          }
        `,variables:{ids:e,filter:{offset:100}},fetchPolicy:"network-only"}).pipe((0,a.U)(t=>t.data.GetAllStudents))}getMultipleStudentProgramAndProgramSequences(e,t,i,r){return this.apollo.query({query:n.ZP`
          query GetMultipleStudentProgramAndProgramSequences(
            $pagination: PaginationInput
            $filter: FilterStudent
            $sort: StudentSorting
            $user_type_ids: [ID]
          ) {
            GetAllStudents(pagination: $pagination, filter: $filter, sorting: $sort, user_type_ids: $user_type_ids) {
              _id
              candidate_id {
                _id
              }
              program {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
              program_sequence_ids {
                _id
                name
                type_of_sequence
              }
            }
          }
        `,variables:{pagination:e,filter:t,sort:i,user_type_ids:r},fetchPolicy:"network-only"}).pipe((0,a.U)(l=>l.data.GetAllStudents))}getMultipleStudentId(e,t,i,r){return this.apollo.query({query:n.ZP`
          query getMultipleStudentId($pagination: PaginationInput, $filter: FilterStudent, $sort: StudentSorting, $user_type_ids: [ID]) {
            GetAllStudents(pagination: $pagination, filter: $filter, sorting: $sort, user_type_ids: $user_type_ids) {
              _id
            }
          }
        `,variables:{pagination:e,filter:t,sort:i,user_type_ids:r},fetchPolicy:"network-only"}).pipe((0,a.U)(l=>l.data.GetAllStudents))}GetAllStudents(e,t,i,r){return this.apollo.query({query:n.ZP`
          query GetAllStudents(
            $pagination: PaginationInput
            $filter: FilterStudent
            $sort: StudentSorting
            $lang: String
            $userTypeId: ID
          ) {
            GetAllStudents(pagination: $pagination, filter: $filter, sorting: $sort, lang: $lang, user_type_login: $userTypeId) {
              _id
              student_number
              civility
              first_name
              last_name
              email
              initial_intake_channel
              type_of_registration
              type_of_formation {
                _id
                sigle
              }
              scholar_season {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
              program_sequence_ids {
                _id
                name
                type_of_sequence
              }
              program {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
              student_status
              registration_date {
                date
                time
              }
              financial_situation
              program_sequence_ids {
                _id
                name
                type_of_sequence
              }
              current_program_sequence_id {
                _id
                name
                type_of_sequence
              }
              candidate_id {
                _id
                first_name
                last_name
                civility
                email
                modality_step_special_form_status
                payment_supports {
                  _id
                  email
                  relation
                }
              }
              group_class_id {
                _id
                name
              }
              student_class_id {
                _id
                name
              }
              count_document
              user_id {
                _id
                first_name
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,filter:t,sort:i,lang:this.translate.currentLang,userTypeId:r}}).pipe((0,a.U)(l=>l.data.GetAllStudents))}GetAllStudentsTable(e,t,i,r){return this.apollo.query({query:n.ZP`
          query GetAllStudents(
            $pagination: PaginationInput
            $filter: FilterStudent
            $sort: StudentSorting
            $lang: String
            $user_type_ids: [ID]
          ) {
            GetAllStudents(pagination: $pagination, filter: $filter, sorting: $sort, lang: $lang, user_type_ids: $user_type_ids) {
              _id
              student_number
              civility
              first_name
              last_name
              email
              initial_intake_channel
              type_of_registration
              type_of_formation {
                _id
                sigle
              }
              scholar_season {
                _id
                scholar_season
              }
              program {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
              student_status
              registration_date {
                date
                time
              }
              financial_situation
              candidate_id {
                _id
                first_name
                last_name
                civility
                school_mail
                email
                modality_step_special_form_status
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
                program_sequence_ids {
                  _id
                  name
                  type_of_sequence
                }
                current_program_sequence_id {
                  _id
                  name
                  type_of_sequence
                }
              }
              student_class_id {
                _id
                name
              }
              user_id {
                _id
                civility
                first_name
                last_name
              }
              count_document
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,filter:t,sort:i,user_type_ids:r,lang:this.translate.currentLang}}).pipe((0,a.U)(l=>l.data.GetAllStudents))}getAllStudentNames(e={limit:10,page:0},t=null){return this.apollo.query({query:n.ZP`
          query GetAllStudentNames($pagination: PaginationInput, $filter: FilterStudent) {
            GetAllStudents(pagination: $pagination, filter: $filter) {
              _id
              civility
              first_name
              last_name
              count_document
            }
          }
        `,variables:{pagination:e,filter:t},fetchPolicy:"network-only"}).pipe((0,a.U)(i=>i.data.GetAllStudents))}GetOneProgram(e){return this.apollo.query({query:n.ZP`
          query GetOneProgram($programId: ID!) {
            GetOneProgram(_id: $programId) {
              _id
              course_sequence_id {
                _id
                name
                program_sequences_id {
                  _id
                  name
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
          }
        `,fetchPolicy:"network-only",variables:{programId:e}}).pipe((0,a.U)(t=>t.data.GetOneProgram))}RemoveProgramSequenceFromStudent(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation RemoveStudentFromProgramSequence($studentId: ID!, $sequenceId: ID!) {
            RemoveProgramSequenceFromStudent(student_id: $studentId, program_sequence_id: $sequenceId) {
              _id
            }
          }
        `,variables:{studentId:e,sequenceId:t}}).pipe((0,a.U)(i=>i.data.RemoveProgramSequenceFromStudent))}GenerateDocumentBuilderPDFForStudent(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation GenerateDocumentBuilderPDFForStudent($_id: ID!, $candidate_id: ID!, $lang: String) {
            GenerateDocumentBuilderPDFForStudent(_id: $_id, candidate_id: $candidate_id, lang: $lang)
          }
        `,variables:{candidate_id:e,_id:t,lang:this.translate.currentLang}}).pipe((0,a.U)(i=>i.data.GenerateDocumentBuilderPDFForStudent))}getAllDocumentsPublished(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllDocumentBuilders {
            GetAllDocumentBuilders(filter: { status: true, hide_form: false }) {
              _id
              document_type
              template_html
              is_published
              preview_pdf_url
              is_published
              document_builder_name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllDocumentBuilders))}AssignProgramSequencesToStudent(e,t,i){return this.apollo.mutate({mutation:n.ZP`
          mutation AssignProgramSequencesToStudent($studentId: ID!, $candidateId: ID, $programSequenceIds: [ID]!) {
            AssignProgramSequencesToStudent(student_id: $studentId, candidate_id: $candidateId, program_sequence_ids: $programSequenceIds) {
              _id
            }
          }
        `,variables:{studentId:t,candidateId:i,programSequenceIds:e}}).pipe((0,a.U)(r=>r.data.AssignProgramSequencesToStudent))}AssignManySequencesToManyStudents(e){return this.apollo.mutate({mutation:n.ZP`
          mutation AssignManySequencesToManyStudents($assign_program_sequence_input: [AssignProgramSequenceInput]) {
            AssignManySequencesToManyStudents(assign_program_sequence_input: $assign_program_sequence_input) {
              _id
            }
          }
        `,variables:{assign_program_sequence_input:e}}).pipe((0,a.U)(t=>t.data.AssignManySequencesToManyStudents))}sendStudentsToHyperplanning(){return this.apollo.mutate({mutation:n.ZP`
          mutation SendStudentsToHyperplanning{
            SendStudentsToHyperplanning
          }
        `}).pipe((0,a.U)(e=>e.data.SendStudentsToHyperplanning))}GetAllStudentsTagTable(e,t,i,r,l){return this.apollo.query({query:n.ZP`
          query GetAllCandidates(
            $pagination: PaginationInput
            $filter: CandidateFilterInput
            $sorting: CandidateSortInput
            $user_type_ids: [ID]
            $columnFormationType: Boolean!
            $columnStudentNumber: Boolean!
            $columnName: Boolean!
            $columnCurrentProgram: Boolean!
            $columnTypeOfRegistration: Boolean!
            $columnDownPayment: Boolean!
            $columnRegistrationDate: Boolean!
            $columnVisaDocument: Boolean!
            $lang: String
          ) {
            GetAllCandidates(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids,lang:$lang) {
              _id
              registered_at @include(if: $columnRegistrationDate) {
                date
                time
              }
              type_of_formation_id @include(if: $columnFormationType) {
                _id
                type_of_formation
                sigle
              }
              email
              school_mail
              candidate_unique_number @include(if: $columnStudentNumber)
              first_name @include(if: $columnName)
              last_name @include(if: $columnName)
              civility @include(if: $columnName)
              payment @include(if: $columnDownPayment)
              registration_profile {
                is_down_payment
              }
              billing_id @include(if: $columnDownPayment) {
                deposit
                deposit_pay_amount
                deposit_status
              }
              payment_method
              intake_channel @include(if: $columnCurrentProgram) {
                _id
                program
              }
              scholar_season @include(if: $columnCurrentProgram) {
                _id
                scholar_season
              }
              candidate_admission_status
              readmission_status @include(if: $columnTypeOfRegistration)
              tag_ids {
                _id
                name
              }
              user_id {
                _id
              }
              count_document
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
              visa_document_process_id @include(if: $columnVisaDocument){
                _id
                form_type
                steps{
                  _id
                  step_status
                }
                form_status
              }
              require_visa_permit
              nationality
              country
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,filter:i,sorting:r,user_type_ids:l,columnFormationType:t.formationType,columnStudentNumber:t.studentNumber,columnName:t.name,columnCurrentProgram:t.currentProgram,columnTypeOfRegistration:t.typeOfRegistration,columnDownPayment:t.downPayment,columnRegistrationDate:t.registrationDate,columnVisaDocument:t.visaDocument,lang:this.translate?.currentLang?this.translate.currentLang:"fr"}}).pipe((0,a.U)(g=>g.data.GetAllCandidates))}GetAllScholarSeasonsPublished(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllScholarSeasons{
            GetAllScholarSeasons(filter: { is_published: true }) {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllScholarSeasons))}GetAllSchoolSuperFilter(e,t,i){return this.apollo.watchQuery({query:n.ZP`
          query GetAllCandidateSchool($user_type_ids: [ID]){
            GetAllCandidateSchool(${t} scholar_season_id: "${e}", user_type_ids: $user_type_ids) {
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
              levels {
                _id
                name
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{user_type_ids:i}}).valueChanges.pipe((0,a.U)(r=>r.data.GetAllCandidateSchool))}GetAllSectorsDropdown(e){return this.apollo.watchQuery({query:n.ZP`
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
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllSectors))}GetAllSpecializationsByScholar(e){return this.apollo.watchQuery({query:n.ZP`
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
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(t=>t.data.GetAllSpecializations))}GetAllTagsSuperFilter(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllTags{
            GetAllTags(is_used_by_student: true) {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllTags))}getAllTypeOfInformationDropdown(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllTypeOfInformation {
            GetAllTypeOfInformation {
              _id
              type_of_information
              type_of_formation
              sigle
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(e=>e.data.GetAllTypeOfInformation))}getMultipleEmailsTag(e,t,i,r){return this.apollo.query({query:n.ZP`
          query GetAllCandidateEmail($pagination: PaginationInput, $sort: CandidateSortInput, $filter: CandidateFilterInput, $user_type_ids: [ID]) {
            GetAllCandidates(pagination: $pagination, sorting: $sort, filter: $filter, user_type_ids: $user_type_ids) {
              _id
              civility
              first_name
              last_name
              email
              school_mail
            }
          }
        `,variables:{pagination:e,sort:t,filter:i,user_type_ids:r},fetchPolicy:"network-only"}).pipe((0,a.U)(l=>l.data.GetAllCandidates))}getAllStudentsTagForRemoveTag(e,t,i,r){return this.apollo.query({query:n.ZP`
          query GetAllCandidates(
            $pagination: PaginationInput
            $filter: CandidateFilterInput
            $sorting: CandidateSortInput
            $user_type_ids: [ID]
          ) {
            GetAllCandidates(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids) {
              _id
              first_name
              last_name
              civility
              tag_ids {
                _id
                name
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,filter:t,sorting:i,user_type_ids:r}}).pipe((0,a.U)(l=>l.data.GetAllCandidates))}getAllStudentsForAskVisaDocument(e,t,i,r){return this.apollo.query({query:n.ZP`
          query GetAllCandidates(
            $pagination: PaginationInput
            $filter: CandidateFilterInput
            $sorting: CandidateSortInput
            $user_type_ids: [ID]
          ) {
            GetAllCandidates(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids) {
              _id
              first_name
              last_name
              civility
              tag_ids {
                _id
                name
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,filter:t,sorting:i,user_type_ids:r}}).pipe((0,a.U)(l=>l.data.GetAllCandidates))}getAllIdForStudentTagCheckbox(e,t,i,r){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $filter: CandidateFilterInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, filter: $filter) {
                  _id
                }
              }
        `,variables:{filter:i,user_type_ids:r,pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(l=>l.data.GetAllCandidates))}getAllForAddTagCheckbox(e,t,i,r){return this.apollo.watchQuery({query:n.ZP`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $filter: CandidateFilterInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, filter: $filter) {
                  _id
                  tag_ids {
                    _id
                    name
                  }
                }
              }
        `,variables:{filter:i,user_type_ids:r,pagination:e,sort:t||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,a.U)(l=>l.data.GetAllCandidates))}getAllStudentsForSendReminderCheckbox(e,t,i,r){return this.apollo.query({query:n.ZP`
          query GetAllCandidates(
            $pagination: PaginationInput
            $filter: CandidateFilterInput
            $sorting: CandidateSortInput
            $user_type_ids: [ID]
          ) {
            GetAllCandidates(pagination: $pagination, filter: $filter, sorting: $sorting, user_type_ids: $user_type_ids) {
              _id
              first_name
              last_name
              civility
              tag_ids {
                _id
                name
              }
              visa_document_process_id {
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
        `,fetchPolicy:"network-only",variables:{pagination:e,filter:t,sorting:i,user_type_ids:r}}).pipe((0,a.U)(l=>l.data.GetAllCandidates))}sendReminderVisaDocument(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation SendReminderVisaDocument($lang: String, $filter: CandidateFilterInput, $userTypeIds: [ID]) {
            SendReminderVisaDocument(lang: $lang, filter: $filter, user_type_ids: $userTypeIds)
          }
        `,variables:{lang:this.translate?.currentLang?this.translate.currentLang:"fr",filter:t,userTypeIds:e}}).pipe((0,a.U)(i=>i.data.SendReminderVisaDocument))}}return o.\u0275fac=function(e){return new(e||o)(d.\u0275\u0275inject(_.eN),d.\u0275\u0275inject(p._M),d.\u0275\u0275inject(m.sK))},o.\u0275prov=d.\u0275\u0275defineInjectable({token:o,factory:o.\u0275fac,providedIn:"root"}),o})()}}]);