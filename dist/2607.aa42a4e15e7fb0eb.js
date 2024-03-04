"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[2607],{96334:(U,y,a)=>{a.d(y,{p:()=>b});var u=a(36895),h=a(92340),n=a(591),i=a(94650),m=a(84075);let b=(()=>{class p{constructor(l,o){this._document=l,this._utils=o,this.tutorialData=new n.X(null),this.collapseSidebar=!1,this.sidenavMode="push",this.sidenavTutorialMode="side",this.sidenavOpen=!0,this.sidenavTutorialOpen=!1,this.horizontalSideNavMode="over",this.horizontalSideNavOpen=!1,this.neutralCivility=!0,this.chartDummyData=!1,this.isStaging="https://api.erp-edh.com/graphql"!==h.N.apiUrl,this.displayDailyChart=!1}setTutorialView(l){this.tutorialData.next(l)}setAppThemeColors(l){Object.entries(l).forEach(([o,d])=>{if(d){const e=this._utils.hexToRgb(d);if("number"==typeof e?.r&&"number"==typeof e?.g&&"number"==typeof e?.b){const{r:t,g:r,b:_}=e;this._document.documentElement.style.setProperty(`--app-theme-color-${o}`,`${t} ${r} ${_}`)}}})}}return p.\u0275fac=function(l){return new(l||p)(i.\u0275\u0275inject(u.K0),i.\u0275\u0275inject(m.t))},p.\u0275prov=i.\u0275\u0275defineInjectable({token:p,factory:p.\u0275fac,providedIn:"root"}),p})()},87746:(U,y,a)=>{a.d(y,{K:()=>o});var u=a(591),h=a(24742),n=a(13125),i=a(24850),m=a(94650),b=a(80529),p=a(18497),g=a(84130);class o{constructor(e,t,r){this.httpClient=e,this.apollo=t,this.permissions=r,this.reloadCurrentUserSource=new u.X(!1),this.reloadPhotoUserSource=new u.X(!1),this.reloadCurrentUser$=this.reloadCurrentUserSource.asObservable(),this.reloadPhotoUser$=this.reloadPhotoUserSource.asObservable()}reloadCurrentUser(e){this.reloadCurrentUserSource.next(e)}reloadPhotoUser(e){this.reloadPhotoUserSource.next(e)}getEntitiesName(){return this.permissions.getPermission("PC School Director")?["academic"]:["operator","academic","company","group_of_schools"]}getEntitiesNameToUserMenu(){return["operator","academic","group_of_schools","company"]}getEntitiesNameForAcadir(){return["academic"]}getSchoolType(){return this.permissions.getPermission("PC School Director")?["preparation_center"]:["certifier","preparation_center"]}getSchoolTypeForAcadir(){return["preparation_center"]}getSchoolTypeForCertifier(){return["certifier"]}getUserTypesByEntity(e){return this.apollo.watchQuery({query:n.ZP`
        query GetUserTypesByEntity{
          GetAllUserTypes(entity: "${e}") {
            _id
            name
          }
        }
      `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(t=>t.data.GetAllUserTypes))}getUserTypesByEntitywithStudent(e){return this.apollo.watchQuery({query:n.ZP`
        query GetUserTypesByEntitywithStudent{
          GetAllUserTypes(entity: "${e}", show_student_type: include_student) {
            _id
            name
          }
        }
      `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(t=>t.data.GetAllUserTypes))}getUserTypesByEntityEdh(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllUserTypes {
            GetAllUserTypes {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllUserTypes))}getUserTypesForTutorial(){return this.apollo.watchQuery({query:n.ZP`
          query GetUserTypesForTutorial {
            GetAllUserTypes(show_student_type: include_student) {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllUserTypes))}getUserTypesGroupMail(){return this.apollo.watchQuery({query:n.ZP`
          query GetUserTypesGroupMail {
            GetAllUserTypes(search: "") {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllUserTypes))}getUserTypesAddTasks(){return this.apollo.watchQuery({query:n.ZP`
          query GetUserTypesAddTasks {
            GetAllUserTypes(show_student_type: include_student) {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllUserTypes))}getAllUserOperator(){return this.apollo.watchQuery({query:n.ZP`
          query GetAllUserOperator {
            GetAllUsers(entity: operator) {
              _id
              last_name
              first_name
              civility
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(e=>e.data.GetAllUsers))}getUserTypesByEntityAndSchoolType(e,t){return this.apollo.watchQuery({query:n.ZP`
        query {
          GetAllUserTypes(entity: "${e}", role:"${t}") {
            _id
            name
          }
        }
      `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(r=>r.data.GetAllUserTypes))}getAllUserType(){return this.apollo.query({query:n.ZP`
          query GetAllUserTypes {
            GetAllUserTypes {
              _id
              name
              entity
            }
          }
        `}).pipe((0,i.U)(e=>{if(e.data)return e.data.GetAllUserTypes}))}getAllUserTypeIncludeStudent(e){return this.apollo.query({query:n.ZP`
          query GetAllUserTypeIncludeStudent{
            GetAllUserTypes(show_student_type: ${e}) {
              _id
              name
              entity
            }
          }
        `}).pipe((0,i.U)(t=>{if(t.data)return t.data.GetAllUserTypes}))}getAllUserTypeNames(){return this.apollo.query({query:n.ZP`
          query {
            GetAllUserTypes(search: "") {
              _id
              name_with_entity
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(e=>e.data.GetAllUserTypes))}getAllUserTypeDropdown(){return this.apollo.query({query:n.ZP`
          query GetAllUserTypes {
            GetAllUserTypes(search: "") {
              _id
              name_with_entity
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(e=>e.data.GetAllUserTypes))}getAllUserTypePCStudentDropdown(e,t){return this.apollo.query({query:n.ZP`
          query GetAllUserTypePCStudentDropdown{
            GetAllUserTypes(entity: "${e}", role: "${t}", show_student_type: include_student) {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(r=>r.data.GetAllUserTypes))}getAllTypeUserMenu(e){return this.apollo.query({query:n.ZP`
          query {
            GetAllUserTypes(search: "${e}") {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetAllUserTypes))}getAllUserTypeExcludeComp(){return this.apollo.query({query:n.ZP`
          query GetAllUserTypes {
            GetAllUserTypes(exclude_company: true, search: "") {
              _id
              name_with_entity
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(e=>e.data.GetAllUserTypes))}getAllUserTypeForUser(e){return this.apollo.query({query:n.ZP`
          query GetAllUserTypes{
            GetAllUserTypes(exclude_company: true, search: "", role:"${e}") {
              _id
              name_with_entity
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetAllUserTypes))}getAllUserTypeNonOp(e){return this.apollo.query({query:n.ZP`
          query GetAllUserTypes{
            GetAllUserTypes(search: "", role:"${e}") {
              _id
              name_with_entity
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetAllUserTypes))}getAllUserTypeNonOpEntity(e){return this.apollo.query({query:n.ZP`
          query GetAllUserTypeNonOpEntity{
            GetAllUserTypes(role:"${e}", show_student_type: include_student) {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetAllUserTypes))}getAllUserTypeStaff(){return this.apollo.query({query:n.ZP`
          query {
            GetAllUserTypes(exclude_company: true, search: "") {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(e=>e.data.GetAllUserTypes))}registerUser(e,t,r){return this.apollo.mutate({mutation:n.ZP`
          mutation registerUser($lang: String!, $userInput: UserInput, $loggin_user_id: ID, $user_type_id: ID) {
            RegisterUser(lang: $lang, user_input: $userInput, loggin_user_id: $loggin_user_id, user_type_id: $user_type_id) {
              _id
              civility
              first_name
              last_name
              email
            }
          }
        `,variables:{lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr",userInput:e,loggin_user_id:t||null,user_type_id:r||null}}).pipe((0,i.U)(_=>_.data.RegisterUser))}registerUserInternship(e,t,r){return this.apollo.mutate({mutation:n.ZP`
          mutation registerUser($lang: String!, $userInput: UserInput,$user_type_id: ID) {
            RegisterUser(lang: $lang, user_input: $userInput, loggin_user_id: ${t}, user_type_id: $user_type_id) {
              _id
              civility
              first_name
              last_name
              email
            }
          }
        `,variables:{lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr",userInput:e,loggin_user_id:t||null,user_type_id:r||null}}).pipe((0,i.U)(_=>_.data.RegisterUser))}updateUser(e,t,r){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateUser($id: ID!, $lang: String!, $inputUser: UserInput!, $user_type_id: ID) {
            UpdateUser(_id: $id, lang: $lang, user_input: $inputUser, user_type_id: $user_type_id) {
              email
            }
          }
        `,variables:{id:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr",inputUser:t,user_type_id:r||null}}).pipe((0,i.U)(_=>{if(_.errors)throw new Error(_.errors.message);return _.data.UpdateUser}))}MakeUserAsCompanyMember(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation MakeUserAsCompanyMember($user_id: ID!, $entities: [EntityInput!]) {
            MakeUserAsCompanyMember(user_id: $user_id, entities: $entities) {
              _id
            }
          }
        `,variables:{user_id:e,entities:t}}).pipe((0,i.U)(r=>{if(r.errors)throw new Error(r.errors.message);return r.data.MakeUserAsCompanyMember}))}registerUserExisting(e,t,r){return this.apollo.mutate({mutation:n.ZP`
          mutation registerUser($lang: String!, $userInput: UserInput,$user_type_id: ID) {
            RegisterUser(lang: $lang, user_input: $userInput, delete_user_and_create: true, loggin_user_id: "${t}", user_type_id: $user_type_id) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,variables:{lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr",userInput:e,user_type_id:r||null}}).pipe((0,i.U)(_=>_.data.RegisterUser))}updateUserExisting(e,t,r){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateUserExisting($id: ID!, $lang: String!, $inputUser: UserInput!, $user_type_id: ID) {
            UpdateUser(_id: $id, lang: $lang, user_input: $inputUser, reactivate_deleted_user: true, user_type_id: $user_type_id) {
              _id
              email
            }
          }
        `,variables:{id:e,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr",inputUser:t,user_type_id:r||null}}).pipe((0,i.U)(_=>{if(_.errors)throw new Error(_.errors.message);return _.data.UpdateUser}))}inactiveEmail(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation incorrectEmail($lang: String, $id: ID) {
            IncorrectEmail(lang: $lang, user_id: $id) {
              email
            }
          }
        `,variables:{lang:e,id:t}}).pipe((0,i.U)(r=>r.data.IncorrectEmail))}deleteUser(e){return this.apollo.mutate({mutation:n.ZP`
          mutation deleteUser($id: ID!) {
            DeleteUser(_id: $id) {
              email
            }
          }
        `,variables:{id:e},errorPolicy:"all"}).pipe((0,i.U)(t=>t))}verifyEmail(e,t){return this.apollo.query({query:n.ZP`
        query GetOneUser($is_validate_email: Boolean){
          GetOneUser(email: "${e}",is_validate_email:$is_validate_email) {
            _id
            incorrect_email
          }
        }
      `,variables:{is_validate_email:t},fetchPolicy:"network-only"}).pipe((0,i.U)(r=>r.data.GetOneUser))}getOneUserDataForIdentityForm(e){return this.apollo.query({query:n.ZP`
        query GetOneUserDataForIdentityForm{
          GetOneUser(_id: "${e}") {
            _id
            civility
            first_name
            last_name
            email
            position
            office_phone
            portable_phone
            profile_picture
            phone_number_indicative
            entities {
              type {
                _id
                name
              }
            }
            user_addresses {
              address
              postal_code
              country
              city
              department
              region
              is_main_address
            }
            curriculum_vitae {
              name
              file_path
              s3_path
            }
            signature {
              name
              s3_path
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetOneUser))}getUserDialogData(e){return this.apollo.watchQuery({query:n.ZP`
        query GetUserDialogData{
          GetOneUser(_id: "${e}") {
            _id
            civility
            first_name
            last_name
            email
            position
            office_phone
            direct_line
            portable_phone
            phone_number_indicative
            curriculum_vitae {
              name
              file_path
              s3_path
            }
            entities {
              entity_name
              school_type
              group_of_school {
                _id
                group_name
              }
              school {
                _id
                short_name
              }
              assigned_rncp_title {
                _id
                short_name
              }
              class {
                _id
              }
              type {
                _id
              }
              companies {
                _id
                company_name
              }
            }
          }
        }
      `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(t=>t.data.GetOneUser))}getUserById(e){return this.apollo.watchQuery({query:n.ZP`
        query GetUserById{
          GetOneUser(_id: "${e}") {
            _id
            civility
            first_name
            last_name
            email
            position
            office_phone
            direct_line
            portable_phone
          }
        }
      `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(t=>t.data.GetOneUser))}getUserEntitiesForTable(e){return this.apollo.query({query:n.ZP`
        query GetUserEntitiesForTable{
          GetOneUser(_id: "${e}") {
            _id
            email
            entities {
              entity_name
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
              programs{
                campus{
                  _id
                  name
                }
                school{
                  _id
                  short_name
                }
                level{
                  _id
                  name
                }
              }
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetOneUser))}getUserEntities(e){return this.apollo.watchQuery({query:n.ZP`
        query GetUserEntities{
          GetOneUser(email: "${e}") {
            email
            entities {
              entity_name
              school_type
              group_of_schools {
                _id
              }
              school {
                _id
              }
              assigned_rncp_title {
                _id
              }
              class {
                _id
              }
              type {
                _id
                  name
              }
            }
          }
        }
      `,fetchPolicy:"network-only"}).valueChanges.pipe((0,i.U)(t=>t.data.GetOneUser))}getUserProfileData(e){return this.apollo.query({query:n.ZP`
        query GetUserProfileData{
          GetOneUser(email: "${e}") {
            _id
            student_id {
              _id
            }
            civility
            first_name
            last_name
            email
            position
            office_phone
            direct_line
            portable_phone
            profile_picture
            entities {
              entity_name
              school_type
              group_of_schools {
                _id
                short_name
              }
              school {
                _id
                short_name
              }
              assigned_rncp_title {
                _id
                short_name
              }
              class {
                _id
                name
              }
              type {
                _id
                name
              }
            }
          }
        }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetOneUser))}getOneUserForMicrosoft(e){return this.apollo.query({query:n.ZP`
        query GetOneUserForMicrosoft{
          GetOneUser(_id: "${e}") {
            _id
            student_id {
              _id
            }
            civility
            first_name
            last_name
            email
            position
            office_phone
            direct_line
            portable_phone
            profile_picture
            entities {
              entity_name
              school_type
              group_of_schools {
                _id
                short_name
              }
              school {
                _id
                short_name
              }
              assigned_rncp_title {
                _id
                short_name
              }
              class {
                _id
                name
              }
              type {
                _id
                name
                usertype_permission_id {
                  _id
                  user_type_name
                  status
                  news {
                    show_perm
                    all_news{
                      show_perm
                      edit_perm
                      action{
                        btn_reset
                      }
                    }
                    manage_news{
                      show_perm
                      edit_perm
                      action{
                        btn_reset
                      }
                    }
                  }
                  quick_search {
                    show_perm
                    search_user
                    search_student
                    search_mentor
                    search_school
                    search_teacher
                    search_tag
                  }
                  companies {
                    show_perm
                    edit_perm
                    add_company
                    delete_perm
                    organization {
                      show_perm
                      add_organization {
                        show_perm
                      }
                      edit_organization {
                        show_perm
                      }
                      delete_organization {
                        show_perm
                      }
                      organization_details {
                        show_perm
                      }
                      contact {
                        show_perm
                        add_contact {
                          show_perm
                        }
                        edit_contact {
                          show_perm
                        }
                        delete_contact {
                          show_perm
                        }
                      }
                    }
                    company_details {
                      company_detail {
                        show_perm
                        revision_perm
                        edit_perm
                      }
                      company_staff {
                        show_perm
                        edit_perm
                        add_perm
                        actions {
                          edit_perm
                          send_email
                          delete_perm
                        }
                      }
                      connected_school {
                        show_perm
                        edit_perm
                        connect_school
                        actions {
                          connect_mentor_to_School
                          delete_perm
                        }
                      }
                    }
                    company_entity {
                      show_perm
                      edit_perm
                      edit_company {
                        show_perm
                        edit_perm
                      }
                      add_company {
                        show_perm
                        edit_perm
                      }
                      note {
                        add_note
                        edit_perm
                      }
                      history_company {
                        show_perm
                        edit_perm
                      }
                      note_company {
                        show_perm
                        edit_perm
                      }
                      member_company {
                        show_perm
                        edit_perm
                      }
                      branch_company {
                        show_perm
                        edit_perm
                      }
                      internship_company {
                        show_perm
                        edit_perm
                      }
                      connect_school {
                        show_perm
                        edit_perm
                      }
                    }
                    company_branch {
                      show_perm
                      edit_perm
                      edit_company {
                        show_perm
                        edit_perm
                      }
                      add_company {
                        show_perm
                        edit_perm
                      }
                      note {
                        add_note
                      }
                      history_company {
                        show_perm
                        edit_perm
                      }
                      note_company {
                        show_perm
                        edit_perm
                      }
                      member_company {
                        show_perm
                        edit_perm
                      }
                      branch_company {
                        show_perm
                        edit_perm
                      }
                      internship_company {
                        show_perm
                        edit_perm
                      }
                      connect_school {
                        show_perm
                        edit_perm
                      }
                      company_staff {
                        show_perm
                        edit_perm
                        add_perm
                        actions {
                          edit_perm
                          send_email
                          delete_perm
                        }
                      }
                    }
                    mentors {
                      show_perm
                    }
                  }
                  tasks {
                    show_perm
                    add_task
                    internal_task
                    add_test_task
                    actions {
                      delete_task
                      edit_perm
                    }
                  }
                  mailbox {
                    show_perm
                    edit_perm
                    inbox
                    sent
                    important
                    draft
                    trash
                    actions {
                      download_email
                      urgent_message
                      mail_to_group
                      compose
                      important
                      delete
                    }
                  }
                  users {
                    show_perm
                    edit_perm
                    add_perm
                    export
                    transfer_responsibility
                    actions {
                      incognito
                      error_email
                      delete_perm
                      edit_perm
                      send_email
                      reminder_reg_user
                      btn_transfer_another_dev
                      btn_transfer_another_program
                      btn_view_student_card
                      btn_view_admission_file
                      btn_resend_registration_email
                      btn_reset
                    }
                  }
                  tutorials {
                    show_perm
                    edit_perm
                    tutorial_table
                    add_perm
                    actions {
                      view_perm
                      edit_perm
                      delete_perm
                      send
                    }
                    inapp_tutorials {
                      show_perm
                      edit_perm
                      actions{
                        btn_add_tutorial
                        btn_reset
                        btn_delete_tutorial
                        btn_view_tutorial
                        btn_publish_tutorial
                      }
                    }
                  }
                  candidate {
                    commentaries {
                      actions{
                        btn_add_comment
                      }
                    }
                    student_card {
                      student_tag {
                        show_perm
                        edit_perm
                        actions {
                          btn_add_tag
                          btn_edit_perm
                        }
                      }
                    }
                    follow_up_contract {
                      edit_perm
                      show_perm
                      actions{
                        btn_add_contract
                        btn_send_email
                        btn_send_reminder
                        btn_view_student_card
                        btn_view_admission_contract
                      }
                    }
                    candidate_tab {
                      show_perm
                      edit_perm
                      connect_as
                    }
                    candidate_history {
                      show_perm
                      edit_perm
                    }
                    admission_member {
                      show_perm
                      edit_perm
                    }
                    mentor {
                      show_perm
                      edit_perm
                    }
                    my_note {
                      show_perm
                      edit_perm
                    }
                    oscar_campus {
                      show_perm
                      edit_perm
                      oscar_import_button {
                        show_perm
                        edit_perm
                      }
                      hubspot_import_button {
                        show_perm
                        edit_perm
                      }
                      actions {
                        btn_import
                        btn_assign_program
                        btn_get_oscar_student
                        btn_export
                        btn_reset
                      }
                    }
                    hubspot {
                      show_perm
                      edit_perm
                      oscar_import_button {
                        show_perm
                        edit_perm
                      }
                      hubspot_import_button {
                        show_perm
                      }
                      actions {
                        btn_assign_program
                        btn_get_hubspot_student
                        btn_export
                        btn_reset
                      }
                    }
                    follow_up_continuous {
                        show_perm
                        actions{
                          btn_crm_ok
                          btn_assign_registration_profile_multiple
                          btn_1st_call_done_multiple
                          btn_1st_email_of_annoucment_multiple
                          btn_transfer_to_another_dev_multiple
                          btn_send_email_multiple
                          btn_reset
                          btn_export_csv
                          btn_assign_registration_profile
                          btn_1st_email_of_annoucment
                          btn_1st_call_done
                          btn_send_email
                          btn_transfer_to_another_dev
                          btn_view_student_card
                          btn_view_admission_file
                          btn_resend_registration_email
                          btn_transfer_another_program
                        }
                      }
                    show_perm
                    edit_perm
                    actions {
                      report_inscription {
                        show_perm
                      }
                      btn_assign_registration_profile_multiple
                      btn_1st_call_done_multiple
                      btn_1st_email_of_annoucment_multiple
                      btn_transfer_to_another_dev
                      btn_crm_ok
                      btn_assign_registration_profile
                      btn_1st_call_done
                      btn_1st_email_of_annoucment
                      btn_transfer_to_another_dev_multiple
                      btn_send_email_multiple
                      btn_export_csv
                      btn_reset
                      btn_send_email
                      btn_transfer_another_program
                      btn_view_student_card
                      btn_view_admission_file
                      btn_resend_registration_email
                    }
                    edit_perm
                    candidate_dashboard {
                      show_perm
                      edit_perm
                    }
                  }
                  intake_channel {
                    intake_channel {
                      show_perm
                      edit_perm
                    }
                    scholar_season {
                      show_perm
                      edit_perm
                      actions{
                        btn_add_scholar_season
                        btn_reset
                        btn_publish
                        btn_edit
                        btn_delete
                      }
                    }
                    school {
                      show_perm
                      edit_perm
                      actions {
                        btn_delete_school
                        btn_edit_school
                        btn_add_school
                        btn_export_csv
                        btn_reset
                      }
                      program {
                        show_perm
                        edit_perm
                        actions{
                          btn_reset
                          btn_export_csv
                          btn_add_program
                          btn_delete_program
                        }
                      }
                      down_payment {
                        show_perm
                        edit_perm
                        actions {
                          btn_export_csv
                          btn_import_down_payment
                        }
                      }
                      full_rate {
                        show_perm
                        edit_perm
                        actions {
                          btn_export_csv
                          btn_import_full_rate
                        }
                      }
                      legal{
                        show_perm
                        edit_perm
                        actions {
                          btn_reset
                          btn_export_csv
                          btn_connect_legal_entity
                          btn_paid_allowance_rate
                          btn_induced_hours
                        }
                      }
                      admission{
                        show_perm
                        edit_perm
                        actions {
                          btn_reset
                          btn_export_csv
                          btn_add_condition_multiple
                          btn_remove_registration_profile
                          btn_add_registration_profile
                        }
                      }
                      course_sequence{
                        show_perm
                        edit_perm
                        actions {
                          btn_reset
                          btn_connect_template
                          btn_details
                        }
                      }
                    }
                    level {
                      show_perm
                      edit_perm
                      actions {
                        btn_edit
                        btn_delete
                        btn_add_level
                        btn_reset
                      }
                    }
                    sector {
                      show_perm
                      edit_perm
                      actions {
                        btn_edit_sector
                        btn_delete_sector
                        btn_add_sector
                        btn_export_csv
                        btn_reset
                      }
                    }
                    site {
                      show_perm
                      edit_perm
                      actions {
                        btn_edit
                        btn_delete
                        btn_add_site
                        btn_reset
                      }
                    }
                    campus {
                      show_perm
                      edit_perm
                      actions {
                        btn_pin
                        btn_edit
                        btn_delete
                        btn_add_site_campus
                      }
                    }
                    full_rate {
                      show_perm
                      edit_perm
                      actions {
                        btn_edit_mode
                        btn_import
                        btn_export
                      }
                    }
                    speciality {
                      show_perm
                      edit_perm
                      actions {
                        btn_delete_speciality
                        btn_edit_speciality
                        btn_add_speciality
                        btn_export_csv
                        btn_reset
                      }
                    }
                    payment_terms {
                      show_perm
                      edit_perm
                    }
                    pricing_profile {
                      show_perm
                      edit_perm
                    }
                    show_perm
                    edit_perm
                    setting {
                      show_perm
                      edit_perm
                      additional_expense {
                        show_perm
                        edit_perm
                        actions {
                          btn_add_additional_expense
                          btn_export_additional_expense
                          btn_edit_additional_expense
                          btn_delete_additional_expense
                          btn_reset
                        }
                      }
                      type_of_formation{
                        actions{
                          btn_reset
                          btn_export_csv
                          btn_add_type_of_formation
                          btn_edit_type_of_formation
                          btn_delete_type_of_formation
                        }
                      }
                      payment_mode {
                        actions{
                          btn_reset
                          btn_export_csv
                          btn_add_payment_mode
                          btn_edit_payment_mode
                          btn_delete_payment_mode
                        }
                      }
                      registration_profile {
                        actions{
                          btn_reset
                          btn_add_registration_profile
                          btn_edit
                          btn_delete
                          btn_add_export
                        }
                      }
                      legal_entities{
                        actions{
                          btn_reset
                          btn_export_csv
                          btn_add_legal_entity
                          btn_edit_legal_entity
                          btn_delete_legal_entity
                          btn_view_legal_entity
                          btn_publish_or_unpublish_legal_entity
                        }
                      }
                    }
                  }
                  setting {
                    user_permission {
                      show_perm
                    }
                    import_objective {
                      show_perm
                      edit_perm
                    }
                    import_objective_finance {
                      show_perm
                      edit_perm
                    }
                    import_finance_n1 {
                      show_perm
                      edit_perm
                    }
                    external_promotion {
                      show_perm
                      edit_perm
                      actions {
                        btn_delete_diapos_external
                        btn_edit_diapos_external
                        btn_add_diapos_external
                        btn_view_diapos_external
                        btn_send_email
                        btn_duplicate_diapos_external
                        btn_publish_diapos_external
                        btn_export_csv
                        btn_reset
                      }
                    }
                    message_step {
                      show_perm
                      edit_perm
                      actions {
                        btn_delete_message_step
                        btn_edit_message_step
                        btn_add_message_step
                        btn_view_message_step
                        btn_send_email
                        btn_duplicate_message_step
                        btn_publish_message_step
                        btn_export_csv
                        btn_reset
                      }
                    }
                    cels_segmentation {
                      show_perm
                      edit_perm
                    }
                    cels_action {
                      show_perm
                      edit_perm
                    }
                    notification_management {
                      show_perm
                      edit_perm
                      actions {
                        btn_edit_notification
                        btn_reset
                        btn_delete_template
                        btn_edit_template
                        btn_add_template
                        btn_view_template
                        btn_reset_template
                      }
                    }
                    show_perm
                    edit_perm
                  }
                  history {
                    notifications {
                      show_perm
                      actions {
                        btn_reset
                        btn_filter_today
                        btn_filter_yesterday
                        btn_filter_last_7_days
                        btn_filter_last_30_days
                        btn_view_notification
                      }
                    }
                    show_perm
                  }
                  finance {
                    unbalanced_balance {
                      show_perm
                      edit_perm
                      actions {
                        btn_export
                        btn_reset
                        send_school_contract_amendment
                      }
                    }
                    operation_lines {
                      show_perm
                      edit_perm
                      not_exported {
                        show_perm
                        edit_perm
                        actions {
                          export_sage
                          export_lines_to_export
                          export_lines_exported
                          export_all_lines
                          btn_reset
                        }
                      }
                      exported {
                        show_perm
                        edit_perm
                        btn_reset
                      }
                    }
                    timeline_template{
                      show_perm
                      create_timeline_template{
                        show_perm
                      }
                      edit_timeline_template{
                        show_perm
                      }
                      delete_timeline_template{
                        show_perm
                      }
                    }
                    general {
                      show_perm
                      edit_perm
                    }
                    cash_in {
                      show_perm
                      edit_perm
                    }
                    payment {
                      show_perm
                      edit_perm
                    }
                    follow_up {
                      show_perm
                      edit_perm
                      actions {
                        btn_generate_billing
                        btn_send_mail_multiple
                        add_payment
                        btn_view_student_card
                        btn_edit_term
                        btn_send_email
                        btn_export
                        btn_reset
                        btn_asking_payment
                      }
                    }
                    member {
                      show_perm
                      edit_perm
                    }
                    history {
                      show_perm
                      edit_perm
                      actions {
                        btn_reconciliation
                        btn_lettrage
                        btn_see_student_file
                        btn_create_internal_task
                        btn_send_email
                        btn_export_csv
                        btn_reset
                        btn_filter_today
                        btn_filter_yesterday
                        btn_filter_last_7_days
                        btn_filter_last_30_days
                        btn_filter_this_month
                      }
                    }
                    reconciliation_letterage {
                      show_perm
                      edit_perm
                    }
                    cheque {
                      show_perm
                      edit_perm
                    }
                    transaction_report {
                      show_perm
                      edit_perm
                      actions {
                        btn_export_csv
                        btn_reset
                        btn_filter_today
                        btn_filter_yesterday
                        btn_filter_last_7_days
                        btn_filter_last_30_days
                        btn_view_transaction_detail
                      }
                    }
                    balance_report {
                      show_perm
                      edit_perm
                      actions {
                        btn_export_csv
                        btn_reset
                        btn_filter_today
                        btn_filter_yesterday
                        btn_filter_last_7_days
                        btn_filter_last_30_days
                        btn_view_transaction_detail
                      }
                    }
                    follow_up_organization {
                      show_perm
                      edit_perm
                      actions{
                        btn_generate_billing
                        btn_send_mail_multiple
                        btn_assign_timeline_multiple
                        btn_export
                        btn_reset
                        btn_send_email
                        add_payment
                        btn_view_student_card
                        btn_edit_term
                        btn_assign_timeline
                      }
                    }
                    master_table_transaction {
                      show_perm
                      actions {
                        btn_export
                        btn_view_transaction
                        btn_view_detail
                        btn_view_student_card
                      }
                    }
                    show_perm
                    edit_perm
                  }
                  alumni {
                    follow_up {
                      show_perm
                      edit_perm
                      actions {
                        btn_export
                        btn_send_survey
                        btn_reset
                        btn_send_survey_multiple
                        btn_send_email
                        btn_view_alumni_card
                      }
                    }
                    member {
                      show_perm
                      edit_perm
                    }
                    card {
                      show_perm
                      edit_perm
                      actions {
                        btn_add_alumni
                        btn_reset
                        btn_add_comment
                        btn_save_identity
                        btn_history_export
                      }
                    }
                    trombinoscope {
                      show_perm
                      edit_perm
                    }
                    show_perm
                    edit_perm
                  }
                  internship {
                    internship_posting {
                      show_perm
                      edit_perm
                    }
                    internship_profile {
                      show_perm
                      edit_perm
                    }
                    candidature {
                      show_perm
                      edit_perm
                    }
                    agreement {
                      show_perm
                      edit_perm
                    }
                    show_perm
                    follow_up {
                      show_perm
                      edit_perm
                    }
                    setting {
                      show_perm
                    }
                    user {
                      show_perm
                    }
                    edit_perm
                  }
                  contracts {
                    show_perm
                    edit_perm
                    contract_process {
                      show_perm
                      edit_perm
                      actions {
                        btn_send_the_form
                        btn_template_for_import
                        btn_import_contract
                        btn_new_contract
                        btn_reset
                        btn_go_to_form
                        btn_edit_contract
                        btn_send_reminder
                        btn_send_email
                        btn_additional_document
                        btn_remove_contract
                      }
                    }
                  }
                  process {
                    show_perm
                    edit_perm
                    document {
                      show_perm
                      edit_perm
                      actions {
                        btn_add_template
                        btn_reset
                        btn_edit
                        btn_delete_template
                        btn_duplicate_template
                      }
                    }
                    form_builder {
                      show_perm
                      edit_perm
                      actions {
                        btn_add_template
                        btn_reset
                        btn_delete_template
                        btn_edit_template
                        btn_duplicate_template
                      }
                    }
                    alumni_survey {
                      show_perm
                      edit_perm
                    }
                  }
                  courses_sequences {
                    show_perm
                    edit_perm
                    btn_export {
                      show_perm
                    }
                    btn_reset {
                      show_perm
                    }
                    btn_add_subject {
                      show_perm
                    }
                    template{
                        create_perm
                        edit_perm
                        show_perm
                        export_perm
                        actions{
                          btn_reset
                          btn_delete
                          btn_duplicate
                        }
                      }
                      sequence{
                        create_perm
                        edit_perm
                        show_perm
                        export_perm
                        actions{
                          btn_reset
                          btn_delete
                          btn_duplicate
                        }
                      }
                      module{
                        create_perm
                        edit_perm
                        show_perm
                        export_perm
                        actions{
                          btn_reset
                          btn_delete
                          btn_template_import
                          btn_import_module
                        }
                      }
                      subject{
                        create_perm
                        edit_perm
                        show_perm
                        export_perm
                        actions{
                          btn_template_import
                          btn_import_subject
                          btn_reset
                          btn_delete
                        }
                      }
                  }
                  readmission {
                    show_perm
                    assignment {
                      show_perm
                      actions {
                        btn_edit_jury_decision
                        btn_edit_program_desired
                        btn_assign_program
                        btn_send_email
                        btn_export
                        btn_financial_situation
                        btn_template_import
                        btn_import_file
                        btn_assign_program_multiple
                        btn_reset
                        btn_assign_program
                        btn_view_student_card
                      }
                    }
                    follow_up {
                      show_perm
                      actions {
                        btn_assign_registration_profile
                        btn_admission_email
                        btn_send_email
                        btn_export
                        btn_assign_registration_profile_multiple
                        btn_admission_email_multiple
                        btn_send_email_multiple
                        btn_reset
                        btn_transfer_to_another_dev
                        btn_transfer_another_program
                        btn_view_student_card
                        btn_view_admission_file
                        btn_resend_registration_email
                        btn_edit_jury_decision
                        btn_send_reminder
                        btn_transfer_to_another_dev_multiple
                      }
                    }
                  }
                  students {
                    show_perm
                    edit_perm
                    export {
                      show_perm
                    }
                    follow_up {
                      show_perm
                      edit_perm
                      actions {
                        btn_reset
                        btn_send_email
                        btn_assign_sequence
                        btn_export
                      }
                    }
                    trombinoscope {
                      show_perm
                      edit_perm
                      actions {
                        btn_reset
                        btn_filter
                        btn_export_pdf
                      }
                    }
                    all_students {
                      show_perm
                      edit_perm
                      actions {
                        btn_export
                        btn_reset
                        btn_send_email
                        btn_add_multiple_tags
                        btn_remove_multiple_tags
                      }
                    }
                  }
                  form_follow_up {
                    show_perm
                    general_form_follow_up {
                      show_perm
                      edit_perm
                    }
                    admission_document_form_follow_up {
                      show_perm
                      edit_perm
                    }
                  }
                  teacher_management {
                    show_perm
                    teacher_follow_up {
                      show_perm
                      actions {
                        btn_generate_contract
                        btn_export
                        btn_view
                        btn_generate_contract_action
                      }
                    }
                    contract_process {
                      show_perm
                      actions {
                        btn_add_type_of_intervention
                        btn_export
                        btn_edit
                        btn_delete
                      }
                    }
                    teachers_table {
                      show_perm
                      actions {
                         btn_add_type_of_intervention
                         btn_export
                         btn_edit
                         btn_delete
                      }
                    }
                  }
                }
              }
            }
          }
        }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetOneUser))}getUserBySchoolId(e,t){return this.apollo.query({query:n.ZP`
          query GetUserBySchoolId{
            GetAllUsers(school: "${e}", ${t?`class_id: "${t}"`:""}) {
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
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(r=>r.data.GetAllUsers))}getAllUserAcadirFromSchool(e,t,r,_){return this.apollo.query({query:n.ZP`
          query GetAllUsers($title: [ID!], $schools: [ID], $user_type: [ID!]) {
            GetAllUsers(title: $title, schools: $schools, ${r?`class_id: "${r}"`:""}, user_type: $user_type) {
              _id
              first_name
              last_name
              civility
              email
              full_name
              entities {
                entity_name
                school {
                  _id
                  short_name
                }
                type {
                  name
                }
              }
            }
          }
        `,variables:{title:t||"",schools:e||"",user_type:_||""},fetchPolicy:"network-only"}).pipe((0,i.U)(s=>s.data.GetAllUsers))}getUserAcademicByTitleId(e,t){return this.apollo.query({query:n.ZP`
          query GetAllUsers($title: [ID!]) {
            GetAllUsers(title: $title, entity: academic, show_student: include_student, ${t?`class_id: "${t}"`:""}) {
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
        `,variables:{title:e||""},fetchPolicy:"network-only"}).pipe((0,i.U)(r=>r.data.GetAllUsers))}getUserEdh(e,t,r){return this.apollo.query({query:n.ZP`
          query GetAllUsers($school: ID, $campuses: [ID], $levels: [ID]) {
            GetAllUsers(school: $school, campuses: $campuses, levels: $levels) {
              _id
              first_name
              last_name
              civility
              email
              full_name
              entities {
                entity_name
                campus {
                  _id
                }
                level {
                  _id
                }
                type {
                  name
                }
              }
            }
          }
        `,variables:{school:e,campuses:t,levels:r},fetchPolicy:"network-only"}).pipe((0,i.U)(_=>_.data.GetAllUsers))}getUserByTitleIdSchool(e,t){return this.apollo.query({query:n.ZP`
          query GetAllUsers($title: [ID!], $schools: [ID]) {
            GetAllUsers(title: $title, schools: $schools, entity: academic, show_student: include_student) {
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
        `,variables:{title:e||"",schools:t||""},fetchPolicy:"network-only"}).pipe((0,i.U)(r=>r.data.GetAllUsers))}getUserType(e,t){return this.apollo.query({query:n.ZP`
          query GetAllUsers($title: [ID!], $user_type: [ID!]) {
            GetAllUsers(title: $title, user_type: $user_type) {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,variables:{title:e||"",user_type:t||""},fetchPolicy:"network-only"}).pipe((0,i.U)(r=>r.data.GetAllUsers))}updateUserEntities(e,t,r){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateUserEntities($_id: ID!, $user_input: UserEntityInput!, $user_type_id: ID) {
            UpdateUserEntities(_id: $_id, user_input: $user_input, user_type_id: $user_type_id) {
              _id
            }
          }
        `,variables:{_id:e,user_input:t,user_type_id:r}}).pipe((0,i.U)(_=>_.data.UpdateUserEntities))}getUserTypeStudent(e,t){return this.apollo.query({query:n.ZP`
          query GetAllUsers($title: [ID!], $user_type: [ID!]) {
            GetAllUsers(title: $title, user_type: $user_type, show_student: student_only) {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,variables:{title:e||"",user_type:t||""},fetchPolicy:"network-only"}).pipe((0,i.U)(r=>r.data.GetAllUsers))}getAllCandidates(e){return this.apollo.query({query:n.ZP`
          query GetAllCandidates($filter: CandidateFilterInput) {
            GetAllCandidates(filter: $filter) {
              _id
              first_name
              last_name
              civility
              email
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetAllCandidates))}getStudentQuickSearch(e){return this.apollo.query({query:n.ZP`
          query GetAllCandidates($filter: CandidateFilterInput) {
            GetAllCandidates(filter: $filter) {
              _id
              first_name
              last_name
              civility
              school {
                _id
                short_name
              }
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetAllCandidates))}getSchoolQuickSearch(e=null,t,r=null){return this.apollo.query({query:n.ZP`
          query GetAllCandidateSchool($filter: CandidateSchoolFilterInput, $sorting: CandidateSchoolSortingInput) {
            GetAllCandidateSchool(filter: $filter, sorting: $sorting, user_type_id: "${t}") {
              _id
              short_name
            }
          }
        `,variables:{filter:e,sorting:r},fetchPolicy:"network-only"}).pipe((0,i.U)(_=>_.data.GetAllCandidateSchool))}getAllStudentsQuickSearch(e=null){return this.apollo.query({query:n.ZP`
          query GetAllStudents($filter: FilterStudent) {
            GetAllStudents(filter: $filter) {
              _id
              first_name
              last_name
              civility
              school {
                _id
                short_name
              }
              candidate_id {
                _id
              }
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetAllStudents))}getAllCandidateQuickSearch(e=null,t,r=null){return this.apollo.query({query:n.ZP`
          query GetAllCandidates($filter: CandidateFilterInput, $user_type_ids: [ID], $sorting: CandidateSortInput) {
            GetAllCandidates(filter: $filter, user_type_ids: $user_type_ids, sorting: $sorting) {
              _id
              first_name
              last_name
              civility
              program_status
              candidate_admission_status
              candidate_unique_number
              is_program_assigned
              school {
                _id
                short_name
              }
              user_id {
                _id
              }
              student_id {
                _id
                student_status
              }
            }
          }
        `,variables:{filter:e,user_type_ids:t,sorting:r},fetchPolicy:"network-only"}).pipe((0,i.U)(_=>_.data.GetAllCandidates))}getTagQuickSearch(e,t,r=null){return this.apollo.query({query:n.ZP`
          query GetAllCandidates($filter: CandidateFilterInput, $user_type_ids: [ID], $sorting: CandidateSortInput) {
            GetAllCandidates(filter: $filter, user_type_ids: $user_type_ids, sorting: $sorting) {
              _id
              first_name
              last_name
              civility
              school {
                _id
                short_name
              }
              user_id {
                _id
              }
              student_id {
                _id
                student_status
              }
              tag_ids {
                _id
                name
              }
            }
          }
        `,variables:{filter:e,user_type_ids:t,sorting:r},fetchPolicy:"network-only"}).pipe((0,i.U)(_=>_.data.GetAllCandidates))}getUserQuickSearch(e,t=null,r=null,_){return this.apollo.query({query:n.ZP`
          query GetAllUsers($full_name: String, $schools: [ID!], $sorting: UserSorting, $user_type: [ID!]) {
            GetAllUsers(full_name: $full_name, schools: $schools, sorting: $sorting, user_type: $user_type) {
              _id
              first_name
              last_name
              civility
              entities {
                school {
                  _id
                  short_name
                }
                companies {
                  _id
                  company_name
                  school_ids {
                    _id
                    short_name
                  }
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
            }
          }
        `,variables:{full_name:e,schools:t,sorting:r,user_type:_},fetchPolicy:"network-only"}).pipe((0,i.U)(s=>s.data.GetAllUsers))}getMentorQuickSearch(e,t,r=null){return this.apollo.query({query:n.ZP`
          query GetAllUsers($last_name: String, $user_type: [ID!], $sorting: UserSorting) {
            GetAllUsers(last_name: $last_name, user_type: $user_type, sorting: $sorting) {
              _id
              first_name
              last_name
              civility
              entities {
                school {
                  _id
                  short_name
                }
                companies {
                  _id
                  company_name
                  school_ids {
                    _id
                    short_name
                  }
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
            }
          }
        `,variables:{last_name:e,user_type:t,sorting:r},fetchPolicy:"network-only"}).pipe((0,i.U)(_=>_.data.GetAllUsers))}getAllUserTypeWithStudent(){return this.apollo.query({query:n.ZP`
          query GetAllUserTypes($show_student_type: EnumShowStudent) {
            GetAllUserTypes(show_student_type: $show_student_type) {
              _id
              name
              entity
            }
          }
        `,fetchPolicy:"network-only",variables:{show_student_type:"include_student"}}).pipe((0,i.U)(e=>e.data.GetAllUserTypes))}getAllUserWithStudent(){return this.apollo.query({query:n.ZP`
          query GetAllUserTypes {
            GetAllUserTypes(exclude_company: true, search: "", show_student_type: include_student) {
              _id
              name
              name_with_entity
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(e=>e.data.GetAllUserTypes))}getUserBasedonSchoolandCampuses(e,t){return this.apollo.watchQuery({query:n.ZP`
          query GetAllUsers($school: ID, $campuses: [ID]) {
            GetAllUsers(school: $school, campuses: $campuses) {
              _id
              first_name
              civility
              last_name
              entities {
                assigned_rncp_title {
                  _id
                }
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{school:e,campuses:t}}).valueChanges.pipe((0,i.U)(r=>r.data.GetAllUsers))}getUserTypeStudentPrograms(e,t){return this.apollo.query({query:n.ZP`
          query GetAllUsers($user_type: [ID!], $programs: [String]) {
            GetAllUsers(user_type: $user_type, show_student: student_only, programs: $programs) {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,variables:{user_type:e||"",programs:t},fetchPolicy:"network-only"}).pipe((0,i.U)(r=>r.data.GetAllUsers))}getUserTypePrograms(e,t){return this.apollo.query({query:n.ZP`
          query GetAllUsers($programs: [String], $user_type: [ID!]) {
            GetAllUsers(programs: $programs, user_type: $user_type) {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,variables:{user_type:t||"",programs:e},fetchPolicy:"network-only"}).pipe((0,i.U)(r=>r.data.GetAllUsers))}getUserByProgram(e){return this.apollo.query({query:n.ZP`
          query GetAllUsers($programs: [String]) {
            GetAllUsers(programs: $programs, show_student: include_student) {
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
        `,variables:{programs:e},fetchPolicy:"network-only"}).pipe((0,i.U)(t=>t.data.GetAllUsers))}quickSearchTeacher(e,t=null){return this.apollo.query({query:n.ZP`
          query GetAllTeachers($filter: TeacherFilterInput, $sorting: TeacherSortingInput) {
            GetAllTeachers(filter: $filter, sorting: $sorting) {
              _id
              civility
              first_name
              last_name
              entities {
                school_type
                school {
                  _id
                  short_name
                }
                entity_name
                type {
                  _id
                  name
                }
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e,sorting:t}}).pipe((0,i.U)(r=>r.data.GetAllTeachers))}getQuickSearchEmail(e,t,r,_){return this.apollo.query({query:n.ZP`
          query GetAllUsers(
            $quick_search_email: String
            $schools: [ID]
            $user_type: [ID!]
            $show_student: EnumShowStudent
            $is_quick_search: Boolean
            $pagination: PaginationInput
          ) {
            GetAllUsers(
              quick_search_email: $quick_search_email
              schools: $schools
              user_type: $user_type
              show_student: $show_student
              is_quick_search: $is_quick_search
              pagination: $pagination
            ) {
              _id
              first_name
              last_name
              civility
              count_document
              entities {
                school_type
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
              candidate_id {
                _id
                school {
                  _id
                  short_name
                }
              }
            }
          }
        `,variables:{quick_search_email:e,schools:t,user_type:r,show_student:"include_student",is_quick_search:!0,pagination:_},fetchPolicy:"network-only"}).pipe((0,i.U)(s=>s.data.GetAllUsers))}getAllCountryCodes(e,t,r,_){return this.apollo.query({query:n.ZP`
          query GetAllCountryCodes(
            $pagination: PaginationInput
            $filter: CountryCodeFilterInput
            $sorting: CountryCodeSortingInput
            $columnCountry: Boolean!
            $columnNationality: Boolean!
            $columnVisaPermit: Boolean!
            $lang: String
          ) {
            GetAllCountryCodes(pagination: $pagination, filter: $filter, sorting: $sorting, lang: $lang) {
              _id
              country @include(if: $columnCountry)
              country_code
              currency
              currency_code
              require_visa_permit @include(if: $columnVisaPermit)
              nationality @include(if: $columnNationality)
              count_document
              country_fr
              nationality_fr
            }
          }
        `,variables:{pagination:e,filter:t,sorting:r,columnCountry:!_?.country&&!1!==_?.country||_.country,columnNationality:!_?.nationality&&!1!==_?.nationality||_.nationality,columnVisaPermit:!_?.visaPermit&&!1!==_?.visaPermit||_.visaPermit,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},fetchPolicy:"network-only"}).pipe((0,i.U)(s=>s.data.GetAllCountryCodes))}getAllCountryCodesForDropdown(){return this.apollo.query({query:n.ZP`
          query GetAllCountryCodes {
            GetAllCountryCodes {
              _id
              country
              country_code
              currency
              currency_code
              require_visa_permit
              nationality
              count_document
              country_fr
              nationality_fr
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(e=>e.data.GetAllCountryCodes))}getAllCountriesDropdown(){return this.apollo.query({query:n.ZP`
          query GetAllVisaPermits {
            GetAllVisaPermits {
              _id
              nationality_id {
                _id
                nationality_en
                nationality_fr
              }
              country_id {
                _id
                country
                country_fr
              }
              require_visa_permit
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,i.U)(e=>e.data.GetAllVisaPermits))}getAllCountries(e,t,r,_){return this.apollo.query({query:n.ZP`
          query GetAllVisaPermits(
            $pagination: PaginationInput
            $filter: VisaPermitFilterInput
            $sorting: VisaPermitSortingInput
            $columnCountry: Boolean!
            $columnNationality: Boolean!
            $columnVisaPermit: Boolean!
            $lang: String
          ) {
            GetAllVisaPermits(pagination: $pagination, filter: $filter, sorting: $sorting, lang: $lang) {
              _id
              nationality_id @include(if: $columnNationality) {
                _id
                nationality_en
                nationality_fr
              }
              country_id @include(if: $columnCountry) {
                _id
                country
                country_fr
              }
              require_visa_permit @include(if: $columnVisaPermit)
              count_document
            }
          }
        `,variables:{pagination:e,filter:t,sorting:r,columnCountry:_?.country,columnNationality:_?.nationality,columnVisaPermit:_?.visaPermit,lang:localStorage.getItem("currentLang")?localStorage.getItem("currentLang"):"fr"},fetchPolicy:"network-only"}).pipe((0,i.U)(s=>s.data.GetAllVisaPermits))}updateVisaPermit(e,t){return this.apollo.mutate({mutation:n.ZP`
          mutation UpdateVisaPermit($id: ID!, $input: VisaPermitInput) {
            UpdateVisaPermit(id: $id, input: $input) {
              _id
              require_visa_permit
            }
          }
        `,variables:{id:e,input:t}}).pipe((0,i.U)(r=>r.data.UpdateVisaPermit))}getUsers(){return this.httpClient.get("assets/data/users.json")}}o.\u0275fac=function(e){return new(e||o)(m.\u0275\u0275inject(b.eN),m.\u0275\u0275inject(p._M),m.\u0275\u0275inject(g.YI))},o.\u0275prov=m.\u0275\u0275defineInjectable({token:o,factory:o.\u0275fac,providedIn:"root"}),function(d,e,t,r){var c,_=arguments.length,s=_<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,t):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(d,e,t,r);else for(var f=d.length-1;f>=0;f--)(c=d[f])&&(s=(_<3?c(s):_>3?c(e,t,s):c(e,t))||s);_>3&&s&&Object.defineProperty(e,t,s)}([(0,h.q)()],o.prototype,"getUsers",null)}}]);