"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[8888],{22437:(V,L,d)=>{d.d(L,{q:()=>U});var _=d(94650);let U=(()=>{class f{constructor(){this.filterSingle=(a,u,o,n,h="")=>null==u?"":h+a?.find(t=>t[o]===u)?.[n],this.filterSingleBoolean=(a,u,o,n,h="")=>null==u?"":h+a?.find(t=>"boolean"==typeof t[o]?JSON.stringify(t[o])===u:"string"==typeof t[o]?t[o]===u:void 0)?.[n],this.filterMultiple=(a,u,o,n,h="")=>u?.length?null===o&&null===n?a.filter(t=>u?.includes(t)).map(t=>h+t):a.filter(t=>u?.includes(t[o]))?.map(t=>h+t[n]):[],this.isValueObject=a=>"object"==typeof a&&!Array.isArray(a)&&null!==a,this.getNestedObjectValue=(a,u)=>{for(const o in a){if(o===u)return a[u];if(this.isValueObject(a[u]))return this.getNestedObjectValue(a[o],u)}},this.getKey=a=>{if(null===a?.filterValue)return null;const u=null===a?.name?a?.filterValue:"boolean"==typeof a?.filterValue?.[a?.name]?String(a?.filterValue?.[a.name]):a.filterValue?.[a.name],o=a.isMultiple,n=a.isSelectionInput,h=a?.fixedValues,t=a?.translationPrefix??"";if(null==u)return null;if(!n&&this.isValueObject(u)&&a?.nestedKey)return t+this.getNestedObjectValue(u,a.nestedKey);if(!n)return t+u;let F;if(h)if(Array.isArray(u))F=h?.filter(P=>u?.includes(P));else if("string"==typeof u||"boolean"==typeof u)return F=h?.find(P=>u===P),F;const E=o?this.filterMultiple(a.filterList,u,a.savedValue,a.displayKey,a.translationPrefix):"boolean"==typeof a?.filterValue?.[a?.name]||"false"===a?.filterValue?.[a?.name]||"true"===a?.filterValue?.[a?.name]?this.filterSingleBoolean(a.filterList,u,a.savedValue,a.displayKey,a.translationPrefix):this.filterSingle(a.filterList,u,a.savedValue,a.displayKey,a.translationPrefix);return o&&F?E.concat(...h):E}}filterBreadcrumb(a,u){const{type:o,column:n}=a,h=u.findIndex(t=>t?.type===o&&t?.column===n);-1!==h?(u[h]=a,!(Array.isArray(u[h]?.value)?u[h]?.value?.length:u[h]?.value)&&!(Array.isArray(u[h]?.key)?u[h]?.key?.length:u[h]?.key)&&u.splice(h,1)):(-1===h&&Array.isArray(a?.value)?a?.value?.length:a?.value)&&u.push(a)}removeFilterBreadcrumb(a,u,o,n,h=!1){"super_filter"===a.type&&u?u[a.name]=null:"table_filter"===a.type&&o?o[a.name]=null:"action_filter"===a.type&&n&&(n[a.name]=null),a?.filterRef?.patchValue(a?.resetValue??null,{emitEvent:h})}filterBreadcrumbFormat(a,u){const o=[...u];for(const n of a){const h=null===n.name?n?.filterValue:"boolean"==typeof n?.filterValue?.[n.name]?String(n?.filterValue?.[n.name]):n?.filterValue?.[n.name],t={type:n.type,name:n.name,column:n.column,filterList:n?.filterList,value:h||null,isMultiple:n.isMultiple,filterRef:n.filterRef,resetValue:n.resetValue,noTranslate:n?.noTranslate,stepColumnName:n?.stepColumnName,key:this.getKey(n)};this.filterBreadcrumb(t,o)}return o}}return f.\u0275fac=function(a){return new(a||f)},f.\u0275prov=_.\u0275\u0275defineInjectable({token:f,factory:f.\u0275fac,providedIn:"root"}),f})()},87791:(V,L,d)=>{d.d(L,{M:()=>x});var _=d(13125),U=d(24742),f=d(24850),b=d(22055),a=d(68745),u=d(35226),o=d.n(u),n=d(15439),t=d(17489),E=d(24006),P=d(53626),C=d(94650),G=d(80529),N=d(18497),B=d(84075),K=d(610),w=d(52688),j=d(65938),Y=d(25046),H=d(89383),Z=d(22437);class x{constructor(e,i,r,c,p,y,D,k,M){this.httpClient=e,this.apollo=i,this.utilService=r,this.router=c,this.authService=p,this.dialog=y,this.formFillingService=D,this.translate=k,this.filterBreadCrumbService=M,this.dataSource=new P.by([]),this.isWaitingForResponseTask=!1,this.isWaitingForResponse=!1,this.pagination={limit:10,page:0},this.subs=new a.Y,this.filterValues={test_id:"",is_not_parent_task:!0,task_statuses:[],from:"",to:"",rncp_title:"",priorities:null,due_date:{date:"",time:""},created_at:{date:"",time:""},descriptions:null,school_ids:null,campuses:null,offset:null},this.sortingValues={due_date:"desc",status:"",from:"",to:"",priority:"",created_at:"",school:""},this.statusListUnmap=[{label:"ToDo",value:"todo"},{label:"Done",value:"done"}],this.priorityList=[{label:"1",value:1},{label:"2",value:2},{label:"3",value:3}],this.filteredValuesAll={task_statuses:"All",priorities:"All",descriptions:"All",school_ids:"All",campuses:"All"},this.filterSchoolList=[],this.filterCampusList=[],this.filterTitleList=[],this.taskTypeList=[],this.dueDateFilter=new E.UntypedFormControl(""),this.taskStatusFilter=new E.UntypedFormControl(null),this.createdByFilter=new E.UntypedFormControl,this.assignedFilter=new E.UntypedFormControl,this.priorityFilter=new E.UntypedFormControl(null),this.createdDateFilter=new E.UntypedFormControl(""),this.schoolFilter=new E.UntypedFormControl(null),this.campusFilter=new E.UntypedFormControl(null),this.descriptionFilter=new E.UntypedFormControl(null),this.CurUser=this.authService.getLocalStorageUser()}getTask(){return this.httpClient.get("assets/data/task.json")}getUserTypesCorrectorsID(){return[{_id:"5a2e1ecd53b95d22c82f9559",name:"Corrector"},{_id:"5b210d24090336708818ded1",name:"Corrector Certifier"},{_id:"5a2e1ecd53b95d22c82f954e",name:"operator_admin"}]}getMarkEntryProgress(e){return this.apollo.query({query:_.ZP`
            query {
              GetTestProgress(_id: "${e}") {
                mark_entry_done {
                  _id
                }
              }
            }
        `,fetchPolicy:"network-only"}).pipe((0,f.U)(i=>i.data.GetTestProgress))}getTestProgress(e,i){return this.apollo.query({query:_.ZP`
            query GetTestProgress{
              GetTestProgress(_id: "${e}", school_id: "${i}") {
                mark_entry_done {
                  _id
                }
                validate_done {
                  _id
                }
              }
            }
        `,fetchPolicy:"network-only"}).pipe((0,f.U)(r=>r.data.GetTestProgress))}checkMarkEntryStarted(e,i){return this.apollo.query({query:_.ZP`
            query {
              GetAllTestCorrections(test_id: "${e}", school_id: "${i}") {
                _id
              }
            }
        `,fetchPolicy:"network-only"}).pipe((0,f.U)(r=>r.data.GetAllTestCorrections))}getTestDetail(e){return this.apollo.query({query:_.ZP`
          query GetOneTest{
            GetOneTest(_id: "${e}") {
              _id
              correction_type
              group_test
              block_type
              parent_rncp_title {
                long_name
              }
              class_id {
                name
                type_evaluation
              }
              evaluation_id {
                _id
                evaluation
              }
              subject_id {
                subject_name
              }
              date {
                date_utc
                time_utc
              }
              corrector_assigned {
                corrector_id {
                  _id
                  first_name
                  last_name
                  civility
                }
                school_id {
                  _id
                }
                no_of_student
              }
              block_of_competence_condition_id {
                _id
                specialization {
                  _id
                }
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,f.U)(i=>i.data.GetOneTest))}getStudentCount(e,i,r,c,p,y={limit:1,page:0},D="active_pending"){return this.apollo.query({query:_.ZP`
          query GetAllStudentsForAssignCorrector(
            $titleId: ID
            $classId: ID
            $schoolId: ID
            $pagination: PaginationInput
            $status: EnumFilterStatus
          ) {
            GetAllStudents(
              rncp_title: $titleId,
              current_class: $classId,
              school: $schoolId,
              ${c?`specialization_id: "${c}"`:""}
              ${p?`block_of_competence_condition_id: "${p}"`:""}
              pagination: $pagination,
              status: $status
            ) {
              count_document
            }
          }
        `,variables:{titleId:e,classId:r,schoolId:i,pagination:y,status:D},fetchPolicy:"network-only"}).pipe((0,f.U)(k=>k.data.GetAllStudents))}getRetakeStudentCount(e,i,r,c,p,y,D,k={limit:1,page:0},M="retaking"){return this.apollo.query({query:_.ZP`
          query GetAllRetakeStudentsForAssignCorrector(
            $titleId: ID
            $classId: ID
            $schoolId: ID
            $testId: ID
            $evaluationId: ID
            $pagination: PaginationInput
            $status: EnumFilterStatus
          ) {
            GetAllStudents(
              rncp_title: $titleId,
              current_class: $classId,
              school: $schoolId,
              for_final_retake_test: true,
              test_for_final_retake: $testId,
              evaluation_for_final_retake: $evaluationId,
              ${c?`specialization_id: "${c}"`:""}
              ${p?`block_of_competence_condition_id: "${p}"`:""}
              pagination: $pagination,
              status: $status
            ) {
              count_document
            }
          }
        `,variables:{titleId:e,classId:r,schoolId:i,testId:y,evaluationId:D,pagination:k,status:M},fetchPolicy:"network-only"}).pipe((0,f.U)(W=>W.data.GetAllStudents))}getTestGroups(e,i){return this.apollo.query({query:_.ZP`
      query getAllGroupsOfAssignCorrector{
        GetAllTestGroups(test_id: "${e}", school_id: "${i}") {
          _id
          test {
            _id
          }
          name
          students {
            student_id {
              _id
            }
          }
          school {
            _id
          }
          rncp {
            _id
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,f.U)(r=>r.data.GetAllTestGroups))}getCorrectorUsers(e,i,r){return this.apollo.query({query:_.ZP`
          query GetAllUsers($title: [ID!], $schools: [ID], $user_type: [ID!]) {
            GetAllUsers(title: $title, schools: $schools, user_type: $user_type) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,variables:{title:e,schools:i,user_type:r},fetchPolicy:"network-only"}).pipe((0,f.U)(c=>c.data.GetAllUsers))}getCorrectorCertifierUsers(e,i){return this.apollo.query({query:_.ZP`
          query GetAllUsers($title: [ID!], $user_type: [ID!]) {
            GetAllUsers(title: $title, user_type: $user_type) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,variables:{title:e,user_type:i},fetchPolicy:"network-only"}).pipe((0,f.U)(r=>r.data.GetAllUsers))}assignCorrector(e,i,r,c){return this.apollo.mutate({mutation:_.ZP`
          mutation SaveAssignedCorrector($test_id: ID!, $school_id: ID!, $correctors_id: [ID!], $update_corrector: Boolean) {
            SaveAssignedCorrector(
              test_id: $test_id
              school_id: $school_id
              correctors_id: $correctors_id
              update_corrector: $update_corrector
            ) {
              _id
            }
          }
        `,variables:{test_id:e,school_id:i,correctors_id:r,update_corrector:c}}).pipe((0,f.U)(p=>p.data.SaveAssignedCorrector))}studentJustification(e,i){return this.apollo.mutate({mutation:_.ZP`
          mutation StudentJustification($task_id: ID, $reason: String) {
            StudentJustification(task_id: $task_id, reason: $reason) {
              _id
            }
          }
        `,variables:{task_id:e,reason:i}}).pipe((0,f.U)(r=>r.data.StudentJustification))}juryJustification(e,i){return this.apollo.mutate({mutation:_.ZP`
          mutation JuryJustification($task_id: ID, $reason: String) {
            JuryJustification(task_id: $task_id, reason: $reason) {
              _id
            }
          }
        `,variables:{task_id:e,reason:i}}).pipe((0,f.U)(r=>r.data.JuryJustification))}assignCorrectorForRetake(e,i,r,c,p){return this.apollo.mutate({mutation:_.ZP`
          mutation SaveAssignedCorrectorForFinalRetake(
            $test_id: ID!
            $school_id: ID!
            $correctors_id: [ID!]
            $update_corrector: Boolean
            $taskId: ID
          ) {
            SaveAssignedCorrectorForFinalRetake(
              test_id: $test_id
              school_id: $school_id
              correctors_id: $correctors_id
              update_corrector: $update_corrector
              task_id: $taskId
            ) {
              _id
            }
          }
        `,variables:{test_id:e,school_id:i,correctors_id:r,update_corrector:c,taskId:p}}).pipe((0,f.U)(y=>y.data.SaveAssignedCorrectorForFinalRetake))}startNextTask(e,i,r,c){return this.apollo.mutate({mutation:_.ZP`
          mutation DoneAndStartNextTask($done_task_id: ID!, $next_assigned_users: [ID!], $update_assigned_user: Boolean, $lang: String) {
            DoneAndStartNextTask(
              done_task_id: $done_task_id
              next_assigned_users: $next_assigned_users
              update_assigned_user: $update_assigned_user
              lang: $lang
            ) {
              _id
            }
          }
        `,variables:{done_task_id:e,next_assigned_users:i,update_assigned_user:r,lang:c}}).pipe((0,f.U)(p=>p.data.DoneAndStartNextTask))}startNextTaskForGroup(e,i,r,c){return this.apollo.mutate({mutation:_.ZP`
          mutation DoneAndStartNextTask($done_task_id: ID!, $next_assigned_groups: [ID!], $update_assigned_group: Boolean, $lang: String) {
            DoneAndStartNextTask(
              done_task_id: $done_task_id
              next_assigned_groups: $next_assigned_groups
              update_assigned_group: $update_assigned_group
              lang: $lang
            ) {
              _id
            }
          }
        `,variables:{done_task_id:e,next_assigned_groups:i,update_assigned_group:r,lang:c}}).pipe((0,f.U)(p=>p.data.DoneAndStartNextTask))}getMyTask(e,i,r,c){return this.apollo.query({query:_.ZP`
          query GetAllTasks($pagination: PaginationInput, $sorting: TaskSortingInput, $filter: TaskFilterInput, $user_login_type: ID) {
            GetAllTasks(pagination: $pagination, sorting: $sorting, filter: $filter, user_login_type: $user_login_type) {
              _id
              rncp {
                _id
              }
              form_process_id {
                civility
                first_name
                last_name
                form_builder_id {
                  _id
                  template_type
                }
              }
              test_group_id {
                _id
                name
              }
              task_status
              due_date {
                date
                time
              }
              created_by {
                _id
                first_name
                last_name
                civility
              }
              created_date {
                date
                time
              }
              rncp {
                _id
                short_name
              }
              school {
                _id
                short_name
                country
              }
              campuses {
                _id
                name
              }
              class_id {
                _id
                name
              }
              #created_by {
              #  _id
              #  civility
              #  first_name
              #  last_name
              #}
              user_selection {
                user_id {
                  _id
                  civility
                  first_name
                  last_name
                  student_id {
                    _id
                  }
                  entities {
                    campus {
                      name
                    }
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
                type
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
              fc_contract_process_id {
                _id
              }
              employability_survey_id {
                _id
              }
              jury_member_id
              jury_id {
                _id
                name
                type
                jury_members {
                  _id
                  students {
                    student_id {
                      _id
                    }
                    date_test
                    test_hours_start
                  }
                }
              }
              candidate_id {
                _id
                civility
                first_name
                last_name
                intake_channel {
                  _id
                  program
                  scholar_season_id {
                    _id
                    scholar_season
                  }
                }
              }
              contract_process {
                _id
                civility
                last_name
                first_name
              }
              admission_process_id {
                _id
              }
              admission_process_step_name
            }
          }
        `,variables:{sorting:i,pagination:e,filter:r,user_login_type:c},fetchPolicy:"network-only"}).pipe((0,f.U)(p=>p.data.GetAllTasks))}getAllSchool(){return this.apollo.query({query:_.ZP`
          query GetAllCandidateSchool {
            GetAllCandidateSchool {
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
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,f.U)(e=>e.data.GetAllCandidateSchool))}getOneTask(e){return this.apollo.query({query:_.ZP`
          query GetOneTask($_id: ID!) {
            GetOneTask(_id: $_id) {
              _id
              test_group_id {
                _id
                name
              }
              task_status
              due_date {
                date
                time
              }
              created_date {
                date
                time
              }
              rncp {
                _id
                short_name
              }
              school {
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
                type
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
              employability_survey_id {
                _id
              }
              jury_id {
                _id
                name
              }
            }
          }
        `,variables:{_id:e},fetchPolicy:"network-only"}).pipe((0,f.U)(i=>i.data.GetOneTask))}GetADMTCTitleDropdownList(){return this.apollo.query({query:_.ZP`
          query GetTitleDropdownList{
            GetTitleDropdownList {
              _id
              short_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,f.U)(e=>e.data.GetTitleDropdownList))}updateManualTask(e,i){return this.apollo.mutate({mutation:_.ZP`
          mutation UpdateTask($_id: ID!, $task_input: AcadTaskInput) {
            UpdateTask(_id: $_id, task_input: $task_input) {
              _id
            }
          }
        `,variables:{_id:e,task_input:i}}).pipe((0,f.U)(r=>r.data.UpdateTask))}doneManualTask(e){return this.apollo.mutate({mutation:_.ZP`
          mutation DoneAndStartNextTaskManualTask($done_task_id: ID!) {
            DoneAndStartNextTask(done_task_id: $done_task_id) {
              _id
            }
          }
        `,variables:{done_task_id:e}}).pipe((0,f.U)(i=>i.data.DoneAndStartNextTask))}deleteManualTask(e){return this.apollo.mutate({mutation:_.ZP`
          mutation DeleteTask($_id: ID!) {
            DeleteTask(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:e}}).pipe((0,f.U)(i=>i.data.DeleteTask))}getTaskForJury(e){return this.apollo.query({query:_.ZP`
          query {
            GetOneTask(_id: "${e}") {
              jury_member_id
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,f.U)(i=>i.data.GetOneTask))}getJuryFromTask(e){return this.apollo.query({query:_.ZP`
          query {
            GetOneJuryMember(_id: "${e}") {
              students {
                student_id {
                  _id
                }
                date_test
                test_hours_start
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,f.U)(i=>i.data.GetOneJuryMember))}openTask(e){e&&e.task_status&&"todo"===e.task_status&&(e&&e.description&&e&&"Validate Financement"===e.description&&this.viewCandidateInfo(e,"Student","Financement"),e&&e.type&&("fc_contract_process"===e.type?this.goToFCContractForm(e):("add_task"===e.type||"addTask"===e.type||"internal_task"===e.type)&&this.openManualTask(e)),"student_confirm_certificate"===e.type&&this.utilService.isUserStudent()&&this.redirectToMyFileDetailOfCertificationTab(),e.type&&"validate_contract_process"===e.type&&this.goToForm(e),e.type&&"validate_student_admission_process"===e.type&&this.goToFormContinousAdmissionFC(e),("complete_form_process"===e.type||"revision_form_proses"===e.type||"validate_form_process"===e.type||"final_validate_form_process"===e.type)&&this.goToAdmissionProcessForm(e))}viewCandidateInfo(e,i,r){const c=e?.candidate_id?.intake_channel?._id,p={selectedCandidate:e?.candidate_id?._id,tab:i||"",subTab:r||"",paginator:JSON.stringify({pageIndex:this.paginator.pageIndex,pageSize:this.paginator.pageSize})};if(c&&(p.selectedProgram=c),i){const y=this.router.createUrlTree(["candidate-file"],{queryParams:p});window.open(y.toString(),"_blank")}else{const y=this.router.createUrlTree(["candidate-file"],{queryParams:p});window.open(y.toString(),"_blank")}}goToFCContractForm(e){if(e&&e.fc_contract_process_id&&e.fc_contract_process_id._id){const i=this.router.createUrlTree(["form-fc-contract"],{queryParams:{formId:e.fc_contract_process_id._id,userId:this.CurUser._id,candidateId:e.candidate_id&&e.candidate_id._id?e.candidate_id._id:"",formType:"fc_contract",type:"edit"}});window.open(i.toString(),"_blank")}}openManualTask(e){const i=this.dialog.open(b.E,{width:"600px",minHeight:"100px",panelClass:"certification-rule-pop-up",disableClose:!0,data:{taskData:e}});this.subs.sink=i.afterClosed().subscribe(r=>{this.getMyTasks()})}redirectToMyFileDetailOfCertificationTab(){this.router.navigate(["/my-file"],{queryParams:{identity:"verification"}})}goToForm(e){const i=this.router.createUrlTree(["/form-teacher-contract"],{queryParams:{formId:e.contract_process._id,userId:e.user_selection.user_id._id,formType:"teacher_contract"}});window.open(i.toString(),"_blank")}goToFormContinousAdmissionFC(e){const i=this.authService.getCurrentUser().entities[0].type._id,r=this.router.createUrlTree(["/form-fill"],{queryParams:{formId:e.admission_process_id._id,formType:"student_admission",userId:e.user_selection.user_id._id,userTypeId:i}});window.open(r.toString(),"_blank")}goToAdmissionProcessForm(e){this.isWaitingForResponseTask=!0,this.subs.sink=this.formFillingService.getOneTaskForFormFilling(e._id).subscribe(i=>{if(this.isWaitingForResponseTask=!1,i){const r=t.cloneDeep(i),c=this.router.url.split("/")[0],p=i.form_process_id&&i.form_process_id._id?i.form_process_id._id:null,y=i.user_selection&&i.user_selection.user_id&&i.user_selection.user_id._id?i.user_selection.user_id._id:null;let D=null;const k=i?.user_selection?.user_type_id?._id?i?.user_selection?.user_type_id?._id:null;if(k&&this.CurUser?.app_data?.user_type_id?.length&&(D=this.CurUser?.app_data?.user_type_id?.find(M=>M===k)),D||(D=this.authService.getCurrentUser().entities[0].type._id),p&&y)if(r&&r.form_process_id&&r.form_process_id.form_builder_id&&"student_admission"===r.form_process_id.form_builder_id.template_type)window.open(`${c}/form-fill?formId=${p}&formType=student_admission&userId=${y}&userTypeId=${D}`,"_blank");else if(r&&r.form_process_id&&r.form_process_id.form_builder_id&&"fc_contract"===r.form_process_id.form_builder_id.template_type){const M=i?.form_process_step_id?.user_who_complete_step?._id;window.open(`${c}/form-fill?formId=${p}&formType=fc_contract&userId=${y}&userTypeId=${r?.user_selection?.user_type_id?._id?r?.user_selection?.user_type_id?._id:M}`,"_blank")}else r&&r.form_process_id&&r.form_process_id.form_builder_id&&"teacher_contract"===r.form_process_id.form_builder_id.template_type?window.open(`${c}/form-fill?formId=${p}&formType=teacher_contract&userId=${y}&userTypeId=${D}`,"_blank"):r&&r.form_process_id&&r.form_process_id.form_builder_id&&"one_time_form"===r.form_process_id.form_builder_id.template_type?window.open(`${c}/form-fill?formId=${p}&formType=one_time_form&userId=${y}&userTypeId=${D}`,"_blank"):r&&r.form_process_id&&r.form_process_id.form_builder_id&&"admission_document"===r.form_process_id.form_builder_id.template_type&&window.open(`${c}/form-fill?formId=${p}&formType=admissionDocument&userId=${y}&userTypeId=${D}`,"_blank")}},i=>{this.authService.postErrorLog(i),this.isWaitingForResponseTask=!1,this.swalError(i)})}getMyTasks(){this.pagination={limit:10,page:this.paginator.pageIndex},this.filterValues.offset=this.filterValues.due_date.date||this.filterValues.due_date.time||this.filterValues.created_at.date||this.filterValues.created_at.time?n().utcOffset():null;const i=this.cleanSortingPayload(),r=this.cleanFilterPayload();this.isWaitingForResponse=!0,this.isReset=!1,this.getMyTask(this.pagination,i,r,this.currentUser).subscribe(c=>{this.isWaitingForResponse=!1,this.dataSource.data=c,this.paginator.length=c&&c.length&&c[0].count_document?c[0].count_document:0,this.filterBreadcrumbData=[],this.filterBreadcrumbFormat()},c=>{this.authService.postErrorLog(c),this.isWaitingForResponse=!1,c&&c.message&&(c.message.includes("jwt expired")||c.message.includes("str & salt required")||c.message.includes("Authorization header is missing")||c.message.includes("salt"))?this.authService.handlerSessionExpired():this.swalError(c)})}filterBreadcrumbFormat(){this.filterBreadcrumbData=this.filterBreadCrumbService.filterBreadcrumbFormat([{type:"table_filter",name:"due_date",column:"TASK.Due_Date",isMultiple:!1,filterValue:this.filterValues?.due_date?.date?this.filterValues:null,filterList:null,filterRef:this.dueDateFilter,isSelectionInput:!1,displayKey:null,savedValue:null,nestedKey:"date"},{type:"table_filter",name:"task_statuses",column:"TASK.Status",isMultiple:this.taskStatusFilter?.value?.length!==this.statusListUnmap?.length,filterValue:this.taskStatusFilter?.value?.length===this.statusListUnmap?.length?this.filteredValuesAll:this.filterValues,filterList:this.taskStatusFilter?.value?.length===this.statusListUnmap?.length?null:this.statusListUnmap,filterRef:this.taskStatusFilter,isSelectionInput:this.taskStatusFilter?.value?.length!==this.statusListUnmap?.length,displayKey:this.taskStatusFilter?.value?.length===this.statusListUnmap?.length?null:"label",savedValue:this.taskStatusFilter?.value?.length===this.statusListUnmap?.length?null:"value"},{type:"table_filter",name:"from",column:"TASK.From",isMultiple:!1,filterValue:this.filterValues,filterList:null,filterRef:this.createdByFilter,isSelectionInput:!1,displayKey:null,savedValue:null},{type:"table_filter",name:"to",column:"TASK.Assigned_To",isMultiple:!1,filterValue:this.filterValues,filterList:null,filterRef:this.assignedFilter,isSelectionInput:!1,displayKey:null,savedValue:null},{type:"table_filter",name:"priorities",column:"P",isMultiple:this.priorityFilter?.value?.length!==this.priorityList?.length,filterValue:this.priorityFilter?.value?.length===this.priorityList?.length?this.filteredValuesAll:this.filterValues,filterList:this.priorityFilter?.value?.length===this.priorityList?.length?null:this.priorityList,filterRef:this.priorityFilter,isSelectionInput:this.priorityFilter?.value?.length!==this.priorityList?.length,displayKey:this.priorityFilter?.value?.length===this.priorityList?.length?null:"label",savedValue:this.priorityFilter?.value?.length===this.priorityList?.length?null:"value"},{type:"table_filter",name:"created_at",column:"TASK.Created",isMultiple:!1,filterValue:this.filterValues?.created_at?.date?this.filterValues:null,filterList:null,filterRef:this.createdDateFilter,isSelectionInput:!1,displayKey:null,savedValue:null,nestedKey:"date"},{type:"table_filter",name:"school_ids",column:"TASK.School",isMultiple:this.schoolFilter?.value?.length!==this.filterSchoolList?.length,filterValue:this.schoolFilter?.value?.length===this.filterSchoolList?.length?this.filteredValuesAll:this.filterValues,filterList:this.schoolFilter?.value?.length===this.filterSchoolList?.length?null:this.filterSchoolList,filterRef:this.schoolFilter,isSelectionInput:this.schoolFilter?.value?.length!==this.filterSchoolList?.length,displayKey:this.schoolFilter?.value?.length===this.filterSchoolList?.length?null:"short_name",savedValue:this.schoolFilter?.value?.length===this.filterSchoolList?.length?null:"_id"},{type:"table_filter",name:"campuses",column:"TASK.Campus",isMultiple:this.campusFilter?.value?.length!==this.filterCampusList?.length,filterValue:this.campusFilter?.value?.length===this.filterCampusList?.length?this.filteredValuesAll:this.filterValues,filterList:this.campusFilter?.value?.length===this.filterCampusList?.length?null:this.filterCampusList,filterRef:this.campusFilter,isSelectionInput:this.campusFilter?.value?.length!==this.filterCampusList?.length,displayKey:this.campusFilter?.value?.length===this.filterCampusList?.length?null:"name",savedValue:this.campusFilter?.value?.length===this.filterCampusList?.length?null:"name"},{type:"table_filter",name:"descriptions",column:"Description",isMultiple:this.descriptionFilter?.value?.length!==this.taskTypeList?.length,filterValue:this.descriptionFilter?.value?.length===this.taskTypeList?.length?this.filteredValuesAll:this.filterValues,filterList:this.descriptionFilter?.value?.length===this.taskTypeList?.length?null:this.taskTypeList,filterRef:this.descriptionFilter,isSelectionInput:this.descriptionFilter?.value?.length!==this.taskTypeList?.length,displayKey:this.descriptionFilter?.value?.length===this.taskTypeList?.length?null:"name",savedValue:this.descriptionFilter?.value?.length===this.taskTypeList?.length?null:"name"}],this.filterBreadcrumbData)}cleanFilterPayload(){const e=t.cloneDeep(this.filterValues);if(e){e.test_id||delete e.test_id,(!e.task_statuses||!e.task_statuses?.length)&&delete e.task_status,e.from||delete e.from,e.to||delete e.to,e.rncp_title||delete e.rncp_title,(!e.priorities||!e.priorities?.length)&&delete e.priorities,(!e.school_ids||!e.school_ids?.length)&&delete e.school_ids,(!e.campuses||!e.campuses?.length)&&delete e.campuses,(!e.descriptions||!e.descriptions?.length)&&delete e.descriptions,e.due_date&&(!e.due_date.date||!e.due_date.time)&&delete e.due_date,e.created_at&&(!e.created_at.date||!e.created_at.time)&&delete e.created_at,e.offset||delete e.offset;const i=this.utilService.getCurrentUser();i&&i.entities&&i.entities[0]&&"preparation_center"===i.entities[0].school_type&&i.entities[0].school&&i.entities[0].school?._id&&(e.school_id=i.entities[0].school?._id),e.school_id||delete e.school_id}return e}cleanSortingPayload(){const e=t.cloneDeep(this.sortingValues);return e&&(e.due_date||delete e.due_date,e.status||delete e.status,e.from||delete e.from,e.to||delete e.to,e.priority||delete e.priority,e.created_at||delete e.created_at,e.school||delete e.school),e}swalError(e){o().fire({type:"info",title:this.translate.instant("SORRY"),text:e&&e.message?this.translate.instant(e.message.replaceAll("GraphQL error: ","")):e,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})}}x.\u0275fac=function(e){return new(e||x)(C.\u0275\u0275inject(G.eN),C.\u0275\u0275inject(N._M),C.\u0275\u0275inject(B.t),C.\u0275\u0275inject(K.F0),C.\u0275\u0275inject(w.e),C.\u0275\u0275inject(j.uw),C.\u0275\u0275inject(Y.d),C.\u0275\u0275inject(H.sK),C.\u0275\u0275inject(Z.q))},x.\u0275prov=C.\u0275\u0275defineInjectable({token:x,factory:x.\u0275fac,providedIn:"root"}),function(I,e,i,r){var y,c=arguments.length,p=c<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)p=Reflect.decorate(I,e,i,r);else for(var D=I.length-1;D>=0;D--)(y=I[D])&&(p=(c<3?y(p):c>3?y(e,i,p):y(e,i))||p);c>3&&p&&Object.defineProperty(e,i,p)}([(0,U.q)()],x.prototype,"getTask",null)},62416:(V,L,d)=>{d.d(L,{t:()=>b});var _=d(15439),f=d(94650);let b=(()=>{class a{transform(o,n){return o?_(o,"HH:mm").subtract(-_().utcOffset(),"m").format("HH:mm"):""}transformAMPM(o,n){return o?_(o,"HH:mm").subtract(-_().utcOffset(),"m").format("HH:mm"):""}transformDate(o,n){if(o&&n)return _(o+n,"DD/MM/YYYYHH:mm").subtract(-_().utcOffset(),"m").format("DD/MM/YYYY")}transformDateInDateFormat(o,n){if(o&&n)return _(o+n,"DD/MM/YYYYHH:mm").subtract(-_().utcOffset(),"m")}fixDateFormat(o){if(o&&o.includes("-")){const n=o.split("-");o=`${n[2]}/${n[1]}/${n[0]}`}return o}fixDateFormatUtc(o){if(o&&o.includes("-")){const n=o.split("-");o=`${n[2].split("T")[0]}/${n[1]}/${n[0]}`}return o}fixTimeFormat(o){return o&&!o.includes(":")&&(o="00:00"),o}transformDateToJavascriptDate(o,n){if(o=this.fixDateFormat(o),n=this.fixTimeFormat(n),o&&n)return _(o+n,"DD/MM/YYYYHH:mm").subtract(-_().utcOffset(),"m").toDate()}transformDateToStringFormat(o,n){if(o&&n)return _(o+n,"DD/MM/YYYYHH:mm").subtract(-_().utcOffset(),"m").format("MMM DD, YYYY")}}return a.\u0275fac=function(o){return new(o||a)},a.\u0275pipe=f.\u0275\u0275definePipe({name:"parseUtcToLocal",type:a,pure:!0}),a})()},22055:(V,L,d)=>{d.d(L,{E:()=>W});var _=d(24006),U=d(65938),f=d(62416),b=d(68745),a=d(17489),o=d(35226),n=d.n(o),h=d(92340),t=d(94650),F=d(89383),E=d(87791),P=d(80484),C=d(84075),G=d(36746),N=d(52688),B=d(36895),K=d(73555),w=d(4859),j=d(97392),Y=d(39349),H=d(59549),Z=d(284),J=d(51572),x=d(90455),I=d(30277),e=d(24784);const i=function(g){return{"text-slider-color":g}};function r(g,O){if(1&g&&(t.\u0275\u0275elementContainerStart(0),t.\u0275\u0275elementStart(1,"div",7)(2,"div",13)(3,"div",22)(4,"mat-slide-toggle",23)(5,"span",24),t.\u0275\u0275text(6),t.\u0275\u0275pipe(7,"translate"),t.\u0275\u0275elementEnd()()()()(),t.\u0275\u0275elementContainerEnd()),2&g){const s=t.\u0275\u0275nextContext();t.\u0275\u0275advance(5),t.\u0275\u0275property("ngClass",t.\u0275\u0275pureFunction1(4,i,s.manualTaskForm.get("pending_slider").value)),t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(7,2,s.manualTaskForm.get("pending_slider").value?"Achieved":"Pending")," ")}}function c(g,O){if(1&g){const s=t.\u0275\u0275getCurrentView();t.\u0275\u0275elementContainerStart(0),t.\u0275\u0275elementStart(1,"button",35),t.\u0275\u0275listener("click",function(){t.\u0275\u0275restoreView(s),t.\u0275\u0275nextContext();const T=t.\u0275\u0275reference(13);return t.\u0275\u0275resetView(T.click())}),t.\u0275\u0275elementStart(2,"mat-icon",36),t.\u0275\u0275text(3,"edit"),t.\u0275\u0275elementEnd(),t.\u0275\u0275text(4),t.\u0275\u0275pipe(5,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementContainerEnd()}2&g&&(t.\u0275\u0275advance(4),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(5,1,"Modify")," "))}function p(g,O){if(1&g){const s=t.\u0275\u0275getCurrentView();t.\u0275\u0275elementContainerStart(0),t.\u0275\u0275elementStart(1,"button",35),t.\u0275\u0275listener("click",function(){t.\u0275\u0275restoreView(s),t.\u0275\u0275nextContext();const T=t.\u0275\u0275reference(13);return t.\u0275\u0275resetView(T.click())}),t.\u0275\u0275elementStart(2,"mat-icon",37),t.\u0275\u0275text(3,"add"),t.\u0275\u0275elementEnd(),t.\u0275\u0275text(4),t.\u0275\u0275pipe(5,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementContainerEnd()}2&g&&(t.\u0275\u0275advance(4),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(5,1,"ACAD_KIT.DOC.File")," "))}const y=function(g){return{"green-icon":g}};function D(g,O){if(1&g){const s=t.\u0275\u0275getCurrentView();t.\u0275\u0275elementStart(0,"div",27),t.\u0275\u0275element(1,"div",28),t.\u0275\u0275elementStart(2,"div",29)(3,"span"),t.\u0275\u0275text(4),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(5,"div",30)(6,"button",31),t.\u0275\u0275listener("click",function(){const v=t.\u0275\u0275restoreView(s).$implicit,S=t.\u0275\u0275nextContext(2);let m;return t.\u0275\u0275resetView(S.downloadDoc(null==v||null==(m=v.get("document_id"))?null:m.value))}),t.\u0275\u0275elementStart(7,"mat-icon",24),t.\u0275\u0275text(8,"insert_drive_file"),t.\u0275\u0275elementEnd()()(),t.\u0275\u0275elementStart(9,"div",32),t.\u0275\u0275template(10,c,6,3,"ng-container",12),t.\u0275\u0275template(11,p,6,3,"ng-container",12),t.\u0275\u0275elementStart(12,"input",33,34),t.\u0275\u0275listener("change",function(T){const S=t.\u0275\u0275restoreView(s).index,m=t.\u0275\u0275nextContext(2);return t.\u0275\u0275resetView(m.chooseFile(T,S))}),t.\u0275\u0275elementEnd()()()}if(2&g){const s=O.$implicit;t.\u0275\u0275property("formGroupName",O.index),t.\u0275\u0275advance(4),t.\u0275\u0275textInterpolate(s.get("name").value),t.\u0275\u0275advance(3),t.\u0275\u0275property("ngClass",t.\u0275\u0275pureFunction1(5,y,s.get("document_id").value)),t.\u0275\u0275advance(3),t.\u0275\u0275property("ngIf",s.get("document_id").value),t.\u0275\u0275advance(1),t.\u0275\u0275property("ngIf",!s.get("document_id").value)}}function k(g,O){if(1&g&&(t.\u0275\u0275elementContainerStart(0),t.\u0275\u0275elementStart(1,"div",7)(2,"div",8)(3,"div",9)(4,"b"),t.\u0275\u0275text(5),t.\u0275\u0275pipe(6,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(7,"div",10)(8,"b"),t.\u0275\u0275text(9,":"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275element(10,"div",11),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(11,"div",25),t.\u0275\u0275template(12,D,14,7,"div",26),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementContainerEnd()),2&g){const s=t.\u0275\u0275nextContext();t.\u0275\u0275advance(5),t.\u0275\u0275textInterpolate1("",t.\u0275\u0275pipeBind1(6,2,"Document to upload")," "),t.\u0275\u0275advance(7),t.\u0275\u0275property("ngForOf",s.getDocExpectedArray().controls)}}function M(g,O){1&g&&(t.\u0275\u0275elementStart(0,"div",38),t.\u0275\u0275element(1,"mat-progress-spinner",39),t.\u0275\u0275elementEnd())}let W=(()=>{class g{constructor(s,l,T,v,S,m,$,R,A,Q){this.data=s,this.dialogRef=l,this.fb=T,this.parseUTCtoLocal=v,this.translate=S,this.taskService=m,this.fileUploadService=$,this.utilService=R,this.acadKitService=A,this.authService=Q,this.subs=new b.Y,this.isPendingAchieved=!1,this.isWaitingForResponse=!1}ngOnInit(){this.initForm(),this.populateForm()}initForm(){this.manualTaskForm=this.fb.group({pending_slider:[!1],action_taken:[""],rncp:[""],created_by:["",_.Validators.required],document_expecteds:this.fb.array([])})}initDocumentExpected(){return this.fb.group({name:[""],document_id:["",[_.Validators.required]]})}getDocExpectedArray(){return this.manualTaskForm.get("document_expecteds")}populateForm(){const s=a.cloneDeep(this.data.taskData);s&&s.rncp&&s.rncp._id&&(s.rncp=s.rncp._id),s&&s.created_by&&s.created_by._id&&(s.created_by=s.created_by._id),s&&s.document_expecteds&&s.document_expecteds.length&&s.document_expecteds.forEach(l=>{this.getDocExpectedArray().push(this.initDocumentExpected())}),this.manualTaskForm.patchValue(s)}getTranslatedDate(s){return s&&s.date&&s.time?this.parseUTCtoLocal.transformDateToStringFormat(s.date,s.time):""}getAssignedUser(s){return s&&s.first_name&&s.last_name?s.first_name+" "+s.last_name:""}chooseFile(s,l){const v=s.target.files[0],S=this.utilService.getFileExtension(v.name).toLocaleLowerCase();["pdf","doc","docx","ppt","pptx","xls"].includes(S)?(this.isWaitingForResponse=!0,this.subs.sink=this.fileUploadService.singleUpload(v).subscribe(m=>{this.isWaitingForResponse=!1,m&&this.createAcadDoc(m,l)},m=>{this.authService.postErrorLog(m),this.isWaitingForResponse=!1,n().fire({type:"info",title:"Error !",text:m&&m.message?this.translate.instant(m.message.replaceAll("GraphQL error: ","")):m,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")}).then($=>{console.log("[BE Message] Error is : ",m)})})):n().fire({type:"info",title:this.translate.instant("UPLOAD_ERROR.WRONG_TYPE_TITLE"),text:this.translate.instant("UPLOAD_ERROR.WRONG_TYPE_TEXT",{file_exts:".jpg, .jpeg, .png, .pdf"}),allowEscapeKey:!1,allowOutsideClick:!1,allowEnterKey:!1})}createAcadDoc(s,l){const T={document_name:this.getDocExpectedArray().at(l).get("name").value,type_of_document:"documentExpected",document_generation_type:"documentExpected",s3_file_name:s.s3_file_name,task_id:this.data.taskData._id,parent_rncp_title:this.data.taskData.rncp._id};this.isWaitingForResponse=!0,this.subs.sink=this.acadKitService.createAcadDoc(T).subscribe(v=>{this.isWaitingForResponse=!1,this.getDocExpectedArray().at(l).get("document_id").patchValue(v._id)},v=>{this.authService.postErrorLog(v),this.isWaitingForResponse=!1,n().fire({type:"info",title:this.translate.instant("SORRY"),text:v&&v.message?this.translate.instant(v.message.replaceAll("GraphQL error: ","")):v,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})})}createPayload(){const s=this.manualTaskForm.value;return this.getDocExpectedArray()&&this.getDocExpectedArray().length?(this.isPendingAchieved=!0,delete s.pending_slider,s):(this.isPendingAchieved=s.pending_slider,delete s.pending_slider,s)}submitManualTask(){const s=this.createPayload();this.isWaitingForResponse=!0,this.subs.sink=this.taskService.updateManualTask(this.data.taskData._id,s).subscribe(l=>{this.isWaitingForResponse=!1,this.isPendingAchieved?this.getDocExpectedArray()&&this.getDocExpectedArray().length?this.addDocToZeroSix():this.markTaskAsDone():l&&this.swalSuccess()},l=>{this.authService.postErrorLog(l),this.isWaitingForResponse=!1,n().fire({type:"info",title:this.translate.instant("SORRY"),text:l&&l.message?this.translate.instant(l.message.replaceAll("GraphQL error: ","")):l,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})})}addDocToZeroSix(){let s="",l="",T=this.data&&this.data.taskData&&this.data.taskData.rncp&&this.data.taskData.rncp._id?this.data.taskData.rncp._id:"";this.data&&this.data.taskData&&this.data.taskData.school&&this.data.taskData.school._id?l=this.data.taskData.school._id:s=this.data&&this.data.taskData&&this.data.taskData.user_selection&&this.data.taskData.user_selection.user_id&&this.data.taskData.user_selection.user_id._id?this.data.taskData.user_selection.user_id._id:"";const v=this.getDocExpectedArray().value,S=[];v&&v.length&&v.forEach(m=>{m&&m.document_id&&S.push(m.document_id)}),l?(this.isWaitingForResponse=!0,this.subs.sink=this.acadKitService.AddDocumentToAcadKitZeroSixManualTask(l,S,T).subscribe(m=>{this.isWaitingForResponse=!1,m&&this.markTaskAsDone()},m=>{this.authService.postErrorLog(m),this.isWaitingForResponse=!1,n().fire({type:"info",title:this.translate.instant("SORRY"),text:m&&m.message?this.translate.instant(m.message.replaceAll("GraphQL error: ","")):m,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})})):s?this.subs.sink=this.authService.getUserById(s).subscribe(m=>{if(m&&m.entities&&m.entities.length){const $=m.entities.find(R=>R&&R.assigned_rncp_title&&R.assigned_rncp_title._id===T);if($&&$.school&&$.school._id){const R=$.school._id;this.isWaitingForResponse=!0,this.subs.sink=this.acadKitService.AddDocumentToAcadKitZeroSixManualTask(R,S,T).subscribe(A=>{this.isWaitingForResponse=!1,A&&this.markTaskAsDone()},A=>{this.authService.postErrorLog(A),this.isWaitingForResponse=!1,n().fire({type:"info",title:this.translate.instant("SORRY"),text:A&&A.message?this.translate.instant(A.message.replaceAll("GraphQL error: ","")):A,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})})}}else this.markTaskAsDone()},m=>{this.authService.postErrorLog(m),this.isWaitingForResponse=!1,n().fire({type:"info",title:this.translate.instant("SORRY"),text:m&&m.message?this.translate.instant(m.message.replaceAll("GraphQL error: ","")):m,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})}):this.markTaskAsDone()}markTaskAsDone(){this.isWaitingForResponse=!0,this.subs.sink=this.taskService.doneManualTask(this.data.taskData._id).subscribe(s=>{this.isWaitingForResponse=!1,s&&this.swalSuccess()},s=>{this.authService.postErrorLog(s),this.isWaitingForResponse=!1,n().fire({type:"info",title:this.translate.instant("SORRY"),text:s&&s.message?this.translate.instant(s.message.replaceAll("GraphQL error: ","")):s,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})})}swalSuccess(){this.isWaitingForResponse=!1,n().fire({type:"success",title:"Bravo"}).then(s=>{this.closeDialog()})}closeDialog(){this.dialogRef.close()}downloadDoc(s){s&&(this.subs.sink=this.acadKitService.getOneDoc(s).subscribe(l=>{if(l&&l.s3_file_name){const T=l.s3_file_name,v=document.createElement("a");v.target="_blank",v.href=`${h.N.apiUrl}/fileuploads/${T}?download=true`.replace("/graphql",""),v.click(),v.remove()}},l=>{this.authService.postErrorLog(l),n().fire({type:"info",title:this.translate.instant("SORRY"),text:l&&l.message?this.translate.instant(l.message.replaceAll("GraphQL error: ","")):l,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})}))}ngOnDestroy(){this.subs.unsubscribe()}}return g.\u0275fac=function(s){return new(s||g)(t.\u0275\u0275directiveInject(U.WI),t.\u0275\u0275directiveInject(U.so),t.\u0275\u0275directiveInject(_.UntypedFormBuilder),t.\u0275\u0275directiveInject(f.t),t.\u0275\u0275directiveInject(F.sK),t.\u0275\u0275directiveInject(E.M),t.\u0275\u0275directiveInject(P.J),t.\u0275\u0275directiveInject(C.t),t.\u0275\u0275directiveInject(G.P),t.\u0275\u0275directiveInject(N.e))},g.\u0275cmp=t.\u0275\u0275defineComponent({type:g,selectors:[["ms-manual-task-dialog"]],features:[t.\u0275\u0275ProvidersFeature([f.t])],decls:75,vars:31,consts:[["cdkDrag","","cdkDragRootElement",".cdk-overlay-pane","cdkDragHandle","",1,"header-div"],["svgIcon","tick-checkbox",2,"margin-bottom","5px"],[1,"header-text"],["mat-icon-button","","type","button",1,"header-icon",3,"click"],[1,"header-form",3,"formGroup"],["fxLayout","row"],["fxFlex","","fxLayout","column"],["fxFlex",""],["fxLayout","row wrap","fxLayoutAlign","start start"],["fxFlex","35"],["fxFlex","5"],["fxFlex","60"],[4,"ngIf"],["fxLayout","row wrap","fxLayoutAlign","center start"],["fxFlex","100"],["color","accent",1,"full-width"],["matInput","","cdkTextareaAutosize","","cdkAutosizeMinRows","3","formControlName","action_taken",3,"placeholder"],["autosize","cdkTextareaAutosize"],["fxLayout","row","fxLayoutAlign","end center",1,"footer-form"],["mat-raised-button","","color","warn","type","button",3,"click"],["mat-raised-button","","color","primary","type","button",3,"disabled","click"],["class","loading-indicator",4,"ngIf"],["fxFlex","100",2,"text-align","center","margin-top","10px"],["color","accent","formControlName","pending_slider"],[3,"ngClass"],["fxFlex","","formArrayName","document_expecteds"],["fxLayout","row wrap","fxLayoutAlign","start start","style","margin-top: 10px;",3,"formGroupName",4,"ngFor","ngForOf"],["fxLayout","row wrap","fxLayoutAlign","start start",2,"margin-top","10px",3,"formGroupName"],["fxFlex","10"],["fxFlex","50"],["fxFlex","20",2,"text-align","end"],["mat-icon-button","",3,"click"],["fxFlex","20"],["type","file","accept",".pdf, .doc, .docx, .ppt, .pptx, .xls",1,"hidden",3,"change"],["fileUploadDoc",""],["mat-raised-button","","color","accent",2,"margin-right","10px",3,"click"],["svgIcon","pencil"],[1,"baseline-middle"],[1,"loading-indicator"],["mode","indeterminate","color","accent"]],template:function(s,l){1&s&&(t.\u0275\u0275elementStart(0,"div",0),t.\u0275\u0275element(1,"mat-icon",1),t.\u0275\u0275elementStart(2,"h2",2),t.\u0275\u0275text(3),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(4,"button",3),t.\u0275\u0275listener("click",function(){return l.closeDialog()}),t.\u0275\u0275elementStart(5,"mat-icon"),t.\u0275\u0275text(6,"close"),t.\u0275\u0275elementEnd()()(),t.\u0275\u0275element(7,"hr"),t.\u0275\u0275elementStart(8,"form",4)(9,"div",5)(10,"div",6)(11,"div",7)(12,"div",8)(13,"div",9)(14,"b"),t.\u0275\u0275text(15),t.\u0275\u0275pipe(16,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(17,"div",10)(18,"b"),t.\u0275\u0275text(19,":"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(20,"div",11),t.\u0275\u0275text(21),t.\u0275\u0275elementEnd()()(),t.\u0275\u0275elementStart(22,"div",7)(23,"div",8)(24,"div",9)(25,"b"),t.\u0275\u0275text(26),t.\u0275\u0275pipe(27,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(28,"div",10)(29,"b"),t.\u0275\u0275text(30,":"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(31,"div",11),t.\u0275\u0275text(32),t.\u0275\u0275elementEnd()()(),t.\u0275\u0275elementStart(33,"div",7)(34,"div",8)(35,"div",9)(36,"b"),t.\u0275\u0275text(37),t.\u0275\u0275pipe(38,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(39,"div",10)(40,"b"),t.\u0275\u0275text(41,":"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(42,"div",11),t.\u0275\u0275text(43),t.\u0275\u0275elementEnd()()(),t.\u0275\u0275elementStart(44,"div",7)(45,"div",8)(46,"div",9)(47,"b"),t.\u0275\u0275text(48),t.\u0275\u0275pipe(49,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(50,"div",10)(51,"b"),t.\u0275\u0275text(52,":"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(53,"div",11),t.\u0275\u0275text(54),t.\u0275\u0275elementEnd()()(),t.\u0275\u0275template(55,r,8,6,"ng-container",12),t.\u0275\u0275template(56,k,13,4,"ng-container",12),t.\u0275\u0275elementStart(57,"div",7)(58,"div",13)(59,"div",14)(60,"mat-form-field",15)(61,"textarea",16,17),t.\u0275\u0275pipe(63,"translate"),t.\u0275\u0275text(64,"              "),t.\u0275\u0275elementEnd()()()()()()()(),t.\u0275\u0275elementStart(65,"div",18)(66,"div")(67,"button",19),t.\u0275\u0275listener("click",function(){return l.closeDialog()}),t.\u0275\u0275text(68),t.\u0275\u0275pipe(69,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(70,"div")(71,"button",20),t.\u0275\u0275listener("click",function(){return l.submitManualTask()}),t.\u0275\u0275text(72),t.\u0275\u0275pipe(73,"translate"),t.\u0275\u0275elementEnd()()(),t.\u0275\u0275template(74,M,2,0,"div",21)),2&s&&(t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate1(" ",null==l.data||null==l.data.taskData?null:l.data.taskData.description," "),t.\u0275\u0275advance(5),t.\u0275\u0275property("formGroup",l.manualTaskForm),t.\u0275\u0275advance(7),t.\u0275\u0275textInterpolate1("",t.\u0275\u0275pipeBind1(16,17,"Due Date")," "),t.\u0275\u0275advance(6),t.\u0275\u0275textInterpolate1(" ",l.getTranslatedDate(null==l.data||null==l.data.taskData?null:l.data.taskData.due_date)," "),t.\u0275\u0275advance(5),t.\u0275\u0275textInterpolate1("",t.\u0275\u0275pipeBind1(27,19,"Assigned To")," "),t.\u0275\u0275advance(6),t.\u0275\u0275textInterpolate1(" ",l.getAssignedUser(null==l.data||null==l.data.taskData||null==l.data.taskData.user_selection?null:l.data.taskData.user_selection.user_id)," "),t.\u0275\u0275advance(5),t.\u0275\u0275textInterpolate1("",t.\u0275\u0275pipeBind1(38,21,"Task")," "),t.\u0275\u0275advance(6),t.\u0275\u0275textInterpolate1(" ",null==l.data||null==l.data.taskData?null:l.data.taskData.description," "),t.\u0275\u0275advance(5),t.\u0275\u0275textInterpolate1("",t.\u0275\u0275pipeBind1(49,23,"Priority")," "),t.\u0275\u0275advance(6),t.\u0275\u0275textInterpolate1(" ",null==l.data||null==l.data.taskData?null:l.data.taskData.priority," "),t.\u0275\u0275advance(1),t.\u0275\u0275property("ngIf",!(null!=l.data&&null!=l.data.taskData&&null!=l.data.taskData.document_expecteds&&l.data.taskData.document_expecteds.length)),t.\u0275\u0275advance(1),t.\u0275\u0275property("ngIf",null==l.data||null==l.data.taskData||null==l.data.taskData.document_expecteds?null:l.data.taskData.document_expecteds.length),t.\u0275\u0275advance(5),t.\u0275\u0275propertyInterpolate("placeholder",t.\u0275\u0275pipeBind1(63,25,"Action Taken")),t.\u0275\u0275advance(7),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(69,27,"ASSIGN_CORRECTOR_DIALOG.CANCEL")," "),t.\u0275\u0275advance(3),t.\u0275\u0275property("disabled",!l.manualTaskForm.valid),t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(73,29,"ASSIGN_CORRECTOR_DIALOG.SUBMIT")," "),t.\u0275\u0275advance(2),t.\u0275\u0275property("ngIf",l.isWaitingForResponse))},dependencies:[B.mk,B.sg,B.O5,K.Zt,K.Bh,w.lW,j.Hw,Y.IC,H.KE,Z.Nt,J.Ou,x.Rr,_.\u0275NgNoValidate,_.DefaultValueAccessor,_.NgControlStatus,_.NgControlStatusGroup,_.FormGroupDirective,_.FormControlName,_.FormGroupName,_.FormArrayName,I.xw,I.Wh,I.yH,e.oO,F.X$],styles:[".header-form[_ngcontent-%COMP%]{padding:18px}.footer-form[_ngcontent-%COMP%]{padding:0 18px 18px}.green-color[_ngcontent-%COMP%]{color:green}"]}),g})()}}]);