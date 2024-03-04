"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[4893],{14893:(O,C,t)=>{t.r(C),t.d(C,{MyfileModule:()=>F});var d=t(36895),r=t(610),g=t(68745),p=t(18206),v=t(35226),h=t.n(v),e=t(94650),I=t(84075),s=t(68516),o=t(58840),c=t(91013),m=t(52688),M=t(65938),D=t(84130),T=t(9035),_=t(50777),P=t(89383);function U(a,f){1&a&&(e.\u0275\u0275elementStart(0,"div",1),e.\u0275\u0275element(1,"div",2),e.\u0275\u0275elementEnd())}const A=[{path:"",pathMatch:"full",component:(()=>{class a{constructor(n,u,i,S,R,y,l,L,b,Z,W){this.route=n,this.utilService=u,this.studentService=i,this.schoolService=S,this.mailboxService=R,this.userService=y,this.dialog=l,this.permissions=L,this.certificationRuleService=b,this.rncpTitlesService=Z,this.translate=W,this.studentId="",this.schoolId="",this.titleId="",this.classId="",this.hasAcceptedCertRule=!1,this.subs=new g.Y,this.configCertificatioRule={disableClose:!0,maxWidth:"820px"},this.jobFullScreen=!1,this.studentPrevCourseData=null}ngOnInit(){const n=this.route.snapshot.queryParamMap.get("identity"),u=this.route.snapshot.queryParamMap.get("student"),i=this.route.snapshot.queryParamMap.get("title"),S=this.route.snapshot.queryParamMap.get("class"),R=this.route.snapshot.queryParamMap.get("school");"jobfullscreen"===this.route.snapshot.queryParamMap.get("type")&&(this.jobFullScreen=!0,this.titleId=i,this.classId=S,this.studentId=u,this.schoolId=R),this.studentTabSelected=n,this.userData=this.utilService.getCurrentUser(),this.subs.sink=this.studentService.getStudentId(this.userData._id).subscribe(l=>{console.log(l),l&&l.student_id&&l.student_id._id&&(l.student_id._id&&(this.studentId=l.student_id._id),l.student_id.rncp_title&&l.student_id.rncp_title._id&&(this.titleId=l.student_id.rncp_title._id,this.schoolService.setSelectedRncpTitleId(this.titleId)),l.student_id.current_class&&l.student_id.current_class._id&&(this.classId=l.student_id.current_class._id,this.schoolService.setSelectedClassId(this.classId)),this.permissions.getPermission("Student")?this.getCertificationRule():this.getUrgentMail()),this.userData&&this.userData.entities&&this.userData.entities.length&&this.userData.entities[0]&&this.userData.entities[0].type&&"Student"===this.userData.entities[0].type.name&&(this.schoolId=this.userData.entities[0].school._id)},l=>{h().fire({type:"info",title:this.translate.instant("SORRY"),text:l&&l.message?this.translate.instant(l.message.replaceAll("GraphQL error: ","")):l,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})})}getUrgentMail(){this.subs.sink=this.mailboxService.getUrgentMail().subscribe(n=>{n&&n.length&&(this.subs.sink=this.dialog.open(p.d,{disableClose:!0,width:"825px",panelClass:"certification-rule-pop-up",data:n}).afterClosed().subscribe(u=>{this.subs.sink=this.mailboxService.getUrgentMail().subscribe(i=>{i&&i.length&&(this.replyUrgentMessageDialogComponent=this.dialog.open(p.d,{disableClose:!0,width:"825px",panelClass:"certification-rule-pop-up",data:i}))},i=>{h().fire({type:"info",title:this.translate.instant("SORRY"),text:i&&i.message?this.translate.instant(i.message.replaceAll("GraphQL error: ","")):i,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})})}))},n=>{h().fire({type:"info",title:this.translate.instant("SORRY"),text:n&&n.message?this.translate.instant(n.message.replaceAll("GraphQL error: ","")):n,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})})}getCertificationRule(){const n=this.userService.getLocalStorageUser();console.log("ini data student",n);const u=n._id;this.subs.sink=this.rncpTitlesService.getRncpTitleById(this.titleId).subscribe(i=>{this.selectedRncpTitleName=i.short_name,this.selectedRncpTitleLongName=i.long_name},i=>{h().fire({type:"info",title:this.translate.instant("SORRY"),text:i&&i.message?this.translate.instant(i.message.replaceAll("GraphQL error: ","")):i,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})}),this.subs.sink=this.certificationRuleService.getCertificationRuleSentWithStudent(this.titleId,this.classId,u).subscribe(i=>{i?this.showCertificationRule(this.titleId,this.classId,"global"):this.getUrgentMail()},i=>{h().fire({type:"info",title:this.translate.instant("SORRY"),text:i&&i.message?this.translate.instant(i.message.replaceAll("GraphQL error: ","")):i,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})})}showCertificationRule(n,u,i){}ngOnDestroy(){this.subs.unsubscribe(),this.schoolService.resetSelectedTitleAndClass()}}return a.\u0275fac=function(n){return new(n||a)(e.\u0275\u0275directiveInject(r.gz),e.\u0275\u0275directiveInject(I.t),e.\u0275\u0275directiveInject(s.q),e.\u0275\u0275directiveInject(o.E),e.\u0275\u0275directiveInject(c.e),e.\u0275\u0275directiveInject(m.e),e.\u0275\u0275directiveInject(M.uw),e.\u0275\u0275directiveInject(D.YI),e.\u0275\u0275directiveInject(T._),e.\u0275\u0275directiveInject(_.r),e.\u0275\u0275directiveInject(P.sK))},a.\u0275cmp=e.\u0275\u0275defineComponent({type:a,selectors:[["ms-my-file-detail"]],decls:1,vars:1,consts:[["class","p-grid",4,"ngIf"],[1,"p-grid"],[1,"p-col-12"]],template:function(n,u){1&n&&e.\u0275\u0275template(0,U,2,0,"div",0),2&n&&e.\u0275\u0275property("ngIf",!u.jobFullScreen)},dependencies:[d.O5]}),a})(),canActivate:[t(25360).n],data:{permission:"my_file.show_perm"}}];let E=(()=>{class a{}return a.\u0275fac=function(n){return new(n||a)},a.\u0275mod=e.\u0275\u0275defineNgModule({type:a}),a.\u0275inj=e.\u0275\u0275defineInjector({imports:[r.Bz.forChild(A),r.Bz]}),a})();var N=t(93730),$=t(37204),B=t(88796),G=t(30160);let F=(()=>{class a{}return a.\u0275fac=function(n){return new(n||a)},a.\u0275mod=e.\u0275\u0275defineNgModule({type:a}),a.\u0275inj=e.\u0275\u0275defineInjector({imports:[d.ez,E,N.m,$.d,B.A0,G.ii.forRoot()]}),a})()},9035:(O,C,t)=>{t.d(C,{_:()=>h});var d=t(13125),r=t(24850),g=t(591),p=t(94650),v=t(18497);let h=(()=>{class e{constructor(s){this.apollo=s,this.isSaved=new g.X(!1),this.isChanged=new g.X(!1)}setDataCertificationStatus(s){this.isSaved.next(s)}getDataCertificationStatus(){return this.isSaved.value}setDataCertificationChanged(s){this.isChanged.next(s)}getDataCertificationChanged(){return this.isChanged.value}getCertificationRule(s,o){return this.apollo.query({query:d.ZP`
        query GetOneCertificationRule{
          GetOneCertificationRule(rncp_id: "${s}", class_id: "${o}") {
            _id
            title
            message
            documents {
              s3_file_name
              document_name
              file_path
              document_id {
                _id
              }
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,r.U)(c=>c.data.GetOneCertificationRule))}getCertificationRuleSent(s,o){return this.apollo.query({query:d.ZP`
        query {
          GetOneCertificationRuleSent(rncp_id: "${s}", class_id: "${o}") {
            _id
            title
            message
            documents {
              s3_file_name
              document_name
              file_path
              document_id {
                _id
              }
            }
            students_accepted {
              student_id {
                _id
              }
              acceptance_date {
                date_utc
                time_utc
              }
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,r.U)(c=>c.data.GetOneCertificationRuleSent))}getCertificationRuleSentWithStudent(s,o,c){return this.apollo.query({query:d.ZP`
        query {
          GetOneCertificationRuleSent(rncp_id: "${s}", class_id: "${o}", user_id: "${c}") {
            _id
            title
            message
            documents {
              s3_file_name
              document_name
              file_path
              document_id {
                _id
              }
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,r.U)(m=>m.data.GetOneCertificationRuleSent))}getAllCertificationRule(){return this.apollo.query({query:d.ZP`
        query {
          GetAllCertificationRule() {
            _id
            title
            message
            documents {
              file_name
              file_path
            }
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,r.U)(s=>s.data.GetOneCertificationRule))}createCertificationRuleSent(s){return this.apollo.mutate({mutation:d.ZP`
        mutation SentCertificationRule($dataInput: CertificationRuleSentInput) {
          SentCertificationRule(certification_rule_sent_input: $dataInput) {
            _id
          }
        }
      `,variables:{dataInput:s}}).pipe((0,r.U)(o=>o.data.SentCertificationRule))}downloadDocumentAsZipFile(s,o){return this.apollo.mutate({mutation:d.ZP`
      mutation {
        DownloadDocumentAsZipFile (rncpId: "${s}", classId: "${o}") {
          pathName
        }
      }
      `}).pipe((0,r.U)(c=>c.data.DownloadDocumentAsZipFile))}studentAcceptCertificationRule(s,o,c){return this.apollo.mutate({mutation:d.ZP`
        mutation {
          StudentAcceptanceCertificationRule(rncp_id: "${s}", class_id: "${o}", user_id: "${c}") {
            _id
            students_accepted {
              student_id {
                _id
              }
              acceptance_date {
                date_utc
                time_utc
              }
            }
          }
        }
      `}).pipe((0,r.U)(m=>m.data.StudentAcceptanceCertificationRule))}createCertificationRule(s){return this.apollo.mutate({mutation:d.ZP`
        mutation CreateCertificationRule($dataInput: CertificationRuleInput) {
          CreateCertificationRule(certification_rule_input: $dataInput) {
            _id
          }
        }
      `,variables:{dataInput:s}}).pipe((0,r.U)(o=>o.data.CreateCertificationRule))}updateCertificationRule(s,o){return this.apollo.mutate({mutation:d.ZP`
        mutation UpdateCertificationRule($id: ID!, $dataInput: CertificationRuleInput) {
          UpdateCertificationRule(_id: $id, certification_rule_input: $dataInput) {
            _id
          }
        }
      `,variables:{id:s,dataInput:o}}).pipe((0,r.U)(c=>c.data.UpdateCertificationRule))}}return e.\u0275fac=function(s){return new(s||e)(p.\u0275\u0275inject(v._M))},e.\u0275prov=p.\u0275\u0275defineInjectable({token:e,factory:e.\u0275fac,providedIn:"root"}),e})()}}]);