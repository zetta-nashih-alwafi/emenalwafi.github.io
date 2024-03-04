"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[9431],{18404:(v,f,n)=>{n.d(f,{Q:()=>S});var r=n(65938),l=n(68745),p=n(35226),C=n.n(p),t=n(94650),P=n(61294),y=n(52688),d=n(89383),h=n(11481),a=n(36895),i=n(4859),c=n(97392),_=n(10266),m=n(24006),M=n(24784);function E(o,u){if(1&o&&(t.\u0275\u0275elementStart(0,"span"),t.\u0275\u0275text(1),t.\u0275\u0275pipe(2,"translate"),t.\u0275\u0275elementEnd()),2&o){const e=t.\u0275\u0275nextContext(3);t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate2("",t.\u0275\u0275pipeBind1(2,2,null==e.dataMessage?null:e.dataMessage.second_button)," (",e.count," s)")}}function b(o,u){if(1&o&&(t.\u0275\u0275elementStart(0,"span"),t.\u0275\u0275text(1),t.\u0275\u0275pipe(2,"translate"),t.\u0275\u0275elementEnd()),2&o){const e=t.\u0275\u0275nextContext(3);t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(2,1,null==e.dataMessage?null:e.dataMessage.second_button))}}const O=function(o){return{disabledd:o}};function D(o,u){if(1&o){const e=t.\u0275\u0275getCurrentView();t.\u0275\u0275elementStart(0,"mat-dialog-actions",9)(1,"div",10)(2,"button",11),t.\u0275\u0275listener("click",function(){t.\u0275\u0275restoreView(e);const g=t.\u0275\u0275nextContext(2);return t.\u0275\u0275resetView(g.closeDialog())}),t.\u0275\u0275element(3,"mat-icon",12),t.\u0275\u0275text(4),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(5,"button",13),t.\u0275\u0275listener("click",function(){t.\u0275\u0275restoreView(e);const g=t.\u0275\u0275nextContext(2);return t.\u0275\u0275resetView(g.confirmValidation(!0))}),t.\u0275\u0275template(6,E,3,4,"span",14),t.\u0275\u0275template(7,b,3,3,"span",14),t.\u0275\u0275elementStart(8,"mat-icon",15),t.\u0275\u0275text(9,"touch_app"),t.\u0275\u0275elementEnd()()()()}if(2&o){const e=t.\u0275\u0275nextContext(2);t.\u0275\u0275advance(2),t.\u0275\u0275propertyInterpolate("matTooltip",null==e.dataMessage?null:e.dataMessage.first_button),t.\u0275\u0275advance(2),t.\u0275\u0275textInterpolate1(" ",null==e.dataMessage?null:e.dataMessage.first_button," "),t.\u0275\u0275advance(1),t.\u0275\u0275propertyInterpolate("matTooltip",null==e.dataMessage?null:e.dataMessage.second_button),t.\u0275\u0275property("ngClass",t.\u0275\u0275pureFunction1(7,O,0!==e.count))("disabled",0!==e.count),t.\u0275\u0275advance(1),t.\u0275\u0275property("ngIf",0!==e.count),t.\u0275\u0275advance(1),t.\u0275\u0275property("ngIf",0===e.count)}}function I(o,u){if(1&o&&(t.\u0275\u0275elementStart(0,"div",1)(1,"form",2)(2,"div")(3,"mat-dialog-content",3)(4,"div",4)(5,"div",5),t.\u0275\u0275element(6,"b",6),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(7,"div",7)(8,"div",5),t.\u0275\u0275element(9,"b",6),t.\u0275\u0275elementEnd()(),t.\u0275\u0275element(10,"br"),t.\u0275\u0275elementEnd(),t.\u0275\u0275template(11,D,10,9,"mat-dialog-actions",8),t.\u0275\u0275elementEnd()()()),2&o){const e=t.\u0275\u0275nextContext();t.\u0275\u0275advance(6),t.\u0275\u0275property("innerHTML",null==e.dataMessage?null:e.dataMessage.subject,t.\u0275\u0275sanitizeHtml),t.\u0275\u0275advance(3),t.\u0275\u0275property("innerHTML",e.bodyMessage,t.\u0275\u0275sanitizeHtml),t.\u0275\u0275advance(2),t.\u0275\u0275property("ngIf",e.dataMessage)}}let S=(()=>{class o{constructor(e,s,g,A,x,F){this.dialogRef=e,this.formBuilderService=s,this.userService=g,this.translate=A,this.sanitizer=x,this.data=F,this.subs=new l.Y,this.isWaitingForResponse=!1,this.dataMessage=null,this.isVideoLink=!1,this.generateVideo=!0,this.candidateSchool=[],this.buttonDisabled=!0,this.time=125,this.countdownHabis=!1,this.count=5,this.timeout=setInterval(()=>{this.count>0?this.count-=1:clearInterval(this.timeout)},1e3)}ngOnInit(){this.GenerateStepMessage(),this.currentUser=this.userService.getLocalStorageUser()}GenerateStepMessage(){this.subs.sink=this.formBuilderService.GenerateStepMessage(this.data.stepId,this.data.student_admission_process_id?this.data.student_admission_process_id:null,this.data.isPreview).subscribe(s=>{s?(this.dataMessage=s,this.bodyMessage=this.sanitizer.bypassSecurityTrustHtml(this.dataMessage?.body)):this.closeEmpty()},s=>{this.userService.postErrorLog(s),C().fire({type:"info",title:this.translate.instant("SORRY"),text:s&&s.message?this.translate.instant(s.message.replaceAll("GraphQL error: ","")):s,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})})}confirmValidation(e){this.dialogRef.close({type:"accept"})}closeDialog(){this.dialogRef.close({type:"cancel"})}closeEmpty(){this.dialogRef.close({type:"empty"})}ngOnDestroy(){this.subs.unsubscribe()}}return o.\u0275fac=function(e){return new(e||o)(t.\u0275\u0275directiveInject(r.so),t.\u0275\u0275directiveInject(P.c),t.\u0275\u0275directiveInject(y.e),t.\u0275\u0275directiveInject(d.sK),t.\u0275\u0275directiveInject(h.H7),t.\u0275\u0275directiveInject(r.WI))},o.\u0275cmp=t.\u0275\u0275defineComponent({type:o,selectors:[["ms-step-message-process"]],decls:1,vars:1,consts:[["class","background-dark",4,"ngIf"],[1,"background-dark"],[1,"header-form"],[1,"content-height"],[1,"p-grid"],[1,"p-col-12","text-center"],[2,"font-size","18px",3,"innerHTML"],[1,"p-grid",2,"max-height","78vh"],["align","center","class","align-button",4,"ngIf"],["align","center",1,"align-button"],[1,"flex-button"],["mat-raised-button","","matTooltipPosition","above",1,"background-grey",2,"padding-left","5px","padding-right","8px",3,"matTooltip","click"],["svgIcon","backup-restore",1,"icon-style-go-back"],["mat-raised-button","","color","accent",1,"btn-opssi",2,"padding-left","5px","padding-right","8px",3,"matTooltip","ngClass","disabled","click"],[4,"ngIf"],[1,"mat-icon-default"]],template:function(e,s){1&e&&t.\u0275\u0275template(0,I,12,3,"div",0),2&e&&t.\u0275\u0275property("ngIf",s.dataMessage)},dependencies:[a.mk,a.O5,i.lW,r.xY,r.H8,c.Hw,_.gM,m.\u0275NgNoValidate,m.NgControlStatusGroup,m.NgForm,M.oO,d.X$],styles:["[_nghost-%COMP%]  .mat-radio-outer-circle{border-color:#3f3f3f}[_nghost-%COMP%]  .mat-form-field-underline{background-color:#0000001f!important}.header-form[_ngcontent-%COMP%]{padding:18px}.footer-form[_ngcontent-%COMP%]{padding:0 18px 18px}.no-margin[_ngcontent-%COMP%]{margin:0!important}.disabledd[_ngcontent-%COMP%]{background-color:#565656!important;color:#ababab!important}.no-padding[_ngcontent-%COMP%]{padding:0!important}.no-padding-y[_ngcontent-%COMP%]{padding-top:0!important;padding-bottom:0!important}.no-padding-b[_ngcontent-%COMP%], .no-padding-t[_ngcontent-%COMP%]{padding-bottom:0!important}.float-left[_ngcontent-%COMP%]{float:left}.align-button[_ngcontent-%COMP%]{text-align:center!important}[_nghost-%COMP%]     .mat-dialog-content{margin:0!important;padding:0!important;max-height:unset}.step-validation[_ngcontent-%COMP%]{max-height:390px}.background-dark[_ngcontent-%COMP%]{background-color:#3f3f3f;color:#fff}.background-grey[_ngcontent-%COMP%]{background-color:#78909c;color:#fff}.background-white[_ngcontent-%COMP%]{background-color:#fff;color:#000}.color-dark[_ngcontent-%COMP%]{color:#3f3f3f!important}.flex-button[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center}.icon-style-go-back[_ngcontent-%COMP%]{vertical-align:middle;display:inline-block;margin-bottom:.7rem!important;padding-right:1px}"]}),o})()},55605:(v,f,n)=>{n.d(f,{U:()=>y});var r=n(13125),l=n(24850),p=n(94650),C=n(80529),t=n(18497),P=n(89383);let y=(()=>{class d{constructor(a,i,c){this.httpClient=a,this.apollo=i,this.translate=c}getAllFCContractStudentTable(a,i,c){return this.apollo.query({query:r.ZP`
        query GetAllFCContractProcesses($userTypeId: ID, $pagination: PaginationInput) {
          GetAllFCContractProcesses(${a}, user_type_id: $userTypeId, pagination: $pagination) {
            _id
            candidate_id {
              _id
              civility
              first_name
              last_name
              candidate_unique_number
              email
              school_mail
              candidate_admission_status
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
              intake_channel {
                _id
                program
              }
            }
            contract_validator_signatory_status {
              user_id {
                civility
                first_name
                last_name
              }
              is_already_sign
            }
            form_builder_id {
              _id
              form_builder_name
            }
            admission_financement_id {
              _id
              organization_name
              organization_id{
                _id
                organization_type
              }
            }
            start_date {
              date
              time
            }
            end_date {
              date
              time
            }
            contract_manager {
              _id
              civility
              first_name
              last_name
            }
            send_date {
              date
              time
            }
            financer
            contract_status
            count_document
            form_builder_pdf_s3_file_name
            admission_financement_ids {
              _id
              organization_id {
                _id
                organization_type
              }
              company_branch_id {
                _id
              }
            }
          }
        }
        `,fetchPolicy:"network-only",variables:{user_type_id:i,pagination:c}}).pipe((0,l.U)(_=>_.data.GetAllFCContractProcesses))}getAllFCContractCheckbox(a,i){return this.apollo.query({query:r.ZP`
          query GetAllFCContractProcesses($user_type_id: ID, $pagination: PaginationInput) {
            GetAllFCContractProcesses(user_type_id: $user_type_id, pagination: $pagination) {
              _id
              candidate_id {
                _id
                civility
                first_name
                last_name
                candidate_unique_number
                intake_channel {
                  _id
                  program
                }
              }
              form_builder_id {
                _id
                form_builder_name
              }
              admission_financement_id {
                _id
                organization_name
                organization_type
              }
              start_date {
                date
                time
              }
              end_date {
                date
                time
              }
              contract_manager {
                _id
                civility
                first_name
                last_name
              }
              contract_status
              count_document
            }
          }
        `,fetchPolicy:"network-only",variables:{user_type_id:a,pagination:i}}).pipe((0,l.U)(c=>c.data.GetAllFCContractProcesses))}getAllCandidates(a,i,c){return this.apollo.query({query:r.ZP`
          query GetAllCandidates($user_type_ids: [ID], $filter: CandidateFilterInput, $pagination: PaginationInput) {
            GetAllCandidates(user_type_ids: $user_type_ids, filter: $filter, pagination: $pagination) {
              _id
              civility
              first_name
              last_name
              user_id {
                _id
              }
              continuous_formation_manager_id {
                _id
              }
              admission_member_id {
                _id
              }
            }
          }
        `,fetchPolicy:"network-only",variables:{user_type_ids:a,filter:i,pagination:c}}).pipe((0,l.U)(_=>_.data.GetAllCandidates))}deleteFcContractProcess(a){return this.apollo.mutate({mutation:r.ZP`
          mutation DeleteFcContractProcess{
            DeleteFcContractProcess(_id: "${a}") {
              _id
            }
          }
        `}).pipe((0,l.U)(i=>i.data.DeleteFcContractProcess))}createFcContractProcess(a){return this.apollo.mutate({mutation:r.ZP`
          mutation CreateFcContractProcess($fc_contract_process_input: FcContractProcessInput) {
            CreateFcContractProcess(fc_contract_process_input: $fc_contract_process_input) {
              _id
              candidate_id {
                _id
              }
            }
          }
        `,variables:{fc_contract_process_input:a}}).pipe((0,l.U)(i=>i.data.CreateFcContractProcess))}sendFCContractProcess(a,i,c,_,m){return this.apollo.mutate({mutation:r.ZP`
          mutation SendFCContractProcess(
            $contract_manager_id: ID
            $candidate_id: ID
            $form_builder_id: ID
            $user_type_id: ID
            $contract_validator_signatory_status: [ContractProcessContractValidatorSignatoryStatusInput]
          ) {
            SendFCContractProcess(
              contract_manager_id: $contract_manager_id
              candidate_id: $candidate_id
              form_builder_id: $form_builder_id
              user_type_id: $user_type_id
              contract_validator_signatory_status: $contract_validator_signatory_status
            ) {
              _id
              candidate_id {
                _id
              }
            }
          }
        `,variables:{contract_manager_id:a,candidate_id:i,form_builder_id:c,user_type_id:_,contract_validator_signatory_status:m}}).pipe((0,l.U)(M=>M.data.SendFCContractProcess))}getAllContractManagerDropdown(){return this.apollo.query({query:r.ZP`
          query GetAllUsers{
            GetAllUsers(user_type: ["6209f2dc74890f0ecad16670"]) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllUsers))}getAllFCContractManagerDropdown(){return this.apollo.query({query:r.ZP`
          query {
            GetAllUsers(user_type: ["64a245893677852cf45c5763"]) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllUsers))}getAllFormBuildersContract(){return this.apollo.watchQuery({query:r.ZP`
          query GetAllFormBuilders {
            GetAllFormBuilders(filter: { status: true, template_type: fc_contract, hide_form: false }) {
              _id
              form_builder_name
              steps {
                contract_signatory {
                  _id
                  name
                }
                user_who_complete_step{
                  _id
                  name
                }
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllFormBuilders))}getAllSchoolFormFCContract(){return this.apollo.watchQuery({query:r.ZP`
          query GetAllSchoolFormFCContract {
            GetAllCandidateSchool {
              _id
              short_name
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllCandidateSchool))}getAllSectorFormFCContract(a){return this.apollo.watchQuery({query:r.ZP`
          query GetAllSectorFormFCContract($filter: SectorFilterInput) {
            GetAllSectors(filter: $filter) {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:a}}).valueChanges.pipe((0,l.U)(i=>i.data.GetAllSectors))}getAllSpecialityFormFCContract(a){return this.apollo.watchQuery({query:r.ZP`
          query GetAllSpecialityFormFCContract($filter: SpecializationFilterInput) {
            GetAllSpecializations(filter: $filter) {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:a}}).valueChanges.pipe((0,l.U)(i=>i.data.GetAllSpecializations))}SendEmailFcContractProcess(a,i){return this.apollo.mutate({mutation:r.ZP`
          mutation SendEmailFcContractProcess($contractProcessId: ID!, $lang: String) {
            SendEmailFcContractProcess(_id: $contractProcessId, lang: $lang) {
              _id
            }
          }
        `,variables:{contractProcessId:a,lang:i}}).pipe((0,l.U)(c=>c.data.SendEmailFcContractProcess))}}return d.\u0275fac=function(a){return new(a||d)(p.\u0275\u0275inject(C.eN),p.\u0275\u0275inject(t._M),p.\u0275\u0275inject(P.sK))},d.\u0275prov=p.\u0275\u0275defineInjectable({token:d,factory:d.\u0275fac,providedIn:"root"}),d})()}}]);