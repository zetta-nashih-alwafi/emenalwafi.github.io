"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[6746],{36746:(y,s,o)=>{o.d(s,{P:()=>m});var l=o(591),a=o(13125),d=o(24850),u=o(94650),c=o(18497),p=o(89383);let m=(()=>{class _{constructor(e,t){this.apollo=e,this.translate=t,this.folder03="03. BOITE A OUTILS",this.folder06="06. EPREUVES DE LA CERTIFICATION",this.folder07="07. ARCHIVES",this.destinationFolderIdSource=new l.X(null),this.destinationFolderId$=this.destinationFolderIdSource.asObservable(),this.moveFolderBreadcrumbSource=new l.X(null),this.moveFolderBreadcrumb$=this.moveFolderBreadcrumbSource.asObservable(),this.refreshAcadKitSource=new l.X(!1),this.isAcadKitRefreshed$=this.refreshAcadKitSource.asObservable()}setDestinationFolder(e){this.destinationFolderIdSource.next(e)}setMoveFolderBreadcrumb(e){this.moveFolderBreadcrumbSource.next(e)}refreshAcadKit(e){this.refreshAcadKitSource.next(e)}isRootFolder03(e){return e.is_default_folder&&e.folder_name.includes(this.folder03)}isRootFolder06(e){return e.is_default_folder&&e.folder_name.includes(this.folder06)}isRootFolder07(e){return e.is_default_folder&&e.folder_name.includes(this.folder07)}getCreateDocumentTypes(){return[{value:"guideline",name:"Guideline"},{value:"test",name:"test"},{value:"scoring-rules",name:"Scoring Rule"},{value:"other",name:"other"},{value:"image/png",name:"Image/png"},{value:"image/jpeg",name:"Image/jpeg"},{value:"application/pdf",name:"Application/pdf"},{value:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",name:"Application/Document"},{value:"documentExpected",name:"Document Expected"},{value:"studentnotification",name:"Student Notification"},{value:"certiDegreeCertificate",name:"CertiDegree Certificate"}]}getDocumentTypes(){return[{value:"Guidelines",name:"Guidelines"},{value:"guideline",name:"Guideline"},{value:"Test",name:"Test"},{value:"test",name:"test"},{value:"Scoring Rules",name:"Scoring Rules"},{value:"scoring-rules",name:"Scoring Rule"},{value:"Other",name:"Other"},{value:"OTHER",name:"OTHER"},{value:"other",name:"other"},{value:"Notification to Student",name:"Notification to Student"},{value:"documentExpected",name:"Document Expected"},{value:"image/png",name:"Image/png"},{value:"image/jpeg",name:"Image/jpeg"},{value:"application/pdf",name:"Application/pdf"},{value:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",name:"Application/Document"},{value:"studentnotification",name:"Student Notification"},{value:"certiDegreeCertificate",name:"CertiDegree Certificate"},{value:"certification_rule",name:"Certification Rule"},{value:"student_upload_grand_oral_cv",name:"Student Upload Grand Oral CV"},{value:"student_upload_grand_oral_presentation",name:"Student Upload Grand Oral Presentation"}]}getFileTypes(){return[{value:"docper",name:"Document/Presentation"},{value:"image",name:"Image"},{value:"video",name:"Video"}]}createEvent(e){return this.apollo.mutate({mutation:a.ZP`
        mutation CreateEvent($data: AcadEventInput) {
          CreateEvent(event_input: $data) {
            _id
            name
            from_date
            to_date
            schools {
              _id
            }
          }
        }
      `,variables:{data:e}})}updateEvent(e,t){return this.apollo.mutate({mutation:a.ZP`
        mutation CreateEvent($eventId: ID!, $payload: AcadEventInput) {
          UpdateEvent(_id: $eventId, event_input: $payload) {
            _id
          }
        }
      `,variables:{eventId:e,payload:t}})}getAllEvent(e,t,i,n){return this.apollo.query({query:a.ZP`
          query {
            GetAllEvents(filter:{from_date:"${e}", to_date:"${t}", school_name:"${i}", class_name:"${n}"}) {
              _id
              name
              from_date
              to_date
              schools {
                _id
                short_name
              }
              user_types {
                _id
                name
              }
              is_all_school
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,d.U)(r=>r.data.GetAllEvents))}getAllEventWithParam(e,t,i,n){return this.apollo.query({query:a.ZP`
          query GetAllEvents($pagination: PaginationInput, $filter: AcadEventFilter, $sorting: AcadEventSorting, $rncp_title_id: ID) {
            GetAllEvents(pagination: $pagination, filter: $filter, sorting: $sorting, rncp_title_id: $rncp_title_id) {
              _id
              name
              from_date
              to_date
              schools {
                _id
                short_name
              }
              class_id {
                _id
                name
              }
              user_types {
                _id
                name
              }
              is_all_school
              count_document
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,filter:t,sorting:i,rncp_title_id:n}}).pipe((0,d.U)(r=>r.data.GetAllEvents))}getAllEventWithParamBySchool(e,t,i,n){return this.apollo.query({query:a.ZP`
          query GetAllEvents($pagination: PaginationInput, $filter: AcadEventFilter, $sorting: AcadEventSorting, $rncp_title_id: ID) {
            GetAllEvents(pagination: $pagination, filter: $filter, sorting: $sorting, rncp_title_id: $rncp_title_id) {
              _id
              name
              from_date
              to_date
              schools {
                _id
                short_name
              }
              class_id {
                _id
                name
              }
              user_types {
                _id
                name
              }
              is_all_school
              count_document
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:e,filter:t,sorting:i,rncp_title_id:n}}).pipe((0,d.U)(r=>r.data.GetAllEvents))}checkEvent(e,t={limit:1,page:0}){return this.apollo.query({query:a.ZP`
          query GetAllEvents($rncp_title_id: ID, $pagination: PaginationInput) {
            GetAllEvents(rncp_title_id: $rncp_title_id, pagination: $pagination) {
              _id
            }
          }
        `,fetchPolicy:"network-only",variables:{rncp_title_id:e,pagination:t}}).pipe((0,d.U)(i=>i.data.GetAllEvents))}getAllEventDropdown(e,t){return this.apollo.query({query:a.ZP`
          query GetAllEvents($filter: AcadEventFilter, $rncp_title_id: ID) {
            GetAllEvents(filter: $filter, rncp_title_id: $rncp_title_id) {
              _id
              name
              count_document
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e,rncp_title_id:t}}).pipe((0,d.U)(i=>i.data.GetAllEvents))}deleteEvent(e){return this.apollo.mutate({mutation:a.ZP`
      mutation DeleteEvent{
        DeleteEvent(_id:"${e}"){
          _id
        }
      }
      `})}getClassDropDownList(e){return this.apollo.query({query:a.ZP`
      query GetClassDropdownList{
        GetClassDropdownList(rncp_id : "${e}"){
          _id
          name
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,d.U)(t=>t.data.GetClassDropdownList))}getClassDropDownListAlphaOrder(e,t){return this.apollo.query({query:a.ZP`
          query getClassDropDownList($rncp_id: String, $sorting: ClassSortingInput) {
            getClassDropDownList(rncp_id: $rncp_id, sorting: $sorting) {
              _id
              name
            }
          }
        `,variables:{rncp_id:e,sorting:t}}).pipe((0,d.U)(i=>i.data.getClassDropDownList))}getAllUserTypes(){return this.apollo.query({query:a.ZP`
          query GetAllUserTypes{
            GetAllUserTypes {
              _id
              name
              # role
            }
          }
        `}).pipe((0,d.U)(e=>e.data.GetAllUserTypes))}getAllUserTypesIncludeStudent(){return this.apollo.query({query:a.ZP`
          query GetAllUserTypesIncludeStudent{
            GetAllUserTypes(show_student_type: include_student) {
              _id
              name
            }
          }
        `}).pipe((0,d.U)(e=>e.data.GetAllUserTypes))}getSchoolDropDownList(e){return this.apollo.query({query:a.ZP`
          query GetSchoolDropdownList{
            GetSchoolDropdownList(rncp_title_id : "${e}") {
              _id
              short_name
            }
          }
        `}).pipe((0,d.U)(t=>t.data.GetSchoolDropdownList))}getSchoolDropDownListAlphaOrder(e,t){return this.apollo.query({query:a.ZP`
          query GetSchoolDropdownList($rncp_title_id: String, $sorting: ClassSortingInput) {
            GetSchoolDropdownList(rncp_title_id: $rncp_title_id, sorting: $sorting) {
              _id
              short_name
            }
          }
        `,variables:{rncp_title_id:e,sorting:t}}).pipe((0,d.U)(i=>i.data.GetSchoolDropdownList))}getOneTestIdentity(e){return this.apollo.query({query:a.ZP`
      query{
        GetOneTest(_id:"${e}"){
          _id
          name
          max_score
          type
          coefficient
          date
          correction_type
          organiser
          date_type
          status
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,d.U)(t=>t.data.GetOneTest))}getOneTestUploadedDocument(e){return this.apollo.query({query:a.ZP`
      query{
        GetOneTest(_id:"${e}"){
          documents{
            name
            file_name
            created_at
            publication_date{
              type
              before
              day
              publication_date{
                year
                month
                date
                hour
                minute
                time_zone
              }
            }
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,d.U)(t=>t.data.GetOneTest))}getOneTestExpectedDocument(e){return this.apollo.query({query:a.ZP`
      query{
        GetOneTest(_id:"${e}"){
          expected_documents{
            document_name
            deadline_date{
              deadline
              type
              before
              day
            }
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,d.U)(t=>t.data.GetOneTest))}setupBasicAcademicKit(e){return this.apollo.mutate({mutation:a.ZP`
      mutation CreateBasicAcademicKit{
        CreateBasicAcademicKit(rncp_title_id: "${e}"){
          _id
        }
      }
      `}).pipe((0,d.U)(t=>t.data.CreateBasicAcademicKit))}getAcademicKitOfSelectedTitle(e){return this.apollo.query({query:a.ZP`
      query {
        GetOneTitle(_id: "${e}") {
          academic_kit {
            categories {
              _id
              folder_name
              is_default_folder
              sub_folders_id {
                _id
                folder_name
                school {
                  _id
                }
              }
              documents {
                _id
                document_name
                publication_date_for_schools {
                  date {
                    date
                    time
                  }
                  school {
                    _id
                  }
                }
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
                  schools {
                    school_id {
                      _id
                    }
                    test_date {
                      date_utc
                      time_utc
                    }
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
                parent_folder {
                  folder_name
                }
              }
              tests {
                _id
                name
                type
                group_test
                correction_type
                is_published
                documents {
                  _id
                  document_name
                  type_of_document
                  s3_file_name
                  published_for_student
                  publication_date_for_schools {
                    date {
                      date
                      time
                    }
                    school {
                      _id
                    }
                  }
                  document_generation_type
                  parent_class_id {
                    _id
                    name
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
                  published_for_user_types_id {
                    _id
                    name
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
                    schools {
                      school_id {
                        _id
                      }
                      test_date {
                        date_utc
                        time_utc
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,d.U)(t=>t.data.GetOneTitle))}getAllAcademicKit(e){return this.apollo.query({query:a.ZP`
      query {
        GetAllAcadKits(rncp_title: "${e}") {
          _id
          title
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,d.U)(t=>t.data.GetAllAcadKits))}getAcademicKitSubfolders(e,t,i){return this.apollo.query({query:a.ZP`
      query GetAcademicKitSubfolders($check_visible: Boolean) {
        GetOneAcadKit(_id: "${e}", check_visible: $check_visible) {
          is_visible
          documents {
            _id
            status
            document_name
            type_of_document
            s3_file_name
            publication_date_for_schools {
              date {
                date
                time
              }
              school {
                _id
              }
            }
            published_for_student
            parent_class_id {
              _id
              name
            }
            parent_test {
              _id
              expected_documents {
                _id
                document_name
                is_for_all_student
                is_for_all_group
              }
              date_type
              date {
                date_utc
                time_utc
              }
              schools {
                school_id {
                  _id
                }
                test_date {
                  date_utc
                  time_utc
                }
              }
            }
            uploaded_for_student {
              _id
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
            document_generation_type
            parent_folder {
              folder_name
            }
          }
          grand_oral_pdfs {
            _id
            document_name
            type_of_document
            document_generation_type
            parent_folder {
              _id
              folder_name
            }
            s3_file_name
            uploaded_for_student {
              _id
              first_name
              last_name
            }
            jury_organization_id {
              _id
            }
          }
          grand_oral_result_pdfs(logged_in_user_type_id: "${t}") {
            _id
            document_name
            type_of_document
            document_generation_type
            parent_folder {
              _id
              folder_name
            }
            s3_file_name
            uploaded_for_student {
              _id
              first_name
              last_name
            }
            jury_organization_id {
              _id
            }
          }
          sub_folders_id {
            _id
            folder_name
            is_grand_oral_folder
            cv_docs {
              _id
              document_name
              type_of_document
              document_generation_type
              parent_folder {
                _id
                folder_name
              }
              s3_file_name
              uploaded_for_student {
                _id
                first_name
                last_name
              }
            }
            presentation_docs {
              _id
              document_name
              type_of_document
              document_generation_type
              parent_folder {
                _id
                folder_name
              }
              s3_file_name
              uploaded_for_student {
                _id
                first_name
                last_name
              }
            }
            jury_id {
              _id
            }
          }
          school {
            _id
          }
          class {
            _id
          }
          parent_rncp_title {
            _id
          }
          tests {
            _id
            name
            type
            group_test
            correction_type
            is_published
            evaluation_id {
              result_visibility
            }
            documents {
              _id
              status
              document_name
              type_of_document
              s3_file_name
              published_for_student
              publication_date_for_schools {
                date {
                  date
                  time
                }
                school {
                  _id
                }
              }
              document_generation_type
              parent_class_id {
                _id
                name
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
              published_for_user_types_id {
                _id
                name
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
                schools {
                  school_id {
                    _id
                  }
                  test_date {
                    date_utc
                    time_utc
                  }
                }
              }
            }
          }
          jury_id {
              _id
            }
        }
      }
      `,fetchPolicy:"network-only",variables:{check_visible:!!i}}).pipe((0,d.U)(n=>n.data.GetOneAcadKit))}getAcademicKitSubfoldersMoveDialog(e,t){return this.apollo.query({query:a.ZP`
      query GetAcademicKitSubfoldersMoveDialog($check_visible: Boolean) {
        GetOneAcadKit(_id: "${e}", check_visible: $check_visible) {
          is_visible
          documents {
            _id
            status
            document_name
            type_of_document
            s3_file_name
            publication_date_for_schools {
              date {
                date
                time
              }
              school {
                _id
              }
            }
            published_for_student
            parent_class_id {
              _id
              name
            }
            parent_test {
              _id
              expected_documents {
                _id
                document_name
                is_for_all_student
                is_for_all_group
              }
              date_type
              date {
                date_utc
                time_utc
              }
              schools {
                school_id {
                  _id
                }
                test_date {
                  date_utc
                  time_utc
                }
              }
            }
            uploaded_for_student {
              _id
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
            document_generation_type
            parent_folder {
              folder_name
            }
          }
          grand_oral_pdfs {
            _id
            document_name
            type_of_document
            document_generation_type
            parent_folder {
              _id
              folder_name
            }
            s3_file_name
            uploaded_for_student {
              _id
              first_name
              last_name
            }
            jury_organization_id {
              _id
            }
          }
          sub_folders_id {
            _id
            folder_name
            is_grand_oral_folder
            cv_docs {
              _id
              document_name
              type_of_document
              document_generation_type
              parent_folder {
                _id
                folder_name
              }
              s3_file_name
              uploaded_for_student {
                _id
                first_name
                last_name
              }
            }
            presentation_docs {
              _id
              document_name
              type_of_document
              document_generation_type
              parent_folder {
                _id
                folder_name
              }
              s3_file_name
              uploaded_for_student {
                _id
                first_name
                last_name
              }
            }
            jury_id {
              _id
            }
          }
          school {
            _id
          }
          class {
            _id
          }
          parent_rncp_title {
            _id
          }
          tests {
            _id
            name
            type
            group_test
            correction_type
            is_published
            evaluation_id {
              result_visibility
            }
            documents {
              _id
              status
              document_name
              type_of_document
              s3_file_name
              published_for_student
              publication_date_for_schools {
                date {
                  date
                  time
                }
                school {
                  _id
                }
              }
              document_generation_type
              parent_class_id {
                _id
                name
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
              published_for_user_types_id {
                _id
                name
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
                schools {
                  school_id {
                    _id
                  }
                  test_date {
                    date_utc
                    time_utc
                  }
                }
              }
            }
          }
          jury_id {
              _id
            }
        }
      }
      `,fetchPolicy:"network-only",variables:{check_visible:!!t}}).pipe((0,d.U)(i=>i.data.GetOneAcadKit))}getAcademicKitParentFolder(e){return this.apollo.query({query:a.ZP`
      query GetAcademicKitParentFolder{
        GetOneAcadKit(_id: "${e}") {
          parent_folder_id {
            _id
            folder_name
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,d.U)(t=>t.data.GetOneAcadKit))}getAcademicKitDetail(e){return this.apollo.query({query:a.ZP`
      query GetAcademicKitDetail{
        GetOneAcadKit(_id: "${e}") {
          _id
          folder_name
          folder_description
          is_default_folder
          sub_folders_id {
            _id
            folder_name
          }
          documents {
            _id
            document_name
            type_of_document
            s3_file_name
            published_for_student
            document_generation_type
            publication_date_for_schools {
              date {
                date
                time
              }
              school {
                _id
              }
            }
            parent_class_id {
              _id
              name
            }
          }
          tests {
            _id
            name
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,d.U)(t=>t.data.GetOneAcadKit))}addAcademicKitFolder(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateAcadKit($acadKitInput: AcadKitInput) {
            CreateAcadKit(kit_input: $acadKitInput) {
              _id
              folder_name
            }
          }
        `,variables:{acadKitInput:e}}).pipe((0,d.U)(t=>t.data.CreateAcadKit))}updateAcademicKitFolder(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateAcadKit($acadKitId: ID!, $acadKitInput: AcadKitInput) {
            UpdateAcadKit(_id: $acadKitId, kit_input: $acadKitInput) {
              _id
              folder_name
            }
          }
        `,variables:{acadKitId:e,acadKitInput:t}}).pipe((0,d.U)(i=>i.data.UpdateAcadKit))}deleteAcademicKitFolder(e){return this.apollo.mutate({mutation:a.ZP`
      mutation DeleteAcademicKitFolder{
        DeleteAcadKit(_id: "${e}") {
          _id
        }
      }
      `}).pipe((0,d.U)(t=>t.data.DeleteAcadKit))}duplicateAcademicKit(e,t){return this.apollo.mutate({mutation:a.ZP`
      mutation DuplicateAcademicKit{
        DuplicateAcadKit(rncp_title: "${e}", rncp_title_destination: "${t}") {
          _id
        }
      }
      `}).pipe((0,d.U)(i=>i.data.DuplicateAcadKit))}createAcadDoc(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateAcadDoc($data: AcadDocumentInput) {
            CreateAcadDoc(doc_input: $data) {
              _id
              document_name
            }
          }
        `,variables:{data:e}}).pipe((0,d.U)(t=>t.data.CreateAcadDoc))}AddDocumentToAcadKitZeroSix(e,t,i){return this.apollo.mutate({mutation:a.ZP`
      mutation AddDocumentToAcadKitZeroSix{
        AddDocumentToAcadKitZeroSix(
          school_id: "${e}"
          test_id: "${t}"
          documents_id: "${i}"
        ) {
          _id
          folder_name
        }
      }
      `}).pipe((0,d.U)(n=>n.data.AddDocumentToAcadKitZeroSix))}createAcadDocJustify(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateAcadDoc($data: AcadDocumentInput) {
            CreateAcadDoc(doc_input: $data) {
              _id
              document_name
              s3_file_name
            }
          }
        `,variables:{data:e}}).pipe((0,d.U)(t=>t.data.CreateAcadDoc))}addDocToAcadKit06(e,t,i){return this.apollo.mutate({mutation:a.ZP`
          mutation addDocToAcadKit06($school_id: ID!, $test_id: ID!, $documents_id: [ID]) {
            AddDocumentToAcadKitZeroSix(school_id: $school_id, test_id: $test_id, documents_id: $documents_id) {
              _id
              folder_name
            }
          }
        `,variables:{school_id:e,test_id:t,documents_id:i}}).pipe((0,d.U)(n=>n.data.AddDocumentToAcadKitZeroSix))}deleteAcadDoc(e){return this.apollo.mutate({mutation:a.ZP`
      mutation DeleteAcadDoc{
        DeleteAcadDoc(_id: "${e}") {
          _id
        }
      }`}).pipe((0,d.U)(t=>t.data))}updateAcadDoc(e,t){return this.apollo.mutate({mutation:a.ZP`
      mutation UpdateAcadDoc($data: AcadDocumentInput){
        UpdateAcadDoc(_id: "${e}" doc_input: $data) {
          _id
          parent_folder {
            folder_name
          }
        }
      }`,variables:{data:t}}).pipe((0,d.U)(i=>i.data))}updateTest(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateTest($id: ID!, $input: TestInput) {
            UpdateTest(_id: $id, test_input: $input) {
              _id
              parent_category {
                folder_name
              }
            }
          }
        `,variables:{id:e,input:t}}).pipe((0,d.U)(i=>i.data.UpdateTest))}getTaskIdForAcadKit(e,t){return this.apollo.query({query:a.ZP`
          query GetAllTasks($filter: TaskFilterInput) {
            GetAllTasks(filter: $filter, ${t?`user_login_type: "${t}"`:""}) {
              _id
              test{
                _id
              }
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).pipe((0,d.U)(i=>i.data.GetAllTasks))}getOneDoc(e){return this.apollo.query({query:a.ZP`
          query GetOneDoc{
            GetOneDoc(_id: "${e}") {
              _id
              document_name
              s3_file_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,d.U)(t=>t.data.GetOneDoc))}getExpectedDocumentDetails(e){return this.apollo.query({query:a.ZP`
          query GetExpectedDocumentDetails{
            GetOneDoc(_id: "${e}") {
              _id
              document_name
              type_of_document
              document_title
              document_industry
              s3_file_name
              task_id{
                _id
                description
                due_date{
                  date
                  time
                }
                for_each_student
                student_id{
                  _id
                  first_name
                  last_name
                  civility
                }
                rncp{
                  _id
                  short_name
                }
                test{
                  _id
                  name
                }
                user_selection {
                  user_type_id{
                    _id
                    name
                  }
                  user_id {
                    student_id{
                      _id
                      first_name
                      last_name
                      civility
                    }
                  }
                }
              }
              document_expected_id{
                _id
                document_name
                file_type
                deadline_date{
                  type
                  before
                  day
                  deadline{
                    date
                    time
                  }
                }
              }
              parent_test {
                _id
                name
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,d.U)(t=>t.data.GetOneDoc))}AddDocumentToAcadKitZeroSixManualTask(e,t,i){return this.apollo.mutate({mutation:a.ZP`
          mutation AddDocumentZeroSixManual($school_id: ID!, $documents_id: [ID], $rncp_title: ID) {
            AddDocumentToAcadKitZeroSix(school_id: $school_id, documents_id: $documents_id, rncp_title: $rncp_title) {
              _id
            }
          }
        `,variables:{school_id:e,documents_id:t,rncp_title:i}}).pipe((0,d.U)(n=>n.data.AddDocumentToAcadKitZeroSix))}getNumberofStudentandGroup(e,t,i){return this.apollo.query({query:a.ZP`
        query GetNumberofStudentandGroup{
          GetNumberOfStudents(school_id: "${e}", class_id: "${t}", test_id: "${i}") {
            number_of_group
            number_of_student
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,d.U)(n=>n.data.GetNumberOfStudents))}getPresentationCvCount(e,t,i){return this.apollo.query({query:a.ZP`
          query GetPresentationCvCount($jury_id: ID, $rncp_id: ID, $school_id: ID) {
            GetPresentationCvCount(jury_id: $jury_id, rncp_id: $rncp_id, school_id: $school_id) {
              cv {
                student_count
                to_show
              }
              presentation {
                student_count
                to_show
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{jury_id:e,rncp_id:t,school_id:i}}).pipe((0,d.U)(n=>n.data.GetPresentationCvCount))}validateOrRejectCvAndPresentation(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation ValidateOrRejectCvAndPresentation($doc_id: ID!, $validation_status: EnumTestCorrectionValidationStatus!, $lang: String) {
            ValidateOrRejectCvAndPresentation(doc_id: $doc_id, validation_status: $validation_status, lang: $lang) {
              _id
            }
          }
        `,variables:{doc_id:e,validation_status:t,lang:this.translate.currentLang}}).pipe((0,d.U)(i=>i.data.ValidateOrRejectCvAndPresentation))}getGrandOralPDF(e,t,i){return this.apollo.query({query:a.ZP`
          query GetGrandOralPDF($jury_id: ID, $student_id: ID, $user_type_id: ID) {
            GetGrandOralPDF(jury_id: $jury_id, student_id: $student_id, user_type_id: $user_type_id)
          }
        `,fetchPolicy:"network-only",variables:{jury_id:e,student_id:t,user_type_id:i}}).pipe((0,d.U)(n=>n.data.GetGrandOralPDF))}getGrandOralPDFCount(e,t,i){return this.apollo.query({query:a.ZP`
          query GetGrandOralPDFCount($jury_id: ID, $rncp_id: ID, $school_id: ID) {
            GetGrandOralPDFCount(jury_id: $jury_id, rncp_id: $rncp_id, school_id: $school_id) {
              grand_oral_pdf {
                student_count
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{jury_id:e,rncp_id:t,school_id:i}}).pipe((0,d.U)(n=>n.data.GetGrandOralPDFCount))}}return _.\u0275fac=function(e){return new(e||_)(u.\u0275\u0275inject(c._M),u.\u0275\u0275inject(p.sK))},_.\u0275prov=u.\u0275\u0275defineInjectable({token:_,factory:_.\u0275fac,providedIn:"root"}),_})()}}]);